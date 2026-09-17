/**
 * Staging a run into a state a played run would take minutes to reach.
 *
 * The technique has one home and one test: it used to live inside one app test
 * where nothing else could reach it, and a hit made to land on demand is what
 * the floor ladder's own scenario is built on (#99).
 */

import { describe, expect, it } from 'vitest';

import { createExecution, executeTick } from '../../game/execution';
import { createRun } from '../../game/run';
import { SIZE_FLOOR } from '../../game/tuning';
import { standMobOnGrave } from '../staging';

const STILL = { move: { x: 0, y: 0 }, belch: false };

describe('standing a mob on the grave', () => {
  it('puts a hit on the grave on the very next tick', () => {
    // Waiting for the storm to land one is what made "go to the lowest level,
    // then the level below" unplayable through the harness: contact is the one
    // damage a scenario can make land where it wants it.
    const run = createRun(1, { startingSize: SIZE_FLOOR });
    const execution = createExecution(run);

    standMobOnGrave(run);
    const events = executeTick(execution, STILL);

    expect(events.map((event) => event.type)).toContain('graveHit');
  });

  it('leaves the mob alive through a tick of the storm, so the hit is repeatable', () => {
    // The mob carries a hundred times its own health because the storm is
    // firing: a staged mob the weapons kill takes itself off the grave and the
    // next forced hit never lands.
    const run = createRun(1, { startingSize: SIZE_FLOOR });
    const execution = createExecution(run);

    standMobOnGrave(run);
    executeTick(execution, STILL);

    expect(run.mobs[0]?.alive).toBe(true);
  });
});
