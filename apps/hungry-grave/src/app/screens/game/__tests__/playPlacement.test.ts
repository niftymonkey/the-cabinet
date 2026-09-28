// Where each kind of play thing draws on the play layer (tilted view A7, A19, A21, A24, A29), pinned against the design record.

import { describe, expect, it } from 'vitest';

import { fieldOfHeight } from '../../../../game/field';
import { groundToColumn } from '../camera';
import { playToColumn } from '../playLayer';
import {
  airborneOnPlay,
  fromGraveFrame,
  graveFrameOffset,
  graveFrameOnPlay,
  graveFrameVelocity,
  graveOnGround,
  headingOnPlay,
  hostileFireOnPlay,
  liftOnPlay,
  lyingOnPlay,
  standingOnPlay,
} from '../playPlacement';
import type { GraveFrame } from '../playPlacement';
import { sceneFor } from '../scene';

const SHORT = sceneFor(fieldOfHeight(760));
const TALL = sceneFor(fieldOfHeight(1168));
const LAYER = SHORT.playLayer;

const CLOSE = 1e-6;
const EXACT = 1e-9;

/** Asserts a value within a tolerance, naming both figures when it is not. */
const expectNear = (actual: number, expected: number, tolerance: number) =>
  expect(
    Math.abs(actual - expected),
    `${actual} against ${expected}`,
  ).toBeLessThanOrEqual(tolerance);

type FrameCase = readonly [GraveFrame, readonly [number, number], ...unknown[]];

// The design record's frame offsets (A24): a grave, a body's offset from it, and where the frame draws it.
const FRAME_CASES = [
  [{ x: 270, y: 608, size: 27 }, [13.5, -27], [0.461223, -0.986044]],
  [{ x: 270, y: 608, size: 27 }, [0, 27], [0, 1.014357]],
  [{ x: 40, y: 700, size: 27 }, [13.5, -27], [0.43898, -0.985347]],
  [{ x: 270, y: 100, size: 48 }, [-24, -48], [-0.5, -0.980517]],
] as const;

// Offsets from a size 27 grave to the corners and edges of its hitbox.
const FRAME_OFFSETS = [
  [13.5, -27],
  [-13.5, -27],
  [0, 27],
  [13.5, 27],
] as const;

/** Asserts that the grave's frame draws each offset where the play layer draws the point. */
const expectFrameDrawsWherePlayDraws = (
  scene: typeof SHORT,
  cases: readonly FrameCase[],
) => {
  const layer = scene.playLayer;
  for (const [grave, [dx, dy]] of cases) {
    const frame = graveFrameOnPlay(layer, grave.x, grave.y);
    const offset = graveFrameOffset(layer, grave, dx, dy);
    const drawn = playToColumn(layer, grave.x + dx, grave.y + dy);
    expectNear(frame.x + offset.x * frame.scaleX * grave.size, drawn.x, EXACT);
    expectNear(frame.y + offset.y * frame.scaleY * grave.size, drawn.y, EXACT);
  }
};

/** Asserts that fromGraveFrame brings each frame offset back to its field point. */
const expectFrameRoundTrips = (
  scene: typeof SHORT,
  cases: readonly FrameCase[],
) => {
  const layer = scene.playLayer;
  for (const [grave, [dx, dy]] of cases) {
    const offset = graveFrameOffset(layer, grave, dx, dy);
    const back = fromGraveFrame(layer, grave, offset.x, offset.y);
    expectNear(back.x, grave.x + dx, EXACT);
    expectNear(back.y, grave.y + dy, EXACT);
  }
};

