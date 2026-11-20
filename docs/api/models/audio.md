# Audio models

Generated from live data on 2026-11-20: the Mage API OpenAPI document, the web concept catalog (`getConceptsParallel`), docs.mage.space and public provider sources. Labels in brackets give the confidence of each claim: **confirmed** (source named), **inferred** (reasoned from evidence, flagged), **unknown**. See [`../models.md`](../models.md) for the index, ranking and the NSFW matrix.

## Eleven Music

- **API architecture:** `eleven_music` · **Mage family page:** [https://docs.mage.space/models/eleven-music](https://docs.mage.space/models/eleven-music.md)
- **Origin (Mage's wording):** Run by ElevenLabs, reached via Mage
- **Provider:** ElevenLabs
- **Base / underlying model:** Eleven Music v2.5. [confirmed: Mage docs]
- **Release dates:** On Mage 2026-10-23/24. [confirmed]
- **API `model_id` values (default first):** `eleven-music-v2.5`
- **API resolutions:** not selectable; **aspect ratios:** n/a; **durations (s):** 10-300 (6 values)
- **Credit cost:** 113 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Eleven Music | `eleven-music-v2.5` | `72efbefed5c74daabab07be9bfc69b1e` | 2026-10-23 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Eleven Music v2.5 | 10 seconds | Unlimited | Unlimited | Unlimited | Unlimited |
| Eleven Music v2.5 | 30 seconds | Gems | Unlimited | Unlimited | Unlimited |
| Eleven Music v2.5 | 60 seconds | Gems | Gems | Unlimited | Unlimited |
| Eleven Music v2.5 | 120 seconds | Gems | Gems | Gems | Unlimited |
| Eleven Music v2.5 | 180 or 300 seconds | Gems | Gems | Gems | Gems |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Image references | No |
| Audio references | No |
| Vocals | Yes, or Instrumental for none |
| Durations | 10, 30, 60, 120, 180, or 300 seconds |

## Eleven Speech

- **API architecture:** `eleven_speech` · **Mage family page:** [https://docs.mage.space/models/eleven-speech](https://docs.mage.space/models/eleven-speech.md)
- **Origin (Mage's wording):** Run by ElevenLabs, reached via Mage
- **Provider:** ElevenLabs
- **Base / underlying model:** Eleven v4 text-to-speech (16 voices on Mage, 90+ languages). [confirmed: Mage docs]
- **Release dates:** On Mage 2026-10-23/24. [confirmed]
- **API `model_id` values (default first):** `eleven-v4`
- **API resolutions:** not selectable; **aspect ratios:** n/a
- **Credit cost:** 30 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Eleven Speech | `eleven-v4` | `43340b650f8e4d91b04b74912d816ff7` | 2026-10-23 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Eleven v4 | Up to 750 characters | Unlimited | Unlimited | Unlimited | Unlimited |
| Eleven v4 | Up to 1,500 characters | Gems | Unlimited | Unlimited | Unlimited |
| Eleven v4 | Up to 3,250 characters | Gems | Gems | Unlimited | Unlimited |
| Eleven v4 | Up to 4,750 characters | Gems | Gems | Gems | Unlimited |
| Eleven v4 | Longer | Gems | Gems | Gems | Gems |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Image references | No |
| Audio references | No |
| Voices | 16 preset voices |
| Text length | Up to 5,000 characters |

## MiniMax Music 3

- **API architecture:** `minimax_music` · **Mage family page:** [https://docs.mage.space/models/minimax-music-3](https://docs.mage.space/models/minimax-music-3.md)
- **Origin (Mage's wording):** Open-weights model hosted on Mage GPUs
- **Provider:** MiniMax
- **Base / underlying model:** MiniMax Music 3. [confirmed: Mage docs]
- **Release dates:** On Mage 2026-11-12. [confirmed]
- **API `model_id` values (default first):** `minimax-music-3`
- **API resolutions:** not selectable; **aspect ratios:** n/a; **durations (s):** 30-300 (6 values)
- **Credit cost:** 125 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| MiniMax Music 3 | `minimax-music-3` | `64e00278e9cc4c22867924bdef1b0f81` | 2026-11-12 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| MiniMax Music 3 | 30 or 60 seconds | Unlimited | Unlimited | Unlimited | Unlimited |
| MiniMax Music 3 | 120 or 180 seconds | Gems | Unlimited | Unlimited | Unlimited |
| MiniMax Music 3 | 240 or 300 seconds | Gems | Gems | Unlimited | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Your own lyrics | Yes, in the Lyrics setting |
| Instrumentals | Yes: leave Lyrics empty or turn on Instrumental |
| Lengths | Up to 30, 60, 120, 180, 240, or 300 seconds |
| LoRAs | Yes |
| Seed | Yes |
| Audio references | No |
| Characters and References | No |

## Seed Audio

- **API architecture:** `seed_audio` · **Mage family page:** [https://docs.mage.space/models/seed-audio](https://docs.mage.space/models/seed-audio.md)
- **Origin (Mage's wording):** "Audio model reached through Mage" (provider not named)
- **Provider:** Likely ByteDance Seed (inferred from the name `seed-audio-1.0`)
- **Base / underlying model:** Unknown. [inferred provider, unconfirmed]
- **Release dates:** 2026-07-01 (concept created); announced with audio generation 2026-07-09. [confirmed: Mage]
- **API `model_id` values (default first):** `seed-audio-1.0`
- **API resolutions:** not selectable; **aspect ratios:** n/a; **durations (s):** 5-120 (5 values)
- **Credit cost:** 19 Gems at API default settings; cheapest advertised price is in the index table of [`../models.md`](../models.md).

**Web concepts (what the Mage web app / this client uses):**

| Display name | Web `model_id` | Concept id | Created | In API enum |
|---|---|---|---|---|
| Seed Audio | `seed-audio-1.0` | `cb045c5cca4647a9b0e9addc3979ca7f` | 2026-07-01 | yes |

**Unlimited generation by plan** (Mage docs; "Gems" = always costs Gems on that plan):

| Model | Setting | Basic | Pro | Pro Plus | Max |
| - | - | - | - | - | - |
| Seed Audio | 5 seconds | Unlimited | Unlimited | Unlimited | Unlimited |
| Seed Audio | 10 seconds | Unlimited | Unlimited | Unlimited | Unlimited |
| Seed Audio | 30 seconds | Gems | Unlimited | Unlimited | Unlimited |
| Seed Audio | 60 seconds | Gems | Gems | Unlimited | Unlimited |
| Seed Audio | 120 seconds | Gems | Gems | Gems | Unlimited |

**Capabilities** (Mage docs):

| Feature | Support |
| - | - |
| Image references | Up to 1 |
| Audio references | Up to 3 |
| LoRAs | No |
| Negative prompts | No |
| Durations | 5, 10, 30, 60, or 120 seconds |
