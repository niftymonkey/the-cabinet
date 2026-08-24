/**
 * The three mob types, their fire and their deaths (ADR 0016). Every sim test
 * here steps through the one execution authority (ADR 0017), and stepping()
 * fails the test on any fault the run records.
 *
 * Magnitudes are the tuning dispatch's, so what is pinned here is the
 * derivations: a descent stated as a multiple of the scroll, a beat counted in
 * ARRIVE_TICKS, an arming rule stated as an index, and the ghoul's threat
 * stated as a pair of relations rather than as a speed.
 */

import { describe, expect, it } from "vitest";

// The module's own text, as a Vite raw import rather than through node:fs, so
// the source scan below stays inside the boundary src/boundary.test.ts holds.
import mobsSource from "./mobs.ts?raw";

import type { Stepper } from "../dev/stepping";
import { stepping } from "../dev/stepping";
import { SCROLL_SPEED, TRASH_CORPSE_PAYOUT } from "./tuning";
import { TICK_HZ } from "./clock";
import type { SimEvent } from "./events";
import { FIELD_HEIGHT } from "./field";
import { graveHitbox } from "./grave";
import type { Mob } from "./mobs";
import {
  advanceMobs,
  ARRIVE_TICKS,
  damageMob,
  hasEntered,
  MOB_TYPES,
  mobTellLit,
  resolveStorm,
  spawnMob,
} from "./mobs";
import { headstoneAt, STONE_DAMAGE, STONE_RECHARGE } from "./lines/headstones";
import { MAX_LEVEL, WEAPON_LINES } from "./lines/roster";
import {
  advanceStream,
  SKULL_DAMAGE,
  STREAM_INTERVAL,
  SURGE_INTERVAL,
  surgeStream,
} from "./lines/soulStream";
import { advanceWisps, launchWisps, WISP_DAMAGE } from "./lines/wisps";
import type { RunState, TickCommand } from "./run";
import { createRun } from "./run";
import { RAMP_ROWS } from "./stage/stage";
import type { SpawnOrder } from "./stage/templates";
import { place } from "./stage/templates";

/** A tick that only steers, which is every tick these tests are about. */
function drift(x: number, y: number): TickCommand {
  return { move: { x, y }, belch: false };
}

const STILL: TickCommand = drift(0, 0);
const RIGHT: TickCommand = drift(1, 0);

/**
 * A run whose stage will not spawn anything on top of the mob under test. The
 * rows are marked fired rather than emptied, because the row tables are exported
 * data and a test that mutated them would poison every later file.
 */
function quietRun(seed = 4): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  // The stream is held as well as the rows. These tests are about how a mob
  // moves, fires and dies, and a birthright stream pouring up the middle of the
  // field kills the mob under test before it reaches the behaviour being
  // measured. The headstones need no holding: their orbit clears the grave's
  // own hitbox, so a mob standing on the grave's centre line is never in it.
  run.lines.streamIn = Number.MAX_SAFE_INTEGER;
  return run;
}

/** A run with a quiet stage and a headstone parked where a test can aim it. */
function stormRun(seed = 4): RunState {
  const state = quietRun(seed);
  state.levels.headstones = 1;
  return state;
}

/** A live mob of a stated type, past its arriving beat. */
function putMob(state: RunState, type: Mob["type"], x: number, y: number): Mob {
  const mob = spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 })!;
  mob.beat = 0;
  return mob;
}

/** A mob standing exactly where this run's one headstone is. */
function stoneVictim(state: RunState): Mob {
  const at = headstoneAt(state, 0)!;
  return putMob(state, "shambler", at.x, at.y);
}

function putSkull(state: RunState, x: number, y: number) {
  const skull = state.skulls.find((each) => !each.alive)!;
  skull.alive = true;
  skull.id = state.nextEntityId;
  state.nextEntityId += 1;
  skull.x = x;
  skull.y = y;
  skull.vx = 0;
  skull.vy = 0;
  return skull;
}

