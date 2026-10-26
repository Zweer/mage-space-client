# Characters API

## Overview

Characters are trained identities (face/body) that can be referenced in generation prompts using `@username` syntax. The API supports full CRUD plus voice generation.

## Authentication

- **Read operations** (`getMentionSuggestionsParallel`, `getCharactersPaginated`): pass `uid` in the body, no auth token needed
- **Write operations** (`createCharacter`, `updateCharacter`, `deleteCharacter`): require `__session` cookie (server reads uid from session)

---

## Search Characters (`getMentionSuggestionsParallel`)

**Action Hash:** `7f1553e5f697d614a2982a5400edae73c4ef672ece`

### Request Body

```json
[{
  "query": "echoes",
  "uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
  "limit": 10,
  "includePublicReferences": false,
  "referenceModalities": ["image", "audio"]
}]
```

### Parameters

| Field | Type | Description |
|-------|------|-------------|
| `query` | string | Search text (matches character name) |
| `uid` | string | User ID to search characters for |
| `limit` | number | Max results (e.g., 10) |
| `includePublicReferences` | boolean | Include public refs in results |
| `referenceModalities` | string[] | Types of references: `"image"`, `"audio"` |

### Response (RSC → parsed)

```json
{
  "characters": [
    {
      "id": "34664e1f-954c-4630-98bd-8215616286e2",
      "uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
      "name": "echoes-cri",
      "username": "echoescri-c6hj",
      "image_url": "https://cdn3.mage.space/characters/r7gvVxS5NCeTiajvYiRRsNO0hiW2/image/6d818625e44e6035c444eca3cc03c9fe.jpg",
      "audio_url": null,
      "modality": "image",
      "description": null,
      "tags": ["realistic", "female"],
      "visibility": "private",
      "moderation": [],
      "num_plays_all_time": 425,
      "num_plays_monthly": 425,
      "num_plays_daily": 1,
      "num_plays_hourly": 0,
      "num_plays_quarter_hourly": 0,
      "created_at": "$D2026-07-14T14:45:52.116Z",
      "is_deleted": false,
      "is_featured": false,
      "variant": "character"
    }
  ],
  "references": [],
  "moodboards": []
}
```

### Character Object Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique character ID |
| `uid` | string | Owner's user ID |
| `name` | string | Display name |
| `username` | string | Unique @-mention handle (auto-generated: name + random suffix) |
| `image_url` | string | CDN URL of character reference image |
| `audio_url` | string/null | CDN URL of character voice (null if no voice) |
| `modality` | string | `"image"` or `"audio"` |
| `description` | string/null | Optional description |
| `tags` | string[] | Tags like `"realistic"`, `"female"`, `"anime"`, etc. |
| `visibility` | string | `"private"` or `"public"` |
| `moderation` | string[] | Moderation flags (empty if clean) |
| `num_plays_all_time` | number | Total generation count using this character |
| `created_at` | string | ISO date (RSC format: `"$D2026-..."`) |
| `is_deleted` | boolean | Soft delete flag |
| `is_featured` | boolean | Staff-featured flag |
| `variant` | string | Always `"character"` |

---

## Create Character (`createCharacter`)

