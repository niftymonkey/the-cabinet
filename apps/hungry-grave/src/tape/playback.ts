// The one canonical loop that drives a tape through the execution authority
// (#58).

import { createExecution, executeTick } from '../game/execution';
import type { Execution, FaultRecord, TickListener } from '../game/execution';
import { createRun } from '../game/run';
import type { RunState } from '../game/run';
import { foldWitness, WITNESS_VERSION } from '../game/witness';
import type {
  FaultObservation,
  Tape,
  TapeCheckpoint,
  TapeHeader,
} from './tape';
import { faultObservations } from './tape';
import type { StartingLevels } from './startingLevels';
import { resolveStartingLevels } from './startingLevels';

/**
 * What a playback concluded.
 *
 * A witness version mismatch is its own outcome and never a divergence. The
 * fold demonstrably widens, so without the distinction every tape recorded
 * before a widening would report that the run did not happen, and there would
 * be nothing to tell a widened fold apart from a tape of some other run.
 *
 * An unimplemented roster is a third outcome and not a fourth spelling of the
 * second (ADR 0043). The two versions answer different questions: the witness
 * version says whether this reader folds the same way, and the recorded roster
 * says whether this build has the lines to simulate at all. Merging them would
 * let one stand in for the other, which is the substitution ADR 0043 forbids,
 * and it would report "this reader folds differently" about a tape whose fold
 * this reader has never reached.
 */
type PlaybackOutcome =
  'verified' | 'diverged' | 'witnessVersionMismatch' | 'rosterNotImplemented';

interface PlaybackResult {
  readonly outcome: PlaybackOutcome;
  readonly tapeWitnessVersion: number;
  readonly readerWitnessVersion: number;
  // Checkpoints this playback recomputed and agreed with.
  readonly checkpointsVerified: number;
  /**
   * Checkpoints the body could not reach, which is how a tape cut off mid-body
   * says it verified as far as it goes rather than claiming the whole run.
   */
  readonly checkpointsUnreachable: number;
  // The first checkpoint that disagreed, or null when none did.
  readonly firstDivergentCheckpoint: number | null;
  readonly ticksReproduced: number;
  // The fold of the reproduced run at its last reproduced tick.
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
  /**
   * The roster the tape was recorded against, named only when this build cannot
   * implement it, so the refusal is precise instead of blanket.
   */
  readonly unimplementedRoster: readonly string[] | null;
}

/**
 * One reproduction in flight. The stepwise form exists because the replay
 * screen paces reproduction across frames (#58), and it must be the same loop
 * playTape runs.
 */
interface Playback {
  readonly run: RunState;
  readonly ticksReproduced: number;
  // False when the tape or the verified bound is exhausted.
  advanceTick(): boolean;
  // The verdict so far.
  result(): PlaybackResult;
}

// The tape's checkpoints by index, so the loop can ask for one by tick count.
const checkpointsByIndex = (
  checkpoints: readonly TapeCheckpoint[],
): ReadonlyMap<number, number> => {
  const byIndex = new Map<number, number>();
  for (const checkpoint of checkpoints) {
    byIndex.set(checkpoint.index, checkpoint.witness);
  }
  return byIndex;
};

// How many of a tape's checkpoints sit at or before the ticks reproduced so far.
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
const refusal = (
  tape: Tape,
  outcome: PlaybackOutcome,
  unimplementedRoster: readonly string[] | null,
): PlaybackResult => ({
  outcome,
  tapeWitnessVersion: tape.header.witnessVersion,
  readerWitnessVersion: WITNESS_VERSION,
  checkpointsVerified: 0,
  checkpointsUnreachable: tape.checkpoints.length,
  firstDivergentCheckpoint: null,
  ticksReproduced: 0,
  finalWitness: 0,
  recordedFaults: faultObservations(tape),
  readbackFaults: [],
  unimplementedRoster,
});

/**
 * One reproduction's own state: what the loop has consumed and what it has
 * concluded so far. It is the module's private machine and never leaves it; a
 * caller only ever sees the Playback above.
 */
interface Reproduction {
  readonly tape: Tape;
  readonly run: RunState;
  readonly execution: Execution;
  // The witness this tape claims at each of its checkpoint indices.
  readonly expected: ReadonlyMap<number, number>;
  // Set when the tape cannot be reproduced at all, which stops it before tick one.
  readonly refused: PlaybackOutcome | null;
  // Named only on a roster refusal, so the reason can say which roster.
  readonly unimplementedRoster: readonly string[] | null;
  ticksReproduced: number;
  checkpointsVerified: number;
  firstDivergentCheckpoint: number | null;
  // True once the tape or the verified bound is exhausted.
  exhausted: boolean;
}

/**
 * Why this tape cannot be reproduced at all, or null when it can.
 *
 * The roster is asked first because it is the cruder failure: a build without
 * the lines cannot simulate the run whatever its fold does, and reporting a
 * fold mismatch about a run it never attempted would be the less true of the
 * two answers.
 */
const refusalFor = (
  levels: StartingLevels,
  header: TapeHeader,
): PlaybackOutcome | null => {
  if (levels.outcome === 'notImplemented') return 'rosterNotImplemented';
  if (header.witnessVersion !== WITNESS_VERSION) {
    return 'witnessVersionMismatch';
  }
  return null;
};

