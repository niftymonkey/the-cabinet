/**
 * Territory: autonomous controlling ground (ADR 0044).
 *
 * The planned list for #76 pass B, pinned before implementation. Each name is
 * the promise in plain words; the ruling behind it lives inside the test.
 */

import { describe, expect, it } from 'vitest';

import { TERRITORY_CAP } from '../../caps';
import type { SimEvent } from '../../events';
import { FIELD_HEIGHT } from '../../field';
import type { Mob } from '../../mobs';
import { MOB_TYPES, SPAWN_MARGIN, spawnMob } from '../../mobs';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { SCROLL_SPEED } from '../../tuning';
import { MAX_LEVEL } from '../roster';
import type { Patch } from '../territory';
import {
  advanceTerritory,
  holdingPatch,
  PULL_BY_LEVEL,
  RADIUS_BY_LEVEL,
  resolveTerritory,
  SLOW_BY_LEVEL,
  territoryCharge,
  territoryCount,
  TERRITORY_DAMAGE,
  TERRITORY_LEAD_TICKS,
  TERRITORY_OPENING_TICKS,
  REHIT_BY_LEVEL,
  TERRITORY_PERIOD,
  TERRITORY_SPREAD,
} from '../territory';

/** A live mob of a stated type, past its arriving beat, going nowhere. */
function putMob(
  state: RunState,
  x: number,
  y: number,
  type: Mob['type'] = 'shambler',
): Mob {
  const mob = spawnMob(state, type, { x, y, vx: 0, vy: 0, index: 0 })!;
  mob.beat = 0;
  return mob;
}

/** Fills the charge, so the next advance runs the scan. */
function chargeTheLine(state: RunState): void {
  state.lines.layIn = 1;
}

/** One advance with the charge full: the lay happens now if anything is eligible. */
function layNow(state: RunState): SimEvent[] {
  chargeTheLine(state);
  return advanceTerritory(state);
}

function livePatches(state: RunState) {
  return state.patches.filter((patch) => patch.alive);
}

/** Runs every live patch's opening beat down without moving anything else. */
function openTheHands(state: RunState): void {
  for (const patch of state.patches) if (patch.alive) patch.opening = 0;
}

function closings(events: readonly SimEvent[]) {
  return events.filter((event) => event.type === 'patchClosed');
}

/**
 * How far a laid patch ended up from the point the scan chose. Math.sqrt over
 * the squares rather than Math.hypot, which is approximated (ADR 0015).
 */
