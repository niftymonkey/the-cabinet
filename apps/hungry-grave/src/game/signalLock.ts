// The signal lock: the scale a pressure signal stands on, the figure a run
// holds its signal at for a tuning experiment, and the resolved value that
// means it held none.

/**
 * The signal's own scale, and **no source states it**. The record's section 5
 * item 6 gives the hold and the decay, ADR 0056 gives the three inputs, and the
 * weight of each input and the figure that counts as low are a gap in the plan
 * rather than a licence: they are authored in director.ts, derived rather than
 * tuned, on the same terms as slice C's surge cap and slice D's card table.
 *
 * The scale is normalized. One means the run is under as much pressure as the
 * signal tracks, which is what makes the director's decay read as thirty
 * seconds from full to nothing rather than as a rate nobody can state.
 *
 * It sits beside the lock rather than beside the weights it scales because
 * holdableSignal below is the question every edge asks of a figure and the
 * scale is the whole answer, and this module imports nothing.
 */
const SIGNAL_FULL = 1;

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
 * impossibility against the director's own clamp rather than leaving it as a
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

/**
 * Whether a figure is one the signal's own scale could stand at, which is what
 * a lock has to be to hold the gate anywhere real.
 *
 * It lives beside the lock rather than beside the director's own rows because
 * the tape header asks it at the decode, and a codec that asks the director for
 * it pulls run.ts, the stage tables and tuning.ts behind src/tape's own edge.
 * The scale it reads is the one above, so the question stays answerable from a
 * module that imports nothing.
 */
const holdableSignal = (value: number): boolean =>
  Number.isFinite(value) && value >= 0 && value <= SIGNAL_FULL;

export { SIGNAL_FULL, SIGNAL_RAN_LIVE, isLocked, holdableSignal };
export type { SignalLock };
