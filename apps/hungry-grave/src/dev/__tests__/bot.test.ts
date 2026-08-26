/**
 * The deterministic headless player and the full-run test (ADR 0013).
 *
 * `clearingPolicy` is gone, so every claim here is measured against the real
 * weapon lines rather than against a rig standing in for them. What that buys
 * and what it costs are both worth stating where they are read: the numbers a
 * run produces are now the game's, and `dodgePolicy` is a dodger rather than a
 * player, so the kill rate it reaches is a lower bound on a person's and never
 * an estimate of one.
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../game/events';
import { MAX_LEVEL, WEAPON_LINES } from '../../game/lines/roster';
import { spawnMob } from '../../game/mobs';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import {
  BACK_HALF_ROWS,
  PHASES,
  phaseLengthTicks,
  RAMP_ROWS,
} from '../../game/stage/stage';
import { place } from '../../game/stage/templates';
import { RESERVOIR_CAPACITY, SIZE_CEILING } from '../../game/tuning';
import { createExecution } from '../../game/execution';
import type { Policy, PolicyRun } from '../bot';
import {
  belchingPolicy,
  dodgePolicy,
  hitTakingPolicy,
  runPolicy,
  unloadedPolicy,
} from '../bot';

/**
 * A policy run through its own authority (ADR 0017), with any fault the run
 * recorded failing the test that drove it.
 *
 * The old harness threw on a broken invariant, which is what made these runs
 * assert anything about the sim's health. A check records a fault and returns
 * now, so reading the record is what replaces the absent throw.
 */
function play(state: RunState, policy: Policy, maxTicks: number): PolicyRun {
  const execution = createExecution(state);
  const played = runPolicy(execution, policy, maxTicks);
  expect(execution.faults).toEqual([]);
  return played;
}

/** Five seeds, fixed so a failure is reproducible and never a flake. */
const SEEDS = [101, 202, 303, 404, 505];

/**
 * The seeds whose fresh run seals shut inside the ramp under the 28-unit catch
 * box.
 *
 * DROP_HALF_EXTENT rose from 8 to 14 on Mark's 2026-08-25 ruling (the pickup
 * area stays more generous than the drawn peak;
 * docs/design/drop-legibility-fix.md), so a dodging bot now collects drops it
 * used to brush past and every full-run trajectory re-rolled. The per-seed
 * outcomes in this file are re-measured under the new box and re-pinned, the
 * same way they were pinned when weapons landed.
 */
const SEALS_IN_THE_RAMP = [505];

const RAMP_TICKS = phaseLengthTicks(PHASES[0]);
const STAGE_TICKS = RAMP_TICKS + phaseLengthTicks(PHASES[2]);

/** Every mob the timeline authors, which is the ceiling on what any policy can meet. */
const AUTHORED_MOBS = [...RAMP_ROWS, ...BACK_HALF_ROWS].reduce(
  (total, row) => total + row.count,
  0,
);

/** The Wall's own row, so its property is tested against the curtain the stage really contains. */
const WALL_ROW = BACK_HALF_ROWS.find((row) => row.template === 'wall')!;

function count(events: SimEvent[], type: SimEvent['type']): number {
  return events.filter((event) => event.type === type).length;
}

function phaseOrder(events: SimEvent[]): string[] {
  return events
    .filter((event) => event.type === 'phaseChanged')
    .map((event) => (event.type === 'phaseChanged' ? event.phase : ''));
}

/**
 * One whole run of the authored stage on real weapons, computed once per seed
 * and build.
 *
 * The cache is safe because a run is a pure function of its seed and its
 * starting size, and it is necessary because a full run is a nine to twelve
 * thousand tick sim: without it this file plays the same five runs a dozen times
 * over and spends minutes doing it. Nothing here mutates the state it is handed.
 */
const runs = new Map<string, ReturnType<typeof playRun>>();

function playRun(seed: number, startingSize?: number) {
  const state = createRun(seed, startingSize);
  const execution = createExecution(state);
  const { events, ticks } = runPolicy(execution, dodgePolicy, STAGE_TICKS + 60);
  return { state, events, ticks, faults: execution.faults };
}

