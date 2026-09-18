// The belch's rhythm: what it hit, how long it sat full, and what it spilled.

import { BELCH_SHOVES } from '../../game/belch';
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
/**
 * One shove of a press, and the frame it swept at its own tick.
 *
 * `moved` and `carried` are counted apart and are never added together. A body
 * the press has already thrown is caught by the press and is not thrown again,
 * so the share of its own circle a shove reached is `moved` plus `carried` over
 * `inFrame`, while what that shove itself did is `moved` alone.
 */
interface PressShove {
  // Every body in the frame at this shove's own tick, whatever it did with them.
  readonly inFrame: number;
  // Bodies this shove threw, which never includes one already under this press.
  readonly moved: number;
  // Bodies already travelling under this press when this shove reached them.
  readonly carried: number;
  readonly misses: PressMisses;
}

interface BelchFire {
  readonly tick: number;
  // The tick the press began on, which is what joins its shoves to it.
  readonly beganAt: number;
  readonly shoved: number;
  readonly cancelled: number;
  // Every body the press looked at on the tick it landed, the moved included.
  readonly inFrame: number;
  // What the press's own first shove missed, and never its three frames summed.
  readonly misses: PressMisses;
  // Every shove of the press that went out, in the order they went out.
  readonly shoves: readonly PressShove[];
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
   * The share of its own frame each press's first shove moved, one entry per
   * press that had a frame at all.
   *
   * A press fired over an empty field contributes nothing rather than a zero,
   * on the interval list's own terms: a press with no body to reach has no
   * share of the field to be a share of, and averaging its zero in would read
   * as a press that failed rather than as a press with nothing to do.
   */
  readonly frameShares: readonly number[];
  // What the run's misses were made of, summed over every press's first shove.
  readonly misses: PressMisses;
  /**
   * The bodies each shove of a press threw, summed over the run's presses, the
   * first shove first. A shove that moved nobody reads zero, which is the whole
   * question this reading exists to answer.
   */
  readonly movedPerShove: readonly number[];
  /**
   * The share of its own frame each shove of a press had caught, meaned over
   * the presses that gave that shove a frame at all.
   *
   * CAUGHT AND NOT MOVED. A body the press threw on an earlier shove is
   * counted here beside one this shove threw, because the question is what
   * share of the circle the press is holding and a body already flying is held.
   * What each shove itself threw is `movedPerShove` above, and the two are
   * never added together.
   */
  readonly caughtSharePerShove: readonly number[];
}

interface BelchFireAcc {
  readonly tick: number;
  readonly beganAt: number;
  readonly cancelled: number;
  readonly shoves: PressShove[];
}

interface BelchCadenceAcc {
  readonly fires: BelchFireAcc[];
  ticksAtFull: number;
  wasted: number;
}

const createBelchCadence = (): BelchCadenceAcc => ({
  fires: [],
  ticksAtFull: 0,
  wasted: 0,
});

// What one shove's frame says its misses were made of.
const missesOf = (bodies: readonly PressedBody[]): PressMisses => {
  const counted = { ...NO_MISSES };
  for (const body of bodies) {
    if (body.outcome !== 'refused') continue;
    counted[body.refusal] += 1;
  }
  return counted;
};

// How many bodies in one frame ended with this outcome.
const countedAs = (
  bodies: readonly PressedBody[],
  outcome: PressedBody['outcome'],
): number => {
  return bodies.filter((body) => body.outcome === outcome).length;
};

const shoveOf = (bodies: readonly PressedBody[]): PressShove => ({
  inFrame: bodies.length,
  moved: countedAs(bodies, 'moved'),
  carried: countedAs(bodies, 'carried'),
  misses: missesOf(bodies),
});

/**
 * The fire a shove belongs to, joined by the tick its press began on, opened by
 * the press's own first shove.
 *
 * Joining by the press tick rather than by whichever fire is newest is what
 * lets a reader of this file see that a shove and its press are the same press,
 * which matters because a shove arrives up to sixty ticks after the `belched`
 * that names its cancelled shots.
 */
