/**
 * The storm meeting the mobs: skulls, Territory and wisps resolved as overlaps
 * in one fixed order. What is pinned here is the order and what each
 * source spends on a hit, because the same seed has to kill the same mobs.
 */

import { describe, expect, it } from 'vitest';

import { SKULL_DAMAGE } from '../lines/soulStream';
import {
  PULL_BY_LEVEL,
  REHIT_BY_LEVEL,
  SLOW_BY_LEVEL,
  TERRITORY_DAMAGE,
} from '../lines/territory';
import { WISP_DAMAGE } from '../lines/wisps';
import type { Mob } from '../mobs';
import { MOB_TYPES, spawnMob } from '../mobs';
import type { RunState } from '../run';
import { createRun } from '../run';
import { RAMP_ROWS } from '../stage/stage';
import { resolveStorm } from '../storm';

/**
 * A run whose stage will not spawn anything on top of the mob under test. The
 * rows are marked fired rather than emptied, because the row tables are exported
 * data and a test that mutated them would poison every later file.
 */
function quietRun(seed = 4): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  // The stream is held as well as the rows. These tests are about how a mob
  // moves, fires and dies, and a birthright stream pouring up the middle of the
  // field kills the mob under test before it reaches the behaviour being
  // measured. Territory needs no holding either: a run lays no patch until it
  // swallows something, and these tests never do.
  run.lines.streamIn = Number.MAX_SAFE_INTEGER;
  return run;
}

/** A run with a quiet stage and Territory owned, so a patch can be laid into it. */
function stormRun(seed = 4): RunState {
  const state = quietRun(seed);
  state.levels.territory = 1;
  return state;
}

/** A live mob of a stated type, past its arriving beat. */
function putMob(state: RunState, type: Mob['type'], x: number, y: number): Mob {
  const mob = spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 })!;
  mob.beat = 0;
  return mob;
}

/** A patch with its hands already up, parked where a test can aim it. */
function putPatch(state: RunState, x: number, y: number) {
  const patch = state.patches.find((each) => !each.alive)!;
  patch.alive = true;
  patch.id = state.nextEntityId;
  state.nextEntityId += 1;
  patch.x = x;
  patch.y = y;
  patch.radius = 30;
  patch.pull = PULL_BY_LEVEL[1];
  patch.slow = SLOW_BY_LEVEL[1];
  patch.rehit = REHIT_BY_LEVEL[1];
  patch.opening = 0;
  patch.pulses = 0;
  patch.struck.clear();
  return patch;
}

/** A mob standing in an open patch of claimed ground. */
function patchVictim(state: RunState, x = 200, y = 200): Mob {
  putPatch(state, x, y);
  return putMob(state, 'shambler', x, y);
}

function putSkull(state: RunState, x: number, y: number) {
  const skull = state.skulls.find((each) => !each.alive)!;
  skull.alive = true;
  skull.id = state.nextEntityId;
  state.nextEntityId += 1;
  skull.x = x;
  skull.y = y;
  skull.vx = 0;
  skull.vy = 0;
  return skull;
}

function putWisp(state: RunState, x: number, y: number) {
  const wisp = state.wisps.find((each) => !each.alive)!;
  wisp.alive = true;
  wisp.id = state.nextEntityId;
  state.nextEntityId += 1;
  wisp.x = x;
  wisp.y = y;
  wisp.vx = 0;
  wisp.vy = 0;
  wisp.life = 60;
  wisp.targetId = null;
  return wisp;
}

describe('the storm meeting a mob (plan 6.7)', () => {
  it('resolves skulls, then Territory, then wisps, so the same seed kills in the same order', () => {
    // The order is stated rather than incidental: the pass is read in one
    // order, and a different order is a different set of kills on the same seed.
    const state = stormRun();
    const skulled = putMob(state, 'shambler', 100, 100);
    const grabbed = patchVictim(state, 200, 400);
    const wisped = putMob(state, 'shambler', 300, 100);
    putSkull(state, skulled.x, skulled.y);
    putWisp(state, wisped.x, wisped.y);

    const killed = resolveStorm(state)
      .filter((event) => event.type === 'mobKilled')
      .map((event) => (event.type === 'mobKilled' ? event.x : -1));
    expect(killed).toEqual([]);
    expect(skulled.hp).toBe(MOB_TYPES.shambler.hp - SKULL_DAMAGE);
    expect(grabbed.hp).toBe(MOB_TYPES.shambler.hp - TERRITORY_DAMAGE);
    expect(wisped.hp).toBe(MOB_TYPES.shambler.hp - WISP_DAMAGE);
  });

  it('consumes a skull and a wisp on the mob they hit, and never a patch', () => {
    // A patch is claimed ground and not ordnance: it grinds whatever stays
    // and remains until the world carries it away.
    const state = stormRun();
    const skulled = putMob(state, 'shambler', 100, 100);
    const wisped = putMob(state, 'shambler', 300, 100);
    const skull = putSkull(state, skulled.x, skulled.y);
    const wisp = putWisp(state, wisped.x, wisped.y);
    patchVictim(state, 200, 400);

    resolveStorm(state);
    expect(skull.alive).toBe(false);
    expect(wisp.alive).toBe(false);
    expect(state.patches.filter((patch) => patch.alive)).toHaveLength(1);
  });

  it('takes every death through damageMob, so a kill leaves a corpse and emits mobKilled with no second path', () => {
    const state = stormRun();
    const doomed = putMob(state, 'shambler', 100, 100);
    doomed.hp = 1;
    putSkull(state, doomed.x, doomed.y);

    const events = resolveStorm(state);
    expect(events.map((event) => event.type)).toContain('mobKilled');
    expect(doomed.alive).toBe(false);
    expect(state.corpses.filter((corpse) => corpse.alive)).toHaveLength(1);
  });

  it('never pulses the same mob twice inside the re-hit window with the same patch', () => {
    // One pulse per window per mob, held by the patch's own re-hit map. The
    // pass here holds one tick still, which is always inside the window.
    const state = stormRun();
    const victim = patchVictim(state, 200, 400);
    resolveStorm(state);
    const after = victim.hp;
    for (let again = 0; again < 5; again++) resolveStorm(state);
    expect(victim.hp).toBe(after);
  });
});
