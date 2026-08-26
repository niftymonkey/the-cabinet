// Where every run's tape is kept in the browser as it happens (#58), so a
// closed tab still leaves the tape up to its last checkpoint.

import type { RunEnding } from '../game/run';
import type { TapeInputDevice, TapeIntegrity, TapeStop } from '../tape/tape';
import { evictedRuns, newestFirst } from './tapeRetention';

const TAPE_DB_NAME = 'hungry-grave-tapes';
const TAPE_DB_VERSION = 1;
const RUNS = 'runs';
const SEGMENTS = 'segments';

/**
 * The summary fields the recorder itself knows, written from its own header
 * and trailer rather than re-parsed out of the bytes. The seal fields are null
 * and "unknown" until the trailer part arrives, which is itself the reading:
 * a row that never seals is the tab-closed run.
 */
interface RunSummaryValues {
  readonly seed: number;
  readonly recordedAt: number;
  readonly inputDevice: TapeInputDevice;
  readonly ending: RunEnding | null;
  readonly stop: TapeStop;
  readonly integrity: TapeIntegrity | null;
  readonly debtTicks: number | null;
}

interface StoredRunSummary extends RunSummaryValues {
  readonly id: string;
}

/**
 * One append's worth of a run. The part that opens a run carries the header
 * segment's bytes and the summary row's birth; a trailer part carries the seal
 * and the sealed summary; everything else is chunk bytes.
 */
type TapePart =
  | {
      readonly kind: 'header';
      readonly bytes: Uint8Array;
      readonly summary: RunSummaryValues;
    }
  | { readonly kind: 'chunk'; readonly bytes: Uint8Array }
  | {
      readonly kind: 'trailer';
      readonly bytes: Uint8Array;
      readonly summary: RunSummaryValues;
    };

interface TapeStore {
  append(runId: string, part: TapePart): Promise<void>;
  list(): Promise<StoredRunSummary[]>;
  // The canonical stream: chunk parts in sequence order, trailer bytes last.
  load(runId: string): Promise<Uint8Array | null>;
  delete(runId: string): Promise<void>;
}

/**
 * One row of the append-only segments store. The bytes are stored as bytes,
 * never base64: structured clone carries a Uint8Array whole.
 */
interface SegmentRow {
  readonly runId: string;
  readonly sequence: number;
  readonly kind: 'chunk' | 'trailer';
  readonly bytes: Uint8Array;
}

const settled = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB request failed'));
  });

const completed = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction failed'));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
  });

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(TAPE_DB_NAME, TAPE_DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      database.createObjectStore(RUNS, { keyPath: 'id' });
      // Keyed run id plus sequence, so appending never reads what is there.
      database.createObjectStore(SEGMENTS, { keyPath: ['runId', 'sequence'] });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB open failed'));
    request.onblocked = () => reject(new Error('IndexedDB open blocked'));
  });

// Every segment row of one run, bounded so no other run's rows can match.
const wholeRun = (runId: string): IDBKeyRange =>
  IDBKeyRange.bound([runId, -Infinity], [runId, Infinity]);

const concatenated = (parts: readonly Uint8Array[]): Uint8Array => {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const bytes = new Uint8Array(total);
  let at = 0;
  for (const part of parts) {
    bytes.set(part, at);
    at += part.length;
  }
  return bytes;
};

