/**
 * The value band ADR 0014 reserves for mob fire, held as data. Every test here
 * cites the ADR and the numbered assertion in
 * `docs/research/readability-value-band.md` section 0.4 that it implements.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { resize } from "../engine/resize/resize";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../game/field";
import { apcaLc, hsv, luma, observerLuma } from "./color";
import { BOUNDARY_STROKE, fitField } from "./layout";
import type { FireEmitter, PaletteEntry } from "./palette";
import {
  BAND_MARGIN_MIN,
  FIELD_LUMA_CEILING,
  MENU,
  MOB_FIRE,
  MOB_FIRE_BAND_MIN,
  PALETTE,
} from "./palette";

/** APCA's stated minimum for fine-detail pictograms, which is what a bullet is. */
const CORE_MIN_LC = 45;

/** APCA's stated minimum for solid, semantic non-text, which is what the field's boundary is. */
const BOUNDARY_MIN_LC = 30;

/** Assertion 9's core-to-outline span, the same 20 points as the band margin. */
const INTERNAL_SPAN_MIN = 20;

/** Assertion 10's exclusion angle, a tripwire fitted just under the tightest gap (research 7.4). */
const FIRE_HUE_EXCLUSION = 20;

/** Assertion 6 restated as a separation, because the observer scale is its own (research 7.4). */
const OBSERVER_SEPARATION_MIN = 20;

/** Two sprites are too close only when all three of these are true at once. */
const SPRITE_SEPARATION = { luma: 2.0, hue: 15, saturation: 0.25 };

/** The colours in PALETTE that are not sprites the player tells apart mid-dodge. */
const NOT_SPRITES = ["hudInk", "hudDim", "night", "nightSpeckle", "fieldFrame"];

/**
 * Every pair the sprite-separation check is allowed to fail on, each with the
 * reason it is allowed, from research 7.4. A pair without a written reason is
 * not an exception, it is a defect.
 */
const SEPARATION_EXCEPTIONS: { pair: [string, string]; because: string }[] = [
  {
    pair: ["graveRim", "stone"],
    because:
      "the rim is a large outline fixed to the grave and a headstone is a small orbiting sprite, so ADR 0014's silhouette-first rule carries them",
  },
  {
    pair: ["graveGlow", "drop"],
    because:
      "the glow is the grave wearing treasure's own colour, always at the grave's position and pulsing where a drop is steady",
  },
  {
    pair: ["feast", "belchEruption"],
    because:
      "a feast is a small steady sprite in the food layer and the eruption is a momentary full-field event two layers below it",
  },
];

const EMITTERS: FireEmitter[] = ["trash", "tear", "clod", "spiral"];

/** The backgrounds a mob-fire core can be drawn over (assertion 8). */
const BACKGROUNDS: [string, PaletteEntry][] = [
  ["night", PALETTE.night],
  ["nightSpeckle", PALETTE.nightSpeckle],
  ["fieldFrame", PALETTE.fieldFrame],
  ["graveHole", PALETTE.graveHole],
];

function paletteEntries(): [string, PaletteEntry][] {
  return Object.entries(PALETTE);
}

function fireSprites() {
  return Object.values(MOB_FIRE);
}

/** The entries mob fire names as cores, by identity rather than by hex. */
function cores(): Set<PaletteEntry> {
  return new Set(fireSprites().map((sprite) => sprite.core));
}

/** Every entry mob fire names at all: cores, bodies and outlines. */
function fireColours(): Set<PaletteEntry> {
  return new Set(
    fireSprites().flatMap((sprite) => [
      sprite.core,
      sprite.body,
      sprite.outline,
    ]),
  );
}

function nonCoreEntries(): [string, PaletteEntry][] {
  const isCore = cores();
  return paletteEntries().filter(([, entry]) => !isCore.has(entry));
}

/** The shorter way round the hue circle, in degrees. */
function hueGap(a: number, b: number): number {
  const gap = Math.abs(a - b) % 360;
  return gap > 180 ? 360 - gap : gap;
}

describe("the declared palette (ADR 0014)", () => {
  it("declares a luma that matches its hex, across PALETTE and MENU", () => {
    // Assertion 1. Without it the declared numbers drift the first time a hex
    // is nudged, and every other assertion is then checking a fiction.
    const all = [...paletteEntries(), ...Object.entries(MENU)];
    expect(all.length).toBeGreaterThan(0);
    for (const [name, entry] of all) {
      expect(`${name} ${entry.luma}`).toBe(
        `${name} ${Number(luma(entry.hex).toFixed(2))}`,
      );
      expect(Math.abs(entry.luma - luma(entry.hex))).toBeLessThan(0.05);
    }
  });

  it("declares nothing named hitFlash", () => {
    // ADR 0014 amendment 2026-08-20: retired, not re-valued. The hit announces
    // by dimming the field with mob fire and the grave's rim both spared.
    expect(PALETTE).not.toHaveProperty("hitFlash");
    expect(MENU).not.toHaveProperty("hitFlash");
  });
});

