/**
 * The bell (ADR 0005, ADR 0036): always on from level 1, on its own clock,
 * never fired by a swallow, and what it throws is cones. Expected values come
 * from ADR 0036 and step 1's plan section 8; the rows themselves are initial
 * data the harness tunes, so what is pinned here is the shape and never a
 * magnitude the harness owns.
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../field';
import { cos, sin } from '../../math';
import type { Mob, MobType } from '../../mobs';
import { advanceMobs, MOB_TYPES, SPAWN_MARGIN, spawnMob } from '../../mobs';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { SHOVE_TICKS } from '../../shove';
import { PROCESSION_WAVES } from '../../stage/waves';
import type { BellToll, ConeRow } from '../bell';
import {
  advanceBell,
  BELL_CONE_ROWS,
  BELL_DAMAGE_FAR_BY_LEVEL,
  BELL_DAMAGE_NEAR_BY_LEVEL,
  bellDamageFar,
  bellDamageNear,
  BELL_EXPAND_TICKS,
  BELL_PERIOD,
  coneHeading,
  insideCone,
  tollReach,
} from '../bell';
import { BIRTHRIGHT_LEVEL, MAX_LEVEL } from '../roster';

const RADIANS_PER_DEGREE = Math.PI / 180;

/** Narrows a possibly-absent value, or fails loudly when the absence is a bug. */
function requireDefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

/** The row a level throws, for a level this file only ever asks about in range. */
function rowAt(level: number): ConeRow {
  return requireDefined(BELL_CONE_ROWS[level], `no cone row at level ${level}`);
}

function quietRun(seed = 12): RunState {
  const run = createRun(seed);
  run.stage.firedWaves = PROCESSION_WAVES.length;
  return run;
}

function put(state: RunState, type: MobType, x: number, y: number): Mob {
  const mob = spawnMob(
    state,
    type,
    { x, y, vx: 0, vy: 1, index: 0 },
    false,
    'wave',
  )!;
  mob.beat = 0;
  return mob;
}

/**
 * A mob standing at a bearing from the grave, measured the way the rows are:
 * zero straight up the field, negative to the left.
 */
function putAtBearing(state: RunState, degrees: number, distance: number): Mob {
  const bearing = degrees * RADIANS_PER_DEGREE;
  return put(
    state,
    'revenant',
    state.grave.x + sin(bearing) * distance,
    state.grave.y - cos(bearing) * distance,
  );
}

/** Runs the bell alone for a window and returns everything it emitted. */
function tollFor(state: RunState, ticks: number): SimEvent[] {
  const events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) events.push(...advanceBell(state));
  return events;
}

/** One whole toll, from the clock firing it to its cones reaching full. */
function oneToll(state: RunState): SimEvent[] {
  return tollFor(state, BELL_PERIOD + BELL_EXPAND_TICKS);
}

/**
 * The bell and the bodies both, for a window. A shove is the body's own motion
 * from the moment it lands, so what the toll starts only travels once the mobs
 * advance, and a push read off advanceBell alone would read an empty set.
 *
 * The bodies advance before the bell, which is the order the tick itself keeps
 * (step.ts): a shove the toll starts is first travelled on the tick after,
 * exactly as a shot fired this tick does not also fly this tick. A helper that
 * ran them the other way round would model an order the sim does not have.
 */
function tollAndTravelFor(state: RunState, ticks: number): SimEvent[] {
  const events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    events.push(...advanceMobs(state));
    events.push(...advanceBell(state));
  }
  return events;
}

/**
 * One whole toll with the shoves it started carried all the way out. It runs
 * a shove's own length past the cones reaching full, because the edge can
 * reach the furthest body it will reach on the last tick of the expansion and
 * that body then travels for SHOVE_TICKS more.
 */
function oneTollAndTravel(state: RunState): SimEvent[] {
  return tollAndTravelFor(state, BELL_PERIOD + BELL_EXPAND_TICKS + SHOVE_TICKS);
}

/**
 * More health than any toll takes at any rung, so a push test measures the push
 * and never the damage. A shove spends itself over several ticks, so a body the
 * toll kills on the tick it reaches it is never carried anywhere at all, and at
 * the top rungs the toll kills a revenant outright. The bell's damage has its
 * own describe block below.
 */
const OUTLIVES_ANY_TOLL = 1e6;

/**
 * A body that stands exactly where it is put while the mobs advance, so what
 * moves it is the toll and nothing else.
 *
 * It holds its arriving beat for longer than any window here, which is the one
 * state ADR 0041 gives a body where its own rule does not run, and it carries
 * no velocity of its own to drift on. Every push figure below is then the
 * shove's whole travel rather than the shove plus a walk.
 */
function standStill(mob: Mob): Mob {
  mob.beat = Number.MAX_SAFE_INTEGER;
  mob.vx = 0;
  mob.vy = 0;
  return mob;
}

/**
 * A standing body with more health than any toll takes, for the push tests that
 * measure the travel and never the damage. The tests that measure what a rung
 * leaves alive stand a body still and keep its own health instead.
 */
