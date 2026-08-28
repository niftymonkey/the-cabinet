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
import {
  advanceTerritory,
  RADIUS_BY_LEVEL,
  resolveTerritory,
  territoryCharge,
  territoryCount,
  TERRITORY_DAMAGE,
  TERRITORY_OPENING_TICKS,
  TERRITORY_PERIOD,
  TERRITORY_REHIT_TICKS,
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
    expect(patch.x).toBe(150);
    expect(patch.y).toBe(300);
  });

  it('equal clusters tie to the earlier slot', () => {
    // Strict comparison against the incumbent, so first in slot order wins and
    // the same field always produces the same lay.
    const run = createRun(76);
    putMob(run, 150, 300);
    putMob(run, 350, 300);

    layNow(run);
    const patch = livePatches(run)[0]!;
    expect(patch.x).toBe(150);
    expect(patch.y).toBe(300);
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
    expect(livePatches(run)[0]!.y).toBe(0);
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
    expect(patch.x).toBe(150);
    expect(patch.y).toBe(300);
  });

  it('a moving mob is met at its projection, not its position', () => {
    // The patch cannot bite until the hands come up, so the scan asks where
    // the mob will stand exactly then. The patch rides the scroll, so the
    // scroll term cancels and the projection is by the mob's own velocity
    // alone: 24 ticks of (1, 0.5) from (200, 300) is (224, 312).
    const run = createRun(76);
    const mob = putMob(run, 200, 300);
    mob.vx = 1;
    mob.vy = 0.5;

    layNow(run);
    const patch = livePatches(run)[0]!;
    expect(TERRITORY_OPENING_TICKS).toBe(24);
    expect(patch.x).toBe(224);
    expect(patch.y).toBe(312);
  });

  it('a cluster at the wall gets ground clamped to the field edge', () => {
    // The lay's x is held to the field, so claimed ground is never laid where
    // it cannot be seen or stood on. The y is not clamped: up-field is legal.
    const run = createRun(76);
    run.grave.x = 100;
    putMob(run, -30, 300);

    layNow(run);
    const patch = livePatches(run)[0]!;
    expect(patch.x).toBe(0);
    expect(patch.y).toBe(300);
  });

  it('the scan draws no randomness', () => {
    // Deterministic by construction: a lay that drew from any stream would
    // shift every draw after it and change the run for a reason no player
    // could read.
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
});

describe('the dwell', () => {
  it('one pulse of TERRITORY_DAMAGE lands on overlap, and no second inside the re-hit window', () => {
    // A control zone's identity is many small touches over time in one place,
    // held to a cadence by the patch's own re-hit map.
    const run = createRun(76);
    const mob = putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);

    resolveTerritory(run);
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp - TERRITORY_DAMAGE);
    for (let tick = 1; tick < TERRITORY_REHIT_TICKS; tick++) {
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

    resolveTerritory(run);
    for (let tick = 1; tick <= TERRITORY_REHIT_TICKS; tick++) {
      run.tick += 1;
      resolveTerritory(run);
    }
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp - 2 * TERRITORY_DAMAGE);
  });

  it('a shambler held on ground start to death takes exactly 8 pulses', () => {
    // The ruled contract is shambler-denominated: 40 health at 5 a pulse is 8
    // pulses, 210 ticks of dwell, and the kill is slow on purpose.
    const run = createRun(76);
    const mob = putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);

    let pulses = 0;
    let killed = false;
    for (let tick = 0; tick < 8 * TERRITORY_REHIT_TICKS && !killed; tick++) {
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
    run.tick += TERRITORY_REHIT_TICKS;
    resolveTerritory(run);
    expect(patch.struck.size).toBe(0);
  });
});

describe('the control', () => {
  it('an overlapping mob is displaced toward the centre and its own motion halved', () => {
    // The patch drifts with the world before the ground grips, so the mob is
    // placed against the post-drift centre. Pull is 0.5 toward the centre and
    // slow undoes half of (2, 4): thirty units left of centre that is a net
    // -0.5 in x and -2 in y.
    const run = createRun(76);
    putMob(run, run.grave.x, 300);
    layNow(run);
    openTheHands(run);
    const patch = livePatches(run)[0]!;

    const centreX = patch.x;
    const centreY = patch.y + SCROLL_SPEED;
    const mob = putMob(run, centreX - 30, centreY);
    mob.vx = 2;
    mob.vy = 4;

    advanceTerritory(run);
    expect(mob.x).toBeCloseTo(centreX - 30.5, 9);
    expect(mob.y).toBeCloseTo(centreY - 2, 9);
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
    expect(mob.x).toBeCloseTo(centreX - 1, 9);
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
    expect(early.radius).toBe(48);

    run.levels.territory = 5;
    layNow(run);
    const late = livePatches(run).find((patch) => patch !== early)!;
    expect(late.radius).toBe(108);
    expect(early.radius).toBe(48);
    expect(RADIUS_BY_LEVEL[1]).toBe(48);
    expect(RADIUS_BY_LEVEL[5]).toBe(108);
  });
});
