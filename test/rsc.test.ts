import { describe, expect, it } from 'vitest';
import { RscParseError } from '../lib/errors.js';
import {
  parseFlightRows,
  parseServerActionResponse,
  resolveFlightValue,
  unwrapResult,
} from '../lib/rsc.js';

describe('unwrapResult', () => {
  it('unwraps a one-element array (the *Parallel wrap)', () => {
    expect(unwrapResult({ creations: [], hasMore: false })).toEqual({
      creations: [],
      hasMore: false,
    });
    expect(unwrapResult([{ creations: [], hasMore: false }])).toEqual({
      creations: [],
      hasMore: false,
    });
  });

  it('leaves genuine multi-element arrays and non-arrays untouched', () => {
    expect(unwrapResult([{ id: 'a' }, { id: 'b' }])).toEqual([{ id: 'a' }, { id: 'b' }]);
    expect(unwrapResult('x')).toBe('x');
  });

  it('parses a real *Parallel wrapped envelope to the inner object', () => {
    const text =
      '0:{"a":"$@1","f":"","b":"b"}\n1:["$@2"]\n2:{"creations":[{"id":"c-1"}],"hasMore":true}\n';
    const parsed = parseServerActionResponse(text);
    const page = unwrapResult<{ creations: { id: string }[]; hasMore: boolean }>(parsed);
    expect(page.creations[0]?.id).toBe('c-1');
    expect(page.hasMore).toBe(true);
  });
});

describe('parseFlightRows', () => {
  it('parses hex-id JSON rows and skips non-JSON rows', () => {
    // Arrange
    const text = '0:{"a":"$@1"}\n1:{"history_id":"h-1"}\n2:I["module","ref"]\nblank\n';

    // Act
    const rows = parseFlightRows(text);

    // Assert
    expect(rows.get('0')).toEqual({ a: '$@1' });
    expect(rows.get('1')).toEqual({ history_id: 'h-1' });
    expect(rows.has('2')).toBe(false);
  });
});

describe('resolveFlightValue', () => {
  it('resolves references and the $undefined sentinel', () => {
    // Arrange
    const rows = new Map<string, unknown>([['1', { id: 'h-1', audio: '$undefined' }]]);

    // Act
    const resolved = resolveFlightValue('$@1', rows) as { id: string; audio?: unknown };

    // Assert
    expect(resolved.id).toBe('h-1');
    expect(resolved.audio).toBeUndefined();
  });

  it('guards against reference cycles', () => {
    // Arrange
    const rows = new Map<string, unknown>([['1', { self: '$@1' }]]);

    // Act
    const resolved = resolveFlightValue('$@1', rows) as { self?: unknown };

    // Assert
    expect(resolved.self).toBeUndefined();
  });
});

describe('parseServerActionResponse', () => {
  it('resolves the row-0 { a } envelope', () => {
    // Arrange
    const text = '0:{"a":"$@1","f":"","b":"build"}\n1:{"history_id":"h-1","cfg":"$undefined"}\n';

    // Act
    const data = parseServerActionResponse<{ history_id: string; cfg?: unknown }>(text);

    // Assert
    expect(data.history_id).toBe('h-1');
    expect(data.cfg).toBeUndefined();
  });

  it('falls back to the last row when no envelope is present', () => {
    // Arrange
    const text = '2:{"foo":"bar"}\n';

    // Act
    const data = parseServerActionResponse<{ foo: string }>(text);

    // Assert
    expect(data.foo).toBe('bar');
  });

  it('throws RscParseError on an empty response', () => {
    // Act & Assert
    expect(() => parseServerActionResponse('')).toThrow(RscParseError);
  });
});

describe('parseFlightRows length-delimited text rows', () => {
  it('isolates a data row glued directly after a multiline, multibyte text row', () => {
    // Reproduces the real getHistoryPaginated shape: `2:T7,<7 utf8 bytes>` (an em
    // dash is 3 bytes, plus an embedded newline) followed IMMEDIATELY — no newline —
    // by the data row `1:{...}`.
    const text =
      '0:{"a":"$@1","f":"","b":"x"}\n' +
      '2:T7,a—b\nc' +
      '1:{"histories":[{"id":"h1","architecture_config":{"prompt":"$2"}}],"hasMore":false}\n';

    const parsed = parseServerActionResponse<{
      histories: { id: string; architecture_config: { prompt: string } }[];
      hasMore: boolean;
    }>(text);

    expect(parsed.histories).toHaveLength(1);
    expect(parsed.histories[0]?.id).toBe('h1');
    expect(parsed.hasMore).toBe(false);
    // The `$2` prompt reference resolves to the length-delimited text (with newline).
    expect(parsed.histories[0]?.architecture_config.prompt).toBe('a—b\nc');
  });
});
