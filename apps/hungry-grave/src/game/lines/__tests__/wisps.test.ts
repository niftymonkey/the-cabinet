/**
 * The wisps (ADR 0005): the run's only homing line, fired on each swallow and
 * never always-on. Expected values come from ADR 0005 and dispatch 5's plan
 * sections 3 and 6.5.
 */

import { describe, expect, it } from 'vitest';

import { cos } from '../../math';
import type { Mob, MobType } from '../../mobs';
import { MOB_TYPES, spawnMob } from '../../mobs';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { PROCESSION_WAVES } from '../../stage/waves';
import { resolveStorm } from '../../storm';
import { FRESHNESS_PAYOUT_FLOOR } from '../../tuning';
import { MAX_LEVEL } from '../roster';
import {
  advanceWisps,
  launchWisps,
  wispDamage,
  WISP_DAMAGE_BY_LEVEL,
  WISP_FLOOR_SOULS,
  WISP_LIFETIME,
  WISP_SPEED,
  WISP_TURN_DEGREES_PER_SECOND,
  WISP_VOLLEY_INTERVAL_TICKS,
  WISPS_BY_LEVEL,
} from '../wisps';

/** Narrows a possibly-absent value, or fails loudly when the absence is a bug. */
function requireDefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

/** How many souls a level pays out, for a level this file only ever asks about in range. */
function soulsAt(level: number): number {
  return requireDefined(
    WISPS_BY_LEVEL[level],
    `no souls count at level ${level}`,
  );
}

function quietRun(seed = 8): RunState {
  const run = createRun(seed);
  run.stage.firedWaves = PROCESSION_WAVES.length;
  return run;
}

function put(state: RunState, type: MobType, x: number, y: number): Mob {
  const mob = spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 }, false)!;
  mob.beat = 0;
  return mob;
}

/**
 * How many wisps a body absorbs before it dies, which is what the no-overkill
 * rule budgets in. A count of touches, never a health total.
 */
function wispsToKill(mob: Mob, level: number): number {
  return Math.ceil(MOB_TYPES[mob.type].hp / wispDamage(level));
}

function liveWisps(state: RunState) {
  return state.wisps.filter((wisp) => wisp.alive);
}

