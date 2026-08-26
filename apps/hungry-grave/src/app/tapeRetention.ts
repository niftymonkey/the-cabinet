// The dashcam retention policy: how many tapes the store keeps and which ones roll away.

import type { TapeIntegrity, TapeStop } from '../tape/tape';

/**
 * How many tapes the rolling queue keeps, newest first, and how many more the
 * spared bin holds for faulted and unknown-stop runs, dashcam-style. Both are
 * named starting values, data to tune and never a rule, on the same terms as
 * RECORDER_CHECKPOINT_SPACING.
 */
const STORE_KEPT_RECENT_TAPES = 20;
const STORE_KEPT_SPARED_TAPES = 5;

/**
 * What the policy needs to know about a stored run. It is declared here rather
 * than imported from the store so the policy decides with no IndexedDB behind
 * it and the store's row satisfies it by shape.
 */
interface RetainedRun {
  readonly id: string;
  readonly recordedAt: number;
  readonly stop: TapeStop;
  readonly integrity: TapeIntegrity | null;
}

const newestFirst = <Run extends { readonly recordedAt: number }>(
  rows: readonly Run[],
): Run[] => [...rows].sort((a, b) => b.recordedAt - a.recordedAt);

/**
 * Whether a row rides the spared bin instead of the rolling queue: a faulted
 * run is the evidence the instrument exists for, and an unknown-stop run is
 * both the tab-closed reading and every run still being recorded, so neither
 * may be rolled over by ordinary play.
 */
const spared = (row: RetainedRun): boolean =>
  row.stop === 'unknown' ||
  row.stop === 'faulted' ||
  row.integrity === 'faulted';

const beyond = (rows: readonly RetainedRun[], keep: number): RetainedRun[] =>
  newestFirst(rows).slice(keep);

/**
 * The dashcam loop: the rolling queue keeps its newest, and the spared bin
 * (faulted and unknown-stop runs) keeps its own newest under its own smaller
 * count, so ordinary play can never roll the evidence away.
 */
const evictedRuns = (rows: readonly RetainedRun[]): RetainedRun[] => [
  ...beyond(
    rows.filter((row) => !spared(row)),
    STORE_KEPT_RECENT_TAPES,
  ),
  ...beyond(rows.filter(spared), STORE_KEPT_SPARED_TAPES),
];

export {
  evictedRuns,
  newestFirst,
  STORE_KEPT_RECENT_TAPES,
  STORE_KEPT_SPARED_TAPES,
};
export type { RetainedRun };
