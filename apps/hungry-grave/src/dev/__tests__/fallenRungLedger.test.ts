/**
 * Where every rung the floor ladder took ended up (#99, ADR 0055, design
 * record R6). Each rung is put on the field and taken off it through the sim's
 * own grave, swallow and corpse modules, from a run the ladder rig staged, so
 * the ends counted here are the ones the game actually produces.
 *
 * It sits at src/dev/__tests__ rather than beside the reading, because it spans
 * src/dev/rigs.ts as well as src/dev/readings, and the span fence puts a test
 * in the test folder of the lowest folder holding everything it covers.
 */

import { describe, expect, it } from 'vitest';

import { asSwallowable, cullCorpses } from '../../game/corpses';
import type { Corpse } from '../../game/corpses';
import type { SimEvent } from '../../game/events';
import { FIELD_HEIGHT } from '../../game/field';
import { ageGrave, hitGrave } from '../../game/grave';
import type { RunState } from '../../game/run';
import { createRun } from '../../game/run';
import { swallow } from '../../game/swallow';
import { INVULNERABLE_TICKS } from '../../game/tuning';
import {
  createFallenRungLedger,
  endedSpans,
  fallenRungLedgerOf,
  observeFallenRungLedger,
} from '../readings/fallenRungLedger';
import type { FallenRungLedgerAcc } from '../readings/fallenRungLedger';
import { RIGS } from '../rigs';

const SEED = 20260917;

/** How many free slots the pool is left with, so one rung of a four-line strip is refused. */
const SLOTS_LEFT_FREE = 3;

/**
 * The run the ladder rig begins: at the size floor, every line at its cap, and
 * holding a score (#107). The rig is the one place a floor run's starting
 * condition is named, so nothing here builds one by hand.
 */
const ladderRun = (): RunState => createRun(SEED, RIGS.ladder.conditions);

/** One landed hit, with the invulnerability window it opens counted back down. */
const land = (run: RunState): readonly SimEvent[] => {
  const events = hitGrave(run, 'contact');
  for (let tick = 0; tick < INVULNERABLE_TICKS; tick++) ageGrave(run.grave);
  return events;
};

/** The fallen rungs standing on the field, in the order they fell. */
const rungsStanding = (run: RunState): Corpse[] =>
  run.corpses
    .filter((corpse) => corpse.alive && corpse.kind === 'fallenRung')
    .sort((one, other) => one.id - other.id);

/** The rung at this place in the fall order, which the strip guarantees present. */
const rungAt = (run: RunState, index: number): Corpse => {
  const rung = rungsStanding(run)[index];
  if (rung === undefined) throw new Error(`no fallen rung at ${index}`);
  return rung;
};

/**
 * A corpse pool at its cap but for a few slots, which is the only state that
 * makes the spawn refuse a rung. It is the pool's own liveness and not a
 * counter: `claimSlot` walks for a dead slot and refuses when it finds none.
 */
const fillCorpsePoolLeaving = (run: RunState, free: number): void => {
  for (const corpse of run.corpses) corpse.alive = true;
  for (const corpse of run.corpses.slice(0, free)) corpse.alive = false;
};

const swallowRung = (run: RunState, rung: Corpse): readonly SimEvent[] => {
  rung.alive = false;
  return swallow(run, asSwallowable(rung));
};

const scrollRungOff = (run: RunState, rung: Corpse): readonly SimEvent[] => {
  rung.y = FIELD_HEIGHT * 2;
  return cullCorpses(run);
};

const observeTick = (
  accumulator: FallenRungLedgerAcc,
  tick: number,
  events: readonly SimEvent[],
  run: RunState,
): void => observeFallenRungLedger(accumulator, tick, events, run);

