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

import { damageBoss, spawnBoss } from '../../game/bosses/chunks';
import { carrierRow, carriersForFullBuild } from '../../game/carriers';
import { TICK_HZ } from '../../game/clock';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../game/field';
import type { SimEvent } from '../../game/events';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from '../../game/lines/roster';
import {
  GHOUL_DESCENT_FLOOR,
  MOB_TYPES,
  MOB_TYPE_NAMES,
  spawnMob,
  SPAWN_MARGIN,
} from '../../game/mobs';
import { OFFER_SIZE } from '../../game/offer';
import type { RunState } from '../../game/run';
import { createRun, uniformLevels } from '../../game/run';
import { CROWD_ROWS, PROCESSION_ROWS, VIGIL_ROWS } from '../../game/stage/rows';
import { PHASES } from '../../game/stage/stage';
import { place } from '../../game/stage/templates';
import {
  RESERVOIR_CAPACITY,
  SCROLL_SPEED,
  SIZE_CEILING,
} from '../../game/tuning';
import { createExecution, executeTick } from '../../game/execution';
import type { Policy, PolicyRun } from '../bot';
import {
  belchingPolicy,
  bestMoveToward,
  divingPolicy,
  dodgePolicy,
  hitTakingPolicy,
  LOOKAHEAD_SAMPLES,
  nearestFood,
  runPolicy,
  unloadedPolicy,
  waitingPolicy,
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
 * The seeds whose fresh run seals shut inside the opening section on the
 * current birthright, and there are none.
 *
 * Every measurement before the last one was taken while that section was the
 * ramp, and each says so in its own words: the ramp is the phase the three
 * named sections renamed the Procession (ADR 0050), and it is 120 seconds of
 * rows where the ramp was 122.
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
 * Re-measured for the three named sections (ADR 0049, ADR 0050) and the set
 * stayed empty: all five survive the Procession, which owns emptiness and puts
 * 55 bodies on the field where the ramp put 101.
 *
 * What it measures is still this policy rather than the game: `dodgePolicy`
 * never dives, so it reads the section at about the weakest play the sim can
 * produce, the no-offense floor. The next played tapes judge the value
 * itself.
 */
const SEALS_IN_THE_PROCESSION: number[] = [];

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
 * The seeds whose fresh run is never paid a carrier at all, and there is one:
 * 505.
 *
 * Measured for the Banshee (ADR 0007). A fresh run now ends inside her phase or
 * just past it rather than crossing the whole stage, so a dodger is paid only
 * by the carriers the Procession's own lane happened to cross: 0 to 4 offers
 * against the 1 to 4 it took over the whole stage before her. 505 crosses none
 * of them.
 *
 * Kept as an equality in both places that read it, so the day 505 is paid again
 * this file goes red and says so.
 */
const NEVER_PAID: number[] = [505];

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
 * Re-measured for the three named sections (ADR 0049, ADR 0050): 202 and 303
 * left it and the set is 404 and 505. The stage runs 21000 ticks of authored
 * rows where it ran 12421, and the Procession owns emptiness, so a dodger that
 * is paid only by the carriers its own lane crosses now takes 1 to 4 offers a
 * run against the 4 to 8 the old ramp and back half handed it. The three seeds
 * that fall out seal at 9938, 20330 and 10673 ticks rather than dying early:
 * they run out of grave over a longer stage on a thinner build.
 *
 * Re-measured for the sparse last row and the per-phase end condition
 * (ADR 0051): 202 and 303 came back and 505 left, so the set is 202, 303 and
 * 404, running 21166, 21641 and 20812 ticks at 58, 65 and 118 kills. 101 seals
 * at 13355 in the Crowd and 505 at 15988 in the Waking. The cause is the path
 * rather than the power, which is what it always is here: a boundary now falls
 * on the tick the field clears rather than on a count, so it lands a few
 * seconds either side of where it used to and a dodger steering off the field
 * it stands in is somewhere else from there on. What did move for everyone is
 * length, by the two sparse rows and by the Waking waiting for the trash the
 * Crowd hands it.
 *
 * It stays a tripwire in both directions, because the assertion is an
 * equality: the day the set moves either way, this file goes red and says
 * which seed did it. What it measures is still a policy that only dodges,
 * never a hand that dives, and it is the worst case for a ladder whose upper
 * rungs a real player buys.
 *
 * Re-measured for the Banshee (ADR 0007), and the set emptied. She is the first
 * boundary in the game that is a fight, and this policy only dodges: it has no
 * build to kill her with and nothing about her rings is hard enough to kill it,
 * so a fresh run neither wins nor dies. Three of the five seeds do empty her,
 * on the birthright storm alone and in ten to fifteen thousand ticks, and then
 * run out of budget inside the Crowd; the other two are still in her phase when
 * the budget ends. **This is the loss of headless coverage the Banshee costs
 * the birthright loadouts**, and what replaces it for the whole stage is the
 * maxed set below, which the plan's own verification step 7 names as the only
 * way a headless run crosses a boss at all.
 */
const REACHES_VICTORY_FRESH: number[] = [];

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
 * Re-measured for the three named sections (ADR 0049, ADR 0050): 404 left and
 * 202 entered, so the set is 101 and 202. The stage is now nine minutes rather
 * than three and a half and the section it opens with owns emptiness, so a
 * dodger meets far less traffic early and a ceiling run has three times as long
 * to be ground down; the two seeds that still win are the two whose lanes pay
 * them an offer before the Crowd, at 5 and 12 offers against 0 to 2 on the
 * three that seal.
 *
 * Re-measured for the sparse last row and the per-phase end condition
 * (ADR 0051): 404 entered it and nothing left, so the set is 101, 202 and 404,
 * running 21575, 21526 and 21087 ticks. 303 and 505 seal in the Crowd at 13697
 * and 14522. It is the same cause as the fresh set's above, a boundary that
 * falls where the field empties rather than where a count ran out, and the
 * same standing warning applies: a moved seed here is a moved path and never a
 * strength claim.
 *
 * Re-measured for the Banshee (ADR 0007), and the set emptied for the same
 * cause the fresh set carries: a policy that only dodges has nothing to kill a
 * boss with. It is starker from the ceiling than from a fresh grave, because a
 * bigger grave takes more of her rings and none of the five seeds empties her
 * at all; every one of them is still in her phase when the budget ends, which
 * is what the test below now reads rather than an ending.
 *
 * Pinned as a constant rather than left a literal in the test, because the
 * fresh set and this one are different facts.
 */
const REACHES_VICTORY_FROM_THE_CEILING: number[] = [];

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
 *
 * Re-measured for the Banshee (ADR 0007) and it did not move, all five seeds,
 * which is the whole reason it exists: a maxed build empties her and a
 * birthright one does not. What did move is how long they take, 22000 to 48000
 * ticks against 21000 before her, and the spread is her fight rather than the
 * rows. That spread is the harness's own input at step 4: a maxed dodger spends
 * one to seven minutes on a boss authored for forty-five seconds, because it
 * never parks under her and its storm reaches her only when its dodging
 * happens to.
 *
 * Re-measured for the Undertaker (ADR 0052) and it did not move either: all
 * five still reach victory, and victory now means his death rather than a phase
 * a stub fell through. The runs run 26000 to 52000 ticks, and what his fight
 * costs is 3600 to 4800 of them on every seed. That tightness beside her spread
 * is the second thing step 4 reads here: he is fought where the Vigil has left
 * the field nearly empty, so a dodger stands in front of him and its storm
 * lands, and 3600 ticks is a minute against the minute and a half ADR 0052
 * authored, on the strongest build in the game.
 */
const REACHES_VICTORY_MAXED = [101, 202, 303, 404, 505];

/**
 * The longest a body can take to leave the field, in ticks: the whole distance
 * one can cross at the slowest total descent any type holds, which is the
 * scroll plus its own speed. Every term is read from the mob table and the
 * field, so the bound follows them.
 */
const SLOWEST_DESCENT_TICKS =
  (FIELD_HEIGHT +
    SPAWN_MARGIN +
    Math.max(...MOB_TYPE_NAMES.map((type) => MOB_TYPES[type].halfHeight))) /
  (SCROLL_SPEED +
    Math.min(
      MOB_TYPES.shambler.speed,
      MOB_TYPES.revenant.speed,
      GHOUL_DESCENT_FLOOR,
    ));

/** How long one phase can hold a run: its own rows, then whatever they left falling. */
const budgetOf = (phase: (typeof PHASES)[number]): number =>
  (phase.rows.length === 0 ? 0 : phase.rows[phase.rows.length - 1].t) *
    TICK_HZ +
  SLOWEST_DESCENT_TICKS;

/**
 * How long a run may take to cross the Procession, and then the whole stage.
 *
 * They are budgets rather than lengths. A phase ends on its own condition now
 * (ADR 0051), so a hand that kills the stragglers meets the boss sooner and no
 * two runs are the same length; what can be written down is the ceiling.
 */
const PROCESSION_TICKS = Math.ceil(budgetOf(PHASES[0]));
const STAGE_TICKS = Math.ceil(
  PHASES.reduce((total, each) => total + budgetOf(each), 0),
);

/**
 * How long a maxed run may play, which is a different question from the one
 * above and has a different answer now that a boundary is a fight.
 *
 * The authored ceiling covers the rows and what they leave falling, and a fight
 * is neither: it is the boss's health against whatever the hand puts on it. A
 * maxed dodger crosses the whole stage in 22000 to 48000 ticks against the
 * 27000 the rows alone bound, and the spread is the fight. So the maxed run
 * gets three times the authored ceiling, which is a budget above the worst of
 * the five and never a prediction of any of them.
 *
 * The birthright runs keep the authored ceiling on purpose: they do not empty a
 * boss at all, so a larger budget would buy them nothing but minutes.
 */
const MAXED_RUN_TICKS = STAGE_TICKS * 3;

/** Every mob the timeline authors, which is the ceiling on what any policy can meet. */
const AUTHORED_MOBS = [...PROCESSION_ROWS, ...CROWD_ROWS, ...VIGIL_ROWS].reduce(
  (total, row) => total + row.count,
  0,
);

/** Every carrier the timeline authors, which is the ceiling on what any policy can be paid. */
const AUTHORED_CARRIERS = [
  ...PROCESSION_ROWS,
  ...CROWD_ROWS,
  ...VIGIL_ROWS,
].reduce(
  (total, row) => total + carrierRow(row.carries, row.count).carrying.length,
  0,
);

/** The Wall's own row, so its property is tested against the curtain the stage really contains. */
const WALL_ROW = CROWD_ROWS.find((row) => row.template === 'wall')!;

function count(events: SimEvent[], type: SimEvent['type']): number {
  return events.filter((event) => event.type === type).length;
}

/** The phases a run crosses, which is every phase after the one it starts in. */
const PHASE_ORDER: readonly string[] = [
  'banshee',
  'crowd',
  'waking',
  'vigil',
  'undertaker',
  'over',
];

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
  const state = createRun(seed, SIZE_CEILING, uniformLevels(MAX_LEVEL));
  const execution = createExecution(state);
  const { events, ticks } = runPolicy(execution, dodgePolicy, MAXED_RUN_TICKS);
  const played = { state, events, ticks, faults: execution.faults };
  runs.set(key, played);
  return played;
}

