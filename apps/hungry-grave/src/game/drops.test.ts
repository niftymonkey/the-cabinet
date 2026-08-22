/**
 * The rising price and the dice (ADR 0002). Expected values come from the ADR
 * and from dispatch 5's plan sections 3 and 6.8, never from running the module.
 */

import { describe, expect, it } from "vitest";

import {
  creditKill,
  DROP_PRICES,
  priceOfNextDrop,
  rollDropLine,
} from "./drops";
import { advanceBell, BELL_EXPAND_TICKS, BELL_PERIOD } from "./lines/bell";
import { MAX_LEVEL, WEAPON_LINES } from "./lines/roster";
import type { WeaponLine } from "./lines/roster";
import type { Mob, MobType } from "./mobs";
import { damageMob, spawnMob } from "./mobs";
import type { RunState } from "./run";
import { createRun } from "./run";
import { RAMP_ROWS } from "./stage/stage";

function quietRun(seed = 14): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

function put(state: RunState, type: MobType, x: number, y: number): Mob {
  const mob = spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 })!;
  mob.beat = 0;
  return mob;
}

/** The authored stage's whole currency supply: every trash mob a run can meet. */
const AUTHORED_MOBS = 268;

/** How many drops a run of this many kills buys, walked off the table itself. */
function dropsFor(kills: number): number {
  let paid = 0;
  let spent = 0;
  while (spent + priceOfNextDrop(paid) <= kills) {
    spent += priceOfNextDrop(paid);
    paid += 1;
  }
  return paid;
}

describe("the price table (plan section 3)", () => {
  it("is the declared twelve, and the price rises", () => {
    expect(DROP_PRICES).toEqual([5, 6, 8, 10, 12, 15, 18, 23, 28, 35, 43, 53]);
    for (let index = 1; index < DROP_PRICES.length; index++) {
      expect(DROP_PRICES[index]).toBeGreaterThan(DROP_PRICES[index - 1]);
    }
  });

  it("costs about five kills for the first drop, which is the concept doc's founding rhythm", () => {
    expect(priceOfNextDrop(0)).toBe(5);
  });

  it("holds at the last entry past the twelfth drop rather than growing", () => {
    const last = DROP_PRICES[DROP_PRICES.length - 1];
    for (const paid of [DROP_PRICES.length, DROP_PRICES.length + 40, 1000]) {
      expect(priceOfNextDrop(paid)).toBe(last);
    }
  });

  it("is a table lookup and never a pow, which ADR 0015 keeps out of the sim", () => {
    // A pow evaluated at runtime is implementation-approximated, and a table is
    // reviewable at a glance and tunable per entry by the tuning dispatch.
    for (let index = 0; index < DROP_PRICES.length; index++) {
      expect(priceOfNextDrop(index)).toBe(DROP_PRICES[index]);
      expect(Number.isInteger(priceOfNextDrop(index))).toBe(true);
    }
  });

  it("pays ten to twelve drops across the authored stage's 268 mobs", () => {
    // Computed from the table rather than by running a stage: six kills in ten
    // pays ten drops and near-total clearance pays twelve.
    expect(dropsFor(Math.round(AUTHORED_MOBS * 0.6))).toBe(10);
    expect(dropsFor(AUTHORED_MOBS)).toBe(12);
  });
});

describe("the dice pick the line and never whether a drop appears (ADR 0002)", () => {
  it("pays a drop on exactly the price-th kill, whatever the dice say", () => {
    const state = quietRun();
    for (let kill = 1; kill < priceOfNextDrop(0); kill++) {
      expect(creditKill(state, 100, 100)).toEqual([]);
    }
    const events = creditKill(state, 100, 100);
    expect(events.map((event) => event.type)).toContain("dropSpawned");
    expect(state.dropsPaid).toBe(1);
    expect(state.killsSinceDrop).toBe(0);
  });

  it("seeds before it rolls: while any line is unowned the roll only picks among those", () => {
    // Mark's 2026-08-22 ruling. A uniform roll leaves 8.4% of eleven-drop runs
    // missing a line outright; seeding leaves none.
    for (let seed = 1; seed <= 40; seed++) {
      const state = quietRun(seed);
      expect(state.levels.wisps).toBe(0);
      expect(state.levels.bell).toBe(0);
      expect(["wisps", "bell"]).toContain(rollDropLine(state));
    }
  });

  it("rolls uniform over all four once every line is owned", () => {
    const seen = new Set<WeaponLine>();
    for (let seed = 1; seed <= 200; seed++) {
      const state = quietRun(seed);
      for (const line of WEAPON_LINES) state.levels[line] = 1;
      seen.add(rollDropLine(state));
    }
    expect([...seen].sort()).toEqual([...WEAPON_LINES].sort());
  });

  it("cannot miss a line over a run of four or more drops, which is the whole point of seeding", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const state = quietRun(seed);
      for (let drop = 0; drop < 4; drop++) {
        const line = rollDropLine(state);
        if (state.levels[line] < MAX_LEVEL) state.levels[line] += 1;
      }
      const missing = WEAPON_LINES.filter((line) => state.levels[line] === 0);
      expect(`seed ${seed}: ${missing.join(",")}`).toBe(`seed ${seed}: `);
    }
  });

  it("still reaches a maxed line, so ADR 0002's overflow path stays live", () => {
    const state = quietRun();
    for (const line of WEAPON_LINES) state.levels[line] = MAX_LEVEL;
    expect(WEAPON_LINES).toContain(rollDropLine(state));
  });
});

describe("a kill is a kill, whatever landed it (plan 6.8)", () => {
  it("credits a bell kill exactly as it credits a storm kill", () => {
    // A price that depended on which weapon landed the last point of damage
    // would move a drop boundary for a reason no player could read.
    const storm = quietRun();
    const victim = put(storm, "shambler", 100, 100);
    damageMob(storm, victim, victim.hp, "storm");
    creditKill(storm, victim.x, victim.y);

    const bell = quietRun();
    bell.levels.bell = MAX_LEVEL;
    const near = put(bell, "shambler", bell.grave.x, bell.grave.y);
    for (let tick = 0; tick < BELL_PERIOD + BELL_EXPAND_TICKS; tick++) {
      advanceBell(bell);
    }
    expect(near.alive).toBe(false);
    creditKill(bell, near.x, near.y);

    expect(bell.killsSinceDrop).toBe(storm.killsSinceDrop);
    expect(bell.dropsPaid).toBe(storm.dropsPaid);
  });
});
