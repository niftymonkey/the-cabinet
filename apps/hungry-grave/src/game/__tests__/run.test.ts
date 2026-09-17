/**
 * What a run holds when it starts. The starting size is here rather than in the
 * URL parser because ADR 0003's floor and ceiling are the rules layer's to
 * defend, and hitGrave is the only other thing that changes size at all.
 */

import { describe, expect, it } from 'vitest';

import { capsFor } from '../caps';
import { STARTING_DIRECTOR } from '../director';
import type { WeaponLine } from '../lines/roster';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from '../lines/roster';
import type { RunState, StartingConditions } from '../run';
import { createRun, uniformLevels } from '../run';
import { SIGNAL_RAN_LIVE } from '../signalLock';
import { PROCESSION_PURSE } from '../stage/waves';
import { SIZE_CEILING, SIZE_FLOOR, SIZE_START } from '../tuning';
import { DEFAULT_TUNING } from '../tuningRecord';
import type { TuningRecord } from '../tuningRecord';

// The caps every run at this tip derives, which is the default record's.
const DEFAULT_CAPS = capsFor(DEFAULT_TUNING);

/** The default record with the director's shortest wait moved, and nothing else. */
function quietMinimumOf(seconds: number): TuningRecord {
  return {
    ...DEFAULT_TUNING,
    stage: { ...DEFAULT_TUNING.stage, quietIntervalMinimumSeconds: seconds },
  };
}

