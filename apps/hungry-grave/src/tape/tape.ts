/**
 * What one run is recorded onto (ADR 0018): a header, three separable sections
 * and a trailer.
 */

import type { StopReason } from '../game/execution';
import type { FaultIdentity, FaultSeverity } from '../game/faults';
import type { TickCommand } from '../game/command';
import type { RunEnding } from '../game/run';

/**
 * What steered the run, decided before the first tick because the header is
 * written before the first tick.
 *
 * It is the run's device class rather than a per-frame reading of which model
 * won a given tick: a phone tape and a desktop tape are the comparison the
 * header exists to make, and that is a constant for a run.
 */
const TAPE_INPUT_DEVICES = [
  'keyboard',
  'touch',
  'bot',
  'script',
  'unknown',
] as const;

type TapeInputDevice = (typeof TAPE_INPUT_DEVICES)[number];

/**
 * Whether the run a tape holds was sound (CONTEXT.md).
 *
 * Unchecked is a run that was recorded on an instrumentation build with the
 * invariant checks switched off, which is the one case where an empty fault
 * list is not evidence of a sound run.
 */
const TAPE_INTEGRITIES = ['clean', 'faulted', 'unchecked'] as const;

type TapeIntegrity = (typeof TAPE_INTEGRITIES)[number];

/**
 * How a run stopped, as read off a tape. Unknown is what a missing trailer
 * says, so it is a reading rather than a value anything ever writes down.
 */
type TapeStop = StopReason | 'unknown';

/**
 * The run's identity and its conditions, written before the first tick.
 *
 * It carries nothing knowable only when a run stops. That rule is what makes
 * the format writable incrementally, and it is why the outcome lives in the
 * trailer instead.
 */
interface TapeHeader {
  readonly seed: number;
  /**
   * The starting size the run actually resolved to, as a number rather than a
   * nullable "pinned or not". Recording the absence would let a later tune of
   * the compiled default silently change what every old tape replays as.
   */
  readonly startingSize: number;
  /**
   * The weapon lines this tape was written against, in the order its level
   * bytes follow (ADR 0043).
   *
   * It is recorded so the level bytes can be read by name instead of by
   * position: the roster is an open set, so a reader that supplied the names
   * from its own present-day world would return a wrong number the moment the
   * set moved. Strings and not the WeaponLine union, because the whole point is
   * to hold what the tape said even when this build does not implement it.
   */
  readonly recordedRoster: readonly string[];
  /**
   * The starting level each recorded line actually resolved to, keyed by the
   * tape's own vocabulary rather than the reader's (ADR 0043).
   *
   * Resolved for every run rather than only a pinned one: an unpinned run
   * records its birthright the same way, or a later tune of the birthright
   * would silently change what every old tape replays as (ruled by Mark
   * 2026-08-24, widening the closed list by the same record-the-resolved-value
   * argument as the size above). `resolveStartingLevels` is the one step that
   * asks whether this build can run what is written here, and it is the only
   * thing that ever produces a Record over the current roster.
   */
  readonly startingLevels: Readonly<Record<string, number>>;
  // What makes "one command per tick" mean anything, and what the observations join to wall clock through.
  readonly tickRate: number;
  // Ticks between checkpoints, obeyed by the reader rather than compiled into it.
  readonly checkpointSpacing: number;
  // The fold's own version, separate from the tape's own format version.
  readonly witnessVersion: number;
  // Human-readable metadata, never a fidelity gate: a README typo must not invalidate every tape.
  readonly commitHash: string;
  /**
   * Reserved for a resolvable build identity. The machinery that would resolve
   * one is deliberately not built, and the field is here because header shape
   * is one-way once tapes exist.
   */
  readonly buildIdentity: string;
  /**
   * Who steered the run. Reserved in the same sense as the build identity:
   * nothing in the game names an author yet, and a folder of tapes from more
   * than one pair of hands needs the field to already be in the format.
   */
  readonly author: string;
  readonly inputDevice: TapeInputDevice;
  // ADR 0011's keyboard speed multiplier, which changes what a command means.
  readonly keyboardSpeed: number;
  // "webgl" or "webgpu", a constant for a run rather than a per-frame series.
  readonly rendererBackend: string;
  // The renderer's own resolution, which is not the device pixel ratio and does not substitute for it.
  readonly rendererResolution: number;
  readonly devicePixelRatio: number;
  // Wall clock, in epoch milliseconds, so a folder of tapes has an order.
  readonly recordedAt: number;
}

/**
 * The witness at one checkpoint. Index N is the fold of the state after
 * executeTick has run N times, so index 0 is the state before any tick.
 */
interface TapeCheckpoint {
  readonly index: number;
  readonly witness: number;
}

/**
 * Why a frame is what it is, as the frame seam observed it (ADR 0032).
 *
 * The list is closed over the states the seam can actually be in: live is a
 * frame that reached the simulation, and the other four name the guard
 * condition that held the frame still instead. It is a separate fact from the
 * tick purchase, and recorded because a replay could never recompute it: the
 * body holds only executed ticks, so whether a frame was held by the menu, a
 * backgrounded tab, the run's own ending or the resume countdown is runtime
 * history the tape has to write down or lose.
 */
const FRAME_REASONS = [
  'live',
  'ending',
  'paused',
  'backgrounded',
  'countdown',
] as const;

