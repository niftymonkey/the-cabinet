/**
 * A tape as bytes, and back.
 *
 * Authored from ADR 0018's format rules: bytes and never a JSON string, byte
 * order stated rather than inherited, sections separable so a reader can skip
 * one it does not understand, nothing that needs a value known only at run end,
 * and a decoder that refuses malformed bytes rather than trusting them while
 * still accepting a recording that stopped mid-stream.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WEAPON_LINES } from '../../game/lines/roster';

import { TapeFormatError } from '../tapeFormatError';
import { CHUNK_FRAME_BYTES, CHUNK_TRAILER } from '../chunks';
import { decodeTape } from '../decode';
import { encodeTape } from '../encode';
import { COMMAND_BYTES } from '../segments';
import type { Observation, Tape, TapeCheckpoint, TapeHeader } from '../tape';
import { stopOf } from '../tape';
import { FORMAT_VERSION, TAPE_MAGIC } from '../wireCodes';

/** Every field of the header's closed list, each a different value so none can stand in for another. */
const HEADER: TapeHeader = {
  seed: 20260823,
  startingSize: 24.5,
  recordedRoster: [...WEAPON_LINES],
  startingLevels: { soulStream: 5, territory: 1, wisps: 0, bell: 3 },
  tickRate: 60,
  checkpointSpacing: 4,
  witnessVersion: 1,
  commitHash: 'f389eb55ff',
  buildIdentity: '',
  author: 'unknown',
  inputDevice: 'touch',
  keyboardSpeed: 1.25,
  rendererBackend: 'webgpu',
  rendererResolution: 2,
  devicePixelRatio: 3,
  recordedAt: 1_766_000_000_123,
};

function commands(count: number) {
  return Array.from({ length: count }, (_unused, tick) => ({
    move: { x: Math.fround(tick / 8), y: Math.fround(-tick / 16) },
    belch: tick % 3 === 0,
  }));
}

function checkpoints(indices: readonly number[]): TapeCheckpoint[] {
  return indices.map((index) => ({ index, witness: -1000 + index * 7 }));
}

const OBSERVATIONS: Observation[] = [
  {
    kind: 'frame',
    reason: 'live',
    tickIndex: 0,
    ticksExecuted: 2,
    intervalMs: Math.fround(33.4),
    advanceMs: Math.fround(0.42),
    updateMs: Math.fround(1.75),
    debtTicks: 0,
  },
  {
    kind: 'frame',
    reason: 'backgrounded',
    tickIndex: null,
    ticksExecuted: 0,
    intervalMs: Math.fround(16.7),
    advanceMs: 0,
    updateMs: Math.fround(0.08),
    debtTicks: 4,
  },
  {
    kind: 'fault',
    identity: 'freshness in range',
    severity: 'recoverable',
    firstTick: 3,
    detail: 'corpse 7.freshness is 1.4',
    count: 9,
  },
];

const FULL: Tape = {
  header: HEADER,
  commands: commands(10),
  checkpoints: checkpoints([0, 4, 8]),
  observations: OBSERVATIONS,
  trailer: {
    ending: 'sealed',
    stop: 'finished',
    integrity: 'faulted',
    debtTicks: 12,
  },
};

