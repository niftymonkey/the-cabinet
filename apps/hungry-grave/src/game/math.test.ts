/**
 * The rounding gate (ADR 0015). Every implementation-approximated operation the
 * sim uses passes through here and comes back rounded to single precision.
 */

/* eslint-disable no-restricted-properties -- this file's whole job is to check the wrappers against the raw operations they gate, so it is the one place in src/game that reads Math directly. */

import { describe, expect, it } from "vitest";
import { atan2, cos, exp, f32, log, normalize, pow, sin, tan } from "./math";

interface Wrapper {
  readonly name: string;
  readonly gated: (...args: number[]) => number;
  readonly raw: (...args: number[]) => number;
  readonly inputs: readonly (readonly number[])[];
}

/** All seven gated operations, each with a spread of inputs across its range. */
const WRAPPERS: readonly Wrapper[] = [
  {
    name: "sin",
    gated: sin,
    raw: Math.sin,
    inputs: [[0], [0.3], [1], [2.5], [-1.7], [100]],
  },
  {
    name: "cos",
    gated: cos,
    raw: Math.cos,
    inputs: [[0], [0.3], [1], [2.5], [-1.7], [100]],
  },
  {
    name: "tan",
    gated: tan,
    raw: Math.tan,
    inputs: [[0], [0.3], [1], [-1.7], [3]],
  },
  {
    name: "atan2",
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
    name: "exp",
    gated: exp,
    raw: Math.exp,
    inputs: [[0], [1], [-2.5], [7]],
  },
  {
    name: "log",
    gated: log,
    raw: Math.log,
    inputs: [[1], [0.5], [10], [1234]],
  },
  {
    name: "pow",
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

describe("the rounding gate", () => {
  it("f32 rounds a value that needs it and leaves an exactly representable one alone (ADR 0015)", () => {
    // 0.1 is not representable in single precision; 0.5 and 3 are.
    expect(f32(0.1)).toBe(Math.fround(0.1));
    expect(f32(0.1)).not.toBe(0.1);
    expect(f32(0.5)).toBe(0.5);
    expect(f32(3)).toBe(3);
    expect(f32(-2.25)).toBe(-2.25);
  });

  it("every wrapper returns a single-precision value, so f32(result) === result (ADR 0015)", () => {
    for (const wrapper of WRAPPERS) {
      for (const input of wrapper.inputs) {
        const result = wrapper.gated(...input);
        expect(`${wrapper.name}(${input}) -> ${f32(result)}`).toBe(
          `${wrapper.name}(${input}) -> ${result}`,
        );
      }
    }
  });

  it("every wrapper agrees with its Math counterpart to within single precision, so the gate rounds rather than changes the answer", () => {
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
  it("normalize(3, 4) is exactly { x: 0.6, y: 0.8, length: 5 }, unrounded, because vector math needs no gate (ADR 0015)", () => {
    expect(normalize(3, 4)).toEqual({ x: 0.6, y: 0.8, length: 5 });
    expect(normalize(-3, 4)).toEqual({ x: -0.6, y: 0.8, length: 5 });
  });

  it("normalize(0, 0) is zero and never NaN, because a zero move command is the resting state of both input models", () => {
    expect(normalize(0, 0)).toEqual({ x: 0, y: 0, length: 0 });
  });
});