function putWisp(state: RunState, x: number, y: number) {
  const wisp = state.wisps.find((each) => !each.alive)!;
  wisp.alive = true;
  wisp.id = state.nextEntityId;
  state.nextEntityId += 1;
  wisp.x = x;
  wisp.y = y;
  wisp.vx = 0;
  wisp.vy = 0;
  wisp.life = 60;
  wisp.targetId = null;
  return wisp;
}

function order(x: number, y: number, vx = 0, vy = 1, index = 0): SpawnOrder {
  return { x, y, vx, vy, index };
}

/** The one mob a test put on the field. */
function only(run: RunState): Mob {
  const live = run.mobs.filter((mob) => mob.alive);
  expect(live).toHaveLength(1);
  return live[0];
}

function run(
  step: Stepper,
  ticks: number,
  command: TickCommand = STILL,
): SimEvent[] {
  const events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    events.push(...step(command));
  }
  return events;
}

function types(events: SimEvent[], type: SimEvent["type"]): SimEvent[] {
  return events.filter((event) => event.type === type);
}

describe("the mob type table (ADR 0016)", () => {
  it("gives each type the descent, health, corpse payout and size the table states", () => {
    expect(MOB_TYPES.shambler.speed).toBeCloseTo(0.5 * SCROLL_SPEED, 12);
    expect(MOB_TYPES.revenant.speed).toBeCloseTo(0.35 * SCROLL_SPEED, 12);

    expect(MOB_TYPES.shambler.hp).toBe(3);
    expect(MOB_TYPES.revenant.hp).toBe(5);
    expect(MOB_TYPES.ghoul.hp).toBe(2);

    expect(MOB_TYPES.shambler.corpsePayout).toBe(TRASH_CORPSE_PAYOUT);
    expect(MOB_TYPES.revenant.corpsePayout).toBe(2 * TRASH_CORPSE_PAYOUT);
    expect(MOB_TYPES.ghoul.corpsePayout).toBe(TRASH_CORPSE_PAYOUT);

    expect(MOB_TYPES.shambler.corpseTier).toBe("trash");
    expect(MOB_TYPES.revenant.corpseTier).toBe("rich");
    expect(MOB_TYPES.ghoul.corpseTier).toBe("trash");

    expect([
      MOB_TYPES.shambler.halfWidth,
      MOB_TYPES.shambler.halfHeight,
    ]).toEqual([11, 11]);
    expect([
      MOB_TYPES.revenant.halfWidth,
      MOB_TYPES.revenant.halfHeight,
    ]).toEqual([13, 13]);
    expect([MOB_TYPES.ghoul.halfWidth, MOB_TYPES.ghoul.halfHeight]).toEqual([
      9, 9,
    ]);
  });

  it("makes the ghoul's speed a real fraction of the grave's, because ADR 0016 bounds it by turn rate and not by a cap", () => {
    // The magnitude is the tuning dispatch's and is deliberately not pinned.
    // What is pinned is that it is fast enough to be a threat at all: a chaser
    // slower than the scroll it rides can never intercept anything.
    expect(MOB_TYPES.ghoul.speed).toBeGreaterThan(SCROLL_SPEED);
    expect(MOB_TYPES.ghoul.motion).toBe("chases");
  });
});

