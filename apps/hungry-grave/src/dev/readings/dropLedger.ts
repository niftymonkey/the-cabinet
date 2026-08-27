// Where every drop ended up.

import type { SimEvent } from '../../game/events';
import type { RunState } from '../../game/run';

/**
 * Every drop that landed on the field, accounted for.
 *
 * A drop reaches exactly one of three ends. It never expires and it is never
 * evicted: it does not decay, and the cap policy skips anything that does not,
 * refusing the spawn instead, so a refused spawn never reaches the denominator
 * either. The three terminal counts therefore add up to spawned, and that sum
 * is the ledger's own check on itself.
 *
 * The claim is that no drop leaves the ledger unobserved mid-run, and nothing
 * stronger than that.
 */
interface DropLedger {
  readonly spawned: number;
  readonly swallowed: number;
  // Off the bottom edge with its level still in it.
  readonly lost: number;
  readonly onFieldAtStop: number;
}

interface DropLedgerAcc {
  spawned: number;
  swallowed: number;
  lost: number;
  onFieldAtStop: number;
}

const createDropLedger = (): DropLedgerAcc => ({
  spawned: 0,
  swallowed: 0,
  lost: 0,
  onFieldAtStop: 0,
});

const liveDrops = (state: RunState): number =>
  state.corpses.reduce(
    (count, corpse) => count + (corpse.alive && corpse.kind === 'drop' ? 1 : 0),
    0,
  );

const observeDropLedger = (
  acc: DropLedgerAcc,
  events: readonly SimEvent[],
  state: RunState,
): void => {
  for (const event of events) {
    if (event.type === 'dropSpawned') acc.spawned += 1;
    if (event.type === 'swallowed' && event.kind === 'drop') {
      acc.swallowed += 1;
    }
    if (event.type === 'corpseLost' && event.kind === 'drop') acc.lost += 1;
  }
  // The last tick's field is the one the run stopped on.
  acc.onFieldAtStop = liveDrops(state);
};

const dropLedgerOf = (acc: DropLedgerAcc): DropLedger => ({
  spawned: acc.spawned,
  swallowed: acc.swallowed,
  lost: acc.lost,
  onFieldAtStop: acc.onFieldAtStop,
});

export { createDropLedger, observeDropLedger, dropLedgerOf };
export type { DropLedger, DropLedgerAcc };
