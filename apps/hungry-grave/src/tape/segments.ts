// Chunk-level encoding: one segment is one chunk's bytes.

import type { ByteWriter } from './bytes';
import {
  createWriter,
  writeF32,
  writeF64,
  writeI32,
  writeString,
  writeU16,
  writeU32,
  writeU8,
  writtenBytes,
} from './bytes';
import {
  CHUNK_BODY,
  CHUNK_HEADER,
  CHUNK_OBSERVATIONS,
  CHUNK_TRAILER,
  CHUNK_WITNESS,
  writeChunk,
} from './chunks';
import type {
  FaultObservation,
  FrameObservation,
  Observation,
  TapeCheckpoint,
  TapeHeader,
  TapeTrailer,
} from './tape';
import {
  ABSENT_CODE,
  ENDING_CODES,
  FAULT_IDENTITY_CODES,
  FAULT_SEVERITY_CODES,
  FORMAT_VERSION,
  FRAME_REASON_CODES,
  HEADER_LEVELS_ORDER,
  INPUT_DEVICE_CODES,
  INTEGRITY_CODES,
  OBSERVATION_KIND_CODES,
  STOP_CODES,
  TAPE_MAGIC,
} from './tape';
import type { TickCommand } from '../game/run';

const writeMagic = (writer: ByteWriter): void => {
  for (const character of TAPE_MAGIC) writeU8(writer, character.charCodeAt(0));
};

const writeHeaderRecord = (payload: ByteWriter, header: TapeHeader): void => {
  writeU32(payload, header.seed);
  writeF64(payload, header.startingSize);
  for (const line of HEADER_LEVELS_ORDER) {
    writeU8(payload, header.startingLevels[line]);
  }
  writeU16(payload, header.tickRate);
  writeU32(payload, header.checkpointSpacing);
  writeU8(payload, header.witnessVersion);
  writeString(payload, header.commitHash);
  writeString(payload, header.buildIdentity);
  writeString(payload, header.author);
  writeU8(payload, INPUT_DEVICE_CODES[header.inputDevice]);
  writeF32(payload, header.keyboardSpeed);
  writeString(payload, header.rendererBackend);
  writeF32(payload, header.rendererResolution);
  writeF32(payload, header.devicePixelRatio);
  writeF64(payload, header.recordedAt);
};

const writeCommand = (payload: ByteWriter, command: TickCommand): void => {
  writeF32(payload, command.move.x);
  writeF32(payload, command.move.y);
  writeU8(payload, command.belch ? 1 : 0);
};

const writeCheckpoint = (
  payload: ByteWriter,
  checkpoint: TapeCheckpoint,
): void => {
  writeU32(payload, checkpoint.index);
  writeI32(payload, checkpoint.witness);
};

const writeFrameObservation = (
  payload: ByteWriter,
  frame: FrameObservation,
): void => {
  writeU8(payload, OBSERVATION_KIND_CODES.frame);
  writeU8(payload, FRAME_REASON_CODES[frame.reason]);
  // A presence byte rather than a sentinel tick index: no tick number is
  // reserved, so an absent index needs a place of its own to be said in.
  writeU8(payload, frame.tickIndex === null ? 0 : 1);
  writeU32(payload, frame.tickIndex ?? 0);
  writeU16(payload, frame.ticksExecuted);
  writeF32(payload, frame.intervalMs);
  writeF32(payload, frame.advanceMs);
  writeF32(payload, frame.updateMs);
  writeU32(payload, frame.debtTicks);
};

const writeFaultObservation = (
  payload: ByteWriter,
  fault: FaultObservation,
): void => {
  writeU8(payload, OBSERVATION_KIND_CODES.fault);
  writeU16(payload, FAULT_IDENTITY_CODES[fault.identity]);
  writeU8(payload, FAULT_SEVERITY_CODES[fault.severity]);
  writeU32(payload, fault.firstTick);
  writeU32(payload, fault.count);
  writeString(payload, fault.detail);
};

const writeObservation = (
  payload: ByteWriter,
  observation: Observation,
): void => {
  if (observation.kind === 'frame') {
    writeFrameObservation(payload, observation);
    return;
  }
  writeFaultObservation(payload, observation);
};

const writeTrailerRecord = (
  payload: ByteWriter,
  trailer: TapeTrailer,
): void => {
  writeU8(
    payload,
    trailer.ending === null ? ABSENT_CODE : ENDING_CODES[trailer.ending],
  );
  writeU8(payload, STOP_CODES[trailer.stop]);
  writeU8(payload, INTEGRITY_CODES[trailer.integrity]);
  writeU32(payload, trailer.debtTicks);
};

/**
 * One chunk's bytes: the kind, the length and the payload the fill wrote. A
 * store can append a run as the run produces it instead of waiting for
 * encodeTape at the stop (#58).
 */
const chunkBytes = (
  kind: number,
  fill: (payload: ByteWriter) => void,
): Uint8Array => {
  const writer = createWriter();
  writeChunk(writer, kind, fill);
  return writtenBytes(writer);
};

/**
 * The stream's opening: the magic, the format version and the header chunk.
 * They travel as one segment because a header chunk without the magic in front
 * of it is not appendable to anything a reader accepts. Segments concatenated
 * in the order a run produces them are therefore themselves a canonical
 * FORMAT_VERSION 1 stream.
 *
 * The layout is frozen: sealed FORMAT_VERSION 1 tapes exist outside the tree,
 * so codec.test.ts pins encodeTape's bytes and segments.test.ts pins these
 * encoders against encodeTape.
 */
const headerSegment = (header: TapeHeader): Uint8Array => {
  const writer = createWriter();
  writeMagic(writer);
  writeU16(writer, FORMAT_VERSION);
  writeChunk(writer, CHUNK_HEADER, (payload) =>
    writeHeaderRecord(payload, header),
  );
  return writtenBytes(writer);
};

// A body chunk names the tick it starts at, which is what lets a store append.
const bodySegment = (
  firstTick: number,
  commands: readonly TickCommand[],
): Uint8Array =>
  chunkBytes(CHUNK_BODY, (payload) => {
    writeU32(payload, firstTick);
    for (const command of commands) writeCommand(payload, command);
  });

const witnessSegment = (checkpoints: readonly TapeCheckpoint[]): Uint8Array =>
  chunkBytes(CHUNK_WITNESS, (payload) => {
    for (const checkpoint of checkpoints) writeCheckpoint(payload, checkpoint);
  });

const observationsSegment = (
  observations: readonly Observation[],
): Uint8Array =>
  chunkBytes(CHUNK_OBSERVATIONS, (payload) => {
    for (const observation of observations) {
      writeObservation(payload, observation);
    }
  });

const trailerSegment = (trailer: TapeTrailer): Uint8Array =>
  chunkBytes(CHUNK_TRAILER, (payload) => writeTrailerRecord(payload, trailer));

export {
  headerSegment,
  bodySegment,
  witnessSegment,
  observationsSegment,
  trailerSegment,
};