describe('fallen rung ledger', () => {
  it('lands a caught rung, one the scroll carried off and one still standing in their own arms, and counts a rung the cap refused in none of them', () => {
    // The denominator is the rungs that reached the field. spawnFallenRung
    // emits rungFell only once it holds a slot, so a rung the cap refused
    // reports nothing at all and weaponStripped is what says the level went
    // (ADR 0055, and the event's own comment). There is no refused arm to put
    // one in, and the pool's own refusal counter is what says it happened.
    const run = ladderRun();
    const accumulator = createFallenRungLedger();

    observeTick(accumulator, 1, land(run), run);
    fillCorpsePoolLeaving(run, SLOTS_LEFT_FREE);
    observeTick(accumulator, 2, land(run), run);

    expect(run.refusals.food).toBe(1);
    expect(rungsStanding(run)).toHaveLength(SLOTS_LEFT_FREE);

    observeTick(accumulator, 3, swallowRung(run, rungAt(run, 0)), run);
    observeTick(accumulator, 4, scrollRungOff(run, rungAt(run, 0)), run);
    observeTick(accumulator, 5, [], run);

    expect(fallenRungLedgerOf(accumulator)).toEqual({
      fell: 3,
      caught: 1,
      lost: 1,
      onFieldAtStop: 1,
      ticksOnField: [1, 2, null],
    });
  });

  it('adds its three arms up to the rungs that fell', () => {
    // The ledger's own check on itself, asserted rather than described: a
    // fallen rung never decays and nothing in the storm evicts one, so every
    // rung that fell was caught, was lost off the bottom edge, or was still
    // standing when the run stopped.
    const run = ladderRun();
    const accumulator = createFallenRungLedger();

    observeTick(accumulator, 1, land(run), run);
    observeTick(accumulator, 2, land(run), run);
    observeTick(accumulator, 3, land(run), run);
    observeTick(accumulator, 4, swallowRung(run, rungAt(run, 0)), run);
    observeTick(accumulator, 5, scrollRungOff(run, rungAt(run, 0)), run);

    const ledger = fallenRungLedgerOf(accumulator);

    expect(ledger.fell).toBeGreaterThan(0);
    expect(ledger.caught + ledger.lost + ledger.onFieldAtStop).toBe(
      ledger.fell,
    );
    expect(ledger.ticksOnField).toHaveLength(ledger.fell);
  });

  it('reports every arm as zero and no span at all on a run that dropped no fallen rung', () => {
    // An absent measurement is not a measured zero. A run that never stripped
    // has no rung to have spent a tick on the field, so the span list is empty
    // rather than carrying a zero somebody could average.
    const run = ladderRun();
    const accumulator = createFallenRungLedger();

    observeTick(accumulator, 1, [], run);
    observeTick(accumulator, 2, [], run);

    const ledger = fallenRungLedgerOf(accumulator);

    expect(ledger).toEqual({
      fell: 0,
      caught: 0,
      lost: 0,
      onFieldAtStop: 0,
      ticksOnField: [],
    });
    expect(endedSpans(ledger)).toEqual([]);
  });

  it('reports the ticks from a rung fall to its catch or its loss, and no span at all for one still standing', () => {
    // The fall and the end are matched oldest-first inside a line, because
    // rungCaught carries the line and corpseLost carries neither a line nor an
    // id. A rung still standing at the stop carries absence, on
    // tuning.arrivals.perSecond's own terms, and endedSpans drops it rather
    // than reducing it to a zero.
    const run = ladderRun();
    const accumulator = createFallenRungLedger();

    observeTick(accumulator, 10, land(run), run);
    observeTick(accumulator, 20, land(run), run);
    observeTick(accumulator, 27, swallowRung(run, rungAt(run, 0)), run);
    observeTick(accumulator, 32, scrollRungOff(run, rungAt(run, 0)), run);
    observeTick(accumulator, 40, [], run);

    const ledger = fallenRungLedgerOf(accumulator);

    expect(ledger.ticksOnField.slice(0, 2)).toEqual([7, 12]);
    expect(ledger.ticksOnField.slice(2)).toEqual([null, null]);
    expect(endedSpans(ledger)).toEqual([7, 12]);
  });
});
