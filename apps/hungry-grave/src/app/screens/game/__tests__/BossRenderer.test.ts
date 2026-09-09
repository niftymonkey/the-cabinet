/**
 * The two bosses on screen. Render only: it reads the one boss record the sim
 * carries and draws it, and holds no rules.
 */

import type { Graphics } from 'pixi.js';
import { describe, expect, it } from 'vitest';

import type { Boss } from '../../../../game/bosses/chunks';
import {
  BOSS_HALF_HEIGHT,
  BOSS_HALF_WIDTH,
  CHUNK_FLASH_TICKS,
  spawnBoss,
} from '../../../../game/bosses/chunks';
import { TICK_HZ } from '../../../../game/clock';
import type { RunState } from '../../../../game/run';
import { createRun } from '../../../../game/run';
import type { BossKind } from '../../../../game/stage/rows';
import { PALETTE } from '../../../palette';
import { BossRenderer } from '../BossRenderer';
import { BOSS_STROKE, bossFlashInverted } from '../bossSprite';
import { FieldLayers, LAYER_ORDER } from '../layering';

const BOSS_KINDS: BossKind[] = ['banshee', 'undertaker'];

/** Every colour the pair declares for one boss, bright half first. */
const PAIR: Record<BossKind, [number, number]> = {
  banshee: [PALETTE.banshee.hex, PALETTE.bansheeDark.hex],
  undertaker: [PALETTE.undertaker.hex, PALETTE.undertakerDark.hex],
};

function attached(): { layers: FieldLayers; renderer: BossRenderer } {
  const layers = new FieldLayers();
  const renderer = new BossRenderer();
  renderer.attach(layers);
  return { layers, renderer };
}

/** A run with one boss of this kind standing on the field. */
function runWith(kind: BossKind): { run: RunState; boss: Boss } {
  const run = createRun(11);
  return { run, boss: spawnBoss(run, kind) };
}

/** The boss's own sprite, which attach() puts last in the layer. */
function bossSprite(layers: FieldLayers): Graphics {
  const bodies = layers.layer('mobBodies').children as Graphics[];
  const last = bodies[bodies.length - 1];
  if (last === undefined)
    throw new Error('the mobBodies layer holds no sprite');
  return last;
}

/** The colours a sprite fills its shapes with, in the order it filled them. */
function fillColours(sprite: Graphics): number[] {
  return sprite.context.instructions
    .filter((instruction) => instruction.action === 'fill')
    .map((instruction) => instruction.data.style)
    .map((style) => (typeof style === 'number' ? style : style.color));
}

/** The colour the sprite's body fill drew, which every synced boss sprite has. */
function firstFillColour(sprite: Graphics): number {
  const colour = fillColours(sprite)[0];
  if (colour === undefined) throw new Error('the sprite filled nothing');
  return colour;
}

/**
 * The silhouette a sprite filled its body from, as the flat point list in field
 * units that Graphics recorded. Read off the drawing and never off the module's
 * own tables, so what is asserted is what is on screen.
 */
function bodyOutline(sprite: Graphics): number[] {
  const first = sprite.context.instructions[0];
  if (first === undefined)
    throw new Error('the sprite recorded no instructions');
  const filled = first.data as {
    path?: { instructions?: { action: string; data: unknown[] }[] };
  };
  const poly = (filled.path?.instructions ?? []).find(
    (each) => each.action === 'poly',
  );
  if (poly === undefined) throw new Error('the body is not filled from a poly');
  return poly.data[0] as number[];
}

/** The colours a sprite strokes with, in the order it stroked them. */
function strokeColours(sprite: Graphics): number[] {
  return sprite.context.instructions
    .filter((instruction) => instruction.action === 'stroke')
    .map((instruction) => instruction.data.style)
    .map((style) => (typeof style === 'number' ? style : style.color));
}

