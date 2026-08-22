/**
 * The rising price of a drop, and the dice that pick which line it levels
 * (ADR 0002).
 *
 * The prices are an authored table rather than a curve evaluated at runtime, for
 * two reasons and the second is the load-bearing one: a table is reviewable at a
 * glance and tunable per entry by the tuning dispatch, and Math.pow is an
 * implementation-approximated operation that ADR 0015 keeps out of the sim
 * entirely.
 */

import { spawnDrop } from "./corpses";
import type { SimEvent } from "./events";
import type { WeaponLine } from "./lines/roster";
import { WEAPON_LINES } from "./lines/roster";
import type { RunState } from "./run";

/**
 * What each drop of a run costs, in kills.
 *
 * Fitted to the authored stage's own supply of 268 trash mobs: a geometric ratio
 * of 1.24 from a base of 5 puts the tenth drop at 160 cumulative kills, the
 * eleventh at 203 and the twelfth at 256. Against 268 authored mobs that is the
 * concept doc's ten-to-twelve band produced the honest way, out of skill rather
 * than out of a die: a player who kills six mobs in ten gets ten drops and a
 * player who clears nearly everything gets twelve.
 */
export const DROP_PRICES: readonly number[] = [
  5, 6, 8, 10, 12, 15, 18, 23, 28, 35, 43, 53,
];

/**
 * A drop's half-extent, giving it 16 field units.
 *
 * What binds is the grave's own width at the size floor, 18 units, and never the
 * mouth's interior: ADR 0003 rules that size never gates a swallow, so the mouth
 * is not a gate. Sixteen is the size the drop's job wants, two units clear of
 * that bound and larger than a corpse's 14. Mark ruled on 2026-08-22 that the
 * corpse-reads-bigger-than-a-drop rule gives, precisely so the drop can be sized
 * for the at-a-glance line read that has to survive mid-dodge with no HUD.
 */
export const DROP_HALF_EXTENT = 8;

/**
 * What the next drop costs. Past the last entry the price holds rather than
 * growing, because nothing in a tracer run can reach it and a rule nobody can
 * see is not worth inventing.
 */
export function priceOfNextDrop(dropsPaid: number): number {
  const index = Math.min(Math.max(dropsPaid, 0), DROP_PRICES.length - 1);
  return DROP_PRICES[index];
}

/**
 * Which line the next drop levels.
 *
 * The dice seed before they roll, and Mark ruled this on 2026-08-22: while any
 * line is unowned the roll picks among those, and once every line is owned it is
 * uniform over all four. Seeding removes the missing-line defect outright, where
 * a uniform roll leaves 8.4% of eleven-drop runs missing a line, and it costs
 * less of the ceiling and less of the run-to-run variety than a weighting does.
 */
export function rollDropLine(state: RunState): WeaponLine {
  const unowned = WEAPON_LINES.filter((line) => state.levels[line] === 0);
  const among = unowned.length > 0 ? unowned : WEAPON_LINES;
  return among[state.streams.drops.nextInt(among.length)];
}

/**
 * One kill counted against the price of the next drop, and the drop it buys.
 *
 * It is called for every kill the tick produced, whatever killed it. Drops are
 * priced in kills and a kill is a kill: a price that depended on which weapon
 * landed the last point of damage would move a drop boundary for a reason no
 * player could read, and two runs would become different builds inside a minute.
 */
export function creditKill(state: RunState, x: number, y: number): SimEvent[] {
  state.killsSinceDrop += 1;
  if (state.killsSinceDrop < priceOfNextDrop(state.dropsPaid)) return [];
  state.killsSinceDrop = 0;
  state.dropsPaid += 1;
  return spawnDrop(state, x, y, rollDropLine(state));
}
