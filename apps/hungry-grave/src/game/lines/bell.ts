/**
 * The bell: the funeral toll, always on from level 1, on its own clock and never
 * fired by a swallow (ADR 0005). Level 0 at the start of a run.
 *
 * The ring's damage resolves here rather than in the storm's overlap pass,
 * because it is a consequence of the ring expanding rather than of two boxes
 * overlapping, and folding it into an overlap pass would mean giving the ring a
 * hitbox it does not have.
 */

import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { normalize } from '../math';
import type { Mob } from '../mobs';
import { damageMob, SPAWN_MARGIN } from '../mobs';
import type { RunState } from '../run';

interface BellRing {
  readonly level: number;
  ticks: number;
  /**
   * The mobs this ring has already struck, by entity id.
   *
   * A radius-crossing test alone does not hold "damaged once by one ring" as
   * soon as the ring pushes: the push carries a mob back outside the edge that
   * has just passed it, and the edge then catches it again, so a level-5 toll
   * strikes a mob at eighty percent of its radius six times for 5.03 damage
   * where the rule asks for one strike and 1.00.
   *
   * Keyed by entity id and never by slot, so this carries none of the recycled
   * slot hazard a per-mob cooldown field would: ids only ever increase, a
   * recycled slot arrives with a new one, and the set dies with the ring.
   */
  readonly struck: Set<number>;
}

// Ticks between tolls: three seconds, a rhythm to position against.
const BELL_PERIOD = 180;

/**
 * How long a ring takes to reach its full radius. It finishes well inside its
 * own period, so the player never sees two rings at once and one live ring at a
 * time is an invariant rather than an assumption.
 */
const BELL_EXPAND_TICKS = 45;

/**
 * How far each level's ring reaches, indexed by level. Level 5 reaches 250
 * units, nearly across the field's 540-unit width from a centred grave. Level
 * 1's 80 units is three and a half shambler bodies out from the grave's centre,
 * which is the range at which a mob is already close enough to be a contact
 * threat, so the first toll has something in it whenever the player is in any
 * danger at all.
 */
const BELL_RADIUS_BY_LEVEL: readonly number[] = [0, 80, 122, 165, 207, 250];

// Damage at the grave itself. Three is one shambler exactly, so a maxed bell kills trash outright only where the player is standing.
const BELL_DAMAGE_NEAR = 3;

// Damage at the ring's full radius. The far edge tickles, which is Mark's 2026-08-19 ruling recorded in ADR 0005.
const BELL_DAMAGE_FAR = 0.5;

/**
 * How hard each level's ring shoves, in field units, indexed by level. ADR 0005
 * makes push a higher-level property rather than a level-1 one, and this is the
 * ladder.
 */
const BELL_PUSH_BY_LEVEL: readonly number[] = [0, 0, 0, 0, 20, 40];

// How far the ring's leading edge stands from the grave, at this much of its life.
const ringRadius = (ring: BellRing): number => {
  return BELL_RADIUS_BY_LEVEL[ring.level] * (ring.ticks / BELL_EXPAND_TICKS);
};

/**
 * How much of the toll's power reaches this far out: one at the grave, nothing
 * at the ring's full radius.
 *
 * Damage and push share it deliberately, so the toll's power is concentrated
 * where the player is standing on both channels at once rather than falling off
 * two different ways.
 */
const proximity = (distance: number, full: number): number => {
  if (full <= 0) return 0;
  return Math.max(0, 1 - distance / full);
};

/**
 * Shoves a mob away from the grave, held inside the field widened by
 * SPAWN_MARGIN. Without the clamp a mob near an edge is pushed out of the box
 * the invariant harness checks, by the player's own weapon, and the harness
 * fires on a legal move.
 *
 * The force comes from the ring's own level, the level the radius and the sweep
 * are already working from, so a level-up mid-ring cannot shove harder than the
 * ring that is shoving reaches.
 */
const pushMob = (
  state: RunState,
  ring: BellRing,
  mob: Mob,
  distance: number,
  near: number,
): void => {
  const push = BELL_PUSH_BY_LEVEL[ring.level] * near;
  if (!Number.isFinite(push) || push <= 0 || distance === 0) return;
  const away = normalize(mob.x - state.grave.x, mob.y - state.grave.y);
  if (away.length === 0) return;
  mob.x = clamp(
    mob.x + away.x * push,
    -SPAWN_MARGIN,
    FIELD_WIDTH + SPAWN_MARGIN,
  );
  mob.y = clamp(
    mob.y + away.y * push,
    -SPAWN_MARGIN,
    FIELD_HEIGHT + SPAWN_MARGIN,
  );
};

const clamp = (value: number, low: number, high: number): number => {
  return Math.min(Math.max(value, low), high);
};

/**
 * Every mob the ring's leading edge reached this tick: inside the radius, and
 * not struck by this ring already.
 *
 * The ring only ever grows, so "inside the radius and not yet struck" is the
 * tick the edge crossed the mob and no other. Stated that way rather than as an
 * annulus, it also catches a mob standing exactly on the grave, which an
 * annulus opening at zero never crosses.
 */
const sweepRing = (
  state: RunState,
  ring: BellRing,
  now: number,
): SimEvent[] => {
  const events: SimEvent[] = [];
  const full = BELL_RADIUS_BY_LEVEL[ring.level];
  for (const mob of state.mobs) {
    if (!mob.alive || ring.struck.has(mob.id)) continue;
    const dx = mob.x - state.grave.x;
    const dy = mob.y - state.grave.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > now) continue;
    ring.struck.add(mob.id);
    const near = proximity(distance, full);
    const damage =
      BELL_DAMAGE_FAR + (BELL_DAMAGE_NEAR - BELL_DAMAGE_FAR) * near;
    pushMob(state, ring, mob, distance, near);
    events.push(...damageMob(state, mob, damage, 'bell'));
  }
  return events;
};

// The live ring, one tick wider, and gone once it has reached its full radius.
const expandRing = (state: RunState): SimEvent[] => {
  const ring = state.lines.ring;
  if (ring === null) return [];
  ring.ticks += 1;
  const events = sweepRing(state, ring, ringRadius(ring));
  if (ring.ticks >= BELL_EXPAND_TICKS) state.lines.ring = null;
  return events;
};

/**
 * The toll's clock. It runs whatever the level is and re-arms either way, so an
 * owned bell's first toll lands within one period of the drop rather than
 * waiting on a clock that only started then.
 */
const tollClock = (state: RunState): SimEvent[] => {
  const lines = state.lines;
  lines.tollIn -= 1;
  if (lines.tollIn > 0) return [];
  lines.tollIn += BELL_PERIOD;
  const level = state.levels.bell;
  if (level === 0) return [];
  lines.ring = { level, ticks: 0, struck: new Set() };
  return [{ type: 'tolled', level, radius: BELL_RADIUS_BY_LEVEL[level] }];
};

/**
 * The toll's clock, the live ring's expansion, and the damage its leading edge
 * deals as it crosses a mob.
 *
 * The ring expands before a new toll is armed, so a ring born this tick stands
 * at nothing until the next one, the same rule that puts a skull at the mouth
 * for one tick.
 */
const advanceBell = (state: RunState): SimEvent[] => {
  const events = expandRing(state);
  events.push(...tollClock(state));
  return events;
};

export {
  ringRadius,
  advanceBell,
  BELL_PERIOD,
  BELL_EXPAND_TICKS,
  BELL_RADIUS_BY_LEVEL,
  BELL_DAMAGE_NEAR,
  BELL_DAMAGE_FAR,
  BELL_PUSH_BY_LEVEL,
};
export type { BellRing };