> **Discovery re-check — 2026-10-26 (deploy `dpl_5GCsewvKe5dygHMc6sVMECG7Brad`).**
> `createCharacter` is **NOT renamed, NOT removed, and NOT migrated to a
> multi-step flow.** It is still a single Server Action named `createCharacter`,
> posted to `/explore`, taking one positional argument: an array with a single
> character object (`[{ name, username, image_url, ... }]`). Only its hash
> changed with the deploy. The function name, argument shape, and RSC response
> envelope are unchanged from what this section already documents.
>
> **Old vs new (name unchanged, hash rotated):**
>
> | | Seed (2026-08-24, `dpl_2w2igPYTRJKeDaX6iAUMbGwDEWZC`) | Current (2026-10-26, `dpl_5GCsewvKe5dygHMc6sVMECG7Brad`) |
> |---|---|---|
> | Function name | `createCharacter` | `createCharacter` (same) |
> | Hash | `401ceece486398904b9ba48daa7fc0ac951fb72168` | `40fd9c8ce5ca6cba0e21e28849a54b502020ddc20b` |
> | Path | `/explore` | `/explore` (same) |
> | Body | `[{ character object }]` | `[{ character object }]` (same) |
> | Response | RSC → created character with `id` | same |
>
> **Where the hash lives now.** The current `createServerReference(...)` call
> for `createCharacter` is in chunk `467-6d4f47f39712bb8b.js` (also duplicated in
> `7372-*.js`, `18404.*.js`, `77527-*.js`). **All four of these chunks are
> directly referenced in the raw HTML of `/explore`, `/creations`, `/characters`,
> AND `/references`** — so every discovery page reaches it. Replaying the client's
> exact pipeline (`CHUNK_RE` over the page HTML → `scrapeChunks` →
> `CREATE_SERVER_REF_RE`) against the live site finds `createCharacter` with the
> current hash on all four pages. **Verified** ✅ on the wire: an authenticated
> `POST /explore` with `next-action: 40fd9c8...` and body `[{}]` returns
> `HTTP 500` + `1:E{"digest":"..."}` (server-side validation rejects the empty
> input before persistence) — i.e. the action is live and accepts a single
> object argument. No test character was created.
>
> **Diagnosis of the portal's `DiscoveryError: Action "createCharacter" not found
> after discovery`.** This is NOT a mage.space-side change — the action is fully
> discoverable from the current bundles. `ActionRegistry.getHash` only throws
> `not found` when the name is absent from **both** the seed/cache **and** a live
> discovery pass. A merely stale hash does not trigger it (the seed in this repo
> still carries a `createCharacter` hash). So the portal hits this only if, in its
> runtime, (a) its seed snapshot lacks `createCharacter`, and (b) its live
> discovery returns nothing for it. Given the action is present in HTML-referenced
> chunks of all discovery pages, the likely culprits are portal-environment issues
> — a reduced `discoveryPaths`, a subrequest-capped `scrapeChunks` batch that never
> reaches `467-*.js`, or a discovery fetch that is blocked/short-circuited — not a
> change to `createCharacter` itself. The correct fix is to refresh the seed to the
> current deploy and/or ensure the portal's discovery actually scrapes the chunks,
> not to rename/re-wire the action.
>
> **Companion hashes rotated by the same deploy** (all names unchanged; only
> `getEntityImageUploadUrl` kept its hash):
>
> | Action | Seed hash | Current hash |
> |---|---|---|
> | `createUserSession` | `60b45776be93d57b1f43deaf8d6f9a837c6b9c169b` | `60ae31ddafa2a69fd79229a4eb09856137e4e384cb` |
> | `updateCharacter` | `6057ae8c4ae8868e3a4b045845814b0689ac61a1e0` | `60a7ce901122ee6d8ea8d17a49c4d9cc527a5c17db` |
> | `deleteCharacter` | `4071b6010bffdf242150e0322cd0966463268414d8` | `4036d7c2a245bfafc14969e62da5c45c6a00aa8b2e` |
> | `getCharacter` | `40ce38eb438c78fa51ee09be911ba0c3b02d7cbcad` | `4064f97d55bb11f3cc81ab1bebcf0977003987c2b4` |
> | `getCharacters` | `40c74f795b040ec3d0841360b532eb938932fc4bc3` | `4023daa6fa1fc49e6c8019270678275814d3b08df5` |
> | `getCharactersPaginated` | `709855baaecec89ad7b73ca44621fe93dfd93fcdee` | `70f24bd334ce2d4c887a0644a8683b8b490ed9317a` |
> | `publishCharacter` | `40b489876c75c1cd836a108742da4753fb2f671565` | `406a27d8231b67cfb14448fdc56cb6d614b5b84d03` |
> | `unpublishCharacter` | `40c785b54f5c25bd50cfaebc6817f9d0b9f5e6e145` | `403a03eb917ee8dd43bd5c243d902e0161ef008ebf` |
> | `followCharacter` | `403b46c309f4239df7579c00654881afd855fc1757` | `4064ff82ea68e7fe36f32b5e7322ecc1c8aeceb2e5` |
> | `unfollowCharacter` | `400dd84b2d0f2f582df6c72092ea5249678b68d4d5` | `408c1211750f158fa3713824dccee35822a80492ad` |
> | `generateCharacterVoice` | `60b54e75a5c3de2b0e4df7ebec5cf6ef1aaeb2ed35` | `6049f6938effbafebd277035342be3200d8f4de4e3` |
> | `getMentionSuggestionsParallel` | `7fe1156be29ed3824514220877818246e7649234fa` | `7f531e87796edfd728e6ee827b3a171ee29b8cd6fa` |
> | `createReference` | `403a057e1bd8967b3bb728df1722019d14ca7c4e14` | `40ae1753c005934498d26dd3a500e75b43e5559d48` |
> | `getEntityImageUploadUrl` | `781afde0255a669e470017f5a4174f4bef8a1b5a5a` | `781afde0255a669e470017f5a4174f4bef8a1b5a5a` (unchanged) |
>
> New character-related actions present in this deploy that the client does not
> yet model: `createCharacterStories`, `getCharacterStoryFeedParallel`,
> `getCharacterStoryAnalyticsParallel`, `recordCharacterStoryViewParallel`,
> `getCharactersParallel`, `getFilteredEntityIds`. None replace `createCharacter`.

**Action Hash:** `40fd9c8ce5ca6cba0e21e28849a54b502020ddc20b` _(2026-10-26 deploy; was `4012fee65f53db4fbe9d83808da2869751fe503a87` / seed `401ceece...`)_
**Chunk:** `467-6d4f47f39712bb8b.js` _(2026-10-26; previously `7547-ebaf1440bf2bf014.js`)_

### Request Body

```json
[{
  "name": "my-character",
  "username": "mycharacter-xxxx",
  "image_url": "https://cdn3.mage.space/characters/{uid}/image/{hash}.jpg",
  "audio_url": null,
  "description": "Optional description",
  "tags": ["realistic", "female"],
  "visibility": "private",
  "moderation": []
}]
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Character display name |
| `username` | string | ❌ | Unique handle for @-mentions (auto-generated from name if omitted) |
| `image_url` | string | ✅ | URL of the uploaded reference image |
| `audio_url` | string/null | ❌ | Voice audio URL (null for no voice) |
| `description` | string/null | ❌ | Optional description |
| `tags` | string[] | ✅ | Category tags |
| `visibility` | string | ✅ | `"private"` or `"public"` |
| `moderation` | string[] | ✅ | Empty array `[]` for new characters |

