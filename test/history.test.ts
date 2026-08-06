import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { MageSpaceClient } from '../lib/index.js';
import { SEED_SNAPSHOT } from '../lib/seed.js';

const BASE = 'https://www.mage.space';

function envelope(payload: string): string {
  return `0:{"a":"$@1","f":"","b":"build"}\n1:${payload}\n`;
}

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MageSpaceClient history', () => {
  it('lists past generations for the authenticated user', async () => {
    // Arrange
    let historyArgs: unknown[] = [];
    server.use(
      http.post('https://securetoken.googleapis.com/v1/token', () =>
        HttpResponse.json({ id_token: 'a.b.c', user_id: 'uid-1', expires_in: '3600' }),
      ),
      http.post(`${BASE}/creations`, async ({ request }) => {
        const action = request.headers.get('next-action');
        if (action === SEED_SNAPSHOT.hashes.createUserSession) {
          return HttpResponse.text(envelope('null'), {
            headers: { 'set-cookie': '__session=sess-abc; Path=/; HttpOnly' },
          });
        }
        if (action === SEED_SNAPSHOT.hashes.getHistoryPaginated) {
          historyArgs = (await request.json()) as unknown[];
          return HttpResponse.text(
            envelope(
              '{"histories":[{"id":"h-1","status":"success","result":{"data":{"image":"https://cdn/x.jpg"}}}],"hasMore":false}',
            ),
          );
        }
        return HttpResponse.text('not found', { status: 404 });
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    const page = await client.listHistory({ limit: 5 });

    // Assert
    expect(page.hasMore).toBe(false);
    expect(page.histories).toHaveLength(1);
    expect(page.histories[0]?.result?.data.image).toBe('https://cdn/x.jpg');
    expect(historyArgs[0]).toBe('uid-1');
    expect(historyArgs[1]).toBe(5);
  });
});
