/**
 * Chunk-level encoding, pinned against the whole-tape encoder: what a store
 * appends during a run must be the same bytes encodeTape writes at the stop.
 */

import { describe, expect, it } from 'vitest';

import { decodeTape } from '../decode';
import { encodeTape } from '../encode';
import {
  bodySegment,
  headerSegment,
  observationsSegment,
  trailerSegment,
  witnessSegment,
} from '../segments';
import type { Observation, Tape, TapeCheckpoint, TapeHeader } from '../tape';
import { stopOf } from '../tape';
import { FORMAT_VERSION, TAPE_MAGIC } from '../wireCodes';

/** Every field a different value, so none can stand in for another. */
const HEADER: TapeHeader = {
  seed: 20260824,
  startingSize: 26.5,
  startingLevels: { soulStream: 2, headstones: 4, wisps: 1, bell: 0 },
  tickRate: 60,
  checkpointSpacing: 4,
  witnessVersion: 1,
  commitHash: 'aa038cb310',
  buildIdentity: '',
  author: 'unknown',
  inputDevice: 'keyboard',
  keyboardSpeed: 1.5,
  rendererBackend: 'webgl',
  rendererResolution: 2,
  devicePixelRatio: 2,
  recordedAt: 1_766_100_000_456,
};

function commands(from: number, until: number) {
  return Array.from({ length: until - from }, (_unused, at) => {
    const tick = from + at;
    return {
      move: { x: Math.fround(tick / 4), y: Math.fround(-tick / 8) },
      belch: tick % 2 === 0,
    };
  });
}

function checkpoint(index: number): TapeCheckpoint {
  return { index, witness: -2000 + index * 11 };
}

const OBSERVATIONS: Observation[] = [
  {
    kind: 'frame',
    reason: 'live',
    tickIndex: 0,
    ticksExecuted: 1,
    intervalMs: Math.fround(16.7),
    advanceMs: Math.fround(0.31),
    updateMs: Math.fround(1.02),
    debtTicks: 0,
  },
  {
    kind: 'frame',
    reason: 'paused',
    tickIndex: null,
    ticksExecuted: 0,
    intervalMs: Math.fround(16.6),
    advanceMs: 0,
    updateMs: Math.fround(0.05),
    debtTicks: 2,
  },
  {
    kind: 'fault',
    identity: 'reservoir in range',
    severity: 'recoverable',
    firstTick: 5,
    detail: 'reservoir is 21.00001',
    count: 4,
  },
];

const TRAILER = {
  ending: 'victory',
  stop: 'finished',
  integrity: 'clean',
  debtTicks: 2,
} as const;

const FULL: Tape = {
  header: HEADER,
  commands: commands(0, 10),
  checkpoints: [checkpoint(0), checkpoint(4), checkpoint(8)],
  observations: OBSERVATIONS,
  trailer: TRAILER,
};

/** The segments of FULL in the order a run produces them, the trailer last. */
function segmentsOfFull(): Uint8Array[] {
  return [
    headerSegment(FULL.header),
    witnessSegment([checkpoint(0)]),
    bodySegment(0, commands(0, 4)),
    witnessSegment([checkpoint(4)]),
    bodySegment(4, commands(4, 8)),
    witnessSegment([checkpoint(8)]),
    bodySegment(8, commands(8, 10)),
    observationsSegment(OBSERVATIONS),
    trailerSegment(TRAILER),
  ];
}

function concatenated(segments: readonly Uint8Array[]): Uint8Array {
  const total = segments.reduce((sum, segment) => sum + segment.length, 0);
  const bytes = new Uint8Array(total);
  let at = 0;
  for (const segment of segments) {
    bytes.set(segment, at);
    at += segment.length;
  }
  return bytes;
}

describe('the segment encoders', () => {
  it('concatenated in the order a run produces them, write byte for byte what encodeTape writes', () => {
    // Two sealed FORMAT_VERSION 1 tapes exist outside the tree, so the layout
    // is frozen: the whole-tape encoder is pinned by codec.test.ts, and this
    // equality is what makes the segments the same format rather than a second
    // one.
    expect(concatenated(segmentsOfFull())).toEqual(encodeTape(FULL));
  });

  it('open the stream with the magic and the format version, so a concatenation is itself a tape', () => {
    const bytes = headerSegment(FULL.header);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    expect(String.fromCharCode(...bytes.subarray(0, 4))).toBe(TAPE_MAGIC);
    expect(view.getUint16(TAPE_MAGIC.length, true)).toBe(FORMAT_VERSION);
  });

  it('fold witness and observations rows split across several segments back in order', () => {
    // decode.ts folds multiple witness and observations chunks in order, which
    // is exactly what lets a store append a run one boundary at a time.
    const split = concatenated([
      headerSegment(FULL.header),
      witnessSegment([checkpoint(0)]),
      bodySegment(0, commands(0, 4)),
      witnessSegment([checkpoint(4), checkpoint(8)]),
      bodySegment(4, commands(4, 10)),
      observationsSegment([OBSERVATIONS[0]]),
      observationsSegment([OBSERVATIONS[1], OBSERVATIONS[2]]),
      trailerSegment(TRAILER),
    ]);

    const { tape, truncated } = decodeTape(split);

    expect(truncated).toBe(false);
    expect(tape.header).toEqual(HEADER);
    expect(tape.commands).toEqual(FULL.commands);
    expect(tape.checkpoints).toEqual(FULL.checkpoints);
    expect(tape.observations).toEqual(OBSERVATIONS);
    expect(tape.trailer).toEqual(FULL.trailer);
  });

  it('decode a concatenation with no trailer segment as clean, not truncated, with a stop of unknown', () => {
    // The tab-closed reading: a run the store kept up to its last checkpoint
    // ends cleanly with no trailer, and truncated stays a different fact.
    const interrupted = concatenated([
      headerSegment(FULL.header),
      witnessSegment([checkpoint(0)]),
      bodySegment(0, commands(0, 4)),
      witnessSegment([checkpoint(4)]),
    ]);

    const { tape, truncated } = decodeTape(interrupted);

    expect(truncated).toBe(false);
    expect(tape.trailer).toBeNull();
    expect(stopOf(tape)).toBe('unknown');
    expect(tape.commands).toEqual(commands(0, 4));
    expect(tape.checkpoints).toEqual([checkpoint(0), checkpoint(4)]);
  });
});
