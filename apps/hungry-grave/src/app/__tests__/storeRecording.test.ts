/**
 * The spool between the recorder and the tape store: what gets queued, at
 * which boundary, and in what order, against a hand-driven fake store.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { WEAPON_LINES } from '../../game/lines/roster';

import {
  CHUNK_BODY,
  CHUNK_OBSERVATIONS,
  CHUNK_WITNESS,
} from '../../tape/chunks';
import { decodeTape } from '../../tape/decode';
import type { TapeRecorder } from '../../tape/recorder';
import type { FrameObservation, TapeHeader } from '../../tape/tape';
import { TAPE_MAGIC } from '../../tape/wireCodes';
import { recordRunToStore } from '../storeRecording';
import type { TapePart, TapeStore } from '../tapeStore';

const SPACING = 4;

const HEADER: TapeHeader = {
  seed: 41,
  startingSize: 24,
  recordedRoster: [...WEAPON_LINES],
  startingLevels: { soulStream: 0, territory: 0, wisps: 0, bell: 0 },
  tickRate: 60,
  checkpointSpacing: SPACING,
  witnessVersion: 1,
  commitHash: 'aa038cb310',
  buildIdentity: '',
  author: 'unknown',
  inputDevice: 'touch',
  keyboardSpeed: 1,
  rendererBackend: 'webgl',
  rendererResolution: 2,
  devicePixelRatio: 2,
  recordedAt: 1_766_300_000_000,
};

interface AppendCall {
  readonly runId: string;
  readonly part: TapePart;
}

/** A store that only remembers, so a test reads exactly what was queued. */
function fakeStore(): { store: TapeStore; appends: AppendCall[] } {
  const appends: AppendCall[] = [];
  const store: TapeStore = {
    append: async (runId, part) => {
      appends.push({ runId, part });
    },
    list: async () => [],
    load: async () => null,
    delete: async () => {},
  };
  return { store, appends };
}

/** Lets the driver's queued microtasks drain before the test reads the store. */
function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

/** A recorder as recordInto leaves it before the first tick: checkpoint zero stamped. */
function startedRecorder(): TapeRecorder {
  return {
    header: HEADER,
    commands: [],
    checkpoints: [{ index: 0, witness: -1 }],
    observations: [],
    faultRows: new Map(),
    trailer: null,
  };
}

/** One executed tick, stamping a checkpoint where the spacing says. */
function tick(recorder: TapeRecorder): void {
  const at = recorder.commands.length;
  recorder.commands.push({
    move: { x: Math.fround(at / 4), y: Math.fround(-at / 8) },
    belch: at % 2 === 0,
  });
  const ran = recorder.commands.length;
  if (ran % SPACING === 0) {
    recorder.checkpoints.push({ index: ran, witness: -1 - ran });
  }
}

function frameRow(recorder: TapeRecorder, debtTicks: number): void {
  const row: FrameObservation = {
    kind: 'frame',
    reason: 'live',
    tickIndex: null,
    ticksExecuted: 0,
    intervalMs: Math.fround(16.7),
    advanceMs: Math.fround(0.2),
    updateMs: Math.fround(0.9),
    debtTicks,
  };
  recorder.observations.push(row);
}

/** What each queued part is, the chunk parts named by their chunk kind byte. */
function kindsOf(appends: readonly AppendCall[]): string[] {
  const names = new Map([
    [CHUNK_BODY, 'body'],
    [CHUNK_WITNESS, 'witness'],
    [CHUNK_OBSERVATIONS, 'observations'],
  ]);
  return appends.map(({ part }) => {
    if (part.kind !== 'chunk') return part.kind;
    return names.get(part.bytes[0]) ?? `chunk ${part.bytes[0]}`;
  });
}

/** The canonical stream the store's load would yield: chunks in order, trailer last. */
function streamOf(appends: readonly AppendCall[]): Uint8Array {
  const chunks = appends.filter(({ part }) => part.kind !== 'trailer');
  const trailers = appends.filter(({ part }) => part.kind === 'trailer');
  const parts = [...chunks, ...trailers].map(({ part }) => part.bytes);
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const bytes = new Uint8Array(total);
  let at = 0;
  for (const part of parts) {
    bytes.set(part, at);
    at += part.length;
  }
  return bytes;
}

