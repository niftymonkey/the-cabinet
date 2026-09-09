import { describe, expect, it } from 'vitest';

import { liveCount } from '../../game/caps';
import { checkInvariants, createStageWatch } from '../../game/invariants';
import { createRun } from '../../game/run';
import { standSyntheticField } from '../syntheticField';

describe('a synthetic field', () => {
  it('stands exactly the bodies and the food the size names', () => {
    const run = createRun(4242);

    standSyntheticField(run, { mobs: 37, corpses: 91 });

    expect(liveCount(run.mobs)).toBe(37);
    expect(liveCount(run.corpses)).toBe(91);
  });

  it('stands a field the run can be stepped from, breaking no invariant', () => {
    // The whole instrument rests on this: a field nobody played still has to be
    // a field the rules recognise, or every figure taken off it describes a
    // state the game cannot reach.
    const run = createRun(4242);

    standSyntheticField(run, { mobs: 37, corpses: 91 });

    expect(checkInvariants(run, createStageWatch())).toEqual([]);
  });

  it('puts the field back to its size after the run has taken some away', () => {
    // A field decays: the scroll carries bodies off the bottom edge and
    // freshness empties a corpse. A measurement driven for a few seconds off a
    // field stood once reads the emptying and not the field.
    const run = createRun(4242);
    standSyntheticField(run, { mobs: 37, corpses: 91 });
    const firstMob = run.mobs.find((mob) => mob.alive);
    const firstCorpse = run.corpses.find((corpse) => corpse.alive);
    if (firstMob === undefined || firstCorpse === undefined) {
      throw new Error('the field stood nothing to take away');
    }
    firstMob.alive = false;
    firstCorpse.alive = false;

    standSyntheticField(run, { mobs: 37, corpses: 91 });

    expect(liveCount(run.mobs)).toBe(37);
    expect(liveCount(run.corpses)).toBe(91);
  });

  it('takes the field back down to its size after the run has stood more', () => {
    // A field grows as well as decays: the stage spawns bodies of its own and a
    // kill drops food, so a build whose pools are larger than the field being
    // measured drifts upward the moment it is driven.
    const run = createRun(4242);
    standSyntheticField(run, { mobs: 37, corpses: 91 });

    standSyntheticField(run, { mobs: 12, corpses: 20 });

    expect(liveCount(run.mobs)).toBe(12);
    expect(liveCount(run.corpses)).toBe(20);
  });

  it('refuses out loud when the pools are smaller than the field asked for', () => {
    // A field one body short would be a measurement of the wrong field reported
    // as the right one, so the pool's size is a bug in the caller's caps rather
    // than something to quietly clip.
    const run = createRun(4242);

    expect(() =>
      standSyntheticField(run, { mobs: 5, corpses: 100000 }),
    ).toThrow(/corpse pool/);
  });
});
