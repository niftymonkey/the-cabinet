/**
 * The value band ADR 0014 reserves for mob fire, held as data. Every test here
 * cites the ADR and the numbered assertion in
 * `docs/research/readability-value-band.md` section 0.4 that it implements.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';

import { resize } from '../../engine/resize/resize';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../game/field';
import { apcaLc, hsv, luma, observerLuma } from '../color';
import { BOUNDARY_STROKE, fitField } from '../layout';
import type { FireEmitter, PaletteEntry } from '../palette';
import {
  BAND_MARGIN_MIN,
  CORPSE_TIERS,
  FIELD_LUMA_CEILING,
  MENU,
  MOB_FIRE,
  MOB_FIRE_BAND_MIN,
  PALETTE,
  SPRITE_OUTLINE,
} from '../palette';
import { LAYER_ORDER } from '../screens/game/layering';

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

/**
 * The colours in PALETTE that are not sprites the player tells apart mid-dodge.
 *
 * The ground joins night and nightSpeckle here rather than beside the bodies,
 * because it is what those two were: the ground the field stands on, drawn in
 * the bottom layer under everything. The Waking's own source is on the same
 * list for the reason the design record gives it, that it is background art by
 * construction, and what holds it readable is the bespoke check below rather
 * than the pair table, exactly as the field's boundary is held.
 */
const NOT_SPRITES = [
  'hudInk',
  'hudDim',
  /**
   * The belch's ready tell, which is a readout in the HUD and no longer a band
   * on the grave: Mark ruled the blinking border off the grave on 2026-09-21,
   * and `BelchButton` is its one reader. It sits beside hudInk and hudDim,
   * which is where the readouts already are.
   */
  'graveGlow',
  'night',
  'nightSpeckle',
  'fieldFrame',
  /**
   * The prototype's own ground, which slice 8 paints over the whole field: the
   * base earth, the wide patches, the grain's two flecks, the cracks and the
   * gravel. It is what a sprite is read on and never a thing told apart from a
   * sprite mid-dodge.
   */
  'groundNight',
  'groundSpeckle',
  'groundCold',
  'groundWet',
  'groundDamp',
  'groundCrack',
  'groundGravel',
  'standInGroundDressCold',
  'standInGroundDressWet',
  'standInVigilTint',
  'standInWaking',
  'standInWakingDark',
  /**
   * The grave's own art, which slice 6 ports from the prototype: the soil
   * layers, seams, spade marks, stones, roots and washes on the cut faces, the
   * trodden margin and its crumbs, and the turf's shadow. They draw in the
   * graveMouth layer under every sprite, mostly translucent over one another,
   * and no player tells one from another mid-dodge. What a sprite drawn over
   * the grave is measured against is the two rows that stay in SPRITE_LAYER:
   * graveHole and graveWall.
   */
  /**
   * The two grass blades are here because slice 8 made them ground cover: the
   * prototype's `paintGround` draws its tufts in exactly these two rows, so the
   * grass is over the whole field rather than a sprite at the grave's lip.
   */
  'graveTurf',
  'graveTurfDark',
  'graveSoilShadow',
  'graveSubsoil',
  'graveSubsoilDark',
  'graveSubsoilDeep',
  'graveSeam',
  'graveSpadePale',
  'graveSpadeDark',
  'graveStone',
  'graveStoneShadow',
  'graveRoot',
  'graveMoonWash',
  'graveShadeWash',
  'graveNearLipShade',
  'graveCornerEdge',
  'graveMarginDark',
  'graveMarginPale',
  'graveCrumbShadow',
  'graveCrumbTop',
  'graveTurfShadow',
];

/** The ground's own colours, in the order the run meets them. */
const STAND_IN_GROUND = [
  'groundNight',
  'groundCold',
  'groundWet',
  'groundDamp',
  'standInGroundDressCold',
  'standInGroundDressWet',
  'standInVigilTint',
] as const;

/**
 * Every colour the ground's painters draw with (`groundPainting.ts`), which is
 * the whole field a sprite crosses. The two grass rows are the tufts, which are
 * the prototype's own `COLOR.moss` and `COLOR.mossDark`.
 */
const GROUND_COLOURS = [
  'groundNight',
  'groundSpeckle',
  'groundCold',
  'groundWet',
  'groundDamp',
  'groundCrack',
  'groundGravel',
  'graveTurf',
  'graveTurfDark',
] as const;

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

/**
 * The grave's own cut earth as a background (design record R4), in the
 * prototype's colours since slice 6.
 *
 * The mouth used to be one flat `graveHole`, and a hole a player can see into
 * cannot be that: the cut faces have to part from the black or the grave is
 * the empty rectangle the ticket exists to get rid of. `graveWall` is the
 * brightest earth the cut shows, the pale subsoil band at luma 29.06, drawn
 * under washes and the depth fade, so the declared value is the brightest it
 * reaches.
 *
 * It is a permanent reason and no longer a deferral. Since slice 8 the field
 * carries the prototype's own ground at luma 30.54, so the cut earth is under
 * the earth it is cut into, which is where the bracket always said it belonged.
 * Every figure below is a function of two sprite colours and the ground is not
 * a term in any of them; what the ground settles is the argument, that a sprite
 * over this colour is crossing a sloped face inside a hole and is read against
 * the field it is crossing.
 */
