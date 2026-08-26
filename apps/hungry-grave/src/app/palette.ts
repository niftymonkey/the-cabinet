// Every colour the game draws, each declared with the luma it measures.

/**
 * The declared luma is what makes the value band ADR 0014 reserves for mob fire
 * data a unit test can hold rather than something only a screenshot can see.
 */
interface PaletteEntry {
  readonly hex: number;
  readonly luma: number;
}

// Only a mob-fire core may sit at or above this luma.
const MOB_FIRE_BAND_MIN = 88;

// Every other field colour sits at or below this luma.
const FIELD_LUMA_CEILING = 68;

// The floor under the gap between the two, stated as a floor and not derived.
const BAND_MARGIN_MIN = 20;

/**
 * Every colour drawn while the field is live, the readouts over it included
 * (ADR 0014).
 *
 * The table is derived and pinned in
 * `docs/research/readability-value-band.md` section 7. It is not this module's
 * to choose, and the declared lumas are written out rather than computed so the
 * test has something independent to check the hexes against.
 */
const PALETTE = {
  // the night field
  night: { hex: 0x0e1119, luma: 6.64 },
  nightSpeckle: { hex: 0x1d2434, luma: 13.99 },
  /**
   * The field's boundary. Re-valued on 2026-08-22 from luma 48.63, when the
   * stroke moved from APCA's solid bracket to its fine-detail one and stopped
   * needing a 5.5-pixel width to be graded at all.
   *
   * The window it sits in is about 1.3 luma points wide and three assertions
   * close it from both sides: below luma 62.0 a mob-fire body comes within the
   * 2.0-luma separation, above luma 63.3 a mob-fire core stops clearing APCA
   * Lc 45 against it, and below Lc 45 against night the stroke falls out of the
   * fine-detail bracket and needs its old width back. The colour is therefore
   * close to forced rather than chosen. The reasoning is in ADR 0014 and in
   * research 7.6.
   */
  fieldFrame: { hex: 0x8fa0c7, luma: 62.43 },

  // the grave
  graveHole: { hex: 0x04060b, luma: 2.33 },
  graveRim: { hex: 0x93a7bd, luma: 64.45 },
  graveGlow: { hex: 0xd8a941, luma: 67.25 },

  // mobs
  mob: { hex: 0x59c964, luma: 66.63 },
  mobDark: { hex: 0x1d4a26, luma: 24.25 },
  banshee: { hex: 0x98b2a7, luma: 67.32 },
  bansheeDark: { hex: 0x3f7a68, luma: 42.41 },
  undertaker: { hex: 0x5d6b80, luma: 41.39 },
  undertakerDark: { hex: 0x232b38, luma: 16.56 },

  // mob fire
  fireCore: { hex: 0xffece6, luma: 93.96 },
  fireTrash: { hex: 0xff4a3d, luma: 43.74 },
  fireTear: { hex: 0xff6a55, luma: 53.4 },
  fireClod: { hex: 0xf5563d, luma: 46.27 },
  fireSpiral: { hex: 0xff8248, luma: 59.76 },
  fireOutline: { hex: 0x1a0906, luma: 4.86 },

  // player fire
  skull: { hex: 0x8496a6, luma: 57.78 },
  stone: { hex: 0x9aa4ad, luma: 63.73 },
  wisp: { hex: 0x63b8ad, luma: 64.76 },
  bellRing: { hex: 0x9faebd, luma: 67.41 },

  // food and treasure
  corpse: { hex: 0xa29e92, luma: 61.95 },
  /**
   * The revenant's corpse tier. Corpse size is constant across mob types, so
   * payout is unreadable without a hue, and brightness is spoken for by
   * freshness: every tier declares the same luma, which keeps the tier out of
   * the freshness channel entirely.
   *
   * A moss green-yellow at hue 76.4 and saturation 0.458. The number that
   * decided it is the observer one: protan 62.57 against corpse's 61.62, deutan
   * 62.32 against 62.11. If two tiers shared Rec.709 luma but differed on an
   * observer scale, a colour-blind player would read the tier difference as a
   * freshness difference, which corrupts the one channel ADR 0014 says survives
   * colour vision deficiency.
   */
  corpseRevenant: { hex: 0x93a85b, luma: 61.95 },
  feast: { hex: 0xb0ac9e, luma: 67.39 },
  drop: { hex: 0xd8a941, luma: 67.25 },
  /**
   * The dark companion every sprite in the food, mob and treasure layers draws
   * with. Without it the grave's rim meets a pile of food at APCA Lc 0.00 from
   * the outside and the grave reads wider than it is, and that is not a defect
   * of one colour: of the thirteen declared colours between luma 61.95 and
   * 67.41, 72 of the 78 pairs measure exactly Lc 0.00.
   *
   * Measured: Lc 50.19 against corpse, 57.36 against feast, 59.64 against
   * drop and 61.19 against mob. Against night it is 3.4 luma brighter, so it
   * costs nothing on bare field.
   */
  foodOutline: { hex: 0x141a26, luma: 10.04 },

  // effects
  belchEruption: { hex: 0xb5ac8e, luma: 67.35 },
  splash: { hex: 0x7f9184, luma: 54.99 },

  // readouts drawn over the field, inside the ceiling because they draw over play
  hudInk: { hex: 0xa8acb0, luma: 67.23 },
  hudDim: { hex: 0x76839a, luma: 50.94 },
} as const satisfies Record<string, PaletteEntry>;

