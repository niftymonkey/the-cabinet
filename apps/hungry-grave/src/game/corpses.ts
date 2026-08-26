// Corpses, freshness and feasts. Hides ADR 0004 entirely: the decay curve, the
// scroll-speed coupling, the payout floor, and the dirt taking an empty corpse
// under.

import { CORPSE_CAP, createPool, takeSlot } from './caps';
import { TICK_HZ } from './clock';
import type { SimEvent } from './events';
import { FIELD_HEIGHT } from './field';
import type { WeaponLine } from './lines/roster';
import type { CorpseTier, Mob } from './mobs';
import type { Rect } from './overlap';
import type { RunState } from './run';
import type { FoodKind, Swallowable } from './swallow';
import { FRESHNESS_SECONDS, TRASH_CORPSE_PAYOUT } from './tuning';

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
const CORPSE_HALF_EXTENT = 7;

/**
 * A drop's half-extent: a 28-unit catch box, deliberately more generous than
 * the 24-unit drawn peak, about 1.17 times the ink. Mark's rule, ruled
 * 2026-08-25, and the rule outranks the number: the pickup area stays slightly
 * more generous than the drop's maximum visible footprint, because collecting
 * treasure is never a precision test.
 *
 * More generous rather than equal, for three reasons. The breath moves the
 * visible edge, so a box equal to the peak makes "I touched it and got it"
 * true at one phase and false at another. The grave's own hitbox shrinks with
 * damage, so the grab is hardest at the size floor, exactly where ADR 0003's
 * ladder is stripping weapon levels and the recovery path must stay open. And
 * ADR 0003 already rules that size never gates a swallow. It stays nowhere
 * near the genre's most generous: a drop is one of ten to twelve in a run and
 * ADR 0002 makes it the thing the player routes toward, so a box large enough
 * to remove the routing choice would delete the mechanic. Twenty-eight is
 * tuning, not doctrine; if #31's playtest reads pickups as magnetic enough to
 * remove the routing choice, that is the trigger to tighten it.
 *
 * Raising this was a sim change, and old sealed tapes replaying differently is
 * expected: the witness refusing them is the system working (Mark's general
 * ruling, 2026-08-25). The prior bound under graveWidth(SIZE_FLOOR) is
 * superseded, written out in docs/design/drop-legibility-fix.md, and
 * FieldRenderer.test.ts holds the two bounds that replace it.
 */
const DROP_HALF_EXTENT = 14;

// How much freshness one tick drains. Derived from the seconds, which are themselves derived from the scroll.
const FRESHNESS_PER_TICK = 1 / (FRESHNESS_SECONDS * TICK_HZ);

/**
 * A corpse has no velocity of its own, and the scroll-speed coupling is the
 * whole point of that. The scroll phase moves it and nothing else does, so a
 * corpse drifts at exactly SCROLL_SPEED, and FRESHNESS_SECONDS is already
 * derived as the time a mid-field corpse takes to reach the bottom edge at that
 * speed. A mid-field kill therefore arrives at the bottom edge as a nearly
 * empty scrap by construction rather than by two numbers agreeing.
 */
interface Corpse {
  alive: boolean;
  id: number;
  x: number;
  y: number;
  // One meter, from kill to gone (ADR 0004). Treasure is always 1.
  freshness: number;
  // What this corpse pays before freshness scales it, in size units.
  payout: number;
  tier: CorpseTier;
  kind: FoodKind;
  // Feasts never decay (ADR 0004), and the flag lives on the record so the boss dispatch authors a shed rather than a mechanism.
  decays: boolean;
  // Which line a drop levels, decided by the dice at spawn (ADR 0002). Absent on corpses and feasts.
  line?: WeaponLine;
  /**
   * How large this food is swallowed at. It lives on the record rather than
   * being the module constant, because a drop is larger than a corpse and every
   * reader of the extent has to see the difference: a hitbox that read the
   * constant would hold a drop on the field for a unit of extra travel past
   * where a corpse goes.
   */
  halfExtent: number;
}

const blankCorpse = (): Corpse => {
  return {
    alive: false,
    id: 0,
    x: 0,
    y: 0,
    freshness: 0,
    payout: 0,
    tier: 'trash',
    kind: 'corpse',
    decays: true,
    line: undefined,
    halfExtent: CORPSE_HALF_EXTENT,
  };
};

const createCorpsePool = (): Corpse[] => {
  return createPool(CORPSE_CAP, blankCorpse);
};

const corpseHitbox = (corpse: Corpse): Rect => {
  return {
    x: corpse.x - corpse.halfExtent,
    y: corpse.y - corpse.halfExtent,
    width: corpse.halfExtent * 2,
    height: corpse.halfExtent * 2,
  };
};

/**
 * A corpse as the value swallow.ts takes. It stays a conversion rather than the
 * corpse being a Swallowable, because swallow.ts takes values and never an
 * entity: entities are pooled and mutated in place, so a held reference is a
 * recycled slot by the time anything reads it.
 */
const asSwallowable = (corpse: Corpse): Swallowable => {
  return {
    kind: corpse.kind,
    freshness: corpse.freshness,
    payout: corpse.payout,
    line: corpse.line,
  };
};

/**
 * The oldest live food the cap policy may take, which is never treasure.
 *
 * The policy's own reasoning is that the cheapest thing to lose should go, and a
 * drop that has been on the field a while is both the oldest thing in the pool
 * and the scarcest object in the game. Skipping anything that does not decay
 * covers drops and the boss feasts, and if every slot holds treasure the spawn
 * is refused instead.
 */
