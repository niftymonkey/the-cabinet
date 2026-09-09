/**
 * The batch command line: the thin shell over the harness runner, run as a
 * person runs it, so the written folder, stdout, stderr and the exit code are
 * the seam.
 *
 * What the command does is play a seed range, leave one tape per seed on disk,
 * and write the batch's own report beside them off those same bytes.
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { BATCH_SEEDS } from '../../src/dev/batchReport';
import type { BatchReport } from '../../src/dev/batchReport';
import { SHARP_HAND } from '../../src/dev/configurations';
import { SEED_LIMIT } from '../../src/game/run';
import { decodeTape } from '../../src/tape/decode';

const APP = resolve(import.meta.dirname, '..', '..');
const VITE_NODE = join(APP, 'node_modules', '.bin', 'vite-node');

/** A seed the sharp hand finishes on well inside its budget, so the batch is cheap. */
const FIRST_SEED = 202;

/** An empty directory of its own, so what the command wrote is all that is there. */
const emptyRoot = (): string =>
  mkdtempSync(join(tmpdir(), 'hungry-grave-batch-'));

const runBatch = (...args: string[]) => {
  return spawnSync(
    VITE_NODE,
    ['--config', 'vite.headless.config.ts', 'scripts/batch.ts', ...args],
    { cwd: APP, encoding: 'utf8' },
  );
};

/**
 * Long because the subprocess is the seam and the work behind it is real play.
 * Every case pays a cold vite boot, and the case that writes tapes plays two
 * whole runs through the one execution authority.
 */
const SUBPROCESS_BUDGET_MS = 20_000;
const PLAYED_BATCH_BUDGET_MS = 180_000;

describe('the batch command', () => {
  it(
    'explains its usage',
    () => {
      const result = runBatch();

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain(
        'usage: pnpm vite-node --config vite.headless.config.ts scripts/batch.ts',
      );
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses a configuration nobody named, out loud, and plays nothing',
    () => {
      // Test 70. Parse at the edge: an argument becomes a configuration name
      // here or is refused here, so nothing inside the harness ever holds a
      // name it has not checked.
      const root = emptyRoot();
      const result = runBatch('steady-ish', String(FIRST_SEED), '1', root);

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('steady-ish');
      expect(result.stderr).toContain('no batch was played');
      expect(result.stderr).not.toMatch(/^\s+at /m);
      expect(readdirSync(root)).toEqual([]);
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses a seed outside the range a run can be pinned to, out loud, and plays nothing',
    () => {
      // Test 70. The last seed of the walk is checked as well as the first: a
      // count that walked off the end would pin runs to seeds no run can hold.
      const root = emptyRoot();
      const result = runBatch(SHARP_HAND, String(SEED_LIMIT), '1', root);

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain(String(SEED_LIMIT));
      expect(result.stderr).toContain('no batch was played');
      expect(result.stderr).not.toMatch(/^\s+at /m);
      expect(readdirSync(root)).toEqual([]);

      // The walk's far end, which a first seed inside the range hides.
      const walked = runBatch(SHARP_HAND, String(SEED_LIMIT - 1), '2', root);
      expect(walked.status).toBe(1);
      expect(walked.stdout).toBe('');
      expect(walked.stderr).toContain(String(SEED_LIMIT - 1));
      expect(walked.stderr).toContain('no batch was played');
      expect(readdirSync(root)).toEqual([]);
    },
    SUBPROCESS_BUDGET_MS * 2,
  );

  it(
    'refuses a count below one run, out loud, and plays nothing',
    () => {
      // Test 70. A batch of no runs is a batch nobody can read, and a batch is
      // a distribution: its size is the whole of what it is (ADR 0053).
      const root = emptyRoot();
      const result = runBatch(SHARP_HAND, String(FIRST_SEED), '0', root);

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('0');
      expect(result.stderr).toContain('no batch was played');
      expect(result.stderr).not.toMatch(/^\s+at /m);
      expect(readdirSync(root)).toEqual([]);
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'walks a batch of its own size when nobody names a count',
    () => {
      // Test 70. The count is optional as of the slice that created the row it
      // defaults to, and this reads that default off the far end of the walk:
      // a batch of BATCH_SEEDS from the last seed runs off the end of the range
      // and is refused naming the seed it would have reached, so the default is
      // proved without playing forty-eight runs to see it. It names no output
      // root on purpose: the range is refused before any folder is made, so a
      // command that writes nothing needs nowhere to write it.
      const result = runBatch(SHARP_HAND, String(SEED_LIMIT - 1));

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain(String(SEED_LIMIT - 1 + BATCH_SEEDS - 1));
      expect(result.stderr).toContain('no batch was played');
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'writes one tape per seed and one report beside them, and prints the folder as the whole of what it says',
    () => {
      // Test 71. The folder's name is a convenience and the bytes are
      // authoritative (ADR 0057): every tape carries its own seed, commit hash,
      // resolved conditions and the hand that steered, so an ingest reads the
      // folder and learns nothing from its name the bytes do not already say.
      const root = emptyRoot();
      const result = runBatch(SHARP_HAND, String(FIRST_SEED), '2', root);

      expect(result.status).toBe(0);
      const folder = result.stdout.trimEnd();
      expect(result.stdout).toBe(folder + '\n');
      expect(readdirSync(root)).toEqual([folder.split('/').at(-1)]);
      expect(folder).toContain(SHARP_HAND);

      const written = readdirSync(folder).sort();
      expect(written).toEqual([
        `${FIRST_SEED}.tape`,
        `${FIRST_SEED + 1}.tape`,
        'report.json',
      ]);

      for (const offset of [0, 1]) {
        const { header } = decodeTape(
          new Uint8Array(
            readFileSync(join(folder, `${FIRST_SEED + offset}.tape`)),
          ),
        ).tape;
        expect(header.seed).toBe(FIRST_SEED + offset);
        expect(header.policy).toBe(SHARP_HAND);
        expect(header.inputDevice).toBe('bot');
      }

      // The report is a function of the tapes the batch just wrote: it is the
      // measuring pass over those same bytes, so both runs verified or the
      // report says which one did not.
      const report: BatchReport = JSON.parse(
        readFileSync(join(folder, 'report.json'), 'utf8'),
      );
      expect(report.identity.configuration).toBe(SHARP_HAND);
      expect(report.identity.firstSeed).toBe(FIRST_SEED);
      expect(report.identity.seeds).toBe(2);
      expect(report.verified).toBe(2);
      expect(report.unverified).toEqual([]);
      expect(report.spreads['run.ticks'].count).toBe(2);
    },
    PLAYED_BATCH_BUDGET_MS,
  );
});
