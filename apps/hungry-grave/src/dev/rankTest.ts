// Two sets of samples ordered by rank, with no assumption about their shape.

/**
 * What a rank test says about two sets of samples.
 *
 * `u` is the Mann-Whitney statistic for the right side: over every pair of one
 * left sample and one right sample, the count of pairs whose right value is
 * the larger, with a tie counted as half a pair. It runs from zero, where
 * every left sample is above every right one, to the product of the two
 * counts, where every right sample is above every left one.
 *
 * `rankBiserial` is that same statistic as a fraction from minus one to one,
 * so two readings measured in different units can be read side by side. It is
 * the effect size and never a verdict: nothing here says a difference is large
 * enough to believe, because ADR 0053 leaves that to the reader and a
 * significance figure would be a threshold wearing a number's clothes.
 */
interface RankComparison {
  readonly left: number;
  readonly right: number;
  readonly u: number;
  readonly rankBiserial: number;
}

/** Half a pair for a tie, which is what keeps a set of equal values at dead centre. */
const HALF = 0.5;

// How much of one pair the right sample won.
const wonBy = (left: number, right: number): number => {
  if (right > left) return 1;
  if (right === left) return HALF;
  return 0;
};

const pairsWonByTheRight = (
  left: readonly number[],
  right: readonly number[],
): number => {
  let won = 0;
  for (const here of left) {
    for (const there of right) won += wonBy(here, there);
  }
  return won;
};

/**
 * The rank comparison between two sets of samples, or nothing when either side
 * has none: a set with no sample has no rank to take.
 *
 * It walks every pair rather than sorting and ranking, which is the same
 * statistic by its own definition and needs no tie correction of its own. A
 * batch is tens of runs, so the walk is thousands of comparisons per reading
 * and the exact form costs nothing.
 */
const rankComparisonOf = (
  left: readonly number[],
  right: readonly number[],
): RankComparison | undefined => {
  const pairs = left.length * right.length;
  if (pairs === 0) return undefined;
  const u = pairsWonByTheRight(left, right);
  return {
    left: left.length,
    right: right.length,
    u,
    rankBiserial: (2 * u) / pairs - 1,
  };
};

export { rankComparisonOf };
export type { RankComparison };
