/**
 * The hand the harness plays with (ADR 0053, the playing-harness record's
 * sections 1, 2 and 3).
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { TICK_HZ } from '../../game/clock';
import type { TickCommand } from '../../game/command';
import type { Corpse } from '../../game/corpses';
import { spawnDrop } from '../../game/corpses';
import { FIELD_HEIGHT } from '../../game/field';
import type { SimEvent } from '../../game/events';
import { createExecution } from '../../game/execution';
import { BIRTHRIGHT, WEAPON_LINES } from '../../game/lines/roster';
import {
  GHOUL_DESCENT_FLOOR,
  MOB_TYPES,
  MOB_TYPE_NAMES,
  SPAWN_MARGIN,
} from '../../game/mobs';
import { chooseOfferBody, openOffer } from '../../game/offer';
import type { Stream } from '../../game/rng';
import { stream } from '../../game/rng';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { PROCESSION_ROWS } from '../../game/stage/rows';
import { PHASES } from '../../game/stage/stage';
import { RESERVOIR_CAPACITY, SCROLL_SPEED } from '../../game/tuning';
import { foldWitness } from '../../game/witness';
import { bestMoveToward, HOME, runPolicy } from '../bot';
import type { Policy } from '../bot';
import type { Configuration } from '../configurations';
import {
  CONFIGURATIONS,
  CONFIGURATION_NAMES,
  SHARP_HAND,
  SLOPPY_HAND,
} from '../configurations';
import { HAND_STREAM, harnessPolicy } from '../harnessPolicy';

/** Narrows a possibly-absent value, or fails loudly when the absence is a bug. */
function requireDefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

/** A body at this index, present because spreadAround built exactly as many bodies as offsets given it. */
function corpseAt(bodies: readonly Corpse[], index: number): Corpse {
  return requireDefined(bodies[index], `no body at index ${index}`);
}

/** An entry at this index, present because the caller's own construction guarantees it. */
function entryAt<T>(items: readonly T[], index: number): T {
  return requireDefined(items[index], `no entry at index ${index}`);
}

/** The sharp corner: the best this hand plays, and the baseline both knobs cost against. */
const SHARP = CONFIGURATIONS[SHARP_HAND];

/** The sloppy corner: the other end of the ladder a finding has to agree across. */
const SLOPPY = CONFIGURATIONS[SLOPPY_HAND];

/**
 * The seed the hand's own stream is made from in these tests.
 *
 * It is a fixed number rather than the run's, because the hand takes its seed
 * as an argument and a test that passed the run's own would not notice a hand
 * that had reached into RunState for it.
 */
const HAND_SEED = 3131;

/** Five seeds, fixed so a failure is reproducible and never a flake. */
const SEEDS = [101, 202, 303, 404, 505];

/**
 * A run whose stage spawns nothing more, so every body on the field is one the
 * test put there and the hand's choice is the only thing moving.
 */
const quietRun = (seed = 7): RunState => {
  const run = createRun(seed);
  run.stage.firedRows = PROCESSION_ROWS.length;
  run.lines.streamIn = Number.MAX_SAFE_INTEGER;
  return run;
};

/** What the hand does at this state, asked once. */
const command = (state: RunState, configuration: Configuration = SHARP) =>
  harnessPolicy(configuration, HAND_SEED)(state, []);

/** The move the hand would take if it wanted this point, under one row. */
const towardPoint = (
  state: RunState,
  point: { x: number; y: number },
  configuration: Configuration = SHARP,
) =>
  bestMoveToward(
    state,
    point,
    configuration.enoughClearance,
    configuration.lookaheadSamples,
  );

/** Every body of the live offer still on the field, in entity id order. */
const offerBodies = (state: RunState): Corpse[] => {
  const ids = state.offer?.bodyIds ?? [];
  return state.corpses
    .filter((body) => body.alive && ids.includes(body.id))
    .sort((a, b) => a.id - b.id);
};

/**
 * The live offer's bodies moved to the offsets given, one per body, so their
 * bearings from the grave differ, with an ordinary corpse laid nearer than any
 * of them.
 *
 * Two things a test here would otherwise pass without. The offer stands its
 * three bodies in a row at one height, and a hand below that row answers the
 * same move for any of them, so a test that left them there would hold
 * whichever body the hand had picked. And an offer body is a corpse, so a hand
 * with no offer clause at all would reach the same body as the nearest food:
 * the decoy is what makes the first clause the only thing that can explain the
 * answer.
 */
const spreadAround = (
  state: RunState,
  offsets: readonly { x: number; y: number }[],
): Corpse[] => {
  const bodies = offerBodies(state);
  expect(bodies).toHaveLength(offsets.length);
  for (const [index, body] of bodies.entries()) {
    const offset = requireDefined(
      offsets[index],
      `no offset at index ${index}`,
    );
    body.x = state.grave.x + offset.x;
    body.y = state.grave.y + offset.y;
  }
  spawnDrop(state, state.grave.x + 12, state.grave.y + 12);
  return bodies;
};

