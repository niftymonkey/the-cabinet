// The cut earth and the dark under it: the three wall faces the camera can see, painted over the black.
// The prototype's own painter, ported line for line: its values, counts and draw order are not re-derived, so a change to how it draws is a change to a ruled look, not a cleanup (design record R7, Mark's ruling of 2026-09-21).

import { graveWidth } from '../../../game/grave';
import { PALETTE } from '../../palette';
import type { GraveCanvas, Polygon } from './graveCanvas';
import {
  clamp,
  hex,
  lerp,
  makeRandom,
  onePx,
  rgba,
  TAU,
  tracePolys,
} from './graveCanvas';
import { FACE_STEPS, FACE_WASH, GRAVE_VIEW, SOIL } from './graveDrawingValues';
import { polyBounds, roughAt } from './graveMouth';
import type { Spot } from './graveProjection';
import { belowGround, lightAtDepth } from './graveProjection';

// One cut face, named by the ground edge it hangs under.
interface WallFace {
  readonly id: 'far' | 'right' | 'left';
  readonly from: Spot;
  readonly to: Spot;
  readonly span: number;
  readonly seed: number;
}

/**
 * The one projection, in field units at a size: the painters work in field
 * units around the grave's origin, as the prototype's do, and the projection
 * works in the grave's own half-lengths, which the fall shares.
 */
const belowGroundAt = (
  x: number,
  y: number,
  depth: number,
  size: number,
): Spot => {
  const spot = belowGround(x / size, y / size, depth / size, GRAVE_VIEW);
  return { x: spot.x * size, y: spot.y * size };
};

// How much moon reaches a depth in field units, at a size.
const lightAt = (depth: number, size: number): number =>
  lightAtDepth(depth / size, GRAVE_VIEW);

/**
 * The three cut faces the camera can see, each walked so `along` runs 0 to 1
 * from one end of its ground edge to the other. The near face is not among
 * them: the camera stands behind the grave, so the whole of that face projects
 * past the near lip and the ground hides it.
 */
const wallFaces = (size: number): WallFace[] => {
  const hw = graveWidth(size) / 2;
  return [
    {
      id: 'far',
      from: { x: -hw, y: -size },
      to: { x: hw, y: -size },
      span: graveWidth(size),
      seed: 1374496523,
    },
    {
      id: 'right',
      from: { x: hw, y: -size },
      to: { x: hw, y: size },
      span: size * 2,
      seed: 374761393,
    },
    {
      id: 'left',
      from: { x: -hw, y: size },
      to: { x: -hw, y: -size },
      span: size * 2,
      seed: 668265263,
    },
  ];
};

/** A point on a face: `along` runs its ground edge, `down` is a share of the dark depth. */
const facePoint = (
  face: WallFace,
  size: number,
  along: number,
  down: number,
): Spot =>
  belowGroundAt(
    lerp(face.from.x, face.to.x, along),
    lerp(face.from.y, face.to.y, along),
    GRAVE_VIEW.darkDepth * size * down,
    size,
  );

// One layer of the cut, by its place in SOIL.
const soilLayer = (index: number): (typeof SOIL)[number] => {
  const layer = SOIL[index];
  if (layer === undefined) throw new Error(`no soil layer ${index}`);
  return layer;
};

/**
 * Earth does not lie in ruled bands, so a layer boundary wanders a little
 * along the face. The top of the cut and the depth the light dies at do not:
 * one is the ground's own edge, the other is where the face meets the dark, and
 * a wobble in either shows up as a seam.
 */
const layerWander = (index: number, along: number): number =>
  index === 0 || index === SOIL.length - 1
    ? 0
    : roughAt(along * 1.7 + index * 0.27) * 0.035;

