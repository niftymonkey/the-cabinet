// Shared run state between screens. Navigation constructs screens with no
// arguments, so the finished run travels through this module instead.

import type { Sim } from "./game/sim";

export interface RunState {
  seed: number;
  outcome: "dead" | "victory";
  lastSim: Sim | null;
}

// The run seed is shareable through the URL (?seed=...), so every tester can
// play the identical run (decision-log entry 5: named seeded streams).
function seedFromUrl(): number {
  if (typeof window === "undefined") return 42;
  const param = new URLSearchParams(window.location.search).get("seed");
  const seed = param === null ? NaN : Number(param);
  return Number.isFinite(seed) ? seed : 42;
}

export const runState: RunState = {
  seed: seedFromUrl(),
  outcome: "dead",
  lastSim: null,
};
