// What a batch of harness runs says: one spread per reading (ADR 0053, #98).

import { BELCH_SHOVES } from '../game/belch';
import { WEAPON_LINES } from '../game/lines/roster';
import type { WeaponLine } from '../game/lines/roster';
import { MOB_TYPES } from '../game/mobs';
import type { MobType } from '../game/mobs';
import { SECTIONS } from '../game/stage/stage';
import type { SectionName } from '../game/stage/stage';
import type { BuildMismatch } from '../tape/buildIdentity';
import type { ConfigurationName } from './configurations';
import { runTickBudget } from './harnessRun';
import type { Measurement, Metrics } from './measure';
import type { NumberRecord } from './numbersByName';
import { ledgerByLineNumbers } from './readings/powerUpLedger';
import { addsBySection } from './readings/pressure';
import type { DirectedCardSeen } from './readings/pressure';
import type { SectionSpan } from './readings/sectionTimeline';
import { READINGS_VERSION } from './readingsVersion';
import type { RigName } from './rigs';
import { fiveNumbersOf, greatestOf, leastOf } from './seriesSummary';
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
 *
 * Written out under a total Record rather than folded off the name list, on
 * witness.ts's own reasoning for its code maps: a mob type added to the union
 * fails the typecheck here until somebody gives it a width, where a fold would
 * have keyed the record by bare strings and silently answered nothing.
 */
const MOB_WIDTHS: Readonly<Record<MobType, number>> = {
  shambler: MOB_TYPES.shambler.halfWidth * 2,
  revenant: MOB_TYPES.revenant.halfWidth * 2,
  ghoul: MOB_TYPES.ghoul.halfWidth * 2,
  cairn: MOB_TYPES.cairn.halfWidth * 2,
};

// The bosses a belch can be spent in front of, which is where #37's story 12 is.
const BOSS_SECTIONS: readonly SectionName[] = ['banshee', 'undertaker'];

// The section a run has to enter for the batch to count it as having reached.
const DEEPEST_SECTION: SectionName = 'undertaker';

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
  /**
   * Every starting condition the batch's runs began from, read off the runs
   * the way the commits are (#107). A batch played from one rig names one, and
   * null is a run whose condition no rig holds.
   */
  readonly rigs: readonly (RigName | null)[];
  readonly mobWidths: Readonly<Record<MobType, number>>;
}

// One run's answer to one reading, kept with its seed so a tail can be named.
interface Sample {
  readonly seed: number;
  readonly value: number;
}

// One reading's spread across a batch, with the tail named rather than banded.
interface Spread {
  readonly count: number;
  readonly summary: FiveNumbers;
  // The seeds behind the two extremes, so a tail is a run somebody can re-record.
  readonly minSeed: number;
  readonly maxSeed: number;
  /**
   * Every run's own value, in the order the batch walked them.
   *
   * The five numbers are a summary, and a summary is what the quartile band a
   * direction is taken from can see. The tail is the thing ADR 0053 asks a
   * batch to keep, and the tail is exactly what a band leaves out, so the raw
   * values ride here: a rank test over two batches reads all of them, and a
   * report is a file of tens of kilobytes beside megabytes of tapes.
   */
  readonly samples: readonly Sample[];
}

// A run whose tape did not verify, kept in the report rather than dropped (ADR 0019).
interface UnverifiedRun {
  readonly seed: number;
  readonly outcome: string;
  /**
   * The builds behind a divergence when they differ, and null otherwise (#82).
   * A batch plays and reads on one build, so a value here says a tape from
   * elsewhere was measured and the outcome is about the two builds rather than
   * about the recording.
   */
  readonly buildMismatch: BuildMismatch | null;
}

/**
 * One run that ran out of tick budget with nothing finished, and where it was
 * when it did.
 *
 * The section is the last span the run opened, which is the one it was standing
 * in: a span still live when the tape stopped is the run's own last section.
 * Null on a run whose timeline opened no span at all.
 */
interface CeilingStop {
  readonly seed: number;
  readonly section: SectionName | null;
}

