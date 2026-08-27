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

export { firstOf, lastOf, leastOf, greatestOf, meanOf };
