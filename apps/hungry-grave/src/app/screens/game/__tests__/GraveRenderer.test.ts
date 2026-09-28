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
import {
  FIELD_WIDTH,
  SHORTEST_FIELD,
  SHORTEST_FIELD_HEIGHT,
  fieldOfHeight,
} from '../../../../game/field';
import { groundToColumn, stanceOverGrave } from '../camera';
import { groundUnderPlay, playToColumn } from '../playLayer';
import { graveOnGround } from '../playPlacement';
import type { Scene } from '../scene';
import { sceneFor } from '../scene';
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

// The shortest field's scene, the one this file's values were pinned on (tilted view A34).
const SHORTEST_SCENE = sceneFor(SHORTEST_FIELD);
const { camera: SHORTEST_CAMERA, column: SHORTEST_COLUMN } = SHORTEST_SCENE;

// A 390 by 844 phone's field, where the play layer's relations are checked a second time (T12).
const TALL_SCENE = sceneFor(fieldOfHeight(1168));

const ORIGIN_POINT = { x: 0, y: 0 };

/** The four ways from a quadrilateral's centre to its corners, clockwise from the far left. */
const CORNER_WAYS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
] as const;

/**
 * Where the camera draws the corners of a baked layer's ground rectangle for a
 * grave whose opening needs no widening (A23, A29): centred on the ground under
 * its play point, the layer's padding added to the grave's width and length,
 * across times the opening's own widening off the ground rectangle graveOnGround
 * gives the hitbox, along times the stretch.
 */
function cameraShapeOf(scene: Scene, at: Grave, padShare: number) {
  const width = graveWidth(at.size);
  const pad = width * padShare;
  const opening = graveOnGround(scene.playLayer, at, width / 2, at.size);
  const across = (opening.halfAcross / (width / 2)) * (width / 2 + pad);
  const along = (at.size + pad) * scene.playLayer.stretch;
  return CORNER_WAYS.map(([x, y]) =>
    groundToColumn(
      scene.camera,
      opening.centre.x + x * across,
      opening.centre.y + y * along,
    ),
  );
}

/** Asserts two sets of corners within a tolerance, naming both when they differ. */
function expectCornersNear(
  actual: readonly { x: number; y: number }[],
  expected: readonly { x: number; y: number }[],
  tolerance: number,
): void {
  const apart = Math.max(
    ...actual.map((each, at) =>
      Math.max(
        Math.abs(each.x - (expected[at]?.x ?? NaN)),
        Math.abs(each.y - (expected[at]?.y ?? NaN)),
      ),
    ),
  );
  expect(
    apart,
    `${cornersText(actual)} against ${cornersText(expected)}`,
  ).toBeLessThanOrEqual(tolerance);
}

/**
 * Where a quadrilateral's diagonals cross, which is where any projective map
 * of a rectangle onto it draws the rectangle's centre.
 */
function diagonalsCross(corners: Corners): { x: number; y: number } {
  const [a, b, c, d] = corners;
  const r = { x: c.x - a.x, y: c.y - a.y };
  const s = { x: d.x - b.x, y: d.y - b.y };
  const t = ((b.x - a.x) * s.y - (b.y - a.y) * s.x) / (r.x * s.y - r.y * s.x);
  return { x: a.x + t * r.x, y: a.y + t * r.y };
}

/**
 * Where a perspective mesh through these corners draws the point (s, t) of its
 * texture's unit square, by the square-to-quadrilateral map (Heckbert, 1989),
 * which is the map Pixi's PerspectiveMesh draws with.
 */
function onMesh(corners: Corners, s: number, t: number) {
  const [p0, p1, p2, p3] = corners;
  const sx = p0.x - p1.x + p2.x - p3.x;
  const sy = p0.y - p1.y + p2.y - p3.y;
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / den;
  const h = (dx1 * sy - sx * dy1) / den;
  const w = g * s + h * t + 1;
  return {
    x: ((p1.x - p0.x + g * p1.x) * s + (p3.x - p0.x + h * p3.x) * t + p0.x) / w,
    y: ((p1.y - p0.y + g * p1.y) * s + (p3.y - p0.y + h * p3.y) * t + p0.y) / w,
  };
}

