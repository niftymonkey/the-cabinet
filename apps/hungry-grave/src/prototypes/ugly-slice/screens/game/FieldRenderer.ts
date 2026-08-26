// The field: a Container the GameScreen scales to fit the viewport. The sim
// is the truth; this reads it every frame and pushes pooled sprites around.
// Shapes are baked to textures once so they batch (First Dig tech gate), and
// the layer order is the readability rule: enemy fire on top in the reserved
// hot palette, player fire dimmer below (concept doc).

import type { Renderer, Texture } from 'pixi.js';
import { Container, Graphics, Sprite, TilingSprite } from 'pixi.js';

import { graveCorner, graveHalfW } from '../../game/grave';
import type { Sim } from '../../game/sim';
import { stonePositions } from '../../game/sim';
import * as T from '../../game/tuning';
import type { CorpseKind, EnemyBulletKind } from '../../game/types';
import { PALETTE } from '../../palette';
import { sfx } from '../../sfx';

class Pool {
  private readonly items: Sprite[] = [];
  private used = 0;
  private readonly layer: Container;
  private readonly texture: Texture;

  constructor(layer: Container, texture: Texture) {
    this.layer = layer;
    this.texture = texture;
  }

  obtain(): Sprite {
    let sprite = this.items[this.used];
    if (sprite === undefined) {
      sprite = new Sprite({ texture: this.texture, anchor: 0.5 });
      this.items.push(sprite);
      this.layer.addChild(sprite);
    }
    sprite.visible = true;
    sprite.alpha = 1;
    sprite.rotation = 0;
    sprite.scale.set(1);
    sprite.tint = 0xffffff;
    this.used++;
    return sprite;
  }

  endFrame(): void {
    for (let i = this.used; i < this.items.length; i++) {
      const sprite = this.items[i];
      if (sprite !== undefined) sprite.visible = false;
    }
    this.used = 0;
  }
}

interface Transient {
  x: number;
  y: number;
  // Drift in field units per second: droplets fly, rings stay put.
  dx: number;
  dy: number;
  age: number;
  life: number;
  tint: number;
  fromRadius: number;
  toRadius: number;
  shape: 'ring' | 'dot';
}

const CORPSE_TINT: Record<CorpseKind, number> = {
  corpse: PALETTE.corpse,
  feast: PALETTE.feast,
  // The treasure class reads gold: steady-bright means treasure (entry 4.5).
  bansheeFeast: PALETTE.drop,
};

const ENEMY_BULLET_TINT: Record<EnemyBulletKind, number> = {
  shot: PALETTE.enemyShot,
  tear: PALETTE.enemyTear,
  clod: PALETTE.enemyClod,
  spiral: PALETTE.enemySpiral,
};

const ENEMY_BULLET_BASE_RADIUS: Record<EnemyBulletKind, number> = {
  shot: 5,
  tear: 5,
  clod: 7,
  spiral: 5,
};

export class FieldRenderer extends Container {
  private readonly layers = {
    background: new Container(),
    grave: new Container(),
    ground: new Container(),
    playerFire: new Container(),
    enemies: new Container(),
    boss: new Container(),
    enemyFire: new Container(),
    fx: new Container(),
  };

  private readonly graveG = new Graphics();
  private readonly glowG = new Graphics();
  private readonly flashG = new Graphics();
  private readonly speckles: TilingSprite;
  private readonly bossSprites: { banshee: Sprite; undertaker: Sprite };
  private readonly pools: {
    enemy: Pool;
    corpse: Pool;
    drop: Pool;
    skull: Pool;
    wisp: Pool;
    stone: Pool;
    ring: Pool;
    shot: Pool;
    tear: Pool;
    clod: Pool;
    spiral: Pool;
    pulse: Pool;
    dot: Pool;
  };

  private drawnHalfH = -1;
  private flash = 0;
  private hitFlash = 0;
  private transients: Transient[] = [];

