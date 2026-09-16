/**
 * The one button (ADR 0008 as amended): full only, gas everywhere, a shove
 * nearby. Expected values come from the ADR, from the design record's ruling R3
 * as superseded on 2026-09-15, and from dispatch 5's plan section 6.14.
 */

import { describe, expect, it } from 'vitest';

import {
  advancePress,
  BELCH_BURST_RADIUS,
  BELCH_SHOVE_SPACING,
  BELCH_SHOVE_THROW,
  BELCH_SHOVES,
  fireBelch,
} from '../belch';
import { spawnBoss } from '../bosses/phases';
import type { PressedBody, SimEvent } from '../events';
import { createExecution, executeTick } from '../execution';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import type { Mob } from '../mobs';
import { advanceMobs, hasEntered, spawnMob } from '../mobs';
import type { RunState } from '../run';
import { createRun } from '../run';
import { SHOVE_TICKS, startShove } from '../shove';
import { placeSetPiece } from '../stage/setPiece';
import { PROCESSION_WAVES } from '../stage/waves';
import { RESERVOIR_CAPACITY, SCROLL_SPEED } from '../tuning';

/**
 * The whole of one belch's push, in ticks: the last shove begins after the ones
 * before it and then runs its own length. Derived rather than written out, so a
 * retuned row carries these tests with it.
 */
const WHOLE_PUSH = (BELCH_SHOVES - 1) * BELCH_SHOVE_SPACING + SHOVE_TICKS;

// What the three shoves together owe one body, before any bound refuses part of it.
const WHOLE_THROW = BELCH_SHOVES * BELCH_SHOVE_THROW;

// Comfortably inside and comfortably outside the burst, so a retuned radius
// moves neither case across the line.
const NEAR = BELCH_BURST_RADIUS / 2;
const FAR = BELCH_BURST_RADIUS * 2;

// Health no run of this length can spend, for the fixtures that have to be
// standing at the end of a window the whole tick runs through.
const OUTLIVES_THE_WINDOW = Number.MAX_SAFE_INTEGER;

function quietRun(seed = 16): RunState {
  const run = createRun(seed);
  run.stage.firedWaves = PROCESSION_WAVES.length;
  return run;
}

/** Shots put on the field by hand, so the test does not depend on a mob firing. */
function armField(state: RunState, count: number): void {
  for (let index = 0; index < count; index++) {
    const shot = state.mobFire[index];
    if (shot === undefined) throw new Error(`no mobFire pool slot at ${index}`);
    shot.alive = true;
    shot.id = state.nextEntityId;
    state.nextEntityId += 1;
    shot.x = 100 + index;
    shot.y = 200;
    shot.vx = 0;
    shot.vy = 1;
    shot.halfExtent = 5;
  }
}

/** Mobs standing well inside the field, past the arriving beat, spread so none overlap. */
function fillField(state: RunState, count: number): Mob[] {
  const mobs: Mob[] = [];
  for (let index = 0; index < count; index++) {
    const mob = spawnMob(
      state,
      'shambler',
      {
        x: 40 + index * 24,
        y: 100,
        vx: 0,
        vy: 1,
        index,
      },
      false,
      'wave',
    )!;
    mob.beat = 0;
    mobs.push(mob);
  }
  return mobs;
}

/** One mob standing still at a chosen point, past its arriving beat. */
function putMobAt(state: RunState, x: number, y: number): Mob {
  const mob = spawnMob(
    state,
    'shambler',
    { x, y, vx: 0, vy: 0, index: 0 },
    false,
    'wave',
  )!;
  mob.beat = 0;
  return mob;
}

/**
 * A body that stands exactly where it is put while the mobs advance, so what
 * moves it is the belch and nothing else. It holds its arriving beat past every
 * window here, which is the one state ADR 0041 gives a body where its own rule
 * does not run, and it carries no velocity of its own to drift on.
 */
function standStill(mob: Mob): Mob {
  mob.beat = Number.MAX_SAFE_INTEGER;
  mob.vx = 0;
  mob.vy = 0;
  return mob;
}

/** A standing body at a chosen point, for the tests that measure the travel. */
function putStillAt(state: RunState, x: number, y: number): Mob {
  return standStill(putMobAt(state, x, y));
}

/** How far a body stands from the grave, in field units. */
function distanceFromGrave(state: RunState, mob: Mob): number {
  const dx = mob.x - state.grave.x;
  const dy = mob.y - state.grave.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * The press's own clock and then the mobs, for this many ticks, with everything
 * the two reported.
 *
 * Both, and in that order, because the tick runs them in it: a press throws
 * three times and its later shoves come out of its own clock, before the bodies
 * move, exactly as the press itself did (step.ts).
 */
function travelFor(state: RunState, ticks: number): SimEvent[] {
  const events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    events.push(...advancePress(state));
    events.push(...advanceMobs(state));
  }
  return events;
}

/** Every shove of a press that went out, in the order they went out. */
function shovesIn(
  events: SimEvent[],
): Extract<SimEvent, { type: 'burstShoved' }>[] {
  return events.filter((event) => event.type === 'burstShoved');
}

/** One shove's frame, keyed by the body each entry is about. */
function frameOf(
  shove: Extract<SimEvent, { type: 'burstShoved' }>,
): Map<number, PressedBody> {
  return new Map(shove.bodies.map((body) => [body.id, body]));
}

/** What one shove of a press did about one body, or absent when it was not in the frame. */
function outcomeFor(
  shove: Extract<SimEvent, { type: 'burstShoved' }>,
  id: number,
): string | undefined {
  const body = frameOf(shove).get(id);
  if (body === undefined) return undefined;
  return body.outcome === 'refused' ? body.refusal : body.outcome;
}