### Response

Returns the created character object with `id` field:
```json
{
  "id": "00f0f09a-734a-4818-947c-8aa18467f9d5",
  "uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
  "name": "test-rev-eng",
  "username": "testreveng-qwer",
  "image_url": "https://cdn3.mage.space/characters/.../image.jpg",
  "audio_url": null,
  "modality": "image",
  "description": null,
  "tags": ["realistic"],
  "visibility": "private",
  "moderation": [],
  "num_plays_all_time": 0,
  ...
}
```

### Notes

- The `image_url` must be a valid CDN URL (either from an existing character or pre-uploaded via `getUserImageUploadUrl`)
- If the image fails moderation (`is_forbidden`), the request fails with a moderation error
- The `username` appears to be auto-generated by the frontend (name + 4-char suffix)
- **Username rules** (enforced server-side, returns opaque HTTP 500 on violation):
  - Min 1 char, **max 15 chars**
  - Must start with a lowercase letter
  - Only lowercase letters, digits, underscores, and dashes (`/^[a-z][a-z0-9_-]*$/`)
  - Cannot be only numbers
  - Must be globally unique (check via `checkSharedUsernameAvailable` before creating)
- The web UI generates usernames as: `name-XXXX` (name cleaned + dash + 4 random chars, truncated to 15)
- **Verified working** ✅ (2026-08-24)

---

## Update Character (`updateCharacter`)

**Action Hash:** `60dc4b95918a5fea7b2752bedebb38e0950e19a17e`
**Chunk:** `7547-ebaf1440bf2bf014.js`

### Request Body

```json
["<character_id>", {
  "name": "updated-name",
  "description": "New description",
  "tags": ["realistic", "female"],
  "visibility": "private",
  "audio_url": null
}]
```

### Parameters

First argument is the character ID, second is the update object:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Updated display name |
| `description` | string/null | Updated description (null to clear) |
| `tags` | string[] | Updated tags |
| `visibility` | string | `"private"` or `"public"` |
| `audio_url` | string/null | Voice audio URL (null to remove voice) |

