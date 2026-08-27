// The multiplier every swallow paid.

import type { SimEvent } from '../../game/events';
import type { FoodKind } from '../../game/swallow';
import { freshnessScale } from '../../game/swallow';
import { greatestOf, leastOf, meanOf } from '../seriesSummary';

/**
 * What freshness cost the player, split by food kind, as the floored multiplier
 * actually paid rather than the raw freshness the event carries (ADR 0004's
 * payout floor).
 *
 * A kind never swallowed is absent rather than zero: a run that ate no feast
 * has no multiplier to report for one.
 */
interface FreshnessPaid {
  readonly swallows: Readonly<Partial<Record<FoodKind, number>>>;
  readonly meanPaid: Readonly<Partial<Record<FoodKind, number>>>;
  readonly minPaid: Readonly<Partial<Record<FoodKind, number>>>;
  readonly maxPaid: Readonly<Partial<Record<FoodKind, number>>>;
}

interface FreshnessPaidAcc {
  readonly paid: Map<FoodKind, number[]>;
}

const createFreshnessPaid = (): FreshnessPaidAcc => ({ paid: new Map() });

const observeFreshnessPaid = (
  acc: FreshnessPaidAcc,
  events: readonly SimEvent[],
): void => {
  for (const event of events) {
    if (event.type !== 'swallowed') continue;
    const paid = freshnessScale(event.freshness);
    const kind = acc.paid.get(event.kind);
    if (kind === undefined) acc.paid.set(event.kind, [paid]);
    else kind.push(paid);
  }
};

const freshnessPaidOf = (acc: FreshnessPaidAcc): FreshnessPaid => {
  const swallows: Partial<Record<FoodKind, number>> = {};
  const meanPaid: Partial<Record<FoodKind, number>> = {};
  const minPaid: Partial<Record<FoodKind, number>> = {};
  const maxPaid: Partial<Record<FoodKind, number>> = {};
  for (const [kind, paid] of acc.paid) {
    swallows[kind] = paid.length;
    meanPaid[kind] = meanOf(paid);
    minPaid[kind] = leastOf(paid);
    maxPaid[kind] = greatestOf(paid);
  }
  return { swallows, meanPaid, minPaid, maxPaid };
};

export { createFreshnessPaid, observeFreshnessPaid, freshnessPaidOf };
export type { FreshnessPaid, FreshnessPaidAcc };
