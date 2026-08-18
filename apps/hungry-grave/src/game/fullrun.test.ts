// The deterministic headless bot plays the full run, and the run's shape is
// asserted from the done-contract and decision-log entry 6.5: about five
// minutes, drops in the ten-to-twelve band, phases in order, both endings
// reachable, and zero invariant fires across every step.

import { describe, expect, it } from "vitest";
import { advanceToPhase, botInput, PHASE_ORDER } from "./bot";
import { checkInvariants } from "./invariants";
import { createSim, killsNeededForDrops, step, type Sim } from "./sim";
import type { PhaseName } from "./types";

const DT = 1 / 60;
const MAX_SECONDS = 480;
const IDLE = { moveX: 0, moveY: 0, focus: false, belch: false };

function playFullRun(seed: number): { sim: Sim; phases: PhaseName[] } {
  const sim = createSim(seed);
  const phases: PhaseName[] = [sim.phase];
  const maxSteps = Math.round(MAX_SECONDS / DT);
  for (let i = 0; i < maxSteps; i++) {
    if (sim.phase === "victory" || sim.phase === "dead") break;
    step(sim, botInput(sim), DT);
    const last = phases[phases.length - 1];
    if (sim.phase !== last) phases.push(sim.phase);
    const violations = checkInvariants(sim);
    if (violations.length > 0) {
      throw new Error(
        `invariant fired at t=${sim.t.toFixed(2)} phase=${sim.phase}: ${violations.join("; ")}`,
      );
    }
  }
  return { sim, phases };
}

describe("the bot full run (done-contract; decision-log entry 6.5)", () => {
  const { sim, phases } = playFullRun(42);

  it("reaches victory: the grave eats the gravedigger (entry 4.6)", () => {
    expect(sim.phase).toBe("victory");
  });

  it("runs about five minutes end to end (entry 5.2)", () => {
    expect(sim.t).toBeGreaterThanOrEqual(240);
    expect(sim.t).toBeLessThanOrEqual(400);
  });

  it("walks the phases in skeleton order with no skips (entry 5.2)", () => {
    expect(phases).toEqual(PHASE_ORDER);
  });

  it("pays out ten to twelve drops (entry 5.6)", () => {
    expect(sim.instruments.dropsSpawned).toBeGreaterThanOrEqual(10);
    expect(sim.instruments.dropsSpawned).toBeLessThanOrEqual(12);
  });

  it("kills enough to fund the drop band (entry 5.6)", () => {
    expect(sim.instruments.killsTotal).toBeGreaterThanOrEqual(
      killsNeededForDrops(10),
    );
  });

  it("the swallow economy ran: corpses eaten and belches fired (entries 1.4, 1.7)", () => {
    expect(sim.instruments.corpsesEaten).toBeGreaterThan(0);
    expect(sim.instruments.belchesFired).toBeGreaterThanOrEqual(1);
  });

  it("the belch-on-wave instrument resolved to one of its three cases (entries 5.8, 5.12)", () => {
    expect(sim.instruments.belchOnWall).not.toBe("pending");
  });

  it("the same seed replays to the identical final state (entry 5: named seeded streams)", () => {
    const replay = playFullRun(42);
    expect(replay.sim.t).toBe(sim.t);
    expect(replay.sim.phase).toBe(sim.phase);
    expect(replay.sim.kills).toBe(sim.kills);
    expect(replay.sim.player).toEqual(sim.player);
    expect(replay.sim.instruments.dropsSpawned).toBe(
      sim.instruments.dropsSpawned,
    );
  });
});

describe("the other ending and the dev skip (done-contract items 10 and 12)", () => {
  it("death is reachable: an idle grave gets filled in and sealed shut (concept doc)", () => {
    const sim = createSim(42);
    const maxSteps = Math.round(240 / DT);
    for (let i = 0; i < maxSteps; i++) {
      if (sim.phase === "dead") break;
      step(sim, IDLE, DT);
    }
    expect(sim.phase).toBe("dead");
  });

  it("advanceToPhase honestly plays forward to a named phase (entry 6.5: dev autopilot)", () => {
    const sim = createSim(42);
    expect(advanceToPhase(sim, "undertaker")).toBe(true);
    expect(sim.phase).toBe("undertaker");
    expect(sim.boss?.kind).toBe("undertaker");
  });
});
