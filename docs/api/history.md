# History & Creations API

## Overview

History items are generation jobs (completed or running). Creations are permanently saved results. This document covers listing, saving, and deleting both.

## Authentication

- **Read operations** (`getHistoryPaginated`, `getCreationsPaginatedParallel`): require `__session` cookie
- **Write operations** (`deleteHistory`, `deleteCreation`, `saveCreation`, `clearUserHistory`): require `__session` cookie

---

## Get History Paginated (`getHistoryPaginated`)

**Action Hash:** `787d245f6320977164c554a189a4d5b80c18ca3347`
**Chunk:** `8110-4a73cac11473d10c.js`

### Request Body

```json
["r7gvVxS5NCeTiajvYiRRsNO0hiW2", 10, 0, {"status": "success", "type": "$undefined"}]
```

| Arg | Type | Description |
|-----|------|-------------|
| 0 | string | User ID |
| 1 | number | Limit (max results) |
| 2 | number | Offset (pagination) |
| 3 | object | Filters |

### Filter Object

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status: `"success"`, `"error"`, `"running"` |
| `type` | string | Filter by type: `"image"`, `"video"`, or `"$undefined"` for all |

### Response (RSC → parsed)

```json
{
  "histories": [
    {
      "id": "f65dc9bf-...",
      "uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
      "status": "success",
      "created_at": "2026-07-16T19:18:16.398Z",
      "updated_at": "2026-07-16T19:18:20.000Z",
      "cancel_id": "fc-01KXP6ET1WX4ND95B3TF3KTAQ8",
      "error": null,
      "result": {
        "data": {
          "seed": -1,
          "image": "https://cdn3.mage.space/temp/30d/creations/{uid}/image/{hash}.jpg",
          "width": 896,
          "height": 1152,
          "embedding": [...],
          "moderation": { "is_nsfw": false, "is_forbidden": false }
        },
        "type": "image",
        "duration": 285.4
      },
      "concept_id": "5fc3641aee004def9407b9fdc4432c22",
      "architecture_config": {
        "seed": null,
        "prompt": "...",
        "model_id": "mango-v3-pro",
        "fast_mode": false,
        "resolution": "1K",
        "architecture": "mango",
        "aspect_ratio": "portrait",
        "additional_images": []
      },
      "architecture": "mango",
      "model_id": "mango-v3-pro",
      "credits": 0,
      "membership_tier": "pro_plus",
      "is_blocking": true,
      "is_deleted": false
    }
  ],
  "hasMore": true
}
```

### Notes

- Returns `{ histories: [...], hasMore: boolean }`
- Results ordered by `created_at` descending (newest first)
- **Verified working** ✅ (2026-08-06)

---

## Get Creations Paginated (`getCreationsPaginatedParallel`)

**Action Hash:** `7f7f533eb9fc5a3fca55cb5e19d45532a27eb75f38`
**Chunk:** `app/layout-9c6813c016f4db1c.js`

Returns the user's permanently saved creations (as opposed to transient history).

### Request Body

```json
["r7gvVxS5NCeTiajvYiRRsNO0hiW2", 10, 0]
```

| Arg | Type | Description |
|-----|------|-------------|
| 0 | string | User ID |
| 1 | number | Limit (max results) |
| 2 | number | Offset (pagination) |

### Response (RSC → parsed)

```json
{
  "creations": [
    {
      "id": "3decc02e-f35e-4e30-a9f4-28dca3686461",
      "uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
      "url": "https://cdn3.mage.space/creations/{uid}/image/{hash}.jpg",
      "hash": "d76e0e3dbf3e16805caf7432d5b3f41a",
      "type": "image",
      "visibility": "private",
      "app_id": "383b5e6b648cc7949eb6b9cb2015c452",
      "concept_id": "5fc3641aee004def9407b9fdc4432c22",
      "concept_override": null,
      "architecture_config": {
        "seed": null,
        "prompt": "$3",
        "model_id": "mango-v3-pro",
        "fast_mode": false,
        "resolution": "1K",
        "architecture": "mango",
        "aspect_ratio": "portrait",
        "additional_images": []
      },
      "metadata": {
        "seed": -1,
        "width": 896,
        "height": 1152,
        "duration": 285.4,
        "moderation": { "is_nsfw": false, "concepts": {}, "is_forbidden": false }
      },
      "embedding": [0.014, 0.032, ...],
      "moderation": [],
      "created_at": "$D2026-07-14T14:47:07.915Z",
      "updated_at": "$D2026-07-14T14:47:07.915Z",
      "tags": []
    }
  ],
  "hasMore": true
}
```

### Creation Object Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique creation ID |
| `uid` | string | Owner's user ID |
| `url` | string | Permanent CDN URL (not temp/30d) |
| `hash` | string | Content hash (for deduplication) |
| `type` | string | `"image"` or `"video"` |
| `visibility` | string | `"private"` or `"public"` |
| `app_id` | string | Internal app identifier |
| `concept_id` | string | Model/concept used for generation |
| `concept_override` | string/null | Custom concept override |
| `architecture_config` | object | Generation parameters (prompt is RSC ref `"$N"`) |
| `metadata` | object | Output metadata (dimensions, duration, moderation) |
| `embedding` | number[] | Image embedding vector (for similarity search) |
| `moderation` | string[] | Moderation flags |
| `created_at` | string | ISO date (RSC format: `"$D2026-..."`) |
| `updated_at` | string | ISO date |
| `tags` | string[] | User-assigned tags |

