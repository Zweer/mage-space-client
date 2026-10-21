/**
 * {@link MageSpaceClient} — the public facade that wires together action
 * discovery, authentication, generation, and history.
 *
 * The client models each mage.space host as a {@link Target} and holds an
 * ordered chain (production first, then beta). When the active host can no
 * longer serve a required action, the client advances to the next target and
 * retries once. The switch is sticky for the lifetime of the instance.
 */
import { AuthManager } from './auth.js';
import { CharactersService } from './characters.js';
import { ActionUnavailableError, DiscoveryError } from './errors.js';
import { GenerationService } from './generation.js';
import { HistoryService } from './history.js';
import { ReferencesService } from './references.js';
import { SEED_SNAPSHOT } from './seed.js';
import { createTargetContext, type TargetContext } from './target-context.js';
import { DEFAULT_TARGET_CHAIN, type Target, type TargetKey } from './targets.js';
import type {
  ActionSnapshot,
  ConfirmOptions,
  CreationPage,
  FetchLike,
  GenerateOptions,
  GenerateVideoOptions,
  GenerationResult,
  HistoryItem,
  HistoryPage,
  ListCreationsOptions,
  ListHistoryOptions,
  MageSpaceClientOptions,
  WaitOptions,
} from './types.js';

/** Generation + history services bound to one active {@link Target}. */
interface ServiceBundle {
  target: Target;
  generationService: GenerationService;
  historyService: HistoryService;
}

export class MageSpaceClient {
  private readonly auth: AuthManager;
  private readonly chain: readonly Target[];
  private readonly auto: boolean;
  private readonly contextDeps: {
    fetch: FetchLike;
    userAgent?: string;
    cache?: MageSpaceClientOptions['cache'];
    seed?: ActionSnapshot;
  };
  private readonly contexts: Map<TargetKey, TargetContext> = new Map();
  private activeIndex: number;
  private activeContext: TargetContext;
  private activeBundle: ServiceBundle;

  /**
   * Character management (search, CRUD, pagination, uploads).
   *
   * @remarks
   * Bound to the initial host (production by default) and does not follow an
   * automatic beta fallback. Construct a client with `fallback: { start: 'beta' }`
   * to use these against beta.
   */
  readonly characters: CharactersService;

  /**
   * Reference asset management (upload, create, update, list, feed).
   *
   * @remarks
   * Bound to the initial host (production by default) and does not follow an
   * automatic beta fallback. Construct a client with `fallback: { start: 'beta' }`
   * to use these against beta.
   */
  readonly references: ReferencesService;

  constructor(options: MageSpaceClientOptions) {
    if (!options.refreshToken) {
      throw new Error('MageSpaceClient requires a refreshToken');
    }

    const fetchImpl: FetchLike = options.fetch ?? ((input, init) => fetch(input, init));
    const fallback = options.fallback;
    const baseUrlPinned = typeof options.baseUrl === 'string' && options.baseUrl.length > 0;

    // `baseUrl` pins a single host and is incompatible with fallback tuning.
    if (
      baseUrlPinned &&
      fallback !== undefined &&
      (fallback.chain !== undefined || fallback.start !== undefined || fallback.auto !== undefined)
    ) {
      throw new Error('baseUrl pins a single host and cannot be combined with fallback options');
    }

    if (baseUrlPinned) {
      // Collapse to a single synthetic target reproducing today's single-host behaviour.
      this.chain = [
        {
          key: 'production',
          baseUrl: options.baseUrl as string,
          actionNames: {},
          pollStrategy: 'byId',
        },
      ];
      this.auto = false;
    } else {
      const chain = fallback?.chain ?? DEFAULT_TARGET_CHAIN;
      if (chain.length === 0) {
        throw new Error('fallback.chain must be a non-empty array');
      }
      this.chain = chain;
      this.auto = fallback?.auto ?? true;
    }

    const startKey = baseUrlPinned ? 'production' : (fallback?.start ?? 'production');
    const startIndex = this.chain.findIndex((t) => t.key === startKey);
    if (startIndex === -1) {
      throw new Error(`fallback.start '${startKey}' is not in the target chain`);
    }

    this.contextDeps = {
      fetch: fetchImpl,
      userAgent: options.userAgent,
      cache: options.cache,
      seed: options.seed ?? SEED_SNAPSHOT,
    };

    this.activeIndex = startIndex;
    this.activeContext = this.getContext(startIndex);

    this.auth = new AuthManager({
      refreshToken: options.refreshToken,
      getHttp: () => this.activeContext.http,
      fetch: fetchImpl,
      firebaseApiKey: options.firebaseApiKey,
    });

    this.activeBundle = this.buildBundle(this.activeContext);

    // Sub-services bind to the INITIAL active context and are never rebuilt.
    this.characters = new CharactersService(this.activeContext.http, this.auth);
    this.references = new ReferencesService(this.activeContext.http, this.auth);
  }