/**
 * The drawn opening: where the pit's mesh draws the corners of the grave's own
 * width and length inside its bake, which is the pit's padding in from the
 * texture's edge on every side.
 */
function drawnOpening(pit: Corners, size: number) {
  const width = graveWidth(size);
  const pad = width * BAKE_PADDING.pit;
  const s = pad / (width + 2 * pad);
  const t = pad / (2 * size + 2 * pad);
  return [
    onMesh(pit, s, t),
    onMesh(pit, 1 - s, t),
    onMesh(pit, 1 - s, 1 - t),
    onMesh(pit, s, 1 - t),
  ];
}

/**
 * How far a column point lies outside a quadrilateral whose corners run
 * clockwise on the screen, in column units; zero or less is inside.
 */
function outsideBy(
  quad: readonly { x: number; y: number }[],
  point: { x: number; y: number },
): number {
  return Math.max(
    ...quad.map((from, at) => {
      const to = quad[(at + 1) % quad.length] ?? from;
      const cross =
        (to.x - from.x) * (point.y - from.y) -
        (to.y - from.y) * (point.x - from.x);
      return -cross / Math.hypot(to.x - from.x, to.y - from.y);
    }),
  );
}

/** How far a wall reaches into the hole's view, in field units, from its lip to its deepest drawn point. */
function wallReach(
  view: GraveView,
  size: number,
  id: 'left' | 'right',
): number {
  const face = wallFaces(size, view).find((each) => each.id === id);
  if (face === undefined) throw new Error(`no ${id} face`);
  const lip = facePoint(face, size, 0.5, 0).x;
  const deep = facePoint(face, size, 0.5, 1).x;
  return id === 'left' ? deep - lip : lip - deep;
}

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

function attached(scene: Scene = SHORTEST_SCENE): {
  layers: FieldLayers;
  renderer: GraveRenderer;
} {
  const layers = new FieldLayers();
  const renderer = new GraveRenderer();
  renderer.useScene(scene);
  renderer.attach(layers);
  return { layers, renderer };
}

