// The pool's membership and the lines a run is born with (ADR 0005, ADR 0003).

import { describe, expect, it } from 'vitest';

import { BIRTHRIGHT, WEAPON_LINES } from '../roster';

describe('the first weapon pool', () => {
  it('the birthright is the soul stream and Territory', () => {
    // ADR 0003's floor ladder strips a dying player back to exactly this list,
    // so the starting loadout and the ladder's target stay one rule rather than
    // a second hidden loadout (#76).
    expect([...BIRTHRIGHT]).toEqual(['soulStream', 'territory']);
  });

  it('the pool holds four lines and none of them is the headstones', () => {
    // Territory replaced the headstones rather than joining them: the pool
    // stays at four, which is what keeps the tape header, the drop
    // silhouettes' coarse axis and the four-motions contract where they are.
    expect(WEAPON_LINES).toHaveLength(4);
    expect([...WEAPON_LINES].sort()).toEqual([
      'bell',
      'soulStream',
      'territory',
      'wisps',
    ]);
    const named: readonly string[] = WEAPON_LINES;
    expect(named).not.toContain('headstones');
  });

  it('every birthright line is a line the pool holds', () => {
    for (const line of BIRTHRIGHT) expect(WEAPON_LINES).toContain(line);
  });
});
