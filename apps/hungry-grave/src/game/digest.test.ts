/**
 * The golden digest (ADR 0015): a short scripted scenario, digested, compared
 * with a constant committed from one engine and checked on every other engine
 * a developer or CI ever runs.
 *
 * ADR 0015 explains why this test and not the obvious one. Replaying one seed
 * twice runs both replays in the same engine, so it passes with a raw Math.sin
 * still sitting in the sim: the engine is the varying input, and a same-engine
 * test is structurally blind to it.
 *
 * THE CONSTANT IS NEVER UPDATED TO MAKE A FAILING TEST PASS. A change here is a
 * deliberate tuning or rules change, and the update is part of that change with
 * the reason in the commit message. Regeneration is a human paste: run
 * `pnpm digest`, and the test logs the regenerated object as a paste-ready
 * literal before it asserts.
 *
 * This is not a vitest snapshot, deliberately. `-u` maps to update mode `all`
 * and rewrites every changed snapshot in the run, so a future unrelated `-u`
 * for a renderer snapshot would silently rewrite the determinism digest;
 * CI=true does not save it, because a truthy `update` skips the CI branch
 * entirely, and toMatchFileSnapshot is writable by --update too. A prose
 * warning is not a defense. The readable object form is kept rather than a
 * hash, so a diff names the field that diverged.
 *
 * TWO BLINDNESSES, for whoever reads this next.
 *
 * One: nothing on this dispatch's digest path calls math.ts at all, because the
 * grave moves linearly and the scroll is linear. A green digest here is not
 * determinism verified, and later dispatches must extend the scenario as they
 * add approximated operations.
 *
 * Two: moveGrave clamps to the field edges, so a script holding full-right pins
 * x to the wall exactly and erases any divergence in it. This script is kept
 * off the walls, asserted below, and a per-tick checksum accumulates alongside
 * the end state so a divergence that later re-converges still shows.
 */

import { describe, expect, it } from "vitest";
import { stepChecked } from "../dev/invariants";
import { FIELD_HEIGHT, FIELD_WIDTH } from "./field";
import { graveHitbox } from "./grave";
import type { MoveCommand, RunState } from "./run";
import { createRun } from "./run";

const SEED = 20260820;
const TICKS = 300;

/**
 * A wandering script with a small net drift, so the end state is not simply the
 * start, and short enough that no cycle of it reaches a wall.
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

interface Digest {
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

/** Runs the scenario, and fails outright if the script ever reached a wall. */
function runScenario(): Digest {
  const run = createRun(SEED);
  let checksum = 0;
  for (let tick = 0; tick < TICKS; tick++) {
    stepChecked(run, SCRIPT[tick % SCRIPT.length]);
    const box = graveHitbox(run.grave);
    expect(box.x).toBeGreaterThan(0);
    expect(box.y).toBeGreaterThan(0);
    expect(box.x + box.width).toBeLessThan(FIELD_WIDTH);
    expect(box.y + box.height).toBeLessThan(FIELD_HEIGHT);
    checksum = fold(checksum, run.grave.x);
    checksum = fold(checksum, run.grave.y);
    checksum = fold(checksum, run.grave.size);
  }
  return digestOf(run, checksum);
}

const GOLDEN: Digest = {
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

describe("the golden digest", () => {
  it("a golden digest over a short scripted scenario matches the committed constant (ADR 0015)", () => {
    const digest = runScenario();
    if (JSON.stringify(digest) !== JSON.stringify(GOLDEN)) {
      console.log(
        `The digest moved. If that was deliberate, paste this over GOLDEN in this file and say why in the commit message:\n\nconst GOLDEN: Digest = ${JSON.stringify(digest, null, 2)};\n`,
      );
    }
    expect(digest).toEqual(GOLDEN);
  });
});
