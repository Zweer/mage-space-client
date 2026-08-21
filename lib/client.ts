/**
 * {@link MageSpaceClient} — the public facade that wires together action
 * discovery, authentication, generation, and history.
 */
import { ActionRegistry } from './actions.js';
import { AuthManager } from './auth.js';
import { CharactersService } from './characters.js';
import { GenerationService } from './generation.js';
import { HistoryService } from './history.js';
import { HttpClient } from './http.js';
import { ReferencesService } from './references.js';
import { SEED_SNAPSHOT } from './seed.js';
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

const DEFAULT_BASE_URL = 'https://www.mage.space';

export class MageSpaceClient {
  private readonly registry: ActionRegistry;
  private readonly auth: AuthManager;
  private readonly generationService: GenerationService;
  private readonly historyService: HistoryService;

  /** Character management (search, CRUD, pagination, uploads). */
  readonly characters: CharactersService;

  /** Reference asset management (upload, create, update, list, feed). */
  readonly references: ReferencesService;

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
    this.characters = new CharactersService(http, this.auth);
    this.references = new ReferencesService(http, this.auth);
  }

  /** Submit a generation job; returns its `historyId`. */
  generate(options: GenerateOptions): Promise<{ historyId: string }> {
    return this.generationService.submit(options);
  }

  /** Submit a video generation job (Berry-2 family); returns its `historyId`. */
  generateVideo(options: GenerateVideoOptions): Promise<{ historyId: string }> {
    return this.generationService.submitVideo(options);
  }

  /** Fetch the current state of a generation by id. */
  getResult(historyId: string): Promise<HistoryItem> {
    return this.generationService.getHistory(historyId);
  }

  /** Poll until a generation finishes (or fails / times out). */
  waitForResult(historyId: string, options?: WaitOptions): Promise<HistoryItem> {
    return this.generationService.waitForResult(historyId, options);
  }

  /** Cancel a running generation job. */
  cancelJob(historyId: string): Promise<void> {
    return this.generationService.cancelJob(historyId);
  }

  /** List past generations for the authenticated user. */
  listHistory(options?: ListHistoryOptions): Promise<HistoryPage> {
    return this.historyService.list(options);
  }

  /** List the user's permanently saved creations. */
  listCreations(options?: ListCreationsOptions): Promise<CreationPage> {
    return this.historyService.listCreations(options);
  }

  /** Save a completed generation result as a permanent creation. */
  saveCreation(result: GenerationResult): Promise<void> {
    return this.historyService.saveCreation(result);
  }

  /** Permanently delete a history item. Irreversible — requires `{ confirm: true }`. */
  deleteHistory(historyId: string, options?: ConfirmOptions): Promise<void> {
    return this.historyService.deleteHistory(historyId, options);
  }

  /** Permanently delete many history items. Irreversible — requires `{ confirm: true }`. */
  deleteManyHistories(historyIds: string[], options?: ConfirmOptions): Promise<void> {
    return this.historyService.deleteManyHistories(historyIds, options);
  }

  /** Permanently delete a saved creation. Irreversible — requires `{ confirm: true }`. */
  deleteCreation(creationId: string, options?: ConfirmOptions): Promise<void> {
    return this.historyService.deleteCreation(creationId, options);
  }

  /** Permanently delete many creations. Irreversible — requires `{ confirm: true }`. */
  deleteManyCreations(creationIds: string[], options?: ConfirmOptions): Promise<void> {
    return this.historyService.deleteManyCreations(creationIds, options);
  }

  /** Force re-discovery of the Server Action hashes. */
  refreshActions(): Promise<ActionSnapshot> {
    return this.registry.refresh();
  }

  /** Return the authenticated user's Firebase uid. */
  getUid(): Promise<string> {
    return this.auth.getUserId();
  }
}
