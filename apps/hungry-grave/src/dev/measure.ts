// Numbers off a tape: the instrument that turns a decoded recording into
// metrics (#58 slice 4).

import type { WeaponLine } from '../game/lines/roster';
import type { DamageSource } from '../game/mobs';
import type { RunEnding } from '../game/run';
import { isBirthrightLevels } from '../game/run';
import { SIZE_START } from '../game/tuning';
import { buildMismatchOf } from '../tape/buildIdentity';
import type { BuildMismatch } from '../tape/buildIdentity';
import type { DecodedTape } from '../tape/decode';
import { playTape } from '../tape/playback';
import { resolveStartingLevels } from '../tape/startingLevels';
import type { PlaybackResult } from '../tape/playback';
import type {
  FaultObservation,
  Tape,
  TapeHeader,
  TapeInputDevice,
  TapeIntegrity,
  TapeStop,
} from '../tape/tape';
import { frameObservations, PERSON_POLICY, stopOf } from '../tape/tape';
import { performanceOf, ticksToSample } from './framePerformance';
import type { PerformanceReport } from './framePerformance';
import { createReadings, readingsOf } from './readings/readings';
import type { TuningReadings } from './readings/readings';
import { linesInRun } from './readings/runLines';
import { READINGS_VERSION } from './readingsVersion';
import { rigOf } from './rigs';
import type { RigName } from './rigs';
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
 *
 * The policy is a second guard beside the device and it does real work: nothing
 * in production writes `bot`, so the device alone cannot tell a scripted wander
 * from a hand playing the whole game (ADR 0053).
 */
type AggregateExclusion =
  'bot' | 'script' | 'policy' | 'conditioned' | 'faulted' | 'unchecked';

