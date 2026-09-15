// The shove: the force a toll sends out, carried by the body it landed on over
// several ticks rather than spent in one position write (design record R1).

/**
 * Which of the pool's two pushes threw a shove.
 *
 * It rides on the impulse because the one report a shove makes is taken when
 * the impulse is spent, ticks after the push that started it has finished, so
 * nothing at the report can name the pusher unless the body carried the name.
 *
 * It is spelled as the glossary's own two words, on DamageSource's terms
 * (mobs.ts), and narrower than that union because only these two push at all:
 * a weapon line that never shoves can never be a shove's source.
 */
type ShoveSource = 'bell' | 'belch';

/**
 * The impulse one body carries: the shove moving it right now, and the shoves
 * the same impulse still owes it.
 *
 * It lives on the body rather than on a clock somewhere because a shove is per
 * body from the moment it lands: two bodies reached by one toll are at
 * different distances, so they are shoved different amounts and finish at
 * different ticks. It is folded, because a replay that could not rebuild a body
 * in flight would be a replay of a different run (ADR 0019).
 *
 * `shovesLeft`, `nextIn` and `spacing` carry the wave structure. The bell
 * passes one shove and no spacing; slice J's belch passes three, spaced by its
 * own row so each reads on its own (design record R3 as superseded), which is
 * why they are declared here rather than the day that caller is written: a
 * field arriving later would change what every tape recorded in between folded.
 */
interface Impulse {
  /**
   * Which push threw this impulse, or null on a body carrying nothing.
   *
   * It is written once when the shove starts and never mutated, and no rule
   * reads it: the report the instrument reads is its one consumer, which is why
   * the witness excludes it rather than folding it (witness.test.ts's EXCLUDED).
   */
  source: ShoveSource | null;
  // The travel the first tick of the current shove owes, x and y in field units.
  stepX: number;
  stepY: number;
  // Ticks of the current shove left, this one included. Zero is a body walking.
  ticksLeft: number;
  // What the body has really been carried by this impulse, the bounds included.
  travelled: number;
  // Shoves this impulse still owes after the one in flight.
  shovesLeft: number;
  // Ticks until the next shove of this impulse begins. Zero once none is owed.
  nextIn: number;
  // Ticks from one shove of this impulse beginning to the next beginning.
  spacing: number;
}

// The travel one tick of an impulse owes, in field units.
interface ShoveStep {
  readonly x: number;
  readonly y: number;
}

/**
 * How long one shove travels, and the shape of the fall that spends it: thirty
 * ticks, the step falling linearly to nothing.
 *
 * Thirty ticks is half a second at this game's sixty ticks a second, and it is
 * option 2 of docs/research/watched-pushback-duration.md section 5. It sits
 * inside the usable band the perception work names rather than at its floor:
 * 100 milliseconds is where motion is only just perceivable, a substantial
 * change wants 200 to 300, duration grows with the distance travelled, and
 * Enter the Gungeon's Blank runs its own knockback at exactly 500 (research
 * section 4). The fall stays linear, which is the animation principles' slow
 * out and what Smash and Nuclear Throne both ship, and no source anywhere
 * describes knockback as a single-frame position set or documents a trail, a
 * squash, a flash or an afterimage during one, so the travel is the whole of
 * what a player sees.
 *
 * The readability criterion is arithmetic rather than taste: successive drawn
 * positions have to overlap, so a per-tick step stays under a body's own width,
 * 22 field units for a shambler. A linear fall from a first step to nothing
 * over thirty ticks covers 15.5 times that first step, so the bell's top rung
 * of 90 units arrives as a first step of 5.8 and every step after it is
 * smaller. That 5.8 is the top rung's own cone edge crossing 261 units in the
 * bell's 45 expansion ticks, which is what makes the body leave with the front
 * rather than being outrun by it (design record R2 as superseded 2026-09-15).
 *
 * It is data and the tuning step owns it, along with the wave figures each
 * caller passes (Mark's ruling 2 of 2026-09-15).
 */
const SHOVE_TICKS = 30;

/** A body carrying nothing: the resting value of every field above. */
const blankImpulse = (): Impulse => {
  return {
    source: null,
    stepX: 0,
    stepY: 0,
    ticksLeft: 0,
    travelled: 0,
    shovesLeft: 0,
    nextIn: 0,
    spacing: 0,
  };
};

/**
 * Puts an impulse back to carrying nothing, in place. A pooled body arrives in
 * a slot a shoved body may have died in, so the slot is cleared at the spawn
 * rather than trusted.
 */
