/**
 * The first field content on screen. Render only: it reads a Grave and draws
 * it, and holds no rules.
 */

import type { Graphics } from "pixi.js";
import { describe, expect, it, vi } from "vitest";
import type { Grave } from "../../../game/grave";
import { createGrave, graveHitbox, graveWidth } from "../../../game/grave";
import { SIZE_CEILING, SIZE_FLOOR, SIZE_START } from "../../../game/tuning";
import { glowAlpha, GRAVE_RIM_STROKE, GraveRenderer } from "./GraveRenderer";
import { FieldLayers } from "./layering";

function grave(size: number, x = 270, y = 600): Grave {
  return { x, y, size, invulnerable: 0 };
}

function attached(): { layers: FieldLayers; renderer: GraveRenderer } {
  const layers = new FieldLayers();
  const renderer = new GraveRenderer();
  renderer.attach(layers);
  return { layers, renderer };
}

function mouthOf(layers: FieldLayers): Graphics {
  return layers.layer("graveMouth").children[0] as Graphics;
}

function rimOf(layers: FieldLayers): Graphics {
  return layers.layer("graveRim").children[0] as Graphics;
}

function glowOf(layers: FieldLayers): Graphics {
  return layers.layer("graveRim").children[1] as Graphics;
}

describe("GraveRenderer", () => {
  it("the mouth lands in the graveMouth layer and the rim in the graveRim layer (ADR 0014)", () => {
    // Two Graphics and not one: the hole's interior must sit under whatever is
    // falling into it while the rim stays legible over the top, and one
    // Graphics cannot be in two layers.
    const { layers } = attached();
    expect(layers.layer("graveMouth").children).toHaveLength(1);
    // The rim and the reservoir's glow, which is the rim's own band in
    // treasure's colour drawn over it at the identical geometry.
    expect(layers.layer("graveRim").children).toHaveLength(2);
    expect(mouthOf(layers)).not.toBe(rimOf(layers));
  });

  it("the drawn width is graveWidth(size) and the height twice the size, at the floor, the start size and the ceiling", () => {
    const { layers, renderer } = attached();
    for (const size of [SIZE_FLOOR, SIZE_START, SIZE_CEILING]) {
      renderer.sync(grave(size), 0, 0);
      const bounds = mouthOf(layers).getLocalBounds();
      expect(bounds.width).toBeCloseTo(graveWidth(size), 9);
      expect(bounds.height).toBeCloseTo(size * 2, 9);
    }
  });

  it("the mouth stays a hole at SIZE_FLOOR", () => {
    // The instrument that survives a later retune of SIZE_FLOOR or
    // GRAVE_RIM_STROKE. The rendered check cannot replace it, and a rim derived
    // from BOUNDARY_STROKE's bracket lands on 8 and turns a floor grave into a
    // solid pill exactly when the player most needs to read it.
    //
    // The mouth does not bind the drop: ADR 0003 rules that size never gates a
    // swallow, and the drop's own bounds live in FieldRenderer.test.ts
    // (docs/design/drop-legibility-fix.md carries the supersession).
    const interior = graveWidth(SIZE_FLOOR) - 2 * GRAVE_RIM_STROKE;
    expect(interior).toBeGreaterThan(0);
    expect(2 * GRAVE_RIM_STROKE).toBeLessThan(graveWidth(SIZE_FLOOR));
  });

  it("the rim strokes inward, so the drawn outer edge equals graveHitbox exactly (ADR 0003)", () => {
    // ADR 0003 makes the drawn grave the health bar, and a player reads the
    // outer edge as what they pass under and swallow. A default centred stroke
    // would draw it half a stroke wider on every side than the hitbox reports.
    const { layers, renderer } = attached();
    const at = grave(SIZE_START);
    renderer.sync(at, 0, 0);

    const box = graveHitbox(at);
    const bounds = rimOf(layers).getBounds();
    expect(bounds.x).toBeCloseTo(box.x, 9);
    expect(bounds.y).toBeCloseTo(box.y, 9);
    expect(bounds.width).toBeCloseTo(box.width, 9);
    expect(bounds.height).toBeCloseTo(box.height, 9);
  });

  it("position follows grave.x and grave.y", () => {
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START, 123, 456), 0, 0);
    for (const piece of [mouthOf(layers), rimOf(layers)]) {
      expect(piece.position.x).toBe(123);
      expect(piece.position.y).toBe(456);
    }
  });

  it("a sync at an unchanged size does not rebuild the geometry, and a sync at a changed size does", () => {
    // Position is a container transform and is free; rebuilding the rounded
    // rect every frame is not, and the size only changes on a swallow or a hit.
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START), 0, 0);
    const redrawn = vi.spyOn(mouthOf(layers), "clear");

    renderer.sync(grave(SIZE_START, 300, 400), 0, 0);
    expect(redrawn).not.toHaveBeenCalled();

    renderer.sync(grave(SIZE_START + 3, 300, 400), 0, 0);
    expect(redrawn).toHaveBeenCalled();
  });

  it("draws the glow at the rim's own geometry, so a charged grave is not a wider grave (ADR 0003)", () => {
    // The outer edge is the health bar and a player reads it as what they pass
    // under. A glow standing outside the rim would make the grave read wider
    // than the box, and one standing inside it would eat the mouth at the floor.
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START), 1, 0);
    const rim = rimOf(layers).getLocalBounds();
    const glow = glowOf(layers).getLocalBounds();
    expect(glow.width).toBeCloseTo(rim.width, 9);
    expect(glow.height).toBeCloseTo(rim.height, 9);
  });

  it("detach then attach puts both pieces back, which FieldLayers.clear() between runs requires", () => {
    const { layers, renderer } = attached();
    renderer.detach();
    expect(layers.layer("graveMouth").children).toHaveLength(0);
    expect(layers.layer("graveRim").children).toHaveLength(0);

    layers.clear();
    renderer.attach(layers);
    expect(layers.layer("graveMouth").children).toHaveLength(1);
    expect(layers.layer("graveRim").children).toHaveLength(2);
  });
});

describe("the reservoir's diegetic tell (plan 6.18)", () => {
  it("builds the glow with fullness, so an empty reservoir shows nothing", () => {
    expect(glowAlpha(0, 0)).toBe(0);
    expect(glowAlpha(0.5, 0)).toBeCloseTo(0.5, 6);
    expect(glowAlpha(0.9, 0)).toBeCloseTo(0.9, 6);
  });

  it("pulses at full rather than simply reaching the top of the ramp", () => {
    // Two tells rather than one is deliberate: the button is where the thumb
    // is and the glow is where the eyes are, and a player mid-dodge is looking
    // at the grave. Pulsing is what makes full a state and not a maximum.
    const across = [];
    for (let tick = 0; tick < 60; tick++) across.push(glowAlpha(1, tick));
    expect(new Set(across).size).toBeGreaterThan(1);
    expect(Math.max(...across)).toBeLessThanOrEqual(1);
    expect(Math.min(...across)).toBeGreaterThan(glowAlpha(0.5, 0));
  });

  it("clamps a fullness outside zero to one rather than trusting the caller", () => {
    expect(glowAlpha(-1, 0)).toBe(0);
    expect(glowAlpha(2, 0)).toBeLessThanOrEqual(1);
  });

  it("takes a number and never the run state", () => {
    // Handing a renderer live sim state is the thing the rest of this design
    // works to avoid, and fullness is everything the glow needs.
    const layers = new FieldLayers();
    const renderer = new GraveRenderer();
    renderer.attach(layers);
    expect(() => renderer.sync(createGrave(27), 1, 10)).not.toThrow();
  });
});
