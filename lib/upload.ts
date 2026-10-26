/**
 * Signed-URL image upload for characters and references.
 *
 * mage.space replaced the old base64 Server Actions (`uploadCharacterImage` /
 * `uploadReferenceImage`, both removed) with a Google Cloud Storage signed-URL
 * flow. See `docs/api/upload.md` for the full reverse-engineered description.
 *
 * The flow:
 * 1. Decode the `data:` URL into raw bytes + MIME `contentType`.
 * 2. Compute the lowercase hex SHA-256 of the bytes.
 * 3. Call `getEntityImageUploadUrl(uid, entityType, hash, contentType)` → a
 *    `{ signedUrl, publicUrl, headers }` descriptor.
 * 4. `PUT` the bytes to `signedUrl` with the returned `headers` verbatim (they
 *    are part of the GCS V4 signature; omitting any yields a 403).
 * 5. Return `publicUrl` — the `cdn3.mage.space/...` URL that
 *    `createCharacter`/`createReference` expect as `image_url`.
 */
import type { AuthManager } from './auth.js';
import { MageSpaceError } from './errors.js';
import type { HttpClient } from './http.js';
import { unwrapResult } from './rsc.js';

/** Which kind of entity the image belongs to (drives the storage path). */
export type UploadEntityType = 'character' | 'reference';

/** Parsed response of the `getEntityImageUploadUrl` Server Action. */
interface UploadUrlDescriptor {
  /** Pre-signed GCS `PUT` URL (short-lived, ~15 min). */
  signedUrl: string;
  /** Permanent CDN URL the entity should reference as `image_url`. */
  publicUrl: string;
  /** Headers that MUST accompany the `PUT` (they are part of the signature). */
  headers?: Record<string, string>;
  /** ISO timestamp at which `signedUrl` expires. */
  expiresAt?: string;
}

/** The page the entity (character/reference) actions are served from. */
const ENTITY_PATH = '/explore';
/**
 * GCS returns 412 when `x-goog-if-generation-match: 0` fails — i.e. an object
 * with this content hash already exists. That is success for us (identical
 * bytes already live at `publicUrl`), so the PUT tolerates it, mirroring the
 * mage.space web client.
 */
const PRECONDITION_FAILED = 412;

/** `data:<mime>;base64,<data>` → `{ bytes, contentType }`. */
function decodeDataUrl(dataUrl: string): { bytes: Buffer; contentType: string } {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl);
  if (match === null) {
    throw new MageSpaceError('uploadImage expects a data URL like "data:image/jpeg;base64,...."');
  }
  const contentType = match[1] ?? 'application/octet-stream';
  const isBase64 = match[2] !== undefined;
  const payload = match[3] ?? '';
  const bytes = isBase64
    ? Buffer.from(payload, 'base64')
    : Buffer.from(decodeURIComponent(payload), 'utf8');
  return { bytes, contentType };
}

/** Lowercase hex SHA-256 of the bytes, matching the mage.space web client. */
async function sha256Hex(bytes: Buffer): Promise<string> {
  // Copy into a standalone ArrayBuffer so the digest input is exactly the bytes
  // (a Buffer may be a view onto a larger shared pool allocation).
  const view = new Uint8Array(bytes.byteLength);
  view.set(bytes);
  const digest = await crypto.subtle.digest('SHA-256', view);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Upload a base64 `data:` image for a character or reference and return its
 * permanent CDN URL (`publicUrl`).
 *
 * @param http - the active host's HTTP client (for the Server Action + PUT).
 * @param auth - supplies the uid and `__session` cookie.
 * @param dataUrl - `data:image/jpeg;base64,...` (JPEG preferred; PNG/WebP ok).
 * @param entityType - `"character"` or `"reference"`.
 */
export async function uploadEntityImage(
  http: HttpClient,
  auth: AuthManager,
  dataUrl: string,
  entityType: UploadEntityType,
): Promise<string> {
  const { bytes, contentType } = decodeDataUrl(dataUrl);
  const [uid, session, hash] = await Promise.all([
    auth.getUserId(),
    auth.getSession(),
    sha256Hex(bytes),
  ]);

  const { data } = await http.callAction<UploadUrlDescriptor>({
    action: 'getEntityImageUploadUrl',
    path: ENTITY_PATH,
    args: [uid, entityType, hash, contentType],
    session,
  });
  const descriptor = unwrapResult<UploadUrlDescriptor>(data);
  if (descriptor?.signedUrl === undefined || descriptor.publicUrl === undefined) {
    throw new MageSpaceError('getEntityImageUploadUrl did not return a signedUrl/publicUrl');
  }

  const putRes = await http.fetch(descriptor.signedUrl, {
    method: 'PUT',
    headers: descriptor.headers ?? { 'content-type': contentType },
    body: bytes,
  });

  // 412 = object already exists (content-addressed, identical bytes) → success.
  if (!putRes.ok && putRes.status !== PRECONDITION_FAILED) {
    throw new MageSpaceError(`Image upload PUT failed: HTTP ${putRes.status} ${putRes.statusText}`);
  }

  return descriptor.publicUrl;
}
