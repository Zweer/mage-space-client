# Mage.space API (Reverse-Engineered)

*Documentation of Mage's internal API endpoints.*
*Status: Initial research from HAR + HTML — July 2026.*

---

## Architecture Overview

Mage.space is a **Next.js App Router** application deployed on **Vercel**, using:
- **Firebase Authentication** — user identity + session
- **Firebase App Check** — reCAPTCHA Enterprise (key: `6LfPg-AlAAAAALt2CoBe0j61XH510IyNstq6r9NZ`)
- **Next.js Server Actions** — all API calls go through `POST /creations` with `next-action` header
- **fal.ai** — actual GPU backend for image generation (evidenced by `cancel_id: "fc-..."` pattern)
- **PostHog** — analytics at `ph.mage.space`
- **Mantine UI** — frontend component library
- **Zustand** — state management (store: `g.xV`)

### Key Insight: NOT a REST API

Mage does **not** use a traditional REST API. All operations go through **Next.js Server Actions**:
- Single endpoint: `POST https://www.mage.space/creations`
- Differentiated by `next-action` header (hash of the server function)
- Body is a JSON array of arguments
- Response is RSC (React Server Component) wire format, not JSON

---

## Auth (VERIFIED ✅)

### Two Tokens in Play

1. **`__session` cookie** — Firebase Session Cookie (long-lived, ~24h)
   - Issuer: `https://session.firebase.google.com/magedotspace`
   - Domain: `.mage.space`
   - Used for: Next.js server-side auth (reading user state on page load)
   - Type: httpOnly cookie set by the server

2. **`authToken` in request body** — Firebase ID Token (short-lived, ~1h)
   - Issuer: `https://securetoken.google.com/magedotspace`
   - Used for: Generation requests (passed directly in the POST body!)
   - Type: Standard Firebase Auth JWT
   - Must be refreshed every hour via Firebase Auth SDK

### Firebase Project

- **Project ID:** `magedotspace`
- **reCAPTCHA Enterprise key:** `6LfPg-AlAAAAALt2CoBe0j61XH510IyNstq6r9NZ`
- **Auth provider:** Google Sign-In

### For Automation

The session cookie you extracted expires at Unix `1784314151` (~24h from issue).

For the `authToken` in generation requests, we need to either:
- A: Use Firebase REST API to exchange the session cookie for a fresh ID token
- B: Use the Firebase Auth REST API to sign in with email/password (if you set one up)
- C: Keep a Playwright session alive that refreshes the token automatically
- D: Use the session cookie as auth (test if the server accepts requests without `authToken` when `__session` is present)

**Best approach for MVP:** Test if we can call the Server Actions with just the `__session` cookie and `authToken` from the body. If the `authToken` expires, we may need to implement token refresh using the Firebase Auth REST API (`https://securetoken.googleapis.com/v1/token?key=<API_KEY>`).

---

## Server Actions (Verified)

All calls go to `POST https://www.mage.space/creations` with these headers:

```
Content-Type: text/plain;charset=UTF-8
Accept: text/x-component
next-action: <action_hash>
x-deployment-id: dpl_2zXya7H1EHrkFpGWeMQmuoQwhQ5N
```

### Action: Search Characters / References

**Action ID:** `7f7be604bcc59576fcfd8fba691651136920ed159e`  
**Function:** `getMentionSuggestionsParallel`

**Body:**
```json
[{"query": "bea", "uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2", "limit": 10, "includePublicReferences": false, "referenceModalities": ["image", "audio"]}]
```

**Response:** RSC format containing character objects:
```json
{
  "characters": [
    {
      "id": "8d61ea91-fe4a-46db-9203-040ab744bc7e",
      "uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
      "name": "echoes-bea",
      "username": "echoesbea-4xvx",
      "image_url": "https://cdn3.mage.space/characters/r7gvVxS5NCeTiajvYiRRsNO0hiW2/image/...",
      "modality": "image",
      "tags": ["realistic", "female"],
      "visibility": "private",
      "variant": "character"
    }
  ],
  "references": [],
  "moodboards": []
}
```

---

### Action: Get History By ID (Poll Job Status)

