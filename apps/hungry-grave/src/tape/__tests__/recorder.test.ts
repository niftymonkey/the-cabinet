/**
 * What the recorder puts on a tape, asserted at the seam a caller can see.
 *
 * Authored from ADR 0018, ADR 0019 and the testing decisions on #48: the body
 * holds exactly the commands the simulation consumed, the witness is stamped at
 * checkpoints whose indexing is defined once, the fault records are
 * observations rather than trailer fields, and the trailer is written last so a
 * tape without one reads as a stop of unknown.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { TICK_HZ } from '../../game/clock';
import { createExecution, executeTick } from '../../game/execution';
import type { Fault } from '../../game/invariants';
import type { TickCommand } from '../../game/command';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { foldWitness, WITNESS_VERSION } from '../../game/witness';
import {
  integrityOf,
  recordFrame,
  recordInto,
  sealTrailer,
  tapeOf,
} from '../recorder';
import type { TapeHeader } from '../tape';
import { faultObservations, frameObservations, stopOf } from '../tape';

const SEED = 20260823;

/** A header with a spacing short enough that a test run reaches several checkpoints. */
function header(run: RunState, spacing = 5): TapeHeader {
  return {
    seed: run.seed,
    startingSize: run.grave.size,
    startingLevels: { ...run.levels },
    tickRate: TICK_HZ,
    checkpointSpacing: spacing,
    witnessVersion: WITNESS_VERSION,
    commitHash: 'abc1234',
    buildIdentity: '',
    author: 'unknown',
    inputDevice: 'script',
    keyboardSpeed: 1,
    rendererBackend: 'webgl',
    rendererResolution: 2,
    devicePixelRatio: 2,
    recordedAt: 1_700_000_000_000,
  };
}

/** A command that is not the origin, so a body of zeroes cannot pass by accident. */
function steer(tick: number): TickCommand {
  return {
    move: { x: 0.25 + tick / 1000, y: -0.5 + tick / 500 },
    belch: false,
  };
}

afterEach(() => vi.restoreAllMocks());

describe('the tape recorder', () => {
  it('stamps checkpoint zero before a single tick has run', () => {
    // ADR 0019: the checkpoint at index N is the fold of the state after
    // executeTick has run N times, so index 0 is the state before any tick, and
    // that is what "the very first tick is witnessed" has to mean.
    const run = createRun(SEED);
    const before = foldWitness(run, 0);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));

    expect(recorder.checkpoints).toEqual([{ index: 0, witness: before }]);
  });

  it("stamps a checkpoint at the tape's own spacing and nowhere else", () => {
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run, 5));

    for (let tick = 0; tick < 12; tick++) executeTick(execution, steer(tick));

    expect(recorder.checkpoints.map((point) => point.index)).toEqual([
      0, 5, 10,
    ]);
  });

  it('stamps each checkpoint as an independent snapshot rather than a running total', () => {
    // ADR 0019: a chained fold only ever says something went wrong somewhere
    // before here, so a divergence could not be named at a checkpoint.
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run, 5));

    for (let tick = 0; tick < 5; tick++) executeTick(execution, steer(tick));

    expect(recorder.checkpoints[1]).toEqual({
      index: 5,
      witness: foldWitness(run, 0),
    });
  });

  it('records exactly the commands the simulation consumed, quantised', () => {
    // ADR 0018: the quantiser lives inside the authority, so the tape always
    // holds what the simulation actually ran and never a caller's rounding.
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));
    const offered: TickCommand = { move: { x: 0.1, y: 0.2 }, belch: false };

    executeTick(execution, offered);

    const recorded = recorder.commands[0];
    expect(recorded.move.x).not.toBe(offered.move.x);
    expect(recorded.move.x).toBe(Math.fround(offered.move.x));
    expect(recorded.move.y).toBe(Math.fround(offered.move.y));
  });

  it('records the belch the tick consumed', () => {
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));

    executeTick(execution, { move: { x: 0, y: 0 }, belch: true });
    executeTick(execution, { move: { x: 0, y: 0 }, belch: false });

    expect(recorder.commands.map((command) => command.belch)).toEqual([
      true,
      false,
    ]);
  });

  it("keeps a frame row out of the simulation's way, as an observation", () => {
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));

    recordFrame(recorder, {
      reason: 'live',
      tickIndex: 0,
      ticksExecuted: 2,
      intervalMs: 33,
      advanceMs: 0.4,
      updateMs: 1.2,
      debtTicks: 0,
    });

    expect(frameObservations(tapeOf(recorder))).toEqual([
      {
        kind: 'frame',
        reason: 'live',
        tickIndex: 0,
        ticksExecuted: 2,
        intervalMs: 33,
        advanceMs: 0.4,
        updateMs: 1.2,
        debtTicks: 0,
      },
    ]);
  });

  it('takes no frame row when there is no recorder to write it into', () => {
    // ADR 0018 ruling F: a run-less frame has no tape to be written into, so
    // the seam hands the row to nothing rather than orphaning it.
    expect(() =>
      recordFrame(null, {
        reason: 'paused',
        tickIndex: null,
        ticksExecuted: 0,
        intervalMs: 16,
        advanceMs: 0,
        updateMs: 0.1,
        debtTicks: 0,
      }),
    ).not.toThrow();
  });

  it('writes a fault as an observation, with the tick it first fired on and its count', () => {
    // ADR 0017 and ADR 0018: fault records are per-tick, so they live in the
    // observations section rather than in the trailer, de-duplicated by
    // identity because a persistent recoverable fault fires on every tick.
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));
    const fault: Fault = {
      identity: 'entities in bounds',
      severity: 'recoverable',
      detail: 'mob 3.x is off the field',
    };
    execution.faults.push({ ...fault, firstTick: 0, count: 1 });

    executeTick(execution, steer(0));
    execution.faults[0].count = 2;
    executeTick(execution, steer(1));

    expect(faultObservations(tapeOf(recorder))).toEqual([
      {
        kind: 'fault',
        identity: 'entities in bounds',
        severity: 'recoverable',
        firstTick: 0,
        detail: 'mob 3.x is off the field',
        count: 2,
      },
    ]);
  });
});

