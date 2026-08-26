/**
 * Nothing normal is loud. Every repair in this app says what it did, which is
 * only worth anything if a boot that repaired nothing says nothing at all: a
 * line that fires on the happy path is how a real warning gets ignored.
 *
 * It spans src/app, src/engine, src/game and src/dev, so it sits at the src
 * root rather than in any one of them.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fitField } from '../app/layout';
import { playFor } from '../app/sound';
import { userSettings } from '../app/userSettings';
import { dodgePolicy, belchingPolicy, runPolicy } from '../dev/bot';
import { getResolution } from '../engine/utils/getResolution';
import { createExecution } from '../game/execution';
import { createRun } from '../game/run';

/** A display that reports whole pixels, which is what a desktop and a phone both do. */
function useOrdinaryDisplay(): void {
  Object.defineProperty(globalThis, 'window', {
    value: { devicePixelRatio: 2 },
    configurable: true,
  });
}

/** Storage that works and holds nothing, which is a first boot. */
function useEmptyStorage(): void {
  const held = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => held.get(key) ?? null,
      setItem: (key: string, value: string) => void held.set(key, value),
    },
    configurable: true,
  });
}

/** An effects channel whose clips play, which is what a loaded bundle gives. */
const workingSound = { play: () => undefined };

describe('a normal boot', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    useOrdinaryDisplay();
    useEmptyStorage();
  });
  afterEach(() => vi.restoreAllMocks());

  it('a normal boot logs nothing', () => {
    // The four sites a boot walks through, in the order a boot reaches them.
    expect(getResolution()).toBe(2);
    expect(userSettings.getKeyboardSpeed()).toBe(1);
    fitField(1440, 900);
    playFor(workingSound, { type: 'chimed', kind: 'corpse' });
    playFor(workingSound, { type: 'belched', cancelled: 3, killed: 1 });

    expect(console.log).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('a phone-shaped viewport and a settings round trip stay quiet too', () => {
    fitField(390, 844);
    userSettings.setKeyboardSpeed(1.35);

    expect(userSettings.getKeyboardSpeed()).toBeCloseTo(1.35, 12);
    expect(console.warn).not.toHaveBeenCalled();
  });
});

describe("the sim's path", () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('writes nothing at all, and nothing to stdout in particular', () => {
    // The behaviour fingerprint runs the sim under vite-node and reads its JSON
    // off stdout. console.log goes to stdout in node and console.warn does not,
    // so one stray log anywhere on this path corrupts the fingerprint and the
    // failure reads as a behaviour change rather than as a logging mistake.
    for (const seed of [1, 7, 42]) {
      runPolicy(createExecution(createRun(seed)), dodgePolicy, 3000);
      runPolicy(createExecution(createRun(seed)), belchingPolicy, 3000);
    }

    expect(console.log).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
});
