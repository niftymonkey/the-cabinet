// The accumulator that turns real elapsed time into fixed ticks, and its
// catch-up clamp (ADR 0015).

const TICK_HZ = 60;
const TICK_MS = 1000 / TICK_HZ;

/**
 * The catch-up clamp, in ticks. A quarter second, which is the figure Gaffer on
 * Games' "Fix Your Timestep" uses as a safety valve. Treat it as a valve rather
 * than a derived truth: the source states no reason for the figure and peers
 * disagree freely (Unity 0.3333, Pixi 0.1, Godot caps steps instead).
 * Math.round, not Math.floor: 1000 / 60 rounds up in binary64, so 250 / TICK_MS
 * is 14.999999999999998 and floor would silently give 14.
 */
const MAX_CATCHUP_TICKS = Math.round(250 / TICK_MS);

/**
 * A whole number of ticks can land a few ulps short of its own boundary,
 * because 1000 / 60 is not exact in binary64: half a tick carried plus another
 * one and a half comes out just under two ticks rather than at two. The
 * tolerance is far below one tick and far above the accumulated rounding
 * error, so a boundary that was reached is never silently lost.
 */
const TICK_TOLERANCE = 1e-9;

/**
 * The accumulator carries wall-clock time, which differs on every device by
 * nature, so the accumulator itself is not deterministic and does not need to
 * be. What is deterministic is the sim, which only ever sees whole ticks.
 */
interface Clock {
  // Real time carried over that did not add up to a whole tick yet.
  remainderMs: number;
  // Ticks the clamp has discarded over this clock's life. The tick-debt readout in 3b shows this.
  debtTicks: number;
}

/**
 * A clock lives in src/game rather than in a screen so the autopilot and the
 * rendered game share one implementation; otherwise the bot's run is not the
 * player's run.
 */
const createClock = (): Clock => {
  return { remainderMs: 0, debtTicks: 0 };
};

// Whole ticks inside a span of real time.
const wholeTicksIn = (elapsedMs: number): number => {
  return Math.floor(elapsedMs / TICK_MS + TICK_TOLERANCE);
};

/**
 * Whole ticks to run for this frame's elapsed real time, clamped on the way in,
 * with the discarded ticks recorded as debt.
 *
 * elapsedMs is raw elapsed real time and never Pixi's deltaMS. Pixi assigns the
 * raw gap to elapsedMS, then clamps a local copy to _maxElapsedMS of 100 and
 * gives only deltaMS the clamped value. Feed deltaMS and the clamp below is
 * unreachable, debtTicks reads zero forever, and any change to the ticker's
 * speed silently rescales the sim.
 *
 * The clamp is on elapsedMs and never on the tick count on the way out. Gaffer
 * clamps the frame time before it enters the accumulator, so the dropped time
 * never accumulates. Clamping the returned count instead leaves the accumulator
 * holding time it refused to spend: a 5000 ms frame leaves about 4750 ms
 * behind, every later frame then clamps at the maximum forever, and that is the
 * spiral of death arrived at through the clamp.
 *
 * A negative, zero or non-finite elapsed time yields zero ticks and leaves the
 * remainder untouched. A browser reports all three across a tab switch.
 */
const ticksFor = (clock: Clock, elapsedMs: number): number => {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return 0;
  const spendable = Math.min(elapsedMs, MAX_CATCHUP_TICKS * TICK_MS);
  clock.debtTicks += wholeTicksIn(elapsedMs - spendable);
  clock.remainderMs += spendable;
  const ticks = wholeTicksIn(clock.remainderMs);
  clock.remainderMs = Math.max(0, clock.remainderMs - ticks * TICK_MS);
  return ticks;
};

/**
 * Drops the accumulated remainder, without touching debt.
 *
 * It has no caller. It was provided for a tab switch, and it does not do that
 * job: the backgrounded gap does not live in the remainder, it lives in Pixi's
 * Ticker.lastTime, which no game-side call can reach and which does not advance
 * while rAF is paused, so the first frame back still hands ticksFor the whole
 * gap. The rendered screen skips that one frame's elapsed time instead
 * (src/app/screens/game/GameScreen.ts). This stays because dropping a partial
 * tick is a real operation the autopilot may want, and it is named here as
 * unused rather than left claiming a caller it does not have.
 */
const resetClock = (clock: Clock): void => {
  clock.remainderMs = 0;
};

export {
  createClock,
  ticksFor,
  resetClock,
  TICK_HZ,
  TICK_MS,
  MAX_CATCHUP_TICKS,
};
export type { Clock };
