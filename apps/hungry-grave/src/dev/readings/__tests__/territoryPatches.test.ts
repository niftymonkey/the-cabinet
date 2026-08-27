/**
 * Whether Territory's prediction paid: how every patch ended.
 *
 * The events are the source of truth, so the reading is fed the sim's own
 * closings rather than a hand-built list wherever a real run can produce them.
 */

import { describe, expect, it } from 'vitest';

import { TERRITORY_CAP } from '../../../game/caps';
import type { SimEvent } from '../../../game/events';
import type { Mob } from '../../../game/mobs';
import { spawnMob } from '../../../game/mobs';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import { RAMP_ROWS } from '../../../game/stage/stage';
import { swallow } from '../../../game/swallow';
import {
  advanceTerritory,
  patchAt,
  resolveTerritory,
  TERRITORY_OFFSET,
} from '../../../game/lines/territory';
import {
  createTerritoryPatches,
  observeTerritoryPatches,
  territoryPatchesOf,
} from '../territoryPatches';

const SEED = 20260827;

/** A run with Territory owned and nothing else able to touch a mob. */
function armedRun(): RunState {
  const run = createRun(SEED);
  run.stage.firedRows = RAMP_ROWS.length;
  run.lines.streamIn = Number.MAX_SAFE_INTEGER;
  run.levels.territory = 1;
  return run;
}

/** A swallow laid at a chosen place, with its own events handed back. */
function claimAt(state: RunState, x: number, y: number): SimEvent[] {
  state.grave.x = x;
  state.grave.y = y + TERRITORY_OFFSET;
  return swallow(state, { kind: 'corpse', freshness: 1, payout: 0.1 });
}

function putMob(state: RunState, x: number, y: number): Mob {
  const mob = spawnMob(state, 'shambler', { x, y, vx: 0, vy: 0, index: 0 })!;
  mob.beat = 0;
  return mob;
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

describe('territoryPatches', () => {
  it('counts a run’s patches by how they ended: spent, scrolled off, evicted', () => {
    // The three ends stay apart. Spending a budget on real traffic is the line
    // working; scrolling off with bites left and being taken by the cap are
    // two different kinds of not working, and folding any two of them would
    // make the reading unable to answer why.
    const run = armedRun();
    const events: SimEvent[] = [];

    // One that spends: enough mobs standing in it to use the whole budget.
    claimAt(run, 270, 300);
    const spending = patchAt(run, 0)!;
    for (let made = 0; made < spending.bites; made++) {
      putMob(run, spending.x + made * 4, spending.y);
    }
    openTheHands(run);
    events.push(...resolveTerritory(run));

    // Enough more to fill the cap, then one over it, which evicts the oldest.
    for (let claim = 0; claim <= TERRITORY_CAP; claim++) {
      events.push(...claimAt(run, 270, -120 + claim * 100));
    }
    // The rest scroll away with their budgets untouched.
    scrollEverythingOff(run, events);

    const acc = createTerritoryPatches();
    observeTerritoryPatches(acc, events);
    const reading = territoryPatchesOf(acc);

    expect(reading.spent).toBe(1);
    expect(reading.evicted).toBe(1);
    expect(reading.scrolled).toBe(TERRITORY_CAP);
    expect(reading.bitten).toBe(spending.bites);
    // Only the spending patch grabbed anything, so every other end is empty
    // ground however it ended.
    expect(reading.emptied).toBe(TERRITORY_CAP + 1);
    // Every patch the run laid reached exactly one end, which is the reading's
    // own check on itself.
    expect(reading.spent + reading.evicted + reading.scrolled).toBe(
      TERRITORY_CAP + 2,
    );
  });

  it('separates patches that closed having bitten nothing from those that bit some', () => {
    // The direct answer to #65's charge: ground that punished traffic and then
    // drifted on is not the same finding as ground that was never crossed at
    // all, and a reading that could not tell them apart would say nothing about
    // whether the prediction paid.
    const run = armedRun();
    const events: SimEvent[] = [];

    claimAt(run, 270, 300);
    const used = patchAt(run, 0)!;
    putMob(run, used.x, used.y);
    openTheHands(run);
    events.push(...resolveTerritory(run));
    expect(used.bites).toBeGreaterThan(0);

    claimAt(run, 120, 300);
    scrollEverythingOff(run, events);

    const acc = createTerritoryPatches();
    observeTerritoryPatches(acc, events);
    const reading = territoryPatchesOf(acc);

    expect(reading.scrolled).toBe(2);
    expect(reading.emptied).toBe(1);
    expect(reading.bitten).toBe(1);
  });

  it('counts ground the cap took having bitten nothing as empty too', () => {
    // Eviction is the dominant end, not a rare one: the cap is small against
    // the swallow rate, so a patch is usually taken well before its natural
    // scroll life runs out. A reading that called only the scrolled ones empty
    // would report near zero while most ground that grabbed nothing went
    // uncounted, which is the instrument blindness #65 is about.
    const run = armedRun();
    const events: SimEvent[] = [];

    for (let claim = 0; claim <= TERRITORY_CAP; claim++) {
      events.push(...claimAt(run, 270, -120 + claim * 100));
    }

    const acc = createTerritoryPatches();
    observeTerritoryPatches(acc, events);
    const reading = territoryPatchesOf(acc);

    expect(reading.evicted).toBe(1);
    expect(reading.scrolled).toBe(0);
    expect(reading.bitten).toBe(0);
    expect(reading.emptied).toBe(1);
  });

  it('a run that lays no ground reports zeroes rather than absences', () => {
    // Zero is the honest answer here and absence would not be: the reading is
    // built from closings, and a run that closed nothing closed nothing.
    const acc = createTerritoryPatches();
    observeTerritoryPatches(acc, []);

    expect(territoryPatchesOf(acc)).toEqual({
      spent: 0,
      scrolled: 0,
      evicted: 0,
      emptied: 0,
      bitten: 0,
    });
  });
});
