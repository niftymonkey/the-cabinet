/**
 * The tip (design record `grave-in-the-ground.md` R1): how much of a piece of
 * food is over the grave's mouth, as a share of the most of it that could ever
 * be over this mouth.
 *
 * Every expected value here is worked by hand off R1's own arithmetic and never
 * off the module, and the two boxes are built the way `graveHitbox` and
 * `corpseHitbox` build them.
 */

import { describe, expect, it } from 'vitest';

import { CORPSE_HALF_EXTENT, POWER_UP_HALF_EXTENT } from '../corpses';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { graveWidth } from '../grave';
import type { Rect } from '../overlap';
import { shareOverMouth } from '../tip';
import { SIZE_CEILING, SIZE_FLOOR, SIZE_START } from '../tuning';

/** The mouth as `graveHitbox` builds it: the width the size gives, centred on the grave. */
const mouthAt = (x: number, y: number, size: number): Rect => ({
  x: x - graveWidth(size) / 2,
  y: y - size,
  width: graveWidth(size),
  height: size * 2,
});

/** A piece of food as `corpseHitbox` builds it: a square centred on the body, at its own half extent. */
const foodAt = (x: number, y: number, halfExtent: number): Rect => ({
  x: x - halfExtent,
  y: y - halfExtent,
  width: halfExtent * 2,
  height: halfExtent * 2,
});

/** Mid-field, where neither edge of the field is in play. */
const MID_X = FIELD_WIDTH / 2;
const MID_Y = 380;

describe('the share of food over the mouth (design record R1)', () => {
  it('is one when the food lies wholly over the mouth', () => {
    // A corpse 14 by 14 over a mouth 27 by 54: 196 over the mouth against a
    // most of min(14, 27) times min(14, 54), which is the same 196.
    const mouth = mouthAt(MID_X, MID_Y, SIZE_START);

    expect(
      shareOverMouth(foodAt(MID_X, MID_Y, CORPSE_HALF_EXTENT), mouth),
    ).toBe(1);
  });

  it('is zero when the food does not touch the mouth at all', () => {
    const mouth = mouthAt(MID_X, MID_Y, SIZE_START);

    expect(shareOverMouth(foodAt(100, MID_Y, CORPSE_HALF_EXTENT), mouth)).toBe(
      0,
    );
  });

  it('is zero when the food shares only an edge with the mouth', () => {
    // The same half-open convention `overlaps` states: two boxes sharing
    // exactly an edge do not overlap, so a corpse resting against the rim is
    // not over it. R1's sliver rule would read as a swallow at zero width
    // otherwise.
    const mouth = mouthAt(MID_X, MID_Y, SIZE_START);
    const touchingLeftRim = mouth.x - CORPSE_HALF_EXTENT;

    expect(
      shareOverMouth(foodAt(touchingLeftRim, MID_Y, CORPSE_HALF_EXTENT), mouth),
    ).toBe(0);
  });

  it('is one half when a corpse lies half across the side of the mouth', () => {
    // Centred on the rim: 7 of its 14 across, full height over, so 98 against
    // a most of 196. This is the sliver rule's own middle, and it is under the
    // 0.55 threshold.
    const mouth = mouthAt(MID_X, MID_Y, SIZE_START);

    expect(
      shareOverMouth(foodAt(mouth.x, MID_Y, CORPSE_HALF_EXTENT), mouth),
    ).toBe(0.5);
  });

  it('is one when food wider than the mouth has the whole width of the mouth under it', () => {
    // A power-up 28 wide over a floor-size mouth 18 wide: 18 times 28 over the
    // mouth against a most of min(28, 18) times min(28, 36), the same 504. This
    // is the division ADR 0003 needs, that size never gates a swallow.
    const mouth = mouthAt(MID_X, MID_Y, SIZE_FLOOR);

    expect(
      shareOverMouth(foodAt(MID_X, MID_Y, POWER_UP_HALF_EXTENT), mouth),
    ).toBe(1);
  });

  it('measures food wider than the mouth on one axis against the least of each axis', () => {
    // A power-up over the start-size mouth, 27 by 54, pushed up until half its
    // height is over: 27 times 14 over the mouth, against a most of min(28, 27)
    // times min(28, 54), which is 756. The prototype divided by the food's own
    // area, 784, and would read 0.482 here; this is the case R1 says is the
    // common one, because food is 28 wide against a mouth 27 wide at the start.
    const mouth = mouthAt(MID_X, MID_Y, SIZE_START);

    expect(
      shareOverMouth(foodAt(MID_X, mouth.y, POWER_UP_HALF_EXTENT), mouth),
    ).toBe(0.5);
  });

  it('is one for a corpse centred on the field side edge with the grave flush to it', () => {
    // R1's edge ruling: only the part of the food inside the field counts on
    // both sides of the division. Without the clip this is 98 over 196, a flat
    // half at every grave size, and food on the edge line could never be
    // swallowed however wide the grave grew.
    const mouth = mouthAt(graveWidth(SIZE_FLOOR) / 2, MID_Y, SIZE_FLOOR);

    expect(shareOverMouth(foodAt(0, MID_Y, CORPSE_HALF_EXTENT), mouth)).toBe(1);
  });

  it('is one for a power-up centred on the field side edge over a start-size grave', () => {
    // The same ruling for the larger body: 14 of it is inside the field, all of
    // that is over the mouth, and the most that could be is that same 14 by 28.
    const mouth = mouthAt(graveWidth(SIZE_START) / 2, MID_Y, SIZE_START);

    expect(shareOverMouth(foodAt(0, MID_Y, POWER_UP_HALF_EXTENT), mouth)).toBe(
      1,
    );
  });

  it('is one for a corpse centred on the field top edge with the grave flush to it', () => {
    // The clip is the field and not the side edges alone, so the top behaves
    // the same way: 7 of the corpse's height is inside the field, all of it
    // over the mouth.
    const mouth = mouthAt(MID_X, SIZE_FLOOR, SIZE_FLOOR);

    expect(shareOverMouth(foodAt(MID_X, 0, CORPSE_HALF_EXTENT), mouth)).toBe(1);
  });

  it('is zero and finite for food wholly outside the field', () => {
    // Nothing of the food could ever be over any mouth, so the most is nothing
    // to divide by. The answer is the zero R1 states and never a not-a-number,
    // which the sim's own invariant would fire on a tick later.
    const mouth = mouthAt(MID_X, MID_Y, SIZE_CEILING);

    const offTheLeft = shareOverMouth(
      foodAt(-CORPSE_HALF_EXTENT * 3, MID_Y, CORPSE_HALF_EXTENT),
      mouth,
    );
    const offTheBottom = shareOverMouth(
      foodAt(MID_X, FIELD_HEIGHT + CORPSE_HALF_EXTENT * 3, CORPSE_HALF_EXTENT),
      mouth,
    );

    expect(offTheLeft).toBe(0);
    expect(offTheBottom).toBe(0);
    expect(Number.isFinite(offTheLeft)).toBe(true);
    expect(Number.isFinite(offTheBottom)).toBe(true);
  });
});
