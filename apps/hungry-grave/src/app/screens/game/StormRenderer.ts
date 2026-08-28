import { Graphics } from 'pixi.js';

import { SKULL_CAP, TERRITORY_CAP, WISP_CAP } from '../../../game/caps';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../../game/field';
import { BELL_EXPAND_TICKS, ringRadius } from '../../../game/lines/bell';
import { SKULL_HALF_EXTENT } from '../../../game/lines/soulStream';
import type { Patch } from '../../../game/lines/territory';
import {
  patchAt,
  TERRITORY_OPENING_TICKS,
} from '../../../game/lines/territory';
import { WISP_HALF_EXTENT } from '../../../game/lines/wisps';
import type { RunState } from '../../../game/run';
import { PALETTE } from '../../palette';
import type { FieldLayers } from './layering';

/**
 * The player's own fire on screen: skulls, Territory's claimed ground, wisps,
 * the bell's ring, the belch's eruption and the splash.
 *
 * It is a second file beside FieldRenderer rather than four more methods on it.
 * The storm is a different owner with its own pools, and the two share no state.
 * What is copied is the pattern and not the code: a sprite pool sized from each
 * entity cap, slot-parallel iteration rather than a live list, a memo so a
 * sprite redraws only when its look changes, position set every frame, tint
 * rather than alpha for continuous state, and one place per-run memory dies.
 *
 * The four motions have to stay tellable at full density, which is ADR 0005's
 * generative rule: straight columns, circling solids, curving trails, expanding
 * rings. That is a silhouette-and-motion requirement and no test can see it.
 */

// The dark companion every storm sprite carries (ADR 0014's own construction).
const SPRITE_STROKE = 1.2;

/**
 * How dim ground draws while it is still opening, so the beat before the hands
 * come up reads as anticipation rather than as ground that already bites.
 */
const OPENING_TINT = 0.45;

// How thick a patch's rim is stroked, in field units.
const PATCH_STROKE = 2;

/**
 * The arrival mark: what leaves the grave and travels to ground that is about
 * to open, so the claim reads as something the grave sent rather than as
 * ground that simply appeared. PROVISIONAL scaffolding for the #38 art pass.
 *
 * ADR 0044 holds that how the ground arrives is expression and not identity,
 * so nothing here is named for a manner of delivery: it is the mark that
 * arrives, and the art pass may make it anything.
 *
 * SWELL is how many times its own size it reaches at the top of the arc, and
 * 2.2 is large enough to read at a glance against a field of small sprites.
 * HANG is how much of the travel curve is the cubic term: at 0.7 the mark
 * moves at 0.3 of linear pace through the middle and 2.4 times it at both
 * ends, which is what makes the middle read as a hang rather than a constant
 * slide. SIZE is the fraction of the ground's own radius the mark draws at, so
 * bigger ground arrives as a bigger mark, with a floor so a level-1 mark is
 * still a shape.
 */
const ARRIVAL_SWELL = 2.2;
const ARRIVAL_HANG = 0.7;
const ARRIVAL_SIZE = 0.28;
const ARRIVAL_SIZE_FLOOR = 6;

/**
 * How high the arc lifts, as a share of the ground the mark covers, and the
 * band it is held inside, both in field units.
 *
 * A lift proportional to the distance is what keeps a short delivery from
 * looking like a long one played fast. The floor keeps a mark laid almost on
 * the grave from travelling flat, and the ceiling keeps a full-field delivery
 * from leaving the top of the screen.
 */
const ARRIVAL_RISE = 0.35;
const ARRIVAL_RISE_FLOOR = 24;
const ARRIVAL_RISE_CEILING = 90;

/**
 * The mark's outline: a fixed reach per vertex, so the shape is lumpy and
 * hand-torn rather than a circle, and identical every time it is drawn.
 *
 * Fixed and not drawn from anything: the renderer holds no rules and takes no
 * randomness, so an irregular shape has to be written down to be irregular.
 */
const ARRIVAL_WOBBLE: readonly number[] = [
  1, 0.84, 1.13, 0.91, 1.07, 0.79, 1.11, 0.88, 1.05,
];

/**
 * How the hands are drawn: one mark per grab the patch has left, spaced around
 * its rim, so a higher-level patch visibly carries more of them and every grab
 * takes one away. PROVISIONAL: the visual treatment is deliberately unchosen
 * (#38 is adjacent), and this is the plain readable first pass.
 */
