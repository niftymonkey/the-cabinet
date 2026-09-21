/**
 * The Undertaker's end as arithmetic: where his body is, how it lies and how
 * far his furrows reach at a progress from nothing to whole (design record R6).
 *
 * The scene's own record is taken once, at the death, so the run can stop the
 * moment it ends and the drawing still has everything it needs. It changes no
 * rule and pays nothing: a run plays out the same whether or not it is drawn.
 */

import { BOSS_HALF_HEIGHT, BOSS_HALF_WIDTH } from '../../../game/bosses/phases';
import type { BossKilled } from '../../../game/events';
import type { Grave } from '../../../game/grave';
import { graveWidth } from '../../../game/grave';
import type { BossKind } from '../../../game/stage/waves';
import type { Spot } from './graveProjection';
import type { Fall, Hinge } from './fall';
import { DROP_TICKS, fallAt, rimCrossedAt, TIP_TICKS } from './fall';
import {
  ENDING_BEATS,
  ENDING_DRAG_EASE,
  ENDING_SCENE_SECONDS,
} from './graveDrawingValues';

/**
 * Everything the scene was handed at the death, as values: which boss fell and
 * where, and the grave that is about to take him, at the size and the place it
 * stood at on that tick.
 *
 * Values and never the records themselves, because the sim takes the boss off
 * the field on the tick he dies and the screen is pooled under both of them.
 */
interface EndingScene {
  readonly boss: BossKind;
  readonly fromX: number;
  readonly fromY: number;
  readonly graveX: number;
  readonly graveY: number;
  readonly graveSize: number;
  // The point of the rim he is hauled to, in field units, fixed at the death.
  readonly rimX: number;
  readonly rimY: number;
  // The way in from that point, which is the way he goes over and folds along.
  readonly intoX: number;
  readonly intoY: number;
}

/**
 * Where the body draws this frame and how it lies.
 *
 * The place is on the field while he is still on the ground, and an offset from
 * the grave's own centre once he is inside the hole, which is where a fall is
 * drawn from. How deep he has fallen reads as the light left on him: the
 * projection carries the depth into the place and the size, and the walls' own
 * curve carries it into the light.
 */
interface EndingSceneDrawing {
  readonly x: number;
  readonly y: number;
  // Whether the place above is an offset inside the hole rather than a place on the field.
  readonly inTheHole: boolean;
  readonly turn: number;
  // How wide and how tall he draws, each a share of his own body.
  readonly wide: number;
  readonly tall: number;
  readonly light: number;
  readonly gone: boolean;
  // How far the furrows reach, as a share of the ground between where he fell and the rim.
  readonly furrows: number;
}

/** How long the scene runs, in milliseconds. */
const ENDING_SCENE_MS = ENDING_SCENE_SECONDS * 1000;

// Where each beat hands over to the next, as a progress from nothing to whole.
const CLAW_STARTS = ENDING_BEATS.drag;
const TIP_STARTS = CLAW_STARTS + ENDING_BEATS.claw;
const FALL_STARTS = TIP_STARTS + ENDING_BEATS.tip;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(Math.max(value, low), high);

/** The mouth in the grave's own half-lengths: one unit is the size, the width comes off the sim. */
const MOUTH_HALF_WIDTH = graveWidth(1) / 2;

/**
 * Where the pull crosses the rim, in the grave's own half-lengths: the point
 * the line from where he fell to the grave's middle leaves the opening at.
 *
 * The rim he goes over is the one the grave hauls him across, and never the one
 * nearest him. They differ exactly where it matters: a boss dies high in the
 * field and the mouth is half as wide as it is long, so the nearest point of
 * the rim to him is a corner, and taking the nearest edge slid him in sideways
 * and under the lip where nobody could see him go.
 */
const whereThePullCrosses = (killed: BossKilled, grave: Grave): Spot => {
  const outX = (killed.x - grave.x) / grave.size;
  const outY = (killed.y - grave.y) / grave.size;
  const toSide = outX === 0 ? Infinity : MOUTH_HALF_WIDTH / Math.abs(outX);
  const toEnd = outY === 0 ? Infinity : 1 / Math.abs(outY);
  // He died on the grave's own middle, which the fight's own geometry never
  // reaches: he goes over the far edge, the one every other body comes over.
  if (toSide === Infinity && toEnd === Infinity) return { x: 0, y: -1 };
  const reaches = Math.min(toSide, toEnd);
  return { x: outX * reaches, y: outY * reaches };
};

/**
 * The rim he is dragged to, and the way in from it.
 *
 * The fall's own rim rule has the last word on the crossing point, so the edge
 * he is hauled to and the edge the fall turns him about can never be two
 * different edges.
 */
