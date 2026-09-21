/**
 * The drawing's own values for the grave in the ground: the projection's
 * constants and every proportion the hole's art is built from (design record
 * R4, "Values are data").
 *
 * Every proportion is a share of the opening, because the art is built once in
 * the grave's own half-lengths and scaled by its size on every swallow. A
 * number that were a field unit here would stop being the same picture the
 * moment the grave grew.
 */

import type { GraveView } from './graveProjection';

/**
 * The camera and the dark, in the grave's own half-lengths (the prototype's
 * build 7, which Mark played to his final values).
 *
 * The height and the setback are what the walls' shares of the opening come out
 * at: at this pair each side wall is about a sixth of the opening across and
 * the far wall about a third of it along, which is what an open grave looks
 * like from nearly overhead. The grave has no bottom, so `darkDepth` is where
 * the moon stops reaching the walls rather than where they end.
 */
const GRAVE_VIEW: GraveView = {
  cameraHeight: 4.95,
  cameraBehind: 1.07,
  darkDepth: 2.4,
  darkFalloff: 2.6,
};

/**
 * How many bands one cut face is painted in, from the lip to the dark.
 *
 * The light dies on a curve, so a face is a stack of flat bands rather than one
 * fill: nine is where the banding stops being visible at the ceiling size and
 * still costs nine quads a face.
 */
const FACE_BANDS = 9;

/**
 * How much of the moon each cut face keeps, as a share of the wall's own value.
 *
 * The moon is off to the left of the field, so the right-hand face catches it,
 * the far face takes it at a glance and the left-hand face is left in shade.
 * That difference is most of what makes a box cut into the ground read as a box
 * rather than as a panel with two slivers beside it, and it is why the two side
 * walls read at different widths although the projection makes them the same.
 */
const FACE_MOON = { far: 0.62, right: 1, left: 0.38 } as const;

/**
 * How dark the edge where the far face meets a side face is drawn, as a share
 * of full. Without it a lit band across the top of the opening reads as a strip
 * of paint rather than as the back of a box.
 */
const CORNER_EDGE_INK = 0.75;

// How thick that edge is stroked, as a share of the opening's width.
const CORNER_EDGE_WIDTH = 0.035;

/**
 * The one bound on everything the grave draws outside its hitbox, as a share of
 * the opening's width. The bites, the trodden margin, the tufts and the
 * overhanging grass all sit inside it, and `GraveRenderer.test.ts` holds them
 * to it: ADR 0003 makes the rim's outer edge the hitbox, so anything past it is
 * ground dressing and has to stay small enough never to read as the grave.
 */
const ART_REACH_OUTSIDE = 0.22;

/**
 * Where the ground gave way at the lip. Each bite is a place round the mouth's
 * own perimeter, how far round it runs, and how deep it goes as a share of
 * `BITE_REACH`.
 *
 * They are bites and not a wobble, so the four sides stay straight lines in
 * between, which is the difference between a dug rectangle and a misshapen
 * blob. They are written down rather than drawn from anything, because a
 * renderer takes no randomness and an irregular shape has to be written to be
 * irregular.
 */
const LIP_BITES = [
  { at: 0.065, span: 0.02, depth: 1 },
  { at: 0.215, span: 0.013, depth: 0.55 },
  { at: 0.31, span: 0.017, depth: 0.8 },
  { at: 0.705, span: 0.022, depth: 1 },
  { at: 0.82, span: 0.011, depth: 0.5 },
  { at: 0.905, span: 0.015, depth: 0.75 },
] as const;

// How far the deepest bite reaches outside the mouth, as a share of the opening's width.
const BITE_REACH = 0.06;

/**
 * The bare trodden earth outside the lip, as one swell per patch round the
 * perimeter. It is laid down as overlapping patches rather than as a ring: a
 * ring has an outline, and an even halo round an opening reads as a shadow,
 * which a hole does not cast.
 */
const MARGIN_SWELL = [
  0.35, 0.9, 0.5, 0.2, 0.45, 1, 0.6, 0.3, 0.8, 0.4, 0.25, 0.7, 0.95, 0.45, 0.3,
  0.6,
] as const;

// How far the fullest patch of margin reaches out, as a share of the opening's width.
const MARGIN_REACH = 0.09;

// How wide one patch of margin is drawn, as a share of the opening's width.
const MARGIN_PATCH = 0.08;

// How solid the pale half of the margin draws, and how solid its dark half.
const MARGIN_PALE_ALPHA = 0.5;
const MARGIN_DARK_ALPHA = 0.35;

