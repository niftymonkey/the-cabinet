/**
 * Carriers meter power (ADR 0002) and a missed carrier is missed (ADR 0048).
 * Expected values come from the ADRs and from the step 1 dispatch plan's
 * sections 6 and 8, never from running the module.
 */

import { describe, expect, it } from 'vitest';

import { stepping } from '../../dev/stepping';

import {
  carrierRow,
  carriersForFullBuild,
  carriersScheduled,
  carriesAt,
} from '../carriers';
import { FIELD_HEIGHT } from '../field';
import { BELL_EXPAND_TICKS } from '../lines/bell';
import type { WeaponLine } from '../lines/roster';
import { MAX_LEVEL, WEAPON_LINES } from '../lines/roster';
import { cullMobs, MOB_TYPES, spawnMob } from '../mobs';
import type { RunState } from '../run';
import { createRun, uniformLevels } from '../run';
import { advanceStage } from '../stage/stage';
import { SCROLL_SPEED } from '../tuning';
import { CROWD_ROWS, PROCESSION_ROWS } from '../stage/rows';

/** Every carrier the authored stage puts on the field across all its phases. */
function authoredCarriers(): number {
  return [...PROCESSION_ROWS, ...CROWD_ROWS].reduce(
    (total, row) => total + carrierRow(row.carries, row.count).carrying.length,
    0,
  );
}

/**
 * A run whose stage will not spawn anything on top of the mob under test, and
 * whose one birthright line is held silent so every kill in these tests is a
 * kill the test made.
 */
function quietRun(seed = 7): RunState {
  const run = createRun(seed);
  run.stage.firedRows = PROCESSION_ROWS.length;
  run.lines.streamIn = Number.MAX_SAFE_INTEGER;
  return run;
}

/** A mob standing under a skull, so the storm kills it inside the tick. */
function doomed(state: RunState, x: number, y: number, carries: boolean) {
  const mob = spawnMob(
    state,
    'shambler',
    { x, y, vx: 0, vy: 0, index: 0 },
    carries,
  )!;
  mob.beat = 0;
  mob.hp = 1;
  const skull = state.skulls.find((each) => !each.alive)!;
  skull.alive = true;
  skull.id = state.nextEntityId;
  state.nextEntityId += 1;
  skull.x = x;
  skull.y = y;
  skull.vx = 0;
  skull.vy = 0;
  return mob;
}

const STILL = { move: { x: 0, y: 0 }, belch: false } as const;

function typesOf(events: readonly { type: string }[]): string[] {
  return events.map((event) => event.type);
}

describe('a carrier is a carrier whatever killed it (ADR 0002)', () => {
  it('pays for a carrier the bell killed exactly as for one the storm killed', () => {
    // Power that arrived only when the right weapon landed the last point of
    // damage would meter itself differently for a reason no player could read.
    // The bell is the case that matters, because it resolves two phases before
    // the deaths pass and its kills reach that pass on the tick's own list.
    const storm = quietRun();
    const stormStep = stepping(storm);
    doomed(storm, 200, 100, true);
    const stormPaid = typesOf(stormStep(STILL)).filter(
      (type) => type === 'offerOpened',
    );

    const bell = quietRun();
    bell.levels.bell = MAX_LEVEL;
    // The toll is brought forward rather than waited out: over a whole bell
    // period the scroll carries a still mob off the bottom edge, and what the
    // test is about is which pass the kill reaches.
    bell.lines.tollIn = 1;
    const bellStep = stepping(bell);
    const victim = spawnMob(
      bell,
      'shambler',
      { x: bell.grave.x, y: bell.grave.y - 60, vx: 0, vy: 0, index: 0 },
      true,
    )!;
    victim.beat = 0;
    victim.hp = 1;
    const bellPaid: string[] = [];
    for (let tick = 0; tick < BELL_EXPAND_TICKS + 2; tick++) {
      bellPaid.push(
        ...typesOf(bellStep(STILL)).filter((type) => type === 'offerOpened'),
      );
    }

    expect(victim.alive).toBe(false);
    expect(stormPaid).toEqual(['offerOpened']);
    expect(bellPaid).toEqual(stormPaid);
  });
});

