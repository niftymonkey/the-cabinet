/**
 * What one run is recorded onto (ADR 0018): a header, three separable sections
 * and a trailer.
 *
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
 *
 * EVERY ENCODING HERE IS PERMANENT FROM THE FIRST TAPE. The code maps are
 * append-only and read by name, never by a member's ordinal position in its
 * union, because reordering a union would otherwise move every tape's meaning
 * with no version bump and no diff anybody reads as dangerous. Each is typed as
 * a total Record, so adding a member fails the typecheck until somebody gives
 * it a code.
 */

import type { StopReason } from '../game/execution';
import type { FaultIdentity, FaultSeverity } from '../game/invariants';
import type { WeaponLine } from '../game/lines/roster';
import type { RunEnding, TickCommand } from '../game/run';

/** The four bytes a tape opens with, so bytes that are not one are refused rather than parsed. */
const TAPE_MAGIC = 'HGTP';

/** The format's own version, separate from the witness version the header carries. */
const FORMAT_VERSION = 1;

/**
 * The checkpoint spacing the recorder writes on day one.
 *
 * It is a written value rather than a rule (ADR 0018 and ADR 0019). A reader
 * obeys whatever the tape's header says, never this constant, so a later
 * measurement can move the spacing without versioning the format and without
 * invalidating a single tape already recorded. The name says whose it is for
 * exactly that reason.
 */
const RECORDER_CHECKPOINT_SPACING = 60;

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

const INPUT_DEVICE_CODES: Readonly<Record<TapeInputDevice, number>> = {
  keyboard: 1,
  touch: 2,
  bot: 3,
  script: 4,
  unknown: 5,
};

/**
 * Whether the run a tape holds was sound (CONTEXT.md).
 *
 * Unchecked is a run that was recorded on an instrumentation build with the
 * invariant checks switched off, which is the one case where an empty fault
 * list is not evidence of a sound run.
 */
const TAPE_INTEGRITIES = ['clean', 'faulted', 'unchecked'] as const;

type TapeIntegrity = (typeof TAPE_INTEGRITIES)[number];

const INTEGRITY_CODES: Readonly<Record<TapeIntegrity, number>> = {
  clean: 1,
  faulted: 2,
  unchecked: 3,
};

/**
 * How a run stopped, as read off a tape. Unknown is what a missing trailer
 * says, so it is a reading rather than a value anything ever writes down.
 */
type TapeStop = StopReason | 'unknown';

/**
 * The members each code map is inverted through when a tape is read back.
 *
 * The map above each one is typed as a total Record over the real union, so the
 * compiler holds the map complete; this list is what a decoder walks, and
 * tape.test.ts holds the two against each other so neither can gain a member
 * the other has not heard of.
 */
const STOP_REASONS = ['finished', 'quit', 'faulted'] as const;

const STOP_CODES: Readonly<Record<StopReason, number>> = {
  finished: 1,
  quit: 2,
  faulted: 3,
};

/**
 * How a run ended, which is a different fact from how it stopped and never
 * merged with it. The absent code is a run that ended neither way.
 *
 * These are the tape's codes and not the witness fold's, deliberately: the two
 * are versioned by different numbers, the format version and the witness
 * version, and sharing one map would let a widening of either silently move the
 * other.
 */
const RUN_ENDINGS = ['sealed', 'victory'] as const;

const ENDING_CODES: Readonly<Record<RunEnding, number>> = {
  sealed: 1,
  victory: 2,
};

/** The code a field takes when it is absent. No member of any map above may take it. */
const ABSENT_CODE = 0;

/**
 * A fault's identity, written down as its own code map (ADR 0017).
 *
 * It is deliberately not the index of FAULT_IDENTITIES: an identity is
 * append-only from the first tape and outlives the check that raises it, so a
 * tape read back after the checks have been rewritten must still name the same
 * fault.
 */
const FAULT_IDENTITY_CODES: Readonly<Record<FaultIdentity, number>> = {
  'no NaN': 1,
  'size within floor and ceiling': 2,
  'in bounds': 3,
  'entities in bounds': 4,
  'entity caps': 5,
  'entity ids': 6,
  'freshness in range': 7,
  'reservoir in range': 8,
  'levels in range': 9,
  'one live ring': 10,
  'phase index only increases': 11,
  'phase tick resets at a boundary': 12,
};

const FAULT_SEVERITIES = ['fatal', 'recoverable'] as const;

const FAULT_SEVERITY_CODES: Readonly<Record<FaultSeverity, number>> = {
  fatal: 1,
  recoverable: 2,
};

/**
 * The order the four lines' starting levels are written in, spelled out rather
 * than read off the record's keys: a layout whose order depends on key
 * insertion order is a layout nobody can reproduce from the type alone, and it
 * is permanent from the first tape.
 */
