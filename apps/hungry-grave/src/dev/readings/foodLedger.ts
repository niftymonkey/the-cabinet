// Where food ended up, by kind: swallowed against lost.

import type { SimEvent } from '../../game/events';
import type { FoodKind } from '../../game/swallow';
import type { NumberRecord } from '../numbersByName';

/**
 * The three ends one kind of food reaches that leave an event behind.
 *
 * They do not add up to what spawned, and the reading claims nothing of the
 * sort: food still on the field at the stop reached no end at all, and a corpse
 * the cap evicted reports `corpseEvicted` rather than either of the two losses
 * here, which is the difference between the game running out of slots and a
 * dive nobody took.
 */
interface FoodEnds {
  readonly swallowed: number;
  // Off the bottom edge with value left (ADR 0004).
  readonly lost: number;
  // The dirt took it under at empty freshness (ADR 0004). Only a corpse decays.
  readonly rotted: number;
}

/**
 * Every kind of food, zero included, because a kind a run never saw is a fact
 * about the run and the design record asks for swallowed against lost for all
 * four ("Values are data").
 */
type FoodLedger = Readonly<Record<FoodKind, FoodEnds>>;

interface FoodEndsAcc {
  swallowed: number;
  lost: number;
  rotted: number;
}

/**
 * Keyed by the kind rather than walked off a list, so a fifth kind of food
 * cannot be added without this module answering for it.
 */
type FoodLedgerAcc = Record<FoodKind, FoodEndsAcc>;

const noEndsYet = (): FoodEndsAcc => ({ swallowed: 0, lost: 0, rotted: 0 });

const createFoodLedger = (): FoodLedgerAcc => ({
  corpse: noEndsYet(),
  powerUp: noEndsYet(),
  feast: noEndsYet(),
  fallenRung: noEndsYet(),
});

const observeFoodLedger = (
  acc: FoodLedgerAcc,
  events: readonly SimEvent[],
): void => {
  for (const event of events) {
    if (event.type === 'swallowed') acc[event.kind].swallowed += 1;
    if (event.type === 'corpseLost') acc[event.kind].lost += 1;
    if (event.type === 'corpseExpired') acc[event.kind].rotted += 1;
  }
};

const endsOf = (ends: FoodEndsAcc): FoodEnds => ({
  swallowed: ends.swallowed,
  lost: ends.lost,
  rotted: ends.rotted,
});

const foodLedgerOf = (acc: FoodLedgerAcc): FoodLedger => ({
  corpse: endsOf(acc.corpse),
  powerUp: endsOf(acc.powerUp),
  feast: endsOf(acc.feast),
  fallenRung: endsOf(acc.fallenRung),
});

/**
 * The ledger flattened to one name per figure, so a kind is twelve names rather
 * than a subtree the batch table would have to recognise.
 *
 * It is this reading's own, declared beside the counts it flattens, on the same
 * terms powerUpLedger.ts states for its own.
 */
const foodLedgerNumbers = (ledger: FoodLedger): NumberRecord => {
  const names: Record<string, number> = {};
  for (const [kind, ends] of Object.entries(ledger)) {
    for (const [end, count] of Object.entries(ends)) {
      names[`${kind}.${end}`] = count;
    }
  }
  return names;
};

export { createFoodLedger, foodLedgerNumbers, foodLedgerOf, observeFoodLedger };
export type { FoodEnds, FoodLedger, FoodLedgerAcc };
