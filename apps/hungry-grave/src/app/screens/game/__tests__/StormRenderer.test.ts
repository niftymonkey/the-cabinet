/**
 * The player's fire on screen. Render only: it reads the sim's pools and draws
 * them, and holds no rules.
 */

import type { Graphics } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';

import { SKULL_CAP, WISP_CAP } from '../../../../game/caps';
import { MAX_LEVEL } from '../../../../game/lines/roster';
import {
  TERRITORY_CAP,
  TERRITORY_OPENING_TICKS,
} from '../../../../game/lines/territory';
import type { RunState } from '../../../../game/run';
import { createRun } from '../../../../game/run';
import { PROCESSION_WAVES } from '../../../../game/stage/waves';
import {
  BELCH_BURST_RADIUS,
  BELCH_SHOVE_SPACING,
  BELCH_SHOVES,
} from '../../../../game/belch';
import { SHOVE_TICKS } from '../../../../game/shove';
import { SCROLL_SPEED } from '../../../../game/tuning';
import { FieldLayers } from '../layering';
import {
  ERUPTION_TICKS,
  eruptionFrontsAt,
  STORM_RENDERER_TRANSIENT_TICKS,
  StormRenderer,
} from '../StormRenderer';

function attached(): { layers: FieldLayers; renderer: StormRenderer } {
  const layers = new FieldLayers();
  const renderer = new StormRenderer();
  renderer.attach(layers);
  return { layers, renderer };
}

function quietRun(seed = 18): RunState {
  const run = createRun(seed);
  run.stage.firedWaves = PROCESSION_WAVES.length;
  return run;
}

function children(
  layers: FieldLayers,
  name: 'storm' | 'bellRing' | 'belchEruption',
) {
  return layers.layer(name).children as Graphics[];
}

/** The sprite at this slot in a layer, or a bug: every layer here is pool-sized. */
function spriteAt(
  layers: FieldLayers,
  name: 'storm' | 'bellRing' | 'belchEruption',
  slot: number,
): Graphics {
  const sprite = children(layers, name)[slot];
  if (sprite === undefined)
    throw new Error(`no ${name} sprite at slot ${slot}`);
  return sprite;
}

/** This slot in the skull pool, which every test in this file spawns into first. */
function skullSlot(state: RunState, slot: number) {
  const skull = state.skulls[slot];
  if (skull === undefined) throw new Error(`no skull pool slot ${slot}`);
  return skull;
}

/** This slot in the wisp pool, which every test in this file spawns into first. */
function wispSlot(state: RunState, slot: number) {
  const wisp = state.wisps[slot];
  if (wisp === undefined) throw new Error(`no wisp pool slot ${slot}`);
  return wisp;
}

/** This slot in the territory patch pool, which every test in this file spawns into first. */
function patchSlot(state: RunState, slot: number) {
  const patch = state.patches[slot];
  if (patch === undefined) throw new Error(`no patch pool slot ${slot}`);
  return patch;
}

function putSkull(state: RunState, slot: number, x: number, y: number) {
  const skull = skullSlot(state, slot);
  skull.alive = true;
  skull.id = 100 + slot;
  skull.x = x;
  skull.y = y;
  skull.vx = 0;
  skull.vy = -7;
  return skull;
}

