// The pool's membership and the lines a run is born with (ADR 0005, ADR 0003).

import { describe, expect, it } from 'vitest';

import {
  BELL_CONE_ROWS,
  BELL_DAMAGE_FAR_BY_LEVEL,
  BELL_DAMAGE_NEAR_BY_LEVEL,
} from '../bell';
import {
  BIRTHRIGHT,
  implementsLines,
  MAX_LEVEL,
  WEAPON_LINES,
} from '../roster';
import { COLUMNS_BY_LEVEL, SKULL_DAMAGE_BY_LEVEL } from '../skullStream';
import { RADIUS_BY_LEVEL, SLOW_BY_LEVEL, TERRITORY_DAMAGE } from '../territory';
import { WISP_DAMAGE_BY_LEVEL, WISPS_BY_LEVEL } from '../wisps';

/** A line's damage lane, rung 1 through MAX_LEVEL, dropping the unowned row at level 0. */
function lane(table: readonly number[]): number[] {
  return table.slice(1, MAX_LEVEL + 1);
}

/** The step from each rung to the next, as a fraction of the rung it leaves. */
function stepShares(rungs: readonly number[]): number[] {
  return rungs.slice(1).map((damage, index) => {
    const previous = rungs[index];
    if (previous === undefined) throw new Error('lane out of range');
    return (damage - previous) / previous;
  });
}

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
    // stays at four, which is what keeps the tape header, the power-up
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

describe('each line owns its own climb (ADR 0005)', () => {
  it("each line's climb over its five rungs is the one that line's own row states, and it is read per line", () => {
    // ADR 0005 gives each line its own five levels, so there is no band held
    // over the roster: a single multiple shared by all four would be a rule
    // the roster does not have. The rows are
    // docs/research/weapon-growth-per-level-precedent.md section 4, and the
    // four climbs it authors are deliberately different sizes: the stream and
    // the wisps double, the bell lands at x2.6 because a whole-number eighth
    // is what ADR 0036 pins, and Territory does not climb at all because
    // ADR 0044 holds its touch counts flat.
    const climbs = {
      skullStream: lane(SKULL_DAMAGE_BY_LEVEL),
      wisps: lane(WISP_DAMAGE_BY_LEVEL),
      bell: lane(BELL_DAMAGE_NEAR_BY_LEVEL),
    };
    expect(climbs.skullStream).toEqual([8, 10, 12, 14, 16]);
    expect(climbs.wisps).toEqual([10, 12, 15, 17, 20]);
    expect(climbs.bell).toEqual([40, 56, 72, 88, 104]);
    expect(lane(BELL_DAMAGE_FAR_BY_LEVEL)).toEqual([5, 7, 9, 11, 13]);

    // Read per line, and the reading is what proves there is no band: the
    // ratios are not one number.
    const ratios = Object.values(climbs).map((rungs) => {
      const first = rungs[0];
      const last = rungs[rungs.length - 1];
      if (first === undefined || last === undefined) {
        throw new Error('lane out of range');
      }
      return last / first;
    });
    expect(new Set(ratios).size).toBeGreaterThan(1);

    // And Territory holds one flat figure rather than a lane, which is the
    // same ruling from the other side (ADR 0044 as amended 2026-08-28).
    expect(TERRITORY_DAMAGE).toBe(5);
  });

  it("the first rung buys more than an even share of a line's climb", () => {
    // The record's finding that the first upgrade is the one the player must
    // feel: Garlic's level 2 is the biggest step in its own table. It is read
    // against what a rung buys altogether rather than against the damage lane,
    // because the lane is deliberately even (a flat add of the rung-1 value
    // every rung) and the front-loading lives in the counts the rung already
    // bought. Every line has at least one axis whose largest step is its first:
    // the stream doubles its columns, the wisps triple their souls, the bell
    // doubles its cones, and Territory's ground takes its biggest bite out of
    // a mob's speed at its first rung.
    //
    // The ruling behind the shape: a high ceiling has to be legible from
    // below, so growth concentrated in the last rungs would sit where the
    // fewest players stand (the record's section 5).
    const axesByLine: readonly (readonly number[])[] = [
      COLUMNS_BY_LEVEL,
      WISPS_BY_LEVEL,
      BELL_CONE_ROWS.map((row) => row.headings.length),
      SLOW_BY_LEVEL,
    ];
    for (const axis of axesByLine) {
      const shares = stepShares(lane(axis));
      const first = shares[0];
      if (first === undefined) throw new Error('axis out of range');
      for (const share of shares.slice(1)) {
        expect(first).toBeGreaterThan(share);
      }
    }
  });

  it('no line buys its climb with a bare damage number', () => {
    // The axis finding, and a promise the tree already keeps: the stream buys
    // columns, the wisps souls, the bell cones and Territory area. Held as a
    // test so a later line cannot quietly become a damage curve, which is the
    // shape the genre avoids (damage is the filler axis, not the headline
    // one).
    const headlineAxes: readonly (readonly number[])[] = [
      COLUMNS_BY_LEVEL,
      WISPS_BY_LEVEL,
      BELL_CONE_ROWS.map((row) => row.headings.length),
      RADIUS_BY_LEVEL,
    ];
    expect(headlineAxes).toHaveLength(WEAPON_LINES.length);
    for (const axis of headlineAxes) {
      const first = axis[1];
      const last = axis[MAX_LEVEL];
      if (first === undefined || last === undefined) {
        throw new Error('axis out of range');
      }
      expect(last).toBeGreaterThan(first);
    }
  });
});
