# Concepts & Models API

## Overview

Concepts are the official generation presets (Mango, Flux, etc.) that map `model_id` + `architecture` + `conceptId`. Models are community-uploaded LoRAs and base models.

## Authentication

- **Read operations** (`getConceptsParallel`, `getModels`, `getConcept`): no auth needed

---

## Get Concepts (`getConceptsParallel`)

**Action Hash:** `7f5e2df471a0e32563e87aa70d5313c12de0eb474e`
**Chunk:** `app/layout-9c6813c016f4db1c.js`

Returns official model concepts/presets (the main generation models).

### Request Body

```json
[{"search": "", "status": "active"}, "top", 10, 0]
```

| Arg | Type | Description |
|-----|------|-------------|
| 0 | object | Filters (see below) |
| 1 | string | Sort order (see sort options) |
| 2 | number | Limit (max results) |
| 3 | number | Offset (pagination) |

### Filter Object (Arg 0)

| Field | Type | Description |
|-------|------|-------------|
| `search` | string | Search by concept name (empty for all) |
| `status` | string | `"active"` to get only active concepts |

### Sort Options (Arg 1)

| Value | Description |
|-------|-------------|
| `"hot"` | Currently trending |
| `"top"` | Most popular all-time |
| `"top-today"` | Most popular today |
| `"rising"` | Rising in popularity |
| `"favorites"` | Most favorited |
| `"newest"` | Most recently created |
| `"random"` | Random order |

### Response (RSC → parsed)

Returns a flat array of concept objects:

```json
[
  {
    "id": "e15e70f483fa4b2cb7bd43caeee2cad4",
    "uid": null,
    "name": "Mango 2",
    "config": null,
    "architecture_config": {
      "seed": null,
      "prompt": "",
      "model_id": "mango-v2",
      "fast_mode": false,
      "resolution": "2K",
      "architecture": "mango",
      "aspect_ratio": "portrait"
    },
    "image_url": "https://cdn3.mage.space/concepts/preview/.../image.jpg",
    "tags": ["mango", "model", "anime", "photorealism", "3d-art", "exclusive", "art", "featured", "edit", "info:references", "info:edit", "info:unlimited"],
    "description": "A brand new model that specializes in highly stylized artwork...",
    "status": "active",
    "popularity": 9,
    "created_at": "$D2025-12-09T00:45:28.278Z",
    "updated_at": "$D2025-12-09T00:45:28.278Z",
    "model_id": "mango-v2",
    "duration": 25.04,
    "num_plays_all_time": 5918664,
    "num_plays_monthly": 920817,
    "num_plays_daily": 33267,
    "num_plays_hourly": 1230,
    "num_plays_quarter_hourly": 349,
    "num_favorites": 1074,
    "num_users_online": 0,
    "creator": null
  }
]
```

### Concept Object Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Concept ID (use as `conceptId` in generation) |
| `uid` | string/null | Creator UID (null = official Mage model) |
| `name` | string | Display name |
| `config` | object/null | Legacy config (deprecated) |
| `architecture_config` | object | Default generation config for this model |
| `image_url` | string | Preview image URL |
| `tags` | string[] | Tags (see tag meanings below) |
| `description` | string | Human-readable description |
| `status` | string | `"active"` or `"inactive"` |
| `popularity` | number | Popularity score |
| `model_id` | string | Model identifier (use in `architectureConfig.model_id`) |
| `duration` | number | Average generation time in seconds |
| `num_plays_all_time` | number | Total generations |
| `num_favorites` | number | Number of users who favorited |
| `creator` | object/null | Creator info (null for official) |

### Tag Meanings

| Tag | Meaning |
|-----|---------|
| `"model"` | Base model (not a LoRA) |
| `"mango"` | Mango architecture |
| `"flux"` | Flux architecture |
| `"featured"` | Staff-featured |
| `"exclusive"` | Mage-exclusive model |
| `"info:references"` | Supports reference images |
| `"info:edit"` | Supports image editing |
| `"info:unlimited"` | Available in unlimited mode |
| `"photorealism"` | Good for photorealistic images |
| `"anime"` | Good for anime style |
| `"art"` | Good for artistic style |
| `"fast"` | Fast generation |

### Known Concept IDs (key models for generation)

