// One move command from two live input models.

import type { MoveCommand } from '../game/command';
import type { ColumnPoint, TouchSteer } from './touch';

/**
 * Touch wins while it is steering, keyboard otherwise, and they are never
 * summed: the two are in different units of meaning, one a velocity and one a
 * position error, so a held key plus a live drag overshoots the target.
 *
 * The rule has a consequence worth knowing: a resting finger that has crossed
 * the slop silently disables the keyboard until it lifts.
 *
 * The drag is reasoned about on the column, where the finger is, so its move
 * goes through the conversion the app hands in. A key is a plain field move
 * and is never converted (tilted view T10).
 */
const combineSteer = (
  keys: MoveCommand,
  touch: TouchSteer,
  grave: ColumnPoint,
  dragOnField: (onColumn: MoveCommand) => MoveCommand,
): MoveCommand => {
  // The drag is asked for on every tick, steering or not, so TouchSteer's view
  // of the grave stays current: a pointer promoted between two frames then
  // anchors to where the grave is now rather than to where it was when the
  // finger landed and the keyboard was still moving it.
  const drag = touch.command(grave);
  return touch.isSteering() ? dragOnField(drag) : keys;
};

export { combineSteer };
