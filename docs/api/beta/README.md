# Beta Portal API (`beta.mage.space`)

## Overview

mage.space is migrating from production (`https://www.mage.space`) to a new portal at
`https://beta.mage.space`. This document is the reverse-engineering capture deliverable for the
beta host: it records the action surface the client's `BETA_TARGET` descriptor assumes, so those
constants have a document to cite and each assumed fact has a home to be promoted to **VERIFIED**
once the live authenticated flow confirms it.

> **Status: ASSUMED, pending rev-eng / live flow.**
> Every wire fact below is derived from the brief and from the shape of the production API, not
> from a captured beta response. Nothing here has been confirmed against `beta.mage.space`. The
> `BETA_TARGET` constant in `lib/targets.ts` cites **this file**; until the live flow runs, both
> this document and `BETA_TARGET` remain assumptions. Promote a fact to VERIFIED only after it is
> observed on the wire against beta.

The library models each host as a `Target` (`lib/targets.ts`). The client holds the ordered chain
`[production, beta]` and advances to beta only when production can no longer serve a required
action. The beta-specific divergences captured here are the action-name set, the absence of
`getHistoryById`, and the paginated poll strategy that replaces it.

## Authentication

- **ASSUMED** identical to production: a `__session` cookie minted by `createUserSession`, plus the
  Firebase ID token in the request body.
- `createUserSession` is **ASSUMED** present and resolved by its literal name (it is not part of
  the per-target action-name table). Each host mints its own session; the client calls
  `resetSession()` before retrying against a new host.

---

## Action-name set

The beta host is assumed to expose the same logical operations as production, with one renamed
action and one removed action. "VERIFIED (prod)" means checked against this worktree's source for
production; the beta column is ASSUMED until a beta capture confirms it.

| Logical operation   | Prod wire name (VERIFIED)        | Beta wire name (ASSUMED)        | Note              |
|---------------------|----------------------------------|---------------------------------|-------------------|
| `submitGeneration`  | `runArchitecture`                | `runArchitecture`               | ASSUMED same      |
| `cancelJob`         | `cancelArchitectureJob`          | `cancelArchitectureJob`         | ASSUMED same      |
| `createUserSession` | `createUserSession`              | `createUserSession`             | ASSUMED same      |
| `listHistory`       | `getHistoryPaginated`            | `getHistoryPaginated`           | ASSUMED same      |
| `listCreations`     | `getCreationsPaginatedParallel`  | `getCreationsPaginated`         | **ASSUMED renamed** |
| `getHistoryById`    | `getHistoryById`                 | *(absent — see Poll strategy)*  | **ASSUMED absent**  |

### Notes

- **`getCreationsPaginated` replaces `getCreationsPaginatedParallel`.** This is the only
  action-name override carried in `BETA_TARGET.actionNames`. Every other logical name resolves to
  itself via `resolveActionName`. ASSUMED (pending rev-eng).
- **`getHistoryPaginated` is assumed unchanged** in both name and envelope (see below).
  ASSUMED (pending rev-eng).
- **`runArchitecture`, `cancelArchitectureJob`, `createUserSession` are assumed unchanged** in
  name and arguments. ASSUMED (pending rev-eng).

---

## `getHistoryById` presence

**ASSUMED ABSENT on beta.** The brief indicates the beta portal no longer exposes a
single-item-by-id read. Because the client cannot poll a job by id on beta, status reads use a
paginated sweep of `getHistoryPaginated` instead (see Poll strategy). This is the single most
important beta divergence and the primary driver of the `pollStrategy: 'paginated'` descriptor
value. ASSUMED (pending rev-eng / live flow) — if a by-id read turns out to exist on beta, the
beta poll strategy can revert to `'byId'`.

---

## Get History Paginated (`getHistoryPaginated`)

**ASSUMED identical to production.** Path, argument order, and response envelope are assumed to
match the production `getHistoryPaginated` documented in [`../history.md`](../history.md).

### Request

