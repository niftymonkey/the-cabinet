// Which frames the sim spends, and how much of a frame's elapsed time it spends (ADR 0032).

import type { FrameReason } from '../../../tape/tape';

/** The hold conditions this policy does not own, read fresh on the frame that asks. */
interface FrameHolds {
  // Whether the run is over: its record is sealed and every later frame is held still.
  readonly ending: boolean;
  readonly countingDown: boolean;
}

interface FramePolicy {
  // Whether the pause menu holds the sim still, which the resume guard also reads.
  readonly menuPaused: boolean;
  reason(holds: FrameHolds): FrameReason;
  takeElapsed(elapsedMs: number): number;
  setMenuPaused(paused: boolean): void;
  setBackgrounded(backgrounded: boolean): void;
  skipNextFrame(): void;
  reset(): void;
}

/**
 * One policy's own state. It is the module's private machine and never leaves
 * it; a caller only ever sees the FramePolicy above.
 */
interface Policy {
  /**
   * The two reasons the sim holds still, kept apart rather than as one flag.
   * They are independent: a popup can open, the tab can then be switched away
   * from and back, and the popup is still up. With one flag the focus hook
   * cleared it and the sim ran on under the blurred menu with the keyboard
   * still steering, which is section 4.8's invariant broken and the tick-debt
   * lie takeElapsed exists to prevent.
   */
  menuPaused: boolean;
  backgrounded: boolean;
  skipElapsed: boolean;
}

/**
 * Why this frame is what it is, in the guard's own order (ADR 0032).
 *
 * This is the one enumeration of the hold conditions: the screen gates on the
 * reason this returns rather than re-reading the conditions, so a hold
 * condition added here holds the frame and records it in the same breath. The
 * short-circuit order lives here alone, so when two conditions are true at once
 * the recorded reason is the one that actually decided the frame. Live says
 * only that the frame reached the simulation; whether it bought a tick is the
 * tick index's fact, not this one's.
 */
const reason = (policy: Policy, holds: FrameHolds): FrameReason => {
  if (holds.ending) return 'ending';
  if (policy.menuPaused) return 'paused';
  if (policy.backgrounded) return 'backgrounded';
  if (holds.countingDown) return 'countdown';
  return 'live';
};

/**
 * This frame's elapsed time, or none at all on the first frame back from a
 * pause or a backgrounded tab.
 *
 * Skipping the frame is the fix and resetting the clock is not. The
 * backgrounded gap does not live in the accumulator's remainder: it lives in
 * Pixi's Ticker.lastTime, which no game-side call can reach and which does
 * not advance while rAF is paused, so the first frame back hands ticksFor the
 * whole gap. A 30-second tab switch would add 1785 to debtTicks and the
 * readout would then lie for the rest of the run.
 *
 * A held frame never asks, so the skip survives a pause taken while the tab is
 * away and is spent on the first frame that reaches the sim or the countdown.
 */
const takeElapsed = (policy: Policy, elapsedMs: number): number => {
  if (!policy.skipElapsed) return elapsedMs;
  policy.skipElapsed = false;
  return 0;
};

const createFramePolicy = (): FramePolicy => {
  const policy: Policy = {
    menuPaused: false,
    backgrounded: false,
    skipElapsed: false,
  };
  return {
    get menuPaused() {
      return policy.menuPaused;
    },
    reason: (holds) => reason(policy, holds),
    takeElapsed: (elapsedMs) => takeElapsed(policy, elapsedMs),
    setMenuPaused(paused) {
      policy.menuPaused = paused;
    },
    setBackgrounded(backgrounded) {
      policy.backgrounded = backgrounded;
    },
    skipNextFrame() {
      policy.skipElapsed = true;
    },
    reset() {
      policy.menuPaused = false;
      policy.backgrounded = false;
      policy.skipElapsed = false;
    },
  };
};

export { createFramePolicy };
export type { FrameHolds, FramePolicy };
