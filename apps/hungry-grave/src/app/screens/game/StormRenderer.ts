import { Graphics } from "pixi.js";

import { SKULL_CAP, WISP_CAP } from "../../../game/caps";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../../../game/field";
import { BELL_EXPAND_TICKS, ringRadius } from "../../../game/lines/bell";
import {
  headstoneAt,
  MAX_STONES,
  STONE_HALF_EXTENT,
} from "../../../game/lines/headstones";
import { SKULL_HALF_EXTENT } from "../../../game/lines/soulStream";
import { WISP_HALF_EXTENT } from "../../../game/lines/wisps";
import type { RunState } from "../../../game/run";
import { PALETTE } from "../../palette";
import type { FieldLayers } from "./layering";

/**
 * The player's own fire on screen: skulls, headstones, wisps, the bell's ring,
 * the belch's eruption and the splash.
 *
 * It is a second file beside FieldRenderer rather than four more methods on it.
 * That file is already the field's own entities and nearly five hundred lines;
 * the storm is a different owner with its own pools, and the two share no state.
 * What is copied is the pattern and not the code: a sprite pool sized from each
 * entity cap, slot-parallel iteration rather than a live list, a memo so a
 * sprite redraws only when its look changes, position set every frame, tint
 * rather than alpha for continuous state, and one place per-run memory dies.
 *
 * The four motions have to stay tellable at full density, which is ADR 0005's
 * generative rule: straight columns, circling solids, curving trails, expanding
 * rings. That is a silhouette-and-motion requirement and no test can see it.
 */

/** The dark companion every storm sprite carries (ADR 0014's own construction). */
const SPRITE_STROKE = 1.2;

/** How dim a spent headstone draws, so the player can see their defense is inert. */
const INERT_TINT = 0.45;

/** How thick the bell's ring is stroked, in field units. */
const RING_STROKE = 2.5;

/** The alpha a bell ring starts at, fading to nothing as it reaches its full radius. */
const RING_ALPHA = 0.85;

/**
 * How long the eruption reads for, in ticks, and how far it reaches.
 *
 * A third of a second, so it reads as a shock front rather than a bloom, and out
 * to the field's own diagonal rather than its width, so it leaves the far corner
 * behind. Anything shorter in reach reads as a large bell toll, and the bell is
 * a different line: the bell's ring takes 45 ticks to a quarter of the distance,
 * which is what keeps the two tellable apart under ADR 0005's generative rule.
 *
 * Hitstop is refused rather than omitted. A sim pause changes the tick count and
 * ADR 0015 makes the tick count the run, so a real hitstop is a determinism
 * change, and a render-only hold desynchronizes the screen from a sim that keeps
 * stepping. What carries the punch instead is the scatter storm FieldRenderer
 * already draws for a cancelled shot, up to four hundred of them at once in the
 * top layer of the stack, with this as the ground shock underneath.
 */
const ERUPTION_TICKS = 20;
const ERUPTION_REACH = Math.sqrt(
  FIELD_WIDTH * FIELD_WIDTH + FIELD_HEIGHT * FIELD_HEIGHT,
);

/** How thick the eruption's front is stroked, in field units. */
const ERUPTION_STROKE = 14;

/** How long the splash reads for, in ticks, and how far its spray throws. */
const SPLASH_TICKS = 18;
const SPLASH_REACH = 26;
const SPLASH_SPOKES = 7;

/**
 * Every transient read this renderer holds across frames, with its lifetime in
 * ticks: a burst's born is a past tick the run state no longer carries, so a
 * replay primed mid-run has to start far enough back to have seen it born
 * (#58). The registry in transients.ts aggregates these declarations, and the
 * covering test takes its bound over the registry rather than over a hand
 * list, the two-lists trap ADR 0019 closed for the witness fold.
 */
export const STORM_RENDERER_TRANSIENT_TICKS = {
  eruption: ERUPTION_TICKS,
  splash: SPLASH_TICKS,
} as const;

/** One byte's full value, for building a grey tint without writing a colour literal. */
const CHANNEL_MAX = 255;

/** A grey tint at a given brightness, which is how a continuous state is shown without alpha. */
function greyTint(brightness: number): number {
  const level = Math.max(
    0,
    Math.min(CHANNEL_MAX, Math.round(brightness * CHANNEL_MAX)),
  );
  return (level << 16) | (level << 8) | level;
}

/**
 * A skull: a small round-topped silhouette, straight up and self-similar.
 *
 * Every skull looks the same, so this is drawn once per sprite and then only
 * moved. ADR 0014's discriminator between the storm and mob fire is size and
 * shape before brightness, and small, regular and self-similar is the storm's
 * whole half of that grammar.
 */
function drawSkull(into: Graphics): void {
  const r = SKULL_HALF_EXTENT;
  into
    .clear()
    .circle(0, -r * 0.25, r * 0.75)
    .rect(-r * 0.55, -r * 0.25, r * 1.1, r * 1.1)
    .fill({ color: PALETTE.skull.hex })
    .circle(0, -r * 0.25, r * 0.75)
    .stroke({
      width: SPRITE_STROKE,
      color: PALETTE.foodOutline.hex,
      alignment: 0.5,
    });
}

