import type { ICanvas } from 'pixi.js';
import {
  CanvasSource,
  Container,
  DOMAdapter,
  Graphics,
  Sprite,
  Texture,
} from 'pixi.js';

import type { Grave } from '../../../game/grave';
import { graveWidth } from '../../../game/grave';
import { PALETTE } from '../../palette';
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
 * The width of the band the reservoir's glow rides,
 * in field units, stroked inward from the hitbox's own edge.
 *
 * It is the band the grave's pale rim used to draw on, kept at its width so
 * the glow draws exactly where it did; the rim itself went in
 * slice 6, because the prototype has none and a bright ring round an opening
 * reads as a kerb rather than as dug earth.
 *
 * Do not derive this from BOUNDARY_STROKE's reasoning. That path gives 8, and
 * at SIZE_FLOOR two 8-unit bands leave 2 units of mouth on an 18-unit grave:
 * the grave stops being a hole exactly when the player most needs to read it.
 * Not thinner than about 2 CSS pixels on the phone, which is 2.77 units,
 * borrowing WCAG 2.2 SC 2.4.13's focus indicator area loosely as the nearest
 * published figure for a thin outline a person must see. And not thicker than
 * 4, so that at SIZE_FLOOR the mouth's interior stays wider than a power-up. 3
 * is the only integer in that bracket with margin at both ends.
 *
 * It is a field unit and not a share of the opening, which is why the glow is
 * redrawn on a size change: a stroke scaled with the grave would
 * thin exactly where this bracket needs it most.
 */
const GRAVE_RIM_STROKE = 3;

/**
 * The reservoir's glow is the band wearing treasure's colour, drawn inside the
 * hitbox's own edge rather than as a ring of its own.
 *
 * It takes no width beyond the band, which is what ADR 0003 requires: that ADR
 * makes the drawn grave the health bar and graveHitbox is exactly the sim rect,
 * so the visible outer edge has to equal the hitbox. A glow standing outside it
 * would make the grave read wider than the box the player passes under.
 */
// How fast the glow pulses at a full reservoir, in ticks per cycle.
const GLOW_PULSE_TICKS = 40;

// How far the pulse swings, as a share of full brightness.
const GLOW_PULSE_DEPTH = 0.35;

/**
 * How bright the glow draws at this much charge, and this far into a pulse.
 *
 * Below full it builds with the fullness alone, so the player reads the meter on
 * the thing they are already looking at. At full it pulses, which is the concept
 * doc's own language for the feast beat, and pulsing rather than brightening
 * further is what makes full a state rather than the top of a ramp.
 */
const glowAlpha = (fullness: number, tick: number): number => {
  const charge = Math.max(0, Math.min(1, fullness));
  if (charge < 1) return charge;
  const phase = (tick % GLOW_PULSE_TICKS) / GLOW_PULSE_TICKS;
  return 1 - GLOW_PULSE_DEPTH * (1 - Math.cos(phase * Math.PI * 2)) * 0.5;
};

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
 * The grave on screen: the prototype's hole, baked to two canvases (the cut
 * and its walls beneath the falls, the ground at the lip above them), with the
 * reservoir's glow above the food on the band inside the hitbox's edge.
 *
 * Two layers rather than one, because ADR 0014's stack puts graveMouth beneath
 * the food and graveRim above it, and one container cannot be in two layers.
 *
 * The hole is baked afresh once the size has moved past HOLE_REBUILD_STEP, as
 * the prototype's rebuildHole is, because several of its details are a screen
 * pixel or two wide and must not scale with the grave. Between bakes the art is
 * stretched to the size the sim says, so the grave grows with every swallow. The bake needs the
 * view's pixels per field unit, which only the renderer knows, so it happens in
 * the renderer's own pass (onRender) rather than in sync.
 *
 * The glow takes a number from 0 to 1 and never the RunState. Handing a renderer
 * live sim state is the thing the rest of this design works to avoid, and
 * fullness is everything it needs.
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
  private readonly glow = new Graphics();
  private wantedSize: number | null = null;
  private baked: Baked | null = null;
  private warnedUnmeasured = false;
  private glowSize: number | null = null;

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
    layers.layer('graveRim').addChild(this.glow);
  }

  public detach(): void {
    this.pitArt.removeFromParent();
    this.falls.removeFromParent();
    this.lipArt.removeFromParent();
    this.glow.removeFromParent();
  }

  /**
   * The grave as the sim says it is. Geometry comes from the sim and nowhere
   * else: the half-height is grave.size and the width is graveWidth's, never
   * re-derived here from the aspect.
   *
   * Position is free. The size is recorded for the next bake, and the glow is
   * rebuilt only when the size changes, which is on a swallow or a hit.
   */
  public sync(grave: Grave, reservoirFullness: number, tick: number): void {
    this.wantedSize = grave.size;
    if (grave.size !== this.glowSize) {
      this.redrawGlow(grave.size);
      this.glowSize = grave.size;
    }
    for (const piece of [this.pitArt, this.falls, this.lipArt, this.glow]) {
      piece.position.set(grave.x, grave.y);
    }
    // Alpha rather than a redraw, because the charge changes on every swallow
    // and the geometry only changes with the size.
    this.glow.alpha = glowAlpha(reservoirFullness, tick);
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

  /**
   * The band in treasure's colour, drawn once per size and then only faded.
   * It strokes inward, so the grave's outer edge is the hitbox at every charge.
   */
  private redrawGlow(size: number): void {
    const width = graveWidth(size);
    this.glow
      .clear()
      .rect(-width / 2, -size, width, size * 2)
      .stroke({
        width: GRAVE_RIM_STROKE,
        color: PALETTE.graveGlow.hex,
        alignment: 1,
      });
  }
}

export { glowAlpha, GraveRenderer, GRAVE_RIM_STROKE };
