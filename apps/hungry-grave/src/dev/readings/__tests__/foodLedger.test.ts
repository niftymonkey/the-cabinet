/**
 * Where food ended up, by kind (design record `grave-in-the-ground.md`, "Values
 * are data": the step measures food swallowed against food lost, for every kind
 * of food). Every event comes out of the sim's own swallow, cull and decay, so
 * the three ends are the ones the game actually produces.
 */

import { describe, expect, it } from 'vitest';

import {
  advanceCorpses,
  cullCorpses,
  spawnCorpse,
  spawnFeast,
} from '../../../game/corpses';
import { FIELD_HEIGHT } from '../../../game/field';
import type { Mob, MobType } from '../../../game/mobs';
import { spawnMob } from '../../../game/mobs';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import { swallow } from '../../../game/swallow';
import {
  createFoodLedger,
  foodLedgerOf,
  observeFoodLedger,
} from '../foodLedger';

const SEED = 20260920;
const PAYOUT = 1;

/** A dead mob of the given type at a place the grave is nowhere near. */
const killAt = (state: RunState, type: MobType, x: number, y: number): Mob => {
  const mob = spawnMob(
    state,
    type,
    { x, y, vx: 0, vy: 1, index: 0 },
    false,
    'wave',
  );
  if (mob === null) throw new Error('the mob pool had no slot');
  mob.alive = false;
  return mob;
};

/** The one live corpse on the run, which is how these tests name the food they staged. */
const foodOn = (state: RunState) => {
  const live = state.corpses.filter((corpse) => corpse.alive);
  const food = live[0];
  if (food === undefined || live.length !== 1) {
    throw new Error(`expected one piece of food, found ${live.length}`);
  }
  return food;
};

describe('food ledger', () => {
  it('counts a swallow under the kind of food that went in', () => {
    // The design record asks for swallowed against lost for each kind, so the
    // kind the swallow reports is the row the count lands on and never a total.
    const run = createRun(SEED);
    const accumulator = createFoodLedger();

    observeFoodLedger(
      accumulator,
      swallow(run, {
        id: 1,
        kind: 'feast',
        freshness: 1,
        payout: PAYOUT,
        tier: 'rich',
        treasureBody: false,
      }),
    );

    const ledger = foodLedgerOf(accumulator);
    expect(ledger.feast.swallowed).toBe(1);
    expect(ledger.corpse.swallowed).toBe(0);
  });

  it('counts food that left the bottom edge under its own kind', () => {
    // A dive never attempted (ADR 0004), which is the other half of the figure
    // the design record asks for: swallowed against lost.
    const run = createRun(SEED);
    const accumulator = createFoodLedger();
    spawnFeast(run, 100, FIELD_HEIGHT + 40, PAYOUT);

    observeFoodLedger(accumulator, cullCorpses(run));

    const ledger = foodLedgerOf(accumulator);
    expect(ledger.feast.lost).toBe(1);
    expect(ledger.feast.rotted).toBe(0);
  });

  it('counts a corpse the dirt took under as rotted, and never as lost', () => {
    // Greed that ran out of time is a different read from a dive never
    // attempted, and the two events already say so (ADR 0004). A ledger that
    // folded them would report a miss the player never had the chance at.
    const run = createRun(SEED);
    const accumulator = createFoodLedger();
    spawnCorpse(run, killAt(run, 'shambler', 60, 40), PAYOUT, 'trash');
    foodOn(run).freshness = 0;

    observeFoodLedger(accumulator, advanceCorpses(run));

    const ledger = foodLedgerOf(accumulator);
    expect(ledger.corpse.rotted).toBe(1);
    expect(ledger.corpse.lost).toBe(0);
  });

  it('reports zero for every kind on a run that saw no food, and leaves no kind out', () => {
    // A kind a run never saw is a fact about the run, so every kind is named
    // with a zero: an absent row would read as a reading one side happened not
    // to carry.
    const accumulator = createFoodLedger();

    expect(foodLedgerOf(accumulator)).toEqual({
      corpse: { swallowed: 0, lost: 0, rotted: 0 },
      powerUp: { swallowed: 0, lost: 0, rotted: 0 },
      feast: { swallowed: 0, lost: 0, rotted: 0 },
      fallenRung: { swallowed: 0, lost: 0, rotted: 0 },
    });
  });
});
