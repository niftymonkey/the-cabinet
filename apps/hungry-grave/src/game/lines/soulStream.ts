// The soul stream: skulls pouring straight up out of the grave's mouth in
// rigid fanned columns, always on from level 1, surging after every swallow
// (ADR 0005).

import { createPool, SKULL_CAP, takeSlot } from '../caps';
import { TICK_HZ } from '../clock';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { cos, normalize, sin } from '../math';
import type { RunState } from '../run';

interface Skull {
  alive: boolean;
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * How many columns each level fires, indexed by level. The level curve is
 * columns and nothing else.
 */
const COLUMNS_BY_LEVEL: readonly number[] = [0, 1, 2, 3, 4, 5];

/**
 * Ticks between volleys, fixed across levels because "the saturation workhorse"
 * is a statement about how much is on the field rather than about how fast one
 * lane repeats, and a curve that moved both would make the two
 * indistinguishable to anyone reading the code or the screen.
 *
 * The magnitude is derived rather than picked. A shambler takes five skulls
 * (#76 pass A), so a mob standing in one column dies to five volleys, and three
 * tenths of a second between them puts a trash kill at about 1.5 seconds under
 * a level-1 stream, which is the "trash dies in a second or two" the drain-out
 * is re-derived against. The kill time is the fixed thing here: pass A raises
 * the touch count and shortens the gap by the same factor, so the stream reads
 * denser and thinner on screen without trash surviving any longer.
 */
const STREAM_INTERVAL = 18;

/**
 * Field units per tick. Mob fire travels at 110 units per second and ADR 0014
 * makes it slow on purpose, so the player's storm reading as unmistakably not
 * mob fire is the same rule from the other side: the skull is roughly four times
 * faster. It crosses the field's height in about 1.8 seconds, which is a real
 * lead time and is why the stream is a saturation weapon rather than a sniper.
 */
const SKULL_SPEED = 420 / TICK_HZ;

/**
 * How far apart the columns stand, in degrees, symmetric about straight up. At
 * five columns the fan spans minus twelve to plus twelve, and twelve degrees off
 * vertical drifts a skull 128 units sideways over 600 units of travel, about a
 * quarter of the field's width, so the widest column still lands inside the
 * field from a centred grave and the fan reads as coverage rather than a spray.
 */
const FAN_STEP_DEGREES = 6;

/**
 * How many volleys one swallow buys at the shortened interval. Mark ruled the
 * shape on 2026-08-22: a fixed number of extra volleys, never a time window.
 *
 * Two is a provisional restoration of the swallow burst's old functional
 * magnitude under #76 pass A's touch counts. It is not a new tuning direction
 * and not a permanent design rule. The rescale is neutral for a rate-based
 * effect and a straight cut for a count-based one, and the surge is counted in
 * volleys: at the ceiling one extra volley is five skulls, which used to be
 * 1.67 shambler bodies and is exactly 1.0 after the rescale. Mark's reason for
 * restoring it: "The old one-volley surge lost a large share of its functional
 * value under the new touch counts, and because surge fires on every swallow it
 * directly weakens the snowball loop." Two volleys clear 2.0 bodies against the
 * old 1.67, so this over-restores slightly; no integer count lands on 1.67, and
 * holding the burst's old magnitude is what the number is for.
 */
const SURGE_VOLLEYS = 2;

// The shortened interval a surged volley waits, in ticks: a third of the fixed
// one, which is the ratio it has always carried.
const SURGE_INTERVAL = 6;

const SKULL_HALF_EXTENT = 4;

// What one skull takes off a mob. Five of these is a shambler exactly (#76 pass A).
const SKULL_DAMAGE = 8;

const blankSkull = (): Skull => {
  return { alive: false, id: 0, x: 0, y: 0, vx: 0, vy: 0 };
};

const createSkullPool = (): Skull[] => {
  return createPool(SKULL_CAP, blankSkull);
};

const DEGREES_TO_RADIANS = Math.PI / 180;

/**
 * How far off straight up one column of a fan of this width stands, in degrees.
 * The columns straddle the centre, so an even count has none straight up and an
 * odd count has exactly one.
 */
const columnAngle = (column: number, columns: number): number => {
  return (column - (columns - 1) / 2) * FAN_STEP_DEGREES;
};

/**
 * A skull put on the field at the mouth, flying one column of the fan.
 *
 * The direction is built once here and never touched again, which is what makes
 * "rigid" and "never homes" the same requirement. It goes through normalize so
 * the launch vector is exactly unit length whatever the f32 rounding did to the
 * sine and cosine, and the speed is then a single multiply.
 */
const launchSkull = (
  state: RunState,
  column: number,
  columns: number,
): void => {
  const skull = takeSlot(state.skulls, state.nextEntityId);
  if (skull === null) return;
  state.nextEntityId += 1;

  const radians = columnAngle(column, columns) * DEGREES_TO_RADIANS;
  const heading = normalize(sin(radians), -cos(radians));
  skull.x = state.grave.x;
  skull.y = state.grave.y - state.grave.size;
  skull.vx = heading.x * SKULL_SPEED;
  skull.vy = heading.y * SKULL_SPEED;
};

// Every column of one volley, in column order so the same level always fires the same sequence.
const fireVolley = (state: RunState): void => {
  const columns = COLUMNS_BY_LEVEL[state.levels.soulStream];
  for (let column = 0; column < columns; column++) {
    launchSkull(state, column, columns);
  }
};

/**
 * How long until the volley after this one, and the surge spent in the asking.
 * A surged volley is one scheduled at the shortened interval, so the count is
 * discharged here rather than at the moment that volley leaves.
 */
const nextInterval = (state: RunState): number => {
  if (state.lines.surgeVolleys <= 0) return STREAM_INTERVAL;
  state.lines.surgeVolleys -= 1;
  return SURGE_INTERVAL;
};

// A skull fully outside the field on any side is gone.
const cullSkulls = (state: RunState): void => {
  for (const skull of state.skulls) {
    if (!skull.alive) continue;
    const outside =
      skull.x + SKULL_HALF_EXTENT < 0 ||
      skull.x - SKULL_HALF_EXTENT > FIELD_WIDTH ||
      skull.y + SKULL_HALF_EXTENT < 0 ||
      skull.y - SKULL_HALF_EXTENT > FIELD_HEIGHT;
    if (outside) skull.alive = false;
  }
};

/**
 * One skull's flight for this tick, and the moment the next volley is due
 * (tracer plan section 3). Skulls move before the volley fires, so a skull
 * launched this tick does not also move this tick and the stream visibly pours
 * out of the mouth.
 */
const advanceStream = (state: RunState): SimEvent[] => {
  for (const skull of state.skulls) {
    if (!skull.alive) continue;
    skull.x += skull.vx;
    skull.y += skull.vy;
  }
  cullSkulls(state);
  state.lines.streamIn -= 1;
  if (state.lines.streamIn > 0) return [];
  fireVolley(state);
  state.lines.streamIn = nextInterval(state);
  return [];
};

/**
 * A swallow's surge. It sets the count rather than adding to it, which is Mark's
 * 2026-08-22 ruling said in code: one swallow buys one burst, and a swallow
 * chain overwrites an unspent volley instead of banking a queue.
 */
const surgeStream = (state: RunState): void => {
  state.lines.surgeVolleys = SURGE_VOLLEYS;
};

export {
  createSkullPool,
  advanceStream,
  surgeStream,
  COLUMNS_BY_LEVEL,
  STREAM_INTERVAL,
  SKULL_SPEED,
  FAN_STEP_DEGREES,
  SURGE_VOLLEYS,
  SURGE_INTERVAL,
  SKULL_HALF_EXTENT,
  SKULL_DAMAGE,
};
export type { Skull };
