import { describe, expect, it } from 'vitest';
import { ActionRegistry } from '../lib/actions.js';
import { AuthManager } from '../lib/auth.js';
import { AuthError } from '../lib/errors.js';
import { HttpClient } from '../lib/http.js';
import { SEED_SNAPSHOT } from '../lib/seed.js';
import type { FetchLike } from '../lib/types.js';

const BASE = 'https://www.mage.space';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
  });
}

function envelope(payload: string): string {
  return `0:{"a":"$@1","f":"","b":"build"}\n1:${payload}\n`;
}

function makeAuth(fetchImpl: FetchLike): AuthManager {
  const registry = new ActionRegistry({ fetch: fetchImpl, baseUrl: BASE, seed: SEED_SNAPSHOT });
  const http = new HttpClient(registry, fetchImpl, BASE);
  return new AuthManager({ refreshToken: 'rt', http, fetch: fetchImpl });
}

describe('AuthManager', () => {
  it('exchanges the refresh token for an ID token and uid', async () => {
    // Arrange
    const fetchImpl: FetchLike = async (input) => {
      if (input.includes('securetoken.googleapis.com')) {
        return jsonResponse({
          id_token: 'header.payload.sig',
          refresh_token: 'rotated',
          user_id: 'uid-1',
          expires_in: '3600',
        });
      }
      return new Response('not found', { status: 404 });
    };
    const auth = makeAuth(fetchImpl);

    // Act
    const token = await auth.getIdToken();
    const uid = await auth.getUserId();

    // Assert
    expect(token).toBe('header.payload.sig');
    expect(uid).toBe('uid-1');
  });

  it('creates a __session cookie via createUserSession', async () => {
    // Arrange
    const fetchImpl: FetchLike = async (input) => {
      if (input.includes('securetoken.googleapis.com')) {
        return jsonResponse({ id_token: 'a.b.c', user_id: 'uid-1', expires_in: '3600' });
      }
      if (input === `${BASE}/creations`) {
        return new Response(envelope('null'), {
          headers: { 'set-cookie': '__session=sess-abc; Path=/; HttpOnly' },
        });
      }
      return new Response('not found', { status: 404 });
    };
    const auth = makeAuth(fetchImpl);

    // Act
    const session = await auth.getSession();

    // Assert
    expect(session).toBe('sess-abc');
  });

  it('throws AuthError when the refresh token is rejected', async () => {
    // Arrange
    const fetchImpl: FetchLike = async () => new Response('bad', { status: 400 });
    const auth = makeAuth(fetchImpl);

    // Act & Assert
    await expect(auth.getIdToken()).rejects.toThrow(AuthError);
  });
});
