/**
 * The field on screen. Render only: it reads the sim's pools and draws them,
 * and holds no rules.
 */

import type { Graphics } from "pixi.js";
import { describe, expect, it } from "vitest";

import { CORPSE_CAP, MOB_CAP, MOB_FIRE_CAP } from "../../../game/caps";
import { TICK_HZ } from "../../../game/clock";
import { FIELD_HEIGHT } from "../../../game/field";
import {
  CORPSE_HALF_EXTENT,
  spawnCorpse,
  spawnDrop,
} from "../../../game/corpses";
import type { WeaponLine } from "../../../game/lines/roster";
import { WEAPON_LINES } from "../../../game/lines/roster";
import type { MobType } from "../../../game/mobs";
import { ARRIVE_TICKS, MOB_TYPES, spawnMob } from "../../../game/mobs";
import type { RunState } from "../../../game/run";
import { createRun } from "../../../game/run";
import { INVULNERABLE_TICKS } from "../../../game/tuning";
import { CORPSE_TIERS } from "../../palette";
import fieldRendererSource from "./FieldRenderer.ts?raw";
import {
  alarmRadius,
  FieldRenderer,
  FLICKER_HALF_PERIOD,
  freshnessBrightness,
  SHOT_CORE_OF_HITBOX,
  SHOT_DRAW_SCALE,
  tellRadius,
} from "./FieldRenderer";
import { FieldLayers } from "./layering";

function attached(): { layers: FieldLayers; renderer: FieldRenderer } {
  const layers = new FieldLayers();
  const renderer = new FieldRenderer();
  renderer.attach(layers);
  return { layers, renderer };
}

function put(state: RunState, type: MobType, x: number, y: number) {
  return spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 })!;
}

function sprites(layers: FieldLayers, name: "corpses" | "mobBodies") {
  return layers.layer(name).children as Graphics[];
}

/** Puts one live shot in the first slot of the mob-fire pool. */
function putShot(state: RunState, x: number, y: number) {
  const shot = state.mobFire[0];
  shot.alive = true;
  shot.id = 1;
  shot.emitter = "shambler";
  shot.x = x;
  shot.y = y;
  shot.vx = 0;
  shot.vy = 1;
  shot.halfExtent = 5;
  return shot;
}

/** attach() adds the scatters after the shot pool, so they are the tail of the layer. */
function visibleScatters(layers: FieldLayers): number {
  const fire = layers.layer("mobFire").children as Graphics[];
  return fire.slice(MOB_FIRE_CAP).filter((each) => each.visible).length;
}

