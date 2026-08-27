// Numbers off a tape: the instrument that turns a decoded recording into
// metrics (#58 slice 4).

import type { WeaponLine } from '../game/lines/roster';
import type { DamageSource } from '../game/mobs';
import type { RunEnding } from '../game/run';
import { isBirthrightLevels } from '../game/run';
import { SIZE_START } from '../game/tuning';
import type { DecodedTape } from '../tape/decode';
import { playTape } from '../tape/playback';
import type { PlaybackResult } from '../tape/playback';
import type {
  FaultObservation,
  Tape,
  TapeHeader,
  TapeInputDevice,
  TapeIntegrity,
  TapeStop,
} from '../tape/tape';
import { frameObservations, stopOf } from '../tape/tape';
import { performanceOf, ticksToSample } from './framePerformance';
import type { PerformanceReport } from './framePerformance';
import { createReadings, readingsOf } from './readings/readings';
import type { TuningReadings } from './readings/readings';
import { linesInRun } from './readings/runLines';
import { READINGS_VERSION } from './readingsVersion';
import {
  createTallies,
  damageOf,
  endLevelsOf,
  observeInto,
  EMPTY_FIELD,
} from './replayTallies';
import type { LevelUp, ReplayTallies } from './replayTallies';

/**
 * The run as a whole, recomputed and read off the tape.
 *
 * Truncated, trailerless and sealed are three different facts and stay
 * separate: truncated says the bytes ran out mid-record (the decoder's fact),
 * sealed says the trailer was written (the recorder's fact), and a clean
 * trailerless tape is the tab-closed reading, false on both with a stop of
 * unknown.
 */
interface RunSummary {
  // Ticks the verified replay reproduced.
  readonly ticks: number;
  // How the run ended, recomputed from the replay rather than read off the trailer.
  readonly ending: RunEnding | null;
  readonly stop: TapeStop;
  // The trailer's integrity, or null when there is no trailer to say.
  readonly integrity: TapeIntegrity | null;
  // The replayed run's final score.
  readonly score: number;
  // Mobs the replayed run killed.
  readonly kills: number;
  readonly checkpointsVerified: number;
  readonly checkpointsUnreachable: number;
  readonly truncated: boolean;
  readonly sealed: boolean;
}

/**
 * Why a run stays out of default aggregates. Bot and script tapes measure the
 * policy rather than a player, a conditioned run did not start from the
 * birthright, and a faulted or unchecked run is poor evidence by ADR 0019's
 * own rule that aggregates exclude faulted runs by default.
 */
type AggregateExclusion =
  'bot' | 'script' | 'conditioned' | 'faulted' | 'unchecked';

// Who and what produced the run, and whether it belongs in default aggregates.
interface Provenance {
  readonly inputDevice: TapeInputDevice;
  /**
   * Whether the resolved starting size or levels differ from today's
   * birthright. A birthright retune mislabels old tapes toward exclusion,
   * which is the safe direction.
   */
  readonly conditioned: boolean;
  // Empty means the run belongs in default aggregates.
  readonly exclusions: readonly AggregateExclusion[];
}

/**
 * The build a tape was recorded against, carried verbatim off its header.
 *
 * It is here so a comparison of two runs can show both sides and let the reader
 * judge. Neither field is a fidelity gate: the witness is the only thing that
 * decides whether a tape reproduced its run, and the build identity is reserved
 * and unresolved by deliberate decision (ADR 0018).
 */
interface RunIdentity {
  readonly commitHash: string;
  readonly buildIdentity: string;
}

// Everything a verified replay can say about a run.
interface Metrics {
  readonly outcome: 'verified';
  readonly identity: RunIdentity;
  /**
   * Which definitions the derived readings were computed under. It is a
   * sibling of identity rather than a field inside it: identity is tape header
   * data carried verbatim, and this is the instrument's own fact about the
   * report it just produced.
   */
  readonly readingsVersion: number;
  readonly run: RunSummary;
  // Damage dealt per weapon line, with the belch as its own arm beside them.
  readonly damage: Readonly<Record<DamageSource, number>>;
  // Where every line finished, which is where two runs' end states meet.
  readonly endLevels: Record<WeaponLine, number>;
  readonly levelUps: readonly LevelUp[];
  // Index N is the live mob count after N ticks, so index 0 is the empty starting field.
  readonly mobsAlivePerTick: readonly number[];
  // What the run cost, how its fights went, and what its storm held (#74).
  readonly tuning: TuningReadings;
  readonly performance: PerformanceReport;
  // The faults the tape carries: the original run's history, never rewritten (ADR 0024).
  readonly recordedFaults: readonly FaultObservation[];
  // What today's checks said about the reproduced run, kept a separate list.
  readonly readbackFaults: PlaybackResult['readbackFaults'];
  readonly provenance: Provenance;
}

// The replay stopped agreeing with the tape, and nothing after that is the recorded run.
interface Divergence {
  readonly outcome: 'diverged';
  readonly firstDivergentCheckpoint: number;
  readonly checkpointsVerified: number;
  readonly ticksReproduced: number;
}

