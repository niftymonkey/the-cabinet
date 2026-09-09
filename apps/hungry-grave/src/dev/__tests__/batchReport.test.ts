/**
 * The batch report: what a seed range under one hand says, as a spread per
 * reading (ADR 0053, #98).
 *
 * Every case starts from one real verified report and moves the figures it is
 * about. A batch is a function of its tapes, so the seam under test is what
 * batchReportOf makes of a list of measurements, and playing forty-eight whole
 * runs to vary one number would measure the stage rather than the report.
 */

import { describe, expect, it } from 'vitest';

import { TICK_HZ } from '../../game/clock';
import { createExecution, executeTick } from '../../game/execution';
import { WEAPON_LINES } from '../../game/lines/roster';
import { MOB_TYPES, MOB_TYPE_NAMES } from '../../game/mobs';
import { createRun } from '../../game/run';
import { WITNESS_VERSION } from '../../game/witness';
import { recordInto, sealTrailer, tapeOf } from '../../tape/recorder';
import { SCRIPT_POLICY } from '../../tape/tape';
import { batchReportOf, BATCH_SEEDS } from '../batchReport';
import type { BatchOrigin } from '../batchReport';
import { measure } from '../measure';
import type { Measurement, Metrics } from '../measure';

const TICKS = 60;

/** Narrows a possibly-absent value, or fails loudly when the absence is a bug. */
function requireDefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

const ORIGIN: BatchOrigin = {
  configuration: 'steady-far',
  firstSeed: 900,
  seeds: 1,
  recordedAt: 1_788_000_000_000,
};

/** One short verified report, which is every reading the seam can produce. */
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

/** The same report with its tick count moved, which is the plainest spread there is. */
const runOfTicks = (seed: number, ticks: number): MeasuredRun => ({
  seed,
  measurement: { ...BASE, run: { ...BASE.run, ticks } },
});

const origin = (seeds: number): BatchOrigin => ({ ...ORIGIN, seeds });

/** Every leaf of a value, so a walk can say what kinds the report is made of. */
const leavesOf = (value: unknown): unknown[] => {
  if (value === null || typeof value !== 'object') return [value];
  return Object.values(value).flatMap(leavesOf);
};

