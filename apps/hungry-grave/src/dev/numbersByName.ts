// A record of names to numbers: the shape every arm, line and bucket the
// instrument counts is kept in.

// A record either side of which may be missing a name, which is why a value may be undefined.
type NumberRecord = Readonly<Record<string, number | undefined>>;

/**
 * Adds an amount under a name, whether or not the name has been seen before.
 *
 * The fallback is load-bearing rather than defensive: an unseeded name would
 * make the write NaN, and JSON.stringify writes NaN as null, so a silently
 * wrong metric would reach the report through a record that looked fine
 * (ADR 0019 says metrics come only from a verified replay, which a NaN is not).
 */
const addTo = (
  record: Record<string, number>,
  name: string,
  amount: number,
): void => {
  record[name] = (record[name] ?? 0) + amount;
};

export { addTo };
export type { NumberRecord };
