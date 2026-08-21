/**
 * The sim seam (tracer plan section 3). Every test here steps through
 * stepChecked, so ADR 0013's invariants are checked on every step.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { stepChecked } from "../dev/invariants";
import type { RunState } from "./run";
import { createRun } from "./run";
import { BASE_SPEED, SCROLL_SPEED } from "./tuning";

const STILL = { x: 0, y: 0 } as const;

/**
 * Everything that defines a run, by value. The streams are closures, so two
 * runs never compare deeply equal however identical their state is.
 */
function snapshot(run: RunState) {
  return {
    seed: run.seed,
    tick: run.tick,
    grave: { ...run.grave },
    score: run.score,
    reservoir: run.reservoir,
    levels: { ...run.levels },
    ending: run.ending,
    drawn: {
      spawns: run.streams.spawns.drawn,
      drops: run.streams.drops.drawn,
      mobFire: run.streams.mobFire.drawn,
      shed: run.streams.shed.drawn,
    },
  };
}

describe("the sim seam", () => {
  // a failed assertion must not leave a spy installed for the rest of the file
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("a run starts at tick zero and keeps the seed it was given (ADR 0012)", () => {
    const run = createRun(7);
    expect(run.seed).toBe(7);
    expect(run.tick).toBe(0);
  });

  it("a pinned seed is kept whatever its value, zero included (ADR 0012)", () => {
    expect(createRun(0).seed).toBe(0);
    expect(createRun(2147483646).seed).toBe(2147483646);
  });

  it("no seed derives one from the random source (ADR 0012)", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(createRun().seed).toBe(1073741823);
    random.mockReturnValue(0);
    expect(createRun().seed).toBe(0);
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
    stepChecked(run, STILL);
    stepChecked(run, STILL);
    expect(run.tick).toBe(2);
  });

  it("a tick with nothing in it reports no events", () => {
    const run = createRun(7);
    expect(stepChecked(run, STILL)).toEqual([]);
  });

  it("scroll distance derives from the tick, so there is no stored field to drift", () => {
    const run = createRun(7);
    for (let i = 0; i < 40; i++) stepChecked(run, STILL);
    expect(run.tick).toBe(40);
    expect(run.tick * SCROLL_SPEED).toBe(40 * SCROLL_SPEED);
    const scrollish = Object.keys(run).filter((key) =>
      key.toLowerCase().includes("scroll"),
    );
    expect(scrollish).toEqual([]);
  });

  it("step applies the move command to the grave, so steering reaches the sim through the seam", () => {
    const run = createRun(7);
    const from = { x: run.grave.x, y: run.grave.y };
    stepChecked(run, { x: 1, y: -1 });
    expect(run.grave.x).toBe(from.x + BASE_SPEED);
    expect(run.grave.y).toBe(from.y - BASE_SPEED);
  });

  it("step ages invulnerability by one tick", () => {
    const run = createRun(7);
    run.grave.invulnerable = 5;
    stepChecked(run, STILL);
    expect(run.grave.invulnerable).toBe(4);
  });

  it("a run advanced N ticks with a fixed command sequence lands in exactly the same state as another run on the same seed (ADR 0012)", () => {
    const script = [
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: -0.5, y: 0.5 },
      STILL,
      { x: 0.25, y: 1 },
    ];
    const a = createRun(11);
    const b = createRun(11);
    for (let i = 0; i < 200; i++) {
      const command = script[i % script.length];
      stepChecked(a, command);
      stepChecked(b, command);
    }
    expect(snapshot(a)).toEqual(snapshot(b));
  });

  // The ?seed= half of ADR 0012 is paid: src/app/seedFromUrl.test.ts holds it,
  // because the parsing is the app's and this file is the sim's.
});
