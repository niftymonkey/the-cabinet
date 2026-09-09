/**
 * Every offer the run stood, and what the run did with each (#98's second
 * comment). The offers are opened and resolved through the sim's own offer
 * module, so the sites and the slots are the ones the game actually produces.
 */

import { describe, expect, it } from 'vitest';

import type { Corpse } from '../../../game/corpses';
import { spawnDrop } from '../../../game/corpses';
import type { SimEvent } from '../../../game/events';
import { createExecution, executeTick } from '../../../game/execution';
import { FIELD_HEIGHT } from '../../../game/field';
import { openOffer } from '../../../game/offer';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import { PROCESSION_ROWS } from '../../../game/stage/rows';
import type { OfferChoicesAcc } from '../offerChoices';
import {
  createOfferChoices,
  observeOfferChoices,
  offerChoicesOf,
} from '../offerChoices';

const SEED = 20260826;

/** An entry at this index, present because the check just above it just confirmed the array's length. */
function entryAt<T>(items: readonly T[], index: number): T {
  const entry = items[index];
  if (entry === undefined) throw new Error(`no entry at index ${index}`);
  return entry;
}
const STILL = { move: { x: 0, y: 0 }, belch: false } as const;

/**
 * A run whose stage spawns nothing of its own and whose birthright is silent,
 * so every offer in these tests is one the test opened.
 */
const quietRun = (): RunState => {
  const run = createRun(SEED);
  run.stage.firedRows = PROCESSION_ROWS.length;
  run.lines.streamIn = Number.MAX_SAFE_INTEGER;
  return run;
};

/**
 * One run's steps, through the one execution authority. It is here rather than
 * dev/stepping because a reading's test spans src/dev/readings and no more
 * (src/__tests__/boundary.test.ts's test-span fence), and it fails on a fault
 * for stepping's own reason: nothing here is handed to a player, so a test that
 * stepped into a broken invariant has found a bug in what it was asserting.
 */
const stepping = (run: RunState) => {
  const execution = createExecution(run);
  return (command: typeof STILL): readonly SimEvent[] => {
    const events = executeTick(execution, command);
    if (execution.faults.length > 0) {
      throw new Error(
        `sim invariant broken on tick ${run.tick}, ${execution.faults
          .map((fault) => `${fault.identity}: ${fault.detail}`)
          .join('; ')}`,
      );
    }
    return events;
  };
};

/** The reading driven a tick at a time, on its own clock, as the graph drives it. */
const watching = (acc: OfferChoicesAcc) => {
  let tick = 0;
  return (events: readonly SimEvent[]): void => {
    observeOfferChoices(acc, tick, events);
    tick += 1;
  };
};

/** Every body of the live offer that is still on the field, in the order laid. */
const offerBodies = (state: RunState): Corpse[] => {
  const ids = state.offer?.bodyIds ?? [];
  return ids
    .map((id) =>
      state.corpses.find((corpse) => corpse.alive && corpse.id === id),
    )
    .filter((corpse): corpse is Corpse => corpse !== undefined);
};

