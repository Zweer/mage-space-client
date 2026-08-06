/**
 * {@link MageSpaceClient} — the public facade that wires together action
 * discovery, authentication, generation, and history.
 */
import { ActionRegistry } from './actions.js';
import { AuthManager } from './auth.js';
import { GenerationService } from './generation.js';
import { HistoryService } from './history.js';
import { HttpClient } from './http.js';
import { SEED_SNAPSHOT } from './seed.js';
import type {
  ActionSnapshot,
  FetchLike,
  GenerateOptions,
  HistoryItem,
  HistoryPage,
  ListHistoryOptions,
  MageSpaceClientOptions,
  WaitOptions,
} from './types.js';

const DEFAULT_BASE_URL = 'https://www.mage.space';

export class MageSpaceClient {
  private readonly registry: ActionRegistry;
  private readonly auth: AuthManager;
  private readonly generationService: GenerationService;
  private readonly historyService: HistoryService;

  constructor(options: MageSpaceClientOptions) {
    if (!options.refreshToken) {
      throw new Error('MageSpaceClient requires a refreshToken');
    }
    const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    const fetchImpl: FetchLike = options.fetch ?? ((input, init) => fetch(input, init));

    this.registry = new ActionRegistry({
      fetch: fetchImpl,
      baseUrl,
      cache: options.cache,
      seed: options.seed ?? SEED_SNAPSHOT,
    });
    const http = new HttpClient(this.registry, fetchImpl, baseUrl, options.userAgent);
    this.auth = new AuthManager({
      refreshToken: options.refreshToken,
      http,
      fetch: fetchImpl,
      firebaseApiKey: options.firebaseApiKey,
    });
    this.generationService = new GenerationService(http, this.auth);
    this.historyService = new HistoryService(http, this.auth);
  }

  /** Submit a generation job; returns its `historyId`. */
  generate(options: GenerateOptions): Promise<{ historyId: string }> {
    return this.generationService.submit(options);
  }

  /** Fetch the current state of a generation by id. */
  getResult(historyId: string): Promise<HistoryItem> {
    return this.generationService.getHistory(historyId);
  }

  /** Poll until a generation finishes (or fails / times out). */
  waitForResult(historyId: string, options?: WaitOptions): Promise<HistoryItem> {
    return this.generationService.waitForResult(historyId, options);
  }

  /** List past generations for the authenticated user. */
  listHistory(options?: ListHistoryOptions): Promise<HistoryPage> {
    return this.historyService.list(options);
  }

  /** Force re-discovery of the Server Action hashes. */
  refreshActions(): Promise<ActionSnapshot> {
    return this.registry.refresh();
  }
}
