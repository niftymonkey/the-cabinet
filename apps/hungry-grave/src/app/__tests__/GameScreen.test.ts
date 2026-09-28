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
import {
  fieldOfHeight,
  SHORTEST_FIELD,
  TALLEST_FIELD_HEIGHT,
} from '../../game/field';
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
function gameScreen(stage = { width: 540, height: 760 }): GameScreen {
  const screen = new GameScreen();
  screen.init({
    stageBox: () => stage,
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
    // The pools open at the tallest field's caps, so the run plays the
    // tallest field too, which is the one stage whose caps can sit above them.
    const wider = resolveTuning({ stage: { quietIntervalMinimumSeconds: 1 } });
    const tallest = fieldOfHeight(TALLEST_FIELD_HEIGHT);
    expect(capsFor(wider, tallest).mobs).toBeGreaterThan(
      capsFor(DEFAULT_TUNING, tallest).mobs,
    );
    named.record = wider;

    const screen = gameScreen({ width: 540, height: 1260 });

    expect(() => screen.prepare()).not.toThrow();
    for (let drawn = 0; drawn < 5; drawn++) {
      expect(() => screen.update(frame(TICK_MS))).not.toThrow();
    }
    // Grown to the started run's own pool, not this build's default.
    expect(
      screen['layers'].layer('mobBodies').children.length,
    ).toBeGreaterThanOrEqual(capsFor(wider, tallest).mobs);
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
    ).toBeGreaterThanOrEqual(capsFor(DEFAULT_TUNING, SHORTEST_FIELD).mobs);
    screen.reset();
  });
});

describe("the run's shape (tilted view T12, A35)", () => {
  it('begins a run on the field its stage asks for', () => {
    // T12: a run takes its shape from the stage the navigation last measured,
    // when it starts. An iPhone 15's stage at a small viewport of 660 is 540
    // by 906 (show-what-you-have.md section 3.1), so its run is 906 tall.
    named.record = null;
    const screen = gameScreen({ width: 540, height: 906 });

    screen.prepare();

    expect(screen['session'].run?.field.height).toBe(906);
    screen.reset();
  });

  it("keeps the run's field through a resize mid-run, fitted with bars", () => {
    // A35: a window resized mid-run refits the same field and never changes
    // it, so the sim and the tape keep one shape. A 906 field in a 540 by 600
    // stage fills the height at 600 / 906 = 0.662252, and the bars are the
    // sides, (540 - 540 * 600 / 906) / 2 = 91.192053 each.
    named.record = null;
    const screen = gameScreen({ width: 540, height: 906 });
    screen.prepare();
    screen.resize(540, 906);
    screen.update(frame(TICK_MS));

    screen.resize(540, 600);

    expect(screen['session'].run?.field.height).toBe(906);
    expect(screen['field'].scale.x).toBeCloseTo(0.662252, 6);
    expect(screen['field'].position.x).toBeCloseTo(91.192053, 5);
    expect(screen['field'].position.y).toBeCloseTo(0, 9);
    screen.reset();
  });
});
