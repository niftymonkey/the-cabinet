/**
 * The player's fire on screen. Render only: it reads the sim's pools and draws
 * them, and holds no rules.
 */

import type { Graphics } from 'pixi.js';
import { describe, expect, it } from 'vitest';

import { SKULL_CAP, WISP_CAP } from '../../../game/caps';
import { MAX_STONES } from '../../../game/lines/headstones';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import { RAMP_ROWS } from '../../../game/stage/stage';
import { FieldLayers } from './layering';
import { StormRenderer } from './StormRenderer';

function attached(): { layers: FieldLayers; renderer: StormRenderer } {
  const layers = new FieldLayers();
  const renderer = new StormRenderer();
  renderer.attach(layers);
  return { layers, renderer };
}

function quietRun(seed = 18): RunState {
  const run = createRun(seed);
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

function children(
  layers: FieldLayers,
  name: 'storm' | 'bellRing' | 'belchEruption',
) {
  return layers.layer(name).children as Graphics[];
}

function putSkull(state: RunState, slot: number, x: number, y: number) {
  const skull = state.skulls[slot];
  skull.alive = true;
  skull.id = 100 + slot;
  skull.x = x;
  skull.y = y;
  skull.vx = 0;
  skull.vy = -7;
  return skull;
}

function putWisp(state: RunState, slot: number, x: number, y: number) {
  const wisp = state.wisps[slot];
  wisp.alive = true;
  wisp.id = 200 + slot;
  wisp.x = x;
  wisp.y = y;
  wisp.vx = 5;
  wisp.vy = 0;
  wisp.life = 60;
  wisp.targetId = null;
  return wisp;
}

describe("the storm's sprite pools (plan 6.19)", () => {
  it('holds a sprite per entity cap, so a spawn never allocates', () => {
    const { layers } = attached();
    // The storm layer carries the skulls, the stones and the wisps.
    expect(children(layers, 'storm')).toHaveLength(
      SKULL_CAP + MAX_STONES + WISP_CAP,
    );
    expect(children(layers, 'bellRing')).toHaveLength(1);
    // The eruption and the splash, both momentary and both with no sim entity.
    expect(children(layers, 'belchEruption')).toHaveLength(2);
  });

  it('allocates nothing when a skull or a wisp spawns', () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    const before = children(layers, 'storm').length;
    putSkull(state, 0, 100, 100);
    putWisp(state, 0, 200, 200);
    renderer.sync(state);
    expect(children(layers, 'storm')).toHaveLength(before);
  });

  it('draws in the four layers SPRITE_LAYER assigns, and nowhere else', () => {
    // The order is ADR 0014's and it is not this renderer's to choose: the
    // storm and the bell's ring sit beneath the food, and the eruption beneath
    // both, so no player effect can occlude mob fire.
    const { layers } = attached();
    for (const name of [
      'ground',
      'graveMouth',
      'corpses',
      'mobBodies',
      'treasure',
      'hitDim',
      'graveRim',
      'fieldBoundary',
      'mobFire',
    ] as const) {
      expect(`${name}: ${layers.layer(name).children.length}`).toBe(
        `${name}: 0`,
      );
    }
  });
});

describe('sprites follow their slots (plan 6.19)', () => {
  it('shows a live slot at its own position and hides a dead one', () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    putSkull(state, 3, 120, 340);
    renderer.sync(state);

    const sprites = children(layers, 'storm');
    expect(sprites[3].visible).toBe(true);
    expect(sprites[3].position.x).toBe(120);
    expect(sprites[3].position.y).toBe(340);
    expect(sprites[2].visible).toBe(false);

    state.skulls[3].alive = false;
    renderer.sync(state);
    expect(sprites[3].visible).toBe(false);
  });

  it('orients a wisp to its heading, which is what makes the curve readable', () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    const wisp = putWisp(state, 0, 200, 200);
    renderer.sync(state);
    const sprite = children(layers, 'storm')[SKULL_CAP + MAX_STONES];
    expect(sprite.rotation).toBeCloseTo(0, 6);

    wisp.vx = 0;
    wisp.vy = 5;
    renderer.sync(state);
    expect(sprite.rotation).toBeCloseTo(Math.PI / 2, 6);
  });

  it("draws the level's own stones and dims a spent one", () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    state.levels.headstones = 3;
    renderer.sync(state);

    const stones = children(layers, 'storm').slice(
      SKULL_CAP,
      SKULL_CAP + MAX_STONES,
    );
    expect(stones.filter((sprite) => sprite.visible)).toHaveLength(3);

    const bright = stones[0].tint;
    state.lines.stoneRecharge[0] = 20;
    renderer.sync(state);
    expect(stones[0].tint).not.toBe(bright);
  });

  it("shows the bell's ring only while one is live", () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    renderer.sync(state);
    expect(children(layers, 'bellRing')[0].visible).toBe(false);

    state.lines.ring = { level: 4, ticks: 12, struck: new Set() };
    renderer.sync(state);
    expect(children(layers, 'bellRing')[0].visible).toBe(true);
  });
});

describe("a second run out of the pool (this app's own lesson)", () => {
  it('starts with an empty storm, on the frame before anything is synced', () => {
    // The leak this renderer can actually have. A sync corrects a pooled
    // entity's visibility from the sim's own pools, so a skull or a wisp
    // cannot survive a run on its own; what has no sim entity behind it is the
    // eruption and the splash, and their memory is a tick.
    const { layers, renderer } = attached();
    const first = quietRun();
    first.tick = 8;
    putSkull(first, 0, 100, 100);
    first.lines.ring = { level: 5, ticks: 20, struck: new Set() };
    renderer.erupt(first);
    renderer.splashed(first);
    renderer.sync(first);
    expect(children(layers, 'belchEruption')[0].visible).toBe(true);

    layers.clear();
    renderer.attach(layers);

    // Nothing is drawn before the first sync of the new run, which is the frame
    // a leaked sprite would be visible on.
    expect(children(layers, 'storm').every((each) => !each.visible)).toBe(true);
    expect(children(layers, 'bellRing')[0].visible).toBe(false);
    for (const burst of children(layers, 'belchEruption')) {
      expect(burst.visible).toBe(false);
    }

    // And the second run reaching the same tick the first one erupted on does
    // not replay it. Without forgetPreviousRun the born tick survives, the age
    // comes out at zero again, and the eruption fires for a belch nobody spent.
    const second = quietRun(19);
    second.tick = 8;
    renderer.sync(second);
    for (const burst of children(layers, 'belchEruption')) {
      expect(burst.visible).toBe(false);
    }
  });
});

describe('the momentary effects (plan 6.19)', () => {
  it('shows the eruption for its own life and then never again', () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    renderer.erupt(state);
    renderer.sync(state);
    const eruption = children(layers, 'belchEruption')[0];
    expect(eruption.visible).toBe(true);

    state.tick += 100;
    renderer.sync(state);
    expect(eruption.visible).toBe(false);
  });

  it('shows the splash, so charge wasted at a full reservoir is visible rather than a silent clamp', () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    const splash = children(layers, 'belchEruption')[1];
    renderer.sync(state);
    expect(splash.visible).toBe(false);

    renderer.splashed(state);
    renderer.sync(state);
    expect(splash.visible).toBe(true);
  });

  it("puts both at the grave's mouth, which is where they come out of", () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    renderer.erupt(state);
    renderer.splashed(state);
    renderer.sync(state);
    for (const burst of children(layers, 'belchEruption')) {
      expect(burst.position.x).toBe(state.grave.x);
      expect(burst.position.y).toBe(state.grave.y - state.grave.size);
    }
  });
});