describe("the arriving beat (ADR 0016)", () => {
  it("holds the template's arriving velocity for ARRIVE_TICKS and then moves under the type's own rule", () => {
    const state = quietRun();
    const step = stepping(state);
    // A V's arm arrives on a diagonal, which is the case where the beat bites.
    const arm = place("v", 2, state.streams.spawns)[0];
    spawnMob(state, "shambler", order(200, 11, arm.vx, arm.vy));
    const mob = only(state);
    const arriving = { vx: mob.vx, vy: mob.vy };
    expect(arriving.vx).not.toBe(0);

    run(step, ARRIVE_TICKS);
    expect(mob.vx).toBeCloseTo(arriving.vx, 12);
    expect(mob.vy).toBeCloseTo(arriving.vy, 12);

    run(step, 1);
    expect(mob.vx).toBe(0);
    expect(mob.vy).toBeCloseTo(MOB_TYPES.shambler.speed, 12);
  });

  it("gives a mob the template's direction times its own type speed, so a straight-down entry changes speed by nothing when the beat ends", () => {
    for (const type of ["shambler", "revenant"] as const) {
      const state = quietRun();
      const step = stepping(state);
      spawnMob(state, type, order(200, MOB_TYPES[type].halfHeight));
      const mob = only(state);
      expect(mob.vx).toBe(0);
      expect(mob.vy).toBeCloseTo(MOB_TYPES[type].speed, 12);

      run(step, ARRIVE_TICKS + 1);
      expect(mob.vx).toBe(0);
      expect(mob.vy).toBeCloseTo(MOB_TYPES[type].speed, 12);
    }
  });

  it("counts the beat from the top-edge crossing and never from the spawn", () => {
    const state = quietRun();
    const step = stepping(state);
    const deep = -120;
    const arm = place("v", 2, state.streams.spawns)[0];
    spawnMob(state, "shambler", order(200, deep, arm.vx, arm.vy));
    const mob = only(state);
    const arriving = { vx: mob.vx, vy: mob.vy };

    // Counted from spawn the beat would have expired long before this.
    while (!hasEntered(mob)) run(step, 1);
    expect(state.tick).toBeGreaterThan(ARRIVE_TICKS);

    run(step, ARRIVE_TICKS - 1);
    expect(mob.vx).toBeCloseTo(arriving.vx, 12);
    run(step, 2);
    expect(mob.vx).toBe(0);
  });

  it("leaves a ghoul flying the template's arriving direction at the tick its beat ends, not straight down", () => {
    const state = quietRun();
    const step = stepping(state);
    const arm = place("pincer", 2, state.streams.spawns)[0];
    spawnMob(state, "ghoul", order(200, 9, arm.vx, arm.vy));
    const mob = only(state);
    expect(mob.vx).not.toBe(0);
    // Straight below, so the turn has nothing to correct and only the stored
    // direction can explain where the ghoul is pointing.
    state.grave.x = 200;

    run(step, ARRIVE_TICKS);
    expect(Math.sign(mob.vx)).toBe(Math.sign(arm.vx));
    expect(Math.abs(mob.vx)).toBeGreaterThan(0);
  });
});

describe("the ghoul (ADR 0016)", () => {
  it("always descends at least 1.35 times the scroll, so it can never climb or hold station", () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, "ghoul", order(120, 60));
    const mob = only(state);
    // Level with the ghoul and far to the side, which is the heading that would
    // let it hold station if the floor were not there.
    state.grave.x = 480;
    state.grave.y = 60;

    for (let tick = 0; tick < 1000 && mob.alive; tick++) {
      const before = mob.y;
      step(STILL);
      state.grave.y = Math.min(mob.y, FIELD_HEIGHT - state.grave.size);
      if (!mob.alive) break;
      expect(mob.y - before).toBeGreaterThanOrEqual(1.35 * SCROLL_SPEED - 1e-9);
    }
    expect(mob.alive).toBe(false);
  });

  it("is beaten by a grave that commits early, and beats one that commits inside the last few ticks", () => {
    // The pair, and neither half asserts a magnitude. One alone only proves the
    // ghoul is not cheap; the pair is the only thing that would catch the
    // tuning dispatch turning it into scenery.
    const startY = 400;
    const descent = MOB_TYPES.ghoul.speed + SCROLL_SPEED;
    const graveTop = graveHitbox(quietRun().grave).y;
    const contact = Math.ceil(
      (graveTop - MOB_TYPES.ghoul.halfHeight - startY) / descent,
    );

    const early = ghoulRun(0, contact);
    expect(types(early, "graveHit")).toHaveLength(0);

    const late = ghoulRun(contact - 3, contact);
    expect(types(late, "graveHit").length).toBeGreaterThan(0);
  });
});

