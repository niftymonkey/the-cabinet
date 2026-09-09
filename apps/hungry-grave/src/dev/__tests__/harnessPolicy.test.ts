/**
 * The hand the harness plays with (ADR 0053, the playing-harness record's
 * sections 1 and 2).
 *
 * The knobs' own promises, tests 10 to 15 and 49 to 51, land at slice 5 with
 * the hold and the stream. The hand here has neither, so it is still a pure
 * function of run state and the sharp corner it ships under draws nothing.
 */

import { describe, expect, it } from 'vitest';

import { TICK_HZ } from '../../game/clock';
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
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { PROCESSION_ROWS } from '../../game/stage/rows';
import { PHASES } from '../../game/stage/stage';
import { RESERVOIR_CAPACITY, SCROLL_SPEED } from '../../game/tuning';
import { bestMoveToward, HOME, runPolicy } from '../bot';
import type { Configuration } from '../configurations';
import { CONFIGURATIONS, SHARP_HAND } from '../configurations';
import { harnessPolicy } from '../harnessPolicy';

/** The one row this slice ships, which is the sharp corner. */
const SHARP = CONFIGURATIONS[SHARP_HAND];

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
  harnessPolicy(configuration)(state, []);

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
    body.x = state.grave.x + offsets[index].x;
    body.y = state.grave.y + offsets[index].y;
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

const budgetOf = (phase: (typeof PHASES)[number]): number =>
  (phase.rows.length === 0 ? 0 : phase.rows[phase.rows.length - 1].t) *
    TICK_HZ +
  SLOWEST_DESCENT_TICKS;

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
  const { events } = runPolicy(execution, harnessPolicy(SHARP), STAGE_TICKS);
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

    expect(chosen).toBe(bodies[0]);
    expect(move).toEqual(pointOf(state, bodies[0]));
    expect(move).not.toEqual(pointOf(state, bodies[1]));
    expect(move).not.toEqual(pointOf(state, bodies[2]));
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
    const [lower, higher] = bodies;

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
    const gone = bodies[0];
    const next = bodies[1];
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
    const [far, near] = state.corpses.filter((body) => body.alive);

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
    const playing = harnessPolicy(SHARP);
    const watching = harnessPolicy(SHARP);
    expect(SHARP.holdBound).toBe(0);

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
 * `dodgePolicy` is paid on four of these five and never paid on 505
 * (NEVER_PAID in bot.test.ts), and this hand is paid on the other three. The
 * two sets differ because the two hands steer different lanes, not because
 * either reaches for carriers, which neither does.
 *
 * It is #39's first tuning input and never a reason to sharpen the hand: a
 * hand tuned until the stage pays it would measure the tuning of the hand.
 */
const NEVER_PAID_AT_THE_BIRTHRIGHT = [101, 404];

/**
 * The seeds that finish above the birthright, which is fewer than the seeds
 * that level a line at all.
 *
 * 202 buys one rung and a hit strips it (ADR 0003's ladder), so it ends where
 * it started with the rung it bought recorded on the way. Written as an
 * equality rather than as "some seed does", so it fires the day the set moves
 * in either direction and says which seed did it.
 */
const ENDS_ABOVE_THE_BIRTHRIGHT = [303, 505];

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
