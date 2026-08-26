/**
 * The rounding gate (ADR 0015). Every implementation-approximated operation the
 * sim uses passes through here and comes back rounded to single precision.
 */

/* eslint-disable no-restricted-properties -- this file's whole job is to check the wrappers against the raw operations they gate, so it is the one place in src/game that reads Math directly. */

import { describe, expect, it } from 'vitest';
import {
  atan2,
  cos,
  exp,
  f32,
  log,
  normalize,
  pow,
  rotateToward,
  sin,
  tan,
} from './math';

interface Wrapper {
  readonly name: string;
  readonly gated: (...args: number[]) => number;
  readonly raw: (...args: number[]) => number;
  readonly inputs: readonly (readonly number[])[];
}

/** All seven gated operations, each with a spread of inputs across its range. */
const WRAPPERS: readonly Wrapper[] = [
  {
    name: 'sin',
    gated: sin,
    raw: Math.sin,
    inputs: [[0], [0.3], [1], [2.5], [-1.7], [100]],
  },
  {
    name: 'cos',
    gated: cos,
    raw: Math.cos,
    inputs: [[0], [0.3], [1], [2.5], [-1.7], [100]],
  },
  {
    name: 'tan',
    gated: tan,
    raw: Math.tan,
    inputs: [[0], [0.3], [1], [-1.7], [3]],
  },
  {
    name: 'atan2',
    gated: atan2,
    raw: Math.atan2,
    inputs: [
      [1, 1],
      [-3, 4],
      [0, -1],
      [5, 0],
      [-2, -9],
    ],
  },
  {
    name: 'exp',
    gated: exp,
    raw: Math.exp,
    inputs: [[0], [1], [-2.5], [7]],
  },
  {
    name: 'log',
    gated: log,
    raw: Math.log,
    inputs: [[1], [0.5], [10], [1234]],
  },
  {
    name: 'pow',
    gated: pow,
    raw: Math.pow,
    inputs: [
      [2, 10],
      [1.5, 3],
      [9, 0.5],
      [7, -2],
    ],
  },
];

// One unit in the last place of a single-precision significand, 2 to the -23.
const SINGLE_PRECISION_EPSILON = 1.1920928955078125e-7;

describe('the rounding gate', () => {
  it('f32 rounds a value that needs it and leaves an exactly representable one alone (ADR 0015)', () => {
    // 0.1 is not representable in single precision; 0.5 and 3 are.
    expect(f32(0.1)).toBe(Math.fround(0.1));
    expect(f32(0.1)).not.toBe(0.1);
    expect(f32(0.5)).toBe(0.5);
    expect(f32(3)).toBe(3);
    expect(f32(-2.25)).toBe(-2.25);
  });

  it('every wrapper returns a single-precision value, so f32(result) === result (ADR 0015)', () => {
    for (const wrapper of WRAPPERS) {
      for (const input of wrapper.inputs) {
        const result = wrapper.gated(...input);
        expect(`${wrapper.name}(${input}) -> ${f32(result)}`).toBe(
          `${wrapper.name}(${input}) -> ${result}`,
        );
      }
    }
  });

  it('every wrapper agrees with its Math counterpart to within single precision, so the gate rounds rather than changes the answer', () => {
    for (const wrapper of WRAPPERS) {
      for (const input of wrapper.inputs) {
        const raw = wrapper.raw(...input);
        const drift = Math.abs(wrapper.gated(...input) - raw);
        expect({
          call: `${wrapper.name}(${input})`,
          within: drift <= Math.abs(raw) * SINGLE_PRECISION_EPSILON,
        }).toEqual({ call: `${wrapper.name}(${input})`, within: true });
      }
    }
  });
  it('normalize(3, 4) is exactly { x: 0.6, y: 0.8, length: 5 }, unrounded, because vector math needs no gate (ADR 0015)', () => {
    expect(normalize(3, 4)).toEqual({ x: 0.6, y: 0.8, length: 5 });
    expect(normalize(-3, 4)).toEqual({ x: -0.6, y: 0.8, length: 5 });
  });

  it('normalize(0, 0) is zero and never NaN, because a zero move command is the resting state of both input models', () => {
    expect(normalize(0, 0)).toEqual({ x: 0, y: 0, length: 0 });
  });
});

/**
 * One rotation step of a given size, as the pair its callers hold. The ghoul and
 * the wisp each compute their own from their own degrees per second, so the test
 * builds a step rather than importing either one's.
 */
function step(degreesPerTick: number): { turnCos: number; turnSin: number } {
  const radians = (degreesPerTick * Math.PI) / 180;
  return { turnCos: cos(radians), turnSin: sin(radians) };
}

describe('the shared rotation (ADR 0015)', () => {
  it('snaps to the target once the target is inside one step, so a turn never overshoots', () => {
    const { turnCos, turnSin } = step(30);
    const heading = { x: 0, y: 1 };
    const target = normalize(1, 1);
    const turned = rotateToward(heading, target, turnCos, turnSin);
    // 45 degrees apart is more than one 30-degree step, so it turns partway.
    expect(turned).not.toEqual({ x: target.x, y: target.y });

    const near = normalize(0.2, 1);
    // About 11 degrees apart, inside one step, so it lands exactly on target.
    const snapped = rotateToward(heading, near, turnCos, turnSin);
    expect([snapped.x, snapped.y]).toEqual([near.x, near.y]);
  });

  it('turns by exactly the step it was given, whichever way round the target is', () => {
    const degrees = 20;
    const { turnCos, turnSin } = step(degrees);
    const heading = { x: 0, y: 1 };
    for (const target of [normalize(1, 0), normalize(-1, 0)]) {
      const turned = rotateToward(heading, target, turnCos, turnSin);
      const dot = heading.x * turned.x + heading.y * turned.y;
      expect(Math.acos(dot) * (180 / Math.PI)).toBeCloseTo(degrees, 4);
    }
  });

  it('turns toward the target and not away from it', () => {
    const { turnCos, turnSin } = step(20);
    const heading = { x: 0, y: 1 };
    for (const target of [normalize(1, 0), normalize(-1, 0)]) {
      const turned = rotateToward(heading, target, turnCos, turnSin);
      const before = heading.x * target.x + heading.y * target.y;
      const after = turned.x * target.x + turned.y * target.y;
      expect(after).toBeGreaterThan(before);
    }
  });

  it('returns a unit vector, so a caller scaling by its own speed does not drift', () => {
    const { turnCos, turnSin } = step(3);
    let heading = { x: 0, y: 1 };
    const target = normalize(1, -1);
    for (let turn = 0; turn < 20; turn++) {
      heading = rotateToward(heading, target, turnCos, turnSin);
      const length = Math.sqrt(heading.x * heading.x + heading.y * heading.y);
      expect(length).toBeCloseTo(1, 6);
    }
  });
});
