/**
 * The ruled per-mob touch counts under the mow (ADR 0059): what one body costs
 * each weapon line, computed from the real exported rows against the real mob
 * health rows and pinned to the ruled numbers, so no tuning move can drift a
 * ruled count silently. A test here breaking means a ruling moved, and a
 * pinned count changes only by an explicit ruling, in the same motion as the
 * ruling (#79).
 *
 * The counts are the rung-1 counts, which is where each line's curve starts
 * rather than an invariant it holds: damage climbs with the rungs
 * (docs/research/weapon-growth-per-level-precedent.md section 4), so a body
 * costs fewer touches every rung the ladder buys. Territory is the exception
 * and its counts hold at every rung, because ADR 0044 as amended holds its
 * touch counts flat and moves only the pace.
 */

import { describe, expect, it } from 'vitest';

import { bellDamageFar, bellDamageNear } from '../lines/bell';
import { BIRTHRIGHT_LEVEL, MAX_LEVEL } from '../lines/roster';
import { skullDamage } from '../lines/skullStream';
import { TERRITORY_DAMAGE } from '../lines/territory';
import { wispDamage } from '../lines/wisps';
import { MOB_TYPES } from '../mobs';

/** The rung every line's ruled counts are stated at: the one a run is born on. */
const RUNG = BIRTHRIGHT_LEVEL;

/** Whole touches to take a body: the last touch lands even where it overshoots. */
const touches = (hp: number, damage: number): number => Math.ceil(hp / damage);

describe('the ruled touch counts at the rung a run is born on', () => {
  it('Territory pulses take a shambler in 2, a ghoul in 4, a revenant in 13', () => {
    // Under ADR 0059 the mow body is the cheapest thing on the field: two
    // pulses rather than the eight its old health bought. The ghoul's 20 is
    // still 4 exactly (#79) and the revenant still rounds up to 13, because
    // the mow moved trash and left the roster alone.
    expect(touches(MOB_TYPES.shambler.hp, TERRITORY_DAMAGE)).toBe(2);
    expect(touches(MOB_TYPES.ghoul.hp, TERRITORY_DAMAGE)).toBe(4);
    expect(touches(MOB_TYPES.revenant.hp, TERRITORY_DAMAGE)).toBe(13);
  });

  it('skull stream skulls take a shambler in 1, a ghoul in 3, a revenant in 8, at rung 1', () => {
    // One skull is the mow ruling itself (ADR 0059), and the shambler's 8 is
    // the health that makes it exact rather than rounded. The other two rows
    // are the whole skull counts they already were.
    expect(touches(MOB_TYPES.shambler.hp, skullDamage(RUNG))).toBe(1);
    expect(touches(MOB_TYPES.ghoul.hp, skullDamage(RUNG))).toBe(3);
    expect(touches(MOB_TYPES.revenant.hp, skullDamage(RUNG))).toBe(8);
  });

  it('wisps take a shambler in 1, a ghoul in 2, a revenant in 7, at rung 1', () => {
    // One wisp a mow body. The ghoul's two wisps is Mark's #79 ruling and it
    // survives the mow untouched, which is what keeps the ghoul the body
    // threat rather than a second mow body.
    expect(touches(MOB_TYPES.shambler.hp, wispDamage(RUNG))).toBe(1);
    expect(touches(MOB_TYPES.ghoul.hp, wispDamage(RUNG))).toBe(2);
    expect(touches(MOB_TYPES.revenant.hp, wispDamage(RUNG))).toBe(7);
  });

  it('bell tolls take a shambler in 1 at the near edge and 2 at the far edge, at rung 1', () => {
    // The far edge still tickles, which is Mark's 2026-08-19 ruling recorded
    // in ADR 0036. What the mow keeps of it is the ratio and never the
    // eight-tolls count that ratio produced at the old health.
    expect(touches(MOB_TYPES.shambler.hp, bellDamageNear(RUNG))).toBe(1);
    expect(touches(MOB_TYPES.shambler.hp, bellDamageFar(RUNG))).toBe(2);
  });

  it('leaves the far edge an eighth of the near edge at every rung, which is what tickling means', () => {
    // The ruling that survives the health move is this ratio (ADR 0036), and
    // it is stated as one edge against the other rather than as a toll count,
    // because a toll count is a reading of the health row and the ratio is
    // not.
    for (let rung = 0; rung <= MAX_LEVEL; rung++) {
      expect(`rung ${rung}: ${bellDamageFar(rung) * 8}`).toBe(
        `rung ${rung}: ${bellDamageNear(rung)}`,
      );
    }
    expect(touches(MOB_TYPES.shambler.hp, bellDamageFar(RUNG))).toBeGreaterThan(
      touches(MOB_TYPES.shambler.hp, bellDamageNear(RUNG)),
    );
  });
});