describe("FieldRenderer", () => {
  it("draws each entity kind into the layer layering.ts names for it (ADR 0014)", () => {
    const { layers } = attached();
    expect(layers.layer("corpses").children).toHaveLength(CORPSE_CAP);
    expect(layers.layer("mobBodies").children).toHaveLength(MOB_CAP);
    // The shot pool plus the cancelled-shot scatters, which share the layer
    // because a cancel is mob fire coming apart.
    expect(layers.layer("mobFire").children.length).toBeGreaterThanOrEqual(
      MOB_FIRE_CAP,
    );
    expect(layers.layer("hitDim").children).toHaveLength(1);
    // A sprite per corpse slot in the treasure layer too: drops ride the corpse
    // pool and ADR 0014's stack puts treasure two layers above corpses, so one
    // slot needs a sprite in each and which one shows is decided by its kind.
    expect(layers.layer("treasure").children).toHaveLength(CORPSE_CAP);
    expect(layers.layer("storm").children).toHaveLength(0);
  });

  it("shows a sprite only while its slot is alive", () => {
    const { layers, renderer } = attached();
    const state = createRun(1);
    renderer.sync(state);
    expect(sprites(layers, "mobBodies").every((each) => !each.visible)).toBe(
      true,
    );

    const mob = put(state, "shambler", 100, 100);
    renderer.sync(state);
    const slot = state.mobs.indexOf(mob);
    expect(sprites(layers, "mobBodies")[slot].visible).toBe(true);
    expect(sprites(layers, "mobBodies")[slot].position.x).toBe(100);

    mob.alive = false;
    renderer.sync(state);
    expect(sprites(layers, "mobBodies")[slot].visible).toBe(false);
  });

  it("pools its sprites the way the entities are pooled: a spawn after a death reuses one", () => {
    // Allocating a sprite per spawn is what makes a wave hitch, and this app's
    // whole defect history is pooled things nobody reset.
    const { layers, renderer } = attached();
    const state = createRun(1);
    const first = put(state, "shambler", 100, 100);
    renderer.sync(state);
    const slot = state.mobs.indexOf(first);
    const sprite = sprites(layers, "mobBodies")[slot];

    first.alive = false;
    const second = put(state, "revenant", 300, 200);
    expect(state.mobs.indexOf(second)).toBe(slot);
    renderer.sync(state);

    expect(sprites(layers, "mobBodies")).toHaveLength(MOB_CAP);
    expect(sprites(layers, "mobBodies")[slot]).toBe(sprite);
    expect(sprite.position.x).toBe(300);
  });

  it("fades a corpse by its freshness, as a tint on the declared hex and never as an alpha", () => {
    // An alpha fade would rotate a cream corpse's hue toward the night as it
    // drains, so every hue check in the palette test would be reasoning about a
    // colour the sprite never is (section 4.15.4).
    const { layers, renderer } = attached();
    const state = createRun(1);
    const dead = put(state, "shambler", 60, 100);
    dead.alive = false;
    spawnCorpse(state, dead);
    const corpse = state.corpses.find((each) => each.alive)!;
    const slot = state.corpses.indexOf(corpse);

    renderer.sync(state);
    const sprite = sprites(layers, "corpses")[slot];
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

  it("flickers a nearly empty corpse and never a feast", () => {
    const state = createRun(1);
    const dead = put(state, "shambler", 60, 100);
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

  it("tells an armed mob from an unarmed one, and a lit tell from an unlit one", () => {
    // ADR 0016 puts this ahead of everything else about the mob pool: a
    // shambler that will never shoot and one that will must not be the same
    // drawing, and a revenant's tell has to precede its shot.
    const { layers, renderer } = attached();
    const state = createRun(1);
    const plain = spawnMob(state, "shambler", {
      x: 60,
      y: MOB_TYPES.shambler.halfHeight,
      vx: 0,
      vy: 1,
      index: 0,
    })!;
    const armed = spawnMob(state, "shambler", {
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
      sprites(layers, "mobBodies")
        [state.mobs.indexOf(mob)].context.instructions.map(
          (each) => each.action,
        )
        .join(",");
    expect(drawn(plain)).not.toBe(drawn(armed));

    const revenant = spawnMob(state, "revenant", {
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
    expect(tellRadius("revenant", 1)).toBeLessThan(tellRadius("revenant", 0));
    expect(tellRadius("revenant", 0.5)).toBeLessThan(tellRadius("revenant", 0));
    expect(tellRadius("revenant", 1)).toBeGreaterThan(0);
  });

  it("draws the hit dim in its own layer, following the window down to zero", () => {
    const { layers, renderer } = attached();
    const state = createRun(1);
    const dim = layers.layer("hitDim").children[0] as Graphics;

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

  it("names a colour for every corpse tier the sim can produce", () => {
    for (const type of ["shambler", "revenant", "ghoul"] as const) {
      const tier = MOB_TYPES[type].corpseTier;
      expect(`${type} ${tier in CORPSE_TIERS}`).toBe(`${type} true`);
    }
  });

  it("draws a cancel scatter where a shot stopped being alive inside the field", () => {
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

  it("does not scatter for a shot that left the field, which was culled rather than cancelled", () => {
    const { layers, renderer } = attached();
    const state = createRun(1);
    putShot(state, 200, FIELD_HEIGHT + 40);
    renderer.sync(state);
    state.mobFire[0].alive = false;
    renderer.sync(state);
    expect(visibleScatters(layers)).toBe(0);
  });

  it("starts a second run with no scatter left over from the first, because the screen is pooled", () => {
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

  it("gives a second run the whole scatter pool, not the slots the first run left unused", () => {
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

  it("detach then attach puts everything back, which FieldLayers.clear() between runs requires", () => {
    const { layers, renderer } = attached();
    renderer.detach();
    for (const name of ["corpses", "mobBodies", "mobFire", "hitDim"] as const) {
      expect(layers.layer(name).children).toHaveLength(0);
    }

    layers.clear();
    renderer.attach(layers);
    expect(layers.layer("corpses").children).toHaveLength(CORPSE_CAP);
    expect(layers.layer("mobBodies").children).toHaveLength(MOB_CAP);
    expect(layers.layer("hitDim").children).toHaveLength(1);
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

  it("flickers two corpses killed on the same tick out of phase", () => {
    const state = createRun(3);
    const first = put(state, "shambler", 100, 100);
    const second = put(state, "shambler", 200, 100);
    first.alive = false;
    second.alive = false;
    spawnCorpse(state, first);
    spawnCorpse(state, second);
    const [a, b] = state.corpses.filter((corpse) => corpse.alive);
    a.freshness = 0.1;
    b.freshness = 0.1;
    expect(a.id).not.toBe(b.id);

    const differed = [];
    for (let tick = 0; tick < FLICKER_HALF_PERIOD * 4; tick++) {
      differed.push(
        freshnessBrightness(a, tick) !== freshnessBrightness(b, tick),
      );
    }
    expect(differed.some((apart) => apart)).toBe(true);
  });

  it("gives the revenant's tell a component that grows as the shot approaches", () => {
    // The closing iris is a countdown and it stays. What it could not do alone
    // is hold salience: it closes to nothing at the moment of maximum urgency.
    const early = alarmRadius("revenant", 0);
    const late = alarmRadius("revenant", 1);
    expect(late).toBeGreaterThan(early);
    // And the iris still closes, so the pair is a countdown and an alarm.
    expect(tellRadius("revenant", 1)).toBeLessThan(tellRadius("revenant", 0));
  });

  it("draws the armed marker as something in no mob type's silhouette", () => {
    // It was a down-pointing triangle, which is the ghoul's own body shape, and
    // ADR 0014 makes silhouette the first discriminator between types.
    const source = fieldRendererSource;
    expect(source).toContain("ARMED_NOTCH_HEIGHT");
    // The armed mark is a rect and no mob body is.
    const mark = source.slice(source.indexOf("function drawArmedMark"));
    const body = mark.slice(0, mark.indexOf("\n}"));
    expect(body).toContain(".rect(");
    expect(body).not.toContain("polygon(");
  });

  it("draws a shot larger than its hitbox and its core no larger than its hitbox", () => {
    // The assertion that would have caught an earlier draft raising the
    // collision box in the name of readability. The sprite grew; the box did not.
    expect(SHOT_DRAW_SCALE).toBeGreaterThan(1);
    expect(SHOT_CORE_OF_HITBOX).toBeLessThanOrEqual(1);

    const { layers, renderer } = attached();
    const state = createRun(3);
    const shot = putShot(state, 200, 300);
    renderer.sync(state);
    const sprite = (layers.layer("mobFire").children as Graphics[])[0];
    const drawn = sprite.getLocalBounds();
    expect(Math.max(drawn.width, drawn.height) / 2).toBeGreaterThan(
      shot.halfExtent,
    );
  });
});

describe("a drop on the field (plan 6.8)", () => {
  function dropAt(state: RunState, line: WeaponLine) {
    spawnDrop(state, 200, 300, line);
    return state.corpses.find((corpse) => corpse.alive)!;
  }

  it("draws in the treasure layer and never in the corpses layer", () => {
    // ADR 0014's stack puts treasure above mob bodies and corpses below them,
    // so a drop under a pile still reads as the thing worth diving for.
    const { layers, renderer } = attached();
    const state = createRun(3);
    dropAt(state, "bell");
    renderer.sync(state);

    const treasure = layers.layer("treasure").children as Graphics[];
    const corpses = layers.layer("corpses").children as Graphics[];
    expect(treasure.filter((each) => each.visible)).toHaveLength(1);
    expect(corpses.filter((each) => each.visible)).toHaveLength(0);
  });

  it("draws a different silhouette for each of the four lines", () => {
    // The at-a-glance line read: four icons that must be told apart mid-dodge
    // with no HUD glance. Size is not the channel, because a drop and a shot are
    // now drawn at the same 16 units.
    const shapes = new Set<string>();
    for (const line of WEAPON_LINES) {
      const { layers, renderer } = attached();
      const state = createRun(3);
      dropAt(state, line);
      renderer.sync(state);
      const sprite = (layers.layer("treasure").children as Graphics[]).find(
        (each) => each.visible,
      )!;
      const bounds = sprite.getLocalBounds();
      shapes.add(`${bounds.width.toFixed(3)}x${bounds.height.toFixed(3)}`);
    }
    expect(shapes.size).toBe(WEAPON_LINES.length);
  });

  it("stays steady-bright where a corpse fades, whatever the tick", () => {
    // Steady-bright always means treasure (ADR 0004), so a drop never takes the
    // freshness tint and never flickers.
    const { layers, renderer } = attached();
    const state = createRun(3);
    const drop = dropAt(state, "wisps");
    const tints = new Set<number>();
    for (const tick of [0, 7, 13, 40, 121]) {
      state.tick = tick;
      renderer.sync(state);
      const sprite = (layers.layer("treasure").children as Graphics[]).find(
        (each) => each.visible,
      )!;
      tints.add(sprite.tint);
    }
    expect(tints.size).toBe(1);
    expect(freshnessBrightness(drop, 0)).toBe(1);
  });

  it("draws larger than a corpse, which is the size rule Mark reversed on 2026-08-22", () => {
    const { layers, renderer } = attached();
    const state = createRun(3);
    const drop = dropAt(state, "headstones");
    renderer.sync(state);
    const sprite = (layers.layer("treasure").children as Graphics[]).find(
      (each) => each.visible,
    )!;
    expect(drop.halfExtent).toBeGreaterThan(CORPSE_HALF_EXTENT);
    expect(sprite.getLocalBounds().width).toBeGreaterThan(0);
  });
});