type FrameReason = (typeof FRAME_REASONS)[number];

/**
 * One rendered frame, as observed at the frame seam.
 *
 * A minimum timing row and never a speculative telemetry schema (ADR 0018).
 * Everything about the field at this frame is recoverable by replaying the tape
 * to its tick, so none of it is written down here; what is written down is only
 * what a replay could never recompute.
 */
interface FrameObservation {
  readonly kind: 'frame';
  /**
   * Why the frame is what it is. When more than one holding condition is true
   * at once, the seam records the first in its guard's own order: ending, then
   * paused, then backgrounded, then countdown.
   */
  readonly reason: FrameReason;
  /**
   * The tick the frame started at, absent when the frame bought no ticks, and
   * absent rather than fabricated.
   *
   * The predicate is the tick purchase and never the pause: at a 120Hz refresh
   * against a 60Hz tick rate roughly half of ordinary live frames buy no tick,
   * so a null here says nothing about why the frame bought nothing. The reason
   * above carries that.
   */
  readonly tickIndex: number | null;
  readonly ticksExecuted: number;
  // The raw interval since the previous frame. It says a frame was late and never what made it late.
  readonly intervalMs: number;
  // Time inside advance, which is where the simulation and its invariant checks both sit.
  readonly advanceMs: number;
  /**
   * Time inside `GameScreen.update`, which is the frame's simulation work and
   * not the frame.
   *
   * `Application.render` is registered at LOW priority while the update
   * callback is NORMAL (ADR 0017), so the renderer's whole pass falls outside
   * this window. The gap between this and `intervalMs` is therefore mostly
   * rendering rather than idle time, and reading it as idle is the mistake the
   * name guards against. Subtracting `advanceMs` leaves the announce and sync
   * costs ADR 0020 names.
   */
  readonly updateMs: number;
  // The run's discarded ticks so far, which are invisible in a body holding only executed ticks.
  readonly debtTicks: number;
}

/**
 * One invariant broken during the run, de-duplicated by identity.
 *
 * A persistent recoverable fault fires on every tick, so a row per tick would
 * bury the run under one repeated fault. The count is mutable for the same
 * reason the authority's own record is: the row is written when the identity is
 * first seen and the tally goes on climbing behind it.
 */
interface FaultObservation {
  readonly kind: 'fault';
  readonly identity: FaultIdentity;
  readonly severity: FaultSeverity;
  readonly firstTick: number;
  readonly detail: string;
  count: number;
}

/**
 * Something a tape records because replaying it could never recompute it.
 *
 * The section is general on purpose and timings are merely its first
 * inhabitants: fault records live here rather than in the trailer because they
 * are per-tick, and the trailer carries only the summary a reader needs before
 * deciding whether to trust the run at all.
 */
type Observation = FrameObservation | FaultObservation;

// What a run knows only once it stops, written once at the stop.
interface TapeTrailer {
  readonly ending: RunEnding | null;
  readonly stop: StopReason;
  readonly integrity: TapeIntegrity;
  readonly debtTicks: number;
}

/**
 * The body holds the run's dice, its resolved starting size and the exact
 * steering the simulation consumed, tick by tick. The second section holds the
 * witness at checkpoints. The third holds observations, which are the things
 * replaying the tape could never recompute. The trailer is written last on
 * purpose, so a tape off a tab somebody simply closed has none and reads as a
 * stop of unknown.
 *
 * A tape holds no field state. Anything a replay can rebuild is computed by
 * replaying it, which is what lets a tape recorded today answer a question
 * nobody has thought of yet.
 */
interface Tape {
  readonly header: TapeHeader;
  // Exactly the commands the simulation consumed, in tick order from tick zero.
  readonly commands: readonly TickCommand[];
  readonly checkpoints: readonly TapeCheckpoint[];
  readonly observations: readonly Observation[];
  // Null on a tape whose run never reached its stop.
  readonly trailer: TapeTrailer | null;
}

/**
 * How the run stopped, as this tape can say it.
 *
 * A reader that finds no trailer reads unknown, which is exactly the tab-closed
 * case and the reading the instrument most needs: one of the two shapes "too
 * easy" takes is not dying but losing interest and closing the tab.
 */
const stopOf = (tape: Tape): TapeStop => {
  if (tape.trailer === null) return 'unknown';
  return tape.trailer.stop;
};

// Only the frame rows, which are the only observation kind with timings on it.
const frameObservations = (tape: Tape): FrameObservation[] => {
  return tape.observations.filter(
    (observation): observation is FrameObservation =>
      observation.kind === 'frame',
  );
};

// Only the fault records, which a readback reports and never rewrites.
const faultObservations = (tape: Tape): FaultObservation[] => {
  return tape.observations.filter(
    (observation): observation is FaultObservation =>
      observation.kind === 'fault',
  );
};

export {
  stopOf,
  frameObservations,
  faultObservations,
  TAPE_INPUT_DEVICES,
  TAPE_INTEGRITIES,
  FRAME_REASONS,
};
export type {
  TapeInputDevice,
  TapeIntegrity,
  TapeStop,
  TapeHeader,
  TapeCheckpoint,
  FrameReason,
  FrameObservation,
  FaultObservation,
  Observation,
  TapeTrailer,
  Tape,
};
