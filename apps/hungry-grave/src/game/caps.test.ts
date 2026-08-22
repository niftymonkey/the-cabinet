/**
 * The entity cap policy. At the cap something must be dropped, and which one is
 * a gameplay rule: mobs and mob fire refuse the spawn, corpses take the oldest
 * under. Both orderings are by id, so both are deterministic.
 */

import { describe, expect, it } from "vitest";

import { CORPSE_CAP, MOB_CAP, MOB_FIRE_CAP, oldestLive } from "./caps";
import { spawnCorpse } from "./corpses";
import type { SimEvent } from "./events";
import type { Mob, MobType } from "./mobs";
import { advanceMobs, ARRIVE_TICKS, MOB_TYPES, spawnMob } from "./mobs";
import type { RunState } from "./run";
import { createRun } from "./run";
import { RAMP_ROWS } from "./stage/stage";

function quietRun(seed = 12): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

function at(x: number, y: number) {
  return { x, y, vx: 0, vy: 1, index: 0 };
}

function deadMob(state: RunState, type: MobType, x: number, y: number): Mob {
  const mob = spawnMob(state, type, at(x, y))!;
  mob.alive = false;
  return mob;
}

/** Fills the mob pool to the cap, so the next spawn has nowhere to go. */
function fillMobs(state: RunState): void {
  while (spawnMob(state, "shambler", at(60, 40)) !== null) {
    // The loop condition is the fill.
  }
}

describe("the mob cap", () => {
  it("refuses a further spawn and removes nothing already live", () => {
    const state = quietRun();
    fillMobs(state);
    const live = state.mobs.filter((mob) => mob.alive);
    expect(live).toHaveLength(MOB_CAP);
    const ids = live.map((mob) => mob.id);

    expect(spawnMob(state, "revenant", at(120, 40))).toBeNull();
    expect(state.mobs.filter((mob) => mob.alive)).toHaveLength(MOB_CAP);
    expect(state.mobs.filter((mob) => mob.alive).map((mob) => mob.id)).toEqual(
      ids,
    );
  });
});

describe("the mob fire cap", () => {
  it("refuses a further shot, so nothing the player has read and started dodging ever vanishes", () => {
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

    spawnMob(state, "revenant", at(200, MOB_TYPES.revenant.halfHeight));
    const events: SimEvent[] = [];
    for (let tick = 0; tick < ARRIVE_TICKS + 1; tick++) {
      events.push(...advanceMobs(state));
    }
    expect(events.filter((event) => event.type === "mobFired")).toHaveLength(0);
    expect(state.mobFire).toHaveLength(MOB_FIRE_CAP);
    expect(state.mobFire.map((shot) => shot.id)).toEqual(ids);
  });
});

describe("the corpse cap", () => {
  it("takes the oldest live corpse under, reports an eviction rather than an expiry, and gives the new corpse its slot", () => {
    const state = quietRun();
    for (let made = 0; made < CORPSE_CAP; made++) {
      spawnCorpse(state, deadMob(state, "shambler", 60, 40 + made));
    }
    expect(state.corpses.filter((corpse) => corpse.alive)).toHaveLength(
      CORPSE_CAP,
    );
    const oldest = oldestLive(state.corpses)!;
    const slot = state.corpses.indexOf(oldest);
    const evictedId = oldest.id;

    const events = spawnCorpse(state, deadMob(state, "revenant", 300, 500));
    expect(events).toEqual([
      { type: "corpseEvicted", x: 60, y: 40, freshness: 1 },
    ]);
    expect(
      events.filter((event) => event.type === "corpseExpired"),
    ).toHaveLength(0);

    const taken = state.corpses[slot];
    expect(taken.alive).toBe(true);
    expect(taken.id).toBeGreaterThan(evictedId);
    expect(taken.payout).toBe(MOB_TYPES.revenant.corpsePayout);
    expect(state.corpses.filter((corpse) => corpse.alive)).toHaveLength(
      CORPSE_CAP,
    );
  });

  it("drops by id and not by slot index, which a recycled slot is what proves", () => {
    const state = quietRun();
    for (let made = 0; made < CORPSE_CAP; made++) {
      spawnCorpse(state, deadMob(state, "shambler", 60, 40 + made));
    }
    // Free the very first slot and refill it, so the lowest slot index now
    // holds the newest corpse in the pool.
    state.corpses[0].alive = false;
    spawnCorpse(state, deadMob(state, "shambler", 90, 90));
    expect(state.corpses[0].alive).toBe(true);
    const newestId = state.corpses[0].id;

    const oldest = oldestLive(state.corpses)!;
    expect(state.corpses.indexOf(oldest)).toBe(1);

    spawnCorpse(state, deadMob(state, "shambler", 120, 120));
    expect(state.corpses[0].id).toBe(newestId);
    expect(state.corpses[0].alive).toBe(true);
  });
});
