/**
 * The first field content on screen. Render only: it reads a Grave and draws
 * it, and holds no rules.
 */

import type { Graphics } from "pixi.js";
import { describe, expect, it, vi } from "vitest";
import type { Grave } from "../../../game/grave";
import { graveHitbox, graveWidth } from "../../../game/grave";
import { SIZE_CEILING, SIZE_FLOOR, SIZE_START } from "../../../game/tuning";
import { GRAVE_RIM_STROKE, GraveRenderer } from "./GraveRenderer";
import { FieldLayers } from "./layering";

/**
 * A drop's width in field units. Dispatch 4 owns the real constant; the plan's
 * figure is used here because the mouth has to stay wide enough for a drop to
 * visibly fall into it at the size floor.
 */
const DROP_WIDTH = 9;

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

describe("GraveRenderer", () => {
  it("the mouth lands in the graveMouth layer and the rim in the graveRim layer (ADR 0014)", () => {
    // Two Graphics and not one: the hole's interior must sit under whatever is
    // falling into it while the rim stays legible over the top, and one
    // Graphics cannot be in two layers.
    const { layers } = attached();
    expect(layers.layer("graveMouth").children).toHaveLength(1);
    expect(layers.layer("graveRim").children).toHaveLength(1);
    expect(mouthOf(layers)).not.toBe(rimOf(layers));
  });

  it("the drawn width is graveWidth(size) and the height twice the size, at the floor, the start size and the ceiling", () => {
    const { layers, renderer } = attached();
    for (const size of [SIZE_FLOOR, SIZE_START, SIZE_CEILING]) {
      renderer.sync(grave(size));
      const bounds = mouthOf(layers).getLocalBounds();
      expect(bounds.width).toBeCloseTo(graveWidth(size), 9);
      expect(bounds.height).toBeCloseTo(size * 2, 9);
    }
  });

  it("the mouth stays a hole at SIZE_FLOOR: the interior is wider than a drop and the stroke does not self-overlap", () => {
    // The instrument that survives a later retune of SIZE_FLOOR or
    // GRAVE_RIM_STROKE. The rendered check cannot replace it, and a rim derived
    // from BOUNDARY_STROKE's bracket lands on 8 and turns a floor grave into a
    // solid pill exactly when the player most needs to read it.
    const interior = graveWidth(SIZE_FLOOR) - 2 * GRAVE_RIM_STROKE;
    expect(interior).toBeGreaterThan(DROP_WIDTH);
    expect(2 * GRAVE_RIM_STROKE).toBeLessThan(graveWidth(SIZE_FLOOR));
  });

  it("the rim strokes inward, so the drawn outer edge equals graveHitbox exactly (ADR 0003)", () => {
    // ADR 0003 makes the drawn grave the health bar, and a player reads the
    // outer edge as what they pass under and swallow. A default centred stroke
    // would draw it half a stroke wider on every side than the hitbox reports.
    const { layers, renderer } = attached();
    const at = grave(SIZE_START);
    renderer.sync(at);

    const box = graveHitbox(at);
    const bounds = rimOf(layers).getBounds();
    expect(bounds.x).toBeCloseTo(box.x, 9);
    expect(bounds.y).toBeCloseTo(box.y, 9);
    expect(bounds.width).toBeCloseTo(box.width, 9);
    expect(bounds.height).toBeCloseTo(box.height, 9);
  });

  it("position follows grave.x and grave.y", () => {
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START, 123, 456));
    for (const piece of [mouthOf(layers), rimOf(layers)]) {
      expect(piece.position.x).toBe(123);
      expect(piece.position.y).toBe(456);
    }
  });

  it("a sync at an unchanged size does not rebuild the geometry, and a sync at a changed size does", () => {
    // Position is a container transform and is free; rebuilding the rounded
    // rect every frame is not, and the size only changes on a swallow or a hit.
    const { layers, renderer } = attached();
    renderer.sync(grave(SIZE_START));
    const redrawn = vi.spyOn(mouthOf(layers), "clear");

    renderer.sync(grave(SIZE_START, 300, 400));
    expect(redrawn).not.toHaveBeenCalled();

    renderer.sync(grave(SIZE_START + 3, 300, 400));
    expect(redrawn).toHaveBeenCalled();
  });

  it("detach then attach puts both pieces back, which FieldLayers.clear() between runs requires", () => {
    const { layers, renderer } = attached();
    renderer.detach();
    expect(layers.layer("graveMouth").children).toHaveLength(0);
    expect(layers.layer("graveRim").children).toHaveLength(0);

    layers.clear();
    renderer.attach(layers);
    expect(layers.layer("graveMouth").children).toHaveLength(1);
    expect(layers.layer("graveRim").children).toHaveLength(1);
  });
});
