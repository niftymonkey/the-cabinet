/**
 * Colour arithmetic, and nothing else. Pure functions over sRGB hex integers:
 * no pixi, no palette data, no imports at all. Everything here is the metric
 * `docs/research/readability-value-band.md` pins, so the declared-colour test
 * and the grayscale screenshot check cannot disagree about what they measure.
 */

export type Observer = 'normal' | 'protan' | 'deutan';

/** Rec.709 luminance weights, red then green then blue (research 0.1). */
const REC709 = [0.2126, 0.7152, 0.0722] as const;

/** The raw sRGB bytes of a hex colour, red then green then blue. */
function channels(hex: number): [number, number, number] {
  return [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
}

export interface Hsv {
  readonly h: number;
  readonly s: number;
  readonly v: number;
}

/** Rec.709 luma on gamma-encoded sRGB, 0 to 100. Channels are raw sRGB bytes and are NOT linearized. */
export function luma(hex: number): number {
  const [r, g, b] = channels(hex);
  return ((REC709[0] * r + REC709[1] * g + REC709[2] * b) / 255) * 100;
}

/**
 * APCA constant set 0.0.98G-4g, Beta 0.1.9 W3, copied from apca-w3's
 * src/apca-w3.js as research 3.3 lists it. A constant set is a unit: a number
 * built from two of them matches neither.
 */
const MAIN_TRC = 2.4;
const APCA_WEIGHTS = [0.2126729, 0.7151522, 0.072175] as const;
const NORM_BG = 0.56;
const NORM_TXT = 0.57;
const REV_TXT = 0.62;
const REV_BG = 0.65;
const BLK_THRS = 0.022;
const BLK_CLMP = 1.414;
const SCALE_BOW = 1.14;
const SCALE_WOB = 1.14;
const LO_BOW_OFFSET = 0.027;
const LO_WOB_OFFSET = 0.027;
const DELTA_Y_MIN = 0.0005;
const LO_CLIP = 0.1;

/**
 * Screen luminance under APCA's own transfer curve. Unlike WCAG's there is no
 * linear segment near black: the channel goes straight to the power of 2.4,
 * which is why the two models disagree so sharply on a near-black field.
 */
function apcaLuminance(hex: number): number {
  const [r, g, b] = channels(hex);
  return (
    APCA_WEIGHTS[0] * (r / 255) ** MAIN_TRC +
    APCA_WEIGHTS[1] * (g / 255) ** MAIN_TRC +
    APCA_WEIGHTS[2] * (b / 255) ** MAIN_TRC
  );
}

/** APCA's soft clamp near black, which stops contrast running away in the darks. */
function clampBlack(y: number): number {
  return y > BLK_THRS ? y : y + (BLK_THRS - y) ** BLK_CLMP;
}

/** Normal polarity, dark on light, which APCA reports as a positive Lc. */
function darkOnLight(textY: number, backgroundY: number): number {
  const sapc = (backgroundY ** NORM_BG - textY ** NORM_TXT) * SCALE_BOW;
  return sapc < LO_CLIP ? 0 : (sapc - LO_BOW_OFFSET) * 100;
}

/** Reverse polarity, light on dark, which APCA reports as a negative Lc. */
function lightOnDark(textY: number, backgroundY: number): number {
  const sapc = (backgroundY ** REV_BG - textY ** REV_TXT) * SCALE_WOB;
  return sapc > -LO_CLIP ? 0 : (sapc + LO_WOB_OFFSET) * 100;
}

/** APCA Lc, constant set 0.0.98G-4g. Signed: light on dark returns a negative Lc. */
export function apcaLc(foreground: number, background: number): number {
  const textY = clampBlack(apcaLuminance(foreground));
  const backgroundY = clampBlack(apcaLuminance(background));
  if (Math.abs(backgroundY - textY) < DELTA_Y_MIN) return 0;
  return backgroundY > textY
    ? darkOnLight(textY, backgroundY)
    : lightOnDark(textY, backgroundY);
}

/**
 * Luminance weights per observer, in linear RGB (research 5.3). A protanope's
 * luminance is carried by the M cone alone and a deuteranope's by the L cone,
 * so these are the normalised M and L rows of the Viénot RGB-to-LMS matrix
 * rather than a simulation of what either observer sees.
 */
const OBSERVER_WEIGHTS: Record<Observer, readonly [number, number, number]> = {
  normal: REC709,
  protan: [0.1002, 0.7876, 0.1122],
  deutan: [0.2729, 0.6642, 0.0629],
};

/** One sRGB byte as linear light, over the sRGB transfer function's two segments. */
function sRgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Linear light back to an sRGB value in 0 to 1. The inverse of sRgbToLinear. */
function linearToSRgb(value: number): number {
  return value <= 0.0031308
    ? value * 12.92
    : 1.055 * value ** (1 / 2.4) - 0.055;
}

/** Apparent lightness for one observer, 0 to 100: linear luminance under that observer's weights, re-encoded to sRGB. */
export function observerLuma(hex: number, observer: Observer): number {
  const weights = OBSERVER_WEIGHTS[observer];
  const [r, g, b] = channels(hex).map(sRgbToLinear);
  return linearToSRgb(weights[0] * r + weights[1] * g + weights[2] * b) * 100;
}

/** The hue angle in degrees for a colour that has one, given its sorted channels. */
function hueOf(r: number, g: number, b: number, max: number, span: number) {
  if (max === r) return 60 * (((g - b) / span + 6) % 6);
  if (max === g) return 60 * ((b - r) / span + 2);
  return 60 * ((r - g) / span + 4);
}

/** HSV, hue in degrees 0 to 360, saturation and value 0 to 1. */
export function hsv(hex: number): Hsv {
  const [r, g, b] = channels(hex);
  const max = Math.max(r, g, b);
  const span = max - Math.min(r, g, b);
  // A neutral has no hue and no saturation; zero is the conventional stand-in.
  if (span === 0) return { h: 0, s: 0, v: max / 255 };
  return { h: hueOf(r, g, b, max, span), s: span / max, v: max / 255 };
}
