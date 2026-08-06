# Action Hash Discovery

## Overview

Mage.space uses Next.js Server Actions. Each action is identified by a hex hash that **changes on every Vercel deployment**. This document explains how to discover current hashes programmatically.

## Current Deployment

- **Deployment ID:** `dpl_GLUqzVNVADQR5wogKksDvu1m3BdH`
- **Discovered:** 2026-08-06

## Discovery Method

Action hashes are embedded in the JavaScript bundles as `createServerReference()` calls:

```javascript
(0, i.createServerReference)("402c09c1b4694e5bb273a949a41a2f36ca82eff394", i.callServer, void 0, i.findSourceMapURL, "runArchitecture")
```

### Algorithm

1. Fetch the page HTML (e.g., `GET /creations`)
2. Extract chunk URLs from `<script>` tags matching `_next/static/chunks/`
3. Fetch each chunk
4. Apply regex: `/createServerReference\)\("([0-9a-f]+)"[^"]*?"([^"]+)"\)/g`
5. First capture group = hash, second = function name

### Key Chunks (current deploy)

| Chunk | Contains |
|-------|----------|
| `app/layout-9c6813c016f4db1c.js` | Auth, user data, history, mentions, articles |
| `4809-e5f839e46af4989c.js` | **Generation submit** (`runArchitecture`) |
| `7547-ebaf1440bf2bf014.js` | Character create/update, voice generation |
| `8109-7d4c61fea1a3ded1.js` | Character management (delete, publish, paginate) |
| `app/creations/page-*.js` | History deletion, moodboards |
| `2703-18e4ea83025a5359.js` | Models, concepts, formulas |
| `8110-4a73cac11473d10c.js` | History pagination, save creation |

## Complete Action Registry (2026-08-06)

### Generation

| Hash | Function | Purpose |
|------|----------|---------|
| `402c09c1b4694e5bb273a949a41a2f36ca82eff394` | `runArchitecture` | **Submit generation job** |
| `40b894a9a39b33b79d4eb046e4beeed7b30b21a887` | `getHistoryById` | **Poll job status** |
| `40e4b91be4f6698821f96021adaf305a74b32af2a1` | `cancelArchitectureJob` | Cancel a running job |
| `00df2df4fe9964885b84297a0e1ea28162019ca4ab` | `cancelAllRunningArchitectureJobs` | Cancel all jobs |
| `6087f655eaef4de56a01fb6c6a84df58cea0632e5f` | `saveCreation` | Save to permanent storage |
| `40ce0c505af781b3109827b44734abbe5ec865dce3` | `tempToPermanentFile` | Convert temp file to permanent |
| `4025ac4aacf66f2937d9837f06da2558323d8b0136` | `createLink` | Create shareable link |

### Characters

| Hash | Function | Purpose |
|------|----------|---------|
| `4012fee65f53db4fbe9d83808da2869751fe503a87` | `createCharacter` | Create new character |
| `60dc4b95918a5fea7b2752bedebb38e0950e19a17e` | `updateCharacter` | Update existing character |
| `40656ebd70a3804b5c18740913c8b769d4c72e1298` | `deleteCharacter` | Delete a character |
| `40b1e8e090a726985d8868f145865a3b5bde0803b1` | `getCharacter` | Get single character |
| `402ea21b03340cd20f55ea8c15f56dbbc1ce957f51` | `getCharacters` | Get multiple characters |
| `7085cf87746975cbec2868405a026e22b97a20cfb4` | `getCharactersPaginated` | Paginated character list |
| `7f1553e5f697d614a2982a5400edae73c4ef672ece` | `getMentionSuggestionsParallel` | Search characters by name |
| `6052462e345ee9878d5c36c2a160ea1873919c2b41` | `generateCharacterVoice` | Generate character voice |
| `409a73d2187553e2e069493147969c46d7329a7c44` | `publishCharacter` | Make character public |
| `40f009e2c220d4efc54b9f8968ab37e74cb66de982` | `unpublishCharacter` | Make character private |
| `40165c463254d2465bb8a881d9bbf53da41c2403b5` | `getFilteredCharacterIds` | Get filtered character IDs |
| `40102241cad9104989dffa0497a5f63678202bff29` | `getCharacterFollowStatus` | Check follow status |
| `40842140a2e9467f854870c6ad20e3dcf17bece652` | `unfollowCharacter` | Unfollow a character |
| `402d9d8cf924262612f29b5ef3d1a6a97d3a0a9d7a` | `followCharacter` | Follow a character |

### References

| Hash | Function | Purpose |
|------|----------|---------|
| `406d91cfd5589042bd72defa1071bc7c3fb84810c4` | `createReference` | Create image/audio reference |
| `7069d599ab890e353b790d46df56160d5c0a85348a` | `getReferencesPaginated` | List references (paginated) |
| `60a0357a926bc3e4031c00e62ca815e3ea21b3eb35` | `getReferences` | Get references |
| `40c6e219b5afa74becbdcb37534e2af149cb00c2bb` | `getFilteredReferenceIds` | Filter references |
| `005f4b38a7593dd5f82f657304b217a6d6046b43b8` | `hasCreatedImageReference` | Check if ref exists |