/** A headstone: a squat slab with a rounded top, which is a circling solid and not a projectile. */
function drawStone(into: Graphics): void {
  const w = STONE_HALF_EXTENT;
  into
    .clear()
    .roundRect(-w, -w, w * 2, w * 2, w * 0.6)
    .fill({ color: PALETTE.stone.hex })
    .roundRect(-w, -w, w * 2, w * 2, w * 0.6)
    .stroke({
      width: SPRITE_STROKE,
      color: PALETTE.foodOutline.hex,
      alignment: 0.5,
    });
}

/**
 * A wisp: a trailing teardrop, drawn pointing along positive x and rotated to
 * its heading by the caller. The curving trail is the motion ADR 0005 says must
 * never blur with the other three.
 */
function drawWisp(into: Graphics): void {
  const r = WISP_HALF_EXTENT;
  into
    .clear()
    .poly([r, 0, -r * 1.6, r * 0.7, -r * 0.6, 0, -r * 1.6, -r * 0.7])
    .fill({ color: PALETTE.wisp.hex })
    .poly([r, 0, -r * 1.6, r * 0.7, -r * 0.6, 0, -r * 1.6, -r * 0.7])
    .stroke({
      width: SPRITE_STROKE,
      color: PALETTE.foodOutline.hex,
      alignment: 0.5,
    });
}

/** The bell's ring at a live radius: a stroked circle, so the falloff in damage is visible as a falloff on screen. */
function drawRing(into: Graphics, radius: number): void {
  into.clear();
  if (radius <= 0) return;
  into
    .circle(0, 0, radius)
    .stroke({
      width: RING_STROKE + SPRITE_STROKE * 2,
      color: PALETTE.foodOutline.hex,
      alignment: 0.5,
    })
    .circle(0, 0, radius)
    .stroke({
      width: RING_STROKE,
      color: PALETTE.bellRing.hex,
      alignment: 0.5,
    });
}

/** The belch's shock front, leaving the mouth and expanding past the field's far corner. */
function drawEruption(into: Graphics, progress: number): void {
  into.clear();
  const radius = ERUPTION_REACH * progress;
  if (radius <= 0) return;
  into.circle(0, 0, radius).stroke({
    width: ERUPTION_STROKE * (1 - progress) + SPRITE_STROKE,
    color: PALETTE.belchEruption.hex,
    alignment: 0.5,
  });
}

/** Charge going over the side: a short spray at the mouth, so wasting is visible rather than a silent clamp. */
function drawSplash(into: Graphics, progress: number): void {
  into.clear();
  const reach = SPLASH_REACH * progress;
  const drop = SPLASH_REACH * 0.22 * (1 - progress);
  for (let spoke = 0; spoke < SPLASH_SPOKES; spoke++) {
    const angle = Math.PI + (spoke / (SPLASH_SPOKES - 1)) * Math.PI;
    into.circle(
      Math.cos(angle) * reach,
      Math.sin(angle) * reach,
      Math.max(0.5, drop),
    );
  }
  into.fill({ color: PALETTE.splash.hex });
}

/** A sprite pool at an entity pool's own capacity, so attach() can place them all and no spawn allocates. */
function fill(sprites: Graphics[], capacity: number): void {
  while (sprites.length < capacity) {
    const sprite = new Graphics();
    sprite.visible = false;
    sprites.push(sprite);
  }
}

/** One momentary effect at a place, on its own clock. */
interface Burst {
  readonly sprite: Graphics;
  born: number;
  x: number;
  y: number;
}

function blankBurst(): Burst {
  return { sprite: new Graphics(), born: -Infinity, x: 0, y: 0 };
}

export class StormRenderer {
  private readonly skullSprites: Graphics[] = [];
  private readonly stoneSprites: Graphics[] = [];
  private readonly wispSprites: Graphics[] = [];
  private readonly ring = new Graphics();
  private readonly eruption = blankBurst();
  private readonly splash = blankBurst();

  private readonly skullDrawn: boolean[] = [];
  private readonly stoneDrawn: boolean[] = [];
  private readonly wispDrawn: boolean[] = [];
  private built = false;

  /**
   * Puts every pooled sprite into the layer SPRITE_LAYER assigns it.
   * FieldLayers.clear() empties every layer between runs, so the renderer has
   * to be able to put itself back rather than assume it is still attached.
   */
  public attach(layers: FieldLayers): void {
    this.build();
    this.forgetPreviousRun();
    const storm = layers.layer("storm");
    for (const sprite of this.skullSprites) storm.addChild(sprite);
    for (const sprite of this.stoneSprites) storm.addChild(sprite);
    for (const sprite of this.wispSprites) storm.addChild(sprite);
    layers.layer("bellRing").addChild(this.ring);
    layers.layer("belchEruption").addChild(this.eruption.sprite);
    layers.layer("belchEruption").addChild(this.splash.sprite);
  }

