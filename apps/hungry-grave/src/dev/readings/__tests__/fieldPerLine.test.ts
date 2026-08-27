/**
 * What the storm held on the field (#74 story 10). The field is built from a
 * known number of live entities and the sim's own level table, so the expected
 * counts never come from the reading's own mapping.
 */

import { describe, expect, it } from 'vitest';

import { advanceBell, BELL_PERIOD } from '../../../game/lines/bell';
import type { WeaponLine } from '../../../game/lines/roster';
import { territoryCount } from '../../../game/lines/territory';
import { createRun } from '../../../game/run';
import {
  createFieldPerLine,
  fieldPerLineOf,
  observeFieldPerLine,
  ON_FIELD_BY_LINE,
} from '../fieldPerLine';
import { linesInRun } from '../runLines';

const SEED = 20260826;
const TERRITORY_LEVEL = 2;
const LIVE_PATCHES = 4;
const LIVE_SKULLS = 3;
const LIVE_WISPS = 2;

describe('field per line', () => {
  it('counts what each line has on the field each tick, with the total beside it', () => {
    // Story 10: field density as a reading rather than an impression. The
    // number counts things, and the total is the headline.
    const levels: Record<WeaponLine, number> = {
      soulStream: 1,
      territory: TERRITORY_LEVEL,
      wisps: 1,
      bell: 1,
    };
    const run = createRun(SEED, undefined, levels);
    for (let slot = 0; slot < LIVE_SKULLS; slot++)
      run.skulls[slot].alive = true;
    for (let slot = 0; slot < LIVE_WISPS; slot++) run.wisps[slot].alive = true;
    for (let slot = 0; slot < LIVE_PATCHES; slot++)
      run.patches[slot].alive = true;
    const accumulator = createFieldPerLine();

    observeFieldPerLine(accumulator, run, linesInRun(run.levels));
    for (let tick = 0; tick < BELL_PERIOD; tick++) advanceBell(run);
    expect(run.lines.ring).not.toBeNull();
    observeFieldPerLine(accumulator, run, linesInRun(run.levels));

    const field = fieldPerLineOf(accumulator);
    expect(field.perLine.soulStream).toEqual([LIVE_SKULLS, LIVE_SKULLS]);
    expect(field.perLine.wisps).toEqual([LIVE_WISPS, LIVE_WISPS]);
    expect(field.perLine.territory).toEqual([LIVE_PATCHES, LIVE_PATCHES]);
    expect(field.perLine.bell).toEqual([0, 1]);
    expect(field.total).toEqual([
      LIVE_SKULLS + LIVE_WISPS + LIVE_PATCHES,
      LIVE_SKULLS + LIVE_WISPS + LIVE_PATCHES + 1,
    ]);
  });

  it('leaves a line with no pinned on-field representation absent rather than zero', () => {
    // A line the run names but this mapping has nothing pinned for cannot be
    // counted, and absence is what says so. A zero would claim the line had
    // nothing on the field, which is a different statement.
    const run = createRun(SEED);
    const named: Record<string, number> = run.levels;
    named.moonlight = 1;
    const accumulator = createFieldPerLine();

    observeFieldPerLine(accumulator, run, linesInRun(run.levels));

    const field = fieldPerLineOf(accumulator);
    expect(Object.keys(ON_FIELD_BY_LINE)).not.toContain('moonlight');
    expect('moonlight' in field.perLine).toBe(false);
    expect(Object.keys(field.perLine).sort()).toEqual([
      'bell',
      'soulStream',
      'territory',
      'wisps',
    ]);
  });
});

describe('Territory on the field (#76)', () => {
  it('answers for Territory with the line’s own count function, not one of its own', () => {
    // The seam honesty the #74 gate round asked for, pinned by identity rather
    // than by agreement. Two functions that both walk the patch pool agree on
    // every field there is, so an agreement check could never have failed on a
    // reading that reached into state itself; holding the mapping to the line's
    // own export does fail the moment one is written here.
    expect(ON_FIELD_BY_LINE.territory).toBe(territoryCount);
  });

  it('counts the patches standing on the field', () => {
    // The reading's own claim beside the seam's: what the mapping answers is
    // the live patch count, on a field the test built without either function.
    const run = createRun(SEED);
    for (let slot = 0; slot < LIVE_PATCHES; slot++)
      run.patches[slot].alive = true;

    const onField = ON_FIELD_BY_LINE.territory!;
    expect(onField(run)).toBe(LIVE_PATCHES);

    run.patches[0].alive = false;
    expect(onField(run)).toBe(LIVE_PATCHES - 1);
  });
});
