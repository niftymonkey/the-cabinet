/**
 * The one execution authority (ADR 0017): what executeTick hands back, what it
 * quantises, what it checks, what it records and what it stops.
 */

import { describe, expect, it, vi } from 'vitest';

import type { SimEvent } from './events';
import type { TickListener } from './execution';
import {
  createDevBrokenHandler,
  createExecution,
  devBrokenHandler,
  executeTick,
} from './execution';
import { f32 } from './math';
import { MAX_LEVEL } from './lines/roster';
import { SPAWN_MARGIN, spawnMob } from './mobs';
import type { RunState, TickCommand } from './run';
import { createRun } from './run';
import { RESERVOIR_CAPACITY } from './tuning';

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

/** A move whose components are not representable in single precision. */
const OFF_GRID: TickCommand = {
  move: { x: 0.1, y: -1 / 3 },
  belch: false,
};

/** A live mob at a place the grave is nowhere near. */
function liveMob(state: RunState, x = 60, y = 100) {
  return spawnMob(state, 'shambler', { x, y, vx: 0, vy: 1, index: 0 })!;
}

describe('executeTick', () => {
  it("hands back the tick's own events, so a caller need not collect them through a listener", () => {
    const run = createRun(7);
    run.reservoir = RESERVOIR_CAPACITY;
    const execution = createExecution(run);

    const events = executeTick(execution, {
      move: { x: 0, y: 0 },
      belch: true,
    });

    expect(events.map((event) => event.type)).toContain('belched');
    expect(run.tick).toBe(1);
  });

  it('fires its listeners in array order, with the tick, the command, the events and the state', () => {
    const run = createRun(7);
    const order: string[] = [];
    const seen: {
      tick: number;
      command: TickCommand;
      events: readonly SimEvent[];
      state: RunState;
    }[] = [];
    const first: TickListener = (tick, command, events, state) => {
      order.push('first');
      seen.push({ tick, command, events, state });
    };
    const second: TickListener = () => void order.push('second');
    const execution = createExecution(run, { listeners: [first, second] });

    const events = executeTick(execution, STILL);

    expect(order).toEqual(['first', 'second']);
    expect(seen[0].tick).toBe(1);
    expect(seen[0].command).toEqual(STILL);
    expect(seen[0].events).toEqual(events);
    expect(seen[0].state).toBe(run);
  });

  it('adding a listener to the array is all it takes, because the array is the order', () => {
    const execution = createExecution(createRun(7));
    const ticks: number[] = [];
    execution.listeners.push((tick) => void ticks.push(tick));

    executeTick(execution, STILL);
    executeTick(execution, STILL);

    expect(ticks).toEqual([1, 2]);
  });
});

describe('the steering quantiser (ADR 0017)', () => {
  it('rounds the command to float32 before the simulation consumes it', () => {
    // It lives inside executeTick and not at combineSteer's call site, which
    // covers only the live input path: a bot's commands and a scripted
    // scenario's never pass through combineSteer, and a tape of one of those
    // runs would then hold something the simulation did not consume.
    const run = createRun(7);
    const from = { x: run.grave.x, y: run.grave.y };
    executeTick(createExecution(run), OFF_GRID);

    const rounded = createRun(7);
    executeTick(createExecution(rounded), {
      move: { x: f32(OFF_GRID.move.x), y: f32(OFF_GRID.move.y) },
      belch: false,
    });

    expect(run.grave.x).toBe(rounded.grave.x);
    expect(run.grave.y).toBe(rounded.grave.y);
    expect(run.grave.x).not.toBe(from.x);
  });

  it('hands the listeners the command the simulation consumed and not the one it was offered', () => {
    // A recording of a command the run did not execute is worse than no
    // recording at all.
    const seen: TickCommand[] = [];
    const execution = createExecution(createRun(7), {
      listeners: [(_tick, command) => void seen.push(command)],
    });

    executeTick(execution, OFF_GRID);

    expect(seen[0].move).toEqual({
      x: f32(OFF_GRID.move.x),
      y: f32(OFF_GRID.move.y),
    });
    expect(seen[0].move.x).not.toBe(OFF_GRID.move.x);
  });

  it('leaves a command already on the grid exactly where it was', () => {
    const seen: TickCommand[] = [];
    const execution = createExecution(createRun(7), {
      listeners: [(_tick, command) => void seen.push(command)],
    });

    executeTick(execution, { move: { x: 0.5, y: -0.25 }, belch: false });

    expect(seen[0]).toEqual({ move: { x: 0.5, y: -0.25 }, belch: false });
  });
});

