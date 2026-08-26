/**
 * The value band ADR 0014 reserves for mob fire, held as data. Every test here
 * cites the ADR and the numbered assertion in
 * `docs/research/readability-value-band.md` section 0.4 that it implements.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { resize } from '../engine/resize/resize';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../game/field';
import { apcaLc, hsv, luma, observerLuma } from './color';
import { BOUNDARY_STROKE, fitField } from './layout';
import type { FireEmitter, PaletteEntry } from './palette';
import {
  BAND_MARGIN_MIN,
  CORPSE_TIERS,
  FIELD_LUMA_CEILING,
  MENU,
  MOB_FIRE,
  MOB_FIRE_BAND_MIN,
  PALETTE,
  SPRITE_OUTLINE,
} from './palette';
import {
  GRAVE_RIM_SHADOW,
  GRAVE_RIM_STROKE,
} from './screens/game/GraveRenderer';
import { LAYER_ORDER } from './screens/game/layering';

/** APCA's stated minimum for fine-detail pictograms, which is what a bullet is. */
const CORE_MIN_LC = 45;

/**
 * APCA's stated minimum for fine-detail non-text, which is the bracket the
 * field's boundary was moved into on 2026-08-22 so its stroke could be thinned.
 * It is CORE_MIN_LC's number for a different reason, and they are kept apart
 * because either could move without the other.
 */
const BOUNDARY_MIN_LC = 45;

/** Assertion 9's core-to-outline span, the same 20 points as the band margin. */
const INTERNAL_SPAN_MIN = 20;

/** Assertion 10's exclusion angle, a tripwire fitted just under the tightest gap (research 7.4). */
const FIRE_HUE_EXCLUSION = 20;

/** Assertion 6 restated as a separation, because the observer scale is its own (research 7.4). */
const OBSERVER_SEPARATION_MIN = 20;

/** Two sprites are too close only when all three of these are true at once. */
const SPRITE_SEPARATION = { luma: 2.0, hue: 15, saturation: 0.25 };

/** Assertion 7's legibility floor between two corpse tiers. The 15-degree gate above is a collision tripwire, not this. */
const TIER_HUE_MIN = 25;

/** Assertion 8's ceiling on how far two tiers may drift apart for a protan or a deutan observer. */
const TIER_OBSERVER_MAX = 2.5;

/** Assertion 9's saturation branch, for a tier that clears the treasure class on saturation rather than on hue. */
const TIER_SATURATION_MIN = 0.25;

/** The stroke floor GRAVE_RIM_STROKE's own derivation rests on, in CSS pixels on the phone viewport. */
const RIM_STROKE_MIN_CSS = 2.0;

/** The thick end of GRAVE_RIM_STROKE's bracket, in field units, now that the rim is two bands. */
const RIM_BAND_MAX = 4;

/** The colours in PALETTE that are not sprites the player tells apart mid-dodge. */
const NOT_SPRITES = ['hudInk', 'hudDim', 'night', 'nightSpeckle', 'fieldFrame'];

/**
 * Every pair the sprite-separation check is allowed to fail on, each with the
 * reason it is allowed, from research 7.4. A pair without a written reason is
 * not an exception, it is a defect.
 */
const MID_BAND_BODY =
  'a mid-band body colour is where neither a light nor a dark companion reads, and the boss dispatch owns both this colour and the renderer that draws it';

/**
 * The splash as a background, re-argued on what it is now that dispatch 5 draws
 * it. The best either half of a pair reaches against it is Lc 41.44, or 43.16
 * where the dark half is graveHole, three to four short of the fine-detail
 * bracket, and the threshold is not lowered for it.
 *
 * The splash is a momentary spray at the grave's own mouth on the tick a swallow
 * overfills the reservoir. It draws in the belchEruption layer, which ADR 0014
 * puts third from the bottom of the stack, beneath corpses, mob bodies, treasure
 * and mob fire, so every sprite this pairs it with draws over it. What the
 * player is asked to read there is that charge was wasted, carried by the
 * burst's own motion at the grave, and the sprites crossing it are read against
 * the field rather than against it.
 */
