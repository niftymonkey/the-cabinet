// The one boss on the field, drawn from the sim's own record. It draws into
// `mobBodies` and adds no layer name (ADR 0007, ADR 0014).

import { Graphics } from 'pixi.js';

import { BOSS_HALF_HEIGHT } from '../../../game/bosses/phases';
import type { RunState } from '../../../game/run';
import { bossLook, drawBoss } from './bossSprite';
import { SCENE_CAMERA } from './camera';
import { standingAt } from './groundPlacement';
import type { FieldLayers } from './layering';

/**
 * The boss, drawn from the one record RunState carries. A dumb view: data in,
 * pixels out, and every read is a function of that record, so a replay
 * rendering a pinned tape at a chosen tick draws the fight the run drew.
 *
 * One sprite and never a pool, for the same reason the sim holds one record:
 * there is exactly one boss at a time, ever. What it draws lives in
 * bossSprite.ts, which is the split mobSprite and mobFireSprite already give
 * this folder.
 */
class BossRenderer {
  private readonly body = new Graphics();
  private look = '';

  constructor() {
    // Invisible until a boss claims it, exactly as the pooled entity sprites
    // are: dressField() puts this back on every reset, and a run opens with
    // frames drawn before the first sync.
    this.body.visible = false;
  }

  /**
   * Puts the boss's sprite into `mobBodies`, where it sorts by depth with its
   * adds like every standing thing: a nearer add draws over it and a farther
   * one under it (tilted view A8). FieldLayers.clear() empties every layer
   * between runs, so the renderer has to be able to put itself back rather than
   * assume it is still attached.
   */
  public attach(layers: FieldLayers): void {
    layers.layer('mobBodies').addChild(this.body);
  }

  // The boss as the sim says it is.
  public sync(run: RunState): void {
    const boss = run.boss;
    this.body.visible = boss !== null;
    if (boss === null) return;
    const look = bossLook(boss);
    if (look !== this.look) {
      this.look = look;
      drawBoss(this.body, boss);
    }
    // Standing, its feet on the near edge of its footprint (A7).
    const at = standingAt(SCENE_CAMERA, boss.x, boss.y, BOSS_HALF_HEIGHT);
    this.body.position.set(at.x, at.y);
    this.body.scale.set(at.scaleX, at.scaleY);
    this.body.zIndex = boss.y + BOSS_HALF_HEIGHT;
  }
}

export { BossRenderer };
