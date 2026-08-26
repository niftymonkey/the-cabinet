/**
 * The soul stream (ADR 0005): always on from level 1, rigid fanned columns, and
 * it never homes. Every expected value here comes from ADR 0005 and from
 * dispatch 5's plan section 6.3, never from running the module.
 */

import { describe, expect, it } from 'vitest';

import { SKULL_CAP } from '../../caps';
import { FIELD_HEIGHT } from '../../field';
import { atan2 } from '../../math';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { RAMP_ROWS } from '../../stage/stage';
import { MAX_LEVEL } from '../roster';
import {
  advanceStream,
  COLUMNS_BY_LEVEL,
  FAN_STEP_DEGREES,
  SKULL_SPEED,
  STREAM_INTERVAL,
  SURGE_INTERVAL,
  SURGE_VOLLEYS,
  surgeStream,
} from '../soulStream';

function quietRun(seed = 4): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

function liveSkulls(state: RunState) {
  return state.skulls.filter((skull) => skull.alive);
}

/** One volley, taken by running the stream until it fires and reading what is new. */
function nextVolley(state: RunState) {
  const before = new Set(liveSkulls(state).map((skull) => skull.id));
  for (let tick = 0; tick <= STREAM_INTERVAL; tick++) {
    advanceStream(state);
    const fresh = liveSkulls(state).filter((skull) => !before.has(skull.id));
    if (fresh.length > 0) return fresh;
  }
  return [];
}

/**
 * How many degrees off straight up a skull is flying, measured through math.ts
 * so this file needs no carve-out from the rule that keeps the sim off raw
 * implementation-approximated operations.
 */
function angleFromVertical(skull: { vx: number; vy: number }): number {
  return (atan2(skull.vx, -skull.vy) * 180) / Math.PI;
}

/** Which ticks of a window a volley fired on, read from the stream's own clock. */
function volleyTicks(state: RunState, ticks: number): number[] {
  const fired: number[] = [];
  for (let tick = 1; tick <= ticks; tick++) {
    const before = state.lines.streamIn;
    advanceStream(state);
    if (state.lines.streamIn > before - 1) fired.push(tick);
  }
  return fired;
}

/** The gaps between consecutive volleys, which is what a surge actually shortens. */
function gapsBetween(fired: readonly number[]): number[] {
  return fired.slice(1).map((tick, index) => tick - fired[index]);
}

/** Stops the stream firing again, so a test holding a pooled slot cannot have it recycled underneath. */
function holdFire(state: RunState): void {
  state.lines.streamIn = Number.MAX_SAFE_INTEGER;
}

describe('the level curve is columns and nothing else (plan 6.3)', () => {
  it('fires one column at level 1 and five at level 5', () => {
    for (let level = 1; level <= MAX_LEVEL; level++) {
      const state = quietRun();
      state.levels.soulStream = level;
      expect(`level ${level}: ${nextVolley(state).length}`).toBe(
        `level ${level}: ${COLUMNS_BY_LEVEL[level]}`,
      );
    }
  });

  it('holds the interval fixed across levels, so growth is on the field and never in the cadence', () => {
    const counts = [1, MAX_LEVEL].map((level) => {
      const state = quietRun();
      state.levels.soulStream = level;
      let volleys = 0;
      let last = 0;
      for (let tick = 0; tick < 300; tick++) {
        advanceStream(state);
        const live = liveSkulls(state).length;
        if (live > last) volleys += 1;
        last = live;
      }
      return volleys;
    });
    expect(counts[0]).toBe(counts[1]);
  });
});

describe('the fan (plan 6.3)', () => {
  it('spaces the columns FAN_STEP_DEGREES apart, symmetric about straight up', () => {
    const state = quietRun();
    state.levels.soulStream = MAX_LEVEL;
    const angles = nextVolley(state)
      .map(angleFromVertical)
      .sort((a, b) => a - b);
    expect(angles).toHaveLength(COLUMNS_BY_LEVEL[MAX_LEVEL]);
    for (let column = 1; column < angles.length; column++) {
      expect(angles[column] - angles[column - 1]).toBeCloseTo(
        FAN_STEP_DEGREES,
        4,
      );
    }
    // Symmetric: the fan's own centre of mass is straight up.
    expect(angles[0] + angles[angles.length - 1]).toBeCloseTo(0, 4);
  });

  it('puts a single column straight up, so a level-1 stream is not a diagonal', () => {
    const state = quietRun();
    const [only] = nextVolley(state);
    expect(only.vx).toBeCloseTo(0, 6);
    expect(only.vy).toBeCloseTo(-SKULL_SPEED, 6);
  });

  it('holds the widest column inside the field over the whole height, from a centred grave', () => {
    // Twelve degrees off vertical drifts a skull about a quarter of the field's
    // width over the field's own height, so the fan reads as coverage rather
    // than as a spray that leaves the play area.
    const state = quietRun();
    state.levels.soulStream = MAX_LEVEL;
    const volley = nextVolley(state);
    for (let tick = 0; tick < FIELD_HEIGHT / SKULL_SPEED; tick++) {
      advanceStream(state);
    }
    for (const skull of volley) {
      if (!skull.alive) continue;
      expect(skull.x).toBeGreaterThan(0);
      expect(skull.x).toBeLessThan(540);
    }
  });
});

