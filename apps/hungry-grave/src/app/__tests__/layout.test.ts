/**
 * One fitted mapping of the fixed field into any viewport (ADRs 0003 and 0009).
 * Every expected number here is computed in the test from the viewport it is
 * given, never read back out of the implementation.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resize } from '../../engine/resize/resize';
import {
  FIELD_WIDTH,
  fieldOfHeight,
  SHORTEST_FIELD,
  SHORTEST_FIELD_HEIGHT,
} from '../../game/field';
import type { FieldPlacement, ReadoutReserve } from '../layout';
import {
  DEGENERATE_PLACEMENT,
  fieldHeightForBox,
  fitField,
  HUD_BAND,
  hudRow,
  READOUT_RESERVE,
  screenToColumn,
} from '../layout';

beforeEach(() => {
  vi.resetModules();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

/**
 * The desktop window that sits inside the band the first fold's branch rule
 * missed: the vertical offset is already zero and the side gutter is narrower
 * than the readout stack, so a rule that refitted only tall viewports would
 * leave a readout over an ordinary desktop field with no refit available.
 */
const NARROW_DESKTOP = { width: 1024, height: 900 };

/** The tablet in portrait, where the viewport aspect approaches the field's own. */
const TABLET_PORTRAIT = { width: 820, height: 1180 };

/** No reserve at all, for the two tests that are about the mapping itself. */
const NO_RESERVE: ReadoutReserve = { margin: 0, width: 0, height: 0 };

/**
 * Every window height a 390-wide phone reports, from a fully collapsed URL
 * bar down to a window barely taller than it is wide. The bug Mark played
 * lived inside this sweep and no single viewport could see it: the field is
 * the full stage width while the window is tall, and pays width for the
 * reserve as the URL bar eats the height.
 */
const PHONE_SWEEP = Array.from({ length: 51 }, (_, index) => 400 + index * 10);

/** The rectangle the placement puts the field's frame in, in viewport units. */
function fittedRect(placement: FieldPlacement) {
  return {
    left: placement.offsetX,
    top: placement.offsetY,
    width: FIELD_WIDTH * placement.scale,
    height: SHORTEST_FIELD_HEIGHT * placement.scale,
  };
}

/** Whole and uncropped: the frame sits inside the viewport on both axes. */
function expectWholeFieldInside(
  placement: FieldPlacement,
  viewportWidth: number,
  viewportHeight: number,
) {
  const rect = fittedRect(placement);
  expect(rect.left).toBeGreaterThanOrEqual(0);
  expect(rect.top).toBeGreaterThanOrEqual(0);
  expect(rect.left + rect.width).toBeLessThanOrEqual(viewportWidth + 1e-9);
  expect(rect.top + rect.height).toBeLessThanOrEqual(viewportHeight + 1e-9);
  expect(rect.width / rect.height).toBeCloseTo(
    FIELD_WIDTH / SHORTEST_FIELD_HEIGHT,
    10,
  );
}

describe("the field's unit space (ADR 0003)", () => {
  it('is 540 by 760 and is not a tuning knob', () => {
    expect(FIELD_WIDTH).toBe(540);
    expect(SHORTEST_FIELD_HEIGHT).toBe(760);
  });
});

