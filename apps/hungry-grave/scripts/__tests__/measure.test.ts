/**
 * The measure command line: the thin shell over the measurement modules, run
 * as a person runs it, so stdout, stderr and the exit code are the seam.
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { measure } from '../../src/dev/measure';
import { TICK_HZ } from '../../src/game/clock';
import type { TickCommand } from '../../src/game/command';
import { createExecution, executeTick } from '../../src/game/execution';
import type { RunState } from '../../src/game/run';
import { createRun } from '../../src/game/run';
import { WITNESS_VERSION } from '../../src/game/witness';
import { decodeTape } from '../../src/tape/decode';
import { encodeTape } from '../../src/tape/encode';
import { recordInto, sealTrailer, tapeOf } from '../../src/tape/recorder';
import type { TapeHeader } from '../../src/tape/tape';

const APP = resolve(import.meta.dirname, '..', '..');
const VITE_NODE = join(APP, 'node_modules', '.bin', 'vite-node');
const SEED = 20260826;
const TICKS = 240;
const CHECKPOINT_SPACING = 20;

function header(run: RunState): TapeHeader {
  return {
    seed: run.seed,
    startingSize: run.grave.size,
    startingLevels: { ...run.levels },
    tickRate: TICK_HZ,
    checkpointSpacing: CHECKPOINT_SPACING,
    witnessVersion: WITNESS_VERSION,
    commitHash: 'e59e67f162',
    buildIdentity: '',
    author: 'unknown',
    inputDevice: 'script',
    keyboardSpeed: 1,
    rendererBackend: 'webgl',
    rendererResolution: 2,
    devicePixelRatio: 2,
    recordedAt: 1_766_000_000_000,
  };
}

/** A steering script with a shape, so a body of zeroes cannot pass by accident. */
function steer(tick: number): TickCommand {
  return {
    move: { x: (tick % 7) / 6 - 0.5, y: (tick % 5) / 4 - 0.5 },
    belch: false,
  };
}

/**
 * One real sealed tape, recorded through the one execution authority the game
 * plays through and encoded to the bytes a file would hold.
 */
function sealedTapeBytes(): Uint8Array {
  const run = createRun(SEED);
  const execution = createExecution(run);
  const recorder = recordInto(execution, header(run));
  for (let tick = 0; tick < TICKS; tick++) {
    executeTick(execution, steer(tick));
  }
  sealTrailer(recorder, execution, 0);
  return encodeTape(tapeOf(recorder));
}

/** A file of the given bytes, in a directory of its own. */
function fileHolding(name: string, contents: Uint8Array | string): string {
  const path = join(mkdtempSync(join(tmpdir(), 'hungry-grave-measure-')), name);
  writeFileSync(path, contents);
  return path;
}

/** A path in a directory of its own, with nothing written at it. */
function pathWithNoFile(name: string): string {
  return join(mkdtempSync(join(tmpdir(), 'hungry-grave-measure-')), name);
}

function runMeasure(...args: string[]) {
  return spawnSync(VITE_NODE, ['scripts/measure.ts', ...args], {
    cwd: APP,
    encoding: 'utf8',
  });
}

/**
 * The report the tool printed, or null when it printed none.
 *
 * vite-node loads vite.config.ts, and the assetpack plugin there writes its own
 * progress to stdout before the script runs. The report is what follows: it is
 * printed last and it opens on the only line that is a bare brace.
 */
function printedReport(stdout: string): string | null {
  const start = stdout.search(/^\{$/m);
  return start === -1 ? null : stdout.slice(start).trimEnd();
}

/**
 * Long because the subprocess is the seam. Every case pays a cold vite boot and
 * an assetpack pass before the script's first line runs, which is the cost of
 * seeing the real command line rather than a budget covering for a slow test.
 */
const SUBPROCESS_BUDGET_MS = 20_000;

describe('the measure tool', () => {
  it(
    'prints what the module measures',
    () => {
      const bytes = sealedTapeBytes();
      const result = runMeasure(fileHolding('run.tape', bytes));

      expect(result.status).toBe(0);
      expect(printedReport(result.stdout)).toBe(
        JSON.stringify(measure(decodeTape(bytes)), null, 2),
      );
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'explains its usage',
    () => {
      const result = runMeasure();

      expect(result.status).toBe(1);
      expect(printedReport(result.stdout)).toBeNull();
      expect(result.stderr).toContain(
        'usage: pnpm vite-node scripts/measure.ts <tape-file>',
      );
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses a file that is not a tape with a reason, not a stack',
    () => {
      const path = fileHolding('notes.txt', 'this is not a tape at all');
      const result = runMeasure(path);

      // What failed and what it costs, the way tapeStore.ts says it.
      expect(result.status).toBe(1);
      expect(printedReport(result.stdout)).toBeNull();
      expect(result.stderr).toContain(path);
      expect(result.stderr).toContain('no measurement was taken');
      // An uncaught stack is neither a repair nor a useful message.
      expect(result.stderr).not.toMatch(/^\s+at /m);
      expect(result.stderr).not.toContain('TapeFormatError:');
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses a path it cannot read with a reason, not a stack',
    () => {
      const path = pathWithNoFile('gone.tape');
      const result = runMeasure(path);

      // A mistyped or moved path is the commonest way to run this tool wrong,
      // and the person holding it can only act on being told which path and why.
      expect(result.status).toBe(1);
      expect(printedReport(result.stdout)).toBeNull();
      expect(result.stderr).toContain(path);
      expect(result.stderr).toContain('no measurement was taken');
      // An uncaught stack out of node:fs is neither a repair nor a message.
      expect(result.stderr).not.toMatch(/^\s+at /m);
    },
    SUBPROCESS_BUDGET_MS,
  );
});