const OVER_THE_CUT =
  "the grave's own cut earth, a sloped face inside a hole and under the ground it is cut into, drawn beneath a wash and the depth fade, so the declared value is the brightest the wall reaches and a sprite over it is read against the field it crosses";

/**
 * Claimed ground over the grave's own art, and it is the one pair this step
 * costs that was not already owed.
 *
 * `territoryGround`'s value was solved to the tenth of a luma point against the
 * mouth, where it measures Lc 45.92 with 0.92 to spare, and a mouth a player
 * can see into spends that margin: 32.66 over the pale subsoil, in the
 * prototype's colours. The ground cannot buy it back by
 * going brighter, because a mob body sits at luma 66.63 against the band's
 * ceiling of 68, and the grave's side of the pair is the prototype's until the
 * colour decision.
 *
 * What holds the reading instead is where the pair happens. A patch is laid on
 * the open field over the densest knot of mobs ahead of the grave and the grave
 * then passes under part of it; the lit wall it can cross is about a sixth of
 * the opening across, on a grave that is a quarter of the field's width at its
 * ceiling. The patch is read by the ground it covers and never by the sliver of
 * it lying over the cut.
 */
const CLAIMED_GROUND_OVER_THE_CUT =
  'claimed ground is read by the field it covers, not by the sliver of it lying across a hole: the pair costs 2.6 points against the mouth, and neither side can buy them back (the ground is 1.4 under the band ceiling, the wall is at the ground tile it is cut into)';

/**
 * The rim is no longer drawn since slice 6, which took the prototype's grave
 * without it; its row stays until the colour decision says what becomes of it.
 */
const RIM_NOT_DRAWN =
  'the rim is not drawn since slice 6 and its row waits on the colour decision';

