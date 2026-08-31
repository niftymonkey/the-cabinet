/**
 * The record-conditioned command line: the thin shell over the recorder, run
 * as a person runs it, so the written file, stdout, stderr and the exit code
 * are the seam.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { measure } from '../../src/dev/measure';
import { decodeTape } from '../../src/tape/decode';

const APP = resolve(import.meta.dirname, '..', '..');
const VITE_NODE = join(APP, 'node_modules', '.bin', 'vite-node');
const SEED = 20260831;
const TICKS = 240;

/** A path in a directory of its own, with nothing written at it. */
const pathWithNoFile = (name: string): string => {
  return join(mkdtempSync(join(tmpdir(), 'hungry-grave-record-')), name);
};

const runRecord = (...args: string[]) => {
  return spawnSync(
    VITE_NODE,
    [
      '--config',
      'vite.headless.config.ts',
      'scripts/record-conditioned.ts',
      ...args,
    ],
    {
      cwd: APP,
      encoding: 'utf8',
    },
  );
};

/**
 * Long because the subprocess is the seam. Every case pays a cold vite boot
 * before the script's first line runs, which is the cost of seeing the real
 * command line rather than a budget covering for a slow test.
 */
const SUBPROCESS_BUDGET_MS = 20_000;

describe('the record-conditioned tool', () => {
  it(
    'records a sealed tape the measurement verifies at the chosen levels',
    () => {
      const out = pathWithNoFile('conditioned.tape');
      const result = runRecord(
        out,
        String(SEED),
        String(TICKS),
        'soulStream=2',
        'territory=3',
        'wisps=1',
        'bell=4',
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toBe(out + '\n');

      const decoded = decodeTape(new Uint8Array(readFileSync(out)));
      expect(decoded.tape.header.seed).toBe(SEED);
      expect(decoded.tape.header.startingLevels).toEqual({
        soulStream: 2,
        territory: 3,
        wisps: 1,
        bell: 4,
      });
      expect(decoded.tape.header.inputDevice).toBe('script');
      expect(decoded.tape.trailer).not.toBeNull();

      const measured = measure(decoded);
      expect(measured.outcome).toBe('verified');
      if (measured.outcome !== 'verified') return;
      expect(measured.run.ticks).toBe(TICKS);
      expect(measured.provenance.conditioned).toBe(true);
      expect(measured.provenance.exclusions).toContain('script');
      expect(measured.provenance.exclusions).toContain('conditioned');
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'explains its usage',
    () => {
      const result = runRecord();

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain(
        'usage: pnpm vite-node --config vite.headless.config.ts scripts/record-conditioned.ts',
      );
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses a seed that names no seed, out loud',
    () => {
      const out = pathWithNoFile('conditioned.tape');
      const result = runRecord(out, 'yesterday', '30', 'soulStream=1');

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('yesterday');
      expect(result.stderr).toContain('no tape was recorded');
      expect(existsSync(out)).toBe(false);
      expect(result.stderr).not.toMatch(/^\s+at /m);
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses an argument that names no weapon line, out loud',
    () => {
      const out = pathWithNoFile('conditioned.tape');
      const result = runRecord(
        out,
        String(SEED),
        '30',
        'soulStream=2',
        'territory=3',
        'wisps=1',
        'bells=4',
      );

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('bells=4');
      expect(result.stderr).toContain('no tape was recorded');
      expect(existsSync(out)).toBe(false);
      expect(result.stderr).not.toMatch(/^\s+at /m);
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses a loadout that leaves a line unnamed, out loud',
    () => {
      // The tool exists to record a chosen loadout, so the whole choice is
      // stated: a defaulted line would be a level this command never said.
      const out = pathWithNoFile('conditioned.tape');
      const result = runRecord(
        out,
        String(SEED),
        '30',
        'soulStream=2',
        'territory=3',
        'wisps=1',
      );

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('bell');
      expect(result.stderr).toContain('no tape was recorded');
      expect(existsSync(out)).toBe(false);
      expect(result.stderr).not.toMatch(/^\s+at /m);
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses an output path it cannot write with a reason, not a stack',
    () => {
      const out = join(pathWithNoFile('missing-directory'), 'conditioned.tape');
      const result = runRecord(
        out,
        String(SEED),
        '30',
        'soulStream=2',
        'territory=3',
        'wisps=1',
        'bell=4',
      );

      // What failed and what it costs, the way measure.ts says it.
      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain(out);
      expect(result.stderr).toContain('the tape was not saved');
      // An uncaught stack out of node:fs is neither a repair nor a message.
      expect(result.stderr).not.toMatch(/^\s+at /m);
    },
    SUBPROCESS_BUDGET_MS,
  );
});
