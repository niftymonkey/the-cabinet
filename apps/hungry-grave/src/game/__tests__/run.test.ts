/**
 * What a run holds when it starts. The starting size is here rather than in the
 * URL parser because ADR 0003's floor and ceiling are the rules layer's to
 * defend, and hitGrave is the only other thing that changes size at all.
 */

import { describe, expect, it } from 'vitest';

import { CORPSE_CAP, MOB_CAP, MOB_FIRE_CAP } from '../caps';
import { STARTING_DIRECTOR } from '../director';
import type { WeaponLine } from '../lines/roster';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from '../lines/roster';
import { createRun, uniformLevels } from '../run';
import { PROCESSION_PURSE } from '../stage/waves';
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

  it('starts the stage at its first section', () => {
    const run = createRun(1);
    expect(run.stage).toEqual({
      sectionIndex: 0,
      sectionTick: 0,
      firedWaves: 0,
    });
  });

  it("starts the director at its module's value, with the opening section's purse in it", () => {
    // The state lives on RunState so the witness folds it (ADR 0047), and the
    // module owns what it starts as. The purse is the one field a section
    // grants rather than the module: enterNextSection grants it at every
    // crossing, and a run begins already inside the first section, so the
    // opening one is granted here.
    expect(createRun(1).director).toEqual({
      ...STARTING_DIRECTOR,
      purseLeft: PROCESSION_PURSE,
      // Silent for the tick it was granted on, which is the rule every section
      // boundary takes and which the run's own opening is (stage.ts's
      // directorGranted).
      quietUntilTick: 1,
    });
  });

  it("starts the wisps' volley clock at zero, unlike the always-on clocks", () => {
    // The other three are timers running from the first tick; the wisps fire on
    // a swallow, so a run's first swallow has to fire (ADR 0058 as amended).
    const run = createRun(1);
    expect(run.lines.volleyIn).toBe(0);
    expect(run.lines.streamIn).toBeGreaterThan(0);
    expect(run.lines.tollIn).toBeGreaterThan(0);
    expect(run.lines.layIn).toBeGreaterThan(0);
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
      skullStream: 2,
      territory: 0,
      wisps: 4,
      bell: 1,
    });
    expect(uneven.levels).toEqual({
      skullStream: 2,
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
      skullStream: 2,
      territory: 2,
      wisps: 2,
      bell: 2,
    });
  });

  it('fields the whole pool when no roster is asked for, at the birthright levels', () => {
    // ADR 0046: a run fields a roster drawn from the pool. Nothing unlocks
    // anything yet, so every run's roster is the whole pool, and the interface
    // is what this slice buys rather than a visible change.
    const run = createRun(1);
    expect([...run.roster]).toEqual([...WEAPON_LINES]);
    for (const line of WEAPON_LINES) {
      expect(run.levels[line]).toBe(BIRTHRIGHT.includes(line) ? 1 : 0);
    }
  });

  it('carries a smaller roster and holds the lines outside it at zero', () => {
    const roster: readonly WeaponLine[] = [...BIRTHRIGHT, 'bell'];
    const run = createRun(1, undefined, undefined, roster);
    expect([...run.roster]).toEqual([...roster]);
    expect(run.levels.wisps).toBe(0);
    for (const line of BIRTHRIGHT) expect(run.levels[line]).toBe(1);
  });

  it('copies the given roster rather than aliasing the caller list', () => {
    const given: WeaponLine[] = [...BIRTHRIGHT];
    const run = createRun(1, undefined, undefined, given);

    given.push('bell');

    expect([...run.roster]).toEqual([...BIRTHRIGHT]);
  });

  it('starts holding nothing when no starting score is asked for', () => {
    // Every caller in the tree names none, so the default is what a run has
    // always started at and the parameter changes no run that ships.
    expect(createRun(1).score).toBe(0);
    expect(createRun(1, SIZE_FLOOR, uniformLevels(MAX_LEVEL)).score).toBe(0);
  });

  it('starts holding the score it was asked for, and nothing else about the run differs', () => {
    // The harness stages the floor ladder from a run that already holds a
    // score (design record R4), and a staged start is a number the sim takes
    // rather than a rig-aware branch inside it.
    const held = createRun(1, undefined, undefined, undefined, undefined, 6000);

    expect(held.score).toBe(6000);
    // The streams are left out of the comparison because they hold closures,
    // which toEqual compares by identity (docs/lessons.md, the sim).
    const exceptScore = (run: ReturnType<typeof createRun>) => ({
      ...run,
      score: 0,
      streams: null,
    });
    expect(exceptScore(held)).toEqual(exceptScore(createRun(1)));
  });
});
