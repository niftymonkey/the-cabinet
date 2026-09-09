/**
 * The one button (ADR 0008): full only, gas everywhere, burst nearby. Expected
 * values come from the ADR and from dispatch 5's plan section 6.14.
 */

import { describe, expect, it } from 'vitest';

import { BELCH_BURST_RADIUS, fireBelch } from '../belch';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import type { Mob } from '../mobs';
import { hasEntered, spawnMob } from '../mobs';
import type { RunState } from '../run';
import { createRun } from '../run';
import { PROCESSION_ROWS } from '../stage/rows';
import { RESERVOIR_CAPACITY } from '../tuning';

// Comfortably inside and comfortably outside the burst, so a retuned radius
// moves neither case across the line.
const NEAR = BELCH_BURST_RADIUS / 2;
const FAR = BELCH_BURST_RADIUS * 2;

function quietRun(seed = 16): RunState {
  const run = createRun(seed);
  run.stage.firedRows = PROCESSION_ROWS.length;
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
  )!;
  mob.beat = 0;
  return mob;
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
      { type: 'belched', cancelled: 0, killed: 0 },
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

  it('kills nothing by itself, so a field of shots and no near mob pays no kill', () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 12);
    const far = putMobAt(state, state.grave.x, state.grave.y - FAR);

    const events = fireBelch(state);

    expect(far.alive).toBe(true);
    expect(find(events, 'belched').killed).toBe(0);
    expect(liveCorpses(state)).toBe(0);
  });
});

describe('the burst kills nearby (ADR 0008)', () => {
  it('kills the mobs within a local radius of the grave and nothing further out', () => {
    // ADR 0008: "The burst kills the mobs within a local radius of the grave."
    // What made the belch dominant was never its price but its scope, because
    // one press resolved the entire encounter.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const near = putMobAt(state, state.grave.x, state.grave.y - NEAR);
    const far = putMobAt(state, state.grave.x, state.grave.y - FAR);

    const events = fireBelch(state);

    expect(near.alive).toBe(false);
    expect(far.alive).toBe(true);
    expect(find(events, 'belched').killed).toBe(1);
    expect(events.filter((event) => event.type === 'mobKilled')).toHaveLength(
      1,
    );
  });

  it('reaches the same distance in every direction from the grave', () => {
    // A radius and not a box: the burst is an eruption out of the grave, so a
    // mob to the side at the same distance as one ahead reads the same way.
    const offsets: readonly [number, number][] = [
      [0, -NEAR],
      [0, NEAR],
      [NEAR, 0],
      [-NEAR, 0],
    ];
    for (const [dx, dy] of offsets) {
      const state = quietRun();
      state.reservoir = RESERVOIR_CAPACITY;
      const mob = putMobAt(state, state.grave.x + dx, state.grave.y + dy);
      fireBelch(state);
      expect(`${dx},${dy}: ${mob.alive}`).toBe(`${dx},${dy}: false`);
    }
  });

  it('clears the air and leaves the mobs outside the radius walking', () => {
    // ADR 0008: "A press that clears the air and leaves the mobs walking hands
    // the wave back to the storm." The crowd survives the press it used to be
    // deleted by.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 20);
    const crowd = [
      putMobAt(state, state.grave.x, state.grave.y - FAR),
      putMobAt(state, 60, state.grave.y - FAR),
      putMobAt(state, FIELD_WIDTH - 60, state.grave.y - FAR),
    ];

    fireBelch(state);

    expect(liveShots(state)).toBe(0);
    expect(crowd.filter((mob) => mob.alive)).toHaveLength(crowd.length);
  });

  it('leaves a mob still above the top edge alive, whatever the radius says', () => {
    // ADR 0008's scope limit stood through the split: reaching past the edge
    // would silently delete authored content a player never saw arrive.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    // The grave is driven up under the top edge, because from its starting
    // mark nothing above the edge is ever inside the burst and the entry gate
    // would be asserted over a case the radius already refused.
    state.grave.y = NEAR;
    const above = putMobAt(state, state.grave.x, 0);
    expect(hasEntered(above)).toBe(false);
    expect(state.grave.y - above.y).toBeLessThan(BELCH_BURST_RADIUS);

    fireBelch(state);

    expect(above.alive).toBe(true);
  });

  it('leaves a corpse in the food pool for every mob it kills', () => {
    // ADR 0008: belch kills are ordinary corpse-leaving kills, so the burst
    // hands the swallow economy back what it took.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const near = [
      putMobAt(state, state.grave.x, state.grave.y - NEAR),
      putMobAt(state, state.grave.x - NEAR, state.grave.y),
    ];
    expect(liveCorpses(state)).toBe(0);

    fireBelch(state);

    expect(liveMobs(state)).toBe(0);
    expect(liveCorpses(state)).toBe(near.length);
  });

  it('carries the cancelled shot count and the killed mob count on one belched event', () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 17);
    putMobAt(state, state.grave.x, state.grave.y - NEAR);
    putMobAt(state, state.grave.x, state.grave.y - FAR);

    const events = fireBelch(state);

    expect(events.filter((event) => event.type === 'belched')).toEqual([
      { type: 'belched', cancelled: 17, killed: 1 },
    ]);
  });
});
