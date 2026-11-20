# Video models

Generated from live data on 2026-11-20: the Mage API OpenAPI document, the web concept catalog (`getConceptsParallel`), docs.mage.space and public provider sources. Labels in brackets give the confidence of each claim: **confirmed** (source named), **inferred** (reasoned from evidence, flagged), **unknown**. See [`../models.md`](../models.md) for the index, ranking and the NSFW matrix.

## Cherry

- **API architecture:** `cherry` · **Mage family page:** [https://docs.mage.space/models/cherry](https://docs.mage.space/models/cherry.md)
- **Origin (Mage's wording):** Mage model ("available only on Mage")
- **Provider:** Mage (possibly ByteDance Seedance underneath)
- **Base / underlying model:** Not stated by Mage. **Inferred:** Cherry mirrors Seedance one-to-one: same API schema (durations 4,5,8,10,15,20,25,30; 480p-4k; 16:9/9:16/1:1) and identical prices (Cherry Mini = Seedance 2.0 Mini 60 Gems/s; Cherry Pro = Seedance 2.0 105; Cherry 2 = Seedance 2.5 Flash 105; Cherry 2 Pro = Seedance 2.5 154.5). Likely the same ByteDance weights without Mage's strict filter, but unconfirmed. [inferred, medium confidence]
- **Release dates:** Cherry/Cherry Pro 2026-04-10; Cherry Mini 2026-06-24 (live 2026-06-27); Cherry 2 Pro 2026-08-12; Cherry 2 2026-11-20 (concept created). [confirmed: Mage]
- **API `model_id` values (default first):** `cherry-2-pro`, `cherry-mini`, `cherry`, `cherry-pro`, `cherry-2`
- **API resolutions:** 480p, 720p, 1080p, 4k; **aspect ratios:** 16:9, 9:16, 1:1; **durations (s):** 4-30 (8 values)
- **Credit cost:** 618 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Cherry Video | `cherry` | `75c3aadc126d45f8a7d643e44d3a8f60` | 2026-04-10 | yes |
| Cherry Pro Video | `cherry-pro` | `2249daef55c245aca6b780b5f823362a` | 2026-04-10 | yes |
| Cherry Mini | `cherry-mini` | `46594e87787745239fa353c66b96633d` | 2026-06-24 | yes |
| Cherry 2 Pro | `cherry-2-pro` | `531c7e0c2be14df699a599af606cf7c8` | 2026-08-12 | yes |
| Cherry 2 | `cherry-2` | `edb73ec405cf49b989763737941382a0` | 2026-11-20 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Cherry Mini | 480p | Gems | Gems | 5s | 8s |
| Cherry Mini | 720p | Gems | Gems | Gems | 4s |
| Cherry | 480p | Gems | Gems | 4s | 5s |
| Cherry Pro | 480p | Gems | Gems | Gems | 5s |
| Cherry 2 | 480p | Gems | Gems | Gems | 5s |
| Cherry 2 Pro | 480p | Gems | Gems | Gems | 4s |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 8, 10 on Cherry 2, and 29 on Cherry 2 Pro |
| Audio references | Up to 3 |
| Character Voices | Yes |
| First frame | Yes |
| Last frame | Yes, with a first frame |
| Video references | Yes, up to 15 seconds of input on Cherry, Cherry Mini, and Cherry Pro, and up to 30 seconds on Cherry 2 and Cherry 2 Pro |
| LoRAs | No |
| Negative prompts | No |
| Resolutions | Cherry Mini: 480p, 720p; Cherry: 480p, 720p; Cherry Pro: 480p, 720p, 1080p, 4K; Cherry 2: 480p, 720p; Cherry 2 Pro: 480p, 720p, 1080p |
| Durations | Cherry Mini: 4 to 15 seconds; Cherry: 4 to 15 seconds; Cherry Pro: 4 to 15 seconds; Cherry 2: 4 to 30 seconds; Cherry 2 Pro: 4 to 30 seconds |

## Berry

- **API architecture:** `berry` · **Mage family page:** [https://docs.mage.space/models/berry](https://docs.mage.space/models/berry.md)
- **Origin (Mage's wording):** Mage model
- **Provider:** Mage
- **Base / underlying model:** Unknown. [unknown]
- **Release dates:** Berry 2026-05-23 (concept created); Berry 2 2026-07-23. [confirmed: Mage]
- **API `model_id` values (default first):** `berry-2`, `berry`
- **API resolutions:** 720p, 1080p, 480p; **aspect ratios:** 16:9, 9:16, 1:1, 4:3, 3:4, 4:5, 5:4; **durations (s):** 3-15 (13 values)
- **Credit cost:** 189 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Berry | `berry` | `31c266df4007481ab59d4607a7d94410` | 2026-05-23 | yes |
| Berry 2 | `berry-2` | `0b1fa74f7347406392422d24f2885684` | 2026-07-23 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Berry | 720p | Gems | Gems | 3s | 4s |
| Berry 2 | 480p | Gems | 3s | 7s | 9s |
| Berry 2 | 720p | Gems | Gems | 3s | 4s |
| Berry 2 | 1080p | Gems | Gems | Gems | 3s |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 9 |
| Character Voices | No |
| First frame | Yes |
| Last frame | No |
| Video references | No |
| LoRAs | No |
| Negative prompts | No |
| Resolutions | Berry: 720p, 1080p; Berry 2: 480p, 720p, 1080p |
| Durations | Berry: 3 to 15 seconds; Berry 2: 3 to 15 seconds |

## Blueberry

- **API architecture:** `blueberry` · **Mage family page:** [https://docs.mage.space/models/blueberry-and-raspberry](https://docs.mage.space/models/blueberry-and-raspberry.md)
- **Origin (Mage's wording):** Mage model
- **Provider:** Mage
- **Base / underlying model:** Unknown. Blueberry's API exposes `shot_type` and `prompt_extend`, field names also used by Alibaba's Wan API; weak hint only. [unknown / weak inference]
- **Release dates:** Blueberry 2025-12-30; Blueberry 2 2026-04-18 (concept created). [confirmed: Mage]
- **API `model_id` values (default first):** `blueberry-v2`, `blueberry`
- **API resolutions:** 720p, 1080p; **aspect ratios:** 16:9, 4:3, 1:1, 3:4, 9:16; **durations (s):** 2-15 (14 values)
- **Credit cost:** 360 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Blueberry Video | `blueberry` | `b605fb4727bf4145b0260e9469636e83` | 2025-12-30 | yes |
| Blueberry 2 Video | `blueberry-v2` | `6a254f203bed47e88d0e22bb09332493` | 2026-04-18 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Blueberry | 720p | Gems | Gems | 3s | 5s |
| Blueberry | 1080p | Gems | Gems | 2s | 3s |
| Blueberry 2 | 720p | Gems | Gems | 4s | 6s |
| Blueberry 2 | 1080p | Gems | Gems | 2s | 4s |
| Raspberry | 720p | Gems | Gems | 4s | 6s |
| Raspberry | 1080p | Gems | Gems | 2s | 4s |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Raspberry |
| Reference images | Up to 2, and 5 on Raspberry |
| Audio references | Up to 1 on Blueberry |
| Character Voices | Raspberry |
| First frame | Blueberry and Blueberry 2, Raspberry |
| Last frame | Blueberry 2 only |
| Video references | No |
| LoRAs | No |
| Negative prompts | Blueberry and Blueberry 2, Raspberry |
| Resolutions | Blueberry: 720p, 1080p; Blueberry 2: 720p, 1080p; Raspberry: 720p, 1080p |
| Durations | Blueberry: 2 to 15 seconds; Blueberry 2: 2 to 15 seconds; Raspberry: 2 to 15 seconds |

## Raspberry

- **API architecture:** `raspberry` · **Mage family page:** [https://docs.mage.space/models/blueberry-and-raspberry](https://docs.mage.space/models/blueberry-and-raspberry.md)
- **Origin (Mage's wording):** Mage model
- **Provider:** Mage
- **Base / underlying model:** Unknown. [unknown]
- **Release dates:** 2026-04-18 (concept created). [confirmed: Mage]
- **API `model_id` values (default first):** `raspberry`
- **API resolutions:** 720p, 1080p; **aspect ratios:** 16:9, 4:3, 1:1, 3:4, 9:16; **durations (s):** 2-15 (14 values)
- **Credit cost:** 360 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** Character video from a first frame plus references and Voices.

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Raspberry Video | `raspberry` | `c53a928bf8ca4252aa1334bd7db0ad3d` | 2026-04-18 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Blueberry | 720p | Gems | Gems | 3s | 5s |
| Blueberry | 1080p | Gems | Gems | 2s | 3s |
| Blueberry 2 | 720p | Gems | Gems | 4s | 6s |
| Blueberry 2 | 1080p | Gems | Gems | 2s | 4s |
| Raspberry | 720p | Gems | Gems | 4s | 6s |
| Raspberry | 1080p | Gems | Gems | 2s | 4s |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Raspberry |
| Reference images | Up to 2, and 5 on Raspberry |
| Audio references | Up to 1 on Blueberry |
| Character Voices | Raspberry |
| First frame | Blueberry and Blueberry 2, Raspberry |
| Last frame | Blueberry 2 only |
| Video references | No |
| LoRAs | No |
| Negative prompts | Blueberry and Blueberry 2, Raspberry |
| Resolutions | Blueberry: 720p, 1080p; Blueberry 2: 720p, 1080p; Raspberry: 720p, 1080p |
| Durations | Blueberry: 2 to 15 seconds; Blueberry 2: 2 to 15 seconds; Raspberry: 2 to 15 seconds |

## Kiwi

- **API architecture:** `kiwi` · **Mage family page:** [https://docs.mage.space/models/kiwi](https://docs.mage.space/models/kiwi.md)
- **Origin (Mage's wording):** Mage model
- **Provider:** Mage
- **Base / underlying model:** Unknown. [unknown]
- **Release dates:** 2025-12-11 (concept created). [confirmed: Mage]
- **API `model_id` values (default first):** `kiwi`
- **API resolutions:** 480p, 720p, 1080p; **aspect ratios:** 16:9, 4:3, 1:1, 3:4, 9:16; **durations (s):** 5-10 (2 values)
- **Credit cost:** 270 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Kiwi Video | `kiwi` | `41b2f96a05d449d8b3f9fcb5ca3bea5d` | 2025-12-11 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Kiwi | 480p | Gems | Gems | 5s | 10s |
| Kiwi | 720p | Gems | Gems | Gems | 5s |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | No |
| Reference images | Up to 1 |
| Character Voices | No |
| First frame | Yes |
| Last frame | No |
| Video references | No |
| LoRAs | No |
| Negative prompts | Yes |
| Resolutions | 480p, 720p, 1080p |
| Durations | 5 to 10 seconds |

## Lemon

- **API architecture:** `lemon` · **Mage family page:** [https://docs.mage.space/models/lemon](https://docs.mage.space/models/lemon.md)
- **Origin (Mage's wording):** Mage model
- **Provider:** Mage (possibly Alibaba Wan 3.0 underneath)
- **Base / underlying model:** Not stated by Mage. **Inferred:** Lemon and Wan 3.0 share the same API schema (2-30 s, 480p-1080p, `audio`, `prompt_extend`, `use_character_voices`) and price (81.6 Gems/s, 245 default). Likely the same Alibaba model without the strict filter; unconfirmed. [inferred, medium confidence]
- **Release dates:** 2026-08-28. [confirmed: Mage]
- **API `model_id` values (default first):** `lemon`
- **API resolutions:** 480p, 720p, 1080p; **aspect ratios:** 16:9, 4:3, 1:1, 3:4, 9:16; **durations (s):** 2-30 (29 values)
- **Credit cost:** 245 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Lemon | `lemon` | `23d5dfa06f664eb782b27ac9ebe089cb` | 2026-08-28 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Lemon | 480p | Gems | 3s | 7s | 11s |
| Lemon | 720p | Gems | Gems | 3s | 5s |
| Lemon | 1080p | Gems | Gems | Gems | 2s |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 10 |
| Audio references | Up to 5 |
| Character Voices | Yes |
| First frame | Yes |
| Last frame | Yes |
| Video references | Yes, up to 5 clips |
| Audio on the output | Optional |
| LoRAs | No |
| Negative prompts | No |
| Resolutions | 480p, 720p, 1080p |
| Durations | 2 to 30 seconds |

## Melon

- **API architecture:** `melon` · **Mage family page:** [https://docs.mage.space/models/melon](https://docs.mage.space/models/melon.md)
- **Origin (Mage's wording):** Mage model
- **Provider:** Mage
- **Base / underlying model:** Unknown. Anime-focused. [unknown]
- **Release dates:** Melon / Melon Pro 2026-06-19. [confirmed: Mage]
- **API `model_id` values (default first):** `melon`, `melon-pro`
- **API resolutions:** 540p, 720p, 1080p; **aspect ratios:** 16:9, 9:16, 1:1, 3:4, 4:3; **durations (s):** 3-16 (7 values)
- **Credit cost:** 147 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Melon Video | `melon` | `ed32d00db56d482193e0d966dd94278f` | 2026-06-19 | yes |
| Melon Video Pro | `melon-pro` | `fbc5f51a32cf40fda8ee0cb5dca6549d` | 2026-06-19 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Melon | 540p | Gems | 5s | 10s | 16s |
| Melon | 720p | Gems | 3s | 6s | 10s |
| Melon | 1080p | Gems | Gems | 5s | 8s |
| Melon Pro | 540p | Gems | 4s | 8s | 10s |
| Melon Pro | 720p | Gems | Gems | 3s | 5s |
| Melon Pro | 1080p | Gems | Gems | 3s | 4s |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 7 |
| Character Voices | No |
| First frame | Yes |
| Last frame | Yes |
| Video references | No |
| LoRAs | No |
| Negative prompts | No |
| Resolutions | Melon: 540p, 720p, 1080p; Melon Pro: 540p, 720p, 1080p |
| Durations | Melon: 3 to 16 seconds; Melon Pro: 3 to 16 seconds |

## Plum

- **API architecture:** `plum` · **Mage family page:** [https://docs.mage.space/models/plum](https://docs.mage.space/models/plum.md)
- **Origin (Mage's wording):** Mage model
- **Provider:** Mage
- **Base / underlying model:** Unknown. [unknown]
- **Release dates:** Plum 2026-08-05; Plum Max 2026-09-09; Plum Fast 2026-10-24. [confirmed: Mage]
- **API `model_id` values (default first):** `plum-fast`, `plum`, `plum-max`
- **API resolutions:** 768P, 2K, 480P; **aspect ratios:** 16:9, 9:16, 1:1, 4:3, 3:4, 21:9; **durations (s):** 4-15 (12 values)
- **Credit cost:** 173 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Plum | `plum` | `a7ba5475d2644b9298972842621dc4b3` | 2026-08-05 | yes |
| Plum Fast | `plum-fast` | `e3399b270bf0498f882965f607d8475a` | 2026-10-24 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Plum | 768p | Gems | Gems | Gems | 5s |
| Plum | 2K | Gems | Gems | Gems | 4s |
| Plum Max | 480p | Gems | Gems | 5s | 9s |
| Plum Max | 768p | Gems | Gems | Gems | 5s |
| Plum Fast | 480p | Gems | 5s | 11s | 15s |
| Plum Fast | 768p | Gems | Gems | 6s | 10s |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 9 |
| Audio references | Up to 3 |
| Character Voices | Yes |
| First frame | Yes |
| Last frame | Yes |
| Video references | Yes |
| Audio on the output | Yes, on every clip |
| LoRAs | No |
| Negative prompts | No |
| Resolutions | Plum: 768p, 2K; Plum Max and Plum Fast: 480p, 768p |
| Durations | Plum and Plum Fast: 4 to 15 seconds; Plum Max: 5 to 15 seconds |

## Magejutsu

- **API architecture:** `magejutsu` · **Mage family page:** [https://docs.mage.space/models/magejutsu](https://docs.mage.space/models/magejutsu.md)
- **Origin (Mage's wording):** Mage model (video recast)
- **Provider:** Mage
- **Base / underlying model:** Unknown. [unknown]
- **Release dates:** 2026-10-31 ([blog](https://www.mage.space/blog/magejutsu-sidekick)). [confirmed: Mage]
- **API `model_id` values (default first):** `magejutsu`, `magejutsu-lite`, `magejutsu-feather`
- **API resolutions:** 480p, 720p, 1080p; **aspect ratios:** n/a
- **Credit cost:** 1586 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** Gems only, no unlimited tier. Recasting a real person requires their permission.

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Source video | Required, 4 to 30 seconds (15 on Lite and Feather) |
| Reference images | Yes, up to 30 |
| Characters and References | Yes, from the reference picker |
| Output length | Follows the source |
| Output aspect ratio | Follows the source |
| Audio on the output | The source's own audio, restored after the render |
| Resolutions | 480p, 720p, 1080p (480p and 720p on Feather) |
| Modes | Motion transfer or object swap |
| Directions | Optional |

## Grok Video

- **API architecture:** `grok_video` · **Mage family page:** [https://docs.mage.space/models/grok](https://docs.mage.space/models/grok.md)
- **Origin (Mage's wording):** Run by xAI (xAI safety filter applies)
- **Provider:** xAI
- **Base / underlying model:** Grok Imagine video. [confirmed: Mage docs]
- **Release dates:** On Mage 2026-05-29. [confirmed]
- **API `model_id` values (default first):** `grok-imagine-video`
- **API resolutions:** 480p, 720p; **aspect ratios:** 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3; **durations (s):** 1-15 (15 values)
- **Credit cost:** 375 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Grok Video | `grok-imagine-video` | `e766372886d8429db301c233e868b1bd` | 2026-05-29 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Grok Image | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Grok Image | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Grok Image 2.0 | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Grok Image 2.0 | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Grok Video | 480p | Gems | Gems | 5s | 7s |
| Grok Video | 720p | Gems | Gems | 3s | 5s |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 3, and 5 on Grok Video |
| Character Voices | No |
| First frame | No |
| Last frame | No |
| Video references | No |
| LoRAs | No |
| Negative prompts | No |
| Resolutions | Grok Image: 1K, 2K; Grok Image 2.0: 1K, 2K; Grok Video: 480p, 720p |
| Durations | Grok Video: 1 to 15 seconds |

## Seedance

- **API architecture:** `seedance` · **Mage family page:** [https://docs.mage.space/models/seedance](https://docs.mage.space/models/seedance.md)
- **Origin (Mage's wording):** ByteDance model run with a Mage "Strict Filter"
- **Provider:** ByteDance Seed
- **Base / underlying model:** Seedance 2.0 Mini / 2.0 Fast / 2.0 / 2.5 Flash / 2.5. [confirmed: Mage docs]
- **Release dates:** Seedance 2.5 launched 2026-07-31 (announced 2026-06-23); 2.0 earlier; on Mage 2026-11-03/05. [confirmed for 2.5: [ComfyUI docs](https://docs.comfy.org/tutorials/partner-nodes/bytedance/seedance-2-5)]
- **API `model_id` values (default first):** `seedance-2.5`, `seedance-2.0-mini`, `seedance-2.0-fast`, `seedance-2.0`, `seedance-2.5-flash`
- **API resolutions:** 480p, 720p, 1080p, 4k; **aspect ratios:** 16:9, 9:16, 1:1; **durations (s):** 4-30 (8 values)
- **Credit cost:** 618 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** Reported #3 on Artificial Analysis text-to-video-with-audio on 2026-10-20 ([metavert.io](https://metavert.io/seedance), third-party reading).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Seedance 2.5 | `seedance-2.5` | `26024d89c4d143d0af2c69c3b3565f76` | 2026-11-03 | yes |
| Seedance 2.0 Fast | `seedance-2.0-fast` | `6f104a555652461993e2fdc95d725a36` | 2026-11-05 | yes |
| Seedance 2.0 | `seedance-2.0` | `001481ef02bf4d47a2593769b19faec0` | 2026-11-05 | yes |
| Seedance 2.0 Mini | `seedance-2.0-mini` | `dc322e0f76f64e649995a2e53de15f98` | 2026-11-05 | yes |
| Seedance 2.5 Flash | `seedance-2.5-flash` | `713f4b3bb422447aa41e4e232a051ddb` | 2026-11-20 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Seedance 2.0 Mini | 480p | Gems | Gems | 5s | 8s |
| Seedance 2.0 Mini | 720p | Gems | Gems | Gems | 4s |
| Seedance 2.0 Fast | 480p | Gems | Gems | 4s | 5s |
| Seedance 2.0 | 480p | Gems | Gems | Gems | 5s |
| Seedance 2.5 Flash | 480p | Gems | Gems | Gems | 5s |
| Seedance 2.5 | 480p | Gems | Gems | Gems | 4s |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 8, 10 on Seedance 2.5 Flash, and 29 on Seedance 2.5 |
| Audio references | Up to 3 |
| Character Voices | Yes |
| First frame | Yes |
| Last frame | Yes, with a first frame |
| Video references | Yes, up to 15 seconds of input on Seedance 2.0 Fast, Seedance 2.0 Mini, and Seedance 2.0, and up to 30 seconds on Seedance 2.5 Flash and Seedance 2.5 |
| LoRAs | No |
| Negative prompts | No |
| Resolutions | Seedance 2.0 Mini: 480p, 720p; Seedance 2.0 Fast: 480p, 720p; Seedance 2.0: 480p, 720p, 1080p, 4K; Seedance 2.5 Flash: 480p, 720p; Seedance 2.5: 480p, 720p, 1080p |
| Durations | Seedance 2.0 Mini: 4 to 15 seconds; Seedance 2.0 Fast: 4 to 15 seconds; Seedance 2.0: 4 to 15 seconds; Seedance 2.5 Flash: 4 to 30 seconds; Seedance 2.5: 4 to 30 seconds |

## Wan 3.0

- **API architecture:** `wan_3` · **Mage family page:** [https://docs.mage.space/models/wan-3](https://docs.mage.space/models/wan-3.md)
- **Origin (Mage's wording):** Alibaba model run with a Mage "Strict Filter"
- **Provider:** Alibaba (Tongyi Lab)
- **Base / underlying model:** Closed model (not open weights). [confirmed: [howaiworks.ai](https://howaiworks.ai/models/wan/)]
- **Release dates:** Public beta 2026-08-06; broad release 2026-08-24; on Mage 2026-11-03. [confirmed: [Dataconomy](https://dataconomy.com/2026/08/24/alibaba-launches-wan30-a-30-second-ai-video-generation-model/)]
- **API `model_id` values (default first):** `wan-3.0`
- **API resolutions:** 480p, 720p, 1080p; **aspect ratios:** 16:9, 4:3, 1:1, 3:4, 9:16; **durations (s):** 2-30 (29 values)
- **Credit cost:** 245 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Wan 3.0 | `wan-3.0` | `e0ef7a03f66648de8b63fed5ea22bf1b` | 2026-11-03 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Wan 3.0 | 480p | Gems | 3s | 7s | 11s |
| Wan 3.0 | 720p | Gems | Gems | 3s | 5s |
| Wan 3.0 | 1080p | Gems | Gems | Gems | 2s |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 10 |
| Audio references | Up to 5 |
| Character Voices | Yes |
| First frame | Yes |
| Last frame | Yes |
| Video references | Yes, up to 5 clips |
| Audio on the output | Optional |
| LoRAs | No |
| Negative prompts | No |
| Resolutions | 480p, 720p, 1080p |
| Durations | 2 to 30 seconds |

## Wan Video v2.2

- **API architecture:** `wan_22` · **Mage family page:** [https://docs.mage.space/models/wan-video](https://docs.mage.space/models/wan-video.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** Alibaba (Tongyi Lab)
- **Base / underlying model:** Wan 2.2 open weights (+ Lightning distilled variant). [confirmed: Mage docs]
- **Release dates:** On Mage 2025-07-30 (Lightning 2025-08-18). [confirmed for Mage date]
- **API `model_id` values (default first):** `wan22-video`, `wan22-video-lightning`
- **API resolutions:** 240p, 360p, 480p, 720p; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 40 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Wan Video 2.2 | `wan22-video` | `5c65603ee18d4204b7fee80133371063` | 2025-07-30 | yes |
| Wan 2.2 Text-to-Image | `wan22-video` | `5eb83966799d4a2bb16fd186808732b8` | 2025-07-30 | yes |
| Wan Video 2.2 Fast | `wan22-video-lightning` | `1671da7abd264bf79b4689d1e793b5b7` | 2025-08-18 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Wan Video v2.2 | 240p | Gems | Unlimited | Unlimited | Unlimited |
| Wan Video v2.2 | 360p | Gems | Unlimited | Unlimited | Unlimited |
| Wan Video v2.2 | 480p | Gems | Unlimited | Unlimited | Unlimited |
| Wan Video v2.2 | 720p | Gems | Gems | Unlimited | Unlimited |
| Wan Video v2.2 Lightning | 240p | Gems | Unlimited | Unlimited | Unlimited |
| Wan Video v2.2 Lightning | 360p | Gems | Unlimited | Unlimited | Unlimited |
| Wan Video v2.2 Lightning | 480p | Gems | Unlimited | Unlimited | Unlimited |
| Wan Video v2.2 Lightning | 720p | Gems | Gems | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | No |
| Reference images | Up to 1 |
| Character Voices | No |
| First frame | Wan Video v2.2 |
| Last frame | No |
| Video references | No |
| LoRAs | Wan Video v2.2 |
| Negative prompts | Wan Video v2.2 |
| Resolutions | Wan Video v2.2: 240p, 360p, 480p, 720p; Wan Video v2.2 Lightning: 240p, 360p, 480p, 720p |

## LTX Video

- **API architecture:** `ltx_video` · **Mage family page:** [https://docs.mage.space/models/ltx-video](https://docs.mage.space/models/ltx-video.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** Lightricks
- **Base / underlying model:** LTX-Video 0.9.6 (Distilled / Dev). [inferred from ids `ltx-video-096-*`]
- **Release dates:** On Mage 2025-05-16 (concept created). [confirmed for Mage date]
- **API `model_id` values (default first):** `ltx-video-096-distilled`, `ltx-video-096-dev`
- **API resolutions:** 240p, 360p, 480p, 720p; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 20 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| LTX Video Dev | `ltx-video-096-dev` | `9dcb402a290c44718ece1048f18f9322` | 2025-05-16 | yes |
| LTX Video Distilled | `ltx-video-096-distilled` | `519e1f20b4f142d296fd3ad654b28157` | 2025-05-16 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| LTX Video Distilled | 240p | Gems | Unlimited | Unlimited | Unlimited |
| LTX Video Distilled | 360p | Gems | Unlimited | Unlimited | Unlimited |
| LTX Video Distilled | 480p | Gems | Unlimited | Unlimited | Unlimited |
| LTX Video Distilled | 720p | Gems | Gems | Unlimited | Unlimited |
| LTX Video Dev | 240p | Gems | Unlimited | Unlimited | Unlimited |
| LTX Video Dev | 360p | Gems | Unlimited | Unlimited | Unlimited |
| LTX Video Dev | 480p | Gems | Unlimited | Unlimited | Unlimited |
| LTX Video Dev | 720p | Gems | Gems | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | No |
| Reference images | Up to 1 |
| Character Voices | No |
| First frame | Yes |
| Last frame | No |
| Video references | No |
| LoRAs | No |
| Negative prompts | Yes |
| Resolutions | LTX Video Distilled: 240p, 360p, 480p, 720p; LTX Video Dev: 240p, 360p, 480p, 720p |

## MiniMax-H3

- **API architecture:** `minimax_h3` · **Mage family page:** [https://docs.mage.space/models/minimax-h3](https://docs.mage.space/models/minimax-h3.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** MiniMax
- **Base / underlying model:** MiniMax H3 omni-modal video model (open-sourced 2026-08-03); H3 Turbo is the fast variant. "Pika H3 Flex" is a third variant whose relation to Pika Labs is not documented. [confirmed for H3; unknown for Pika H3 Flex: [apiyi](https://help.apiyi.com/en/minimax-h3-open-weights-modules-license-explained-en.html)]
- **Release dates:** MiniMax-H3 / Turbo on Mage 2026-09-05; Pika H3 Flex 2026-11-04. [confirmed: Mage]
- **API `model_id` values (default first):** `pika-h3-flex`, `minimax-h3-turbo`, `minimax-h3`
- **API resolutions:** 480p, 544p, 720p, 768p; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21; **durations (s):** 5-15 (11 values)
- **Credit cost:** 45 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| MiniMax-H3 Turbo | `minimax-h3-turbo` | `10fc8b4d151f4bda8a6e9e8c07ba3464` | 2026-09-05 | yes |
| MiniMax-H3 | `minimax-h3` | `ccc40f9e00374be5996190ccccb7b9d9` | 2026-09-05 | yes |
| Pika H3 Flex | `pika-h3-flex` | `80e385e79bab4f089d41371af2d5ac11` | 2026-11-04 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| MiniMax-H3 Turbo | 480p | Gems | 15s | 15s | 15s |
| MiniMax-H3 Turbo | 544p | Gems | 15s | 15s | 15s |
| MiniMax-H3 Turbo | 720p | Gems | 12s | 15s | 15s |
| MiniMax-H3 Turbo | 768p | Gems | 10s | 15s | 15s |
| Pika H3 Flex | 480p | Gems | 15s | 15s | 15s |
| Pika H3 Flex | 544p | Gems | 15s | 15s | 15s |
| Pika H3 Flex | 720p | Gems | 8s | 15s | 15s |
| Pika H3 Flex | 768p | Gems | 8s | 12s | 15s |
| MiniMax-H3 | 480p | Gems | 8s | 8s | 8s |
| MiniMax-H3 | 544p | Gems | 6s | 8s | 8s |
| MiniMax-H3 | 720p | Gems | Gems | 6s | 8s |
| MiniMax-H3 | 768p | Gems | Gems | 5s | 7s |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 9 |
| Audio references | Up to 3 |
| Character Voices | Yes |
| First frame | Yes |
| Last frame | Yes |
| Video references | Yes, sharing a 21 second budget with the output |
| Audio on the output | Yes, stereo audio with the video |
| LoRAs | Yes |
| Negative prompts | No |
| Resolutions | 480p, 544p, 720p, 768p |
| Durations | MiniMax-H3 Turbo and Pika H3 Flex: 5 to 15 seconds; MiniMax-H3: 5 to 8 seconds |
