/**
 * Where every option body ended up (#74 story 14, widened by ADR 0034's
 * offer). Each body is put on the field and taken off it through the sim's own
 * offer and corpse modules, so the four terminal states are the ones the game
 * actually produces.
 */

import { describe, expect, it } from 'vitest';

import type { Corpse } from '../../../game/corpses';
import { asSwallowable, cullCorpses } from '../../../game/corpses';
import { FIELD_HEIGHT } from '../../../game/field';
import type { WeaponLine } from '../../../game/lines/roster';
import { MAX_LEVEL, WEAPON_LINES } from '../../../game/lines/roster';
import { openOffer, OFFER_SIZE } from '../../../game/offer';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import { swallow } from '../../../game/swallow';
import {
  createDropLedger,
  dropLedgerOf,
  observeDropLedger,
} from '../dropLedger';

const SEED = 20260826;
// Two offers of three: one resolved by a take, one left standing but for a
// body that scrolled off.
const SPAWNED = 2 * OFFER_SIZE;

/** The live drop standing at this x, which is how a test names one of three. */
const dropAt = (run: RunState, x: number): Corpse => {
  const found = run.corpses.find(
    (corpse) => corpse.alive && corpse.kind === 'drop' && corpse.x === x,
  );
  if (found === undefined) throw new Error(`no live drop at x ${x}`);
  return found;
};

describe('drop ledger', () => {
  it('accounts every option body as exactly one of taken, passed, lost off the field, or on the field at the stop', () => {
    // Story 14, widened by the offer: a body reaches a fourth end now, because
    // the two siblings of a taken body vanish on the tick the take lands and
    // are neither swallowed nor lost. A body never decays and the cap policy
    // never evicts one, so the four counts add up to spawned and that sum is
    // the ledger's own check on itself.
    const run = createRun(SEED);
    const accumulator = createDropLedger();

    observeDropLedger(accumulator, openOffer(run, 260, 200), run);
    const takenId = run.offer!.bodyIds[0];
    const taken = run.corpses.find(
      (corpse) => corpse.alive && corpse.id === takenId,
    )!;
    taken.alive = false;
    observeDropLedger(accumulator, swallow(run, asSwallowable(taken)), run);
    expect(run.offer).toBeNull();

    observeDropLedger(accumulator, openOffer(run, 260, FIELD_HEIGHT - 5), run);
    dropAt(run, 260).y = FIELD_HEIGHT * 2;
    observeDropLedger(accumulator, cullCorpses(run), run);

    const { byLine, ...totals } = dropLedgerOf(accumulator);
    expect(totals).toEqual({
      spawned: SPAWNED,
      swallowed: 1,
      passed: OFFER_SIZE - 1,
      lost: 1,
      onFieldAtStop: OFFER_SIZE - 1,
    });
    expect(
      totals.swallowed + totals.passed + totals.lost + totals.onFieldAtStop,
    ).toBe(totals.spawned);
    expect(Object.keys(byLine).length).toBeGreaterThan(0);
  });

  it('accounts every option body under the line it carried, and each line adds up on its own', () => {
    // path-draft.md:21 and #98: every number the report prints that is a
    // per-line quantity in a run is a per-line quantity in the batch. The
    // ledger's own check on itself carries down to the line, and it carries
    // down through a half-gone offer: corpseLost names no line, so a body that
    // scrolled off while its siblings still stood is read off the field it
    // left rather than off the event.
    const run = createRun(SEED);
    const accumulator = createDropLedger();

    observeDropLedger(accumulator, openOffer(run, 260, 200), run);
    const first = [...run.offer!.options];
    const takenId = run.offer!.bodyIds[0];
    const taken = run.corpses.find(
      (corpse) => corpse.alive && corpse.id === takenId,
    )!;
    taken.alive = false;
    observeDropLedger(accumulator, swallow(run, asSwallowable(taken)), run);

    observeDropLedger(accumulator, openOffer(run, 260, FIELD_HEIGHT - 5), run);
    const second = [...run.offer!.options];
    const scrolledId = run.offer!.bodyIds[0];
    run.corpses.find((corpse) => corpse.id === scrolledId)!.y =
      FIELD_HEIGHT * 2;
    observeDropLedger(accumulator, cullCorpses(run), run);

    const ledger = dropLedgerOf(accumulator);
    const spawnedOf = (line: WeaponLine): number =>
      [...first, ...second].filter((each) => each === line).length;

    for (const line of WEAPON_LINES) {
      const counts = ledger.byLine[line];
      const spawned = spawnedOf(line);
      if (counts === undefined) {
        // A line the run never offered has no entry, rather than zeroes.
        expect(spawned, `${line} stood no body`).toBe(0);
        continue;
      }
      expect(counts.spawned, `${line} spawned`).toBe(spawned);
      expect(
        counts.swallowed + counts.passed + counts.lost + counts.onFieldAtStop,
        `${line} accounted for`,
      ).toBe(spawned);
    }
    expect(ledger.byLine[first[0]]?.swallowed).toBe(1);
    expect(ledger.byLine[first[1]]?.passed).toBeGreaterThanOrEqual(1);
    expect(ledger.byLine[second[0]]?.lost).toBe(1);
    expect(ledger.byLine[second[1]]?.onFieldAtStop).toBe(1);
    // Every body here carried an option, so the lines account for all of them.
    const spawnedByLine = Object.values(ledger.byLine).reduce(
      (total, counts) => total + counts.spawned,
      0,
    );
    expect(spawnedByLine).toBe(ledger.spawned);
  });

  it('keeps a body carrying no option in the totals and under no line', () => {
    // ADR 0034's nothing-offerable branch and a maxed run's carrier. The
    // per-line sums not matching the totals is a stated fact rather than a
    // defect somebody later reads as one.
    const run = createRun(SEED);
    for (const line of WEAPON_LINES) run.levels[line] = MAX_LEVEL;
    const accumulator = createDropLedger();

    const opened = openOffer(run, 260, 200);
    observeDropLedger(accumulator, opened, run);
    const born = opened.find((event) => event.type === 'dropSpawned')!;
    expect(born.line).toBeUndefined();
    expect(run.offer).toBeNull();

    const body = run.corpses.find(
      (corpse) => corpse.alive && corpse.id === born.id,
    )!;
    body.alive = false;
    observeDropLedger(accumulator, swallow(run, asSwallowable(body)), run);

    const ledger = dropLedgerOf(accumulator);
    expect(ledger.spawned).toBe(1);
    expect(ledger.swallowed).toBe(1);
    expect(ledger.byLine).toEqual({});
  });
});
