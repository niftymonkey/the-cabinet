// The one boss on the field, drawn from the sim's own record. It draws into
// `mobBodies` and adds no layer name (ADR 0007, ADR 0014).

import { Graphics } from 'pixi.js';

import type { RunState } from '../../../game/run';
import { bossLook, drawBoss } from './bossSprite';
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
   * Puts the boss's sprite into `mobBodies`, above the mob pool, so a boss
   * draws over the adds it summons. FieldLayers.clear() empties every layer
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
    this.body.position.set(boss.x, boss.y);
  }
}

export { BossRenderer };
