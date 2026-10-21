import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { MageSpaceError } from '../lib/errors.js';
import { MageSpaceClient } from '../lib/index.js';
import { SEED_SNAPSHOT } from '../lib/seed.js';

const PROD = 'https://www.mage.space';
const BETA = 'https://beta.mage.space';

/** Wrap a JSON payload in a minimal RSC server-action envelope. */
function envelope(payload: string): string {
  return `0:{"a":"$@1","f":"","b":"build"}\n1:${payload}\n`;
}

const tokenHandler = http.post('https://securetoken.googleapis.com/v1/token', () =>
  HttpResponse.json({ id_token: 'a.b.c', user_id: 'uid-1', expires_in: '3600' }),
);

/** Beta action hashes injected via discovery (beta has no bundled seed). */
const BETA_HASHES = {
  createUserSession: 'b0a5e5510',
  runArchitecture: 'b0a4c4001',
  getHistoryPaginated: 'b0415700a',
};

const betaChunk =
  `(0,i.createServerReference)("${BETA_HASHES.createUserSession}",i.c,void 0,i.f,"createUserSession")` +
  `(0,i.createServerReference)("${BETA_HASHES.runArchitecture}",i.c,void 0,i.f,"runArchitecture")` +
  `(0,i.createServerReference)("${BETA_HASHES.getHistoryPaginated}",i.c,void 0,i.f,"getHistoryPaginated")`;

const betaHtml = '<script src="/_next/static/chunks/beta.js"></script>';
/** Production discovery chunk — keeps runArchitecture present so the in-place
 * retry still resolves a hash (and still 404s), yielding an unavailability. */
const prodChunk = `(0,i.createServerReference)("40c0ded01",i.c,void 0,i.f,"runArchitecture")`;
const prodHtml = '<script src="/_next/static/chunks/prod.js"></script>';

/** Discovery handlers for the production host (so re-discovery succeeds). */
function prodDiscoveryHandlers() {
  return [
    http.get(`${PROD}/explore`, () =>
      HttpResponse.html(prodHtml, { headers: { 'x-deployment-id': 'dpl_prod' } }),
    ),
    http.get(`${PROD}/creations`, () => HttpResponse.html(prodHtml)),
    http.get(`${PROD}/characters`, () => HttpResponse.html(prodHtml)),
    http.get(`${PROD}/references`, () => HttpResponse.html(prodHtml)),
    http.get(`${PROD}/_next/static/chunks/prod.js`, () => HttpResponse.text(prodChunk)),
  ];
}

/** Discovery handlers for the beta host. */
function betaDiscoveryHandlers() {
  return [
    http.get(`${BETA}/explore`, () =>
      HttpResponse.html(betaHtml, { headers: { 'x-deployment-id': 'dpl_beta' } }),
    ),
    http.get(`${BETA}/creations`, () => HttpResponse.html(betaHtml)),
    http.get(`${BETA}/characters`, () => HttpResponse.html(betaHtml)),
    http.get(`${BETA}/references`, () => HttpResponse.html(betaHtml)),
    http.get(`${BETA}/_next/static/chunks/beta.js`, () => HttpResponse.text(betaChunk)),
  ];
}

