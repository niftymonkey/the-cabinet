/**
 * The ground under the field. Render only: every placement is a function of the
 * run's own tick, so a replay rendering a pinned tape at a chosen tick draws
 * the ground the run drew.
 */

import type { Container, Sprite } from 'pixi.js';
import { Mesh, Texture, TextureSource } from 'pixi.js';
import { describe, expect, it } from 'vitest';

import { FIELD_WIDTH, fieldOfHeight } from '../../../../game/field';
import { advanceTerritory } from '../../../../game/lines/territory';
import type { RunState } from '../../../../game/run';
import { createRun } from '../../../../game/run';
import type { SetPiece } from '../../../../game/stage/setPiece';
import { SECTIONS } from '../../../../game/stage/stage';
import { SET_PIECE_HALF_WIDTH } from '../../../../game/stage/waves';
import { SCROLL_SPEED } from '../../../../game/tuning';
import { PALETTE, PHOTO_TINT } from '../../../palette';
import type { BackgroundProps } from '../BackgroundRenderer';
import {
  BackgroundRenderer,
  DRESSING_INTERVAL_TICKS,
  DRESSING_ON_SCREEN,
  DRIFT_WINDOW_TICKS,
} from '../BackgroundRenderer';
import { columnToGround, groundToColumn } from '../camera';
import { SHORTEST_FIELD } from '../../../../game/field';
import { sceneFor } from '../scene';
import { artAt, DRESSING_SETS, EYE_CELL_PIXELS } from '../groundDressing';
import { groundGrid } from '../groundMesh';
import { FieldLayers, LAYER_ORDER } from '../layering';
import { playToColumn } from '../playLayer';
import { lyingOnPlay } from '../playPlacement';
import type { Scene } from '../scene';

// The shortest field's scene, the one this file's values were pinned on (tilted view A34).
const {
  camera: SHORTEST_CAMERA,
  column: SHORTEST_COLUMN,
  playLayer: SHORTEST_PLAY_LAYER,
} = sceneFor(SHORTEST_FIELD);

// A 390 by 844 phone's field, where the ground's rate is checked a second time (T12).
const TALL_SCENE = sceneFor(fieldOfHeight(1168));

/**
 * The play layer's stretch on each field, ground units along per field unit
 * along, from the design record's two play layer tables (A18, T12).
 */
const STRETCH_760 = 1.395512705;
const STRETCH_1168 = 2.1824589778;

/** The sim's scroll, 38 field units a second at 60 ticks a second. */
const SCROLL_PER_TICK = 38 / 60;

/** The stand-in photo's alias, under which the ground asks for it. */
const GROUND_PHOTO_ALIAS = 'standIn/ground/forest-ground.jpg';

/** The field units one tile of the photo covers across and along (tilted view T13). */
const PHOTO_TILE = 512;

/**
 * Every change the photo's style announces, with the wrap it announced: the
 * sampler the GPU binds is rebuilt from an announced style.
 */
function announcing(texture: Texture): string[] {
  const announced: string[] = [];
  const style = texture.source.style;
  style.on('change', () =>
    announced.push(`${style.addressModeU} ${style.addressModeV}`),
  );
  return announced;
}

function groundOf(layers: FieldLayers): Mesh {
  return layers.layer('ground').children[0] as Mesh;
}

/**
 * The design record's table for the ground the column sees (tilted view,
 * "Values are data"), worked independently of the camera module.
 */
const SEEN = {
  top: -392.9235,
  bottom: 667.6662,
  farLeft: -227.7284,
  farRight: 767.7284,
};

/** The record's numbers are given to four places. */
const RECORD_CLOSE = 1e-3;

/** Where a dressing piece's foot is on the ground, and how wide it is there. */
function footOnGround(sprite: Sprite): { x: number; y: number; half: number } {
  const foot = columnToGround(SHORTEST_CAMERA, sprite.x, sprite.y);
  if (foot === null)
    throw new Error('a dressing piece stands above the horizon');
  const { scale } = groundToColumn(SHORTEST_CAMERA, foot.x, foot.y);
  return { x: foot.x, y: foot.y, half: sprite.width / scale / 2 };
}

