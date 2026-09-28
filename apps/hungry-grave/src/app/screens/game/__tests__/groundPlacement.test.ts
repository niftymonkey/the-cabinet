/**
 * Where each kind of thing draws under the camera (tilted view A7). Expected
 * figures are the design record's, worked out independently of this module;
 * where a test compares against the camera's own projection, the camera is the
 * source of truth its own tests pin.
 */

import { describe, expect, it } from 'vitest';

import { groundToColumn } from '../camera';
import { SHORTEST_FIELD } from '../../../../game/field';
import { sceneFor } from '../scene';
import { lyingAt, standingAt } from '../groundPlacement';

// The shortest field's scene, the one this file's values were pinned on (tilted view A34).
const { camera: SHORTEST_CAMERA } = sceneFor(SHORTEST_FIELD);

const CLOSE = 1e-6;

/** Asserts a value within a tolerance, naming both figures when it is not. */
const expectNear = (actual: number, expected: number, tolerance: number) =>
  expect(
    Math.abs(actual - expected),
    `${actual} against ${expected}`,
  ).toBeLessThanOrEqual(tolerance);

describe('where things draw under the camera (tilted view A7)', () => {
  it('a lying thing on the middle row draws at its own point at scale one across and the lean, 0.843391, down', () => {
    // A7: a lying thing foreshortens with the ground, the scale squared times
    // the lean down the column, and the scale is one on the middle row.
    const at = lyingAt(SHORTEST_CAMERA, 100, 380);
    expectNear(at.x, 100, CLOSE);
    expectNear(at.y, 380, CLOSE);
    expectNear(at.scaleX, 1, CLOSE);
    expectNear(at.scaleY, 0.843391, CLOSE);
  });

  it("a lying thing at the grave's start, ground (270, 608), draws at (270, 591.320185), 1.098947 across and 1.018552 down", () => {
    // A7: the scale squared times the lean, which is how fast the ground's
    // image changes down the column there, not the scale times the lean.
    const at = lyingAt(SHORTEST_CAMERA, 270, 608);
    expectNear(at.x, 270, CLOSE);
    expectNear(at.y, 591.320185, CLOSE);
    expectNear(at.scaleX, 1.098947, CLOSE);
    expectNear(at.scaleY, 1.018552, CLOSE);
  });

  it("a standing thing's feet sit on the near edge of its footprint: a mob of half-height 11 at ground (270, 380) has its drawing's centre 11 times the scale above the column point of ground (270, 391)", () => {
    // A7: a standing thing rises from where it stands, its feet on the near
    // edge of the footprint the sim collides with.
    const feet = groundToColumn(SHORTEST_CAMERA, 270, 391);
    const at = standingAt(SHORTEST_CAMERA, 270, 380, 11);
    expectNear(at.x, feet.x, CLOSE);
    expectNear(at.y, feet.y - 11 * feet.scale, CLOSE);
    expectNear(at.scaleX, feet.scale, CLOSE);
  });

  it('a standing thing is never squashed: its scale is the same on both axes', () => {
    // A7: standing things are drawn upright with no lean.
    for (const [x, y] of [
      [270, -100],
      [50, 380],
      [480, 700],
    ] as const) {
      const at = standingAt(SHORTEST_CAMERA, x, y, 11);
      expect(at.scaleX).toBeGreaterThan(0);
      expect(at.scaleY).toBe(at.scaleX);
    }
  });

  it('a standing thing farther up the field draws smaller than the same thing nearer', () => {
    // T2: far things draw smaller.
    const far = standingAt(SHORTEST_CAMERA, 270, 0, 11);
    const near = standingAt(SHORTEST_CAMERA, 270, 700, 11);
    expect(far.scaleX).toBeLessThan(near.scaleX);
  });
});
