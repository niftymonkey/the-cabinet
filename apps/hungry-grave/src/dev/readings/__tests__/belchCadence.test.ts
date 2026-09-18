/**
 * The belch's rhythm (#74 story 13). The fires come out of the sim's own belch
 * against a field built to a known size, and the splash out of a swallow paid
 * into a reservoir already at capacity.
 */

import { describe, expect, it } from 'vitest';

import { BELCH_BURST_RADIUS, fireBelch } from '../../../game/belch';
import { spawnMob } from '../../../game/mobs';
import { createRun } from '../../../game/run';
import { swallow } from '../../../game/swallow';
import { RESERVOIR_CAPACITY } from '../../../game/tuning';
import type { BelchFireAcc, PressMisses } from '../belchCadence';
import {
  belchCadenceOf,
  createBelchCadence,
  observeBelchCadence,
} from '../belchCadence';

const SEED = 20260826;
const FIRE_TICK = 41;
const LIVE_SHOTS = 3;
const PAYOUT = 1;

const NO_MISSES: PressMisses = {
  notEntered: 0,
  outOfReach: 0,
  noDirection: 0,
  notPushable: 0,
};

/**
 * One press for the tests that are about the cadence rather than the frame. It
 * is built as the accumulator holds it, one shove that threw what the press
 * threw, because a fire is opened by its own first shove (#124).
 */
function fire(tick: number, shoved: number, cancelled: number): BelchFireAcc {
  return {
    tick,
    beganAt: tick,
    cancelled,
    shoves: [{ inFrame: shoved, moved: shoved, carried: 0, misses: NO_MISSES }],
  };
}

describe('belch cadence', () => {
  it('reports each belch fire with the bodies it threw and the shots it cancelled', () => {
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
        'wave',
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
        'wave',
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

    // Two bodies in the frame and both of them moved, so the press reached the
    // whole of its own frame and missed nothing (#124).
    const shove = { inFrame: 2, moved: 2, carried: 0, misses: NO_MISSES };
    expect(belchCadenceOf(accumulator).fires).toEqual([
      {
        tick: FIRE_TICK,
        beganAt: 0,
        shoved: 2,
        cancelled: LIVE_SHOTS,
        inFrame: 2,
        misses: NO_MISSES,
        // The press's own first shove, which is the only one that has gone out
        // on the tick it landed; the other two come out of the press's own
        // clock over the ninety ticks after it (#124).
        shoves: [shove],
      },
    ]);
    expect(belchCadenceOf(accumulator).frameShares).toEqual([1]);
    expect(belchCadenceOf(accumulator).misses).toEqual(NO_MISSES);
  });

  it('reports what a press missed and what it was made of, so a press that reached nothing says why', () => {
    // A press with a hundred bodies in the frame and none in reach and a press
    // with nothing alive on the field both read shoved 0, and this is what
    // tells them apart (Mark's standing rule of 2026-09-16).
    const run = createRun(SEED);
    const far = spawnMob(
      run,
      'shambler',
      {
        x: run.grave.x,
        y: run.grave.y - BELCH_BURST_RADIUS * 2,
        vx: 0,
        vy: 1,
        index: 0,
      },
      false,
      'wave',
    )!;
    far.beat = 0;
    run.reservoir = RESERVOIR_CAPACITY;
    const accumulator = createBelchCadence();

    observeBelchCadence(accumulator, FIRE_TICK, fireBelch(run), run);

    const cadence = belchCadenceOf(accumulator);
    expect(cadence.fires[0]?.shoved).toBe(0);
    expect(cadence.fires[0]?.inFrame).toBe(1);
    expect(cadence.misses).toEqual({ ...NO_MISSES, outOfReach: 1 });
    expect(cadence.frameShares).toEqual([0]);
  });

  it('leaves a press over an empty field out of the frame shares, because it had no frame', () => {
    // The interval list's own terms: a press with no body to reach has no share
    // of the field to be a share of, and averaging its zero in would read as a
    // press that failed rather than one with nothing to do.
    const run = createRun(SEED);
    run.reservoir = RESERVOIR_CAPACITY;
    const accumulator = createBelchCadence();

    observeBelchCadence(accumulator, FIRE_TICK, fireBelch(run), run);

    const cadence = belchCadenceOf(accumulator);
    expect(cadence.fires[0]?.inFrame).toBe(0);
    expect(cadence.frameShares).toEqual([]);
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
      tier: 'trash',
      treasureBody: false,
    });
    observeBelchCadence(accumulator, 2, spilling, run);

    const cadence = belchCadenceOf(accumulator);
    expect(cadence.ticksAtFull).toBe(3);
    expect(cadence.wasted).toBe(PAYOUT);
    expect(cadence.fires).toEqual([]);
  });

  it('reports the interval between fires, and none at all under two of them', () => {
    // Module test. The fire list already carried the ticks and the gap between
    // them is the cadence. One fire has nothing to be an interval from and no
    // fire has less than that, so both report an empty list rather than a zero.
    const noFires = createBelchCadence();
    expect(belchCadenceOf(noFires).intervals).toEqual([]);

    const one = createBelchCadence();
    one.fires.push(fire(40, 1, 0));
    expect(belchCadenceOf(one).intervals).toEqual([]);

    const several = createBelchCadence();
    several.fires.push(fire(40, 1, 0));
    several.fires.push(fire(220, 3, 2));
    several.fires.push(fire(300, 0, 0));
    expect(belchCadenceOf(several).intervals).toEqual([180, 80]);
  });
});
