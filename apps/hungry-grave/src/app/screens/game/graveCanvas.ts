// Painting the grave in field units on a 2D canvas: the canvas the painters draw on, and the helpers every painter shares.

import type { PaletteEntry } from '../../palette';

/**
 * The canvas the grave is painted on: exactly the 2D context calls the
 * prototype's bake and painters make, and nothing that would tie them to a
 * browser or to Pixi, so a test hands them a canvas that records.
 */
type GraveCanvas = Pick<
  CanvasRenderingContext2D,
  | 'beginPath'
  | 'closePath'
  | 'moveTo'
  | 'lineTo'
  | 'quadraticCurveTo'
  | 'ellipse'
  | 'fillRect'
  | 'fill'
  | 'stroke'
  | 'clip'
  | 'save'
  | 'restore'
  | 'createLinearGradient'
  | 'setTransform'
  | 'fillStyle'
  | 'strokeStyle'
  | 'lineWidth'
  | 'lineCap'
  | 'lineJoin'
>;

// A polygon as the prototype keeps one: x and y pairs laid end to end.
type Polygon = readonly number[];

const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const TAU = Math.PI * 2;

/**
 * That many screen pixels, in field units, at a view of `viewScale` CSS pixels
 * per field unit. Every piece of art reads it to keep a detail from falling
 * under a pixel.
 */
const onePx = (screenPixels: number, viewScale: number): number =>
  screenPixels / viewScale;

/** One seeded stream, so the grave is the same picture every time it is painted. */
const makeRandom = (seed: number): (() => number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 1831565813) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * One coordinate of a polygon. An index past the end is a bug in the painter
 * walking it, so it fails loudly rather than drawing at NaN.
 */
const coordinate = (poly: Polygon, index: number): number => {
  const value = poly[index];
  if (value === undefined) {
    throw new Error(`no coordinate ${index} in a polygon of ${poly.length}`);
  }
  return value;
};

/**
 * One path out of one or more polygons. A ring is two of them filled even-odd,
 * which is why they have to share a path rather than be traced one after the
 * other.
 */
const tracePolys = (ctx: GraveCanvas, ...polys: Polygon[]): void => {
  ctx.beginPath();
  for (const poly of polys) {
    ctx.moveTo(coordinate(poly, 0), coordinate(poly, 1));
    for (let i = 2; i < poly.length; i += 2) {
      ctx.lineTo(coordinate(poly, i), coordinate(poly, i + 1));
    }
    ctx.closePath();
  }
};

// A palette row as the canvas's solid colour string.
const hex = (entry: PaletteEntry): string =>
  `#${entry.hex.toString(16).padStart(6, '0')}`;

// A palette row at an alpha, as the canvas's rgba() string.
const rgba = (entry: PaletteEntry, alpha: number | string): string =>
  `rgba(${(entry.hex >> 16) & 255}, ${(entry.hex >> 8) & 255}, ${entry.hex & 255}, ${alpha})`;

export {
  clamp,
  coordinate,
  hex,
  lerp,
  makeRandom,
  onePx,
  rgba,
  TAU,
  tracePolys,
};
export type { GraveCanvas, Polygon };
