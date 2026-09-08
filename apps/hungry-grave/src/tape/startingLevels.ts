// The tape's recorded roster, resolved against the roster this build
// implements (ADR 0043).

import type { WeaponLine } from '../game/lines/roster';
import { implementsLines, WEAPON_LINES } from '../game/lines/roster';
import { uniformLevels } from '../game/run';
import type { TapeHeader } from './tape';

/**
 * The recorded roster is one this build implements, so its levels become the
 * run's own trusted record and the roster itself becomes the run's.
 */
interface RosterImplemented {
  readonly outcome: 'implemented';
  readonly roster: readonly WeaponLine[];
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
 * Whether this build has every line the tape names.
 *
 * A subset and not an exact set: a run fields a roster drawn from a growing
 * pool (ADR 0046), so a recorded roster shorter than this build's pool is an
 * ordinary run rather than an unreadable one, and the lines it does not name
 * are lines that run never fielded. Order is not compared, because the recorded
 * roster is the order and reading by name is the whole point. The rule itself
 * lives on the roster, so nothing outside it re-derives what the pool holds.
 */
const implementsRoster = (recorded: readonly string[]): boolean => {
  return implementsLines(recorded);
};

const isWeaponLine = (name: string): name is WeaponLine => {
  const pool: readonly string[] = WEAPON_LINES;
  return pool.includes(name);
};

/**
 * The recorded roster as this build's own line names, in the order the tape
 * wrote them.
 *
 * The recorded order is kept rather than this build's, because the roster is
 * what the run fielded and a reordering would be this reader editing what the
 * tape said. Called only behind implementsRoster, so every name is a line and
 * the filter drops nothing.
 */
const rosterOf = (recorded: readonly string[]): readonly WeaponLine[] => {
  return recorded.filter(isWeaponLine);
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
  // Built over this build's own pool at zero and filled from the tape's roster,
  // so every line has a number and the record is total by construction. A line
  // the tape's roster never named stays at zero, which is the run's own truth:
  // it did not field that line.
  const roster = rosterOf(header.recordedRoster);
  const levels = uniformLevels(0);
  for (const line of roster) levels[line] = header.startingLevels[line];
  return { outcome: 'implemented', roster, levels };
};

export { resolveStartingLevels };
export type { StartingLevels, RosterImplemented, RosterNotImplemented };