/** The move the hand would take if it wanted this body. */
const pointOf = (state: RunState, body: Corpse) =>
  towardPoint(state, { x: body.x, y: body.y });

/** A shot standing still on the field, which is what the belch prices. */
const standShot = (state: RunState, x: number, y: number): void => {
  const shot = state.mobFire.find((each) => !each.alive)!;
  shot.alive = true;
  shot.id = state.nextEntityId;
  state.nextEntityId += 1;
  shot.x = x;
  shot.y = y;
  shot.vx = 0;
  shot.vy = 0;
  shot.halfExtent = 3;
};

/**
 * How long a run may take to cross the whole stage, derived from the phases
 * the way bot.test.ts derives its own budgets.
 *
 * It is a budget and never a length: a phase ends on its own condition, so no
 * two runs are the same length and what can be written down is the ceiling.
 * The harness's own derivation is harnessRun.ts's, at slice 4a; this is the
 * one the spec test needs before that module exists.
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

const budgetOf = (phase: (typeof PHASES)[number]): number => {
  if (phase.rows.length === 0) return SLOWEST_DESCENT_TICKS;
  const lastRow = phase.rows[phase.rows.length - 1];
  if (lastRow === undefined)
    throw new Error('phase.rows is non-empty but its last row is absent');
  return lastRow.t * TICK_HZ + SLOWEST_DESCENT_TICKS;
};

const STAGE_TICKS = Math.ceil(
  PHASES.reduce((total, each) => total + budgetOf(each), 0),
);

/**
 * The budget for a test that pays for a whole stage under the hand.
 *
 * A run is cached per seed, so the first test to ask for one pays for it and
 * the rest read it. One stage is a shade under 28000 ticks and takes a second
 * or two on its own, which does not fit inside vitest's five beside a suite
 * running in parallel. It is stated on the tests that can pay rather than
 * raised for the suite, in the shape bot.test.ts already uses.
 */
const ONE_WHOLE_STAGE_MS = 30000;

/** One whole run under the sharp hand, computed once per seed. */
const runs = new Map<number, { state: RunState; events: SimEvent[] }>();

const harnessRun = (seed: number): { state: RunState; events: SimEvent[] } => {
  const cached = runs.get(seed);
  if (cached !== undefined) return cached;
  const state = createRun(seed);
  const execution = createExecution(state);
  const { events } = runPolicy(
    execution,
    harnessPolicy(SHARP, HAND_SEED),
    STAGE_TICKS,
  );
  const played = { state, events, faults: execution.faults };
  expect(played.faults).toEqual([]);
  runs.set(seed, played);
  return played;
};

describe('the hand walks to the body the sim would hand it (ADR 0053)', () => {
  it('walks to the live offer body nearest the grave', () => {
    // The record's section 2 closes ADR 0053's open question with
    // chooseOfferBody's own rule, so the body the hand steers at is the body
    // the sim hands it. The two rules are written twice and this is what holds
    // them together.
    //
    // The three bodies are spread to three bearings rather than left where the
    // offer's own spacing puts them, which is a row of three at one height: a
    // hand steering at any of those from below answers the same move, so the
    // assertion would hold whichever body it had picked.
    const state = quietRun();
    openOffer(state, state.grave.x, state.grave.y - 200);
    const bodies = spreadAround(state, [
      { x: -80, y: 0 },
      { x: 150, y: 0 },
      { x: 0, y: -300 },
    ]);

    const chosen = chooseOfferBody(state, bodies)!;
    const move = command(state).move;

    expect(chosen).toBe(corpseAt(bodies, 0));
    expect(move).toEqual(pointOf(state, corpseAt(bodies, 0)));
    expect(move).not.toEqual(pointOf(state, corpseAt(bodies, 1)));
    expect(move).not.toEqual(pointOf(state, corpseAt(bodies, 2)));
  });

  it('breaks a tie between two bodies on the lower entity id', () => {
    // Two bodies the same distance away is the case a rule has to answer
    // rather than leave to whichever the pool happened to hold first, and the
    // sim answers it by id. The two are placed left and right so the answers
    // differ as moves and the assertion has something to see.
    const state = quietRun();
    openOffer(state, state.grave.x, state.grave.y - 200);
    const bodies = spreadAround(state, [
      { x: -150, y: 0 },
      { x: 150, y: 0 },
      { x: 0, y: -400 },
    ]);
    const lower = corpseAt(bodies, 0);
    const higher = corpseAt(bodies, 1);

    expect(pointOf(state, lower)).not.toEqual(pointOf(state, higher));
    expect(chooseOfferBody(state, [higher, lower])).toBe(lower);
    expect(command(state).move).toEqual(pointOf(state, lower));
  });

  it('never targets a body that is not alive', () => {
    // A body taken or culled is off the field, and a hand still steering at
    // where it was would walk away from the offer it can still take.
    const state = quietRun();
    openOffer(state, state.grave.x, state.grave.y - 200);
    const bodies = spreadAround(state, [
      { x: -80, y: 0 },
      { x: 150, y: 0 },
      { x: 0, y: -300 },
    ]);
    const gone = corpseAt(bodies, 0);
    const next = corpseAt(bodies, 1);
    expect(chooseOfferBody(state, bodies)).toBe(gone);

    gone.alive = false;

    expect(chooseOfferBody(state, offerBodies(state))).toBe(next);
    expect(command(state).move).toEqual(pointOf(state, next));
    expect(command(state).move).not.toEqual(pointOf(state, gone));
  });

  it('prefers a standing offer body to a nearer ordinary corpse', () => {
    // The record's section 2: a drop never decays and a corpse does, so a hand
    // that preferred the nearer body would take offers by accident, and #98's
    // first acceptance line asks for runs that reach levelled builds.
    const state = quietRun();
    state.grave.x = 270;
    state.grave.y = 300;
    openOffer(state, 270, 120);
    const chosen = chooseOfferBody(state, offerBodies(state))!;
    spawnDrop(state, state.grave.x + 10, state.grave.y + 10);

    const move = command(state).move;

    expect(move).toEqual(towardPoint(state, { x: chosen.x, y: chosen.y }));
    expect(move).not.toEqual(
      towardPoint(state, { x: state.grave.x + 10, y: state.grave.y + 10 }),
    );
  });

  it('decides from positions and entity ids alone, never from the build', () => {
    // path-draft.md:21's standing constraint read from the policy's side. The
    // fence catches a quoted line name; this catches a field read, which is
    // the half a text scan cannot see.
    const state = quietRun();
    state.grave.x = 120;
    state.grave.y = 300;
    openOffer(state, 300, 300);
    const before = command(state);

    for (const line of WEAPON_LINES) state.levels[line] = 5;
    const levelled = command(state);
    for (const line of WEAPON_LINES) state.levels[line] = 0;
    const stripped = command(state);

    expect(levelled).toEqual(before);
    expect(stripped).toEqual(before);
  });
});

