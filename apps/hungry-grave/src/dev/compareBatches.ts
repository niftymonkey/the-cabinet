// Two batches side by side: one ordering per reading, and never a target.

import type { BatchIdentity, BatchReport, Spread } from './batchReport';
import { rankComparisonOf } from './rankTest';
import type { RankComparison } from './rankTest';

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
 * Which way a reading went. Two of the five are not orderings at all, and
 * neither is an absence: a reading one batch carries and the other does not is
 * a fact about the two batches, on compareRuns.ts's own INCOMPARABLE
 * precedent, and one whose arithmetic was withheld is a fact about the two
 * instruments. Reporting either as flat would say they agreed.
 */
type Direction = 'up' | 'down' | 'flat' | 'incomparable' | 'withheld';

/**
 * What two batches would have to share for an ordering between them to mean
 * anything, and did not.
 *
 * The readings version is the definitions the two reports were computed under,
 * on compareRuns.ts's own rule. The configuration and the rig are the two
 * halves of the instrument the runs were read through: the record's section 8
 * rules that a hand changed between two batches compares two builds through
 * two instruments, and #107 rules the same of two starting conditions.
 */
type Mismatch = 'readingsVersion' | 'configuration' | 'rig';

interface ComparedSpread {
  readonly reading: string;
  readonly left: Spread | undefined;
  readonly right: Spread | undefined;
  readonly direction: Direction;
  /**
   * The two sides' own samples ordered against each other, where the
   * arithmetic stands and both sides carry a reading.
   *
   * It sits beside the direction and does not decide it: the direction is the
   * two quartile bands and the separation row, which is what the batch's own
   * done line was read with, and moving that is a judgement rather than a
   * repair (#39).
   */
  readonly rank: RankComparison | undefined;
}

// The definitions each side's readings were computed under (readingsVersion.ts).
interface ReadingsVersions {
  readonly left: number;
  readonly right: number;
}

interface BatchComparison {
  // The two batches' own identities, so a comparison says which two
  // instruments its halves were read through (ADR 0057).
  readonly left: BatchIdentity;
  readonly right: BatchIdentity;
  readonly readingsVersions: ReadingsVersions;
  // Empty means the two batches are comparable and every ordering below stands.
  readonly mismatches: readonly Mismatch[];
  readonly readings: readonly ComparedSpread[];
}

/**
 * Whether the two corners saw the same thing (ADR 0053), and the third is
 * neither: a corner pair that was not read over one pair of builds, or by two
 * different hands, has nothing to agree about.
 */
type Agreement = 'agreed' | 'split' | 'withheld';

/**
 * What the two corners would have to share for their agreement to mean
 * anything, and did not.
 *
 * The two builds are the pair the corners are read across. The hand is the
 * corner itself: handed one comparison twice, every row agrees with itself and
 * ADR 0053's rule is satisfied by nothing. A comparison that withheld its own
 * arithmetic carries no direction to agree about, which is the third.
 */
type CornerMismatch = 'leftBuild' | 'rightBuild' | 'hand' | 'comparison';

interface CornerFinding {
  readonly reading: string;
  readonly sharp: Direction;
  readonly sloppy: Direction;
  readonly agreement: Agreement;
}