function putStill(state: RunState, degrees: number, distance: number): Mob {
  const mob = standStill(putAtBearing(state, degrees, distance));
  mob.hp = OUTLIVES_ANY_TOLL;
  return mob;
}

/**
 * What each tick of a window carried this body, in field units, leaving out the
 * ticks it stood still. The bodies advance before the bell, which is the order
 * the tick itself keeps.
 */
function travelPerTick(state: RunState, mob: Mob, ticks: number): number[] {
  const steps: number[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    const fromX = mob.x;
    const fromY = mob.y;
    advanceMobs(state);
    advanceBell(state);
    const movedX = mob.x - fromX;
    const movedY = mob.y - fromY;
    const step = Math.sqrt(movedX * movedX + movedY * movedY);
    if (step > 0) steps.push(step);
  }
  return steps;
}

function tolls(events: SimEvent[]) {
  return events.filter((event) => event.type === 'tolled');
}

/** How much health a mob lost, which is the only way the toll's damage is visible. */
function damageTo(mob: Mob): number {
  return MOB_TYPES[mob.type].hp - mob.hp;
}

/** The widest heading of a level's fan, in degrees, which is how far it has wrapped. */
function wrapDegrees(level: number): number {
  const headings = rowAt(level).headings;
  return Math.max(...headings.map(Math.abs)) / RADIANS_PER_DEGREE;
}

describe("the toll's own clock (ADR 0005)", () => {
  it('fires on BELL_PERIOD regardless of swallows, kills, or anything else on the field', () => {
    // It left the swallow deliberately: on a timer the bell's damage rate is
    // its damage over its period, fixed and tunable, and it gives the player a
    // rhythm to position against.
    const state = quietRun();
    state.levels.bell = 1;
    const fired = tolls(tollFor(state, BELL_PERIOD * 3));
    expect(fired).toHaveLength(3);
  });

  it('does not toll at level 0, because the line arrives only through a power-up', () => {
    const state = quietRun();
    expect(state.levels.bell).toBe(0);
    expect(tolls(tollFor(state, BELL_PERIOD * 3))).toHaveLength(0);
    expect(state.lines.ring).toBeNull();
  });

  it('lands its first toll within one period of the line being dropped', () => {
    // The concept doc promises an audible toll from level 1, and this is its
    // watcher rather than a tuning intention.
    const state = quietRun();
    tollFor(state, 40);
    state.levels.bell = 1;
    expect(tolls(tollFor(state, BELL_PERIOD))).toHaveLength(1);
  });
});

