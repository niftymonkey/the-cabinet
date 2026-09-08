// Where every drop ended up.

import type { SimEvent } from '../../game/events';
import type { RunState } from '../../game/run';

/**
 * Every option body that landed on the field, accounted for.
 *
 * A body reaches exactly one of four ends. It never expires and it is never
 * evicted: it does not decay, and the cap policy skips anything that does not,
 * refusing the spawn instead, so a refused spawn never reaches the denominator
 * either. The fourth end arrived with the offer (ADR 0034): the two siblings of
 * a taken body are neither swallowed nor lost, they vanish on the tick the take
 * lands, and without them the counts stop adding up to spawned. The four
 * terminal counts therefore add up to spawned, and that sum is the ledger's own
 * check on itself.
 *
 * The claim is that no body leaves the ledger unobserved mid-run, and nothing
 * stronger than that.
 */
interface DropLedger {
  readonly spawned: number;
  readonly swallowed: number;
  // Vanished because a sibling of the same offer went in (ADR 0034).
  readonly passed: number;
  // Off the bottom edge with its option still in it.
  readonly lost: number;
  readonly onFieldAtStop: number;
}

interface DropLedgerAcc {
  spawned: number;
  swallowed: number;
  passed: number;
  lost: number;
  onFieldAtStop: number;
}

const createDropLedger = (): DropLedgerAcc => ({
  spawned: 0,
  swallowed: 0,
  passed: 0,
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
    // The take names the options it passed over, which is the only report the
    // vanished siblings ever make: they leave the field without an event of
    // their own, exactly as ADR 0034's take describes.
    if (event.type === 'offerTaken') acc.passed += event.passed.length;
    if (event.type === 'corpseLost' && event.kind === 'drop') acc.lost += 1;
  }
  // The last tick's field is the one the run stopped on.
  acc.onFieldAtStop = liveDrops(state);
};

const dropLedgerOf = (acc: DropLedgerAcc): DropLedger => ({
  spawned: acc.spawned,
  swallowed: acc.swallowed,
  passed: acc.passed,
  lost: acc.lost,
  onFieldAtStop: acc.onFieldAtStop,
});

export { createDropLedger, observeDropLedger, dropLedgerOf };
export type { DropLedger, DropLedgerAcc };
