/**
 * Character & reference management.
 *
 * Covers the verified Server Actions from `docs/api/characters.md`: search
 * (`getMentionSuggestionsParallel`), full CRUD, pagination, publish/unpublish,
 * and base64 image uploads.
 *
 * @remarks
 * Read operations pass the caller's `uid` in the body; write operations rely on
 * the `__session` cookie (the server derives the uid from it). All actions are
 * posted to the `/explore` page where their bundles are loaded.
 */
import type { AuthManager } from './auth.js';
import { MageSpaceError } from './errors.js';
import type { HttpClient } from './http.js';
import { unwrapResult } from './rsc.js';
import type {
  Character,
  CharacterPage,
  CharacterSearchResult,
  CreateCharacterInput,
  GenerateVoiceOptions,
  ListCharactersOptions,
  SearchCharactersOptions,
  UpdateCharacterInput,
  VoiceResult,
} from './types.js';

/** Character actions are served from the `/explore` page. */
const CHARACTERS_PATH = '/explore';
const DEFAULT_SEARCH_LIMIT = 10;

/** Server-enforced username constraints (from module 64428). */
const USERNAME_MIN = 1;
const USERNAME_MAX = 15;
const USERNAME_RE = /^[a-z][a-z0-9_-]*$/;

/**
 * Generate a username from a display name, matching the web UI logic:
 * lowercase, strip special chars, append a 4-char random suffix, truncate to 15.
 */
function generateUsername(name: string): string {
  const suffix = Math.random().toString(36).substring(2, 6);
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  // Ensure the random suffix always fits: base is truncated to leave room for `-xxxx`.
  const maxBase = USERNAME_MAX - suffix.length - 1; // 1 for the dash separator
  const trimmedBase = base.slice(0, maxBase).replace(/[-_]+$/, '');
  return `${trimmedBase}-${suffix}`;
}

/** Validate a username and throw early with a clear message instead of a server 500. */
function validateUsername(username: string): void {
  if (username.length < USERNAME_MIN) {
    throw new MageSpaceError('Username is required (min 1 character)');
  }
  if (username.length > USERNAME_MAX) {
    throw new MageSpaceError(
      `Username "${username}" is too long (${username.length} chars, max ${USERNAME_MAX})`,
    );
  }
  if (!USERNAME_RE.test(username)) {
    throw new MageSpaceError(
      `Username "${username}" is invalid: must start with a lowercase letter and contain only a-z, 0-9, _ or -`,
    );
  }
}

