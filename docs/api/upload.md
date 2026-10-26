# Image Upload (signed-URL flow)

Reverse-engineered and verified end-to-end against `https://www.mage.space`
(and discovery-confirmed on `https://beta.mage.space`) on 2026-10-26 using a
real authenticated session.

## TL;DR — what changed

mage.space **removed** the old base64 server actions and switched to a
Google Cloud Storage **signed-URL** (PUT) upload flow.

| | OLD (gone) | NEW (current) |
|---|---|---|
| Character image | `uploadCharacterImage(dataUrl, uid)` → returns CDN URL | `getEntityImageUploadUrl(uid, "character", hash, contentType)` → PUT bytes → `publicUrl` |
| Reference image | `uploadReferenceImage(dataUrl, uid)` → returns CDN URL | `getEntityImageUploadUrl(uid, "reference", hash, contentType)` → PUT bytes → `publicUrl` |

`uploadCharacterImage` and `uploadReferenceImage` return **zero** hits in the
current JS bundles on both production and beta — they no longer exist.

`createCharacter` / `createReference` are **unchanged**: they still take an
`image_url`, and `publicUrl` returned by the new flow is exactly the
`https://cdn3.mage.space/...` URL they expect. **No portal-side change is
required** beyond bumping the library version.

## New action inventory (upload-related)

Discovered via the library's `discoverActions` (160 actions total per host):

| Action | Production hash | Beta hash | Purpose |
|---|---|---|---|
| `getEntityImageUploadUrl` | `781afde0255a669e470017f5a4174f4bef8a1b5a5a` | `78db9a52f76112874fd0c84a1c1b4f00fe3cdea791` | Character/reference image upload URL |
| `getUserImageUploadUrl` | `708cb9e4a5c1e559767da1ee10973110a1b997dbf8` | `7047d436d3747c7f9a74bb79cacbe425e581a5c7b2` | Generic user image (e.g. generation input) |
| `getTempCreationImageUploadUrl` | `704627b40bb3e05fdef984855337faa291fdb33090` | `702794c9b873fec22948e825d15e755fd1743baffb` | Temp creation (30d) image |
| `getUserAudioUploadUrl` | `70c9e4f11fa8fc99bc5f13b27727c6a29200ea3ae1` | — | Audio upload URL |
| `getUserVideoUploadUrl` | `703f5253b382043661483db0e83014a84aac9f8bb0` | — | Video upload URL |
| `tempToPermanentFile` | `40ddebfc3fe8d6c65ef7befdce542ddee4f7dac487` | `409a81433b589e6f6d1ffb643ab21f353e603a28f3` | Promote a temp file to permanent |

> Hashes change on every Vercel deploy; they are captured here for reference
> only. The client resolves them dynamically via discovery (and the warm seed).

The relevant client-side wrapper lives in bundle `16441-*.js`, module `46623`
(`getEntityImageUploadUrl`) and the generic upload helper in module `65942`.

## The flow (what the mage.space web client does)

Deminified from modules `46623`, `71252`, `65942`, `2468`:

1. **Short-circuit** — if the input is already a `cdn3.mage.space/{characters|references}/{uid}/image/...`
   URL, return it unchanged (no re-upload).
2. **(Browser only)** resize/re-encode the image to JPEG (`fixedSize: 1024`,
   `maxSize: 1816`). The library skips this — it uploads the provided bytes
   as-is.
3. Convert the `data:` URL to bytes and read its MIME as `contentType`.
4. `hash = sha256_hex(bytes)`.
5. Call the server action `getEntityImageUploadUrl(uid, entityType, hash, contentType)`.
6. `PUT` the raw bytes to the returned `signedUrl` with the returned `headers`.
7. Return `publicUrl`.

### Server action: `getEntityImageUploadUrl`

- **Endpoint:** `POST https://www.mage.space/explore`
- **Args (positional):** `[uid, entityType, hash, contentType]`
  - `uid` — Firebase uid
  - `entityType` — `"character"` or `"reference"`
  - `hash` — lowercase hex SHA-256 of the image bytes
  - `contentType` — e.g. `"image/jpeg"`
- **Auth:** `__session` cookie
- **Response (RSC, parsed):**

```json
{
  "signedUrl": "https://storage.googleapis.com/mage-cdn/characters/{uid}/image/{hash}.jpg?X-Goog-Algorithm=...&X-Goog-Signature=...",
  "publicUrl": "https://cdn3.mage.space/characters/{uid}/image/{hash}.jpg",
  "headers": {
    "Content-Type": "image/jpeg",
    "x-goog-content-length-range": "0,52428800",
    "x-goog-if-generation-match": "0"
  },
  "expiresAt": "2026-10-26T16:04:02.999Z"
}
```

The GCS V4 signature signs these headers:
`content-type;host;x-goog-content-length-range;x-goog-if-generation-match`.
All three `headers` entries **must** be sent on the PUT verbatim, or GCS
returns `403 SignatureDoesNotMatch`.

### The PUT

```
PUT {signedUrl}
Content-Type: image/jpeg
x-goog-content-length-range: 0,52428800
x-goog-if-generation-match: 0
<raw image bytes>
```

- **200** — uploaded.
- **412** — object already exists (because `x-goog-if-generation-match: 0`
  means "only if not present"). This is **success** for our purposes: the same
  bytes (same SHA-256) already live at `publicUrl`. mage's own code tolerates
  412 (`if (412 !== r.status && !r.ok) throw`). The client treats 412 as OK and
  returns `publicUrl`.

## Verification (real, authenticated)

Against production with the Echoes refresh token:

- `getEntityImageUploadUrl` for `character` and `reference` both returned the
  shape above with the correct `characters/` vs `references/` path.
- PUT of a 160-byte test JPEG returned **200**; a `GET publicUrl` returned
  **200 / image/jpeg**.
- A second PUT of the same hash returned **412**, and `publicUrl` was still
  reachable — confirming the idempotency/412 semantics.
- No entity was created: `createCharacter`/`createReference` were never called,
  so there is nothing to clean up (only anonymous storage objects keyed by
  content hash were written).

## `www` vs `beta`

Both hosts expose `getEntityImageUploadUrl`, `getUserImageUploadUrl`,
`getTempCreationImageUploadUrl` and `tempToPermanentFile` (different hashes per
deploy). The upload flow is identical; only the action hashes differ, which the
client already resolves per-host via discovery.
