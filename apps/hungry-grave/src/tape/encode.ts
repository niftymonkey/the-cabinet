/**
 * A tape, as bytes.
 *
 * Bytes and never a JSON string, and the frame rows are what makes that decide
 * anything. A twelve-thousand-tick run is 110KiB of header, body, witness and
 * trailer, and then one 25-byte observation per rendered frame on top: 403KiB
 * at a 60Hz refresh and 696KiB at 120Hz, where the rows outweigh the body two
 * and two-thirds to five and a third times over. Base64 and UTF-16 multiply
 * whatever that is by eight thirds, so the encoding decides whether a full
 * stage's run is a file somebody can hold and send or a hosting problem.
 *
 * Steering is two float32, one per axis, through the same single-precision
 * rounding the simulation already applies. It has no scale to derive, no range
 * limit and asks for no clamp in the input path, which is the shape ADR 0011
 * was already burned by.
 */

import type { ByteWriter } from "./bytes";
import {
  createWriter,
  STRING_LENGTH_BYTES,
  writeF32,
  writeF64,
  writeI32,
  writeString,
  writeU16,
  writeU32,
  writeU8,
  writtenBytes,
} from "./bytes";
import {
  CHUNK_BODY,
  CHUNK_HEADER,
  CHUNK_OBSERVATIONS,
  CHUNK_TRAILER,
  CHUNK_WITNESS,
  writeChunk,
} from "./chunks";
import type {
  FaultObservation,
  FrameObservation,
  Observation,
  Tape,
  TapeCheckpoint,
  TapeHeader,
  TapeTrailer,
} from "./tape";
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
} from "./tape";
import type { TickCommand } from "../game/run";

/** Two float32 of steering and one flag byte, which is what a body row costs. */
export const COMMAND_BYTES = 9;

/** The tick a body chunk starts at, which is the only field in front of its commands. */
export const BODY_FIRST_TICK_BYTES = 4;

/** A checkpoint index and its witness. */
export const CHECKPOINT_BYTES = 8;

/** A frame row's fixed width: it carries no string, so it has only one. */
export const FRAME_OBSERVATION_BYTES = 25;

/** A fault row's kind, identity, severity, first tick and count, ahead of its detail string. */
export const FAULT_OBSERVATION_PREFIX_BYTES = 12;

/** The same, plus the detail string's own length prefix. */
export const FAULT_OBSERVATION_FIXED_BYTES =
  FAULT_OBSERVATION_PREFIX_BYTES + STRING_LENGTH_BYTES;

function writeMagic(writer: ByteWriter): void {
  for (const character of TAPE_MAGIC) writeU8(writer, character.charCodeAt(0));
}

function writeHeader(payload: ByteWriter, header: TapeHeader): void {
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
}

function writeCommand(payload: ByteWriter, command: TickCommand): void {
  writeF32(payload, command.move.x);
  writeF32(payload, command.move.y);
  writeU8(payload, command.belch ? 1 : 0);
}

function writeBody(
  payload: ByteWriter,
  firstTick: number,
  commands: readonly TickCommand[],
): void {
  writeU32(payload, firstTick);
  for (const command of commands) writeCommand(payload, command);
}

function writeCheckpoint(
  payload: ByteWriter,
  checkpoint: TapeCheckpoint,
): void {
  writeU32(payload, checkpoint.index);
  writeI32(payload, checkpoint.witness);
}

function writeFrameObservation(
  payload: ByteWriter,
  frame: FrameObservation,
): void {
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
}

function writeFaultObservation(
  payload: ByteWriter,
  fault: FaultObservation,
): void {
  writeU8(payload, OBSERVATION_KIND_CODES.fault);
  writeU16(payload, FAULT_IDENTITY_CODES[fault.identity]);
  writeU8(payload, FAULT_SEVERITY_CODES[fault.severity]);
  writeU32(payload, fault.firstTick);
  writeU32(payload, fault.count);
  writeString(payload, fault.detail);
}

function writeObservation(payload: ByteWriter, observation: Observation): void {
  if (observation.kind === "frame") {
    writeFrameObservation(payload, observation);
    return;
  }
  writeFaultObservation(payload, observation);
}

function writeTrailer(payload: ByteWriter, trailer: TapeTrailer): void {
  writeU8(
    payload,
    trailer.ending === null ? ABSENT_CODE : ENDING_CODES[trailer.ending],
  );
  writeU8(payload, STOP_CODES[trailer.stop]);
  writeU8(payload, INTEGRITY_CODES[trailer.integrity]);
  writeU32(payload, trailer.debtTicks);
}

/** The commands a body chunk holds, being everything up to the next checkpoint. */
function commandsUntil(
  tape: Tape,
  from: number,
  until: number,
): readonly TickCommand[] {
  return tape.commands.slice(from, until);
}

/**
 * The body and the witness, interleaved the way a run produces them: a
 * checkpoint, then the ticks that follow it, then the next checkpoint.
 *
 * The order is what makes the incremental-writability rule real rather than a
 * claim about the format. A tape written as one body chunk followed by one
 * witness chunk loses every checkpoint the moment its tail is cut off, so a
 * recording interrupted at nine thousand ticks could be verified to nothing at
 * all; written in the order the run made them, a cut tape verifies to its last
 * complete checkpoint and keeps the ticks behind it.
 */
function writeBodyAndWitness(writer: ByteWriter, tape: Tape): void {
  let written = 0;
  for (let index = 0; index < tape.checkpoints.length; index++) {
    const checkpoint = tape.checkpoints[index];
    writeChunk(writer, CHUNK_WITNESS, (payload) =>
      writeCheckpoint(payload, checkpoint),
    );
    const until =
      index + 1 < tape.checkpoints.length
        ? Math.min(tape.checkpoints[index + 1].index, tape.commands.length)
        : tape.commands.length;
    if (until <= written) continue;
    const commands = commandsUntil(tape, written, until);
    const firstTick = written;
    writeChunk(writer, CHUNK_BODY, (payload) =>
      writeBody(payload, firstTick, commands),
    );
    written = until;
  }
  if (written >= tape.commands.length) return;
  const commands = commandsUntil(tape, written, tape.commands.length);
  const firstTick = written;
  writeChunk(writer, CHUNK_BODY, (payload) =>
    writeBody(payload, firstTick, commands),
  );
}

/**
 * The whole tape, in the order a reader meets it: the header first because it
 * is written before the first tick, and the trailer last because it is written
 * at the stop and a missing one is itself the reading.
 *
 * An empty section is left out rather than written empty, so a tape from a run
 * that stopped before its first checkpoint is not carrying a promise it did not
 * keep.
 */
export function encodeTape(tape: Tape): Uint8Array {
  const writer = createWriter();
  writeMagic(writer);
  writeU16(writer, FORMAT_VERSION);
  writeChunk(writer, CHUNK_HEADER, (payload) =>
    writeHeader(payload, tape.header),
  );
  writeBodyAndWitness(writer, tape);
  if (tape.observations.length > 0) {
    writeChunk(writer, CHUNK_OBSERVATIONS, (payload) => {
      for (const observation of tape.observations) {
        writeObservation(payload, observation);
      }
    });
  }
  if (tape.trailer !== null) {
    const trailer = tape.trailer;
    writeChunk(writer, CHUNK_TRAILER, (payload) =>
      writeTrailer(payload, trailer),
    );
  }
  return writtenBytes(writer);
}
