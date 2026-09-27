/**
 * The Undertaker's end on screen: which layer each piece of the scene lands in,
 * and what a scene that has not begun draws (design record R6).
 */

import type { Container } from 'pixi.js';
import { Container as PixiContainer, Graphics } from 'pixi.js';
import { describe, expect, it } from 'vitest';

import type { BossKilled } from '../../../../game/events';
import type { Grave } from '../../../../game/grave';
import { createGrave } from '../../../../game/grave';
import { SIZE_START } from '../../../../game/tuning';
import { PALETTE } from '../../../palette';
import { drawBoss } from '../bossSprite';
import { endingSceneAt, sceneFrom } from '../endingScene';
import { EndingSceneRenderer } from '../EndingSceneRenderer';
import { ENDING_BEATS } from '../graveDrawingValues';
import type { GraveView } from '../graveProjection';
import { holeViewOver } from '../GraveRenderer';
import { FieldLayers, LAYER_ORDER } from '../layering';

const KILLED: BossKilled = {
  type: 'bossKilled',
  boss: 'undertaker',
  x: 270,
  y: 110,
};

/** How far into the scene he is over the edge and falling. */
const FALLING = ENDING_BEATS.drag + ENDING_BEATS.claw + ENDING_BEATS.tip;

function parked(): Grave {
  const grave = createGrave(SIZE_START);
  grave.x = 270;
  grave.y = 600;
  return grave;
}

function attached(holeView: () => GraveView = () => holeViewOver(parked())): {
  layers: FieldLayers;
  falls: Container;
  renderer: EndingSceneRenderer;
} {
  const layers = new FieldLayers();
  const falls = new PixiContainer();
  const renderer = new EndingSceneRenderer({ holeView });
  renderer.attach(layers, falls);
  return { layers, falls, renderer };
}

/** Every piece of the scene, wherever it was put. */
function pieces(layers: FieldLayers, falls: Container): Graphics[] {
  const fromLayers = LAYER_ORDER.flatMap(
    (name) => layers.layer(name).children as Graphics[],
  );
  return [...fromLayers, ...(falls.children as Graphics[])];
}

/** The flat point list a sprite filled its body from, so a silhouette is read off the drawing. */
function bodyOutline(sprite: Graphics): number[] {
  const first = sprite.context.instructions[0];
  if (first === undefined) throw new Error('the sprite recorded nothing');
  const filled = first.data as {
    path?: { instructions?: { action: string; data: unknown[] }[] };
  };
  const poly = (filled.path?.instructions ?? []).find(
    (each) => each.action === 'poly',
  );
  if (poly === undefined) throw new Error('the body is not filled from a poly');
  return poly.data[0] as number[];
}

/** The colour the furrows were stroked in, read off the drawing itself. */
function furrowColour(layers: FieldLayers): number {
  const furrows = layers.layer('ground').children[0] as Graphics;
  const stroked = furrows.context.instructions.find(
    (each) => each.action === 'stroke',
  );
  if (stroked === undefined) throw new Error('the furrows recorded no stroke');
  const { style } = stroked.data as { style: { color: number } };
  return style.color;
}

