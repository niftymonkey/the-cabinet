/**
 * The frame-budget command line, run as a person runs it, so stdout, stderr
 * and the exit code are the seam.
 */

import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP = resolve(import.meta.dirname, '..', '..');
const VITE_NODE = join(APP, 'node_modules', '.bin', 'vite-node');

const runFrameBudget = (...args: string[]) =>
  spawnSync(
    VITE_NODE,
    [
      '--config',
      'vite.frame-budget.config.ts',
      'scripts/frame-budget.ts',
      ...args,
    ],
    { cwd: APP, encoding: 'utf8' },
  );

/**
 * Long because the subprocess is the seam: every case pays a cold vite boot
 * before the script's first line runs.
 */
const SUBPROCESS_BUDGET_MS = 20_000;

describe('the frame-budget command', () => {
  it(
    'refuses a field it cannot play, out loud, and measures nothing',
    () => {
      // A31: the budget takes field=<height> so a tall phone's field can be
      // measured headlessly too, and a height no run may play is refused at
      // the edge with the usage, before a single field is stood.
      for (const flawed of ['field=700', 'field=abc', 'field=1261']) {
        const refused = runFrameBudget(flawed);
        expect(refused.status).toBe(1);
        expect(refused.stdout).toBe('');
        expect(refused.stderr).toContain(flawed.slice('field='.length));
        expect(refused.stderr).toContain('is not a field height');
        expect(refused.stderr).toContain(
          'usage: pnpm vite-node --config vite.frame-budget.config.ts scripts/frame-budget.ts [field=<height>]',
        );
      }
    },
    SUBPROCESS_BUDGET_MS * 3,
  );
});
