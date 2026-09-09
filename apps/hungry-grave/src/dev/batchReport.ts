// What a batch of harness runs says: one spread per reading (ADR 0053, #98).

import { WEAPON_LINES } from '../game/lines/roster';
import type { WeaponLine } from '../game/lines/roster';
import { MOB_TYPES, MOB_TYPE_NAMES } from '../game/mobs';
import { PHASES } from '../game/stage/stage';
import type { PhaseName } from '../game/stage/stage';
import type { ConfigurationName } from './configurations';
import type { Measurement, Metrics } from './measure';
import type { NumberRecord } from './numbersByName';
import { ledgerByLineNumbers } from './readings/dropLedger';
import type { SectionSpan } from './readings/sectionTimeline';
import { READINGS_VERSION } from './readingsVersion';
import { fiveNumbersOf, greatestOf } from './seriesSummary';
import type { FiveNumbers } from './seriesSummary';

/**
 * How many seeds one batch walks, initial (ADR 0053: seeds and never repeats).
 *
 * The floor is 40, because both published correlations that found the tail most
 * predictive read it at the top five per cent, and below 40 seeds the top five
 * per cent is a single run, which is an outlier rather than a tail. Step 4's
 * tuning pass (#39) is what moves it.
 */
const BATCH_SEEDS = 48;

/**
 * The widths of the mob types this build fields, so the grave's size spread is
 * read as a scale rather than as a bare number.
 *
 * It is a fact about the build and not a reading, so it rides on the batch's
 * identity and the ratio is the reader's to take: the report puts the two
 * numbers side by side and states nothing about the distance between them.
 */
const MOB_WIDTHS: Readonly<Record<string, number>> = Object.fromEntries(
  MOB_TYPE_NAMES.map((type) => [type, MOB_TYPES[type].halfWidth * 2]),
);

// The bosses a belch can be spent in front of, which is where #37's story 12 is.
const BOSS_PHASES: readonly PhaseName[] = ['banshee', 'undertaker'];

// The phase a run has to enter for the batch to count it as having reached.
const DEEPEST_PHASE: PhaseName = 'undertaker';

// The three things a batch is named by, plus the stamp the command took once.
interface BatchOrigin {
  readonly configuration: ConfigurationName;
  readonly firstSeed: number;
  readonly seeds: number;
  readonly recordedAt: number;
}

/**
 * What a batch was, so the folder's name is a convenience and the report is the
 * record (ADR 0057).
 *
 * The commit hashes and the mob widths are read off the runs and off the build
 * rather than taken from the caller: a batch that spans two commits says so
 * because its tapes say so, not because whoever ran it remembered.
 */
interface BatchIdentity {
  readonly configuration: ConfigurationName;
  readonly firstSeed: number;
  readonly seeds: number;
  readonly recordedAt: number;
  readonly commitHashes: readonly string[];
  readonly mobWidths: Readonly<Record<string, number>>;
}

// One reading's spread across a batch, with the tail named rather than banded.
interface Spread {
  readonly count: number;
  readonly summary: FiveNumbers;
  // The seeds behind the two extremes, so a tail is a run somebody can re-record.
  readonly minSeed: number;
  readonly maxSeed: number;
}

// A run whose tape did not verify, kept in the report rather than dropped (ADR 0019).
interface UnverifiedRun {
  readonly seed: number;
  readonly outcome: string;
}

interface BatchReport {
  readonly identity: BatchIdentity;
  readonly readingsVersion: number;
  readonly verified: number;
  readonly unverified: readonly UnverifiedRun[];
  /**
   * The seeds whose runs reached no ending, so a rate is never read over them
   * unnoticed (#118).
   *
   * A run the harness stopped at its own tick ceiling proved its tape and
   * finished nothing, so every rate below counts it as the outcome it did not
   * reach: a batch of forty-eight with one of these is forty-seven answers and
   * an unknown. Its figures stay in the spreads, because they are figures a
   * tape supports; what the reader is owed is the seed, which is the same thing
   * ADR 0019 gives for a tape that could not prove itself.
   */
  readonly unfinished: readonly number[];
  // Every reading the table declares as a spread, by its declared name.
  readonly spreads: Readonly<Record<string, Spread>>;
  // Every reading the table declares as per line, by line and then by name.
  readonly byLine: Readonly<
    Partial<Record<WeaponLine, Record<string, Spread>>>
  >;
  // Readings that are a name rather than a number, counted: endings, stops, the reach.
  readonly counts: Readonly<Record<string, Readonly<Record<string, number>>>>;
  // Each phase's span across the batch, which is ADR 0049's clock as a distribution.
  readonly phaseSpans: Readonly<Partial<Record<PhaseName, Spread>>>;
}

