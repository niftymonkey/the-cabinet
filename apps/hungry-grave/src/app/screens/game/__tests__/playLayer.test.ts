// The play layer's math (tilted view T10, T11, T12, A18, A20), pinned against the design record's play layer tables.

import { describe, expect, it } from 'vitest';

import { FIELD_WIDTH, fieldOfHeight } from '../../../../game/field';
import { groundToColumn } from '../camera';
import {
  circleOutline,
  columnToPlay,
  groundUnderPlay,
  OUTLINE_STEP,
  playToColumn,
  stretchAlong,
  traceOnColumn,
} from '../playLayer';
import { sceneFor } from '../scene';

const SHORT = sceneFor(fieldOfHeight(760));
const TALL = sceneFor(fieldOfHeight(1168));

const CLOSE = 1e-6;
const EXACT = 1e-9;

/** Asserts a value within a tolerance, naming both figures when it is not. */
const expectNear = (actual: number, expected: number, tolerance: number) =>
  expect(
    Math.abs(actual - expected),
    `${actual} against ${expected}`,
  ).toBeLessThanOrEqual(tolerance);

/** Asserts where a field point draws on a scene's play layer, and at what scale. */
const expectDrawsAt = (
  scene: typeof SHORT,
  field: readonly [number, number],
  column: readonly [number, number],
  scale: number,
) => {
  const on = playToColumn(scene.playLayer, field[0], field[1]);
  expectNear(on.x, column[0], CLOSE);
  expectNear(on.y, column[1], CLOSE);
  expectNear(on.scale, scale, CLOSE);
};

/** Asserts that a play thing at each field y sits on the camera's own row for the ground y under it. */
const expectOnCameraRows = (scene: typeof SHORT, ys: readonly number[]) => {
  const { camera, top, stretch } = scene.playLayer;
  for (const y of ys) {
    const row = groundToColumn(camera, camera.target.x, top + stretch * y).y;
    expectNear(playToColumn(scene.playLayer, 77, y).y, row, EXACT);
  }
};

/** Asserts that column to play undoes play to column over a 9 by 9 grid of the scene's column. */
const expectInverseOnGrid = (scene: typeof SHORT) => {
  const { width, height } = scene.column;
  for (let i = 0; i <= 8; i += 1) {
    for (let j = 0; j <= 8; j += 1) {
      const x = (width * i) / 8;
      const y = (height * j) / 8;
      const field = columnToPlay(scene.playLayer, x, y);
      expect(field).not.toBeNull();
      const back = playToColumn(scene.playLayer, field?.x ?? 0, field?.y ?? 0);
      expectNear(back.x, x, EXACT);
      expectNear(back.y, y, EXACT);
    }
  }
};

/** Asserts the play layer's rows per field unit along at each field y. */
const expectRowsAlong = (
  scene: typeof SHORT,
  rows: readonly (readonly [number, number])[],
) => {
  for (const [y, along] of rows) {
    expectNear(stretchAlong(scene.playLayer, y), along, CLOSE);
  }
};

/** One coordinate of a flat point list, NaN past its end so an assertion names the miss. */
const coordinate = (flat: readonly number[], at: number): number =>
  flat[at] ?? Number.NaN;

/** The field point a traced column point shows, which a traced point always has. */
const fieldOfTraced = (
  scene: typeof SHORT,
  traced: readonly number[],
  i: number,
) => {
  const field = columnToPlay(
    scene.playLayer,
    coordinate(traced, 2 * i),
    coordinate(traced, 2 * i + 1),
  );
  expect(field).not.toBeNull();
  return field ?? { x: Number.NaN, y: Number.NaN };
};

/** The largest step, in field units, between consecutive traced points. */
const longestStep = (
  scene: typeof SHORT,
  traced: readonly number[],
): number => {
  let longest = 0;
  for (let i = 1; i < traced.length / 2; i += 1) {
    const a = fieldOfTraced(scene, traced, i - 1);
    const b = fieldOfTraced(scene, traced, i);
    longest = Math.max(longest, Math.hypot(b.x - a.x, b.y - a.y));
  }
  return longest;
};

/** Asserts how a 40 unit square traces, open and closed, on a scene's play layer. */
const expectTracedSquare = (scene: typeof SHORT) => {
  const square = [
    { x: 100, y: 300 },
    { x: 140, y: 300 },
    { x: 140, y: 340 },
    { x: 100, y: 340 },
  ];
  const open = traceOnColumn(scene.playLayer, square, false);
  const closed = traceOnColumn(scene.playLayer, square, true);
  const start = playToColumn(scene.playLayer, 100, 300);
  const end = playToColumn(scene.playLayer, 100, 340);
  for (const traced of [open, closed]) {
    expectNear(coordinate(traced, 0), start.x, EXACT);
    expectNear(coordinate(traced, 1), start.y, EXACT);
    expect(longestStep(scene, traced)).toBeLessThanOrEqual(
      OUTLINE_STEP + EXACT,
    );
  }
  // Open, it ends on the outline's last point; closed, it walks the closing
  // edge back to within one step of where it began.
  expectNear(coordinate(open, open.length - 2), end.x, EXACT);
  expectNear(coordinate(open, open.length - 1), end.y, EXACT);
  const last = fieldOfTraced(scene, closed, closed.length / 2 - 1);
  expect(last.x).toBe(100);
  expect(last.y).toBeLessThanOrEqual(300 + OUTLINE_STEP + EXACT);
  expect(last.y).toBeGreaterThan(300);
};