/**
 * One directed add a run made, with the seed it was made under (ADR 0047,
 * #126).
 *
 * It is a field on the batch report and not a BATCH_READINGS entry, on
 * `unfinished` and `ceilingStops`'s own precedent: the declaration guards walk
 * a per-run `Metrics` report and the seed a figure came from does not live
 * there. `tuning.pressure.adds` keeps its name, its shape and its by-section
 * reduction, and this carries the whole card beside the seed rather than a
 * subtree chosen here.
 *
 * It exists because a section is not a moment. Three of ADR 0047's four
 * off-limits moments are tick ranges inside a section the director may
 * otherwise spend in, so only the tick a card landed on can place an add inside
 * one. **What this reports is where the adds landed and nothing else**: whether
 * an add inside one of those ranges is a defect is ADR 0047's question, and
 * this module answers no questions.
 */
interface DirectedAddPlaced {
  readonly seed: number;
  readonly add: DirectedCardSeen;
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
  /**
   * The runs that spent the harness's whole tick budget and still reached no
   * ending, with the section each was standing in when the budget ran out
   * (#118).
   *
   * It is a strict subset of unfinished above and never a second count of the
   * same thing: unfinished is every verified run that reached no ending, and
   * this is the ones that also ran out of budget. A run that quit or faulted is
   * neither, because it stopped before the budget did. The section comes off
   * the run's own timeline, so the reading says where the run got stuck rather
   * than only that it did.
   */
  readonly ceilingStops: readonly CeilingStop[];
  /**
   * Every card the director bought across the batch, in the order the batch
   * walked the runs, each with the seed behind it and the tick it landed on.
   *
   * Carried whole rather than reduced, because a tick has no quartile across
   * seeds: two runs cross a section at different clock times, so the median of
   * a set of add ticks answers nothing. What a reader does with it is lay each
   * tick against that run's own section spans, which the report already
   * carries.
   */
  readonly directedAdds: readonly DirectedAddPlaced[];
  // Every reading the table declares as a spread, by its declared name.
  readonly spreads: Readonly<Record<string, Spread>>;
  // Every reading the table declares as per line, by line and then by name.
  readonly byLine: Readonly<
    Partial<Record<WeaponLine, Record<string, Spread>>>
  >;
  // Readings that are a name rather than a number, counted: endings, stops, the reach.
  readonly counts: Readonly<Record<string, Readonly<Record<string, number>>>>;
  // Each section's span across the batch, which is ADR 0049's clock as a distribution.
  readonly sectionSpans: Readonly<Partial<Record<SectionName, Spread>>>;
}

// A number per run, printed as five numbers with the extreme seeds beside it.
interface SpreadDeclaration {
  readonly reading: string;
  readonly reduction: 'spread';
  // Absent when the run cannot support the reading, which keeps it out of the spread.
  readonly numberOf: (report: Metrics) => number | undefined;
}

/**
 * Numbers under names per run: one spread per weapon line where the reading is
 * per line, and a name that is not a line's filed flat under the reading.
 */
interface NumbersDeclaration {
  readonly reading: string;
  readonly reduction: 'perLine' | 'byName';
  readonly numbersOf: (report: Metrics) => NumberRecord;
}

// Names per run, counted rather than spread, because a name has no quartile.
interface CountDeclaration {
  readonly reading: string;
  readonly reduction: 'count';
  readonly namesOf: (report: Metrics) => readonly string[];
}

// A series per run, reduced to that run's peak and then spread.
interface PeakDeclaration {
  readonly reading: string;
  readonly reduction: 'peak';
  readonly seriesOf: (report: Metrics) => readonly number[];
}

/**
 * A series per run, reduced to that run's own five numbers, filed as the peak
 * under the reading's own name and the rest as named siblings under it.
 *
 * It exists because a peak says the worst tick and the mow is about the
 * ordinary one (the design record's section 7). The flat row keeps its exact
 * name and its exact value, so a step 3 batch and a step 4 batch are still
 * comparable by that name and READINGS_VERSION does not move; the max sibling
 * restates it rather than being left out, so the four other figures read as a
 * whole five-number summary and not as four numbers plus one a reader has to
 * know where to find.
 */
interface DistributionDeclaration {
  readonly reading: string;
  readonly reduction: 'distribution';
  readonly seriesOf: (report: Metrics) => readonly number[];
}

// The section timeline, which a batch reads twice: the spans and the reach.
interface SectionSpansDeclaration {
  readonly reading: string;
  readonly reduction: 'sectionSpans';
}

