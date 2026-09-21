/**
 * The fall (design record R5). Every expected value is worked by hand from the
 * record's own figures: the tilt 1.36 rad over 0.30 s, the drop 0.75 s, and the
 * camera and the dark of R4's projection.
 */

import { describe, expect, it } from 'vitest';

import { CORPSE_HALF_EXTENT } from '../../../../game/corpses';
import type { Fall } from '../fall';
import { fallAt, FALL_TICKS } from '../fall';
import { GRAVE_VIEW } from '../graveDrawingValues';
import { lightAtDepth } from '../graveProjection';

/** The size the game starts a grave at, which is what these falls fall into. */
const SIZE = 27;

/** The last tick of the tip: 0.30 s at 60 Hz. */
const TIP_TICKS = 18;

/**
 * A corpse that has just gone over the middle of the right-hand rim, still.
 *
 * In the grave's own half-lengths the mouth runs from -0.5 to 0.5 across and
 * -1 to 1 down, because the half-height is the size and the width is the size
 * again, so the right rim is x = 0.5 and a corpse's half extent is 7 / 27.
 */
const overTheRightRim = (): Fall => ({
  unitX: 0.5,
  unitY: 0,
  unitVx: 0,
  unitVy: 0,
  halfExtent: CORPSE_HALF_EXTENT,
  born: 0,
});

const ticksOfTheDrop = (): number[] =>
  Array.from({ length: FALL_TICKS - TIP_TICKS }, (_, step) => TIP_TICKS + step);

