/**
 * The director's own run, read back off a tape (#85's acceptance line). The
 * reading is fed nothing but the events a tape carries, which is the property
 * spec test 54 exists for.
 */

import { describe, expect, it } from 'vitest';

import {
  SIGNAL_LOW_THRESHOLD,
  SIGNAL_HOLD_TICKS,
} from '../../../game/director';
import type { SimEvent } from '../../../game/events';
import { SIGNAL_RAN_LIVE } from '../../../game/signalLock';
import {
  addsBySection,
  createPressure,
  observePressure,
  pressureOf,
} from '../pressure';

const GRAVE_HIT: SimEvent = {
  type: 'graveHit',
  source: 'shambler',
  size: 24,
  invulnerable: 0,
};

const directedAdd = (signal: number, purseLeft: number): SimEvent => ({
  type: 'directedAdd',
  card: { formation: 'drip', type: 'revenant', count: 2 },
  x: 120,
  section: 'procession',
  signal,
  purseLeft,
});

/**
 * The reading over a tape, given as the events each tick carried. The tick a
 * listener is handed is the count of ticks that have run, so the first tick's
 * events arrive as tick one.
 */
const readingOver = (
  lock: number,
  ticks: readonly (readonly SimEvent[])[],
): ReturnType<typeof pressureOf> => {
  const acc = createPressure(lock);
  ticks.forEach((events, index) => observePressure(acc, index + 1, events));
  return pressureOf(acc);
};

describe("the director's run, off its tape (#85)", () => {
  it("a run's signal can be read back off its tape and drawn against every add and its tick", () => {
    // Spec test 53. The series and the adds are one reading because the
    // question is the two together: what was the signal doing when the director
    // spent, and what did it spend.
    const ticks: SimEvent[][] = [];
    for (let tick = 0; tick < 12; tick++) ticks.push([]);
    ticks[2] = [GRAVE_HIT];
    ticks[6] = [directedAdd(0, 110)];
    ticks[9] = [directedAdd(0, 104)];

    const reading = readingOver(SIGNAL_RAN_LIVE, ticks);

    // Index N is the signal after N ticks, so index 0 is before any tick ran
    // and the series is one longer than the run.
    expect(reading.signalPerTick).toHaveLength(13);
    expect(reading.signalPerTick[0]).toBe(0);
    expect(reading.signalPerTick[3]).toBeGreaterThan(0);

    expect(reading.adds.map((add) => add.tick)).toEqual([7, 10]);
    expect(reading.adds[0]?.formation).toBe('drip');
    expect(reading.adds[0]?.count).toBe(2);
    expect(reading.purseLeftBySection).toEqual({ procession: 104 });
    expect(addsBySection(reading)).toEqual({ run: 2, procession: 2 });
  });

  it('is computed from events and never from the director own state', () => {
    // Spec test 54. The observer takes no RunState at all, so there is nothing
    // for it to read the director off: the same events produce the same reading
    // whatever the sim's director happens to hold, which is what stops an
    // instrument agreeing with the thing it measures by construction.
    //
    // The recomputation is checked against the sim rather than trusted:
    // disagreements counts the adds whose recorded signal is not what this
    // series stood at, and an honest tape reads zero.
    const ticks: SimEvent[][] = [[GRAVE_HIT], [], [], []];
    const agreed = readingOver(SIGNAL_RAN_LIVE, ticks);
    const stood = agreed.signalPerTick[2] ?? 0;

    expect(
      readingOver(SIGNAL_RAN_LIVE, [[GRAVE_HIT], [], [directedAdd(stood, 90)]])
        .disagreements,
    ).toBe(0);

    // And the guard has teeth: an add carrying a signal the events cannot
    // produce is named rather than passed over.
    expect(
      readingOver(SIGNAL_RAN_LIVE, [
        [GRAVE_HIT],
        [],
        [directedAdd(stood + 0.5, 90)],
      ]).disagreements,
    ).toBe(1);
  });

  it('reads a held run at the figure its header resolved, all the way through', () => {
    // The lock reaches the reading from the tape header, the way the starting
    // size does, so a held run's instrument shows the held figure rather than a
    // live signal the events would have produced.
    const ticks: SimEvent[][] = [];
    for (let tick = 0; tick < SIGNAL_HOLD_TICKS + 20; tick++) {
      ticks.push(tick % 7 === 0 ? [GRAVE_HIT] : []);
    }

    const reading = readingOver(0.25, ticks);

    expect(new Set(reading.signalPerTick)).toEqual(new Set([0.25]));
    expect(reading.ticksSignalLow).toBe(ticks.length);
  });

  it('reads a tape with no adds as a run the director never spent in', () => {
    // Module test: the pressure reading over a tape with no adds. Nothing is
    // invented for the absence, and the signal series is still the whole run's.
    const reading = readingOver(SIGNAL_RAN_LIVE, [[], [], []]);

    expect(reading.adds).toEqual([]);
    expect(reading.purseLeftBySection).toEqual({});
    expect(reading.disagreements).toBe(0);
    expect(reading.signalPerTick).toEqual([0, 0, 0, 0]);
    expect(addsBySection(reading)).toEqual({ run: 0 });
  });

  it('counts the ticks the gate own threshold was open, and stops counting when it is not', () => {
    // The opportunity the director had, against the adds it took of it. A
    // run under sustained harm reads none of it, which is the reading that says
    // the gate is doing its job rather than the purse.
    // Ticks and never samples: the series carries one more than the run has
    // ticks, and the last of them is a state no gate ever read.
    const quiet = readingOver(SIGNAL_RAN_LIVE, [[], [], []]);
    expect(quiet.signalPerTick).toHaveLength(4);
    expect(quiet.ticksSignalLow).toBe(3);

    const hurt = readingOver(SIGNAL_RAN_LIVE, [[GRAVE_HIT, GRAVE_HIT], [], []]);
    expect(hurt.signalPerTick[1]).toBeGreaterThanOrEqual(SIGNAL_LOW_THRESHOLD);
    // Only the first tick opened low; the hit raised the signal past the gate's
    // threshold and the hold kept it there for the two after.
    expect(hurt.ticksSignalLow).toBe(1);
  });
});
