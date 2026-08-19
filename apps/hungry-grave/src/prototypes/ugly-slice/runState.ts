// Shared run state between screens. Navigation constructs screens with no
// arguments, so the finished run travels through this module instead.

import type { Sim } from "./game/sim";

export interface RunState {
  seed: number;
  outcome: "dead" | "victory";
  lastSim: Sim | null;
}

// The seed may ride the hash query (#/prototypes/ugly-slice?seed=7) or the
// search before the hash (?seed=7#/...); pure so both URL forms are testable.
export function parseSeedParam(hash: string, search: string): number | null {
  const hashQuery = hash.split("?")[1] ?? "";
  const param =
    new URLSearchParams(hashQuery).get("seed") ??
    new URLSearchParams(search).get("seed");
  const seed = param === null ? NaN : Number(param);
  return Number.isFinite(seed) ? seed : null;
}

function pinnedSeedFromUrl(): number | null {
  if (typeof window === "undefined") return 42;
  return parseSeedParam(window.location.hash, window.location.search);
}

function randomSeed(): number {
  return (Math.random() * 0x100000000) >>> 0;
}

// A pinned seed replays the identical run every time, the playtest instrument
// (decision-log entries 5 and 13). Unpinned, every run rolls fresh dice.
const pinnedSeed = pinnedSeedFromUrl();
let firstRun = true;

// Every run start draws its seed here. The first run keeps the roll the title
// screen already displayed; later runs (R restart, play again) roll fresh
// unless the URL pinned the seed (decision-log entry 13).
export function nextRunSeed(): number {
  if (pinnedSeed === null && !firstRun) runState.seed = randomSeed();
  firstRun = false;
  return runState.seed;
}

export const runState: RunState = {
  seed: pinnedSeed ?? randomSeed(),
  outcome: "dead",
  lastSim: null,
};
