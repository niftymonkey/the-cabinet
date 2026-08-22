/**
 * The one button (ADR 0008): the full reservoir vomited as a screen-clearing
 * eruption. Every mob-fire shot on the field is cancelled and the reservoir
 * empties.
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

import type { SimEvent } from "./events";
import type { RunState } from "./run";
import { RESERVOIR_CAPACITY } from "./tuning";

/**
 * Cancels every mob-fire shot on the field and empties the reservoir.
 *
 * Boss damage is not here. ADR 0008 makes the belch deal a big chunk of it and
 * never push a boss, and there is no boss in this build for the rule to branch
 * on, so it is a stub the boss dispatch fills rather than a rule written blind.
 */
export function fireBelch(state: RunState): SimEvent[] {
  if (state.reservoir < RESERVOIR_CAPACITY) return [];
  let cancelled = 0;
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    shot.alive = false;
    cancelled += 1;
  }
  state.reservoir = 0;
  return [{ type: "belched", cancelled }];
}