describe('the hand feeds and drifts when no offer stands (ADR 0053)', () => {
  it('walks to the nearest food with no offer standing', () => {
    // ADR 0053's "feeds". The record's section 1 is why this is not
    // dodgePolicy plus an offer: dodgePolicy drifts home and never targets
    // food at all.
    const state = quietRun();
    state.grave.x = 270;
    state.grave.y = 400;
    spawnDrop(state, 200, 200);
    spawnDrop(state, 340, 400);
    const alive = state.corpses.filter((body) => body.alive);
    const far = corpseAt(alive, 0);
    const near = corpseAt(alive, 1);

    expect(state.offer).toBeNull();
    expect(command(state).move).toEqual(pointOf(state, near));
    expect(command(state).move).not.toEqual(pointOf(state, far));
  });

  it('drifts to the starting mark with no offer and no food', () => {
    // The third clause. It is the same mark the six policies in bot.ts drift
    // to, imported rather than written again, so a hand that wants nothing is
    // standing where the shmup starts.
    const state = quietRun();
    state.grave.x = 100;
    state.grave.y = 100;

    expect(state.offer).toBeNull();
    expect(state.corpses.filter((body) => body.alive)).toEqual([]);
    // Standing still would satisfy an equality against any point the grave is
    // already on, so the mark is somewhere the grave is not.
    expect(towardPoint(state, HOME)).not.toEqual({ x: 0, y: 0 });
    expect(command(state).move).toEqual(towardPoint(state, HOME));
  });
});

describe('the hand belches, which is the fifth verb (ADR 0042, ADR 0053)', () => {
  it('belches with the reservoir full and the row of shots live', () => {
    // #37's story 12, one belch plus play beats the Undertaker, has no hand
    // that can answer it under a policy that never belches, and belchCadence
    // reports an empty fire list on every run of every batch.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    for (let shot = 0; shot < SHARP.belchWorthIt; shot++) {
      standShot(state, 100 + shot, 200);
    }

    expect(command(state).belch).toBe(true);
  });

  it('belches on no other condition', () => {
    // The deliberate-absence half. Neither knob touches the belch, so a sloppy
    // hand belches on exactly a sharp hand's condition, which the record
    // states rather than hides.
    const state = quietRun();

    expect(command(state).belch).toBe(false);

    state.reservoir = RESERVOIR_CAPACITY;
    expect(command(state).belch).toBe(false);

    for (let shot = 0; shot < SHARP.belchWorthIt - 1; shot++) {
      standShot(state, 100 + shot, 200);
    }
    expect(command(state).belch).toBe(false);

    state.reservoir = RESERVOIR_CAPACITY - 1;
    standShot(state, 300, 200);
    expect(command(state).belch).toBe(false);
  });
});

