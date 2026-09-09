/**
 * Arrivals: every body that came onto the field, counted once (#39's mow
 * ruling, the record's section 4).
 *
 * It is the reading `mobsAlivePerTick` is not. That series counts survivors at
 * a tick and has been read once as density; what a schedule authors is a rate
 * of arrival and a count per spawn, and this is the only reading that answers
 * either.
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../../game/events';
import { MOB_TYPE_NAMES, spawnMob } from '../../../game/mobs';
import type { Mob, MobType } from '../../../game/mobs';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import { PHASES } from '../../../game/stage/stage';
import { arrivalsOf, createArrivals, observeArrivals } from '../arrivals';

/** The name of PHASES' entry at this index, which is always in range here. */
function phaseNameAt(index: number): string {
  const phase = PHASES[index];
  if (phase === undefined) throw new Error(`no phase at index ${index}`);
  return phase.name;
}

const SEED = 20260826;

/** One body put on the field through the sim's own spawn, at the top edge. */
const arrive = (run: RunState, type: MobType): Mob => {
  const mob = spawnMob(
    run,
    type,
    { x: 100, y: 0, vx: 0, vy: 1, index: 0 },
    false,
  );
  if (mob === null) throw new Error(`the mob pool refused a ${type}`);
  return mob;
};

/** The death event the sim fires when a body dies, which carries its id. */
const killed = (mob: Mob): SimEvent => ({
  type: 'mobKilled',
  id: mob.id,
  mob: mob.type,
  x: mob.x,
  y: mob.y,
  carried: false,
});

describe('arrivals', () => {
  it('counts every body that came onto the field exactly once', () => {
    // A body is an arrival on the tick it appears and never again, however
    // many ticks it then stands there: a count that rose while nothing arrived
    // would be the survivor series wearing this reading's name.
    const run = createRun(SEED);
    const acc = createArrivals();

    arrive(run, 'shambler');
    observeArrivals(acc, [], run);
    observeArrivals(acc, [], run);
    arrive(run, 'ghoul');
    observeArrivals(acc, [], run);

    expect(arrivalsOf(acc).total).toBe(2);
  });

  it('counts a body that arrived and died inside one tick', () => {
    // The tick order puts the spawns before the deaths, so a body can be
    // gone from the pool by the time this reading looks. The death event
    // carries the id, which is what makes the arrival recoverable at all.
    const run = createRun(SEED);
    const acc = createArrivals();

    const doomed = arrive(run, 'shambler');
    doomed.alive = false;
    observeArrivals(acc, [killed(doomed)], run);

    expect(arrivalsOf(acc).total).toBe(1);
    // And not twice, on the tick a survivor stands beside a death.
    const standing = arrive(run, 'revenant');
    const alsoDoomed = arrive(run, 'ghoul');
    alsoDoomed.alive = false;
    observeArrivals(acc, [killed(alsoDoomed)], run);
    observeArrivals(acc, [], run);
    expect(arrivalsOf(acc).total).toBe(3);
    expect(standing.alive).toBe(true);
  });

  it('counts each arrival under its own type, and names every type at zero', () => {
    // Density bought with weak bodies is a ruling about which bodies arrive,
    // so a type the schedule never sent reads zero rather than absent: the
    // absence of a type is a fact about the schedule and not about the run.
    const run = createRun(SEED);
    const acc = createArrivals();

    arrive(run, 'shambler');
    arrive(run, 'shambler');
    arrive(run, 'ghoul');
    observeArrivals(acc, [], run);

    const arrivals = arrivalsOf(acc);
    expect(arrivals.byType.shambler).toBe(2);
    expect(arrivals.byType.ghoul).toBe(1);
    for (const type of MOB_TYPE_NAMES) {
      expect(arrivals.byType[type]).not.toBe(undefined);
    }
  });

  it('files each arrival under the phase the run was in when it came', () => {
    // The arrival rate a schedule authors is a per-phase row, so a rate read
    // over a whole run is a rate over several schedules at once. A phase the
    // run never reached carries no count rather than a zero, on the section
    // timeline's own terms: there was no phase for a body to arrive in.
    const run = createRun(SEED);
    const acc = createArrivals();

    arrive(run, 'shambler');
    observeArrivals(acc, [], run);
    run.stage.phaseIndex = 1;
    arrive(run, 'ghoul');
    arrive(run, 'revenant');
    observeArrivals(acc, [], run);

    const arrivals = arrivalsOf(acc);
    expect(arrivals.byPhase[phaseNameAt(0)]).toBe(1);
    expect(arrivals.byPhase[phaseNameAt(1)]).toBe(2);
    expect(arrivals.byPhase[phaseNameAt(2)]).toBe(undefined);
  });
});
