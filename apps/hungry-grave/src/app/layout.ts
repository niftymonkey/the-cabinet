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

export const FIELD_WIDTH = 540;
export const FIELD_HEIGHT = 760;

/**
 * The boundary readout's stroke, in field units. It lives here rather than
 * beside the drawing because what fixes it is a viewport measurement, not a
 * taste: APCA grants its Lc 30 level to solid non-text no thinner than 5.5
 * rendered pixels, and a phone shows the field at about 0.72 CSS pixels per
 * field unit, so anything under about 7.6 units falls out of that level and
 * into the fine-detail one no colour under ADR 0014's ceiling can reach.
 */
export const BOUNDARY_STROKE = 8;

export interface FieldPlacement {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

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

/** Fits the whole field inside the viewport, centred, preserving its aspect (ADRs 0003 and 0009). */
export function fitField(
  viewportWidth: number,
  viewportHeight: number,
): FieldPlacement {
  if (!isMeasurable(viewportWidth) || !isMeasurable(viewportHeight)) {
    return DEGENERATE_PLACEMENT;
  }
  const scale = Math.min(
    viewportWidth / FIELD_WIDTH,
    viewportHeight / FIELD_HEIGHT,
  );
  return {
    scale,
    offsetX: (viewportWidth - FIELD_WIDTH * scale) / 2,
    offsetY: (viewportHeight - FIELD_HEIGHT * scale) / 2,
  };
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