/**
 * One run under the policy written to reach sealed shut, cached the way the
 * whole-stage runs are because two suites read it: the ladder's own, and the
 * claim that both endings are reachable.
 *
 * From the ceiling rather than from a fresh grave: size stops reading as health
 * above roughly forty, so a bot that started fresh would measure a three-hit
 * opening and report on a regime the player spends twenty seconds in.
 */
const sealedRuns = new Map<number, { state: RunState; events: SimEvent[] }>();

function sealedRun(seed: number): { state: RunState; events: SimEvent[] } {
  const cached = sealedRuns.get(seed);
  if (cached !== undefined) return cached;
  const state = createRun(seed, SIZE_CEILING);
  const { events } = play(state, hitTakingPolicy, PROCESSION_TICKS);
  const played = { state, events: [...events] };
  sealedRuns.set(seed, played);
  return played;
}

/**
 * The budget for the five tests that each pay for one whole-stage run nothing
 * else has warmed, one per seed. A fresh run of the stage takes about a second
 * with this file alone and 5.2 to 5.8 seconds beside the rest of the suite,
 * which is over vitest's own five seconds, so which of the five falls over
 * changes from run to run and every failure is a timeout rather than an
 * assertion. Stated per test in this file's own idiom rather than raised for
 * the suite, because contention is not flakiness and every other test in this
 * suite reads the run these five cached.
 */
