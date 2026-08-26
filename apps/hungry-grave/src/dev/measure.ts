/**
 * Numbers off a tape: the instrument that turns a decoded recording into
 * metrics (#58 slice 4).
 *
 * It consumes the one playback primitive and never a second loop, and it
 * answers in one of three arms (ADR 0019): metrics from a verified replay, a
 * divergence naming the first checkpoint that disagreed, or a witness-version
 * refusal. Metrics come only from a verified replay, so a silently wrong
 * metric is not a thing this interface can produce.
 *
 * The seam takes the decoded artifact rather than a Tape because truncation is
 * a fact about the bytes: DecodedTape.truncated is known only to the decoder,
 * and a summary that could not say "the bytes ran out" would merge it into
 * trailerless, which is a different fact.
 */

import type { TickListener } from '../game/execution';
import type { WeaponLine } from '../game/lines/roster';
import type { DamageSource } from '../game/mobs';
import type { RunEnding, RunState } from '../game/run';
import { isBirthrightLevels } from '../game/run';
import { SIZE_START } from '../game/tuning';
import type { DecodedTape } from '../tape/decode';
import { playTape } from '../tape/playback';
import type { PlaybackResult } from '../tape/playback';
import type {
  FaultObservation,
  FrameObservation,
  FrameReason,
  Tape,
  TapeHeader,
  TapeInputDevice,
  TapeIntegrity,
  TapeStop,
} from '../tape/tape';
import { frameObservations, stopOf } from '../tape/tape';

/**
 * The frame interval past which a frame is reported as expensive, in
 * milliseconds. A named starting value and data to tune, never a rule: 25ms is
 * a frame that missed a 60Hz deadline by half a frame, and the right figure is
 * whatever the measured runs say it is.
 */
const EXPENSIVE_FRAME_INTERVAL_MS = 25;

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

// One line reaching one level, at the tick the drop landed (#45).
interface LevelUp {
  readonly line: WeaponLine;
  readonly level: number;
  readonly tick: number;
}

// The live field at one tick, counted from the replayed run's pools.
interface FieldDensity {
  readonly mobs: number;
  readonly shots: number;
  readonly corpses: number;
  readonly skulls: number;
  readonly wisps: number;
}

// One timing series summarised. Nearest-rank percentiles; all zero when the series is empty.
interface Distribution {
  readonly count: number;
  readonly min: number;
  readonly max: number;
  readonly mean: number;
  readonly p50: number;
  readonly p95: number;
  readonly p99: number;
}

// The tick debt as of one frame row, recorded only where it changed.
interface DebtSample {
  // The row's index among the tape's frame observations.
  readonly frame: number;
  readonly tick: number | null;
  readonly debtTicks: number;
}

/**
 * One frame past the expensive threshold, joined to the field that frame began
 * on. The density is sampled during the same single replay pass, and it is
 * null when the frame bought no tick or the replay never reached its tick.
 */
interface ExpensiveFrame {
  // The row's index among the tape's frame observations.
  readonly frame: number;
  readonly reason: FrameReason;
  readonly tick: number | null;
  readonly intervalMs: number;
  readonly advanceMs: number;
  readonly updateMs: number;
  readonly ticksExecuted: number;
  readonly debtTicks: number;
  readonly density: FieldDensity | null;
}

