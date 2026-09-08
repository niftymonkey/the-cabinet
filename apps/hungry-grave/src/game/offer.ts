// The offer of three a carrier's death opens, the take that resolves it, and
// the bank that holds the next one (ADR 0034).

import { DROP_HALF_EXTENT, spawnDrop } from './corpses';
import type { Corpse } from './corpses';
import type { SimEvent } from './events';
import { FIELD_WIDTH } from './field';
import type { WeaponLine } from './lines/roster';
import { BIRTHRIGHT, MAX_LEVEL } from './lines/roster';
import type { RunState } from './run';

/**
 * An offer live on the field: the options and the bodies carrying them.
 *
 * The bodies are held by entity id rather than by slot index, on the precedent
 * of the bell's struck set: a recycled slot is a different body. The two lists
 * are the same length and in the same order, so the body at index i carries
 * the option at index i.
 */
interface Offer {
  readonly options: readonly WeaponLine[];
  // The entity ids of the option bodies, one per option, in the same order.
  readonly bodyIds: readonly number[];
}

// How many options one offer holds at most (ADR 0034's three).
const OFFER_SIZE = 3;

/**
 * How far apart the bodies stand, in field units. An initial data row.
 *
 * Derived from the grave's own reach: the grave's half-width is its size at
 * GRAVE_ASPECT 2 and a drop's half-extent is DROP_HALF_EXTENT, so at the size
 * ceiling the catch reach from the grave's centre is 47.75. At 90 apart, two
 * adjacent bodies are both reachable only from inside 45 of their midpoint,
 * which is inside that reach by 2.75 units and outside the reach of a
 * start-size grave entirely. So the two-touch tie-break is a rare late-run
 * event rather than the normal case, and three bodies span a third of the
 * field's width, which makes choosing a real move.
 */
const OFFER_SPACING = 90;

/**
 * How far above the top edge a banked offer opens, in field units. An initial
 * data row.
 *
 * The death that paid a banked offer has scrolled away by the time it opens,
 * so it enters the field the way a wave does, at one body depth above the edge
 * and at the grave's own x. It is placed once and then the world scrolls: this
 * is not the offer that drifts toward the grave ADR 0048 rejects, because the
 * grave still has to stay under it.
 */
const OFFER_ENTRY_DEPTH = 26;

/**
 * The lines this run may still be offered: in its own roster (ADR 0046) and
 * below the top of their ladder, because a maxed line is never offered
 * (ADR 0034).
 */
const offerableLines = (state: RunState): readonly WeaponLine[] => {
  return state.roster.filter((line) => state.levels[line] < MAX_LEVEL);
};

/**
 * `count` distinct lines drawn off a pool, in draw order.
 *
 * Drawing without replacement rather than rolling each slot: an offer holding
 * one line twice is one option wearing two bodies, which reads as a bug at the
 * one moment the player is being asked to choose.
 */
const drawFrom = (
  state: RunState,
  pool: readonly WeaponLine[],
  count: number,
): WeaponLine[] => {
  const from = [...pool];
  const drawn: WeaponLine[] = [];
  while (drawn.length < count && from.length > 0) {
    drawn.push(...from.splice(state.streams.drops.nextInt(from.length), 1));
  }
  return drawn;
};

/**
 * Whether this is the run's first offer, read off the drops stream's own
 * cursor rather than counted on the run.
 *
 * Nothing else in the sim draws from that stream, and the fixed shape below
 * draws for every option it does not hold outright, so a cursor still at zero
 * is a run that has never opened an offer. The one case it cannot tell apart
 * is a roster with no more offerable lines than an offer holds, where the
 * first offer needs no draw at all; there the fixed shape and the ordinary
 * draw both return the whole pool, so the two answers are the same.
 */
const isFirstOffer = (state: RunState): boolean => {
  return state.streams.drops.drawn === 0;
};

/**
 * The first offer of a run: the birthright plus unowned lines (ADR 0034's
 * "the skull stream and two unowned lines"), so deepening the main gun and
 * opening something new are both on the table from the first swallow.
 *
 * The last fill is what makes the shape a preference rather than a demand. A
 * run born part-built has no unowned line to draw and may not hold the
 * birthright at all, and an offer that came back short there would hand a
 * pinned run a body carrying nothing while three lines still had rungs left.
 */
