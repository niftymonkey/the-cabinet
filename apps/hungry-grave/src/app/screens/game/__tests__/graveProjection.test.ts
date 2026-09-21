/**
 * The one projection the hole is built from (design record R4). Pure
 * arithmetic in the grave's own half-lengths, with every expected value worked
 * by hand from the formulas in the record rather than read off the code.
 */

import { describe, expect, it } from 'vitest';

import { GRAVE_VIEW } from '../graveDrawingValues';
import { belowGround, lightAtDepth } from '../graveProjection';

describe('the grave projection (grave-in-the-ground R4)', () => {
  it('a point on the ground draws where it stands', () => {
    // R4: the projection is the camera's ray through a point below the ground.
    // At no depth the ray is the point, so the ground is its own drawing and the
    // mouth's own rectangle is undistorted.
    //
    // Close and not equal on the second axis: the record's own form computes the
    // spot as the setback plus a shrunk offset from it, and at a shrink of one
    // that round trip costs the last bit of a double. The drift is 2e-16 of the
    // grave's half-length, which is 1e-14 field units at the size ceiling.
    const far = belowGround(0.5, -1, 0, GRAVE_VIEW);
    expect(far.x).toBe(0.5);
    expect(far.y).toBeCloseTo(-1, 12);
    const near = belowGround(-0.5, 1, 0, GRAVE_VIEW);
    expect(near.x).toBe(-0.5);
    expect(near.y).toBeCloseTo(1, 12);
  });

  it('a deeper point draws nearer the spot the camera stands over, on both axes', () => {
    // The shrink toward the spot the camera stands over is the only thing that
    // makes a side wall visible at all, and it has to act on both axes or the
    // far wall would be a band with no sides to it.
    const lip = belowGround(0.5, -1, 0, GRAVE_VIEW);
    const deeper = belowGround(0.5, -1, 0.6, GRAVE_VIEW);
    const deepest = belowGround(0.5, -1, 1.2, GRAVE_VIEW);

    expect(deeper.x).toBeLessThan(lip.x);
    expect(deepest.x).toBeLessThan(deeper.x);
    // The camera stands behind the grave, so down the field is toward it.
    expect(deeper.y).toBeGreaterThan(lip.y);
    expect(deepest.y).toBeGreaterThan(deeper.y);
    expect(deepest.y).toBeLessThan(GRAVE_VIEW.cameraBehind);
  });

  it('a point at the dark depth on the far edge draws at the place the camera puts it', () => {
    // Worked by hand from R4's own figures: the far edge is y = -1, the dark
    // depth is 2.4, so the shrink is 4.95 / (4.95 + 2.4) and the far edge draws
    // at 1.07 - 2.07 * 4.95 / 7.35. That figure is the far wall's whole extent,
    // which is what the record's "about three tenths of its length" measures.
    const shrink = 4.95 / 7.35;
    const at = belowGround(0.5, -1, 2.4, GRAVE_VIEW);
    expect(at.y).toBeCloseTo(1.07 - 2.07 * shrink, 12);
    expect(at.x).toBeCloseTo(0.5 * shrink, 12);
  });

  it('the light is whole at the ground and gone at the dark depth, and stays gone below it', () => {
    // The grave has no bottom: the walls run down until the moon stops reaching
    // them, and nothing below that is ever drawn brighter than the dark.
    expect(lightAtDepth(0, GRAVE_VIEW)).toBe(1);
    expect(lightAtDepth(GRAVE_VIEW.darkDepth, GRAVE_VIEW)).toBe(0);
    expect(lightAtDepth(GRAVE_VIEW.darkDepth * 4, GRAVE_VIEW)).toBe(0);
    expect(lightAtDepth(-1, GRAVE_VIEW)).toBe(1);
  });

  it('the light at half the dark depth is one less a half to the falloff', () => {
    // R4's own curve, 1 - (depth / dark depth) ^ 2.6, is shared by the walls and
    // by falling food (slice 4), so a body at a depth is as dark as the wall
    // beside it.
    expect(lightAtDepth(GRAVE_VIEW.darkDepth / 2, GRAVE_VIEW)).toBeCloseTo(
      1 - Math.pow(0.5, 2.6),
      12,
    );
  });
});
