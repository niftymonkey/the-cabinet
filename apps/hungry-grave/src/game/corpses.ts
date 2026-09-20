// Corpses, freshness and feasts. Hides ADR 0004 entirely: the decay curve, the
// scroll-speed coupling, the payout floor, and the dirt taking an empty corpse
// under.

import { createPool, takeSlot } from './caps';
import { TICK_HZ } from './clock';
import type { SimEvent } from './events';
import { FIELD_HEIGHT } from './field';
import type { WeaponLine } from './lines/roster';
import type { CorpseTier, Mob } from './mobs';
import type { Rect } from './overlap';
import type { RunState } from './run';
import type { Impulse } from './shove';
import { blankImpulse, clearImpulse, handOverImpulse } from './shove';
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
 * power-up, so the three silhouettes stay ordered by size.
 */
const CORPSE_HALF_EXTENT = 7;

/**
 * A power-up's half-extent: a 28-unit catch box, deliberately more generous than
 * the 24-unit drawn peak, about 1.17 times the ink. Mark's rule, ruled
 * 2026-08-25, and the rule outranks the number: the pickup area stays slightly
 * more generous than the power-up's maximum visible footprint, because collecting
 * treasure is never a precision test.
 *
 * More generous rather than equal, for three reasons. The breath moves the
 * visible edge, so a box equal to the peak makes "I touched it and got it"
 * true at one phase and false at another. The grave's own hitbox shrinks with
 * damage, so the grab is hardest at the size floor, exactly where ADR 0003's
 * ladder is stripping weapon levels and the recovery path must stay open. And
 * ADR 0003 already rules that size never gates a swallow. It stays nowhere
 * near the genre's most generous: a power-up is one of ten to twelve in a run and
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
const POWER_UP_HALF_EXTENT = 14;

// How much freshness one tick drains. Derived from the seconds, which are themselves derived from the scroll.
const FRESHNESS_PER_TICK = 1 / (FRESHNESS_SECONDS * TICK_HZ);

/**
 * A corpse has no motion of its own, and the scroll-speed coupling is the whole
 * point of that. A corpse nothing threw drifts at exactly SCROLL_SPEED, and
 * FRESHNESS_SECONDS is derived as the time a mid-field corpse takes to reach
 * the bottom edge at that speed, so a mid-field kill arrives at the bottom edge
 * as a nearly empty scrap by construction rather than by two numbers agreeing.
 *
 * Two things compose with that drift. A shove handed over by the body this
 * corpse came off carries it for the rest of that one flight and then stops
 * (design record R10). The grave's pull gives it a velocity of its own while it
 * is near the rim, and the same line is the ground's drag once it is not
 * (`pull.ts`, `grave-in-the-ground.md` R3). The derivation above is exact for
 * every corpse nothing threw and nothing pulled; a thrown one is off by the
 * length of one flight, bounded by the shove's own row, and a pulled one is off
 * only inside the reach, which is a data row a few units wide. The scroll still
 * runs underneath both, exactly as it does for a body being shoved (design
 * record R11's fourth ruling), so neither replaces the drift.
 */
interface Corpse {
  alive: boolean;
  id: number;
  x: number;
  y: number;
  /**
   * The motion the pull has given this food, in field units a tick (`pull.ts`,
   * design record R3).
   *
   * It is a velocity the food keeps rather than a displacement spent on the
   * tick it was decided, which is what makes food arrive at the mouth moving
   * and coast for a moment after the grave leaves it. It composes with the
   * scroll and with a shove the same way both of those compose with each other:
   * the pull writes no impulse and a shove writes no velocity, so the two
   * displacements add and neither is counted twice.
   */
  vx: number;
  vy: number;
  // One meter, from kill to gone (ADR 0004). Treasure is always 1.
  freshness: number;
  // What this corpse pays before freshness scales it, in size units.
  payout: number;
  tier: CorpseTier;
  kind: FoodKind;
  // Feasts never decay (ADR 0004), and the flag lives on the record so the boss dispatch authors a shed rather than a mechanism.
  decays: boolean;
  /**
   * Whether this body wears the treasure body: the breath, the treasure layer
   * two above corpses (ADR 0014), and the treasure chime. It is a row rather
   * than a kind test at each drawing and sounding site, so a fifth kind of food
   * costs neither of them an edit (design record R6).
   *
   * A feast is treasure by the glossary's class and never decays, and it still
   * says false here: it wears the food layer's own body in the feast's colour
   * and chimes as a plain swallow, which is what the tree has always drawn and
   * sounded and is not this slice's to widen.
   */
  treasureBody: boolean;
  // Which line a power-up levels, decided by the dice at spawn (ADR 0034), or which line a fallen rung came off. Absent on corpses and feasts.
  line?: WeaponLine;
  /**
   * How large this food is swallowed at. It lives on the record rather than
   * being the module constant, because a power-up is larger than a corpse and every
   * reader of the extent has to see the difference: a hitbox that read the
   * constant would hold a power-up on the field for a unit of extra travel past
   * where a corpse goes.
   */
  halfExtent: number;
  /**
   * The shove this corpse is carrying, if one was handed to it (shove.ts).
   *
   * It is declared with the fold that folds it rather than the day something
   * hands one over, because a folded field arriving later would change what
   * every tape recorded in between folded, which is the rule mobs[].from was
   * declared early under. The caller is written down: the design record's
   * section 4, slice J2, where a shove outlives the body that carried it.
   */
  impulse: Impulse;
}

