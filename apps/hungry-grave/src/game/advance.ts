/**
 * The frame seam above the execution authority: one frame's elapsed real time
 * turned into whole ticks and executed (ADR 0015, ADR 0017).
 *
 * It lives here rather than inside a pixi screen for the same reason clock.ts
 * does. ADR 0015 puts the accumulator in the game's own code so the autopilot
 * and the rendered screen share one implementation; with the loop inside a
 * screen the accumulator is shared but the loop is not, and dispatch 7's
 * autopilot would write a second one.
 */

import type { Clock } from './clock';
import { ticksFor } from './clock';
import type { SimEvent } from './events';
import type { Execution } from './execution';
import { executeTick } from './execution';
import type { FieldPoint } from './grave';
import type { TickCommand } from './run';

/**
 * Where this tick's command comes from. It takes a point and not a Grave
 * deliberately: a position is everything the closure needs, and the closure is
 * written in src/app, so typing it as Grave would hand live mutable sim state
 * out across the boundary the rest of the design works to keep.
 *
 * The one-shot rule for the belch lives in the closure and in fireBelch, never
 * here. A closure that read-and-clears its own flag reports false on the later
 * ticks of a frame, and fireBelch does nothing below a full reservoir and empties
 * it on the first call, so repeat presses inside one frame are no-ops by the
 * resource. A force-false here would be dead code the next reader trusts.
 */
export type CommandSource = (grave: FieldPoint) => TickCommand;

/**
 * Advances the run by however many whole ticks this frame's elapsed time buys,
 * asking for a fresh command on every one of them.
 *
 * Asking per tick rather than once per frame is the rule this seam exists to
 * hold. A touch command is a position error, so re-applying one sampled at the
 * top of the frame overshoots: on a 30 Hz frame a 100-unit drag would move the
 * grave 200 units. A keyboard command is a true velocity and is unaffected,
 * which is why sampling it once per frame is correct and why the closure and
 * not this function decides.
 *
 * elapsedMs is raw elapsed real time and never Pixi's deltaMS: clock.ts says
 * why in its own header.
 *
 * The stop reason and the run's ending are both read off the Execution before
 * each tick. A fatal fault stops the frame instead of re-firing on the other
 * fourteen ticks the catch-up clamp bought, and a run that seals or wins
 * mid-frame executes no further ticks, so the final tick count and score a
 * player sees are the ending's (#52). Verification readback keeps its own
 * stop-only guard deliberately: a sealed FORMAT_VERSION 1 tape recorded before
 * this rule can carry ticks after the ending, and a readback that stopped on
 * run.ending would cut short a tape it is obliged to reproduce in full.
 */
export function advance(
  execution: Execution,
  clock: Clock,
  elapsedMs: number,
  source: CommandSource,
): SimEvent[] {
  const ticks = ticksFor(clock, elapsedMs);
  const events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    if (execution.stop !== null || execution.run.ending !== null) break;
    events.push(...executeTick(execution, source(execution.run.grave)));
  }
  return events;
}
