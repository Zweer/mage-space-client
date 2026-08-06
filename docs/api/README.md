# Mage.space API Documentation

Reverse-engineered API reference produced by the `rev-eng` agent via Playwright browser automation.

## Architecture

Mage.space is **NOT a REST API**. It uses Next.js Server Actions:
- Single endpoint: `POST https://www.mage.space/creations`
- Differentiated by `next-action` header (hex hash of server function)
- Body: JSON array of arguments
- Response: RSC (React Server Component) wire format

## Files

| File | Area |
|------|------|
| `auth.md` | Firebase token refresh, session creation |
| `generation.md` | Submit job, poll status, get result |
| `characters.md` | Character search/CRUD |
| `history.md` | List past generations |
| `actions.md` | Action hash discovery mechanism |

## How It's Produced

The `rev-eng` agent:
1. Opens a Chromium browser via Playwright MCP
2. Authenticates via Firebase (refresh token → ID token → session)
3. Navigates mage.space, performing actions via UI
4. Captures all network requests (next-action headers, bodies, RSC responses)
5. Documents action hashes, parameters, and response structures
6. Does NOT generate images unless absolutely necessary (credits)

## Status

- [x] auth.md (ported from publisher docs)
- [x] generation.md (ported from publisher docs)
- [ ] characters.md
- [ ] history.md
- [ ] actions.md (discovery mechanism)
