// The one button (ADR 0008): the full reservoir vomited in two scopes at once,
// the gas over the whole field and the shove around the grave.

import type { PressedBody, PressRefusal, SimEvent } from './events';
import { FIELD_WIDTH } from './field';
import { normalize } from './math';
import type { RunState } from './run';
import type { StormTarget } from './stormTargets';
import { shoveStormTarget, stormTargets } from './stormTargets';
import type { WaveClock } from './shove';
import { RESERVOIR_CAPACITY } from './tuning';

/**
 * How far the shove reaches from the grave, in field units: half the field's
 * width, derived from it rather than written down, so the reach follows the
 * field it is a share of.
 *
 * Design record ruling R11, Mark's option 1 of three, picked 2026-09-16 on his
 * read of the deployed build. The basis is the field's width and never its
 * height, its diagonal or its area: a reach off the height would cover about
 * three quarters of the field, which is the whole screen, and that is the
 * option he declined.
 *
 * What stood from the 160 this replaces is that the shove is local rather than
 * field-wide, which is ADR 0008's own "shove nearby": the gas takes every shot
 * on the field and the push takes the ground around the grave, and the two
 * scopes reading differently is the whole of the split.
 *
 * What did not stand is the 160 itself. It came over from the kill the reach
 * used to bound, where a narrow scope was the answer to a belch that took 35
 * and 46 percent of all kills on the 2026-08-31 tapes (ADR 0008). A press that
 * takes no health off anything cannot dominate a kill count, so that reason
 * retired with the kill; what the narrow scope cost instead was bodies, at 0 to
 * 21 of 30 to 93 live ones a press and nothing at all in reach on 58 percent of
 * a still grave's ticks.
 */
const BELCH_BURST_RADIUS = FIELD_WIDTH / 2;

/**
 * The shove one press throws: how many, how far each carries a body, and how
 * many ticks from one beginning to the next.
 *
 * Three discrete shoves rather than one long one, because Mark's words are "two
 * or three shoves" and a push the player can count makes that literal; the
 * Flower Wall's five is the shipped precedent for a set piece arriving in
 * countable pushes (docs/research/push-feel-precedent.md section 2). Each is a
 * full watched push of its own, which is what the spacing buys: at one shove's
 * own length the three run back to back and never overlap, so each reads on its
 * own rather than re-arming a shove still in flight.
 *
 * The 60 apiece is docs/research/watched-pushback-duration.md section 5, option
 * 2, which Mark picked on 2026-09-15: 180 in all is the Blank's own third of
 * its playfield transferred to this field's 540 width, 8.2 shambler widths and
 * 9.5 seconds of a shambler's advance bought back.
 *
 * It used to be said of these three that they carried a body clear of the reach
 * above, and ruling R11 withdrew that on 2026-09-16 rather than repairing it:
 * the reach moved and these three stayed where Mark set them, so what holds now
 * is that the reach is what a press catches and the throw is how far each
 * caught body travels. Growing the throw to clear the new reach would overrule
 * his own pick and is refused there.
 *
 * All three are data and the tuning step owns them (design record R3 as
 * superseded, Mark's ruling 2 of 2026-09-15). They are also ruling R4's own
 * lever: if the Wall's curtain takes a dent rather than a lane, the count and
 * the spacing are what moves, never a rule keyed on the set piece.
 */
const BELCH_SHOVES = 3;
const BELCH_SHOVE_THROW = 60;
const BELCH_SHOVE_SPACING = 30;

/**
 * The one press the run is carrying, or null between presses (ADR 0008).
 *
 * A press outlives the tick it landed on: its three shoves go out thirty ticks
 * apart and each one is a press of its own over whatever stands inside the
 * reach at its own tick, so what the first shove caught, how many shoves are
 * still owed and when the next one begins are all state the run holds between
 * ticks and a replay rebuilds (ADR 0019). It is a field and never a pool, on
 * the boss's, the offer's and the set piece's own terms: exactly one press is
 * live at a time, and the newer one replaces the live one whole.
 *
 * `caught` is what the skip reads: a body this press has already thrown keeps
 * the shoves it was given rather than being re-armed by the shoves behind it,
 * because a shove landing on a shove in flight replaces it rather than
 * following it. It is read by id and never by whether a body is carrying a
 * shove at all: a bell toll's cone is on the field for most of a press, and a
 * body a toll is carrying is thrown by a ring exactly as a walking one is.
 */
interface Press extends WaveClock {
  // The tick the press landed on, which is what joins its shoves to it.
  readonly beganAt: number;
  // Every body this press has already thrown, by id.
  readonly caught: Set<number>;
}

// Takes every live shot off the field, and reports how many went.
const cancelMobFire = (state: RunState): number => {
  let cancelled = 0;
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    shot.alive = false;
    cancelled += 1;
  }
  return cancelled;
};

// Whether a body stands inside the reach, measured centre to centre from the
// grave. Squared, so the reach needs no square root to order.
const insideBurst = (state: RunState, x: number, y: number): boolean => {
  const dx = x - state.grave.x;
  const dy = y - state.grave.y;
  return dx * dx + dy * dy <= BELCH_BURST_RADIUS * BELCH_BURST_RADIUS;
};

