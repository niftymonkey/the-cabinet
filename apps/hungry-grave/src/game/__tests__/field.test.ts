/**
 * The shapes a run's field can take (design record T12, A30): fixed across,
 * and as tall as the run asks within two bounds, in whole field units.
 */

import { describe, expect, it } from 'vitest';

import {
  FIELD_WIDTH,
  SHORTEST_FIELD,
  SHORTEST_FIELD_HEIGHT,
  TALLEST_FIELD_HEIGHT,
  fieldOfHeight,
} from '../field';

describe('the field', () => {
  it('is 540 wide and from 760 to 1260 tall, in whole units', () => {
    // A30: 760 is today's squat shape, 1260 is 21:9 over the 540 width.
    expect(FIELD_WIDTH).toBe(540);
    expect(SHORTEST_FIELD_HEIGHT).toBe(760);
    expect(TALLEST_FIELD_HEIGHT).toBe(1260);
    expect(SHORTEST_FIELD).toEqual({ width: 540, height: 760 });
  });

  it('of a supported height carries that height, and a height of 759, 1261 or 900.5 throws', () => {
    // A30: the height is recorded and read by the sim's edges, so only whole
    // units inside the bounds exist; anything else reaching here is a bug.
    expect(fieldOfHeight(760)).toEqual({ width: 540, height: 760 });
    expect(fieldOfHeight(1168)).toEqual({ width: 540, height: 1168 });
    expect(fieldOfHeight(1260)).toEqual({ width: 540, height: 1260 });
    expect(() => fieldOfHeight(759)).toThrow();
    expect(() => fieldOfHeight(1261)).toThrow();
    expect(() => fieldOfHeight(900.5)).toThrow();
  });
});
