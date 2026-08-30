/**
 * What a run holds when it starts. The starting size is here rather than in the
 * URL parser because ADR 0003's floor and ceiling are the rules layer's to
 * defend, and hitGrave is the only other thing that changes size at all.
 */

import { describe, expect, it } from 'vitest';

import { CORPSE_CAP, MOB_CAP, MOB_FIRE_CAP } from '../caps';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from '../lines/roster';
import { createRun, uniformLevels } from '../run';
import { SIZE_CEILING, SIZE_FLOOR, SIZE_START } from '../tuning';

describe('createRun', () => {
  it('starts at SIZE_START when no starting size is asked for', () => {
    expect(createRun(1).grave.size).toBe(SIZE_START);
  });

  it('takes a starting size inside the bounds exactly as given', () => {
    expect(createRun(1, SIZE_FLOOR).grave.size).toBe(SIZE_FLOOR);
    expect(createRun(1, SIZE_CEILING).grave.size).toBe(SIZE_CEILING);
    expect(createRun(1, 40).grave.size).toBe(40);
  });

  it('clamps a starting size below the floor and above the ceiling', () => {
    expect(createRun(1, SIZE_FLOOR - 10).grave.size).toBe(SIZE_FLOOR);
    expect(createRun(1, 0).grave.size).toBe(SIZE_FLOOR);
    expect(createRun(1, SIZE_CEILING + 10).grave.size).toBe(SIZE_CEILING);
    expect(createRun(1, 10_000).grave.size).toBe(SIZE_CEILING);
  });

  it('pre-allocates every pool at full capacity, with nothing alive', () => {
    const run = createRun(1);
    expect(run.mobs).toHaveLength(MOB_CAP);
    expect(run.mobFire).toHaveLength(MOB_FIRE_CAP);
    expect(run.corpses).toHaveLength(CORPSE_CAP);
    expect(run.mobs.some((mob) => mob.alive)).toBe(false);
    expect(run.mobFire.some((shot) => shot.alive)).toBe(false);
    expect(run.corpses.some((corpse) => corpse.alive)).toBe(false);
    expect(run.nextEntityId).toBeGreaterThan(0);
  });

  it('starts the stage at its first phase', () => {
    const run = createRun(1);
    expect(run.stage).toEqual({ phaseIndex: 0, phaseTick: 0, firedRows: 0 });
  });

  it('starts at the birthright when no levels are asked for', () => {
    const run = createRun(1);
    for (const line of WEAPON_LINES) {
      expect(run.levels[line]).toBe(BIRTHRIGHT.includes(line) ? 1 : 0);
    }
  });

  it("takes starting levels exactly as given, so a tape's header can rebuild a pinned run", () => {
    const pinned = createRun(1, undefined, uniformLevels(MAX_LEVEL));
    for (const line of WEAPON_LINES) {
      expect(pinned.levels[line]).toBe(MAX_LEVEL);
    }

    const uneven = createRun(1, undefined, {
      soulStream: 2,
      territory: 0,
      wisps: 4,
      bell: 1,
    });
    expect(uneven.levels).toEqual({
      soulStream: 2,
      territory: 0,
      wisps: 4,
      bell: 1,
    });
  });

  it('copies the given levels rather than aliasing them, because the rules mutate them in place', () => {
    const given = uniformLevels(3);
    const run = createRun(1, undefined, given);

    run.levels.bell = 5;

    expect(given.bell).toBe(3);
  });

  it("spells the loadout pin's shape: every line at one level", () => {
    expect(uniformLevels(2)).toEqual({
      soulStream: 2,
      territory: 2,
      wisps: 2,
      bell: 2,
    });
  });
});