/**
 * A ghoul dropped straight at a grave that holds still until `commitAt` and
 * then cuts hard to one side, run until the ghoul is gone. The commit tick is
 * the input; whether the grave is hit is the assertion.
 */
function ghoulRun(commitAt: number, contact: number): SimEvent[] {
  const state = quietRun();
  const step = stepping(state);
  spawnMob(state, "ghoul", order(state.grave.x, 400));
  const events: SimEvent[] = [];
  for (let tick = 0; tick < contact + 400; tick++) {
    events.push(...step(tick < commitAt ? STILL : RIGHT));
  }
  return events;
}

describe("the armed share (ADR 0016)", () => {
  it("arms a mob when its group index modulo three is two, so no Drip of one or two is ever armed", () => {
    for (const count of [1, 2, 3, 6]) {
      const state = quietRun();
      for (const at of place("drip", count, state.streams.spawns)) {
        spawnMob(state, "shambler", at);
      }
      const armed = state.mobs.filter((mob) => mob.alive && mob.armed);
      expect(`drip of ${count}: ${armed.length}`).toBe(
        `drip of ${count}: ${Math.floor(count / 3)}`,
      );
    }
  });

  it("arms every revenant and no ghoul", () => {
    const state = quietRun();
    for (const at of place("drip", 4, state.streams.spawns)) {
      spawnMob(state, "revenant", at);
    }
    expect(state.mobs.filter((mob) => mob.alive && mob.armed)).toHaveLength(4);

    const ghouls = quietRun();
    for (const at of place("drip", 9, ghouls.streams.spawns)) {
      spawnMob(ghouls, "ghoul", at);
    }
    expect(ghouls.mobs.filter((mob) => mob.alive && mob.armed)).toHaveLength(0);
  });

  it("indexes the share per arm on the V and the Pincer, so a mirrored template arms symmetrically", () => {
    for (const template of ["v", "pincer"] as const) {
      const state = quietRun();
      const orders = place(template, 6, state.streams.spawns);
      for (const at of orders) spawnMob(state, "shambler", at);
      const live = state.mobs.filter((mob) => mob.alive);
      const armedLeft = live.filter(
        (mob, index) => mob.armed && index % 2 === 0,
      );
      const armedRight = live.filter(
        (mob, index) => mob.armed && index % 2 === 1,
      );
      expect(`${template} ${armedLeft.length} ${armedRight.length}`).toBe(
        `${template} 1 1`,
      );
    }
  });

  it("never lets an unarmed shambler fire", () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, "shambler", order(200, 11, 0, 1, 0));
    expect(only(state).armed).toBe(false);
    expect(types(run(step, 600), "mobFired")).toHaveLength(0);
  });
});

