// Chunk-level decoding: one chunk's payload, read back as the records it holds.

import type { ByteReader } from './bytes';
import {
  readF32,
  readF64,
  readI32,
  readString,
  readU16,
  readU32,
  readU8,
  remaining,
  stringFits,
} from './bytes';
import {
  BODY_FIRST_TICK_BYTES,
  CHECKPOINT_BYTES,
  COMMAND_BYTES,
  FAULT_OBSERVATION_FIXED_BYTES,
  FAULT_OBSERVATION_PREFIX_BYTES,
  FRAME_OBSERVATION_BYTES,
} from './segments';
import type {
  Observation,
  StartingConditionEntry,
  TapeCheckpoint,
  TapeHeader,
  TapeTrailer,
} from './tape';
import { FRAME_REASONS, TAPE_INPUT_DEVICES, TAPE_INTEGRITIES } from './tape';
import { TapeFormatError } from './tapeFormatError';
import {
  ABSENT_CODE,
  codeReader,
  ENDING_CODES,
  FAULT_IDENTITY_CODES,
  FAULT_SEVERITIES,
  FAULT_SEVERITY_CODES,
  FRAME_REASON_CODES,
  INPUT_DEVICE_CODES,
  INTEGRITY_CODES,
  OBSERVATION_KIND_CODES,
  RUN_ENDINGS,
  STOP_CODES,
  STOP_REASONS,
} from './wireCodes';
import { FAULT_IDENTITIES } from '../game/faults';
import type { TickCommand } from '../game/command';

const INPUT_DEVICES_BY_CODE = codeReader(
  TAPE_INPUT_DEVICES,
  INPUT_DEVICE_CODES,
);
const INTEGRITIES_BY_CODE = codeReader(TAPE_INTEGRITIES, INTEGRITY_CODES);
const STOPS_BY_CODE = codeReader(STOP_REASONS, STOP_CODES);
const ENDINGS_BY_CODE = codeReader(RUN_ENDINGS, ENDING_CODES);
const SEVERITIES_BY_CODE = codeReader(FAULT_SEVERITIES, FAULT_SEVERITY_CODES);
const FRAME_REASONS_BY_CODE = codeReader(FRAME_REASONS, FRAME_REASON_CODES);
const IDENTITIES_BY_CODE = codeReader(FAULT_IDENTITIES, FAULT_IDENTITY_CODES);

const named = <T extends string>(
  byCode: ReadonlyMap<number, T>,
  code: number,
  what: string,
): T => {
  const name = byCode.get(code);
  if (name === undefined) {
    throw new TapeFormatError(
      `${what} code ${code} is not one this reader knows`,
    );
  }
  return name;
};

/**
 * The whole starting condition, read back as the names and values the tape
 * wrote and nothing more (ADR 0043).
 *
 * Nothing is coerced into this build's own vocabulary here and nothing is
 * checked against it. A tape naming a row this build does not have is reported
 * as recorded, because the tape said something true and the reader's job is not
 * to edit it; `resolveStartingCondition` is the separate step that asks whether
 * this build can run what is written, and a block decoded straight into the
 * condition's own typed record is the mistake ADR 0043 was written against.
 */
const readStartingCondition = (
  payload: ByteReader,
): StartingConditionEntry[] => {
  const block: StartingConditionEntry[] = [];
  const named = readU16(payload);
  for (let entry = 0; entry < named; entry++) {
    // The name before the value, in the order they were written: readString
    // and readF64 both bounds-check, so a count larger than the bytes behind it
    // refuses here rather than yielding entries made of whatever followed.
    const name = readString(payload);
    block.push({ name, value: readF64(payload) });
  }
  return block;
};

const readHeader = (payload: ByteReader): TapeHeader => {
  const seed = readU32(payload);
  const startingCondition = readStartingCondition(payload);
  const tickRate = readU16(payload);
  const checkpointSpacing = readU32(payload);
  const witnessVersion = readU8(payload);
  const commitHash = readString(payload);
  const buildIdentity = readString(payload);
  const author = readString(payload);
  const inputDevice = named(
    INPUT_DEVICES_BY_CODE,
    readU8(payload),
    'an input device',
  );
  const policy = readString(payload);
  const keyboardSpeed = readF32(payload);
  const rendererBackend = readString(payload);
  const rendererResolution = readF32(payload);
  const devicePixelRatio = readF32(payload);
  const recordedAt = readF64(payload);
  if (checkpointSpacing < 1) {
    throw new TapeFormatError('a checkpoint spacing below one stamps nothing');
  }
  // The signal lock's own scale is not asked here any more. It is a row of the
  // starting-condition block now, and the block is open by construction: which
  // name is the lock is a question about this build's vocabulary, which is
  // resolveStartingCondition's to ask (ADR 0043). The refusal is not lost, it
  // moved, and a lock this build cannot hold is refused there in the same shape.
  return {
    seed,
    startingCondition,
    tickRate,
    checkpointSpacing,
    witnessVersion,
    commitHash,
    buildIdentity,
    author,
    inputDevice,
    policy,
    keyboardSpeed,
    rendererBackend,
    rendererResolution,
    devicePixelRatio,
    recordedAt,
  };
};

