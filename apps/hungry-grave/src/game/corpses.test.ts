/**
 * Corpses and freshness (ADR 0004). The coupling to the scroll is the invariant
 * here, and it is the reason FRESHNESS_SECONDS is derived rather than declared.
 */

import { describe, expect, it } from "vitest";

import { stepChecked } from "../dev/invariants";
import { CORPSE_CAP } from "./caps";
import { TICK_HZ } from "./clock";
import {
  advanceCorpses,
  asSwallowable,
  corpseHitbox,
  cullCorpses,
  spawnCorpse,
  spawnDrop,
  spawnFeast,
} from "./corpses";
import { DROP_HALF_EXTENT } from "./drops";
import type { SimEvent } from "./events";
import { FIELD_HEIGHT } from "./field";
import type { Mob, MobType } from "./mobs";
import { MOB_TYPES, spawnMob } from "./mobs";
import type { RunState, TickCommand } from "./run";
import { createRun } from "./run";
import { RAMP_ROWS } from "./stage/stage";
import { swallow } from "./swallow";
import {
  FRESHNESS_PAYOUT_FLOOR,
  FRESHNESS_SECONDS,
  SCROLL_SPEED,
} from "./tuning";

/** A tick that only steers, which is every tick these tests are about. */
function drift(x: number, y: number): TickCommand {
  return { move: { x, y }, belch: false };
}

const STILL: TickCommand = drift(0, 0);

function quietRun(seed = 9): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

/** A dead mob of the given type at a place the grave is nowhere near. */
function killAt(state: RunState, type: MobType, x: number, y: number): Mob {
  const mob = spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 })!;
  mob.alive = false;
  return mob;
}

function corpseOf(state: RunState) {
  const live = state.corpses.filter((corpse) => corpse.alive);
  expect(live).toHaveLength(1);
  return live[0];
}

describe("a corpse's drift (ADR 0004)", () => {
  it("has no velocity of its own, so the scroll is the only thing that moves it", () => {
    const state = quietRun();
    spawnCorpse(state, killAt(state, "shambler", 60, 200));
    const corpse = corpseOf(state);
    const from = corpse.y;
    const x = corpse.x;

    for (let tick = 0; tick < 30; tick++) stepChecked(state, STILL);
    expect(corpse.x).toBe(x);
    expect(corpse.y - from).toBeCloseTo(30 * SCROLL_SPEED, 9);
  });

  it("the coupling: a mid-field kill reaches the bottom edge as a nearly empty scrap", () => {
    // The reason FRESHNESS_SECONDS is derived from the scroll rather than
    // declared beside it. Nobody can give corpses a drift of their own without
    // this going red.
    const state = quietRun();
    spawnCorpse(state, killAt(state, "shambler", 60, FIELD_HEIGHT / 2));
    const corpse = corpseOf(state);

    const events: SimEvent[] = [];
    let atEnd = corpse.y;
    while (corpse.alive && state.tick < 2 * FRESHNESS_SECONDS * TICK_HZ) {
      atEnd = corpse.y;
      events.push(...stepChecked(state, STILL));
    }
    expect(corpse.alive).toBe(false);
    expect(
      events.filter((event) => event.type === "corpseExpired"),
    ).toHaveLength(1);
    expect(atEnd).toBeGreaterThan(FIELD_HEIGHT - 5 * SCROLL_SPEED);
  });
});

