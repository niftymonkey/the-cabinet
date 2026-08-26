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
import type { WeaponLine } from '../../game/lines/roster';
import type { DamageSource } from '../../game/mobs';
import type { TickCommand } from '../../game/command';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
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
import type { FieldDensity, LevelUp, Measurement, Metrics } from '../measure';
import { measure } from '../measure';

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

function emptyDamage(): Record<DamageSource, number> {
  return { soulStream: 0, headstones: 0, wisps: 0, bell: 0, belch: 0 };
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
  headstones: 4,
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
  readonly damage: Record<DamageSource, number>;
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
  const damage = emptyDamage();
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
  it('reports damage per line from the replayed mobDamaged events, the belch its own arm', () => {
    // #45's damage-contribution read: attribution is per source, and the belch
    // is an arm beside the four lines rather than folded into any of them.
    const rich = richFixture();

    expect(rich.measured.damage).toEqual(rich.damage);
    expect(rich.measured.damage.soulStream).toBeGreaterThan(0);
    expect(rich.measured.damage.headstones).toBeGreaterThan(0);
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

  it("keeps the tape's recorded faults and today's readback faults separate lists", () => {
    // ADR 0017: recorded faults are the original run's history and a replay
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
