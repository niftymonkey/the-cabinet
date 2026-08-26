/**
 * The framing that makes a tape's sections separable at the byte level.
 *
 * A tape is a magic, a format version, and then a stream of chunks, each one a
 * kind and a byte length in front of its payload. Two properties follow, and
 * both are required rather than convenient. A reader can skip a chunk kind it
 * does not understand, which is what "separable sections" has to mean if it is
 * to mean anything. And nothing in the format needs a value known only at run
 * end: a section is written as as many chunks as the writer feels like, so a
 * store that appends during a run never has to go back and fill in a count.
 *
 * That is why a body chunk carries the tick it starts at and no tick count. The
 * count is the payload's own size, and a recording that stops mid-stream simply
 * ends after the last whole command it managed to write.
 */

import type { ByteWriter } from './bytes';
import {
  createWriter,
  writeBytes,
  writeU32,
  writeU8,
  writtenBytes,
} from './bytes';

const CHUNK_HEADER = 1;
const CHUNK_BODY = 2;
const CHUNK_WITNESS = 3;
const CHUNK_OBSERVATIONS = 4;
const CHUNK_TRAILER = 5;

// A chunk's kind byte and its 32-bit length, which every reader needs before its payload.
const CHUNK_FRAME_BYTES = 5;

/**
 * Writes one chunk, building its payload first so the length in front of it is
 * the payload's real size and never a promise about it.
 */
const writeChunk = (
  writer: ByteWriter,
  kind: number,
  fill: (payload: ByteWriter) => void,
): void => {
  const payload = createWriter();
  fill(payload);
  writeU8(writer, kind);
  writeU32(writer, payload.length);
  writeBytes(writer, writtenBytes(payload));
};

export {
  writeChunk,
  CHUNK_HEADER,
  CHUNK_BODY,
  CHUNK_WITNESS,
  CHUNK_OBSERVATIONS,
  CHUNK_TRAILER,
  CHUNK_FRAME_BYTES,
};