const HAND_REACH = 0.34;
const HAND_WIDTH = 0.16;

// How thick the bell's ring is stroked, in field units.
const RING_STROKE = 2.5;

// The alpha a bell ring starts at, fading to nothing as it reaches its full radius.
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

// How thick the eruption's front is stroked, in field units.
const ERUPTION_STROKE = 14;

// How long the splash reads for, in ticks, and how far its spray throws.
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
const STORM_RENDERER_TRANSIENT_TICKS = {
  eruption: ERUPTION_TICKS,
  splash: SPLASH_TICKS,
  territoryArrival: TERRITORY_OPENING_TICKS,
} as const;

const clamp = (value: number, low: number, high: number): number => {
  return Math.min(Math.max(value, low), high);
};

// One byte's full value, for building a grey tint without writing a colour literal.
const CHANNEL_MAX = 255;

// A grey tint at a given brightness, which is how a continuous state is shown without alpha.
const greyTint = (brightness: number): number => {
  const level = Math.max(
    0,
    Math.min(CHANNEL_MAX, Math.round(brightness * CHANNEL_MAX)),
  );
  return (level << 16) | (level << 8) | level;
};

/**
 * A skull: a small round-topped silhouette, straight up and self-similar.
 *
 * Every skull looks the same, so this is drawn once per sprite and then only
 * moved. ADR 0014's discriminator between the storm and mob fire is size and
 * shape before brightness, and small, regular and self-similar is the storm's
 * whole half of that grammar.
 */
const drawSkull = (into: Graphics): void => {
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
};

/**
 * A patch of claimed ground: a torn-open ring at the radius the sim uses, with
 * hands inside it scaled to the ground's circumference, so bigger claimed
 * ground visibly holds more hands and level reads as size twice over.
 *
 * The rim is the collision radius exactly, because a drawn size that disagreed
 * with it would make the player's read of their own ground a lie. The hands
 * are what keep the four motions apart under ADR 0005: the patch itself drifts
 * with the food layer at the scroll speed, so without motion of its own it
 * would be an inert mark in the corpses' lane.
 */
const drawPatch = (into: Graphics, radius: number): void => {
  into.clear();
  if (radius <= 0) return;
  const hands = Math.round(radius / 8);
  into.circle(0, 0, radius).stroke({
    width: PATCH_STROKE,
    color: PALETTE.territory.hex,
    alignment: 0.5,
  });
  for (let hand = 0; hand < hands; hand++) {
    const angle = (hand / hands) * Math.PI * 2 - Math.PI / 2;
    const along = radius * (1 - HAND_REACH);
    into.circle(
      Math.cos(angle) * along,
      Math.sin(angle) * along,
      radius * HAND_WIDTH,
    );
  }
  if (hands > 0) into.fill({ color: PALETTE.territory.hex });
};

/**
 * The arrival mark at one size: a lumpy nine-sided blob in the ground's own
 * colour, drawn once per size and then only moved and scaled.
 *
 * It is the same construction drawWisp uses, a filled polygon under a dark
 * companion stroke, because it belongs to the same layer and has to read as
 * part of the storm rather than as a mob.
 */
const drawArrival = (into: Graphics, size: number): void => {
  into.clear();
  if (size <= 0) return;
  const outline: number[] = [];
  for (let vertex = 0; vertex < ARRIVAL_WOBBLE.length; vertex++) {
    const angle = (vertex / ARRIVAL_WOBBLE.length) * Math.PI * 2;
    const reach = size * ARRIVAL_WOBBLE[vertex];
    outline.push(Math.cos(angle) * reach, Math.sin(angle) * reach);
  }
  into
    .poly(outline)
    .fill({ color: PALETTE.territory.hex })
    .poly(outline)
    .stroke({
      width: SPRITE_STROKE,
      color: PALETTE.foodOutline.hex,
      alignment: 0.5,
    });
};

/**
 * A wisp: a trailing teardrop, drawn pointing along positive x and rotated to
 * its heading by the caller. The curving trail is the motion ADR 0005 says must
 * never blur with the other three.
 */
const drawWisp = (into: Graphics): void => {
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
};

// The bell's ring at a live radius: a stroked circle, so the falloff in damage is visible as a falloff on screen.
const drawRing = (into: Graphics, radius: number): void => {
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
};