/**
 * Carried whole rather than reduced, with the reason it is. Naming this kind
 * is what gives the declaration guard teeth: a reading nobody thought about is
 * a hole, and a reading deliberately carried whole says so.
 */
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
  | DistributionDeclaration
  | SectionSpansDeclaration
  | NotReducedDeclaration;

const spreadReading = (
  reading: string,
  numberOf: (report: Metrics) => number | undefined,
): SpreadDeclaration => ({ reading, reduction: 'spread', numberOf });

const perLineReading = (
  reading: string,
  numbersOf: (report: Metrics) => NumberRecord,
): NumbersDeclaration => ({ reading, reduction: 'perLine', numbersOf });

/**
 * A per-shove reading as named numbers, keyed by the shove's own place in its
 * press. The keys are fixed by the belch's own row, so a run whose presses
 * never reached a third shove reads zero there rather than leaving the name
 * out.
 */
const byShove = (perShove: readonly number[]): NumberRecord => {
  const named: Record<string, number> = {};
  for (let at = 0; at < BELCH_SHOVES; at++)
    named[`${at + 1}`] = perShove[at] ?? 0;
  return named;
};

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

const distributionReading = (
  reading: string,
  seriesOf: (report: Metrics) => readonly number[],
): DistributionDeclaration => ({
  reading,
  reduction: 'distribution',
  seriesOf,
});

const notReduced = (reading: string, why: string): NotReducedDeclaration => ({
  reading,
  reduction: 'notReduced',
  why,
});

/**
 * How many of these ticks fall inside the span, by the span's own ends. A span
 * still live at the tape's end is open at the top, so a tick after its start
 * is inside it.
 *
 * It is the one piece of section-crossing arithmetic the batch owns, and both
 * readings that cross a section are counted with it rather than each with its
 * own copy.
 */
const ticksInside = (ticks: readonly number[], span: SectionSpan): number =>
  ticks.filter(
    (tick) => tick >= span.from && (span.to === null || tick < span.to),
  ).length;

// How many of this run's belches landed inside the span.
const firesInside = (report: Metrics, span: SectionSpan): number =>
  ticksInside(
    report.tuning.belchCadence.fires.map((fire) => fire.tick),
    span,
  );

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
    if (!BOSS_SECTIONS.includes(span.section)) continue;
    names[span.section] = firesInside(report, span);
  }
  return names;
};

/**
 * The power the run bought, over the run (#39's power-curve ruling).
 *
 * The count alone was what the batch used to read, which threw away the tick
 * and the line every level-up carries and left nothing in the report showing
 * power growing across a run. The rungs are counted against the run's own
 * section spans, on the belch's own precedent, because a section is where the
 * schedule authors its answer to that growth.
 *
 * A line that bought nothing reads zero rather than absent, on seedDamage's
 * terms: the run held the line and it never levelled, which is a reading. The
 * first tick is absent on a run that bought nothing at all, because there is
 * no rung for it to be the tick of.
 */