describe('a toll throws cones (ADR 0036)', () => {
  it('throws one cone forward at level 1', () => {
    // "Level one throws one cone forward."
    expect(rowAt(1).headings).toHaveLength(1);
    expect(coneHeading(1, 0)).toBe(0);

    const state = quietRun();
    state.levels.bell = 1;
    const ahead = putAtBearing(state, 0, 60);
    oneToll(state);
    expect(damageTo(ahead)).toBeGreaterThan(0);
  });

  it('leaves the sides and the rear open at level 1', () => {
    // "The cost of a cone is knowingly taken at level one: the sides and the
    // rear are open." The deliberate-absence guard: what the cone declines is
    // as much the ruling as what it answers, and the presence half above is
    // what says the toll fired at all.
    const state = quietRun();
    state.levels.bell = 1;
    const aside = putAtBearing(state, 90, 60);
    const behind = putAtBearing(state, 180, 60);
    oneToll(state);
    expect(damageTo(aside)).toBe(0);
    expect(damageTo(behind)).toBe(0);
  });

  it('throws one more cone at each level, wrapping further toward the sides as they multiply', () => {
    // "Higher levels throw more of them, wrapping around toward the sides as
    // they multiply." The count is the level and the fan reaches wider every
    // step; the angles themselves are the harness's to tune.
    for (let level = 1; level <= MAX_LEVEL; level++) {
      expect(rowAt(level).headings).toHaveLength(level);
    }
    for (let level = 2; level <= MAX_LEVEL; level++) {
      expect(wrapDegrees(level)).toBeGreaterThan(wrapDegrees(level - 1));
    }
  });

  it('throws a fan symmetric about straight up, contiguous ahead below the top level', () => {
    // Symmetry is what keeps a player from ever learning a left-handed bell,
    // and contiguity is what keeps the arc ahead from growing a hole as the
    // harness edits the headings. Bearings are sampled on half degrees so the
    // seam where two cones exactly touch is never the thing under test: an
    // equality at a boundary is a float question, not a coverage one.
    for (let level = 1; level <= MAX_LEVEL; level++) {
      const headings = [...rowAt(level).headings].sort(
        (left, right) => left - right,
      );
      for (let index = 0; index < headings.length; index++) {
        const mirrored = requireDefined(
          headings[headings.length - 1 - index],
          'mirrored heading out of range',
        );
        const heading = requireDefined(headings[index], 'heading out of range');
        expect(heading).toBeCloseTo(-mirrored, 9);
      }
    }

    for (const level of [1, 2, 3, 4]) {
      const edge =
        wrapDegrees(level) + rowAt(level).halfAngle / RADIANS_PER_DEGREE;
      for (let degrees = -edge + 0.5; degrees < edge; degrees += 1) {
        expect(
          insideCone(level, degrees * RADIANS_PER_DEGREE),
          `level ${level} at ${degrees} degrees`,
        ).toBe(true);
      }
    }
  });

  it('has the whole surround back at the top of the line, at field scale', () => {
    // "the top of the line earns back the whole surround at field scale."
    // Every bearing but the slit dead astern is answered, and the reach is
    // most of the way across the field from a centred grave.
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    const around: Mob[] = [];
    for (let degrees = -150; degrees <= 180; degrees += 30) {
      around.push(putAtBearing(state, degrees, 60));
    }
    oneToll(state);

    const answered = around.filter((mob) => damageTo(mob) > 0);
    expect(answered).toHaveLength(around.length - 1);
    const last = requireDefined(around[around.length - 1], 'no last mob');
    expect(damageTo(last)).toBe(0);

    const reach = rowAt(MAX_LEVEL).reach;
    expect(reach).toBeGreaterThan(FIELD_WIDTH / 2 - 30);
    expect(reach).toBeLessThan(FIELD_WIDTH / 2);
  });

  it('reaches further at every level, so the answer widens while the cone count is still low', () => {
    // "Reach grows with level to widen the answer while the cone count is
    // still low."
    for (let level = 2; level <= MAX_LEVEL; level++) {
      expect(rowAt(level).reach).toBeGreaterThan(rowAt(level - 1).reach);
    }
  });

  it('answers a mob standing directly ahead at every level, seam or no seam', () => {
    // At levels two and four a pair of cones meet exactly at straight up, and
    // the bearing on that seam sits a rounding error outside both of them. A
    // hole dead ahead of the grave is the last place the toll may have one, so
    // the seam is closed and this is what says so.
    for (let level = 1; level <= MAX_LEVEL; level++) {
      const state = quietRun();
      state.levels.bell = level;
      const ahead = putAtBearing(state, 0, 40);
      oneToll(state);
      expect(damageTo(ahead), `level ${level}`).toBeGreaterThan(0);
    }
  });

  it('reads nothing at all past the authored rows', () => {
    // A level nobody authored has no cones, no heading and no reach, rather
    // than a number computed off the end of the rows (#53).
    const past = BELL_CONE_ROWS.length;
    expect(coneHeading(past, 0)).toBeNaN();
    expect(coneHeading(1, 1)).toBeNaN();
    expect(insideCone(past, 0)).toBe(false);
    expect(tollReach({ level: past, ticks: 10, struck: new Set() })).toBe(0);
  });
});

describe('the cones expand on one clock (plan 6.6)', () => {
  it("expands from nothing to the level's full reach over BELL_EXPAND_TICKS", () => {
    for (let level = 1; level <= MAX_LEVEL; level++) {
      expect(tollReach({ level, ticks: 0, struck: new Set() })).toBe(0);
      expect(
        tollReach({ level, ticks: BELL_EXPAND_TICKS, struck: new Set() }),
      ).toBeCloseTo(rowAt(level).reach, 6);
    }
  });

  it("holds at most one live toll at any tick, and a toll's life is shorter than its period", () => {
    expect(BELL_EXPAND_TICKS).toBeLessThan(BELL_PERIOD);
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    let held: BellToll | null = null;
    let born = 0;
    for (let tick = 0; tick < BELL_PERIOD * 3; tick++) {
      advanceBell(state);
      const ring = state.lines.ring;
      const previous = held;
      held = ring;
      if (ring === null) continue;
      // A live toll has never outlived its own expansion, and a toll that is
      // not the one the last tick held was born onto an empty field. Together
      // those are what "at most one" means: the clock cannot arm a second toll
      // over a first one still standing.
      expect(ring.ticks, `tick ${tick}`).toBeLessThan(BELL_EXPAND_TICKS);
      if (ring === previous) continue;
      expect(previous, `tick ${tick}`).toBeNull();
      born += 1;
    }
    // The window holds three periods, so a loop that armed nothing would pass
    // the two checks above over an empty set.
    expect(born).toBeGreaterThan(1);
  });

  it('clears the toll once its cones have reached full', () => {
    const state = quietRun();
    state.levels.bell = 1;
    tollFor(state, BELL_PERIOD);
    expect(state.lines.ring).not.toBeNull();
    tollFor(state, BELL_EXPAND_TICKS);
    expect(state.lines.ring).toBeNull();
  });

  it('carries the level and the reach it will stand at on the tolled event', () => {
    const state = quietRun();
    state.levels.bell = 3;
    const [toll] = tolls(tollFor(state, BELL_PERIOD));
    expect(toll).toEqual({
      type: 'tolled',
      level: 3,
      radius: rowAt(3).reach,
    });
  });
});