const blankCorpse = (): Corpse => {
  return {
    alive: false,
    id: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    freshness: 0,
    payout: 0,
    tier: 'trash',
    kind: 'corpse',
    decays: true,
    treasureBody: false,
    line: undefined,
    halfExtent: CORPSE_HALF_EXTENT,
    impulse: blankImpulse(),
  };
};

const createCorpsePool = (cap: number): Corpse[] => {
  return createPool(cap, blankCorpse);
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
    id: corpse.id,
    kind: corpse.kind,
    freshness: corpse.freshness,
    payout: corpse.payout,
    tier: corpse.tier,
    treasureBody: corpse.treasureBody,
    line: corpse.line,
  };
};

/**
 * Room for one more piece of food, or null at the cap (ADR 0056).
 *
 * Nothing already on the field is ever removed to make room. The cap is sized
 * from the stage's own waves so that it cannot bind in normal play, so a refusal
 * means something has gone wrong rather than that the player killed too well,
 * and the answer to that is the fault the harness raises off the count below
 * rather than a graceful degradation that hides it. The eviction this replaces
 * took the oldest corpse under, which is food removed from a player who had
 * already read it and started diving.
 */
const claimSlot = (state: RunState): Corpse | null => {
  const free = takeSlot(state.corpses, state.nextEntityId);
  if (free === null) {
    state.refusals.food += 1;
    return null;
  }
  state.nextEntityId += 1;
  // The slot may be one a carried or a pulled corpse died in, and an inherited
  // impulse or velocity would carry new food away on a push and a tug that
  // never reached it. Both are cleared here rather than in each of the four
  // spawns, because every one of them comes through this door (spawnMob keeps
  // the same rule on the mob pool).
  clearImpulse(free.impulse);
  free.vx = 0;
  free.vy = 0;
  return free;
};

/**
 * What a kill leaves behind: fully fresh, at the dead mob's centre, and
 * carrying whatever was carrying the body.
 *
 * The shove travels with it so the flight the press paid for finishes: a body
 * killed partway through is carried the whole of what threw it and its corpse
 * ends where the flight was going rather than where the storm caught it (design
 * record R10). The handover is here rather than at the kill site because the
 * corpse only exists once a slot has been claimed, and at the food cap there is
 * no slot, which is the one case where the shove stays on the body.
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
  const corpse = claimSlot(state);
  if (corpse === null) return events;

  corpse.alive = true;
  corpse.x = mob.x;
  corpse.y = mob.y;
  corpse.freshness = 1;
  corpse.payout = payout;
  corpse.tier = tier;
  corpse.kind = 'corpse';
  corpse.decays = true;
  corpse.treasureBody = false;
  corpse.line = undefined;
  corpse.halfExtent = CORPSE_HALF_EXTENT;
  handOverImpulse(mob.impulse, corpse.impulse);
  return events;
};

/**
 * A boss-shed reward corpse that never decays (ADR 0004). A phase break sheds
 * one, which is what keeps ADR 0007's shed-food promise inside the fight rather
 * than at the end of it: a player who cannot dive through the pattern yet still
 * has it waiting.
 */