function offsetFrom(patch: Patch, x: number, y: number): number {
  const dx = patch.x - x;
  const dy = patch.y - y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** The furthest the seeded spread may displace a lay of this radius. */
function spreadBound(radius: number): number {
  return TERRITORY_SPREAD * radius;
}

/**
 * Many lays at one standing knot, the pool emptied between them, so the spread
 * is read over a sample rather than over the one draw a seed happens to open
 * with.
 */
function repeatedLays(state: RunState, mob: Mob, count: number): Patch[] {
  const laid: Patch[] = [];
  const x = mob.x;
  const y = mob.y;
  for (let lay = 0; lay < count; lay++) {
    layNow(state);
    laid.push({ ...livePatches(state)[0]! });
    for (const patch of state.patches) patch.alive = false;
    mob.x = x;
    mob.y = y;
  }
  return laid;
}

/**
 * Open ground of one level, with the hands already up, and the point it
 * claimed. Every dwell test needs the same three lines before it can start.
 */
function openGround(state: RunState, level: number): Patch {
  state.levels.territory = level;
  putMob(state, state.grave.x, 300);
  layNow(state);
  openTheHands(state);
  return livePatches(state)[0]!;
}

/**
 * A mob crossing open ground from its top rim, one whole tick of the world at
 * a time in step.ts's own order: the field scrolls, the mob takes its own
 * motion, the ground drifts and holds, and then the ground pulses.
 *
 * It ends the moment the mob dies or is wholly clear of the ground, so an
 * outcome is what the crossing produced rather than what a fixed budget
 * happened to catch.
 */
function crossTheGround(
  state: RunState,
  patch: Patch,
  mob: Mob,
): { died: boolean; tick: number; hp: number } {
  const clear = patch.radius + MOB_TYPES[mob.type].halfHeight;
  for (let tick = 1; tick <= 4000; tick++) {
    state.tick = tick;
    mob.y += SCROLL_SPEED + mob.vy;
    advanceTerritory(state);
    resolveTerritory(state);
    if (!mob.alive) return { died: true, tick, hp: 0 };
    if (mob.y - patch.y > clear) return { died: false, tick, hp: mob.hp };
  }
  throw new Error('the crossing neither ended nor killed inside the budget');
}

/** A mob of one type held still on open ground until it dies, and its touch count. */
function pulsesToKill(state: RunState, mob: Mob): number {
  let pulses = 0;
  for (let tick = 1; tick <= 4000; tick++) {
    state.tick = tick;
    for (const event of resolveTerritory(state)) {
      if (event.type === 'mobDamaged' && event.id === mob.id) pulses += 1;
    }
    if (!mob.alive) return pulses;
  }
  throw new Error('the mob outlived the budget');
}

/**
 * One tick of the world in step.ts's own order: everything on the field
 * scrolls, the mob takes its own motion, then the patch drifts and the ground
 * holds. The scroll is on both and cancels, so the gap this returns is the mob
 * against the ground alone.
 */
function gapAfterATick(state: RunState, mob: Mob, patch: Patch): number {
  mob.y += SCROLL_SPEED + mob.vy;
  advanceTerritory(state);
  return mob.y - patch.y;
}

describe('the cadence', () => {
  it('the first lay lands when the charge first fills with a target standing ahead', () => {
    // The line acts on its own clock, the bell's ADR 0036 move: nothing the
    // player swallows or presses brings the lay forward.
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    for (let tick = 0; tick < TERRITORY_PERIOD - 1; tick++) {
      advanceTerritory(run);
    }
    expect(territoryCount(run)).toBe(0);
    advanceTerritory(run);
    expect(territoryCount(run)).toBe(1);
  });

  it('consecutive lays sit one period apart when targets are always available', () => {
    // The rate is fixed and tunable rather than riding any collection rate,
    // which is the reason the trigger moved to a clock at all.
    const run = createRun(76);
    const mob = putMob(run, run.grave.x, 300);
    const lays: number[] = [];
    for (let tick = 1; tick <= 3 * TERRITORY_PERIOD; tick++) {
      // Held in place, so the target stays available: laid ground would
      // otherwise drag it out of the window, which is the control's own test.
      mob.x = run.grave.x;
      mob.y = 300;
      const before = territoryCount(run);
      advanceTerritory(run);
      if (territoryCount(run) > before) lays.push(tick);
    }
    expect(lays).toEqual([
      TERRITORY_PERIOD,
      2 * TERRITORY_PERIOD,
      3 * TERRITORY_PERIOD,
    ]);
  });

  it('a full charge with no eligible mob holds and lays on the first tick one appears', () => {
    // The charge never overfills and never resets on an empty field: the
    // ground is claimed the moment something stands where it can be claimed.
    const run = createRun(76);
    for (let tick = 0; tick < TERRITORY_PERIOD + 50; tick++) {
      advanceTerritory(run);
    }
    expect(territoryCount(run)).toBe(0);
    expect(territoryCharge(run)).toBe(1);

    putMob(run, run.grave.x, 300);
    advanceTerritory(run);
    expect(territoryCount(run)).toBe(1);
  });

  it('level 0 never lays', () => {
    // The bell's silent-at-0 pattern: an unowned line does nothing at all.
    const run = createRun(76);
    run.levels.territory = 0;
    putMob(run, run.grave.x, 300);
    for (let tick = 0; tick < 2 * TERRITORY_PERIOD; tick++) {
      advanceTerritory(run);
    }
    expect(territoryCount(run)).toBe(0);
  });

  it('territoryCharge runs 0 to 1 over the period, resets on the lay, and reads 0 at level 0', () => {
    // The renderer's one read of the clock, so the player can see the line
    // acting on its own time.
    const run = createRun(76);
    expect(territoryCharge(run)).toBe(0);
    for (let tick = 0; tick < TERRITORY_PERIOD / 4; tick++) {
      advanceTerritory(run);
    }
    expect(territoryCharge(run)).toBeCloseTo(0.25, 9);

    putMob(run, run.grave.x, 300);
    for (let tick = 0; tick < (3 * TERRITORY_PERIOD) / 4; tick++) {
      advanceTerritory(run);
    }
    expect(territoryCount(run)).toBe(1);
    expect(territoryCharge(run)).toBe(0);

    run.levels.territory = 0;
    expect(territoryCharge(run)).toBe(0);
  });
});

describe('the targeting', () => {
  it('the denser of two clusters wins', () => {
    // The line picks the thickest knot it can see, so the ground goes where
    // the control is worth the most.
    const run = createRun(76);
    putMob(run, 150, 300);
    putMob(run, 160, 300);
    putMob(run, 155, 310);
    putMob(run, 350, 300);
    putMob(run, 360, 300);

    layNow(run);
    const patch = livePatches(run)[0]!;
    // Near the knot rather than on it, and the two candidates are 200 units
    // apart against a bound of 17.6, so the choice is still fully readable.
    expect(offsetFrom(patch, 150, 300)).toBeLessThanOrEqual(
      spreadBound(patch.radius),
    );
  });

  it('equal clusters tie to the earlier slot', () => {
    // Strict comparison against the incumbent, so first in slot order wins and
    // the same field always produces the same lay.
    const run = createRun(76);
    putMob(run, 150, 300);
    putMob(run, 350, 300);

    layNow(run);
    const patch = livePatches(run)[0]!;
    expect(offsetFrom(patch, 150, 300)).toBeLessThanOrEqual(
      spreadBound(patch.radius),
    );
  });

  it('a mob below the grave is never eligible, nor one exactly level with it', () => {
    // The window is ahead of the grave, strictly: ground laid at or behind the
    // player controls nothing the player needs controlled.
    const run = createRun(76);
    putMob(run, run.grave.x, run.grave.y + 40);
    putMob(run, run.grave.x - 60, run.grave.y);

    layNow(run);
    expect(territoryCount(run)).toBe(0);
    expect(territoryCharge(run)).toBe(1);
  });

  it('a mob whose projection sits above the visible top edge is never eligible', () => {
    // The top bound is load-bearing: attrition runs bottom-up, so an unbounded
    // scan would systematically pick intact fresh spawns above the screen and
    // the fire beat would be invisible at the one moment that teaches an
    // autonomous weapon. The edge itself is eligible.
    const run = createRun(76);
    putMob(run, run.grave.x, -1);
    layNow(run);
    expect(territoryCount(run)).toBe(0);

    putMob(run, run.grave.x, 0);
    layNow(run);
    expect(territoryCount(run)).toBe(1);
    const patch = livePatches(run)[0]!;
    expect(patch.y).toBeGreaterThanOrEqual(0);
    expect(patch.y).toBeLessThanOrEqual(spreadBound(patch.radius));
  });

  it('a mob beyond the lateral reach neither anchors nor counts', () => {
    // The window is anchored to the grave's own x, so where the grave goes
    // chooses what the line can see: positioning aims Territory.
    const run = createRun(76);
    putMob(run, run.grave.x + 181, 300);
    layNow(run);
    expect(territoryCount(run)).toBe(0);

    // Inside the reach at 445, with a neighbour past it at 455: the neighbour
    // must not count toward 445's score, so the pair at 150 and 160 wins.
    putMob(run, 445, 300);
    putMob(run, 455, 300);
    putMob(run, 150, 300);
    putMob(run, 160, 300);
    layNow(run);
    const patch = livePatches(run)[0]!;
    expect(offsetFrom(patch, 150, 300)).toBeLessThanOrEqual(
      spreadBound(patch.radius),
    );
  });

  it('a moving mob is met at its projection, not its position', () => {
    // The scan asks where the mob will stand a whole lead from now, which is
    // past the point the hands come up. The patch rides the scroll, so the
    // scroll term cancels and the projection is by the mob's own velocity
    // alone: a lead of (1, 0.5) from (200, 300), and the lay then sits inside
    // the seeded spread of that point rather than on it.
    const run = createRun(76);
    const mob = putMob(run, 200, 300);
    mob.vx = 1;
    mob.vy = 0.5;

    layNow(run);
    const patch = livePatches(run)[0]!;
    expect(
      offsetFrom(
        patch,
        200 + TERRITORY_LEAD_TICKS,
        300 + TERRITORY_LEAD_TICKS * 0.5,
      ),
    ).toBeLessThanOrEqual(spreadBound(patch.radius));
    // Against the mob's own standing point, which is what the projection is
    // for: 100 units away, far outside anything the spread can explain.
    expect(offsetFrom(patch, 200, 300)).toBeGreaterThan(
      spreadBound(patch.radius),
    );
  });

  it('a cluster at the wall gets ground clamped to the field edge', () => {
    // The lay's x is held to the field, so claimed ground is never laid where
    // it cannot be seen or stood on. The knot is 30 units outside it against a
    // spread bound of 17.6, so no draw can bring the lay back inside.
    const run = createRun(76);
    run.grave.x = 100;
    putMob(run, -30, 300);

    layNow(run);
    const patch = livePatches(run)[0]!;
    expect(patch.x).toBe(0);
    expect(Math.abs(patch.y - 300)).toBeLessThanOrEqual(
      spreadBound(patch.radius),
    );
  });
});

describe('the dwell', () => {
  it('one pulse of TERRITORY_DAMAGE lands on overlap, and no second inside the re-hit window', () => {
    // A control zone's identity is many small touches over time in one place,
    // held to a pace by the patch's own re-hit map. The window read here is the
    // patch's own, because that is the one the rule uses.
    const run = createRun(76);
    const mob = putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);
    const patch = livePatches(run)[0]!;

    resolveTerritory(run);
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp - TERRITORY_DAMAGE);
    for (let tick = 1; tick < patch.rehit; tick++) {
      run.tick += 1;
      resolveTerritory(run);
    }
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp - TERRITORY_DAMAGE);
  });

  it('a pulse lands again once the window passes', () => {
    const run = createRun(76);
    const mob = putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);
    const patch = livePatches(run)[0]!;

    resolveTerritory(run);
    for (let tick = 1; tick <= patch.rehit; tick++) {
      run.tick += 1;
      resolveTerritory(run);
    }
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp - 2 * TERRITORY_DAMAGE);
  });

  it('a shambler held on ground start to death takes exactly 8 pulses', () => {
    // The ruled contract is shambler-denominated: 40 health at 5 a pulse is 8
    // pulses, and the kill is slow on purpose. The count is what is ruled and
    // the level moves only how long the ground takes to deliver it, so this
    // holds at every rung and is asserted against the patch's own window.
    const run = createRun(76);
    const mob = putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);
    const patch = livePatches(run)[0]!;

    let pulses = 0;
    let killed = false;
    for (let tick = 0; tick < 8 * patch.rehit && !killed; tick++) {
      for (const event of resolveTerritory(run)) {
        if (event.type === 'mobDamaged' && event.id === mob.id) pulses += 1;
        if (event.type === 'mobKilled' && event.id === mob.id) killed = true;
      }
      run.tick += 1;
    }
    expect(killed).toBe(true);
    expect(pulses).toBe(8);
  });

  it('expired map entries are pruned', () => {
    // The map is bounded at mobs seen inside the last window, so ground that
    // holds a parade all run does not remember every body that ever crossed.
    const run = createRun(76);
    const mob = putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);
    const patch = livePatches(run)[0]!;

    resolveTerritory(run);
    expect(patch.struck.size).toBe(1);

    mob.alive = false;
    run.tick += patch.rehit;
    resolveTerritory(run);
    expect(patch.struck.size).toBe(0);
  });
});

