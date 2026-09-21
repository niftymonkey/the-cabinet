// The prototype's ground on the whole field: the canvas it is painted on, the
// painters, how much of each thing they draw, and how sharp the baked picture
// is (design record R4, Mark's ruling of 2026-09-21).

import { PALETTE } from '../../palette';
import { clamp, lerp, makeRandom } from './graveCanvas';

/**
 * The canvas the ground is painted on: exactly the chained drawing calls the
 * prototype's `paintGround` makes, and nothing that would tie the painters to
 * Pixi, so a test hands them a canvas that records. Pixi's `Graphics` satisfies
 * it as it stands.
 */
interface GroundCanvas {
  rect(x: number, y: number, width: number, height: number): GroundCanvas;
  ellipse(x: number, y: number, radiusX: number, radiusY: number): GroundCanvas;
  circle(x: number, y: number, radius: number): GroundCanvas;
  moveTo(x: number, y: number): GroundCanvas;
  lineTo(x: number, y: number): GroundCanvas;
  quadraticCurveTo(
    cpx: number,
    cpy: number,
    x: number,
    y: number,
  ): GroundCanvas;
  fill(style: { color: number; alpha?: number }): GroundCanvas;
  stroke(style: { width: number; color: number; alpha: number }): GroundCanvas;
}

/** The space the ground is painted across, in field units. */
interface Field {
  readonly width: number;
  readonly height: number;
}

/** One draw off the ground's own seeded stream. */
type Draw = () => number;

/**
 * How much of each thing the ground carries, the one stream that places it all,
 * and how many texture pixels the bake may ask for. Every value is the
 * prototype's own (build 7's `paintGround` and `groundResolution`).
 *
 * The seed is written in decimal because a module that draws during a run may
 * carry no hex literal at all, comments included (palette.test.ts's source
 * scan); the prototype writes the same number as a hex.
 */
const GROUND_PAINTING = {
  widePatches: 54,
  mottles: 520,
  cracks: 70,
  crackSegments: 3,
  grainFlecks: 2600,
  tufts: 230,
  tuftBlades: 5,
  gravelSpecks: 180,
  seed: 132781491,
  /**
   * How far past every edge the base earth is painted, in field units.
   *
   * The bake crops the picture to the field's own rectangle, so an edge lying
   * inside that crop is antialiased against nothing and leaves a row of
   * half-covered pixels. Tiled, two of those rows meet and draw a line across
   * the field. Painting the base past the crop puts the soft edge where the
   * frame cuts it instead. It is the prototype's own pad on the grave's bake.
   */
  baseOverflow: 4,
  // The smallest texture size a phone is sure to allow.
  maxTexturePixels: 4096,
  resolution: { min: 1, max: 3 },
} as const;

/**
 * Where a shape is drawn again so the picture meets itself.
 *
 * The prototype paints one still field and never moves it; the game's ground
 * runs down the screen at the field's own scroll, so the baked picture is shown
 * over and over and has to join itself. A shape whose extent leaves an edge is
 * painted a second time a field height away, and the two halves meet at the
 * join. It is an addition to the prototype's painters and never a change to a
 * colour, a count or a placement: nothing here draws off the stream.
 */
const wrapsAt = (
  top: number,
  bottom: number,
  height: number,
): readonly number[] => {
  const offsets = [0];
  if (top < 0) offsets.push(height);
  if (bottom > height) offsets.push(-height);
  return offsets;
};

/**
 * Patches of damp and dry, wide and soft. They carry most of the ground's
 * variation, which is what keeps a mid-dark field from reading as paper.
 */
const paintWidePatches = (
  canvas: GroundCanvas,
  field: Field,
  random: Draw,
): void => {
  for (let i = 0; i < GROUND_PAINTING.widePatches; i++) {
    const x = random() * field.width;
    const y = random() * field.height;
    const rx = lerp(22, 96, random());
    const ry = rx * lerp(0.3, 0.7, random());
    const pick = random();
    const style = {
      color:
        pick < 0.32
          ? PALETTE.groundCold.hex
          : pick < 0.62
            ? PALETTE.groundWet.hex
            : PALETTE.groundDamp.hex,
      alpha: lerp(0.09, 0.22, random()),
    };
    for (const dy of wrapsAt(y - ry, y + ry, field.height)) {
      canvas.ellipse(x, y + dy, rx, ry).fill(style);
    }
  }
};

/**
 * A second, much smaller mottle. The wide patches carry the field's shape at
 * true game scale and vanish under a close camera, which needs variation at its
 * own size.
 */
const paintMottles = (
  canvas: GroundCanvas,
  field: Field,
  random: Draw,
): void => {
  for (let i = 0; i < GROUND_PAINTING.mottles; i++) {
    const x = random() * field.width;
    const y = random() * field.height;
    const rx = lerp(4, 22, Math.pow(random(), 1.4));
    const pick = random();
    const ry = rx * lerp(0.4, 0.85, random());
    const style = {
      color:
        pick < 0.3
          ? PALETTE.groundCold.hex
          : pick < 0.62
            ? PALETTE.groundWet.hex
            : PALETTE.groundDamp.hex,
      alpha: lerp(0.07, 0.2, random()),
    };
    for (const dy of wrapsAt(y - ry, y + ry, field.height)) {
      canvas.ellipse(x, y + dy, rx, ry).fill(style);
    }
  }
};