  constructor(renderer: Renderer) {
    super();

    const bake = (draw: (g: Graphics) => void): Texture => {
      const g = new Graphics();
      draw(g);
      const texture = renderer.generateTexture({ target: g, resolution: 2 });
      g.destroy();
      return texture;
    };

    // Background speckle, scrolled with the world so motion reads.
    const speckleTexture = bake((g) => {
      g.rect(0, 0, 160, 160).fill(PALETTE.night);
      const dots = [
        [12, 24],
        [58, 9],
        [104, 30],
        [147, 52],
        [29, 70],
        [83, 88],
        [131, 104],
        [17, 121],
        [64, 140],
        [112, 151],
        [150, 12],
        [42, 46],
      ];
      for (const [x, y] of dots) {
        g.circle(x ?? 0, y ?? 0, 1.6).fill({
          color: PALETTE.nightSpeckle,
          alpha: 0.9,
        });
      }
    });
    this.speckles = new TilingSprite({
      texture: speckleTexture,
      width: T.FIELD_W,
      height: T.FIELD_H,
    });
    this.layers.background.addChild(this.speckles);

    const frame = new Graphics();
    frame
      .rect(0, 0, T.FIELD_W, T.FIELD_H)
      .stroke({ width: 2, color: PALETTE.fieldFrame });
    this.layers.background.addChild(frame);

    // Baked entity textures. White shapes get tinted per kind at sync time.
    const enemyTexture = bake((g) => {
      g.circle(0, 0, T.ENEMY_RADIUS)
        .fill(PALETTE.enemy)
        .stroke({ width: 2, color: PALETTE.enemyDark });
      g.circle(-4, -3, 2.4).fill(PALETTE.enemyDark);
      g.circle(4, -3, 2.4).fill(PALETTE.enemyDark);
    });
    const corpseTexture = bake((g) => {
      g.circle(0, 0, T.CORPSE_RADIUS)
        .fill(0xffffff)
        .stroke({ width: 1.5, color: 0x6f7d6d });
    });
    const dropTexture = bake((g) => {
      g.star(0, 0, 4, 10, 4).fill(PALETTE.drop);
      g.circle(0, 0, 2.6).fill(PALETTE.dropCore);
    });
    const skullTexture = bake((g) => {
      g.circle(0, 0, 4).fill(0xffffff);
    });
    const wispTexture = bake((g) => {
      g.circle(0, 0, 3.4).fill(0xffffff);
    });
    const stoneTexture = bake((g) => {
      g.roundRect(-7, -9, 14, 18, 4)
        .fill(0xffffff)
        .stroke({ width: 1.5, color: 0x565f66 });
    });
    const ringTexture = bake((g) => {
      g.circle(0, 0, 64).stroke({ width: 7, color: 0xffffff });
    });
    const shotTexture = bake((g) => {
      g.circle(0, 0, 5).fill(0xffffff);
    });
    // The tear is a small ring on purpose: her ring echoes the player's bell
    // ring, one shape with two owners, separated by layer and palette. The
    // teardrop shape-break is the deferred cure behind a playtest trigger
    // (entry 4.11), so the slice must not apply it preemptively.
    const tearTexture = bake((g) => {
      g.circle(0, 0, 4).stroke({ width: 2.2, color: 0xffffff });
    });
    const clodTexture = bake((g) => {
      g.roundRect(-7, -7, 14, 14, 3).fill(0xffffff);
    });
    const spiralTexture = bake((g) => {
      g.poly([0, -6.5, 6.5, 0, 0, 6.5, -6.5, 0]).fill(0xffffff);
    });
    const dotTexture = bake((g) => {
      g.circle(0, 0, 8).fill(0xffffff);
    });
    const bansheeTexture = bake((g) => {
      g.ellipse(0, 0, 27, 34)
        .fill(PALETTE.banshee)
        .stroke({ width: 3, color: PALETTE.bansheeDark });
      g.circle(-9, -8, 4).fill(PALETTE.bansheeDark);
      g.circle(9, -8, 4).fill(PALETTE.bansheeDark);
      g.ellipse(0, 8, 7, 10).fill(PALETTE.bansheeDark);
    });
    const undertakerTexture = bake((g) => {
      g.roundRect(-30, -40, 60, 80, 10)
        .fill(PALETTE.undertaker)
        .stroke({ width: 3, color: PALETTE.undertakerDark });
      g.circle(-10, -18, 3.5).fill(PALETTE.undertakerDark);
      g.circle(10, -18, 3.5).fill(PALETTE.undertakerDark);
      g.rect(24, -34, 5, 62).fill(PALETTE.undertakerDark);
      g.poly([20, 28, 33, 28, 26.5, 44]).fill(PALETTE.undertakerDark);
    });

    this.bossSprites = {
      banshee: new Sprite({
        texture: bansheeTexture,
        anchor: 0.5,
        visible: false,
      }),
      undertaker: new Sprite({
        texture: undertakerTexture,
        anchor: 0.5,
        visible: false,
      }),
    };
    this.layers.boss.addChild(
      this.bossSprites.banshee,
      this.bossSprites.undertaker,
    );

    this.pools = {
      enemy: new Pool(this.layers.enemies, enemyTexture),
      corpse: new Pool(this.layers.ground, corpseTexture),
      drop: new Pool(this.layers.ground, dropTexture),
      skull: new Pool(this.layers.playerFire, skullTexture),
      wisp: new Pool(this.layers.playerFire, wispTexture),
      stone: new Pool(this.layers.playerFire, stoneTexture),
      ring: new Pool(this.layers.playerFire, ringTexture),
      shot: new Pool(this.layers.enemyFire, shotTexture),
      tear: new Pool(this.layers.enemyFire, tearTexture),
      clod: new Pool(this.layers.enemyFire, clodTexture),
      spiral: new Pool(this.layers.enemyFire, spiralTexture),
      pulse: new Pool(this.layers.fx, ringTexture),
      dot: new Pool(this.layers.fx, dotTexture),
    };

    this.layers.grave.addChild(this.graveG, this.glowG);
    this.flashG.rect(0, 0, T.FIELD_W, T.FIELD_H).fill(PALETTE.belchFlash);
    this.flashG.alpha = 0;
    this.layers.fx.addChild(this.flashG);

    // Layer order bottom to top: the grave is a hole the world passes over,
    // so it sits under the food; enemy fire is always the topmost gameplay
    // layer (concept doc readability rule).
    this.addChild(
      this.layers.background,
      this.layers.grave,
      this.layers.ground,
      this.layers.playerFire,
      this.layers.enemies,
      this.layers.boss,
      this.layers.enemyFire,
      this.layers.fx,
    );
  }

