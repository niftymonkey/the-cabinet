/**
 * The guard over the batch table: a reading may not be dropped from the batch
 * report by nobody having thought about it.
 *
 * It is its own file and named for the behaviour it guards, because it spans
 * the whole report rather than any one reading, which is the shape
 * comparisonDeclared.test.ts already states for its own guard. The cost it
 * imposes is deliberate: a new reading declares how a batch reduces it, or this
 * goes red.
 */

import { describe, expect, it } from 'vitest';

import { TICK_HZ } from '../../game/clock';
import { createExecution, executeTick } from '../../game/execution';
import { WEAPON_LINES } from '../../game/lines/roster';
import { createRun } from '../../game/run';
import { WITNESS_VERSION } from '../../game/witness';
import { recordInto, sealTrailer, tapeOf } from '../../tape/recorder';
import { SCRIPT_POLICY } from '../../tape/tape';
import { BATCH_READINGS } from '../batchReport';
import type { Metrics } from '../measure';
import { measure } from '../measure';

const SEED = 20260826;
const TICKS = 60;

/** One short verified report, which is every reading the seam can produce. */
const shortReport = (): Metrics => {
  const run = createRun(SEED);
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
    rendererBackend: 'webgl',
    rendererResolution: 2,
    devicePixelRatio: 2,
    recordedAt: 1_766_000_000_000,
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

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Every path under this value that no entry in the table claims. A declared
 * path claims its whole subtree, so the section timeline is one declaration
 * rather than one per span, and an object nobody declared is walked into until
 * its leaves are reached.
 */
const undeclaredUnder = (
  declared: ReadonlySet<string>,
  value: unknown,
  path: string,
): string[] => {
  if (declared.has(path)) return [];
  if (!isPlainObject(value)) return [path];
  const entries = Object.entries(value);
  if (entries.length === 0) return [path];
  return entries.flatMap(([key, nested]) =>
    undeclaredUnder(declared, nested, path === '' ? key : `${path}.${key}`),
  );
};

/**
 * The value the declared path names, or undefined when the report does not
 * carry it. Every segment is resolved, so a stale nested path is caught even
 * when a sibling entry declares the branch it sits on.
 */
const valueAt = (report: Record<string, unknown>, path: string): unknown => {
  let value: unknown = report;
  for (const segment of path.split('.')) {
    if (!isPlainObject(value)) return undefined;
    value = value[segment];
  }
  return value;
};

describe('every reading declares how a batch reduces it', () => {
  it('every reading on a verified report carries a declared batch reduction', () => {
    const declared = new Set(BATCH_READINGS.map((reading) => reading.reading));

    expect(undeclaredUnder(declared, shortReport(), '')).toEqual([]);

    // The walk has teeth: a reading nobody declared is named, rather than
    // quietly falling out of every report a batch ever prints.
    expect(
      undeclaredUnder(declared, { run: { ticks: 1, hunger: 4 } }, ''),
    ).toEqual(['run.hunger']);

    // And no entry declares a path the report does not carry, which would leave
    // that reading guarded by a name and nothing else.
    const report: Record<string, unknown> = { ...shortReport() };
    for (const reading of BATCH_READINGS) {
      expect(
        valueAt(report, reading.reading),
        `${reading.reading} names no reading`,
      ).not.toBe(undefined);
    }
  });

  it('declares each reading once, so its reduction is one decision', () => {
    // Two entries over one path would be two answers to how the batch reads it,
    // and which one the report used would be an accident of table order. The
    // section timeline is the one reading a batch reads twice, and it says so
    // in one entry rather than in two.
    const names = BATCH_READINGS.map((reading) => reading.reading);

    expect([...new Set(names)]).toEqual(names);
  });
});