describe("a tape's bytes", () => {
  it('are bytes and not a JSON string', () => {
    const bytes = encodeTape(FULL);

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(String.fromCharCode(...bytes.subarray(0, 4))).toBe(TAPE_MAGIC);
    // A JSON encoding would inflate a tape by roughly two and a half times once
    // base64 and UTF-16 are paid, which is what decides whether a full stage's
    // run is a file somebody can hold and send.
    expect(bytes.length).toBeLessThan(JSON.stringify(FULL).length);
  });

  it('round-trip the whole closed list of the header', () => {
    const { tape } = decodeTape(encodeTape(FULL));

    expect(tape.header).toEqual(HEADER);
  });

  it('round-trip the body, the witness, the observations and the trailer', () => {
    const { tape, truncated } = decodeTape(encodeTape(FULL));

    expect(tape.commands).toEqual(FULL.commands);
    expect(tape.checkpoints).toEqual(FULL.checkpoints);
    expect(tape.observations).toEqual(FULL.observations);
    expect(tape.trailer).toEqual(FULL.trailer);
    expect(truncated).toBe(false);
  });

  it('carry the checkpoint spacing so a reader obeys the tape and not a constant', () => {
    // ADR 0019: a later measurement can move the spacing without versioning the
    // format and without invalidating a tape already recorded.
    const { tape } = decodeTape(encodeTape(FULL));

    expect(tape.header.checkpointSpacing).toBe(4);
  });

  it("state their byte order rather than inheriting the platform's", () => {
    // The seed is the first multi-byte field of the header chunk, so its bytes
    // are the format's own statement about order. Read the other way it would
    // be a different seed and every tape would replay as a different run.
    const bytes = encodeTape(FULL);
    const headerAt = TAPE_MAGIC.length + 2 + CHUNK_FRAME_BYTES;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    expect(view.getUint32(headerAt, true)).toBe(HEADER.seed);
    expect(view.getUint32(headerAt, false)).not.toBe(HEADER.seed);
  });

  it('carry an unchecked integrity as the literal byte 3, frozen for as long as the format lives', () => {
    // Sealed FORMAT_VERSION 1 tapes outside this tree were recorded with the
    // checks switched off, and their trailer's integrity byte is 3. Nothing
    // writes unchecked any more, so this byte and its meaning are pinned here
    // rather than by any writer.
    const bytes = encodeTape({
      ...FULL,
      trailer: {
        ending: 'sealed',
        stop: 'finished',
        integrity: 'unchecked',
        debtTicks: 12,
      },
    });
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let at = TAPE_MAGIC.length + 2;
    while (view.getUint8(at) !== CHUNK_TRAILER) {
      at += CHUNK_FRAME_BYTES + view.getUint32(at + 1, true);
    }

    // The trailer's payload is the ending, the stop, then the integrity, one
    // byte each.
    expect(view.getUint8(at + CHUNK_FRAME_BYTES + 2)).toBe(3);
    expect(decodeTape(bytes).tape.trailer?.integrity).toBe('unchecked');
  });
});

describe("a tape's sections", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  /** A tape with a three-byte chunk of an unknown kind wedged in after the magic. */
  function withUnknownChunk(): Uint8Array {
    const bytes = encodeTape(FULL);
    const unknown = new Uint8Array(bytes.length + CHUNK_FRAME_BYTES + 3);
    const head = TAPE_MAGIC.length + 2;
    unknown.set(bytes.subarray(0, head), 0);
    unknown[head] = 99;
    new DataView(unknown.buffer).setUint32(head + 1, 3, true);
    unknown.set([1, 2, 3], head + CHUNK_FRAME_BYTES);
    unknown.set(bytes.subarray(head), head + CHUNK_FRAME_BYTES + 3);
    return unknown;
  }

  /** The bytes of a tape cut off two bytes into its trailer. */
  function cutInsideTheTrailer(): Uint8Array {
    const bytes = encodeTape(FULL);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let at = TAPE_MAGIC.length + 2;
    while (view.getUint8(at) !== CHUNK_TRAILER) {
      at += CHUNK_FRAME_BYTES + view.getUint32(at + 1, true);
    }
    return bytes.slice(0, at + CHUNK_FRAME_BYTES + 2);
  }

  it('a chunk kind this reader does not know is not silent', async () => {
    // A fresh module per test: the skip reports once per session, because a
    // tape from a later recorder carries the same unknown kind in every segment.
    const { decodeTape: decodeFresh } = await import('../decode');

    expect(decodeFresh(withUnknownChunk()).tape.header).toEqual(HEADER);

    const said = vi
      .mocked(console.warn)
      .mock.calls.map((call) => call.join(' '));
    expect(said).toHaveLength(1);
    // What happened, and what it costs.
    expect(said[0]).toContain('99');
    expect(said[0]).toContain('skipped');
  });

  it('a trailer cut short is not silent', async () => {
    const { decodeTape: decodeFresh } = await import('../decode');

    const { tape, truncated } = decodeFresh(cutInsideTheTrailer());
    expect(tape.trailer).toBeNull();
    expect(truncated).toBe(true);

    const said = vi
      .mocked(console.warn)
      .mock.calls.map((call) => call.join(' '));
    expect(said).toHaveLength(1);
    // What happened, and what it costs.
    expect(said[0]).toContain('trailer');
    expect(said[0]).toContain('ending');
  });

  it('a whole tape this reader knows every kind of says nothing', async () => {
    const { decodeTape: decodeFresh } = await import('../decode');

    decodeFresh(encodeTape(FULL));

    expect(console.warn).not.toHaveBeenCalled();
  });

  it('are separable, so a reader skips a chunk kind it does not understand', () => {
    // ADR 0018: saying there are three sections is not the same as making them
    // separable. The length in front of each one is what does that, and a tape
    // written by a later recorder still reads here, minus what it added.
    const { tape } = decodeTape(withUnknownChunk());

    expect(tape.header).toEqual(HEADER);
    expect(tape.commands).toEqual(FULL.commands);
  });

  it('can be written as several chunks each, so nothing waits for a value known at run end', () => {
    // The encoder writes the witness and the body interleaved, a checkpoint
    // then the ticks behind it, which is the order a run produces them. That is
    // the property that lets a store append during a run rather than going back
    // to fill in a count.
    const bytes = encodeTape(FULL);
    const kinds: number[] = [];
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let at = TAPE_MAGIC.length + 2;
    while (at < bytes.length) {
      kinds.push(view.getUint8(at));
      at += CHUNK_FRAME_BYTES + view.getUint32(at + 1, true);
    }

    // Header, then witness and body alternating, then observations, then trailer.
    expect(kinds).toEqual([1, 3, 2, 3, 2, 3, 2, 4, 5]);
  });
});

