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
| `history.md` | History listing, creations save/delete | ✅ Verified |
| `concepts.md` | Official concepts + community models | ✅ Verified |
| `actions.md` | Action hash discovery mechanism | ✅ Verified |

## Key Discoveries

1. **Endpoint is `/explore`** — not `/creations` (for generation)
2. **`generationMode: "unlimited"`** — required for Pro Plus/Max tier
3. **Session cookie required** — created via `createUserSession` from ID token
4. **Action hashes change per deploy** — discovered via `createServerReference` in JS bundles
5. **Status is `"success"`** — not `"completed"` as initially assumed
6. **`getCharactersPaginated`** — signature is `(limit, offset, options)`, NOT `(uid, limit, offset)`
7. **`getConceptsParallel`** — signature is `(filters, sortOrder, limit, offset)`
8. **`getReferencesPaginated`** — signature is `(limit, offset, options)` with `orderBy` sort

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

- **Deployment ID:** `dpl_GLUqzVNVADQR5wogKksDvu1m3BdH`
- **Last verified:** 2026-08-07
