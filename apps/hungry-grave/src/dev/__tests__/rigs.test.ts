/**
 * The rigs: the starting conditions a harness run is played from, named so a
 * figure always says which one produced it (#107, CONTEXT.md Rig).
 *
 * The seam is the table and the naming, because both directions matter: a
 * batch is played from a row here, and a tape measured later is named by
 * matching what its header resolved to against the same row.
 */

import { describe, expect, it } from 'vitest';

import {
  BIRTHRIGHT,
  BIRTHRIGHT_LEVEL,
  MAX_LEVEL,
  WEAPON_LINES,
} from '../../game/lines/roster';
import { createRun } from '../../game/run';
import { SIZE_CEILING, SIZE_FLOOR, SIZE_START } from '../../game/tuning';
import { DEFAULT_TUNING } from '../../game/tuningRecord';

/** What one floor hit bleeds under the record the build compiles, in points (ADR 0064). */
const BLEED_CAP =
  DEFAULT_TUNING.score.bleedCapInKills * DEFAULT_TUNING.score.trashKillScore;

import { isRigName, rigOf, RIGS, RIG_NAMES } from '../rigs';

describe('the rigs a harness run is played out of', () => {
  it('names one starting build per rig and never two rigs alike', () => {
    // #107: no two rigs with different starting conditions share one label,
    // and no two labels share one starting condition either, or naming a
    // figure's rig would be a coin toss.
    // The key is the rig's own three fields, which is exactly what rigOf bands
    // by: a row unique on less than the banding reads would be two rows the
    // banding cannot tell apart, and a row unique on more would be a row the
    // banding answers null for.
    const conditions = RIG_NAMES.map((name) =>
      JSON.stringify([
        RIGS[name].conditions.startingSize,
        RIGS[name].conditions.startingLevels,
        RIGS[name].conditions.startingScore,
      ]),
    );

    expect([...new Set(conditions)]).toHaveLength(RIG_NAMES.length);
    for (const name of RIG_NAMES) expect(RIGS[name].name).toBe(name);
  });

  it('starts the birthright rig where a run with nothing pinned starts', () => {
    // The harness rig is the only one that starts at the birthright, which is
    // what #98 asks the hand to play out of. Read off a run rather than
    // restated here, so a birthright retune moves the row and not the test.
    const born = createRun(1);

    expect(RIGS.birthright.conditions.startingSize).toBe(SIZE_START);
    expect(RIGS.birthright.conditions.startingLevels).toEqual(born.levels);
    expect(RIGS.birthright.conditions.startingScore).toBe(born.score);
    for (const line of WEAPON_LINES) {
      expect(RIGS.birthright.conditions.startingLevels[line]).toBe(
        BIRTHRIGHT.includes(line) ? BIRTHRIGHT_LEVEL : 0,
      );
    }
  });

  it('starts the maxed rig with every line at the level cap', () => {
    // The end the power-curve ruling is about: a run that begins where a
    // person's own runs finish, so step 4 can read the maxed end at all.
    expect(RIGS.maxed.conditions.startingSize).toBe(SIZE_START);
    expect(RIGS.maxed.conditions.startingScore).toBe(0);
    for (const line of WEAPON_LINES) {
      expect(RIGS.maxed.conditions.startingLevels[line]).toBe(MAX_LEVEL);
    }
  });

  it('starts the ladder rig at the size floor, at its levels, holding its score', () => {
    // The staged floor ladder (#99): the harness could not start a run at the
    // floor holding a score at all, so "go to the lowest level, then the level
    // below" was the one scenario it could not play. All three are read off a
    // run built the way playHarnessRun builds one, because a row nothing
    // applies is a row that says nothing.
    const run = createRun(1, RIGS.ladder.conditions);

    expect(run.grave.size).toBe(SIZE_FLOOR);
    expect(run.score).toBe(RIGS.ladder.conditions.startingScore);
    for (const line of WEAPON_LINES) expect(run.levels[line]).toBe(MAX_LEVEL);
    // At least twice the cap, so the first bleed leaves a remainder standing
    // and the walk shows the cap's own rule rather than a score that happened
    // to vanish.
    expect(run.score).toBeGreaterThanOrEqual(2 * BLEED_CAP);
  });

  it('applies every fact a row states when a row is applied, and never part of one', () => {
    // #107's own ask, now unmissable: a rig is one record (ADR 0063), so a run
    // started from a row reports that row back whole rather than a condition
    // the caller assembled out of some of its fields. The ladder row is the
    // case because it is the only one stating a non-default score.
    for (const name of RIG_NAMES) {
      const run = createRun(1, RIGS[name].conditions);

      expect(run.conditions).toEqual(RIGS[name].conditions);
    }
  });

  it('names the rig a tape started from, off the conditions alone', () => {
    expect(
      rigOf(SIZE_START, RIGS.birthright.conditions.startingLevels, 0),
    ).toBe('birthright');
    expect(rigOf(SIZE_START, RIGS.maxed.conditions.startingLevels, 0)).toBe(
      'maxed',
    );
    // The header carries the whole starting condition now
    // (FORMAT_VERSION 5), so the score is one of the three fields the banding
    // reads: the ladder row is the first whose condition has a third half, and
    // banding without it would name the row by two thirds of what it states.
    expect(
      rigOf(
        SIZE_FLOOR,
        RIGS.ladder.conditions.startingLevels,
        RIGS.ladder.conditions.startingScore,
      ),
    ).toBe('ladder');
  });

  it('names no rig for a run that starts at a row levels and size holding nothing', () => {
    // The ladder row's whole point is the score it begins with, so a run at its
    // size and levels holding zero is not that row: it is the condition #107
    // asks a figure never to be banded under, and the answer is null rather
    // than the nearest row.
    expect(
      rigOf(SIZE_FLOOR, RIGS.ladder.conditions.startingLevels, 0),
    ).toBeNull();
  });

  it('names no rig for a starting condition no row holds', () => {
    // A rig is the size and the levels together, so a maxed run begun at the
    // ceiling is not the maxed rig: banding the two is the very thing #107
    // was raised for. An unnamed condition is answered as unnamed rather than
    // as the nearest row.
    expect(
      rigOf(SIZE_CEILING, RIGS.maxed.conditions.startingLevels, 0),
    ).toBeNull();
    expect(
      rigOf(SIZE_START, { skullStream: 3, territory: 3, wisps: 3, bell: 3 }, 0),
    ).toBeNull();
  });

  it('takes a rig name off a command line or refuses it', () => {
    // Parse at the edge: a name becomes a rig here or is refused here, so
    // nothing inside the harness ever holds a rig name it has not checked.
    expect(isRigName('maxed')).toBe(true);
    expect(isRigName('birthright')).toBe(true);
    expect(isRigName('ladder')).toBe(true);
    expect(isRigName('ceiling')).toBe(false);
  });
});
