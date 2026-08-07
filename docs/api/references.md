# References API

## Overview

References are reusable image/audio assets (poses, outfits, objects) that can be applied across multiple generations. Unlike characters (which are trained identities), references are generic visual/audio elements.

## Authentication

- **Read operations** (`getReferences`, `getReferencesPaginated`): pass `uid` in the body or options, no auth token needed
- **Write operations** (`createReference`, `updateReference`): require `__session` cookie

---

## Get References (`getReferences`)

**Action Hash:** `60a0357a926bc3e4031c00e62ca815e3ea21b3eb35`
**Chunk:** `app/layout-9c6813c016f4db1c.js`

Returns all references for a given user ID, filtered by modality.

### Request Body

```json
["r7gvVxS5NCeTiajvYiRRsNO0hiW2", "image"]
```

| Arg | Type | Description |
|-----|------|-------------|
| 0 | string | User ID |
| 1 | string | Modality filter: `"image"` or `"audio"` |

### Response (RSC → parsed)

Returns a flat array of reference objects:

```json
[
  {
    "id": "74d2a1cb-189a-4e97-b213-e192bfb62e0f",
    "uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
    "name": "test-ref",
    "username": "testref-1234",
    "image_url": "https://cdn3.mage.space/references/.../image.jpg",
    "audio_url": null,
    "modality": "image",
    "description": null,
    "tags": [],
    "visibility": "private",
    "moderation": [],
    "num_plays_all_time": 0,
    "num_plays_monthly": 0,
    "num_plays_daily": 0,
    "num_plays_hourly": 0,
    "num_plays_quarter_hourly": 0,
    "created_at": "$D2026-08-06T...",
    "is_deleted": false,
    "is_featured": false,
    "variant": "reference"
  }
]
```

### Notes

- Returns only the authenticated user's own references
- Returns empty array `[]` if user has no references of that modality
- **Verified working** ✅ (2026-08-07)

---

## Get References Paginated (`getReferencesPaginated`)

**Action Hash:** `7069d599ab890e353b790d46df56160d5c0a85348a`
**Chunk:** `app/layout-9c6813c016f4db1c.js`

### Request Body

```json
[20, 0, {"visibility": "public", "orderBy": "top", "featuredOnly": true, "modality": "image"}]
```

| Arg | Type | Description |
|-----|------|-------------|
| 0 | number | Limit (max results per page) |
| 1 | number | Offset (for pagination) |
| 2 | object | Options/filters (see below) |

### Options Object

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Filter by user ID |
| `visibility` | string | `"private"` or `"public"` |
| `orderBy` | string | Sort order: `"trending"`, `"top"`, `"newest"`, `"oldest"` |
| `featuredOnly` | boolean | If `true`, returns only featured references |
| `modality` | string | Filter by modality: `"image"` or `"audio"` |

### Response (RSC → parsed)

```json
{
  "references": [
    {
      "id": "8ee96a00-b2e8-49bf-a252-927bf554ac30",
      "uid": "AlDaGmnO6EV4iaS7t0rgeXWN6wU2",
      "name": "sunflower dress",
      "username": "sunflower-dress",
      "image_url": "https://cdn3.mage.space/characters/.../image.jpg",
      "audio_url": null,
      "modality": "image",
      "description": null,
      "tags": [],
      "visibility": "public",
      "moderation": [],
      "num_plays_all_time": 1,
      "num_plays_monthly": 1,
      "num_plays_daily": 1,
      "num_plays_hourly": 0,
      "num_plays_quarter_hourly": 0,
      "created_at": "$D2026-08-06T09:05:45.046Z",
      "is_deleted": false,
      "is_featured": false,
      "variant": "object"
    }
  ],
  "hasMore": false
}
```

### Reference Variants

| Variant | Description |
|---------|-------------|
| `"reference"` | Generic image reference |
| `"object"` | Object/item reference |
| `"outfit"` | Clothing/outfit reference |
| `"pose"` | Pose/body position reference |

### Notes

- Returns `{ references: [...], hasMore: boolean }`
- Without `uid` filter, returns the public reference feed
- The `image_url` for some references may point to `/characters/` path (legacy)
- **Verified working** ✅ (2026-08-07)

---

## Create Reference (`createReference`)

**Action Hash:** `406d91cfd5589042bd72defa1071bc7c3fb84810c4`
**Chunk:** `4809-e5f839e46af4989c.js`

### Request Body

```json
[{
  "name": "my-reference",
  "username": "myreference-abcd",
  "image_url": "https://cdn3.mage.space/references/{uid}/image/{hash}.jpg",
  "audio_url": null,
  "modality": "image",
  "variant": "reference",
  "description": null,
  "tags": [],
  "visibility": "private",
  "moderation": []
}]
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Display name |
| `username` | string | ✅ | Unique handle (name + 4-char suffix) |
| `image_url` | string | ✅ for image | CDN URL from `uploadReferenceImage` |
| `audio_url` | string | ✅ for audio | CDN URL for audio reference |
| `modality` | string | ✅ | `"image"` or `"audio"` |
| `variant` | string | ✅ | `"reference"`, `"object"`, `"outfit"`, or `"pose"` |
| `description` | string/null | ❌ | Optional description |
| `tags` | string[] | ✅ | Category tags (can be empty) |
| `visibility` | string | ✅ | `"private"` or `"public"` |
| `moderation` | string[] | ✅ | Empty array `[]` |

### Response

Returns the created reference object with `id` field.

**Verified working** ✅ (2026-08-06)

---

## Update Reference (`updateReference`)

**Action Hash:** `602d6bb3ba2609661f07330224f6fd075e7af6bc9e`
**Chunk:** `4809-e5f839e46af4989c.js`

### Request Body

```json
["<reference_id>", {
  "name": "updated-name",
  "description": "New description",
  "tags": ["pose"],
  "visibility": "private"
}]
```

| Arg | Type | Description |
|-----|------|-------------|
| 0 | string | Reference UUID to update |
| 1 | object | Fields to update |

### Notes

- Similar to `updateCharacter` — first arg is ID, second is partial update object
- **Discovered from JS bundle** (2026-08-07)

---

## Upload Reference Image (`uploadReferenceImage`)

**Action Hash:** `606ba2b0eb79bd8f28c609706a89b52e0d9f517fa6`
**Chunk:** `4809-e5f839e46af4989c.js`

### Request Body

```json
["data:image/jpeg;base64,/9j/4AAQ...", "r7gvVxS5NCeTiajvYiRRsNO0hiW2"]
```

| Arg | Type | Description |
|-----|------|-------------|
| 0 | string | Data URL (base64-encoded JPEG/PNG/WebP) |
| 1 | string | User ID |

### Response

CDN URL string:
```
"https://cdn3.mage.space/references/{uid}/image/{hash}.jpg"
```

**Verified working** ✅ (2026-08-06)

---

## Using References in Generation

See [`generation.md` → Using References in Generation](./generation.md#using-references-in-generation) for the full documentation on how to pass references to `runArchitecture`.

Key points:
- References go in `architectureConfig.references[]` array
- Same object shape as characters: `{id, name, username, image_url, audio_url}`
- **NOT** mentioned with `@username` in the prompt (unlike characters)
- Verified working ✅ (2026-08-07)
