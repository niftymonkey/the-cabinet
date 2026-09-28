/**
 * The play layer (tilted view T10, T11, A18): where everything the sim moves is
 * drawn, straight across the column and on the camera's own rows down it.
 */

import type { FieldPoint } from '../../../game/field';
import type { Camera, Column, OnColumn } from './camera';
import { columnToGround, groundToColumn, visibleGround } from './camera';

interface PlayLayer {
  readonly camera: Camera;
  // The ground y the camera shows under the column's top row.
  readonly top: number;
  // Ground units along per field unit along.
  readonly stretch: number;
}

/**
 * The longest step, in field units, between two traced points of an area's
 * outline (A20). A traced circle's gap between chord and arc is then 0.0625
 * field units at radius 32 and less for larger ones.
 */
const OUTLINE_STEP = 4;

/**
 * The play layer over a column (A18). A pinhole row shows one ground y whatever
 * its column x, so the ground the column's centre shows, top row to bottom row,
 * is spread over the field's height. The run's is `Scene.playLayer`; slice B's
 * renderers place through it.
 */
const makePlayLayer = (camera: Camera, column: Column): PlayLayer => {
  const ground = visibleGround(camera, column);
  return {
    camera,
    top: ground.top,
    stretch: (ground.bottom - ground.top) / column.height,
  };
};

// The ground y a field y reads as on the play layer (A18).
const groundAlong = (layer: PlayLayer, y: number): number =>
  layer.top + layer.stretch * y;

/**
 * Where a field point draws on the play layer (T10, T11): across, a field unit
 * is a column unit at every row; down, the camera's own row for the ground y
 * the field y reads as; the size, the camera's there. Slice B's renderers and
 * slice C's grave place through it.
 */
const playToColumn = (layer: PlayLayer, x: number, y: number): OnColumn => {
  const { camera } = layer;
  const on = groundToColumn(camera, camera.target.x, groundAlong(layer, y));
  return { x, y: on.y, scale: on.scale };
};

/**
 * The field point the play layer draws at a column point, the exact inverse of
 * `playToColumn`; null at or above the horizon, where the camera shows no
 * ground. Slice C's drag reads it (T9).
 */
const columnToPlay = (
  layer: PlayLayer,
  x: number,
  y: number,
): FieldPoint | null => {
  const ground = columnToGround(layer.camera, layer.camera.target.x, y);
  if (ground === null) return null;
  return { x, y: (ground.y - layer.top) / layer.stretch };
};

/**
 * The ground the camera shows where the play layer draws a field point, which
 * slice C cuts the grave's hole from (A23). Every row of the field is below the
 * horizon, so a miss is a bug.
 */
const groundUnderPlay = (
  layer: PlayLayer,
  x: number,
  y: number,
): FieldPoint => {
  const drawn = playToColumn(layer, x, y);
  const ground = columnToGround(layer.camera, drawn.x, drawn.y);
  if (ground === null) {
    throw new Error(`play point (${x}, ${y}) draws above the horizon`);
  }
  return ground;
};

/**
 * Column rows per field unit along at a field y (A18): the derivative of
 * `playToColumn`'s row, the scale squared times the lean times the stretch. It
 * leaves out the camera's nearest-share hold, which binds only behind the
 * camera's feet, off the column. Slice B's mob fire, headings and the grave's
 * frame read it.
 */
const stretchAlong = (layer: PlayLayer, y: number): number => {
  const { scale } = playToColumn(layer, 0, y);
  return scale * scale * layer.camera.lean * layer.stretch;
};

// The field points along one edge, its start included and its end left for the next edge.
const stepsAlongEdge = (from: FieldPoint, to: FieldPoint): FieldPoint[] => {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(length / OUTLINE_STEP));
  return Array.from({ length: steps }, (_, i) => ({
    x: from.x + ((to.x - from.x) * i) / steps,
    y: from.y + ((to.y - from.y) * i) / steps,
  }));
};

/**
 * The column outline of a shape built in field units, every edge walked in
 * steps of at most `OUTLINE_STEP` and every point placed through the play
 * layer, flat as Pixi's `Graphics.poly` takes it (A20). Closed, the closing
 * edge is walked too. Slice C traces the patches, cones and eruption with it.
 */
const traceOnColumn = (
  layer: PlayLayer,
  outline: readonly FieldPoint[],
  closed: boolean,
): number[] => {
  const walked = outline.flatMap((from, i) => {
    const to = outline[i + 1] ?? (closed ? outline[0] : undefined);
    return to === undefined ? [from] : stepsAlongEdge(from, to);
  });
  return walked.flatMap((point) => {
    const on = playToColumn(layer, point.x, point.y);
    return [on.x, on.y];
  });
};

/**
 * A circle in field units with no chord longer than `OUTLINE_STEP`, for
 * `traceOnColumn`. Slice C's patches and eruption read it (A20).
 */
const circleOutline = (x: number, y: number, radius: number): FieldPoint[] => {
  const count = Math.max(3, Math.ceil((2 * Math.PI * radius) / OUTLINE_STEP));
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count;
    return { x: x + radius * Math.cos(angle), y: y + radius * Math.sin(angle) };
  });
};

export {
  OUTLINE_STEP,
  circleOutline,
  columnToPlay,
  groundUnderPlay,
  makePlayLayer,
  playToColumn,
  stretchAlong,
  traceOnColumn,
};
export type { PlayLayer };
