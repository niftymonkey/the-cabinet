// What the floor ladder's bled-rung memory did across a run.

import type { RunState } from '../../game/run';

/**
 * The transitions of `grave.scoreRungBled`, the memory that keeps a bled rung
 * bled until the grave grows a full hit's worth off the floor (design record
 * R4).
 *
 * It is the run's own state rather than a reading over events, on `refusals`'
 * and `gravePath`'s terms: no event carries the memory, its clear predicate
 * lives in `growGrave`, and the only way to read one is to look where the
 * invariant harness looks. This reading looks at the same moment, the end of
 * the tick, and reads the edge between one sample and the next. It never
 * re-runs the predicate that moves the field, because a second copy of a sim
 * rule inside `src/dev` is the thing that would quietly disagree with it.
 *
 * `growthShortOfClearing` is the crumb-threshold lever made measurable (record
 * section 7): the growth that arrived while the memory was set and left it set
 * is exactly what a lower threshold would have given back.
 *
 * It is the positive part of each tick's own size change, and what that leaves
 * out is named rather than left for a reader to find: growth that landed on the
 * same tick as a hit that shrank the grave is netted away, bounded by that
 * tick's own swallows. No event carries the size a swallow paid, `swallowed`
 * carrying the payout and the freshness rather than the growth, so the only
 * other source is `freshnessScale` and `growGrave`'s own ceiling clamp written
 * a second time inside src/dev, which is the copy this reading refuses to be.
 */
interface BledRungMemory {
  // Ticks the memory stood set.
  readonly ticksSet: number;
  // Times a ladder run set it, counted as the edge from clear to set.
  readonly timesSet: number;
  // Times growth cleared it, counted as the edge back.
  readonly timesCleared: number;
  // Size the grave gained while it stood set without the gain clearing it.
  readonly growthShortOfClearing: number;
}

interface BledRungMemoryAcc {
  ticksSet: number;
  timesSet: number;
  timesCleared: number;
  growthShortOfClearing: number;
  wasSet: boolean;
  lastSize: number;
}

/**
 * The starting size seeds the growth the first sample is measured against, the
 * way `createGravePath` seeds its own series: a conditioned run begins at the
 * size its header resolved to, and measuring the first tick's growth from
 * anything else would report a jump the run never made.
 */
const createBledRungMemory = (startingSize: number): BledRungMemoryAcc => ({
  ticksSet: 0,
  timesSet: 0,
  timesCleared: 0,
  growthShortOfClearing: 0,
  wasSet: false,
  lastSize: startingSize,
});

/**
 * The size this sample gained, and never the size it lost.
 *
 * A hit above the floor shrinks the grave, so the difference between two
 * samples is signed, and what the threshold is read against is growth alone.
 */
const growthSince = (lastSize: number, size: number): number =>
  Math.max(0, size - lastSize);

const observeBledRungMemory = (
  acc: BledRungMemoryAcc,
  state: RunState,
): void => {
  const isSet = state.grave.scoreRungBled;
  if (isSet) acc.ticksSet += 1;
  if (isSet && !acc.wasSet) acc.timesSet += 1;
  if (!isSet && acc.wasSet) acc.timesCleared += 1;
  // Growth that cleared the memory is the growth the threshold asked for, so
  // what is counted here is the growth that arrived and left it standing.
  if (isSet && acc.wasSet) {
    acc.growthShortOfClearing += growthSince(acc.lastSize, state.grave.size);
  }
  acc.wasSet = isSet;
  acc.lastSize = state.grave.size;
};

const bledRungMemoryOf = (acc: BledRungMemoryAcc): BledRungMemory => ({
  ticksSet: acc.ticksSet,
  timesSet: acc.timesSet,
  timesCleared: acc.timesCleared,
  growthShortOfClearing: acc.growthShortOfClearing,
});

export { createBledRungMemory, observeBledRungMemory, bledRungMemoryOf };
export type { BledRungMemory, BledRungMemoryAcc };
