// The ground at the grave's edge: the trodden margin, loose crumbs, the turf's shadow and the grass hanging in over the cut.

import { graveWidth } from '../../../game/grave';
import { PALETTE } from '../../palette';
import type { GraveCanvas, Polygon } from './graveCanvas';
import {
  clamp,
  coordinate,
  hex,
  lerp,
  makeRandom,
  onePx,
  rgba,
  TAU,
  tracePolys,
} from './graveCanvas';
import { TREAD } from './graveDrawingValues';
import { outwardAt, roughAt } from './graveMouth';

/**
 * How far the bare margin swells at a point round the rim. Two named places
 * rather than noise all the way round: noise gives an even halo, and an even
 * halo round a hole is read as a shadow, which a hole does not cast.
 */
const treadAt = (u: number): number => {
  let most = 0;
  for (const spot of TREAD) {
    const away = Math.abs(((((u - spot.at) % 1) + 1.5) % 1) - 0.5);
    if (away >= spot.span) continue;
    most = Math.max(most, 0.5 + Math.cos((away / spot.span) * Math.PI) / 2);
  }
  return most;
};

/**
 * Bare earth where the digging trod the grass off, laid down as overlapping
 * patches rather than as a ring. A ring has an outline, and an outline round an
 * opening is a kerb. It is darker than the grass it replaces, never brighter,
 * for the same reason.
 */
const paintTrampledMargin = (
  ctx: GraveCanvas,
  mouth: Polygon,
  size: number,
  viewScale: number,
): void => {
  const random = makeRandom(795556887);
  const w = graveWidth(size);
  const each = Math.round(clamp(viewScale * w * 0.05, 2, 4));
  for (let i = 0; i < mouth.length; i += 2) {
    const out = outwardAt(mouth, i);
    const swell = 1 + treadAt(i / mouth.length) * 1.25;
    for (let b = 0; b < each; b++) {
      const away = w * lerp(-0.015, 0.075, Math.pow(random(), 1.4)) * swell;
      ctx.fillStyle =
        random() < 0.4
          ? rgba(PALETTE.graveMarginDark, (0.06 + random() * 0.12).toFixed(3))
          : rgba(PALETTE.graveMarginPale, (0.05 + random() * 0.13).toFixed(3));
      ctx.beginPath();
      ctx.ellipse(
        coordinate(mouth, i) + out.x * away,
        coordinate(mouth, i + 1) + out.y * away,
        Math.max(onePx(1, viewScale), w * lerp(0.03, 0.08, random())),
        Math.max(onePx(0.8, viewScale), w * lerp(0.022, 0.055, random())),
        random() * TAU,
        0,
        TAU,
      );
      ctx.fill();
    }
  }
};

/** Sparse lumps of turned earth on the bare margin, each with its own shadow. */
const paintLooseCrumbs = (
  ctx: GraveCanvas,
  mouth: Polygon,
  size: number,
  viewScale: number,
): void => {
  const random = makeRandom(1821285621);
  const w = graveWidth(size);
  const crumbs = Math.round(
    clamp((w + size * 2) * 2 * viewScale * 0.06, 8, 26),
  );
  for (let i = 0; i < crumbs; i++) {
    const k = Math.floor(random() * (mouth.length / 2)) * 2;
    const out = outwardAt(mouth, k);
    const away =
      w * lerp(0.015, 0.085, random()) * (1 + treadAt(k / mouth.length));
    const cx = coordinate(mouth, k) + out.x * away;
    const cy = coordinate(mouth, k + 1) + out.y * away;
    const r = Math.max(onePx(0.6, viewScale), w * lerp(0.012, 0.03, random()));
    ctx.fillStyle = rgba(PALETTE.graveCrumbShadow, 0.55);
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.35, r * 1.15, r * 0.8, 0, 0, TAU);
    ctx.fill();
    // The moon on top of the lump, kept under the grass's own value so the
    // margin never turns into a scatter of bright beads.
    ctx.fillStyle = rgba(PALETTE.graveCrumbTop, 0.3);
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.2, r * 0.9, r * 0.6, 0, 0, TAU);
    ctx.fill();
  }
};

// The heavier shadow under the far lip, traced along the mouth's own vertices there.
const traceFarLip = (ctx: GraveCanvas, mouth: Polygon, size: number): void => {
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < mouth.length; i += 2) {
    const x = coordinate(mouth, i);
    const y = coordinate(mouth, i + 1);
    if (y > -size * 0.55) {
      started = false;
      continue;
    }
    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else ctx.lineTo(x, y);
  }
};

