/**
 * The three mob types, their fire and their deaths (ADR 0016). Every sim test
 * here steps through stepChecked, so ADR 0013's invariants are checked on every
 * step.
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

import { stepChecked } from "../dev/invariants";
import { SCROLL_SPEED, TRASH_CORPSE_PAYOUT } from "./tuning";
import { TICK_HZ } from "./clock";
import type { SimEvent } from "./events";
import { FIELD_HEIGHT } from "./field";
import { graveHitbox } from "./grave";
import type { Mob } from "./mobs";
import {
  ARRIVE_TICKS,
  damageMob,
  hasEntered,
  MOB_TYPES,
  mobTellLit,
  spawnMob,
} from "./mobs";
import type { MoveCommand, RunState } from "./run";
import { createRun } from "./run";
import { RAMP_ROWS } from "./stage/stage";
import type { SpawnOrder } from "./stage/templates";
import { place } from "./stage/templates";

const STILL = { x: 0, y: 0 } as const;
const RIGHT = { x: 1, y: 0 } as const;

/**
 * A run whose stage will not spawn anything on top of the mob under test. The
 * rows are marked fired rather than emptied, because the row tables are exported
 * data and a test that mutated them would poison every later file.
 */
function quietRun(seed = 4): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
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
  state: RunState,
  ticks: number,
  command: MoveCommand = STILL,
): SimEvent[] {
  const events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    events.push(...stepChecked(state, command));
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
    // A V's arm arrives on a diagonal, which is the case where the beat bites.
    const arm = place("v", 2, state.streams.spawns)[0];
    spawnMob(state, "shambler", order(200, 11, arm.vx, arm.vy));
    const mob = only(state);
    const arriving = { vx: mob.vx, vy: mob.vy };
    expect(arriving.vx).not.toBe(0);

    run(state, ARRIVE_TICKS);
    expect(mob.vx).toBeCloseTo(arriving.vx, 12);
    expect(mob.vy).toBeCloseTo(arriving.vy, 12);

    run(state, 1);
    expect(mob.vx).toBe(0);
    expect(mob.vy).toBeCloseTo(MOB_TYPES.shambler.speed, 12);
  });

  it("gives a mob the template's direction times its own type speed, so a straight-down entry changes speed by nothing when the beat ends", () => {
    for (const type of ["shambler", "revenant"] as const) {
      const state = quietRun();
      spawnMob(state, type, order(200, MOB_TYPES[type].halfHeight));
      const mob = only(state);
      expect(mob.vx).toBe(0);
      expect(mob.vy).toBeCloseTo(MOB_TYPES[type].speed, 12);

      run(state, ARRIVE_TICKS + 1);
      expect(mob.vx).toBe(0);
      expect(mob.vy).toBeCloseTo(MOB_TYPES[type].speed, 12);
    }
  });

  it("counts the beat from the top-edge crossing and never from the spawn", () => {
    const state = quietRun();
    const deep = -120;
    const arm = place("v", 2, state.streams.spawns)[0];
    spawnMob(state, "shambler", order(200, deep, arm.vx, arm.vy));
    const mob = only(state);
    const arriving = { vx: mob.vx, vy: mob.vy };

    // Counted from spawn the beat would have expired long before this.
    while (!hasEntered(mob)) run(state, 1);
    expect(state.tick).toBeGreaterThan(ARRIVE_TICKS);

    run(state, ARRIVE_TICKS - 1);
    expect(mob.vx).toBeCloseTo(arriving.vx, 12);
    run(state, 2);
    expect(mob.vx).toBe(0);
  });

  it("leaves a ghoul flying the template's arriving direction at the tick its beat ends, not straight down", () => {
    const state = quietRun();
    const arm = place("pincer", 2, state.streams.spawns)[0];
    spawnMob(state, "ghoul", order(200, 9, arm.vx, arm.vy));
    const mob = only(state);
    expect(mob.vx).not.toBe(0);
    // Straight below, so the turn has nothing to correct and only the stored
    // direction can explain where the ghoul is pointing.
    state.grave.x = 200;

    run(state, ARRIVE_TICKS);
    expect(Math.sign(mob.vx)).toBe(Math.sign(arm.vx));
    expect(Math.abs(mob.vx)).toBeGreaterThan(0);
  });
});