describe('the hand is one policy under its row (ADR 0053)', () => {
  it('adds no error at the sharp corner, so two hands answer alike', () => {
    // ADR 0053: "one policy over many seeds, and only then the same policy
    // wearing two error knobs". At the sharp corner the hand holds nothing
    // stale and draws nothing, so a second hand built from the same row is the
    // same hand at every tick. Under a hold the two would fall out of phase,
    // which is what makes this a promise and not a restatement.
    const state = createRun(101);
    const execution = createExecution(state);
    const playing = harnessPolicy(SHARP, HAND_SEED);
    const watching = harnessPolicy(SHARP, HAND_SEED);
    expect(SHARP.lapsePerMille).toBe(0);
    expect(SHARP.lapseBound).toBe(0);

    let sampled = 0;
    runPolicy(
      execution,
      (each, caused) => {
        const move = playing(each, caused);
        expect(watching(each, caused)).toEqual(move);
        sampled += 1;
        return move;
      },
      600,
    );

    expect(sampled).toBe(600);
  });

  it('settles for the clearance its own row names', () => {
    // The clearance is a row and not a constant in the module, so the tuning
    // pass moves one hand's without moving another's. A row asking for far
    // more room steers somewhere else at a state where room is scarce.
    const state = quietRun();
    state.grave.x = 270;
    state.grave.y = 400;
    spawnDrop(state, 270, 120);
    for (let shot = 0; shot < 6; shot++) {
      standShot(state, 250 + shot * 8, 340);
    }
    const roomy: Configuration = { ...SHARP, enoughClearance: 240 };

    expect(command(state, roomy).move).not.toEqual(command(state).move);
  });

  it('takes the roomiest move rather than driving through bodies', () => {
    // The same rule dodgePolicy is written under, which is what makes a
    // comparison between two hands a comparison of the wanting rather than of
    // how well either dodges.
    const state = quietRun();
    state.grave.x = 270;
    state.grave.y = 400;
    spawnDrop(state, 270, 120);

    // The empty field first, so the assertion below is a fence and not a
    // reading of a hand that was never going to go straight up anyway.
    expect(command(state).move).toEqual({ x: 0, y: -1 });

    for (let shot = 0; shot < 10; shot++) {
      standShot(state, 200 + shot * 16, 360);
    }

    expect(command(state).move).not.toEqual({ x: 0, y: -1 });
  });
});

/**
 * The seeds whose lane never crosses a carrier under this hand, so no offer
 * ever stands and there is nothing to take.
 *
 * Measured, not assumed. At the birthright the skull stream is the whole of
 * the storm, so which mobs a run kills follows the lane it steers, and whether
 * a carrier is among them is a fact about the seed rather than about the hand:
 * `dodgePolicy` is paid on all five and this hand is paid on all five too.
 * Under the mow (ADR 0059) a skull is a whole trash body, so the lane a run
 * steers clears far more of what it passes and a carrier among them is no
 * longer the rarity it was: the list held 101 and 404 against the old health
 * row and holds nobody now. It is kept rather than deleted so the day the
 * stage stops paying a seed, this says which one.
 *
 * It is #39's first tuning input and never a reason to sharpen the hand: a
 * hand tuned until the stage pays it would measure the tuning of the hand.
 */
const NEVER_PAID_AT_THE_BIRTHRIGHT: readonly number[] = [];

/**
 * The seeds that finish above the birthright, which under the mow is every one
 * of them.
 *
 * It used to be 303 and 505 alone, with 202 buying one rung and a hit
 * stripping it (ADR 0003's ladder). The mow pays every lane enough carriers to
 * outrun the strips (ADR 0059). Written as an equality rather than as "some
 * seed does", so it fires the day the set moves in either direction and says
 * which seed did it.
 */
const ENDS_ABOVE_THE_BIRTHRIGHT = [101, 202, 303, 404, 505];

const linesAboveBirthright = (state: RunState): readonly string[] =>
  WEAPON_LINES.filter(
    (line) => state.levels[line] > (BIRTHRIGHT.includes(line) ? 1 : 0),
  );

describe('a run under the hand reaches a levelled build (#98, ADR 0034)', () => {
  for (const seed of SEEDS) {
    const paid = !NEVER_PAID_AT_THE_BIRTHRIGHT.includes(seed);
    it(
      `${paid ? 'takes the offers it is paid' : 'is never paid a carrier'} on seed ${seed}`,
      () => {
        // #98's first acceptance line: the hand's runs reach levelled builds
        // rather than sitting at the birthright. It is a property of the
        // policy and not a comparison about the game, which is why it is a
        // test and not a reading. What the policy owns is that a stood offer
        // is taken and pays a rung; whether one ever stands is the stage's,
        // and the seeds where it does not are named above rather than passed
        // over in silence.
        const { events } = harnessRun(seed);
        const opened = events.filter(
          (event) => event.type === 'offerOpened',
        ).length;
        const taken = events.filter(
          (event) => event.type === 'offerTaken',
        ).length;
        const levelled = events.filter(
          (event) => event.type === 'weaponLeveled',
        ).length;

        expect(opened > 0).toBe(paid);
        if (!paid) return;
        expect(taken).toBeGreaterThan(0);
        expect(levelled).toBeGreaterThanOrEqual(taken);
      },
      ONE_WHOLE_STAGE_MS,
    );
  }

  it(
    'ends above the birthright on the seeds the set names, and no others',
    () => {
      // The other half, and the one hand-forward (g) is about: a build bought
      // and kept, against a build bought and stripped. It is a reading of the
      // stage as authored, which #39's tuning pass is what moves.
      const above = SEEDS.filter(
        (seed) => linesAboveBirthright(harnessRun(seed).state).length > 0,
      );
      expect(above).toEqual(ENDS_ABOVE_THE_BIRTHRIGHT);
    },
    ONE_WHOLE_STAGE_MS,
  );
});

