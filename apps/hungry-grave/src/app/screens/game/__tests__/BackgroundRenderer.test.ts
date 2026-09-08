/**
 * The ground under the field. Render only: every placement is a function of the
 * run's own tick, so a replay rendering a pinned tape at a chosen tick draws
 * the ground the run drew.
 */

import type { Container, Sprite, TilingSprite } from 'pixi.js';
import { Texture, TextureSource } from 'pixi.js';
import { describe, expect, it } from 'vitest';

import { FIELD_HEIGHT, FIELD_WIDTH } from '../../../../game/field';
import type { RunState } from '../../../../game/run';
import { createRun } from '../../../../game/run';
import { SET_PIECE_HALF_WIDTH } from '../../../../game/stage/rows';
import type { SetPiece } from '../../../../game/stage/setPiece';
import { PHASES } from '../../../../game/stage/stage';
import { SCROLL_SPEED } from '../../../../game/tuning';
import { PALETTE } from '../../../palette';
import type { BackgroundProps } from '../BackgroundRenderer';
import {
  BackgroundRenderer,
  DRESSING_INTERVAL_TICKS,
  DRIFT_WINDOW_TICKS,
  GROUND_SPEED,
} from '../BackgroundRenderer';
import { artAt, DRESSING_SETS, EYE_CELL_PIXELS } from '../groundDressing';
import { FieldLayers, LAYER_ORDER } from '../layering';

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

/** A run standing in one phase of the table, at a chosen tick inside it. */
function runInPhase(phase: string, tick: number, phaseTick: number): RunState {
  const run = createRun(19);
  run.tick = tick;
  run.stage.phaseIndex = PHASES.findIndex((each) => each.name === phase);
  run.stage.phaseTick = phaseTick;
  return run;
}

/** A source standing on the field, at a chosen place and state. */
function sourceOnField(at: { x: number; y: number; open: boolean }): SetPiece {
  return { id: 7, budget: 40, pourIn: 3, hp: 900, ...at };
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
  renderer.sync(runInPhase('crowd', index * DRESSING_INTERVAL_TICKS, 1e6));
  return dressing(layers)[0].width;
}

