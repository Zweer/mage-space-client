# Public Mage REST API (new, discovered 2026-11-20)

mage.space now ships an **official, documented REST API**. It is separate from the Server-Actions surface the rest of `docs/api/` documents, and it is the supported way to generate. Sources: `https://www.mage.space/llms.txt`, `https://docs.mage.space/api/openapi.json` (fetched, 43 paths). **Not tested live** (needs an API key created in Settings → Developers; none in `.env`).

| Item | Value |
|---|---|
| Base URL | `https://api.mage.space/v1` (versioned, additive changes only within v1) |
| Auth | API key (Settings → Developers); see `docs.mage.space/api/authentication` |
| Flow | `POST /v1/{architecture}/generate` → `202 {request_id, status, status_url, cancel_url, billing}`; poll `GET /v1/requests/{id}/status` until `completed` (`result.url`) / `failed` / `cancelled` |
| Idempotency | optional `Idempotency-Key` header (1-255 chars) on submit |
| Other endpoints | `GET /v1/architectures` (live catalog + JSON Schema), `GET /v1/account` (Gems balance), `POST /v1/uploads` (signed upload, up to 100 MB; image/video/audio), `GET/POST /v1/characters`, `DELETE /v1/characters/{id}`, `GET/POST /v1/references`, `DELETE /v1/references/{id}`, `POST /v1/requests/{id}/cancel` (no refund) |
| Per-model endpoints | 37 architectures, e.g. `/v1/mango/generate` (see [`models.md`](./models.md)) |
| Extras | MCP server `https://mcp.mage.space/mcp` (OAuth), SDKs `@mage-space/sdk` (npm) and `mage-space` (PyPI), ComfyUI nodes |
| Request body | flat partial config: `prompt` (≤20000), `seed`, `model_id`, `aspect_ratio` (`W:H`), `resolution`, `image`, `additional_images` (https or data URLs), plus per-model fields |

Relevance to this library: the web Server Actions are not going away (all still work, below), but a REST client would avoid hash discovery, RSC parsing and cookie sessions entirely. The official SDK already exists, so the question for this project is positioning, not capability.
