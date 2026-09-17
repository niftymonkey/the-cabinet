/**
 * Where the player was standing when the ladder stripped, and what was on the
 * field (#99, design record R6 and section 7's bottom-clamp finding). The strip
 * comes out of the sim's own hit entry point on a run the ladder rig staged,
 * and the grave is put where it stands by the sim's own move.
 *
 * It sits at src/dev/__tests__ rather than beside the reading, because it spans
 * src/dev/rigs.ts as well as src/dev/readings, and the span fence puts a test
 * in the test folder of the lowest folder holding everything it covers.
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../game/events';
import { FIELD_HEIGHT } from '../../game/field';
import { ageGrave, hitGrave, moveGrave } from '../../game/grave';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { INVULNERABLE_TICKS, SIZE_FLOOR } from '../../game/tuning';
import {
  createStripsLanded,
  observeStripsLanded,
  stripsLandedOf,
} from '../readings/stripsLanded';
import type { StripsLandedAcc } from '../readings/stripsLanded';
import { RIGS } from '../rigs';

const SEED = 20260917;

/** Far enough down that containment is what decides where the grave ends up. */
const DIVE_TO_THE_EDGE = { x: 0, y: 1000 };

/** The grave's own starting mark, which is where a run that never moved stands. */
const START_Y = FIELD_HEIGHT * 0.8;

/** A boss on the field, and the two events that take it off again. */
const BOSS_ARRIVED: SimEvent = {
  type: 'bossArrived',
  boss: 'banshee',
  phases: 2,
};
const BOSS_KILLED: SimEvent = {
  type: 'bossKilled',
  boss: 'banshee',
  x: 0,
  y: 0,
};
const SECTION_CHANGED: SimEvent = {
  type: 'sectionChanged',
  section: 'crowd',
  music: null,
  tick: 0,
};

/**
 * The run the ladder rig begins: at the size floor, every line at its cap, and
 * holding a score (#107). The rig is the one place a floor run's starting
 * condition is named, so nothing here builds one by hand.
 */
const ladderRun = (): RunState =>
  createRun(
    SEED,
    RIGS.ladder.startingSize,
    RIGS.ladder.startingLevels,
    undefined,
    undefined,
    RIGS.ladder.startingScore,
  );

/** One landed hit, with the invulnerability window it opens counted back down. */
const land = (run: RunState): readonly SimEvent[] => {
  const events = hitGrave(run, 'contact');
  for (let tick = 0; tick < INVULNERABLE_TICKS; tick++) ageGrave(run.grave);
  return events;
};

/** The hit that spends the ladder's score rung, so the next one strips. */
const spendTheScoreRung = (accumulator: StripsLandedAcc, run: RunState): void =>
  observeStripsLanded(accumulator, land(run), run);

describe('strips landed', () => {
  it('reports the grave y a strip landed at and the field left under its rim', () => {
    // weaponStripped carries the lines and no position, so the grave is read
    // off the run's state at the end of the tick the strip fired on, which is
    // tuning.gravePath's own read point. The gap is measured under the rim and
    // never under the centre, because containment holds the centre at
    // FIELD_HEIGHT minus the size and a centre test would shrink as the grave
    // grows.
    const run = ladderRun();
    const accumulator = createStripsLanded();

    spendTheScoreRung(accumulator, run);
    observeStripsLanded(accumulator, land(run), run);

    expect(stripsLandedOf(accumulator)).toEqual({
      graveY: [START_Y],
      gapUnderGrave: [FIELD_HEIGHT - START_Y - SIZE_FLOOR],
      atClamp: 0,
      inBoss: 0,
    });
  });

  it('reports a strip taken at the bottom clamp as nothing left under the rim', () => {
    // The case section 7's bottom-clamp finding is about, and the one M5-fix
    // drops the rungs above the grave for: at the clamp there is no field left
    // below, so a downfield body would be gone on the tick it fell.
    const run = ladderRun();
    const accumulator = createStripsLanded();

    moveGrave(run.grave, DIVE_TO_THE_EDGE);
    spendTheScoreRung(accumulator, run);
    observeStripsLanded(accumulator, land(run), run);

    expect(stripsLandedOf(accumulator)).toEqual({
      graveY: [FIELD_HEIGHT - SIZE_FLOOR],
      gapUnderGrave: [0],
      atClamp: 1,
      inBoss: 0,
    });
  });

  it('tells a strip with a boss on the field apart from a strip in the mow', () => {
    // A strip inside a boss is the worst moment for one: nothing is dying, so
    // there is nothing on the field to rebuild from. A boss is live from
    // bossArrived until bossKilled or sectionChanged, both of which already
    // end a fight in the tree.
    const run = ladderRun();
    const accumulator = createStripsLanded();

    spendTheScoreRung(accumulator, run);
    observeStripsLanded(accumulator, [BOSS_ARRIVED], run);
    observeStripsLanded(accumulator, land(run), run);
    observeStripsLanded(accumulator, [BOSS_KILLED], run);
    observeStripsLanded(accumulator, land(run), run);
    observeStripsLanded(accumulator, [BOSS_ARRIVED], run);
    observeStripsLanded(accumulator, land(run), run);
    observeStripsLanded(accumulator, [SECTION_CHANGED], run);
    observeStripsLanded(accumulator, land(run), run);

    const landed = stripsLandedOf(accumulator);

    expect(landed.graveY).toHaveLength(4);
    expect(landed.inBoss).toBe(2);
  });
});