### Notes

- Cannot update `image_url` or `username` (would need to create new character)
- Returns the full updated character object
- Analytics event `character_updated` is fired after success
- **Verified working** ✅ (2026-08-06)

---

## Delete Character (`deleteCharacter`)

**Action Hash:** `40656ebd70a3804b5c18740913c8b769d4c72e1298`
**Chunk:** `8109-7d4c61fea1a3ded1.js`

### Request Body

```json
["<character_id>"]
```

Single argument: the character UUID to delete.

### Notes

- Soft-deletes the character (sets `is_deleted: true`)
- Removed from recent characters list
- Cannot be undone via API
- Returns `"$undefined"` on success
- After deletion, `getCharacter` returns `null`
- **Verified working** ✅ (2026-08-06)

---

## Get Character (`getCharacter`)

**Action Hash:** `40b1e8e090a726985d8868f145865a3b5bde0803b1`

### Request Body

```json
["<character_id>"]
```

Returns full character object.

---

## Get Characters (batch) (`getCharacters`)

**Action Hash:** `402ea21b03340cd20f55ea8c15f56dbbc1ce957f51`

### Request Body

```json
[["<character_id_1>", "<character_id_2>", ...]]
```

Returns array of character objects.

---

## Get Characters Paginated (`getCharactersPaginated`)

**Action Hash:** `7085cf87746975cbec2868405a026e22b97a20cfb4`
**Chunk:** `8109-7d4c61fea1a3ded1.js`

### Request Body

```json
[100, 0, {"uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2"}]
```

| Arg | Type | Description |
|-----|------|-------------|
| 0 | number | Limit (max results per page) |
| 1 | number | Offset (for pagination) |
| 2 | object | Options/filters (see below) |