describe('the control', () => {
  it('an overlapping mob is displaced toward the centre and its own motion cut', () => {
    // The patch drifts with the world before the ground grips, so the mob is
    // placed against the post-drift centre. At level 1 the pull is 0.08 toward
    // the centre and the slow undoes 0.2 of (2, 4): twenty units left of
    // centre that is a net -0.32 in x and -0.8 in y.
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);
    const patch = livePatches(run)[0]!;

    const centreX = patch.x;
    const centreY = patch.y + SCROLL_SPEED;
    const mob = putMob(run, centreX - 20, centreY);
    mob.vx = 2;
    mob.vy = 4;

    advanceTerritory(run);
    expect(mob.x).toBeCloseTo(centreX - 20 - 0.4 + PULL_BY_LEVEL[1], 9);
    expect(mob.y).toBeCloseTo(centreY - 0.8, 9);
  });

  it('no control and no pulse while opening', () => {
    // The opening beat matters more, not less, when the sim picks the moment:
    // the player reads the tear before the ground holds anything.
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    layNow(run);
    const patch = livePatches(run)[0]!;
    expect(patch.opening).toBeGreaterThan(0);

    const mob = putMob(run, patch.x, patch.y + SCROLL_SPEED);
    mob.vx = 2;
    const x = mob.x;

    advanceTerritory(run);
    expect(mob.x).toBe(x);
    expect(resolveTerritory(run)).toEqual([]);
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp);
  });

  it('a mob at the exact centre gets slow but no pull', () => {
    // A zero-length vector has no direction to pull along, and inventing one
    // would jitter a settled mob. Slow still applies: held is held.
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);
    const patch = livePatches(run)[0]!;

    const mob = putMob(run, patch.x, patch.y + SCROLL_SPEED);
    mob.vx = 2;
    mob.vy = 0;
    const centreX = patch.x;
    const centreY = patch.y + SCROLL_SPEED;

    advanceTerritory(run);
    expect(mob.x).toBeCloseTo(centreX - SLOW_BY_LEVEL[1] * 2, 9);
    expect(mob.y).toBeCloseTo(centreY, 9);
  });

  it('displacement clamps at the harness bounds', () => {
    // The pushMob discipline: the player's own line must never shove a mob out
    // of the box the invariant harness checks.
    // Level 5, so the patch is wide enough to hold a mob near the bottom
    // bound while its own body still touches the field.
    const run = createRun(76);
    run.levels.territory = 5;
    putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);
    const patch = livePatches(run)[0]!;
    patch.y = 850;

    const mob = putMob(run, patch.x, 910);
    mob.vx = 0;
    mob.vy = -30;

    advanceTerritory(run);
    expect(mob.y).toBe(FIELD_HEIGHT + SPAWN_MARGIN);
  });
});

