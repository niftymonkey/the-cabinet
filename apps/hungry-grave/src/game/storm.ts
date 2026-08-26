// The storm meeting the mobs: skulls, headstones and wisps, resolved as overlaps
// in one fixed order (ADR 0005).

import type { SimEvent } from './events';
import {
  headstoneAt,
  makeStoneInert,
  STONE_DAMAGE,
  STONE_HALF_EXTENT,
  stoneCount,
  stoneIsInert,
} from './lines/headstones';
import { SKULL_DAMAGE, SKULL_HALF_EXTENT } from './lines/soulStream';
import { WISP_DAMAGE, WISP_HALF_EXTENT } from './lines/wisps';
import type { Mob } from './mobs';
import { damageMob, mobHitbox } from './mobs';
import type { Rect } from './overlap';
import { overlaps } from './overlap';
import type { RunState } from './run';

// A square hitbox centred on a point, which is what every storm entity carries.
const squareAt = (x: number, y: number, halfExtent: number): Rect => {
  return {
    x: x - halfExtent,
    y: y - halfExtent,
    width: halfExtent * 2,
    height: halfExtent * 2,
  };
};

// The first live mob a box overlaps, in slot order, or null.
const mobUnder = (state: RunState, box: Rect): Mob | null => {
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    if (overlaps(box, mobHitbox(mob))) return mob;
  }
  return null;
};

// Skulls meeting mobs. A skull is consumed by the mob it hits, one mob per skull.
const resolveSkulls = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  for (const skull of state.skulls) {
    if (!skull.alive) continue;
    const box = squareAt(skull.x, skull.y, SKULL_HALF_EXTENT);
    const mob = mobUnder(state, box);
    if (mob === null) continue;
    skull.alive = false;
    events.push(...damageMob(state, mob, SKULL_DAMAGE, 'soulStream'));
  }
  return events;
};

/**
 * Headstones meeting mobs. A stone is not consumed: it damages and goes inert
 * for a while, so it can carry a mob out of the way rather than dying on it,
 * which is what an orbiting solid means. The recharge itself is headstones.ts's
 * own state and is read and written through that module, never reached into
 * from here.
 */
const resolveHeadstones = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  const count = stoneCount(state);
  for (let index = 0; index < count; index++) {
    if (stoneIsInert(state, index)) continue;
    const at = headstoneAt(state, index);
    if (at === null) continue;
    const mob = mobUnder(state, squareAt(at.x, at.y, STONE_HALF_EXTENT));
    if (mob === null) continue;
    makeStoneInert(state, index);
    events.push(...damageMob(state, mob, STONE_DAMAGE, 'headstones'));
  }
  return events;
};

/**
 * Wisps meeting mobs. A wisp is consumed by whatever it hits, target or not: one
 * that flies through something on the way is not saved for later.
 */
const resolveWisps = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  for (const wisp of state.wisps) {
    if (!wisp.alive) continue;
    const mob = mobUnder(state, squareAt(wisp.x, wisp.y, WISP_HALF_EXTENT));
    if (mob === null) continue;
    wisp.alive = false;
    events.push(...damageMob(state, mob, WISP_DAMAGE, 'wisps'));
  }
  return events;
};

/**
 * The storm meeting the mobs, in one pass over three pools.
 *
 * The bell resolves in its own module instead, because its damage is a
 * consequence of a ring expanding rather than of two boxes overlapping.
 *
 * The order is skulls, then headstones, then wisps, always, so the same seed
 * produces the same kills in the same order.
 */
const resolveStorm = (state: RunState): SimEvent[] => {
  const events = resolveSkulls(state);
  events.push(...resolveHeadstones(state));
  events.push(...resolveWisps(state));
  return events;
};

export { resolveStorm };