describe("the Undertaker's ending scene on screen", () => {
  it('scrapes the furrows in an earth darker than the ground they are cut into', () => {
    // R6: the claw marks read as gouges torn into the ground. Slice 8 put the
    // prototype's earth under them, which is far brighter than the near-black
    // tile the colour was picked against, so which way round the two sit is
    // what says the marks are gouges rather than lost in the field. The
    // furrows are the only thing the scene leaves behind, so a row that stops
    // reading takes the whole tell with it and nothing else can show it.
    const { layers, renderer } = attached();
    renderer.begin(KILLED, parked());
    renderer.show(ENDING_BEATS.drag);

    expect(furrowColour(layers)).toBe(PALETTE.graveSeam.hex);
    expect(PALETTE.graveSeam.luma).toBeLessThan(PALETTE.groundNight.luma);
  });

  it('the furrows draw in the ground, the dragged body over the field, and the falling body inside the hole', () => {
    // ADR 0014's stack decides all three. The furrows go under everything, so
    // the grave passes over them as it takes him; the dragged body goes where
    // the boss was drawn while he fought; and the falling body goes in the
    // grave's own falls container, under the turf and inside the cut.
    const { layers, falls } = attached();

    expect(layers.layer('ground').children).toHaveLength(1);
    expect(layers.layer('mobBodies').children).toHaveLength(1);
    expect(falls.children).toHaveLength(1);

    const elsewhere = LAYER_ORDER.filter(
      (name) => name !== 'ground' && name !== 'mobBodies',
    ).flatMap((name) => (layers.layer(name).children.length > 0 ? [name] : []));
    expect(elsewhere).toEqual([]);
  });

  it('the scene draws the Undertaker itself, because the sim took him off the field on the tick he died', () => {
    // killBoss sets state.boss to null before it announces, and BossRenderer
    // hides its body the moment the boss is null, so the scene cannot borrow
    // that sprite. It draws him through the same drawBoss, so the man who
    // falls is the man who fought.
    const { layers, falls, renderer } = attached();
    renderer.begin(KILLED, parked());
    renderer.show(0);

    const reference = new Graphics();
    drawBoss(reference, { kind: 'undertaker', flash: 0 });
    const his = bodyOutline(reference);

    const dragged = layers.layer('mobBodies').children[0] as Graphics;
    expect(bodyOutline(dragged)).toEqual(his);
    expect(dragged.visible).toBe(true);

    renderer.show(FALLING);
    const falling = falls.children[0] as Graphics;
    expect(bodyOutline(falling)).toEqual(his);
    expect(falling.visible).toBe(true);
    expect(dragged.visible).toBe(false);
  });

  it('the falling Undertaker is drawn with the view the walls on screen were cut with, read from the screen each frame', () => {
    // Tilted view T4: the walls on screen are the grave renderer's last bake,
    // whose stance can trail the live grave's by up to a step, so he goes down
    // between those walls only if he is drawn with that same view. The screen
    // hands it in as it does to the falls, and it is read on every frame
    // because the hole can be baked again while he falls.
    const live = holeViewOver(parked());
    let baked: GraveView = { ...live, nadirX: live.nadirX + 0.4 };
    const { falls, renderer } = attached(() => baked);
    const midFall = FALLING + ENDING_BEATS.fall / 2;
    const scene = sceneFrom(KILLED, parked());
    const placed = (): string => {
      const falling = falls.children[0] as Graphics;
      return `${falling.position.x.toFixed(9)},${falling.position.y.toFixed(9)}`;
    };
    const expectedWith = (view: GraveView): string => {
      const drawn = endingSceneAt(scene, midFall, view);
      return `${drawn.x.toFixed(9)},${drawn.y.toFixed(9)}`;
    };
    expect(expectedWith(baked)).not.toBe(expectedWith(live));

    renderer.begin(KILLED, parked());
    renderer.show(midFall);
    expect(placed()).toBe(expectedWith(baked));

    baked = { ...live, nadirX: live.nadirX - 0.4 };
    renderer.show(midFall);
    expect(placed()).toBe(expectedWith(baked));
  });

  it('a scene that has not begun draws nothing', () => {
    // dressField puts this renderer back on every reset and a run opens with
    // frames drawn before anything is shown, so the pieces have to arrive
    // invisible rather than become invisible. Every run but a won one has no
    // scene at all, and a progress of null is how that is said.
    const { layers, falls, renderer } = attached();
    expect(pieces(layers, falls).every((piece) => !piece.visible)).toBe(true);

    renderer.show(0.5);
    expect(pieces(layers, falls).every((piece) => !piece.visible)).toBe(true);

    // Begun, so the pieces can be on screen at all, which is what makes the
    // two absences above and the one below assertions rather than accidents.
    renderer.begin(KILLED, parked());
    renderer.show(0.5);
    expect(pieces(layers, falls).some((piece) => piece.visible)).toBe(true);

    renderer.show(null);
    expect(pieces(layers, falls).every((piece) => !piece.visible)).toBe(true);
  });

  it("the Banshee's death begins no scene, because the run goes on after her", () => {
    // bossKilled fires for both bosses and only the Undertaker's ends the run
    // (R6). The screens show the scene only once the run has ended, so a body
    // drawn at the Banshee's death would stand on the field until the run's end.
    const { layers, falls, renderer } = attached();
    renderer.begin({ ...KILLED, boss: 'banshee' }, parked());
    expect(pieces(layers, falls).every((piece) => !piece.visible)).toBe(true);

    renderer.show(0.5);
    expect(pieces(layers, falls).every((piece) => !piece.visible)).toBe(true);
  });

  it('a new run forgets the scene of the one before it', () => {
    // Screens are pooled: a scene left standing would open the next run's
    // first frame with a dead Undertaker being hauled across the field.
    const { layers, falls, renderer } = attached();
    renderer.begin(KILLED, parked());
    renderer.show(0.5);
    expect(pieces(layers, falls).some((piece) => piece.visible)).toBe(true);

    renderer.forgetPreviousRun();
    expect(pieces(layers, falls).every((piece) => !piece.visible)).toBe(true);

    renderer.show(0.5);
    expect(pieces(layers, falls).every((piece) => !piece.visible)).toBe(true);
  });
});
