/**
 * The one verb. Every payout in the game arrives through a swallow, and five
 * ADRs meet here.
 *
 * It takes values and never an entity reference, for the reason events.ts
 * already states: entities are pooled and mutated in place, so a held reference
 * is a recycled slot by the time anything reads it.
 *
 * Size never gates a swallow (ADR 0003). There is no size check anywhere in
 * this file, and one appearing here would be the bug.
 *
 * belch.ts is not this file and this file does not grow into it. The charge
 * stays here, because the swallow is what charges it; belch.ts takes the firing
 * and the eruption when dispatch 5 arrives, so that dispatch is purely additive.
 */

import type { SimEvent } from "./events";
import { growGrave } from "./grave";
import type { WeaponLine } from "./lines/roster";
import { MAX_LEVEL } from "./lines/roster";
import type { RunState } from "./run";
import { FRESHNESS_PAYOUT_FLOOR, RESERVOIR_CAPACITY } from "./tuning";

export type FoodKind = "corpse" | "drop" | "feast";

export interface Swallowable {
  readonly kind: FoodKind;
  /** 0 to 1. Treasure is always 1: drops and feasts never decay (ADR 0004). */
  readonly freshness: number;
  /** What this food pays before freshness scales it, in size units. */
  readonly payout: number;
  /** Which line a drop levels, decided by the dice at spawn (ADR 0002). Absent on corpses and feasts. */
  readonly line?: WeaponLine;
}

/** Freshness scales a payout down to a floor and never to zero (ADR 0004). */
function freshnessScale(freshness: number): number {
  return Math.max(freshness, FRESHNESS_PAYOUT_FLOOR);
}

/** Growth, with anything past the ceiling handed back as overflow (ADR 0003). */
function payGrowth(
  state: RunState,
  amount: number,
  events: SimEvent[],
): number {
  const overflow = growGrave(state.grave, amount);
  const grown = amount - overflow;
  if (grown > 0) {
    events.push({ type: "grew", amount: grown, size: state.grave.size });
  }
  return overflow;
}

/**
 * Charge for the belch. Charge past full visibly splashes and is wasted, which
 * is ADR 0008's documented cure for bomb hoarding, so the splash is an event
 * and never a silent clamp. reservoirFull comes before splashed: the reservoir
 * fills, and only then does the excess go over the side.
 */
function payReservoir(
  state: RunState,
  amount: number,
  events: SimEvent[],
): void {
  const wasFull = state.reservoir >= RESERVOIR_CAPACITY;
  const taken = Math.min(amount, RESERVOIR_CAPACITY - state.reservoir);
  state.reservoir += taken;
  if (taken > 0) {
    events.push({
      type: "reservoirCharged",
      amount: taken,
      reservoir: state.reservoir,
    });
  }
  if (!wasFull && state.reservoir >= RESERVOIR_CAPACITY) {
    events.push({ type: "reservoirFull", reservoir: state.reservoir });
  }
  const wasted = amount - taken;
  if (wasted > 0) {
    events.push({ type: "splashed", wasted, reservoir: state.reservoir });
  }
}

/**
 * A drop levels the line it carries, chosen by the dice at spawn and never
 * rolled here (ADR 0002). A line already at MAX_LEVEL has no level to give, so
 * the drop pays what it is worth as overflow instead and nothing swallowed is
 * ever worthless.
 */
function payLevel(
  state: RunState,
  line: WeaponLine,
  amount: number,
  events: SimEvent[],
): number {
  if (state.levels[line] >= MAX_LEVEL) return amount;
  state.levels[line] += 1;
  events.push({ type: "weaponLeveled", line, level: state.levels[line] });
  return 0;
}

/** The grave passes under food and it falls in. The only way anything is ever paid (ADR 0002). */
export function swallow(state: RunState, food: Swallowable): SimEvent[] {
  const paid = food.payout * freshnessScale(food.freshness);
  const events: SimEvent[] = [
    {
      type: "swallowed",
      kind: food.kind,
      freshness: food.freshness,
      payout: food.payout,
    },
    { type: "chimed", kind: food.kind },
  ];

  let overflow = payGrowth(state, paid, events);
  payReservoir(state, paid, events);
  if (food.line !== undefined) {
    overflow += payLevel(state, food.line, paid, events);
  }
  if (overflow > 0) {
    state.score += overflow;
    events.push({ type: "overflowed", amount: overflow, score: state.score });
  }
  return events;
}
