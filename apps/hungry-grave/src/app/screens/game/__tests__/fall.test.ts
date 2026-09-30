/**
 * The fall (design record R5). Every expected value is worked by hand from the
 * record's own figures: the tilt 1.36 rad over 0.30 s, the drop 0.75 s, and the
 * camera and the dark of R4's projection.
 */

import { describe, expect, it } from 'vitest';

import { TICK_HZ } from '../../../../game/clock';
import { CORPSE_HALF_EXTENT } from '../../../../game/corpses';
import {
  SHORTEST_FIELD,
  TALLEST_FIELD_HEIGHT,
  fieldOfHeight,
} from '../../../../game/field';
import { DEFAULT_TUNING } from '../../../../game/tuningRecord';
import type { Fall } from '../fall';
import { fallAt, FALL_TICKS } from '../fall';
import type { GraveView } from '../graveProjection';
import { lightAtDepth } from '../graveProjection';
import { holeViewOver } from '../GraveRenderer';
import { sceneFor } from '../scene';

/**
 * Build 7's own camera over the hole, 4.95 half-lengths up and 1.07 behind, with
 * R4's dark: the view these promises were written against, handed in now that
 * the painters take the view they are cut with (tilted view T4).
 */
const BUILD_7_VIEW: GraveView = {
  cameraHeight: 4.95,
  nadirX: 0,
  nadirY: 1.07,
  darkDepth: 2.4,
  darkFalloff: 2.6,
};

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
    const drawn = fallAt(overTheRightRim(), 0, SIZE, BUILD_7_VIEW);
    expect(drawn.x).toBeCloseTo(13.5, 6);
    expect(drawn.y).toBeCloseTo(0, 6);
  });

  it("holds its place in the grave's proportions, so the same fall draws twice as far out once the grave has doubled", () => {
    // R5: the fall is anchored in the grave's proportions and not in field
    // units. A feast pays 30.375 of size on the tip tick, so the mouth is twice
    // the size by the frame after, and the body has to be at the same place on
    // the bigger rim rather than in mid-hole.
    const fall = overTheRightRim();
    expect(fallAt(fall, 0, SIZE, BUILD_7_VIEW).x).toBeCloseTo(13.5, 6);
    expect(fallAt(fall, 0, SIZE * 2, BUILD_7_VIEW).x).toBeCloseTo(27, 6);
  });

  it("keeps a falling body's own size in field units while the grave grows", () => {
    // R5: the body does not grow because the grave grew; only the projection's
    // own shrink with depth changes it. At birth it is exactly its own size at
    // any grave size, and it only ever shrinks from there.
    const fall = overTheRightRim();
    for (const size of [SIZE, SIZE * 2]) {
      expect(fallAt(fall, 0, size, BUILD_7_VIEW).along).toBeCloseTo(1, 6);
      expect(fallAt(fall, 0, size, BUILD_7_VIEW).across).toBeCloseTo(1, 6);
      expect(fallAt(fall, 40, size, BUILD_7_VIEW).across).toBeLessThan(1);
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
      const drawn = fallAt(fall, age, SIZE, BUILD_7_VIEW);
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
      expect(fallAt(fall, age + 1, SIZE, BUILD_7_VIEW).across).toBeLessThan(
        fallAt(fall, age, SIZE, BUILD_7_VIEW).across,
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
      expect(fallAt(fall, age + 1, SIZE, BUILD_7_VIEW).x).toBeLessThan(
        fallAt(fall, age, SIZE, BUILD_7_VIEW).x,
      );
    }
    expect(fallAt(fall, FALL_TICKS, SIZE, BUILD_7_VIEW).x).toBeGreaterThan(0);
  });

  it("leaves a body at the dark depth as dark as the wall beside it, on the walls' own curve", () => {
    // R5: it darkens on the walls' own curve until the dark takes it. Worked by
    // hand: the tip leaves the body 0.1521 half-lengths down, gravity is
    // 2 * 2.4 / 0.75^2, so 22 ticks into the drop it is at 1.3165 half-lengths
    // and the curve gives 1 - (1.3165 / 2.4) ^ 2.6.
    const fall = overTheRightRim();
    expect(fallAt(fall, 40, SIZE, BUILD_7_VIEW).light).toBeCloseTo(0.79, 2);
    expect(fallAt(fall, 40, SIZE, BUILD_7_VIEW).light).toBeCloseTo(
      lightAtDepth(1.3165, BUILD_7_VIEW),
      3,
    );
    expect(fallAt(fall, FALL_TICKS, SIZE, BUILD_7_VIEW).light).toBe(
      lightAtDepth(BUILD_7_VIEW.darkDepth, BUILD_7_VIEW),
    );
  });

  it('keeps the way the food was swallowed with, so a body pulled in fast starts out faster than one that crept in', () => {
    // R5: it keeps its momentum, which is what makes a body arrive rather than
    // be placed. Both bodies go over the left rim; the pulled one carries two
    // half-lengths a second across the shaft with it, held a tick at a time.
    const crept: Fall = { ...overTheRightRim(), unitX: -0.5 };
    const pulled: Fall = { ...crept, unitVx: 2 / TICK_HZ };
    const age = TIP_TICKS + 5;
    expect(fallAt(pulled, age, SIZE, BUILD_7_VIEW).x).toBeGreaterThan(
      fallAt(crept, age, SIZE, BUILD_7_VIEW).x,
    );
  });

  it('folds a body longer than the opening to fit', () => {
    // R5: food longer than the opening folds in to fit. At the size floor the
    // opening is 18 field units from its middle to the far lip, so a body 40
    // units to its own end folds to 18 / 40 of itself and goes in.
    const floor = 18;
    const long: Fall = { ...overTheRightRim(), halfExtent: 40 };
    const atTheLip = fallAt(long, TIP_TICKS, floor, BUILD_7_VIEW);
    expect(atTheLip.across * long.halfExtent).toBeLessThanOrEqual(floor);
    // A body that fits is not folded at all: what is left on it at the end of
    // the tip is the projection's own shrink at 0.1521 half-lengths down.
    expect(
      fallAt(overTheRightRim(), TIP_TICKS, SIZE, BUILD_7_VIEW).across,
    ).toBeCloseTo(0.97, 2);
  });

  it('is over after the tip time and the drop time together, and lands never', () => {
    // R5: 0.30 s and 0.75 s at 60 Hz, which is the 63 ticks the transient
    // registry is told about. Nothing catches it: it is still shrinking on the
    // tick the dark has it, so there is no settle and no thud.
    expect(FALL_TICKS).toBe(63);
    const fall = overTheRightRim();
    expect(fallAt(fall, FALL_TICKS, SIZE, BUILD_7_VIEW).gone).toBe(true);
    expect(fallAt(fall, 0, SIZE, BUILD_7_VIEW).gone).toBe(false);
    expect(fallAt(fall, FALL_TICKS, SIZE, BUILD_7_VIEW).across).toBeLessThan(
      fallAt(fall, FALL_TICKS - 1, SIZE, BUILD_7_VIEW).across,
    );
  });
});