/**
 * The lapse schedule one row and one seed produce, read off the same stream
 * the hand makes rather than off the hand itself: the rate first, then the
 * depth, and a rate of zero rolling nothing at all.
 *
 * It is a second statement of the mechanism and it is only worth what the
 * first test below buys it: that test plays a real run and holds the hand's
 * own commands against this schedule tick by tick, so the tests that read the
 * depths afterwards are reading depths the hand was proved to take.
 */
const lapseSchedule = (
  row: Configuration,
  seed: number,
  ticks: number,
): {
  readonly decided: boolean[];
  readonly depths: number[];
  readonly drawn: number;
} => {
  const source = stream(seed, HAND_STREAM);
  const decided: boolean[] = [];
  const depths: number[] = [];
  let holding = 0;
  for (let tick = 0; tick < ticks; tick++) {
    if (holding > 0) {
      holding -= 1;
      decided.push(false);
      continue;
    }
    decided.push(true);
    if (row.lapsePerMille === 0) {
      depths.push(0);
      continue;
    }
    const attentionFailed = source.nextInt(1000) < row.lapsePerMille;
    const depth = attentionFailed ? source.nextInt(row.lapseBound + 1) : 0;
    depths.push(depth);
    holding = depth;
  }
  return { decided, depths, drawn: source.drawn };
};

/** A row that always lapses, so a test can watch a hold rather than wait for one. */
const alwaysLapsing = (depth: number): Configuration => ({
  ...SLOPPY,
  lapsePerMille: 1000,
  lapseBound: depth,
});

/** The same row with its attention never failing, which is the hand's own baseline. */
const attentive = (row: Configuration): Configuration => ({
  ...row,
  lapsePerMille: 0,
  lapseBound: 0,
});

/**
 * One tick sequence, with several hands asked at every tick and one of them
 * driving.
 *
 * Every watcher sees the same field at the same tick, so a difference between
 * two of them is the knob and never the run.
 */
const watchOneRun = (
  seed: number,
  ticks: number,
  watchers: readonly Policy[],
): TickCommand[][] => {
  const state = createRun(seed);
  const execution = createExecution(state);
  const seen: TickCommand[][] = watchers.map(() => []);
  const driver = harnessPolicy(SHARP, HAND_SEED);
  runPolicy(
    execution,
    (each, caused) => {
      watchers.forEach((watcher, index) => {
        const log = seen[index];
        if (log === undefined) throw new Error(`no seen log at index ${index}`);
        log.push(watcher(each, caused));
      });
      return driver(each, caused);
    },
    ticks,
  );
  expect(execution.faults).toEqual([]);
  return seen;
};

/** Long enough that a rate of 100 in 1000 lapses many times over. */
const KNOB_TICKS = 2000;

/** Enough decisions that a rate reads as a rate rather than as a handful of draws. */
const RATE_DECISIONS = 20000;

/** What the fold is chained from, which is any number as long as both runs use it. */
const WITNESS_SEED = 0;

/**
 * Long enough that a rate of 250 in 1000 rolls its own boundary value several
 * times, which is the only place a rate off by one shows up at all.
 */
const BOUNDARY_TICKS = 30000;

