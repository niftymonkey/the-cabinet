// How a run reaches its end state, sealing its record exactly once and retrying only the way out.

import type { SimEvent } from '../../../game/events';
import type { Execution } from '../../../game/execution';
import type { RunState } from '../../../game/run';
import { runHandoff } from '../../runHandoff';
import { summarizeRun } from '../../runSummary';
import { ENDING_SCENE_MS } from './endingScene';

/** What the ending needs from the run around it, at the moment it takes the run away. */
interface EndingPowers {
  // The tape's trailer, written once at the stop.
  sealTape(execution: Execution): void;
  // The sealed bytes, which outlive the recorder the pooled screen is about to drop.
  tapeBytes(): Uint8Array | null;
  // The countdown's blur, so the end state is never reached from behind it.
  clearFieldBlur(): void;
  // The way out to the end state, retried from the frame seam when it rejects.
  showEnd(): Promise<void>;
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
  /**
   * How far the won run's ending scene has run, from nothing to whole, or null
   * when no scene is holding this run: a loss, a fatal fault and a quit leave
   * at once, and so does every run before it ends.
   */
  readonly sceneProgress: number | null;
  end(run: RunState | null, execution: Execution | null): void;
  /**
   * One frame of real time spent on the hold. It is the frame clock and never
   * the run's tick, because the run's tick has stopped, and it is the only
   * thing that moves the hold: nothing a player does can shorten the scene.
   */
  advance(elapsedMs: number): void;
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
  /**
   * Whether this run holds the field for its ending scene. Only a won run does:
   * a loss, a fatal fault and a quit from the pause menu have no scene and
   * leave on the frame they end.
   */
  holding: boolean;
  // How much of the hold has been spent, in milliseconds of frame clock.
  heldMs: number;
  readonly powers: EndingPowers;
}

// Whether this frame's events ended the run, either way (ADR 0003 and ADR 0007).
const endedIn = (events: readonly SimEvent[]): boolean => {
  return events.some(
    (event) => event.type === 'sealed' || event.type === 'victory',
  );
};

/**
 * Whether this run holds the field for the Undertaker's end (design record R6).
 *
 * Victory only. A run the authority stopped and a run that never reached an
 * ending at all, which is what a quit from the pause menu leaves behind, have
 * nothing to show and go straight to the end state as they always did.
 */
const holdsForTheScene = (run: RunState, execution: Execution): boolean =>
  execution.stop === null && run.ending === 'victory';

/**
 * Takes the run to its end state, sealing the record exactly once and holding
 * a won run's field for its ending scene.
 *
 * The capture is once-only and only the navigation retries. showScreen can
 * reject, and the frame seam then calls back in while the run stays over: a
 * retry that re-entered the capture would re-encode the tape and re-record
 * the handoff on every failing frame, folding the frames after the stop into
 * the exported artifact. Captured once, the artifact is frozen at the stop
 * however many retries the way out takes.
 *
 * The hold sits below the capture and above the way out, so the seal happens on
 * the ending tick whichever way the run ended: a drawing bug must never be able
 * to cost a player the tape. It is spent by advance() alone, on the frame
 * clock, because the run's own tick has stopped and because nothing a player
 * does may shorten the scene.
 */
const end = (
  ending: Ending,
  run: RunState | null,
  execution: Execution | null,
): void => {
  if (run === null || execution === null) return;
  if (!ending.ended) {
    ending.ended = true;
    ending.holding = holdsForTheScene(run, execution);
    ending.powers.clearFieldBlur();
    ending.powers.sealTape(execution);
    runHandoff.record(summarizeRun(run, execution), ending.powers.tapeBytes());
  }
  if (ending.holding && ending.heldMs < ENDING_SCENE_MS) return;
  if (ending.navigating) return;
  ending.navigating = true;
  ending.powers.showEnd().catch((error) => {
    // A failed navigation releases the navigation guard alone, so the
    // frame seam retries the way out. The ending latch stays up: lowering
    // it would let a post-stop frame read live and step a stopped run.
    ending.navigating = false;
    console.error(error);
  });
};

/** One frame of the hold, stopping at its own length so the progress never passes whole. */
const advance = (ending: Ending, elapsedMs: number): void => {
  if (!ending.holding) return;
  ending.heldMs = Math.min(ending.heldMs + elapsedMs, ENDING_SCENE_MS);
};

const createRunEnding = (powers: EndingPowers): RunEnding => {
  const ending: Ending = {
    ended: false,
    navigating: false,
    holding: false,
    heldMs: 0,
    powers,
  };
  return {
    get ended() {
      return ending.ended;
    },
    get sceneProgress() {
      return ending.holding ? ending.heldMs / ENDING_SCENE_MS : null;
    },
    end: (run, execution) => end(ending, run, execution),
    advance: (elapsedMs) => advance(ending, elapsedMs),
    reset() {
      ending.ended = false;
      ending.navigating = false;
      ending.holding = false;
      ending.heldMs = 0;
    },
  };
};

export { createRunEnding, endedIn };
export type { EndingPowers, RunEnding };