// The performance read off the tape's frame rows (ADR 0018).
interface PerformanceReport {
  readonly frames: number;
  readonly interval: Distribution;
  readonly advance: Distribution;
  readonly update: Distribution;
  readonly ticksPerFrame: Distribution;
  // Frames that bought more than one tick.
  readonly catchUpFrames: number;
  readonly debtOverTime: readonly DebtSample[];
  readonly expensiveFrames: readonly ExpensiveFrame[];
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

// Everything a verified replay can say about a run.
interface Metrics {
  readonly outcome: 'verified';
  readonly run: RunSummary;
  // Damage dealt per weapon line, with the belch as its own arm beside the four.
  readonly damage: Readonly<Record<DamageSource, number>>;
  readonly levelUps: readonly LevelUp[];
  // Index N is the live mob count after N ticks, so index 0 is the empty starting field.
  readonly mobsAlivePerTick: readonly number[];
  readonly performance: PerformanceReport;
  // The faults the tape carries: the original run's history, never rewritten (ADR 0017).
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

type Measurement = Metrics | Divergence | Refusal;

// All five damage arms present from the first tick, so an unused line reads zero rather than absent.
const emptyDamage = (): Record<DamageSource, number> => ({
  soulStream: 0,
  headstones: 0,
  wisps: 0,
  bell: 0,
  belch: 0,
});

const liveCount = (pool: readonly { alive: boolean }[]): number =>
  pool.reduce((count, slot) => count + (slot.alive ? 1 : 0), 0);

const densityOf = (run: RunState): FieldDensity => ({
  mobs: liveCount(run.mobs),
  shots: liveCount(run.mobFire),
  corpses: liveCount(run.corpses),
  skulls: liveCount(run.skulls),
  wisps: liveCount(run.wisps),
});

// The field before any tick has run: every pool starts empty.
const EMPTY_FIELD: FieldDensity = {
  mobs: 0,
  shots: 0,
  corpses: 0,
  skulls: 0,
  wisps: 0,
};

// Everything the one replay pass collects through its observer.
interface ReplayTallies {
  readonly damage: Record<DamageSource, number>;
  readonly levelUps: LevelUp[];
  readonly mobsAlivePerTick: number[];
  // The field at each sampled tick, for the expensive-frame join.
  readonly densities: Map<number, FieldDensity>;
  kills: number;
  score: number;
  ending: RunEnding | null;
}

const createTallies = (): ReplayTallies => ({
  damage: emptyDamage(),
  levelUps: [],
  // Index 0 is the empty starting field, matching ADR 0019's checkpoint
  // indexing: index N is the state after N ticks have run.
  mobsAlivePerTick: [0],
  densities: new Map(),
  kills: 0,
  score: 0,
  ending: null,
});

/**
 * The one observer the single replay pass drives. Everything is read off the
 * live state inside the call and stored as values, never as references,
 * because the pools are mutated in place (events.ts carries the same rule).
 */
const observeInto = (
  tallies: ReplayTallies,
  sampleAt: ReadonlySet<number>,
): TickListener => {
  return (tick, _command, events, state) => {
    for (const event of events) {
      if (event.type === 'mobDamaged') {
        tallies.damage[event.source] += event.amount;
      }
      if (event.type === 'mobKilled') tallies.kills += 1;
      if (event.type === 'weaponLeveled') {
        tallies.levelUps.push({ line: event.line, level: event.level, tick });
      }
    }
    tallies.mobsAlivePerTick.push(liveCount(state.mobs));
    tallies.score = state.score;
    tallies.ending = state.ending;
    // The listener's tick count equals a frame row's tickIndex exactly when
    // the state is the one that frame began on.
    if (sampleAt.has(tick)) tallies.densities.set(tick, densityOf(state));
  };
};

// Nearest-rank percentile over an ascending series.
const percentile = (sorted: readonly number[], rank: number): number =>
  sorted[Math.max(0, Math.ceil(rank * sorted.length) - 1)];

const distributionOf = (values: readonly number[]): Distribution => {
  if (values.length === 0) {
    return { count: 0, min: 0, max: 0, mean: 0, p50: 0, p95: 0, p99: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((total, value) => total + value, 0);
  return {
    count: sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
  };
};

// The debt series compacted to the frames where it changed, the first row always included.
const debtSamplesOf = (frames: readonly FrameObservation[]): DebtSample[] => {
  const samples: DebtSample[] = [];
  let last: number | null = null;
  frames.forEach((frame, index) => {
    if (frame.debtTicks === last) return;
    samples.push({
      frame: index,
      tick: frame.tickIndex,
      debtTicks: frame.debtTicks,
    });
    last = frame.debtTicks;
  });
  return samples;
};

const isExpensive = (frame: FrameObservation): boolean =>
  frame.intervalMs >= EXPENSIVE_FRAME_INTERVAL_MS;

const expensiveFramesOf = (
  frames: readonly FrameObservation[],
  densities: ReadonlyMap<number, FieldDensity>,
): ExpensiveFrame[] =>
  frames.flatMap((frame, index) => {
    if (!isExpensive(frame)) return [];
    return [
      {
        frame: index,
        reason: frame.reason,
        tick: frame.tickIndex,
        intervalMs: frame.intervalMs,
        advanceMs: frame.advanceMs,
        updateMs: frame.updateMs,
        ticksExecuted: frame.ticksExecuted,
        debtTicks: frame.debtTicks,
        density:
          frame.tickIndex === null
            ? null
            : (densities.get(frame.tickIndex) ?? null),
      },
    ];
  });

const performanceOf = (
  frames: readonly FrameObservation[],
  densities: ReadonlyMap<number, FieldDensity>,
): PerformanceReport => ({
  frames: frames.length,
  interval: distributionOf(frames.map((frame) => frame.intervalMs)),
  advance: distributionOf(frames.map((frame) => frame.advanceMs)),
  update: distributionOf(frames.map((frame) => frame.updateMs)),
  ticksPerFrame: distributionOf(frames.map((frame) => frame.ticksExecuted)),
  catchUpFrames: frames.filter((frame) => frame.ticksExecuted > 1).length,
  debtOverTime: debtSamplesOf(frames),
  expensiveFrames: expensiveFramesOf(frames, densities),
});

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

// The ticks the expensive frames began at, decided before the pass so the join needs only one.
const ticksToSample = (
  frames: readonly FrameObservation[],
): ReadonlySet<number> => {
  const ticks = new Set<number>();
  for (const frame of frames) {
    if (isExpensive(frame) && frame.tickIndex !== null) {
      ticks.add(frame.tickIndex);
    }
  }
  return ticks;
};

/**
 * Everything a tape can answer, through one replay.
 *
 * The expensive frames' ticks are collected before the pass and their field
 * densities sampled by the pass's own observer, never by one reproduction per
 * frame.
 */
const measure = (decoded: DecodedTape): Measurement => {
  const frames = frameObservations(decoded.tape);
  const sampleAt = ticksToSample(frames);
  const tallies = createTallies();
  // A frame starting at tick 0 began on the empty field, which no listener
  // call ever sees: the observer fires only after a tick has run.
  if (sampleAt.has(0)) tallies.densities.set(0, EMPTY_FIELD);

  const result = playTape(decoded.tape, observeInto(tallies, sampleAt));

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
    run: runSummaryOf(decoded, result, tallies),
    damage: tallies.damage,
    levelUps: tallies.levelUps,
    mobsAlivePerTick: tallies.mobsAlivePerTick,
    performance: performanceOf(frames, tallies.densities),
    recordedFaults: result.recordedFaults,
    readbackFaults: result.readbackFaults,
    provenance: provenanceOf(decoded.tape, result.recordedFaults),
  };
};

export { measure, EXPENSIVE_FRAME_INTERVAL_MS };
export type {
  AggregateExclusion,
  DebtSample,
  Distribution,
  Divergence,
  ExpensiveFrame,
  FieldDensity,
  LevelUp,
  Measurement,
  Metrics,
  PerformanceReport,
  Provenance,
  Refusal,
  RunSummary,
};