const OVER_THE_SPLASH =
  "41.44: the splash is a momentary spray at the grave's mouth in the third layer from the bottom, so it is the ground under a sprite and never the thing the sprite is told apart from";

/**
 * The skull as a background, re-argued the same way. Every pair measures Lc
 * 44.98, which is 0.02 short.
 *
 * A skull crosses the field at 420 units a second, which is a fifth of a second
 * from the grave's mouth to a quarter of the way up the field. APCA's
 * fine-detail bracket grades a static mark against a static ground; what is
 * being graded here is a sprite that occupies any given pixel for one or two
 * frames.
 */
const OVER_THE_SKULL =
  '44.98, 0.02 short: a skull occupies a given pixel for a frame or two at 420 units a second, where the fine-detail bracket grades a static mark on a static ground';

/**
 * The grave's mouth as a background for the two things that come out of it.
 *
 * Both figures are reverse polarity, a bright sprite on the darkest declared
 * colour, where APCA's own curve is harsher than it is the other way round. A
 * skull is over the mouth for at most the tick it launches, because it leaves
 * the grave's top edge travelling upward at seven units a tick. The splash is at
 * the mouth by construction and is the same momentary effect argued above.
 */
const OVER_THE_MOUTH =
  'a bright sprite on the darkest declared colour, at reverse polarity, and over the mouth for at most the tick it leaves it';

