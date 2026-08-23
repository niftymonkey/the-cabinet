/**
 * The wisps (ADR 0005): the run's only homing line, fired on each swallow and
 * never always-on. Expected values come from ADR 0005 and dispatch 5's plan
 * sections 3 and 6.5.
 */

import { describe, expect, it } from "vitest";

import { cos } from "../math";
import type { Mob, MobType } from "../mobs";
import { MOB_TYPES, spawnMob } from "../mobs";
import type { RunState } from "../run";
import { createRun } from "../run";
import { RAMP_ROWS } from "../stage/stage";
import { MAX_LEVEL } from "./roster";
import {
  advanceWisps,
  launchWisps,
  WISP_DAMAGE,
  WISP_LIFETIME,
  WISP_SPEED,
  WISP_TURN_DEGREES_PER_SECOND,
  WISPS_BY_LEVEL,
} from "./wisps";

function quietRun(seed = 8): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

function put(state: RunState, type: MobType, x: number, y: number): Mob {
  const mob = spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 })!;
  mob.beat = 0;
  return mob;
}

function liveWisps(state: RunState) {
  return state.wisps.filter((wisp) => wisp.alive);
}

/** A volley launched from a run at a stated level, with the events it produced discarded. */
function volley(state: RunState, level: number) {
  state.levels.wisps = level;
  launchWisps(state, []);
  return liveWisps(state);
}

/**
 * The cosine of the angle between two headings.
 *
 * Compared as a cosine rather than converted to degrees, because an arc cosine
 * is implementation-approximated and this file is inside the sim's own lint
 * fence. A larger cosine is a smaller turn, so the bound reads the other way
 * round and the assertion says so.
 */
function turnCosine(
  before: { vx: number; vy: number },
  after: { vx: number; vy: number },
): number {
  const dot = before.vx * after.vx + before.vy * after.vy;
  const lengths =
    Math.sqrt(before.vx * before.vx + before.vy * before.vy) *
    Math.sqrt(after.vx * after.vx + after.vy * after.vy);
  return Math.min(1, dot / lengths);
}

describe("the wisps are never on unless a swallow bought them (ADR 0005)", () => {
  it("starts a run with no wisps and launches none until the line is levelled", () => {
    const state = quietRun();
    expect(state.levels.wisps).toBe(0);
    put(state, "shambler", 200, 300);
    launchWisps(state, []);
    expect(liveWisps(state)).toHaveLength(0);
  });

  it("launches the level's own count, from one at level 1 to eight at level 5", () => {
    expect(WISPS_BY_LEVEL).toEqual([0, 1, 2, 4, 6, 8]);
    for (let level = 1; level <= MAX_LEVEL; level++) {
      const state = quietRun();
      put(state, "shambler", 200, 300);
      expect(`level ${level}: ${volley(state, level).length}`).toBe(
        `level ${level}: ${WISPS_BY_LEVEL[level]}`,
      );
    }
  });

  it("launches from the grave's mouth and does not move on the tick it launches", () => {
    const state = quietRun();
    put(state, "shambler", 200, 300);
    const mouth = { x: state.grave.x, y: state.grave.y - state.grave.size };
    const [wisp] = volley(state, 1);
    expect({ x: wisp.x, y: wisp.y }).toEqual(mouth);
  });
});

describe("the no-overkill targeting rule (plan section 3)", () => {
  it("never commits more wisps to one mob than its health, over a field of mixed types", () => {
    // This is the rule the one-swallow ordnance bound depends on. Eight wisps
    // that all pick the nearest mob put eight damage into a three-health
    // shambler and kill one thing.
    const state = quietRun();
    const mobs = [
      put(state, "shambler", 260, 500),
      put(state, "ghoul", 300, 480),
      put(state, "revenant", 220, 460),
    ];
    const wisps = volley(state, MAX_LEVEL);
    expect(wisps).toHaveLength(WISPS_BY_LEVEL[MAX_LEVEL]);

    const capacity = mobs.reduce((total, mob) => total + mob.hp, 0);
    expect(wisps.length).toBeLessThanOrEqual(capacity);
    for (const mob of mobs) {
      const committed = wisps.filter((wisp) => wisp.targetId === mob.id).length;
      expect(`${mob.type}: ${committed * WISP_DAMAGE <= mob.hp}`).toBe(
        `${mob.type}: true`,
      );
    }
  });

  it("spreads across bodies rather than piling on the nearest one", () => {
    const state = quietRun();
    const near = put(state, "shambler", 270, 560);
    const far = put(state, "shambler", 270, 300);
    const wisps = volley(state, 3);
    expect(wisps.filter((wisp) => wisp.targetId === near.id)).toHaveLength(
      MOB_TYPES.shambler.hp,
    );
    expect(wisps.filter((wisp) => wisp.targetId === far.id)).toHaveLength(
      WISPS_BY_LEVEL[3] - MOB_TYPES.shambler.hp,
    );
  });

  it("over-commits the surplus onto the last target assigned, rather than holding wisps back", () => {
    // The common case rather than a corner: eight wisps against one body runs
    // out of uncommitted mobs immediately. Holding the surplus unlaunched would
    // make a levelled line visibly emit less against a thin field, which reads
    // as the upgrade breaking.
    const state = quietRun();
    const only = put(state, "shambler", 270, 500);
    const wisps = volley(state, MAX_LEVEL);
    expect(wisps).toHaveLength(WISPS_BY_LEVEL[MAX_LEVEL]);
    for (const wisp of wisps) expect(wisp.targetId).toBe(only.id);
  });

  it("launches the full volley with nothing to hunt, and each one expires honestly", () => {
    const state = quietRun();
    const wisps = volley(state, MAX_LEVEL);
    expect(wisps).toHaveLength(WISPS_BY_LEVEL[MAX_LEVEL]);
    for (const wisp of wisps) expect(wisp.targetId).toBeNull();
  });
});

