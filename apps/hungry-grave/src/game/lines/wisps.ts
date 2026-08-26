/**
 * The wisps: the run's only homing line, fired on each swallow and never
 * always-on (ADR 0005). Level 0 at the start of a run, so it arrives only
 * through a drop, and homing is therefore always bought with a dive.
 *
 * This module may import only types from mobs.ts. Targeting reads a mob's
 * position and health off the Mob type and needs nothing at runtime, and an
 * import type is erased, so the import cannot become a cycle once mobs.ts holds
 * the overlap pass that reads this pool. A single value import would break that
 * silently at build time.
 */

import { createPool, takeSlot, WISP_CAP } from '../caps';
import { TICK_HZ } from '../clock';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { cos, normalize, rotateToward, sin } from '../math';
import type { Mob } from '../mobs';
import type { RunState } from '../run';

export interface Wisp {
  alive: boolean;
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Ticks of flight left. A wisp that finds nothing expires rather than persisting (ADR 0005). */
  life: number;
  /** The id of the mob this wisp is flying at, or null when the field is empty. */
  targetId: number | null;
}

/**
 * How many wisps each swallow launches, indexed by level. The concept doc's
 * endpoints are one lazy wisp and a converging flight of seven or eight, and the
 * one-swallow ordnance bound is computed against a volley of eight, so level 5
 * is eight and the design and the arithmetic agree.
 */
export const WISPS_BY_LEVEL: readonly number[] = [0, 1, 2, 4, 6, 8];

/**
 * Field units per tick, against a 90-tick life: 450 units of travel, more than
 * half the field's height, so a wisp launched at the grave can reach a mid-field
 * target and expire honestly if it finds nothing.
 */
export const WISP_SPEED = 300 / TICK_HZ;

export const WISP_LIFETIME = 90;

/**
 * A full reversal takes one second, which is generous enough that the run's
 * homing line actually hits and slow enough that a wisp visibly curves rather
 * than snapping. "Lazy" is a look and this is where it comes from.
 */
export const WISP_TURN_DEGREES_PER_SECOND = 180;

export const WISP_HALF_EXTENT = 4;
export const WISP_DAMAGE = 1;

function blankWisp(): Wisp {
  return {
    alive: false,
    id: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    targetId: null,
  };
}

export function createWispPool(): Wisp[] {
  return createPool(WISP_CAP, blankWisp);
}

const TURN_RADIANS = (WISP_TURN_DEGREES_PER_SECOND * Math.PI) / 180 / TICK_HZ;

// Computed once at module load, through math.ts, and held beside this line's own
// turn rate rather than travelling with the shared rotateToward.
const TURN_COS = cos(TURN_RADIANS);
const TURN_SIN = sin(TURN_RADIANS);

/** The live mob a wisp is flying at, or null once that mob is gone. */
function targetOf(state: RunState, wisp: Wisp): Mob | null {
  if (wisp.targetId === null) return null;
  for (const mob of state.mobs) {
    if (mob.alive && mob.id === wisp.targetId) return mob;
  }
  return null;
}

/** How many live wisps are already flying at this mob. */
function committedTo(state: RunState, mobId: number): number {
  let committed = 0;
  for (const wisp of state.wisps) {
    if (wisp.alive && wisp.targetId === mobId) committed += 1;
  }
  return committed;
}

/** The squared distance from a point to a mob, which orders targets without a square root. */
function distanceTo(mob: Mob, x: number, y: number): number {
  const dx = mob.x - x;
  const dy = mob.y - y;
  return dx * dx + dy * dy;
}

/**
 * The nearest live mob, optionally only those with room for one more wisp.
 *
 * Room is what makes the ordnance bound a fact rather than an intention: a
 * volley whose damage spreads kills exactly as many bodies as the bound is
 * checked against, where a volley that piled onto the nearest mob would
 * overkill one body and stop being meaningful ordnance.
 */
function nearestMob(
  state: RunState,
  x: number,
  y: number,
  withRoom: boolean,
): Mob | null {
  let nearest: Mob | null = null;
  let best = Infinity;
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    if (withRoom && committedTo(state, mob.id) * WISP_DAMAGE >= mob.hp) {
      continue;
    }
    const distance = distanceTo(mob, x, y);
    if (distance >= best) continue;
    best = distance;
    nearest = mob;
  }
  return nearest;
}

