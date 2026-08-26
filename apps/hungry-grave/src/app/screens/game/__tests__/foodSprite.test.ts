/**
 * The food on the field: how bright a corpse draws as it drains, and the colour
 * every tier is named in.
 */

import { describe, expect, it } from 'vitest';

import { TICK_HZ } from '../../../../game/clock';
import type { Corpse } from '../../../../game/corpses';
import { spawnCorpse } from '../../../../game/corpses';
import type { Mob, MobType } from '../../../../game/mobs';
import { MOB_TYPES, spawnMob } from '../../../../game/mobs';
import type { RunState } from '../../../../game/run';
import { createRun } from '../../../../game/run';
import { CORPSE_TIERS } from '../../../palette';
import { FLICKER_HALF_PERIOD, freshnessBrightness } from '../foodSprite';

function put(state: RunState, type: MobType, x: number, y: number) {
  return spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 })!;
}

/**
 * The corpse a dead mob leaves, spawned the way mobs.ts spawns it: the mob
 * table is mobs.ts's, so a kill's payout and tier reach corpses.ts as values
 * read off the dead mob's own row.
 */
function leaveCorpse(state: RunState, mob: Mob) {
  const row = MOB_TYPES[mob.type];
  return spawnCorpse(state, mob, row.corpsePayout, row.corpseTier);
}

/**
 * A wave killed in one burst, down to the freshness that flickers. The mobs all
 * die before any corpse is spawned, so the corpse ids run consecutively the way
 * one storm tick's kills do.
 */
function flickering(state: RunState, count: number): Corpse[] {
  const dead = [];
  for (let index = 0; index < count; index++) {
    const mob = put(state, 'shambler', 40 + index * 30, 100);
    mob.alive = false;
    dead.push(mob);
  }
  for (const mob of dead) leaveCorpse(state, mob);
  const wave = state.corpses.filter((corpse) => corpse.alive);
  for (const corpse of wave) corpse.freshness = 0.1;
  return wave;
}

describe('foodSprite', () => {
  it('flickers a nearly empty corpse and never a feast', () => {
    const state = createRun(1);
    const dead = put(state, 'shambler', 60, 100);
    dead.alive = false;
    leaveCorpse(state, dead);
    const corpse = state.corpses.find((each) => each.alive)!;
    corpse.freshness = 0.05;
    const over = [0, 6, 12, 18].map((tick) =>
      freshnessBrightness(corpse, tick),
    );
    expect(new Set(over).size).toBeGreaterThan(1);

    const feast = { ...corpse, decays: false, freshness: 1 };
    expect(freshnessBrightness(feast, 0)).toBe(1);
    expect(freshnessBrightness(feast, 6)).toBe(1);
  });

  it('names a colour for every corpse tier the sim can produce', () => {
    for (const type of ['shambler', 'revenant', 'ghoul'] as const) {
      const tier = MOB_TYPES[type].corpseTier;
      expect(`${type} ${tier in CORPSE_TIERS}`).toBe(`${type} true`);
    }
  });
});

describe("dispatch 4's readability findings, fixed here (plan 6.20)", () => {
  it("clears WCAG SC 2.3.1's three-flashes floor on the corpse flicker", () => {
    // A single corpse was covered by the criterion's small-area exemption. A
    // whole wave killed in one burst is not, and nothing could produce a burst
    // kill before the storm existed.
    //
    // The floor is tuning.ts's own derivation, restated for a flicker rather
    // than for a hit: the worst case for a period of p seconds is floor(1 / p)
    // plus 1, so three flashes a second needs a full period over 20 ticks and a
    // half period of at least 11.
    const flashesPerSecond =
      Math.floor(TICK_HZ / (FLICKER_HALF_PERIOD * 2)) + 1;
    expect(FLICKER_HALF_PERIOD).toBeGreaterThanOrEqual(11);
    expect(flashesPerSecond).toBeLessThanOrEqual(3);
  });

  it('flickers two corpses killed on the same tick out of phase', () => {
    // The pair is two ids apart rather than adjacent. An offset that reduces
    // to the id's parity puts every corpse in one of two lockstep halves, and
    // two adjacent ids land in different halves, so an adjacent pair reads as
    // out of phase whether the offset spreads the wave or splits it in two.
    const state = createRun(3);
    const wave = flickering(state, 3);
    const [a, , c] = wave;
    expect(c.id - a.id).toBe(2);

    const differed = [];
    for (let tick = 0; tick < FLICKER_HALF_PERIOD * 4; tick++) {
      differed.push(
        freshnessBrightness(a, tick) !== freshnessBrightness(c, tick),
      );
    }
    expect(differed.some((apart) => apart)).toBe(true);
  });

  it('switches only a fraction of a burst-killed wave on any one tick', () => {
    // The hazard SC 2.3.1 is written about is a large area changing luminance
    // together, so what the offset has to buy is a small area per switch. A
    // wave in two halves changes half of itself at once; spread across the
    // period it changes a twelfth.
    const state = createRun(5);
    const wave = flickering(state, FLICKER_HALF_PERIOD);
    let before = wave.map((corpse) => freshnessBrightness(corpse, 0));
    let most = 0;
    for (let tick = 1; tick <= FLICKER_HALF_PERIOD * 4; tick++) {
      const now = wave.map((corpse) => freshnessBrightness(corpse, tick));
      const switched = now.filter((value, at) => value !== before[at]).length;
      most = Math.max(most, switched);
      before = now;
    }
    expect(most).toBeLessThanOrEqual(
      Math.ceil(wave.length / FLICKER_HALF_PERIOD),
    );
  });
});
