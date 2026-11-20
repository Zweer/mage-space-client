# Image models

Generated from live data on 2026-11-20: the Mage API OpenAPI document, the web concept catalog (`getConceptsParallel`), docs.mage.space and public provider sources. Labels in brackets give the confidence of each claim: **confirmed** (source named), **inferred** (reasoned from evidence, flagged), **unknown**. See [`../models.md`](../models.md) for the index, ranking and the NSFW matrix.

## Mango

- **API architecture:** `mango` · **Mage family page:** [https://docs.mage.space/models/mango](https://docs.mage.space/models/mango.md)
- **Origin (Mage's wording):** Mage model (Mage: "available only on Mage")
- **Provider:** Mage (Ollano Inc.)
- **Base / underlying model:** Unknown. Mage publishes no underlying model. [unknown]
- **Release dates:** Mango 2025-10-21 (concept created); Mango 2 2025-12-09; Mango 3S 2026-02-25; Mango 3 2026-07-09 ([release notes](https://docs.mage.space/release-notes.md)); Mango 3 Turbo 2026-10-02; Mango 4 2026-11-09 (concept created; [blog](https://www.mage.space/blog/unlimited-seedream-55-mango-4)). [confirmed: Mage]
- **API `model_id` values (default first):** `mango-v4`, `mango`, `mango-v2`, `mango-v3s`, `mango-v3`, `mango-v3-turbo`
- **API resolutions:** 1K, 2K, 3K, 4K; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 42 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** Mango 4 is the flagship image model and the API default (`mango-v4`). Official concept descriptions: Mango 3 "excels at fantasy, romance, and sensual themes" ([blog](https://blog.mage.space/article/mango-3-audio-generation/5e723575-0d7e-4e64-a5cb-53e03eb72c95)); Mango 4 "excels at greater creative freedom".

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Mango | `mango` | `4eedde00524c4dabb83694ec4e8b782b` | 2025-10-21 | yes |
| Mango Image Edit | `mango` | `a8581107deba4d268ef1f00a6865551f` | 2025-10-21 | yes |
| Hailey | `mango` | `e4f4f8a8caaf4e12942b766062c69870` | 2025-11-21 | yes |
| Android 18 | `mango` | `65e03602c8d84c8d982ecc86b6cb0eeb` | 2025-11-21 | yes |
| Mango 2 | `mango-v2` | `e15e70f483fa4b2cb7bd43caeee2cad4` | 2025-12-09 | yes |
| Mango 3S | `mango-v3` | `39b4d6a030a649b098846a108f623078` | 2026-02-25 | yes |
| Mango 3 | `mango-v3-pro` | `5fc3641aee004def9407b9fdc4432c22` | 2026-07-09 | no |
| Mango 3 Turbo | `mango-v3-turbo` | `91822823d21a403f88397ab31e626866` | 2026-10-02 | yes |
| Mango 4 | `mango-v4` | `38311d733c994ab39a3cf002cc40e194` | 2026-11-09 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Mango | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Mango | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Mango | 3K | Gems | Gems | Unlimited | Unlimited |
| Mango | 4K | Gems | Gems | Unlimited | Unlimited |
| Mango 2 | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Mango 2 | 3K | Gems | Gems | Unlimited | Unlimited |
| Mango 2 | 4K | Gems | Gems | Unlimited | Unlimited |
| Mango 3S | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Mango 3S | 3K | Gems | Gems | Unlimited | Unlimited |
| Mango 3 | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Mango 3 | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Mango 3 Turbo | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Mango 3 Turbo | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Mango 4 | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Mango 4 | 2K | Gems | Unlimited | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Mango 2, Mango 3S, Mango 3, Mango 3 Turbo, Mango 4 |
| Reference images | Up to 10 |
| Moodboards | Mango 2 |
| LoRAs | No |
| Negative prompts | No |
| Edits an input image | Yes |
| Resolutions | Mango: 1K, 2K, 3K, 4K; Mango 2: 2K, 3K, 4K; Mango 3S: 2K, 3K; Mango 3, Mango 3 Turbo, and Mango 4: 1K, 2K |

## Guava

- **API architecture:** `guava` · **Mage family page:** [https://docs.mage.space/models/guava](https://docs.mage.space/models/guava.md)
- **Origin (Mage's wording):** Mage model
- **Provider:** Mage
- **Base / underlying model:** Unknown. [unknown]
- **Release dates:** Guava / Guava Pro 2026-03-06 (concept created); Guava Pro 1.5 2026-05-29; Guava 2 / 2 Pro 2026-08-07 ([release notes](https://docs.mage.space/release-notes.md)). [confirmed: Mage]
- **API `model_id` values (default first):** `guava`, `guava-pro`, `guava-pro-v1-5`, `guava-2`, `guava-2-pro`
- **API resolutions:** 1K, 2K; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 37 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** Photorealism line. Web ids and API ids match.

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Guava | `guava` | `06940b0d70db4a8eb300b0c0b1bbfa58` | 2026-03-06 | yes |
| Guava Pro | `guava-pro` | `d0757cf499904d7ea3d281896fdf20f7` | 2026-03-06 | yes |
| Guava Pro 1.5 | `guava-pro-v1-5` | `688f095035b54cfa8a006be1842b81e3` | 2026-05-29 | yes |
| Guava 2 | `guava-2` | `63db367c3d5f41ad984f16106a75fb19` | 2026-08-07 | yes |
| Guava 2 Pro | `guava-2-pro` | `ce440d464ee94559bd9bcdb2d36809b5` | 2026-08-07 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Guava | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Guava | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Guava Pro | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Guava Pro | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Guava Pro 1.5 | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Guava Pro 1.5 | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Guava 2 | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Guava 2 | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Guava 2 Pro | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Guava 2 Pro | 2K | Gems | Unlimited | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 3 |
| LoRAs | No |
| Negative prompts | Yes |
| Edits an input image | Yes |
| Resolutions | Guava: 1K, 2K; Guava Pro: 1K, 2K; Guava Pro 1.5: 1K, 2K; Guava 2: 1K, 2K; Guava 2 Pro: 1K, 2K |

## SDXL Plus

- **API architecture:** `sdxl_plus` · **Mage family page:** [https://docs.mage.space/models/sdxl-plus](https://docs.mage.space/models/sdxl-plus.md)
- **Origin (Mage's wording):** Mage model
- **Provider:** Mage
- **Base / underlying model:** SDXL pipeline with automatic face/hand cleanup (ADetailer-style fields in the API: `adetailer_face`, `adetailer_hands`, `hires`). [confirmed: Mage docs call it "our high-detail SDXL pipeline"]
- **Release dates:** Unknown (no release-note entry found).
- **API `model_id` values (default first):** `6A35A7855770AE…`
- **API resolutions:** not selectable; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 15 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** API model_id is the same SDXL checkpoint hash as Stable Diffusion XL.

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| SDXL Plus | Base settings | Gems | Gems | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | No |
| Reference images | Up to 1 |
| LoRAs | Yes |
| Negative prompts | Yes |
| Edits an input image | No |

## Anima

- **API architecture:** `anima` · **Mage family page:** [https://docs.mage.space/models/anima](https://docs.mage.space/models/anima.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** CircleStone Labs with Comfy Org
- **Base / underlying model:** 2B anime/illustration model; NVIDIA Cosmos-Predict2-2B text-to-image DiT architecture, not SDXL lineage. [confirmed: [Hugging Face card](https://huggingface.co/circlestone-labs/Anima/blob/main/README.md), [third-party summary](https://github.com/NeoAnthropocene/comfyui-mcp-multiagent/blob/main/plugin/skills/anima-base/SKILL.md)]
- **Release dates:** Live on Mage 2026-05-23 (concept created 2026-05-23; [release notes](https://docs.mage.space/release-notes.md)); upstream release date earlier, not pinned. [confirmed for Mage date]
- **API `model_id` values (default first):** `anima-v1`
- **API resolutions:** 1k, 2k; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 20 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** Danbooru-tag prompting, LoRAs supported on Mage. Tagged `info:Mature` in the concept catalog.

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Anima | `anima-v1` | `e0dcd7f75a244b47be4c459662170204` | 2026-05-23 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Anima | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Anima | 2K | Gems | Unlimited | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | No |
| Image input | No |
| LoRAs | Yes |
| Negative prompts | Yes |
| Edits an input image | No |
| Resolutions | 1K, 2K |

## Chroma

- **API architecture:** `chroma` · **Mage family page:** [https://docs.mage.space/models/chroma](https://docs.mage.space/models/chroma.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** lodestones (LodestoneRock), community
- **Base / underlying model:** 8.9B model derived from FLUX.1-schnell (Apache-2.0), retrained on a 5M-image set without a safety filter. [confirmed: [HF card](https://huggingface.co/lodestones/Chroma1-Base/blob/main/README.md); "no safety filter" per [third-party summary](https://localaimaster.com/blog/chroma-local-guide)]
- **Release dates:** Chroma1-Base upstream 2025-08 (HF file date); on Mage 2025-11-20 (concept created). [confirmed]
- **API `model_id` values (default first):** `chroma-v1-hd`
- **API resolutions:** not selectable; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 35 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Chroma V1 HD | `chroma-v1-hd` | `4549112b2eb84a68a1c45afe6108f643` | 2025-11-20 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Chroma | Base settings | Unlimited | Unlimited | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | No |
| Image input | No |
| LoRAs | Yes |
| Negative prompts | Yes |
| Edits an input image | No |

## Flux 2

- **API architecture:** `flux2` · **Mage family page:** [https://docs.mage.space/models/flux-2](https://docs.mage.space/models/flux-2.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** Black Forest Labs
- **Base / underlying model:** FLUX.2 [dev] (open weights, BFL license). [confirmed: Mage names it "Flux 2 Dev"; license detail from general knowledge, not re-checked]
- **Release dates:** On Mage 2025-11-25 (concept created), matching BFL's FLUX.2 launch. [confirmed for Mage date]
- **API `model_id` values (default first):** `flux2-dev`
- **API resolutions:** 1k, 2k; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 40 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Flux 2 Dev | `flux2-dev` | `323dcb779f924322a35a647ca1a23535` | 2025-11-25 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Flux 2 | 1K | Unlimited | Unlimited | Unlimited | Unlimited |
| Flux 2 | 2K | Gems | Unlimited | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | No |
| Reference images | Up to 3 |
| LoRAs | No |
| Negative prompts | No |
| Edits an input image | Yes |
| Resolutions | 1K, 2K |

## HiDream

- **API architecture:** `hidream` · **Mage family page:** [https://docs.mage.space/models/hidream](https://docs.mage.space/models/hidream.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** HiDream.ai
- **Base / underlying model:** HiDream-I1 family (Full / Dev / Fast). [inferred from concept names; not verified with a source URL]
- **Release dates:** On Mage 2025-05-05 (concept created). [confirmed for Mage date]
- **API `model_id` values (default first):** `hidream-fast`
- **API resolutions:** not selectable; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 20 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** API exposes only `hidream-fast`; web catalog also has Full and Dev.

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| HiDream Fast | `hidream-fast` | `3ec26ee5471e4b0db3ea39f35dfa934f` | 2025-05-05 | yes |
| HiDream Dev | `hidream-dev` | `5600fdfd85034b0b92b0b9ef2dd0d15a` | 2025-05-05 | no |
| HiDream Full | `hidream-full` | `2a31fb463d0744eabe7d1b983433ac36` | 2025-05-05 | no |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| HiDream | Base settings | Gems | Unlimited | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | No |
| Image input | No |
| LoRAs | No |
| Negative prompts | Yes |
| Edits an input image | No |

## Krea 2

- **API architecture:** `krea_2` · **Mage family page:** [https://docs.mage.space/models/krea-2](https://docs.mage.space/models/krea-2.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** Krea.ai
- **Base / underlying model:** Krea 2 Turbo, 8-step distilled variant of a ~12-13B DiT; open weights under a community license. [confirmed: [Krea](https://www.krea.ai/krea-2-open-source), [Data Phoenix](https://dataphoenix.info/news/krea-2-diffusion-transformer-image)]
- **Release dates:** Open weights 2026-06-22 (Krea); on Mage 2026-07-28 / "every plan" 2026-07-31. [confirmed]
- **API `model_id` values (default first):** `krea-2-turbo`
- **API resolutions:** 1k, 2k; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 20 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Krea 2 Turbo | `krea-2-turbo` | `c3a62536e9bd4e079e46bc1a49fba1a3` | 2026-07-28 | yes |
| Aether Dark | `krea-2-turbo` | `3514d704316d4a4da960e68f3551e970` | 2026-09-15 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Krea 2 Turbo | 1K | Unlimited | Unlimited | Unlimited | Unlimited |
| Krea 2 Turbo | 2K | Gems | Unlimited | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | No |
| Image input | No |
| LoRAs | Yes |
| Negative prompts | Yes |
| Edits an input image | No |
| Resolutions | 1K, 2K |

## MiniMax H3 Image

- **API architecture:** `minimax_h3_image` · **Mage family page:** [https://docs.mage.space/models/minimax-h3-image](https://docs.mage.space/models/minimax-h3-image.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** MiniMax
- **Base / underlying model:** 33B diffusion transformer from the MiniMax H3 family (video model minus audio stream), 6-step distilled, ~16 MP. [confirmed: [ComfyUI wiki](https://comfyui-wiki.com/en/news/2026-11-10-minimax-h3-image), [Venice](https://venice.ai/models/minimax-h3-image)]
- **Release dates:** Open weights 2026-11-10 (MiniMax); on Mage 2026-11-10/11. Reported licence restriction on use in EU/UK/US/South Korea ([datanorth.ai](https://datanorth.ai/news/minimax-h3-image-licence-eu-us), single source, unverified). [confirmed date; licence claim unverified]
- **API `model_id` values (default first):** `minimax-h3-image`
- **API resolutions:** 2k, 4k; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 15 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| MiniMax H3 Image | `minimax-h3-image` | `1154fe2a4a344bc78c05a4d59698184f` | 2026-11-11 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| MiniMax H3 Image | 2K | Gems | Unlimited | Unlimited | Unlimited |
| MiniMax H3 Image | 4K | Gems | Gems | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 16 |
| Edits an input image | Yes |
| LoRAs | Yes |
| Negative prompts | No |
| Text in the image | Yes |
| Resolutions | 2K, 4K |
| Aspect ratios | All nine, from 21:9 to 9:21 |

## MOSS-Image

- **API architecture:** `moss_image` · **Mage family page:** [https://docs.mage.space/models/moss-image](https://docs.mage.space/models/moss-image.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** OpenMOSS (Fudan University / Shanghai Innovation Institute / MOSI)
- **Base / underlying model:** 5B single-stream DiT trained from scratch, Apache-2.0. [confirmed: [GitHub](https://github.com/OpenMOSS/MOSS-Image), [tech report](https://arxiv.org/html/2610.23374v1)]
- **Release dates:** Released 2026-10-16; on Mage 2026-10-23 (concept created). [confirmed]
- **API `model_id` values (default first):** `moss-image`
- **API resolutions:** 1k, 2k; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 25 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| MOSS-Image | `moss-image` | `e437c9ec7e814a69ba80592f703cb166` | 2026-10-23 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| MOSS-Image | 1K | Unlimited | Unlimited | Unlimited | Unlimited |
| MOSS-Image | 2K | Gems | Unlimited | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | No |
| Image input | No |
| LoRAs | Yes |
| Negative prompts | Yes |
| Edits an input image | No |
| Resolutions | 1K, 2K |

## Z-Image

- **API architecture:** `z_image` · **Mage family page:** [https://docs.mage.space/models/z-image](https://docs.mage.space/models/z-image.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** Tongyi-MAI (Alibaba)
- **Base / underlying model:** 6B S3-DiT, Apache-2.0, Qwen3-4B text encoder. [confirmed: [arXiv 2511.22699](https://arxiv.org/pdf/2511.22699v5), [model card mirror](https://huggingface.co/unsloth/Z-Image-Turbo)]
- **Release dates:** Z-Image-Turbo 2025-11-26 (upstream); on Mage 2025-11-28; Z-Image base 2026-01-28. [confirmed]
- **API `model_id` values (default first):** `z-image-turbo`
- **API resolutions:** 1k, 2k; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 10 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** API exposes only `z-image-turbo`.

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Z-Image Turbo | `z-image-turbo` | `fc43536b26ed41a0b6b0116883f86b26` | 2025-11-28 | yes |
| Z-Image | `z-image` | `b133f9e38b984358a9a6422c8fe6090f` | 2026-01-28 | no |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Z-Image | 1K | Unlimited | Unlimited | Unlimited | Unlimited |
| Z-Image | 2K | Gems | Unlimited | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | No |
| Reference images | Up to 1 |
| LoRAs | Yes |
| Negative prompts | Yes |
| Edits an input image | No |
| Resolutions | 1K, 2K |

## GPT Image

- **API architecture:** `gpt_image_2` · **Mage family page:** [https://docs.mage.space/models/gpt-image-2](https://docs.mage.space/models/gpt-image-2.md)
- **Origin (Mage's wording):** Run by OpenAI (OpenAI safety filter applies)
- **Provider:** OpenAI
- **Base / underlying model:** OpenAI GPT-Image-2 / 2.5 / 2.6 (Flare = fast, Sunburst = higher quality). [confirmed: [OpenAI changelog](https://developers.openai.com/changelog/)]
- **Release dates:** GPT Image 2 on Mage 2026-04-24; 2.5 Flare/Sunburst 2026-09-09; 2.6 Flare/Sunburst 2026-11-04/05 (OpenAI release 2026-11-04). [confirmed]
- **API `model_id` values (default first):** `gpt-image-2`, `gpt-image-2.5-flare`, `gpt-image-2.5-sunburst`, `gpt-image-2.6-flare`, `gpt-image-2.6-sunburst`
- **API resolutions:** 1K, 2K; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 9 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| GPT Image 2 | `gpt-image-2` | `ccde44131f954e19accecddac54e1f64` | 2026-04-24 | yes |
| GPT Image 2.5 Flare | `gpt-image-2.5-flare` | `189b1da81691435aafa926497b56b85f` | 2026-09-09 | yes |
| GPT Image 2.5 Sunburst | `gpt-image-2.5-sunburst` | `b876a82996fc4a00ac9b6ef324a3a106` | 2026-09-09 | yes |
| GPT Image 2.6 Flare | `gpt-image-2.6-flare` | `69e5e5ab38334d6bad12334bfa7b2bb7` | 2026-11-05 | yes |
| GPT Image 2.6 Sunburst | `gpt-image-2.6-sunburst` | `97cf24412da3441391f39e1be2fb1dda` | 2026-11-05 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| GPT Image 2 | 1K, Low quality | Unlimited | Unlimited | Unlimited | Unlimited |
| GPT Image 2 | 2K, Low quality | Unlimited | Unlimited | Unlimited | Unlimited |
| GPT Image 2.5 Flare | 1K, Low quality | Unlimited | Unlimited | Unlimited | Unlimited |
| GPT Image 2.5 Flare | 2K, Low quality | Unlimited | Unlimited | Unlimited | Unlimited |
| GPT Image 2.5 Sunburst | 1K, Low quality | Unlimited | Unlimited | Unlimited | Unlimited |
| GPT Image 2.5 Sunburst | 2K, Low quality | Unlimited | Unlimited | Unlimited | Unlimited |
| GPT Image 2.6 Flare | 1K, Low quality | Gems | Unlimited | Unlimited | Unlimited |
| GPT Image 2.6 Flare | 2K, Low quality | Gems | Unlimited | Unlimited | Unlimited |
| GPT Image 2.6 Sunburst | 1K, Low quality | Gems | Unlimited | Unlimited | Unlimited |
| GPT Image 2.6 Sunburst | 2K, Low quality | Gems | Unlimited | Unlimited | Unlimited |
| GPT Image 2.6, GIF | Low, 2 to 12 frames | Gems | Unlimited | Unlimited | Unlimited |
| GPT Image 2.6, GIF | Low, 13 to 16 frames | Gems | Gems | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 15 |
| LoRAs | No |
| Negative prompts | No |
| Edits an input image | Yes |
| Resolutions | 1K and 2K on every version |
| Animated GIFs | GPT Image 2.6 Flare and Sunburst |

## Grok Image

- **API architecture:** `grok_image` · **Mage family page:** [https://docs.mage.space/models/grok](https://docs.mage.space/models/grok.md)
- **Origin (Mage's wording):** Run by xAI (xAI safety filter applies)
- **Provider:** xAI
- **Base / underlying model:** Grok Imagine image models (2.0 = newer tier). [confirmed: [xAI](https://x.ai/news/grok-imagine-image-2)]
- **Release dates:** Grok Image on Mage 2026-05-29; Grok Image 2.0 on Mage 2026-08-14 (unlimited on premium). [confirmed]
- **API `model_id` values (default first):** `grok-imagine-image-2.0`, `grok-imagine-image`
- **API resolutions:** 1k, 2k; **aspect ratios:** 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 2:1, 1:2, 19.5:9, 9:19.5, 20:9, 9:20
- **Credit cost:** 90 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** Mage retired "Grok Image Quality" (announced 2026-10-31).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Grok Image | `grok-imagine-image` | `e7286879737447cf8e6b45c2dddc5754` | 2026-05-29 | yes |
| Grok Image Quality | `grok-imagine-image-quality` | `03b401a0324e42c1ab5463debc7b6568` | 2026-05-29 | no |
| Grok Image 2.0 | `grok-imagine-image-2.0` | `9ecb3e2e9ba6433292810006691b0afd` | 2026-08-14 | yes |

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

## Nano Banana 2

- **API architecture:** `nano_banana_v2` · **Mage family page:** [https://docs.mage.space/models/nano-banana-2](https://docs.mage.space/models/nano-banana-2.md)
- **Origin (Mage's wording):** Run by Google (Google safety filter applies)
- **Provider:** Google DeepMind
- **Base / underlying model:** Nano Banana 2 = Gemini 3.1 Flash Image; Nano Banana 2.1 = update (reported Gemini 3.6 Flash based). [confirmed: [Unite.AI](https://www.unite.ai/nano-banana-2-1-debuts-at-half-the-image-cost-of-its-predecessor/), [DeepMind model card](https://deepmind.google/models/model-cards/nano-banana-2-1/)]
- **Release dates:** Nano Banana 2 2026-02-26; Nano Banana 2.1 2026-10-06 (Google). Unlimited on Pro Plus/Max 2026-10-09 on Mage. [confirmed]
- **API `model_id` values (default first):** `nano-banana-v2.1`, `nano-banana-v2`
- **API resolutions:** 512, 1K, 2K, 4K; **aspect ratios:** 1:1, 3:2, 2:3, 3:4, 4:1, 4:3, 4:5, 5:4, 8:1, 9:16, 16:9, 21:9
- **Credit cost:** 51 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Nano Banana 2 | `nano-banana-v2` | `567ec1bbebda477eb84393e6635b75b5` | 2026-03-13 | yes |
| Nano Banana 2 Smart Mode | `nano-banana-v2` | `a96cc2c524dd4c46b231ad37f3008dd1` | 2026-03-13 | yes |
| Nano Banana 2.1 | `nano-banana-v2.1` | `1d8fa9e50254464a8885d03ea334e910` | 2026-10-09 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Nano Banana 2.1 | 1K | Gems | Gems | Unlimited | Unlimited |
| Nano Banana 2.1 | 2K | Gems | Gems | Gems | Unlimited |
| Nano Banana 2 | 512px | Gems | Gems | Unlimited | Unlimited |
| Nano Banana 2 | 1K | Gems | Gems | Gems | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Yes |
| Reference images | Up to 14 |
| Moodboards | Nano Banana 2.1, Nano Banana 2 |
| LoRAs | No |
| Negative prompts | No |
| Edits an input image | Yes |
| Resolutions | 1K, 2K, 4K; Nano Banana 2 also offers 512px |

## Seedream

- **API architecture:** `seedream` · **Mage family page:** [https://docs.mage.space/models/seedream](https://docs.mage.space/models/seedream.md)
- **Origin (Mage's wording):** ByteDance model run with a Mage "Strict Filter"
- **Provider:** ByteDance Seed
- **Base / underlying model:** Seedream 4.0 / 4.5 / 5.0 (Lite, Flash, Pro) / 5.5. [confirmed: Mage docs]
- **Release dates:** Seedream 5.5 released 2026-11-09 ([Unite.AI](https://www.unite.ai/bytedance-seed-introduces-seedream-5-5-for-multi-round-image-editing/), [Mage blog](https://www.mage.space/blog/seedream-5-5)). Other versions: dates not retrieved. [confirmed for 5.5]
- **API `model_id` values (default first):** `seedream-5.5`, `seedream-4.0`, `seedream-4.5`, `seedream-5.0-lite`, `seedream-5.0-pro`, `seedream-5.0-flash`
- **API resolutions:** 1K, 2K, 3K, 4K; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 42 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** Only 5.5 appears as a web concept; the others are reachable via the API/advanced picker.

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Seedream 5.5 | `seedream-5.5` | `82a259a594084dd99aaf7ffdb3b57965` | 2026-11-09 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Seedream 5.5 | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Seedream 5.5 | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Seedream 5.0 Pro | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Seedream 5.0 Pro | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Seedream 5.0 Flash | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Seedream 5.0 Flash | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Seedream 5.0 Lite | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Seedream 5.0 Lite | 3K | Gems | Gems | Unlimited | Unlimited |
| Seedream 4.5 | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Seedream 4.5 | 3K | Gems | Gems | Unlimited | Unlimited |
| Seedream 4.5 | 4K | Gems | Gems | Unlimited | Unlimited |
| Seedream 4.0 | 1K | Gems | Unlimited | Unlimited | Unlimited |
| Seedream 4.0 | 2K | Gems | Unlimited | Unlimited | Unlimited |
| Seedream 4.0 | 3K | Gems | Gems | Unlimited | Unlimited |
| Seedream 4.0 | 4K | Gems | Gems | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | Seedream 5.5, Seedream 5.0 Pro, Seedream 5.0 Flash, Seedream 5.0 Lite, Seedream 4.5 |
| Reference images | Up to 10 |
| Moodboards | Seedream 4.5 |
| LoRAs | No |
| Negative prompts | No |
| Edits an input image | Yes |
| Text in the image | Yes; Seedream 5.5, 5.0 Pro, and 5.0 Flash write 14 languages besides English and Chinese |
| Resolutions | Seedream 5.5, Seedream 5.0 Pro, and Seedream 5.0 Flash: 1K, 2K; Seedream 5.0 Lite: 2K, 3K; Seedream 4.5: 2K, 3K, 4K; Seedream 4.0: 1K, 2K, 3K, 4K |

## Stable Diffusion v1.5

- **API architecture:** `stable_diffusion_v15` · **Mage family page:** [https://docs.mage.space/models/stable-diffusion](https://docs.mage.space/models/stable-diffusion.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** Stability AI / Runway (community checkpoints)
- **Base / underlying model:** SD 1.5 UNet (the API id is a checkpoint hash). [confirmed: Mage docs; checkpoint identity not independently verified]
- **Release dates:** SD 1.5 upstream 2022-10; legacy checkpoints on Mage 2024-07. [general knowledge]
- **API `model_id` values (default first):** `15012C538F503C…`
- **API resolutions:** not selectable; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 10 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** See [legacy appendix](./legacy-sd.md).

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Stable Diffusion v1.5 | Base settings | Unlimited | Unlimited | Unlimited | Unlimited |
| Stable Diffusion XL | Base settings | Unlimited | Unlimited | Unlimited | Unlimited |
| Stable Diffusion v3.5 Large | Base settings | Unlimited | Unlimited | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Characters and References | No |
| Reference images | Up to 1 |
| LoRAs | Stable Diffusion v1.5, Stable Diffusion XL |
| Textual Inversions | Stable Diffusion v1.5, Stable Diffusion XL |
| ControlNet | Stable Diffusion v1.5, Stable Diffusion XL |
| Negative prompts | Stable Diffusion v1.5, Stable Diffusion XL, Stable Diffusion v3.5 Large |
| Edits an input image | No |

## Stable Diffusion XL

- **API architecture:** `stable_diffusion_xl` · **Mage family page:** [https://docs.mage.space/models/stable-diffusion](https://docs.mage.space/models/stable-diffusion.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** Stability AI (community checkpoints)
- **Base / underlying model:** SDXL 1.0 base architecture. [general knowledge + Mage docs]
- **Release dates:** SDXL upstream 2023-07; on Mage 2024-07. [general knowledge]
- **API `model_id` values (default first):** `6A35A7855770AE…`
- **API resolutions:** not selectable; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 10 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** See [legacy appendix](./legacy-sd.md).

## Stable Diffusion v3.5 Large

- **API architecture:** `stable_diffusion_v35_large` · **Mage family page:** [https://docs.mage.space/models/stable-diffusion](https://docs.mage.space/models/stable-diffusion.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** Stability AI
- **Base / underlying model:** SD 3.5 Large (MMDiT). [general knowledge + Mage docs]
- **Release dates:** On Mage 2024-10-22 (concept created; matches upstream launch). [confirmed for Mage date]
- **API `model_id` values (default first):** `sd-3-5-large`
- **API resolutions:** not selectable; **aspect ratios:** 21:9, 16:9, 3:2, 5:4, 1:1, 4:5, 2:3, 9:16, 9:21
- **Credit cost:** 10 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).
- **Notes:** Web catalog also has `sd-3-5-large-turbo`; API does not.
