/**
 * The sim seam (tracer plan section 3). The sim is a stub in this dispatch: it
 * holds a run's identity and its tick count, and nothing else. The rules
 * arrive in the sim-core dispatch, and these tests hold the seam's shape
 * steady until then.
 */

import { describe, expect, it } from "vitest";
import { createRun } from "./run";
import { step } from "./step";

const STILL = { x: 0, y: 0 } as const;

describe("the sim seam", () => {
  it("a run starts at tick zero and keeps the seed it was given (ADR 0012)", () => {
    const run = createRun(7);
    expect(run.seed).toBe(7);
    expect(run.tick).toBe(0);
  });

  it("a pinned seed is kept whatever its value, zero included (ADR 0012)", () => {
    expect(createRun(0).seed).toBe(0);
    expect(createRun(2147483646).seed).toBe(2147483646);
  });

  it("no seed rolls a fresh one, in range (ADR 0012)", () => {
    for (let i = 0; i < 200; i++) {
      const { seed } = createRun();
      expect(Number.isInteger(seed)).toBe(true);
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThan(2147483647);
    }
  });

  it("a step advances exactly one tick", () => {
    const run = createRun(7);
    step(run, STILL);
    step(run, STILL);
    expect(run.tick).toBe(2);
  });

  it("the stub sim has no events to report yet", () => {
    const run = createRun(7);
    expect(step(run, STILL)).toEqual([]);
  });

  it("two runs on the same seed stay identical under the same commands", () => {
    const a = createRun(11);
    const b = createRun(11);
    for (let i = 0; i < 30; i++) {
      step(a, STILL);
      step(b, STILL);
    }
    expect(a).toEqual(b);
  });

  // Owed by the sim-core dispatch (tracer plan section 5).
  it.todo("?seed= pins the run in both URL forms (ADR 0012)");
  it.todo("the accumulator emits whole ticks only and catch-up is clamped");
  it.todo(
    "the sim calls no raw Math transcendental and no Math.random (ADR 0015)",
  );
});
