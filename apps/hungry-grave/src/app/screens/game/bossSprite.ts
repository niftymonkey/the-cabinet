/**
 * A boss's body on screen: its own vector silhouette, and the invincible flash
 * that ends a chunk.
 *
 * The two bosses are not pixel art. They are drawn as vector silhouettes in the
 * palette entries that already existed for them, by the construction the three
 * mob types use: a body colour, a companion carrying the detail, and a
 * near-black rim (ADR 0014, and the design record's dressing section). That
 * keeps the stand-in question off the readability-critical path and confines
 * pixel art, and the smoothing question with it, to the ground layer.
 *
 * The silhouettes are placeholders and ticket #38 owns the art. What they have
 * to do is read as two different bodies at a glance, which is ADR 0014's first
 * discriminator and the whole job here.
 */

import type { Graphics } from 'pixi.js';

import type { Boss } from '../../../game/bosses/chunks';
import { BOSS_HALF_HEIGHT, BOSS_HALF_WIDTH } from '../../../game/bosses/chunks';
import type { BossKind } from '../../../game/stage/rows';
import type { PaletteEntry } from '../../palette';
import { PALETTE } from '../../palette';

/**
 * A silhouette, in units of the boss's own half extents.
 *
 * Unit space rather than field units, so the drawn body is the hitbox by
 * construction: moving BOSS_HALF_WIDTH moves the drawing with it and the storm
 * keeps hitting what a player sees.
 */
type Outline = readonly (readonly [number, number])[];

/**
 * The Banshee: a wailing shroud. A dome over a ragged hem, which is a
 * silhouette no mob type owns and nothing the Undertaker's straight edges can
 * be mistaken for.
 */
const BANSHEE_SHROUD: Outline = [
  [-0.87, 0.1],
  [-0.72, -0.42],
  [-0.46, -0.8],
  [-0.16, -1.0],
  [0.16, -1.0],
  [0.46, -0.8],
  [0.72, -0.42],
  [0.87, 0.1],
  [1.0, 1.0],
  [0.75, 0.55],
  [0.5, 1.0],
  [0.25, 0.55],
  [0.0, 1.0],
  [-0.25, 0.55],
  [-0.5, 1.0],
  [-0.75, 0.55],
  [-1.0, 1.0],
];

/**
 * The Undertaker: a brimmed hat over a coat. Every edge is straight where hers
 * curve, and the brim is the widest thing on him, so the two read apart at the
 * size a boss is drawn at.
 */
const UNDERTAKER_COAT: Outline = [
  [-1.0, 1.0],
  [-0.72, 0.1],
  [-0.86, -0.16],
  [-0.34, -0.34],
  [-0.3, -1.0],
  [0.3, -1.0],
  [0.34, -0.34],
  [0.86, -0.16],
  [0.72, 0.1],
  [1.0, 1.0],
];

const BOSS_OUTLINES: Record<BossKind, Outline> = {
  banshee: BANSHEE_SHROUD,
  undertaker: UNDERTAKER_COAT,
};

/** The pair one boss wears: its body colour and the dark half beside it. */
interface BossPair {
  readonly body: PaletteEntry;
  readonly dark: PaletteEntry;
}

const BOSS_PAIRS: Record<BossKind, BossPair> = {
  banshee: { body: PALETTE.banshee, dark: PALETTE.bansheeDark },
  undertaker: { body: PALETTE.undertaker, dark: PALETTE.undertakerDark },
};

/**
 * How thick a boss's rim is drawn, in field units. Initial row.
 *
 * A mob wears SPRITE_STROKE at 1.5 over a body about twenty units across; a
 * boss is a hundred and twenty, so the same figure is a hairline on it. Four
 * units is the mob's own share of its body at a boss's size.
 */
const BOSS_STROKE = 4;

/**
 * Half the flash's period, in ticks, and a safety floor before it is a feel
 * number.
 *
 * A boss body is the largest sprite on the field, so the small-area escape
 * hatch cannot apply and WCAG SC 2.3.1's three flashes in any one second binds
 * it exactly as it binds the hit dim (`tuning.ts`'s INVULNERABLE_TICKS) and the
 * corpse flicker (`foodSprite.ts`'s FLICKER_HALF_PERIOD). A flash is a pair of
 * opposing changes, so the period is twice this and the floor is eleven ticks;
 * twelve clears it and is the figure the corpse flicker already takes. It was 5,
 * which is six flashes a second, and the comment beside it claimed the opposite.
 */
