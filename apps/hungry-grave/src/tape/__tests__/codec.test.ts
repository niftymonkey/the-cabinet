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
import type { StartingConditions } from '../../game/run';
import { DEFAULT_TUNING } from '../../game/tuningRecord';

import { startingConditionBlock } from '../startingCondition';
import { TapeFormatError } from '../tapeFormatError';
import { CHUNK_FRAME_BYTES, CHUNK_TRAILER } from '../chunks';
import { decodeTape } from '../decode';
import { encodeTape } from '../encode';
import { COMMAND_BYTES } from '../segments';
import type { Observation, Tape, TapeCheckpoint, TapeHeader } from '../tape';
import { PERSON_POLICY, SCRIPT_POLICY, stopOf } from '../tape';
import { FORMAT_VERSION, INPUT_DEVICE_CODES, TAPE_MAGIC } from '../wireCodes';
import { STRING_LENGTH_BYTES } from '../bytes';
import { SIGNAL_FULL, SIGNAL_RAN_LIVE } from '../../game/signalLock';

/**
 * The whole starting condition a header carries, stated field by field rather
 * than defaulted, because the block is the resolved record (ADR 0063) and a
 * fixture that left a field out would be testing a condition nothing played.
 */
const CONDITIONS: StartingConditions = {
  startingSize: 24.5,
  startingLevels: { skullStream: 5, territory: 1, wisps: 0, bell: 3 },
  roster: [...WEAPON_LINES],
  signalLock: SIGNAL_RAN_LIVE,
  startingScore: 0,
  tuning: DEFAULT_TUNING,
};

/** Every field of the header's closed list, each a different value so none can stand in for another. */
const HEADER: TapeHeader = {
  seed: 20260823,
  startingCondition: startingConditionBlock(CONDITIONS),
  tickRate: 60,
  checkpointSpacing: 4,
  witnessVersion: 1,
  commitHash: 'f389eb55ff',
  buildIdentity: '',
  author: 'unknown',
  inputDevice: 'touch',
  policy: 'shaky-short',
  keyboardSpeed: 1.25,
  rendererBackend: 'webgpu',
  rendererResolution: 2,
  devicePixelRatio: 3,
  recordedAt: 1_766_000_000_123,
};

/** The same header with one row of its block written differently. */
function headerWithRow(name: string, value: number): TapeHeader {
  return {
    ...HEADER,
    startingCondition: HEADER.startingCondition.map((entry) =>
      entry.name === name ? { name, value } : entry,
    ),
  };
}

/** Where a needle's bytes start in a haystack, or -1. */
function indexOfBytes(haystack: Uint8Array, needle: Uint8Array): number {
  for (let at = 0; at + needle.length <= haystack.length; at++) {
    if (needle.every((byte, step) => haystack[at + step] === byte)) return at;
  }
  return -1;
}

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
    // rather than by any writer. Those tapes are two versions back and no
    // reader here will decode them again, and the byte stays pinned anyway,
    // because the code maps are append-only for as long as the format lives.
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
    // The input device code is the byte in front of the policy string's own
    // length prefix, so it is found off a name in the bytes rather than counted
    // to: the starting condition ahead of it is a block whose width is the
    // run's rather than the format's.
    const policyAt = indexOfBytes(
      bytes,
      new TextEncoder().encode(String(HEADER.policy)),
    );
    expect(policyAt).toBeGreaterThan(0);
    const at = policyAt - STRING_LENGTH_BYTES - 1;
    expect(bytes[at]).toBe(INPUT_DEVICE_CODES[HEADER.inputDevice]);

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
 * The header carries the whole starting condition its own values are written
 * in (ADR 0043, ADR 0063), so a reader never supplies it from its own
 * present-day world.
 */
