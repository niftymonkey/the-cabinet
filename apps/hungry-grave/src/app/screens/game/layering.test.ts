/**
 * The field's fixed draw stack (ADR 0014). Container order only: the value band
 * is palette.ts's job and nothing here touches colour.
 */

import { Container } from "pixi.js";
import { describe, expect, it, vi } from "vitest";

import type { FieldPlacement } from "../../layout";
import { DEGENERATE_PLACEMENT, fitField } from "../../layout";
import type { LayerName } from "./layering";
import { FieldLayers, LAYER_ORDER } from "./layering";

vi.mock("../../getEngine", () => ({
  engine: () => ({ navigation: { showScreen: vi.fn() } }),
}));

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock("../../ui/Label", () => ({
  Label: class extends Container {
    public text = "";
  },
}));

vi.mock("../../ui/Button", () => ({
  Button: class extends Container {
    public onPress = { connect: (handler: () => void) => void handler };
  },
}));

import { GameScreen } from "./GameScreen";

/**
 * ADR 0014's stack as the ADR states it, top to bottom, with the hit's dim in
 * the place its 2026-08-20 amendment gives it. Written out here so the code and
 * the record are checked against each other rather than each against itself.
 */
const ADR_0014_STACK: LayerName[] = [
  "mobFire",
  "graveRim",
  "hitDim",
  "treasure",
  "mobBodies",
  "corpses",
  "storm",
  "bellRing",
  "belchEruption",
  "graveMouth",
  "ground",
];

/** How far up the stack a layer draws. Higher wins where two overlap. */
function height(name: LayerName): number {
  return LAYER_ORDER.indexOf(name);
}

describe("LAYER_ORDER (ADR 0014)", () => {
  it("reversed is the ADR's stack as the ADR states it, top to bottom", () => {
    expect([...LAYER_ORDER].reverse()).toEqual(ADR_0014_STACK);
  });

  it("puts mobFire topmost", () => {
    expect(LAYER_ORDER[LAYER_ORDER.length - 1]).toBe("mobFire");
  });

  it("puts the belch's eruption below mob fire, so no player effect occludes it", () => {
    // ADR 0008 resumes the boss pattern immediately and grants no
    // invulnerability, so the eruption may never hide the fire still coming.
    expect(height("belchEruption")).toBeLessThan(height("mobFire"));
  });

  it("puts the grave's rim above the food and its mouth below", () => {
    // The rim is the health bar, so it reads under a pile; the mouth stays
    // beneath the food so a swallow is visibly a fall into it.
    expect(height("graveRim")).toBeGreaterThan(height("corpses"));
    expect(height("graveRim")).toBeGreaterThan(height("treasure"));
    expect(height("graveMouth")).toBeLessThan(height("corpses"));
    expect(height("graveMouth")).toBeLessThan(height("treasure"));
  });

  it("puts hitDim below both mobFire and graveRim", () => {
    // A hit dims the field and both mob fire and the rim survive it: the rim
    // is the announcing channel at the tick it changes (amendment 2026-08-20).
    expect(height("hitDim")).toBeLessThan(height("mobFire"));
    expect(height("hitDim")).toBeLessThan(height("graveRim"));
  });
});

describe("FieldLayers", () => {
  it("holds one container per name, in LAYER_ORDER order", () => {
    const layers = new FieldLayers();
    expect(layers.root.children).toHaveLength(LAYER_ORDER.length);
    LAYER_ORDER.forEach((name, index) => {
      expect(layers.root.children[index]).toBe(layers.layer(name));
    });
  });

  it("returns the same container for a name on every call", () => {
    const layers = new FieldLayers();
    expect(layers.layer("mobFire")).toBe(layers.layer("mobFire"));
  });

  it("is not a Container and offers no way to add a child outside a named layer", () => {
    // Extending Container would let a later renderer addChild straight onto the
    // stack, landing above mobFire, and no test on a fresh instance would see
    // it. Composition is what makes that unreachable.
    const layers = new FieldLayers();
    expect(layers).not.toBeInstanceOf(Container);
    expect("addChild" in layers).toBe(false);
  });

  it("empties every layer on clear and leaves the stack standing", () => {
    const layers = new FieldLayers();
    for (const name of LAYER_ORDER) {
      layers.layer(name).addChild(new Container());
    }

    layers.clear();

    expect(layers.root.children).toHaveLength(LAYER_ORDER.length);
    for (const name of LAYER_ORDER) {
      expect(layers.layer(name).children).toHaveLength(0);
      expect(layers.root.children).toContain(layers.layer(name));
    }
  });
});

describe("the game screen's field container", () => {
  it("carries exactly the transform fitField returns, on a desktop and a phone viewport", () => {
    // The placement is applied as one container transform and never by
    // multiplying coordinates at call sites, which is what makes ADR 0003's
    // "no number in the sim is ever a device pixel" true by construction.
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
    ]) {
      const screen = new GameScreen();
      screen.resize(width, height);

      const placement = fitField(width, height);
      const field: Container = screen["field"];
      expect(field.position.x).toBe(placement.offsetX);
      expect(field.position.y).toBe(placement.offsetY);
      expect(field.scale.x).toBe(placement.scale);
      expect(field.scale.y).toBe(placement.scale);
      expect(screen["placement"]).toEqual(placement);
    }
  });

  it("holds the placement it applied, so a pointer handler need not recompute it", () => {
    // screenToField inverts this exact value. A handler calling fitField again
    // at event time computes the placement a second time, and the two agree
    // only until something moves one of them.
    const screen = new GameScreen();
    expect(screen["placement"]).toEqual(DEGENERATE_PLACEMENT);

    screen.resize(1440, 900);
    const field: Container = screen["field"];
    const held: FieldPlacement = screen["placement"];
    expect(field.position.x).toBe(held.offsetX);
    expect(field.scale.x).toBe(held.scale);
  });
});

describe("the game screen across a pooled reuse", () => {
  it("empties the field on reset and keeps the boundary readout", () => {
    // Screens are pooled, so a second run on this instance must not open with
    // the first run's sprites still on the field. The frame is the field's only
    // visible edge, so it has to survive the emptying.
    const screen = new GameScreen();
    const layers: FieldLayers = screen["layers"];
    const frame = screen["frame"];
    layers.layer("corpses").addChild(new Container());
    layers.layer("mobFire").addChild(new Container());

    screen.reset();

    expect(layers.layer("corpses").children).toHaveLength(0);
    expect(layers.layer("mobFire").children).toHaveLength(0);
    expect(layers.layer("ground").children).toEqual([frame]);
  });

  it("keeps the same boundary readout instance across repeated resets", () => {
    // Rebuilding it per run would allocate a Graphics on every reuse.
    const screen = new GameScreen();
    const frame = screen["frame"];
    screen.reset();
    screen.reset();
    expect(screen["frame"]).toBe(frame);
    const layers: FieldLayers = screen["layers"];
    expect(layers.layer("ground").children).toEqual([frame]);
  });
});