/** How far one body has been carried from where it stood. */
function movedFrom(mob: Mob, from: { x: number; y: number }): number {
  const dx = mob.x - from.x;
  const dy = mob.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** What each tick of a window carried this body, in field units. */
function travelPerTick(state: RunState, mob: Mob, ticks: number): number[] {
  const steps: number[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    const fromX = mob.x;
    const fromY = mob.y;
    advanceMobs(state);
    const movedX = mob.x - fromX;
    const movedY = mob.y - fromY;
    steps.push(Math.sqrt(movedX * movedX + movedY * movedY));
  }
  return steps;
}

function find<T extends SimEvent['type']>(
  events: SimEvent[],
  type: T,
): Extract<SimEvent, { type: T }> {
  const found = events.find((event) => event.type === type);
  expect(found).toBeDefined();
  return found as Extract<SimEvent, { type: T }>;
}

function liveShots(state: RunState): number {
  return state.mobFire.filter((shot) => shot.alive).length;
}

function liveMobs(state: RunState): number {
  return state.mobs.filter((mob) => mob.alive).length;
}

function liveCorpses(state: RunState): number {
  return state.corpses.filter((corpse) => corpse.alive).length;
}

describe('the belch is full only (ADR 0008)', () => {
  it('does nothing below a full reservoir, at any level of charge', () => {
    // There is no partial bomb: one big earned moment, and a partial would
    // dilute the feast set piece and muddy the belch-timing instruments.
    for (const share of [0, 0.25, 0.5, 0.9, 0.999]) {
      const state = quietRun();
      state.reservoir = RESERVOIR_CAPACITY * share;
      armField(state, 6);
      const mobs = fillField(state, 4);
      expect(fireBelch(state)).toEqual([]);
      expect(liveShots(state)).toBe(6);
      expect(mobs.filter((mob) => mob.alive)).toHaveLength(4);
      expect(liveCorpses(state)).toBe(0);
      expect(state.reservoir).toBe(RESERVOIR_CAPACITY * share);
    }
  });

  it('cancels every live shot on the field and empties the reservoir at full', () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 40);
    fireBelch(state);
    expect(liveShots(state)).toBe(0);
    expect(state.reservoir).toBe(0);
  });

  it('emits belched with zero on an empty sky, so a wipe spent on nothing is still legible', () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    expect(fireBelch(state)).toEqual([
      { type: 'belched', cancelled: 0, shoved: 0 },
      { type: 'burstShoved', beganAt: 0, shove: 1, bodies: [] },
    ]);
  });

  it('does nothing on a second press immediately after, by the resource and not by a flag', () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 5);
    expect(fireBelch(state)).not.toEqual([]);
    armField(state, 5);
    const survivors = fillField(state, 3);
    expect(fireBelch(state)).toEqual([]);
    expect(liveShots(state)).toBe(5);
    expect(survivors.filter((mob) => mob.alive)).toHaveLength(3);
  });
});

describe('the gas smothers the whole field (ADR 0008)', () => {
  it('takes every mob-fire shot on the field, however far from the grave', () => {
    // ADR 0008: "The gas smothers every mob-fire shot on the whole field, boss
    // patterns included, and kills nothing." The shots are laid from the top
    // edge to the bottom, so a gas scoped like the burst would leave some.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    for (let index = 0; index < 8; index++) {
      const shot = state.mobFire[index];
      if (shot === undefined)
        throw new Error(`no mobFire pool slot at ${index}`);
      shot.alive = true;
      shot.id = state.nextEntityId;
      state.nextEntityId += 1;
      shot.x = 20 + index * 60;
      shot.y = (index * FIELD_HEIGHT) / 8;
      shot.vx = 0;
      shot.vy = 1;
      shot.halfExtent = 5;
    }

    const events = fireBelch(state);

    expect(liveShots(state)).toBe(0);
    expect(find(events, 'belched').cancelled).toBe(8);
  });

  it('kills nothing by itself, so a field of shots and no near body leaves the crowd whole', () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 12);
    const far = putStillAt(state, state.grave.x, state.grave.y - FAR);
    const stoodAt = { x: far.x, y: far.y };

    const events = fireBelch(state);
    travelFor(state, WHOLE_PUSH);

    expect(far.alive).toBe(true);
    expect(find(events, 'belched').shoved).toBe(0);
    expect(liveCorpses(state)).toBe(0);
    // Untouched in both halves: the gas took the shots and it did not move it.
    expect(far.x).toBe(stoodAt.x);
    expect(far.y).toBe(stoodAt.y);
  });
});