describe('the closes', () => {
  it('a scrolled close carries its pulse count', () => {
    // "Scrolled off having touched nothing" is the read Territory exists to
    // answer, and it is invisible from the reason alone.
    const run = createRun(76);
    const mob = putMob(run, run.grave.x, 300);
    layNow(run);
    mob.alive = false;
    const patch = livePatches(run)[0]!;
    patch.pulses = 3;

    let closed: SimEvent[] = [];
    for (let tick = 0; tick < 4000 && closed.length === 0; tick++) {
      closed = closings(advanceTerritory(run));
    }
    expect(closed).toHaveLength(1);
    expect(closed[0]).toMatchObject({ reason: 'scrolled', pulses: 3 });
    expect(territoryCount(run)).toBe(0);
  });

  it('ground that touched nothing closes with zero', () => {
    const run = createRun(76);
    const mob = putMob(run, run.grave.x, 300);
    layNow(run);
    mob.alive = false;

    let closed: SimEvent[] = [];
    for (let tick = 0; tick < 4000 && closed.length === 0; tick++) {
      closed = closings(advanceTerritory(run));
    }
    expect(closed).toHaveLength(1);
    expect(closed[0]).toMatchObject({ reason: 'scrolled', pulses: 0 });
  });

  it('eviction takes the oldest by id', () => {
    // The cap is housekeeping and never a refusal: the oldest ground has done
    // its work, and oldest by id is totally ordered where slot order is not.
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    for (let lay = 0; lay < TERRITORY_CAP; lay++) {
      layNow(run);
    }
    expect(territoryCount(run)).toBe(TERRITORY_CAP);
    const ids = livePatches(run).map((patch) => patch.id);
    const oldest = Math.min(...ids);

    const events = layNow(run);
    const evicted = closings(events);
    expect(evicted).toHaveLength(1);
    expect(evicted[0]).toMatchObject({ reason: 'evicted' });
    expect(territoryCount(run)).toBe(TERRITORY_CAP);
    expect(livePatches(run).map((patch) => patch.id)).not.toContain(oldest);
  });

  it('radius is frozen at birth across a level-up', () => {
    // Frozen at birth, on bell.ts's own precedent: a live ring keeps the level
    // it was born with, and level-ups reach only patches laid afterwards.
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    layNow(run);
    const early = livePatches(run)[0]!;
    expect(early.radius).toBe(32);

    run.levels.territory = 5;
    layNow(run);
    const late = livePatches(run).find((patch) => patch !== early)!;
    expect(late.radius).toBe(104);
    expect(early.radius).toBe(32);
    expect(RADIUS_BY_LEVEL[1]).toBe(32);
    expect(RADIUS_BY_LEVEL[5]).toBe(104);
  });
});

/**
 * #76 pass C: the control ladders, the wider cadence and the bounded seeded
 * offset (ADR 0044, amended 2026-08-28).
 */
