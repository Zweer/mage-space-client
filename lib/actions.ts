/**
 * Action-hash discovery and caching.
 *
 * mage.space's Server Action hashes change on every Vercel deploy, so the client
 * discovers them from the page's JS bundles and caches the result. The registry
 * serves hashes from a warm seed / cache and only re-discovers when a hash goes
 * stale (a request 404s) or when explicitly refreshed.
 */
import { DiscoveryError } from './errors.js';
import type { ActionCache, ActionName, ActionSnapshot, FetchLike } from './types.js';

/** `createServerReference)("<hash>", callServer, void 0, findSourceMapURL, "<fn>")` */
const CREATE_SERVER_REF_RE = /createServerReference\)\("([0-9a-f]+)"[^)]*?"([^"]+)"\)/g;
/** `/_next/static/chunks/....js` references in the page HTML. */
const CHUNK_RE = /\/_next\/static\/chunks\/[^"'`()\s]+?\.js/g;

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
  /** Page to scrape for chunk references (default `/explore`). */
  discoveryPath?: string;
}

/**
 * Discover the current Server Action hashes by scraping the page HTML for JS
 * chunk URLs and extracting `createServerReference(...)` calls from each chunk.
 *
 * @throws {DiscoveryError} on network failure or when nothing is discovered.
 */
export async function discoverActions(opts: DiscoveryOptions): Promise<ActionSnapshot> {
  const { fetch, baseUrl } = opts;
  const page = opts.discoveryPath ?? '/explore';

  const res = await fetch(`${baseUrl}${page}`, { headers: { accept: 'text/html' } });
  if (!res.ok) {
    throw new DiscoveryError(`Failed to fetch discovery page ${page}: HTTP ${res.status}`);
  }
  const deploymentId = res.headers.get('x-deployment-id') ?? '';
  const html = await res.text();

  const chunkPaths = new Set<string>();
  for (const match of html.matchAll(CHUNK_RE)) {
    const chunkPath = match[0];
    if (chunkPath !== undefined) {
      chunkPaths.add(chunkPath);
    }
  }
  if (chunkPaths.size === 0) {
    throw new DiscoveryError('No JS chunk references found in discovery page HTML');
  }

  const hashes: ActionSnapshot['hashes'] = {};
  await Promise.all(
    [...chunkPaths].map(async (path) => {
      try {
        const chunkRes = await fetch(`${baseUrl}${path}`, {
          headers: { accept: 'application/javascript' },
        });
        if (!chunkRes.ok) {
          return;
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
        // A single failed chunk must not abort discovery.
      }
    }),
  );

  if (Object.keys(hashes).length === 0) {
    throw new DiscoveryError('No server action hashes discovered in JS chunks');
  }
  return { deploymentId, hashes, discoveredAt: Date.now() };
}

export interface ActionRegistryOptions {
  fetch: FetchLike;
  baseUrl: string;
  cache?: ActionCache;
  seed?: ActionSnapshot;
  discoveryPath?: string;
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
  private readonly maxAgeMs: number;
  private snapshot: ActionSnapshot | null = null;
  private inflight: Promise<ActionSnapshot> | null = null;

  constructor(opts: ActionRegistryOptions) {
    this.fetch = opts.fetch;
    this.baseUrl = opts.baseUrl;
    this.cache = opts.cache ?? new InMemoryActionCache();
    this.seed = opts.seed;
    this.discoveryPath = opts.discoveryPath;
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
      throw new DiscoveryError(`Action "${action}" not found after discovery`);
    }
    return { hash, deploymentId: snapshot.deploymentId };
  }

  /** Drop the cached snapshot and re-discover (called on a stale 404). */
  async invalidate(): Promise<ActionSnapshot> {
    this.snapshot = null;
    return this.refresh();
  }
}
