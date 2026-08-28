// Territory: autonomous controlling ground, claimed on the line's own clock
// where mobs stand thickest ahead of the grave (ADR 0044).

import { createPool, takeSlot, TERRITORY_CAP } from '../caps';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { normalize } from '../math';
import type { Mob } from '../mobs';
import { damageMob, mobHitbox, SPAWN_MARGIN } from '../mobs';
import { circleOverlapsBox } from '../overlap';
import type { RunState } from '../run';
import { SCROLL_SPEED } from '../tuning';
import { MAX_LEVEL } from './roster';

/**
 * Ticks between lays: five seconds. PROVISIONAL, and the first number to move
 * under measurement.
 *
 * The swallow trigger measured a lay every 0.78 seconds and was grossly
 * overpowered; this is 6.4 times sparser. It sits above the bell's 180 because
 * one patch does far more work than one toll.
 */
const TERRITORY_PERIOD = 300;

/**
 * The lateral half-window about the grave's own x the scan may see, in field
 * units: one third of the field. PROVISIONAL, and the second number to move
 * under measurement, after the period.
 *
 * Wide enough to catch a flank knot, narrow enough that where the grave goes
 * chooses what the line can see: too wide and density, not positioning, picks
 * the lay. It is deliberately not the upfieldTraffic instrument's 54-unit
 * LATERAL_REACH, which must stay independent of the thing it measures.
 */
const TERRITORY_REACH = 180;

/**
 * The radius a lay claims at each level, in field units. PROVISIONAL.
 *
 * Levels buy area and only area: area times 1.5 per level, so radius times
 * sqrt(1.5), from level 1 at today's 48. Because the pull outruns every
 * faller, any rung kills what it catches; the ladder prices the catch, not
 * the kill. Level 0 lays nothing, the bell's silent-at-0 pattern.
 */
const RADIUS_BY_LEVEL: readonly number[] = [0, 48, 59, 72, 88, 108];

/**
 * How long the ground takes to open, in ticks. PROVISIONAL.
 *
 * The beat is what keeps Territory from collapsing into a placed detonation
 * when the scan picks a dense knot, and it runs in world time: it ticks down
 * while the patch is still above the visible field, because visibility is
 * never an activation condition.
 */
const TERRITORY_OPENING_TICKS = 24;

/**
 * How far ahead the scan projects each mob, in ticks. The lead is not a guess:
 * the patch cannot bite until the hands come up, so the scan asks where each
 * mob will stand exactly then. Because a laid patch rides the scroll, the
 * scroll term cancels and the projection is by the mob's own velocity alone.
 */
const TERRITORY_LEAD_TICKS = TERRITORY_OPENING_TICKS;

/**
 * What one dwell pulse takes off a mob. PROVISIONAL.
 *
 * The ruled contract is shambler-denominated against the pass A health scale:
 * a shambler's 40 is 8 pulses exactly; the ghoul rounds up to 5 pulses and
 * the revenant to 13.
 */
const TERRITORY_DAMAGE = 5;

/**
 * Ticks a mob is held ineligible after a pulse: half a second. PROVISIONAL.
 *
 * The genre expresses ground zones as full damage on a per-enemy delay
 * clustered at 500ms and 1000ms. The ruled range was 6 to 10 pulses to kill
 * trash; 8 chosen, so a shambler dies in 210 ticks of dwell.
 */
const TERRITORY_REHIT_TICKS = 30;

/**
 * How far a held mob is drawn toward the patch centre per tick, in field
 * units. PROVISIONAL.
 *
 * It undoes a worst-case level-5 toll shove in 80 ticks, and it is above every
 * faller's own speed (shambler 0.32, revenant 0.22 per tick), so a caught
 * faller cannot leave; only a ghoul can pull free.
 */
const TERRITORY_PULL = 0.5;

/**
 * The fraction of a mob's own motion undone while over open ground.
 * PROVISIONAL.
 *
 * The ghoul is what this exists for: its natural crossing gives about 61
 * ticks of dwell against the 120 its 5 pulses need, and halving its pace is
 * what puts it over the line.
 */
const TERRITORY_SLOW = 0.5;

/**
 * One patch of claimed ground.
 *
 * It is a finished gameplay object at birth: the radius its level bought is
 * captured when it is created and never changes, so a level-up mid-run
 * reaches only patches laid after it. That is bell.ts's own precedent, where
 * a live ring keeps the level it was born with.
 */
interface Patch {
  alive: boolean;
  id: number;
  x: number;
  y: number;
  // Field units, captured from the level's ladder at birth.
  radius: number;
  // Ticks of the opening beat left. Zero means the hands are up.
  opening: number;
  // Dwell pulses this patch has landed over its whole life.
  pulses: number;
  /**
   * When each held mob may be pulsed again: next-eligible tick by entity id.
   *
   * Keyed by id and never by slot, on bell.ts's `BellRing.struck` precedent,
   * so it carries none of the recycled-slot hazard a per-mob cooldown field
   * would: ids only ever increase, a recycled slot arrives with a new one, and
   * the map dies with the patch. Expired entries are pruned each resolve, so
   * the map is bounded at mobs seen inside the last window.
   */
  readonly struck: Map<number, number>;
}

