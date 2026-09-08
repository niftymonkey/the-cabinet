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
 * The ground's per-section dressing and the Waking's own source, from the
 * crawling-depths pack. The three dressing sets are the design record's, section
 * 7: statues and cliff for the Procession, urns and veins for the Crowd,
 * floating rocks and eyes and tentacles for the Vigil. The floor they stand on
 * is baked rather than copied, below.
 *
 * The folders carry AssetPack tags. `{m}` makes one bundle nothing declares, so
 * the stand-ins are background-loaded and no screen waits on them, and `{fix}`
 * turns off the half-resolution mipmap, which on pixel art is a blurred copy the
 * renderer may pick over the real one.
 */
const GROUND: readonly Staged[] = [
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
    from: 'crawling-depths/Structures & Details/Statue C1.png',
    to: 'ground{fix}/statue-c1.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Statue C2.png',
    to: 'ground{fix}/statue-c2.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Book Altar.png',
    to: 'ground{fix}/book-altar.png',
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
  // The A2 and B2 sheets are the same two veins one animation frame along, so
  // a still cut from either is the still cut from these, and only these are
  // staged.
  {
    from: 'crawling-depths/Structures & Details/Vein A1 Sheet.png',
    to: 'ground{fix}/vein-a.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Vein B1 Sheet.png',
    to: 'ground{fix}/vein-b.png',
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
    from: 'crawling-depths/Structures & Details/Amalgam Arc 1.png',
    to: 'ground{fix}/amalgam-arc-1.png',
  },
  {
    from: 'crawling-depths/Structures & Details/Amalgam Arc 2.png',
    to: 'ground{fix}/amalgam-arc-2.png',
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

/**
 * The floor the ground is laid from, baked here rather than tiled from the
 * pack's sheet.
 *
 * `Terrain/Tiles.png` is twenty stone blocks of sixteen pixels, each bordered
 * by its own one-pixel groove and lit at its own angle. Tiled whole, every
 * block's border draws and the sheet repeats every five of them, so the ground
 * reads as a lattice of loose blocks placed at random and spun, which is what
 * the slice 13b deploy showed (Mark, 2026-09-08). What is baked instead is a
 * floor laid slab by slab from the cells below: a groove survives only where
 * two slabs meet, so a slab is one continuous piece of rock and the floor is a
 * paving of large slabs rather than a grid of small ones.
 *
 * The pack ships no edge or corner cells, so the layout is authored rather than
 * assembled: the only other terrain in `Tileset.png` is these same twenty
 * blocks and a borderless fill two luma points off black.
 */
const TILE_SHEET = 'crawling-depths/Terrain/Tiles.png';
const FLOOR_FILE = 'ground{fix}/floor.png';

/** The floor, in the pack's own sixteen-pixel cells. */
const FLOOR_CELL = 16;
const FLOOR_COLUMNS = 16;
const FLOOR_ROWS = 16;

/** One cell of the tile sheet, by its column and row in that sheet. */
interface SheetCell {
  readonly column: number;
  readonly row: number;
}

/**
 * The cells the floor is laid from: the five whose streaks and cracks run down
 * and to the right, so a slab is lit from one direction. The other fifteen
 * disagree with these and with each other, and mixing all twenty is what read
 * as blocks spun at random.
 */
const FLOOR_CELLS: readonly SheetCell[] = [
  { column: 0, row: 0 },
  { column: 0, row: 1 },
  { column: 0, row: 2 },
  { column: 0, row: 3 },
  { column: 2, row: 1 },
];

/** One slab of the floor, in cells. The slabs tile the floor exactly. */
interface Slab {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * The paving. Slabs run three to six cells a side, which at the ground's own
 * scale is ninety to a hundred and eighty field units, so a slab is a stone a
 * player could stand on rather than one of a hundred chips.
 */
const FLOOR_SLABS: readonly Slab[] = [
  { x: 0, y: 0, width: 6, height: 4 },
  { x: 6, y: 0, width: 5, height: 6 },
  { x: 11, y: 0, width: 5, height: 3 },
  { x: 0, y: 4, width: 3, height: 5 },
  { x: 3, y: 4, width: 3, height: 6 },
  { x: 11, y: 3, width: 5, height: 5 },
  { x: 6, y: 6, width: 5, height: 4 },
  { x: 0, y: 9, width: 3, height: 4 },
  { x: 11, y: 8, width: 5, height: 4 },
  { x: 3, y: 10, width: 4, height: 6 },
  { x: 7, y: 10, width: 4, height: 3 },
  { x: 0, y: 13, width: 3, height: 3 },
  { x: 7, y: 13, width: 4, height: 3 },
  { x: 11, y: 12, width: 5, height: 4 },
];

/** Which sides of a cell keep the groove the pack drew around it. */
interface Grooves {
  readonly top: boolean;
  readonly bottom: boolean;
  readonly left: boolean;
  readonly right: boolean;
}

/**
 * Which of a cell's grooves survive: only the sides where its slab meets
 * another one. The floor's own outer edge dissolves, so the floor joins itself
 * where it tiles and the join is not a line drawn across the field.
 */
const groovesFor = (slab: Slab, across: number, down: number): Grooves => ({
  top: down === 0 && slab.y > 0,
  bottom: down === slab.height - 1 && slab.y + slab.height < FLOOR_ROWS,
  left: across === 0 && slab.x > 0,
  right: across === slab.width - 1 && slab.x + slab.width < FLOOR_COLUMNS,
});

/**
 * The grey the most of an image's drawn pixels carry, which on this sheet is
 * the rock. A transparent pixel carries a colour channel nothing ever draws, so
 * it is skipped for the same reason the stretch's percentile skips it.
 */
const baseGreyOf = (image: PNG): number => {
  const counts = new Map<number, number>();
  for (let at = 0; at < image.data.length; at += 4) {
    if (image.data[at + 3] === 0) continue;
    const grey = image.data[at];
    counts.set(grey, (counts.get(grey) ?? 0) + 1);
  }
  let base = 0;
  let most = 0;
  for (const [grey, count] of counts) {
    if (count <= most) continue;
    most = count;
    base = grey;
  }
  return base;
};

/** Which edges of the cell a pixel lies on. An interior pixel lies on none. */
const sidesAt = (x: number, y: number): (keyof Grooves)[] => {
  const sides: (keyof Grooves)[] = [];
  if (y === 0) sides.push('top');
  if (y === FLOOR_CELL - 1) sides.push('bottom');
  if (x === 0) sides.push('left');
  if (x === FLOOR_CELL - 1) sides.push('right');
  return sides;
};

/**
 * One dissolved groove pixel: the rock, unless the nearest pixel inside the
 * cell is darker than the rock, which is a crack that really does run to the
 * edge and reads as one crack across the join rather than as a border.
 *
 * It writes a grey, so the sheet is desaturated before this runs.
 */
const paintRock = (cell: PNG, x: number, y: number, base: number): void => {
  const inside = (each: number): number =>
    Math.min(Math.max(each, 1), FLOOR_CELL - 2);
  const under = cell.data[(inside(y) * cell.width + inside(x)) * 4];
  const grey = under < base ? under : base;
  const at = (y * cell.width + x) * 4;
  cell.data[at] = grey;
  cell.data[at + 1] = grey;
  cell.data[at + 2] = grey;
  cell.data[at + 3] = 255;
};

/**
 * The cell with the grooves its slab does not keep filled in with rock. A
 * corner pixel survives whenever either side it lies on is kept, so a groove
 * that runs down one edge runs the whole way down it.
 */
const dissolveGrooves = (cell: PNG, base: number, keep: Grooves): void => {
  for (let y = 0; y < FLOOR_CELL; y++) {
    for (let x = 0; x < FLOOR_CELL; x++) {
      const sides = sidesAt(x, y);
      if (sides.length === 0) continue;
      if (sides.some((side) => keep[side])) continue;
      paintRock(cell, x, y, base);
    }
  }
};

/**
 * Which laid cell stands at a place on the floor, a function of the place and
 * nothing else, so the bake is the same bake every time it is run.
 */
const cellAtPlace = (column: number, row: number): SheetCell => {
  const mixed =
    Math.imul((column * 374761393) ^ (row * 668265263), 1274126177) >>> 0;
  const draw = (mixed ^ (mixed >>> 15)) >>> 0;
  return FLOOR_CELLS[draw % FLOOR_CELLS.length];
};

/** Every place a slab covers, laid from the sheet with its grooves dissolved. */
const laySlab = (
  slab: Slab,
  sheet: PNG,
  base: number,
  floor: PNG,
): string[] => {
  if (
    slab.x + slab.width > FLOOR_COLUMNS ||
    slab.y + slab.height > FLOOR_ROWS
  ) {
    throw new Error(
      `the slab ${slab.width}x${slab.height} at ${slab.x},${slab.y} runs off a floor of ${FLOOR_COLUMNS}x${FLOOR_ROWS} cells`,
    );
  }
  const laid: string[] = [];
  for (let down = 0; down < slab.height; down++) {
    for (let across = 0; across < slab.width; across++) {
      const column = slab.x + across;
      const row = slab.y + down;
      laid.push(`${column},${row}`);
      const from = cellAtPlace(column, row);
      const cell = cutOut(TILE_SHEET, sheet, {
        x: from.column * FLOOR_CELL,
        y: from.row * FLOOR_CELL,
        width: FLOOR_CELL,
        height: FLOOR_CELL,
      });
      dissolveGrooves(cell, base, groovesFor(slab, across, down));
      const to = { x: column * FLOOR_CELL, y: row * FLOOR_CELL };
      PNG.bitblt(cell, floor, 0, 0, FLOOR_CELL, FLOOR_CELL, to.x, to.y);
    }
  }
  return laid;
};

/**
 * The slabs refused unless they tile the floor exactly. A gap or an overlap is
 * a wrong row in `FLOOR_SLABS` rather than anything the bake can recover from,
 * so it throws with the place named.
 */
const refuseUnlessTheSlabsTileTheFloor = (laid: readonly string[]): void => {
  const places = new Set(laid);
  if (places.size !== laid.length) {
    throw new Error('two slabs cover one floor cell');
  }
  if (places.size !== FLOOR_COLUMNS * FLOOR_ROWS) {
    throw new Error(
      `the slabs cover ${places.size} of the floor's ${FLOOR_COLUMNS * FLOOR_ROWS} cells`,
    );
  }
};

/** The whole floor, desaturated before it is laid so a dissolved groove is a grey. */
const bakeFloor = (): PNG => {
  const sheet = stagedSheet(TILE_SHEET);
  desaturate(sheet);
  const base = baseGreyOf(sheet);
  const floor = new PNG({
    width: FLOOR_COLUMNS * FLOOR_CELL,
    height: FLOOR_ROWS * FLOOR_CELL,
  });
  const laid = FLOOR_SLABS.flatMap((slab) => laySlab(slab, sheet, base, floor));
  refuseUnlessTheSlabsTileTheFloor(laid);
  return floor;
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

const importFloor = (): number => writeImported(FLOOR_FILE, bakeFloor());

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
  const written = [
    importFloor(),
    ...GROUND.map(importWhole),
    ...SPRITES.map(importCell),
  ];
  const bytes = written.reduce((total, size) => total + size, 0);
  console.log(
    `${written.length} grayscale files, ${bytes} bytes, under ${relative(APP, IMPORTED)}`,
  );
};

main();