/**
 * How one reading on a verified report becomes a figure on a batch. Naming the
 * not-reduced kind is what gives the declaration guard teeth: a reading nobody
 * thought about is a hole, and a reading deliberately carried whole says so.
 */
type BatchReduction =
  // A number per run, printed as five numbers with the extreme seeds beside it.
  | 'spread'
  // A number per run under each weapon line, printed as one spread per line.
  | 'perLine'
  // Numbers under names per run; a name that is a line's is filed under it.
  | 'byName'
  // Names per run, counted rather than spread, because a name has no quartile.
  | 'count'
  // A series per run, reduced to that run's peak and then spread.
  | 'peak'
  // The section timeline, which a batch reads twice: the spans and the reach.
  | 'phaseSpans'
  // Carried whole rather than reduced, with the reason it is.
  | 'notReduced';

interface SpreadDeclaration {
  readonly reading: string;
  readonly reduction: 'spread';
  // Absent when the run cannot support the reading, which keeps it out of the spread.
  readonly numberOf: (report: Metrics) => number | undefined;
}

interface NumbersDeclaration {
  readonly reading: string;
  readonly reduction: 'perLine' | 'byName';
  readonly numbersOf: (report: Metrics) => NumberRecord;
}

interface CountDeclaration {
  readonly reading: string;
  readonly reduction: 'count';
  readonly namesOf: (report: Metrics) => readonly string[];
}

interface PeakDeclaration {
  readonly reading: string;
  readonly reduction: 'peak';
  readonly seriesOf: (report: Metrics) => readonly number[];
}

interface PhaseSpansDeclaration {
  readonly reading: string;
  readonly reduction: 'phaseSpans';
}

interface NotReducedDeclaration {
  readonly reading: string;
  readonly reduction: 'notReduced';
  readonly why: string;
}

/**
 * One reading's row in the table. Every kind carries how the reading is read
 * off a report, so nothing here infers a meaning from the shape a value happens
 * to have, which is what the comparison table's own guard was written against.
 */
type DeclaredBatchReading =
  | SpreadDeclaration
  | NumbersDeclaration
  | CountDeclaration
  | PeakDeclaration
  | PhaseSpansDeclaration
  | NotReducedDeclaration;

const spreadReading = (
  reading: string,
  numberOf: (report: Metrics) => number | undefined,
): SpreadDeclaration => ({ reading, reduction: 'spread', numberOf });

const perLineReading = (
  reading: string,
  numbersOf: (report: Metrics) => NumberRecord,
): NumbersDeclaration => ({ reading, reduction: 'perLine', numbersOf });

const byNameReading = (
  reading: string,
  numbersOf: (report: Metrics) => NumberRecord,
): NumbersDeclaration => ({ reading, reduction: 'byName', numbersOf });

const countReading = (
  reading: string,
  namesOf: (report: Metrics) => readonly string[],
): CountDeclaration => ({ reading, reduction: 'count', namesOf });

const peakReading = (
  reading: string,
  seriesOf: (report: Metrics) => readonly number[],
): PeakDeclaration => ({ reading, reduction: 'peak', seriesOf });

const notReduced = (reading: string, why: string): NotReducedDeclaration => ({
  reading,
  reduction: 'notReduced',
  why,
});

// How many of this run's belches landed inside the span, by the span's own ends.
const firesInside = (report: Metrics, span: SectionSpan): number =>
  report.tuning.belchCadence.fires.filter(
    (fire) =>
      fire.tick >= span.from && (span.to === null || fire.tick < span.to),
  ).length;

