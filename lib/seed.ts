import type { ActionSnapshot } from './types.js';

/**
 * Bundled action-hash snapshot from the mage.space Vercel deploy
 * `dpl_5GCsewvKe5dygHMc6sVMECG7Brad`, discovered on 2026-10-26
 * (`docs/api/actions.md`, `docs/api/characters.md`).
 *
 * @remarks
 * Used as a warm seed so the very first call does not pay the discovery cost.
 * Hashes change on every deploy; when one goes stale the client re-discovers
 * automatically (404 → invalidate → refresh).
 *
 * @remarks
 * Refreshed from the 2026-10-26 deploy: all 83 actions observable in the current
 * `/explore`, `/creations`, `/characters`, `/references` bundles were updated to
 * their current hashes. Notably `createCharacter` is unchanged in name/path/args
 * — only its hash rotated (`401ceece…` → `40fd9c8c…`). The four billing actions
 * `getMyUserMembership`, `getActivePowerPack`, `getUnusedPowerPacks` and
 * `getPowerPackStatsById` were removed by mage.space in this deploy: they are
 * absent from the full action set and have no renamed equivalent (billing was
 * reworked around `getCheckoutPaidStatusParallel`, `getCreditsPaginated`,
 * `purchaseGemsInApp`, alongside the retained `getCreditBalance` /
 * `getSubscriptionPlayUsage` / `getLastGemPurchaseType`). None are in
 * {@link REQUIRED_ACTIONS}, so dropping them is safe.
 *
 * @remarks
 * Image upload uses the signed-URL action `getEntityImageUploadUrl` (hash
 * unchanged across this deploy); the old base64 Server Actions
 * `uploadCharacterImage` / `uploadReferenceImage` (and `uploadTempCreationImage`
 * / `uploadUserImage`) were removed by mage.space in favour of the
 * `get*UploadUrl` signed-URL helpers. See `docs/api/upload.md`.
 */
