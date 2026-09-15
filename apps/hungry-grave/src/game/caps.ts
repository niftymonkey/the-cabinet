// The entity cap policy (tracer plan section 3).

import { TICK_HZ } from './clock';
import { FIELD_HEIGHT } from './field';
import { BODY, MAX_ENTRY_DEPTH } from './stage/formations';
import { peakArrivals } from './stage/waves';
import { FRESHNESS_SECONDS, SCROLL_SPEED } from './tuning';

/**
 * At the cap something must be dropped, and which one is a gameplay rule rather
 * than a housekeeping detail. That is why the policy lives in src/game and not
 * in invariants.ts: checking a cap is not enforcing one, and a policy in
 * src/dev would make the test rig load-bearing in the shipped game.
 *
 * Every capacity declared here is a safety net: a number far enough above the
 * densest thing its pool can hold that reaching it means something has gone
 * wrong. A capacity that decides how a line plays is not one of those and lives
 * in that line's own module, where the rows it is measured against are. That is
 * where TERRITORY_CAP is: it sets how long a trail of claimed ground may be,
 * which is a gameplay rule rather than a guard against a runaway.
 */

/**
 * The caps are a safety net and not a tuning knob, and they are identical on
 * every device and never lowered for a phone's frame budget: a device-varying
 * cap makes the same seed a different game and spends exactly what ADR 0015
 * paid for.
 *
 * The mob cap was a constant of 160, read off a 51-mob peak measured across
 * three seeds in docs/research/invariant-check-cost.md section 3a. The stage's
 * authored floor now grows over the run (ADR 0060) and a standing wave at
 * twelve bodies a second holds more than that in transit at any instant, so the
 * figure stopped describing the content it was taken from. It is a derivation
 * below, on ADR 0056's own terms: the content prices the cap and never the cap
 * the content.
 */

/**
 * The longest a body can stand on the field, in seconds: the deepest a
 * formation may place it above the top edge, plus the field, plus its own
 * length before the cull lets go of it below the bottom edge, at the slowest
 * descent the sim allows.
 *
 * The scroll alone and never a mob type's own speed, for two reasons that agree.
 * Every body descends at the scroll plus its own motion, a faller's speed is
 * positive and a ghoul's chase is floored above zero, so the scroll is a floor
 * on every type's descent and this is therefore an upper bound on every type's
 * stay. And the mob table cannot be read from here at all: mobs.ts imports this
 * module, so reaching back for MOB_TYPES would close a cycle. The bound is
 * loose by design, which is the direction a safety net rounds.
 */
const TRANSIT_SECONDS =
  (MAX_ENTRY_DEPTH + FIELD_HEIGHT + BODY) / (SCROLL_SPEED * TICK_HZ);

/**
 * The most bodies the stage can hold alive at once, derived from the stage's
 * own waves rather than written down (ADR 0056).
 *
 * A proof and not an estimate, in the shape the corpse cap below already uses.
 * Nothing removes a body but a kill, a cull at the bottom edge, or the end of a
 * run, so every body alive at an instant arrived inside one transit window; and
 * what the stage can land in a window is exactly what peakArrivals answers,
 * over the same section walk, counting a standing wave's rate and the shaped
 * beats that fall inside it together. A field nobody clears is the worst case,
 * and that is the case this prices.
 *
 * The headroom a safety net needs is inside the derivation rather than bolted
 * onto it: the transit bound above prices every body at the slowest descent the
 * sim allows, and peakArrivals maximises over window placements rather than
 * reading one.
 */
const peakLive = (): number => peakArrivals(TRANSIT_SECONDS);

const MOB_CAP = peakLive();

/**
 * Mob fire is still a constant, and it is not this slice's to derive: it is
 * bounded by how many armed bodies live and how often each fires, which is the
 * mob table's arithmetic and unreachable from here.
 */
const MOB_FIRE_CAP = 400;

/**
 * Treasure the field can hold at once, which never decays and so is not covered
 * by the freshness window below. An initial row of ten: the three bodies of the
 * one live offer (ADR 0034), the Banshee's death feast, her phase break's, the
 * Undertaker's two, and three spare.
 */
