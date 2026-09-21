/**
 * The first field content on screen. Render only: it reads a Grave and draws
 * it, and holds no rules.
 */

import type { Container, ICanvas, Renderer } from 'pixi.js';
import { BrowserAdapter, DOMAdapter, Graphics } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';
import type { Grave } from '../../../../game/grave';
import { createGrave, graveHitbox, graveWidth } from '../../../../game/grave';
import { SIZE_CEILING, SIZE_FLOOR, SIZE_START } from '../../../../game/tuning';
import { BAKE_PADDING } from '../graveDrawingValues';
import { glowAlpha, GRAVE_RIM_STROKE, GraveRenderer } from '../GraveRenderer';
import { FieldLayers } from '../layering';

/** The three sizes the grave's art is judged at (design record R4). */
const EVERY_SIZE = [SIZE_FLOOR, SIZE_START, SIZE_CEILING];

/**
 * The mouth layer's three children, in the order the hole is read from the
 * ground down: the baked pit, the place a fall draws, and the baked lip over
 * the top of it all.
 */
const THE_PIT = 0;
const THE_FALLS = 1;
const THE_LIP = 2;
const MOUTH_CHILDREN = 3;

/**
 * Every canvas the renderer asks the browser for. A bake is two of them, the
 * pit's and the lip's, so the count is how many times the hole was baked.
 */
const canvasesMade: { width: number; height: number }[] = [];

/** A 2D context that paints nothing: the painters' own tests read what they draw. */
const silentContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  setTransform: () => undefined,
  beginPath: () => undefined,
  closePath: () => undefined,
  moveTo: () => undefined,
  lineTo: () => undefined,
  quadraticCurveTo: () => undefined,
  ellipse: () => undefined,
  fillRect: () => undefined,
  fill: () => undefined,
  stroke: () => undefined,
  clip: () => undefined,
  save: () => undefined,
  restore: () => undefined,
  createLinearGradient: () => ({ addColorStop: () => undefined }),
};

DOMAdapter.set({
  ...BrowserAdapter,
  createCanvas: (width = 0, height = 0) => {
    const canvas = { width, height, getContext: () => silentContext };
    canvasesMade.push(canvas);
    return canvas as unknown as ICanvas;
  },
});

/**
 * The renderer as the grave reads it on a phone: 390 CSS pixels showing a
 * stage 540 units wide. Only the two readings the bake takes are given.
 */
const PHONE = {
  screen: { width: 540 },
  canvas: { getBoundingClientRect: () => ({ width: 390 }) },
} as unknown as Renderer;

function grave(size: number, x = 270, y = 600): Grave {
  return { x, y, size, invulnerable: 0, scoreRungBled: false };
}

function attached(): { layers: FieldLayers; renderer: GraveRenderer } {
  const layers = new FieldLayers();
  const renderer = new GraveRenderer();
  renderer.attach(layers);
  return { layers, renderer };
}

function pieceOf(layers: FieldLayers, at: number): Container {
  const piece = layers.layer('graveMouth').children[at];
  if (piece === undefined) throw new Error(`no mouth child at ${at}`);
  return piece;
}

function glowOf(layers: FieldLayers): Graphics {
  return layers.layer('graveRim').children[0] as Graphics;
}

function arcOf(layers: FieldLayers): Graphics {
  return layers.layer('graveRim').children[1] as Graphics;
}

/** Every piece under a container, however deep. */
function everyPieceUnder(parent: Container): Container[] {
  return parent.children.flatMap((child) => [child, ...everyPieceUnder(child)]);
}

/** One frame drawn: what the renderer's own pass would hand the grave's art. */
function drawn(layers: FieldLayers): void {
  pieceOf(layers, THE_PIT).onRender?.(PHONE);
}

/** The grave synced and then drawn, which is one frame of play. */
function frame(
  layers: FieldLayers,
  renderer: GraveRenderer,
  at: Grave,
  fullness = 0,
  charge = 0,
): void {
  renderer.sync(at, fullness, 0, charge);
  drawn(layers);
}

