/**
 * A batch's report folded again from the tapes on disk (#148 slice 1, the
 * design record's "Values are data": the step reads the before batch's tapes
 * through a reading that did not exist when they were played).
 *
 * The seam is the bytes, as it is for the batch command itself: what is asserted
 * is that folding the stored tapes gives the report the batch that wrote them
 * gave, so the tool is honest before any figure is taken off it.
 */

import { describe, expect, it } from 'vitest';

import { decodeTape } from '../../tape/decode';
import { encodeTape } from '../../tape/encode';
import { WITNESS_VERSION } from '../../game/witness';
import { batchReportOf } from '../batchReport';
import { CONFIGURATIONS, SHARP_HAND } from '../configurations';
import { playHarnessRun } from '../harnessRun';
import { measure } from '../measure';
import { rebatchOf } from '../rebatch';
import { RIGS } from '../rigs';
import { CANDIDATES } from '../tuningCandidates';

/** Two seeds the sharp hand finishes on well inside the budget, so a whole batch is affordable here. */
const SEEDS = [202, 203];

/** What the shell would hand the runner: git's answer and the clock's, once. */
const COMMIT_HASH = 'e6f6c0dd2f6a4b5c8d9e0f1a2b3c4d5e6f7a8b9c';
const RECORDED_AT = 1_757_000_000_000;

/**
 * Long because the batch is played once, measured once as the batch command
 * measures it, and then folded a second time from its own bytes. Stated on the
 * file in the shape harnessRun.test.ts already uses.
 */
const A_PLAYED_AND_REFOLDED_BATCH_MS = 180_000;

let batch: {
  readonly seeds: readonly number[];
  readonly tapes: Uint8Array[];
} | null = null;

/** The batch, played once and read by every test here. */
const playedBatch = () => {
  batch ??= {
    seeds: SEEDS,
    tapes: SEEDS.map(
      (seed) =>
        playHarnessRun(
          CONFIGURATIONS[SHARP_HAND],
          RIGS.birthright,
          CANDIDATES.default.record,
          seed,
          COMMIT_HASH,
          RECORDED_AT,
        ).bytes,
    ),
  };
  return batch;
};

describe('a batch report folded again from stored tapes', () => {
  it(
    'gives the same report the batch that wrote the tapes gave',
    () => {
      // The tool is an instrument and an instrument is checked before it is
      // believed: the batch command measures the bytes it wrote, so folding
      // those same bytes again has to land on the same report or the figures
      // it prints are a second definition wearing the first one's names.
      const played = playedBatch();
      const written = batchReportOf(
        {
          configuration: SHARP_HAND,
          firstSeed: SEEDS[0] ?? 0,
          seeds: played.seeds.length,
          recordedAt: RECORDED_AT,
        },
        played.seeds.map((seed, at) => ({
          seed,
          measurement: measure(
            decodeTape(played.tapes[at] ?? new Uint8Array()),
          ),
        })),
      );

      const folded = rebatchOf(
        played.seeds.map((seed, at) => ({
          name: `${seed}.tape`,
          bytes: played.tapes[at] ?? new Uint8Array(),
        })),
      );

      expect(folded.outcome).toBe('report');
      if (folded.outcome !== 'report') return;
      expect(folded.report).toEqual(written);
    },
    A_PLAYED_AND_REFOLDED_BATCH_MS,
  );

  it(
    'refuses a tape that does not verify, by the name of its file',
    () => {
      // ADR 0019: metrics come only from a verified replay. A report folded
      // over a run this build cannot reproduce would be a reading of nothing,
      // and a folder whose figures are silently short is worse than no folder.
      const played = playedBatch();
      const sound = decodeTape(played.tapes[0] ?? new Uint8Array()).tape;
      const bent = encodeTape({
        ...sound,
        header: { ...sound.header, witnessVersion: WITNESS_VERSION + 1 },
      });

      const folded = rebatchOf([{ name: '9001.tape', bytes: bent }]);

      expect(folded.outcome).toBe('refused');
      if (folded.outcome !== 'refused') return;
      expect(folded.why).toContain('9001.tape');
    },
    A_PLAYED_AND_REFOLDED_BATCH_MS,
  );

  it(
    'refuses a folder with a seed missing from its run, by the seed that is missing',
    () => {
      // A batch walks its seeds one by one from the first (ADR 0053), and the
      // report names them as a first seed and a count. A folder that lost a
      // tape would fold to a report naming a seed it never read, so the gap
      // is refused rather than papered over.
      const played = playedBatch();

      const folded = rebatchOf([
        { name: '202.tape', bytes: played.tapes[0] ?? new Uint8Array() },
        { name: '204.tape', bytes: played.tapes[1] ?? new Uint8Array() },
      ]);

      expect(folded.outcome).toBe('refused');
      if (folded.outcome !== 'refused') return;
      expect(folded.why).toContain('203');
    },
    A_PLAYED_AND_REFOLDED_BATCH_MS,
  );
});
