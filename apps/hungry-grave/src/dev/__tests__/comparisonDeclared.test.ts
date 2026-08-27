/**
 * The guard over the comparison table: a reading may not inherit a comparison
 * meaning from the shape its value happens to have.
 *
 * It is its own file and named for the behaviour it guards, because it spans
 * the whole report rather than any one reading. The cost it imposes is
 * deliberate: a new kind of reading declares what comparing it means, or this
 * goes red.
 */

import { describe, expect, it } from 'vitest';

import { WEAPON_LINES } from '../../game/lines/roster';

import { TICK_HZ } from '../../game/clock';
import { createExecution, executeTick } from '../../game/execution';
import { createRun } from '../../game/run';
import { WITNESS_VERSION } from '../../game/witness';
import { recordInto, sealTrailer, tapeOf } from '../../tape/recorder';
import { READING_COMPARISONS } from '../compareRuns';
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
 * path claims its whole subtree, so provenance is one declaration rather than
 * three, and an object nobody declared is walked into until its leaves are
 * reached.
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

describe('every reading declares what comparing it means', () => {
  it('every reading on a verified report carries a declared comparison meaning', () => {
    const declared = new Set(
      READING_COMPARISONS.map((comparison) => comparison.reading),
    );

    expect(undeclaredUnder(declared, shortReport(), '')).toEqual([]);

    // The walk has teeth: a reading nobody declared is named, rather than
    // quietly taking a meaning from the type it happens to have.
    expect(
      undeclaredUnder(declared, { run: { ticks: 1, hunger: 4 } }, ''),
    ).toEqual(['run.hunger']);

    // And no entry declares a path the report does not carry, which would
    // leave that reading guarded by a name and nothing else. The whole path is
    // resolved rather than its first segment: a stale nested entry beside a
    // correct one passes the walk above on the correct entry's declaration, and
    // then the compare dereferences nothing and puts a NaN in the comparison.
    const report: Record<string, unknown> = { ...shortReport() };
    for (const comparison of READING_COMPARISONS) {
      expect(
        valueAt(report, comparison.reading),
        `${comparison.reading} names no reading`,
      ).not.toBe(undefined);
    }
  });
});
