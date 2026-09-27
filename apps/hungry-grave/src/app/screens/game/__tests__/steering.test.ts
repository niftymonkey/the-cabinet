/**
 * The run's steering (tilted view T9, T10): the whole chain from a finger or a
 * held key to the grave, through a real run advanced tick by tick. A drag is
 * measured where the grave draws, a held key in field units.
 */

import type { FederatedPointerEvent } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';

import type { Execution } from '../../../../game/execution';
import { createExecution, executeTick } from '../../../../game/execution';
import type { RunState } from '../../../../game/run';
import { createRun } from '../../../../game/run';
import { fitField, READOUT_RESERVE } from '../../../layout';
import { groundToColumn, SCENE_CAMERA, stepOnColumn } from '../camera';
import type { RunSteering } from '../steering';
import { createRunSteering } from '../steering';

// The run steering reads its persisted keyboard speed on construction.
Object.defineProperty(globalThis, 'localStorage', {
  value: { getItem: () => null, setItem: () => {} },
  configurable: true,
});

const SEED = 20260927;

// A 390 by 844 phone, the shape the verification's rendered check uses.
const PHONE = fitField(390, 844, READOUT_RESERVE);

const CLOSE = 1e-6;

/**
 * How far one tick may land from the exact line: the sim takes each move on
 * the float32 grid (execution.ts's quantiseMove), one step of a component
 * under 2, times the base speed of 4.5.
 */
const GRID_PER_TICK = 4.5 * 2 * 2 ** -24;

// The steps a finger's travel arrives in, about what a phone reports per frame.
const FRAMES_PER_DRAG = 40;

interface Rig {
  readonly run: RunState;
  readonly execution: Execution;
  readonly steering: RunSteering;
  // The finger's place on the glass, in CSS pixels.
  finger: { x: number; y: number };
}

/** A fresh run with its grave stood at a ground point, and its controls. */
const rigAt = (x: number, y: number): Rig => {
  const run = createRun(SEED);
  run.grave.x = x;
  run.grave.y = y;
  const steering = createRunSteering({
    claimsPointer: () => false,
    releaseClaim: () => {},
    canvas: () => null,
  });
  steering.setSlop(PHONE.scale);
  return { run, execution: createExecution(run), steering, finger: { x, y } };
};

// A touch pointer event at a place on the glass, the only fields steering reads.
const touchAt = (x: number, y: number): FederatedPointerEvent =>
  ({ pointerType: 'touch', pointerId: 1, global: { x, y } }) as never;

/** One tick of the run under the controls, as a frame's ticks take it. */
const tick = (rig: Rig): void => {
  const source = rig.steering.commandSource();
  executeTick(
    rig.execution,
    source({ x: rig.run.grave.x, y: rig.run.grave.y }),
  );
  expect(rig.execution.faults).toEqual([]);
};

/** Where the grave draws on the column now. */
const drawn = (rig: Rig): { x: number; y: number } =>
  groundToColumn(SCENE_CAMERA, rig.run.grave.x, rig.run.grave.y);

/**
 * A finger put down on the glass and moved past the slop, so the drag is
 * steering and the grave has settled on it. The drag anchors where the finger
 * crossed the slop, so what follows is measured from here.
 */
const grip = (rig: Rig, x: number, y: number): void => {
  rig.finger = { x, y };
  rig.steering.pointerDown(touchAt(x, y), PHONE, rig.run.grave);
  rig.finger = { x: x + 10, y };
  rig.steering.pointerMove(touchAt(rig.finger.x, y), PHONE);
  tick(rig);
  tick(rig);
};

/** The finger dragged by some CSS pixels, one frame's share at a time, with a tick after each. */
const drag = (rig: Rig, dx: number, dy: number): void => {
  for (let frame = 0; frame < FRAMES_PER_DRAG; frame++) {
    rig.finger = {
      x: rig.finger.x + dx / FRAMES_PER_DRAG,
      y: rig.finger.y + dy / FRAMES_PER_DRAG,
    };
    rig.steering.pointerMove(touchAt(rig.finger.x, rig.finger.y), PHONE);
    tick(rig);
  }
  tick(rig);
};

