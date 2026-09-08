/**
 * The entity cap policy. At the cap the spawn is refused and nothing already on
 * the field is removed, which is one rule across all three pools (ADR 0056).
 * The corpse pool used to be the exception, taking the oldest corpse under; the
 * cap is sized from the stage now, so binding at all is a fault rather than a
 * policy.
 */

import { describe, expect, it } from 'vitest';

import { CORPSE_CAP, MOB_CAP, MOB_FIRE_CAP, TREASURE_ALLOWANCE } from '../caps';
import { spawnCorpse, spawnDrop, spawnFeast } from '../corpses';
import type { SimEvent } from '../events';
import { createStageWatch, checkInvariants } from '../invariants';
import type { Mob, MobType } from '../mobs';
import { advanceMobs, ARRIVE_TICKS, MOB_TYPES, spawnMob } from '../mobs';
import type { RunState } from '../run';
import { createRun } from '../run';
import { peakArrivals, PROCESSION_ROWS } from '../stage/rows';
import { FRESHNESS_SECONDS } from '../tuning';

function quietRun(seed = 12): RunState {
  const run = createRun(seed);
  run.stage.firedRows = PROCESSION_ROWS.length;
  return run;
}

function at(x: number, y: number) {
  return { x, y, vx: 0, vy: 1, index: 0 };
}

function deadMob(state: RunState, type: MobType, x: number, y: number): Mob {
  const mob = spawnMob(state, type, at(x, y), false)!;
  mob.alive = false;
  return mob;
}

/** Fills the mob pool to the cap, so the next spawn has nowhere to go. */
function fillMobs(state: RunState): void {
  while (spawnMob(state, 'shambler', at(60, 40), false) !== null) {
    // The loop condition is the fill.
  }
}

/**
 * The corpse a dead mob leaves, spawned the way mobs.ts spawns it: the mob
 * table is mobs.ts's, so a kill's payout and tier reach corpses.ts as values
 * read off the dead mob's own row.
 */
function leaveCorpse(state: RunState, mob: Mob) {
  const row = MOB_TYPES[mob.type];
  return spawnCorpse(state, mob, row.corpsePayout, row.corpseTier);
}

describe('the mob cap', () => {
  it('refuses a further spawn and removes nothing already live', () => {
    const state = quietRun();
    fillMobs(state);
    const live = state.mobs.filter((mob) => mob.alive);
    expect(live).toHaveLength(MOB_CAP);
    const ids = live.map((mob) => mob.id);

    expect(spawnMob(state, 'revenant', at(120, 40), false)).toBeNull();
    expect(state.mobs.filter((mob) => mob.alive)).toHaveLength(MOB_CAP);
    expect(state.mobs.filter((mob) => mob.alive).map((mob) => mob.id)).toEqual(
      ids,
    );
  });
});

describe('the mob fire cap', () => {
  it('refuses a further shot, so nothing the player has read and started dodging ever vanishes', () => {
    const state = quietRun();
    // Every slot claimed by hand, because reaching four hundred shots through
    // firing mobs would take a whole phase.
    for (const shot of state.mobFire) {
      shot.alive = true;
      shot.id = state.nextEntityId;
      state.nextEntityId += 1;
      shot.x = 10;
      shot.y = 10;
      shot.halfExtent = 5;
    }
    const ids = state.mobFire.map((shot) => shot.id);

    spawnMob(state, 'revenant', at(200, MOB_TYPES.revenant.halfHeight), false);
    const events: SimEvent[] = [];
    for (let tick = 0; tick < ARRIVE_TICKS + 1; tick++) {
      events.push(...advanceMobs(state));
    }
    expect(events.filter((event) => event.type === 'mobFired')).toHaveLength(0);
    expect(state.mobFire).toHaveLength(MOB_FIRE_CAP);
    expect(state.mobFire.map((shot) => shot.id)).toEqual(ids);
  });
});

/** The whole pool full of corpses a kill left, which is the cap binding. */
function fillCorpses(state: RunState): void {
  while (state.corpses.some((corpse) => !corpse.alive)) {
    leaveCorpse(state, deadMob(state, 'shambler', 60, 40));
  }
}

/** What a corpse is, as values, so a slot taken under is visible as a change. */
function foodOn(state: RunState) {
  return state.corpses
    .filter((corpse) => corpse.alive)
    .map((corpse) => ({
      id: corpse.id,
      kind: corpse.kind,
      x: corpse.x,
      y: corpse.y,
      freshness: corpse.freshness,
    }));
}

