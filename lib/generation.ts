/**
 * Image generation: submit a job via `runArchitecture`, then poll
 * `getHistoryById` until the job succeeds, fails, or times out.
 */
import type { AuthManager } from './auth.js';
import { GenerationError, TimeoutError } from './errors.js';
import type { HttpClient } from './http.js';
import type {
  ArchitectureConfig,
  CharacterRef,
  GenerateOptions,
  GenerateVideoOptions,
  GenerationMode,
  HistoryItem,
  VideoArchitectureConfig,
  WaitOptions,
} from './types.js';

/** Generation actions are served from the `/explore` page. */
const GENERATION_PATH = '/explore';
/** RSC sentinel for an absent value. */
const UNDEFINED = '$undefined';
/** Default concept id for mango-v3-pro (from docs — verify per model via rev-eng). */
const DEFAULT_CONCEPT_ID = '0cd8c7ed2e554d0f98f20c8cf8c0f7c';
/** Default concept id for berry-2 video (from docs — verify per model via rev-eng). */
const DEFAULT_BERRY_CONCEPT_ID = '0b1fa74f7347406392422d24f2885684';

const DEFAULT_POLL_INTERVAL_MS = 4000;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export class GenerationService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthManager,
  ) {}

  /** Submit an image generation job and return its `historyId`. */
  async submit(opts: GenerateOptions): Promise<{ historyId: string }> {
    const config: ArchitectureConfig = {
      seed: opts.seed ?? null,
      prompt: opts.prompt,
      model_id: opts.model ?? 'mango-v3-pro',
      fast_mode: opts.fastMode ?? false,
      resolution: opts.resolution ?? '1K',
      architecture: opts.architecture ?? 'mango',
      aspect_ratio: opts.aspectRatio ?? 'portrait',
      image: opts.image ?? UNDEFINED,
      additional_images: opts.additionalImages ?? [],
      characters: mapCharacters(opts.characters),
      references: mapCharacters(opts.references),
      audio_references: [],
      moodboard: UNDEFINED,
    };
    return this.runArchitecture(config, opts.conceptId ?? DEFAULT_CONCEPT_ID, opts.generationMode);
  }

  /** Submit a video generation job (Berry-2 family) and return its `historyId`. */
  async submitVideo(opts: GenerateVideoOptions): Promise<{ historyId: string }> {
    const config: VideoArchitectureConfig = {
      seed: opts.seed ?? null,
      prompt: opts.prompt,
      model_id: opts.model ?? 'berry-2',
      fast_mode: opts.fastMode ?? false,
      resolution: opts.resolution ?? '480p',
      architecture: opts.architecture ?? 'berry',
      berry_aspect_ratio: opts.aspectRatio ?? '9:16',
      duration: opts.duration ?? '3',
      image: opts.image ?? UNDEFINED,
      additional_images: opts.additionalImages ?? [],
      characters: mapCharacters(opts.characters),
      references: mapCharacters(opts.references),
      audio_references: [],
    };
    return this.runArchitecture(
      config,
      opts.conceptId ?? DEFAULT_BERRY_CONCEPT_ID,
      opts.generationMode,
    );
  }

  /** Shared `runArchitecture` call for image and video configs. */
  private async runArchitecture(
    config: ArchitectureConfig | VideoArchitectureConfig,
    conceptId: string,
    generationMode: GenerationMode = 'unlimited',
  ): Promise<{ historyId: string }> {
    const [authToken, session] = await Promise.all([
      this.auth.getIdToken(),
      this.auth.getSession(),
    ]);

    const args = [
      {
        architectureConfig: config,
        architectureConfigToSave: '$0:0:architectureConfig',
        authToken,
        conceptId,
        activePowerPack: null,
        generationMode,
      },
    ];

    const { data } = await this.http.callAction<Record<string, unknown>>({
      action: 'runArchitecture',
      path: GENERATION_PATH,
      args,
      session,
    });

    if (data !== null && typeof data === 'object' && 'error_code' in data) {
      const code = Number(data.error_code);
      throw new GenerationError(errorMessageForCode(code), code);
    }
    const historyId = data !== null && typeof data === 'object' ? data.history_id : undefined;
    if (typeof historyId !== 'string') {
      throw new GenerationError('runArchitecture did not return a history_id');
    }
    return { historyId };
  }

  /** Fetch a single history record by id. */
  async getHistory(historyId: string): Promise<HistoryItem> {
    const session = await this.auth.getSession();
    const { data } = await this.http.callAction<HistoryItem>({
      action: 'getHistoryById',
      path: GENERATION_PATH,
      args: [historyId],
      session,
    });
    return data;
  }

  /** Cancel a running generation job. */
  async cancelJob(historyId: string): Promise<void> {
    const session = await this.auth.getSession();
    await this.http.callAction({
      action: 'cancelArchitectureJob',
      path: GENERATION_PATH,
      args: [historyId],
      session,
    });
  }

  /** Poll until the job leaves the `running` state, returning the final record. */
  async waitForResult(historyId: string, opts: WaitOptions = {}): Promise<HistoryItem> {
    const intervalMs = opts.intervalMs ?? DEFAULT_POLL_INTERVAL_MS;
    const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const deadline = Date.now() + timeoutMs;

    for (;;) {
      if (opts.signal?.aborted === true) {
        throw new TimeoutError('waitForResult was aborted');
      }
      const item = await this.getHistory(historyId);
      if (item.status === 'success') {
        return item;
      }
      if (item.status === 'error') {
        throw new GenerationError(`Generation failed: ${JSON.stringify(item.error ?? null)}`);
      }
      if (Date.now() > deadline) {
        throw new TimeoutError(
          `Generation timed out after ${timeoutMs}ms (last status: ${item.status})`,
        );
      }
      await delay(intervalMs, opts.signal);
    }
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new TimeoutError('waitForResult was aborted'));
      },
      { once: true },
    );
  });
}

/** Normalize characters for an `architectureConfig`, defaulting absent audio to the RSC sentinel. */
function mapCharacters(characters: CharacterRef[] = []): CharacterRef[] {
  return characters.map((c) => ({
    id: c.id,
    name: c.name,
    username: c.username,
    image_url: c.image_url,
    audio_url: c.audio_url ?? UNDEFINED,
  }));
}

function errorMessageForCode(code: number): string {
  switch (code) {
    case 400:
      return 'Bad request (wrong generationMode for your subscription tier?)';
    case 401:
      return 'Authentication failed (token expired or invalid)';
    case 403:
      return 'User is banned';
    case 4031:
      return 'Prompt blocked by content moderation';
    default:
      return `Generation error (code ${code})`;
  }
}
