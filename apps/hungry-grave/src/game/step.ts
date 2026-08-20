import type { SimEvent } from "./events";
import { ageGrave, moveGrave } from "./grave";
import type { MoveCommand, RunState } from "./run";

/**
 * The sim seam: one fixed tick of the game's rules (tracer plan section 3). It
 * hides the order of a tick and holds no rules of its own; every rule belongs
 * to the module that owns it. Run state is mutated in place and the tick's
 * events are returned, because at storm density pooled entities mutated in
 * place are the right answer.
 *
 * The full order of a tick is: scroll, the move command, spawns, motion,
 * overlap detection, deaths, decay, culling, then the tick counter. Spawns
 * onward arrive in the field dispatch, and scroll needs nothing done to it
 * because scroll distance derives from the tick.
 */
export function step(state: RunState, command: MoveCommand): SimEvent[] {
  moveGrave(state.grave, command);
  ageGrave(state.grave);
  state.tick += 1;
  return [];
}