function fullRun(seed: number, startingSize?: number) {
  const key = `${seed}|${startingSize ?? 'fresh'}`;
  const cached = runs.get(key);
  if (cached !== undefined) return cached;
  const played = playRun(seed, startingSize);
  runs.set(key, played);
  return played;
}

describe('dodgePolicy over the whole stage (ADR 0013)', () => {
  for (const seed of SEEDS) {
    const survives = !SEALS_IN_THE_RAMP.includes(seed);
    it(`${survives ? 'survives' : 'seals shut inside'} the ramp on seed ${seed}`, () => {
      // Three of these five were declared expected failures before weapons
      // existed, and dispatch 5 is what turns them into ordinary assertions:
      // the storm cuts how long an armed mob lives, and a weaponless build
      // inflates mob fire by roughly a factor of five. SEALS_IN_THE_RAMP
      // carries the seeds the 28-unit catch box re-rolled the other way.
      const state = createRun(seed);
      play(state, dodgePolicy, RAMP_TICKS);
      if (survives) expect(state.ending).toBeNull();
      else expect(state.ending).toBe('sealed');
    });
  }

  for (const seed of SEEDS) {
    it(`crosses every phase in order on seed ${seed}`, () => {
      const { events } = fullRun(seed);
      const crossed = phaseOrder(events);
      // A run that seals inside the ramp crosses nothing at all.
      if (SEALS_IN_THE_RAMP.includes(seed)) expect(crossed).toEqual([]);
      else expect(crossed[0]).toBe('banshee');
      expect(crossed).toEqual(
        ['banshee', 'backHalf', 'undertaker', 'over'].slice(0, crossed.length),
      );
    });
  }

  it('reaches both endings across the five seeds, so neither is unreachable', () => {
    // Victory is still dispatch 4's stub firing on the over phase, and sealed
    // shut is the real ladder. Both have to be reachable or the full-run test
    // is only ever exercising one half of the run's shape, and this is the
    // first build where a fresh run reaches either by playing.
    const endings = new Set(SEEDS.map((seed) => fullRun(seed).state.ending));
    expect(endings.has('victory')).toBe(true);
    expect(endings.has('sealed')).toBe(true);
  });

  for (const seed of SEEDS) {
    it(`runs to a length inside the stage's own band on seed ${seed}`, () => {
      const { ticks } = fullRun(seed);
      if (SEALS_IN_THE_RAMP.includes(seed)) {
        expect(ticks).toBeLessThan(RAMP_TICKS);
      } else {
        expect(ticks).toBeGreaterThan(RAMP_TICKS);
      }
      expect(ticks).toBeLessThanOrEqual(STAGE_TICKS + 60);
    });
  }

  for (const seed of SEEDS) {
    it(`fires no invariant on seed ${seed}, which is the harness's own assertion`, () => {
      // A check records a fault and returns rather than throwing (ADR 0024),
      // so what the run recorded is read rather than the absence of a throw.
      // The tick count is what says the run really ran, and a seed that seals
      // inside the ramp still has to have run that far.
      expect(fullRun(seed).faults).toEqual([]);
      expect(fullRun(seed).ticks).toBeGreaterThan(
        SEALS_IN_THE_RAMP.includes(seed) ? 0 : RAMP_TICKS,
      );
    });
  }

  for (const seed of SEEDS) {
    it(`makes kills, corpses and swallows on seed ${seed}, all from real weapons`, () => {
      const { events } = fullRun(seed);
      const kills = count(events, 'mobKilled');
      expect(kills).toBeGreaterThan(0);
      expect(kills).toBeLessThanOrEqual(AUTHORED_MOBS);
      expect(count(events, 'swallowed')).toBeGreaterThan(0);
      expect(count(events, 'grew')).toBeGreaterThan(0);
      expect(count(events, 'dropSpawned')).toBeGreaterThan(0);
    });
  }
});