const blankPatch = (): Patch => {
  return {
    alive: false,
    id: 0,
    x: 0,
    y: 0,
    radius: 0,
    opening: 0,
    pulses: 0,
    struck: new Map(),
  };
};

const createTerritoryPool = (): Patch[] => {
  return createPool(TERRITORY_CAP, blankPatch);
};

// Why a patch left the field, kept apart so a reading can tell the two ends of one apart.
type PatchClosing = 'scrolled' | 'evicted';

/**
 * Closes a patch and says how it ended. The pulse count rides along because
 * "scrolled off having touched nothing at all" is the read Territory exists to
 * answer and it is invisible from the reason alone.
 */
const closePatch = (patch: Patch, reason: PatchClosing): SimEvent => {
  patch.alive = false;
  return {
    type: 'patchClosed',
    reason,
    x: patch.x,
    y: patch.y,
    pulses: patch.pulses,
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
 * claim is worth more than the one it displaces.
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
 * How full the charge is, 0 to 1, and 0 at level 0. The renderer's one read
 * of the clock.
 */
const territoryCharge = (state: RunState): number => {
  if (state.levels.territory <= 0) return 0;
  return (TERRITORY_PERIOD - state.lines.layIn) / TERRITORY_PERIOD;
};

// A mob's projected standing point when the hands come up, by its own velocity alone.
interface KnotPoint {
  readonly x: number;
  readonly y: number;
}

/**
 * Every eligible standing point, in mob slot order: alive, projected strictly
 * ahead of the grave, projected at or below the visible top edge, and within
 * the lateral reach of the grave's own x.
 *
 * The top bound is load-bearing: attrition runs bottom-up, so an unbounded
 * scan would systematically pick intact fresh spawns above the screen, the
 * fire beat would be invisible at the one moment that teaches an autonomous
 * weapon, and top-of-field kills starve the freshness loop the way ADR 0036
 * records for the maxed bell.
 */
const eligiblePoints = (state: RunState): KnotPoint[] => {
  const points: KnotPoint[] = [];
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    const x = mob.x + mob.vx * TERRITORY_LEAD_TICKS;
    const y = mob.y + mob.vy * TERRITORY_LEAD_TICKS;
    if (y >= state.grave.y || y < 0) continue;
    if (Math.abs(x - state.grave.x) > TERRITORY_REACH) continue;
    points.push({ x, y });
  }
  return points;
};

/**
 * The densest knot of eligible points: the anchor whose level-radius circle
 * covers the most of them, itself included.
 *
 * Deterministic by construction: no randomness drawn, one walk in slot order,
 * squared distances, and a strictly-greater test against the incumbent so the
 * first anchor in slot order wins ties.
 */
const densestKnot = (
  points: readonly KnotPoint[],
  radius: number,
): { point: KnotPoint; count: number } | null => {
  const reach = radius * radius;
  let best: KnotPoint | null = null;
  let bestCount = 0;
  for (const anchor of points) {
    let count = 0;
    for (const other of points) {
      const dx = other.x - anchor.x;
      const dy = other.y - anchor.y;
      if (dx * dx + dy * dy <= reach) count += 1;
    }
    if (count > bestCount) {
      best = anchor;
      bestCount = count;
    }
  }
  if (best === null) return null;
  return { point: best, count: bestCount };
};

const clamp = (value: number, low: number, high: number): number => {
  return Math.min(Math.max(value, low), high);
};

/**
 * One lay at the winning knot. The x is clamped to the field so claimed
 * ground is never laid where it cannot be stood on; the y is never clamped,
 * because up-field is legal and off-field is not inactive.
 */
const layPatch = (
  state: RunState,
  point: KnotPoint,
  mobsUnder: number,
  events: SimEvent[],
): void => {
  const patch = claimSlot(state, events);
  patch.x = clamp(point.x, 0, FIELD_WIDTH);
  patch.y = point.y;
  patch.radius = RADIUS_BY_LEVEL[Math.min(state.levels.territory, MAX_LEVEL)];
  patch.opening = TERRITORY_OPENING_TICKS;
  patch.pulses = 0;
  patch.struck.clear();
  events.push({
    type: 'patchLaid',
    x: patch.x,
    y: patch.y,
    radius: patch.radius,
    mobsUnder,
  });
};

/**
 * The line's own clock, the bell's ADR 0036 move: at level 0 it does not run,
 * and a full charge with nothing eligible holds full and rescans every tick,
 * so the ground is claimed the moment something stands where it can be.
 */
const runTheClock = (state: RunState, events: SimEvent[]): void => {
  if (state.levels.territory <= 0) return;
  const lines = state.lines;
  if (lines.layIn > 0) lines.layIn -= 1;
  if (lines.layIn > 0) return;
  const points = eligiblePoints(state);
  const radius = RADIUS_BY_LEVEL[Math.min(state.levels.territory, MAX_LEVEL)];
  const knot = densestKnot(points, radius);
  if (knot === null) return;
  layPatch(state, knot.point, knot.count, events);
  lines.layIn = TERRITORY_PERIOD;
};

/**
 * Whether a mob's body is over this patch's hands.
 *
 * The mob's body and never its centre point: the visible patch is the ground
 * it claims, so a mob visibly standing in the hands must not be immune because
 * its centre sits a unit outside the radius. This is why the bell's
 * centre-point distance test is not reused here.
 */
const mobIsOverPatch = (patch: Patch, mob: Mob): boolean => {
  return circleOverlapsBox(
    { x: patch.x, y: patch.y, radius: patch.radius },
    mobHitbox(mob),
  );
};

/**
 * One mob held by open ground: one displacement, slow and pull combined,
 * written with the pushMob discipline (finite-check, zero-length guard, clamp
 * to the box the invariant harness checks).
 *
 * The slow touches position only, undoing half the motion moveMob just
 * applied: mobs.ts learns nothing of Territory. The pull is clamped to the
 * remaining distance so a mob near the centre settles instead of oscillating
 * across it, and a mob at the exact centre has no direction to pull along.
 */
const holdMob = (patch: Patch, mob: Mob): void => {
  const toCentre = normalize(patch.x - mob.x, patch.y - mob.y);
  const pull = Math.min(TERRITORY_PULL, toCentre.length);
  const dx = -TERRITORY_SLOW * mob.vx + toCentre.x * pull;
  const dy = -TERRITORY_SLOW * mob.vy + toCentre.y * pull;
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
  mob.x = clamp(mob.x + dx, -SPAWN_MARGIN, FIELD_WIDTH + SPAWN_MARGIN);
  mob.y = clamp(mob.y + dy, -SPAWN_MARGIN, FIELD_HEIGHT + SPAWN_MARGIN);
};

/**
 * The control: every live mob whose body is over open ground is held, per
 * patch in slot order, mobs in slot order. A mob over two overlapping patches
 * is displaced by each: overlapping claimed ground holds harder, accepted and
 * stated in the plan. Arriving mobs are held too, on the bell's precedent of
 * a toll shoving arriving mobs.
 */
const controlMobs = (state: RunState): void => {
  for (const patch of state.patches) {
    if (!patch.alive || patch.opening > 0) continue;
    for (const mob of state.mobs) {
      if (!mob.alive || !mobIsOverPatch(patch, mob)) continue;
      holdMob(patch, mob);
    }
  }
};

/**
 * Every live patch, one tick of the world on: it drifts down with the field,
 * its opening beat runs down wherever it is, open ground holds what stands on
 * it, and the clock claims new ground when it fills.
 *
 * The drift is the same SCROLL_SPEED step.ts gives mobs and corpses, so a
 * patch shares the food layer's motion exactly and a mob closes on it at only
 * its own speed. Control runs after the drift, so the mob is held against the
 * centre where it now stands; the lay runs last, so ground laid this tick
 * neither drifts nor holds until the next.
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
    // Gone once the whole patch is past the bottom edge. There is no timer:
    // the world scroll owns this.
    if (patch.y - patch.radius > FIELD_HEIGHT) {
      events.push(closePatch(patch, 'scrolled'));
    }
  }
  controlMobs(state);
  runTheClock(state, events);
  return events;
};

/**
 * One patch's dwell pulses this tick: prune every expired map entry, then
 * pulse each overlapping mob with no live entry, in slot order.
 *
 * An entry is expired once its tick is reached, so the cadence is exactly one
 * pulse per window: a mob first pulsed at tick T is pulsed again at T plus
 * the window, and 8 windows take a shambler start to death in 210 ticks.
 */
const pulseWithPatch = (state: RunState, patch: Patch): SimEvent[] => {
  for (const [id, eligibleAt] of patch.struck) {
    if (eligibleAt <= state.tick) patch.struck.delete(id);
  }
  const events: SimEvent[] = [];
  for (const mob of state.mobs) {
    if (!mob.alive || patch.struck.has(mob.id)) continue;
    if (!mobIsOverPatch(patch, mob)) continue;
    patch.struck.set(mob.id, state.tick + TERRITORY_REHIT_TICKS);
    patch.pulses += 1;
    events.push(...damageMob(state, mob, TERRITORY_DAMAGE, 'territory'));
  }
  return events;
};

/**
 * Territory meeting the mobs. A patch still opening cannot damage anything,
 * wherever it is, and a patch has no budget: it grinds whatever stays until
 * the world carries it off.
 */
const resolveTerritory = (state: RunState): SimEvent[] => {
  const events: SimEvent[] = [];
  for (const patch of state.patches) {
    if (!patch.alive || patch.opening > 0) continue;
    events.push(...pulseWithPatch(state, patch));
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
  advanceTerritory,
  resolveTerritory,
  territoryCount,
  patchAt,
  territoryCharge,
  RADIUS_BY_LEVEL,
  TERRITORY_OPENING_TICKS,
  TERRITORY_DAMAGE,
  TERRITORY_REHIT_TICKS,
  TERRITORY_PERIOD,
};
export type { Patch, PatchClosing };
