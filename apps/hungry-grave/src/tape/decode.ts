// Bytes, read back as a tape: the stream's opening and its chunk frames, with
// each chunk's payload read by records.ts.

import type { ByteReader } from './bytes';
import {
  createReader,
  readU16,
  readU32,
  readU8,
  remaining,
  sliceReader,
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
  readBody,
  readCheckpoints,
  readHeader,
  readObservations,
  readTrailer,
} from './records';
import type {
  Observation,
  Tape,
  TapeCheckpoint,
  TapeHeader,
  TapeTrailer,
} from './tape';
import { TapeFormatError } from './tapeFormatError';
import { FORMAT_VERSION, TAPE_MAGIC } from './wireCodes';
import type { TickCommand } from '../game/command';

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