/**
 * How far a body stands from the grave, centre to centre, in field units. It is
 * the reading the press writes down beside each body and never the gate: the
 * gate orders squared and is left alone, so what a press catches does not
 * change by a rounding when the record was added.
 *
 * Math.sqrt and never Math.hypot: sqrt is exactly specified in the language and
 * hypot is implementation-approximated, and a determinism-critical core carries
 * no approximated operation (math.ts, ADR 0015).
 */
const distanceFromGrave = (state: RunState, x: number, y: number): number => {
  const dx = x - state.grave.x;
  const dy = y - state.grave.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// One body the press looked at and did not move, and which gate turned it away.
const refused = (
  target: StormTarget,
  distance: number,
  refusal: PressRefusal,
): PressedBody => {
  return { id: target.id, distance, moved: false, refusal };
};

/**
 * One body in the press's frame: thrown away from the grave, or written down
 * with the gate that refused it.
 *
 * The gates read in the order the press runs them, so the reason a body carries
 * is the first thing that was true of it. Two of them are the reach's own. A
 * body further out than the radius is the whole of the split: a press that
 * clears the air and leaves the crowd walking hands the wave back to the storm.
 * And a body still above the top edge is ADR 0008's older scope limit standing
 * through the split, because reaching past the edge would silently move
 * authored content a player never saw arrive.
 *
 * Nothing here branches on what it is hitting. The seam answers whether a body
 * may be pushed at all, so a boss's authored pattern and a set piece's source
 * are refused there and never by a branch here (ADR 0007), and the decay of
 * each shove is the shove module's. `pushable` is read here only to write the
 * reason down: the seam still refuses the move, and a target that reached the
 * call would be a no-op there either way.
 */
const pressOneBody = (state: RunState, target: StormTarget): PressedBody => {
  const distance = distanceFromGrave(state, target.x, target.y);
  if (!target.entered) return refused(target, distance, 'notEntered');
  if (!insideBurst(state, target.x, target.y)) {
    return refused(target, distance, 'outOfReach');
  }
  const away = normalize(target.x - state.grave.x, target.y - state.grave.y);
  // A body standing exactly on the grave has no direction to be thrown along,
  // which is the one refusal the bell already keeps (bell.ts, pushTarget).
  if (away.length === 0) return refused(target, distance, 'noDirection');
  if (!target.pushable) return refused(target, distance, 'notPushable');
  shoveStormTarget(
    state,
    target,
    'belch',
    away.x,
    away.y,
    BELCH_SHOVE_THROW,
    BELCH_SHOVES,
    BELCH_SHOVE_SPACING,
  );
  return { id: target.id, distance, moved: true, refusal: null };
};

/**
 * Throws what stands inside the reach away from the grave, and writes down
 * every body in the frame with what the press did about it.
 *
 * Each body is struck once and that one strike carries all three shoves: the
 * body set is captured the tick the belch fires and each body gets one impulse
 * whose own row brings the later shoves in, so a body already carried out of
 * reach still takes the shoves this press already owed it. That is the bell's
 * `toll.struck` shape (bell.ts) reached by construction rather than by a reach
 * test run three times.
 *
 * The record is built fresh per press rather than off a pooled buffer, because
 * a press is a rare event and the seam's own list may not be retained past this
 * pass: every entry here is a value copied out of it.
 */
const shoveNearbyTargets = (state: RunState): PressedBody[] => {
  const bodies: PressedBody[] = [];
  for (const target of stormTargets(state)) {
    bodies.push(pressOneBody(state, target));
  }
  return bodies;
};

/**
 * The two scopes at once: the gas takes every mob-fire shot on the whole field
 * and kills nothing, the shove throws what stands within a radius of the grave
 * away from it, and the reservoir empties.
 *
 * It takes health off nothing at all, boss included (Mark's ruling 3 of
 * 2026-09-15, ADR 0008 as amended), so no corpse of its own is left behind
 * because nothing died.
 *
 * It fires only at a full reservoir and does nothing otherwise, which is why
 * there is no partial bomb anywhere in the signature. That full-only rule is
 * also what holds the one-shot behaviour: the first call empties the reservoir,
 * so repeat calls inside one frame are no-ops by the resource rather than by a
 * flag somebody has to remember to clear.
 *
 * The shoves report themselves later and elsewhere, one event per body when its
 * impulse is spent (mobs.ts, reportShoveTravel), because a shove that takes
 * ticks has no realized displacement on the tick it lands.
 */
const fireBelch = (state: RunState): SimEvent[] => {
  if (state.reservoir < RESERVOIR_CAPACITY) return [];
  const cancelled = cancelMobFire(state);
  const bodies = shoveNearbyTargets(state);
  const shoved = bodies.filter((body) => body.moved).length;
  state.reservoir = 0;
  return [{ type: 'belched', cancelled, shoved, bodies }];
};

export {
  fireBelch,
  BELCH_BURST_RADIUS,
  BELCH_SHOVES,
  BELCH_SHOVE_THROW,
  BELCH_SHOVE_SPACING,
};
export type { Press };
