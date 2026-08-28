// Territory: autonomous controlling ground, claimed on the line's own clock
// where mobs stand thickest ahead of the grave (ADR 0044).

import { createPool, takeSlot, TERRITORY_CAP } from '../caps';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { cos, normalize, sin } from '../math';
import type { Mob } from '../mobs';
import { damageMob, mobHitbox, SPAWN_MARGIN } from '../mobs';
import { circleOverlapsBox } from '../overlap';
import type { RunState } from '../run';
import { SCROLL_SPEED } from '../tuning';
import { MAX_LEVEL } from './roster';

/**
 * Ticks between lays: a little over eight seconds. PROVISIONAL, and the first
 * number to move under measurement.
 *
 * The first playtest of the autonomous line called the cadence too frequent
 * and named roughly 60% of the rate as the first candidate, so 300 / 0.6 =
 * 500. It stays far above the bell's 180 because one patch does far more work
 * than one toll.
 */
const TERRITORY_PERIOD = 500;

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
 * Level 1 opens at 32 so a fresh patch reads as small; at the old 48 the first
 * rung already covered enough ground that the climb above it had nothing left
 * to say. Area times 1.8 per level from there, so radius times sqrt(1.8) =
 * 1.34164: 32, 42.9, 57.6, 77.3, 103.7, rounded. The old ladder grew area by
 * 1.5 and the steps did not read, and the ceiling is held near the old 108, so
 * only the shape of the climb moved. Level 0 lays nothing, the bell's
 * silent-at-0 pattern.
 */
const RADIUS_BY_LEVEL: readonly number[] = [0, 32, 43, 58, 77, 104];

/**
 * How long the ground takes to open, in ticks: a second and a half.
 * PROVISIONAL.
 *
 * The beat is what keeps Territory from collapsing into a placed detonation
 * when the scan picks a dense knot, and it runs in world time: it ticks down
 * while the patch is still above the visible field, because visibility is
 * never an activation condition.
 *
 * At 90 it buys two things at once. The beat is long enough for a mark to
 * cross to the ground and read as a delivery rather than a blink, and the lead
 * rises with it, so the scan projects a shambler 28.5 field units instead of
 * 7.6, which is close to a whole level-1 radius. That is the "the lead should
 * be larger" half of the playtest note.
 */
const TERRITORY_OPENING_TICKS = 90;

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
 * Ticks a mob is held ineligible after a pulse, at each level. PROVISIONAL.
 *
 * The pace of the pulses is the third channel of control strength, beside the
 * pull and the slow (ADR 0044, amended 2026-08-28). Every ruled touch count is
 * untouched by it: TERRITORY_DAMAGE stays 5, so a shambler is still 8 pulses,
 * a ghoul 5 and a revenant 13, and only the time the ground takes to deliver
 * them moves with the level.
 *
 * Measured pure dwell for a shambler entering at the centre of open ground,
 * damage off: 376 ticks at level 1, then 923, 937, 954 and 979, every rung
 * above the first capped by the ground's own remaining life rather than by the
 * crossing, because from level 2 the mob is held until the ground goes.
 * Against those the ladder gives, at a centre entry: level 1 five pulses and
 * 25 damage, so the mob walks out alive at 15 of 40; level 2 death after 434
 * ticks of dwell; level 3 after 336; level 4 after 266; and level 5 after 210,
 * which is exactly the old flat window's figure, so the top rung is pinned to
 * the derivation the genre reading already settled, full damage on a per-enemy
 * delay clustered at 500ms.
 *
 * Level 1 is the only rung an ordinary mob survives, and that is inherent
 * rather than a chosen cutoff. From level 2 the pull is close enough to a
 * shambler's own pace that it loiters, so dwell roughly doubles and no
 * survivable window exists that is also shorter than level 1's. The bands the
 * player reads are therefore level 1 as a speed bump, level 2 as where the
 * ground starts killing, and level 3 and up as pinned and ground down faster
 * each rung.
 */
const REHIT_BY_LEVEL: readonly number[] = [0, 80, 62, 48, 38, 30];

/**
 * How far a held mob is drawn toward the patch centre per tick at each level,
 * in field units. PROVISIONAL.
 *
 * Levels buy control strength as well as area, and this ladder is where the
 * early rungs stop being a death sentence. Own speeds per tick are shambler
 * 0.317, revenant 0.222 and ghoul 1.575, and a mob over open ground keeps
 * (1 - slow) of its own. Level 1: a shambler keeps 0.253 against a pull of
 * 0.08, so it leaves at 0.173 a tick while taking chip damage. Level 3 is the
 * turn, 0.190 against 0.22, held. Level 5 holds hard, 0.127 against 0.6. The
 * ghoul is the one type that pulls free at every rung, 0.63 against 0.6 even
 * at the top.
 */
const PULL_BY_LEVEL: readonly number[] = [0, 0.08, 0.13, 0.22, 0.36, 0.6];

/**
 * The fraction of a mob's own motion undone while over open ground, at each
 * level. PROVISIONAL.
 *
 * Early levels are mostly slow and chip, so the ladder opens at 0.2 rather
 * than the old flat 0.5 and reaches 0.6 at the top. The ghoul is what the top
 * of it exists for: its natural crossing gives about 61 ticks of dwell against
 * the 120 its 5 pulses need, and cutting its pace is what puts it over the
 * line.
 */
const SLOW_BY_LEVEL: readonly number[] = [0, 0.2, 0.3, 0.4, 0.5, 0.6];

