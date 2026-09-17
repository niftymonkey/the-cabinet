/**
 * The live screen's own seam for a run that carries a record of its own: the
 * sprite pools it dressed with have no reason to reach the caps a candidate's
 * record derives, and attach is the one place they grow (ADR 0064).
 *
 * It sits here rather than beside the screen because it spans the shell's URL
 * parser as well as the screen, which is RunsScreen.test.ts's own placement.
 */

import { Container } from 'pixi.js';
import type { Ticker } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock('../ui/Label', () => ({
  Label: class extends Container {
    public text = '';
    public anchor = { set: () => {} };
    public style: Record<string, unknown> = {};
  },
}));

vi.mock('../ui/Button', () => ({
  Button: class extends Container {
    public onPress = { connect: (handler: () => void) => void handler };
  },
}));

/**
 * The record the URL is taken to have named, set per test. The parser is faked
 * and nothing else is: the run, its caps and every renderer are the real ones,
 * because what this pins is the screen's own wiring between them. No candidate
 * in the table moves the quiet interval's minimum yet, so the record cannot
 * reach the screen through a real `?tuning=` name.
 */
const named = vi.hoisted(() => ({ record: null as unknown }));

vi.mock('../seedFromUrl', async (importOriginal) => {
  const real = await importOriginal<typeof import('../seedFromUrl')>();
  return { ...real, tuningFromUrl: () => named.record };
});

import { capsFor } from '../../game/caps';
import { TICK_MS } from '../../game/clock';
import { DEFAULT_TUNING, resolveTuning } from '../../game/tuningRecord';
import { GameScreen } from '../screens/game/GameScreen';

Object.defineProperty(globalThis, 'window', {
  value: {
    location: { search: '', hash: '' },
    addEventListener: () => {},
    removeEventListener: () => {},
    // The tape header reads the input device and the pixel ratio off the page.
    matchMedia: () => ({ matches: false }),
    devicePixelRatio: 1,
  },
  configurable: true,
});

function frame(elapsedMS: number): Ticker {
  return { elapsedMS } as Ticker;
}

/** A game screen holding faked powers, the way navigation hands them in. */
function gameScreen(): GameScreen {
  const screen = new GameScreen();
  screen.init({
    openMenu: async () => {},
    closeMenu: async () => {},
    menuShowing: () => false,
    showEnd: async () => {},
    playSound: () => {},
    playMusic: () => {},
    playButtonSound: () => {},
    standInArt: () => null,
    canvas: null,
    renderer: { name: 'test', resolution: 1 },
  });
  return screen;
}

describe('the screen a run plays on', () => {
  it('draws a run whose record derives caps above the ones it dressed with', () => {
    // The screen dresses its field in the constructor and in reset(), with no
    // run in hand either time, so its pools open at the caps this build's own
    // record derives. ?tuning= can name a candidate whose record lowers the
    // quiet interval's minimum, and every cap prices the cards that minimum
    // leaves room for, so the first sync would walk slots the pools never had:
    // requireSlot calls that a bug rather than a case to handle, which is why
    // attach has to grow the pools to the started run's caps first.
    const wider = resolveTuning({ stage: { quietIntervalMinimumSeconds: 1 } });
    expect(capsFor(wider).mobs).toBeGreaterThan(capsFor(DEFAULT_TUNING).mobs);
    named.record = wider;

    const screen = gameScreen();

    expect(() => screen.prepare()).not.toThrow();
    for (let drawn = 0; drawn < 5; drawn++) {
      expect(() => screen.update(frame(TICK_MS))).not.toThrow();
    }
    // Grown to the started run's own pool, not this build's default.
    expect(
      screen['layers'].layer('mobBodies').children.length,
    ).toBeGreaterThanOrEqual(capsFor(wider).mobs);
    screen.reset();
  });

  it('draws an ordinary run, which is every run no candidate was named for', () => {
    // The default path, unmoved: a run under no record of its own plays under
    // the build's own and the pools it dressed with are exactly its caps.
    named.record = null;

    const screen = gameScreen();

    expect(() => screen.prepare()).not.toThrow();
    expect(() => screen.update(frame(TICK_MS))).not.toThrow();
    expect(
      screen['layers'].layer('mobBodies').children.length,
    ).toBeGreaterThanOrEqual(capsFor(DEFAULT_TUNING).mobs);
    screen.reset();
  });
});
