// Bytes, read back as a tape.

import type { ByteReader } from './bytes';
import {
  createReader,
  readF32,
  readF64,
  readI32,
  readString,
  readU16,
  readU32,
  readU8,
  remaining,
  sliceReader,
  stringFits,
  TapeFormatError,
} from './bytes';
import {
  CHUNK_BODY,
  CHUNK_FRAME_BYTES,
  CHUNK_HEADER,
  CHUNK_OBSERVATIONS,
  CHUNK_TRAILER,
  CHUNK_WITNESS,
} from './chunks';
import {
  BODY_FIRST_TICK_BYTES,
  CHECKPOINT_BYTES,
  COMMAND_BYTES,
  FAULT_OBSERVATION_FIXED_BYTES,
  FAULT_OBSERVATION_PREFIX_BYTES,
  FRAME_OBSERVATION_BYTES,
} from './encode';
import type {
  Observation,
  Tape,
  TapeCheckpoint,
  TapeHeader,
  TapeTrailer,
} from './tape';
import {
  ABSENT_CODE,
  codeReader,
  ENDING_CODES,
  FAULT_IDENTITY_CODES,
  FAULT_SEVERITIES,
  FAULT_SEVERITY_CODES,
  FORMAT_VERSION,
  FRAME_REASON_CODES,
  FRAME_REASONS,
  HEADER_LEVELS_ORDER,
  INPUT_DEVICE_CODES,
  INTEGRITY_CODES,
  OBSERVATION_KIND_CODES,
  RUN_ENDINGS,
  STOP_CODES,
  STOP_REASONS,
  TAPE_INPUT_DEVICES,
  TAPE_INTEGRITIES,
  TAPE_MAGIC,
} from './tape';
import { FAULT_IDENTITIES } from '../game/faults';
import type { WeaponLine } from '../game/lines/roster';
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

// A decoded tape, plus whether the bytes ran out before the recording did.
interface DecodedTape {
  readonly tape: Tape;
  /**
   * Whether the byte stream stopped mid-record.
   *
   * It is not the same question as whether there is a trailer. A tape can end
   * cleanly with no trailer, which is the tab-closed reading, and a tape can be
   * cut off with everything it did manage to write still sound.
   */
  readonly truncated: boolean;
}

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

const readMagic = (reader: ByteReader): void => {
  let magic = '';
  for (let index = 0; index < TAPE_MAGIC.length; index++) {
    magic += String.fromCharCode(readU8(reader));
  }
  if (magic !== TAPE_MAGIC) {
    throw new TapeFormatError(
      `these bytes open with "${magic}" and not a tape`,
    );
  }
};

// The four starting levels, read in the same spelled-out order they were written.
const readStartingLevels = (
  payload: ByteReader,
): Record<WeaponLine, number> => {
  const levels: Record<WeaponLine, number> = {
    soulStream: 0,
    headstones: 0,
    wisps: 0,
    bell: 0,
  };
  for (const line of HEADER_LEVELS_ORDER) levels[line] = readU8(payload);
  return levels;
};