const rimHauledTo = (killed: BossKilled, grave: Grave): Hinge => {
  const crossing = whereThePullCrosses(killed, grave);
  return rimCrossedAt(crossing.x, crossing.y);
};

const sceneFrom = (killed: BossKilled, grave: Grave): EndingScene => {
  const rim = rimHauledTo(killed, grave);
  return {
    boss: killed.boss,
    fromX: killed.x,
    fromY: killed.y,
    graveX: grave.x,
    graveY: grave.y,
    graveSize: grave.size,
    rimX: grave.x + rim.x * grave.size,
    rimY: grave.y + rim.y * grave.size,
    intoX: rim.intoX,
    intoY: rim.intoY,
  };
};

/** The rim the record was built round, back in the grave's own half-lengths. */
const rimOf = (scene: EndingScene): Hinge => ({
  x: (scene.rimX - scene.graveX) / scene.graveSize,
  y: (scene.rimY - scene.graveY) / scene.graveSize,
  intoX: scene.intoX,
  intoY: scene.intoY,
});

/**
 * The half extent of his body along the way into the hole, which is what the
 * fall foreshortens and folds. He is wider than he is tall, so which of the two
 * it is depends on whether he goes over a side of the grave or an end of it.
 */
const halfExtentIntoTheHole = (hinge: Hinge): number =>
  hinge.intoX === 0 ? BOSS_HALF_HEIGHT : BOSS_HALF_WIDTH;

/**
 * How far along the crossing he has been hauled, from nothing to whole.
 *
 * The ease-in is what separates the grave taking him from a man walking into a
 * hole: the slack goes first and the haul follows.
 */
const hauledBy = (progress: number): number =>
  clamp(progress / ENDING_BEATS.drag, 0, 1) ** ENDING_DRAG_EASE;

/** Him on the ground: hauled along the crossing, upright, whole and in the moon. */
const draggedAt = (
  scene: EndingScene,
  progress: number,
): EndingSceneDrawing => {
  const hauled = hauledBy(progress);
  return {
    x: scene.fromX + (scene.rimX - scene.fromX) * hauled,
    y: scene.fromY + (scene.rimY - scene.fromY) * hauled,
    inTheHole: false,
    turn: 0,
    wide: 1,
    tall: 1,
    light: 1,
    gone: false,
    furrows: hauled,
  };
};

/**
 * How old the fall is at this progress, in the run's own ticks.
 *
 * The scene's tip and fall beats are laid over the fall's own two halves rather
 * than over its whole length, so each of the two rows is a dial of its own and
 * the shape inside each half is the one a swallowed corpse falls on.
 */
const fallAgeAt = (progress: number): number => {
  if (progress < FALL_STARTS) {
    return ((progress - TIP_STARTS) / ENDING_BEATS.tip) * TIP_TICKS;
  }
  return (
    TIP_TICKS + ((progress - FALL_STARTS) / ENDING_BEATS.fall) * DROP_TICKS
  );
};

/**
 * Him over the edge: the shared fall, drawn from the rim he was hauled to with
 * nothing carrying him across the shaft, because the grave pulled him in rather
 * than his own flight.
 *
 * The fall answers in the way-into-the-hole's own frame, so the turn is read
 * against the way he came to rest and the two stretches are handed back on his
 * own axes: the drawing rotates his silhouette and never re-derives either.
 */
const fallingAt = (
  scene: EndingScene,
  progress: number,
): EndingSceneDrawing => {
  const hinge = rimOf(scene);
  const fall: Fall = {
    unitX: hinge.x,
    unitY: hinge.y,
    unitVx: 0,
    unitVy: 0,
    halfExtent: halfExtentIntoTheHole(hinge),
    born: 0,
  };
  const drawn = fallAt(fall, fallAgeAt(progress), scene.graveSize);
  const restingAt = Math.atan2(hinge.intoY, hinge.intoX);
  const alongIsHisWidth = hinge.intoX !== 0;
  return {
    x: drawn.x,
    y: drawn.y,
    inTheHole: true,
    turn: drawn.turn - restingAt,
    wide: alongIsHisWidth ? drawn.along : drawn.across,
    tall: alongIsHisWidth ? drawn.across : drawn.along,
    light: drawn.light,
    gone: drawn.gone,
    furrows: 1,
  };
};

/**
 * The scene at this progress: hauled to the rim, held there clawing while the
 * furrows stand, then over the edge and down (design record R6).
 */
const endingSceneAt = (
  scene: EndingScene,
  progress: number,
): EndingSceneDrawing => {
  if (progress < TIP_STARTS) return draggedAt(scene, progress);
  return fallingAt(scene, progress);
};

export { endingSceneAt, ENDING_SCENE_MS, sceneFrom };
export type { EndingScene, EndingSceneDrawing };