const TREASURE_ALLOWANCE = 10;

/**
 * Room for every corpse the stage can leave alive at once, derived from the two
 * clocks the game already has rather than written down (ADR 0056).
 *
 * A proof and not an estimate. A decaying corpse lives at most
 * FRESHNESS_SECONDS, so every one alive at any instant was made inside that
 * window; every one came from a body that was either alive when the window
 * opened, which MOB_CAP bounds, or arrived inside it, which the stage's own
 * waves bound. Treasure does not decay and is bounded by design instead. So the
 * cap cannot bind in normal play, and binding at all is a bug rather than a
 * policy: the spawn is refused, nothing on the field is removed, and the
 * invariant harness raises a recoverable fault.
 *
 * The director's budget is the addend this is missing, on purpose: it does not
 * exist until step 4 (#85), and peakArrivals is written so it is one more term
 * when it arrives.
 */
const CORPSE_CAP =
  MOB_CAP + peakArrivals(FRESHNESS_SECONDS) + TREASURE_ALLOWANCE;

/**
 * What every pooled entity carries. The id only ever increases and is not
 * cosmetic: the cap policy has to be totally ordered to be deterministic, and a
 * test that says "this corpse, not that one" needs a handle that a recycled
 * slot index cannot give it.
 */
interface PoolSlot {
  alive: boolean;
  id: number;
}

/**
 * A pool at full capacity, every slot dead. Pools are pre-allocated at
 * createRun and mutated in place, so a spawn never allocates.
 */
const createPool = <T extends PoolSlot>(
  capacity: number,
  make: () => T,
): T[] => {
  const pool: T[] = [];
  for (let index = 0; index < capacity; index++) pool.push(make());
  return pool;
};

/**
 * The first dead slot, claimed and stamped with the id, or null when the pool
 * is full. This is the refusal policy: mobs and mob fire take a null answer and
 * do not spawn.
 *
 * Nothing already on the field is ever removed, because a shot the player has
 * read and started dodging cannot vanish: that teaches the player that dodging
 * is optional, and it is the kind of lie that is invisible in a test and
 * infuriating in a hand.
 */
const takeSlot = <T extends PoolSlot>(pool: T[], id: number): T | null => {
  for (const slot of pool) {
    if (slot.alive) continue;
    slot.alive = true;
    slot.id = id;
    return slot;
  }
  return null;
};

// How many slots of a pool are live.
const liveCount = (pool: readonly PoolSlot[]): number => {
  return pool.reduce((count, slot) => count + (slot.alive ? 1 : 0), 0);
};

/**
 * The storm's two pools. Both refuse the spawn at the cap, the same policy mobs
 * and mob fire have, and for a simpler reason than theirs: it is the player's
 * own fire, the lines emit continuously, and one missing skull out of a hundred
 * is invisible where a vanishing mob shot is a lie.
 *
 * Both are derived from the densest thing each pool can produce and both sit
 * above that derivation on purpose. A skull crosses the field's height in 109
 * ticks, so a level-5 stream at its fixed interval holds about 30 alive, and a
 * swallow chained as often as the game allows adds one surged volley each time.
 * Eleven wisps per swallow at a 90-tick life, with a swallow as often as every
 * 20 ticks, holds 50. They are a safety net and not a tuning knob, exactly as
 * MOB_CAP is: a cap that binds in normal play is a bug rather than a policy.
 *
 * #76 pass A moved both densities up, the stream by shortening its interval and
 * the wisps by widening the level-5 volley, so the headroom either cap carries
 * is narrower than it was: the skulls keep four times their worst case and the
 * wisps keep a quarter over theirs.
 */
const SKULL_CAP = 120;
const WISP_CAP = 64;

export {
  createPool,
  takeSlot,
  liveCount,
  peakLive,
  MOB_CAP,
  MOB_FIRE_CAP,
  CORPSE_CAP,
  TREASURE_ALLOWANCE,
  SKULL_CAP,
  WISP_CAP,
};
export type { PoolSlot };
