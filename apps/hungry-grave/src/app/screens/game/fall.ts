/**
 * The Fall of the glossary: where a falling thing draws, how big it is and how
 * dark, as a pure function of its age (design record R5).
 *
 * It works in the grave's own half-lengths, through the same projection and the
 * same light curve the walls are drawn with, so a body deep in the hole is as
 * dark as the wall beside it. Nothing lands: the grave has no bottom.
 */

import { TICK_HZ } from '../../../game/clock';
import { graveWidth } from '../../../game/grave';
import {
  FALL_DRAG,
  FALL_DROP_SECONDS,
  FALL_FOLD_FLOOR,
  FALL_SLIP_SHARE,
  FALL_TILT,
  FALL_TIP_SECONDS,
  GRAVE_VIEW,
} from './graveDrawingValues';
import { belowGround, lightAtDepth } from './graveProjection';

/**
 * One piece of food on its way down, as the swallow's own event left it.
 *
 * The place and the way are held in the grave's proportions and the size in
 * field units, which is the whole of R5's anchoring: a feast pays 30.375 of
 * size on the tip tick, so a place in field units would start the next frame in
 * mid-hole, while the body itself must not grow because the mouth under it did.
 *
 * Mutable, because the pool that draws these recycles its slots rather than
 * allocating a record per swallow.
 */
interface Fall {
  unitX: number;
  unitY: number;
  unitVx: number;
  unitVy: number;
  halfExtent: number;
  born: number;
}

/**
 * Where a falling body draws this frame: an offset from the grave's centre in
 * field units, the way it lies, how far it is squeezed along that way and
 * across it, how much moon still reaches it, and whether the dark has it.
 */
interface FallDrawing {
  readonly x: number;
  readonly y: number;
  readonly turn: number;
  readonly along: number;
  readonly across: number;
  readonly light: number;
  readonly gone: boolean;
}

/** A point of a falling body: where it is on the ground and how far under it. */
interface Underfoot {
  readonly x: number;
  readonly y: number;
  readonly depth: number;
}

/** The rim a body crossed, and the way in from it. */
interface Hinge {
  readonly x: number;
  readonly y: number;
  readonly intoX: number;
  readonly intoY: number;
}

/**
 * The mouth in the grave's own half-lengths, exactly as the hole's own art
 * holds it: one unit is the size, so the opening runs from -1 to 1 down the
 * field and the width comes off the sim's own graveWidth.
 */
const MOUTH_HALF_WIDTH = graveWidth(1) / 2;

/**
 * How long the two halves of a fall last, in the run's own ticks. The
 * Undertaker's end lays its own tip and fall beats over these, so his body
 * turns and drops on the curve a corpse turns and drops on (design record R6).
 */
const TIP_TICKS = Math.round(FALL_TIP_SECONDS * TICK_HZ);
const DROP_TICKS = Math.round(FALL_DROP_SECONDS * TICK_HZ);

/** How long one whole fall lasts, in the run's own ticks. */
const FALL_TICKS = TIP_TICKS + DROP_TICKS;

/**
 * The pull on a falling body, in half-lengths a second a second: enough to take
 * one that leaves the rim at the surface all the way to the dark in the drop's
 * own time.
 */
const FALL_GRAVITY =
  (2 * GRAVE_VIEW.darkDepth) / (FALL_DROP_SECONDS * FALL_DROP_SECONDS);

const clamp = (value: number, low: number, high: number): number =>
  Math.min(Math.max(value, low), high);

const easeInQuad = (u: number): number => u * u;

const easeOutQuad = (u: number): number => 1 - (1 - u) * (1 - u);

/**
 * The point of the rim a body at this place crossed: the nearest edge of the
 * mouth, and the inward normal of that edge.
 *
 * The edge is chosen from the nearest point inside the mouth rather than from
 * the place itself, so a body lying outside the far lip hinges on the far edge
 * instead of tying with the two sides.
 */
