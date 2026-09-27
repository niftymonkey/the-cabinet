/**
 * The one projection the hole is built from (design record R4). Pure
 * arithmetic in the grave's own half-lengths, with every expected value worked
 * by hand from the formulas in the record rather than read off the code.
 */

import { describe, expect, it } from 'vitest';

import type { GraveView } from '../graveProjection';
import { belowGround, lightAtDepth } from '../graveProjection';

/**
 * Build 7's own camera over the hole, 4.95 half-lengths up and 1.07 behind, with
 * R4's dark: the view these promises were written against, handed in now that
 * the painters take the view they are cut with (tilted view T4).
 */
const BUILD_7_VIEW: GraveView = {
  cameraHeight: 4.95,
  nadirX: 0,
  nadirY: 1.07,
  darkDepth: 2.4,
  darkFalloff: 2.6,
};

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
    const far = belowGround(0.5, -1, 0, BUILD_7_VIEW);
    expect(far.x).toBe(0.5);
    expect(far.y).toBeCloseTo(-1, 12);
    const near = belowGround(-0.5, 1, 0, BUILD_7_VIEW);
    expect(near.x).toBe(-0.5);
    expect(near.y).toBeCloseTo(1, 12);
  });

  it('a deeper point draws nearer the spot the camera stands over, on both axes', () => {
    // The shrink toward the spot the camera stands over is the only thing that
    // makes a side wall visible at all, and it has to act on both axes or the
    // far wall would be a band with no sides to it.
    const lip = belowGround(0.5, -1, 0, BUILD_7_VIEW);
    const deeper = belowGround(0.5, -1, 0.6, BUILD_7_VIEW);
    const deepest = belowGround(0.5, -1, 1.2, BUILD_7_VIEW);

    expect(deeper.x).toBeLessThan(lip.x);
    expect(deepest.x).toBeLessThan(deeper.x);
    // The camera stands behind the grave, so down the field is toward it.
    expect(deeper.y).toBeGreaterThan(lip.y);
    expect(deepest.y).toBeGreaterThan(deeper.y);
    expect(deepest.y).toBeLessThan(BUILD_7_VIEW.nadirY);
  });

  it('a point at the dark depth on the far edge draws at the place the camera puts it', () => {
    // Worked by hand from R4's own figures: the far edge is y = -1, the dark
    // depth is 2.4, so the shrink is 4.95 / (4.95 + 2.4) and the far edge draws
    // at 1.07 - 2.07 * 4.95 / 7.35. That figure is the far wall's whole extent,
    // which is what the record's "about three tenths of its length" measures.
    const shrink = 4.95 / 7.35;
    const at = belowGround(0.5, -1, 2.4, BUILD_7_VIEW);
    expect(at.y).toBeCloseTo(1.07 - 2.07 * shrink, 12);
    expect(at.x).toBeCloseTo(0.5 * shrink, 12);
  });

  it('the light is whole at the ground and gone at the dark depth, and stays gone below it', () => {
    // The grave has no bottom: the walls run down until the moon stops reaching
    // them, and nothing below that is ever drawn brighter than the dark.
    expect(lightAtDepth(0, BUILD_7_VIEW)).toBe(1);
    expect(lightAtDepth(BUILD_7_VIEW.darkDepth, BUILD_7_VIEW)).toBe(0);
    expect(lightAtDepth(BUILD_7_VIEW.darkDepth * 4, BUILD_7_VIEW)).toBe(0);
    expect(lightAtDepth(-1, BUILD_7_VIEW)).toBe(1);
  });

  it('the light at half the dark depth is one less a half to the falloff', () => {
    // R4's own curve, 1 - (depth / dark depth) ^ 2.6, is shared by the walls and
    // by falling food (slice 4), so a body at a depth is as dark as the wall
    // beside it.
    expect(lightAtDepth(BUILD_7_VIEW.darkDepth / 2, BUILD_7_VIEW)).toBeCloseTo(
      1 - Math.pow(0.5, 2.6),
      12,
    );
  });
});

describe("the projection converges on the camera's nadir (tilted view T4, A6)", () => {
  it("with the camera straight behind at 1.07 half-lengths, a point below the ground draws exactly where build 7's projection draws it", () => {
    // The move to a nadir changes nothing on its own: build 7's camera is a
    // nadir at (0, 1.07). Worked by hand from R4's form, x * shrink and
    // 1.07 + (y - 1.07) * shrink, with shrink = 4.95 / (4.95 + 1.3).
    const shrink = 4.95 / 6.25;
    const at = belowGround(0.4, -0.8, 1.3, BUILD_7_VIEW);
    expect(Math.abs(at.x - 0.4 * shrink)).toBeLessThanOrEqual(1e-12);
    expect(
      Math.abs(at.y - (1.07 + (-0.8 - 1.07) * shrink)),
    ).toBeLessThanOrEqual(1e-12);
  });
  it("a point below the ground converges on the camera's nadir, sideways as well as along", () => {
    // T4: the scene camera stands wherever it stands over the grave, so off the
    // middle column its nadir lies to one side and depth carries a point toward
    // it on both axes. Worked by hand: a camera 10 up over (3, 12), a point
    // 5 down under (0.5, -1), shrink 10 / 15, so x = 3 - 2.5 * 2 / 3 and
    // y = 12 - 13 * 2 / 3.
    const view: GraveView = {
      ...BUILD_7_VIEW,
      cameraHeight: 10,
      nadirX: 3,
      nadirY: 12,
    };
    const at = belowGround(0.5, -1, 5, view);
    expect(Math.abs(at.x - 4 / 3)).toBeLessThanOrEqual(1e-12);
    expect(Math.abs(at.y - 10 / 3)).toBeLessThanOrEqual(1e-12);
  });

  it('a point at depth zero draws where it lies, whatever the nadir', () => {
    // R4: at no depth the camera's ray is the point itself, so the mouth's own
    // rectangle is undistorted wherever the camera stands.
    for (const [nadirX, nadirY] of [
      [3, 12],
      [-7, 40],
    ]) {
      const view: GraveView = {
        ...BUILD_7_VIEW,
        nadirX: nadirX ?? NaN,
        nadirY: nadirY ?? NaN,
      };
      const at = belowGround(0.5, -1, 0, view);
      expect(Math.abs(at.x - 0.5)).toBeLessThanOrEqual(1e-12);
      expect(Math.abs(at.y + 1)).toBeLessThanOrEqual(1e-12);
    }
  });
});
