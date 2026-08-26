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

  it('holds twelve identities against fourteen checks, six of them fatal', () => {
    // Two checks carry two identities each: checkPools records the caps and
    // the ids, and checkStage records the two phase invariants. Against that,
    // the five bounds checks share one identity between them.
    expect(FAULT_IDENTITIES).toHaveLength(12);
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
    ]);
  });

  it("tells the grave's own bounds check apart from the entities' one", () => {
    // The pair a severity table most easily confuses: one fatal, one
    // recoverable, sitting beside each other under near-identical names.
    expect(FAULT_SEVERITY['in bounds']).toBe('fatal');
    expect(FAULT_SEVERITY['entities in bounds']).toBe('recoverable');
  });
});
