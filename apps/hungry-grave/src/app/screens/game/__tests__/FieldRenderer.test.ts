/**
 * The field on screen. Render only: it reads the sim's pools and draws them,
 * and holds no rules.
 */

import type { Bounds, Graphics } from 'pixi.js';
import { describe, expect, it } from 'vitest';

import { CORPSE_CAP, MOB_CAP, MOB_FIRE_CAP } from '../../../../game/caps';
import { TICK_HZ } from '../../../../game/clock';
import { FIELD_HEIGHT } from '../../../../game/field';
import type { Corpse } from '../../../../game/corpses';
import {
  CORPSE_HALF_EXTENT,
  spawnCorpse,
  spawnDrop,
} from '../../../../game/corpses';
import type { WeaponLine } from '../../../../game/lines/roster';
import { WEAPON_LINES } from '../../../../game/lines/roster';
import type { MobType } from '../../../../game/mobs';
import { ARRIVE_TICKS, MOB_TYPES, spawnMob } from '../../../../game/mobs';
import type { RunState } from '../../../../game/run';
import { createRun } from '../../../../game/run';
import { DROP_HALF_EXTENT } from '../../../../game/drops';
import { INVULNERABLE_TICKS } from '../../../../game/tuning';
import { CORPSE_TIERS, PALETTE } from '../../../palette';
import fieldRendererSource from '../FieldRenderer.ts?raw';
import {
  alarmRadius,
  DROP_DRAW_HALF_EXTENT,
  FieldRenderer,
  FLICKER_HALF_PERIOD,
  freshnessBrightness,
  SHOT_CORE_OF_HITBOX,
  SHOT_DRAW_SCALE,
  SPRITE_STROKE,
  tellRadius,
} from '../FieldRenderer';
import { FieldLayers } from '../layering';

function attached(): { layers: FieldLayers; renderer: FieldRenderer } {
  const layers = new FieldLayers();
  const renderer = new FieldRenderer();
  renderer.attach(layers);
  return { layers, renderer };
}

function put(state: RunState, type: MobType, x: number, y: number) {
  return spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 })!;
}

/**
 * A wave killed in one burst, down to the freshness that flickers. The mobs all
 * die before any corpse is spawned, so the corpse ids run consecutively the way
 * one storm tick's kills do.
 */
function flickering(state: RunState, count: number): Corpse[] {
  const dead = [];
  for (let index = 0; index < count; index++) {
    const mob = put(state, 'shambler', 40 + index * 30, 100);
    mob.alive = false;
    dead.push(mob);
  }
  for (const mob of dead) spawnCorpse(state, mob);
  const wave = state.corpses.filter((corpse) => corpse.alive);
  for (const corpse of wave) corpse.freshness = 0.1;
  return wave;
}

function sprites(layers: FieldLayers, name: 'corpses' | 'mobBodies') {
  return layers.layer(name).children as Graphics[];
}

/** Puts one live shot in the first slot of the mob-fire pool. */
function putShot(state: RunState, x: number, y: number) {
  const shot = state.mobFire[0];
  shot.alive = true;
  shot.id = 1;
  shot.emitter = 'shambler';
  shot.x = x;
  shot.y = y;
  shot.vx = 0;
  shot.vy = 1;
  shot.halfExtent = 5;
  return shot;
}

/** attach() adds the scatters after the shot pool, so they are the tail of the layer. */
function visibleScatters(layers: FieldLayers): number {
  const fire = layers.layer('mobFire').children as Graphics[];
  return fire.slice(MOB_FIRE_CAP).filter((each) => each.visible).length;
}

