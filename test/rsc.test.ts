import { describe, expect, it } from 'vitest';
import { RscParseError } from '../lib/errors.js';
import { parseFlightRows, parseServerActionResponse, resolveFlightValue } from '../lib/rsc.js';

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
