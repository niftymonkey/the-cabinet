/**
 * What the floor ladder's bled-rung memory did across a run (#99, design
 * record R4, and section 7's crumb-threshold lever). The memory is set and
 * cleared by the sim's own ladder and its own growth, on a run the ladder rig
 * staged, so the edges counted here are the ones the game actually moves.
 *
 * It sits at src/dev/__tests__ rather than beside the reading, because it spans
 * src/dev/rigs.ts as well as src/dev/readings, and the span fence puts a test
 * in the test folder of the lowest folder holding everything it covers.
 */

import { describe, expect, it } from 'vitest';

import { ageGrave, growGrave, hitGrave } from '../../game/grave';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { HIT_SHRINK, INVULNERABLE_TICKS } from '../../game/tuning';
import {
  bledRungMemoryOf,
  createBledRungMemory,
  observeBledRungMemory,
} from '../readings/bledRungMemory';
import { RIGS } from '../rigs';

const SEED = 20260917;

/** Growth too small to reach the re-arm size, which is what a crumb in the mow buys. */
const A_CRUMB = 1;

/**
 * The run the ladder rig begins: at the size floor, every line at its cap, and
 * holding a score (#107). The rig is the one place a floor run's starting
 * condition is named, so nothing here builds one by hand.
 */
const ladderRun = (): RunState => createRun(SEED, RIGS.ladder.conditions);

/** The grave taking in every bit of growth it is owed, at the run's own rate (Mark's ruling of 2026-09-21). */
const takeIn = (run: RunState): void => {
  while (run.grave.owed > 0) {
    ageGrave(run.grave, run.conditions.tuning.growth.swellPerSecond);
  }
};

/** One landed hit, with the invulnerability window it opens counted back down. */
const land = (run: RunState): void => {
  hitGrave(run, 'contact');
  for (let tick = 0; tick < INVULNERABLE_TICKS; tick++)
    ageGrave(run.grave, run.conditions.tuning.growth.swellPerSecond);
};

describe('bled rung memory', () => {
  it('reports the ticks it stood set, the times it was set, the times it cleared, and the growth that fell short of clearing it', () => {
    // R4's rule end to end: any ladder run sets the memory, and only growth of
    // a full hit's worth off the floor gives the rung back. The growth that
    // arrived while it stood set and left it set is the crumb-threshold lever
    // made measurable, so the crumb counts there and the growth that cleared
    // it does not.
    const run = ladderRun();
    const accumulator = createBledRungMemory(
      RIGS.ladder.conditions.startingSize,
    );

    observeBledRungMemory(accumulator, run);
    land(run);
    observeBledRungMemory(accumulator, run);
    observeBledRungMemory(accumulator, run);
    growGrave(run.grave, A_CRUMB);
    takeIn(run);
    observeBledRungMemory(accumulator, run);
    growGrave(run.grave, HIT_SHRINK);
    takeIn(run);
    observeBledRungMemory(accumulator, run);

    expect(bledRungMemoryOf(accumulator)).toEqual({
      ticksSet: 3,
      timesSet: 1,
      timesCleared: 1,
      growthShortOfClearing: A_CRUMB,
    });
  });

  it('counts a second set after a clear, so a run that ran the ladder twice reads two', () => {
    // The reading is the edge and never the state: without the second set a
    // run that bled, grew off the floor and bled again would read the same as
    // one that bled once and never came back. The hit in between takes the
    // grave back down rather than running the ladder, because a hit above the
    // floor shrinks, which is the run the player actually plays.
    const run = ladderRun();
    const accumulator = createBledRungMemory(
      RIGS.ladder.conditions.startingSize,
    );

    land(run);
    observeBledRungMemory(accumulator, run);
    growGrave(run.grave, HIT_SHRINK);
    takeIn(run);
    observeBledRungMemory(accumulator, run);
    land(run);
    observeBledRungMemory(accumulator, run);
    land(run);
    observeBledRungMemory(accumulator, run);

    const memory = bledRungMemoryOf(accumulator);

    expect(memory.timesSet).toBe(2);
    expect(memory.timesCleared).toBe(1);
    expect(memory.growthShortOfClearing).toBe(0);
  });

  it('reports nothing set at all on a run that never ran the ladder', () => {
    // An absent measurement is not a measured zero the other way round: a run
    // that never reached the floor leaves every edge unmoved, and the ticks
    // set are what say the memory was never in play.
    const run = ladderRun();
    const accumulator = createBledRungMemory(
      RIGS.ladder.conditions.startingSize,
    );

    observeBledRungMemory(accumulator, run);
    growGrave(run.grave, HIT_SHRINK);
    takeIn(run);
    observeBledRungMemory(accumulator, run);

    expect(bledRungMemoryOf(accumulator)).toEqual({
      ticksSet: 0,
      timesSet: 0,
      timesCleared: 0,
      growthShortOfClearing: 0,
    });
  });
});
