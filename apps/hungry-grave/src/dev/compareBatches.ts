// Two batches side by side: one ordering per reading, and never a target.

import type { BatchIdentity, BatchReport, Spread } from './batchReport';

/**
 * How far two quartile bands must clear each other before a direction is
 * anything but flat, as a fraction of the wider band.
 *
 * An initial data row at zero, which means bands that merely fail to overlap:
 * it is a number that has to exist before it can be measured, so it is data and
 * the first two batches are what say what it should be (#39's approach, the
 * standing rule that a magnitude is a row and not a compiled constant).
 */
const BAND_SEPARATION = 0;

/**
 * Which way a reading went, and the fourth is not an absence: a reading one
 * batch carries and the other does not is a fact about the two batches, on
 * compareRuns.ts's own INCOMPARABLE precedent, and reporting it as flat would
 * say they agreed.
 */
type Direction = 'up' | 'down' | 'flat' | 'incomparable';

interface ComparedSpread {
  readonly reading: string;
  readonly left: Spread | undefined;
  readonly right: Spread | undefined;
  readonly direction: Direction;
}

interface BatchComparison {
  // The two batches' own identities, so a comparison says which two
  // instruments its halves were read through (ADR 0057).
  readonly left: BatchIdentity;
  readonly right: BatchIdentity;
  readonly readings: readonly ComparedSpread[];
}

// Whether the two corners saw the same thing (ADR 0053).
type Agreement = 'agreed' | 'split';

interface CornerFinding {
  readonly reading: string;
  readonly sharp: Direction;
  readonly sloppy: Direction;
  readonly agreement: Agreement;
}

// The quartile band, which is the interval a direction is about.
const bandWidth = (spread: Spread): number =>
  spread.summary.upperQuartile - spread.summary.lowerQuartile;

/**
 * How far the two bands have to clear each other before the reading moved: the
 * separation row against the wider of the two bands, so a reading whose runs
 * sit on top of each other is not ordered by a hair.
 */
const clearanceBetween = (left: Spread, right: Spread): number =>
  BAND_SEPARATION * Math.max(bandWidth(left), bandWidth(right));

// How far the second band sits above the first, negative where they overlap.
const gapAbove = (under: Spread, over: Spread): number =>
  over.summary.lowerQuartile - under.summary.upperQuartile;

/**
 * The ordering between two bands, and never a verdict about either of them.
 *
 * The clearance is read off the row rather than written here, so step 4's
 * tuning pass moves what counts as a move by moving one number (#39).
 */
const directionBetween = (left: Spread, right: Spread): Direction => {
  const cleared = clearanceBetween(left, right);
  if (gapAbove(left, right) > cleared) return 'up';
  if (gapAbove(right, left) > cleared) return 'down';
  return 'flat';
};

/**
 * Every spread a report carries, under one name apiece.
 *
 * The two families a report keys by something other than the reading's own
 * name carry that key in the row's name, so a row names one reading and one
 * thing it was split by, and no two families can collide on one name.
 */
const spreadsOn = (report: BatchReport): Map<string, Spread> => {
  const rows = new Map<string, Spread>();
  for (const [reading, spread] of Object.entries(report.spreads)) {
    rows.set(reading, spread);
  }
  for (const [line, figures] of Object.entries(report.byLine)) {
    if (figures === undefined) continue;
    for (const [figure, spread] of Object.entries(figures)) {
      rows.set(`byLine.${line}.${figure}`, spread);
    }
  }
  for (const [phase, spread] of Object.entries(report.phaseSpans)) {
    if (spread === undefined) continue;
    rows.set(`phaseSpans.${phase}`, spread);
  }
  return rows;
};

/**
 * Every name either side named, the left side's order first, so a comparison
 * reads down the left batch and then over whatever only the right one carried.
 */
const namesAcross = (
  left: ReadonlyMap<string, unknown>,
  right: ReadonlyMap<string, unknown>,
): string[] => [
  ...left.keys(),
  ...[...right.keys()].filter((name) => !left.has(name)),
];

const comparedSpread = (
  reading: string,
  left: Spread | undefined,
  right: Spread | undefined,
): ComparedSpread => ({
  reading,
  left,
  right,
  direction:
    left === undefined || right === undefined
      ? 'incomparable'
      : directionBetween(left, right),
});

/**
 * Two batches as one ordering per reading (ADR 0053).
 *
 * Nothing here states a target: a row carries the two spreads and which way the
 * reading went between them, and what that is worth is the reader's.
 */
const compareBatches = (
  left: BatchReport,
  right: BatchReport,
): BatchComparison => {
  const leftRows = spreadsOn(left);
  const rightRows = spreadsOn(right);
  return {
    left: left.identity,
    right: right.identity,
    readings: namesAcross(leftRows, rightRows).map((reading) =>
      comparedSpread(reading, leftRows.get(reading), rightRows.get(reading)),
    ),
  };
};

const directionsIn = (comparison: BatchComparison): Map<string, Direction> =>
  new Map(comparison.readings.map((row) => [row.reading, row.direction]));

/**
 * The two corners' comparisons read together: a row reads agreed only where
 * both show the same direction, and split otherwise, carrying both directions
 * rather than one of them (ADR 0053's believed-when-they-agree, as the report's
 * own grammar).
 *
 * A reading only one corner ordered is incomparable at the other, on module
 * test 67's own terms: that corner said nothing about it, and calling it flat
 * would put a direction in its mouth. Two corners that both read a reading
 * incomparable agree that neither could order it, which is a fact about the
 * four batches and not a finding about the game; the direction beside the
 * agreement is what says which of the two an agreed row is.
 */
const readAcrossCorners = (
  sharp: BatchComparison,
  sloppy: BatchComparison,
): readonly CornerFinding[] => {
  const sharpRows = directionsIn(sharp);
  const sloppyRows = directionsIn(sloppy);
  return namesAcross(sharpRows, sloppyRows).map((reading) => {
    const inSharp = sharpRows.get(reading) ?? 'incomparable';
    const inSloppy = sloppyRows.get(reading) ?? 'incomparable';
    return {
      reading,
      sharp: inSharp,
      sloppy: inSloppy,
      agreement: inSharp === inSloppy ? 'agreed' : 'split',
    };
  });
};

export { compareBatches, readAcrossCorners, BAND_SEPARATION };
export type {
  Agreement,
  BatchComparison,
  ComparedSpread,
  CornerFinding,
  Direction,
};
