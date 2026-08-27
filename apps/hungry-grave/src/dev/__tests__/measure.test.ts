/**
 * The measurement seam (#58 slice 4): measure(decoded) consumes the one
 * playback primitive and answers in one of three arms (ADR 0019), with
 * metrics only from a verified replay.
 *
 * The expected numbers come from the recording itself: every tally here is
 * taken off the original run's own event stream and pools at record time, a
 * path measure never touches, so the replayed report is checked against an
 * independent capture rather than against its own output.
 */

import { describe, expect, it } from 'vitest';

import { TICK_HZ } from '../../game/clock';
import { createExecution, executeTick } from '../../game/execution';
import { WEAPON_LINES } from '../../game/lines/roster';
import type { WeaponLine } from '../../game/lines/roster';
import type { TickCommand } from '../../game/command';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { SIZE_START } from '../../game/tuning';
import { WITNESS_VERSION } from '../../game/witness';
import type { DecodedTape } from '../../tape/decode';
import { decodeTape } from '../../tape/decode';
import { encodeTape } from '../../tape/encode';
import {
  recordFrame,
  recordInto,
  sealTrailer,
  tapeOf,
} from '../../tape/recorder';
import type { FrameObservation, Tape, TapeHeader } from '../../tape/tape';
import type { Measurement, Metrics } from '../measure';
import { measure } from '../measure';
import { READINGS_VERSION } from '../readingsVersion';
import type { FieldDensity, LevelUp } from '../replayTallies';

const SEED = 20260823;
const SPACING = 20;
const SMALL_TICKS = 90;

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

/** A steering script with a shape, so a body of zeroes cannot pass by accident. */
function steer(tick: number): TickCommand {
  return {
    move: { x: (tick % 7) / 6 - 0.5, y: (tick % 5) / 4 - 0.5 },
    belch: false,
  };
}

/** One small recorded run, through the one execution authority the game plays through. */
function recordARun(
  overrides: Partial<TapeHeader> = {},
  options: { seal?: boolean; size?: number } = {},
): Tape {
  const run = createRun(SEED, options.size);
  const execution = createExecution(run);
  const recorder = recordInto(execution, header(run, overrides));
  for (let tick = 0; tick < SMALL_TICKS; tick++) {
    executeTick(execution, steer(tick));
  }
  if (options.seal !== false) sealTrailer(recorder, execution, 0);
  return tapeOf(recorder);
}

/**
 * A line no build in this tree implements, used to stand for content a tape
 * names and this reader does not have (ADR 0043).
 */
const PHANTOM_LINE = 'moonlight';

/**
 * A tape recorded against a roster this build does not implement.
 *
 * The roster is bent on the decoded header rather than played, because a run
 * cannot be played on lines the simulation does not have: the tape is the
 * artifact of some other build, which is exactly the case ADR 0043 is about.
 */
function aPhantomRosterTape(): Tape {
  const tape = recordARun();
  return {
    ...tape,
    header: {
      ...tape.header,
      recordedRoster: [...tape.header.recordedRoster, PHANTOM_LINE],
      startingLevels: { ...tape.header.startingLevels, [PHANTOM_LINE]: 1 },
    },
  };
}

function decodedOf(tape: Tape): DecodedTape {
  return { tape, truncated: false };
}

/** Narrows to the metrics arm, failing the test plainly when the replay did not verify. */
function verified(measurement: Measurement): Metrics {
  if (measurement.outcome !== 'verified') {
    throw new Error(`expected verified metrics, got ${measurement.outcome}`);
  }
  return measurement;
}

function liveCount(pool: readonly { alive: boolean }[]): number {
  return pool.reduce((count, slot) => count + (slot.alive ? 1 : 0), 0);
}

function densityOf(run: RunState): FieldDensity {
  return {
    mobs: liveCount(run.mobs),
    shots: liveCount(run.mobFire),
    corpses: liveCount(run.corpses),
    skulls: liveCount(run.skulls),
    wisps: liveCount(run.wisps),
  };
}