const levelsBought = (report: Metrics): NumberRecord => {
  const ticks = report.levelUps.map((rung) => rung.tick);
  const names: Record<string, number | undefined> = {
    rungs: ticks.length,
    firstTick: leastOf(ticks),
  };
  for (const line of WEAPON_LINES) {
    names[line] = report.levelUps.filter((rung) => rung.line === line).length;
  }
  for (const span of report.tuning.sectionTimeline.spans) {
    names[`bySection.${span.section}`] = ticksInside(ticks, span);
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
 * A per-type, per-minute record flattened to one name per figure, so the whole
 * subtree rides on one declaration rather than one per type.
 *
 * A minute a type had no timed kill in is absent from its own record already,
 * so nothing here invents a zero for it.
 */
const perTypeMinutes = (
  byType: Readonly<Partial<Record<MobType, Readonly<Record<string, number>>>>>,
): NumberRecord => {
  const names: Record<string, number> = {};
  for (const [type, minutes] of Object.entries(byType)) {
    for (const [minute, value] of Object.entries(minutes ?? {})) {
      names[`${type}.${minute}`] = value;
    }
  }
  return names;
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
  notReduced(
    'buildMismatch',
    'a batch plays and reads on one build, so the mismatch rides with the run that had one',
  ),
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
  // The rungs the run bought, when and on which line. The rows have no index
  // to pair across two runs, which is why the comparison table calls it a
  // list; what a batch reads off one is how many, how soon and where.
  byNameReading('levelUps', levelsBought),
  distributionReading('mobsAlivePerTick', (report) => report.mobsAlivePerTick),
  peakReading('mobFireAlivePerTick', (report) => report.mobFireAlivePerTick),
  // What arrived, which is what the mow ruling tunes: the rate and the count
  // per spawn, read per section because that is where a schedule authors them.
  spreadReading(
    'tuning.arrivals.total',
    (report) => report.tuning.arrivals.total,
  ),
  // The rate rather than the count, which is the quantity a standing wave
  // authors. Absent on a run with no ticks, which has no rate to have.
  spreadReading(
    'tuning.arrivals.perSecond',
    (report) => report.tuning.arrivals.perSecond ?? undefined,
  ),
  byNameReading(
    'tuning.arrivals.bySection',
    (report) => report.tuning.arrivals.bySection,
  ),
  byNameReading(
    'tuning.arrivals.byType',
    (report) => report.tuning.arrivals.byType,
  ),
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
  // The per-minute axis, flattened to type-and-minute names so one declaration
  // covers the whole subtree. A minute a type had no timed kill in carries no
  // name at all, which keeps an absent minute absent rather than zero.
  byNameReading('tuning.engagements.hitsPerKillByMinute', (report) =>
    perTypeMinutes(report.tuning.engagements.hitsPerKillByMinute),
  ),
  byNameReading('tuning.engagements.timedKillsByMinute', (report) =>
    perTypeMinutes(report.tuning.engagements.timedKillsByMinute),
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
  // Absent on a run that never reached the ceiling, on the same terms the
  // reading itself keeps: there is no tick to name.
  spreadReading(
    'tuning.gravePath.ticksToCeiling',
    (report) => report.tuning.gravePath.ticksToCeiling ?? undefined,
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
  // The cadence itself, as a distribution over one run's own gaps: a run with
  // one belch or none contributes nothing, which is a run with no cadence.
  distributionReading(
    'tuning.belchCadence.intervals',
    (report) => report.tuning.belchCadence.intervals,
  ),
  spreadReading(
    'tuning.belchCadence.ticksAtFull',
    (report) => report.tuning.belchCadence.ticksAtFull,
  ),
  spreadReading(
    'tuning.belchCadence.wasted',
    (report) => report.tuning.belchCadence.wasted,
  ),
  // What share of its own frame a press typically reaches. Every reduction here
  // is per run, this one included: a run's own presses become that run's five
  // numbers and those are what spread across the batch, so a run with one press
  // files a summary of that one press rather than pooling it with a run that
  // pressed twelve times (#124).
  distributionReading(
    'tuning.belchCadence.frameShares',
    (report) => report.tuning.belchCadence.frameShares,
  ),
  // What the misses were made of. Named numbers rather than a spread, because
  // the four reasons are four different facts about a press and summing them
  // into one figure would say only that a press missed.
  byNameReading('tuning.belchCadence.misses', (report) => ({
    ...report.tuning.belchCadence.misses,
  })),
  // What each shove of a press threw, and what share of its own circle each one
  // was holding. Named numbers and never a spread, because the three shoves are
  // three different questions and a press that throws on its first and nobody
  // after is exactly what these exist to show (#124).
  byNameReading('tuning.belchCadence.movedPerShove', (report) =>
    byShove(report.tuning.belchCadence.movedPerShove),
  ),
  byNameReading('tuning.belchCadence.caughtSharePerShove', (report) =>
    byShove(report.tuning.belchCadence.caughtSharePerShove),
  ),
  // The director's own instrument, read back off the tape (#85).
  distributionReading(
    'tuning.pressure.signalPerTick',
    (report) => report.tuning.pressure.signalPerTick,
  ),
  byNameReading('tuning.pressure.adds', (report) =>
    addsBySection(report.tuning.pressure),
  ),
  byNameReading(
    'tuning.pressure.purseLeftBySection',
    (report) => report.tuning.pressure.purseLeftBySection,
  ),
  spreadReading(
    'tuning.pressure.ticksSignalLow',
    (report) => report.tuning.pressure.ticksSignalLow,
  ),
  spreadReading(
    'tuning.pressure.disagreements',
    (report) => report.tuning.pressure.disagreements,
  ),
  spreadReading(
    'tuning.powerUpLedger.spawned',
    (report) => report.tuning.powerUpLedger.spawned,
  ),
  spreadReading(
    'tuning.powerUpLedger.swallowed',
    (report) => report.tuning.powerUpLedger.swallowed,
  ),
  spreadReading(
    'tuning.powerUpLedger.passed',
    (report) => report.tuning.powerUpLedger.passed,
  ),
  spreadReading(
    'tuning.powerUpLedger.lost',
    (report) => report.tuning.powerUpLedger.lost,
  ),
  spreadReading(
    'tuning.powerUpLedger.onFieldAtStop',
    (report) => report.tuning.powerUpLedger.onFieldAtStop,
  ),
  // The one reading this step widened by line, which is #98's acceptance line.
  perLineReading('tuning.powerUpLedger.byLine', (report) =>
    ledgerByLineNumbers(report.tuning.powerUpLedger.byLine),
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
  // The belch's own arm, empty on every tape this build can produce and filled
  // by slice J (design record section 4).
  spreadReading(
    'tuning.repel.belchShoves',
    (report) => report.tuning.repel.belchShoves,
  ),
  spreadReading(
    'tuning.repel.belchDistance',
    (report) => report.tuning.repel.belchDistance,
  ),
  // What the caps turned away, per run. A non-zero figure in any of the three
  // is a fault rather than a cap to raise, and the spread is how a batch says
  // which run had one.
  spreadReading(
    'tuning.refusals.food',
    (report) => report.tuning.refusals.food,
  ),
  spreadReading(
    'tuning.refusals.carriers',
    (report) => report.tuning.refusals.carriers,
  ),
  spreadReading(
    'tuning.refusals.offers',
    (report) => report.tuning.refusals.offers,
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
  { reading: 'tuning.sectionTimeline.spans', reduction: 'sectionSpans' },
  notReduced(
    'performance',
    'a harness tape carries no frame rows at all, so there is nothing on it to reduce; a batch over a person tape is where these get a reduction (#100)',
  ),
  spreadReading('recordedFaults', (report) => report.recordedFaults.length),
  spreadReading('readbackFaults', (report) => report.readbackFaults.length),
  notReduced(
    'provenance',
    "the hand is the batch's own configuration, the rig rides on the batch's own identity, and every harness run carries the same exclusions",
  ),
];

type Samples = Record<string, Sample[]>;

// Everything the walk over the runs collects, before any of it is summarised.
interface Collected {
  readonly spreads: Samples;
  readonly byLine: Partial<Record<WeaponLine, Samples>>;
  readonly counts: Record<string, Record<string, number>>;
  readonly sections: Partial<Record<SectionName, Sample[]>>;
  readonly commitHashes: Set<string>;
  readonly rigs: Set<RigName | null>;
}

const collected = (): Collected => ({
  spreads: {},
  byLine: {},
  counts: {},
  sections: {},
  commitHashes: new Set(),
  rigs: new Set(),
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
  if (head === undefined) throw new Error('split on an empty string');
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
    if (head === undefined) throw new Error('split on an empty string');
    if (declared.reduction === 'perLine' && lineNamed(head) === undefined) {
      throw new Error(`${declared.reading} is per line and ${name} is no line`);
    }
    fileFigure(acc, declared.reading, name, { seed, value });
  }
};

/**
 * A run's own series, filed as the peak under the reading's own name and the
 * five numbers as named siblings under it.
 *
 * The peak goes in first and alone, so the flat row is exactly what a peak
 * declaration filed before this kind existed. A series with nothing in it files
 * nothing, on spreadOf's own terms.
 */
const fileDistribution = (
  acc: Collected,
  declared: DistributionDeclaration,
  seed: number,
  report: Metrics,
): void => {
  const series = declared.seriesOf(report);
  const peak = greatestOf(series);
  if (peak === undefined) return;
  addSample(acc.spreads, declared.reading, { seed, value: peak });
  const summary = fiveNumbersOf(series);
  if (summary === undefined) return;
  for (const [name, value] of Object.entries(summary)) {
    addSample(acc.spreads, `${declared.reading}.${name}`, { seed, value });
  }
};

// Each closed span's length, and whether the run reached the deepest section.
const fileTimeline = (acc: Collected, seed: number, report: Metrics): void => {
  let reached = 'stopped short';
  for (const span of report.tuning.sectionTimeline.spans) {
    if (span.section === DEEPEST_SECTION) reached = 'reached';
    // A section still live when the tape stopped held no span anybody can read.
    if (span.to === null) continue;
    const held = acc.sections[span.section] ?? [];
    acc.sections[span.section] = held;
    held.push({ seed, value: span.to - span.from });
  }
  addCount(acc, 'reach', reached);
};

// One verified run, offered to every declared reading in turn.
const collectRun = (acc: Collected, seed: number, report: Metrics): void => {
  acc.commitHashes.add(report.identity.commitHash);
  acc.rigs.add(report.provenance.rig);
  for (const declared of BATCH_READINGS) {
    if (declared.reduction === 'notReduced') continue;
    if (declared.reduction === 'sectionSpans') {
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
    } else if (declared.reduction === 'distribution') {
      fileDistribution(acc, declared, seed, report);
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
    samples: [...samples],
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

const sectionSpansOf = (
  sections: Partial<Record<SectionName, Sample[]>>,
): Partial<Record<SectionName, Spread>> => {
  const spans: Partial<Record<SectionName, Spread>> = {};
  // Walked in the stage's own order, so the report reads down the stage rather
  // than in whichever order the batch's first run happened to cross it.
  for (const section of SECTIONS) {
    const samples = sections[section.name];
    if (samples === undefined) continue;
    const spread = spreadOf(samples);
    if (spread !== undefined) spans[section.name] = spread;
  }
  return spans;
};

// The last section the run opened, which is the one it was standing in.
const sectionStoppedIn = (report: Metrics): SectionName | null => {
  const spans = report.tuning.sectionTimeline.spans;
  return spans[spans.length - 1]?.section ?? null;
};

/**
 * This run's ceiling stop, or nothing when it did not reach the harness's own
 * ceiling on how long a run may play.
 *
 * The budget is asked for rather than written down, so re-authoring a section
 * moves what a ceiling stop is with it, and nothing here is ordered against a
 * number of its own.
 *
 * Exactly the budget and never above it: runPolicy stops a harness run on the
 * tick that reaches it, so an exhausted run's count is the budget itself. A
 * tape longer than that was not played by the harness at all, and reading a
 * person's long unfinished run as a ceiling stop would file a closed tab under
 * a budget that never applied to it.
 */
const ceilingStopOf = (seed: number, report: Metrics): CeilingStop | null => {
  if (report.run.ticks !== runTickBudget()) return null;
  return { seed, section: sectionStoppedIn(report) };
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
  const ceilingStops: CeilingStop[] = [];
  const directedAdds: DirectedAddPlaced[] = [];
  let verified = 0;
  for (const { seed, measurement } of runs) {
    if (measurement.outcome !== 'verified') {
      unverified.push({
        seed,
        outcome: measurement.outcome,
        buildMismatch:
          measurement.outcome === 'diverged' ? measurement.buildMismatch : null,
      });
      continue;
    }
    verified += 1;
    if (measurement.run.ending === null) {
      unfinished.push(seed);
      const stopped = ceilingStopOf(seed, measurement);
      if (stopped !== null) ceilingStops.push(stopped);
    }
    for (const add of measurement.tuning.pressure.adds) {
      directedAdds.push({ seed, add });
    }
    collectRun(acc, seed, measurement);
  }
  return {
    identity: {
      configuration: origin.configuration,
      firstSeed: origin.firstSeed,
      seeds: origin.seeds,
      recordedAt: origin.recordedAt,
      commitHashes: [...acc.commitHashes],
      rigs: [...acc.rigs],
      mobWidths: MOB_WIDTHS,
    },
    readingsVersion: READINGS_VERSION,
    verified,
    unverified,
    unfinished,
    ceilingStops,
    directedAdds,
    spreads: spreadsOf(acc.spreads),
    byLine: byLineOf(acc.byLine),
    counts: acc.counts,
    sectionSpans: sectionSpansOf(acc.sections),
  };
};

export { batchReportOf, BATCH_READINGS, BATCH_SEEDS };
export type {
  BatchIdentity,
  BatchOrigin,
  BatchReport,
  CeilingStop,
  DeclaredBatchReading,
  DirectedAddPlaced,
  Sample,
  Spread,
  UnverifiedRun,
};
