/**
 * Reference asset management.
 *
 * References are reusable image/audio assets (generic references, objects,
 * outfits, poses) applied across generations — distinct from characters, which
 * are trained identities. Covers upload, create, update, and listing (own +
 * public feed) per `docs/api/references.md`.
 */
import type { AuthManager } from './auth.js';
import type { HttpClient } from './http.js';
import type {
  CreateReferenceInput,
  ListReferencesOptions,
  Modality,
  Reference,
  ReferencePage,
  UpdateReferenceInput,
} from './types.js';

/** Reference actions are served from the `/explore` page. */
const REFERENCES_PATH = '/explore';
const DEFAULT_PAGE_LIMIT = 20;

export class ReferencesService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthManager,
  ) {}

  /**
   * Upload a reference image (base64 data URL) and return its CDN URL.
   *
   * @param dataUrl - `data:image/jpeg;base64,...` (JPEG preferred; PNG/WebP ok).
   */
  async uploadImage(dataUrl: string): Promise<string> {
    const [uid, session] = await Promise.all([this.auth.getUserId(), this.auth.getSession()]);
    const { data } = await this.http.callAction<string>({
      action: 'uploadReferenceImage',
      path: REFERENCES_PATH,
      args: [dataUrl, uid],
      session,
    });
    return data;
  }

  /** Create a reusable reference from an uploaded image/audio URL. */
  async create(input: CreateReferenceInput): Promise<Reference> {
    const session = await this.auth.getSession();
    const body = {
      name: input.name,
      username: input.username,
      image_url: input.image_url,
      audio_url: input.audio_url ?? null,
      modality: input.modality ?? 'image',
      variant: input.variant ?? 'reference',
      description: input.description ?? null,
      tags: input.tags ?? [],
      visibility: input.visibility ?? 'private',
      moderation: input.moderation ?? [],
    };
    const { data } = await this.http.callAction<Reference>({
      action: 'createReference',
      path: REFERENCES_PATH,
      args: [body],
      session,
    });
    return data;
  }

  /** Update a reference's mutable fields (name, description, tags, visibility). */
  async update(id: string, patch: UpdateReferenceInput): Promise<Reference> {
    const session = await this.auth.getSession();
    const { data } = await this.http.callAction<Reference>({
      action: 'updateReference',
      path: REFERENCES_PATH,
      args: [id, patch],
      session,
    });
    return data;
  }

  /** List the caller's own references for a given modality (default `image`). */
  async list(modality: Modality = 'image'): Promise<Reference[]> {
    const [uid, session] = await Promise.all([this.auth.getUserId(), this.auth.getSession()]);
    const { data } = await this.http.callAction<Reference[]>({
      action: 'getReferences',
      path: REFERENCES_PATH,
      args: [uid, modality],
      session,
    });
    return data ?? [];
  }

  /**
   * Browse references with pagination.
   *
   * @remarks
   * Omit `uid` to browse the public/featured feed; pass it to page through a
   * single user's references.
   */
  async listPaginated(opts: ListReferencesOptions = {}): Promise<ReferencePage> {
    const session = await this.auth.getSession();
    const limit = opts.limit ?? DEFAULT_PAGE_LIMIT;
    const offset = opts.offset ?? 0;
    const filters: Record<string, unknown> = {
      visibility: opts.visibility ?? 'public',
      orderBy: opts.orderBy ?? 'top',
      featuredOnly: opts.featuredOnly ?? false,
      modality: opts.modality ?? 'image',
    };
    if (opts.uid !== undefined) {
      filters.uid = opts.uid;
    }
    const { data } = await this.http.callAction<ReferencePage>({
      action: 'getReferencesPaginated',
      path: REFERENCES_PATH,
      args: [limit, offset, filters],
      session,
    });
    return data;
  }
}
