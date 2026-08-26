// Rectangle overlap in field units.

// A rectangle in field units, as a top-left corner and a size.
interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Axis-aligned overlap, half-open on both axes, so two rectangles sharing
 * exactly an edge do not overlap.
 *
 * A leaf helper, not a seam with a policy in it: every caller decides for
 * itself what an overlap means, and this only answers whether there is one.
 *
 * Stating the convention matters more than which one is picked: a shot grazing
 * the rim is a hit or a miss depending on it, and an unstated convention gets
 * flipped by the next person who reads the code.
 */
const overlaps = (a: Rect, b: Rect): boolean => {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
};

export { overlaps };
export type { Rect };
