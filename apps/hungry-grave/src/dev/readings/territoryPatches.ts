// Every lay, how every patch of claimed ground ended, and how much it ground.

import type { SimEvent } from '../../game/events';

/**
 * Territory's own question: did the targeting pay.
 *
 * `laid` counts every lay the clock made; a patch reaches exactly one of two
 * ends and the two are kept apart, so ground that drifted off the bottom is
 * never counted with ground the cap took to make room. `emptied` is every
 * closed patch that pulsed nothing at all, whatever ended it, and it cuts
 * across the ends rather than sitting inside one of them: it is the read that
 * judges the targeting, because ground laid onto real traffic pulses. That is
 * the read #65 says the headstones never had.
 *
 * `pulses` is the total across every closed patch. It is a count of touches
 * and not of damage: the two are a fixed multiple of each other today, and
 * stating the touches is what makes the reading survive a retune of what one
 * costs.
 *
 * The end counts read only closings, so a patch still live when the run
 * stopped has no end to report; `laid` reads the lay itself, so cadence is
 * counted the moment the ground opens.
 */
interface TerritoryPatches {
  readonly laid: number;
  readonly scrolled: number;
  readonly evicted: number;
  readonly emptied: number;
  readonly pulses: number;
}

interface TerritoryPatchesAcc {
  laid: number;
  scrolled: number;
  evicted: number;
  emptied: number;
  pulses: number;
}

const createTerritoryPatches = (): TerritoryPatchesAcc => ({
  laid: 0,
  scrolled: 0,
  evicted: 0,
  emptied: 0,
  pulses: 0,
});

const observeTerritoryPatches = (
  acc: TerritoryPatchesAcc,
  events: readonly SimEvent[],
): void => {
  for (const event of events) {
    if (event.type === 'patchLaid') acc.laid += 1;
    if (event.type !== 'patchClosed') continue;
    acc[event.reason] += 1;
    acc.pulses += event.pulses;
    if (event.pulses === 0) acc.emptied += 1;
  }
};

const territoryPatchesOf = (acc: TerritoryPatchesAcc): TerritoryPatches => ({
  laid: acc.laid,
  scrolled: acc.scrolled,
  evicted: acc.evicted,
  emptied: acc.emptied,
  pulses: acc.pulses,
});

export { createTerritoryPatches, observeTerritoryPatches, territoryPatchesOf };
export type { TerritoryPatches, TerritoryPatchesAcc };
