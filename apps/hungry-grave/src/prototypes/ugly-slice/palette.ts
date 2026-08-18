// The slice palette, chosen deliberately even in rectangles (First Dig rule:
// readability layering is day one, and placeholders still get design effort).
//
// The layering contract (concept doc, "The storm, and reading through it"):
// enemy fire renders on the TOP layer in a reserved high-contrast hot family
// that nothing else on screen may use; player fire is dimmer and desaturated;
// corpses and drops are perceptually unmistakable from each other.
// Banned everywhere: brown, AI purple.

export const PALETTE = {
  // The night field.
  night: 0x0e1119,
  nightSpeckle: 0x1d2434,
  fieldFrame: 0x2a3348,

  // The grave: a hole in the ground, near-black with a pale rim.
  graveHole: 0x04060b,
  graveRim: 0x93a7bd,
  graveGlow: 0xffc84d,

  // Enemies: toxic green ghouls. Bosses sit in the same cool family.
  enemy: 0x59c964,
  enemyDark: 0x1d4a26,
  banshee: 0xc9ecdd,
  bansheeDark: 0x3f7a68,
  undertaker: 0x5d6b80,
  undertakerDark: 0x232b38,

  // The reserved hot family: ONLY enemy fire may be red-orange.
  enemyShot: 0xff4a3d,
  enemyTear: 0xff6a55,
  enemyClod: 0xf5563d,
  enemySpiral: 0xff8248,

  // Player fire: dim, desaturated, cool.
  skull: 0x8496a6,
  wisp: 0x63b8ad,
  stone: 0x9aa4ad,
  bellRing: 0xaebfcf,

  // Ground food: corpses bone-pale, drops gold and steady-bright.
  corpse: 0xe9e4d2,
  feast: 0xf7f2de,
  drop: 0xffc84d,
  dropCore: 0x4a3b12,

  // Effects.
  belchFlash: 0xfff3c9,
  hitFlash: 0xff4a3d,
  // Wasted belch charge: a sickly gray-green, dull on purpose, so lost value
  // never reads as the gold that means treasure.
  waste: 0x7f9184,
} as const;