/** Points a wisp at a mob, or straight up when the field holds nothing to hunt. */
function aim(wisp: Wisp, target: Mob | null): void {
  wisp.targetId = target === null ? null : target.id;
  const heading =
    target === null
      ? { x: 0, y: -1, length: 1 }
      : normalize(target.x - wisp.x, target.y - wisp.y);
  const direction = heading.length === 0 ? { x: 0, y: -1 } : heading;
  wisp.vx = direction.x * WISP_SPEED;
  wisp.vy = direction.y * WISP_SPEED;
}

/**
 * One swallow's volley, launched from the grave's mouth on the tick the food
 * went in. It is called from swallow.ts and never from the tick loop: a tick of
 * lag would read as the burst arriving after the dive rather than out of it.
 *
 * Wisps are walked in slot order and each takes the nearest live mob with room
 * for it. Surplus wisps over-commit onto the last target assigned, which costs
 * the bound nothing because a dead mob does not die twice, and which looks like
 * the converging flight the concept doc promises.
 */
export function launchWisps(
  state: RunState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- the swallow's own event list, so a volley that ever reports does it in tick order rather than out of band
  _events: SimEvent[],
): void {
  const count = WISPS_BY_LEVEL[state.levels.wisps];
  const x = state.grave.x;
  const y = state.grave.y - state.grave.size;
  let last: Mob | null = null;
  for (let launched = 0; launched < count; launched++) {
    const wisp = takeSlot(state.wisps, state.nextEntityId);
    if (wisp === null) return;
    state.nextEntityId += 1;
    wisp.x = x;
    wisp.y = y;
    wisp.life = WISP_LIFETIME;
    const target: Mob | null = nearestMob(state, x, y, true) ?? last;
    aim(wisp, target);
    if (target !== null) last = target;
  }
}

/** A wisp fully outside the field on any side is gone. */
function cullWisps(state: RunState): void {
  for (const wisp of state.wisps) {
    if (!wisp.alive) continue;
    const outside =
      wisp.x + WISP_HALF_EXTENT < 0 ||
      wisp.x - WISP_HALF_EXTENT > FIELD_WIDTH ||
      wisp.y + WISP_HALF_EXTENT < 0 ||
      wisp.y - WISP_HALF_EXTENT > FIELD_HEIGHT;
    if (outside) wisp.alive = false;
  }
}

/**
 * One wisp's turn and flight.
 *
 * The heading is renormalized every tick rather than the velocity being rotated
 * in place, exactly as a ghoul's chase already does it: rotating in place would
 * compound f32 rounding of the turn's cosine and sine over a 90-tick life and
 * let the speed drift, and the speed is what the lifetime is derived against.
 */
function flyWisp(state: RunState, wisp: Wisp): void {
  let target: Mob | null = targetOf(state, wisp);
  if (target === null && wisp.targetId !== null) {
    target =
      nearestMob(state, wisp.x, wisp.y, true) ??
      nearestMob(state, wisp.x, wisp.y, false);
    aim(wisp, target);
  }
  if (target !== null) {
    const heading = normalize(wisp.vx, wisp.vy);
    const toward = normalize(target.x - wisp.x, target.y - wisp.y);
    if (heading.length > 0 && toward.length > 0) {
      const turned = rotateToward(heading, toward, TURN_COS, TURN_SIN);
      wisp.vx = turned.x * WISP_SPEED;
      wisp.vy = turned.y * WISP_SPEED;
    }
  }
  wisp.x += wisp.vx;
  wisp.y += wisp.vy;
}

/** Every live wisp's turn, flight and expiry, one tick on. */
export function advanceWisps(state: RunState): SimEvent[] {
  for (const wisp of state.wisps) {
    if (!wisp.alive) continue;
    wisp.life -= 1;
    if (wisp.life <= 0) {
      wisp.alive = false;
      continue;
    }
    flyWisp(state, wisp);
  }
  cullWisps(state);
  return [];
}
