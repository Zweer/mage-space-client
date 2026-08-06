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
| `characters.md` | Character search/CRUD | ✅ Verified |
| `actions.md` | Action hash discovery mechanism | ✅ Verified |

## Key Discoveries

1. **Endpoint is `/explore`** — not `/creations` (for generation)
2. **`generationMode: "unlimited"`** — required for Pro Plus/Max tier
3. **Session cookie required** — created via `createUserSession` from ID token
4. **Action hashes change per deploy** — discovered via `createServerReference` in JS bundles
5. **Status is `"success"`** — not `"completed"` as initially assumed

## Verified End-to-End Flow

```
1. Refresh Token → ID Token (Firebase REST API)
2. ID Token → Session Cookie (createUserSession action)
3. Submit generation (runArchitecture on /explore)
4. Poll (getHistoryById every 5s)
5. Result: CDN image URL
```

Tested and working as of 2026-08-06.