const oldestEvictable = (pool: readonly Corpse[]): Corpse | null => {
  let oldest: Corpse | null = null;
  for (const corpse of pool) {
    if (!corpse.alive || !corpse.decays) continue;
    if (oldest === null || corpse.id < oldest.id) oldest = corpse;
  }
  return oldest;
};

/**
 * Room for one more corpse. At the cap the oldest live corpse by id is taken
 * under and the new corpse takes its slot: the freshest corpse is the one worth
 * diving for and the oldest is nearly worthless by ADR 0004's own curve, so
 * dropping the oldest costs the player the least. Refusing the spawn instead
 * would silently punish killing a lot at once, which is the best play.
 */
const claimSlot = (state: RunState, events: SimEvent[]): Corpse | null => {
  const free = takeSlot(state.corpses, state.nextEntityId);
  if (free !== null) {
    state.nextEntityId += 1;
    return free;
  }
  const evicted = oldestEvictable(state.corpses);
  if (evicted === null) return null;
  events.push({
    type: 'corpseEvicted',
    x: evicted.x,
    y: evicted.y,
    freshness: evicted.freshness,
  });
  evicted.id = state.nextEntityId;
  state.nextEntityId += 1;
  return evicted;
};

/**
 * What a kill leaves behind: fully fresh, at the dead mob's centre, with no
 * velocity of its own.
 *
 * The payout and the tier arrive as values rather than being looked up off the
 * mob table here. mobs.ts owns that table, so mobs.ts reads its own row and
 * hands the two numbers over, which is the same rule events.ts already states
 * for its payloads: values travel, entity references never do.
 */
const spawnCorpse = (
  state: RunState,
  mob: Mob,
  payout: number,
  tier: CorpseTier,
): SimEvent[] => {
  const events: SimEvent[] = [];
  const corpse = claimSlot(state, events);
  if (corpse === null) return events;

  corpse.alive = true;
  corpse.x = mob.x;
  corpse.y = mob.y;
  corpse.freshness = 1;
  corpse.payout = payout;
  corpse.tier = tier;
  corpse.kind = 'corpse';
  corpse.decays = true;
  corpse.line = undefined;
  corpse.halfExtent = CORPSE_HALF_EXTENT;
  return events;
};

/**
 * A boss-shed reward corpse that never decays (ADR 0004). Nothing in the game
 * spawns one yet; the boss dispatch authors the shed and inherits the mechanism
 * rather than inventing it.
 */
const spawnFeast = (
  state: RunState,
  x: number,
  y: number,
  payout: number,
): SimEvent[] => {
  const events: SimEvent[] = [];
  const corpse = claimSlot(state, events);
  if (corpse === null) return events;

  corpse.alive = true;
  corpse.x = x;
  corpse.y = y;
  corpse.freshness = 1;
  corpse.payout = payout;
  corpse.tier = 'rich';
  corpse.kind = 'feast';
  corpse.decays = false;
  corpse.line = undefined;
  corpse.halfExtent = CORPSE_HALF_EXTENT;
  return events;
};

/**
 * A drop, on the food pool rather than in a second one. It reuses claimSlot, so
 * it inherits spawning, scrolling, culling and swallowing for free, which is the
 * whole reason not to build a pool of its own.
 *
 * Fully fresh and never decaying, so a maxed line's drop still pays growth,
 * reservoir and overflow: nothing swallowed is ever worthless (ADR 0002).
 */
const spawnDrop = (
  state: RunState,
  x: number,
  y: number,
  line: WeaponLine,
): SimEvent[] => {
  const events: SimEvent[] = [];
  const corpse = claimSlot(state, events);
  if (corpse === null) return events;

  corpse.alive = true;
  corpse.x = x;
  corpse.y = y;
  corpse.freshness = 1;
  corpse.payout = TRASH_CORPSE_PAYOUT;
  corpse.tier = 'trash';
  corpse.kind = 'drop';
  corpse.decays = false;
  corpse.line = line;
  corpse.halfExtent = DROP_HALF_EXTENT;
  events.push({ type: 'dropSpawned', line, x, y });
  return events;
};

// Freshness drains linearly, and at empty the dirt takes the corpse under.
const advanceCorpses = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  for (const corpse of state.corpses) {
    if (!corpse.alive || !corpse.decays) continue;
    corpse.freshness = Math.max(0, corpse.freshness - FRESHNESS_PER_TICK);
    if (corpse.freshness > 0) continue;
    corpse.alive = false;
    events.push({ type: 'corpseExpired', x: corpse.x, y: corpse.y });
  }
  return events;
};

/**
 * A corpse off the bottom edge with value left. It is a different read from an
 * expired one and so a different event: one is greed that ran out of time, the
 * other is a dive never attempted.
 */
const cullCorpses = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  for (const corpse of state.corpses) {
    if (!corpse.alive) continue;
    if (corpse.y - corpse.halfExtent <= FIELD_HEIGHT) continue;
    corpse.alive = false;
    events.push({
      type: 'corpseLost',
      kind: corpse.kind,
      x: corpse.x,
      y: corpse.y,
      freshness: corpse.freshness,
    });
  }
  return events;
};

export {
  createCorpsePool,
  corpseHitbox,
  asSwallowable,
  spawnCorpse,
  spawnFeast,
  spawnDrop,
  advanceCorpses,
  cullCorpses,
  CORPSE_HALF_EXTENT,
  DROP_HALF_EXTENT,
  FRESHNESS_PER_TICK,
};
export type { Corpse };
