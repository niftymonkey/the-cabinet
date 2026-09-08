// The wisps: the run's only homing line, fired on each swallow and never
// always-on (ADR 0005).

import { createPool, takeSlot, WISP_CAP } from '../caps';
import { TICK_HZ } from '../clock';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { cos, normalize, rotateToward, sin } from '../math';
import type { RunState } from '../run';
import type { StormTarget } from '../stormTargets';
import { stormTarget, stormTargets } from '../stormTargets';
import { freshnessScale } from '../tuning';

interface Wisp {
  alive: boolean;
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Ticks of flight left. A wisp that finds nothing expires rather than persisting (ADR 0005).
  life: number;
  // The id of the thing this wisp is flying at, or null when the field is empty.
  targetId: number | null;
}

/**
 * How many wisps each swallow launches, indexed by level. The concept doc's
 * endpoints are one lazy wisp and a converging flight of eleven, and the
 * one-swallow ordnance bound is computed against a volley of eleven, so level 5
 * is eleven and the design and the arithmetic agree.
 *
 * The ladder is sized against what a volley clears rather than against its own
 * shape: #76 pass A costs a trash body four wisps where it used to cost three,
 * and eleven at the ceiling is what keeps a maxed volley clearing the same
 * couple of bodies it always did.
 *
 * Level 0 is zero, so the line is silent at the start of a run and arrives only
 * through a drop: homing is always bought with a dive.
 */
const WISPS_BY_LEVEL: readonly number[] = [0, 1, 3, 5, 8, 11];

/**
 * The fewest souls a swallow ever tears loose from an owned line (ADR 0058).
 *
 * ADR 0058's own word: a bare proportional count pays nothing at level one
 * where the flight is a single wisp, and a swallow that fires nothing reads as
 * a bug.
 */
const WISP_FLOOR_SOULS = 1;

/**
 * Field units per tick, against a 90-tick life: 450 units of travel, more than
 * half the field's height, so a wisp launched at the grave can reach a mid-field
 * target and expire honestly if it finds nothing.
 */
const WISP_SPEED = 300 / TICK_HZ;

const WISP_LIFETIME = 90;

/**
 * A full reversal takes one second, which is generous enough that the run's
 * homing line actually hits and slow enough that a wisp visibly curves rather
 * than snapping. "Lazy" is a look and this is where it comes from.
 */
const WISP_TURN_DEGREES_PER_SECOND = 180;

const WISP_HALF_EXTENT = 4;

// What one wisp takes off a mob. Four of these is a shambler exactly (#76 pass A).
const WISP_DAMAGE = 10;

const blankWisp = (): Wisp => {
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
};

const createWispPool = (): Wisp[] => {
  return createPool(WISP_CAP, blankWisp);
};

const TURN_RADIANS = (WISP_TURN_DEGREES_PER_SECOND * Math.PI) / 180 / TICK_HZ;

// Computed once at module load, through math.ts, and held beside this line's own
// turn rate rather than travelling with the shared rotateToward.
const TURN_COS = cos(TURN_RADIANS);
const TURN_SIN = sin(TURN_RADIANS);

// The live target a wisp is flying at, or null once it is gone.
const targetOf = (state: RunState, wisp: Wisp): StormTarget | null => {
  if (wisp.targetId === null) return null;
  return stormTarget(state, wisp.targetId);
};

// How many live wisps are already flying at this target.
const committedTo = (state: RunState, targetId: number): number => {
  let committed = 0;
  for (const wisp of state.wisps) {
    if (wisp.alive && wisp.targetId === targetId) committed += 1;
  }
  return committed;
};

// The squared distance from a point to a target, which orders them without a square root.
const distanceTo = (target: StormTarget, x: number, y: number): number => {
  const dx = target.x - x;
  const dy = target.y - y;
  return dx * dx + dy * dy;
};

/**
 * The nearest live target, optionally only those with room for one more wisp.
 *
 * Room is what makes the ordnance bound a fact rather than an intention: a
 * volley whose damage spreads kills exactly as many bodies as the bound is
 * checked against, where a volley that piled onto the nearest body would
 * overkill one and stop being meaningful ordnance.
 */
const nearestTarget = (
  state: RunState,
  x: number,
  y: number,
  withRoom: boolean,
): StormTarget | null => {
  let nearest: StormTarget | null = null;
  let best = Infinity;
  for (const target of stormTargets(state)) {
    if (withRoom && committedTo(state, target.id) * WISP_DAMAGE >= target.hp) {
      continue;
    }
    const distance = distanceTo(target, x, y);
    if (distance >= best) continue;
    best = distance;
    nearest = target;
  }
  return nearest;
};

