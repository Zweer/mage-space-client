# Mage models: census, ids, ranking (verified 2026-11-20)

Complete reference for every model on mage.space after the November 2026 relaunch. Per-family detail (release dates, provider and base model with confidence labels, capabilities, plan gating, web concept ids) lives in:

- [`models/image.md`](./models/image.md), [`models/video.md`](./models/video.md), [`models/audio.md`](./models/audio.md)
- [`models/nsfw.md`](./models/nsfw.md): per-model NSFW matrix, documentation-based, with evidence levels and a author-verification column
- [`model-eval.md`](./model-eval.md): manual evaluation grid (rubric pending)
- [`models/legacy-sd.md`](./models/legacy-sd.md): the 433 legacy Stable Diffusion checkpoints

## Sources and confidence labels

1. **Mage API OpenAPI document** (`https://docs.mage.space/api/openapi.json`): API `model_id` enums, resolutions, aspect ratios. *Fact.*
2. **Web concept catalog** (live `getConceptsParallel`, deploy `dpl_AbcS43rqLqmYqZwBpkqWiNKDB9Zc`): web `model_id`, concept ids, creation dates, tags. *Fact.*
3. **docs.mage.space, `llms.txt`, Mage blog and release notes**: prices, plans, origin ("Mage model", "run by OpenAI"), release dates on Mage. *Fact as published by Mage (marketing copy; prices can drift).*
4. **Provider and third-party pages** (Hugging Face, ComfyUI docs, news): release dates, base models, benchmarks. *Fact when the source is named; secondary blogs are flagged.*
5. Everything marked **inferred** is my reasoning from named evidence; **unknown** means no reliable source found; **opinion** is my judgement.

## Headline answers

