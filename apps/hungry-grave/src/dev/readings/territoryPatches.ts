// How every patch of claimed ground ended.

import type { SimEvent } from '../../game/events';

/**
 * Territory's own question: did the prediction pay.
 *
 * A patch reaches exactly one of three ends and the three are kept apart, so
 * ground that spent its budget on real traffic is never counted with ground
 * that drifted away unused or with a patch the cap took to make room.
 * `emptied` is every closed patch that grabbed nothing at all, whatever ended
 * it, and it cuts across the three rather than sitting inside one of them.
 * Eviction is the dominant end and not a rare one, because the cap is small
 * against the swallow rate, so counting only the scrolled ones would report
 * near zero while most ground that grabbed nothing went uncounted. That is the
 * read #65 says the headstones never had, and building Territory without it
 * would repeat that mistake.
 *
 * `bitten` is the total across every closed patch. It is a count of grabs and
 * not of damage: the two are a fixed multiple of each other today, and stating
 * the grabs is what makes the reading survive a retune of what one costs.
 *
 * Nothing here counts patches still live when the run stopped. The claim is
 * about how a patch ended, and one that has not ended has no end to report.
 */
interface TerritoryPatches {
  readonly spent: number;
  readonly scrolled: number;
  readonly evicted: number;
  readonly emptied: number;
  readonly bitten: number;
}

interface TerritoryPatchesAcc {
  spent: number;
  scrolled: number;
  evicted: number;
  emptied: number;
  bitten: number;
}

const createTerritoryPatches = (): TerritoryPatchesAcc => ({
  spent: 0,
  scrolled: 0,
  evicted: 0,
  emptied: 0,
  bitten: 0,
});

const observeTerritoryPatches = (
  acc: TerritoryPatchesAcc,
  events: readonly SimEvent[],
): void => {
  for (const event of events) {
    if (event.type !== 'patchClosed') continue;
    acc[event.reason] += 1;
    acc.bitten += event.bitten;
    if (event.bitten === 0) acc.emptied += 1;
  }
};

const territoryPatchesOf = (acc: TerritoryPatchesAcc): TerritoryPatches => ({
  spent: acc.spent,
  scrolled: acc.scrolled,
  evicted: acc.evicted,
  emptied: acc.emptied,
  bitten: acc.bitten,
});

export { createTerritoryPatches, observeTerritoryPatches, territoryPatchesOf };
export type { TerritoryPatches, TerritoryPatchesAcc };
