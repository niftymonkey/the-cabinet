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
import { SIZE_CEILING, SIZE_START } from '../../game/tuning';
import { isRigName, rigOf, RIGS, RIG_NAMES } from '../rigs';

describe('the rigs a harness run is played out of', () => {
  it('names one starting build per rig and never two rigs alike', () => {
    // #107: no two rigs with different starting conditions share one label,
    // and no two labels share one starting condition either, or naming a
    // figure's rig would be a coin toss.
    const conditions = RIG_NAMES.map((name) =>
      JSON.stringify([RIGS[name].startingSize, RIGS[name].startingLevels]),
    );

    expect([...new Set(conditions)]).toHaveLength(RIG_NAMES.length);
    for (const name of RIG_NAMES) expect(RIGS[name].name).toBe(name);
  });

  it('starts the birthright rig where a run with nothing pinned starts', () => {
    // The harness rig is the only one that starts at the birthright, which is
    // what #98 asks the hand to play out of. Read off a run rather than
    // restated here, so a birthright retune moves the row and not the test.
    const born = createRun(1);

    expect(RIGS.birthright.startingSize).toBe(SIZE_START);
    expect(RIGS.birthright.startingLevels).toEqual(born.levels);
    for (const line of WEAPON_LINES) {
      expect(RIGS.birthright.startingLevels[line]).toBe(
        BIRTHRIGHT.includes(line) ? BIRTHRIGHT_LEVEL : 0,
      );
    }
  });

  it('starts the maxed rig with every line at the level cap', () => {
    // The end the power-curve ruling is about: a run that begins where a
    // person's own runs finish, so step 4 can read the maxed end at all.
    expect(RIGS.maxed.startingSize).toBe(SIZE_START);
    for (const line of WEAPON_LINES) {
      expect(RIGS.maxed.startingLevels[line]).toBe(MAX_LEVEL);
    }
  });

  it('names the rig a tape started from, off the conditions alone', () => {
    expect(rigOf(SIZE_START, RIGS.birthright.startingLevels)).toBe(
      'birthright',
    );
    expect(rigOf(SIZE_START, RIGS.maxed.startingLevels)).toBe('maxed');
  });

  it('names no rig for a starting condition no row holds', () => {
    // A rig is the size and the levels together, so a maxed run begun at the
    // ceiling is not the maxed rig: banding the two is the very thing #107
    // was raised for. An unnamed condition is answered as unnamed rather than
    // as the nearest row.
    expect(rigOf(SIZE_CEILING, RIGS.maxed.startingLevels)).toBeNull();
    expect(
      rigOf(SIZE_START, { skullStream: 3, territory: 3, wisps: 3, bell: 3 }),
    ).toBeNull();
  });

  it('takes a rig name off a command line or refuses it', () => {
    // Parse at the edge: a name becomes a rig here or is refused here, so
    // nothing inside the harness ever holds a rig name it has not checked.
    expect(isRigName('maxed')).toBe(true);
    expect(isRigName('birthright')).toBe(true);
    expect(isRigName('ceiling')).toBe(false);
  });
});