describe("mob fire (ADR 0016 and ADR 0014)", () => {
  it("lights a revenant's tell as it enters and lands its first shot at the end of the beat", () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, "revenant", order(200, MOB_TYPES.revenant.halfHeight));
    const mob = only(state);
    expect(hasEntered(mob)).toBe(true);
    expect(mobTellLit(mob)).toBe(true);

    const before = run(step, ARRIVE_TICKS - 1);
    expect(types(before, "mobFired")).toHaveLength(0);
    expect(mobTellLit(mob)).toBe(true);

    expect(types(run(step, 1), "mobFired")).toHaveLength(1);
  });

  it("puts the same tell lead in front of every shot over a revenant's whole pass", () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, "revenant", order(200, MOB_TYPES.revenant.halfHeight));
    const mob = only(state);
    const lead = MOB_TYPES.revenant.fire.tellTicks;

    const lit: number[] = [];
    const fired: number[] = [];
    for (let tick = 0; tick < 800 && mob.alive; tick++) {
      const wasLit = mobTellLit(mob);
      const events = step(STILL);
      if (!wasLit && mobTellLit(mob)) lit.push(state.tick);
      for (const event of events) {
        if (event.type === "mobFired") fired.push(state.tick);
      }
    }
    expect(fired.length).toBeGreaterThan(3);
    // The first tell lights before the first step, so the leads line up from
    // the second shot on.
    for (let shot = 1; shot < fired.length; shot++) {
      expect(`lead before shot ${shot}: ${fired[shot] - lit[shot - 1]}`).toBe(
        `lead before shot ${shot}: ${lead}`,
      );
    }
  });

  it("spreads a File of armed shamblers with a per-mob offset, so it does not fire as one volley", () => {
    const state = quietRun();
    for (const at of place("file", 9, state.streams.spawns)) {
      spawnMob(state, "shambler", at);
    }
    const armed = state.mobs.filter((mob) => mob.alive && mob.armed);
    expect(armed.length).toBe(3);
    expect(new Set(armed.map((mob) => mob.fireIn)).size).toBeGreaterThan(1);
  });

  it("aims at the grave's centre at the moment of firing and never changes direction after", () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, "revenant", order(120, MOB_TYPES.revenant.halfHeight));
    const mob = only(state);
    run(step, ARRIVE_TICKS);

    const shot = state.mobFire.find((each) => each.alive)!;
    const dx = state.grave.x - mob.x;
    const dy = state.grave.y - mob.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const speed = MOB_TYPES.revenant.fire.shotSpeed;
    expect(shot.vx).toBeCloseTo((dx / length) * speed, 9);
    expect(shot.vy).toBeCloseTo((dy / length) * speed, 9);

    const aimed = { vx: shot.vx, vy: shot.vy };
    run(step, 20, RIGHT);
    expect(shot.vx).toBe(aimed.vx);
    expect(shot.vy).toBe(aimed.vy);
  });

  it("does not carry the scroll", () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, "revenant", order(200, MOB_TYPES.revenant.halfHeight));
    run(step, ARRIVE_TICKS);
    const shot = state.mobFire.find((each) => each.alive)!;
    const from = shot.y;
    run(step, 10);
    expect(shot.y - from).toBeCloseTo(10 * shot.vy, 9);
  });

  it("keeps every firing number on the type's row, the tell lead included", () => {
    // A source scan, because the failure this guards against is a shared module
    // constant, and no assertion over the table's values can see one.
    for (const type of ["shambler", "revenant"] as const) {
      const fire = MOB_TYPES[type].fire;
      for (const [field, value] of Object.entries(fire)) {
        if (field === "armedShare") continue;
        expect(`${type}.${field} ${typeof value}`).toBe(
          `${type}.${field} number`,
        );
      }
      expect(fire.tellTicks).toBeGreaterThan(0);
      expect(fire.interval).toBeGreaterThan(0);
      expect(fire.shotSpeed).toBeGreaterThan(0);
      expect(fire.shotHalfExtent).toBeGreaterThan(0);
    }
    expect(MOB_TYPES.shambler.fire.interval).not.toBe(
      MOB_TYPES.revenant.fire.interval,
    );

    const declared = [
      ...mobsSource.matchAll(
        /^(?:export )?const ([A-Z][A-Z0-9_]*)\s*(?::[^=]*)?=\s*[^{[\n]/gm,
      ),
    ];
    const firing = declared
      .map((match) => match[1])
      .filter((name) => /TELL|SHOT|INTERVAL|EXTENT|JITTER|ARMED/.test(name));
    expect(firing).toEqual([]);
  });

  it("states the shot speed as a reaction budget: a shot from mid-field reaches the starting mark in about two seconds", () => {
    const state = quietRun();
    const distance = state.grave.y - FIELD_HEIGHT / 2;
    const seconds = distance / (MOB_TYPES.revenant.fire.shotSpeed * TICK_HZ);
    expect(seconds).toBeGreaterThan(1.5);
    expect(seconds).toBeLessThan(2.5);
  });
});

