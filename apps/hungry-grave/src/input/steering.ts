/**
 * One move command from two live input models.
 *
 * Touch wins while it is steering, keyboard otherwise, and they are never
 * summed: the two are in different units of meaning, one a velocity and one a
 * position error, so a held key plus a live drag overshoots the target.
 *
 * The rule has a consequence worth knowing: a resting finger that has crossed
 * the slop silently disables the keyboard until it lifts.
 */

import type { FieldPoint } from '../game/grave';
import type { MoveCommand } from '../game/run';
import type { TouchSteer } from './touch';

export function combineSteer(
  keys: MoveCommand,
  touch: TouchSteer,
  grave: FieldPoint,
): MoveCommand {
  // The drag is asked for on every tick, steering or not, so TouchSteer's view
  // of the grave stays current: a pointer promoted between two frames then
  // anchors to where the grave is now rather than to where it was when the
  // finger landed and the keyboard was still moving it.
  const drag = touch.command(grave);
  return touch.isSteering() ? drag : keys;
}
