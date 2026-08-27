// Territory: ground the grave claims ahead of itself, torn open by every
// swallow and closed once its hands have taken their fill (ADR 0005).

import { createPool, takeSlot, TERRITORY_CAP } from '../caps';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT } from '../field';
import type { Mob } from '../mobs';
import { damageMob, mobHitbox } from '../mobs';
import { circleOverlapsBox } from '../overlap';
import type { RunState } from '../run';
import { FRESHNESS_PAYOUT_FLOOR, SCROLL_SPEED } from '../tuning';
import { MAX_LEVEL } from './roster';

/**
 * How far straight up-field of the grave a swallow tears the ground open, in
 * field units. The player's position at swallow time is the whole placement
 * input: no aim axis, and no reading of the mob list.
 *
 * PROVISIONAL, and the harness puts no ceiling on it. A patch's positional
 * bounds are structural and neither reads this number: sideways it is held to
 * the field widened by SPAWN_MARGIN, downward to the close rule below, which
 * ends a patch once its whole body clears the bottom edge. Up-field is
 * deliberately unbounded in position, so this is free to move on what the game
 * wants rather than on what the harness will tolerate.
 */
const TERRITORY_OFFSET = 456;

/**
 * The radius a fully fresh swallow claims, in field units. PROVISIONAL.
 *
 * A shambler's body is 22 units across, so a full patch is a little over four
 * bodies wide and reads as ground rather than as a mark.
 */
const TERRITORY_FULL_RADIUS = 48;

/**
 * How many distinct mobs a patch may grab before it is spent, indexed by level.
 * PROVISIONAL, and level 1 is deliberately not one: a patch that closes on its
 * first crossing never reads as claimed ground.
 *
 * Level 0 is zero, so an unowned line lays nothing at all, the way a level-0
 * bell is silent and a level-0 volley launches no wisps.
 */
const BITES_BY_LEVEL: readonly number[] = [0, 2, 3, 4, 6, 8];

/**
 * How long the ground takes to open, in ticks. PROVISIONAL.
 *
 * The beat is what keeps Territory from collapsing into a placed detonation
 * when a swallow happens under a dense group, and it runs in world time: it
 * ticks down while the patch is still above the visible field, because
 * visibility is never an activation condition.
 */
const TERRITORY_OPENING_TICKS = 24;

// What one grab takes off a mob. PROVISIONAL.
const TERRITORY_DAMAGE = 2;

/**
 * One patch of claimed ground.
 *
 * It is a finished gameplay object at birth: the radius its freshness bought
 * and the budget its level bought are captured when it is created and never
 * change, so a level-up mid-run reaches only patches laid after it. That is
 * bell.ts's own precedent, where a live ring keeps the level it was born with.
 */
interface Patch {
  alive: boolean;
  id: number;
  x: number;
  y: number;
  // Field units, derived from the freshness-scaled area at birth.
  radius: number;
  // Ticks of the opening beat left. Zero means the hands are up.
  opening: number;
  // Distinct mobs this patch may still grab.
  bites: number;
  /**
   * The mobs this patch has already grabbed, by entity id.
   *
   * Keyed by id and never by slot, on bell.ts's `BellRing.struck` precedent, so
   * it carries none of the recycled-slot hazard a per-mob cooldown field would:
   * ids only ever increase, a recycled slot arrives with a new one, and the set
   * dies with the patch. A patch is one bite per mob; a different patch may
   * still take the same mob.
   */
  readonly struck: Set<number>;
}

const blankPatch = (): Patch => {
  return {
    alive: false,
    id: 0,
    x: 0,
    y: 0,
    radius: 0,
    opening: 0,
    bites: 0,
    struck: new Set(),
  };
};

const createTerritoryPool = (): Patch[] => {
  return createPool(TERRITORY_CAP, blankPatch);
};