describe('the two boss silhouettes (module 107)', () => {
  it('draws into the mob bodies layer and leaves every other layer empty', () => {
    const { layers } = attached();
    expect(layers.layer('mobBodies').children.length).toBe(1);
    const others = LAYER_ORDER.filter((name) => name !== 'mobBodies').flatMap(
      (name) => (layers.layer(name).children.length > 0 ? [name] : []),
    );
    expect(others).toEqual([]);
  });

  it('draws nothing while no boss stands on the field, from the frame it is put back', () => {
    // dressField() puts this renderer back on every reset and a run opens with
    // frames drawn before the first sync, so the sprite has to arrive
    // invisible rather than become invisible.
    const { layers, renderer } = attached();
    expect(bossSprite(layers).visible).toBe(false);
    renderer.sync(createRun(3));
    expect(bossSprite(layers).visible).toBe(false);
  });

  it('draws each boss in its own palette pair and never in the other one', () => {
    // The palette declared banshee/bansheeDark and undertaker/undertakerDark
    // before either boss existed, and the design record rules that the two are
    // vector silhouettes in exactly those entries. So what the sprite fills
    // with is the pair, and neither boss reaches into the other's.
    for (const kind of BOSS_KINDS) {
      const { layers, renderer } = attached();
      const { run } = runWith(kind);
      renderer.sync(run);
      const other = BOSS_KINDS.find((each) => each !== kind)!;
      const drawn = new Set(fillColours(bossSprite(layers)));
      expect([...drawn].sort()).toEqual([...PAIR[kind]].sort());
      for (const colour of PAIR[other]) {
        expect(`${kind} ${drawn.has(colour)}`).toBe(`${kind} false`);
      }
    }
  });

  it('gives each boss a body its own dark half detail reads on', () => {
    // The construction the three mob types use: a body colour and a companion
    // carrying the detail, so the silhouette is not one flat shape. Both halves
    // of the pair are on the body at once, which is what the pair is for.
    for (const kind of BOSS_KINDS) {
      const { layers, renderer } = attached();
      const { run } = runWith(kind);
      renderer.sync(run);
      const filled = fillColours(bossSprite(layers));
      expect(filled[0]).toBe(PAIR[kind][0]);
      expect(filled.slice(1)).toContain(PAIR[kind][1]);
    }
  });

  it('wears the near-black companion the palette names for it', () => {
    // SPRITE_OUTLINE gives both bosses foodOutline, which is ADR 0014's answer
    // to a body that has to hold against a background the palette never planned
    // for. The ground under a boss is now a lit floor and a drifting dressing
    // set, so the rim is doing that job for real.
    for (const kind of BOSS_KINDS) {
      const { layers, renderer } = attached();
      const { run } = runWith(kind);
      renderer.sync(run);
      expect(strokeColours(bossSprite(layers))).toEqual([
        PALETTE.foodOutline.hex,
      ]);
    }
  });

  it('draws two bodies a player can tell apart by silhouette alone', () => {
    // ADR 0014 makes silhouette the first discriminator between bodies, so the
    // two bosses may not be one shape in two colours.
    const shapes = BOSS_KINDS.map((kind) => {
      const { layers, renderer } = attached();
      const { run } = runWith(kind);
      renderer.sync(run);
      return JSON.stringify(bodyOutline(bossSprite(layers)));
    });
    expect(shapes[0]).not.toBe(shapes[1]);
  });

  it('draws the body its own hitbox is, so the storm hits what a player sees', () => {
    // Both silhouettes are authored in units of the boss's own half extents, so
    // moving the hitbox moves the drawing with it. What is measured is the
    // filled body: the rim straddles that edge exactly as a mob's does.
    for (const kind of BOSS_KINDS) {
      const { layers, renderer } = attached();
      const { run } = runWith(kind);
      renderer.sync(run);
      const points = bodyOutline(bossSprite(layers));
      const xs = points.filter((_, at) => at % 2 === 0);
      const ys = points.filter((_, at) => at % 2 === 1);
      expect(`${kind} ${Math.min(...xs)} ${Math.max(...xs)}`).toBe(
        `${kind} ${-BOSS_HALF_WIDTH} ${BOSS_HALF_WIDTH}`,
      );
      expect(`${kind} ${Math.min(...ys)} ${Math.max(...ys)}`).toBe(
        `${kind} ${-BOSS_HALF_HEIGHT} ${BOSS_HALF_HEIGHT}`,
      );

      // And no ink stands further out than the rim it is drawn with, so the
      // drawn body is the hitbox plus a rim and never a shape with spikes on it.
      const bounds = bossSprite(layers).getLocalBounds();
      expect(bounds.width).toBeCloseTo(2 * BOSS_HALF_WIDTH + BOSS_STROKE, 6);
      expect(bounds.height).toBeCloseTo(2 * BOSS_HALF_HEIGHT + BOSS_STROKE, 6);
    }
  });

  it('stands where the sim says it stands', () => {
    const { layers, renderer } = attached();
    const { run, boss } = runWith('banshee');
    boss.x = 173;
    boss.y = 96;
    renderer.sync(run);
    expect(bossSprite(layers).position.x).toBe(173);
    expect(bossSprite(layers).position.y).toBe(96);
  });
});