/** The ground's texture row under one grid vertex, in field units of the photo's tile. */
function groundRowAt(layers: FieldLayers, vertex: number): number {
  const v = groundOf(layers).geometry.uvs[vertex * 2 + 1];
  if (v === undefined) throw new Error(`no ground vertex ${vertex}`);
  return v * PHOTO_TILE;
}

/** The renderer attached and handed a run's scene. */
function attachedOn(scene: Scene): {
  layers: FieldLayers;
  renderer: BackgroundRenderer;
} {
  const rig = attached();
  rig.renderer.useScene(scene);
  return rig;
}

/**
 * How far the ground has scrolled, in ground units, at each of these rising
 * ticks since tick 0, read off the texture row under one vertex. The photo
 * repeats every tile, so each reading is unwrapped to the first repeat at or
 * past the one before, which holds while no two samples are a whole repeat
 * apart; it is measured against tick 0 each time, so rounding is never added
 * up.
 */
function scrolledAt(scene: Scene, ticks: readonly number[]): number[] {
  const { layers, renderer } = attachedOn(scene);
  renderer.sync(runInSection('procession', 0, 0));
  const start = groundRowAt(layers, 0);
  let last = 0;
  return ticks.map((tick) => {
    renderer.sync(runInSection('procession', tick, tick));
    const raw = start - groundRowAt(layers, 0);
    last = raw + PHOTO_TILE * Math.ceil((last - raw) / PHOTO_TILE - 1e-9);
    return last;
  });
}

/**
 * A texture per alias, made without a renderer. Every alias answers a source of
 * its own so a test can tell one piece of art from another by identity, which
 * is the only handle a headless test has on which sprite is drawing what.
 */
function artStub(): BackgroundProps & { asked: string[] } {
  const made = new Map<string, Texture>();
  const asked: string[] = [];
  return {
    asked,
    standInArt: (alias: string): Texture | null => {
      asked.push(alias);
      const held = made.get(alias);
      if (held !== undefined) return held;
      const texture = new Texture({
        source: new TextureSource({ width: 64, height: 64 }),
      });
      made.set(alias, texture);
      return texture;
    },
  };
}

/** The renderer, attached, with its art already answerable. */
function attached(props: BackgroundProps = artStub()): {
  layers: FieldLayers;
  renderer: BackgroundRenderer;
} {
  const layers = new FieldLayers();
  const renderer = new BackgroundRenderer(props);
  renderer.attach(layers);
  return { layers, renderer };
}

/** A run standing in one section of the table, at a chosen tick inside it. */
function runInSection(
  section: string,
  tick: number,
  sectionTick: number,
): RunState {
  const run = createRun(19);
  run.tick = tick;
  run.stage.sectionIndex = SECTIONS.findIndex((each) => each.name === section);
  run.stage.sectionTick = sectionTick;
  return run;
}

/** A source standing on the field, at a chosen place and state. */
function sourceOnField(at: { x: number; y: number; open: boolean }): SetPiece {
  return { id: 7, budget: 40, pourIn: 3, hp: 900, bodyGone: false, ...at };
}

/**
 * How wide the Crowd's eye dressing draws, read off the renderer rather than
 * worked out from its rows: the source's size is derived from the same scale,
 * so an assertion built from that scale would move with what it is checking.
 */
function drawnEyeWidth(): number {
  const index = [...Array(200).keys()].find(
    (each) => artAt(DRESSING_SETS.crowd, each).cell?.width === EYE_CELL_PIXELS,
  );
  if (index === undefined) throw new Error('the Crowd places no eye dressing');
  const { layers, renderer } = attached();
  renderer.sync(runInSection('crowd', index * DRESSING_INTERVAL_TICKS, 1e6));
  const eye = dressing(layers)[0];
  if (eye === undefined) throw new Error('the ground layer holds no dressing');
  // In field units: the camera draws it at its row's scale across (A7).
  return footOnGround(eye).half * 2;
}

function dressing(layers: FieldLayers): Sprite[] {
  const children = layers.layer('ground').children as Container[];
  // The ground's mesh is first and the source's two sprites are last.
  return children.slice(1, children.length - 2) as Sprite[];
}

/** The child this many slots from the end of a children list, or a bug if there is none. */
function fromEnd<T>(children: readonly T[], offset: number): T {
  const found = children[children.length - offset];
  if (found === undefined) throw new Error(`no child ${offset} from the end`);
  return found;
}

