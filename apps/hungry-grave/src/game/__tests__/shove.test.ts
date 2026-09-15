/**
 * The shove (design record round-two-wall-belch.md, rulings R1, R2, R3 and R8):
 * a force that spends itself over several ticks instead of in one position
 * write. Every figure here comes from the record's rulings R2 and R3 as
 * superseded on 2026-09-15 and the research behind them
 * (docs/research/watched-pushback-duration.md section 5, option 2); what is
 * pinned is the shape and the relations, not a magnitude the tuning step owns.
 */

import { describe, expect, it } from 'vitest';

import { MOB_TYPES } from '../mobs';
import type { Impulse, ShoveStep } from '../shove';
import {
  advanceShove,
  blankImpulse,
  impulseSpent,
  shoveInFlight,
  SHOVE_TICKS,
  startShove,
  takeShoveTravel,
} from '../shove';

/** Straight up the field, which is the away direction of a body ahead of the grave. */
const UP_X = 0;
const UP_Y = -1;

/** Every step one whole impulse owes, tick by tick, until it is spent. */
function stepsOf(impulse: Impulse, ticks: number): (ShoveStep | null)[] {
  const steps: (ShoveStep | null)[] = [];
  for (let tick = 0; tick < ticks; tick++) steps.push(advanceShove(impulse));
  return steps;
}

/** How far one step carries a body. */
function lengthOf(step: ShoveStep): number {
  return Math.sqrt(step.x * step.x + step.y * step.y);
}

/** The lengths of the ticks a body actually travelled on. */
function travelLengths(steps: (ShoveStep | null)[]): number[] {
  return steps.filter((step) => step !== null).map(lengthOf);
}

describe('the push behind a shove', () => {
  it('carries the push that threw it, so the one report can name the pusher', () => {
    // A shove reports once, when the impulse is spent, ticks after the push
    // that started it has finished. Nothing at the report could name the pusher
    // unless the body carried the name, which is why it rides here (design
    // record R9). Slice J is what fills it with the belch's value.
    const impulse = blankImpulse();
    expect(impulse.source).toBe(null);

    startShove(impulse, 'bell', UP_X, UP_Y, 40, 1, 0);
    expect(impulse.source).toBe('bell');

    startShove(impulse, 'belch', UP_X, UP_Y, 40, 3, SHOVE_TICKS + 10);
    expect(impulse.source).toBe('belch');
  });

  it('leaves a body carrying no push once its travel has been taken', () => {
    // A pooled slot arrives where a shoved body may have died, so the source
    // goes back to nothing with the rest of the impulse rather than being left
    // for the next body to report under.
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 1, 0);
    takeShoveTravel(impulse);

    expect(impulse.source).toBe(null);
  });
});

describe('one shove, spent over its own ticks (R2)', () => {
  it('carries a body the whole distance it was given, and no further', () => {
    // Forty units is this file's own figure and never the bell's: the promise
    // is that a shove spends exactly what it was handed, whatever the caller's
    // row says. What the bell hands it at each rung is BELL_CONE_ROWS's push
    // column and bell.test.ts is where that is pinned.
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 1, 0);
    const travelled = travelLengths(stepsOf(impulse, SHOVE_TICKS));
    expect(travelled).toHaveLength(SHOVE_TICKS);
    expect(travelled.reduce((sum, step) => sum + step, 0)).toBeCloseTo(40, 9);
  });

  it('decays to nothing, so every tick carries a body less far than the tick before', () => {
    // A linear decay of velocity is constant deceleration, which is the
    // animation principles' slow out, and it is what Smash and Nuclear Throne
    // both ship; no source anywhere describes knockback as a single-frame
    // position set (docs/research/watched-pushback-duration.md section 4).
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 1, 0);
    const travelled = travelLengths(stepsOf(impulse, SHOVE_TICKS));
    for (let tick = 1; tick < travelled.length; tick++) {
      expect(travelled[tick]!).toBeLessThan(travelled[tick - 1]!);
    }
    expect(travelled.at(-1)!).toBeGreaterThan(0);
  });

  it('never moves a body further in one tick than its own width, so the drawn positions overlap', () => {
    // The readability criterion is arithmetic and not taste: successive drawn
    // positions have to overlap or the body reads as a blink, which is Mark's
    // ruling 4 of 2026-09-15. A shambler is the widest mow body at 22 field
    // units, and a fall over SHOVE_TICKS ticks opens on two thirty-firsts of
    // its whole distance, so a forty-unit shove starts at 2.6 and every step
    // after it is smaller.
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 1, 0);
    const widest = MOB_TYPES.shambler.halfWidth * 2;
    for (const step of travelLengths(stepsOf(impulse, SHOVE_TICKS))) {
      expect(step).toBeLessThan(widest);
    }
  });

  it('is spent on the tick after its last, so the body is free to walk again', () => {
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 1, 0);
    for (let tick = 0; tick < SHOVE_TICKS; tick++) {
      expect(shoveInFlight(impulse), `tick ${tick}`).toBe(true);
      advanceShove(impulse);
    }
    expect(shoveInFlight(impulse)).toBe(false);
    expect(impulseSpent(impulse)).toBe(true);
    expect(advanceShove(impulse)).toBeNull();
  });

  it('carries a body away along the direction it was given and along no other', () => {
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 1, 0);
    for (const step of stepsOf(impulse, SHOVE_TICKS)) {
      expect(step!.x).toBe(0);
      expect(step!.y).toBeLessThan(0);
    }
  });
});