**Action ID:** `4092d3a34e32eda82fbdb9175185ddbc58d7ced8cc`  
**Function:** `getHistoryById`

**Body:**
```json
["5e05a603-e7da-4855-86ba-bd94a46d71b4"]
```

**Response:** Job object with status:
```json
{
  "id": "5e05a603-e7da-4855-86ba-bd94a46d71b4",
  "uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
  "status": "running",
  "created_at": "2026-07-16T19:18:16.398Z",
  "updated_at": "2026-07-16T19:18:16.609Z",
  "cancel_id": "fc-01KXP5V1PV47CM7G6023CQQFF9",
  "error": null,
  "result": null,
  "concept_id": "5fc3641aee004def9407b9fdc4432c22",
  "architecture_config": {
    "seed": null,
    "prompt": "Full body photo of @echoesvale-bupk walking through...",
    "model_id": "mango-v3-pro",
    "fast_mode": false,
    "characters": [
      {
        "id": "5a44d8a8-ac83-4d90-baa6-f68b43034853",
        "name": "echoes-vale",
        "username": "echoesvale-bupk",
        "image_url": "https://cdn3.mage.space/characters/..."
      }
    ],
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

**Status values:** `"running"` → `"completed"` (with `result` field populated) or `"error"`

---

### Action: Create User Session

**Action ID:** Found in code as `createUserSession`  
**Purpose:** Syncs Firebase ID token to server-side session

---

### Other Known Actions

| Action ID | Function Name | Purpose |
|-----------|---------------|---------|
| `7fea8d7df0be0123b840ecab7ec3b25e4976dfbb70` | `getArticlesParallel` | Blog/update articles |
| `7f25b456cb5b6322859240eb08cb1e72fc5ba2e461` | `getCreationsPaginatedParallel` | User's saved creations |
| `7fdd86c6a8d19f96c438a0f198da710c692304e065` | `getConceptsParallel` | Model concepts/presets |
| `7f45a639cc6b3df5372027677f77a695bb2489364d` | `searchUsersParallel` | Search users |
| `7f4738656b30d5ab337e7f89de656746abffc50a7e` | `getLatestPublishedArticleCached` | Latest article |
| `7ff601f88eb5b50347d865f6918cf70928b98cec39` | `hasPurchasedGemsParallel` | Check gem purchases |
| `7f49a293f6e8cf0a0652a8aad2c5ee5331eaa2febf` | `syncStripeSubscriptionParallel` | Subscription sync |
| `7f10026db7f2a160554d1e44d0dc14afacc5668008` | `getEmbeddingParallel` | Text → embedding |
| `70fc946f93b35c6d47949bcaaf7d7c2260f1f5e472` | `processVideoFromUrl` | Video processing |

---

## Image Generation Flow (FULLY VERIFIED ✅)

```
1. POST /creations  (next-action: 4064b59dde14a4024ebbc0c23db23c798f5070b83b)
   → Submit generation job
   → Returns: { history_id: "uuid", architecture_config: "..." }

2. POST /creations  (next-action: 4092d3a34e32eda82fbdb9175185ddbc58d7ced8cc)  [POLL]
   → Body: ["<history_id>"]
   → Returns: { id, status: "running"|"completed", result, ... }
   → Poll every ~3-5 seconds until status != "running"

3. When completed → result contains image URL
   → Images at: https://cdn3.mage.space/temp/30d/creations/{uid}/image/{hash}.jpg
