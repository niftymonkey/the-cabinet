/**
 * Two measured runs side by side (#74 stories 7 and 8). The compare is pure and
 * replays nothing, so every case here is a real report from a short recorded
 * run, varied by rebuilding the one reading under test.
 */

import { describe, expect, it } from 'vitest';

import { TICK_HZ } from '../../game/clock';
import type { TickCommand } from '../../game/command';
import { createExecution, executeTick } from '../../game/execution';
import { WEAPON_LINES } from '../../game/lines/roster';
import type { WeaponLine } from '../../game/lines/roster';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { WITNESS_VERSION } from '../../game/witness';
import { recordInto, sealTrailer, tapeOf } from '../../tape/recorder';
import type { Tape, TapeHeader } from '../../tape/tape';
import type {
  ComparedReading,
  ComparedRuns,
  Comparison,
  ComparisonRefused,
  Delta,
  DescriptiveCompared,
  ListCompared,
  NamedNumbersCompared,
  ScalarCompared,
  SeriesCompared,
} from '../compareRuns';
import { ABSENT, compareRuns, INCOMPARABLE } from '../compareRuns';
import type { Measurement, Metrics } from '../measure';
import { measure } from '../measure';
import { READINGS_VERSION } from '../readingsVersion';

const SEED = 20260826;
const SPACING = 20;
const TICKS = 90;
const PHANTOM_LINE = 'moonlight';
// A checkpoint inside the recorded run, bent so the replay stops agreeing there.
const BENT_CHECKPOINT = 40;

function header(
  run: RunState,
  overrides: Partial<TapeHeader> = {},
): TapeHeader {
  return {
    seed: run.seed,
    startingSize: run.grave.size,
    recordedRoster: [...WEAPON_LINES],
    startingLevels: { ...run.levels },
    tickRate: TICK_HZ,
    checkpointSpacing: SPACING,
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
    ...overrides,
  };
}

function steer(tick: number): TickCommand {
  return {
    move: { x: (tick % 7) / 6 - 0.5, y: (tick % 5) / 4 - 0.5 },
    belch: false,
  };
}

function recordARun(
  overrides: Partial<TapeHeader> = {},
  levels?: Record<WeaponLine, number>,
): Tape {
  const run = createRun(SEED, undefined, levels);
  const execution = createExecution(run);
  const recorder = recordInto(execution, header(run, overrides));
  for (let tick = 0; tick < TICKS; tick++) {
    executeTick(execution, steer(tick));
  }
  sealTrailer(recorder, execution, 0);
  return tapeOf(recorder);
}

function measured(tape: Tape): Metrics {
  const measurement = measure({ tape, truncated: false });
  if (measurement.outcome !== 'verified') {
    throw new Error(`expected verified metrics, got ${measurement.outcome}`);
  }
  return measurement;
}

function refusal(): Measurement {
  const tape = recordARun();
  return measure({
    tape: {
      ...tape,
      header: { ...tape.header, witnessVersion: WITNESS_VERSION + 1 },
    },
    truncated: false,
  });
}

/** A run whose tape stops agreeing with itself partway, which is a divergence. */
function divergence(): Measurement {
  const tape = recordARun();
  const bent = tape.checkpoints.map((checkpoint) =>
    checkpoint.index === BENT_CHECKPOINT
      ? { index: BENT_CHECKPOINT, witness: checkpoint.witness + 1 }
      : checkpoint,
  );
  return measure({ tape: { ...tape, checkpoints: bent }, truncated: false });
}

/** Narrows to the compared arm, failing plainly when the compare refused. */
function compared(comparison: Comparison): ComparedRuns {
  if (comparison.outcome !== 'compared') {
    throw new Error(`expected a comparison, got ${comparison.outcome}`);
  }
  return comparison;
}

/** Narrows to the refused arm, failing plainly when the compare did compare. */
function refused(comparison: Comparison): ComparisonRefused {
  if (comparison.outcome !== 'refused') {
    throw new Error(`expected a refusal, got ${comparison.outcome}`);
  }
  return comparison;
}

function readingNamed(comparison: Comparison, name: string): ComparedReading {
  const found = compared(comparison).readings.find(
    (reading) => reading.reading === name,
  );
  if (found === undefined) throw new Error(`no reading named ${name}`);
  return found;
}

function scalarNamed(comparison: Comparison, name: string): ScalarCompared {
  const reading = readingNamed(comparison, name);
  if (reading.meaning !== 'scalar') {
    throw new Error(`${name} is declared ${reading.meaning}, not scalar`);
  }
  return reading;
}