const readHeader = (payload: ByteReader): TapeHeader => {
  const seed = readU32(payload);
  const startingSize = readF64(payload);
  const startingLevels = readStartingLevels(payload);
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
  const keyboardSpeed = readF32(payload);
  const rendererBackend = readString(payload);
  const rendererResolution = readF32(payload);
  const devicePixelRatio = readF32(payload);
  const recordedAt = readF64(payload);
  if (checkpointSpacing < 1) {
    throw new TapeFormatError('a checkpoint spacing below one stamps nothing');
  }
  return {
    seed,
    startingSize,
    startingLevels,
    tickRate,
    checkpointSpacing,
    witnessVersion,
    commitHash,
    buildIdentity,
    author,
    inputDevice,
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

/**
 * How much of a chunk is actually present, which is never more than the buffer
 * holds.
 *
 * A recording that stops mid-stream is a tape and not garbage. One of the two
 * shapes "too easy" takes is not dying but losing interest and closing the tab,
 * so a decoder that only accepted finished recordings would be blind to exactly
 * the failure the instrument was built to find. A trailing chunk that the
 * buffer cannot hold is therefore read for as many whole records as are
 * actually there, and the tape says it was truncated.
 */
const presentBytes = (reader: ByteReader, declared: number): number => {
  return Math.min(declared, remaining(reader));
};

interface Sections {
  header: TapeHeader | null;
  readonly commands: TickCommand[];
  readonly checkpoints: TapeCheckpoint[];
  readonly observations: Observation[];
  trailer: TapeTrailer | null;
}

/**
 * One chunk into the sections it belongs to.
 *
 * A kind this reader does not know is skipped rather than refused, because that
 * is the whole reason the sections carry their lengths: a tape written by a
 * later recorder still reads here, minus what it added.
 *
 * A short header is refused rather than skipped. A tape whose header did not
 * finish being written has no identity, no seed and no starting size, so there
 * is nothing left for a reader to be right about.
 */
const refuseLeftovers = (
  payload: ByteReader,
  complete: boolean,
  what: string,
): void => {
  if (!complete || remaining(payload) === 0) return;
  throw new TapeFormatError(
    `${what} has ${remaining(payload)} bytes left over that are not a whole record`,
  );
};

// Once per session: a tape from a later recorder usually carries the same
// unknown kind in every one of its segments.
let reportedUnknownChunk = false;

// Says what a forward-compatible skip cost, because nothing abnormal is silent.
const reportUnknownChunk = (kind: number): void => {
  if (reportedUnknownChunk) return;
  reportedUnknownChunk = true;
  console.warn(
    `this tape carries a chunk of kind ${kind} that this reader does not know; it is skipped, so whatever a later recorder wrote into it is missing from the tape you get, and no later skip is reported`,
  );
};

/**
 * Says that a trailer was cut short, because nothing abnormal is silent. No
 * flag guards it: a tape has one trailer, so this fires at most once per decode.
 */
const reportCutTrailer = (): void => {
  console.warn(
    "this tape's trailer was cut off part-written; it reads back with no ending, no stop reason and no tick debt, so how the run finished is gone",
  );
};

const readChunk = (
  kind: number,
  payload: ByteReader,
  sections: Sections,
  complete: boolean,
): void => {
  if (kind === CHUNK_HEADER) {
    sections.header = readHeader(payload);
    refuseLeftovers(payload, complete, 'the header');
    return;
  }
  if (kind === CHUNK_BODY) {
    readBody(payload, sections.commands);
    refuseLeftovers(payload, complete, 'a body chunk');
    return;
  }
  if (kind === CHUNK_WITNESS) {
    readCheckpoints(payload, sections.checkpoints);
    refuseLeftovers(payload, complete, 'a witness chunk');
    return;
  }
  if (kind === CHUNK_OBSERVATIONS) {
    readObservations(payload, sections.observations);
    refuseLeftovers(payload, complete, 'an observations chunk');
    return;
  }
  if (kind !== CHUNK_TRAILER) {
    reportUnknownChunk(kind);
    return;
  }
  // A trailer is written in one go at the stop, so half of one is no trailer at
  // all rather than a trailer with some fields missing.
  if (!complete) {
    reportCutTrailer();
    return;
  }
  sections.trailer = readTrailer(payload);
  refuseLeftovers(payload, complete, 'the trailer');
};

/**
 * A tape from bytes, whether or not the recording that wrote them finished.
 *
 * A tape from a stranger must not be able to make the reader misbehave. So no
 * allocation is ever sized from a length that came off the wire: a chunk length
 * is checked against the bytes actually present before anything is read, and a
 * record is read only once the bytes it needs are known to be there. Anything
 * structurally impossible, rather than merely cut short, is refused.
 *
 * The format version is a refusal and never a best effort: a reader that
 * guessed at a layout it does not know would produce numbers nobody can trust,
 * which is worse than no numbers.
 */
const decodeTape = (bytes: Uint8Array): DecodedTape => {
  const reader = createReader(bytes);
  readMagic(reader);
  const version = readU16(reader);
  if (version !== FORMAT_VERSION) {
    throw new TapeFormatError(
      `this tape is format version ${version} and this reader is version ${FORMAT_VERSION}`,
    );
  }

  const sections: Sections = {
    header: null,
    commands: [],
    checkpoints: [],
    observations: [],
    trailer: null,
  };
  let truncated = false;

  while (remaining(reader) > 0) {
    if (remaining(reader) < CHUNK_FRAME_BYTES) {
      truncated = true;
      break;
    }
    const kind = readU8(reader);
    const declared = readU32(reader);
    // The declared length is checked against the bytes in hand before a single
    // one is read, so nothing is ever sized from a number off the wire.
    const present = presentBytes(reader, declared);
    const complete = present === declared;
    if (!complete) truncated = true;
    readChunk(kind, sliceReader(reader, present), sections, complete);
    if (!complete) break;
  }

  const header = sections.header;
  if (header === null) {
    throw new TapeFormatError('this tape has no header');
  }
  return {
    tape: {
      header,
      commands: sections.commands,
      checkpoints: sections.checkpoints,
      observations: sections.observations,
      trailer: sections.trailer,
    },
    truncated,
  };
};

export { decodeTape };
export type { DecodedTape };
