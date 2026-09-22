// The tip: how much of a piece of food is over the grave's mouth.

import { FIELD_HEIGHT, FIELD_WIDTH } from './field';
import type { Rect } from './overlap';

/**
 * The area two boxes share, and zero where they share none.
 *
 * Half-open on both axes, the convention `overlap.ts` states for `overlaps`, so
 * two boxes sharing exactly an edge share no area. It lives here rather than
 * beside `overlaps` because nothing else in the sim wants an area: `overlaps`
 * and `circleOverlapsBox` both answer whether, and this is the one caller that
 * asks how much.
 */
const sharedArea = (a: Rect, b: Rect): number => {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  if (width <= 0 || height <= 0) return 0;
  return width * height;
};

/**
 * The part of a box that is inside the field, which may be none of it.
 *
 * Food is not held inside the field the way the grave is: `containGrave` clamps
 * the grave's whole box in, and the only cull a corpse has checks the bottom
 * edge, so a shove can leave one lying across a side edge.
 */
const insideTheField = (box: Rect): Rect => {
  const left = Math.max(box.x, 0);
  const top = Math.max(box.y, 0);
  const right = Math.min(box.x + box.width, FIELD_WIDTH);
  const bottom = Math.min(box.y + box.height, FIELD_HEIGHT);
  return {
    x: left,
    y: top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
};

/**
 * How much of this food is over this mouth, from 0 to 1 (design record R1).
 *
 * The share is the area the two share over the most of the food that could ever
 * be over this mouth, which is min(food width, mouth width) times min(food
 * height, mouth height). The division is what lets the grave take food of any
 * size: food wider than the mouth still reaches 1 once the mouth's whole width
 * is under it, which is how ADR 0003's rule that size never gates a swallow
 * stays true, and a sliver over the edge never does.
 *
 * Both halves count only the part of the food inside the field, because the
 * part outside it can never be over any mouth. Without that, a corpse centred
 * on a side edge tops out at exactly one half at every grave size and could
 * never be swallowed at all, while the grave's own box is held inside the field
 * and cannot reach out to it.
 *
 * Food with nothing inside the field answers zero rather than dividing by a
 * most of nothing. Everywhere else the most is above zero, because both boxes
 * have width and height, so the answer is always a number.
 *
 * Plain arithmetic only, so a tape replays the same on a phone and a computer
 * (ADR 0015).
 */
const shareOverMouth = (food: Rect, mouth: Rect): number => {
  const inField = insideTheField(food);
  if (inField.width <= 0 || inField.height <= 0) return 0;
  const most =
    Math.min(inField.width, mouth.width) *
    Math.min(inField.height, mouth.height);
  return sharedArea(inField, mouth) / most;
};

/**
 * Two boxes in and a share out, with no run state, so the drawing code asks the
 * rules' own question rather than a second one wearing the same name. The
 * second caller is slice 4's teeter (design record R5, "The teeter is the tell
 * for the new rule").
 */
export { shareOverMouth };