/**
 * The belch's own weight, as the whole run's fires and the fires inside each
 * boss's span (#39, the record's section 4 as amended).
 *
 * A count and never one belch: #37's story 12 is one belch plus play beating
 * the Undertaker, and what the count says is whether the hand ever had a
 * belch's worth to spend there. How much charge was carried into the span is
 * the half of that reading no tape carries today, because nothing records the
 * reservoir per tick.
 */
const belchesByBoss = (report: Metrics): NumberRecord => {
  const names: Record<string, number> = {
    run: report.tuning.belchCadence.fires.length,
  };
  for (const span of report.tuning.sectionTimeline.spans) {
    if (!BOSS_PHASES.includes(span.phase)) continue;
    names[span.phase] = firesInside(report, span);
  }
  return names;
};

/**
 * Each line's own peak on the field, which is the storm by line (ADR 0014,
 * the record's section 4 as amended). Mob fire's peak is declared beside it and
 * is never counted as the storm.
 */
const stormPeaks = (report: Metrics): NumberRecord => {
  const peaks: Record<string, number | undefined> = {};
  for (const [line, series] of Object.entries(
    report.tuning.fieldPerLine.perLine,
  )) {
    peaks[line] = greatestOf(series ?? []);
  }
  return peaks;
};

/**
 * Which slot went in, under the site the offer stood at (#98's second comment).
 *
 * An offer the tape stopped on and one that scrolled away share the untaken
 * row: both carry a null slot and only the passed list separates them, which is
 * slice 2's own finding. The report needs the takes, so no field was added for
 * a difference nothing reads.
 */
const takesBySite = (report: Metrics): readonly string[] =>
  report.tuning.offerChoices.choices.map((choice) =>
    choice.slot === null
      ? `${choice.site}.untaken`
      : `${choice.site}.${choice.slot}`,
  );

/**
 * Every reading a verified report carries, and how a batch reduces it.
 *
 * The same shape as READING_COMPARISONS (`compareRuns.ts`): adding a reading is
 * an explicit decision about how a batch reads it, never an accident of the
 * type it happens to have, and a reading with no entry here is a hole that
 * batchReadingDeclared.test.ts keeps red.
 */
