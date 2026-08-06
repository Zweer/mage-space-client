/** Typed error hierarchy for the mage.space client. */

/** Base class for every error thrown by this library. */
export class MageSpaceError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'MageSpaceError';
  }
}

/** Authentication failures (token refresh, session creation). */
export class AuthError extends MageSpaceError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'AuthError';
  }
}

/** Action-hash discovery failures (page/chunk fetch, empty registry). */
export class DiscoveryError extends MageSpaceError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'DiscoveryError';
  }
}

/** A Server Action returned 404, indicating a stale (post-deploy) hash. */
export class StaleActionError extends MageSpaceError {
  constructor(
    public readonly action: string,
    options?: { cause?: unknown },
  ) {
    super(`Action "${action}" returned 404 (stale hash)`, options);
    this.name = 'StaleActionError';
  }
}

/** Failures while submitting or polling a generation job. */
export class GenerationError extends MageSpaceError {
  constructor(
    message: string,
    public readonly code?: number,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'GenerationError';
  }
}

/** Failure to parse a React Server Component (RSC) wire response. */
export class RscParseError extends MageSpaceError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'RscParseError';
  }
}

/** A wait/poll operation exceeded its deadline or was aborted. */
export class TimeoutError extends MageSpaceError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'TimeoutError';
  }
}
