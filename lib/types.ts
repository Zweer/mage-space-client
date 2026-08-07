/**
 * Shared type definitions for the mage.space client.
 *
 * @remarks
 * mage.space is not a REST API: it uses Next.js Server Actions. These types model
 * the request/response shapes reverse-engineered in `docs/api/*.md`.
 */

/** Minimal `fetch` signature the client depends on (injectable for tests). */
export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

/** In-memory representation of the Firebase token chain. */
export interface AuthTokens {
  /** Firebase ID token (JWT), ~1h lifetime — used as `authToken` in bodies. */
  idToken: string;
  /** Long-lived refresh token (rotated on each refresh). */
  refreshToken: string;
  /** Firebase user id (uid). */
  userId: string;
  /** Epoch ms at which `idToken` expires. */
  expiresAt: number;
}

/** Firebase session cookie state (`__session`). */
export interface SessionState {
  /** The raw `__session` cookie value (a Firebase session JWT). */
  cookie: string;
  /** Epoch ms at which the session cookie expires (~24h). */
  expiresAt: number;
}

// ---------------------------------------------------------------------------
// Action discovery
// ---------------------------------------------------------------------------

/** Server Action function names the client relies on for the MVP surface. */
export type ActionName =
  | 'createUserSession'
  | 'deleteUserSession'
  | 'getUserHydrationData'
  | 'runArchitecture'
  | 'getHistoryById'
  | 'cancelArchitectureJob'
  | 'getHistoryPaginated'
  | 'getMentionSuggestionsParallel'
  | 'createCharacter'
  | 'updateCharacter'
  | 'deleteCharacter'
  | 'getCharacter'
  | 'getCharacters'
  | 'publishCharacter'
  | 'unpublishCharacter'
  | 'uploadCharacterImage'
  | 'uploadReferenceImage'
  | 'createReference'
  | 'updateReference'
  | 'getReferences'
  | 'getReferencesPaginated'
  | 'getCharactersPaginated'
  | 'getCreationsPaginatedParallel'
  | 'deleteHistory'
  | 'deleteManyHistories'
  | 'deleteCreation'
  | 'deleteManyCreations'
  | 'saveCreation'
  | 'generateCharacterVoice'
  | 'followCharacter'
  | 'unfollowCharacter';

/** Map of Server Action function name → hex action hash. */
export type ActionHashes = Record<string, string>;

/** A discovered (or seeded) set of action hashes for a single Vercel deploy. */
export interface ActionSnapshot {
  /** Vercel deployment id these hashes belong to (from `x-deployment-id`). */
  deploymentId: string;
  /** function name → hash. */
  hashes: ActionHashes;
  /** Epoch ms when this snapshot was produced. */
  discoveredAt: number;
}

/**
 * Pluggable persistence for the action snapshot.
 *
 * @remarks
 * The default is in-memory (per-process). In a Lambda/serverless deployment,
 * supply your own implementation backed by S3/DynamoDB/Redis/`/tmp` so discovery
 * runs once and is shared across warm invocations and instances.
 */