// The tape was recorded against a different fold, so not a single tick was run (ADR 0019).
interface Refusal {
  readonly outcome: 'witnessVersionMismatch';
  readonly tapeWitnessVersion: number;
  readonly readerWitnessVersion: number;
}

/**
 * The three arms a measurement answers in (ADR 0019): metrics from a verified
 * replay, a divergence naming the first checkpoint that disagreed, or a
 * witness-version refusal. Metrics come only from a verified replay, so a
 * silently wrong metric is not a thing this interface can produce.
 */
type Measurement = Metrics | Divergence | Refusal;

const isConditioned = (header: TapeHeader): boolean =>
  header.startingSize !== SIZE_START ||
  !isBirthrightLevels(header.startingLevels);

const exclusionsOf = (
  tape: Tape,
  recordedFaults: readonly FaultObservation[],
): AggregateExclusion[] => {
  const exclusions: AggregateExclusion[] = [];
  const device = tape.header.inputDevice;
  if (device === 'bot' || device === 'script') exclusions.push(device);
  if (isConditioned(tape.header)) exclusions.push('conditioned');
  const integrity = tape.trailer?.integrity ?? null;
  if (integrity === 'faulted' || recordedFaults.length > 0) {
    exclusions.push('faulted');
  }
  if (integrity === 'unchecked') exclusions.push('unchecked');
  return exclusions;
};

const provenanceOf = (
  tape: Tape,
  recordedFaults: readonly FaultObservation[],
): Provenance => ({
  inputDevice: tape.header.inputDevice,
  conditioned: isConditioned(tape.header),
  exclusions: exclusionsOf(tape, recordedFaults),
});

const runSummaryOf = (
  decoded: DecodedTape,
  result: PlaybackResult,
  tallies: ReplayTallies,
): RunSummary => ({
  ticks: result.ticksReproduced,
  ending: tallies.ending,
  stop: stopOf(decoded.tape),
  integrity: decoded.tape.trailer?.integrity ?? null,
  score: tallies.score,
  kills: tallies.kills,
  checkpointsVerified: result.checkpointsVerified,
  checkpointsUnreachable: result.checkpointsUnreachable,
  truncated: decoded.truncated,
  sealed: decoded.tape.trailer !== null,
});

/**
 * Everything a tape can answer, through one replay. It consumes the one
 * playback primitive and never a second loop.
 *
 * It takes the decoded artifact rather than a Tape because truncation is a fact
 * about the bytes: DecodedTape.truncated is known only to the decoder, and a
 * summary that could not say "the bytes ran out" would merge it into
 * trailerless, which is a different fact.
 *
 * The expensive frames' ticks are collected before the pass and their field
 * densities sampled by the pass's own observer, never by one reproduction per
 * frame.
 */
const measure = (decoded: DecodedTape): Measurement => {
  const { startingLevels, startingSize } = decoded.tape.header;
  const frames = frameObservations(decoded.tape);
  const sampleAt = ticksToSample(frames);
  // The lines this run names, known before a tick has run, so every record the
  // report promises whole is whole even when the tape carries no command.
  const lines = linesInRun(startingLevels);
  const readings = createReadings(startingSize, lines);
  const tallies = createTallies(readings, lines, startingLevels);
  // A frame starting at tick 0 began on the empty field, which no listener
  // call ever sees: the observer fires only after a tick has run.
  if (sampleAt.has(0)) tallies.densities.set(0, EMPTY_FIELD);

  const result = playTape(decoded.tape, observeInto(tallies, sampleAt, lines));

  if (result.outcome === 'witnessVersionMismatch') {
    return {
      outcome: 'witnessVersionMismatch',
      tapeWitnessVersion: result.tapeWitnessVersion,
      readerWitnessVersion: result.readerWitnessVersion,
    };
  }
  if (result.firstDivergentCheckpoint !== null) {
    return {
      outcome: 'diverged',
      firstDivergentCheckpoint: result.firstDivergentCheckpoint,
      checkpointsVerified: result.checkpointsVerified,
      ticksReproduced: result.ticksReproduced,
    };
  }
  return {
    outcome: 'verified',
    identity: {
      commitHash: decoded.tape.header.commitHash,
      buildIdentity: decoded.tape.header.buildIdentity,
    },
    readingsVersion: READINGS_VERSION,
    run: runSummaryOf(decoded, result, tallies),
    damage: damageOf(tallies),
    endLevels: endLevelsOf(tallies),
    levelUps: tallies.levelUps,
    mobsAlivePerTick: tallies.mobsAlivePerTick,
    tuning: readingsOf(readings),
    performance: performanceOf(frames, tallies.densities),
    recordedFaults: result.recordedFaults,
    readbackFaults: result.readbackFaults,
    provenance: provenanceOf(decoded.tape, result.recordedFaults),
  };
};

export { measure };
export type {
  AggregateExclusion,
  Divergence,
  Measurement,
  Metrics,
  Provenance,
  Refusal,
  RunIdentity,
  RunSummary,
};