describe("freshness (ADR 0004)", () => {
  it("drains from 1 to 0 over FRESHNESS_SECONDS and never below", () => {
    const state = quietRun();
    spawnCorpse(state, killAt(state, "shambler", 60, 40));
    const corpse = corpseOf(state);
    expect(corpse.freshness).toBe(1);

    const half = Math.round((FRESHNESS_SECONDS * TICK_HZ) / 2);
    for (let tick = 0; tick < half; tick++) advanceCorpses(state);
    expect(corpse.freshness).toBeCloseTo(0.5, 6);

    for (let tick = 0; tick < half + 60; tick++) advanceCorpses(state);
    expect(corpse.freshness).toBe(0);
    expect(corpse.alive).toBe(false);
  });

  it("scales a payout down to the floor and never to zero", () => {
    const state = quietRun();
    spawnCorpse(state, killAt(state, "shambler", 60, 40));
    const corpse = corpseOf(state);
    corpse.freshness = 0;

    const events = swallow(state, asSwallowable(corpse));
    const grew = events.find((event) => event.type === "grew");
    expect(grew?.amount).toBeCloseTo(corpse.payout * FRESHNESS_PAYOUT_FLOOR, 9);
  });

  it("an empty corpse is taken under, and one leaving the bottom edge with value left is lost instead", () => {
    const empty = quietRun();
    spawnCorpse(empty, killAt(empty, "shambler", 60, 40));
    const dying = corpseOf(empty);
    dying.freshness = 0.001;
    const expiring = stepChecked(empty, STILL);
    expect(expiring.map((event) => event.type)).toContain("corpseExpired");

    const lost = quietRun();
    spawnCorpse(lost, killAt(lost, "shambler", 60, FIELD_HEIGHT - 2));
    const leaving = corpseOf(lost);
    const events: SimEvent[] = [];
    while (leaving.alive && lost.tick < 200) {
      events.push(...stepChecked(lost, STILL));
    }
    const off = events.find((event) => event.type === "corpseLost");
    expect(off).toBeDefined();
    expect(off?.type === "corpseLost" && off.freshness).toBeGreaterThan(0.9);
    expect(
      events.filter((event) => event.type === "corpseExpired"),
    ).toHaveLength(0);
  });

  it("a feast never decays", () => {
    // Nothing in this dispatch spawns one. The mechanism lands here so the boss
    // dispatch authors a shed rather than inventing a never-decaying flag.
    const state = quietRun();
    spawnFeast(state, 60, 40, 5);
    const feast = corpseOf(state);
    expect(feast.decays).toBe(false);

    for (let tick = 0; tick < 2 * FRESHNESS_SECONDS * TICK_HZ; tick++) {
      advanceCorpses(state);
    }
    expect(feast.freshness).toBe(1);
    expect(feast.alive).toBe(true);
  });
});

describe("what a corpse shows and what it hides (tracer plan section 4)", () => {
  it("holds one size across mob types while the payout does not", () => {
    const state = quietRun();
    spawnCorpse(state, killAt(state, "shambler", 60, 40));
    spawnCorpse(state, killAt(state, "revenant", 120, 40));
    spawnCorpse(state, killAt(state, "ghoul", 180, 40));
    const live = state.corpses.filter((corpse) => corpse.alive);
    expect(live).toHaveLength(3);

    const sizes = live.map((corpse) => {
      const box = corpseHitbox(corpse);
      return `${box.width}x${box.height}`;
    });
    expect(new Set(sizes).size).toBe(1);

    expect(live.map((corpse) => corpse.payout)).toEqual([
      MOB_TYPES.shambler.corpsePayout,
      MOB_TYPES.revenant.corpsePayout,
      MOB_TYPES.ghoul.corpsePayout,
    ]);
    expect(live.map((corpse) => corpse.tier)).toEqual([
      "trash",
      "rich",
      "trash",
    ]);
  });

  it("converts to the value swallow.ts takes, and never hands out the entity", () => {
    const state = quietRun();
    spawnCorpse(state, killAt(state, "revenant", 60, 40));
    const corpse = corpseOf(state);
    corpse.freshness = 0.5;
    const food = asSwallowable(corpse);
    expect(food).toEqual({
      kind: "corpse",
      freshness: 0.5,
      payout: MOB_TYPES.revenant.corpsePayout,
    });
    expect("alive" in food).toBe(false);
    expect("id" in food).toBe(false);
  });
});

