// What a series of numbers reduces to: the figures a reading picks its own
// summary from.

/**
 * Each figure is absent for an empty series rather than zero. A run with no
 * samples has nothing to average, and answering zero would be the instrument
 * inventing a reading it never took.
 */
const firstOf = (series: readonly number[]): number | undefined =>
  series.length === 0 ? undefined : series[0];

const lastOf = (series: readonly number[]): number | undefined =>
  series.length === 0 ? undefined : series[series.length - 1];

const leastOf = (series: readonly number[]): number | undefined =>
  series.length === 0
    ? undefined
    : series.reduce((least, one) => (one < least ? one : least), series[0]);

const greatestOf = (series: readonly number[]): number | undefined =>
  series.length === 0
    ? undefined
    : series.reduce(
        (greatest, one) => (one > greatest ? one : greatest),
        series[0],
      );

const meanOf = (series: readonly number[]): number | undefined =>
  series.length === 0
    ? undefined
    : series.reduce((sum, one) => sum + one, 0) / series.length;

/**
 * The five numbers a batch reading prints as, and never a mean (ADR 0053): the
 * interesting runs are in a tail, and a mean is the one figure that hides one.
 */
interface FiveNumbers {
  readonly min: number;
  readonly lowerQuartile: number;
  readonly median: number;
  readonly upperQuartile: number;
  readonly max: number;
}

/**
 * Nearest-rank on the sorted series, the method framePerformance.ts:15 already
 * states for its own percentiles, so the tree has one convention and not two.
 */
const nearestRank = (sorted: readonly number[], rank: number): number =>
  sorted[Math.max(0, Math.ceil(rank * sorted.length) - 1)];

/**
 * Absent for an empty series, on the same terms as the figures above: a batch
 * with no run has nothing to summarise.
 */
const fiveNumbersOf = (series: readonly number[]): FiveNumbers | undefined => {
  if (series.length === 0) return undefined;
  const sorted = [...series].sort((a, b) => a - b);
  return {
    min: sorted[0],
    lowerQuartile: nearestRank(sorted, 0.25),
    median: nearestRank(sorted, 0.5),
    upperQuartile: nearestRank(sorted, 0.75),
    max: sorted[sorted.length - 1],
  };
};

export { firstOf, lastOf, leastOf, greatestOf, meanOf, fiveNumbersOf };
export type { FiveNumbers };