/**
 * How much ground a swallow at this freshness claims, as a share of a full
 * patch's area.
 *
 * Freshness scales the claimed area and the radius is derived from it, never
 * multiplied by freshness directly: at ADR 0004's 0.25 floor that is a quarter
 * of the area and therefore half the radius, which keeps stale food
 * meaningfully weaker without making its Territory payout nearly worthless.
 *
 * The floor is applied here rather than borrowed from swallow.ts, because
 * swallow.ts calls this module and an import back would close a cycle the
 * import fence refuses.
 */
const claimedAreaScale = (freshness: number): number => {
  return Math.max(freshness, FRESHNESS_PAYOUT_FLOOR);
};

const patchRadius = (freshness: number): number => {
  return TERRITORY_FULL_RADIUS * Math.sqrt(claimedAreaScale(freshness));
};

// How many distinct mobs a patch laid at this level may grab.
const biteBudget = (level: number): number => {
  if (level <= 0) return 0;
  return BITES_BY_LEVEL[Math.min(level, MAX_LEVEL)];
};

// Why a patch left the field, kept apart so a reading can tell the three ends of one apart.
type PatchClosing = 'spent' | 'scrolled' | 'evicted';

/**
 * Closes a patch and says how it ended. The bite count rides along because
 * "scrolled off having grabbed nothing at all" is the read Territory exists to
 * answer and it is invisible from the reason alone.
 */
const closePatch = (patch: Patch, reason: PatchClosing): SimEvent => {
  patch.alive = false;
  return {
    type: 'patchClosed',
    reason,
    x: patch.x,
    y: patch.y,
    bitten: patch.struck.size,
  };
};

/**
 * The oldest live patch, which is the one the cap takes.
 *
 * Oldest by id and never by slot: a recycled slot carries a new id, and the
 * eviction order has to be totally ordered to be deterministic.
 */
const oldestPatch = (pool: readonly Patch[]): Patch | null => {
  let oldest: Patch | null = null;
  for (const patch of pool) {
    if (!patch.alive) continue;
    if (oldest === null || patch.id < oldest.id) oldest = patch;
  }
  return oldest;
};

/**
 * Room for one more patch. The cap is housekeeping and never a refusal: old
 * trailing ground has stopped contributing by the time it is taken, so the new
 * claim is worth more than the one it displaces. A spent patch is already gone
 * and never holds a slot.
 */
const claimSlot = (state: RunState, events: SimEvent[]): Patch => {
  const free = takeSlot(state.patches, state.nextEntityId);
  if (free !== null) {
    state.nextEntityId += 1;
    return free;
  }
  // The pool is sized at the cap, so a full pool always has an oldest.
  const evicted = oldestPatch(state.patches)!;
  events.push(closePatch(evicted, 'evicted'));
  evicted.alive = true;
  evicted.id = state.nextEntityId;
  state.nextEntityId += 1;
  return evicted;
};

/**
 * One swallow's claim, torn open a fixed distance straight up-field of the
 * grave on the tick the food went in.
 *
 * It is called from swallow.ts and never from the tick loop, for the reason the
 * wisps' volley already is: a tick of lag would read as the ground opening
 * after the dive rather than out of it. It runs after payLevel, so a Territory
 * drop lays that same swallow's patch at the new level.
 *
 * If the offset puts the patch above the visible field it still spawns at that
 * world position and scrolls in. It is never clamped and never suppressed, and
 * it simulates there under the same rules: off-field is not inactive.
 *
 * The events list is the swallow's own, so an eviction the claim caused is
 * reported in tick order rather than out of band, exactly as corpses.ts's own
 * cap policy reports one.
 */
const launchTerritory = (
  state: RunState,
  freshness: number,
  events: SimEvent[],
): void => {
  const bites = biteBudget(state.levels.territory);
  if (bites <= 0) return;
  const patch = claimSlot(state, events);
  patch.x = state.grave.x;
  patch.y = state.grave.y - TERRITORY_OFFSET;
  patch.radius = patchRadius(freshness);
  patch.opening = TERRITORY_OPENING_TICKS;
  patch.bites = bites;
  patch.struck.clear();
};