// The two corners read together, and what stops them being read together.
interface CornersRead {
  // Empty means the agreement below stands.
  readonly mismatches: readonly CornerMismatch[];
  readonly findings: readonly CornerFinding[];
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

/** The values a spread kept, which is what a rank test reads. */
const valuesOf = (spread: Spread): number[] =>
  spread.samples.map((sample) => sample.value);

const comparedSpread = (
  reading: string,
  left: Spread | undefined,
  right: Spread | undefined,
): ComparedSpread => {
  if (left === undefined || right === undefined) {
    return { reading, left, right, direction: 'incomparable', rank: undefined };
  }
  return {
    reading,
    left,
    right,
    direction: directionBetween(left, right),
    rank: rankComparisonOf(valuesOf(left), valuesOf(right)),
  };
};

// One row with its arithmetic withheld and both its spreads kept, on compareRuns.ts's rule.
const withheldSpread = (row: ComparedSpread): ComparedSpread => ({
  reading: row.reading,
  left: row.left,
  right: row.right,
  direction: 'withheld',
  rank: undefined,
});

/**
 * The names every ordering below rests on, and which of them the two batches
 * do not share.
 *
 * A rig list is compared as a set of names rather than a list, because the
 * order the batch happened to meet its runs in is not a fact about the rigs.
 */
const mismatchesBetween = (
  left: BatchReport,
  right: BatchReport,
): Mismatch[] => {
  const mismatches: Mismatch[] = [];
  if (left.readingsVersion !== right.readingsVersion) {
    mismatches.push('readingsVersion');
  }
  if (left.identity.configuration !== right.identity.configuration) {
    mismatches.push('configuration');
  }
  if (named(left.identity.rigs) !== named(right.identity.rigs)) {
    mismatches.push('rig');
  }
  return mismatches;
};

// A set of names as one string, so two of them are compared in one place.
const named = (names: readonly (string | null)[]): string =>
  [...new Set(names)].sort().join(',');

/**
 * Two batches as one ordering per reading (ADR 0053).
 *
 * Nothing here states a target: a row carries the two spreads and which way the
 * reading went between them, and what that is worth is the reader's.
 *
 * It withholds every ordering and keeps every value when the two reports do
 * not share the definitions and the instrument they were read through, which
 * is compareRuns.ts's own rule for a readings-version mismatch widened to the
 * two facts a batch adds: the hand and the rig. Both sides are real
 * measurements; what cannot be believed is the arithmetic between them.
 */
const compareBatches = (
  left: BatchReport,
  right: BatchReport,
): BatchComparison => {
  const leftRows = spreadsOn(left);
  const rightRows = spreadsOn(right);
  const mismatches = mismatchesBetween(left, right);
  const readings = namesAcross(leftRows, rightRows).map((reading) =>
    comparedSpread(reading, leftRows.get(reading), rightRows.get(reading)),
  );
  return {
    left: left.identity,
    right: right.identity,
    readingsVersions: {
      left: left.readingsVersion,
      right: right.readingsVersion,
    },
    mismatches,
    readings: mismatches.length === 0 ? readings : readings.map(withheldSpread),
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
/**
 * What the two corners would have to share, and did not.
 *
 * The build pair is read off the two comparisons' own identities, so a corner
 * pair assembled from four folders says whether it is one pair of builds
 * rather than resting on whoever named the folders.
 */
const mismatchesAcross = (
  sharp: BatchComparison,
  sloppy: BatchComparison,
): CornerMismatch[] => {
  const mismatches: CornerMismatch[] = [];
  if (named(sharp.left.commitHashes) !== named(sloppy.left.commitHashes)) {
    mismatches.push('leftBuild');
  }
  if (named(sharp.right.commitHashes) !== named(sloppy.right.commitHashes)) {
    mismatches.push('rightBuild');
  }
  if (sharp.left.configuration === sloppy.left.configuration) {
    mismatches.push('hand');
  }
  if (sharp.mismatches.length + sloppy.mismatches.length !== 0) {
    mismatches.push('comparison');
  }
  return mismatches;
};

const readAcrossCorners = (
  sharp: BatchComparison,
  sloppy: BatchComparison,
): CornersRead => {
  const sharpRows = directionsIn(sharp);
  const sloppyRows = directionsIn(sloppy);
  const mismatches = mismatchesAcross(sharp, sloppy);
  const findings = namesAcross(sharpRows, sloppyRows).map(
    (reading): CornerFinding => {
      const inSharp = sharpRows.get(reading) ?? 'incomparable';
      const inSloppy = sloppyRows.get(reading) ?? 'incomparable';
      const agreement: Agreement = inSharp === inSloppy ? 'agreed' : 'split';
      return {
        reading,
        sharp: inSharp,
        sloppy: inSloppy,
        agreement: mismatches.length === 0 ? agreement : 'withheld',
      };
    },
  );
  return { mismatches, findings };
};

export { compareBatches, readAcrossCorners, BAND_SEPARATION };
export type {
  Agreement,
  BatchComparison,
  ComparedSpread,
  CornerFinding,
  CornerMismatch,
  CornersRead,
  Direction,
  Mismatch,
  ReadingsVersions,
};