### RSC Note on Prompts

Long prompts are stored as RSC text references (`"$3"`, `"$4"`, etc.) in separate lines:
```
3:T78a,<prompt text here>
```

The parser must resolve these `$N` references to get the actual prompt string.

### Notes

- Returns `{ creations: [...], hasMore: boolean }`
- The `url` field points to permanent storage (not `/temp/30d/`)
- `embedding` is a 128-dimensional float vector
- **Verified working** ✅ (2026-08-07)

---

## Save Creation (`saveCreation`)

**Action Hash:** `6087f655eaef4de56a01fb6c6a84df58cea0632e5f`
**Chunk:** `8110-4a73cac11473d10c.js`

Saves a generation result from history to permanent creations.

### Request Body

```json
["<history_result_object>"]
```

Single argument: the `result` object from a completed history item (the value of `history.result`).

The result object contains:
```json
{
  "data": {
    "seed": -1,
    "image": "https://cdn3.mage.space/temp/30d/creations/{uid}/image/{hash}.jpg",
    "width": 896,
    "height": 1152,
    "embedding": [...],
    "moderation": { "is_nsfw": false, "is_forbidden": false }
  },
  "type": "image",
  "duration": 285.4
}
```

### Response

Returns `"$undefined"` on success. The image is moved from `/temp/30d/` to permanent `/creations/` storage.

### Notes

- Moves the image from `/temp/30d/` to permanent `/creations/` storage
- The server also uses `tempToPermanentFile` internally
- **Verified working** ✅ (2026-08-07)

---

## Save Many Creations (`saveManyCreations`)

**Action Hash:** `40afc9b261a79f68202911ea0a3331eb7e086e0a5b`
**Chunk:** `4809-e5f839e46af4989c.js`

Batch version of `saveCreation`.

### Request Body

```json
[["<result_object_1>", "<result_object_2>", ...]]
```

Single argument: array of result objects.

### Notes

- ⚠️ **NOT tested live** — documented from JS bundle analysis only
- **Discovered from JS bundle** (2026-08-07)

---

## Delete History (`deleteHistory`)

**Action Hash:** `40e1f88b6813c101c03e136e4d5f5fadeb9909ee52`
**Chunk:** `app/layout-9c6813c016f4db1c.js`

### Request Body

```json
["<history_id>"]
```

Single argument: the history item UUID to delete.

### Response

Returns `"$undefined"` on success.

### Post-deletion behavior

After deletion, `getHistoryById` still returns the full history object but with `"is_deleted": true`. The item no longer appears in `getHistoryPaginated` results.

### Notes

- Soft-deletes the history item (sets `is_deleted: true`)
- Cannot be undone via API
- **Verified working** ✅ (2026-08-07)

---

## Delete Many Histories (`deleteManyHistories`)

**Action Hash:** `402a5bddb2a41165f2f64782b85b4915e63ec2a849`
**Chunk:** `4809-e5f839e46af4989c.js`

Batch version of `deleteHistory`.

### Request Body

```json
[["<history_id_1>", "<history_id_2>", ...]]
```

Single argument: array of history UUIDs.

### Notes

- ⚠️ **DESTRUCTIVE** — NOT tested live (rate limit 429 prevented creating enough test generations)
- Same response format as `deleteHistory` (`"$undefined"` on success)
- **Discovered from JS bundle** (2026-08-07)

---

## Delete Creation (`deleteCreation`)

**Action Hash:** `407e9ce3d04c7274e3341bf8450633dc8e3935ec9c`
**Chunk:** `8110-4a73cac11473d10c.js`

### Request Body

```json
["<creation_id>"]
```

Single argument: the creation UUID to delete.

### Response

Returns `"$undefined"` on success.

### Notes

- Permanently deletes the saved creation
- Cannot be undone via API
- **Verified working** ✅ (2026-08-07)

---

## Delete Many Creations (`deleteManyCreations`)

**Action Hash:** `403d071e9dc36382b3efff80470e6d76b3edd299b8`
**Chunk:** `4809-e5f839e46af4989c.js`

Batch version of `deleteCreation`.

### Request Body

```json
[["<creation_id_1>", "<creation_id_2>", ...]]
```

Single argument: array of creation UUIDs.

### Notes

- ⚠️ **DESTRUCTIVE** — NOT tested live
- **Discovered from JS bundle** (2026-08-07)

---

## Clear User History (`clearUserHistory`)

**Action Hash:** `40b5a0907ac6ff9d61d713ea9a7f7c312d4bb7b87f`
**Chunk:** `8110-4a73cac11473d10c.js`

Deletes ALL generation history for a user.

### Request Body

```json
["<user_id>"]
```

Single argument: the user's UID.

### Response

Returns `"$undefined"` on success. Frontend reloads the page after.

### Notes

- **Irreversible** — deletes all history items
- ⚠️ **DESTRUCTIVE** — NOT tested live, documented from JS bundle
- **Discovered from JS bundle** (2026-08-07)