function tintsShowing(layers: FieldLayers): Set<number> {
  return new Set(
    dressing(layers)
      .filter((sprite) => sprite.visible)
      .map((sprite) => sprite.tint),
  );
}

describe('the stand-in ground (module 105)', () => {
  it('draws into the ground layer and leaves every other layer empty', () => {
    const { layers } = attached();
    expect(layers.layer('ground').children.length).toBeGreaterThan(0);
    const others = LAYER_ORDER.filter((name) => name !== 'ground').flatMap(
      (name) => (layers.layer(name).children.length > 0 ? [name] : []),
    );
    expect(others).toEqual([]);
  });

  it('adds no layer name, so the stack ADR 0014 fixes is untouched', () => {
    // The stack is pinned as a literal in layering.test.ts; what this holds is
    // the other half of it, that the renderer asked for a name that was already
    // there rather than one of its own.
    const { layers } = attached();
    expect(LAYER_ORDER).toContain('ground');
    expect(layers.layer('ground').children.length).toBeGreaterThan(0);
  });

  it('dresses the ground thickly, at an interval derived from the density row', () => {
    // The density is authored as placements in flight and the interval falls out
    // of it and the crossing, never the other way round: the crossing halved
    // when the ground took the field's own scroll, and an interval held fixed
    // would have halved the dressing with it.
    expect(DRESSING_INTERVAL_TICKS * DRESSING_ON_SCREEN).toBeGreaterThan(
      DRIFT_WINDOW_TICKS - DRESSING_INTERVAL_TICKS,
    );
    expect(DRESSING_INTERVAL_TICKS * DRESSING_ON_SCREEN).toBeLessThan(
      DRIFT_WINDOW_TICKS + DRESSING_INTERVAL_TICKS,
    );

    // And the count itself, which is Mark's own ruling of 2026-09-08 and not a
    // derivation: about twenty-five to thirty pieces standing on the field at
    // once, against the ten slice 13b showed him. It runs under the row because
    // the crossing is the tallest piece's and a short one leaves earlier.
    const { layers, renderer } = attached();
    for (const tick of [12000, 26000, 40000]) {
      renderer.sync(runInSection('crowd', tick, tick));
      const showing = dressing(layers).filter(
        (sprite) => sprite.visible,
      ).length;
      expect(showing).toBeGreaterThanOrEqual(25);
      expect(showing).toBeLessThanOrEqual(DRESSING_ON_SCREEN);
    }
  });

  it('places the same dressing at a tick however the renderer reached it', () => {
    // A replay renders a pinned tape at a chosen tick, so a ground that
    // depended on which frames had been drawn on the way there would put its
    // statues somewhere else in the recording than it did in the run.
    const straight = attached();
    straight.renderer.sync(runInSection('procession', 4000, 4000));
    const walked = attached();
    for (const tick of [10, 900, 2500, 3999, 4000]) {
      walked.renderer.sync(runInSection('procession', tick, tick));
    }
    // What is drawn, and never what a hidden slot happens to still be wearing:
    // a slot off the bottom edge keeps the last placement it carried, which no
    // frame shows and no replay can be told apart by.
    const read = (layers: FieldLayers) =>
      dressing(layers)
        .filter((sprite) => sprite.visible)
        .map(
          (sprite) =>
            `${sprite.x.toFixed(3)} ${sprite.y.toFixed(3)} ${sprite.tint} ${sprite.width.toFixed(3)}`,
        );
    expect(read(walked.layers).length).toBeGreaterThan(1);
    expect(read(walked.layers)).toEqual(read(straight.layers));
  });

  it('dresses the ground a run opens on, rather than filling it in over a window', () => {
    // The stream reaches back before the run's first tick, so the Procession
    // does not open on bare rock for the whole of a drift window.
    const { layers, renderer } = attached();
    renderer.sync(runInSection('procession', 0, 0));
    const showing = dressing(layers).filter((sprite) => sprite.visible);
    expect(showing.length).toBeGreaterThan(1);
    expect(tintsShowing(layers)).toEqual(
      new Set([DRESSING_SETS.procession.tint.hex]),
    );
  });

  it('asks for a texture again while its bundle is still coming, and draws nothing until it lands', () => {
    let answering = false;
    const stub = artStub();
    const { layers, renderer } = attached({
      standInArt: (alias) => (answering ? stub.standInArt(alias) : null),
    });
    renderer.sync(runInSection('procession', 1200, 1200));
    expect(dressing(layers).filter((sprite) => sprite.visible)).toEqual([]);
    answering = true;
    renderer.sync(runInSection('procession', 1200, 1200));
    expect(
      dressing(layers).filter((sprite) => sprite.visible).length,
    ).toBeGreaterThan(0);
  });

  it('draws its pixel art nearest-neighbour, per texture and never as a default', () => {
    // The photo under it is not pixel art and is sampled linearly (T13), which
    // the ground photo's own test holds.
    const stub = artStub();
    const { renderer } = attached(stub);
    renderer.sync(runInSection('vigil', 3000, 3000));
    const modes = stub.asked
      .filter((alias) => alias !== GROUND_PHOTO_ALIAS)
      .map((alias) => stub.standInArt(alias)?.source.scaleMode);
    expect(modes.length).toBeGreaterThan(0);
    expect([...new Set(modes)]).toEqual(['nearest']);
  });
});

