// The one verb: every payout in the game arrives through a swallow.

import type { SimEvent } from './events';
import { catchRung, growGrave } from './grave';
import type { WeaponLine } from './lines/roster';
import { surgeStream } from './lines/skullStream';
import { launchWisps } from './lines/wisps';
import type { CorpseTier } from './mobs';
import { everyLineMaxed, resolveOffer } from './offer';
import type { RunState } from './run';
import { freshnessScale, RESERVOIR_CAPACITY } from './tuning';

/**
 * The kinds of food that ride the one pool. A fallen rung is a fourth kind on
 * it rather than a pool of its own (ADR 0055, design record R6), which is what
 * gets it the swallow path, the scroll, the containment and the renderer for
 * free.
 */
type FoodKind = 'corpse' | 'powerUp' | 'feast' | 'fallenRung';

interface Swallowable {
  /**
   * The body's own entity id. It is here because a power-up is one body of an
   * offer and the offer holds its bodies by id, so the take has to name which
   * body went in; it travels as a value, exactly as every other field does.
   */
  readonly id: number;
  readonly kind: FoodKind;
  // 0 to 1. Treasure is always 1: power-ups and feasts never decay (ADR 0004).
  readonly freshness: number;
  // What this food pays before freshness scales it, in size units.
  readonly payout: number;
  /**
   * Whether this body is large food, carried from the row rather than decided
   * by kind (mobs.ts, corpses.ts). A rich corpse and a feast are both large
   * food and only one of them is a feast, so the tier is the word that parts
   * the rich tier from the mow and the kind cannot stand in for it.
   */
  readonly tier: CorpseTier;
  // Whether this body wears the treasure body, carried from the row rather than decided by kind (corpses.ts).
  readonly treasureBody: boolean;
  // Which option this body carries (ADR 0034), or which line a fallen rung came off. Absent on corpses, feasts, and the body a maxed run's carrier opens.
  readonly line?: WeaponLine;
}

// Growth, with anything past the ceiling handed back as overflow (ADR 0003).
const payGrowth = (
  state: RunState,
  amount: number,
  events: SimEvent[],
): number => {
  const overflow = growGrave(state.grave, amount);
  const grown = amount - overflow;
  if (grown > 0) {
    events.push({ type: 'grew', amount: grown, size: state.grave.size });
  }
  return overflow;
};

/**
 * Charge for the belch. Charge past full visibly splashes and is wasted, which
 * is ADR 0008's documented cure for bomb hoarding, so the splash is an event
 * and never a silent clamp. reservoirFull comes before splashed: the reservoir
 * fills, and only then does the excess go over the side.
 */
const payReservoir = (
  state: RunState,
  amount: number,
  events: SimEvent[],
): void => {
  const wasFull = state.reservoir >= RESERVOIR_CAPACITY;
  const taken = Math.min(amount, RESERVOIR_CAPACITY - state.reservoir);
  state.reservoir += taken;
  if (taken > 0) {
    events.push({
      type: 'reservoirCharged',
      amount: taken,
      reservoir: state.reservoir,
    });
  }
  if (!wasFull && state.reservoir >= RESERVOIR_CAPACITY) {
    events.push({ type: 'reservoirFull', reservoir: state.reservoir });
  }
  const wasted = amount - taken;
  if (wasted > 0) {
    events.push({ type: 'splashed', wasted, reservoir: state.reservoir });
  }
};

/**
 * What one large meal at a maxed ladder pays this run, in points: the run's own
 * row, stated in trash kills, at the run's own kill unit (ADR 0064).
 *
 * Stated in kills because the count is what binds this input: it pays per item
 * and a run takes many, so the figure is argued against the meals a whole run
 * takes rather than against one of them. Read off the run, so a run under a
 * record that moves either row pays what that record says.
 */
const mealAtMaxedOf = (state: RunState): number =>
  state.conditions.tuning.score.mealAtMaxedInKills *
  state.conditions.tuning.score.trashKillScore;

/**
 * The grave passes under food and it falls in. The only way anything is ever
 * paid (ADR 0002).
 *
 * It takes values and never an entity reference, for the reason events.ts
 * already states: entities are pooled and mutated in place, so a held reference
 * is a recycled slot by the time anything reads it.
 */
const swallow = (state: RunState, food: Swallowable): SimEvent[] => {
  const paid = food.payout * freshnessScale(food.freshness);
  const events: SimEvent[] = [
    {
      type: 'swallowed',
      kind: food.kind,
      freshness: food.freshness,
      payout: food.payout,
    },
    { type: 'chimed', kind: food.kind, treasureBody: food.treasureBody },
  ];

  const overflow = payGrowth(state, paid, events);
  payReservoir(state, paid, events);
  // The offer's own rule, held in offer.ts: a power-up is one body of an offer, so
  // taking it levels the option that body carried and vanishes its siblings.
  // A body belonging to no live offer answers with nothing, which is what
  // leaves a maxed run's carrier paying growth, reservoir and overflow alone.
  if (food.kind === 'powerUp') events.push(...resolveOffer(state, food.id));
  // The dive catching a rung the floor ladder took (ADR 0055, decision 24). It
  // is a kind test and not the treasure row, because the row says how a body
  // draws and chimes while this is a rule about which body it is: an offer's
  // body wears the same treasure body and must not give a rung back.
  if (food.kind === 'fallenRung') events.push(...catchRung(state, food.line));
  // The overflow keeps its own event and its own fields untouched, because it
  // answers a different question: a swallow that could not pay its normal way
  // (ADR 0003) rather than the score's ledger moving. Two events on this tick
  // is the named cost of that and it is accepted eyes open (design record R4).
  if (overflow > 0) {
    state.score += overflow;
    events.push({ type: 'overflowed', amount: overflow, score: state.score });
    events.push({
      type: 'scorePaid',
      input: 'overflow',
      amount: overflow,
      score: state.score,
    });
  }
  // Large food taken at full power (design record R4). Full power is every
  // rostered line at the top of its ladder and never the grave at its size
  // ceiling, which the overflow above already pays for; large food is the rich
  // tier, so the mow's own body pays nothing here however maxed the ladder is.
  if (food.tier === 'rich' && everyLineMaxed(state)) {
    const paid = mealAtMaxedOf(state);
    state.score += paid;
    events.push({
      type: 'scorePaid',
      input: 'mealAtMaxed',
      amount: paid,
      score: state.score,
    });
  }

  // The on-swallow lines, after the payouts. They fire here rather than from the
  // tick loop so the burst leaves on the tick the food went in: a tick of lag
  // would read as the burst arriving after the dive rather than out of it.
  // Each is handed the raw freshness and scales the currency it pays in, which
  // is the axis ADR 0058 names: volleys for the stream, souls for the wisps.
  surgeStream(state, food.freshness);
  launchWisps(state, events, food.freshness);
  return events;
};

export { swallow };
export type { FoodKind, Swallowable };
