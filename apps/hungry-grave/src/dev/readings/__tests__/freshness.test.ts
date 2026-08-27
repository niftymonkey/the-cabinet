/**
 * The multiplier every swallow paid (#74 story 12). The events come out of the
 * sim's own swallow, and the expected multipliers are ADR 0004's payout floor
 * read off the rule rather than off the reading.
 */

import { describe, expect, it } from 'vitest';

import { createRun } from '../../../game/run';
import { swallow } from '../../../game/swallow';
import {
  createFreshnessPaid,
  freshnessPaidOf,
  observeFreshnessPaid,
} from '../freshness';

const SEED = 20260826;
const PAYOUT = 1;

describe('freshness paid', () => {
  it('reports the floored multiplier each swallow paid, split by food kind', () => {
    // The reported number is what the swallow actually paid, never the raw
    // freshness: a scrap at 0.1 pays the floor, and a report carrying 0.1
    // would say the economy punished the player harder than it did.
    const run = createRun(SEED);
    const accumulator = createFreshnessPaid();

    observeFreshnessPaid(
      accumulator,
      swallow(run, { kind: 'corpse', freshness: 0.5, payout: PAYOUT }),
    );
    observeFreshnessPaid(
      accumulator,
      swallow(run, { kind: 'corpse', freshness: 0.1, payout: PAYOUT }),
    );
    observeFreshnessPaid(
      accumulator,
      swallow(run, { kind: 'drop', freshness: 1, payout: PAYOUT }),
    );

    const paid = freshnessPaidOf(accumulator);
    expect(paid.swallows).toEqual({ corpse: 2, drop: 1 });
    expect(paid.minPaid.corpse).toBe(0.25);
    expect(paid.maxPaid.corpse).toBe(0.5);
    expect(paid.meanPaid.corpse).toBeCloseTo(0.375, 10);
    expect(paid.minPaid.drop).toBe(1);
    expect(paid.maxPaid.drop).toBe(1);
    // A kind never swallowed has no multiplier to report, so it is absent.
    expect('feast' in paid.swallows).toBe(false);
  });
});
