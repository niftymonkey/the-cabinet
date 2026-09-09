// The pool's membership and the lines a run is born with (ADR 0005, ADR 0003).

import { describe, expect, it } from 'vitest';

import { BIRTHRIGHT, implementsLines, WEAPON_LINES } from '../roster';

describe('the first weapon pool', () => {
  it('the birthright is the skull stream alone', () => {
    // ADR 0045: "A run starts with exactly one line, the skull stream at level
    // 1." ADR 0003's floor ladder strips a dying player back to exactly this
    // list, so the starting loadout and the ladder's target stay one rule
    // rather than a second hidden loadout (#76).
    expect([...BIRTHRIGHT]).toEqual(['skullStream']);
  });

  it('forces no line but the skull stream into every run', () => {
    // ADR 0045: "no line but the skull stream is forced into every run, which
    // the growing pool (ADR 0046) requires." A second permanent seat would
    // fight a per-run roster for the same place.
    for (const line of WEAPON_LINES) {
      if (line === 'skullStream') continue;
      expect(BIRTHRIGHT).not.toContain(line);
    }
  });

  it('the pool holds four lines and none of them is the headstones', () => {
    // Territory replaced the headstones rather than joining them: the pool
    // stays at four, which is what keeps the tape header, the drop
    // silhouettes' coarse axis and the four-motions contract where they are.
    expect(WEAPON_LINES).toHaveLength(4);
    expect([...WEAPON_LINES].sort()).toEqual([
      'bell',
      'skullStream',
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

describe("a run's roster is drawn from the pool (ADR 0046)", () => {
  it('makes the skull stream the one constant every run fields', () => {
    // ADR 0046: "each run fields a roster drawn from it, with the skull stream
    // the one constant every run." The birthright is what forces a line into
    // every run, so the constant is the birthright holding the stream alone.
    expect(BIRTHRIGHT).toContain('skullStream');
  });

  it('implements a roster naming fewer lines than the pool holds', () => {
    const shorter = WEAPON_LINES.filter(
      (line) => BIRTHRIGHT.includes(line) || line === 'wisps',
    );
    expect(shorter.length).toBeLessThan(WEAPON_LINES.length);
    expect(implementsLines(shorter)).toBe(true);
    expect(implementsLines([...BIRTHRIGHT])).toBe(true);
  });

  it('implements the whole pool named in any order', () => {
    expect(implementsLines([...WEAPON_LINES].reverse())).toBe(true);
  });

  it('does not implement a roster naming a line this build does not have', () => {
    // ADR 0043's refusal: the build's limit, not the tape's. An old tape's
    // stream name is exactly this case.
    expect(implementsLines(['soulStream', 'territory'])).toBe(false);
    expect(implementsLines([...WEAPON_LINES, 'headstones'])).toBe(false);
  });

  it('does not implement a roster naming one line twice', () => {
    const firstLine = WEAPON_LINES[0];
    if (firstLine === undefined) throw new Error('WEAPON_LINES is empty');
    expect(implementsLines([...WEAPON_LINES, firstLine])).toBe(false);
  });

  it('does not implement a roster short of a birthright line', () => {
    // ADR 0046 makes the skull stream the one constant every run, and the
    // birthright is the mechanism: a roster without it names a run that starts
    // holding nothing, which the level invariant faults on its first tick.
    for (const line of BIRTHRIGHT) {
      const without = WEAPON_LINES.filter((other) => other !== line);
      expect(implementsLines(without)).toBe(false);
    }
    expect(implementsLines([])).toBe(false);
  });
});