// Points a wisp at a target, or straight up when the field holds nothing to hunt.
const aim = (wisp: Wisp, target: StormTarget | null): void => {
  wisp.targetId = target === null ? null : target.id;
  const heading =
    target === null
      ? { x: 0, y: -1, length: 1 }
      : normalize(target.x - wisp.x, target.y - wisp.y);
  const direction = heading.length === 0 ? { x: 0, y: -1 } : heading;
  wisp.vx = direction.x * WISP_SPEED;
  wisp.vy = direction.y * WISP_SPEED;
};

/**
 * How many souls this swallow tears loose (ADR 0058).
 *
 * The wisps pay in souls, so freshness scales the count, floored at one soul
 * because a bare proportional count pays nothing at level one where the flight
 * is a single wisp. The floor applies only above level zero: level zero is
 * silence because homing is always bought with a dive, and a floor that
 * resurrected an unowned line would hand the run a line it never took. A part
 * soul is floored rather than rounded, so the scale only ever pays what it has
 * fully bought.
 */
const soulsForSwallow = (level: number, freshness: number): number => {
  const owned = WISPS_BY_LEVEL[level];
  if (owned === 0) return 0;
  return Math.max(
    WISP_FLOOR_SOULS,
    Math.floor(owned * freshnessScale(freshness)),
  );
};

/**
 * One swallow's volley, its count scaled by the corpse's freshness (ADR 0058),
 * launched from the grave's mouth on the tick the food went in. It is called
 * from swallow.ts and never from the tick loop: a tick of lag would read as the
 * burst arriving after the dive rather than out of it.
 *
 * Wisps are walked in slot order and each takes the nearest live target with
 * room for it. Surplus wisps over-commit onto the last target assigned, which
 * costs the bound nothing because a dead body does not die twice, and which
 * looks like the converging flight the concept doc promises.
 */
const launchWisps = (
  state: RunState,
  // The swallow's own event list, so a volley that ever reports does it in
  // tick order rather than out of band. Nothing is pushed onto it today.
  _events: SimEvent[],
  freshness: number,
): void => {
  const count = soulsForSwallow(state.levels.wisps, freshness);
  const x = state.grave.x;
  const y = state.grave.y - state.grave.size;
  // The over-commit target is carried by id and asked for again rather than
  // held: the seam answers for the moment it is asked, so a record kept across
  // one is a record of whatever now stands in that place.
  let lastId: number | null = null;
  for (let launched = 0; launched < count; launched++) {
    const wisp = takeSlot(state.wisps, state.nextEntityId);
    if (wisp === null) return;
    state.nextEntityId += 1;
    wisp.x = x;
    wisp.y = y;
    wisp.life = WISP_LIFETIME;
    const nearest = nearestTarget(state, x, y, true);
    const target: StormTarget | null =
      nearest ?? (lastId === null ? null : stormTarget(state, lastId));
    aim(wisp, target);
    if (target !== null) lastId = target.id;
  }
};

// A wisp fully outside the field on any side is gone.
const cullWisps = (state: RunState): void => {
  for (const wisp of state.wisps) {
    if (!wisp.alive) continue;
    const outside =
      wisp.x + WISP_HALF_EXTENT < 0 ||
      wisp.x - WISP_HALF_EXTENT > FIELD_WIDTH ||
      wisp.y + WISP_HALF_EXTENT < 0 ||
      wisp.y - WISP_HALF_EXTENT > FIELD_HEIGHT;
    if (outside) wisp.alive = false;
  }
};

/**
 * One wisp's turn and flight.
 *
 * The heading is renormalized every tick rather than the velocity being rotated
 * in place, exactly as a ghoul's chase already does it: rotating in place would
 * compound f32 rounding of the turn's cosine and sine over a 90-tick life and
 * let the speed drift, and the speed is what the lifetime is derived against.
 */
const flyWisp = (state: RunState, wisp: Wisp): void => {
  let target: StormTarget | null = targetOf(state, wisp);
  if (target === null && wisp.targetId !== null) {
    target =
      nearestTarget(state, wisp.x, wisp.y, true) ??
      nearestTarget(state, wisp.x, wisp.y, false);
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
};

// Every live wisp's turn, flight and expiry, one tick on.
const advanceWisps = (state: RunState): SimEvent[] => {
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
};

export {
  createWispPool,
  launchWisps,
  advanceWisps,
  WISPS_BY_LEVEL,
  WISP_FLOOR_SOULS,
  WISP_SPEED,
  WISP_LIFETIME,
  WISP_TURN_DEGREES_PER_SECOND,
  WISP_HALF_EXTENT,
  WISP_DAMAGE,
};
export type { Wisp };