/**
 * How far a lay may sit from the point the scan chose, as a fraction of the
 * patch's own radius. PROVISIONAL.
 *
 * Ground that arrives with the cluster already at its centre reads as mobs
 * spawning with the patch rather than as mobs being caught by it, so the lay
 * is displaced into the disc of this bound around the chosen point. The draw
 * is uniform over that disc, so the mean displacement is two thirds of the
 * bound, 0.37 of the radius. It is relative to the radius at every level on
 * purpose: ADR 0044 rules that higher levels must not converge on exact
 * placement.
 */
const TERRITORY_SPREAD = 0.55;

/**
 * One patch of claimed ground.
 *
 * It is a finished gameplay object at birth: the radius and the control
 * strength its level bought are captured when it is created and never change,
 * so a level-up mid-run reaches only patches laid after it. That is bell.ts's
 * own precedent, where a live ring keeps the level it was born with.
 */
interface Patch {
  alive: boolean;
  id: number;
  x: number;
  y: number;
  // Field units, captured from the level's ladder at birth.
  radius: number;
  // Field units per tick toward the centre, captured from the level's ladder at birth.
  pull: number;
  // The share of a mob's own motion undone, captured from the level's ladder at birth.
  slow: number;
  // Ticks between pulses on one mob, captured from the level's ladder at birth.
  rehit: number;
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
    pull: 0,
    slow: 0,
    rehit: 0,
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

// How far and which way one lay is displaced from the point the scan chose, in field units.
interface Spread {
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
 * One lay at the winning knot, displaced by the spread and then held inside
 * the window the scan itself may see.
 *
 * The x is clamped to the field so claimed ground is never laid where it
 * cannot be stood on. The y is clamped to the same window eligiblePoints
 * scans, the visible top edge down to the grave, and both ends of that are
 * load-bearing: the top one for the reason eligiblePoints states, and the
 * lower one because ADR 0044's boundary reading against ADR 0035 rests on the
 * scan being anchored ahead of the grave. A displacement that could break
 * either would reopen both, so it is bounded here rather than trusted.
 */
const layPatch = (
  state: RunState,
  point: KnotPoint,
  spread: Spread,
  mobsUnder: number,
  events: SimEvent[],
): void => {
  const level = Math.min(state.levels.territory, MAX_LEVEL);
  const patch = claimSlot(state, events);
  patch.x = clamp(point.x + spread.x, 0, FIELD_WIDTH);
  patch.y = clamp(point.y + spread.y, 0, state.grave.y);
  patch.radius = RADIUS_BY_LEVEL[level];
  patch.pull = PULL_BY_LEVEL[level];
  patch.slow = SLOW_BY_LEVEL[level];
  patch.rehit = REHIT_BY_LEVEL[level];
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
 * One lay's displacement: an angle and a distance, two draws from Territory's
 * own named stream and no more.
 *
 * The square root is what makes the point uniform over the disc rather than
 * crowded at its centre, and crowded at the centre is the very read the
 * displacement exists to break. Math.sqrt is exactly specified so it needs no
 * gate; the sine and cosine are approximated and go through math.ts, which is
 * ADR 0015 and not a preference.
 */
const spreadOffset = (state: RunState, radius: number): Spread => {
  const angle = state.streams.territory.next() * Math.PI * 2;
  const distance =
    Math.sqrt(state.streams.territory.next()) * TERRITORY_SPREAD * radius;
  return { x: cos(angle) * distance, y: sin(angle) * distance };
};

/**
 * The line's own clock, the bell's ADR 0036 move: at level 0 it does not run,
 * and a full charge with nothing eligible holds full and rescans every tick,
 * so the ground is claimed the moment something stands where it can be.
 *
 * The stream is touched only once a knot has been chosen. A scan that finds
 * nothing has to leave the cursor exactly where it was, or the ticks a full
 * charge spends waiting would shift every later draw in the run.
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
  const spread = spreadOffset(state, radius);
  layPatch(state, knot.point, spread, knot.count, events);
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
 * Both strengths are read off the patch and never off the run's levels, so a
 * patch controls at the strength it was born with for its whole life.
 *
 * The slow touches position only, undoing part of the motion moveMob just
 * applied: mobs.ts learns nothing of Territory. The pull is clamped to the
 * remaining distance so a mob near the centre settles instead of oscillating
 * across it, and a mob at the exact centre has no direction to pull along.
 */
const holdMob = (patch: Patch, mob: Mob): void => {
  const toCentre = normalize(patch.x - mob.x, patch.y - mob.y);
  const pull = Math.min(patch.pull, toCentre.length);
  const dx = -patch.slow * mob.vx + toCentre.x * pull;
  const dy = -patch.slow * mob.vy + toCentre.y * pull;
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
 * An entry is expired once its tick is reached, so the pace is exactly one
 * pulse per window: a mob first pulsed at tick T is pulsed again at T plus the
 * window. The window is the patch's own, captured at birth like its pull and
 * its slow, so a patch grinds at the pace its level bought for its whole life.
 */
const pulseWithPatch = (state: RunState, patch: Patch): SimEvent[] => {
  for (const [id, eligibleAt] of patch.struck) {
    if (eligibleAt <= state.tick) patch.struck.delete(id);
  }
  const events: SimEvent[] = [];
  for (const mob of state.mobs) {
    if (!mob.alive || patch.struck.has(mob.id)) continue;
    if (!mobIsOverPatch(patch, mob)) continue;
    patch.struck.set(mob.id, state.tick + patch.rehit);
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
  PULL_BY_LEVEL,
  SLOW_BY_LEVEL,
  REHIT_BY_LEVEL,
  TERRITORY_SPREAD,
  TERRITORY_OPENING_TICKS,
  TERRITORY_DAMAGE,
  TERRITORY_PERIOD,
};
export type { Patch, PatchClosing };
