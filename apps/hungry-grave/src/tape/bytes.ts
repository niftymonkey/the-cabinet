// The byte cursor a tape is written and read through.

/**
 * Byte order is stated by the format rather than left to the platform (ADR
 * 0018), so every multi-byte read and write below passes LITTLE_ENDIAN
 * explicitly and no call site is free to pick.
 */
const LITTLE_ENDIAN = true;

// Bytes a UTF-8 string's length prefix takes, so a caller can size a record.
const STRING_LENGTH_BYTES = 2;

// What a decoder throws when bytes are not a tape, rather than guessing.
class TapeFormatError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'TapeFormatError';
  }
}

interface ByteWriter {
  bytes: Uint8Array;
  view: DataView;
  // How much of the buffer is written, which is the tape's length so far.
  length: number;
}

const INITIAL_CAPACITY = 1024;

const createWriter = (capacity: number = INITIAL_CAPACITY): ByteWriter => {
  const room = Math.max(capacity, 1);
  if (room !== capacity) {
    console.warn(
      `a byte writer was asked for a capacity of ${capacity}; it is built with one byte and grows from there, and a capacity no byte fits in is this repo's own bug rather than a tape's`,
    );
  }
  const bytes = new Uint8Array(room);
  return { bytes, view: new DataView(bytes.buffer), length: 0 };
};

// Doubles until the next write fits, so a long run pays a handful of copies rather than one per tick.
const reserve = (writer: ByteWriter, extra: number): void => {
  const needed = writer.length + extra;
  if (needed <= writer.bytes.length) return;
  let capacity = writer.bytes.length;
  while (capacity < needed) capacity *= 2;
  const grown = new Uint8Array(capacity);
  grown.set(writer.bytes.subarray(0, writer.length));
  writer.bytes = grown;
  writer.view = new DataView(grown.buffer);
};

const writeU8 = (writer: ByteWriter, value: number): void => {
  reserve(writer, 1);
  writer.view.setUint8(writer.length, value);
  writer.length += 1;
};

const writeU16 = (writer: ByteWriter, value: number): void => {
  reserve(writer, 2);
  writer.view.setUint16(writer.length, value, LITTLE_ENDIAN);
  writer.length += 2;
};

const writeU32 = (writer: ByteWriter, value: number): void => {
  reserve(writer, 4);
  writer.view.setUint32(writer.length, value, LITTLE_ENDIAN);
  writer.length += 4;
};

const writeI32 = (writer: ByteWriter, value: number): void => {
  reserve(writer, 4);
  writer.view.setInt32(writer.length, value, LITTLE_ENDIAN);
  writer.length += 4;
};

const writeF32 = (writer: ByteWriter, value: number): void => {
  reserve(writer, 4);
  writer.view.setFloat32(writer.length, value, LITTLE_ENDIAN);
  writer.length += 4;
};

const writeF64 = (writer: ByteWriter, value: number): void => {
  reserve(writer, 8);
  writer.view.setFloat64(writer.length, value, LITTLE_ENDIAN);
  writer.length += 8;
};

const writeBytes = (writer: ByteWriter, source: Uint8Array): void => {
  reserve(writer, source.length);
  writer.bytes.set(source, writer.length);
  writer.length += source.length;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// A UTF-8 string behind a 16-bit length, so a reader can skip one it does not want.
const writeString = (writer: ByteWriter, value: string): void => {
  const encoded = encoder.encode(value);
  if (encoded.length > 0xffff) {
    throw new TapeFormatError(`string of ${encoded.length} bytes is too long`);
  }
  writeU16(writer, encoded.length);
  writeBytes(writer, encoded);
};

// Everything written so far, copied out so a later write cannot move it.
const writtenBytes = (writer: ByteWriter): Uint8Array => {
  return writer.bytes.slice(0, writer.length);
};

interface ByteReader {
  readonly bytes: Uint8Array;
  readonly view: DataView;
  offset: number;
}

const createReader = (bytes: Uint8Array): ByteReader => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { bytes, view, offset: 0 };
};

// Bytes left in front of the cursor. Every read checks this before it takes any.
const remaining = (reader: ByteReader): number => {
  return reader.bytes.byteLength - reader.offset;
};

/**
 * The cursor moved on by size bytes, bounds-checked before every read rather
 * than trusting a length that came off the wire. The instrument route feeds
 * arbitrary bytes from an arbitrary URL into the decoder, and a replay file
 * from a stranger is the classic vector, so a short buffer is refused here
 * instead of producing a quietly wrong number further up.
 */
const take = (reader: ByteReader, size: number, what: string): number => {
  if (remaining(reader) < size) {
    throw new TapeFormatError(
      `${what} needs ${size} bytes and ${remaining(reader)} are left`,
    );
  }
  const at = reader.offset;
  reader.offset += size;
  return at;
};

const readU8 = (reader: ByteReader): number => {
  return reader.view.getUint8(take(reader, 1, 'a u8'));
};

const readU16 = (reader: ByteReader): number => {
  return reader.view.getUint16(take(reader, 2, 'a u16'), LITTLE_ENDIAN);
};

const readU32 = (reader: ByteReader): number => {
  return reader.view.getUint32(take(reader, 4, 'a u32'), LITTLE_ENDIAN);
};

const readI32 = (reader: ByteReader): number => {
  return reader.view.getInt32(take(reader, 4, 'an i32'), LITTLE_ENDIAN);
};

const readF32 = (reader: ByteReader): number => {
  return reader.view.getFloat32(take(reader, 4, 'an f32'), LITTLE_ENDIAN);
};

const readF64 = (reader: ByteReader): number => {
  return reader.view.getFloat64(take(reader, 8, 'an f64'), LITTLE_ENDIAN);
};

const readString = (reader: ByteReader): string => {
  const size = readU16(reader);
  const at = take(reader, size, 'a string body');
  return decoder.decode(reader.bytes.subarray(at, at + size));
};

/**
 * Whether a length-prefixed string starting at the cursor is wholly present,
 * without moving the cursor and without allocating for the length it claims.
 *
 * A partly written record at the end of an interrupted recording has to be
 * distinguishable from a complete one, and reading it and checking afterwards
 * is not that: the read has already thrown by then.
 */
const stringFits = (reader: ByteReader, at: number): boolean => {
  if (reader.bytes.byteLength - at < STRING_LENGTH_BYTES) return false;
  const size = reader.view.getUint16(at, LITTLE_ENDIAN);
  return reader.bytes.byteLength - at - STRING_LENGTH_BYTES >= size;
};

// A reader over a window of another reader's bytes, for one framed section.
const sliceReader = (reader: ByteReader, size: number): ByteReader => {
  const at = take(reader, size, 'a section body');
  return createReader(reader.bytes.subarray(at, at + size));
};

export {
  TapeFormatError,
  createWriter,
  writeU8,
  writeU16,
  writeU32,
  writeI32,
  writeF32,
  writeF64,
  writeBytes,
  writeString,
  writtenBytes,
  createReader,
  remaining,
  readU8,
  readU16,
  readU32,
  readI32,
  readF32,
  readF64,
  readString,
  stringFits,
  sliceReader,
  LITTLE_ENDIAN,
  STRING_LENGTH_BYTES,
};
export type { ByteWriter, ByteReader };