describe('fitField', () => {
  it('presents the whole field on a 1440 by 900 desktop viewport', () => {
    const placement = fitField(DESKTOP.width, DESKTOP.height, SHORTEST_FIELD);
    // The desktop viewport is wide, so height is the binding axis.
    expect(placement.scale).toBeCloseTo(
      DESKTOP.height / SHORTEST_FIELD_HEIGHT,
      10,
    );
    expectWholeFieldInside(placement, DESKTOP.width, DESKTOP.height);
  });

  it('presents the whole field on a 390 by 844 phone viewport', () => {
    const placement = fitField(PHONE.width, PHONE.height, SHORTEST_FIELD);
    // The phone viewport is narrow, so width is the binding axis.
    expect(placement.scale).toBeCloseTo(PHONE.width / FIELD_WIDTH, 10);
    expectWholeFieldInside(placement, PHONE.width, PHONE.height);
  });

  it("presents the whole field through the engine's own resize, which is what the app actually computes", () => {
    // CreationResizePlugin upscales a narrow window to a 540-wide stage before
    // GameScreen.resize ever runs, so fitField never sees the phone's own
    // numbers in the running app. The two tests above are blind to that.
    for (const viewport of [DESKTOP, PHONE]) {
      const stage = resize(
        viewport.width,
        viewport.height,
        FIELD_WIDTH,
        SHORTEST_FIELD_HEIGHT,
        false,
      );
      expectWholeFieldInside(
        fitField(stage.width, stage.height, SHORTEST_FIELD),
        stage.width,
        stage.height,
      );
    }
  });

  it('centres the field, with equal non-negative margins on both axes', () => {
    // Neither of these viewports refits, so the landed centring rule is
    // untouched by the reserve.
    for (const viewport of [DESKTOP, PHONE]) {
      const rect = fittedRect(
        fitField(viewport.width, viewport.height, SHORTEST_FIELD),
      );
      const right = viewport.width - (rect.left + rect.width);
      const bottom = viewport.height - (rect.top + rect.height);
      expect(rect.left).toBeCloseTo(right, 10);
      expect(rect.top).toBeCloseTo(bottom, 10);
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.top).toBeGreaterThanOrEqual(0);
    }
  });

  it("is scale 1 with no offset at exactly the field's own size, with nothing reserved", () => {
    // The mapping's own identity case. With the readout reserve in play the
    // field is refitted here instead, because at exactly the field's own size
    // the corners the readouts live in are over the field, and the test below
    // is the one that holds that.
    expect(
      fitField(FIELD_WIDTH, SHORTEST_FIELD_HEIGHT, SHORTEST_FIELD, NO_RESERVE),
    ).toEqual({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });

  it('a degenerate viewport is not silent', async () => {
    // A fresh module per test: the fallback reports once per session, so a
    // stale flag would make a green test green for the wrong reason.
    const layout = await import('../layout');

    expect(layout.fitField(0, Number.NaN, SHORTEST_FIELD)).toEqual(
      layout.DEGENERATE_PLACEMENT,
    );

    const said = vi
      .mocked(console.warn)
      .mock.calls.map((call) => call.join(' '));
    expect(said).toHaveLength(1);
    // What happened, and what it costs.
    expect(said[0]).toContain('NaN');
    expect(said[0]).toContain('0');
    expect(said[0]).toContain('unscaled');
  });

  it('the fallback reports once, not once per resize', async () => {
    const layout = await import('../layout');

    for (let resizes = 0; resizes < 200; resizes += 1)
      layout.fitField(0, 0, SHORTEST_FIELD);

    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('falls back to a stated placement on a degenerate viewport', () => {
    // A browser reports one of these during boot and during an orientation
    // change, and a NaN scale poisons every coordinate downstream. The fallback
    // is pinned by value, not by being finite and positive, so the choice is
    // reviewable. src/engine/resize/resize.ts itself produces NaN at a zero
    // viewport, through Math.floor(0 * Infinity).
    expect(DEGENERATE_PLACEMENT).toEqual({ scale: 1, offsetX: 0, offsetY: 0 });
    expect(fitField(0, 0, SHORTEST_FIELD)).toEqual(DEGENERATE_PLACEMENT);
    expect(fitField(-1440, -900, SHORTEST_FIELD)).toEqual(DEGENERATE_PLACEMENT);
    expect(fitField(Number.NaN, Number.NaN, SHORTEST_FIELD)).toEqual(
      DEGENERATE_PLACEMENT,
    );
    expect(fitField(1440, Number.NaN, SHORTEST_FIELD)).toEqual(
      DEGENERATE_PLACEMENT,
    );
    expect(fitField(Number.POSITIVE_INFINITY, 900, SHORTEST_FIELD)).toEqual(
      DEGENERATE_PLACEMENT,
    );
  });
});

describe('screenToColumn', () => {
  it("inverts the placement at the field's corners and its centre", () => {
    const placement = fitField(DESKTOP.width, DESKTOP.height, SHORTEST_FIELD);
    const corners = [
      { x: 0, y: 0 },
      { x: FIELD_WIDTH, y: 0 },
      { x: 0, y: SHORTEST_FIELD_HEIGHT },
      { x: FIELD_WIDTH, y: SHORTEST_FIELD_HEIGHT },
      { x: FIELD_WIDTH / 2, y: SHORTEST_FIELD_HEIGHT / 2 },
    ];
    for (const point of corners) {
      const onScreen = {
        x: point.x * placement.scale + placement.offsetX,
        y: point.y * placement.scale + placement.offsetY,
      };
      const back = screenToColumn(placement, onScreen.x, onScreen.y);
      expect(back.x).toBeCloseTo(point.x, 9);
      expect(back.y).toBeCloseTo(point.y, 9);
    }
  });

  it("maps a point outside the fitted field outside the field's bounds", () => {
    // It does not clamp. What a touch outside the field means belongs to the
    // input models, not to the mapping.
    const desktop = fitField(DESKTOP.width, DESKTOP.height, SHORTEST_FIELD);
    expect(screenToColumn(desktop, 0, DESKTOP.height / 2).x).toBeLessThan(0);
    expect(
      screenToColumn(desktop, DESKTOP.width, DESKTOP.height / 2).x,
    ).toBeGreaterThan(FIELD_WIDTH);

    const phone = fitField(PHONE.width, PHONE.height, SHORTEST_FIELD);
    expect(screenToColumn(phone, PHONE.width / 2, 0).y).toBeLessThan(0);
    expect(
      screenToColumn(phone, PHONE.width / 2, PHONE.height).y,
    ).toBeGreaterThan(SHORTEST_FIELD_HEIGHT);
  });
});

/** The rectangle the placement puts the field in, in viewport units. */
function fieldRect(placement: FieldPlacement) {
  const rect = fittedRect(placement);
  return {
    left: rect.left,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
  };
}

/** The two corners the readouts live in, from the reserve GameScreen positions them by. */
function readoutRects(viewportWidth: number, reserve: ReadoutReserve) {
  return [
    { left: 0, top: 0, right: reserve.width, bottom: reserve.height },
    {
      left: viewportWidth - reserve.width,
      top: 0,
      right: viewportWidth,
      bottom: reserve.height,
    },
  ];
}

/** Half-open on both axes, so two rectangles sharing exactly an edge do not intersect. */
function overlapping(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
): boolean {
  return (
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
  );
}

/**
 * What the running app actually computes. CreationResizePlugin upscales a
 * narrow window to a 540-wide stage before GameScreen.resize ever runs, so a
 * phone claim tested against a raw 390 is structurally blind.
 */
function staged(viewport: { width: number; height: number }) {
  const stage = resize(
    viewport.width,
    viewport.height,
    FIELD_WIDTH,
    SHORTEST_FIELD_HEIGHT,
    false,
  );
  return {
    stage,
    placement: fitField(stage.width, stage.height, SHORTEST_FIELD),
  };
}

describe('the reserved gutter (dispatch 4 section 4.16)', () => {
  const VIEWPORTS = [
    { name: 'desktop', viewport: DESKTOP },
    { name: 'narrow desktop', viewport: NARROW_DESKTOP },
    { name: 'tablet portrait', viewport: TABLET_PORTRAIT },
    { name: 'phone', viewport: PHONE },
    { name: "the field's own size", viewport: { width: 540, height: 760 } },
  ];

  it('never pays field width for a readout, at any viewport', () => {
    // Mark's ruling, 2026-08-22. The reserve may move the field and may never
    // shrink it, so this compares against the same fit with nothing reserved.
    for (const { name, viewport } of VIEWPORTS) {
      const { stage, placement } = staged(viewport);
      const natural = fitField(
        stage.width,
        stage.height,
        SHORTEST_FIELD,
        NO_RESERVE,
      );
      expect(`${name} ${placement.scale}`).toBe(`${name} ${natural.scale}`);
    }
  });

  it("holds the phone's field at its full width at every window height", () => {
    // The regression test for the played bug. It composes resize() because
    // CreationResizePlugin upscales the window before GameScreen.resize runs,
    // so a claim tested against a raw 390 is structurally blind.
    for (const height of PHONE_SWEEP) {
      const { stage, placement } = staged({ width: PHONE.width, height });
      const natural = fitField(
        stage.width,
        stage.height,
        SHORTEST_FIELD,
        NO_RESERVE,
      );
      expect(`${height} ${placement.scale}`).toBe(`${height} ${natural.scale}`);
      expectWholeFieldInside(placement, stage.width, stage.height);
    }
  });

  it('lifts the readouts clear of the field wherever that costs the field nothing', () => {
    // A phone window tall enough that the field's own vertical slack pays for
    // the reserve. The field keeps every unit of its width and moves down.
    const { stage, placement } = staged({ width: PHONE.width, height: 700 });
    const natural = fitField(
      stage.width,
      stage.height,
      SHORTEST_FIELD,
      NO_RESERVE,
    );
    expect(placement.scale).toBe(natural.scale);
    expect(placement.offsetY).toBeGreaterThan(natural.offsetY);
    expect(placement.offsetY).toBeGreaterThanOrEqual(READOUT_RESERVE.height);
    for (const readout of readoutRects(stage.width, READOUT_RESERVE)) {
      expect(overlapping(fieldRect(placement), readout)).toBe(false);
    }
  });

  it('lets the readouts sit over the field once clearing them would cost width', () => {
    // The other side of the same rule, and the case Mark ruled on. The corner
    // readouts are dev-only and come out before v1, and the pause button is a
    // solid shape a mob can pass behind for a moment.
    const { stage, placement } = staged({ width: PHONE.width, height: 620 });
    const natural = fitField(
      stage.width,
      stage.height,
      SHORTEST_FIELD,
      NO_RESERVE,
    );
    expect(placement).toEqual(natural);
    const covered = readoutRects(stage.width, READOUT_RESERVE).filter(
      (readout) => overlapping(fieldRect(placement), readout),
    );
    expect(covered.length).toBeGreaterThan(0);
  });

  it('leaves a 1440 by 900 desktop exactly where it was, because its gutter already holds the stack', () => {
    const { stage, placement } = staged(DESKTOP);
    expect(placement).toEqual(
      fitField(stage.width, stage.height, SHORTEST_FIELD, NO_RESERVE),
    );
    expect(placement.offsetY).toBeCloseTo(0, 9);
    expect(placement.offsetX).toBeGreaterThan(READOUT_RESERVE.width);
  });

  it('stops refitting a 1024 by 900 desktop, which used to buy its gutter with field width', () => {
    // This viewport refitted until 2026-08-22 and no longer does: the field
    // fills the window's height there, so lowering it below the reserve is
    // only ever paid for in width. Same ruling as the phone, same reason.
    const { stage, placement } = staged(NARROW_DESKTOP);
    const natural = fitField(
      stage.width,
      stage.height,
      SHORTEST_FIELD,
      NO_RESERVE,
    );
    expect(placement).toEqual(natural);
    expect(natural.offsetX).toBeLessThan(READOUT_RESERVE.width);
  });

  it('stops refitting an 820 by 1180 tablet in portrait, for the same reason', () => {
    const { stage, placement } = staged(TABLET_PORTRAIT);
    const natural = fitField(
      stage.width,
      stage.height,
      SHORTEST_FIELD,
      NO_RESERVE,
    );
    expect(placement).toEqual(natural);
    expect(natural.offsetY).toBeLessThan(READOUT_RESERVE.height);
  });
});

describe("the HUD's band (record R1)", () => {
  /**
   * Every viewport the reserved-gutter sweep already covers, plus the phone's
   * standing small-viewport case, so a claim made about "every viewport" is
   * made against the shapes the frame is actually specified against.
   */
  const BAND_VIEWPORTS = [
    { name: 'desktop', viewport: DESKTOP },
    { name: 'narrow desktop', viewport: NARROW_DESKTOP },
    { name: 'tablet portrait', viewport: TABLET_PORTRAIT },
    { name: 'phone', viewport: PHONE },
    { name: 'phone at svh 660', viewport: { width: 393, height: 660 } },
    { name: "the field's own size", viewport: { width: 540, height: 760 } },
  ];

  /** How many CSS pixels one stage unit is worth at a viewport. */
  function cssPerStageUnit(viewport: {
    width: number;
    height: number;
  }): number {
    return viewport.width / staged(viewport).stage.width;
  }

  it("sits at the field's top edge at every viewport, and is never clipped", () => {
    // Outside the field where the stage's band above it is at least the row's
    // own height, and over the field's own top edge where it is not. One rule
    // and no viewport breakpoint, because a phone leaves no side gutter at all
    // and a desktop leaves no band at all, both measured exactly zero, so the
    // field's own rectangle is the only home both shapes share.
    const heights = [
      ...BAND_VIEWPORTS.map((each) => each.viewport),
      ...PHONE_SWEEP.map((height) => ({ width: PHONE.width, height })),
    ];
    for (const viewport of heights) {
      const { stage, placement } = staged(viewport);
      const row = hudRow(placement);
      const fieldTop = placement.offsetY;
      const where = `${viewport.width}x${viewport.height}`;

      expect(`${where} ${row.height}`).toBe(
        `${where} ${HUD_BAND.height * placement.scale}`,
      );
      expect(`${where} ${row.top}`).toBe(
        `${where} ${fieldTop >= row.height ? fieldTop - row.height : fieldTop}`,
      );
      // Never clipped: the row is inside the stage on both axes, and it never
      // sits below the field's own top edge by more than its own height.
      expect(`${where} top ${row.top >= 0}`).toBe(`${where} top true`);
      expect(
        `${where} bottom ${row.top + row.height <= stage.height + 1e-9}`,
      ).toBe(`${where} bottom true`);
      expect(`${where} left ${row.left}`).toBe(
        `${where} left ${placement.offsetX}`,
      );
      expect(`${where} width ${row.width}`).toBe(
        `${where} width ${FIELD_WIDTH * placement.scale}`,
      );
    }
  });

  it('gives one mark the same share of the field at a phone and at a desktop', () => {
    // The row is drawn in field units and scaled by the placement, which is
    // what makes the same glance work on both. A row positioned in raw stage
    // units would give the phone the smaller mark, which is the wrong way
    // round.
    const shares = [PHONE, DESKTOP, TABLET_PORTRAIT].map((viewport) => {
      const { placement } = staged(viewport);
      const mark = HUD_BAND.mark * placement.scale;
      return mark / (FIELD_WIDTH * placement.scale);
    });
    expect(new Set(shares).size).toBe(1);
    expect(shares[0]).toBeCloseTo(HUD_BAND.mark / FIELD_WIDTH, 12);
  });

  it('draws a mark of at least 6.25 CSS pixels at the narrowest viewport in the sweep', () => {
    // The floor is slice K's own measured band, the narrowest filled band it
    // proved legible in grayscale, and R1's whole derivation rests on it: the
    // band is declared from the mark rather than the mark left to fall out of
    // the band.
    const narrowest = [
      PHONE,
      { width: 393, height: 660 },
      TABLET_PORTRAIT,
      DESKTOP,
    ]
      .map((viewport) => {
        const { placement } = staged(viewport);
        return HUD_BAND.mark * placement.scale * cssPerStageUnit(viewport);
      })
      .reduce((smallest, each) => Math.min(smallest, each));
    expect(`${narrowest >= 6.25}`).toBe('true');
  });
});

describe('the even slack split (record R10)', () => {
  it("splits a shortened window's slack above and below the field", () => {
    // The lowering branch used to centre the field inside the box below the
    // reserve, so the reserve's whole height landed on top and the bottom band
    // took whatever was left. Centring in the whole box and pushing the field
    // down only far enough to clear the reserve shares the slack instead.
    for (const height of PHONE_SWEEP) {
      const { stage, placement } = staged({ width: PHONE.width, height });
      const natural = fitField(
        stage.width,
        stage.height,
        SHORTEST_FIELD,
        NO_RESERVE,
      );
      const expected = Math.max(natural.offsetY, READOUT_RESERVE.height);
      // Only where lowering is free at all: a field that already fills the
      // height stays exactly where the natural fit put it.
      const free =
        stage.height - SHORTEST_FIELD_HEIGHT * natural.scale >=
        READOUT_RESERVE.height;
      expect(`${height} ${placement.offsetY}`).toBe(
        `${height} ${free ? expected : natural.offsetY}`,
      );
    }
  });

  it('leaves 120 above the field and 26 below at a phone at svh 660', () => {
    // The record's own figures for this viewport (R10), against the 133 and 13
    // the below-reserve centring gave. They are the independent source of
    // truth here: the arithmetic is the record's and not this file's.
    const { stage, placement } = staged({ width: 393, height: 660 });
    const above = placement.offsetY;
    const below =
      stage.height -
      (placement.offsetY + SHORTEST_FIELD_HEIGHT * placement.scale);
    expect(`${Math.round(above)} ${Math.round(below)}`).toBe('120 26');
  });

  it('never shrinks the field to split the slack, at any window height', () => {
    // Mark's ruling of 2026-08-22 still binds: the reserve may move the field
    // and may never shrink it. The even split moves it less than the old
    // lowering did, so it cannot reach for width that the old rule did not.
    for (const height of PHONE_SWEEP) {
      const { stage, placement } = staged({ width: PHONE.width, height });
      const natural = fitField(
        stage.width,
        stage.height,
        SHORTEST_FIELD,
        NO_RESERVE,
      );
      expect(`${height} ${placement.scale}`).toBe(`${height} ${natural.scale}`);
      expectWholeFieldInside(placement, stage.width, stage.height);
    }
  });
});

describe("the run's shape, read off its stage (tilted view T12, A30, A35)", () => {
  it('a portrait stage asks for a field as tall as its shape, in whole units', () => {
    // A30: 540 across, as tall as round(540 * height / width). The stages are
    // show-what-you-have.md section 3.1's measured phones: an iPhone 15 at a
    // small viewport of 660, a Pixel 8, the iPhone with its chrome retracted
    // and a 320-wide phone, then A30's own portrait tablet.
    expect(fieldHeightForBox(540, 906)).toBe(906);
    expect(fieldHeightForBox(540, 983)).toBe(983);
    expect(fieldHeightForBox(540, 1170)).toBe(1170);
    expect(fieldHeightForBox(540, 776)).toBe(776);
    expect(fieldHeightForBox(820, 1180)).toBe(777);
  });
  it('a stage squatter than the shortest field asks for 760, and one taller than the tallest asks for 1260', () => {
    // A30: outside the range a stage gets the nearest shape with bars. A
    // desktop, a squat phone window and a square window play 760; a window
    // taller than 21:9 plays 1260.
    expect(fieldHeightForBox(1440, 900)).toBe(760);
    expect(fieldHeightForBox(540, 700)).toBe(760);
    expect(fieldHeightForBox(900, 900)).toBe(760);
    expect(fieldHeightForBox(540, 1700)).toBe(1260);
  });
  it('an unmeasurable stage asks for 760 and says so once', async () => {
    // A30 and repair by origin: the stage is a live input, so a box the
    // browser reports as zero, negative or not finite (boot, an orientation
    // change) is repaired to the shortest field, and the repair is said once.
    // A fresh module, so the once-per-session flag is this test's own.
    const layout = await import('../layout');

    const unmeasurable: readonly [number, number][] = [
      [0, 900],
      [540, 0],
      [-390, 844],
      [Number.NaN, 844],
      [540, Number.POSITIVE_INFINITY],
    ];
    for (const [width, height] of unmeasurable) {
      expect(layout.fieldHeightForBox(width, height)).toBe(760);
    }

    const said = vi
      .mocked(console.warn)
      .mock.calls.map((call) => call.join(' '));
    expect(said).toHaveLength(1);
    // What was measured, and what the run plays instead.
    expect(said[0]).toContain('0 by 900');
    expect(said[0]).toContain('760');
  });
  it("fits the run's own field: no bar in a stage of its own shape, bars at the sides in a wide one, bars above and below in a tall one", () => {
    // T12 and A35: the field keeps its shape and the stage's background fills
    // what it does not cover. Under the readout reserve the app fits with, as
    // GameScreen does.
    const tall = fieldOfHeight(1168);

    // A 390 by 844 phone's stage, the field's own shape: nothing is a bar.
    expect(fitField(540, 1168, tall, READOUT_RESERVE)).toEqual({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });

    // A desktop: the height binds, at 900 / 1168, and the bars are the sides,
    // (1440 - 540 * 900 / 1168) / 2 = 511.952055 each.
    const desktop = fitField(1440, 900, tall, READOUT_RESERVE);
    expect(desktop.scale).toBeCloseTo(0.7705479, 6);
    expect(desktop.offsetY).toBeCloseTo(0, 9);
    expect(desktop.offsetX).toBeCloseTo(511.952055, 5);

    // A desktop's shortest field on the tall stage: the width binds, and the
    // bars are above and below, (1168 - 760) / 2 = 204 each.
    expect(fitField(540, 1168, SHORTEST_FIELD, READOUT_RESERVE)).toEqual({
      scale: 1,
      offsetX: 0,
      offsetY: 204,
    });
  });
});
