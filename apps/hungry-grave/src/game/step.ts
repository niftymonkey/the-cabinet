import type { SimEvent } from "./events";
import type { MoveCommand, RunState } from "./run";

/**
 * The sim seam: one fixed tick of the game's rules (tracer plan section 3). It
 * hides the order of a tick and holds no rules of its own; every rule belongs
 * to the module that owns it. Run state is mutated in place and the tick's
 * events are returned, because at storm density pooled entities mutated in
 * place are the right answer.
 */
export function step(state: RunState, command: MoveCommand): SimEvent[] {
  // The stub sim ignores steering; the grave's motion lands in the sim-core
  // dispatch, and the seam keeps the command in its shape until then.
  void command;
  state.tick += 1;
  return [];
}