describe('the fall (grave-in-the-ground R5)', () => {
  it('starts at the place the body crossed the rim, and not at the middle of the hole', () => {
    // R5: a fall starts where the body crossed the rim. Mark read a body that
    // snapped to the middle first as "transported to the middle, as opposed to
    // falling in". At birth nothing has turned and nothing has slid, so the
    // body draws at the offset the swallow's event carried: half a half-length
    // out, which is 13.5 field units at the start size.
    const drawn = fallAt(overTheRightRim(), 0, SIZE);
    expect(drawn.x).toBeCloseTo(13.5, 6);
    expect(drawn.y).toBeCloseTo(0, 6);
  });

  it("holds its place in the grave's proportions, so the same fall draws twice as far out once the grave has doubled", () => {
    // R5: the fall is anchored in the grave's proportions and not in field
    // units. A feast pays 30.375 of size on the tip tick, so the mouth is twice
    // the size by the frame after, and the body has to be at the same place on
    // the bigger rim rather than in mid-hole.
    const fall = overTheRightRim();
    expect(fallAt(fall, 0, SIZE).x).toBeCloseTo(13.5, 6);
    expect(fallAt(fall, 0, SIZE * 2).x).toBeCloseTo(27, 6);
  });

  it("keeps a falling body's own size in field units while the grave grows", () => {
    // R5: the body does not grow because the grave grew; only the projection's
    // own shrink with depth changes it. At birth it is exactly its own size at
    // any grave size, and it only ever shrinks from there.
    const fall = overTheRightRim();
    for (const size of [SIZE, SIZE * 2]) {
      expect(fallAt(fall, 0, size).along).toBeCloseTo(1, 6);
      expect(fallAt(fall, 0, size).across).toBeCloseTo(1, 6);
      expect(fallAt(fall, 40, size).across).toBeLessThan(1);
    }
  });

  it('turns the body to the full tilt over the tip time and no further', () => {
    // R5: the body tips 1.36 rad over the tip time, about the rim it crossed.
    // What that leaves on screen is the foreshortening, which is `along` with
    // the projection's own shrink divided out of it: 1 at birth, and 0.363 by
    // the end of the tip, worked by hand from the two ends at that tilt (one
    // 0.4148 half-lengths past the rim, the other 0.1037 outside it).
    const fall = overTheRightRim();
    const squeezeAt = (age: number): number => {
      const drawn = fallAt(fall, age, SIZE);
      return drawn.along / drawn.across;
    };
    expect(squeezeAt(0)).toBeCloseTo(1, 6);
    // From the half way mark on, where the turn eases in: by then the tilt is
    // 1.36 / 4 and the squeeze is already 5% down, which swamps the hair of
    // magnification the end still outside the rim gets from rising toward the
    // camera over the first ticks.
    for (let age = TIP_TICKS / 2 + 1; age <= TIP_TICKS; age++) {
      expect(squeezeAt(age)).toBeLessThan(squeezeAt(age - 1));
    }
    expect(squeezeAt(TIP_TICKS)).toBeCloseTo(0.363, 2);
    // And no further: the drop inherits the rod the tip left standing, so the
    // turn stops adding to the squeeze the moment the tip is over.
    expect(squeezeAt(TIP_TICKS + 1)).toBeCloseTo(squeezeAt(TIP_TICKS), 2);
  });

  it('carries the body deeper on every tick of the drop time', () => {
    // R5: it falls under gravity, shrinking on the projection the walls use, so
    // every tick of the drop draws it smaller than the tick before.
    const fall = overTheRightRim();
    for (const age of ticksOfTheDrop()) {
      expect(fallAt(fall, age + 1, SIZE).across).toBeLessThan(
        fallAt(fall, age, SIZE).across,
      );
    }
  });

  it('eases a falling body toward the middle of the hole as it goes down (decision 7)', () => {
    // Mark's decision 7: "it slides down the side until there's no more side
    // and then it kind of eases towards the middle of the blackness". The
    // ground position is spent against the wall and the projection carries what
    // is left toward the middle, further with every half-length of depth.
    const fall = overTheRightRim();
    for (const age of ticksOfTheDrop()) {
      expect(fallAt(fall, age + 1, SIZE).x).toBeLessThan(
        fallAt(fall, age, SIZE).x,
      );
    }
    expect(fallAt(fall, FALL_TICKS, SIZE).x).toBeGreaterThan(0);
  });

  it("leaves a body at the dark depth as dark as the wall beside it, on the walls' own curve", () => {
    // R5: it darkens on the walls' own curve until the dark takes it. Worked by
    // hand: the tip leaves the body 0.1521 half-lengths down, gravity is
    // 2 * 2.4 / 0.75^2, so 22 ticks into the drop it is at 1.3165 half-lengths
    // and the curve gives 1 - (1.3165 / 2.4) ^ 2.6.
    const fall = overTheRightRim();
    expect(fallAt(fall, 40, SIZE).light).toBeCloseTo(0.79, 2);
    expect(fallAt(fall, 40, SIZE).light).toBeCloseTo(
      lightAtDepth(1.3165, GRAVE_VIEW),
      3,
    );
    expect(fallAt(fall, FALL_TICKS, SIZE).light).toBe(
      lightAtDepth(GRAVE_VIEW.darkDepth, GRAVE_VIEW),
    );
  });

  it('keeps the way the food was swallowed with, so a body pulled in fast starts out faster than one that crept in', () => {
    // R5: it keeps its momentum, which is what makes a body arrive rather than
    // be placed. Both bodies go over the left rim; the pulled one carries two
    // half-lengths a second across the shaft with it.
    const crept: Fall = { ...overTheRightRim(), unitX: -0.5 };
    const pulled: Fall = { ...crept, unitVx: 2 };
    const age = TIP_TICKS + 5;
    expect(fallAt(pulled, age, SIZE).x).toBeGreaterThan(
      fallAt(crept, age, SIZE).x,
    );
  });

  it('folds a body longer than the opening to fit', () => {
    // R5: food longer than the opening folds in to fit. At the size floor the
    // opening is 18 field units from its middle to the far lip, so a body 40
    // units to its own end folds to 18 / 40 of itself and goes in.
    const floor = 18;
    const long: Fall = { ...overTheRightRim(), halfExtent: 40 };
    const atTheLip = fallAt(long, TIP_TICKS, floor);
    expect(atTheLip.across * long.halfExtent).toBeLessThanOrEqual(floor);
    // A body that fits is not folded at all: what is left on it at the end of
    // the tip is the projection's own shrink at 0.1521 half-lengths down.
    expect(fallAt(overTheRightRim(), TIP_TICKS, SIZE).across).toBeCloseTo(
      0.97,
      2,
    );
  });

  it('is over after the tip time and the drop time together, and lands never', () => {
    // R5: 0.30 s and 0.75 s at 60 Hz, which is the 63 ticks the transient
    // registry is told about. Nothing catches it: it is still shrinking on the
    // tick the dark has it, so there is no settle and no thud.
    expect(FALL_TICKS).toBe(63);
    const fall = overTheRightRim();
    expect(fallAt(fall, FALL_TICKS, SIZE).gone).toBe(true);
    expect(fallAt(fall, 0, SIZE).gone).toBe(false);
    expect(fallAt(fall, FALL_TICKS, SIZE).across).toBeLessThan(
      fallAt(fall, FALL_TICKS - 1, SIZE).across,
    );
  });
});