/**
 * The run a tape describes, rebuilt from the header alone: seed, resolved size
 * and resolved starting levels, so a pinned run's tape plays exactly as an
 * unpinned one's does.
 *
 * A roster this build cannot implement never reaches here. The run is built at
 * the birthright in that case and no tick is ever fed into it, because a
 * refused reproduction is exhausted before its first command.
 */
const runFromHeader = (levels: StartingLevels, header: TapeHeader): RunState =>
  createRun(
    header.seed,
    header.startingSize,
    levels.outcome === 'implemented' ? levels.levels : undefined,
  );

/**
 * Whether the tape's witness at a checkpoint is the one this reproduction
 * recomputes, counting the agreement or naming the first disagreement.
 *
 * Checkpoint index N is the fold of the state after executeTick has run N
 * times (ADR 0019), recomputed from zero because each one is an independent
 * snapshot rather than a link in a chain.
 */
const checkpointAgrees = (
  reproduction: Reproduction,
  index: number,
): boolean => {
  const witness = reproduction.expected.get(index);
  if (witness === undefined) return true;
  if (foldWitness(reproduction.run, 0) !== witness) {
    reproduction.firstDivergentCheckpoint = index;
    return false;
  }
  reproduction.checkpointsVerified += 1;
  return true;
};

// A reproduction standing at tick zero, its run built and its checkpoint zero judged.
const beginReproduction = (
  tape: Tape,
  observer?: TickListener,
): Reproduction => {
  const levels = resolveStartingLevels(tape.header);
  const run = runFromHeader(levels, tape.header);
  const reproduction: Reproduction = {
    tape,
    run,
    execution: createExecution(run, {
      listeners: observer === undefined ? [] : [observer],
    }),
    expected: checkpointsByIndex(tape.checkpoints),
    refused: refusalFor(levels, tape.header),
    unimplementedRoster:
      levels.outcome === 'notImplemented' ? levels.recordedRoster : null,
    ticksReproduced: 0,
    checkpointsVerified: 0,
    firstDivergentCheckpoint: null,
    exhausted: false,
  };
  // A refused tape never reaches checkpoint zero; otherwise index zero is
  // checked before a single command is fed in.
  reproduction.exhausted =
    reproduction.refused !== null || !checkpointAgrees(reproduction, 0);
  return reproduction;
};

// Feeds the next command in, and says whether there was one to feed.
const reproduceTick = (reproduction: Reproduction): boolean => {
  if (reproduction.exhausted) return false;
  const command = reproduction.tape.commands[reproduction.ticksReproduced];
  if (command === undefined) {
    reproduction.exhausted = true;
    return false;
  }
  // Deliberately never reads execution.stop: a fault today's checks raise
  // never stops reproduction (ADR 0017, #58 ruling 5), because a tape must
  // reproduce every command it holds, the ticks that carried the fault
  // included.
  executeTick(reproduction.execution, command);
  reproduction.ticksReproduced += 1;
  if (!checkpointAgrees(reproduction, reproduction.ticksReproduced)) {
    reproduction.exhausted = true;
  }
  return true;
};

// The verdict on the ticks reproduced so far, which is a whole verdict at every tick.
const verdictSoFar = (reproduction: Reproduction): PlaybackResult => ({
  outcome:
    reproduction.firstDivergentCheckpoint === null ? 'verified' : 'diverged',
  tapeWitnessVersion: reproduction.tape.header.witnessVersion,
  readerWitnessVersion: WITNESS_VERSION,
  checkpointsVerified: reproduction.checkpointsVerified,
  checkpointsUnreachable:
    reproduction.expected.size -
    countReachable(reproduction.expected, reproduction.ticksReproduced),
  firstDivergentCheckpoint: reproduction.firstDivergentCheckpoint,
  ticksReproduced: reproduction.ticksReproduced,
  finalWitness: foldWitness(reproduction.run, 0),
  recordedFaults: faultObservations(reproduction.tape),
  readbackFaults: reproduction.execution.faults,
  unimplementedRoster: null,
});

const resultOf = (reproduction: Reproduction): PlaybackResult =>
  reproduction.refused === null
    ? verdictSoFar(reproduction)
    : refusal(
        reproduction.tape,
        reproduction.refused,
        reproduction.unimplementedRoster,
      );

const createPlayback = (tape: Tape, observer?: TickListener): Playback => {
  const reproduction = beginReproduction(tape, observer);
  return {
    run: reproduction.run,
    get ticksReproduced() {
      return reproduction.ticksReproduced;
    },
    advanceTick: () => reproduceTick(reproduction),
    result: () => resultOf(reproduction),
  };
};

/**
 * Drives createPlayback to the end, through the same loop the stepwise form
 * steps, so a second reproduce loop never exists: verification readback and the
 * replay screen both sit on this primitive.
 */
const playTape = (tape: Tape, observer?: TickListener): PlaybackResult => {
  const playback = createPlayback(tape, observer);
  let advancing = true;
  while (advancing) advancing = playback.advanceTick();
  return playback.result();
};

export { createPlayback, playTape };
export type { Playback, PlaybackOutcome, PlaybackResult };
