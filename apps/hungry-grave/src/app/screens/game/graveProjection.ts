/**
 * The one projection the whole hole is built from: a point below the ground
 * draws where the camera's ray through it meets the ground (design record R4).
 *
 * It works in the grave's own half-lengths, so one unit is the grave's size,
 * the mouth runs from -1 to 1 down the field, and the art built from it scales
 * with every swallow instead of being rebuilt.
 */

/** How deep the moon reaches and how it dies, in the grave's own half-lengths. */
interface GraveDark {
  readonly darkDepth: number;
  readonly darkFalloff: number;
}

/**
 * The camera over one grave and the dark under it, in the grave's own
 * half-lengths: how high the camera stands, and its nadir, the ground point
 * straight under it, from the grave's centre.
 */
interface GraveView extends GraveDark {
  readonly cameraHeight: number;
  readonly nadirX: number;
  readonly nadirY: number;
}

/** Where something draws, in the grave's own half-lengths. */
interface Spot {
  readonly x: number;
  readonly y: number;
}

/**
 * Where a point this far below the ground draws: its own ground position
 * scaled toward the camera's nadir.
 *
 * So depth moves a point toward the nadir, and that shrink is the only thing
 * that makes a wall visible at all. The nadir lies behind every grave, so
 * everything deep converges on a point past the near lip, which is why the near
 * wall never shows; off the middle column it lies to one side as well, so the
 * wall away from the middle shows more than the one toward it.
 */
const belowGround = (
  x: number,
  y: number,
  depth: number,
  view: GraveView,
): Spot => {
  const shrink = view.cameraHeight / (view.cameraHeight + depth);
  return {
    x: view.nadirX + (x - view.nadirX) * shrink,
    y: view.nadirY + (y - view.nadirY) * shrink,
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
export type { GraveDark, GraveView, Spot };
