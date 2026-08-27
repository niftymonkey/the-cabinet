/**
 * Where every drop ended up (#74 story 14). Each drop is put on the field and
 * taken off it through the sim's own corpse module, so the three terminal
 * states are the ones the game actually produces.
 */

import { describe, expect, it } from 'vitest';

import type { Corpse } from '../../../game/corpses';
import { asSwallowable, cullCorpses, spawnDrop } from '../../../game/corpses';
import { FIELD_HEIGHT } from '../../../game/field';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import { swallow } from '../../../game/swallow';
import {
  createDropLedger,
  dropLedgerOf,
  observeDropLedger,
} from '../dropLedger';

const SEED = 20260826;
const SPAWNED = 3;

/** The live drop standing at this x, which is how a test names one of three. */
const dropAt = (run: RunState, x: number): Corpse => {
  const found = run.corpses.find(
    (corpse) => corpse.alive && corpse.kind === 'drop' && corpse.x === x,
  );
  if (found === undefined) throw new Error(`no live drop at x ${x}`);
  return found;
};

describe('drop ledger', () => {
  it('accounts every drop spawned as exactly one of swallowed, lost off the field, or on the field at the stop', () => {
    // Story 14, with the amendment that on-field-at-the-stop is the third
    // terminal state rather than a fourth read. A drop never decays and the cap
    // policy never evicts one, so the three counts add up to spawned and that
    // sum is the ledger's own check on itself.
    const run = createRun(SEED);
    const accumulator = createDropLedger();

    observeDropLedger(
      accumulator,
      [
        ...spawnDrop(run, 100, 100, 'wisps'),
        ...spawnDrop(run, 200, 200, 'bell'),
        ...spawnDrop(run, 300, 300, 'wisps'),
      ],
      run,
    );

    const eaten = dropAt(run, 100);
    eaten.alive = false;
    observeDropLedger(accumulator, swallow(run, asSwallowable(eaten)), run);

    dropAt(run, 200).y = FIELD_HEIGHT * 2;
    observeDropLedger(accumulator, cullCorpses(run), run);

    const ledger = dropLedgerOf(accumulator);
    expect(ledger).toEqual({
      spawned: SPAWNED,
      swallowed: 1,
      lost: 1,
      onFieldAtStop: 1,
    });
    expect(ledger.swallowed + ledger.lost + ledger.onFieldAtStop).toBe(
      ledger.spawned,
    );
  });
});
