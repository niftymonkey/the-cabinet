// The entity cap policy (tracer plan section 3).

/**
 * At the cap something must be dropped, and which one is a gameplay rule rather
 * than a housekeeping detail. That is why the policy lives in src/game and not
 * in invariants.ts: checking a cap is not enforcing one, and a policy in
 * src/dev would make the test rig load-bearing in the shipped game.
 */

/**
 * The caps are a safety net and not a tuning knob. The densest authored moment
 * puts 51 mobs alive at once, at tick 11341, measured across three seeds in
 * docs/research/invariant-check-cost.md section 3a. They are far enough above
 * the content that hitting one means something has gone wrong, and near enough
 * that a runaway spawn cannot allocate without bound. The tuning dispatch owns
 * them if the storm changes the arithmetic.
 *
 * They are identical on every device and are never lowered for a phone's frame
 * budget: a device-varying cap makes the same seed a different game and spends
 * exactly what ADR 0015 paid for.
 */
const MOB_CAP = 160;
const MOB_FIRE_CAP = 400;
const CORPSE_CAP = 200;

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

/**
 * How many patches of claimed ground stand at once. PROVISIONAL.
 *
 * Alone among the pools here this one is a gameplay rule and not a safety net,
 * which is why it is small: at the cap the oldest patch is evicted rather than
 * the claim refused, so the number decides how long a trail of claimed ground
 * is rather than guarding against a runaway. A lay comes at most every
 * TERRITORY_PERIOD of 832 ticks, against a worst-case patch life of about
 * 1364 ticks: laid at the visible top edge, which is the highest a lay is ever
 * held to, and scrolled off the bottom at the biggest radius of 104, so 864
 * field units at SCROLL_SPEED 38/60. That is at most 1.6 live at once, and the
 * cap keeps about five times that, so housekeeping never binds in normal
 * play.
 *
 * The number itself does not move on this evidence: it is a rule about how
 * long a trail of claimed ground may be, not a headroom figure derived from
 * the cadence.
 */
const TERRITORY_CAP = 8;

export {
  createPool,
  takeSlot,
  liveCount,
  MOB_CAP,
  MOB_FIRE_CAP,
  CORPSE_CAP,
  SKULL_CAP,
  WISP_CAP,
  TERRITORY_CAP,
};
export type { PoolSlot };
