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
 * Every seed outcome pinned below is provisional: the pins are measured
 * against the combat scale standing in the tree, and any tuning ruling moves
 * seeds through these sets again. Ghoul health is 20 (#79 ruling), an exact
 * two wisps, so a maxed volley clears whole ghouls with nothing stranded.
 */

import { describe, expect, it } from 'vitest';

import { carrierRow, carriersForFullBuild } from '../../game/carriers';
import type { SimEvent } from '../../game/events';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from '../../game/lines/roster';
import { spawnMob } from '../../game/mobs';
import { OFFER_SIZE } from '../../game/offer';
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
 * birthright, and there is one: 505, at 5466 ticks.
 *
 * Re-measured for #79's measured tuning pass, which moved TERRITORY_PERIOD
 * from 500 to 832. Territory is the only line a dodger arms for free, and at
 * 832 it clears roughly 40% less traffic, so the crowd the policy can only
 * dodge through thickens until the ramp seals it.
 *
 * Re-measured for the thinned birthright (ADR 0045): Territory left the
 * birthright entirely, so a dodger now arms nothing but the skull stream and
 * the ground it used to claim is gone. 505 left the set, surviving the ramp
 * and running 9950 ticks where it sealed at 5385, and 202 and 404 seal at
 * 5442 and 5456. The direction is per seed rather than uniform because the
 * ground Territory claimed also pulled and slowed the crowd the dodger steers
 * through, so removing it reshapes each lane rather than only thinning it.
 *
 * Re-measured for carriers (ADR 0002, ADR 0048): power is no longer priced in
 * kills, so a run's build follows the schedule rather than the dodger's own
 * kill rate, and the five fresh seeds now spawn 3 to 9 drops against the 2 to
 * 4 the price table paid them. 202 and 404 left the set, surviving the ramp
 * and running 12421 and 11393 ticks, and 505 entered it, sealing at 5466 where
 * it used to run 9950. The direction is per seed rather than uniform for the
 * reason it always is here: a dodger steers off the field it is standing in,
 * so one drop swallowed at a different tick is a different run from there on.
 *
 * Re-measured for the offer of three (ADR 0034), and the set emptied: 505 left
 * it, surviving the ramp and running the full stage to victory where it sealed
 * at 5466. The cause is the offer's own shape rather than more power. A
 * carrier used to leave one body where it died, which a dodger reached only
 * when its lane already crossed that point; three bodies stand 90 units apart
 * now, so the same lane crosses one of them far more often and a dodger that
 * still never steers at food is paid several times more.
 *
 * What it measures is still this policy rather than the game: `dodgePolicy`
 * never dives, so it reads the ramp at about the weakest play the sim can
 * produce, the no-offense floor. The next played tapes judge the value
 * itself.
 */
const SEALS_IN_THE_RAMP: number[] = [];

/**
 * The seeds on which this policy never swallows anything at all, and there are
 * none.
 *
 * Re-measured for the thinned birthright (ADR 0045): 404 left the set, feeding
 * three times before it seals, and the four other seeds feed between two and
 * eight times. Territory's ground is gone, so what litters the lane now is the
 * skull stream's own kills, which fall where the column reached rather than
 * where the ground was claimed.
 *
 * Re-measured for carriers (ADR 0002): 202 left the set, feeding eight times
 * on a run that now crosses the whole stage, and the five seeds feed between
 * one and eighteen times. The set is kept rather than deleted, so the day a
 * seed stops feeding altogether this says so.
 *
 * Those swallows are incidental, which is the thing to keep in front of a
 * reader. `dodgePolicy` scores its nine moves against mobs and mob fire alone
 * and looks at neither corpses nor drops, so it never once steers toward
 * food; the lane it dodges through simply has corpses in it.
 */
const NEVER_FEEDS: number[] = [];

/**
 * The seeds whose fresh grave reaches victory on this policy, and there are
 * four: 202, 303, 404 and 505, all running the full 12421 ticks.
 *
 * Re-measured for carriers (ADR 0002, ADR 0048), which is what refilled the
 * set after #79's tuning pass emptied it. A fresh run meets the schedule's
 * carriers rather than a rising price fitted to a kill rate this policy never
 * reaches, so the same dodging run now spawns 6 and 9 drops on these two seeds
 * where the table paid it 2 to 4, and the build it stumbles into carries it
 * to the over phase. Nothing about the policy changed: it still never dives,
 * and it still swallows only what its lane happens to contain.
 *
 * Re-measured for the offer of three (ADR 0034): 404 and 505 joined it and
 * only 101 is left out, sealing at 11420 ticks in the back half. Three bodies
 * standing 90 units apart is the whole cause: a dodging lane crosses one of
 * them where it crossed the single body only by luck, so the same policy takes
 * 4 to 8 offers a run where it used to swallow 3 to 9 single drops, and the
 * builds it stumbles into carry four of the five seeds to the over phase.
 *
 * It stays a tripwire in both directions, because the assertion is an
 * equality: the day the set moves either way, this file goes red and says
 * which seed did it. What it measures is still a policy that only dodges,
 * never a hand that dives, and it is the worst case for a ladder whose upper
 * rungs a real player buys.
 */
const REACHES_VICTORY_FRESH: number[] = [202, 303, 404, 505];

/**
 * The seeds that reach victory from the size ceiling on the birthright build,
 * and today there are three: 101, 404 and 505.
 *
 * Re-measured three times in one step. For the thinned birthright (ADR 0045)
 * the set emptied: 202 left it, sealing in the back half at 12008 ticks where
 * it used to run the full 12421 and win. For freshness-scaled bursts (ADR
 * 0058) 303 entered it, running the full stage at 40 kills. For the bell's
 * cones (ADR 0036) 303 left it again, sealing at 11160 ticks and 37 kills.
 *
 * None of the three moves is a strength claim. What moves a seed is the path:
 * `dodgePolicy` steers off the field it is standing in, so one fewer volley at
 * tick 900 changes which mobs are alive at tick 901 and the two runs are
 * different runs from there on. The cones make that concrete rather than
 * likely. Of the five ceiling runs, 303 is the only one that ever owns the
 * bell at all: it tolls 31 times and now shoves 24 of them, where the table it
 * replaced pushed nothing below level 4. The four seeds that never toll did
 * not move.
 *
 * Re-measured for carriers (ADR 0002, ADR 0048) and the set refilled: 101,
 * 404 and 505 run the full 12421 ticks at 48, 51 and 48 kills, while 202 and
 * 303 seal in the back half. The cause is the same one the fresh set carries,
 * the schedule paying a dodger more than the price table did, and the same
 * path effect decides which seeds it lands on.
 *
 * Re-measured for the offer of three (ADR 0034): 303 entered and 505 left, so
 * the set is 101, 303 and 404 at 39, 86 and 54 kills. The set's size did not
 * move and its membership did, which is the path effect this comment has now
 * carried three times: a ceiling run takes only 2 to 3 offers whatever it
 * does, so which seeds land where is decided by the lane rather than by the
 * power the offer pays.
 *
 * Pinned as a constant rather than left a literal in the test, because the
 * fresh set and this one are different facts.
 */
const REACHES_VICTORY_FROM_THE_CEILING: number[] = [101, 303, 404];

/**
 * The seeds that reach victory from the size ceiling on a maxed build, and it
 * is all five, at 208 to 237 kills against 268 authored mobs.
 *
 * It exists because the ending has to be reachable by something the harness
 * can play. The birthright loadouts reach it on at most one chaotic seed and
 * reached it on none at all while the thinned birthright stood alone, and a
 * test asserting an ending is reachable over runs that cannot produce it
 * asserts nothing. So the victory half is read from the build that reaches it
 * on every seed rather than from whichever seed the dice currently carry.
 */
const REACHES_VICTORY_MAXED = [101, 202, 303, 404, 505];

const RAMP_TICKS = phaseLengthTicks(PHASES[0]);
const STAGE_TICKS = RAMP_TICKS + phaseLengthTicks(PHASES[2]);

/** Every mob the timeline authors, which is the ceiling on what any policy can meet. */
const AUTHORED_MOBS = [...RAMP_ROWS, ...BACK_HALF_ROWS].reduce(
  (total, row) => total + row.count,
  0,
);

/** Every carrier the timeline authors, which is the ceiling on what any policy can be paid. */
const AUTHORED_CARRIERS = [...RAMP_ROWS, ...BACK_HALF_ROWS].reduce(
  (total, row) => total + carrierRow(row.carries, row.count).carrying.length,
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

/**
 * One whole run at the size ceiling on a maxed build, cached the same way.
 *
 * The build is set on the run rather than reached by play, for the reason
 * wallRun sets both of its builds: this policy never dives, so it can never
 * buy a rung, and the loadout it would reach by playing is the one it started
 * with.
 */
function maxedRun(seed: number) {
  const key = `${seed}|maxed`;
  const cached = runs.get(key);
  if (cached !== undefined) return cached;
  const state = createRun(seed, SIZE_CEILING);
  for (const line of WEAPON_LINES) state.levels[line] = MAX_LEVEL;
  const execution = createExecution(state);
  const { events, ticks } = runPolicy(execution, dodgePolicy, STAGE_TICKS + 60);
  const played = { state, events, ticks, faults: execution.faults };
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

  it('reaches victory on the fresh seeds the set names, and on no others', () => {
    // Written as an equality against the pinned set rather than as "none win",
    // so it fires the day the set moves in either direction and says which seed
    // did it. It has fired both ways already, and under #79's 832-tick
    // territory period the set is empty. REACHES_VICTORY_FRESH carries the
    // fact and its cause.
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
      expect(count(events, 'offerOpened')).toBeGreaterThan(0);
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
 * there are none again.
 *
 * Re-measured for #79's 832-tick territory period: the five fresh runs land
 * 11 to 35 kills against 268 authored mobs, down from pass D's 28 to 58,
 * because the only line a dodger arms for free now lays roughly 40% less
 * often. The tripwire has fired in both directions before, which is what it
 * is for.
 *
 * Re-measured for the offer of three (ADR 0034): the five fresh runs land 66
 * to 105 kills, three times what they landed under #79 and the closest the
 * storm has come to the half, because four of the five now run the whole stage
 * on a build the offer paid them. Still short of 134 on every seed.
 */
const MEETS_THE_TIMELINE: number[] = [];

/**
 * The band the schedule asks for, and the band the storm reaches.
 *
 * The band itself moved with ADR 0002's supersession: power is metered by
 * carriers, so what a full run is asked for is no longer ADR 0013's ten to
 * twelve drops from a price table but the carriers a full build costs, which
 * `carriersForFullBuild` derives from the roster.
 *
 * What is counted moved with the offer (ADR 0034), and the count is the point
 * rather than a spelling: one carrier now opens one offer of three bodies, so
 * `dropSpawned` counts bodies and `offerOpened` counts carriers paid. The band
 * has always been about carriers, so it reads the offers. A dodger comes
 * nowhere near it: it opens 7 to 12 offers across the five fresh seeds against
 * a full build's 19, because it kills the carriers its lane happens to contain
 * and never steers at one.
 *
 * Both halves are declared expected failures again so a genuinely new break
 * cannot hide among red tests, and both are tripwires in the other direction
 * too: the day the storm reaches either band, this file goes red and asks to
 * be rewritten as ordinary assertions. The timeline half fired that tripwire
 * one way in pass B and the other way in pass C, and MEETS_THE_TIMELINE
 * carries where it stands. The schedule is not moved and the bot is not
 * improved.
 */
describe('the band the schedule asks for, and the band the storm reaches', () => {
  for (const seed of SEEDS) {
    it.fails(`kills the carriers a full build costs on seed ${seed}`, () => {
      const { events } = fullRun(seed);
      expect(count(events, 'offerOpened')).toBeGreaterThanOrEqual(
        carriersForFullBuild(),
      );
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
      // the measured minima across the five fresh runs under the offer: seed
      // 303 is lowest on kills at 66 and seed 101 lowest on offers at 7, and
      // 101 is the one seed that does not reach the over phase.
      //
      // The ceiling is the schedule itself and not a measurement: a run can
      // only be paid by carriers that exist, so no policy can ever open more
      // offers than the stage authors carriers. The bodies are three per offer
      // by construction (ADR 0034), which is asserted beside it because it is
      // the relation the whole economy is read through.
      const { events } = fullRun(seed);
      expect(count(events, 'mobKilled')).toBeGreaterThanOrEqual(66);
      expect(count(events, 'offerOpened')).toBeGreaterThanOrEqual(7);
      expect(count(events, 'offerOpened')).toBeLessThanOrEqual(
        AUTHORED_CARRIERS,
      );
      expect(count(events, 'dropSpawned')).toBe(
        OFFER_SIZE * count(events, 'offerOpened'),
      );
    });
  }
});

describe('dodgePolicy from the size ceiling', () => {
  for (const seed of SEEDS) {
    it(`ends the run one way or the other on seed ${seed}, and the test says which`, () => {
      // Every one of these was a declared expected failure before weapons
      // existed. Dispatch 4's section 5 asserted victory from the ceiling and
      // its own section 8 proved it cannot, so what is asserted here is what
      // the weapons actually do, re-measured for the bell's cones (ADR 0036):
      // all five seeds seal shut inside the back half and none reaches the
      // over phase.
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
describe('both endings across the three loadouts', () => {
  it('reaches both endings across the five seeds, so neither is unreachable', () => {
    // Victory is still dispatch 4's stub firing on the over phase, and sealed
    // shut is the real ladder. Both have to be reachable or the full-run test
    // is only ever exercising one half of the run's shape.
    //
    // Where each ending comes from moved with the thinned birthright (ADR
    // 0045) and again with freshness-scaled bursts (ADR 0058), and is recorded
    // rather than quietly re-pinned. On the birthright loadouts victory rests
    // on at most one seed and rested on none at all in between, so the maxed
    // build is read here too: an assertion that an ending is reachable, over
    // runs that cannot produce it, would pass over an empty set.
    // REACHES_VICTORY_FRESH, REACHES_VICTORY_FROM_THE_CEILING and
    // REACHES_VICTORY_MAXED carry the three facts and the cause they share.
    const endings = new Set([
      ...SEEDS.map((seed) => fullRun(seed).state.ending),
      ...SEEDS.map((seed) => fullRun(seed, SIZE_CEILING).state.ending),
      ...SEEDS.map((seed) => maxedRun(seed).state.ending),
    ]);
    expect(endings.has('victory')).toBe(true);
    expect(endings.has('sealed')).toBe(true);
  });

  it('reaches victory from a maxed build on the seeds the set names', () => {
    const winners = SEEDS.filter(
      (seed) => maxedRun(seed).state.ending === 'victory',
    );
    expect(winners).toEqual(REACHES_VICTORY_MAXED);
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
      // Both of the first two rungs are now real: overflow from a swallow pays
      // score and the ladder bleeds it first, and the run then loses a line.
      // The second rung arrived with carriers (ADR 0002): a carrier drops its
      // power where it died, which is inside the crowd this policy steers
      // into, so a policy that never dives for food still swallows one and has
      // something above the birthright to be stripped of. How many strips a
      // seed takes is path, so what is pinned is that the rung is reached and
      // that the strip floor is the birthright, which the levels below hold.
      expect(count(events, 'scoreBled')).toBe(1);
      expect(count(events, 'weaponStripped')).toBeGreaterThan(0);
      for (const line of WEAPON_LINES) {
        expect(`${line} ${state.levels[line]}`).toBe(
          `${line} ${BIRTHRIGHT.includes(line) ? 1 : 0}`,
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
    spawnMob(state, WALL_ROW.type, order, false);
  }
  return state;
}

/** Long enough for the whole curtain to fall past the grave and leave the field. */
const WALL_TICKS = 1400;

describe("the Wall's two-sided property (ADR 0042)", () => {
  for (const seed of SEEDS) {
    it(`is crossable unloaded at the floor build on seed ${seed}, and never for free`, () => {
      // The floor build is the birthright and nothing else, which is what
      // createRun starts every run at. Read off BIRTHRIGHT rather than written
      // out, so a thinner birthright moves the fixture and not the property.
      const state = wallRun(seed, false);
      for (const line of WEAPON_LINES) {
        expect(state.levels[line]).toBe(BIRTHRIGHT.includes(line) ? 1 : 0);
      }
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
