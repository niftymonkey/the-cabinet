/**
 * Two batches read side by side: one ordering per reading, and the two corners
 * read together as agreed or split (ADR 0053, #98).
 *
 * Every case builds its batches out of one real verified report with its
 * figures moved, on batchReport.test.ts's own terms: the seam under test is
 * what a comparison makes of two reports, and playing ninety-six whole runs to
 * move one band would measure the stage rather than the comparison.
 */

import { describe, expect, it } from 'vitest';

import { TICK_HZ } from '../../game/clock';
import { createExecution, executeTick } from '../../game/execution';
import { WEAPON_LINES } from '../../game/lines/roster';
import { createRun } from '../../game/run';
import { WITNESS_VERSION } from '../../game/witness';
import { recordInto, sealTrailer, tapeOf } from '../../tape/recorder';
import { SCRIPT_POLICY } from '../../tape/tape';
import { batchReportOf } from '../batchReport';
import type { BatchOrigin, BatchReport } from '../batchReport';
import {
  BAND_SEPARATION,
  compareBatches,
  readAcrossCorners,
} from '../compareBatches';
import type { Direction } from '../compareBatches';
import { measure } from '../measure';
import type { Measurement, Metrics } from '../measure';
import type { SectionSpan } from '../readings/sectionTimeline';

const TICKS = 60;

const ORIGIN: BatchOrigin = {
  configuration: 'steady-far',
  firstSeed: 900,
  seeds: 4,
  recordedAt: 1_788_000_000_000,
};

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

// One seed's measured tape, which is what a batch is a list of.
interface MeasuredRun {
  readonly seed: number;
  readonly measurement: Measurement;
}

// The three figures these cases move, one reading apiece.
interface Figures {
  readonly ticks: number;
  readonly kills: number;
  readonly score: number;
}

/**
 * One closed phase, so every case carries all three families a report keys its
 * spreads by: a sixty-tick run closes no phase, and a comparison whose fixture
 * had no span would say nothing about the rows a real batch reads down.
 */
const SPANS: readonly SectionSpan[] = [
  { phase: 'procession', from: 0, to: 40 },
];

const runOf = (seed: number, figures: Figures): MeasuredRun => ({
  seed,
  measurement: {
    ...BASE,
    run: { ...BASE.run, ...figures },
    tuning: { ...BASE.tuning, sectionTimeline: { spans: SPANS } },
  },
});

/** A batch whose tick counts are named one by one, for a band placed by hand. */
const batchOfTicks = (ticks: readonly number[]): BatchReport =>
  batchReportOf(
    { ...ORIGIN, seeds: ticks.length },
    ticks.map((value, offset) =>
      runOf(900 + offset, { ticks: value, kills: 0, score: 0 }),
    ),
  );

/**
 * Four runs whose figures each walk up by one from the base they are given, so
 * the reading's band is the base and two above it under nearest-rank on four
 * values, and a band is placed by naming where it starts.
 */
const batchFrom = (ticks: number, kills: number, score: number): BatchReport =>
  batchReportOf(
    ORIGIN,
    [0, 1, 2, 3].map((offset) =>
      runOf(900 + offset, {
        ticks: ticks + offset,
        kills: kills + offset,
        score: score + offset,
      }),
    ),
  );

// Where a band starting here ends, which is what the two gaps are measured over.
const BAND_WIDTH = 2;

// Every spread a report carries, over the three families it keeps them in.
const rowsOn = (report: BatchReport): number =>
  Object.keys(report.spreads).length +
  Object.values(report.byLine).reduce(
    (rows, figures) => rows + Object.keys(figures).length,
    0,
  ) +
  Object.keys(report.phaseSpans).length;

const directionOn = (
  comparison: {
    readings: readonly { reading: string; direction: Direction }[];
  },
  reading: string,
): Direction | undefined =>
  comparison.readings.find((row) => row.reading === reading)?.direction;