describe('the fault mechanism (ADR 0017)', () => {
  it('runs the invariants on every tick, with no flag and no listener opt-out', () => {
    const run = createRun(1);
    const execution = createExecution(run);
    const seen: number[] = [];
    execution.listeners.push(() => void seen.push(run.tick));

    liveMob(run, 60, -SPAWN_MARGIN - 1);
    executeTick(execution, STILL);
    executeTick(execution, STILL);

    expect(execution.faults).toHaveLength(1);
    expect(seen).toEqual([1, 2]);
  });

  it("reports the tick's whole fault set to onBroken, the recoverable one included", () => {
    const run = createRun(1);
    const broken = vi.fn();
    const execution = createExecution(run, { onBroken: broken });

    liveMob(run, 60, -SPAWN_MARGIN - 1);
    run.levels.bell = MAX_LEVEL + 1;
    executeTick(execution, STILL);

    expect(broken).toHaveBeenCalledTimes(1);
    const [faults, state] = broken.mock.calls[0];
    expect(faults.map((fault: { identity: string }) => fault.identity)).toEqual(
      ['entities in bounds', 'levels in range'],
    );
    expect(state).toBe(run);
  });

  it('stops the run on a fatal fault and leaves it running on a recoverable one', () => {
    const recoverable = createExecution(createRun(1));
    liveMob(recoverable.run, 60, -SPAWN_MARGIN - 1);
    executeTick(recoverable, STILL);
    expect(recoverable.stop).toBeNull();
    expect(recoverable.faults[0].severity).toBe('recoverable');

    const fatal = createExecution(createRun(1));
    fatal.run.levels.bell = MAX_LEVEL + 1;
    executeTick(fatal, STILL);
    expect(fatal.stop).toBe('faulted');
  });

  it('never writes a fault onto the run, because run.ending is witness-folded', () => {
    // A fault that wrote run.ending would make a replay under a later severity
    // policy fold a different value and diverge on something that is not a rule
    // of the game.
    const execution = createExecution(createRun(1));
    execution.run.levels.bell = MAX_LEVEL + 1;
    executeTick(execution, STILL);

    expect(execution.run.ending).toBeNull();
    expect(execution.stop).toBe('faulted');
  });

  it('de-duplicates a persistent fault into one record with its first tick and its count', () => {
    // checkStage compares against a stale value on every later tick, and an
    // out-of-range level persists the same way, so one row per tick would bury
    // the run under a single repeated fault.
    const execution = createExecution(createRun(1));
    executeTick(execution, STILL);
    // An overfull reservoir persists: nothing pays into it on a quiet tick, so
    // the same check fires again on every one of the three ticks below.
    execution.run.reservoir = RESERVOIR_CAPACITY + 0.001;
    executeTick(execution, STILL);
    executeTick(execution, STILL);
    executeTick(execution, STILL);

    expect(execution.faults).toEqual([
      {
        identity: 'reservoir in range',
        severity: 'recoverable',
        firstTick: 2,
        detail: `the reservoir holds ${RESERVOIR_CAPACITY + 0.001}`,
        count: 3,
      },
    ]);
  });

  it('offers no checks-off option at all, and a run offered one still faults', () => {
    // ADR 0017: shipped invariants run with no flag and no opt-out. The
    // measurement switch was temporary scaffolding, removed after the
    // confirming play, and the excess-property error below is the guard: tsc
    // fails this file the moment a `checking` option becomes legal again.
    // @ts-expect-error -- `checking` is deliberately not an ExecutionOptions member.
    const execution = createExecution(createRun(1), { checking: false });
    liveMob(execution.run, 60, -SPAWN_MARGIN - 1);
    executeTick(execution, STILL);

    expect(execution.faults).toHaveLength(1);
  });

  it('a checker that cannot run still throws rather than being swallowed into the fault list', () => {
    const execution = createExecution(createRun(1));
    Object.defineProperty(execution.run, 'wisps', {
      get(): never {
        throw new TypeError('the wisp pool cannot be read');
      },
    });

    expect(() => executeTick(execution, STILL)).toThrow(TypeError);
  });
});

