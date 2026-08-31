/**
 * The control reading: crossings over open ground, their ends, their tags, and
 * the observed pulse pace (#79).
 *
 * States and event sequences are hand-built the way the neighbouring reading
 * tests build theirs: a real run state with the fields under test set by hand,
 * observed tick by tick.
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../../game/events';
import type { Patch } from '../../../game/lines/territory';
import { RADIUS_BY_LEVEL } from '../../../game/lines/territory';
import type { Mob, MobType } from '../../../game/mobs';
import { spawnMob } from '../../../game/mobs';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import {
  createTerritoryControl,
  observeTerritoryControl,
  territoryControlOf,
} from '../territoryControl';

const SEED = 20260830;

/** Open ground of one birth rung, placed by hand in a chosen slot. */
function placePatch(
  run: RunState,
  slot: number,
  level: number,
  x: number,
  y: number,
): Patch {
  const patch = run.patches[slot];
  patch.alive = true;
  patch.id = run.nextEntityId;
  run.nextEntityId += 1;
  patch.level = level;
  patch.x = x;
  patch.y = y;
  patch.radius = RADIUS_BY_LEVEL[level];
  patch.opening = 0;
  return patch;
}

/** A live mob of a stated type standing still, past its arriving beat. */
function putMob(
  run: RunState,
  x: number,
  y: number,
  type: MobType = 'shambler',
): Mob {
  const mob = spawnMob(run, type, { x, y, vx: 0, vy: 0, index: 0 })!;
  mob.beat = 0;
  return mob;
}

function killedEvent(mob: Mob): SimEvent {
  return { type: 'mobKilled', id: mob.id, mob: mob.type, x: mob.x, y: mob.y };
}

function territoryPulse(id: number): SimEvent {
  return { type: 'mobDamaged', id, amount: 5, source: 'territory' };
}

