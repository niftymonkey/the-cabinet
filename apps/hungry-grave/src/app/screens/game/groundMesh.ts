/**
 * The ground's grid as geometry (design record A9): laid out on the column,
 * each vertex asking the camera which ground it stands on, so the perspective
 * rides entirely in the texture coordinates.
 */

import type { FieldPoint } from '../../../game/field';
import { type Camera, type Column, columnToGround } from './camera';

interface Tile {
  readonly width: number;
  readonly height: number;
}

interface GroundGrid {
  readonly positions: Float32Array;
  readonly uvs: Float32Array;
}

/**
 * How finely the grid is cut and how far past the column it reaches, as a
 * share of the column: the prototype's `GROUND_COLUMNS`, `GROUND_ROWS` and
 * `GROUND_OVERSHOOT` (tilted-view `index.html:1962-1966`). Its rows are steps
 * down the column, so the far end, where one step covers the most ground, gets
 * as many rows as the near end.
 */
const GROUND_GRID_VALUES = {
  columns: 18,
  rows: 40,
  overshoot: 0.08,
};

const lerp = (from: number, to: number, share: number): number =>
  from + (to - from) * share;

/**
 * The ground under a grid vertex. Every vertex is below the horizon, which is
 * 2135.7 column units above the middle row, and the camera is a constant, so a
 * vertex that shows no ground is a bug.
 */
const groundUnderVertex = (
  camera: Camera,
  x: number,
  y: number,
): FieldPoint => {
  const ground = columnToGround(camera, x, y);
  if (ground === null) {
    throw new Error(`ground grid vertex (${x}, ${y}) is above the horizon`);
  }
  return ground;
};

/**
 * The grid's vertex positions in column units and their texture coordinates:
 * the ground each vertex shows, less the scroll, over the tile's size. Slice
 * 2's ground renderer builds its mesh from it.
 */
const groundGrid = (
  camera: Camera,
  column: Column,
  tile: Tile,
  scrolled: number,
): GroundGrid => {
  const { columns, rows, overshoot } = GROUND_GRID_VALUES;
  const vertices = (columns + 1) * (rows + 1);
  const positions = new Float32Array(vertices * 2);
  const uvs = new Float32Array(vertices * 2);
  const left = -column.width * overshoot;
  const right = column.width * (1 + overshoot);
  const top = -column.height * overshoot;
  const bottom = column.height * (1 + overshoot);
  let at = 0;
  for (let row = 0; row <= rows; row++) {
    const y = lerp(top, bottom, row / rows);
    for (let col = 0; col <= columns; col++) {
      const x = lerp(left, right, col / columns);
      const ground = groundUnderVertex(camera, x, y);
      positions[at] = x;
      positions[at + 1] = y;
      uvs[at] = ground.x / tile.width;
      uvs[at + 1] = (ground.y - scrolled) / tile.height;
      at += 2;
    }
  }
  return { positions, uvs };
};

/**
 * Two triangles per cell of the grid, split along one diagonal. Slice 2's
 * ground renderer builds its mesh from it.
 */
const groundGridIndices = (): Uint32Array => {
  const { columns, rows } = GROUND_GRID_VALUES;
  const indices = new Uint32Array(columns * rows * 6);
  let at = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const a = row * (columns + 1) + col;
      const b = a + 1;
      const c = a + columns + 1;
      indices.set([a, b, c, b, c + 1, c], at);
      at += 6;
    }
  }
  return indices;
};

export { groundGrid, groundGridIndices };
export type { GroundGrid, Tile };