describe('the dev broken handler (ADR 0017 ruling H)', () => {
  it('reports every fault and never throws, on a fatal fault as much as a recoverable one', () => {
    // A throw here would leave executeTick, unwind through advance and the game
    // screen, and reach pixi's Ticker.update, which has no try/catch: the
    // frozen canvas this ADR opens with, in the build a developer uses.
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const execution = createExecution(createRun(1), {
      onBroken: createDevBrokenHandler(),
    });
    execution.run.levels.bell = MAX_LEVEL + 1;
    liveMob(execution.run, 60, -SPAWN_MARGIN - 1);

    expect(() => executeTick(execution, STILL)).not.toThrow();
    expect(logged).toHaveBeenCalledTimes(2);
    expect(execution.stop).toBe('faulted');
    logged.mockRestore();
  });

  it('halts once per identity and not once per tick, because a recoverable fault is persistent', () => {
    // onBroken is told on every tick a fault fires, and a persistent
    // recoverable fault is the normal case rather than an edge. Halting per
    // tick means resuming re-breaks on the next frame at 60Hz, which reads as a
    // stop in the build ruling H exists to keep running.
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const execution = createExecution(createRun(1), {
      onBroken: createDevBrokenHandler(),
    });

    execution.run.reservoir = RESERVOIR_CAPACITY + 0.001;
    executeTick(execution, STILL);
    executeTick(execution, STILL);
    executeTick(execution, STILL);

    expect(logged).toHaveBeenCalledTimes(1);
    // The repeats are not lost: the Execution's own record carries the count.
    expect(execution.faults[0].count).toBe(3);
    expect(execution.stop).toBeNull();
    logged.mockRestore();
  });

  it('halts again for an identity it has not seen, so a second fault is not swallowed by the first', () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const execution = createExecution(createRun(1), {
      onBroken: createDevBrokenHandler(),
    });

    execution.run.reservoir = RESERVOIR_CAPACITY + 0.001;
    executeTick(execution, STILL);
    liveMob(execution.run, 60, -SPAWN_MARGIN - 1);
    executeTick(execution, STILL);

    const lines = logged.mock.calls.map((call) => String(call[0]));
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('reservoir in range');
    expect(lines[1]).toContain('entities in bounds');
    logged.mockRestore();
  });

  it("the installed handler is one of these, so a developer's build gets the same policy", () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const execution = createExecution(createRun(1), {
      onBroken: devBrokenHandler,
    });

    execution.run.grave.x = Number.NaN;
    expect(() => executeTick(execution, STILL)).not.toThrow();
    expect(execution.stop).toBe('faulted');
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });

  it('cannot change the outcome, because the authority sets the stop before it is told', () => {
    const seen: (string | null)[] = [];
    const execution = createExecution(createRun(1), {
      onBroken: () => void seen.push(execution.stop),
    });
    execution.run.levels.bell = MAX_LEVEL + 1;

    executeTick(execution, STILL);

    expect(seen).toEqual(['faulted']);
  });
});

describe("an Execution's lifetime is the run's", () => {
  it("a second run gets a fresh stage watch, so run two's first phase is not compared with run one's last", () => {
    const first = createExecution(createRun(1));
    first.run.stage.phaseIndex = 2;
    executeTick(first, STILL);
    expect(first.faults).toEqual([]);

    // A watch carried over from the run above would read this run's phase 0 as
    // a phase index going backwards.
    const second = createExecution(createRun(1));
    executeTick(second, STILL);
    expect(second.faults).toEqual([]);
  });

  it('a second run starts with no faults and no stop reason', () => {
    const first = createExecution(createRun(1));
    first.run.levels.bell = MAX_LEVEL + 1;
    executeTick(first, STILL);
    expect(first.stop).toBe('faulted');

    const second = createExecution(createRun(1));
    executeTick(second, STILL);
    expect(second.faults).toEqual([]);
    expect(second.stop).toBeNull();
  });
});