describe('GraveRenderer', () => {
  it('the baked hole lands in the graveMouth layer and the glow and the arc in the graveRim layer (ADR 0014)', () => {
    // The hole's art sits under whatever is falling into it, and the glow and
    // Territory's arc stay legible over the food on the band they ride.
    const { layers } = attached();
    expect(layers.layer('graveMouth').children).toHaveLength(MOUTH_CHILDREN);
    expect(layers.layer('graveRim').children).toHaveLength(2);
  });

  it('the mouth stays a hole at SIZE_FLOOR', () => {
    // The glow and the arc ride a band GRAVE_RIM_STROKE wide inside the
    // hitbox, so a floor grave keeps a mouth between the two sides of it.
    //
    // The mouth does not bind the power-up: ADR 0003 rules that size never gates a
    // swallow, and the power-up's own bounds live in FieldRenderer.test.ts
    // (docs/design/drop-legibility-fix.md carries the supersession).
    const interior = graveWidth(SIZE_FLOOR) - 2 * GRAVE_RIM_STROKE;
    expect(interior).toBeGreaterThan(0);
    expect(2 * GRAVE_RIM_STROKE).toBeLessThan(graveWidth(SIZE_FLOOR));
  });

  it('nothing pale is drawn round the opening at rest', () => {
    // Slice 6: the prototype has no rim, because a bright ring round an
    // opening reads as a kerb the hole was set into rather than as dug earth.
    // With the reservoir empty and no charge, nothing in the rim's layer shows
    // and the mouth's layer holds only the baked art and the falls. A rim put
    // back, in either layer, fails here.
    const { layers, renderer } = attached();
    for (const size of EVERY_SIZE) {
      frame(layers, renderer, grave(size), 0, 0);
      const showing = layers
        .layer('graveRim')
        .children.filter(
          (piece) => piece.alpha > 0 && piece.getLocalBounds().width > 0,
        );
      expect(`${size} ${showing.length}`).toBe(`${size} 0`);
      const vectors = everyPieceUnder(layers.layer('graveMouth')).filter(
        (piece) => piece instanceof Graphics,
      );
      expect(`${size} ${vectors.length}`).toBe(`${size} 0`);
    }
  });

  it("the reservoir's glow and Territory's arc still show", () => {
    // The rim went, and the two jobs it carried did not: a full reservoir
    // lights the band and half a charge traces half of it.
    const { layers, renderer } = attached();
    for (const size of EVERY_SIZE) {
      frame(layers, renderer, grave(size), 1, 0.5);
      const glow = glowOf(layers);
      const arc = arcOf(layers);
      expect(`${size} ${glow.alpha > 0.5}`).toBe(`${size} true`);
      expect(`${size} ${glow.getLocalBounds().width > 0}`).toBe(`${size} true`);
      expect(`${size} ${arc.getLocalBounds().width > 0}`).toBe(`${size} true`);
    }
  });

  it('position follows grave.x and grave.y', () => {
    const { layers, renderer } = attached();
    frame(layers, renderer, grave(SIZE_START, 123, 456));
    const pieces = [
      pieceOf(layers, THE_PIT),
      pieceOf(layers, THE_LIP),
      glowOf(layers),
      arcOf(layers),
    ];
    for (const piece of pieces) {
      expect(piece.position.x).toBe(123);
      expect(piece.position.y).toBe(456);
    }
  });

  it('the grave is repainted when its size changes, and a size that has not changed does not repaint', () => {
    // The prototype bakes the hole afresh at each size (rebuildHole), because
    // several of its details are screen pixels wide and must not scale with
    // the grave. It bakes again once the size has moved past its step, and a
    // move or a charge alone never bakes.
    const { layers, renderer } = attached();
    frame(layers, renderer, grave(27));
    const baked = canvasesMade.length;

    frame(layers, renderer, grave(27, 300, 400), 0.5, 0.5);
    frame(layers, renderer, grave(27.3, 300, 400));
    expect(canvasesMade.length).toBe(baked);

    frame(layers, renderer, grave(33, 300, 400));
    expect(canvasesMade.length).toBe(baked + 2);
  });

  it('the baked hole is centred on the grave, sized to it with the prototype padding round it', () => {
    // bakeLayer's own geometry: a canvas the grave's width and length plus a
    // pad on every side, anchored at its middle on the grave's origin.
    const { layers, renderer } = attached();
    for (const size of EVERY_SIZE) {
      const at = grave(size);
      frame(layers, renderer, at);
      const box = graveHitbox(at);
      const pad = {
        pit: graveWidth(size) * BAKE_PADDING.pit,
        lip: graveWidth(size) * BAKE_PADDING.lip,
      };
      for (const [piece, reach] of [
        [THE_PIT, pad.pit],
        [THE_LIP, pad.lip],
      ] as const) {
        const bounds = pieceOf(layers, piece).getBounds();
        expect(bounds.x).toBeCloseTo(box.x - reach, 6);
        expect(bounds.y).toBeCloseTo(box.y - reach, 6);
        expect(bounds.width).toBeCloseTo(box.width + reach * 2, 6);
        expect(bounds.height).toBeCloseTo(box.height + reach * 2, 6);
      }
    }
  });

  it('bakes at the pixels the phone shows, the view times the device pixel ratio', () => {
    // The prototype's own choice: the view's CSS pixels per field unit times
    // the device pixel ratio, held between one and six. At device scale 3 on a
    // 390-wide phone that is about 2.17 texture pixels a unit.
    vi.stubGlobal('devicePixelRatio', 3);
    const { layers, renderer } = attached();
    const before = canvasesMade.length;
    frame(layers, renderer, grave(SIZE_START));
    const pit = canvasesMade[before];
    vi.unstubAllGlobals();
    const wanted = (390 / 540) * 3;
    const side =
      graveWidth(SIZE_START) / 2 + graveWidth(SIZE_START) * BAKE_PADDING.pit;
    expect(pit?.width).toBe(Math.ceil(side * 2 * wanted));
  });

  it('a same-size sync redraws no rim stroke', () => {
    // The glow and the arc keep a fixed stroke in field units, so they are
    // redrawn on a size change and never on a move.
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START), 0, 0, 0);
    const redrawn = [glowOf(layers), arcOf(layers)].map((piece) =>
      vi.spyOn(piece, 'clear'),
    );

    renderer.sync(grave(SIZE_START, 300, 400), 0, 0, 0);
    for (const spy of redrawn) expect(spy).not.toHaveBeenCalled();

    renderer.sync(grave(SIZE_START + 3, 300, 400), 0, 0, 0);
    for (const spy of redrawn) expect(spy).toHaveBeenCalled();
  });

  it("draws the glow at the rim's own geometry, so a charged grave is not a wider grave (ADR 0003)", () => {
    // The outer edge is the health bar and a player reads it as what they pass
    // under. A glow standing outside the hitbox would make the grave read
    // wider than the box.
    const { layers, renderer } = attached();
    const at = grave(SIZE_START);
    renderer.sync(at, 1, 0, 0);
    const box = graveHitbox(at);
    const glow = glowOf(layers).getBounds();
    expect(glow.x).toBeCloseTo(box.x, 9);
    expect(glow.y).toBeCloseTo(box.y, 9);
    expect(glow.width).toBeCloseTo(box.width, 9);
    expect(glow.height).toBeCloseTo(box.height, 9);
  });

  it('detach then attach puts both pieces back, which FieldLayers.clear() between runs requires', () => {
    const { layers, renderer } = attached();
    renderer.detach();
    expect(layers.layer('graveMouth').children).toHaveLength(0);
    expect(layers.layer('graveRim').children).toHaveLength(0);

    layers.clear();
    renderer.attach(layers);
    expect(layers.layer('graveMouth').children).toHaveLength(MOUTH_CHILDREN);
    expect(layers.layer('graveRim').children).toHaveLength(2);
  });
});