describe("the reserved band (ADR 0014)", () => {
  it("puts every mob-fire core at or above MOB_FIRE_BAND_MIN", () => {
    // Assertion 2, presence.
    const declared = [...cores()];
    expect(declared.length).toBeGreaterThan(0);
    for (const core of declared) {
      expect(core.luma).toBeGreaterThanOrEqual(MOB_FIRE_BAND_MIN);
    }
  });

  it("puts every other field colour at or below FIELD_LUMA_CEILING", () => {
    // Assertion 3, exclusivity. MENU is exempt and held so by the source scan.
    const declared = nonCoreEntries();
    expect(declared.length).toBeGreaterThan(0);
    for (const [name, entry] of declared) {
      expect(`${name} ${entry.luma <= FIELD_LUMA_CEILING}`).toBe(
        `${name} true`,
      );
    }
  });

  it("keeps at least BAND_MARGIN_MIN between the ceiling and the floor", () => {
    // Assertion 4, its own test so shrinking the margin is a deliberate edit
    // with a failing test attached rather than a side effect.
    expect(MOB_FIRE_BAND_MIN - FIELD_LUMA_CEILING).toBeGreaterThanOrEqual(
      BAND_MARGIN_MIN,
    );
  });

  it("names a core, a body and an outline for all four emitters", () => {
    // Assertion 5, coverage: exclusivity alone is satisfied by an empty band.
    expect(Object.keys(MOB_FIRE).sort()).toEqual([...EMITTERS].sort());
    for (const emitter of EMITTERS) {
      const sprite = MOB_FIRE[emitter];
      expect(sprite.core.hex).toEqual(expect.any(Number));
      expect(sprite.body.hex).toEqual(expect.any(Number));
      expect(sprite.outline.hex).toEqual(expect.any(Number));
    }
  });

  it("keeps the lowest core 20 clear of the highest non-core for a protan and a deutan observer", () => {
    // Assertion 6, restated as a separation because the observer estimate is on
    // its own scale and the two scales agree only on neutral greys (7.4).
    for (const observer of ["protan", "deutan"] as const) {
      const lowestCore = Math.min(
        ...[...cores()].map((core) => observerLuma(core.hex, observer)),
      );
      const highestOther = Math.max(
        ...nonCoreEntries().map(([, entry]) =>
          observerLuma(entry.hex, observer),
        ),
      );
      expect(lowestCore - highestOther).toBeGreaterThanOrEqual(
        OBSERVER_SEPARATION_MIN,
      );
    }
  });

  it("shares no hex between mob fire and anything else", () => {
    // Assertion 7. This is what would have caught hitFlash outright.
    const isFire = fireColours();
    const fireHexes = new Set([...isFire].map((entry) => entry.hex));
    const declared = paletteEntries();
    expect(fireHexes.size).toBeGreaterThan(0);
    expect(declared.length).toBeGreaterThan(isFire.size);
    for (const [name, entry] of declared) {
      if (isFire.has(entry)) continue;
      expect(`${name} ${fireHexes.has(entry.hex)}`).toBe(`${name} false`);
    }
  });

  it("clears APCA Lc 45 for every core against every background it draws on", () => {
    // Assertion 8. Exclusivity says fire is not confusable with other sprites;
    // it does not say fire is visible at all. APCA is signed, so the threshold
    // is on the magnitude: a near-white core on the night sky reads about -97.
    for (const core of cores()) {
      for (const [name, background] of BACKGROUNDS) {
        const lc = apcaLc(core.hex, background.hex);
        expect(`${name} ${Math.abs(lc) >= CORE_MIN_LC}`).toBe(`${name} true`);
      }
    }
  });

  it("spans at least 20 luma from each emitter's core to its outline", () => {
    // Assertion 9. A sprite carrying light against dark internally reads on a
    // background the palette never planned for.
    for (const emitter of EMITTERS) {
      const sprite = MOB_FIRE[emitter];
      expect(sprite.core.luma - sprite.outline.luma).toBeGreaterThanOrEqual(
        INTERNAL_SPAN_MIN,
      );
    }
  });

  it("keeps every non-fire hue at least 20 degrees off every mob-fire body hue", () => {
    // Assertion 10, and it is a tripwire rather than the rule: the floor was
    // fitted just under the tightest gap in the palette it checks, so a pass
    // means no new colour has walked into fire's family (7.4).
    const isFire = fireColours();
    const bodyHues = fireSprites().map((sprite) => hsv(sprite.body.hex).h);
    const declared = paletteEntries();
    expect(bodyHues.length).toBeGreaterThan(0);
    expect(declared.length).toBeGreaterThan(isFire.size);
    for (const [name, entry] of declared) {
      if (isFire.has(entry)) continue;
      const gap = Math.min(
        ...bodyHues.map((hue) => hueGap(hsv(entry.hex).h, hue)),
      );
      expect(`${name} ${gap >= FIRE_HUE_EXCLUSION}`).toBe(`${name} true`);
    }
  });

  // The emitter list above is pinned to today's four by literal, so a new
  // emitter is a deliberate edit. The gap it leaves is dated rather than
  // silent: the Undertaker's curtain arrives at dispatch 6, and until it does,
  // coverage is complete only for the emitters that exist.
  it.todo(
    "covers the Undertaker's curtain, which arrives at dispatch 6 and must redden nothing",
  );
});

