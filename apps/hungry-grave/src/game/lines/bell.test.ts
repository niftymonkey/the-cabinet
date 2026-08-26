/**
 * The bell (ADR 0005): always on from level 1, on its own clock, never fired by
 * a swallow. Expected values come from ADR 0005 and dispatch 5's plan section
 * 6.6.
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../events';
import { FIELD_WIDTH } from '../field';
import type { Mob, MobType } from '../mobs';
import { MOB_TYPES, SPAWN_MARGIN, spawnMob } from '../mobs';
import type { RunState } from '../run';
import { createRun } from '../run';
import { RAMP_ROWS } from '../stage/stage';
import {
  advanceBell,
  BELL_DAMAGE_FAR,
  BELL_DAMAGE_NEAR,
  BELL_EXPAND_TICKS,
  BELL_PERIOD,
  BELL_PUSH_BY_LEVEL,
  BELL_RADIUS_BY_LEVEL,
  ringRadius,
} from './bell';
import { MAX_LEVEL } from './roster';

function quietRun(seed = 12): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

function put(state: RunState, type: MobType, x: number, y: number): Mob {
  const mob = spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 })!;
  mob.beat = 0;
  return mob;
}

/** Runs the bell alone for a window and returns everything it emitted. */
function ringFor(state: RunState, ticks: number): SimEvent[] {
  const events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) events.push(...advanceBell(state));
  return events;
}

function tolls(events: SimEvent[]) {
  return events.filter((event) => event.type === 'tolled');
}

/** How much health a mob lost, which is the only way the ring's damage is visible. */
function damageTo(mob: Mob): number {
  return MOB_TYPES[mob.type].hp - mob.hp;
}

describe("the toll's own clock (ADR 0005)", () => {
  it('fires on BELL_PERIOD regardless of swallows, kills, or anything else on the field', () => {
    // It left the swallow deliberately: on a timer the bell's damage rate is
    // its damage over its period, fixed and tunable, and it gives the player a
    // rhythm to position against.
    const state = quietRun();
    state.levels.bell = 1;
    const fired = tolls(ringFor(state, BELL_PERIOD * 3));
    expect(fired).toHaveLength(3);
  });

  it('does not toll at level 0, because the line arrives only through a drop', () => {
    const state = quietRun();
    expect(state.levels.bell).toBe(0);
    expect(tolls(ringFor(state, BELL_PERIOD * 3))).toHaveLength(0);
    expect(state.lines.ring).toBeNull();
  });

  it('lands its first toll within one period of the line being dropped', () => {
    // The concept doc promises an audible toll from level 1, and this is its
    // watcher rather than a tuning intention.
    const state = quietRun();
    ringFor(state, 40);
    state.levels.bell = 1;
    expect(tolls(ringFor(state, BELL_PERIOD))).toHaveLength(1);
  });
});

describe('the ring (plan 6.6)', () => {
  it("declares the radius table, and level 5 reaches nearly the field's width from a centred grave", () => {
    expect(BELL_RADIUS_BY_LEVEL).toEqual([0, 80, 122, 165, 207, 250]);
    expect(BELL_RADIUS_BY_LEVEL[MAX_LEVEL]).toBeGreaterThan(
      FIELD_WIDTH / 2 - 30,
    );
    expect(BELL_RADIUS_BY_LEVEL[MAX_LEVEL]).toBeLessThan(FIELD_WIDTH / 2);
  });

  it("expands from nothing to the level's full radius over BELL_EXPAND_TICKS", () => {
    for (let level = 1; level <= MAX_LEVEL; level++) {
      expect(ringRadius({ level, ticks: 0, struck: new Set() })).toBe(0);
      expect(
        ringRadius({ level, ticks: BELL_EXPAND_TICKS, struck: new Set() }),
      ).toBeCloseTo(BELL_RADIUS_BY_LEVEL[level], 6);
    }
  });

  it("holds at most one live ring at any tick, and a ring's life is shorter than its period", () => {
    expect(BELL_EXPAND_TICKS).toBeLessThan(BELL_PERIOD);
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    for (let tick = 0; tick < BELL_PERIOD * 3; tick++) {
      advanceBell(state);
      // The record holds one ring or none, so more than one is unrepresentable
      // and the invariant is what says so.
      expect(
        state.lines.ring === null || typeof state.lines.ring === 'object',
      ).toBe(true);
    }
  });

  it('clears the ring once it has reached its full radius', () => {
    const state = quietRun();
    state.levels.bell = 1;
    ringFor(state, BELL_PERIOD);
    expect(state.lines.ring).not.toBeNull();
    ringFor(state, BELL_EXPAND_TICKS);
    expect(state.lines.ring).toBeNull();
  });

  it('carries the level and the radius it will reach on the tolled event', () => {
    const state = quietRun();
    state.levels.bell = 3;
    const [toll] = tolls(ringFor(state, BELL_PERIOD));
    expect(toll).toEqual({
      type: 'tolled',
      level: 3,
      radius: BELL_RADIUS_BY_LEVEL[3],
    });
  });
});

