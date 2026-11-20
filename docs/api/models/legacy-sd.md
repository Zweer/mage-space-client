# Appendix: legacy Stable Diffusion checkpoints

Verified live on 2026-11-20 from the web concept catalog (`getConceptsParallel`, official concepts with `uid: null`).

| Base architecture | Official concepts | Tagged `info:Mature` | API architecture |
|---|---|---|---|
| SD 1.5 | 126 | 126 | `stable_diffusion_v15` |
| SDXL (incl. Pony / Illustrious-style fine-tunes) | 167 | 167 | `stable_diffusion_xl` |
| SD 3.5 Large / Turbo | 140 | 0 | `stable_diffusion_v35_large` |
| **Total** | **433** | **293** | |

- Concepts were created between 2024-07-11 and 2025-08-05 (321 in 2024, 112 in 2025). Only about 175 distinct underlying checkpoints exist: many concepts are the same checkpoint hash with a different preset (e.g. "General Fast" appears three times with the same SDXL hash).
- 293 of the 433 are tagged `info:Unlimited` (docs: SDXL / SD 1.5 / SD 3.5 checkpoints are unlimited from **Basic**).
- The `info:Mature` tag is a catalog label (it drives what Mature Mode shows); it is **not** a statement that explicit content is allowed (see [`nsfw.md`](./nsfw.md)).
- The new site no longer lists these as separate models; they remain reachable in the advanced picker/catalog. Mage docs describe Pony and Illustrious as "SDXL checkpoints in the model catalog, hosted on Mage's GPUs", with no base model of that name ([Pony](https://docs.mage.space/models/pony.md), [Illustrious](https://docs.mage.space/models/illustrious.md)). [confirmed]
- Base-model provenance of the individual checkpoints (who trained them, what they were merged from) is community-sourced and not documented by Mage. [unknown]

Most-played official legacy concepts (all-time plays as exposed by the catalog; **fact**, but plays say nothing about quality):

| Concept | Base | All-time plays | Created |
|---|---|---|---|
| General Fast | SDXL | 3.80M | 2024-07-14 |
| Stable Diffusion 3.5 Turbo | SD 3.5 | 1.42M | 2024-10-22 |
| Stable Diffusion 3.5 Large | SD 3.5 | 0.85M | 2024-10-22 |
| CyberRealistic Pony V11 | SDXL (Pony) | 0.61M | 2025-06-13 |
| Cinematic Dynamic | SDXL | 0.52M | 2024-07-23 |
| CyberRealistic | SD 1.5 | 0.33M | 2024-07-11 |
| Beautiful Asian Girl | SD 1.5 | 0.32M | 2024-07-22 |
| AlbedoBase XL V2 | SDXL | 0.29M | 2024-07-11 |
| JuggernautXL V11 | SDXL | 0.28M | 2024-09-13 |
| Merged Amateurs | SD 1.5 | 0.28M | 2024-07-11 |

Other notable names: Lyriel, Reliberate, CyberRealistic V5 (SD 1.5); GhostXL, Photorealism, Emma, SDXL, Fast Vintage (SDXL).