function putWisp(state: RunState, slot: number, x: number, y: number) {
  const wisp = wispSlot(state, slot);
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
    // The storm layer carries the skulls, Territory's patches, the wisps, one
    // arrival mark per patch, and the loss announcement, which has no sim
    // entity behind it and so gets one sprite rather than a pool.
    expect(children(layers, 'storm')).toHaveLength(
      SKULL_CAP + 2 * TERRITORY_CAP + WISP_CAP + 1,
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

    expect(spriteAt(layers, 'storm', 3).visible).toBe(true);
    expect(spriteAt(layers, 'storm', 3).position.x).toBe(120);
    expect(spriteAt(layers, 'storm', 3).position.y).toBe(340);
    expect(spriteAt(layers, 'storm', 2).visible).toBe(false);

    skullSlot(state, 3).alive = false;
    renderer.sync(state);
    expect(spriteAt(layers, 'storm', 3).visible).toBe(false);
  });

  it('orients a wisp to its heading, which is what makes the curve readable', () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    const wisp = putWisp(state, 0, 200, 200);
    renderer.sync(state);
    const sprite = spriteAt(layers, 'storm', SKULL_CAP + TERRITORY_CAP);
    expect(sprite.rotation).toBeCloseTo(0, 6);

    wisp.vx = 0;
    wisp.vy = 5;
    renderer.sync(state);
    expect(sprite.rotation).toBeCloseTo(Math.PI / 2, 6);
  });

  it("shows the bell's cones only while a toll is live", () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    renderer.sync(state);
    expect(spriteAt(layers, 'bellRing', 0).visible).toBe(false);

    state.lines.ring = { level: 4, ticks: 12, struck: new Set() };
    renderer.sync(state);
    expect(spriteAt(layers, 'bellRing', 0).visible).toBe(true);
  });

  it('draws one wedge per cone the level throws, so a level-1 toll is one and a level-5 toll is five', () => {
    // Read off the drawing instructions and never off the module's source
    // text. One arc is one wedge, counted in the fill that lays the cone
    // bodies down, so the outline passes are never double-counted.
    const wedges = (sprite: Graphics) =>
      sprite.context.instructions
        .filter((instruction) => instruction.action === 'fill')
        .flatMap((instruction) => {
          const data = instruction.data as {
            path?: { instructions?: { action: string }[] };
          };
          return data.path?.instructions ?? [];
        })
        .filter((shape) => shape.action === 'arc').length;

    const { layers, renderer } = attached();
    const state = quietRun();
    state.lines.ring = { level: 1, ticks: 12, struck: new Set() };
    renderer.sync(state);
    expect(wedges(spriteAt(layers, 'bellRing', 0))).toBe(1);

    state.lines.ring = { level: MAX_LEVEL, ticks: 12, struck: new Set() };
    renderer.sync(state);
    expect(wedges(spriteAt(layers, 'bellRing', 0))).toBe(MAX_LEVEL);
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
    expect(spriteAt(layers, 'belchEruption', 0).visible).toBe(true);

    layers.clear();
    renderer.attach(layers);

    // Nothing is drawn before the first sync of the new run, which is the frame
    // a leaked sprite would be visible on.
    expect(children(layers, 'storm').every((each) => !each.visible)).toBe(true);
    expect(spriteAt(layers, 'bellRing', 0).visible).toBe(false);
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
  it('draws as many fronts as the belch throws waves, each lasting as long as its wave', () => {
    // Design record R3 as superseded 2026-09-15: one front per push, each
    // lasting as long as its own push, so the picture and the push end
    // together. The fronts are read as a value rather than off a sprite,
    // because what is promised is the agreement between the two and not the
    // geometry that happens to carry it.
    const born: number[] = [];
    let last = 0;
    for (let age = 0; age < ERUPTION_TICKS; age++) {
      const live = eruptionFrontsAt(age).length;
      // At this spacing the fronts are strictly sequential, so exactly one is
      // ever out: a second would mean two pushes running at once.
      expect(`tick ${age}: ${live}`).toBe(`tick ${age}: 1`);
      const reach = eruptionFrontsAt(age)[0]?.radius ?? 0;
      if (reach < last) born.push(age);
      last = reach;
    }
    // The first front is born at nothing, and each one after it restarts there.
    expect(born).toEqual(
      Array.from({ length: BELCH_SHOVES - 1 }, (_, index) => {
        return (index + 1) * BELCH_SHOVE_SPACING;
      }),
    );
    expect(ERUPTION_TICKS).toBe(
      (BELCH_SHOVES - 1) * BELCH_SHOVE_SPACING + SHOVE_TICKS,
    );
    // And nothing is drawn once the last push has finished travelling.
    expect(eruptionFrontsAt(ERUPTION_TICKS)).toEqual([]);
  });

  it('shows the eruption for its own life and then never again', () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    renderer.erupt(state);
    renderer.sync(state);
    const eruption = spriteAt(layers, 'belchEruption', 0);
    expect(eruption.visible).toBe(true);

    state.tick += 100;
    renderer.sync(state);
    expect(eruption.visible).toBe(false);
  });

  it('shows the splash, so charge wasted at a full reservoir is visible rather than a silent clamp', () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    const splash = spriteAt(layers, 'belchEruption', 1);
    renderer.sync(state);
    expect(splash.visible).toBe(false);

    renderer.splashed(state);
    renderer.sync(state);
    expect(splash.visible).toBe(true);
  });

  it('stops every front at the reach the belch shoves over, and never past it', () => {
    // Design record R11, Mark's option 1 of 2026-09-16: the front and the push
    // name one circle, because here the push is the payload. So nothing on
    // screen promises ground the press did not touch. The Blank's shipped ratio
    // of a clear front at 2.5 times its knockback is the precedent R11
    // declines: in Gungeon the bullets are the payload and the front pictures
    // the cancel, which is not what this front is doing.
    let furthest = 0;
    for (let age = 0; age < ERUPTION_TICKS; age++) {
      for (const front of eruptionFrontsAt(age)) {
        expect(`tick ${age}: ${front.radius <= BELCH_BURST_RADIUS}`).toBe(
          `tick ${age}: true`,
        );
        furthest = Math.max(furthest, front.radius);
      }
    }
    // And it goes all the way there: a front is one tick's own step short of
    // the reach on the last tick it is drawn, which is where its push ends.
    expect(furthest).toBeCloseTo(
      BELCH_BURST_RADIUS * ((SHOVE_TICKS - 1) / SHOVE_TICKS),
      6,
    );
  });

  it('centres the eruption where the belch measures its reach from, and leaves the splash at the mouth', () => {
    // The belch reads its reach from the grave's centre (belch.ts, insideBurst)
    // and the ring used to be drawn from the mouth, so the circle a player saw
    // and the circle the press caught were offset by the grave's own size. The
    // splash stays at the mouth because it is a spray coming out of the mouth
    // and is not this circle.
    const { layers, renderer } = attached();
    const state = quietRun();
    renderer.erupt(state);
    renderer.splashed(state);
    renderer.sync(state);

    const eruption = spriteAt(layers, 'belchEruption', 0);
    expect(eruption.position.x).toBe(state.grave.x);
    expect(eruption.position.y).toBe(state.grave.y);

    const splash = spriteAt(layers, 'belchEruption', 1);
    expect(splash.position.x).toBe(state.grave.x);
    expect(splash.position.y).toBe(state.grave.y - state.grave.size);
  });

  it('drifts the eruption down the field, so it still covers the bodies it caught when it ends', () => {
    // Every body the press threw rides the field down at SCROLL_SPEED while the
    // ring is out (step.ts, scrollField), so a ring pinned to the point it was
    // born at is left behind by the crowd it drew. R11's closing paragraph
    // closes that finding here, in the picture, rather than by exempting a
    // shoved body from the scroll in the sim.
    const { layers, renderer } = attached();
    const state = quietRun();
    renderer.erupt(state);
    renderer.sync(state);
    const eruption = spriteAt(layers, 'belchEruption', 0);
    expect(eruption.position.y).toBe(state.grave.y);

    const born = state.grave.y;
    state.tick += ERUPTION_TICKS - 1;
    renderer.sync(state);
    expect(eruption.position.y).toBeCloseTo(
      born + (ERUPTION_TICKS - 1) * SCROLL_SPEED,
      6,
    );
  });
});