export interface ActionCache {
  load(): Promise<ActionSnapshot | null>;
  save(snapshot: ActionSnapshot): Promise<void>;
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

export type AspectRatio = 'portrait' | 'landscape' | 'square';
export type Resolution = '1K' | '2K' | '4K';
/** `unlimited` = Pro Plus/Max, `play` = free tier, `gems` = gem-based. */
export type GenerationMode = 'unlimited' | 'play' | 'gems';
/** Job lifecycle status returned by `getHistoryById`. */
export type JobStatus = 'running' | 'success' | 'error';

/** A trained character referenced inside a generation prompt. */
export interface CharacterRef {
  id: string;
  name: string;
  username: string;
  image_url: string;
  /** Optional; serialized as the `$undefined` sentinel when absent. */
  audio_url?: string;
}

/** The `architectureConfig` payload sent to `runArchitecture`. */
export interface ArchitectureConfig {
  seed: number | null;
  prompt: string;
  model_id: string;
  fast_mode: boolean;
  resolution: string;
  architecture: string;
  aspect_ratio?: AspectRatio;
  /** Reference image URL, or the `$undefined` sentinel. */
  image: string;
  additional_images: string[];
  characters: CharacterRef[];
  references: unknown[];
  audio_references: unknown[];
  /** Moodboard id, or the `$undefined` sentinel. */
  moodboard?: string;
}

/** The `result` object of a completed generation. */
export interface GenerationResult {
  data: {
    image?: string;
    video?: string;
    seed?: number;
    width?: number;
    height?: number;
    moderation?: { is_nsfw: boolean; is_forbidden: boolean };
  };
  type?: string;
  duration?: number;
}

/** A single history/generation record returned by the API. */
export interface HistoryItem {
  id: string;
  uid?: string;
  status: JobStatus;
  created_at?: string;
  updated_at?: string;
  error?: unknown;
  result: GenerationResult | null;
  concept_id?: string;
  architecture_config?: ArchitectureConfig;
  architecture?: string;
  model_id?: string;
  membership_tier?: string;
  [key: string]: unknown;
}

/** A page of history records from `getHistoryPaginated`. */
export interface HistoryPage {
  histories: HistoryItem[];
  hasMore: boolean;
}

// ---------------------------------------------------------------------------
// Public options
// ---------------------------------------------------------------------------

export interface MageSpaceClientOptions {
  /** Firebase refresh token extracted from a logged-in browser session. */
  refreshToken: string;
  /** Persistence for discovered action hashes (default: in-memory). */
  cache?: ActionCache;
  /** Custom `fetch` implementation (default: global `fetch`). */
  fetch?: FetchLike;
  /** Override the default browser-like `user-agent`. */
  userAgent?: string;
  /** Override the bundled action-hash seed snapshot. */
  seed?: ActionSnapshot;
  /** Base URL (default `https://www.mage.space`). */
  baseUrl?: string;
  /** Override the Firebase Web API key. */
  firebaseApiKey?: string;
}

export interface GenerateOptions {
  /** Prompt text; supports `@character-username` mentions. */
  prompt: string;
  /** Model/concept id. Defaults to the bundled mango-v3-pro concept id. */
  conceptId?: string;
  /** Model id (default `mango-v3-pro`). */
  model?: string;
  /** Architecture name (default `mango`). */
  architecture?: string;
  aspectRatio?: AspectRatio;
  resolution?: Resolution;
  /** Random seed (null = random). */
  seed?: number | null;
  /** Fast mode (may cost gems). */
  fastMode?: boolean;
  /** Characters to inject into the generation. */
  characters?: CharacterRef[];
  /**
   * Reference assets to influence style/composition. Same object shape as
   * characters; unlike characters they are NOT `@username`-mentioned in the
   * prompt (see `docs/api/generation.md`).
   */
  references?: CharacterRef[];
  /** First reference image URL. */
  image?: string;
  /** Additional reference image URLs. */
  additionalImages?: string[];
  /** Override the generation mode (default `unlimited`). */
  generationMode?: GenerationMode;
}

// ---------------------------------------------------------------------------
// Video generation (Berry-2 family)
// ---------------------------------------------------------------------------

/** Aspect ratios accepted by video architectures (`berry_aspect_ratio`). */
export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
/** Video output resolutions (`480p` unlimited on Pro Plus; `720p` costs gems). */
export type VideoResolution = '480p' | '720p';

/**
 * The `architectureConfig` payload for video architectures.
 *
 * @remarks
 * Differs from the image {@link ArchitectureConfig}: `duration` is a string,
 * aspect ratio is `berry_aspect_ratio`, and there is no `moodboard` field.
 */
export interface VideoArchitectureConfig {
  seed: number | null;
  prompt: string;
  model_id: string;
  fast_mode: boolean;
  /** `480p` or `720p`. */
  resolution: string;
  architecture: string;
  berry_aspect_ratio?: VideoAspectRatio;
  /** Clip length in seconds — a string (e.g. `"3"`, `"5"`, `"7"`). */
  duration: string;
  /** First-frame image URL, or the `$undefined` sentinel. */
  image: string;
  additional_images: string[];
  characters: CharacterRef[];
  references: unknown[];
  audio_references: unknown[];
}

export interface GenerateVideoOptions {
  /** Prompt text; supports `@character-username` mentions. */
  prompt: string;
  /** Model/concept id. Defaults to the bundled berry-2 concept id. */
  conceptId?: string;
  /** Model id (default `berry-2`). */
  model?: string;
  /** Architecture name (default `berry`). */
  architecture?: string;
  /** Video aspect ratio (default `9:16`). */
  aspectRatio?: VideoAspectRatio;
  /** Output resolution (default `480p`). */
  resolution?: VideoResolution;
  /** Clip length in seconds as a string (default `"3"`). */
  duration?: string;
  /** Random seed (null = random). */
  seed?: number | null;
  /** Fast mode (may cost gems). */
  fastMode?: boolean;
  /** Characters to inject into the video. */
  characters?: CharacterRef[];
  /** Reference assets (same shape as characters; not `@`-mentioned). */
  references?: CharacterRef[];
  /** First-frame image URL (text-to-video when omitted). */
  image?: string;
  /** Additional reference image URLs. */
  additionalImages?: string[];
  /** Override the generation mode (default `unlimited`). */
  generationMode?: GenerationMode;
}

/**
 * Required confirmation for irreversible, destructive operations.
 *
 * @remarks
 * A safety flag so a mass/permanent delete cannot fire by accident. Pass
 * `{ confirm: true }` to actually execute.
 */
export interface ConfirmOptions {
  confirm: boolean;
}

export interface WaitOptions {
  /** Poll interval in ms (default 4000). */
  intervalMs?: number;
  /** Overall timeout in ms (default 300000). */
  timeoutMs?: number;
  /** Abort signal to cancel waiting. */
  signal?: AbortSignal;
}

export interface ListHistoryOptions {
  /** Max results (default 10). */
  limit?: number;
  /** Pagination offset (default 0). */
  offset?: number;
  /** Filter by status; `all` disables the status filter (default `success`). */
  status?: JobStatus | 'all';
}

// ---------------------------------------------------------------------------
// Characters & references
// ---------------------------------------------------------------------------

/** Whether an asset is driven by an image or an audio reference. */
export type Modality = 'image' | 'audio';
/** Asset visibility. */
export type Visibility = 'private' | 'public';

/**
 * A trained character (or reference asset) as returned by the API.
 *
 * @remarks
 * References share this shape with `variant: "reference"`; characters use
 * `variant: "character"`.
 */
export interface Character {
  id: string;
  uid?: string;
  name: string;
  username: string;
  image_url: string;
  audio_url: string | null;
  modality?: Modality;
  description?: string | null;
  tags?: string[];
  visibility?: Visibility;
  moderation?: string[];
  num_plays_all_time?: number;
  num_plays_monthly?: number;
  num_plays_daily?: number;
  created_at?: string;
  is_deleted?: boolean;
  is_featured?: boolean;
  variant?: string;
  [key: string]: unknown;
}

/** A reference asset — structurally identical to {@link Character}. */
export type Reference = Character;

/** Parsed result of `getMentionSuggestionsParallel`. */
export interface CharacterSearchResult {
  characters: Character[];
  references: Reference[];
  moodboards: unknown[];
}

export interface SearchCharactersOptions {
  /** Search text (matches character name). */
  query: string;
  /** Max results (default 10). */
  limit?: number;
  /** Include public references in the results (default false). */
  includePublicReferences?: boolean;
  /** Reference modalities to include (default `['image', 'audio']`). */
  referenceModalities?: Modality[];
}

export interface CreateCharacterInput {
  /** Display name. */
  name: string;
  /** Unique @-mention handle (name + short suffix). */
  username: string;
  /** CDN URL from {@link uploadCharacterImage} or an existing character. */
  image_url: string;
  /** Voice audio URL (default null). */
  audio_url?: string | null;
  /** Optional description (default null). */
  description?: string | null;
  /** Category tags (default `[]`). */
  tags?: string[];
  /** Visibility (default `private`). */
  visibility?: Visibility;
  /** Moderation flags — always `[]` for new characters. */
  moderation?: string[];
}

export interface UpdateCharacterInput {
  name?: string;
  description?: string | null;
  tags?: string[];
  visibility?: Visibility;
  audio_url?: string | null;
}

export interface CreateReferenceInput {
  /** Display name. */
  name: string;
  /** Unique handle (name + short suffix). */
  username: string;
  /** CDN URL from {@link uploadReferenceImage} (required for image refs). */
  image_url?: string;
  /** Audio URL (required for audio refs). */
  audio_url?: string | null;
  /** Reference modality (default `image`). */
  modality?: Modality;
  /** `reference` for image refs, `audio` for audio refs (default `reference`). */
  variant?: string;
  description?: string | null;
  tags?: string[];
  visibility?: Visibility;
  moderation?: string[];
}

/** Reference asset variants. */
export type ReferenceVariant = 'reference' | 'object' | 'outfit' | 'pose';

export interface UpdateReferenceInput {
  name?: string;
  description?: string | null;
  tags?: string[];
  visibility?: Visibility;
}

/** Ordering for the paginated reference feed. */
export type ReferenceOrder = 'trending' | 'top' | 'newest' | 'oldest';

export interface ListReferencesOptions {
  /** Max results per page (default 20). */
  limit?: number;
  /** Pagination offset (default 0). */
  offset?: number;
  /** Filter by owner uid (omit for the public feed). */
  uid?: string;
  /** Filter by visibility. */
  visibility?: Visibility;
  /** Sort order (default `top`). */
  orderBy?: ReferenceOrder;
  /** Only featured references. */
  featuredOnly?: boolean;
  /** Filter by modality (default `image`). */
  modality?: Modality;
}

/** A page of references from `getReferencesPaginated`. */
export interface ReferencePage {
  references: Reference[];
  hasMore: boolean;
}

export interface ListCharactersOptions {
  /** Max results per page (default 100). */
  limit?: number;
  /** Pagination offset (default 0). */
  offset?: number;
  /** Filter by owner uid (omit for the public feed). */
  uid?: string;
  /** Filter by visibility. */
  visibility?: Visibility;
  /** Filter by modality. */
  modality?: Modality;
  /** Only featured characters. */
  featured?: boolean;
}

/** A page of characters from `getCharactersPaginated`. */
export interface CharacterPage {
  characters: Character[];
  hasMore: boolean;
}

/** A permanently saved creation (as opposed to transient history). */
export interface Creation {
  id: string;
  uid?: string;
  /** Permanent CDN URL (not `/temp/30d/`). */
  url: string;
  hash?: string;
  type?: 'image' | 'video';
  visibility?: Visibility;
  concept_id?: string;
  architecture_config?: ArchitectureConfig;
  metadata?: {
    seed?: number;
    width?: number;
    height?: number;
    duration?: number;
    moderation?: { is_nsfw: boolean; is_forbidden: boolean };
  };
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  [key: string]: unknown;
}

/** A page of creations from `getCreationsPaginatedParallel`. */
export interface CreationPage {
  creations: Creation[];
  hasMore: boolean;
}

export interface ListCreationsOptions {
  /** Max results (default 10). */
  limit?: number;
  /** Pagination offset (default 0). */
  offset?: number;
}

export interface GenerateVoiceOptions {
  /** CDN URL of the character's reference image. */
  imageUrl: string;
  /** Text describing the desired voice (default empty). */
  guidancePrompt?: string;
}

/** Result of `generateCharacterVoice`. */
export interface VoiceResult {
  ok: boolean;
  data?: {
    /** CDN URL of the generated MP3 voice. */
    audioUrl: string;
    /** Gems charged for the generation. */
    gemsCharged?: number;
  };
  error?: {
    code: string;
    required_gems?: number;
    balance_gems?: number;
  };
}
