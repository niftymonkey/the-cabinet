/**
 * The deterministic headless player and the full-run test (ADR 0013).
 *
 * `clearingPolicy` is gone, so every claim here is measured against the real
 * weapon lines rather than against a rig standing in for them. What that buys
 * and what it costs are both worth stating where they are read: the numbers a
 * run produces are now the game's, and `dodgePolicy` is a dodger rather than a
 * player, so the kill rate it reaches is a lower bound on a person's and never
 * an estimate of one.
 *
 * Every seed outcome pinned below is provisional, and the reason is one open
 * number rather than a general disclaimer. The pins are measured against the
 * combat scale standing in the tree, and that scale has a known unsettled
 * corner: ghoul health 24 is not a multiple of wisp damage 10, so a maxed volley
 * clears three ghouls where the touch counts say four. The candidate fix is held
 * until after the playtest, and settling it will move seeds through these sets
 * again.
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
 * The seeds whose fresh run seals shut inside the ramp on the current
 * birthright, and there are none again.
 *
 * Re-measured for #76 pass D, which cut Territory's opening beat from 90 ticks
 * to 68 and decoupled the scan's lead from it at 150. Both pull the same way
 * on a policy whose only weapon that fires for free is Territory: the ground
 * is claimed further up-field, and it opens while the crowd is still walking
 * in rather than around a crowd already standing on it. Seed 404 was the one
 * seal at 5389 ticks and now runs the full 12421 and wins, and it is the seed
 * that moved furthest, from 14 kills to 58.
 *
 * What it measures is still this policy rather than the game: `dodgePolicy`
 * never dives, so it reads the ramp at about the weakest play the sim can
 * produce. The set is left here empty rather than deleted, so the day a seed
 * seals inside the ramp again this says which one.
 */
const SEALS_IN_THE_RAMP: number[] = [];

/**
 * The seeds on which this policy never swallows anything at all, and there are
 * none again.
 *
 * Re-measured after #76 pass D's delivery slice: every seed feeds, 1 to 20
 * times. 404 was briefly in this set two slices ago, when it sealed early with
 * nothing crossed; it now runs the whole stage and is the seed that feeds
 * most.
 *
 * Those swallows are incidental, which is the thing to keep in front of a
 * reader. `dodgePolicy` scores its nine moves against mobs and mob fire alone
 * and looks at neither corpses nor drops, so it never once steers toward
 * food; the line simply litters the lane it dodges through.
 */
const NEVER_FEEDS: number[] = [];

/**
 * The seeds whose fresh grave reaches victory on this policy, and there are two
 * of them.
 *
 * The cause is the tuning pass itself rather than a break. Territory is the
 * only line a dodger arms for free, and #76 pass D changed where its ground
 * lands: the lead is no longer the opening beat, so the scan aims 150 ticks
 * ahead of a mob instead of 68 and the ground opens up-field of the crowd
 * rather than around it. Ground that is already waiting catches a mob for its
 * whole crossing, and fresh kills rose from 14 to 43 across the five seeds to
 * 28 to 58. 303 and 404 crossed to victory on that; 202, which won on the
 * slice before, now seals at 10277.
 *
 * It stays a tripwire in both directions, because the assertion is an
 * equality: the day the set moves either way, this file goes red and says
 * which seed did it. What it measures is still a policy that only dodges,
 * never a hand that dives, and it is the worst case for a ladder whose upper
 * rungs a real player buys.
 */
const REACHES_VICTORY_FRESH: number[] = [303, 404];

/**
 * The seeds that reach victory from the size ceiling on this policy, which is
 * three of the five.
 *
 * Re-measured after #79's mounted streams: parallel columns hold the storm
 * within the mouth's own width at every range, so a ceiling grave's storm
 * covers one fixed slice of the field where it used to widen with distance,
 * and the ceiling loadout pays the most for that because its five columns
 * reached widest. 101, 303 and 404 still go the full 12421 ticks and win, at
 * 44 to 85 kills; 202 still seals at 10982, and 505, a winner before the
 * geometry moved, now seals at 11196 with 54 kills.
 *
 * Pinned as a constant rather than left a literal in the test, because the
 * fresh set and this one are different facts.
 */
const REACHES_VICTORY_FROM_THE_CEILING = [101, 303, 404];

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
      // carries the seeds that go the other way: its comment is where that is
      // measured.
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

  it('two fresh graves reach victory on this policy, and the test names the set', () => {
    // Written as an equality against the pinned set rather than as "none win",
    // so it fires the day the set moves in either direction and says which seed
    // did it. It has fired both ways already, and after #76 pass D's delivery
    // slice the set holds 303 and 404. REACHES_VICTORY_FRESH carries the fact
    // and its cause.
    const winners = SEEDS.filter(
      (seed) => fullRun(seed).state.ending === 'victory',
    );
    expect(winners).toEqual(REACHES_VICTORY_FRESH);
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
    it(`makes kills and drops on seed ${seed}, all from real weapons`, () => {
      const { events } = fullRun(seed);
      const kills = count(events, 'mobKilled');
      expect(kills).toBeGreaterThan(0);
      expect(kills).toBeLessThanOrEqual(AUTHORED_MOBS);
      expect(count(events, 'dropSpawned')).toBeGreaterThan(0);
      // Feeding is something every seed does again, and NEVER_FEEDS is left
      // empty rather than deleted so the day one stops, this says so. A corpse
      // still lands wherever Territory or the stream killed the mob rather than
      // at the grave's own rim, and this policy still never drives to food; the
      // autonomous line simply litters the lane with enough corpses that a
      // dodging grave crosses one. Growth follows feeding exactly, so it is asserted on the
      // same seeds and no others.
      const fed = !NEVER_FEEDS.includes(seed);
      expect(count(events, 'swallowed') > 0).toBe(fed);
      expect(count(events, 'grew') > 0).toBe(fed);
    });
  }
});

