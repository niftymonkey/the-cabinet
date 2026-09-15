/**
 * These assert the derivations, never the magnitudes. A test here breaking
 * means a design rule broke, not that a number was tuned.
 */

import { describe, expect, it } from 'vitest';
import { TICK_HZ } from '../clock';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import {
  BASE_SPEED,
  CORPSES_TO_CEILING,
  FEAST_PAYOUT,
  FRESHNESS_PAYOUT_FLOOR,
  FRESHNESS_SECONDS,
  INVULNERABLE_TICKS,
  RESERVOIR_CAPACITY,
  SCROLL_SPEED,
  SIZE_CEILING,
  SIZE_FLOOR,
  SIZE_START,
  TRASH_CORPSE_PAYOUT,
} from '../tuning';

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
  it("the reservoir's capacity is the Banshee feast's payout exactly, so the beat is arithmetically reachable (entry 5.11)", () => {
    // Entry 5.11's identity is the ruling and it holds: the same swallow that
    // feeds slams the reservoir full, so capacity is the feast's payout
    // exactly and a fully fresh feast wastes nothing. A flat 100 here would
    // have made the beat arithmetically impossible, because a full reservoir
    // would then cost more cumulative growth than the entire floor-to-ceiling
    // range.
    //
    // The feast's own size in corpses is the magnitude and it moved with the
    // economy: entry 5.11's 8 to 10 corpses was a reading of a reservoir of 9,
    // and the reservoir is now stated in corpses of expected mowing
    // (docs/research/weapon-growth-per-level-precedent.md is the weapon half;
    // the economy half is the design record's section 4 table and its section
    // 9, "about 300"). The ruling did not move; what it is measured in did.
    const corpses = FEAST_PAYOUT / TRASH_CORPSE_PAYOUT;
    expect(corpses).toBeCloseTo(300, 9);
    expect(RESERVOIR_CAPACITY).toBe(FEAST_PAYOUT);
    expect(RESERVOIR_CAPACITY).toBeLessThan(SIZE_CEILING - SIZE_FLOOR);
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