describe('the dexterity error is a lapse of attention (ADR 0053)', () => {
  it('repeats a held command for the drawn number of ticks and then decides again', () => {
    // The record's section 3 as amended 2026-09-09: every decision rolls
    // attention first, and only a failed roll draws a hold. So the hand's
    // command over a run is its attentive twin's answer on a decision tick and
    // its own previous answer on a held one, at exactly the ticks the stream
    // says.
    const row = CONFIGURATIONS['shaky-far'];
    const [watchedLapsing, watchedFresh] = watchOneRun(303, KNOB_TICKS, [
      harnessPolicy(row, HAND_SEED),
      harnessPolicy(attentive(row), HAND_SEED),
    ]);
    const lapsing = requireDefined(watchedLapsing, 'no lapsing watcher log');
    const fresh = requireDefined(watchedFresh, 'no fresh watcher log');
    const { decided } = lapseSchedule(row, HAND_SEED, KNOB_TICKS);

    const wrong = decided.flatMap((decidedHere, tick) => {
      const owed = decidedHere
        ? requireDefined(fresh[tick], `no fresh command at tick ${tick}`)
        : requireDefined(
            lapsing[tick - 1],
            `no lapsing command at tick ${tick - 1}`,
          );
      const held = requireDefined(
        lapsing[tick],
        `no lapsing command at tick ${tick}`,
      );
      return JSON.stringify(held) === JSON.stringify(owed)
        ? []
        : [`tick ${tick}, ${decidedHere ? 'a decision' : 'a hold'}`];
    });

    expect(wrong).toEqual([]);
    // The schedule has to contain holds, or the walk above passed over a hand
    // that never held anything.
    expect(decided.filter((each) => !each).length).toBeGreaterThan(100);
  });

  it('decides again on the tick a hold expires and not on the one after it', () => {
    // The off-by-one that would otherwise ship silently: a hold of four ticks
    // means four ticks of the old command and a decision on the fifth. A hand
    // that decided on the sixth would be a tick slower than every row says,
    // and no reading in the report would name it.
    const row = alwaysLapsing(4);
    const ticks = 400;
    const [watchedLapsing, watchedFresh] = watchOneRun(404, ticks, [
      harnessPolicy(row, HAND_SEED),
      harnessPolicy(attentive(row), HAND_SEED),
    ]);
    const lapsing = requireDefined(watchedLapsing, 'no lapsing watcher log');
    const fresh = requireDefined(watchedFresh, 'no fresh watcher log');
    const { decided } = lapseSchedule(row, HAND_SEED, ticks);
    const at = (log: readonly TickCommand[], tick: number): TickCommand =>
      requireDefined(log[tick], `no command at tick ${tick}`);
    const differs = (tick: number) =>
      JSON.stringify(at(lapsing, tick)) !== JSON.stringify(at(fresh, tick));

    // A bound of four draws 0 to 4, so which ticks carry a decision is the
    // stream's answer and never arithmetic. The hand agrees with it, and the
    // hand held on some of these ticks rather than deciding on all of them.
    expect(decided.filter(Boolean).length).toBeLessThan(decided.length);
    decided.forEach((decidedHere, tick) => {
      if (!decidedHere) return;
      expect(at(lapsing, tick), `tick ${tick}`).toEqual(at(fresh, tick));
    });
    // And the holds are visible rather than assumed: on a still enough field a
    // held command and a freshly decided one are the same answer, so the walk
    // above would agree with a hand that never held anything. At least one
    // held tick has to say something the attentive twin did not.
    expect(
      decided.some((decidedHere, tick) => !decidedHere && differs(tick)),
    ).toBe(true);
  });

  it('nests the rungs, so one shaky run holds steady, loose and shaky decisions', () => {
    // The record's section 3: a rung is not a separate character, it is the
    // same hand failing more often and worse. A loose hand is a steady hand on
    // nine decisions in ten; a shaky hand is a steady hand on three in four,
    // and when it does lapse the depth runs the whole way from nothing to the
    // full bound, so one shaky run produces steady decisions, loose-sized
    // lapses and shaky-sized lapses.
    const loose = CONFIGURATIONS['loose-far'];
    const shaky = CONFIGURATIONS['shaky-far'];
    const shakyDepths = lapseSchedule(shaky, HAND_SEED, RATE_DECISIONS).depths;
    const looseDepths = lapseSchedule(loose, HAND_SEED, RATE_DECISIONS).depths;

    const attentiveShare = (depths: readonly number[]) =>
      depths.filter((depth) => depth === 0).length / depths.length;
    expect(attentiveShare(looseDepths)).toBeGreaterThan(
      attentiveShare(shakyDepths),
    );
    expect(attentiveShare(shakyDepths)).toBeGreaterThan(0.5);

    // One shaky run reaches the whole ladder: nothing at all, a loose-sized
    // lapse, and one past the loose bound.
    const lapses = shakyDepths.filter((depth) => depth > 0);
    expect(Math.max(...lapses)).toBeLessThanOrEqual(shaky.lapseBound);
    expect(Math.max(...lapses)).toBeGreaterThan(loose.lapseBound);
    expect(lapses.some((depth) => depth <= loose.lapseBound)).toBe(true);
    expect(Math.max(...looseDepths)).toBeLessThanOrEqual(loose.lapseBound);
  });

  it('never lets a knob buy the hand something the sharp corner does not have', () => {
    // The record's section 3, which is Talakat's construction: both knobs cost
    // the hand something rather than granting it something, and that is why
    // the sharp corner is the baseline. Mechanically: no row reads further
    // ahead than the sharp corner and no row decides more often, so every
    // configuration's command is either its own attentive answer or a stale
    // one it already gave.
    const hands = CONFIGURATION_NAMES.map((name) =>
      harnessPolicy(CONFIGURATIONS[name], HAND_SEED),
    );
    const twins = CONFIGURATION_NAMES.map((name) =>
      harnessPolicy(attentive(CONFIGURATIONS[name]), HAND_SEED),
    );
    const seen = watchOneRun(505, 600, [...hands, ...twins]);

    CONFIGURATION_NAMES.forEach((name, index) => {
      const row = CONFIGURATIONS[name];
      expect(row.lapsePerMille, name).toBeGreaterThanOrEqual(
        SHARP.lapsePerMille,
      );
      expect(
        SHARP.lookaheadSamples.slice(0, row.lookaheadSamples.length),
        name,
      ).toEqual([...row.lookaheadSamples]);

      const lapsing = requireDefined(seen[index], `no seen log at ${index}`);
      const fresh = requireDefined(
        seen[index + CONFIGURATION_NAMES.length],
        `no seen log at ${index + CONFIGURATION_NAMES.length}`,
      );
      const wrong = lapsing.flatMap((answer, tick) => {
        const staleOrFresh = [fresh[tick], lapsing[tick - 1]].map((each) =>
          JSON.stringify(each),
        );
        return staleOrFresh.includes(JSON.stringify(answer))
          ? []
          : [`${name} at tick ${tick}`];
      });
      expect(wrong).toEqual([]);
    });
  });

  it("leaves the run's own five streams where it found them", () => {
    // ADR 0019 and hand-forward (f): the hand's dice are outside RunState, so
    // the witness never learns the bot exists and WITNESS_VERSION stays 6. The
    // hand reads the field and draws from its own stream, and nothing it does
    // moves a cursor the fold walks.
    const state = quietRun(202);
    const cursors = () =>
      Object.fromEntries(
        Object.entries(state.streams).map(([name, each]) => [name, each.drawn]),
      );
    const before = cursors();
    const hand = harnessPolicy(alwaysLapsing(SLOPPY.lapseBound), HAND_SEED);

    for (let tick = 0; tick < 200; tick++) hand(state, []);

    expect(cursors()).toEqual(before);
  });
});

