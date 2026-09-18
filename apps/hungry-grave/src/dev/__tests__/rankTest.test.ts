/**
 * The rank test: two sets of samples ordered against each other without any
 * assumption about the shape of either.
 *
 * It exists because a batch's spread used to keep five of a reading's
 * forty-eight values, so the tail the report is printed for could never enter
 * a comparison at all. Every figure here is computed by hand in the case that
 * asserts it, because a statistic checked against its own implementation is
 * checked against nothing.
 */

import { describe, expect, it } from 'vitest';

import { rankComparisonOf } from '../rankTest';

describe('the rank test over two sets of samples', () => {
  it('reads one above the other only when the samples say so, pair by pair', () => {
    // Every one of the nine pairs is won by the right side, which is the top
    // of the statistic's range and a rank-biserial of one.
    expect(rankComparisonOf([1, 2, 3], [4, 5, 6])).toEqual({
      left: 3,
      right: 3,
      u: 9,
      rankBiserial: 1,
    });

    // And the same two sets the other way round is the bottom of it.
    expect(rankComparisonOf([4, 5, 6], [1, 2, 3])).toEqual({
      left: 3,
      right: 3,
      u: 0,
      rankBiserial: -1,
    });
  });

  it('reads two identical sets as dead centre, counting a tie as half a pair', () => {
    // The four pairs are two ties and one win each way, so the statistic is
    // two of four and the fraction is zero: the two sets are the same set.
    expect(rankComparisonOf([1, 2], [1, 2])).toEqual({
      left: 2,
      right: 2,
      u: 2,
      rankBiserial: 0,
    });
  });

  it('reads the whole set and never a band of it', () => {
    // The point of keeping the raw values: two sets whose quartile bands sit
    // on top of each other are still ordered by what the tails did, and a
    // reading that only ever saw five numbers could not see this at all.
    const left = [10, 10, 10, 10, 10];
    const right = [10, 10, 10, 10, 40];

    const compared = rankComparisonOf(left, right);

    // Twenty ties at half a pair, and the five pairs the 40 wins outright.
    expect(compared?.u).toBe(15);
    expect(compared?.rankBiserial).toBeCloseTo(0.2, 10);
  });

  it('says nothing at all when either side has no samples', () => {
    // A set with no sample has no rank to take, and answering zero would be
    // the instrument inventing a comparison it never made.
    expect(rankComparisonOf([], [1, 2])).toBe(undefined);
    expect(rankComparisonOf([1, 2], [])).toBe(undefined);
  });
});
