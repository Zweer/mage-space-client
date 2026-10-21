import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ActionRegistry } from '../lib/actions.js';
import { ActionUnavailableError, MageSpaceError } from '../lib/errors.js';
import { HttpClient } from '../lib/http.js';
import { SEED_SNAPSHOT } from '../lib/seed.js';

const BASE = 'https://www.mage.space';

/** Wrap a JSON payload in a minimal RSC server-action envelope. */
function envelope(payload: string): string {
  return `0:{"a":"$@1","f":"","b":"build"}\n1:${payload}\n`;
}

/** A discovery page referencing a single chunk. */
const discoveryHtml = '<script src="/_next/static/chunks/app.js"></script>';
/** A chunk exposing a fresh `runArchitecture` hash (hashes are hex). */
const FRESH_HASH = '40faced01';
const discoveryChunk = `(0,i.createServerReference)("${FRESH_HASH}",i.callServer,void 0,i.f,"runArchitecture")`;

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('HttpClient action-unavailability detection', () => {
  it('recovers from a first-time 404 by re-discovering and retrying once', async () => {
    // Arrange — the seeded hash 404s once, then discovery yields a fresh hash
    // that the retried POST serves successfully.
    let explorePosts = 0;
    server.use(
      http.get(`${BASE}/explore`, () =>
        HttpResponse.html(discoveryHtml, { headers: { 'x-deployment-id': 'dpl_fresh' } }),
      ),
      http.get(`${BASE}/creations`, () => HttpResponse.html(discoveryHtml)),
      http.get(`${BASE}/characters`, () => HttpResponse.html(discoveryHtml)),
      http.get(`${BASE}/references`, () => HttpResponse.html(discoveryHtml)),
      http.get(`${BASE}/_next/static/chunks/app.js`, () => HttpResponse.text(discoveryChunk)),
      http.post(`${BASE}/explore`, ({ request }) => {
        explorePosts += 1;
        const action = request.headers.get('next-action');
        if (action === FRESH_HASH) {
          return HttpResponse.text(envelope('{"history_id":"h-1"}'));
        }
        return HttpResponse.text('not found', { status: 404 });
      }),
    );
    const registry = new ActionRegistry({ fetch, baseUrl: BASE, seed: SEED_SNAPSHOT });
    const client = new HttpClient(registry, fetch, BASE, 'production');

    // Act
    const { data } = await client.callAction<{ history_id: string }>({
      action: 'runArchitecture',
      path: '/explore',
      args: [],
    });

    // Assert — stale seed hash 404'd, re-discovery + retry succeeded.
    expect(data.history_id).toBe('h-1');
    expect(explorePosts).toBe(2);
  });

  it('throws ActionUnavailableError when a 404 persists after the retry', async () => {
    // Arrange — the POST always 404s and re-discovery keeps the same host, so the
    // retried call is still unavailable.
    server.use(
      http.get(`${BASE}/explore`, () =>
        HttpResponse.html(discoveryHtml, { headers: { 'x-deployment-id': 'dpl_fresh' } }),
      ),
      http.get(`${BASE}/creations`, () => HttpResponse.html(discoveryHtml)),
      http.get(`${BASE}/characters`, () => HttpResponse.html(discoveryHtml)),
      http.get(`${BASE}/references`, () => HttpResponse.html(discoveryHtml)),
      http.get(`${BASE}/_next/static/chunks/app.js`, () => HttpResponse.text(discoveryChunk)),
      http.post(`${BASE}/explore`, () => HttpResponse.text('not found', { status: 404 })),
    );
    const registry = new ActionRegistry({ fetch, baseUrl: BASE, seed: SEED_SNAPSHOT });
    const client = new HttpClient(registry, fetch, BASE, 'production');

    // Act & Assert
    await expect(
      client.callAction({ action: 'runArchitecture', path: '/explore', args: [] }),
    ).rejects.toMatchObject({
      name: 'ActionUnavailableError',
      action: 'runArchitecture',
      targetKey: 'production',
    });
  });

  it('throws ActionUnavailableError when a 200 text/html fallback persists after the retry', async () => {
    // Arrange — a stale hash can surface as a 200 serving the page shell (HTML)
    // instead of the RSC response.
    server.use(
      http.get(`${BASE}/explore`, () =>
        HttpResponse.html(discoveryHtml, { headers: { 'x-deployment-id': 'dpl_fresh' } }),
      ),
      http.get(`${BASE}/creations`, () => HttpResponse.html(discoveryHtml)),
      http.get(`${BASE}/characters`, () => HttpResponse.html(discoveryHtml)),
      http.get(`${BASE}/references`, () => HttpResponse.html(discoveryHtml)),
      http.get(`${BASE}/_next/static/chunks/app.js`, () => HttpResponse.text(discoveryChunk)),
      http.post(`${BASE}/explore`, () =>
        HttpResponse.html('<!doctype html><html><body>shell</body></html>'),
      ),
    );
    const registry = new ActionRegistry({ fetch, baseUrl: BASE, seed: SEED_SNAPSHOT });
    const client = new HttpClient(registry, fetch, BASE, 'beta');

    // Act & Assert
    const error = await client
      .callAction({ action: 'runArchitecture', path: '/explore', args: [] })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ActionUnavailableError);
    expect((error as ActionUnavailableError).targetKey).toBe('beta');
  });

  it('propagates a 5xx as a MageSpaceError without retrying or treating it as unavailable', async () => {
    // Arrange
    let explorePosts = 0;
    server.use(
      http.post(`${BASE}/explore`, () => {
        explorePosts += 1;
        return HttpResponse.text('boom', { status: 503 });
      }),
    );
    const registry = new ActionRegistry({ fetch, baseUrl: BASE, seed: SEED_SNAPSHOT });
    const client = new HttpClient(registry, fetch, BASE, 'production');

    // Act
    const error = await client
      .callAction({ action: 'runArchitecture', path: '/explore', args: [] })
      .catch((e: unknown) => e);

    // Assert — a server error is not an unavailability signal: no retry, plain MageSpaceError.
    expect(error).toBeInstanceOf(MageSpaceError);
    expect(error).not.toBeInstanceOf(ActionUnavailableError);
    expect(explorePosts).toBe(1);
  });
});