const createStore = (database: IDBDatabase): TapeStore => {
  let unavailable = false;
  /**
   * Per-run append counters, held here rather than read back from the store:
   * the segments store is append-only and a read-modify-write would let two
   * in-flight appends claim one sequence. A run is only ever appended to by
   * the session that created it, so the counter's life matches the need.
   */
  const sequences = new Map<string, number>();

  /**
   * The one-way degradation. Logged once with what failed, because nothing
   * abnormal is silent; after the flip every verb is a quiet no-op, so the
   * recorder and the run never feel the store at all.
   */
  const failed = (what: string, error: unknown): void => {
    if (unavailable) return;
    unavailable = true;
    console.warn(
      `tape store ${what} failed; the store is unavailable for the rest of the session and writes are dropped`,
      error,
    );
  };

  const nextSequence = (runId: string): number => {
    const sequence = sequences.get(runId) ?? 0;
    sequences.set(runId, sequence + 1);
    return sequence;
  };

  const append = async (runId: string, part: TapePart): Promise<void> => {
    if (unavailable) return;
    try {
      const row: SegmentRow = {
        runId,
        sequence: nextSequence(runId),
        kind: part.kind === 'trailer' ? 'trailer' : 'chunk',
        bytes: part.bytes,
      };
      const stores = part.kind === 'chunk' ? [SEGMENTS] : [SEGMENTS, RUNS];
      const transaction = database.transaction(stores, 'readwrite');
      transaction.objectStore(SEGMENTS).add(row);
      if (part.kind !== 'chunk') {
        const summary: StoredRunSummary = { id: runId, ...part.summary };
        transaction.objectStore(RUNS).put(summary);
      }
      await completed(transaction);
      // A summary write is the only moment a run enters a bin or moves
      // between them, so it is the only moment the dashcam loop can roll.
      if (part.kind !== 'chunk') await evict();
    } catch (error) {
      failed('append', error);
    }
  };

  // The dashcam loop's one write: the policy decides, the store applies.
  const evict = async (): Promise<void> => {
    const transaction = database.transaction(RUNS, 'readonly');
    const rows = (await settled(
      transaction.objectStore(RUNS).getAll(),
    )) as StoredRunSummary[];
    for (const row of evictedRuns(rows)) await remove(row.id);
  };

  const list = async (): Promise<StoredRunSummary[]> => {
    if (unavailable) return [];
    try {
      const transaction = database.transaction(RUNS, 'readonly');
      const rows = (await settled(
        transaction.objectStore(RUNS).getAll(),
      )) as StoredRunSummary[];
      return newestFirst(rows);
    } catch (error) {
      failed('list', error);
      return [];
    }
  };

  const load = async (runId: string): Promise<Uint8Array | null> => {
    if (unavailable) return null;
    try {
      const transaction = database.transaction(SEGMENTS, 'readonly');
      // getAll over a keyPath range comes back in key order, which is the
      // append order the sequence numbers spell.
      const rows = (await settled(
        transaction.objectStore(SEGMENTS).getAll(wholeRun(runId)),
      )) as SegmentRow[];
      if (rows.length === 0) return null;
      // The ruled canonical yield: chunk parts in sequence order, the trailer
      // bytes last. Post-seal frame rows arrive as chunk parts after the
      // trailer part by design, so the reorder happens here, once, on the way
      // out.
      const chunks = rows.filter((row) => row.kind === 'chunk');
      const trailers = rows.filter((row) => row.kind === 'trailer');
      return concatenated([...chunks, ...trailers].map((row) => row.bytes));
    } catch (error) {
      failed('load', error);
      return null;
    }
  };

  const remove = async (runId: string): Promise<void> => {
    if (unavailable) return;
    try {
      const transaction = database.transaction([RUNS, SEGMENTS], 'readwrite');
      transaction.objectStore(RUNS).delete(runId);
      transaction.objectStore(SEGMENTS).delete(wholeRun(runId));
      await completed(transaction);
    } catch (error) {
      failed('delete', error);
    }
  };

  return { append, list, load, delete: remove };
};

/**
 * Null is the designed store-unavailable state, never an error a caller feels.
 *
 * The store is a convenience channel and never a dependency: every fault in it
 * flips it to the designed unavailable state and is swallowed after being
 * logged, the recorder and the run never feel it, and the end screen's file
 * save works with no store at all.
 */
const openTapeStore = async (): Promise<TapeStore | null> => {
  if (typeof indexedDB === 'undefined') {
    console.warn(
      "this browser offers no IndexedDB; tapes are kept for the run only and the end screen's file save still works",
    );
    return null;
  }
  try {
    return createStore(await openDatabase());
  } catch (error) {
    // Private mode and storage policy both land here; the designed answer is
    // the unavailable state, never an error the run can feel.
    console.warn(
      "the tape store failed to open; tapes are kept for the run only and the end screen's file save still works",
      error,
    );
    return null;
  }
};

export { openTapeStore };
export type { RunSummaryValues, StoredRunSummary, TapePart, TapeStore };