/**
 * The damage arms the run itself names: the lines in its own levels record,
 * with the belch beside them. Written this way rather than as five literals so
 * the record-time tally and the report are enumerated from the same source.
 */
function emptyDamage(run: RunState): Record<string, number> {
  const arms: Record<string, number> = { belch: 0 };
  for (const line of Object.keys(run.levels)) arms[line] = 0;
  return arms;
}

/**
 * The rich fixture: a long conditioned run whose levelled lines and permanent
 * belch command make every damage arm, level-ups and a busy field actually
 * happen. Seed, size, levels and length were picked by running the sim once
 * and checking all of that occurs; the expected values are still the record
 * time tallies, never those exploratory numbers.
 */
const RICH_SEED = 414243;
const RICH_SIZE = 67;
const RICH_LEVELS: Readonly<Record<WeaponLine, number>> = {
  soulStream: 5,
  territory: 4,
  wisps: 3,
  bell: 2,
};
const RICH_TICKS = 6000;
const RICH_SPACING = 60;
/** The ticks the rich fixture's expensive frames start at; zero pins the empty starting field. */
const RICH_EXPENSIVE_TICKS = [0, 1200, 4500];

function richSteer(tick: number): TickCommand {
  return {
    move: { x: Math.sin(tick / 45), y: Math.sin(tick / 200) * 0.4 },
    belch: true,
  };
}

interface RichRecording {
  readonly measured: Metrics;
  readonly damage: Record<string, number>;
  readonly endLevels: Record<string, number>;
  readonly levelUps: LevelUp[];
  readonly mobsAlive: number[];
  readonly kills: number;
  readonly score: number;
  readonly densities: Map<number, FieldDensity>;
}

function recordRichRun(): RichRecording {
  const run = createRun(RICH_SEED, RICH_SIZE, RICH_LEVELS);
  const execution = createExecution(run);
  const recorder = recordInto(
    execution,
    header(run, { checkpointSpacing: RICH_SPACING }),
  );
  const damage = emptyDamage(run);
  const levelUps: LevelUp[] = [];
  const mobsAlive: number[] = [0];
  const densities = new Map<number, FieldDensity>();
  let kills = 0;
  for (let tick = 0; tick < RICH_TICKS; tick++) {
    // The field as the frame starting at this tick would begin on: the state
    // after `tick` ticks have run, captured before this one executes.
    if (RICH_EXPENSIVE_TICKS.includes(tick)) {
      densities.set(tick, densityOf(run));
    }
    const events = executeTick(execution, richSteer(tick));
    for (const event of events) {
      if (event.type === 'mobDamaged') damage[event.source] += event.amount;
      if (event.type === 'mobKilled') kills += 1;
      if (event.type === 'weaponLeveled') {
        levelUps.push({ line: event.line, level: event.level, tick: run.tick });
      }
    }
    mobsAlive.push(liveCount(run.mobs));
    recordFrame(recorder, {
      reason: 'live',
      tickIndex: tick,
      ticksExecuted: 1,
      intervalMs: RICH_EXPENSIVE_TICKS.includes(tick) ? 40 : 16.7,
      advanceMs: 0.3,
      updateMs: 1.1,
      debtTicks: 0,
    });
  }
  sealTrailer(recorder, execution, 0);
  const measured = verified(measure(decodedOf(tapeOf(recorder))));
  return {
    measured,
    damage,
    endLevels: { ...run.levels },
    levelUps,
    mobsAlive,
    kills,
    score: run.score,
    densities,
  };
}

let richMemo: RichRecording | null = null;
function richFixture(): RichRecording {
  richMemo ??= recordRichRun();
  return richMemo;
}

