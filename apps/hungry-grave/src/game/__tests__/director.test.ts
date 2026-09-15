import { describe, expect, it } from 'vitest';

import { STARTING_DIRECTOR } from '../director';

describe("the director's own state at the top of a run (ADR 0047, ADR 0056)", () => {
  it('starts with nothing granted, nothing held and no quiet owed', () => {
    // Field by field rather than against a whole-record literal, so a field
    // that arrives later cannot slip in undeclared: every field of this record
    // is folded (witness.ts's foldDirector), and a folded field the fold does
    // not know about is a witness that moved with no version behind it.
    expect(STARTING_DIRECTOR.signal.value).toBe(0);
    expect(STARTING_DIRECTOR.signal.heldUntilTick).toBe(0);
    expect(STARTING_DIRECTOR.purseLeft).toBe(0);
    expect(STARTING_DIRECTOR.quietUntilTick).toBe(0);
  });

  it('declares exactly the fields this slice can fill honestly', () => {
    // The plan's section 4 writes a third field on the signal, `lock`, and
    // signalLock.ts is slice G's module, so a lock declared here would be a
    // placeholder type where the fold is supposed to read a real one. Slice G
    // adds it, and it owes no second witness version move: a lock is resolved
    // before the first tick and never moves, which is the run's identity in
    // exactly the sense seed and roster[] are, and both are excluded from the
    // fold with that reason beside them.
    expect(Object.keys(STARTING_DIRECTOR).sort()).toEqual([
      'purseLeft',
      'quietUntilTick',
      'signal',
    ]);
    expect(Object.keys(STARTING_DIRECTOR.signal).sort()).toEqual([
      'heldUntilTick',
      'value',
    ]);
  });
});
