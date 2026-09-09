/**
 * The belch's rhythm (#74 story 13). The fires come out of the sim's own belch
 * against a field built to a known size, and the splash out of a swallow paid
 * into a reservoir already at capacity.
 */

import { describe, expect, it } from 'vitest';

import { fireBelch } from '../../../game/belch';
import { spawnMob } from '../../../game/mobs';
import { createRun } from '../../../game/run';
import { swallow } from '../../../game/swallow';
import { RESERVOIR_CAPACITY } from '../../../game/tuning';
import {
  belchCadenceOf,
  createBelchCadence,
  observeBelchCadence,
} from '../belchCadence';

const SEED = 20260826;
const FIRE_TICK = 41;
const LIVE_SHOTS = 3;
const PAYOUT = 1;

describe('belch cadence', () => {
  it('reports each belch fire with the mobs it killed and the shots it cancelled', () => {
    // Story 13: a wipe that landed on a curtain reads differently from one
    // spent on empty sky, so kills and cancels stay two counts.
    // Both mobs stand inside the burst, which is what a belch kills since ADR
    // 0008's split, and both are past their arriving beat so the kill lands.
    const run = createRun(SEED);
    const near = [
      spawnMob(
        run,
        'shambler',
        {
          x: run.grave.x - 30,
          y: run.grave.y - 40,
          vx: 0,
          vy: 1,
          index: 0,
        },
        false,
      )!,
      spawnMob(
        run,
        'ghoul',
        {
          x: run.grave.x + 30,
          y: run.grave.y - 40,
          vx: 0,
          vy: 1,
          index: 1,
        },
        false,
      )!,
    ];
    for (const mob of near) mob.beat = 0;
    for (let slot = 0; slot < LIVE_SHOTS; slot++) {
      const shot = run.mobFire[slot];
      if (shot === undefined) throw new Error(`no mobFire pool slot ${slot}`);
      shot.alive = true;
    }
    run.reservoir = RESERVOIR_CAPACITY;
    const accumulator = createBelchCadence();

    observeBelchCadence(accumulator, FIRE_TICK, fireBelch(run), run);

    expect(belchCadenceOf(accumulator).fires).toEqual([
      { tick: FIRE_TICK, killed: 2, cancelled: LIVE_SHOTS },
    ]);
  });

  it('counts the ticks the reservoir sat at capacity and the charge splashed past full', () => {
    // Story 13's other half: hoarding is ticks spent armed and doing nothing,
    // starving is charge that went over the side (ADR 0008).
    const run = createRun(SEED);
    run.reservoir = RESERVOIR_CAPACITY;
    const accumulator = createBelchCadence();

    observeBelchCadence(accumulator, 0, [], run);
    observeBelchCadence(accumulator, 1, [], run);
    const spilling = swallow(run, {
      id: 1,
      kind: 'corpse',
      freshness: 1,
      payout: PAYOUT,
    });
    observeBelchCadence(accumulator, 2, spilling, run);

    const cadence = belchCadenceOf(accumulator);
    expect(cadence.ticksAtFull).toBe(3);
    expect(cadence.wasted).toBe(PAYOUT);
    expect(cadence.fires).toEqual([]);
  });
});
