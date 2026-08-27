// The weapon lines this run's own data names.

import type { WeaponLine } from '../../game/lines/roster';
import type { RunState } from '../../game/run';

/**
 * The lines the replayed run itself names, read off its own levels record and
 * never off a list compiled into the instrument, so a line added to the roster
 * appears in the readings with no edit here (#74 story 11).
 *
 * Object.keys is the one call that loses the record's key type, and the
 * assertion puts back what every writer of state.levels already guarantees.
 */
const linesInRun = (state: RunState): readonly WeaponLine[] =>
  Object.keys(state.levels) as WeaponLine[];

export { linesInRun };
