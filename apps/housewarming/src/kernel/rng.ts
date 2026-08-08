// Seeded randomness. A playthrough is reproducible from its seed, which is what lets the
// solver replay a house and what lets a bug report be a number.

export type Rng = () => number;

// mulberry32, carried over from the morning-signals prototype. Small, fast, and good
// enough for drawing from a handful of pools.
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Indexed access that fails loudly instead of handing back undefined.
export function at<T>(values: readonly T[], index: number): T {
  const value = values[index];
  if (value === undefined) {
    throw new Error(`index ${index} is outside a list of ${values.length}`);
  }
  return value;
}

export function pick<T>(values: readonly T[], rng: Rng): T {
  if (values.length === 0) throw new Error('cannot pick from an empty pool');
  return at(values, Math.floor(rng() * values.length));
}

// Draws `count` different values. Throws rather than looping forever when the pool is
// too small, because that means the generation rules are wrong and the caller wants to
// hear about it at roll time.
export function pickDistinct<T>(
  values: readonly T[],
  count: number,
  rng: Rng,
): T[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error(`cannot draw ${count} distinct values`);
  }
  if (count > values.length) {
    throw new Error(
      `cannot draw ${count} distinct values from a pool of ${values.length}`,
    );
  }
  const rest = [...values];
  const taken: T[] = [];
  while (taken.length < count) {
    const index = Math.floor(rng() * rest.length);
    taken.push(at(rest, index));
    rest.splice(index, 1);
  }
  return taken;
}