- **Mango 4 exists**: web `model_id` `mango-v4`, concept `38311d733c994ab39a3cf002cc40e194`, created 2026-11-09 ([Mage blog](https://www.mage.space/blog/unlimited-seedream-55-mango-4)). Flagship image model, API default, unlimited from Pro at 1K/2K (up to 10 reference images).
- **37 model families** (18 image, 15 video, 4 audio) with ~75 official non-legacy concepts, plus 433 legacy Stable Diffusion concepts.
- Mage's own families: Mango, Guava, SDXL Plus (image); Cherry, Berry, Blueberry, Raspberry, Kiwi, Lemon, Melon, Plum, Magejutsu (video). Everything else is third party: lab-run (OpenAI, xAI, Google, ByteDance, Alibaba, ElevenLabs) or open-weights hosted on Mage GPUs.

## Web ids vs API ids

The web app and the public API do not always use the same `model_id`. This client talks to the web app, so use the **web** id.

| Family | Web id (client) | API id | Note |
|---|---|---|---|
| Mango 3 | `mango-v3-pro` | `mango-v3` | Mage docs call API `mango-v3` "Mango 3" |
| Mango 3S | `mango-v3` | `mango-v3s` | **Same string, different model**: web `mango-v3` is Mango 3S, API `mango-v3` is Mango 3. |
| Grok Image Quality | `grok-imagine-image-quality` | `grok-imagine-image` | Quality tier retired by Mage (announced 2026-10-31) |
| HiDream | `hidream-full`, `hidream-dev`, `hidream-fast` | `hidream-fast` only | |
| Z-Image | `z-image`, `z-image-turbo` | `z-image-turbo` only | |
| SD 3.5 | `sd-3-5-large`, `sd-3-5-large-turbo` | `sd-3-5-large` only | |
| Seedream | only 5.5 as a concept | 4.0, 4.5, 5.0 Lite/Pro/Flash, 5.5 | |
| Wan 2.2 | `wan22-video`, `wan22-video-lightning` | same | |
| SDXL / SD 1.5 | checkpoint hashes (hundreds) | one hash each | see legacy appendix |

## Index

"Gems at API defaults" is from [docs.mage.space/api/models/overview](https://docs.mage.space/api/models/overview.md) (default resolution/duration, API `model_id` default). The site "from" price is the cheapest setting of the *featured* variant in `llms.txt`, so the two do not match across a family. "Unlimited from" is the first plan that runs some setting of the featured variant unlimited; the per-model plan tables in `models/*.md` are authoritative. Plans: Free $0 (300 signup Gems, app only), Basic $10 (500 Gems/mo), Pro $30 (1,500), Pro Plus $60 (3,500), Max $200 (15,000); Gem packs $10 to $100 (10,000 to 110,000 Gems). The public API ignores plan unlimited quotas and always charges Gems.

### Image

| Family | API arch | Provider | Variants (API ids) | Gems at API defaults | Site "from" price (featured variant, Gems) | Unlimited from | Detail |
|---|---|---|---|---|---|---|---|
| Mango | `mango` | Mage | `mango`, `mango-v2`, `mango-v3s`, `mango-v3`, `mango-v3-turbo`, `mango-v4` | 42 | 24 /img | Pro | [image.md](./models/image.md) |
| Guava | `guava` | Mage | `guava`, `guava-pro`, `guava-pro-v1-5`, `guava-2`, `guava-2-pro` | 37 | 48 /img | Pro | [image.md](./models/image.md) |
| SDXL Plus | `sdxl_plus` | Mage | `6A35A7855770…` | 15 | 15 /img | Pro Plus | [image.md](./models/image.md) |
| Anima | `anima` | CircleStone Labs with Comfy Org | `anima-v1` | 20 | 20 /img | Pro | [image.md](./models/image.md) |
| Chroma | `chroma` | lodestones | `chroma-v1-hd` | 35 | 35 /img | Basic | [image.md](./models/image.md) |
| Flux 2 | `flux2` | Black Forest Labs | `flux2-dev` | 40 | 40 /img | Basic | [image.md](./models/image.md) |
| HiDream | `hidream` | HiDream.ai | `hidream-fast` | 20 | 20 /img | Pro | [image.md](./models/image.md) |
| Krea 2 | `krea_2` | Krea.ai | `krea-2-turbo` | 20 | 20 /img | Basic | [image.md](./models/image.md) |
| MiniMax H3 Image | `minimax_h3_image` | MiniMax | `minimax-h3-image` | 15 | 15 /img | Pro | [image.md](./models/image.md) |
| MOSS-Image | `moss_image` | OpenMOSS | `moss-image` | 25 | 25 /img | Basic | [image.md](./models/image.md) |
| Z-Image | `z_image` | Tongyi-MAI | `z-image-turbo` | 10 | 10 /img | Basic | [image.md](./models/image.md) |
| GPT Image | `gpt_image_2` | OpenAI | `gpt-image-2`, `gpt-image-2.5-flare`, `gpt-image-2.5-sunburst`, `gpt-image-2.6-flare`, `gpt-image-2.6-sunburst` | 9 | 38 /img | Pro | [image.md](./models/image.md) |
| Grok Image | `grok_image` | xAI | `grok-imagine-image`, `grok-imagine-image-2.0` | 90 | 90 /img | Pro | [image.md](./models/image.md) |
| Nano Banana 2 | `nano_banana_v2` | Google DeepMind | `nano-banana-v2`, `nano-banana-v2.1` | 51 | 51 /img | Pro Plus | [image.md](./models/image.md) |
| Seedream | `seedream` | ByteDance Seed | `seedream-4.0`, `seedream-4.5`, `seedream-5.0-lite`, `seedream-5.0-pro`, `seedream-5.0-flash`, `seedream-5.5` | 42 | 24 /img | Pro | [image.md](./models/image.md) |
| Stable Diffusion v1.5 | `stable_diffusion_v15` | Stability AI / Runway | `15012C538F50…` | 10 | 10 /img | Basic | [image.md](./models/image.md) |
| Stable Diffusion XL | `stable_diffusion_xl` | Stability AI | `6A35A7855770…` | 10 | 10 /img | Basic | [image.md](./models/image.md) |
| Stable Diffusion v3.5 Large | `stable_diffusion_v35_large` | Stability AI | `sd-3-5-large` | 10 | 10 /img | Basic | [image.md](./models/image.md) |

### Video

| Family | API arch | Provider | Variants (API ids) | Gems at API defaults | Site "from" price (featured variant, Gems) | Unlimited from | Detail |
|---|---|---|---|---|---|---|---|
| Cherry | `cherry` | Mage | `cherry-mini`, `cherry`, `cherry-pro`, `cherry-2`, `cherry-2-pro` | 618 | 154.5 /second | Max | [video.md](./models/video.md) |
| Berry | `berry` | Mage | `berry`, `berry-2` | 189 | 63 /second | Pro | [video.md](./models/video.md) |
| Blueberry | `blueberry` | Mage | `blueberry`, `blueberry-v2` | 360 | 90 /second | Pro Plus | [video.md](./models/video.md) |
| Raspberry | `raspberry` | Mage | `raspberry` | 360 | 90 /second | Pro Plus | [video.md](./models/video.md) |
| Kiwi | `kiwi` | Mage | `kiwi` | 270 | 54 /second | Pro Plus | [video.md](./models/video.md) |
| Lemon | `lemon` | Mage | `lemon` | 245 | 81.6 /second | Pro | [video.md](./models/video.md) |
| Melon | `melon` | Mage | `melon`, `melon-pro` | 147 | 36.75 /second | Pro | [video.md](./models/video.md) |
| Plum | `plum` | Mage | `plum`, `plum-max`, `plum-fast` | 173 | 34.5 /second | Pro | [video.md](./models/video.md) |
| Magejutsu | `magejutsu` | Mage | `magejutsu`, `magejutsu-lite`, `magejutsu-feather` | 1586 | 932 /clip | Gems only | [video.md](./models/video.md) |
| Grok Video | `grok_video` | xAI | `grok-imagine-video` | 375 | 75 /second | Pro Plus | [video.md](./models/video.md) |
| Seedance | `seedance` | ByteDance Seed | `seedance-2.0-mini`, `seedance-2.0-fast`, `seedance-2.0`, `seedance-2.5-flash`, `seedance-2.5` | 618 | 154.5 /second | Max | [video.md](./models/video.md) |
| Wan 3.0 | `wan_3` | Alibaba | `wan-3.0` | 245 | 81.6 /second | Pro | [video.md](./models/video.md) |
| Wan Video v2.2 | `wan_22` | Alibaba | `wan22-video`, `wan22-video-lightning` | 40 | 40 /clip | Pro | [video.md](./models/video.md) |
| LTX Video | `ltx_video` | Lightricks | `ltx-video-096-distilled`, `ltx-video-096-dev` | 20 | 10 /clip | Pro | [video.md](./models/video.md) |
| MiniMax-H3 | `minimax_h3` | MiniMax | `minimax-h3-turbo`, `pika-h3-flex`, `minimax-h3` | 45 | 45 /clip | Pro | [video.md](./models/video.md) |

### Audio

| Family | API arch | Provider | Variants (API ids) | Gems at API defaults | Site "from" price (featured variant, Gems) | Unlimited from | Detail |
|---|---|---|---|---|---|---|---|
| Eleven Music | `eleven_music` | ElevenLabs | `eleven-music-v2.5` | 113 | 3.75 /second | Basic | [audio.md](./models/audio.md) |
| Eleven Speech | `eleven_speech` | ElevenLabs | `eleven-v4` | 30 | 30 /250 characters | Basic | [audio.md](./models/audio.md) |
| MiniMax Music 3 | `minimax_music` | MiniMax | `minimax-music-3` | 125 | 40 /clip | Basic | [audio.md](./models/audio.md) |
| Seed Audio | `seed_audio` | Likely ByteDance Seed | `seed-audio-1.0` | 19 | 3.75 /second | Basic | [audio.md](./models/audio.md) |

## Ranking

### Facts: public benchmarks (read on the dates given)

- **Image, Artificial Analysis text-to-image Elo, read 2026-11-13** (via third-party articles, not fetched from the board itself): GPT Image 2.6 Sunburst 1261 to 1262 (#1), GPT Image 2.5 Sunburst 1230 (#2), Nano Banana 2.1 1176 ([tech-insider](https://tech-insider.org/best-ai-image-generators-2026/)). Seedream 5.5: #14 text-to-image (Elo 1134) and #8 image editing (1160) on 2026-11-18 ([felloai](https://felloai.com/seedream-5-5/)).
- **Image, Arena (as quoted by Mage's own comparison pages, 2026-11):** GPT Image 2.5 ranks above Nano Banana 2.1, Grok Imagine 2.0 and Flux 2 on text-to-image, text rendering and edit; Nano Banana 2.1 above Seedream 5.0 Pro and Flux 2; Nano Banana 2.1 and Grok Imagine 2.0 a statistical tie (7th/8th); Flux 2 above Krea 2 and Z-Image. Seedream 5.5 and MiniMax H3 Image were not yet ranked ([Mage compare pages](https://www.mage.space/models), listed in `llms.txt`).
- **Video:** Seedance 2.5 was #3 on Artificial Analysis text-to-video-with-audio on 2026-10-20 ([metavert.io](https://metavert.io/seedance), third-party reading). Wan 2.2 was 44th of 50 on Arena text-to-video (Mage compare page); LTX Video unranked.
- **Open weights, vendor claim:** MOSS-Image reports 96.3% average text coverage on LLTB, state of the art among open-weight models ([tech report](https://arxiv.org/html/2610.23374v1)).
- **No public leaderboard entry found** for Mango, Guava, SDXL Plus, Cherry, Berry, Blueberry, Raspberry, Kiwi, Lemon, Melon, Plum, Magejutsu. I found no independent (non-Mage) benchmark for them.

### Opinion: practical tiers (mine, not measured by me)

Image, general quality and instruction following:

1. **Top:** GPT Image 2.6 Sunburst (best on the public boards; filtered), Nano Banana 2.1, Mango 4 (best option when you want fewer filters and consistent characters), Seedream 5.5, Guava 2 Pro (photoreal).
2. **Strong:** Grok Imagine 2.0, Flux 2, MiniMax H3 Image (16 MP, new and unranked), Mango 3 / Mango 3 Turbo, Krea 2 Turbo (aesthetic, fast).
3. **Budget / special purpose:** Z-Image, HiDream, MOSS-Image (text layout), Chroma (unfiltered open model), Anima (anime tags), SDXL Plus, SD 3.5 Large, SDXL, SD 1.5.

Video:

1. **Top:** Cherry 2 Pro, Seedance 2.5, Wan 3.0, Lemon, Plum Max.
2. **Strong:** Plum, Grok Video, Berry 2, MiniMax-H3, Cherry Pro / Cherry 2, Melon (anime).
3. **Drafts / niche:** Cherry Mini, Seedance 2.0 Mini, Kiwi, LTX Video, Wan 2.2, Blueberry 2 (first/last frame), Raspberry (talking characters), Magejutsu (video recast, unique, expensive).

Audio: ElevenLabs v4 for speech, Eleven Music v2.5 and MiniMax Music 3 for songs, Seed Audio for dialogue/SFX/beds.

### Mage's own guidance

[Which model should I use?](https://docs.mage.space/models/which-model-should-i-use.md) is the vendor's recommendation page.

## What `lib/` hardcodes (after this change)

| Place | Value | Status |
|---|---|---|
| `lib/generation.ts` `submit()` | `mango-v4`, concept `38311d733c994ab39a3cf002cc40e194` (new default) | Verified live. `mango-v3-pro` and other ids remain usable through `model` / `conceptId`. |
| `lib/generation.ts` `submitVideo()` | `berry-2`, concept `0b1fa74f7347406392422d24f2885684` | Valid on the live catalog. Video not re-run (costs Gems). |
| `lib/types.ts` | `AspectRatio` named presets or `W:H`; `Resolution` 1K to 4K; `VideoResolution` up to 4k | Widened. Whether non-Mango architectures accept `W:H`/`3K` on the web path is untested. |
| Not modelled | Every architecture except `mango` and `berry` (config field names differ per model, e.g. `berry_aspect_ratio`); audio; first/last frame; voices; Magejutsu | Out of scope. |
