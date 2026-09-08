// The one button (ADR 0008): the full reservoir vomited in two scopes at once,
// the gas over the whole field and the burst around the grave.

import type { SimEvent } from './events';
import { damageMob, hasEntered } from './mobs';
import type { RunState } from './run';
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

// Whether a mob stands inside the burst, measured centre to centre from the
// grave. Squared, so the reach needs no square root to order.
const insideBurst = (state: RunState, x: number, y: number): boolean => {
  const dx = x - state.grave.x;
  const dy = y - state.grave.y;
  return dx * dx + dy * dy <= BELCH_BURST_RADIUS * BELCH_BURST_RADIUS;
};

/**
 * Kills the mobs standing inside the burst, and reports how many went.
 *
 * The kills route through damageMob rather than clearing the pool, so a belched
 * mob leaves a corpse exactly as any other kill does: the burst restarts the
 * swallow economy instead of emptying the field of it.
 *
 * Two things are outside its reach. A mob further out than the radius, which is
 * the whole of the split: a press that clears the air and leaves the crowd
 * walking hands the wave back to the storm. And a mob still above the top edge,
 * which is ADR 0008's older scope limit standing through the split, because
 * reaching past the edge would silently delete authored content a player never
 * saw arrive.
 */
const burstNearbyMobs = (state: RunState, events: SimEvent[]): number => {
  let killed = 0;
  for (const mob of state.mobs) {
    if (!mob.alive || !hasEntered(mob)) continue;
    if (!insideBurst(state, mob.x, mob.y)) continue;
    events.push(...damageMob(state, mob, mob.hp, 'belch'));
    killed += 1;
  }
  return killed;
};

/**
 * The two scopes at once: the gas takes every mob-fire shot on the whole field
 * and kills nothing, the burst kills the mobs within a radius of the grave, and
 * the reservoir empties.
 *
 * It fires only at a full reservoir and does nothing otherwise, which is why
 * there is no partial bomb anywhere in the signature. That full-only rule is
 * also what holds the one-shot behaviour: the first call empties the reservoir,
 * so repeat calls inside one frame are no-ops by the resource rather than by a
 * flag somebody has to remember to clear.
 *
 * Boss damage is not here. ADR 0008 makes the belch deal a big chunk of it when
 * the boss is inside the burst and never push a boss, and there is no boss in
 * this build for the rule to branch on, so it is a stub the boss dispatch fills
 * rather than a rule written blind.
 */
const fireBelch = (state: RunState): SimEvent[] => {
  if (state.reservoir < RESERVOIR_CAPACITY) return [];
  const cancelled = cancelMobFire(state);
  const kills: SimEvent[] = [];
  const killed = burstNearbyMobs(state, kills);
  state.reservoir = 0;
  return [{ type: 'belched', cancelled, killed }, ...kills];
};

export { fireBelch, BELCH_BURST_RADIUS };