/**
 * The seeds whose fresh run kills more than half the authored timeline, and
 * after #76 pass C there are none again.
 *
 * Re-measured after pass D's delivery slice: the five fresh runs land 28 to 58
 * kills against 268 authored mobs, where pass B's ladder reached 80 to 157 and
 * cleared the half on 303 and 505. The tripwire has now fired in both directions, which is
 * what it is for. The delivery slice bought back half of what pass C's dwell
 * ladder took, and it is still nowhere near the half.
 */
const MEETS_THE_TIMELINE: number[] = [];

/**
 * ADR 0013 asks a full run to land ten to twelve drops, and it does not.
 *
 * Re-measured after #76 pass D's delivery slice: 3 to 6 drops across the five
 * fresh seeds against the same price table,
 * against a price table fitted to 268 authored mobs. What holds the band off
 * is the table's rising prices against runs that stop feeding drops back into
 * columns, and a dodging bot never dives for the drops it does spawn.
 *
 * Both halves are declared expected failures again so a genuinely new break
 * cannot hide among red tests, and both are tripwires in the other direction
 * too: the day the storm reaches either band, this file goes red and asks to
 * be rewritten as ordinary assertions. The timeline half fired that tripwire
 * one way in pass B and the other way in pass C, and MEETS_THE_TIMELINE
 * carries where it stands. The price table is not moved and the bot is not
 * improved, both of which dispatch 5's plan forbids by name.
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
    const meets = MEETS_THE_TIMELINE.includes(seed);
    const test = meets ? it : it.fails;
    test(`${meets ? 'meets' : 'falls short of'} most of the authored timeline on seed ${seed}`, () => {
      const { events } = fullRun(seed);
      expect(count(events, 'mobKilled')).toBeGreaterThan(AUTHORED_MOBS / 2);
    });
  }

  for (const seed of SEEDS) {
    it(`stays inside the range the storm actually reaches on seed ${seed}`, () => {
      // The ordinary half, so a regression away from today's figures is caught
      // while the band above stays the thing being aimed at. The floors are
      // the measured minima across the five fresh runs after #76 pass D's
      // delivery slice: seed 101 is lowest on both at 28 kills and 3 drops,
      // and it is now the shortest run of the five rather than the one seal.
      const { events } = fullRun(seed);
      expect(count(events, 'mobKilled')).toBeGreaterThanOrEqual(28);
      expect(count(events, 'dropSpawned')).toBeGreaterThanOrEqual(3);
    });
  }
});

describe('dodgePolicy from the size ceiling', () => {
  for (const seed of SEEDS) {
    it(`ends the run one way or the other on seed ${seed}, and the test says which`, () => {
      // Every one of these was a declared expected failure before weapons
      // existed. Dispatch 4's section 5 asserted victory from the ceiling and
      // its own section 8 proved it cannot, so what is asserted here is what
      // the weapons actually do, re-measured after #79's mounted streams:
      // three of the five seeds reach the over phase and win, and two seal
      // shut inside the back half.
      // REACHES_VICTORY_FROM_THE_CEILING is where that set is pinned and where
      // its cause is written down.
      const { state, events } = fullRun(seed, SIZE_CEILING);
      const reached = phaseOrder(events);
      if (REACHES_VICTORY_FROM_THE_CEILING.includes(seed)) {
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

/**
 * The claim that spans both loadouts, read after both of them have run.
 *
 * It sits below the two loadout suites rather than inside either one, for what
 * is really a single reason: it is a property of the run's shape rather than of
 * one starting size, and every run it reads has by this point already been paid
 * for by a suite that had its own reason to play it. Declared any earlier, one
 * `it` would bill itself five whole-stage simulations that nothing else had
 * warmed, which is a real cost landing in the wrong place rather than a slow
 * test.
 */
describe('both endings across the two loadouts', () => {
  it('reaches both endings across the five seeds, so neither is unreachable', () => {
    // Victory is still dispatch 4's stub firing on the over phase, and sealed
    // shut is the real ladder. Both have to be reachable or the full-run test
    // is only ever exercising one half of the run's shape.
    //
    // Where each ending comes from moved again with #76 pass C's dwell slice
    // and is recorded rather than quietly re-pinned. Two fresh seeds and four
    // ceiling seeds reach victory, so the victory half of this property rests
    // on six runs out of ten and the sealed half on the other four, which is
    // the thinner of the two now. REACHES_VICTORY_FRESH and
    // REACHES_VICTORY_FROM_THE_CEILING carry both facts and the cause they
    // share. Both loadouts are read here so the property is about the run's
    // shape rather than about which starting size happens to reach it.
    const endings = new Set([
      ...SEEDS.map((seed) => fullRun(seed).state.ending),
      ...SEEDS.map((seed) => fullRun(seed, SIZE_CEILING).state.ending),
    ]);
    expect(endings.has('victory')).toBe(true);
    expect(endings.has('sealed')).toBe(true);
  });
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
          `${line} ${['soulStream', 'territory'].includes(line) ? 1 : 0}`,
        );
      }
    });
  }
});

/**
 * The Wall, built from its own row on a quiet stage.
 *
 * ADR 0042 makes the set piece a property rather than a cast, and the property
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

describe("the Wall's two-sided property (ADR 0042)", () => {
  for (const seed of SEEDS) {
    it(`is crossable unloaded at the floor build on seed ${seed}, and never for free`, () => {
      // The floor build is the birthright and nothing else, which is what
      // createRun starts every run at.
      const state = wallRun(seed, false);
      expect(state.levels).toEqual({
        soulStream: 1,
        territory: 1,
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
