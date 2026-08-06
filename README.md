# @zweer/mage-space-client

A TypeScript client for mage.space's internal API. Generate AI images programmatically.

**No official mage.space API exists.** This library reverse-engineers the Next.js Server Actions used by the web app to provide a clean, type-safe interface for automation.

## Install

```bash
npm install @zweer/mage-space-client
```

## Quick Start

```typescript
import { MageSpaceClient } from '@zweer/mage-space-client';

const client = new MageSpaceClient({
  refreshToken: process.env.MAGE_REFRESH_TOKEN,
});

// Generate an image
const job = await client.generate({
  prompt: 'A cyberpunk city at sunset, neon lights reflecting on wet streets',
  model: 'mango-v3-pro',
  aspectRatio: 'portrait',
  resolution: '1K',
});

// Poll until complete
const result = await client.waitForResult(job.historyId);
console.log(result.imageUrl);
```

## Features

- **Image Generation** — Submit jobs, poll status, get results
- **Characters** — Search and reference trained characters in prompts
- **History** — List and retrieve past generations
- **Auto-Auth** — Firebase token refresh handled automatically
- **Action Discovery** — Handles Vercel deploy hash changes gracefully

## Authentication

Mage.space uses Firebase Authentication. You need a refresh token:

1. Log into mage.space in your browser
2. Open DevTools → Application → IndexedDB → `firebaseLocalStorage`
3. Find the entry with your user data, copy the `refreshToken` value
4. Store it as an environment variable

```bash
export MAGE_REFRESH_TOKEN="AMf-vBw..."
```

The library handles token refresh automatically (ID token every 1h, session every 24h).

## How It Works

Unlike traditional REST APIs, mage.space uses Next.js Server Actions:
- All requests go to `POST /creations` with a `next-action` header
- The header identifies which server function to call
- Responses use React Server Component (RSC) wire format
- Action hashes change on every Vercel deploy (handled automatically)

## Project Structure

```
lib/
├── index.ts            # Public barrel (re-exports)
├── client.ts           # MageSpaceClient class (facade)
├── http.ts             # Server Action HTTP client
├── auth.ts             # Firebase auth (refresh → ID token → session)
├── generation.ts       # Submit + poll generation jobs
├── characters.ts       # Character search/CRUD
├── history.ts          # Generation history
├── actions.ts          # Action hash discovery
├── rsc.ts              # RSC response parser
├── errors.ts           # Typed error classes
└── types.ts            # All type definitions
```

## License

MIT