describe('a tape that stopped mid-stream', () => {
  /** The bytes of a tape whose recording was cut off after its second checkpoint. */
  function cutAfterSecondCheckpoint(): Uint8Array {
    const bytes = encodeTape(FULL);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let at = TAPE_MAGIC.length + 2;
    // Header, witness 0, body 0-3, witness 4, then part of the ticks behind it.
    for (let chunk = 0; chunk < 4; chunk++) {
      at += CHUNK_FRAME_BYTES + view.getUint32(at + 1, true);
    }
    // The chunk's frame, its first-tick field and one whole command of the
    // several the writer was part way through.
    return bytes.slice(0, at + CHUNK_FRAME_BYTES + 4 + COMMAND_BYTES);
  }

  it('decodes, and says it was cut off', () => {
    // ADR 0026: one of the two shapes "too easy" takes is not dying but losing
    // interest and closing the tab, so a format that only yielded tapes for
    // finished runs would be blind to the failure it was built to find.
    const { tape, truncated } = decodeTape(cutAfterSecondCheckpoint());

    expect(truncated).toBe(true);
    expect(tape.header).toEqual(HEADER);
  });

  it('keeps every whole record it managed to write, and no half of one', () => {
    const { tape } = decodeTape(cutAfterSecondCheckpoint());

    expect(tape.checkpoints).toEqual(checkpoints([0, 4]));
    expect(tape.commands).toEqual(FULL.commands.slice(0, 5));
  });

  it('has no trailer, so it reads as a stop of unknown', () => {
    const { tape } = decodeTape(cutAfterSecondCheckpoint());

    expect(tape.trailer).toBeNull();
    expect(stopOf(tape)).toBe('unknown');
  });
});

