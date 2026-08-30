// Two measured runs, side by side, with no hand arithmetic.

import type { Distribution } from './framePerformance';
import type { Divergence, Measurement, Metrics, Refusal } from './measure';
import type { NumberRecord } from './numbersByName';
import { fieldSummary, perLineSummary } from './readings/fieldPerLine';
import { sizeSummary } from './readings/gravePath';
import { populationSummary } from './replayTallies';

/**
 * A value the side in question does not have. It is spelled rather than left as
 * a zero or a null, because zero is a reading and absence is not one: a key on
 * one side only shows its value there and this marker on the other, and never a
 * delta.
 */
const ABSENT = 'absent';

type Absent = typeof ABSENT;
type NumberOrAbsent = number | Absent;

/**
 * A delta withheld because the two sides' readings were computed under
 * different definitions.
 *
 * It is not ABSENT, and the two are never spelled the same. ABSENT says this
 * side has no such key. This says both sides have one, both values are real,
 * and subtracting them would be arithmetic across two different questions: the
 * same tape once read 366 ticks near the bottom edge and later 560, because
 * the reading's own definition changed underneath it.
 */
const INCOMPARABLE = 'incomparable';

type Incomparable = typeof INCOMPARABLE;

// What a delta can be: the arithmetic, no key to do it on, or no licence to.
type Delta = number | Absent | Incomparable;

interface NumberPair {
  readonly left: NumberOrAbsent;
  readonly right: NumberOrAbsent;
  // Arithmetic on two numbers that are both present, and nothing else.
  readonly delta: Delta;
}

/**
 * What comparing a reading means. A reading declares one of these for itself in
 * the table below; the runtime shape of its value decides nothing, so an array
 * of numbers is a per-tick series only when its reading says it is.
 */
type ComparisonMeaning =
  'scalar' | 'namedNumbers' | 'series' | 'list' | 'descriptive';

interface ScalarCompared {
  readonly reading: string;
  readonly meaning: 'scalar';
  readonly left: number;
  readonly right: number;
  readonly delta: Delta;
}

interface NamedNumbersCompared {
  readonly reading: string;
  readonly meaning: 'namedNumbers';
  // Walked over the union of both sides' names.
  readonly names: Readonly<Record<string, NumberPair>>;
}

interface SeriesCompared {
  readonly reading: string;
  readonly meaning: 'series';
  // The reading's own declared summary, never one inferred from its shape.
  readonly summary: Readonly<Record<string, NumberPair>>;
}

interface ListCompared {
  readonly reading: string;
  readonly meaning: 'list';
  readonly count: NumberPair;
  // Both sides carried whole. No entry is paired with another.
  readonly leftEntries: readonly unknown[];
  readonly rightEntries: readonly unknown[];
}

interface DescriptiveCompared {
  readonly reading: string;
  readonly meaning: 'descriptive';
  readonly left: unknown;
  readonly right: unknown;
}

type ComparedReading =
  | ScalarCompared
  | NamedNumbersCompared
  | SeriesCompared
  | ListCompared
  | DescriptiveCompared;

/**
 * What each side's readings mean, and whether the two agree.
 *
 * A witness verdict says a replay reproduced its recorded run. It says nothing
 * about whether two reports counted the same things the same way, which is the
 * question this answers.
 */
interface ReadingsVersions {
  readonly left: number;
  readonly right: number;
  // False withholds every delta below, and leaves every value standing.
  readonly matched: boolean;
}

interface ComparedRuns {
  readonly outcome: 'compared';
  readonly readingsVersions: ReadingsVersions;
  readonly readings: readonly ComparedReading[];
}

/**
 * One side of a refused comparison, carrying why it was not comparable rather
 * than only that it was not: a divergence names the checkpoint that disagreed
 * and how far the replay got, and a witness refusal names both versions. A
 * verified side has nothing wrong with it and carries its outcome alone; its
 * metrics are not repeated here, because a pair that could not be compared has
 * no comparison to put them in.
 */
type RefusedSide = { readonly outcome: 'verified' } | Divergence | Refusal;