### Options Object

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Filter by user ID (returns only that user's characters) |
| `visibility` | string | Filter by visibility: `"private"` or `"public"` |
| `modality` | string | Filter by modality: `"image"` or `"audio"` |
| `featured` | boolean | If `true`, returns only featured characters |

When `uid` is omitted or options is `{}`, returns public/featured characters globally.

### Response (RSC → parsed)

```json
{
  "characters": [
    {
      "id": "761c92fc-628d-4943-9d2d-408ba512c138",
      "uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
      "name": "echoes-ele-2",
      "username": "echoesele2-x68s",
      "image_url": "https://cdn3.mage.space/characters/.../image.jpg",
      "audio_url": null,
      "modality": "image",
      "description": null,
      "tags": ["realistic", "female"],
      "visibility": "private",
      "moderation": [],
      "num_plays_all_time": 51,
      "num_plays_monthly": 51,
      "num_plays_daily": 1,
      "num_plays_hourly": 0,
      "num_plays_quarter_hourly": 0,
      "created_at": "$D2026-07-14T14:45:52.116Z",
      "is_deleted": false,
      "is_featured": false,
      "variant": "character"
    }
  ],
  "hasMore": true
}
```

### Notes

- Returns `{ characters: [...], hasMore: boolean }`
- `hasMore` indicates if more results are available at the next offset
- Without `uid` filter, returns the public character feed (newest first)
- **Verified working** ✅ (2026-08-07)

---

## Publish / Unpublish Character

### Publish (`publishCharacter`)
**Action Hash:** `409a73d2187553e2e069493147969c46d7329a7c44`

### Unpublish (`unpublishCharacter`)
**Action Hash:** `40f009e2c220d4efc54b9f8968ab37e74cb66de982`

### Request Body (both)

```json
["<character_id>"]
```

---

## Generate Character Voice (`generateCharacterVoice`)

**Action Hash:** `6052462e345ee9878d5c36c2a160ea1873919c2b41`
**Chunk:** `7547-ebaf1440bf2bf014.js`

### Request Body

```json
[{"imageUrl": "https://cdn3.mage.space/characters/.../image.jpg", "guidancePrompt": "warm and friendly female voice"}, "<firebase_id_token>"]
```

| Arg | Type | Description |
|-----|------|-------------|
| 0 | object | Generation parameters (see below) |
| 1 | string | Firebase ID token (authToken) |

### Parameters (Arg 0)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `imageUrl` | string | ✅ | CDN URL of the character's reference image |
| `guidancePrompt` | string | ❌ | Text describing the desired voice characteristics (can be empty `""`) |

### Response (success)

```json
{
  "ok": true,
  "data": {
    "audioUrl": "https://cdn3.mage.space/references/{uid}/audio/{hash}.mp3",
    "gemsCharged": 10
  }
}
```

### Response (error)

```json
{
  "ok": false,
  "error": {
    "code": "insufficient_gems",
    "required_gems": 10,
    "balance_gems": 0
  }
}
```

### Error Codes

| Code | Meaning |
|------|---------|
| `not_authenticated` | User is not signed in |
| `image_required` | Character must have an image before generating voice |
| `insufficient_gems` | Not enough gems (includes `required_gems` and `balance_gems`) |
| `generation_failed` | Server error — retry |

### Notes

- Costs gems (not included in unlimited tier)
- Uses `SEED_AUDIO` architecture with `seed-audio-1.0` model internally
- Output format: MP3, sample rate 24kHz, duration ~5s
- The resulting `audioUrl` can be used in `updateCharacter` or `createCharacter` as `audio_url`
- **Discovered from JS bundle** (2026-08-07)

---

## Image Upload Flow (for character creation)

> **Updated 2026-10-26.** mage.space removed the base64 Server Actions
> `uploadCharacterImage` / `uploadReferenceImage` and switched to a Google Cloud
> Storage **signed-URL** flow (`getEntityImageUploadUrl` → PUT → `publicUrl`).
> The full reverse-engineered description lives in
> [`upload.md`](./upload.md). The library's `client.characters.uploadImage(dataUrl)`
> and `client.references.uploadImage(dataUrl)` methods keep the same signature
> and return the `cdn3.mage.space/...` `image_url` to pass to `createCharacter` /
> `createReference`.

Before creating a character, the reference image must be uploaded:

1. (Browser only) resize/compress the image client-side (max 1816px, fixed 1024px, JPEG quality 1.0)
2. Convert to a data URL: `data:image/jpeg;base64,...`
3. SHA-256 the bytes, call `getEntityImageUploadUrl(uid, "character", hash, contentType)`
4. PUT the bytes to the returned `signedUrl` with the returned `headers`
5. Use the returned `publicUrl` as `image_url` in `createCharacter`

For references, step 3 uses `entityType: "reference"` (stored under the
`/references/` path). See [`upload.md`](./upload.md) for the exact request/response
shapes, the mandatory signed `headers`, and the 412 (already-exists) semantics.

### Removed actions

`uploadCharacterImage` (`60869f48fe83aa95969a6549f84023c9e115ee274f`) and
`uploadReferenceImage` (`606ba2b0eb79bd8f28c609706a89b52e0d9f517fa6`) no longer
exist on either host as of 2026-10-26.

---

## Using Characters in Generation

In the `architectureConfig.characters` array:

```json
{
  "id": "34664e1f-954c-4630-98bd-8215616286e2",
  "name": "echoes-cri",
  "username": "echoescri-c6hj",
  "image_url": "https://cdn3.mage.space/characters/.../image.jpg",
  "audio_url": "$undefined"
}
```

The prompt should mention the character using `@username`:
```
"Full body photo of @echoescri-c6hj walking through a park"
```

---

## Follow Character (`followCharacter`)

**Action Hash:** `402d9d8cf924262612f29b5ef3d1a6a97d3a0a9d7a`
**Chunk:** `8109-7d4c61fea1a3ded1.js`

### Request Body

```json
["<character_id>"]
```

Single argument: the character UUID to follow.

### Response

Returns `"$undefined"` on success.

### Notes

- Requires `__session` cookie (authenticated user)
- **Discovered from JS bundle** (2026-08-07)

---

## Unfollow Character (`unfollowCharacter`)

**Action Hash:** `40842140a2e9467f854870c6ad20e3dcf17bece652`
**Chunk:** `8109-7d4c61fea1a3ded1.js`

### Request Body

```json
["<character_id>"]
```

Single argument: the character UUID to unfollow.

### Response

Returns `"$undefined"` on success.

### Notes

- Requires `__session` cookie (authenticated user)
- **Discovered from JS bundle** (2026-08-07)
