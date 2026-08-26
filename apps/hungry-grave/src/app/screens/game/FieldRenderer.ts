import { Graphics } from 'pixi.js';

import { CORPSE_CAP, MOB_CAP, MOB_FIRE_CAP } from '../../../game/caps';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../../game/field';
import { MOB_TYPES } from '../../../game/mobs';
import type { RunState } from '../../../game/run';
import { INVULNERABLE_TICKS } from '../../../game/tuning';
import { PALETTE } from '../../palette';
import { drawCorpse, drawDrop, freshnessTint } from './foodSprite';
import type { FieldLayers } from './layering';
import { drawScatter, drawShot, SCATTER_TICKS } from './mobFireSprite';
import { drawMob, mobLook } from './mobSprite';

/**
 * Everything on the field, drawn from the sim's own pools.
 *
 * Sprites are pooled exactly the way the entities are, a Graphics per slot with
 * visible following alive, because allocating a sprite per spawn is what makes
 * a wave hitch. What each kind draws lives in mobSprite, mobFireSprite and
 * foodSprite; what is here is the sync that drives them.
 */

// How dark the field goes at the instant of a hit. It is a subtraction and never a flash (ADR 0040).
const HIT_DIM_ALPHA = 0.5;

// How many scatters can be on the field at once before the oldest is reused.
const SCATTER_SLOTS = 24;

/**
 * Every transient read this renderer holds across frames, with its lifetime in
 * ticks: state born of a past tick rather than drawn from the run, so a replay
 * primed mid-run has to start far enough back to have seen it born (#58). The
 * registry in transients.ts aggregates these declarations, and the covering
 * test takes its bound over the registry rather than over a hand list, which
 * is the two-lists trap ADR 0019 closed for the witness fold.
 */
const FIELD_RENDERER_TRANSIENT_TICKS = {
  scatter: SCATTER_TICKS,
} as const;

/**
 * A sprite pool at the entity pool's own capacity, so attach() can put every
 * one of them in its layer and no spawn ever allocates.
 */
const fill = (sprites: Graphics[], capacity: number): void => {
  while (sprites.length < capacity) {
    const sprite = new Graphics();
    sprite.visible = false;
    sprites.push(sprite);
  }
};

// One cancelled shot, on its way out.
interface Scatter {
  readonly sprite: Graphics;
  born: number;
  extent: number;
}

// What the renderer remembers about a shot slot between frames, so a cancel can be told from a cull.
interface ShotMemory {
  alive: boolean;
  x: number;
  y: number;
  extent: number;
}

class FieldRenderer {
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
    const corpses = layers.layer('corpses');
    const treasure = layers.layer('treasure');
    const bodies = layers.layer('mobBodies');
    const fire = layers.layer('mobFire');
    for (const sprite of this.corpseSprites) corpses.addChild(sprite);
    for (const sprite of this.treasureSprites) treasure.addChild(sprite);
    for (const sprite of this.mobSprites) bodies.addChild(sprite);
    for (const sprite of this.shotSprites) fire.addChild(sprite);
    for (const scatter of this.scatters) fire.addChild(scatter.sprite);
    layers.layer('hitDim').addChild(this.dim);
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

  // The field as the sim says it is.
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
        MOB_TYPES[mob.type].motion === 'chases'
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
      const treasure = corpse.kind === 'drop';
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
        drawDrop(sprite, corpse, run.tick);
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
      sprite.tint = freshnessTint(corpse, run.tick);
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

export { FieldRenderer, FIELD_RENDERER_TRANSIENT_TICKS };
