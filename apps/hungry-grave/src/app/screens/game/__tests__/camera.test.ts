/**
 * The scene camera (tilted view T2, T3, T6, A1, A6, A9, A11, A13). Every
 * expected value was worked out in double precision from the design record's
 * formulas, independently of this module, and carried here by slice 1's entry.
 */

import { describe, expect, it } from 'vitest';

import {
  COLUMN,
  SCENE_CAMERA,
  bladeReach,
  columnToGround,
  groundToColumn,
  makeCamera,
  stanceOverGrave,
  stepOnColumn,
  visibleGround,
} from '../camera';

const CLOSE = 1e-6;
const EXACT = 1e-9;

/** Asserts a value within a tolerance, naming both figures when it is not. */
const expectNear = (actual: number, expected: number, tolerance: number) =>
  expect(
    Math.abs(actual - expected),
    `${actual} against ${expected}`,
  ).toBeLessThanOrEqual(tolerance);

describe('the scene camera (tilted view T2, T3, T6, A6, A9, A11)', () => {
  it('the scene camera stands 1147.5 field units up, at 32.5 degrees, looking at the column centre', () => {
    // T2 is the tilt and T3 the height: 42.5 half-lengths of the starting grave
    // of 27. T6 and A1: it looks at the ground under the column's centre.
    expectNear(SCENE_CAMERA.height, 1147.5, CLOSE);
    expectNear(SCENE_CAMERA.tilt, (32.5 * Math.PI) / 180, CLOSE);
    expectNear(SCENE_CAMERA.distance, 1360.5781819307, CLOSE);
    expectNear(SCENE_CAMERA.lean, 0.8433914458, CLOSE);
    expectNear(SCENE_CAMERA.rise, 0.5372996083, CLOSE);
    expectNear(SCENE_CAMERA.target.x, 270, CLOSE);
    expectNear(SCENE_CAMERA.target.y, 380, CLOSE);
  });

  it('the ground under the column centre draws at the centre at scale one', () => {
    // A3: one field unit draws as one column unit at the target.
    const at = groundToColumn(SCENE_CAMERA, 270, 380);
    expectNear(at.x, 270, CLOSE);
    expectNear(at.y, 380, CLOSE);
    expectNear(at.scale, 1, CLOSE);
  });

  it('the middle row keeps its x: ground (0, 380) draws at (0, 380) at scale one', () => {
    // A3: the column's middle row is still field x 0 to 540 at y 380.
    const at = groundToColumn(SCENE_CAMERA, 0, 380);
    expectNear(at.x, 0, CLOSE);
    expectNear(at.y, 380, CLOSE);
    expectNear(at.scale, 1, CLOSE);
  });

  it("the grave's starting point, ground (270, 608), draws at (270, 591.320185) at scale 1.098947", () => {
    // Design record "Values are data": nearer ground draws larger.
    const at = groundToColumn(SCENE_CAMERA, 270, 608);
    expectNear(at.x, 270, CLOSE);
    expectNear(at.y, 591.320185, CLOSE);
    expectNear(at.scale, 1.098947, CLOSE);
  });

  it('a far point, ground (100, 100), draws at (116.925935, 167.362471) at scale 0.900436', () => {
    // T2: far things draw smaller and toward the middle.
    const at = groundToColumn(SCENE_CAMERA, 100, 100);
    expectNear(at.x, 116.925935, CLOSE);
    expectNear(at.y, 167.362471, CLOSE);
    expectNear(at.scale, 0.900436, CLOSE);
  });

  it('a near point, ground (400, 700), draws at (418.804365, 688.923885) at scale 1.144649', () => {
    // T2: near things draw larger and away from the middle.
    const at = groundToColumn(SCENE_CAMERA, 400, 700);
    expectNear(at.x, 418.804365, CLOSE);
    expectNear(at.y, 688.923885, CLOSE);
    expectNear(at.scale, 1.144649, CLOSE);
  });

  it('farther up the field draws smaller: over ground y from -168 to 762 in steps of 10, the scale strictly rises', () => {
    // Tilt 2's lesson: only a pinhole camera, where far draws smaller, reads as tilted.
    let previous = -Infinity;
    for (let y = -168; y <= 762; y += 10) {
      const { scale } = groundToColumn(SCENE_CAMERA, 270, y);
      expect(scale).toBeGreaterThan(previous);
      previous = scale;
    }
  });

  it('column to ground is the exact inverse of ground to column over a 9 by 9 grid of the column', () => {
    // T9 and A11: steering converts through the camera's exact inverse.
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const x = (COLUMN.width * i) / 8;
        const y = (COLUMN.height * j) / 8;
        const ground = columnToGround(SCENE_CAMERA, x, y);
        expect(ground).not.toBeNull();
        const back = groundToColumn(SCENE_CAMERA, ground!.x, ground!.y);
        expectNear(back.x, x, EXACT);
        expectNear(back.y, y, EXACT);
      }
    }
  });

  it("the column's four corners show ground (-58.438897, -168.081604), (598.438897, -168.081604), (40.784202, 762.503300), (499.215798, 762.503300)", () => {
    // A2: the field is the trapezoid the column sees.
    const corners = [
      [0, 0, -58.438897, -168.081604],
      [540, 0, 598.438897, -168.081604],
      [0, 760, 40.784202, 762.5033],
      [540, 760, 499.215798, 762.5033],
    ] as const;
    for (const [cx, cy, gx, gy] of corners) {
      const ground = columnToGround(SCENE_CAMERA, cx, cy);
      expect(ground).not.toBeNull();
      expectNear(ground!.x, gx, CLOSE);
      expectNear(ground!.y, gy, CLOSE);
    }
  });

  it('a column point above the horizon shows no ground: column (270, -1756) is null, column (270, -1755) is not', () => {
    // The horizon is 2135.7 column units above the middle row (design record table).
    expect(columnToGround(SCENE_CAMERA, 270, -1756)).toBeNull();
    expect(columnToGround(SCENE_CAMERA, 270, -1755)).not.toBeNull();
  });

  it('the ground the 540 by 760 column shows is the trapezoid top -168.081604, bottom 762.503300, far row -58.438897 to 598.438897, near row 40.784202 to 499.215798', () => {
    // A2 and A13: these six numbers are the field slice 7 writes into src/game.
    const ground = visibleGround(SCENE_CAMERA, COLUMN);
    expectNear(ground.top, -168.081604, CLOSE);
    expectNear(ground.bottom, 762.5033, CLOSE);
    expectNear(ground.farLeft, -58.438897, CLOSE);
    expectNear(ground.farRight, 598.438897, CLOSE);
    expectNear(ground.nearLeft, 40.784202, CLOSE);
    expectNear(ground.nearRight, 499.215798, CLOSE);
  });

  it("the trapezoid's sides are straight: the ground under column x 0 at rows 0, 190, 380, 570 and 760 lies on the line through the first and last", () => {
    // A2: a screen column's edge projects to a straight line on the ground, so
    // the sim's field is six numbers and two straight lines.
    const rows = [0, 190, 380, 570, 760];
    const points = rows.map((row) => columnToGround(SCENE_CAMERA, 0, row)!);
    const first = points[0]!;
    const last = points[points.length - 1]!;
    for (const point of points) {
      const share = (point.y - first.y) / (last.y - first.y);
      expectNear(point.x, first.x + share * (last.x - first.x), EXACT);
    }
  });

  it('the camera over the starting grave, (270, 608) at size 27, stands 42.5 half-lengths up and 18.631042 half-lengths toward the bottom, straight behind', () => {
    // A6: the hole is cut from the scene camera, in the grave's half-lengths.
    const stance = stanceOverGrave(SCENE_CAMERA, { x: 270, y: 608, size: 27 });
    expectNear(stance.cameraHeight, 42.5, CLOSE);
    expectNear(stance.nadirX, 0, CLOSE);
    expectNear(stance.nadirY, 18.631042, CLOSE);
  });

  it('the camera over a grave at (100, 200) at size 27 stands 6.296296 half-lengths to its right and 33.742153 toward the bottom', () => {
    // A6: away from the middle, the scene camera stands off to one side too.
    const stance = stanceOverGrave(SCENE_CAMERA, { x: 100, y: 200, size: 27 });
    expectNear(stance.cameraHeight, 42.5, CLOSE);
    expectNear(stance.nadirX, 6.296296, CLOSE);
    expectNear(stance.nadirY, 33.742153, CLOSE);
  });

  it("the camera's height never follows the live grave: over a grave of size 48 it is 23.90625 half-lengths up, and over a ceiling grave of 67.5 it is 17", () => {
    // T3 and A6: 1147.5 field units whatever the grave's size.
    expectNear(
      stanceOverGrave(SCENE_CAMERA, { x: 270, y: 608, size: 48 }).cameraHeight,
      23.90625,
      CLOSE,
    );
    expectNear(
      stanceOverGrave(SCENE_CAMERA, { x: 270, y: 608, size: 67.5 })
        .cameraHeight,
      17,
      CLOSE,
    );
  });

  it("a step on the column moves the grave's drawn point by exactly that step", () => {
    // T9 and A11: a drag and a key are steps on the glass.
    const starts = [
      { x: 270, y: 380 },
      { x: 40, y: 700 },
      { x: 500, y: -100 },
    ];
    for (const from of starts) {
      const drawn = groundToColumn(SCENE_CAMERA, from.x, from.y);
      const landed = stepOnColumn(SCENE_CAMERA, from, { x: 12, y: -7 });
      expect(landed).not.toBeNull();
      const drawnAfter = groundToColumn(SCENE_CAMERA, landed!.x, landed!.y);
      expectNear(drawnAfter.x, drawn.x + 12, EXACT);
      expectNear(drawnAfter.y, drawn.y - 7, EXACT);
    }
  });

  it("a straight-up step never moves the drawn point sideways: from ground (40, 700), a step of (0, -10) lands at ground (39.055288, 690.913296), which draws at x 6.730739, the start's own x", () => {
    // T9 and A11: tilt 5's drift toward the vanishing point is what this rules out.
    const landed = stepOnColumn(
      SCENE_CAMERA,
      { x: 40, y: 700 },
      { x: 0, y: -10 },
    );
    expect(landed).not.toBeNull();
    expectNear(landed!.x, 39.055288, CLOSE);
    expectNear(landed!.y, 690.913296, CLOSE);
    expectNear(
      groundToColumn(SCENE_CAMERA, landed!.x, landed!.y).x,
      6.730739,
      CLOSE,
    );
    expectNear(groundToColumn(SCENE_CAMERA, 40, 700).x, 6.730739, CLOSE);
  });

  it('a step past the horizon has no ground: from ground (270, 380), a step of (0, -2200) is null', () => {
    // The horizon is 2135.7 column units above the middle row.
    expect(
      stepOnColumn(SCENE_CAMERA, { x: 270, y: 380 }, { x: 0, y: -2200 }),
    ).toBeNull();
  });

  it("ground beyond the camera's nearest share is held there and never draws at an infinite size: ground y 2700 and ground y 1e9 both draw at scale 1 / 0.12", () => {
    // The prototype's NEAREST_SHARE guard: ground at or behind the camera's
    // feet is held, so nothing is ever handed an infinity to draw with.
    expectNear(groundToColumn(SCENE_CAMERA, 270, 2700).scale, 1 / 0.12, CLOSE);
    expectNear(groundToColumn(SCENE_CAMERA, 270, 1e9).scale, 1 / 0.12, CLOSE);
  });

  it('at a tilt of zero the camera looks straight down: lean one, rise zero, and ground (100, 100) draws at (100, 100) at scale one', () => {
    // The tilt is the only thing that makes the ground lean: straight down, the
    // column is the field.
    const straightDown = makeCamera(0, 42.5, 27, COLUMN);
    expectNear(straightDown.lean, 1, EXACT);
    expectNear(straightDown.rise, 0, EXACT);
    const at = groundToColumn(straightDown, 100, 100);
    expectNear(at.x, 100, EXACT);
    expectNear(at.y, 100, EXACT);
    expectNear(at.scale, 1, EXACT);
  });

  it("a grass blade at 32.5 degrees draws 1.348502 times as long as build 7's, and at build 7's own angle, 12.197480 degrees, exactly as long", () => {
    // A9: a blade leans back 62 degrees, and the tilt shows more of it.
    expectNear(bladeReach(SCENE_CAMERA), 1.348502, CLOSE);
    expectNear(bladeReach(makeCamera(12.19748, 42.5, 27, COLUMN)), 1, CLOSE);
  });
});
