/**
 * The prototype's ground on the whole field. Pure: the painters take a canvas
 * and the field's own size, and the same field gives the same picture every
 * time.
 */

import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { VIEW_HEIGHT, VIEW_WIDTH } from '../../../../game/field';
import { PALETTE } from '../../../palette';
import type { Field, GroundCanvas } from '../groundPainting';
import {
  GROUND_PAINTING,
  groundResolution,
  paintGround,
} from '../groundPainting';

const FIELD: Field = { width: VIEW_WIDTH, height: VIEW_HEIGHT };

/**
 * One drawing call as the recorder keeps it: what was drawn, the arguments that
 * are not a y, the ys on their own, and the fill or stroke that ended it.
 *
 * The ys are kept apart from the rest because that is what tells a wrapped twin
 * from the shape it repeats: the same drawing at the same x, a field height up
 * or down. The placed xs are kept apart from the sizes for the same reason
 * across the sides, and every call is kept as it was made so a paint can be
 * compared call for call.
 */
interface Shape {
  readonly kind: string;
  readonly across: readonly number[];
  readonly xs: readonly number[];
  readonly sizes: readonly number[];
  readonly ys: readonly number[];
  readonly calls: readonly string[];
  readonly style: string;
  readonly colour: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

interface Ended {
  readonly color: number;
  readonly alpha?: number;
  readonly width?: number;
}

/** A path call's numbers: all of them as made, the xs it places, and its sizes. */
interface PathCall {
  readonly args: readonly number[];
  readonly at: readonly number[];
  readonly size: readonly number[];
}

/** One call written exactly as it was made. */
const callText = (name: string, args: readonly unknown[]): string =>
  `${name}(${args.map((each) => JSON.stringify(each)).join(',')})`;

/**
 * A canvas that records instead of drawing. A shape is a path followed by the
 * fill or the stroke that ends it, which is how the prototype's painters chain
 * them, so the recorder holds the path open until one of those two arrives.
 */
function recorder(): { canvas: GroundCanvas; shapes: Shape[] } {
  const shapes: Shape[] = [];
  let kind = '';
  let placed: number[] = [];
  let sizes: number[] = [];
  let ys: number[] = [];
  let calls: string[] = [];
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;

  const path = (
    name: string,
    call: PathCall,
    xs: number[],
    downs: number[],
  ): GroundCanvas => {
    kind = kind.length === 0 ? name : `${kind}+${name}`;
    placed = [...placed, ...call.at];
    sizes = [...sizes, ...call.size];
    ys = [...ys, ...downs];
    calls = [...calls, callText(name, call.args)];
    left = Math.min(left, ...xs);
    right = Math.max(right, ...xs);
    top = Math.min(top, ...downs);
    bottom = Math.max(bottom, ...downs);
    return canvas;
  };

  const close = (name: string, style: Ended): GroundCanvas => {
    const half = (style.width ?? 0) / 2;
    shapes.push({
      kind,
      across: [...placed, ...sizes],
      xs: placed,
      sizes,
      ys,
      calls: [...calls, callText(name, [style])],
      style: JSON.stringify(style),
      colour: style.color,
      left: left - half,
      right: right + half,
      top: top - half,
      bottom: bottom + half,
    });
    kind = '';
    placed = [];
    sizes = [];
    ys = [];
    calls = [];
    left = Infinity;
    right = -Infinity;
    top = Infinity;
    bottom = -Infinity;
    return canvas;
  };

  const canvas: GroundCanvas = {
    rect: (x, y, width, height) =>
      path(
        'rect',
        { args: [x, y, width, height], at: [x], size: [width, height] },
        [x, x + width],
        [y, y + height],
      ),
    ellipse: (x, y, radiusX, radiusY) =>
      path(
        'ellipse',
        { args: [x, y, radiusX, radiusY], at: [x], size: [radiusX, radiusY] },
        [x - radiusX, x + radiusX],
        [y - radiusY, y + radiusY],
      ),
    circle: (x, y, radius) =>
      path(
        'circle',
        { args: [x, y, radius], at: [x], size: [radius] },
        [x - radius, x + radius],
        [y - radius, y + radius],
      ),
    moveTo: (x, y) =>
      path('moveTo', { args: [x, y], at: [x], size: [] }, [x], [y]),
    lineTo: (x, y) =>
      path('lineTo', { args: [x, y], at: [x], size: [] }, [x], [y]),
    quadraticCurveTo: (cpx, cpy, x, y) =>
      path(
        'quadraticCurveTo',
        { args: [cpx, cpy, x, y], at: [cpx, x], size: [] },
        [cpx, x],
        [cpy, y],
      ),
    fill: (style) => close('fill', style),
    stroke: (style) => close('stroke', style),
  };
  return { canvas, shapes };
}

function painted(field: Field = FIELD, reach = 1): Shape[] {
  const { canvas, shapes } = recorder();
  paintGround(canvas, field, reach);
  return shapes;
}

/** A shape's identity: everything about it but where down the field it sits. */
function identity(shape: Shape): string {
  return `${shape.kind} ${shape.across.map((each) => each.toFixed(6)).join(',')} ${shape.style}`;
}

/** A shape written out whole, so two paints can be compared call for call. */
function asText(shape: Shape): string {
  return `${identity(shape)} @ ${shape.ys.map((each) => each.toFixed(6)).join(',')}`;
}

/** Whether one shape is the other drawn again this far down the field. */
function isTwinOf(twin: Shape, home: Shape, away: number): boolean {
  if (twin.ys.length !== home.ys.length) return false;
  return home.ys.every(
    (y, at) => Math.abs((twin.ys[at] ?? NaN) - (y + away)) < 1e-9,
  );
}

/** Whether every number moved by exactly this much. */
const shiftedBy = (
  moved: readonly number[],
  from: readonly number[],
  by: number,
): boolean =>
  moved.length === from.length &&
  from.every((each, at) => Math.abs((moved[at] ?? NaN) - (each + by)) < 1e-9);

/** Whether one shape is the other drawn again this far across and down. */
function isCopyOf(copy: Shape, home: Shape, across: number, down: number) {
  return (
    copy.kind === home.kind &&
    copy.style === home.style &&
    shiftedBy(copy.sizes, home.sizes, 0) &&
    shiftedBy(copy.xs, home.xs, across) &&
    shiftedBy(copy.ys, home.ys, down)
  );
}

/** Every shape that shares an identity, which is where a twin can be found. */
function byIdentity(shapes: Shape[]): Map<string, Shape[]> {
  const found = new Map<string, Shape[]>();
  for (const shape of shapes) {
    const same = found.get(identity(shape));
    if (same === undefined) found.set(identity(shape), [shape]);
    else same.push(shape);
  }
  return found;
}

/** What two copies of one shape share wherever they are drawn. */
const lookOf = (shape: Shape): string =>
  `${shape.kind} ${shape.sizes.join(',')} ${shape.style}`;

/**
 * Keeps each shape that is not a copy of one already kept, at any of these
 * offsets across and down.
 */
function keepingFirstOf(
  shapes: Shape[],
  offsets: readonly (readonly [number, number])[],
): Shape[] {
  const kept = new Map<string, Shape[]>();
  return shapes.filter((shape) => {
    const same = kept.get(lookOf(shape)) ?? [];
    const copy = same.some((home) =>
      offsets.some(([across, down]) => isCopyOf(shape, home, across, down)),
    );
    if (!copy) kept.set(lookOf(shape), [...same, shape]);
    return !copy;
  });
}

/** The ways a wrapped copy can sit from the shape it repeats. */
function wrapOffsets(field: Field): [number, number][] {
  const offsets: [number, number][] = [];
  for (const across of [-field.width, 0, field.width]) {
    for (const down of [-field.height, 0, field.height]) {
      if (across !== 0 || down !== 0) offsets.push([across, down]);
    }
  }
  return offsets;
}

/**
 * The shapes the painters placed, with the wrapped repeats left out. A repeat
 * is the same drawing a field height away from one already placed, a field
 * width away across the sides, or both at a corner.
 */
function homes(shapes: Shape[], field: Field): Shape[] {
  return keepingFirstOf(shapes, wrapOffsets(field));
}

/**
 * The shapes with every copy across the sides left out: what the painters drew
 * before the ground learned to wrap across them.
 */
function withoutSideCopies(shapes: Shape[], field: Field): Shape[] {
  return keepingFirstOf(
    shapes,
    wrapOffsets(field).filter(([across]) => across !== 0),
  );
}

/** The kinds in the order they were drawn, each with how many ran together. */
function blocks(shapes: Shape[]): [string, number][] {
  const runs: [string, number][] = [];
  for (const shape of shapes) {
    const last = runs[runs.length - 1];
    if (last !== undefined && last[0] === shape.kind) last[1] += 1;
    else runs.push([shape.kind, 1]);
  }
  return runs;
}

describe('the ground painted from the prototype (design record R4)', () => {
  it("the ground's colours are the prototype's", () => {
    // Mark's ruling of 2026-09-21: the prototype's ground goes on the whole
    // field, every colour of it unchanged. The hexes below are read off build
    // 7's own COLOR table (index.html:308-326), so a row moving in the palette
    // turns this red rather than quietly repainting the field.
    const ground = {
      groundNight: 0x454f5d,
      groundSpeckle: 0x66748a,
      groundCold: 0x56657a,
      groundWet: 0x466050,
      groundDamp: 0x2c3644,
      groundCrack: 0x28313d,
      groundGravel: 0x8d9cae,
      // The tufts are the prototype's own COLOR.moss and COLOR.mossDark, which
      // slice 6 declared for the grass hanging in over the lip.
      graveTurf: 0x6e8a58,
      graveTurfDark: 0x4a6040,
    };
    const declared = new Set(
      Object.entries(ground).map(([name, hex]) => {
        expect(`${name} ${PALETTE[name as keyof typeof PALETTE].hex}`).toBe(
          `${name} ${hex}`,
        );
        return hex;
      }),
    );
    const drawn = new Set(painted().map((shape) => shape.colour));
    expect([...drawn].filter((colour) => !declared.has(colour))).toEqual([]);
  });

  it('the ground is painted the same way every time', () => {
    // One seeded stream in the prototype's own order, so the field is the same
    // picture on every device and in every replay of a pinned tape.
    const first = painted().map(asText);
    const second = painted().map(asText);
    expect(first.length).toBeGreaterThan(0);
    expect(second).toEqual(first);
  });

  it("the ground carries the prototype's own counts", () => {
    // Every count is build 7's paintGround, block by block and in its order:
    // the base fill, the wide patches, the small mottles, the cracks of three
    // segments, the grain, the tufts of five blades, and the gravel.
    const placed = homes(painted(), FIELD);
    const patches = GROUND_PAINTING.widePatches;
    expect(blocks(placed)).toEqual([
      ['rect', 1],
      ['ellipse', patches + GROUND_PAINTING.mottles],
      ['moveTo+lineTo', GROUND_PAINTING.cracks * GROUND_PAINTING.crackSegments],
      ['circle', GROUND_PAINTING.grainFlecks],
      [
        'moveTo+quadraticCurveTo',
        GROUND_PAINTING.tufts * GROUND_PAINTING.tuftBlades,
      ],
      ['circle', GROUND_PAINTING.gravelSpecks],
    ]);
    expect([patches, GROUND_PAINTING.mottles]).toEqual([54, 520]);
    expect([
      GROUND_PAINTING.cracks * GROUND_PAINTING.crackSegments,
      GROUND_PAINTING.grainFlecks,
      GROUND_PAINTING.tufts * GROUND_PAINTING.tuftBlades,
      GROUND_PAINTING.gravelSpecks,
    ]).toEqual([210, 2600, 1150, 180]);

    // The two ellipse runs are one block of calls, so the split between them is
    // read off the brush: a wide patch is 22 units across at its narrowest
    // (lerp(22, 96)) and a mottle is under that (lerp(4, 22)).
    const ellipses = placed.filter((shape) => shape.kind === 'ellipse');
    const wide = ellipses.slice(0, patches);
    const small = ellipses.slice(patches);
    expect(wide.filter((shape) => (shape.across[1] ?? 0) >= 22)).toHaveLength(
      patches,
    );
    expect(small.filter((shape) => (shape.across[1] ?? 0) < 22)).toHaveLength(
      GROUND_PAINTING.mottles,
    );
  });

  it('the base fill covers the whole field and nothing draws outside it', () => {
    // The first call is the field itself in the base earth, and every shape
    // after it is placed on that base: a patch, a fleck and a speck by its own
    // centre, and a crack or a blade within the reach of the prototype's own
    // brush (a crack steps 13 by 9 three times, a blade scatters 4 by 3 from
    // its tuft and rises 6).
    const placed = homes(painted(), FIELD);
    const base = placed[0];
    expect(base?.kind).toBe('rect');
    expect(base?.colour).toBe(PALETTE.groundNight.hex);
    expect(base?.left).toBeLessThanOrEqual(0);
    expect(base?.top).toBeLessThanOrEqual(0);
    expect(base?.right).toBeGreaterThanOrEqual(FIELD.width);
    expect(base?.bottom).toBeGreaterThanOrEqual(FIELD.height);

    const centred = placed
      .slice(1)
      .filter((shape) => shape.kind === 'ellipse' || shape.kind === 'circle');
    expect(centred.length).toBeGreaterThan(0);
    const strayed = centred.filter((shape) => {
      const x = shape.across[0] ?? NaN;
      const y =
        shape.ys.length === 2
          ? ((shape.ys[0] ?? 0) + (shape.ys[1] ?? 0)) / 2
          : NaN;
      return x < 0 || x > FIELD.width || y < 0 || y > FIELD.height;
    });
    expect(strayed).toEqual([]);

    const reach: Record<string, { across: number; down: number }> = {
      'moveTo+lineTo': { across: 39, down: 27 },
      'moveTo+quadraticCurveTo': { across: 4, down: 6 },
    };
    const loose = placed.slice(1).flatMap((shape) => {
      const bound = reach[shape.kind];
      if (bound === undefined) return [];
      const inside =
        shape.left >= -bound.across &&
        shape.right <= FIELD.width + bound.across &&
        shape.top >= -bound.down &&
        shape.bottom <= FIELD.height + bound.down;
      return inside ? [] : [asText(shape)];
    });
    expect(loose).toEqual([]);
  });

  it('the base earth reaches past every edge, so the join carries no seam', () => {
    // The bake crops the picture to the field's own rectangle, and an edge
    // inside that crop is antialiased against nothing: half-covered pixels.
    // Tiled, the top row of half-cover meets the bottom row of half-cover and
    // draws a dark line across the field every 1200 ticks, which the rendered
    // check at slice 8 measured at 61.3 against the ground's 70. So the base
    // earth is painted past every edge and the frame cuts it instead.
    const base = homes(painted(), FIELD)[0];
    const margin = GROUND_PAINTING.baseOverflow;
    expect(margin).toBeGreaterThan(0);
    expect(base?.kind).toBe('rect');
    expect([base?.left, base?.top, base?.right, base?.bottom]).toEqual([
      -margin,
      -margin,
      FIELD.width + margin,
      FIELD.height + margin,
    ]);
  });

  it("the ground's picture meets itself at the top and bottom edges", () => {
    // The prototype paints one still field and never moves it; the game's
    // ground runs down the screen at GROUND_SPEED, so the baked picture is
    // shown over and over and has to join itself. A shape whose extent leaves
    // an edge is painted again a field height away, which is the join.
    const shapes = painted();
    const found = byIdentity(shapes);
    const placed = homes(shapes, FIELD);
    const crossing = placed.filter(
      (shape) =>
        shape !== placed[0] && (shape.top < 0 || shape.bottom > FIELD.height),
    );
    expect(crossing.length).toBeGreaterThan(0);
    const unmet = crossing.filter((home) => {
      const away = home.top < 0 ? FIELD.height : -FIELD.height;
      const same = found.get(identity(home)) ?? [];
      return !same.some((twin) => isTwinOf(twin, home, away));
    });
    expect(unmet.map(asText)).toEqual([]);
  });

  it('the ground grows no denser and no sparser with the view', () => {
    // The view buys texture pixels and never shapes: a sharper phone bakes the
    // same picture at a higher resolution, so the ground a player reads is the
    // same ground on every device.
    const sharp = groundResolution(0.7222, 3, FIELD);
    const soft = groundResolution(0.7222, 1, FIELD);
    expect(sharp).not.toBe(soft);
    expect(painted().map(asText)).toEqual(painted().map(asText));
  });

  it('the ground asks for more texture pixels on a sharper phone, up to the cap', () => {
    // The prototype's own choice: the view's CSS pixels per field unit times
    // the device pixel ratio, held between 1 and 3 and never asking for a
    // texture wider or taller than the smallest a phone is sure to allow.
    const phone = 390 / VIEW_WIDTH;
    expect(groundResolution(phone, 1, FIELD)).toBeCloseTo(1, 6);
    expect(groundResolution(phone, 2, FIELD)).toBeCloseTo(phone * 2, 6);
    expect(groundResolution(phone, 3, FIELD)).toBeCloseTo(phone * 3, 6);
    expect(groundResolution(phone, 8, FIELD)).toBeCloseTo(
      GROUND_PAINTING.resolution.max,
      6,
    );

    // A field tall enough that the cap, and not the clamp, is what answers.
    const tall: Field = { width: VIEW_WIDTH, height: 2000 };
    expect(groundResolution(phone, 8, tall)).toBeCloseTo(
      GROUND_PAINTING.maxTexturePixels / tall.height,
      6,
    );
  });
});

describe('the ground under the tilted camera (tilted view A9)', () => {
  /** A blade is the one shape a moveTo and a curve make. */
  const isBlade = (shape: Shape): boolean =>
    shape.kind === 'moveTo+quadraticCurveTo';

  it('at a blade reach of one the ground is painted exactly as before, call for call', () => {
    // R8's port is a ruled look, so the tilt adds to it and changes nothing
    // (A9). The hash is of the painter's whole call log on the tree before this
    // slice (1b728db1d3), one line per call written as name(JSON arguments):
    // 10855 calls. The side wrap is new, so its copies are left out here and
    // the next tests hold them.
    const log = withoutSideCopies(painted(FIELD, 1), FIELD).flatMap(
      (shape) => shape.calls,
    );
    expect(log).toHaveLength(10855);
    expect(createHash('sha256').update(log.join('\n')).digest('hex')).toBe(
      '26723213549924cb57e385b03c51a06bd8c4b8c49e7fb9b1e7bbc09d36095efb',
    );
  });

  it('at a blade reach of 1.3485 every blade is that many times as long and nothing else moves', () => {
    // A blade leans back 62 degrees off the vertical, so a camera tilted 32.5
    // degrees shows 1.3485 times what build 7's showed (A9, the prototype's
    // `const up = lerp(2.4, 6, random()) * reach`, index.html:1910-1916). The
    // stream is untouched, so every other shape and every blade's root and
    // sway stay where they were.
    const reach = 1.3485;
    const before = homes(painted(FIELD, 1), FIELD);
    const after = homes(painted(FIELD, reach), FIELD);
    expect(after).toHaveLength(before.length);
    const moved = before.flatMap((was, at) => {
      const now = after[at];
      if (now === undefined) return [`${at} missing`];
      if (!isBlade(was))
        return asText(now) === asText(was) ? [] : [asText(now)];
      const root = was.ys[0] ?? NaN;
      const grown = was.ys.map((y) => root + (y - root) * reach);
      const same =
        identity(now) === identity(was) &&
        now.ys.every((y, index) => Math.abs(y - (grown[index] ?? NaN)) < 1e-9);
      return same ? [] : [asText(now)];
    });
    expect(moved).toEqual([]);
    expect(before.filter(isBlade)).toHaveLength(
      GROUND_PAINTING.tufts * GROUND_PAINTING.tuftBlades,
    );
  });

  it('a shape crossing the left or right edge is painted again a field width away, so the picture meets itself across its sides', () => {
    // The camera sees ground from -58.4 to 598.4 across its far row, wider
    // than the 540 the picture is painted on, so the mesh samples it repeating
    // across as well as down, and a shape cut by a side edge has to carry on
    // across the join (A9, the addition R8 was given for the vertical wrap).
    const shapes = painted();
    const placed = homes(shapes, FIELD).slice(1);
    const crossing = placed.filter(
      (shape) => shape.left < 0 || shape.right > FIELD.width,
    );
    expect(crossing.length).toBeGreaterThan(0);
    const unmet = crossing.filter((home) => {
      const across = home.left < 0 ? FIELD.width : -FIELD.width;
      return !shapes.some((copy) => isCopyOf(copy, home, across, 0));
    });
    expect(unmet.map(asText)).toEqual([]);
  });

  it('a shape crossing a corner is painted four times', () => {
    // Across a side and across the top or bottom at once, so the join meets
    // itself at the corner as well: the shape, its side copy, its copy down
    // the field, and the copy across both. The game's picture happens to put
    // nothing across a corner, so a small field, where most shapes cross one,
    // is what can show the rule.
    const small: Field = { width: 40, height: 40 };
    const shapes = painted(small);
    const placed = homes(shapes, small).slice(1);
    const cornered = placed.filter(
      (shape) =>
        (shape.left < 0 || shape.right > small.width) &&
        (shape.top < 0 || shape.bottom > small.height),
    );
    expect(cornered.length).toBeGreaterThan(0);
    const counts = cornered.map((home) => {
      const across = home.left < 0 ? small.width : -small.width;
      const down = home.top < 0 ? small.height : -small.height;
      const drawn = [
        [0, 0],
        [across, 0],
        [0, down],
        [across, down],
      ].filter(([dx, dy]) =>
        shapes.some((copy) => isCopyOf(copy, home, dx ?? NaN, dy ?? NaN)),
      ).length;
      return `${asText(home)} ${drawn}`;
    });
    expect(counts.filter((line) => !line.endsWith(' 4'))).toEqual([]);
  });
});
