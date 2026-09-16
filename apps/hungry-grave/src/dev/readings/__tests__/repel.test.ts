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
import { RESERVOIR_CAPACITY } from '../../../game/tuning';
import { createRepel, observeRepel, repelOf } from '../repel';

function toll(level: number): SimEvent {
  return { type: 'tolled', level, radius: 207 };
}

function shove(id: number, displacement: number): SimEvent {
  return { type: 'mobShoved', id, displacement, source: 'bell' };
}

/** A shove the belch threw, planted, for the windowing tests that state a sequence exactly. */
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
    // Every rung pushes now (design record R2 as superseded, slice H2), so a
    // toll like this is one that reached no body it could move rather than one
    // fired at a rung with no push. A reading that skipped it would hide the
    // fact the bell was tolling at all.
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

  it('fills both arms on a real run where a belch is spent beside the tolls', () => {
    // The arm was declared empty and waiting in slice I and this is the same
    // test with the caller arrived: a played run at the bell's top rung fills
    // the toll arm, and presses spread through it fill the belch's arm beside
    // it. It is played rather than reasoned about, which is what makes it say
    // that the sim really emits what the reading really counts.
    // The middle rung rather than the top, and it is measured rather than
    // guessed: at rungs four and five the storm kills a body standing inside
    // the belch's own reach before the press it just took can carry it
    // anywhere, so the belch's arm reads nothing on a run where the belch
    // really fired. That is a reading about the hand and not a defect, and it
    // is recorded in the round two progress note, section 11.
    const run = createRun(20260915, undefined, uniformLevels(3));
    const execution = createExecution(run);
    const acc = createRepel();
    for (let tick = 0; tick < 3000; tick++) {
      // The reservoir is filled by hand at each press, because what is under
      // test is the reading and not how long a run takes to earn a belch.
      const pressing = tick > 0 && tick % 200 === 0;
      if (pressing) run.reservoir = RESERVOIR_CAPACITY;
      const events = executeTick(execution, {
        move: { x: 0, y: -0.2 },
        belch: pressing,
      });
      observeRepel(acc, events);
    }
    const reading = repelOf(acc);

    expect(reading.totalShoves).toBeGreaterThan(0);
    expect(reading.belchShoves).toBeGreaterThan(0);
    expect(reading.belchDistance).toBeGreaterThan(0);
    // And the two stay apart: a belch shove never lands in a toll's window.
    expect(reading.totalShoves).toBe(
      reading.tolls.reduce((sum, window) => sum + window.shoves, 0),
    );
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
