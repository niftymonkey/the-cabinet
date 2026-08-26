/**
 * The one canonical loop that drives a tape through the execution authority
 * (#58). playTape and the stepwise Playback are the same loop, so a second
 * reproduce loop never exists: verification readback and the replay screen
 * both sit on this primitive.
 */

import { createExecution, executeTick } from '../game/execution';
import type { FaultRecord, TickListener } from '../game/execution';
import { createRun } from '../game/run';
import type { RunState } from '../game/run';
import { foldWitness, WITNESS_VERSION } from '../game/witness';
import type { FaultObservation, Tape, TapeCheckpoint } from './tape';
import { faultObservations } from './tape';

/**
 * What a playback concluded.
 *
 * A witness version mismatch is its own outcome and never a divergence. The
 * fold demonstrably widens, so without the distinction every tape recorded
 * before a widening would report that the run did not happen, and there would
 * be nothing to tell a widened fold apart from a tape of some other run.
 */
type PlaybackOutcome = 'verified' | 'diverged' | 'witnessVersionMismatch';

interface PlaybackResult {
  readonly outcome: PlaybackOutcome;
  readonly tapeWitnessVersion: number;
  readonly readerWitnessVersion: number;
  /** Checkpoints this playback recomputed and agreed with. */
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
   * playback reports them and never rewrites them: invariant definitions and
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

/**
 * One reproduction in flight. The stepwise form exists because the replay
 * screen paces reproduction across frames (#58), and it must be the same loop
 * playTape runs.
 */
interface Playback {
  readonly run: RunState;
  readonly ticksReproduced: number;
  /** False when the tape or the verified bound is exhausted. */
  advanceTick(): boolean;
  /** The verdict so far. */
  result(): PlaybackResult;
}

/** The tape's checkpoints by index, so the loop can ask for one by tick count. */
const checkpointsByIndex = (
  checkpoints: readonly TapeCheckpoint[],
): ReadonlyMap<number, number> => {
  const byIndex = new Map<number, number>();
  for (const checkpoint of checkpoints) {
    byIndex.set(checkpoint.index, checkpoint.witness);
  }
  return byIndex;
};

/** How many of a tape's checkpoints sit at or before the ticks reproduced so far. */
const countReachable = (
  expected: ReadonlyMap<number, number>,
  ticksReproduced: number,
): number => {
  let reachable = 0;
  for (const index of expected.keys()) {
    if (index <= ticksReproduced) reachable += 1;
  }
  return reachable;
};

/**
 * The result a tape recorded against a different fold gets: it refuses clearly
 * rather than failing confusingly, and it does not run a single tick.
 */
const versionMismatch = (tape: Tape): PlaybackResult => ({
  outcome: 'witnessVersionMismatch',
  tapeWitnessVersion: tape.header.witnessVersion,
  readerWitnessVersion: WITNESS_VERSION,
  checkpointsVerified: 0,
  checkpointsUnreachable: tape.checkpoints.length,
  firstDivergentCheckpoint: null,
  ticksReproduced: 0,
  finalWitness: 0,
  recordedFaults: faultObservations(tape),
  readbackFaults: [],
});

const createPlayback = (tape: Tape, observer?: TickListener): Playback => {
  const refused = tape.header.witnessVersion !== WITNESS_VERSION;
  // The run is rebuilt from the header alone: seed, resolved size and resolved
  // starting levels, so a pinned run's tape plays exactly as an unpinned
  // one's does.
  const run = createRun(
    tape.header.seed,
    tape.header.startingSize,
    tape.header.startingLevels,
  );
  const execution = createExecution(run, {
    listeners: observer === undefined ? [] : [observer],
  });
  const expected = checkpointsByIndex(tape.checkpoints);

  let ticksReproduced = 0;
  let checkpointsVerified = 0;
  let firstDivergentCheckpoint: number | null = null;

  // Checkpoint index N is the fold of the state after executeTick has run N
  // times (ADR 0019), recomputed from zero because each one is an independent
  // snapshot rather than a link in a chain.
  const checkpointAgrees = (index: number): boolean => {
    const witness = expected.get(index);
    if (witness === undefined) return true;
    if (foldWitness(run, 0) !== witness) {
      firstDivergentCheckpoint = index;
      return false;
    }
    checkpointsVerified += 1;
    return true;
  };

  // A refused tape never reaches checkpoint zero; otherwise index zero is
  // checked before a single command is fed in.
  let exhausted = refused || !checkpointAgrees(0);

  const advanceTick = (): boolean => {
    if (exhausted) return false;
    const command = tape.commands[ticksReproduced];
    if (command === undefined) {
      exhausted = true;
      return false;
    }
    // Deliberately never reads execution.stop: a fault today's checks raise
    // never stops reproduction (ADR 0017, #58 ruling 5), because a tape must
    // reproduce every command it holds, the ticks that carried the fault
    // included.
    executeTick(execution, command);
    ticksReproduced += 1;
    if (!checkpointAgrees(ticksReproduced)) exhausted = true;
    return true;
  };

  const verdictSoFar = (): PlaybackResult => ({
    outcome: firstDivergentCheckpoint === null ? 'verified' : 'diverged',
    tapeWitnessVersion: tape.header.witnessVersion,
    readerWitnessVersion: WITNESS_VERSION,
    checkpointsVerified,
    checkpointsUnreachable:
      expected.size - countReachable(expected, ticksReproduced),
    firstDivergentCheckpoint,
    ticksReproduced,
    finalWitness: foldWitness(run, 0),
    recordedFaults: faultObservations(tape),
    readbackFaults: execution.faults,
  });

  const result = (): PlaybackResult =>
    refused ? versionMismatch(tape) : verdictSoFar();

  return {
    run,
    get ticksReproduced() {
      return ticksReproduced;
    },
    advanceTick,
    result,
  };
};

/** Drives createPlayback to the end, through the same loop the stepwise form steps. */
const playTape = (tape: Tape, observer?: TickListener): PlaybackResult => {
  const playback = createPlayback(tape, observer);
  let advancing = true;
  while (advancing) advancing = playback.advanceTick();
  return playback.result();
};

export { createPlayback, playTape };
export type { Playback, PlaybackOutcome, PlaybackResult };
