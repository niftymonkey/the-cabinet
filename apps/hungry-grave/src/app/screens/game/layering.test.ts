/**
 * The field's fixed draw stack (ADR 0014). Container order only: the value band
 * is palette.ts's job and nothing here touches colour.
 */

import { Container, Graphics } from "pixi.js";
import { describe, expect, it, vi } from "vitest";

import { SEED_LIMIT } from "../../../game/run";
import { METER_FONT_SIZE, meterLinePosition } from "../../FpsMeter";
import type { FieldPlacement } from "../../layout";
import { DEGENERATE_PLACEMENT, fitField, READOUT_RESERVE } from "../../layout";
import type { LayerName } from "./layering";
import { FieldLayers, LAYER_ORDER } from "./layering";

vi.mock("../../getEngine", () => ({
  engine: () => ({ navigation: { showScreen: vi.fn() } }),
}));

/** The real widgets need a renderer: text metrics and a loaded texture. */
vi.mock("../../ui/Label", () => ({
  Label: class extends Container {
    public text = "";
    public anchor = { set: () => {} };
  },
}));

vi.mock("../../ui/Button", () => ({
  Button: class extends Container {
    public onPress = { connect: (handler: () => void) => void handler };
  },
}));

import { GameScreen } from "./GameScreen";

// The screen reads its persisted keyboard speed on construction, and an
// unstubbed localStorage warns once through the storage guard.
Object.defineProperty(globalThis, "localStorage", {
  value: { getItem: () => null, setItem: () => {} },
  configurable: true,
});

/**
 * ADR 0014's stack as the ADR states it, top to bottom, with the hit's dim in
 * the place its 2026-08-20 amendment gives it and the boundary in the place its
 * 2026-08-22 one gives it. Written out here so the code and the record are
 * checked against each other rather than each against itself.
 */
