/**
 * The headstones (ADR 0005): always on from level 1, last-ditch close defense,
 * counter-rotating rings at the higher levels. Expected values come from ADR
 * 0005 and dispatch 5's plan section 6.4.
 */

import { describe, expect, it } from 'vitest';

import { graveHitbox, graveWidth } from '../../grave';
import { atan2 } from '../../math';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { RAMP_ROWS } from '../../stage/stage';
import { SIZE_CEILING, SIZE_FLOOR } from '../../tuning';
import {
  advanceHeadstones,
  headstoneAt,
  MAX_STONES,
  ORBIT_TICKS,
  RING_CAPACITY,
  STONE_RECHARGE,
  STONE_STANDOFF,
  stoneCount,
  STONES_BY_LEVEL,
} from '../headstones';
import { MAX_LEVEL } from '../roster';

function quietRun(seed = 6): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

function stonesOf(state: RunState): { x: number; y: number }[] {
  const stones: { x: number; y: number }[] = [];
  for (let index = 0; index < MAX_STONES; index++) {
    const at = headstoneAt(state, index);
    if (at !== null) stones.push(at);
  }
  return stones;
}

/**
 * How far round the grave a stone stands, in radians. Measured through math.ts,
 * so this file needs no carve-out from the rule that keeps the sim off raw
 * implementation-approximated operations.
 */
function bearing(state: RunState, at: { x: number; y: number }): number {
  return atan2(at.y - state.grave.y, at.x - state.grave.x);
}

/** The shorter way round the circle, signed, so a ring's direction of travel reads. */
function turned(from: number, to: number): number {
  let delta = to - from;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  return delta;
}

describe('the stone count per level (plan 6.4)', () => {
  it('is the declared table, from one at level 1 to six at level 5', () => {
    expect(STONES_BY_LEVEL).toEqual([0, 1, 2, 3, 4, 6]);
    for (let level = 0; level <= MAX_LEVEL; level++) {
      const state = quietRun();
      state.levels.headstones = level;
      expect(`level ${level}: ${stonesOf(state).length}`).toBe(
        `level ${level}: ${STONES_BY_LEVEL[level]}`,
      );
      expect(stoneCount(state)).toBe(STONES_BY_LEVEL[level]);
    }
  });

  it('splits levels 4 and 5 across two rings, the first holding no more than RING_CAPACITY', () => {
    // The concept doc's endpoints are one slow stone and six in two rings, so
    // the first ring fills to three and a second opens at level 4.
    for (const level of [4, MAX_LEVEL]) {
      const state = quietRun();
      state.levels.headstones = level;
      const stones = stonesOf(state);
      const first = stones.slice(0, RING_CAPACITY);
      const second = stones.slice(RING_CAPACITY);
      expect(first).toHaveLength(RING_CAPACITY);
      expect(second).toHaveLength(STONES_BY_LEVEL[level] - RING_CAPACITY);
    }
  });

  it('keeps a level below 4 on one ring alone', () => {
    for (const level of [1, 2, 3]) {
      const state = quietRun();
      state.levels.headstones = level;
      expect(stonesOf(state).length).toBeLessThanOrEqual(RING_CAPACITY);
    }
  });
});

describe('the two rings counter-rotate (ADR 0005)', () => {
  it('carries the second ring the opposite way round from the first', () => {
    const state = quietRun();
    state.levels.headstones = MAX_LEVEL;
    const before = stonesOf(state).map((at) => bearing(state, at));
    for (let tick = 0; tick < 10; tick++) advanceHeadstones(state);
    const after = stonesOf(state).map((at) => bearing(state, at));

    const first = turned(before[0], after[0]);
    const second = turned(before[RING_CAPACITY], after[RING_CAPACITY]);
    expect(first).not.toBe(0);
    expect(Math.sign(first)).toBe(-Math.sign(second));
    expect(Math.abs(first)).toBeCloseTo(Math.abs(second), 6);
  });
});

