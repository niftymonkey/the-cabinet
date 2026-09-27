/**
 * The one rule that turns a live keyboard and a live drag into a single move
 * command. On a touchscreen laptop or an iPad with a keyboard both models are
 * live at once and this is what decides between them.
 */

import { describe, expect, it } from 'vitest';
import type { MoveCommand } from '../../game/command';
import type { Grave } from '../../game/grave';
import { BASE_SPEED, SIZE_START } from '../../game/tuning';
import { combineSteer } from '../steering';
import { DRAG_RATIO, STEER_SLOP, TouchSteer } from '../touch';

function grave(x: number, y: number): Grave {
  return {
    x,
    y,
    size: SIZE_START,
    invulnerable: 0,
    owed: 0,
    scoreRungBled: false,
  };
}

// The conversion that changes nothing, for the tests whose promise is the rule between the two inputs.
const onTheSame = (move: MoveCommand): MoveCommand => move;

describe('combineSteer', () => {
  it('with no pointer steering, the keyboard command passes through unchanged', () => {
    const keys = { x: -1, y: 0.5 };
    expect(
      combineSteer(keys, new TouchSteer(), grave(270, 500), onTheSame),
    ).toEqual(keys);
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
    const combined = combineSteer({ x: 1, y: 1 }, touch, g, onTheSame);
    expect(combined).toEqual({ x: (11 * DRAG_RATIO) / BASE_SPEED, y: 0 });
  });

  it("a drag's move goes through the conversion it is handed, and a key's move never does", () => {
    // Tilted view T9, T10: the app hands the drag its conversion onto the
    // field, and a key is a plain field move that is never converted.
    const doubled = (move: MoveCommand): MoveCommand => ({
      x: move.x * 2,
      y: move.y * 2,
    });
    const keys = { x: -1, y: 0.5 };
    expect(
      combineSteer(keys, new TouchSteer(), grave(270, 500), doubled),
    ).toEqual(keys);

    const touch = new TouchSteer();
    const g = grave(270, 500);
    touch.down(1, { x: 100, y: 400 }, g);
    touch.move(1, { x: 100 + STEER_SLOP + 1, y: 400 });
    touch.move(1, { x: 100 + STEER_SLOP + 1 + 10, y: 400 });
    // The drag's own move is eleven units across (the test above), doubled.
    expect(combineSteer(keys, touch, g, doubled)).toEqual({
      x: (22 * DRAG_RATIO) / BASE_SPEED,
      y: 0,
    });
  });
});