const fixedFirstOptions = (
  state: RunState,
  pool: readonly WeaponLine[],
): WeaponLine[] => {
  const born = pool.filter((line) => BIRTHRIGHT.includes(line));
  const chosen = born.slice(0, OFFER_SIZE);
  const unowned = pool.filter(
    (line) => state.levels[line] === 0 && !chosen.includes(line),
  );
  chosen.push(...drawFrom(state, unowned, OFFER_SIZE - chosen.length));
  const rest = pool.filter((line) => !chosen.includes(line));
  chosen.push(...drawFrom(state, rest, OFFER_SIZE - chosen.length));
  return chosen;
};

// What this offer holds: fixed on the run's first, drawn on every one after.
const drawOptions = (state: RunState): WeaponLine[] => {
  const pool = offerableLines(state);
  if (isFirstOffer(state)) return fixedFirstOptions(state, pool);
  return drawFrom(state, pool, OFFER_SIZE);
};

/**
 * Where the middle of the group stands, held far enough inside the field that
 * every body is fully on it.
 *
 * The whole group shifts rather than each body clamping on its own. Clamping
 * each would stack two bodies on one x near an edge, which deletes the choice
 * at exactly the moment the player is pinned against that edge, and it would
 * make the spacing the two-touch tie-break is derived from stop being true.
 */
const groupCentre = (x: number, count: number): number => {
  const margin = ((count - 1) / 2) * OFFER_SPACING + DROP_HALF_EXTENT;
  return Math.min(Math.max(x, margin), FIELD_WIDTH - margin);
};

// The id the spawn reported, or null when the food pool refused the body.
const bodyIdIn = (events: readonly SimEvent[]): number | null => {
  for (const event of events) {
    if (event.type === 'dropSpawned') return event.id;
  }
  return null;
};

/**
 * One offer standing on the field: its bodies laid side by side around a
 * point, and the offer built out of the bodies that actually stand.
 *
 * The offer is derived from what the food pool gave rather than from what was
 * asked for, so a refused body is an option that is simply not on the field
 * instead of an offer holding an id nothing answers to.
 */
const standOffer = (state: RunState, x: number, y: number): SimEvent[] => {
  const options = drawOptions(state);
  if (options.length === 0) return spawnDrop(state, x, y);

  const centre = groupCentre(x, options.length);
  const bodies: SimEvent[] = [];
  const bodyIds: number[] = [];
  const laid: WeaponLine[] = [];
  for (const [index, line] of options.entries()) {
    const at = centre + (index - (options.length - 1) / 2) * OFFER_SPACING;
    const spawned = spawnDrop(state, at, y, line);
    bodies.push(...spawned);
    const id = bodyIdIn(spawned);
    if (id === null) continue;
    bodyIds.push(id);
    laid.push(line);
  }
  // Every body refused: the carrier's payment is banked rather than lost, and
  // the bank's own tick opens it on the first tick there is room (ADR 0034).
  // ADR 0048's "missed is missed" is about a carrier the player let past, never
  // about one the game could not put on the field, so a supply the corpse cap
  // turned away must not simply disappear.
  if (bodyIds.length === 0) {
    state.refusals.offers += 1;
    state.bankedOffers += 1;
    return [...bodies, { type: 'offerBanked', banked: state.bankedOffers }];
  }

  state.offer = { options: laid, bodyIds };
  // The point reported is where the offer stands rather than where the carrier
  // died: near an edge the group is shifted inward, and the death point is
  // already on the mobKilled the offer was paid by.
  const opened: SimEvent = {
    type: 'offerOpened',
    options: laid,
    x: centre,
    y,
    banked: state.bankedOffers,
  };
  return [opened, ...bodies];
};

/**
 * A carrier's death: it puts an offer on the field, or banks it when one
 * already stands (ADR 0034's "exactly one offer is live at a time").
 */
const openOffer = (state: RunState, x: number, y: number): SimEvent[] => {
  if (state.offer !== null) {
    state.bankedOffers += 1;
    return [{ type: 'offerBanked', banked: state.bankedOffers }];
  }
  return standOffer(state, x, y);
};

// How far a body's centre sits from the grave's, squared, which orders the
// same way the distance does without a root the sim would have to specify.
const squaredGap = (state: RunState, body: Corpse): number => {
  const dx = body.x - state.grave.x;
  const dy = body.y - state.grave.y;
  return dx * dx + dy * dy;
};

