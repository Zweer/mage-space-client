/** Generation history listing via `getHistoryPaginated`. */
import type { AuthManager } from './auth.js';
import { requireConfirm } from './errors.js';
import type { HttpClient } from './http.js';
import { unwrapResult } from './rsc.js';
import type {
  ConfirmOptions,
  CreationPage,
  GenerationResult,
  HistoryPage,
  ListCreationsOptions,
  ListHistoryOptions,
} from './types.js';

/** History actions are served from the `/creations` page. */
const HISTORY_PATH = '/creations';
const DEFAULT_LIMIT = 10;
/** RSC sentinel for an absent value. */
const UNDEFINED = '$undefined';

export class HistoryService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthManager,
  ) {}

  /** List generation history for the authenticated user. */
  async list(opts: ListHistoryOptions = {}): Promise<HistoryPage> {
    const [uid, session] = await Promise.all([this.auth.getUserId(), this.auth.getSession()]);
    const limit = opts.limit ?? DEFAULT_LIMIT;
    const offset = opts.offset ?? 0;
    const status = opts.status === 'all' ? UNDEFINED : (opts.status ?? 'success');
    const filters = { status, type: UNDEFINED };

    const { data } = await this.http.callAction<HistoryPage>({
      action: 'getHistoryPaginated',
      path: HISTORY_PATH,
      args: [uid, limit, offset, filters],
      session,
    });
    return unwrapResult<HistoryPage>(data);
  }

  /** List the user's permanently saved creations. */
  async listCreations(opts: ListCreationsOptions = {}): Promise<CreationPage> {
    const [uid, session] = await Promise.all([this.auth.getUserId(), this.auth.getSession()]);
    const limit = opts.limit ?? DEFAULT_LIMIT;
    const offset = opts.offset ?? 0;
    const { data } = await this.http.callAction<CreationPage>({
      action: 'getCreationsPaginatedParallel',
      path: HISTORY_PATH,
      args: [uid, limit, offset],
      session,
    });
    return unwrapResult<CreationPage>(data);
  }

  /**
   * Save a completed generation result as a permanent creation.
   *
   * @param result - the `result` object of a completed history item.
   * @remarks The API returns no body; call {@link listCreations} to retrieve the
   * saved creation.
   */
  async saveCreation(result: GenerationResult): Promise<void> {
    const session = await this.auth.getSession();
    await this.http.callAction({
      action: 'saveCreation',
      path: HISTORY_PATH,
      args: [result],
      session,
    });
  }

  /**
   * Permanently delete a history item. Irreversible — requires `{ confirm: true }`.
   */
  async deleteHistory(historyId: string, opts?: ConfirmOptions): Promise<void> {
    requireConfirm('deleteHistory', opts);
    const session = await this.auth.getSession();
    await this.http.callAction({
      action: 'deleteHistory',
      path: HISTORY_PATH,
      args: [historyId],
      session,
    });
  }

  /**
   * Permanently delete many history items. Irreversible — requires `{ confirm: true }`.
   *
   * @experimental Request body inferred from JS bundle; not yet verified live.
   */
  async deleteManyHistories(historyIds: string[], opts?: ConfirmOptions): Promise<void> {
    requireConfirm('deleteManyHistories', opts);
    const session = await this.auth.getSession();
    await this.http.callAction({
      action: 'deleteManyHistories',
      path: HISTORY_PATH,
      args: [historyIds],
      session,
    });
  }

  /**
   * Permanently delete a saved creation. Irreversible — requires `{ confirm: true }`.
   */
  async deleteCreation(creationId: string, opts?: ConfirmOptions): Promise<void> {
    requireConfirm('deleteCreation', opts);
    const session = await this.auth.getSession();
    await this.http.callAction({
      action: 'deleteCreation',
      path: HISTORY_PATH,
      args: [creationId],
      session,
    });
  }

  /**
   * Permanently delete many creations. Irreversible — requires `{ confirm: true }`.
   *
   * @experimental Request body inferred from JS bundle; not yet verified live.
   */
  async deleteManyCreations(creationIds: string[], opts?: ConfirmOptions): Promise<void> {
    requireConfirm('deleteManyCreations', opts);
    const session = await this.auth.getSession();
    await this.http.callAction({
      action: 'deleteManyCreations',
      path: HISTORY_PATH,
      args: [creationIds],
      session,
    });
  }
}