const clearImpulse = (impulse: Impulse): void => {
  impulse.source = null;
  impulse.stepX = 0;
  impulse.stepY = 0;
  impulse.ticksLeft = 0;
  impulse.travelled = 0;
  impulse.shovesLeft = 0;
  impulse.nextIn = 0;
  impulse.spacing = 0;
};

/**
 * The travel the first tick of a shove owes, so that the whole of `distance`
 * is spent by the time the fall reaches nothing. A linear fall over
 * SHOVE_TICKS ticks covers (SHOVE_TICKS + 1) / 2 times its first step.
 */
const firstStepOf = (distance: number): number => {
  return (distance * 2) / (SHOVE_TICKS + 1);
};

/**
 * Starts a shove on a body, along a unit direction away from whatever pushed
 * it, covering `distance` field units per shove.
 *
 * What the body has already travelled is deliberately not cleared: a shove
 * landing on a body still flying replaces the shove and keeps the accounting,
 * so the one report at the end carries everything the body was shoved rather
 * than only the last of it.
 *
 * The source is replaced with it, so a body a belch catches mid-toll reports
 * its whole travel under the belch. That follows from there being one report
 * per impulse rather than one per push, and splitting the travel would mean
 * splitting the report, which is the shape slice H ruled against.
 */
const startShove = (
  impulse: Impulse,
  source: ShoveSource,
  awayX: number,
  awayY: number,
  distance: number,
  shoves: number,
  ticksBetween: number,
): void => {
  const first = firstStepOf(distance);
  impulse.source = source;
  impulse.stepX = awayX * first;
  impulse.stepY = awayY * first;
  impulse.ticksLeft = SHOVE_TICKS;
  impulse.shovesLeft = Math.max(shoves - 1, 0);
  impulse.spacing = ticksBetween;
  impulse.nextIn = impulse.shovesLeft > 0 ? ticksBetween : 0;
};

/**
 * Whether a shove is carrying this body this tick, which is what stands its own
 * walk down: every source that specifies a mechanism suspends the body's motion
 * rather than adding the shove on top, and adding on top has no source behind
 * it (design record R1).
 */
const shoveInFlight = (impulse: Impulse): boolean => {
  return impulse.ticksLeft > 0;
};

// Whether this impulse owes the body nothing more, now or later.
const impulseSpent = (impulse: Impulse): boolean => {
  return impulse.ticksLeft === 0 && impulse.nextIn === 0;
};

// The travel this tick of the current shove owes, or nothing on a tick between shoves.
const travelThisTick = (impulse: Impulse): ShoveStep | null => {
  if (impulse.ticksLeft <= 0) return null;
  const share = impulse.ticksLeft / SHOVE_TICKS;
  impulse.ticksLeft -= 1;
  return { x: impulse.stepX * share, y: impulse.stepY * share };
};

/**
 * The clock that brings the next shove of a multi-shove impulse in. It counts
 * down through the shove in flight as well as between shoves, so the spacing a
 * caller names is the gap between two shoves beginning and not the rest after
 * one ends.
 */
const countTowardTheNextShove = (impulse: Impulse): void => {
  if (impulse.nextIn <= 0) return;
  impulse.nextIn -= 1;
  if (impulse.nextIn > 0) return;
  impulse.shovesLeft -= 1;
  impulse.ticksLeft = SHOVE_TICKS;
  impulse.nextIn = impulse.shovesLeft > 0 ? impulse.spacing : 0;
};

/**
 * One tick of the impulse a body carries: the travel it owes now, or null on a
 * tick it stands still.
 *
 * The count toward the next shove runs after this tick's travel, so a shove
 * armed by it first moves the body on the tick after, which is what makes the
 * spacing read as the whole ticks a player can count.
 */
const advanceShove = (impulse: Impulse): ShoveStep | null => {
  const step = travelThisTick(impulse);
  countTowardTheNextShove(impulse);
  return step;
};

/**
 * The distance the impulse really carried the body, taken once the impulse is
 * spent. Taking it leaves the body carrying nothing.
 *
 * The caller records each tick's real travel as it applies it, because what the
 * bounds refused is exactly the part a repel reading must not count.
 */
const takeShoveTravel = (impulse: Impulse): number => {
  const travelled = impulse.travelled;
  clearImpulse(impulse);
  return travelled;
};

export {
  blankImpulse,
  clearImpulse,
  startShove,
  shoveInFlight,
  impulseSpent,
  advanceShove,
  takeShoveTravel,
  SHOVE_TICKS,
};
export type { Impulse, ShoveSource, ShoveStep };
