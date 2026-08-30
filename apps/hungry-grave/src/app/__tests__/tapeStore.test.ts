/**
 * The browser-side tape store: every run kept as it happens, canonical
 * FORMAT_VERSION 1 streams out, and a store fault never reaching the run.
 */

// The library's installer is the only way it hands out the whole global
// surface (IDBKeyRange included); each test then swaps in a fresh factory.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';

import { WEAPON_LINES } from '../../game/lines/roster';

import { decodeTape } from '../../tape/decode';
import {
  bodySegment,
  headerSegment,
  observationsSegment,
  trailerSegment,
  witnessSegment,
} from '../../tape/segments';
import type { TapeHeader, TapeTrailer } from '../../tape/tape';
import { stopOf } from '../../tape/tape';
import {
  STORE_KEPT_RECENT_TAPES,
  STORE_KEPT_SPARED_TAPES,
} from '../tapeRetention';
import { openTapeStore } from '../tapeStore';
import type { RunSummaryValues, TapeStore } from '../tapeStore';

const HEADER: TapeHeader = {
  seed: 77,
  startingSize: 24,
  recordedRoster: [...WEAPON_LINES],
  startingLevels: { soulStream: 0, territory: 0, wisps: 0, bell: 0 },
  tickRate: 60,
  checkpointSpacing: 4,
  witnessVersion: 1,
  commitHash: 'aa038cb310',
  buildIdentity: '',
  author: 'unknown',
  inputDevice: 'keyboard',
  keyboardSpeed: 1,
  rendererBackend: 'webgl',
  rendererResolution: 2,
  devicePixelRatio: 2,
  recordedAt: 1_766_200_000_000,
};