function pieceOf(layers: FieldLayers, at: number): Container {
  const piece = layers.layer('graveMouth').children[at];
  if (piece === undefined) throw new Error(`no mouth child at ${at}`);
  return piece;
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
      const drawn = cornersText(renderer.corners.pit);
      expectCornersNear(
        renderer.corners.pit,
        cameraShapeOf(SHORTEST_SCENE, at, BAKE_PADDING.pit),
        1e-9,
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

  it("the place for falls is the grave's frame on the play layer, the larger of the scale and one across and the rows per field unit along, and never takes the grave's size", () => {
    // A29: a fall holds its place in the grave's own proportions and
    // multiplies by the size itself (R5), so a container scaled by the size
    // would apply it twice. The frame on the play layer, from the design
    // record's play layer bullets: at field (270, 608) it lies at (270,
    // 559.555815), 1.084074 across and 1.213640 along; at field (100, 100) at
    // (100, 72.678500), 1 across and 0.756871 along; whatever the size.
    const { renderer } = attached();
    for (const [x, y, column, across, along] of [
      [270, 608, 559.555815, 1.084074, 1.21364],
      [100, 100, 72.6785, 1, 0.756871],
    ] as const) {
      for (const size of EVERY_SIZE) {
        renderer.sync(grave(size, x, y));
        const falls = renderer.falls;
        const near = (value: number, expected: number) =>
          `${x},${y} ${size} ${Math.abs(value - expected) < 1e-5}`;
        const yes = `${x},${y} ${size} true`;
        expect(near(falls.position.x, x)).toBe(yes);
        expect(near(falls.position.y, column)).toBe(yes);
        expect(near(falls.scale.x, across)).toBe(yes);
        expect(near(falls.scale.y, along)).toBe(yes);
      }
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
  it("the grave's pit and lip are drawn through the projected corners of a ground rectangle of the grave's size centred on the ground under its play point, the mesh's centre draws at the grave's play point, and a grave near the top draws its far end narrower than its near end", () => {
    // A23, A29: the pit and the lip are perspective meshes through the
    // camera's points for the corners of the ground their bakes cover: the
    // grave's width and length plus the bake's padding (0.12 of the width for
    // the pit, 0.3 for the lip), centred on the ground under the grave's play
    // point, across widened as the opening is and along times the stretch. A
    // start-size grave in the middle column near the top, at field (270, 150),
    // where the opening needs no widening past the camera's shape.
    const at = grave(SIZE_START, 270, 150);
    const { layers, renderer } = attached();
    frame(layers, renderer, at);
    const pit: Corners = renderer.corners.pit;
    const lip: Corners = renderer.corners.lip;
    expectCornersNear(
      pit,
      cameraShapeOf(SHORTEST_SCENE, at, BAKE_PADDING.pit),
      1e-9,
    );
    expectCornersNear(
      lip,
      cameraShapeOf(SHORTEST_SCENE, at, BAKE_PADDING.lip),
      1e-9,
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
      const centre = diagonalsCross(corners);
      const placed = playToColumn(SHORTEST_SCENE.playLayer, 270, 150);
      expect(Math.abs(centre.x - placed.x)).toBeLessThanOrEqual(1e-9);
      expect(Math.abs(centre.y - placed.y)).toBeLessThanOrEqual(1e-9);
    }
    const farWidth = pit[1].x - pit[0].x;
    const nearWidth = pit[2].x - pit[3].x;
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

  it('moving the grave so the ground under it moves less than a stance step does not bake the hole again, and more does, measured in ground units', () => {
    // A10, A23: the walls that show follow the ground under the grave's play
    // point, so the step is counted between those ground points. Near the top
    // a field unit is 1 / 0.856 ground units across and 1.224 along, so a move
    // of 0.8 of a step in field units stays inside the step and a move of 0.9
    // of a step passes it, across and along alike; counted in field units
    // neither would bake.
    const step = STANCE_REBAKE_STEP;
    for (const [dx, dy] of [
      [1, 0],
      [0, 1],
    ] as const) {
      const { layers, renderer } = attached();
      frame(layers, renderer, grave(27, 270, 100));
      const baked = canvasesMade.length;
      frame(
        layers,
        renderer,
        grave(27, 270 + dx * step * 0.8, 100 + dy * step * 0.8),
      );
      expect(`${dx},${dy} ${canvasesMade.length - baked}`).toBe(
        `${dx},${dy} 0`,
      );
      frame(
        layers,
        renderer,
        grave(27, 270 + dx * step * 0.9, 100 + dy * step * 0.9),
      );
      expect(`${dx},${dy} ${canvasesMade.length - baked}`).toBe(
        `${dx},${dy} 2`,
      );
    }
  });

  it('the fall is handed the view the walls were last cut with', () => {
    // T4: a body goes down between the walls it is drawn against, so the fall
    // reads the view of the last bake and not the live stance, which may have
    // moved by less than a step since. Before the first bake it reads the view
    // the next bake will cut. Over a grave of size 27 the camera is 42.5
    // half-lengths up and its nadir sits (270 - x) / 27 across.
    // The stance is taken over the ground under the grave's play point (A23).
    const { layers, renderer } = attached();
    const viewOver = (x: number, y: number) => ({
      ...stanceOverGrave(SHORTEST_CAMERA, {
        ...groundUnderPlay(SHORTEST_SCENE.playLayer, x, y),
        size: 27,
      }),
      ...GRAVE_DARK,
    });
    renderer.sync(grave(27, 243, 600));
    expect(viewText(renderer.holeView())).toBe(viewText(viewOver(243, 600)));
    drawn(layers);
    frame(layers, renderer, grave(27, 243 + STANCE_REBAKE_STEP / 2, 600));
    expect(viewText(renderer.holeView())).toBe(viewText(viewOver(243, 600)));
    frame(layers, renderer, grave(27, 297, 600));
    expect(viewText(renderer.holeView())).toBe(viewText(viewOver(297, 600)));

    // And the hop the screens declare carries it: a fall synced after the grave
    // has moved under a step is drawn with the baked view.
    const falls = new FallRenderer({ holeView: () => renderer.holeView() });
    falls.attach(renderer.falls, capsFor(DEFAULT_TUNING, SHORTEST_FIELD));
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
      viewOver(297, 600),
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
    const row = SHORTEST_FIELD_HEIGHT - size;
    const cssPerUnit = 390 / SHORTEST_COLUMN.width;
    const drawnReach = (view: GraveView, id: 'left' | 'right'): number => {
      const face = wallFaces(size, view).find((each) => each.id === id);
      if (face === undefined) throw new Error(`no ${id} face`);
      const at = (spot: { x: number; y: number }): number =>
        groundToColumn(SHORTEST_CAMERA, 270 + spot.x, row + spot.y).x;
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

describe('the grave on the play layer (tilted view T4, T10, A23, A29)', () => {
  it('the grave at the left edge and at the right edge of its starting row draws at column x equal to its field x, one scale on both sides', () => {
    // T10: across, a field unit is a column unit at every row. The grave's
    // frame lies at its field x at the same scale on both sides, and the grave
    // drawn at the right edge is the mirror image of the one at the left edge
    // about the column's middle, on both fields (T12).
    for (const scene of [SHORTEST_SCENE, TALL_SCENE]) {
      const row = scene.field.height - 152;
      const drawnAt = (x: number) => {
        const { layers, renderer } = attached(scene);
        frame(layers, renderer, grave(SIZE_START, x, row));
        return {
          falls: renderer.falls,
          pit: renderer.corners.pit,
          lip: renderer.corners.lip,
        };
      };
      const left = drawnAt(SIZE_START / 2);
      const right = drawnAt(FIELD_WIDTH - SIZE_START / 2);
      expect(Math.abs(left.falls.position.x - SIZE_START / 2)).toBeLessThan(
        1e-9,
      );
      expect(
        Math.abs(right.falls.position.x - (FIELD_WIDTH - SIZE_START / 2)),
      ).toBeLessThan(1e-9);
      expect(left.falls.scale.x).toBe(right.falls.scale.x);
      expect(left.falls.scale.y).toBe(right.falls.scale.y);
      for (const layer of ['pit', 'lip'] as const) {
        const mirrored = [1, 0, 3, 2].map((at) => {
          const corner = right[layer][at];
          if (corner === undefined) throw new Error(`no corner ${at}`);
          return { x: FIELD_WIDTH - corner.x, y: corner.y };
        });
        expectCornersNear(left[layer], mirrored, 1e-9);
      }
    }
  });

  it("the hole is cut over the ground under the grave's play point: the design record's stance figures on the 760 and the 1168 field", () => {
    // A23, A34: tilt 9's aimHoleCamera. Size 27 graves at the left edge, the
    // middle and the right edge of the starting row: on the 760 field at field
    // (40, 608), (270, 608) and (500, 608) the nadir is (7.857873, 19.801919),
    // (0, 19.801919) and (-7.857873, 19.801919) half-lengths; on the 1168
    // field at (40, 1016), (270, 1016) and (500, 1016) it is (7.344603,
    // 14.150916), (0, 14.150916) and (-7.344603, 14.150916); the camera 42.5
    // half-lengths up on both.
    for (const [scene, row, nadirX, nadirY] of [
      [SHORTEST_SCENE, 608, 7.857873, 19.801919],
      [TALL_SCENE, 1016, 7.344603, 14.150916],
    ] as const) {
      for (const [x, side] of [
        [40, 1],
        [270, 0],
        [500, -1],
      ] as const) {
        const { layers, renderer } = attached(scene);
        frame(layers, renderer, grave(27, x, row));
        const view = renderer.holeView();
        const label = `${scene.field.height} ${x}`;
        expect(Math.abs(view.cameraHeight - 42.5), label).toBeLessThan(1e-6);
        expect(Math.abs(view.nadirX - side * nadirX), label).toBeLessThan(1e-6);
        expect(Math.abs(view.nadirY - nadirY), label).toBeLessThan(1e-6);
      }
    }
  });

  it('a grave at the left edge shows more of its left wall than its right, and at the right edge the reverse', () => {
    // T4, tilt 9's check "the side walls differ between the left and the
    // right edge": the camera stands over the column's middle, so the wall
    // away from the middle shows more, on both fields.
    for (const scene of [SHORTEST_SCENE, TALL_SCENE]) {
      const row = scene.field.height - 152;
      for (const [x, more, less] of [
        [SIZE_START / 2, 'left', 'right'],
        [FIELD_WIDTH - SIZE_START / 2, 'right', 'left'],
      ] as const) {
        const { layers, renderer } = attached(scene);
        frame(layers, renderer, grave(SIZE_START, x, row));
        const view = renderer.holeView();
        expect(
          wallReach(view, SIZE_START, more) - wallReach(view, SIZE_START, less),
          `${scene.field.height} ${x}`,
        ).toBeGreaterThan(0.5);
      }
    }
  });

  it("the grave's drawn opening covers its hitbox: the play layer's image of each hitbox corner lies inside the drawn opening, and along, the opening's far and near ends are the hitbox's rows, at the left edge, the middle and the right edge, near the top and on the lowest row", () => {
    // A29 as ruled after slice B: a hit never looks like a miss, so the
    // drawn opening covers the hitbox's play-layer image at every position
    // and size, on both fields (T12).
    for (const scene of [SHORTEST_SCENE, TALL_SCENE]) {
      for (const size of [SIZE_START, SIZE_CEILING]) {
        const half = graveWidth(size) / 2;
        for (const x of [half, 270, FIELD_WIDTH - half]) {
          for (const y of [size, scene.field.height - size]) {
            const { layers, renderer } = attached(scene);
            frame(layers, renderer, grave(size, x, y));
            const opening = drawnOpening(renderer.corners.pit, size);
            const label = `${scene.field.height} ${size} ${x},${y}`;
            const far = playToColumn(scene.playLayer, x, y - size).y;
            const near = playToColumn(scene.playLayer, x, y + size).y;
            for (const [at, row] of [
              [0, far],
              [1, far],
              [2, near],
              [3, near],
            ] as const) {
              expect(
                Math.abs((opening[at]?.y ?? NaN) - row),
                `${label} row of corner ${at}`,
              ).toBeLessThan(1e-6);
            }
            for (const [dx, dy] of CORNER_WAYS) {
              const corner = playToColumn(
                scene.playLayer,
                x + dx * half,
                y + dy * size,
              );
              expect(
                outsideBy(opening, corner),
                `${label} hitbox corner ${dx},${dy}`,
              ).toBeLessThanOrEqual(1e-6);
            }
          }
        }
      }
    }
  });

  it("the drawn opening's centre is where the play layer draws the centre of the grave's hitbox, within half a CSS pixel, at the left edge, the middle and the right edge, on the top, middle and bottom rows, at the start size and the ceiling, on both fields", () => {
    // Mark, playing the build before this slice: he was hurt with nothing
    // near him and a corpse under the drawn grave was not swallowed, because
    // the grave drew where the sim's hitbox was not. The drawn opening's
    // centre is where the mesh draws the centre of the painted opening, the
    // crossing of the opening's diagonals; the hitbox's centre is the grave's
    // field point. Half a CSS pixel of a 390-wide phone is 0.5 * 540 / 390
    // column units.
    const halfPixel = (0.5 * 540) / 390;
    for (const scene of [SHORTEST_SCENE, TALL_SCENE]) {
      for (const size of [SIZE_START, SIZE_CEILING]) {
        const half = graveWidth(size) / 2;
        const rows = [size, scene.field.height / 2, scene.field.height - size];
        for (const x of [half, 270, FIELD_WIDTH - half]) {
          for (const y of rows) {
            const { layers, renderer } = attached(scene);
            frame(layers, renderer, grave(size, x, y));
            const opening = drawnOpening(renderer.corners.pit, size);
            const centre = diagonalsCross([
              opening[0] ?? ORIGIN_POINT,
              opening[1] ?? ORIGIN_POINT,
              opening[2] ?? ORIGIN_POINT,
              opening[3] ?? ORIGIN_POINT,
            ]);
            const placed = playToColumn(scene.playLayer, x, y);
            expect(
              Math.hypot(centre.x - placed.x, centre.y - placed.y),
              `${scene.field.height} ${size} ${x},${y}`,
            ).toBeLessThanOrEqual(halfPixel);
          }
        }
      }
    }
  });
});
