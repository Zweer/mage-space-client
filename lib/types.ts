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
  | 'getHistoryPaginated';

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
  /** First reference image URL. */
  image?: string;
  /** Additional reference image URLs. */
  additionalImages?: string[];
  /** Override the generation mode (default `unlimited`). */
  generationMode?: GenerationMode;
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
