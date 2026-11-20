# Two ways to drive mage.space

mage.space is reachable in two very different ways. This project implements the first; the second is documented so you can choose deliberately. Facts below were checked on 2026-11-20 against [docs.mage.space](https://docs.mage.space) and the live site; items marked *judgement* are opinion.

| | **A. Server Actions (this library)** | **B. Official API / SDK / MCP** |
|---|---|---|
| What it is | The same private calls the web app makes (`POST` + `next-action` header, RSC responses) | Documented REST API `https://api.mage.space/v1`, TypeScript/Python SDKs, MCP server `https://mcp.mage.space/mcp`, ComfyUI nodes |
| Docs | [`actions.md`](./actions.md), [`generation.md`](./generation.md) | [`public-api.md`](./public-api.md), [docs.mage.space/api](https://docs.mage.space/api/overview.md) |
| Auth | Firebase refresh token → id token → `__session` cookie (`createUserSession`) | API key `mage_sk_…` as `Authorization: Bearer`; up to 10 active keys; keys work only after a first paid purchase (Gem pack or plan), otherwise `402 payment_required` |
| Stability | None guaranteed. Action hashes rotate on every deploy (discovery + retry handle it); argument shapes change without notice (e.g. `getCharacters` ids → uid on 2026-11-20); actions disappear (`getModels`) | Versioned (`v1`, additive changes only), OpenAPI document, stable error codes, idempotency keys |
| Billing | The account's **plan applies**: unlimited models run at 0 Gems (verified: e2e generations on Pro Plus left the Gem balance unchanged); otherwise Gems | **Gems only.** Docs: "Membership plans and their unlimited models do not apply to the API." Every request is charged; provider-blocked requests are refunded, policy-blocked ones are not |
| Rate limits | Not published. Observed: a second concurrent generation session on the same account returned `429` and cascading `500`s | Published: 20 generations in flight per account (app + API combined), `429 too_many_requests` beyond; 4.5 MB body, 100 MB per media input; results kept 30 days; edge rate limiting possible |
| Feature coverage | What the web app exposes, including features the API may lack (social, chat, notifications, history management, Sidekick). This client models only a subset (image/video generation, history, characters, references, upload) | All 37 model architectures, uploads, characters, references, account balance, cancel. No social/history management |
| Models | Any concept in the web catalog, including legacy SD checkpoints and concept ids not in the API enum | Architectures and `model_id` enums in the OpenAPI document; some web ids differ or are missing (see [`models.md`](./models.md#web-ids-vs-api-ids)) |
| Content rules | Same Mage ToS and provider filters | Same; plus `content_blocked` errors with a `reason` |
| ToS / account risk | Not an authorized interface. I scanned the published Terms text for clauses about automation/scraping and found none, but absence is not permission; Mage could rate-limit or ban *(judgement: low-moderate for personal use, higher for resale/high volume)*. Not legal advice | Explicitly supported |
| Operational cost | Maintenance: re-discover hashes, track signature changes, no SLA | Pay-per-use, predictable; official SDK handles retries and polling |
| Works in browsers | Needs a server or proxy (cookies, origin headers) | No CORS: server-side only, keep the key secret |

## When to use which

- **Use the official API/SDK/MCP when** you build a product or anything others rely on; you need guaranteed behaviour, published limits, idempotent retries, or the newest models as soon as they ship; your use is commercial or high-volume; or you cannot tolerate breakage on each Mage deploy. *(judgement: this is the default recommendation.)*
- **Use Server Actions (this library) when** you want to spend an existing subscription's *unlimited* quota instead of paying Gems per call (the API cannot do that); you need web-only features or catalog entries the API does not expose; or you are experimenting with personal automation and accept the breakage risk.
- They are not exclusive: a pragmatic setup uses the API for production paths and this library for plan-covered personal batch work.

## Decision for this repository

This library stays a Server Actions client. It does **not** wrap the REST API or SDK: Mage ships and maintains an official TypeScript SDK (`@mage-space/sdk`) and a Python SDK, so a second wrapper would duplicate it. Point API-only users there.