describe('the shove clears the ground around the grave (ADR 0008 as amended)', () => {
  it('shoves what stands inside the reach the row names and leaves what stands outside it', () => {
    // Design record R11, Mark's option 1 of 2026-09-16: the reach is what a
    // press catches. Both bodies are placed against the row rather than at a
    // distance typed here, so a retuned reach carries both cases with it, and
    // the far one is asserted to have entered the field so that what refuses it
    // is the reach and never ADR 0008's older entry gate.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const inside = putStillAt(state, state.grave.x, state.grave.y - NEAR);
    const outside = putStillAt(state, state.grave.x, state.grave.y - FAR);
    const stoodAt = { x: outside.x, y: outside.y };
    expect(hasEntered(outside)).toBe(true);

    const events = fireBelch(state);
    travelFor(state, WHOLE_PUSH);

    expect(find(events, 'belched').shoved).toBe(1);
    expect(distanceFromGrave(state, inside)).toBeCloseTo(NEAR + WHOLE_THROW, 6);
    expect(outside.x).toBe(stoodAt.x);
    expect(outside.y).toBe(stoodAt.y);
  });

  it("the reach is half the field's width, read off the field rather than written down", () => {
    // R11: the basis is the field's width and never its height, its diagonal or
    // its area. A reach off the height would cover about three quarters of the
    // field, which is the whole screen, and that is the option Mark declined.
    expect(BELCH_BURST_RADIUS).toBe(FIELD_WIDTH / 2);
  });

  it('shoves in the number of waves the row declares, and a player counting them counts that many', () => {
    // Design record R3 as superseded 2026-09-15: three discrete pushes, each a
    // full watched one, so that Mark's "two or three shoves" is literal. What a
    // player counts is the surges, and a surge is a tick that carries the body
    // further than the tick before it did: inside one push every step is
    // smaller than the last, so the only way a step can grow is a new push
    // beginning.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const mob = putStillAt(state, state.grave.x + 1, state.grave.y);

    fireBelch(state);
    const steps = travelPerTick(state, mob, WHOLE_PUSH);

    const surges = steps.filter(
      (step, tick) => step > 0 && step > (steps[tick - 1] ?? 0),
    );
    expect(surges).toHaveLength(BELCH_SHOVES);
  });

  it('carries a body standing beside the grave the whole of what its three waves throw', () => {
    // Beside it and never on it: a body at a distance of exactly zero has no
    // direction to be thrown along and is refused, the same way the bell's own
    // push refuses it.
    //
    // Retitled 2026-09-16 under ruling R11, which moved the reach and left the
    // three throw rows where Mark set them on 2026-09-15. It used to promise
    // that the three waves carried a body clear of the belch's own reach, which
    // was arithmetic off the old 160 and cannot be made to hold again without
    // overruling his pick. What stands in its place is R11's own sentence: the
    // reach is what a press catches and the throw is how far each caught body
    // travels.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const beside = putStillAt(state, state.grave.x + 1, state.grave.y);

    fireBelch(state);
    travelFor(state, WHOLE_PUSH);

    expect(distanceFromGrave(state, beside)).toBeCloseTo(WHOLE_THROW + 1, 6);
  });

  it('leaves a body standing exactly on the grave where it stands', () => {
    // It has no away direction, so there is nothing to throw it along. The bell
    // already answered this once (bell.ts pushTarget, on an away vector of zero
    // length) and the belch follows it rather than writing a second answer.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const onIt = putStillAt(state, state.grave.x, state.grave.y);

    const events = fireBelch(state);
    travelFor(state, WHOLE_PUSH);

    expect(onIt.x).toBe(state.grave.x);
    expect(onIt.y).toBe(state.grave.y);
    expect(find(events, 'belched').shoved).toBe(0);
  });

  it('strikes a body it has already caught exactly once, whatever its later shoves sweep', () => {
    // A body the press has already thrown keeps the shoves it was given: a
    // shove landing on a shove in flight replaces it rather than following it,
    // so re-arming would cost the body the rest of what it was owed. That is
    // the bell's toll.struck shape, read here off the press's own caught
    // record.
    //
    // Retitled 2026-09-16 under slice J3, and this is the second retitle it has
    // taken. It used to promise that a body walking in after the press landed
    // took nothing, which was true while the press read the field once; Mark
    // ruled on 2026-09-16 that everything within the eruption is pushed on each
    // erupt animation, so a latecomer is now thrown by the next shove and that
    // half is pinned by *throws a body that walks into the reach after the
    // press landed, on the next shove*. What stands here is the strike-once
    // rule, which is what this test was always for. Before that it said the
    // caught body ended past the reach, which was the clear-the-reach sentence
    // ruling R11 withdrew.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const caught = putStillAt(state, state.grave.x + 1, state.grave.y);

    fireBelch(state);
    travelFor(state, WHOLE_PUSH);

    expect(distanceFromGrave(state, caught)).toBeCloseTo(WHOLE_THROW + 1, 6);
  });

  it('still owes its later waves to a body its first wave already carried', () => {
    // One strike carries all three, so a body the first wave has already moved
    // is not re-tested against the reach and does not lose the rest.
    //
    // Retitled 2026-09-16 under ruling R11, for the same reason as the test
    // above: it used to say the first wave carried the body out of reach, which
    // was true only of the old 160. What it is really for is that the press
    // owes its later waves to a body it has already begun to move, so the body
    // starts on the reach's own edge and every wave it is owed is counted.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const edge = putStillAt(
      state,
      state.grave.x,
      state.grave.y - BELCH_BURST_RADIUS,
    );

    fireBelch(state);
    travelFor(state, SHOVE_TICKS);
    const afterOne = distanceFromGrave(state, edge);
    travelFor(state, WHOLE_PUSH);

    expect(afterOne).toBeCloseTo(BELCH_BURST_RADIUS + BELCH_SHOVE_THROW, 6);
    expect(distanceFromGrave(state, edge)).toBeCloseTo(
      BELCH_BURST_RADIUS + WHOLE_THROW,
      6,
    );
  });

  it('reports one shove for one body, carrying everything all three waves carried', () => {
    // One report per impulse and never one per push, which is what slice H
    // ruled when it put the report at the impulse's end: splitting the travel
    // would mean splitting the report.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    putStillAt(state, state.grave.x + 1, state.grave.y);

    fireBelch(state);
    const events = travelFor(state, WHOLE_PUSH);

    const shoves = events.filter((event) => event.type === 'mobShoved');
    expect(shoves).toHaveLength(1);
    const only = shoves[0];
    expect(only?.source).toBe('belch');
    expect(only?.displacement).toBeCloseTo(WHOLE_THROW, 6);
  });

  it("never moves a boss or a set piece's source (ADR 0007)", () => {
    // The seam answers whether a body may be pushed and it answers for the
    // belch exactly as it answers for the bell, so an authored pattern and the
    // place the field arrives from can never be smeared by a press.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const boss = spawnBoss(state, 'undertaker');
    boss.x = state.grave.x + 1;
    boss.y = state.grave.y;
    const piece = placeSetPiece(state);
    piece.open = true;
    piece.x = state.grave.x - 1;
    piece.y = state.grave.y;
    const bossStood = { x: boss.x, y: boss.y };
    const sourceStood = { x: piece.x, y: piece.y };

    const events = fireBelch(state);
    travelFor(state, WHOLE_PUSH);

    expect(boss.x).toBe(bossStood.x);
    expect(boss.y).toBe(bossStood.y);
    expect(piece.x).toBe(sourceStood.x);
    expect(piece.y).toBe(sourceStood.y);
    // And neither is counted as thrown, because neither was.
    expect(find(events, 'belched').shoved).toBe(0);
  });

  it('reaches the same distance in every direction from the grave', () => {
    // A radius and not a box: the shove leaves the grave, so a body to the side
    // at the same distance as one ahead reads the same way.
    const offsets: readonly [number, number][] = [
      [0, -NEAR],
      [0, NEAR],
      [NEAR, 0],
      [-NEAR, 0],
    ];
    for (const [dx, dy] of offsets) {
      const state = quietRun();
      state.reservoir = RESERVOIR_CAPACITY;
      // The grave stands in the middle of the field, because from its own
      // starting mark a body thrown down the field runs into the bottom bound
      // and loses the tail of its throw. That the bound refuses a throw is
      // mobs.ts's own promise; what is asserted here is that the reach and the
      // throw are the same in every direction when nothing refuses them.
      state.grave.y = FIELD_HEIGHT / 2;
      const mob = putStillAt(state, state.grave.x + dx, state.grave.y + dy);
      fireBelch(state);
      travelFor(state, WHOLE_PUSH);
      const movedX = mob.x - (state.grave.x + dx);
      const movedY = mob.y - (state.grave.y + dy);
      const travelled = Math.sqrt(movedX * movedX + movedY * movedY);
      expect(`${dx},${dy}: ${travelled.toFixed(3)}`).toBe(
        `${dx},${dy}: ${WHOLE_THROW.toFixed(3)}`,
      );
    }
  });

  it('clears the air and leaves the bodies outside the radius walking', () => {
    // ADR 0008: "A press that clears the air and leaves the mobs walking hands
    // the wave back to the storm." The crowd outside the reach is untouched by
    // either half of the press.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 20);
    const crowd = [
      putStillAt(state, state.grave.x, state.grave.y - FAR),
      putStillAt(state, 60, state.grave.y - FAR),
      putStillAt(state, FIELD_WIDTH - 60, state.grave.y - FAR),
    ];
    const stoodAt = crowd.map((mob) => ({ x: mob.x, y: mob.y }));

    fireBelch(state);
    travelFor(state, WHOLE_PUSH);

    expect(liveShots(state)).toBe(0);
    expect(crowd.filter((mob) => mob.alive)).toHaveLength(crowd.length);
    expect(crowd.map((mob) => ({ x: mob.x, y: mob.y }))).toEqual(stoodAt);
  });

  it('leaves a body still above the top edge where it stands, whatever the radius says', () => {
    // ADR 0008's scope limit stood through the split: reaching past the edge
    // would move authored content a player never saw arrive.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    // The grave is driven up under the top edge, because from its starting mark
    // nothing above the edge is ever inside the reach and the entry gate would
    // be asserted over a case the radius already refused.
    state.grave.y = NEAR;
    const above = putStillAt(state, state.grave.x, 0);
    expect(hasEntered(above)).toBe(false);
    expect(state.grave.y - above.y).toBeLessThan(BELCH_BURST_RADIUS);
    const stoodAt = { x: above.x, y: above.y };

    fireBelch(state);
    travelFor(state, WHOLE_PUSH);

    expect(above.alive).toBe(true);
    expect(above.x).toBe(stoodAt.x);
    expect(above.y).toBe(stoodAt.y);
  });

  it('leaves no corpse behind, because nothing died', () => {
    // The swallow economy is handed nothing by a press now: what the belch buys
    // is ground rather than food.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const near = [
      putStillAt(state, state.grave.x, state.grave.y - NEAR),
      putStillAt(state, state.grave.x - NEAR, state.grave.y),
    ];
    expect(liveCorpses(state)).toBe(0);

    fireBelch(state);
    travelFor(state, WHOLE_PUSH);

    expect(liveMobs(state)).toBe(near.length);
    expect(liveCorpses(state)).toBe(0);
  });

  it('carries the cancelled shot count and the shoved body count on one belched event', () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 17);
    putStillAt(state, state.grave.x, state.grave.y - NEAR);
    putStillAt(state, state.grave.x, state.grave.y - FAR);

    const events = fireBelch(state);

    const belched = find(events, 'belched');
    expect([belched.cancelled, belched.shoved]).toEqual([17, 1]);
  });

  it("carries the field's own drift as well, so a throw up the field nets less than a throw down it", () => {
    // Design record R11's closing paragraph, ruled 2026-09-16: the scroll
    // composes with the shove for both lines that push, and step.ts is not
    // touched. Exempting a body under a shove would silently retune the bell,
    // which starts its push through the same seam, and keying the exemption on
    // the belch would be a world rule keyed on which line pushed (ADRs 0016 and
    // 0042). This test is here so a later slice cannot quietly exempt one line.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    // Mid-field, so neither throw runs into a bound, and the lines that can
    // kill a standing body are put down so what moves these two is the press
    // and the scroll alone. skullStream is the birthright and an invariant
    // holds it above zero, so its fixtures outlive it instead.
    state.grave.y = FIELD_HEIGHT / 2;
    state.levels.bell = 0;
    state.levels.territory = 0;
    state.levels.wisps = 0;
    const up = putStillAt(state, state.grave.x, state.grave.y - NEAR);
    const down = putStillAt(state, state.grave.x, state.grave.y + NEAR);
    up.hp = OUTLIVES_THE_WINDOW;
    down.hp = OUTLIVES_THE_WINDOW;
    const stoodAt = { up: up.y, down: down.y };

    const execution = createExecution(state);
    for (let tick = 0; tick < WHOLE_PUSH; tick++) {
      executeTick(execution, { move: { x: 0, y: 0 }, belch: tick === 0 });
    }

    const drift = WHOLE_PUSH * SCROLL_SPEED;
    expect(up.y - stoodAt.up).toBeCloseTo(drift - WHOLE_THROW, 6);
    expect(down.y - stoodAt.down).toBeCloseTo(drift + WHOLE_THROW, 6);
  });

  it("never re-arms a shove still in flight: its spacing is at least one shove's own length", () => {
    // Slice H2 found this the expensive way (round two progress note section
    // 10): a spacing narrower than SHOVE_TICKS makes a later push replace the
    // one in flight rather than follow it, so the three stop being three. The
    // two figures live in two modules and nothing else holds them together.
    expect(BELCH_SHOVE_SPACING).toBeGreaterThanOrEqual(SHOVE_TICKS);
  });
});

