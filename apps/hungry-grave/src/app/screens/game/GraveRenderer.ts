import type { ICanvas } from 'pixi.js';
import { CanvasSource, Container, DOMAdapter, Sprite, Texture } from 'pixi.js';

import type { Grave } from '../../../game/grave';
import { graveWidth } from '../../../game/grave';
import type { GraveCanvas } from './graveCanvas';
import { clamp } from './graveCanvas';
import {
  BAKE_PADDING,
  BAKE_PIXELS_PER_UNIT,
  HOLE_REBUILD_STEP,
} from './graveDrawingValues';
import { paintLip } from './graveLip';
import { mouthPolygon } from './graveMouth';
import { paintPit } from './graveWalls';
import type { FieldLayers } from './layering';

/**
 * What the bake reads off the renderer each frame: how wide the stage is in
 * its own units, and how wide the page shows the canvas in CSS pixels.
 */
interface RendererView {
  readonly screen: { readonly width: number };
  readonly canvas: {
    getBoundingClientRect?(): { readonly width: number };
  };
}

// The view and the texture density the hole was last baked at.
interface Baked {
  readonly size: number;
  readonly viewScale: number;
  readonly pixelsPerUnit: number;
}

// The 2D context of a canvas Pixi's adapter made, or a loud failure: a bake with no context is a broken environment.
const contextOf = (canvas: ICanvas): GraveCanvas => {
  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error('the grave cannot bake: no 2D context');
  return ctx;
};

/**
 * One canvas, one texture, painted in field units around the grave's origin
 * and shown at the size it was painted at (the prototype's bakeLayer). The
 * canvas comes from Pixi's own adapter, which is the browser's document in the
 * game.
 */
const bakeLayer = (
  size: number,
  pad: number,
  pxPerUnit: number,
  paint: (ctx: GraveCanvas) => void,
): Sprite => {
  const w = graveWidth(size) / 2 + pad;
  const h = size + pad;
  const canvas = DOMAdapter.get().createCanvas(
    Math.ceil(w * 2 * pxPerUnit),
    Math.ceil(h * 2 * pxPerUnit),
  );
  const ctx = contextOf(canvas);
  ctx.setTransform(
    pxPerUnit,
    0,
    0,
    pxPerUnit,
    canvas.width / 2,
    canvas.height / 2,
  );
  paint(ctx);
  const sprite = new Sprite(
    new Texture({
      source: new CanvasSource({ resource: canvas, resolution: 1 }),
    }),
  );
  sprite.anchor.set(0.5);
  sprite.width = w * 2;
  sprite.height = h * 2;
  return sprite;
};

// Swaps a layer's baked sprite for a fresh one, freeing the old canvas's texture.
const replaceArt = (art: Container, sprite: Sprite): void => {
  art.removeChildren().forEach((child) => child.destroy(true));
  art.addChild(sprite);
};

/**
 * The grave on screen: the prototype's hole, baked to two canvases, the cut and
 * its walls beneath the falls, and the ground at the lip above them.
 *
 * The hole is baked afresh once the size has moved past HOLE_REBUILD_STEP, as
 * the prototype's rebuildHole is, because several of its details are a screen
 * pixel or two wide and must not scale with the grave. Between bakes the art is
 * stretched to the size the sim says, so the grave grows with every swallow. The bake needs the
 * view's pixels per field unit, which only the renderer knows, so it happens in
 * the renderer's own pass (onRender) rather than in sync.
 */
class GraveRenderer {
  private readonly pitArt = new Container();
  /**
   * Where falling food draws: inside the hole, between the cut and the turf, so
   * a body lying across the opening stays visible until it tips (design record
   * R5).
   *
   * It follows the grave and is never scaled: a fall holds its own place in the
   * grave's proportions and multiplies by the size itself, so a container scaled
   * here would apply the size twice.
   */
  public readonly falls = new Container();
  private readonly lipArt = new Container();
  private wantedSize: number | null = null;
  private baked: Baked | null = null;
  private warnedUnmeasured = false;

  constructor() {
    this.pitArt.onRender = (renderer) => this.bakeForThisFrame(renderer);
  }

