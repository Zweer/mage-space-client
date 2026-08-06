# AGENTS.md — mage-space-client

Universal steering file for AI agents working on this project.

## Project Identity

**mage-space-client** is a TypeScript library that wraps mage.space's internal API for AI image generation. No official API exists — this library reverse-engineers the Next.js Server Actions used by the web app.

The library covers: authentication (Firebase), image generation (submit + poll), character management, generation history, and action hash discovery.

## Stack

- **Language:** TypeScript (strict mode, ES modules)
- **Runtime:** Node.js 22+
- **HTTP:** Native fetch (async/await)
- **Auth:** Firebase (jose for JWT handling)
- **Testing:** Vitest
- **Build:** tsdown
- **Lint/Format:** Biome
- **Package:** `@zweer/mage-space-client` (npm)

## Key Technical Context

### NOT a REST API

Mage.space uses Next.js Server Actions:
- All calls go to `POST /creations` with a `next-action` header
- The header value is a hex hash identifying the server function
- Request body is always a JSON array of arguments
- Response is RSC (React Server Component) wire format, not JSON
- Action hashes **change on every Vercel deploy**

### Firebase Authentication

Two tokens in play:
1. `__session` cookie — Firebase Session Cookie (~24h), set by `createUserSession` action
2. `authToken` in request body — Firebase ID Token (~1h), refreshed via REST API

### Action Hash Discovery

Since hashes change per deploy, the library must:
- Discover current hashes by inspecting page source/bundles
- Cache discovered hashes with deployment ID
- Re-discover when a 404 indicates stale hashes

## Agent Architecture

### `rev-eng` — Reverse Engineering Agent
- **Purpose:** Discover mage.space's API by navigating the web UI with Playwright
- **Input:** Firebase refresh token (`.env`)
- **Output:** API documentation in `docs/api/*.md`
- **Tools:** Playwright MCP (browser automation + network interception)

### `dev` — Development Agent
- **Purpose:** Implement the TypeScript library from the API docs
- **Input:** `docs/api/*.md` (produced by rev-eng)
- **Output:** `lib/`, `test/`, types, client code

### Workflow

```
rev-eng (Playwright) → docs/api/*.md → dev (implementation) → lib/ + test/
```

## Kiro Configuration

```
.kiro/
├── agents/
│   ├── rev-eng.json   # Agent definition (Playwright MCP, write to docs/api/)
│   └── dev.json       # Agent definition (full dev tools, write to lib/test/)
├── prompts/
│   ├── rev-eng.md     # Instructions for API discovery
│   └── dev.md         # Instructions for implementation
└── steering/
    ├── interaction.md
    ├── code-style.md
    ├── build-tooling.md
    └── commit-conventions.md
```

## Conventions (Summary)

Full details in `.kiro/steering/`. Key rules:

- TypeScript strict, no `any`, explicit return types on exports
- ES modules with `.js` extensions in imports
- `async/await` everywhere, native `fetch`
- Biome for lint + format (not ESLint/Prettier)
- Vitest for tests (AAA pattern)
- Conventional commits + gitmoji (text codes, not emoji)

## Interaction Rules

### Language
- **Conversation:** Italian
- **Code, comments, commits, docs:** English

### Git
- **NEVER commit, push, or create tags** — the developer handles all git operations
- Prepare changes and suggest a commit message

### Interview Before Implementing
For ambiguous or complex requests, ask clarifying questions BEFORE writing code.

### Plan Before Implementing
For multi-step tasks: write a numbered plan, wait for approval, then implement.
