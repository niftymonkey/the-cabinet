/**
 * Named seeded streams, independent by construction (ADR 0012, tracer plan
 * section 3). The trap these tests close is the correlated-randomness one:
 * two systems drawing from one sequence make one system's draws predict the
 * other's.
 */

import { describe, expect, it } from 'vitest';
import { HAND_STREAM } from '../../dev/harnessPolicy';
import { stream, STREAM_SALTS } from '../rng';
import { createRun } from '../run';

/**
 * Every salt a run's streams are seeded with, plus the harness hand's, which is
 * made outside RunState and off the same run seed.
 *
 * The list is derived and never hand-kept (#113). It was four names for as
 * long as the run held five, and the fifth arrived without the search that
 * exists to catch a collision ever being told about it. STREAM_SALTS is keyed
 * by StreamName, so a stream added to the run cannot reach here without a salt.
 *
 * It is the salts and not the stream names, because the salt is what `stream`
 * folds into the seed: the sequences that have to stay apart are the ones a run
 * actually draws.
 */
const NAMES: readonly string[] = [...Object.values(STREAM_SALTS), HAND_STREAM];

function draws(seed: number, name: string, count: number): number[] {
  const source = stream(seed, name);
  return Array.from({ length: count }, () => source.next());
}

/** Draws a whole run of every stream, plus one budget of headroom. */
const RUN_DRAW_BUDGET = 10_000;

// Ten budgets of headroom, so "no overlap" is a wide margin and not a squeak.
const SEARCH_WINDOW = 10 * RUN_DRAW_BUDGET;

// Enough draws in a wave that an accidental match is not chance.
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
  it("the overlap search covers every stream a run holds and the hand's beside them (#113)", () => {
    // The search below is only worth the names it is handed, and a list kept
    // by hand goes stale in silence: the territory stream landed while this
    // file still named four. STREAM_SALTS answers for the run's own, and the
    // hand's is the one salt outside it, because the harness makes its stream
    // in src/dev rather than inside RunState (ADR 0019).
    expect([...NAMES].sort()).toEqual([
      'bossFire',
      'director',
      'drops',
      HAND_STREAM,
      'mobFire',
      'pour',
      'shed',
      'spawns',
      'territory',
    ]);
    expect(NAMES).toHaveLength(new Set(NAMES).size);
  });

  it('seeds the power-up stream from the salt the first tape was recorded under', () => {
    // A salt is a durable identity, not a name: `stream` folds it into the run
    // seed, so moving it would give the same seed a different sequence and
    // every tape recorded before the move would stop reproducing its own run.
    // ADR 0061 renamed the stream from drops to power-ups and held the salt,
    // and this is the guard that a later rename cannot take it with it.
    expect(STREAM_SALTS.powerUps).toBe('drops');
    const run = createRun(4242);
    expect(
      Array.from({ length: 64 }, () => run.streams.powerUps.next()),
    ).toEqual(draws(4242, 'drops', 64));
  });

  it("gives the same sequence twice for a name outside the run's own streams (ADR 0012)", () => {
    // stream's parameter is a name string rather than the closed union, so the
    // harness can make its own without putting the bot's dice in the shipped
    // simulation. The widening changes who may ask for a stream and nothing
    // about what a stream is: the hand's is a stream on exactly the run's own
    // terms.
    expect(draws(4242, HAND_STREAM, 64)).toEqual(draws(4242, HAND_STREAM, 64));
    expect(draws(4242, HAND_STREAM, 64)).not.toEqual(
      draws(4243, HAND_STREAM, 64),
    );
    expect(draws(4242, HAND_STREAM, 64)).not.toEqual(draws(4242, 'spawns', 64));
  });

  it('nextInt stays in [0, bound) and covers every value over enough draws', () => {
    for (const bound of [1, 2, 4, 6, 7, 37]) {
      const source = stream(31, 'powerUps');
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
    const source = stream(31, 'powerUps');
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
