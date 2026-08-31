// What the bell's shoves did, toll by toll: the pool's one push channel, visible.

import type { SimEvent } from '../../game/events';

// One toll's shoves: how many mobs the ring shoved, and how far in total.
interface TollShoves {
  readonly shoves: number;
  readonly distance: number;
}

/**
 * The repel reading: per toll, shoves counted and their real displacement
 * summed.
 *
 * A tolled event opens a toll window and every mobShoved lands in the window
 * open at the time; the shoves arrive across the ring's expansion, ticks
 * after the toll itself. A toll that shoved nothing still counts, because
 * push only exists at bell levels 4 and 5 and zero is the honest reading for
 * every toll below them.
 *
 * The totals are the run's whole repel, declared beside the per-toll view
 * they reduce, so comparing the channel is one decision in one place.
 */
interface Repel {
  readonly tolls: readonly TollShoves[];
  readonly totalShoves: number;
  readonly totalDistance: number;
}

interface RepelAcc {
  readonly tolls: { shoves: number; distance: number }[];
}

const createRepel = (): RepelAcc => ({ tolls: [] });

const observeRepel = (acc: RepelAcc, events: readonly SimEvent[]): void => {
  for (const event of events) {
    if (event.type === 'tolled') acc.tolls.push({ shoves: 0, distance: 0 });
    if (event.type !== 'mobShoved') continue;
    const window = acc.tolls[acc.tolls.length - 1];
    if (window === undefined) {
      // A ring cannot exist without a toll, so this is a bug in the sim's own
      // event order: it fails loudly and is never absorbed into a count.
      throw new Error(
        `mobShoved before any toll: mob ${event.id} shoved ${event.displacement}`,
      );
    }
    window.shoves += 1;
    window.distance += event.displacement;
  }
};

const repelOf = (acc: RepelAcc): Repel => ({
  tolls: acc.tolls.map((window) => ({ ...window })),
  totalShoves: acc.tolls.reduce((sum, window) => sum + window.shoves, 0),
  totalDistance: acc.tolls.reduce((sum, window) => sum + window.distance, 0),
});

export { createRepel, observeRepel, repelOf };
export type { Repel, RepelAcc, TollShoves };
