/**
 * The sim invariant harness (ADR 0013): in bounds, size within floor and
 * ceiling, no NaN, entity caps, checked on every step in every sim test.
 *
 * It lives in src/dev because it is the test rig and not the game. Shipping it
 * inside src/game would make the rig load-bearing in the built app.
 *
 * Checking a cap is not enforcing one. caps.ts enforces; this only notices.
 */

import type { PoolSlot } from "../game/caps";
import { CORPSE_CAP, MOB_CAP, MOB_FIRE_CAP } from "../game/caps";
import type { SimEvent } from "../game/events";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../game/field";
import { graveHitbox } from "../game/grave";
import { SPAWN_MARGIN } from "../game/mobs";
import type { MoveCommand, RunState } from "../game/run";
import { step } from "../game/step";
import { SIZE_CEILING, SIZE_FLOOR } from "../game/tuning";

function fail(invariant: string, detail: string): never {
  throw new Error(`sim invariant broken, ${invariant}: ${detail}`);
}

function checkFinite(numbers: Record<string, number>): void {
  for (const [where, value] of Object.entries(numbers)) {
    if (!Number.isFinite(value)) fail("no NaN", `${where} is ${value}`);
  }
}

/** Every number the rules mutate. A NaN anywhere in here poisons the run silently. */
function checkNoNaN(state: RunState): void {
  checkFinite({
    tick: state.tick,
    score: state.score,
    reservoir: state.reservoir,
    "grave.x": state.grave.x,
    "grave.y": state.grave.y,
    "grave.size": state.grave.size,
    "grave.invulnerable": state.grave.invulnerable,
  });
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    checkFinite({
      [`mob ${mob.id}.x`]: mob.x,
      [`mob ${mob.id}.y`]: mob.y,
      [`mob ${mob.id}.vx`]: mob.vx,
      [`mob ${mob.id}.vy`]: mob.vy,
      [`mob ${mob.id}.hp`]: mob.hp,
    });
  }
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    checkFinite({
      [`shot ${shot.id}.x`]: shot.x,
      [`shot ${shot.id}.y`]: shot.y,
      [`shot ${shot.id}.vx`]: shot.vx,
      [`shot ${shot.id}.vy`]: shot.vy,
    });
  }
  for (const corpse of state.corpses) {
    if (!corpse.alive) continue;
    checkFinite({
      [`corpse ${corpse.id}.x`]: corpse.x,
      [`corpse ${corpse.id}.y`]: corpse.y,
      [`corpse ${corpse.id}.freshness`]: corpse.freshness,
    });
  }
}

/** Size is health, and ADR 0003 makes both ends of it hard. */
function checkSize(state: RunState): void {
  const { size } = state.grave;
  if (size < SIZE_FLOOR || size > SIZE_CEILING) {
    fail("size within floor and ceiling", `size is ${size}`);
  }
}

/**
 * Rounding room, in field units. containGrave holds the grave's centre at
 * FIELD_HEIGHT minus its size, and the hitbox then computes (y - size) + 2 *
 * size, which is not the same binary64 expression: re-associating it overshoots
 * by up to 1.1e-13 at sizes the grave actually reaches. The tolerance is eleven
 * thousand times larger than that worst case and four thousand times smaller
 * than one CSS pixel on a phone, so a grave that has really left the field can
 * never hide under it.
 */
const BOUNDS_TOLERANCE = 1e-9;

/** The whole grave, not just its centre, stays on the field. */
function checkInBounds(state: RunState): void {
  const box = graveHitbox(state.grave);
  const inside =
    box.x >= -BOUNDS_TOLERANCE &&
    box.y >= -BOUNDS_TOLERANCE &&
    box.x + box.width <= FIELD_WIDTH + BOUNDS_TOLERANCE &&
    box.y + box.height <= FIELD_HEIGHT + BOUNDS_TOLERANCE;
  if (!inside) {
    fail("in bounds", `the grave is outside the field at ${box.x}, ${box.y}`);
  }
}