/**
 * ADR 0013 asks a full run to land ten to twelve drops, and it does not.
 *
 * Measured on real weapons across the five seeds: 23 to 42 kills and 3 to 5
 * drops, against a price table fitted to 268 authored mobs. The table is doing
 * exactly what it was derived to do, because 29 kills buys 4 drops off it; what
 * is far below the derivation is the kill rate, at roughly a tenth of the
 * timeline rather than the six-in-ten the ten-drop figure was fitted against.
 *
 * The cause is named rather than guessed at. `dodgePolicy` maximizes clearance
 * and never aims, the birthright stream is one 8-unit column pouring straight up
 * from wherever the grave happens to be, and the loop that would fix it is
 * bootstrapped: kills buy drops, drops buy columns, columns buy kills. A dodging
 * bot never enters it, and a drop it does not dive for scrolls away.
 *
 * These are declared expected failures rather than left red so a genuinely new
 * break cannot hide among them, and they are a tripwire in the other direction
 * too: the day the storm or the bot reaches the band, this file goes red and
 * asks to be rewritten as ordinary assertions. The price table is not moved and
 * the bot is not improved, both of which dispatch 5's plan forbids by name.
 */
describe('the band ADR 0013 asks for, and the band the storm reaches', () => {
  for (const seed of SEEDS) {
    it.fails(`lands ten to twelve drops on seed ${seed}`, () => {
      const { events } = fullRun(seed);
      const drops = count(events, 'dropSpawned');
      expect(drops).toBeGreaterThanOrEqual(10);
      expect(drops).toBeLessThanOrEqual(12);
    });
  }

  for (const seed of SEEDS) {
    it.fails(`meets most of the authored timeline on seed ${seed}`, () => {
      const { events } = fullRun(seed);
      expect(count(events, 'mobKilled')).toBeGreaterThan(AUTHORED_MOBS / 2);
    });
  }

  for (const seed of SEEDS) {
    it(`stays inside the range the storm actually reaches on seed ${seed}`, () => {
      // The ordinary half, so a regression away from today's figures is caught
      // while the band above stays the thing being aimed at. The floors are
      // the measured minima across the five seeds under the 28-unit catch box
      // (SEALS_IN_THE_RAMP carries the ruling): seed 505 now seals at twelve
      // kills and two drops.
      const { events } = fullRun(seed);
      expect(count(events, 'mobKilled')).toBeGreaterThanOrEqual(12);
      expect(count(events, 'dropSpawned')).toBeGreaterThanOrEqual(2);
    });
  }
});

describe('dodgePolicy from the size ceiling', () => {
  for (const seed of SEEDS) {
    it(`ends the run one way or the other on seed ${seed}, and the test says which`, () => {
      // Every one of these was a declared expected failure before weapons
      // existed. Dispatch 4's section 5 asserted victory from the ceiling and
      // its own section 8 proved it cannot, so what is asserted here is what
      // the weapons actually do, re-measured under the 28-unit catch box
      // (SEALS_IN_THE_RAMP carries the ruling): seed 101 reaches the over
      // phase and the other four seal shut inside the back half.
      const { state, events } = fullRun(seed, SIZE_CEILING);
      const reached = phaseOrder(events);
      if (seed === 101) {
        expect(reached).toContain('over');
        expect(state.ending).toBe('victory');
        return;
      }
      expect(reached).toContain('backHalf');
      expect(reached).not.toContain('over');
      expect(state.ending).toBe('sealed');
    });
  }
});

describe("hitTakingPolicy walks ADR 0003's ladder", () => {
  for (const seed of SEEDS) {
    it(`reaches sealed shut from a grown grave on seed ${seed}`, () => {
      // From the ceiling rather than from a fresh grave: size stops reading as
      // health above roughly forty, so a bot that started fresh would measure a
      // three-hit opening and report on a regime the player spends twenty
      // seconds in.
      const state = createRun(seed, SIZE_CEILING);
      const { events } = play(state, hitTakingPolicy, RAMP_TICKS);

      expect(state.ending).toBe('sealed');
      expect(count(events, 'sealed')).toBe(1);
      expect(count(events, 'graveHit')).toBeGreaterThan(10);
      // The first rung is now real: overflow from a swallow pays score, and the
      // ladder bleeds it before anything else. The second rung is not reached,
      // because a policy that steers into the nearest threat collects nothing
      // and no line ever rises above the birthright it cannot be stripped below.
      expect(count(events, 'scoreBled')).toBe(1);
      expect(count(events, 'weaponStripped')).toBe(0);
      for (const line of WEAPON_LINES) {
        expect(`${line} ${state.levels[line]}`).toBe(
          `${line} ${['soulStream', 'headstones'].includes(line) ? 1 : 0}`,
        );
      }
    });
  }
});

