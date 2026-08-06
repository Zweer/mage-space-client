# Generation API

## Overview

Image/video generation uses a submit-poll pattern:
1. Submit a job via `runArchitecture` → get `history_id`
2. Poll `getHistoryById` until status is `"completed"` or `"error"`
3. Download result from CDN URL

## Authentication

Generation requires:
1. **`__session` cookie** — Firebase Session Cookie (obtained via `createUserSession`)
2. **`authToken` in request body** — Firebase ID Token (same one used to create the session)

**Endpoint:** `POST https://www.mage.space/explore` (NOT `/creations`!)

```
POST https://www.mage.space/explore
accept: text/x-component
content-type: text/plain;charset=UTF-8
next-action: 402c09c1b4694e5bb273a949a41a2f36ca82eff394
x-deployment-id: dpl_GLUqzVNVADQR5wogKksDvu1m3BdH
cookie: __session=<session_cookie>
origin: https://www.mage.space
referer: https://www.mage.space/explore
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ...
```

## Submit Generation (`runArchitecture`)

**Action Hash:** `402c09c1b4694e5bb273a949a41a2f36ca82eff394`
**Function:** `runArchitecture`
**Chunk:** `4809-e5f839e46af4989c.js`

### Request Body

```json
[{
  "architectureConfig": {
    "seed": null,
    "prompt": "Full body photo of @echoescri-c6hj walking through a park",
    "model_id": "mango-v3-pro",
    "fast_mode": false,
    "resolution": "1K",
    "architecture": "mango",
    "aspect_ratio": "portrait",
    "image": "$undefined",
    "additional_images": [],
    "characters": [
      {
        "id": "34664e1f-954c-4630-98bd-8215616286e2",
        "name": "echoes-cri",
        "username": "echoescri-c6hj",
        "image_url": "https://cdn3.mage.space/characters/r7gvVxS5NCeTiajvYiRRsNO0hiW2/image/6d818625e44e6035c444eca3cc03c9fe.jpg",
        "audio_url": "$undefined"
      }
    ],
    "references": [],
    "audio_references": [],
    "moodboard": "$undefined"
  },
  "architectureConfigToSave": "$0:0:architectureConfig",
  "authToken": "<firebase_id_token>",
  "conceptId": "0cd8c7ed2e554d0f98f20c8cf8c0f7c",
  "activePowerPack": null,
  "generationMode": "unlimited"
}]
```

**IMPORTANT:** `generationMode` must match the user's subscription tier:
- `"unlimited"` — Pro Plus / Max (unlimited slow generations)
- `"play"` — Free tier (limited, may return `error_code: 400`)
- `"gems"` — Gem-based (costs gems)

### Parameters Detail

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `architectureConfig` | object | ✅ | Generation parameters (see below) |
| `architectureConfigToSave` | string | ✅ | Always `"$0:0:architectureConfig"` (RSC reference) |
| `authToken` | string | ✅ | Firebase ID token (1h expiry, refresh via REST API) |
| `conceptId` | string | ✅ | Model/concept ID (from URL or getConceptById) |
| `activePowerPack` | null/object | ✅ | Power pack info if using one, null otherwise |
| `generationMode` | string | ✅ | `"unlimited"` for Pro Plus/Max, `"play"` for free, `"gems"` for gem-based |

### Architecture Config

| Field | Type | Description |
|-------|------|-------------|
| `seed` | null/number | Random seed (null = random) |
| `prompt` | string | Text prompt with @character-username mentions |
| `model_id` | string | Model identifier (e.g., `"mango-v3-pro"`) |
| `fast_mode` | boolean | Use fast generation (costs gems) |
| `resolution` | string | `"1K"`, `"2K"`, `"4K"` |
| `architecture` | string | Architecture name (e.g., `"mango"`, `"berry"`, `"plum"`) |
| `aspect_ratio` | string | `"portrait"`, `"landscape"`, `"square"` |
| `image` | string/null | Reference image URL or `"$undefined"` |
| `additional_images` | array | Additional reference images |
| `characters` | array | Characters to include (see below) |
| `references` | array | Image references |
| `audio_references` | array | Audio references |
| `moodboard` | string/null | Moodboard ID or `"$undefined"` |

### Character Object (in architectureConfig)

```json
{
  "id": "34664e1f-954c-4630-98bd-8215616286e2",
  "name": "echoes-cri",
  "username": "echoescri-c6hj",
  "image_url": "https://cdn3.mage.space/characters/.../image.jpg",
  "audio_url": "$undefined"
}
```

### Response (RSC format)

```
0:{"a":"$@1","f":"","b":"5ABay2GbpefMRmYqHcl7i"}
1:{"history_id":"e3357fb8-534f-4ab7-a8ee-5f48336a099b","architecture_config":"$T0:0:architectureConfig"}
```

**Success:** returns `{ history_id: "uuid" }`

**Error:** returns `{ error_code: number, ... }`