const readCommand = (payload: ByteReader): TickCommand => {
  const x = readF32(payload);
  const y = readF32(payload);
  return { move: { x, y }, belch: readU8(payload) === 1 };
};

/**
 * Appends a body chunk's commands, which must carry on from where the last one
 * stopped.
 *
 * A body chunk names the tick it starts at rather than how many it holds, which
 * is what lets a store append during a run. The cost is that a gap or an
 * overlap between two chunks is a real possibility, and it is refused here: a
 * tape whose ticks are not contiguous is not a run.
 *
 * The starting tick is checked for before it is read, on the same terms as the
 * records behind it. A recording cut inside those four bytes is a truncated
 * tape and not a malformed one, and reading them anyway refused the whole tape
 * over a cut that landed in a four-byte window. Strictness is untouched:
 * `refuseLeftovers` still throws when a chunk is complete and carries one to
 * three bytes that are not a whole record.
 */
const readBody = (payload: ByteReader, commands: TickCommand[]): void => {
  if (remaining(payload) < BODY_FIRST_TICK_BYTES) return;
  const firstTick = readU32(payload);
  if (firstTick !== commands.length) {
    throw new TapeFormatError(
      `a body chunk starts at tick ${firstTick} and the ticks before it end at ${commands.length}`,
    );
  }
  while (remaining(payload) >= COMMAND_BYTES) {
    commands.push(readCommand(payload));
  }
};

/**
 * Appends a witness chunk's checkpoints, which only ever climb.
 *
 * A checkpoint's index is how many ticks had run when it was stamped, so a run
 * stamps them in ascending order and an index that does not climb is not a
 * checkpoint. The rule earns its place on a cut tape rather than a sound one: a
 * chunk length that overran the buffer would otherwise have the rest of the
 * file read as checkpoints, and eight bytes of anything are a plausible-looking
 * pair of numbers. Refusing here is what keeps "bounds-checked before it
 * allocates" from meaning "believed once it fits".
 */
const readCheckpoints = (
  payload: ByteReader,
  checkpoints: TapeCheckpoint[],
): void => {
  let last = checkpoints[checkpoints.length - 1]?.index ?? -1;
  while (remaining(payload) >= CHECKPOINT_BYTES) {
    const index = readU32(payload);
    if (index <= last) {
      throw new TapeFormatError(
        `a checkpoint at index ${index} follows one at ${last}`,
      );
    }
    checkpoints.push({ index, witness: readI32(payload) });
    last = index;
  }
};

/**
 * Whether a whole observation starts at the cursor.
 *
 * The fault row carries a string, so its width is not fixed and a partly
 * written one at the end of an interrupted recording has to be recognised
 * before it is read rather than after.
 */
const observationFits = (payload: ByteReader): boolean => {
  if (remaining(payload) < 1) return false;
  const kind = payload.view.getUint8(payload.offset);
  if (kind === OBSERVATION_KIND_CODES.frame) {
    return remaining(payload) >= FRAME_OBSERVATION_BYTES;
  }
  if (kind !== OBSERVATION_KIND_CODES.fault) return false;
  if (remaining(payload) < FAULT_OBSERVATION_FIXED_BYTES) return false;
  return stringFits(payload, payload.offset + FAULT_OBSERVATION_PREFIX_BYTES);
};

const readObservation = (payload: ByteReader): Observation => {
  const kind = readU8(payload);
  if (kind === OBSERVATION_KIND_CODES.frame) {
    const reason = named(
      FRAME_REASONS_BY_CODE,
      readU8(payload),
      'a frame reason',
    );
    const present = readU8(payload) === 1;
    const tickIndex = readU32(payload);
    return {
      kind: 'frame',
      reason,
      tickIndex: present ? tickIndex : null,
      ticksExecuted: readU16(payload),
      intervalMs: readF32(payload),
      advanceMs: readF32(payload),
      updateMs: readF32(payload),
      debtTicks: readU32(payload),
    };
  }
  return {
    kind: 'fault',
    identity: named(IDENTITIES_BY_CODE, readU16(payload), 'a fault identity'),
    severity: named(SEVERITIES_BY_CODE, readU8(payload), 'a fault severity'),
    firstTick: readU32(payload),
    count: readU32(payload),
    detail: readString(payload),
  };
};

const readObservations = (
  payload: ByteReader,
  observations: Observation[],
): void => {
  while (observationFits(payload)) observations.push(readObservation(payload));
};

const readTrailer = (payload: ByteReader): TapeTrailer => {
  const endingCode = readU8(payload);
  return {
    ending:
      endingCode === ABSENT_CODE
        ? null
        : named(ENDINGS_BY_CODE, endingCode, 'an ending'),
    stop: named(STOPS_BY_CODE, readU8(payload), 'a stop'),
    integrity: named(INTEGRITIES_BY_CODE, readU8(payload), 'an integrity'),
    debtTicks: readU32(payload),
  };
};

export { readHeader, readBody, readCheckpoints, readObservations, readTrailer };
