/**
 * The first field content on screen. Render only: it reads a Grave and draws
 * it, and holds no rules.
 */

import type { Container, Graphics } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';
import type { Grave } from '../../../../game/grave';
import { createGrave, graveHitbox, graveWidth } from '../../../../game/grave';
import { SIZE_CEILING, SIZE_FLOOR, SIZE_START } from '../../../../game/tuning';
import { ART_REACH_OUTSIDE } from '../graveDrawingValues';
import { glowAlpha, GRAVE_RIM_STROKE, GraveRenderer } from '../GraveRenderer';
import { FieldLayers } from '../layering';

/** The three sizes the grave's art is judged at (design record R4). */
const EVERY_SIZE = [SIZE_FLOOR, SIZE_START, SIZE_CEILING];

/**
 * The mouth layer's four children, in the order the hole is read from the
 * ground down: what lies outside the lip, the cut and its walls, the place a
 * fall draws, and the turf hanging over the top of it all.
 */
const GROUND_ART = 0;
const THE_HOLE = 1;
const THE_FALLS = 2;
const THE_OVERHANG = 3;
const MOUTH_CHILDREN = 4;

function grave(size: number, x = 270, y = 600): Grave {
  return { x, y, size, invulnerable: 0, scoreRungBled: false };
}

function attached(): { layers: FieldLayers; renderer: GraveRenderer } {
  const layers = new FieldLayers();
  const renderer = new GraveRenderer();
  renderer.attach(layers);
  return { layers, renderer };
}

function pieceOf(layers: FieldLayers, at: number): Container {
  const piece = layers.layer('graveMouth').children[at];
  if (piece === undefined) throw new Error(`no mouth child at ${at}`);
  return piece;
}

function mouthOf(layers: FieldLayers): Graphics {
  return pieceOf(layers, THE_HOLE) as Graphics;
}

function rimOf(layers: FieldLayers): Graphics {
  return layers.layer('graveRim').children[0] as Graphics;
}

function glowOf(layers: FieldLayers): Graphics {
  return layers.layer('graveRim').children[1] as Graphics;
}

function arcOf(layers: FieldLayers): Graphics {
  return layers.layer('graveRim').children[2] as Graphics;
}

