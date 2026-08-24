/**
 * Reference asset management.
 *
 * References are reusable image/audio assets (generic references, objects,
 * outfits, poses) applied across generations — distinct from characters, which
 * are trained identities. Covers upload, create, update, and listing (own +
 * public feed) per `docs/api/references.md`.
 */
import type { AuthManager } from './auth.js';
import { MageSpaceError, requireConfirm } from './errors.js';
import type { HttpClient } from './http.js';
import type {
  ConfirmOptions,
  CreateReferenceInput,
  ListReferencesOptions,
  Modality,
  Reference,
  ReferencePage,
  UpdateReferenceInput,
} from './types.js';

/** Server-enforced username constraints (shared with characters, module 64428). */
const USERNAME_MAX = 15;
const USERNAME_RE = /^[a-z][a-z0-9_-]*$/;

/** Generate a username from a display name (same logic as characters). */
function generateUsername(name: string): string {
  const suffix = Math.random().toString(36).substring(2, 6);
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const maxBase = USERNAME_MAX - suffix.length - 1;
  const trimmedBase = base.slice(0, maxBase).replace(/[-_]+$/, '');
  return `${trimmedBase}-${suffix}`;
}

function validateUsername(username: string): void {
  if (username.length > USERNAME_MAX) {
    throw new MageSpaceError(
      `Username "${username}" is too long (${username.length} chars, max ${USERNAME_MAX})`,
    );
  }
  if (!USERNAME_RE.test(username)) {
    throw new MageSpaceError(
      `Username "${username}" is invalid: must start with a lowercase letter and contain only a-z, 0-9, _ or -`,
    );
  }
}

/** Reference actions are served from the `/explore` page. */
const REFERENCES_PATH = '/explore';
const DEFAULT_PAGE_LIMIT = 20;

export class ReferencesService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthManager,
  ) {}

  /**
   * Upload a reference image (base64 data URL) and return its CDN URL.
   *
   * @param dataUrl - `data:image/jpeg;base64,...` (JPEG preferred; PNG/WebP ok).
   */
  async uploadImage(dataUrl: string): Promise<string> {
    const [uid, session] = await Promise.all([this.auth.getUserId(), this.auth.getSession()]);
    const { data } = await this.http.callAction<string>({
      action: 'uploadReferenceImage',
      path: REFERENCES_PATH,
      args: [dataUrl, uid],
      session,
    });
    return data;
  }

  /** Create a reusable reference from an uploaded image/audio URL. */
  async create(input: CreateReferenceInput): Promise<Reference> {
    const username = input.username ?? generateUsername(input.name);
    validateUsername(username);
    const session = await this.auth.getSession();
    const body = {
      name: input.name,
      username,
      image_url: input.image_url,
      audio_url: input.audio_url ?? null,
      modality: input.modality ?? 'image',
      variant: input.variant ?? 'reference',
      description: input.description ?? null,
      tags: input.tags ?? [],
      visibility: input.visibility ?? 'private',
      moderation: input.moderation ?? [],
    };
    const { data } = await this.http.callAction<Reference>({
      action: 'createReference',
      path: REFERENCES_PATH,
      args: [body],
      session,
    });
    return data;
  }

  /** Update a reference's mutable fields (name, description, tags, visibility). */
  async update(id: string, patch: UpdateReferenceInput): Promise<Reference> {
    const session = await this.auth.getSession();
    const { data } = await this.http.callAction<Reference>({
      action: 'updateReference',
      path: REFERENCES_PATH,
      args: [id, patch],
      session,
    });
    return data;
  }

  /**
   * Permanently delete a reference (soft-delete). Irreversible — requires
   * `{ confirm: true }`.
   */
  async delete(id: string, opts?: ConfirmOptions): Promise<void> {
    requireConfirm('deleteReference', opts);
    const session = await this.auth.getSession();
    await this.http.callAction({
      action: 'deleteReference',
      path: REFERENCES_PATH,
      args: [id],
      session,
    });
  }

  /** List the caller's own references for a given modality (default `image`). */
  async list(modality: Modality = 'image'): Promise<Reference[]> {
    const [uid, session] = await Promise.all([this.auth.getUserId(), this.auth.getSession()]);
    const { data } = await this.http.callAction<Reference[]>({
      action: 'getReferences',
      path: REFERENCES_PATH,
      args: [uid, modality],
      session,
    });
    return data ?? [];
  }

  /**
   * Browse references with pagination.
   *
   * @remarks
   * Omit `uid` to browse the public/featured feed; pass it to page through a
   * single user's references.
   */
  async listPaginated(opts: ListReferencesOptions = {}): Promise<ReferencePage> {
    const session = await this.auth.getSession();
    const limit = opts.limit ?? DEFAULT_PAGE_LIMIT;
    const offset = opts.offset ?? 0;
    const filters: Record<string, unknown> = {
      visibility: opts.visibility ?? 'public',
      orderBy: opts.orderBy ?? 'top',
      featuredOnly: opts.featuredOnly ?? false,
      modality: opts.modality ?? 'image',
    };
    if (opts.uid !== undefined) {
      filters.uid = opts.uid;
    }
    const { data } = await this.http.callAction<ReferencePage>({
      action: 'getReferencesPaginated',
      path: REFERENCES_PATH,
      args: [limit, offset, filters],
      session,
    });
    return data;
  }
}