describe('the ground is the stand-in photo (tilted view T13)', () => {
  it('the ground is the photo, laid once its bundle brings it, under the night tint', () => {
    // T13: Mark's tilt 13 settings, texture real and light night. The photo
    // comes through the stand-in bundle like the dressing, so the ground is
    // empty for the frames before it lands, and it wears the prototype's
    // Night, a plain multiply, and nothing else.
    let answering = false;
    const stub = artStub();
    const { layers, renderer } = attached({
      standInArt: (alias) => (answering ? stub.standInArt(alias) : null),
    });
    renderer.sync(runInSection('procession', 0, 0));
    expect(groundOf(layers).texture).toBe(Texture.EMPTY);
    answering = true;
    renderer.sync(runInSection('procession', 1, 1));
    expect(groundOf(layers).texture).toBe(stub.standInArt(GROUND_PHOTO_ALIAS));
    expect(groundOf(layers).tint).toBe(PHOTO_TINT.groundNight);
  });

  it('the photo repeats plainly, is sampled linearly and is mipmapped, and its style is announced', () => {
    // T13, the prototype's loadGroundPhoto: the photo is seamless, so it
    // repeats plainly rather than mirrored; it is linear and mipmapped so the
    // far ground, packed tight, does not shimmer. WebGL2 binds a sampler built
    // from the style and cached by its id, so the style has to announce the
    // change (the prototype's own fix).
    const stub = artStub();
    const photo = stub.standInArt(GROUND_PHOTO_ALIAS);
    if (photo === null) throw new Error('the stub answers every alias');
    const announced = announcing(photo);
    const { layers, renderer } = attached(stub);
    renderer.sync(runInSection('procession', 0, 0));
    const source = groundOf(layers).texture.source;
    expect([source.style.addressModeU, source.style.addressModeV]).toEqual([
      'repeat',
      'repeat',
    ]);
    expect(source.scaleMode).toBe('linear');
    expect(source.autoGenerateMipmaps).toBe(true);
    expect(announced).toContain('repeat repeat');
  });

  it('one tile of the photo covers 512 field units across and along', () => {
    // T13, the prototype's GROUND_PHOTO_TILE: every vertex samples the ground
    // the camera shows it over the tile's size, before any scroll.
    const { layers, renderer } = attached();
    renderer.sync(runInSection('procession', 0, 0));
    const grid = groundGrid(
      SHORTEST_CAMERA,
      SHORTEST_COLUMN,
      { width: PHOTO_TILE, height: PHOTO_TILE },
      0,
    );
    expect([...groundOf(layers).geometry.uvs]).toEqual([...grid.uvs]);
  });

  it("the dressing and the Waking's source still draw over the photo", () => {
    // ADR 0049's dressing and the Waking's own source are untouched by the
    // ruling: the ground it draws on changed and the layer order did not, so
    // the ground's mesh stays the bottom child of the one ground layer.
    const { layers, renderer } = attached();
    const run = runInSection('waking', 20000, 200);
    run.setPiece = sourceOnField({ x: 200, y: 380, open: true });
    renderer.sync(run);
    const children = layers.layer('ground').children as Container[];
    expect(groundOf(layers).texture).not.toBe(Texture.EMPTY);
    expect(children[0]).toBe(groundOf(layers));
    expect(
      dressing(layers).filter((sprite) => sprite.visible).length,
    ).toBeGreaterThan(0);
    expect(fromEnd(children, 1).visible).toBe(true);
    for (const piece of children.slice(1)) {
      expect(layers.layer('ground').getChildIndex(piece)).toBeGreaterThan(0);
    }
  });
});

