/**
 * The comparison command line: the thin shell over the batch comparison, run
 * as a person runs it, so stdout, stderr and the exit code are the seam.
 *
 * The comparison half of the harness had no shell at all and was reachable
 * only from its own test, which left step 4 with no way to read one build
 * against another (the tech gate's own DEFER, pulled in here).
 *
 * The reports are built in this process and written out rather than played,
 * because what is under test is the shell over two files and playing four
 * batches to make them would measure the stage instead.
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { TICK_HZ } from '../../src/game/clock';
import { createExecution, executeTick } from '../../src/game/execution';
import { WEAPON_LINES } from '../../src/game/lines/roster';
import { createRun } from '../../src/game/run';
import { WITNESS_VERSION } from '../../src/game/witness';
import { recordInto, sealTrailer, tapeOf } from '../../src/tape/recorder';
import { SCRIPT_POLICY } from '../../src/tape/tape';
import { batchReportOf } from '../../src/dev/batchReport';
import type { BatchReport } from '../../src/dev/batchReport';
import type { ConfigurationName } from '../../src/dev/configurations';
import { measure } from '../../src/dev/measure';
import type { Metrics } from '../../src/dev/measure';

const APP = resolve(import.meta.dirname, '..', '..');
const VITE_NODE = join(APP, 'node_modules', '.bin', 'vite-node');

const TICKS = 40;

/**
 * Long because the subprocess is the seam and every case pays a cold vite
 * boot. Nothing here plays a batch.
 */
const SUBPROCESS_BUDGET_MS = 20_000;

const runCompare = (...args: string[]) =>
  spawnSync(
    VITE_NODE,
    [
      '--config',
      'vite.headless.config.ts',
      'scripts/compare-batches.ts',
      ...args,
    ],
    { cwd: APP, encoding: 'utf8' },
  );

/** One short verified report, which is every reading a batch can reduce. */
const verifiedReport = (seed: number): Metrics => {
  const run = createRun(seed);
  const execution = createExecution(run);
  const recorder = recordInto(execution, {
    seed: run.seed,
    startingSize: run.grave.size,
    recordedRoster: [...WEAPON_LINES],
    startingLevels: { ...run.levels },
    tickRate: TICK_HZ,
    checkpointSpacing: 20,
    witnessVersion: WITNESS_VERSION,
    commitHash: 'aa038cb310',
    buildIdentity: '',
    author: 'unknown',
    inputDevice: 'script',
    policy: SCRIPT_POLICY,
    keyboardSpeed: 1,
    rendererBackend: 'headless',
    rendererResolution: 0,
    devicePixelRatio: 0,
    recordedAt: 1_788_000_000_000,
  });
  for (let tick = 0; tick < TICKS; tick++) {
    executeTick(execution, { move: { x: 0.2, y: -0.1 }, belch: false });
  }
  sealTrailer(recorder, execution, 0);
  const measurement = measure({ tape: tapeOf(recorder), truncated: false });
  if (measurement.outcome !== 'verified') {
    throw new Error(`expected verified metrics, got ${measurement.outcome}`);
  }
  return measurement;
};

const BASE = verifiedReport(20260909);

const reportOf = (
  configuration: ConfigurationName,
  ticks: number,
): BatchReport =>
  batchReportOf(
    { configuration, firstSeed: 900, seeds: 4, recordedAt: 1_788_000_000_000 },
    [0, 1, 2, 3].map((offset) => ({
      seed: 900 + offset,
      measurement: {
        ...BASE,
        run: { ...BASE.run, ticks: ticks + offset },
      },
    })),
  );

/** A folder of report files, named as the command will be given them. */
const written = (reports: Record<string, BatchReport>): string => {
  const folder = mkdtempSync(join(tmpdir(), 'hungry-grave-compare-'));
  for (const [name, report] of Object.entries(reports)) {
    writeFileSync(join(folder, name), JSON.stringify(report, null, 2));
  }
  return folder;
};