/**
 * Territory on screen (#76). The claimed ground is the one thing on the field
 * whose drawn size is a gameplay fact: freshness scales the area the sim
 * collides against, so a rim that disagreed with it would make the player's
 * read of their own ground a lie.
 */
describe("Territory's claimed ground", () => {
  function putPatch(
    state: RunState,
    slot: number,
    radius: number,
    opening = 0,
  ) {
    const patch = patchSlot(state, slot);
    patch.alive = true;
    patch.id = 300 + slot;
    patch.x = 200;
    patch.y = 300;
    patch.radius = radius;
    patch.opening = opening;
    patch.pulses = 0;
    patch.struck.clear();
    return patch;
  }

  function patchSprites(layers: FieldLayers) {
    return children(layers, 'storm').slice(
      SKULL_CAP,
      SKULL_CAP + TERRITORY_CAP,
    );
  }

  it('draws at the radius the sim collides against, so a stale patch is visibly smaller', () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    putPatch(state, 0, 48);
    putPatch(state, 1, 24);
    renderer.sync(state);

    const [full, stale] = patchSprites(layers);
    if (full === undefined || stale === undefined) {
      throw new Error('patchSprites gave fewer than 2 sprites');
    }
    expect(full.visible).toBe(true);
    expect(stale.visible).toBe(true);
    expect(full.getLocalBounds().width).toBeGreaterThan(
      stale.getLocalBounds().width * 1.5,
    );
  });

  it('scales the hands with the ground’s circumference, so level reads as size twice over', () => {
    // round(radius / 8): 6 hands at the level-1 radius of 48 and 14 at the
    // level-5 radius of 108. Bigger claimed ground visibly holds more hands,
    // never the same six stretched thin.
    const { layers, renderer } = attached();
    const state = quietRun();
    putPatch(state, 0, 48);
    putPatch(state, 1, 108);
    renderer.sync(state);

    const circlesOf = (sprite: Graphics) =>
      sprite.context.instructions
        .flatMap((instruction) => {
          const data = instruction.data as {
            path?: { instructions?: { action: string }[] };
          };
          return data.path?.instructions ?? [];
        })
        .filter((shape) => shape.action === 'circle').length;
    const [levelOne, levelFive] = patchSprites(layers);
    if (levelOne === undefined || levelFive === undefined) {
      throw new Error('patchSprites gave fewer than 2 sprites');
    }
    // The rim is one circle; every other circle is a hand.
    expect(circlesOf(levelOne)).toBe(1 + 6);
    expect(circlesOf(levelFive)).toBe(1 + 14);
  });

  it('the look is the radius alone, so grinding never rebuilds the ground', () => {
    // The pulse count and the re-hit map move constantly while a mob is held,
    // and neither changes what the ground looks like.
    const { layers, renderer } = attached();
    const state = quietRun();
    const patch = putPatch(state, 0, 48);
    renderer.sync(state);
    const sprite = patchSprites(layers)[0];
    if (sprite === undefined) throw new Error('no patch sprite at slot 0');
    const clear = vi.spyOn(sprite, 'clear');

    patch.pulses += 5;
    patch.struck.set(11, 430);
    renderer.sync(state);
    expect(clear).not.toHaveBeenCalled();

    patch.radius = 59;
    renderer.sync(state);
    expect(clear).toHaveBeenCalled();
  });

  it('draws opening ground differently from ground whose hands are up', () => {
    // The beat has to read as anticipation rather than as a patch that missed,
    // and it is the one interval where a mob standing in the circle takes
    // nothing.
    const { layers, renderer } = attached();
    const state = quietRun();
    const patch = putPatch(state, 0, 48, TERRITORY_OPENING_TICKS);
    renderer.sync(state);
    const sprite = patchSprites(layers)[0];
    if (sprite === undefined) throw new Error('no patch sprite at slot 0');
    const opening = `${sprite.tint} ${sprite.alpha}`;

    patch.opening = 0;
    renderer.sync(state);
    expect(`${sprite.tint} ${sprite.alpha}`).not.toBe(opening);
  });

  it('nothing draws a stone', () => {
    // A deliberate-absence test guarding the headstones' removal (#76). The
    // storm layer is exactly the three pools it now has plus the single loss
    // announcement, and a run that has swallowed nothing draws nothing in it:
    // an orbiting solid would show up here as a visible sprite around a grave
    // that has claimed no ground.
    const { layers, renderer } = attached();
    const state = quietRun();
    renderer.sync(state);

    expect(children(layers, 'storm')).toHaveLength(
      SKULL_CAP + 2 * TERRITORY_CAP + WISP_CAP + 1,
    );
    expect(
      children(layers, 'storm').filter((sprite) => sprite.visible),
    ).toHaveLength(0);
  });
});