function namedNumbersNamed(
  comparison: Comparison,
  name: string,
): NamedNumbersCompared {
  const reading = readingNamed(comparison, name);
  if (reading.meaning !== 'namedNumbers') {
    throw new Error(`${name} is declared ${reading.meaning}, not namedNumbers`);
  }
  return reading;
}

function seriesNamed(comparison: Comparison, name: string): SeriesCompared {
  const reading = readingNamed(comparison, name);
  if (reading.meaning !== 'series') {
    throw new Error(`${name} is declared ${reading.meaning}, not series`);
  }
  return reading;
}

function listNamed(comparison: Comparison, name: string): ListCompared {
  const reading = readingNamed(comparison, name);
  if (reading.meaning !== 'list') {
    throw new Error(`${name} is declared ${reading.meaning}, not list`);
  }
  return reading;
}

function descriptiveNamed(
  comparison: Comparison,
  name: string,
): DescriptiveCompared {
  const reading = readingNamed(comparison, name);
  if (reading.meaning !== 'descriptive') {
    throw new Error(`${name} is declared ${reading.meaning}, not descriptive`);
  }
  return reading;
}

/** Every delta one compared reading produced, whichever arm it answered in. */
function deltasOf(reading: ComparedReading): Delta[] {
  if (reading.meaning === 'scalar') return [reading.delta];
  if (reading.meaning === 'namedNumbers') {
    return Object.values(reading.names).map((pair) => pair.delta);
  }
  if (reading.meaning === 'series') {
    return Object.values(reading.summary).map((pair) => pair.delta);
  }
  if (reading.meaning === 'list') return [reading.count.delta];
  return [];
}

