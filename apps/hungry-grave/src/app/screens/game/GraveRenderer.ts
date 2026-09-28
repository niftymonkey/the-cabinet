import type { ICanvas } from 'pixi.js';
import {
  CanvasSource,
  Container,
  DOMAdapter,
  PerspectiveMesh,
  Texture,
} from 'pixi.js';

import type { Grave } from '../../../game/grave';
import { graveWidth } from '../../../game/grave';
import { SHORTEST_FIELD } from '../../../game/field';
import type { Camera } from './camera';
import { groundToColumn, stanceOverGrave } from './camera';
import type { GraveCanvas } from './graveCanvas';
import { clamp } from './graveCanvas';
import {
  BAKE_PADDING,
  BAKE_PIXELS_PER_UNIT,
  GRAVE_DARK,
  HOLE_REBUILD_STEP,
  STANCE_REBAKE_STEP,
} from './graveDrawingValues';
import { paintLip } from './graveLip';
import { mouthPolygon } from './graveMouth';
import type { GraveView } from './graveProjection';
import { paintPit } from './graveWalls';
import { lyingAt } from './groundPlacement';
import type { FieldLayers } from './layering';
import type { Scene } from './scene';
import { sceneFor } from './scene';

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

/** A point on the column, in column units. */
interface ColumnPoint {
  readonly x: number;
  readonly y: number;
}

/** A quadrilateral's corners, clockwise from the far left. */
type Corners = readonly [ColumnPoint, ColumnPoint, ColumnPoint, ColumnPoint];

/** Where the grave's two baked layers are drawn, corner for corner. */
interface GraveCorners {
  readonly pit: Corners;
  readonly lip: Corners;
}

const ORIGIN: ColumnPoint = { x: 0, y: 0 };
const UNPLACED: Corners = [ORIGIN, ORIGIN, ORIGIN, ORIGIN];

/**
 * Where the camera draws the corners of the ground a baked layer covers: the
 * grave's width and length plus the layer's padding, clockwise from the far
 * left, so the drawn layer is exactly the projection of its ground (A5, A7).
 */
const cornersOver = (
  camera: Camera,
  grave: Grave,
  padShare: number,
): Corners => {
  const pad = graveWidth(grave.size) * padShare;
  const across = graveWidth(grave.size) / 2 + pad;
  const along = grave.size + pad;
  const at = (x: number, y: number): ColumnPoint => {
    const drawn = groundToColumn(camera, x, y);
    return { x: drawn.x, y: drawn.y };
  };
  return [
    at(grave.x - across, grave.y - along),
    at(grave.x + across, grave.y - along),
    at(grave.x + across, grave.y + along),
    at(grave.x - across, grave.y + along),
  ];
};

/** A baked layer's mesh put through its corners. */
const setCornersOf = (art: Container, corners: Corners): void => {
  const mesh = art.children[0];
  if (!(mesh instanceof PerspectiveMesh)) return;
  const [far, farRight, nearRight, near] = corners;
  mesh.setCorners(
    far.x,
    far.y,
    farRight.x,
    farRight.y,
    nearRight.x,
    nearRight.y,
    near.x,
    near.y,
  );
};

// Where the grave stood and how big it was, the view, the texture density and the hole's view the hole was last baked from.
interface Baked {
  readonly spot: GraveSpot;
  readonly viewScale: number;
  readonly pixelsPerUnit: number;
  readonly holeView: GraveView;
}

/** Where a grave stands and how big it is, which is all its hole's view needs. */
interface GraveSpot {
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

/**
 * The view a hole over this grave is cut with: the scene camera's own stance
 * over it and the dark under it (tilted view T4, A6). There is no second camera
 * for the hole, so the fall and the Undertaker's end take their view from here.
 */
const holeViewOver = (camera: Camera, grave: GraveSpot): GraveView => ({
  ...stanceOverGrave(camera, grave),
  ...GRAVE_DARK,
});

// Whether the grave has moved far enough from where it was baked for the walls that show to change (A10).
const stanceMoved = (baked: GraveSpot, live: GraveSpot): boolean =>
  Math.abs(live.x - baked.x) > STANCE_REBAKE_STEP ||
  Math.abs(live.y - baked.y) > STANCE_REBAKE_STEP;

// The 2D context of a canvas Pixi's adapter made, or a loud failure: a bake with no context is a broken environment.
const contextOf = (canvas: ICanvas): GraveCanvas => {
  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error('the grave cannot bake: no 2D context');
  return ctx;
};

/**
 * One canvas, one texture, painted in field units around the grave's origin
 * (the prototype's bakeLayer), drawn through the corners of the ground it
 * covers. The canvas comes from Pixi's own adapter, which is the browser's
 * document in the game.
 */
const bakeLayer = (
  size: number,
  pad: number,
  pxPerUnit: number,
  paint: (ctx: GraveCanvas) => void,
): PerspectiveMesh => {
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
  return new PerspectiveMesh({
    texture: new Texture({
      source: new CanvasSource({ resource: canvas, resolution: 1 }),
    }),
  });
};

// Swaps a layer's baked mesh for a fresh one, freeing the old canvas's texture.
const replaceArt = (
  art: Container,
  mesh: PerspectiveMesh,
  corners: Corners,
): void => {
  art.removeChildren().forEach((child) => child.destroy(true));
  art.addChild(mesh);
  setCornersOf(art, corners);
};

/**
 * The grave on screen: the prototype's hole, baked to two canvases, the cut and
 * its walls beneath the falls, and the ground at the lip above them.
 *
 * The hole is baked afresh once the size has moved past HOLE_REBUILD_STEP, as
 * the prototype's rebuildHole is, because several of its details are a screen
 * pixel or two wide and must not scale with the grave. Every frame each baked
 * layer is drawn through the camera's points for the corners of the ground it
 * covers at the size the sim says, so the grave grows with every swallow and
 * sits in the leaning ground (design record A7). The bake needs the view's
 * pixels per field unit, which only the renderer knows, so it happens in the
 * renderer's own pass (onRender) rather than in sync.
 */
class GraveRenderer {
  // The run's scene, or the shortest field's before any run is handed in (A34).
  private scene: Scene = sceneFor(SHORTEST_FIELD);
  private readonly pitArt = new Container();
  /**
   * Where falling food draws: inside the hole, between the cut and the turf, so
   * a body lying across the opening stays visible until it tips (design record
   * R5).
   *
   * It lies at the grave's centre under the camera and never takes the grave's
   * size: a fall holds its own place in the grave's proportions and multiplies
   * by the size itself, so a container scaled by the size would apply it twice.
   */
  public readonly falls = new Container();
  private readonly lipArt = new Container();
  private drawn: GraveCorners = { pit: UNPLACED, lip: UNPLACED };
  private wanted: GraveSpot | null = null;
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