describe('the chunk flash (module 107, ADR 0007)', () => {
  it('shows on the body itself, inverting the pair rather than dimming it', () => {
    // A chunk ends in a short invincible flash (CONTEXT.md), and a player has
    // to see that shots are doing nothing. The read is the pair swapping over:
    // the body takes the dark half and the detail and the rim take the bright
    // one, so the boss never darkens into the night it stands against.
    const { layers, renderer } = attached();
    const { run, boss } = runWith('undertaker');
    boss.flash = CHUNK_FLASH_TICKS;

    const seen = new Set<string>();
    for (let left = CHUNK_FLASH_TICKS; left > 0; left--) {
      boss.flash = left;
      renderer.sync(run);
      seen.add(firstFillColour(bossSprite(layers)).toString());
    }
    expect([...seen].sort()).toEqual(
      [...PAIR.undertaker].map(String).sort() as string[],
    );

    // And the rim goes bright on the inverted read, so a dark body still has
    // an edge against the ground it stands on.
    boss.flash = CHUNK_FLASH_TICKS;
    while (!bossFlashInverted(boss)) boss.flash -= 1;
    renderer.sync(run);
    expect(fillColours(bossSprite(layers))[0]).toBe(PAIR.undertaker[1]);
    expect(strokeColours(bossSprite(layers))).toEqual([PAIR.undertaker[0]]);
  });

  it('flashes no faster than three times a second, which a body this large may not', () => {
    // WCAG SC 2.3.1 permits at most three flashes in any one second, a flash
    // being a pair of opposing changes. A boss body is the largest sprite on
    // the field, so the small-area escape hatch cannot apply, and SC 2.3.1
    // invokes Non-Interference, so a game gets no essential-to-functionality
    // carve-out. The hit dim and the corpse flicker are both held to it.
    //
    // It is read off what the renderer drew, so a period changed anywhere in
    // the module is what this measures.
    const { layers, renderer } = attached();
    const { run, boss } = runWith('banshee');
    const read: number[] = [];
    for (let left = CHUNK_FLASH_TICKS; left > 0; left--) {
      boss.flash = left;
      renderer.sync(run);
      read.push(firstFillColour(bossSprite(layers)));
    }

    // Every stretch the body holds one colour for, with the two at the ends
    // dropped: those are cut short by the flash beginning and ending, not by
    // the period.
    const runs: number[] = [];
    let held = 1;
    for (let at = 1; at < read.length; at++) {
      if (read[at] === read[at - 1]) {
        held += 1;
        continue;
      }
      runs.push(held);
      held = 1;
    }
    runs.push(held);
    const interior = runs.slice(1, -1);
    expect(interior.length).toBeGreaterThan(0);
    expect(Math.min(...interior) * 2).toBeGreaterThanOrEqual(TICK_HZ / 3);
  });

  it('holds one steady read while the boss is hurtable', () => {
    // The flash means invincible and nothing else, so a boss taking damage must
    // not blink: the read is spent the moment it means two things.
    const { layers, renderer } = attached();
    const { run, boss } = runWith('banshee');
    boss.flash = 0;
    const seen = new Set<number>();
    for (let tick = 0; tick < 4 * CHUNK_FLASH_TICKS; tick++) {
      run.tick = tick;
      renderer.sync(run);
      seen.add(firstFillColour(bossSprite(layers)));
    }
    expect([...seen]).toEqual([PAIR.banshee[0]]);
  });

  it('runs the flash off the boss own countdown, so a replay draws what the run drew', () => {
    // Every read here is a function of the record the tape reproduces, so a
    // replay rendering a pinned tape at a chosen tick draws the fight the run
    // drew rather than one that depends on which frames were drawn on the way.
    const { run, boss } = runWith('banshee');
    const straight = attached();
    boss.flash = 17;
    straight.renderer.sync(run);
    const walked = attached();
    for (const left of [30, 24, 21, 17]) {
      boss.flash = left;
      walked.renderer.sync(run);
    }
    const read = (layers: FieldLayers) =>
      JSON.stringify([
        fillColours(bossSprite(layers)),
        strokeColours(bossSprite(layers)),
      ]);
    expect(read(walked.layers)).toBe(read(straight.layers));
  });
});
