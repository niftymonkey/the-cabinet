/**
 * Uncapped relative drag steering, the pure model (ADR 0011). Every test here
 * drives the real moveGrave, because the properties under test are about where
 * the grave actually ends up, clamp and all.
 */

import { describe, expect, it } from 'vitest';
import { FIELD_HEIGHT } from '../../game/field';
import type { Grave } from '../../game/grave';
import { moveGrave } from '../../game/grave';
import { BASE_SPEED, SIZE_START } from '../../game/tuning';
import { DRAG_RATIO, STEER_SLOP, TouchSteer } from '../touch';

function grave(x: number, y: number): Grave {
  return { x, y, size: SIZE_START, invulnerable: 0 };
}

/**
 * A pointer down and dragged one unit past the slop. It returns the anchor,
 * which is the crossing point interpolated along that move and so sits exactly
 * STEER_SLOP from the origin, one unit short of where the pointer now is.
 */
function anchored(
  touch: TouchSteer,
  id: number,
  origin: { x: number; y: number },
  at: Grave,
): { x: number; y: number } {
  touch.down(id, origin, at);
  touch.move(id, { x: origin.x + STEER_SLOP + 1, y: origin.y });
  return { x: origin.x + STEER_SLOP, y: origin.y };
}

describe('TouchSteer', () => {
  it('with no pointer down the command is zero and isSteering is false', () => {
    const touch = new TouchSteer();
    expect(touch.isSteering()).toBe(false);
    expect(touch.command(grave(270, 600))).toEqual({ x: 0, y: 0 });
  });

  it('a pointer that has not moved past STEER_SLOP does not steer, and the command stays zero', () => {
    // Oldest-pointer-down dies on a normal phone grip: an off-hand thumb
    // brushing the glass would own the control and never move it.
    const touch = new TouchSteer();
    const g = grave(270, 600);
    touch.down(1, { x: 100, y: 400 }, g);
    touch.move(1, { x: 100 + STEER_SLOP - 1, y: 400 });
    expect(touch.isSteering()).toBe(false);
    expect(touch.command(g)).toEqual({ x: 0, y: 0 });
  });

  it('a drag of d units past the anchor lands the grave d * DRAG_RATIO away in one tick, the anchor being the crossing point (ADR 0011)', () => {
    // The anchor is the crossing point and not the down position, so the slop
    // travel is discarded rather than delivered as a jump. UIScrollView and
    // AOSP's ScrollView both do exactly that.
    const touch = new TouchSteer();
    const g = grave(270, 500);
    const anchor = anchored(touch, 1, { x: 100, y: 600 }, g);

    touch.move(1, { x: anchor.x + 20, y: anchor.y + 12 });
    moveGrave(g, touch.command(g));

    expect(g.x).toBeCloseTo(270 + 20 * DRAG_RATIO, 9);
    expect(g.y).toBeCloseTo(500 + 12 * DRAG_RATIO, 9);
  });

  it('a first move far past STEER_SLOP discards the slop distance and delivers the rest, never the whole move', () => {
    // A flick arrives as one coarse pointermove on a phone, so the first move
    // can land far past the threshold. Anchoring at that endpoint swallows all
    // of it: the next command is a zero position error and a quick swipe moves
    // the grave not at all. AOSP's ScrollView subtracts the slop from the
    // first delta and UIScrollView does the same, so 100 units of finger
    // travel is 96 units of grave travel here.
    const straight = new TouchSteer();
    const g = grave(270, 500);
    straight.down(1, { x: 100, y: 400 }, g);
    straight.move(1, { x: 200, y: 400 });
    moveGrave(g, straight.command(g));

    expect(g.x).toBeCloseTo(270 + (100 - STEER_SLOP) * DRAG_RATIO, 9);
    expect(g.y).toBeCloseTo(500, 9);

    // The slop comes off along the segment and not per axis: a 3-4-5 flick of
    // 100 units delivers 96 units along its own direction.
    const diagonal = new TouchSteer();
    const d = grave(270, 400);
    diagonal.down(1, { x: 100, y: 300 }, d);
    diagonal.move(1, { x: 160, y: 380 });
    moveGrave(d, diagonal.command(d));

    expect(d.x).toBeCloseTo(270 + 0.6 * (100 - STEER_SLOP) * DRAG_RATIO, 9);
    expect(d.y).toBeCloseTo(400 + 0.8 * (100 - STEER_SLOP) * DRAG_RATIO, 9);
  });

  it('the command is uncapped: any target inside the field is reached in one tick however far away (ADR 0011)', () => {
    // Capping the drag at keyboard speed for fairness WAS the input lag felt
    // on device, which is why nothing clamps here and nothing clamps in
    // moveGrave either.
    const touch = new TouchSteer();
    const g = grave(60, 700);
    const anchor = anchored(touch, 1, { x: 60, y: 700 }, g);

    touch.move(1, { x: anchor.x + 400, y: anchor.y - 600 });
    const command = touch.command(g);
    expect(command.x).toBeCloseTo((400 * DRAG_RATIO) / BASE_SPEED, 9);
    expect(command.y).toBeCloseTo((-600 * DRAG_RATIO) / BASE_SPEED, 9);

    moveGrave(g, command);
    expect(g.x).toBeCloseTo(60 + 400 * DRAG_RATIO, 9);
    expect(g.y).toBeCloseTo(700 - 600 * DRAG_RATIO, 9);
  });

  it("two consecutive commands with pointer motion between them each move the grave by the pointer's delta, mid-field and against an edge", () => {
    // Nothing else in this list calls command twice with movement in between,
    // which is the blindness that hid the once-per-frame sampling defect.
    const midfield = new TouchSteer();
    const g = grave(270, 500);
    const anchor = anchored(midfield, 1, { x: 100, y: 400 }, g);

    midfield.move(1, { x: anchor.x + 10, y: anchor.y + 10 });
    moveGrave(g, midfield.command(g));
    expect(g.x).toBeCloseTo(280, 9);
    expect(g.y).toBeCloseTo(510, 9);

    midfield.move(1, { x: anchor.x + 20, y: anchor.y + 16 });
    moveGrave(g, midfield.command(g));
    expect(g.x).toBeCloseTo(290, 9);
    expect(g.y).toBeCloseTo(516, 9);

    const edge = new TouchSteer();
    const pressed = grave(270, FIELD_HEIGHT - SIZE_START);
    const edgeAnchor = anchored(edge, 1, { x: 200, y: 400 }, pressed);

    edge.move(1, { x: edgeAnchor.x + 10, y: edgeAnchor.y });
    moveGrave(pressed, edge.command(pressed));
    expect(pressed.x).toBeCloseTo(280, 9);

    edge.move(1, { x: edgeAnchor.x + 25, y: edgeAnchor.y });
    moveGrave(pressed, edge.command(pressed));
    expect(pressed.x).toBeCloseTo(295, 9);
  });

  it('anti-windup: after a target outside the field clamped the grave short, reversing the pointer moves the grave immediately', () => {
    // Without conditional integration the grave would not move at all until
    // the whole banked overshoot was repaid, which gives every field edge a
    // dead zone.
    const touch = new TouchSteer();
    const g = grave(270, 600);
    const anchor = anchored(touch, 1, { x: 200, y: 400 }, g);

    touch.move(1, { x: anchor.x, y: anchor.y + 400 });
    moveGrave(g, touch.command(g));
    expect(g.y).toBeCloseTo(FIELD_HEIGHT - SIZE_START, 9);

    touch.move(1, { x: anchor.x, y: anchor.y + 395 });
    moveGrave(g, touch.command(g));
    expect(g.y).toBeCloseTo(FIELD_HEIGHT - SIZE_START - 5 * DRAG_RATIO, 9);
  });

  it('anti-windup does not eat the delta: clamped against the bottom edge, each sideways delta arrives in full', () => {
    // The re-anchor takes the pointer position that produced the previous
    // target, not the pointer's current position. Re-anchoring to the current
    // pointer gives 6, 0, 6, 0 where this asserts 6, 6, 6, 6: it discards the
    // pointer's movement since the last command along with the overshoot.
    const touch = new TouchSteer();
    const g = grave(270, 600);
    const anchor = anchored(touch, 1, { x: 100, y: 100 }, g);

    let pointer = { x: anchor.x, y: anchor.y + 400 };
    touch.move(1, pointer);
    moveGrave(g, touch.command(g));
    expect(g.y).toBeCloseTo(FIELD_HEIGHT - SIZE_START, 9);

    const deltas: number[] = [];
    for (let call = 0; call < 8; call++) {
      pointer = { x: pointer.x + 6, y: pointer.y + 6 };
      touch.move(1, pointer);
      const before = g.x;
      moveGrave(g, touch.command(g));
      deltas.push(Number((g.x - before).toFixed(9)));
    }
    expect(deltas).toEqual([6, 6, 6, 6, 6, 6, 6, 6]);
  });

  it('move twice with the same point gives the same command as once, because globalpointermove is dispatched twice per DOM move', () => {
    // EventBoundary pushes the current target into _allInteractiveElements
    // twice when a child produced a hit, and all() notifies every entry.
    const once = new TouchSteer();
    const a = grave(270, 500);
    const anchorA = anchored(once, 1, { x: 100, y: 400 }, a);
    once.move(1, { x: anchorA.x + 30, y: anchorA.y + 30 });

    const twice = new TouchSteer();
    const b = grave(270, 500);
    const anchorB = anchored(twice, 1, { x: 100, y: 400 }, b);
    twice.move(1, { x: anchorB.x + 30, y: anchorB.y + 30 });
    twice.move(1, { x: anchorB.x + 30, y: anchorB.y + 30 });

    expect(twice.command(b)).toEqual(once.command(a));
  });

  it('a second pointer down does not steer, and the steering pointer does not change', () => {
    const touch = new TouchSteer();
    const g = grave(270, 500);
    const anchor = anchored(touch, 1, { x: 100, y: 400 }, g);

    touch.down(2, { x: 480, y: 120 }, g);
    touch.move(2, { x: 480, y: 20 });
    touch.move(1, { x: anchor.x + 10, y: anchor.y });

    expect(touch.command(g)).toEqual({
      x: (10 * DRAG_RATIO) / BASE_SPEED,
      y: 0,
    });
  });

  it('carries no belch at all: a second pointer only ever steers or waits', () => {
    // Mark ruled on 2026-08-22 that the belch binds to a dedicated corner
    // button. The belch is the scarcest object in the game and is spendable
    // only at the moment it is worth most, so a binding that can misfire on a
    // second finger is the wrong one, and the rule is deleted rather than left
    // in the file as a comment.
    const touch = new TouchSteer();
    const g = grave(270, 500);
    anchored(touch, 1, { x: 100, y: 400 }, g);
    touch.down(2, { x: 480, y: 120 }, g);

    expect('takeBelch' in touch).toBe(false);
    expect(touch.isSteering()).toBe(true);
  });

  it('the #33 lesson: a steering lift clears the drag and the remaining pointer earns the role by crossing STEER_SLOP from where it now is', () => {
    // Handing off instead would promote a pointer that never crossed the slop,
    // which rebuilds the grip disaster the slop rule exists to prevent.
    const touch = new TouchSteer();
    const g = grave(270, 500);
    anchored(touch, 1, { x: 100, y: 400 }, g);

    const resting = { x: 470, y: 120 };
    touch.down(2, resting, g);
    touch.move(2, { x: resting.x + 3, y: resting.y });

    touch.up(1);
    expect(touch.isSteering()).toBe(false);
    expect(touch.command(g)).toEqual({ x: 0, y: 0 });

    touch.move(2, { x: resting.x + 5, y: resting.y });
    expect(touch.isSteering()).toBe(false);

    touch.move(2, { x: resting.x + 3 + STEER_SLOP + 1, y: resting.y });
    expect(touch.isSteering()).toBe(true);

    // The promoting move crosses the slop by one unit and that one unit is
    // delivered, which is the same rule as the flick case. What must never
    // arrive is a jump by the distance between the two fingers.
    const before = { x: g.x, y: g.y };
    moveGrave(g, touch.command(g));
    expect(g.x).toBeCloseTo(before.x + 1 * DRAG_RATIO, 9);
    expect(g.y).toBeCloseTo(before.y, 9);
  });

  it('cancelAll clears the pointers and the anchor, which pause, blur and pointercancel all call', () => {
    const touch = new TouchSteer();
    const g = grave(270, 500);
    const anchor = anchored(touch, 1, { x: 100, y: 400 }, g);
    touch.down(2, { x: 480, y: 120 }, g);

    touch.cancelAll();

    expect(touch.isSteering()).toBe(false);
    touch.move(1, { x: anchor.x + 200, y: anchor.y });
    expect(touch.command(g)).toEqual({ x: 0, y: 0 });
  });

  it('an up for a pointer that was never down changes nothing', () => {
    const touch = new TouchSteer();
    const g = grave(270, 500);
    const anchor = anchored(touch, 1, { x: 100, y: 400 }, g);

    touch.up(7);

    touch.move(1, { x: anchor.x + 10, y: anchor.y });
    expect(touch.isSteering()).toBe(true);
    expect(touch.command(g)).toEqual({
      x: (10 * DRAG_RATIO) / BASE_SPEED,
      y: 0,
    });
  });
});
