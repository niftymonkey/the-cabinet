// The vocabulary a run is driven with: what one tick can be asked to do, and
// where that ask comes from. The input satellites sit on these three (ADR 0011).

import type { FieldPoint } from './field';

// A move command in base-speed units, produced by an input model (ADR 0011).
interface MoveCommand {
  readonly x: number;
  readonly y: number;
}

/**
 * Everything one tick is asked to do. The belch arrives through the same door
 * the move does, because it is a rule of the sim and has to have a place in the
 * tick order: the alternative is a screen calling fireBelch beside advance,
 * which puts a game rule in a screen and puts the belch outside the order the
 * tick documents.
 */
interface TickCommand {
  readonly move: MoveCommand;
  readonly belch: boolean;
}

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
type CommandSource = (grave: FieldPoint) => TickCommand;

export type { MoveCommand, TickCommand, CommandSource };