const traceLayerBoundary = (
  ctx: GraveCanvas,
  face: WallFace,
  size: number,
  index: number,
  first: boolean,
): void => {
  for (let s = 0; s <= FACE_STEPS; s++) {
    const along = first ? s / FACE_STEPS : 1 - s / FACE_STEPS;
    const p = facePoint(
      face,
      size,
      along,
      soilLayer(index).at + layerWander(index, along),
    );
    if (s === 0 && first) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
};

/** The face between two of its layer boundaries, as one closed shape. */
const traceFaceBand = (
  ctx: GraveCanvas,
  face: WallFace,
  size: number,
  top: number,
  bottom: number,
): void => {
  ctx.beginPath();
  traceLayerBoundary(ctx, face, size, top, true);
  traceLayerBoundary(ctx, face, size, bottom, false);
  ctx.closePath();
};

/** The whole face, from the ground's edge down to where the light has gone. */
const traceFaceExtent = (
  ctx: GraveCanvas,
  face: WallFace,
  size: number,
): void => traceFaceBand(ctx, face, size, 0, SOIL.length - 1);

/** The layers of the cut, each fill starting at the lip so a boundary is the only seam. */
const paintFaceLayers = (
  ctx: GraveCanvas,
  face: WallFace,
  size: number,
  viewScale: number,
): void => {
  for (let i = SOIL.length - 2; i >= 0; i--) {
    ctx.fillStyle = hex(soilLayer(i).color);
    traceFaceBand(ctx, face, size, 0, i + 1);
    ctx.fill();
  }
  // A seam of darker earth along each boundary, which is what tells one layer
  // from the next once a face is only a few pixels across.
  ctx.lineWidth = Math.max(onePx(0.7, viewScale), size * 0.011);
  ctx.strokeStyle = rgba(PALETTE.graveSeam, 0.45);
  for (let i = 1; i < SOIL.length - 1; i++) {
    ctx.beginPath();
    traceLayerBoundary(ctx, face, size, i, true);
    ctx.stroke();
  }
};

/** Faint marks where the spade came down, so a face reads as cut and not as painted. */
const paintSpadeCuts = (
  ctx: GraveCanvas,
  face: WallFace,
  size: number,
  viewScale: number,
): void => {
  const random = makeRandom(face.seed);
  const cuts = Math.round(clamp(face.span * viewScale * 0.4, 5, 24));
  ctx.lineCap = 'round';
  for (let i = 0; i < cuts; i++) {
    const along = random();
    const top = lerp(0.03, 0.34, random());
    const bottom = clamp(top + lerp(0.18, 0.62, random()), 0, 1);
    const a = facePoint(face, size, along, top);
    const b = facePoint(
      face,
      size,
      clamp(along + lerp(-0.02, 0.02, random()), 0, 1),
      bottom,
    );
    ctx.strokeStyle =
      random() < 0.5
        ? rgba(PALETTE.graveSpadePale, (0.05 + random() * 0.08).toFixed(3))
        : rgba(PALETTE.graveSpadeDark, (0.1 + random() * 0.16).toFixed(3));
    ctx.lineWidth = Math.max(
      onePx(0.7, viewScale),
      size * lerp(0.008, 0.018, random()),
    );
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
};

/** Stones in the face, each with the shadow it throws under itself. */
const paintStones = (
  ctx: GraveCanvas,
  face: WallFace,
  size: number,
  viewScale: number,
  random: () => number,
): void => {
  const stones = Math.round(clamp(face.span * viewScale * 0.12, 3, 11));
  const depthOfDark = GRAVE_VIEW.darkDepth * size;
  const height = GRAVE_VIEW.cameraHeight * size;
  for (let i = 0; i < stones; i++) {
    // Skewed shallow, because a stone below the light is a stone nobody sees.
    const down = lerp(0.1, 0.72, Math.pow(random(), 1.5));
    const at = facePoint(face, size, lerp(0.06, 0.94, random()), down);
    const shrink = height / (height + depthOfDark * down);
    const r = Math.max(
      onePx(1, viewScale),
      size * lerp(0.016, 0.034, random()) * shrink,
    );
    ctx.fillStyle = rgba(
      PALETTE.graveStone,
      (0.34 + random() * 0.22).toFixed(2),
    );
    ctx.beginPath();
    ctx.ellipse(
      at.x,
      at.y,
      r,
      r * lerp(0.55, 0.85, random()),
      random() * TAU,
      0,
      TAU,
    );
    ctx.fill();
    // The shadow a stone standing proud of the face throws under itself.
    ctx.fillStyle = rgba(PALETTE.graveStoneShadow, 0.55);
    ctx.beginPath();
    ctx.ellipse(at.x, at.y + r * 0.75, r * 0.9, r * 0.32, 0, 0, TAU);
    ctx.fill();
  }
};

/** Cut root ends in the face, drawn from the same stream the stones used. */
const paintRoots = (
  ctx: GraveCanvas,
  face: WallFace,
  size: number,
  viewScale: number,
  random: () => number,
): void => {
  const roots = Math.round(clamp(face.span * viewScale * 0.08, 2, 8));
  for (let i = 0; i < roots; i++) {
    const at = facePoint(
      face,
      size,
      lerp(0.05, 0.95, random()),
      lerp(0.05, 0.4, random()),
    );
    const r = Math.max(
      onePx(0.8, viewScale),
      size * lerp(0.008, 0.016, random()),
    );
    ctx.fillStyle = rgba(
      PALETTE.graveRoot,
      (0.24 + random() * 0.16).toFixed(2),
    );
    ctx.beginPath();
    ctx.ellipse(at.x, at.y, r, r * 0.72, 0, 0, TAU);
    ctx.fill();
  }
};

/** Stones and cut root ends in the face, the things a spade goes through. */
const paintFaceStones = (
  ctx: GraveCanvas,
  face: WallFace,
  size: number,
  viewScale: number,
): void => {
  const random = makeRandom(face.seed ^ 1000000007);
  paintStones(ctx, face, size, viewScale, random);
  paintRoots(ctx, face, size, viewScale, random);
};

/** Which side of the moon this face is on, laid over the cut as one flat wash. */
const paintFaceWash = (
  ctx: GraveCanvas,
  face: WallFace,
  size: number,
): void => {
  const wash = FACE_WASH[face.id];
  if (wash === 0) return;
  traceFaceExtent(ctx, face, size);
  ctx.fillStyle =
    wash > 0
      ? rgba(PALETTE.graveMoonWash, wash)
      : rgba(PALETTE.graveShadeWash, -wash);
  ctx.fill();
};

/**
 * The light dying with depth, as a gradient across the face. Depth runs down
 * the screen on the far wall and across it on a side wall, and on both the
 * screen distance from the lip is a straight function of the projection's own
 * shrink, so one set of stops serves either axis.
 */
const paintDepthFade = (
  ctx: GraveCanvas,
  face: WallFace,
  size: number,
): void => {
  const lip = facePoint(face, size, 0.5, 0);
  const deep = facePoint(face, size, 0.5, 1);
  const fade =
    face.id === 'far'
      ? ctx.createLinearGradient(0, lip.y, 0, deep.y)
      : ctx.createLinearGradient(lip.x, 0, deep.x, 0);
  const deepest =
    GRAVE_VIEW.cameraHeight / (GRAVE_VIEW.cameraHeight + GRAVE_VIEW.darkDepth);
  for (let k = 0; k <= 14; k++) {
    const t = k / 14;
    const shrink = 1 - t * (1 - deepest);
    const depth = GRAVE_VIEW.cameraHeight * size * (1 / shrink - 1);
    fade.addColorStop(
      t,
      rgba(PALETTE.graveHole, (1 - lightAt(depth, size)).toFixed(3)),
    );
  }
  traceFaceExtent(ctx, face, size);
  ctx.fillStyle = fade;
  ctx.fill();
};

/**
 * A side wall loses a little more light toward the near lip, where the turf it
 * has to pass leans in over it. It stays a face for its whole length: a side
 * that fades out before the near lip draws a frame round the opening, and a
 * frame is the one shape that stops a hole reading as a hole.
 */
const paintNearLipShade = (
  ctx: GraveCanvas,
  face: WallFace,
  size: number,
): void => {
  if (face.id === 'far') return;
  const shade = ctx.createLinearGradient(0, -size, 0, size);
  shade.addColorStop(0, rgba(PALETTE.graveNearLipShade, 0));
  shade.addColorStop(0.55, rgba(PALETTE.graveNearLipShade, 0.05));
  shade.addColorStop(1, rgba(PALETTE.graveNearLipShade, 0.18));
  traceFaceExtent(ctx, face, size);
  ctx.fillStyle = shade;
  ctx.fill();
};

const paintFace = (
  ctx: GraveCanvas,
  face: WallFace,
  size: number,
  viewScale: number,
): void => {
  ctx.save();
  traceFaceExtent(ctx, face, size);
  ctx.clip();
  paintFaceLayers(ctx, face, size, viewScale);
  paintSpadeCuts(ctx, face, size, viewScale);
  paintFaceStones(ctx, face, size, viewScale);
  ctx.restore();
  paintFaceWash(ctx, face, size);
  paintNearLipShade(ctx, face, size);
  paintDepthFade(ctx, face, size);
};

/**
 * The two edges where the far wall meets a side wall. Each runs from a corner
 * of the opening down into the shaft and goes out with everything around it,
 * and it is what turns a pale band across the top of the opening into the back
 * face of a box.
 */
const paintCornerEdges = (
  ctx: GraveCanvas,
  size: number,
  viewScale: number,
): void => {
  const hw = graveWidth(size) / 2;
  const steps = 16;
  const dark = GRAVE_VIEW.darkDepth * size;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(onePx(1, viewScale), size * 0.018);
  for (const side of [-1, 1]) {
    for (let i = 0; i < steps; i++) {
      const a = belowGroundAt(side * hw, -size, dark * (i / steps), size);
      const b = belowGroundAt(side * hw, -size, dark * ((i + 1) / steps), size);
      const light = lightAt(dark * ((i + 0.5) / steps), size);
      ctx.strokeStyle = rgba(PALETTE.graveCornerEdge, (0.8 * light).toFixed(3));
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
};

/**
 * The cut earth and the dark under it, baked once per size beneath the falls.
 * The grave has no bottom: the black is laid down first, the three faces the
 * camera can see are painted over it, and each one fades into that same black
 * rather than meeting anything.
 */
const paintPit = (
  ctx: GraveCanvas,
  mouth: Polygon,
  size: number,
  viewScale: number,
): void => {
  const { maxX, maxY } = polyBounds(mouth);
  ctx.save();
  tracePolys(ctx, mouth);
  ctx.clip();
  ctx.fillStyle = hex(PALETTE.graveHole);
  ctx.fillRect(-maxX - 4, -maxY - 4, maxX * 2 + 8, maxY * 2 + 8);
  for (const face of wallFaces(size)) paintFace(ctx, face, size, viewScale);
  paintCornerEdges(ctx, size, viewScale);
  ctx.restore();
};

export { facePoint, paintPit, wallFaces };
export type { WallFace };
