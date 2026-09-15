// The belch's rhythm: what it hit, how long it sat full, and what it spilled.

import type { SimEvent } from '../../game/events';
import type { RunState } from '../../game/run';
import { RESERVOIR_CAPACITY } from '../../game/tuning';

// One belch, and what the field gave it.
interface BelchFire {
  readonly tick: number;
  readonly killed: number;
  readonly cancelled: number;
}

/**
 * The belch's rhythm, as three readings of the same button.
 *
 * ticksAtFull counts the ticks the reservoir sat at capacity, and nothing more.
 * A tick at full is a tick the belch was ready, which covers ordinary readiness
 * with nothing on the field worth spending on just as much as it covers
 * hoarding, so a large count on its own proves neither. Reading it as hoarding
 * needs the fires beside it and what the field held at the time.
 *
 * wasted is the separate figure: the charge that arrived while the reservoir
 * was already full and visibly splashed past it (ADR 0008). That one is charge
 * the run could not take.
 */
interface BelchCadence {
  readonly fires: readonly BelchFire[];
  /**
   * The ticks between one fire and the next, which is the cadence the fire list
   * already carried the ticks for. Index N is the gap from fire N to fire N
   * plus one, so a run with one fire or none has no interval at all rather than
   * a zero: a single belch has nothing to be an interval from.
   */
  readonly intervals: readonly number[];
  readonly ticksAtFull: number;
  readonly wasted: number;
}

interface BelchCadenceAcc {
  readonly fires: BelchFire[];
  ticksAtFull: number;
  wasted: number;
}

const createBelchCadence = (): BelchCadenceAcc => ({
  fires: [],
  ticksAtFull: 0,
  wasted: 0,
});

const observeBelchCadence = (
  acc: BelchCadenceAcc,
  tick: number,
  events: readonly SimEvent[],
  state: RunState,
): void => {
  for (const event of events) {
    if (event.type === 'belched') {
      acc.fires.push({
        tick,
        killed: event.killed,
        cancelled: event.cancelled,
      });
    }
    if (event.type === 'splashed') acc.wasted += event.wasted;
  }
  if (state.reservoir >= RESERVOIR_CAPACITY) acc.ticksAtFull += 1;
};

// The gaps between consecutive fires, taken off the ticks the fires carry.
const intervalsOf = (fires: readonly BelchFire[]): number[] => {
  const intervals: number[] = [];
  for (let index = 1; index < fires.length; index++) {
    const before = fires[index - 1];
    const now = fires[index];
    if (before === undefined || now === undefined) continue;
    intervals.push(now.tick - before.tick);
  }
  return intervals;
};

const belchCadenceOf = (acc: BelchCadenceAcc): BelchCadence => ({
  fires: [...acc.fires],
  intervals: intervalsOf(acc.fires),
  ticksAtFull: acc.ticksAtFull,
  wasted: acc.wasted,
});

export { createBelchCadence, observeBelchCadence, belchCadenceOf };
export type { BelchCadence, BelchFire, BelchCadenceAcc };