describe('the drift between two sections (module 106)', () => {
  it('draws both families through the window and only the incoming one after it', () => {
    const { layers, renderer } = attached();
    const incoming = DRESSING_SETS.crowd.tint.hex;
    const outgoing = DRESSING_SETS.procession.tint.hex;

    // The tick the Banshee died: everything on screen was placed by the
    // Procession and nothing has been placed by the Crowd yet.
    const died = 9001;
    renderer.sync(runInSection('crowd', died, 0));
    expect(tintsShowing(layers)).toEqual(new Set([outgoing]));

    // Mid-window: both families are on screen at once, which is the drift.
    const middle = Math.floor(DRIFT_WINDOW_TICKS / 2);
    renderer.sync(runInSection('crowd', died + middle, middle));
    expect(tintsShowing(layers)).toEqual(new Set([outgoing, incoming]));

    // Past it: the last of the old has left the bottom edge.
    const past = DRIFT_WINDOW_TICKS + DRESSING_INTERVAL_TICKS;
    renderer.sync(runInSection('crowd', died + past, past));
    expect(tintsShowing(layers)).toEqual(new Set([incoming]));
  });

  it('leaves the Banshee and the Waking in the section they end, so two changes fall in a run', () => {
    // Decision 22's amendment: no card, no cut, and the tint departure in the
    // last section. A boundary event wears the section it ends, so the ground
    // turns over once per section rather than once per section.
    const { layers, renderer } = attached();
    const window = DRIFT_WINDOW_TICKS + DRESSING_INTERVAL_TICKS;
    const wears = (section: string) => {
      renderer.sync(runInSection(section, 30000, window));
      return tintsShowing(layers);
    };
    expect(wears('banshee')).toEqual(
      new Set([DRESSING_SETS.procession.tint.hex]),
    );
    expect(wears('waking')).toEqual(new Set([DRESSING_SETS.crowd.tint.hex]));
    expect(wears('undertaker')).toEqual(
      new Set([DRESSING_SETS.vigil.tint.hex]),
    );
  });
});

