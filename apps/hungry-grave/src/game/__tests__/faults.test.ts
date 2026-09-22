/**
 * The closed fault vocabulary (ADR 0017): what a fault can be called and how
 * safe continued execution is after each one.
 */

import { describe, expect, it } from 'vitest';

import { FAULT_IDENTITIES, FAULT_SEVERITY } from '../faults';

describe('the fault list itself (ADR 0017)', () => {
  it('is closed, and every identity in it carries a severity', () => {
    // The identity is written down rather than taken from whatever string a
    // check happens to carry, because a fault record goes into a tape's third
    // section and hardens the moment the first tape exists.
    expect(new Set(FAULT_IDENTITIES).size).toBe(FAULT_IDENTITIES.length);
    expect(Object.keys(FAULT_SEVERITY).sort()).toEqual(
      [...FAULT_IDENTITIES].sort(),
    );
  });

  it('holds twenty-five identities against twenty-six checks, seven of them fatal', () => {
    // Three checks carry more than one identity: checkPools records the caps
    // and the ids, checkStage records the two section invariants, and
    // checkRefusals records one per cap that can turn something away. Against
    // that, the six bounds checks share one identity between them.
    expect(FAULT_IDENTITIES).toHaveLength(25);
    const fatal = FAULT_IDENTITIES.filter(
      (identity) => FAULT_SEVERITY[identity] === 'fatal',
    );
    expect(fatal).toEqual([
      'no NaN',
      'size within floor and ceiling',
      'in bounds',
      'entity caps',
      'entity ids',
      'levels in range',
      'growth owed in range',
    ]);
  });

  it('counts the growth the grave is owed as health rather than as bookkeeping', () => {
    // hitGrave reads the size plus the debt as the grave's true size, and that
    // is what decides whether the floor ladder runs. A debt of -10 on a grave
    // drawn at SIZE_START runs the ladder nine units clear of the floor, which
    // bleeds the score, strips every line and ends by sealing the run.
    expect(FAULT_SEVERITY['growth owed in range']).toBe('fatal');
  });

  it("tells the grave's own bounds check apart from the entities' one", () => {
    // The pair a severity table most easily confuses: one fatal, one
    // recoverable, sitting beside each other under near-identical names.
    expect(FAULT_SEVERITY['in bounds']).toBe('fatal');
    expect(FAULT_SEVERITY['entities in bounds']).toBe('recoverable');
  });
});
