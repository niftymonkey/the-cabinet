// The belch's rhythm: what it hit, how long it sat full, and what it spilled.

import type { PressedBody, PressRefusal, SimEvent } from '../../game/events';
import type { RunState } from '../../game/run';
import { RESERVOIR_CAPACITY } from '../../game/tuning';

/**
 * How many bodies each gate turned away, by the gate's own name. Every reason
 * is present at zero rather than absent, so a batch prints the same four keys
 * for every run and a missing key is never mistaken for a run that had none.
 */
type PressMisses = Readonly<Record<PressRefusal, number>>;

const NO_MISSES: PressMisses = {
  notEntered: 0,
  outOfReach: 0,
  noDirection: 0,
  notPushable: 0,
};

/**
 * Every reason by name, so a sum walks the same four names on every run. It is
 * spelled out rather than read off a record's keys, because a reduction whose
 * order depends on insertion order is one nobody can reproduce from the type.
 */
const PRESS_REFUSALS: readonly PressRefusal[] = [
  'notEntered',
  'outOfReach',
  'noDirection',
  'notPushable',
];

/**
 * One belch, and what the field gave it: the shots it took out of the air, the
 * bodies it threw off the ground around the grave, and the bodies it looked at
 * and did not throw.
 *
 * It counted kills until the belch stopped killing (ADR 0008 as amended, design
 * record R3 as superseded), and it counts the bodies the same press now throws
 * instead. A count that could only ever read zero would be a lie this reading
 * could still be asked to answer, and what the reading is for is telling a
 * press spent on a curtain from one spent on empty sky, which needs a body
 * count beside the shot count either way.
 *
 * `inFrame` and `misses` are what make `shoved: 0` readable: a press with a
 * hundred bodies in the frame and none in reach and a press with nothing alive
 * on the field are the same figure today and two different presses (Mark's
 * sighting and his standing rule of 2026-09-16, design record section 4).
 */
interface BelchFire {
  readonly tick: number;
  readonly shoved: number;
  readonly cancelled: number;
  // Every body the press looked at, the ones it moved included.
  readonly inFrame: number;
  readonly misses: PressMisses;
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
  /**
   * The share of its own frame each press moved, one entry per press that had
   * a frame at all.
   *
   * A press fired over an empty field contributes nothing rather than a zero,
   * on the interval list's own terms: a press with no body to reach has no
   * share of the field to be a share of, and averaging its zero in would read
   * as a press that failed rather than as a press with nothing to do.
   */
  readonly frameShares: readonly number[];
  // What the run's misses were made of, summed over every press.
  readonly misses: PressMisses;
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

// What one press's record says its misses were made of.
const missesOf = (bodies: readonly PressedBody[]): PressMisses => {
  const counted = { ...NO_MISSES };
  for (const body of bodies) {
    if (body.refusal === null) continue;
    counted[body.refusal] += 1;
  }
  return counted;
};

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
        shoved: event.shoved,
        cancelled: event.cancelled,
        inFrame: event.bodies.length,
        misses: missesOf(event.bodies),
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

// The share of its own frame each press moved, over the presses that had one.
const frameSharesOf = (fires: readonly BelchFire[]): number[] => {
  return fires
    .filter((fire) => fire.inFrame > 0)
    .map((fire) => fire.shoved / fire.inFrame);
};

// Every press's misses added up, reason by reason.
const missesOverRun = (fires: readonly BelchFire[]): PressMisses => {
  const summed = { ...NO_MISSES };
  for (const fire of fires) {
    for (const reason of PRESS_REFUSALS) summed[reason] += fire.misses[reason];
  }
  return summed;
};

const belchCadenceOf = (acc: BelchCadenceAcc): BelchCadence => ({
  fires: [...acc.fires],
  intervals: intervalsOf(acc.fires),
  ticksAtFull: acc.ticksAtFull,
  wasted: acc.wasted,
  frameShares: frameSharesOf(acc.fires),
  misses: missesOverRun(acc.fires),
});

export { createBelchCadence, observeBelchCadence, belchCadenceOf };
export type { BelchCadence, BelchFire, BelchCadenceAcc, PressMisses };