describe('the hand draws from its own stream and only when it lapses (ADR 0012)', () => {
  afterEach(() => {
    vi.doUnmock('../../game/rng');
    vi.resetModules();
  });

  /**
   * The hand's own streams, captured as they are made.
   *
   * The stream a hand holds is private to it, and how many draws it took is
   * the whole promise here, so the module is re-imported over a counting
   * rng rather than inferred from behaviour: a draw taken and thrown away
   * changes no command and would leave the record's sentence false with every
   * behavioural test still green.
   */
  const handsUnderACountedStream = async (): Promise<{
    make: typeof harnessPolicy;
    asked: { seed: number; name: string }[];
    hands: Stream[];
  }> => {
    const asked: { seed: number; name: string }[] = [];
    const hands: Stream[] = [];
    vi.resetModules();
    vi.doMock('../../game/rng', async (importOriginal) => {
      const original = await importOriginal<typeof import('../../game/rng')>();
      return {
        ...original,
        stream: (seed: number, name: string): Stream => {
          const made = original.stream(seed, name);
          if (name !== HAND_STREAM) return made;
          asked.push({ seed, name });
          hands.push(made);
          return made;
        },
      };
    });
    const counted = await import('../harnessPolicy');
    return { make: counted.harnessPolicy, asked, hands };
  };

  it('draws nothing at all at the sharp corner', async () => {
    // The record's section 3: steady draws nothing, which is load-bearing
    // twice over. The determinism run below is under the sloppy corner
    // precisely because the sharp corner's stream is untouched, and the sharp
    // batch already played stays comparable with everything measured after the
    // knobs land. The order is the rate first and the depth second, so a
    // nextInt taken before the rate was checked would make both false.
    const { make, hands } = await handsUnderACountedStream();
    const state = quietRun(101);
    const hand = make(SHARP, HAND_SEED);
    for (let tick = 0; tick < 300; tick++) hand(state, []);

    expect(hands).toHaveLength(1);
    expect(entryAt(hands, 0).drawn).toBe(0);
  });

  it('takes one draw for the rate and a second only on the decisions that lapsed', async () => {
    // A rate of 250 in 1000 is exactly 250 draws in 1000 and not 251, and the
    // difference between the two is one comparison. It shows up in nothing a
    // command can say, because the draws that separate them are the handful
    // landing on the row's own number, so the count of draws is what says it:
    // one for the attention roll, and a second only where that roll failed.
    const { make, hands } = await handsUnderACountedStream();
    const row = CONFIGURATIONS['shaky-far'];
    const state = restingAtHome();
    const hand = make(row, HAND_SEED);
    for (let tick = 0; tick < BOUNDARY_TICKS; tick++) hand(state, []);

    const { decided, depths, drawn } = lapseSchedule(
      row,
      HAND_SEED,
      BOUNDARY_TICKS,
    );
    // Enough decisions that the rate's own boundary value comes up at all,
    // which is the whole reason this test is longer than the others.
    expect(decided.filter(Boolean).length).toBeGreaterThan(3000);
    expect(entryAt(hands, 0).drawn).toBe(drawn);
    // At least, rather than exactly: nextInt redraws past the last whole
    // multiple of its bound and every redraw counts as a draw (rng.ts).
    expect(drawn).toBeGreaterThanOrEqual(
      decided.filter(Boolean).length +
        depths.filter((depth) => depth > 0).length,
    );
  });

  it('makes its stream from the seed it was handed and the hand name', async () => {
    // The hand's stream is made in src/dev off the run's seed and never inside
    // RunState, so one seed holds the same sequence whichever configuration
    // draws from it and two seeds hold different ones.
    const { make, asked, hands } = await handsUnderACountedStream();
    const state = quietRun(101);
    const near = make(CONFIGURATIONS['shaky-far'], 77);
    const far = make(CONFIGURATIONS['shaky-short'], 77);
    const other = make(CONFIGURATIONS['shaky-short'], 78);
    for (let tick = 0; tick < 60; tick++) {
      near(state, []);
      far(state, []);
      other(state, []);
    }

    expect(asked).toEqual([
      { seed: 77, name: HAND_STREAM },
      { seed: 77, name: HAND_STREAM },
      { seed: 78, name: HAND_STREAM },
    ]);
    // Two configurations at one seed took the same draws; a third seed did
    // not, which is what says the seed reaches the stream at all.
    expect(entryAt(hands, 0).drawn).toBe(entryAt(hands, 1).drawn);
    expect(entryAt(hands, 2).drawn).not.toBe(entryAt(hands, 0).drawn);
  });
});