const fireBegunAt = (
  acc: BelchCadenceAcc,
  tick: number,
  cancelled: number,
  beganAt: number,
): BelchFireAcc => {
  const open = acc.fires.find((fire) => fire.beganAt === beganAt);
  if (open !== undefined) return open;
  const fire: BelchFireAcc = { tick, beganAt, cancelled, shoves: [] };
  acc.fires.push(fire);
  return fire;
};

/**
 * One tick's belch traffic. The events are read in the order the sim emitted
 * them, which is what lets the press's own `belched` hand its cancelled count
 * to the first shove of the same press: the two arrive on one tick and the
 * press's own event is first.
 */
const observeBelchCadence = (
  acc: BelchCadenceAcc,
  tick: number,
  events: readonly SimEvent[],
  state: RunState,
): void => {
  let cancelled = 0;
  for (const event of events) {
    if (event.type === 'belched') cancelled = event.cancelled;
    if (event.type === 'splashed') acc.wasted += event.wasted;
    if (event.type !== 'burstShoved') continue;
    const fire = fireBegunAt(acc, tick, cancelled, event.beganAt);
    fire.shoves.push(shoveOf(event.bodies));
  }
  if (state.reservoir >= RESERVOIR_CAPACITY) acc.ticksAtFull += 1;
};

/**
 * The press's own first shove, which is what `shoved`, `inFrame` and `misses`
 * have always meant. A fire is opened by its first shove, so one with none is a
 * bug in this file rather than a run with nothing in it.
 */
const firstShoveOf = (fire: BelchFireAcc): PressShove => {
  const first = fire.shoves[0];
  if (first === undefined) throw new Error('a belch fire with no shove in it');
  return first;
};

const fireOf = (fire: BelchFireAcc): BelchFire => ({
  tick: fire.tick,
  beganAt: fire.beganAt,
  shoved: firstShoveOf(fire).moved,
  cancelled: fire.cancelled,
  inFrame: firstShoveOf(fire).inFrame,
  misses: firstShoveOf(fire).misses,
  shoves: [...fire.shoves],
});

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

// One shove of every press that threw one, by the shove's own place in its press.
const shoveAt = (
  fires: readonly BelchFire[],
  at: number,
): readonly PressShove[] => {
  return fires
    .map((fire) => fire.shoves[at])
    .filter((shove) => shove !== undefined);
};

// What each shove of a press threw, summed over the run, the first shove first.
const movedPerShoveOf = (fires: readonly BelchFire[]): number[] => {
  return Array.from({ length: BELCH_SHOVES }, (_of, at) =>
    shoveAt(fires, at).reduce((total, shove) => total + shove.moved, 0),
  );
};

/**
 * The share of its own frame each shove had caught, meaned over the presses
 * that gave that shove a frame. A shove with nothing in its frame contributes
 * nothing rather than a zero, on the interval list's own terms.
 */
const caughtSharePerShoveOf = (fires: readonly BelchFire[]): number[] => {
  return Array.from({ length: BELCH_SHOVES }, (_of, at) => {
    const shares = shoveAt(fires, at)
      .filter((shove) => shove.inFrame > 0)
      .map((shove) => (shove.moved + shove.carried) / shove.inFrame);
    if (shares.length === 0) return 0;
    return shares.reduce((total, share) => total + share, 0) / shares.length;
  });
};

const belchCadenceOf = (acc: BelchCadenceAcc): BelchCadence => {
  const fires = acc.fires.map(fireOf);
  return {
    fires,
    intervals: intervalsOf(fires),
    ticksAtFull: acc.ticksAtFull,
    wasted: acc.wasted,
    frameShares: frameSharesOf(fires),
    misses: missesOverRun(fires),
    movedPerShove: movedPerShoveOf(fires),
    caughtSharePerShove: caughtSharePerShoveOf(fires),
  };
};

export { createBelchCadence, observeBelchCadence, belchCadenceOf };
export type {
  BelchCadence,
  BelchFire,
  BelchCadenceAcc,
  BelchFireAcc,
  PressMisses,
  PressShove,
};
