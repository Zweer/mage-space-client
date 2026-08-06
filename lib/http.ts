/**
 * Internal HTTP client for Next.js Server Action calls.
 *
 * Every call is a `POST` to a page path with a `next-action` header carrying the
 * action hash, a JSON-array body, and an RSC response that is parsed into the
 * action's return value. A 404 is treated as a stale hash: the registry is
 * invalidated and the call is retried once against freshly discovered hashes.
 */
import type { ActionRegistry } from './actions.js';
import { MageSpaceError } from './errors.js';
import { parseServerActionResponse } from './rsc.js';
import type { FetchLike } from './types.js';

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

export interface CallActionParams {
  /** Server Action function name (resolved to a hash via the registry). */
  action: string;
  /** Page path to POST to (e.g. `/explore`, `/creations`). */
  path: string;
  /** Request body — always a JSON array of arguments. */
  args: unknown[];
  /** `__session` cookie value for authenticated actions. */
  session?: string;
}

export interface CallActionResult<T> {
  data: T;
  headers: Headers;
  deploymentId: string;
}

export class HttpClient {
  constructor(
    private readonly registry: ActionRegistry,
    private readonly fetchImpl: FetchLike,
    private readonly baseUrl: string,
    private readonly userAgent: string = DEFAULT_USER_AGENT,
  ) {}

  async callAction<T = unknown>(
    params: CallActionParams,
    retried = false,
  ): Promise<CallActionResult<T>> {
    const { hash, deploymentId } = await this.registry.getHash(params.action);

    const headers: Record<string, string> = {
      accept: 'text/x-component',
      'content-type': 'text/plain;charset=UTF-8',
      'next-action': hash,
      'x-deployment-id': deploymentId,
      origin: this.baseUrl,
      referer: `${this.baseUrl}${params.path}`,
      'user-agent': this.userAgent,
    };
    if (params.session !== undefined) {
      headers.cookie = `__session=${params.session}`;
    }

    const res = await this.fetchImpl(`${this.baseUrl}${params.path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params.args),
    });

    // A stale (post-deploy) hash surfaces as a 404: rediscover and retry once.
    if (res.status === 404 && !retried) {
      await this.registry.invalidate();
      return this.callAction<T>(params, true);
    }
    if (!res.ok) {
      const body = await safeText(res);
      const suffix = body.length > 0 ? ` — ${body.slice(0, 200)}` : '';
      throw new MageSpaceError(`Action "${params.action}" failed: HTTP ${res.status}${suffix}`);
    }

    const text = await res.text();
    const data = parseServerActionResponse<T>(text);
    return {
      data,
      headers: res.headers,
      deploymentId: res.headers.get('x-deployment-id') ?? deploymentId,
    };
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '';
  }
}
