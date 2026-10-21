/**
 * Per-host {@link Target} descriptors.
 *
 * mage.space is migrating from production (`https://www.mage.space`) to a new
 * portal (`https://beta.mage.space`). Rather than hard-coding one base URL and
 * one action-name set, each host is modelled as a `Target` so host differences
 * (renamed actions, poll strategy) live in a single table. The client holds an
 * ordered chain `[production, beta]` and advances to the next target only when
 * the active host can no longer serve a required action.
 */

/** Hosts the client can talk to. */
export type TargetKey = 'production' | 'beta';

/** How a single history-status read is performed on a given host. */
export type PollStrategy = 'byId' | 'paginated';

/**
 * Logical operations the generation/history services invoke, decoupled from the
 * host-specific wire names. `createUserSession` is intentionally NOT a member:
 * it is resolved by its literal name on both hosts (see `lib/auth.ts`).
 */
export type LogicalAction =
  | 'submitGeneration'
  | 'getHistoryById'
  | 'cancelJob'
  | 'listHistory'
  | 'listCreations';

/** A single host the client can target. */
export interface Target {
  readonly key: TargetKey;
  readonly baseUrl: string;
  /** logical name → host-specific wire name; unlisted names resolve to themselves. */
  readonly actionNames: Readonly<Partial<Record<LogicalAction, string>>>;
  readonly pollStrategy: PollStrategy;
}

/** Resolve a logical action to its host-specific wire name (identity if unlisted). */
export function resolveActionName(target: Target, logical: LogicalAction): string {
  return target.actionNames[logical] ?? logical;
}

/**
 * Production target.
 *
 * @remarks
 * Maps each logical action to the wire name the current production deploy
 * actually serves (all VERIFIED against `lib/seed.ts` / the existing MSW tests):
 * `submitGeneration → runArchitecture`, `cancelJob → cancelArchitectureJob`,
 * `listHistory → getHistoryPaginated`, `listCreations → getCreationsPaginatedParallel`,
 * and `getHistoryById → getHistoryById` (identity). The table is explicit rather
 * than empty so production behaviour is reproduced exactly regardless of the
 * logical-name vocabulary.
 */
export const PRODUCTION_TARGET: Target = {
  key: 'production',
  baseUrl: 'https://www.mage.space',
  actionNames: {
    submitGeneration: 'runArchitecture',
    getHistoryById: 'getHistoryById',
    cancelJob: 'cancelArchitectureJob',
    listHistory: 'getHistoryPaginated',
    listCreations: 'getCreationsPaginatedParallel',
  },
  pollStrategy: 'byId',
};

/**
 * Beta target. Beta facts are assumptions pending a reverse-engineering capture
 * under `docs/api/beta` — treat them as unverified until that doc lands.
 */
export const BETA_TARGET: Target = {
  key: 'beta',
  baseUrl: 'https://beta.mage.space',
  actionNames: {
    // ASSUMED (pending docs/api/beta) — source: brief, re-verify via rev-eng
    submitGeneration: 'runArchitecture',
    // ASSUMED (pending docs/api/beta) — source: brief, re-verify via rev-eng
    cancelJob: 'cancelArchitectureJob',
    // ASSUMED (pending docs/api/beta) — source: brief, re-verify via rev-eng
    listHistory: 'getHistoryPaginated',
    // ASSUMED (pending docs/api/beta) — getHistoryById is absent on beta; poll via pagination
    listCreations: 'getCreationsPaginated',
  },
  // ASSUMED (pending docs/api/beta) — source: brief, re-verify via rev-eng
  pollStrategy: 'paginated',
};

/** Default ordered fallback chain: production first, then beta. */
export const DEFAULT_TARGET_CHAIN: readonly Target[] = [PRODUCTION_TARGET, BETA_TARGET];

/** Page size used by the beta paginated poll strategy. */
export const PAGINATED_POLL_PAGE_SIZE = 20;

/** Maximum number of pages the beta paginated poll strategy scans per read. */
export const PAGINATED_POLL_MAX_PAGES = 10;
