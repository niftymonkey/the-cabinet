// What the pool's two pushes did: the bell's shoves toll by toll, and the
// belch's own arm beside them (design record R9, READINGS_VERSION 5).

import type { SimEvent } from '../../game/events';

// One toll's shoves: how many mobs the ring shoved, and how far in total.
interface TollShoves {
  readonly shoves: number;
  readonly distance: number;
}

/**
 * The repel reading, split by the push that threw each shove.
 *
 * The toll arm is unchanged. A tolled event opens a toll window and every bell
 * shove lands in the window open at the time; the shoves arrive across the
 * ring's expansion and up to seven ticks of travel after it. A toll that shoved
 * nothing still counts, because push only exists at bell levels 4 and 5 and
 * zero is the honest reading for every toll below them. The totals are the
 * bell's whole repel, declared beside the per-toll view they reduce.
 *
 * The belch's arm is flat and never per belch. What a batch asks of it is how
 * much pushback the belch bought, and when each belch fired is already the
 * belch cadence reading's answer; a window per belch would be structure built
 * for a reader nobody has written down.
 */
interface Repel {
  readonly tolls: readonly TollShoves[];
  readonly totalShoves: number;
  readonly totalDistance: number;
  // Slice J is the caller these two are declared for (design record section 4).
  readonly belchShoves: number;
  readonly belchDistance: number;
}

interface RepelAcc {
  readonly tolls: { shoves: number; distance: number }[];
  belchShoves: number;
  belchDistance: number;
}

const createRepel = (): RepelAcc => ({
  tolls: [],
  belchShoves: 0,
  belchDistance: 0,
});

/**
 * One bell shove, into the toll window open when it landed.
 *
 * A ring cannot exist without a toll, so a bell shove with no window open is a
 * bug in the sim's own event order: it fails loudly and is never absorbed into
 * a count. The throw is kept for exactly that case and no other, which is what
 * the belch's arm above exists to take out from under it.
 */
const countTollShove = (acc: RepelAcc, event: SimEvent): void => {
  if (event.type !== 'mobShoved') return;
  const window = acc.tolls[acc.tolls.length - 1];
  if (window === undefined) {
    throw new Error(
      `mobShoved before any toll: mob ${event.id} shoved ${event.displacement}`,
    );
  }
  window.shoves += 1;
  window.distance += event.displacement;
};

const observeRepel = (acc: RepelAcc, events: readonly SimEvent[]): void => {
  for (const event of events) {
    if (event.type === 'tolled') acc.tolls.push({ shoves: 0, distance: 0 });
    if (event.type !== 'mobShoved') continue;
    if (event.source === 'belch') {
      acc.belchShoves += 1;
      acc.belchDistance += event.displacement;
      continue;
    }
    countTollShove(acc, event);
  }
};

const repelOf = (acc: RepelAcc): Repel => ({
  tolls: acc.tolls.map((window) => ({ ...window })),
  totalShoves: acc.tolls.reduce((sum, window) => sum + window.shoves, 0),
  totalDistance: acc.tolls.reduce((sum, window) => sum + window.distance, 0),
  belchShoves: acc.belchShoves,
  belchDistance: acc.belchDistance,
});

export { createRepel, observeRepel, repelOf };
export type { Repel, RepelAcc, TollShoves };
