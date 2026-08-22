import { FIELD_HEIGHT, FIELD_WIDTH } from "../game/field";

/**
 * The fixed field fitted into any viewport. The only module in the app that
 * knows about the viewport, and nothing in src/game may import it.
 *
 * It knows nothing about device pixels and must never ask for
 * devicePixelRatio: the renderer handles that through its resolution, and
 * GameScreen.resize is handed logical stage units, so reaching for the ratio
 * here would double-scale everything.
 *
 * screenToField exists rather than container.toLocal() because of the import
 * boundary: src/input may not reach src/app, so a pointer handler in
 * src/app/screens/game converts event.global here and hands src/input a point
 * already in field units.
 */

/**
 * The boundary readout's stroke, in field units.
 *
 * It was 8 until 2026-08-22, because the boundary was graded in APCA's solid
 * bracket, and that bracket carries a floor of 5.5 rendered pixels which a
 * phone's 0.72 CSS pixels per field unit turns into about 7.6 units. Mark
 * played the field and called the resulting band too heavy, so the boundary
 * was re-graded into the fine-detail bracket instead, which carries no width
 * floor at all, and `fieldFrame` was raised to the one narrow window of luma
 * that reaches Lc 45 against night without spending mob fire's own margin.
 * That is the same move ADR 0014 already made for the grave's rim.
 *
 * 2 is then a taste, not a measurement, and it is the first number in this
 * file that is. What still lives here is the pairing: the width and the colour
 * are one decision, and research 7.6 says so, so a later re-value of
 * `fieldFrame` downward has to fail a test rather than quietly leave a stroke
 * too thin for the bracket it is being judged in.
 */
export const BOUNDARY_STROKE = 2;

export interface FieldPlacement {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

/**
 * The two top corners the readouts live in, in stage units: the corner readout
 * stack on the left and the pause button on the right, mirrored.
 *
 * The invariant is rectangle non-overlap, not a reserved band. Reserving space
 * is one of two ways to reach it and it is the expensive one, so the field is
 * only refitted when the natural fit would actually put a readout over it. At a
 * wide desktop viewport the side gutter already holds the stack, and an
 * unconditional top reserve would shrink that field by a tenth to solve a
 * problem it does not have.
 *
 * The widths are declared here because layout.ts structurally cannot see them:
 * the stack's width is a pixi text measurement. GameScreen's own test asserts
 * that the measured widths fit inside these, which is the half of the rule this
 * file cannot falsify.
 */
export interface ReadoutReserve {
  /** How far the readouts sit in from the stage's corner. */
  readonly margin: number;
  /** How wide a corner the readouts claim, on each side. */
  readonly width: number;
  /** How far down from the top they reach. */
  readonly height: number;
}

export const READOUT_RESERVE: ReadoutReserve = {
  margin: 12,
  width: 260,
  height: 120,
};

/**
 * What a viewport nobody can measure is treated as: the field at its own size,
 * in the corner. A browser reports a zero or a non-finite viewport during boot
 * and during an orientation change, and a NaN scale poisons every coordinate
 * downstream. The identity placement is the one fallback that needs no other
 * number to justify it, and the next real resize replaces it.
 */
export const DEGENERATE_PLACEMENT: FieldPlacement = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

/** A viewport dimension the placement can be computed from at all. */
function isMeasurable(dimension: number): boolean {
  return Number.isFinite(dimension) && dimension > 0;
}

/** The whole field, centred inside a box of this size at this top offset. */
function centred(
  viewportWidth: number,
  height: number,
  top: number,
): FieldPlacement {
  const scale = Math.min(viewportWidth / FIELD_WIDTH, height / FIELD_HEIGHT);
  return {
    scale,
    // The margins are non-negative by construction, and the floor is there
    // because they are not non-negative in binary64: height / FIELD_HEIGHT
    // multiplied back by FIELD_HEIGHT overshoots by about 1e-13, which is
    // enough to put the field's top a hair above the reserve it was just moved
    // below and fail the non-overlap invariant on a rounding error.
    offsetX: Math.max(0, (viewportWidth - FIELD_WIDTH * scale) / 2),
    offsetY: Math.max(top, top + (height - FIELD_HEIGHT * scale) / 2),
  };
}

/** Half-open on both axes, the same convention the sim's own overlap uses, so touching edges do not intersect. */
function intersects(
  placement: FieldPlacement,
  corner: { x: number; width: number; height: number },
): boolean {
  const left = placement.offsetX;
  const right = left + FIELD_WIDTH * placement.scale;
  const top = placement.offsetY;
  const bottom = top + FIELD_HEIGHT * placement.scale;
  return (
    left < corner.x + corner.width &&
    corner.x < right &&
    top < corner.height &&
    0 < bottom
  );
}

/** Whether either readout corner would sit over the field at this placement. */
function coversAReadout(
  placement: FieldPlacement,
  viewportWidth: number,
  reserve: ReadoutReserve,
): boolean {
  if (reserve.width <= 0 || reserve.height <= 0) return false;
  const corners = [
    { x: 0, width: reserve.width, height: reserve.height },
    {
      x: viewportWidth - reserve.width,
      width: reserve.width,
      height: reserve.height,
    },
  ];
  return corners.some((corner) => intersects(placement, corner));
}

/**
 * Fits the whole field inside the viewport, centred, preserving its aspect
 * (ADRs 0003 and 0009), and refits below the reserve whenever the natural fit
 * would put a readout over the field.
 *
 * A height reduction answers both branches and there is no wide-versus-tall
 * case. The gutter fails as the viewport aspect approaches the field's own, and
 * it also fails at ordinary desktop widths where the vertical offset is already
 * zero, so a rule that refitted only tall viewports would leave a readout over
 * the field on a 1024-wide window with no refit available.
 */
export function fitField(
  viewportWidth: number,
  viewportHeight: number,
  reserve: ReadoutReserve = READOUT_RESERVE,
): FieldPlacement {
  if (!isMeasurable(viewportWidth) || !isMeasurable(viewportHeight)) {
    return DEGENERATE_PLACEMENT;
  }
  const natural = centred(viewportWidth, viewportHeight, 0);
  if (!coversAReadout(natural, viewportWidth, reserve)) return natural;

  const available = viewportHeight - reserve.height;
  // A viewport shorter than the reserve has nothing left to fit into, and a
  // readout over the field beats a field with no height at all.
  if (available <= 0) return natural;
  return centred(viewportWidth, available, reserve.height);
}

/** A viewport point back in field units. The inverse of the placement, and how touch input reaches the sim. */
export function screenToField(
  placement: FieldPlacement,
  screenX: number,
  screenY: number,
): { x: number; y: number } {
  return {
    x: (screenX - placement.offsetX) / placement.scale,
    y: (screenY - placement.offsetY) / placement.scale,
  };
}