describe('GraveRenderer', () => {
  it('the mouth lands in the graveMouth layer and the rim in the graveRim layer (ADR 0014)', () => {
    // Two Graphics and not one: the hole's interior must sit under whatever is
    // falling into it while the rim stays legible over the top, and one
    // Graphics cannot be in two layers.
    const { layers } = attached();
    // Four in the mouth since the hole was cut into the ground (R4): the ground
    // outside the lip, the cut and its walls, the place a fall draws, and the
    // turf over the top. Their order is its own test below.
    expect(layers.layer('graveMouth').children).toHaveLength(MOUTH_CHILDREN);
    // The rim, the reservoir's glow, and Territory's charge arc: three bands
    // on one geometry, never a second shape.
    expect(layers.layer('graveRim').children).toHaveLength(3);
    expect(mouthOf(layers)).not.toBe(rimOf(layers));
  });

  it('the hole grows with the grave: the black mouth is graveHitbox at the floor, the start size and the ceiling', () => {
    // R4: the art is built once in the grave's own half-lengths and scaled by
    // its size, because the size changes on every swallow. The drawn mouth is
    // still the rule's own geometry exactly, so the hole the player reads and
    // the box the sim swallows with are one rectangle at every size.
    const { layers, renderer } = attached();
    for (const size of EVERY_SIZE) {
      const at = grave(size);
      renderer.sync(at, 0, 0, 0);
      const box = graveHitbox(at);
      const bounds = mouthOf(layers).getBounds();
      expect(`${size} ${bounds.x} ${bounds.y}`).toBe(
        `${size} ${box.x} ${box.y}`,
      );
      expect(bounds.width).toBeCloseTo(box.width, 9);
      expect(bounds.height).toBeCloseTo(box.height, 9);
      expect(bounds.width).toBeCloseTo(graveWidth(size), 9);
      expect(bounds.height).toBeCloseTo(size * 2, 9);
    }
  });

  it('the mouth stays a hole at SIZE_FLOOR', () => {
    // The instrument that survives a later retune of SIZE_FLOOR or
    // GRAVE_RIM_STROKE. The rendered check cannot replace it, and a rim derived
    // from BOUNDARY_STROKE's bracket lands on 8 and turns a floor grave into a
    // solid pill exactly when the player most needs to read it.
    //
    // The mouth does not bind the power-up: ADR 0003 rules that size never gates a
    // swallow, and the power-up's own bounds live in FieldRenderer.test.ts
    // (docs/design/drop-legibility-fix.md carries the supersession).
    const interior = graveWidth(SIZE_FLOOR) - 2 * GRAVE_RIM_STROKE;
    expect(interior).toBeGreaterThan(0);
    expect(2 * GRAVE_RIM_STROKE).toBeLessThan(graveWidth(SIZE_FLOOR));
  });

  it('the rim strokes inward on a true rectangle, so its outer edge equals graveHitbox at every size (ADR 0003)', () => {
    // ADR 0003 makes the drawn grave the health bar, and a player reads the
    // outer edge as what they pass under and swallow. A default centred stroke
    // would draw it half a stroke wider on every side than the hitbox reports.
    //
    // A true rectangle since R4: the mouth is the rule's own geometry under R1,
    // and the rounded corner the drawing used to carry made the drawn grave a
    // shape the sim never had. The corners are what a rounding would move, so
    // the bound is asked at all three sizes rather than at the start alone.
    const { layers, renderer } = attached();
    for (const size of EVERY_SIZE) {
      const at = grave(size);
      renderer.sync(at, 0, 0, 0);

      const box = graveHitbox(at);
      const bounds = rimOf(layers).getBounds();
      expect(bounds.x).toBeCloseTo(box.x, 9);
      expect(bounds.y).toBeCloseTo(box.y, 9);
      expect(bounds.width).toBeCloseTo(box.width, 9);
      expect(bounds.height).toBeCloseTo(box.height, 9);

      // The band itself at the corner, a field unit in from both edges. The
      // bounds above are blind to a rounding, because a rounded rectangle
      // reports the same box as the rectangle it is rounded from, and that is
      // how the old corner survived every measurement in this file. The rim is
      // where the claim has to be made: ADR 0003 makes its outer edge the box
      // the player passes under, so a rim that cut its corners would draw a
      // shape the hitbox is not.
      const corner = { x: graveWidth(size) / 2 - 1, y: -size + 1 };
      expect(`${size} ${rimOf(layers).containsPoint(corner)}`).toBe(
        `${size} true`,
      );
    }
  });

  it('position follows grave.x and grave.y', () => {
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START, 123, 456), 0, 0, 0);
    for (const piece of [mouthOf(layers), rimOf(layers)]) {
      expect(piece.position.x).toBe(123);
      expect(piece.position.y).toBe(456);
    }
  });

  it("the hole's art is built once and never cleared again, at any size", () => {
    // R4: the size changes on every swallow, so the hole is built once in the
    // grave's own half-lengths and scaled. Every proportion it is built from is
    // a share of the opening, which is what makes that possible, and a redraw
    // per swallow is the cost that rules it out.
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START), 0, 0, 0);
    const cleared = [GROUND_ART, THE_HOLE, THE_OVERHANG].map((at) =>
      vi.spyOn(pieceOf(layers, at) as Graphics, 'clear'),
    );

    for (const size of [SIZE_START, SIZE_FLOOR, SIZE_CEILING, SIZE_START + 3]) {
      renderer.sync(grave(size, 300, 400), 0, 0, 0);
    }

    for (const spy of cleared) expect(spy).not.toHaveBeenCalled();
  });

  it('a same-size sync redraws no rim stroke', () => {
    // The three rim jobs keep a fixed stroke in field units, so they are the one
    // part of the grave still rebuilt on a size change (R4, "What scales and
    // what does not"). Position is a container transform and is free.
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START), 0, 0, 0);
    const redrawn = [rimOf(layers), glowOf(layers), arcOf(layers)].map(
      (piece) => vi.spyOn(piece, 'clear'),
    );

    renderer.sync(grave(SIZE_START, 300, 400), 0, 0, 0);
    for (const spy of redrawn) expect(spy).not.toHaveBeenCalled();

    renderer.sync(grave(SIZE_START + 3, 300, 400), 0, 0, 0);
    for (const spy of redrawn) expect(spy).toHaveBeenCalled();
  });

  it("draws the glow at the rim's own geometry, so a charged grave is not a wider grave (ADR 0003)", () => {
    // The outer edge is the health bar and a player reads it as what they pass
    // under. A glow standing outside the rim would make the grave read wider
    // than the box, and one standing inside it would eat the mouth at the floor.
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START), 1, 0, 0);
    const rim = rimOf(layers).getLocalBounds();
    const glow = glowOf(layers).getLocalBounds();
    expect(glow.width).toBeCloseTo(rim.width, 9);
    expect(glow.height).toBeCloseTo(rim.height, 9);
  });

  it('detach then attach puts both pieces back, which FieldLayers.clear() between runs requires', () => {
    const { layers, renderer } = attached();
    renderer.detach();
    expect(layers.layer('graveMouth').children).toHaveLength(0);
    expect(layers.layer('graveRim').children).toHaveLength(0);

    layers.clear();
    renderer.attach(layers);
    expect(layers.layer('graveMouth').children).toHaveLength(MOUTH_CHILDREN);
    expect(layers.layer('graveRim').children).toHaveLength(3);
  });
});

