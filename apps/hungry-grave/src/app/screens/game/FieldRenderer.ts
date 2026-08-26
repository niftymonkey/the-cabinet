import { Graphics } from "pixi.js";

import { CORPSE_CAP, MOB_CAP, MOB_FIRE_CAP } from "../../../game/caps";
import { TICK_HZ } from "../../../game/clock";
import type { Corpse } from "../../../game/corpses";
import { CORPSE_HALF_EXTENT } from "../../../game/corpses";
import type { WeaponLine } from "../../../game/lines/roster";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../../../game/field";
import type { Mob, MobType, Shot } from "../../../game/mobs";
import { MOB_TYPES, mobTellLit } from "../../../game/mobs";
import type { RunState } from "../../../game/run";
import { INVULNERABLE_TICKS } from "../../../game/tuning";
import { CORPSE_TIERS, MOB_FIRE, PALETTE } from "../../palette";
import type { FieldLayers } from "./layering";

/**
 * Everything on the field, drawn from the sim's own pools.
 *
 * The mob silhouettes are placeholders and ticket #38 owns the art. What they
 * have to do is satisfy ADR 0014's readability rules, and satisfying them is
 * the whole job: each type has its own outline, an armed mob looks armed, and a
 * revenant's tell is a visible change that precedes its shot. Deliberate
 * placeholder design is the standing expectation here and Halloween art is not.
 *
 * Sprites are pooled exactly the way the entities are, a Graphics per slot with
 * visible following alive, because allocating a sprite per spawn is what makes
 * a wave hitch.
 */

/** How dark the field goes at the instant of a hit. It is a subtraction and never a flash (ADR 0014). */
const HIT_DIM_ALPHA = 0.5;

/** How dark a corpse fades to at empty, as a share of its declared colour. */
const CORPSE_FADE_FLOOR = 0.25;

/** Below this freshness a corpse flickers, which is its last-chance warning (ADR 0004). */
const FLICKER_BELOW = 0.2;

/**
 * Half the flicker's period, in ticks: 2.5 Hz.
 *
 * It was 6, which is 5 Hz. A single corpse was covered by WCAG SC 2.3.1's
 * small-area exemption, but a burst kill lands a whole wave of corpses at once
 * and a wave flashing together is not, and the criterion invokes Non-Interference
 * so a game gets no essential-to-functionality carve-out. Twelve clears the
 * eleven-tick floor tuning.ts already derives from the three-flashes-a-second
 * limit. Nothing could produce a burst kill before the storm existed.
 */
export const FLICKER_HALF_PERIOD = 12;

/** How far the flicker drops on its dark half. */
const FLICKER_DEPTH = 0.45;

/** How long a cancelled shot's scatter reads for, in ticks. */
const SCATTER_TICKS = 12;

/** How many scatters can be on the field at once before the oldest is reused. */
const SCATTER_SLOTS = 24;

/**
 * Every transient read this renderer holds across frames, with its lifetime in
 * ticks: state born of a past tick rather than drawn from the run, so a replay
 * primed mid-run has to start far enough back to have seen it born (#58). The
 * registry in transients.ts aggregates these declarations, and the covering
 * test takes its bound over the registry rather than over a hand list, which
 * is the two-lists trap ADR 0019 closed for the witness fold.
 */
export const FIELD_RENDERER_TRANSIENT_TICKS = {
  scatter: SCATTER_TICKS,
} as const;

/**
 * How much larger than its hitbox a shot is drawn.
 *
 * The whole sprite used to be built from shot.halfExtent, which is the collision
 * box, so at 5 it drew 10 field units, about 7.2 CSS pixels on a 390-wide phone,
 * on the object ADR 0014 calls large and that fifteen of eighteen bot deaths
 * came from. At 1.6 it draws 16 units, about 11.5 CSS pixels, still smaller than
 * every mob body. The hitbox does not move: this is a drawing constant and the
 * collision box stays where it is.
 */
export const SHOT_DRAW_SCALE = 1.6;

