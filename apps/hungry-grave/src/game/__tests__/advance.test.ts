/**
 * The frame seam above the execution authority. It lives in src/game and not
 * inside a pixi screen because the tick loop is where the touch overshoot
 * lived: written inside a screen it has one test between it and production, and
 * that one only counts window listeners.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SimEvent } from '../events';
import type { RunState, TickCommand } from '../run';

/**
 * The step module is mocked so this file can drive the concatenation contract
 * against a step that produces events, and reached through vi.hoisted rather
 * than through an import of its own.
 *
 * Two reasons, and both are worth writing down. The harness cannot be built
 * inside a vi.mock factory: the factory would await the very module it is still
 * constructing, and the file hangs rather than failing. And ADR 0017's fence
 * forbids any module under src from importing the step module except the
 * authority itself, so a static import here would be a lint error.
 *
 * The mock no longer checks anything. executeTick runs the invariants on every
 * tick, so a checked step here would run them twice per tick.
 */
const { stepMock } = vi.hoisted(() => ({
  stepMock: vi.fn<(state: RunState, command: TickCommand) => SimEvent[]>(),
}));

vi.mock('../step', () => ({ step: stepMock }));

const bareStep = (await vi.importActual<typeof import('../step')>('../step'))
  .step;

import type { CommandSource } from '../advance';
import { advance } from '../advance';
import { createClock, ticksFor, TICK_MS } from '../clock';
import type { Execution } from '../execution';
import { createExecution } from '../execution';
import type { FieldPoint } from '../grave';
import { createRun } from '../run';
import { BASE_SPEED, RESERVOIR_CAPACITY } from '../tuning';

const STILL: CommandSource = () => ({ move: { x: 0, y: 0 }, belch: false });

/** A run and the authority its ticks cross, made together as a run's own screen makes them. */
function playing(seed: number): Execution {
  return createExecution(createRun(seed));
}

/** The position error from wherever the grave is now to a fixed target, in base-speed units. */
function towards(target: FieldPoint): CommandSource {
  return (grave) => ({
    move: {
      x: (target.x - grave.x) / BASE_SPEED,
      y: (target.y - grave.y) / BASE_SPEED,
    },
    belch: false,
  });
}

/**
 * The screen's real contract, as a command source: one flag, set by a button
 * press, read and cleared inside the closure. Because the closure is only called
 * when a tick actually runs, a press during a zero-tick frame survives to the
 * next one rather than being eaten.
 */
function pressedBelch(): CommandSource & { press: () => void } {
  let requested = false;
  const source = () => {
    const belch = requested;
    requested = false;
    return { move: { x: 0, y: 0 }, belch };
  };
  return Object.assign(source, {
    press: () => {
      requested = true;
    },
  });
}

// A block body, not an expression: a value returned from beforeEach is taken
// as a cleanup hook, and mockImplementation returns the mock itself, so vitest
// would call step() with no arguments after every test.
beforeEach(() => {
  stepMock.mockImplementation(bareStep);
});

