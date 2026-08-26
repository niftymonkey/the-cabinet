import { FIELD_HEIGHT, FIELD_WIDTH } from '../game/field';

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
const BOUNDARY_STROKE = 2;

interface FieldPlacement {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

/**
 * The two top corners the readouts live in, in stage units: the corner readout
 * stack on the left and the pause button on the right, mirrored.
 *
 * The aim is rectangle non-overlap, and it is an aim rather than an invariant:
 * fitField reaches it by lowering the field only where lowering is free, and
 * lets the readouts sit over the field rather than buy the gap with width. At a
 * wide desktop viewport the side gutter already holds the stack, and an
 * unconditional top reserve would shrink that field by a tenth to solve a
 * problem it does not have.
 *
 * The widths are declared here because layout.ts structurally cannot see them:
 * the stack's width is a pixi text measurement. GameScreen's own test asserts
 * that the measured widths fit inside these, which is the half of the rule this
 * file cannot falsify.
 */
interface ReadoutReserve {
  // How far the readouts sit in from the stage's corner.
  readonly margin: number;
  // How wide a corner the readouts claim, on each side.
  readonly width: number;
  // How far down from the top they reach.
  readonly height: number;
}

const READOUT_RESERVE: ReadoutReserve = {
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
const DEGENERATE_PLACEMENT: FieldPlacement = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

// A viewport dimension the placement can be computed from at all.
const isMeasurable = (dimension: number): boolean => {
  return Number.isFinite(dimension) && dimension > 0;
};

// Once per session, because a resize storm on a hidden tab would otherwise
// report the same unmeasurable viewport on every event.
let reportedDegenerate = false;

// Says that a viewport could not be measured, because nothing abnormal is silent.
const reportDegenerate = (width: number, height: number): void => {
  if (reportedDegenerate) return;
  reportedDegenerate = true;
  console.warn(
    `the viewport measured ${width} by ${height}, which no placement can be computed from; the field is drawn unscaled at the origin until the next measurable resize, and only this first one is reported`,
  );
};

// The whole field, centred inside a box of this size at this top offset.
const centred = (
  viewportWidth: number,
  height: number,
  top: number,
): FieldPlacement => {
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
};

// Half-open on both axes, the same convention the sim's own overlap uses, so touching edges do not intersect.
const intersects = (
  placement: FieldPlacement,
  corner: { x: number; width: number; height: number },
): boolean => {
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
};

// Whether either readout corner would sit over the field at this placement.
const coversAReadout = (
  placement: FieldPlacement,
  viewportWidth: number,
  reserve: ReadoutReserve,
): boolean => {
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
};

/**
 * Fits the whole field inside the viewport, centred, preserving its aspect
 * (ADRs 0003 and 0009), and lowers it below the reserve whenever the natural
 * fit would put a readout over the field and the lowering is free.
 *
 * Free means the field keeps every unit of its width. A field with vertical
 * slack to spare simply moves down into it; a field that already fills the
 * viewport's height can only be lowered by being shrunk, and shrinking it
 * narrows the play area on the axis a phone has least of.
 *
 * Mark ruled on 2026-08-22 that the field never pays width for a readout, after
 * playing a phone window short enough to trigger the shrink: the URL bar ate
 * the height, the field paid the reserve in width, and a refresh that collapsed
 * the bar gave the width back. The corner readouts are dev-only and come out
 * before v1, and the pause button is a solid shape a mob can pass behind for a
 * moment, so a readout over the field is the cheaper of the two costs. It is
 * the same argument the degenerate case below already carries.
 *
 * This is why there is no wide-versus-tall rule and no viewport breakpoint. A
 * 1024-wide desktop and a short phone window are the same shape here, the field
 * filling the height with no slack, and they get the same answer.
 */
const fitField = (
  viewportWidth: number,
  viewportHeight: number,
  reserve: ReadoutReserve = READOUT_RESERVE,
): FieldPlacement => {
  if (!isMeasurable(viewportWidth) || !isMeasurable(viewportHeight)) {
    reportDegenerate(viewportWidth, viewportHeight);
    return DEGENERATE_PLACEMENT;
  }
  const natural = centred(viewportWidth, viewportHeight, 0);
  if (!coversAReadout(natural, viewportWidth, reserve)) return natural;

  const available = viewportHeight - reserve.height;
  // A viewport shorter than the reserve has nothing left to fit into, and a
  // readout over the field beats a field with no height at all.
  if (available <= 0) return natural;

  const lowered = centred(viewportWidth, available, reserve.height);
  /**
   * The comparison is exact rather than tolerant on purpose. When the lowering
   * is free both scales are the same `viewportWidth / FIELD_WIDTH` expression
   * and are bit-identical, so no rounding case sits on the boundary for an
   * epsilon to arbitrate.
   */
  if (lowered.scale < natural.scale) return natural;
  return lowered;
};

// A viewport point back in field units. The inverse of the placement, and how touch input reaches the sim.
const screenToField = (
  placement: FieldPlacement,
  screenX: number,
  screenY: number,
): { x: number; y: number } => {
  return {
    x: (screenX - placement.offsetX) / placement.scale,
    y: (screenY - placement.offsetY) / placement.scale,
  };
};

export {
  fitField,
  screenToField,
  BOUNDARY_STROKE,
  READOUT_RESERVE,
  DEGENERATE_PLACEMENT,
};
export type { FieldPlacement, ReadoutReserve };
