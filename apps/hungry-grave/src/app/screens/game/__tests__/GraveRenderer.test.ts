/**
 * The first field content on screen. Render only: it reads a Grave and draws
 * it, and holds no rules.
 */

import type { Container, ICanvas, Renderer } from 'pixi.js';
import { BrowserAdapter, DOMAdapter, Graphics, PerspectiveMesh } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';
import type { Grave } from '../../../../game/grave';
import { graveHitbox, graveWidth } from '../../../../game/grave';
import { SIZE_CEILING, SIZE_FLOOR, SIZE_START } from '../../../../game/tuning';
import { capsFor } from '../../../../game/caps';
import { CORPSE_HALF_EXTENT } from '../../../../game/corpses';
import type { Swallowed } from '../../../../game/events';
import { createRun } from '../../../../game/run';
import { DEFAULT_TUNING } from '../../../../game/tuningRecord';
import { VIEW_HEIGHT } from '../../../../game/field';
import {
  COLUMN,
  SCENE_CAMERA,
  groundToColumn,
  stanceOverGrave,
} from '../camera';
import { fallAt } from '../fall';
import { FallRenderer } from '../FallRenderer';
import {
  BAKE_PADDING,
  GRAVE_DARK,
  STANCE_REBAKE_STEP,
} from '../graveDrawingValues';
import type { GraveView } from '../graveProjection';
import type { Corners } from '../GraveRenderer';
import { GraveRenderer } from '../GraveRenderer';
import { facePoint, wallFaces } from '../graveWalls';
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

/** The corners of a ground rectangle round the grave, clockwise from the far left, where the camera draws them. */
function projectedRectangle(at: Grave, halfWidth: number, halfLength: number) {
  return [
    [at.x - halfWidth, at.y - halfLength],
    [at.x + halfWidth, at.y - halfLength],
    [at.x + halfWidth, at.y + halfLength],
    [at.x - halfWidth, at.y + halfLength],
  ].map(([x, y]) => groundToColumn(SCENE_CAMERA, x ?? NaN, y ?? NaN));
}

/** Corners written out, so two sets compare at a glance. */
const cornersText = (corners: readonly { x: number; y: number }[]): string =>
  corners.map((each) => `${each.x.toFixed(6)},${each.y.toFixed(6)}`).join(' ');

