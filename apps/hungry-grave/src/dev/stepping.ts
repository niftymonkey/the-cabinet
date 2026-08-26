// How a sim test drives one run, part of ADR 0013's verification rig.

import type { Execution } from '../game/execution';
import { createExecution, executeTick } from '../game/execution';
import type { SimEvent } from '../game/events';
import type { TickCommand } from '../game/command';
import type { RunState } from '../game/run';

// One run's steps, each returning the tick's events.
type Stepper = (command: TickCommand) => readonly SimEvent[];

const describeFaults = (execution: Execution): string => {
  return execution.faults
    .map((fault) => `${fault.identity} (${fault.severity}): ${fault.detail}`)
    .join('; ');
};

/**
 * A run's authority, wrapped as the one call a sim test makes. The Execution is
 * made here, beside the run, exactly as the rendered screen makes it.
 *
 * One Execution per run, never a throwaway built per call: a fresh stage watch
 * on every step would leave the two stage invariants comparing against nothing
 * and silently checking nothing.
 */
const stepping = (run: RunState): Stepper => {
  const execution = createExecution(run);
  return (command) => {
    const events = executeTick(execution, command);
    // A check records a fault and returns rather than throwing (ADR 0017), so
    // failing the sim test that stepped into a broken invariant is this rig's
    // job. It throws on the first tick that records a fault, and it names every
    // fault that tick recorded rather than only the first: the whole reason a
    // check no longer throws is that one fault must not switch the later checks
    // off.
    //
    // IT THROWS ON EVERY FAULT, RECOVERABLE INCLUDED, and that is not a
    // severity judgment. ADR 0017's rule is that a recoverable fault must never
    // terminate execution in any build, and the rig is not a build: nothing
    // here is handed to a player, and a unit test that reaches a state the game
    // can survive has still found a bug in what it was asserting about. So the
    // rig's policy is "no fault at all" rather than "no fatal fault", and
    // severity is the shipped paths' question to answer.
    if (execution.faults.length > 0) {
      throw new Error(
        `sim invariant broken on tick ${run.tick}, ${describeFaults(execution)}`,
      );
    }
    return events;
  };
};

export { stepping };
export type { Stepper };