/**
 * Half of a drop's drawn extent at the breath's peak: a 24-unit drawn ceiling
 * against a corpse's 14 and a mob-fire shot's 16. Twenty-four is the value
 * Mark played in the prototype, and the breath only moves inward from it.
 *
 * Weight is the first half of the at-a-glance line read: a player cannot judge
 * which line a drop upgrades until the drop itself is the loudest thing near it.
 *
 * The catch box (DROP_HALF_EXTENT, 28 units) is deliberately more generous
 * than this drawn peak, about 1.17 times the ink, so collecting treasure is
 * never a precision test: the breath moves the visible edge, and ADR 0003
 * already rules that size never gates a swallow. Raising that box was a sim
 * change, and old sealed tapes replaying differently is expected; the witness
 * refusing them is the system working (Mark's general ruling, 2026-08-25).
 * The retired bound tying the drop's box to graveWidth(SIZE_FLOOR) is
 * superseded, written out in docs/design/drop-legibility-fix.md.
 */
export const DROP_DRAW_HALF_EXTENT = 12;

/**
 * How long one breath takes, in ticks: 2.75 seconds, the period Mark played.
 *
 * Derived from TICK_HZ rather than written as 165, because the figure that was
 * chosen is the duration and a later change to the tick rate must not silently
 * rescale it.
 */
const DROP_BREATH_TICKS = Math.round(2.75 * TICK_HZ);

/**
 * How far the breath dips the drawing below its peak, as a share of the drawn
 * size.
 *
 * The breath is what separates a drop from the still corpses around it, and it is
 * spent on size alone. Brightness was played against it on 2026-08-25 and ruled
 * out: steady-bright means treasure (ADR 0004), the corpse's last-chance flicker
 * owns the value channel, and graveGlow is exempted from sharing this colour on
 * the written grounds that the glow pulses where a drop is steady. A size pulse
 * leaves all three standing.
 *
 * It only ever dips inward, because the peak is the ceiling: "keep 24 as the
 * maximum and have the size breath move inward from there" (Mark, 2026-08-25).
 */
const DROP_BREATH_DEPTH = 0.18;

/**
 * How much of its drawn size a drop wears on this tick.
 *
 * The tick and the drop's own id are the only inputs. The renderer is a pure
 * function of sim state, and a wall clock here would make a replay disagree
 * with the run it replays. The id offsets each drop's phase, the same device
 * the corpse flicker already uses, so a field of drops does not pulse in
 * lockstep.
 */
function dropBreath(tick: number, id: number): number {
  const phase = ((tick + id) / DROP_BREATH_TICKS) * Math.PI * 2;
  return 1 - DROP_BREATH_DEPTH * (0.5 + 0.5 * Math.sin(phase));
}

/**
 * How much of the hitbox the bright core covers, so the core is the true box
 * rather than a fraction of the drawn star.
 *
 * That is Cave's and Touhou's own convention, a bright core the player can read
 * as the real danger under a larger body, and it is what makes the sprite
 * growing an honest change rather than a bigger lie about where the danger is.
 */
export const SHOT_CORE_OF_HITBOX = 0.9;

/** How far a scatter's spokes reach, as a multiple of the shot's own extent. */
const SCATTER_REACH = 2.4;

/** How many spokes a scatter throws. */
const SCATTER_SPOKES = 6;

/** The dark companion every mob body and corpse draws with (section 4.15.2). */
export const SPRITE_STROKE = 1.5;

/** How many steps the revenant's tell is quantized into, so a lit tell redraws a bounded number of times. */
const TELL_STEPS = 6;

/** One byte's full value, for building a grey tint without writing a colour literal. */
const CHANNEL_MAX = 255;

/** A grey tint at a given brightness. pixi multiplies it into the drawn colour, which is what makes the fade a tint and not an alpha. */
function greyTint(brightness: number): number {
  const level = Math.max(
    0,
    Math.min(CHANNEL_MAX, Math.round(brightness * CHANNEL_MAX)),
  );
  return (level << 16) | (level << 8) | level;
}