// The belch's shock front, leaving the mouth and expanding past the field's far corner.
const drawEruption = (into: Graphics, progress: number): void => {
  into.clear();
  const radius = ERUPTION_REACH * progress;
  if (radius <= 0) return;
  into.circle(0, 0, radius).stroke({
    width: ERUPTION_STROKE * (1 - progress) + SPRITE_STROKE,
    color: PALETTE.belchEruption.hex,
    alignment: 0.5,
  });
};

// Charge going over the side: a short spray at the mouth, so wasting is visible rather than a silent clamp.
const drawSplash = (into: Graphics, progress: number): void => {
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
};

// What a patch sprite's geometry depends on, so a redraw happens only when it moves.
const patchLook = (patch: Patch): string => `${patch.radius}`;

// How big the mark for one patch's ground is drawn, in field units.
const arrivalSize = (patch: Patch): number => {
  return Math.max(ARRIVAL_SIZE * patch.radius, ARRIVAL_SIZE_FLOOR);
};

/** Where one slot's mark set out from, and the patch it set out for. */
interface ArrivalOrigin {
  readonly id: number;
  readonly x: number;
  readonly y: number;
}

// A sprite pool at an entity pool's own capacity, so attach() can place them all and no spawn allocates.
const fill = (sprites: Graphics[], capacity: number): void => {
  while (sprites.length < capacity) {
    const sprite = new Graphics();
    sprite.visible = false;
    sprites.push(sprite);
  }
};

// One momentary effect at a place, on its own clock.
interface Burst {
  readonly sprite: Graphics;
  born: number;
  x: number;
  y: number;
}

const blankBurst = (): Burst => {
  return { sprite: new Graphics(), born: -Infinity, x: 0, y: 0 };
};

class StormRenderer {
  private readonly skullSprites: Graphics[] = [];
  private readonly patchSprites: Graphics[] = [];
  private readonly arrivalSprites: Graphics[] = [];
  private readonly wispSprites: Graphics[] = [];
  private readonly ring = new Graphics();
  private readonly eruption = blankBurst();
  private readonly splash = blankBurst();

