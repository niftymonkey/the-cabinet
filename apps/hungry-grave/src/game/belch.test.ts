/**
 * The one button (ADR 0008): full only, and the bomb everywhere. Expected values
 * come from the ADR and from dispatch 5's plan section 6.14.
 */

import { describe, expect, it } from 'vitest';

import { fireBelch } from './belch';
import type { Mob } from './mobs';
import { hasEntered, spawnMob } from './mobs';
import type { RunState } from './run';
import { createRun } from './run';
import { RAMP_ROWS } from './stage/stage';
import { RESERVOIR_CAPACITY } from './tuning';

function quietRun(seed = 16): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

/** Shots put on the field by hand, so the test does not depend on a mob firing. */
function armField(state: RunState, count: number): void {
  for (let index = 0; index < count; index++) {
    const shot = state.mobFire[index];
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
    const mob = spawnMob(state, 'shambler', {
      x: 40 + index * 24,
      y: 100,
      vx: 0,
      vy: 1,
      index,
    })!;
    mob.beat = 0;
    mobs.push(mob);
  }
  return mobs;
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

describe('the belch wipes the mobs on screen (ADR 0008)', () => {
  it('kills every mob that has entered the field, one mobKilled each', () => {
    // The prototype's belch did this from the first build and the ADR lost it
    // by omission. Without it a belch into the Wall cancels bullets the Wall
    // never fired, and the curtain that damages by contact walks on through.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const mobs = fillField(state, 6);

    const events = fireBelch(state);

    expect(mobs.filter((mob) => mob.alive)).toHaveLength(0);
    expect(liveMobs(state)).toBe(0);
    expect(events.filter((event) => event.type === 'mobKilled')).toHaveLength(
      6,
    );
  });

  it('leaves a mob still above the top edge alive, because the bomb is scoped to what is on screen', () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    const onScreen = fillField(state, 1)[0];
    const above = spawnMob(state, 'shambler', {
      x: 200,
      y: -40,
      vx: 0,
      vy: 1,
      index: 0,
    })!;
    expect(hasEntered(above)).toBe(false);

    fireBelch(state);

    expect(onScreen.alive).toBe(false);
    expect(above.alive).toBe(true);
  });

  it('leaves a corpse in the food pool for every mob it kills', () => {
    // The wipe routes through the normal kill path, so the reward is the same
    // rain of corpses any other kill leaves and the drop economy keeps running.
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    fillField(state, 4);
    expect(liveCorpses(state)).toBe(0);

    fireBelch(state);

    expect(liveCorpses(state)).toBe(4);
  });

  it('carries the cancelled shot count and the killed mob count on one belched event', () => {
    const state = quietRun();
    state.reservoir = RESERVOIR_CAPACITY;
    armField(state, 17);
    fillField(state, 3);

    const events = fireBelch(state);

    expect(events.filter((event) => event.type === 'belched')).toEqual([
      { type: 'belched', cancelled: 17, killed: 3 },
    ]);
  });
});