const ONE_WHOLE_STAGE_MS = 30000;

describe('dodgePolicy over the whole stage (ADR 0013)', () => {
  for (const seed of SEEDS) {
    const survives = !SEALS_IN_THE_PROCESSION.includes(seed);
    it(`${survives ? 'survives' : 'seals shut inside'} the Procession on seed ${seed}`, () => {
      // Three of these five were declared expected failures before weapons
      // existed, and dispatch 5 is what turns them into ordinary assertions:
      // the storm cuts how long an armed mob lives, and a weaponless build
      // inflates mob fire by roughly a factor of five. SEALS_IN_THE_PROCESSION
      // carries the seeds that go the other way: its comment is where that is
      // measured.
      const state = createRun(seed);
      play(state, dodgePolicy, PROCESSION_TICKS);
      if (survives) expect(state.ending).toBeNull();
      else expect(state.ending).toBe('sealed');
    });
  }

  for (const seed of SEEDS) {
    it(
      `crosses every phase in order on seed ${seed}`,
      () => {
        const { events } = fullRun(seed);
        const crossed = phaseOrder(events);
        // A run that seals inside the Procession crosses nothing at all.
        if (SEALS_IN_THE_PROCESSION.includes(seed)) expect(crossed).toEqual([]);
        else expect(crossed[0]).toBe('banshee');
        expect(crossed).toEqual(PHASE_ORDER.slice(0, crossed.length));
      },
      ONE_WHOLE_STAGE_MS,
    );
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
      if (SEALS_IN_THE_PROCESSION.includes(seed)) {
        expect(ticks).toBeLessThan(PROCESSION_TICKS);
      } else {
        expect(ticks).toBeGreaterThan(PROCESSION_TICKS);
      }
      expect(ticks).toBeLessThanOrEqual(STAGE_TICKS + 60);
    });
  }

  for (const seed of SEEDS) {
    it(`fires no invariant on seed ${seed}, which is the harness's own assertion`, () => {
      // A check records a fault and returns rather than throwing (ADR 0024),
      // so what the run recorded is read rather than the absence of a throw.
      // The tick count is what says the run really ran, and a seed that seals
      // inside the Procession still has to have run that far.
      expect(fullRun(seed).faults).toEqual([]);
      expect(fullRun(seed).ticks).toBeGreaterThan(
        SEALS_IN_THE_PROCESSION.includes(seed) ? 0 : PROCESSION_TICKS,
      );
    });
  }

  for (const seed of SEEDS) {
    it(`makes kills and drops on seed ${seed}, all from real weapons`, () => {
      const { events } = fullRun(seed);
      const kills = count(events, 'mobKilled');
      expect(kills).toBeGreaterThan(0);
      expect(kills).toBeLessThanOrEqual(AUTHORED_MOBS);
      // Whether a dodging lane crosses a carrier at all is a fact about the
      // seed rather than about the weapons, and NEVER_PAID is where it is
      // measured and where its cause is written down.
      expect(count(events, 'offerOpened') > 0).toBe(!NEVER_PAID.includes(seed));
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
 * on a build the offer paid them.
 *
 * Re-measured for the three named sections (ADR 0049, ADR 0050): the five fresh
 * runs land 20 to 112 kills against 357 authored mobs, so the half moved from
 * 134 to 178 while what the storm reaches fell. The stage grew by half again
 * and the section it opens with owns emptiness, so the same dodger meets fewer
 * bodies per minute and three of the five seal before the Vigil. Still short of
 * 178 on every seed.
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
      // while the band above stays the thing being aimed at. The kill floor is
      // the measured minimum across the five fresh runs, and it fell from 20 to
      // 11 with the Banshee (ADR 0007): a fresh run spends the rest of itself
      // in a fight it cannot finish rather than crossing two more sections of
      // rows, so what the storm meets is most of one section and not most of a
      // stage. Whether a run is paid at all is a per-seed fact and is read off
      // NEVER_PAID rather than as a floor.
      //
      // The ceiling is the schedule itself and not a measurement: a run can
      // only be paid by carriers that exist, so no policy can ever open more
      // offers than the stage authors carriers. The bodies are three per offer
      // by construction (ADR 0034), which is asserted beside it because it is
      // the relation the whole economy is read through.
      const { events } = fullRun(seed);
      expect(count(events, 'mobKilled')).toBeGreaterThanOrEqual(11);
      expect(count(events, 'offerOpened') > 0).toBe(!NEVER_PAID.includes(seed));
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
    it(`is held in the Banshee's fight on seed ${seed}, ending neither way`, () => {
      // Every one of these was a declared expected failure before weapons
      // existed. Dispatch 4's section 5 asserted victory from the ceiling and
      // its own section 8 proved it cannot, so what is asserted here is what
      // the weapons actually do.
      //
      // Re-measured for the Banshee (ADR 0007), and what it says moved with
      // her. A ceiling grave on the birthright reaches her phase on every seed
      // and then stops: it has no build to empty her with, and her rings at
      // this size take it nowhere near the floor, so the run neither wins nor
      // seals. That is asserted as an equality on the phases crossed rather
      // than as an ending, so the day a ceiling run gets past her this file
      // goes red and says which seed did it.
      // REACHES_VICTORY_FROM_THE_CEILING carries the set and its cause.
      const { state, events } = fullRun(seed, SIZE_CEILING);
      const reached = phaseOrder(events);
      if (REACHES_VICTORY_FROM_THE_CEILING.includes(seed)) {
        expect(reached).toContain('over');
        expect(state.ending).toBe('victory');
        return;
      }
      expect(reached).toEqual(['banshee']);
      expect(state.ending).toBeNull();
      // Still standing in front of her rather than parked on an empty field,
      // which is what makes the two above a statement about the fight.
      expect(state.boss?.kind).toBe('banshee');
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
/**
 * The budget for the one test that pays for five whole-stage runs nothing else
 * has warmed. A whole stage is 21000 ticks of authored rows since the three
 * named sections landed (ADR 0049), half again what it was, and five maxed runs
 * of it no longer fit inside vitest's own five seconds. It is stated on the one
 * test rather than raised for the suite, because a budget belongs on the test
 * that pays the cost and says what that test is paying for.
 */
const FIVE_MAXED_RUNS_MS = 30000;

describe('both endings across the three loadouts', () => {
  it(
    'reaches victory from a maxed build on the seeds the set names',
    () => {
      const winners = SEEDS.filter(
        (seed) => maxedRun(seed).state.ending === 'victory',
      );
      expect(winners).toEqual(REACHES_VICTORY_MAXED);

      // And it is his death that ends it rather than a phase index: the two
      // fall on one tick, and the run recorded no fault reaching them
      // (ADR 0007, and the plan's own whole-run pass criterion).
      for (const seed of winners) {
        const { events, faults } = maxedRun(seed);
        const victory = events.filter((event) => event.type === 'victory');
        const killed = events.filter(
          (event) => event.type === 'bossKilled' && event.boss === 'undertaker',
        );
        expect(`${seed} ${victory.length} ${killed.length}`).toBe(
          `${seed} 1 1`,
        );
        expect(`${seed} ${faults.length}`).toBe(`${seed} 0`);
        const at = events.indexOf(killed[0]);
        expect(`${seed} ${events.indexOf(victory[0]) > at}`).toBe(
          `${seed} true`,
        );
      }
    },
    FIVE_MAXED_RUNS_MS,
  );

  it('reaches both endings across the five seeds, so neither is unreachable', () => {
    // Victory is the Undertaker's own death now and sealed shut is the real
    // ladder. Both have to be reachable or the full-run test is only ever
    // exercising one half of the run's shape.
    //
    // Where each ending comes from moved with the thinned birthright (ADR
    // 0045) and again with freshness-scaled bursts (ADR 0058), and is recorded
    // rather than quietly re-pinned. On the birthright loadouts victory rests
    // on at most one seed and rested on none at all in between, so the maxed
    // build is read here too: an assertion that an ending is reachable, over
    // runs that cannot produce it, would pass over an empty set.
    // REACHES_VICTORY_FRESH, REACHES_VICTORY_FROM_THE_CEILING and
    // REACHES_VICTORY_MAXED carry the three facts and the cause they share.
    //
    // Moved again for the Banshee (ADR 0007), and the same rule made it move:
    // no dodging birthright run ends at all now, either way, because it can
    // neither empty her nor be emptied by her. So the sealed half is read off
    // the policy written to reach it rather than off a dodger that used to be
    // ground down before the Vigil, which is the honest source for it and the
    // one the ladder's own suite below already plays.
    const endings = new Set([
      ...SEEDS.map((seed) => maxedRun(seed).state.ending),
      ...SEEDS.map((seed) => sealedRun(seed).state.ending),
    ]);
    expect(endings.has('victory')).toBe(true);
    expect(endings.has('sealed')).toBe(true);
  });
});

/**
 * The seeds on which the hit-taking policy loses a weapon level before it
 * seals, and there are none.
 *
 * Measured for the three named sections (ADR 0049, ADR 0050), where the set
 * emptied. It used to hold every seed: the old ramp put a carrier in its first
 * two rows, so a policy that steers into fire swallowed one inside eight
 * seconds and had a rung above the birthright to be stripped of. The Procession
 * owns emptiness and its first two rows are the Drips that teach the swallow
 * and the tell, neither of which carries, so its first carrier stands at t=21
 * and this policy has sealed shut at tick 1132 by then, on every seed and with
 * nineteen hits taken. Re-measured with both endings landed and still empty,
 * because nothing in that slice touched the Procession.
 *
 * The rung is not gone from the game, only from a birthright run's reach: what
 * takes a level away is a hit landing on a run that bought one, and buying one
 * is a dive. ADR 0003's whole ladder in order is re-established in
 * src/__tests__/endings.test.ts, where this same policy walks every rung inside
 * the Undertaker's fight on a run pinned above the birthright. Kept as an
 * equality rather than deleted, so the day a seed reaches the rung here this
 * file goes red and says which.
 */
const STRIPS_A_RUNG: number[] = [];

/**
 * The build the whole ladder is walked under, and the score it brings.
 *
 * A rung is only strippable if the run bought one, and this policy cannot buy
 * anything: it steers into fire rather than at food. Score arrives only as
 * overflow from a swallow at the size ceiling, and a grave that dives is off
 * the ceiling long before a fight pays it anything, so both are pinned on the
 * run as arrival conditions. Level two rather than five because the storm has
 * to leave the fight standing while the grave is ground down: a full build
 * empties a chunk faster than the boss's pattern reaches the floor, and a fight
 * that ends in victory cannot also seal. The same two pins and the same reasons
 * carry src/__tests__/endings.test.ts's own walk of the ladder; what is read
 * here is that the policy walks it across the seeds rather than on one.
 */
const LADDER_LEVEL = 2;
const LADDER_SCORE = 1200;

/** How long a pinned fight is given to grind a grave to the floor. */
const LADDER_TICKS = 6000;

/**
 * One run of the policy inside the stage's last fight, pinned above the
 * birthright with score on it.
 *
 * It stands in the fight rather than playing to it because no birthright run
 * crosses the stage headlessly at all (ADR 0007), so a run that played there
 * would measure what got it there and never the ladder.
 */
function ladderRun(seed: number): { state: RunState; rungs: string[] } {
  const state = createRun(seed, SIZE_CEILING, uniformLevels(LADDER_LEVEL));
  state.stage.phaseIndex = PHASES.findIndex(
    (phase) => phase.boss === 'undertaker',
  );
  const execution = createExecution(state);
  spawnBoss(state, 'undertaker');
  state.score = LADDER_SCORE;
  const rungs: string[] = [];
  let caused: SimEvent[] = [];
  for (let tick = 0; tick < LADDER_TICKS && state.ending === null; tick++) {
    const events = executeTick(execution, hitTakingPolicy(state, caused));
    caused = [...events];
    for (const event of events) {
      if (
        event.type === 'scoreBled' ||
        event.type === 'weaponStripped' ||
        event.type === 'sealed'
      ) {
        rungs.push(event.type);
      }
    }
  }
  return { state, rungs };
}

describe("hitTakingPolicy walks ADR 0003's ladder", () => {
  it('reaches sealed shut through the whole ladder on the seeds it is played on', () => {
    // ADR 0003: "hits bleed score first, then weapon levels down to the
    // birthright loadout, and only when nothing is left to bleed does the next
    // hit seal the grave shut." Reachable inside a fight is the half the stage
    // only gained when both bosses became real, and it is read across the seeds
    // here rather than on the one endings.test.ts drives.
    const walked = SEEDS.map((seed) => ({ seed, ...ladderRun(seed) }));

    for (const { seed, state, rungs } of walked) {
      expect(`${seed} ${state.ending}`).toBe(`${seed} sealed`);
      expect(`${seed} ${rungs[0]}`).toBe(`${seed} scoreBled`);
      expect(`${seed} ${rungs.at(-1)}`).toBe(`${seed} sealed`);
      expect(rungs.indexOf('weaponStripped')).toBeGreaterThan(
        rungs.indexOf('scoreBled'),
      );
      expect(rungs.indexOf('weaponStripped')).toBeLessThan(
        rungs.indexOf('sealed'),
      );
      // The floor a level falls to is the birthright, whatever the build was.
      for (const line of WEAPON_LINES) {
        expect(`${seed} ${line} ${state.levels[line]}`).toBe(
          `${seed} ${line} ${BIRTHRIGHT.includes(line) ? 1 : 0}`,
        );
      }
    }
  });

  for (const seed of SEEDS) {
    it(`reaches sealed shut from a grown grave on seed ${seed}`, () => {
      // The run is the cached one sealedRun plays, which is where the choice of
      // a ceiling grave is written down.
      const { state, events } = sealedRun(seed);

      expect(state.ending).toBe('sealed');
      expect(count(events, 'sealed')).toBe(1);
      expect(count(events, 'graveHit')).toBeGreaterThan(10);
      // The first rung is real and is asserted outright: overflow from a
      // swallow pays score and the ladder bleeds it before anything else.
      // Whether the second rung is reached is a fact about this policy on this
      // stage rather than about the ladder, so it is pinned as a set, and
      // STRIPS_A_RUNG is where it is measured and where its cause is written
      // down. The floor a level falls to is the birthright either way, which
      // the levels below hold.
      expect(count(events, 'scoreBled')).toBe(1);
      expect(count(events, 'weaponStripped') > 0).toBe(
        STRIPS_A_RUNG.includes(seed),
      );
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
  // The curtain is placed by hand, so the stage is stood in the last phase of
  // the table, the one phase the machine never leaves. Marking a phase's rows
  // fired silences that phase alone: a phase ends now on its rows being spent
  // and its field clearing (ADR 0051), so the tick the curtain finishes falling
  // would roll the run into the next section and its rows.
  state.stage.phaseIndex = PHASES.length - 1;
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

describe('the sparse last row and its two boundaries (ADR 0051)', () => {
  for (const seed of SEEDS) {
    it(`meets each boss on an empty field and the set piece in traffic on seed ${seed}`, () => {
      // The grave is held immortal for the same reason the stage's own timeline
      // tests hold it: this is a property of the rows and the storm, and a
      // grave ground down inside the Crowd would stop the clock before the
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
        // Whatever boss arrives is emptied by the rig rather than by the hand,
        // for the same reason the grave is held immortal: what is being
        // measured is what the rows put on the field at a boundary, and this
        // policy only dodges, so a real fight would hold the run at the first
        // boundary and none of the five below would ever be reached. How long
        // a fight takes is the boss modules' own tests' subject.
        if (state.boss !== null) {
          damageBoss(state, state.boss.hp, BIRTHRIGHT[0]);
        }
        const alive = state.mobs.filter((mob) => mob.alive).length;
        for (const event of events) {
          if (event.type !== 'phaseChanged') continue;
          atBoundary.push(`${event.phase}=${alive}`);
        }
      }
      expect(execution.faults).toEqual([]);

      // ADR 0051: "the Banshee and the Undertaker arrive alone on an empty
      // field," and "there is no drain-out before the set piece ... only the
      // two boss boundaries need the field empty." So the two boss boundaries
      // report nothing alive and the set piece's reports trash, which is the
      // ruling's two halves on one run.
      const aliveAt = (phase: string): number =>
        Number(
          atBoundary
            .find((each) => each.startsWith(`${phase}=`))!
            .split('=')[1],
        );
      expect(atBoundary.map((each) => each.split('=')[0])).toEqual(
        PHASE_ORDER.slice(),
      );
      expect(`banshee=${aliveAt('banshee')}`).toBe('banshee=0');
      expect(`undertaker=${aliveAt('undertaker')}`).toBe('undertaker=0');
      expect(aliveAt('waking')).toBeGreaterThan(0);
    });
  }
});

/**
 * The budget for one walk that re-derives all six policies at every tick.
 * Seven steerings a tick over sixteen hundred ticks is more arithmetic than
 * vitest's five seconds holds beside a suite running in parallel, and it is
 * stated on these tests rather than raised for the suite.
 */
const SIX_POLICY_WALKS_MS = 30000;

describe('the six policies steer on this module’s own look-ahead', () => {
  /**
   * The rows the six policies steer under, written here as the module writes
   * them. They are duplicated on purpose: this suite's whole subject is that
   * none of the six moved when the look-ahead became a parameter, so a row
   * changed in bot.ts and not here is exactly what should go red.
   */
  const DRIFTING_MARK = { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT * 0.8 };
  const DRIFTING_CLEARANCE = 60;
  const COMMITTING_CLEARANCE = 12;

  /**
   * The opening, which is played rather than walked.
   *
   * The Procession owns emptiness (ADR 0050): nothing comes inside the
   * look-ahead's reach until a shade before tick 1000 and the first corpses
   * follow it, so every assertion below holds vacuously over the opening and
   * re-deriving six policies through it would be paying for nothing. Every one
   * of these assertions passed at tick 900 on a policy reading a horizon it
   * was never given, which is what says the opening is not the place to read.
   */
  const OPENING_TICKS = 1000;

  /**
   * How far each walk goes past the opening, checking every tick. A single
   * state out of this run is a coin toss over which kind of tick it landed on,
   * so it is a stretch and the walk counts what it actually saw.
   */
  const WALK_TICKS = 500;

  /** What a walk saw, so an assertion over an empty field cannot pass for a pass. */
  interface Walked {
    readonly ticks: number;
    readonly withThreats: number;
    readonly withFood: number;
  }

  /**
   * Every one of the six re-derived from bestMoveToward at every tick of a
   * walk, under the module's own horizon and each policy's own row.
   *
   * The record's section 1 reason for a seventh policy rather than an edit of
   * dodgePolicy: every figure any of the six has produced keeps meaning what it
   * meant. This is the mechanical half, that each still reads the module's own
   * horizon; the rest of this file is the figures themselves.
   */
  function walkTheSix(seed: number): Walked {
    const state = createRun(seed);
    const execution = createExecution(state);
    runPolicy(execution, dodgePolicy, OPENING_TICKS);
    let withThreats = 0;
    let withFood = 0;
    let ticks = 0;
    while (
      ticks < WALK_TICKS &&
      state.ending === null &&
      execution.stop === null
    ) {
      const food = nearestFood(state);
      if (food !== null) withFood += 1;
      const threatened =
        state.mobs.some((mob) => mob.alive) ||
        state.mobFire.some((shot) => shot.alive);
      if (threatened) withThreats += 1;

      const drifting = bestMoveToward(
        state,
        DRIFTING_MARK,
        DRIFTING_CLEARANCE,
        LOOKAHEAD_SAMPLES,
      );
      expect(dodgePolicy(state, []).move).toEqual(drifting);
      expect(unloadedPolicy(state, []).move).toEqual(drifting);
      expect(belchingPolicy(state, []).move).toEqual(drifting);
      expect(divingPolicy(state, []).move).toEqual(
        bestMoveToward(
          state,
          food ?? DRIFTING_MARK,
          COMMITTING_CLEARANCE,
          LOOKAHEAD_SAMPLES,
        ),
      );
      expect(waitingPolicy(state, []).move).toEqual(
        bestMoveToward(
          state,
          { x: food?.x ?? DRIFTING_MARK.x, y: DRIFTING_MARK.y },
          DRIFTING_CLEARANCE,
          LOOKAHEAD_SAMPLES,
        ),
      );
      // The one policy that never goes through the steering at all: it closes
      // on the nearest threat, so the look-ahead cannot reach it, and its move
      // is a unit vector rather than one of the nine. On an empty field it has
      // nothing to close on and stands still, which is the opening.
      const closing = hitTakingPolicy(state, []).move;
      expect(Math.hypot(closing.x, closing.y)).toBeCloseTo(
        threatened ? 1 : 0,
        10,
      );

      executeTick(execution, dodgePolicy(state, []));
      ticks += 1;
    }
    expect(execution.faults).toEqual([]);
    return { ticks, withThreats, withFood };
  }

  for (const seed of SEEDS) {
    it(
      `steers all six on the full sample list on seed ${seed}`,
      () => {
        const walked = walkTheSix(seed);
        // Both halves of the field the assertions read, so a walk that met an
        // empty screen reports it rather than passing.
        expect(`${walked.ticks} ticks`).toBe(`${WALK_TICKS} ticks`);
        expect(walked.withThreats).toBeGreaterThan(0);
        expect(walked.withFood).toBeGreaterThan(0);
      },
      SIX_POLICY_WALKS_MS,
    );
  }

  it(
    'reads the whole list, so a shorter one steers somewhere else',
    () => {
      // Without this the walks above would hold on a bestMoveToward that
      // ignored its samples entirely, and the parameter would be decoration
      // (docs/agents/lessons.md, "when a test asserts absence, check the input
      // can produce presence").
      const shortened = LOOKAHEAD_SAMPLES.slice(0, 2);
      const state = createRun(SEEDS[0]);
      const execution = createExecution(state);
      runPolicy(execution, dodgePolicy, OPENING_TICKS);
      let differing = 0;
      for (let tick = 0; tick < WALK_TICKS; tick++) {
        const far = bestMoveToward(
          state,
          DRIFTING_MARK,
          DRIFTING_CLEARANCE,
          LOOKAHEAD_SAMPLES,
        );
        const near = bestMoveToward(
          state,
          DRIFTING_MARK,
          DRIFTING_CLEARANCE,
          shortened,
        );
        if (far.x !== near.x || far.y !== near.y) differing += 1;
        executeTick(execution, dodgePolicy(state, []));
      }
      expect(differing).toBeGreaterThan(0);
    },
    SIX_POLICY_WALKS_MS,
  );
});
