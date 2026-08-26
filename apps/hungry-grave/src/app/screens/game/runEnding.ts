// How a run reaches its end state, sealing its record exactly once and retrying only the way out.

import type { SimEvent } from '../../../game/events';
import type { Execution } from '../../../game/execution';
import type { RunState } from '../../../game/run';
import { engine } from '../../getEngine';
import { runHandoff } from '../../runHandoff';
import { summarizeRun } from '../../runSummary';
import { EndScreen } from '../EndScreen';

/** What the ending needs from the run around it, at the moment it takes the run away. */
interface EndingPowers {
  // The tape's trailer, written once at the stop.
  sealTape(execution: Execution): void;
  // The sealed bytes, which outlive the recorder the pooled screen is about to drop.
  tapeBytes(): Uint8Array | null;
  // The countdown's blur, so the end state is never reached from behind it.
  clearFieldBlur(): void;
}

interface RunEnding {
  /**
   * Whether this run is over: the trailer is sealed, the handoff holds the
   * captured bytes, and the frame seam holds every later frame still. It
   * latches up at the first end() and only reset() lowers it, because a
   * lowered latch would let a post-stop frame read live and step a run whose
   * own record says it stopped.
   */
  readonly ended: boolean;
  end(run: RunState | null, execution: Execution | null): void;
  reset(): void;
}

/**
 * One ending's own state. It is the module's private machine and never leaves
 * it; a caller only ever sees the RunEnding above.
 */
interface Ending {
  ended: boolean;
  /**
   * Whether a navigation to the end state is in flight. It is the half of the
   * old ending guard that does come back down on a failed showScreen, so the
   * frame seam can retry the way out while the sealed record stays sealed.
   */
  navigating: boolean;
  readonly powers: EndingPowers;
}

// Whether this frame's events ended the run, either way (ADR 0003 and ADR 0007).
const endedIn = (events: readonly SimEvent[]): boolean => {
  return events.some(
    (event) => event.type === 'sealed' || event.type === 'victory',
  );
};

/**
 * Takes the run to its end state, sealing the record exactly once.
 *
 * The capture is once-only and only the navigation retries. showScreen can
 * reject, and the frame seam then calls back in while the run stays over: a
 * retry that re-entered the capture would re-encode the tape and re-record
 * the handoff on every failing frame, folding the frames after the stop into
 * the exported artifact. Captured once, the artifact is frozen at the stop
 * however many retries the way out takes.
 */
const end = (
  ending: Ending,
  run: RunState | null,
  execution: Execution | null,
): void => {
  if (run === null || execution === null) return;
  if (!ending.ended) {
    ending.ended = true;
    ending.powers.clearFieldBlur();
    ending.powers.sealTape(execution);
    runHandoff.record(summarizeRun(run, execution), ending.powers.tapeBytes());
  }
  if (ending.navigating) return;
  ending.navigating = true;
  engine()
    .navigation.showScreen(EndScreen)
    .catch((error) => {
      // A failed navigation releases the navigation guard alone, so the
      // frame seam retries the way out. The ending latch stays up: lowering
      // it would let a post-stop frame read live and step a stopped run.
      ending.navigating = false;
      console.error(error);
    });
};

const createRunEnding = (powers: EndingPowers): RunEnding => {
  const ending: Ending = { ended: false, navigating: false, powers };
  return {
    get ended() {
      return ending.ended;
    },
    end: (run, execution) => end(ending, run, execution),
    reset() {
      ending.ended = false;
      ending.navigating = false;
    },
  };
};

export { createRunEnding, endedIn };
export type { EndingPowers, RunEnding };