describe('what the impulse reports when it is done', () => {
  it('reports the distance the body really covered, which the caller records tick by tick', () => {
    // The event carries what the body travelled and never the nominal push,
    // because a bound that refused part of the move has to show in the only
    // figure a repel reading can honestly sum (events.ts, MobShoved).
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 1, 0);
    for (const step of stepsOf(impulse, SHOVE_TICKS)) {
      // Half of every step refused, which is what a field edge does.
      impulse.travelled += lengthOf(step!) / 2;
    }
    expect(takeShoveTravel(impulse)).toBeCloseTo(20, 9);
  });

  it('leaves the body carrying nothing once its travel has been taken', () => {
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 1, 0);
    stepsOf(impulse, SHOVE_TICKS);
    impulse.travelled = 40;
    takeShoveTravel(impulse);
    expect(impulse).toEqual(blankImpulse());
  });
});

describe('an impulse carrying more than one shove (R3)', () => {
  /**
   * A spacing this file owns, wider than one shove so the ticks a body stands
   * still between two waves are exercised. R3 as superseded rules that each
   * wave runs a whole watched push and that the waves read apart; the figure
   * the belch really passes is its own row and slice J's.
   */
  const WAVES_APART = SHOVE_TICKS + 10;

  /** Every tick of a window the impulse actually carried the body on. */
  function travelTicksOf(steps: (ShoveStep | null)[]): number[] {
    return steps
      .map((step, tick) => (step === null ? null : tick))
      .filter((tick) => tick !== null);
  }

  it('shoves again on the tick its row names, once for every shove it was given', () => {
    // The wave structure lives on the per-body impulse rather than on a belch
    // clock, because a global clock would be a second folded field owing a
    // second WITNESS_VERSION move this round does not have (R3). Slice J is
    // the caller that passes more than one; the bell passes exactly one.
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 3, WAVES_APART);
    const travelTicks = travelTicksOf(stepsOf(impulse, WAVES_APART * 3));
    expect(travelTicks.slice(0, SHOVE_TICKS)).toEqual(
      Array.from({ length: SHOVE_TICKS }, (_, tick) => tick),
    );
    expect(travelTicks).toContain(WAVES_APART);
    expect(travelTicks).toContain(WAVES_APART * 2);
    expect(travelTicks).toHaveLength(SHOVE_TICKS * 3);
  });

  it('carries the whole of each shove, so three shoves of forty move a body a hundred and twenty', () => {
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 3, WAVES_APART);
    const travelled = travelLengths(stepsOf(impulse, WAVES_APART * 3));
    expect(travelled.reduce((sum, step) => sum + step, 0)).toBeCloseTo(120, 9);
  });

  it('is spent only once its last shove has run', () => {
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 3, WAVES_APART);
    stepsOf(impulse, WAVES_APART * 2 + SHOVE_TICKS - 1);
    expect(impulseSpent(impulse)).toBe(false);
    advanceShove(impulse);
    expect(impulseSpent(impulse)).toBe(true);
  });
});

describe('a shove landing on a body that is already flying', () => {
  it('resolves to one answer: the new shove replaces the old and the travel is still reported once', () => {
    // Nothing in the tree reaches this today, because one live toll at a time
    // is the bell's own invariant and the belch's shoves are spaced wider than
    // a shove lasts. The module answers it anyway, because a rule nobody has
    // written down is a rule two replays of one seed can disagree about.
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 1, 0);
    advanceShove(impulse);
    advanceShove(impulse);
    startShove(impulse, 'bell', 1, 0, 40, 1, 0);
    const steps = stepsOf(impulse, SHOVE_TICKS);
    expect(steps.filter((step) => step !== null)).toHaveLength(SHOVE_TICKS);
    for (const step of steps) expect(step!.y).toBe(0);
    expect(impulseSpent(impulse)).toBe(true);
  });

  it('keeps what the body has already travelled, so nothing it was shoved goes unreported', () => {
    const impulse = blankImpulse();
    startShove(impulse, 'bell', UP_X, UP_Y, 40, 1, 0);
    advanceShove(impulse);
    impulse.travelled = 10;
    startShove(impulse, 'bell', 1, 0, 40, 1, 0);
    stepsOf(impulse, SHOVE_TICKS);
    impulse.travelled += 40;
    expect(takeShoveTravel(impulse)).toBe(50);
  });
});
