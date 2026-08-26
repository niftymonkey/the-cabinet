// What the game screen tells the end screen about the run that just ended.

import type { Execution } from '../game/execution';
import type { FaultIdentity } from '../game/faults';
import type { RunEnding, RunState } from '../game/run';

/**
 * The fatal fault that stopped a run: its identity and the tick it first fired
 * on, which is enough to file a bug from a phone screenshot.
 */
interface FaultSummary {
  readonly identity: FaultIdentity;
  readonly firstTick: number;
}

/**
 * A snapshot of values rather than the run itself, because run state is mutated
 * in place and the next run reuses it.
 */
interface RunSummary {
  readonly seed: number;
  readonly ticks: number;
  /**
   * Which way the run finished. Null is a run the player ended themselves from
   * the pause menu, which is neither ending and must not claim to be one: the
   * grave is never destroyed or killed, it is sealed.
   */
  readonly ending: RunEnding | null;
  /**
   * The fatal fault that stopped the run, or null when the instrument did not
   * stop it. It rides here because the stop reason and the fault record live on
   * Execution and never on witness-folded RunState (ADR 0024), so the ending
   * alone cannot tell a quit from a malfunction.
   */
  readonly fault: FaultSummary | null;
}

/**
 * The fault the end state names, read off the authority's own de-duplicated
 * record: the first fatal fault in first-seen order, and nothing at all when
 * the authority did not stop the run.
 */
const stoppingFault = (execution: Execution): FaultSummary | null => {
  if (execution.stop !== 'faulted') return null;
  const fatal = execution.faults.find((record) => record.severity === 'fatal');
  if (fatal === undefined) return null;
  return { identity: fatal.identity, firstTick: fatal.firstTick };
};

const summarizeRun = (state: RunState, execution: Execution): RunSummary => {
  return {
    seed: state.seed,
    ticks: state.tick,
    ending: state.ending,
    fault: stoppingFault(execution),
  };
};

export { summarizeRun };
export type { FaultSummary, RunSummary };