describe('advance', () => {
  it("steps exactly ticksFor times for a given elapsed time, and the run's tick count matches", () => {
    const execution = playing(7);
    const clock = createClock();
    const reference = createClock();
    const elapsedMs = TICK_MS * 3.5;

    advance(execution, clock, elapsedMs, STILL);
    expect(execution.run.tick).toBe(ticksFor(reference, elapsedMs));
    expect(execution.run.tick).toBe(3);

    advance(execution, clock, elapsedMs, STILL);
    expect(execution.run.tick).toBe(7);
  });

  it('the touch overshoot: a per-tick recomputed steer lands on the target and stays, a frame-constant position error lands on 2T - P', () => {
    // This is the defect this seam exists to make visible. The touch command
    // is a position error and not a velocity, so applying the same one twice
    // doubles the travel; recomputing per tick converges instead, because once
    // the grave is on the target the recomputed command is zero.
    const target = { x: 370, y: 500 };
    const twoTicks = TICK_MS * 2;

    const recomputed = playing(7);
    const start = { x: recomputed.run.grave.x, y: recomputed.run.grave.y };
    advance(recomputed, createClock(), twoTicks, towards(target));
    expect(recomputed.run.grave.x).toBeCloseTo(target.x, 4);
    expect(recomputed.run.grave.y).toBeCloseTo(target.y, 4);

    // Four decimal places and not nine, because executeTick quantises the
    // command to float32 before the simulation consumes it (ADR 0017). The
    // property under test is the shape of the two landings and not their last
    // bit: 2T - P is 165 units away from T, and the grid's error is six parts
    // in a hundred million.
    const sampledOnce = playing(7);
    const frameConstant = towards(target)(sampledOnce.run.grave);
    advance(sampledOnce, createClock(), twoTicks, () => frameConstant);
    expect(sampledOnce.run.grave.x).toBeCloseTo(2 * target.x - start.x, 4);
    expect(sampledOnce.run.grave.y).toBeCloseTo(2 * target.y - start.y, 4);
  });

  it('events from every tick in the frame are returned, in order', () => {
    const execution = playing(7);
    stepMock.mockImplementation((state) => {
      state.tick += 1;
      return [{ type: 'grew', amount: state.tick, size: state.grave.size }];
    });

    const events = advance(execution, createClock(), TICK_MS * 3, STILL);

    expect(events).toHaveLength(3);
    expect(
      events.map((event) => (event.type === 'grew' ? event.amount : null)),
    ).toEqual([1, 2, 3]);
  });

  it('passes the whole TickCommand through unchanged, once per tick', () => {
    // This is what makes the two properties below properties of the seam rather
    // than of whatever caller happens to be driving it. The move components are
    // exact in float32, so quantisation leaves them alone.
    const execution = playing(7);
    const seen: TickCommand[] = [];
    stepMock.mockImplementation((state, command) => {
      seen.push(command);
      return bareStep(state, command);
    });

    let belch = true;
    advance(execution, createClock(), TICK_MS * 3, () => {
      const command = { move: { x: 0.5, y: -0.25 }, belch };
      belch = false;
      return command;
    });

    expect(seen).toEqual([
      { move: { x: 0.5, y: -0.25 }, belch: true },
      { move: { x: 0.5, y: -0.25 }, belch: false },
      { move: { x: 0.5, y: -0.25 }, belch: false },
    ]);
  });

  it('a frame that buys three ticks belches once', () => {
    // The one-shot rule lives in the command source and in fireBelch, never in
    // advance: a force-false here would be unreachable, because the closure
    // already reports false on the later ticks of a frame.
    const execution = playing(7);
    execution.run.reservoir = RESERVOIR_CAPACITY;
    const source = pressedBelch();
    source.press();

    const events = advance(execution, createClock(), TICK_MS * 3, source);
    expect(execution.run.tick).toBe(3);
    expect(events.filter((event) => event.type === 'belched')).toHaveLength(1);
  });

  it('a frame that buys zero ticks does not consume the flag', () => {
    const execution = playing(7);
    execution.run.reservoir = RESERVOIR_CAPACITY;
    const clock = createClock();
    const source = pressedBelch();
    source.press();

    expect(advance(execution, clock, 0, source)).toEqual([]);
    const later = advance(execution, clock, TICK_MS, source);
    expect(later.filter((event) => event.type === 'belched')).toHaveLength(1);
  });

  it('zero elapsed time steps nothing and returns no events', () => {
    const execution = playing(7);
    const events = advance(execution, createClock(), 0, STILL);
    expect(execution.run.tick).toBe(0);
    expect(events).toEqual([]);
  });

  it('a fatal fault on the first of three ticks stops the frame there', () => {
    // The reason the loop reads its stop condition off the Execution: the
    // catch-up clamp buys up to fifteen ticks in one frame, so one fatal fault
    // would otherwise re-fire fourteen more times inside the frame that caught
    // it.
    stepMock.mockImplementation((state, command) => {
      const events = bareStep(state, command);
      if (state.tick === 1) state.grave.x = NaN;
      return events;
    });

    const checked = playing(7);
    advance(checked, createClock(), TICK_MS * 3, STILL);
    expect(checked.run.tick).toBe(1);
    expect(checked.stop).toBe('faulted');
    expect(checked.faults.map((fault) => fault.identity)).toContain('no NaN');
  });

  it('a run that seals on tick one of a three-tick frame executes no further ticks in that frame', () => {
    // The final tick count and score a player sees are the ending's, so a seal
    // on tick one of a fifteen-tick catch-up frame must not buy fourteen more
    // ticks of simulation after the run is over (#52).
    stepMock.mockImplementation((state, command) => {
      const events = bareStep(state, command);
      if (state.tick === 1) state.ending = 'sealed';
      return events;
    });
    // The mock's call record spans the file, so the count starts here.
    stepMock.mockClear();

    const execution = playing(7);
    advance(execution, createClock(), TICK_MS * 3, STILL);
    expect(execution.run.tick).toBe(1);
    expect(execution.stop).toBeNull();
    expect(stepMock).toHaveBeenCalledTimes(1);
  });

  it('a run that wins mid-frame stops the frame the same way', () => {
    stepMock.mockImplementation((state, command) => {
      const events = bareStep(state, command);
      if (state.tick === 1) state.ending = 'victory';
      return events;
    });

    const execution = playing(7);
    advance(execution, createClock(), TICK_MS * 3, STILL);
    expect(execution.run.tick).toBe(1);
    expect(execution.stop).toBeNull();
  });
  it('advance on a run whose ending is already set executes zero ticks and returns no events', () => {
    const execution = playing(7);
    execution.run.ending = 'sealed';

    const events = advance(execution, createClock(), TICK_MS * 3, STILL);
    expect(execution.run.tick).toBe(0);
    expect(events).toEqual([]);
  });
  it('events from every tick up to and including the ending tick are returned in order', () => {
    // The ending tick's own events carry the seal itself, so a guard that
    // dropped them would end the run and swallow the evidence.
    const execution = playing(7);
    stepMock.mockImplementation((state) => {
      state.tick += 1;
      if (state.tick === 2) state.ending = 'sealed';
      return [{ type: 'grew', amount: state.tick, size: state.grave.size }];
    });

    const events = advance(execution, createClock(), TICK_MS * 3, STILL);

    expect(execution.run.tick).toBe(2);
    expect(
      events.map((event) => (event.type === 'grew' ? event.amount : null)),
    ).toEqual([1, 2]);
  });

  it('a run that ends by its own rules mid-frame stops at the ending tick', () => {
    // Nothing scripted: beforeEach points the mock at the real step, so this
    // covers the path from the seal in grave.ts to the guard with no mock in
    // between. The listener sees the ending exactly once, on the ending tick
    // itself, so no tick executed after the run was over.
    const endingSeen: number[] = [];
    const execution = createExecution(createRun(7), {
      listeners: [
        (tick, _command, _events, state) => {
          if (state.ending !== null) endingSeen.push(tick);
        },
      ],
    });
    const clock = createClock();
    for (
      let frame = 0;
      frame < 2000 && execution.run.ending === null;
      frame++
    ) {
      advance(execution, clock, TICK_MS * 15, STILL);
    }
    expect(execution.run.ending).toBe('sealed');
    expect(endingSeen).toEqual([execution.run.tick]);
  });
});