describe('FieldRenderer', () => {
  it('draws each entity kind into the layer layering.ts names for it (ADR 0014)', () => {
    const { layers } = attached();
    expect(layers.layer('corpses').children).toHaveLength(CORPSE_CAP);
    expect(layers.layer('mobBodies').children).toHaveLength(MOB_CAP);
    // The shot pool plus the cancelled-shot scatters, which share the layer
    // because a cancel is mob fire coming apart.
    expect(layers.layer('mobFire').children.length).toBeGreaterThanOrEqual(
      MOB_FIRE_CAP,
    );
    expect(layers.layer('hitDim').children).toHaveLength(1);
    // A sprite per corpse slot in the treasure layer too: drops ride the corpse
    // pool and ADR 0014's stack puts treasure two layers above corpses, so one
    // slot needs a sprite in each and which one shows is decided by its kind.
    expect(layers.layer('treasure').children).toHaveLength(CORPSE_CAP);
    expect(layers.layer('storm').children).toHaveLength(0);
  });

  it('shows a sprite only while its slot is alive', () => {
    const { layers, renderer } = attached();
    const state = createRun(1);
    renderer.sync(state);
    expect(sprites(layers, 'mobBodies').every((each) => !each.visible)).toBe(
      true,
    );

    const mob = put(state, 'shambler', 100, 100);
    renderer.sync(state);
    const slot = state.mobs.indexOf(mob);
    expect(sprites(layers, 'mobBodies')[slot].visible).toBe(true);
    expect(sprites(layers, 'mobBodies')[slot].position.x).toBe(100);

    mob.alive = false;
    renderer.sync(state);
    expect(sprites(layers, 'mobBodies')[slot].visible).toBe(false);
  });

  it('pools its sprites the way the entities are pooled: a spawn after a death reuses one', () => {
    // Allocating a sprite per spawn is what makes a wave hitch, and this app's
    // whole defect history is pooled things nobody reset.
    const { layers, renderer } = attached();
    const state = createRun(1);
    const first = put(state, 'shambler', 100, 100);
    renderer.sync(state);
    const slot = state.mobs.indexOf(first);
    const sprite = sprites(layers, 'mobBodies')[slot];

    first.alive = false;
    const second = put(state, 'revenant', 300, 200);
    expect(state.mobs.indexOf(second)).toBe(slot);
    renderer.sync(state);

    expect(sprites(layers, 'mobBodies')).toHaveLength(MOB_CAP);
    expect(sprites(layers, 'mobBodies')[slot]).toBe(sprite);
    expect(sprite.position.x).toBe(300);
  });

  it('fades a corpse by its freshness, as a tint on the declared hex and never as an alpha', () => {
    // An alpha fade would rotate a cream corpse's hue toward the night as it
    // drains, so every hue check in the palette test would be reasoning about a
    // colour the sprite never is (section 4.15.4).
    const { layers, renderer } = attached();
    const state = createRun(1);
    const dead = put(state, 'shambler', 60, 100);
    dead.alive = false;
    spawnCorpse(state, dead);
    const corpse = state.corpses.find((each) => each.alive)!;
    const slot = state.corpses.indexOf(corpse);

    renderer.sync(state);
    const sprite = sprites(layers, 'corpses')[slot];
    expect(sprite.alpha).toBe(1);
    const fresh = sprite.tint;

    corpse.freshness = 0.5;
    renderer.sync(state);
    expect(sprite.tint).not.toBe(fresh);
    expect(sprite.alpha).toBe(1);

    expect(freshnessBrightness(corpse, 0)).toBeLessThan(
      freshnessBrightness({ ...corpse, freshness: 1 }, 0),
    );
    expect(freshnessBrightness({ ...corpse, freshness: 0 }, 0)).toBeGreaterThan(
      0,
    );
  });

  it('flickers a nearly empty corpse and never a feast', () => {
    const state = createRun(1);
    const dead = put(state, 'shambler', 60, 100);
    dead.alive = false;
    spawnCorpse(state, dead);
    const corpse = state.corpses.find((each) => each.alive)!;
    corpse.freshness = 0.05;
    const over = [0, 6, 12, 18].map((tick) =>
      freshnessBrightness(corpse, tick),
    );
    expect(new Set(over).size).toBeGreaterThan(1);

    const feast = { ...corpse, decays: false, freshness: 1 };
    expect(freshnessBrightness(feast, 0)).toBe(1);
    expect(freshnessBrightness(feast, 6)).toBe(1);
  });

  it('tells an armed mob from an unarmed one, and a lit tell from an unlit one', () => {
    // ADR 0016 puts this ahead of everything else about the mob pool: a
    // shambler that will never shoot and one that will must not be the same
    // drawing, and a revenant's tell has to precede its shot.
    const { layers, renderer } = attached();
    const state = createRun(1);
    const plain = spawnMob(state, 'shambler', {
      x: 60,
      y: MOB_TYPES.shambler.halfHeight,
      vx: 0,
      vy: 1,
      index: 0,
    })!;
    const armed = spawnMob(state, 'shambler', {
      x: 120,
      y: MOB_TYPES.shambler.halfHeight,
      vx: 0,
      vy: 1,
      index: 2,
    })!;
    expect(plain.armed).toBe(false);
    expect(armed.armed).toBe(true);
    renderer.sync(state);

    // What was drawn, as the list of drawing actions pixi recorded.
    const drawn = (mob: typeof plain) =>
      sprites(layers, 'mobBodies')
        [state.mobs.indexOf(mob)].context.instructions.map(
          (each) => each.action,
        )
        .join(',');
    expect(drawn(plain)).not.toBe(drawn(armed));

    const revenant = spawnMob(state, 'revenant', {
      x: 200,
      y: MOB_TYPES.revenant.halfHeight,
      vx: 0,
      vy: 1,
      index: 0,
    })!;
    revenant.fireIn = ARRIVE_TICKS + 1;
    renderer.sync(state);
    const unlit = drawn(revenant);
    revenant.fireIn = 2;
    renderer.sync(state);
    expect(drawn(revenant)).not.toBe(unlit);

    // And the tell closes as the shot approaches, rather than only switching
    // on, so a player reads how long is left and not just that something is
    // coming.
    expect(tellRadius('revenant', 1)).toBeLessThan(tellRadius('revenant', 0));
    expect(tellRadius('revenant', 0.5)).toBeLessThan(tellRadius('revenant', 0));
    expect(tellRadius('revenant', 1)).toBeGreaterThan(0);
  });

  it('draws the hit dim in its own layer, following the window down to zero', () => {
    const { layers, renderer } = attached();
    const state = createRun(1);
    const dim = layers.layer('hitDim').children[0] as Graphics;

    renderer.sync(state);
    expect(dim.alpha).toBe(0);

    state.grave.invulnerable = INVULNERABLE_TICKS;
    renderer.sync(state);
    const full = dim.alpha;
    expect(full).toBeGreaterThan(0);

    state.grave.invulnerable = Math.floor(INVULNERABLE_TICKS / 2);
    renderer.sync(state);
    expect(dim.alpha).toBeLessThan(full);
    expect(dim.alpha).toBeGreaterThan(0);

    state.grave.invulnerable = 0;
    renderer.sync(state);
    expect(dim.alpha).toBe(0);
  });

  it('names a colour for every corpse tier the sim can produce', () => {
    for (const type of ['shambler', 'revenant', 'ghoul'] as const) {
      const tier = MOB_TYPES[type].corpseTier;
      expect(`${type} ${tier in CORPSE_TIERS}`).toBe(`${type} true`);
    }
  });

  it('draws a cancel scatter where a shot stopped being alive inside the field', () => {
    const { layers, renderer } = attached();
    const state = createRun(1);
    putShot(state, 200, 300);
    renderer.sync(state);
    expect(visibleScatters(layers)).toBe(0);

    // The grave consumed it. A cancel is a scatter and never a fall-in, so it
    // does not read as the one verb of collection.
    state.mobFire[0].alive = false;
    renderer.sync(state);
    expect(visibleScatters(layers)).toBe(1);
  });

  it('does not scatter for a shot that left the field, which was culled rather than cancelled', () => {
    const { layers, renderer } = attached();
    const state = createRun(1);
    putShot(state, 200, FIELD_HEIGHT + 40);
    renderer.sync(state);
    state.mobFire[0].alive = false;
    renderer.sync(state);
    expect(visibleScatters(layers)).toBe(0);
  });

  it('starts a second run with no scatter left over from the first, because the screen is pooled', () => {
    // The fifth leak of this kind in this app. reset() calls layers.clear()
    // and then dressField(), so attach() is the one place a renderer is put
    // back, and anything it remembers about the previous run has to die there.
    // Run one ends with a shot still on the field, which is the ordinary case:
    // without the clear, syncShots sees alive-then-dead across the boundary and
    // fires a cancel read for every one of them on run two's first frame.
    const { layers, renderer } = attached();
    const first = createRun(1);
    putShot(first, 200, 300);
    first.tick = 900;
    renderer.sync(first);

    renderer.detach();
    layers.clear();
    renderer.attach(layers);

    const second = createRun(2);
    renderer.sync(second);
    expect(visibleScatters(layers)).toBe(0);
  });

  it('gives a second run the whole scatter pool, not the slots the first run left unused', () => {
    // oldestScatter() picks the smallest born. A scatter carrying run one's
    // tick is larger than anything run two can produce for its first fifteen
    // seconds, so without the clear those slots are never reused and the pool
    // silently shrinks to whatever run one did not touch.
    const { layers, renderer } = attached();
    const first = createRun(1);
    first.tick = 900;
    putShot(first, 200, 300);
    renderer.sync(first);
    first.mobFire[0].alive = false;
    renderer.sync(first);
    expect(visibleScatters(layers)).toBe(1);

    renderer.detach();
    layers.clear();
    renderer.attach(layers);

    const second = createRun(2);
    renderer.sync(second);
    putShot(second, 100, 100);
    renderer.sync(second);
    second.mobFire[0].alive = false;
    renderer.sync(second);
    expect(visibleScatters(layers)).toBe(1);
  });

  it('detach then attach puts everything back, which FieldLayers.clear() between runs requires', () => {
    const { layers, renderer } = attached();
    renderer.detach();
    for (const name of ['corpses', 'mobBodies', 'mobFire', 'hitDim'] as const) {
      expect(layers.layer(name).children).toHaveLength(0);
    }

    layers.clear();
    renderer.attach(layers);
    expect(layers.layer('corpses').children).toHaveLength(CORPSE_CAP);
    expect(layers.layer('mobBodies').children).toHaveLength(MOB_CAP);
    expect(layers.layer('hitDim').children).toHaveLength(1);
  });
});