describe('the damage falls off with distance (ADR 0005)', () => {
  it("deals the rung's near damage at the grave and its far damage at the far edge of its damage reach", () => {
    // A measured baseline whose input moved, re-pinned with the triple.
    //
    // What stood: the falloff itself, one at the grave and nothing at the edge
    // it falls off over, and the far row's own figure at that edge.
    //
    // What it replaced: the cone's full reach as the edge the damage falls off
    // over, which was the shared falloff and was never ruled, only inherited.
    //
    // What it could not have known: that sharing the falloff with the push left
    // no living body to watch at any duration or curve (R10, and the research
    // record's section 1).
    const level = MAX_LEVEL;
    const full = rowAt(level).damageReach;

    const near = quietRun();
    near.levels.bell = level;
    const atGrave = put(near, 'revenant', near.grave.x, near.grave.y);
    oneToll(near);
    expect(damageTo(atGrave)).toBeCloseTo(bellDamageNear(level), 4);

    const far = quietRun();
    far.levels.bell = level;
    const atEdge = put(far, 'revenant', far.grave.x, far.grave.y - full + 1);
    oneToll(far);
    expect(damageTo(atEdge)).toBeGreaterThan(bellDamageFar(level) * 0.9);
    expect(damageTo(atEdge)).toBeLessThan(bellDamageFar(level) * 1.2);
  });

  it('takes about three tenths of the near edge at eighty percent of the damage reach', () => {
    // The falloff itself is the ruling and the raw number is a scale, so what
    // is worth out here is stated as a fraction of the near edge. It used to be
    // stated as a fraction of a shambler, which was the same sentence only
    // while the near edge was one shambler exactly; under the mow the near edge
    // takes a mow body five times over (ADR 0059), so the denominator moves to
    // the thing the falloff is actually a falloff from. The curve is untouched
    // and so is the figure: what moved under R10 is which reach the damage
    // falls off over, and eight tenths of it still carries three tenths.
    const level = MAX_LEVEL;
    const at = rowAt(level).damageReach * 0.8;
    const state = quietRun();
    state.levels.bell = level;
    const mob = put(state, 'revenant', state.grave.x, state.grave.y - at);
    oneToll(state);
    expect(damageTo(mob) / bellDamageNear(level)).toBeCloseTo(0.3, 1);
  });

  it('damages a mob once as the leading edge crosses it, never twice and never on the tick after', () => {
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    const mob = put(state, 'revenant', state.grave.x, state.grave.y - 100);
    tollFor(state, BELL_PERIOD);

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

describe('what the toll costs a trash body at the far edge (ADR 0059)', () => {
  /**
   * The tolls a shambler standing this far from the grave absorbs before it
   * dies, or Infinity where the toll never takes anything off it at all.
   *
   * It stopped requiring a death under R10: outside the damage reach a toll
   * takes nothing, so a body out there outlives every toll and the honest count
   * is that there is no count.
   */
  function tollsToKillAt(level: number, distance: number): number {
    const state = quietRun();
    state.levels.bell = level;
    const mob = put(state, 'shambler', state.grave.x, state.grave.y - distance);

    let chips = 0;
    for (let tick = 0; tick < BELL_PERIOD * 20 && mob.alive; tick++) {
      chips += advanceBell(state).filter(
        (event) => event.type === 'mobDamaged',
      ).length;
    }
    return mob.alive ? Infinity : chips;
  }

  it('takes exactly two tolls to kill a shambler at the far edge of its damage reach, at the rung a run is born on', () => {
    // ADR 0059 supersedes the #76 pass A count of eight. What survives is
    // Mark's 2026-08-19 ruling that the far edge tickles rather than kills,
    // recorded in ADR 0036's own first paragraph and held as the ratio between
    // the edges: out here it still takes more than one toll where the grave's
    // own rim takes one.
    //
    // The edge the promise is made at moved under R10 and the promise did not.
    // The far row is what a body at the far edge of the damage reach takes, and
    // that edge is inside it: the ring's own test is `distance > now` and the
    // damage guard is `distance > damageReach`, so a body standing exactly
    // there is damaged for the row.
    //
    // The rung is named because the bell's damage climbs with its rungs
    // (docs/research/weapon-growth-per-level-precedent.md section 4), so the
    // count is where the curve starts rather than a figure the line holds.
    expect(
      tollsToKillAt(BIRTHRIGHT_LEVEL, rowAt(BIRTHRIGHT_LEVEL).damageReach),
    ).toBe(2);
  });

  it('still needs more than one toll at the far edge at the top rung', () => {
    // It was a tripwire under `it.fails` because at rung 5 the far edge carried
    // 13 against a mow body's 8, so a maxed bell took trash outright anywhere
    // inside its cones. R10 removes the cause rather than the figure: the far
    // edge of the drawn cone is now outside the damage reach entirely, so the
    // toll takes nothing at all out here and the count is Infinity rather than
    // one. ADR 0059's one-touch mow body and the ruled damage lane are both
    // unmoved; what moved is where the damage stops.
    expect(tollsToKillAt(MAX_LEVEL, rowAt(MAX_LEVEL).reach)).toBeGreaterThan(1);
  });
});

describe('one toll alone cannot clear a wave (plan 6.6)', () => {
  /** How many of a curtain of twenty-two shamblers survive one toll at this rung. */
  function survivorsOfOneToll(level: number): number {
    const state = quietRun();
    state.levels.bell = level;
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
    oneToll(state);
    return wave.filter((mob) => mob.alive).length;
  }

  it("leaves survivors from twenty-two shamblers across the field's width, at the rung a run is born on", () => {
    // The bound the wisps already carry, and the one the bell walked out from
    // under when it left the swallow.
    expect(survivorsOfOneToll(BIRTHRIGHT_LEVEL)).toBeGreaterThan(0);
  });

  it("leaves survivors from that same curtain at the bell's top rung", () => {
    // It was a tripwire under `it.fails` because at rung 5 the far edge carried
    // 13 against a mow body's 8, so a maxed bell's five cones took the whole
    // curtain in one toll. R10 removes the cause: the bodies in the outer part
    // of each cone stand outside the damage reach, so they are shoved and live.
    // The curtain here is the Wall's own width, which is why the finding was
    // worth keeping visible while it stood (ADR 0042).
    expect(survivorsOfOneToll(MAX_LEVEL)).toBeGreaterThan(0);
  });
});

describe('the push is on the field from level 1 (ADR 0036)', () => {
  it("leaves at the speed the cone's leading edge advances, so its whole travel is the fall from that first step", () => {
    // Ruling R2 as superseded on 2026-09-15: a toll's total throw is the
    // distance a body covers when its first step matches the leading edge of
    // the cone that struck it. The edge crosses its row's reach in
    // BELL_EXPAND_TICKS ticks, and a linear fall over SHOVE_TICKS ticks from a
    // first step s covers s * (SHOVE_TICKS + 1) / 2 (shove.ts, firstStepOf),
    // which is where every row of the push column comes from
    // (docs/research/watched-pushback-duration.md section 5, option 2). The
    // column is whole units, so the derivation is checked as the row's own
    // rounding rather than as an exact hit.
    for (let level = 1; level <= MAX_LEVEL; level++) {
      const edgeStep = rowAt(level).reach / BELL_EXPAND_TICKS;
      expect(rowAt(level).push, `level ${level}`).toBe(
        Math.round((edgeStep * (SHOVE_TICKS + 1)) / 2),
      );
    }

    // Played at the rung whose near damage of 56 leaves a revenant's 64 alive
    // to be watched, half a unit off the grave, where the falloff is all but
    // one and the row is spent whole. A promise written against a corpse or
    // against a body the row refuses would pin nothing.
    const level = 2;
    const state = quietRun();
    state.levels.bell = level;
    const mob = standStill(putAtBearing(state, 0, 0.5));
    const steps = travelPerTick(
      state,
      mob,
      BELL_PERIOD + BELL_EXPAND_TICKS + SHOVE_TICKS,
    );

    expect(mob.alive).toBe(true);
    expect(steps).toHaveLength(SHOVE_TICKS);
    const first = requireDefined(steps[0], 'no first step');
    expect(first).toBeCloseTo(rowAt(level).reach / BELL_EXPAND_TICKS, 1);
    expect(steps.reduce((sum, step) => sum + step, 0)).toBeCloseTo(
      (first * (SHOVE_TICKS + 1)) / 2,
      6,
    );
  });

  it('shoves a body in the outer part of its drawn cone and leaves it alive, because the damage reaches less far than the push', () => {
    // Ruling R10: a toll's damage falls to nothing at a reach inside its push's
    // reach, so the outer part of the cone the player is shown is push alone
    // and a living body is what he watches travel. It is pinned on the mow body
    // because that is the body the finding was about: a shambler never survived
    // a toll at rung three or higher anywhere inside a cone
    // (docs/research/watched-pushback-duration.md section 1). Strictly inside
    // the drawn edge, where the push's own falloff is zero exactly.
    const level = MAX_LEVEL;
    const state = quietRun();
    state.levels.bell = level;
    const row = rowAt(level);
    const distance = (row.damageReach + row.reach) / 2;
    const mob = standStill(
      put(state, 'shambler', state.grave.x, state.grave.y - distance),
    );
    const from = mob.y;
    const events = oneTollAndTravel(state);

    expect(mob.alive).toBe(true);
    expect(damageTo(mob)).toBe(0);
    expect(from - mob.y).toBeCloseTo(row.push * (1 - distance / row.reach), 6);
    expect(events.filter((event) => event.type === 'mobShoved')).toHaveLength(
      1,
    );
  });

  it('takes nothing at all off a body outside its damage reach, and marks it struck all the same', () => {
    // A zero-damage event is not the way to say a toll took nothing: a count a
    // reading can sum must never carry a hit that took nothing, so the guard
    // sits before the damage rather than being a zero the falloff produced.
    // The strike itself still lands, because the one-strike rule is about the
    // toll reaching the body and a shoved body crossing the leading edge again
    // earns no second strike.
    const level = MAX_LEVEL;
    const state = quietRun();
    state.levels.bell = level;
    const row = rowAt(level);
    const mob = standStill(
      put(
        state,
        'revenant',
        state.grave.x,
        state.grave.y - (row.damageReach + row.reach) / 2,
      ),
    );

    const events: SimEvent[] = [];
    let struck = false;
    for (let tick = 0; tick < BELL_PERIOD + BELL_EXPAND_TICKS; tick++) {
      advanceMobs(state);
      events.push(...advanceBell(state));
      if (state.lines.ring?.struck.has(mob.id) === true) struck = true;
    }

    expect(struck).toBe(true);
    expect(mob.hp).toBe(MOB_TYPES.revenant.hp);
    expect(
      events.filter(
        (event) => event.type === 'mobDamaged' && event.id === mob.id,
      ),
    ).toEqual([]);
  });

  it('shoves at every level, harder at each one', () => {
    // "the push is the half that has to be felt, because a repel line the
    // player cannot see repelling is not a repel line." #79 read 42, 51 and 0
    // field units of pushback across three runs against a table that was zero
    // below level 4. What is pinned is the relation, never the magnitudes,
    // which are the harness's at step 4.
    for (let level = 1; level <= MAX_LEVEL; level++) {
      expect(rowAt(level).push).toBeGreaterThan(0);
      if (level > 1) {
        expect(rowAt(level).push).toBeGreaterThan(rowAt(level - 1).push);
      }
    }

    for (let level = 1; level <= MAX_LEVEL; level++) {
      const state = quietRun();
      state.levels.bell = level;
      const mob = putStill(state, 0, 150);
      const from = mob.y;
      const events = oneTollAndTravel(state);
      expect(
        events.filter((event) => event.type === 'mobShoved'),
        `level ${level}`,
      ).toHaveLength(1);
      // Straight ahead of the grave is up the field, so a shove away from the
      // grave is a smaller y.
      expect(mob.y, `level ${level}`).toBeLessThan(from);
    }
  });

  it('carries a body at level five the ninety field units its row now derives', () => {
    // A measured baseline whose input moved, re-pinned with the triple.
    //
    // What stood: the row is exactly what the shove spends, and the push column
    // is still the tuning surface a pass reads and edits.
    //
    // What it replaced: the forty field units held from before round two, which
    // were this record's own arithmetic rather than anything Mark asked for.
    //
    // What it could not have known: that forty units reaches a living body as
    // half a field unit, a fiftieth of a shambler's own width
    // (docs/research/watched-pushback-duration.md section 1), so the figure it
    // was holding could never be watched whatever its duration.
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    // Half a unit off the grave, where the falloff is all but one, so what
    // lands is the row's whole push to six places.
    const distance = 0.5;
    const mob = putStill(state, 0, distance);
    const from = mob.y;
    const events = oneTollAndTravel(state);

    const expected =
      rowAt(MAX_LEVEL).push * (1 - distance / rowAt(MAX_LEVEL).reach);
    expect(rowAt(MAX_LEVEL).push).toBe(90);
    expect(from - mob.y).toBeCloseTo(expected, 6);
    expect(events.filter((event) => event.type === 'mobShoved')).toEqual([
      {
        type: 'mobShoved',
        id: mob.id,
        displacement: expect.closeTo(expected, 6),
        source: 'bell',
      },
    ]);
  });

  it('draws a shoved body at a different place on every tick of its travel', () => {
    // Mark's ruling 4 of 2026-09-15: the bell's repel jumped a body in one
    // frame and read as a glitch. A shambler is 22 field units wide and the
    // old push moved a body 40 in one tick, leaving an 18-unit hole between
    // two drawn positions; every step of the new one overlaps the last.
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    const mob = putStill(state, 0, 150);

    const seen: number[] = [];
    const window = BELL_PERIOD + BELL_EXPAND_TICKS + SHOVE_TICKS;
    for (let tick = 0; tick < window; tick++) {
      const before = mob.y;
      advanceMobs(state);
      advanceBell(state);
      if (mob.y !== before) seen.push(before - mob.y);
    }

    expect(seen.length).toBeGreaterThan(1);
    const width = MOB_TYPES.revenant.halfWidth * 2;
    for (const step of seen) expect(step).toBeLessThan(width);
  });

  it('shoves with the level the toll froze, not a level gained while it was live', () => {
    // A toll is live for a quarter of every period, so a bell power-up lands
    // during one often. The reach and the sweep both read the toll's own
    // level, and a push read off the live level shoves a mob further than the
    // toll that reached it can account for.
    const state = quietRun();
    state.levels.bell = 4;
    const distance = 40;
    const mob = putStill(state, 0, distance);
    const from = mob.y;
    tollAndTravelFor(state, BELL_PERIOD);
    expect(state.lines.ring?.level).toBe(4);

    state.levels.bell = MAX_LEVEL;
    tollAndTravelFor(state, BELL_EXPAND_TICKS);
    const near = 1 - distance / rowAt(4).reach;
    expect(from - mob.y).toBeCloseTo(rowAt(4).push * near, 4);
  });

  it('a toll at a level past the authored rows leaves a swept mob where it stood', () => {
    // Past the rows there is no cone to be inside and no push to apply, and
    // both refuse in their own guard rather than working from NaN (#53).
    const state = quietRun();
    const mob = put(state, 'revenant', state.grave.x, state.grave.y - 40);
    const fromX = mob.x;
    const fromY = mob.y;
    state.lines.ring = {
      level: BELL_CONE_ROWS.length,
      ticks: 0,
      struck: new Set(),
    };
    advanceBell(state);
    expect(mob.x).toBe(fromX);
    expect(mob.y).toBe(fromY);
  });

  it("no toll level, authored or not, ever writes NaN into a swept mob's position", () => {
    // The guard sits on the computed push, so every path to a non-finite
    // strength refuses in one place, whatever level produced it (#53).
    for (let level = 0; level <= BELL_CONE_ROWS.length; level++) {
      const state = quietRun();
      const mob = putAtBearing(state, 0, 40);
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

  it('a shove emits mobShoved carrying the distance the bound let the mob cover, not the nominal push', () => {
    // Grave hard against the right edge, mob 150 out along the level-5 cone
    // that answers the side: the push's falloff is 1 - 150/261 = 0.425, so the
    // nominal push is about 38, but the bound at FIELD_WIDTH + SPAWN_MARGIN
    // leaves only 10 of it. The event reports the 10 the mob really moved,
    // which is the only
    // figure a repel reading can honestly sum, and it reports it once the
    // travel is over rather than on the tick the shove landed.
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    state.grave.x = FIELD_WIDTH;
    const mob = put(state, 'revenant', FIELD_WIDTH + 150, state.grave.y);
    mob.beat = Number.MAX_SAFE_INTEGER;
    mob.vx = 0;
    mob.vy = 0;
    mob.hp = OUTLIVES_ANY_TOLL;
    const events = oneTollAndTravel(state);
    const shoves = events.filter((event) => event.type === 'mobShoved');
    expect(shoves).toEqual([
      {
        type: 'mobShoved',
        id: mob.id,
        displacement: expect.closeTo(10, 9),
        // The bell is the only push this build has, and the reading reads it
        // apart from the belch's by this field rather than by a toll window.
        source: 'bell',
      },
    ]);
    expect(mob.x).toBe(FIELD_WIDTH + SPAWN_MARGIN);
  });

  it('a mob pinned at the widened field boundary is struck but never shoved', () => {
    // The bound can refuse the whole move: a mob already at
    // FIELD_WIDTH + SPAWN_MARGIN with the away direction pointing outward
    // covers zero distance. The repel reading counts events, so a
    // zero-distance shove would report a push that never happened.
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    state.grave.x = FIELD_WIDTH;
    const mob = put(
      state,
      'revenant',
      FIELD_WIDTH + SPAWN_MARGIN,
      state.grave.y,
    );
    mob.beat = Number.MAX_SAFE_INTEGER;
    mob.vx = 0;
    mob.vy = 0;
    const events = oneTollAndTravel(state);
    expect(events.filter((event) => event.type === 'mobShoved')).toEqual([]);
    expect(mob.x).toBe(FIELD_WIDTH + SPAWN_MARGIN);
    expect(damageTo(mob)).toBeGreaterThan(0);
  });

  it('a mob outside every cone is neither struck nor shoved, however close it stands', () => {
    // The push follows the cones exactly: a mob a step behind the grave at
    // level 1 is inside the reach the whole time and takes nothing at all.
    const state = quietRun();
    state.levels.bell = 1;
    const mob = putStill(state, 180, 20);
    const fromY = mob.y;
    const events = oneTollAndTravel(state);
    expect(events.filter((event) => event.type === 'mobShoved')).toEqual([]);
    expect(mob.hp).toBe(OUTLIVES_ANY_TOLL);
    expect(mob.y).toBe(fromY);
  });

  it('a mob standing at the exact grave centre is struck but never shoved', () => {
    // Distance zero has no away direction, so the push refuses and no shove
    // event exists to report; the strike itself still lands at full power, at
    // every level, because the toll leaves from under the mob rather than
    // reaching it along a bearing.
    for (const level of [1, MAX_LEVEL]) {
      const state = quietRun();
      state.levels.bell = level;
      const mob = put(state, 'revenant', state.grave.x, state.grave.y);
      mob.beat = Number.MAX_SAFE_INTEGER;
      mob.vx = 0;
      mob.vy = 0;
      const events = oneTollAndTravel(state);
      expect(
        events.filter((event) => event.type === 'mobShoved'),
        `level ${level}`,
      ).toEqual([]);
      expect(damageTo(mob), `level ${level}`).toBeCloseTo(
        bellDamageNear(level),
        4,
      );
    }
  });

  it('strikes each body once, and a body shoved back across the leading edge earns no second strike', () => {
    // toll.struck exists because a reach test alone is not enough once a push
    // exists: the push carries a body back outside the edge that has just
    // passed it and the edge catches it again. A shove that takes ticks puts
    // the body outside the edge for several of them rather than one, so the
    // rule matters more and not less.
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    const mob = putStill(state, 0, 30);
    const events = oneTollAndTravel(state);

    const damaged = events.filter(
      (event) => event.type === 'mobDamaged' && event.id === mob.id,
    );
    expect(damaged).toHaveLength(1);
    expect(events.filter((event) => event.type === 'mobShoved')).toHaveLength(
      1,
    );
  });

  it('keeps a pushed mob inside the field widened by SPAWN_MARGIN', () => {
    // Without the clamp a mob near an edge is shoved out of the box the
    // invariant harness checks, by the player's own weapon, and the harness
    // fires on a legal move. Every mob is asserted struck first, because a
    // bound taken over mobs the toll never reached is a bound over nothing:
    // the corners this test used to stand mobs in are further from the grave
    // than the top level reaches, so the toll declined all of them. The two
    // tests above are the clamp's own cases.
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    const pushed: Mob[] = [];
    for (const bearing of [-150, -90, 0, 90]) {
      pushed.push(putStill(state, bearing, 150));
    }
    oneTollAndTravel(state);
    for (const mob of pushed) {
      expect(mob.hp).toBeLessThan(OUTLIVES_ANY_TOLL);
      expect(mob.x).toBeGreaterThanOrEqual(-SPAWN_MARGIN);
      expect(mob.x).toBeLessThanOrEqual(FIELD_WIDTH + SPAWN_MARGIN);
      expect(mob.y).toBeGreaterThanOrEqual(-SPAWN_MARGIN);
      expect(mob.y).toBeLessThanOrEqual(FIELD_HEIGHT + SPAWN_MARGIN);
    }
  });
});

describe("the bell's damage climbs with its rungs (the weapon growth record, section 4)", () => {
  it('tolls for the damage its rung states, near and far, at every rung', () => {
    // docs/research/weapon-growth-per-level-precedent.md section 4. The bell is
    // the named exception to the x2 ceiling and lands at x2.6: the far edge is
    // pinned at exactly an eighth of the near edge (ADR 0036), and a step of
    // 25% of 40 would put the far edge at 6.25, so the smallest step that
    // keeps both whole is 40% of the rung-1 value. Level 0 throws no cones at
    // all.
    expect([...BELL_DAMAGE_NEAR_BY_LEVEL]).toEqual([0, 40, 56, 72, 88, 104]);
    expect([...BELL_DAMAGE_FAR_BY_LEVEL]).toEqual([0, 5, 7, 9, 11, 13]);
    for (let level = 0; level <= MAX_LEVEL; level++) {
      expect(bellDamageNear(level)).toBe(BELL_DAMAGE_NEAR_BY_LEVEL[level]);
      expect(bellDamageFar(level)).toBe(BELL_DAMAGE_FAR_BY_LEVEL[level]);
    }
  });

  it('leaves the far edge an eighth of the near edge at every rung (ADR 0036)', () => {
    // The ruling ADR 0036 actually carries is the ratio, so it is asserted
    // across the whole table rather than at the rung the run starts on. It is
    // also the constraint that sized the bell's own step.
    for (let level = 0; level <= MAX_LEVEL; level++) {
      expect(`rung ${level}: ${bellDamageFar(level) * 8}`).toBe(
        `rung ${level}: ${bellDamageNear(level)}`,
      );
    }
  });

  it('reads no damage past the rungs it authors', () => {
    expect(bellDamageNear(MAX_LEVEL + 1)).toBe(bellDamageNear(MAX_LEVEL));
    expect(bellDamageFar(MAX_LEVEL + 1)).toBe(bellDamageFar(MAX_LEVEL));
    expect(() => bellDamageNear(-1)).toThrow();
    expect(() => bellDamageFar(-1)).toThrow();
  });
});

describe('a body the cone kills on arrival (design record R10)', () => {
  it("is carried the whole of the toll's push", () => {
    // The bell's own half of the slice, and nothing here was built for it:
    // sweepToll pushes before it damages, so a body the cone kills on arrival
    // dies holding a live impulse, and after the corpse takes that impulse over
    // the flight finishes. Nothing asserted it before, and at the top rungs
    // note section 10 measured the kill reaching most of the cone, which is
    // where this is the whole difference.
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    // Both at one point, so the two travels are the same push and the only
    // thing that differs between them is which one the cone kills.
    const at = rowAt(MAX_LEVEL).damageReach / 2;
    const inTheCone = standStill(putAtBearing(state, 0, at));
    inTheCone.hp = 1;
    const lived = standStill(putAtBearing(state, 0, at));
    lived.hp = OUTLIVES_ANY_TOLL;

    const events = oneTollAndTravel(state);

    expect(inTheCone.alive).toBe(false);
    const travelOf = (id: number) =>
      events
        .filter((event) => event.type === 'mobShoved' && event.id === id)
        .reduce(
          (sum, event) =>
            sum + (event.type === 'mobShoved' ? event.displacement : 0),
          0,
        );
    expect(travelOf(inTheCone.id)).toBeGreaterThan(0);
    expect(travelOf(inTheCone.id)).toBeCloseTo(travelOf(lived.id), 6);
  });
});