/**
 * Which body of the live offer a grave covering more than one takes: the one
 * whose centre is nearest the grave's, ties broken by the lower entity id.
 *
 * Deterministic, drawing nothing, and the reading a player would give. The
 * spacing makes the two-touch case possible only near the size ceiling, so
 * this is a rare late-run answer rather than the normal one.
 */
const chooseOfferBody = (
  state: RunState,
  covered: readonly Corpse[],
): Corpse | null => {
  const offer = state.offer;
  if (offer === null) return null;
  let nearest: Corpse | null = null;
  let best = Infinity;
  for (const body of covered) {
    if (!offer.bodyIds.includes(body.id)) continue;
    const gap = squaredGap(state, body);
    if (nearest !== null && gap > best) continue;
    if (nearest !== null && gap === best && body.id > nearest.id) continue;
    nearest = body;
    best = gap;
  }
  return nearest;
};

// The offer's other bodies, taken off the field on the tick the take lands.
const vanishSiblings = (state: RunState, offer: Offer, taken: number): void => {
  for (const body of state.corpses) {
    if (!body.alive || body.id === taken) continue;
    if (offer.bodyIds.includes(body.id)) body.alive = false;
  }
};

/**
 * The next offer out of the bank, entering the field the way a wave does.
 *
 * It opens at the grave's own x because the death that paid it has scrolled
 * away by the time its turn comes, and there is nowhere else on the field that
 * means anything.
 */
const openBanked = (state: RunState): SimEvent[] => {
  if (state.bankedOffers <= 0) return [];
  state.bankedOffers -= 1;
  return standOffer(state, state.grave.x, -OFFER_ENTRY_DEPTH);
};

/**
 * The bank's own tick: no offer live, the bank above zero, and the phase
 * permitting one, so the next offer comes out (ADR 0034, ADR 0048).
 *
 * Without this site the bank has no opening that is not a take or a loss, and
 * an offer held shut through a phase that does not permit one would never
 * reopen once that phase ends: there is no offer left to take or to lose. The
 * permission is the phase's own column and arrives as a value, so the bank
 * never learns which phase the run is in.
 *
 * ADR 0048's "missed is missed" still holds, because the bank only ever holds
 * offers a carrier's death already paid.
 *
 * Today every offer clears through a take or a loss and each of those opens the
 * next itself, so this finds nothing to do. It is the site the corpse cap needs:
 * when a spawn can be refused, an offer whose bodies were all refused banks
 * rather than disappearing, and this is what lets it back out.
 */
const openBankedOffer = (state: RunState, permitted: boolean): SimEvent[] => {
  if (!permitted) return [];
  if (state.offer !== null) return [];
  return openBanked(state);
};

/**
 * The take: the body goes in, its siblings vanish, and the bank opens the next
 * offer (ADR 0034).
 *
 * A body that belongs to no live offer answers with nothing at all, which is
 * the body a maxed run's carrier opens: it pays growth, reservoir and overflow
 * through the swallow like any other food and has no option to give.
 */
const resolveOffer = (state: RunState, takenId: number): SimEvent[] => {
  const offer = state.offer;
  if (offer === null) return [];
  const index = offer.bodyIds.indexOf(takenId);
  if (index < 0) return [];

  const line = offer.options[index];
  const passed = offer.options.filter((_, at) => at !== index);
  state.offer = null;
  vanishSiblings(state, offer, takenId);
  state.levels[line] += 1;
  return [
    { type: 'weaponLeveled', line, level: state.levels[line] },
    { type: 'offerTaken', line, passed },
    ...openBanked(state),
  ];
};

/**
 * An offer whose every body has left the field, reported once (ADR 0034).
 *
 * It is read off the field rather than counted, so the three bodies scrolling
 * off on three different ticks is still one loss, and the bank behind it opens
 * exactly as it does after a take.
 */
const loseOffer = (state: RunState): SimEvent[] => {
  const offer = state.offer;
  if (offer === null) return [];
  const standing = state.corpses.some(
    (body) => body.alive && offer.bodyIds.includes(body.id),
  );
  if (standing) return [];
  state.offer = null;
  return [{ type: 'offerLost', options: offer.options }, ...openBanked(state)];
};

export {
  offerableLines,
  openOffer,
  openBankedOffer,
  chooseOfferBody,
  resolveOffer,
  loseOffer,
  OFFER_SIZE,
  OFFER_SPACING,
  OFFER_ENTRY_DEPTH,
};
export type { Offer };
