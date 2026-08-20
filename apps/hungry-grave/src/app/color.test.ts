/**
 * The colour maths, checked against the measured tables in
 * `docs/research/readability-value-band.md`. Every expected value here comes
 * from that document, never from running this code.
 */

import { describe, expect, it } from "vitest";

import { apcaLc, hsv, luma, observerLuma } from "./color";

describe("luma, Rec.709 on gamma-encoded sRGB (research 0.1)", () => {
  it("puts white at 100 and black at 0", () => {
    expect(luma(0xffffff)).toBeCloseTo(100, 10);
    expect(luma(0x000000)).toBeCloseTo(0, 10);
  });
  it("reproduces the research 5.1 measured table to two decimals", () => {
    // The sorted palette in research 5.1, sampled across its whole range.
    expect(luma(0x0e1119)).toBeCloseTo(6.64, 2);
    expect(luma(0xff4a3d)).toBeCloseTo(43.74, 2);
    expect(luma(0x59c964)).toBeCloseTo(66.63, 2);
    expect(luma(0xe9e4d2)).toBeCloseTo(89.32, 2);
    expect(luma(0xfff3c9)).toBeCloseTo(95.11, 2);
  });
});

describe("apcaLc, constant set 0.0.98G-4g (research 3.3)", () => {
  it("measures black on white at 106.0 and white on black at -107.9", () => {
    expect(apcaLc(0x000000, 0xffffff)).toBeCloseTo(106.0, 1);
    expect(apcaLc(0xffffff, 0x000000)).toBeCloseTo(-107.9, 1);
  });
  it("reproduces the research 3.3 fire-on-night table in magnitude and sign", () => {
    // Both are light on dark, so both come back negative (research 7.4).
    expect(apcaLc(0xff4a3d, 0x0e1119)).toBeCloseTo(-41.8, 1);
    expect(apcaLc(0xffece6, 0x0e1119)).toBeCloseTo(-97.4, 1);
  });
});

describe("observerLuma, the colour-vision estimate (research 5.3)", () => {
  it("agrees with luma on a neutral grey under all three observers", () => {
    // The two scales meet only on neutrals, which is why the band's thresholds
    // carry across and why the colour-vision check is a separation (7.4).
    for (const grey of [0x000000, 0x3c3c3c, 0x808080, 0xffffff]) {
      expect(observerLuma(grey, "normal")).toBeCloseTo(luma(grey), 6);
      expect(observerLuma(grey, "protan")).toBeCloseTo(luma(grey), 6);
      expect(observerLuma(grey, "deutan")).toBeCloseTo(luma(grey), 6);
    }
  });
  it("reproduces research 5.3 for fire's trash body, normal and protan", () => {
    // The four fire bodies are the palette's four largest movers, and this is
    // the largest of them: a protan shift of -11.6.
    expect(observerLuma(0xff4a3d, "normal")).toBeCloseTo(55.2, 1);
    expect(observerLuma(0xff4a3d, "protan")).toBeCloseTo(43.6, 1);
  });
});

describe("hsv (research 1.5)", () => {
  it("reproduces research 1.5's measurement of the retired dropCore", () => {
    // Dark, saturated orange is the definition of brown, and this is the hex
    // the brown ban retired.
    const measured = hsv(0x4a3b12);
    expect(measured.h).toBeCloseTo(43.9, 1);
    expect(measured.s).toBeCloseTo(0.76, 2);
    expect(measured.v).toBeCloseTo(0.29, 2);
  });
});
