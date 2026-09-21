/**
 * These assert the derivations, never the magnitudes. A test here breaking
 * means a design rule broke, not that a number was tuned.
 */

import { describe, expect, it } from 'vitest';
import { PHASE_HP } from '../bosses/phases';
import { TICK_HZ } from '../clock';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { MOB_TYPES } from '../mobs';
import type { BossKind } from '../stage/waves';
import { BOSS_KINDS } from '../stage/waves';
import {
  BASE_SPEED,
  CORPSES_TO_CEILING,
  FRESHNESS_PAYOUT_FLOOR,
  FRESHNESS_SECONDS,
  INVULNERABLE_TICKS,
  RESERVOIR_CAPACITY,
  RESERVOIR_IN_CORPSES,
  SCROLL_SPEED,
  SIZE_CEILING,
  SIZE_FLOOR,
  SIZE_START,
  TRASH_CORPSE_PAYOUT,
} from '../tuning';
import { DEFAULT_TUNING } from '../tuningRecord';

/**
 * The score's five rows as the figures the relations below are stated in, off
 * the record the build compiles (ADR 0064).
 *
 * The rows are stated in trash kills and the relations are about points, so the
 * conversion happens once here rather than at nine assertion sites. What the
 * suite pins is unchanged: the relations between the rows, never a magnitude.
 */
const TRASH_KILL = DEFAULT_TUNING.score.trashKillScore;
const BLEED_CAP = DEFAULT_TUNING.score.bleedCapInKills * TRASH_KILL;
const PER_BOSS_HEALTH = TRASH_KILL / DEFAULT_TUNING.score.bossHealthPerKill;
const SOURCE_KILL = DEFAULT_TUNING.score.sourceKillInKills * TRASH_KILL;
const MEAL_AT_MAXED = DEFAULT_TUNING.score.mealAtMaxedInKills * TRASH_KILL;