/** The perspective mesh a baked layer is drawn with. */
function meshOf(layers: FieldLayers, at: number): PerspectiveMesh {
  const mesh = pieceOf(layers, at).children[0];
  if (!(mesh instanceof PerspectiveMesh)) {
    throw new Error(`the mouth piece at ${at} holds no perspective mesh`);
  }
  return mesh;
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

/** A view's camera written out, so two compare at a glance. */
const viewText = (view: {
  readonly cameraHeight: number;
  readonly nadirX: number;
  readonly nadirY: number;
}): string =>
  [view.cameraHeight, view.nadirX, view.nadirY]
    .map((each) => each.toFixed(9))
    .join(' ');

/** A corpse swallowed at the right-hand rim of a grave at the start size. */
const OVER_THE_RIGHT_RIM: Swallowed = {
  type: 'swallowed',
  kind: 'corpse',
  freshness: 1,
  payout: 1,
  offsetX: 13.5,
  offsetY: 0,
  halfExtent: CORPSE_HALF_EXTENT,
  vx: 0,
  vy: 0,
  graveSize: 27,
  tier: 'trash',
  treasureBody: false,
};

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

  it('the grave is repainted when its size changes, and a size that has not changed does not repaint', () => {
    // The prototype bakes the hole afresh at each size (rebuildHole), because
    // several of its details are screen pixels wide and must not scale with
    // the grave. It bakes again once the size has moved past its step, and a
    // fuller reservoir alone never bakes. The grave holds its place, because a
    // move bakes on the camera's stance (A10), which a test below owns.
    const { layers, renderer } = attached();
    frame(layers, renderer, grave(27));
    const baked = canvasesMade.length;

    frame(layers, renderer, grave(27));
    frame(layers, renderer, grave(27.3));
    expect(canvasesMade.length).toBe(baked);

    frame(layers, renderer, grave(33));
    expect(canvasesMade.length).toBe(baked + 2);
  });

  it('the drawn grave grows with every swallow, not only when it is repainted', () => {
    // Mark, 2026-09-21: the grave must grow gradually as it eats. A repaint
    // waits for the size to move past its step, so between repaints the baked
    // art is drawn through the corners of the ground it covers at the size the
    // sim says, and never waits at the old one (tilted view A7).
    const { layers, renderer } = attached();
    frame(layers, renderer, grave(27));
    let before = cornersText(renderer.corners.pit);
    for (const size of [27.1, 27.2, 27.3]) {
      const at = grave(size);
      frame(layers, renderer, at);
      const box = graveHitbox(at);
      const reach = graveWidth(size) * BAKE_PADDING.pit;
      const drawn = cornersText(renderer.corners.pit);
      expect(drawn).toBe(
        cornersText(
          projectedRectangle(at, box.width / 2 + reach, box.height / 2 + reach),
        ),
      );
      expect(drawn).not.toBe(before);
      before = drawn;
    }
  });

  it('the baked hole is centred on the grave, sized to it with the prototype padding round it', () => {
    // bakeLayer's own geometry: a canvas the grave's width and length plus a
    // pad on every side, in the grave's own units, painted about its middle.
    // Where it draws is the corners' business (tilted view A7). The phone here
    // bakes at one pixel a unit: 390 CSS pixels over 540 units times the
    // nearest row's 1.178 is under the floor of one.
    const { layers, renderer } = attached();
    for (const size of EVERY_SIZE) {
      const at = grave(size);
      const first = canvasesMade.length;
      frame(layers, renderer, at);
      const box = graveHitbox(at);
      const baked = canvasesMade.slice(first);
      for (const [index, share] of [
        [0, BAKE_PADDING.pit],
        [1, BAKE_PADDING.lip],
      ] as const) {
        const reach = graveWidth(size) * share;
        expect(`${size} ${baked[index]?.width} ${baked[index]?.height}`).toBe(
          `${size} ${Math.ceil(box.width + reach * 2)} ${Math.ceil(box.height + reach * 2)}`,
        );
      }
    }
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

  it("the place for falls follows the grave's point on the column and takes the camera's scale, never the grave's size", () => {
    // A fall holds its place in the grave's own proportions and multiplies by
    // the size itself (R5), so a container scaled by the size would apply it
    // twice and a feast would start its fall in mid-hole. It lies at the
    // grave's centre under the camera (tilted view A7): at ground (111, 222),
    // worked on an independent pinhole, (120.338158, 254.570341), 0.941269
    // across and 0.747235 down, whatever the size.
    const { renderer } = attached();
    for (const size of EVERY_SIZE) {
      renderer.sync(grave(size, 111, 222));
      const falls = renderer.falls;
      const near = (value: number, expected: number) =>
        `${size} ${Math.abs(value - expected) < 1e-5}`;
      expect(near(falls.position.x, 120.338158)).toBe(`${size} true`);
      expect(near(falls.position.y, 254.570341)).toBe(`${size} true`);
      expect(near(falls.scale.x, 0.941269)).toBe(`${size} true`);
      expect(near(falls.scale.y, 0.747235)).toBe(`${size} true`);
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

describe('the grave under the tilted camera (tilted view A5, A7, A10)', () => {
  it("the grave's pit and lip are drawn through the four projected corners of their ground rectangle, at the size the sim says, and a grave near the top draws its far end narrower than its near end", () => {
    // The pit and the lip are large enough for the camera's scale to change
    // across them, so each is a perspective mesh through the camera's points
    // for the four corners of the ground its bake covers: the grave's width
    // and length plus the bake's padding, 0.12 of the width for the pit and
    // 0.3 for the lip (A5, A7). A start-size grave at ground (270, 150), its
    // corners worked on an independent pinhole, clockwise from the far left.
    const { layers, renderer } = attached();
    frame(layers, renderer, grave(SIZE_START, 270, 150));
    const pit: Corners = renderer.corners.pit;
    const lip: Corners = renderer.corners.lip;
    expect(cornersText(pit)).toBe(
      '254.820046,180.970142 285.179954,180.970142 285.516000,223.842788 254.484000,223.842788',
    );
    expect(cornersText(lip)).toBe(
      '250.446993,177.605489 289.553007,177.605489 290.056324,227.370454 249.943676,227.370454',
    );
    for (const [piece, corners] of [
      [THE_PIT, pit],
      [THE_LIP, lip],
    ] as const) {
      const handed = meshOf(layers, piece).geometry.corners;
      expect([...handed].map((each) => each.toFixed(6)).join(',')).toBe(
        corners
          .flatMap((each) => [each.x.toFixed(6), each.y.toFixed(6)])
          .join(','),
      );
    }
    const farWidth = (pit[1]?.x ?? NaN) - (pit[0]?.x ?? NaN);
    const nearWidth = (pit[2]?.x ?? NaN) - (pit[3]?.x ?? NaN);
    expect(farWidth).toBeLessThan(nearWidth);
  });

  it('moving the grave to another row bakes at the same pixel density', () => {
    // A10: a move bakes the hole again once the camera's stance over it has
    // moved, and never for resolution: the hole is baked at the nearest row's
    // density wherever the grave stands, so a bake on any row is as sharp as a
    // bake on any other, read off the unscaled layer rather than off anything
    // the camera draws.
    const { layers, renderer } = attached();
    const first = canvasesMade.length;
    frame(layers, renderer, grave(SIZE_START, 270, 600));
    const second = canvasesMade.length;
    frame(layers, renderer, grave(SIZE_START, 270, 150));
    const atTheStart = canvasesMade[first];
    const upTheField = canvasesMade[second];
    expect(upTheField?.width).toBe(atTheStart?.width);
    expect(upTheField?.height).toBe(atTheStart?.height);
  });

  it("the hole is baked at the view's pixels times the nearest row's scale times the device pixel ratio", () => {
    // The prototype's own choice, the view's CSS pixels per field unit times
    // the device pixel ratio, taken at the column's nearest row, where the
    // camera draws the grave largest: 1.177929 (A10). At device scale 3 on a
    // 390-wide phone that is about 2.55 texture pixels a unit.
    vi.stubGlobal('devicePixelRatio', 3);
    const { layers, renderer } = attached();
    const before = canvasesMade.length;
    frame(layers, renderer, grave(SIZE_START));
    const pit = canvasesMade[before];
    vi.unstubAllGlobals();
    const wanted = (390 / 540) * 1.177929 * 3;
    const side =
      graveWidth(SIZE_START) / 2 + graveWidth(SIZE_START) * BAKE_PADDING.pit;
    expect(pit?.width).toBe(Math.ceil(side * 2 * wanted));
  });
});

describe('the hole cut by the scene camera (tilted view T4, A6, A10)', () => {
  it("the hole is cut by the scene camera: over a grave of size 48 the view's camera height is 23.90625 half-lengths, never the scene's 42.5", () => {
    // A6: the camera stands 1147.5 field units up whatever the grave's size,
    // so over a grave of size 48 it is 1147.5 / 48 of that grave's half-lengths
    // up; a camera that rose with the grave would stay at 42.5.
    const { layers, renderer } = attached();
    frame(layers, renderer, grave(48));
    expect(
      Math.abs(renderer.holeView().cameraHeight - 23.90625),
    ).toBeLessThanOrEqual(1e-9);
  });

  it('moving the grave less than a stance step does not bake the hole again, and moving it more does', () => {
    // A10: where the grave stands decides which walls show, and the hole is
    // baked again once the grave has moved more than a step, across or along,
    // from where it was baked.
    const { layers, renderer } = attached();
    frame(layers, renderer, grave(27, 270, 600));
    const baked = canvasesMade.length;
    frame(layers, renderer, grave(27, 270 + STANCE_REBAKE_STEP / 2, 600));
    frame(
      layers,
      renderer,
      grave(27, 270 + STANCE_REBAKE_STEP / 2, 600 + STANCE_REBAKE_STEP / 2),
    );
    expect(canvasesMade.length).toBe(baked);
    frame(layers, renderer, grave(27, 270 + STANCE_REBAKE_STEP * 1.5, 600));
    expect(canvasesMade.length).toBe(baked + 2);
  });

  it('the fall is handed the view the walls were last cut with', () => {
    // T4: a body goes down between the walls it is drawn against, so the fall
    // reads the view of the last bake and not the live stance, which may have
    // moved by less than a step since. Before the first bake it reads the view
    // the next bake will cut. Over a grave of size 27 the camera is 42.5
    // half-lengths up and its nadir sits (270 - x) / 27 across.
    const { layers, renderer } = attached();
    const nadirYOver = (y: number): number =>
      stanceOverGrave(SCENE_CAMERA, { x: 270, y, size: 27 }).nadirY;
    renderer.sync(grave(27, 243, 600));
    expect(viewText(renderer.holeView())).toBe(
      viewText({ cameraHeight: 42.5, nadirX: 1, nadirY: nadirYOver(600) }),
    );
    drawn(layers);
    frame(layers, renderer, grave(27, 243 + STANCE_REBAKE_STEP / 2, 600));
    expect(viewText(renderer.holeView())).toBe(
      viewText({ cameraHeight: 42.5, nadirX: 1, nadirY: nadirYOver(600) }),
    );
    frame(layers, renderer, grave(27, 297, 600));
    expect(viewText(renderer.holeView())).toBe(
      viewText({ cameraHeight: 42.5, nadirX: -1, nadirY: nadirYOver(600) }),
    );

    // And the hop the screens declare carries it: a fall synced after the grave
    // has moved under a step is drawn with the baked view.
    const falls = new FallRenderer({ holeView: () => renderer.holeView() });
    falls.attach(renderer.falls, capsFor(DEFAULT_TUNING));
    const run = createRun(1);
    run.tick = 40;
    run.grave.size = 27;
    falls.swallowed({ ...run, tick: 0 }, OVER_THE_RIGHT_RIM);
    frame(layers, renderer, grave(27, 297 + STANCE_REBAKE_STEP / 2, 600));
    falls.sync(run);
    const sprite = renderer.falls.children.find((child) => child.visible);
    const expected = fallAt(
      {
        unitX: 0.5,
        unitY: 0,
        unitVx: 0,
        unitVy: 0,
        halfExtent: CORPSE_HALF_EXTENT,
        born: 0,
      },
      40,
      27,
      {
        cameraHeight: 42.5,
        nadirX: -1,
        nadirY: nadirYOver(600),
        ...GRAVE_DARK,
      },
    );
    expect(
      `${sprite?.position.x.toFixed(9)},${sprite?.position.y.toFixed(9)}`,
    ).toBe(`${expected.x.toFixed(9)},${expected.y.toFixed(9)}`);
  });
  it("a centred grave's two side walls, cut from the stalest bake the renderer keeps, differ by under one drawn pixel at the ceiling on a phone", () => {
    // A10: a bake is kept until the grave has moved a step, so a grave that
    // drifts back to the middle column can show walls cut for a grave off to
    // one side. The step is small enough that this never reads: at the
    // ceiling, on the nearest row a grave can stand on, where the camera draws
    // it largest, the two side walls of a centred grave from the stalest bake
    // the renderer keeps differ by under one CSS pixel of the 390-wide phone
    // column. The stalest bake is found by asking the renderer, so the promise
    // holds whatever the step is measured in.
    const size = SIZE_CEILING;
    const row = VIEW_HEIGHT - size;
    const cssPerUnit = 390 / COLUMN.width;
    const drawnReach = (view: GraveView, id: 'left' | 'right'): number => {
      const face = wallFaces(size, view).find((each) => each.id === id);
      if (face === undefined) throw new Error(`no ${id} face`);
      const at = (spot: { x: number; y: number }): number =>
        groundToColumn(SCENE_CAMERA, 270 + spot.x, row + spot.y).x;
      const lip = at(facePoint(face, size, 0.5, 0));
      const deep = at(facePoint(face, size, 0.5, 1));
      return (id === 'left' ? deep - lip : lip - deep) * cssPerUnit;
    };
    const keptAfterDrift = (drift: number): GraveView | null => {
      const { layers, renderer } = attached();
      frame(layers, renderer, grave(size, 270 + drift, row));
      const baked = canvasesMade.length;
      frame(layers, renderer, grave(size, 270, row));
      return canvasesMade.length === baked ? renderer.holeView() : null;
    };
    for (const side of [1, -1]) {
      let kept = 0;
      let baked = side * size;
      expect(keptAfterDrift(baked)).toBeNull();
      for (let probe = 0; probe < 40; probe++) {
        const middle = (kept + baked) / 2;
        if (keptAfterDrift(middle) === null) baked = middle;
        else kept = middle;
      }
      const view = keptAfterDrift(kept);
      if (view === null) throw new Error('the stalest kept bake was not kept');
      const apart = Math.abs(
        drawnReach(view, 'left') - drawnReach(view, 'right'),
      );
      expect(apart).toBeLessThan(1);
    }
  });
});