describe('a tape cut at any byte at all', () => {
  /** A run long enough that every chunk kind appears several times over. */
  const SWEPT: Tape = {
    header: HEADER,
    commands: commands(70),
    checkpoints: checkpoints([0, 10, 20, 30, 40, 50, 60]),
    observations: OBSERVATIONS,
    trailer: {
      ending: 'sealed',
      stop: 'finished',
      integrity: 'clean',
      debtTicks: 3,
    },
  };

  /**
   * The first byte past the header chunk, which is where a cut stops being a
   * refusal.
   *
   * A tape whose header did not finish being written has no identity, no seed
   * and no starting size, so it is refused rather than yielded; every cut from
   * here on is a recording that stopped, and a recording that stopped is a
   * tape.
   */
  function afterHeader(bytes: Uint8Array): number {
    const head = TAPE_MAGIC.length + 2;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return head + CHUNK_FRAME_BYTES + view.getUint32(head + 1, true);
  }

  /** What one truncation length did, as a line a failure can name, or null when it behaved. */
  function cutOutcome(bytes: Uint8Array, length: number): string | null {
    let decoded;
    try {
      decoded = decodeTape(bytes.slice(0, length));
    } catch (error) {
      return `${length} bytes: refused with "${(error as Error).message}"`;
    }
    const kept = decoded.tape.commands;
    if (
      JSON.stringify(kept) !==
      JSON.stringify(SWEPT.commands.slice(0, kept.length))
    ) {
      return `${length} bytes: ${kept.length} commands that are not a prefix of the run`;
    }
    return null;
  }

  it('decodes to its last complete record, wherever the cut lands', () => {
    // A closed tab cuts wherever it cuts, so the property is swept rather than
    // sampled. The regression it pins: the body read its four-byte first-tick
    // field before checking four bytes were there, so a cut landing inside
    // those four refused the whole tape instead of yielding the ticks already
    // written.
    const bytes = encodeTape(SWEPT);
    const misbehaved: string[] = [];
    for (let length = afterHeader(bytes); length <= bytes.length; length++) {
      const outcome = cutOutcome(bytes, length);
      if (outcome !== null) misbehaved.push(outcome);
    }

    expect(misbehaved).toEqual([]);
  });

  it('still refuses a complete body chunk carrying a stray byte or three', () => {
    // The fix above is about bytes that are absent, and this is the case that
    // proves it did not become a licence to ignore bytes that are present.
    const bytes = encodeTape({ ...SWEPT, observations: [], trailer: null });
    const head = TAPE_MAGIC.length + 2;
    const view = new DataView(bytes.buffer);
    const witnessAt = head + CHUNK_FRAME_BYTES + view.getUint32(head + 1, true);
    const bodyAt =
      witnessAt + CHUNK_FRAME_BYTES + view.getUint32(witnessAt + 1, true);
    // A body chunk holding its first-tick field and one stray byte.
    view.setUint32(bodyAt + 1, 5, true);

    expect(() => decodeTape(bytes)).toThrow(/not a whole record/);
  });
});

describe('a tape a reader should refuse', () => {
  it('refuses bytes that do not open as a tape', () => {
    expect(() => decodeTape(new Uint8Array([1, 2, 3, 4, 5, 6]))).toThrow(
      TapeFormatError,
    );
  });

  it('refuses a format version it does not know, rather than guessing a layout', () => {
    const bytes = encodeTape(FULL);
    new DataView(bytes.buffer).setUint16(
      TAPE_MAGIC.length,
      FORMAT_VERSION + 1,
      true,
    );

    expect(() => decodeTape(bytes)).toThrow(/format version/);
  });

  it('refuses a section length longer than the buffer rather than allocating for it', () => {
    // The instrument route feeds arbitrary bytes from an arbitrary
    // URL into this, and a replay file from a stranger is the classic vector.
    // The length is checked against the bytes in hand before one is read, so a
    // claim of four gigabytes costs nothing and yields the tape up to that
    // point rather than a reader that misbehaves.
    const bytes = encodeTape(FULL);
    const head = TAPE_MAGIC.length + 2;
    const headerLength = new DataView(bytes.buffer).getUint32(head + 1, true);
    const at = head + CHUNK_FRAME_BYTES + headerLength;
    new DataView(bytes.buffer).setUint32(at + 1, 0xffffffff, true);

    // Nothing is sized from the claimed length, so the four gigabytes cost
    // nothing, and the bytes that are there are refused as checkpoints rather
    // than believed because they happened to fit.
    expect(() => decodeTape(bytes)).toThrow(TapeFormatError);
  });

  it('refuses a complete chunk carrying bytes that are not a whole record', () => {
    const bytes = encodeTape({ ...FULL, observations: [], trailer: null });
    const head = TAPE_MAGIC.length + 2;
    const view = new DataView(bytes.buffer);
    const headerLength = view.getUint32(head + 1, true);
    const witnessAt = head + CHUNK_FRAME_BYTES + headerLength;
    const bodyAt =
      witnessAt + CHUNK_FRAME_BYTES + view.getUint32(witnessAt + 1, true);
    // One byte short of a whole command, with the bytes still present.
    view.setUint32(bodyAt + 1, view.getUint32(bodyAt + 1, true) - 1, true);

    expect(() => decodeTape(bytes)).toThrow(/not a whole record/);
  });

  it('refuses a body whose ticks do not carry on from the ticks before them', () => {
    const bytes = encodeTape(FULL);
    const head = TAPE_MAGIC.length + 2;
    const view = new DataView(bytes.buffer);
    const headerLength = view.getUint32(head + 1, true);
    const witnessAt = head + CHUNK_FRAME_BYTES + headerLength;
    const bodyAt =
      witnessAt + CHUNK_FRAME_BYTES + view.getUint32(witnessAt + 1, true);
    view.setUint32(bodyAt + CHUNK_FRAME_BYTES, 7, true);

    expect(() => decodeTape(bytes)).toThrow(/body chunk starts at tick 7/);
  });

  it('refuses a code no reader of this format knows', () => {
    const bytes = encodeTape(FULL);
    const head = TAPE_MAGIC.length + 2;
    // The input device code sits after the seed, size, rates, version and the
    // three strings, so it is found rather than counted to.
    const at = bytes.indexOf(0x02, head + 30);
    expect(at).toBeGreaterThan(0);

    expect(() =>
      decodeTape(
        Uint8Array.from(bytes, (byte, index) => (index === at ? 0x7f : byte)),
      ),
    ).toThrow(TapeFormatError);
  });

  it('refuses a tape with no header at all', () => {
    const head = TAPE_MAGIC.length + 2;

    expect(() => decodeTape(encodeTape(FULL).slice(0, head))).toThrow(
      /no header/,
    );
  });
});