| Error Code | Meaning |
|------------|---------|
| 401 | Authentication failed (token expired/invalid) |
| 403 | User is banned |
| 4031 | Prompt blocked (content moderation) |

---

## Poll Job Status (`getHistoryById`)

**Action Hash:** `40b894a9a39b33b79d4eb046e4beeed7b30b21a887`
**Function:** `getHistoryById`

### Request Body

```json
["e3357fb8-534f-4ab7-a8ee-5f48336a099b"]
```

Single argument: the `history_id` returned by `runArchitecture`.

### Response (running)

```json
{
  "id": "e3357fb8-534f-4ab7-a8ee-5f48336a099b",
  "uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
  "status": "running",
  "created_at": "2026-07-16T19:18:16.398Z",
  "updated_at": "2026-07-16T19:18:16.609Z",
  "cancel_id": "fc-01KXP6ET1WX4ND95B3TF3KTAQ8",
  "error": null,
  "result": null,
  "concept_id": "5fc3641aee004def9407b9fdc4432c22",
  "architecture_config": {
    "seed": null,
    "prompt": "...",
    "model_id": "mango-v3-pro",
    "fast_mode": false,
    "characters": [...],
    "references": [],
    "resolution": "1K",
    "architecture": "mango",
    "aspect_ratio": "portrait",
    "audio_references": [],
    "additional_images": []
  },
  "architecture": "mango",
  "model_id": "mango-v3-pro",
  "credits": 0,
  "membership_tier": "pro_plus",
  "is_blocking": true,
  "is_deleted": false
}
```

### Status Values

| Status | Meaning |
|--------|---------|
| `"running"` | Job is in progress, keep polling |
| `"success"` | Job finished, `result` contains output |
| `"error"` | Job failed, `error` contains details |

**NOTE:** The status is `"success"` (not `"completed"` as initially documented).

### Response (completed)

When `status: "completed"`, the `result` field contains the output URL(s):
- Images: `https://cdn3.mage.space/temp/30d/creations/{uid}/image/{hash}.jpg`
- Videos: similar CDN pattern

### Polling Strategy

Poll every 3-5 seconds until `status !== "running"`.

---

## Cancel Job (`cancelArchitectureJob`)

**Action Hash:** `40e4b91be4f6698821f96021adaf305a74b32af2a1`

### Request Body

```json
["<history_id>"]
```

---

## Available Models (from announcements + code)

### Image Models (no gems required for slow mode)

| Architecture | Model ID | Notes |
|---|---|---|
| `mango` | `mango-v3-pro` | Primary image model, best quality |
| `mango` | `mango-v3` | Standard quality |
| `mango` | `mango-v2` | Previous generation |
| `berry` | `berry-2` | Also does video at 480p |
| `blueberry` | ? | Image |
| `guava` | ? | Image |
| `peach` | ? | Image |
| `kiwi` | ? | Image |
| `cherry` | ? | Image |
| `melon` | ? | Image |
| `raspberry` | ? | Image |

### Video Models

| Architecture | Model ID | Notes |
|---|---|---|
| `plum` | ? | New (Aug 2026), characters+references+voice, up to 5s/768p |
| `berry` | `berry-2` | Video at 480p, unlimited for Pro |
| `veo3` / `veo31` | ? | Video |
| `seedanceLite` / `seedancePro` | ? | Video |
| `klingV16Standard` / `klingV16Pro` / `klingV21Master` | ? | Video |
| `hailuoStandard` / `hailuoPro` | ? | Video |

### Resolution Options

- `"1K"` — Standard (default)
- `"2K"` — Higher (may cost gems)
- `"4K"` — Highest (costs gems)

### Aspect Ratios

- `"portrait"` — 4:5
- `"landscape"` — 5:4
- `"square"` — 1:1

---

## Token Refresh

The `authToken` expires every hour. Refresh via Firebase REST API:

```
POST https://securetoken.googleapis.com/v1/token?key=AIzaSyAzUV2NNUOlLTL04jwmUw9oLhjteuv6Qr4
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=<MAGE_REFRESH_TOKEN>
```

Response:
```json
{
  "id_token": "<new_id_token>",
  "refresh_token": "<new_refresh_token>",
  "user_id": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
  "expires_in": "3600"
}
```

Use the `id_token` as `authToken` in generation requests.

---

---

## Generation History (`getHistoryPaginated`)

**Action Hash:** `787d245f6320977164c554a189a4d5b80c18ca3347`

### Request Body

```json
["r7gvVxS5NCeTiajvYiRRsNO0hiW2", 10, 0, {"status": "success", "type": "$undefined"}]
```

| Arg | Type | Description |
|-----|------|-------------|
| 0 | string | User ID |
| 1 | number | Limit (max results) |
| 2 | number | Offset (pagination) |
| 3 | object | Filters: `status` = `"success"`, `type` = `"$undefined"` for all |

### Response

