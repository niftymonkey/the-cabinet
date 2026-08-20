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

// One past the largest seed a roll can produce, the top of a 31-bit range.
const SEED_LIMIT = 0x7fffffff;

/**
 * The one place chance enters a run. Everything after this reads the seeded
 * streams, so a run's identity is decided once and then replays (ADR 0012).
 */
function rollSeed(): number {
  return Math.floor(Math.random() * SEED_LIMIT);
}

/**
 * Starts a run: with no seed it rolls one, and with a seed it pins the run to
 * that seed and replays it (ADR 0012). The roll lives here rather than in a
 * screen so a run's identity is the sim's, and so ?seed= has one place to
 * plug into.
 */
export function createRun(seed: number = rollSeed()): RunState {
  return { seed, tick: 0 };
}
