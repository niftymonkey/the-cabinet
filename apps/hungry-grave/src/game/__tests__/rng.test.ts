/**
 * Named seeded streams, independent by construction (ADR 0012, tracer plan
 * section 3). The trap these tests close is the correlated-randomness one:
 * two systems drawing from one sequence make one system's draws predict the
 * other's.
 */

import { describe, expect, it } from 'vitest';
import { stream, type StreamName } from '../rng';
import { createRun } from '../run';

const NAMES: readonly StreamName[] = ['spawns', 'drops', 'mobFire', 'shed'];

function draws(seed: number, name: StreamName, count: number): number[] {
  const source = stream(seed, name);
  return Array.from({ length: count }, () => source.next());
}

/** Draws a whole run of every stream, plus one budget of headroom. */
const RUN_DRAW_BUDGET = 10_000;

// Ten budgets of headroom, so "no overlap" is a wide margin and not a squeak.
const SEARCH_WINDOW = 10 * RUN_DRAW_BUDGET;

// Enough draws in a row that an accidental match is not chance.
const NEEDLE = 8;

/**
 * The smallest offset at which the haystack stream starts repeating the needle
 * stream's opening draws, or Infinity when there is none inside the window.
 *
 * Comparing the two sequences from draw 0 is the version that looks right and
 * is not: it passes even when two streams are offset by three draws, which is
 * the actual failure mode.
 */
function minOverlapOffset(haystack: number[], needle: number[]): number {
  for (let offset = 0; offset <= haystack.length - NEEDLE; offset++) {
    let matched = 0;
    while (matched < NEEDLE && haystack[offset + matched] === needle[matched]) {
      matched += 1;
    }
    if (matched === NEEDLE) return offset;
  }
  return Infinity;
}

describe('named seeded streams', () => {
  it('the same seed and name give an identical sequence over the first 64 draws (ADR 0012)', () => {
    for (const name of NAMES) {
      expect(draws(4242, name, 64)).toEqual(draws(4242, name, 64));
    }
  });
  it('every draw is in [0, 1), over a long sequence and several seeds', () => {
    // One assertion over 80,000 draws rather than 160,000 assertions, because
    // expect() costs far more than the range check and the test was timing out
    // under parallel load at 3.9 seconds against vitest's 5 second budget. The
    // draws checked are the same ones; only the reporting changed, so an
    // offender is named rather than being the assertion that happened to fail.
    const offenders: string[] = [];
    for (const seed of [0, 1, 99, 2147483646]) {
      for (const name of NAMES) {
        draws(seed, name, 5000).forEach((draw, index) => {
          if (draw >= 0 && draw < 1) return;
          offenders.push(`seed ${seed} ${name} draw ${index} was ${draw}`);
        });
      }
    }
    expect(offenders).toEqual([]);
  });
  it('nextInt stays in [0, bound) and covers every value over enough draws', () => {
    for (const bound of [1, 2, 4, 6, 7, 37]) {
      const source = stream(31, 'drops');
      const seen = new Set<number>();
      for (let i = 0; i < 4000; i++) {
        const value = source.nextInt(bound);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(bound);
        seen.add(value);
      }
      expect(seen.size).toBe(bound);
    }
  });
  it("no two named streams from one seed are within a run's whole draw budget of each other (spec #37)", () => {
    // Slay the Spire 2 shipped a seed-plus-name-hash design over a generator
    // whose whole state was its output, and correlated anyway: a card became
    // mathematically unobtainable and potion rates swung by act. Written this
    // way so that adding a fifth colliding stream name fails loudly.
    expect(SEARCH_WINDOW).toBeGreaterThan(RUN_DRAW_BUDGET);
    // The search finds a real overlap when there is one, so a pass below is a
    // result rather than a helper that never matches anything.
    const spawns = draws(77, 'spawns', NEEDLE * 2);
    expect(minOverlapOffset(spawns, spawns)).toBe(0);
    expect(minOverlapOffset(spawns.slice(3), spawns.slice(3, 3 + NEEDLE))).toBe(
      0,
    );
    const sequences = new Map(
      NAMES.map((name) => [name, draws(77, name, SEARCH_WINDOW + NEEDLE)]),
    );
    for (const haystackName of NAMES) {
      for (const needleName of NAMES) {
        if (haystackName === needleName) continue;
        const offset = minOverlapOffset(
          sequences.get(haystackName)!,
          sequences.get(needleName)!,
        );
        expect({
          pair: `${needleName} inside ${haystackName}`,
          clearOfTheBudget: offset > RUN_DRAW_BUDGET,
        }).toEqual({
          pair: `${needleName} inside ${haystackName}`,
          clearOfTheBudget: true,
        });
      }
    }
  });
  it('nextInt throws by name on a bound it cannot sample, rather than hanging', () => {
    // The rejection loop cannot terminate on a bound of zero, nor on one above
    // the generator's 32-bit range, and dispatch 4 computes its bounds, so the
    // failure mode without this is a frozen tab with nothing in the console.
    const source = stream(31, 'drops');
    for (const bound of [0, -1, 2.5, NaN, 4_294_967_297]) {
      expect(() => source.nextInt(bound)).toThrow(RangeError);
    }
  });
  it('two different seeds give different sequences for the same name (ADR 0012)', () => {
    for (const name of NAMES) {
      expect(draws(1, name, 32)).not.toEqual(draws(2, name, 32));
      expect(draws(1, name, 32)).not.toEqual(draws(1000000, name, 32));
    }
  });
  it("drawn counts the draws a stream has made, so the digest and 3b's replay can read the cursor", () => {
    const source = stream(5, 'spawns');
    expect(source.drawn).toBe(0);
    source.next();
    source.next();
    expect(source.drawn).toBe(2);
    source.nextInt(6);
    expect(source.drawn).toBeGreaterThanOrEqual(3);
  });
  it('createRun() with no seed rolls a fresh seed (ADR 0012)', () => {
    const seeds = new Set(Array.from({ length: 200 }, () => createRun().seed));
    expect(seeds.size).toBeGreaterThan(1);
  });
  it('createRun(seed) pins the run to exactly the seed given (ADR 0012)', () => {
    expect(createRun(0).seed).toBe(0);
    expect(createRun(7).seed).toBe(7);
    expect(createRun(2147483646).seed).toBe(2147483646);
  });
});