function dressing(layers: FieldLayers): Sprite[] {
  const children = layers.layer('ground').children as Container[];
  // The tiled ground is first and the source's two sprites are last.
  return children.slice(1, children.length - 2) as Sprite[];
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

  it('runs the ground at half the field, so the rock reads as depth under the bodies', () => {
    // The half is held against the sim's own scroll row rather than against the
    // renderer's, or the assertion moves with the thing it is checking.
    expect(GROUND_SPEED).toBeCloseTo(SCROLL_SPEED / 2, 10);
    const { layers, renderer } = attached();
    const tiles = layers.layer('ground').children[0] as TilingSprite;
    renderer.sync(runInPhase('procession', 600, 600));
    expect(tiles.tilePosition.y).toBeCloseTo(600 * GROUND_SPEED, 6);
  });

  it('places the same dressing at a tick however the renderer reached it', () => {
    // A replay renders a pinned tape at a chosen tick, so a ground that
    // depended on which frames had been drawn on the way there would put its
    // statues somewhere else in the recording than it did in the run.
    const straight = attached();
    straight.renderer.sync(runInPhase('procession', 4000, 4000));
    const walked = attached();
    for (const tick of [10, 900, 2500, 3999, 4000]) {
      walked.renderer.sync(runInPhase('procession', tick, tick));
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
    renderer.sync(runInPhase('procession', 0, 0));
    const showing = dressing(layers).filter((sprite) => sprite.visible);
    expect(showing.length).toBeGreaterThan(1);
    expect(tintsShowing(layers)).toEqual(
      new Set([DRESSING_SETS.procession.tint.hex]),
    );
  });

  it('keeps every placement inside the field it drifts down', () => {
    const { layers, renderer } = attached();
    renderer.sync(runInPhase('crowd', 5000, 5000));
    for (const sprite of dressing(layers)) {
      if (!sprite.visible) continue;
      expect(sprite.x - sprite.width / 2).toBeGreaterThanOrEqual(-0.001);
      expect(sprite.x + sprite.width / 2).toBeLessThanOrEqual(
        FIELD_WIDTH + 0.001,
      );
      expect(sprite.y - sprite.height).toBeLessThanOrEqual(FIELD_HEIGHT);
    }
  });

  it('asks for a texture again while its bundle is still coming, and draws nothing until it lands', () => {
    let answering = false;
    const stub = artStub();
    const { layers, renderer } = attached({
      standInArt: (alias) => (answering ? stub.standInArt(alias) : null),
    });
    renderer.sync(runInPhase('procession', 1200, 1200));
    expect(dressing(layers).filter((sprite) => sprite.visible)).toEqual([]);
    answering = true;
    renderer.sync(runInPhase('procession', 1200, 1200));
    expect(
      dressing(layers).filter((sprite) => sprite.visible).length,
    ).toBeGreaterThan(0);
  });

  it('draws its pixel art nearest-neighbour, per texture and never as a default', () => {
    const stub = artStub();
    const { renderer } = attached(stub);
    renderer.sync(runInPhase('vigil', 3000, 3000));
    const modes = stub.asked.map(
      (alias) => stub.standInArt(alias)?.source.scaleMode,
    );
    expect(modes.length).toBeGreaterThan(0);
    expect([...new Set(modes)]).toEqual(['nearest']);
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
    renderer.sync(runInPhase('crowd', died, 0));
    expect(tintsShowing(layers)).toEqual(new Set([outgoing]));

    // Mid-window: both families are on screen at once, which is the drift.
    const middle = Math.floor(DRIFT_WINDOW_TICKS / 2);
    renderer.sync(runInPhase('crowd', died + middle, middle));
    expect(tintsShowing(layers)).toEqual(new Set([outgoing, incoming]));

    // Past it: the last of the old has left the bottom edge.
    const past = DRIFT_WINDOW_TICKS + DRESSING_INTERVAL_TICKS;
    renderer.sync(runInPhase('crowd', died + past, past));
    expect(tintsShowing(layers)).toEqual(new Set([incoming]));
  });

  it('leaves the Banshee and the Waking in the section they end, so two changes fall in a run', () => {
    // Decision 22's amendment: no card, no cut, and the tint departure in the
    // last section. A boundary event wears the section it ends, so the ground
    // turns over once per section rather than once per phase.
    const { layers, renderer } = attached();
    const window = DRIFT_WINDOW_TICKS + DRESSING_INTERVAL_TICKS;
    const wears = (phase: string) => {
      renderer.sync(runInPhase(phase, 30000, window));
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
  it('draws nothing while no source stands on the field', () => {
    const { layers, renderer } = attached();
    renderer.sync(runInPhase('crowd', 100, 100));
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
    const run = runInPhase('waking', 20000, 200);
    run.setPiece = sourceOnField({ x: 200, y: 380, open: false });
    renderer.sync(run);
    const children = layers.layer('ground').children as Sprite[];
    const source = children[children.length - 1];
    // Against a dressing eye the renderer actually drew, never against the row
    // the source's own size is derived from.
    expect(source.visible).toBe(true);
    // Three, from the design record's own sentence, against an eye the renderer
    // drew rather than against the row the source's size comes from.
    expect(source.width).toBeCloseTo(3 * drawnEyeWidth(), 6);
    // And the drawn body is its own hitbox, so the storm hits what a player
    // sees. The dressing scale is a row rather than a derivation, so this is
    // what holds the two ends together.
    expect(source.width).toBeCloseTo(2 * SET_PIECE_HALF_WIDTH, 6);
    expect(source.position.x).toBe(200);
    expect(source.position.y).toBe(380);
    expect(source.tint).toBe(PALETTE.standInWaking.hex);
    expect(source.tint).not.toBe(PALETTE.standInVigilTint.hex);
  });

  it('stands its dark companion out past its body, so it reads on the dressing as well as the tile', () => {
    const { layers, renderer } = attached();
    const run = runInPhase('waking', 20000, 200);
    run.setPiece = sourceOnField({ x: 270, y: 400, open: true });
    renderer.sync(run);
    const children = layers.layer('ground').children as Sprite[];
    const rim = children[children.length - 2];
    const source = children[children.length - 1];
    expect(rim.tint).toBe(PALETTE.standInWakingDark.hex);
    expect(rim.width).toBeGreaterThan(source.width);
    expect(rim.height).toBeGreaterThan(source.height);
    expect(layers.layer('ground').getChildIndex(rim)).toBeLessThan(
      layers.layer('ground').getChildIndex(source),
    );
  });
});
