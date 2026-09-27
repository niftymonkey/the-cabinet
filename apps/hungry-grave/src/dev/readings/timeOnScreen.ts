// How long each mob stood on the field, from its top crossing in to its death or its leaving.

import { TICK_HZ } from '../../game/clock';
import type { SimEvent } from '../../game/events';
import { hasEntered, MOB_TYPE_NAMES, MOB_TYPES } from '../../game/mobs';
import type { MobType } from '../../game/mobs';
import type { RunState } from '../../game/run';
import type { NumberRecord } from '../numbersByName';

// One mob type's times on screen, over the mobs that finished them.
interface TypeTimeOnScreen {
  readonly timed: number;
  // Null for a type no finished mob of carries, which has no time to report.
  readonly medianSeconds: number | null;
  readonly largestSeconds: number | null;
}

/**
 * Seconds on screen per mob type (tilted view A4), from the tick a mob's top
 * crosses into the field to the tick it dies or leaves. A mob still on the
 * field at the run's end is counted apart under `onScreenAtEnd`, because its
 * time is cut short by the run and not by the mob.
 */
interface TimeOnScreen {
  readonly byType: Readonly<Record<string, TypeTimeOnScreen>>;
  readonly onScreenAtEnd: Readonly<Record<string, number>>;
}

// A mob on screen now, and the tick its top crossed in.
interface OnScreen {
  readonly type: MobType;
  readonly since: number;
}

interface TimeOnScreenAcc {
  // Keyed by entity id, which only ever increases, so a pool slot taken by a new body is a new key.
  readonly onScreen: Map<number, OnScreen>;
  // The finished times per type, in ticks.
  readonly finished: Record<string, number[]>;
}

const createTimeOnScreen = (): TimeOnScreenAcc => {
  const finished: Record<string, number[]> = {};
  for (const type of MOB_TYPE_NAMES) finished[type] = [];
  return { onScreen: new Map(), finished };
};

// A time finished under its type.
const finish = (acc: TimeOnScreenAcc, type: MobType, ticks: number): void => {
  acc.finished[type]?.push(ticks);
};

/**
 * The deaths this tick. A body that crossed in and died inside one tick was
 * never seen on screen, so the event's own place says whether it had entered,
 * and it stood there for no whole tick.
 */
const closeDeaths = (
  acc: TimeOnScreenAcc,
  events: readonly SimEvent[],
  tick: number,
): void => {
  for (const event of events) {
    if (event.type !== 'mobKilled') continue;
    const open = acc.onScreen.get(event.id);
    if (open !== undefined) {
      finish(acc, open.type, tick - open.since);
      acc.onScreen.delete(event.id);
      continue;
    }
    if (event.y - MOB_TYPES[event.mob].halfHeight >= 0) {
      finish(acc, event.mob, 0);
    }
  }
};

/**
 * Starts the clock on every live body whose top has crossed in, and stops it on
 * every body the pool no longer holds alive that no death took: the cull takes
 * a body past an edge without an event, so its leaving is read off the pool.
 */
const trackThePool = (acc: TimeOnScreenAcc, state: RunState): void => {
  const alive = new Set<number>();
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    alive.add(mob.id);
    if (acc.onScreen.has(mob.id) || !hasEntered(mob)) continue;
    acc.onScreen.set(mob.id, { type: mob.type, since: state.tick });
  }
  for (const [id, open] of acc.onScreen) {
    if (alive.has(id)) continue;
    finish(acc, open.type, state.tick - open.since);
    acc.onScreen.delete(id);
  }
};

const observeTimeOnScreen = (
  acc: TimeOnScreenAcc,
  events: readonly SimEvent[],
  state: RunState,
): void => {
  closeDeaths(acc, events, state.tick);
  trackThePool(acc, state);
};

// The middle of a sorted list, the mean of the two middles when it is even.
const medianOf = (sorted: readonly number[]): number | null => {
  if (sorted.length === 0) return null;
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle]!;
  if (sorted.length % 2 === 1) return upper;
  return (sorted[middle - 1]! + upper) / 2;
};

const typeTimeOf = (ticks: readonly number[]): TypeTimeOnScreen => {
  const sorted = [...ticks].sort((a, b) => a - b);
  const median = medianOf(sorted);
  const largest = sorted[sorted.length - 1];
  return {
    timed: sorted.length,
    medianSeconds: median === null ? null : median / TICK_HZ,
    largestSeconds: largest === undefined ? null : largest / TICK_HZ,
  };
};

const timeOnScreenOf = (acc: TimeOnScreenAcc): TimeOnScreen => {
  const byType: Record<string, TypeTimeOnScreen> = {};
  const onScreenAtEnd: Record<string, number> = {};
  for (const type of MOB_TYPE_NAMES) {
    byType[type] = typeTimeOf(acc.finished[type] ?? []);
    onScreenAtEnd[type] = 0;
  }
  for (const open of acc.onScreen.values()) {
    onScreenAtEnd[open.type] = (onScreenAtEnd[open.type] ?? 0) + 1;
  }
  return { byType, onScreenAtEnd };
};

/**
 * The per-type figures as named numbers, `shambler.medianSeconds` and its
 * siblings, which is how the batch and the comparison tables read a nested
 * reading. A type no finished mob carries has no time and is absent rather
 * than zero, because zero seconds is a time.
 */
const timeOnScreenByName = (reading: TimeOnScreen): NumberRecord => {
  const named: Record<string, number | undefined> = {};
  for (const [type, times] of Object.entries(reading.byType)) {
    named[`${type}.timed`] = times.timed;
    named[`${type}.medianSeconds`] = times.medianSeconds ?? undefined;
    named[`${type}.largestSeconds`] = times.largestSeconds ?? undefined;
  }
  return named;
};

export {
  createTimeOnScreen,
  observeTimeOnScreen,
  timeOnScreenByName,
  timeOnScreenOf,
};
export type { TimeOnScreen, TimeOnScreenAcc, TypeTimeOnScreen };