describe('a missed carrier is missed (ADR 0048)', () => {
  it('pays nothing when the player never kills it, and nothing reaches after the player to make it up', () => {
    // ADR 0048: "A carrier the player never kills pays nothing, and nothing in
    // the game reaches after the player to make up for it."
    const state = quietRun();
    const step = stepping(state);
    const carrier = spawnMob(
      state,
      'shambler',
      { x: 200, y: FIELD_HEIGHT - 20, vx: 0, vy: 1, index: 0 },
      true,
    )!;
    carrier.beat = 0;

    const seen: string[] = [];
    for (let tick = 0; tick < 200; tick++) seen.push(...typesOf(step(STILL)));

    expect(carrier.alive).toBe(false);
    expect(seen.filter((type) => type === 'carrierLost')).toHaveLength(1);
    // Nothing paid for it: not on the tick it left, and not on any tick after.
    expect(seen.filter((type) => type === 'dropSpawned')).toEqual([]);
    expect(state.corpses.filter((corpse) => corpse.kind === 'drop')).toEqual(
      [],
    );
  });
  it('holds more carriers in the schedule than a full build needs', () => {
    // ADR 0048: "What absorbs a miss instead is the schedule: it holds more
    // carriers than a full build needs, so missing one costs a step rather
    // than the run." Asserted on the stage the run actually meets, because a
    // slack that lives only in the derivation absorbs nothing.
    expect(authoredCarriers()).toBeGreaterThan(carriersForFullBuild());
  });
  it('never drifts a drop toward the grave and never holds it still waiting to be taken', () => {
    // ADR 0048 rejects both: "An offer that drifts toward the grave, or holds
    // still until it is taken, is Raiden's lingering icon." The drop's only
    // motion is the field's own scroll, which is the coupling every food body
    // already has.
    const state = quietRun();
    const step = stepping(state);
    doomed(state, 120, 100, true);
    step(STILL);
    const drop = state.corpses.find(
      (corpse) => corpse.alive && corpse.kind === 'drop',
    )!;
    expect(drop.decays).toBe(false);
    const start = { x: drop.x, y: drop.y };

    // The expected fall is accumulated one scroll at a time rather than
    // multiplied out, so a float sum that differs in its last bit from a
    // product cannot be read as motion of its own.
    let expected = start.y;
    for (let tick = 1; tick <= 30; tick++) {
      step({ move: { x: 1, y: -1 }, belch: false });
      expected += SCROLL_SPEED;
      expect(`tick ${tick} x ${drop.x}`).toBe(`tick ${tick} x ${start.x}`);
      expect(`tick ${tick} y ${drop.y}`).toBe(`tick ${tick} y ${expected}`);
    }
    // And the grave really did move, so the drop held its lane against a grave
    // that was travelling rather than against a still field.
    expect(state.grave.x).not.toBe(120);
  });
  it('reads nothing about the player power to decide where a carrier goes', () => {
    // ADR 0048's second rejection: a catch-up carrier "needs something that
    // reads how much power the player is holding in order to decide where to
    // put a carrier, which is a small version of the loop ADR 0002 cut on
    // purpose." Two runs on one seed, one born with nothing and one already
    // maxed, meet the same carriers on the same ticks.
    const carriersMet = (
      levels?: Readonly<Record<WeaponLine, number>>,
    ): string[] => {
      const state = createRun(31, undefined, levels);
      const met: string[] = [];
      for (let tick = 0; tick < 40 * 60; tick++) {
        advanceStage(state);
        for (const mob of state.mobs) {
          if (mob.alive && mob.carries) met.push(`${tick} ${mob.id} ${mob.x}`);
        }
        state.stage.phaseTick += 1;
      }
      return met;
    };

    const empty = carriersMet();
    expect(empty.length).toBeGreaterThan(0);
    expect(carriersMet(uniformLevels(MAX_LEVEL))).toEqual(empty);
  });
});

describe('the schedule', () => {
  it('counts the drops a full build costs from the birthright, and moves when the roster grows', () => {
    // The cost is read off a fresh run's own starting levels rather than off
    // the carrier module's constants, so the two halves of the derivation
    // cannot agree with each other while both being wrong. A fifth line moves
    // both sides with no edit here, which is what the extensibility
    // constraint asks for.
    const fresh = createRun(1);
    const stillNeeded = WEAPON_LINES.reduce(
      (total, line) => total + (MAX_LEVEL - fresh.levels[line]),
      0,
    );
    expect(carriersForFullBuild()).toBe(stillNeeded);
    // Today's roster, from the plan's section 8: four levels on the one
    // birthright line and five on each of the three the run is not born with.
    expect(carriersForFullBuild()).toBe(19);
  });

  it('schedules more carriers than a full build needs', () => {
    // ADR 0048: "it holds more carriers than a full build needs, so missing
    // one costs a step rather than the run." Thirty percent of slack over 19
    // is the plan's 25, and a schedule holds whole carriers.
    expect(carriersScheduled()).toBeGreaterThan(carriersForFullBuild());
    expect(Number.isInteger(carriersScheduled())).toBe(true);
    expect(carriersScheduled()).toBe(25);
  });
  it('authors at least as many carriers on the stage as the schedule asks for', () => {
    expect(authoredCarriers()).toBeGreaterThanOrEqual(carriersScheduled());
  });

  it('carries one mob per carrying row, at the middle of its placement order', () => {
    // The middle rather than the leader, so a Pincer's symmetry is not broken
    // by the carrier riding at the head of one arm, and the position is the
    // row's placement order rather than the SpawnOrder index, which a
    // mirrored template repeats once per arm.
    expect(carrierRow(true, 5).carrying).toEqual([2]);
    expect(carrierRow(true, 1).carrying).toEqual([0]);
    expect(carrierRow(false, 5).carrying).toEqual([]);
    expect(carriesAt(carrierRow(true, 5), 2)).toBe(true);
    expect(carriesAt(carrierRow(true, 5), 0)).toBe(false);
    for (const count of [1, 2, 3, 6, 8, 22]) {
      expect(`${count} ${carrierRow(true, count).carrying.length}`).toBe(
        `${count} 1`,
      );
    }
  });
  it('reports a carrier culled off the bottom edge unkilled exactly once', () => {
    const state = quietRun();
    const carrier = spawnMob(
      state,
      'shambler',
      {
        x: 200,
        y: FIELD_HEIGHT + MOB_TYPES.shambler.halfHeight + 1,
        vx: 0,
        vy: 1,
        index: 0,
      },
      true,
    )!;

    expect(cullMobs(state)).toEqual([
      { type: 'carrierLost', mob: 'shambler', x: 200 },
    ]);
    expect(carrier.alive).toBe(false);
    // The slot is dead, so a second pass over the same field reports nothing:
    // a carrier is lost once and never once per tick after it.
    expect(cullMobs(state)).toEqual([]);
  });
});
