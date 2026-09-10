// The golden digest's scenario and its committed constant (ADR 0015).

/**
 * src/dev may reach src/game and imports no bare packages, which is what keeps
 * this module pixi-free and usable from a screen.
 */
import { graveHitbox } from '../game/grave';
import type { Mob } from '../game/mobs';
import { damageMob, spawnMob } from '../game/mobs';
import type { MoveCommand } from '../game/command';
import type { RunState } from '../game/run';
import { createRun } from '../game/run';
import { place } from '../game/stage/templates';
import type { FaultRecord } from '../game/execution';
import { createExecution, executeTick } from '../game/execution';
import { foldWitness } from '../game/witness';

const SEED = 20260820;
const TICKS = 600;

/**
 * The tick the scripted ghoul enters, early enough that its beat ends and it
 * turns for most of the run. The turn is the first thing in the game to need
 * trigonometry, so it is what puts math.ts on the digest's path at all.
 */
const GHOUL_AT = 30;

// The tick a mob is put under the grave and killed, so a corpse is made and swallowed on the next one.
const SWALLOW_AT = 240;

// The tick a mob is killed away from the grave, so a corpse is still draining when the scenario ends.
const LEFTOVER_AT = 540;

/**
 * The tick a File is placed, and how many mobs are in it.
 *
 * The scenario used to make zero draws on every stream, because the only row
 * inside its window is a Drip of one and a Drip draws nothing. A scripted File
 * draws from the spawns stream for its placement scatter, so `drawn` measures
 * something. Scripting it rather than running the scenario longer is what keeps
 * the golden off the ramp's own tuning, which ADR 0015 requires of this
 * scenario by name.
 *
 * The mobFire stream is not among what this reaches. It used to be, through the
 * File's armed shambler and its first-shot jitter; under the mow the mow body
 * is silent (ADR 0059) and no mob type names a jitter at all, so the only
 * drawer left is a boss the scenario never meets.
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

interface Digest {
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
interface BoundaryExtremes {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

interface ScenarioResult {
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

const liveCount = (pool: readonly { alive: boolean }[]): number => {
  return pool.reduce((count, slot) => count + (slot.alive ? 1 : 0), 0);
};

const digestOf = (run: RunState, checksum: number, kills: number): Digest => {
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
      territory: run.streams.territory.drawn,
    },
    levels: { ...run.levels },
    checksum: checksum,
  };
};

// A mob put exactly where the script wants one, outside the stage's own rows.
const put = (run: RunState, x: number, y: number): Mob | null => {
  return spawnMob(run, 'shambler', { x, y, vx: 0, vy: 1, index: 0 }, false);
};

/**
 * Says that a scripted kill did not happen, because nothing abnormal is silent.
 *
 * No flag guards it: the scenario scripts two of these and runs each once, so
 * it fires at most twice per run.
 */
const reportUnplaceableVictim = (tick: number): void => {
  console.warn(
    `the digest scenario had no room to put a mob down at tick ${tick}; its scripted kill does not happen, so this digest is not the scenario the golden was taken from and a mismatch says nothing about determinism`,
  );
};

/**
 * The scripted deaths. They stand in for the weapon lines the scenario does not
 * have, so the digest's path carries a kill, a corpse and a swallow.
 */
const scriptedKills = (run: RunState, tick: number): number => {
  if (tick === GHOUL_AT) {
    spawnMob(run, 'ghoul', { x: 120, y: 20, vx: 0, vy: 1, index: 0 }, false);
    return 0;
  }
  if (tick === FILE_AT) {
    for (const order of place('file', FILE_COUNT, run.streams.spawns)) {
      spawnMob(run, 'shambler', { ...order, x: FILE_X }, false);
    }
    return 0;
  }
  if (tick !== SWALLOW_AT && tick !== LEFTOVER_AT) return 0;
  const where =
    tick === SWALLOW_AT
      ? { x: run.grave.x, y: run.grave.y }
      : { x: 60, y: 300 };
  const victim = put(run, where.x, where.y);
  if (victim === null) {
    reportUnplaceableVictim(tick);
    return 0;
  }
  damageMob(run, victim, victim.hp, 'skullStream');
  return 1;
};

/**
 * Runs the scenario, returning its digest, how close it came to the field
 * boundary, the run itself and any faults it broke.
 *
 * It lives in src/dev rather than inside the test because two callers need it:
 * the test in src/game, and the #/digest screen, which runs the same scenario
 * in whatever browser opened the URL. CI and the developer's machine are the
 * same Node, so a browser is the only place ADR 0015's cross-engine claim can
 * actually be checked.
 *
 * The fold itself lives in src/game/witness.ts (ADR 0019), because a replay
 * ships and ADR 0013 keeps this rig out of the shipped game. The digest is the
 * witness of this one canonical scenario, chained across its ticks: it folds
 * every live entity's own state in slot order, which is what puts math.ts on
 * the path and covers the spawn sequence and pool iteration order with it.
 */
