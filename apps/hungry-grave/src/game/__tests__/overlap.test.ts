/** The overlap convention, which decides whether a grazing shot is a hit. */

import { describe, expect, it } from 'vitest';
import type { Circle, Rect } from '../overlap';
import { circleOverlapsBox, overlaps } from '../overlap';

function rect(x: number, y: number, width = 10, height = 10): Rect {
  return { x, y, width, height };
}

function circle(x: number, y: number, radius: number): Circle {
  return { x, y, radius };
}

describe('overlaps', () => {
  it('two rectangles sharing exactly an edge do not overlap, and one unit of penetration does', () => {
    const at = rect(0, 0);
    expect(overlaps(at, rect(10, 0))).toBe(false);
    expect(overlaps(at, rect(0, 10))).toBe(false);
    expect(overlaps(at, rect(-10, 0))).toBe(false);
    expect(overlaps(at, rect(0, -10))).toBe(false);

    expect(overlaps(at, rect(9, 0))).toBe(true);
    expect(overlaps(at, rect(0, 9))).toBe(true);
    expect(overlaps(at, rect(-9, 0))).toBe(true);
    expect(overlaps(at, rect(0, -9))).toBe(true);
  });

  it('a corner touch is not an overlap, on either diagonal', () => {
    expect(overlaps(rect(0, 0), rect(10, 10))).toBe(false);
    expect(overlaps(rect(0, 0), rect(-10, -10))).toBe(false);
  });

  it('is symmetric', () => {
    const cases: [Rect, Rect][] = [
      [rect(0, 0), rect(5, 5)],
      [rect(0, 0), rect(10, 0)],
      [rect(0, 0, 40, 40), rect(10, 10)],
      [rect(0, 0), rect(100, 100)],
    ];
    for (const [a, b] of cases) {
      expect(`${overlaps(a, b)}`).toBe(`${overlaps(b, a)}`);
    }
  });

  it('a rectangle wholly inside another overlaps it', () => {
    expect(overlaps(rect(0, 0, 40, 40), rect(10, 10))).toBe(true);
  });
});

describe('circleOverlapsBox', () => {
  it('a box fully inside the circle overlaps', () => {
    expect(circleOverlapsBox(circle(0, 0, 20), rect(-5, -5))).toBe(true);
  });

  it('a box touching only at the circle’s edge overlaps, because the rim is closed', () => {
    // The opposite convention to `overlaps` above, and deliberately so: this
    // predicate decides whether a body standing on the edge of claimed ground
    // counts, and the generous answer is what stops a visible overlap being a
    // miss. A box whose near edge sits exactly on the rim overlaps; one unit
    // further out does not.
    expect(circleOverlapsBox(circle(0, 0, 20), rect(20, -5))).toBe(true);
    expect(circleOverlapsBox(circle(0, 0, 20), rect(21, -5))).toBe(false);
    expect(circleOverlapsBox(circle(0, 0, 20), rect(-5, 20))).toBe(true);
    expect(circleOverlapsBox(circle(0, 0, 20), rect(-5, 21))).toBe(false);
  });

  it('a box outside the circle’s bounding square does not overlap', () => {
    expect(circleOverlapsBox(circle(0, 0, 20), rect(100, 100))).toBe(false);
  });

  it('a box inside the bounding square but past the circle itself does not overlap', () => {
    // The corner case a naive box-against-box test gets wrong. The circle of
    // radius 20 has a bounding square out to 20 on both axes, and a 10-unit
    // box at (17, 17) sits inside that square while its nearest corner is
    // 24.04 units from the centre, which is outside the circle.
    const box = rect(17, 17);
    const bounding = { x: -20, y: -20, width: 40, height: 40 };
    expect(overlaps(bounding, box)).toBe(true);
    expect(circleOverlapsBox(circle(0, 0, 20), box)).toBe(false);
  });
});
