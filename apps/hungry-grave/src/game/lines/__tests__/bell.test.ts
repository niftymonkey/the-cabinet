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
import { MOB_TYPES, SPAWN_MARGIN, spawnMob } from '../../mobs';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { RAMP_ROWS } from '../../stage/stage';
import type { BellToll } from '../bell';
import {
  advanceBell,
  BELL_CONE_ROWS,
  BELL_DAMAGE_FAR,
  BELL_DAMAGE_NEAR,
  BELL_EXPAND_TICKS,
  BELL_PERIOD,
  coneHeading,
  insideCone,
  tollReach,
} from '../bell';
import { MAX_LEVEL } from '../roster';

const RADIANS_PER_DEGREE = Math.PI / 180;

function quietRun(seed = 12): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

function put(state: RunState, type: MobType, x: number, y: number): Mob {
  const mob = spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 }, false)!;
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

function tolls(events: SimEvent[]) {
  return events.filter((event) => event.type === 'tolled');
}

/** How much health a mob lost, which is the only way the toll's damage is visible. */
function damageTo(mob: Mob): number {
  return MOB_TYPES[mob.type].hp - mob.hp;
}

/** The widest heading of a level's fan, in degrees, which is how far it has wrapped. */
function wrapDegrees(level: number): number {
  const headings = BELL_CONE_ROWS[level].headings;
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

  it('does not toll at level 0, because the line arrives only through a drop', () => {
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
    expect(BELL_CONE_ROWS[1].headings).toHaveLength(1);
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
      expect(BELL_CONE_ROWS[level].headings).toHaveLength(level);
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
      const headings = [...BELL_CONE_ROWS[level].headings].sort(
        (left, right) => left - right,
      );
      for (let index = 0; index < headings.length; index++) {
        const mirrored = headings[headings.length - 1 - index];
        expect(headings[index]).toBeCloseTo(-mirrored, 9);
      }
    }

    for (const level of [1, 2, 3, 4]) {
      const edge =
        wrapDegrees(level) +
        BELL_CONE_ROWS[level].halfAngle / RADIANS_PER_DEGREE;
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
    expect(damageTo(around[around.length - 1])).toBe(0);

    const reach = BELL_CONE_ROWS[MAX_LEVEL].reach;
    expect(reach).toBeGreaterThan(FIELD_WIDTH / 2 - 30);
    expect(reach).toBeLessThan(FIELD_WIDTH / 2);
  });

  it('reaches further at every level, so the answer widens while the cone count is still low', () => {
    // "Reach grows with level to widen the answer while the cone count is
    // still low."
    for (let level = 2; level <= MAX_LEVEL; level++) {
      expect(BELL_CONE_ROWS[level].reach).toBeGreaterThan(
        BELL_CONE_ROWS[level - 1].reach,
      );
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
      ).toBeCloseTo(BELL_CONE_ROWS[level].reach, 6);
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
      radius: BELL_CONE_ROWS[3].reach,
    });
  });
});

