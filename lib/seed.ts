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
    getMentionSuggestionsParallel: '7f1553e5f697d614a2982a5400edae73c4ef672ece',
    createCharacter: '4012fee65f53db4fbe9d83808da2869751fe503a87',
    updateCharacter: '60dc4b95918a5fea7b2752bedebb38e0950e19a17e',
    deleteCharacter: '40656ebd70a3804b5c18740913c8b769d4c72e1298',
    getCharacter: '40b1e8e090a726985d8868f145865a3b5bde0803b1',
    getCharacters: '402ea21b03340cd20f55ea8c15f56dbbc1ce957f51',
    publishCharacter: '409a73d2187553e2e069493147969c46d7329a7c44',
    unpublishCharacter: '40f009e2c220d4efc54b9f8968ab37e74cb66de982',
    uploadCharacterImage: '60869f48fe83aa95969a6549f84023c9e115ee274f',
    uploadReferenceImage: '606ba2b0eb79bd8f28c609706a89b52e0d9f517fa6',
    createReference: '406d91cfd5589042bd72defa1071bc7c3fb84810c4',
    updateReference: '602d6bb3ba2609661f07330224f6fd075e7af6bc9e',
    deleteReference: '409dd73e6daafe43b500b0c9f012a33fc5350af196',
    getReferences: '60a0357a926bc3e4031c00e62ca815e3ea21b3eb35',
    getReferencesPaginated: '7069d599ab890e353b790d46df56160d5c0a85348a',
    getCharactersPaginated: '7085cf87746975cbec2868405a026e22b97a20cfb4',
    getCreationsPaginatedParallel: '7f7f533eb9fc5a3fca55cb5e19d45532a27eb75f38',
    deleteHistory: '40e1f88b6813c101c03e136e4d5f5fadeb9909ee52',
    deleteManyHistories: '402a5bddb2a41165f2f64782b85b4915e63ec2a849',
    deleteCreation: '407e9ce3d04c7274e3341bf8450633dc8e3935ec9c',
    deleteManyCreations: '403d071e9dc36382b3efff80470e6d76b3edd299b8',
    saveCreation: '6087f655eaef4de56a01fb6c6a84df58cea0632e5f',
    generateCharacterVoice: '6052462e345ee9878d5c36c2a160ea1873919c2b41',
    followCharacter: '402d9d8cf924262612f29b5ef3d1a6a97d3a0a9d7a',
    unfollowCharacter: '40842140a2e9467f854870c6ad20e3dcf17bece652',
  },
};