const BATCH_READINGS: readonly DeclaredBatchReading[] = [
  notReduced('outcome', 'the verified tally and the unverified list carry it'),
  notReduced('identity', "the batch's own identity names every commit"),
  notReduced('readingsVersion', 'the batch report carries one of its own'),
  spreadReading('run.ticks', (report) => report.run.ticks),
  countReading('run.ending', (report) => [report.run.ending ?? 'none']),
  countReading('run.stop', (report) => [report.run.stop]),
  countReading('run.integrity', (report) => [report.run.integrity ?? 'none']),
  spreadReading('run.score', (report) => report.run.score),
  spreadReading('run.kills', (report) => report.run.kills),
  spreadReading(
    'run.checkpointsVerified',
    (report) => report.run.checkpointsVerified,
  ),
  spreadReading(
    'run.checkpointsUnreachable',
    (report) => report.run.checkpointsUnreachable,
  ),
  countReading('run.truncated', (report) => [String(report.run.truncated)]),
  countReading('run.sealed', (report) => [String(report.run.sealed)]),
  // The lines plus the belch's own arm, so the four go under their lines and
  // the belch's goes under its own name.
  byNameReading('damage', (report) => report.damage),
  perLineReading('endLevels', (report) => report.endLevels),
  // The rungs the run bought. The rows have no index to pair across two runs,
  // which is why the comparison table calls it a list; what a batch reads off a
  // list is how long it is.
  spreadReading('levelUps', (report) => report.levelUps.length),
  peakReading('mobsAlivePerTick', (report) => report.mobsAlivePerTick),
  peakReading('mobFireAlivePerTick', (report) => report.mobFireAlivePerTick),
  spreadReading(
    'tuning.damageTaken.totalHits',
    (report) => report.tuning.damageTaken.totalHits,
  ),
  byNameReading(
    'tuning.damageTaken.hits',
    (report) => report.tuning.damageTaken.hits,
  ),
  spreadReading(
    'tuning.damageTaken.scoreBleeds',
    (report) => report.tuning.damageTaken.scoreBleeds,
  ),
  spreadReading(
    'tuning.damageTaken.scoreBled',
    (report) => report.tuning.damageTaken.scoreBled,
  ),
  spreadReading(
    'tuning.damageTaken.weaponStrips',
    (report) => report.tuning.damageTaken.weaponStrips,
  ),
  spreadReading(
    'tuning.damageTaken.linesStripped',
    (report) => report.tuning.damageTaken.linesStripped,
  ),
  spreadReading(
    'tuning.damageTaken.seals',
    (report) => report.tuning.damageTaken.seals,
  ),
  byNameReading(
    'tuning.engagements.engaged',
    (report) => report.tuning.engagements.engaged,
  ),
  byNameReading(
    'tuning.engagements.killed',
    (report) => report.tuning.engagements.killed,
  ),
  byNameReading(
    'tuning.engagements.escaped',
    (report) => report.tuning.engagements.escaped,
  ),
  byNameReading(
    'tuning.engagements.aliveAtStop',
    (report) => report.tuning.engagements.aliveAtStop,
  ),
  byNameReading(
    'tuning.engagements.timedKills',
    (report) => report.tuning.engagements.timedKills,
  ),
  byNameReading(
    'tuning.engagements.ticksToKillMean',
    (report) => report.tuning.engagements.ticksToKillMean,
  ),
  byNameReading(
    'tuning.engagements.ticksToKillMin',
    (report) => report.tuning.engagements.ticksToKillMin,
  ),
  byNameReading(
    'tuning.engagements.ticksToKillMax',
    (report) => report.tuning.engagements.ticksToKillMax,
  ),
  byNameReading(
    'tuning.engagements.hitsPerKill',
    (report) => report.tuning.engagements.hitsPerKill,
  ),
  byNameReading(
    'tuning.engagements.hitsByLine',
    (report) => report.tuning.engagements.hitsByLine,
  ),
  byNameReading(
    'tuning.engagements.fatalBlows',
    (report) => report.tuning.engagements.fatalBlows,
  ),
  // The grave at its largest, which is the figure the mob widths sit beside.
  peakReading(
    'tuning.gravePath.sizePerTick',
    (report) => report.tuning.gravePath.sizePerTick,
  ),
  spreadReading(
    'tuning.gravePath.ticksNearBottomEdge',
    (report) => report.tuning.gravePath.ticksNearBottomEdge,
  ),
  spreadReading(
    'tuning.gravePath.bottomEdgeMargin',
    (report) => report.tuning.gravePath.bottomEdgeMargin,
  ),
  // The spiral-versus-comeback split: a visit on its own says only that the run
  // reached the floor, and what followed is the reading beside it.
  spreadReading(
    'tuning.gravePath.floorVisits',
    (report) => report.tuning.gravePath.floorVisits,
  ),
  spreadReading(
    'tuning.gravePath.floorRecoveries',
    (report) => report.tuning.gravePath.floorRecoveries,
  ),
  perLineReading('tuning.fieldPerLine.perLine', stormPeaks),
  peakReading(
    'tuning.fieldPerLine.total',
    (report) => report.tuning.fieldPerLine.total,
  ),
  byNameReading(
    'tuning.freshnessPaid.swallows',
    (report) => report.tuning.freshnessPaid.swallows,
  ),
  byNameReading(
    'tuning.freshnessPaid.meanPaid',
    (report) => report.tuning.freshnessPaid.meanPaid,
  ),
  byNameReading(
    'tuning.freshnessPaid.minPaid',
    (report) => report.tuning.freshnessPaid.minPaid,
  ),
  byNameReading(
    'tuning.freshnessPaid.maxPaid',
    (report) => report.tuning.freshnessPaid.maxPaid,
  ),
  byNameReading('tuning.belchCadence.fires', belchesByBoss),
  spreadReading(
    'tuning.belchCadence.ticksAtFull',
    (report) => report.tuning.belchCadence.ticksAtFull,
  ),
  spreadReading(
    'tuning.belchCadence.wasted',
    (report) => report.tuning.belchCadence.wasted,
  ),
  spreadReading(
    'tuning.dropLedger.spawned',
    (report) => report.tuning.dropLedger.spawned,
  ),
  spreadReading(
    'tuning.dropLedger.swallowed',
    (report) => report.tuning.dropLedger.swallowed,
  ),
  spreadReading(
    'tuning.dropLedger.passed',
    (report) => report.tuning.dropLedger.passed,
  ),
  spreadReading(
    'tuning.dropLedger.lost',
    (report) => report.tuning.dropLedger.lost,
  ),
  spreadReading(
    'tuning.dropLedger.onFieldAtStop',
    (report) => report.tuning.dropLedger.onFieldAtStop,
  ),
  // The one reading this step widened by line, which is #98's acceptance line.
  perLineReading('tuning.dropLedger.byLine', (report) =>
    ledgerByLineNumbers(report.tuning.dropLedger.byLine),
  ),
  countReading('tuning.offerChoices.choices', takesBySite),
  spreadReading(
    'tuning.offerChoices.bankedWhileStanding',
    (report) => report.tuning.offerChoices.bankedWhileStanding,
  ),
  // Absent on a run that never opened the Waking, on the same terms as the
  // reading itself: there is no span for the swallows to have been inside.
  spreadReading(
    'tuning.wakingSwallows.span',
    (report) => report.tuning.wakingSwallows.span?.swallows,
  ),
  spreadReading(
    'tuning.territoryPatches.laid',
    (report) => report.tuning.territoryPatches.laid,
  ),
  spreadReading(
    'tuning.territoryPatches.scrolled',
    (report) => report.tuning.territoryPatches.scrolled,
  ),
  spreadReading(
    'tuning.territoryPatches.evicted',
    (report) => report.tuning.territoryPatches.evicted,
  ),
  spreadReading(
    'tuning.territoryPatches.emptied',
    (report) => report.tuning.territoryPatches.emptied,
  ),
  spreadReading(
    'tuning.territoryPatches.pulses',
    (report) => report.tuning.territoryPatches.pulses,
  ),
  spreadReading(
    'tuning.territoryControl.crossings',
    (report) => report.tuning.territoryControl.crossings.length,
  ),
  byNameReading('tuning.territoryControl.dwellByEnd.death', (report) => ({
    ...report.tuning.territoryControl.dwellByEnd.death,
  })),
  byNameReading('tuning.territoryControl.dwellByEnd.escape', (report) => ({
    ...report.tuning.territoryControl.dwellByEnd.escape,
  })),
  byNameReading('tuning.territoryControl.dwellByEnd.closed', (report) => ({
    ...report.tuning.territoryControl.dwellByEnd.closed,
  })),
  spreadReading(
    'tuning.territoryControl.unfinishedAtStop',
    (report) => report.tuning.territoryControl.unfinishedAtStop,
  ),
  peakReading(
    'tuning.territoryControl.pulseIntervals',
    (report) => report.tuning.territoryControl.pulseIntervals,
  ),
  peakReading(
    'tuning.groundHeld.fraction',
    (report) => report.tuning.groundHeld.fraction,
  ),
  spreadReading(
    'tuning.repel.tolls',
    (report) => report.tuning.repel.tolls.length,
  ),
  spreadReading(
    'tuning.repel.totalShoves',
    (report) => report.tuning.repel.totalShoves,
  ),
  spreadReading(
    'tuning.repel.totalDistance',
    (report) => report.tuning.repel.totalDistance,
  ),
  spreadReading(
    'tuning.upfieldTraffic.lays',
    (report) => report.tuning.upfieldTraffic.lays,
  ),
  byNameReading(
    'tuning.upfieldTraffic.perLay',
    (report) => report.tuning.upfieldTraffic.perLay,
  ),
  spreadReading(
    'tuning.upfieldTraffic.bandUnits',
    (report) => report.tuning.upfieldTraffic.bandUnits,
  ),
  spreadReading(
    'tuning.upfieldTraffic.lateralReach',
    (report) => report.tuning.upfieldTraffic.lateralReach,
  ),
  { reading: 'tuning.sectionTimeline.spans', reduction: 'phaseSpans' },
  notReduced(
    'performance',
    'a harness tape carries no frame rows at all, so there is nothing on it to reduce; a batch over a person tape is where these get a reduction (#100)',
  ),
  spreadReading('recordedFaults', (report) => report.recordedFaults.length),
  spreadReading('readbackFaults', (report) => report.readbackFaults.length),
  notReduced(
    'provenance',
    "the hand is the batch's own configuration and every harness run carries the same exclusions",
  ),
];