/**
 * The arrival mark (#76 pass C): a mark leaves the grave and travels to the
 * ground about to open under it, so a claim reads as something the grave sent
 * rather than as ground that simply appeared.
 *
 * It is derived wholly from a patch still in its opening beat, so every test
 * here sets an opening and syncs. No sim state carries it and no event is
 * plumbed for it.
 */
describe('the arrival mark', () => {
  const PATCH_X = 200;
  const PATCH_Y = 300;

  function opening(state: RunState, ticks: number) {
    const patch = patchSlot(state, 0);
    patch.alive = true;
    patch.id = 400;
    patch.x = PATCH_X;
    patch.y = PATCH_Y;
    patch.radius = 32;
    patch.pull = 0.08;
    patch.slow = 0.2;
    patch.opening = ticks;
    patch.pulses = 0;
    patch.struck.clear();
    return patch;
  }

  function mark(layers: FieldLayers): Graphics {
    return spriteAt(layers, 'storm', SKULL_CAP + TERRITORY_CAP + WISP_CAP);
  }

  /** Where the mark sets out from: the grave's mouth, the point erupt uses. */
  function mouth(state: RunState) {
    return { x: state.grave.x, y: state.grave.y - state.grave.size };
  }

  /** How far along the straight line from the mouth to the ground the mark is. */
  function covered(state: RunState, layers: FieldLayers): number {
    return (
      (mark(layers).position.x - mouth(state).x) / (PATCH_X - mouth(state).x)
    );
  }

  it('ground still opening shows a mark between the grave and the ground', () => {
    const { layers, renderer } = attached();
    const state = quietRun();
    const patch = opening(state, TERRITORY_OPENING_TICKS);
    renderer.sync(state);
    patch.opening = TERRITORY_OPENING_TICKS / 2;
    renderer.sync(state);

    const sprite = mark(layers);
    expect(sprite.visible).toBe(true);
    expect(sprite.position.x).toBeGreaterThan(
      Math.min(PATCH_X, mouth(state).x),
    );
    expect(sprite.position.x).toBeLessThan(Math.max(PATCH_X, mouth(state).x));
    expect(sprite.position.y).toBeGreaterThan(PATCH_Y);
    expect(sprite.position.y).toBeLessThan(mouth(state).y);
  });

  it('the mark is largest around the middle of its travel and back to its own size on arrival', () => {
    // One number carries the whole arc: the same height that lifts the mark
    // swells it, so it cannot be big and low or small and high.
    const { layers, renderer } = attached();
    const state = quietRun();
    const patch = opening(state, TERRITORY_OPENING_TICKS);
    const scales: number[] = [];
    for (let spent = 0; spent < TERRITORY_OPENING_TICKS; spent++) {
      patch.opening = TERRITORY_OPENING_TICKS - spent;
      renderer.sync(state);
      scales.push(mark(layers).scale.x);
    }

    expect(scales[0]).toBeCloseTo(1, 6);
    const largest = Math.max(...scales);
    expect(largest).toBeGreaterThan(2);
    expect(scales.indexOf(largest)).toBe(TERRITORY_OPENING_TICKS / 2);
    expect(scales[scales.length - 1]).toBeLessThan(1.1);
  });

  it('the mark rides above its own ground path through the middle of the travel', () => {
    // The arc is a fake Z, so the mark has to leave the line it is travelling
    // along rather than slide down it.
    const { layers, renderer } = attached();
    const state = quietRun();
    const patch = opening(state, TERRITORY_OPENING_TICKS);
    renderer.sync(state);
    patch.opening = TERRITORY_OPENING_TICKS / 2;
    renderer.sync(state);

    const along =
      mouth(state).y + (PATCH_Y - mouth(state).y) * covered(state, layers);
    expect(mark(layers).position.y).toBeLessThan(along);
  });

  it('the mark covers less of the distance through the middle than a straight run would', () => {
    // The hang. Through the middle fifth of the beat the mark moves at a
    // fraction of linear pace, which is what makes the top of the arc read as
    // a hold rather than as a constant slide.
    const { layers, renderer } = attached();
    const state = quietRun();
    const patch = opening(state, TERRITORY_OPENING_TICKS);
    renderer.sync(state);

    patch.opening = TERRITORY_OPENING_TICKS * 0.6;
    renderer.sync(state);
    const early = covered(state, layers);
    patch.opening = TERRITORY_OPENING_TICKS * 0.4;
    renderer.sync(state);
    const late = covered(state, layers);

    // A straight run covers a fifth of the way in a fifth of the beat.
    expect(late - early).toBeGreaterThan(0);
    expect(late - early).toBeLessThan(0.2 / 2);
  });

  it('no mark shows once the hands are up', () => {
    // The mark is the beat before the ground bites, and the opened ground is
    // its own draw. Two of them on screen at once would say the claim arrived
    // twice.
    const { layers, renderer } = attached();
    const state = quietRun();
    const patch = opening(state, TERRITORY_OPENING_TICKS / 2);
    renderer.sync(state);
    expect(mark(layers).visible).toBe(true);

    patch.opening = 0;
    renderer.sync(state);
    expect(mark(layers).visible).toBe(false);
  });

  it('the mark keeps the origin it launched from when the grave moves', () => {
    // Captured and not read live. The grave moves under the player's hand for
    // the whole beat, and a tail that followed it would read as the mark being
    // dragged rather than as something already in the air.
    const { layers, renderer } = attached();
    const state = quietRun();
    const patch = opening(state, TERRITORY_OPENING_TICKS);
    state.grave.x = 100;
    renderer.sync(state);
    expect(mark(layers).position.x).toBeCloseTo(100, 6);

    state.grave.x = 400;
    patch.opening = TERRITORY_OPENING_TICKS;
    renderer.sync(state);
    expect(mark(layers).position.x).toBeCloseTo(100, 6);
  });

  it('forgetPreviousRun drops the remembered origins', () => {
    // The pooled-screen leak this app has been bitten by five times: an origin
    // is a memory of a past tick, so it has to die where every other per-run
    // memory does.
    const { layers, renderer } = attached();
    const state = quietRun();
    const patch = opening(state, TERRITORY_OPENING_TICKS);
    state.grave.x = 100;
    renderer.sync(state);
    expect(mark(layers).position.x).toBeCloseTo(100, 6);

    renderer.forgetPreviousRun();
    state.grave.x = 400;
    patch.opening = TERRITORY_OPENING_TICKS;
    renderer.sync(state);
    expect(mark(layers).position.x).toBeCloseTo(400, 6);
  });
});

