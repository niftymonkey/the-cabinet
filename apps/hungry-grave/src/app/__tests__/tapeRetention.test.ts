// The dashcam retention policy, decided away from the store that applies it.

import { describe, expect, it } from 'vitest';
import type { RetainedRun } from '../tapeRetention';
import {
  evictedRuns,
  STORE_KEPT_RECENT_TAPES,
  STORE_KEPT_SPARED_TAPES,
} from '../tapeRetention';

/** A sealed run of the rolling queue, born at `recordedAt`. */
const sealed = (id: string, recordedAt: number): RetainedRun => ({
  id,
  recordedAt,
  stop: 'finished',
  integrity: 'clean',
});

/** A run still being recorded, or one whose tab closed: the spared bin's own. */
const unknown = (id: string, recordedAt: number): RetainedRun => ({
  id,
  recordedAt,
  stop: 'unknown',
  integrity: null,
});

const idsOf = (rows: readonly RetainedRun[]): string[] =>
  rows.map((row) => row.id);

describe('the dashcam retention policy', () => {
  it('the retention policy decides with no IndexedDB', () => {
    // The whole reason the policy left the store: which tapes roll away is a
    // decision over rows, and applying it is what needs a database.
    expect(typeof globalThis.indexedDB).toBe('undefined');

    const overflowing = Array.from(
      { length: STORE_KEPT_RECENT_TAPES + 1 },
      (_unused, at) => sealed(`run-${at}`, 1000 + at),
    );

    expect(idsOf(evictedRuns(overflowing))).toEqual(['run-0']);
    expect(evictedRuns(overflowing.slice(1))).toEqual([]);
  });

  it('spares faulted and unknown-stop runs into their own smaller bin', () => {
    // Ordinary play must never roll the evidence away, so a full rolling queue
    // leaves an old unknown-stop run standing.
    const rolling = Array.from(
      { length: STORE_KEPT_RECENT_TAPES + 1 },
      (_unused, at) => sealed(`run-${at}`, 1000 + at),
    );
    const oldest = unknown('run-spared', 1);

    expect(idsOf(evictedRuns([oldest, ...rolling]))).toEqual(['run-0']);

    // The spared bin rolls on its own count, and a faulted seal rides it too.
    const bin = Array.from({ length: STORE_KEPT_SPARED_TAPES }, (_unused, at) =>
      unknown(`run-unknown-${at}`, 2000 + at),
    );
    const faulted: RetainedRun = {
      id: 'run-faulted',
      recordedAt: 3000,
      stop: 'finished',
      integrity: 'faulted',
    };

    expect(idsOf(evictedRuns([oldest, ...bin]))).toEqual(['run-spared']);
    expect(idsOf(evictedRuns([oldest, ...bin, faulted]))).toEqual([
      'run-unknown-0',
      'run-spared',
    ]);
  });
});