describe('the hole cut in the ground (grave-in-the-ground R4)', () => {
  it('the mouth layer holds the ground art, the walls, the place for falls and the overhang, in that order', () => {
    // R4's own draw order, and it is what fixes "between the cut and the turf"
    // (R5) in one place: a falling body draws over the walls it is falling past
    // and under the grass hanging over the lip, so it goes out of sight the way
    // a body in a hole does.
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START), 0, 0, 0);
    const mouth = layers.layer('graveMouth').children;

    expect(mouth).toHaveLength(MOUTH_CHILDREN);
    expect(mouth[THE_HOLE]).toBe(mouthOf(layers));
    expect(mouth[THE_FALLS]).toBe(renderer.falls);
    // The ground art lies outside the lip, so it is wider than the cut; the cut
    // is the mouth's own rectangle and nothing wider (the test above); and the
    // overhang is drawn last, above the place a fall draws.
    const hole = mouthOf(layers).getBounds();
    expect(pieceOf(layers, GROUND_ART).getBounds().width).toBeGreaterThan(
      hole.width,
    );
    expect(mouth.indexOf(renderer.falls)).toBeLessThan(
      mouth.indexOf(pieceOf(layers, THE_OVERHANG)),
    );
  });

  it('the place for falls follows the grave and is never scaled', () => {
    // A fall holds its place in the grave's own proportions and multiplies by
    // the size itself (R5), so a container scaled here would apply the size
    // twice and a feast would start its fall in mid-hole.
    const { renderer } = attached();
    for (const size of EVERY_SIZE) {
      renderer.sync(grave(size, 111, 222), 0, 0, 0);
      expect(`${size} ${renderer.falls.position.x}`).toBe(`${size} 111`);
      expect(`${size} ${renderer.falls.position.y}`).toBe(`${size} 222`);
      expect(`${size} ${renderer.falls.scale.x}`).toBe(`${size} 1`);
      expect(`${size} ${renderer.falls.scale.y}`).toBe(`${size} 1`);
    }
  });

  it('the bites, the grass and the tufts reach no farther outside the hitbox than the values table states', () => {
    // ADR 0003 makes the rim's outer edge the hitbox, so everything past it is
    // ground dressing: bites where the lip fell away, the trodden margin and
    // the tufts. The bound is one row in the values table, and it is what keeps
    // the dressing from ever reading as the grave the player steers.
    const { layers, renderer } = attached();
    for (const size of EVERY_SIZE) {
      const at = grave(size);
      renderer.sync(at, 0, 0, 0);
      const box = graveHitbox(at);
      const allowed = graveWidth(size) * ART_REACH_OUTSIDE;

      for (const piece of [GROUND_ART, THE_OVERHANG]) {
        const bounds = pieceOf(layers, piece).getBounds();
        const outside = Math.max(
          box.x - bounds.x,
          box.y - bounds.y,
          bounds.x + bounds.width - (box.x + box.width),
          bounds.y + bounds.height - (box.y + box.height),
        );
        expect(`${size}/${piece} ${outside <= allowed}`).toBe(
          `${size}/${piece} true`,
        );
      }
    }
  });

  it('the rim, the glow and the arc are still the three children of graveRim, and the arc never leaves the hitbox', () => {
    // The two-colour rim, the reservoir's glow and Territory's charge arc each
    // keep the job they do today on the new grave (R4), and they still ride one
    // geometry rather than growing a shape of their own.
    const { layers, renderer } = attached();
    for (const size of EVERY_SIZE) {
      const at = grave(size);
      renderer.sync(at, 1, 0, 1);
      expect(layers.layer('graveRim').children).toEqual([
        rimOf(layers),
        glowOf(layers),
        arcOf(layers),
      ]);

      const box = graveHitbox(at);
      const arc = arcOf(layers).getBounds();
      expect(`${size} ${arc.x >= box.x - 1e-6}`).toBe(`${size} true`);
      expect(`${size} ${arc.y >= box.y - 1e-6}`).toBe(`${size} true`);
      expect(`${size} ${arc.x + arc.width <= box.x + box.width + 1e-6}`).toBe(
        `${size} true`,
      );
      expect(`${size} ${arc.y + arc.height <= box.y + box.height + 1e-6}`).toBe(
        `${size} true`,
      );
    }
  });
});