// One run's answer to one reading, kept with its seed so a tail can be named.
interface Sample {
  readonly seed: number;
  readonly value: number;
}

type Samples = Record<string, Sample[]>;

// Everything the walk over the runs collects, before any of it is summarised.
interface Collected {
  readonly spreads: Samples;
  readonly byLine: Partial<Record<WeaponLine, Samples>>;
  readonly counts: Record<string, Record<string, number>>;
  readonly phases: Partial<Record<PhaseName, Sample[]>>;
  readonly commitHashes: Set<string>;
}

const collected = (): Collected => ({
  spreads: {},
  byLine: {},
  counts: {},
  phases: {},
  commitHashes: new Set(),
});

const addSample = (samples: Samples, name: string, sample: Sample): void => {
  const held = samples[name];
  if (held === undefined) samples[name] = [sample];
  else held.push(sample);
};

const addCount = (acc: Collected, reading: string, name: string): void => {
  const held = acc.counts[reading] ?? {};
  acc.counts[reading] = held;
  held[name] = (held[name] ?? 0) + 1;
};

// The weapon line this name belongs to, or nothing when it names something else.
const lineNamed = (name: string): WeaponLine | undefined =>
  WEAPON_LINES.find((line) => line === name);

/**
 * Files one named figure where it belongs: under the weapon line its name
 * begins with, or flat under the reading and the name when the name is not a
 * line's, which is what the belch's own arm is.
 */