describe('where play things draw on the play layer (tilted view A19)', () => {
  it("a lying thing at the grave's start draws at (270, 559.555815), 1.084074 across and 0.991168 down", () => {
    // A19, A7: tilt 7's look for the ground under it, the scale across and the
    // scale squared times the lean down.
    const at = lyingOnPlay(LAYER, 270, 608);
    expectNear(at.x, 270, CLOSE);
    expectNear(at.y, 559.555815, CLOSE);
    expectNear(at.scaleX, 1.084074, CLOSE);
    expectNear(at.scaleY, 0.991168, CLOSE);
  });
  it('a standing thing of half-height 11 at field (270, 380) has its feet on column row 323.093772 and its centre on row 312.386873, at scale 0.973355 on both axes', () => {
    // A7, A19: its feet on the near edge of its footprint, upright.
    const at = standingOnPlay(LAYER, 270, 380, 11);
    expectNear(at.x, 270, CLOSE);
    expectNear(at.y, 312.386873, CLOSE);
    expectNear(at.y + 11 * at.scaleY, 323.093772, CLOSE);
    expectNear(at.scaleX, 0.973355, CLOSE);
    expectNear(at.scaleY, 0.973355, CLOSE);
  });
  it('an airborne thing draws at its play point at the scale for its row, on both axes', () => {
    // A7, A19: skulls, wisps and scatters; the design record's table gives
    // field (100, 100) at (100, 72.678500) at scale 0.856101.
    const at = airborneOnPlay(LAYER, 100, 100);
    expectNear(at.x, 100, CLOSE);
    expectNear(at.y, 72.6785, CLOSE);
    expectNear(at.scaleX, 0.856101, CLOSE);
    expectNear(at.scaleY, 0.856101, CLOSE);
  });
  it('mob fire draws at scale one at field y 0, 190 and 380, at 1.213640 at 608 and 1.432881 at 760, one scale on both axes', () => {
    // A21: never smaller than its hitbox's image on either axis.
    for (const [y, scale] of [
      [0, 1],
      [190, 1],
      [380, 1],
      [608, 1.21364],
      [760, 1.432881],
    ] as const) {
      const at = hostileFireOnPlay(LAYER, 400, y);
      expect(at.x).toBe(400);
      expectNear(at.y, playToColumn(LAYER, 400, y).y, EXACT);
      expectNear(at.scaleX, scale, CLOSE);
      expectNear(at.scaleY, scale, CLOSE);
    }
  });
  it('a body moving straight down heads straight down the column at any x, 1.570796 radians: the heading reads no x, and holds at field y 0, 300 and 760', () => {
    // T10: mobs move straight. Across, a field unit is a column unit at every
    // row, so the heading takes no x at all.
    expect(headingOnPlay.length).toBe(4);
    for (const y of [0, 300, 760]) {
      expectNear(headingOnPlay(LAYER, y, 0, 5), 1.570796, CLOSE);
    }
  });
  it('a body moving (3, 4) at field y 608 heads 1.017264 radians on the column', () => {
    // A7: a heading follows the way the body moves on the screen, atan2 of
    // down over across.
    expectNear(headingOnPlay(LAYER, 608, 3, 4), 1.017264, CLOSE);
  });
  it('a lift of 10 field units straight up at field (270, 100) is 10 times 0.856101 straight up the column', () => {
    // A7's last bullet at the play point (A19).
    const lift = liftOnPlay(LAYER, 270, 100, 0, -10);
    expectNear(lift.x, 0, CLOSE);
    expectNear(lift.y, -8.56101, 1e-5);
  });
});

