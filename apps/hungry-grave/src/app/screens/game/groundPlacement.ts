/**
 * Where scenery draws under the camera, and at what size (design record A7):
 * lying and standing.
 */

import { type Camera, groundToColumn } from './camera';

interface Placement {
  readonly x: number;
  readonly y: number;
  readonly scaleX: number;
  readonly scaleY: number;
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
 * A lying thing, laid on the ground so it foreshortens with the ground exactly
 * where it lies (A7). The dressing's eyes and cracks are placed with it.
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
 * the drawing's own centre. The dressing's statues and cliffs are placed with
 * it.
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

export { lyingAt, standingAt };
export type { Placement };
