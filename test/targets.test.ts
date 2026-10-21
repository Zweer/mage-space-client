import { describe, expect, it } from 'vitest';
import {
  BETA_TARGET,
  DEFAULT_TARGET_CHAIN,
  PRODUCTION_TARGET,
  resolveActionName,
} from '../lib/index.js';

describe('target descriptors', () => {
  it('resolves the beta-specific wire name for listCreations', () => {
    // Arrange / Act
    const resolved = resolveActionName(BETA_TARGET, 'listCreations');

    // Assert
    expect(resolved).toBe('getCreationsPaginated');
  });

  it('falls back to the identity name for an unlisted logical action', () => {
    // Arrange — getHistoryById has no entry in the beta table (poll is paginated).
    // Act
    const resolved = resolveActionName(BETA_TARGET, 'getHistoryById');

    // Assert
    expect(resolved).toBe('getHistoryById');
  });

  it('exposes the default fallback chain as [production, beta]', () => {
    // Assert
    expect(DEFAULT_TARGET_CHAIN).toEqual([PRODUCTION_TARGET, BETA_TARGET]);
  });

  it('uses the paginated poll strategy on beta and byId on production', () => {
    // Assert
    expect(BETA_TARGET.pollStrategy).toBe('paginated');
    expect(PRODUCTION_TARGET.pollStrategy).toBe('byId');
  });
});