/**
 * The turf overhangs the cut by a hair, so it throws a line of shadow just
 * inside the edge all the way round, deepest under the far lip. Stroked at
 * double width inside the mouth, so only the inner half of it lands. It is kept
 * narrow: a side wall is about a seventh of the opening across, and a shadow
 * that takes half of that leaves a sliver instead of a face.
 */
const paintTurfShadow = (
  ctx: GraveCanvas,
  mouth: Polygon,
  size: number,
  viewScale: number,
): void => {
  ctx.save();
  tracePolys(ctx, mouth);
  ctx.clip();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = rgba(PALETTE.graveTurfShadow, 0.45);
  ctx.lineWidth = Math.max(onePx(0.7, viewScale), size * 0.016) * 2;
  tracePolys(ctx, mouth);
  ctx.stroke();

  ctx.strokeStyle = rgba(PALETTE.graveTurfShadow, 0.5);
  ctx.lineWidth = Math.max(onePx(1, viewScale), size * 0.05) * 2;
  traceFarLip(ctx, mouth, size);
  ctx.stroke();
  ctx.restore();
};

/** One tuft's blades, rooted just outside the edge at vertex `k` and hanging in. */
const paintBlades = (
  ctx: GraveCanvas,
  mouth: Polygon,
  k: number,
  w: number,
  viewScale: number,
  random: () => number,
): void => {
  const out = outwardAt(mouth, k);
  const base = w * 0.035;
  const blades = 3 + Math.floor(random() * 3);
  for (let b = 0; b < blades; b++) {
    const spread = lerp(-1, 1, random()) * base * 1.6;
    const px = coordinate(mouth, k) + out.x * base * 0.5 + out.y * spread;
    const py = coordinate(mouth, k + 1) + out.y * base * 0.5 - out.x * spread;
    // A blade shorter than about two screen pixels is a green speck.
    const reach = Math.max(
      onePx(1.8, viewScale),
      w * lerp(0.05, 0.095, random()),
    );
    const sway = lerp(-0.6, 0.6, random());
    ctx.strokeStyle =
      random() < 0.18 ? hex(PALETTE.graveTurf) : hex(PALETTE.graveTurfDark);
    ctx.lineWidth = Math.max(onePx(0.6, viewScale), lerp(0.3, 0.8, random()));
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(
      px - out.x * reach * 0.6 + out.y * sway * reach,
      py - out.y * reach * 0.6 - out.x * sway * reach,
      px - out.x * reach,
      py - out.y * reach,
    );
    ctx.stroke();
  }
};

/**
 * Blades rooted on the grass outside the edge and hanging in over the hole.
 * Nothing along the near lip: grass there leans toward the camera and only ever
 * reads as a fringe laid across the bottom of the opening.
 */
const paintOverhangingGrass = (
  ctx: GraveCanvas,
  mouth: Polygon,
  size: number,
  viewScale: number,
): void => {
  const random = makeRandom(2400959708);
  const w = graveWidth(size);
  const tufts = Math.round(
    clamp((w + size * 2) * 2 * viewScale * 0.055, 6, 20),
  );
  ctx.lineCap = 'round';
  for (let t = 0; t < tufts; t++) {
    const k = Math.floor((t / tufts) * (mouth.length / 2)) * 2;
    if (coordinate(mouth, k + 1) > size * 0.5) continue;
    // Grass does not hem an edge evenly, so about a third of the stops skip.
    if (roughAt(t / tufts + 0.11) < -0.1) continue;
    paintBlades(ctx, mouth, k, w, viewScale, random);
  }
};

/**
 * The ground at the edge: a narrow band of bare trodden earth where the grass
 * gives way to the cut, loose crumbs on it, the turf's own shadow thrown a hair
 * inside the opening, and blades hanging over the far and side edges. It is
 * baked above the falls, so a body going in passes under the grass.
 */
const paintLip = (
  ctx: GraveCanvas,
  mouth: Polygon,
  size: number,
  viewScale: number,
): void => {
  paintTrampledMargin(ctx, mouth, size, viewScale);
  paintLooseCrumbs(ctx, mouth, size, viewScale);
  paintTurfShadow(ctx, mouth, size, viewScale);
  paintOverhangingGrass(ctx, mouth, size, viewScale);
};

export { paintLip };
