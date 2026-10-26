# Billing, Credits & Gems API

Reverse-engineered and discovery-verified against `https://www.mage.space` on
2026-10-26 (deploy `dpl_5GCsewvKe5dygHMc6sVMECG7Brad`).

## TL;DR — what changed

A Vercel deploy **reworked the billing / power-pack surface**. Four actions the
client's seed used to carry were **removed** and have no renamed equivalent; the
membership/power-pack concept was replaced by a credit/gem-centric surface.

| | OLD (seed 2026-08-24, gone) | NEW (current) |
|---|---|---|
| Membership tier read | `getMyUserMembership` | *(removed — tier now comes from `getUserHydrationData`)* |
| Active power pack | `getActivePowerPack` | *(removed)* |
| Unused power packs | `getUnusedPowerPacks` | *(removed)* |
| Power pack stats | `getPowerPackStatsById` | *(removed)* |
| — | — | `getCheckoutPaidStatusParallel` (new) |
| — | — | `getCreditsPaginated` (new) |
| — | — | `getInAppPurchaseContext` (new) |
| — | — | `purchaseGemsInApp` (new) |

The four removed names return **zero** `createServerReference` hits across the
full action set of this deploy (166 actions scraped from the HTML-referenced
chunks of `/explore`, `/creations`, `/characters`, `/references`, `/settings`
plus the `webpack-*.js` named-chunk list). This mirrors the earlier removal of
the base64 upload actions (see [`upload.md`](./upload.md)).

## How this was verified (discovery, no credits spent)

1. Fetch the raw HTML of the discovery pages and extract
   `/_next/static/chunks/*.js` references (the client's `CHUNK_RE`).
2. Also parse `webpack-36c178c1cdc92c4e.js` for the literal and
   `"static/chunks/"+e+"-<hash>.js"` chunk names, to reach lazily-loaded chunks
   that the page HTML does not reference statically.
3. Download every resulting chunk and extract all
   `createServerReference)("<hash>",…,"<fn>")` pairs (the client's
   `CREATE_SERVER_REF_RE`). 166 distinct actions on this deploy.
4. Grep the full set for `member`, `power`, `gem`, `credit`, `subscri`,
   `checkout`, `portal`, `stripe`, `plan`, `usage`, `purchase`, `paid`.

No authenticated call and no mutation were made — this is a pure bundle-read
discovery. Observation only; no credits spent.

## Current billing / gem action surface (2026-10-26)

> Hashes change on every Vercel deploy; captured here for reference. The client
> resolves them dynamically via discovery (and the warm seed in `lib/seed.ts`).

| Action | Current hash | Status | Purpose (inferred from name) |
|---|---|---|---|
| `getCreditBalance` | `0099d7cf034774a8fb8d3221a600a309eac1155457` | retained | Current credit balance |
| `getCreditBalanceBreakdown` | `00e34512ac9133fe9a45026823ebddc4e714bba4a5` | retained | Credit balance breakdown |
| `getCreditsPaginated` | `788051a66ce806c08d737cc5dd4604a7aba1dcb795` | **new** | Paginated credit ledger |
| `getLastGemPurchaseType` | `00638a7cd326374189f2e06f465442e9f81eae6269` | retained | Last gem purchase type |
| `hasPurchasedGemsParallel` | `7fd3f9d68f1fabe1958a2c702a4c2ca8bf021c706c` | retained | Whether the user has ever bought gems |
| `purchaseGemsInApp` | `40c5b9eac7e7e25788f86b923f0454e179e02cbaff` | **new** | In-app gem purchase (mutation) |
| `getInAppPurchaseContext` | `00288014e1540efa6310cab26327dd0dcecc6cbc40` | **new** | In-app purchase context |
| `getCheckoutPaidStatusParallel` | `7f20788f5b8e1a9d49ca1ecde07fa51c2e521ae3ef` | **new** | Poll checkout paid status |
| `getCheckoutUrlWithStripeDirect` | `7c0e08e955d2d11556f5ce569094cea7409af88cc9` | retained | Stripe checkout URL |
| `getPortalUrlWithStripeDirect` | `40197977e7dc77e9829c313803c2e6ebaf6a868cd3` | retained | Stripe billing-portal URL |
| `getSubscriptionPlayUsage` | `4048ed2954e046cf83155305c36a24f0e7e86b5ed1` | retained | Subscription play-usage stats |
| `syncStripeSubscriptionParallel` | `7f8bd0e276ae8503623cc50ebdc592c94198bf831c` | retained | Sync Stripe subscription |
| `removeInactiveSubscriptions` | `00899d7b3a304d3a686b723bd28449a9a885c02607` | retained | Remove inactive subscriptions |

## Removed actions (gone on this deploy)

| Action | Seed hash (2026-08-24) | Note |
|---|---|---|
| `getMyUserMembership` | `007ce34998f2bf4f19be3cf46e3cfcb387110ae5d5` | No renamed equivalent. Membership tier is available from `getUserHydrationData` (`userMembership`). |
| `getActivePowerPack` | `00a6404083c8958fcd47607a088c1d1a7a5dfd4514` | No renamed equivalent. |
| `getUnusedPowerPacks` | `00b5d80d96598fc2db4641fff117cfa47b37f2482f` | No renamed equivalent. |
| `getPowerPackStatsById` | `4027b533e8532d2f35cbbb7518160d7569b738cb20` | No renamed equivalent. |

## Impact on the library

- None of the four removed actions were in `REQUIRED_ACTIONS`, and no module in
  `lib/` invokes them, so they were simply dropped from `SEED_SNAPSHOT`
  (`lib/seed.ts`) in the 2026-10-26 refresh.
- Tier detection should rely on `getUserHydrationData` (`userMembership`), as
  already documented in [`auth.md`](./auth.md#user-tier-detection).
- The new `purchaseGemsInApp` / `getInAppPurchaseContext` /
  `getCheckoutPaidStatusParallel` / `getCreditsPaginated` actions are **not yet
  modelled** by the client. They are documented here for future work; no live
  (credit-spending) call has been made against them.