describe("dispatch 4's readability findings, fixed here (plan 6.20)", () => {
  it("clears WCAG SC 2.3.1's three-flashes floor on the corpse flicker", () => {
    // A single corpse was covered by the criterion's small-area exemption. A
    // whole wave killed in one burst is not, and nothing could produce a burst
    // kill before the storm existed.
    //
    // The floor is tuning.ts's own derivation, restated for a flicker rather
    // than for a hit: the worst case for a period of p seconds is floor(1 / p)
    // plus 1, so three flashes a second needs a full period over 20 ticks and a
    // half period of at least 11.
    const flashesPerSecond =
      Math.floor(TICK_HZ / (FLICKER_HALF_PERIOD * 2)) + 1;
    expect(FLICKER_HALF_PERIOD).toBeGreaterThanOrEqual(11);
    expect(flashesPerSecond).toBeLessThanOrEqual(3);
  });

  it('flickers two corpses killed on the same tick out of phase', () => {
    // The pair is two ids apart rather than adjacent. An offset that reduces
    // to the id's parity puts every corpse in one of two lockstep halves, and
    // two adjacent ids land in different halves, so an adjacent pair reads as
    // out of phase whether the offset spreads the wave or splits it in two.
    const state = createRun(3);
    const wave = flickering(state, 3);
    const [a, , c] = wave;
    expect(c.id - a.id).toBe(2);

    const differed = [];
    for (let tick = 0; tick < FLICKER_HALF_PERIOD * 4; tick++) {
      differed.push(
        freshnessBrightness(a, tick) !== freshnessBrightness(c, tick),
      );
    }
    expect(differed.some((apart) => apart)).toBe(true);
  });

  it('switches only a fraction of a burst-killed wave on any one tick', () => {
    // The hazard SC 2.3.1 is written about is a large area changing luminance
    // together, so what the offset has to buy is a small area per switch. A
    // wave in two halves changes half of itself at once; spread across the
    // period it changes a twelfth.
    const state = createRun(5);
    const wave = flickering(state, FLICKER_HALF_PERIOD);
    let before = wave.map((corpse) => freshnessBrightness(corpse, 0));
    let most = 0;
    for (let tick = 1; tick <= FLICKER_HALF_PERIOD * 4; tick++) {
      const now = wave.map((corpse) => freshnessBrightness(corpse, tick));
      const switched = now.filter((value, at) => value !== before[at]).length;
      most = Math.max(most, switched);
      before = now;
    }
    expect(most).toBeLessThanOrEqual(
      Math.ceil(wave.length / FLICKER_HALF_PERIOD),
    );
  });

  it("gives the revenant's tell a component that grows as the shot approaches", () => {
    // The closing iris is a countdown and it stays. What it could not do alone
    // is hold salience: it closes to nothing at the moment of maximum urgency.
    const early = alarmRadius('revenant', 0);
    const late = alarmRadius('revenant', 1);
    expect(late).toBeGreaterThan(early);
    // And the iris still closes, so the pair is a countdown and an alarm.
    expect(tellRadius('revenant', 1)).toBeLessThan(tellRadius('revenant', 0));
  });

  it("draws the armed marker as something in no mob type's silhouette", () => {
    // It was a down-pointing triangle, which is the ghoul's own body shape, and
    // ADR 0014 makes silhouette the first discriminator between types.
    const source = fieldRendererSource;
    expect(source).toContain('ARMED_NOTCH_HEIGHT');
    // The armed mark is a rect and no mob body is.
    const mark = source.slice(source.indexOf('function drawArmedMark'));
    const body = mark.slice(0, mark.indexOf('\n}'));
    expect(body).toContain('.rect(');
    expect(body).not.toContain('polygon(');
  });

  it('draws a shot larger than its hitbox and its core no larger than its hitbox', () => {
    // The assertion that would have caught an earlier draft raising the
    // collision box in the name of readability. The sprite grew; the box did not.
    expect(SHOT_DRAW_SCALE).toBeGreaterThan(1);
    expect(SHOT_CORE_OF_HITBOX).toBeLessThanOrEqual(1);

    const { layers, renderer } = attached();
    const state = createRun(3);
    const shot = putShot(state, 200, 300);
    renderer.sync(state);
    const sprite = (layers.layer('mobFire').children as Graphics[])[0];
    const drawn = sprite.getLocalBounds();
    expect(Math.max(drawn.width, drawn.height) / 2).toBeGreaterThan(
      shot.halfExtent,
    );
  });
});

