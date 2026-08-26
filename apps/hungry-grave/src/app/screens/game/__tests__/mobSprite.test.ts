/**
 * One mob's body on screen: the tell that precedes its shot, read off the radii
 * the drawing is built from.
 */

import { describe, expect, it } from 'vitest';

import { alarmRadius, tellRadius } from '../mobSprite';

describe("dispatch 4's readability findings, fixed here (plan 6.20)", () => {
  it("gives the revenant's tell a component that grows as the shot approaches", () => {
    // The closing iris is a countdown and it stays. What it could not do alone
    // is hold salience: it closes to nothing at the moment of maximum urgency.
    const early = alarmRadius('revenant', 0);
    const late = alarmRadius('revenant', 1);
    expect(late).toBeGreaterThan(early);
    // And the iris still closes, so the pair is a countdown and an alarm.
    expect(tellRadius('revenant', 1)).toBeLessThan(tellRadius('revenant', 0));
  });
});
