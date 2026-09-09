// The stand-in ground's own art: the tile the ground is laid from, the three
// sections' dressing sets, and the seeded stream that places them (ADR 0049,
// decision 22's amendment, design record stage-floor.md section 7).

import type { PhaseName } from '../../../game/stage/stage';
import type { PaletteEntry } from '../../palette';
import { PALETTE } from '../../palette';

/** The bundle the stand-in art ships in. No screen declares it (slice 13a). */
const STAND_IN_BUNDLE = 'standIn';

/** A rectangle of a staged sheet, in that sheet's own pixels. */
interface Cell {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * One piece of stand-in art: the alias it loads under, and the cell of it to
 * draw where the pack ships an animation sheet rather than a single frame.
 *
 * The cells were read off the imported PNGs rather than guessed: every one of
 * them is the frame whose opaque pixels the sheet actually carries, which for
 * the Crowd's little eyes is not frame zero, because the first eleven cells of
 * that sheet are empty and the eye opens across the middle of it.
 */
interface StandInArt {
  readonly alias: string;
  readonly cell: Cell | null;
}

const singleFrame = (alias: string): StandInArt => ({ alias, cell: null });

const sheetCell = (
  alias: string,
  x: number,
  width: number,
  height: number,
): StandInArt => ({ alias, cell: { x, y: 0, width, height } });

/**
 * The floor itself, one for all three sections because the rock is the same
 * rock (design record section 7). It wears `nightSpeckle`, which was declared
 * with no consumer in `src/app` at all and is a ready-made ground colour; the
 * floor is its consumer.
 *
 * It is the floor the import bakes and never the pack's own tile sheet: that
 * sheet is twenty bordered blocks lit at twenty angles, and tiled whole it read
 * as a lattice of loose blocks rather than as a floor (Mark, 2026-09-08). The
 * bake and its layout live in `scripts/grayscale-import.ts`; the renderer draws
 * one texture and knows nothing of the layout.
 */
const GROUND_FLOOR = singleFrame('standIn/ground/floor.png');
const GROUND_TINT: PaletteEntry = PALETTE.nightSpeckle;

/** The Waking's own source, dormant and awake, both single frames. */
const SOURCE_DORMANT = singleFrame('standIn/ground/waking-dormant.png');
const SOURCE_AWAKE = singleFrame('standIn/ground/waking-awake.png');

/**
 * The Crowd's eye dressing, in its sheet's own pixels. It is the one dimension
 * the Waking's source is sized against, so it is declared rather than read off
 * a texture that may not have loaded yet.
 */
const EYE_CELL_PIXELS = 16;

/** One section's dressing: what it places, and the one colour it places it in. */
interface DressingSet {
  readonly tint: PaletteEntry;
  readonly art: readonly StandInArt[];
}

/**
 * The three sets, from the design record's section 7. The Procession is bare
 * rock with a statue every few seconds, the Crowd is the same rock veined and
 * wet, and in the Vigil the rock stops reading as rock.
 *
 * The record names Cracks among the Procession's, and it is not here. It is a
 * terrain overlay rather than a detail sprite: 32 by 32 of fully opaque pixels
 * spanning two greys, so on the ground it draws as a solid rectangle of the
 * section's own colour, which the rendered check showed as a bright block
 * sitting on the rock. The four statues and the cliff carry the section.
 */
const DRESSING_SETS = {
  procession: {
    tint: PALETTE.standInGroundDressCold,
    art: [
      singleFrame('standIn/ground/statue-a1.png'),
      singleFrame('standIn/ground/statue-a2.png'),
      singleFrame('standIn/ground/statue-b1.png'),
      singleFrame('standIn/ground/statue-b2.png'),
      singleFrame('standIn/ground/statue-c1.png'),
      singleFrame('standIn/ground/statue-c2.png'),
      singleFrame('standIn/ground/book-altar.png'),
      // The left column of a two-piece sheet whose top right cell is a solid
      // black block, which drew as a hole in the rock until it was cut out.
      sheetCell('standIn/ground/cliff.png', 0, 48, 112),
    ],
  },
  crowd: {
    tint: PALETTE.standInGroundDressWet,
    art: [
      singleFrame('standIn/ground/urn-1.png'),
      singleFrame('standIn/ground/urn-2.png'),
      singleFrame('standIn/ground/short-vein-column-1.png'),
      singleFrame('standIn/ground/short-vein-column-2.png'),
      singleFrame('standIn/ground/tall-vein-column-1.png'),
      singleFrame('standIn/ground/tall-vein-column-2.png'),
      // The fullest frame of each vein's own pulse, off sheets of 32 by 16
      // frames that differ from one another only by where in that pulse they
      // stand.
      sheetCell('standIn/ground/vein-a.png', 8 * 32, 32, 16),
      sheetCell('standIn/ground/vein-b.png', 9 * 32, 32, 16),
      // The open eye of a 36-cell sheet whose first eleven cells are empty.
      sheetCell(
        'standIn/ground/little-eyes.png',
        13 * EYE_CELL_PIXELS,
        EYE_CELL_PIXELS,
        EYE_CELL_PIXELS,
      ),
    ],
  },
  vigil: {
    tint: PALETTE.standInVigilTint,
    art: [
      sheetCell('standIn/ground/floating-rock-a1.png', 0, 32, 32),
      sheetCell('standIn/ground/floating-rock-a2.png', 0, 32, 32),
      sheetCell('standIn/ground/floating-rock-b1.png', 0, 16, 32),
      sheetCell('standIn/ground/floating-rock-b2.png', 0, 16, 32),
      singleFrame('standIn/ground/amalgam-arc-1.png'),
      singleFrame('standIn/ground/amalgam-arc-2.png'),
      sheetCell('standIn/ground/eye.png', 0, 32, 32),
      sheetCell('standIn/ground/tentacle.png', 0, 48, 64),
    ],
  },
} as const satisfies Record<string, DressingSet>;

type DressingSetName = keyof typeof DRESSING_SETS;

/**
 * Which set each phase places, so the ground turns over once per section
 * (ADR 0049). A section's boundary event wears the section it ends: the
 * Banshee keeps the Procession's statues and the Waking keeps the Crowd's
 * veins, because the Vigil's teal is the run's one colour addition and the
 * addition has to be the event, which it cannot be if it is already on screen
 * under the Crowd's own boundary (design record section 7).
 *
 * It is also what keeps the drift a function of the tick alone. Every phase
 * that inherits its predecessor's set is at least one whole drift window past
 * the change before it, so a sprite still falling can never belong to a set
 * two phases back, and the renderer never has to remember one.
 */
const DRESSING_BY_PHASE: Record<PhaseName, DressingSetName> = {
  procession: 'procession',
  banshee: 'procession',
  crowd: 'crowd',
  waking: 'crowd',
  vigil: 'vigil',
  undertaker: 'vigil',
  over: 'vigil',
};

/**
 * A stable draw for one placement in the stream.
 *
 * The stream is a function of the placement's index and nothing else, because
 * a replay renders a pinned tape at a chosen tick: a ground that depended on
 * which frames had been drawn on the way there would put its statues somewhere
 * else in the recording than it did in the run.
 */
const streamDraw = (index: number, salt: number): number => {
  // The three mixers and the two salts are written in decimal rather than in
  // hex, because a module that draws during a run may carry no hex literal at
  // all (palette.test.ts's source scan) and a scan that reads a constant as a
  // colour is right to: this file is where a colour would be smuggled in.
  let mixed = Math.imul(index ^ salt, 668265261) >>> 0;
  mixed ^= mixed >>> 15;
  mixed = Math.imul(mixed, 2246822507) >>> 0;
  mixed ^= mixed >>> 13;
  return (mixed >>> 0) / 4294967296;
};

// Two draws off one index, so which piece is placed and where it stands are independent.
const ART_SALT = 6240913;
const ACROSS_SALT = 1871479;

/** Which piece of a set's art the stream places at this index. */
const artAt = (set: DressingSet, index: number): StandInArt => {
  const piece =
    set.art[Math.floor(streamDraw(index, ART_SALT) * set.art.length)];
  if (piece === undefined) throw new Error('a dressing set carries no art');
  return piece;
};

/** Where across the field the stream places this index, as a share of the width. */
const acrossAt = (index: number): number => streamDraw(index, ACROSS_SALT);

export {
  STAND_IN_BUNDLE,
  GROUND_FLOOR,
  GROUND_TINT,
  SOURCE_DORMANT,
  SOURCE_AWAKE,
  EYE_CELL_PIXELS,
  DRESSING_SETS,
  DRESSING_BY_PHASE,
  artAt,
  acrossAt,
};
export type { StandInArt, DressingSetName };