describe('the store recording', () => {
  it('opens the run in the store with its header part and birth summary', async () => {
    // The summary is written from the recorder's own header, never
    // re-parsed out of the bytes, and the stop is unknown until the seal.
    const { store, appends } = fakeStore();
    const recorder = startedRecorder();

    recordRunToStore(Promise.resolve(store), recorder, 'run-1');
    await settle();

    expect(appends).toHaveLength(1);
    expect(appends[0].runId).toBe('run-1');
    const part = appends[0].part;
    expect(part.kind).toBe('header');
    expect(String.fromCharCode(...part.bytes.subarray(0, 4))).toBe(TAPE_MAGIC);
    if (part.kind !== 'header') return;
    expect(part.summary).toEqual({
      seed: HEADER.seed,
      recordedAt: HEADER.recordedAt,
      inputDevice: HEADER.inputDevice,
      ending: null,
      stop: 'unknown',
      integrity: null,
      debtTicks: null,
    });
  });

  it('makes up its own fresh run id when crypto.randomUUID does not exist', async () => {
    // A LAN-IP dev serve is not a secure context, so crypto.randomUUID is
    // absent there; the store is a convenience channel and never a dependency,
    // so the default id falls back instead of letting prepare() throw.
    const { store, appends } = fakeStore();
    vi.stubGlobal('crypto', {
      getRandomValues: crypto.getRandomValues.bind(crypto),
    });
    try {
      recordRunToStore(Promise.resolve(store), startedRecorder());
      recordRunToStore(Promise.resolve(store), startedRecorder());
      await settle();
    } finally {
      vi.unstubAllGlobals();
    }

    expect(kindsOf(appends)).toEqual(['header', 'header']);
    const [first, second] = appends.map(({ runId }) => runId);
    expect(first).not.toBe('');
    expect(second).not.toBe('');
    expect(first).not.toBe(second);
  });

  it('flushes the witness, the ticks behind it and the frame rows at each checkpoint boundary', async () => {
    const { store, appends } = fakeStore();
    const recorder = startedRecorder();
    const recording = recordRunToStore(
      Promise.resolve(store),
      recorder,
      'run-1',
    );

    // One frame that buys a whole checkpoint's worth of ticks.
    for (let at = 0; at < SPACING; at++) tick(recorder);
    frameRow(recorder, 0);
    recording.flush();
    await settle();

    // Header, then the same interleave encodeTape writes: witness zero, the
    // ticks behind it, the new witness, then the frame rows collected so far.
    expect(kindsOf(appends)).toEqual([
      'header',
      'witness',
      'body',
      'witness',
      'observations',
    ]);
    const { tape, truncated } = decodeTape(streamOf(appends));
    expect(truncated).toBe(false);
    expect(tape.commands).toEqual(recorder.commands);
    expect(tape.checkpoints).toEqual(recorder.checkpoints);
    expect(tape.observations).toHaveLength(1);
  });

  it('appends nothing between checkpoints', async () => {
    // The append cadence rides the checkpoint spacing: one knob for two
    // jobs, knowingly.
    const { store, appends } = fakeStore();
    const recorder = startedRecorder();
    const recording = recordRunToStore(
      Promise.resolve(store),
      recorder,
      'run-1',
    );
    for (let at = 0; at < SPACING; at++) tick(recorder);
    recording.flush();
    await settle();
    const flushed = appends.length;

    // Two more frames short of the next boundary.
    tick(recorder);
    frameRow(recorder, 0);
    recording.flush();
    tick(recorder);
    frameRow(recorder, 1);
    recording.flush();
    await settle();

    expect(appends.length).toBe(flushed);
  });

  it('seals by appending the trailing ticks, the observations and then the trailer part', async () => {
    const { store, appends } = fakeStore();
    const recorder = startedRecorder();
    const recording = recordRunToStore(
      Promise.resolve(store),
      recorder,
      'run-1',
    );
    for (let at = 0; at < SPACING; at++) tick(recorder);
    recording.flush();
    // Two ticks past the last checkpoint, then the stop.
    tick(recorder);
    tick(recorder);
    frameRow(recorder, 0);
    recorder.trailer = {
      ending: 'sealed',
      stop: 'finished',
      integrity: 'clean',
      debtTicks: 3,
    };
    recording.seal();
    await settle();

    expect(kindsOf(appends)).toEqual([
      'header',
      'witness',
      'body',
      'witness',
      'body',
      'observations',
      'trailer',
    ]);
    const last = appends[appends.length - 1].part;
    expect(last.kind).toBe('trailer');
    if (last.kind !== 'trailer') return;
    expect(last.summary.stop).toBe('finished');
    expect(last.summary.integrity).toBe('clean');
    expect(last.summary.debtTicks).toBe(3);
    const { tape } = decodeTape(streamOf(appends));
    expect(tape.commands).toEqual(recorder.commands);
    expect(tape.trailer).toEqual(recorder.trailer);
  });

  it('holds fault rows back to the seal so their counts are the final ones', async () => {
    // A fault row's count climbs in place on the recorder, and an appended
    // segment cannot be rewritten, so a row flushed mid-run would freeze a
    // stale tally into the stored tape.
    const { store, appends } = fakeStore();
    const recorder = startedRecorder();
    const recording = recordRunToStore(
      Promise.resolve(store),
      recorder,
      'run-1',
    );
    const fault = {
      kind: 'fault' as const,
      identity: 'reservoir in range' as const,
      severity: 'recoverable' as const,
      firstTick: 1,
      detail: 'reservoir is 21.00001',
      count: 1,
    };
    recorder.observations.push(fault);
    for (let at = 0; at < SPACING; at++) tick(recorder);
    recording.flush();
    await settle();
    const beforeSeal = decodeTape(streamOf(appends)).tape;
    expect(beforeSeal.observations).toEqual([]);

    fault.count = 9;
    recorder.trailer = {
      ending: null,
      stop: 'quit',
      integrity: 'faulted',
      debtTicks: 0,
    };
    recording.seal();
    await settle();

    const { tape } = decodeTape(streamOf(appends));
    expect(tape.observations).toEqual([{ ...fault, count: 9 }]);
  });

  it('flushes frame rows after the seal at detach, behind the trailer part', async () => {
    // The frames a run spends on its own end state are frames of that run
    // (recorder.ts), and the store's load puts the trailer last on the way
    // out, so appending them behind the trailer part is the designed order.
    const { store, appends } = fakeStore();
    const recorder = startedRecorder();
    const recording = recordRunToStore(
      Promise.resolve(store),
      recorder,
      'run-1',
    );
    recorder.trailer = {
      ending: 'sealed',
      stop: 'finished',
      integrity: 'clean',
      debtTicks: 0,
    };
    recording.seal();
    frameRow(recorder, 0);
    recording.flush();
    recording.detach();
    await settle();

    expect(kindsOf(appends)).toEqual([
      'header',
      'witness',
      'trailer',
      'observations',
    ]);
  });

  it('drops every write without throwing when there is no store', async () => {
    // Null is the designed unavailable state: the run and the recorder
    // never feel it, and the end screen's file save needs no store.
    const recorder = startedRecorder();
    const recording = recordRunToStore(
      Promise.resolve(null),
      recorder,
      'run-1',
    );
    for (let at = 0; at < SPACING; at++) tick(recorder);
    frameRow(recorder, 0);
    recording.flush();
    recorder.trailer = {
      ending: 'sealed',
      stop: 'finished',
      integrity: 'clean',
      debtTicks: 0,
    };
    recording.seal();
    recording.detach();
    await settle();
  });

  it('flushes what is pending at detach and does nothing on any later call', async () => {
    // reset() on a pooled screen must be idempotent and leak nothing: the
    // detach is the last write, and a detached spool is inert.
    const { store, appends } = fakeStore();
    const recorder = startedRecorder();
    const recording = recordRunToStore(
      Promise.resolve(store),
      recorder,
      'run-1',
    );
    for (let at = 0; at < SPACING; at++) tick(recorder);
    frameRow(recorder, 0);
    recording.detach();
    await settle();
    expect(kindsOf(appends)).toEqual([
      'header',
      'witness',
      'body',
      'witness',
      'observations',
    ]);
    const settledCount = appends.length;

    tick(recorder);
    recording.flush();
    recording.seal();
    recording.detach();
    await settle();

    expect(appends.length).toBe(settledCount);
  });

  it("sits after the frame's own row in the update path, outside the timed window", () => {
    // The instrument must not measure itself: the frame's updateMs window
    // closes when the screen builds the row, so the store flush has to sit
    // after the row goes in, and nowhere else in the recording. Guarded over
    // the source the way boundary.test.ts guards imports, because no headless
    // test can run the pooled screen itself.
    const source = readFileSync(
      join(import.meta.dirname, '..', 'screens', 'game', 'runRecording.ts'),
      'utf8',
    );
    const updateBody = source.slice(
      source.indexOf('const recordRow'),
      source.indexOf('const seal'),
    );
    const frameRowAt = updateBody.indexOf('recordFrame(');
    const flushAt = updateBody.indexOf('.flush()');

    expect(frameRowAt).toBeGreaterThan(-1);
    expect(flushAt).toBeGreaterThan(frameRowAt);
    // Exactly one flush call in the whole recording: the one in the update path.
    expect(source.split('.flush()')).toHaveLength(2);
  });
});