describe('the comparison command', () => {
  it(
    'explains its usage',
    () => {
      const result = runCompare();

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain(
        'usage: pnpm vite-node --config vite.headless.config.ts scripts/compare-batches.ts',
      );
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses a report it cannot read, out loud, and compares nothing',
    () => {
      const folder = written({ 'left.json': reportOf('steady-far', 10) });
      const result = runCompare(
        join(folder, 'left.json'),
        join(folder, 'nowhere.json'),
      );

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('nowhere.json');
      expect(result.stderr).toContain('nothing was compared');
      expect(result.stderr).not.toMatch(/^\s+at /m);
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses a file that is not a batch report, out loud, and compares nothing',
    () => {
      // Parse at the edge: a file becomes a report here or is refused here, so
      // nothing inside the comparison ever holds a shape it has not checked.
      const folder = written({ 'left.json': reportOf('steady-far', 10) });
      writeFileSync(join(folder, 'not-a-report.json'), '{"hello":"world"}');
      const result = runCompare(
        join(folder, 'left.json'),
        join(folder, 'not-a-report.json'),
      );

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('not-a-report.json');
      expect(result.stderr).toContain('nothing was compared');
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'refuses a report written before the readings it compares, out loud',
    () => {
      // A report from an earlier build carries no rigs on its identity and no
      // samples under its spreads, and both are fields the comparison reads
      // without asking. A document is rejected and never guessed at, so the
      // shell says so rather than dying inside the comparison.
      const older = reportOf('steady-far', 10);
      const folder = written({ 'left.json': reportOf('steady-far', 40) });
      writeFileSync(
        join(folder, 'older.json'),
        JSON.stringify({
          ...older,
          identity: { ...older.identity, rigs: undefined },
          spreads: Object.fromEntries(
            Object.entries(older.spreads).map(([name, spread]) => [
              name,
              { ...spread, samples: undefined },
            ]),
          ),
        }),
      );
      const result = runCompare(
        join(folder, 'left.json'),
        join(folder, 'older.json'),
      );

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('older.json');
      expect(result.stderr).toContain('nothing was compared');
      expect(result.stderr).not.toMatch(/^\s+at /m);

      // The same for the two other fields the comparison reads without
      // asking: the commits it names a build pair by, and the five numbers a
      // direction is taken from.
      writeFileSync(
        join(folder, 'partial.json'),
        JSON.stringify({
          ...older,
          identity: { ...older.identity, commitHashes: undefined },
          spreads: Object.fromEntries(
            Object.entries(older.spreads).map(([name, spread]) => [
              name,
              { ...spread, summary: undefined },
            ]),
          ),
        }),
      );
      const partial = runCompare(
        join(folder, 'left.json'),
        join(folder, 'partial.json'),
      );

      expect(partial.status).toBe(1);
      expect(partial.stderr).toContain('partial.json');
      expect(partial.stderr).not.toMatch(/^\s+at /m);
    },
    SUBPROCESS_BUDGET_MS * 2,
  );

  it(
    'compares two reports and prints the comparison as the whole of what it says',
    () => {
      const folder = written({
        'left.json': reportOf('steady-far', 10),
        'right.json': reportOf('steady-far', 40),
      });
      const result = runCompare(
        join(folder, 'left.json'),
        join(folder, 'right.json'),
      );

      expect(result.status).toBe(0);
      const compared = JSON.parse(result.stdout);
      expect(compared.corners).toHaveLength(1);
      expect(compared.read).toBeNull();
      const ticks = compared.corners[0].readings.find(
        (row: { reading: string }) => row.reading === 'run.ticks',
      );
      expect(ticks.direction).toBe('up');
      expect(ticks.rank.rankBiserial).toBe(1);
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'says out loud when the two reports are not comparable, and orders nothing',
    () => {
      // Two hands are two instruments, and the shell's own line is where a
      // person reading a comparison finds that out.
      const folder = written({
        'left.json': reportOf('steady-far', 10),
        'right.json': reportOf('shaky-short', 40),
      });
      const result = runCompare(
        join(folder, 'left.json'),
        join(folder, 'right.json'),
      );

      expect(result.status).toBe(0);
      expect(result.stderr).toContain('configuration');
      const compared = JSON.parse(result.stdout);
      expect(compared.corners[0].mismatches).toEqual(['configuration']);
    },
    SUBPROCESS_BUDGET_MS,
  );

  it(
    'reads the two corners together when four reports are named',
    () => {
      // ADR 0053: a finding is believed where the sharp and the sloppy corner
      // agree on the ordering, and until now nothing outside a test could ask
      // that question at all.
      const folder = written({
        'sharp-left.json': reportOf('steady-far', 10),
        'sharp-right.json': reportOf('steady-far', 40),
        'sloppy-left.json': reportOf('shaky-short', 10),
        'sloppy-right.json': reportOf('shaky-short', 40),
      });
      const result = runCompare(
        join(folder, 'sharp-left.json'),
        join(folder, 'sharp-right.json'),
        join(folder, 'sloppy-left.json'),
        join(folder, 'sloppy-right.json'),
      );

      expect(result.status).toBe(0);
      const compared = JSON.parse(result.stdout);
      expect(compared.corners).toHaveLength(2);
      expect(compared.read.mismatches).toEqual([]);
      const ticks = compared.read.findings.find(
        (row: { reading: string }) => row.reading === 'run.ticks',
      );
      expect(ticks.agreement).toBe('agreed');
      expect(ticks.sharp).toBe('up');
      expect(ticks.sloppy).toBe('up');
    },
    SUBPROCESS_BUDGET_MS,
  );
});
