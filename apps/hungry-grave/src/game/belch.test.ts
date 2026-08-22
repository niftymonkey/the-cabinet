/**
 * The one button (ADR 0008): full only, and the bomb everywhere. Expected values
 * come from the ADR and from dispatch 5's plan section 6.14.
 */

import { describe, expect, it } from "vitest";

import { fireBelch } from "./belch";
import type { RunState } from "./run";
import { createRun } from "./run";
import { RAMP_ROWS } from "./stage/stage";
import { RESERVOIR_CAPACITY } from "./tuning";

function quietRun(seed = 16): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

/** Shots put on the field by hand, so the test does not depend on a mob firing. */
function armField(state: RunState, count: number): void {
  for (let index = 0; index < count; index++) {
    const shot = state.mobFire[index];
    shot.alive = true;
    shot.id = state.nextEntityId;
    state.nextEntityId += 1;
    shot.x = 100 + index;
    shot.y = 200;
    shot.vx = 0;
    shot.vy = 1;
    shot.halfExtent = 5;
  }
}

function liveShots(state: RunState): number {
  return state.mobFire.filter((shot) => shot.alive).length;
}

describe("the belch is full only (ADR 0008)", () => {
  it("does nothing below a full reservoir, at any level of charge", () => {
    // There is no partial bomb: one big earned moment, and a partial would
    // dilute the feast set piece and muddy the belch-timing instruments.
    for (const share of [0, 0.25, 0.5, 0.9, 0.999]) {
      const state = quietRun();
      state.reservoir = RESERVOIR_CAPACITY * share;
      armField(state, 6);
      expect(fireBelch(state)).toEqual([]);
      expect(liveShots(state)).toBe(6);
      expect(state.reservoir).toBe(RESERVOIR_CAPACITY * share);
    }
  });

  it("cancels every live shot on the field and empties the reservoir at full", () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 40);
    fireBelch(state);
    expect(liveShots(state)).toBe(0);
    expect(state.reservoir).toBe(0);
  });

  it("emits belched with the count cancelled, which is what the belch-on-wave instrument reads", () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 17);
    expect(fireBelch(state)).toEqual([{ type: "belched", cancelled: 17 }]);
  });

  it("emits belched with zero on an empty sky, so a wipe spent on nothing is still legible", () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    expect(fireBelch(state)).toEqual([{ type: "belched", cancelled: 0 }]);
  });

  it("does nothing on a second press immediately after, by the resource and not by a flag", () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 5);
    expect(fireBelch(state)).toHaveLength(1);
    armField(state, 5);
    expect(fireBelch(state)).toEqual([]);
    expect(liveShots(state)).toBe(5);
  });
});
