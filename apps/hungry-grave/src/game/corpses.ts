/**
 * Corpses, freshness and feasts. Hides ADR 0004 entirely: the decay curve, the
 * scroll-speed coupling, the payout floor, and the dirt taking an empty corpse
 * under.
 *
 * The coupling is the whole point of a corpse having no velocity of its own.
 * The scroll phase moves it and nothing else does, so a corpse drifts at
 * exactly SCROLL_SPEED, and FRESHNESS_SECONDS is already derived as the time a
 * mid-field corpse takes to reach the bottom edge at that speed. A mid-field
 * kill therefore arrives at the bottom edge as a nearly empty scrap by
 * construction rather than by two numbers agreeing.
 */

import { CORPSE_CAP, createPool, oldestLive, takeSlot } from "./caps";
import { TICK_HZ } from "./clock";
import type { SimEvent } from "./events";
import { FIELD_HEIGHT } from "./field";
import type { CorpseTier, Mob } from "./mobs";
import { MOB_TYPES } from "./mobs";
import type { Rect } from "./overlap";
import type { RunState } from "./run";
import type { FoodKind, Swallowable } from "./swallow";
import { FRESHNESS_SECONDS } from "./tuning";

/**
 * Corpse size is constant across mob types, even though a revenant's payout is
 * double. The payout is data and the size is not, because ADR 0014 makes
 * silhouette the first discriminator between corpses, treasure and mob fire,
 * and a corpse that changed size to show its value would break that. Payout
 * reads as a per-tier hue instead.
 *
 * Seven units puts it clearly under the smallest mob body and clearly over a
 * drop, so the three silhouettes stay ordered by size.
 */
export const CORPSE_HALF_EXTENT = 7;

/** How much freshness one tick drains. Derived from the seconds, which are themselves derived from the scroll. */
export const FRESHNESS_PER_TICK = 1 / (FRESHNESS_SECONDS * TICK_HZ);

export interface Corpse {
  alive: boolean;
  id: number;
  x: number;
  y: number;
  /** One meter, from kill to gone (ADR 0004). Treasure is always 1. */
  freshness: number;
  /** What this corpse pays before freshness scales it, in size units. */
  payout: number;
  tier: CorpseTier;
  kind: FoodKind;
  /** Feasts never decay (ADR 0004), and the flag lives on the record so the boss dispatch authors a shed rather than a mechanism. */
  decays: boolean;
}

function blankCorpse(): Corpse {
  return {
    alive: false,
    id: 0,
    x: 0,
    y: 0,
    freshness: 0,
    payout: 0,
    tier: "trash",
    kind: "corpse",
    decays: true,
  };
}

export function createCorpsePool(): Corpse[] {
  return createPool(CORPSE_CAP, blankCorpse);
}

export function corpseHitbox(corpse: Corpse): Rect {
  return {
    x: corpse.x - CORPSE_HALF_EXTENT,
    y: corpse.y - CORPSE_HALF_EXTENT,
    width: CORPSE_HALF_EXTENT * 2,
    height: CORPSE_HALF_EXTENT * 2,
  };
}

/**
 * A corpse as the value swallow.ts takes. It stays a conversion rather than the
 * corpse being a Swallowable, because swallow.ts takes values and never an
 * entity: entities are pooled and mutated in place, so a held reference is a
 * recycled slot by the time anything reads it.
 */
export function asSwallowable(corpse: Corpse): Swallowable {
  return {
    kind: corpse.kind,
    freshness: corpse.freshness,
    payout: corpse.payout,
  };
}

/**
 * Room for one more corpse. At the cap the oldest live corpse by id is taken
 * under and the new corpse takes its slot: the freshest corpse is the one worth
 * diving for and the oldest is nearly worthless by ADR 0004's own curve, so
 * dropping the oldest costs the player the least. Refusing the spawn instead
 * would silently punish killing a lot at once, which is the best play.
 */
function claimSlot(state: RunState, events: SimEvent[]): Corpse | null {
  const free = takeSlot(state.corpses, state.nextEntityId);
  if (free !== null) {
    state.nextEntityId += 1;
    return free;
  }
  const evicted = oldestLive(state.corpses);
  if (evicted === null) return null;
  events.push({
    type: "corpseEvicted",
    x: evicted.x,
    y: evicted.y,
    freshness: evicted.freshness,
  });
  evicted.id = state.nextEntityId;
  state.nextEntityId += 1;
  return evicted;
}

/** What a kill leaves behind: fully fresh, at the dead mob's centre, with no velocity of its own. */
export function spawnCorpse(state: RunState, mob: Mob): SimEvent[] {
  const events: SimEvent[] = [];
  const corpse = claimSlot(state, events);
  if (corpse === null) return events;

  const row = MOB_TYPES[mob.type];
  corpse.alive = true;
  corpse.x = mob.x;
  corpse.y = mob.y;
  corpse.freshness = 1;
  corpse.payout = row.corpsePayout;
  corpse.tier = row.corpseTier;
  corpse.kind = "corpse";
  corpse.decays = true;
  return events;
}

/**
 * A boss-shed reward corpse that never decays (ADR 0004). Nothing in this
 * dispatch spawns one; the boss dispatch authors the shed and inherits the
 * mechanism rather than inventing it.
 */
export function spawnFeast(
  state: RunState,
  x: number,
  y: number,
  payout: number,
): SimEvent[] {
  const events: SimEvent[] = [];
  const corpse = claimSlot(state, events);
  if (corpse === null) return events;

  corpse.alive = true;
  corpse.x = x;
  corpse.y = y;
  corpse.freshness = 1;
  corpse.payout = payout;
  corpse.tier = "rich";
  corpse.kind = "feast";
  corpse.decays = false;
  return events;
}

/** Freshness drains linearly, and at empty the dirt takes the corpse under. */
export function advanceCorpses(state: RunState): SimEvent[] {
  const events: SimEvent[] = [];
  for (const corpse of state.corpses) {
    if (!corpse.alive || !corpse.decays) continue;
    corpse.freshness = Math.max(0, corpse.freshness - FRESHNESS_PER_TICK);
    if (corpse.freshness > 0) continue;
    corpse.alive = false;
    events.push({ type: "corpseExpired", x: corpse.x, y: corpse.y });
  }
  return events;
}

/**
 * A corpse off the bottom edge with value left. It is a different read from an
 * expired one and so a different event: one is greed that ran out of time, the
 * other is a dive never attempted.
 */
export function cullCorpses(state: RunState): SimEvent[] {
  const events: SimEvent[] = [];
  for (const corpse of state.corpses) {
    if (!corpse.alive) continue;
    if (corpse.y - CORPSE_HALF_EXTENT <= FIELD_HEIGHT) continue;
    corpse.alive = false;
    events.push({
      type: "corpseLost",
      x: corpse.x,
      y: corpse.y,
      freshness: corpse.freshness,
    });
  }
  return events;
}
