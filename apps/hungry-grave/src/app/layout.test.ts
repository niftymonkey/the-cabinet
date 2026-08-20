/**
 * One fitted mapping of the fixed field into any viewport (ADRs 0003 and 0009).
 * Every expected number here is computed in the test from the viewport it is
 * given, never read back out of the implementation.
 */

import { describe, expect, it } from "vitest";

import { resize } from "../engine/resize/resize";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../game/field";
import type { FieldPlacement } from "./layout";
import { DEGENERATE_PLACEMENT, fitField, screenToField } from "./layout";

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

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

  it("is scale 1 with no offset at exactly the field's own size", () => {
    expect(fitField(FIELD_WIDTH, FIELD_HEIGHT)).toEqual({
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
