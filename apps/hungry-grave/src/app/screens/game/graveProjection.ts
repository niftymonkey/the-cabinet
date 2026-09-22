/**
 * The one projection the whole hole is built from: a point below the ground
 * draws where the camera's ray through it meets the ground (design record R4).
 *
 * It works in the grave's own half-lengths, so one unit is the grave's size,
 * the mouth runs from -1 to 1 down the field, and the art built from it scales
 * with every swallow instead of being rebuilt.
 */

/** The camera and the dark, in the grave's own half-lengths. */
interface GraveView {
  readonly cameraHeight: number;
  readonly cameraBehind: number;
  readonly darkDepth: number;
  readonly darkFalloff: number;
}

/** Where something draws, in the grave's own half-lengths. */
interface Spot {
  readonly x: number;
  readonly y: number;
}

/**
 * Where a point this far below the ground draws: its own ground position
 * scaled toward the spot the camera stands over.
 *
 * So depth moves a point down the field and toward the middle, and that shrink
 * is the only thing that makes a side wall visible at all. Because the camera
 * stands a little behind the grave, everything deep converges on a point past
 * the near lip, which is why the near wall never shows and the deep middle of
 * the opening is wall seen end on, going black.
 */
const belowGround = (
  x: number,
  y: number,
  depth: number,
  view: GraveView,
): Spot => {
  const shrink = view.cameraHeight / (view.cameraHeight + depth);
  return {
    x: x * shrink,
    y: view.cameraBehind + (y - view.cameraBehind) * shrink,
  };
};

/**
 * How much of the moon still reaches something at a depth, from whole at the
 * ground to gone at the dark depth.
 *
 * `Math.pow` is allowed here and nowhere in `src/game`: this is drawing code,
 * and the exact-arithmetic rule binds the rules alone, because a tape must
 * replay the same on a phone and a computer.
 */
const lightAtDepth = (depth: number, view: GraveView): number => {
  const share = Math.min(1, Math.max(0, depth / view.darkDepth));
  return 1 - Math.pow(share, view.darkFalloff);
};

export { belowGround, lightAtDepth };
export type { GraveView, Spot };