describe('measure', () => {
  it("reports damage under the arms the run's own lines name, the belch beside them", () => {
    // #45's damage-contribution read: attribution is per source, and the belch
    // is an arm beside the lines rather than folded into any of them. The arms
    // come from the replayed run's own levels record (#74 story 11), so the
    // expected key set is enumerated the same way rather than written out.
    const rich = richFixture();
    const damage: Record<string, number> = rich.measured.damage;

    expect(Object.keys(damage).sort()).toEqual(Object.keys(rich.damage).sort());
    expect(damage).toEqual(rich.damage);
    expect(rich.measured.damage.soulStream).toBeGreaterThan(0);
    expect(rich.measured.damage.territory).toBeGreaterThan(0);
    expect(rich.measured.damage.wisps).toBeGreaterThan(0);
    expect(rich.measured.damage.bell).toBeGreaterThan(0);
    expect(rich.measured.damage.belch).toBeGreaterThan(0);
  });

  it('reports the tick each line reached each level from the replayed weaponLeveled events', () => {
    // #45's when-did-a-level-land read, against the record-time rows.
    const rich = richFixture();

    expect(rich.levelUps.length).toBeGreaterThan(0);
    expect(rich.measured.levelUps).toEqual(rich.levelUps);
  });

  it('reports the mob population per tick, index N the field after N ticks', () => {
    // The indexing is ADR 0019's checkpoint indexing on purpose: index 0 is
    // the empty starting field, before any tick has run.
    const rich = richFixture();

    expect(Math.max(...rich.mobsAlive)).toBeGreaterThan(0);
    expect(rich.measured.mobsAlivePerTick).toHaveLength(RICH_TICKS + 1);
    expect(rich.measured.mobsAlivePerTick[0]).toBe(0);
    expect(rich.measured.mobsAlivePerTick).toEqual(rich.mobsAlive);
  });

  it('recomputes the run summary from the replay: ticks, ending, score and kills', () => {
    const rich = richFixture();

    expect(rich.measured.run.ticks).toBe(RICH_TICKS);
    expect(rich.measured.run.ending).toBeNull();
    expect(rich.measured.run.score).toBe(rich.score);
    expect(rich.measured.run.kills).toBe(rich.kills);
    expect(rich.measured.run.checkpointsVerified).toBe(
      RICH_TICKS / RICH_SPACING + 1,
    );
    expect(rich.measured.run.checkpointsUnreachable).toBe(0);
  });

  it('joins each expensive frame to the field density its frame began on', () => {
    // The join is the tick index into the same single replay, so the density
    // is checked against the pools counted at record time, and a frame that
    // bought no tick has no field to join to.
    const rich = richFixture();
    const expensive = rich.measured.performance.expensiveFrames;

    expect(expensive.map((frame) => frame.tick)).toEqual(RICH_EXPENSIVE_TICKS);
    for (const frame of expensive) {
      expect(frame.tick).not.toBeNull();
      if (frame.tick !== null) {
        expect(frame.density).toEqual(rich.densities.get(frame.tick));
      }
    }
    expect(rich.densities.get(0)).toEqual({
      mobs: 0,
      shots: 0,
      corpses: 0,
      skulls: 0,
      wisps: 0,
    });
  });

  it('touches the playback primitive once: the density join never reproduces per frame', () => {
    // One pass is the rule in the spec's own words. Each command index is read
    // exactly once by one playback loop, so a second reproduction, whole or
    // partial, would read some index twice.
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));
    const densities = new Map<number, FieldDensity>();
    for (let tick = 0; tick < SMALL_TICKS; tick++) {
      if (tick === 30 || tick === 60) densities.set(tick, densityOf(run));
      executeTick(execution, steer(tick));
      recordFrame(recorder, {
        reason: 'live',
        tickIndex: tick,
        ticksExecuted: 1,
        intervalMs: tick === 30 || tick === 60 ? 40 : 16.7,
        advanceMs: 0.3,
        updateMs: 1.1,
        debtTicks: 0,
      });
    }
    recordFrame(recorder, {
      reason: 'paused',
      tickIndex: null,
      ticksExecuted: 0,
      intervalMs: 300,
      advanceMs: 0,
      updateMs: 0.1,
      debtTicks: 0,
    });
    sealTrailer(recorder, execution, 0);
    const tape = tapeOf(recorder);

    const reads = new Map<string, number>();
    const counted = new Proxy(tape.commands, {
      get(target, property, receiver) {
        if (typeof property === 'string' && /^\d+$/.test(property)) {
          reads.set(property, (reads.get(property) ?? 0) + 1);
        }
        return Reflect.get(target, property, receiver);
      },
    });

    const measured = verified(
      measure(decodedOf({ ...tape, commands: counted })),
    );

    expect(measured.run.ticks).toBe(SMALL_TICKS);
    expect(
      measured.performance.expensiveFrames.map((frame) => frame.tick),
    ).toEqual([30, 60, null]);
    expect(measured.performance.expensiveFrames[0].density).toEqual(
      densities.get(30),
    );
    expect(measured.performance.expensiveFrames[1].density).toEqual(
      densities.get(60),
    );
    expect(measured.performance.expensiveFrames[2].density).toBeNull();
    expect(reads.size).toBeGreaterThan(0);
    for (const [index, count] of reads) {
      expect(count, `command ${index} read ${count} times`).toBe(1);
    }
  });

  it('reads the performance report off the frame rows: distributions, catch-up and debt', () => {
    // Manufactured rows with hand-computed expectations, since the
    // observations sit outside the witness and verify whatever they say.
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));
    for (let tick = 0; tick < SMALL_TICKS; tick++) {
      executeTick(execution, steer(tick));
    }
    const rows: Omit<FrameObservation, 'kind'>[] = [
      {
        reason: 'live',
        tickIndex: 0,
        ticksExecuted: 1,
        intervalMs: 16,
        advanceMs: 0.2,
        updateMs: 1,
        debtTicks: 0,
      },
      {
        reason: 'live',
        tickIndex: 1,
        ticksExecuted: 1,
        intervalMs: 16,
        advanceMs: 0.2,
        updateMs: 1,
        debtTicks: 0,
      },
      {
        reason: 'live',
        tickIndex: 2,
        ticksExecuted: 3,
        intervalMs: 50,
        advanceMs: 1.5,
        updateMs: 3,
        debtTicks: 4,
      },
      {
        reason: 'live',
        tickIndex: 5,
        ticksExecuted: 1,
        intervalMs: 16,
        advanceMs: 0.2,
        updateMs: 1,
        debtTicks: 4,
      },
      {
        reason: 'live',
        tickIndex: 6,
        ticksExecuted: 2,
        intervalMs: 20,
        advanceMs: 0.4,
        updateMs: 1.6,
        debtTicks: 2,
      },
      {
        reason: 'paused',
        tickIndex: null,
        ticksExecuted: 0,
        intervalMs: 300,
        advanceMs: 0,
        updateMs: 0.1,
        debtTicks: 2,
      },
    ];
    for (const row of rows) recordFrame(recorder, row);
    sealTrailer(recorder, execution, 0);

    const measured = verified(measure(decodedOf(tapeOf(recorder))));
    const performance = measured.performance;

    expect(performance.frames).toBe(6);
    // intervals sorted: 16 16 16 20 50 300; nearest-rank p50 is the third.
    expect(performance.interval.count).toBe(6);
    expect(performance.interval.min).toBe(16);
    expect(performance.interval.max).toBe(300);
    expect(performance.interval.mean).toBeCloseTo(418 / 6, 6);
    expect(performance.interval.p50).toBe(16);
    expect(performance.interval.p95).toBe(300);
    expect(performance.interval.p99).toBe(300);
    // ticks per frame sorted: 0 1 1 1 2 3.
    expect(performance.ticksPerFrame.min).toBe(0);
    expect(performance.ticksPerFrame.max).toBe(3);
    expect(performance.ticksPerFrame.p50).toBe(1);
    expect(performance.advance.max).toBe(1.5);
    expect(performance.update.max).toBe(3);
    expect(performance.catchUpFrames).toBe(2);
    // Debt is sampled only where it changed, the first row always included.
    expect(performance.debtOverTime).toEqual([
      { frame: 0, tick: 0, debtTicks: 0 },
      { frame: 2, tick: 2, debtTicks: 4 },
      { frame: 4, tick: 6, debtTicks: 2 },
    ]);
    expect(performance.expensiveFrames.map((frame) => frame.frame)).toEqual([
      2, 5,
    ]);
  });

  it('returns the divergence arm naming the first divergent checkpoint, and no metrics', () => {
    // ADR 0019: metrics only from a verified replay, so the arm is the whole
    // answer and carries nothing a caller could mistake for one.
    const sound = recordARun();
    const bent = sound.checkpoints.map((checkpoint) =>
      checkpoint.index === 40
        ? { index: 40, witness: checkpoint.witness + 1 }
        : checkpoint,
    );

    const measured = measure(decodedOf({ ...sound, checkpoints: bent }));

    expect(measured).toEqual({
      outcome: 'diverged',
      firstDivergentCheckpoint: 40,
      checkpointsVerified: 2,
      ticksReproduced: 40,
    });
  });

  it('returns the refusal arm for a witness version mismatch, and never a divergence', () => {
    // ADR 0019: the fold demonstrably widens, so without this arm every tape
    // recorded before a widening would read as a run that did not happen.
    const tape = recordARun();

    const measured = measure(
      decodedOf({
        ...tape,
        header: { ...tape.header, witnessVersion: WITNESS_VERSION + 1 },
      }),
    );

    expect(measured).toEqual({
      outcome: 'witnessVersionMismatch',
      tapeWitnessVersion: WITNESS_VERSION + 1,
      readerWitnessVersion: WITNESS_VERSION,
    });
  });

  it("reports a sealed tape's own fact: the trailer was written", () => {
    const measured = verified(measure(decodedOf(recordARun())));

    expect(measured.run.sealed).toBe(true);
    expect(measured.run.truncated).toBe(false);
    expect(measured.run.stop).toBe('quit');
    expect(measured.run.integrity).toBe('clean');
  });

  it("reports a clean trailerless tape's own fact: the tab-closed reading", () => {
    const measured = verified(
      measure(decodedOf(recordARun({}, { seal: false }))),
    );

    expect(measured.run.sealed).toBe(false);
    expect(measured.run.truncated).toBe(false);
    expect(measured.run.stop).toBe('unknown');
    expect(measured.run.integrity).toBeNull();
  });

  it("reports a truncated tape's own fact: the bytes ran out mid-record", () => {
    // Truncation is the decoder's fact, which is why the seam takes the
    // decoded artifact. The cut lands inside the observations chunk, so the
    // body and witness still verify in full.
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));
    for (let tick = 0; tick < SMALL_TICKS; tick++) {
      executeTick(execution, steer(tick));
      recordFrame(recorder, {
        reason: 'live',
        tickIndex: tick,
        ticksExecuted: 1,
        intervalMs: 16.7,
        advanceMs: 0.3,
        updateMs: 1.1,
        debtTicks: 0,
      });
    }
    sealTrailer(recorder, execution, 0);
    const bytes = encodeTape(tapeOf(recorder));
    const decoded = decodeTape(bytes.slice(0, bytes.length - 40));
    expect(decoded.truncated).toBe(true);

    const measured = verified(measure(decoded));

    expect(measured.run.truncated).toBe(true);
    expect(measured.run.sealed).toBe(false);
    expect(measured.run.stop).toBe('unknown');
    expect(measured.run.ticks).toBe(SMALL_TICKS);
    expect(measured.run.checkpointsUnreachable).toBe(0);
  });

  it('labels a bot tape and keeps it out of the default aggregate', () => {
    // The bot only dodges, so its numbers measure the policy and never a
    // player; a default aggregate holding them would say the game got easier
    // because the policy got lucky.
    const measured = verified(
      measure(decodedOf(recordARun({ inputDevice: 'bot' }))),
    );

    expect(measured.provenance).toEqual({
      inputDevice: 'bot',
      conditioned: false,
      exclusions: ['bot'],
    });
  });

  it('labels a conditioned run and keeps it out of the default aggregate', () => {
    // Conditioned is a resolved start differing from today's birthright. A
    // birthright retune mislabels old tapes toward exclusion, which is the
    // safe direction.
    const measured = verified(
      measure(decodedOf(recordARun({ inputDevice: 'keyboard' }, { size: 40 }))),
    );

    expect(measured.provenance).toEqual({
      inputDevice: 'keyboard',
      conditioned: true,
      exclusions: ['conditioned'],
    });
  });

  it('leaves a keyboard run from the birthright inside the default aggregate', () => {
    const measured = verified(
      measure(decodedOf(recordARun({ inputDevice: 'keyboard' }))),
    );

    expect(measured.provenance).toEqual({
      inputDevice: 'keyboard',
      conditioned: false,
      exclusions: [],
    });
  });

  it("names the weapon lines from the tape's own recorded roster and not from a compiled list", () => {
    // Story 11: a line added to the pool appears in the readings without the
    // instrument changing. What names the lines is the roster the tape carries,
    // read back off the header before a tick has run, so a pool that grows
    // needs no edit here.
    const measured = verified(measure(decodedOf(recordARun())));
    const damage: Record<string, number> = measured.damage;
    const endLevels: Record<string, number> = measured.endLevels;

    expect(Object.keys(damage).sort()).toEqual(
      ['belch', ...WEAPON_LINES].sort(),
    );
    expect(Object.keys(endLevels).sort()).toEqual([...WEAPON_LINES].sort());
  });

  it('refuses a tape whose recorded roster this build does not implement, and names it', () => {
    // ADR 0043: reading and replaying are two different obligations. The header
    // is still readable and says what it says, but a simulation cannot run a
    // line it does not have, so the refusal is precise, naming the roster,
    // rather than a fabricated set of metrics over a cast that never played.
    //
    // This supersedes the earlier shape of story 11's evidence, which measured
    // a run whose levels record named a line the roster did not and expected
    // metrics back. That is the exact case ADR 0043 rules must report nothing.
    const measurement = measure(decodedOf(aPhantomRosterTape()));

    expect(measurement.outcome).toBe('rosterNotImplemented');
    if (measurement.outcome !== 'rosterNotImplemented') return;
    expect(measurement.recordedRoster).toContain(PHANTOM_LINE);
    expect('tuning' in measurement).toBe(false);
  });

  it('reports where every line finished', () => {
    // Story 6: two runs' end states sit side by side, which needs the levels
    // the run finished on rather than the ones it started from.
    const rich = richFixture();
    const endLevels: Record<string, number> = rich.measured.endLevels;

    expect(endLevels).toEqual(rich.endLevels);
    expect(endLevels).not.toEqual(RICH_LEVELS);
  });

  it('reports its own lines at zero when the tape carries no command', () => {
    // ADR 0019's honesty rule reaches the shape of a reading and not only the
    // arm it rides on: damage and endLevels are whole records, so a sealed tape
    // with nothing in it reports the lines the run named and the levels it
    // started from, never an empty record whose type claims a completeness it
    // does not have.
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));
    sealTrailer(recorder, execution, 0);

    const measured = verified(measure(decodedOf(tapeOf(recorder))));

    expect(measured.run.ticks).toBe(0);
    expect(measured.damage).toEqual(emptyDamage(run));
    expect(measured.endLevels).toEqual({ ...run.levels });
    expect(measured.tuning.engagements.hitsByLine).toEqual(emptyDamage(run));
    expect(measured.tuning.engagements.fatalBlows).toEqual(emptyDamage(run));
  });

  it('carries the tuning readings on the verified arm only, never on a divergence or a refusal', () => {
    // ADR 0019's honesty rule: metrics come only from a verified replay, so a
    // diverged or refused tape carries no reading a caller could mistake for
    // one. The readings ride the same arm as the rest of the report.
    const rich = richFixture();
    expect(rich.measured.tuning.gravePath.sizePerTick).toHaveLength(
      RICH_TICKS + 1,
    );

    const sound = recordARun();
    const bent = sound.checkpoints.map((checkpoint) =>
      checkpoint.index === 40
        ? { index: 40, witness: checkpoint.witness + 1 }
        : checkpoint,
    );
    const diverged = measure(decodedOf({ ...sound, checkpoints: bent }));
    const refused = measure(
      decodedOf({
        ...sound,
        header: { ...sound.header, witnessVersion: WITNESS_VERSION + 1 },
      }),
    );

    expect('tuning' in diverged).toBe(false);
    expect('tuning' in refused).toBe(false);
  });

  it('carries the readings version on the verified arm, and never on a divergence or a refusal', () => {
    // The witness proves a replay reproduced its recorded run. It says nothing
    // about whether two reports measured the same thing the same way, and the
    // readings version is the field that does. It rides the verified arm alone,
    // because a divergence and a refusal carry no readings to have a version of.
    const sound = recordARun();

    const measured = verified(measure(decodedOf(sound)));

    expect(measured.readingsVersion).toBe(READINGS_VERSION);
    // A sibling of identity rather than a field inside it: identity is tape
    // header data carried verbatim, and this is the instrument's own fact.
    expect('readingsVersion' in measured.identity).toBe(false);

    const bent = sound.checkpoints.map((checkpoint) =>
      checkpoint.index === 40
        ? { index: 40, witness: checkpoint.witness + 1 }
        : checkpoint,
    );
    const diverged = measure(decodedOf({ ...sound, checkpoints: bent }));
    const refused = measure(
      decodedOf({
        ...sound,
        header: { ...sound.header, witnessVersion: WITNESS_VERSION + 1 },
      }),
    );

    expect('readingsVersion' in diverged).toBe(false);
    expect('readingsVersion' in refused).toBe(false);
  });

  it('keeps the existing provenance and exclusions applying with the new readings present', () => {
    // Story 16: a bot run's readings are the policy's numbers, not a player's,
    // so the exclusion has to keep travelling with them.
    const measured = verified(
      measure(decodedOf(recordARun({ inputDevice: 'bot' }))),
    );

    expect(measured.provenance.exclusions).toEqual(['bot']);
    expect(measured.tuning.dropLedger.spawned).toBeGreaterThanOrEqual(0);
    expect(measured.tuning.gravePath.sizePerTick[0]).toBe(SIZE_START);
  });

  it("keeps the tape's recorded faults and today's readback faults separate lists", () => {
    // ADR 0024: recorded faults are the original run's history and a replay
    // never rewrites them; a faulted run is also excluded from the default
    // aggregate (ADR 0019).
    const tape = recordARun();
    const carrying: Tape = {
      ...tape,
      observations: [
        ...tape.observations,
        {
          kind: 'fault',
          identity: 'reservoir in range',
          severity: 'recoverable',
          firstTick: 12,
          detail: 'reservoir is 1.4',
          count: 3,
        },
      ],
    };

    const measured = verified(measure(decodedOf(carrying)));

    expect(measured.recordedFaults).toEqual([
      {
        kind: 'fault',
        identity: 'reservoir in range',
        severity: 'recoverable',
        firstTick: 12,
        detail: 'reservoir is 1.4',
        count: 3,
      },
    ]);
    expect(measured.readbackFaults).toEqual([]);
    expect(measured.provenance.exclusions).toEqual(['script', 'faulted']);
  });
});