describe('the belch takes health off nothing (ADR 0008 as amended)', () => {
  it('takes no health off anything, boss included', () => {
    // Mark's ruling 3 of 2026-09-15 and ADR 0008 as amended: the belch stopped
    // killing and became the game's one big push, so no press anywhere takes a
    // point of health off any body on the field. It is written first and on its
    // own because it is the ruling most easily undone by a later change that
    // means well.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 9);
    const near = putStillAt(state, state.grave.x + 1, state.grave.y);
    const far = putStillAt(state, state.grave.x, state.grave.y - FAR);
    const boss = spawnBoss(state, 'undertaker');
    boss.x = state.grave.x - 1;
    boss.y = state.grave.y;
    const health = { near: near.hp, boss: boss.hp, phase: boss.phaseIndex };

    const events = fireBelch(state);
    travelFor(state, WHOLE_PUSH);

    expect(near.alive).toBe(true);
    expect(near.hp).toBe(health.near);
    expect(far.alive).toBe(true);
    expect(boss.hp).toBe(health.boss);
    expect(boss.phaseIndex).toBe(health.phase);
    expect(liveCorpses(state)).toBe(0);
    expect(events.filter((event) => event.type === 'mobDamaged')).toEqual([]);
    expect(events.filter((event) => event.type === 'mobKilled')).toEqual([]);
  });
});