/** Cracks in the dry earth between the patches, each walked in three segments. */
const paintCracks = (
  canvas: GroundCanvas,
  field: Field,
  random: Draw,
): void => {
  for (let i = 0; i < GROUND_PAINTING.cracks; i++) {
    let x = random() * field.width;
    let y = random() * field.height;
    for (let s = 0; s < GROUND_PAINTING.crackSegments; s++) {
      const nx = x + lerp(-13, 13, random());
      const ny = y + lerp(-9, 9, random());
      const style = {
        width: lerp(0.3, 0.8, random()),
        color: PALETTE.groundCrack.hex,
        alpha: 0.45,
      };
      const half = style.width / 2;
      const offsets = wrapsAt(
        Math.min(y, ny) - half,
        Math.max(y, ny) + half,
        field.height,
      );
      for (const dy of offsets) {
        canvas
          .moveTo(x, y + dy)
          .lineTo(nx, ny + dy)
          .stroke(style);
      }
      x = nx;
      y = ny;
    }
  }
};

/**
 * Grain. It is the detail a close view lives on, so there is a lot of it and
 * each fleck is small enough to stay a fleck at two and a half pixels a unit.
 */
const paintGrain = (canvas: GroundCanvas, field: Field, random: Draw): void => {
  for (let i = 0; i < GROUND_PAINTING.grainFlecks; i++) {
    const x = random() * field.width;
    const y = random() * field.height;
    const dark = random() < 0.42;
    const radius = lerp(0.35, 1.2, random());
    const style = {
      color: dark ? PALETTE.groundCrack.hex : PALETTE.groundSpeckle.hex,
      alpha: lerp(0.25, 0.8, random()),
    };
    for (const dy of wrapsAt(y - radius, y + radius, field.height)) {
      canvas.circle(x, y + dy, radius).fill(style);
    }
  }
};

/** One blade of a tuft, sprouting from the tuft's own point. */
const paintBlade = (
  canvas: GroundCanvas,
  field: Field,
  random: Draw,
  at: { x: number; y: number },
): void => {
  const bx = at.x + lerp(-4, 4, random());
  const by = at.y + lerp(-3, 3, random());
  const up = lerp(2.4, 6, random());
  const controlX = bx + lerp(-1.4, 1.4, random());
  const tipX = bx + lerp(-2.4, 2.4, random());
  const style = {
    width: lerp(0.3, 0.75, random()),
    color: random() < 0.5 ? PALETTE.graveTurf.hex : PALETTE.graveTurfDark.hex,
    alpha: 0.7,
  };
  const half = style.width / 2;
  for (const dy of wrapsAt(by - up - half, by + half, field.height)) {
    canvas
      .moveTo(bx, by + dy)
      .quadraticCurveTo(controlX, by + dy - up * 0.5, tipX, by + dy - up)
      .stroke(style);
  }
};

/**
 * Tufts of grass, small: at a close camera a blade the length a far view wanted
 * comes out as a hand-drawn sprout a third the grave's width.
 */
const paintTufts = (canvas: GroundCanvas, field: Field, random: Draw): void => {
  for (let i = 0; i < GROUND_PAINTING.tufts; i++) {
    const at = { x: random() * field.width, y: random() * field.height };
    for (let b = 0; b < GROUND_PAINTING.tuftBlades; b++) {
      paintBlade(canvas, field, random, at);
    }
  }
};

/** Specks of gravel lying loose on the earth. */
const paintGravel = (
  canvas: GroundCanvas,
  field: Field,
  random: Draw,
): void => {
  for (let i = 0; i < GROUND_PAINTING.gravelSpecks; i++) {
    const x = random() * field.width;
    const y = random() * field.height;
    const radius = lerp(0.7, 2.2, random());
    const style = {
      color: PALETTE.groundGravel.hex,
      alpha: lerp(0.14, 0.34, random()),
    };
    for (const dy of wrapsAt(y - radius, y + radius, field.height)) {
      canvas.circle(x, y + dy, radius).fill(style);
    }
  }
};

/**
 * The night field: the base earth, the patches of damp and dry, the cracks, the
 * grain, the tufts and the gravel, in the prototype's own order off one seeded
 * stream, so the field is the same picture every time it is painted.
 */
const paintGround = (canvas: GroundCanvas, field: Field): void => {
  const random = makeRandom(GROUND_PAINTING.seed);
  const over = GROUND_PAINTING.baseOverflow;
  canvas
    .rect(-over, -over, field.width + 2 * over, field.height + 2 * over)
    .fill({ color: PALETTE.groundNight.hex });
  paintWidePatches(canvas, field, random);
  paintMottles(canvas, field, random);
  paintCracks(canvas, field, random);
  paintGrain(canvas, field, random);
  paintTufts(canvas, field, random);
  paintGravel(canvas, field, random);
};

/**
 * How many texture pixels the baked field gets per field unit: what the view
 * shows times what the device draws, never finer than the picture needs and
 * never asking for a texture larger than the cap on either side.
 */
const groundResolution = (
  viewScale: number,
  devicePixelRatio: number,
  field: Field,
): number => {
  const wanted = viewScale * devicePixelRatio;
  const fits = Math.min(
    GROUND_PAINTING.maxTexturePixels / field.width,
    GROUND_PAINTING.maxTexturePixels / field.height,
  );
  return clamp(
    Math.min(wanted, fits),
    GROUND_PAINTING.resolution.min,
    GROUND_PAINTING.resolution.max,
  );
};

export { GROUND_PAINTING, groundResolution, paintGround };
export type { Field, GroundCanvas };