describe('the self-describing header (#76, #142, ADR 0043)', () => {
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

  /** What the block says under one name, or undefined when it names none. */
  function rowOf(header: TapeHeader, name: string): number | undefined {
    return header.startingCondition.find((entry) => entry.name === name)?.value;
  }

  it('a format version 2 tape is refused with a format-version error, not decoded', () => {
    // The accepted cost of four self-describing steps, recorded here so none
    // is ever mistaken for an oversight. Version 1 wrote one level byte per
    // line positionally, so byte for byte a version-2 reader would return a
    // headstones level presented as a Territory level. Version 2 wrote no
    // policy, so a version-3 reader walking a version-2 header would read the
    // keyboard speed's first bytes as the policy's length and every field after
    // it would be somebody else's. Version 3 wrote no signal lock. Byte count
    // is not the test, and this is what "a reader refuses a version it does not
    // know rather than guessing at a layout" costs, paid once per bump
    // (ADR 0018, ADR 0043).
    expect(FORMAT_VERSION).toBe(5);
    expect(() => decodeTape(atVersion(2))).toThrow(TapeFormatError);
    expect(() => decodeTape(atVersion(2))).toThrow(/format version 2/);
    expect(() => decodeTape(atVersion(1))).toThrow(/format version 1/);
    expect(() => decodeTape(atVersion(3))).toThrow(/format version 3/);
  });

  it('a format 4 tape is refused outright at the decode, by its version', () => {
    // Version 4 wrote four positional starting-condition fields where version 5
    // writes one self-describing block, so a version-5 reader walking a
    // version-4 header would read the starting size's eight bytes as the
    // block's own count and a string length, and every field after it would be
    // somebody else's. What the reader owes instead is the refusal, naming both
    // numbers, before a single chunk is walked: a tape that diverged at a
    // checkpoint would have looked like a broken recording rather than an old
    // format.
    //
    // This is what FORMAT_VERSION 4 to 5 costs and it is stated here rather
    // than discovered: every tape recorded before that commit is refused, this
    // branch's own earlier tapes included.
    const refused = atVersion(4);

    expect(() => decodeTape(refused)).toThrow(TapeFormatError);
    expect(() => decodeTape(refused)).toThrow(/format version 4/);
    expect(() => decodeTape(refused)).toThrow(/version 5/);
  });

  it('a header round-trips its whole starting condition, every row', () => {
    // Test 1. The block is the whole condition and not a summary of it: the
    // size, one entry per fielded line in the order the run fielded them, the
    // lock, the score it began holding and every row of the tuning record.
    const { tape } = decodeTape(encodeTape(FULL));

    expect(tape.header.startingCondition).toEqual(HEADER.startingCondition);
    expect(rowOf(tape.header, 'startingSize')).toBe(24.5);
    expect(rowOf(tape.header, 'signalLock')).toBe(SIGNAL_RAN_LIVE);
    expect(rowOf(tape.header, 'startingScore')).toBe(0);
    expect(rowOf(tape.header, 'score.trashKillScore')).toBe(
      DEFAULT_TUNING.score.trashKillScore,
    );
    expect(rowOf(tape.header, 'stage.processionPurse')).toBe(
      DEFAULT_TUNING.stage.processionPurse,
    );
  });

  it('a header holds a lock the signal own scale could never stand at, rather than refusing it', () => {
    // The block is open by construction: which name is the lock is a question
    // about this build's vocabulary, so the decoder holds what the tape said
    // and resolveStartingCondition is the one step that asks whether this build
    // can run it (ADR 0043). The refusal did not go away, it moved, and
    // startingCondition.test.ts is where it is pinned now.
    for (const lock of [SIGNAL_FULL + 0.5, -2, Infinity]) {
      const bytes = encodeTape({
        ...FULL,
        header: headerWithRow('signalLock', lock),
      });
      expect(rowOf(decodeTape(bytes).tape.header, 'signalLock')).toBe(lock);
    }
  });

  it('a header round-trips the signal lock it was written against', () => {
    // Both halves of the lock, because the resolved value that means the signal
    // ran live has to survive the wire exactly as a held figure does: it is the
    // value the run started from and never an absence (ADR 0027).
    const live = decodeTape(encodeTape(FULL)).tape;
    expect(rowOf(live.header, 'signalLock')).toBe(SIGNAL_RAN_LIVE);

    const held = decodeTape(
      encodeTape({ ...FULL, header: headerWithRow('signalLock', 0.375) }),
    ).tape;
    expect(rowOf(held.header, 'signalLock')).toBe(0.375);
  });

  it('a header round-trips the roster it was written against, as the order of its level rows', () => {
    // The roster is the level entries and their order, and never a list of its
    // own: recording it twice would be two spellings that can disagree.
    const { tape } = decodeTape(encodeTape(FULL));
    const named = tape.header.startingCondition
      .filter((entry) => entry.name.startsWith('levels.'))
      .map((entry) => entry.name.slice('levels.'.length));

    expect(named).toEqual([...WEAPON_LINES]);
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
        startingCondition: [
          ...HEADER.startingCondition,
          { name: 'levels.moonlight', value: 4 },
        ],
      },
    });

    const { tape } = decodeTape(bytes);
    expect(rowOf(tape.header, 'levels.moonlight')).toBe(4);
    expect(rowOf(tape.header, 'levels.skullStream')).toBe(5);
  });

  it('a header carrying a three-line roster round-trips unchanged', () => {
    // A run fields a roster drawn from the pool (ADR 0046), so a header naming
    // three lines is an ordinary header. The wire carries it because the block
    // is written length-prefixed by name, and inventing a zero for the line it
    // never named would be the reader making something up, which ADR 0027
    // forbids.
    const smaller = HEADER.startingCondition.filter(
      (entry) => entry.name !== 'levels.bell',
    );
    const bytes = encodeTape({
      ...FULL,
      header: { ...HEADER, startingCondition: smaller },
    });

    const { tape } = decodeTape(bytes);
    expect(tape.header.startingCondition).toEqual(smaller);
    expect(rowOf(tape.header, 'levels.bell')).toBeUndefined();
  });

  it('carries a row name as a name string and never as a code, so an unknown one survives the wire', () => {
    // ADR 0043: the set of names is open, and a positional or ordinal encoding
    // over an open set is the exact mistake that ADR was written against. A row
    // no build in this tree compiles goes in and comes back out as itself, and
    // its own letters are in the bytes.
    const unknownToThisBuild = 'weather.fogDensity';
    const bytes = encodeTape({
      ...FULL,
      header: {
        ...HEADER,
        startingCondition: [
          ...HEADER.startingCondition,
          { name: unknownToThisBuild, value: 0.5 },
        ],
      },
    });

    expect(rowOf(decodeTape(bytes).tape.header, unknownToThisBuild)).toBe(0.5);
    expect(
      indexOfBytes(bytes, new TextEncoder().encode(unknownToThisBuild)),
    ).toBeGreaterThan(-1);
  });
});

