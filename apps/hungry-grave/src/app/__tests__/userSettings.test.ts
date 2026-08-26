/**
 * The persisted keyboard speed setting (ADR 0011). Storage already guards
 * every read and write and warns once, so blocked storage is a console warning
 * and never a state the game branches on; nothing here re-fixes that path.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MULTIPLIER_MAX, MULTIPLIER_MIN } from '../../input/keys';
import { userSettings } from '../userSettings';

function useLocalStorage(): void {
  const map = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => void map.set(key, value),
    },
    configurable: true,
  });
}

describe('the persisted keyboard speed setting (ADR 0011)', () => {
  beforeEach(() => useLocalStorage());
  afterEach(() => vi.restoreAllMocks());

  it('getKeyboardSpeed defaults to 1 with nothing stored', () => {
    expect(userSettings.getKeyboardSpeed()).toBe(1);
  });

  it('a value set is a value read back, so it persists (tracer plan section 5)', () => {
    userSettings.setKeyboardSpeed(1.35);
    expect(userSettings.getKeyboardSpeed()).toBeCloseTo(1.35, 12);
  });

  it("a stored value outside 0.75 to 1.5 is clamped on read, covering a hand-edited localStorage and an earlier build's wider range", () => {
    // 2.0 is exactly what an earlier build under the old 0.5x to 2.0x range
    // could have written, so this is a real input and not a hypothetical one.
    localStorage.setItem('keyboard-speed', '2');
    expect(userSettings.getKeyboardSpeed()).toBe(MULTIPLIER_MAX);

    localStorage.setItem('keyboard-speed', '0.5');
    expect(userSettings.getKeyboardSpeed()).toBe(MULTIPLIER_MIN);

    userSettings.setKeyboardSpeed(9);
    expect(userSettings.getKeyboardSpeed()).toBe(MULTIPLIER_MAX);
  });

  it('a stored speed outside the range is not silent', () => {
    // The nearest informed owner: this module holds the storage key and the raw
    // value, and src/input/keys.ts sees only the multiplier it is handed.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem('keyboard-speed', '2');

    expect(userSettings.getKeyboardSpeed()).toBe(MULTIPLIER_MAX);
    userSettings.setKeyboardSpeed(9);

    const said = warn.mock.calls.map((call) => call.join(' '));
    expect(said).toHaveLength(2);
    // What happened, and what it costs.
    expect(said[0]).toContain('keyboard-speed');
    expect(said[0]).toContain('2');
    expect(said[0]).toContain(String(MULTIPLIER_MAX));
    expect(said[0]).toContain('steer');
    expect(said[1]).toContain('9');
    expect(said[1]).toContain('steer');
  });
});