```json
{
  "histories": [
    {
      "id": "f65dc9bf-...",
      "status": "success",
      "model_id": "mango-v3-pro",
      "architecture": "mango",
      "result": { "data": { "image": "https://cdn3.mage.space/..." } },
      "architecture_config": { "prompt": "...", ... }
    }
  ],
  "hasMore": true
}
```

**Verified working** ✅ (2026-08-06)

---

## Multiple Reference Images

Mango supports up to **10 reference images**. Use `image` for the first and `additional_images` for the rest:

```json
{
  "architectureConfig": {
    "image": "https://cdn3.mage.space/.../first.jpg",
    "additional_images": [
      "https://cdn3.mage.space/.../second.jpg",
      "https://cdn3.mage.space/.../third.jpg"
    ],
    ...
  }
}
```

### Max Images by Architecture

| Architecture | Max Images | Notes |
|---|---|---|
| `mango` | 10 | |
| `cherry` | 8 | |
| `melon` | 7 | `firstFrameKey: "first_image"` |
| `raspberry` | 5 | `firstFrameKey: "first_image"` |
| `berry` (video) | 9 | `firstFrameKey: "first_image"` |
| `plum` (video) | 9 | `firstFrameKey: "first_image"` |
| `guava` | 3 | |
| `gpt_image_2` | 15 | |
| `nano_banana_v2` | 14 | |

---

## TODO

- [x] ~~Capture a completed response to see exact `result` format~~ — Done
- [x] ~~Document video-specific parameters~~ — Done (Berry-2)
- [x] ~~Document reference image upload flow~~ — Done (`uploadReferenceImage`)
- [ ] Test which models don't require gems in slow mode
- [ ] Document plum video parameters (requires Max tier)

---

## Video Generation (Berry-2)

Video generation uses the same `runArchitecture` action but with different architecture config.

**Key differences from image generation:**
- `duration` is a **string** (e.g., `"3"`, `"5"`, `"7"`) not a number!
- Uses `berry_aspect_ratio` instead of `aspect_ratio`
- No `moodboard` field
- `resolution` is video-specific: `"480p"`, `"720p"`

### Berry-2 Request Body (480p, unlimited for Pro Plus)

```json
[{
  "architectureConfig": {
    "seed": null,
    "prompt": "A cat walking on a sunny sidewalk\n",
    "model_id": "berry-2",
    "fast_mode": false,
    "resolution": "480p",
    "architecture": "berry",
    "berry_aspect_ratio": "9:16",
    "duration": "3",
    "image": "$undefined",
    "additional_images": [],
    "characters": [],
    "references": [],
    "audio_references": []
  },
  "architectureConfigToSave": "$0:0:architectureConfig",
  "authToken": "<firebase_id_token>",
  "conceptId": "0b1fa74f7347406392422d24f2885684",
  "activePowerPack": null,
  "generationMode": "unlimited"
}]
```

### Video Parameters

| Field | Type | Values |
|-------|------|--------|
| `duration` | string | `"3"`, `"4"`, `"5"`, `"6"`, `"8"`, `"10"`, `"16"` |
| `berry_aspect_ratio` | string | `"16:9"`, `"9:16"`, `"1:1"`, `"4:3"`, `"3:4"` |
| `resolution` | string | `"480p"` (unlimited Pro Plus), `"720p"` (default) |
| `image` | string | CDN URL for first frame, or `"$undefined"` for text-only |

### Video with Character + First Frame

```json
{
  "architectureConfig": {
    "seed": null,
    "prompt": "@echoescri-c6hj walking toward camera\n",
    "model_id": "berry-2",
    "fast_mode": false,
    "resolution": "480p",
    "architecture": "berry",
    "berry_aspect_ratio": "9:16",
    "duration": "3",
    "image": "https://cdn3.mage.space/temp/30d/creations/.../image.jpg",
    "additional_images": [],
    "characters": [{
      "id": "34664e1f-954c-4630-98bd-8215616286e2",
      "name": "echoes-cri",
      "username": "echoescri-c6hj",
      "image_url": "https://cdn3.mage.space/characters/.../image.jpg",
      "audio_url": "$undefined"
    }],
    "references": [],
    "audio_references": []
  },
  "architectureConfigToSave": "$0:0:architectureConfig",
  "authToken": "<token>",
  "conceptId": "0b1fa74f7347406392422d24f2885684",
  "activePowerPack": null,
  "generationMode": "unlimited"
}
```

### Berry-2 Duration Limits by Tier

| Tier | Max Duration (480p) |
|------|-------------------|
| Pro | 3s |
| Pro Plus | 7s |
| Max | 9s |

### Other Video Models

| Model | Tier Required | Notes |
|-------|--------------|-------|
| Plum | Max only | Error 4267 for Pro Plus |
| Berry-2 720p | Gems | Higher resolution costs gems |
| Kiwi | Retired? | Returns RSC error |