describe('the fall under the scene camera (tilted view T4)', () => {
  it('a falling body converges on the nadir of the view it is handed', () => {
    // T4: the fall is drawn through the view the walls were cut with, so it
    // goes down toward that view's nadir, sideways as well as along. Two views
    // that differ only in where the nadir lies draw the same body at the same
    // place at birth, and ever further apart as it falls, toward each nadir and
    // never past it.
    const height = 42.5;
    const toTheRight: GraveView = {
      ...BUILD_7_VIEW,
      cameraHeight: height,
      nadirX: 4,
      nadirY: 18,
    };
    const toTheLeft: GraveView = { ...toTheRight, nadirX: -4, nadirY: 10 };
    const fall = overTheRightRim();
    const apart = (age: number): { x: number; y: number } => {
      const right = fallAt(fall, age, SIZE, toTheRight);
      const left = fallAt(fall, age, SIZE, toTheLeft);
      return { x: right.x - left.x, y: right.y - left.y };
    };
    expect(Math.abs(apart(0).x)).toBeLessThanOrEqual(1e-9);
    expect(Math.abs(apart(0).y)).toBeLessThanOrEqual(1e-9);
    for (const age of ticksOfTheDrop()) {
      expect(apart(age + 1).x).toBeGreaterThan(apart(age).x);
      expect(apart(age + 1).y).toBeGreaterThan(apart(age).y);
    }
    expect(apart(FALL_TICKS).x).toBeLessThan(8 * SIZE);
    expect(apart(FALL_TICKS).y).toBeLessThan(8 * SIZE);
  });

  it('with the old view handed in, a fall draws exactly where it drew before', () => {
    // Every fall test above keeps its promise with build 7's view handed in, so
    // the move to a view argument changes nothing on its own. The figures are
    // the drawing slice 2's fall.ts gave for these two falls at these ages,
    // printed from that commit's own code. That code spent the way as
    // half-lengths a second; it is half-lengths a tick, so the same motion is
    // two and minus one a second, written a tick at a time.
    const pulled: Fall = {
      ...overTheRightRim(),
      unitX: -0.5,
      unitY: 0.3,
      unitVx: 2 / TICK_HZ,
      unitVy: -1 / TICK_HZ,
    };
    const before: readonly [Fall, number, readonly number[], boolean][] = [
      [
        overTheRightRim(),
        9,
        [
          10.564849492, 0.216691721, 3.0678999, 0.964175398, 0.992201332,
          0.999977843,
        ],
        false,
      ],
      [
        overTheRightRim(),
        30,
        [
          11.247968337, 3.278007472, 2.570310677, 0.306613474, 0.88471468,
          0.967164147,
        ],
        false,
      ],
      [
        overTheRightRim(),
        62,
        [7.314358124, 12.204614558, 2.706649939, 0.167187384, 0.577044366, 0],
        true,
      ],
      [
        pulled,
        18,
        [
          -12.346005745, 8.6699005, 0.45871582, 0.32414813, 0.970186412,
          0.999232501,
        ],
        false,
      ],
      [
        pulled,
        45,
        [
          1.61682663, 7.983683583, 0.659219402, 0.184750113, 0.739781598,
          0.565855865,
        ],
        false,
      ],
    ];
    for (const [fall, age, figures, gone] of before) {
      const drawn = fallAt(fall, age, SIZE, BUILD_7_VIEW);
      const now = [
        drawn.x,
        drawn.y,
        drawn.turn,
        drawn.along,
        drawn.across,
        drawn.light,
      ];
      now.forEach((value, at) => {
        expect(Math.abs(value - (figures[at] ?? NaN))).toBeLessThanOrEqual(
          1e-8,
        );
      });
      expect(drawn.gone).toBe(gone);
    }
  });
});

