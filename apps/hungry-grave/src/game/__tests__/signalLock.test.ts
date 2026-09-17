/**
 * The signal lock: the one question anything asks of it, and the reason the
 * value that means "no experiment held the signal" can never be mistaken for a
 * signal.
 */

import { describe, expect, it } from 'vitest';

import {
  advancePressure,
  startingSignal,
  STARTING_DIRECTOR,
} from '../director';
import type { SimEvent } from '../events';
import { isLocked, SIGNAL_FULL, SIGNAL_RAN_LIVE } from '../signalLock';

const GRAVE_HIT: SimEvent = {
  type: 'graveHit',
  source: 'shambler',
  size: 24,
  invulnerable: 0,
};

const SCORE_BLED: SimEvent = { type: 'scoreBled', amount: 100, score: 0 };
const WEAPON_STRIPPED: SimEvent = { type: 'weaponStripped', lines: [] };

describe('the signal lock (ADR 0027, CONTEXT.md Signal lock)', () => {
  it('reads as live at the resolved value that means live, and as held anywhere else', () => {
    // Module test. The lock at its bounds and at the value that means live,
    // which is the whole of what isLocked answers.
    expect(isLocked(SIGNAL_RAN_LIVE)).toBe(false);
    expect(isLocked(0)).toBe(true);
    expect(isLocked(SIGNAL_FULL)).toBe(true);
    expect(isLocked(SIGNAL_FULL / 2)).toBe(true);
  });

  it('names a figure the signal itself can never stand at', () => {
    // The sentinel has to survive the wire, so it is a number rather than a
    // unique symbol, and a number sharing the signal's own type is only safe
    // while the scale cannot produce it. advancePressure clamps every value it
    // writes between zero and SIGNAL_FULL, so the impossibility is pinned here
    // against the real function rather than left as a reading of its source.
    expect(SIGNAL_RAN_LIVE).toBeLessThan(0);

    let signal = STARTING_DIRECTOR.signal;
    for (let tick = 0; tick < 4000; tick++) {
      const events =
        tick % 13 === 0
          ? [GRAVE_HIT]
          : tick % 401 === 0
            ? [SCORE_BLED, WEAPON_STRIPPED]
            : [];
      signal = advancePressure(signal, events, tick);
      expect(signal.value).toBeGreaterThanOrEqual(0);
      expect(signal.value).toBeLessThanOrEqual(SIGNAL_FULL);
      expect(signal.value).not.toBe(SIGNAL_RAN_LIVE);
    }
  });

  it('stands a held run at its own figure from before the first tick', () => {
    // A lock is a figure the run is held at and not only a flag saying it is
    // held: the spend gate reads the signal's value, so a held run that started
    // at zero would be an experiment about zero whatever figure was asked for.
    expect(startingSignal(SIGNAL_RAN_LIVE).value).toBe(0);
    expect(startingSignal(SIGNAL_FULL).value).toBe(SIGNAL_FULL);
    expect(startingSignal(0).value).toBe(0);
    expect(startingSignal(0).lock).toBe(0);
  });
});
