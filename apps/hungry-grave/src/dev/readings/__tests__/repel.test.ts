/**
 * The two pushes, read apart: the bell's repel per toll, and the belch's own
 * arm beside it. Expected values come from hand-built event sequences, because
 * the windowing is the behaviour under test and a hand-built sequence states it
 * exactly.
 */

import { describe, expect, it } from 'vitest';

import { createExecution, executeTick } from '../../../game/execution';
import type { SimEvent } from '../../../game/events';
import { createRun, uniformLevels } from '../../../game/run';
import { createRepel, observeRepel, repelOf } from '../repel';

function toll(level: number): SimEvent {
  return { type: 'tolled', level, radius: 207 };
}

function shove(id: number, displacement: number): SimEvent {
  return { type: 'mobShoved', id, displacement, source: 'bell' };
}

/**
 * A shove the belch threw. Nothing in this build emits one, which is the point:
 * slice J is the caller the channel is declared for, and until it lands the
 * only belch shove that exists is planted here.
 */
function belchShove(id: number, displacement: number): SimEvent {
  return { type: 'mobShoved', id, displacement, source: 'belch' };
}

/** The reading over one tick's events per observe call, the way the pipeline feeds it. */
function readingOf(ticks: readonly (readonly SimEvent[])[]) {
  const acc = createRepel();
  for (const events of ticks) observeRepel(acc, events);
  return repelOf(acc);
}

describe('repel', () => {
  it('attributes each shove to the toll window open when it landed', () => {
    // The first toll's ring shoves once, the second toll's ring twice, across
    // later ticks than the tolls themselves, which is the whole reason the
    // event is per-shove.
    const reading = readingOf([
      [toll(4)],
      [shove(7, 3)],
      [toll(4)],
      [shove(8, 4), shove(9, 5)],
    ]);
    expect(reading.tolls).toEqual([
      { shoves: 1, distance: 3 },
      { shoves: 2, distance: 9 },
    ]);
  });

  it('counts a toll that shoved nothing, because zero is a reading', () => {
    // Push only exists at bell levels 4 and 5, so an ordinary run's tolls all
    // look like this, and a reading that skipped them would hide the fact the
    // bell was tolling at all.
    const reading = readingOf([[toll(1)], [], [toll(2)], []]);
    expect(reading.tolls).toEqual([
      { shoves: 0, distance: 0 },
      { shoves: 0, distance: 0 },
    ]);
  });

  it('sums shove distances within a toll window', () => {
    // One ring shoving three mobs: 16 + 10 + 2.5 is 28.5, worked by hand.
    const reading = readingOf([
      [toll(5)],
      [shove(3, 16), shove(4, 10)],
      [shove(5, 2.5)],
    ]);
    expect(reading.tolls).toEqual([{ shoves: 3, distance: 28.5 }]);
  });

  it('totals shoves and distance across every window', () => {
    // Three shoves over two tolls: 3 + 4 + 5 is 12, worked by hand. The
    // totals sit beside the per-toll view so a run's whole repel is one look.
    const reading = readingOf([
      [toll(4)],
      [shove(7, 3)],
      [toll(4)],
      [shove(8, 4), shove(9, 5)],
    ]);
    expect(reading.totalShoves).toBe(3);
    expect(reading.totalDistance).toBe(12);
  });

  it('a run that never tolls reports no windows and zero totals', () => {
    // A level-0 bell tolls nothing at all, and the reading says so with
    // zeroes rather than absences: the events are the source of truth, and a
    // run that shoved nothing shoved nothing.
    const reading = readingOf([[], []]);
    expect(reading).toEqual({
      tolls: [],
      totalShoves: 0,
      totalDistance: 0,
      belchShoves: 0,
      belchDistance: 0,
    });
  });

  it('a bell shove arriving with no toll open is still a bug and still fails loudly', () => {
    // A ring cannot exist without a toll, so a bell shove with no window open
    // still means the sim's own event order broke. The belch's arm below is
    // what the version-5 split opened; this half is deliberately kept, because
    // the case it names is still impossible.
    const acc = createRepel();
    expect(() => observeRepel(acc, [shove(7, 3)])).toThrow(
      /mobShoved before any toll/,
    );
  });

  it("holds a belch's shoves without throwing", () => {
    // Ruling R9. observeRepel threw on any shove with no toll window open,
    // which is exactly what the belch's first shove produces, so the belch
    // emits its own source and the reading reads the two apart. No toll has
    // ever fired in this sequence and nothing throws.
    const reading = readingOf([[belchShove(7, 3)], [belchShove(8, 4)]]);

    expect(reading.belchShoves).toBe(2);
    expect(reading.belchDistance).toBe(7);
  });

  it('attributes a shove to the belch rather than to the toll a window is open for', () => {
    // The two pushes stay separable in every batch, which is the whole reason
    // the version moves: a belch landing inside a live toll's window is the
    // belch's and never that toll's.
    const reading = readingOf([
      [toll(5)],
      [shove(3, 16), belchShove(4, 10)],
      [belchShove(5, 2.5)],
    ]);

    expect(reading.tolls).toEqual([{ shoves: 1, distance: 16 }]);
    expect(reading.totalShoves).toBe(1);
    expect(reading.totalDistance).toBe(16);
    expect(reading.belchShoves).toBe(2);
    expect(reading.belchDistance).toBe(12.5);
  });

  it('reads the belch arm as empty on every tape this build can produce', () => {
    // The cited-future half. Slice J is the caller the arm is declared for
    // (design record section 4) and nothing in this build passes the belch to
    // shoveStormTarget, so a real run at the bell's top rung fills the toll arm
    // and leaves the belch arm at nothing. It is played rather than reasoned
    // about, and it is this test that slice J turns red.
    const run = createRun(20260915, undefined, uniformLevels(5));
    const execution = createExecution(run);
    const acc = createRepel();
    for (let tick = 0; tick < 2000; tick++) {
      const events = executeTick(execution, {
        move: { x: 0, y: -0.2 },
        belch: false,
      });
      observeRepel(acc, events);
    }
    const reading = repelOf(acc);

    expect(reading.totalShoves).toBeGreaterThan(0);
    expect(reading.belchShoves).toBe(0);
    expect(reading.belchDistance).toBe(0);
  });

  it('reads the toll arm exactly as it read before the split', () => {
    // The half the version-5 note has to be able to say: the toll arm keeps
    // its name, its shape and its reduction, and only the belch's arm is new
    // beside it. The figures are the ones this file's own windowing tests
    // asserted at slice H's tip, restated over one sequence.
    const reading = readingOf([
      [toll(4)],
      [shove(7, 3)],
      [toll(4)],
      [shove(8, 4), shove(9, 5)],
    ]);

    expect(reading.tolls).toEqual([
      { shoves: 1, distance: 3 },
      { shoves: 2, distance: 9 },
    ]);
    expect(reading.totalShoves).toBe(3);
    expect(reading.totalDistance).toBe(12);
  });
});
