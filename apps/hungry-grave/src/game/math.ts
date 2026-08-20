/**
 * Every implementation-approximated operation the sim uses, rounded to single
 * precision (ADR 0015). Nothing else in src/game may call these on Math
 * directly, and a lint rule enforces that rather than a comment asking nicely.
 *
 * There is deliberately no hypot wrapper. Math.sqrt became exactly specified in
 * tc39/ecma262 PR #3345, so Math.sqrt(x * x + y * y) is fully deterministic
 * while Math.hypot is implementation-approximated and would have to be gated
 * and rounded. Math.hypot exists to avoid intermediate overflow, and in a 540
 * by 760 field there is no overflow range to protect; normalize already returns
 * the length, which is what the sim actually wants.
 *
 * Nor are Math.sqrt, abs, min, max, floor, ceil, round and sign wrapped. They
 * are exactly specified and the sim calls them directly: wrapping them would
 * round correct answers and imply a hazard that is not there.
 */

/** One number rounded to single precision. The gate every approximated result passes through. */
export function f32(value: number): number {
  return Math.fround(value);
}

export function sin(radians: number): number {
  return f32(Math.sin(radians));
}

export function cos(radians: number): number {
  return f32(Math.cos(radians));
}

export function tan(radians: number): number {
  return f32(Math.tan(radians));
}

export function atan2(y: number, x: number): number {
  return f32(Math.atan2(y, x));
}

export function exp(value: number): number {
  return f32(Math.exp(value));
}

export function log(value: number): number {
  return f32(Math.log(value));
}

export function pow(base: number, exponent: number): number {
  return f32(Math.pow(base, exponent));
}

/**
 * A vector as a unit direction and its length, using only multiply, divide and
 * square root. All three are exactly specified by IEEE 754, so this rounds
 * nothing and needs no gate. ADR 0015 states the preference for vector math
 * over angle math and this is the primitive that makes it available.
 *
 * A zero vector returns zero rather than NaN, because a zero move command is
 * the resting state of both input models and so the common case.
 */
export function normalize(
  x: number,
  y: number,
): { x: number; y: number; length: number } {
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) return { x: 0, y: 0, length: 0 };
  return { x: x / length, y: y / length, length };
}