const FLASH_HALF_PERIOD = 12;

/**
 * Whether the flash is showing its inverted read this tick.
 *
 * The read is the pair swapping over rather than a dim or an alpha: on the
 * inverted beat the body takes the dark half and the detail and the rim take
 * the bright one, so an invincible boss never darkens into the night it stands
 * against. It runs off the boss's own countdown and never off the run's tick,
 * so a replay rendering a pinned tape draws the fight the run drew.
 */
const bossFlashInverted = (boss: Boss): boolean => {
  if (boss.flash <= 0) return false;
  return Math.floor(boss.flash / FLASH_HALF_PERIOD) % 2 === 1;
};

// What a boss's drawing depends on, so a sprite is rebuilt only when its look changes.
const bossLook = (boss: Boss): string => {
  return `${boss.kind}|${bossFlashInverted(boss)}`;
};

// One silhouette's points in field units, as the flat list Graphics.poly takes.
const outlinePoints = (outline: Outline): number[] => {
  return outline.flatMap(([x, y]) => [
    x * BOSS_HALF_WIDTH,
    y * BOSS_HALF_HEIGHT,
  ]);
};

/** An ellipse in unit space, so a detail scales with the body it sits on. */
const detailEllipse = (
  into: Graphics,
  x: number,
  y: number,
  halfWidth: number,
  halfHeight: number,
): void => {
  into.ellipse(
    x * BOSS_HALF_WIDTH,
    y * BOSS_HALF_HEIGHT,
    halfWidth * BOSS_HALF_WIDTH,
    halfHeight * BOSS_HALF_HEIGHT,
  );
};

// Her two eye hollows and the open mouth of the wail.
const drawBansheeDetail = (into: Graphics): void => {
  detailEllipse(into, -0.34, -0.34, 0.14, 0.19);
  detailEllipse(into, 0.34, -0.34, 0.14, 0.19);
  detailEllipse(into, 0.0, 0.2, 0.13, 0.3);
};

// His eye slits under the brim, and the shovel held across the coat.
const drawUndertakerDetail = (into: Graphics): void => {
  for (const at of [-0.36, 0.12]) {
    into.rect(
      at * BOSS_HALF_WIDTH,
      -0.21 * BOSS_HALF_HEIGHT,
      0.24 * BOSS_HALF_WIDTH,
      0.11 * BOSS_HALF_HEIGHT,
    );
  }
  into.rect(
    0.52 * BOSS_HALF_WIDTH,
    -0.2 * BOSS_HALF_HEIGHT,
    0.08 * BOSS_HALF_WIDTH,
    0.8 * BOSS_HALF_HEIGHT,
  );
  into.poly(
    outlinePoints([
      [0.4, 0.55],
      [0.72, 0.55],
      [0.64, 1.0],
      [0.48, 1.0],
    ]),
  );
};

const BOSS_DETAILS: Record<BossKind, (into: Graphics) => void> = {
  banshee: drawBansheeDetail,
  undertaker: drawUndertakerDetail,
};

const drawBoss = (into: Graphics, boss: Boss): void => {
  const pair = BOSS_PAIRS[boss.kind];
  const inverted = bossFlashInverted(boss);
  const body = inverted ? pair.dark : pair.body;
  const detail = inverted ? pair.body : pair.dark;
  const points = outlinePoints(BOSS_OUTLINES[boss.kind]);
  into.clear().poly(points).fill({ color: body.hex });
  BOSS_DETAILS[boss.kind](into);
  into.fill({ color: detail.hex });
  into.poly(points).stroke({
    // A dark body needs a bright edge, so the rim goes to the pair's own body
    // colour on the inverted beat rather than staying near-black on near-black.
    width: BOSS_STROKE,
    color: inverted ? pair.body.hex : PALETTE.foodOutline.hex,
    alignment: 0.5,
    // Round rather than the default miter. The shroud's hem meets at acute
    // angles, and a mitered join there throws a spike four times the rim's own
    // width past the body, which reads as a stray point and puts ink well
    // outside the hitbox.
    join: 'round',
  });
};

export { bossFlashInverted, bossLook, drawBoss, BOSS_STROKE };