const SEPARATION_EXCEPTIONS: { pair: [string, string]; because: string }[] = [
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
  { pair: ['powerUp', 'bansheeDark'], because: `31.66: ${MID_BAND_BODY}` },
  { pair: ['powerUp', 'undertaker'], because: `34.09: ${MID_BAND_BODY}` },
  { pair: ['undertaker', 'graveHole'], because: `24.77: ${MID_BAND_BODY}` },
  { pair: ['undertaker', 'foodOutline'], because: `23.42: ${MID_BAND_BODY}` },
  // Over the splash, which dispatch 5 draws for the first time.
  { pair: ['graveRim', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['corpse', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['corpseRevenant', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['feast', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['powerUp', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['mob', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['banshee', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['undertaker', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['skull', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['territory', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['territoryGround', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['wisp', 'splash'], because: OVER_THE_SPLASH },
  { pair: ['bellRing', 'splash'], because: OVER_THE_SPLASH },
  // Over the skull, which dispatch 5 draws for the first time.
  { pair: ['graveRim', 'skull'], because: OVER_THE_SKULL },
  { pair: ['corpse', 'skull'], because: OVER_THE_SKULL },
  { pair: ['corpseRevenant', 'skull'], because: OVER_THE_SKULL },
  { pair: ['feast', 'skull'], because: OVER_THE_SKULL },
  { pair: ['powerUp', 'skull'], because: OVER_THE_SKULL },
  { pair: ['mob', 'skull'], because: OVER_THE_SKULL },
  { pair: ['banshee', 'skull'], because: OVER_THE_SKULL },
  { pair: ['undertaker', 'skull'], because: OVER_THE_SKULL },
  // Out of the mouth.
  { pair: ['skull', 'graveHole'], because: `44.47: ${OVER_THE_MOUTH}` },
  { pair: ['splash', 'graveHole'], because: `40.85: ${OVER_THE_MOUTH}` },
  // Over the grave's own cut earth, which slice 3 draws for the first time and
  // slice 8 settled: the field now carries the prototype's own ground, so the
  // cut earth is under the earth it is cut into and the bracket is closed.
  {
    pair: ['undertaker', 'graveWall'],
    because: `12.07: ${MID_BAND_BODY}, and ${OVER_THE_CUT}`,
  },
  {
    pair: ['skull', 'graveWall'],
    because: `31.17: ${OVER_THE_MOUTH}, and ${OVER_THE_CUT}`,
  },
  {
    pair: ['splash', 'graveWall'],
    because: `27.55: ${OVER_THE_MOUTH}, and ${OVER_THE_CUT}`,
  },
  {
    pair: ['territoryGround', 'graveWall'],
    because: `32.66: ${CLAIMED_GROUND_OVER_THE_CUT}, and ${OVER_THE_CUT}`,
  },
  // Over the grave in the prototype's colours (slice 6), each with its figure.
  {
    pair: ['graveRim', 'graveWall'],
    because: `40.13: ${RIM_NOT_DRAWN}, and ${OVER_THE_CUT}`,
  },
  { pair: ['corpse', 'graveWall'], because: `36.53: ${OVER_THE_CUT}` },
  {
    pair: ['corpseRevenant', 'graveWall'],
    because: `37.42: ${OVER_THE_CUT}`,
  },
  { pair: ['feast', 'graveWall'], because: `43.98: ${OVER_THE_CUT}` },
  { pair: ['banshee', 'graveWall'], because: `44.10: ${OVER_THE_CUT}` },
  { pair: ['territory', 'graveWall'], because: `40.36: ${OVER_THE_CUT}` },
  { pair: ['wisp', 'graveWall'], because: `42.86: ${OVER_THE_CUT}` },
  { pair: ['bellRing', 'graveWall'], because: `44.11: ${OVER_THE_CUT}` },
  { pair: ['belchEruption', 'graveWall'], because: `44.07: ${OVER_THE_CUT}` },
];

/**
 * Cut earth the top end of the grave's own bracket is allowed to fail on, each
 * with its reason.
 *
 * It is empty, and empty is what makes the check below mean what it says. The
 * prototype's subsoil was chosen under the prototype's own ground, and slice 8
 * put that ground on the field, so `graveWall` at luma 29.06 is under the base
 * earth at 30.54 and needs no exception.
 */
const CUT_EARTH_ABOVE_THE_GROUND: { name: string; because: string }[] = [];

/**
 * Colours with no hue for assertion 10 to measure. `hsv` reports hue 0 for a
 * colour with no saturation, which reads as red, and a black is not in fire's
 * family on any channel: it is luma 0 against fire bodies at 43 and up.
 */
const NO_HUE_AT_ALL: { name: string; because: string }[] = [
  {
    name: 'graveHole',
    because:
      "the prototype's pit is pure black (slice 6), whose hue is undefined",
  },
];

/**
 * Which layer each sprite colour draws in, so assertion 3 can ask what a pair
 * can actually be drawn over. It is declared rather than derived because a
 * colour does not know its own layer and a renderer that does is not readable
 * from here.
 */
const SPRITE_LAYER: Record<string, (typeof LAYER_ORDER)[number]> = {
  graveHole: 'graveMouth',
  graveWall: 'graveMouth',
  graveRim: 'graveRim',
  mob: 'mobBodies',
  mobDark: 'mobBodies',
  banshee: 'mobBodies',
  bansheeDark: 'mobBodies',
  undertaker: 'mobBodies',
  undertakerDark: 'mobBodies',
  skull: 'storm',
  territory: 'storm',
  territoryGround: 'storm',
  wisp: 'storm',
  bellRing: 'bellRing',
  corpse: 'corpses',
  corpseRevenant: 'corpses',
  foodOutline: 'corpses',
  feast: 'treasure',
  powerUp: 'treasure',
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
  {
    name: 'graveWall',
    because:
      'the cut earth inside the mouth, whose bright counterpart is the rim above it; it is capped below the ground it is cut into at luma 30.54, and a companion the 20 luma beneath it that the span asks for would be the black the cut already falls away into',
  },
  {
    name: 'graveTurf',
    because:
      "ground cover over the whole field since slice 8, drawn as the prototype's own tufts at alpha 0.7 so the earth shows through; it is the ground a sprite is read on and not a thing told apart from one, so it has no bright half to companion",
  },
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

/**
 * The backgrounds a mob-fire core can be drawn over (assertion 8). The
 * stand-in ground joined it when the ground was first drawn: fire crosses the
 * dressing and the Waking's own body every run, and the whole reason the art is
 * imported grayscale is so a check like this one binds on it.
 */
const BACKGROUNDS: [string, PaletteEntry][] = [
  ['night', PALETTE.night],
  ['nightSpeckle', PALETTE.nightSpeckle],
  ['fieldFrame', PALETTE.fieldFrame],
  ['graveHole', PALETTE.graveHole],
  ...GROUND_COLOURS.map((name): [string, PaletteEntry] => [
    name,
    PALETTE[name],
  ]),
  ['standInGroundDressCold', PALETTE.standInGroundDressCold],
  ['standInGroundDressWet', PALETTE.standInGroundDressWet],
  ['standInVigilTint', PALETTE.standInVigilTint],
  ['standInWaking', PALETTE.standInWaking],
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
      if (NO_HUE_AT_ALL.some((each) => each.name === name)) continue;
      const gap = Math.min(
        ...bodyHues.map((hue) => hueGap(hsv(entry.hex).h, hue)),
      );
      expect(`${name} ${gap >= FIRE_HUE_EXCLUSION}`).toBe(`${name} true`);
    }
  });

  it("covers the Undertaker's curtain, which draws in the clod emitter and reddens nothing", () => {
    // The gap the list above dated. `clod` was declared for a curtain nothing
    // threw, so its place in the literal proved nothing about the game; the
    // Undertaker has thrown curtains since the boss slice and they draw in
    // their own kind since the renderer slice, so the entry has a drawer now
    // and the band's own relations are asked of it by name.
    const curtain = MOB_FIRE.clod;
    expect(EMITTERS).toContain('clod');
    expect(curtain.core.luma).toBeGreaterThanOrEqual(MOB_FIRE_BAND_MIN);
    expect(curtain.body.luma).toBeLessThanOrEqual(FIELD_LUMA_CEILING);
    expect(curtain.outline.luma).toBeLessThanOrEqual(FIELD_LUMA_CEILING);
    expect(curtain.core.luma - curtain.outline.luma).toBeGreaterThanOrEqual(
      INTERNAL_SPAN_MIN,
    );

    // A curtain leaves the body of the boss throwing it and falls across him,
    // and a boss body is a background BACKGROUNDS does not carry: that list was
    // written before anything drew a boss. Assertion 8's own threshold, on the
    // one pair the curtain adds.
    const thrower: [string, PaletteEntry][] = [
      ['undertaker', PALETTE.undertaker],
      ['undertakerDark', PALETTE.undertakerDark],
    ];
    for (const [name, background] of thrower) {
      const lc = apcaLc(curtain.core.hex, background.hex);
      expect(`${name} ${Math.abs(lc) >= CORE_MIN_LC}`).toBe(`${name} true`);
    }
  });
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
    // retired the old powerUpCore hex (#30), by measurement rather than by eye;
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
  it('parts claimed ground from a mob body on luma and on saturation, not on hue alone', () => {
    // The pair check below passes on any one channel, and hue alone is what
    // claimed ground passed on while it wore the charge arc's colour: that
    // colour is chosen to part from the grave's rim, and out on the field it
    // landed among mob bodies and revenant moss. A hue-only assertion held
    // while the ground could not be read at all, so the ground is held to all
    // three channels and a green can never come back to it.
    const ground = PALETTE.territoryGround;
    const shape = hsv(ground.hex);
    for (const name of ['mob', 'corpseRevenant'] as const) {
      const green = PALETTE[name];
      const other = hsv(green.hex);
      const apart = {
        luma: Math.abs(ground.luma - green.luma) >= SPRITE_SEPARATION.luma,
        hue: hueGap(shape.h, other.h) >= SPRITE_SEPARATION.hue,
        saturation: Math.abs(shape.s - other.s) >= SPRITE_SEPARATION.saturation,
      };
      expect(`${name} ${JSON.stringify(apart)}`).toBe(
        `${name} {"luma":true,"hue":true,"saturation":true}`,
      );
    }
  });

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

/**
 * Which of LAYER_ORDER a sprite draws in, as an index.
 *
 * A sprite this table does not place is a bug in the table, and it fails loudly
 * here: a depth of -1 puts every other sprite above it, so backgroundsUnder
 * hands back nothing and a contrast check over that empty set passes while
 * checking no pair at all.
 */
function layerDepth(name: string): number {
  const layer = SPRITE_LAYER[name];
  const depth = layer === undefined ? -1 : LAYER_ORDER.indexOf(layer);
  if (depth === -1) {
    throw new Error(`${name} is in no layer SPRITE_LAYER names`);
  }
  return depth;
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
});

describe('the corpse tiers (tracer plan section 4)', () => {
  const tiers = Object.entries(CORPSE_TIERS);

  /** The tier at this index, for a loop bounded by tiers.length. */
  const tierAt = (index: number): (typeof tiers)[number] => {
    const tier = tiers[index];
    if (tier === undefined) throw new Error(`no tier at index ${index}`);
    return tier;
  };

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
        const gap = hueGap(hsv(tierAt(i)[1].hex).h, hsv(tierAt(j)[1].hex).h);
        expect(`${tierAt(i)[0]}/${tierAt(j)[0]} ${gap >= TIER_HUE_MIN}`).toBe(
          `${tierAt(i)[0]}/${tierAt(j)[0]} true`,
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
            observerLuma(tierAt(i)[1].hex, observer) -
              observerLuma(tierAt(j)[1].hex, observer),
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
    // power-up measures 0.241 on saturation, just under, and passes on hue at
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
      for (const name of ['powerUp', 'feast'] as const) {
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
      const entryA = sprites[i];
      const entryB = sprites[j];
      if (entryA === undefined || entryB === undefined) {
        throw new Error('sprite index out of range');
      }
      const [nameA, a] = entryA;
      const [nameB, b] = entryB;
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

const APP = resolve(import.meta.dirname, '..');

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
  join(APP, 'cornerReadout.ts'),
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

/** The modules that draw the ground, which the scan above must reach. */
const GROUND_MODULES = [
  join(APP, 'screens', 'game', 'BackgroundRenderer.ts'),
  join(APP, 'screens', 'game', 'groundDressing.ts'),
  join(APP, 'screens', 'game', 'groundPainting.ts'),
];

/** Every PALETTE entry a module names, read out of its source. */
const paletteNamesIn = (file: string): string[] => {
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(/\bPALETTE\.([A-Za-z0-9_]+)/g)].map((match) => {
    const name = match[1];
    if (name === undefined) {
      throw new Error('PALETTE-reference regex matched with no captured name');
    }
    return name;
  });
};

describe('the stand-in ground (ADR 0049, decision 22, #38)', () => {
  it("puts the Vigil's departure in the hue band the readability record records as empty", () => {
    // Spec 59. `docs/research/readability-value-band.md` section 7.5, quoted in
    // #38's second comment: "hue 50 to 125 and 175 to 205 are entirely empty."
    // Neither half is empty of every colour today: territory sits at hue 100.56
    // in the first and reservoirCharge at 199.79 in the second. What the two
    // named clearances below hold is what the band was recorded for, that no
    // sprite crowds the departure, and a readout in a fixed corner is not one.
    const hue = hsv(PALETTE.standInVigilTint.hex).h;
    expect(`${hue.toFixed(2)} in band ${hue >= 175 && hue <= 205}`).toBe(
      `${hue.toFixed(2)} in band true`,
    );
    for (const name of ['wisp', 'skull'] as const) {
      const gap = hueGap(hue, hsv(PALETTE[name].hex).h);
      expect(`${name} ${gap >= SPRITE_SEPARATION.hue}`).toBe(`${name} true`);
    }
  });

  it("gives the departure the highest saturation of the ground's own colours, so the addition is the event", () => {
    // Downwell's move, from the design record's section 7: two sections on the
    // base palette with dressing changes only, and the fourth colour held back.
    const saturations = STAND_IN_GROUND.map((name) => hsv(PALETTE[name].hex).s);
    const departure = hsv(PALETTE.standInVigilTint.hex).s;
    expect(`${Math.max(...saturations) === departure}`).toBe('true');
  });

  it('draws every colour of the ground from a declared palette entry', () => {
    // Spec 60. The scan below forbids a colour literal in these modules, and
    // this is its other half: a name that is not an entry cannot compile, but a
    // module that reached MENU or named nothing at all would pass the scan
    // while drawing a colour the band never measured.
    const named = GROUND_MODULES.flatMap(paletteNamesIn);
    expect(named.length).toBeGreaterThan(0);
    expect(named.filter((name) => !(name in PALETTE))).toEqual([]);
  });

  it('is inside the source scan, so the ground cannot write a colour of its own', () => {
    // Fence 114. The scan walks a folder, so a new renderer joins it by
    // existing; what can go wrong is the folder, and this says the two files
    // are in the list the scan actually built.
    const files = DRAWS_DURING_A_RUN.flatMap(typescriptFilesUnder);
    for (const module of GROUND_MODULES) expect(files).toContain(module);
    expect(GROUND_MODULES.flatMap(forbiddenIn)).toEqual([]);
  });

  it("keeps the Waking's source apart from every ground colour it drifts over", () => {
    // The source is background art by construction (decision 25 puts it on the
    // ground layer), so the sprite pair table does not cover it and this does.
    // It is the brightest thing the ground layer draws, because it is the
    // loudest beat in the run, and it carries its own dark companion out past
    // its body so it reads against the dressing as well as against the tile.
    const source = PALETTE.standInWaking;
    for (const name of STAND_IN_GROUND) {
      const gap = source.luma - PALETTE[name].luma;
      expect(`${name} ${gap >= SPRITE_SEPARATION.luma}`).toBe(`${name} true`);
    }
    expect(source.luma - PALETTE.standInWakingDark.luma).toBeGreaterThanOrEqual(
      INTERNAL_SPAN_MIN,
    );
  });
});

/**
 * Every colour the prototype's grave painters draw with, as the prototype
 * writes it: `SOIL`'s stops, `COLOR.moss` and `COLOR.mossDark`, and the RGB of
 * each `rgba()` its painters build (build 7,
 * `apps/hungry-grave/src/prototypes/grave-fall/index.html` on
 * `prototype/148-grave-fall`, lines 643 to 1051).
 */
const PROTOTYPE_GRAVE_COLOURS: Record<string, number> = {
  graveHole: 0x000000,
  graveWall: 0x414b5c,
  graveTurf: 0x6e8a58,
  graveTurfDark: 0x4a6040,
  graveSoilShadow: 0x232a38,
  graveSubsoil: 0x333c4b,
  graveSubsoilDark: 0x212834,
  graveSubsoilDeep: 0x080b10,
  graveSeam: 0x05080c,
  graveSpadePale: 0x889ab4,
  graveSpadeDark: 0x06090f,
  graveStone: 0x68768a,
  graveStoneShadow: 0x04070b,
  graveRoot: 0x7a8272,
  graveMoonWash: 0x8498b6,
  graveShadeWash: 0x030509,
  graveNearLipShade: 0x020408,
  graveCornerEdge: 0x020306,
  graveMarginDark: 0x202731,
  graveMarginPale: 0x37404e,
  graveCrumbShadow: 0x1a2029,
  graveCrumbTop: 0x5e6a7c,
  graveTurfShadow: 0x020407,
};

/**
 * Every colour the prototype's ground painters draw with, as the prototype
 * writes it: the rows of `COLOR` that `paintGround` reads (build 7,
 * `apps/hungry-grave/src/prototypes/grave-fall/index.html` on
 * `prototype/148-grave-fall`, lines 308 to 326 and 1364 to 1474).
 *
 * `COLOR.moss` and `COLOR.mossDark` are not repeated here. They are the tufts'
 * own colours and PROTOTYPE_GRAVE_COLOURS already pins them as `graveTurf` and
 * `graveTurfDark`, which is the point: one grass, one pair of rows.
 */
const PROTOTYPE_GROUND_COLOURS: Record<string, number> = {
  groundNight: 0x454f5d,
  groundSpeckle: 0x66748a,
  groundCold: 0x56657a,
  groundWet: 0x466050,
  groundDamp: 0x2c3644,
  groundCrack: 0x28313d,
  groundGravel: 0x8d9cae,
};

/**
 * Every pair of a sprite and a ground colour the three-channel check is allowed
 * to fail on, with the reason it is allowed. A pair without a written reason is
 * not an exception, it is a defect.
 *
 * There is one, and it is the single place in slice 8 where the ruling's own
 * "a sprite that fails is fixed, never excepted" cannot be honoured: both
 * halves of the pair are frozen by a Mark ruling, the grave's by slice 6 and
 * the ground's by slice 8, so neither colour can move.
 */
const GROUND_COLLISIONS: { pair: [string, string]; because: string }[] = [
  {
    pair: ['graveWall', 'groundNight'],
    because:
      "luma 1.48, hue 2.8, saturation 0.035: the cut earth's brightest band is the ground's own earth seen in section, which is what it is meant to be, and what tells the wall from the ground is the black beside it and the lip above it rather than its own value",
  },
];

/**
 * What the best half of each sprite pair reads against every colour the ground
 * draws, in APCA Lc.
 *
 * It is a measurement and not a threshold. Its promise is that no sprite colour
 * and no ground colour can move without a number moving with it, which is what
 * makes the cost of a ground decision visible in a diff instead of in a
 * screenshot nobody takes. Slice 8 is where these figures first exist: over the
 * near-black tile the field used to carry, a corpse read Lc 47.04 where it now
 * reads 35.21 over the base earth.
 */
const SPRITE_OVER_THE_GROUND: Record<string, string> = {
  graveRim:
    'groundNight 38.82, groundSpeckle 31.16, groundCold 30.43, groundWet 34.31, groundDamp 46.92, groundCrack 48.23, groundGravel 50.13, graveTurf 38.03, graveTurfDark 34.40',
  corpse:
    'groundNight 35.21, groundSpeckle 29.38, groundCold 26.83, groundWet 30.71, groundDamp 43.32, groundCrack 44.63, groundGravel 48.35, graveTurf 36.25, graveTurfDark 30.79',
  corpseRevenant:
    'groundNight 36.11, groundSpeckle 29.38, groundCold 27.73, groundWet 31.60, groundDamp 44.21, groundCrack 45.52, groundGravel 48.35, graveTurf 36.25, graveTurfDark 31.69',
  feast:
    'groundNight 42.67, groundSpeckle 29.38, groundCold 34.29, groundWet 38.16, groundDamp 50.77, groundCrack 52.09, groundGravel 48.35, graveTurf 36.25, graveTurfDark 38.25',
  powerUp:
    'groundNight 45.05, groundSpeckle 30.14, groundCold 36.67, groundWet 40.55, groundDamp 53.16, groundCrack 54.47, groundGravel 48.35, graveTurf 36.25, graveTurfDark 40.63',
  mob: 'groundNight 46.69, groundSpeckle 31.78, groundCold 38.31, groundWet 42.18, groundDamp 54.79, groundCrack 56.10, groundGravel 48.35, graveTurf 36.25, graveTurfDark 42.27',
  banshee:
    'groundNight 42.79, groundSpeckle 29.38, groundCold 34.41, groundWet 38.28, groundDamp 50.89, groundCrack 52.21, groundGravel 48.35, graveTurf 36.25, graveTurfDark 38.37',
  undertaker:
    'groundNight 13.53, groundSpeckle 29.38, groundCold 22.60, groundWet 18.47, groundDamp 18.25, groundCrack 19.57, groundGravel 48.35, graveTurf 36.25, graveTurfDark 18.37',
  skull:
    'groundNight 29.86, groundSpeckle 29.38, groundCold 22.60, groundWet 25.35, groundDamp 37.96, groundCrack 39.27, groundGravel 48.35, graveTurf 36.25, graveTurfDark 25.43',
  territory:
    'groundNight 39.04, groundSpeckle 29.38, groundCold 30.66, groundWet 34.54, groundDamp 47.15, groundCrack 48.46, groundGravel 48.35, graveTurf 36.25, graveTurfDark 34.62',
  territoryGround:
    'groundNight 31.35, groundSpeckle 29.38, groundCold 22.97, groundWet 26.84, groundDamp 39.45, groundCrack 40.76, groundGravel 48.35, graveTurf 36.25, graveTurfDark 26.93',
  wisp: 'groundNight 41.55, groundSpeckle 29.38, groundCold 33.17, groundWet 37.04, groundDamp 49.66, groundCrack 50.97, groundGravel 48.35, graveTurf 36.25, graveTurfDark 37.13',
  bellRing:
    'groundNight 42.79, groundSpeckle 29.38, groundCold 34.41, groundWet 38.29, groundDamp 50.90, groundCrack 52.21, groundGravel 48.35, graveTurf 36.25, graveTurfDark 38.37',
  belchEruption:
    'groundNight 42.76, groundSpeckle 29.38, groundCold 34.38, groundWet 38.25, groundDamp 50.87, groundCrack 52.18, groundGravel 48.35, graveTurf 36.25, graveTurfDark 38.34',
  splash:
    'groundNight 26.24, groundSpeckle 29.38, groundCold 22.60, groundWet 21.73, groundDamp 34.34, groundCrack 35.65, groundGravel 48.35, graveTurf 36.25, graveTurfDark 21.82',
};

describe('the ground in the field (design record R4)', () => {
  it("the ground's colours are the prototype's", () => {
    // Mark's ruling of 2026-09-21: the prototype's ground goes on the whole
    // field, its colours included, and a colour decision comes after he has
    // seen it.
    const declared = Object.fromEntries(
      Object.keys(PROTOTYPE_GROUND_COLOURS).map((name) => [
        name,
        PALETTE[name as keyof typeof PALETTE]?.hex,
      ]),
    );
    expect(declared).toEqual(PROTOTYPE_GROUND_COLOURS);
  });

  it('keeps every sprite apart from every colour the ground draws', () => {
    // The ground is not a sprite, so the pair table above does not reach it,
    // and since slice 8 it is nine colours over the whole field rather than one
    // near-black tile. This is that table's own three-channel rule, asked of
    // every sprite against every one of them.
    const failures: string[] = [];
    for (const [name, entry] of spriteEntries()) {
      const sprite = hsv(entry.hex);
      for (const ground of GROUND_COLOURS) {
        const earth = hsv(PALETTE[ground].hex);
        const tooClose =
          Math.abs(entry.luma - PALETTE[ground].luma) <
            SPRITE_SEPARATION.luma &&
          hueGap(sprite.h, earth.h) < SPRITE_SEPARATION.hue &&
          Math.abs(sprite.s - earth.s) < SPRITE_SEPARATION.saturation;
        const named = GROUND_COLLISIONS.some(
          ({ pair, because }) =>
            because.length > 0 && pair[0] === name && pair[1] === ground,
        );
        if (tooClose && !named) failures.push(`${name} over ${ground}`);
      }
    }
    expect(failures).toEqual([]);

    // And the exception is a real pair rather than a name nobody measures.
    for (const { pair } of GROUND_COLLISIONS) {
      expect(`${pair[0]} declared ${pair[0] in PALETTE}`).toBe(
        `${pair[0]} declared true`,
      );
      expect(
        `${pair[1]} in the ground ${GROUND_COLOURS.includes(pair[1] as (typeof GROUND_COLOURS)[number])}`,
      ).toBe(`${pair[1]} in the ground true`);
    }
  });

  it('records what every sprite reads over the ground it is drawn on', () => {
    const measured = Object.fromEntries(
      Object.entries(SPRITE_OUTLINE).map(([name, companion]) => {
        const light = PALETTE[name as keyof typeof PALETTE];
        const dark = PALETTE[companion];
        return [
          name,
          GROUND_COLOURS.map((ground) => {
            const over = PALETTE[ground].hex;
            const best = Math.max(
              Math.abs(apcaLc(light.hex, over)),
              Math.abs(apcaLc(dark.hex, over)),
            );
            return `${ground} ${best.toFixed(2)}`;
          }).join(', '),
        ];
      }),
    );
    expect(measured).toEqual(SPRITE_OVER_THE_GROUND);
  });
});

describe('the grave in the ground (design record R4)', () => {
  it("the grave's colours are the prototype's", () => {
    // Slice 6: Mark ruled the grave is the prototype's picture exactly, and a
    // colour decision comes after he has seen it (2026-09-21).
    const declared = Object.fromEntries(
      Object.keys(PROTOTYPE_GRAVE_COLOURS).map((name) => [
        name,
        PALETTE[name as keyof typeof PALETTE]?.hex,
      ]),
    );
    expect(declared).toEqual(PROTOTYPE_GRAVE_COLOURS);
  });

  it('keeps the cut earth under the ground it is cut into, and clear of the black behind it', () => {
    // The two ends of the bracket that decided the value, and they are one
    // rule: earth cut to face sideways keeps less moon than earth lying face
    // up, and a face the player cannot tell from the mouth's own black is the
    // empty rectangle this step exists to get rid of.
    //
    // The ground it is cut into is the field's own base earth, which slice 8
    // took from the prototype. The top end was excepted while the field kept a
    // near-black tile under the prototype's grave; the exception table is empty
    // now, so both ends bind.
    const underTheGround = PALETTE.graveWall.luma <= PALETTE.groundNight.luma;
    const excepted = CUT_EARTH_ABOVE_THE_GROUND.some(
      ({ name, because }) => name === 'graveWall' && because.length > 0,
    );
    expect(`graveWall ${underTheGround || excepted}`).toBe('graveWall true');
    expect(
      PALETTE.graveWall.luma - PALETTE.graveHole.luma,
    ).toBeGreaterThanOrEqual(SPRITE_SEPARATION.luma);
  });

  it('keeps the turf apart from the ground it lies on by hue, because value cannot carry it', () => {
    // The turf is capped by the food layer clearing Lc 45 over it, which puts
    // it inside two luma points of the ground tile and leaves nothing for the
    // value channel. Hue is what is left, so it is the thing that has to hold,
    // and it is the reason the colour is a grey-green rather than a grey.
    const turf = hsv(PALETTE.graveTurf.hex);
    for (const name of STAND_IN_GROUND) {
      const gap = hueGap(turf.h, hsv(PALETTE[name].hex).h);
      expect(`${name} ${gap >= SPRITE_SEPARATION.hue}`).toBe(`${name} true`);
    }
  });
});

/**
 * The stand-in art the grayscale import writes (`scripts/grayscale-import.ts`).
 * Only this folder: the create-pixi UI art under raw-assets/main{m} is not pixel
 * art and carries its own colour on purpose, so a fence over the whole of
 * raw-assets would be a fence over a rule nobody made.
 */
const STAND_IN_ART = resolve(APP, '..', '..', 'raw-assets', 'standIn{m}');

/** Every PNG under a path, including the ones in its subfolders. */
const pngsUnder = (path: string): string[] => {
  if (!existsSync(path)) {
    throw new Error(
      `${relative(APP, path)} does not exist: nothing has been imported`,
    );
  }
  if (!statSync(path).isDirectory()) return path.endsWith('.png') ? [path] : [];
  return readdirSync(path).flatMap((name) => pngsUnder(join(path, name)));
};

/**
 * A grayscale pixel is one whose three channels agree, which `hsv` reports as
 * saturation zero. Reading it through the app's own colour module rather than
 * comparing bytes here is what makes this fence measure the same quantity every
 * other test in this file measures.
 */
const huedPixelsIn = (file: string): string[] => {
  const image = PNG.sync.read(readFileSync(file));
  const hued: number[] = [];
  for (let at = 0; at < image.data.length; at += 4) {
    const r = image.data[at];
    const g = image.data[at + 1];
    const b = image.data[at + 2];
    if (r === undefined || g === undefined || b === undefined) {
      throw new Error(`pixel byte ${at} is past the end of a 4-byte row`);
    }
    const hex = (r << 16) | (g << 8) | b;
    if (hsv(hex).s > 0) hued.push(at / 4);
  }
  if (hued.length === 0) return [];
  const first = hued[0];
  if (first === undefined) throw new Error('no first hued pixel');
  const where = `(${first % image.width}, ${Math.floor(first / image.width)})`;
  return [
    `${relative(STAND_IN_ART, file)}: ${hued.length} pixels carry a hue, the first at ${where}`,
  ];
};

/** The top of an eight-bit channel, which the stretched art's body reaches. */
const FULL_RANGE = 255;

/**
 * The share of a sprite's own pixels the stretch puts at the top, which is the
 * import's own row (`scripts/grayscale-import.ts`). Held here at the same value
 * because what the fence measures is the property the stretch exists for: the
 * body of the art reaching the range, not one specular pixel doing it.
 */
const STRETCH_PERCENTILE = 0.98;

/** The grey at the stretch's own percentile of a file's opaque pixels. */
const bodyGreyIn = (file: string): number => {
  const image = PNG.sync.read(readFileSync(file));
  const greys: number[] = [];
  for (let at = 0; at < image.data.length; at += 4) {
    if (image.data[at + 3] === 0) continue;
    const grey = image.data[at];
    if (grey === undefined) throw new Error(`pixel byte ${at} is out of range`);
    greys.push(grey);
  }
  if (greys.length === 0) return 0;
  greys.sort((first, second) => first - second);
  const grey =
    greys[
      Math.min(greys.length - 1, Math.floor(greys.length * STRETCH_PERCENTILE))
    ];
  if (grey === undefined) throw new Error('no grey at the stretch percentile');
  return grey;
};

describe('the grayscale import over the stand-in art (#38, ADR 0014)', () => {
  it('leaves no pixel with a hue in any sprite or tile it staged', () => {
    // The source scan above reads modules for hex literals and cannot see a
    // texture, and a PixiJS tint multiplies and so cannot move a hue. The purple
    // and brown bans would therefore be unguarded on exactly the art they were
    // written for unless something reads the pixels, and this is that test.
    const files = pngsUnder(STAND_IN_ART);
    expect(files.length).toBeGreaterThan(0);
    expect(files.flatMap(huedPixelsIn)).toEqual([]);
  });

  it('leaves every sprite and tile reaching the top of the value range, so a tint is a colour', () => {
    // A PixiJS tint multiplies, so the palette entry is a ceiling and never a
    // value: what draws is the art's own grey times the entry. The staged pack
    // is a dark one and most of it peaked at 17 to 72 of 255, which put the
    // whole ground two luma points off night whatever entry it wore, and the
    // rendered check at slice 13b is what saw it. Stretching each file on
    // import is what makes "coloured only by its palette entry" true rather
    // than an intention: at the top of its own range a sprite's brightest
    // surface is the entry, and everything under it is that colour's own
    // shading. It is the body of the art and never its brightest pixel,
    // because a pack puts a handful of speculars at the top and stretching to
    // those leaves the body exactly where it was.
    const dim = pngsUnder(STAND_IN_ART).flatMap((file) => {
      const body = bodyGreyIn(file);
      return body === FULL_RANGE
        ? []
        : [`${relative(STAND_IN_ART, file)}: its body reaches only ${body}`];
    });
    expect(dim).toEqual([]);
  });
});
