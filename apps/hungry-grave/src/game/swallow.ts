// The one verb: every payout in the game arrives through a swallow.

import type { SimEvent } from './events';
import { growGrave } from './grave';
import type { WeaponLine } from './lines/roster';
import { surgeStream } from './lines/skullStream';
import { launchWisps } from './lines/wisps';
import { resolveOffer } from './offer';
import type { RunState } from './run';
import { freshnessScale, RESERVOIR_CAPACITY } from './tuning';

type FoodKind = 'corpse' | 'drop' | 'feast';

interface Swallowable {
  /**
   * The body's own entity id. It is here because a drop is one body of an
   * offer and the offer holds its bodies by id, so the take has to name which
   * body went in; it travels as a value, exactly as every other field does.
   */
  readonly id: number;
  readonly kind: FoodKind;
  // 0 to 1. Treasure is always 1: drops and feasts never decay (ADR 0004).
  readonly freshness: number;
  // What this food pays before freshness scales it, in size units.
  readonly payout: number;
  // Which option this body carries (ADR 0034). Absent on corpses, feasts, and the body a maxed run's carrier opens.
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
    { type: 'chimed', kind: food.kind },
  ];

  const overflow = payGrowth(state, paid, events);
  payReservoir(state, paid, events);
  // The offer's own rule, held in offer.ts: a drop is one body of an offer, so
  // taking it levels the option that body carried and vanishes its siblings.
  // A body belonging to no live offer answers with nothing, which is what
  // leaves a maxed run's carrier paying growth, reservoir and overflow alone.
  if (food.kind === 'drop') events.push(...resolveOffer(state, food.id));
  if (overflow > 0) {
    state.score += overflow;
    events.push({ type: 'overflowed', amount: overflow, score: state.score });
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
