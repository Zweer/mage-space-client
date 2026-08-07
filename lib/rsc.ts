/**
 * Minimal parser for the React Server Component (RSC) "Flight" wire format used
 * by Next.js Server Action responses.
 *
 * The wire format is a sequence of newline-delimited rows:
 *
 * ```text
 * 0:{"a":"$@1","f":"","b":"buildId"}
 * 1:{"history_id":"e3357fb8-...","architecture_config":"$T0:0:architectureConfig"}
 * ```
 *
 * Each row is `<hexId>:<jsonPayload>`. Values may contain sentinels:
 * - `$undefined`       → `undefined`
 * - `$@<id>`           → reference to another row (a resolved promise)
 * - `$$...`            → an escaped literal string starting with `$`
 * - `$<other>`         → a typed marker (kept verbatim, best-effort)
 *
 * @remarks
 * The exact envelope for some read actions (e.g. `getHistoryById`) should be
 * confirmed against live traffic via the rev-eng Playwright flow; this parser is
 * intentionally tolerant and falls back to the last JSON row when the row-0
 * `{ a: ... }` envelope is absent.
 */
import { RscParseError } from './errors.js';

const REF_RE = /^\$@([0-9a-f]+)$/i;
/** A plain row reference like `$5` (not a promise `$@5`, nor a `$D`/`$S`/... marker). */
const HEX_REF_RE = /^\$([0-9a-f]+)$/i;
const ROW_ID_RE = /^[0-9a-f]+$/i;

/** Return the char index after consuming exactly `byteLen` UTF-8 bytes from `start`. */
function endOfUtf8Slice(text: string, start: number, byteLen: number): number {
  let bytes = 0;
  let i = start;
  while (i < text.length && bytes < byteLen) {
    const cp = text.codePointAt(i) as number;
    bytes += cp <= 0x7f ? 1 : cp <= 0x7ff ? 2 : cp <= 0xffff ? 3 : 4;
    i += cp > 0xffff ? 2 : 1;
  }
  return i;
}

/**
 * Parse the raw Flight text into a map of `rowId → value`.
 *
 * @remarks
 * Most rows are `id:<json>\n`, but text rows are length-delimited:
 * `id:T<hexlen>,<hexlen UTF-8 bytes>` and are NOT newline-terminated — the next
 * row begins immediately after the counted bytes. A naive line split therefore
 * glues the following data row onto a multi-line prompt (which is exactly why
 * large `getHistoryPaginated` responses failed to parse). This parser is
 * position/length aware so length-delimited rows are consumed exactly and every
 * subsequent row stays isolated.
 */
export function parseFlightRows(text: string): Map<string, unknown> {
  const rows = new Map<string, unknown>();
  const n = text.length;
  let pos = 0;
  while (pos < n) {
    if (text[pos] === '\n') {
      pos += 1;
      continue;
    }
    const colon = text.indexOf(':', pos);
    if (colon === -1) {
      break;
    }
    const id = text.slice(pos, colon);
    if (!ROW_ID_RE.test(id)) {
      // Not a row boundary; skip to the next line and resync.
      const nl = text.indexOf('\n', pos);
      if (nl === -1) {
        break;
      }
      pos = nl + 1;
      continue;
    }
    if (text[colon + 1] === 'T') {
      // Length-delimited text row: T<hexlen>,<bytes> (no trailing newline).
      const comma = text.indexOf(',', colon + 2);
      if (comma === -1) {
        break;
      }
      const byteLen = Number.parseInt(text.slice(colon + 2, comma), 16);
      const start = comma + 1;
      const end = endOfUtf8Slice(text, start, byteLen);
      rows.set(id, text.slice(start, end));
      pos = end;
      continue;
    }
    // Any other row is a single line terminated by \n.
    const nl = text.indexOf('\n', colon + 1);
    const payload = nl === -1 ? text.slice(colon + 1) : text.slice(colon + 1, nl);
    pos = nl === -1 ? n : nl + 1;
    const first = payload[0];
    if (first === undefined) {
      continue;
    }
    const looksJson =
      first === '{' ||
      first === '[' ||
      first === '"' ||
      first === '-' ||
      (first >= '0' && first <= '9') ||
      payload === 'true' ||
      payload === 'false' ||
      payload === 'null';
    if (!looksJson) {
      // Module/element/hint rows (e.g. `1:I[...]`, `2:"$Sreact..."`) are not data.
      continue;
    }
    try {
      rows.set(id, JSON.parse(payload));
    } catch {
      // Ignore rows that are not valid JSON.
    }
  }
  return rows;
}

/** Recursively resolve Flight sentinels/references within a parsed value. */
export function resolveFlightValue(
  value: unknown,
  rows: Map<string, unknown>,
  seen: Set<string> = new Set(),
): unknown {
  if (typeof value === 'string') {
    if (value === '$undefined') {
      return undefined;
    }
    const ref = REF_RE.exec(value) ?? HEX_REF_RE.exec(value);
    if (ref) {
      const refId = ref[1];
      if (refId === undefined || seen.has(refId)) {
        return undefined;
      }
      seen.add(refId);
      const target = rows.get(refId);
      return target === undefined ? undefined : resolveFlightValue(target, rows, seen);
    }
    if (value.startsWith('$$')) {
      return value.slice(1);
    }
    // Other `$`-prefixed markers are kept verbatim.
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => resolveFlightValue(entry, rows, seen));
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = resolveFlightValue(entry, rows, seen);
    }
    return out;
  }
  return value;
}

/**
 * Parse a Server Action response and return the action's resolved return value.
 *
 * @throws {RscParseError} when the response contains no parseable rows.
 */
export function parseServerActionResponse<T = unknown>(text: string): T {
  const rows = parseFlightRows(text);
  if (rows.size === 0) {
    throw new RscParseError('Empty or unparseable RSC response');
  }
  const root = rows.get('0');
  if (root !== null && typeof root === 'object' && !Array.isArray(root) && 'a' in root) {
    return resolveFlightValue((root as Record<string, unknown>).a, rows) as T;
  }
  // Fallback: the highest-id row usually carries the payload.
  let lastId: string | null = null;
  for (const id of rows.keys()) {
    if (lastId === null || Number.parseInt(id, 16) > Number.parseInt(lastId, 16)) {
      lastId = id;
    }
  }
  return resolveFlightValue(lastId === null ? undefined : rows.get(lastId), rows) as T;
}

/**
 * Unwrap a single-object result that some Server Actions (notably the
 * `*Parallel` family) wrap in a one-element array.
 *
 * @remarks
 * `getCreationsPaginatedParallel` and `getMentionSuggestionsParallel` return their
 * payload as `[value]` on the RSC wire (`1:["$@2"]`), whereas most actions return
 * the value directly. This normalizes object-returning actions to the value; it is
 * a no-op when the response is already the object. Do NOT use it for actions whose
 * genuine return type is an array (e.g. `getReferences`).
 */
export function unwrapResult<T>(value: unknown): T {
  return (Array.isArray(value) && value.length === 1 ? value[0] : value) as T;
}
