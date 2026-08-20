/**
 * Every colour the game draws, each declared with the luma it measures, so the
 * value band ADR 0014 reserves for mob fire is data a unit test can hold rather
 * than something only a screenshot can see.
 *
 * The table is derived and pinned in
 * `docs/research/readability-value-band.md` section 7. It is not this module's
 * to choose, and the declared lumas are written out rather than computed so the
 * test has something independent to check the hexes against.
 */

export interface PaletteEntry {
  readonly hex: number;
  readonly luma: number;
}

/** Only a mob-fire core may sit at or above this luma. */
export const MOB_FIRE_BAND_MIN = 88;

/** Every other field colour sits at or below this luma. */
export const FIELD_LUMA_CEILING = 68;

/** The floor under the gap between the two, stated as a floor and not derived. */
export const BAND_MARGIN_MIN = 20;

/** Every colour drawn while the field is live, the readouts over it included (ADR 0014). */
export const PALETTE = {
  // the night field
  night: { hex: 0x0e1119, luma: 6.64 },
  nightSpeckle: { hex: 0x1d2434, luma: 13.99 },
  fieldFrame: { hex: 0x677db0, luma: 48.63 },

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
  feast: { hex: 0xb0ac9e, luma: 67.39 },
  drop: { hex: 0xd8a941, luma: 67.25 },
  dropCore: { hex: 0x141a26, luma: 10.04 },

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
export const MENU = {
  menuInk: { hex: 0xe8edf2, luma: 92.67 },
  menuDim: { hex: 0x76839a, luma: 50.94 },
} as const satisfies Record<string, PaletteEntry>;

export type FireEmitter = "trash" | "tear" | "clod" | "spiral";

export interface FireSprite {
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
export const MOB_FIRE = {
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
