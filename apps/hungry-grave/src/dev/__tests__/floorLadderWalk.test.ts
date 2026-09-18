/**
 * The floor ladder staged and walked hit by hit (#99, design record R4).
 *
 * The seam is the walk's returned rows: the scenario prints nothing and
 * asserts nothing, because src/dev may import no bare package at all, vitest
 * included, so its guard cannot travel with it. What it returns is what is
 * read here and what a scratch script prints.
 */

import { describe, expect, it } from 'vitest';

import type { WeaponLine } from '../../game/lines/roster';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from '../../game/lines/roster';
import { SIZE_FLOOR } from '../../game/tuning';
import { DEFAULT_TUNING } from '../../game/tuningRecord';

/** What one floor hit bleeds under the record the build compiles, in points (ADR 0064). */
const BLEED_CAP =
  DEFAULT_TUNING.score.bleedCapInKills * DEFAULT_TUNING.score.trashKillScore;

import type { LadderHit } from '../floorLadderWalk';
import { LADDER_HIT_BUDGET, walkFloorLadder } from '../floorLadderWalk';
import { RIGS } from '../rigs';

/** The walk is one staged run, so every test here reads the same one. */
let walked: ReturnType<typeof walkFloorLadder> | null = null;

const walk = () => {
  walked ??= walkFloorLadder();
  return walked;
};

/** The level a line can never be stripped below (glossary: birthright). */
const floorOf = (line: WeaponLine): number =>
  BIRTHRIGHT.includes(line) ? 1 : 0;

const strippable = (
  levels: Readonly<Record<WeaponLine, number>>,
): WeaponLine[] => WEAPON_LINES.filter((line) => levels[line] > floorOf(line));

const strips = (hits: readonly LadderHit[]): LadderHit[] =>
  hits.filter((hit) => hit.event === 'weaponStripped');

describe('the floor ladder, staged and walked hit by hit', () => {
  it('bleeds the cap on the first hit and leaves the remainder standing', () => {
    // ADR 0003 as amended on Mark's 2026-09-16 ruling, "Cap the bleed": the
    // lesser of the standing score and the cap goes and the rest stays. The
    // row is what says so, because the run has moved on by the time it is read.
    const first = walk().hits[0];

    expect(first?.event).toBe('scoreBled');
    expect(first?.scoreBefore).toBe(RIGS.ladder.conditions.startingScore);
    expect(first?.scoreAfter).toBe(
      RIGS.ladder.conditions.startingScore - BLEED_CAP,
    );
    expect(first?.scoreAfter).toBeGreaterThan(0);
  });

  it('strips one rung off every line still above its floor, until no line has one', () => {
    // stripLevels' own rule, read off the rows rather than restated: the lines
    // that paid are exactly the lines that stood above their floor going in,
    // so a build's shortest line is what ends the strips.
    const hits = walk().hits;

    expect(strips(hits)).toHaveLength(MAX_LEVEL);
    for (const [index, hit] of hits.entries()) {
      if (hit.event !== 'weaponStripped') continue;
      const before = hits[index - 1];
      if (before === undefined)
        throw new Error('a strip with no row before it');
      expect(hit.lines).toEqual(strippable(before.levels));
    }
    const last = strips(hits).at(-1);
    if (last === undefined) throw new Error('the walk stripped nothing');
    expect(strippable(last.levels)).toEqual([]);
  });

  it('seals on the hit after the last rung is gone', () => {
    const hits = walk().hits;
    const sealing = hits.findIndex((hit) => hit.event === 'sealed');

    expect(sealing).toBeGreaterThan(0);
    expect(hits[sealing]?.ending).toBe('sealed');
    expect(hits[sealing - 1]?.event).toBe('weaponStripped');
  });

  it('plays one hit past the seal and reports what it did', () => {
    // The case the audit found nothing in the tree asserts. hitGrave reads no
    // ending, so the ladder runs again and re-seals: what is pinned here is
    // that the walk observed it rather than assumed it.
    const hits = walk().hits;
    const past = hits[hits.length - 1];

    expect(hits.filter((hit) => hit.event === 'sealed')).toHaveLength(2);
    expect(past?.ending).toBe('sealed');
    expect(past?.scoreAfter).toBe(past?.scoreBefore);
  });

  it('walks the whole ladder in a bounded number of hits', () => {
    // A rule change that made the ladder infinite fails here rather than
    // hanging: the budget is the bleed, one strip per rung above the floor,
    // the seal, and the one hit past it.
    const hits = walk().hits;

    expect(hits.length).toBeLessThanOrEqual(LADDER_HIT_BUDGET);
    expect(hits).toHaveLength(LADDER_HIT_BUDGET);
  });

  it('holds the grave at the size floor for every hit it forces', () => {
    // A hit taken above the floor shrinks instead of laddering, which is why
    // the row carries the size it went in at: a kill or a crumb swallowed
    // inside a live invulnerable window would grow the grave off the floor and
    // the walk would read as a missing event rather than as a missing floor.
    for (const hit of walk().hits) expect(hit.sizeBefore).toBe(SIZE_FLOOR);
  });

  it('leaves the run it walked behind, sealed', () => {
    expect(walk().state.ending).toBe('sealed');
    expect(walk().state.grave.size).toBe(SIZE_FLOOR);
  });
});
