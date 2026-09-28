/**
 * The one still camera the whole field is drawn through (design record T2, T3,
 * T6, A1, A6, A13): tilted off straight down, standing high over the ground,
 * looking at the ground under the middle of the column and never following
 * the grave.
 */

import type { MoveCommand } from '../../../game/command';
import type { FieldPoint } from '../../../game/field';

interface Camera {
  readonly tilt: number;
  readonly lean: number;
  readonly rise: number;
  readonly height: number;
  readonly distance: number;
  readonly target: FieldPoint;
}

interface Column {
  readonly width: number;
  readonly height: number;
}

interface OnColumn {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

interface VisibleGround {
  readonly top: number;
  readonly bottom: number;
  readonly farLeft: number;
  readonly farRight: number;
  readonly nearLeft: number;
  readonly nearRight: number;
}

interface Stance {
  readonly cameraHeight: number;
  readonly nadirX: number;
  readonly nadirY: number;
}

interface Grave {
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

interface ColumnStep {
  readonly x: number;
  readonly y: number;
}

/**
 * Mark's two camera values, read off his phone after playing the tilted
 * prototype (T2, T3). The height is in half-lengths of the starting grave and
 * never the live one, because a camera that rose with the grave would flatten
 * the view as it grows.
 */
const CAMERA_VALUES = {
  tiltDegrees: 32.5,
  heightInStartingHalfLengths: 42.5,
};

/**
 * How near the camera's own feet a point may get before its scale is held,
 * from the prototype's `NEAREST_SHARE` (tilted-view `index.html:696`). Past it
 * the ground is beside or behind the camera and its scale runs to infinity.
 */
const NEAREST_SHARE = 0.12;

/**
 * How far a grass blade leans back off the vertical, from the prototype's
 * `BLADE_LEAN` (tilted-view `index.html:752`).
 */
const BLADE_LEAN_DEGREES = 62;

/**
 * Build 7's camera angle, `atan(1.07 / 4.95)` off straight down (#148's
 * design record R4, the prototype's `DEFAULT_TILT`, tilted-view
 * `index.html:382`): the angle grass was drawn for before the tilt.
 */
const BUILD_7_TILT = Math.atan(1.07 / 4.95);

// A still move is exactly still, never a ground-to-column round trip's rounding.
const STILL: MoveCommand = { x: 0, y: 0 };

const radiansOf = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * The target is the column's centre and also the ground under it, because the
 * column is laid out so one field unit draws as one column unit at the target
 * (A3).
 */
const makeCamera = (
  tiltDegrees: number,
  heightInStartingHalfLengths: number,
  startingSize: number,
  column: Column,
): Camera => {
  const tilt = radiansOf(tiltDegrees);
  const lean = Math.cos(tilt);
  const height = heightInStartingHalfLengths * startingSize;
  return {
    tilt,
    lean,
    rise: Math.sin(tilt),
    height,
    distance: height / lean,
    target: { x: column.width / 2, y: column.height / 2 },
  };
};

/** How many column units one field unit draws as at a ground row. */
const scaleAtGroundRow = (camera: Camera, y: number): number => {
  const ahead = camera.distance - (y - camera.target.y) * camera.rise;
  return camera.distance / Math.max(ahead, camera.distance * NEAREST_SHARE);
};

/** Slice 2's renderers place everything on the ground through this. */
const groundToColumn = (camera: Camera, x: number, y: number): OnColumn => {
  const scale = scaleAtGroundRow(camera, y);
  return {
    x: camera.target.x + (x - camera.target.x) * scale,
    y: camera.target.y + (y - camera.target.y) * camera.lean * scale,
    scale,
  };
};

/**
 * The exact inverse of `groundToColumn`, null at or above the horizon, where
 * the column shows no ground. Slice 2's ground grid reads it.
 */
const columnToGround = (
  camera: Camera,
  x: number,
  y: number,
): FieldPoint | null => {
  const below = y - camera.target.y;
  const ahead = camera.lean * camera.distance + below * camera.rise;
  if (ahead <= 0) return null;
  const groundY = camera.target.y + (below * camera.distance) / ahead;
  const scale = scaleAtGroundRow(camera, groundY);
  return { x: camera.target.x + (x - camera.target.x) / scale, y: groundY };
};

/** The ground under a column point that must show ground; a miss is a bug. */
const groundShownAt = (camera: Camera, x: number, y: number): FieldPoint => {
  const ground = columnToGround(camera, x, y);
  if (ground === null) {
    throw new Error(`column point (${x}, ${y}) is above the horizon`);
  }
  return ground;
};

/**
 * The trapezoid of ground a column shows (A2), which slice 7's field is and
 * which slice 2 draws over.
 */
const visibleGround = (camera: Camera, column: Column): VisibleGround => {
  const farLeft = groundShownAt(camera, 0, 0);
  const nearLeft = groundShownAt(camera, 0, column.height);
  return {
    top: farLeft.y,
    bottom: nearLeft.y,
    farLeft: farLeft.x,
    farRight: groundShownAt(camera, column.width, 0).x,
    nearLeft: nearLeft.x,
    nearRight: groundShownAt(camera, column.width, column.height).x,
  };
};

/**
 * Where the camera stands over a grave, in that grave's half-lengths (A6),
 * which slice 3 cuts the hole with. The height is the scene camera's own, so
 * it never rises with the live grave (T3).
 */
const stanceOverGrave = (camera: Camera, grave: Grave): Stance => {
  const footY = camera.target.y + camera.distance * camera.rise;
  return {
    cameraHeight: camera.height / grave.size,
    nadirX: (camera.target.x - grave.x) / grave.size,
    nadirY: (footY - grave.y) / grave.size,
  };
};

/**
 * The ground a point reaches when its drawn point moves by a step on the
 * column, null past the horizon. Slice 4 steers with it (T9, A11).
 */
const stepOnColumn = (
  camera: Camera,
  from: FieldPoint,
  step: ColumnStep,
): FieldPoint | null => {
  const drawn = groundToColumn(camera, from.x, from.y);
  return columnToGround(camera, drawn.x + step.x, drawn.y + step.y);
};

/**
 * The ground move, in base-speed units, that a move of the same units on the
 * column makes from where the grave draws (T9, A11). The player's steering and
 * the harness's hand both convert through this, so the two cannot convert two
 * ways. A step past the horizon is a still move.
 */
const groundMoveOnColumn = (
  camera: Camera,
  grave: FieldPoint,
  move: MoveCommand,
  baseSpeed: number,
): MoveCommand => {
  if (move.x === 0 && move.y === 0) return STILL;
  const reached = stepOnColumn(camera, grave, {
    x: move.x * baseSpeed,
    y: move.y * baseSpeed,
  });
  if (reached === null) return STILL;
  return {
    x: (reached.x - grave.x) / baseSpeed,
    y: (reached.y - grave.y) / baseSpeed,
  };
};

/**
 * How long a grass blade draws at this camera against build 7's length (A9).
 * Slice 2's ground painting reads it.
 */
const bladeReach = (camera: Camera): number => {
  const bladeLean = radiansOf(BLADE_LEAN_DEGREES);
  return Math.cos(camera.tilt - bladeLean) / Math.cos(BUILD_7_TILT - bladeLean);
};

export {
  CAMERA_VALUES,
  bladeReach,
  columnToGround,
  groundMoveOnColumn,
  groundToColumn,
  makeCamera,
  stanceOverGrave,
  stepOnColumn,
  visibleGround,
};
export type { Camera, Column, OnColumn, Stance, VisibleGround };
