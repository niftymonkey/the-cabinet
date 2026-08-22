/**
 * The entity cap policy (tracer plan section 3). The caps are identical on
 * every device and are never lowered for a phone's frame budget: a
 * device-varying cap makes the same seed a different game and spends exactly
 * what ADR 0015 paid for.
 *
 * At the cap something must be dropped, and which one is a gameplay rule rather
 * than a housekeeping detail. That is why the policy lives in src/game and not
 * in invariants.ts: checking a cap is not enforcing one, and a policy in
 * src/dev would make the test rig load-bearing in the shipped game.
 *
 * The policy differs by pool, deliberately.
 *
 * Mobs and mob fire refuse the spawn. Nothing already on the field is ever
 * removed, because a shot the player has read and started dodging cannot
 * vanish: that teaches the player that dodging is optional, and it is the kind
 * of lie that is invisible in a test and infuriating in a hand.
 *
 * Corpses take the oldest live corpse under and give the new corpse its slot.
 * The freshest corpse is the one worth diving for and the oldest is nearly
 * worthless by ADR 0004's own curve, so dropping the oldest costs the player
 * the least. Refusing the spawn instead would silently punish the best play,
 * which is killing a lot at once.
 *
 * Both orderings are by id, so both are deterministic and unit-testable.
 */

/**
 * The caps are a safety net and not a tuning knob. The densest authored moment
 * puts 47 mobs alive at once, so they are far enough above the content that
 * hitting one means something has gone wrong, and near enough that a runaway
 * spawn cannot allocate without bound. The tuning dispatch owns them if the
 * storm changes the arithmetic.
 */
export const MOB_CAP = 160;
export const MOB_FIRE_CAP = 400;
export const CORPSE_CAP = 200;

/**
 * What every pooled entity carries. The id only ever increases and is not
 * cosmetic: the cap policy has to be totally ordered to be deterministic, and a
 * test that says "this corpse, not that one" needs a handle that a recycled
 * slot index cannot give it.
 */
export interface PoolSlot {
  alive: boolean;
  id: number;
}

/**
 * A pool at full capacity, every slot dead. Pools are pre-allocated at
 * createRun and mutated in place, so a spawn never allocates.
 */
export function createPool<T extends PoolSlot>(
  capacity: number,
  make: () => T,
): T[] {
  const pool: T[] = [];
  for (let index = 0; index < capacity; index++) pool.push(make());
  return pool;
}

/**
 * The first dead slot, claimed and stamped with the id, or null when the pool
 * is full. This is the refusal policy: mobs and mob fire take a null answer and
 * do not spawn.
 */
export function takeSlot<T extends PoolSlot>(pool: T[], id: number): T | null {
  for (const slot of pool) {
    if (slot.alive) continue;
    slot.alive = true;
    slot.id = id;
    return slot;
  }
  return null;
}

/**
 * The live slot with the lowest id, which is the oldest thing in the pool, or
 * null when nothing is live. This is the ordering the corpse policy evicts by,
 * and it is by id rather than by slot index because a recycled slot holds a
 * newer entity than one further along the array.
 */
export function oldestLive<T extends PoolSlot>(pool: readonly T[]): T | null {
  let oldest: T | null = null;
  for (const slot of pool) {
    if (!slot.alive) continue;
    if (oldest === null || slot.id < oldest.id) oldest = slot;
  }
  return oldest;
}

/** How many slots of a pool are live. */
export function liveCount(pool: readonly PoolSlot[]): number {
  return pool.reduce((count, slot) => count + (slot.alive ? 1 : 0), 0);
}