describe('the control ladders', () => {
  it('the ladders climb with the level, and level 0 controls nothing', () => {
    // Levels buy control strength as well as area. A ladder that ever held
    // level to level would sell a rung that bought nothing, which is the shape
    // of the flat pull the playtest found.
    for (const ladder of [RADIUS_BY_LEVEL, PULL_BY_LEVEL, SLOW_BY_LEVEL]) {
      expect(ladder).toHaveLength(MAX_LEVEL + 1);
      expect(ladder[0]).toBe(0);
      for (let level = 2; level <= MAX_LEVEL; level++) {
        expect(`${level}: ${ladder[level] > ladder[level - 1]}`).toBe(
          `${level}: true`,
        );
      }
    }
  });

  it('a level-one patch slows and chips a shambler but cannot hold it', () => {
    // The playtest's own finding: the line arrived at full strength and pinned
    // ordinary mobs at level 1. A shambler keeps 0.253 of its own 0.317
    // against a pull of 0.08, so it goes on leaving at 0.173 a tick while the
    // ground chips it. Slow and chip is the whole of what the first rung buys.
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);
    const patch = livePatches(run)[0]!;

    const mob = putMob(run, patch.x, patch.y + SCROLL_SPEED + 4);
    mob.vy = MOB_TYPES.shambler.speed;
    const gaps = [
      gapAfterATick(run, mob, patch),
      gapAfterATick(run, mob, patch),
    ];
    for (let tick = 0; tick < 18; tick++) {
      gaps.push(gapAfterATick(run, mob, patch));
    }

    for (let step = 1; step < gaps.length; step++) {
      expect(`${step}: ${gaps[step] > gaps[step - 1]}`).toBe(`${step}: true`);
    }
    expect(gaps[1] - gaps[0]).toBeCloseTo(
      MOB_TYPES.shambler.speed * (1 - SLOW_BY_LEVEL[1]) - PULL_BY_LEVEL[1],
      9,
    );
    resolveTerritory(run);
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp - TERRITORY_DAMAGE);
  });

  it('a level-five patch holds a shambler against its own motion', () => {
    // The top of the ladder is close to a death sentence for an ordinary mob:
    // 0.127 kept against a pull of 0.6, so the ground wins back ground every
    // tick and the shambler ends at the centre.
    const run = createRun(76);
    run.levels.territory = 5;
    putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);
    const patch = livePatches(run)[0]!;

    const mob = putMob(run, patch.x, patch.y + SCROLL_SPEED + 40);
    mob.vy = MOB_TYPES.shambler.speed;
    const gaps = [
      gapAfterATick(run, mob, patch),
      gapAfterATick(run, mob, patch),
    ];
    for (let tick = 0; tick < 18; tick++) {
      gaps.push(gapAfterATick(run, mob, patch));
    }

    for (let step = 1; step < gaps.length; step++) {
      expect(`${step}: ${gaps[step] < gaps[step - 1]}`).toBe(`${step}: true`);
    }
    expect(gaps[1] - gaps[0]).toBeCloseTo(
      MOB_TYPES.shambler.speed * (1 - SLOW_BY_LEVEL[5]) - PULL_BY_LEVEL[5],
      9,
    );
  });

  it('a ghoul pulls free of level-five ground', () => {
    // The one type that leaves at every rung, and it is deliberate: the ghoul
    // is the body threat, so ground that could pin it would answer the type
    // positioning is supposed to answer. 0.63 kept against a pull of 0.6.
    const run = createRun(76);
    run.levels.territory = 5;
    putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);
    const patch = livePatches(run)[0]!;

    const mob = putMob(run, patch.x, patch.y + SCROLL_SPEED + 4, 'ghoul');
    mob.vy = MOB_TYPES.ghoul.speed;
    const gaps = [
      gapAfterATick(run, mob, patch),
      gapAfterATick(run, mob, patch),
    ];
    for (let tick = 0; tick < 18; tick++) {
      gaps.push(gapAfterATick(run, mob, patch));
    }

    for (let step = 1; step < gaps.length; step++) {
      expect(`${step}: ${gaps[step] > gaps[step - 1]}`).toBe(`${step}: true`);
    }
    expect(gaps[1] - gaps[0]).toBeCloseTo(
      MOB_TYPES.ghoul.speed * (1 - SLOW_BY_LEVEL[5]) - PULL_BY_LEVEL[5],
      9,
    );
  });

  it('control strength is frozen at birth across a level-up', () => {
    // Frozen at birth on bell.ts's precedent, and it is the control now and
    // not only the radius: a patch laid at level 1 goes on holding at level 1
    // for its whole life, however far the line climbs under it.
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    layNow(run);
    const early = livePatches(run)[0]!;
    expect(early.pull).toBe(PULL_BY_LEVEL[1]);
    expect(early.slow).toBe(SLOW_BY_LEVEL[1]);

    run.levels.territory = 5;
    layNow(run);
    const late = livePatches(run).find((patch) => patch !== early)!;
    expect(late.pull).toBe(PULL_BY_LEVEL[5]);
    expect(late.slow).toBe(SLOW_BY_LEVEL[5]);
    expect(early.pull).toBe(PULL_BY_LEVEL[1]);
    expect(early.slow).toBe(SLOW_BY_LEVEL[1]);

    // And the hold obeys the captured strength rather than the run's level.
    openTheHands(run);
    late.alive = false;
    const mob = putMob(run, early.x, early.y + SCROLL_SPEED);
    mob.vx = 1;
    advanceTerritory(run);
    expect(mob.x).toBeCloseTo(early.x - SLOW_BY_LEVEL[1], 9);
  });

  it('the radius ladder starts at 32 and each rung buys 1.8 times the area', () => {
    // The old ladder grew area by 1.5 from a level 1 that was already large,
    // and the steps did not read. Rounding to whole field units is what keeps
    // the ratio near 1.8 rather than on it.
    expect(RADIUS_BY_LEVEL[1]).toBe(32);
    for (let level = 2; level <= MAX_LEVEL; level++) {
      const step = RADIUS_BY_LEVEL[level] / RADIUS_BY_LEVEL[level - 1];
      const area = step * step;
      expect(`${level}: ${Math.abs(area - 1.8) < 0.05}`).toBe(`${level}: true`);
    }
  });
});