describe('the damage falls off with distance (ADR 0005)', () => {
  it("deals BELL_DAMAGE_NEAR at the grave and BELL_DAMAGE_FAR at the cone's far edge", () => {
    const level = MAX_LEVEL;
    const full = BELL_CONE_ROWS[level].reach;

    const near = quietRun();
    near.levels.bell = level;
    const atGrave = put(near, 'revenant', near.grave.x, near.grave.y);
    oneToll(near);
    expect(damageTo(atGrave)).toBeCloseTo(BELL_DAMAGE_NEAR, 4);

    const far = quietRun();
    far.levels.bell = level;
    const atEdge = put(far, 'revenant', far.grave.x, far.grave.y - full + 1);
    oneToll(far);
    expect(damageTo(atEdge)).toBeGreaterThan(BELL_DAMAGE_FAR * 0.9);
    expect(damageTo(atEdge)).toBeLessThan(BELL_DAMAGE_FAR * 1.2);
  });

  it('takes about three tenths of a shambler at eighty percent of the reach', () => {
    // BELL_DAMAGE_NEAR is one shambler exactly, so a maxed bell kills trash
    // outright only where the player is standing, and the far edge tickles.
    // What the falloff is worth out here is therefore stated as a fraction of a
    // trash body: the raw number is a scale and the fraction is the ruling.
    const level = MAX_LEVEL;
    const at = BELL_CONE_ROWS[level].reach * 0.8;
    const state = quietRun();
    state.levels.bell = level;
    const mob = put(state, 'revenant', state.grave.x, state.grave.y - at);
    oneToll(state);
    expect(damageTo(mob) / MOB_TYPES.shambler.hp).toBeCloseTo(0.3, 1);
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

describe('what the toll costs a trash body at the far edge (#76 pass A)', () => {
  it("takes exactly eight tolls to kill a shambler standing at the cone's full reach", () => {
    // Mark's 2026-08-27 ruling for #76 pass A: the far edge chips eight times
    // where it used to chip six, while the toll still kills a shambler outright
    // at the grave. The two ends of the falloff are what moved, and this is the
    // far one.
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    const full = BELL_CONE_ROWS[MAX_LEVEL].reach;
    const mob = put(state, 'shambler', state.grave.x, state.grave.y - full);

    let chips = 0;
    for (let tick = 0; tick < BELL_PERIOD * 20 && mob.alive; tick++) {
      chips += advanceBell(state).filter(
        (event) => event.type === 'mobDamaged',
      ).length;
    }

    expect(mob.alive).toBe(false);
    expect(chips).toBe(8);
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
    oneToll(state);
    expect(wave.filter((mob) => mob.alive).length).toBeGreaterThan(0);
  });
});

describe('the push is on the field from level 1 (ADR 0036)', () => {
  it('shoves at every level, harder at each one', () => {
    // "the push is the half that has to be felt, because a repel line the
    // player cannot see repelling is not a repel line." #79 read 42, 51 and 0
    // field units of pushback across three runs against a table that was zero
    // below level 4. What is pinned is the relation, never the magnitudes,
    // which are the harness's at step 4.
    for (let level = 1; level <= MAX_LEVEL; level++) {
      expect(BELL_CONE_ROWS[level].push).toBeGreaterThan(0);
      if (level > 1) {
        expect(BELL_CONE_ROWS[level].push).toBeGreaterThan(
          BELL_CONE_ROWS[level - 1].push,
        );
      }
    }

    for (let level = 1; level <= MAX_LEVEL; level++) {
      const state = quietRun();
      state.levels.bell = level;
      const mob = putAtBearing(state, 0, 40);
      const from = mob.y;
      const events = oneToll(state);
      expect(
        events.filter((event) => event.type === 'mobShoved'),
        `level ${level}`,
      ).toHaveLength(1);
      // Straight ahead of the grave is up the field, so a shove away from the
      // grave is a smaller y.
      expect(mob.y, `level ${level}`).toBeLessThan(from);
    }
  });

  it('shoves with the level the toll froze, not a level gained while it was live', () => {
    // A toll is live for a quarter of every period, so a bell drop lands
    // during one often. The reach and the sweep both read the toll's own
    // level, and a push read off the live level shoves a mob further than the
    // toll that reached it can account for.
    const state = quietRun();
    state.levels.bell = 4;
    const distance = 40;
    const mob = putAtBearing(state, 0, distance);
    const from = mob.y;
    tollFor(state, BELL_PERIOD);
    expect(state.lines.ring?.level).toBe(4);

    state.levels.bell = MAX_LEVEL;
    tollFor(state, BELL_EXPAND_TICKS);
    const near = 1 - distance / BELL_CONE_ROWS[4].reach;
    expect(from - mob.y).toBeCloseTo(BELL_CONE_ROWS[4].push * near, 4);
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

  it('a shove emits mobShoved carrying the distance the clamp let the mob move, not the nominal push', () => {
    // Grave hard against the right edge, mob 150 out along the level-5 cone
    // that answers the side: near is 1 - 150/261 = 0.425, so the nominal push
    // is about 17, but the field clamp at FIELD_WIDTH + SPAWN_MARGIN leaves
    // only 10 of it. The event reports the 10 the mob really moved, which is
    // the only figure a repel reading can honestly sum.
    const state = quietRun();
    state.levels.bell = MAX_LEVEL;
    state.grave.x = FIELD_WIDTH;
    const mob = put(state, 'revenant', FIELD_WIDTH + 150, state.grave.y);
    const events = oneToll(state);
    const shoves = events.filter((event) => event.type === 'mobShoved');
    expect(shoves).toEqual([
      { type: 'mobShoved', id: mob.id, displacement: 10 },
    ]);
    expect(mob.x).toBe(FIELD_WIDTH + SPAWN_MARGIN);
  });

  it('a mob pinned at the widened field boundary is struck but never shoved', () => {
    // The clamp can refuse the whole move: a mob already at
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
    const events = oneToll(state);
    expect(events.filter((event) => event.type === 'mobShoved')).toEqual([]);
    expect(mob.x).toBe(FIELD_WIDTH + SPAWN_MARGIN);
    expect(damageTo(mob)).toBeGreaterThan(0);
  });

  it('a mob outside every cone is neither struck nor shoved, however close it stands', () => {
    // The push follows the cones exactly: a mob a step behind the grave at
    // level 1 is inside the reach the whole time and takes nothing at all.
    const state = quietRun();
    state.levels.bell = 1;
    const mob = putAtBearing(state, 180, 20);
    const fromY = mob.y;
    const events = oneToll(state);
    expect(events.filter((event) => event.type === 'mobShoved')).toEqual([]);
    expect(damageTo(mob)).toBe(0);
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
      const events = oneToll(state);
      expect(
        events.filter((event) => event.type === 'mobShoved'),
        `level ${level}`,
      ).toEqual([]);
      expect(damageTo(mob), `level ${level}`).toBeCloseTo(BELL_DAMAGE_NEAR, 4);
    }
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
      pushed.push(putAtBearing(state, bearing, 150));
    }
    oneToll(state);
    for (const mob of pushed) {
      expect(damageTo(mob)).toBeGreaterThan(0);
      expect(mob.x).toBeGreaterThanOrEqual(-SPAWN_MARGIN);
      expect(mob.x).toBeLessThanOrEqual(FIELD_WIDTH + SPAWN_MARGIN);
      expect(mob.y).toBeGreaterThanOrEqual(-SPAWN_MARGIN);
      expect(mob.y).toBeLessThanOrEqual(FIELD_HEIGHT + SPAWN_MARGIN);
    }
  });
});
