// Every die in the slice draws from its own named seeded stream (Slay the
// Spire's pattern, decision-log entry 5), so every tester gets the identical
// run and build sequence no matter which systems consume randomness first.

export interface Rng {
  next(): number;
  int(minInclusive: number, maxInclusive: number): number;
  range(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createStream(runSeed: number, name: string): Rng {
  const next = mulberry32((runSeed ^ hashString(name)) >>> 0);
  return {
    next,
    int(minInclusive, maxInclusive) {
      return (
        minInclusive + Math.floor(next() * (maxInclusive - minInclusive + 1))
      );
    },
    range(min, max) {
      return min + next() * (max - min);
    },
    pick(items) {
      const item = items[Math.floor(next() * items.length)];
      if (item === undefined) throw new Error("pick from empty list");
      return item;
    },
  };
}
