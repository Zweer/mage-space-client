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
  deploymentId: 'dpl_GyxfTHM2jdjuzHUigkBk6HBjaTmC',
  discoveredAt: Date.parse('2026-08-20T00:00:00.000Z'),
  hashes: {
    createUserSession: '60796645ef842da730c1034b405ef11a0ded7a2c9f',
    deleteUserSession: '0054bf08b98ebd0f90480b3404d25317edc351ff92',
    getUserHydrationData: '407d108261e327f63f73bde144f5c776216e5a7297',
    runArchitecture: '4005bcac9aed1481ebb903b9c5911acac73f432ff6',
    getHistoryById: '40cdd78015cd21d26df3c9c325ea2704f8f13a2ae4',
    cancelArchitectureJob: '4071b4f6ea44897d667c1622b6653d0969b6eeae26',
    getHistoryPaginated: '7875f2fa41c3d55b389fc1b34181a1803f6f646be3',
    getMentionSuggestionsParallel: '7f5a8ea5ed131d431a91044826703f88dceb840a8f',
    createCharacter: '40177a6c90dda155c431cb107da60e15afcbbbfdb0',
    updateCharacter: '6039f2d6f83bbfe3738b787df3cf5b2d82a742d357',
    deleteCharacter: '4027dd1bf2d8bc6ce3f34f431eed9de59693ffa027',
    getCharacter: '40149ff975b8865da499d11eeb579dd2d809fcb265',
    getCharacters: '4007d20f286bc20696351ba86b781b3e1f885b9c0e',
    publishCharacter: '40357ac7d00ec084f3239902c9d361f7f83e78c1c8',
    unpublishCharacter: '407f8948eff1e35275c572502884c819ede3db31e1',
    uploadCharacterImage: '60b79b2f7946127c772bae28a1679dacc410923982',
    uploadReferenceImage: '603e25be445be62d9c5f8421c52511b1504d7e302a',
    createReference: '4073db8d589426714d0a85d2c533ed675f4e9f68dd',
    updateReference: '6063e8804112d2044425c99657c027f2a5c0699500',
    deleteReference: '40b8b1b3ab9ea36c544ba7850338f6a1f23322993b',
    getReferences: '60f28c040e0ac53e48d279cf2975c494a044dd2043',
    getReferencesPaginated: '701ba70e5d8346632dfc8e4f76a30b498cb3055a37',
    getCharactersPaginated: '70265ae293aa8d21ada5754c2a8dc4920c659b02b1',
    getCreationsPaginatedParallel: '7f349c962c601c001d95b925b1061e50733473ac48',
    deleteHistory: '403a317d5e95e65e530d3de332d3c63d7892619503',
    deleteManyHistories: '40325cffdf4624359a334ea27f2f32ccfa342344b5',
    deleteCreation: '40cefd4b1d15e93f285f4631ef570fd32af493d9f4',
    deleteManyCreations: '408e7350efe4ac7128a0b9ee66b36bbf75010ca020',
    saveCreation: '6059d118f7e77bd2949af8ed449b968487b21870ad',
    generateCharacterVoice: '60b9427a2e4a8040bdafaa9038f1ac4dca2082a326',
    followCharacter: '40fbbe0bb685770c68cab568e99c0d7a49a340db2b',
    unfollowCharacter: '401ed44c0f975e4135ddc91a06259a30d33cd773f2',
  },
};