describe('the tuning derivations', () => {
  it("base speed crosses the field's width in two seconds (ADR 0003)", () => {
    const twoSeconds = 2 * TICK_HZ;
    expect(BASE_SPEED * twoSeconds).toBe(FIELD_WIDTH);
  });
  it('a corpse spawned at mid-field reaches the bottom edge in exactly FRESHNESS_SECONDS, derived from scroll speed alone (ADR 0004)', () => {
    // ADR 0004's coupling invariant: a mid-field kill must reach the bottom
    // edge as a nearly empty scrap, so a scroll retune retunes the meter with
    // it. Scrolled tick by tick rather than by the same formula the constant
    // uses, so the test is the trip and not the arithmetic.
    let y = FIELD_HEIGHT / 2;
    let ticks = 0;
    while (y < FIELD_HEIGHT) {
      y += SCROLL_SPEED;
      ticks += 1;
    }
    expect(ticks / TICK_HZ).toBeCloseTo(FRESHNESS_SECONDS, 1);
    expect(FRESHNESS_SECONDS).toBeCloseTo(10, 6);
  });
  it("the grave stands about a quarter of the field's width tall at its ceiling (ADR 0003)", () => {
    // Size is the half-height, so the standing height is twice it.
    expect(SIZE_CEILING * 2).toBe(FIELD_WIDTH / 4);
  });
  it('SIZE_FLOOR < SIZE_START < SIZE_CEILING, so the recovery path and the growth path both exist (ADR 0003)', () => {
    expect(SIZE_FLOOR).toBeLessThan(SIZE_START);
    expect(SIZE_START).toBeLessThan(SIZE_CEILING);
  });
  it('INVULNERABLE_TICKS is strictly greater than a third of a second, because WCAG SC 2.3.1 permits at most three flashes in any one second period', () => {
    // WCAG SC 2.3.1 Three Flashes or Below Threshold: "Web pages do not contain
    // anything that flashes more than three times in any one second period, or
    // the flash is below the general flash and red flash thresholds." A general
    // flash is a pair of opposing changes in relative luminance of 10 percent
    // or more where the darker image is below 0.80 relative luminance, and
    // ADR 0040's hit dim clears both halves on this palette.
    //
    // A hit can only land once invulnerability has run out, so the
    // invulnerability window is the dim's refractory interval. The worst case
    // for a period of p seconds is floor(1 / p) + 1 flashes, so at exactly 20
    // ticks the hits land at ticks 0, 20, 40 and 60, and 0 through 60 is one
    // second: four flashes. Strictly greater, never at least.
    expect(INVULNERABLE_TICKS).toBeGreaterThan(TICK_HZ / 3);
  });
  it('freshness scales every payout down to a quarter and never to zero (ADR 0004)', () => {
    expect(FRESHNESS_PAYOUT_FLOOR).toBe(0.25);
  });
  it("the reservoir's capacity is the corpses of mowing its own row names, and the ceiling still costs more mowing than a full reservoir pays", () => {
    // Entry 5.11's ruling did not move: the same swallow that feeds slams the
    // reservoir full. What moved is where that identity is written. It used to
    // be arithmetic, the capacity spelled as the feast's own payout, and the
    // feast's growth came down on Mark's ruling of 2026-09-21 while the belch's
    // cadence stayed exactly where it was. So the identity is now a rule in
    // swallow.ts, which swallow.test.ts asserts as behaviour, and the capacity
    // is its own row in the one unit the whole food economy is stated in.
    //
    // A flat 100 here would still be arithmetically impossible: a full
    // reservoir would cost more cumulative growth than the whole
    // floor-to-ceiling range.
    // A whole number of corpses, which is the derivation and not the
    // magnitude: dividing the capacity by the corpse's own unit hands the row
    // straight back while the capacity is written as that row times that unit,
    // so what this can catch is a capacity written as a flat figure instead.
    const corpses = RESERVOIR_CAPACITY / TRASH_CORPSE_PAYOUT;
    expect(corpses).toBeCloseTo(Math.round(corpses), 9);
    expect(corpses).toBeCloseTo(RESERVOIR_IN_CORPSES, 9);
    expect(RESERVOIR_IN_CORPSES).toBeLessThan(CORPSES_TO_CEILING);
    expect(RESERVOIR_CAPACITY).toBeLessThan(SIZE_CEILING - SIZE_FLOOR);
  });

  it('a feast pays growth worth the share of the whole climb it was ruled at, nine corpses of eighty, whatever the economy is stated in', () => {
    // Entry 5.11 ruled the feast at nine fresh trash corpses of a climb that
    // cost eighty, and Mark's ruling of 2026-09-21 is that the grave grows as
    // it eats rather than popping. The share is what survives both: the economy
    // has since been restated in four hundred corpses, and a feast is the same
    // fraction of the climb it always was.
    //
    // What it is against is the pop. While the feast's growth was written as
    // the reservoir's own count it paid 75% of the whole climb on one tick.
    const climb = SIZE_CEILING - SIZE_START;
    const growth = DEFAULT_TUNING.growth.feastInCorpses * TRASH_CORPSE_PAYOUT;
    expect(growth / climb).toBeCloseTo(9 / 80, 9);
    expect(
      DEFAULT_TUNING.growth.feastInCorpses / CORPSES_TO_CEILING,
    ).toBeCloseTo(9 / 80, 9);
  });
});

