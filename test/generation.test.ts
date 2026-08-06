import { http, HttpResponse } from 'msw';
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
            envelope('{"id":"h-1","status":"success","result":{"data":{"image":"https://cdn/x.jpg"}}}'),
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
});