describe("the reservoir's diegetic tell (plan 6.18)", () => {
  it('builds the glow with fullness, so an empty reservoir shows nothing', () => {
    expect(glowAlpha(0, 0)).toBe(0);
    expect(glowAlpha(0.5, 0)).toBeCloseTo(0.5, 6);
    expect(glowAlpha(0.9, 0)).toBeCloseTo(0.9, 6);
  });

  it('pulses at full rather than simply reaching the top of the ramp', () => {
    // Two tells rather than one is deliberate: the button is where the thumb
    // is and the glow is where the eyes are, and a player mid-dodge is looking
    // at the grave. Pulsing is what makes full a state and not a maximum.
    const across = [];
    for (let tick = 0; tick < 60; tick++) across.push(glowAlpha(1, tick));
    expect(new Set(across).size).toBeGreaterThan(1);
    expect(Math.max(...across)).toBeLessThanOrEqual(1);
    expect(Math.min(...across)).toBeGreaterThan(glowAlpha(0.5, 0));
  });

  it('clamps a fullness outside zero to one rather than trusting the caller', () => {
    expect(glowAlpha(-1, 0)).toBe(0);
    expect(glowAlpha(2, 0)).toBeLessThanOrEqual(1);
  });

  it('takes a number and never the run state', () => {
    // Handing a renderer live sim state is the thing the rest of this design
    // works to avoid, and fullness is everything the glow needs.
    const layers = new FieldLayers();
    const renderer = new GraveRenderer();
    renderer.attach(layers);
    expect(() => renderer.sync(createGrave(27), 1, 10, 0)).not.toThrow();
  });
});

describe("Territory's charge arc (#76)", () => {
  it('zero charge draws nothing', () => {
    // The arc empties on the lay, so an empty charge is an empty band rather
    // than a full band at zero alpha a screenshot could still measure.
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START), 0, 0, 0);
    expect(arcOf(layers).getLocalBounds().width).toBe(0);
  });

  it('a partial charge traces part of the rim and a fuller one traces more', () => {
    // The trace runs clockwise from top-centre, so half a charge reaches the
    // bottom-centre: the whole right side and neither left corner.
    // The bounds rectangle is copied field by field: pixi hands back a reused
    // instance that the next sync mutates in place.
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START), 0, 0, 0.5);
    const half = arcOf(layers).getLocalBounds();
    const halfWidth = half.width;
    expect(half.height).toBeGreaterThan(0);
    expect(halfWidth).toBeGreaterThan(graveWidth(SIZE_START) * 0.3);
    expect(halfWidth).toBeLessThan(graveWidth(SIZE_START) * 0.75);

    renderer.sync(grave(SIZE_START), 0, 0, 1);
    const fullWidth = arcOf(layers).getLocalBounds().width;
    expect(fullWidth).toBeGreaterThan(halfWidth);
  });

  it('a full charge traces the whole rim, its outer edge never outside the hitbox', () => {
    // ADR 0003 makes the drawn grave the health bar, so the visible outer
    // edge has to equal the hitbox at every size and every charge.
    const { layers, renderer } = attached();
    for (const size of [SIZE_FLOOR, SIZE_START, SIZE_CEILING]) {
      renderer.sync(grave(size), 0, 0, 1);
      const bounds = arcOf(layers).getLocalBounds();
      expect(bounds.width).toBeLessThanOrEqual(graveWidth(size) + 1e-6);
      expect(bounds.height).toBeLessThanOrEqual(size * 2 + 1e-6);
      expect(bounds.width).toBeGreaterThan(graveWidth(size) * 0.9);
      expect(bounds.height).toBeGreaterThan(size * 2 * 0.9);
    }
  });
});
