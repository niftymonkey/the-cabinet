// The fold that turns a finished run into what the end screen reads.

import { describe, expect, it } from 'vitest';
import type { TickCommand } from '../../game/command';
import { createExecution, executeTick } from '../../game/execution';
import { createRun } from '../../game/run';
import { summarizeRun } from '../runSummary';

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

describe('the run summary', () => {
  it('the run summary folds a run with no browser', () => {
    // The reason the fold left the mailbox: the mailbox exists because screens
    // are pooled and built with no arguments, which is a rendering constraint,
    // and the fold itself is arithmetic over a run and its execution. Nothing
    // it touches needs a page behind it.
    expect(typeof globalThis.window).toBe('undefined');
    expect(typeof globalThis.document).toBe('undefined');

    const run = createRun(77);
    const execution = createExecution(run);
    executeTick(execution, STILL);
    executeTick(execution, STILL);
    run.ending = 'victory';

    expect(summarizeRun(run, execution)).toEqual({
      seed: 77,
      ticks: 2,
      ending: 'victory',
      fault: null,
    });
  });

  it("a summary carries the run's seed and its tick count", () => {
    const run = createRun(23);
    const execution = createExecution(run);
    executeTick(execution, STILL);
    executeTick(execution, STILL);
    executeTick(execution, STILL);
    expect(summarizeRun(run, execution)).toEqual({
      seed: 23,
      ticks: 3,
      ending: null,
      fault: null,
    });
  });

  it('a summary is a snapshot, because run state is mutated in place', () => {
    const run = createRun(23);
    const execution = createExecution(run);
    const summary = summarizeRun(run, execution);
    executeTick(execution, STILL);
    expect(summary.ticks).toBe(0);
  });

  it('carries which ending the run reached, so the end screen can say it', () => {
    const sealed = createRun(1);
    sealed.ending = 'sealed';
    expect(summarizeRun(sealed, createExecution(sealed)).ending).toBe('sealed');

    const won = createRun(1);
    won.ending = 'victory';
    expect(summarizeRun(won, createExecution(won)).ending).toBe('victory');
  });

  it('names the fault that stopped a faulted run, and the run still has no ending', () => {
    // ADR 0017: a fatal fault stops the run through the authority and never
    // sets run.ending, so the summary is what carries the difference between a
    // quit and a malfunction to the end state.
    const run = createRun(9);
    const execution = createExecution(run);
    run.grave.x = Number.NaN;
    executeTick(execution, STILL);

    expect(execution.stop).toBe('faulted');
    expect(run.ending).toBeNull();
    const summary = summarizeRun(run, execution);
    expect(summary.ending).toBeNull();
    expect(summary.fault).toEqual({ identity: 'no NaN', firstTick: 1 });
  });

  it('carries no fault for a run the instrument let continue, recoverable faults included', () => {
    // ADR 0017 ruling C puts a recoverable fault on the HUD while the run
    // plays; the end state explains only the fatal case, because only a fatal
    // fault stops the run.
    const run = createRun(9);
    const execution = createExecution(run);
    const corpse = run.corpses[0];
    corpse.alive = true;
    corpse.id = 1;
    corpse.x = 50;
    corpse.y = 50;
    corpse.freshness = 5;
    executeTick(execution, STILL);

    expect(execution.stop).toBeNull();
    expect(execution.faults.length).toBeGreaterThan(0);
    expect(summarizeRun(run, execution).fault).toBeNull();
  });
});
