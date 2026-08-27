// The one verb: every payout in the game arrives through a swallow.

import type { SimEvent } from './events';
import { growGrave } from './grave';
import type { WeaponLine } from './lines/roster';
import { MAX_LEVEL } from './lines/roster';
import { surgeStream } from './lines/soulStream';
import { launchTerritory } from './lines/territory';
import { launchWisps } from './lines/wisps';
import type { RunState } from './run';
import { FRESHNESS_PAYOUT_FLOOR, RESERVOIR_CAPACITY } from './tuning';

type FoodKind = 'corpse' | 'drop' | 'feast';

interface Swallowable {
  readonly kind: FoodKind;
  // 0 to 1. Treasure is always 1: drops and feasts never decay (ADR 0004).
  readonly freshness: number;
  // What this food pays before freshness scales it, in size units.
  readonly payout: number;
  // Which line a drop levels, decided by the dice at spawn (ADR 0034). Absent on corpses and feasts.
  readonly line?: WeaponLine;
}

// Freshness scales a payout down to a floor and never to zero (ADR 0004).
const freshnessScale = (freshness: number): number => {
  return Math.max(freshness, FRESHNESS_PAYOUT_FLOOR);
};

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
 * A drop levels the line it carries, chosen by the dice at spawn and never
 * rolled here (ADR 0034). A line already at MAX_LEVEL has no level to give, so
 * the drop pays what it is worth as overflow instead and nothing swallowed is
 * ever worthless.
 */
const payLevel = (
  state: RunState,
  line: WeaponLine,
  amount: number,
  events: SimEvent[],
): number => {
  if (state.levels[line] >= MAX_LEVEL) return amount;
  state.levels[line] += 1;
  events.push({ type: 'weaponLeveled', line, level: state.levels[line] });
  return 0;
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

  let overflow = payGrowth(state, paid, events);
  payReservoir(state, paid, events);
  if (food.line !== undefined) {
    overflow += payLevel(state, food.line, paid, events);
  }
  if (overflow > 0) {
    state.score += overflow;
    events.push({ type: 'overflowed', amount: overflow, score: state.score });
  }

  // The on-swallow lines, after the payouts. They fire here rather than from the
  // tick loop so the burst leaves on the tick the food went in: a tick of lag
  // would read as the burst arriving after the dive rather than out of it.
  surgeStream(state);
  launchWisps(state, events);
  launchTerritory(state, food.freshness, events);
  return events;
};

export { swallow, freshnessScale };
export type { FoodKind, Swallowable };
