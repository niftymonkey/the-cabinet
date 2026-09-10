/**
 * The ruled per-mob touch counts under the mow (ADR 0059): what one body costs
 * each weapon line, computed from the real exported constants against the real
 * mob health rows and pinned to the ruled numbers, so no tuning move can drift
 * a ruled count silently. A test here breaking means a ruling moved, and a
 * pinned count changes only by an explicit ruling, in the same motion as the
 * ruling (#79).
 */

import { describe, expect, it } from 'vitest';

import { BELL_DAMAGE_FAR, BELL_DAMAGE_NEAR } from '../lines/bell';
import { SKULL_DAMAGE } from '../lines/skullStream';
import { TERRITORY_DAMAGE } from '../lines/territory';
import { WISP_DAMAGE } from '../lines/wisps';
import { MOB_TYPES } from '../mobs';

/** Whole touches to take a body: the last touch lands even where it overshoots. */
const touches = (hp: number, damage: number): number => Math.ceil(hp / damage);

describe('the ruled touch counts', () => {
  it('Territory pulses take a shambler in 2, a ghoul in 4, a revenant in 13', () => {
    // Under ADR 0059 the mow body is the cheapest thing on the field: two
    // pulses rather than the eight its old health bought. The ghoul's 20 is
    // still 4 exactly (#79) and the revenant still rounds up to 13, because
    // the mow moved trash and left the roster alone.
    expect(touches(MOB_TYPES.shambler.hp, TERRITORY_DAMAGE)).toBe(2);
    expect(touches(MOB_TYPES.ghoul.hp, TERRITORY_DAMAGE)).toBe(4);
    expect(touches(MOB_TYPES.revenant.hp, TERRITORY_DAMAGE)).toBe(13);
  });

  it('skull stream skulls take a shambler in 1, a ghoul in 3, a revenant in 8', () => {
    // One skull is the mow ruling itself (ADR 0059), and the shambler's 8 is
    // the health that makes it exact rather than rounded. The other two rows
    // are the whole skull counts they already were.
    expect(touches(MOB_TYPES.shambler.hp, SKULL_DAMAGE)).toBe(1);
    expect(touches(MOB_TYPES.ghoul.hp, SKULL_DAMAGE)).toBe(3);
    expect(touches(MOB_TYPES.revenant.hp, SKULL_DAMAGE)).toBe(8);
  });

  it('wisps take a shambler in 1, a ghoul in 2, a revenant in 7', () => {
    // One wisp a mow body. The ghoul's two wisps is Mark's #79 ruling and it
    // survives the mow untouched, which is what keeps the ghoul the body
    // threat rather than a second mow body.
    expect(touches(MOB_TYPES.shambler.hp, WISP_DAMAGE)).toBe(1);
    expect(touches(MOB_TYPES.ghoul.hp, WISP_DAMAGE)).toBe(2);
    expect(touches(MOB_TYPES.revenant.hp, WISP_DAMAGE)).toBe(7);
  });

  it('bell tolls take a shambler in 1 at the near edge and 2 at the far edge', () => {
    // The far edge still tickles, which is Mark's 2026-08-19 ruling recorded
    // in ADR 0036. What the mow keeps of it is the ratio and never the
    // eight-tolls count that ratio produced at the old health.
    expect(touches(MOB_TYPES.shambler.hp, BELL_DAMAGE_NEAR)).toBe(1);
    expect(touches(MOB_TYPES.shambler.hp, BELL_DAMAGE_FAR)).toBe(2);
  });

  it('leaves the far edge an eighth of the near edge, which is what tickling means', () => {
    // The ruling that survives the health move is this ratio (ADR 0036), and
    // it is stated as one edge against the other rather than as a toll count,
    // because a toll count is a reading of the health row and the ratio is
    // not.
    expect(BELL_DAMAGE_FAR * 8).toBe(BELL_DAMAGE_NEAR);
    expect(touches(MOB_TYPES.shambler.hp, BELL_DAMAGE_FAR)).toBeGreaterThan(
      touches(MOB_TYPES.shambler.hp, BELL_DAMAGE_NEAR),
    );
  });
});