/**
 * Every live patch, one tick of the world on: it drifts down with the field and
 * its opening beat runs down, wherever it is.
 *
 * The drift is the same SCROLL_SPEED step.ts gives mobs and corpses, so a patch
 * shares the food layer's motion exactly and a mob closes on it at only its own
 * speed. Territory is the first player-owned thing in the world's frame; the
 * other three lines are all screen-frame.
 *
 * The damage is not here. A patch meeting a mob is an overlap, and storm.ts
 * owns the consequence of a mob being hit.
 */
const advanceTerritory = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  for (const patch of state.patches) {
    if (!patch.alive) continue;
    patch.y += SCROLL_SPEED;
    if (patch.opening > 0) patch.opening -= 1;
    // Gone once the whole patch is past the bottom edge, with whatever budget
    // it had left unspent. There is no timer: the world scroll owns this.
    if (patch.y - patch.radius > FIELD_HEIGHT) {
      events.push(closePatch(patch, 'scrolled'));
    }
  }
  return events;
};

/**
 * Whether a mob's body is over this patch's hands.
 *
 * The mob's body and never its centre point: the visible patch is the ground it
 * claims, so a mob visibly standing in the hands must not be immune because its
 * centre sits a unit outside the radius. This is why the bell's centre-point
 * distance test is not reused here.
 */
const mobIsOverPatch = (patch: Patch, mob: Mob): boolean => {
  return circleOverlapsBox(
    { x: patch.x, y: patch.y, radius: patch.radius },
    mobHitbox(mob),
  );
};

/**
 * One patch's grabs this tick: every mob over it that it has not taken already,
 * in slot order, until its budget runs out.
 *
 * A mob standing inside when the hands come up is eligible; Territory never
 * asks a mob to cross the boundary after activation. The struck set is what
 * holds one bite per patch per mob however long the mob stays.
 */
const grabWithPatch = (state: RunState, patch: Patch): SimEvent[] => {
  const events: SimEvent[] = [];
  for (const mob of state.mobs) {
    if (patch.bites <= 0) break;
    if (!mob.alive || patch.struck.has(mob.id)) continue;
    if (!mobIsOverPatch(patch, mob)) continue;
    patch.struck.add(mob.id);
    patch.bites -= 1;
    events.push(...damageMob(state, mob, TERRITORY_DAMAGE, 'territory'));
  }
  return events;
};

/**
 * Territory meeting the mobs. A patch that has spent its budget closes and goes
 * the same tick: no inert ground is left behind, and a spent patch never holds
 * one of the cap's slots.
 *
 * A patch still opening cannot damage anything, wherever it is.
 */
const resolveTerritory = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  for (const patch of state.patches) {
    if (!patch.alive || patch.opening > 0) continue;
    events.push(...grabWithPatch(state, patch));
    if (patch.bites <= 0) events.push(closePatch(patch, 'spent'));
  }
  return events;
};

/**
 * How many patches stand on the field right now. The sole truth for the count,
 * so a reader asks the line rather than reaching into the pool.
 */
const territoryCount = (state: RunState): number => {
  let live = 0;
  for (const patch of state.patches) if (patch.alive) live += 1;
  return live;
};

// One pool slot's patch, or null where the slot holds nothing. For the renderer.
const patchAt = (state: RunState, index: number): Patch | null => {
  const patch = state.patches[index];
  if (patch === undefined || !patch.alive) return null;
  return patch;
};

export {
  createTerritoryPool,
  launchTerritory,
  advanceTerritory,
  resolveTerritory,
  territoryCount,
  patchAt,
  patchRadius,
  biteBudget,
  BITES_BY_LEVEL,
  TERRITORY_OFFSET,
  TERRITORY_FULL_RADIUS,
  TERRITORY_OPENING_TICKS,
  TERRITORY_DAMAGE,
};
export type { Patch, PatchClosing };
