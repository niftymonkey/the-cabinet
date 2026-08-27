// The weapon lines this run's own data names.

import type { WeaponLine } from '../../game/lines/roster';

/**
 * The lines the replayed run itself names, read off a levels record it carries
 * and never off a list compiled into the instrument, so a line added to the
 * roster appears in the readings with no edit here (#74 story 11).
 *
 * The tape header's starting levels and the replayed run's own record name the
 * same lines, because a replay builds its record from the header's. Reading the
 * header's is what makes the line set known before the first tick, so a tape
 * with no command in it still names its own lines.
 *
 * Object.keys is the one call that loses the record's key type, and the
 * assertion puts back what every writer of a levels record already guarantees.
 */
const linesInRun = (
  levels: Readonly<Record<WeaponLine, number>>,
): readonly WeaponLine[] => Object.keys(levels) as WeaponLine[];

export { linesInRun };
