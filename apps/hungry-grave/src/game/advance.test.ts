/**
 * The frame seam above step(). It lives in src/game and not inside a pixi
 * screen because the tick loop is where the touch overshoot lived: written
 * inside a screen it has one test between it and production, and that one only
 * counts window listeners.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * step() is mocked so this file can drive the concatenation contract, and every
 * test steps through checkedStep below, which is ADR 0013's harness on every
 * step in every sim test.
 *
 * The harness cannot be built inside this factory, and the reason is worth
 * writing down: src/dev/invariants.ts imports src/game/step, so awaiting it
 * here waits on the very module this factory is still constructing, and the
 * test file hangs rather than failing. stepChecked is out for the same reason.
 */
vi.mock("./step", () => ({ step: vi.fn() }));

import { checkInvariants } from "../dev/invariants";
import type { CommandSource } from "./advance";
import { advance } from "./advance";
import { createClock, ticksFor, TICK_MS } from "./clock";
import type { SimEvent } from "./events";
import type { FieldPoint } from "./grave";
import type { RunState, TickCommand } from "./run";
import { createRun } from "./run";
import { step } from "./step";
import { BASE_SPEED, RESERVOIR_CAPACITY } from "./tuning";

const bareStep = (await vi.importActual<typeof import("./step")>("./step"))
  .step;

/** The real step with the invariants checked after it (ADR 0013). */
function checkedStep(state: RunState, command: TickCommand): SimEvent[] {
  const events = bareStep(state, command);
  checkInvariants(state);
  return events;
}

const STILL: CommandSource = () => ({ move: { x: 0, y: 0 }, belch: false });

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
  vi.mocked(step).mockImplementation(checkedStep);
});

describe("advance", () => {
  it("steps exactly ticksFor times for a given elapsed time, and the run's tick count matches", () => {
    const run = createRun(7);
    const clock = createClock();
    const reference = createClock();
    const elapsedMs = TICK_MS * 3.5;

    advance(run, clock, elapsedMs, STILL);
    expect(run.tick).toBe(ticksFor(reference, elapsedMs));
    expect(run.tick).toBe(3);

    advance(run, clock, elapsedMs, STILL);
    expect(run.tick).toBe(7);
  });

  it("the touch overshoot: a per-tick recomputed steer lands on the target and stays, a frame-constant position error lands on 2T - P", () => {
    // This is the defect this seam exists to make visible. The touch command
    // is a position error and not a velocity, so applying the same one twice
    // doubles the travel; recomputing per tick converges instead, because once
    // the grave is on the target the recomputed command is zero.
    const target = { x: 370, y: 500 };
    const twoTicks = TICK_MS * 2;

    const recomputed = createRun(7);
    const start = { x: recomputed.grave.x, y: recomputed.grave.y };
    advance(recomputed, createClock(), twoTicks, towards(target));
    expect(recomputed.grave.x).toBeCloseTo(target.x, 9);
    expect(recomputed.grave.y).toBeCloseTo(target.y, 9);

    const sampledOnce = createRun(7);
    const frameConstant = towards(target)(sampledOnce.grave);
    advance(sampledOnce, createClock(), twoTicks, () => frameConstant);
    expect(sampledOnce.grave.x).toBeCloseTo(2 * target.x - start.x, 9);
    expect(sampledOnce.grave.y).toBeCloseTo(2 * target.y - start.y, 9);
  });

  it("events from every tick in the frame are returned, in order", () => {
    // Nothing in 3b produces a SimEvent, so the concatenation contract is
    // tested against a step that does. Dispatch 4 is the first real producer.
    const run = createRun(7);
    vi.mocked(step).mockImplementation((state) => {
      state.tick += 1;
      checkInvariants(state);
      return [{ type: "grew", amount: state.tick, size: state.grave.size }];
    });

    const events = advance(run, createClock(), TICK_MS * 3, STILL);

    expect(events).toHaveLength(3);
    expect(
      events.map((event) => (event.type === "grew" ? event.amount : null)),
    ).toEqual([1, 2, 3]);
  });

  it("passes the whole TickCommand through unchanged, once per tick", () => {
    // This is what makes the two properties below properties of the seam rather
    // than of whatever caller happens to be driving it.
    const run = createRun(7);
    const seen: TickCommand[] = [];
    vi.mocked(step).mockImplementation((state, command) => {
      seen.push(command);
      return checkedStep(state, command);
    });

    let belch = true;
    advance(run, createClock(), TICK_MS * 3, () => {
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

  it("a frame that buys three ticks belches once", () => {
    // The one-shot rule lives in the command source and in fireBelch, never in
    // advance: a force-false here would be unreachable, because the closure
    // already reports false on the later ticks of a frame.
    const run = createRun(7);
    run.reservoir = RESERVOIR_CAPACITY;
    const source = pressedBelch();
    source.press();

    const events = advance(run, createClock(), TICK_MS * 3, source);
    expect(run.tick).toBe(3);
    expect(events.filter((event) => event.type === "belched")).toHaveLength(1);
  });

  it("a frame that buys zero ticks does not consume the flag", () => {
    const run = createRun(7);
    run.reservoir = RESERVOIR_CAPACITY;
    const clock = createClock();
    const source = pressedBelch();
    source.press();

    expect(advance(run, clock, 0, source)).toEqual([]);
    const later = advance(run, clock, TICK_MS, source);
    expect(later.filter((event) => event.type === "belched")).toHaveLength(1);
  });

  it("zero elapsed time steps nothing and returns no events", () => {
    const run = createRun(7);
    const events = advance(run, createClock(), 0, STILL);
    expect(run.tick).toBe(0);
    expect(events).toEqual([]);
  });
});
