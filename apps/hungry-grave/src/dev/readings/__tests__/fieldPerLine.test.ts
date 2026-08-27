/**
 * What the storm held on the field (#74 story 10). The field is built from a
 * known number of live entities and the sim's own level table, so the expected
 * counts never come from the reading's own mapping.
 */

import { describe, expect, it } from 'vitest';

import { advanceBell, BELL_PERIOD } from '../../../game/lines/bell';
import { STONES_BY_LEVEL } from '../../../game/lines/headstones';
import type { WeaponLine } from '../../../game/lines/roster';
import { createRun } from '../../../game/run';
import {
  createFieldPerLine,
  fieldPerLineOf,
  observeFieldPerLine,
  ON_FIELD_BY_LINE,
} from '../fieldPerLine';
import { linesInRun } from '../runLines';

const SEED = 20260826;
const HEADSTONE_LEVEL = 2;
const LIVE_SKULLS = 3;
const LIVE_WISPS = 2;

describe('field per line', () => {
  it('counts what each line has on the field each tick, with the total beside it', () => {
    // Story 10: field density as a reading rather than an impression. The
    // number counts things, and the total is the headline.
    const levels: Record<WeaponLine, number> = {
      soulStream: 1,
      headstones: HEADSTONE_LEVEL,
      wisps: 1,
      bell: 1,
    };
    const run = createRun(SEED, undefined, levels);
    for (let slot = 0; slot < LIVE_SKULLS; slot++)
      run.skulls[slot].alive = true;
    for (let slot = 0; slot < LIVE_WISPS; slot++) run.wisps[slot].alive = true;
    const stones = STONES_BY_LEVEL[HEADSTONE_LEVEL];
    const accumulator = createFieldPerLine();

    observeFieldPerLine(accumulator, run, linesInRun(run));
    for (let tick = 0; tick < BELL_PERIOD; tick++) advanceBell(run);
    expect(run.lines.ring).not.toBeNull();
    observeFieldPerLine(accumulator, run, linesInRun(run));

    const field = fieldPerLineOf(accumulator);
    expect(field.perLine.soulStream).toEqual([LIVE_SKULLS, LIVE_SKULLS]);
    expect(field.perLine.wisps).toEqual([LIVE_WISPS, LIVE_WISPS]);
    expect(field.perLine.headstones).toEqual([stones, stones]);
    expect(field.perLine.bell).toEqual([0, 1]);
    expect(field.total).toEqual([
      LIVE_SKULLS + LIVE_WISPS + stones,
      LIVE_SKULLS + LIVE_WISPS + stones + 1,
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

    observeFieldPerLine(accumulator, run, linesInRun(run));

    const field = fieldPerLineOf(accumulator);
    expect(Object.keys(ON_FIELD_BY_LINE)).not.toContain('moonlight');
    expect('moonlight' in field.perLine).toBe(false);
    expect(Object.keys(field.perLine).sort()).toEqual([
      'bell',
      'headstones',
      'soulStream',
      'wisps',
    ]);
  });
});
