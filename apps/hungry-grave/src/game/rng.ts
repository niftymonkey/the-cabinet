/**
 * Named seeded streams from one run seed, independent by construction (tracer
 * plan section 3). The trap this closes is the correlated-randomness one: two
 * systems drawing from one sequence make one system's draws predict the other's,
 * and a run then has a shape nobody designed.
 *
 * The generator is sfc32, seeded through xmur3. Both are integer-only, using
 * Math.imul, >>>, <<, ^ and +, every one of which is exactly specified, so a
 * stream cannot diverge between engines (ADR 0015). sfc32 carries 128 bits of
 * state, which is what makes stream overlap stop being a number anyone has to
 * compute: a generator whose whole state is its 32-bit output walks one cycle,
 * and named streams under it are windows into one sequence, disjoint by
 * arithmetic luck rather than by construction.
 *
 * The name folds into the seed by addition and never by XOR. With addition the
 * pairwise offsets between streams are the same for every seed, so one test
 * verifies them once and the property is real; with XOR the offsets vary per
 * seed, the property becomes unverifiable, and a bad pairing turns into a
 * heisenbug reachable on exactly one shared challenge URL.
 */

export type StreamName = 'spawns' | 'drops' | 'mobFire' | 'shed';

export interface Stream {
  /** The next draw, 0 inclusive to 1 exclusive. */
  next(): number;
  /** An integer in [0, bound), by rejection so the low bits are not favoured. */
  nextInt(bound: number): number;
  /** How many draws this stream has made. The digest reads it, and 3b's replay resumes from it. */
  readonly drawn: number;
}

// One past the largest uint32, the width every word in here lives in.
const UINT32_LIMIT = 4294967296;

/**
 * xmur3, the standard companion to sfc32: it passes SMHasher's avalanche test
 * and produces the four 32-bit words sfc32's state needs. FNV-1a is not used
 * here because it fails avalanche outright, and on these four stream names it
 * differs in 7 of 32 bits where 16 is expected.
 */
function xmur3(text: string): () => number {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** sfc32, PractRand-recommended, with 128 bits of state across four words. */
function sfc32(a: number, b: number, c: number, d: number): () => number {
  return () => {
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / UINT32_LIMIT;
  };
}

/** One named stream for one run seed. The same seed and name always give the same sequence. */
export function stream(seed: number, name: StreamName): Stream {
  const offset = xmur3(name)();
  const words = xmur3(String((seed + offset) >>> 0));
  const draw = sfc32(words(), words(), words(), words());
  // sfc32's own guidance: discard a dozen rounds so the four seeded words are
  // fully mixed before a caller ever sees a draw.
  for (let i = 0; i < 12; i++) draw();

  let drawn = 0;
  const next = (): number => {
    drawn += 1;
    return draw();
  };
  return {
    next,
    /**
     * Rejection sampling rather than a modulo of one draw: 2^32 is not a
     * multiple of most bounds, so the leftover tail at the top of the range
     * would favour the low values. Redrawing past the last whole multiple
     * removes that bias, and every redraw still counts as a draw.
     */
    nextInt(bound: number): number {
      // Without this the rejection loop below never terminates at either end.
      // At a bound of zero the limit is NaN, and above the generator's own
      // range the limit floors to zero, so no draw is ever under it either. A
      // hang with no diagnostic is the worst failure a computed bound can
      // have, so it throws by name instead.
      if (!Number.isInteger(bound) || bound < 1 || bound > UINT32_LIMIT) {
        throw new RangeError(
          `nextInt needs a whole bound from 1 to ${UINT32_LIMIT}, got ${bound}`,
        );
      }
      const limit = Math.floor(UINT32_LIMIT / bound) * bound;
      for (;;) {
        const word = next() * UINT32_LIMIT;
        if (word < limit) return word % bound;
      }
    },
    get drawn(): number {
      return drawn;
    },
  };
}