describe('the trailer', () => {
  it('is absent until the stop, and an absent one reads as a stop of unknown', () => {
    // ADR 0018: the trailer is written last on purpose, and a reader that finds
    // none reads unknown, which is the tab-closed case the instrument most
    // needs to see.
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));

    expect(recorder.trailer).toBeNull();
    expect(stopOf(tapeOf(recorder))).toBe('unknown');
  });

  it('reads a run with an ending as finished, and one without as quit', () => {
    const finished = createRun(SEED);
    finished.ending = 'sealed';
    const finishedExecution = createExecution(finished);
    const finishedRecorder = recordInto(finishedExecution, header(finished));
    sealTrailer(finishedRecorder, finishedExecution, 0);

    const abandoned = createRun(SEED);
    const abandonedExecution = createExecution(abandoned);
    const abandonedRecorder = recordInto(abandonedExecution, header(abandoned));
    sealTrailer(abandonedRecorder, abandonedExecution, 0);

    expect(finishedRecorder.trailer).toMatchObject({
      ending: 'sealed',
      stop: 'finished',
    });
    expect(abandonedRecorder.trailer).toMatchObject({
      ending: null,
      stop: 'quit',
    });
  });

  it('keeps the ending and the stop as two facts', () => {
    // ADR 0018: a fault is not an ending, so a run stopped by one still says it
    // ended neither way.
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));
    execution.stop = 'faulted';

    sealTrailer(recorder, execution, 7);

    expect(recorder.trailer).toEqual({
      ending: null,
      stop: 'faulted',
      integrity: 'clean',
      debtTicks: 7,
    });
  });

  it('is written once, so a later call cannot rewrite how a run stopped', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));

    sealTrailer(recorder, execution, 3);
    execution.stop = 'faulted';
    sealTrailer(recorder, execution, 99);

    expect(recorder.trailer).toMatchObject({ stop: 'quit', debtTicks: 3 });
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('a second seal is not silent', () => {
    // GameScreen latches its ending, so nothing in the shipped app reaches
    // here: a second seal is a caller's bug and says so.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));

    sealTrailer(recorder, execution, 3);
    execution.stop = 'faulted';
    sealTrailer(recorder, execution, 99);

    const said = warn.mock.calls.map((call) => call.join(' '));
    expect(said).toHaveLength(1);
    // What happened, and what it costs.
    expect(said[0]).toContain('faulted');
    expect(said[0]).toContain('bug');
  });

  it('a single seal says nothing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const run = createRun(SEED);
    const execution = createExecution(run);

    sealTrailer(recordInto(execution, header(run)), execution, 3);

    expect(warn).not.toHaveBeenCalled();
  });

  it("carries the run's discarded ticks, which the body cannot show", () => {
    // ADR 0018: a body holds only executed ticks, so a 12,000-tick run recorded
    // over 400 stuttering seconds is byte-identical to one recorded over 200
    // smooth ones without this.
    const run = createRun(SEED);
    const execution = createExecution(run);
    const recorder = recordInto(execution, header(run));

    sealTrailer(recorder, execution, 118);

    expect(recorder.trailer?.debtTicks).toBe(118);
  });
});

describe("a run's integrity", () => {
  it('reads clean when the checks ran and nothing fired', () => {
    expect(integrityOf(createExecution(createRun(SEED)))).toBe('clean');
  });

  it('reads faulted when something fired, fatal or not', () => {
    const execution = createExecution(createRun(SEED));
    execution.faults.push({
      identity: 'one live ring',
      severity: 'recoverable',
      firstTick: 4,
      detail: 'two rings live',
      count: 1,
    });

    expect(integrityOf(execution)).toBe('faulted');
  });
});