export const SEED_SNAPSHOT: ActionSnapshot = {
  deploymentId: 'dpl_5GCsewvKe5dygHMc6sVMECG7Brad',
  discoveredAt: Date.parse('2026-10-26T20:00:00.000Z'),
  hashes: {
    createUserSession: '60ae31ddafa2a69fd79229a4eb09856137e4e384cb',
    deleteUserSession: '00420e1ee3fbc714397599afeaac1c5c314bee0779',
    getUserHydrationData: '404d4c966c2f065cefe2f1cadfd0ff781726f8e5aa',
    runArchitecture: '402bcc05b4c4482073f22e16f69fdecf2aeda87fb1',
    getHistoryById: '40ac9f3ee60e14741409d4026d9600b22fd91ddd1e',
    cancelArchitectureJob: '40d6a8d154f811199d9235addb09345d349d904cab',
    cancelAllRunningArchitectureJobs: '006a1238d484562ab14d5f71810faa8a0f7cd0ab07',
    getMentionSuggestionsParallel: '7f531e87796edfd728e6ee827b3a171ee29b8cd6fa',
    createCharacter: '40fd9c8ce5ca6cba0e21e28849a54b502020ddc20b',
    updateCharacter: '60a7ce901122ee6d8ea8d17a49c4d9cc527a5c17db',
    deleteCharacter: '4036d7c2a245bfafc14969e62da5c45c6a00aa8b2e',
    getCharacter: '4064f97d55bb11f3cc81ab1bebcf0977003987c2b4',
    getCharacters: '4023daa6fa1fc49e6c8019270678275814d3b08df5',
    getCharactersPaginated: '70f24bd334ce2d4c887a0644a8683b8b490ed9317a',
    publishCharacter: '406a27d8231b67cfb14448fdc56cb6d614b5b84d03',
    unpublishCharacter: '403a03eb917ee8dd43bd5c243d902e0161ef008ebf',
    getEntityImageUploadUrl: '781afde0255a669e470017f5a4174f4bef8a1b5a5a',
    createReference: '40ae1753c005934498d26dd3a500e75b43e5559d48',
    updateReference: '600e41496c80696ab95c6854bd3718b00aaa7904e9',
    deleteReference: '409dc4241a0a1f9852bb3cb1d04c826b9c74c872ca',
    getReferences: '60934c8352fa8d0933fb8127dd09aae9c89e46a68f',
    getReferencesPaginated: '70d6992046a6324be318a5e90e158235dd94c8a776',
    getCreationsPaginatedParallel: '7f65e7411c1a217489b1eb017d268c3b35bf98f96e',
    getHistoryPaginated: '785db5cb15b61f94620957af12c17cf82ab4ef6759',
    clearUserHistory: '40d13dc39050b6f434591fc356531b490b3fe900d6',
    deleteHistory: '405c46d1f3b8f5828645599d0c7210c7a84d6021a8',
    deleteManyHistories: '40a1b51b37ce9dcdf4acac7e1a57948d72b84b5e6e',
    deleteCreation: '403c9e7a9cb0518ff8cbefd5ed08827fb906898756',
    deleteManyCreations: '40f7890fde290bf993ce59dbd21fa8e1e43a065a60',
    saveCreation: '60ea2b5a9407fc0f4a8e434eb00d3e5fdf13a2cbbe',
    saveManyCreations: '40972ff0bf58c3b1e029aef6a73a67fa0fb629b7cc',
    generateCharacterVoice: '6049f6938effbafebd277035342be3200d8f4de4e3',
    followCharacter: '4064ff82ea68e7fe36f32b5e7322ecc1c8aeceb2e5',
    unfollowCharacter: '408c1211750f158fa3713824dccee35822a80492ad',
    getFilteredCharacterIds: '40795357b9ac5d27ae58e703f2c27f62d0342e4ba7',
    getFilteredReferenceIds: '409f158bc398dcfe56346dd957ab8ae658dbd23545',
    getConceptsParallel: '7f21ebc82369a9bca0126ed2e6c836e36441249e5f',
    getConcept: '40566bdb1d0b472d95abc9475576974c795a79d724',
    getModel: '40eda184880e733bad92a5aedfdb3d1f5b3daf1b8b',
    getModels: '7011a570bcb00b01623ac736f47fdede7b99177b4f',
    getArticlesParallel: '7f8e6ff0fe9a72499faf03cc98a2bd5ce71d1b1e67',
    searchUsersParallel: '7ff99943db656d4ecc803fcaa7fba631480bb47366',
    getEmbeddingParallel: '7fb99b565318150f973646ecccdf2b3426cb879332',
    getLatestPublishedArticleCached: '7f75bed0b233e8b2205569d099e843602b6fe388e6',
    hasPurchasedGemsParallel: '7fd3f9d68f1fabe1958a2c702a4c2ca8bf021c706c',
    syncStripeSubscriptionParallel: '7f8bd0e276ae8503623cc50ebdc592c94198bf831c',
    getSubscriptionPlayUsage: '4048ed2954e046cf83155305c36a24f0e7e86b5ed1',
    saveContentSettings: '409fa50253311de4ef4dec31eec8b82e25e6decd61',
    deleteUser: '4021f3fb6c955a49ef59f3975c5d8a036c7d29e0d7',
    getActiveUserBan: '405354f2d35d1d06b2cb5fa31eeb45864ac035c59c',
    getCreditBalance: '0099d7cf034774a8fb8d3221a600a309eac1155457',
    getCreditBalanceBreakdown: '00e34512ac9133fe9a45026823ebddc4e714bba4a5',
    getLastGemPurchaseType: '00638a7cd326374189f2e06f465442e9f81eae6269',
    getCheckoutUrlWithStripeDirect: '7c0e08e955d2d11556f5ce569094cea7409af88cc9',
    getPortalUrlWithStripeDirect: '40197977e7dc77e9829c313803c2e6ebaf6a868cd3',
    removeInactiveSubscriptions: '00899d7b3a304d3a686b723bd28449a9a885c02607',
    hasCreatedImageReference: '00ffa56876d2d7c43e17c13f5ccccc5931316aa36c',
    createLink: '4047b485a9e9e27b407c86f2c88d8f4695c3be41c1',
    tempToPermanentFile: '40ddebfc3fe8d6c65ef7befdce542ddee4f7dac487',
    getUserImageUploadUrl: '708cb9e4a5c1e559767da1ee10973110a1b997dbf8',
    getTempCreationImageUploadUrl: '704627b40bb3e05fdef984855337faa291fdb33090',
    getUserAudioUploadUrl: '70c9e4f11fa8fc99bc5f13b27727c6a29200ea3ae1',
    getUserVideoUploadUrl: '703f5253b382043661483db0e83014a84aac9f8bb0',
    processVideoFromUrl: '70f0f714848a37e4f206c47f4c3669cd055f404975',
    processAudio: '60afc81c400288b2168759125c5b0350943a50ff53',
    segmentImage: '406ff16408d9a03af5855741977d50996c44ba2d44',
    moderateMedia: '40ac84dc5a850303d6e050cd53b4b4e5649cee4dac',
    checkSharedUsernameAvailable: '6044940aa53f25d5139d21c300039d68a79ab4fde2',
    getCreationTagCountsParallel: '7f1a073a2e40d9d236e1e4c2f89fa77c170790d62f',
    updateCreations: '407d2cb18873d0dd97ee81a625dd635e97eccdfc50',
    getCreationsPaginated: '78d4e3d935a0c0af743e5b4c5031bfb05d4f191934',
    resolveMoodboardRuntimeSelection: '403770fec1d80d0c5c8a103e0bfe037ab635ba2e2c',
    saveProfileCollections: '40318d1ddc9eb41f11a4d08588433f90a0310da40e',
    banUser: '70118d353af2f592989b8fbc3acab0c46aeefb4aab',
    undoTemporaryBanUser: '40fbefb93af5d5b029d1e333edb6544c659b14dfbb',
    temporaryBanUser: '78234d1bbd2d5621ffcc55b9000b66ab0202cf497d',
    getCharacterFollowStatus: '40f1b54f4065d31a99c67309786487eaf41fdbc520',
    reportCharacter: '40b11086a00dff898ef7f7f80ae8c537a2547a3b1b',
    toggleFeatureCharacter: '40f5edb2c289a94b310e95c12342daff43d8ec421b',
    getSiteAlertParallel: '7f5ed97617116ed1f47d7fb2c88624dfbb55345971',
    getChatsParallel: '7f8daecffa6c8dd6723151a297cdf43e63ead7cd6d',
    getChatMessages: '400e2a5593937330a37b0068493a64375cb9b47e5e',
    markChatRead: '407a906281e43ad462f29f19bb3bd04044cfd68eb8',
    getPostMediaFeedParallel: '7f378bb8d192cf9fb6716f92e59360c937c7441fc9',
    createAutoCreationCampaign: '4008f72effa32f778473ba4ba17d2d749f5557ea18',
  },
};
