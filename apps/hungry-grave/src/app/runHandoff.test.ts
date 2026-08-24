// The run handoff, the one piece of logic the screen skeletons add.

import { describe, expect, it } from "vitest";
import { createExecution, executeTick } from "../game/execution";
import { createRun } from "../game/run";
import type { TickCommand } from "../game/run";
import { RunHandoff, summarizeRun } from "./runHandoff";

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

describe("the run handoff", () => {
  it("a fresh handoff has no run to report and no tape to hand out", () => {
    expect(new RunHandoff().read()).toBeNull();
    expect(new RunHandoff().readTape()).toBeNull();
  });

  it("a summary carries the run's seed and its tick count", () => {
    const run = createRun(23);
    const execution = createExecution(run);
    executeTick(execution, STILL);
    executeTick(execution, STILL);
    executeTick(execution, STILL);
    expect(summarizeRun(run)).toEqual({ seed: 23, ticks: 3, ending: null });
  });

  it("a summary is a snapshot, because run state is mutated in place", () => {
    const run = createRun(23);
    const summary = summarizeRun(run);
    executeTick(createExecution(run), STILL);
    expect(summary.ticks).toBe(0);
  });

  it("the run read back is the last one recorded", () => {
    const handoff = new RunHandoff();
    handoff.record({ seed: 5, ticks: 90, ending: "sealed" }, null);
    handoff.record({ seed: 6, ticks: 12, ending: "victory" }, null);
    expect(handoff.read()).toEqual({ seed: 6, ticks: 12, ending: "victory" });
  });

  it("carries the run's sealed tape bytes beside the summary, and a later run replaces them", () => {
    // The bytes and not the recorder: the recorder dies with the game screen's
    // reset, and the end screen's export needs the record after that.
    const handoff = new RunHandoff();
    const tape = new Uint8Array([72, 71, 84, 80]);
    handoff.record({ seed: 5, ticks: 90, ending: "sealed" }, tape);
    expect(handoff.readTape()).toBe(tape);

    handoff.record({ seed: 6, ticks: 12, ending: null }, null);
    expect(handoff.readTape()).toBeNull();
  });

  it("carries which ending the run reached, so the end screen can say it", () => {
    const sealed = createRun(1);
    sealed.ending = "sealed";
    expect(summarizeRun(sealed).ending).toBe("sealed");

    const won = createRun(1);
    won.ending = "victory";
    expect(summarizeRun(won).ending).toBe("victory");
  });
});
