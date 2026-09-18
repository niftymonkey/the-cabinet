// The one reading every place that shows a score is held to.

import { describe, expect, it } from 'vitest';
import { scoreReading, SCORE_DIGITS } from '../scoreReading';

describe("a score's reading", () => {
  it('reads as whole points at six digits, so the number never changes width', () => {
    // The ladder row is laid out against this width and would shift under a
    // number that grew a digit mid-run; the end screen shows the same reading
    // so the number a player watched is the number they are handed.
    expect(SCORE_DIGITS).toBe(6);
    expect(scoreReading(0)).toBe('000000');
    expect(scoreReading(12400)).toBe('012400');
    expect(scoreReading(999999)).toBe('999999');
  });

  it('drops the fraction rather than rounding it, because points are whole', () => {
    // An overflow converts growth past the size ceiling at the grave's own
    // scale (ADR 0002), so a run's score carries a fraction the player has no
    // reading for. The floor is what the ladder row has always shown.
    expect(scoreReading(199.9)).toBe('000199');
  });
});