describe("the Waking's own source", () => {
  it("the Waking's source lies at its play point", () => {
    // A7, A19: the source is a sim thing, so it lies at its play point, at the
    // camera's scale across and the scale squared times the lean down. At
    // field (270, 380) that is row 206.136533 at scale 0.790661 (the record's
    // play layer table), so a square texture draws 0.790661 times the lean,
    // 0.716583, as tall as it is wide.
    const { layers, renderer } = attached();
    const run = runInSection('waking', 20000, 200);
    run.setPiece = sourceOnField({ x: 270, y: 380, open: false });
    renderer.sync(run);
    const children = layers.layer('ground').children as Sprite[];
    const source = fromEnd(children, 1);
    expect(source.texture.frame.width).toBe(source.texture.frame.height);
    expect(source.position.x).toBeCloseTo(270, 9);
    expect(source.position.y).toBeCloseTo(206.136533, 5);
    expect(source.height / source.width).toBeCloseTo(0.716583, 5);
  });

  it('draws nothing while no source stands on the field', () => {
    const { layers, renderer } = attached();
    renderer.sync(runInSection('crowd', 100, 100));
    const children = layers.layer('ground').children as Sprite[];
    expect(children.slice(-2).map((sprite) => sprite.visible)).toEqual([
      false,
      false,
    ]);
  });

  it('draws at three times the dressing eyes, in the Crowd colour and never the Vigil one', () => {
    // The source takes the Crowd's family because it opens as the Crowd's own
    // boundary event, so size is the whole of the stand-in answer to which eye
    // is going to wake (design record section 7).
    const { layers, renderer } = attached();
    const run = runInSection('waking', 20000, 200);
    run.setPiece = sourceOnField({ x: 200, y: 380, open: false });
    renderer.sync(run);
    const children = layers.layer('ground').children as Sprite[];
    const source = fromEnd(children, 1);
    // Against a dressing eye the renderer actually drew, never against the row
    // the source's own size is derived from.
    expect(source.visible).toBe(true);
    // It lies at its own play point (A7, A19), so its drawn width is its width
    // in field units times the scale there.
    const at = lyingOnPlay(SHORTEST_PLAY_LAYER, 200, 380);
    expect(source.position.x).toBeCloseTo(at.x, 6);
    expect(source.position.y).toBeCloseTo(at.y, 6);
    const width = source.width / at.scaleX;
    // Three, from the design record's own sentence, against an eye the renderer
    // drew rather than against the row the source's size comes from.
    expect(width).toBeCloseTo(3 * drawnEyeWidth(), 6);
    // And the drawn body is its own hitbox, so the storm hits what a player
    // sees. The dressing scale is a row rather than a derivation, so this is
    // what holds the two ends together.
    expect(width).toBeCloseTo(2 * SET_PIECE_HALF_WIDTH, 6);
    expect(source.tint).toBe(PALETTE.standInWaking.hex);
    expect(source.tint).not.toBe(PALETTE.standInVigilTint.hex);
  });

  it('draws nothing once the body is gone, while the source is still pouring', () => {
    // Mark's ruling on #104: the kill takes the body and the pour finishes
    // anyway, so the record is still on the run with a budget on it while
    // there is nothing left on the ground to draw. The view reads the fact off
    // the record and derives nothing from the health beside it.
    const { layers, renderer } = attached();
    const run = runInSection('waking', 20000, 200);
    run.setPiece = { ...sourceOnField({ x: 270, y: 400, open: true }) };
    renderer.sync(run);
    const children = layers.layer('ground').children as Sprite[];

    expect(children.slice(-2).map((sprite) => sprite.visible)).toEqual([
      true,
      true,
    ]);

    run.setPiece = { ...run.setPiece, bodyGone: true, hp: 0 };
    renderer.sync(run);

    expect(children.slice(-2).map((sprite) => sprite.visible)).toEqual([
      false,
      false,
    ]);
  });

  it('stands its dark companion out past its body, so it reads on the dressing as well as the tile', () => {
    const { layers, renderer } = attached();
    const run = runInSection('waking', 20000, 200);
    run.setPiece = sourceOnField({ x: 270, y: 400, open: true });
    renderer.sync(run);
    const children = layers.layer('ground').children as Sprite[];
    const rim = fromEnd(children, 2);
    const source = fromEnd(children, 1);
    expect(rim.tint).toBe(PALETTE.standInWakingDark.hex);
    expect(rim.width).toBeGreaterThan(source.width);
    expect(rim.height).toBeGreaterThan(source.height);
    expect(layers.layer('ground').getChildIndex(rim)).toBeLessThan(
      layers.layer('ground').getChildIndex(source),
    );
  });
});