/**
 * The views the hole's own camera cuts on the shortest field and the tallest,
 * which are the same wherever the grave stands (tilted view T13).
 */
const holeViews = (): GraveView[] =>
  [SHORTEST_FIELD, fieldOfHeight(TALLEST_FIELD_HEIGHT)].map((field) =>
    holeViewOver(sceneFor(field).camera),
  );

/** Every age of a fall that still draws, from its birth to the dark. */
const visibleAges = (fall: Fall, view: GraveView): number[] =>
  Array.from({ length: FALL_TICKS }, (_, age) => age).filter(
    (age) => !fallAt(fall, age, SIZE, view).gone,
  );

describe("the fall eases toward the middle of the dark under the hole's own camera (decision 7, T13)", () => {
  it('a body falling from the rim stays inside the mouth until the dark takes it, wherever the grave stands on the screen', () => {
    // Mark's play report: under the scene camera, depth carried a falling body
    // 5% of the way to a nadir some 25 half-lengths down the screen, so by the
    // dark it had left the mouth and drew on the ground by the near lip, which
    // read as a corpse falling into the ground where the grave had been. A5
    // and R5 hold it in the grave's frame; decision 7 eases it toward the
    // middle of the dark. The hole's own camera (T13) has its nadir 2.308
    // half-lengths back, past the near lip too, so the path keeps build 7's
    // setback. The mouth runs 0.5 half-lengths across and 1 along.
    const bodies: Fall[] = [
      overTheRightRim(),
      { ...overTheRightRim(), unitX: 0, unitY: -1 },
      { ...overTheRightRim(), unitX: -0.5, unitY: 0.5 },
    ];
    for (const view of holeViews()) {
      for (const fall of bodies) {
        for (const age of visibleAges(fall, view)) {
          const drawn = fallAt(fall, age, SIZE, view);
          expect(Math.abs(drawn.x) / SIZE).toBeLessThanOrEqual(0.5 + 1e-9);
          expect(Math.abs(drawn.y) / SIZE).toBeLessThanOrEqual(1 + 1e-9);
        }
      }
    }
  });

  it("a grave anywhere on either field draws the fall build 7 drew, a third of the way to the middle of the dark by the dark depth, on the hole's own height", () => {
    // Decision 7's look is build 7's (main before the tilt): 4.95 half-lengths
    // up and 1.07 back, so by the dark depth 2.4 a body has come
    // 1 - 4.95 / 7.35, about a third, of the way to the middle of the dark.
    // T13 cuts the walls from that same height, so the fall and the walls
    // shrink alike with depth; the fall keeps build 7's setback straight back
    // toward the walls' nadir.
    for (const view of holeViews()) {
      expect(view.cameraHeight).toBe(BUILD_7_VIEW.cameraHeight);
      expect(view.nadirX).toBe(0);
    }
    const fall = overTheRightRim();
    for (const view of holeViews()) {
      for (let age = 0; age <= FALL_TICKS; age++) {
        const now = fallAt(fall, age, SIZE, view);
        const build7 = fallAt(fall, age, SIZE, BUILD_7_VIEW);
        expect(now.x).toBeCloseTo(build7.x, 6);
        expect(now.y).toBeCloseTo(build7.y, 6);
        expect(now.along).toBeCloseTo(build7.along, 6);
        expect(now.across).toBeCloseTo(build7.across, 6);
        expect(now.light).toBeCloseTo(build7.light, 6);
      }
    }
  });
});

describe("the fall's momentum (R5)", () => {
  it('a body that goes over the rim at the pull speed is carried across the middle of the hole before the dark takes it', () => {
    // R5: it keeps its momentum. The pull brings food to the rim at about 125
    // field units a second (R3, T5), which the rules hold as field units a tick
    // (pull.ts), and the swallow hands the fall that per-tick way. Spent
    // against 2.4 a second of drag over the 0.75 s drop, 125 a second carries
    // a body 125 * (1 - e^-1.8) / 2.4, about 43 field units: from the right rim
    // of a starting grave past the middle, so it ends left of the middle where
    // a still body ends right of it.
    const perTick = -(DEFAULT_TUNING.swallow.pullStrength / TICK_HZ) / SIZE;
    const still = overTheRightRim();
    const pulled: Fall = { ...still, unitVx: perTick };
    const last = FALL_TICKS - 1;
    expect(fallAt(still, last, SIZE, BUILD_7_VIEW).x).toBeGreaterThan(0);
    expect(fallAt(pulled, last, SIZE, BUILD_7_VIEW).x).toBeLessThan(0);
  });
});