const fileFigure = (
  acc: Collected,
  reading: string,
  name: string,
  sample: Sample,
): void => {
  const [head, ...rest] = name.split('.');
  const line = lineNamed(head);
  if (line === undefined) {
    addSample(acc.spreads, `${reading}.${name}`, sample);
    return;
  }
  const under = acc.byLine[line] ?? {};
  acc.byLine[line] = under;
  const figure = rest.length === 0 ? reading : `${reading}.${rest.join('.')}`;
  addSample(under, figure, sample);
};

/**
 * Every figure a named-numbers reading answers with. A perLine reading whose
 * name is not a line's is a bug in the table rather than a figure to file
 * somewhere else, so it fails loudly.
 */
const fileNumbers = (
  acc: Collected,
  declared: NumbersDeclaration,
  seed: number,
  report: Metrics,
): void => {
  for (const [name, value] of Object.entries(declared.numbersOf(report))) {
    if (value === undefined) continue;
    const head = name.split('.')[0];
    if (declared.reduction === 'perLine' && lineNamed(head) === undefined) {
      throw new Error(`${declared.reading} is per line and ${name} is no line`);
    }
    fileFigure(acc, declared.reading, name, { seed, value });
  }
};

// Each closed span's length, and whether the run reached the deepest phase.
const fileTimeline = (acc: Collected, seed: number, report: Metrics): void => {
  let reached = 'stopped short';
  for (const span of report.tuning.sectionTimeline.spans) {
    if (span.phase === DEEPEST_PHASE) reached = 'reached';
    // A phase still live when the tape stopped held no span anybody can read.
    if (span.to === null) continue;
    const held = acc.phases[span.phase] ?? [];
    acc.phases[span.phase] = held;
    held.push({ seed, value: span.to - span.from });
  }
  addCount(acc, 'reach', reached);
};

// One verified run, offered to every declared reading in turn.
const collectRun = (acc: Collected, seed: number, report: Metrics): void => {
  acc.commitHashes.add(report.identity.commitHash);
  for (const declared of BATCH_READINGS) {
    if (declared.reduction === 'notReduced') continue;
    if (declared.reduction === 'phaseSpans') {
      fileTimeline(acc, seed, report);
    } else if (declared.reduction === 'count') {
      for (const name of declared.namesOf(report)) {
        addCount(acc, declared.reading, name);
      }
    } else if (declared.reduction === 'peak') {
      const peak = greatestOf(declared.seriesOf(report));
      if (peak !== undefined) {
        addSample(acc.spreads, declared.reading, { seed, value: peak });
      }
    } else if (declared.reduction === 'spread') {
      const value = declared.numberOf(report);
      if (value !== undefined) {
        addSample(acc.spreads, declared.reading, { seed, value });
      }
    } else {
      fileNumbers(acc, declared, seed, report);
    }
  }
};

