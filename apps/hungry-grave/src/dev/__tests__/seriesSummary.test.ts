// What a series of numbers reduces to, at the seam the batch report reads it through.

import { describe, expect, it } from 'vitest';

import { fiveNumbersOf } from '../seriesSummary';

describe('the five numbers a series reduces to', () => {
  it('summarises a known series, one value alone, and nothing at all', () => {
    // Test 64. Nearest-rank on the sorted series, which is the method
    // framePerformance.ts:15 already states, so the tree has one convention.
    // Worked out by hand over eight values: the quartile ranks are ceil(0.25*8)
    // = 2, ceil(0.5*8) = 4 and ceil(0.75*8) = 6, which are the second, fourth
    // and sixth values of the sorted series.
    expect(fiveNumbersOf([8, 3, 1, 7, 2, 5, 6, 4])).toEqual({
      min: 1,
      lowerQuartile: 2,
      median: 4,
      upperQuartile: 6,
      max: 8,
    });

    // One value is its own every figure: a series of one has no spread to have.
    expect(fiveNumbersOf([7])).toEqual({
      min: 7,
      lowerQuartile: 7,
      median: 7,
      upperQuartile: 7,
      max: 7,
    });

    // Absent rather than zero, on the same terms as every other figure in this
    // file: a series with no samples has nothing to summarise, and answering
    // zero would be the instrument inventing a reading it never took.
    expect(fiveNumbersOf([])).toBe(undefined);
  });

  it('leaves the series it was handed alone', () => {
    // Test 64. It sorts to find its ranks, and a reading that reordered the
    // series it was given would silently move every figure taken off that same
    // series afterwards.
    const series = [3, 1, 2];

    fiveNumbersOf(series);

    expect(series).toEqual([3, 1, 2]);
  });
});
