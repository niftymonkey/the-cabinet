// What the grave ate while the Waking's source poured.

import type { SimEvent } from '../../game/events';

/**
 * The Waking's own span and the swallows inside it.
 *
 * `to` is null while the source is still pouring at the tape's end, which is
 * every tape that stops inside the Waking (ADR 0026: a partial tape is a valid
 * tape).
 *
 * The bounds are the observer's own tick count rather than a tick the events
 * carry, because setPieceOpened and setPieceClosed carry none. That puts them
 * one tick ahead of the section timeline's phase bounds, which read the sim's
 * clock off phaseChanged, so the two are not subtracted from each other.
 */
interface WakingSpan {
  readonly from: number;
  readonly to: number | null;
  readonly swallows: number;
}

/**
 * The swallows inside the Waking's span, which is the one-hand form of the
 * Waking's property (ADR 0042). It says what committing up the trail paid this
 * build, and what a batch reads is the direction of that number across builds.
 *
 * The span is null on a tape that never opened the Waking, on the same terms
 * as every other reading whose absence means the recording cannot support it:
 * a count of zero would say the grave ate nothing there.
 */
interface WakingSwallows {
  readonly span: WakingSpan | null;
}

interface OpenSpan {
  readonly from: number;
  to: number | null;
  swallows: number;
}

interface WakingSwallowsAcc {
  span: OpenSpan | null;
}

const createWakingSwallows = (): WakingSwallowsAcc => ({ span: null });

/**
 * One tick of the pour. The source is placed once and closes once (`stage.ts`
 * places it only while none stands), so a second opening would be a second
 * Waking and this reading counts the first: the span it holds is the one the
 * phase table's own boundary events bound.
 */
const observeWakingSwallows = (
  acc: WakingSwallowsAcc,
  tick: number,
  events: readonly SimEvent[],
): void => {
  for (const event of events) {
    if (event.type === 'setPieceOpened' && acc.span === null) {
      acc.span = { from: tick, to: null, swallows: 0 };
      continue;
    }
    if (acc.span === null || acc.span.to !== null) continue;
    if (event.type === 'setPieceClosed') acc.span.to = tick;
    if (event.type === 'swallowed') acc.span.swallows += 1;
  }
};

const wakingSwallowsOf = (acc: WakingSwallowsAcc): WakingSwallows => ({
  span:
    acc.span === null
      ? null
      : { from: acc.span.from, to: acc.span.to, swallows: acc.span.swallows },
});

export { createWakingSwallows, observeWakingSwallows, wakingSwallowsOf };
export type { WakingSpan, WakingSwallows, WakingSwallowsAcc };
