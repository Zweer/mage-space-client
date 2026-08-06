/** Generation history listing via `getHistoryPaginated`. */
import type { AuthManager } from './auth.js';
import type { HttpClient } from './http.js';
import type { HistoryPage, ListHistoryOptions } from './types.js';

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
    return data;
  }
}
