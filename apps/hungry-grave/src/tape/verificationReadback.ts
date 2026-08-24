/**
 * VERIFICATION READBACK IS NOT REPLAY (ADR 0020, and it is quoted rather than
 * paraphrased).
 *
 * - Verification readback is not the replay feature.
 * - It exists only to prove that a newly recorded tape can be decoded and
 *   deterministically reproduced.
 * - Full replay remains owned by 6b.
 * - No 6b replay story, issue, acceptance criterion or other obligation may be
 *   treated as satisfied by the existence of verification readback.
 * - Future work must not infer that replay exists merely because internal
 *   readback primitives do.
 *
 * The reason this is written at the top of the file rather than filed away is
 * that an agent reading it will find code which decodes a tape and re-runs it,
 * and the obvious wrong inference is that replay already exists. What this
 * module proves is that the artifact the recorder just wrote is sound: that it
 * decodes, that its witness recomputes, and that the same tape gives the same
 * run twice. That is the whole of the capability.
 *
 * A witness that has never been recomputed from a decoded tape is an untested
 * claim, which is why the dispatch that writes the fold also reads one back.
 */

import { createExecution, executeTick } from "../game/execution";
import type { Execution, FaultRecord } from "../game/execution";
import { createRun } from "../game/run";
import { foldWitness, WITNESS_VERSION } from "../game/witness";
import type { FaultObservation, Tape, TapeCheckpoint } from "./tape";
import { faultObservations } from "./tape";

/**
 * What a readback concluded.
 *
 * A witness version mismatch is its own outcome and never a divergence. The
 * fold demonstrably widens, so without the distinction every tape recorded
 * before a widening would report that the run did not happen, and there would
 * be nothing to tell a widened fold apart from a tape of some other run.
 */
export type VerificationOutcome =
  "verified" | "diverged" | "witnessVersionMismatch";

export interface VerificationReadbackResult {
  readonly outcome: VerificationOutcome;
  readonly tapeWitnessVersion: number;
  readonly readerWitnessVersion: number;
  /** Checkpoints this readback recomputed and agreed with. */
  readonly checkpointsVerified: number;
  /**
   * Checkpoints the body could not reach, which is how a tape cut off mid-body
   * says it verified as far as it goes rather than claiming the whole run.
   */
  readonly checkpointsUnreachable: number;
  /** The first checkpoint that disagreed, or null when none did. */
  readonly firstDivergentCheckpoint: number | null;
  readonly ticksReproduced: number;
  /** The fold of the reproduced run at its last reproduced tick. */
  readonly finalWitness: number;
  /**
   * The faults the tape carries, which are the original run's history. A
   * readback reports them and never rewrites them: invariant definitions and
   * severity policy both change over time, and a run recorded under the old
   * ones still happened the way it happened.
   */
  readonly recordedFaults: readonly FaultObservation[];
  /**
   * What today's checks say about the reproduced run, kept separate from the
   * line above rather than merged into it, so the two never become one list.
   */
  readonly readbackFaults: readonly FaultRecord[];
}

/** The tape's checkpoints by index, so a readback can ask for one by tick count. */
function checkpointsByIndex(
  checkpoints: readonly TapeCheckpoint[],
): ReadonlyMap<number, number> {
  const byIndex = new Map<number, number>();
  for (const checkpoint of checkpoints) {
    byIndex.set(checkpoint.index, checkpoint.witness);
  }
  return byIndex;
}

interface Verdict {
  readonly checkpointsVerified: number;
  readonly firstDivergentCheckpoint: number | null;
}

/**
 * The result a tape recorded against a different fold gets: it refuses clearly
 * rather than failing confusingly, and it does not run a single tick.
 */
function versionMismatch(tape: Tape): VerificationReadbackResult {
  return {
    outcome: "witnessVersionMismatch",
    tapeWitnessVersion: tape.header.witnessVersion,
    readerWitnessVersion: WITNESS_VERSION,
    checkpointsVerified: 0,
    checkpointsUnreachable: tape.checkpoints.length,
    firstDivergentCheckpoint: null,
    ticksReproduced: 0,
    finalWitness: 0,
    recordedFaults: faultObservations(tape),
    readbackFaults: [],
  };
}

/**
 * Reproduces the run a tape holds and recomputes its witness at every
 * checkpoint the body reaches.
 *
 * The run is reproduced through the one execution authority, exactly as the
 * original was, so the readback consumes the same commands through the same
 * function the recording came off. Checkpoint index N is the fold of the state
 * after executeTick has run N times, so index zero is checked before a single
 * command is fed in.
 *
 * It stops at the first checkpoint that disagrees. Carrying on would spend the
 * rest of the body proving the same thing over again, and a divergence in this
 * game compounds through the economy rather than healing.
 */
export function readBackForVerification(
  tape: Tape,
): VerificationReadbackResult {
  if (tape.header.witnessVersion !== WITNESS_VERSION) {
    return versionMismatch(tape);
  }

  // The run is rebuilt from the header alone: seed, resolved size and resolved
  // starting levels, so a pinned run's tape verifies exactly as an unpinned
  // one's does.
  const run = createRun(
    tape.header.seed,
    tape.header.startingSize,
    tape.header.startingLevels,
  );
  const execution = createExecution(run);
  const expected = checkpointsByIndex(tape.checkpoints);
  const verdict = reproduce(tape, execution, expected);
  const reachable = countReachable(expected, run.tick);

  return {
    outcome:
      verdict.firstDivergentCheckpoint === null ? "verified" : "diverged",
    tapeWitnessVersion: tape.header.witnessVersion,
    readerWitnessVersion: WITNESS_VERSION,
    checkpointsVerified: verdict.checkpointsVerified,
    checkpointsUnreachable: expected.size - reachable,
    firstDivergentCheckpoint: verdict.firstDivergentCheckpoint,
    ticksReproduced: run.tick,
    finalWitness: foldWitness(run, 0),
    recordedFaults: faultObservations(tape),
    readbackFaults: execution.faults,
  };
}

/** How many of a tape's checkpoints sit at or before the ticks a readback managed to run. */
function countReachable(
  expected: ReadonlyMap<number, number>,
  ticksReproduced: number,
): number {
  let reachable = 0;
  for (const index of expected.keys()) {
    if (index <= ticksReproduced) reachable += 1;
  }
  return reachable;
}

function reproduce(
  tape: Tape,
  execution: Execution,
  expected: ReadonlyMap<number, number>,
): Verdict {
  let checkpointsVerified = 0;
  for (let ticksRun = 0; ticksRun <= tape.commands.length; ticksRun++) {
    const witness = expected.get(ticksRun);
    if (witness !== undefined) {
      if (foldWitness(execution.run, 0) !== witness) {
        return { checkpointsVerified, firstDivergentCheckpoint: ticksRun };
      }
      checkpointsVerified += 1;
    }
    const command = tape.commands[ticksRun];
    // The stop reason is read before each tick for the same reason every other
    // loop over the authority reads it: a fatal fault must not re-fire on the
    // rest of the ticks behind it.
    if (command === undefined || execution.stop !== null) break;
    executeTick(execution, command);
  }
  return { checkpointsVerified, firstDivergentCheckpoint: null };
}