  private drawGrave(halfH: number): void {
    const hw = graveHalfW(halfH);
    const corner = graveCorner(halfH);
    this.graveG.clear();
    this.graveG
      .roundRect(-hw, -halfH, hw * 2, halfH * 2, corner)
      .fill(PALETTE.graveHole)
      .stroke({ width: 2.5, color: PALETTE.graveRim });
    this.glowG.clear();
    this.glowG
      .roundRect(-hw - 4, -halfH - 4, hw * 2 + 8, halfH * 2 + 8, corner + 3)
      .stroke({ width: 3.5, color: PALETTE.graveGlow });
    this.drawnHalfH = halfH;
  }

  private consumeEvents(sim: Sim): void {
    for (const ev of sim.events) {
      switch (ev.kind) {
        case 'chime':
          sfx.chime();
          break;
        case 'bell':
          sfx.bell();
          break;
        case 'eat':
          this.transients.push({
            x: ev.x,
            y: ev.y,
            dx: 0,
            dy: 0,
            age: 0,
            life: 0.3,
            tint: PALETTE.corpse,
            fromRadius: 6,
            toRadius: 26,
            shape: 'ring',
          });
          break;
        case 'feast':
          sfx.feast();
          this.transients.push({
            x: ev.x,
            y: ev.y,
            dx: 0,
            dy: 0,
            age: 0,
            life: 0.8,
            tint: PALETTE.graveGlow,
            fromRadius: 10,
            toRadius: 120,
            shape: 'ring',
          });
          break;
        case 'belch':
          sfx.belch();
          this.flash = 1;
          break;
        case 'hit':
          sfx.hit();
          this.hitFlash = 1;
          break;
        case 'levelUp':
          sfx.levelUp();
          break;
        case 'sizeOverflow':
          this.transients.push({
            x: ev.x,
            y: ev.y,
            dx: 0,
            dy: 0,
            age: 0,
            life: 0.5,
            tint: PALETTE.drop,
            fromRadius: 8,
            toRadius: 50,
            shape: 'ring',
          });
          break;
        case 'splashWaste':
          // The cap's lesson made visible: charge past a full reservoir
          // sputters out of the grave as dull droplets and dies (the box:
          // overflow visibly splashes and wastes).
          for (const [dx, dy] of [
            [-70, -110],
            [0, -140],
            [70, -110],
          ] as const) {
            this.transients.push({
              x: ev.x,
              y: ev.y,
              dx,
              dy,
              age: 0,
              life: 0.5,
              tint: PALETTE.waste,
              fromRadius: 4.5,
              toRadius: 1.2,
              shape: 'dot',
            });
          }
          break;
        case 'suckedUnder':
          // A corpse the conveyor beat you to: the earth pulls it under, a
          // shrink into nothing where it lay (entry 2.3).
          this.transients.push({
            x: ev.x,
            y: ev.y,
            dx: 0,
            dy: T.SCROLL_SPEED,
            age: 0,
            life: 0.45,
            tint: PALETTE.corpse,
            fromRadius: T.CORPSE_RADIUS,
            toRadius: 0.5,
            shape: 'dot',
          });
          break;
        case 'sealed':
          sfx.sealed();
          break;
        default:
          break;
      }
    }
    sim.events.length = 0;
  }

