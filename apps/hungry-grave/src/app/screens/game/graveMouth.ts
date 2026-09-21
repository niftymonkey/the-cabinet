// The grave's opening as the prototype cuts it: a true rectangle with a few crumbled bites out of the lip.

import { graveWidth } from '../../../game/grave';
import type { Polygon } from './graveCanvas';
import { coordinate, lerp, makeRandom } from './graveCanvas';
import { NOTCHES } from './graveDrawingValues';

// How many entries the roughness table holds round the perimeter.
const ROUGH_LENGTH = 96;

/**
 * A fixed roughness table, smoothed once: a raw table gives spikes, and earth
 * is lumpy rather than spiky.
 */
const smoothedRoughness = (): readonly number[] => {
  const random = makeRandom(2654435769);
  const raw = Array.from({ length: ROUGH_LENGTH }, () => random() * 2 - 1);
  const at = (i: number): number => coordinate(raw, i % ROUGH_LENGTH);
  return raw.map((_, i) => (at(i + 95) + at(i) * 2 + at(i + 1)) / 4);
};

/**
 * Sampled by position around the perimeter rather than by index, so the dug
 * edge keeps its identity while the grave grows.
 */
const ROUGH = smoothedRoughness();

const roughAt = (u: number): number => {
  const scaled = (((u % 1) + 1) % 1) * ROUGH.length;
  const i = Math.floor(scaled);
  const f = scaled - i;
  return lerp(
    coordinate(ROUGH, i),
    coordinate(ROUGH, (i + 1) % ROUGH.length),
    f,
  );
};

// One point walked round the rectangle: where it is, which way is out, and how far round it sits.
interface RimPoint {
  readonly x: number;
  readonly y: number;
  readonly nx: number;
  readonly ny: number;
  readonly u: number;
}

type Leg =
  | {
      readonly kind: 'line';
      readonly from: readonly [number, number];
      readonly to: readonly [number, number];
      readonly len: number;
    }
  | {
      readonly kind: 'arc';
      readonly c: readonly [number, number];
      readonly a0: number;
      readonly a1: number;
      readonly len: number;
    };

// The rectangle's four sides and four corner arcs, clockwise from the top-left.
const rectangleLegs = (hw: number, hh: number, r: number): Leg[] => {
  const quarter = (r * Math.PI) / 2;
  return [
    {
      kind: 'line',
      from: [-hw + r, -hh],
      to: [hw - r, -hh],
      len: 2 * (hw - r),
    },
    {
      kind: 'arc',
      c: [hw - r, -hh + r],
      a0: -Math.PI / 2,
      a1: 0,
      len: quarter,
    },
    { kind: 'line', from: [hw, -hh + r], to: [hw, hh - r], len: 2 * (hh - r) },
    { kind: 'arc', c: [hw - r, hh - r], a0: 0, a1: Math.PI / 2, len: quarter },
    { kind: 'line', from: [hw - r, hh], to: [-hw + r, hh], len: 2 * (hw - r) },
    {
      kind: 'arc',
      c: [-hw + r, hh - r],
      a0: Math.PI / 2,
      a1: Math.PI,
      len: quarter,
    },
    {
      kind: 'line',
      from: [-hw, hh - r],
      to: [-hw, -hh + r],
      len: 2 * (hh - r),
    },
    {
      kind: 'arc',
      c: [-hw + r, -hh + r],
      a0: Math.PI,
      a1: Math.PI * 1.5,
      len: quarter,
    },
  ];
};

// One point this far along one leg, with `u` its share of the whole perimeter.
const pointOnLeg = (
  leg: Leg,
  r: number,
  along: number,
  u: number,
): RimPoint => {
  if (leg.kind === 'line') {
    const dx = leg.to[0] - leg.from[0];
    const dy = leg.to[1] - leg.from[1];
    const n = Math.hypot(dx, dy) || 1;
    return {
      x: lerp(leg.from[0], leg.to[0], along),
      y: lerp(leg.from[1], leg.to[1], along),
      nx: dy / n,
      ny: -dx / n,
      u,
    };
  }
  const a = lerp(leg.a0, leg.a1, along);
  return {
    x: leg.c[0] + r * Math.cos(a),
    y: leg.c[1] + r * Math.sin(a),
    nx: Math.cos(a),
    ny: Math.sin(a),
    u,
  };
};

/**
 * A rectangle walked as a polygon, corners barely rounded, each point handed
 * back with how far round the perimeter it sits and which way is out of the
 * shape there. A grave is cut square, so the corner radius only takes the
 * mathematical point off a corner and never rounds the sides into an oval.
 */
const walkRectangle = (
  halfWidth: number,
  halfHeight: number,
  radius: number,
  steps: number,
): RimPoint[] => {
  const legs = rectangleLegs(halfWidth, halfHeight, radius);
  const total = legs.reduce((sum, leg) => sum + leg.len, 0);
  const out: RimPoint[] = [];
  let walked = 0;
  for (const leg of legs) {
    const count = Math.max(2, Math.round((leg.len / total) * steps));
    for (let s = 0; s < count; s++) {
      const along = s / count;
      out.push(
        pointOnLeg(leg, radius, along, (walked + leg.len * along) / total),
      );
    }
    walked += leg.len;
  }
  return out;
};

/** How deep the lip is bitten at a place round the perimeter, 0 to 1. */
const notchAt = (u: number): number => {
  let deepest = 0;
  for (const notch of NOTCHES) {
    const away = Math.abs(((((u - notch.at) % 1) + 1.5) % 1) - 0.5);
    if (away >= notch.span) continue;
    // A half cosine, so a bite opens and closes rather than stepping in.
    deepest = Math.max(
      deepest,
      notch.bite * (0.5 + Math.cos((away / notch.span) * Math.PI) / 2),
    );
  }
  return deepest;
};

/**
 * The mouth: the grave's opening as a true rectangle, cut square, with a few
 * crumbled bites out of the lip. The bites only ever go outward, because a
 * crumbled edge is ground that fell away and left the hole wider there.
 */
const mouthPolygon = (size: number): Polygon => {
  const hw = graveWidth(size) / 2;
  const bite = hw * 0.1;
  const points: number[] = [];
  for (const p of walkRectangle(hw, size, hw * 0.06, 88)) {
    const out = notchAt(p.u) * bite;
    points.push(p.x + p.nx * out, p.y + p.ny * out);
  }
  return points;
};

/** The way out of a polygon at one of its vertices, from the way it is walked. */
const outwardAt = (poly: Polygon, i: number): { x: number; y: number } => {
  const j = (i + 2) % poly.length;
  const dx = coordinate(poly, j) - coordinate(poly, i);
  const dy = coordinate(poly, j + 1) - coordinate(poly, i + 1);
  const n = Math.hypot(dx, dy) || 1;
  return { x: dy / n, y: -dx / n };
};

// How far a polygon reaches from the origin, across and down.
const polyBounds = (poly: Polygon): { maxX: number; maxY: number } => {
  let maxX = 0;
  let maxY = 0;
  for (let i = 0; i < poly.length; i += 2) {
    maxX = Math.max(maxX, Math.abs(coordinate(poly, i)));
    maxY = Math.max(maxY, Math.abs(coordinate(poly, i + 1)));
  }
  return { maxX, maxY };
};

export { mouthPolygon, outwardAt, polyBounds, roughAt };