/**
 * Neither side of a comparison is a verified replay, so there is nothing to
 * compare. Differing builds are not a reason: a commit hash is human-readable
 * metadata and never a fidelity gate, so the compare shows both and lets the
 * reader decide.
 */
interface ComparisonRefused {
  readonly outcome: 'refused';
  readonly left: RefusedSide;
  readonly right: RefusedSide;
}

type Comparison = ComparedRuns | ComparisonRefused;

/**
 * One reading and what comparing it means. A reading with no entry here is not
 * compared and not defaulted: it is a hole, and the guard beside this module
 * stays red until someone declares what comparing it means.
 */
interface DeclaredReading {
  // The reading's path in the report, which is what the guard walks.
  readonly reading: string;
  readonly meaning: ComparisonMeaning;
  readonly compare: (left: Metrics, right: Metrics) => ComparedReading;
}

const deltaOf = (left: NumberOrAbsent, right: NumberOrAbsent): Delta =>
  typeof left === 'number' && typeof right === 'number' ? right - left : ABSENT;

/**
 * One name, either side of which may not have it. Absence is carried as itself
 * and never as a zero, and a pair missing a side gets no delta.
 */
const pairOf = (
  left: number | undefined,
  right: number | undefined,
): NumberPair => {
  const here = left ?? ABSENT;
  const there = right ?? ABSENT;
  return { left: here, right: there, delta: deltaOf(here, there) };
};

const namesAcross = (left: NumberRecord, right: NumberRecord): string[] => [
  ...new Set([...Object.keys(left), ...Object.keys(right)]),
];

const namesCompared = (
  left: NumberRecord,
  right: NumberRecord,
): Record<string, NumberPair> => {
  const names: Record<string, NumberPair> = {};
  for (const name of namesAcross(left, right)) {
    names[name] = pairOf(left[name], right[name]);
  }
  return names;
};

const scalarReading = (
  reading: string,
  of: (report: Metrics) => number,
): DeclaredReading => ({
  reading,
  meaning: 'scalar',
  compare: (left, right) => {
    const here = of(left);
    const there = of(right);
    return {
      reading,
      meaning: 'scalar',
      left: here,
      right: there,
      delta: there - here,
    };
  },
});

const namedNumbersReading = (
  reading: string,
  of: (report: Metrics) => NumberRecord,
): DeclaredReading => ({
  reading,
  meaning: 'namedNumbers',
  compare: (left, right) => ({
    reading,
    meaning: 'namedNumbers',
    names: namesCompared(of(left), of(right)),
  }),
});

/**
 * A reading that declares itself a series over ticks, with the summary it
 * declares for itself. The summary is the reading's, never one inferred from
 * the value's shape, so two number arrays over ticks can be summarised
 * differently because they mean different things.
 */
const seriesReading = <Value>(
  reading: string,
  of: (report: Metrics) => Value,
  summarize: (value: Value) => NumberRecord,
): DeclaredReading => ({
  reading,
  meaning: 'series',
  compare: (left, right) => ({
    reading,
    meaning: 'series',
    summary: namesCompared(summarize(of(left)), summarize(of(right))),
  }),
});

const listReading = (
  reading: string,
  of: (report: Metrics) => readonly unknown[],
): DeclaredReading => ({
  reading,
  meaning: 'list',
  compare: (left, right) => {
    const here = of(left);
    const there = of(right);
    return {
      reading,
      meaning: 'list',
      count: pairOf(here.length, there.length),
      leftEntries: here,
      rightEntries: there,
    };
  },
});

const descriptiveReading = (
  reading: string,
  of: (report: Metrics) => unknown,
): DeclaredReading => ({
  reading,
  meaning: 'descriptive',
  compare: (left, right) => ({
    reading,
    meaning: 'descriptive',
    left: of(left),
    right: of(right),
  }),
});

// A timing distribution as names to numbers, since an interface carries no index signature.
const distributionNumbers = (distribution: Distribution): NumberRecord => ({
  count: distribution.count,
  min: distribution.min,
  max: distribution.max,
  mean: distribution.mean,
  p50: distribution.p50,
  p95: distribution.p95,
  p99: distribution.p99,
});