describe("a wisp's flight (plan 6.5)", () => {
  it("expires at WISP_LIFETIME with nothing to hunt", () => {
    const state = quietRun();
    const [wisp] = volley(state, 1);
    for (let tick = 0; tick < WISP_LIFETIME - 1; tick++) advanceWisps(state);
    expect(wisp.alive).toBe(true);
    advanceWisps(state);
    expect(wisp.alive).toBe(false);
  });

  it("holds its speed over its whole life, because the lifetime is derived against it", () => {
    // The heading is renormalized every tick, exactly as a ghoul's chase
    // already is. Rotating the velocity in place would compound f32 rounding of
    // the turn's cosine and sine over a 90-tick life and let the speed drift.
    const state = quietRun();
    put(state, "shambler", 60, 200);
    const [wisp] = volley(state, 1);
    for (let tick = 0; tick < WISP_LIFETIME - 1; tick++) {
      advanceWisps(state);
      if (!wisp.alive) break;
      const speed = Math.sqrt(wisp.vx * wisp.vx + wisp.vy * wisp.vy);
      expect(speed).toBeCloseTo(WISP_SPEED, 4);
    }
  });

  it("cannot reverse in under a second, so it visibly curves rather than snapping", () => {
    const state = quietRun();
    // Directly behind the grave, so the turn is as hard as the field allows.
    put(state, "shambler", state.grave.x, state.grave.y + 40);
    const [wisp] = volley(state, 1);
    const perTick = (WISP_TURN_DEGREES_PER_SECOND / 60) * (Math.PI / 180);
    // A turn no larger than one step is a cosine no smaller than the step's.
    const floor = cos(perTick) - 1e-4;
    for (let tick = 0; tick < 20; tick++) {
      const before = { vx: wisp.vx, vy: wisp.vy };
      advanceWisps(state);
      if (!wisp.alive) break;
      expect(turnCosine(before, wisp)).toBeGreaterThanOrEqual(floor);
    }
  });

  it("turns toward its target rather than away from it", () => {
    const state = quietRun();
    const target = put(state, "shambler", 100, 400);
    const [wisp] = volley(state, 1);
    let last = Infinity;
    for (let tick = 0; tick < 30; tick++) {
      advanceWisps(state);
      if (!wisp.alive) break;
      const dx = target.x - wisp.x;
      const dy = target.y - wisp.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      expect(distance).toBeLessThan(last);
      last = distance;
    }
  });
});

describe("re-targeting (plan 6.5)", () => {
  it("re-targets when its target dies", () => {
    const state = quietRun();
    const first = put(state, "shambler", 270, 500);
    const [wisp] = volley(state, 1);
    expect(wisp.targetId).toBe(first.id);

    const second = put(state, "shambler", 200, 400);
    first.alive = false;
    advanceWisps(state);
    expect(wisp.targetId).toBe(second.id);
  });

  it("does not re-target while its target lives, so a flight is not undone every tick", () => {
    // A flight launched from one point with one nearest answer would converge
    // on one mob again, and the assignment rule would be undone every tick.
    const state = quietRun();
    const far = put(state, "shambler", 100, 300);
    const near = put(state, "shambler", 270, 560);
    const wisps = volley(state, 4);
    const assigned = wisps.map((wisp) => wisp.targetId);
    expect(new Set(assigned).size).toBeGreaterThan(1);
    for (let tick = 0; tick < 20; tick++) advanceWisps(state);
    expect(liveWisps(state).map((wisp) => wisp.targetId)).toEqual(assigned);
    expect(far.alive && near.alive).toBe(true);
  });
});
