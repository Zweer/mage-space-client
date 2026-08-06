/** Public entry point for `@zweer/mage-space-client`. */
export const VERSION = '0.0.0';

export { MageSpaceClient } from './client.js';
export { ActionRegistry, InMemoryActionCache, discoverActions } from './actions.js';
export { parseFlightRows, parseServerActionResponse, resolveFlightValue } from './rsc.js';
export { SEED_SNAPSHOT } from './seed.js';
export {
  AuthError,
  DiscoveryError,
  GenerationError,
  MageSpaceError,
  RscParseError,
  StaleActionError,
  TimeoutError,
} from './errors.js';
export type * from './types.js';
