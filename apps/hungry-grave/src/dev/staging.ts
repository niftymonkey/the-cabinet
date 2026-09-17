// Staging a run into a state a played run would take minutes to reach.

import { MOB_TYPES } from '../game/mobs';
import type { RunState } from '../game/run';

/**
 * How many times its own health a staged mob carries, so the storm cannot take
 * it off the grave inside the window it is standing there for.
 */
const UNKILLABLE = 100;

/**
 * A mob standing in the grave, which is one contact per tick it is alive, and
 * the only way in the tree to make a hit land on demand.
 *
 * It takes pool slot zero rather than spawning, because a spawn is refused
 * once the pool is full and a staged hit that silently did not happen is
 * exactly the reading a scenario cannot afford.
 */
const standMobOnGrave = (run: RunState): void => {
  const mob = run.mobs[0];
  if (mob === undefined) throw new Error('no mob pool slot 0');
  mob.alive = true;
  mob.type = 'shambler';
  mob.hp = MOB_TYPES.shambler.hp * UNKILLABLE;
  mob.x = run.grave.x;
  mob.y = run.grave.y;
};

export { standMobOnGrave };
