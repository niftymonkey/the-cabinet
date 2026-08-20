/**
 * The sim invariant harness (ADR 0013): in bounds, size within floor and
 * ceiling, no NaN, entity caps, checked on every step in every sim test.
 */

import { describe, expect, it } from "vitest";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../game/field";
import { createRun } from "../game/run";
import { SIZE_CEILING, SIZE_FLOOR } from "../game/tuning";
import { checkInvariants, stepChecked } from "./invariants";

const STILL = { x: 0, y: 0 } as const;

describe("the sim invariants", () => {
  it("checkInvariants throws, naming the invariant, on a NaN coordinate, a size off either end, and a grave outside the field (ADR 0013)", () => {
    const nan = createRun(1);
    nan.grave.x = NaN;
    expect(() => checkInvariants(nan)).toThrow(/NaN/);

    const small = createRun(1);
    small.grave.size = SIZE_FLOOR - 0.5;
    expect(() => checkInvariants(small)).toThrow(/size/);

    const big = createRun(1);
    big.grave.size = SIZE_CEILING + 0.5;
    expect(() => checkInvariants(big)).toThrow(/size/);

    const outside = createRun(1);
    outside.grave.x = FIELD_WIDTH + 10;
    expect(() => checkInvariants(outside)).toThrow(/field/);

    const below = createRun(1);
    below.grave.y = FIELD_HEIGHT + 10;
    expect(() => checkInvariants(below)).toThrow(/field/);
  });
  it("checkInvariants passes on a fresh run and on a run stepped a few hundred ticks (ADR 0013)", () => {
    const run = createRun(3);
    expect(() => checkInvariants(run)).not.toThrow();
    for (let i = 0; i < 300; i++) {
      stepChecked(run, i % 2 === 0 ? { x: 1, y: -1 } : STILL);
    }
    expect(run.tick).toBe(300);
  });
  it.todo(
    "dispatch 4: the entity-cap rung, which has nothing to count until entities exist (ADR 0013)",
  );
});