describe('the hole cut in the ground (grave-in-the-ground R4)', () => {
  it('the mouth layer holds the pit, the place for falls and the lip, in that order', () => {
    // The prototype's own order (rebuildHole's two bakes with the bodies
    // between them), and it is what fixes "between the cut and the turf" (R5)
    // in one place: a falling body draws over the walls it is falling past and
    // under the grass hanging over the lip.
    const { layers, renderer } = attached();
    frame(layers, renderer, grave(SIZE_START));
    const mouth = layers.layer('graveMouth').children;

    expect(mouth).toHaveLength(MOUTH_CHILDREN);
    expect(mouth[THE_FALLS]).toBe(renderer.falls);
    // The lip carries the margin outside the edge, so it reaches wider than the pit.
    expect(pieceOf(layers, THE_LIP).getBounds().width).toBeGreaterThan(
      pieceOf(layers, THE_PIT).getBounds().width,
    );
  });

  it('the place for falls follows the grave and is never scaled', () => {
    // A fall holds its place in the grave's own proportions and multiplies by
    // the size itself (R5), so a container scaled here would apply the size
    // twice and a feast would start its fall in mid-hole.
    const { renderer } = attached();
    for (const size of EVERY_SIZE) {
      renderer.sync(grave(size, 111, 222), 0, 0, 0);
      expect(`${size} ${renderer.falls.position.x}`).toBe(`${size} 111`);
      expect(`${size} ${renderer.falls.position.y}`).toBe(`${size} 222`);
      expect(`${size} ${renderer.falls.scale.x}`).toBe(`${size} 1`);
      expect(`${size} ${renderer.falls.scale.y}`).toBe(`${size} 1`);
    }
  });

  it('the glow and the arc are the two children of graveRim, and the arc never leaves the hitbox', () => {
    // The reservoir's glow and Territory's charge arc each keep the job they
    // did on the rim's band, and they still ride one geometry rather than
    // growing a shape of their own.
    const { layers, renderer } = attached();
    for (const size of EVERY_SIZE) {
      const at = grave(size);
      renderer.sync(at, 1, 0, 1);
      expect(layers.layer('graveRim').children).toEqual([
        glowOf(layers),
        arcOf(layers),
      ]);

      const box = graveHitbox(at);
      const arc = arcOf(layers).getBounds();
      expect(`${size} ${arc.x >= box.x - 1e-6}`).toBe(`${size} true`);
      expect(`${size} ${arc.y >= box.y - 1e-6}`).toBe(`${size} true`);
      expect(`${size} ${arc.x + arc.width <= box.x + box.width + 1e-6}`).toBe(
        `${size} true`,
      );
      expect(`${size} ${arc.y + arc.height <= box.y + box.height + 1e-6}`).toBe(
        `${size} true`,
      );
    }
  });
});

