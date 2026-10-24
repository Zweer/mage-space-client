/** Public entry point for `@zweer/mage-space-client`. */
export const VERSION = '0.0.0';

export type { ChunkListResult } from './actions.js';
export {
  ActionRegistry,
  discoverActions,
  InMemoryActionCache,
  listDiscoveryChunks,
  requiredActionsForClient,
  scrapeChunks,
} from './actions.js';
export { CharactersService } from './characters.js';
export { MageSpaceClient } from './client.js';
export {
  ActionUnavailableError,
  AuthError,
  DiscoveryError,
  GenerationError,
  MageSpaceError,
  RscParseError,
  StaleActionError,
  TimeoutError,
} from './errors.js';
export { ReferencesService } from './references.js';
export {
  parseFlightRows,
  parseServerActionResponse,
  resolveFlightValue,
  unwrapResult,
} from './rsc.js';
export { SEED_SNAPSHOT } from './seed.js';
export type { LogicalAction, PollStrategy, Target, TargetKey } from './targets.js';
export {
  BETA_TARGET,
  DEFAULT_TARGET_CHAIN,
  PRODUCTION_TARGET,
  resolveActionName,
} from './targets.js';
export type * from './types.js';