describe('compareRuns', () => {
  it('gives a scalar reading its left, its right, and their delta', () => {
    // The scalar rule: left, right, and the arithmetic between them, which is
    // the hand arithmetic story 7 exists to remove.
    const base = measured(recordARun());
    const later: Metrics = {
      ...base,
      run: { ...base.run, kills: base.run.kills + 5 },
    };

    const kills = scalarNamed(compareRuns(base, later), 'run.kills');

    expect(kills.left).toBe(base.run.kills);
    expect(kills.right).toBe(base.run.kills + 5);
    expect(kills.delta).toBe(5);
  });

  it("compares a named numeric record over the union of both sides' keys", () => {
    // Named numbers are keyed by weapon line, mob type, hit source or food
    // kind, so the comparison walks the keys rather than a compiled list.
    const base = measured(recordARun());
    const levelled: Metrics = {
      ...base,
      endLevels: { ...base.endLevels, bell: base.endLevels.bell + 4 },
    };

    const levels = namedNumbersNamed(compareRuns(base, levelled), 'endLevels');

    expect(Object.keys(levels.names).sort()).toEqual(
      Object.keys(base.endLevels).sort(),
    );
    expect(levels.names.bell).toEqual({
      left: base.endLevels.bell,
      right: base.endLevels.bell + 4,
      delta: 4,
    });
    expect(levels.names.soulStream.delta).toBe(0);
  });

  it('leaves a key present on one side only absent on the missing side, never zero-filled and never given a delta', () => {
    // A run that ate no feast has no multiplier to report for one. Zero would
    // say it ate feasts that paid nothing, which is a different claim.
    const base = measured(recordARun());
    const feasting: Metrics = {
      ...base,
      tuning: {
        ...base.tuning,
        freshnessPaid: {
          ...base.tuning.freshnessPaid,
          swallows: { ...base.tuning.freshnessPaid.swallows, feast: 2 },
        },
      },
    };

    const swallows = namedNumbersNamed(
      compareRuns(base, feasting),
      'tuning.freshnessPaid.swallows',
    );

    expect(swallows.names.feast).toEqual({
      left: ABSENT,
      right: 2,
      delta: ABSENT,
    });
  });

  it("compares a declared per-tick series through that reading's own declared summary, and never through one inferred from its shape", () => {
    // Two readings of the same runtime shape, a number array over ticks, are
    // summarised differently because each declares its own summary. A summary
    // inferred from the shape could not tell them apart.
    const base = measured(recordARun());
    const comparison = compareRuns(base, base);

    const population = seriesNamed(comparison, 'mobsAlivePerTick');
    const size = seriesNamed(comparison, 'tuning.gravePath.sizePerTick');

    expect(Object.keys(population.summary)).toEqual(['last', 'max', 'mean']);
    expect(Object.keys(size.summary)).toEqual([
      'first',
      'last',
      'min',
      'max',
      'mean',
    ]);
    expect(size.summary.first.left).toBe(base.tuning.gravePath.sizePerTick[0]);
    expect(size.summary.first.delta).toBe(0);
  });

  it('summarises an empty series as absent on that side, and gives it no delta', () => {
    // Absence is absence. A side with no samples has nothing to average, and a
    // zero would read as a measurement of zero rather than as no measurement,
    // which is the one thing the comparison rule forbids most plainly.
    const base = measured(recordARun());
    const unsampled: Metrics = {
      ...base,
      tuning: {
        ...base.tuning,
        gravePath: { ...base.tuning.gravePath, sizePerTick: [] },
      },
    };

    const size = seriesNamed(
      compareRuns(unsampled, base),
      'tuning.gravePath.sizePerTick',
    );

    expect(base.tuning.gravePath.sizePerTick.length).toBeGreaterThan(0);
    for (const figure of Object.keys(size.summary)) {
      expect(size.summary[figure].left).toBe(ABSENT);
      expect(size.summary[figure].delta).toBe(ABSENT);
    }
    expect(size.summary.first.right).toBe(base.tuning.gravePath.sizePerTick[0]);
  });

  it("shows a record list as each side's count with both lists carried, pairing no entries", () => {
    // No entry is paired with another, because no list declares a key it could
    // be trusted to pair on. Both sides are carried whole instead.
    const base = measured(recordARun());
    const fired: Metrics = {
      ...base,
      tuning: {
        ...base.tuning,
        belchCadence: {
          ...base.tuning.belchCadence,
          fires: [{ tick: 12, killed: 3, cancelled: 4 }],
        },
      },
    };

    const fires = listNamed(
      compareRuns(base, fired),
      'tuning.belchCadence.fires',
    );

    expect(fires.count).toEqual({ left: 0, right: 1, delta: 1 });
    expect(fires.leftEntries).toEqual([]);
    expect(fires.rightEntries).toEqual([{ tick: 12, killed: 3, cancelled: 4 }]);
    expect(Object.keys(fires).sort()).toEqual([
      'count',
      'leftEntries',
      'meaning',
      'reading',
      'rightEntries',
    ]);
  });

  it('shows provenance, identity, strings and booleans side by side, inventing no arithmetic', () => {
    // Story 16's rules keep applying, and nothing here subtracts a string.
    const base = measured(recordARun());
    const bot = measured(recordARun({ inputDevice: 'bot' }));

    const comparison = compareRuns(base, bot);
    const provenance = descriptiveNamed(comparison, 'provenance');
    const ending = descriptiveNamed(comparison, 'run.ending');
    const sealed = descriptiveNamed(comparison, 'run.sealed');

    expect(provenance.left).toEqual(base.provenance);
    expect(provenance.right).toEqual(bot.provenance);
    expect(ending.left).toBeNull();
    expect(sealed.right).toBe(true);
    expect(Object.keys(provenance).sort()).toEqual([
      'left',
      'meaning',
      'reading',
      'right',
    ]);
  });

  it('refuses a report that is not verified', () => {
    // ADR 0019's honesty rule reaches the compare: a refusal carries no
    // metrics, so there is nothing to put beside anything.
    const base = measured(recordARun());

    const comparison = compareRuns(base, refusal());

    expect(comparison).toEqual({
      outcome: 'refused',
      left: { outcome: 'verified' },
      right: {
        outcome: 'witnessVersionMismatch',
        tapeWitnessVersion: WITNESS_VERSION + 1,
        readerWitnessVersion: WITNESS_VERSION,
      },
    });
  });

  it('carries why the side it refused was not comparable', () => {
    // A refusal that said only which arm each side answered in would send the
    // reader back to re-run the measurement to learn what was wrong with it.
    // The side's own reason travels with the refusal instead.
    const base = measured(recordARun());
    const diverged = divergence();

    const comparison = refused(compareRuns(base, diverged));

    expect(comparison.left).toEqual({ outcome: 'verified' });
    expect(comparison.right).toEqual(diverged);
    expect(comparison.right).toMatchObject({
      outcome: 'diverged',
      firstDivergentCheckpoint: BENT_CHECKPOINT,
    });
  });

  it("never refuses because the builds differ, and shows each side's commit hash and build identity", () => {
    // A commit hash is human-readable metadata and never a fidelity gate, and
    // the build identity is reserved and unresolved by deliberate decision. A
    // cross-build comparison is explicit rather than forbidden.
    const before = measured(recordARun({ commitHash: 'aa038cb310' }));
    const after = measured(
      recordARun({ commitHash: 'ff91230abc', buildIdentity: 'nightly-7' }),
    );

    const comparison = compareRuns(before, after);
    const identity = descriptiveNamed(comparison, 'identity');

    expect(comparison.outcome).toBe('compared');
    expect(identity.left).toEqual({
      commitHash: 'aa038cb310',
      buildIdentity: '',
    });
    expect(identity.right).toEqual({
      commitHash: 'ff91230abc',
      buildIdentity: 'nightly-7',
    });
  });

  it("shows each side's readings version", () => {
    // Subtracting two version numbers produces a number that means nothing, so
    // the version shows side by side the way identity and provenance do.
    const base = measured(recordARun());
    const later: Metrics = {
      ...base,
      readingsVersion: base.readingsVersion + 1,
    };

    const comparison = compareRuns(base, later);
    const version = descriptiveNamed(comparison, 'readingsVersion');

    expect(version.left).toBe(READINGS_VERSION);
    expect(version.right).toBe(READINGS_VERSION + 1);
  });

  it("withholds every delta when the two sides' readings versions differ, while still showing both sides' values", () => {
    // Two reports whose readings mean different things are both real
    // measurements, so their values stand. The arithmetic between them does
    // not: the same tape once read 366 ticks near the bottom edge and later
    // 560, and a delta of 194 would have been a subtraction across two
    // questions rather than a measurement of anything.
    const base = measured(recordARun());
    const later: Metrics = {
      ...base,
      readingsVersion: base.readingsVersion + 1,
      run: { ...base.run, kills: base.run.kills + 5 },
    };

    const comparison = compared(compareRuns(base, later));

    expect(comparison.readingsVersions).toEqual({
      left: base.readingsVersion,
      right: base.readingsVersion + 1,
      matched: false,
    });
    for (const reading of comparison.readings) {
      for (const delta of deltasOf(reading)) {
        expect(delta, `${reading.reading} kept a delta`).toBe(INCOMPARABLE);
      }
    }

    const kills = scalarNamed(comparison, 'run.kills');
    expect(kills.left).toBe(base.run.kills);
    expect(kills.right).toBe(base.run.kills + 5);
  });

  it('marks a withheld delta incomparable rather than absent, so a definition mismatch is not read as a missing key', () => {
    // Absent says this side has no such key. Incomparable says both sides have
    // one and we will not subtract them. Spelling both silences the same word
    // would blur exactly the distinction the readings version exists to draw.
    const base = measured(recordARun());
    const feasting: Metrics = {
      ...base,
      readingsVersion: base.readingsVersion + 1,
      tuning: {
        ...base.tuning,
        freshnessPaid: {
          ...base.tuning.freshnessPaid,
          swallows: { ...base.tuning.freshnessPaid.swallows, feast: 2 },
        },
      },
    };

    const comparison = compareRuns(base, feasting);
    const swallows = namedNumbersNamed(
      comparison,
      'tuning.freshnessPaid.swallows',
    );
    const kills = scalarNamed(comparison, 'run.kills');

    expect(INCOMPARABLE).not.toBe(ABSENT);
    // A key one side genuinely lacks still shows its absence where the value
    // is; only the arithmetic is renamed.
    expect(swallows.names.feast).toEqual({
      left: ABSENT,
      right: 2,
      delta: INCOMPARABLE,
    });
    expect(kills.delta).toBe(INCOMPARABLE);
    expect(kills.delta).not.toBe(ABSENT);
  });

  it("compares normally when the two sides' readings versions match", () => {
    // The suppression is the exception and not the rule. Two reports computed
    // under the same definitions subtract exactly as they did before.
    const base = measured(recordARun());
    const later: Metrics = {
      ...base,
      run: { ...base.run, kills: base.run.kills + 5 },
    };

    const comparison = compared(compareRuns(base, later));

    expect(comparison.readingsVersions).toEqual({
      left: base.readingsVersion,
      right: base.readingsVersion,
      matched: true,
    });
    expect(scalarNamed(comparison, 'run.kills').delta).toBe(5);
    for (const reading of comparison.readings) {
      for (const delta of deltasOf(reading)) {
        expect(delta, `${reading.reading} withheld a delta`).not.toBe(
          INCOMPARABLE,
        );
      }
    }
  });

  it("carries a weapon line one side's own data names into the comparison with no change to the compare", () => {
    // Story 11 inside the compare: the named-numbers rule walks the union of
    // keys, so a line only one side names arrives without the compare knowing
    // it. The extra name is put on the measurement rather than into a recorded
    // run, because ADR 0043 makes a tape's roster the tape's own and this
    // build's own: a tape naming a line this build cannot implement is refused
    // for replay and yields no metrics at all, so it can no longer be the way
    // an unexpected name reaches the compare.
    const base = measured(recordARun());
    const withExtra = { ...base.damage };
    const named: Record<string, number> = withExtra;
    named[PHANTOM_LINE] = 0;
    const extra: Metrics = { ...base, damage: withExtra };

    const damage = namedNumbersNamed(compareRuns(base, extra), 'damage');

    expect(damage.names[PHANTOM_LINE]).toEqual({
      left: ABSENT,
      right: 0,
      delta: ABSENT,
    });
  });
});
