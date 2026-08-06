import type { ActionSnapshot } from './types.js';

/**
 * Bundled action-hash snapshot from the mage.space Vercel deploy discovered on
 * 2026-08-06 (`docs/api/actions.md`).
 *
 * @remarks
 * Used as a warm seed so the very first call does not pay the discovery cost.
 * Hashes change on every deploy; when one goes stale the client re-discovers
 * automatically (404 → invalidate → refresh).
 */
export const SEED_SNAPSHOT: ActionSnapshot = {
  deploymentId: 'dpl_GLUqzVNVADQR5wogKksDvu1m3BdH',
  discoveredAt: Date.parse('2026-08-06T00:00:00.000Z'),
  hashes: {
    createUserSession: '60fa7da54d8662813645f7077455339d23096f391c',
    deleteUserSession: '0077c71a228d26498d446a89e60ec6d17199443f9e',
    getUserHydrationData: '40314a83b96c226af04a264d1e076a06dbf3cc73b2',
    runArchitecture: '402c09c1b4694e5bb273a949a41a2f36ca82eff394',
    getHistoryById: '40b894a9a39b33b79d4eb046e4beeed7b30b21a887',
    cancelArchitectureJob: '40e4b91be4f6698821f96021adaf305a74b32af2a1',
    getHistoryPaginated: '787d245f6320977164c554a189a4d5b80c18ca3347',
  },
};
