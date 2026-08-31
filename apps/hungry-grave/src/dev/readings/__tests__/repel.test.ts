/**
 * The bell's repel, per toll: how many mobs the ring shoved and how far in
 * total. Expected values come from hand-built event sequences, because the
 * windowing is the behaviour under test and a hand-built sequence states it
 * exactly.
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../../game/events';
import { createRepel, observeRepel, repelOf } from '../repel';

function toll(level: number): SimEvent {
  return { type: 'tolled', level, radius: 207 };
}

function shove(id: number, displacement: number): SimEvent {
  return { type: 'mobShoved', id, displacement };
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
    expect(reading).toEqual({ tolls: [], totalShoves: 0, totalDistance: 0 });
  });

  it('a shove before any toll is a bug in the sim and fails loudly rather than being absorbed', () => {
    // A ring cannot exist without a toll, so a shove with no window open
    // means the sim's own event order broke. That is a bug, not an input to
    // repair: it fails loudly, with the shove named, and is never counted
    // into a window it did not land in.
    const acc = createRepel();
    expect(() => observeRepel(acc, [shove(7, 3)])).toThrow(
      /mobShoved before any toll/,
    );
  });
});