const TRAILER: TapeTrailer = {
  ending: 'sealed',
  stop: 'finished',
  integrity: 'clean',
  debtTicks: 0,
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

function birthSummary(over: Partial<RunSummaryValues> = {}): RunSummaryValues {
  return {
    seed: HEADER.seed,
    recordedAt: HEADER.recordedAt,
    inputDevice: HEADER.inputDevice,
    ending: null,
    stop: 'unknown',
    integrity: null,
    debtTicks: null,
    ...over,
  };
}

function sealedSummary(over: Partial<RunSummaryValues> = {}): RunSummaryValues {
  return birthSummary({
    ending: TRAILER.ending,
    stop: TRAILER.stop,
    integrity: TRAILER.integrity,
    debtTicks: TRAILER.debtTicks,
    ...over,
  });
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

/** A store against a fresh fake IndexedDB, so no test sees another's rows. */
async function freshStore(): Promise<TapeStore> {
  globalThis.indexedDB = new IDBFactory();
  const store = await openTapeStore();
  if (store === null) throw new Error('the fake IndexedDB failed to open');
  return store;
}

/** Appends one whole sealed, clean run: header, witness, trailer. */
async function appendSealedRun(
  store: TapeStore,
  runId: string,
  recordedAt: number,
): Promise<void> {
  await store.append(runId, {
    kind: 'header',
    bytes: headerSegment({ ...HEADER, recordedAt }),
    summary: birthSummary({ recordedAt }),
  });
  await store.append(runId, {
    kind: 'chunk',
    bytes: witnessSegment([{ index: 0, witness: -7 }]),
  });
  await store.append(runId, {
    kind: 'trailer',
    bytes: trailerSegment(TRAILER),
    summary: sealedSummary({ recordedAt }),
  });
}

/** Appends a run that never seals, which is the tab-closed unknown-stop row. */
async function appendUnknownRun(
  store: TapeStore,
  runId: string,
  recordedAt: number,
): Promise<void> {
  await store.append(runId, {
    kind: 'header',
    bytes: headerSegment({ ...HEADER, recordedAt }),
    summary: birthSummary({ recordedAt }),
  });
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

describe('the tape store', () => {
  it('loads a stored run back as the byte-identical canonical stream', async () => {
    const store = await freshStore();
    const segments = [
      headerSegment(HEADER),
      witnessSegment([{ index: 0, witness: -7 }]),
      bodySegment(0, commands(0, 4)),
      witnessSegment([{ index: 4, witness: -11 }]),
      bodySegment(4, commands(4, 8)),
      trailerSegment(TRAILER),
    ];

    await store.append('run-1', {
      kind: 'header',
      bytes: segments[0],
      summary: birthSummary(),
    });
    for (const bytes of segments.slice(1, 5)) {
      await store.append('run-1', { kind: 'chunk', bytes });
    }
    await store.append('run-1', {
      kind: 'trailer',
      bytes: segments[5],
      summary: sealedSummary(),
    });

    const loaded = await store.load('run-1');
    expect(loaded).toEqual(concatenated(segments));

    const { tape, truncated } = decodeTape(loaded ?? new Uint8Array());
    expect(truncated).toBe(false);
    expect(tape.commands).toEqual(commands(0, 8));
    expect(tape.trailer).toEqual(TRAILER);
  });

  it('loads an interrupted run with no trailer part as a clean trailerless stream', async () => {
    // The tab-closed case is the reading the instrument most needs: the
    // stream must decode as a stop of unknown, not as a truncated tape.
    const store = await freshStore();
    const segments = [
      headerSegment(HEADER),
      witnessSegment([{ index: 0, witness: -7 }]),
      bodySegment(0, commands(0, 4)),
      witnessSegment([{ index: 4, witness: -11 }]),
    ];

    await store.append('run-cut', {
      kind: 'header',
      bytes: segments[0],
      summary: birthSummary(),
    });
    for (const bytes of segments.slice(1)) {
      await store.append('run-cut', { kind: 'chunk', bytes });
    }

    const loaded = await store.load('run-cut');
    expect(loaded).toEqual(concatenated(segments));

    const { tape, truncated } = decodeTape(loaded ?? new Uint8Array());
    expect(truncated).toBe(false);
    expect(tape.trailer).toBeNull();
    expect(stopOf(tape)).toBe('unknown');
    expect(tape.commands).toEqual(commands(0, 4));
  });

  it('yields observation parts appended after the trailer before it, so the trailer stays last', async () => {
    // The frames a run spends on its own end state arrive after the seal by
    // design (recorder.ts), and the ruled canonical yield puts the trailer
    // last whatever order the parts arrived in.
    const store = await freshStore();
    const header = headerSegment(HEADER);
    const trailer = trailerSegment(TRAILER);
    const postSeal = observationsSegment([
      {
        kind: 'frame',
        reason: 'ending',
        tickIndex: null,
        ticksExecuted: 0,
        intervalMs: Math.fround(16.7),
        advanceMs: 0,
        updateMs: Math.fround(0.2),
        debtTicks: 0,
      },
    ]);

    await store.append('run-ended', {
      kind: 'header',
      bytes: header,
      summary: birthSummary(),
    });
    await store.append('run-ended', {
      kind: 'trailer',
      bytes: trailer,
      summary: sealedSummary(),
    });
    await store.append('run-ended', { kind: 'chunk', bytes: postSeal });

    const loaded = await store.load('run-ended');
    expect(loaded).toEqual(concatenated([header, postSeal, trailer]));

    const { tape } = decodeTape(loaded ?? new Uint8Array());
    expect(tape.trailer).toEqual(TRAILER);
    expect(tape.observations).toHaveLength(1);
  });

  it('reads the summary rows newest first, with the stop unknown until the seal', async () => {
    // The stop is a reading and never a written value: a row with no seal is
    // the tab-closed run, and it must say so rather than claim an outcome.
    // Ids deliberately sort against recency, so the order can only come
    // from the recordedAt sort and never from the key order getAll returns.
    const store = await freshStore();
    await appendSealedRun(store, 'run-a-old', 1000);
    await appendUnknownRun(store, 'run-c-live', 3000);
    await appendSealedRun(store, 'run-b-mid', 2000);

    const rows = await store.list();

    expect(rows.map((row) => row.id)).toEqual([
      'run-c-live',
      'run-b-mid',
      'run-a-old',
    ]);
    expect(rows[0].stop).toBe('unknown');
    expect(rows[0].integrity).toBeNull();
    expect(rows[1].stop).toBe('finished');
    expect(rows[1].integrity).toBe('clean');
    expect(rows[1].debtTicks).toBe(TRAILER.debtTicks);
    expect(rows[1].seed).toBe(HEADER.seed);
    expect(rows[1].inputDevice).toBe(HEADER.inputDevice);
  });

  it('keeps the newest tapes in the rolling queue and lets the oldest go', async () => {
    // Dashcam-style: the count is a named starting value in the store's
    // config, data to tune, never a rule compiled into a reader.
    const store = await freshStore();
    for (let at = 0; at <= STORE_KEPT_RECENT_TAPES; at++) {
      await appendSealedRun(store, `run-${at}`, 1000 + at);
    }

    const rows = await store.list();
    expect(rows).toHaveLength(STORE_KEPT_RECENT_TAPES);
    expect(rows.map((row) => row.id)).not.toContain('run-0');
    // The evicted run's segments go with its row.
    expect(await store.load('run-0')).toBeNull();
  });

  it('spares faulted and unknown-stop tapes from the rolling queue in their own smaller count', async () => {
    const store = await freshStore();
    // An old unknown-stop run, then a full rolling queue of newer sealed
    // runs: the old run is spared however far the rolling queue rolls.
    await appendUnknownRun(store, 'run-spared', 1);
    for (let at = 0; at <= STORE_KEPT_RECENT_TAPES; at++) {
      await appendSealedRun(store, `run-${at}`, 1000 + at);
    }
    const afterRolling = await store.list();
    expect(afterRolling.map((row) => row.id)).toContain('run-spared');

    // The spared bin has its own smaller count: one more unknown-stop run
    // than it holds, and the oldest spared run is the one that goes.
    for (let at = 0; at < STORE_KEPT_SPARED_TAPES; at++) {
      await appendUnknownRun(store, `run-unknown-${at}`, 2000 + at);
    }
    const rows = await store.list();
    const spared = rows.filter((row) => row.stop === 'unknown');
    expect(spared).toHaveLength(STORE_KEPT_SPARED_TAPES);
    expect(spared.map((row) => row.id)).not.toContain('run-spared');
    // The rolling queue is untouched by the spared bin filling up.
    expect(rows.filter((row) => row.stop === 'finished')).toHaveLength(
      STORE_KEPT_RECENT_TAPES,
    );
  });

  it("deletes a run's row and its segments together", async () => {
    const store = await freshStore();
    await appendSealedRun(store, 'run-kept', 1000);
    await appendSealedRun(store, 'run-gone', 2000);

    await store.delete('run-gone');

    expect((await store.list()).map((row) => row.id)).toEqual(['run-kept']);
    expect(await store.load('run-gone')).toBeNull();
    expect(await store.load('run-kept')).not.toBeNull();
  });

  it('is the designed unavailable state when it cannot open', async () => {
    // Private mode is the classic case: openTapeStore answers null, never an
    // error, and the end screen's file save needs no store.
    Reflect.deleteProperty(globalThis, 'indexedDB');

    expect(await openTapeStore()).toBeNull();
  });
});
