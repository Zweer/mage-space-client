import type { ActionSnapshot } from './types.js';

/**
 * Bundled action-hash snapshot from the mage.space Vercel deploy
 * `dpl_AbcS43rqLqmYqZwBpkqWiNKDB9Zc` (the 2026-11 relaunch), discovered on 2026-11-20
 * (`docs/api/actions.md`, `docs/api/README.md`).
 *
 * @remarks
 * Used as a warm seed so the very first call does not pay the discovery cost.
 * Hashes change on every deploy; when one goes stale the client re-discovers
 * automatically (404 → invalidate → refresh).
 *
 * @remarks
 * Refreshed from the 2026-11-20 deploy: 81 of the previously seeded actions were
 * re-hashed. `getModels`, `getSubscriptionPlayUsage`, `saveContentSettings` and
 * `deleteUser` no longer exist and were dropped (none is in the required set).
 * `getCharacters` now takes the owner uid, not an id list.
 *
 * @remarks
 * Image upload uses the signed-URL action `getEntityImageUploadUrl`; the old base64
 * upload actions were removed earlier. See `docs/api/upload.md`.
 */
export const SEED_SNAPSHOT: ActionSnapshot = {
  deploymentId: 'dpl_AbcS43rqLqmYqZwBpkqWiNKDB9Zc',
  discoveredAt: Date.parse('2026-11-20T09:14:20.194Z'),
  hashes: {
    createUserSession: '608476c02ae673fd60fd8bb9672e81de9680db5a17',
    deleteUserSession: '00aa3eda0e7667e2a74a6ba9598eb38c36d44cb936',
    getUserHydrationData: '40ade67446987feb0f8573df5b27c7a10775499dc8',
    runArchitecture: '4045c99381803b4c1f5b069f393dee3db9c4468e37',
    getHistoryById: '40322a9af0ebf07a894979863c644e64caaad63474',
    cancelArchitectureJob: '4089ffca46ca40bd20dd69bb45516566ea811d7bdf',
    cancelAllRunningArchitectureJobs: '0039ea9d8906c814b0da9cca85d2bf0ce3265cd1e7',
    getMentionSuggestionsParallel: '7f107f755639b5a1207660c6694914744d64e8be75',
    createCharacter: '403bb31f8c7652fd855565e6010a4c46c0e5618151',
    updateCharacter: '600fae62188a4c62904a84a887bcb7022b29c301ee',
    deleteCharacter: '4063943a6dd0cd6d11a4575fdf9655929818f7ed6d',
    getCharacter: '40bc0bc3e38e331ad182d09850d601dc0ec620261f',
    getCharacters: '40018fdb48f9c377f8bae2fc540ba65bdb42431842',
    getCharactersPaginated: '70b7b4ec95b941f9c459d22bb3e29299b819738513',
    publishCharacter: '40283cb4522acf07c9ce12ff90570164992f2172a9',
    unpublishCharacter: '40c2da1dbde8d74da898d6272cdf4364aedbf250bc',
    getEntityImageUploadUrl: '78bb7f0bf33156e2d74d9ce8e0941973f44a3522a9',
    createReference: '4097a19ea64797b174667ace0f7244cf181663d2ad',
    updateReference: '60d048ea93dabbaa03a2fa2e5a63e2c1ef13eaddbe',
    deleteReference: '401f5c34e95aba330a01e62bfe991c8078fc76ba8b',
    getReferences: '606a2bb1c3978167cb09d1a192b0f81f3c34de44ee',
    getReferencesPaginated: '70264524b70d51ce6ea9c07e85eb96b17a62e9858c',
    getCreationsPaginatedParallel: '7ff57892339f6d9dc54710c95892b2aeb9abb0710c',
    getHistoryPaginated: '78a1553a323fee3f81405fecf95fb96ee7ecbef5bf',
    clearUserHistory: '4078fdbee82a09fdff673356609cce9232641c73c3',
    deleteHistory: '40354949667df856ceac4f84bfc29ad6ad53c64c17',
    deleteManyHistories: '40087c2b70cacb0d23d43ad6188f8d531354ba0964',
    deleteCreation: '40265a01ba731f593e8b78bf765fcdcfd518b4d4fc',
    deleteManyCreations: '405e37b411c1ef55190a71d784dc6735b1d29d412f',
    saveCreation: '60af09153b270276e9adc535407d6af05f244a4512',
    saveManyCreations: '401d82854f0e2182ebb710f1d60fa5351d9e7529b3',
    generateCharacterVoice: '6064b58deb18f1a05ea2744060b968fd203bffdafc',
    followCharacter: '407ad744f1515100b330d3552993beb9b1da014975',
    unfollowCharacter: '402a303d3c117bd0dcc5d970c0456be339eeac9f87',
    getFilteredCharacterIds: '40055834f9c048b50f35eed39d9a40b3bd812ce42c',
    getFilteredReferenceIds: '406b9b8d3560cda45950fc46decd56fbf1716b7ccb',
    getConceptsParallel: '7f0df368ca884fd604f18fe9f4ae6ef76b11782111',
    getConcept: '4072589c844754faafe075e239a7ab225fc0c936a3',
    getModel: '4092fd31efbd20447e9ff9761d1942f927320a4763',
    getArticlesParallel: '7f05c310aafcc26ca589214608a7a83924d05adcfe',
    searchUsersParallel: '7f963c08662124bc5419baca3cefb1225ff7656f53',
    getEmbeddingParallel: '7f22945b721e50457fae95623d8f977387a77000e5',
    getLatestPublishedArticleCached: '7f573546e7bfca4e0d52ccff94afba17412d25159e',
    hasPurchasedGemsParallel: '7f6adcdc84f2b34248e8d598ae01df8fb7846b4aea',
    syncStripeSubscriptionParallel: '7f716a451d1aa6e7eaa8aefbcaaede8668ae16b90b',
    getActiveUserBan: '40d57121c02ffc7f013e594a4876454259e0b7111c',
    getCreditBalance: '0089a4fb1f80ed8d12e3e9804eae0be93061ad25e4',
    getCreditBalanceBreakdown: '0008b7d642404145731d1de5ec6c64980bcd15ad33',
    getLastGemPurchaseType: '001df6d323bca822444c6e04339a8897fa133e6210',
    getCheckoutUrlWithStripeDirect: '70f78eba45dc987c9ccd01b1198225f8ecd9e8de44',
    getPortalUrlWithStripeDirect: '40026d8e410c88b2a00f036b677ecbfc9fa3043807',
    removeInactiveSubscriptions: '00bb6754ee5e54008ebbda0470756f484a4177e248',
    hasCreatedImageReference: '007a7abcc4fb3a0ce557a19a8f23e04415aa325585',
    createLink: '408c659278d9360c6a5841842794d732d9d559d8a9',
    tempToPermanentFile: '403838a91699ecdf0ed60f9c45ddbde9735e96b55a',
    getUserImageUploadUrl: '70e1484c5f1dca96ecd64fc0ab81be35da5f0d1f03',
    getTempCreationImageUploadUrl: '7069216d283eddde6b2d613b06759be1b1b4ac8197',
    getUserAudioUploadUrl: '700c19784f00cd7becf6e92e67c60478a404e011ba',
    getUserVideoUploadUrl: '70608e42301eedc99e62b1626bd82391bdc58d62da',
    processVideoFromUrl: '7081fc4e34cc1d2bb4ff62b887732397bc491917e4',
    processAudio: '6038aa7a84eb217568c7272addd53f4b3307858fbb',
    segmentImage: '40ebe1ba10f21b948c374ec7c24c47e7c6c46bd3ca',
    moderateMedia: '40e8a51f18785da80ee134eb380f43e5ecf803b749',
    checkSharedUsernameAvailable: '60f7ad4c852129f0d283ce6e5e417a83d236a126c5',
    getCreationTagCountsParallel: '7fe061f89cfa98a098993ca855c3edaf8e1e4185cf',
    updateCreations: '40be8cbc45cb8a9cf8c17bd4e83790e168a72efefa',
    getCreationsPaginated: '78f9d117934f5e783fd32014708c8d4130747c1a7e',
    resolveMoodboardRuntimeSelection: '40748ad158c95bcc4e95e7cabf189709bf0dc6719d',
    saveProfileCollections: '40d702531d361efbb04f698aa32060e3d3b6026870',
    banUser: '7026ebc2e4f626e34b6cdf6f8b92e27018b400f763',
    undoTemporaryBanUser: '404597b93e93529faae1ebe6c9ea4ed3cedf2404cf',
    temporaryBanUser: '7886bce6bd99c533f2948feb9bfcf240b84936e6a7',
    getCharacterFollowStatus: '4066e110c7b2bfe5da52f9d28778db151c1e0f3473',
    reportCharacter: '4076281d8d9f66faee0d0f66f1f41ca277a18b80f2',
    toggleFeatureCharacter: '4061e2cf738b7b00c10db907589fe9bbe88423d969',
    getSiteAlertParallel: '7f992fa3d80e52fbfc20a56e75b1fbe82af099870d',
    getChatsParallel: '7ffdecc76ff95660d6fec5abb18292547b853abfc2',
    getChatMessages: '40f0177f7aeafaebcc01794e061112acf2622ab10d',
    markChatRead: '40240dd7e1ce3625cb47016b6d7b3ffef0cb7a77de',
    getPostMediaFeedParallel: '7f57ceb7ce7eff73b799932e8740190dc108188136',
    createAutoCreationCampaign: '40071dfcbea100ffc26e3e094407f88f79b7fa89e9',
  },
};