/**
 * The shadow the turf throws just inside the edge, as a share of the opening's
 * width, and how solid it draws.
 *
 * It is kept narrow deliberately: a side wall is about a sixth of the opening
 * across, and a shadow that took half of that would leave a sliver instead of a
 * face. The far lip carries a heavier one, because that is the edge the turf
 * overhangs toward the camera.
 */
const TURF_SHADOW = 0.02;
const TURF_SHADOW_FAR = 0.07;
const TURF_SHADOW_ALPHA = 0.55;

/**
 * The blades hanging in over the cut, each rooted a share of the way round the
 * perimeter, reaching a share of the opening's width and leaning a share of
 * that reach along the edge.
 *
 * Nothing along the near lip: grass there leans toward the camera and only ever
 * reads as a fringe laid across the bottom of the opening.
 */
const OVERHANGING_GRASS = [
  { at: 0.02, reach: 0.09, lean: 0.5 },
  { at: 0.055, reach: 0.07, lean: -0.3 },
  { at: 0.12, reach: 0.1, lean: 0.2 },
  { at: 0.19, reach: 0.075, lean: -0.45 },
  { at: 0.27, reach: 0.095, lean: 0.35 },
  { at: 0.345, reach: 0.07, lean: -0.2 },
  { at: 0.64, reach: 0.085, lean: 0.4 },
  { at: 0.72, reach: 0.1, lean: -0.35 },
  { at: 0.79, reach: 0.07, lean: 0.25 },
  { at: 0.86, reach: 0.095, lean: -0.5 },
  { at: 0.93, reach: 0.08, lean: 0.3 },
  { at: 0.975, reach: 0.065, lean: -0.25 },
] as const;

// How thick one blade is stroked, as a share of the opening's width.
const BLADE_WIDTH = 0.022;

/**
 * The tufts growing on the ground round the grave, each rooted a share of the
 * way round the perimeter, standing a share of the opening's width outside it
 * and throwing this many blades (Mark's decision 7).
 *
 * They draw translucent, so the ground under them shows through and changes as
 * the grave moves over it. The value is what makes them growth on the field
 * rather than a border drawn round the hole.
 */
const TUFTS = [
  { at: 0.03, out: 0.055, reach: 0.12, lean: 0.4 },
  { at: 0.155, out: 0.07, reach: 0.13, lean: -0.3 },
  { at: 0.25, out: 0.05, reach: 0.1, lean: 0.25 },
  { at: 0.375, out: 0.065, reach: 0.12, lean: -0.45 },
  { at: 0.46, out: 0.05, reach: 0.09, lean: 0.35 },
  { at: 0.55, out: 0.07, reach: 0.12, lean: -0.2 },
  { at: 0.66, out: 0.05, reach: 0.11, lean: 0.45 },
  { at: 0.755, out: 0.065, reach: 0.13, lean: -0.35 },
  { at: 0.88, out: 0.055, reach: 0.12, lean: 0.3 },
  { at: 0.965, out: 0.07, reach: 0.1, lean: -0.4 },
] as const;

// How many blades one tuft throws, and how far they fan apart as a share of the reach.
const TUFT_BLADES = 3;
const TUFT_FAN = 0.55;

/**
 * How solid a tuft draws. Mark's decision 7 asks for growth the ground shows
 * through, so this is the value that carries the whole tell, and it is his to
 * judge in play.
 */
const TUFT_ALPHA = 0.7;

/**
 * How far down the field a piece of art may sit and still be treated as hanging
 * off the far or a side edge, as a share of the grave's own half-length. Past
 * it the near lip is between the camera and the cut, so nothing is drawn there.
 */
const NEAR_LIP_FROM = 0.5;

export {
  ART_REACH_OUTSIDE,
  BITE_REACH,
  BLADE_WIDTH,
  CORNER_EDGE_INK,
  CORNER_EDGE_WIDTH,
  FACE_BANDS,
  FACE_MOON,
  GRAVE_VIEW,
  LIP_BITES,
  MARGIN_DARK_ALPHA,
  MARGIN_PALE_ALPHA,
  MARGIN_PATCH,
  MARGIN_REACH,
  MARGIN_SWELL,
  NEAR_LIP_FROM,
  OVERHANGING_GRASS,
  TUFT_ALPHA,
  TUFT_BLADES,
  TUFT_FAN,
  TUFTS,
  TURF_SHADOW,
  TURF_SHADOW_ALPHA,
  TURF_SHADOW_FAR,
};