/**
 * Every reading a verified report carries, and what comparing each one means.
 *
 * Adding a reading is an explicit decision about what comparing it means, never
 * an accident of the type it happens to have. A reading with no entry here is a
 * hole, and comparisonDeclared.test.ts stays red until someone fills it.
 */
const READING_COMPARISONS: readonly DeclaredReading[] = [
  descriptiveReading('outcome', (report) => report.outcome),
  descriptiveReading('identity', (report) => report.identity),
  descriptiveReading('readingsVersion', (report) => report.readingsVersion),
  scalarReading('run.ticks', (report) => report.run.ticks),
  descriptiveReading('run.ending', (report) => report.run.ending),
  descriptiveReading('run.stop', (report) => report.run.stop),
  descriptiveReading('run.integrity', (report) => report.run.integrity),
  scalarReading('run.score', (report) => report.run.score),
  scalarReading('run.kills', (report) => report.run.kills),
  scalarReading(
    'run.checkpointsVerified',
    (report) => report.run.checkpointsVerified,
  ),
  scalarReading(
    'run.checkpointsUnreachable',
    (report) => report.run.checkpointsUnreachable,
  ),
  descriptiveReading('run.truncated', (report) => report.run.truncated),
  descriptiveReading('run.sealed', (report) => report.run.sealed),
  namedNumbersReading('damage', (report) => report.damage),
  namedNumbersReading('endLevels', (report) => report.endLevels),
  listReading('levelUps', (report) => report.levelUps),
  seriesReading(
    'mobsAlivePerTick',
    (report) => report.mobsAlivePerTick,
    populationSummary,
  ),
  scalarReading(
    'tuning.damageTaken.totalHits',
    (report) => report.tuning.damageTaken.totalHits,
  ),
  namedNumbersReading(
    'tuning.damageTaken.hits',
    (report) => report.tuning.damageTaken.hits,
  ),
  scalarReading(
    'tuning.damageTaken.scoreBleeds',
    (report) => report.tuning.damageTaken.scoreBleeds,
  ),
  scalarReading(
    'tuning.damageTaken.scoreBled',
    (report) => report.tuning.damageTaken.scoreBled,
  ),
  scalarReading(
    'tuning.damageTaken.weaponStrips',
    (report) => report.tuning.damageTaken.weaponStrips,
  ),
  scalarReading(
    'tuning.damageTaken.linesStripped',
    (report) => report.tuning.damageTaken.linesStripped,
  ),
  scalarReading(
    'tuning.damageTaken.seals',
    (report) => report.tuning.damageTaken.seals,
  ),
  namedNumbersReading(
    'tuning.engagements.engaged',
    (report) => report.tuning.engagements.engaged,
  ),
  namedNumbersReading(
    'tuning.engagements.killed',
    (report) => report.tuning.engagements.killed,
  ),
  namedNumbersReading(
    'tuning.engagements.escaped',
    (report) => report.tuning.engagements.escaped,
  ),
  namedNumbersReading(
    'tuning.engagements.aliveAtStop',
    (report) => report.tuning.engagements.aliveAtStop,
  ),
  namedNumbersReading(
    'tuning.engagements.timedKills',
    (report) => report.tuning.engagements.timedKills,
  ),
  namedNumbersReading(
    'tuning.engagements.ticksToKillMean',
    (report) => report.tuning.engagements.ticksToKillMean,
  ),
  namedNumbersReading(
    'tuning.engagements.ticksToKillMin',
    (report) => report.tuning.engagements.ticksToKillMin,
  ),
  namedNumbersReading(
    'tuning.engagements.ticksToKillMax',
    (report) => report.tuning.engagements.ticksToKillMax,
  ),
  namedNumbersReading(
    'tuning.engagements.hitsPerKill',
    (report) => report.tuning.engagements.hitsPerKill,
  ),
  namedNumbersReading(
    'tuning.engagements.hitsByLine',
    (report) => report.tuning.engagements.hitsByLine,
  ),
  namedNumbersReading(
    'tuning.engagements.fatalBlows',
    (report) => report.tuning.engagements.fatalBlows,
  ),
  seriesReading(
    'tuning.gravePath.sizePerTick',
    (report) => report.tuning.gravePath.sizePerTick,
    sizeSummary,
  ),
  scalarReading(
    'tuning.gravePath.ticksNearBottomEdge',
    (report) => report.tuning.gravePath.ticksNearBottomEdge,
  ),
  scalarReading(
    'tuning.gravePath.bottomEdgeMargin',
    (report) => report.tuning.gravePath.bottomEdgeMargin,
  ),
  seriesReading(
    'tuning.fieldPerLine.perLine',
    (report) => report.tuning.fieldPerLine.perLine,
    perLineSummary,
  ),
  seriesReading(
    'tuning.fieldPerLine.total',
    (report) => report.tuning.fieldPerLine.total,
    fieldSummary,
  ),
  namedNumbersReading(
    'tuning.freshnessPaid.swallows',
    (report) => report.tuning.freshnessPaid.swallows,
  ),
  namedNumbersReading(
    'tuning.freshnessPaid.meanPaid',
    (report) => report.tuning.freshnessPaid.meanPaid,
  ),
  namedNumbersReading(
    'tuning.freshnessPaid.minPaid',
    (report) => report.tuning.freshnessPaid.minPaid,
  ),
  namedNumbersReading(
    'tuning.freshnessPaid.maxPaid',
    (report) => report.tuning.freshnessPaid.maxPaid,
  ),
  listReading(
    'tuning.belchCadence.fires',
    (report) => report.tuning.belchCadence.fires,
  ),
  scalarReading(
    'tuning.belchCadence.ticksAtFull',
    (report) => report.tuning.belchCadence.ticksAtFull,
  ),
  scalarReading(
    'tuning.belchCadence.wasted',
    (report) => report.tuning.belchCadence.wasted,
  ),
  scalarReading(
    'tuning.dropLedger.spawned',
    (report) => report.tuning.dropLedger.spawned,
  ),
  scalarReading(
    'tuning.dropLedger.swallowed',
    (report) => report.tuning.dropLedger.swallowed,
  ),
  scalarReading(
    'tuning.dropLedger.lost',
    (report) => report.tuning.dropLedger.lost,
  ),
  scalarReading(
    'tuning.dropLedger.onFieldAtStop',
    (report) => report.tuning.dropLedger.onFieldAtStop,
  ),
  scalarReading(
    'tuning.territoryPatches.laid',
    (report) => report.tuning.territoryPatches.laid,
  ),
  scalarReading(
    'tuning.territoryPatches.scrolled',
    (report) => report.tuning.territoryPatches.scrolled,
  ),
  scalarReading(
    'tuning.territoryPatches.evicted',
    (report) => report.tuning.territoryPatches.evicted,
  ),
  scalarReading(
    'tuning.territoryPatches.emptied',
    (report) => report.tuning.territoryPatches.emptied,
  ),
  scalarReading(
    'tuning.territoryPatches.pulses',
    (report) => report.tuning.territoryPatches.pulses,
  ),
  scalarReading(
    'tuning.upfieldTraffic.lays',
    (report) => report.tuning.upfieldTraffic.lays,
  ),
  namedNumbersReading(
    'tuning.upfieldTraffic.perLay',
    (report) => report.tuning.upfieldTraffic.perLay,
  ),
  scalarReading(
    'tuning.upfieldTraffic.bandUnits',
    (report) => report.tuning.upfieldTraffic.bandUnits,
  ),
  scalarReading(
    'tuning.upfieldTraffic.lateralReach',
    (report) => report.tuning.upfieldTraffic.lateralReach,
  ),
  scalarReading('performance.frames', (report) => report.performance.frames),
  namedNumbersReading('performance.interval', (report) =>
    distributionNumbers(report.performance.interval),
  ),
  namedNumbersReading('performance.advance', (report) =>
    distributionNumbers(report.performance.advance),
  ),
  namedNumbersReading('performance.update', (report) =>
    distributionNumbers(report.performance.update),
  ),
  namedNumbersReading('performance.ticksPerFrame', (report) =>
    distributionNumbers(report.performance.ticksPerFrame),
  ),
  scalarReading(
    'performance.catchUpFrames',
    (report) => report.performance.catchUpFrames,
  ),
  listReading(
    'performance.debtOverTime',
    (report) => report.performance.debtOverTime,
  ),
  listReading(
    'performance.expensiveFrames',
    (report) => report.performance.expensiveFrames,
  ),
  listReading('recordedFaults', (report) => report.recordedFaults),
  listReading('readbackFaults', (report) => report.readbackFaults),
  descriptiveReading('provenance', (report) => report.provenance),
];

