// The run's drawing geometry: the camera Mark tuned, stood over the run's own column (tilted view A34).

import { describe, expect, it } from 'vitest';

import { fieldOfHeight, SHORTEST_FIELD } from '../../../../game/field';
import { visibleGround } from '../camera';
import { sceneFor } from '../scene';

// Six places, the precision the design record's tables are written to.
const CLOSE = 6;

describe("a run's scene", () => {
  it("is drawn into its field's own column, with Mark's camera looking at the column's centre", () => {
    // A34, and the design record's "Values are data" tables: the ground under
    // the top and bottom rows of the 760 column, and of the 1168 column a 390
    // by 844 phone gives, which is tilt 9's own view on that phone.
    const short = sceneFor(SHORTEST_FIELD);
    expect(short.field).toBe(SHORTEST_FIELD);
    expect(short.column).toEqual({ width: 540, height: 760 });
    expect(short.camera.target).toEqual({ x: 270, y: 380 });
    const shortGround = visibleGround(short.camera, short.column);
    expect(shortGround.top).toBeCloseTo(-168.081604, CLOSE);
    expect(shortGround.bottom).toBeCloseTo(762.5033, CLOSE);

    const tall = sceneFor(fieldOfHeight(1168));
    expect(tall.column).toEqual({ width: 540, height: 1168 });
    expect(tall.camera.target).toEqual({ x: 270, y: 584 });
    const tallGround = visibleGround(tall.camera, tall.column);
    expect(tallGround.top).toBeCloseTo(-369.054371, CLOSE);
    expect(tallGround.bottom).toBeCloseTo(1127.753451, CLOSE);

    // Mark's two values (T2, T3), the same over every column.
    expect(tall.camera.height).toBeCloseTo(1147.5, CLOSE);
    expect(tall.camera.lean).toBeCloseTo(0.843391, CLOSE);
  });

  it("carries the camera's scale at its column's bottom row", () => {
    // A34 and A10: the hole and the ground are baked for the column's nearest
    // row, where they draw largest. The record's tables: 1.177929 at the
    // bottom row of the 760 column, 1.273449 at the bottom row of the 1168 one.
    expect(sceneFor(SHORTEST_FIELD).nearestScale).toBeCloseTo(1.177929, CLOSE);
    expect(sceneFor(fieldOfHeight(1168)).nearestScale).toBeCloseTo(
      1.273449,
      CLOSE,
    );
  });
});