/**
 * The header names which policy steered the run, so a hand's tape is never
 * mistaken for a person's (ADR 0053).
 */
describe('the policy the header names (ADR 0053, ADR 0043)', () => {
  it('names the policy that steered the run, beside the input device', () => {
    // ADR 0053: a bot run is never mistaken for a person's. The policy is its
    // own field and not a reading of the device, so neither stands in for the
    // other and moving one moves the bytes without moving the other.
    const steered = encodeTape({
      ...FULL,
      header: { ...HEADER, policy: 'steady-far' },
    });
    const { tape } = decodeTape(steered);

    expect(tape.header.policy).toBe('steady-far');
    expect(tape.header.inputDevice).toBe(HEADER.inputDevice);
    expect(steered).not.toEqual(encodeTape(FULL));
  });

  it('carries the policy as a name string and never as a code byte', () => {
    // ADR 0043: the set of policy names is open, and a positional or ordinal
    // encoding over an open set is the exact mistake that ADR was written
    // against. A name no build in this tree compiles goes in and comes back out
    // as itself, and its own letters are in the bytes.
    const unknownToThisBuild = 'a-hand-nobody-compiled';
    const bytes = encodeTape({
      ...FULL,
      header: { ...HEADER, policy: unknownToThisBuild },
    });

    expect(decodeTape(bytes).tape.header.policy).toBe(unknownToThisBuild);
    expect(
      indexOfBytes(bytes, new TextEncoder().encode(unknownToThisBuild)),
    ).toBeGreaterThan(-1);
  });

  it('reserves a resolved policy name for each run the game itself records, and never an absence', () => {
    // ADR 0027: a header value is the value the run actually started from, so
    // the empty string is not available to a person's run or to a scripted
    // wander. `unknown` is not available either, because the input device
    // already spends that word on a real unknown.
    expect(PERSON_POLICY).not.toBe('');
    expect(SCRIPT_POLICY).not.toBe('');
    expect(PERSON_POLICY).not.toBe(SCRIPT_POLICY);
    for (const reserved of [PERSON_POLICY, SCRIPT_POLICY]) {
      const bytes = encodeTape({
        ...FULL,
        header: { ...HEADER, policy: reserved },
      });
      expect(decodeTape(bytes).tape.header.policy).toBe(reserved);
    }
  });

  it('round-trips every field of a header whose policy name carries multibyte characters', () => {
    // The length prefix counts bytes and not characters, so a name outside
    // ASCII is what says whether the writer counted the right thing.
    const named: TapeHeader = { ...HEADER, policy: 'stadig-fjarran ☠' };

    const { tape } = decodeTape(encodeTape({ ...FULL, header: named }));
    expect(tape.header).toEqual(named);
  });
});