/** A point inside the field widened by a margin on every side. */
function within(x: number, y: number, margin: number): boolean {
  return (
    x >= -margin &&
    y >= -margin &&
    x <= FIELD_WIDTH + margin &&
    y <= FIELD_HEIGHT + margin
  );
}

/**
 * Mobs and corpses legitimately exist above the top edge before they arrive, so
 * the box they are checked against is the field widened by a spawn margin.
 * Shots never spawn off the field, so they are only allowed their own extent.
 */
function checkEntitiesInBounds(state: RunState): void {
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    if (!within(mob.x, mob.y, SPAWN_MARGIN)) {
      fail("entities in bounds", `mob ${mob.id} is at ${mob.x}, ${mob.y}`);
    }
  }
  for (const corpse of state.corpses) {
    if (!corpse.alive) continue;
    if (!within(corpse.x, corpse.y, SPAWN_MARGIN)) {
      fail(
        "entities in bounds",
        `corpse ${corpse.id} is at ${corpse.x}, ${corpse.y}`,
      );
    }
  }
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    if (!within(shot.x, shot.y, shot.halfExtent)) {
      fail("entities in bounds", `shot ${shot.id} is at ${shot.x}, ${shot.y}`);
    }
  }
}

function checkPool(name: string, pool: readonly PoolSlot[], cap: number): void {
  if (pool.length > cap) {
    fail("entity caps", `the ${name} pool holds ${pool.length} slots`);
  }
  const seen = new Set<number>();
  for (const slot of pool) {
    if (!slot.alive) continue;
    if (seen.has(slot.id)) {
      fail("entity ids", `two live ${name} slots share id ${slot.id}`);
    }
    seen.add(slot.id);
  }
}

function checkPools(state: RunState): void {
  checkPool("mob", state.mobs, MOB_CAP);
  checkPool("mob fire", state.mobFire, MOB_FIRE_CAP);
  checkPool("corpse", state.corpses, CORPSE_CAP);
}

/** Freshness is a meter from 1 to 0 and never leaves that range (ADR 0004). */
function checkFreshness(state: RunState): void {
  for (const corpse of state.corpses) {
    if (!corpse.alive) continue;
    if (corpse.freshness < 0 || corpse.freshness > 1) {
      fail(
        "freshness in range",
        `corpse ${corpse.id} has freshness ${corpse.freshness}`,
      );
    }
  }
}

interface StageWatch {
  phaseIndex: number;
  phaseTick: number;
}

/**
 * What the last check saw of the stage, so the two invariants that are about
 * change rather than about a single state have something to compare with. A
 * WeakMap keyed by the run, so a run that goes out of scope takes its watch
 * with it and two runs in one test never share one.
 */
const stageWatches = new WeakMap<RunState, StageWatch>();

/**
 * The phase index only ever increases, and the phase-local tick resets at a
 * boundary. The tick is read after the step has already advanced it, so a reset
 * shows as a tick of one rather than of zero.
 */
function checkStage(state: RunState): void {
  const seen = stageWatches.get(state);
  const now = {
    phaseIndex: state.stage.phaseIndex,
    phaseTick: state.stage.phaseTick,
  };
  stageWatches.set(state, now);
  if (seen === undefined) return;
  if (now.phaseIndex < seen.phaseIndex) {
    fail(
      "phase index only increases",
      `phase went from ${seen.phaseIndex} to ${now.phaseIndex}`,
    );
  }
  if (now.phaseIndex > seen.phaseIndex && now.phaseTick > 1) {
    fail(
      "phase tick resets at a boundary",
      `phase tick is ${now.phaseTick} on the tick the phase changed`,
    );
  }
}

/** Throws with the failing invariant named, on any state the rules must never produce (ADR 0013). */
export function checkInvariants(state: RunState): void {
  checkNoNaN(state);
  checkSize(state);
  checkInBounds(state);
  checkEntitiesInBounds(state);
  checkPools(state);
  checkFreshness(state);
  checkStage(state);
}

/** step() with the invariants checked after it. Every sim test steps through this, never through step directly. */
export function stepChecked(state: RunState, command: MoveCommand): SimEvent[] {
  const events = step(state, command);
  checkInvariants(state);
  return events;
}