describe("a drop on the food pool (plan 6.9)", () => {
  it("is fully fresh, never decays, carries its line, and uses its own extent", () => {
    const state = quietRun();
    spawnDrop(state, 200, 300, "bell");
    const drop = state.corpses.find((corpse) => corpse.alive)!;
    expect(drop.kind).toBe("drop");
    expect(drop.freshness).toBe(1);
    expect(drop.decays).toBe(false);
    expect(drop.line).toBe("bell");
    expect(drop.halfExtent).toBe(DROP_HALF_EXTENT);
  });

  it("never decays, and the bottom edge measures it by its own extent rather than a corpse's", () => {
    const state = quietRun();
    spawnDrop(state, 200, 300, "wisps");
    const drop = state.corpses.find((corpse) => corpse.alive)!;

    for (let tick = 0; tick < 2 * FRESHNESS_SECONDS * TICK_HZ; tick++) {
      advanceCorpses(state);
    }
    expect(drop.freshness).toBe(1);
    expect(drop.alive).toBe(true);

    // A drop is one unit larger than a corpse, so at the depth a corpse has
    // already gone the drop's own top edge is still on the field. The two
    // standing at the same y is the whole test: no single extent can send them
    // different ways, so the cull is reading each record's own.
    spawnCorpse(state, killAt(state, "shambler", 240, 300));
    const corpse = state.corpses.find((each) => each.kind === "corpse")!;
    drop.y = FIELD_HEIGHT + DROP_HALF_EXTENT;
    corpse.y = FIELD_HEIGHT + DROP_HALF_EXTENT;

    const first = cullCorpses(state);
    expect(drop.alive).toBe(true);
    expect(corpse.alive).toBe(false);
    expect(first).toHaveLength(1);
    expect(first[0]).toEqual({
      type: "corpseLost",
      kind: "corpse",
      x: 240,
      y: FIELD_HEIGHT + DROP_HALF_EXTENT,
      freshness: 1,
    });

    drop.y = FIELD_HEIGHT + DROP_HALF_EXTENT + 0.5;
    const second = cullCorpses(state);
    expect(drop.alive).toBe(false);
    expect(second).toEqual([
      {
        type: "corpseLost",
        kind: "drop",
        x: 200,
        y: FIELD_HEIGHT + DROP_HALF_EXTENT + 0.5,
        freshness: 1,
      },
    ]);
  });

  it("emits dropSpawned with the line and the place, which is the drops instrument's denominator", () => {
    const state = quietRun();
    const events = spawnDrop(state, 210, 320, "soulStream");
    expect(events).toContainEqual({
      type: "dropSpawned",
      line: "soulStream",
      x: 210,
      y: 320,
    });
  });
});

describe("the eviction policy never takes treasure (plan 6.9)", () => {
  it("evicts a corpse rather than a drop when the pool is full", () => {
    const state = quietRun();
    // The drop goes in first, so it is the oldest thing in the pool and the
    // policy's own by-id ordering would otherwise take it.
    spawnDrop(state, 100, 100, "bell");
    const drop = state.corpses.find((corpse) => corpse.kind === "drop")!;
    const victim = killAt(state, "shambler", 50, 50);
    while (state.corpses.filter((corpse) => corpse.alive).length < CORPSE_CAP) {
      spawnCorpse(state, victim);
    }

    spawnCorpse(state, victim);
    expect(drop.alive).toBe(true);
    expect(drop.kind).toBe("drop");
  });

  it("refuses the spawn outright when every slot holds treasure", () => {
    const state = quietRun();
    while (state.corpses.filter((corpse) => corpse.alive).length < CORPSE_CAP) {
      spawnDrop(state, 100, 100, "bell");
    }
    const victim = killAt(state, "shambler", 50, 50);
    spawnCorpse(state, victim);
    expect(
      state.corpses.filter((corpse) => corpse.kind === "drop"),
    ).toHaveLength(CORPSE_CAP);
  });
});

describe("what a lost corpse reports (plan 6.9)", () => {
  it("carries the food's kind, so a scrolled-away drop is not counted as a missed corpse", () => {
    const state = quietRun();
    spawnDrop(state, 200, FIELD_HEIGHT - 2, "wisps");
    const events: SimEvent[] = [];
    const drop = state.corpses.find((corpse) => corpse.alive)!;
    while (drop.alive && state.tick < 200) {
      events.push(...stepChecked(state, STILL));
    }
    const lost = events.find((event) => event.type === "corpseLost");
    expect(lost).toBeDefined();
    expect(lost?.type === "corpseLost" && lost.kind).toBe("drop");
  });
});