const ADR_0014_STACK: LayerName[] = [
  "mobFire",
  "fieldBoundary",
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

/**
 * The stack container, reached the one way a caller can reach it. Nothing
 * exposes the root, so a test that wants to see the draw order has to attach
 * the stack exactly as GameScreen does.
 */
function attachedStack(layers: FieldLayers): Container {
  const parent = new Container();
  layers.addTo(parent);
  // addTo adds exactly one child and the parent was made two lines above.
  return parent.children[0]!;
}

describe("FieldLayers", () => {
  it("holds one container per name, in LAYER_ORDER order", () => {
    const layers = new FieldLayers();
    const stack = attachedStack(layers);
    expect(stack.children).toHaveLength(LAYER_ORDER.length);
    LAYER_ORDER.forEach((name, index) => {
      expect(stack.children[index]).toBe(layers.layer(name));
    });
  });

  it("returns the same container for a name on every call", () => {
    const layers = new FieldLayers();
    expect(layers.layer("mobFire")).toBe(layers.layer("mobFire"));
  });

  it("exposes no container a caller could add a child to outside a named layer", () => {
    // Extending Container would let a later renderer addChild straight onto the
    // stack, landing above mobFire, and no test on a fresh instance would see
    // it. Composition is what makes that unreachable.
    const layers = new FieldLayers();
    expect(layers).not.toBeInstanceOf(Container);
    expect("addChild" in layers).toBe(false);
    expect("root" in layers).toBe(false);
  });

  it("empties every layer on clear and leaves the stack standing", () => {
    const layers = new FieldLayers();
    const stack = attachedStack(layers);
    for (const name of LAYER_ORDER) {
      layers.layer(name).addChild(new Container());
    }

    layers.clear();

    expect(stack.children).toHaveLength(LAYER_ORDER.length);
    for (const name of LAYER_ORDER) {
      expect(layers.layer(name).children).toHaveLength(0);
      expect(stack.children).toContain(layers.layer(name));
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
  it("empties the field on reset and puts the field's own furniture back", () => {
    // Screens are pooled, so a second run on this instance must not open with
    // the first run's sprites still on the field. What dressField() puts back
    // is the boundary readout and the pooled entity sprites, every one of them
    // invisible until a live entity claims it; anything else is a leak.
    const screen = new GameScreen();
    const layers: FieldLayers = screen["layers"];
    const frame = screen["frame"];
    const stray = new Container();
    layers.layer("corpses").addChild(stray);
    layers.layer("mobFire").addChild(new Container());

    screen.reset();

    for (const name of ["corpses", "mobFire", "mobBodies"] as const) {
      const children = layers.layer(name).children;
      expect(children).not.toContain(stray);
      expect(children.every((child) => !child.visible)).toBe(true);
      expect(children.every((child) => child instanceof Graphics)).toBe(true);
    }
    expect(layers.layer("fieldBoundary").children).toEqual([frame]);
  });

  it("keeps the same boundary readout instance across repeated resets", () => {
    // Rebuilding it per run would allocate a Graphics on every reuse.
    const screen = new GameScreen();
    const frame = screen["frame"];
    screen.reset();
    screen.reset();
    expect(screen["frame"]).toBe(frame);
    const layers: FieldLayers = screen["layers"];
    expect(layers.layer("fieldBoundary").children).toEqual([frame]);
  });

  it("draws the boundary above every body and food layer and still beneath mob fire", () => {
    // Both halves are the point. Above the bodies is the change: the boundary
    // used to sit on ground, so a mob crossing an edge drew over the line that
    // says where the world ends. Beneath mob fire is the rule that constrains
    // how far up it could go, and ADR 0014 lets nothing occlude fire.
    for (const under of [
      "corpses",
      "mobBodies",
      "treasure",
      "graveRim",
    ] as const) {
      expect(height(under)).toBeLessThan(height("fieldBoundary"));
    }
    expect(height("fieldBoundary")).toBeLessThan(height("mobFire"));
  });
});

/**
 * The widest string the corner stack can ever show: a pinned seed at the top of
 * the roll's range, with the word every pinned line carries.
 */
const WIDEST_STACK_LINE = `SEED ${SEED_LIMIT - 1} PINNED`;

/**
 * An upper bound on a monospace advance, as a share of the font size. Common
 * monospace faces sit between 0.5 and 0.6 em, and DejaVu Sans Mono, Menlo and
 * Consolas are all at or under 0.602, so 0.62 is a bound rather than a
 * measurement.
 *
 * It is arithmetic and not a measurement because pixi cannot measure text
 * without a document, and this test environment has none. The rendered check in
 * the dispatch's verification steps is where the real read happens; this is the
 * instrument that survives a longer readout being added.
 */
const MONOSPACE_ADVANCE_MAX = 0.62;

describe("the readouts stay inside the reserve the field is fitted around", () => {
  it("fits the corner stack's widest line and the pause button inside it", () => {
    const stackWidth =
      WIDEST_STACK_LINE.length * METER_FONT_SIZE * MONOSPACE_ADVANCE_MAX;
    const stackRight = meterLinePosition(0).x + stackWidth;
    expect(stackRight).toBeLessThanOrEqual(READOUT_RESERVE.width);

    const lines = 5;
    const stackBottom = meterLinePosition(lines - 1).y + METER_FONT_SIZE * 1.5;
    expect(stackBottom).toBeLessThanOrEqual(READOUT_RESERVE.height);

    const screen = new GameScreen();
    screen.resize(1440, 900);
    const button = screen["pauseButton"];
    const halfWidth = 132 / 2;
    expect(1440 - (button.position.x + halfWidth)).toBeGreaterThanOrEqual(
      READOUT_RESERVE.margin,
    );
    expect(1440 - (button.position.x - halfWidth)).toBeLessThanOrEqual(
      READOUT_RESERVE.width,
    );
    expect(button.position.y + 68 / 2).toBeLessThanOrEqual(
      READOUT_RESERVE.height,
    );
  });
});