- **Path:** `POST /creations` (ASSUMED same page path as production — note this is `/creations`,
  **not** `/explore`; `/explore` hosts the submit/cancel/by-id actions).
- **Arg order:** `[uid, limit, offset, { status, type: '$undefined' }]`

```json
["<uid>", 20, 0, {"status": "running", "type": "$undefined"}]
```

| Arg | Type | Description |
|-----|------|-------------|
| 0 | string | User ID (resolved via `auth.getUserId()`) |
| 1 | number | Limit (page size) |
| 2 | number | Offset (pagination) |
| 3 | object | Filter: `{ status, type }` |

### Filter object

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `"running"`, `"success"`, `"error"`, or the raw `"$undefined"` sentinel for "no status filter" |
| `type` | string | `"$undefined"` for all types |

### Response (RSC → parsed)

```json
{
  "histories": [ { "id": "...", "status": "running", "...": "..." } ],
  "hasMore": true
}
```

- Response field is **`histories`** (an array), alongside a boolean **`hasMore`** —
  `{ histories, hasMore }`. ASSUMED same as production.
- Item shape is assumed identical to the production history item (see
  [`../history.md`](../history.md)).

---

## Poll strategy (`pollStrategy: 'paginated'`)

Because `getHistoryById` is assumed absent, a single status read on beta pages
`getHistoryPaginated` and scans for the item whose `id === historyId`.

- Resolve `uid` via `auth.getUserId()` first (arg 0 of `getHistoryPaginated`).
- Page with `limit = 20` (`PAGINATED_POLL_PAGE_SIZE`), `offset` starting at `0`, up to `10` pages
  (`PAGINATED_POLL_MAX_PAGES`, i.e. 200 items) to bound cost.
- Status comparison uses the `JobStatus` union values `'running' | 'success' | 'error'`.

### Which status filter surfaces a running job (open question)

It is **not documented** for either host whether `getHistoryPaginated` with no status filter
(`status: 'all'` → the `$undefined` sentinel used in `lib/history.ts`) includes **running** jobs.
The poll therefore does **not** rely on the no-filter case surfacing running jobs. Instead each
poll iteration performs a **two-phase sweep** over the current offset window:

1. **Phase 1 —** request `status: 'running'` and scan `histories` for the target id. If found,
   return it (status `running`).
2. **Phase 2 —** if not found, request `status: '$undefined'` (the raw no-filter sentinel, which
   reliably returns terminal `success`/`error` items on production) on the same window and scan
   again. If found, return it (terminal status).

If the id is in neither phase and `hasMore` is true, advance `offset += 20` and repeat both
phases. If `hasMore` is false or the page cap is reached without finding the id, the poll throws.

> **OPEN QUESTION (ASSUMED, pending rev-eng):** does the no-filter (`$undefined`) case already
> include running jobs on beta? If the capture confirms it does, phase 1 can be dropped and the
> sweep collapses to a single request per window. The two-phase sweep is the safe default that
> works regardless of the answer.

---

## HTTP 409 observation

**None captured.** No `409` ("Server Action unavailable") response has been observed on beta (nor
is `409` referenced anywhere in the production code or docs). Accordingly, **409 is not a fallback
trigger**; fallback relies solely on the verified `404` / `text/html` HTML-fallback detection. If
a `409` is later captured on beta, add the captured response to this file and gate the one-line
change that adds `409` to the unavailable-status set on that evidence. ASSUMED (pending rev-eng /
live flow).

---

## Source and citations

- `BETA_TARGET` in `lib/targets.ts` cites this file; its inline `ASSUMED` comments point here.
- Production envelopes referenced for comparison: [`../history.md`](../history.md),
  [`../generation.md`](../generation.md).
- Every fact above is **ASSUMED (pending rev-eng / live flow)** until observed on the wire against
  `beta.mage.space` via the live authenticated flow (`test/e2e/full.test.ts`, gated on
  `MAGE_REFRESH_TOKEN`).
