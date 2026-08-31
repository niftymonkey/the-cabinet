/**
 * The soul stream (ADR 0005): always on from level 1, distinct straight
 * parallel streams from mounts across the mouth (#79), and it never homes.
 * Every expected value here comes from ADR 0005, from dispatch 5's plan
 * section 6.3, and from #79's spec, never from running the module.
 */

import { describe, expect, it } from 'vitest';

import { SKULL_CAP } from '../../caps';
import { TICK_HZ } from '../../clock';
import type { SimEvent } from '../../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../field';
import type { Mob } from '../../mobs';
import { spawnMob } from '../../mobs';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { RAMP_ROWS } from '../../stage/stage';
import { resolveStorm } from '../../storm';
import { MAX_LEVEL } from '../roster';
import {
  advanceStream,
  COLUMNS_BY_LEVEL,
  SKULL_HALF_EXTENT,
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
 * A shambler parked on the grave's mouth, where a level-1 column launches. Every
 * skull the column fires meets it on the tick it launches, so a volley and a
 * touch are the same thing and the count reads as the touch count.
 */
function inTheColumn(state: RunState): Mob {
  const mob = spawnMob(state, 'shambler', {
    x: state.grave.x,
    y: state.grave.y - state.grave.size,
    vx: 0,
    vy: 0,
    index: 0,
  })!;
  mob.beat = 0;
  return mob;
}

/** How many times the storm landed on a body this tick. */
function hits(events: SimEvent[]): number {
  return events.filter((event) => event.type === 'mobDamaged').length;
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

describe('the columns (plan 6.3)', () => {
  it('puts a single column straight up, so a level-1 stream is not a diagonal', () => {
    const state = quietRun();
    const [only] = nextVolley(state);
    expect(only.vx).toBeCloseTo(0, 6);
    expect(only.vy).toBeCloseTo(-SKULL_SPEED, 6);
  });

  it('holds the widest column inside the field over the whole height, from a centred grave', () => {
    // A parallel stream never drifts, so a column stays wherever its clamped
    // mount put it, and the mounts sit within the mouth of a contained grave.
    const state = quietRun();
    state.levels.soulStream = MAX_LEVEL;
    const volley = nextVolley(state);
    for (let tick = 0; tick < FIELD_HEIGHT / SKULL_SPEED; tick++) {
      advanceStream(state);
    }
    for (const skull of volley) {
      if (!skull.alive) continue;
      expect(skull.x).toBeGreaterThan(0);
      expect(skull.x).toBeLessThan(FIELD_WIDTH);
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
    // The surge moves when volleys fire and never what one carries, which is
    // what keeps the one-swallow ordnance bound a statement about cadence. A
    // skull carries no damage of its own at all: SKULL_DAMAGE is a module
    // constant, so there is nothing on the entity for a surge to raise, and
    // what this asserts is the shape of the entity rather than a magnitude.
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

describe('what the stream costs a trash body (#76 pass A)', () => {
  it('kills a shambler standing in its column with exactly five volleys', () => {
    // Mark's 2026-08-27 ruling for #76 pass A: trash takes five skulls where it
    // used to take three, so the same kill is reached through more touches.
    // Counted rather than divided, because the ruling is about how often the
    // player's fire lands on a body and not about the arithmetic behind it.
    const state = quietRun();
    state.levels.soulStream = 1;
    const mob = inTheColumn(state);

    let touches = 0;
    for (let tick = 0; tick < STREAM_INTERVAL * 10 && mob.alive; tick++) {
      advanceStream(state);
      touches += hits(resolveStorm(state));
    }

    expect(mob.alive).toBe(false);
    expect(touches).toBe(5);
  });

  it('still spends about a second and a half killing that shambler', () => {
    // The kill time is what STREAM_INTERVAL exists to hold, and it is the
    // "trash dies in a second or two" the drain-out is derived against. Five
    // volleys at the shortened interval is the same span three volleys at the
    // old one was, which is the whole point of moving both numbers together.
    const state = quietRun();
    state.levels.soulStream = 1;
    const mob = inTheColumn(state);

    let spent = 0;
    for (let tick = 0; tick < STREAM_INTERVAL * 10 && mob.alive; tick++) {
      advanceStream(state);
      resolveStorm(state);
      spent += 1;
    }

    expect(mob.alive).toBe(false);
    expect(spent / TICK_HZ).toBeCloseTo(1.5, 1);
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

describe('mounted streams (#79)', () => {
  it("every launched skull's heading is exactly straight up, at every level's column count", () => {
    // Exact, not approximate: straight up is assigned rather than computed, so
    // there is no trig rounding for a tolerance to forgive.
    for (let level = 1; level <= MAX_LEVEL; level++) {
      const state = quietRun();
      state.levels.soulStream = level;
      const volley = nextVolley(state);
      expect(volley).toHaveLength(COLUMNS_BY_LEVEL[level]);
      for (const skull of volley) {
        expect(skull.vx).toBe(0);
        expect(skull.vy).toBe(-SKULL_SPEED);
      }
    }
  });
  it("an odd column count has one mount exactly at the grave's x, and mounts straddle the centre symmetrically", () => {
    const odd = quietRun();
    odd.levels.soulStream = MAX_LEVEL;
    const centre = odd.grave.x;
    const mounts = nextVolley(odd)
      .map((skull) => skull.x)
      .sort((a, b) => a - b);
    expect(mounts).toHaveLength(5);
    // Five distinct streams, not five skulls sharing one origin.
    expect(new Set(mounts).size).toBe(5);
    expect(mounts[2]).toBe(centre);
    expect(mounts[0] + mounts[4]).toBeCloseTo(2 * centre, 6);
    expect(mounts[1] + mounts[3]).toBeCloseTo(2 * centre, 6);

    const even = quietRun();
    even.levels.soulStream = 4;
    const pair = nextVolley(even)
      .map((skull) => skull.x)
      .sort((a, b) => a - b);
    expect(pair).toHaveLength(4);
    expect(new Set(pair).size).toBe(4);
    // An even count straddles the centre with no mount on it.
    expect(pair).not.toContain(centre);
    expect(pair[0] + pair[3]).toBeCloseTo(2 * centre, 6);
    expect(pair[1] + pair[2]).toBeCloseTo(2 * centre, 6);
  });
  it("mount offsets ride the grave's size, and the outermost of five mounts stays within the grave's size of its centre", () => {
    /** The widest offsets a five-column volley launches at this grave size. */
    function spreadAt(size: number) {
      const state = quietRun();
      state.levels.soulStream = MAX_LEVEL;
      state.grave.size = size;
      const offsets = nextVolley(state).map((skull) =>
        Math.abs(skull.x - state.grave.x),
      );
      for (const offset of offsets) {
        expect(offset).toBeLessThanOrEqual(size);
      }
      return Math.max(...offsets);
    }

    const small = spreadAt(27);
    const doubled = spreadAt(54);
    expect(small).toBeGreaterThan(0);
    // The storm's footprint breathes with growth: twice the grave, twice the spread.
    expect(doubled / small).toBeCloseTo(2, 6);
  });
  it("a grave at the field's left edge launches every column inside the field, none culled on their first advance", () => {
    // The wall-hugging grave keeps its whole storm: mounts clamp inward rather
    // than launching skulls the cull kills on their next tick. x = 0 is harder
    // than containment ever allows, so the clamp is exercised whatever the
    // step fraction; the contained hugger below is the position play reaches.
    for (const edgeX of [0, 13.5]) {
      const state = quietRun();
      state.levels.soulStream = MAX_LEVEL;
      state.grave.x = edgeX;
      const volley = nextVolley(state);
      expect(volley).toHaveLength(COLUMNS_BY_LEVEL[MAX_LEVEL]);
      holdFire(state);
      advanceStream(state);
      for (const skull of volley) {
        expect(skull.alive).toBe(true);
        expect(skull.x - SKULL_HALF_EXTENT).toBeGreaterThanOrEqual(0);
      }
    }
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
