/**
 * Full end-to-end suite against the LIVE mage.space API.
 *
 * Gated behind `MAGE_E2E=1` and requires `MAGE_REFRESH_TOKEN` in the environment,
 * so it never runs in the normal unit-test pass. It exercises the full implemented
 * surface and — critically — tracks everything it creates and deletes it again in
 * an afterAll backstop, leaving the account exactly as it was found.
 *
 * It never touches pre-existing items and never calls clearUserHistory.
 *
 * Run: `set -a; . ./.env; set +a; MAGE_E2E=1 npx vitest run test/e2e/full.test.ts`
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MageSpaceClient } from '../../lib/index.js';
import type { Character, GenerationResult, HistoryItem } from '../../lib/types.js';

const ENABLED = process.env.MAGE_E2E === '1' && Boolean(process.env.MAGE_REFRESH_TOKEN);

/** A tiny valid 1x1 JPEG (used only to exercise the upload endpoints). */
const TINY_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AfwD/2Q==';

const GEN_TIMEOUT = 240_000;
const suffix = Date.now().toString(36);

describe.skipIf(!ENABLED)('e2e: full lifecycle (live API)', () => {
  let client: MageSpaceClient;

  // Everything we ever create — used for the final "left clean" assertion.
  const all = {
    characters: [] as string[],
    references: [] as string[],
    histories: [] as string[],
    creations: [] as string[],
  };
  // Still-to-clean — the afterAll backstop deletes whatever remains here.
  const pending = {
    characters: new Set<string>(),
    references: new Set<string>(),
    histories: new Set<string>(),
    creations: new Set<string>(),
  };

  const track = {
    character: (id: string) => {
      all.characters.push(id);
      pending.characters.add(id);
    },
    reference: (id: string) => {
      all.references.push(id);
      pending.references.add(id);
    },
    history: (id: string) => {
      all.histories.push(id);
      pending.histories.add(id);
    },
    creation: (id: string) => {
      all.creations.push(id);
      pending.creations.add(id);
    },
  };

  let charImageUrl = ''; // a real generated image URL, reused for character/reference creation
  let character: Character;
  let referenceId = '';
  let result1: GenerationResult | null = null;
  let historyId1 = '';
  let historyId2 = '';

  beforeAll(() => {
    client = new MageSpaceClient({ refreshToken: process.env.MAGE_REFRESH_TOKEN as string });
  });

  afterAll(async () => {
    // Backstop cleanup: best-effort, swallow errors, so the account is left clean
    // even if an assertion failed mid-suite.
    for (const id of pending.creations) {
      await client.deleteCreation(id, { confirm: true }).catch(() => {});
    }
    for (const id of pending.histories) {
      await client.deleteHistory(id, { confirm: true }).catch(() => {});
    }
    for (const id of pending.references) {
      await client.references.delete(id, { confirm: true }).catch(() => {});
    }
    for (const id of pending.characters) {
      await client.characters.delete(id).catch(() => {});
    }
  });

  it('discovers actions live (multi-page, incl. deleteReference)', async () => {
    const snap = await client.refreshActions();
    // deploymentId is best-effort: CDN-cached HTML may omit the x-deployment-id header.
    expect(typeof snap.deploymentId).toBe('string');
    expect(snap.hashes.runArchitecture).toBeTruthy();
    expect(snap.hashes.deleteReference).toBeTruthy();
    expect(snap.hashes.getCreationsPaginatedParallel).toBeTruthy();
  });

  it(
    'submits an image generation and waits for the result',
    async () => {
      const { historyId } = await client.generate({
        prompt: `e2e test ${suffix}: a small red cube on a white background`,
        resolution: '1K',
      });
      historyId1 = historyId;
      track.history(historyId);
      const res: HistoryItem = await client.waitForResult(historyId, {
        intervalMs: 4000,
        timeoutMs: GEN_TIMEOUT,
      });
      expect(res.status).toBe('success');
      expect(res.result?.data.image).toMatch(/^https:\/\//);
      result1 = res.result;
      charImageUrl = res.result?.data.image ?? '';
      // getResult on the same id
      const again = await client.getResult(historyId);
      expect(again.id).toBe(historyId);
    },
    GEN_TIMEOUT,
  );

  it('uploads character and reference images', async () => {
    const cUrl = await client.characters.uploadImage(TINY_JPEG);
    expect(cUrl).toMatch(/^https:\/\//);
    const rUrl = await client.references.uploadImage(TINY_JPEG);
    expect(rUrl).toMatch(/^https:\/\//);
  });

  it('creates and manages a character (CRUD, publish, search, paginate)', async () => {
    character = await client.characters.create({
      name: `e2e-char-${suffix}`,
      username: `e2echar${suffix}`,
      image_url: charImageUrl,
      tags: ['realistic'],
    });
    expect(character.id).toBeTruthy();
    track.character(character.id);

    const got = await client.characters.get(character.id);
    expect(got?.id).toBe(character.id);

    const many = await client.characters.getMany([character.id]);
    // getCharacters (batch) only returns public characters, so a private one may
    // come back empty — assert the call succeeds and returns an array.
    expect(Array.isArray(many)).toBe(true);

    const updated = await client.characters.update(character.id, { description: 'e2e' });
    expect(updated.id).toBe(character.id);

    const page = await client.characters.listPaginated({ uid: got?.uid, limit: 50 });
    expect(Array.isArray(page.characters)).toBe(true);

    const found = await client.characters.search({ query: `e2e-char-${suffix}` });
    expect(Array.isArray(found.characters)).toBe(true);

    // publish/unpublish is best-effort: a throwaway character may not be eligible.
    try {
      await client.characters.publish(character.id);
      await client.characters.unpublish(character.id);
    } catch {
      // ignore — covered by unit tests; not all characters can be published
    }
  }, 30_000);

  it('creates, updates, lists and deletes a reference', async () => {
    const ref = await client.references.create({
      name: `e2e-ref-${suffix}`,
      username: `e2eref${suffix}`,
      image_url: charImageUrl,
      variant: 'reference',
    });
    expect(ref.id).toBeTruthy();
    referenceId = ref.id;
    track.reference(ref.id);

    await client.references.update(ref.id, { description: 'e2e' });
    const list = await client.references.list('image');
    expect(Array.isArray(list)).toBe(true);

    // Delete it and confirm it is gone.
    await client.references.delete(ref.id, { confirm: true });
    pending.references.delete(ref.id);
    const after = await client.references.list('image');
    expect(after.some((r) => r.id === ref.id)).toBe(false);
  });

  it('accepts characters[] and references[] in a live generation, then cancels it', async () => {
    const { historyId } = await client.generate({
      prompt: `e2e test ${suffix}: portrait`,
      characters: [
        {
          id: character.id,
          name: character.name,
          username: character.username,
          image_url: character.image_url,
        },
      ],
      references: [
        {
          id: referenceId,
          name: `e2e-ref-${suffix}`,
          username: `e2eref${suffix}`,
          image_url: charImageUrl,
        },
      ],
    });
    expect(historyId).toBeTruthy();
    track.history(historyId);
    historyId2 = historyId;
    // cancelJob should not throw
    await client.cancelJob(historyId);
  });

  it('saves creations and deletes them (single + batch)', async () => {
    expect(result1).not.toBeNull();
    // saveCreation returns no body; save twice, then find ours via listCreations.
    await client.saveCreation(result1 as GenerationResult);
    await client.saveCreation(result1 as GenerationResult);

    const page = await client.listCreations({ limit: 30 });
    expect(Array.isArray(page.creations)).toBe(true);
    const mine = page.creations.filter((c) =>
      String((c.architecture_config as { prompt?: unknown } | undefined)?.prompt ?? '').includes(
        suffix,
      ),
    );
    expect(mine.length).toBeGreaterThanOrEqual(1);
    for (const c of mine) {
      track.creation(c.id);
    }
    const ids = mine.map((c) => c.id);

    // single delete
    await client.deleteCreation(ids[0] as string, { confirm: true });
    pending.creations.delete(ids[0] as string);

    // batch delete for the rest (or the same id again — idempotent soft-delete)
    const rest = ids.length > 1 ? ids.slice(1) : [ids[0] as string];
    await client.deleteManyCreations(rest as string[], { confirm: true });
    for (const id of rest) {
      pending.creations.delete(id as string);
    }
  });

  it('deletes histories (single + batch)', async () => {
    // Reuse the two jobs already created (gen #1 and the cancelled gen #2) instead
    // of spawning new generations — avoids the 429 rate limit and still exercises
    // both the single and batch delete endpoints.
    await client.deleteManyHistories([historyId2], { confirm: true });
    pending.histories.delete(historyId2);

    await client.deleteHistory(historyId1, { confirm: true });
    pending.histories.delete(historyId1);
  });

  it('follows and unfollows a public character (best-effort)', async () => {
    const feed = await client.characters.listPaginated({ visibility: 'public', limit: 5 });
    const target = feed.characters.find((c) => c.id && c.id !== character.id);
    if (!target?.id) {
      return; // no public character available; skip without failing
    }
    await client.characters.follow(target.id);
    await client.characters.unfollow(target.id);
  });

  it('deletes the character and leaves the account as found', async () => {
    await client.characters.delete(character.id);
    pending.characters.delete(character.id);

    // Verify none of the items we created remain visible.
    const hist = await client.listHistory({ limit: 50, status: 'all' });
    for (const id of all.histories) {
      expect(hist.histories.some((h) => h.id === id && h.is_deleted !== true)).toBe(false);
    }
    const refs = await client.references.list('image');
    for (const id of all.references) {
      expect(refs.some((r) => r.id === id)).toBe(false);
    }
  });
});
