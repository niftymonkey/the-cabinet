/**
 * What the grave itself did across the run (#74 stories 5 and 15). The sizes
 * come out of the sim's own hit entry point, so the expected series is ADR
 * 0003's shrink rather than a number read back off the reading.
 */

import { describe, expect, it } from 'vitest';

import { FIELD_HEIGHT } from '../../../game/field';
import { ageGrave, hitGrave, moveGrave } from '../../../game/grave';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import {
  BASE_SPEED,
  HIT_SHRINK,
  INVULNERABLE_TICKS,
  SIZE_START,
} from '../../../game/tuning';
import {
  BOTTOM_EDGE_MARGIN,
  createGravePath,
  gravePathOf,
  observeGravePath,
} from '../gravePath';

const SEED = 20260826;
// A conditioned start, so index 0 cannot pass by matching the compiled default.
const PINNED_SIZE = 40;

// A grave two and a half times its starting size, which is a run going well.
const GROWN_SIZE = SIZE_START * 2.5;

/** One landed hit, with the invulnerability window it opens counted back down. */
const land = (run: RunState): void => {
  hitGrave(run, 'shambler');
  for (let tick = 0; tick < INVULNERABLE_TICKS; tick++) ageGrave(run.grave);
};

/** Puts the grave's centre where the case wants it, through the sim's own mover. */
const placeGraveAt = (run: RunState, y: number): void => {
  moveGrave(run.grave, { x: 0, y: (y - run.grave.y) / BASE_SPEED });
};

// How much field is left under the grave, which is what the reading measures.
const gapUnder = (run: RunState): number =>
  FIELD_HEIGHT - (run.grave.y + run.grave.size);

describe('grave path', () => {
  it("samples the grave's size every tick, index 0 the header's resolved starting size", () => {
    // Story 5, with the amendment that index 0 seeds from the header rather
    // than from SIZE_START: a conditioned run has to report its real first
    // sample. Index N is the size after N ticks, matching the mob population.
    const run = createRun(SEED, PINNED_SIZE);
    const accumulator = createGravePath(run.grave.size);

    observeGravePath(accumulator, run);
    land(run);
    observeGravePath(accumulator, run);
    land(run);
    observeGravePath(accumulator, run);

    expect(PINNED_SIZE).not.toBe(SIZE_START);
    expect(gravePathOf(accumulator).sizePerTick).toEqual([
      PINNED_SIZE,
      PINNED_SIZE,
      PINNED_SIZE - HIT_SHRINK,
      PINNED_SIZE - HIT_SHRINK * 2,
    ]);
  });

  it("counts ticks the grave's rim spent inside the named bottom-edge margin", () => {
    // Story 15: camping pressure as a number. What is measured is the gap from
    // the bottom rim to the edge, never from the centre, and the starting mark
    // sits outside the margin either way, which is what makes the count mean
    // the player went looking for the edge.
    const run = createRun(SEED);
    const accumulator = createGravePath(run.grave.size);
    const centreLine = FIELD_HEIGHT - BOTTOM_EDGE_MARGIN;

    expect(gapUnder(run)).toBeGreaterThan(BOTTOM_EDGE_MARGIN);
    observeGravePath(accumulator, run);

    // One unit further out than the margin, by the rim.
    placeGraveAt(run, centreLine - run.grave.size - 1);
    expect(gapUnder(run)).toBeGreaterThan(BOTTOM_EDGE_MARGIN);
    observeGravePath(accumulator, run);

    // Inside the margin by the rim while the centre is still short of the line
    // a centre test would draw: this tick is the whole difference between the
    // two readings, and it is the reading the player can see.
    placeGraveAt(run, centreLine - 1);
    expect(run.grave.y).toBeLessThan(centreLine);
    expect(gapUnder(run)).toBeLessThanOrEqual(BOTTOM_EDGE_MARGIN);
    observeGravePath(accumulator, run);

    // Hard against the edge, where containment stops the grave.
    placeGraveAt(run, FIELD_HEIGHT);
    expect(gapUnder(run)).toBe(0);
    observeGravePath(accumulator, run);

    const path = gravePathOf(accumulator);
    expect(path.ticksNearBottomEdge).toBe(2);
    expect(path.bottomEdgeMargin).toBe(BOTTOM_EDGE_MARGIN);
  });

  it('counts the same band of travel however large the grave has grown', () => {
    // Containment holds the centre at FIELD_HEIGHT minus the size, so the band
    // a centre test could ever count shrinks as the grave grows: 49 units of
    // travel at the starting size and 8.5 at two and a half times it. The rim's
    // gap is the margin wide at every size, so the reading cannot fall for the
    // run that went best, which is the story it was asked for.
    expect(GROWN_SIZE).toBeGreaterThan(SIZE_START);

    for (const size of [SIZE_START, GROWN_SIZE]) {
      const run = createRun(SEED);
      run.grave.size = size;
      const accumulator = createGravePath(size);

      placeGraveAt(run, FIELD_HEIGHT);
      expect(gapUnder(run)).toBe(0);
      observeGravePath(accumulator, run);

      placeGraveAt(run, FIELD_HEIGHT - size - BOTTOM_EDGE_MARGIN);
      expect(gapUnder(run)).toBe(BOTTOM_EDGE_MARGIN);
      observeGravePath(accumulator, run);

      placeGraveAt(run, FIELD_HEIGHT - size - BOTTOM_EDGE_MARGIN - 1);
      expect(gapUnder(run)).toBe(BOTTOM_EDGE_MARGIN + 1);
      observeGravePath(accumulator, run);

      expect(gravePathOf(accumulator).ticksNearBottomEdge).toBe(2);
    }
  });
});