const spawnFeast = (
  state: RunState,
  x: number,
  y: number,
  payout: number,
): SimEvent[] => {
  const events: SimEvent[] = [];
  const corpse = claimSlot(state);
  if (corpse === null) return events;

  corpse.alive = true;
  corpse.x = x;
  corpse.y = y;
  corpse.freshness = 1;
  corpse.payout = payout;
  corpse.tier = 'rich';
  corpse.kind = 'feast';
  corpse.decays = false;
  corpse.treasureBody = false;
  corpse.line = undefined;
  corpse.halfExtent = CORPSE_HALF_EXTENT;
  return events;
};

/**
 * A power-up, on the food pool rather than in a second one. It reuses claimSlot, so
 * it inherits spawning, scrolling, culling and swallowing for free, which is the
 * whole reason not to build a pool of its own.
 *
 * Fully fresh and never decaying, so a body carrying no option at all still
 * pays growth, reservoir and overflow: nothing swallowed is ever worthless
 * (ADR 0002). A body with no line is what a maxed run's carrier opens, and the
 * absent line is what says so all the way out to the sprite.
 *
 * The spawn is reported with the body's own id, because the offer that opened
 * it holds its bodies by id and a refused spawn must be visible to it as a
 * body that is simply not there.
 */
const spawnPowerUp = (
  state: RunState,
  x: number,
  y: number,
  line?: WeaponLine,
): SimEvent[] => {
  const events: SimEvent[] = [];
  const corpse = claimSlot(state);
  if (corpse === null) return events;

  corpse.alive = true;
  corpse.x = x;
  corpse.y = y;
  corpse.freshness = 1;
  corpse.payout = TRASH_CORPSE_PAYOUT;
  corpse.tier = 'trash';
  corpse.kind = 'powerUp';
  corpse.decays = false;
  corpse.treasureBody = true;
  corpse.line = line;
  corpse.halfExtent = POWER_UP_HALF_EXTENT;
  events.push({ type: 'powerUpSpawned', id: corpse.id, line, x, y });
  return events;
};

/**
 * A rung the floor ladder took, standing on the field as a body the dive can
 * catch (ADR 0055, decision 24). A fourth kind on this pool rather than a pool
 * of its own, so the scroll, the containment, the swallow and the renderer all
 * come free.
 *
 * It wears the treasure body at the power-up's own extent, deliberately the
 * same drawing an offer's body wears: both are treasure, and teaching the
 * player a second treasure shape to say the same thing is a cost the record
 * does not pay (design record R6). The line it came off is what parts one
 * fallen rung from another, through the icon the HUD's row already taught.
 *
 * Never decaying is this row's default and not an impossibility. ADR 0055 and
 * decision 20 both leave decay as tuning data, so a later pass may turn the
 * flag on without a record to re-rule, and the scroll stays the one deadline
 * until it does.
 *
 * It pays the trash corpse's payout, as an offer's body does: nothing swallowed
 * is ever worthless (ADR 0002), and a rung caught pays the same growth as the
 * treasure beside it so the catch is never the cheap dive.
 *
 * A body the cap refuses reports nothing, because nothing fell onto the field.
 * The level is still gone and weaponStripped is what says so; there is no bank
 * analogue for a rung and none is built (design record R6).
 */
const spawnFallenRung = (
  state: RunState,
  x: number,
  y: number,
  line: WeaponLine,
): SimEvent[] => {
  const events: SimEvent[] = [];
  const corpse = claimSlot(state);
  if (corpse === null) return events;

  corpse.alive = true;
  corpse.x = x;
  corpse.y = y;
  corpse.freshness = 1;
  corpse.payout = TRASH_CORPSE_PAYOUT;
  corpse.tier = 'trash';
  corpse.kind = 'fallenRung';
  corpse.decays = false;
  corpse.treasureBody = true;
  corpse.line = line;
  corpse.halfExtent = POWER_UP_HALF_EXTENT;
  events.push({ type: 'rungFell', line, x, y });
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
    events.push({
      type: 'corpseExpired',
      kind: corpse.kind,
      x: corpse.x,
      y: corpse.y,
    });
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
  spawnPowerUp,
  spawnFallenRung,
  advanceCorpses,
  cullCorpses,
  CORPSE_HALF_EXTENT,
  POWER_UP_HALF_EXTENT,
  FRESHNESS_PER_TICK,
};
export type { Corpse };
