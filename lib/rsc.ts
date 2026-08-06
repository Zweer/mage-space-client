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
const ROW_ID_RE = /^[0-9a-f]+$/i;

/** Parse the raw Flight text into a map of `rowId → parsed JSON value`. */
export function parseFlightRows(text: string): Map<string, unknown> {
  const rows = new Map<string, unknown>();
  for (const line of text.split('\n')) {
    if (line.length === 0) {
      continue;
    }
    const sep = line.indexOf(':');
    if (sep <= 0) {
      continue;
    }
    const id = line.slice(0, sep);
    if (!ROW_ID_RE.test(id)) {
      continue;
    }
    const payload = line.slice(sep + 1);
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
      // Module/element rows (e.g. `1:I[...]`, `2:"$Sreact..."`) are not data.
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
    const ref = REF_RE.exec(value);
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
