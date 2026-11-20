# NSFW matrix (documentation-based, 2026-11-20)

Which Mage models allow adult content, with the evidence behind every cell. Short version: **Mage's Terms prohibit pornographic/explicit sexual content on every model; what differs is how much *suggestive* or artistic-nudity content each model's filter lets through.** This matrix is built from documentation only; no generated output is used as evidence.

## How to read this

Verdict vocabulary: **allowed**, **restricted** (policy forbids or a filter limits it; may still pass in practice), **blocked** (documented hard refusal), **unknown** (no reliable evidence).

Two content levels:

- **Suggestive / non-explicit adult**: lingerie, boudoir, artistic or classical nudity, no sex act.
- **Explicit sexual**: sex acts, pornographic imagery. *Not tested.*

Evidence levels:

| Code | Meaning |
|---|---|
| L1 | Official policy or provider terms |
| L2 | Mage docs, blog, FAQ or catalog data |
| L3 | Third-party / community reports (SEO blogs are weak sources) |
| L4 | Manual observation (reserved for the last column, to be filled by Nic) |
| L5 | Inference |

## Policy layer that applies to every model

- **L1, Mage Terms and Conditions** ([terms](https://www.mage.space/terms-and-conditions)): "We prohibit generating, promoting, distributing, or sharing pornographic content", and the acceptable-use list forbids use "for pornography and other mature audience content (e.g. explicit sexual acts)". "Breastfeeding and other depictions of nudity in non-sexual contexts are generally permitted." Sexual content involving minors, non-consensual content and real-person likeness without consent are prohibited everywhere ([content rules](https://docs.mage.space/policy/content-rules.md)).
- **L2, marketing vs terms:** Mage's site says its own models have "fewer filters than mainstream tools, within clear legal limits" (`llms.txt`) and promotes "creative freedom". That is a statement about *filters*, not a permission for explicit content, which the Terms forbid.
- **L2, who refuses:** [Failed or blocked](https://docs.mage.space/troubleshooting/failed-or-blocked.md) separates "Mage's rules" (apply to all models, rephrasing does not help) from "a lab's filter" for GPT Image 2, Grok Image/Video, Nano Banana 2, Wan 3.0, Seedance and Seedream; and adds "The same prompt may run on a Mage model."
- **L2, billing of refusals:** API docs: a provider block is refunded; a block by Mage's own policy keeps the Gems. Error codes `content_blocked` (403/451).
- **Account-level settings:** *Mature Mode* (Settings → Content) only controls what can be **shown** to you in results and the feed; "it does not change what is permitted on Mage" ([settings](https://docs.mage.space/start/settings.md), L2). Creations are private by default; posting to Mage Social is opt-in with its own standard. I found **no age-verification step and no plan requirement** for content rules in Mage's docs (the rules are "the same for everyone"). Third-party SEO articles claim a "safe mode" toggle or a Pro requirement for adult output ([example](https://blog.picassoia.com/mage-space-free-tier-nsfw-policy-what-is-allowed-limits-and-filters)); they contradict each other and the official docs and are **not** relied on (L3, low reliability). API/MCP use requires a first payment (any pack or plan), but that is billing, not content gating.

## Method and status

This matrix is built **from documentation only** (provider policies, Mage docs, blog and release notes, catalog tags, a few third-party reports). No NSFW or borderline generations were run for it. The "Verified by Nic (manual)" column is intentionally empty, to be filled after manual testing.

## Image models

| Family | Who runs / filters | Suggestive, non-explicit | Explicit sexual | Evidence (level) | Verified by Nic (manual) |
|---|---|---|---|---|---|
| Mango (all, incl. Mango 4) | Mage model | **allowed** | restricted: ToS forbids it (L1); technical enforcement undocumented (unknown) | Mage: Mango 3 "excels at fantasy, romance, and sensual themes"  (L2, [blog](https://blog.mage.space/article/mango-3-audio-generation/5e723575-0d7e-4e64-a5cb-53e03eb72c95)); Mango 4 "excels at greater creative freedom"  (L2, [blog](https://www.mage.space/blog/unlimited-seedream-55-mango-4)); fewer-filters claim (L2) |  |
| Guava | Mage model | **allowed** (documented, L2) | restricted: ToS forbids it (L1); technical enforcement undocumented (unknown) | Mage-model "fewer filters" (L2) |  |
| SDXL Plus | Mage model | unknown (leans allowed: SDXL base, Mage model) | restricted: ToS forbids it (L1); technical enforcement undocumented (unknown) | L2 general claim only; L5 |  |
| Anima | Open weights on Mage GPUs | unknown (leans allowed) | restricted: ToS forbids it (L1); technical enforcement undocumented (unknown) | Catalog tag `info:Mature` (L2); Danbooru-style anime model, no provider filter documented |  |
| Chroma | Open weights on Mage GPUs | unknown (leans allowed) | restricted: ToS forbids it (L1); technical enforcement undocumented (unknown) | Developer describes it as trained without a safety filter and "fully uncensored" (L3, [summary](https://localaimaster.com/blog/chroma-local-guide)); Mage moderation unknown |  |
| Flux 2 (dev) | Open weights on Mage GPUs | unknown (leans allowed) | restricted: ToS forbids it (L1); technical enforcement undocumented (unknown) | Open weights, no provider filter documented on Mage (L2 origin line); BFL licence terms not checked |  |
| HiDream, Krea 2, MOSS-Image, MiniMax H3 Image | Open weights on Mage GPUs | unknown | restricted: ToS forbids it (L1); technical enforcement undocumented (unknown) | Open weights; no per-model content statement found |  |
| Z-Image | Open weights on Mage GPUs | unknown | restricted: ToS forbids it (L1); technical enforcement undocumented (unknown) | Open weights; no per-model content statement found |  |
| SD 1.5 / SDXL checkpoints (293 tagged Mature) | Open weights on Mage GPUs | **allowed** | restricted: ToS forbids it (L1); technical enforcement undocumented (unknown) | Catalog tag `info:Mature` on all 293 SD1.5/SDXL official concepts, unlimited from Basic (L2). SD 3.5: not tagged |  |
| GPT Image 2 / 2.5 / 2.6 | OpenAI (lab-run) | restricted (OpenAI policy) | blocked: provider policy (L1/L2) | Mage: "OpenAI's safety filter applies, and Mage cannot override it" (L2) |  |
| Nano Banana 2 / 2.1 | Google (lab-run) | restricted (policy) | blocked: provider policy (L1/L2) | Mage: "Google's safety filter applies" (L2) |  |
| Grok Image / Grok Video | xAI (lab-run) | restricted (policy) | blocked: provider policy (L1/L2) | Mage: "xAI's safety filter applies" (L2). xAI's own "Spicy" mode existed in 2025; third-party reports say it was tightened in 2026 and is absent on the web (L3, single source: [roborhythms](https://www.roborhythms.com/grok-spicy-mode/)); not available through Mage |  |
| Seedream (4.0 to 5.5) | ByteDance + Mage "Strict Filter" | restricted (strict filter checks prompt and first image) | blocked: provider policy (L1/L2) | Mage: "strict content filter", refused runs are refunded (L2) |  |

## Video models

| Family | Who runs / filters | Suggestive, non-explicit | Explicit sexual | Evidence (level) | Verified by Nic (manual) |
|---|---|---|---|---|---|
| Cherry (Mini, Cherry, Pro, 2, 2 Pro) | Mage model | unknown (leans allowed) | restricted: ToS forbids it (L1); technical enforcement undocumented (unknown) | Mage-model "fewer filters" (L2). Cherry mirrors Seedance in schema and price (L5), but Mage attaches the strict filter only to Seedance |  |
| Berry, Blueberry, Raspberry, Kiwi, Lemon, Melon, Plum, Magejutsu | Mage model | unknown (leans allowed) | restricted: ToS forbids it (L1); technical enforcement undocumented (unknown) | Mage-model "fewer filters" (L2). Magejutsu: recasting real people needs their permission (L2) |  |
| Seedance (2.0 Mini to 2.5), Wan 3.0 | ByteDance / Alibaba + Mage "Strict Filter" | restricted (filter checks prompt, inputs and finished clip) | blocked: provider policy (L1/L2) | Mage docs (L2): refused requests fail with a notice and are refunded |  |
| Grok Video | xAI (lab-run) | restricted (policy) | blocked: provider policy (L1/L2) | Mage: "xAI's safety filter applies" (L2) |  |
| MiniMax-H3 (incl. Turbo, Pika H3 Flex), LTX Video, Wan 2.2 | Open weights on Mage GPUs | unknown | restricted: ToS forbids it (L1); technical enforcement undocumented (unknown) | Open weights; no per-model content statement found |  |

## Audio models

| Family | Who runs / filters | Suggestive, non-explicit | Explicit sexual | Evidence (level) | Verified by Nic (manual) |
|---|---|---|---|---|---|
| Eleven Music, Eleven v4 (speech) | ElevenLabs (lab-run) | unknown | restricted: ToS forbids it (L1); provider policy not checked | Audio: sexual imagery does not apply; speech/music content rules not researched |  |
| MiniMax Music 3, Seed Audio | Open weights / provider unnamed | unknown | restricted: ToS forbids it (L1) | No per-model statement found |  |

## Reading the matrix

- **Documented most permissive:** Mage's own models (Mango, Guava, and the Mage video models): Mage says they have fewer filters and promotes Mango for "sensual" and "creative freedom" use. That is a statement about filters, not a licence for explicit content.
- **Lab-run models** (GPT Image, Nano Banana, Grok, Seedream, Seedance, Wan 3.0): the lab's filter applies and Mage "cannot override it"; Seedream, Seedance and Wan 3.0 add Mage's "Strict Filter".
- **Explicit content:** forbidden by Mage's Terms on every model. For Mage and open-weights models the technical filter behaviour is undocumented.
- **Mage output moderation:** history items carry a `moderation` object (e.g. `is_nsfw`); seen in generation history payloads. Its effect is presumably tied to Mature Mode display (inferred).
- **Limits of this evidence:** documentation only; marketing copy; filters change often; no model was tested for this matrix. The last column is left empty for manual verification.
- Official wording to quote when in doubt: Mage Terms ("We prohibit generating ... pornographic content"; non-sexual nudity "generally permitted").