describe("a stripped line's expression blowing up (record R7)", () => {
  /** The loss announcement's own sprite: last into the storm layer. */
  const blowUp = (layers: FieldLayers): Graphics => {
    const storm = children(layers, 'storm');
    const sprite = storm[storm.length - 1];
    if (sprite === undefined) throw new Error('no loss sprite in the storm');
    return sprite;
  };

  /** How many rings the announcement is drawing this frame. */
  const rings = (sprite: Graphics): number =>
    sprite.context.instructions.filter(
      (instruction) => instruction.action === 'stroke',
    ).length;

  it('blows up the skull stream, one ring where each of its skulls stood when the rung went', () => {
    // ADR 0054 as amended by record R8: a line's rung is carried by that line's
    // own expression on the field, and section 3.3 measures the stream's
    // columns as the one expression of the four that is on screen continuously.
    const { layers, renderer } = attached();
    const state = quietRun();
    state.tick = 40;
    putSkull(state, 0, 100, 200);
    putSkull(state, 1, 140, 260);
    renderer.sync(state);

    renderer.weaponStripped(state, ['skullStream', 'territory']);
    state.tick = 46;
    renderer.sync(state);

    const sprite = blowUp(layers);
    expect(sprite.visible).toBe(true);
    expect(rings(sprite)).toBe(2);
  });

  it('announces nothing for a line whose expression it does not draw', () => {
    // Section 3.3 and section 7's sixth finding: the bell's cones are on screen
    // only during a toll, the wisps only while a flight is alive, and
    // Territory's ground is an area and never a count, so the field channel is
    // built for the stream alone and an unbuilt line stays silent here.
    const { layers, renderer } = attached();
    const state = quietRun();
    state.tick = 40;
    putSkull(state, 0, 100, 200);
    renderer.sync(state);

    renderer.weaponStripped(state, ['bell', 'wisps', 'territory']);
    state.tick = 44;
    renderer.sync(state);

    expect(blowUp(layers).visible).toBe(false);
  });

  it('declares its lifetime in the registry and plays for exactly that long', () => {
    // The registry in transients.ts aggregates this renderer's own declaration,
    // and the covering test holds the replay lead-in over it (#58).
    const life = STORM_RENDERER_TRANSIENT_TICKS.lossBlowUp;
    const { layers, renderer } = attached();
    const state = quietRun();
    putSkull(state, 0, 100, 200);
    renderer.weaponStripped(state, ['skullStream']);

    state.tick = life - 1;
    renderer.sync(state);
    expect(blowUp(layers).visible).toBe(true);

    state.tick = life;
    renderer.sync(state);
    expect(blowUp(layers).visible).toBe(false);
  });

  it('forgetPreviousRun drops it, so a second run out of the pool never replays it', () => {
    // The pooled-screen leak: a born tick carried across runs replays the loss
    // for a rung nobody lost.
    const { layers, renderer } = attached();
    const first = quietRun();
    first.tick = 12;
    putSkull(first, 0, 100, 200);
    renderer.weaponStripped(first, ['skullStream']);
    renderer.sync(first);
    expect(blowUp(layers).visible).toBe(true);

    layers.clear();
    renderer.attach(layers);
    const second = quietRun(19);
    second.tick = 12;
    renderer.sync(second);

    expect(blowUp(layers).visible).toBe(false);
  });
});