describe('the corpse cap (ADR 0056)', () => {
  it('never evicts food: at the cap the spawn is refused and every body already down stays', () => {
    // ADR 0056: the cap is sized from scroll physics so that it cannot bind in
    // normal play, never evicts food, and raises a fault if it ever binds. The
    // eviction it replaces took the oldest corpse under to make room, which is
    // food removed from the field by housekeeping.
    const state = quietRun();
    fillCorpses(state);
    const before = foodOn(state);
    expect(before).toHaveLength(CORPSE_CAP);

    const events = leaveCorpse(state, deadMob(state, 'revenant', 300, 500));
    expect(events).toEqual([]);
    expect(foodOn(state)).toEqual(before);
  });

  it('raises a recoverable fault when it binds, because a cap that binds is a bug rather than a policy', () => {
    const state = quietRun();
    fillCorpses(state);
    expect(checkInvariants(state, createStageWatch())).toEqual([]);

    leaveCorpse(state, deadMob(state, 'revenant', 300, 500));
    const faults = checkInvariants(state, createStageWatch());
    expect(faults.map((fault) => fault.identity)).toEqual([
      'corpse cap never binds',
    ]);
    expect(faults[0].severity).toBe('recoverable');
  });

  it("is the mob cap plus the stage's peak arrivals in a freshness window plus the treasure allowance", () => {
    // A proof rather than an estimate: every decaying corpse alive came from a
    // body alive when the freshness window opened or from one that arrived
    // inside it, and treasure never decays and is bounded by design. The
    // arrivals term counts four things, the section tables, the pour, a boss's
    // own adds and the rungs a hit can strip, so the window it maximises over
    // includes the inside of a boss fight.
    expect(CORPSE_CAP).toBe(
      MOB_CAP + peakArrivals(FRESHNESS_SECONDS) + TREASURE_ALLOWANCE,
    );
    // Computed rather than written down, which is what makes it move with the
    // rows: the query is a real query and not a constant wearing one.
    expect(peakArrivals(FRESHNESS_SECONDS)).toBeGreaterThan(0);
  });

  it('stands above the mob cap plus the arrivals plus the allowance, so a later term can only raise it', () => {
    // The director's budget is the addend this derivation is missing, and it is
    // missing on purpose: it does not exist until step 4 (#85). A cap held at
    // least this high cannot bind for a reason the derivation already priced.
    expect(CORPSE_CAP).toBeGreaterThanOrEqual(
      MOB_CAP + peakArrivals(FRESHNESS_SECONDS) + TREASURE_ALLOWANCE,
    );
    expect(TREASURE_ALLOWANCE).toBeGreaterThan(0);
  });

  it('returns no corpse and leaves the pool exactly as it was', () => {
    const state = quietRun();
    fillCorpses(state);
    const before = foodOn(state);
    const mob = deadMob(state, 'shambler', 10, 10);
    const nextId = state.nextEntityId;

    expect(leaveCorpse(state, mob)).toEqual([]);
    expect(foodOn(state)).toEqual(before);
    // The refused spawn stamps no id, so the run's own id counter does not
    // move for a body that never reached the field.
    expect(state.nextEntityId).toBe(nextId);
  });

  it('removes nothing already on the field whichever kind of food asks for the slot', () => {
    // caps.ts's own rule, guarded through the change: a shot the player has
    // read and started dodging cannot vanish, and neither can a body they have
    // started diving for. Treasure asking a pool full of corpses is the case
    // the eviction policy used to answer by taking a corpse under, and a corpse
    // asking a pool full of treasure is the case it already refused.
    const state = quietRun();
    fillCorpses(state);
    const corpses = foodOn(state);
    expect(spawnDrop(state, 100, 100, 'bell')).toEqual([]);
    expect(spawnFeast(state, 100, 100, 4)).toEqual([]);
    expect(foodOn(state)).toEqual(corpses);

    const treasureRun = quietRun(13);
    while (treasureRun.corpses.some((corpse) => !corpse.alive)) {
      spawnDrop(treasureRun, 100, 100, 'bell');
    }
    const treasure = foodOn(treasureRun);
    expect(treasure).toHaveLength(CORPSE_CAP);
    expect(
      leaveCorpse(treasureRun, deadMob(treasureRun, 'shambler', 50, 50)),
    ).toEqual([]);
    expect(foodOn(treasureRun)).toEqual(treasure);
  });
});
