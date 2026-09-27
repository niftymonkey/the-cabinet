/**
 * Where each kind of thing on the ground draws under the camera, and at what
 * size (design record A7): lying, standing, airborne, and hostile fire.
 */

import { type Camera, groundToColumn } from './camera';

interface Placement {
  readonly x: number;
  readonly y: number;
  readonly scaleX: number;
  readonly scaleY: number;
}

interface ColumnOffset {
  readonly x: number;
  readonly y: number;
}

/**
 * How fast a ground point's column y moves per field unit down the field: the
 * scale squared times the lean. It is the derivative of the projection away
 * from the camera's nearest-share hold, which lies behind the camera's feet and
 * off the column.
 */
const columnRateDownField = (camera: Camera, scale: number): number =>
  scale * scale * camera.lean;

/**
 * How fast a ground point's column x moves per field unit down the field,
 * because nearer ground spreads away from the middle column.
 */
const columnSpreadDownField = (
  camera: Camera,
  x: number,
  scale: number,
): number =>
  ((x - camera.target.x) * scale * scale * camera.rise) / camera.distance;

/**
 * A lying thing, laid on the ground so it foreshortens with the ground exactly
 * where it lies (A7). Slice 2's renderers place corpses, treasure, patches and
 * the grave's lip with it.
 */
const lyingAt = (camera: Camera, x: number, y: number): Placement => {
  const on = groundToColumn(camera, x, y);
  return {
    x: on.x,
    y: on.y,
    scaleX: on.scale,
    scaleY: columnRateDownField(camera, on.scale),
  };
};

/**
 * A standing thing, upright at the camera's scale with its feet on the near
 * edge of its footprint, so it rises from where it stands (A7). The point is
 * the drawing's own centre. Slice 2 places mobs, bosses and statues with it.
 */
const standingAt = (
  camera: Camera,
  x: number,
  y: number,
  halfDepth: number,
): Placement => {
  const feet = groundToColumn(camera, x, y + halfDepth);
  return {
    x: feet.x,
    y: feet.y - halfDepth * feet.scale,
    scaleX: feet.scale,
    scaleY: feet.scale,
  };
};

/**
 * A thing with no height in the sim (skulls, wisps, scatters), upright at its
 * ground point at the camera's scale (A7). Slice 2's renderers read it.
 */
const airborneAt = (camera: Camera, x: number, y: number): Placement => {
  const on = groundToColumn(camera, x, y);
  return { x: on.x, y: on.y, scaleX: on.scale, scaleY: on.scale };
};

/**
 * Mob fire, as an airborne thing that never draws smaller than today's size
 * and its hitbox (A7). Slice 2's mob fire renderer reads it.
 */
const hostileFireAt = (camera: Camera, x: number, y: number): Placement => {
  const on = groundToColumn(camera, x, y);
  const scale = Math.max(on.scale, 1);
  return { x: on.x, y: on.y, scaleX: scale, scaleY: scale };
};

/**
 * The angle, in radians, of the way a body at a ground point moving by a
 * ground velocity goes on the column (A7). Slice 2 turns the ghoul's wedge and
 * a wisp with it.
 */
const headingOnColumn = (
  camera: Camera,
  x: number,
  y: number,
  vx: number,
  vy: number,
): number => {
  const { scale } = groundToColumn(camera, x, y);
  const across = vx * scale + vy * columnSpreadDownField(camera, x, scale);
  const down = vy * columnRateDownField(camera, scale);
  return Math.atan2(down, across);
};

/**
 * An art offset drawn in field units (a lob's lift, a burst's drift), as a
 * column offset at the camera's scale at that thing's ground point (A7, last
 * bullet). Slice 2's patch and burst renderers read it.
 */
const liftOnColumn = (
  camera: Camera,
  x: number,
  y: number,
  dx: number,
  dy: number,
): ColumnOffset => {
  const { scale } = groundToColumn(camera, x, y);
  return { x: dx * scale, y: dy * scale };
};

export {
  airborneAt,
  headingOnColumn,
  hostileFireAt,
  liftOnColumn,
  lyingAt,
  standingAt,
};
export type { Placement };