describe('a drop on the field (plan 6.8)', () => {
  function dropAt(state: RunState, line: WeaponLine) {
    spawnDrop(state, 200, 300, line);
    return state.corpses.find((corpse) => corpse.alive)!;
  }

  it('draws in the treasure layer and never in the corpses layer', () => {
    // ADR 0014's stack puts treasure above mob bodies and corpses below them,
    // so a drop under a pile still reads as the thing worth diving for.
    const { layers, renderer } = attached();
    const state = createRun(3);
    dropAt(state, 'bell');
    renderer.sync(state);

    const treasure = layers.layer('treasure').children as Graphics[];
    const corpses = layers.layer('corpses').children as Graphics[];
    expect(treasure.filter((each) => each.visible)).toHaveLength(1);
    expect(corpses.filter((each) => each.visible)).toHaveLength(0);
  });

  it('draws a different silhouette for each of the four lines', () => {
    // The at-a-glance line read: four icons that must be told apart mid-dodge
    // with no HUD glance. Size separates a drop from a shot, 24 drawn units
    // against 16, and the drop breathes on size where a shot never does;
    // brightness separates neither, staying steady on both.
    const shapes = new Set<string>();
    for (const line of WEAPON_LINES) {
      const { layers, renderer } = attached();
      const state = createRun(3);
      dropAt(state, line);
      renderer.sync(state);
      const sprite = (layers.layer('treasure').children as Graphics[]).find(
        (each) => each.visible,
      )!;
      const bounds = sprite.getLocalBounds();
      shapes.add(`${bounds.width.toFixed(3)}x${bounds.height.toFixed(3)}`);
    }
    expect(shapes.size).toBe(WEAPON_LINES.length);
  });

  it('stays steady-bright where a corpse fades, whatever the tick', () => {
    // Steady-bright always means treasure (ADR 0004), so a drop never takes the
    // freshness tint and never flickers.
    const { layers, renderer } = attached();
    const state = createRun(3);
    const drop = dropAt(state, 'wisps');
    const tints = new Set<number>();
    for (const tick of [0, 7, 13, 40, 121]) {
      state.tick = tick;
      renderer.sync(state);
      const sprite = (layers.layer('treasure').children as Graphics[]).find(
        (each) => each.visible,
      )!;
      tints.add(sprite.tint);
    }
    expect(tints.size).toBe(1);
    expect(freshnessBrightness(drop, 0)).toBe(1);
  });

  it('draws larger than a corpse, which is the size rule Mark reversed on 2026-08-22', () => {
    const { layers, renderer } = attached();
    const state = createRun(3);
    const drop = dropAt(state, 'headstones');
    renderer.sync(state);
    const sprite = (layers.layer('treasure').children as Graphics[]).find(
      (each) => each.visible,
    )!;
    expect(drop.halfExtent).toBeGreaterThan(CORPSE_HALF_EXTENT);
    expect(sprite.getLocalBounds().width).toBeGreaterThan(0);
  });
});