/** A regular polygon's points, as a flat list, starting at the top. */
function polygon(sides: number, radius: number, turn = 0): number[] {
  const points: number[] = [];
  for (let corner = 0; corner < sides; corner++) {
    const angle = turn + (corner / sides) * Math.PI * 2 - Math.PI / 2;
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  return points;
}

/** A soft star, alternating between two radii. Mob fire is large, slow and irregular, and this is the irregular half. */
function star(points: number, outer: number, inner: number): number[] {
  const flat: number[] = [];
  for (let corner = 0; corner < points * 2; corner++) {
    const angle = (corner / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = corner % 2 === 0 ? outer : inner;
    flat.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  return flat;
}

/** What a mob's drawing depends on, so a sprite is rebuilt only when its look changes. */
function mobLook(mob: Mob): string {
  const fire = MOB_TYPES[mob.type].fire;
  const lit = mobTellLit(mob);
  const step = lit
    ? Math.round((1 - mob.fireIn / Math.max(1, fire.tellTicks)) * TELL_STEPS)
    : -1;
  return `${mob.type}|${mob.armed}|${step}`;
}

/** The body outline of one mob type. A shambler is squat, a revenant is a diamond, and a ghoul is a wedge that points where it is going. */
function drawBody(into: Graphics, type: MobType): void {
  const row = MOB_TYPES[type];
  if (type === "shambler") {
    into.roundRect(
      -row.halfWidth,
      -row.halfHeight,
      row.halfWidth * 2,
      row.halfHeight * 2,
      row.halfWidth * 0.3,
    );
    return;
  }
  if (type === "revenant") {
    into.poly(polygon(4, row.halfWidth));
    return;
  }
  into.poly(polygon(3, row.halfWidth, Math.PI));
}

/** How tall the armed notch is cut, as a share of the mob's half-width. */
const ARMED_NOTCH_HEIGHT = 0.28;

/**
 * The mark an armed mob wears: a horizontal notch cut through the body.
 *
 * It is a hole rather than a second colour, so an armed mob and an unarmed one
 * differ in silhouette and in value at once and the marker survives grayscale.
 * It is a notch rather than a down-pointing triangle because the triangle was
 * the ghoul's own body shape, and ADR 0014 makes silhouette the first
 * discriminator between types: spending that channel on a fourth meaning is what
 * the notch avoids, since a horizontal bar is in no type's vocabulary.
 */
function drawArmedMark(into: Graphics, type: MobType): void {
  const row = MOB_TYPES[type];
  const height = row.halfWidth * ARMED_NOTCH_HEIGHT;
  into
    .rect(-row.halfWidth * 0.6, -height / 2, row.halfWidth * 1.2, height)
    .fill({ color: PALETTE.foodOutline.hex });
}

/** How thick the tell's closing iris is drawn, in field units. */
const TELL_STROKE = 2;

/**
 * The tell, drawn as a dark iris closing toward the centre and an outer ring
 * that grows into the shot.
 *
 * The closing iris reads as a countdown rather than as a state and is kept. What
 * it could not do alone is hold salience: it closes to a 1.6-pixel radius at the
 * moment of maximum urgency, so the announcement faded exactly as the danger
 * arrived. The outer ring is the half that grows, so the tell rises into the
 * shot instead of falling away from it.
 */
function drawTell(into: Graphics, type: MobType, progress: number): void {
  into.circle(0, 0, tellRadius(type, progress)).stroke({
    width: TELL_STROKE,
    color: PALETTE.foodOutline.hex,
    alignment: 0.5,
  });
  into.circle(0, 0, alarmRadius(type, progress)).stroke({
    width: TELL_STROKE * (0.4 + progress),
    color: PALETTE.foodOutline.hex,
    alignment: 0.5,
  });
}

/** How wide the outer ring stands at this much of the way to the shot. It grows, where the iris closes. */
export function alarmRadius(type: MobType, progress: number): number {
  const row = MOB_TYPES[type];
  return row.halfWidth * (0.95 + 0.5 * progress);
}

/** How wide the iris stands at this much of the way to the shot. It closes, so a player reads how long is left rather than only that something is coming. */
export function tellRadius(type: MobType, progress: number): number {
  const row = MOB_TYPES[type];
  return Math.max(TELL_STROKE, row.halfWidth * (0.9 - 0.7 * progress));
}

function drawMob(into: Graphics, mob: Mob): void {
  into.clear();
  drawBody(into, mob.type);
  into.fill({ color: PALETTE.mob.hex });
  drawBody(into, mob.type);
  into.stroke({
    width: SPRITE_STROKE,
    color: PALETTE.foodOutline.hex,
    alignment: 0.5,
  });
  if (!mob.armed) return;
  const fire = MOB_TYPES[mob.type].fire;
  if (mobTellLit(mob)) {
    drawTell(into, mob.type, 1 - mob.fireIn / Math.max(1, fire.tellTicks));
    return;
  }
  drawArmedMark(into, mob.type);
}

/**
 * Mob fire, as ADR 0014's three colours: a near-black outline so the sprite
 * holds against a background the palette never planned for, a saturated body
 * carrying the hue, and a near-white core carrying the reserved value band.
 *
 * The three radii are close together on purpose. The core is what the band
 * guarantees, and at a shot's real size on screen a core drawn as a small
 * fraction of the sprite is a couple of pixels and reads as nothing at all, so
 * the outline is a rim rather than a third of the sprite.
 *
 * Alpha stays 1 and no compositing mode is set. Both are forbidden rather than
 * measured: a core at luma 90 drawn at alpha 0.90 over the night composites to
 * 81.7 and falls out of the band.
 */
function drawShot(into: Graphics, shot: Shot): void {
  const sprite = MOB_FIRE.trash;
  const outer = shot.halfExtent * SHOT_DRAW_SCALE;
  into
    .clear()
    .poly(star(5, outer, outer * 0.66))
    .fill({ color: sprite.outline.hex })
    .poly(star(5, outer * 0.86, outer * 0.56))
    .fill({ color: sprite.body.hex })
    // The core is a blob and not a third star. The outer shape already carries
    // the size-and-shape grammar that tells mob fire from the storm, and a core
    // drawn as a star loses most of its own area to the notches, which is the
    // area the value band is carried by.
    //
    // It is sized from the hitbox and never from the drawn star, so the bright
    // middle of the sprite is where the collision box really is.
    .circle(0, 0, shot.halfExtent * SHOT_CORE_OF_HITBOX)
    .fill({ color: sprite.core.hex });
}

/**
 * A drop, as a steady-bright icon of its own line's silhouette.
 *
 * The four have to be told apart mid-dodge with no HUD glance, so they split on
 * the coarsest axis a silhouette has: tall, round, pointed, wide. A
 * corner-of-the-eye read resolves an aspect ratio and nothing finer, so four
 * outlines differing in detail are one shape to the player who is dodging.
 *
 * The mapping follows the natural imagery, a headstone tall, a skull round, a
 * flame pointed, a bell wide, so #31's playtest never learns a mapping #38's
 * art would invert.
 *
 * Each fills its box on its long axis. Ticket #38 may replace the imagery and
 * must hold both of those: the four aspects stay apart, and each one still fills
 * its box.
 *
 * The extent passed in is the drawn one, already carrying the breath, and never
 * the hitbox.
 */
function drawDropIcon(into: Graphics, line: WeaponLine, extent: number): void {
  const r = extent;
  if (line === "soulStream") {
    into.circle(0, 0, r);
    return;
  }
  if (line === "headstones") {
    into.poly([-r * 0.34, -r, r * 0.34, -r, r * 0.34, r, -r * 0.34, r]);
    return;
  }
  if (line === "wisps") {
    // The half-width is set so the kite's own filled area beats a corpse's
    // hexagon at the breath's peak; at 0.42 it measured five percent under.
    into.poly([0, -r, r * 0.48, r * 0.72, 0, r, -r * 0.48, r * 0.72]);
    return;
  }
  into.poly([
    -r,
    r * 0.52,
    -r * 0.44,
    -r * 0.52,
    r * 0.44,
    -r * 0.52,
    r,
    r * 0.52,
  ]);
}

/**
 * A drop on the field: its line's silhouette in treasure's colour, with the food
 * layer's own companion around it.
 *
 * The silhouette is solid to its outline. Nothing dark is drawn through the
 * middle, because the bright field of the sprite is what carries the read, and
 * the coverage floor in FieldRenderer.test.ts fails if it hollows out again.
 *
 * The breath arrives as the extent and rebuilds the geometry, never as a scale
 * on the sprite: a sprite scale would scale the stroke with it, and the
 * companion has to hold SPRITE_STROKE on screen at every phase, the width ADR
 * 0014's brackets grade. The per-tick rebuild is bounded by the handful of
 * drops alive at once, never a wave.
 */
function drawDrop(into: Graphics, corpse: Corpse, extent: number): void {
  const line = corpse.line ?? "soulStream";
  into.clear();
  drawDropIcon(into, line, extent);
  into.fill({ color: PALETTE.drop.hex });
  drawDropIcon(into, line, extent);
  into.stroke({
    width: SPRITE_STROKE,
    color: PALETTE.foodOutline.hex,
    alignment: 0.5,
  });
}

function drawCorpse(into: Graphics, corpse: Corpse): void {
  const tier = CORPSE_TIERS[corpse.tier];
  into
    .clear()
    .poly(polygon(6, CORPSE_HALF_EXTENT))
    .fill({ color: tier.hex })
    .poly(polygon(6, CORPSE_HALF_EXTENT))
    .stroke({
      width: SPRITE_STROKE,
      color: PALETTE.foodOutline.hex,
      alignment: 0.5,
    });
}

/**
 * A cancelled shot's read. A shot vanishing into the grave's mouth with no
 * effect is, in this game's grammar, the one verb of collection, so the cancel
 * is drawn as a scatter rather than a fall-in, and the belch uses the same read
 * when it cancels every shot on the field.
 *
 * The scatter shrinks rather than fading, because ADR 0014 forbids mob fire
 * drawing at anything but alpha 1.0 and this is mob fire coming apart.
 */
function drawScatter(into: Graphics, extent: number, progress: number): void {
  const sprite = MOB_FIRE.trash;
  const reach = extent * SCATTER_REACH * progress;
  const length = extent * (1 - progress) + extent * 0.2;
  into.clear();
  for (let spoke = 0; spoke < SCATTER_SPOKES; spoke++) {
    const angle = (spoke / SCATTER_SPOKES) * Math.PI * 2;
    const cx = Math.cos(angle) * reach;
    const cy = Math.sin(angle) * reach;
    into.circle(cx, cy, Math.max(0.5, length * 0.5));
  }
  into.fill({ color: sprite.body.hex });
}

/**
 * A sprite pool at the entity pool's own capacity, so attach() can put every
 * one of them in its layer and no spawn ever allocates.
 */
function fill(sprites: Graphics[], capacity: number): void {
  while (sprites.length < capacity) {
    const sprite = new Graphics();
    sprite.visible = false;
    sprites.push(sprite);
  }
}

/** One cancelled shot, on its way out. */
interface Scatter {
  readonly sprite: Graphics;
  born: number;
  extent: number;
}

/** What the renderer remembers about a shot slot between frames, so a cancel can be told from a cull. */
interface ShotMemory {
  alive: boolean;
  x: number;
  y: number;
  extent: number;
}

export class FieldRenderer {
  private readonly mobSprites: Graphics[] = [];
  private readonly shotSprites: Graphics[] = [];
  private readonly corpseSprites: Graphics[] = [];
  /**
   * A parallel sprite per corpse slot, in the treasure layer.
   *
   * Drops ride the corpse pool, and ADR 0014's stack puts treasure two layers
   * above corpses, so one slot needs a sprite in each: a Graphics cannot be in
   * two layers, and which one shows is decided per slot by the food's kind.
   */
  private readonly treasureSprites: Graphics[] = [];
  private readonly scatters: Scatter[] = [];
  private readonly dim = new Graphics();

  private readonly mobLooks: string[] = [];
  private readonly corpseTiers: string[] = [];
  private readonly shotExtents: number[] = [];
  private readonly shotMemory: ShotMemory[] = [];
  private built = false;

  /**
   * Puts every pooled sprite into the layer layering.ts names for it.
   * FieldLayers.clear() empties every layer between runs, so the renderer has
   * to be able to put itself back rather than assume it is still attached.
   */
  public attach(layers: FieldLayers): void {
    this.build();
    this.forgetPreviousRun();
    const corpses = layers.layer("corpses");
    const treasure = layers.layer("treasure");
    const bodies = layers.layer("mobBodies");
    const fire = layers.layer("mobFire");
    for (const sprite of this.corpseSprites) corpses.addChild(sprite);
    for (const sprite of this.treasureSprites) treasure.addChild(sprite);
    for (const sprite of this.mobSprites) bodies.addChild(sprite);
    for (const sprite of this.shotSprites) fire.addChild(sprite);
    for (const scatter of this.scatters) fire.addChild(scatter.sprite);
    layers.layer("hitDim").addChild(this.dim);
  }

  /**
   * Everything the renderer remembers about the run that just ended, dropped.
   * attach() is the one place a renderer is put back, because reset() calls
   * layers.clear() and then dressField(), so this is where per-run memory has
   * to die.
   *
   * Both of these compare against a value that resets with the run and neither
   * is a draw cache. shotMemory holds last frame's liveness per slot, so a shot
   * still on the field when a run ends reads as alive-then-dead on the next
   * run's first frame and fires a cancel read for a shot nobody saw. A
   * scatter's born is a tick, and oldestScatter() takes the smallest, so a born
   * carrying the previous run's tick is larger than anything a fresh run can
   * produce for its first fifteen seconds and that slot is never reused.
   *
   * Public because the replay screen's fast-forward calls it too (#58): a
   * headless skip lands mid-run with this memory belonging to no rendered
   * frame, so the skip forgets and the lead-in rebuilds it.
   */
  public forgetPreviousRun(): void {
    this.shotMemory.length = 0;
    for (const scatter of this.scatters) {
      scatter.born = -SCATTER_TICKS;
      scatter.extent = 0;
      scatter.sprite.visible = false;
    }
  }

  public detach(): void {
    for (const sprite of this.corpseSprites) sprite.removeFromParent();
    for (const sprite of this.treasureSprites) sprite.removeFromParent();
    for (const sprite of this.mobSprites) sprite.removeFromParent();
    for (const sprite of this.shotSprites) sprite.removeFromParent();
    for (const scatter of this.scatters) scatter.sprite.removeFromParent();
    this.dim.removeFromParent();
  }

  /**
   * The pools, allocated once. Their sizes come from the run rather than from
   * the caps directly, so the sprite pool and the entity pool cannot drift.
   */
  private build(): void {
    if (this.built) return;
    this.built = true;
    fill(this.mobSprites, MOB_CAP);
    fill(this.shotSprites, MOB_FIRE_CAP);
    fill(this.corpseSprites, CORPSE_CAP);
    fill(this.treasureSprites, CORPSE_CAP);
    this.dim
      .rect(0, 0, FIELD_WIDTH, FIELD_HEIGHT)
      .fill({ color: PALETTE.night.hex });
    this.dim.alpha = 0;
    for (let slot = 0; slot < SCATTER_SLOTS; slot++) {
      const sprite = new Graphics();
      sprite.visible = false;
      this.scatters.push({ sprite, born: -SCATTER_TICKS, extent: 0 });
    }
  }

  /** The field as the sim says it is. */
  public sync(run: RunState): void {
    this.syncCorpses(run);
    this.syncMobs(run);
    this.syncShots(run);
    this.syncScatters(run);
    this.dim.alpha =
      (run.grave.invulnerable / INVULNERABLE_TICKS) * HIT_DIM_ALPHA;
  }

  private syncMobs(run: RunState): void {
    for (let slot = 0; slot < run.mobs.length; slot++) {
      const mob = run.mobs[slot];
      const sprite = this.mobSprites[slot];
      sprite.visible = mob.alive;
      if (!mob.alive) continue;
      const look = mobLook(mob);
      if (look !== this.mobLooks[slot]) {
        this.mobLooks[slot] = look;
        drawMob(sprite, mob);
      }
      sprite.position.set(mob.x, mob.y);
      // A wedge that points where it is going is what makes the ghoul's turn
      // readable at all; the other two types are drawn upright.
      sprite.rotation =
        MOB_TYPES[mob.type].motion === "chases"
          ? Math.atan2(mob.vy, mob.vx) - Math.PI / 2
          : 0;
    }
  }

  private syncShots(run: RunState): void {
    for (let slot = 0; slot < run.mobFire.length; slot++) {
      const shot = run.mobFire[slot];
      const sprite = this.shotSprites[slot];
      const seen = this.shotMemory[slot];
      if (seen?.alive && !shot.alive) this.cancelAt(run, seen);
      // Mutated in place rather than replaced. A fresh literal per slot is
      // MOB_FIRE_CAP allocations every frame, which is the per-frame garbage
      // this file pools sprites to avoid.
      if (seen === undefined) {
        this.shotMemory[slot] = {
          alive: shot.alive,
          x: shot.x,
          y: shot.y,
          extent: shot.halfExtent,
        };
      } else {
        seen.alive = shot.alive;
        seen.x = shot.x;
        seen.y = shot.y;
        seen.extent = shot.halfExtent;
      }
      sprite.visible = shot.alive;
      if (!shot.alive) continue;
      if (shot.halfExtent !== this.shotExtents[slot]) {
        this.shotExtents[slot] = shot.halfExtent;
        drawShot(sprite, shot);
      }
      sprite.position.set(shot.x, shot.y);
    }
  }

  private syncCorpses(run: RunState): void {
    for (let slot = 0; slot < run.corpses.length; slot++) {
      const corpse = run.corpses[slot];
      const treasure = corpse.kind === "drop";
      const sprite = treasure
        ? this.treasureSprites[slot]
        : this.corpseSprites[slot];
      this.corpseSprites[slot].visible = corpse.alive && !treasure;
      this.treasureSprites[slot].visible = corpse.alive && treasure;
      if (!corpse.alive) continue;

      if (treasure) {
        // Redrawn every tick rather than cached on a look: the breath moves
        // the geometry itself, which is what holds the stroke's on-screen
        // width still (see drawDrop).
        drawDrop(
          sprite,
          corpse,
          DROP_DRAW_HALF_EXTENT * dropBreath(run.tick, corpse.id),
        );
      } else {
        const look = `${corpse.kind}|${corpse.tier}`;
        if (look !== this.corpseTiers[slot]) {
          this.corpseTiers[slot] = look;
          drawCorpse(sprite, corpse);
        }
      }
      sprite.position.set(corpse.x, corpse.y);
      // Steady-bright always means treasure (ADR 0004), so a drop never takes
      // the freshness tint and never flickers.
      sprite.tint = greyTint(freshnessBrightness(corpse, run.tick));
    }
  }

  /**
   * A shot that stopped being alive inside the field was cancelled by the
   * grave; one that stopped outside it was culled and needs no read.
   */
  private cancelAt(run: RunState, seen: ShotMemory): void {
    const inside =
      seen.x >= 0 &&
      seen.x <= FIELD_WIDTH &&
      seen.y >= 0 &&
      seen.y <= FIELD_HEIGHT;
    if (!inside) return;
    const scatter = this.oldestScatter();
    scatter.born = run.tick;
    scatter.extent = seen.extent;
    scatter.sprite.position.set(seen.x, seen.y);
    scatter.sprite.visible = true;
  }

  private oldestScatter(): Scatter {
    let oldest = this.scatters[0];
    for (const scatter of this.scatters) {
      if (scatter.born < oldest.born) oldest = scatter;
    }
    return oldest;
  }

  private syncScatters(run: RunState): void {
    for (const scatter of this.scatters) {
      const age = run.tick - scatter.born;
      if (age < 0 || age >= SCATTER_TICKS) {
        scatter.sprite.visible = false;
        continue;
      }
      scatter.sprite.visible = true;
      drawScatter(scatter.sprite, scatter.extent, age / SCATTER_TICKS);
    }
  }
}

/**
 * How bright a corpse draws. Freshness is a multiplicative tint on the declared
 * hex and never an alpha over the night: an alpha fade would rotate a cream
 * corpse's hue toward the ground it lies on as it drains, so every hue check in
 * the palette test would be reasoning about a colour the sprite never is.
 *
 * Feasts never decay, so they never fade.
 */
export function freshnessBrightness(corpse: Corpse, tick: number): number {
  if (!corpse.decays) return 1;
  const faded =
    CORPSE_FADE_FLOOR + (1 - CORPSE_FADE_FLOOR) * Math.max(0, corpse.freshness);
  if (corpse.freshness >= FLICKER_BELOW) return faded;
  // Each corpse's phase is offset by its own id, one tick per id, so a wave
  // killed in one burst spreads its switches across the period instead of
  // changing together: the area changing luminance on any one tick is a
  // twelfth of the wave, which is the hazard SC 2.3.1 is written about. The
  // offset is the id and not a random draw, because the renderer must stay a
  // pure function of the sim's own state.
  const phase = Math.floor((tick + corpse.id) / FLICKER_HALF_PERIOD);
  return phase % 2 === 0 ? faded * FLICKER_DEPTH : faded;
}