```

### Submit Generation (Action: `createGeneration`)

**Action ID:** `4064b59dde14a4024ebbc0c23db23c798f5070b83b`

**Headers:**
```
POST https://www.mage.space/creations
Content-Type: text/plain;charset=UTF-8
Accept: text/x-component
next-action: 4064b59dde14a4024ebbc0c23db23c798f5070b83b
x-deployment-id: dpl_2zXya7H1EHrkFpGWeMQmuoQwhQ5N
Cookie: __session=<firebase_session_jwt>
```

**Body (JSON array with single object):**
```json
[{
  "architectureConfig": {
    "seed": null,
    "prompt": "Full body photo of @echoesvale-bupk walking...\n",
    "model_id": "mango-v3-pro",
    "fast_mode": false,
    "resolution": "1K",
    "architecture": "mango",
    "aspect_ratio": "portrait",
    "image": "$undefined",
    "additional_images": [],
    "characters": [
      {
        "id": "5a44d8a8-ac83-4d90-baa6-f68b43034853",
        "name": "echoes-vale",
        "username": "echoesvale-bupk",
        "image_url": "https://cdn3.mage.space/characters/r7gvVxS5NCeTiajvYiRRsNO0hiW2/image/f499a96dcb542f07cd720b7258729169.jpg",
        "audio_url": "$undefined"
      }
    ],
    "references": [],
    "audio_references": [],
    "moodboard": "$undefined"
  },
  "architectureConfigToSave": "$0:0:architectureConfig",
  "authToken": "<firebase_id_token>",
  "conceptId": "5fc3641aee004def9407b9fdc4432c22",
  "activePowerPack": null
}]
```

**Response (RSC format):**
```
0:{"a":"$@1","f":"","b":"5ABay2GbpefMRmYqHcl7i"}
1:{"history_id":"e3357fb8-534f-4ab7-a8ee-5f48336a099b","architecture_config":"$T0:0:architectureConfig"}
```

### Key Auth Discovery ⚠️

**The `authToken` is passed IN THE REQUEST BODY, not via cookies!**

It's a standard Firebase ID token (JWT signed by Google):
- Issuer: `https://securetoken.google.com/magedotspace`
- Audience: `magedotspace`
- Firebase project: `magedotspace`
- Expiry: ~1 hour (needs refresh via Firebase SDK)

The `__session` cookie (that you extracted from the browser) is a **Firebase Session Cookie** — longer-lived, issued by `https://session.firebase.google.com/magedotspace`. This is separate from the short-lived ID token in the body.

### Poll Job Status (Action: `getHistoryById`)

**Action ID:** `4092d3a34e32eda82fbdb9175185ddbc58d7ced8cc`

**Body:**
```json
["e3357fb8-534f-4ab7-a8ee-5f48336a099b"]
```

**Response (running):**
```json
{
  "id": "e3357fb8-534f-4ab7-a8ee-5f48336a099b",
  "uid": "r7gvVxS5NCeTiajvYiRRsNO0hiW2",
  "status": "running",
  "cancel_id": "fc-01KXP6ET1WX4ND95B3TF3KTAQ8",
  "error": null,
  "result": null,
  "concept_id": "5fc3641aee004def9407b9fdc4432c22",
  "architecture_config": { ... },
  "architecture": "mango",
  "model_id": "mango-v3-pro",
  "credits": 0,
  "membership_tier": "pro_plus",
  "is_blocking": true,
  "is_deleted": false
}
```

**Response (completed):** Same structure but `status: "completed"` and `result` contains image URL.

### Generation Parameters (architecture_config)

```json
{
  "seed": null,
  "prompt": "Your prompt text with @character-username mentions",
  "model_id": "mango-v3-pro",
  "fast_mode": false,
  "resolution": "1K",
  "architecture": "mango",
  "aspect_ratio": "portrait",
  "image": "$undefined",
  "additional_images": [],
  "characters": [
    {
      "id": "uuid",
      "name": "character-name",
      "username": "character-username",
      "image_url": "https://cdn3.mage.space/characters/...",
      "audio_url": "$undefined"
    }
  ],
  "references": [],
  "audio_references": [],
  "moodboard": "$undefined"
}
```

### Available Architectures/Models (from code)

| Architecture | Model IDs | Type |
|---|---|---|
| `mango` | `mango-v3-pro` | Image (primary) |
| `blueberry` | ? | Image |
| `guava` | ? | Image |
| `peach` / `peachMax` | ? | Image |
| `kiwi` | ? | Image |
| `cherry` | ? | Image |
| `melon` | ? | Image |
| `raspberry` | ? | Image |
| `berry` | ? | Image |
| `nanoBananaV2` | ? | Image |
| `grokImage` | ? | Image |
| `gptImage2` | ? | Image (GPT) |
| `veo3` / `veo31` | ? | Video |
| `seedanceLite` / `seedancePro` | ? | Video |
| `klingV16Standard` / `klingV16Pro` / `klingV21Master` | ? | Video |
| `hailuoStandard` / `hailuoPro` | ? | Video |
| `grokVideo` | ? | Video |
| `seedAudio` | ? | Audio |

