/**
 * The golden digest's scenario and its committed constant (ADR 0015).
 *
 * It lives in src/dev rather than inside the test because two callers need it:
 * the test in src/game, and the #/digest screen, which runs the same scenario
 * in whatever browser opened the URL. CI and the developer's machine are the
 * same Node, so a browser is the only place ADR 0015's cross-engine claim can
 * actually be checked before the final dispatch.
 *
 * src/dev may reach src/game and imports no bare packages, which is what keeps
 * this module pixi-free and usable from a screen.
 */

import { graveHitbox } from "../game/grave";
import type { MoveCommand, RunState } from "../game/run";
import { createRun } from "../game/run";
import { stepChecked } from "./invariants";

const SEED = 20260820;
const TICKS = 300;

/**
 * A wandering script with a small net drift, so the end state is not simply the
 * start, and short enough that no cycle of it reaches the field boundary.
 */
const SCRIPT: readonly MoveCommand[] = [
  { x: 1, y: 0 },
  { x: 0.5, y: -1 },
  { x: -1, y: -0.5 },
  { x: 0, y: 1 },
  { x: -0.5, y: 0 },
  { x: 1, y: 0.25 },
  { x: -0.75, y: -0.5 },
];

export interface Digest {
  readonly tick: number;
  readonly seed: number;
  readonly graveX: number;
  readonly graveY: number;
  readonly size: number;
  readonly score: number;
  readonly reservoir: number;
  readonly drawn: Record<string, number>;
  readonly levels: Record<string, number>;
  readonly checksum: number;
}

/**
 * How close the scenario's grave came to each side of the field boundary, as
 * the hitbox's own extremes over the whole run.
 *
 * It is returned rather than asserted here because src/dev may import no bare
 * packages at all, vitest included, so the guard cannot travel with the
 * scenario. Dropping the guard silently is not an option: moveGrave clamps to
 * the field's edges, so a script that presses against one pins the coordinate
 * exactly and erases any divergence in it.
 */
export interface BoundaryExtremes {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export interface ScenarioResult {
  readonly digest: Digest;
  readonly boundary: BoundaryExtremes;
}

/**
 * Integer-only folding at a fixed six decimal places, so the checksum cannot
 * itself diverge between engines.
 */
function fold(checksum: number, value: number): number {
  return (Math.imul(checksum, 31) + Math.round(value * 1e6)) | 0;
}

function digestOf(run: RunState, checksum: number): Digest {
  return {
    tick: run.tick,
    seed: run.seed,
    graveX: run.grave.x,
    graveY: run.grave.y,
    size: run.grave.size,
    score: run.score,
    reservoir: run.reservoir,
    drawn: {
      spawns: run.streams.spawns.drawn,
      drops: run.streams.drops.drawn,
      mobFire: run.streams.mobFire.drawn,
      shed: run.streams.shed.drawn,
    },
    levels: { ...run.levels },
    checksum: checksum,
  };
}

/** Runs the scenario, returning its digest and how close it came to the field boundary. */
export function runScenario(): ScenarioResult {
  const run = createRun(SEED);
  let checksum = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let tick = 0; tick < TICKS; tick++) {
    stepChecked(run, SCRIPT[tick % SCRIPT.length]);
    const box = graveHitbox(run.grave);
    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.width);
    maxY = Math.max(maxY, box.y + box.height);
    checksum = fold(checksum, run.grave.x);
    checksum = fold(checksum, run.grave.y);
    checksum = fold(checksum, run.grave.size);
  }
  return {
    digest: digestOf(run, checksum),
    boundary: { minX, minY, maxX, maxY },
  };
}

/**
 * THE CONSTANT IS NEVER UPDATED TO MAKE A FAILING TEST PASS. A change here is a
 * deliberate tuning or rules change, and the update is part of that change with
 * the reason in the commit message. Regeneration is a human paste: run
 * `pnpm digest`, and the test logs the regenerated object as a paste-ready
 * literal before it asserts.
 */
export const GOLDEN: Digest = {
  tick: 300,
  seed: 20260820,
  graveX: 321.75,
  graveY: 465.125,
  size: 27,
  score: 0,
  reservoir: 0,
  drawn: {
    spawns: 0,
    drops: 0,
    mobFire: 0,
    shed: 0,
  },
  levels: {
    soulStream: 1,
    headstones: 1,
    wisps: 0,
    bell: 0,
  },
  checksum: -1808588216,
};