describe('territoryControl', () => {
  it('dwell is counted only over open ground', () => {
    // The opening beat is not control: a crossing starts when the hands are
    // up, so ticks spent standing on ground still opening buy no dwell.
    const run = createRun(SEED);
    const acc = createTerritoryControl();
    const patch = placePatch(run, 0, 1, 200, 300);
    patch.opening = 10;
    const mob = putMob(run, 200, 300);

    observeTerritoryControl(acc, 1, [], run);
    observeTerritoryControl(acc, 2, [], run);
    patch.opening = 0;
    observeTerritoryControl(acc, 3, [], run);
    observeTerritoryControl(acc, 4, [], run);
    observeTerritoryControl(acc, 5, [], run);
    mob.x = 500;
    observeTerritoryControl(acc, 6, [], run);

    const reading = territoryControlOf(acc);
    expect(reading.crossings).toHaveLength(1);
    expect(reading.crossings[0]!.dwell).toBe(3);
  });

  it('a death ends its crossing and records the dwell', () => {
    // Death joins on the mobKilled id, the same join every instrument uses
    // (#48): the ground gets credit for exactly the stay it ground down.
    const run = createRun(SEED);
    const acc = createTerritoryControl();
    placePatch(run, 0, 2, 200, 300);
    const mob = putMob(run, 200, 300);

    for (let tick = 1; tick <= 4; tick++) {
      observeTerritoryControl(acc, tick, [], run);
    }
    const killed = killedEvent(mob);
    mob.alive = false;
    observeTerritoryControl(acc, 5, [killed], run);

    const reading = territoryControlOf(acc);
    expect(reading.crossings).toEqual([
      { mob: 'shambler', rung: 2, end: 'death', dwell: 4 },
    ]);
    expect(reading.dwellByEnd.death).toEqual({
      count: 1,
      dwellMean: 4,
      dwellMin: 4,
      dwellMax: 4,
    });
    expect(reading.unfinishedAtStop).toBe(0);
  });
  it('a walk-out ends as an escape while the ground stays open', () => {
    // Escape is the mob's own doing: alive, no longer held, the ground still
    // standing. It is the read the pull ladder is tuned against.
    const run = createRun(SEED);
    const acc = createTerritoryControl();
    const patch = placePatch(run, 0, 1, 200, 300);
    const mob = putMob(run, 200, 300);

    for (let tick = 1; tick <= 3; tick++) {
      observeTerritoryControl(acc, tick, [], run);
    }
    mob.x = 500;
    observeTerritoryControl(acc, 4, [], run);

    expect(patch.alive).toBe(true);
    const reading = territoryControlOf(acc);
    expect(reading.crossings).toEqual([
      { mob: 'shambler', rung: 1, end: 'escape', dwell: 3 },
    ]);
    expect(reading.dwellByEnd.escape.count).toBe(1);
    expect(reading.dwellByEnd.death.count).toBe(0);
    expect(reading.dwellByEnd.closed.count).toBe(0);
  });
  it('ground closing under a standing mob ends its crossing as closed', () => {
    // The ground going away is not the mob getting away: a closed end says
    // nothing about the pull, so the two are never averaged together.
    const run = createRun(SEED);
    const acc = createTerritoryControl();
    const patch = placePatch(run, 0, 1, 200, 300);
    putMob(run, 200, 300);

    observeTerritoryControl(acc, 1, [], run);
    observeTerritoryControl(acc, 2, [], run);
    patch.alive = false;
    observeTerritoryControl(acc, 3, [], run);

    const reading = territoryControlOf(acc);
    expect(reading.crossings).toEqual([
      { mob: 'shambler', rung: 1, end: 'closed', dwell: 2 },
    ]);
  });
  it('the tag is the birth rung, never the run level at the crossing', () => {
    // A patch can outlive its lay period by 2x, so a run-level tag would
    // pollute the per-rung restatement (#79): the crossing carries the rung
    // the ground was born with, however far the line climbs mid-stay.
    const run = createRun(SEED);
    const acc = createTerritoryControl();
    placePatch(run, 0, 2, 200, 300);
    const mob = putMob(run, 200, 300);
    run.levels.territory = 2;

    observeTerritoryControl(acc, 1, [], run);
    run.levels.territory = 5;
    observeTerritoryControl(acc, 2, [], run);
    mob.x = 500;
    observeTerritoryControl(acc, 3, [], run);

    const reading = territoryControlOf(acc);
    expect(reading.crossings).toEqual([
      { mob: 'shambler', rung: 2, end: 'escape', dwell: 2 },
    ]);
  });
  it('crossings split by mob type', () => {
    // Every band the ladder claims is per-type, so a reading that pooled the
    // types could never check one: each crossing carries its mob's own type.
    const run = createRun(SEED);
    const acc = createTerritoryControl();
    placePatch(run, 0, 3, 100, 300);
    placePatch(run, 1, 3, 400, 300);
    const shambler = putMob(run, 100, 300);
    const ghoul = putMob(run, 400, 300, 'ghoul');

    observeTerritoryControl(acc, 1, [], run);
    observeTerritoryControl(acc, 2, [], run);
    shambler.x = 250;
    ghoul.x = 250;
    observeTerritoryControl(acc, 3, [], run);

    const reading = territoryControlOf(acc);
    expect(reading.crossings).toHaveLength(2);
    const types = reading.crossings.map((crossing) => crossing.mob).sort();
    expect(types).toEqual(['ghoul', 'shambler']);
  });
  it('a crossing live at run end is counted apart and out of the dwell figures', () => {
    // The patch reading's no-closing precedent: a stay the run interrupted has
    // no end and no length, and estimating one would be the report lying.
    const run = createRun(SEED);
    const acc = createTerritoryControl();
    placePatch(run, 0, 1, 200, 300);
    putMob(run, 200, 300);

    for (let tick = 1; tick <= 3; tick++) {
      observeTerritoryControl(acc, tick, [], run);
    }

    const reading = territoryControlOf(acc);
    expect(reading.unfinishedAtStop).toBe(1);
    expect(reading.crossings).toEqual([]);
    expect(reading.dwellByEnd.death.count).toBe(0);
    expect(reading.dwellByEnd.escape.count).toBe(0);
    expect(reading.dwellByEnd.closed.count).toBe(0);
    expect(reading.dwellByEnd.escape.dwellMean).toBeUndefined();
  });
  it('a mob gone from the field with no kill event ends as an escape', () => {
    // A patch straddling the bottom edge can hold a mob the cull then takes:
    // gone, alive when it left, no kill event. The engagements reading's own
    // precedent: gone with no kill event is an escape, never a stay the run
    // interrupted.
    const run = createRun(SEED);
    const acc = createTerritoryControl();
    placePatch(run, 0, 1, 200, 300);
    const mob = putMob(run, 200, 300);

    observeTerritoryControl(acc, 1, [], run);
    observeTerritoryControl(acc, 2, [], run);
    mob.alive = false;
    observeTerritoryControl(acc, 3, [], run);

    const reading = territoryControlOf(acc);
    expect(reading.crossings).toEqual([
      { mob: 'shambler', rung: 1, end: 'escape', dwell: 2 },
    ]);
    expect(reading.unfinishedAtStop).toBe(0);
  });

  it('pulse intervals come from territory damage events on one mob', () => {
    // The observed pace of the grind: ticks between successive
    // territory-sourced hits on the same mob id. Another line's hit on the
    // same mob and another mob's pulses say nothing about this pace.
    const run = createRun(SEED);
    const acc = createTerritoryControl();

    observeTerritoryControl(acc, 10, [territoryPulse(5)], run);
    observeTerritoryControl(
      acc,
      50,
      [{ type: 'mobDamaged', id: 5, amount: 10, source: 'wisps' }],
      run,
    );
    observeTerritoryControl(acc, 70, [territoryPulse(9)], run);
    observeTerritoryControl(acc, 90, [territoryPulse(5)], run);
    observeTerritoryControl(acc, 170, [territoryPulse(5)], run);
    observeTerritoryControl(acc, 182, [territoryPulse(9)], run);

    const reading = territoryControlOf(acc);
    expect(reading.pulseIntervals.slice().sort((a, b) => a - b)).toEqual([
      80, 80, 112,
    ]);
  });
});
