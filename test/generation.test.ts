import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { GenerationError } from '../lib/errors.js';
import { MageSpaceClient } from '../lib/index.js';
import { SEED_SNAPSHOT } from '../lib/seed.js';

const BASE = 'https://www.mage.space';

/** Wrap a JSON payload in a minimal RSC server-action envelope. */
function envelope(payload: string): string {
  return `0:{"a":"$@1","f":"","b":"build"}\n1:${payload}\n`;
}

const tokenHandler = http.post('https://securetoken.googleapis.com/v1/token', () =>
  HttpResponse.json({
    id_token: 'a.b.c',
    refresh_token: 'rotated',
    user_id: 'uid-1',
    expires_in: '3600',
  }),
);

const sessionHandler = http.post(`${BASE}/creations`, () =>
  HttpResponse.text(envelope('null'), {
    headers: {
      'set-cookie': '__session=sess-abc; Path=/; HttpOnly',
      'x-deployment-id': SEED_SNAPSHOT.deploymentId,
    },
  }),
);

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MageSpaceClient generation', () => {
  it('submits a job and waits for a successful image result', async () => {
    // Arrange
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, ({ request }) => {
        const action = request.headers.get('next-action');
        if (action === SEED_SNAPSHOT.hashes.runArchitecture) {
          return HttpResponse.text(envelope('{"history_id":"h-1"}'));
        }
        if (action === SEED_SNAPSHOT.hashes.getHistoryById) {
          return HttpResponse.text(
            envelope(
              '{"id":"h-1","status":"success","result":{"data":{"image":"https://cdn/x.jpg"}}}',
            ),
          );
        }
        return HttpResponse.text('not found', { status: 404 });
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    const { historyId } = await client.generate({ prompt: 'a red fox in the snow' });
    const result = await client.waitForResult(historyId, { intervalMs: 1, timeoutMs: 5000 });

    // Assert
    expect(historyId).toBe('h-1');
    expect(result.status).toBe('success');
    expect(result.result?.data.image).toBe('https://cdn/x.jpg');
  });

  it('throws GenerationError when the API returns an error_code', async () => {
    // Arrange
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, () => HttpResponse.text(envelope('{"error_code":4031}'))),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act & Assert
    await expect(client.generate({ prompt: 'blocked prompt' })).rejects.toThrow(GenerationError);
  });

  it('submits a video job with berry_aspect_ratio/duration and returns a video result', async () => {
    // Arrange
    let sentConfig: Record<string, unknown> | undefined;
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, async ({ request }) => {
        const action = request.headers.get('next-action');
        if (action === SEED_SNAPSHOT.hashes.runArchitecture) {
          const body = (await request.json()) as [{ architectureConfig: Record<string, unknown> }];
          sentConfig = body[0]?.architectureConfig;
          return HttpResponse.text(envelope('{"history_id":"v-1"}'));
        }
        if (action === SEED_SNAPSHOT.hashes.getHistoryById) {
          return HttpResponse.text(
            envelope(
              '{"id":"v-1","status":"success","result":{"type":"video","data":{"video":"https://cdn/v.mp4"}}}',
            ),
          );
        }
        return HttpResponse.text('not found', { status: 404 });
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    const { historyId } = await client.generateVideo({
      prompt: 'a cat walking',
      duration: '5',
      aspectRatio: '16:9',
    });
    const result = await client.waitForResult(historyId, { intervalMs: 1, timeoutMs: 5000 });

    // Assert
    expect(historyId).toBe('v-1');
    expect(result.result?.data.video).toBe('https://cdn/v.mp4');
    expect(sentConfig?.model_id).toBe('berry-2');
    expect(sentConfig?.architecture).toBe('berry');
    expect(sentConfig?.berry_aspect_ratio).toBe('16:9');
    expect(sentConfig?.duration).toBe('5');
    expect(sentConfig).not.toHaveProperty('moodboard');
  });

  it('passes the first image and additional_images through for multi-reference generation', async () => {
    // Arrange
    let sentConfig: Record<string, unknown> | undefined;
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, async ({ request }) => {
        const action = request.headers.get('next-action');
        if (action === SEED_SNAPSHOT.hashes.runArchitecture) {
          const body = (await request.json()) as [{ architectureConfig: Record<string, unknown> }];
          sentConfig = body[0]?.architectureConfig;
          return HttpResponse.text(envelope('{"history_id":"h-2"}'));
        }
        return HttpResponse.text('not found', { status: 404 });
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    const { historyId } = await client.generate({
      prompt: 'blend these',
      image: 'https://cdn/first.jpg',
      additionalImages: ['https://cdn/second.jpg', 'https://cdn/third.jpg'],
    });

    // Assert
    expect(historyId).toBe('h-2');
    expect(sentConfig?.image).toBe('https://cdn/first.jpg');
    expect(sentConfig?.additional_images).toEqual([
      'https://cdn/second.jpg',
      'https://cdn/third.jpg',
    ]);
  });

  it('places references into architectureConfig.references with the character shape', async () => {
    // Arrange
    let sentConfig: Record<string, unknown> | undefined;
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, async ({ request }) => {
        if (request.headers.get('next-action') !== SEED_SNAPSHOT.hashes.runArchitecture) {
          return HttpResponse.text('not found', { status: 404 });
        }
        const body = (await request.json()) as [{ architectureConfig: Record<string, unknown> }];
        sentConfig = body[0]?.architectureConfig;
        return HttpResponse.text(envelope('{"history_id":"h-3"}'));
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    await client.generate({
      prompt: 'warm tones',
      references: [
        { id: 'r-1', name: 'ref', username: 'ref-aaaa', image_url: 'https://cdn/ref.jpg' },
      ],
    });

    // Assert
    expect(sentConfig?.references).toEqual([
      {
        id: 'r-1',
        name: 'ref',
        username: 'ref-aaaa',
        image_url: 'https://cdn/ref.jpg',
        audio_url: '$undefined',
      },
    ]);
  });
});

const BETA = 'https://beta.mage.space';

/** Beta action hashes injected via discovery (beta has no bundled seed). */
const BETA_HASHES = {
  createUserSession: 'b0a5e5510',
  runArchitecture: 'b0a4c4001',
  getHistoryPaginated: 'b0415700a',
  cancelArchitectureJob: 'b0ca4ce10',
  getCreationsPaginated: 'b0c4ea10e',
};

/** A chunk exposing every beta hash the generation/history flows need. */
const betaChunk =
  `(0,i.createServerReference)("${BETA_HASHES.createUserSession}",i.c,void 0,i.f,"createUserSession")` +
  `(0,i.createServerReference)("${BETA_HASHES.runArchitecture}",i.c,void 0,i.f,"runArchitecture")` +
  `(0,i.createServerReference)("${BETA_HASHES.getHistoryPaginated}",i.c,void 0,i.f,"getHistoryPaginated")` +
  `(0,i.createServerReference)("${BETA_HASHES.cancelArchitectureJob}",i.c,void 0,i.f,"cancelArchitectureJob")` +
  `(0,i.createServerReference)("${BETA_HASHES.getCreationsPaginated}",i.c,void 0,i.f,"getCreationsPaginated")`;

const betaHtml = '<script src="/_next/static/chunks/beta.js"></script>';

/** Discovery handlers for the beta host (pages + the single chunk). */
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

describe('MageSpaceClient generation on beta (paginated poll strategy)', () => {
  it('submits with generationMode unlimited and resolves via the paginated poll (never getHistoryById)', async () => {
    // Arrange
    let getHistoryByIdRequested = false;
    let submittedMode: unknown;
    let historyPagePolls = 0;
    server.use(
      tokenHandler,
      ...betaDiscoveryHandlers(),
      http.post(`${BETA}/explore`, async ({ request }) => {
        const action = request.headers.get('next-action');
        if (action === BETA_HASHES.runArchitecture) {
          const body = (await request.json()) as [{ generationMode: unknown }];
          submittedMode = body[0]?.generationMode;
          return HttpResponse.text(envelope('{"history_id":"h-beta"}'));
        }
        // getHistoryById must never be requested on beta.
        getHistoryByIdRequested = true;
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
          const args = (await request.json()) as [string, number, number, { status: string }];
          const status = args[3]?.status;
          historyPagePolls += 1;
          // The running job is only visible under the 'running' filter; once it
          // completes it appears under the terminal ('$undefined') sweep.
          if (status === 'running') {
            const payload =
              historyPagePolls <= 1
                ? '{"histories":[{"id":"h-beta","status":"running","result":null}],"hasMore":false}'
                : '{"histories":[],"hasMore":false}';
            return HttpResponse.text(envelope(payload));
          }
          return HttpResponse.text(
            envelope(
              '{"histories":[{"id":"h-beta","status":"success","result":{"data":{"image":"https://cdn/beta.jpg"}}}],"hasMore":false}',
            ),
          );
        }
        return HttpResponse.text('not found', { status: 404 });
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt', fallback: { start: 'beta' } });

    // Act
    const { historyId } = await client.generate({ prompt: 'a red fox on beta' });
    const result = await client.waitForResult(historyId, { intervalMs: 1, timeoutMs: 5000 });

    // Assert
    expect(client.getActiveTarget()).toBe('beta');
    expect(historyId).toBe('h-beta');
    expect(result.status).toBe('success');
    expect(result.result?.data.image).toBe('https://cdn/beta.jpg');
    expect(submittedMode).toBe('unlimited');
    expect(getHistoryByIdRequested).toBe(false);
  });
});
