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
import type { SteerSource } from "./advance";
import { advance } from "./advance";
import { createClock, ticksFor, TICK_MS } from "./clock";
import type { SimEvent } from "./events";
import type { FieldPoint } from "./grave";
import type { MoveCommand, RunState } from "./run";
import { createRun } from "./run";
import { step } from "./step";
import { BASE_SPEED } from "./tuning";

const bareStep = (await vi.importActual<typeof import("./step")>("./step"))
  .step;

/** The real step with the invariants checked after it (ADR 0013). */
function checkedStep(state: RunState, command: MoveCommand): SimEvent[] {
  const events = bareStep(state, command);
  checkInvariants(state);
  return events;
}

const STILL: SteerSource = () => ({ x: 0, y: 0 });

/** The position error from wherever the grave is now to a fixed target, in base-speed units. */
function towards(target: FieldPoint): SteerSource {
  return (grave) => ({
    x: (target.x - grave.x) / BASE_SPEED,
    y: (target.y - grave.y) / BASE_SPEED,
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

  it("zero elapsed time steps nothing and returns no events", () => {
    const run = createRun(7);
    const events = advance(run, createClock(), 0, STILL);
    expect(run.tick).toBe(0);
    expect(events).toEqual([]);
  });
});