describe('offer choices', () => {
  it('splits take-by-slot between offers out of the bank and offers at a death point', () => {
    // #98's second comment. A banked offer opens at the grave's own x above the
    // top edge and a death-point offer opens where the carrier fell, so which
    // body the grave takes means a different thing under each and the two
    // cannot be read as one number. The bank's take is put on slot 0 rather
    // than the middle, so a reading that always answered 1 cannot pass.
    const state = quietRun();
    const step = stepping(state);
    const acc = createOfferChoices();
    const observe = watching(acc);

    observe(openOffer(state, state.grave.x, state.grave.y));
    observe(openOffer(state, 100, 100));
    observe(step(STILL));

    // The bank's offer is now standing above the top edge. Its leftmost body is
    // walked down onto the grave and its siblings are pushed out of reach.
    const banked = offerBodies(state);
    expect(banked).toHaveLength(3);
    entryAt(banked, 0).x = state.grave.x;
    entryAt(banked, 0).y = state.grave.y;
    entryAt(banked, 1).x = 20;
    entryAt(banked, 2).x = 500;
    observe(step(STILL));

    const choices = offerChoicesOf(acc).choices;
    expect(choices.map((choice) => choice.site)).toEqual(['death', 'bank']);
    expect(choices.map((choice) => choice.slot)).toEqual([1, 0]);
  });

  it('counts the offers a carrier paid while one already stood', () => {
    // ADR 0034's decision 9 corner. A batch-wide zero here is a finding to
    // report and never a bug, so the count has to be real.
    const state = quietRun();
    const acc = createOfferChoices();
    const observe = watching(acc);

    observe(openOffer(state, 260, 180));
    observe(openOffer(state, 100, 100));
    observe(openOffer(state, 120, 120));

    expect(offerChoicesOf(acc).bankedWhileStanding).toBe(2);

    // And a bank with no offer standing is not one of them: an offer whose
    // every body the corpse cap refused banks too, and that is a supply the
    // field had no room for rather than a carrier paying over a live offer.
    const full = quietRun();
    const refused = createOfferChoices();
    while (full.corpses.some((corpse) => !corpse.alive)) {
      spawnDrop(full, 10, 10);
    }

    observeOfferChoices(refused, 0, openOffer(full, 200, 100));

    expect(full.offer).toBeNull();
    expect(full.bankedOffers).toBe(1);
    expect(offerChoicesOf(refused).bankedWhileStanding).toBe(0);
  });

  it('records no slot for an offer that scrolled off untaken, and counts it as no take', () => {
    // An offer nobody dived for and an offer taken mean opposite things to an
    // instrument, which is the same reason offerLost is a separate event from
    // carrierLost. Every option of a lost offer went untaken, so every one of
    // them is passed.
    const state = quietRun();
    const step = stepping(state);
    const acc = createOfferChoices();
    const observe = watching(acc);

    observe(openOffer(state, state.grave.x, FIELD_HEIGHT - 5));
    const options = [...state.offer!.options];
    for (let tick = 0; tick < 120; tick++) observe(step(STILL));

    const choices = offerChoicesOf(acc).choices;
    expect(choices).toHaveLength(1);
    expect(entryAt(choices, 0).slot).toBeNull();
    expect(entryAt(choices, 0).line).toBeNull();
    expect([...entryAt(choices, 0).passed]).toEqual(options);
    expect(choices.filter((choice) => choice.slot !== null)).toEqual([]);
  });

  it('reports an empty list for a run that stood no offer at all', () => {
    // An empty list and an absent reading are different answers: this run was
    // measured and offered nothing, which is a reading the report carries.
    const state = quietRun();
    const step = stepping(state);
    const acc = createOfferChoices();
    const observe = watching(acc);

    for (let tick = 0; tick < 60; tick++) observe(step(STILL));

    expect(offerChoicesOf(acc)).toEqual({
      choices: [],
      bankedWhileStanding: 0,
    });
  });

  it('reports two offers in one run as two rows in the order they stood', () => {
    const state = quietRun();
    const step = stepping(state);
    const acc = createOfferChoices();
    const observe = watching(acc);

    observe(openOffer(state, state.grave.x, state.grave.y));
    observe(step(STILL));
    for (let tick = 0; tick < 4; tick++) observe(step(STILL));
    observe(openOffer(state, state.grave.x, state.grave.y));
    observe(step(STILL));

    const choices = offerChoicesOf(acc).choices;
    expect(choices).toHaveLength(2);
    expect(entryAt(choices, 0).tick).toBeLessThan(entryAt(choices, 1).tick);
    expect(choices.map((choice) => choice.site)).toEqual(['death', 'death']);
    expect(choices.map((choice) => choice.line)).not.toContain(null);
  });
});
