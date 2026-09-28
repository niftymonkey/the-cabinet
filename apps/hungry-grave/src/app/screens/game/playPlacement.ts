/**
 * Where each kind of play thing draws on the play layer, and at what size
 * (tilted view A7 at the play point, A19, A21, A24, A29).
 */

import type { FieldPoint } from '../../../game/field';
import type { Placement } from './groundPlacement';
import type { PlayLayer } from './playLayer';
import { groundToColumn } from './camera';
import {
  columnToPlay,
  groundUnderPlay,
  playToColumn,
  stretchAlong,
} from './playLayer';

interface GraveFrame {
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

interface ColumnOffset {
  readonly x: number;
  readonly y: number;
}

interface GroundRectangle {
  readonly centre: FieldPoint;
  readonly halfAcross: number;
  readonly halfAlong: number;
}

/** A point on the column, in column units. */
interface ColumnPoint {
  readonly x: number;
  readonly y: number;
}

/** A quadrilateral's corners on the column, clockwise from the far left. */
type Corners = readonly [ColumnPoint, ColumnPoint, ColumnPoint, ColumnPoint];

/**
 * A lying thing on the play layer, at tilt 7's look for the ground under it:
 * the scale across and the scale squared times the lean down (A7, A19). Slice
 * B places corpses, treasure, bursts, patches, cones and the Waking's source.
 */
const lyingOnPlay = (layer: PlayLayer, x: number, y: number): Placement => {
  const on = playToColumn(layer, x, y);
  return {
    x: on.x,
    y: on.y,
    scaleX: on.scale,
    scaleY: on.scale * on.scale * layer.camera.lean,
  };
};

/**
 * A standing thing on the play layer, upright at the scale where its feet are,
 * its feet on the near edge of its footprint (A7, A19). The point is the
 * drawing's own centre. Slice B places mobs and bosses with it.
 */
const standingOnPlay = (
  layer: PlayLayer,
  x: number,
  y: number,
  halfDepth: number,
): Placement => {
  const feet = playToColumn(layer, x, y + halfDepth);
  return {
    x: feet.x,
    y: feet.y - halfDepth * feet.scale,
    scaleX: feet.scale,
    scaleY: feet.scale,
  };
};

/**
 * A thing with no height in the sim (skulls, wisps, scatters, loss pops), at
 * its play point at the scale for its row (A7, A19). Slice B reads it.
 */
const airborneOnPlay = (layer: PlayLayer, x: number, y: number): Placement => {
  const on = playToColumn(layer, x, y);
  return { x: on.x, y: on.y, scaleX: on.scale, scaleY: on.scale };
};

/**
 * Mob fire, never drawn smaller than its hitbox's image, which on the play
 * layer is one across and `stretchAlong` down (A21). Slice B's shots read it.
 */
const hostileFireOnPlay = (
  layer: PlayLayer,
  x: number,
  y: number,
): Placement => {
  const on = playToColumn(layer, x, y);
  const scale = Math.max(on.scale, 1, stretchAlong(layer, y));
  return { x: on.x, y: on.y, scaleX: scale, scaleY: scale };
};

/**
 * The angle, in radians, of the way a body at field y moving by a field
 * velocity goes on the column, atan2 of down over across (A7). Across, a field
 * unit is a column unit at every row, so the heading never depends on x (T10).
 * Slice B turns the ghoul's wedge and a wisp with it.
 */
const headingOnPlay = (
  layer: PlayLayer,
  y: number,
  vx: number,
  vy: number,
): number => Math.atan2(vy * stretchAlong(layer, y), vx);

/**
 * An art offset drawn in field units (a lob's lift), as a column offset at the
 * scale at the play point (A7's last bullet, A19). Slice B's lob mark reads it.
 */
const liftOnPlay = (
  layer: PlayLayer,
  x: number,
  y: number,
  dx: number,
  dy: number,
): ColumnOffset => {
  const { scale } = playToColumn(layer, x, y);
  return { x: dx * scale, y: dy * scale };
};

/**
 * Where a grave's own frame (its falls) is placed: at its play point, across
 * the larger of the scale and one, along the rows per field unit, so an offset
 * in the frame draws no smaller than the hitbox's image (A29). Slice C places
 * the falls with it.
 */
const graveFrameOnPlay = (
  layer: PlayLayer,
  x: number,
  y: number,
): Placement => {
  const on = playToColumn(layer, x, y);
  return {
    x: on.x,
    y: on.y,
    scaleX: Math.max(on.scale, 1),
    scaleY: stretchAlong(layer, y),
  };
};

/**
 * The ground rectangle a grave's mesh is drawn through (A23, A29): centred on
 * the ground under the grave's play point, along times the stretch, across
 * times the larger of one and one over the camera's scale at its far edge.
 * Slice C draws the grave's pit and lip through it.
 */
const graveOnGround = (
  layer: PlayLayer,
  grave: GraveFrame,
  halfAcross: number,
  halfAlong: number,
): GroundRectangle => {
  const centre = groundUnderPlay(layer, grave.x, grave.y);
  const halfAlongGround = halfAlong * layer.stretch;
  const farEdge = centre.y - halfAlongGround;
  const farScale = groundToColumn(layer.camera, centre.x, farEdge).scale;
  return {
    centre,
    halfAcross: halfAcross * Math.max(1, 1 / farScale),
    halfAlong: halfAlongGround,
  };
};

// The ways from a quadrilateral's centre to its corners, clockwise from the far left.
const CORNER_WAYS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
] as const;

