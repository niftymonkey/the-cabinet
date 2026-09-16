// The loss being watched: what the row draws while the floor ladder's bleed and
// strip are still leaving, born of the events and not of a diff (record R5, R7).

import type { SimEvent } from '../../../game/events';
import type { WeaponLine } from '../../../game/lines/roster';
import type { RunReadout } from './runSession';

/**
 * How long the score's readout takes to fall, in ticks.
 *
 * The sim sets the score to zero in one tick and that does not move (grave.ts,
 * bleedScore); this is the renderer's own held transient, born of a past tick,
 * and it is declared here so the registry in transients.ts can hold it under
 * REPLAY_LEAD_IN_TICKS. A declared starting figure on the same terms as the
 * registry's other lifetimes: two thirds of a second is long enough to be
 * watched and sits well inside the lead-in, and a bleed longer than the lead-in
 * would move that constant and the whole fast-forward with it (record R5).
 */
const SCORE_BLEED_TICKS = 40;

/**
 * How long a stripped line's top filled mark takes to empty, in ticks.
 *
 * The bleed's own lifetime, because a mark that snapped beside a readout that
 * counts would be two vocabularies rather than one (record R5). INVULNERABLE_TICKS
 * is 24, under this, so a second hit can strip while the cushion's own mark is
 * still emptying and both states are live at once.
 */
const RUNG_STRIP_TICKS = SCORE_BLEED_TICKS;

/**
 * Every lifetime this view holds across frames, for the registry in
 * transients.ts to aggregate beside the renderers' own declarations.
 */
const WATCHED_LOSS_TRANSIENT_TICKS = {
  scoreBleed: SCORE_BLEED_TICKS,
  rungStrip: RUNG_STRIP_TICKS,
} as const;

/** The score that left, and the tick it left on. */
interface Bleed {
  readonly born: number;
  readonly amount: number;
}

/** The lines that each paid a rung, and the tick they paid on. */
interface Strip {
  readonly born: number;
  readonly lines: readonly WeaponLine[];
}

/**
 * A loss still being watched. It is the driver's per-run memory: a pooled screen
 * left holding a previous run's born tick opens the next run mid-countdown.
 */
interface WatchedLoss {
  readonly bleed: Bleed | null;
  readonly strip: Strip | null;
}

/** Nothing being watched, which is what a run opens on. */
const NO_LOSS_WATCHED: WatchedLoss = { bleed: null, strip: null };

/** How full a mark draws, as a share of its own square: all of it, or none. */
const MARK_FULL = 1;
const MARK_EMPTY = 0;

/** No line emptying a mark, shared rather than allocated on every quiet frame. */
const NOTHING_EMPTYING: Readonly<Partial<Record<WeaponLine, number>>> = {};

/** What the row draws this frame, given the loss it is watching. */
interface LossReading {
  // The number the digits read, which is the live score once nothing is falling.
  readonly score: number;
  // How full the cushion's mark beside the digits draws.
  readonly cushion: number;
  // How full the emptying mark draws, for each line that paid a rung.
  readonly emptying: Readonly<Partial<Record<WeaponLine, number>>>;
}

/**
 * How much of a transient's life has been spent, from 0 on the tick it was born
 * to 1 at its end, or null when it is not live at this tick.
 *
 * A negative age is a born tick from a run that is over, which a pooled screen
 * can hold; it reads as not live rather than as a transient about to start.
 */
const spentOf = (born: number, tick: number, life: number): number | null => {
  const age = tick - born;
  if (age < 0 || age >= life) return null;
  return age / life;
};

/**
 * The number the digits read: linear from the bled amount toward whatever the
 * run's score currently reads, over the whole lifetime.
 *
 * Linear and never eased: ease-out spends most of the value in the first few
 * frames and leaves a tail, which is the snap record R5 rejected, stretched. It
 * targets the live score rather than a remembered zero, because kills keep
 * paying score while the grave is at the floor (record R4), so a countdown
 * driving toward zero would land on a number the sim had already left behind.
 */
const scoreCountingDown = (
  bleed: Bleed | null,
  tick: number,
  liveScore: number,
): number => {
  if (bleed === null) return liveScore;
  const spent = spentOf(bleed.born, tick, SCORE_BLEED_TICKS);
  if (spent === null) return liveScore;
  return bleed.amount + (liveScore - bleed.amount) * spent;
};

/**
 * How full the cushion's mark draws: emptying over the bleed's own lifetime, so
 * the mark and the digits are one vocabulary, and the ladder's own state once
 * nothing is falling (record R2, R5).
 */
const cushionEmptying = (
  bleed: Bleed | null,
  tick: number,
  scoreRungBled: boolean,
): number => {
  const spent =
    bleed === null ? null : spentOf(bleed.born, tick, SCORE_BLEED_TICKS);
  if (spent === null) return scoreRungBled ? MARK_EMPTY : MARK_FULL;
  return MARK_FULL - spent;
};

/**
 * How full each stripped line's own emptying mark draws. Every line that paid is
 * in it, because stripLevels takes one off every line that has one to give and
 * four marks emptying at once reads as the bigger event it is (record R7).
 */
const marksEmptying = (
  strip: Strip | null,
  tick: number,
): Readonly<Partial<Record<WeaponLine, number>>> => {
  if (strip === null) return NOTHING_EMPTYING;
  const spent = spentOf(strip.born, tick, RUNG_STRIP_TICKS);
  if (spent === null) return NOTHING_EMPTYING;
  const emptying: Partial<Record<WeaponLine, number>> = {};
  for (const line of strip.lines) emptying[line] = MARK_FULL - spent;
  return emptying;
};

/**
 * This frame's events folded into what is being watched. The view is told a
 * bleed happened and never infers one: a diff of the score cannot tell a bleed
 * from an overflow that happened to be negative (record R5).
 */
const watchLoss = (
  loss: WatchedLoss,
  event: SimEvent,
  tick: number,
): WatchedLoss => {
  if (event.type === 'scoreBled') {
    return { ...loss, bleed: { born: tick, amount: event.amount } };
  }
  if (event.type === 'weaponStripped') {
    return { ...loss, strip: { born: tick, lines: event.lines } };
  }
  return loss;
};

/** Everything the row draws of a loss, from the loss and the frame's own reading. */
const lossReading = (loss: WatchedLoss, readout: RunReadout): LossReading => ({
  score: scoreCountingDown(loss.bleed, readout.tick, readout.score),
  cushion: cushionEmptying(loss.bleed, readout.tick, readout.scoreRungBled),
  emptying: marksEmptying(loss.strip, readout.tick),
});

export {
  lossReading,
  NO_LOSS_WATCHED,
  RUNG_STRIP_TICKS,
  SCORE_BLEED_TICKS,
  watchLoss,
  WATCHED_LOSS_TRANSIENT_TICKS,
};
export type { LossReading, WatchedLoss };