/** A volley launched from a run at a stated level, with the events it produced discarded. */
function volley(state: RunState, level: number, freshness = 1) {
  state.levels.wisps = level;
  launchWisps(state, [], freshness);
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

describe('the wisps are never on unless a swallow bought them (ADR 0005)', () => {
  it('starts a run with no wisps and launches none until the line is levelled', () => {
    const state = quietRun();
    expect(state.levels.wisps).toBe(0);
    put(state, 'shambler', 200, 300);
    launchWisps(state, [], 1);
    expect(liveWisps(state)).toHaveLength(0);
  });

  it("launches the level's own count, from one at level 1 to eleven at level 5", () => {
    expect(WISPS_BY_LEVEL).toEqual([0, 1, 3, 5, 8, 11]);
    for (let level = 1; level <= MAX_LEVEL; level++) {
      const state = quietRun();
      put(state, 'shambler', 200, 300);
      expect(`level ${level}: ${volley(state, level).length}`).toBe(
        `level ${level}: ${WISPS_BY_LEVEL[level]}`,
      );
    }
  });

  it("launches from the grave's mouth and does not move on the tick it launches", () => {
    const state = quietRun();
    put(state, 'shambler', 200, 300);
    const mouth = { x: state.grave.x, y: state.grave.y - state.grave.size };
    const wisp = requireDefined(volley(state, 1)[0], 'no wisp in the volley');
    expect({ x: wisp.x, y: wisp.y }).toEqual(mouth);
  });
});

describe('freshness pays the wisps in souls (ADR 0058)', () => {
  it('tears fewer souls loose from a rotten corpse than from a fresh one', () => {
    // ADR 0058: "The wisps pay in souls, so freshness scales the count." The
    // relation is what is pinned, never the magnitude, so a retuned floor
    // moves the numbers without moving this test.
    const fresh = quietRun();
    put(fresh, 'shambler', 200, 300);
    const rotten = quietRun();
    put(rotten, 'shambler', 200, 300);

    expect(
      volley(rotten, MAX_LEVEL, FRESHNESS_PAYOUT_FLOOR).length,
    ).toBeLessThan(volley(fresh, MAX_LEVEL, 1).length);
  });

  it('scales the count down the freshness curve, never past its floor', () => {
    // The same floor growth and reservoir charge use (ADR 0004), so a corpse
    // at freshness zero pays what a corpse at the floor pays.
    const atFloor = quietRun();
    put(atFloor, 'shambler', 200, 300);
    const atZero = quietRun();
    put(atZero, 'shambler', 200, 300);

    expect(volley(atZero, MAX_LEVEL, 0).length).toBe(
      volley(atFloor, MAX_LEVEL, FRESHNESS_PAYOUT_FLOOR).length,
    );
  });

  it('never tears loose fewer than one soul from an owned line', () => {
    // ADR 0058: "floored at one soul, because a bare proportional count pays
    // nothing at level one where the flight is a single wisp and a swallow
    // that fires nothing reads as a bug."
    expect(WISP_FLOOR_SOULS).toBe(1);
    for (let level = 1; level <= MAX_LEVEL; level++) {
      const state = quietRun();
      put(state, 'shambler', 200, 300);
      expect(`level ${level}: ${volley(state, level, 0).length}`).toBe(
        `level ${level}: ${Math.max(
          WISP_FLOOR_SOULS,
          Math.floor(soulsAt(level) * FRESHNESS_PAYOUT_FLOOR),
        )}`,
      );
    }
  });

  it('fires nothing from an unowned line whatever the freshness', () => {
    // The floor must not resurrect a line the run does not own: level zero is
    // silence because homing is always bought with a dive, and the birthright
    // is the skull stream alone (ADR 0045), so a fresh run sits at level zero.
    const state = quietRun();
    put(state, 'shambler', 200, 300);
    for (const freshness of [0, FRESHNESS_PAYOUT_FLOOR, 0.5, 1]) {
      expect(
        `freshness ${freshness}: ${volley(state, 0, freshness).length}`,
      ).toBe(`freshness ${freshness}: 0`);
    }
  });
});

describe('what a volley costs a trash body (ADR 0059)', () => {
  it('takes exactly one wisp to kill a shambler', () => {
    // ADR 0059 supersedes the #76 pass A count of four: the mow body is the
    // cheapest thing on the field, so one soul takes it and a level-5 volley
    // of eleven clears eleven of them.
    //
    // Counted by feeding the mob one wisp at a time from the mouth it stands
    // on, so what is asserted is how often the line has to land rather than the
    // arithmetic the targeting rule does.
    const state = quietRun();
    const mob = put(
      state,
      'shambler',
      state.grave.x,
      state.grave.y - state.grave.size,
    );

    let touches = 0;
    for (let launch = 0; launch < 10 && mob.alive; launch++) {
      volley(state, 1);
      touches += resolveStorm(state).filter(
        (event) => event.type === 'mobDamaged',
      ).length;
    }

    expect(mob.alive).toBe(false);
    expect(touches).toBe(1);
  });
});

describe('the no-overkill targeting rule (plan section 3)', () => {
  it('never commits more wisps to one mob than it takes to kill it, over a field of mixed types', () => {
    // This is the rule the one-swallow ordnance bound depends on. A whole
    // volley that all picked the nearest mob would spend itself on one body and
    // kill one thing.
    //
    // The bound is a count of wisps, so it is stated as one: what a body can
    // absorb is how many touches it takes to kill it, and never its raw health.
    // Those were the same sentence only while a wisp did exactly one damage.
    const state = quietRun();
    // Two revenants rather than one, because under the mow (ADR 0059) a
    // shambler and a ghoul absorb three wisps between them and a field of
    // three bodies can no longer hold a level-5 volley at all. The rule under
    // test needs somewhere for every soul to go, or it would pass on a volley
    // that had run out of field rather than on one that spread.
    // The field carries six bodies rather than four because the damage lane
    // moved what a volley can absorb, not because the rule moved: at rung 5 a
    // wisp takes 20, so those four bodies absorb ten souls against a volley of
    // eleven, and the eleventh would over-commit by the line's own surplus
    // rule and make the bound a reading of the fixture instead of the rule.
    const mobs = [
      put(state, 'shambler', 260, 500),
      put(state, 'ghoul', 300, 480),
      put(state, 'revenant', 220, 460),
      put(state, 'revenant', 340, 520),
      put(state, 'revenant', 250, 430),
      put(state, 'revenant', 310, 560),
    ];
    const wisps = volley(state, MAX_LEVEL);
    expect(wisps).toHaveLength(soulsAt(MAX_LEVEL));

    const capacity = mobs.reduce(
      (total, mob) => total + wispsToKill(mob, MAX_LEVEL),
      0,
    );
    expect(wisps.length).toBeLessThanOrEqual(capacity);
    for (const mob of mobs) {
      const committed = wisps.filter((wisp) => wisp.targetId === mob.id).length;
      expect(`${mob.type}: ${committed <= wispsToKill(mob, MAX_LEVEL)}`).toBe(
        `${mob.type}: true`,
      );
    }
  });

  it('spreads across bodies rather than piling on the nearest one', () => {
    const state = quietRun();
    const near = put(state, 'shambler', 270, 560);
    const far = put(state, 'shambler', 270, 300);
    const wisps = volley(state, 3);
    const enough = wispsToKill(near, 3);
    expect(wisps.filter((wisp) => wisp.targetId === near.id)).toHaveLength(
      enough,
    );
    expect(wisps.filter((wisp) => wisp.targetId === far.id)).toHaveLength(
      soulsAt(3) - enough,
    );
  });

  it('over-commits the surplus onto the last target assigned, rather than holding wisps back', () => {
    // The common case rather than a corner: a full volley against one body runs
    // out of uncommitted mobs immediately. Holding the surplus unlaunched would
    // make a levelled line visibly emit less against a thin field, which reads
    // as the upgrade breaking.
    const state = quietRun();
    const only = put(state, 'shambler', 270, 500);
    const wisps = volley(state, MAX_LEVEL);
    expect(wisps).toHaveLength(soulsAt(MAX_LEVEL));
    for (const wisp of wisps) expect(wisp.targetId).toBe(only.id);
  });

  it('launches the full volley with nothing to hunt, and each one expires honestly', () => {
    const state = quietRun();
    const wisps = volley(state, MAX_LEVEL);
    expect(wisps).toHaveLength(soulsAt(MAX_LEVEL));
    for (const wisp of wisps) expect(wisp.targetId).toBeNull();
  });
});

describe("a wisp's flight (plan 6.5)", () => {
  it('expires at WISP_LIFETIME with nothing to hunt', () => {
    const state = quietRun();
    const wisp = requireDefined(volley(state, 1)[0], 'no wisp in the volley');
    for (let tick = 0; tick < WISP_LIFETIME - 1; tick++) advanceWisps(state);
    expect(wisp.alive).toBe(true);
    advanceWisps(state);
    expect(wisp.alive).toBe(false);
  });

  it('holds its speed over its whole life, because the lifetime is derived against it', () => {
    // The heading is renormalized every tick, exactly as a ghoul's chase
    // already is. Rotating the velocity in place would compound f32 rounding of
    // the turn's cosine and sine over a 90-tick life and let the speed drift.
    const state = quietRun();
    put(state, 'shambler', 60, 200);
    const wisp = requireDefined(volley(state, 1)[0], 'no wisp in the volley');
    for (let tick = 0; tick < WISP_LIFETIME - 1; tick++) {
      advanceWisps(state);
      if (!wisp.alive) break;
      const speed = Math.sqrt(wisp.vx * wisp.vx + wisp.vy * wisp.vy);
      expect(speed).toBeCloseTo(WISP_SPEED, 4);
    }
  });

  it('cannot reverse in under a second, so it visibly curves rather than snapping', () => {
    const state = quietRun();
    // Directly behind the grave, so the turn is as hard as the field allows.
    put(state, 'shambler', state.grave.x, state.grave.y + 40);
    const wisp = requireDefined(volley(state, 1)[0], 'no wisp in the volley');
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

  it('turns toward its target rather than away from it', () => {
    const state = quietRun();
    const target = put(state, 'shambler', 100, 400);
    const wisp = requireDefined(volley(state, 1)[0], 'no wisp in the volley');
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

describe('re-targeting (plan 6.5)', () => {
  it('re-targets when its target dies', () => {
    const state = quietRun();
    const first = put(state, 'shambler', 270, 500);
    const wisp = requireDefined(volley(state, 1)[0], 'no wisp in the volley');
    expect(wisp.targetId).toBe(first.id);

    const second = put(state, 'shambler', 200, 400);
    first.alive = false;
    advanceWisps(state);
    expect(wisp.targetId).toBe(second.id);
  });

  it('does not re-target while its target lives, so a flight is not undone every tick', () => {
    // A flight launched from one point with one nearest answer would converge
    // on one mob again, and the assignment rule would be undone every tick.
    const state = quietRun();
    const far = put(state, 'shambler', 100, 300);
    const near = put(state, 'shambler', 270, 560);
    const wisps = volley(state, 4);
    const assigned = wisps.map((wisp) => wisp.targetId);
    expect(new Set(assigned).size).toBeGreaterThan(1);
    for (let tick = 0; tick < 20; tick++) advanceWisps(state);
    expect(liveWisps(state).map((wisp) => wisp.targetId)).toEqual(assigned);
    expect(far.alive && near.alive).toBe(true);
  });
});

describe('the volley interval floors the cadence (ADR 0058 as amended)', () => {
  // The interval's magnitude lands here and the clock that floors it lands in
  // slice E, with the fold commit that declares every new folded field: every
  // field of LineState is folded (witness.ts's foldLines), so a volley clock
  // is a folded field and a folded field moves WITNESS_VERSION, which moves
  // exactly once in this step. These two are it.fails tripwires until then,
  // which is this tree's own idiom for a promise the build does not yet keep.
  // The trigger that flips them to ordinary assertions is slice E's clock.
  it.fails('two swallows inside the volley interval fire one volley', () => {
    // ADR 0058 as amended: the fewest ticks between two volleys, whatever the
    // swallow rate. Under the mow a swallow is continuous, and without the
    // floor the homing line does the mowing and the player does not.
    const state = quietRun();
    put(state, 'shambler', 200, 300);
    state.levels.wisps = 1;
    launchWisps(state, [], 1);
    launchWisps(state, [], 1);

    expect(liveWisps(state)).toHaveLength(soulsAt(1));
  });

  it.fails('a volley skipped by the interval is not banked for later', () => {
    // The deliberate-absence half: a banked volley would pay a stale corpse's
    // freshness on a fresh corpse's tick, so a swallow inside the interval
    // pays nothing at all rather than paying late.
    const state = quietRun();
    put(state, 'shambler', 200, 300);
    state.levels.wisps = 1;
    launchWisps(state, [], 1);
    launchWisps(state, [], 1);
    const launched = new Set(liveWisps(state).map((wisp) => wisp.id));
    for (let tick = 0; tick < WISP_VOLLEY_INTERVAL_TICKS * 2; tick++) {
      advanceWisps(state);
      for (const wisp of liveWisps(state)) launched.add(wisp.id);
    }

    expect(launched.size).toBe(soulsAt(1));
  });
});

describe("the wisps' damage climbs with their rungs (the weapon growth record, section 4)", () => {
  it('a wisp takes the damage its rung states, at every rung', () => {
    // docs/research/weapon-growth-per-level-precedent.md section 4. The column
    // is rounded down rather than recomputed: a flat 25% of 10 gives 12.5 and
    // 17.5 at rungs 2 and 4, and the record authors 12 and 17. Level 0 is a
    // line a run does not hold, so it takes nothing off anything.
    expect([...WISP_DAMAGE_BY_LEVEL]).toEqual([0, 10, 12, 15, 17, 20]);
    for (let level = 0; level <= MAX_LEVEL; level++) {
      expect(wispDamage(level)).toBe(WISP_DAMAGE_BY_LEVEL[level]);
    }
  });

  it('reads no damage past the rungs it authors', () => {
    expect(wispDamage(MAX_LEVEL + 1)).toBe(wispDamage(MAX_LEVEL));
    expect(() => wispDamage(-1)).toThrow();
  });

  it('still scales the count with freshness and never the damage a wisp carries (ADR 0058)', () => {
    // ADR 0058's freshness axis surviving the amendment untouched: the souls
    // are what a rotten corpse buys fewer of, and what one soul takes off a
    // body is the rung's figure whatever the corpse was.
    const fresh = quietRun();
    put(fresh, 'shambler', 200, 300);
    const rotten = quietRun();
    put(rotten, 'shambler', 200, 300);

    expect(
      volley(rotten, MAX_LEVEL, FRESHNESS_PAYOUT_FLOOR).length,
    ).toBeLessThan(volley(fresh, MAX_LEVEL, 1).length);
    expect(wispDamage(MAX_LEVEL)).toBe(20);
  });
});
