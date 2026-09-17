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

/** A bleed of `amount` that left `score` standing, as the ladder reports one. */
const bled = (amount: number, score = 0): SimEvent => ({
  type: 'scoreBled',
  amount,
  score,
});

const stripped = (lines: readonly WeaponLine[]): SimEvent => ({
  type: 'weaponStripped',
  lines,
});

/** The number the digits read, at a tick, for a loss watched from tick zero. */
const scoreAt = (loss: WatchedLoss, tick: number, liveScore = 0): number =>
  lossReading(loss, readoutWith({ tick, score: liveScore })).score;

describe('the score watched leaving', () => {
  it('falls linearly from the score as it stood before the hit to what the bleed left, and never climbs', () => {
    // Record R5: counter guidance defaults to ease-out, which spends most of
    // the value in the first few frames and leaves a tail, and that is the snap
    // the ruling rejected, stretched. The midpoint is the assertion ease-out
    // fails, and every gauge the cited games drain, drains linearly.
    //
    // Under a capped bleed the start is the pre-hit score and not the amount
    // taken (ADR 0003 as amended 2026-09-16): a countdown that began at the
    // slice would jump down to it and then climb back to the remainder, which
    // is the opposite of R5's promise that the score is seen to leave. The
    // never-climbs assertion is the point, because the old expression passes a
    // midpoint test while running the wrong way. It is a claim about this
    // fixture and not about play: in play the countdown eases toward a live
    // score, and one that gains more than the cap inside the lifetime climbs by
    // design.
    const loss = watchLoss(NO_LOSS_WATCHED, bled(2000, 20000), 0);
    const held = 20000;

    expect(scoreAt(loss, 0, held)).toBeCloseTo(22000, 6);
    expect(scoreAt(loss, SCORE_BLEED_TICKS / 4, held)).toBeCloseTo(21500, 6);
    expect(scoreAt(loss, SCORE_BLEED_TICKS / 2, held)).toBeCloseTo(21000, 6);
    expect(scoreAt(loss, (SCORE_BLEED_TICKS * 3) / 4, held)).toBeCloseTo(
      20500,
      6,
    );
    expect(scoreAt(loss, SCORE_BLEED_TICKS, held)).toBe(held);

    const readings = Array.from({ length: SCORE_BLEED_TICKS + 1 }, (_, tick) =>
      scoreAt(loss, tick, held),
    );
    for (const [tick, reading] of readings.entries()) {
      if (tick === 0) continue;
      expect(`${tick} ${reading <= readings[tick - 1]!}`).toBe(`${tick} true`);
    }
  });

  it('lands on the live score rather than on what the bleed left, so a score climbing from kills is landed on and never jumped to', () => {
    // Record R4 keeps kills paying score while the grave is at the floor, so
    // the sim's score is climbing again before the animation finishes; a
    // countdown driving toward the remainder would land on a number the sim had
    // left.
    const loss = watchLoss(NO_LOSS_WATCHED, bled(2000, 20000), 0);

    expect(scoreAt(loss, SCORE_BLEED_TICKS / 2, 20900)).toBeCloseTo(
      (22000 + 20900) / 2,
      6,
    );
    expect(scoreAt(loss, SCORE_BLEED_TICKS, 20900)).toBe(20900);
    expect(scoreAt(loss, SCORE_BLEED_TICKS * 4, 20900)).toBe(20900);
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
