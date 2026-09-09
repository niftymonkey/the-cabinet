/**
 * The test-name command line: the thin shell over the listing module, run as a
 * person runs it, so stdout, stderr and the exit code are the seam (#120).
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP = resolve(import.meta.dirname, '..', '..');
const VITE_NODE = join(APP, 'node_modules', '.bin', 'vite-node');

/** A file of the given text, in a directory of its own. */
function fileHolding(name: string, contents: string): string {
  const path = join(mkdtempSync(join(tmpdir(), 'hungry-grave-names-')), name);
  writeFileSync(path, contents);
  return path;
}

/** A path in a directory of its own, with nothing written at it. */
function pathWithNoFile(name: string): string {
  return join(mkdtempSync(join(tmpdir(), 'hungry-grave-names-')), name);
}

/** A listing in the printed shape, which is what either argument may be. */
function printed(...names: readonly string[]): string {
  return names.join('\n') + '\n';
}

function runTestNames(...args: string[]) {
  return spawnSync(
    VITE_NODE,
    ['--config', 'vite.headless.config.ts', 'scripts/test-names.ts', ...args],
    { cwd: APP, encoding: 'utf8' },
  );
}

/**
 * Long because the subprocess is the seam. Every case pays a cold vite boot
 * before the script's first line runs, which is the cost of seeing the real
 * command line rather than a budget covering for a slow test.
 */
const SUBPROCESS_BUDGET_MS = 20_000;

describe('the test-name tool', () => {
  it(
    'names every test the tree gained and every one it lost',
    () => {
      const baseline = fileHolding(
        'baseline.txt',
        printed('a.test.ts :: kept', 'a.test.ts :: gone'),
      );
      const current = fileHolding(
        'current.txt',
        printed('a.test.ts :: kept', 'b.test.ts :: new'),
      );

      const result = runTestNames(baseline, current);

      expect(result.stdout).toContain('1 added, 1 removed');
      expect(result.stdout).toContain('+ b.test.ts :: new');
      expect(result.stdout).toContain('- a.test.ts :: gone');
      // A removal is what the comparison exists to catch, so it leaves by the
      // door a script watching this command reads.
      expect(result.status).toBe(1);
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'passes a tree that only added tests',
    () => {
      const baseline = fileHolding(
        'baseline.txt',
        printed('a.test.ts :: kept'),
      );
      const current = fileHolding(
        'current.txt',
        printed('a.test.ts :: kept', 'a.test.ts :: new'),
      );

      const result = runTestNames(baseline, current);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('1 added, 0 removed');
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'compares a raw vitest capture against a printed one',
    () => {
      // The two shapes are the point: a step that kept only one of them still
      // has its comparison.
      const raw = JSON.stringify([
        { name: 'kept', file: `${APP}/a.test.ts` },
        { name: 'new', file: `${APP}/b.test.ts` },
      ]);
      const baseline = fileHolding(
        'baseline.txt',
        printed('a.test.ts :: kept'),
      );
      const current = fileHolding('current.json', `${raw}\n`);

      const result = runTestNames(baseline, current);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('1 added, 0 removed');
      expect(result.stdout).toContain('+ b.test.ts :: new');
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'explains its usage',
    () => {
      const result = runTestNames();

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('scripts/test-names.ts');
      expect(result.stderr).toContain('vitest list --json');
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses a file that is not a listing with a reason, not a stack',
    () => {
      const baseline = fileHolding('baseline.txt', 'this is not a listing\n');
      const current = fileHolding('current.txt', printed('a.test.ts :: kept'));

      const result = runTestNames(baseline, current);

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain(baseline);
      expect(result.stderr).toContain('nothing was compared');
      expect(result.stderr).not.toMatch(/^\s+at /m);
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses a file it cannot read with a reason, not a stack',
    () => {
      const missing = pathWithNoFile('baseline.txt');
      const current = fileHolding('current.txt', printed('a.test.ts :: kept'));

      const result = runTestNames(missing, current);

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain(missing);
      expect(result.stderr).toContain('nothing was compared');
      expect(result.stderr).not.toMatch(/^\s+at /m);
    },
    SUBPROCESS_BUDGET_MS,
  );
});