// Who and what produced the run, and whether it belongs in default aggregates.
interface Provenance {
  readonly inputDevice: TapeInputDevice;
  // Which policy steered the run, carried off the header so a report says which hand it was.
  readonly policy: string;
  /**
   * Which starting condition the run began from, or null when no rig holds it
   * (#107). A figure carries its rig beside its policy so two rigs are never
   * banded as one measurement, and an unnamed condition says so rather than
   * being filed under the nearest row.
   */
  readonly rig: RigName | null;
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
 * decides whether a tape reproduced its run (ADR 0018). The build identity is
 * the finer of the two, because it carries a dirty tree's own marker where the
 * commit hash cannot (#82); it is empty on a tape recorded before the field
 * was filled.
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
   * The tape's build and this one, named when they differ and null when they
   * are one build (#82).
   *
   * A difference here is a note and never a refusal: the replay reproduced
   * every checkpoint the tape claims, so these numbers are the recorded run's,
   * and what the reader is owed is which build computed them. Replay is a
   * shipped feature (ADR 0020) and a rules-identical build keeps replaying a
   * player's tape.
   */
  readonly buildMismatch: BuildMismatch | null;
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
  // The same indexing over mob fire, which is the half of the airborne figure a headless tape lacks.
  readonly mobFireAlivePerTick: readonly number[];
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
  /**
   * What the divergence is attributed to when the tape and this build are not
   * the same build, and null when they are (#82).
   *
   * Two builds that disagree about a rule disagree about the fold, so a
   * divergence across a build difference says almost nothing about the tape.
   * A bare divergence read as a defect in the recording is what
   * `docs/push/divergence-b1c3a584d1.md` cost two agents a day, and the label
   * they could not check is the field this names.
   */
  readonly buildMismatch: BuildMismatch | null;
}

// The tape was recorded against a different fold, so not a single tick was run (ADR 0019).
interface WitnessRefusal {
  readonly outcome: 'witnessVersionMismatch';
  readonly tapeWitnessVersion: number;
  readonly readerWitnessVersion: number;
}

/**
 * The tape was recorded against a roster this build does not implement, so it
 * could not be simulated at all (ADR 0043).
 *
 * It names the roster rather than saying only that it refused. The tape is
 * still readable and everything that does not depend on simulating the missing
 * content is still true of it; what this says is that this build cannot be the
 * one to reproduce it.
 */
interface RosterRefusal {
  readonly outcome: 'rosterNotImplemented';
  readonly recordedRoster: readonly string[];
}

type Refusal = WitnessRefusal | RosterRefusal;

/**
 * The arms a measurement answers in (ADR 0019, ADR 0043): metrics from a
 * verified replay, a divergence naming the first checkpoint that disagreed, or
 * a refusal, which is either the fold's version or a roster this build cannot
 * implement. Metrics come only from a verified replay, so a silently wrong
 * metric is not a thing this interface can produce.
 */
type Measurement = Metrics | Divergence | Refusal;

const isConditioned = (
  header: TapeHeader,
  levels: Readonly<Record<WeaponLine, number>>,
): boolean => header.startingSize !== SIZE_START || !isBirthrightLevels(levels);

const exclusionsOf = (
  tape: Tape,
  levels: Readonly<Record<WeaponLine, number>>,
  recordedFaults: readonly FaultObservation[],
): AggregateExclusion[] => {
  const exclusions: AggregateExclusion[] = [];
  const device = tape.header.inputDevice;
  if (device === 'bot' || device === 'script') exclusions.push(device);
  if (tape.header.policy !== PERSON_POLICY) exclusions.push('policy');
  if (isConditioned(tape.header, levels)) exclusions.push('conditioned');
  const integrity = tape.trailer?.integrity ?? null;
  if (integrity === 'faulted' || recordedFaults.length > 0) {
    exclusions.push('faulted');
  }
  if (integrity === 'unchecked') exclusions.push('unchecked');
  return exclusions;
};

const provenanceOf = (
  tape: Tape,
  levels: Readonly<Record<WeaponLine, number>>,
  recordedFaults: readonly FaultObservation[],
): Provenance => ({
  inputDevice: tape.header.inputDevice,
  policy: tape.header.policy,
  rig: rigOf(tape.header.startingSize, levels),
  conditioned: isConditioned(tape.header, levels),
  exclusions: exclusionsOf(tape, levels, recordedFaults),
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
  // Asked before anything is read off the header, because every reading below
  // is keyed by this build's own line names and there are none to key by until
  // the recorded roster turns out to be one this build has (ADR 0043).
  const resolved = resolveStartingLevels(decoded.tape.header);
  if (resolved.outcome === 'notImplemented') {
    return {
      outcome: 'rosterNotImplemented',
      recordedRoster: resolved.recordedRoster,
    };
  }
  const startingLevels = resolved.levels;
  const { startingSize } = decoded.tape.header;
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
  const buildMismatch = buildMismatchOf(
    result.tapeBuildIdentity,
    result.readerBuildIdentity,
  );
  if (result.firstDivergentCheckpoint !== null) {
    return {
      outcome: 'diverged',
      firstDivergentCheckpoint: result.firstDivergentCheckpoint,
      checkpointsVerified: result.checkpointsVerified,
      ticksReproduced: result.ticksReproduced,
      buildMismatch,
    };
  }
  return {
    outcome: 'verified',
    identity: {
      commitHash: decoded.tape.header.commitHash,
      buildIdentity: decoded.tape.header.buildIdentity,
    },
    buildMismatch,
    readingsVersion: READINGS_VERSION,
    run: runSummaryOf(decoded, result, tallies),
    damage: damageOf(tallies),
    endLevels: endLevelsOf(tallies),
    levelUps: tallies.levelUps,
    mobsAlivePerTick: tallies.mobsAlivePerTick,
    mobFireAlivePerTick: tallies.mobFireAlivePerTick,
    tuning: readingsOf(readings),
    performance: performanceOf(frames, tallies.densities),
    recordedFaults: result.recordedFaults,
    readbackFaults: result.readbackFaults,
    provenance: provenanceOf(
      decoded.tape,
      startingLevels,
      result.recordedFaults,
    ),
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
