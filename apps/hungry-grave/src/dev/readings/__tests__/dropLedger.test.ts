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

    const ledger = dropLedgerOf(accumulator);
    expect(ledger).toEqual({
      spawned: SPAWNED,
      swallowed: 1,
      passed: OFFER_SIZE - 1,
      lost: 1,
      onFieldAtStop: OFFER_SIZE - 1,
    });
    expect(
      ledger.swallowed + ledger.passed + ledger.lost + ledger.onFieldAtStop,
    ).toBe(ledger.spawned);
  });
});
