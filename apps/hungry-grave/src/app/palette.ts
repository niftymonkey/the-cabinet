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

  /**
   * The ground the whole field is painted from, in the prototype's own colours
   * (build 7, which Mark approved; slice 8 of #148 ports its `paintGround` line
   * for line on his ruling of 2026-09-21). Every row is a colour that painter
   * draws with, most of them at an alpha the painter sets, so the declared
   * value is the most a row can ever put on screen.
   *
   * The prototype's `COLOR` comment states the relationship they were chosen
   * for, and it is a statement about a grayscale squint: the moonlit ground is
   * the brightest, then the lit side wall, then the far wall and the shaded
   * side, and the depth the walls fall away into is the only true black.
   *
   * The ground's grass is not here. The tufts draw in `graveTurf` and
   * `graveTurfDark`, which are the prototype's own `COLOR.moss` and
   * `COLOR.mossDark` that slice 6 already declared.
   */
  // The whole field's base earth, which every other ground colour is laid over.
  groundNight: { hex: 0x454f5d, luma: 30.54 },
  // The pale fleck of the grain, and the three wide patches of damp and dry.
  groundSpeckle: { hex: 0x66748a, luma: 44.95 },
  groundCold: { hex: 0x56657a, luma: 38.95 },
  groundWet: { hex: 0x466050, luma: 35.03 },
  groundDamp: { hex: 0x2c3644, luma: 20.74 },
  // The hairline cracks in the dry earth, and the dark fleck of the grain.
  groundCrack: { hex: 0x28313d, luma: 18.81 },
  // A speck of gravel lying on the earth.
  groundGravel: { hex: 0x8d9cae, luma: 60.44 },

  /**
   * The grave, in the prototype's own colours (build 7, which Mark approved;
   * slice 6 of #148 ports its painters line for line). Each row is a colour the
   * prototype's grave painters draw with, most of them at an alpha the painter
   * sets, so the declared value is the most a row can ever put on screen.
   *
   * These values were chosen against the prototype's own ground, which the
   * field has carried since slice 8, so the cut earth sits under the earth it
   * is cut into the way the prototype has it. Mark decides the colours after he
   * has seen the port (2026-09-21), so nothing below is re-valued.
   */
  // The dark the walls fall away into, and the black the depth fade lays over them.
  graveHole: { hex: 0x000000, luma: 0 },
  // The pale band of subsoil, the brightest earth the cut shows (SOIL at 0.18).
  graveWall: { hex: 0x414b5c, luma: 29.06 },
  // The lighter grass blade hanging in over the cut (the prototype's COLOR.moss).
  graveTurf: { hex: 0x6e8a58, luma: 50.37 },
  // The darker grass blade, most of the overhang (the prototype's COLOR.mossDark).
  graveTurfDark: { hex: 0x4a6040, luma: 34.91 },
  // The shadow the overhanging turf throws at the top of the cut (SOIL at 0).
  graveSoilShadow: { hex: 0x232a38, luma: 16.28 },
  // The subsoil below the pale band (SOIL at 0.52).
  graveSubsoil: { hex: 0x333c4b, luma: 23.2 },
  // The subsoil darkening toward where the light dies (SOIL at 0.78).
  graveSubsoilDark: { hex: 0x212834, luma: 15.44 },
  // The earth where the light has gone (SOIL at 1).
  graveSubsoilDeep: { hex: 0x080b10, luma: 4.21 },
  // The seam of darker earth along each layer boundary.
  graveSeam: { hex: 0x05080c, luma: 3 },
  // A spade mark catching the moon, and one in shadow.
  graveSpadePale: { hex: 0x889ab4, luma: 59.63 },
  graveSpadeDark: { hex: 0x06090f, luma: 3.45 },
  // A stone standing in the face, and the shadow it throws under itself.
  graveStone: { hex: 0x68768a, luma: 45.67 },
  graveStoneShadow: { hex: 0x04070b, luma: 2.61 },
  // A cut root end in the face.
  graveRoot: { hex: 0x7a8272, luma: 49.86 },
  // The wash on the face that catches the moon, and on the faces in its shade.
  graveMoonWash: { hex: 0x8498b6, luma: 58.79 },
  graveShadeWash: { hex: 0x030509, luma: 1.91 },
  // The light a side wall loses toward the near lip.
  graveNearLipShade: { hex: 0x020408, luma: 1.52 },
  // The edge where the far wall meets a side wall.
  graveCornerEdge: { hex: 0x020306, luma: 1.18 },
  // The bare trodden earth round the lip, its dark patches and its pale ones.
  graveMarginDark: { hex: 0x202731, luma: 14.99 },
  graveMarginPale: { hex: 0x37404e, luma: 24.74 },
  // A lump of turned earth on the margin: its shadow, and the moon on its top.
  graveCrumbShadow: { hex: 0x1a2029, luma: 12.3 },
  graveCrumbTop: { hex: 0x5e6a7c, luma: 41.08 },
  // The line of shadow the turf throws just inside the edge.
  graveTurfShadow: { hex: 0x020407, luma: 1.49 },
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
  /**
   * The charge arc that announces claimed ground, on the grave's own rim.
   *
   * Re-valued on 2026-08-28 from `#9aa4ad` luma 63.73, a pale blue-grey at hue
   * 208. The arc is the rim's own band wearing this colour, the construction
   * graveGlow already uses, and on that band the old value was invisible: it
   * sat 0.72 luma and 3 hue degrees from graveRim, inside the flat span where
   * 72 of 78 pairs measure APCA Lc 0.00. Lightness cannot separate them,
   * because the band ceiling caps both, so the separation has to be hue, which
   * is how the glow reads at Lc 0.00 on the same geometry.
   *
   * The hue is forced rather than chosen. Fire's 20-degree exclusion closes 20
   * to 39, amber at 41 is spoken for, purple is banned outright, and 175 to
   * 220 is the grave's own family, which is what has to be left. That leaves
   * the window between corpseRevenant at hue 76 and mob at hue 126, and 101 is
   * its midpoint, 24 degrees off the moss and 25 off a mob body. The luma is
   * held at the old value so nothing else in the band moves.
   *
   * The ground itself left this entry the same day. It has to part from green
   * mob bodies as well, which this hue cannot do at any saturation, so
   * `territoryGround` carries the ground and this colour serves the arc alone.
   */
  territory: { hex: 0x82b26b, luma: 63.79 },
  /**
   * Claimed ground on the field, split from the charge arc's colour above on
   * 2026-08-28.
   *
   * The arc and the ground are drawn over different things and one colour
   * could not serve both. The arc is the rim's own band, so it needs hue to
   * part from the rim, and that is what forced the green. The ground lies on
   * the open field beneath mob bodies at hue 126 and revenant moss at 76, and
   * green under green is the thing that could not be read.
   *
   * A cold slate at hue 237.5, saturation 0.140, luma 59.00. It parts from a
   * mob body on all three channels rather than on hue alone, which is the
   * defect: 7.63 luma against the 2.0 tripwire, 111.6 hue degrees against 15,
   * and 0.418 saturation against 0.25. Against revenant moss it is 2.95, 161.1
   * and 0.319 on the same three.
   *
   * Brighter was not available. A mob body sits at luma 66.63 against the
   * band's own ceiling of 68, so there is no room above it for the 2.0 the
   * luma channel needs, and the separation has to be bought by going down.
   * How far down is closed from both sides. Below luma 58.3 claimed ground
   * stops clearing APCA Lc 45 over the grave's own mouth, which it can be laid
   * across, and a tenth of a luma point under that the food layer's dark
   * companion stops clearing 45 over the ground itself. Above 59.95 the luma
   * channel closes against revenant moss at 61.95. At 59.00 the two margins
   * are 0.92 on the first and 0.95 on the second, and they cross at 59.01, so
   * the value is close to forced rather than chosen.
   *
   * The hue is forced the same way. Fire's 20-degree exclusion and amber at 41
   * close the warm end, purple is banned outright, corpse and feast already
   * hold the warm bone at hue 45 where confusing ground with food would be a
   * misread payout, the green family from 76 to 155 is the defect itself, and
   * 175 to 220 is the grave's own family. What is left is the cold blue above
   * it, and 237.5 is 26.1 degrees off the rim and 29.3 off a skull. The
   * saturation is capped rather than picked: parting from the moss on
   * saturation needs 0.208 or under, which is what makes claimed ground a
   * near-neutral, and 0.140 leaves margin on both greens at once.
   *
   * Measured against everything it is drawn over: Lc 45.92 on the grave's
   * mouth, 57.45 on an eruption and 57.48 on a bell ring. Over the splash it
   * reaches 41.44, which is the figure every storm colour reaches there and is
   * named in palette.test.ts with the rest of them. Measured for the sprites
   * drawn over it: Lc 46.44 for the whole food and mob layer through
   * foodOutline, and 48.16 for the rim.
   */
  territoryGround: { hex: 0x9495ac, luma: 59 },
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
  powerUp: { hex: 0xd8a941, luma: 67.25 },
  /**
   * The dark companion every sprite in the food, mob and treasure layers draws
   * with. Without it the grave's rim meets a pile of food at APCA Lc 0.00 from
   * the outside and the grave reads wider than it is, and that is not a defect
   * of one colour: of the thirteen declared colours between luma 61.95 and
   * 67.41, 72 of the 78 pairs measure exactly Lc 0.00.
   *
   * Measured: Lc 50.19 against corpse, 57.36 against feast, 59.64 against
   * power-up and 61.19 against mob. Against night it is 3.4 luma brighter, so it
   * costs nothing on bare field.
   */
  foodOutline: { hex: 0x141a26, luma: 10.04 },

  // effects
  belchEruption: { hex: 0xb5ac8e, luma: 67.35 },
  splash: { hex: 0x7f9184, luma: 54.99 },

  /**
   * The stand-in ground, per section (ADR 0049, decision 22's amendment). Every
   * one of them is a `standIn` prefix on purpose: decision 13 asks that a
   * tester's reaction to the look be separable from a reaction to the game, so
   * a report can say which build drew stand-ins.
   *
   * The earth the dressing stands on is not here. It is the block of `ground`
   * rows above, which slice 8 ports from the prototype.
   *
   * The three dressing tints are the ground and not a sprite, which is why they
   * are excluded from sprite separation with `night` and the ground's own rows
   * rather than beside the bodies. What that costs is measured rather than
   * assumed: a corpse over the Procession's statues reads APCA Lc 27.19
   * against 35.21 over bare ground, and every mob-fire core clears Lc 75.29
   * over the brightest of them, which is the check the band is actually about.
   *
   * The Procession's tint was re-valued on 2026-09-21 from `#303947` luma
   * 22.00, when the field took the prototype's ground: it keeps the 8.01 luma
   * it stood above the old tile, measured over the new base at 30.54, with its
   * hue and saturation held. The other two are one and the other side of the
   * new base and could not follow it, because the Waking's source at luma 42.02
   * has to stay 2.0 clear of every ground colour and that caps a ground row at
   * 40.02; the rule wanted 40.54 and 46.55.
   */
  standInGroundDressCold: { hex: 0x54647c, luma: 38.56 },
  standInGroundDressWet: { hex: 0x2d423d, luma: 23.99 },
  /**
   * The Vigil's one real departure, and the only colour this game adds after
   * the first two sections (Downwell's move: spent once or not at all).
   *
   * Deep teal-cyan at hue 190.43. `docs/research/readability-value-band.md`
   * section 7.5 records hue 175 to 205 as entirely empty, and of the sprites it
   * still is: the nearest are `wisp` at 172.24 and `skull` at 208.24, so 190
   * sits eighteen degrees clear of each against a fifteen-degree
   * sprite-separation minimum. `reservoirCharge` joined the band at 199.79 on
   * 2026-09-16, a readout rather than a sprite and 37.25 luma above this one,
   * so it changes neither clearance. It carries the highest saturation of the
   * ground's own colours, 0.500, because the addition has to be the event.
   */
  standInVigilTint: { hex: 0x2e545c, luma: 30 },
  /**
   * The Waking's source, and its own dark companion.
   *
   * It takes the Crowd's family at hue 164.68 rather than the Vigil's, because
   * it is placed by a Crowd wave and opens as the Crowd's boundary event, and
   * giving it the hue 190 entry would spend the fourth colour a section early.
   * What that costs is a source in the same family as the Crowd's own eye
   * dressing, and the stand-in answer is size (design record section 7).
   *
   * It is the brightest thing the ground layer draws, Lc 11.63 over the
   * ground's own earth, because it is the loudest beat in the run. It is also
   * the ceiling on every other ground colour: it has to stay 2.0 luma clear of
   * each of them, which is what a ground row may not pass. That is bought from
   * the
   * sprites crossing it: a corpse over its body reads Lc 22.8, which is the
   * measured cost of a source that can be seen at all, and it is why the
   * companion is drawn as a rim past the body rather than behind it.
   */
  standInWaking: { hex: 0x47766a, luma: 42.02 },
  standInWakingDark: { hex: 0x13221f, luma: 12 },

  // readouts drawn over the field, inside the ceiling because they draw over play
  hudInk: { hex: 0xa8acb0, luma: 67.23 },
  hudDim: { hex: 0x76839a, luma: 50.94 },
  /**
   * The reservoir's charge, drawn as the filled part of the belch's ring.
   *
   * Every shipped phone precedent for a charge is a coloured fill on a neutral
   * track: Brawl Stars' slim yellow ring on a grey meter, Genshin's burst icon
   * filling with the element's own colour (`docs/research/push-feel-precedent.md`
   * section 4). So the track is `hudInk`, the readouts' own near-neutral, and
   * this is the fill. Ready leaves for `graveGlow`, which is treasure's colour
   * and means a thing there is to spend.
   *
   * The luma is forced to the point rather than to a window. All three colours
   * the control draws sit inside 0.02 luma of each other, 67.23, 67.25 and
   * 67.25, so neither the charge nor the ready tell can announce by getting
   * brighter, which is what ADR 0054's reading of ADR 0014 forbids. What is
   * left to separate them is hue and area, and APCA measures Lc 0.00 against
   * the track, so the arc's own width and length carry the whole reading in
   * grayscale.
   *
   * The hue is forced the same way the two before it were. Fire's 20-degree
   * exclusion closes 20 to 39, amber at 41 is the ready tell itself, corpse and
   * feast hold the warm bone, the green family from 76 to 155 is the mobs and
   * the moss, purple is banned outright, and 237.5 is claimed ground. What is
   * left at this luma is the grave's own cold family, 175 to 220, where the
   * readouts already live. 199.79 is the one spot in it with room for real
   * chroma: it clears `wisp` at 172.24 by 27.5 degrees, `bellRing` at 210 on
   * saturation by 0.292 against a 0.25 minimum, and the track by 0.406, which
   * is the separation the eye actually reads.
   *
   * Measured: APCA Lc 58.35 against night, and 37.25 luma above the Vigil's
   * ground tint nine hue degrees away, which is a ground fill under the field
   * where this is a ring in the corner.
   */
  reservoirCharge: { hex: 0x76b7d7, luma: 67.25 },
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
 * The storm's seven colours all take foodOutline rather than a companion of
 * their own. It clears the fine-detail bracket against every body they can be
 * drawn over and costs nothing over bare field, being 3.4 luma above night, and
 * a second near-black would be a colour with no reason to differ from the
 * first. Measured over everything each of them is drawn on: Lc 45.92 to 57.48
 * for the pairs that clear, with the seven that do not named in palette.test.ts
 * with their figures. Claimed ground is the seventh colour, and it is what
 * sets the low end: 45.92 on the grave's mouth, where the six before it
 * cleared no lower than 53.61.
 */
const SPRITE_OUTLINE = {
  graveRim: 'graveHole',
  corpse: 'foodOutline',
  corpseRevenant: 'foodOutline',
  feast: 'foodOutline',
  powerUp: 'foodOutline',
  mob: 'foodOutline',
  banshee: 'foodOutline',
  undertaker: 'foodOutline',
  skull: 'foodOutline',
  territory: 'foodOutline',
  territoryGround: 'foodOutline',
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