### Aspect Ratios

From UI: `portrait` (4:5), and others selectable from dropdown.

### Resolution

`"1K"` observed. Others likely available.

---

## Your Characters (Private)

| Name | Username | ID | Image |
|------|----------|---|-------|
| echoes-vale | `echoesvale-bupk` | `5a44d8a8-ac83-4d90-baa6-f68b43034853` | `cdn3.mage.space/characters/.../f499a96d...jpg` |
| echoes-bea | `echoesbea-4xvx` | `8d61ea91-fe4a-46db-9203-040ab744bc7e` | `cdn3.mage.space/characters/.../386252a2...jpg` |

---

## Queue System (Client-Side! ✅ Your intuition was correct)

The queue is **entirely client-side** (Zustand store). Key observations:

```javascript
// From the code:
- genQueue: [] — array of pending generations
- runningJobs: [] — currently executing jobs
- isGenQueueProcessing: boolean — whether queue processor is active
- maxGenQueueSize — max queue items (depends on tier)
- maxPowerPackActiveJobs — concurrent jobs (4 for single-tab, 1 for multi-tab)
- maxGemActiveJobs — concurrent gem-based jobs

// Queue processor logic (simplified):
if (!paused && queue.length > 0 && !processing && runningJobs < maxJobs) {
  pop item from queue
  call ra.T(item)  // submit to server
  poll for completion
}
```

**Confirmed:** The client manages a queue and submits one job at a time (or up to `maxPowerPackActiveJobs` concurrently for Pro Plus). When a job finishes, it pops the next from the queue.

For `pro_plus` tier: up to 10 items in queue, 4 concurrent jobs in single-tab mode.

---

## CDN

- **Images**: `https://cdn3.mage.space/characters/{uid}/image/{hash}.jpg`
- **Resize**: `https://resize.mage.space/` (preconnect in HTML)

---

## TODO (Next Steps)

- [x] ~~Capture the actual generation submission~~ — DONE: action `4064b59dde14a4024ebbc0c23db23c798f5070b83b`
- [x] ~~Find the submit action ID~~ — DONE
- [x] ~~Cookie extraction~~ — DONE: `__session` cookie extracted
- [ ] **Capture completed response** — Need to see what `result` looks like when `status: "completed"` (HAR only showed "running" — the recording stopped before completion, but we see the images loaded from CDN)
- [ ] **Test with curl** — Try calling the Server Actions directly with `__session` cookie + `authToken`
- [ ] **Token refresh** — Find Firebase Web API key to exchange refresh token for new ID token
- [ ] **Character management** — Can we create/update characters via API?
- [ ] **Rate limits** — What happens if we submit too fast?
- [ ] **Session expiry** — `__session` expires at `exp: 1784314151` (test when it dies)
- [ ] **Build TypeScript client** — Once curl tests pass

---

## Feasibility Assessment

### Can we automate this? 🟢 YES — very likely!

**What we know works:**
1. ✅ Submit action takes `authToken` in the body (not magic browser-only auth)
2. ✅ All requests are simple POST with JSON body
3. ✅ No browser fingerprinting or App Check enforcement on API calls (App Check is for login only)
4. ✅ Cookie `__session` + body `authToken` is all we need

**Remaining risks:**
1. ⚠️ `authToken` (Firebase ID token) expires every hour — need refresh mechanism
2. ⚠️ `next-action` hashes may change on deploy — but they're stable for a given deployment
3. ⚠️ `__session` cookie expires in ~24h — need periodic re-extraction or refresh

**MVP Implementation Plan:**
1. Store `__session` cookie and `authToken` (or refresh token) in env
2. Call submit action with `fetch()` 
3. Poll `getHistoryById` until completed
4. Download image from CDN URL in `result`
5. For token refresh: use Firebase Auth REST API with the refresh token

---

## Prior Art

- No known TypeScript/Python clients for Mage.space
- Company: **Ollano, Inc.** (New York)
- Tech: Next.js (Vercel) + Firebase + fal.ai backend
