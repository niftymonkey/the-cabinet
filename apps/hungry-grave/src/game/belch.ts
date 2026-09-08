// The one button (ADR 0008): the full reservoir vomited in two scopes at once,
// the gas over the whole field and the burst around the grave.

import type { SimEvent } from './events';
import type { RunState } from './run';
import { damageStormTarget, stormTargets } from './stormTargets';
import { RESERVOIR_CAPACITY } from './tuning';

/**
 * How far the burst reaches from the grave, in field units. Initial, tuned by
 * the harness at step 4.
 *
 * Under a third of the field's 540 width, so the burst is legibly local against
 * a field-wide gas. What made the belch dominant was never its price but its
 * scope: the 2026-08-31 tapes read it at 35 and 46 percent of all kills with
 * the reservoir full 62 to 79 percent of the run (ADR 0008), and cutting the
 * scope is the answer to that rather than cutting the charge.
 */
const BELCH_BURST_RADIUS = 160;

/**
 * What the burst takes off a target one hit cannot take whole, which today is a
 * boss (ADR 0008: the burst "deals its big chunk of boss damage only when the
 * boss is inside that radius, and never pushes a boss").
 *
 * One row for every boss rather than a row each, because what it prices is the
 * press and not the fight. Initial, and first in line for the harness at step 4.
 * It is derived from the two figures the design record already carries: a full
 * build's storm lands about 50 points a second on a boss standing at the top of
 * the field, so this is about eight seconds of storm bought with one earned
 * press. It sits well under one chunk of the shortest boss's health, 1100, so a
 * single belch never breaks a fresh chunk and the property that every chunk
 * survives one full emit is not something a press can take away.
 */
const BELCH_CHUNK_DAMAGE = 400;

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

// Whether a body stands inside the burst, measured centre to centre from the
// grave. Squared, so the reach needs no square root to order.
const insideBurst = (state: RunState, x: number, y: number): boolean => {
  const dx = x - state.grave.x;
  const dy = y - state.grave.y;
  return dx * dx + dy * dy <= BELCH_BURST_RADIUS * BELCH_BURST_RADIUS;
};

/**
 * Kills what stands inside the burst, and reports how many went.
 *
 * The kills route through the seam's damage rather than clearing a pool, so a
 * belched body leaves a corpse exactly as any other kill does: the burst
 * restarts the swallow economy instead of emptying the field of it.
 *
 * Two things are outside its reach. A body further out than the radius, which
 * is the whole of the split: a press that clears the air and leaves the crowd
 * walking hands the wave back to the storm. And a body still above the top
 * edge, which is ADR 0008's older scope limit standing through the split,
 * because reaching past the edge would silently delete authored content a
 * player never saw arrive.
 *
 * A target one hit cannot take whole is inside the reach and is not killed: the
 * kill rule does not apply to chunked health, because a chunk broken by one
 * press is a skip rather than the breath the belch buys, so what lands on it is
 * the row instead. That is ADR 0008's own sentence, its big chunk of boss
 * damage only when the boss is inside the radius. Nothing here branches on what
 * it is hitting; the seam answers whether the kill rule may be applied and the
 * two amounts follow from that one answer.
 *
 * Nothing is pushed, ever, and the absence is the ADR's ("never pushes a
 * boss"): this module does not move a target at all, so a press cannot smear an
 * authored pattern.
 */
const burstNearbyTargets = (state: RunState, events: SimEvent[]): number => {
  let killed = 0;
  for (const target of stormTargets(state)) {
    if (!target.entered) continue;
    if (!insideBurst(state, target.x, target.y)) continue;
    const takes = target.killableOutright ? target.hp : BELCH_CHUNK_DAMAGE;
    events.push(...damageStormTarget(state, target, takes, 'belch'));
    if (target.killableOutright) killed += 1;
  }
  return killed;
};

/**
 * The two scopes at once: the gas takes every mob-fire shot on the whole field
 * and kills nothing, the burst kills what stands within a radius of the grave,
 * and the reservoir empties.
 *
 * It fires only at a full reservoir and does nothing otherwise, which is why
 * there is no partial bomb anywhere in the signature. That full-only rule is
 * also what holds the one-shot behaviour: the first call empties the reservoir,
 * so repeat calls inside one frame are no-ops by the resource rather than by a
 * flag somebody has to remember to clear.
 *
 * Nothing here branches on what it is hitting, and that is the constraint: the
 * burst asks the seam what its kill rule may be applied to and the seam
 * answers, so a body whose health is chunked is skipped without this module
 * ever learning that such a body exists.
 */
const fireBelch = (state: RunState): SimEvent[] => {
  if (state.reservoir < RESERVOIR_CAPACITY) return [];
  const cancelled = cancelMobFire(state);
  const kills: SimEvent[] = [];
  const killed = burstNearbyTargets(state, kills);
  state.reservoir = 0;
  return [{ type: 'belched', cancelled, killed }, ...kills];
};

export { fireBelch, BELCH_BURST_RADIUS, BELCH_CHUNK_DAMAGE };