/**
 * The header carries the vocabulary its own level bytes are written in
 * (ADR 0043), so a reader never supplies it from its own present-day world.
 */
describe('the self-describing header (#76, ADR 0043)', () => {
  /** The same bytes, with the format version byte rewritten to another version. */
  function atVersion(version: number): Uint8Array {
    const bytes = encodeTape(FULL);
    new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).setUint16(
      TAPE_MAGIC.length,
      version,
      true,
    );
    return bytes;
  }

  it('a format version 1 tape is refused with a format-version error, not decoded', () => {
    // The accepted cost of making the roster self-describing, recorded here so
    // it is never mistaken for an oversight: version 1 wrote one level byte per
    // line positionally, so byte for byte a version-2 reader would return a
    // headstones level presented as a Territory level. Byte count is not the
    // test, and this is what "a reader refuses a version it does not know
    // rather than guessing at a layout" costs, paid once.
    expect(FORMAT_VERSION).toBe(2);
    expect(() => decodeTape(atVersion(1))).toThrow(TapeFormatError);
    expect(() => decodeTape(atVersion(1))).toThrow(/format version 1/);
  });

  it('a header round-trips the roster it was written against', () => {
    const { tape } = decodeTape(encodeTape(FULL));

    expect(tape.header.recordedRoster).toEqual([...WEAPON_LINES]);
  });

  it('a header naming a line this build does not implement is reported as recorded', () => {
    // Reading and replaying are two different obligations. The tape said
    // something true, and the reader's job is not to edit it: the name comes
    // back as written, with its level, and nothing is coerced into the roster
    // this build happens to have.
    const bytes = encodeTape({
      ...FULL,
      header: {
        ...HEADER,
        recordedRoster: [...WEAPON_LINES, 'moonlight'],
        startingLevels: { ...HEADER.startingLevels, moonlight: 4 },
      },
    });

    const { tape } = decodeTape(bytes);
    expect(tape.header.recordedRoster).toContain('moonlight');
    expect(tape.header.startingLevels.moonlight).toBe(4);
    expect(tape.header.startingLevels).toEqual({
      ...HEADER.startingLevels,
      moonlight: 4,
    });
  });

  it('a header short of a line this build has is reported as recorded too', () => {
    // The other direction, and it is not symmetric with the one above by
    // accident: a tape written before a line existed says nothing about that
    // line, and inventing a zero for it would be the reader making something
    // up. ADR 0027 forbids an absence in a header, so the honest answer is that
    // the recorded roster is short and this build cannot run it.
    const older = [...WEAPON_LINES].filter((line) => line !== 'bell');
    const levels = { ...HEADER.startingLevels };
    delete levels.bell;
    const bytes = encodeTape({
      ...FULL,
      header: { ...HEADER, recordedRoster: older, startingLevels: levels },
    });

    const { tape } = decodeTape(bytes);
    expect(tape.header.recordedRoster).toEqual(older);
    expect('bell' in tape.header.startingLevels).toBe(false);
  });
});
