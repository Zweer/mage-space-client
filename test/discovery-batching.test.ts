import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  discoverActions,
  listDiscoveryChunks,
  requiredActionsForClient,
  scrapeChunks,
} from '../lib/actions.js';
import { SEED_SNAPSHOT } from '../lib/seed.js';

const BASE = 'https://www.mage.space';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('listDiscoveryChunks', () => {
  it('unions and de-duplicates chunks across pages with one GET per page', async () => {
    // Arrange — four pages, each referencing one chunk; two share a chunk.
    const counts: Record<string, number> = {};
    const page = (name: string, chunk: string, headers?: Record<string, string>) =>
      http.get(`${BASE}/${name}`, () => {
        counts[name] = (counts[name] ?? 0) + 1;
        return HttpResponse.html(`<script src="${chunk}"></script>`, { headers });
      });
    server.use(
      page('explore', '/_next/static/chunks/explore.js', { 'x-deployment-id': 'dpl_list' }),
      page('creations', '/_next/static/chunks/shared.js'),
      page('characters', '/_next/static/chunks/shared.js'),
      page('references', '/_next/static/chunks/references.js'),
    );

    // Act
    const result = await listDiscoveryChunks({ fetch, baseUrl: BASE });

    // Assert — exactly one GET per page (<= 4 subrequests), deduped + ordered.
    expect(counts).toEqual({ explore: 1, creations: 1, characters: 1, references: 1 });
    expect(result.deploymentId).toBe('dpl_list');
    expect(result.chunkPaths).toEqual([
      '/_next/static/chunks/explore.js',
      '/_next/static/chunks/shared.js',
      '/_next/static/chunks/references.js',
    ]);
  });

  it('honors a custom pages argument (single page => single GET)', async () => {
    // Arrange
    let exploreGets = 0;
    server.use(
      http.get(`${BASE}/explore`, () => {
        exploreGets += 1;
        return HttpResponse.html('<script src="/_next/static/chunks/only.js"></script>');
      }),
    );

    // Act
    const result = await listDiscoveryChunks({ fetch, baseUrl: BASE, pages: ['/explore'] });

    // Assert
    expect(exploreGets).toBe(1);
    expect(result.chunkPaths).toEqual(['/_next/static/chunks/only.js']);
  });
});

describe('scrapeChunks', () => {
  it('fetches only the passed chunks, merges hashes, and survives a 404', async () => {
    // Arrange — two chunks resolve, one 404s.
    let chunkFetches = 0;
    server.use(
      http.get(`${BASE}/_next/static/chunks/a.js`, () => {
        chunkFetches += 1;
        return HttpResponse.text(
          '(0,i.createServerReference)("40aaaa",i.c,void 0,i.f,"runArchitecture")',
          { headers: { 'x-deployment-id': 'dpl_scrape' } },
        );
      }),
      http.get(`${BASE}/_next/static/chunks/b.js`, () => {
        chunkFetches += 1;
        return HttpResponse.text(
          '(0,i.createServerReference)("40bbbb",i.c,void 0,i.f,"deleteReference")',
        );
      }),
      http.get(`${BASE}/_next/static/chunks/missing.js`, () => {
        chunkFetches += 1;
        return HttpResponse.text('not found', { status: 404 });
      }),
    );
    const chunkPaths = [
      '/_next/static/chunks/a.js',
      '/_next/static/chunks/b.js',
      '/_next/static/chunks/missing.js',
    ];

    // Act
    const result = await scrapeChunks({ fetch, baseUrl: BASE, chunkPaths });

    // Assert — exactly one fetch per passed chunk; merged hashes; 404 skipped.
    expect(chunkFetches).toBe(chunkPaths.length);
    expect(result.deploymentId).toBe('dpl_scrape');
    expect(result.hashes.runArchitecture).toBe('40aaaa');
    expect(result.hashes.deleteReference).toBe('40bbbb');
  });

  it('does not throw on an empty result', async () => {
    // Arrange
    server.use(
      http.get(`${BASE}/_next/static/chunks/empty.js`, () => HttpResponse.text('no refs here')),
    );

    // Act
    const result = await scrapeChunks({
      fetch,
      baseUrl: BASE,
      chunkPaths: ['/_next/static/chunks/empty.js'],
    });

    // Assert
    expect(result.hashes).toEqual({});
  });
});

describe('requiredActionsForClient', () => {
  it('lists the portal actions and every name is a seed hash key', () => {
    // Act
    const required = requiredActionsForClient();

    // Assert
    expect(required).toContain('createUserSession');
    expect(required).toContain('getHistoryPaginated');
    for (const name of required) {
      expect(SEED_SNAPSHOT.hashes[name]).toBeDefined();
    }
  });
});

describe('listDiscoveryChunks + scrapeChunks round-trip', () => {
  it('yields the same hashes as discoverActions for the same host', async () => {
    // Arrange — one page with two chunks, exercised by both paths.
    const handlers = [
      http.get(`${BASE}/explore`, () =>
        HttpResponse.html(
          '<script src="/_next/static/chunks/one.js"></script>' +
            '<script src="/_next/static/chunks/two.js"></script>',
          { headers: { 'x-deployment-id': 'dpl_rt' } },
        ),
      ),
      http.get(`${BASE}/_next/static/chunks/one.js`, () =>
        HttpResponse.text('(0,i.createServerReference)("4011",i.c,void 0,i.f,"runArchitecture")'),
      ),
      http.get(`${BASE}/_next/static/chunks/two.js`, () =>
        HttpResponse.text('(0,i.createServerReference)("4022",i.c,void 0,i.f,"createUserSession")'),
      ),
    ];
    server.use(...handlers);

    // Act
    const list = await listDiscoveryChunks({ fetch, baseUrl: BASE, pages: ['/explore'] });
    const batched = await scrapeChunks({ fetch, baseUrl: BASE, chunkPaths: list.chunkPaths });
    const whole = await discoverActions({ fetch, baseUrl: BASE, discoveryPath: '/explore' });

    // Assert
    expect(batched.hashes).toEqual(whole.hashes);
    expect(list.deploymentId).toBe(whole.deploymentId);
  });
});