export class CharactersService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthManager,
  ) {}

  /** Search the caller's characters (and optionally public references) by name. */
  async search(opts: SearchCharactersOptions): Promise<CharacterSearchResult> {
    const [uid, session] = await Promise.all([this.auth.getUserId(), this.auth.getSession()]);
    const body = {
      query: opts.query,
      uid,
      limit: opts.limit ?? DEFAULT_SEARCH_LIMIT,
      includePublicReferences: opts.includePublicReferences ?? false,
      referenceModalities: opts.referenceModalities ?? ['image', 'audio'],
    };
    const { data } = await this.http.callAction<CharacterSearchResult>({
      action: 'getMentionSuggestionsParallel',
      path: CHARACTERS_PATH,
      args: [body],
      session,
    });
    return unwrapResult<CharacterSearchResult>(data);
  }

  /** Create a new character from an already-uploaded image URL. */
  async create(input: CreateCharacterInput): Promise<Character> {
    const username = input.username ?? generateUsername(input.name);
    validateUsername(username);
    const session = await this.auth.getSession();
    const body = {
      name: input.name,
      username,
      image_url: input.image_url,
      audio_url: input.audio_url ?? null,
      description: input.description ?? null,
      tags: input.tags ?? [],
      visibility: input.visibility ?? 'private',
      moderation: input.moderation ?? [],
    };
    const { data } = await this.http.callAction<Character>({
      action: 'createCharacter',
      path: CHARACTERS_PATH,
      args: [body],
      session,
    });
    return data;
  }

  /** Update a character's mutable fields (name, description, tags, visibility, voice). */
  async update(id: string, patch: UpdateCharacterInput): Promise<Character> {
    const session = await this.auth.getSession();
    const { data } = await this.http.callAction<Character>({
      action: 'updateCharacter',
      path: CHARACTERS_PATH,
      args: [id, patch],
      session,
    });
    return data;
  }

  /** Soft-delete a character. */
  async delete(id: string): Promise<void> {
    const session = await this.auth.getSession();
    await this.http.callAction({
      action: 'deleteCharacter',
      path: CHARACTERS_PATH,
      args: [id],
      session,
    });
  }

  /** Fetch a single character by id; resolves to `null` when it does not exist. */
  async get(id: string): Promise<Character | null> {
    const session = await this.auth.getSession();
    const { data } = await this.http.callAction<Character | null>({
      action: 'getCharacter',
      path: CHARACTERS_PATH,
      args: [id],
      session,
    });
    return data ?? null;
  }

  /** Fetch multiple characters by id in a single call. */
  async getMany(ids: string[]): Promise<Character[]> {
    const session = await this.auth.getSession();
    const { data } = await this.http.callAction<Character[]>({
      action: 'getCharacters',
      path: CHARACTERS_PATH,
      args: [ids],
      session,
    });
    return data ?? [];
  }

  /** Make a character public. */
  async publish(id: string): Promise<void> {
    const session = await this.auth.getSession();
    await this.http.callAction({
      action: 'publishCharacter',
      path: CHARACTERS_PATH,
      args: [id],
      session,
    });
  }

  /** Make a character private. */
  async unpublish(id: string): Promise<void> {
    const session = await this.auth.getSession();
    await this.http.callAction({
      action: 'unpublishCharacter',
      path: CHARACTERS_PATH,
      args: [id],
      session,
    });
  }

  /**
   * Upload a character reference image (base64 data URL) and return its CDN URL.
   *
   * @param dataUrl - `data:image/jpeg;base64,...` (JPEG preferred; PNG/WebP ok).
   */
  async uploadImage(dataUrl: string): Promise<string> {
    const [uid, session] = await Promise.all([this.auth.getUserId(), this.auth.getSession()]);
    const { data } = await this.http.callAction<string>({
      action: 'uploadCharacterImage',
      path: CHARACTERS_PATH,
      args: [dataUrl, uid],
      session,
    });
    return data;
  }

  /**
   * Browse characters with pagination.
   *
   * @remarks
   * Omit `uid` to browse the public/featured feed; pass it to page through a
   * single user's characters.
   */
  async listPaginated(opts: ListCharactersOptions = {}): Promise<CharacterPage> {
    const session = await this.auth.getSession();
    const limit = opts.limit ?? 100;
    const offset = opts.offset ?? 0;
    const filters: Record<string, unknown> = {};
    if (opts.uid !== undefined) {
      filters.uid = opts.uid;
    }
    if (opts.visibility !== undefined) {
      filters.visibility = opts.visibility;
    }
    if (opts.modality !== undefined) {
      filters.modality = opts.modality;
    }
    if (opts.featured !== undefined) {
      filters.featured = opts.featured;
    }
    const { data } = await this.http.callAction<CharacterPage>({
      action: 'getCharactersPaginated',
      path: CHARACTERS_PATH,
      args: [limit, offset, filters],
      session,
    });
    return data;
  }

  /**
   * Generate a voice for a character from its reference image.
   *
   * @remarks Costs gems (not covered by the unlimited tier).
   * @experimental Request body inferred from JS bundle; not yet verified live.
   */
  async generateVoice(opts: GenerateVoiceOptions): Promise<VoiceResult> {
    const [authToken, session] = await Promise.all([
      this.auth.getIdToken(),
      this.auth.getSession(),
    ]);
    const { data } = await this.http.callAction<VoiceResult>({
      action: 'generateCharacterVoice',
      path: CHARACTERS_PATH,
      args: [{ imageUrl: opts.imageUrl, guidancePrompt: opts.guidancePrompt ?? '' }, authToken],
      session,
    });
    return data;
  }

  /**
   * Follow a (public) character.
   *
   * @experimental Request body inferred from JS bundle; not yet verified live.
   */
  async follow(id: string): Promise<void> {
    const session = await this.auth.getSession();
    await this.http.callAction({
      action: 'followCharacter',
      path: CHARACTERS_PATH,
      args: [id],
      session,
    });
  }

  /**
   * Unfollow a character.
   *
   * @experimental Request body inferred from JS bundle; not yet verified live.
   */
  async unfollow(id: string): Promise<void> {
    const session = await this.auth.getSession();
    await this.http.callAction({
      action: 'unfollowCharacter',
      path: CHARACTERS_PATH,
      args: [id],
      session,
    });
  }
}
