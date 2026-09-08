/**
 * The grayscale import: every staged sprite and tile the game draws is
 * desaturated on the way into raw-assets, so the only hue on screen is a palette
 * entry's (design record `docs/design/stage-floor.md` section 7, ADR 0014).
 *
 * Run from apps/hungry-grave, once per restage:
 * `pnpm vite-node --config vite.headless.config.ts scripts/grayscale-import.ts`.
 * The packs under assets-staging are gitignored and only this output is
 * committed, so this file is the whole record of which staged art the game uses.
 * Fence test 122 in `src/app/__tests__/palette.test.ts` reads what it writes.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import { PNG } from 'pngjs';

import { luma } from '../src/app/color';

const APP = resolve(import.meta.dirname, '..');
const STAGED = join(APP, 'assets-staging');
const IMPORTED = join(APP, 'raw-assets', 'standIn{m}');

/** A rectangle of a staged sheet, in pixels from its top left. */
interface Cell {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** One staged file, and where its grayscale copy lands under raw-assets. */
interface Staged {
  readonly from: string;
  readonly to: string;
}

/** One creature cut out of a sheet that also carries art this game does not use. */
interface StagedCell extends Staged {
  readonly cell: Cell;
}

/**
 * The ground, its per-section dressing and the Waking's own source, from the
 * crawling-depths pack. The three dressing sets are the design record's, section
 * 7: statues and cliff for the Procession, urns and veins for the Crowd,
 * floating rocks and eyes and tentacles for the Vigil.
 *
 * The folders carry AssetPack tags. `{m}` makes one bundle nothing declares, so
 * the stand-ins are background-loaded and no screen waits on them, and `{fix}`
 * turns off the half-resolution mipmap, which on pixel art is a blurred copy the
 * renderer may pick over the real one.
 */
const GROUND: readonly Staged[] = [
  { from: 'crawling-depths/Terrain/Tiles.png', to: 'ground{fix}/tiles.png' },
  { from: 'crawling-depths/Terrain/Cliff.png', to: 'ground{fix}/cliff.png' },
  { from: 'crawling-depths/Terrain/Cracks.png', to: 'ground{fix}/cracks.png' },
  {
    from: 'crawling-depths/Structures & Details/Statue A1.png',
    to: 'ground{fix}/statue-a1.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Statue A2.png',
    to: 'ground{fix}/statue-a2.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Statue B1.png',
    to: 'ground{fix}/statue-b1.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Statue B2.png',
    to: 'ground{fix}/statue-b2.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Urn 1.png',
    to: 'ground{fix}/urn-1.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Urn 2.png',
    to: 'ground{fix}/urn-2.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Short Vein Column 1.png',
    to: 'ground{fix}/short-vein-column-1.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Short Vein Column 2.png',
    to: 'ground{fix}/short-vein-column-2.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Tall Vein Column 1.png',
    to: 'ground{fix}/tall-vein-column-1.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Tall Vein Column 2.png',
    to: 'ground{fix}/tall-vein-column-2.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Little Eyes 1 Sheet.png',
    to: 'ground{fix}/little-eyes.png',
  },
  {
    from: 'crawling-depths/Terrain/Floating Rock A1 Sheet.png',
    to: 'ground{fix}/floating-rock-a1.png',
  },
  {
    from: 'crawling-depths/Terrain/Floating Rock A2 Sheet.png',
    to: 'ground{fix}/floating-rock-a2.png',
  },
  {
    from: 'crawling-depths/Terrain/Floating Rock B1 Sheet.png',
    to: 'ground{fix}/floating-rock-b1.png',
  },
  {
    from: 'crawling-depths/Terrain/Floating Rock B2 Sheet.png',
    to: 'ground{fix}/floating-rock-b2.png',
  },
  {
    from: 'crawling-depths/Creatures/Eye 1 Sheet.png',
    to: 'ground{fix}/eye.png',
  },
  {
    from: 'crawling-depths/Creatures/Tentacle 1 Sheet.png',
    to: 'ground{fix}/tentacle.png',
  },
  {
    from: 'crawling-depths/Creatures/Eldritch Entity Dormant.png',
    to: 'ground{fix}/waking-dormant.png',
  },
  {
    from: 'crawling-depths/Creatures/Eldritch Entity Awaken.png',
    to: 'ground{fix}/waking-awake.png',
  },
];

/**
 * The bodies, from the scarymobs pack, cut to the creature rather than taken
 * whole: the same sheets carry the brown werewolves, bears, gorillas and zombies
 * Mark ruled out (2026-09-08), and what is not cut out never enters the repo.
 *
 * Which creature stands for what: the skeleton is the shambler, the ghost is the
 * revenant and the Banshee both (she is the big ghost and the pack holds one
 * ghost, so she is this art drawn large rather than a second file), the cat is
 * the ghoul, the golem is the carrier, and the tall figure is the Undertaker.
 * Of the golem's two shades the pale one is taken, because a tint multiplies and
 * so can only darken what it is given.
 */
const SPRITES: readonly StagedCell[] = [
  {
    from: 'scarymobs/undead.png',
    to: 'sprites{fix}/skeleton.png',
    cell: { x: 0, y: 0, width: 64, height: 64 },
  },
  {
    from: 'scarymobs/undead.png',
    to: 'sprites{fix}/cat.png',
    cell: { x: 96, y: 0, width: 64, height: 64 },
  },
  {
    from: 'scarymobs/undead.png',
    to: 'sprites{fix}/ghost.png',
    cell: { x: 0, y: 64, width: 128, height: 32 },
  },
  {
    from: 'scarymobs/beasts.png',
    to: 'sprites{fix}/golem.png',
    cell: { x: 0, y: 192, width: 144, height: 64 },
  },
  {
    from: 'scarymobs/cosmic_horror_dude.png',
    to: 'sprites{fix}/tall-figure.png',
    cell: { x: 0, y: 0, width: 48, height: 144 },
  },
];

/**
 * The grayscale value of one pixel, in Rec.709 luma over gamma-encoded sRGB. It
 * is the quantity ADR 0014's value ceiling is measured in (`src/app/color.ts`),
 * so a sprite's brightness and a palette entry's are one number rather than two
 * conventions that happen to agree.
 */
const grayOf = (red: number, green: number, blue: number): number =>
  Math.round((luma((red << 16) | (green << 8) | blue) / 100) * 255);

/** Every pixel's three colour channels set to its own value. Alpha is untouched. */
const desaturate = (image: PNG): void => {
  for (let at = 0; at < image.data.length; at += 4) {
    const gray = grayOf(image.data[at], image.data[at + 1], image.data[at + 2]);
    image.data[at] = gray;
    image.data[at + 1] = gray;
    image.data[at + 2] = gray;
  }
};

/** The top of an eight-bit channel, which the stretch lifts the art's body to. */
const FULL_RANGE = 255;

/**
 * Where the stretch takes its top from: the 98th percentile of the art's own
 * opaque greys, not its brightest pixel.
 *
 * A handful of specular pixels is what the packs put at the top of their range,
 * and stretching to the brightest of them leaves the body of a sprite where it
 * was: the Waking's two frames are the case that showed it, one with bright
 * eyes and one without, which the maximum scaled by 3.5 apart from each other.
 * Clipping the top two percent costs highlights that then draw at the palette
 * entry itself, which is what a highlight is.
 */
const STRETCH_PERCENTILE = 0.98;

/** The grey at a percentile of a grayscale image's opaque pixels. */
const greyAtPercentile = (image: PNG, share: number): number => {
  const greys: number[] = [];
  for (let at = 0; at < image.data.length; at += 4) {
    if (image.data[at + 3] === 0) continue;
    greys.push(image.data[at]);
  }
  if (greys.length === 0) return 0;
  greys.sort((first, second) => first - second);
  return greys[Math.min(greys.length - 1, Math.floor(greys.length * share))];
};

/**
 * The image's own greys stretched so the body of the art reaches the top of the
 * range, with everything under it scaled by the same factor and anything over
 * the top clipped to it.
 *
 * A PixiJS tint multiplies, so a palette entry is a ceiling and never a value:
 * what draws is the art's own grey times the entry. This pack is a dark one,
 * most of it peaking between 17 and 72 of 255, so tinted as staged the whole
 * ground drew two luma points off night whatever entry it wore, and the
 * rendered check at slice 13b is what saw it. Stretched, a sprite's brightest
 * surface is the entry itself and everything under it is that colour's own
 * shading, which is what "coloured only by its palette entry" has to mean.
 *
 * The stretch is one factor over the whole image rather than per channel, which
 * is what keeps a grayscale image grayscale.
 */
const stretchToFullRange = (image: PNG): void => {
  const top = greyAtPercentile(image, STRETCH_PERCENTILE);
  if (top === 0 || top === FULL_RANGE) return;
  for (let at = 0; at < image.data.length; at += 4) {
    const lifted = Math.min(
      FULL_RANGE,
      Math.round((image.data[at] * FULL_RANGE) / top),
    );
    image.data[at] = lifted;
    image.data[at + 1] = lifted;
    image.data[at + 2] = lifted;
  }
};

/** The staged sheet at a path, decoded to eight-bit RGBA. */
const stagedSheet = (from: string): PNG =>
  PNG.sync.read(readFileSync(join(STAGED, from)));

/**
 * One cell of a sheet, as an image of its own. A cell that runs off the sheet is
 * a wrong row in the tables above rather than anything the run can recover from,
 * so it throws with both rectangles named.
 */
const cutOut = (from: string, sheet: PNG, cell: Cell): PNG => {
  const fits =
    cell.x + cell.width <= sheet.width && cell.y + cell.height <= sheet.height;
  if (!fits) {
    throw new Error(
      `${from} is ${sheet.width}x${sheet.height} and the cell ${cell.width}x${cell.height} at ${cell.x},${cell.y} runs off it`,
    );
  }
  const cut = new PNG({ width: cell.width, height: cell.height });
  PNG.bitblt(sheet, cut, cell.x, cell.y, cell.width, cell.height, 0, 0);
  return cut;
};

/** The desaturated image written under raw-assets, and the bytes it took. */
const writeImported = (to: string, image: PNG): number => {
  const path = join(IMPORTED, to);
  desaturate(image);
  stretchToFullRange(image);
  const bytes = PNG.sync.write(image);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
  return bytes.length;
};

const importWhole = (staged: Staged): number =>
  writeImported(staged.to, stagedSheet(staged.from));

const importCell = (staged: StagedCell): number =>
  writeImported(
    staged.to,
    cutOut(staged.from, stagedSheet(staged.from), staged.cell),
  );

/**
 * Whether the packs are on disk. They are gitignored, so a fresh clone has none
 * of them and the person running this is the one who can act on that.
 */
const refuseWithoutTheStagedPacks = (): boolean => {
  if (existsSync(STAGED)) return false;
  console.error(
    `${relative(APP, STAGED)} is not here: stage the itch.io packs before importing`,
  );
  process.exitCode = 1;
  return true;
};

const main = (): void => {
  if (refuseWithoutTheStagedPacks()) return;
  const written = [...GROUND.map(importWhole), ...SPRITES.map(importCell)];
  const bytes = written.reduce((total, size) => total + size, 0);
  console.log(
    `${written.length} grayscale files, ${bytes} bytes, under ${relative(APP, IMPORTED)}`,
  );
};

main();
