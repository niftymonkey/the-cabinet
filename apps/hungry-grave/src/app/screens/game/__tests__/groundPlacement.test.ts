/**
 * Where each kind of thing draws under the camera (tilted view A7). Expected
 * figures are the design record's, worked out independently of this module;
 * where a test compares against the camera's own projection, the camera is the
 * source of truth its own tests pin.
 */

import { describe, expect, it } from 'vitest';

import { SCENE_CAMERA, groundToColumn } from '../camera';
import {
  airborneAt,
  headingOnColumn,
  hostileFireAt,
  liftOnColumn,
  lyingAt,
  standingAt,
} from '../groundPlacement';

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
    const at = lyingAt(SCENE_CAMERA, 100, 380);
    expectNear(at.x, 100, CLOSE);
    expectNear(at.y, 380, CLOSE);
    expectNear(at.scaleX, 1, CLOSE);
    expectNear(at.scaleY, 0.843391, CLOSE);
  });

  it("a lying thing at the grave's start, ground (270, 608), draws at (270, 591.320185), 1.098947 across and 1.018552 down", () => {
    // A7: the scale squared times the lean, which is how fast the ground's
    // image changes down the column there, not the scale times the lean.
    const at = lyingAt(SCENE_CAMERA, 270, 608);
    expectNear(at.x, 270, CLOSE);
    expectNear(at.y, 591.320185, CLOSE);
    expectNear(at.scaleX, 1.098947, CLOSE);
    expectNear(at.scaleY, 1.018552, CLOSE);
  });

  it("a standing thing's feet sit on the near edge of its footprint: a mob of half-height 11 at ground (270, 380) has its drawing's centre 11 times the scale above the column point of ground (270, 391)", () => {
    // A7: a standing thing rises from where it stands, its feet on the near
    // edge of the footprint the sim collides with.
    const feet = groundToColumn(SCENE_CAMERA, 270, 391);
    const at = standingAt(SCENE_CAMERA, 270, 380, 11);
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
      const at = standingAt(SCENE_CAMERA, x, y, 11);
      expect(at.scaleX).toBeGreaterThan(0);
      expect(at.scaleY).toBe(at.scaleX);
    }
  });

  it('a standing thing farther up the field draws smaller than the same thing nearer', () => {
    // T2: far things draw smaller.
    const far = standingAt(SCENE_CAMERA, 270, 0, 11);
    const near = standingAt(SCENE_CAMERA, 270, 700, 11);
    expect(far.scaleX).toBeLessThan(near.scaleX);
  });

  it("an airborne thing draws at its own ground point at the camera's scale on both axes", () => {
    // A7: skulls, wisps and scatters have no height in the sim.
    const on = groundToColumn(SCENE_CAMERA, 100, 100);
    const at = airborneAt(SCENE_CAMERA, 100, 100);
    expectNear(at.x, 116.925935, CLOSE);
    expectNear(at.y, 167.362471, CLOSE);
    expectNear(at.scaleX, 0.900436, CLOSE);
    expectNear(at.scaleY, on.scale, CLOSE);
  });

  it('a hostile shot near the top draws at scale one, never smaller, and near the bottom at the camera scale', () => {
    // A7: mob fire is never drawn smaller than today's size and its hitbox.
    const top = hostileFireAt(SCENE_CAMERA, 100, 100);
    expectNear(top.x, 116.925935, CLOSE);
    expectNear(top.y, 167.362471, CLOSE);
    expectNear(top.scaleX, 1, CLOSE);
    expectNear(top.scaleY, 1, CLOSE);
    const bottom = hostileFireAt(SCENE_CAMERA, 400, 700);
    expectNear(bottom.x, 418.804365, CLOSE);
    expectNear(bottom.y, 688.923885, CLOSE);
    expectNear(bottom.scaleX, 1.144649, CLOSE);
    expectNear(bottom.scaleY, 1.144649, CLOSE);
  });

  it('a body moving straight down the field heads straight down the column on the middle column, and a body moving across heads across', () => {
    // A7: a heading drawn on a body follows the way it moves on the screen.
    expectNear(
      headingOnColumn(SCENE_CAMERA, 270, 200, 0, 5),
      Math.PI / 2,
      CLOSE,
    );
    expectNear(headingOnColumn(SCENE_CAMERA, 270, 200, 5, 0), 0, CLOSE);
    expectNear(headingOnColumn(SCENE_CAMERA, 270, 200, -5, 0), Math.PI, CLOSE);
  });

  it('a lift of 10 field units straight up the field at ground (270, 100) is 10 times the scale there straight up the column', () => {
    // A7's last bullet: an art offset in field units becomes a column offset at
    // the camera's scale at that thing's ground point.
    const lift = liftOnColumn(SCENE_CAMERA, 270, 100, 0, -10);
    expectNear(lift.x, 0, CLOSE);
    expectNear(lift.y, -10 * 0.900436, 1e-5);
  });
});

describe('headings off the middle column (tilted view A7)', () => {
  it('a body moving straight down the field off the middle column turns away from the middle on the column, as nearer ground spreads', () => {
    // Worked on an independent pinhole: a camera 1147.5 up, 32.5 degrees off
    // straight down, aimed at ground (270, 380), each point projected along
    // its ray and the heading read off a central difference of 0.005 units.
    expectNear(
      headingOnColumn(SCENE_CAMERA, 100, 200, 0, 5),
      1.650228786,
      CLOSE,
    );
    expectNear(
      headingOnColumn(SCENE_CAMERA, 200, 200, 0, 5),
      1.603561044,
      CLOSE,
    );
    expectNear(
      headingOnColumn(SCENE_CAMERA, 100, 200, 5, 5),
      0.69870318,
      CLOSE,
    );
  });
});
