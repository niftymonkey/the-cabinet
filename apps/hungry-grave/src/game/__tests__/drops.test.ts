/**
 * The dice that pick which line a carrier's drop levels (ADR 0002 and ADR
 * 0034). Expected values come from the ADRs and from Mark's 2026-08-22 ruling,
 * never from running the module.
 */

import { describe, expect, it } from 'vitest';

import { dropForCarrier, rollDropLine } from '../drops';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from '../lines/roster';
import type { WeaponLine } from '../lines/roster';
import type { RunState } from '../run';
import { createRun } from '../run';
import { RAMP_ROWS } from '../stage/stage';

function quietRun(seed = 14): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

describe('the dice pick the line and never whether a drop appears (ADR 0002 and ADR 0034)', () => {
  it("seeds the run's first roll among the lines still at level zero", () => {
    // Mark's 2026-08-22 ruling, in its narrowed form: the seeding is worth one
    // drop, so a run always opens a line the birthright does not carry.
    const unowned = WEAPON_LINES.filter((line) => !BIRTHRIGHT.includes(line));
    for (let seed = 1; seed <= 40; seed++) {
      const state = quietRun(seed);
      for (const line of unowned) expect(state.levels[line]).toBe(0);
      expect(unowned).toContain(rollDropLine(state, 1));
    }
  });

  it('rolls uniform over all four once every line is owned, the seeding drop included', () => {
    const seen = new Set<WeaponLine>();
    for (let seed = 1; seed <= 200; seed++) {
      const state = quietRun(seed);
      for (const line of WEAPON_LINES) state.levels[line] = 1;
      seen.add(rollDropLine(state, 1));
    }
    expect([...seen].sort()).toEqual([...WEAPON_LINES].sort());
  });

  it('can miss a line over a run of four drops, which is the price of letting a line go deep', () => {
    // The guarantee this assertion replaces was the old rule's whole point, and
    // Mark gave it up on 2026-08-22 after playing: seeding every unowned line
    // spread the first three drops of a run across three different lines, so no
    // line ever gained depth. Stated as an assertion rather than dropped, so
    // reinstating the seeding turns this file red instead of passing quietly.
    const missedALine: number[] = [];
    for (let seed = 1; seed <= 60; seed++) {
      const state = quietRun(seed);
      for (let ordinal = 1; ordinal <= 4; ordinal++) {
        const line = rollDropLine(state, ordinal);
        if (state.levels[line] < MAX_LEVEL) state.levels[line] += 1;
      }
      if (WEAPON_LINES.some((line) => state.levels[line] === 0)) {
        missedALine.push(seed);
      }
    }
    expect(missedALine.length).toBeGreaterThan(0);
  });

  it("still reaches a maxed line, so ADR 0002's overflow path stays live", () => {
    const state = quietRun();
    for (const line of WEAPON_LINES) state.levels[line] = MAX_LEVEL;
    expect(WEAPON_LINES).toContain(rollDropLine(state, 1));
  });
});

/** One carrier's death, reporting the line the drop it left levels. */
function nextDropLine(state: RunState): WeaponLine {
  for (const event of dropForCarrier(state, 100, 100)) {
    if (event.type === 'dropSpawned') return event.line;
  }
  throw new Error('a carrier death left no drop');
}

describe('the dice go deep after the first drop (Mark, 2026-08-22)', () => {
  it("seeds the run's first drop among the lines at level 0", () => {
    // Driven through dropForCarrier rather than through the seam, because the
    // ordinal is the thing being tested: it is read off the drops stream's own
    // cursor, so an off-by-one there would seed the second drop instead.
    const unowned = WEAPON_LINES.filter((line) => !BIRTHRIGHT.includes(line));
    for (let seed = 1; seed <= 40; seed++) {
      const state = quietRun(seed);
      expect(nextDropLine(state)).toBeOneOf([...unowned]);
    }
  });

  it('rolls every drop after the first uniform over all four, an owned line included', () => {
    // No drop here is ever swallowed, so wisps and bell sit at level zero for
    // the whole of every run below. An owned line turning up in the set is
    // therefore the entire change: after the first drop the dice stop seeding.
    const seen = new Set<WeaponLine>();
    for (let seed = 1; seed <= 60; seed++) {
      const state = quietRun(seed);
      nextDropLine(state);
      seen.add(nextDropLine(state));
      expect(state.levels.wisps).toBe(0);
      expect(state.levels.bell).toBe(0);
    }
    expect([...seen].sort()).toEqual([...WEAPON_LINES].sort());
  });

  it('lets one line go deep: a skull stream past level 1 with lines still unowned', () => {
    // The defect the ruling fixes, read the way a player reads it. Under the
    // old rule the first three drops of a run went to three different lines, so
    // the skull stream could not reach level two until every line was open.
    const deepened: number[] = [];
    for (let seed = 1; seed <= 60; seed++) {
      const state = quietRun(seed);
      for (let ordinal = 1; ordinal <= 3; ordinal++) {
        const line = rollDropLine(state, ordinal);
        if (state.levels[line] < MAX_LEVEL) state.levels[line] += 1;
      }
      const unowned = WEAPON_LINES.filter((line) => state.levels[line] === 0);
      if (state.levels.skullStream > 1 && unowned.length > 0)
        deepened.push(seed);
    }
    expect(deepened.length).toBeGreaterThan(0);
  });
});
