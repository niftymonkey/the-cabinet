/**
 * The first field content on screen. Render only: it reads a Grave and draws
 * it, and holds no rules.
 */

import type { Container, ICanvas, Renderer } from 'pixi.js';
import { BrowserAdapter, DOMAdapter, Graphics } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';
import type { Grave } from '../../../../game/grave';
import { graveHitbox, graveWidth } from '../../../../game/grave';
import { SIZE_CEILING, SIZE_FLOOR, SIZE_START } from '../../../../game/tuning';
import { BAKE_PADDING } from '../graveDrawingValues';
import { GraveRenderer } from '../GraveRenderer';
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
  return { x, y, size, invulnerable: 0, owed: 0, scoreRungBled: false };
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

/** Every piece under a container, however deep. */
function everyPieceUnder(parent: Container): Container[] {
  return parent.children.flatMap((child) => [child, ...everyPieceUnder(child)]);
}

/** One frame drawn: what the renderer's own pass would hand the grave's art. */
function drawn(layers: FieldLayers): void {
  pieceOf(layers, THE_PIT).onRender?.(PHONE);
}

/** The grave synced and then drawn, which is one frame of play. */
function frame(layers: FieldLayers, renderer: GraveRenderer, at: Grave): void {
  renderer.sync(at);
  drawn(layers);
}

describe('GraveRenderer', () => {
  it('the baked hole lands in the graveMouth layer and nothing at all in the graveRim layer (ADR 0014)', () => {
    // The hole's art sits under whatever is falling into it, and nothing of the
    // grave's rides above the food any more.
    const { layers } = attached();
    expect(layers.layer('graveMouth').children).toHaveLength(MOUTH_CHILDREN);
    expect(layers.layer('graveRim').children).toHaveLength(0);
  });

  it('nothing pale is drawn round the opening at rest', () => {
    // Slice 6: the prototype has no rim, because a bright ring round an
    // opening reads as a kerb the hole was set into rather than as dug earth.
    // Nothing in the rim's layer shows and the mouth's layer holds only the
    // baked art and the falls. A rim put back, in either layer, fails here.
    const { layers, renderer } = attached();
    for (const size of EVERY_SIZE) {
      frame(layers, renderer, grave(size));
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

  it("Territory's charge is not drawn on the grave", () => {
    // Mark, 2026-09-21: the charge traced round the band read wrong on the
    // prototype's grave and came off until it is redesigned. The grave takes no
    // charge at all, and it takes no reservoir and no tick either: the sync
    // reads the grave and nothing else.
    const { layers, renderer } = attached();
    expect(renderer.sync.length).toBe(1);
    frame(layers, renderer, grave(SIZE_START));
    expect(layers.layer('graveRim').children).toEqual([]);
  });

  it('position follows grave.x and grave.y', () => {
    const { layers, renderer } = attached();
    frame(layers, renderer, grave(SIZE_START, 123, 456));
    const pieces = [pieceOf(layers, THE_PIT), pieceOf(layers, THE_LIP)];
    for (const piece of pieces) {
      expect(piece.position.x).toBe(123);
      expect(piece.position.y).toBe(456);
    }
  });

  it('the grave is repainted when its size changes, and a size that has not changed does not repaint', () => {
    // The prototype bakes the hole afresh at each size (rebuildHole), because
    // several of its details are screen pixels wide and must not scale with
    // the grave. It bakes again once the size has moved past its step, and a
    // move or a fuller reservoir alone never bakes.
    const { layers, renderer } = attached();
    frame(layers, renderer, grave(27));
    const baked = canvasesMade.length;

    frame(layers, renderer, grave(27, 300, 400));
    frame(layers, renderer, grave(27.3, 300, 400));
    expect(canvasesMade.length).toBe(baked);

    frame(layers, renderer, grave(33, 300, 400));
    expect(canvasesMade.length).toBe(baked + 2);
  });

  it('the drawn grave grows with every swallow, not only when it is repainted', () => {
    // Mark, 2026-09-21: the grave must grow gradually as it eats. A repaint
    // waits for the size to move past its step, so between repaints the baked
    // art is stretched to the size the sim says, and never waits at the old one.
    const { layers, renderer } = attached();
    frame(layers, renderer, grave(27));
    for (const size of [27.1, 27.2, 27.3]) {
      const at = grave(size);
      frame(layers, renderer, at);
      const box = graveHitbox(at);
      const reach = graveWidth(size) * BAKE_PADDING.pit;
      const bounds = pieceOf(layers, THE_PIT).getBounds();
      expect(bounds.height).toBeCloseTo(box.height + reach * 2, 6);
      expect(bounds.width).toBeCloseTo(box.width + reach * 2, 6);
    }
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

  it('detach then attach puts both pieces back, which FieldLayers.clear() between runs requires', () => {
    const { layers, renderer } = attached();
    renderer.detach();
    expect(layers.layer('graveMouth').children).toHaveLength(0);
    expect(layers.layer('graveRim').children).toHaveLength(0);

    layers.clear();
    renderer.attach(layers);
    expect(layers.layer('graveMouth').children).toHaveLength(MOUTH_CHILDREN);
    expect(layers.layer('graveRim').children).toHaveLength(0);
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
      renderer.sync(grave(size, 111, 222));
      expect(`${size} ${renderer.falls.position.x}`).toBe(`${size} 111`);
      expect(`${size} ${renderer.falls.position.y}`).toBe(`${size} 222`);
      expect(`${size} ${renderer.falls.scale.x}`).toBe(`${size} 1`);
      expect(`${size} ${renderer.falls.scale.y}`).toBe(`${size} 1`);
    }
  });
});

describe("the blinking border is gone (Mark's ruling of 2026-09-21)", () => {
  it('the grave puts nothing in the graveRim layer, so no glow comes back', () => {
    // Mark, 2026-09-21: "now occasionally you do this weird blinking border.
    // That also needs to go. I don't even know what that's for ... we already
    // have a different indicator that shows when the belch is full so let's get
    // rid of that blinky border." The deliberate absence, guarded: the belch
    // button is the only thing that says the belch is loaded, and a band put
    // back on the grave at any charge fails here.
    const { layers, renderer } = attached();
    for (const size of EVERY_SIZE) {
      frame(layers, renderer, grave(size));
      expect(`${size} ${layers.layer('graveRim').children.length}`).toBe(
        `${size} 0`,
      );
    }
  });
});