const rimCrossedAt = (x: number, y: number): Hinge => {
  const insideX = clamp(x, -MOUTH_HALF_WIDTH, MOUTH_HALF_WIDTH);
  const insideY = clamp(y, -1, 1);
  const toLeft = insideX + MOUTH_HALF_WIDTH;
  const toRight = MOUTH_HALF_WIDTH - insideX;
  const toFar = insideY + 1;
  const toNear = 1 - insideY;
  const nearest = Math.min(toLeft, toRight, toFar, toNear);
  if (nearest === toLeft) {
    return { x: -MOUTH_HALF_WIDTH, y: insideY, intoX: 1, intoY: 0 };
  }
  if (nearest === toRight) {
    return { x: MOUTH_HALF_WIDTH, y: insideY, intoX: -1, intoY: 0 };
  }
  if (nearest === toFar) return { x: insideX, y: -1, intoX: 0, intoY: 1 };
  return { x: insideX, y: 1, intoX: 0, intoY: -1 };
};

/** How far past the rim a point sits, along the way into the hole. */
const pastTheRim = (hinge: Hinge, x: number, y: number): number =>
  (x - hinge.x) * hinge.intoX + (y - hinge.y) * hinge.intoY;

/**
 * One end of a body that has turned about the rim by a tilt. The further past
 * the rim an end sits the further it swings down under the ground, and an end
 * still outside the rim rises instead, which is what makes a body go over an
 * edge rather than sink through a hole.
 */
const endTurnedBy = (
  hinge: Hinge,
  x: number,
  y: number,
  cosTilt: number,
  sinTilt: number,
): Underfoot => {
  const past = pastTheRim(hinge, x, y);
  const acrossX = x - hinge.x - past * hinge.intoX;
  const acrossY = y - hinge.y - past * hinge.intoY;
  return {
    x: hinge.x + hinge.intoX * past * cosTilt + acrossX,
    y: hinge.y + hinge.intoY * past * cosTilt + acrossY,
    depth: past * sinTilt,
  };
};

/** A body's two ends, the length of it taken along the way into the hole. */
const endsAround = (
  hinge: Hinge,
  centreX: number,
  centreY: number,
  half: number,
  tilt: number,
): [Underfoot, Underfoot] => {
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);
  const inX = hinge.intoX * half;
  const inY = hinge.intoY * half;
  return [
    endTurnedBy(hinge, centreX + inX, centreY + inY, cosTilt, sinTilt),
    endTurnedBy(hinge, centreX - inX, centreY - inY, cosTilt, sinTilt),
  ];
};

/**
 * The tip: the body goes over the edge where it is, turning about the rim it
 * crossed. The slide over the edge eases out while the turn eases in, so by the
 * last frame of the tip the sliding is finished and the turning is at its
 * fastest, and what the drop inherits is the turn.
 */
const tipEnds = (
  fall: Fall,
  hinge: Hinge,
  half: number,
  u: number,
): [Underfoot, Underfoot] => {
  const slip = Math.max(
    0,
    half * FALL_SLIP_SHARE - pastTheRim(hinge, fall.unitX, fall.unitY),
  );
  const slid = slip * easeOutQuad(u);
  return endsAround(
    hinge,
    fall.unitX + hinge.intoX * slid,
    fall.unitY + hinge.intoY * slid,
    half,
    FALL_TILT * easeInQuad(u),
  );
};

/**
 * The drop: the rod the tip left standing, carried down by gravity while the
 * way the food arrived with runs on across the shaft and is spent against the
 * walls.
 *
 * The body was already falling when the edge let it go, so the descent picks up
 * the speed it would have had at that depth rather than starting from rest: a
 * body started from rest hangs at the lip while gravity builds from nothing.
 */
