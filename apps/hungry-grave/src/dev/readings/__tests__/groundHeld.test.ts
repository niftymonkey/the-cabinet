/**
 * The ground-held reading: the field fraction of open claimed ground, as a
 * deterministic fixed-grid union (#79).
 *
 * Expected fractions come from the circle-area formula, independent of the
 * grid walk, with the tolerance stated from the cell size: the estimate can
 * miscount only cells the rim crosses, a band of one cell diagonal around the
 * rim, so the error is bounded by 2 * pi * radius * cell * sqrt(2) of area.
 */

import { describe, expect, it } from 'vitest';

import { FIELD_HEIGHT, FIELD_WIDTH } from '../../../game/field';
import type { Patch } from '../../../game/lines/territory';
import { RADIUS_BY_LEVEL } from '../../../game/lines/territory';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import {
  createGroundHeld,
  GROUND_CELL,
  groundHeldOf,
  observeGroundHeld,
} from '../groundHeld';

const SEED = 20260830;

const FIELD_AREA = FIELD_WIDTH * FIELD_HEIGHT;

/** Open ground of one birth rung, placed by hand in a chosen slot. */
function placePatch(
  run: RunState,
  slot: number,
  level: number,
  x: number,
  y: number,
): Patch {
  const patch = run.patches[slot];
  patch.alive = true;
  patch.id = run.nextEntityId;
  run.nextEntityId += 1;
  patch.level = level;
  patch.x = x;
  patch.y = y;
  patch.radius = RADIUS_BY_LEVEL[level];
  patch.opening = 0;
  return patch;
}

/** The rim band the grid may miscount, as a fraction of the field. */
function tolerance(radius: number): number {
  return (2 * Math.PI * radius * GROUND_CELL * Math.SQRT2) / FIELD_AREA;
}

function fractionNow(run: RunState): number {
  const acc = createGroundHeld();
  observeGroundHeld(acc, run);
  return groundHeldOf(acc).fraction[0]!;
}

describe('groundHeld', () => {
  it("one patch reads close to its own share of the field's area", () => {
    const run = createRun(SEED);
    const radius = RADIUS_BY_LEVEL[5];
    placePatch(run, 0, 5, 270, 380);

    const exact = (Math.PI * radius * radius) / FIELD_AREA;
    expect(Math.abs(fractionNow(run) - exact)).toBeLessThan(tolerance(radius));
  });

  it('overlapping ground is never counted twice', () => {
    // A patch wholly inside another adds nothing: the union is the outer
    // patch alone, and the same grid gives the same count exactly.
    const run = createRun(SEED);
    placePatch(run, 0, 5, 270, 380);
    const alone = fractionNow(run);
    expect(alone).toBeGreaterThan(0);

    placePatch(run, 1, 1, 270, 380);
    expect(fractionNow(run)).toBe(alone);
  });

  it('an off-field slice of a patch counts for nothing', () => {
    // A patch centred on the field's edge holds half its disc off-field, and
    // claimed ground nothing can stand on must not inflate the reading.
    const run = createRun(SEED);
    const radius = RADIUS_BY_LEVEL[5];
    placePatch(run, 0, 5, 0, 380);

    const exact = (Math.PI * radius * radius) / 2 / FIELD_AREA;
    expect(Math.abs(fractionNow(run) - exact)).toBeLessThan(tolerance(radius));
  });

  it('ground still opening holds nothing', () => {
    // Open means the hands are up, the same rule the holding seam applies:
    // ground in its opening beat controls nothing, so it holds no area.
    const run = createRun(SEED);
    const patch = placePatch(run, 0, 3, 270, 380);
    patch.opening = 10;
    expect(fractionNow(run)).toBe(0);

    patch.opening = 0;
    expect(fractionNow(run)).toBeGreaterThan(0);
  });

  it('an empty field reads zero', () => {
    const run = createRun(SEED);
    expect(fractionNow(run)).toBe(0);
  });
});
