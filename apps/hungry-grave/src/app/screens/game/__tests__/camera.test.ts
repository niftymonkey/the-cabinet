/**
 * The scene camera (tilted view T13, T6, A1, A11, A13). Every
 * expected value was worked out in double precision from the design record's
 * formulas, independently of this module, and carried here by slice 1's entry.
 */

import { describe, expect, it } from 'vitest';

import {
  columnToGround,
  groundToColumn,
  makeCamera,
  visibleGround,
} from '../camera';
import { SHORTEST_FIELD } from '../../../../game/field';
import { sceneFor } from '../scene';

// The shortest field's scene, the one this file's values were pinned on (tilted view A34).
const { camera: SHORTEST_CAMERA, column: SHORTEST_COLUMN } =
  sceneFor(SHORTEST_FIELD);

const CLOSE = 1e-6;
const EXACT = 1e-9;

/** Asserts a value within a tolerance, naming both figures when it is not. */
const expectNear = (actual: number, expected: number, tolerance: number) =>
  expect(
    Math.abs(actual - expected),
    `${actual} against ${expected}`,
  ).toBeLessThanOrEqual(tolerance);

describe('the scene camera (tilted view T13, T6, A11)', () => {
  it('the scene camera stands 351 field units up, at 25 degrees, looking at the column centre', () => {
    // T13 is the tilt and the height: 13 half-lengths of the starting grave of
    // 27, read off Mark's phone on tilt 13. T6 and A1: it looks at the ground
    // under the column's centre.
    expectNear(SHORTEST_CAMERA.height, 351, CLOSE);
    expectNear(SHORTEST_CAMERA.tilt, (25 * Math.PI) / 180, CLOSE);
    expectNear(SHORTEST_CAMERA.distance, 387.2856495558, CLOSE);
    expectNear(SHORTEST_CAMERA.lean, 0.906307787, CLOSE);
    expectNear(SHORTEST_CAMERA.rise, 0.4226182617, CLOSE);
    expectNear(SHORTEST_CAMERA.target.x, 270, CLOSE);
    expectNear(SHORTEST_CAMERA.target.y, 380, CLOSE);
  });

  it('the ground under the column centre draws at the centre at scale one', () => {
    // A3: one field unit draws as one column unit at the target.
    const at = groundToColumn(SHORTEST_CAMERA, 270, 380);
    expectNear(at.x, 270, CLOSE);
    expectNear(at.y, 380, CLOSE);
    expectNear(at.scale, 1, CLOSE);
  });

  it('the middle row keeps its x: ground (0, 380) draws at (0, 380) at scale one', () => {
    // A3: the column's middle row is still field x 0 to 540 at y 380.
    const at = groundToColumn(SHORTEST_CAMERA, 0, 380);
    expectNear(at.x, 0, CLOSE);
    expectNear(at.y, 380, CLOSE);
    expectNear(at.scale, 1, CLOSE);
  });

  it("the grave's starting point, ground (270, 608), draws at (270, 655.077721) at scale 1.331205", () => {
    // Design record "Values are data": nearer ground draws larger.
    const at = groundToColumn(SHORTEST_CAMERA, 270, 608);
    expectNear(at.x, 270, CLOSE);
    expectNear(at.y, 655.077721, CLOSE);
    expectNear(at.scale, 1.331205, CLOSE);
  });

  it('a far point, ground (100, 100), draws at (139.786161, 185.624302) at scale 0.765964', () => {
    // T2: far things draw smaller and toward the middle.
    const at = groundToColumn(SHORTEST_CAMERA, 100, 100);
    expectNear(at.x, 139.786161, CLOSE);
    expectNear(at.y, 185.624302, CLOSE);
    expectNear(at.scale, 0.765964, CLOSE);
  });

  it('a near point, ground (400, 700), draws at (469.752322, 825.629747) at scale 1.536556', () => {
    // T2: near things draw larger and away from the middle.
    const at = groundToColumn(SHORTEST_CAMERA, 400, 700);
    expectNear(at.x, 469.752322, CLOSE);
    expectNear(at.y, 825.629747, CLOSE);
    expectNear(at.scale, 1.536556, CLOSE);
  });

  it('farther up the field draws smaller: over ground y from -392 to 667 in steps of 10, the scale strictly rises', () => {
    // Tilt 2's lesson: only a pinhole camera, where far draws smaller, reads as tilted.
    let previous = -Infinity;
    for (let y = -392; y <= 667; y += 10) {
      const { scale } = groundToColumn(SHORTEST_CAMERA, 270, y);
      expect(scale).toBeGreaterThan(previous);
      previous = scale;
    }
  });

  it('column to ground is the exact inverse of ground to column over a 9 by 9 grid of the column', () => {
    // T9 and A11: steering converts through the camera's exact inverse.
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const x = (SHORTEST_COLUMN.width * i) / 8;
        const y = (SHORTEST_COLUMN.height * j) / 8;
        const ground = columnToGround(SHORTEST_CAMERA, x, y);
        expect(ground).not.toBeNull();
        const back = groundToColumn(SHORTEST_CAMERA, ground!.x, ground!.y);
        expectNear(back.x, x, EXACT);
        expectNear(back.y, y, EXACT);
      }
    }
  });

  it("the column's four corners show ground (-227.728368, -392.923505), (767.728368, -392.923505), (84.755791, 667.666150), (455.244209, 667.666150)", () => {
    // A2: the field is the trapezoid the column sees.
    const corners = [
      [0, 0, -227.728368, -392.923505],
      [540, 0, 767.728368, -392.923505],
      [0, 760, 84.755791, 667.66615],
      [540, 760, 455.244209, 667.66615],
    ] as const;
    for (const [cx, cy, gx, gy] of corners) {
      const ground = columnToGround(SHORTEST_CAMERA, cx, cy);
      expect(ground).not.toBeNull();
      expectNear(ground!.x, gx, CLOSE);
      expectNear(ground!.y, gy, CLOSE);
    }
  });

  it('a column point above the horizon shows no ground: column (270, -451) is null, column (270, -450) is not', () => {
    // The horizon is 830.54 column units above the middle row (design record table).
    expect(columnToGround(SHORTEST_CAMERA, 270, -451)).toBeNull();
    expect(columnToGround(SHORTEST_CAMERA, 270, -450)).not.toBeNull();
  });

  it('the ground the 540 by 760 column shows is the trapezoid top -392.923505, bottom 667.666150, far row -227.728368 to 767.728368, near row 84.755791 to 455.244209', () => {
    // A2 and A13: these six numbers are the field slice 7 writes into src/game.
    const ground = visibleGround(SHORTEST_CAMERA, SHORTEST_COLUMN);
    expectNear(ground.top, -392.923505, CLOSE);
    expectNear(ground.bottom, 667.66615, CLOSE);
    expectNear(ground.farLeft, -227.728368, CLOSE);
    expectNear(ground.farRight, 767.728368, CLOSE);
    expectNear(ground.nearLeft, 84.755791, CLOSE);
    expectNear(ground.nearRight, 455.244209, CLOSE);
  });

  it("the trapezoid's sides are straight: the ground under column x 0 at rows 0, 190, 380, 570 and 760 lies on the line through the first and last", () => {
    // A2: a screen column's edge projects to a straight line on the ground, so
    // the sim's field is six numbers and two straight lines.
    const rows = [0, 190, 380, 570, 760];
    const points = rows.map((row) => columnToGround(SHORTEST_CAMERA, 0, row)!);
    const first = points[0]!;
    const last = points[points.length - 1]!;
    for (const point of points) {
      const share = (point.y - first.y) / (last.y - first.y);
      expectNear(point.x, first.x + share * (last.x - first.x), EXACT);
    }
  });

  it("ground beyond the camera's nearest share is held there and never draws at an infinite size: ground y 2700 and ground y 1e9 both draw at scale 1 / 0.12", () => {
    // The prototype's NEAREST_SHARE guard: ground at or behind the camera's
    // feet is held, so nothing is ever handed an infinity to draw with.
    expectNear(
      groundToColumn(SHORTEST_CAMERA, 270, 2700).scale,
      1 / 0.12,
      CLOSE,
    );
    expectNear(
      groundToColumn(SHORTEST_CAMERA, 270, 1e9).scale,
      1 / 0.12,
      CLOSE,
    );
  });

  it('at a tilt of zero the camera looks straight down: lean one, rise zero, and ground (100, 100) draws at (100, 100) at scale one', () => {
    // The tilt is the only thing that makes the ground lean: straight down, the
    // column is the field.
    const straightDown = makeCamera(0, 42.5, 27, SHORTEST_COLUMN);
    expectNear(straightDown.lean, 1, EXACT);
    expectNear(straightDown.rise, 0, EXACT);
    const at = groundToColumn(straightDown, 100, 100);
    expectNear(at.x, 100, EXACT);
    expectNear(at.y, 100, EXACT);
    expectNear(at.scale, 1, EXACT);
  });
});
