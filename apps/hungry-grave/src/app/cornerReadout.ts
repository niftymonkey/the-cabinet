// The corner readout stack: where each line sits on the stage and what size it draws at.

const MARGIN = 12;
const LINE_HEIGHT = 20;

// The font size the whole corner stack shares, because a shared line height presumes a shared size.
const METER_FONT_SIZE = 16;

/**
 * Where line `index` of the corner readout stack sits, as a constant offset
 * from the stage origin. The frame-rate meter owns line 0 and the game screen
 * owns the rest, and they position from this one function so the corner
 * geometry has exactly one declaration and the readouts cannot drift apart.
 */
const meterLinePosition = (index: number): { x: number; y: number } => {
  return { x: MARGIN, y: MARGIN + index * LINE_HEIGHT };
};

export { meterLinePosition, METER_FONT_SIZE };