/**
 * Colours that only draw when the field is not live. Exempt from the ceiling,
 * and the exemption is held shut by the source scan in palette.test.ts, which
 * asserts that no module drawing during a run can reach them.
 *
 * menuDim is deliberately the same hex as hudDim: one is bound by the ceiling
 * and one is not, and they part company when the art pass touches the menus.
 */
const MENU = {
  menuInk: { hex: 0xe8edf2, luma: 92.67 },
  menuDim: { hex: 0x76839a, luma: 50.94 },
} as const satisfies Record<string, PaletteEntry>;

/**
 * Every sprite in a layer beneath mob fire, and the dark companion it draws
 * with (ADR 0014's own construction for a colour that has to read on a
 * background the palette never planned for).
 *
 * Re-valuing anything was priced and is arithmetically impossible. graveRim
 * fails on its own hue ray at every luma from 8 to 68, and giving the rim Lc 45
 * over food needs the food down at luma 23, where the food itself measures Lc
 * 0.00 against the ground it lies on. So the rim becomes two colours instead:
 * the outer three units stay graveRim and a one-unit band of graveHole is
 * stroked inward immediately inside it, in the graveRim layer so it draws above
 * the food rather than under it. The pair spans 62.12 luma, and the dark band
 * clears the Lc 45 fine-detail bracket against everything the rim can cross.
 *
 * graveHole rather than a new near-black, because against the mouth it borders
 * it is invisible, so the perceived hole keeps its width at the size floor and
 * the band reads as the hole continuing under the rim.
 *
 * The storm's six colours all take foodOutline rather than a companion of their
 * own. It clears the fine-detail bracket against every body they can be drawn
 * over and costs nothing over bare field, being 3.4 luma above night, and a
 * second near-black would be a colour with no reason to differ from the first.
 * Measured against the storm: Lc 44.98 to 57.48 for the pairs that clear, with
 * the four that do not named in palette.test.ts with their figures.
 */
const SPRITE_OUTLINE = {
  graveRim: 'graveHole',
  // The glow is the rim's own band in treasure's colour, drawn over it at the
  // identical geometry, so its dark companion is the rim's: the one-unit
  // graveHole band already stroked immediately inside it.
  graveGlow: 'graveHole',
  corpse: 'foodOutline',
  corpseRevenant: 'foodOutline',
  feast: 'foodOutline',
  drop: 'foodOutline',
  mob: 'foodOutline',
  banshee: 'foodOutline',
  undertaker: 'foodOutline',
  skull: 'foodOutline',
  stone: 'foodOutline',
  wisp: 'foodOutline',
  bellRing: 'foodOutline',
  belchEruption: 'foodOutline',
  splash: 'foodOutline',
} as const satisfies Record<string, keyof typeof PALETTE>;

/**
 * Every corpse tier's colour. Brightness is freshness and nothing else, so all
 * of them declare the same luma and the tier reads as hue and saturation, which
 * is what the tracer plan rules.
 */
const CORPSE_TIERS = {
  trash: PALETTE.corpse,
  rich: PALETTE.corpseRevenant,
} as const satisfies Record<string, PaletteEntry>;

type FireEmitter = 'trash' | 'tear' | 'clod' | 'spiral';

interface FireSprite {
  readonly core: PaletteEntry;
  readonly body: PaletteEntry;
  readonly outline: PaletteEntry;
}

/**
 * Every mob-fire emitter, each naming its three colours (ADR 0014). One shared
 * core and one shared outline is deliberate: the core carries the value
 * guarantee and the body carries the hue, and solving each body's own hue for a
 * near-white produced the same colour four times over (research 7.1).
 */
const MOB_FIRE = {
  trash: {
    core: PALETTE.fireCore,
    body: PALETTE.fireTrash,
    outline: PALETTE.fireOutline,
  },
  tear: {
    core: PALETTE.fireCore,
    body: PALETTE.fireTear,
    outline: PALETTE.fireOutline,
  },
  clod: {
    core: PALETTE.fireCore,
    body: PALETTE.fireClod,
    outline: PALETTE.fireOutline,
  },
  spiral: {
    core: PALETTE.fireCore,
    body: PALETTE.fireSpiral,
    outline: PALETTE.fireOutline,
  },
} as const satisfies Record<FireEmitter, FireSprite>;

export {
  MOB_FIRE_BAND_MIN,
  FIELD_LUMA_CEILING,
  BAND_MARGIN_MIN,
  PALETTE,
  MENU,
  SPRITE_OUTLINE,
  CORPSE_TIERS,
  MOB_FIRE,
};
export type { PaletteEntry, FireEmitter, FireSprite };
