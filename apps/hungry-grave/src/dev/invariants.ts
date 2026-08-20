/**
 * The sim invariant harness (ADR 0013): in bounds, size within floor and
 * ceiling, no NaN, entity caps, checked on every step in every sim test.
 *
 * It lives in src/dev because it is the test rig and not the game. Shipping it
 * inside src/game would make the rig load-bearing in the built app.
 */

import type { SimEvent } from "../game/events";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../game/field";
import { graveHitbox } from "../game/grave";
import type { MoveCommand, RunState } from "../game/run";
import { step } from "../game/step";
import { SIZE_CEILING, SIZE_FLOOR } from "../game/tuning";

function fail(invariant: string, detail: string): never {
  throw new Error(`sim invariant broken, ${invariant}: ${detail}`);
}

/** Every number the rules mutate. A NaN anywhere in here poisons the run silently. */
function checkNoNaN(state: RunState): void {
  const numbers: Record<string, number> = {
    tick: state.tick,
    score: state.score,
    reservoir: state.reservoir,
    "grave.x": state.grave.x,
    "grave.y": state.grave.y,
    "grave.size": state.grave.size,
    "grave.invulnerable": state.grave.invulnerable,
  };
  for (const [where, value] of Object.entries(numbers)) {
    if (!Number.isFinite(value)) fail("no NaN", `${where} is ${value}`);
  }
}

/** Size is health, and ADR 0003 makes both ends of it hard. */
function checkSize(state: RunState): void {
  const { size } = state.grave;
  if (size < SIZE_FLOOR || size > SIZE_CEILING) {
    fail("size within floor and ceiling", `size is ${size}`);
  }
}

/** The whole grave, not just its centre, stays on the field. */
function checkInBounds(state: RunState): void {
  const box = graveHitbox(state.grave);
  const inside =
    box.x >= 0 &&
    box.y >= 0 &&
    box.x + box.width <= FIELD_WIDTH &&
    box.y + box.height <= FIELD_HEIGHT;
  if (!inside) {
    fail("in bounds", `the grave is outside the field at ${box.x}, ${box.y}`);
  }
}

/** Throws with the failing invariant named, on any state the rules must never produce (ADR 0013). */
export function checkInvariants(state: RunState): void {
  checkNoNaN(state);
  checkSize(state);
  checkInBounds(state);
}

/** step() with the invariants checked after it. Every sim test steps through this, never through step directly. */
export function stepChecked(state: RunState, command: MoveCommand): SimEvent[] {
  const events = step(state, command);
  checkInvariants(state);
  return events;
}
