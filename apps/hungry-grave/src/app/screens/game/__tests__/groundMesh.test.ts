/**
 * The ground's grid (tilted view A9): laid on the column, 18 columns by 40
 * rows and 0.08 of the column past every edge (the prototype's
 * `GROUND_COLUMNS`, `GROUND_ROWS` and `GROUND_OVERSHOOT`), each vertex sampling
 * the ground the camera shows there. The camera's own tests pin the ground it
 * shows, so this file takes that as its source of truth.
 */

import { describe, expect, it } from 'vitest';

import { columnToGround } from '../camera';
import { SHORTEST_FIELD } from '../../../../game/field';
import { sceneFor } from '../scene';
import { groundGrid, groundGridIndices } from '../groundMesh';

// The shortest field's scene, the one this file's values were pinned on (tilted view A34).
const { camera: SHORTEST_CAMERA, column: SHORTEST_COLUMN } =
  sceneFor(SHORTEST_FIELD);

const TILE = { width: 256, height: 320 };
const COLUMNS = 18;
const ROWS = 40;
const VERTICES = (COLUMNS + 1) * (ROWS + 1);

/** Asserts a value within a tolerance, naming both figures when it is not. */
const expectNear = (actual: number, expected: number, tolerance: number) =>
  expect(
    Math.abs(actual - expected),
    `${actual} against ${expected}`,
  ).toBeLessThanOrEqual(tolerance);

/** The vertex positions as points, in the order the buffer holds them. */
const pointsOf = (positions: Float32Array): { x: number; y: number }[] =>
  Array.from({ length: positions.length / 2 }, (_, i) => ({
    x: positions[2 * i]!,
    y: positions[2 * i + 1]!,
  }));

describe("the ground's grid (tilted view A9)", () => {
  it('the grid covers the whole column and 0.08 of it past every edge', () => {
    // A9: the prototype's grid, 18 by 40 with 0.08 overshoot, is the starting
    // value; 0.08 of 540 is 43.2 and of 760 is 60.8.
    const { positions, uvs } = groundGrid(
      SHORTEST_CAMERA,
      SHORTEST_COLUMN,
      TILE,
      0,
    );
    expect(positions.length).toBe(VERTICES * 2);
    expect(uvs.length).toBe(VERTICES * 2);
    const points = pointsOf(positions);
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    expectNear(Math.min(...xs), -43.2, 1e-4);
    expectNear(Math.max(...xs), 583.2, 1e-4);
    expectNear(Math.min(...ys), -60.8, 1e-4);
    expectNear(Math.max(...ys), 820.8, 1e-4);
    expect(new Set(xs.map((x) => x.toFixed(3))).size).toBe(COLUMNS + 1);
    expect(new Set(ys.map((y) => y.toFixed(3))).size).toBe(ROWS + 1);
  });

  it("each vertex samples the ground the camera shows at that point of the column, over the tile's size", () => {
    // A9: the perspective rides entirely in the texture coordinates. The middle
    // vertex, column (270, 380), shows ground (270, 380) by A3.
    const { positions, uvs } = groundGrid(
      SHORTEST_CAMERA,
      SHORTEST_COLUMN,
      TILE,
      0,
    );
    const points = pointsOf(positions);
    expect(points.length).toBe(VERTICES);
    points.forEach((point, i) => {
      const ground = columnToGround(SHORTEST_CAMERA, point.x, point.y)!;
      expectNear(uvs[2 * i]!, ground.x / TILE.width, 1e-5);
      expectNear(uvs[2 * i + 1]!, ground.y / TILE.height, 1e-5);
    });
    const middle = points.findIndex(
      (p) => Math.abs(p.x - 270) < 1e-3 && Math.abs(p.y - 380) < 1e-3,
    );
    expect(middle).toBeGreaterThanOrEqual(0);
    expectNear(uvs[2 * middle]!, 270 / 256, 1e-5);
    expectNear(uvs[2 * middle + 1]!, 380 / 320, 1e-5);
  });

  it("the scroll moves every texture coordinate by the scrolled distance over the tile's height and moves no vertex", () => {
    // A9: the ground's scroll is the sim's own, in ground units. The ground
    // moves down the field, so each vertex samples the tile that much higher.
    const still = groundGrid(SHORTEST_CAMERA, SHORTEST_COLUMN, TILE, 0);
    const scrolled = groundGrid(SHORTEST_CAMERA, SHORTEST_COLUMN, TILE, 48);
    expect(scrolled.positions.length).toBe(VERTICES * 2);
    expect(Array.from(scrolled.positions)).toEqual(Array.from(still.positions));
    for (let i = 0; i < VERTICES; i++) {
      expectNear(scrolled.uvs[2 * i]!, still.uvs[2 * i]!, 1e-6);
      expectNear(
        scrolled.uvs[2 * i + 1]!,
        still.uvs[2 * i + 1]! - 48 / 320,
        1e-5,
      );
    }
  });

  it("the grid's triangles cover every cell exactly once", () => {
    // A9: two triangles per cell of the 18 by 40 grid, splitting the cell along
    // one diagonal, so no cell is left bare and none is drawn twice.
    const indices = groundGridIndices();
    expect(indices.length).toBe(COLUMNS * ROWS * 6);
    const trianglesPerCell = new Map<string, Set<number>[]>();
    for (let t = 0; t < indices.length; t += 3) {
      const corners = [indices[t]!, indices[t + 1]!, indices[t + 2]!];
      expect(new Set(corners).size).toBe(3);
      const rows = corners.map((v) => Math.floor(v / (COLUMNS + 1)));
      const cols = corners.map((v) => v % (COLUMNS + 1));
      expect(Math.max(...rows) - Math.min(...rows)).toBe(1);
      expect(Math.max(...cols) - Math.min(...cols)).toBe(1);
      const cell = `${Math.min(...rows)},${Math.min(...cols)}`;
      const list = trianglesPerCell.get(cell) ?? [];
      list.push(new Set(corners));
      trianglesPerCell.set(cell, list);
    }
    expect(trianglesPerCell.size).toBe(COLUMNS * ROWS);
    for (const [cell, triangles] of trianglesPerCell) {
      expect(triangles.length, cell).toBe(2);
      const union = new Set([...triangles[0]!, ...triangles[1]!]);
      expect(union.size, cell).toBe(4);
      const shared = [...triangles[0]!].filter((v) => triangles[1]!.has(v));
      expect(shared.length, cell).toBe(2);
      // The shared edge is the cell's diagonal, so the two do not overlap.
      const [a, b] = shared as [number, number];
      expect(Math.floor(a / (COLUMNS + 1)), cell).not.toBe(
        Math.floor(b / (COLUMNS + 1)),
      );
      expect(a % (COLUMNS + 1), cell).not.toBe(b % (COLUMNS + 1));
    }
  });
});
