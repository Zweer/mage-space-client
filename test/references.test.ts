import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { MageSpaceClient } from '../lib/index.js';
import { SEED_SNAPSHOT } from '../lib/seed.js';

const BASE = 'https://www.mage.space';

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

describe('MageSpaceClient references', () => {
  it('lists the caller own references for a modality', async () => {
    // Arrange
    let sentArgs: unknown;
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, async ({ request }) => {
        if (request.headers.get('next-action') !== SEED_SNAPSHOT.hashes.getReferences) {
          return HttpResponse.text('not found', { status: 404 });
        }
        sentArgs = await request.json();
        return HttpResponse.text(
          envelope(
            '[{"id":"r-1","name":"pose-1","username":"pose1-aaaa","image_url":"https://cdn/r.jpg","audio_url":null,"variant":"pose"}]',
          ),
        );
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    const refs = await client.references.list('image');

    // Assert
    expect(refs).toHaveLength(1);
    expect(refs[0]?.variant).toBe('pose');
    expect(sentArgs).toEqual(['uid-1', 'image']);
  });

  it('browses the paginated reference feed with filters', async () => {
    // Arrange
    let sentArgs: unknown;
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, async ({ request }) => {
        if (request.headers.get('next-action') !== SEED_SNAPSHOT.hashes.getReferencesPaginated) {
          return HttpResponse.text('not found', { status: 404 });
        }
        sentArgs = await request.json();
        return HttpResponse.text(envelope('{"references":[{"id":"r-2"}],"hasMore":false}'));
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    const page = await client.references.listPaginated({
      limit: 5,
      featuredOnly: true,
      orderBy: 'newest',
    });

    // Assert
    expect(page.hasMore).toBe(false);
    expect(page.references[0]?.id).toBe('r-2');
    expect(sentArgs).toEqual([
      5,
      0,
      { visibility: 'public', orderBy: 'newest', featuredOnly: true, modality: 'image' },
    ]);
  });

  it('updates a reference and returns the updated object', async () => {
    // Arrange
    let sentArgs: unknown;
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, async ({ request }) => {
        if (request.headers.get('next-action') !== SEED_SNAPSHOT.hashes.updateReference) {
          return HttpResponse.text('not found', { status: 404 });
        }
        sentArgs = await request.json();
        return HttpResponse.text(
          envelope(
            '{"id":"r-3","name":"renamed","image_url":"https://cdn/r.jpg","audio_url":null}',
          ),
        );
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    const ref = await client.references.update('r-3', { name: 'renamed' });

    // Assert
    expect(ref.name).toBe('renamed');
    expect(sentArgs).toEqual(['r-3', { name: 'renamed' }]);
  });
});