describe("the reservoir's diegetic tell (plan 6.18)", () => {
  it('builds the glow with fullness, so an empty reservoir shows nothing', () => {
    expect(glowAlpha(0, 0)).toBe(0);
    expect(glowAlpha(0.5, 0)).toBeCloseTo(0.5, 6);
    expect(glowAlpha(0.9, 0)).toBeCloseTo(0.9, 6);
  });

  it('pulses at full rather than simply reaching the top of the ramp', () => {
    // Two tells rather than one is deliberate: the button is where the thumb
    // is and the glow is where the eyes are, and a player mid-dodge is looking
    // at the grave. Pulsing is what makes full a state and not a maximum.
    const across = [];
    for (let tick = 0; tick < 60; tick++) across.push(glowAlpha(1, tick));
    expect(new Set(across).size).toBeGreaterThan(1);
    expect(Math.max(...across)).toBeLessThanOrEqual(1);
    expect(Math.min(...across)).toBeGreaterThan(glowAlpha(0.5, 0));
  });

  it('clamps a fullness outside zero to one rather than trusting the caller', () => {
    expect(glowAlpha(-1, 0)).toBe(0);
    expect(glowAlpha(2, 0)).toBeLessThanOrEqual(1);
  });

  it('takes a number and never the run state', () => {
    // Handing a renderer live sim state is the thing the rest of this design
    // works to avoid, and fullness is everything the glow needs.
    const layers = new FieldLayers();
    const renderer = new GraveRenderer();
    renderer.attach(layers);
    expect(() => renderer.sync(createGrave(27), 1, 10, 0)).not.toThrow();
  });
});

describe("Territory's charge arc (#76)", () => {
  it('zero charge draws nothing', () => {
    // The arc empties on the lay, so an empty charge is an empty band rather
    // than a full band at zero alpha a screenshot could still measure.
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START), 0, 0, 0);
    expect(arcOf(layers).getLocalBounds().width).toBe(0);
  });

  it('a partial charge traces part of the rim and a fuller one traces more', () => {
    // The trace runs clockwise from top-centre, so half a charge reaches the
    // bottom-centre: the whole right side and neither left corner.
    // The bounds rectangle is copied field by field: pixi hands back a reused
    // instance that the next sync mutates in place.
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START), 0, 0, 0.5);
    const half = arcOf(layers).getLocalBounds();
    const halfWidth = half.width;
    expect(half.height).toBeGreaterThan(0);
    expect(halfWidth).toBeGreaterThan(graveWidth(SIZE_START) * 0.3);
    expect(halfWidth).toBeLessThan(graveWidth(SIZE_START) * 0.75);

    renderer.sync(grave(SIZE_START), 0, 0, 1);
    const fullWidth = arcOf(layers).getLocalBounds().width;
    expect(fullWidth).toBeGreaterThan(halfWidth);
  });

  it('a full charge traces the whole rim, its outer edge never outside the hitbox', () => {
    // ADR 0003 makes the drawn grave the health bar, so the visible outer
    // edge has to equal the hitbox at every size and every charge.
    const { layers, renderer } = attached();
    for (const size of [SIZE_FLOOR, SIZE_START, SIZE_CEILING]) {
      renderer.sync(grave(size), 0, 0, 1);
      const bounds = arcOf(layers).getLocalBounds();
      expect(bounds.width).toBeLessThanOrEqual(graveWidth(size) + 1e-6);
      expect(bounds.height).toBeLessThanOrEqual(size * 2 + 1e-6);
      expect(bounds.width).toBeGreaterThan(graveWidth(size) * 0.9);
      expect(bounds.height).toBeGreaterThan(size * 2 * 0.9);
    }
  });
});
