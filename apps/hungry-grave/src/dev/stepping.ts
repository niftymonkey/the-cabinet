/**
 * How a sim test drives one run, part of ADR 0013's verification rig.
 *
 * It exists because two things changed at once. Every executed tick now crosses
 * executeTick (ADR 0017), and a caller needs an Execution to reach it, one per
 * run: a wrapper that built a throwaway one per call would put a fresh stage
 * watch on every step, so the two stage invariants would compare against
 * nothing and silently stop checking.
 *
 * And a check records a fault and returns rather than throwing (ADR 0017). The
 * throw was what made a broken invariant fail the sim test that stepped into
 * it, so the failing is this rig's job now. It throws on the first tick that
 * records a fault, which is where the old harness threw, and it names every
 * fault the tick recorded rather than only the first: the whole reason a check
 * no longer throws is that one fault must not switch the later checks off.
 *
 * IT THROWS ON EVERY FAULT, RECOVERABLE INCLUDED, and that is not a severity
 * judgment. ADR 0017's rule is that a recoverable fault must never terminate
 * execution in any build, and the rig is not a build: nothing here is handed to
 * a player, and a unit test that reaches a state the game can survive has still
 * found a bug in what it was asserting about. So the rig's policy is "no fault
 * at all" rather than "no fatal fault", and severity is the shipped paths'
 * question to answer.
 */

import type { Execution } from '../game/execution';
import { createExecution, executeTick } from '../game/execution';
import type { SimEvent } from '../game/events';
import type { RunState, TickCommand } from '../game/run';

/** One run's steps, each returning the tick's events. */
export type Stepper = (command: TickCommand) => readonly SimEvent[];

function describeFaults(execution: Execution): string {
  return execution.faults
    .map((fault) => `${fault.identity} (${fault.severity}): ${fault.detail}`)
    .join('; ');
}

/**
 * A run's authority, wrapped as the one call a sim test makes. The Execution is
 * made here, beside the run, exactly as the rendered screen makes it.
 */
export function stepping(run: RunState): Stepper {
  const execution = createExecution(run);
  return (command) => {
    const events = executeTick(execution, command);
    if (execution.faults.length > 0) {
      throw new Error(
        `sim invariant broken on tick ${run.tick}, ${describeFaults(execution)}`,
      );
    }
    return events;
  };
}
