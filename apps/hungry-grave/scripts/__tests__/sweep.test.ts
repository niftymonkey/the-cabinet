/**
 * The sweep command line: the thin shell that plays a list of candidates as
 * ordinary batches and prints the comparison across them, run as a person runs
 * it, so the written folders, stdout, stderr and the exit code are the seam.
 *
 * What the command does is make a tuning iteration cost one command and one
 * read: a batch per candidate, each folder indistinguishable from a hand-played
 * one, and one comparison of each later candidate against the first.
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { BatchReport } from '../../src/dev/batchReport';
import { SHARP_HAND } from '../../src/dev/configurations';
import { CANDIDATES } from '../../src/dev/tuningCandidates';
import { SEED_LIMIT } from '../../src/game/run';

const APP = resolve(import.meta.dirname, '..', '..');
const VITE_NODE = join(APP, 'node_modules', '.bin', 'vite-node');

/** A seed the sharp hand finishes on well inside its budget, so the sweep is cheap. */
const FIRST_SEED = 202;

/** An empty directory of its own, so what the command wrote is all that is there. */
const emptyRoot = (): string =>
  mkdtempSync(join(tmpdir(), 'hungry-grave-sweep-'));

const runSweep = (...args: string[]) =>
  spawnSync(
    VITE_NODE,
    ['--config', 'vite.headless.config.ts', 'scripts/sweep.ts', ...args],
    { cwd: APP, encoding: 'utf8' },
  );

/**
 * Long because the subprocess is the seam and the work behind it is real play.
 * Every case pays a cold vite boot, and the case that sweeps plays one whole
 * run per candidate through the one execution authority.
 */
const SUBPROCESS_BUDGET_MS = 20_000;
const PLAYED_SWEEP_BUDGET_MS = 240_000;

describe('the sweep command', () => {
  it(
    'refuses an argument it cannot read, out loud, and plays nothing',
    () => {
      // Parse at the edge, on batch.ts's own terms: an argument becomes what it
      // names here or is refused here, so nothing inside the sweep holds a
      // string it has not checked. A command with nothing on it is somebody
      // asking what the command is.
      expect(runSweep().status).toBe(1);
      expect(runSweep().stderr).toContain(
        'usage: pnpm vite-node --config vite.headless.config.ts scripts/sweep.ts',
      );

      const root = emptyRoot();
      const named = runSweep(
        'steady-ish',
        String(FIRST_SEED),
        '1',
        root,
        'tuning=default,spendable',
      );
      expect(named.status).toBe(1);
      expect(named.stdout).toBe('');
      expect(named.stderr).toContain('steady-ish');
      expect(named.stderr).toContain('no sweep was played');
      expect(named.stderr).not.toMatch(/^\s+at /m);

      const seeded = runSweep(
        SHARP_HAND,
        String(SEED_LIMIT),
        '1',
        root,
        'tuning=default,spendable',
      );
      expect(seeded.status).toBe(1);
      expect(seeded.stderr).toContain(String(SEED_LIMIT));
      expect(seeded.stderr).toContain('no sweep was played');
      expect(readdirSync(root)).toEqual([]);
    },
    SUBPROCESS_BUDGET_MS * 4,
  );

  it(
    'refuses a tuning candidate nobody named, out loud, and plays nothing',
    () => {
      // The command line refuses where the URL repairs, on the split slice 7
      // wrote: a sweep under a tuning nobody asked for is a folder of runs
      // whose name lies about them, and it is refused before a tick is played.
      const root = emptyRoot();
      const result = runSweep(
        SHARP_HAND,
        String(FIRST_SEED),
        '1',
        root,
        'tuning=default,lean',
      );

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('lean');
      expect(result.stderr).toContain('no sweep was played');
      expect(result.stderr).not.toMatch(/^\s+at /m);
      expect(readdirSync(root)).toEqual([]);
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses a list that is not a sweep, out loud, and plays nothing',
    () => {
      // A sweep is candidates compared against each other, so a list with
      // nothing to compare is refused rather than played as a batch: one name
      // is batch.ts's job, and one name written twice compares a candidate with
      // itself under a folder that says two things.
      const root = emptyRoot();
      const none = runSweep(SHARP_HAND, String(FIRST_SEED), '1', root);
      expect(none.status).toBe(1);
      expect(none.stderr).toContain('no sweep was played');

      const one = runSweep(
        SHARP_HAND,
        String(FIRST_SEED),
        '1',
        root,
        'tuning=default',
      );
      expect(one.status).toBe(1);
      expect(one.stderr).toContain('no sweep was played');

      const twice = runSweep(
        SHARP_HAND,
        String(FIRST_SEED),
        '1',
        root,
        'tuning=default,default',
      );
      expect(twice.status).toBe(1);
      expect(twice.stderr).toContain('default');
      expect(twice.stderr).toContain('no sweep was played');
      expect(readdirSync(root)).toEqual([]);
    },
    SUBPROCESS_BUDGET_MS * 3,
  );

  it(
    'plays each candidate as an ordinary batch and compares each later one against the first',
    () => {
      // The step's done line: one command sweeps a list of candidates and
      // prints the comparison across them, and a report says which tuning it
      // read (ADR 0064). The folders are batch folders and nothing in one says
      // a sweep made it, which is what keeps a sweep's evidence and a
      // hand-played batch's the same kind of thing.
      const root = emptyRoot();
      const result = runSweep(
        SHARP_HAND,
        String(FIRST_SEED),
        '1',
        root,
        'tuning=default,spendable',
      );

      expect(result.status).toBe(0);
      const swept = JSON.parse(result.stdout);
      expect(
        swept.played.map((one: { candidate: string }) => one.candidate),
      ).toEqual(['default', 'spendable']);

      // One ordinary batch folder per candidate, in the order the argument
      // named them, each holding one tape per seed and its own report.
      expect(readdirSync(root).length).toBe(2);
      for (const played of swept.played) {
        expect(played.folder.split('/').at(-1)).toMatch(
          new RegExp(`^${SHARP_HAND}-birthright-${played.candidate}-\\d+$`),
        );
        expect(readdirSync(played.folder).sort()).toEqual([
          `${FIRST_SEED}.tape`,
          'report.json',
        ]);
        const report: BatchReport = JSON.parse(
          readFileSync(join(played.folder, 'report.json'), 'utf8'),
        );
        expect(report.identity.candidates).toEqual([played.candidate]);
        expect(report.identity.configuration).toBe(SHARP_HAND);
        expect(report.verified).toBe(1);
      }

      // One comparison of each later candidate against the first, with the row
      // the two records differ in named ahead of every reading.
      expect(swept.comparisons).toHaveLength(1);
      const [comparison] = swept.comparisons;
      expect(comparison.mismatches).toEqual([]);
      expect(comparison.tuningDifferences).toEqual([
        {
          name: 'stage.processionPurse',
          left: CANDIDATES.default.record.stage.processionPurse,
          right: CANDIDATES.spendable.record.stage.processionPurse,
        },
      ]);
      expect(comparison.readings.length).toBeGreaterThan(0);
      const rows = result.stderr.indexOf('stage.processionPurse');
      expect(rows).toBeGreaterThanOrEqual(0);
      expect(result.stderr.indexOf('readings ordered')).toBeGreaterThan(rows);
    },
    PLAYED_SWEEP_BUDGET_MS,
  );
});