/** Beta session + submit + paginated poll, all succeeding. */
function betaRuntimeHandlers(counters?: { betaSubmits?: number }): ReturnType<typeof http.post>[] {
  return [
    http.post(`${BETA}/explore`, ({ request }) => {
      if (request.headers.get('next-action') === BETA_HASHES.runArchitecture) {
        if (counters) {
          counters.betaSubmits = (counters.betaSubmits ?? 0) + 1;
        }
        return HttpResponse.text(envelope('{"history_id":"h-beta"}'));
      }
      return HttpResponse.text('not found', { status: 404 });
    }),
    http.post(`${BETA}/creations`, async ({ request }) => {
      const action = request.headers.get('next-action');
      if (action === BETA_HASHES.createUserSession) {
        return HttpResponse.text(envelope('null'), {
          headers: { 'set-cookie': '__session=sess-beta; Path=/; HttpOnly' },
        });
      }
      if (action === BETA_HASHES.getHistoryPaginated) {
        return HttpResponse.text(
          envelope(
            '{"histories":[{"id":"h-beta","status":"success","result":{"data":{"image":"https://cdn/beta.jpg"}}}],"hasMore":false}',
          ),
        );
      }
      return HttpResponse.text('not found', { status: 404 });
    }),
  ];
}

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('automatic beta-portal fallback', () => {
  it('switches to beta when production reports an action unavailable, then stays sticky', async () => {
    // Arrange — prod session works, prod runArchitecture 404s persistently; beta fully wired.
    let prodSubmitPosts = 0;
    let prodContactedAfterSwitch = false;
    let switched = false;
    const counters: { betaSubmits?: number } = {};
    server.use(
      tokenHandler,
      ...prodDiscoveryHandlers(),
      ...betaDiscoveryHandlers(),
      http.post(`${PROD}/creations`, ({ request }) => {
        if (switched) {
          prodContactedAfterSwitch = true;
        }
        if (request.headers.get('next-action') === SEED_SNAPSHOT.hashes.createUserSession) {
          return HttpResponse.text(envelope('null'), {
            headers: { 'set-cookie': '__session=sess-prod; Path=/; HttpOnly' },
          });
        }
        return HttpResponse.text('not found', { status: 404 });
      }),
      http.post(`${PROD}/explore`, () => {
        prodSubmitPosts += 1;
        if (switched) {
          prodContactedAfterSwitch = true;
        }
        return HttpResponse.text('not found', { status: 404 });
      }),
      ...betaRuntimeHandlers(counters),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act — first generate triggers the switch; waitForResult polls beta.
    const { historyId } = await client.generate({ prompt: 'fox' });
    switched = true;
    const result = await client.waitForResult(historyId, { intervalMs: 1, timeoutMs: 5000 });

    // A second generate must stay on beta and never re-contact production.
    const second = await client.generate({ prompt: 'fox again' });

    // Assert
    expect(client.getActiveTarget()).toBe('beta');
    expect(historyId).toBe('h-beta');
    expect(result.result?.data.image).toBe('https://cdn/beta.jpg');
    expect(second.historyId).toBe('h-beta');
    // Prod POST /explore was hit twice (initial + in-place retry) before the switch.
    expect(prodSubmitPosts).toBe(2);
    expect(prodContactedAfterSwitch).toBe(false);
    expect(counters.betaSubmits).toBe(2);
  });

  it('does NOT switch on a production 5xx (propagates as MageSpaceError)', async () => {
    // Arrange
    server.use(
      tokenHandler,
      http.post(`${PROD}/creations`, ({ request }) => {
        if (request.headers.get('next-action') === SEED_SNAPSHOT.hashes.createUserSession) {
          return HttpResponse.text(envelope('null'), {
            headers: { 'set-cookie': '__session=sess-prod; Path=/; HttpOnly' },
          });
        }
        return HttpResponse.text('not found', { status: 404 });
      }),
      http.post(`${PROD}/explore`, () => HttpResponse.text('boom', { status: 503 })),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act & Assert — a server error is not a fallback trigger.
    await expect(client.generate({ prompt: 'fox' })).rejects.toBeInstanceOf(MageSpaceError);
    expect(client.getActiveTarget()).toBe('production');
  });

  it('propagates the trigger instead of switching when fallback.auto is false', async () => {
    // Arrange — prod unavailable, but auto:false disables the switch.
    server.use(
      tokenHandler,
      ...prodDiscoveryHandlers(),
      http.post(`${PROD}/creations`, ({ request }) => {
        if (request.headers.get('next-action') === SEED_SNAPSHOT.hashes.createUserSession) {
          return HttpResponse.text(envelope('null'), {
            headers: { 'set-cookie': '__session=sess-prod; Path=/; HttpOnly' },
          });
        }
        return HttpResponse.text('not found', { status: 404 });
      }),
      http.post(`${PROD}/explore`, () => HttpResponse.text('not found', { status: 404 })),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt', fallback: { auto: false } });

    // Act & Assert
    await expect(client.generate({ prompt: 'fox' })).rejects.toMatchObject({
      name: 'ActionUnavailableError',
      targetKey: 'production',
    });
    expect(client.getActiveTarget()).toBe('production');
  });

  it('throws at construction when baseUrl is combined with fallback options', () => {
    // Act & Assert
    expect(
      () =>
        new MageSpaceClient({
          refreshToken: 'rt',
          baseUrl: 'https://x.example',
          fallback: { start: 'beta' },
        }),
    ).toThrow(/baseUrl pins a single host/);
  });
});
