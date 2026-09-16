/**
 * The loss being watched: events and a tick in, what the row draws out, and
 * nothing read off a diff (design record R5, R7).
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../../../game/events';
import type { WeaponLine } from '../../../../game/lines/roster';
import { INVULNERABLE_TICKS } from '../../../../game/tuning';
import type { RunReadout } from '../runSession';
import type { WatchedLoss } from '../watchedLoss';
import {
  lossReading,
  NO_LOSS_WATCHED,
  RUNG_STRIP_TICKS,
  SCORE_BLEED_TICKS,
  watchLoss,
} from '../watchedLoss';

/** A readout as the session writes one, with everything not under test at rest. */
const readoutWith = (over: Partial<RunReadout> = {}): RunReadout => ({
  debtTicks: 0,
  tick: 0,
  score: 0,
  levels: { skullStream: 0, territory: 0, wisps: 0, bell: 0 },
  scoreRungBled: false,
  bankedOffers: 0,
  faults: [],
  ...over,
});

const bled = (amount: number): SimEvent => ({ type: 'scoreBled', amount });

const stripped = (lines: readonly WeaponLine[]): SimEvent => ({
  type: 'weaponStripped',
  lines,
});

/** The number the digits read, at a tick, for a loss watched from tick zero. */
const scoreAt = (loss: WatchedLoss, tick: number, liveScore = 0): number =>
  lossReading(loss, readoutWith({ tick, score: liveScore })).score;

describe('the score watched leaving', () => {
  it("falls linearly, reading about half the bled amount at the countdown's midpoint tick", () => {
    // Record R5: counter guidance defaults to ease-out, which spends most of
    // the value in the first few frames and leaves a tail, and that is the snap
    // the ruling rejected, stretched. The midpoint is the assertion ease-out
    // fails, and every gauge the cited games drain, drains linearly.
    const loss = watchLoss(NO_LOSS_WATCHED, bled(41300), 0);

    expect(scoreAt(loss, 0)).toBeCloseTo(41300, 6);
    expect(scoreAt(loss, SCORE_BLEED_TICKS / 4)).toBeCloseTo(41300 * 0.75, 6);
    expect(scoreAt(loss, SCORE_BLEED_TICKS / 2)).toBeCloseTo(41300 * 0.5, 6);
    expect(scoreAt(loss, (SCORE_BLEED_TICKS * 3) / 4)).toBeCloseTo(
      41300 * 0.25,
      6,
    );
  });

  it('lands on the live score rather than on zero, so a score climbing from kills is landed on and never jumped to', () => {
    // Record R4 keeps kills paying score while the grave is at the floor, so
    // the sim's score is climbing again before the animation finishes; a
    // countdown driving toward zero would land on a number the sim had left.
    const loss = watchLoss(NO_LOSS_WATCHED, bled(41300), 0);

    expect(scoreAt(loss, SCORE_BLEED_TICKS / 2, 900)).toBeCloseTo(
      (41300 + 900) / 2,
      6,
    );
    expect(scoreAt(loss, SCORE_BLEED_TICKS, 900)).toBe(900);
    expect(scoreAt(loss, SCORE_BLEED_TICKS * 4, 900)).toBe(900);
  });

  it('is told a bleed happened and never infers one from a score that fell', () => {
    // A diff cannot tell a bleed from an overflow that happened to be negative,
    // so the driver hands the event over and the view reads no history at all.
    expect(scoreAt(NO_LOSS_WATCHED, 0, 41300)).toBe(41300);
    expect(scoreAt(NO_LOSS_WATCHED, 1, 0)).toBe(0);
  });

  it('reads a born tick from a run that is over as nothing being watched', () => {
    // A pooled screen can hold a previous run's loss, whose born tick is larger
    // than anything the fresh run has reached; that is not a countdown about to
    // start.
    const stale = watchLoss(NO_LOSS_WATCHED, bled(41300), 5000);

    expect(scoreAt(stale, 3, 120)).toBe(120);
  });

  it("empties the cushion beside the digits over the bleed's own lifetime", () => {
    // Record R5: a mark that snapped beside a readout that counts would be two
    // vocabularies rather than one.
    const loss = watchLoss(NO_LOSS_WATCHED, bled(41300), 0);
    const cushionAt = (tick: number): number =>
      lossReading(loss, readoutWith({ tick, scoreRungBled: true })).cushion;

    expect(cushionAt(0)).toBeCloseTo(1, 6);
    expect(cushionAt(SCORE_BLEED_TICKS / 2)).toBeCloseTo(0.5, 6);
    expect(cushionAt(SCORE_BLEED_TICKS)).toBe(0);
  });
});

describe('the rungs watched leaving', () => {
  it('empties a mark on every line that paid and on no line that did not', () => {
    // Record R7: stripLevels takes one off every line that has one to give, so
    // "the player sees which line paid" resolves to "all of them", and four
    // marks emptying at once reads as the bigger event it is.
    const loss = watchLoss(
      NO_LOSS_WATCHED,
      stripped(['skullStream', 'wisps', 'bell']),
      0,
    );

    const emptying = lossReading(loss, readoutWith({ tick: 0 })).emptying;
    expect(Object.keys(emptying).sort()).toEqual([
      'bell',
      'skullStream',
      'wisps',
    ]);
    expect(emptying.territory).toBeUndefined();
  });

  it("empties that mark over the bleed's own lifetime, so the row speaks one vocabulary", () => {
    const loss = watchLoss(NO_LOSS_WATCHED, stripped(['wisps']), 0);
    const wispsAt = (tick: number): number | undefined =>
      lossReading(loss, readoutWith({ tick })).emptying.wisps;

    expect(RUNG_STRIP_TICKS).toBe(SCORE_BLEED_TICKS);
    expect(wispsAt(0)).toBeCloseTo(1, 6);
    expect(wispsAt(RUNG_STRIP_TICKS / 2)).toBeCloseTo(0.5, 6);
    expect(wispsAt(RUNG_STRIP_TICKS)).toBeUndefined();
  });

  it('is drawn beside a cushion still emptying, because a second hit is legal before the first has finished being watched', () => {
    // INVULNERABLE_TICKS is under the countdown's own lifetime, so both states
    // are live at once and the reading takes them together (record R5).
    expect(INVULNERABLE_TICKS).toBeLessThan(SCORE_BLEED_TICKS);
    const bleedFirst = watchLoss(NO_LOSS_WATCHED, bled(41300), 0);
    const andStrip = watchLoss(
      bleedFirst,
      stripped(['bell']),
      INVULNERABLE_TICKS,
    );

    const watching = lossReading(
      andStrip,
      readoutWith({ tick: INVULNERABLE_TICKS + 4, scoreRungBled: true }),
    );

    expect(watching.cushion).toBeGreaterThan(0);
    expect(watching.cushion).toBeLessThan(1);
    expect(watching.emptying.bell).toBeGreaterThan(0);
    expect(watching.emptying.bell).toBeLessThan(1);
  });
});