/**
 * How many times the ground rectangle's half extent across must be taken for
 * the camera's image of its corner one way across, on the row one way along,
 * to reach the hitbox's own corner there. Across a ground row the image is
 * linear in ground x, so it is one ratio.
 */
const wideningToHoldCorner = (
  layer: PlayLayer,
  ground: GroundRectangle,
  grave: GraveFrame,
  halfAcross: number,
  across: number,
  along: number,
): number => {
  const row = ground.centre.y + along * ground.halfAlong;
  const middle = groundToColumn(layer.camera, ground.centre.x, row).x;
  const corner = groundToColumn(
    layer.camera,
    ground.centre.x + across * ground.halfAcross,
    row,
  ).x;
  return (grave.x + across * halfAcross - middle) / (corner - middle);
};

/**
 * The grave's drawn opening on the column, clockwise from the far left: the
 * camera's image of A29's ground rectangle (A23), widened across about its
 * centre by the least factor that holds the hitbox's four corners (A29: a hit
 * never looks like a miss). Off the middle column the camera's image converges
 * toward the middle and leaves the outer far corner and the inner near corner
 * outside; widening the ground rectangle rather than pushing corners keeps it
 * the camera's own shape, and keeps its centre, where its diagonals cross,
 * exactly where the play layer draws the grave's point (Mark: the grave must
 * draw where the sim places it). Its far and near edges lie on the hitbox's
 * rows, so holding the four corners holds the whole hitbox. Slice C draws the
 * pit and the lip round it.
 */
const graveOpeningOnColumn = (
  layer: PlayLayer,
  grave: GraveFrame,
  halfAcross: number,
  halfAlong: number,
): Corners => {
  const ground = graveOnGround(layer, grave, halfAcross, halfAlong);
  const widening = Math.max(
    1,
    ...CORNER_WAYS.map(([across, along]) =>
      wideningToHoldCorner(layer, ground, grave, halfAcross, across, along),
    ),
  );
  const [farLeft, farRight, nearRight, nearLeft] = CORNER_WAYS.map(
    ([across, along]): ColumnPoint => {
      const drawn = groundToColumn(
        layer.camera,
        ground.centre.x + across * widening * ground.halfAcross,
        ground.centre.y + along * ground.halfAlong,
      );
      return { x: drawn.x, y: drawn.y };
    },
  );
  if (!farLeft || !farRight || !nearRight || !nearLeft) {
    throw new Error('a ground rectangle has four corners');
  }
  return [farLeft, farRight, nearRight, nearLeft];
};

/**
 * The offset, in the grave's own half-lengths, at which the grave's frame draws
 * the point the play layer draws at `grave + (dx, dy)` (A24). Slice C starts a
 * swallowed body's fall from it.
 */
const graveFrameOffset = (
  layer: PlayLayer,
  grave: GraveFrame,
  dx: number,
  dy: number,
): ColumnOffset => {
  const frame = graveFrameOnPlay(layer, grave.x, grave.y);
  const drawn = playToColumn(layer, grave.x + dx, grave.y + dy);
  return {
    x: (drawn.x - frame.x) / (frame.scaleX * grave.size),
    y: (drawn.y - frame.y) / (frame.scaleY * grave.size),
  };
};

/**
 * A field velocity carried into the grave's frame by the play layer's local
 * mapping at the grave, in half-lengths per tick (A24). Slice C gives a
 * swallowed body's fall its velocity with it.
 */
const graveFrameVelocity = (
  layer: PlayLayer,
  grave: GraveFrame,
  vx: number,
  vy: number,
): ColumnOffset => {
  const frame = graveFrameOnPlay(layer, grave.x, grave.y);
  return {
    x: vx / (frame.scaleX * grave.size),
    y: (vy * stretchAlong(layer, grave.y)) / (frame.scaleY * grave.size),
  };
};

/**
 * The field point the play layer draws where the grave's frame draws the
 * offset `(ux, uy)` half-lengths, the exact inverse of `graveFrameOffset`
 * (A24). Slice C ends the Undertaker's haul there. The frame's offsets used
 * are near the grave, far below the horizon, so a miss is a bug.
 */
const fromGraveFrame = (
  layer: PlayLayer,
  grave: GraveFrame,
  ux: number,
  uy: number,
): FieldPoint => {
  const frame = graveFrameOnPlay(layer, grave.x, grave.y);
  const x = frame.x + ux * frame.scaleX * grave.size;
  const y = frame.y + uy * frame.scaleY * grave.size;
  const field = columnToPlay(layer, x, y);
  if (field === null) {
    throw new Error(
      `grave frame offset (${ux}, ${uy}) draws above the horizon`,
    );
  }
  return field;
};

export {
  airborneOnPlay,
  fromGraveFrame,
  graveFrameOffset,
  graveFrameOnPlay,
  graveFrameVelocity,
  graveOnGround,
  graveOpeningOnColumn,
  headingOnPlay,
  hostileFireOnPlay,
  liftOnPlay,
  lyingOnPlay,
  standingOnPlay,
};
export type { ColumnPoint, Corners, GraveFrame };
