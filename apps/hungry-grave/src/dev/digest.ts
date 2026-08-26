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
 *
 * THE BLINDNESS THIS DISPATCH CLOSED, AND HOW.
 *
 * Nothing on the digest's path called math.ts before the field existed, so a
 * green digest was not determinism verified at all. The scenario now spawns a
 * ghoul and runs it long enough to turn, which is the first thing in the game
 * to need trigonometry.
 *
 * Extending the scenario is not enough on its own. The checksum used to fold
 * only the grave's x, y and size, and a ghoul's turn reaches none of those at
 * the precision an f32 divergence lives at: an ulp in cos will never move the
 * grave. It now folds every live entity's own state in slot order, which is
 * what actually puts math.ts on the path and buys coverage of the spawn
 * sequence and of pool iteration order at the same time.
 *
 * The fold itself lives in src/game/witness.ts (ADR 0019), because a replay
 * ships and ADR 0013 keeps this rig out of the shipped game. The digest is the
 * witness of this one canonical scenario, chained across its ticks.
 */

import { graveHitbox } from '../game/grave';
import type { Mob } from '../game/mobs';
import { damageMob, spawnMob } from '../game/mobs';
import type { MoveCommand, RunState } from '../game/run';
import { createRun } from '../game/run';
import { place } from '../game/stage/templates';
import type { FaultRecord } from '../game/execution';
import { createExecution, executeTick } from '../game/execution';
import { foldWitness } from '../game/witness';

const SEED = 20260820;
const TICKS = 600;

/** The tick the scripted ghoul enters, early enough that its beat ends and it turns for most of the run. */
const GHOUL_AT = 30;

/** The tick a mob is put under the grave and killed, so a corpse is made and swallowed on the next one. */
const SWALLOW_AT = 240;

/** The tick a mob is killed away from the grave, so a corpse is still draining when the scenario ends. */
const LEFTOVER_AT = 540;

/**
 * The tick a File is placed, and how many mobs are in it.
 *
 * The scenario used to make zero draws on every stream, because the only rows
 * inside its window are two Drips of one, a Drip draws nothing, and index 0 is
 * never armed. A scripted File draws from the spawns stream for its placement
 * scatter and arms its third mob, which then draws from the mobFire stream for
 * its first-shot jitter, so `drawn` measures something. Scripting it rather than
 * running the scenario longer is what keeps the golden off the ramp's own
 * tuning, which ADR 0015 requires of this scenario by name.
 */
const FILE_AT = 90;
const FILE_COUNT = 4;

/**
 * Where the File is put down, in field units.
 *
 * The placement's own x is discarded and its draw is not: the draw is the whole
 * point, and the column has to fall clear of the script's own wander. A File
 * landing on the grave's path grinds it to the size floor, and a size pinned at
 * a clamp erases a divergence in it exactly the way a grave pressed against the
 * field boundary erases one in x, which is the blindness the boundary extremes
 * assertion already exists to guard.
 */
const FILE_X = 60;

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
  readonly mobs: number;
  readonly shots: number;
  readonly corpses: number;
  readonly skulls: number;
  readonly wisps: number;
  readonly kills: number;
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
  /**
   * The run the scenario left behind. The digest test perturbs one entity in it
   * and re-folds, which is the only way to assert that the checksum actually
   * reaches an entity's own state.
   */
  readonly state: RunState;
  /**
   * Every invariant the scenario broke, de-duplicated by identity.
   *
   * It is returned rather than thrown because a check records a fault and
   * returns (ADR 0017). The scenario used to abort on the first broken
   * invariant, so a caller that wanted to know had only the exception; a caller
   * that wants to know now has to read this, and the #/digest screen does.
   */
  readonly faults: readonly FaultRecord[];
}

function liveCount(pool: readonly { alive: boolean }[]): number {
  return pool.reduce((count, slot) => count + (slot.alive ? 1 : 0), 0);
}

function digestOf(run: RunState, checksum: number, kills: number): Digest {
  return {
    tick: run.tick,
    seed: run.seed,
    graveX: run.grave.x,
    graveY: run.grave.y,
    size: run.grave.size,
    score: run.score,
    reservoir: run.reservoir,
    mobs: liveCount(run.mobs),
    shots: liveCount(run.mobFire),
    corpses: liveCount(run.corpses),
    skulls: liveCount(run.skulls),
    wisps: liveCount(run.wisps),
    kills,
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

/** A mob put exactly where the script wants one, outside the stage's own rows. */
function put(run: RunState, x: number, y: number): Mob | null {
  return spawnMob(run, 'shambler', { x, y, vx: 0, vy: 1, index: 0 });
}

/**
 * The scripted deaths. They stand in for the weapon lines the scenario does not
 * have, so the digest's path carries a kill, a corpse and a swallow.
 */
function scriptedKills(run: RunState, tick: number): number {
  if (tick === GHOUL_AT) {
    spawnMob(run, 'ghoul', { x: 120, y: 20, vx: 0, vy: 1, index: 0 });
    return 0;
  }
  if (tick === FILE_AT) {
    for (const order of place('file', FILE_COUNT, run.streams.spawns)) {
      spawnMob(run, 'shambler', { ...order, x: FILE_X });
    }
    return 0;
  }
  if (tick !== SWALLOW_AT && tick !== LEFTOVER_AT) return 0;
  const where =
    tick === SWALLOW_AT
      ? { x: run.grave.x, y: run.grave.y }
      : { x: 60, y: 300 };
  const victim = put(run, where.x, where.y);
  if (victim === null) return 0;
  damageMob(run, victim, victim.hp, 'soulStream');
  return 1;
}

/** Runs the scenario, returning its digest, how close it came to the field boundary, the run itself and any faults it broke. */
export function runScenario(): ScenarioResult {
  const run = createRun(SEED);
  const execution = createExecution(run);
  let checksum = 0;
  let kills = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let tick = 0; tick < TICKS; tick++) {
    // The loop reads the stop condition off the Execution before each tick (ADR
    // 0017). Without it the scenario would run its whole remaining budget on a
    // state a fatal fault has already declared unusable, and a NaN-poisoned
    // run's digest says nothing about determinism.
    if (execution.stop !== null) break;
    kills += scriptedKills(run, tick);
    executeTick(execution, {
      move: SCRIPT[tick % SCRIPT.length],
      belch: false,
    });
    const box = graveHitbox(run.grave);
    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.width);
    maxY = Math.max(maxY, box.y + box.height);
    checksum = foldWitness(run, checksum);
  }
  return {
    digest: digestOf(run, checksum, kills),
    boundary: { minX, minY, maxX, maxY },
    state: run,
    faults: execution.faults,
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
  tick: 600,
  seed: 20260820,
  graveX: 365.625,
  graveY: 318.875,
  size: 24.50625,
  score: 0,
  reservoir: 0.50625,
  mobs: 6,
  shots: 2,
  corpses: 1,
  skulls: 1,
  wisps: 0,
  kills: 2,
  drawn: {
    spawns: 1,
    drops: 0,
    mobFire: 1,
    shed: 0,
  },
  levels: {
    soulStream: 1,
    headstones: 1,
    wisps: 0,
    bell: 0,
  },
  checksum: -522074226,
};
