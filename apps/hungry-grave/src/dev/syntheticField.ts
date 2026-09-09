// A field of a chosen size, stood rather than played: the field a frame-budget
// measurement needs, which no tape can hold because nobody ever played it.

import type { PoolSlot } from '../game/caps';
import { liveCount, takeSlot } from '../game/caps';
import { CORPSE_HALF_EXTENT } from '../game/corpses';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../game/field';
import type { MobType } from '../game/mobs';
import { MOB_TYPES, MOB_TYPE_NAMES, spawnMob } from '../game/mobs';
import type { RunState } from '../game/run';

/** How many bodies and how much food stand on the field at one instant. */
interface FieldSize {
  readonly mobs: number;
  readonly corpses: number;
}

// One place on the field, in the field's own units.
interface Place {
  readonly x: number;
  readonly y: number;
}

/**
 * The nth of a count of places, spread over the field on a near-square grid.
 *
 * Spread rather than piled, because the renderer's cost is per sprite and the
 * simulation's overlap work is per pair: a heap at one point would measure a
 * field nobody can produce, in both directions at once.
 */
const placeOf = (index: number, count: number): Place => {
  const columns = Math.max(1, Math.ceil(Math.sqrt(count)));
  const rows = Math.max(1, Math.ceil(count / columns));
  const column = index % columns;
  const row = Math.floor(index / columns);
  return {
    x: ((column + 0.5) / columns) * FIELD_WIDTH,
    y: ((row + 0.5) / rows) * FIELD_HEIGHT,
  };
};

/**
 * The type the nth body takes, cycled through the roster so a stood field
 * carries the mix a played one does. The three types differ in size, in motion
 * and in whether they fire, and all three of those are frame cost.
 */
const typeOf = (index: number): MobType => {
  const name = MOB_TYPE_NAMES[index % MOB_TYPE_NAMES.length];
  if (name === undefined) throw new Error('the mob type table is empty');
  return name;
};

/**
 * Everything the pool holds above the count, put down, last slot first.
 *
 * A run does not only lose entities while it is being driven: the stage spawns
 * bodies of its own and a kill drops food, so a build whose pools are larger
 * than the field being measured drifts upward the moment it is driven. A field
 * is held at its size from both directions or it is not held at all.
 *
 * Last slot first so the trim is the same on every run, and it clears the slot
 * rather than culling it: a cull is the rules putting a body down and pays out,
 * and nothing here is a thing that happened in the run.
 */
const clearSurplus = (pool: readonly PoolSlot[], count: number): void => {
  let live = liveCount(pool);
  for (let index = pool.length - 1; index >= 0 && live > count; index--) {
    const slot = pool[index];
    if (slot === undefined || !slot.alive) continue;
    slot.alive = false;
    live -= 1;
  }
};

/**
 * One body per empty place, through the game's own spawn.
 *
 * It counts from what is already alive rather than from zero, so a caller may
 * ask for the same size on every tick and get the field back each time. The
 * place is the size's own grid, so a body replacing one the scroll took away
 * lands where the field is thinnest rather than piling on the survivors.
 *
 * A refused slot is a bug in the caller's caps rather than a case to handle:
 * this builder promises the size it was asked for, and a field one body short
 * is a measurement of the wrong field reported as the right one.
 */
const standMobs = (run: RunState, count: number): void => {
  clearSurplus(run.mobs, count);
  for (let index = liveCount(run.mobs); index < count; index++) {
    const place = placeOf(index, count);
    const mob = spawnMob(
      run,
      typeOf(index),
      { x: place.x, y: place.y, vx: 0, vy: 1, index },
      false,
    );
    if (mob === null) {
      throw new Error(
        `the mob pool holds ${run.mobs.length} slots and the field asked for ${count}`,
      );
    }
  }
};

/**
 * One corpse per empty place, claimed and filled here rather than through
 * spawnCorpse, which takes the body a kill put down and there is no kill here.
 * Every field is the one a fresh corpse carries, so the food decays and pays
 * exactly as a played one does, and the count starts from what is already
 * alive for the same reason the bodies do.
 */
const standCorpses = (run: RunState, count: number): void => {
  clearSurplus(run.corpses, count);
  for (let index = liveCount(run.corpses); index < count; index++) {
    const place = placeOf(index, count);
    const corpse = takeSlot(run.corpses, run.nextEntityId);
    if (corpse === null) {
      throw new Error(
        `the corpse pool holds ${run.corpses.length} slots and the field asked for ${count}`,
      );
    }
    run.nextEntityId += 1;
    corpse.x = place.x;
    corpse.y = place.y;
    corpse.freshness = 1;
    corpse.payout = MOB_TYPES.shambler.corpsePayout;
    corpse.tier = MOB_TYPES.shambler.corpseTier;
    corpse.kind = 'corpse';
    corpse.decays = true;
    corpse.line = undefined;
    corpse.halfExtent = CORPSE_HALF_EXTENT;
  }
};

/**
 * The run's field, stood at the size asked for and held there.
 *
 * Held rather than only stood, and held from both directions. A field decays:
 * the scroll carries bodies off the bottom edge and freshness empties a corpse
 * in ten seconds. A field also grows: the stage spawns bodies of its own and a
 * kill drops food. Either way a field stood once and then driven for a few
 * seconds is a measurement of something other than the field. A caller stands
 * the same size on every tick and measures the size it named.
 *
 * The run is the caller's, because the pools it was made with are what decide
 * whether the size fits at all, and what holds the field at its ceiling: a pool
 * sized to the field is what stops the run's own kills from standing more food
 * than the measurement asked for. That is a fact about the build rather than
 * about this call.
 */
const standSyntheticField = (run: RunState, size: FieldSize): void => {
  standMobs(run, size.mobs);
  standCorpses(run, size.corpses);
};

export { standSyntheticField };
export type { FieldSize };
