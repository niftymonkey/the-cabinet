// The held-transient registry, and the replay lead-in that has to outlast every
// lifetime in it (#58).

import { FIELD_RENDERER_TRANSIENT_TICKS } from './FieldRenderer';
import { STORM_RENDERER_TRANSIENT_TICKS } from './StormRenderer';

/**
 * Every lifetime a renderer keeps across frames, aggregated from the renderers'
 * own declarations. A held transient is renderer state born of a past tick
 * rather than drawn from the run: a scatter's or a burst's born tick, the shot
 * memory a cancel read compares against.
 */
const HELD_TRANSIENT_TICKS = {
  ...FIELD_RENDERER_TRANSIENT_TICKS,
  ...STORM_RENDERER_TRANSIENT_TICKS,
} as const;

/**
 * How many ticks before its target a replay's fast-forward stops, to be played
 * out normally (#58, ratified). A named starting value on the same terms as
 * RECORDER_CHECKPOINT_SPACING, and never below the registry's longest
 * lifetime, which the covering test holds; today's max is the 90-tick arrival
 * mark, which is Territory's whole opening beat.
 *
 * A replay fast-forwarded straight to a tick would show none of the held
 * transients, so the fast-forward stops a lead-in short of its target and
 * renders the lead-in normally, and the lead-in is honest exactly when it is at
 * least as long as the longest lifetime in the registry.
 */
const REPLAY_LEAD_IN_TICKS = 90;

export { HELD_TRANSIENT_TICKS, REPLAY_LEAD_IN_TICKS };