describe('the batch report', () => {
  it('is one run per seed over a seed range under one configuration', () => {
    // Spec test 36. ADR 0053: "A deterministic policy needs exactly one run per
    // seed, so batch size is seeds and never repeats."
    const runs = [900, 901, 902].map((seed) => runOfTicks(seed, seed - 800));

    const report = batchReportOf(origin(3), runs);

    expect(report.identity.configuration).toBe('steady-far');
    expect(report.identity.firstSeed).toBe(900);
    expect(report.identity.seeds).toBe(3);
    expect(report.verified).toBe(3);
    expect(
      requireDefined(report.spreads['run.ticks'], 'no run.ticks spread').count,
    ).toBe(3);
    // The size of a batch is its seed count, and BATCH_SEEDS is the row the
    // command line reads when nobody names one.
    expect(BATCH_SEEDS).toBe(48);
  });

  it('reports every reading as five numbers and never as a mean', () => {
    // Spec test 37. ADR 0053: "A batch reports a distribution rather than a
    // mean, because the interesting runs are in a tail." The series below has a
    // mean of 30 and a median of 4, so a report carrying a mean anywhere would
    // be carrying 30.
    const ticks = [1, 2, 4, 8, 135];
    const runs = ticks.map((count, offset) => runOfTicks(900 + offset, count));

    const report = batchReportOf(origin(5), runs);

    expect(
      requireDefined(report.spreads['run.ticks'], 'no run.ticks spread')
        .summary,
    ).toEqual({
      min: 1,
      lowerQuartile: 2,
      median: 4,
      upperQuartile: 8,
      max: 135,
    });
    for (const spread of Object.values(report.spreads)) {
      expect(Object.keys(spread.summary).sort()).toEqual([
        'lowerQuartile',
        'max',
        'median',
        'min',
        'upperQuartile',
      ]);
    }
  });

  it("keeps every run's own value beside the five numbers", () => {
    // The five numbers are a summary and the tail is the thing the report
    // exists to keep, so a spread that threw the other forty-three values away
    // could carry no rank test and no reading of its own tail. The values are
    // kept with their seeds, in the order the runs were walked.
    const report = batchReportOf(origin(4), [
      runOfTicks(900, 30),
      runOfTicks(901, 10),
      runOfTicks(902, 90),
      runOfTicks(903, 20),
    ]);

    expect(
      requireDefined(report.spreads['run.ticks'], 'no run.ticks spread')
        .samples,
    ).toEqual([
      { seed: 900, value: 30 },
      { seed: 901, value: 10 },
      { seed: 902, value: 90 },
      { seed: 903, value: 20 },
    ]);
    expect(
      requireDefined(report.spreads['run.ticks'], 'no run.ticks spread').count,
    ).toBe(4);
  });

  it('names the seeds that produced the smallest and the largest reading', () => {
    // Spec test 38. At forty-eight seeds the top five per cent is two runs, so
    // a band drawn over two runs would dress two numbers as a distribution. A
    // named seed is a whole run somebody can re-record and watch.
    const runs = [
      runOfTicks(900, 50),
      runOfTicks(901, 9),
      runOfTicks(902, 400),
      runOfTicks(903, 70),
    ];

    const report = batchReportOf(origin(4), runs);

    expect(
      requireDefined(report.spreads['run.ticks'], 'no run.ticks spread')
        .minSeed,
    ).toBe(901);
    expect(
      requireDefined(report.spreads['run.ticks'], 'no run.ticks spread')
        .maxSeed,
    ).toBe(902);
  });

  it('keys by weapon line in the batch every reading keyed by weapon line in a run', () => {
    // Spec test 39. #98's acceptance line and path-draft.md:21: a per-line
    // quantity in a run is a per-line quantity in the batch, and a quantity
    // with no line says so rather than being split by a key it does not have.
    const levelled = (seed: number, bell: number): MeasuredRun => ({
      seed,
      measurement: {
        ...BASE,
        endLevels: { ...BASE.endLevels, bell },
      },
    });
    const runs = [levelled(900, 1), levelled(901, 3), levelled(902, 5)];

    const report = batchReportOf(origin(3), runs);

    expect(
      requireDefined(report.byLine.bell?.endLevels, 'no bell endLevels')
        .summary,
    ).toEqual({
      min: 1,
      lowerQuartile: 1,
      median: 3,
      upperQuartile: 5,
      max: 5,
    });
    for (const line of WEAPON_LINES) {
      expect(
        requireDefined(report.byLine[line]?.endLevels, `no ${line} endLevels`)
          .count,
      ).toBe(3);
    }
    // A run's tick count has no line, so it is a flat spread and appears under
    // no line at all.
    expect(
      requireDefined(report.spreads['run.ticks'], 'no run.ticks spread').count,
    ).toBe(3);
    expect(report.byLine.bell?.['run.ticks']).toBe(undefined);
  });

  it('names the runs whose tapes did not verify rather than dropping them', () => {
    // Spec test 40. ADR 0019: a tape that cannot prove itself reports nothing
    // rather than reporting wrongly, and a batch that silently shrank would be
    // a batch whose size is no longer its seed count.
    const diverged: Measurement = {
      outcome: 'diverged',
      firstDivergentCheckpoint: 2,
      checkpointsVerified: 1,
      ticksReproduced: 40,
      buildMismatch: null,
    };
    const runs = [
      runOfTicks(900, 10),
      { seed: 901, measurement: diverged },
      runOfTicks(902, 30),
    ];

    const report = batchReportOf(origin(3), runs);

    expect(report.verified).toBe(2);
    expect(report.unverified).toEqual([
      { seed: 901, outcome: 'diverged', buildMismatch: null },
    ]);
    expect(
      requireDefined(report.spreads['run.ticks'], 'no run.ticks spread').count,
    ).toBe(2);
    // The batch is still three seeds wide: the identity says what was played
    // and the tally says what could be read.
    expect(report.identity.seeds).toBe(3);
  });

  it('names the runs that stopped with no ending beside the ones that did not verify', () => {
    // #118. A run the harness stopped at its own tick ceiling reached no
    // outcome, and every rate a reader takes off the batch counts it as the
    // outcome it did not reach: three seeds with one of these are two answers
    // and an unknown, never three answers. Naming it is the rule ADR 0019
    // already states for a tape that could not prove itself, applied to a run
    // that proved itself and finished nothing.
    const stoppedAt = (seed: number, ending: 'sealed' | null): MeasuredRun => ({
      seed,
      measurement: { ...BASE, run: { ...BASE.run, ending } },
    });

    const report = batchReportOf(origin(3), [
      stoppedAt(900, 'sealed'),
      stoppedAt(901, null),
      stoppedAt(902, 'sealed'),
    ]);

    expect(report.unfinished).toEqual([901]);
    // Its tape verified and its figures stay in every spread: what it lacks is
    // an outcome, not a proof, so the report keeps the reading and tells the
    // reader which seed to discount rather than quietly shrinking the batch.
    expect(report.verified).toBe(3);
    expect(
      requireDefined(report.spreads['run.ticks'], 'no run.ticks spread').count,
    ).toBe(3);
    expect(report.counts['run.ending']).toEqual({ sealed: 2, none: 1 });
  });

  it('names no unfinished run when every run reached an ending', () => {
    // The list has teeth only if it is empty when it should be: a field that
    // named every run would be as invisible to a reader as no field at all.
    const report = batchReportOf(origin(2), [
      {
        seed: 900,
        measurement: { ...BASE, run: { ...BASE.run, ending: 'sealed' } },
      },
      {
        seed: 901,
        measurement: { ...BASE, run: { ...BASE.run, ending: 'victory' } },
      },
    ]);

    expect(report.unfinished).toEqual([]);
  });

  it('states no number as a target', () => {
    // Spec test 41. ADR 0053: "this build against that build, this
    // configuration against that one, never this number against a target."
    // A verdict has to be carried by something, and a boolean is what carries
    // one, so a report with no boolean anywhere in it states no pass or fail.
    const runs = [900, 901].map((seed) => runOfTicks(seed, seed - 800));

    const report = batchReportOf(origin(2), runs);

    const kinds = new Set(leavesOf(report).map((leaf) => typeof leaf));
    expect([...kinds].sort()).toEqual(['number', 'string']);
    // And the walk has teeth: a planted verdict is found.
    expect(
      new Set(leavesOf({ ...report, passed: true }).map((l) => typeof l)),
    ).toContain('boolean');
  });

  it('summarises an odd count of runs and an even one alike', () => {
    // Module test 59. Nearest-rank on the sorted series, worked out by hand.
    // Over five values the ranks are ceil(0.25*5) = 2, ceil(0.5*5) = 3 and
    // ceil(0.75*5) = 4; over four they are 1, 2 and 3.
    const odd = batchReportOf(
      origin(5),
      [10, 20, 30, 40, 50].map((ticks, at) => runOfTicks(900 + at, ticks)),
    );
    const even = batchReportOf(
      origin(4),
      [10, 20, 30, 40].map((ticks, at) => runOfTicks(900 + at, ticks)),
    );

    expect(
      requireDefined(odd.spreads['run.ticks'], 'no run.ticks spread').summary,
    ).toEqual({
      min: 10,
      lowerQuartile: 20,
      median: 30,
      upperQuartile: 40,
      max: 50,
    });
    expect(
      requireDefined(even.spreads['run.ticks'], 'no run.ticks spread').summary,
    ).toEqual({
      min: 10,
      lowerQuartile: 10,
      median: 20,
      upperQuartile: 30,
      max: 40,
    });
  });

  it('reports nothing rather than zeroes when no run verified', () => {
    // Module test 60. Absent is the honest answer on the same terms as every
    // reading beside it: a batch with no verified run has nothing to summarise,
    // and a spread of zeroes would be the instrument inventing readings.
    const refused: Measurement = {
      outcome: 'witnessVersionMismatch',
      tapeWitnessVersion: 5,
      readerWitnessVersion: WITNESS_VERSION,
    };

    const report = batchReportOf(origin(2), [
      { seed: 900, measurement: refused },
      { seed: 901, measurement: refused },
    ]);

    expect(report.verified).toBe(0);
    expect(report.unverified).toHaveLength(2);
    expect(report.spreads).toEqual({});
    expect(report.byLine).toEqual({});
    expect(report.counts).toEqual({});
    expect(report.phaseSpans).toEqual({});
  });

  it('leaves out a reading no run could support rather than folding in a zero', () => {
    // Module test 60, the half a batch with runs in it can reach. The Waking's
    // swallows are absent on a run that never opened the Waking, and a batch of
    // such runs reports the reading not at all: a zero would say the hand
    // committed up the trail and swallowed nothing, which is a different run
    // from one where the trail never poured.
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

    const never = batchReportOf(origin(2), [
      swallowing(900, null),
      swallowing(901, null),
    ]);
    const once = batchReportOf(origin(2), [
      swallowing(900, null),
      swallowing(901, 6),
    ]);

    expect(never.verified).toBe(2);
    expect(never.spreads['tuning.wakingSwallows.span']).toBe(undefined);
    // And a run that did open it is a spread of one rather than a spread of two
    // with a zero in it, so the count says how many runs the figure came from.
    const onceSpread = requireDefined(
      once.spreads['tuning.wakingSwallows.span'],
      'no tuning.wakingSwallows.span spread',
    );
    expect(onceSpread.count).toBe(1);
    expect(onceSpread.summary.min).toBe(6);
  });

  it('counts which slot went in, under the site the offer stood at', () => {
    // #98's second comment and the record's section 4: take-by-slot split
    // between banked offers and death-point offers. It is a reading and never a
    // rule, so what it says is where the grave was standing when the offer
    // opened, and under a nearest-body hand that is exactly informative.
    const offering = (seed: number, slot: number | null): MeasuredRun => ({
      seed,
      measurement: {
        ...BASE,
        tuning: {
          ...BASE.tuning,
          offerChoices: {
            bankedWhileStanding: 0,
            choices: [
              {
                tick: 10,
                site: 'death',
                slot,
                line: null,
                passed: [],
              },
              {
                tick: 50,
                site: 'bank',
                slot: 2,
                line: null,
                passed: [],
              },
            ],
          },
        },
      },
    });

    const report = batchReportOf(origin(2), [
      offering(900, 0),
      offering(901, 1),
    ]);

    expect(report.counts['tuning.offerChoices.choices']).toEqual({
      'death.0': 1,
      'death.1': 1,
      'bank.2': 2,
    });
    // An offer that never went in is its own row rather than a slot nobody took.
    const untaken = batchReportOf(origin(1), [offering(900, null)]);
    const untakenChoices = requireDefined(
      untaken.counts['tuning.offerChoices.choices'],
      'no tuning.offerChoices.choices counts',
    );
    expect(
      requireDefined(untakenChoices['death.untaken'], 'no death.untaken count'),
    ).toBe(1);
  });

  it('reports each phase as a spread of the spans it held', () => {
    // Module test 61. ADR 0049's clock read as a distribution rather than as
    // one run's length: a phase ends on its own condition, so how long it held
    // is a reading over the batch and never an authored number.
    const spanned = (seed: number, banshee: number): MeasuredRun => ({
      seed,
      measurement: {
        ...BASE,
        tuning: {
          ...BASE.tuning,
          sectionTimeline: {
            spans: [
              { phase: 'procession', from: 0, to: 100 },
              { phase: 'banshee', from: 100, to: 100 + banshee },
              { phase: 'crowd', from: 100 + banshee, to: null },
            ],
          },
        },
      },
    });

    const report = batchReportOf(origin(3), [
      spanned(900, 200),
      spanned(901, 600),
      spanned(902, 1000),
    ]);

    expect(report.phaseSpans.procession?.summary.median).toBe(100);
    expect(report.phaseSpans.banshee?.summary).toEqual({
      min: 200,
      lowerQuartile: 200,
      median: 600,
      upperQuartile: 1000,
      max: 1000,
    });
    // A phase still live when the tape stopped held no span anybody can read,
    // so it is absent rather than measured against the tape's own end.
    expect(report.phaseSpans.crowd).toBe(undefined);
  });

  it('reports the rungs a run bought, when it bought them and on which line', () => {
    // #39, the power-curve ruling: nothing in the report showed power growing
    // over a run, because the rung count dropped the tick and the line every
    // level-up already carries. The phase is where the schedule authors its
    // answer to that growth, so the rungs are read against the run's own spans
    // the way the belch already is.
    const levelled = (seed: number, lateTick: number): MeasuredRun => ({
      seed,
      measurement: {
        ...BASE,
        levelUps: [
          { line: 'skullStream', level: 2, tick: 50 },
          { line: 'skullStream', level: 3, tick: 150 },
          { line: 'bell', level: 1, tick: lateTick },
        ],
        tuning: {
          ...BASE.tuning,
          sectionTimeline: {
            spans: [
              { phase: 'procession', from: 0, to: 100 },
              { phase: 'banshee', from: 100, to: 200 },
              { phase: 'crowd', from: 200, to: null },
            ],
          },
        },
      },
    });

    const report = batchReportOf(origin(2), [
      levelled(900, 300),
      levelled(901, 400),
    ]);

    expect(
      requireDefined(
        report.spreads['levelUps.rungs'],
        'no levelUps.rungs spread',
      ).summary.median,
    ).toBe(3);
    // The tick, as how long the run played before its first rung.
    expect(
      requireDefined(
        report.spreads['levelUps.firstTick'],
        'no levelUps.firstTick spread',
      ).summary.min,
    ).toBe(50);
    // Where the growth fell across the run, phase by phase.
    expect(
      requireDefined(
        report.spreads['levelUps.byPhase.procession'],
        'no levelUps.byPhase.procession spread',
      ).summary.max,
    ).toBe(1);
    expect(
      requireDefined(
        report.spreads['levelUps.byPhase.banshee'],
        'no levelUps.byPhase.banshee spread',
      ).summary.max,
    ).toBe(1);
    expect(
      requireDefined(
        report.spreads['levelUps.byPhase.crowd'],
        'no levelUps.byPhase.crowd spread',
      ).summary.max,
    ).toBe(1);
    // And the line, which files under the line the way every per-line figure does.
    expect(
      requireDefined(
        report.byLine.skullStream?.levelUps,
        'no skullStream levelUps',
      ).summary.median,
    ).toBe(2);
    expect(
      requireDefined(report.byLine.bell?.levelUps, 'no bell levelUps').summary
        .median,
    ).toBe(1);
    expect(
      requireDefined(report.byLine.wisps?.levelUps, 'no wisps levelUps').summary
        .median,
    ).toBe(0);
  });

  it('counts the endings, the stops and the reach rather than spreading them', () => {
    // Module test 62. A name has no quartile, so the endings and the reach are
    // counted. The reach is whether the run entered the Undertaker's phase,
    // which is the figure #98's done line is read off.
    const ended = (
      seed: number,
      ending: 'victory' | 'sealed',
      deep: boolean,
    ): MeasuredRun => ({
      seed,
      measurement: {
        ...BASE,
        run: { ...BASE.run, ending },
        tuning: {
          ...BASE.tuning,
          sectionTimeline: {
            spans: deep
              ? [
                  { phase: 'procession', from: 0, to: 100 },
                  { phase: 'undertaker', from: 100, to: 900 },
                ]
              : [{ phase: 'procession', from: 0, to: 100 }],
          },
        },
      },
    });

    const report = batchReportOf(origin(3), [
      ended(900, 'victory', true),
      ended(901, 'sealed', true),
      ended(902, 'sealed', false),
    ]);

    expect(report.counts['run.ending']).toEqual({ victory: 1, sealed: 2 });
    // The base report is a short tape sealed where it was cut off, so all three
    // stops read the same word, and what the row proves is that a stop is
    // counted under its name rather than turned into a number.
    expect(report.counts['run.stop']).toEqual({ quit: 3 });
    expect(report.counts.reach).toEqual({ reached: 2, 'stopped short': 1 });
    expect(report.spreads['run.ending']).toBe(undefined);
  });

  it('names both commits when its tapes were recorded against two', () => {
    // Module test 63. The folder's name is a convenience and the bytes are
    // authoritative (ADR 0057), so the identity is read off the tapes and a
    // batch that spans two builds says so instead of claiming one.
    const against = (seed: number, commitHash: string): MeasuredRun => ({
      seed,
      measurement: {
        ...BASE,
        identity: { ...BASE.identity, commitHash },
      },
    });

    const report = batchReportOf(origin(3), [
      against(900, 'aa038cb310'),
      against(901, 'bb1194de22'),
      against(902, 'aa038cb310'),
    ]);

    expect([...report.identity.commitHashes].sort()).toEqual([
      'aa038cb310',
      'bb1194de22',
    ]);
  });

  it('names every rig its runs were played from, off the tapes themselves', () => {
    // #107: a figure names the starting condition that produced it, and the
    // identity is read off the runs for the same reason the commits are. A
    // batch that spans two rigs says so instead of claiming one.
    const from = (seed: number, rig: 'birthright' | 'maxed'): MeasuredRun => ({
      seed,
      measurement: {
        ...BASE,
        provenance: { ...BASE.provenance, rig },
      },
    });

    const one = batchReportOf(origin(2), [
      from(900, 'birthright'),
      from(901, 'birthright'),
    ]);
    const two = batchReportOf(origin(2), [
      from(900, 'birthright'),
      from(901, 'maxed'),
    ]);

    expect(one.identity.rigs).toEqual(['birthright']);
    expect([...two.identity.rigs].sort()).toEqual(['birthright', 'maxed']);
  });

  it("prints the grave's size spread beside the widths the build fields", () => {
    // Module test 86. Grave-to-mob scale is a ratio the reader takes and never
    // a number the report states, so the report puts the two side by side and
    // says neither which is right nor how far apart they should be.
    const sized = (seed: number, peak: number): MeasuredRun => ({
      seed,
      measurement: {
        ...BASE,
        tuning: {
          ...BASE.tuning,
          gravePath: { ...BASE.tuning.gravePath, sizePerTick: [27, peak, 20] },
        },
      },
    });

    const report = batchReportOf(origin(2), [sized(900, 30), sized(901, 44)]);

    expect(
      requireDefined(
        report.spreads['tuning.gravePath.sizePerTick'],
        'no tuning.gravePath.sizePerTick spread',
      ).summary.max,
    ).toBe(44);
    for (const type of MOB_TYPE_NAMES) {
      expect(report.identity.mobWidths[type]).toBe(
        MOB_TYPES[type].halfWidth * 2,
      );
    }
  });
});