describe('two batches compared', () => {
  it('states one ordering per reading, up, down or flat', () => {
    // Spec test 42. ADR 0053: the harness compares, "this build against that
    // build, this configuration against that one", so what two batches produce
    // is an ordering per reading and never a number against a target.
    const left = batchFrom(10, 20, 10);
    const right = batchFrom(20, 10, 11);

    const comparison = compareBatches(left, right);

    expect(directionOn(comparison, 'run.ticks')).toBe('up');
    expect(directionOn(comparison, 'run.kills')).toBe('down');
    // A band moved by less than its own width has not cleared the other one.
    expect(directionOn(comparison, 'run.score')).toBe('flat');
    // One row per reading and no reading twice, over every family the report
    // carries: the flat spreads, the per-line spreads and the phase spans.
    const named = comparison.readings.map((row) => row.reading);
    expect(new Set(named).size).toBe(named.length);
    expect(named).toEqual(expect.arrayContaining(Object.keys(left.spreads)));
    for (const [line, figures] of Object.entries(left.byLine)) {
      for (const figure of Object.keys(figures)) {
        expect(named).toContain(`byLine.${line}.${figure}`);
      }
    }
    for (const phase of Object.keys(left.phaseSpans)) {
      expect(named).toContain(`phaseSpans.${phase}`);
    }
    // And the two identities ride along, so a comparison says which two
    // instruments its halves were read through (ADR 0057).
    expect(comparison.left).toEqual(left.identity);
    expect(comparison.right).toEqual(right.identity);
  });

  it('reads flat until the bands clear each other by the separation row', () => {
    // Spec test 43. The separation is a data row rather than a compiled
    // constant, because it is a number that has to exist before it can be
    // measured (the standing no-arithmetic-as-rules rule, #39's approach).
    // Both cases below are placed off the row itself, so they keep saying what
    // they say when step 4 moves it; at the row's current value the case that
    // separates them is two bands that touch.
    const cleared = BAND_SEPARATION * BAND_WIDTH;
    const left = batchFrom(10, 20, 10);
    const touching = batchFrom(10 + BAND_WIDTH + cleared, 20, 10);
    const clear = batchFrom(10 + BAND_WIDTH + cleared + 1, 20, 10);

    expect(directionOn(compareBatches(left, touching), 'run.ticks')).toBe(
      'flat',
    );
    expect(directionOn(compareBatches(left, clear), 'run.ticks')).toBe('up');
    // Downward as well, because a separation that only held one way would let
    // every drop read as a drop and every rise need proof.
    expect(directionOn(compareBatches(touching, left), 'run.ticks')).toBe(
      'flat',
    );
    expect(directionOn(compareBatches(clear, left), 'run.ticks')).toBe('down');
    // What clears is the quartile band and not the whole range: one run out in
    // the tail is the thing a five-number summary exists to keep from deciding
    // an ordering (ADR 0053), so these two order even though their ranges lie
    // right across each other.
    const tailed = batchOfTicks([10, 11, 12, 1000]);
    const above = [0, 1, 2, 3].map(
      (offset) => 10 + BAND_WIDTH + cleared + 1 + offset,
    );
    expect(
      directionOn(compareBatches(tailed, batchOfTicks(above)), 'run.ticks'),
    ).toBe('up');
  });

  it('reads a reading only one batch carries as incomparable, not as flat', () => {
    // Module test 67. compareRuns.ts's own INCOMPARABLE is the precedent: a
    // reading one side has and the other does not is a fact about the two
    // batches, and reporting it as flat would say they agreed.
    const swallowing = (
      seed: number,
      swallows: number | null,
    ): MeasuredRun => ({
      seed,
      measurement: {
        ...BASE,
        tuning: {
          ...BASE.tuning,
          wakingSwallows: {
            span: swallows === null ? null : { from: 10, to: 90, swallows },
          },
        },
      },
    });
    const never = batchReportOf(ORIGIN, [
      swallowing(900, null),
      swallowing(901, null),
    ]);
    const opened = batchReportOf(ORIGIN, [
      swallowing(900, 3),
      swallowing(901, 5),
    ]);

    const comparison = compareBatches(never, opened);

    const reading = 'tuning.wakingSwallows.span';
    // The reading is genuinely on one side and not the other, or the row below
    // would be reading an absence on both.
    expect(never.spreads[reading]).toBe(undefined);
    expect(opened.spreads[reading].count).toBe(2);
    expect(directionOn(comparison, reading)).toBe('incomparable');
    const row = comparison.readings.find((one) => one.reading === reading);
    expect(row?.left).toBe(undefined);
    expect(row?.right).toEqual(opened.spreads[reading]);
  });

  it('reads flat on every row when the two batches are the same', () => {
    // Module test 68. The identity case: two batches of the same figures order
    // nothing, so every row is flat and none of them is incomparable.
    const left = batchFrom(10, 20, 30);
    const right = batchFrom(10, 20, 30);

    const comparison = compareBatches(left, right);

    // The rows exist to be flat, rather than an empty list passing by default:
    // every spread on the report is a row, per line and per phase included.
    expect(rowsOn(left)).toBeGreaterThan(0);
    expect(comparison.readings.length).toBe(rowsOn(left));
    expect(directionOn(comparison, 'run.ticks')).toBe('flat');
    const directions = new Set(comparison.readings.map((row) => row.direction));
    expect([...directions]).toEqual(['flat']);
  });
});

describe('the two corners read together', () => {
  it('reads agreed only where both corners show the same direction', () => {
    // Spec test 44. ADR 0053: "a finding is believed when the sharp and the
    // sloppy configurations agree on the ordering." A row where they differ
    // carries both directions rather than one of them, because which corner
    // saw what is the whole of what a split says.
    const sharp = compareBatches(batchFrom(10, 20, 10), batchFrom(20, 20, 10));
    const sloppy = compareBatches(batchFrom(10, 20, 10), batchFrom(20, 10, 10));

    const findings = readAcrossCorners(sharp, sloppy);

    const ticks = findings.find((one) => one.reading === 'run.ticks');
    expect(ticks).toEqual({
      reading: 'run.ticks',
      sharp: 'up',
      sloppy: 'up',
      agreement: 'agreed',
    });
    const kills = findings.find((one) => one.reading === 'run.kills');
    expect(kills).toEqual({
      reading: 'run.kills',
      sharp: 'flat',
      sloppy: 'down',
      agreement: 'split',
    });
    // Every reading either corner ordered is a finding, and no reading twice.
    const named = findings.map((one) => one.reading);
    expect(new Set(named).size).toBe(named.length);
    expect(named).toEqual(
      expect.arrayContaining(sharp.readings.map((row) => row.reading)),
    );
  });

  it('reads a reading only one corner ordered as incomparable at the other', () => {
    // A corner that never carried the reading said nothing about it, and
    // calling that flat would put a direction in a corner's mouth. It is the
    // same fourth direction module test 67 pins one batch against another.
    const sharp = compareBatches(batchFrom(10, 20, 10), batchFrom(20, 20, 10));
    const sloppy = compareBatches(batchFrom(10, 20, 10), batchFrom(20, 20, 10));
    const trimmed = {
      ...sloppy,
      readings: sloppy.readings.filter((row) => row.reading !== 'run.ticks'),
    };

    const findings = readAcrossCorners(sharp, trimmed);

    expect(findings.find((one) => one.reading === 'run.ticks')).toEqual({
      reading: 'run.ticks',
      sharp: 'up',
      sloppy: 'incomparable',
      agreement: 'split',
    });
  });
});
