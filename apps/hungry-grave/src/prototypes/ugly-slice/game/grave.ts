// The grave's shape: a rounded rectangle, taller than wide, sized by one
// half-height scalar (decision-log entry 6). Collision against circles is
// the distance from the circle to the rectangle's rounded edge.

import * as T from './tuning';

export function graveHalfW(halfH: number): number {
  return halfH * T.GRAVE_ASPECT;
}

export function graveCorner(halfH: number): number {
  return graveHalfW(halfH) * T.GRAVE_CORNER_FRAC;
}

// True when a circle at (cx, cy) with radius cr touches the grave's rounded
// rectangle, the rectangle scaled by `scale` (the hurtbox is slightly smaller
// than the drawn grave; the mouth is the full shape).
export function circleTouchesGrave(
  px: number,
  py: number,
  halfH: number,
  cx: number,
  cy: number,
  cr: number,
  scale: number,
): boolean {
  const hw = graveHalfW(halfH) * scale;
  const hh = halfH * scale;
  const corner = Math.min(graveCorner(halfH) * scale, hw, hh);
  const dx = Math.max(Math.abs(cx - px) - (hw - corner), 0);
  const dy = Math.max(Math.abs(cy - py) - (hh - corner), 0);
  return dx * dx + dy * dy < (corner + cr) * (corner + cr);
}
