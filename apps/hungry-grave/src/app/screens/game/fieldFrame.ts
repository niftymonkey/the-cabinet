// The playfield's own edge: the boundary readout that draws it and the clip that holds drawing inside it.

import { Graphics } from 'pixi.js';

import { FIELD_HEIGHT, FIELD_WIDTH } from '../../../game/field';
import { BOUNDARY_STROKE } from '../../layout';
import { PALETTE } from '../../palette';

/**
 * The playfield's boundary readout. The engine's background and the field's
 * ground are both night, so this outline is the only visible edge of the field,
 * and that edge is the bound on the grave's movement. That makes it a readout
 * and not scenery, which is why it carries a contrast floor of its own and a
 * width the floor depends on. It strokes inward so the whole of it stays inside
 * the field's own 540 by 760.
 */
const boundaryReadout = (): Graphics => {
  return new Graphics().rect(0, 0, FIELD_WIDTH, FIELD_HEIGHT).stroke({
    width: BOUNDARY_STROKE,
    color: PALETTE.fieldFrame.hex,
    alignment: 1,
  });
};

/**
 * The field's clip, exactly the field rect and nothing else.
 *
 * The sim legitimately holds mobs outside the field: a template may place a
 * file up to MAX_ENTRY_DEPTH above the top edge, and a mob is only culled once
 * it is a margin past an edge. Nothing else clipped them, so that off-field
 * approach drew into the letterbox. It shows on a phone and not on a desktop
 * because the field is width-limited on a tall viewport, which is the only
 * case with vertical letterbox for it to draw into.
 *
 * The rect matches boundaryReadout's, and the frame's stroke is inside-aligned,
 * so the clip takes nothing off the frame it shares an edge with.
 *
 * fill() is called bare on purpose. A mask is sampled for coverage and never
 * for colour, so naming one here would be a colour that reaches the field's
 * source and means nothing, which is exactly what palette.test.ts's literal
 * scan is there to stop. The bare call takes Pixi's opaque default.
 */
const fieldClip = (): Graphics => {
  return new Graphics().rect(0, 0, FIELD_WIDTH, FIELD_HEIGHT).fill();
};

export { boundaryReadout, fieldClip };