const HEADER_LEVELS_ORDER: readonly WeaponLine[] = [
  'soulStream',
  'headstones',
  'wisps',
  'bell',
];

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
   * The starting level each line actually resolved to, for every run rather
   * than only a pinned one: an unpinned run records its birthright the same
   * way, or a later tune of the birthright would silently change what every
   * old tape replays as (ruled by Mark 2026-08-24, widening the closed list
   * by the same record-the-resolved-value argument as the size above).
   */
  readonly startingLevels: Readonly<Record<WeaponLine, number>>;
  /** What makes "one command per tick" mean anything, and what the observations join to wall clock through. */
  readonly tickRate: number;
  /** Ticks between checkpoints, obeyed by the reader rather than compiled into it. */
  readonly checkpointSpacing: number;
  /** The fold's own version, separate from the format version above it. */
  readonly witnessVersion: number;
  /** Human-readable metadata, never a fidelity gate: a README typo must not invalidate every tape. */
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
  /** ADR 0011's keyboard speed multiplier, which changes what a command means. */
  readonly keyboardSpeed: number;
  /** "webgl" or "webgpu", a constant for a run rather than a per-frame series. */
  readonly rendererBackend: string;
  /** The renderer's own resolution, which is not the device pixel ratio and does not substitute for it. */
  readonly rendererResolution: number;
  readonly devicePixelRatio: number;
  /** Wall clock, in epoch milliseconds, so a folder of tapes has an order. */
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
 * Why a frame is what it is, as the frame seam observed it (ADR 0018).
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

const FRAME_REASON_CODES: Readonly<Record<FrameReason, number>> = {
  live: 1,
  ending: 2,
  paused: 3,
  backgrounded: 4,
  countdown: 5,
};

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
  /** The raw interval since the previous frame. It says a frame was late and never what made it late. */
  readonly intervalMs: number;
  /** Time inside advance, which is where the simulation and its invariant checks both sit. */
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
  /** The run's discarded ticks so far, which are invisible in a body holding only executed ticks. */
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

const OBSERVATION_KINDS = ['frame', 'fault'] as const;

const OBSERVATION_KIND_CODES: Readonly<Record<Observation['kind'], number>> = {
  frame: 1,
  fault: 2,
};

/** What a run knows only once it stops, written once at the stop. */
interface TapeTrailer {
  readonly ending: RunEnding | null;
  readonly stop: StopReason;
  readonly integrity: TapeIntegrity;
  readonly debtTicks: number;
}

interface Tape {
  readonly header: TapeHeader;
  /** Exactly the commands the simulation consumed, in tick order from tick zero. */
  readonly commands: readonly TickCommand[];
  readonly checkpoints: readonly TapeCheckpoint[];
  readonly observations: readonly Observation[];
  /** Null on a tape whose run never reached its stop. */
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

/** Only the frame rows, which are the only observation kind with timings on it. */
const frameObservations = (tape: Tape): FrameObservation[] => {
  return tape.observations.filter(
    (observation): observation is FrameObservation =>
      observation.kind === 'frame',
  );
};

/** Only the fault records, which a readback reports and never rewrites. */
const faultObservations = (tape: Tape): FaultObservation[] => {
  return tape.observations.filter(
    (observation): observation is FaultObservation =>
      observation.kind === 'fault',
  );
};

/**
 * A code map read the other way, for a decoder.
 *
 * It is built from the members rather than from the record's own keys, because
 * a walk over an object's keys hands back strings and a decoder that has to
 * assert its way back to the union is a decoder that can lie about what it
 * found.
 */
const codeReader = <T extends string>(
  members: readonly T[],
  codes: Readonly<Record<T, number>>,
): ReadonlyMap<number, T> => {
  const byCode = new Map<number, T>();
  for (const member of members) byCode.set(codes[member], member);
  return byCode;
};

export {
  stopOf,
  frameObservations,
  faultObservations,
  codeReader,
  TAPE_MAGIC,
  FORMAT_VERSION,
  RECORDER_CHECKPOINT_SPACING,
  TAPE_INPUT_DEVICES,
  INPUT_DEVICE_CODES,
  TAPE_INTEGRITIES,
  INTEGRITY_CODES,
  STOP_REASONS,
  STOP_CODES,
  RUN_ENDINGS,
  ENDING_CODES,
  ABSENT_CODE,
  FAULT_IDENTITY_CODES,
  FAULT_SEVERITIES,
  FAULT_SEVERITY_CODES,
  HEADER_LEVELS_ORDER,
  FRAME_REASONS,
  FRAME_REASON_CODES,
  OBSERVATION_KINDS,
  OBSERVATION_KIND_CODES,
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
