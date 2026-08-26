/**
 * The persisted keyboard speed setting (ADR 0011). Storage already guards
 * every read and write and warns once, so blocked storage is a console warning
 * and never a state the game branches on; nothing here re-fixes that path.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MULTIPLIER_MAX, MULTIPLIER_MIN } from '../../../input/keys';
import {
  KEYBOARD_SPEED_SLIDER_MAX,
  KEYBOARD_SPEED_SLIDER_MIN,
  keyboardSpeedFromSlider,
  sliderFromKeyboardSpeed,
  userSettings,
} from '../userSettings';

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

  it("the slider's 15 to 30 range maps to 0.05 steps across 0.75 to 1.5", () => {
    // The tracer plan's checklist said 0.1 steps across 0.5x to 2.0x. 0.1 does
    // not divide 0.75 to 1.5 evenly, so the step moved with the range.
    expect(keyboardSpeedFromSlider(KEYBOARD_SPEED_SLIDER_MIN)).toBeCloseTo(
      MULTIPLIER_MIN,
      12,
    );
    expect(keyboardSpeedFromSlider(KEYBOARD_SPEED_SLIDER_MAX)).toBeCloseTo(
      MULTIPLIER_MAX,
      12,
    );
    expect(keyboardSpeedFromSlider(20)).toBeCloseTo(1, 12);

    for (
      let position = KEYBOARD_SPEED_SLIDER_MIN + 1;
      position <= KEYBOARD_SPEED_SLIDER_MAX;
      position++
    ) {
      const step =
        keyboardSpeedFromSlider(position) -
        keyboardSpeedFromSlider(position - 1);
      expect(step).toBeCloseTo(0.05, 12);
    }

    // A fractional handle position lands on a step rather than between two.
    expect(keyboardSpeedFromSlider(20.4)).toBeCloseTo(1, 12);
    expect(sliderFromKeyboardSpeed(1.25)).toBe(25);
  });
});