describe("the press's own record of what it reached (#124)", () => {
  /**
   * The record a press's first shove wrote down, keyed by the body it is about.
   *
   * It comes off the press's own first burstShoved rather than off `belched`,
   * which is where slice J2 put it: a press writes one frame per shove now and
   * a frame taken sixty ticks later cannot ride on an event emitted at the
   * press's own tick (#124).
   */
  function recordOf(events: SimEvent[]): Map<number, PressedBody> {
    const shoves = shovesIn(events);
    expect(shoves).toHaveLength(1);
    return frameOf(shoves[0]!);
  }

  /** Which gate turned a body away, or what the press did with it instead. */
  function gateFor(
    record: Map<number, PressedBody>,
    id: number,
  ): string | undefined {
    const body = record.get(id);
    if (body === undefined) return undefined;
    return body.outcome === 'refused' ? body.refusal : body.outcome;
  }

  it('records every body in the frame, moved or not', () => {
    // Mark's standing rule of 2026-09-16: everything worth measuring has a
    // representation in the tape. A press with a hundred bodies in the frame
    // and none in reach and a press with nothing alive both read shoved 0, and
    // this is what tells them apart.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const near = putStillAt(state, state.grave.x, state.grave.y - NEAR);
    const far = putStillAt(state, state.grave.x, state.grave.y - FAR);

    const record = recordOf(fireBelch(state));

    expect([...record.keys()].sort()).toEqual([near.id, far.id].sort());
    expect(gateFor(record, near.id)).toBe('moved');
    expect(gateFor(record, far.id)).toBe('outOfReach');
    // The distance is the whole reason the record exists: his sighting is about
    // bodies at about the same distance going different ways.
    expect(record.get(near.id)?.distance).toBeCloseTo(NEAR, 9);
    expect(record.get(far.id)?.distance).toBeCloseTo(FAR, 9);
  });

  it('records its own reason against a body that has not entered, one outside the reach, one with no direction to be thrown along and one that may not be pushed', () => {
    // The reasons are the gates the code actually runs, in the order it runs
    // them, and never a diagnosis laid over them. There is deliberately no
    // already-dead reason: the target seam skips a dead slot before the belch
    // ever sees it, so a dead body is never in the frame at all.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const above = putStillAt(state, state.grave.x, -20);
    const far = putStillAt(state, state.grave.x, state.grave.y - FAR);
    const onTop = putStillAt(state, state.grave.x, state.grave.y);
    const boss = spawnBoss(state, 'undertaker');
    boss.x = state.grave.x + 1;
    boss.y = state.grave.y - NEAR;

    const record = recordOf(fireBelch(state));

    expect(hasEntered(above)).toBe(false);
    expect(gateFor(record, above.id)).toBe('notEntered');
    expect(gateFor(record, far.id)).toBe('outOfReach');
    expect(gateFor(record, onTop.id)).toBe('noDirection');
    expect(gateFor(record, boss.id)).toBe('notPushable');
    for (const id of [above.id, far.id, onTop.id, boss.id]) {
      expect(record.get(id)?.outcome, `body ${id}`).toBe('refused');
    }
  });

  it('records a moved count that is the same number shoved has always been', () => {
    // shoved keeps its exact meaning, the count of bodies the press moved, so
    // no batch recorded before this record existed reads that figure
    // differently afterwards.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    for (let at = 0; at < 4; at++) {
      putStillAt(state, state.grave.x + at * 10, state.grave.y - NEAR);
    }
    putStillAt(state, state.grave.x, state.grave.y - FAR);

    const events = fireBelch(state);
    const belched = find(events, 'belched');
    const first = shovesIn(events)[0]!;

    expect(
      first.bodies.filter((body) => body.outcome === 'moved'),
    ).toHaveLength(belched.shoved);
    expect(belched.shoved).toBe(4);
  });

  it("records a boss and a set piece's source, and still moves neither of them", () => {
    // ADR 0007: an authored pattern is never smeared by a push, and the seam
    // answers that rather than a branch in the belch. Writing them down is what
    // makes the refusal readable off a tape rather than invisible.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const boss = spawnBoss(state, 'undertaker');
    boss.x = state.grave.x + 1;
    boss.y = state.grave.y - NEAR;
    const piece = placeSetPiece(state);
    piece.open = true;
    piece.x = state.grave.x - 1;
    piece.y = state.grave.y - NEAR;
    const stood = { bossX: boss.x, bossY: boss.y, x: piece.x, y: piece.y };

    const record = recordOf(fireBelch(state));
    travelFor(state, WHOLE_PUSH);

    expect(gateFor(record, boss.id)).toBe('notPushable');
    expect(gateFor(record, piece.id)).toBe('notPushable');
    expect([boss.x, boss.y]).toEqual([stood.bossX, stood.bossY]);
    expect([piece.x, piece.y]).toEqual([stood.x, stood.y]);
  });
});

