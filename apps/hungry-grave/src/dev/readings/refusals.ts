// What the caps turned away over a whole run, so a batch can say it (ADR 0056).

import type { RunState } from '../../game/run';

/**
 * Every cap refusal a run made, summed over its ticks.
 *
 * It is the run's own state rather than a reading over events: `RunState`
 * clears the ledger at the top of every tick and no event carries a refusal, so
 * the only way to read one is to look where the invariant harness looks. This
 * reading looks at the same moment, the end of the tick, and adds the tick's
 * own three counts to the run's.
 *
 * Every cap is a safety net sized above the densest thing its pool can hold, so
 * **a non-zero figure here is a fault and never a cap to raise**: it says the
 * content or the derivation moved out from under a net. The reading exists so
 * that a batch report can say so, which is the question step 4's verification
 * asked and only a hand tape could answer (design record section 4).
 */
interface Refusals {
  // Food a full corpse pool turned away.
  readonly food: number;
  // Power-up carriers a full mob pool turned away.
  readonly carriers: number;
  // Offers that could stand no body and banked instead.
  readonly offers: number;
}

interface RefusalsAcc {
  food: number;
  carriers: number;
  offers: number;
}

const createRefusals = (): RefusalsAcc => ({ food: 0, carriers: 0, offers: 0 });

/**
 * One tick's refusals, added to the run's.
 *
 * The listeners fire after the tick's own checks and before the next tick
 * clears the ledger (execution.ts), so what this reads is the tick's own count,
 * exactly as `checkRefusals` reads it.
 */
const observeRefusals = (acc: RefusalsAcc, state: RunState): void => {
  acc.food += state.refusals.food;
  acc.carriers += state.refusals.carriers;
  acc.offers += state.refusals.offers;
};

const refusalsOf = (acc: RefusalsAcc): Refusals => ({
  food: acc.food,
  carriers: acc.carriers,
  offers: acc.offers,
});

export { createRefusals, observeRefusals, refusalsOf };
export type { Refusals, RefusalsAcc };