  /**
   * Puts the pieces into their layers, in the order the hole is read from the
   * ground down: the cut and its walls, the place a fall draws, and the ground
   * at the lip over the top of it all.
   *
   * FieldLayers.clear() empties every layer between runs, so the renderer has to
   * be able to put itself back rather than assume it is still attached.
   */
  public attach(layers: FieldLayers): void {
    layers.layer('graveMouth').addChild(this.pitArt, this.falls, this.lipArt);
  }

  public detach(): void {
    this.pitArt.removeFromParent();
    this.falls.removeFromParent();
    this.lipArt.removeFromParent();
  }

  /**
   * The grave as the sim says it is. Geometry comes from the sim and nowhere
   * else: the half-height is grave.size and the width is graveWidth's, never
   * re-derived here from the aspect.
   *
   * Position is free, and the size is recorded for the next bake.
   */
  public sync(grave: Grave): void {
    this.wantedSize = grave.size;
    for (const piece of [this.pitArt, this.falls, this.lipArt]) {
      piece.position.set(grave.x, grave.y);
    }
  }

  /**
   * CSS pixels per field unit on this frame (the prototype's viewScale), or
   * null while the page shows no canvas to measure. The field's own placement
   * is read off the art's transform, so the grave needs nothing from its
   * screen.
   */
  private viewScaleFor(renderer: RendererView): number | null {
    // Read off the falls, which are never scaled, so the art's own stretch
    // between bakes never feeds back into the view it is baked for.
    const transform = this.falls.getGlobalTransform();
    const stageUnits = Math.hypot(transform.a, transform.b);
    const shown = renderer.canvas.getBoundingClientRect?.().width;
    const viewScale =
      shown === undefined ? 0 : (stageUnits * shown) / renderer.screen.width;
    if (Number.isFinite(viewScale) && viewScale > 0) return viewScale;
    if (!this.warnedUnmeasured) {
      console.warn(
        `the grave cannot measure the view (canvas shown ${String(shown)} CSS pixels over a ${renderer.screen.width}-unit stage), so its hole waits to be baked`,
      );
      this.warnedUnmeasured = true;
    }
    return null;
  }

  /**
   * Bakes the hole when the size has moved past the step since the last bake,
   * or the view has changed under it, at the pixels per unit the prototype
   * chooses: the view's CSS pixels times the device pixel ratio.
   */
  private bakeForThisFrame(renderer: RendererView): void {
    const size = this.wantedSize;
    if (size === null) return;
    const viewScale = this.viewScaleFor(renderer);
    if (viewScale === null) return;
    const pixelsPerUnit = clamp(
      viewScale * (globalThis.devicePixelRatio || 1),
      BAKE_PIXELS_PER_UNIT.min,
      BAKE_PIXELS_PER_UNIT.max,
    );
    const last = this.baked;
    const stillFits =
      last !== null &&
      Math.abs(size - last.size) <= HOLE_REBUILD_STEP &&
      last.viewScale === viewScale &&
      last.pixelsPerUnit === pixelsPerUnit;
    if (!stillFits) this.rebuildHole(size, viewScale, pixelsPerUnit);
    this.stretchArtToSize(size);
  }

  // The baked art scaled from the size it was baked at to the size now, which is uniform because the grave's width, length and padding all scale with its size.
  private stretchArtToSize(size: number): void {
    const bakedAt = this.baked?.size;
    if (bakedAt === undefined) return;
    this.pitArt.scale.set(size / bakedAt);
    this.lipArt.scale.set(size / bakedAt);
  }

  /** The hole baked at one size (the prototype's rebuildHole): the pit, then the lip. */
  private rebuildHole(
    size: number,
    viewScale: number,
    pixelsPerUnit: number,
  ): void {
    const mouth = mouthPolygon(size);
    const width = graveWidth(size);
    replaceArt(
      this.pitArt,
      bakeLayer(size, width * BAKE_PADDING.pit, pixelsPerUnit, (ctx) =>
        paintPit(ctx, mouth, size, viewScale),
      ),
    );
    replaceArt(
      this.lipArt,
      bakeLayer(size, width * BAKE_PADDING.lip, pixelsPerUnit, (ctx) =>
        paintLip(ctx, mouth, size, viewScale),
      ),
    );
    this.baked = { size, viewScale, pixelsPerUnit };
  }
}

export { GraveRenderer };