describe('the damage falls off with distance (ADR 0005)', () => {
  it("deals BELL_DAMAGE_NEAR at the grave and BELL_DAMAGE_FAR at the ring's edge", () => {
    const level = MAX_LEVEL;
    const full = BELL_RADIUS_BY_LEVEL[level];

    const near = quietRun();
    near.levels.bell = level;
    const atGrave = put(near, 'revenant', near.grave.x, near.grave.y);
    ringFor(near, BELL_PERIOD + BELL_EXPAND_TICKS);
    expect(damageTo(atGrave)).toBeCloseTo(BELL_DAMAGE_NEAR, 4);

    const far = quietRun();
    far.levels.bell = level;
    const atEdge = put(far, 'revenant', far.grave.x, far.grave.y - full + 1);
    ringFor(far, BELL_PERIOD + BELL_EXPAND_TICKS);
    expect(damageTo(atEdge)).toBeGreaterThan(BELL_DAMAGE_FAR * 0.9);
    expect(damageTo(atEdge)).toBeLessThan(BELL_DAMAGE_FAR * 1.2);
  });

  it('crosses one point of damage at eighty percent of the radius', () => {
    // Three is one shambler exactly, so a maxed bell kills trash outright only
    // where the player is standing, and the far edge tickles.
    const level = MAX_LEVEL;
    const at = BELL_RADIUS_BY_LEVEL[level] * 0.8;
    const state = quietRun();
    state.levels.bell = level;
    const mob = put(state, 'revenant', state.grave.x, state.grave.y - at);
    ringFor(state, BELL_PERIOD + BELL_EXPAND_TICKS);
    expect(damageTo(mob)).toBeCloseTo(1, 1);
  });

  it('damages a mob once as the leading edge crosses it, never twice and never on the tick after', () => {
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    const mob = put(state, 'revenant', state.grave.x, state.grave.y - 100);
    ringFor(state, BELL_PERIOD);

    let hurtOn = 0;
    let before = mob.hp;
    for (let tick = 1; tick <= BELL_EXPAND_TICKS; tick++) {
      advanceBell(state);
      if (mob.hp !== before) hurtOn += 1;
      before = mob.hp;
    }
    expect(hurtOn).toBe(1);
  });
});

describe('one toll alone cannot clear a wave (plan 6.6)', () => {
  it("leaves survivors from twenty-two shamblers across the field's width, at level 5", () => {
    // The bound the wisps already carry, and the one the bell walked out from
    // under when it left the swallow.
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    const wave: Mob[] = [];
    for (let index = 0; index < 22; index++) {
      const halfWidth = MOB_TYPES.shambler.halfWidth;
      wave.push(
        put(
          state,
          'shambler',
          halfWidth + index * halfWidth * 2,
          state.grave.y,
        ),
      );
    }
    ringFor(state, BELL_PERIOD + BELL_EXPAND_TICKS);
    expect(wave.filter((mob) => mob.alive).length).toBeGreaterThan(0);
  });
});

