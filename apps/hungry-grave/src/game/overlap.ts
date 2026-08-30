// Whether two pieces of field-unit geometry overlap, each predicate stating the
// convention it decides an exact touch by.

// A rectangle in field units, as a top-left corner and a size.
interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

// A circle in field units, as a centre and a radius.
interface Circle {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
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

/**
 * Whether a circle reaches an axis-aligned rectangle, closed on both shapes, so
 * a rectangle grazing the circle's rim exactly does overlap.
 *
 * The other convention in this file is the opposite one, and that is
 * deliberate rather than an oversight: `overlaps` decides whether a shot grazing
 * a rim counts, where this decides whether a body standing on the edge of
 * claimed ground counts, and the generous answer is the one that keeps a
 * visible overlap from being a miss.
 *
 * A leaf helper, as `overlaps` is: it answers whether there is an overlap and
 * every caller decides for itself what one means. The nearest point on the
 * rectangle is what makes it exact, where a bounding-square test would call a
 * corner near the circle a hit.
 */
const circleOverlapsBox = (circle: Circle, box: Rect): boolean => {
  const nearestX = Math.min(Math.max(circle.x, box.x), box.x + box.width);
  const nearestY = Math.min(Math.max(circle.y, box.y), box.y + box.height);
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
};

export { overlaps, circleOverlapsBox };
export type { Rect, Circle };