describe('one seed under one configuration is one run (ADR 0053)', () => {
  it('plays the sloppy corner twice from one seed to the same run', () => {
    // ADR 0053's determinism condition holds "only if the hand's stale-command
    // draws and the head's shortened look-ahead come from their own named
    // stream seeded off the run's seed". It runs under the sloppy corner on
    // purpose: the sharp corner draws nothing, so this test under the sharp
    // hand would pass on a harness whose stream was wired wrong.
    const playOnce = () => {
      const state = createRun(909);
      const execution = createExecution(state);
      const { ticks } = runPolicy(
        execution,
        harnessPolicy(SLOPPY, state.seed),
        1500,
      );
      return {
        ticks,
        witness: foldWitness(state, WITNESS_SEED),
        cursors: Object.fromEntries(
          Object.entries(state.streams).map(([name, each]) => [
            name,
            each.drawn,
          ]),
        ),
        ending: state.ending,
      };
    };

    expect(playOnce()).toEqual(playOnce());
  });
});

/** How fast the test's own shot falls, in units a tick. */
const TEST_SHOT_SPEED = 5;

/**
 * An empty field with the grave already on the starting mark, so a head with
 * nothing to see answers "stay" and a head that sees something does not.
 */
const restingAtHome = (): RunState => {
  const state = quietRun(11);
  state.grave.x = HOME.x;
  state.grave.y = HOME.y;
  return state;
};

/** The same field with one shot on course to arrive over the grave this far ahead. */
const shotArrivingIn = (ticksAhead: number): RunState => {
  const state = restingAtHome();
  standShot(state, state.grave.x, state.grave.y - TEST_SHOT_SPEED * ticksAhead);
  const shot = state.mobFire.find((each) => each.alive)!;
  shot.vy = TEST_SHOT_SPEED;
  return state;
};

describe('the strategy error shortens the head from the far end (ADR 0053)', () => {
  it('keeps the near samples and loses the far ones', () => {
    // bot.ts's own argument for the near samples is that a threat passing
    // through the grave and gone again by the far sample is exactly the one a
    // policy sampling only the horizon cannot see at all, so a head shortens
    // from the far end rather than thinning throughout.
    //
    // Each head is read against its own answer on an empty field. A shorter
    // list also settles the wanting nearer, so comparing two heads to each
    // other reads both halves of the knob at once and says nothing about
    // either.
    const far = CONFIGURATIONS['steady-far'];
    const short = CONFIGURATIONS['steady-short'];
    const still = { x: 0, y: 0 };

    // Nothing on the field: both heads sit on the starting mark, which is what
    // makes a move below a reading of the threat and not of the wanting.
    expect(command(restingAtHome(), far).move).toEqual(still);
    expect(command(restingAtHome(), short).move).toEqual(still);

    // A shot arriving inside the near samples both heads keep: both move.
    expect(command(shotArrivingIn(8), far).move).not.toEqual(still);
    expect(command(shotArrivingIn(8), short).move).not.toEqual(still);

    // A shot arriving past the short head's last sample: only the far head has
    // looked that far, so the short one is still sitting on the mark.
    expect(command(shotArrivingIn(26), far).move).not.toEqual(still);
    expect(command(shotArrivingIn(26), short).move).toEqual(still);
    expect(
      short.lookaheadSamples[short.lookaheadSamples.length - 1],
    ).toBeLessThan(26);
  });
});
