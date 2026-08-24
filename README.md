# @zweer/mage-space-client

A TypeScript client for mage.space's internal API. Generate AI images and videos programmatically.

**No official mage.space API exists.** This library reverse-engineers the Next.js Server Actions used by the web app to provide a clean, type-safe interface for automation.

## Install

```bash
npm install @zweer/mage-space-client
```

## Quick Start

```typescript
import { MageSpaceClient } from '@zweer/mage-space-client';

const client = new MageSpaceClient({
  refreshToken: process.env.MAGE_REFRESH_TOKEN!,
});

// Submit a generation and poll until it finishes
const { historyId } = await client.generate({
  prompt: 'A cyberpunk city at sunset, neon lights reflecting on wet streets',
  model: 'mango-v3-pro',
  aspectRatio: 'portrait',
  resolution: '1K',
});

const result = await client.waitForResult(historyId);
console.log(result.result?.data.image); // CDN URL of the generated image
```

## Features

- **Image generation** — submit, poll, fetch, cancel (`generate`, `waitForResult`, `getResult`, `cancelJob`)
- **Video generation** — Berry-2 family (`generateVideo`)
- **Characters** — search, full CRUD, pagination, publish/unpublish, image upload, voice, follow/unfollow (`client.characters.*`)
- **References** — reusable image assets: upload, create, update, list, delete (`client.references.*`)
- **History & creations** — list history, save/list/delete permanent creations
- **Auto-auth** — Firebase token refresh (ID token ~1h, session ~24h) handled automatically
- **Action discovery** — Vercel deploy hash changes handled transparently (multi-page discovery + warm seed)

## Authentication

Mage.space uses Firebase Authentication. You need a refresh token:

1. Log into mage.space in your browser
2. Open DevTools → Application → IndexedDB → `firebaseLocalStorage`
3. Find the entry with your user data, copy the `refreshToken` value
4. Store it as an environment variable

```bash
export MAGE_REFRESH_TOKEN="AMf-vBw..."
```

The library refreshes tokens automatically.

## Usage

### Image generation

```typescript
const { historyId } = await client.generate({
  prompt: 'portrait of @mycharacter in a neon-lit alley',
  model: 'mango-v3-pro',
  aspectRatio: 'portrait',
  resolution: '1K',
  // optional: attach trained characters and reference assets
  characters: [{ id, name, username, image_url }],
  references: [{ id, name, username, image_url }],
  // optional: reference images (first + additional, up to the architecture's limit)
  image: 'https://cdn3.mage.space/.../first.jpg',
  additionalImages: ['https://cdn3.mage.space/.../second.jpg'],
});

const result = await client.waitForResult(historyId, { intervalMs: 4000, timeoutMs: 300_000 });
console.log(result.result?.data.image);

await client.cancelJob(historyId); // cancel a still-running job
```

### Video generation (Berry-2)

```typescript
const { historyId } = await client.generateVideo({
  prompt: 'a cat walking on a sunny sidewalk',
  aspectRatio: '9:16', // berry_aspect_ratio
  resolution: '480p',
  duration: '5', // seconds, as a string
});
const video = await client.waitForResult(historyId);
console.log(video.result?.data.video);
```

### Characters

```typescript
// upload an image, then create a character from it
const imageUrl = await client.characters.uploadImage(dataUrl); // data:image/jpeg;base64,...

// username is optional — auto-generated from the name if omitted (max 15 chars)
const character = await client.characters.create({
  name: 'my-character',
  image_url: imageUrl,
  tags: ['realistic'],
});
// character.username → "my-character-x7z" (auto-generated)

// or provide an explicit username (must be 1–15 chars, lowercase a-z/0-9/_/-)
const character2 = await client.characters.create({
  name: 'my-character',
  username: 'mychar-abcd',
  image_url: imageUrl,
  tags: ['realistic'],
});

await client.characters.update(character.id, { description: 'updated' });
await client.characters.publish(character.id);
await client.characters.unpublish(character.id);

const { characters } = await client.characters.search({ query: 'mychar' });
const page = await client.characters.listPaginated({ uid: character.uid, limit: 50 });
await client.characters.delete(character.id);
```

### References

```typescript
const refUrl = await client.references.uploadImage(dataUrl);
const reference = await client.references.create({
  name: 'sunflower-dress',
  image_url: refUrl,
  variant: 'outfit', // 'reference' | 'object' | 'outfit' | 'pose'
});
// reference.username → auto-generated, e.g. "sunflower-d-k3m9"

const mine = await client.references.list('image');
const feed = await client.references.listPaginated({ featuredOnly: true, orderBy: 'top' });
await client.references.delete(reference.id, { confirm: true });
```

### History & creations

```typescript
const history = await client.listHistory({ limit: 10, status: 'success' });
const creations = await client.listCreations({ limit: 10 });

// persist a finished result as a permanent creation (returns void — retrieve via listCreations)
await client.saveCreation(result.result!);
```

### Destructive operations

Irreversible deletes require an explicit confirmation flag:

```typescript
await client.deleteHistory(historyId, { confirm: true });
await client.deleteManyHistories([id1, id2], { confirm: true });
await client.deleteCreation(creationId, { confirm: true });
await client.deleteManyCreations([id1, id2], { confirm: true });
```

## How It Works

Unlike traditional REST APIs, mage.space uses Next.js Server Actions:
- Requests are `POST`ed to a page path with a `next-action` header identifying the server function
- Responses use the React Server Component (RSC) "Flight" wire format
- Action hashes change on every Vercel deploy — discovered from the page bundles (across routes) and cached, with a bundled seed for a warm start

## Project Structure

```
lib/
├── index.ts        # Public barrel (re-exports)
├── client.ts       # MageSpaceClient facade
├── http.ts         # Server Action HTTP client
├── auth.ts         # Firebase auth (refresh → ID token → session)
├── generation.ts   # Image + video submit / poll / cancel
├── characters.ts   # Character search / CRUD / upload / voice / follow
├── references.ts   # Reference assets: upload / CRUD / list
├── history.ts      # History + creations (list / save / delete)
├── actions.ts      # Multi-page action-hash discovery
├── rsc.ts          # RSC (Flight) response parser
├── seed.ts         # Bundled action-hash seed snapshot
├── errors.ts       # Typed error classes
└── types.ts        # All type definitions
```

## License

MIT