describe('createRun', () => {
  it('starts at SIZE_START when no starting size is asked for', () => {
    expect(createRun(1).grave.size).toBe(SIZE_START);
  });

  it('takes a starting size inside the bounds exactly as given', () => {
    expect(createRun(1, { startingSize: SIZE_FLOOR }).grave.size).toBe(
      SIZE_FLOOR,
    );
    expect(createRun(1, { startingSize: SIZE_CEILING }).grave.size).toBe(
      SIZE_CEILING,
    );
    expect(createRun(1, { startingSize: 40 }).grave.size).toBe(40);
  });

  it('clamps a starting size below the floor and above the ceiling', () => {
    expect(createRun(1, { startingSize: SIZE_FLOOR - 10 }).grave.size).toBe(
      SIZE_FLOOR,
    );
    expect(createRun(1, { startingSize: 0 }).grave.size).toBe(SIZE_FLOOR);
    expect(createRun(1, { startingSize: SIZE_CEILING + 10 }).grave.size).toBe(
      SIZE_CEILING,
    );
    expect(createRun(1, { startingSize: 10_000 }).grave.size).toBe(
      SIZE_CEILING,
    );
  });

  it('pre-allocates every pool at full capacity, with nothing alive', () => {
    const run = createRun(1);
    expect(run.mobs).toHaveLength(DEFAULT_CAPS.mobs);
    expect(run.mobFire).toHaveLength(DEFAULT_CAPS.mobFire);
    expect(run.corpses).toHaveLength(DEFAULT_CAPS.corpses);
    expect(run.mobs.some((mob) => mob.alive)).toBe(false);
    expect(run.mobFire.some((shot) => shot.alive)).toBe(false);
    expect(run.corpses.some((corpse) => corpse.alive)).toBe(false);
    expect(run.nextEntityId).toBeGreaterThan(0);
  });

  it('carries the tuning record it started under, resolved to the default when none is asked for', () => {
    // The record rides on the starting conditions the way every other starting
    // condition does (ADR 0063, ADR 0064): optional for a caller, required on
    // the resolved record, and never written again once the run is built.
    expect(createRun(1).conditions.tuning).toEqual(DEFAULT_TUNING);
    const quick = quietMinimumOf(1);
    expect(createRun(1, { tuning: quick }).conditions.tuning).toEqual(quick);
  });

  it('derives its own three caps from the record it started under', () => {
    // The caps are per-run derivations now and the run carries the answers, so
    // a reader takes the run's field rather than a module constant (ADR 0056
    // as amended).
    expect(createRun(1).caps).toEqual(DEFAULT_CAPS);
    const quick = quietMinimumOf(1);
    expect(createRun(1, { tuning: quick }).caps).toEqual(capsFor(quick));
  });

  it('builds every pool at the caps the run derived, whatever record it started under', () => {
    // What the caps are for: a run started under a record the default does not
    // name holds pools of its own size, which is a thing nothing in the tree
    // could say while a pool was built at a module constant.
    const run = createRun(1, { tuning: quietMinimumOf(1) });
    expect(run.mobs).toHaveLength(run.caps.mobs);
    expect(run.mobFire).toHaveLength(run.caps.mobFire);
    expect(run.corpses).toHaveLength(run.caps.corpses);
    expect(run.caps.mobs).toBeGreaterThan(DEFAULT_CAPS.mobs);
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
    const pinned = createRun(1, { startingLevels: uniformLevels(MAX_LEVEL) });
    for (const line of WEAPON_LINES) {
      expect(pinned.levels[line]).toBe(MAX_LEVEL);
    }

    const uneven = createRun(1, {
      startingLevels: {
        skullStream: 2,
        territory: 0,
        wisps: 4,
        bell: 1,
      },
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
    const run = createRun(1, { startingLevels: given });

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
    const run = createRun(1, { roster });
    expect([...run.roster]).toEqual([...roster]);
    expect(run.levels.wisps).toBe(0);
    for (const line of BIRTHRIGHT) expect(run.levels[line]).toBe(1);
  });

  it('copies the given roster rather than aliasing the caller list', () => {
    const given: WeaponLine[] = [...BIRTHRIGHT];
    const run = createRun(1, { roster: given });

    given.push('bell');

    expect([...run.roster]).toEqual([...BIRTHRIGHT]);
  });

  it('starts holding nothing when no starting score is asked for', () => {
    // Every caller in the tree names none, so the default is what a run has
    // always started at and the parameter changes no run that ships.
    expect(createRun(1).score).toBe(0);
    expect(
      createRun(1, {
        startingSize: SIZE_FLOOR,
        startingLevels: uniformLevels(MAX_LEVEL),
      }).score,
    ).toBe(0);
  });

  it('starts holding the score it was asked for, and nothing else about the run differs', () => {
    // The harness stages the floor ladder from a run that already holds a
    // score (design record R4), and a staged start is a number the sim takes
    // rather than a rig-aware branch inside it.
    const held = createRun(1, { startingScore: 6000 });

    expect(held.score).toBe(6000);
    // The streams are left out of the comparison because they hold closures,
    // which toEqual compares by identity (docs/lessons.md, the sim). The score
    // is taken out of the record as well as off the run: the record is what the
    // run was started from, so the one asked-for number reads in both places
    // and neither is "something else about the run".
    const exceptScore = (run: ReturnType<typeof createRun>) => ({
      ...run,
      score: 0,
      conditions: { ...run.conditions, startingScore: 0 },
      streams: null,
    });
    expect(exceptScore(held)).toEqual(exceptScore(createRun(1)));
  });
});

/**
 * The starting condition as one record (ADR 0063). Every promise here is read
 * off the run rather than off the record handed in, because the record is the
 * claim and the run is what actually happened.
 */
describe("a run's starting conditions", () => {
  // What the run resolved, read off the run's own live state.
  const conditionsOn = (run: RunState) => ({
    startingSize: run.grave.size,
    startingLevels: { ...run.levels },
    roster: [...run.roster],
    signalLock: run.director.signal.lock,
    startingScore: run.score,
  });

  /**
   * The record without its tuning row, which is the part live state can be read
   * back against. The tuning record decides the caps and, from slice 5 on, what
   * the readers of its rows do, so what the run holds of it is the caps beside
   * it rather than a second spelling inside the live state.
   */
  const exceptTuning = (conditions: StartingConditions) => ({
    startingSize: conditions.startingSize,
    startingLevels: conditions.startingLevels,
    roster: conditions.roster,
    signalLock: conditions.signalLock,
    startingScore: conditions.startingScore,
  });

  it('rolls the birthright run when only a seed is named, and says so in its record', () => {
    // The whole of what createRun(seed) means: a fresh run, and a record that
    // states every one of the six rather than leaving any implicit (ADR 0027).
    const run = createRun(1);

    expect(run.conditions).toEqual({
      startingSize: SIZE_START,
      startingLevels: run.levels,
      roster: WEAPON_LINES,
      signalLock: SIGNAL_RAN_LIVE,
      startingScore: 0,
      tuning: DEFAULT_TUNING,
    });
    expect(exceptTuning(run.conditions)).toEqual(conditionsOn(run));
    expect(run.caps).toEqual(capsFor(run.conditions.tuning));
  });

  it('resolves every field a partial leaves out to the default a bare run resolves', () => {
    // One test per field, as six partials naming one thing each: what is
    // pinned takes, and nothing else moves off the bare run's own record.
    const bare = createRun(1).conditions;
    const roster: readonly WeaponLine[] = [...BIRTHRIGHT];
    const named = [
      { startingSize: SIZE_FLOOR },
      { startingLevels: uniformLevels(MAX_LEVEL) },
      { roster },
      { signalLock: 0.25 },
      { startingScore: 6000 },
      { tuning: quietMinimumOf(2) },
    ];

    for (const one of named) {
      const run = createRun(1, one);
      expect(run.conditions).toEqual({ ...bare, ...one });
      expect(exceptTuning(run.conditions)).toEqual(conditionsOn(run));
    }
  });

  it('resolves the birthright out of the roster a partial names, and not out of the whole pool', () => {
    // The one field whose default is read off another field (ADR 0046): a
    // birthright line outside the roster is not fielded, so a partial naming a
    // roster alone cannot resolve the levels of a run it is not playing.
    const run = createRun(1, { roster: ['skullStream'] });

    expect(run.conditions.startingLevels).toEqual({
      skullStream: 1,
      territory: 0,
      wisps: 0,
      bell: 0,
    });
  });

  it('starts from every one of the five facts a whole record states', () => {
    const stated = {
      startingSize: SIZE_FLOOR,
      startingLevels: uniformLevels(MAX_LEVEL),
      roster: [...BIRTHRIGHT, 'bell'] as readonly WeaponLine[],
      signalLock: 0.5,
      startingScore: 6000,
    };

    const run = createRun(1, stated);

    expect(conditionsOn(run)).toEqual(stated);
    expect(run.director.signal.value).toBe(0.5);
  });

  it('records the size the grave took, so a record never states a size the run did not start at', () => {
    // ADR 0027: what is recorded is resolved, and ADR 0003's bounds are
    // grave.ts's. A record echoing the asked-for figure would say a run began
    // somewhere it never was.
    const run = createRun(1, { startingSize: 0 });

    expect(run.conditions.startingSize).toBe(SIZE_FLOOR);
    expect(run.conditions.startingSize).toBe(run.grave.size);
  });

  it('holds what the run started from while the run moves on', () => {
    // The record is a starting condition and never live state, which is what
    // lets a header read it off the run at any tick (ADR 0063).
    const run = createRun(1, { startingLevels: uniformLevels(2) });

    run.levels.bell = 5;
    run.score = 900;
    run.grave.size = SIZE_CEILING;

    expect(run.conditions.startingLevels).toEqual(uniformLevels(2));
    expect(run.conditions.startingScore).toBe(0);
    expect(run.conditions.startingSize).toBe(SIZE_START);
  });
});
