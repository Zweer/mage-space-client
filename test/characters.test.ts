import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
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

describe('MageSpaceClient characters', () => {
  it('searches characters and returns the parsed result', async () => {
    // Arrange
    let sentBody: unknown;
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, async ({ request }) => {
        if (
          request.headers.get('next-action') !== SEED_SNAPSHOT.hashes.getMentionSuggestionsParallel
        ) {
          return HttpResponse.text('not found', { status: 404 });
        }
        sentBody = await request.json();
        return HttpResponse.text(
          envelope(
            '{"characters":[{"id":"c-1","name":"echoes-cri","username":"echoescri-c6hj","image_url":"https://cdn/x.jpg","audio_url":null}],"references":[],"moodboards":[]}',
          ),
        );
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    const result = await client.characters.search({ query: 'echoes' });

    // Assert
    expect(result.characters).toHaveLength(1);
    expect(result.characters[0]?.username).toBe('echoescri-c6hj');
    expect(sentBody).toEqual([
      {
        query: 'echoes',
        uid: 'uid-1',
        limit: 10,
        includePublicReferences: false,
        referenceModalities: ['image', 'audio'],
      },
    ]);
  });

  it('creates a character and returns the created object with an id', async () => {
    // Arrange
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, ({ request }) => {
        if (request.headers.get('next-action') !== SEED_SNAPSHOT.hashes.createCharacter) {
          return HttpResponse.text('not found', { status: 404 });
        }
        return HttpResponse.text(
          envelope(
            '{"id":"new-1","name":"my-character","username":"mychar-abcd","image_url":"https://cdn/y.jpg","audio_url":null,"visibility":"private"}',
          ),
        );
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    const character = await client.characters.create({
      name: 'my-character',
      username: 'mychar-abcd',
      image_url: 'https://cdn/y.jpg',
    });

    // Assert
    expect(character.id).toBe('new-1');
    expect(character.visibility).toBe('private');
  });

  it('uploads a character image and returns the CDN URL', async () => {
    // Arrange
    let sentArgs: unknown;
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, async ({ request }) => {
        if (request.headers.get('next-action') !== SEED_SNAPSHOT.hashes.uploadCharacterImage) {
          return HttpResponse.text('not found', { status: 404 });
        }
        sentArgs = await request.json();
        return HttpResponse.text(
          envelope('"https://cdn3.mage.space/characters/uid-1/image/abc.jpg"'),
        );
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    const url = await client.characters.uploadImage('data:image/jpeg;base64,/9j/AAA');

    // Assert
    expect(url).toBe('https://cdn3.mage.space/characters/uid-1/image/abc.jpg');
    expect(sentArgs).toEqual(['data:image/jpeg;base64,/9j/AAA', 'uid-1']);
  });

  it('returns null from get() when the character does not exist', async () => {
    // Arrange
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, ({ request }) => {
        if (request.headers.get('next-action') !== SEED_SNAPSHOT.hashes.getCharacter) {
          return HttpResponse.text('not found', { status: 404 });
        }
        return HttpResponse.text(envelope('null'));
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    const character = await client.characters.get('missing-id');

    // Assert
    expect(character).toBeNull();
  });

  it('deletes a character (resolves without a value)', async () => {
    // Arrange
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, ({ request }) => {
        if (request.headers.get('next-action') !== SEED_SNAPSHOT.hashes.deleteCharacter) {
          return HttpResponse.text('not found', { status: 404 });
        }
        return HttpResponse.text(envelope('"$undefined"'));
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act & Assert
    await expect(client.characters.delete('c-1')).resolves.toBeUndefined();
  });

  it('paginates characters with uid/visibility filters', async () => {
    // Arrange
    let sentArgs: unknown;
    server.use(
      tokenHandler,
      sessionHandler,
      http.post(`${BASE}/explore`, async ({ request }) => {
        if (request.headers.get('next-action') !== SEED_SNAPSHOT.hashes.getCharactersPaginated) {
          return HttpResponse.text('not found', { status: 404 });
        }
        sentArgs = await request.json();
        return HttpResponse.text(envelope('{"characters":[{"id":"c-9"}],"hasMore":true}'));
      }),
    );
    const client = new MageSpaceClient({ refreshToken: 'rt' });

    // Act
    const page = await client.characters.listPaginated({
      limit: 20,
      uid: 'uid-1',
      visibility: 'private',
    });

    // Assert
    expect(page.hasMore).toBe(true);
    expect(page.characters[0]?.id).toBe('c-9');
    expect(sentArgs).toEqual([20, 0, { uid: 'uid-1', visibility: 'private' }]);
  });
});