const dropEnds = (
  fall: Fall,
  hinge: Hinge,
  half: number,
  seconds: number,
): [Underfoot, Underfoot] => {
  const [ahead, behind] = tipEnds(fall, hinge, half, 1);
  const armX = (ahead.x - behind.x) / 2;
  const armY = (ahead.y - behind.y) / 2;
  const armDepth = (ahead.depth - behind.depth) / 2;
  const from = (ahead.depth + behind.depth) / 2;
  const carried = (1 - Math.exp(-FALL_DRAG * seconds)) / FALL_DRAG;
  const x = clamp(
    (ahead.x + behind.x) / 2 + fall.unitVx * carried,
    -MOUTH_HALF_WIDTH,
    MOUTH_HALF_WIDTH,
  );
  const y = clamp((ahead.y + behind.y) / 2 + fall.unitVy * carried, -1, 1);
  const falling = Math.sqrt(2 * FALL_GRAVITY * Math.max(0, from));
  const depth =
    from + falling * seconds + (FALL_GRAVITY * seconds * seconds) / 2;
  return [
    { x: x + armX, y: y + armY, depth: depth + armDepth },
    { x: x - armX, y: y - armY, depth: depth - armDepth },
  ];
};

/**
 * A body drawn from its two ends: the projection places each of them and the
 * drawing is stretched between where they land, so a body foreshortens as it
 * goes over and shrinks as it falls away from the camera without either being
 * animated by hand.
 */
const drawnBetween = (
  ahead: Underfoot,
  behind: Underfoot,
  half: number,
  fold: number,
  graveSize: number,
): FallDrawing => {
  const there = belowGround(ahead.x, ahead.y, ahead.depth, GRAVE_VIEW);
  const back = belowGround(behind.x, behind.y, behind.depth, GRAVE_VIEW);
  const depth = Math.max(0, (ahead.depth + behind.depth) / 2);
  const shrink = GRAVE_VIEW.cameraHeight / (GRAVE_VIEW.cameraHeight + depth);
  const spanX = there.x - back.x;
  const spanY = there.y - back.y;
  return {
    x: ((there.x + back.x) / 2) * graveSize,
    y: ((there.y + back.y) / 2) * graveSize,
    turn: Math.atan2(spanY, spanX),
    along: (Math.sqrt(spanX * spanX + spanY * spanY) / (2 * half)) * fold,
    across: shrink * fold,
    light: lightAtDepth(depth, GRAVE_VIEW),
    gone: depth >= GRAVE_VIEW.darkDepth,
  };
};

/**
 * How much a body has to close up to go into this mouth, full at the tip and
 * folded by the time it is over the edge.
 *
 * The measure is the opening's long way, which is one half-length each side of
 * the middle: the fall already draws a body in toward the rim it crosses and
 * the mouth swallows what is left, so folding it to the narrow way as well
 * would send it in as a speck nobody sees.
 */
const foldAt = (half: number, u: number): number => {
  const fits = clamp(1 / half, FALL_FOLD_FLOOR, 1);
  return 1 + (fits - 1) * u;
};

/**
 * Where a falling body draws at this age, from the grave's centre, in field
 * units.
 *
 * The size is read every frame rather than held, because the grave grows on the
 * very tick the food went in: the place is in the grave's proportions and the
 * body's own half extent is in field units, so the mouth can double under a
 * feast without the feast being moved or grown.
 *
 * Slice 5 calls this for the Undertaker's own drop, where he "tips, folds in,
 * and falls with the shared fall" (design record R6), which is why it takes a
 * half extent and a way rather than reading a corpse.
 */
const fallAt = (fall: Fall, age: number, graveSize: number): FallDrawing => {
  const half = fall.halfExtent / graveSize;
  const hinge = rimCrossedAt(fall.unitX, fall.unitY);
  const u = clamp(age / TIP_TICKS, 0, 1);
  const [ahead, behind] =
    age <= TIP_TICKS
      ? tipEnds(fall, hinge, half, u)
      : dropEnds(fall, hinge, half, (age - TIP_TICKS) / TICK_HZ);
  const drawing = drawnBetween(ahead, behind, half, foldAt(half, u), graveSize);
  if (age < FALL_TICKS) return drawing;
  return { ...drawing, gone: true };
};

export { fallAt, rimCrossedAt, DROP_TICKS, FALL_TICKS, TIP_TICKS };
export type { Fall, FallDrawing, Hinge };
