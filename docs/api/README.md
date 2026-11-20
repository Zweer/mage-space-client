# Mage.space API Documentation

Reverse-engineered API reference produced by the `rev-eng` agent via Playwright browser automation.

## Architecture

Mage.space is **NOT a REST API**. It uses Next.js Server Actions:
- Single endpoint: `POST https://www.mage.space/explore` (for generation)
- Differentiated by `next-action` header (hex hash of server function)
- Body: JSON array of arguments
- Response: RSC (React Server Component) wire format

## Files

| File | Area | Status |
|------|------|--------|
| `auth.md` | Firebase token refresh, session creation | ✅ Verified |
| `generation.md` | Submit job, poll status, get result | ✅ Verified |
| `characters.md` | Character search/CRUD/follow/voice | ✅ Verified |
| `references.md` | Reference CRUD, paginated listing | ✅ Verified |
| `upload.md` | Signed-URL image upload (characters/references) | ✅ Verified (2026-10-26) |
| `history.md` | History listing, creations save/delete | ✅ Verified |
| `concepts.md` | Official concepts + community models | ✅ Verified |
| `billing.md` | Credits/gems/subscription actions; removed power-pack actions | ✅ Verified (2026-10-26) |
| `actions.md` | Action hash discovery mechanism | ✅ Verified (re-checked 2026-11-20) |
| `models.md` | Model index, web-vs-API ids, ranking (details in `models/image.md`, `video.md`, `audio.md`, `nsfw.md`, `legacy-sd.md`) | ✅ New 2026-11-20 |
| `approaches.md` | Server Actions (this library) vs official REST API / SDK / MCP | ✅ New 2026-11-20 |
| `public-api.md` | Official REST API, MCP, SDKs (new) | 📄 Documented from official docs, not tested live |

## Key Discoveries

1. **Endpoint is `/explore`** — not `/creations` (for generation and character CRUD)
2. **`generationMode: "unlimited"`** — required for Pro Plus/Max tier
3. **Session cookie required** — created via `createUserSession` from ID token
4. **Action hashes change per deploy** — discovered via `createServerReference` in JS bundles
5. **Status is `"success"`** — not `"completed"` as initially assumed
6. **`getCharactersPaginated`** — signature is `(limit, offset, options)`, NOT `(uid, limit, offset)`
7. **`getConceptsParallel`** — signature is `(filters, sortOrder, limit, offset)`
8. **`getReferencesPaginated`** — signature is `(limit, offset, options)` with `orderBy` sort
9. **Username max 15 chars** — server returns opaque 500 if exceeded; must start with `a-z`, only `a-z0-9_-`
10. **`createCharacter` requires `/explore` path** — posting to `/creations` returns 500

## Verified End-to-End Flow

```
1. Refresh Token → ID Token (Firebase REST API)
2. ID Token → Session Cookie (createUserSession action)
3. Submit generation (runArchitecture on /explore)
4. Poll (getHistoryById every 5s)
5. Result: CDN image URL
```

Tested and working as of 2026-08-07.

## Current Deployment

- **Deployment ID:** `dpl_AbcS43rqLqmYqZwBpkqWiNKDB9Zc` (discovered 2026-11-20)
- **Last verified:** 2026-10-26
- **Previous:** `dpl_2w2igPYTRJKeDaX6iAUMbGwDEWZC` (2026-08-24)

On the 2026-10-26 deploy every action hash rotated (only `getEntityImageUploadUrl`
kept its value), `createCharacter` is unchanged in name/path/args, and the
power-pack/membership actions were removed (see [`billing.md`](./billing.md)).
`lib/seed.ts` is refreshed to this deploy.

## Re-check 2026-11-20 (new site, deploy `dpl_AbcS43rqLqmYqZwBpkqWiNKDB9Zc`)

mage.space was relaunched with a new landing page (`/` is now a marketing/generator hub; `/models`, `/developers`, `/membership`, `/magejutsu`, `/apps/*`, `llms.txt` are new). **The Server-Actions backend is unchanged in kind**: same `POST /explore|/creations|/characters` + `next-action` mechanism, same Firebase auth, same RSC format, and discovery still works (158 actions found; static chunks now live under `/_next/static/immutable/chunks/`, already handled by lib 1.4.3).

| Area | Result (live, with this client) |
|---|---|
| Auth (refresh → id token → `createUserSession`) | ✅ |
| Discovery (`discoverActions`) | ✅ 158 actions, all 24 `REQUIRED_ACTIONS` present; 81 of 85 seeded hashes rotated |
| Image generation + poll (`runArchitecture`, `getHistoryById`) | ✅ default model (`mango-v3-pro`) and `mango-v4` both succeed (~150 s each at 1K) |
| Upload, references CRUD, character CRUD/publish/follow, creations save/delete, history delete, cancel | ✅ (e2e suite) |
| `characters.getMany(ids)` → `getCharacters` | ❌ **HTTP 500**: `getCharacters` now takes `(uid: string)` and returns that user's characters; `getCharactersParallel` is the same. See [`characters.md`](./characters.md#2026-11-20-getcharacters-signature-change) |
| `getModels` | ❌ removed (see [`concepts.md`](./concepts.md)) |
| `getCreditBalance`, `getUserHydrationData({recentCharacterIds})`, `getSessionUid` | ✅ |
| `getSubscriptionPlayUsage`, `getCreditsPaginated` | ❌ absent from the live action set (`getCreditsPaginated` was documented as new on 2026-10-26; it is not in this deploy's hashes) |
| Video generation | ⏭ not re-run (costs gems); only the concept list was checked |

New action families (not modelled by the client): social posts/feed (`createPost`, `getPostsFeedParallel`, `likePost`, `bookmarkPost`, `hidePost`, ...), chat (`createChat`, `sendChatMessage`, `searchChatGifs`), notifications, user follow/block/mute, character stories (`createCharacterStories`, `getCharacterStoryFeed`, ...), `getHistoriesByIds`, `getHistoryModelStats`, `getConcepts`, `getProfile`, `getSessionUid`, `sampleAutoCreationPromptVariation`, `getCharacterByUsername`, `getReferenceByUsername`, `verifyUnlimitedPresence`, `sendFeedback`. Removed: `getModels`, `getSubscriptionPlayUsage`, `saveContentSettings`, `deleteUser`. New products: Magejutsu video recast, Sidekick agent, MCP/REST API. See [`public-api.md`](./public-api.md) and [`models.md`](./models.md).

Note: `test/e2e/full.test.ts` must not run alongside `.worktrees/*` copies of itself (the default `vitest run` glob picks both): running two e2e suites on one account produced `Generation error (code 429)` (concurrency limit) and cascading 500s. Use `--exclude '.worktrees/**'`.
