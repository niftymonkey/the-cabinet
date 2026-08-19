// Spec tests for the touch steering layer, authored from ticket #33 and its
// routed approach comment BEFORE the implementation, in the spec.test.ts
// discipline: a failure here is presumed a code bug.
//
// The record these enforce:
// - Relative drag, not a virtual joystick: the finger rests anywhere and the
//   grave copies the finger's MOVEMENT, never its position (#33 approach).
// - "The thumb never has to sit on top of the grave to steer it" (#33
//   acceptance), which mechanically means touch-down never teleports.
// - A tunable touch-to-movement ratio, Danmaku Unlimited 3 style (#33
//   approach).
// - The belch fires by touch (#33 acceptance): a second finger tap.
// - Desktop keyboard play is unchanged (#33 acceptance): the sim's movement
//   for unit and diagonal inputs is bit-identical to the pre-#33 rule, and
//   the analog magnitude the touch layer feeds is clamped to that same top
//   speed, so touch can never out-dodge a keyboard.
//
// Named omission: what focus mode becomes on touch is a decision-log ruling,
// not a sim behavior; the touch layer simply never sets focus.

import { describe, expect, it } from "vitest";
import { checkInvariants } from "../game/invariants";
import { createSim, step, type Sim } from "../game/sim";
import * as T from "../game/tuning";
import type { Input } from "../game/types";
import { TouchSteer } from "./touch";

const DT = 1 / 60;
const MAX_STEP = T.PLAYER_SPEED * DT;

function isolatedSim(seed = 123): Sim {
  const sim = createSim(seed);
  sim.pendingSpawns = [];
  return sim;
}

function stepChecked(sim: Sim, input: Input): void {
  step(sim, input, DT);
  expect(checkInvariants(sim)).toEqual([]);
}

// One sim step driven by the touch layer, the way GameScreen will drive it.
function touchStep(sim: Sim, steer: TouchSteer): void {
  const read = steer.read(sim.player.x, sim.player.y, MAX_STEP);
  stepChecked(sim, {
    moveX: read.moveX,
    moveY: read.moveY,
    focus: false,
    belch: read.belch,
  });
}

describe("keyboard movement is unchanged by the analog magnitude rule (#33)", () => {
  it("a single-axis key still moves at exactly full speed", () => {
    const sim = isolatedSim();
    const x0 = sim.player.x;
    stepChecked(sim, { moveX: 1, moveY: 0, focus: false, belch: false });
    expect(sim.player.x - x0).toBeCloseTo(T.PLAYER_SPEED * DT, 10);
  });

  it("a diagonal still normalizes to full speed, not faster", () => {
    const sim = isolatedSim();
    const { x: x0, y: y0 } = sim.player;
    stepChecked(sim, { moveX: 1, moveY: 1, focus: false, belch: false });
    const moved = Math.hypot(sim.player.x - x0, sim.player.y - y0);
    expect(moved).toBeCloseTo(T.PLAYER_SPEED * DT, 10);
  });

  it("a fractional magnitude moves proportionally slower", () => {
    const sim = isolatedSim();
    const x0 = sim.player.x;
    stepChecked(sim, { moveX: 0.5, moveY: 0, focus: false, belch: false });
    expect(sim.player.x - x0).toBeCloseTo(0.5 * T.PLAYER_SPEED * DT, 10);
  });

  it("a magnitude above one clamps to full speed", () => {
    const sim = isolatedSim();
    const { x: x0, y: y0 } = sim.player;
    stepChecked(sim, { moveX: 3, moveY: 4, focus: false, belch: false });
    const moved = Math.hypot(sim.player.x - x0, sim.player.y - y0);
    expect(moved).toBeCloseTo(T.PLAYER_SPEED * DT, 10);
  });
});

