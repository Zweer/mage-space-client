import { describe, expect, it } from 'vitest';
import { ActionRegistry, discoverActions, InMemoryActionCache } from '../lib/actions.js';
import { SEED_SNAPSHOT } from '../lib/seed.js';
import type { ActionSnapshot, FetchLike } from '../lib/types.js';

const BASE = 'https://www.mage.space';

describe('discoverActions', () => {
  it('extracts hashes from the page HTML and JS chunks', async () => {
    // Arrange
    const html = '<script src="/_next/static/chunks/app.js"></script>';
    const js =
      '(0,i.createServerReference)("40abc123",i.callServer,void 0,i.f,"runArchitecture");' +
      '(0,i.createServerReference)("60def456",i.callServer,void 0,i.f,"createUserSession")';
    const fetchImpl: FetchLike = async (input) => {
      if (input.endsWith('/explore')) {
        return new Response(html, { headers: { 'x-deployment-id': 'dpl_test' } });
      }
      if (input.endsWith('/_next/static/chunks/app.js')) {
        return new Response(js);
      }
      return new Response('not found', { status: 404 });
    };

    // Act
    const snapshot = await discoverActions({ fetch: fetchImpl, baseUrl: BASE });

    // Assert
    expect(snapshot.deploymentId).toBe('dpl_test');
    expect(snapshot.hashes.runArchitecture).toBe('40abc123');
    expect(snapshot.hashes.createUserSession).toBe('60def456');
  });

  it('scrapes multiple route pages and unions their chunks (route-specific actions)', async () => {
    // Arrange — deleteReference only exists in the /references bundle
    const fetchImpl: FetchLike = async (input) => {
      if (input.endsWith('/explore')) {
        return new Response('<script src="/_next/static/chunks/explore.js"></script>', {
          headers: { 'x-deployment-id': 'dpl_multi' },
        });
      }
      if (input.endsWith('/references')) {
        return new Response('<script src="/_next/static/chunks/references.js"></script>');
      }
      if (input.endsWith('/explore.js')) {
        return new Response(
          '(0,i.createServerReference)("40a1b2",i.c,void 0,i.f,"runArchitecture")',
        );
      }
      if (input.endsWith('/references.js')) {
        return new Response(
          '(0,i.createServerReference)("409d73",i.c,void 0,i.f,"deleteReference")',
        );
      }
      return new Response('not found', { status: 404 });
    };

    // Act
    const snapshot = await discoverActions({ fetch: fetchImpl, baseUrl: BASE });

    // Assert
    expect(snapshot.deploymentId).toBe('dpl_multi');
    expect(snapshot.hashes.runArchitecture).toBe('40a1b2');
    expect(snapshot.hashes.deleteReference).toBe('409d73');
  });

  it('falls back to a chunk response for x-deployment-id when the page omits it', async () => {
    // Arrange — the page HTML carries no x-deployment-id (e.g. CDN-cached).
    const html = '<script src="/_next/static/chunks/app.js"></script>';
    const js = '(0,i.createServerReference)("40aaaa",i.c,void 0,i.f,"runArchitecture")';
    const fetchImpl: FetchLike = async (input) => {
      if (input.endsWith('/explore')) {
        return new Response(html);
      }
      if (input.endsWith('/_next/static/chunks/app.js')) {
        return new Response(js, { headers: { 'x-deployment-id': 'dpl_chunk' } });
      }
      return new Response('not found', { status: 404 });
    };

    // Act
    const snapshot = await discoverActions({
      fetch: fetchImpl,
      baseUrl: BASE,
      discoveryPath: '/explore',
    });

    // Assert
    expect(snapshot.deploymentId).toBe('dpl_chunk');
    expect(snapshot.hashes.runArchitecture).toBe('40aaaa');
  });
});

describe('ActionRegistry', () => {
  it('serves seeded hashes without touching the network', async () => {
    // Arrange
    let calls = 0;
    const fetchImpl: FetchLike = async () => {
      calls += 1;
      return new Response('not found', { status: 404 });
    };
    const registry = new ActionRegistry({ fetch: fetchImpl, baseUrl: BASE, seed: SEED_SNAPSHOT });

    // Act
    const { hash, deploymentId } = await registry.getHash('runArchitecture');

    // Assert
    expect(hash).toBe(SEED_SNAPSHOT.hashes.runArchitecture);
    expect(deploymentId).toBe(SEED_SNAPSHOT.deploymentId);
    expect(calls).toBe(0);
  });

  it('persists discovery to the provided cache', async () => {
    // Arrange
    const html = '<script src="/_next/static/chunks/app.js"></script>';
    const js = '(0,i.createServerReference)("40aaaa",i.callServer,void 0,i.f,"runArchitecture")';
    const fetchImpl: FetchLike = async (input) =>
      input.endsWith('/explore')
        ? new Response(html, { headers: { 'x-deployment-id': 'dpl_fresh' } })
        : new Response(js);
    const cache = new InMemoryActionCache();
    const registry = new ActionRegistry({ fetch: fetchImpl, baseUrl: BASE, cache });

    // Act
    const snapshot = await registry.refresh();
    const cached = await cache.load();

    // Assert
    expect(snapshot.deploymentId).toBe('dpl_fresh');
    expect(cached?.hashes.runArchitecture).toBe('40aaaa');
  });

  it('de-duplicates concurrent refreshes (single-flight)', async () => {
    // Arrange
    let pageFetches = 0;
    const html = '<script src="/_next/static/chunks/app.js"></script>';
    const js = '(0,i.createServerReference)("40aaaa",i.callServer,void 0,i.f,"runArchitecture")';
    const fetchImpl: FetchLike = async (input) => {
      if (input.endsWith('/explore')) {
        pageFetches += 1;
        return new Response(html, { headers: { 'x-deployment-id': 'dpl_x' } });
      }
      return new Response(js);
    };
    const registry = new ActionRegistry({ fetch: fetchImpl, baseUrl: BASE });

    // Act
    const [a, b] = await Promise.all([registry.refresh(), registry.refresh()]);

    // Assert
    expect(pageFetches).toBe(1);
    expect(a).toBe(b as ActionSnapshot);
  });
});