const pairWithheld = (pair: NumberPair): NumberPair => ({
  left: pair.left,
  right: pair.right,
  delta: INCOMPARABLE,
});

const pairsWithheld = (
  pairs: Readonly<Record<string, NumberPair>>,
): Record<string, NumberPair> =>
  Object.fromEntries(
    Object.entries(pairs).map(([name, pair]) => [name, pairWithheld(pair)]),
  );

/**
 * A comparison meaning no branch below answers, which the ComparedReading union
 * makes impossible: add a meaning without a withholding and this call stops
 * compiling, rather than letting that meaning keep its arithmetic across two
 * sets of definitions.
 */
const noWithholdingForMeaning = (reading: never): never => {
  throw new Error(`unhandled comparison meaning: ${JSON.stringify(reading)}`);
};

/**
 * One reading with its arithmetic withheld and both its values kept.
 *
 * A descriptive reading passes through untouched, because it never carried
 * arithmetic to withhold.
 */
const deltasWithheld = (reading: ComparedReading): ComparedReading => {
  if (reading.meaning === 'scalar') {
    return { ...reading, delta: INCOMPARABLE };
  }
  if (reading.meaning === 'namedNumbers') {
    return { ...reading, names: pairsWithheld(reading.names) };
  }
  if (reading.meaning === 'series') {
    return { ...reading, summary: pairsWithheld(reading.summary) };
  }
  if (reading.meaning === 'list') {
    return { ...reading, count: pairWithheld(reading.count) };
  }
  if (reading.meaning === 'descriptive') return reading;
  return noWithholdingForMeaning(reading);
};

