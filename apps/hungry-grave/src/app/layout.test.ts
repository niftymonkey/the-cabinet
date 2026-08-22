/**
 * One fitted mapping of the fixed field into any viewport (ADRs 0003 and 0009).
 * Every expected number here is computed in the test from the viewport it is
 * given, never read back out of the implementation.
 */

import { describe, expect, it } from "vitest";

import { resize } from "../engine/resize/resize";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../game/field";
import type { FieldPlacement, ReadoutReserve } from "./layout";
import {
  DEGENERATE_PLACEMENT,
  fitField,
  READOUT_RESERVE,
  screenToField,
} from "./layout";

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

/** The rectangle the placement puts the field's frame in, in viewport units. */
function fittedRect(placement: FieldPlacement) {
  return {
    left: placement.offsetX,
    top: placement.offsetY,
    width: FIELD_WIDTH * placement.scale,
    height: FIELD_HEIGHT * placement.scale,
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
  expect(rect.width / rect.height).toBeCloseTo(FIELD_WIDTH / FIELD_HEIGHT, 10);
}

describe("the field's unit space (ADR 0003)", () => {
  it("is 540 by 760 and is not a tuning knob", () => {
    expect(FIELD_WIDTH).toBe(540);
    expect(FIELD_HEIGHT).toBe(760);
  });
});

describe("fitField", () => {
  it("presents the whole field on a 1440 by 900 desktop viewport", () => {
    const placement = fitField(DESKTOP.width, DESKTOP.height);
    // The desktop viewport is wide, so height is the binding axis.
    expect(placement.scale).toBeCloseTo(DESKTOP.height / FIELD_HEIGHT, 10);
    expectWholeFieldInside(placement, DESKTOP.width, DESKTOP.height);
  });

  it("presents the whole field on a 390 by 844 phone viewport", () => {
    const placement = fitField(PHONE.width, PHONE.height);
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
        FIELD_HEIGHT,
        false,
      );
      expectWholeFieldInside(
        fitField(stage.width, stage.height),
        stage.width,
        stage.height,
      );
    }
  });

  it("centres the field, with equal non-negative margins on both axes", () => {
    // Neither of these viewports refits, so the landed centring rule is
    // untouched by the reserve.
    for (const viewport of [DESKTOP, PHONE]) {
      const rect = fittedRect(fitField(viewport.width, viewport.height));
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
    expect(fitField(FIELD_WIDTH, FIELD_HEIGHT, NO_RESERVE)).toEqual({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });

  it("falls back to a stated placement on a degenerate viewport", () => {
    // A browser reports one of these during boot and during an orientation
    // change, and a NaN scale poisons every coordinate downstream. The fallback
    // is pinned by value, not by being finite and positive, so the choice is
    // reviewable. src/engine/resize/resize.ts itself produces NaN at a zero
    // viewport, through Math.floor(0 * Infinity).
    expect(DEGENERATE_PLACEMENT).toEqual({ scale: 1, offsetX: 0, offsetY: 0 });
    expect(fitField(0, 0)).toEqual(DEGENERATE_PLACEMENT);
    expect(fitField(-1440, -900)).toEqual(DEGENERATE_PLACEMENT);
    expect(fitField(Number.NaN, Number.NaN)).toEqual(DEGENERATE_PLACEMENT);
    expect(fitField(1440, Number.NaN)).toEqual(DEGENERATE_PLACEMENT);
    expect(fitField(Number.POSITIVE_INFINITY, 900)).toEqual(
      DEGENERATE_PLACEMENT,
    );
  });
});

describe("screenToField", () => {
  it("inverts the placement at the field's corners and its centre", () => {
    const placement = fitField(DESKTOP.width, DESKTOP.height);
    const corners = [
      { x: 0, y: 0 },
      { x: FIELD_WIDTH, y: 0 },
      { x: 0, y: FIELD_HEIGHT },
      { x: FIELD_WIDTH, y: FIELD_HEIGHT },
      { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2 },
    ];
    for (const point of corners) {
      const onScreen = {
        x: point.x * placement.scale + placement.offsetX,
        y: point.y * placement.scale + placement.offsetY,
      };
      const back = screenToField(placement, onScreen.x, onScreen.y);
      expect(back.x).toBeCloseTo(point.x, 9);
      expect(back.y).toBeCloseTo(point.y, 9);
    }
  });

  it("maps a point outside the fitted field outside the field's bounds", () => {
    // It does not clamp. What a touch outside the field means belongs to the
    // input models, not to the mapping.
    const desktop = fitField(DESKTOP.width, DESKTOP.height);
    expect(screenToField(desktop, 0, DESKTOP.height / 2).x).toBeLessThan(0);
    expect(
      screenToField(desktop, DESKTOP.width, DESKTOP.height / 2).x,
    ).toBeGreaterThan(FIELD_WIDTH);

    const phone = fitField(PHONE.width, PHONE.height);
    expect(screenToField(phone, PHONE.width / 2, 0).y).toBeLessThan(0);
    expect(
      screenToField(phone, PHONE.width / 2, PHONE.height).y,
    ).toBeGreaterThan(FIELD_HEIGHT);
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
    FIELD_HEIGHT,
    false,
  );
  return { stage, placement: fitField(stage.width, stage.height) };
}

describe("the reserved gutter (dispatch 4 section 4.16)", () => {
  const VIEWPORTS = [
    { name: "desktop", viewport: DESKTOP },
    { name: "narrow desktop", viewport: NARROW_DESKTOP },
    { name: "tablet portrait", viewport: TABLET_PORTRAIT },
    { name: "phone", viewport: PHONE },
    { name: "the field's own size", viewport: { width: 540, height: 760 } },
  ];

  it("keeps the readout stack and the pause button clear of the field on every viewport", () => {
    // This is the invariant. The two tests below are the two cases it resolves
    // into, and neither of them is the rule.
    for (const { name, viewport } of VIEWPORTS) {
      const { stage, placement } = staged(viewport);
      const field = fieldRect(placement);
      for (const readout of readoutRects(stage.width, READOUT_RESERVE)) {
        expect(`${name} ${overlapping(field, readout)}`).toBe(`${name} false`);
      }
      expectWholeFieldInside(placement, stage.width, stage.height);
    }
  });

  it("leaves a 1440 by 900 desktop exactly where it was, because its gutter already holds the stack", () => {
    const { stage, placement } = staged(DESKTOP);
    expect(placement).toEqual(fitField(stage.width, stage.height, NO_RESERVE));
    expect(placement.offsetY).toBeCloseTo(0, 9);
    expect(placement.offsetX).toBeGreaterThan(READOUT_RESERVE.width);
  });

  it("refits a 1024 by 900 desktop, which no wide-versus-tall rule would have caught", () => {
    const { stage, placement } = staged(NARROW_DESKTOP);
    const natural = fitField(stage.width, stage.height, NO_RESERVE);
    expect(natural.offsetY).toBeCloseTo(0, 9);
    expect(natural.offsetX).toBeLessThan(READOUT_RESERVE.width);
    expect(placement.scale).toBeLessThan(natural.scale);
    expect(placement.offsetY).toBeGreaterThanOrEqual(READOUT_RESERVE.height);
  });

  it("refits an 820 by 1180 tablet in portrait, where the aspect approaches the field's own", () => {
    const { stage, placement } = staged(TABLET_PORTRAIT);
    const natural = fitField(stage.width, stage.height, NO_RESERVE);
    expect(natural.offsetY).toBeLessThan(READOUT_RESERVE.height);
    expect(placement.scale).toBeLessThan(natural.scale);
    expect(placement.offsetY).toBeGreaterThanOrEqual(READOUT_RESERVE.height);
  });
});
