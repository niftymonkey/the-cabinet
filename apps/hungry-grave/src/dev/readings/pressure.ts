// The director's own run, read back off its tape: the signal it stood at, every
// card it bought, and what each section had left.

import {
  advancePressure,
  SIGNAL_LOW_THRESHOLD,
  startingSignal,
} from '../../game/director';
import type { PressureSignal } from '../../game/director';
import type { SimEvent } from '../../game/events';
import type { SignalLock } from '../../game/signalLock';
import type { NumberRecord } from '../numbersByName';
import { firstOf, greatestOf, lastOf, leastOf, meanOf } from '../seriesSummary';

/**
 * One card the director bought, as the tape says it: what it was, where it
 * landed, which section paid, the signal the gate read low and what that
 * section had left afterwards.
 *
 * Every field comes off the directedAdd event and none of them is re-derived
 * here, which is what makes this an instrument rather than a second copy of the
 * director's rules.
 */
interface DirectedCardSeen {
  readonly tick: number;
  readonly formation: string;
  readonly type: string;
  readonly count: number;
  readonly section: string;
  // The middle of the group's own bodies, which is where the shape landed.
  readonly x: number;
  readonly signal: number;
  readonly purseLeft: number;
}

/**
 * The director's run, drawn against the tape it played (#85's acceptance line).
 *
 * THE SIGNAL SERIES IS RECOMPUTED AND NEVER READ OFF THE DIRECTOR. The
 * directedAdd event fires only on a spend, so there is no per-tick event a
 * series could be taken from; what there is instead are the three events
 * advancePressure itself reads, graveHit, scoreBled and weaponStripped, every
 * one of which is on every tape. So the series is the director's own pure
 * function run again over the tape's events, from the lock the header resolved.
 * That is the graph's ordinary shape rather than a re-derivation of the spend's
 * rules: nothing here knows what a card costs, what a purse is, or when the
 * gate opens.
 *
 * It is checkable rather than trusted, which is the half that makes it an
 * instrument. Every directedAdd carries the signal the gate read, so
 * disagreements counts the adds whose recorded signal is not the one this
 * series stood at when the add landed. A reading that agreed with the thing it
 * measures by construction could never report one.
 */
interface Pressure {
  /**
   * Index N is the signal after N ticks, matching gravePath's indexing. Index 0
   * is the figure the run's own lock resolved to.
   */
  readonly signalPerTick: readonly number[];
  readonly adds: readonly DirectedCardSeen[];
  /**
   * What each section had left after its last add, under the section's name. A
   * section that took no add carries nothing rather than its whole purse: the
   * tape says what was spent and never what was granted.
   */
  readonly purseLeftBySection: Readonly<Record<string, number>>;
  /**
   * Ticks the signal stood below the gate's own threshold, which is the ticks
   * the director was free to spend on, against the adds it actually made.
   *
   * It counts ticks and never samples: the series carries one sample more than
   * the run has ticks, and the last of them is the state the run stopped in,
   * which no gate ever read.
   *
   * It is the honest half of the plan's "quiet ticks": the die the quiet
   * interval drew on any one add is not on the tape, and the gaps between adds
   * are in the adds above. This is the opportunity and the adds are what was
   * taken of it.
   */
  readonly ticksSignalLow: number;
  // Adds whose recorded signal is not what this series stood at. Zero is the
  // reading that says the recomputation and the run agreed.
  readonly disagreements: number;
}

interface PressureAcc {
  signal: PressureSignal;
  readonly signalPerTick: number[];
  readonly adds: DirectedCardSeen[];
  readonly purseLeftBySection: Record<string, number>;
  ticksSignalLow: number;
  disagreements: number;
}

/**
 * The accumulator, standing at the signal the run's own lock resolved to. The
 * lock arrives from the tape header exactly as the starting size does, because
 * it is the run's identity and not the director's state: a reading that took it
 * off state.director would be reading the thing it measures.
 */
const createPressure = (lock: SignalLock): PressureAcc => {
  const signal = startingSignal(lock);
  return {
    signal,
    signalPerTick: [signal.value],
    adds: [],
    purseLeftBySection: {},
    ticksSignalLow: 0,
    disagreements: 0,
  };
};

// Every card this tick put down, as the tape's own events describe it.
const seeAdds = (
  acc: PressureAcc,
  tick: number,
  events: readonly SimEvent[],
): void => {
  for (const event of events) {
    if (event.type !== 'directedAdd') continue;
    // The gate reads the signal the tick opened on, because spendDirected runs
    // before advanceDirectorSignal in the tick order (step.ts). That is the
    // sample this series last pushed.
    const stood = acc.signalPerTick[acc.signalPerTick.length - 1];
    if (stood !== event.signal) acc.disagreements += 1;
    acc.adds.push({
      tick,
      formation: event.card.formation,
      type: event.card.type,
      count: event.card.count,
      section: event.section,
      x: event.x,
      signal: event.signal,
      purseLeft: event.purseLeft,
    });
    acc.purseLeftBySection[event.section] = event.purseLeft;
  }
};

/**
 * One tick, as the director met it.
 *
 * The listener's tick is the count of ticks that have run, so the tick the sim
 * advanced the signal on is one below it (execution.ts notifies after the
 * increment). Feeding the listener's own number would put every hold and every
 * decay boundary one tick out.
 */
const observePressure = (
  acc: PressureAcc,
  tick: number,
  events: readonly SimEvent[],
): void => {
  seeAdds(acc, tick, events);
  // Counted before the advance, because the gate reads the signal the tick
  // opened on: the sample this tick is about is the one already in the series,
  // and the one pushed below is what the tick left behind for the next gate.
  if (acc.signal.value < SIGNAL_LOW_THRESHOLD) acc.ticksSignalLow += 1;
  acc.signal = advancePressure(acc.signal, events, tick - 1);
  acc.signalPerTick.push(acc.signal.value);
};

const pressureOf = (acc: PressureAcc): Pressure => ({
  signalPerTick: [...acc.signalPerTick],
  adds: [...acc.adds],
  purseLeftBySection: { ...acc.purseLeftBySection },
  ticksSignalLow: acc.ticksSignalLow,
  disagreements: acc.disagreements,
});

/**
 * The signal across the run: where it started, where it ended, and the band
 * between. Declared here beside the series it summarises, on gravePath's own
 * terms, so comparing two runs' pressure is one decision in one place.
 */
const signalSummary = (series: readonly number[]): NumberRecord => ({
  first: firstOf(series),
  last: lastOf(series),
  min: leastOf(series),
  max: greatestOf(series),
  mean: meanOf(series),
});

/**
 * What a batch reads off the adds: how many landed over the run, and how many
 * landed under each section. The formations and the counts are in the adds
 * themselves; what a spread over many runs can carry is a count.
 */
const addsBySection = (pressure: Pressure): NumberRecord => {
  const names: Record<string, number> = { run: pressure.adds.length };
  for (const add of pressure.adds) {
    names[add.section] = (names[add.section] ?? 0) + 1;
  }
  return names;
};

export {
  createPressure,
  observePressure,
  pressureOf,
  signalSummary,
  addsBySection,
};
export type { DirectedCardSeen, Pressure, PressureAcc };
