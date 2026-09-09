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
import type { ConfigurationName } from '../configurations';
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

/** The same four runs under a named hand, which is what a corner is. */
const batchAs = (
  configuration: ConfigurationName,
  ticks: number,
  kills: number,
  score: number,
): BatchReport =>
  batchReportOf(
    { ...ORIGIN, configuration },
    [0, 1, 2, 3].map((offset) =>
      runOf(900 + offset, {
        ticks: ticks + offset,
        kills: kills + offset,
        score: score + offset,
      }),
    ),
  );

const batchUnder = (configuration: ConfigurationName, ticks: number) =>
  batchAs(configuration, ticks, 0, 0);

/** The same batch as though its tapes had been recorded against another build. */
const againstCommit = (
  report: BatchReport,
  commitHash: string,
): BatchReport => ({
  ...report,
  identity: { ...report.identity, commitHashes: [commitHash] },
});

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
            span:
              swallows === null
                ? null
                : { setPiece: 7, from: 10, to: 90, swallows },
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

  it('withholds every ordering when the two reports were read under two sets of definitions', () => {
    // The tech gate's finding: the comparison was handed two reports each
    // carrying a readings version and consulted neither, where compareRuns.ts
    // withholds every delta on a mismatch and says so on its output. Both
    // sides are real measurements taken under different definitions, so every
    // spread is shown and only the arithmetic between them is withheld.
    const left = batchFrom(10, 20, 10);
    const right = batchFrom(20, 20, 10);

    const comparison = compareBatches(left, {
      ...right,
      readingsVersion: right.readingsVersion + 1,
    });

    expect(comparison.mismatches).toEqual(['readingsVersion']);
    expect(comparison.readingsVersions).toEqual({
      left: left.readingsVersion,
      right: right.readingsVersion + 1,
    });
    for (const row of comparison.readings) {
      expect(row.direction, row.reading).toBe('withheld');
      expect(row.rank, row.reading).toBe(undefined);
    }
    // The values are all still there: what was withheld is the arithmetic.
    const ticks = comparison.readings.find(
      (row) => row.reading === 'run.ticks',
    );
    expect(ticks?.left?.summary.min).toBe(10);
    expect(ticks?.right?.summary.min).toBe(20);
  });

  it('withholds every ordering when the two batches were played by two hands', () => {
    // A hand changed between two batches compares two builds through two
    // instruments, which is the one thing the batch's grammar exists to
    // prevent (the record's section 8). Nothing said so in code until now.
    const comparison = compareBatches(
      batchUnder('steady-far', 10),
      batchUnder('shaky-short', 20),
    );

    expect(comparison.mismatches).toEqual(['configuration']);
    expect(directionOn(comparison, 'run.ticks')).toBe('withheld');
  });

  it('withholds every ordering when the two batches were played from two rigs', () => {
    // The rig is the other half of the instrument: a batch played from the
    // birthright and one played maxed are two starting conditions, and #107 is
    // the whole ticket about never banding two of those.
    const left = batchFrom(10, 20, 10);
    const right = batchFrom(20, 20, 10);

    const comparison = compareBatches(left, {
      ...right,
      identity: { ...right.identity, rigs: ['maxed'] },
    });

    expect(comparison.mismatches).toEqual(['rig']);
    expect(directionOn(comparison, 'run.ticks')).toBe('withheld');
  });

  it('carries a rank test over the raw samples beside every ordering', () => {
    // The band a direction is taken from is five numbers, and the tail the
    // report exists to keep is not in it. The rank test reads every value both
    // batches recorded; what it does not do is decide the direction, which is
    // still the two bands and the separation row.
    const comparison = compareBatches(
      batchOfTicks([10, 11, 12, 13]),
      batchOfTicks([20, 21, 22, 23]),
    );

    const ticks = comparison.readings.find(
      (row) => row.reading === 'run.ticks',
    );
    // Every one of the sixteen pairs is won by the right side.
    expect(ticks?.rank).toEqual({ left: 4, right: 4, u: 16, rankBiserial: 1 });
    expect(ticks?.direction).toBe('up');
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
    const sharp = compareBatches(
      batchAs('steady-far', 10, 20, 10),
      batchAs('steady-far', 20, 20, 10),
    );
    const sloppy = compareBatches(
      batchAs('shaky-short', 10, 20, 10),
      batchAs('shaky-short', 20, 10, 10),
    );

    const { findings, mismatches } = readAcrossCorners(sharp, sloppy);

    expect(mismatches).toEqual([]);
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

  it('withholds the agreement when the two corners were not played over the same two builds', () => {
    // ADR 0053's "believed only where the two corners agree" rests on the two
    // corners having read the same pair of builds. Handed one corner's before
    // and after against another pair, the agreement says nothing, so it is
    // withheld rather than printed as agreement.
    const sharp = compareBatches(
      batchAs('steady-far', 10, 20, 10),
      batchAs('steady-far', 20, 20, 10),
    );
    const sloppy = compareBatches(
      againstCommit(batchAs('shaky-short', 10, 20, 10), 'cc2286ef44'),
      batchAs('shaky-short', 20, 20, 10),
    );

    const { mismatches, findings } = readAcrossCorners(sharp, sloppy);

    expect(mismatches).toEqual(['leftBuild']);
    for (const finding of findings) {
      expect(finding.agreement, finding.reading).toBe('withheld');
    }
  });

  it('withholds the agreement when both corners are the same hand', () => {
    // Two corners are two hands. Handed one comparison twice, every row would
    // agree with itself and the rule that a finding is believed where the
    // corners agree would be satisfied by nothing at all.
    const sharp = compareBatches(
      batchAs('steady-far', 10, 20, 10),
      batchAs('steady-far', 20, 20, 10),
    );

    const { mismatches, findings } = readAcrossCorners(sharp, sharp);

    expect(mismatches).toEqual(['hand']);
    expect(findings.every((one) => one.agreement === 'withheld')).toBe(true);
  });

  it('withholds the agreement when either corner withheld its own arithmetic', () => {
    // A withheld comparison carries no direction to agree about, and two of
    // them would otherwise read as agreement on every row.
    const sharp = compareBatches(
      batchAs('steady-far', 10, 20, 10),
      batchAs('steady-far', 20, 20, 10),
    );
    const sloppyLeft = batchAs('shaky-short', 10, 20, 10);
    const sloppy = compareBatches(sloppyLeft, {
      ...batchAs('shaky-short', 20, 20, 10),
      readingsVersion: sloppyLeft.readingsVersion + 1,
    });

    const { mismatches } = readAcrossCorners(sharp, sloppy);

    expect(mismatches).toEqual(['comparison']);
  });

  it('reads a reading only one corner ordered as incomparable at the other', () => {
    // A corner that never carried the reading said nothing about it, and
    // calling that flat would put a direction in a corner's mouth. It is the
    // same fourth direction module test 67 pins one batch against another.
    const sharp = compareBatches(
      batchAs('steady-far', 10, 20, 10),
      batchAs('steady-far', 20, 20, 10),
    );
    const sloppy = compareBatches(
      batchAs('shaky-short', 10, 20, 10),
      batchAs('shaky-short', 20, 20, 10),
    );
    const trimmed = {
      ...sloppy,
      readings: sloppy.readings.filter((row) => row.reading !== 'run.ticks'),
    };

    const { findings } = readAcrossCorners(sharp, trimmed);

    expect(findings.find((one) => one.reading === 'run.ticks')).toEqual({
      reading: 'run.ticks',
      sharp: 'up',
      sloppy: 'incomparable',
      agreement: 'split',
    });
  });
});
