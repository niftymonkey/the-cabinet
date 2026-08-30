/**
 * Whether the targeting paid: every lay, how every patch ended, and how much
 * the ground actually ground.
 *
 * The events are the source of truth, so the reading is fed the sim's own
 * events rather than a hand-built list wherever a real run can produce them.
 */

import { describe, expect, it } from 'vitest';

import { TERRITORY_CAP } from '../../../game/caps';
import type { SimEvent } from '../../../game/events';
import type { Mob } from '../../../game/mobs';
import { spawnMob } from '../../../game/mobs';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import {
  advanceTerritory,
  resolveTerritory,
} from '../../../game/lines/territory';
import {
  createTerritoryPatches,
  observeTerritoryPatches,
  territoryPatchesOf,
} from '../territoryPatches';

const SEED = 20260827;

/** A live mob standing still where the scan can see it. */
function putMob(state: RunState, x: number, y: number): Mob {
  const mob = spawnMob(state, 'shambler', { x, y, vx: 0, vy: 0, index: 0 })!;
  mob.beat = 0;
  return mob;
}

/** One lay through the line's own clock, with the events it reported. */
function layOnce(state: RunState, into: SimEvent[]): void {
  state.lines.layIn = 1;
  into.push(...advanceTerritory(state));
}

function openTheHands(state: RunState): void {
  for (const patch of state.patches) if (patch.alive) patch.opening = 0;
}

/** Scrolls the field until nothing is left standing on it. */
function scrollEverythingOff(state: RunState, into: SimEvent[]): void {
  for (let tick = 0; tick < 4000; tick++) {
    if (!state.patches.some((patch) => patch.alive)) return;
    into.push(...advanceTerritory(state));
  }
}

function readingOf(events: readonly SimEvent[]) {
  const acc = createTerritoryPatches();
  observeTerritoryPatches(acc, events);
  return territoryPatchesOf(acc);
}

describe('territoryPatches', () => {
  it('counts every lay and both ends: scrolled off, and taken by the cap', () => {
    // The two ends stay apart: drifting off the bottom and being taken by the
    // cap are two different kinds of done, and folding them would make the
    // reading unable to answer why ground left the field.
    const run = createRun(SEED);
    const events: SimEvent[] = [];
    const target = putMob(run, run.grave.x, 300);

    // One patch that grinds: a single pulse before the target dies.
    layOnce(run, events);
    openTheHands(run);
    events.push(...resolveTerritory(run));
    target.alive = false;
    scrollEverythingOff(run, events);

    // A full cap of empty ground, then one lay over it, which evicts the oldest.
    const bystander = putMob(run, run.grave.x, 300);
    for (let lay = 0; lay <= TERRITORY_CAP; lay++) {
      layOnce(run, events);
    }
    bystander.alive = false;
    scrollEverythingOff(run, events);

    const reading = readingOf(events);
    expect(reading.laid).toBe(TERRITORY_CAP + 2);
    expect(reading.scrolled).toBe(TERRITORY_CAP + 1);
    expect(reading.evicted).toBe(1);
    expect(reading.pulses).toBe(1);
    // Every close is empty ground except the one patch that pulsed.
    expect(reading.emptied).toBe(TERRITORY_CAP + 1);
    // Every patch the run laid reached exactly one end, which is the reading's
    // own check on itself.
    expect(reading.scrolled + reading.evicted).toBe(reading.laid);
  });

  it('separates ground that closed having pulsed nothing from ground that ground first', () => {
    // The direct answer to #65's charge: ground that punished traffic and then
    // drifted on is not the same finding as ground that was never crossed at
    // all, and `emptied` is the read that judges the targeting.
    const run = createRun(SEED);
    const events: SimEvent[] = [];

    const target = putMob(run, run.grave.x, 300);
    layOnce(run, events);
    openTheHands(run);
    events.push(...resolveTerritory(run));
    target.alive = false;

    const decoy = putMob(run, run.grave.x, 300);
    layOnce(run, events);
    decoy.alive = false;
    scrollEverythingOff(run, events);

    const reading = readingOf(events);
    expect(reading.laid).toBe(2);
    expect(reading.scrolled).toBe(2);
    expect(reading.emptied).toBe(1);
    expect(reading.pulses).toBe(1);
  });

  it('counts ground the cap took having pulsed nothing as empty too', () => {
    // Eviction is a real end, not bookkeeping: a patch the cap took before it
    // could touch anything is exactly the empty ground the reading exists to
    // surface, and counting only the scrolled ones would under-report it.
    const run = createRun(SEED);
    const events: SimEvent[] = [];

    putMob(run, run.grave.x, 300);
    for (let lay = 0; lay <= TERRITORY_CAP; lay++) {
      layOnce(run, events);
    }

    const reading = readingOf(events);
    expect(reading.evicted).toBe(1);
    expect(reading.scrolled).toBe(0);
    expect(reading.pulses).toBe(0);
    expect(reading.emptied).toBe(1);
  });

  it('counts a lay while the ground is still live, so laid never waits for a close', () => {
    // `laid` reads the lay event and never the closings: cadence is a fact the
    // moment the ground opens, and a reading that waited for the close would
    // undercount every run that stopped with ground still standing.
    const run = createRun(SEED);
    const events: SimEvent[] = [];

    putMob(run, run.grave.x, 300);
    layOnce(run, events);

    const reading = readingOf(events);
    expect(reading.laid).toBe(1);
    expect(reading.scrolled).toBe(0);
    expect(reading.evicted).toBe(0);
  });

  it('a run that lays no ground reports zeroes rather than absences', () => {
    // Zero is the honest answer here and absence would not be: the reading is
    // built from events, and a run that laid nothing laid nothing.
    const reading = readingOf([]);

    expect(reading).toEqual({
      laid: 0,
      scrolled: 0,
      evicted: 0,
      emptied: 0,
      pulses: 0,
    });
  });
});