| Concept ID | Name | model_id | architecture |
|------------|------|----------|--------------|
| `e15e70f483fa4b2cb7bd43caeee2cad4` | Mango 2 | `mango-v2` | `mango` |
| `5fc3641aee004def9407b9fdc4432c22` | Mango V3 Pro | `mango-v3-pro` | `mango` |
| `63b7af399a78b6d8a5ace0b81d5ee3c4` | Flux Schnell | `flux-schnell` | `flux` |
| `f26d1c2784d947099de8a11f9d825d85` | Flux Dev | `flux-dev` | `flux` |
| `0b1fa74f7347406392422d24f2885684` | Berry-2 (video) | `berry-2` | `berry` |

### Notes

- Returns a flat array (NOT `{ concepts: [...], hasMore }`)
- No pagination metadata — returns all matching concepts up to limit
- The `id` field is the `conceptId` to use in `runArchitecture`
- The `architecture_config` shows the default config for that model
- **Verified working** ✅ (2026-08-07)

---

## Get Concept (`getConcept`)

**Action Hash:** `407b70b19b11db2d9f75ebbf02589e6ac4a8b17a58`
**Chunk:** `4809-e5f839e46af4989c.js`

Get a single concept by ID.

### Request Body

```json
["<concept_id>"]
```

Single argument: the concept ID string.

### Response

Returns a single concept object (same schema as `getConceptsParallel` items).

### Notes

- **Discovered from JS bundle** (2026-08-07)
- TODO: Not tested live

---

## Get Model (`getModel`)

**Action Hash:** `403c5d7cd29cf1f5bf8b53ff6ba266a6bf947450ce`
**Chunk:** `4809-e5f839e46af4989c.js`

Get a single community model by ID.

### Request Body

```json
["<model_id>"]
```

Single argument: the model ID (hex hash for community models, slug for official).

### Notes

- Previously documented as `getConceptById` — actually named `getModel` in the bundle
- **Discovered from JS bundle** (2026-08-07)
- TODO: Not tested live

---

## Get Models (`getModels`)

**Action Hash:** `70e4e81957e5ee694c8278e43cacfa7e7e2db9633a`
**Chunk:** `2703-18e4ea83025a5359.js`

Returns community-uploaded models (LoRAs and base models).

### Request Body

```json
[{}]
```

Single argument: filter object (currently accepts any object; server returns all models regardless of filter content).

### Response (RSC → parsed)

Returns a flat array of model objects:

```json
[
  {
    "id": "plum",
    "uid": null,
    "name": "Plum",
    "image_url": "https://cdn3.mage.space/concepts/preview/.../image.jpg",
    "description": "State-of-the-art video model with native audio...",
    "tags": ["plum", "base", "video"],
    "metadata": {},
    "status": "active",
    "download_url": "https://huggingface.co/magespace/plum",
    "popularity": 0,
    "created_at": "$D2026-...",
    "num_plays_all_time": 3793157,
    "num_plays_monthly": 9227,
    "num_plays_daily": 238,
    "num_plays_hourly": 19,
    "num_plays_quarter_hourly": 19,
    "num_favorites": 2719,
    "num_users_online": 0,
    "creator": null
  }
]
```

### Model Object (differs from Concept)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Model ID (slug for official, hex hash for community) |
| `uid` | string/null | Uploader UID (null for official) |
| `name` | string | Display name |
| `image_url` | string | Preview image |
| `description` | string | Description |
| `tags` | string[] | `"base"`, `"lora"`, `"video"`, `"krea_2"`, etc. |
| `metadata` | object | Additional metadata |
| `status` | string | `"active"` |
| `download_url` | string/null | HuggingFace download URL |
| `popularity` | number | Popularity score |
| `num_plays_all_time` | number | Total uses |

### Model Tags

| Tag | Meaning |
|-----|---------|
| `"base"` | Base model (standalone) |
| `"lora"` | LoRA adapter (requires base) |
| `"video"` | Video generation model |
| `"krea_2"` | Compatible with Krea 2 architecture |
| `"sdxl"` | SDXL architecture |
| `"illustrious"` | Illustrious architecture |
| `"photorealism"` | Realistic style |
| `"anime"` | Anime style |
| `"exclusive"` | Mage-exclusive |

### Notes

- Returns a flat array (no pagination metadata)
- Passing `[10, 0]` (numeric args) returns empty — must pass object as first arg
- **Verified working** ✅ (2026-08-07)
