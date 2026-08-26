/**
 * The one rule that turns a live keyboard and a live drag into a single move
 * command. On a touchscreen laptop or an iPad with a keyboard both models are
 * live at once and this is what decides between them.
 */

import { describe, expect, it } from 'vitest';
import type { Grave } from '../game/grave';
import { BASE_SPEED, SIZE_START } from '../game/tuning';
import { combineSteer } from './steering';
import { DRAG_RATIO, STEER_SLOP, TouchSteer } from './touch';

function grave(x: number, y: number): Grave {
  return { x, y, size: SIZE_START, invulnerable: 0 };
}

describe('combineSteer', () => {
  it('with no pointer steering, the keyboard command passes through unchanged', () => {
    const keys = { x: -1, y: 0.5 };
    expect(combineSteer(keys, new TouchSteer(), grave(270, 500))).toEqual(keys);
  });

  it('with a pointer steering, the touch command wins and the keyboard command is ignored entirely, never summed', () => {
    // Summing is wrong on its face: one is a velocity and one is a position
    // error, so a held key plus a live drag overshoots the target.
    const touch = new TouchSteer();
    const g = grave(270, 500);
    touch.down(1, { x: 100, y: 400 }, g);
    touch.move(1, { x: 100 + STEER_SLOP + 1, y: 400 });
    touch.move(1, { x: 100 + STEER_SLOP + 1 + 10, y: 400 });

    // Eleven and not ten: the crossing point is interpolated at exactly
    // STEER_SLOP along the move that crossed it, so the anchor sits one unit
    // behind where that move left the pointer, and the drag is measured from
    // the anchor.
    const combined = combineSteer({ x: 1, y: 1 }, touch, g);
    expect(combined).toEqual({ x: (11 * DRAG_RATIO) / BASE_SPEED, y: 0 });
  });
});