describe('the wider cadence', () => {
  it('the charge takes 832 ticks to fill', () => {
    // The 2026-08-30 desktop playtest called the 500-tick cadence spammy:
    // less often and more deadly. The measured baseline (two tapes on #79)
    // shows the clock maxed, 22 lays per 12421-tick run, with deadliness per
    // crossing already saturated at 104 deaths in 105 crossings. The first
    // playtest's cut was roughly 60% of the rate (300 / 0.6 = 500); the same
    // cut again is 500 / 0.6 = 833.33, landing on 832 so the quarter-period
    // checkpoints other tests read stay whole ticks; one tick has no gameplay
    // meaning at this scale. The next tapes judge about 14 lays per run and
    // more kills per lay than the baseline's ~2.4. The magnitude is pinned
    // here and nowhere else; every other cadence test reads the constant.
    expect(TERRITORY_PERIOD).toBe(832);
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    for (let tick = 0; tick < 831; tick++) advanceTerritory(run);
    expect(territoryCount(run)).toBe(0);
    advanceTerritory(run);
    expect(territoryCount(run)).toBe(1);
  });

  it('the opening beat is 68 ticks', () => {
    // The beat is now only how long the delivery takes to read, and at 90 it
    // outstayed its welcome: three quarters of 90 is 67.5. The magnitude is
    // pinned here and nowhere else; every other test reads the constant.
    expect(TERRITORY_OPENING_TICKS).toBe(68);
    const run = createRun(76);
    putMob(run, 200, 300);

    layNow(run);
    expect(livePatches(run)[0]!.opening).toBe(TERRITORY_OPENING_TICKS);
  });

  it('the lead runs past the opening beat, so ground opens up-field of the crowd', () => {
    // Aiming the scan at the beat aims it at the crowd's own feet: the mob
    // arrives exactly as the hands come up, so the ground reads as laid on top
    // of it. Overshooting the beat lays the ground between the crowd and the
    // grave and opens it while they are still walking in. What is pinned is
    // the relation and not the overshoot's size, so the two numbers can be
    // tuned apart without rewriting the promise.
    expect(TERRITORY_LEAD_TICKS).toBeGreaterThan(TERRITORY_OPENING_TICKS);

    const run = createRun(76);
    const mob = putMob(run, 200, 300);
    mob.vy = 1;

    layNow(run);
    const patch = livePatches(run)[0]!;
    // The lay is at the lead's projection, not the beat's.
    expect(offsetFrom(patch, 200, 300 + TERRITORY_LEAD_TICKS)).toBeLessThan(
      spreadBound(patch.radius),
    );
    // The patch rides the scroll, so where the mob stands when the hands come
    // up is its own 68 ticks on. That point is still short of the ground by
    // more than the spread can explain, which is the whole overshoot.
    const whenTheHandsComeUp = 300 + TERRITORY_OPENING_TICKS;
    expect(patch.y - whenTheHandsComeUp).toBeGreaterThan(
      spreadBound(patch.radius),
    );
  });
});