describe('the food economy in corpses of expected mowing (the record section 5 item 4)', () => {
  it('the ceiling is reached in the corpses the economy row names and not in a tenth of them', () => {
    // The record's section 5 item 4 as a relation rather than as a figure: the
    // whole climb from a run's start to its ceiling is exactly the corpses the
    // economy row names, so a size on screen is a count of mowing and the row
    // is the denominator of everything the grave is paid.
    const climb = SIZE_CEILING - SIZE_START;
    expect(CORPSES_TO_CEILING * TRASH_CORPSE_PAYOUT).toBeCloseTo(climb, 9);

    // And the ceiling costs more mowing than a full reservoir pays, which is
    // what "a Procession of mowing rather than ten seconds in" means once both
    // rows are stated in the same unit. At the dead baseline the ceiling cost
    // 80 corpses against a reservoir of 9, so the belch was a reflex and the
    // ceiling arrived before the section did; the two now sit in the same
    // order of magnitude with the ceiling above.
    const reservoirInCorpses = RESERVOIR_CAPACITY / TRASH_CORPSE_PAYOUT;
    expect(CORPSES_TO_CEILING).toBeGreaterThan(reservoirInCorpses);
    expect(reservoirInCorpses).toBeGreaterThan(CORPSES_TO_CEILING / 2);
  });
});

describe("the score's inputs, each stated against a trash kill (design record R4)", () => {
  /** What a whole fight against this boss pays, off its own health and the row. */
  const wholeFight = (kind: BossKind): number =>
    PHASE_HP[kind].reduce((sum, phase) => sum + phase, 0) * PER_BOSS_HEALTH;

  it("pays a boss's health far slower than the mow's own, so one fight can never swamp a run", () => {
    // The swamping refusal, and it is the whole reason the boss row is a rate
    // of its own rather than the mob table's. That table pays one trash kill
    // per 8 points of health, floored, and at that rate the Undertaker's health
    // alone pays more than a measured run makes from everything it mows
    // (docs/research/score-inputs-precedent.md section 4). Pinned as a relation
    // between the two rows and PHASE_HP, so a step 6 retune of any of them
    // moves it and no figure here goes stale.
    const mowRate =
      (MOB_TYPES.shambler.scorePayoutInKills * TRASH_KILL) /
      MOB_TYPES.shambler.hp;
    expect(PER_BOSS_HEALTH).toBeLessThan(mowRate);

    for (const kind of BOSS_KINDS) {
      const health = PHASE_HP[kind].reduce((sum, phase) => sum + phase, 0);
      expect(wholeFight(kind), kind).toBeLessThan(health * mowRate);
    }
  });

  it("puts the Waking's source above the richest body in the mow and below the fight that ends the stage", () => {
    // Its tier is decided by what it is to the player and never by its health:
    // the section's objective rather than roadside furniture, and a kill that
    // denies nothing because #104 keeps the pour running. So it sits above the
    // richest single kill in the mow and below the stage's last fight.
    //
    // The bound is the longest fight and not the shortest, because the source
    // and the Banshee are derived at the same hundred-health rate and their
    // health puts them within two trash kills of each other: the source's 2,400
    // pays a little more than her whole 2,200, and both sit inside the same
    // researched band for a single input.
    const lastFight = Math.max(...BOSS_KINDS.map(wholeFight));

    expect(SOURCE_KILL).toBeGreaterThan(
      MOB_TYPES.revenant.scorePayoutInKills * TRASH_KILL,
    );
    expect(SOURCE_KILL).toBeLessThan(lastFight);
  });

  it('pays one large meal at least a mow body and far less than the source', () => {
    // The count is what binds this row rather than the item: the input pays per
    // item and a run takes many, so what a whole run takes is read against a
    // boss fight in slice M7's own batch rather than pinned here. What the
    // relation holds is the two ends of it, that a meal is never worth less
    // than the body it was cut from and never a prize of the source's order.
    expect(MEAL_AT_MAXED).toBeGreaterThanOrEqual(TRASH_KILL);
    expect(MEAL_AT_MAXED).toBeLessThan(SOURCE_KILL);
  });

  it("holds the ladder's cap below what one boss fight pays", () => {
    // The two rows meet at the floor: a hit takes a capped slice of a bank that
    // three further inputs now feed, so the cap stays smaller than what a fight
    // pays or one touch would take a whole fight with it.
    expect(BLEED_CAP).toBeLessThan(Math.min(...BOSS_KINDS.map(wholeFight)));
  });
});
