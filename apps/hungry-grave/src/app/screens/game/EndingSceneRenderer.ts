// The Undertaker's end on screen: his furrows in the ground, his body dragged over the field, and the same body falling inside the hole.

import { Container, Graphics } from 'pixi.js';

import { BOSS_HALF_WIDTH } from '../../../game/bosses/phases';
import type { BossKilled } from '../../../game/events';
import type { Grave } from '../../../game/grave';
import { PALETTE } from '../../palette';
import { drawBoss } from './bossSprite';
import type { EndingScene } from './endingScene';
import { endingSceneAt, sceneFrom } from './endingScene';
import { greyTint } from './foodSprite';
import { ENDING_FURROWS } from './graveDrawingValues';
import type { FieldLayers } from './layering';

/**
 * How many points a furrow is traced through, end to end. One per entry in the
 * wander profile, so the profile is walked exactly once however long the drag.
 */
const FURROW_POINTS = ENDING_FURROWS.wander.length;

/** How far apart the furrows sit, across the way he is dragged, in field units. */
const FURROW_SPREAD = ENDING_FURROWS.spread * BOSS_HALF_WIDTH * 2;

/**
 * One furrow's wander at this point of its trace, in field units. The profile
 * is walked from the line's own place in it, so no two hands scrape the same
 * mark and nothing random has to be reproduced by a replay.
 */
const wanderAt = (line: number, point: number): number => {
  const step = (line + point) % FURROW_POINTS;
  const share = ENDING_FURROWS.wander[step];
  if (share === undefined) throw new Error(`no wander at step ${step}`);
  return share * ENDING_FURROWS.width;
};

/**
 * The scene, drawn. A dumb view: it is handed the death's own event and then a
 * progress from nothing to whole, and every read is a function of those two, so
 * a replay of a won run plays the ending the run played (design record R6).
 *
 * Three pieces in three places, because one Graphics cannot be in two layers
 * and the scene crosses the stack: the furrows go in `ground`, under everything
 * including the grave that passes over them; the body being dragged goes in
 * `mobBodies`, where the boss was drawn while he fought; and the falling body
 * goes in the grave's own falls container, so he passes under the turf and down
 * the inside of the hole exactly as a swallowed corpse does (ADR 0014).
 */
class EndingSceneRenderer {
  private readonly furrows = new Graphics();
  private readonly dragged = new Graphics();
  private readonly falling = new Graphics();
  /**
   * The scene's own record, or null when no run on this screen has been won.
   * It is a whole run's worth of memory, which is why forgetPreviousRun drops
   * it: screens are pooled.
   */
  private scene: EndingScene | null = null;

  constructor() {
    // Invisible until a death begins the scene, because dressField puts this
    // renderer back on every reset and a run opens with frames drawn before
    // anything is ever shown.
    this.forgetPreviousRun();
  }

  public attach(layers: FieldLayers, falls: Container): void {
    layers.layer('ground').addChild(this.furrows);
    layers.layer('mobBodies').addChild(this.dragged);
    falls.addChild(this.falling);
  }

  public detach(): void {
    this.furrows.removeFromParent();
    this.dragged.removeFromParent();
    this.falling.removeFromParent();
  }

  public forgetPreviousRun(): void {
    this.scene = null;
    this.furrows.visible = false;
    this.dragged.visible = false;
    this.falling.visible = false;
  }

  /**
   * The death, taken as the scene's whole record, and its opening frame drawn.
   *
   * The body is drawn here and never again: he is dead, so nothing about his
   * look can change, and the frames that follow only move what is already on
   * the two sprites. Opening at nothing rather than waiting for the first
   * show() is what keeps the frame he dies on from having no Undertaker in it
   * at all, because the sim took him off the field on that tick.
   *
   * Only the Undertaker's death ends the run, and the screens show the scene
   * only once the run has ended, so the Banshee's death begins nothing. The
   * answer is whether a scene began, for a screen that keeps the scene's clock.
   */
  public begin(killed: BossKilled, grave: Grave): boolean {
    if (killed.boss !== 'undertaker') return false;
    this.scene = sceneFrom(killed, grave);
    drawBoss(this.dragged, { kind: killed.boss, flash: 0 });
    drawBoss(this.falling, { kind: killed.boss, flash: 0 });
    this.show(0);
    return true;
  }

  public show(progress: number | null): void {
    const scene = this.scene;
    if (scene === null || progress === null) {
      this.furrows.visible = false;
      this.dragged.visible = false;
      this.falling.visible = false;
      return;
    }
    const drawn = endingSceneAt(scene, progress);
    this.scrapeFurrows(scene, drawn.furrows);
    this.dragged.visible = !drawn.inTheHole;
    this.falling.visible = drawn.inTheHole && !drawn.gone;
    const body = drawn.inTheHole ? this.falling : this.dragged;
    body.position.set(drawn.x, drawn.y);
    body.rotation = drawn.turn;
    body.scale.set(drawn.wide, drawn.tall);
    body.tint = greyTint(drawn.light);
  }

  /**
   * The marks his hands leave, redrawn each frame because they grow behind him
   * as he is hauled. They reach exactly the ground he has crossed and stay
   * there once he has gone over the edge.
   */
  private scrapeFurrows(scene: EndingScene, reach: number): void {
    this.furrows.clear();
    this.furrows.visible = reach > 0;
    if (reach <= 0) return;
    const spanX = scene.rimX - scene.fromX;
    const spanY = scene.rimY - scene.fromY;
    const span = Math.sqrt(spanX * spanX + spanY * spanY);
    if (span === 0) return;
    for (let line = 0; line < ENDING_FURROWS.lines; line++) {
      this.traceFurrow(scene, line, spanX / span, spanY / span, reach);
    }
    this.furrows.stroke({
      width: ENDING_FURROWS.width,
      color: PALETTE.graveSoilShadow.hex,
      alpha: ENDING_FURROWS.alpha,
      cap: 'round',
    });
  }

  /** One furrow: a wandering line from where he fell to as far as he has been hauled. */
  private traceFurrow(
    scene: EndingScene,
    line: number,
    alongX: number,
    alongY: number,
    reach: number,
  ): void {
    const sits = (line / (ENDING_FURROWS.lines - 1) - 0.5) * FURROW_SPREAD;
    const toX = (scene.rimX - scene.fromX) * reach;
    const toY = (scene.rimY - scene.fromY) * reach;
    for (let point = 0; point < FURROW_POINTS; point++) {
      const walked = point / (FURROW_POINTS - 1);
      const off = sits + wanderAt(line, point);
      // Across the way he is dragged, which is that way turned a quarter.
      const x = scene.fromX + toX * walked - alongY * off;
      const y = scene.fromY + toY * walked + alongX * off;
      if (point === 0) this.furrows.moveTo(x, y);
      else this.furrows.lineTo(x, y);
    }
  }
}

export { EndingSceneRenderer };