describe('the bounded seeded offset', () => {
  it('ground lands near its prediction and never exactly on it', () => {
    // Ground that opens with the cluster already at its centre reads as mobs
    // spawning with the patch instead of being caught by it, so the lay is
    // displaced. Uniform over the disc puts the mean at two thirds of the
    // bound, which is why "near" is not "almost on".
    const run = createRun(76);
    const mob = putMob(run, 270, 300);
    const laid = repeatedLays(run, mob, 200);

    const distances = laid.map((patch) => offsetFrom(patch, 270, 300));
    expect(distances.filter((each) => each === 0)).toEqual([]);
    const mean = distances.reduce((sum, each) => sum + each, 0) / laid.length;
    expect(mean).toBeCloseTo((2 / 3) * spreadBound(RADIUS_BY_LEVEL[1]), 0);
  });

  it("the offset is bounded by 0.55 of the patch's radius", () => {
    // Relative to the radius at every level on purpose: ADR 0044 rules that
    // higher levels must not converge on exact placement, so the bound has to
    // grow with the ground rather than stay a fixed number of field units.
    for (let level = 1; level <= MAX_LEVEL; level++) {
      const run = createRun(76);
      run.levels.territory = level;
      const mob = putMob(run, 270, 300);
      const laid = repeatedLays(run, mob, 200);
      const bound = spreadBound(RADIUS_BY_LEVEL[level]);

      const furthest = Math.max(
        ...laid.map((patch) => offsetFrom(patch, 270, 300)),
      );
      expect(`${level}: ${furthest <= bound}`).toBe(`${level}: true`);
      // And the bound is reached rather than merely respected, so the
      // assertion above is not passing over a spread that never opens up.
      expect(`${level}: ${furthest > bound * 0.9}`).toBe(`${level}: true`);
    }
  });

  it("one lay draws exactly twice from Territory's own stream", () => {
    // An angle and a distance, and no third draw hiding in the lay: the count
    // is what a replay resumes from, so it is pinned rather than assumed.
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    const before = run.streams.territory.drawn;

    layNow(run);
    expect(territoryCount(run)).toBe(1);
    expect(run.streams.territory.drawn).toBe(before + 2);
  });

  it('a lay draws from no other stream', () => {
    // The correlated-randomness trap ADR 0012 closes: a lay reaching into
    // another line's stream would shift every draw after it and change the run
    // for a reason no player could read.
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    const before = {
      spawns: run.streams.spawns.drawn,
      drops: run.streams.drops.drawn,
      mobFire: run.streams.mobFire.drawn,
      shed: run.streams.shed.drawn,
    };

    layNow(run);
    expect(territoryCount(run)).toBe(1);
    expect(run.streams.spawns.drawn).toBe(before.spawns);
    expect(run.streams.drops.drawn).toBe(before.drops);
    expect(run.streams.mobFire.drawn).toBe(before.mobFire);
    expect(run.streams.shed.drawn).toBe(before.shed);
  });

  it('a scan that finds nothing draws nothing', () => {
    // A full charge rescans every tick, so a stream touched before the knot
    // was chosen would burn a draw on every empty tick and the offsets would
    // depend on how long the field stayed empty.
    const run = createRun(76);
    for (let tick = 0; tick < TERRITORY_PERIOD + 50; tick++) {
      advanceTerritory(run);
    }
    expect(territoryCharge(run)).toBe(1);
    expect(run.streams.territory.drawn).toBe(0);

    putMob(run, run.grave.x, 300);
    advanceTerritory(run);
    expect(territoryCount(run)).toBe(1);
    expect(run.streams.territory.drawn).toBe(2);
  });

  it('the same seed lays the same ground twice', () => {
    // The offset is seeded and never ambient, which is what keeps a tape a
    // recording rather than a description (ADR 0015).
    const script = () => {
      const run = createRun(4242);
      const mob = putMob(run, 270, 300);
      return repeatedLays(run, mob, 20).map((patch) => `${patch.x} ${patch.y}`);
    };
    expect(script()).toEqual(script());
  });

  it('the offset never lifts ground above the visible top edge', () => {
    // The top bound is the one eligiblePoints calls load-bearing, and an
    // offset able to break it would put claimed ground where the fire beat
    // cannot be seen. Half the draws point upward from a knot on the edge, so
    // the clamp is exercised rather than merely present.
    const run = createRun(76);
    const mob = putMob(run, 270, 0);
    const laid = repeatedLays(run, mob, 200);

    expect(laid.filter((patch) => patch.y < 0)).toEqual([]);
    expect(laid.filter((patch) => patch.y === 0).length).toBeGreaterThan(0);
  });

  it('the offset never puts ground behind the grave', () => {
    // ADR 0044's boundary reading against ADR 0035 rests on the scan being
    // anchored ahead of the grave, so an offset able to drop ground behind it
    // would reopen the homing question the record closed.
    const run = createRun(76);
    run.levels.territory = 5;
    const mob = putMob(run, 270, run.grave.y - 1);
    const laid = repeatedLays(run, mob, 200);

    expect(laid.filter((patch) => patch.y > run.grave.y)).toEqual([]);
    expect(
      laid.filter((patch) => patch.y === run.grave.y).length,
    ).toBeGreaterThan(0);
  });
});

/**
 * #76 pass C, the dwell slice: the pace of the pulses joins the pull and the
 * slow on a level ladder (ADR 0044, amended 2026-08-28).
 *
 * The ruled touch counts do not move with it. Only the time the ground takes
 * to deliver them does, which is what makes an early rung survivable without
 * changing what any line costs a body.
 */
