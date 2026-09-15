// The wisps: the run's only homing line, fired on each swallow and never
// always-on (ADR 0005).

import { createPool, takeSlot, WISP_CAP } from '../caps';
import { TICK_HZ } from '../clock';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { cos, normalize, rotateToward, sin } from '../math';
import type { RunState } from '../run';
import { MAX_LEVEL } from './roster';
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
 * shape. Under the mow a trash body costs one wisp at every rung (ADR 0059),
 * so eleven souls at the ceiling is eleven bodies of a maxed volley's reach
 * where a rung-1 volley clears one, and what the count buys is how much of a
 * crowd one swallow answers.
 *
 * Level 0 is zero, so the line is silent at the start of a run and arrives only
 * through a power-up: homing is always bought with a dive.
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

/**
 * What one wisp takes off a mob at each rung, indexed by level. The lane adds
 * 25% of the rung-1 figure per rung to a ceiling of twice it, rounded down
 * where the step lands between whole souls
 * (docs/research/weapon-growth-per-level-precedent.md section 4: a quarter of
 * 10 puts rungs 2 and 4 at 12.5 and 17.5, and the record authors 12 and 17).
 * Nothing rules the damage a wisp carries, so this is the one lane in the
 * roster set by precedent alone.
 *
 * One wisp is a mow body at every rung (ADR 0059). What the lane buys is the
 * bodies above it: at rung 1 a ghoul is two wisps and a revenant seven, and at
 * rung 5 they are one and four.
 *
 * Level 0 is a line a run does not hold, so it takes nothing off anything.
 */
const WISP_DAMAGE_BY_LEVEL: readonly number[] = [0, 10, 12, 15, 17, 20];

/**
 * What one wisp takes off a mob at this rung, clamped at the last rung the
 * table authors rather than reading past it. A level below zero is not a rung
 * and fails loudly.
 */
const wispDamage = (level: number): number => {
  const damage = WISP_DAMAGE_BY_LEVEL[Math.min(level, MAX_LEVEL)];
  if (damage === undefined) {
    throw new Error(`no wisp damage at level ${level}`);
  }
  return damage;
};

/**
 * The fewest ticks between two wisp volleys, whatever the swallow rate
 * (ADR 0058 as amended). The magnitude is the design record's section 4 table
 * and its section 9, about thirty ticks, against WISP_CAP 64, which must not
 * bind: at ten swallows a second a level-five line launches on the order of
 * 110 souls a second into that cap, and a bound cap is a fault rather than a
 * throttle (ADR 0056).
 *
 * The clock it floors is lines.volleyIn, decremented in advanceWisps and set
 * to this figure by the volley that fires.
 */
const WISP_VOLLEY_INTERVAL_TICKS = 30;

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
  // The rung is read here rather than carried on a wisp: a wisp gains no field,
  // and what a soul takes off a body is the run's rung at the moment it lands.
  const damage = wispDamage(state.levels.wisps);
  for (const target of stormTargets(state)) {
    if (withRoom && committedTo(state, target.id) * damage >= target.hp) {
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
  if (owned === undefined) throw new Error(`no souls count at level ${level}`);
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
 *
 * A swallow inside the volley interval fires nothing and banks nothing
 * (ADR 0058 as amended). Nothing is banked because a banked volley would pay a
 * stale corpse's freshness on a fresh corpse's tick, and the count is what
 * freshness scales.
 */
const launchWisps = (
  state: RunState,
  // The swallow's own event list, so a volley that ever reports does it in
  // tick order rather than out of band. Nothing is pushed onto it today.
  _events: SimEvent[],
  freshness: number,
): void => {
  if (state.lines.volleyIn > 0) return;
  const count = soulsForSwallow(state.levels.wisps, freshness);
  // An unowned line fires nothing, so it arms no floor: the first swallow after
  // a run buys the wisps must fire, and a run that swallowed at level zero
  // would otherwise have started the interval without a volley in it.
  if (count === 0) return;
  state.lines.volleyIn = WISP_VOLLEY_INTERVAL_TICKS;
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

/**
 * Every live wisp's turn, flight and expiry, one tick on, and the volley
 * clock's own tick.
 *
 * The clock runs here and nowhere else, so it keeps ticking while the pool is
 * empty: a volley fired, expired and left the field is still inside its own
 * interval, and a clock that only ran while something was flying would let the
 * next swallow fire early exactly when the field is thickest.
 */
const advanceWisps = (state: RunState): SimEvent[] => {
  const lines = state.lines;
  if (lines.volleyIn > 0) lines.volleyIn -= 1;
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
  wispDamage,
  WISPS_BY_LEVEL,
  WISP_FLOOR_SOULS,
  WISP_SPEED,
  WISP_LIFETIME,
  WISP_TURN_DEGREES_PER_SECOND,
  WISP_HALF_EXTENT,
  WISP_DAMAGE_BY_LEVEL,
  WISP_VOLLEY_INTERVAL_TICKS,
};
export type { Wisp };
