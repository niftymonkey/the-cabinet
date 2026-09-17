// What a score reads as, wherever a player is shown one.

/**
 * The score's digits, and the ladder row has no slack for a seventh.
 *
 * Trash pays `TRASH_KILL_SCORE` 100 and an elite eight times it, so at the
 * storm's measured 2.47 kills a second a run passes five digits in about forty
 * seconds and a long one reaches six; a million points is about an hour of
 * play, which is longer than a run. The digits are never cut to their budget,
 * because a cut number is a wrong number.
 */
const SCORE_DIGITS = 6;

/**
 * The score's reading: whole points, zero-padded so the number never changes
 * width as it grows and the ladder row never shifts under it.
 *
 * Whole points because an overflow converts growth past the size ceiling at the
 * grave's own scale (ADR 0002), so the run's score carries a fraction the
 * player has no reading for.
 *
 * One reading for both places a score is shown, the ladder row while the run
 * plays and the end screen at the seal, so the number a player watched is the
 * number they are handed.
 */
const scoreReading = (score: number): string =>
  `${Math.floor(score)}`.padStart(SCORE_DIGITS, '0');

export { scoreReading, SCORE_DIGITS };