describe("the ghoul (ADR 0016)", () => {
  it("always descends at least 1.35 times the scroll, so it can never climb or hold station", () => {
    const state = quietRun();
    spawnMob(state, "ghoul", order(120, 60));
    const mob = only(state);
    // Level with the ghoul and far to the side, which is the heading that would
    // let it hold station if the floor were not there.
    state.grave.x = 480;
    state.grave.y = 60;

    for (let tick = 0; tick < 1000 && mob.alive; tick++) {
      const before = mob.y;
      stepChecked(state, STILL);
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
  spawnMob(state, "ghoul", order(state.grave.x, 400));
  const events: SimEvent[] = [];
  for (let tick = 0; tick < contact + 400; tick++) {
    events.push(...stepChecked(state, tick < commitAt ? STILL : RIGHT));
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
    spawnMob(state, "shambler", order(200, 11, 0, 1, 0));
    expect(only(state).armed).toBe(false);
    expect(types(run(state, 600), "mobFired")).toHaveLength(0);
  });
});

describe("mob fire (ADR 0016 and ADR 0014)", () => {
  it("lights a revenant's tell as it enters and lands its first shot at the end of the beat", () => {
    const state = quietRun();
    spawnMob(state, "revenant", order(200, MOB_TYPES.revenant.halfHeight));
    const mob = only(state);
    expect(hasEntered(mob)).toBe(true);
    expect(mobTellLit(mob)).toBe(true);

    const before = run(state, ARRIVE_TICKS - 1);
    expect(types(before, "mobFired")).toHaveLength(0);
    expect(mobTellLit(mob)).toBe(true);

    expect(types(run(state, 1), "mobFired")).toHaveLength(1);
  });

  it("puts the same tell lead in front of every shot over a revenant's whole pass", () => {
    const state = quietRun();
    spawnMob(state, "revenant", order(200, MOB_TYPES.revenant.halfHeight));
    const mob = only(state);
    const lead = MOB_TYPES.revenant.fire.tellTicks;

    const lit: number[] = [];
    const fired: number[] = [];
    for (let tick = 0; tick < 800 && mob.alive; tick++) {
      const wasLit = mobTellLit(mob);
      const events = stepChecked(state, STILL);
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
    spawnMob(state, "revenant", order(120, MOB_TYPES.revenant.halfHeight));
    const mob = only(state);
    run(state, ARRIVE_TICKS);

    const shot = state.mobFire.find((each) => each.alive)!;
    const dx = state.grave.x - mob.x;
    const dy = state.grave.y - mob.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const speed = MOB_TYPES.revenant.fire.shotSpeed;
    expect(shot.vx).toBeCloseTo((dx / length) * speed, 9);
    expect(shot.vy).toBeCloseTo((dy / length) * speed, 9);

    const aimed = { vx: shot.vx, vy: shot.vy };
    run(state, 20, RIGHT);
    expect(shot.vx).toBe(aimed.vx);
    expect(shot.vy).toBe(aimed.vy);
  });

  it("does not carry the scroll", () => {
    const state = quietRun();
    spawnMob(state, "revenant", order(200, MOB_TYPES.revenant.halfHeight));
    run(state, ARRIVE_TICKS);
    const shot = state.mobFire.find((each) => each.alive)!;
    const from = shot.y;
    run(state, 10);
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
    spawnMob(state, "shambler", order(state.grave.x, 300));
    const mob = only(state);
    const events = run(state, 600);
    expect(types(events, "graveHit").length).toBeGreaterThan(0);
    expect(types(events, "mobKilled")).toHaveLength(0);
    expect(state.corpses.some((corpse) => corpse.alive)).toBe(false);
    // Gone off the bottom edge rather than killed.
    expect(mob.alive).toBe(false);
  });

  it("culls a mob past the bottom edge, and it costs the player nothing", () => {
    const state = quietRun();
    spawnMob(state, "shambler", order(60, 700));
    const mob = only(state);
    const events = run(state, 200);
    expect(mob.alive).toBe(false);
    expect(events).toEqual([]);
    expect(state.corpses.some((corpse) => corpse.alive)).toBe(false);
  });
});
