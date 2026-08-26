// A tape, as bytes: the chunk-level encoders in segments.ts, composed into the
// whole tape a run's stop writes.

import type { ByteWriter } from './bytes';
import { createWriter, writeBytes, writtenBytes } from './bytes';
import {
  bodySegment,
  headerSegment,
  observationsSegment,
  trailerSegment,
  witnessSegment,
} from './segments';
import type { Tape } from './tape';
import type { TickCommand } from '../game/command';

// The commands a body chunk holds, being everything up to the next checkpoint.
const commandsUntil = (
  tape: Tape,
  from: number,
  until: number,
): readonly TickCommand[] => {
  return tape.commands.slice(from, until);
};

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
const writeBodyAndWitness = (writer: ByteWriter, tape: Tape): void => {
  let written = 0;
  for (let index = 0; index < tape.checkpoints.length; index++) {
    const checkpoint = tape.checkpoints[index];
    writeBytes(writer, witnessSegment([checkpoint]));
    const until =
      index + 1 < tape.checkpoints.length
        ? Math.min(tape.checkpoints[index + 1].index, tape.commands.length)
        : tape.commands.length;
    if (until <= written) continue;
    writeBytes(
      writer,
      bodySegment(written, commandsUntil(tape, written, until)),
    );
    written = until;
  }
  if (written >= tape.commands.length) return;
  writeBytes(
    writer,
    bodySegment(written, commandsUntil(tape, written, tape.commands.length)),
  );
};

/**
 * The whole tape, in the order a reader meets it: the header first because it
 * is written before the first tick, and the trailer last because it is written
 * at the stop and a missing one is itself the reading.
 *
 * Bytes and never a JSON string, and the frame rows are what makes that decide
 * anything. A twelve-thousand-tick run is 110KiB of header, body, witness and
 * trailer, and then one 25-byte observation per rendered frame on top: 403KiB
 * at a 60Hz refresh and 696KiB at 120Hz, where the rows outweigh the body two
 * and two-thirds to five and a third times over. Base64 and UTF-16 multiply
 * whatever that is by eight thirds, so the encoding decides whether a full
 * stage's run is a file somebody can hold and send or a hosting problem.
 *
 * An empty section is left out rather than written empty, so a tape from a run
 * that stopped before its first checkpoint is not carrying a promise it did not
 * keep.
 */
const encodeTape = (tape: Tape): Uint8Array => {
  const writer = createWriter();
  writeBytes(writer, headerSegment(tape.header));
  writeBodyAndWitness(writer, tape);
  if (tape.observations.length > 0) {
    writeBytes(writer, observationsSegment(tape.observations));
  }
  if (tape.trailer !== null) {
    writeBytes(writer, trailerSegment(tape.trailer));
  }
  return writtenBytes(writer);
};

export { encodeTape };