describe("a mob's death (ADR 0005)", () => {
  it("kills at or below zero health, frees the slot, leaves a corpse and reports the kill", () => {
    const state = quietRun();
    spawnMob(state, "shambler", order(200, 100));
    const mob = only(state);

    expect(damageMob(state, mob, MOB_TYPES.shambler.hp - 1, "storm")).toEqual(
      [],
    );
    expect(mob.alive).toBe(true);

    const events = damageMob(state, mob, 1, "storm");
    expect(mob.alive).toBe(false);
    expect(events).toEqual([
      { type: "mobKilled", mob: "shambler", x: 200, y: 100 },
    ]);
    const corpses = state.corpses.filter((corpse) => corpse.alive);
    expect(corpses).toHaveLength(1);
    expect(corpses[0].payout).toBe(MOB_TYPES.shambler.corpsePayout);
  });

  it("carries the damage source from the first commit, and every source kills the same way today", () => {
    for (const source of ["storm", "bell", "headstone", "contact"] as const) {
      const state = quietRun();
      spawnMob(state, "ghoul", order(200, 100));
      const events = damageMob(state, only(state), MOB_TYPES.ghoul.hp, source);
      expect(`${source} ${events.length}`).toBe(`${source} 1`);
    }
  });

  it("never kills a mob on contact and never leaves a corpse for one, however long the grave sits under it", () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, "shambler", order(state.grave.x, 300));
    const mob = only(state);
    const events = run(step, 600);
    expect(types(events, "graveHit").length).toBeGreaterThan(0);
    expect(types(events, "mobKilled")).toHaveLength(0);
    expect(state.corpses.some((corpse) => corpse.alive)).toBe(false);
    // Gone off the bottom edge rather than killed.
    expect(mob.alive).toBe(false);
  });

  it("culls a mob past the bottom edge, and it costs the player nothing", () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, "shambler", order(60, 700));
    const mob = only(state);
    const events = run(step, 200);
    expect(mob.alive).toBe(false);
    expect(events).toEqual([]);
    expect(state.corpses.some((corpse) => corpse.alive)).toBe(false);
  });
});

describe("the storm meeting a mob (plan 6.7)", () => {
  it("resolves skulls, then headstones, then wisps, so the same seed kills in the same order", () => {
    // The order is stated rather than incidental: three pools read in one pass,
    // and a different order is a different set of kills on the same seed.
    const state = stormRun();
    const skulled = putMob(state, "shambler", 100, 100);
    const stoned = stoneVictim(state);
    const wisped = putMob(state, "shambler", 300, 100);
    putSkull(state, skulled.x, skulled.y);
    putWisp(state, wisped.x, wisped.y);

    const killed = resolveStorm(state)
      .filter((event) => event.type === "mobKilled")
      .map((event) => (event.type === "mobKilled" ? event.x : -1));
    expect(killed).toEqual([]);
    expect(skulled.hp).toBe(MOB_TYPES.shambler.hp - SKULL_DAMAGE);
    expect(stoned.hp).toBe(MOB_TYPES.shambler.hp - STONE_DAMAGE);
    expect(wisped.hp).toBe(MOB_TYPES.shambler.hp - WISP_DAMAGE);
  });

  it("consumes a skull and a wisp on the mob they hit, and never a stone", () => {
    // A stone is an orbiting solid: it goes inert instead, so it can carry a
    // mob out of the way rather than dying on it.
    const state = stormRun();
    const skulled = putMob(state, "shambler", 100, 100);
    const wisped = putMob(state, "shambler", 300, 100);
    const skull = putSkull(state, skulled.x, skulled.y);
    const wisp = putWisp(state, wisped.x, wisped.y);
    stoneVictim(state);

    resolveStorm(state);
    expect(skull.alive).toBe(false);
    expect(wisp.alive).toBe(false);
    expect(state.lines.stoneRecharge[0]).toBe(STONE_RECHARGE);
  });

  it("takes every death through damageMob, so a kill leaves a corpse and emits mobKilled with no second path", () => {
    const state = stormRun();
    const doomed = putMob(state, "shambler", 100, 100);
    doomed.hp = 1;
    putSkull(state, doomed.x, doomed.y);

    const events = resolveStorm(state);
    expect(events.map((event) => event.type)).toContain("mobKilled");
    expect(doomed.alive).toBe(false);
    expect(state.corpses.filter((corpse) => corpse.alive)).toHaveLength(1);
  });

  it("leaves an inert stone doing nothing until it recovers", () => {
    const state = stormRun();
    const victim = stoneVictim(state);
    resolveStorm(state);
    const after = victim.hp;
    for (let again = 0; again < 5; again++) resolveStorm(state);
    expect(victim.hp).toBe(after);
  });
});

