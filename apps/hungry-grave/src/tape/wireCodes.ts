// How a tape's values are pinned to bytes: the magic it opens with, its format
// version, the code maps and the layout order they are written in.

import type { StopReason } from '../game/execution';
import type { FaultIdentity, FaultSeverity } from '../game/faults';
import type { WeaponLine } from '../game/lines/roster';
import type { RunEnding } from '../game/run';
import type {
  FrameReason,
  Observation,
  TapeInputDevice,
  TapeIntegrity,
} from './tape';

// The four bytes a tape opens with, so bytes that are not one are refused rather than parsed.
const TAPE_MAGIC = 'HGTP';

// The format's own version, separate from the witness version the header carries.
const FORMAT_VERSION = 1;

/**
 * EVERY ENCODING HERE IS PERMANENT FROM THE FIRST TAPE. The code maps are
 * append-only and read by name, never by a member's ordinal position in its
 * union, because reordering a union would otherwise move every tape's meaning
 * with no version bump and no diff anybody reads as dangerous. Each is typed as
 * a total Record, so adding a member fails the typecheck until somebody gives
 * it a code.
 */
const INPUT_DEVICE_CODES: Readonly<Record<TapeInputDevice, number>> = {
  keyboard: 1,
  touch: 2,
  bot: 3,
  script: 4,
  unknown: 5,
};

const INTEGRITY_CODES: Readonly<Record<TapeIntegrity, number>> = {
  clean: 1,
  faulted: 2,
  unchecked: 3,
};

/**
 * The members each code map is inverted through when a tape is read back.
 *
 * The map beside each one is typed as a total Record over the real union, so
 * the compiler holds the map complete; this list is what a decoder walks, and
 * wireCodes.test.ts holds the two against each other so neither can gain a
 * member the other has not heard of. A union the tape itself owns is listed in
 * tape.ts instead, beside the type it declares.
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

// The code a field takes when it is absent. No member of any map here may take it.
const ABSENT_CODE = 0;

/**
 * A fault's identity, written down as its own code map (ADR 0024).
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

const FRAME_REASON_CODES: Readonly<Record<FrameReason, number>> = {
  live: 1,
  ending: 2,
  paused: 3,
  backgrounded: 4,
  countdown: 5,
};

const OBSERVATION_KINDS = ['frame', 'fault'] as const;

const OBSERVATION_KIND_CODES: Readonly<Record<Observation['kind'], number>> = {
  frame: 1,
  fault: 2,
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
  codeReader,
  TAPE_MAGIC,
  FORMAT_VERSION,
  INPUT_DEVICE_CODES,
  INTEGRITY_CODES,
  STOP_REASONS,
  STOP_CODES,
  RUN_ENDINGS,
  ENDING_CODES,
  ABSENT_CODE,
  FAULT_IDENTITY_CODES,
  FAULT_SEVERITIES,
  FAULT_SEVERITY_CODES,
  FRAME_REASON_CODES,
  OBSERVATION_KINDS,
  OBSERVATION_KIND_CODES,
  HEADER_LEVELS_ORDER,
};
