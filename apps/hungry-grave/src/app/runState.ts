// Shared run state between screens. Navigation constructs screens with no
// arguments, so the finished run travels through this module instead.

import type { Sim } from "../game/sim";

export interface RunState {
  seed: number;
  outcome: "dead" | "victory";
  lastSim: Sim | null;
}

export const runState: RunState = {
  seed: 42,
  outcome: "dead",
  lastSim: null,
};