  private readonly skullDrawn: boolean[] = [];
  /**
   * The look each patch sprite last drew, so it redraws only when it changes.
   * It is a per-run memory keyed by slot and it dies in forgetPreviousRun: a
   * slot's radius and hand count both reset with the run.
   */
  private readonly patchDrawn: string[] = [];
  /**
   * The size each mark sprite last drew, on the same terms as patchDrawn: the
   * blob is drawn once per size and only scaled after that.
   */
  private readonly arrivalDrawn: number[] = [];
  /**
   * Where each slot's mark set out from, captured the first frame the slot
   * carries a patch this renderer has not seen before.
   *
   * Captured and not read live. The grave moves under the player's hand for
   * the whole beat, and a tail that followed it would read as the mark being
   * dragged along rather than as something already in the air.
   */
  private readonly arrivalOrigins: ArrivalOrigin[] = [];
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
    const storm = layers.layer('storm');
    for (const sprite of this.skullSprites) storm.addChild(sprite);
    for (const sprite of this.patchSprites) storm.addChild(sprite);
    for (const sprite of this.wispSprites) storm.addChild(sprite);
    // Last into the storm layer, so a mark still in the air draws over the
    // dimmed ground it is on its way to.
    for (const sprite of this.arrivalSprites) storm.addChild(sprite);
    layers.layer('bellRing').addChild(this.ring);
    layers.layer('belchEruption').addChild(this.eruption.sprite);
    layers.layer('belchEruption').addChild(this.splash.sprite);
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
    for (const sprite of this.patchSprites) sprite.visible = false;
    this.patchDrawn.length = 0;
    for (const sprite of this.arrivalSprites) sprite.visible = false;
    this.arrivalDrawn.length = 0;
    this.arrivalOrigins.length = 0;
    for (const sprite of this.wispSprites) sprite.visible = false;
  }

  public detach(): void {
    for (const sprite of this.skullSprites) sprite.removeFromParent();
    for (const sprite of this.patchSprites) sprite.removeFromParent();
    for (const sprite of this.arrivalSprites) sprite.removeFromParent();
    for (const sprite of this.wispSprites) sprite.removeFromParent();
    this.ring.removeFromParent();
    this.eruption.sprite.removeFromParent();
    this.splash.sprite.removeFromParent();
  }

  private build(): void {
    if (this.built) return;
    this.built = true;
    fill(this.skullSprites, SKULL_CAP);
    fill(this.patchSprites, TERRITORY_CAP);
    fill(this.arrivalSprites, TERRITORY_CAP);
    fill(this.wispSprites, WISP_CAP);
  }

  // The storm as the sim says it is.
  public sync(run: RunState): void {
    this.syncSkulls(run);
    this.syncPatches(run);
    this.syncArrivals(run);
    this.syncWisps(run);
    this.syncRing(run);
    this.syncBursts(run);
  }

  // The belch landed. It is an event and not a state, so the screen tells the renderer.
  public erupt(run: RunState): void {
    this.eruption.born = run.tick;
    this.eruption.x = run.grave.x;
    this.eruption.y = run.grave.y - run.grave.size;
  }

  // Charge went over the side at a full reservoir (ADR 0008).
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

  private syncPatches(run: RunState): void {
    for (let slot = 0; slot < this.patchSprites.length; slot++) {
      const sprite = this.patchSprites[slot];
      const patch = patchAt(run, slot);
      sprite.visible = patch !== null;
      if (patch === null) continue;
      const look = patchLook(patch);
      if (this.patchDrawn[slot] !== look) {
        this.patchDrawn[slot] = look;
        drawPatch(sprite, patch.radius);
      }
      sprite.position.set(patch.x, patch.y);
      // Ground still opening draws dimmed, so the beat before the hands come up
      // reads as a patch that cannot yet bite rather than as one that missed.
      const opening = patch.opening > 0;
      sprite.tint = greyTint(opening ? OPENING_TINT : 1);
      sprite.alpha = opening
        ? 1 - patch.opening / (TERRITORY_OPENING_TICKS + 1)
        : 1;
    }
  }

  /**
   * Where this slot's mark set out from: the grave's mouth as it stood the
   * frame the ground was claimed, remembered until the slot carries a
   * different patch.
   */
  private originOf(run: RunState, slot: number, patch: Patch): ArrivalOrigin {
    const remembered = this.arrivalOrigins[slot];
    if (remembered !== undefined && remembered.id === patch.id) {
      return remembered;
    }
    const fresh = {
      id: patch.id,
      x: run.grave.x,
      y: run.grave.y - run.grave.size,
    };
    this.arrivalOrigins[slot] = fresh;
    return fresh;
  }

  /**
   * The mark on its way to ground that has not opened yet. It is derived
   * wholly from a patch still in its beat, so the sim carries nothing for it
   * and no event is plumbed: data in, pixels out.
   *
   * The arc is a fake Z. `height` peaks at 1 halfway through the beat and the
   * mark is lifted by it, swollen by it, and set back down by it, so one
   * number carries the whole read of something leaving the ground and landing.
   */
  private syncArrivals(run: RunState): void {
    for (let slot = 0; slot < this.arrivalSprites.length; slot++) {
      const sprite = this.arrivalSprites[slot];
      const patch = patchAt(run, slot);
      sprite.visible = patch !== null && patch.opening > 0;
      if (patch === null || patch.opening <= 0) continue;

      const size = arrivalSize(patch);
      if (this.arrivalDrawn[slot] !== size) {
        this.arrivalDrawn[slot] = size;
        drawArrival(sprite, size);
      }

      const origin = this.originOf(run, slot, patch);
      const spent =
        (TERRITORY_OPENING_TICKS - patch.opening) / TERRITORY_OPENING_TICKS;
      const swing = 2 * spent - 1;
      const travel =
        0.5 + 0.5 * ((1 - ARRIVAL_HANG) * swing + ARRIVAL_HANG * swing ** 3);
      const height = 4 * spent * (1 - spent);
      const rise = clamp(
        ARRIVAL_RISE * Math.hypot(patch.x - origin.x, patch.y - origin.y),
        ARRIVAL_RISE_FLOOR,
        ARRIVAL_RISE_CEILING,
      );

      sprite.position.set(
        origin.x + (patch.x - origin.x) * travel,
        origin.y + (patch.y - origin.y) * travel - height * rise,
      );
      sprite.scale.set(1 + height * (ARRIVAL_SWELL - 1));
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

export { StormRenderer, STORM_RENDERER_TRANSIENT_TICKS };