// What was wrong with this side, or its outcome alone when nothing was.
const refusedSideOf = (measurement: Measurement): RefusedSide =>
  measurement.outcome === 'verified' ? { outcome: 'verified' } : measurement;

/**
 * Two measured runs, side by side. It is pure and replays nothing, so a
 * baseline survives a tuning change that stops its tape replaying (story 8).
 *
 * It refuses when either side is not a verified replay, because a divergence
 * and a refusal carry no metrics. It never refuses because the builds differ.
 *
 * A readings-version mismatch is not a refusal: both sides are real
 * measurements taken under different definitions, so every value is shown and
 * only the arithmetic between them is withheld.
 */
const compareRuns = (left: Measurement, right: Measurement): Comparison => {
  if (left.outcome !== 'verified' || right.outcome !== 'verified') {
    return {
      outcome: 'refused',
      left: refusedSideOf(left),
      right: refusedSideOf(right),
    };
  }
  const matched = left.readingsVersion === right.readingsVersion;
  const readings = READING_COMPARISONS.map((declared) =>
    declared.compare(left, right),
  );
  return {
    outcome: 'compared',
    readingsVersions: {
      left: left.readingsVersion,
      right: right.readingsVersion,
      matched,
    },
    readings: matched ? readings : readings.map(deltasWithheld),
  };
};

export { compareRuns, READING_COMPARISONS, ABSENT, INCOMPARABLE };
export type {
  Absent,
  ComparedReading,
  ComparedRuns,
  Comparison,
  ComparisonMeaning,
  ComparisonRefused,
  DeclaredReading,
  Delta,
  DescriptiveCompared,
  Incomparable,
  ListCompared,
  NamedNumbersCompared,
  NumberOrAbsent,
  NumberPair,
  ReadingsVersions,
  RefusedSide,
  ScalarCompared,
  SeriesCompared,
};