  sync(sim: Sim, dt: number): void {
    this.consumeEvents(sim);

    this.speckles.tilePosition.y += T.SCROLL_SPEED * dt;

    // The grave.
    const p = sim.player;
    if (Math.abs(p.halfH - this.drawnHalfH) > 0.2) this.drawGrave(p.halfH);
    this.layers.grave.position.set(p.x, p.y);
    const full = p.reservoir >= T.BELCH_CAP;
    this.glowG.visible = full;
    if (full) {
      this.glowG.alpha =
        0.55 + 0.45 * Math.sin(sim.t * (sim.belchGlow ? 14 : 7));
    }
    if (this.hitFlash > 0) {
      this.hitFlash = Math.max(0, this.hitFlash - dt * 4);
      this.graveG.alpha = 1 - this.hitFlash * 0.4;
    } else {
      this.graveG.alpha = 1;
    }

    // Ground food: corpses fade with freshness and flicker near empty;
    // treasure stays steady-bright (decision-log entries 2.3, 2.4).
    for (const corpse of sim.corpses) {
      const s = this.pools.corpse.obtain();
      s.position.set(corpse.x, corpse.y);
      s.scale.set(corpse.radius / T.CORPSE_RADIUS);
      s.tint = CORPSE_TINT[corpse.kind];
      if (corpse.kind === 'corpse') {
        s.alpha = 0.3 + 0.7 * corpse.freshness;
        if (corpse.freshness < T.FRESHNESS_FLICKER_AT) {
          s.alpha = Math.sin(sim.t * 42) > 0 ? 0.85 : 0.15;
        }
      }
    }
    for (const drop of sim.drops) {
      const s = this.pools.drop.obtain();
      s.position.set(drop.x, drop.y);
      s.scale.set(1 + 0.15 * Math.sin(sim.t * 6));
      s.rotation = sim.t * 0.8;
    }

    // Player fire, dim and desaturated, under the enemies.
    for (const bullet of sim.playerBullets) {
      const s =
        bullet.kind === 'skull'
          ? this.pools.skull.obtain()
          : this.pools.wisp.obtain();
      s.position.set(bullet.x, bullet.y);
      s.tint = bullet.kind === 'skull' ? PALETTE.skull : PALETTE.wisp;
      s.alpha = 0.8;
    }
    for (const stone of stonePositions(sim.player)) {
      const s = this.pools.stone.obtain();
      s.position.set(stone.x, stone.y);
      s.tint = PALETTE.stone;
    }
    for (const bell of sim.bells) {
      const s = this.pools.ring.obtain();
      s.position.set(bell.x, bell.y);
      s.scale.set(bell.radius / 64);
      s.tint = PALETTE.bellRing;
      s.alpha = 0.7 * (1 - bell.radius / bell.maxRadius) + 0.15;
    }

    // Enemies.
    for (const enemy of sim.enemies) {
      const s = this.pools.enemy.obtain();
      s.position.set(enemy.x, enemy.y);
    }

    // The boss.
    this.bossSprites.banshee.visible = false;
    this.bossSprites.undertaker.visible = false;
    const boss = sim.boss;
    if (boss !== null) {
      const sprite = this.bossSprites[boss.kind];
      sprite.visible = true;
      sprite.position.set(boss.x, boss.y);
      sprite.scale.set(boss.radius / (boss.kind === 'banshee' ? 34 : 42));
      if (boss.flashLeft > 0) {
        sprite.alpha = 0.35 + 0.4 * Math.abs(Math.sin(sim.t * 24));
      } else if (boss.toppleLeft > 0) {
        sprite.alpha = 0.9;
        sprite.rotation = (T.VICTORY_TOPPLE_SECONDS - boss.toppleLeft) * 1.5;
      } else {
        sprite.alpha = 1;
        sprite.rotation = 0;
      }
    }

    // Enemy fire, top layer, reserved hot palette.
    for (const bullet of sim.enemyBullets) {
      const s = this.pools[bullet.kind].obtain();
      s.position.set(bullet.x, bullet.y);
      s.scale.set(bullet.radius / ENEMY_BULLET_BASE_RADIUS[bullet.kind]);
      s.tint = ENEMY_BULLET_TINT[bullet.kind];
      if (bullet.kind === 'spiral') {
        s.rotation = Math.atan2(bullet.vy, bullet.vx) + Math.PI / 2;
      }
    }

    // Effects: eat pulses and the belch flash.
    const kept: Transient[] = [];
    for (const tr of this.transients) {
      tr.age += dt;
      if (tr.age >= tr.life) continue;
      tr.x += tr.dx * dt;
      tr.y += tr.dy * dt;
      const f = tr.age / tr.life;
      const s =
        tr.shape === 'ring'
          ? this.pools.pulse.obtain()
          : this.pools.dot.obtain();
      s.position.set(tr.x, tr.y);
      const radius = tr.fromRadius + (tr.toRadius - tr.fromRadius) * f;
      s.scale.set(radius / (tr.shape === 'ring' ? 64 : 8));
      s.tint = tr.tint;
      s.alpha = tr.shape === 'ring' ? 0.6 * (1 - f) : 0.9 * (1 - f * 0.6);
      kept.push(tr);
    }
    this.transients = kept;
    if (this.flash > 0) {
      this.flash = Math.max(0, this.flash - dt * 2.4);
      this.flashG.alpha = this.flash * 0.55;
    } else {
      this.flashG.alpha = 0;
    }

    for (const pool of Object.values(this.pools)) pool.endFrame();
  }
}