/**
 * The Wall, built from its own row on a quiet stage.
 *
 * ADR 0016 makes the set piece a property rather than a cast, and the property
 * is two-sided over build strength: crossable unloaded has to hold at the
 * weakest build a run can produce and never crossable for free has to hold at
 * the strongest. Whatever five seeds happen to roll is neither, so both builds
 * are set on the run rather than left to the dice.
 */
function wallRun(seed: number, loaded: boolean): RunState {
  const state = createRun(seed, loaded ? SIZE_CEILING : undefined);
  state.stage.firedRows = RAMP_ROWS.length;
  if (loaded) {
    for (const line of WEAPON_LINES) state.levels[line] = MAX_LEVEL;
    state.reservoir = RESERVOIR_CAPACITY;
  }
  for (const order of place(
    WALL_ROW.template,
    WALL_ROW.count,
    state.streams.spawns,
  )) {
    spawnMob(state, WALL_ROW.type, order);
  }
  return state;
}

/** Long enough for the whole curtain to fall past the grave and leave the field. */
const WALL_TICKS = 1400;

describe("the Wall's two-sided property (ADR 0016)", () => {
  for (const seed of SEEDS) {
    it(`is crossable unloaded at the floor build on seed ${seed}, and never for free`, () => {
      // The floor build is the birthright and nothing else, which is what
      // createRun starts every run at.
      const state = wallRun(seed, false);
      expect(state.levels).toEqual({
        soulStream: 1,
        headstones: 1,
        wisps: 0,
        bell: 0,
      });
      const before = state.grave.size;
      const { events } = play(state, unloadedPolicy, WALL_TICKS);

      expect(state.ending).toBeNull();
      expect(state.mobs.filter((mob) => mob.alive)).toHaveLength(0);
      expect(count(events, 'belched')).toBe(0);
      // The cost, which is the half of the property that stops the curtain
      // becoming comfortable.
      expect(count(events, 'graveHit')).toBeGreaterThan(0);
      expect(state.grave.size).toBeLessThan(before);
    });
  }

  for (const seed of SEEDS) {
    it(`is crossed clean by a loaded belch at the ceiling build on seed ${seed}`, () => {
      const state = wallRun(seed, true);
      const before = state.grave.size;
      const { events } = play(state, belchingPolicy, WALL_TICKS);

      expect(state.ending).toBeNull();
      expect(state.mobs.filter((mob) => mob.alive)).toHaveLength(0);
      expect(count(events, 'belched')).toBeGreaterThan(0);
      expect(count(events, 'graveHit')).toBe(0);
      expect(state.grave.size).toBe(before);
    });
  }
});

describe("the drain-out's property (plan 6.29)", () => {
  for (const seed of SEEDS) {
    it(`leaves the field empty at every phase boundary on seed ${seed}`, () => {
      // The grave is held immortal for the same reason the stage's own timeline
      // tests hold it: this is a property of the rows and the storm, and a
      // grave ground down inside the back half would stop the clock before the
      // boundary being measured. The storm still fires the whole way.
      const state = createRun(seed);
      // One authority across the whole loop, because a fresh one per tick
      // would put a fresh stage watch on every tick and the two stage
      // invariants would compare against nothing.
      const execution = createExecution(state);
      const budget = STAGE_TICKS + 120;
      const atBoundary: string[] = [];
      for (let tick = 0; tick < budget; tick++) {
        const { events } = runPolicy(execution, dodgePolicy, 1);
        state.grave.size = 40;
        state.ending = null;
        const alive = state.mobs.filter((mob) => mob.alive).length;
        for (const event of events) {
          if (event.type !== 'phaseChanged') continue;
          atBoundary.push(`${event.phase}=${alive}`);
        }
      }
      expect(execution.faults).toEqual([]);
      expect(atBoundary).toEqual([
        'banshee=0',
        'backHalf=0',
        'undertaker=0',
        'over=0',
      ]);
    });
  }
});
