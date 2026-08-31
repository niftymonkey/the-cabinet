/**
 * The ruled per-mob touch counts (#76 pass A): what one body costs each weapon
 * line, computed from the real exported constants against the real mob health
 * rows and pinned to the ruled numbers, so no tuning move can drift a ruled
 * count silently. A test here breaking means a ruling moved, and a pinned
 * count changes only by an explicit ruling, in the same motion as the ruling
 * (#79).
 */

import { describe, expect, it } from 'vitest';

import { BELL_DAMAGE_FAR } from '../lines/bell';
import { SKULL_DAMAGE } from '../lines/soulStream';
import { TERRITORY_DAMAGE } from '../lines/territory';
import { WISP_DAMAGE } from '../lines/wisps';
import { MOB_TYPES } from '../mobs';

/** Whole touches to take a body: the last touch lands even where it overshoots. */
const touches = (hp: number, damage: number): number => Math.ceil(hp / damage);

describe('the ruled touch counts', () => {
  it('Territory pulses take a shambler in 8, a ghoul in 4, a revenant in 13', () => {
    // The ruled contract is shambler-denominated against the pass A health
    // scale (TERRITORY_DAMAGE's own JSDoc in territory.ts): a shambler's 40 is
    // 8 pulses exactly, the ghoul's 20 is 4 exactly (#79), and the revenant
    // rounds up to 13.
    expect(touches(MOB_TYPES.shambler.hp, TERRITORY_DAMAGE)).toBe(8);
    expect(touches(MOB_TYPES.ghoul.hp, TERRITORY_DAMAGE)).toBe(4);
    expect(touches(MOB_TYPES.revenant.hp, TERRITORY_DAMAGE)).toBe(13);
  });

  it('soul stream skulls take a shambler in 5, a ghoul in 3, a revenant in 8', () => {
    // Five skulls is a shambler exactly (#76 pass A, SKULL_DAMAGE's own
    // comment), and the other two rows are whole skull counts against it.
    expect(touches(MOB_TYPES.shambler.hp, SKULL_DAMAGE)).toBe(5);
    expect(touches(MOB_TYPES.ghoul.hp, SKULL_DAMAGE)).toBe(3);
    expect(touches(MOB_TYPES.revenant.hp, SKULL_DAMAGE)).toBe(8);
  });

  it('wisps take a shambler in 4, a ghoul in 2, a revenant in 7', () => {
    // Four wisps a trash body (#76 pass A, the MOB_TYPES header). The ghoul's
    // health is 20 by Mark's #79 ruling: two wisps is the intent, and the
    // Territory pulse and far-edge toll dropping to 4 each is paid knowingly.
    expect(touches(MOB_TYPES.shambler.hp, WISP_DAMAGE)).toBe(4);
    expect(touches(MOB_TYPES.ghoul.hp, WISP_DAMAGE)).toBe(2);
    expect(touches(MOB_TYPES.revenant.hp, WISP_DAMAGE)).toBe(7);
  });

  it('bell tolls at the far edge take a shambler in 8', () => {
    // The far edge tickles: eight tolls out here to take one trash body
    // (Mark's 2026-08-19 ruling recorded in ADR 0005, #76 pass A).
    expect(touches(MOB_TYPES.shambler.hp, BELL_DAMAGE_FAR)).toBe(8);
  });
});