### History & Creations

| Hash | Function | Purpose |
|------|----------|---------|
| `7f7f533eb9fc5a3fca55cb5e19d45532a27eb75f38` | `getCreationsPaginatedParallel` | List saved creations |
| `787d245f6320977164c554a189a4d5b80c18ca3347` | `getHistoryPaginated` | List generation history |
| `40e1f88b6813c101c03e136e4d5f5fadeb9909ee52` | `deleteHistory` | Delete history item |
| `407e9ce3d04c7274e3341bf8450633dc8e3935ec9c` | `deleteCreation` | Delete saved creation |
| `40b5a0907ac6ff9d61d713ea9a7f7c312d4bb7b87f` | `clearUserHistory` | Clear all history |

### Auth & User

| Hash | Function | Purpose |
|------|----------|---------|
| `60fa7da54d8662813645f7077455339d23096f391c` | `createUserSession` | Exchange ID token for session cookie |
| `0077c71a228d26498d446a89e60ec6d17199443f9e` | `deleteUserSession` | Logout |
| `40314a83b96c226af04a264d1e076a06dbf3cc73b2` | `getUserHydrationData` | Get user profile + settings |
| `7f4b811caaf8a356ca0a5a3eb09d673abda5659fdd` | `syncStripeSubscriptionParallel` | Sync subscription |
| `7f3b092f5da168d67342b9d8549b3f5490a3442304` | `hasPurchasedGemsParallel` | Check gem purchases |
| `409e4fd10b9bd008f84ff08c9f6fa7e697ac25f172` | `saveContentSettings` | Save content preferences |
| `40389516b492b36a67171264f732b226e5f6e73ac5` | `getSubscriptionPlayUsage` | Get usage stats |
| `4002f65a5c97b020a26fca280f52650c127c030961` | `deleteUser` | Delete account |

### Models & Concepts

| Hash | Function | Purpose |
|------|----------|---------|
| `403c5d7cd29cf1f5bf8b53ff6ba266a6bf947450ce` | `getConceptById` | Get model/concept info |
| `7f5e2df471a0e32563e87aa70d5313c12de0eb474e` | `getConceptsParallel` | List all concepts |
| `782d6df8b8cfa6e09d8c537d65d1f93e6a8a7ad4ea` | `getConcepts` | Get concepts |
| `70e4e81957e5ee694c8278e43cacfa7e7e2db9633a` | `getModels` | Get available models |
| `4053eeb6f40596715f95d87db35e51b0916328f416` | `getBaseConcept` | Get base concept |
| `405544f6caadefcf71aa860f2dcf942bbc71bba379` | `getLegacyAppConfig` | Legacy app configuration |

### Misc

| Hash | Function | Purpose |
|------|----------|---------|
| `7f9235630e90a7e807d77032cdc075bcc020ba95dd` | `getLatestPublishedArticleCached` | Latest news article |
| `7f78e689f66346e0de0e775d08c6e4e83ee46c7fc7` | `getArticlesParallel` | All articles |
| `7f9b8fc6046ab18e39103338074a829290aaabb63a` | `searchUsersParallel` | Search users |
| `7f14994b05aa2e3edee7e67165bc4905b6c3340b48` | `getEmbeddingParallel` | Text → embedding |
| `70c26c3bab49acc3488bc8e61931e51141d3f80bcd` | `processVideoFromUrl` | Video processing |
| `70f0a069eb99daec47836fd911347732d47515df99` | `getUserVideoUploadUrl` | Get video upload URL |
| `708619f9a5e99ca3afc8f412eb925bb7a2b96ca7ee` | `getUserImageUploadUrl` | Get image upload URL |
| `409ba4b556af9da341d137c87493ab2a2a9864a16c` | `segmentImage` | Image segmentation |
| `0093a9c52d5359852497d7cb3c054ec15f3c6c2097` | `getCreditBalanceBreakdown` | Credit balance |
| `405a845c907e8196367d6b97c9bbeae3631dc8df39` | `createAutoCreationCampaign` | Auto-creation campaign |
| `400101f7d8dc99932f96d863e93766a1bdfacf2e88` | `sampleAutoCreationPromptVariation` | Sample prompt variation |

## Deployment Detection

The `x-deployment-id` header in responses indicates the current deploy:
```
x-deployment-id: dpl_GLUqzVNVADQR5wogKksDvu1m3BdH
```

When this changes, all action hashes become stale and must be re-discovered.

## Hash Prefix Patterns

Observed prefixes and their meanings:
- `40` — Mutations / actions requiring auth
- `7f` — Parallel queries (can run concurrently, often read-only)
- `60` — Actions with side effects (session, uploads, edits)
- `70` — Resource operations (video processing, uploads)
- `00` — Utility/check operations
- `78` — Admin/moderation operations