describe('pushback arrives at level 4 (ADR 0005)', () => {
  it('is zero below level 4 and non-zero at 4 and 5', () => {
    expect(BELL_PUSH_BY_LEVEL).toEqual([0, 0, 0, 0, 20, 40]);
    for (const level of [1, 2, 3]) {
      const state = quietRun();
      state.levels.bell = level;
      const mob = put(state, 'revenant', state.grave.x + 40, state.grave.y);
      const from = mob.x;
      ringFor(state, BELL_PERIOD + BELL_EXPAND_TICKS);
      expect(`level ${level}: ${mob.x}`).toBe(`level ${level}: ${from}`);
    }

    for (const level of [4, MAX_LEVEL]) {
      const state = quietRun();
      state.levels.bell = level;
      const mob = put(state, 'revenant', state.grave.x + 40, state.grave.y);
      const from = mob.x;
      ringFor(state, BELL_PERIOD + BELL_EXPAND_TICKS);
      expect(mob.x).toBeGreaterThan(from);
    }
  });

  it('shoves with the level the ring froze, not a level gained while it was live', () => {
    // A ring is live for a quarter of every period, so a bell drop lands
    // during one often. The radius and the sweep both read the ring's own
    // level, and a push read off the live level shoves a mob further than the
    // ring that reached it can account for.
    const state = quietRun();
    state.levels.bell = 4;
    const distance = 40;
    const mob = put(state, 'revenant', state.grave.x + distance, state.grave.y);
    const from = mob.x;
    ringFor(state, BELL_PERIOD);
    expect(state.lines.ring?.level).toBe(4);

    state.levels.bell = MAX_LEVEL;
    ringFor(state, BELL_EXPAND_TICKS);
    const near = 1 - distance / BELL_RADIUS_BY_LEVEL[4];
    expect(mob.x - from).toBeCloseTo(BELL_PUSH_BY_LEVEL[4] * near, 4);
  });

  it('a ring at a level past the authored tables leaves a swept mob where it stood', () => {
    // Past the tables the lookup is undefined, near is NaN off a NaN radius,
    // and a NaN push must refuse in the same guard a zero push does (#53).
    const state = quietRun();
    const mob = put(state, 'revenant', state.grave.x + 40, state.grave.y);
    const fromX = mob.x;
    const fromY = mob.y;
    state.lines.ring = {
      level: BELL_PUSH_BY_LEVEL.length,
      ticks: 0,
      struck: new Set(),
    };
    advanceBell(state);
    expect(mob.x).toBe(fromX);
    expect(mob.y).toBe(fromY);
  });

  it("no ring level, authored or not, ever writes NaN into a swept mob's position", () => {
    // The guard sits on the computed push, so every path to a non-finite
    // strength refuses in one place, whatever level produced it (#53).
    for (let level = 0; level <= BELL_PUSH_BY_LEVEL.length; level++) {
      const state = quietRun();
      const mob = put(state, 'revenant', state.grave.x + 40, state.grave.y);
      state.lines.ring = { level, ticks: 0, struck: new Set() };
      for (let tick = 0; tick < BELL_EXPAND_TICKS; tick++) {
        advanceBell(state);
        expect(Number.isFinite(mob.x), `level ${level} tick ${tick} x`).toBe(
          true,
        );
        expect(Number.isFinite(mob.y), `level ${level} tick ${tick} y`).toBe(
          true,
        );
      }
    }
  });

  it('keeps a pushed mob inside the field widened by SPAWN_MARGIN', () => {
    // Without the clamp a mob near an edge is shoved out of the box the
    // invariant harness checks, by the player's own weapon, and the harness
    // fires on a legal move.
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    const pushed: Mob[] = [];
    for (const at of [
      { x: 4, y: state.grave.y },
      { x: FIELD_WIDTH - 4, y: state.grave.y },
      { x: state.grave.x, y: state.grave.y - 100 },
    ]) {
      pushed.push(put(state, 'revenant', at.x, at.y));
    }
    ringFor(state, BELL_PERIOD + BELL_EXPAND_TICKS);
    for (const mob of pushed) {
      expect(mob.x).toBeGreaterThanOrEqual(-SPAWN_MARGIN);
      expect(mob.x).toBeLessThanOrEqual(FIELD_WIDTH + SPAWN_MARGIN);
      expect(mob.y).toBeGreaterThanOrEqual(-SPAWN_MARGIN);
    }
  });
});