/** Asserts the grave's drawn point moved by a finger's travel of some CSS pixels. */
const expectDrawnTravel = (
  from: { x: number; y: number },
  to: { x: number; y: number },
  dx: number,
  dy: number,
): void => {
  const want = { x: dx / PHONE.scale, y: dy / PHONE.scale };
  const got = { x: to.x - from.x, y: to.y - from.y };
  expect(Math.abs(got.x - want.x), `${got.x} against ${want.x}`).toBeLessThan(
    CLOSE,
  );
  expect(Math.abs(got.y - want.y), `${got.y} against ${want.y}`).toBeLessThan(
    CLOSE,
  );
};

/** Where on the glass a ground point draws, in CSS pixels. */
const onGlass = (x: number, y: number): { x: number; y: number } => {
  const column = groundToColumn(SCENE_CAMERA, x, y);
  return {
    x: PHONE.offsetX + column.x * PHONE.scale,
    y: PHONE.offsetY + column.y * PHONE.scale,
  };
};

describe('steering on the glass (tilted view T9, A11)', () => {
  it("a drag near the top of the column moves the grave's drawn point by exactly the finger's travel on the glass", () => {
    // T9: "a drag moves the grave exactly under the finger ... at any point on
    // the screen". Near the top a column unit is the most ground, 1.216 across.
    const rig = rigAt(150, 90);
    const at = onGlass(150, 90);
    grip(rig, at.x, at.y + 60);
    const before = drawn(rig);
    drag(rig, 100, 0);
    const across = drawn(rig);
    expectDrawnTravel(before, across, 100, 0);
    drag(rig, 0, 100);
    expectDrawnTravel(across, drawn(rig), 0, 100);
  });

  it("a drag on the middle row moves the grave's drawn point by exactly the finger's travel, and a sideways drag moves its field point by the same travel", () => {
    // On the middle row one column unit across is one field unit (A3), and
    // along it is 1.186 (A11), so only the sideways travel is the same on the
    // ground.
    const rig = rigAt(150, 380);
    const at = onGlass(150, 380);
    grip(rig, at.x, at.y + 60);
    const before = drawn(rig);
    const groundBefore = { x: rig.run.grave.x, y: rig.run.grave.y };
    drag(rig, 100, 0);
    const across = drawn(rig);
    expectDrawnTravel(before, across, 100, 0);
    expect(
      Math.abs(rig.run.grave.x - groundBefore.x - 100 / PHONE.scale),
    ).toBeLessThan(CLOSE);
    expect(Math.abs(rig.run.grave.y - groundBefore.y)).toBeLessThan(CLOSE);
    drag(rig, 0, -100);
    expectDrawnTravel(across, drawn(rig), 0, -100);
  });

  it("a drag near the bottom of the column moves the grave's drawn point by exactly the finger's travel", () => {
    // Near the bottom a column unit is the least ground, 0.849 across.
    const rig = rigAt(390, 690);
    const at = onGlass(390, 690);
    grip(rig, at.x, at.y + 60);
    const before = drawn(rig);
    drag(rig, -100, 0);
    const across = drawn(rig);
    expectDrawnTravel(before, across, -100, 0);
    drag(rig, 0, -100);
    expectDrawnTravel(across, drawn(rig), 0, -100);
  });

  it("a held W hands the sim exactly the key's field move, from a grave near the left edge low on the field", () => {
    // T10: the tilt is drawing only, so a key is a plain field move, straight
    // up the field at BASE_SPEED (4.5) a tick, never converted through the
    // camera. The bound is the sim's float32 grid, a tick at a time.
    const rig = rigAt(60, 700);
    rig.steering.keys.press('KeyW');
    for (let ticks = 1; ticks <= 60; ticks++) {
      tick(rig);
      expect(rig.run.grave.x, `tick ${ticks}`).toBe(60);
      expect(
        Math.abs(rig.run.grave.y - (700 - 4.5 * ticks)),
        `tick ${ticks}`,
      ).toBeLessThan(ticks * GRID_PER_TICK);
    }
  });

  it('every held direction moves the grave BASE_SPEED times the speed setting per tick in field units, at the top, the middle and the bottom', () => {
    // T10: a key moves the grave at the flat game's field speed wherever it
    // stands. BASE_SPEED is 540 / 120 = 4.5 field units a tick; the speed
    // setting multiplies it and focus halves it (ADR 0011). The bound is the
    // sim's float32 grid for one tick.
    const keys = [
      ['KeyW'],
      ['KeyA'],
      ['KeyS'],
      ['KeyD'],
      ['KeyW', 'KeyD'],
      ['KeyW', 'KeyA'],
      ['KeyS', 'KeyD'],
      ['KeyS', 'KeyA'],
    ];
    const settings = [
      { multiplier: 1, focus: false, speed: 4.5 },
      { multiplier: 1.5, focus: false, speed: 6.75 },
      { multiplier: 1.5, focus: true, speed: 3.375 },
    ];
    for (const y of [60, 380, 700]) {
      for (const held of keys) {
        for (const setting of settings) {
          const rig = rigAt(270, y);
          rig.steering.keys.setMultiplier(setting.multiplier);
          for (const code of held) rig.steering.keys.press(code);
          if (setting.focus) rig.steering.keys.press('ShiftLeft');
          const before = { x: rig.run.grave.x, y: rig.run.grave.y };
          tick(rig);
          const moved = Math.hypot(
            rig.run.grave.x - before.x,
            rig.run.grave.y - before.y,
          );
          const where = `${held.join('+')} at row ${y}, ${JSON.stringify(setting)}`;
          expect(Math.abs(moved - setting.speed), where).toBeLessThan(
            2 * GRID_PER_TICK,
          );
        }
      }
    }
  });

  it("a drag that pushes the grave into the field's edge re-anchors, so dragging back moves it at once, and a drag that never meets an edge never re-anchors", () => {
    // The re-anchor on a clamp (touch.ts's reanchorIfClamped): a drag never
    // banks travel the grave could not take. Off the middle row, so a drag
    // back measured in column units is not the same as one in field units.
    const pushed = rigAt(420, 600);
    const at = onGlass(420, 600);
    grip(pushed, at.x, at.y + 60);
    drag(pushed, 150, 0);
    expect(pushed.run.grave.x).toBe(540 - 13.5);
    const atEdge = drawn(pushed);
    drag(pushed, -20, 0);
    expectDrawnTravel(atEdge, drawn(pushed), -20, 0);

    // A long wandering drag inside the field ends exactly where the finger's
    // whole travel puts it, so no stray re-anchor dropped any of it.
    const free = rigAt(270, 450);
    const from = onGlass(270, 450);
    grip(free, from.x, from.y + 60);
    const start = drawn(free);
    drag(free, 60, -40);
    drag(free, -90, 25);
    drag(free, 45, 70);
    drag(free, -30, -20);
    expectDrawnTravel(start, drawn(free), -15, 35);
  });

  it('a drag that starts in the letterbox band above the column still steers', () => {
    // GameScreen's hit area is the whole stage, so a finger landing above the
    // column (y under the placement's 147.6 CSS pixels here) steers like any.
    expect(PHONE.offsetY).toBeGreaterThan(70);
    const rig = rigAt(270, 500);
    grip(rig, 200, 70);
    const before = drawn(rig);
    drag(rig, 80, 30);
    expectDrawnTravel(before, drawn(rig), 80, 30);
  });

  it('a drag that has settled on its target warns about nothing', () => {
    // A move past the horizon is logged once as an anomaly (A11), and a
    // settled drag is not one: its move is a round trip's rounding, a few
    // 1e-14 base units, which lands back where the grave stands. Found by the
    // rendered check, where every settled drag logged a false horizon warning.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const rig = rigAt(150, 380);
      const at = onGlass(150, 380);
      grip(rig, at.x, at.y + 60);
      drag(rig, 30, -20);
      for (let ticks = 0; ticks < 30; ticks++) tick(rig);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it("the move the sim is handed is a ground move: the grave's field point after a tick is where stepOnColumn says the step reaches", () => {
    // A11, for the drag: the app turns the step on the column into ground
    // through the camera, so the sim and the tape only ever see ground moves.
    // With DRAG_RATIO 1 a settled drag's step on the column is the finger's
    // travel in column units.
    const rig = rigAt(100, 200);
    const at = onGlass(100, 200);
    grip(rig, at.x, at.y + 60);
    const before = { x: rig.run.grave.x, y: rig.run.grave.y };
    rig.finger = { x: rig.finger.x + 12, y: rig.finger.y + 9 };
    rig.steering.pointerMove(touchAt(rig.finger.x, rig.finger.y), PHONE);
    tick(rig);
    const step = { x: 12 / PHONE.scale, y: 9 / PHONE.scale };
    const reached = stepOnColumn(SCENE_CAMERA, before, step);
    expect(reached).not.toBeNull();
    expect(Math.abs(rig.run.grave.x - reached!.x)).toBeLessThan(GRID_PER_TICK);
    expect(Math.abs(rig.run.grave.y - reached!.y)).toBeLessThan(GRID_PER_TICK);
  });
});
