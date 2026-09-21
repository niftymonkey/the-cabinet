/**
 * Every payment into the score names its own input (design record R4).
 *
 * It is a cross-cutting guard rather than one module's test: the score is one
 * number fed by five inputs paid at four sites, and what is guarded here is the
 * property none of those sites can hold on its own, that a payment with no name
 * cannot exist. The table below is total over the closed union, so a sixth
 * input added to the vocabulary without a payer is a compile error here.
 */

import { describe, expect, it } from 'vitest';

import { damageBoss, spawnBoss } from '../bosses/phases';
import { CORPSE_HALF_EXTENT } from '../corpses';
import type { ScoreInput, SimEvent } from '../events';
import { MOB_TYPES, damageMob, spawnMob } from '../mobs';
import type { RunState } from '../run';
import { createRun, uniformLevels } from '../run';
import { MAX_LEVEL } from '../lines/roster';
import { damageSetPiece, placeSetPiece } from '../stage/setPiece';
import { SET_PIECE_HP } from '../stage/waves';
import type { Swallowable } from '../swallow';
import { swallow } from '../swallow';
import { SIZE_CEILING, SIZE_FLOOR, TRASH_CORPSE_PAYOUT } from '../tuning';

/** An id no body of any offer holds, so a hand-built food takes no option. */
const NO_BODY = 0;

/**
 * Where a hand-built piece of food is lying and how fast, which the fall's own
 * drawing reads off the swallowed event (design record R5). None of it changes
 * a payout, so every food below shares one still body at the origin.
 */
const LYING_STILL = {
  x: 0,
  y: 0,
  halfExtent: CORPSE_HALF_EXTENT,
  vx: 0,
  vy: 0,
};

/** A body of the given tier, as the value the swallow takes. */
function food(tier: 'trash' | 'rich'): Swallowable {
  return {
    id: NO_BODY,
    ...LYING_STILL,
    kind: 'corpse',
    freshness: 1,
    payout: TRASH_CORPSE_PAYOUT,
    tier,
    treasureBody: false,
  };
}

/**
 * A run at full power, which is the state three of the five payments need and
 * the other two are indifferent to.
 */
function maxedRun(): RunState {
  return createRun(1, {
    startingSize: SIZE_FLOOR,
    startingLevels: uniformLevels(MAX_LEVEL),
  });
}

/** A live mob standing where it is put, past its arriving beat. */
function putMob(state: RunState) {
  const mob = spawnMob(
    state,
    'shambler',
    { x: 100, y: 100, vx: 0, vy: 0, index: 0 },
    false,
    'wave',
  );
  if (mob === null) throw new Error('the mob pool refused the fixture');
  mob.beat = 0;
  return mob;
}

/**
 * One payment per input, each driven at the site that owns the thing being paid
 * for. The record is total over ScoreInput on purpose: an input with no payer
 * here does not compile, which is the half a runtime assertion cannot carry.
 */
const PAYERS: Record<ScoreInput, (state: RunState) => SimEvent[]> = {
  kill: (state) => {
    const mob = putMob(state);
    return damageMob(state, mob, MOB_TYPES.shambler.hp, 'skullStream');
  },
  overflow: (state) => {
    state.grave.size = SIZE_CEILING;
    return swallow(state, food('trash'));
  },
  bossDamage: (state) => {
    spawnBoss(state, 'banshee');
    return damageBoss(state, 40, 'skullStream');
  },
  sourceKilled: (state) => {
    const piece = placeSetPiece(state);
    piece.open = true;
    return damageSetPiece(state, SET_PIECE_HP, 'skullStream');
  },
  mealAtMaxed: (state) => swallow(state, food('rich')),
};

describe('every payment into the score names its own input (design record R4)', () => {
  it('announces exactly one payment under its own name, at every one of the five inputs', () => {
    for (const [input, pay] of Object.entries(PAYERS)) {
      const state = maxedRun();

      const paid = pay(state).filter((event) => event.type === 'scorePaid');

      expect(paid, input).toHaveLength(1);
      expect(paid.map((event) => event.input)).toEqual([input]);
    }
  });

  it('carries the running total, so the ledger and the run agree at every payment', () => {
    for (const [input, pay] of Object.entries(PAYERS)) {
      const state = maxedRun();

      const paid = pay(state).filter((event) => event.type === 'scorePaid');
      const announced = paid.reduce((sum, event) => sum + event.amount, 0);

      expect(announced, input).toBeCloseTo(state.score, 10);
      expect(paid.at(-1)?.score, input).toBeCloseTo(state.score, 10);
      expect(announced, input).toBeGreaterThan(0);
    }
  });
});
