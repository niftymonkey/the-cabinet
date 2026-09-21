/**
 * The score decomposed by the input that paid it (design record R4). The
 * payments come from the sim's own sites, driven at their seams, so the arms
 * are fed by events the game produces rather than by events a test wrote.
 */

import { describe, expect, it } from 'vitest';

import { bossPhases, damageBoss, spawnBoss } from '../../../game/bosses/phases';
import { CORPSE_HALF_EXTENT } from '../../../game/corpses';
import type { SimEvent } from '../../../game/events';
import { hitGrave } from '../../../game/grave';
import { MAX_LEVEL } from '../../../game/lines/roster';
import { MOB_TYPES, damageMob, spawnMob } from '../../../game/mobs';
import type { RunState } from '../../../game/run';
import { createRun, uniformLevels } from '../../../game/run';
import type { Swallowable } from '../../../game/swallow';
import { swallow } from '../../../game/swallow';
import {
  SIZE_CEILING,
  SIZE_FLOOR,
  TRASH_CORPSE_PAYOUT,
} from '../../../game/tuning';
import { DEFAULT_TUNING } from '../../../game/tuningRecord';
import type { ScoreByInputAcc } from '../scoreByInput';
import {
  createScoreByInput,
  observeScoreByInput,
  scoreByInputOf,
} from '../scoreByInput';

const SEED = 20260917;

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
const food = (tier: 'trash' | 'rich'): Swallowable => ({
  id: 0,
  ...LYING_STILL,
  kind: 'corpse',
  freshness: 1,
  payout: TRASH_CORPSE_PAYOUT,
  tier,
  treasureBody: false,
});

/** A run at full power and at the size floor, which is where the ladder runs. */
const maxedRun = (): RunState =>
  createRun(SEED, {
    startingSize: SIZE_FLOOR,
    startingLevels: uniformLevels(MAX_LEVEL),
  });

/** A live mob standing where it is put, past its arriving beat. */
const putMob = (state: RunState) => {
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
};

/** The reading fed one tick's events, as the graph feeds it. */
const watching = (acc: ScoreByInputAcc) => {
  return (events: readonly SimEvent[]): void => {
    observeScoreByInput(acc, events);
  };
};

describe('the score decomposed by input (design record R4)', () => {
  it('holds every point the run was paid, under the input that paid it', () => {
    const state = maxedRun();
    const acc = createScoreByInput();
    const watch = watching(acc);
    spawnBoss(state, 'banshee');

    watch(damageBoss(state, 40, 'skullStream'));
    watch(damageMob(state, putMob(state), MOB_TYPES.shambler.hp, 'bell'));
    watch(swallow(state, food('rich')));
    state.grave.size = SIZE_CEILING;
    watch(swallow(state, food('trash')));
    const reading = scoreByInputOf(acc);

    expect(reading.paid).toBeCloseTo(state.score, 10);
    expect(reading.killPaid).toBe(
      MOB_TYPES.shambler.scorePayoutInKills *
        DEFAULT_TUNING.score.trashKillScore,
    );
    expect(reading.killPayments).toBe(1);
    expect(reading.bossDamagePayments).toBe(1);
    expect(reading.mealAtMaxedPayments).toBe(1);
    expect(reading.overflowPayments).toBe(1);
    expect(reading.sourceKilledPaid).toBeNull();
    expect(reading.sourceKilledPayments).toBeNull();
  });

  it('is gross where run.score is net, so the parts fall short by what the ladder bled', () => {
    // The residual a reader would otherwise call a bug: the floor ladder bleeds
    // a capped slice of the score (ADR 0003 as amended), so in a run that hit
    // the floor the arms sum to more than the run ends holding, and the
    // difference is exactly what scoreBled reports.
    const state = maxedRun();
    const acc = createScoreByInput();
    const watch = watching(acc);

    watch(damageMob(state, putMob(state), MOB_TYPES.shambler.hp, 'bell'));
    state.grave.invulnerable = 0;
    const ladder = hitGrave(state, 'contact');
    watch(ladder);
    const bled = ladder.reduce(
      (sum, event) => (event.type === 'scoreBled' ? sum + event.amount : sum),
      0,
    );
    const reading = scoreByInputOf(acc);

    expect(bled).toBeGreaterThan(0);
    expect(reading.paid).toBeGreaterThan(state.score);
    expect(reading.paid - bled).toBeCloseTo(state.score, 10);
  });

  it('reports nothing on the boss arm for a run that never met a boss', () => {
    // On wakingSwallows.ts's own terms: a zero would say the player fought one
    // and scored nothing off it, which is a different run from this one.
    const state = maxedRun();
    const acc = createScoreByInput();

    observeScoreByInput(
      acc,
      damageMob(state, putMob(state), MOB_TYPES.shambler.hp, 'bell'),
    );
    const reading = scoreByInputOf(acc);

    expect(reading.bossDamagePaid).toBeNull();
    expect(reading.bossDamagePayments).toBeNull();
    expect(reading.sourceKilledPaid).toBeNull();
    expect(reading.killPaid).toBeGreaterThan(0);
  });

  it('reports a zero on the boss arm for a run that met one and never hurt it', () => {
    // The other half, so the absence above is read against an input that can
    // produce presence: a fight the player watched is a real zero.
    const state = maxedRun();
    const acc = createScoreByInput();
    const boss = spawnBoss(state, 'banshee');

    observeScoreByInput(acc, [
      { type: 'bossArrived', boss: boss.kind, phases: bossPhases(boss.kind) },
    ]);
    const reading = scoreByInputOf(acc);

    expect(reading.bossDamagePaid).toBe(0);
    expect(reading.bossDamagePayments).toBe(0);
  });
});