describe("the field's boundary (ADR 0014)", () => {
  it("clears APCA Lc 30 against the ground it is drawn on", () => {
    // The band gives mob fire a floor and everything else a ceiling, and asks
    // of nothing else that it be visible at all. That is how this boundary sat
    // at Lc 0.00 through three gates: night is both the engine's background and
    // the field's ground, so the stroke is the whole statement of where the
    // world ends, and the grave's movement bound is that edge.
    const lc = apcaLc(PALETTE.fieldFrame.hex, PALETTE.night.hex);
    expect(Math.abs(lc)).toBeGreaterThanOrEqual(BOUNDARY_MIN_LC);
  });

  it("is drawn wide enough for the level its contrast is judged at", () => {
    // APCA grants Lc 30 to solid non-text no thinner than 5.5 rendered pixels
    // and sends anything thinner to the fine-detail level, which no colour
    // under the ceiling can reach against night. The floor and the width are
    // one rule, so a later thinning has to fail here rather than pass quietly.
    const stage = resize(390, 844, FIELD_WIDTH, FIELD_HEIGHT, false);
    const scale = fitField(stage.width, stage.height).scale;
    const cssPixelsPerStageUnit = 390 / stage.width;
    expect(
      BOUNDARY_STROKE * scale * cssPixelsPerStageUnit,
    ).toBeGreaterThanOrEqual(5.5);
  });

  it("stays clear of every mob-fire body on luma, so fire crossing it still reads in grayscale", () => {
    // The boundary is not a sprite, so sprite separation skips it, and fire
    // crosses it every time a bullet reaches an edge. A body at the frame's own
    // luma vanishes into it wherever the core and outline do not fall.
    for (const [name, sprite] of Object.entries(MOB_FIRE)) {
      const gap = Math.abs(sprite.body.luma - PALETTE.fieldFrame.luma);
      expect(`${name} ${gap >= SPRITE_SEPARATION.luma}`).toBe(`${name} true`);
    }
  });
});

describe("the standing colour bans", () => {
  it("declares no brown", () => {
    // Dark, saturated orange is the definition of brown. This closes the queued
    // dropCore check from ticket #30 by measurement rather than by eye.
    const declared = paletteEntries();
    expect(declared.length).toBeGreaterThan(0);
    for (const [name, entry] of declared) {
      const colour = hsv(entry.hex);
      const brown =
        colour.h >= 20 && colour.h < 50 && colour.s >= 0.5 && colour.v < 0.55;
      expect(`${name} ${brown}`).toBe(`${name} false`);
    }
  });
});

describe("sprite separation (research 7.4)", () => {
  it("keeps every pair of field sprites apart on luma, hue or saturation", () => {
    const collisions = spriteCollisions().filter(
      (pair) => !isExcepted(pair[0], pair[1]),
    );
    expect(collisions).toEqual([]);
  });

  it("keeps them apart across a corpse's whole fade range", () => {
    // Freshness animates corpse from its declared luma down toward nothing, so
    // it occupies a range and not a point, and any colour in its hue family
    // below that value collides at some instant of every corpse's life (7.5).
    const corpse = PALETTE.corpse;
    const shape = hsv(corpse.hex);
    const collisions = spriteEntries()
      .filter(([name]) => name !== "corpse")
      .filter(([, entry]) => {
        const other = hsv(entry.hex);
        return (
          hueGap(other.h, shape.h) < SPRITE_SEPARATION.hue &&
          Math.abs(other.s - shape.s) < SPRITE_SEPARATION.saturation &&
          entry.luma <= corpse.luma + SPRITE_SEPARATION.luma
        );
      })
      .map(([name]) => name);
    expect(collisions).toEqual([]);
  });
});