/** Whether a column point lies inside a flat polygon, by the even-odd rule. */
const insidePolygon = (polygon: readonly number[], x: number, y: number) => {
  let inside = false;
  const count = polygon.length / 2;
  for (let i = 0, j = count - 1; i < count; j = i, i += 1) {
    const [xi, yi] = [
      coordinate(polygon, 2 * i),
      coordinate(polygon, 2 * i + 1),
    ];
    const [xj, yj] = [
      coordinate(polygon, 2 * j),
      coordinate(polygon, 2 * j + 1),
    ];
    const crosses =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
};

/** Asserts that points one unit inside and outside traced circles draw inside and outside. */
const expectCirclesHold = (
  scene: typeof SHORT,
  centres: readonly (readonly [number, number])[],
) => {
  for (const [cx, cy] of centres) {
    for (const radius of [32, 104, 270]) {
      const traced = traceOnColumn(
        scene.playLayer,
        circleOutline(cx, cy, radius),
        true,
      );
      for (let degree = 0; degree < 360; degree += 1) {
        const angle = (degree * Math.PI) / 180;
        for (const [reach, want] of [
          [radius - 1, true],
          [radius + 1, false],
        ] as const) {
          const drawn = playToColumn(
            scene.playLayer,
            cx + reach * Math.cos(angle),
            cy + reach * Math.sin(angle),
          );
          expect(
            insidePolygon(traced, drawn.x, drawn.y),
            `radius ${radius} at (${cx}, ${cy}), ${degree} degrees, reach ${reach}`,
          ).toBe(want);
        }
      }
    }
  }
};

describe('the play layer on the 760 field (tilted view A18)', () => {
  it("the 760 field's play layer reads the field's top as the ground under the top row and stretches it 1.224454 along: top -168.081604", () => {
    // A18: field y reads as the ground y top + stretch * y, the ground the
    // column's centre shows from the top row to the bottom row.
    expectNear(SHORT.playLayer.top, -168.081604, CLOSE);
    expectNear(SHORT.playLayer.stretch, 1.224454, CLOSE);
    expect(SHORT.playLayer.camera).toBe(SHORT.camera);
  });
  it("the field's top row and bottom row are the column's: field (0, 0) draws at (0, 0) at scale 0.822071, and field (540, 760) at (540, 760) at scale 1.177929", () => {
    // A18, T10: the 540 by 760 field is the viewport, top row to bottom row.
    expectDrawsAt(SHORT, [0, 0], [0, 0], 0.822071);
    expectDrawsAt(SHORT, [540, 760], [540, 760], 1.177929);
  });
  it('across, a field unit is a column unit at every row: field x 0, 135, 270, 405 and 540 draw at those column x at field y 0, 190, 380, 608 and 760', () => {
    // T10: straight down the field is straight down the glass.
    for (const y of [0, 190, 380, 608, 760]) {
      for (const x of [0, 135, 270, 405, 540]) {
        expect(playToColumn(SHORT.playLayer, x, y).x).toBe(x);
      }
    }
  });
  it("the grave's start, field (270, 608), draws at (270, 559.555815) at scale 1.084074", () => {
    // A18, the design record's play layer table.
    expectDrawsAt(SHORT, [270, 608], [270, 559.555815], 1.084074);
  });
  it('field (100, 100) draws at (100, 72.678500) at scale 0.856101, and field (400, 700) at (400, 676.868170) at scale 1.139004', () => {
    // A18, A19, the design record's play layer table.
    expectDrawsAt(SHORT, [100, 100], [100, 72.6785], 0.856101);
    expectDrawsAt(SHORT, [400, 700], [400, 676.86817], 1.139004);
  });
  it("a play thing sits on the camera's own row: for field y 0, 100, 380, 608 and 760, the row groundToColumn gives the ground y under it on the column's centre", () => {
    // T11 (A28 ruled): the play layer's rows are the camera's own rows.
    expectOnCameraRows(SHORT, [0, 100, 380, 608, 760]);
  });
  it('column to play is the exact inverse of play to column: every point of a 9 by 9 grid over the column comes back within 1e-9, and column (123, 456) is field (123, 518.678147)', () => {
    // A18: the mapping is a fraction of two linear functions of field y, so it
    // is exact both ways; slice C's drag goes through the inverse (T9).
    expectInverseOnGrid(SHORT);
    const field = columnToPlay(SHORT.playLayer, 123, 456);
    expectNear(field?.x ?? Number.NaN, 123, CLOSE);
    expectNear(field?.y ?? Number.NaN, 518.678147, CLOSE);
  });
  it('a column point above the horizon has no field point: column (270, -1756) is null and (270, -1755) is not', () => {
    // The design record: the horizon is column row -1755.68 on the 760 column.
    expect(columnToPlay(SHORT.playLayer, 270, -1756)).toBeNull();
    expect(columnToPlay(SHORT.playLayer, 270, -1755)).not.toBeNull();
  });
  it('the ground under a play thing is the ground the camera shows where it draws: field (0, 608) is over ground (20.939582, 576.386319), (540, 608) over (519.060418, 576.386319), (270, 380) over (270, 297.210848)', () => {
    // A23: the grave's hole is cut from the ground under its placed point.
    for (const [field, ground] of [
      [
        [0, 608],
        [20.939582, 576.386319],
      ],
      [
        [540, 608],
        [519.060418, 576.386319],
      ],
      [
        [270, 380],
        [270, 297.210848],
      ],
    ] as const) {
      const under = groundUnderPlay(SHORT.playLayer, field[0], field[1]);
      expectNear(under.x, ground[0], CLOSE);
      expectNear(under.y, ground[1], CLOSE);
    }
  });
  it('rows per field unit along: 0.697895 at field y 0, 0.968341 at 380, 1.213640 at 608, 1.432881 at 760', () => {
    // A18: the rows spread toward the bottom of the column.
    expectRowsAlong(SHORT, [
      [0, 0.697895],
      [380, 0.968341],
      [608, 1.21364],
      [760, 1.432881],
    ]);
  });
  it('a traced outline has no step longer than OUTLINE_STEP, begins where the outline begins, and closes when asked to', () => {
    // A20: every point of an area's outline, straight edges included, goes
    // through the play layer at steps of at most 4 field units.
    expect(OUTLINE_STEP).toBe(4);
    expectTracedSquare(SHORT);
  });
  it('a field point one unit inside a traced circle of radius 32, 104 and 270 draws inside the traced polygon, and one unit outside draws outside, all around the circle, for circles centred at field (20, 608), (270, 608), (520, 608), (270, 100) and (270, 740)', () => {
    // A20: a body drawn inside the drawn shape is a body the sim counts inside.
    expectCirclesHold(SHORT, [
      [20, 608],
      [270, 608],
      [520, 608],
      [270, 100],
      [270, 740],
    ]);
  });
  it("the field's width is the column's on every field: FIELD_WIDTH equals the scene's column width at 760, 1168 and 1260", () => {
    // A18: this is what lets field x be column x.
    for (const height of [760, 1168, 1260]) {
      expect(sceneFor(fieldOfHeight(height)).column.width).toBe(FIELD_WIDTH);
    }
  });
});

describe('the play layer on the 1168 field (tilted view T12)', () => {
  it("the 1168 field's play layer reads its top as the ground under the top row, -369.054371, and stretches it 1.281514 along; field (0, 0) draws at (0, 0) at scale 0.726551 and field (540, 1168) at (540, 1168) at scale 1.273449", () => {
    // A18, T12: the design record's second play layer table.
    expectNear(TALL.playLayer.top, -369.054371, CLOSE);
    expectNear(TALL.playLayer.stretch, 1.281514, CLOSE);
    expectDrawsAt(TALL, [0, 0], [0, 0], 0.726551);
    expectDrawsAt(TALL, [540, 1168], [540, 1168], 1.273449);
  });
  it("the grave's start on the 1168 field, (270, 1016), draws at (270, 925.353867) at scale 1.159834; field (100, 100) at (100, 59.231661) at 0.754285; field (400, 1108) at (400, 1066.751116) at 1.226041", () => {
    // A18, T12: the design record's second play layer table.
    expectDrawsAt(TALL, [270, 1016], [270, 925.353867], 1.159834);
    expectDrawsAt(TALL, [100, 100], [100, 59.231661], 0.754285);
    expectDrawsAt(TALL, [400, 1108], [400, 1066.751116], 1.226041);
  });
  it('rows per field unit along on the 1168 field: 0.570538 at field y 0, 0.925226 at 584, 1.453931 at 1016, 1.752733 at 1168', () => {
    // A18, T12: the design record's second play layer table.
    expectRowsAlong(TALL, [
      [0, 0.570538],
      [584, 0.925226],
      [1016, 1.453931],
      [1168, 1.752733],
    ]);
  });
  it("on the 1168 field column (123, 700) is field (123, 845.491370), and the camera's rows, the exact inverse, the traced outline and the traced circles hold there as on the 760 field", () => {
    // A18, T12: the play layer is the same function on every shape.
    const field = columnToPlay(TALL.playLayer, 123, 700);
    expectNear(field?.x ?? Number.NaN, 123, CLOSE);
    expectNear(field?.y ?? Number.NaN, 845.49137, CLOSE);
    expectOnCameraRows(TALL, [0, 100, 584, 1016, 1168]);
    expectInverseOnGrid(TALL);
    expectTracedSquare(TALL);
    expectCirclesHold(TALL, [
      [20, 1016],
      [270, 1016],
      [520, 1016],
      [270, 100],
      [270, 1148],
    ]);
  });
});
