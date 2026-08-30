// The tape's recorded roster, resolved against the roster this build
// implements (ADR 0043).

import type { WeaponLine } from '../game/lines/roster';
import { WEAPON_LINES } from '../game/lines/roster';
import { uniformLevels } from '../game/run';
import type { TapeHeader } from './tape';

/**
 * The recorded roster is one this build implements, so its levels become the
 * run's own trusted record.
 */
interface RosterImplemented {
  readonly outcome: 'implemented';
  readonly levels: Record<WeaponLine, number>;
}

/**
 * The recorded roster names a cast this build does not have. The levels stay in
 * the tape's own vocabulary and nothing is coerced into the current roster: one
 * direction would lose what the tape said and the other would invent something
 * it never said.
 */
interface RosterNotImplemented {
  readonly outcome: 'notImplemented';
  readonly recordedRoster: readonly string[];
}

type StartingLevels = RosterImplemented | RosterNotImplemented;

/**
 * Whether this build has exactly the lines the tape names.
 *
 * Exactly, and not a superset either way. A recorded roster missing a line this
 * build has leaves that line's starting level unsaid, and ADR 0027 rules that a
 * header records resolved values and never absences, so there is nothing honest
 * to put there. Order is not compared, because the recorded roster is the order
 * and reading by name is the whole point.
 */
const implementsRoster = (recorded: readonly string[]): boolean => {
  if (recorded.length !== WEAPON_LINES.length) return false;
  const named = new Set(recorded);
  if (named.size !== recorded.length) return false;
  return WEAPON_LINES.every((line) => named.has(line));
};

/**
 * The starting levels this build can run the tape from, or the roster it cannot
 * implement.
 *
 * This is the parse-at-the-edge step: raw recorded data is checked exactly once,
 * here, and becomes a trusted `Record<WeaponLine, number>` that `RunState`
 * keeps without re-checking. Reading and replaying are two different
 * obligations, and this is the one that answers replaying: a header naming a
 * line this build does not have is still reported truthfully, and only the
 * simulation refuses.
 */
const resolveStartingLevels = (header: TapeHeader): StartingLevels => {
  if (!implementsRoster(header.recordedRoster)) {
    return {
      outcome: 'notImplemented',
      recordedRoster: header.recordedRoster,
    };
  }
  // Built over this build's own roster and filled from the tape's, so every
  // line has a number and the record is total by construction.
  const levels = uniformLevels(0);
  for (const line of WEAPON_LINES) levels[line] = header.startingLevels[line];
  return { outcome: 'implemented', levels };
};

export { resolveStartingLevels };
export type { StartingLevels, RosterImplemented, RosterNotImplemented };
