// The drop a carrier's death leaves, and the dice that pick which line it
// levels (ADR 0002, ADR 0034).

import { spawnDrop } from './corpses';
import type { SimEvent } from './events';
import type { WeaponLine } from './lines/roster';
import { WEAPON_LINES } from './lines/roster';
import type { RunState } from './run';

/**
 * The one drop of a run whose roll seeds rather than rolls over all four: the
 * first. Counting starts at one, so this is an ordinal and never an index.
 */
const SEEDING_DROP = 1;

// The lines a run has yet to open.
const unownedLines = (state: RunState): readonly WeaponLine[] => {
  return WEAPON_LINES.filter((line) => state.levels[line] === 0);
};

/**
 * Which line a drop levels, given which drop of the run it is.
 *
 * The dice seed once and then roll, and Mark ruled this on 2026-08-22 after
 * playing: the run's first drop picks among the lines still at level zero, and
 * every drop after it is uniform over all four. Seeding on every unowned line
 * sent the first three drops of a run to three different lines, so no line ever
 * gained depth and no weapon ever visibly got stronger. One seeded drop still
 * opens a line the birthright does not carry; everything after it can go deep.
 *
 * The ordinal is a parameter rather than something read off the state, because
 * which drop of the run this is belongs to the caller that is paying for it.
 */
const rollDropLine = (state: RunState, ordinal: number): WeaponLine => {
  const seeded = ordinal === SEEDING_DROP ? unownedLines(state) : [];
  const among = seeded.length > 0 ? seeded : WEAPON_LINES;
  return among[state.streams.drops.nextInt(among.length)];
};

/**
 * The drop a carrier leaves where it died (ADR 0002).
 *
 * The ordinal is read off the drops stream's own cursor rather than counted on
 * the run: rollDropLine draws from that stream exactly once per drop and
 * nothing else in the sim draws from it at all, so the cursor already is how
 * many drops this run has rolled.
 */
const dropForCarrier = (state: RunState, x: number, y: number): SimEvent[] => {
  const ordinal = state.streams.drops.drawn + 1;
  return spawnDrop(state, x, y, rollDropLine(state, ordinal));
};

export { rollDropLine, dropForCarrier };
