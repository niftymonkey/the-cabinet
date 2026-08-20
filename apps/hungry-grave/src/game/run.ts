// A move command in base-speed units, produced by an input model (ADR 0011).
export interface MoveCommand {
  readonly x: number;
  readonly y: number;
}

/**
 * The run's identity and everything the rules mutate as it plays (tracer plan
 * section 3). Score, the ending and the field's entities arrive with the
 * sim-core and field dispatches.
 */
export interface RunState {
  // The seed this run was rolled or pinned with (ADR 0012).
  readonly seed: number;
  // A run's length is counted in ticks, never wall clock.
  tick: number;
}

export function createRun(seed: number): RunState {
  return { seed, tick: 0 };
}