describe("one swallow's whole burst payload never clears a wave (plan section 3)", () => {
  /**
   * The worst case at the ceiling, over the two waves the authored stage really
   * contains. The payload is the wisp volley and the surged volley together,
   * which is what the bound is derived against: asserting the wisps alone would
   * pass the defect all three gates found.
   */
  for (const wave of [
    { type: "ghoul" as const, count: 7 },
    { type: "shambler" as const, count: 22 },
  ]) {
    it(`leaves survivors from ${wave.count} ${wave.type}s at every line's ceiling`, () => {
      const state = stormRun();
      for (const line of WEAPON_LINES) state.levels[line] = MAX_LEVEL;
      // Every other test in this file holds the stream off, and this one is
      // measuring it, so its clock is armed to fire on the window's first tick.
      // The surged volley follows SURGE_INTERVAL later, both inside the window.
      state.lines.streamIn = 1;
      const row = MOB_TYPES[wave.type];
      const mobs: Mob[] = [];
      for (let index = 0; index < wave.count; index++) {
        mobs.push(
          putMob(
            state,
            wave.type,
            row.halfWidth + index * row.halfWidth * 2,
            state.grave.y - 60,
          ),
        );
      }

      // One swallow's whole payload: the wisp volley it launches and the extra
      // stream volley its surge buys, resolved against the wave.
      launchWisps(state, []);
      surgeStream(state);
      for (let tick = 0; tick < SURGE_INTERVAL + STREAM_INTERVAL; tick++) {
        advanceStream(state);
        advanceWisps(state);
        resolveStorm(state);
      }
      // The stream is half of what the bound is derived against, so a window
      // it never fired in would measure the wisps alone.
      expect(state.skulls.filter((skull) => skull.alive)).not.toHaveLength(0);
      // The stream is a narrow fan straight up out of the mouth, so at this
      // wave's standoff its columns cross the wave's line within about seven
      // units of the grave's centre. A wave laid across the field's whole
      // width is mostly outside the stream's reach whatever its level, and the
      // coverage is far narrower than "every line at its ceiling" suggests.
      expect(mobs.filter((mob) => mob.alive).length).toBeGreaterThan(0);
    });
  }
});

describe("an armed mob that has passed the grave (plan 6.10)", () => {
  it("does not fire, because a mob shooting upward at the player from behind reads as unfair", () => {
    // Watched go red with the guard removed. Mobs are culled only past the
    // bottom edge, so without it a mob at y=734 aims back up at a grave at 711.
    const state = stormRun();
    const behind = putMob(
      state,
      "revenant",
      state.grave.x,
      state.grave.y + state.grave.size + MOB_TYPES.revenant.halfHeight + 5,
    );
    behind.armed = true;
    behind.fireIn = 1;

    const events = advanceMobs(state);
    expect(events.map((event) => event.type)).not.toContain("mobFired");
    expect(state.mobFire.filter((shot) => shot.alive)).toHaveLength(0);
  });

  it("still fires while it is level with or above the grave", () => {
    const state = stormRun();
    const ahead = putMob(state, "revenant", state.grave.x, state.grave.y - 100);
    ahead.armed = true;
    ahead.fireIn = 1;

    const events = advanceMobs(state);
    expect(events.map((event) => event.type)).toContain("mobFired");
  });
});
