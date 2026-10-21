/**
 * A {@link TargetContext} bundles one host's {@link ActionRegistry} and
 * {@link HttpClient} so the client can hold one pair per target and switch by
 * selecting the other pair (rather than mutating a shared `baseUrl`).
 */
import { ActionRegistry, InMemoryActionCache } from './actions.js';
import { HttpClient } from './http.js';
import type { Target } from './targets.js';
import type { ActionCache, ActionSnapshot, FetchLike } from './types.js';

/** The per-host registry + HTTP client bound to a single {@link Target}. */
export interface TargetContext {
  readonly target: Target;
  readonly registry: ActionRegistry;
  readonly http: HttpClient;
}

/** Dependencies shared across every target context the client builds. */
export interface TargetContextDeps {
  fetch: FetchLike;
  userAgent?: string;
  /** Caller-supplied cache — used for the production target only. */
  cache?: ActionCache;
  /** Production seed snapshot — passed to the production target only. */
  seed?: ActionSnapshot;
}

/**
 * Build the registry + HTTP client for a single target.
 *
 * @remarks
 * The caller's `cache` and the production `seed` are production-only concerns:
 * the bundled seed holds production hashes and the single-slot cache cannot be
 * namespaced per host. Non-production targets always discover fresh with their
 * own {@link InMemoryActionCache} and no seed.
 */
export function createTargetContext(target: Target, deps: TargetContextDeps): TargetContext {
  const isProduction = target.key === 'production';
  const registry = new ActionRegistry({
    fetch: deps.fetch,
    baseUrl: target.baseUrl,
    cache: isProduction ? deps.cache : new InMemoryActionCache(),
    seed: isProduction ? deps.seed : undefined,
  });
  const http = new HttpClient(registry, deps.fetch, target.baseUrl, target.key, deps.userAgent);
  return { target, registry, http };
}