describe("a drop's legibility (the fix inside #36)", () => {
  /** What one drop of this line actually draws, as bounds. */
  function drawnDrop(line: WeaponLine): Bounds {
    const { layers, renderer } = attached();
    const state = createRun(3);
    spawnDrop(state, 200, 300, line);
    renderer.sync(state);
    const sprite = (layers.layer('treasure').children as Graphics[]).find(
      (each) => each.visible,
    )!;
    return sprite.getLocalBounds();
  }

  const aspect = (box: Bounds) => box.width / box.height;

  /**
   * One recorded fill or cut from a sprite's context: its colour, its area by
   * the shoelace formula, and the box its own points span. Geometry only, no
   * rendering: the gate round retired the bounds measurements because bounds
   * cannot see ink, a concave shape filling its bounding box while being
   * mostly empty.
   */
  interface RecordedInk {
    action: 'fill' | 'cut';
    color: number;
    area: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  }

  /** The area of a closed polygon given as flat x,y pairs, by the shoelace formula. */
  function shoelace(points: readonly number[]): number {
    let twice = 0;
    for (let at = 0; at < points.length; at += 2) {
      const next = (at + 2) % points.length;
      twice += points[at] * points[next + 1] - points[next] * points[at + 1];
    }
    return Math.abs(twice) / 2;
  }

  /** Every fill and cut a sprite recorded, read off its context's poly and circle paths. */
  function recordedInk(sprite: Graphics): RecordedInk[] {
    const inks: RecordedInk[] = [];
    for (const instruction of sprite.context.instructions) {
      if (instruction.action !== 'fill' && instruction.action !== 'cut') {
        continue;
      }
      const color = instruction.data.style.color;
      for (const piece of instruction.data.path.instructions) {
        if (piece.action === 'poly') {
          const points: number[] = piece.data[0];
          const xs = points.filter((_, index) => index % 2 === 0);
          const ys = points.filter((_, index) => index % 2 === 1);
          inks.push({
            action: instruction.action,
            color,
            area: shoelace(points),
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys),
          });
        }
        if (piece.action === 'circle') {
          const [x, y, radius]: number[] = piece.data;
          inks.push({
            action: instruction.action,
            color,
            area: Math.PI * radius * radius,
            minX: x - radius,
            maxX: x + radius,
            minY: y - radius,
            maxY: y + radius,
          });
        }
      }
    }
    return inks;
  }

  /** A drop's bright ink: the fills in treasure's own colour, on screen, after the sprite's scale. */
  function brightInkArea(sprite: Graphics): number {
    const scale = sprite.scale.x;
    return recordedInk(sprite)
      .filter((ink) => ink.action === 'fill' && ink.color === PALETTE.drop.hex)
      .reduce((sum, ink) => sum + ink.area * scale * scale, 0);
  }

  /** The box a drop's bright ink spans, on screen, as its longest side. */
  function drawnLongAxis(sprite: Graphics): number {
    const bright = recordedInk(sprite).filter(
      (ink) => ink.action === 'fill' && ink.color === PALETTE.drop.hex,
    );
    const width =
      Math.max(...bright.map((ink) => ink.maxX)) -
      Math.min(...bright.map((ink) => ink.minX));
    const height =
      Math.max(...bright.map((ink) => ink.maxY)) -
      Math.min(...bright.map((ink) => ink.minY));
    return Math.max(width, height) * sprite.scale.x;
  }

  /** The box a drop's bright ink spans, as width over height. Scale cancels. */
  function inkAspect(sprite: Graphics): number {
    const bright = recordedInk(sprite).filter(
      (ink) => ink.action === 'fill' && ink.color === PALETTE.drop.hex,
    );
    const width =
      Math.max(...bright.map((ink) => ink.maxX)) -
      Math.min(...bright.map((ink) => ink.minX));
    const height =
      Math.max(...bright.map((ink) => ink.maxY)) -
      Math.min(...bright.map((ink) => ink.minY));
    return width / height;
  }

  /**
   * Net bright ink over the box it spans: bright fills minus every cut and
   * every fill in any other colour, divided by the box's area. The sanctioned
   * SPRITE_STROKE companion is a stroke, never a fill, so it stays outside
   * this measure.
   */
  function coverage(sprite: Graphics): number {
    const inks = recordedInk(sprite);
    const bright = inks.filter(
      (ink) => ink.action === 'fill' && ink.color === PALETTE.drop.hex,
    );
    const dark = inks.filter(
      (ink) => ink.action === 'cut' || ink.color !== PALETTE.drop.hex,
    );
    const width =
      Math.max(...bright.map((ink) => ink.maxX)) -
      Math.min(...bright.map((ink) => ink.minX));
    const height =
      Math.max(...bright.map((ink) => ink.maxY)) -
      Math.min(...bright.map((ink) => ink.minY));
    const brightArea = bright.reduce((sum, ink) => sum + ink.area, 0);
    const darkArea = dark.reduce((sum, ink) => sum + ink.area, 0);
    return (brightArea - darkArea) / (width * height);
  }

  /** One spawned drop, then whatever each listed tick draws, read off the treasure sprite. */
  function dropOverTicks<T>(
    line: WeaponLine,
    ticks: readonly number[],
    read: (sprite: Graphics) => T,
  ): T[] {
    const { layers, renderer } = attached();
    const state = createRun(3);
    spawnDrop(state, 200, 300, line);
    return ticks.map((tick) => {
      state.tick = tick;
      renderer.sync(state);
      const sprite = (layers.layer('treasure').children as Graphics[]).find(
        (each) => each.visible,
      )!;
      return read(sprite);
    });
  }

  /**
   * The played period, in ticks: 2.75 seconds. Restated from the ruling rather
   * than imported, so the test's truth stays independent of the module's.
   */
  const BREATH_PERIOD = Math.round(2.75 * TICK_HZ);

  const breathTicks = () =>
    Array.from({ length: BREATH_PERIOD }, (_, at) => at);

  /** The tick, within one period, at which this line's drawn size peaks. */
  function peakTick(line: WeaponLine): number {
    const sizes = dropOverTicks(line, breathTicks(), drawnLongAxis);
    return sizes.indexOf(Math.max(...sizes));
  }

  /** A corpse's own ink, the area the drop has to out-draw, by the same shoelace measure. */
  function corpseInk(): number {
    const { layers, renderer } = attached();
    const state = createRun(3);
    const dead = put(state, 'shambler', 60, 100);
    dead.alive = false;
    spawnCorpse(state, dead);
    renderer.sync(state);
    const sprite = sprites(layers, 'corpses').find((each) => each.visible)!;
    return recordedInk(sprite)
      .filter((ink) => ink.action === 'fill')
      .reduce((sum, ink) => sum + ink.area, 0);
  }

  it("draws more ink than a corpse at the breath's peak, measured by the shoelace formula", () => {
    // The hole the whole ticket fell through. palette.test.ts compared
    // DROP_HALF_EXTENT to CORPSE_HALF_EXTENT and passed while the player saw
    // the smaller sprite, and the bounds measure that replaced it was blind
    // the same way one level down: a concave shape fills its bounding box
    // while being mostly empty. Filled area against filled area is the
    // comparison that can tell. The peak is where the size claim lives; the
    // breath dips every silhouette below it by ruling (24 is the ceiling and
    // the breath moves inward), and the floor under the dip is the coverage
    // floor below.
    const corpse = corpseInk();
    for (const line of WEAPON_LINES) {
      const [ink] = dropOverTicks(line, [peakTick(line)], brightInkArea);
      expect(`${line} ${ink > corpse}`).toBe(`${line} true`);
    }
  });

  it("spans the full drawn box with every silhouette's fill at the breath's peak", () => {
    // So no icon quietly shrinks back to a fraction of its extent again. The
    // fill's own points are measured, so the stroke never pads the answer.
    for (const line of WEAPON_LINES) {
      const [size] = dropOverTicks(line, [peakTick(line)], drawnLongAxis);
      expect(size).toBeCloseTo(DROP_DRAW_HALF_EXTENT * 2, 2);
    }
  });

  it('splits the four silhouettes on the coarsest axis a shape has', () => {
    // Tall, round, pointed, wide. A corner-of-the-eye read resolves an aspect
    // ratio and nothing finer, so four outlines that differ only in detail are
    // one shape to the player who is dodging. #38 may replace the imagery and
    // must not spend this separation back.
    const ratios = WEAPON_LINES.map((line) => aspect(drawnDrop(line))).sort(
      (a, b) => a - b,
    );
    for (let at = 1; at < ratios.length; at++) {
      expect(`${at} ${ratios[at] / ratios[at - 1] >= 1.1}`).toBe(`${at} true`);
    }
    // And the set really spans tall through wide rather than crowding one end.
    expect(ratios[ratios.length - 1] / ratios[0]).toBeGreaterThan(4);
  });

  /** One drop's drawn width and its brightness, at a given tick. */
  function overTicks(ticks: readonly number[]) {
    const { layers, renderer } = attached();
    const state = createRun(3);
    spawnDrop(state, 200, 300, 'wisps');
    return ticks.map((tick) => {
      state.tick = tick;
      renderer.sync(state);
      const sprite = (layers.layer('treasure').children as Graphics[]).find(
        (each) => each.visible,
      )!;
      return {
        width: sprite.getBounds().width,
        tint: sprite.tint,
        alpha: sprite.alpha,
      };
    });
  }

  it("holds a drop's brightness still whatever the tick, so the breath never reaches the value channel", () => {
    // Mark played a brightness pulse against the size one and ruled it out:
    // steady-bright means treasure (ADR 0004) and the corpse's last-chance
    // flicker owns the value channel. The pair of assertions is the point. The
    // size has to move over these same ticks, or a constant brightness would be
    // proof of nothing at all.
    const drawn = overTicks([0, 41, 82, 124, 165]);
    expect(new Set(drawn.map((each) => each.tint)).size).toBe(1);
    expect(new Set(drawn.map((each) => each.alpha))).toEqual(new Set([1]));
    expect(new Set(drawn.map((each) => each.width)).size).toBeGreaterThan(1);
  });

  it("breathes on the tick and the drop's own id alone, so one tick draws one size every time", () => {
    // A wall clock here would make a replay disagree with the run it replays,
    // which is why the corpse flicker takes its phase from the corpse's own id
    // rather than from a random draw. The same drop carries the same id, so
    // feeding the same tick twice must give the same drawn size twice.
    const [first, moved, again] = overTicks([0, 41, 0]);
    expect(first.width).not.toBe(moved.width);
    expect(again.width).toBe(first.width);
  });

  /**
   * The floor on how much of its own box a drop's net bright ink covers.
   *
   * It replaces the ban on the identifier dropCore, which guarded a name and
   * not the defect: the defect is dark ink hollowing the silhouette at a small
   * draw size, and a floor stated as a number survives #38's art because it
   * says nothing about what the shape is. A headstone may engrave lettering, a
   * skull may open eye sockets, a bell may darken its mouth, so long as at
   * least half the box stays bright.
   *
   * The number is measured, not chosen: 0.5 is exactly the shipped kite's own
   * coverage, since a kite fills precisely half its bounding box, so the floor
   * is the shipped set's minimum. On the pointed axis it therefore doubles as
   * a silhouette constraint: #38's pointed imagery has no interior-ink slack
   * unless its shape is denser than a kite.
   */
  const COVERAGE_FLOOR = 0.5;

  it("keeps every line's net bright ink above the coverage floor, whatever the shape is", () => {
    for (const line of WEAPON_LINES) {
      const [cover] = dropOverTicks(line, [0], coverage);
      expect(`${line} ${cover >= COVERAGE_FLOOR - 1e-6}`).toBe(`${line} true`);
    }
  });

  it('breathes inward from a ceiling of 24 drawn units, by the played depth on the played period', () => {
    // Mark's ruling, 2026-08-25: "Keep 24 as the maximum and have the size
    // breath move inward from there." 24, the 0.18 depth and the 2.75 second
    // period are the values Mark played in the prototype, measured rather
    // than derived, so they stand here as their own numbers.
    const sizes = dropOverTicks('headstones', breathTicks(), drawnLongAxis);
    const peak = Math.max(...sizes);
    const trough = Math.min(...sizes);
    expect(peak).toBeLessThanOrEqual(24);
    expect(peak).toBeCloseTo(24, 2);
    expect(trough).toBeCloseTo(24 * (1 - 0.18), 2);
  });

  it('holds two neighbouring drops visibly apart in the breath, not merely unequal', () => {
    // On the tick alone every drop pulses together, and a drop can be born at
    // its smallest, the moment it most needs to be seen. The offset is the
    // drop's own id, the same device the corpse flicker already uses, because
    // the renderer must stay a pure function of the sim's own state.
    //
    // Ids arrive in sequence, so the two drops here are the adjacent pair the
    // stride has to separate. A test that asked only for inequality passed on a
    // hundredth of a unit, which is lockstep to the eye, so the floor is a
    // third of the breath's own travel: separation nobody has to measure to
    // see.
    const { layers, renderer } = attached();
    const state = createRun(3);
    spawnDrop(state, 100, 100, 'wisps');
    spawnDrop(state, 300, 300, 'wisps');
    const travel = 24 * 0.18;
    let widest = 0;
    for (const tick of breathTicks()) {
      state.tick = tick;
      renderer.sync(state);
      const visible = (layers.layer('treasure').children as Graphics[]).filter(
        (each) => each.visible,
      );
      expect(visible).toHaveLength(2);
      widest = Math.max(
        widest,
        Math.abs(drawnLongAxis(visible[0]) - drawnLongAxis(visible[1])),
      );
    }
    expect(widest).toBeGreaterThanOrEqual(travel / 3);
  });

  it('holds the on-screen stroke at SPRITE_STROKE through every phase of the breath', () => {
    // ADR 0014 grades strokes in APCA brackets that carry width terms, and
    // every other food sprite draws its companion at SPRITE_STROKE. A breath
    // that scaled the sprite scaled the stroke with it.
    const phases = [0, 41, 82, 124].map((tick) =>
      dropOverTicks('bell', [tick], (sprite) => ({
        scale: sprite.scale.x,
        widths: sprite.context.instructions
          .filter((instruction) => instruction.action === 'stroke')
          .map((instruction) => instruction.data.style.width),
      })),
    );
    for (const [{ scale, widths }] of phases) {
      expect(widths.length).toBeGreaterThan(0);
      for (const width of widths) {
        expect(width * scale).toBeCloseTo(SPRITE_STROKE, 9);
      }
    }
  });

  it("gives headstones the tall silhouette and soulStream the round one, the mapping #38's imagery keeps", () => {
    // A headstone is tall and a skull is round. The first pass shipped the
    // reverse, and #31's playtest must not learn a mapping #38's imagery then
    // inverts: any tester confusion would be unattributable.
    const aspectOf = (line: WeaponLine) =>
      dropOverTicks(line, [0], inkAspect)[0];
    for (const line of WEAPON_LINES) {
      if (line === 'headstones') continue;
      expect(`${line} ${aspectOf(line) > aspectOf('headstones')}`).toBe(
        `${line} true`,
      );
    }
    expect(aspectOf('soulStream')).toBeCloseTo(1, 5);
  });

  it('bounds the drawn peak at 24 units and the catch box below by the drawn peak', () => {
    // The two bounds that supersede palette.test.ts's retired
    // graveWidth(SIZE_FLOOR) bound, each on the thing it actually governs; the
    // supersession is written out in docs/design/drop-legibility-fix.md. The
    // ceiling test above holds the rendered side of the first bound; the
    // second keeps the pickup area at least the largest visible footprint, so
    // "I touched it and got it" is true at every breath phase.
    expect(DROP_DRAW_HALF_EXTENT * 2).toBeLessThanOrEqual(24);
    expect(DROP_HALF_EXTENT).toBeGreaterThanOrEqual(DROP_DRAW_HALF_EXTENT);
  });
});