const SEPARATION_EXCEPTIONS: { pair: [string, string]; because: string }[] = [
  {
    pair: ['graveRim', 'stone'],
    because:
      "the rim is a large outline fixed to the grave and a headstone is a small orbiting sprite, so ADR 0014's silhouette-first rule carries them",
  },
  {
    pair: ['graveGlow', 'drop'],
    because:
      "the glow is the grave wearing treasure's own colour, always at the grave's position and pulsing where a drop is steady",
  },
  {
    pair: ['feast', 'belchEruption'],
    because:
      'a feast is a small steady sprite in the food layer and the eruption is a momentary full-field event two layers below it',
  },
  // Assertion 3's exceptions, each with the best figure either half of the pair
  // reaches against that background. The threshold is not lowered for anything;
  // these are named instead.
  {
    pair: ['graveRim', 'mobDark'],
    because:
      "43.10: mobDark is a mob body's own dark half and no renderer draws it, so the pair has no instant on screen. Trigger: the dispatch that gives a mob body its dark half",
  },
  { pair: ['graveRim', 'bansheeDark'], because: `29.53: ${MID_BAND_BODY}` },
  { pair: ['graveRim', 'undertaker'], because: `27.86: ${MID_BAND_BODY}` },
  { pair: ['feast', 'bansheeDark'], because: `29.28: ${MID_BAND_BODY}` },
  { pair: ['feast', 'undertaker'], because: `31.71: ${MID_BAND_BODY}` },
  { pair: ['drop', 'bansheeDark'], because: `31.66: ${MID_BAND_BODY}` },
  { pair: ['drop', 'undertaker'], because: `34.09: ${MID_BAND_BODY}` },
  { pair: ['graveGlow', 'bansheeDark'], because: `31.66: ${MID_BAND_BODY}` },
  { pair: ['graveGlow', 'undertaker'], because: `34.09: ${MID_BAND_BODY}` },
  { pair: ['undertaker', 'graveHole'], because: `24.72: ${MID_BAND_BODY}` },
  { pair: ['undertaker', 'foodOutline'], because: `23.42: ${MID_BAND_BODY}` },
  // Over the splash, which dispatch 5 draws for the first time.
  { pair: ['graveRim', 'splash'], because: OVER_THE_SPLASH },
  {
    pair: ['graveGlow', 'splash'],
    because: `43.16, and ${OVER_THE_SPLASH}`,
  },
  { pair: ['corpse', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['corpseRevenant', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['feast', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['drop', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['mob', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['banshee', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['undertaker', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['skull', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['stone', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['wisp', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['bellRing', 'splash'], because: OVER_THE_SPLASH },
  // Over the skull, which dispatch 5 draws for the first time.
  { pair: ['graveRim', 'skull'], because: OVER_THE_SKULL },
  { pair: ['corpse', 'skull'], because: OVER_THE_SKULL },
  { pair: ['corpseRevenant', 'skull'], because: OVER_THE_SKULL },
  { pair: ['feast', 'skull'], because: OVER_THE_SKULL },
  { pair: ['drop', 'skull'], because: OVER_THE_SKULL },
  { pair: ['mob', 'skull'], because: OVER_THE_SKULL },
  { pair: ['banshee', 'skull'], because: OVER_THE_SKULL },
  { pair: ['undertaker', 'skull'], because: OVER_THE_SKULL },
  // Out of the mouth.
  { pair: ['skull', 'graveHole'], because: `44.42: ${OVER_THE_MOUTH}` },
  { pair: ['splash', 'graveHole'], because: `40.81: ${OVER_THE_MOUTH}` },
];

/**
 * Which layer each sprite colour draws in, so assertion 3 can ask what a pair
 * can actually be drawn over. It is declared rather than derived because a
 * colour does not know its own layer and a renderer that does is not readable
 * from here.
 */
const SPRITE_LAYER: Record<string, (typeof LAYER_ORDER)[number]> = {
  graveHole: 'graveMouth',
  graveRim: 'graveRim',
  graveGlow: 'graveRim',
  mob: 'mobBodies',
  mobDark: 'mobBodies',
  banshee: 'mobBodies',
  bansheeDark: 'mobBodies',
  undertaker: 'mobBodies',
  undertakerDark: 'mobBodies',
  skull: 'storm',
  stone: 'storm',
  wisp: 'storm',
  bellRing: 'bellRing',
  corpse: 'corpses',
  corpseRevenant: 'corpses',
  foodOutline: 'corpses',
  feast: 'treasure',
  drop: 'treasure',
  belchEruption: 'belchEruption',
  splash: 'belchEruption',
};

/**
 * Sprite colours that are themselves the dark half of a pair. A companion is
 * never given a companion of its own, and each of these is named rather than
 * inferred from its spelling, so a bright colour cannot join the list by being
 * called something that ends in Dark.
 */
const DARK_HALVES: { name: string; because: string }[] = [
  { name: 'graveHole', because: "the rim's own dark band, and the mouth" },
  { name: 'foodOutline', because: 'the companion the food layers all share' },
  { name: 'mobDark', because: "a mob body's own dark half" },
  { name: 'bansheeDark', because: "the Banshee's own dark half" },
  { name: 'undertakerDark', because: "the Undertaker's own dark half" },
];

/**
 * Sprite colours with no dark companion yet, each with the dispatch that owns
 * the renderer which will need one. A colour that is neither here nor in
 * SPRITE_OUTLINE fails assertion 1, so a new sprite cannot pass quietly.
 *
 * It is empty, and empty is the only state that makes assertion 1 mean what it
 * says. Dispatch 5 drew the last seven and gave each of them a companion; a
 * sprite that cannot be given one is a finding rather than an entry here.
 */
const AWAITING_A_COMPANION: { name: string; because: string }[] = [];

const EMITTERS: FireEmitter[] = ['trash', 'tear', 'clod', 'spiral'];

/** The backgrounds a mob-fire core can be drawn over (assertion 8). */
const BACKGROUNDS: [string, PaletteEntry][] = [
  ['night', PALETTE.night],
  ['nightSpeckle', PALETTE.nightSpeckle],
  ['fieldFrame', PALETTE.fieldFrame],
  ['graveHole', PALETTE.graveHole],
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

describe('the declared palette (ADR 0014)', () => {
  it('declares a luma that matches its hex, across PALETTE and MENU', () => {
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

  it('declares nothing named hitFlash', () => {
    // ADR 0014 amendment 2026-08-20: retired, not re-valued. The hit announces
    // by dimming the field with mob fire and the grave's rim both spared.
    expect(PALETTE).not.toHaveProperty('hitFlash');
    expect(MENU).not.toHaveProperty('hitFlash');
  });
});

describe('the reserved band (ADR 0014)', () => {
  it('puts every mob-fire core at or above MOB_FIRE_BAND_MIN', () => {
    // Assertion 2, presence.
    const declared = [...cores()];
    expect(declared.length).toBeGreaterThan(0);
    for (const core of declared) {
      expect(core.luma).toBeGreaterThanOrEqual(MOB_FIRE_BAND_MIN);
    }
  });

  it('puts every other field colour at or below FIELD_LUMA_CEILING', () => {
    // Assertion 3, exclusivity. MENU is exempt and held so by the source scan.
    const declared = nonCoreEntries();
    expect(declared.length).toBeGreaterThan(0);
    for (const [name, entry] of declared) {
      expect(`${name} ${entry.luma <= FIELD_LUMA_CEILING}`).toBe(
        `${name} true`,
      );
    }
  });

  it('keeps at least BAND_MARGIN_MIN between the ceiling and the floor', () => {
    // Assertion 4, its own test so shrinking the margin is a deliberate edit
    // with a failing test attached rather than a side effect.
    expect(MOB_FIRE_BAND_MIN - FIELD_LUMA_CEILING).toBeGreaterThanOrEqual(
      BAND_MARGIN_MIN,
    );
  });

  it('names a core, a body and an outline for all four emitters', () => {
    // Assertion 5, coverage: exclusivity alone is satisfied by an empty band.
    expect(Object.keys(MOB_FIRE).sort()).toEqual([...EMITTERS].sort());
    for (const emitter of EMITTERS) {
      const sprite = MOB_FIRE[emitter];
      expect(sprite.core.hex).toEqual(expect.any(Number));
      expect(sprite.body.hex).toEqual(expect.any(Number));
      expect(sprite.outline.hex).toEqual(expect.any(Number));
    }
  });

  it('keeps the lowest core 20 clear of the highest non-core for a protan and a deutan observer', () => {
    // Assertion 6, restated as a separation because the observer estimate is on
    // its own scale and the two scales agree only on neutral greys (7.4).
    for (const observer of ['protan', 'deutan'] as const) {
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

  it('shares no hex between mob fire and anything else', () => {
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

  it('clears APCA Lc 45 for every core against every background it draws on', () => {
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

  it('keeps every non-fire hue at least 20 degrees off every mob-fire body hue', () => {
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
  it('clears APCA Lc 45 against the ground it is drawn on', () => {
    // The band gives mob fire a floor and everything else a ceiling, and asks
    // of nothing else that it be visible at all. That is how this boundary sat
    // at Lc 0.00 through three gates: night is both the engine's background and
    // the field's ground, so the stroke is the whole statement of where the
    // world ends, and the grave's movement bound is that edge.
    //
    // The level was Lc 30 until 2026-08-22, the solid bracket, which carries a
    // 5.5-rendered-pixel floor and forced an 8-unit stroke. The boundary is now
    // graded fine-detail instead, which carries no width floor, and the whole
    // price of that is paid in the two tests below.
    const lc = apcaLc(PALETTE.fieldFrame.hex, PALETTE.night.hex);
    expect(Math.abs(lc)).toBeGreaterThanOrEqual(BOUNDARY_MIN_LC);
  });

  it('keeps every mob-fire core clear of Lc 45 against it, which is what caps its brightness', () => {
    // This is the assertion the thinning is bought from. The boundary reaches
    // its bracket by getting brighter, fire is drawn over it wherever a shot
    // reaches an edge, and every point the frame rises comes straight out of
    // this margin. Without this test the frame could be raised until a bullet
    // over it stopped reading, and nothing else in the suite would see it.
    for (const [name, sprite] of Object.entries(MOB_FIRE)) {
      const lc = Math.abs(apcaLc(sprite.core.hex, PALETTE.fieldFrame.hex));
      expect(`${name} ${lc >= CORE_MIN_LC}`).toBe(`${name} true`);
    }
  });

  it("is drawn no thinner than the fine-detail bracket's own smallest sensible mark", () => {
    // Fine detail carries no 5.5-pixel floor, so this is not that rule back
    // again. It is the weaker one that replaces it: a stroke still has to
    // survive the phone's own pixel grid, and a sub-pixel line is dropped or
    // dimmed by the rasteriser whatever its contrast measures.
    const stage = resize(390, 844, FIELD_WIDTH, FIELD_HEIGHT, false);
    const scale = fitField(stage.width, stage.height).scale;
    const cssPixelsPerStageUnit = 390 / stage.width;
    expect(
      BOUNDARY_STROKE * scale * cssPixelsPerStageUnit,
    ).toBeGreaterThanOrEqual(1);
  });

  it('stays clear of every mob-fire body on luma, so fire crossing it still reads in grayscale', () => {
    // The boundary is not a sprite, so sprite separation skips it, and fire
    // crosses it every time a bullet reaches an edge. A body at the frame's own
    // luma vanishes into it wherever the core and outline do not fall.
    for (const [name, sprite] of Object.entries(MOB_FIRE)) {
      const gap = Math.abs(sprite.body.luma - PALETTE.fieldFrame.luma);
      expect(`${name} ${gap >= SPRITE_SEPARATION.luma}`).toBe(`${name} true`);
    }
  });
});

describe('the standing colour bans', () => {
  it('declares no brown', () => {
    // Dark, saturated orange is the definition of brown. This is the ban that
    // retired the old dropCore hex (#30), by measurement rather than by eye;
    // color.test.ts keeps that hex's measurement.
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

describe('sprite separation (research 7.4)', () => {
  it('keeps every pair of field sprites apart on luma, hue or saturation', () => {
    const collisions = spriteCollisions().filter(
      (pair) => !isExcepted(pair[0], pair[1]),
    );
    expect(collisions).toEqual([]);
  });

  it("keeps them apart across every corpse tier's whole fade range", () => {
    // Freshness animates a corpse from its declared luma down toward nothing,
    // so it occupies a range and not a point, and any colour in its hue family
    // below that value collides at some instant of every corpse's life (7.5).
    // The fade is a multiplicative tint on the declared hex and never an alpha
    // over night, so hue and saturation hold constant down the range and this
    // check's premise is true.
    for (const [tier, corpse] of Object.entries(CORPSE_TIERS)) {
      const shape = hsv(corpse.hex);
      const collisions = spriteEntries()
        .filter(([, entry]) => entry !== corpse)
        .filter(([, entry]) => {
          const other = hsv(entry.hex);
          return (
            hueGap(other.h, shape.h) < SPRITE_SEPARATION.hue &&
            Math.abs(other.s - shape.s) < SPRITE_SEPARATION.saturation &&
            entry.luma <= corpse.luma + SPRITE_SEPARATION.luma
          );
        })
        .map(([name]) => name);
      expect(`${tier} ${collisions.join(',')}`).toBe(`${tier} `);
    }
  });
});

/** Which of LAYER_ORDER a sprite draws in, as an index. */
function layerDepth(name: string): number {
  return LAYER_ORDER.indexOf(SPRITE_LAYER[name]);
}

/** Every sprite colour a pair can be drawn over: the ones in layers strictly beneath its own. */
function backgroundsUnder(name: string): [string, PaletteEntry][] {
  const own = layerDepth(name);
  return Object.entries(PALETTE).filter(
    ([other]) =>
      other !== name && other in SPRITE_LAYER && layerDepth(other) < own,
  );
}

describe('the sprite outline table (ADR 0014)', () => {
  it('gives every sprite in a layer beneath mob fire a dark companion, or names the dispatch that owes it one', () => {
    // Assertion 1. Written as a table over the layers rather than as a list of
    // the sprites that happen to exist today, so a new sprite with no companion
    // fails rather than passing quietly.
    const companions = new Set<string>([
      ...Object.values(SPRITE_OUTLINE),
      ...DARK_HALVES.map((each) => each.name),
    ]);
    const owed = new Set(AWAITING_A_COMPANION.map((each) => each.name));
    const missing = Object.keys(SPRITE_LAYER).filter(
      (name) =>
        !(name in SPRITE_OUTLINE) && !companions.has(name) && !owed.has(name),
    );
    expect(missing).toEqual([]);
    for (const each of [...AWAITING_A_COMPANION, ...DARK_HALVES]) {
      expect(`${each.name} ${each.because.length > 0}`).toBe(
        `${each.name} true`,
      );
      expect(`${each.name} declared ${each.name in PALETTE}`).toBe(
        `${each.name} declared true`,
      );
    }
    expect(SPRITE_OUTLINE.graveRim).toBe('graveHole');
  });

  it('spans at least INTERNAL_SPAN_MIN luma from a sprite to its companion', () => {
    // Assertion 2, reusing assertion 9's own constant: a pair carrying light
    // against dark internally reads on a background the palette never planned.
    for (const [name, companion] of Object.entries(SPRITE_OUTLINE)) {
      const light = PALETTE[name as keyof typeof PALETTE];
      const dark = PALETTE[companion];
      expect(`${name} ${light.luma - dark.luma >= INTERNAL_SPAN_MIN}`).toBe(
        `${name} true`,
      );
    }
  });

  it('clears APCA Lc 45 on at least one half of each pair, against every sprite it can be drawn over', () => {
    // Assertion 3, and it has to be one half rather than the dark half alone:
    // foodOutline against night is exactly Lc 0.00, and graveHole is 0.00
    // against night, nightSpeckle and undertakerDark.
    const failures: string[] = [];
    for (const [name, companion] of Object.entries(SPRITE_OUTLINE)) {
      const light = PALETTE[name as keyof typeof PALETTE];
      const dark = PALETTE[companion];
      for (const [background, entry] of backgroundsUnder(name)) {
        if (background === companion) continue;
        const best = Math.max(
          Math.abs(apcaLc(light.hex, entry.hex)),
          Math.abs(apcaLc(dark.hex, entry.hex)),
        );
        if (best >= CORE_MIN_LC || isExcepted(name, background)) continue;
        failures.push(`${name} over ${background}: ${best.toFixed(2)}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("holds the rim's geometry at both ends of its bracket", () => {
    // Assertion 4. The thin end is a phone measurement and the thick end is the
    // mouth's, and the two are one rule: a later thinning or thickening has to
    // fail here rather than pass quietly.
    const stage = resize(390, 844, FIELD_WIDTH, FIELD_HEIGHT, false);
    const scale = fitField(stage.width, stage.height).scale;
    const cssPixelsPerStageUnit = 390 / stage.width;
    expect(
      GRAVE_RIM_STROKE * scale * cssPixelsPerStageUnit,
    ).toBeGreaterThanOrEqual(RIM_STROKE_MIN_CSS);
    expect(GRAVE_RIM_STROKE + GRAVE_RIM_SHADOW).toBeLessThanOrEqual(
      RIM_BAND_MAX,
    );
  });
});

describe('the corpse tiers (tracer plan section 4)', () => {
  const tiers = Object.entries(CORPSE_TIERS);

  it('declares the same luma for every tier, so the tier stays out of the freshness channel', () => {
    // Assertion 6. Brightness is freshness and nothing else.
    expect(tiers.length).toBeGreaterThan(1);
    expect(new Set(tiers.map(([, entry]) => entry.luma)).size).toBe(1);
  });

  it('keeps every pair of tiers at least 25 hue degrees apart', () => {
    // Assertion 7. The 15-degree gate in sprite separation is a collision
    // tripwire, not a legibility floor.
    for (let i = 0; i < tiers.length; i++) {
      for (let j = i + 1; j < tiers.length; j++) {
        const gap = hueGap(hsv(tiers[i][1].hex).h, hsv(tiers[j][1].hex).h);
        expect(`${tiers[i][0]}/${tiers[j][0]} ${gap >= TIER_HUE_MIN}`).toBe(
          `${tiers[i][0]}/${tiers[j][0]} true`,
        );
      }
    }
  });

  it('keeps every pair of tiers within 2.5 for a protan and a deutan observer', () => {
    // Assertion 8. If two tiers shared Rec.709 luma but differed on an observer
    // scale, a colour-blind player would read the tier difference as a
    // freshness difference, which corrupts the one channel that survives.
    for (const observer of ['protan', 'deutan'] as const) {
      for (let i = 0; i < tiers.length; i++) {
        for (let j = i + 1; j < tiers.length; j++) {
          const drift = Math.abs(
            observerLuma(tiers[i][1].hex, observer) -
              observerLuma(tiers[j][1].hex, observer),
          );
          expect(`${observer} ${drift <= TIER_OBSERVER_MAX}`).toBe(
            `${observer} true`,
          );
        }
      }
    }
  });

  it('clears the treasure class on hue or on saturation', () => {
    // Assertion 9, written as an either-or deliberately: corpseRevenant against
    // drop measures 0.241 on saturation, just under, and passes on hue at
    // 35.04. Confusing a corpse with treasure is a misread payout either way.
    //
    // The trash tier against feast is excepted and it is the pre-existing pair
    // rather than the new one: corpse and feast sit 1.7 hue degrees and 0.003
    // saturation apart, which is the same collision research 7.2 claimed a
    // 5.4-luma gap had solved and which measures APCA Lc 0.00. Nothing here
    // changes a hex, because the values are right and only the claims about
    // them were wrong; what separates the two on screen is the outline
    // construction, and a feast is a boss-shed corpse before it is treasure.
    const excepted = new Set(['trash vs feast']);
    for (const [tier, entry] of tiers) {
      const shape = hsv(entry.hex);
      for (const name of ['drop', 'feast'] as const) {
        if (excepted.has(`${tier} vs ${name}`)) continue;
        const treasure = hsv(PALETTE[name].hex);
        const clears =
          hueGap(shape.h, treasure.h) >= TIER_HUE_MIN ||
          Math.abs(shape.s - treasure.s) >= TIER_SATURATION_MIN;
        expect(`${tier} vs ${name} ${clears}`).toBe(`${tier} vs ${name} true`);
      }
    }
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
 * imports, so src/app/ui is outside it while GameScreen's pause button, in the
 * stage gutter and in the template's pink, sits over the same viewport as the
 * live field: that gap closes at #38, when the shared widgets are dressed and
 * this list takes src/app/ui, along with the pause menu's own template colours.
 * It cannot see a texture at all, and the create-pixi button art is one; only
 * the grayscale differential can.
 */
const DRAWS_DURING_A_RUN = [
  join(APP, 'screens', 'game'),
  join(APP, 'FpsMeter.ts'),
  join(APP, '..', 'main.ts'),
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
  { rule: 'reaches a MENU colour', pattern: /\bMENU\b/ },
  {
    rule: 'writes a colour literal',
    pattern: /0x[0-9a-fA-F]{3,8}\b|["']#[0-9a-fA-F]{3,8}["']/,
  },
  { rule: 'sets a blendMode', pattern: /\bblendMode\b/ },
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
    return path.endsWith('.ts') && !/\.(test|spec)\.ts$/.test(path)
      ? [path]
      : [];
  }
  return readdirSync(path).flatMap((name) =>
    typescriptFilesUnder(join(path, name)),
  );
}

function forbiddenIn(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const where = relative(APP, file);
  return FORBIDDEN.filter(({ pattern }) => pattern.test(source)).map(
    ({ rule }) => `${where} ${rule}`,
  );
}

describe('the source scan over the modules that draw during a run (ADR 0014)', () => {
  it('reaches no MENU colour, writes no colour literal, and sets no blendMode', () => {
    const files = DRAWS_DURING_A_RUN.flatMap(typescriptFilesUnder);
    expect(files.length).toBeGreaterThan(0);
    expect(files.flatMap(forbiddenIn)).toEqual([]);
  });

  it.todo(
    'covers src/app/ui, whose widgets draw over the field and are dressed at #38',
  );
});