/**
 * The seed that produced this value. A value taken off these samples is in
 * them, so anything else is a bug in this module rather than a reading with a
 * hole in it.
 */
const seedOf = (samples: readonly Sample[], value: number): number => {
  for (const sample of samples) {
    if (sample.value === value) return sample.seed;
  }
  throw new Error(`no run in the batch produced ${value}`);
};

// Absent for no samples at all, because a batch with no run has nothing to summarise.
const spreadOf = (samples: readonly Sample[]): Spread | undefined => {
  const summary = fiveNumbersOf(samples.map((sample) => sample.value));
  if (summary === undefined) return undefined;
  return {
    count: samples.length,
    summary,
    minSeed: seedOf(samples, summary.min),
    maxSeed: seedOf(samples, summary.max),
  };
};

const spreadsOf = (samples: Samples): Record<string, Spread> => {
  const spreads: Record<string, Spread> = {};
  for (const [name, held] of Object.entries(samples)) {
    const spread = spreadOf(held);
    if (spread !== undefined) spreads[name] = spread;
  }
  return spreads;
};

const byLineOf = (
  collectedByLine: Partial<Record<WeaponLine, Samples>>,
): Partial<Record<WeaponLine, Record<string, Spread>>> => {
  const byLine: Partial<Record<WeaponLine, Record<string, Spread>>> = {};
  for (const line of WEAPON_LINES) {
    const samples = collectedByLine[line];
    if (samples === undefined) continue;
    byLine[line] = spreadsOf(samples);
  }
  return byLine;
};

const phaseSpansOf = (
  phases: Partial<Record<PhaseName, Sample[]>>,
): Partial<Record<PhaseName, Spread>> => {
  const spans: Partial<Record<PhaseName, Spread>> = {};
  // Walked in the stage's own order, so the report reads down the stage rather
  // than in whichever order the batch's first run happened to cross it.
  for (const phase of PHASES) {
    const samples = phases[phase.name];
    if (samples === undefined) continue;
    const spread = spreadOf(samples);
    if (spread !== undefined) spans[phase.name] = spread;
  }
  return spans;
};

/**
 * What a batch of measured tapes says, as a distribution per reading and never
 * a verdict (ADR 0053).
 *
 * A run whose tape did not verify is named rather than dropped (ADR 0019): a
 * batch that silently shrank would be a batch whose size is no longer its seed
 * count, and the identity is what says how wide it was. A run that verified and
 * reached no ending is named the same way and for the same reason, one step
 * further in: it is in the batch and in every spread, and only its outcome is
 * missing, so a rate read over it is a rate with an unknown inside it (#118).
 */
const batchReportOf = (
  origin: BatchOrigin,
  runs: readonly { seed: number; measurement: Measurement }[],
): BatchReport => {
  const acc = collected();
  const unverified: UnverifiedRun[] = [];
  const unfinished: number[] = [];
  let verified = 0;
  for (const { seed, measurement } of runs) {
    if (measurement.outcome !== 'verified') {
      unverified.push({ seed, outcome: measurement.outcome });
      continue;
    }
    verified += 1;
    if (measurement.run.ending === null) unfinished.push(seed);
    collectRun(acc, seed, measurement);
  }
  return {
    identity: {
      configuration: origin.configuration,
      firstSeed: origin.firstSeed,
      seeds: origin.seeds,
      recordedAt: origin.recordedAt,
      commitHashes: [...acc.commitHashes],
      mobWidths: MOB_WIDTHS,
    },
    readingsVersion: READINGS_VERSION,
    verified,
    unverified,
    unfinished,
    spreads: spreadsOf(acc.spreads),
    byLine: byLineOf(acc.byLine),
    counts: acc.counts,
    phaseSpans: phaseSpansOf(acc.phases),
  };
};

export { batchReportOf, BATCH_READINGS, BATCH_SEEDS, MOB_WIDTHS };
export type {
  BatchIdentity,
  BatchOrigin,
  BatchReduction,
  BatchReport,
  DeclaredBatchReading,
  Spread,
  UnverifiedRun,
};