describe('the ground under the tilted camera (tilted view A7, A9)', () => {
  it('the ground is a mesh laid on the column over the photo', () => {
    // A9: a grid laid on the column, each vertex sampling the ground the
    // camera shows it, over the photo repeating across and down, because the
    // far row sees 995.5 units of ground across 512-unit tiles.
    const { layers, renderer } = attached();
    renderer.sync(runInSection('procession', 0, 0));
    const floor = groundOf(layers);
    expect(floor).toBeInstanceOf(Mesh);
    const grid = groundGrid(
      SHORTEST_CAMERA,
      SHORTEST_COLUMN,
      { width: PHOTO_TILE, height: PHOTO_TILE },
      0,
    );
    expect([...floor.geometry.positions]).toEqual([...grid.positions]);
    expect(floor.texture).not.toBe(Texture.EMPTY);
  });
  it("the ground runs at the rate a lying thing on the middle column drifts: over a number of ticks its texture moves by that many ticks of the sim's scroll times the scene's stretch, 1.395513 on the 760 field and 2.182459 on the 1168 one, in ground units", () => {
    // A22, T12: on the play layer a field unit along is the stretch in ground
    // units, so a patch lobbed onto the middle column stays on the ground it
    // landed on only if the ground runs that much faster than the sim's
    // scroll (Mark's slice 13b ruling). The sim's scroll is read by drifting a
    // real patch through the sim rather than off the renderer's own row.
    const run = createRun(19);
    const patch = run.patches[0];
    if (patch === undefined) throw new Error('no patch pool slot 0');
    patch.alive = true;
    patch.y = 100;
    patch.radius = 40;
    const ticks = 120;
    for (let each = 0; each < ticks; each++) advanceTerritory(run);
    const patchFell = patch.y - 100;
    expect(patchFell).toBeCloseTo(ticks * SCROLL_PER_TICK, 9);

    for (const [scene, stretch] of [
      [sceneFor(SHORTEST_FIELD), STRETCH_760],
      [TALL_SCENE, STRETCH_1168],
    ] as const) {
      const height = scene.field.height;
      const { layers, renderer } = attachedOn(scene);
      renderer.sync(runInSection('procession', 0, 0));
      const from = [0, 300, 700].map((vertex) => groundRowAt(layers, vertex));
      renderer.sync(runInSection('procession', ticks, ticks));
      const to = [0, 300, 700].map((vertex) => groundRowAt(layers, vertex));
      // The mesh keeps its texture rows as float32, each rounded to 2^-24 of
      // its size, and the far vertices sample ground several tiles away, so
      // each move is read to that grid.
      to.forEach((row, at) => {
        const start = from[at] ?? NaN;
        const float32Grid = (Math.abs(start) + Math.abs(row)) * 2 ** -24;
        expect(
          Math.abs(start - row - patchFell * stretch),
          `${height} vertex ${at}`,
        ).toBeLessThanOrEqual(float32Grid + 1e-9);
      });
    }
  });

  it('a patch on the middle column stays on its ground: a field point on column x 270 and the ground point under it at the start stay on one column row over the whole trip down the column, on the 760 and the 1168 field', () => {
    // A22: a lying thing on the middle column drifts down the field at the
    // sim's scroll and is drawn on the play layer; the ground under it is
    // drawn by the camera and runs at the renderer's own scroll. From the top
    // row to the bottom, the ground point it landed on stays on its row. The
    // mesh keeps its texture rows as float32, so the ground is read to that
    // grid: two rows of up to two field heights each, rounded to 2^-24 of
    // their size, and at most 1.4 column rows per ground unit on the column.
    for (const scene of [sceneFor(SHORTEST_FIELD), TALL_SCENE]) {
      const height = scene.field.height;
      const float32Grid = 2 * 2 * height * 2 ** -24 * 1.4;
      const trip = Math.floor(height / SCROLL_PER_TICK);
      const ticks = Array.from(
        { length: 20 },
        (_, step) => ((step + 1) * trip) / 20,
      ).map(Math.floor);
      const scrolled = scrolledAt(scene, ticks);
      const landedRow = playToColumn(scene.playLayer, 270, 0).y;
      const landedOn = columnToGround(scene.camera, 270, landedRow);
      if (landedOn === null) throw new Error('the top row shows no ground');
      ticks.forEach((tick, at) => {
        const patchRow = playToColumn(
          scene.playLayer,
          270,
          tick * SCROLL_PER_TICK,
        ).y;
        const groundRow = groundToColumn(
          scene.camera,
          270,
          landedOn.y + (scrolled[at] ?? NaN),
        ).y;
        expect(
          Math.abs(patchRow - groundRow),
          `${height} tick ${tick}`,
        ).toBeLessThan(float32Grid);
      });
    }
  });
  it('the dressing is laid across the far row of the ground the camera sees and falls from its top row to past its bottom row', () => {
    // Laid across the ground the camera sees rather than the old rectangle,
    // so the far corners are dressed too, and on screen for as long as it
    // takes to fall from the top row to past the bottom one.
    const { layers, renderer } = attached();
    const lefts: number[] = [];
    const rights: number[] = [];
    for (let index = 1000; index < 1200; index++) {
      renderer.sync(
        runInSection('procession', index * DRESSING_INTERVAL_TICKS, 1e6),
      );
      const newest = dressing(layers)[0];
      if (newest === undefined || !newest.visible) continue;
      const foot = footOnGround(newest);
      expect(foot.y).toBeCloseTo(SEEN.top, 2);
      lefts.push(foot.x - foot.half);
      rights.push(foot.x + foot.half);
    }
    expect(lefts.length).toBeGreaterThan(100);
    expect(Math.min(...lefts)).toBeLessThan(0);
    expect(Math.min(...lefts)).toBeGreaterThanOrEqual(
      SEEN.farLeft - RECORD_CLOSE,
    );
    expect(Math.max(...rights)).toBeGreaterThan(FIELD_WIDTH);
    expect(Math.max(...rights)).toBeLessThanOrEqual(
      SEEN.farRight + RECORD_CLOSE,
    );
  });

  it("the dressing falls from the top row of the ground the camera sees to past its bottom row at the ground's speed", () => {
    // A22: the dressing falls with the ground, at the sim's scroll times the
    // stretch on the 760 field, where its density was authored. A piece laid
    // on the top row has fallen that speed times the ticks since, and the
    // drift window is how long the tallest piece, the cliff (112 pixels at
    // 1.875 units a pixel), takes to clear the bottom row at that speed.
    const speed = SCROLL_PER_TICK * STRETCH_760;
    const index = 1000;
    const { layers, renderer } = attached();
    for (const later of [0, 150, 400]) {
      const tick = index * DRESSING_INTERVAL_TICKS + later;
      renderer.sync(runInSection('procession', tick, 1e6));
      const slot = Math.floor(tick / DRESSING_INTERVAL_TICKS) - index;
      const piece = dressing(layers)[slot];
      if (piece === undefined || !piece.visible) continue;
      expect(footOnGround(piece).y, `${later} ticks later`).toBeCloseTo(
        SEEN.top + later * speed,
        2,
      );
    }
    const fall = SEEN.bottom - SEEN.top + 112 * 1.875;
    expect(DRIFT_WINDOW_TICKS * speed).toBeGreaterThanOrEqual(
      fall - RECORD_CLOSE,
    );
    expect((DRIFT_WINDOW_TICKS - 1) * speed).toBeLessThan(fall + RECORD_CLOSE);
  });

  it('a statue stands and an eye lies', () => {
    // Art drawn front-on stands, upright at the camera's scale on both axes;
    // art drawn from above lies, foreshortened down the column by the lean
    // times the scale where it lies (A7).
    const indexOf = (set: 'procession' | 'crowd', alias: string): number => {
      const found = [...Array(400).keys()].find(
        (each) => artAt(DRESSING_SETS[set], each).alias === alias,
      );
      if (found === undefined) throw new Error(`no ${alias} placed`);
      return found;
    };
    const fallenFor = 400 / SCROLL_SPEED;
    const shown = (set: 'procession' | 'crowd', alias: string): Sprite => {
      const { layers, renderer } = attached();
      const index = indexOf(set, alias);
      const tick = index * DRESSING_INTERVAL_TICKS + Math.round(fallenFor);
      renderer.sync(runInSection(set, tick, 1e6));
      const slot = Math.floor(tick / DRESSING_INTERVAL_TICKS) - index;
      const sprite = dressing(layers)[slot];
      if (sprite === undefined || !sprite.visible)
        throw new Error(`${alias} not shown`);
      return sprite;
    };
    const statue = shown('procession', 'standIn/ground/statue-a1.png');
    expect(statue.scale.y).toBeCloseTo(statue.scale.x, 9);

    const eye = shown('crowd', 'standIn/ground/little-eyes.png');
    const foot = footOnGround(eye);
    const { scale } = groundToColumn(SHORTEST_CAMERA, foot.x, foot.y);
    expect(eye.scale.y / eye.scale.x).toBeCloseTo(scale * 0.906308, 5);
  });

  it('keeps every placement inside the ground the camera sees', () => {
    // Every piece stands inside the far row it was laid across, and nothing
    // is still placed once it has fallen past the bottom row by the tallest
    // piece (A2's trapezoid, bounded in ground units).
    const { layers, renderer } = attached();
    renderer.sync(runInSection('crowd', 5000, 5000));
    const showing = dressing(layers).filter((sprite) => sprite.visible);
    expect(showing.length).toBeGreaterThan(0);
    for (const sprite of showing) {
      const foot = footOnGround(sprite);
      expect(foot.x - foot.half).toBeGreaterThanOrEqual(
        SEEN.farLeft - RECORD_CLOSE,
      );
      expect(foot.x + foot.half).toBeLessThanOrEqual(
        SEEN.farRight + RECORD_CLOSE,
      );
      expect(foot.y).toBeGreaterThanOrEqual(SEEN.top - RECORD_CLOSE);
      expect(foot.y).toBeLessThanOrEqual(
        SEEN.bottom + 112 * 1.875 + RECORD_CLOSE,
      );
    }
  });
});
