/**
 * Action-hash discovery and caching.
 *
 * mage.space's Server Action hashes change on every Vercel deploy, so the client
 * discovers them from the page's JS bundles and caches the result. The registry
 * serves hashes from a warm seed / cache and only re-discovers when a hash goes
 * stale (a request 404s) or when explicitly refreshed.
 */
import { DiscoveryError } from './errors.js';
import type { ActionCache, ActionHashes, ActionName, ActionSnapshot, FetchLike } from './types.js';

/** `createServerReference)("<hash>", callServer, void 0, findSourceMapURL, "<fn>")` */
const CREATE_SERVER_REF_RE = /createServerReference\)\("([0-9a-f]+)"[^)]*?"([^"]+)"\)/g;
/** `/_next/static/chunks/....js` references in the page HTML. */
const CHUNK_RE = /\/_next\/static\/chunks\/[^"'`()\s]+?\.js/g;
/**
 * Default pages scraped during discovery. Server Actions are split per route, so
 * a single page misses route-specific actions (e.g. `deleteReference` lives only
 * in the `/references` bundle) — scrape the main routes and union their chunks.
 */
const DISCOVERY_PAGES = ['/explore', '/creations', '/characters', '/references'];

/** Default in-process snapshot cache. */
export class InMemoryActionCache implements ActionCache {
  private snapshot: ActionSnapshot | null = null;

  async load(): Promise<ActionSnapshot | null> {
    return this.snapshot;
  }

  async save(snapshot: ActionSnapshot): Promise<void> {
    this.snapshot = snapshot;
  }
}

export interface DiscoveryOptions {
  fetch: FetchLike;
  baseUrl: string;
  /** Single page to scrape for chunk references (overrides {@link discoveryPaths}). */
  discoveryPath?: string;
  /** Pages to scrape and union (default: the main app routes). */
  discoveryPaths?: string[];
}

/** Result of {@link listDiscoveryChunks}: the JS chunk paths to scrape. */
export interface ChunkListResult {
  /** Vercel deployment id from the first page's `x-deployment-id` (`''` if none). */
  deploymentId: string;
  /** De-duplicated, insertion-ordered `/_next/static/chunks/*.js` paths. */
  chunkPaths: string[];
}

/**
 * The action names the portal actually invokes.
 *
 * @remarks
 * Verified against `lib/auth.ts`, `lib/generation.ts`/`lib/history.ts` (via
 * `resolveActionName` on `PRODUCTION_TARGET`), `lib/characters.ts`, and
 * `lib/references.ts`. A batched, subrequest-capped caller (e.g. a Cloudflare
 * Worker) uses this list to know when it has discovered everything it needs and
 * can early-exit without scraping the remaining chunks. Every name is a key in
 * {@link SEED_SNAPSHOT}.hashes.
 */
const REQUIRED_ACTIONS = [
  'createUserSession',
  'getHistoryPaginated',
  'getHistoryById',
  'runArchitecture',
  'cancelArchitectureJob',
  'getCreationsPaginatedParallel',
  'getMentionSuggestionsParallel',
  'createCharacter',
  'updateCharacter',
  'deleteCharacter',
  'getCharacter',
  'getCharacters',
  'publishCharacter',
  'unpublishCharacter',
  'getEntityImageUploadUrl',
  'getCharactersPaginated',
  'generateCharacterVoice',
  'followCharacter',
  'unfollowCharacter',
  'createReference',
  'updateReference',
  'deleteReference',
  'getReferences',
  'getReferencesPaginated',
] as const satisfies readonly ActionName[];

/**
 * The action names a batched discovery caller must find before it can stop.
 *
 * @remarks
 * These are the actions the portal invokes; once a batched caller has hashes for
 * all of them it can early-exit instead of scraping every remaining chunk.
 */
export function requiredActionsForClient(): ActionName[] {
  return [...REQUIRED_ACTIONS];
}

/**
 * List the JS chunk paths referenced by the discovery pages.
 *
 * @remarks
 * Issues at most one GET per page (`<= pages.length` subrequests), so a caller on
 * a subrequest-capped host (e.g. Cloudflare Workers free plan) can list chunks
 * cheaply and then scrape them in bounded batches via {@link scrapeChunks}.
 *
 * @throws {DiscoveryError} when no JS chunk references are found.
 */
export async function listDiscoveryChunks(opts: {
  fetch: FetchLike;
  baseUrl: string;
  pages?: string[];
}): Promise<ChunkListResult> {
  const { fetch, baseUrl } = opts;
  const pages = opts.pages ?? DISCOVERY_PAGES;

  let deploymentId = '';
  const chunkPaths = new Set<string>();
  for (const page of pages) {
    let res: Response;
    try {
      res = await fetch(`${baseUrl}${page}`, { headers: { accept: 'text/html' } });
    } catch {
      // A single unreachable page must not abort discovery.
      continue;
    }
    if (!res.ok) {
      continue;
    }
    if (deploymentId === '') {
      deploymentId = res.headers.get('x-deployment-id') ?? '';
    }
    const html = await res.text();
    for (const match of html.matchAll(CHUNK_RE)) {
      const chunkPath = match[0];
      if (chunkPath !== undefined) {
        chunkPaths.add(chunkPath);
      }
    }
  }
  if (chunkPaths.size === 0) {
    throw new DiscoveryError('No JS chunk references found in discovery pages');
  }
  return { deploymentId, chunkPaths: [...chunkPaths] };
}

/**
 * Scrape a specific set of JS chunks for `createServerReference(...)` hashes.
 *
 * @remarks
 * Fetches ONLY the passed `chunkPaths` (one subrequest each), so a caller can
 * process chunks in batches sized to its subrequest budget and merge the partial
 * hash maps across batches. First hash wins per function name, mirroring
 * {@link discoverActions}. Never throws on an empty result — a single batch may
 * legitimately find nothing.
 */
export async function scrapeChunks(opts: {
  fetch: FetchLike;
  baseUrl: string;
  chunkPaths: string[];
}): Promise<{ deploymentId: string; hashes: ActionHashes }> {
  const { fetch, baseUrl, chunkPaths } = opts;

  let deploymentId = '';
  const hashes: ActionHashes = {};
  await Promise.all(
    chunkPaths.map(async (path) => {
      try {
        const chunkRes = await fetch(`${baseUrl}${path}`, {
          headers: { accept: 'application/javascript' },
        });
        if (!chunkRes.ok) {
          return;
        }
        // Chunk responses are served by the deployment and usually carry the id,
        // even when CDN-cached page HTML omits it.
        if (deploymentId === '') {
          deploymentId = chunkRes.headers.get('x-deployment-id') ?? '';
        }
        const js = await chunkRes.text();
        for (const match of js.matchAll(CREATE_SERVER_REF_RE)) {
          const hash = match[1];
          const fn = match[2];
          if (hash !== undefined && fn !== undefined && !(fn in hashes)) {
            hashes[fn] = hash;
          }
        }
      } catch {
        // A single failed chunk must not abort the rest.
      }
    }),
  );

  return { deploymentId, hashes };
}

/**
 * Discover the current Server Action hashes by scraping the page HTML for JS
 * chunk URLs and extracting `createServerReference(...)` calls from each chunk.
 *
 * @remarks
 * Composes {@link listDiscoveryChunks} (page GETs) and {@link scrapeChunks} (over
 * all discovered chunks) into the full snapshot. Unsuitable for subrequest-capped
 * hosts, which should batch {@link scrapeChunks} instead.
 *
 * @throws {DiscoveryError} on network failure or when nothing is discovered.
 */
export async function discoverActions(opts: DiscoveryOptions): Promise<ActionSnapshot> {
  const { fetch, baseUrl } = opts;
  const pages =
    opts.discoveryPath !== undefined
      ? [opts.discoveryPath]
      : (opts.discoveryPaths ?? DISCOVERY_PAGES);

  const { deploymentId: pageDeploymentId, chunkPaths } = await listDiscoveryChunks({
    fetch,
    baseUrl,
    pages,
  });

  const { deploymentId: chunkDeploymentId, hashes } = await scrapeChunks({
    fetch,
    baseUrl,
    chunkPaths,
  });

  if (Object.keys(hashes).length === 0) {
    throw new DiscoveryError('No server action hashes discovered in JS chunks');
  }

  // Fallback: CDN-cached page HTML may omit x-deployment-id; chunk responses
  // are served by the deployment and usually carry it.
  const deploymentId = pageDeploymentId !== '' ? pageDeploymentId : chunkDeploymentId;
  return { deploymentId, hashes, discoveredAt: Date.now() };
}

export interface ActionRegistryOptions {
  fetch: FetchLike;
  baseUrl: string;
  cache?: ActionCache;
  seed?: ActionSnapshot;
  discoveryPath?: string;
  discoveryPaths?: string[];
  /** Re-discover when the snapshot is older than this (ms). 0 = never by age. */
  maxAgeMs?: number;
}

/**
 * Serves action hashes from a warm seed / pluggable cache, discovering lazily and
 * refreshing on staleness. Concurrent refreshes are de-duplicated (single-flight).
 */
export class ActionRegistry {
  private readonly fetch: FetchLike;
  private readonly baseUrl: string;
  private readonly cache: ActionCache;
  private readonly seed: ActionSnapshot | undefined;
  private readonly discoveryPath: string | undefined;
  private readonly discoveryPaths: string[] | undefined;
  private readonly maxAgeMs: number;
  private snapshot: ActionSnapshot | null = null;
  private inflight: Promise<ActionSnapshot> | null = null;

  constructor(opts: ActionRegistryOptions) {
    this.fetch = opts.fetch;
    this.baseUrl = opts.baseUrl;
    this.cache = opts.cache ?? new InMemoryActionCache();
    this.seed = opts.seed;
    this.discoveryPath = opts.discoveryPath;
    this.discoveryPaths = opts.discoveryPaths;
    this.maxAgeMs = opts.maxAgeMs ?? 0;
  }

  private isStale(snapshot: ActionSnapshot): boolean {
    return this.maxAgeMs > 0 && Date.now() - snapshot.discoveredAt > this.maxAgeMs;
  }

  /** Return the current snapshot, loading from cache/seed or discovering as needed. */
  async getSnapshot(): Promise<ActionSnapshot> {
    if (this.snapshot !== null && !this.isStale(this.snapshot)) {
      return this.snapshot;
    }
    const cached = await this.cache.load();
    if (cached !== null && !this.isStale(cached)) {
      this.snapshot = cached;
      return cached;
    }
    if (this.seed !== undefined) {
      this.snapshot = this.seed;
      await this.cache.save(this.seed);
      return this.seed;
    }
    return this.refresh();
  }

  /** Force re-discovery. Concurrent callers share one in-flight discovery. */
  async refresh(): Promise<ActionSnapshot> {
    if (this.inflight !== null) {
      return this.inflight;
    }
    this.inflight = (async () => {
      try {
        const fresh = await discoverActions({
          fetch: this.fetch,
          baseUrl: this.baseUrl,
          discoveryPath: this.discoveryPath,
          discoveryPaths: this.discoveryPaths,
        });
        this.snapshot = fresh;
        await this.cache.save(fresh);
        return fresh;
      } finally {
        this.inflight = null;
      }
    })();
    return this.inflight;
  }

  /** Resolve a function name to its current hash + deployment id. */
  async getHash(action: ActionName | string): Promise<{ hash: string; deploymentId: string }> {
    let snapshot = await this.getSnapshot();
    let hash = snapshot.hashes[action];
    if (hash === undefined) {
      snapshot = await this.refresh();
      hash = snapshot.hashes[action];
    }
    if (hash === undefined) {
      throw new DiscoveryError(`Action "${action}" not found after discovery`, { notFound: true });
    }
    return { hash, deploymentId: snapshot.deploymentId };
  }

  /** Drop the cached snapshot and re-discover (called on a stale 404). */
  async invalidate(): Promise<ActionSnapshot> {
    this.snapshot = null;
    return this.refresh();
  }
}