describe("relative drag steering (#33)", () => {
  it("a resting finger does not move the grave", () => {
    const sim = isolatedSim();
    const { x: x0, y: y0 } = sim.player;
    const steer = new TouchSteer(1);
    steer.down(1, 40, 700);
    for (let i = 0; i < 30; i++) touchStep(sim, steer);
    expect(sim.player.x).toBe(x0);
    expect(sim.player.y).toBe(y0);
  });

  it("a small drag moves the grave by exactly the finger delta", () => {
    const sim = isolatedSim();
    const { x: x0, y: y0 } = sim.player;
    const steer = new TouchSteer(1);
    steer.down(1, 40, 700);
    steer.move(1, 42, 699);
    touchStep(sim, steer);
    expect(sim.player.x - x0).toBeCloseTo(2, 10);
    expect(sim.player.y - y0).toBeCloseTo(-1, 10);
  });

  it("the ratio scales the finger delta onto the grave", () => {
    const sim = isolatedSim();
    const { x: x0, y: y0 } = sim.player;
    const steer = new TouchSteer(1.5);
    steer.down(1, 40, 700);
    steer.move(1, 42, 699);
    touchStep(sim, steer);
    expect(sim.player.x - x0).toBeCloseTo(3, 10);
    expect(sim.player.y - y0).toBeCloseTo(-1.5, 10);
  });

  it("a long flick is chased at top speed and lands without overshoot", () => {
    const sim = isolatedSim();
    const x0 = sim.player.x;
    const steer = new TouchSteer(1);
    steer.down(1, 40, 700);
    steer.move(1, 40 + 120, 700);
    let last = x0;
    for (let i = 0; i < 240; i++) {
      touchStep(sim, steer);
      const dx = sim.player.x - last;
      expect(dx).toBeGreaterThanOrEqual(0);
      expect(dx).toBeLessThanOrEqual(MAX_STEP + 1e-9);
      last = sim.player.x;
    }
    expect(sim.player.x - x0).toBeCloseTo(120, 6);
  });

  it("lifting the finger stops the grave even mid-chase", () => {
    const sim = isolatedSim();
    const steer = new TouchSteer(1);
    steer.down(1, 40, 700);
    steer.move(1, 240, 700);
    for (let i = 0; i < 5; i++) touchStep(sim, steer);
    steer.up(1);
    const xAtLift = sim.player.x;
    for (let i = 0; i < 30; i++) touchStep(sim, steer);
    expect(sim.player.x).toBe(xAtLift);
  });

  it("a new touch never teleports the grave (#33: thumb off the grave)", () => {
    const sim = isolatedSim();
    const steer = new TouchSteer(1);
    steer.down(1, 40, 700);
    steer.move(1, 60, 700);
    for (let i = 0; i < 240; i++) touchStep(sim, steer);
    steer.up(1);
    const { x: x0, y: y0 } = sim.player;
    steer.down(2, 500, 60);
    for (let i = 0; i < 30; i++) touchStep(sim, steer);
    expect(sim.player.x).toBe(x0);
    expect(sim.player.y).toBe(y0);
  });

  it("the drag target clamps at the field edge, so reversing bites immediately", () => {
    const sim = isolatedSim();
    const steer = new TouchSteer(1);
    steer.down(1, 300, 700);
    // Far past the left wall: an unclamped target would bank this as debt.
    steer.move(1, 300 - 5000, 700);
    for (let i = 0; i < 600; i++) touchStep(sim, steer);
    // Reverse by 120: the grave must land 120 in from the clamped target at
    // the wall, not still be paying off thousands of banked units.
    steer.move(1, 300 - 5000 + 120, 700);
    for (let i = 0; i < 600; i++) touchStep(sim, steer);
    expect(sim.player.x).toBeCloseTo(120, 6);
  });
});

describe("the belch and the second finger (#33)", () => {
  it("a second finger down fires the belch exactly once", () => {
    const steer = new TouchSteer(1);
    steer.down(1, 40, 700);
    steer.down(2, 400, 700);
    expect(steer.read(100, 100, MAX_STEP).belch).toBe(true);
    expect(steer.read(100, 100, MAX_STEP).belch).toBe(false);
  });

  it("a third finger does not queue another belch", () => {
    const steer = new TouchSteer(1);
    steer.down(1, 40, 700);
    steer.down(2, 400, 700);
    steer.down(3, 200, 700);
    expect(steer.read(100, 100, MAX_STEP).belch).toBe(true);
    expect(steer.read(100, 100, MAX_STEP).belch).toBe(false);
  });

  it("a lone first touch never fires the belch", () => {
    const steer = new TouchSteer(1);
    steer.down(1, 40, 700);
    expect(steer.read(100, 100, MAX_STEP).belch).toBe(false);
    steer.up(1);
    steer.down(2, 40, 700);
    expect(steer.read(100, 100, MAX_STEP).belch).toBe(false);
  });

  it("the second finger does not steer while the first is down", () => {
    const sim = isolatedSim();
    const { x: x0, y: y0 } = sim.player;
    const steer = new TouchSteer(1);
    steer.down(1, 40, 700);
    steer.down(2, 400, 300);
    steer.move(2, 340, 200);
    for (let i = 0; i < 30; i++) touchStep(sim, steer);
    expect(sim.player.x).toBe(x0);
    expect(sim.player.y).toBe(y0);
  });

  it("steering hands off to the second finger when the first lifts, with no jump", () => {
    const sim = isolatedSim();
    const { x: x0, y: y0 } = sim.player;
    const steer = new TouchSteer(1);
    steer.down(1, 40, 700);
    steer.down(2, 400, 300);
    steer.up(1);
    for (let i = 0; i < 5; i++) touchStep(sim, steer);
    expect(sim.player.x).toBe(x0);
    expect(sim.player.y).toBe(y0);
    steer.move(2, 402, 301);
    touchStep(sim, steer);
    expect(sim.player.x - x0).toBeCloseTo(2, 10);
    expect(sim.player.y - y0).toBeCloseTo(1, 10);
  });
});

describe("pause and cancel (#33)", () => {
  it("cancel forgets fingers, target, and any queued belch", () => {
    const sim = isolatedSim();
    const steer = new TouchSteer(1);
    steer.down(1, 40, 700);
    steer.move(1, 240, 700);
    steer.down(2, 400, 300);
    steer.cancel();
    const { x: x0, y: y0 } = sim.player;
    const read = steer.read(x0, y0, MAX_STEP);
    expect(read.belch).toBe(false);
    for (let i = 0; i < 30; i++) touchStep(sim, steer);
    expect(sim.player.x).toBe(x0);
    expect(sim.player.y).toBe(y0);
  });
});
