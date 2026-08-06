/**
 * Firebase authentication: refresh token → ID token → session cookie.
 *
 * The refresh token is the only long-lived credential the caller supplies.
 * From it we mint a Firebase ID token (~1h) via the Secure Token REST API, and
 * exchange that for a `__session` cookie (~24h) via the `createUserSession`
 * Server Action. Both are cached and refreshed 5 minutes before expiry.
 */
import { decodeJwt } from 'jose';
import { AuthError } from './errors.js';
import type { HttpClient } from './http.js';
import type { AuthTokens, FetchLike, SessionState } from './types.js';

const DEFAULT_FIREBASE_API_KEY = 'AIzaSyAzUV2NNUOlLTL04jwmUw9oLhjteuv6Qr4';
const SECURE_TOKEN_URL = 'https://securetoken.googleapis.com/v1/token';
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;
const SESSION_DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const ID_TOKEN_DEFAULT_TTL_S = 3600;

interface SecureTokenResponse {
  id_token?: string;
  refresh_token?: string;
  user_id?: string;
  expires_in?: string;
}

export interface AuthManagerOptions {
  refreshToken: string;
  http: HttpClient;
  fetch: FetchLike;
  firebaseApiKey?: string;
  /** Page path for the `createUserSession` action (default `/creations`). */
  sessionPath?: string;
}

export class AuthManager {
  private refreshToken: string;
  private readonly http: HttpClient;
  private readonly fetchImpl: FetchLike;
  private readonly apiKey: string;
  private readonly sessionPath: string;
  private tokens: AuthTokens | null = null;
  private session: SessionState | null = null;

  constructor(opts: AuthManagerOptions) {
    this.refreshToken = opts.refreshToken;
    this.http = opts.http;
    this.fetchImpl = opts.fetch;
    this.apiKey = opts.firebaseApiKey ?? DEFAULT_FIREBASE_API_KEY;
    this.sessionPath = opts.sessionPath ?? '/creations';
  }

  /** Return a valid Firebase ID token, refreshing via the refresh token if needed. */
  async getIdToken(): Promise<string> {
    if (this.tokens !== null && Date.now() < this.tokens.expiresAt - EXPIRY_BUFFER_MS) {
      return this.tokens.idToken;
    }
    return (await this.refreshTokens()).idToken;
  }

  /** Return the Firebase uid (fetching an ID token first if necessary). */
  async getUserId(): Promise<string> {
    if (this.tokens !== null) {
      return this.tokens.userId;
    }
    return (await this.refreshTokens()).userId;
  }

  /** Return a valid `__session` cookie, creating one via `createUserSession` if needed. */
  async getSession(): Promise<string> {
    if (this.session !== null && Date.now() < this.session.expiresAt - EXPIRY_BUFFER_MS) {
      return this.session.cookie;
    }
    const idToken = await this.getIdToken();
    const result = await this.http.callAction<unknown>({
      action: 'createUserSession',
      path: this.sessionPath,
      args: [idToken],
    });
    const cookie = extractSessionCookie(result.headers);
    if (cookie === null) {
      throw new AuthError('createUserSession did not return a __session cookie');
    }
    const expiresAt = jwtExpiryMs(cookie) ?? Date.now() + SESSION_DEFAULT_TTL_MS;
    this.session = { cookie, expiresAt };
    return cookie;
  }

  private async refreshTokens(): Promise<AuthTokens> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
    });
    const res = await this.fetchImpl(`${SECURE_TOKEN_URL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!res.ok) {
      throw new AuthError(
        `Token refresh failed: HTTP ${res.status} (refresh token may be invalid or revoked)`,
      );
    }
    const json = (await res.json()) as SecureTokenResponse;
    if (json.id_token === undefined || json.user_id === undefined) {
      throw new AuthError('Token refresh response missing id_token/user_id');
    }
    if (json.refresh_token !== undefined) {
      this.refreshToken = json.refresh_token;
    }
    const ttlS = json.expires_in === undefined ? ID_TOKEN_DEFAULT_TTL_S : Number(json.expires_in);
    const expiresAt = jwtExpiryMs(json.id_token) ?? Date.now() + ttlS * 1000;
    this.tokens = {
      idToken: json.id_token,
      refreshToken: this.refreshToken,
      userId: json.user_id,
      expiresAt,
    };
    return this.tokens;
  }
}

/** Read the `exp` claim (ms) from a JWT, or `null` if it cannot be decoded. */
function jwtExpiryMs(jwt: string): number | null {
  try {
    const { exp } = decodeJwt(jwt);
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Extract the `__session` value from a `Set-Cookie` response header. */
function extractSessionCookie(headers: Headers): string | null {
  const withGetSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  const list =
    typeof withGetSetCookie.getSetCookie === 'function'
      ? withGetSetCookie.getSetCookie()
      : headers.get('set-cookie') !== null
        ? [headers.get('set-cookie') as string]
        : [];
  for (const cookie of list) {
    const match = /(?:^|;\s*)__session=([^;]+)/.exec(cookie);
    if (match !== null && match[1] !== undefined) {
      return match[1];
    }
  }
  return null;
}
