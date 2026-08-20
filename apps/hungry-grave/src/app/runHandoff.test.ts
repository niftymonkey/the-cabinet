// The run handoff, the one piece of logic the screen skeletons add.

import { describe, expect, it } from "vitest";
import { createRun } from "../game/run";
import { step } from "../game/step";
import type { MoveCommand } from "../game/run";
import { RunHandoff, summarizeRun } from "./runHandoff";

const STILL: MoveCommand = { x: 0, y: 0 };

describe("the run handoff", () => {
  it("a fresh handoff has no run to report", () => {
    expect(new RunHandoff().read()).toBeNull();
  });

  it("a summary carries the run's seed and its tick count", () => {
    const run = createRun(23);
    step(run, STILL);
    step(run, STILL);
    step(run, STILL);
    expect(summarizeRun(run)).toEqual({ seed: 23, ticks: 3 });
  });

  it("a summary is a snapshot, because run state is mutated in place", () => {
    const run = createRun(23);
    const summary = summarizeRun(run);
    step(run, STILL);
    expect(summary.ticks).toBe(0);
  });

  it("the run read back is the last one recorded", () => {
    const handoff = new RunHandoff();
    handoff.record({ seed: 5, ticks: 90 });
    handoff.record({ seed: 6, ticks: 12 });
    expect(handoff.read()).toEqual({ seed: 6, ticks: 12 });
  });
});