  /**
   * Everything the renderer remembers about the run that just ended, dropped.
   *
   * This is the field the pooled-screen leak lives in, and it has bitten this
   * app five times. A burst's born is a tick, and a born carrying the previous
   * run's tick is larger than anything a fresh run can produce for its first
   * minutes, so the effect would be stuck visible or stuck invisible for that
   * whole window. attach() is the one place a renderer is put back, so this is
   * where per-run memory has to die.
   *
   * Public because the replay screen's fast-forward calls it too (#58): a
   * headless skip lands mid-run with this memory belonging to no rendered
   * frame, so the skip forgets and the lead-in rebuilds it.
   */
  public forgetPreviousRun(): void {
    for (const burst of [this.eruption, this.splash]) {
      burst.born = -Infinity;
      burst.sprite.visible = false;
    }
    this.ring.visible = false;
    for (const sprite of this.skullSprites) sprite.visible = false;
    for (const sprite of this.stoneSprites) sprite.visible = false;
    for (const sprite of this.wispSprites) sprite.visible = false;
  }

  public detach(): void {
    for (const sprite of this.skullSprites) sprite.removeFromParent();
    for (const sprite of this.stoneSprites) sprite.removeFromParent();
    for (const sprite of this.wispSprites) sprite.removeFromParent();
    this.ring.removeFromParent();
    this.eruption.sprite.removeFromParent();
    this.splash.sprite.removeFromParent();
  }

  private build(): void {
    if (this.built) return;
    this.built = true;
    fill(this.skullSprites, SKULL_CAP);
    fill(this.stoneSprites, MAX_STONES);
    fill(this.wispSprites, WISP_CAP);
  }

  /** The storm as the sim says it is. */
  public sync(run: RunState): void {
    this.syncSkulls(run);
    this.syncStones(run);
    this.syncWisps(run);
    this.syncRing(run);
    this.syncBursts(run);
  }

  /** The belch landed. It is an event and not a state, so the screen tells the renderer. */
  public erupt(run: RunState): void {
    this.eruption.born = run.tick;
    this.eruption.x = run.grave.x;
    this.eruption.y = run.grave.y - run.grave.size;
  }

  /** Charge went over the side at a full reservoir (ADR 0008). */
  public splashed(run: RunState): void {
    this.splash.born = run.tick;
    this.splash.x = run.grave.x;
    this.splash.y = run.grave.y - run.grave.size;
  }

  private syncSkulls(run: RunState): void {
    for (let slot = 0; slot < run.skulls.length; slot++) {
      const skull = run.skulls[slot];
      const sprite = this.skullSprites[slot];
      sprite.visible = skull.alive;
      if (!skull.alive) continue;
      if (!this.skullDrawn[slot]) {
        this.skullDrawn[slot] = true;
        drawSkull(sprite);
      }
      sprite.position.set(skull.x, skull.y);
    }
  }

  private syncStones(run: RunState): void {
    for (let slot = 0; slot < this.stoneSprites.length; slot++) {
      const sprite = this.stoneSprites[slot];
      const at = headstoneAt(run, slot);
      sprite.visible = at !== null;
      if (at === null) continue;
      if (!this.stoneDrawn[slot]) {
        this.stoneDrawn[slot] = true;
        drawStone(sprite);
      }
      sprite.position.set(at.x, at.y);
      // An inert stone still draws, dimmed, so a spent defense is visible.
      const inert = run.lines.stoneRecharge[slot] > 0;
      sprite.tint = greyTint(inert ? INERT_TINT : 1);
    }
  }

  private syncWisps(run: RunState): void {
    for (let slot = 0; slot < run.wisps.length; slot++) {
      const wisp = run.wisps[slot];
      const sprite = this.wispSprites[slot];
      sprite.visible = wisp.alive;
      if (!wisp.alive) continue;
      if (!this.wispDrawn[slot]) {
        this.wispDrawn[slot] = true;
        drawWisp(sprite);
      }
      sprite.position.set(wisp.x, wisp.y);
      // Oriented to its heading, which is what makes the curve readable.
      sprite.rotation = Math.atan2(wisp.vy, wisp.vx);
    }
  }

  private syncRing(run: RunState): void {
    const ring = run.lines.ring;
    this.ring.visible = ring !== null;
    if (ring === null) return;
    drawRing(this.ring, ringRadius(ring));
    this.ring.position.set(run.grave.x, run.grave.y);
    // Fading as it expands, so the falloff in damage is visible as a falloff on
    // screen rather than being a number only the sim knows.
    const spent = Math.max(0, Math.min(1, ring.ticks / BELL_EXPAND_TICKS));
    this.ring.alpha = RING_ALPHA * (1 - spent);
  }

  private syncBursts(run: RunState): void {
    this.syncBurst(run, this.eruption, ERUPTION_TICKS, drawEruption);
    this.syncBurst(run, this.splash, SPLASH_TICKS, drawSplash);
  }

  private syncBurst(
    run: RunState,
    burst: Burst,
    life: number,
    draw: (into: Graphics, progress: number) => void,
  ): void {
    const age = run.tick - burst.born;
    if (age < 0 || age >= life) {
      burst.sprite.visible = false;
      return;
    }
    burst.sprite.visible = true;
    burst.sprite.position.set(burst.x, burst.y);
    draw(burst.sprite, age / life);
  }
}
