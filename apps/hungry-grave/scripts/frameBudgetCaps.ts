/**
 * The caps module the frame-budget config puts in src/game/caps's place, so a
 * synthetic field can stand at a size the shipped caps refuse.
 *
 * The shipped caps are 160 mobs and 233 corpses, and round 0's table names
 * fields well above both, so an instrument that could only stand what the
 * shipped build holds could not measure the headroom it exists to measure. The
 * caps stay identical on every device in the game itself; this is a bench, and
 * nothing here is in a player's build: only the frame-budget config aliases it
 * in, and only the frame-budget script imports it by name.
 *
 * Two caps move and the rest are the shipped ones, because a field is bodies
 * and food. They are live bindings rather than constants: the pools are built
 * inside createRun, which reads them at call time, so one process can size its
 * pools per row rather than per run of the tool. What does read a cap at module
 * load is stormTargets' scratch array, so the ceiling is raised once, to the
 * largest field about to be measured, before the game is imported at all.
 */

import type { FieldSize } from '../src/dev/syntheticField';
import {
  CORPSE_CAP as SHIPPED_CORPSE_CAP,
  createPool,
  liveCount,
  MOB_CAP as SHIPPED_MOB_CAP,
  MOB_FIRE_CAP,
  SKULL_CAP,
  takeSlot,
  TREASURE_ALLOWANCE,
  WISP_CAP,
} from '../src/game/caps';
import type { PoolSlot } from '../src/game/caps';

let MOB_CAP = SHIPPED_MOB_CAP;
let CORPSE_CAP = SHIPPED_CORPSE_CAP;

/**
 * The pools every run made after this call is built with. It is world-changing
 * setup and it is named, so the entry story says out loud where the bench stops
 * being the shipped build.
 */
const sizePoolsFor = (size: FieldSize): void => {
  MOB_CAP = size.mobs;
  CORPSE_CAP = size.corpses;
};

export {
  createPool,
  takeSlot,
  liveCount,
  MOB_CAP,
  MOB_FIRE_CAP,
  CORPSE_CAP,
  TREASURE_ALLOWANCE,
  SKULL_CAP,
  WISP_CAP,
  sizePoolsFor,
};
export type { PoolSlot };
