/** The overlap convention, which decides whether a grazing shot is a hit. */

import { describe, expect, it } from 'vitest';
import type { Rect } from '../overlap';
import { overlaps } from '../overlap';

function rect(x: number, y: number, width = 10, height = 10): Rect {
  return { x, y, width, height };
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