/**
 * Every shove of a press is a press of its own over whatever stands inside the
 * reach at its own tick (#124, Mark's ruling of 2026-09-16: "Everything within
 * the eruption should be pushed on each erupt animation").
 *
 * The press is left on the run and its own clock brings the later shoves out,
 * so every test here runs whole ticks through `travelFor` rather than advancing
 * the mobs alone.
 */
describe('every shove of a press throws what stands inside it (#124)', () => {
  /** The tick of a press at which its next shove goes out. */
  const NEXT_SHOVE = BELCH_SHOVE_SPACING;

  /**
   * The press's own tick, in the order the tick runs it: the belch fires and
   * then the bodies move.
   *
   * The press's clock and the impulse's clock only stay in step when the press
   * tick carries its own mob advance, because `advancePress` runs before
   * `fireBelch` and so never counts the tick the press landed on while the
   * impulse it started counts it at once (step.ts).
   */
  function pressNow(state: RunState): SimEvent[] {
    const events = fireBelch(state);
    events.push(...advanceMobs(state));
    return events;
  }

  /** A body put inside the reach after the press has landed, as one walking in. */
  function walkIntoReach(state: RunState, mob: Mob): void {
    mob.x = state.grave.x;
    mob.y = state.grave.y - NEAR;
  }

  it('throws a body that walks into the reach after the press landed, on the next shove', () => {
    // The whole of the slice in one sentence. Before it, the press read the
    // field once and its later shoves swept a circle the crowd had walked back
    // into and moved nobody (Mark's tape of 2026-09-16, seed 1999305952: its
    // second shove moved 0 of 3 and its third 0 of 10).
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const latecomer = putStillAt(state, state.grave.x, state.grave.y - FAR);

    pressNow(state);
    travelFor(state, NEXT_SHOVE - 1);
    walkIntoReach(state, latecomer);
    const stoodAt = { x: latecomer.x, y: latecomer.y };
    const shove = travelFor(state, 1);
    travelFor(state, WHOLE_PUSH);

    // Two shoves and not three, because the press had already spent one.
    expect(outcomeFor(shovesIn(shove)[0]!, latecomer.id)).toBe('moved');
    expect(movedFrom(latecomer, stoodAt)).toBeCloseTo(
      (BELCH_SHOVES - 1) * BELCH_SHOVE_THROW,
      6,
    );
  });

  it('leaves a body this press already caught to the shoves it was given', () => {
    // A shove landing on a shove in flight replaces it rather than following
    // it, so re-arming a body the press already threw would cost it the rest of
    // what it was owed. The skip is by id off the press's own record.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const caught = putStillAt(state, state.grave.x + 1, state.grave.y);

    const landed = pressNow(state);
    const later = travelFor(state, WHOLE_PUSH - 1);

    expect(outcomeFor(shovesIn(landed)[0]!, caught.id)).toBe('moved');
    for (const shove of shovesIn(later)) {
      expect(outcomeFor(shove, caught.id), `shove ${shove.shove}`).toBe(
        'carried',
      );
    }
    expect(distanceFromGrave(state, caught)).toBeCloseTo(WHOLE_THROW + 1, 6);
  });

  it('throws a body a bell toll is carrying when a shove reaches it', () => {
    // The separating test: the skip is "already caught by this press" and never
    // "already carrying a shove". A toll's cone is on the field for most of a
    // press, so the wider rule would leave a body standing under a ring
    // untouched, which is the sighting this slice answers arriving by another
    // route. The travel is read as the waves received rather than as a total,
    // because what the bell's own shove had already covered rides with it.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const tolled = putStillAt(state, state.grave.x, state.grave.y - NEAR);
    startShove(tolled.impulse, 'bell', tolled.id, 0, -1, 40, 1, 0);
    advanceMobs(state);
    expect(tolled.impulse.source).toBe('bell');

    const landed = pressNow(state);

    expect(outcomeFor(shovesIn(landed)[0]!, tolled.id)).toBe('moved');
    expect(tolled.impulse.source).toBe('belch');
    expect(tolled.impulse.shovesLeft).toBe(BELCH_SHOVES - 1);
  });

  it('gives a body caught by the second shove two shoves and one caught by the third a single shove', () => {
    // The press always ends exactly where it began plus its own length, so what
    // a latecomer is given is what is left rather than a fresh three.
    for (const shove of [2, 3]) {
      const state = quietRun();
      state.reservoir = RESERVOIR_CAPACITY;
      const latecomer = putStillAt(state, state.grave.x, state.grave.y - FAR);

      pressNow(state);
      travelFor(state, NEXT_SHOVE * (shove - 1) - 1);
      walkIntoReach(state, latecomer);
      const stoodAt = { x: latecomer.x, y: latecomer.y };
      travelFor(state, 1 + WHOLE_PUSH);

      const owed = BELCH_SHOVES - (shove - 1);
      expect(`${shove}: ${movedFrom(latecomer, stoodAt).toFixed(3)}`).toBe(
        `${shove}: ${(owed * BELCH_SHOVE_THROW).toFixed(3)}`,
      );
    }
  });

  it('ends where it always ended, whatever walked into it', () => {
    // No tail: a body the last shove catches carries one shove and finishes
    // with the press rather than after it, so the last tick anything is carried
    // is the press's own last tick however late a body joined.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const caught = putStillAt(state, state.grave.x + 1, state.grave.y);
    const latecomer = putStillAt(state, state.grave.x, state.grave.y - FAR);

    pressNow(state);
    let lastCarried = 0;
    for (let tick = 1; tick <= WHOLE_PUSH + SHOVE_TICKS; tick++) {
      if (tick === NEXT_SHOVE * (BELCH_SHOVES - 1)) {
        walkIntoReach(state, latecomer);
      }
      const stood = [
        { x: caught.x, y: caught.y },
        { x: latecomer.x, y: latecomer.y },
      ];
      travelFor(state, 1);
      const carried =
        movedFrom(caught, stood[0]!) > 0 || movedFrom(latecomer, stood[1]!) > 0;
      if (carried) lastCarried = tick;
    }

    // The press's own tick is tick zero, so its last carrying tick is one short
    // of its whole length.
    expect(lastCarried).toBe(WHOLE_PUSH - 1);
    expect(state.press).toBe(null);
  });

  it('throws the crowd of a press whose circle was empty at its first shove and full at its third', () => {
    // Mark's own case, turned into a test: he watched three rings sweep a
    // crowd and move nobody after the first.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;

    pressNow(state);
    travelFor(state, NEXT_SHOVE * (BELCH_SHOVES - 1) - 1);
    const crowd = [
      putStillAt(state, state.grave.x + 10, state.grave.y - NEAR),
      putStillAt(state, state.grave.x - 10, state.grave.y - NEAR),
      putStillAt(state, state.grave.x + NEAR, state.grave.y),
    ];
    const stoodAt = crowd.map((mob) => ({ x: mob.x, y: mob.y }));
    const last = travelFor(state, 1);
    travelFor(state, WHOLE_PUSH);

    const frame = shovesIn(last)[0]!;
    expect(frame.shove).toBe(BELCH_SHOVES);
    for (const [at, mob] of crowd.entries()) {
      expect(outcomeFor(frame, mob.id), `body ${at}`).toBe('moved');
      expect(movedFrom(mob, stoodAt[at]!)).toBeCloseTo(BELCH_SHOVE_THROW, 6);
    }
  });

  it('writes one frame per shove, taken at that shove own tick', () => {
    // Without the shove axis, a press whose later shoves moved nobody and a
    // press whose three all landed read identically in every tape we hold.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const standing = putStillAt(state, state.grave.x + 1, state.grave.y);

    const landed = pressNow(state);
    const later = travelFor(state, WHOLE_PUSH - 1);
    const arrived = putStillAt(state, state.grave.x - 1, state.grave.y);

    const shoves = [...shovesIn(landed), ...shovesIn(later)];
    expect(shoves.map((shove) => shove.shove)).toEqual([1, 2, 3]);
    expect(new Set(shoves.map((shove) => shove.beganAt))).toEqual(
      new Set([state.press?.beganAt ?? 0]),
    );
    // The body that was not on the field yet is in no frame at all, which is
    // what makes each frame the field at its own tick rather than at the press.
    for (const shove of shoves) {
      expect(outcomeFor(shove, standing.id)).not.toBe(undefined);
      expect(outcomeFor(shove, arrived.id)).toBe(undefined);
    }
  });

  it('records a body refused by each of the four gates with its own reason, on whichever shove refused it', () => {
    // The gates do not change and there is no fifth: the reasons are the ones
    // pressOneBody runs, on every shove rather than on the first alone.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const above = putStillAt(state, state.grave.x, -20);
    const far = putStillAt(state, state.grave.x, state.grave.y - FAR);
    const onTop = putStillAt(state, state.grave.x, state.grave.y);
    const boss = spawnBoss(state, 'undertaker');
    boss.x = state.grave.x + 1;
    boss.y = state.grave.y - NEAR;

    pressNow(state);
    const later = travelFor(state, NEXT_SHOVE);

    const second = shovesIn(later)[0]!;
    expect(second.shove).toBe(2);
    expect(outcomeFor(second, above.id)).toBe('notEntered');
    expect(outcomeFor(second, far.id)).toBe('outOfReach');
    expect(outcomeFor(second, onTop.id)).toBe('noDirection');
    expect(outcomeFor(second, boss.id)).toBe('notPushable');
  });

  it('records a body it has already caught as carried, on every later shove', () => {
    // Never an absence and never an unexplained unmoved: a shove sweeping a
    // crowd that is all in flight would otherwise read as an empty frame, which
    // is the unreadable zero the record exists to kill.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const crowd = [
      putStillAt(state, state.grave.x + 10, state.grave.y),
      putStillAt(state, state.grave.x - 10, state.grave.y),
    ];

    pressNow(state);
    const later = travelFor(state, WHOLE_PUSH);

    for (const shove of shovesIn(later)) {
      expect(shove.bodies.length, `shove ${shove.shove}`).toBe(crowd.length);
      for (const mob of crowd) {
        expect(outcomeFor(shove, mob.id), `shove ${shove.shove}`).toBe(
          'carried',
        );
      }
    }
  });

  it('records a first-shove moved count that is the same number shoved has always been', () => {
    // shoved keeps its exact meaning, so no batch recorded before the shove
    // axis existed reads that figure differently afterwards.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    for (let at = 0; at < 3; at++) {
      putStillAt(state, state.grave.x + at * 10, state.grave.y - NEAR);
    }
    putStillAt(state, state.grave.x, state.grave.y - FAR);

    const landed = pressNow(state);

    const first = shovesIn(landed)[0]!;
    expect(
      first.bodies.filter((body) => body.outcome === 'moved'),
    ).toHaveLength(find(landed, 'belched').shoved);
    expect(find(landed, 'belched').shoved).toBe(3);
  });

  it("records a boss and a set piece's source on every shove and still moves neither", () => {
    // ADR 0007: the seam answers whether a body may be pushed, on every shove
    // exactly as on the first, and writing the refusal down is what makes it
    // readable off a tape rather than invisible.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const boss = spawnBoss(state, 'undertaker');
    boss.x = state.grave.x + 1;
    boss.y = state.grave.y - NEAR;
    const piece = placeSetPiece(state);
    piece.open = true;
    piece.x = state.grave.x - 1;
    piece.y = state.grave.y - NEAR;
    const stood = { bossX: boss.x, bossY: boss.y, x: piece.x, y: piece.y };

    const landed = pressNow(state);
    const later = travelFor(state, WHOLE_PUSH - 1);

    for (const shove of [...shovesIn(landed), ...shovesIn(later)]) {
      expect(outcomeFor(shove, boss.id), `shove ${shove.shove}`).toBe(
        'notPushable',
      );
      expect(outcomeFor(shove, piece.id), `shove ${shove.shove}`).toBe(
        'notPushable',
      );
    }
    expect([boss.x, boss.y]).toEqual([stood.bossX, stood.bossY]);
    expect([piece.x, piece.y]).toEqual([stood.x, stood.y]);
  });

  it('takes no health off anything on any of its shoves, boss included', () => {
    // Mark's ruling 3 of 2026-09-15 held across all three shoves: a press that
    // throws three times still takes not one point off anything.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const near = putStillAt(state, state.grave.x + 1, state.grave.y);
    const boss = spawnBoss(state, 'undertaker');
    boss.x = state.grave.x - 1;
    boss.y = state.grave.y;
    const health = { near: near.hp, boss: boss.hp, phase: boss.phaseIndex };

    const landed = pressNow(state);
    const later = travelFor(state, WHOLE_PUSH - 1);

    expect(near.hp).toBe(health.near);
    expect(boss.hp).toBe(health.boss);
    expect(boss.phaseIndex).toBe(health.phase);
    expect(liveCorpses(state)).toBe(0);
    for (const event of [...landed, ...later]) {
      expect(event.type).not.toBe('mobDamaged');
      expect(event.type).not.toBe('mobKilled');
    }
  });

  it('never catches a corpse a shove is carrying', () => {
    // Checked rather than left to be rediscovered: the storm's target seam
    // holds mobs, the boss and the set piece's source and no corpses at all
    // (stormTargets.ts), so a later shove never sees one. A shove re-throwing
    // corpses is not this slice's work.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const corpse = state.corpses[0]!;
    corpse.alive = true;
    corpse.id = 909;
    corpse.x = state.grave.x + 5;
    corpse.y = state.grave.y;
    startShove(corpse.impulse, 'belch', 11, 0, -1, BELCH_SHOVE_THROW, 1, 0);
    const owed = corpse.impulse.shovesLeft;

    pressNow(state);
    const later = travelFor(state, NEXT_SHOVE);

    for (const shove of shovesIn(later)) {
      expect(outcomeFor(shove, corpse.id)).toBe(undefined);
    }
    expect(corpse.impulse.shovesLeft).toBe(owed);
  });

  it('replaces a press that still owes shoves, and runs its own shoves from its own tick', () => {
    // Two presses inside one press's length is reachable on one feast, because
    // RESERVOIR_CAPACITY is FEAST_PAYOUT exactly (tuning.ts). The newer press
    // replaces the live one whole, so a body the older one caught is not
    // protected by its record any more.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const caught = putStillAt(state, state.grave.x + 1, state.grave.y);

    pressNow(state);
    travelFor(state, NEXT_SHOVE);
    state.reservoir = RESERVOIR_CAPACITY;
    const again = pressNow(state);

    expect(state.press?.beganAt).toBe(state.tick);
    expect(state.press?.shovesLeft).toBe(BELCH_SHOVES - 1);
    // The older press's record went with it, so the second press throws the
    // body the first one had caught rather than skipping it.
    expect(outcomeFor(shovesIn(again)[0]!, caught.id)).toBe('moved');
    expect(caught.impulse.shovesLeft).toBe(BELCH_SHOVES - 1);
  });
});