  /**
   * The run about to be drawn's scene. The hole is cut again under it, because
   * the camera's stance over the same spot and the nearest row's density are
   * both the scene's (A10, A34).
   */
  public useScene(scene: Scene): void {
    this.scene = scene;
    this.baked = null;
  }

  /** Where the pit and the lip are drawn this frame, read-only. */
  public get corners(): GraveCorners {
    return this.drawn;
  }

  /**
   * The view the walls were last cut with, so a fall is drawn between the
   * walls it goes down against; before the first bake, the view the next bake
   * will cut. A fall drawn before the grave was ever synced is a bug.
   */
  public holeView(): GraveView {
    if (this.baked !== null) return this.baked.holeView;
    if (this.wanted === null) {
      throw new Error('the hole has no view: the grave was never synced');
    }
    return holeViewOver(this.scene.camera, this.wanted);
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
   * Where it draws is free, and the size and the place are recorded for the
   * next bake, because the camera's stance over the grave needs both.
   */
  public sync(grave: Grave): void {
    this.wanted = { x: grave.x, y: grave.y, size: grave.size };
    this.drawn = {
      pit: cornersOver(this.scene.camera, grave, BAKE_PADDING.pit),
      lip: cornersOver(this.scene.camera, grave, BAKE_PADDING.lip),
    };
    setCornersOf(this.pitArt, this.drawn.pit);
    setCornersOf(this.lipArt, this.drawn.lip);
    const at = lyingAt(this.scene.camera, grave.x, grave.y);
    this.falls.position.set(at.x, at.y);
    this.falls.scale.set(at.scaleX, at.scaleY);
  }

  /**
   * CSS pixels per field unit on this frame (the prototype's viewScale), or
   * null while the page shows no canvas to measure. The field's own placement
   * is read off the art's transform, so the grave needs nothing from its
   * screen.
   */
  private viewScaleFor(renderer: RendererView): number | null {
    // Read off the pit's container, which the camera never places or scales,
    // so where the grave stands never feeds back into the view it is baked
    // for (A10).
    const transform = this.pitArt.getGlobalTransform();
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
   * or the grave has moved past its own, or the view has changed under it, at
   * the pixels per unit the prototype chooses, the view's CSS pixels times the
   * device pixel ratio, taken at the column's nearest row (A10).
   */
  private bakeForThisFrame(renderer: RendererView): void {
    const wanted = this.wanted;
    if (wanted === null) return;
    const { size } = wanted;
    const holeView = holeViewOver(this.scene.camera, wanted);
    const viewScale = this.viewScaleFor(renderer);
    if (viewScale === null) return;
    const pixelsPerUnit = clamp(
      viewScale * this.scene.nearestScale * (globalThis.devicePixelRatio || 1),
      BAKE_PIXELS_PER_UNIT.min,
      BAKE_PIXELS_PER_UNIT.max,
    );
    const last = this.baked;
    const stillFits =
      last !== null &&
      Math.abs(size - last.spot.size) <= HOLE_REBUILD_STEP &&
      !stanceMoved(last.spot, wanted) &&
      last.viewScale === viewScale &&
      last.pixelsPerUnit === pixelsPerUnit;
    if (!stillFits) {
      this.rebuildHole(wanted, viewScale, pixelsPerUnit, holeView);
    }
  }

  /** The hole baked at one size from one stance (the prototype's rebuildHole): the pit, then the lip. */
  private rebuildHole(
    spot: GraveSpot,
    viewScale: number,
    pixelsPerUnit: number,
    holeView: GraveView,
  ): void {
    const { size } = spot;
    const mouth = mouthPolygon(size);
    const width = graveWidth(size);
    replaceArt(
      this.pitArt,
      bakeLayer(size, width * BAKE_PADDING.pit, pixelsPerUnit, (ctx) =>
        paintPit(ctx, mouth, size, viewScale, holeView),
      ),
      this.drawn.pit,
    );
    replaceArt(
      this.lipArt,
      bakeLayer(size, width * BAKE_PADDING.lip, pixelsPerUnit, (ctx) =>
        paintLip(ctx, mouth, size, viewScale),
      ),
      this.drawn.lip,
    );
    this.baked = { spot, viewScale, pixelsPerUnit, holeView };
  }
}

export { GraveRenderer, holeViewOver };
export type { ColumnPoint, Corners, GraveCorners };
