// The signal lock: the figure a run holds its pressure signal at for a tuning
// experiment, and the resolved value that means it held none.

/**
 * The resolved value that means no experiment held the signal (CONTEXT.md
 * Signal lock).
 *
 * It is a number and not a `unique symbol`, because the header is bytes: the
 * lock travels in the tape header as one f64 beside the starting size, and a
 * symbol survives no encoding at all. The figure is minus one, which the
 * signal's own scale cannot produce: advancePressure clamps every value it
 * writes between zero and SIGNAL_FULL, so nothing below zero is ever a signal
 * and nothing below zero can collide with one. signalLock.test.ts pins that
 * impossibility against the director's own scale rather than leaving it as a
 * reading of director.ts somebody has to repeat.
 *
 * ABSENT_CODE 0 in wireCodes.ts is not borrowed for it: that reservation is for
 * the code maps, this is not one of them, and zero is a signal the scale
 * produces on almost every tick of every run.
 */
const SIGNAL_RAN_LIVE = -1;

/**
 * The figure a run resolved its pressure signal to before its first tick, or
 * SIGNAL_RAN_LIVE.
 *
 * It is a resolved value and never an absence, because the header records what
 * the run started from, and a later change of the default must not silently
 * change what an old tape replays as (ADR 0027). It is a bare number rather
 * than a union of one, because the sentinel is itself a number and `number |
 * -1` is `number`: what makes the two readable apart is isLocked below, which
 * is the one question anything asks of a lock.
 *
 * This module imports nothing, which is what lets the sim, the header and
 * playback all own the same type without any of them importing a consumer.
 */
type SignalLock = number;

/**
 * Whether the signal is held this run, which is the one question
 * advancePressure asks of it.
 *
 * Nothing here answers "the figure or null", because a lock is always a
 * resolved value: a reader that wants the figure reads the lock itself.
 */
const isLocked = (lock: SignalLock): boolean => lock !== SIGNAL_RAN_LIVE;

export { SIGNAL_RAN_LIVE, isLocked };
export type { SignalLock };
