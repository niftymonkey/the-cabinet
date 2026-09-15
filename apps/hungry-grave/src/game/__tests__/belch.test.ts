/**
 * The one button (ADR 0008 as amended): full only, gas everywhere, a shove
 * nearby. Expected values come from the ADR, from the design record's ruling R3
 * as superseded on 2026-09-15, and from dispatch 5's plan section 6.14.
 */

import { describe, expect, it } from 'vitest';

import {
  BELCH_BURST_RADIUS,
  BELCH_SHOVE_SPACING,
  BELCH_SHOVE_THROW,
  BELCH_SHOVES,
  fireBelch,
} from '../belch';
import { spawnBoss } from '../bosses/phases';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import type { Mob } from '../mobs';
import { advanceMobs, hasEntered, spawnMob } from '../mobs';
import type { RunState } from '../run';
import { createRun } from '../run';
import { SHOVE_TICKS } from '../shove';
import { placeSetPiece } from '../stage/setPiece';
import { PROCESSION_WAVES } from '../stage/waves';
import { RESERVOIR_CAPACITY } from '../tuning';

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
 * The mobs advanced for this many ticks, with everything they reported.
 *
 * Only the mobs, because the belch starts its shoves at the press and nothing
 * else on the run has to run for a body to be carried by one.
 */
function travelFor(state: RunState, ticks: number): SimEvent[] {
  const events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) events.push(...advanceMobs(state));
  return events;
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

  it("carries a body standing beside the grave clear of the belch's own reach", () => {
    // Beside it and never on it: a body at a distance of exactly zero has no
    // direction to be thrown along and is refused, the same way the bell's own
    // push refuses it. The three throws total more than the reach, which is the
    // whole reason those figures were picked (research section 5, option 2).
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const beside = putStillAt(state, state.grave.x + 1, state.grave.y);

    fireBelch(state);
    travelFor(state, WHOLE_PUSH);

    expect(distanceFromGrave(state, beside)).toBeGreaterThan(
      BELCH_BURST_RADIUS,
    );
    expect(WHOLE_THROW).toBeGreaterThan(BELCH_BURST_RADIUS);
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

  it('strikes each body once, and a body that walks in afterwards takes nothing', () => {
    // The body set is captured the tick the press lands, which is the bell's
    // toll.struck shape reached by construction: the impulse's own row brings
    // the later pushes in, so nothing re-tests the reach and nothing new can
    // join the press after it has landed.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const caught = putStillAt(state, state.grave.x + 1, state.grave.y);

    fireBelch(state);
    travelFor(state, BELCH_SHOVE_SPACING);
    const latecomer = putStillAt(state, state.grave.x - 1, state.grave.y);
    const stoodAt = { x: latecomer.x, y: latecomer.y };
    travelFor(state, WHOLE_PUSH);

    expect(distanceFromGrave(state, caught)).toBeGreaterThan(
      BELCH_BURST_RADIUS,
    );
    expect(latecomer.x).toBe(stoodAt.x);
    expect(latecomer.y).toBe(stoodAt.y);
  });

  it('still owes its later waves to a body its first wave carried out of reach', () => {
    // One strike carries all three, so a body thrown past the reach by the
    // first is not re-tested and does not lose the rest. A body on the edge
    // ends a whole throw past where a single push would have left it.
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

    expect(afterOne).toBeGreaterThan(BELCH_BURST_RADIUS);
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

    expect(events.filter((event) => event.type === 'belched')).toEqual([
      { type: 'belched', cancelled: 17, shoved: 1 },
    ]);
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