/** The PALETTE entries that are sprites the player has to tell apart mid-dodge. */
function spriteEntries(): [string, PaletteEntry][] {
  return paletteEntries().filter(([name]) => !NOT_SPRITES.includes(name));
}

function isExcepted(a: string, b: string): boolean {
  return SEPARATION_EXCEPTIONS.some(
    ({ pair, because }) =>
      because.length > 0 &&
      ((pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a)),
  );
}

/** Every pair of field sprites too close on all three axes at once. */
function spriteCollisions(): [string, string][] {
  const sprites = spriteEntries();
  const found: [string, string][] = [];
  for (let i = 0; i < sprites.length; i++) {
    for (let j = i + 1; j < sprites.length; j++) {
      const [nameA, a] = sprites[i];
      const [nameB, b] = sprites[j];
      const shapeA = hsv(a.hex);
      const shapeB = hsv(b.hex);
      if (
        Math.abs(a.luma - b.luma) < SPRITE_SEPARATION.luma &&
        hueGap(shapeA.h, shapeB.h) < SPRITE_SEPARATION.hue &&
        Math.abs(shapeA.s - shapeB.s) < SPRITE_SEPARATION.saturation
      ) {
        found.push([nameA, nameB]);
      }
    }
  }
  return found;
}

const APP = resolve(import.meta.dirname);

/** Every module that draws while the field is live. */
/**
 * What the scan can see. It reads these paths as text and does not follow
 * imports, so src/app/ui is outside it while GameScreen's END RUN button draws
 * over the live field: that gap closes at #38, when the shared widgets are
 * dressed and this list takes src/app/ui. It cannot see a texture at all, and
 * the create-pixi button art is one; only the grayscale differential can.
 */
const DRAWS_DURING_A_RUN = [
  join(APP, "screens", "game"),
  join(APP, "FpsMeter.ts"),
  join(APP, "..", "main.ts"),
];

/**
 * The three rules that have no other enforcement anywhere. The first holds the
 * menu exemption shut, or the exempt set becomes the way a bright colour gets
 * onto the field. The second closes the hole the first leaves open, since a
 * module can write a hex directly and never touch the palette. The third is the
 * only enforcement of ADR 0014's rule that mob fire draws at alpha 1.0 with no
 * blend mode, the rule that eats the whole 20-point margin when it is broken.
 */
const FORBIDDEN = [
  { rule: "reaches a MENU colour", pattern: /\bMENU\b/ },
  {
    rule: "writes a colour literal",
    pattern: /0x[0-9a-fA-F]{3,8}\b|["']#[0-9a-fA-F]{3,8}["']/,
  },
  { rule: "sets a blendMode", pattern: /\bblendMode\b/ },
];

/**
 * Every source file under a path, with tests left out. A test file draws
 * nothing during a run, so a fixture hex inside one would fail this scan for a
 * colour that never reaches the field. A missing path throws by name rather
 * than as an ENOENT, because the quiet failure to guard against is a rename
 * that leaves the scan covering less than its list claims.
 */
function typescriptFilesUnder(path: string): string[] {
  if (!existsSync(path)) {
    throw new Error(
      `scan path ${relative(APP, path)} does not exist: DRAWS_DURING_A_RUN is stale`,
    );
  }
  if (!statSync(path).isDirectory()) {
    return path.endsWith(".ts") && !/\.(test|spec)\.ts$/.test(path)
      ? [path]
      : [];
  }
  return readdirSync(path).flatMap((name) =>
    typescriptFilesUnder(join(path, name)),
  );
}

function forbiddenIn(file: string): string[] {
  const source = readFileSync(file, "utf8");
  const where = relative(APP, file);
  return FORBIDDEN.filter(({ pattern }) => pattern.test(source)).map(
    ({ rule }) => `${where} ${rule}`,
  );
}

describe("the source scan over the modules that draw during a run (ADR 0014)", () => {
  it("reaches no MENU colour, writes no colour literal, and sets no blendMode", () => {
    const files = DRAWS_DURING_A_RUN.flatMap(typescriptFilesUnder);
    expect(files.length).toBeGreaterThan(0);
    expect(files.flatMap(forbiddenIn)).toEqual([]);
  });

  it.todo(
    "covers src/app/ui, whose widgets draw over the field and are dressed at #38",
  );
});