  /** Lazily build (and memoise) the {@link TargetContext} for a chain index. */
  private getContext(index: number): TargetContext {
    const target = this.chain[index] as Target;
    const existing = this.contexts.get(target.key);
    if (existing !== undefined) {
      return existing;
    }
    const context = createTargetContext(target, this.contextDeps);
    this.contexts.set(target.key, context);
    return context;
  }

  /** Build the generation/history service bundle for a context. */
  private buildBundle(context: TargetContext): ServiceBundle {
    const pollOnce = (id: string): Promise<HistoryItem> =>
      this.withFallback((bundle) => bundle.generationService.getHistory(id));
    return {
      target: context.target,
      generationService: new GenerationService(context.http, this.auth, context.target, pollOnce),
      historyService: new HistoryService(context.http, this.auth, context.target),
    };
  }

  /** Advance to the next target (sticky). Returns `null` if none or `auto` is off. */
  private advanceTarget(): ServiceBundle | null {
    if (this.auto === false || this.activeIndex >= this.chain.length - 1) {
      return null;
    }
    this.activeIndex += 1;
    this.activeContext = this.getContext(this.activeIndex);
    this.activeBundle = this.buildBundle(this.activeContext);
    return this.activeBundle;
  }

  /** Whether an error is a definitive action-unavailable signal (a fallback trigger). */
  private shouldFallback(err: unknown): boolean {
    return (
      err instanceof ActionUnavailableError ||
      (err instanceof DiscoveryError && err.notFound === true)
    );
  }

  /** Run `op` against the active bundle, switching to the next target once on a trigger. */
  private async withFallback<T>(op: (bundle: ServiceBundle) => Promise<T>): Promise<T> {
    try {
      return await op(this.activeBundle);
    } catch (err) {
      if (!this.shouldFallback(err)) {
        throw err;
      }
      const next = this.advanceTarget();
      if (next === null) {
        throw err;
      }
      this.auth.resetSession();
      return op(this.activeBundle);
    }
  }

  /** Submit a generation job; returns its `historyId`. */
  generate(options: GenerateOptions): Promise<{ historyId: string }> {
    return this.withFallback((b) => b.generationService.submit(options));
  }

  /** Submit a video generation job (Berry-2 family); returns its `historyId`. */
  generateVideo(options: GenerateVideoOptions): Promise<{ historyId: string }> {
    return this.withFallback((b) => b.generationService.submitVideo(options));
  }

  /** Fetch the current state of a generation by id. */
  getResult(historyId: string): Promise<HistoryItem> {
    return this.withFallback((b) => b.generationService.getHistory(historyId));
  }

  /** Poll until a generation finishes (or fails / times out). */
  waitForResult(historyId: string, options?: WaitOptions): Promise<HistoryItem> {
    return this.withFallback((b) => b.generationService.waitForResult(historyId, options));
  }

  /** Cancel a running generation job. */
  cancelJob(historyId: string): Promise<void> {
    return this.withFallback((b) => b.generationService.cancelJob(historyId));
  }

  /** List past generations for the authenticated user. */
  listHistory(options?: ListHistoryOptions): Promise<HistoryPage> {
    return this.withFallback((b) => b.historyService.list(options));
  }

  /** List the user's permanently saved creations. */
  listCreations(options?: ListCreationsOptions): Promise<CreationPage> {
    return this.withFallback((b) => b.historyService.listCreations(options));
  }

  /** Save a completed generation result as a permanent creation. */
  saveCreation(result: GenerationResult): Promise<void> {
    return this.withFallback((b) => b.historyService.saveCreation(result));
  }

  /** Permanently delete a history item. Irreversible — requires `{ confirm: true }`. */
  deleteHistory(historyId: string, options?: ConfirmOptions): Promise<void> {
    return this.withFallback((b) => b.historyService.deleteHistory(historyId, options));
  }

  /** Permanently delete many history items. Irreversible — requires `{ confirm: true }`. */
  deleteManyHistories(historyIds: string[], options?: ConfirmOptions): Promise<void> {
    return this.withFallback((b) => b.historyService.deleteManyHistories(historyIds, options));
  }

  /** Permanently delete a saved creation. Irreversible — requires `{ confirm: true }`. */
  deleteCreation(creationId: string, options?: ConfirmOptions): Promise<void> {
    return this.withFallback((b) => b.historyService.deleteCreation(creationId, options));
  }

  /** Permanently delete many creations. Irreversible — requires `{ confirm: true }`. */
  deleteManyCreations(creationIds: string[], options?: ConfirmOptions): Promise<void> {
    return this.withFallback((b) => b.historyService.deleteManyCreations(creationIds, options));
  }

  /** Force re-discovery of the Server Action hashes on the active host. */
  refreshActions(): Promise<ActionSnapshot> {
    return this.activeContext.registry.refresh();
  }

  /** Return the authenticated user's Firebase uid. */
  getUid(): Promise<string> {
    return this.auth.getUserId();
  }

  /** Return the key of the currently active target (`'production'` or `'beta'`). */
  getActiveTarget(): TargetKey {
    return (this.chain[this.activeIndex] as Target).key;
  }
}