describe('the orbit clears the grave (plan 6.4)', () => {
  it("clears the grave's own hitbox on both axes, at the size floor and at the size ceiling", () => {
    // The elliptical orbit is what makes this true on the second axis. The
    // radii are the grave's own half-extents pushed out by a fixed margin, so
    // the clearance is STONE_STANDOFF at both ends of the size range rather
    // than shrinking as the grave grows.
    for (const size of [SIZE_FLOOR, SIZE_CEILING]) {
      const state = quietRun();
      state.levels.headstones = MAX_LEVEL;
      state.grave.size = size;
      const box = graveHitbox(state.grave);
      let widest = 0;
      let deepest = 0;
      for (let tick = 0; tick < ORBIT_TICKS; tick++) {
        advanceHeadstones(state);
        for (const at of stonesOf(state)) {
          widest = Math.max(widest, Math.abs(at.x - state.grave.x));
          deepest = Math.max(deepest, Math.abs(at.y - state.grave.y));
        }
      }
      expect(widest - box.width / 2).toBeCloseTo(STONE_STANDOFF, 4);
      expect(deepest - box.height / 2).toBeCloseTo(STONE_STANDOFF, 4);
    }
  });

  it('would pass straight through the grave vertically on a circular orbit, which is why it is elliptical', () => {
    // The defect the ellipse exists to answer, stated as arithmetic rather than
    // as intent: a circle sized to clear the rim across sits well inside the
    // grave's own height at the size ceiling, so a stone on it would spend half
    // its revolution invisible inside the mouth.
    const circular = graveWidth(SIZE_CEILING) / 2 + STONE_STANDOFF;
    expect(circular).toBeLessThan(SIZE_CEILING);
  });

  it("stands the path a fixed standoff outside the grave's own half-extents", () => {
    const state = quietRun();
    state.levels.headstones = 1;
    const across: number[] = [];
    const down: number[] = [];
    for (let tick = 0; tick < ORBIT_TICKS; tick++) {
      advanceHeadstones(state);
      const [at] = stonesOf(state);
      across.push(Math.abs(at.x - state.grave.x));
      down.push(Math.abs(at.y - state.grave.y));
    }
    expect(Math.max(...across)).toBeCloseTo(
      graveWidth(state.grave.size) / 2 + STONE_STANDOFF,
      6,
    );
    expect(Math.max(...down)).toBeCloseTo(state.grave.size + STONE_STANDOFF, 6);
  });
});

describe("the orbit's clock (plan 6.4)", () => {
  it('comes back to where it started after exactly ORBIT_TICKS', () => {
    const state = quietRun();
    state.levels.headstones = 1;
    const [start] = stonesOf(state);
    for (let tick = 0; tick < ORBIT_TICKS; tick++) advanceHeadstones(state);
    const [end] = stonesOf(state);
    expect(end.x).toBeCloseTo(start.x, 4);
    expect(end.y).toBeCloseTo(start.y, 4);
  });

  it('wraps the phase into zero to two pi rather than growing without bound', () => {
    // A phase that grew all run would lose precision in a long one, and the
    // orbit is on the digest's path every tick of every run.
    const state = quietRun();
    state.levels.headstones = 1;
    for (let tick = 0; tick < ORBIT_TICKS * 20; tick++) {
      advanceHeadstones(state);
      expect(state.lines.orbitPhase).toBeGreaterThanOrEqual(0);
      expect(state.lines.orbitPhase).toBeLessThan(2 * Math.PI);
    }
  });
});

describe('a stone that hits (plan 6.4)', () => {
  it('goes inert for STONE_RECHARGE and recovers, without the mob carrying any cooldown', () => {
    const state = quietRun();
    state.levels.headstones = 1;
    state.lines.stoneRecharge[0] = STONE_RECHARGE;
    for (let tick = 0; tick < STONE_RECHARGE - 1; tick++) {
      advanceHeadstones(state);
      expect(state.lines.stoneRecharge[0]).toBeGreaterThan(0);
    }
    advanceHeadstones(state);
    expect(state.lines.stoneRecharge[0]).toBe(0);
  });

  it('keeps drawing while inert, because a spent defense the player cannot see is a lie', () => {
    const state = quietRun();
    state.levels.headstones = 1;
    state.lines.stoneRecharge[0] = STONE_RECHARGE;
    advanceHeadstones(state);
    expect(headstoneAt(state, 0)).not.toBeNull();
  });

  it('never lets a recharge fall below zero', () => {
    const state = quietRun();
    state.levels.headstones = MAX_LEVEL;
    for (let tick = 0; tick < 10; tick++) advanceHeadstones(state);
    for (const recharge of state.lines.stoneRecharge) {
      expect(recharge).toBe(0);
    }
  });
});