describe("the grave's frame on the play layer (tilted view A24, A29)", () => {
  it("a body at offset (13.5, -27) from a grave at (270, 608) of size 27 lands at (0.461223, -0.986044) in the grave's frame, and the record's three other cases land where it says", () => {
    // A24: a swallowed body goes over the rim from where it was drawn.
    for (const [grave, offset, frame] of FRAME_CASES) {
      const at = graveFrameOffset(LAYER, grave, offset[0], offset[1]);
      expectNear(at.x, frame[0], CLOSE);
      expectNear(at.y, frame[1], CLOSE);
    }
  });
  it("what the grave's frame draws at the frame offset of a point is where the play layer draws that point", () => {
    // A24, the promise behind the frame offsets above.
    expectFrameDrawsWherePlayDraws(SHORT, FRAME_CASES);
  });
  it('fromGraveFrame undoes graveFrameOffset', () => {
    // A24: the Undertaker's haul ends where the frame draws his rim hinge.
    expectFrameRoundTrips(SHORT, FRAME_CASES);
  });
  it('a velocity of (1, 2) field units per tick at a grave at field y 608 of size 27 is (0.034165, 0.074074) grave units per tick in the frame', () => {
    // A24: a fall's velocity is carried by the play layer's local mapping.
    const v = graveFrameVelocity(LAYER, { x: 270, y: 608, size: 27 }, 1, 2);
    expectNear(v.x, 0.034165, CLOSE);
    expectNear(v.y, 0.074074, CLOSE);
  });
  it("the grave's frame is 1.084074 across and 1.213640 along at field y 608, and 1 across and 0.756871 along at field y 100", () => {
    // A29: an offset in the frame draws no smaller than the hitbox's image.
    const near = graveFrameOnPlay(LAYER, 270, 608);
    expectNear(near.x, 270, CLOSE);
    expectNear(near.y, 559.555815, CLOSE);
    expectNear(near.scaleX, 1.084074, CLOSE);
    expectNear(near.scaleY, 1.21364, CLOSE);
    const far = graveFrameOnPlay(LAYER, 270, 100);
    expectNear(far.scaleX, 1, CLOSE);
    expectNear(far.scaleY, 0.756871, CLOSE);
  });
  it("the grave's ground rectangle covers its hitbox along exactly: size 27 at (270, 608) has half extents 13.5 and 33.060253, its ends on rows 527.244788 and 592.794441; size 48 at (270, 100) is 24 times 1.191296 across", () => {
    // A29: along, the drawn rim lies on the hitbox's rows; across, it is
    // widened by one over the scale at its far edge.
    const start = graveOnGround(LAYER, { x: 270, y: 608, size: 27 }, 13.5, 27);
    expectNear(start.halfAcross, 13.5, CLOSE);
    expectNear(start.halfAlong, 33.060253, CLOSE);
    const { camera } = LAYER;
    const farEnd = groundToColumn(
      camera,
      start.centre.x,
      start.centre.y - start.halfAlong,
    );
    const nearEnd = groundToColumn(
      camera,
      start.centre.x,
      start.centre.y + start.halfAlong,
    );
    // The ends lie exactly on the hitbox's rows, field y 581 and 635. The
    // record's 527.244788 and 592.794441 are 7e-5 and 8e-5 off an independent
    // double-precision working (slice B's note), so they are read at 1e-4.
    expectNear(farEnd.y, playToColumn(LAYER, 270, 581).y, EXACT);
    expectNear(nearEnd.y, playToColumn(LAYER, 270, 635).y, EXACT);
    expectNear(farEnd.y, 527.244788, 1e-4);
    expectNear(nearEnd.y, 592.794441, 1e-4);
    const grown = graveOnGround(LAYER, { x: 270, y: 100, size: 48 }, 24, 48);
    expectNear(grown.halfAcross, 24 * 1.191296, 1e-5);
  });
  // Held as a todo, reported in slice B's note: off the middle column the
  // pinhole's image of A29's ground rectangle converges toward the middle and
  // leaves the hitbox's outer far corner and inner near corner outside it.
  it.todo(
    "the four corners of a grave's hitbox, drawn by the play layer, lie inside the pinhole's image of its ground rectangle",
  );
  it("placements on the 1168 field: mob fire at field y 1016 draws at scale 1.453931, the grave's frame at 1016 is 1.159834 across and 1.453931 along, and the frame's relations hold for graves of size 27 at (40, 1016), (270, 1016) and (500, 1016)", () => {
    // A21, A29, A24 on a tall phone's field (T12).
    const fire = hostileFireOnPlay(TALL.playLayer, 270, 1016);
    expectNear(fire.scaleX, 1.453931, CLOSE);
    expectNear(fire.scaleY, 1.453931, CLOSE);
    const frame = graveFrameOnPlay(TALL.playLayer, 270, 1016);
    expectNear(frame.scaleX, 1.159834, CLOSE);
    expectNear(frame.scaleY, 1.453931, CLOSE);
    const tallCases = [40, 270, 500].flatMap((x) =>
      FRAME_OFFSETS.map(
        (offset) => [{ x, y: 1016, size: 27 }, offset] as const,
      ),
    );
    expectFrameDrawsWherePlayDraws(TALL, tallCases);
    expectFrameRoundTrips(TALL, tallCases);
  });
});
