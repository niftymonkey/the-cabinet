/**
 * Keyboard steering, the pure model (ADR 0011). Normalization and the speed
 * setting both live in this input model, because moveGrave applies the command
 * exactly as given and says so in its own JSDoc.
 */

import { describe, expect, it } from 'vitest';
import {
  FOCUS_FACTOR,
  KeySteer,
  MULTIPLIER_MAX,
  MULTIPLIER_MIN,
} from '../keys';

function steer(multiplier = 1): KeySteer {
  return new KeySteer({ multiplier });
}

function length(command: { x: number; y: number }): number {
  return Math.sqrt(command.x * command.x + command.y * command.y);
}

describe('KeySteer', () => {
  it('a single held direction gives a unit command on that axis and zero on the other', () => {
    const keys = steer();
    keys.press('ArrowRight');
    expect(keys.command()).toEqual({ x: 1, y: 0 });

    keys.release('ArrowRight');
    keys.press('ArrowUp');
    // Up is negative y: the field's origin is its top-left corner.
    expect(keys.command()).toEqual({ x: 0, y: -1 });
  });

  it('two held directions give a command of length 1, so a diagonal is not faster than a cardinal (ADR 0011)', () => {
    // This assertion lives here and not in grave.test.ts, because moveGrave
    // applies the command as given by design and a cap there would silently
    // undo ADR 0011's uncapped touch.
    const keys = steer();
    keys.press('ArrowRight');
    keys.press('ArrowDown');
    expect(length(keys.command())).toBeCloseTo(1, 12);
    expect(length(keys.command())).not.toBeCloseTo(Math.SQRT2, 3);
  });

  it('opposed keys on one axis cancel to zero on that axis', () => {
    // Cancel to zero rather than last-input-priority: the only reading that
    // survives a player rolling their hand across a keyboard.
    const keys = steer();
    keys.press('KeyA');
    keys.press('KeyD');
    keys.press('KeyS');
    expect(keys.command()).toEqual({ x: 0, y: 1 });
  });

  it('both KeyW and ArrowUp steer up, and an unrecognized code changes nothing', () => {
    const wasd = steer();
    wasd.press('KeyW');
    const arrows = steer();
    arrows.press('ArrowUp');
    expect(wasd.command()).toEqual(arrows.command());

    wasd.press('KeyQ');
    wasd.release('Backquote');
    expect(wasd.command()).toEqual(arrows.command());
  });

  it("holding focus halves the command's length, and releasing it restores it", () => {
    const keys = steer();
    keys.press('ArrowRight');
    keys.press('ShiftLeft');
    expect(length(keys.command())).toBeCloseTo(FOCUS_FACTOR, 12);

    keys.release('ShiftLeft');
    expect(length(keys.command())).toBeCloseTo(1, 12);

    keys.press('ShiftRight');
    expect(length(keys.command())).toBeCloseTo(FOCUS_FACTOR, 12);
  });

  it("the multiplier scales the command's length, and one outside 0.75 to 1.5 is clamped (ADR 0011, narrowed)", () => {
    const keys = steer(1.25);
    keys.press('ArrowRight');
    expect(length(keys.command())).toBeCloseTo(1.25, 12);

    keys.setMultiplier(4);
    expect(length(keys.command())).toBeCloseTo(MULTIPLIER_MAX, 12);

    keys.setMultiplier(0.1);
    expect(length(keys.command())).toBeCloseTo(MULTIPLIER_MIN, 12);

    // A value persisted by an earlier build under the old 0.5x to 2.0x range
    // arrives here as a real input, and so does a hand-edited localStorage.
    const persisted = new KeySteer({ multiplier: 2 });
    persisted.press('ArrowRight');
    expect(length(persisted.command())).toBeCloseTo(MULTIPLIER_MAX, 12);
  });

  it('releaseAll zeroes the command with keys still notionally held, which is the window-blur case', () => {
    // Without it a lost keyup leaves the grave pressing against the field
    // boundary for the rest of the run.
    const keys = steer();
    keys.press('ArrowRight');
    keys.press('ShiftLeft');
    keys.releaseAll();
    expect(keys.command()).toEqual({ x: 0, y: 0 });

    keys.press('ArrowRight');
    expect(length(keys.command())).toBeCloseTo(1, 12);
  });

  it('focus and the multiplier compose: 1.5x with focus held is 0.75x', () => {
    const keys = steer(MULTIPLIER_MAX);
    keys.press('ArrowLeft');
    keys.press('ShiftLeft');
    expect(length(keys.command())).toBeCloseTo(
      MULTIPLIER_MAX * FOCUS_FACTOR,
      12,
    );
  });
});