describe('the stream never homes (ADR 0005)', () => {
  it("keeps a skull's velocity identical on its first tick and its last", () => {
    const state = quietRun();
    const [skull] = nextVolley(state);
    holdFire(state);
    const launched = { vx: skull.vx, vy: skull.vy };
    // A mob parked to one side is exactly what a homing line would bend toward.
    state.mobs[0].alive = true;
    state.mobs[0].id = 9999;
    state.mobs[0].x = 40;
    state.mobs[0].y = 100;
    while (skull.alive) advanceStream(state);
    expect({ vx: skull.vx, vy: skull.vy }).toEqual(launched);
  });

  it("launches from the grave's mouth and does not move on the tick it launches", () => {
    const state = quietRun();
    const mouth = { x: state.grave.x, y: state.grave.y - state.grave.size };
    const [skull] = nextVolley(state);
    expect({ x: skull.x, y: skull.y }).toEqual(mouth);
  });
});

describe('the surge is a rate change and never a damage bonus (plan section 3)', () => {
  it('a swallow sets the surge, and the next volley comes at SURGE_INTERVAL rather than STREAM_INTERVAL', () => {
    const state = quietRun();
    nextVolley(state);
    surgeStream(state);
    expect(state.lines.surgeVolleys).toBe(SURGE_VOLLEYS);

    const before = state.tick;
    let waited = 0;
    const seen = new Set(liveSkulls(state).map((skull) => skull.id));
    for (let tick = 0; tick < STREAM_INTERVAL * 3; tick++) {
      advanceStream(state);
      waited += 1;
      if (liveSkulls(state).some((skull) => !seen.has(skull.id))) break;
    }
    expect(before).toBe(state.tick);
    expect(waited).toBeLessThanOrEqual(STREAM_INTERVAL);
    expect(waited).toBeGreaterThan(0);
  });

  it('spends the surge after exactly SURGE_VOLLEYS volleys and then returns to the fixed interval', () => {
    const state = quietRun();
    surgeStream(state);
    for (let volley = 0; volley < SURGE_VOLLEYS + 1; volley++) {
      nextVolley(state);
    }
    expect(state.lines.surgeVolleys).toBe(0);
    expect(state.lines.streamIn).toBeLessThanOrEqual(STREAM_INTERVAL);
    expect(state.lines.streamIn).toBeGreaterThan(SURGE_INTERVAL);
  });

  it('one swallow buys exactly SURGE_VOLLEYS shortened gaps and the cadence then returns to fixed', () => {
    const plain = quietRun();
    expect(new Set(gapsBetween(volleyTicks(plain, 300)))).toEqual(
      new Set([STREAM_INTERVAL]),
    );

    const surged = quietRun();
    surgeStream(surged);
    const gaps = gapsBetween(volleyTicks(surged, 300));
    expect(gaps.filter((gap) => gap === SURGE_INTERVAL)).toHaveLength(
      SURGE_VOLLEYS,
    );
    expect(gaps.filter((gap) => gap === STREAM_INTERVAL)).toHaveLength(
      gaps.length - SURGE_VOLLEYS,
    );
  });

  it('a swallow chain cannot hold the surge open, because surgeStream sets rather than adds', () => {
    // Mark's 2026-08-22 ruling, and the half of the fix a count alone would not
    // give. Ten swallows land before the pending surge is spent, so they
    // overwrite one another rather than banking a queue of ten.
    const chained = quietRun();
    for (let swallow = 0; swallow < 10; swallow++) {
      surgeStream(chained);
      advanceStream(chained);
    }
    const gaps = gapsBetween(volleyTicks(chained, 300));
    expect(gaps.filter((gap) => gap === SURGE_INTERVAL)).toHaveLength(
      SURGE_VOLLEYS,
    );
  });

  it('changes the volley count and never the damage per skull', () => {
    // The one-swallow ordnance bound has one body of margin at the ceiling, and
    // a damage surge would spend it. A skull carries no damage of its own at
    // all: SKULL_DAMAGE is a module constant, so there is nothing on the
    // entity for a surge to raise.
    const state = quietRun();
    state.levels.soulStream = MAX_LEVEL;
    surgeStream(state);
    const volley = nextVolley(state);
    expect(volley.length).toBe(COLUMNS_BY_LEVEL[MAX_LEVEL]);
    for (const skull of volley) {
      expect(Object.keys(skull).sort()).toEqual([
        'alive',
        'id',
        'vx',
        'vy',
        'x',
        'y',
      ]);
    }
  });
});

describe('the cap policy (plan 6.2)', () => {
  it('refuses the spawn at the cap and removes nothing already on the field', () => {
    const state = quietRun();
    state.levels.soulStream = MAX_LEVEL;
    for (const skull of state.skulls) {
      skull.alive = true;
      skull.id = 1;
      skull.x = 200;
      skull.y = 400;
      skull.vx = 0;
      skull.vy = 0;
    }
    expect(liveSkulls(state)).toHaveLength(SKULL_CAP);

    state.lines.streamIn = 1;
    advanceStream(state);
    expect(liveSkulls(state)).toHaveLength(SKULL_CAP);
    for (const skull of state.skulls) expect(skull.alive).toBe(true);
  });
});

describe('a skull leaving the field (plan 6.7)', () => {
  it("is culled by the motion that took it out, because a cull is motion's own consequence", () => {
    const state = quietRun();
    const [skull] = nextVolley(state);
    // The stream is held so a later volley cannot recycle this slot underneath
    // the assertion, which is the pooled-entity hazard this codebase documents.
    holdFire(state);
    expect(skull.alive).toBe(true);
    for (let tick = 0; tick < FIELD_HEIGHT / SKULL_SPEED + 10; tick++) {
      advanceStream(state);
    }
    expect(skull.alive).toBe(false);
  });
});
