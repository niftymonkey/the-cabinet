// Spec tests for the keyboard movement mapping, authored from Mark's ruling
// of 2026-08-19 (decision-log entry 12) before the implementation: keys
// command a designated speed the player tunes with a multiplier; direction
// never changes that speed.

import { describe, expect, it } from 'vitest';
import { keysToMove } from './keys';

describe('keyboard movement mapping (entry 12)', () => {
  it('no keys held commands no movement', () => {
    const move = keysToMove(new Set(), 1);
    expect(move.moveX).toBe(0);
    expect(move.moveY).toBe(0);
  });

  it('a single axis commands exactly the multiplier', () => {
    const move = keysToMove(new Set(['KeyD']), 1);
    expect(move.moveX).toBeCloseTo(1, 10);
    expect(move.moveY).toBe(0);
    const tuned = keysToMove(new Set(['KeyD']), 1.17);
    expect(tuned.moveX).toBeCloseTo(1.17, 10);
  });

  it('a diagonal is normalized: direction never changes speed', () => {
    const move = keysToMove(new Set(['KeyD', 'KeyS']), 1.17);
    expect(Math.hypot(move.moveX, move.moveY)).toBeCloseTo(1.17, 10);
  });

  it('opposite keys cancel', () => {
    const move = keysToMove(new Set(['KeyA', 'KeyD']), 1);
    expect(move.moveX).toBe(0);
  });

  it('arrows and WASD are the same keys', () => {
    const wasd = keysToMove(new Set(['KeyW']), 0.83);
    const arrow = keysToMove(new Set(['ArrowUp']), 0.83);
    expect(wasd).toEqual(arrow);
  });
});
