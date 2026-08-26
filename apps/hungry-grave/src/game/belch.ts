/**
 * The one button (ADR 0008): the full reservoir vomited as a screen-clearing
 * eruption. Every mob-fire shot on the field is cancelled, every mob on screen
 * is killed, and the reservoir empties.
 *
 * It fires only at a full reservoir and does nothing otherwise, which is why
 * there is no partial bomb anywhere in the signature. That full-only rule is
 * also what holds the one-shot behaviour: the first call empties the reservoir,
 * so repeat calls inside one frame are no-ops by the resource rather than by a
 * flag somebody has to remember to clear.
 *
 * The charge stays in swallow.ts and the firing is here, exactly as that file's
 * own header demands, so this dispatch is purely additive on that seam.
 */

import type { SimEvent } from './events';
import { damageMob, hasEntered } from './mobs';
import type { RunState } from './run';
import { RESERVOIR_CAPACITY } from './tuning';

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

/**
 * Kills every mob that has entered the field, and reports how many went.
 *
 * The kills route through damageMob rather than clearing the pool, so a belched
 * mob leaves a corpse and counts against the price of the next drop exactly as
 * any other kill does: the wipe restarts the swallow economy instead of
 * emptying the field of it.
 *
 * A mob still above the top edge survives. ADR 0008 scopes the bomb to what is
 * on screen, and reaching past the edge would silently delete authored content
 * a player never saw arrive.
 */
const wipeEnteredMobs = (state: RunState, events: SimEvent[]): number => {
  let killed = 0;
  for (const mob of state.mobs) {
    if (!mob.alive || !hasEntered(mob)) continue;
    events.push(...damageMob(state, mob, mob.hp, 'belch'));
    killed += 1;
  }
  return killed;
};

/**
 * Cancels every mob-fire shot on the field, kills every mob on screen, and
 * empties the reservoir.
 *
 * Boss damage is not here. ADR 0008 makes the belch deal a big chunk of it and
 * never push a boss, and there is no boss in this build for the rule to branch
 * on, so it is a stub the boss dispatch fills rather than a rule written blind.
 */
const fireBelch = (state: RunState): SimEvent[] => {
  if (state.reservoir < RESERVOIR_CAPACITY) return [];
  const cancelled = cancelMobFire(state);
  const kills: SimEvent[] = [];
  const killed = wipeEnteredMobs(state, kills);
  state.reservoir = 0;
  return [{ type: 'belched', cancelled, killed }, ...kills];
};

export { fireBelch };
