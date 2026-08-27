/**
 * The storm meeting the mobs: skulls, Territory and wisps, resolved as overlaps
 * in one fixed order.
 *
 * This supersedes the weapons plan's ruling that there is deliberately no
 * storm.ts, on the grounds that a module holding only the storm's overlap tests
 * is the collide.ts the tracer plan forbids, and that mobs.ts is the file the
 * consequence of a hit belongs to. What that ruling was protecting still stands
 * and none of it moved here: there is no cullStorm, each line still culls its own
 * pool because a cull is motion's own consequence, and the bell still resolves
 * inside advanceBell rather than in this pass, because its damage follows a ring
 * expanding rather than two boxes overlapping. What it could not have known is
 * that a module holding one overlap pass over a couple of pools is not the
 * module it feared: collide.ts was refused for holding *all* the tick's overlap tests,
 * which this file does not, and keeping the pass in mobs.ts is what made the mob
 * table itself import all three weapon lines to run it. Splitting by concept
 * produces neither the grab-bag the ruling named nor those arrows: mobs.ts now
 * names no weapon line, and this module reaches mobs.ts for damageMob and
 * mobHitbox alone, so the arrow runs from the storm to the mob it damages and
 * never back.
 */

import type { SimEvent } from './events';
import { SKULL_DAMAGE, SKULL_HALF_EXTENT } from './lines/soulStream';
import { resolveTerritory } from './lines/territory';
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
 * The storm meeting the mobs, in one pass.
 *
 * Territory resolves through its own module rather than inline here, because a
 * patch's grabs are the line's own budget and struck set spending down, and the
 * pool this pass would otherwise have to reach into is that line's.
 *
 * The bell resolves in its own module instead, because its damage is a
 * consequence of a ring expanding rather than of two boxes overlapping.
 *
 * The order is skulls, then Territory, then wisps, always, so the same seed
 * produces the same kills in the same order.
 */
const resolveStorm = (state: RunState): SimEvent[] => {
  const events = resolveSkulls(state);
  events.push(...resolveTerritory(state));
  events.push(...resolveWisps(state));
  return events;
};

export { resolveStorm };