describe('the dwell ladder', () => {
  it('the re-hit ladder climbs with the level, and level 0 pulses nothing', () => {
    // The window shortens at every rung, so the ground grinds faster the
    // higher the line climbs. Level 0 is the same zero the other two ladders
    // carry, and behaviourally an unowned line never lays, so no ground of
    // its exists to pulse at all.
    expect(REHIT_BY_LEVEL).toHaveLength(MAX_LEVEL + 1);
    expect(REHIT_BY_LEVEL[0]).toBe(0);
    for (let level = 2; level <= MAX_LEVEL; level++) {
      expect(
        `${level}: ${REHIT_BY_LEVEL[level] < REHIT_BY_LEVEL[level - 1]}`,
      ).toBe(`${level}: true`);
    }

    const run = createRun(76);
    run.levels.territory = 0;
    putMob(run, run.grave.x, 300);
    for (let tick = 0; tick < 2 * TERRITORY_PERIOD; tick++) {
      advanceTerritory(run);
      expect(resolveTerritory(run)).toEqual([]);
    }
  });

  it('the re-hit window is frozen at birth across a level-up', () => {
    // The third channel of control strength, held on the same terms as the
    // other two: a patch grinds at the pace its birth level bought, however
    // far the line climbs under it.
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    layNow(run);
    const early = livePatches(run)[0]!;
    expect(early.rehit).toBe(REHIT_BY_LEVEL[1]);

    run.levels.territory = 5;
    layNow(run);
    const late = livePatches(run).find((patch) => patch !== early)!;
    expect(late.rehit).toBe(REHIT_BY_LEVEL[5]);
    expect(early.rehit).toBe(REHIT_BY_LEVEL[1]);

    // And the rule reads the patch rather than the run: the early ground is
    // still on its slow window while the line stands at 5.
    openTheHands(run);
    late.alive = false;
    const mob = putMob(run, early.x, early.y + SCROLL_SPEED);
    resolveTerritory(run);
    for (let tick = 1; tick < REHIT_BY_LEVEL[1]; tick++) {
      run.tick += 1;
      resolveTerritory(run);
    }
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp - TERRITORY_DAMAGE);
  });

  it('a shambler walks out of level-one ground alive', () => {
    // The rung Mark's ruling asks for: early ground slows and chips, and an
    // ordinary mob caught in it comes out the far side. Five pulses over a
    // 327-tick crossing is 25 of its 40, so the cost is real and the mob is
    // still a problem.
    const run = createRun(76);
    const patch = openGround(run, 1);
    const mob = putMob(
      run,
      patch.x,
      patch.y - patch.radius - MOB_TYPES.shambler.halfHeight,
    );
    mob.vy = MOB_TYPES.shambler.speed;

    const crossing = crossTheGround(run, patch, mob);
    expect(crossing.died).toBe(false);
    expect(crossing.hp).toBe(MOB_TYPES.shambler.hp - 5 * TERRITORY_DAMAGE);
  });

  it('a shambler dies in level-five ground, and sooner than in level-three ground', () => {
    // The other end of the ruling: late ground is close to a death sentence,
    // and the rungs between it and the speed bump grind visibly faster each
    // step rather than flipping from harmless to lethal.
    const deaths = new Map<number, number>();
    for (const level of [3, 5]) {
      const run = createRun(76);
      const patch = openGround(run, level);
      const mob = putMob(
        run,
        patch.x,
        patch.y - patch.radius - MOB_TYPES.shambler.halfHeight,
      );
      mob.vy = MOB_TYPES.shambler.speed;

      const crossing = crossTheGround(run, patch, mob);
      expect(`level ${level} died: ${crossing.died}`).toBe(
        `level ${level} died: true`,
      );
      deaths.set(level, crossing.tick);
    }
    expect(deaths.get(5)!).toBeLessThan(deaths.get(3)!);
  });

  it('the top rung is the old flat window, so the ruled touch counts are unmoved', () => {
    // The ladder moves the pace and nothing else. TERRITORY_DAMAGE stays 5
    // against the ruled health scale (#76 pass A, ghoul 20 by #79), so the
    // counts the record rules are the counts the ground still takes: a
    // shambler 8, a ghoul 4, a revenant 13.
    expect(REHIT_BY_LEVEL[MAX_LEVEL]).toBe(30);

    const counts = new Map<Mob['type'], number>();
    for (const type of ['shambler', 'ghoul', 'revenant'] as const) {
      const run = createRun(76);
      const patch = openGround(run, MAX_LEVEL);
      const mob = putMob(run, patch.x, patch.y, type);
      counts.set(type, pulsesToKill(run, mob));
    }
    expect(counts.get('shambler')).toBe(8);
    expect(counts.get('ghoul')).toBe(4);
    expect(counts.get('revenant')).toBe(13);
  });
});

/**
 * #79: the holding-ground seam and the patch's birth rung, the one new game
 * seam the control reading asks instead of duplicating the body-overlap rule.
 */
describe('the holding ground', () => {
  it('the holding patch is found by body overlap, never by centre distance', () => {
    // The seam answers with the same rule the control uses: a mob visibly
    // standing in the hands is held even when its centre sits outside the
    // radius. A level-1 patch reaches 32 and a shambler's half-width is 11, so
    // a centre 42 out overlaps by body while a centre-distance rule says no.
    const run = createRun(79);
    putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);
    const patch = livePatches(run)[0]!;

    const held = putMob(run, patch.x + 42, patch.y);
    expect(holdingPatch(run, held)).toBe(patch);

    // And two units further the body clears the ground, so the overlap rule
    // is what answered rather than any looser reach.
    const clear = putMob(run, patch.x + 44, patch.y);
    expect(holdingPatch(run, clear)).toBeNull();
  });

  it('ground still opening holds nothing', () => {
    // Open means the hands are up: a patch in its opening beat cannot control
    // or pulse, so it must not be anyone's holding ground either.
    const run = createRun(79);
    putMob(run, run.grave.x, 300);
    layNow(run);
    const patch = livePatches(run)[0]!;
    expect(patch.opening).toBeGreaterThan(0);

    const mob = putMob(run, patch.x, patch.y);
    expect(holdingPatch(run, mob)).toBeNull();

    openTheHands(run);
    expect(holdingPatch(run, mob)).toBe(patch);
  });

  it('overlapping ground answers with the first patch in slot order', () => {
    // Attribution is a decision rather than an accident (#79 spec): a mob over
    // two overlapping patches belongs to the first in slot order, so a reading
    // asking the seam gets one deterministic answer.
    const run = createRun(79);
    putMob(run, run.grave.x, 300);
    layNow(run);
    layNow(run);
    openTheHands(run);
    const [first, second] = livePatches(run);
    second!.x = first!.x;
    second!.y = first!.y;

    const mob = putMob(run, first!.x, first!.y);
    expect(holdingPatch(run, mob)).toBe(run.patches[0]);
  });

  it('the birth rung is captured at the lay and survives a level-up', () => {
    // The rung joins the radius and the strengths the level bought, on the
    // same frozen-at-birth terms: a patch laid at level 1 answers for level 1
    // ground however far the line climbs under it.
    const run = createRun(79);
    putMob(run, run.grave.x, 300);
    layNow(run);
    const early = livePatches(run)[0]!;
    expect(early.level).toBe(1);

    run.levels.territory = 5;
    layNow(run);
    const late = livePatches(run).find((patch) => patch !== early)!;
    expect(late.level).toBe(5);
    expect(early.level).toBe(1);
  });
});