const runScenario = (): ScenarioResult => {
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
    const move = SCRIPT[tick % SCRIPT.length];
    if (move === undefined) throw new Error(`no scripted move at tick ${tick}`);
    executeTick(execution, { move, belch: false });
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
};

/**
 * THE CONSTANT IS NEVER UPDATED TO MAKE A FAILING TEST PASS. A change here is a
 * deliberate tuning or rules change, and the update is part of that change with
 * the reason in the commit message. Regeneration is a human paste: run
 * `pnpm digest`, and the test logs the regenerated object as a paste-ready
 * literal before it asserts.
 *
 * Re-pinned on 2026-08-30 for #79's measured tuning pass: TERRITORY_PERIOD
 * went from 500 to 832, a deliberate cadence change, so the 600-tick scenario
 * no longer contains a lay at all. drawn.territory went from 2 to 0, the
 * checksum moved from -362706426 because the witness folds the ground the
 * scenario no longer claims, and every other field held, the two kills
 * included.
 *
 * Re-pinned on 2026-08-31 for ghoul 20 (#79 ruling): the ghoul's health went
 * from 24 to 20, the witness folds every live mob's hp, and the checksum
 * moved from 932198217. Every other field held, the two kills included.
 *
 * Re-pinned for the thinned birthright (ADR 0045): Territory left the
 * birthright, so the scenario's levels.territory went from 1 to 0 and the
 * checksum moved from -1401997495. The scenario contains no lay at this
 * cadence, so drawn.territory was already 0 and no other field moved, the two
 * kills included.
 *
 * Re-pinned for carriers (ADR 0002 superseded on its power half): the witness
 * stopped folding killsSinceDrop and dropsPaid with the price table they
 * belonged to, and started folding each live mob's carrier flag, so the
 * checksum moved from 1634744137. Only the checksum moved. The scenario's two
 * kills are both scripted mobs that carry nothing, so no drop is paid and
 * drawn.drops stays 0, and the two ramp rows inside the 600 ticks carry a
 * carrier each without drawing from any stream.
 *
 * Re-pinned for the offer of three and the bank (ADR 0034): the witness now
 * folds the live offer and the banked count, so the checksum moved from
 * -1694949037. Only the checksum moved. The scenario kills no carrier, so its
 * offer is null for all 600 ticks and its bank stays at zero: what the fold
 * gained here is the absent-offer sentinel and a zero, and drawn.drops stays 0
 * because an offer draws only when one opens.
 *
 * Re-pinned for the three named sections (ADR 0049, ADR 0050): the scenario's
 * 600 ticks fall inside what is now the Procession, and that section owns
 * emptiness, so its second row moved from t=8 to t=11 and one authored body
 * that used to be on the field at tick 600 has not arrived yet. mobs moved from
 * 6 to 5 and the checksum from -1111652845. Nothing else moved: the grave's
 * position, its size, the reservoir, the two scripted kills and every stream
 * cursor all held, because the scenario's own script is unchanged and the one
 * body it lost carries nothing and draws nothing.
 *
 * Re-pinned for the boss machine and the set piece's record (ADR 0007,
 * ADR 0042): the witness now folds the one boss on the field and the one set
 * piece, so the checksum moved from -141809765. Only the checksum moved. The
 * scenario meets neither, so what the fold gained here is the two absent
 * sentinels and nothing else, which is exactly what ADR 0019's rule that an
 * absent field folds its own code rather than being skipped costs. It is the
 * one WITNESS_VERSION move of this step, 5 to 6.
 *
 * Re-pinned on 2026-09-09 for the mow (ADR 0059): the shambler's health went
 * from 40 to 8 and its fire row became NEVER_FIRES, and the witness folds
 * every live mob's health and every live shot, so the checksum moved from
 * -36124581. Two other fields moved with it and both are the silence rather
 * than the health: shots went from 2 to 0 and drawn.mobFire from 1 to 0,
 * because the scripted File's armed shambler was the only thing in the
 * scenario that fired, and the first-shot jitter it drew on was the only draw
 * the mobFire stream took here. Everything else held, the two scripted kills
 * included: the grave's position and size, the reservoir, mobs at 5, corpses,
 * skulls, and every other stream cursor. The Procession's teaching Drip moved
 * to a lone revenant in the same commit and does not reach this window at all,
 * because it stands at t=11 and the scenario is 600 ticks.
 */
const GOLDEN: Digest = {
  tick: 600,
  seed: 20260820,
  graveX: 365.625,
  graveY: 318.875,
  size: 24.50625,
  score: 0,
  reservoir: 0.50625,
  mobs: 5,
  shots: 0,
  corpses: 1,
  skulls: 2,
  wisps: 0,
  kills: 2,
  drawn: {
    spawns: 1,
    drops: 0,
    mobFire: 0,
    shed: 0,
    territory: 0,
  },
  levels: {
    skullStream: 1,
    territory: 0,
    wisps: 0,
    bell: 0,
  },
  checksum: -279620599,
};

export { runScenario, GOLDEN };
export type { Digest, BoundaryExtremes, ScenarioResult };
