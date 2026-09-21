/** The grave's opening as the prototype cuts it (build 7, slice 6 of #148). */

import { describe, expect, it } from 'vitest';

import { graveWidth } from '../../../../game/grave';
import { mouthPolygon } from '../graveMouth';

/** How far a polygon reaches from its middle, across and down. */
const reachOf = (poly: readonly number[]): { x: number; y: number } => {
  let x = 0;
  let y = 0;
  for (let i = 0; i + 1 < poly.length; i += 2) {
    x = Math.max(x, Math.abs(poly[i] ?? 0));
    y = Math.max(y, Math.abs(poly[i + 1] ?? 0));
  }
  return { x, y };
};

describe("the grave's opening (design record R4, slice 6)", () => {
  it('the grave is repainted when its size changes: the mouth at 33 is cut wider and longer than at 27', () => {
    // The prototype cuts the mouth afresh at each size rather than scaling one
    // cut, so its screen-pixel details keep their size as the grave grows.
    const small = reachOf(mouthPolygon(27));
    const large = reachOf(mouthPolygon(33));
    expect(large.x).toBeGreaterThan(small.x);
    expect(large.y).toBeGreaterThan(small.y);
    // The cut is the grave's own rectangle, its bites only ever going outward.
    expect(small.x).toBeGreaterThanOrEqual(graveWidth(27) / 2 - 1e-9);
    expect(small.y).toBeGreaterThanOrEqual(27 - 1e-9);
  });
});
