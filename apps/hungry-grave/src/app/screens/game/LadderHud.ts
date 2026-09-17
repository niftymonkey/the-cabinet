// The ladder HUD: the slim row at the field's top edge carrying the score and
// every rostered line's rungs as marks (design record R1, R2, R3, R11).

import { Container, Graphics } from 'pixi.js';

import type { WeaponLine } from '../../../game/lines/roster';
import { MAX_LEVEL } from '../../../game/lines/roster';
import { HUD_BAND } from '../../layout';
import { PALETTE } from '../../palette';
import { scoreReading, SCORE_DIGITS } from '../scoreReading';
import { Label } from '../../ui/Label';
import { drawPowerUpIcon } from './foodSprite';
import type { RunIdentity, RunReadout } from './runSession';
import type { WatchedLoss } from './watchedLoss';
import { lossReading } from './watchedLoss';

/**
 * How far in from the field's own edges the content starts.
 *
 * Every measurement in this file is in field units, because the row is drawn in
 * field units and scaled by the field's placement: that is what makes one mark
 * subtend the same fraction of the field on a 320-wide phone and on a 1440-wide
 * desktop (record R1). Nothing here knows about the viewport, which stays
 * `layout.ts`'s alone.
 */
const ROW_MARGIN = 10;

/**
 * How far the content sits below the band's top edge. `layout.ts` declares a
 * band of 28 around an icon of 24 with two units of padding above and below,
 * and this is that padding's upper half.
 */
const BAND_PAD = 2;

// The square a line's silhouette fills, which is what the band's height was declared from.
const ICON_BOX = 24;

// Between a line's icon and its first mark, wider than the gap between two marks so the icon reads as the group's head.
const ICON_GAP = 4;

/** One rung's mark, which `layout.ts` declares and this file may not move. */
const MARK = HUD_BAND.mark;

/**
 * The empty mark's outline, and it is the ruler the fill is read against.
 *
 * Five marks is past the subitizing limit of four (Kaufman et al. 1949), so a
 * player reads fill length against the outline's full length rather than
 * counting, and an outline too thin to see takes the reading with it. The floor
 * is `foodSprite`'s own `SPRITE_STROKE` at the narrowest phone in the sweep,
 * which the record states as 0.89 CSS pixels. 1.5 units measures 0.8889 there,
 * a thousandth under its own stated floor, because the floor was derived at
 * 0.59 CSS pixels per field unit and the true figure is 0.5926. 1.6 clears it
 * at 0.948 and still leaves the filled mark twice the ink of the empty one.
 */
const MARK_STROKE = 1.6;

/**
 * Between two marks of one line. Three units is the record's figure and
 * measures 1.7778 CSS pixels at the narrowest phone against its own stated
 * floor of 1.8, by the same rounding as the stroke above; 3.2 measures 1.896.
 */
const MARK_GAP = 3.2;

// Between one line's group and the next, twice the gap inside a group, so the groups separate before the marks do.
const GROUP_GAP = MARK_GAP * 2;

const SCORE_FONT_SIZE = 18;

/**
 * How wide a readout's widest reading is, by the advance bound the corner
 * stack is held to as well: common monospace faces sit at or under 0.602 em, so
 * 0.62 is a bound rather than a measurement, and the rendered check is where
 * the real width is read.
 */
const MONOSPACE_ADVANCE_MAX = 0.62;
const budgetFor = (characters: number, fontSize: number): number =>
  characters * fontSize * MONOSPACE_ADVANCE_MAX;

const SCORE_BUDGET = budgetFor(SCORE_DIGITS, SCORE_FONT_SIZE);

// Between the digits and the cushion's mark, and between that mark and the bank.
const SCORE_GAP = 4;

/**
 * The bank's widest reading: every carrier the stage schedules killed with the
 * offer never resolved, which is two digits and the marker in front of them.
 * The size is a first figure and it is the row's smallest reading, because the
 * score and the rungs are what a glance is spent on.
 */
const BANK_FONT_SIZE = 12;
const BANK_BUDGET = budgetFor(3, BANK_FONT_SIZE);

// One line's whole group: its icon, then its five marks.
const GROUP_WIDTH =
  ICON_BOX + ICON_GAP + MAX_LEVEL * MARK + (MAX_LEVEL - 1) * MARK_GAP;

// The score, its cushion and the bank, which is the row's left-hand group.
const SCORE_GROUP_WIDTH =
  SCORE_BUDGET + SCORE_GAP + MARK + SCORE_GAP + BANK_BUDGET;

// Where the content's own middle sits inside the band.
const CONTENT_MIDDLE = BAND_PAD + ICON_BOX / 2;

const MARK_TOP = CONTENT_MIDDLE - MARK / 2;

/** One rung's mark: an outline and a fill of one ink at one outer extent. */
interface Mark {
  readonly view: Container;
  readonly fill: Graphics;
}

/** One line's row: the silhouette it is known by, and its rungs. */
interface LineRow {
  readonly view: Container;
  readonly icon: Graphics;
  readonly marks: readonly Mark[];
}

/** A dumb view of the ladder and the score: data in, pixels out. */
interface LadderHud {
  readonly view: Container;
  // The roster, written once when the run starts: one row per line it names.
  showIdentity(identity: RunIdentity): void;
  /**
   * Everything that changes as the run goes, plus whatever loss the driver is
   * still watching. The loss arrives from outside because it is born of an
   * event: a view that read it off a falling score would be a second
   * implementation of the rule, and a diff cannot tell a bleed from an overflow
   * that happened to be negative (record R5).
   */
  render(readout: RunReadout, loss: WatchedLoss): void;
}

/**
 * One mark, as two bodies of the same ink at the same outer extent.
 *
 * Both are drawn once and the fill is shown or hidden, so no frame rebuilds any
 * geometry. The fill covers the outline exactly, which is why a filled mark is
 * a solid square and an empty one is the band the outline leaves: they differ
 * by area and by no step in value, which is the one channel ADR 0054's reading
 * of ADR 0014 leaves open (record R2).
 */
const createMark = (): Mark => {
  const view = new Container();
  view.label = 'mark';
  const inset = MARK_STROKE / 2;
  const outline = new Graphics()
    .rect(inset, inset, MARK - MARK_STROKE, MARK - MARK_STROKE)
    .stroke({
      width: MARK_STROKE,
      color: PALETTE.hudInk.hex,
      alignment: 0.5,
    });
  outline.label = 'outline';
  const fill = new Graphics()
    .rect(0, 0, MARK, MARK)
    .fill({ color: PALETTE.hudInk.hex });
  fill.label = 'fill';
  view.addChild(outline, fill);
  return { view, fill };
};

/**
 * How much of a mark's body is drawn, as a share of its own square. The body
 * drains from the top down, so a mark on its way out loses area and takes no
 * step in value and no step in brightness, which is R2's rule holding at the
 * moment of the loss as much as before it (ADR 0014).
 *
 * At nothing left it is hidden, so an emptied mark is exactly the empty mark
 * the row already draws rather than a second state that resembles it.
 */
const fillMark = (mark: Mark, share: number): void => {
  const held = Math.max(0, Math.min(1, share));
  mark.fill.visible = held > 0;
  mark.fill.scale.set(1, held);
  mark.fill.position.set(0, MARK * (1 - held));
};

/**
 * How full one rung's mark draws: solid below the line's level, emptying at the
 * level itself while a strip is still being watched, and empty above.
 *
 * The emptying mark is the one at the level rather than one above it, because
 * the sim has already taken the rung: the mark the player watches leave is the
 * top one the line no longer has.
 */
const markShare = (rung: number, filled: number, emptying: number): number => {
  if (rung < filled) return 1;
  return rung === filled ? emptying : 0;
};

/**
 * A line's silhouette at the row's own size, reusing the vocabulary the offer's
 * body already teaches (`foodSprite.ts`), so the body and the row never
 * disagree and a fallen rung can wear the icon its row taught (record R6).
 */
const drawLineIcon = (into: Graphics, line: WeaponLine): void => {
  into.clear();
  drawPowerUpIcon(into, line, ICON_BOX / 2);
  into.fill({ color: PALETTE.hudInk.hex });
};

const createLineRow = (): LineRow => {
  const view = new Container();
  const icon = new Graphics();
  icon.label = 'icon';
  icon.position.set(ICON_BOX / 2, CONTENT_MIDDLE);
  const marks = Array.from({ length: MAX_LEVEL }, (_, rung) => {
    const mark = createMark();
    mark.view.position.set(
      ICON_BOX + ICON_GAP + rung * (MARK + MARK_GAP),
      MARK_TOP,
    );
    return mark;
  });
  view.addChild(icon, ...marks.map((mark) => mark.view));
  return { view, icon, marks };
};

/** A readout's own label: left-anchored, centred on the content, in the row's ink. */
const rowLabel = (name: string, fontSize: number, x: number): Label => {
  const label = new Label({
    style: { fontFamily: 'monospace', fill: PALETTE.hudInk.hex, fontSize },
  });
  label.label = name;
  // Label centres itself by default, which would put the digits half a budget
  // to the left of where the row lays them out.
  label.anchor.set(0, 0.5);
  label.position.set(x, CONTENT_MIDDLE);
  return label;
};

/**
 * The bank's reading: how many carriers are waiting their turn behind the live
 * offer (ADR 0034), and nothing at all when none are.
 *
 * Empty at zero rather than showing a nought, because the bank exists so a
 * burst of paying kills still reads as paid and a standing nought would be one
 * more number the player learns to stop reading.
 */
const bankReading = (banked: number): string =>
  banked > 0 ? `+${banked}` : '';

/** How many of a line's marks are filled at a level. */
const filledMarks = (level: number): number =>
  Math.max(0, Math.min(MAX_LEVEL, Math.floor(level)));

const createLadderHud = (): LadderHud => {
  const view = new Container();
  const score = rowLabel('score', SCORE_FONT_SIZE, ROW_MARGIN);
  const cushion = createMark();
  cushion.view.label = 'cushion';
  cushion.view.position.set(ROW_MARGIN + SCORE_BUDGET + SCORE_GAP, MARK_TOP);
  const bank = rowLabel(
    'bank',
    BANK_FONT_SIZE,
    ROW_MARGIN + SCORE_BUDGET + SCORE_GAP + MARK + SCORE_GAP,
  );
  const rows = new Container();
  rows.label = 'rows';
  rows.position.set(ROW_MARGIN + SCORE_GROUP_WIDTH + GROUP_GAP, 0);
  view.addChild(score, cushion.view, bank, rows);

  /**
   * The rows, kept across runs. The screen holding this is pooled, so a fresh
   * row per run would allocate one graph per run and leave the old one for the
   * collector; the roster decides which of these are on the stage.
   */
  const pool: LineRow[] = [];
  const shown: { line: WeaponLine; row: LineRow }[] = [];

  const rowAt = (index: number): LineRow => {
    while (pool.length <= index) pool.push(createLineRow());
    // The loop above fills every index up to the one asked for.
    return pool[index]!;
  };

  return {
    view,
    showIdentity(identity) {
      rows.removeChildren();
      shown.length = 0;
      identity.roster.forEach((line, index) => {
        const row = rowAt(index);
        row.view.label = line;
        row.view.position.set(index * (GROUP_WIDTH + GROUP_GAP), 0);
        drawLineIcon(row.icon, line);
        rows.addChild(row.view);
        shown.push({ line, row });
      });
    },
    render(readout, loss) {
      const watched = lossReading(loss, readout);
      score.text = scoreReading(watched.score);
      fillMark(cushion, watched.cushion);
      bank.text = bankReading(readout.bankedOffers);
      for (const { line, row } of shown) {
        const filled = filledMarks(readout.levels[line]);
        const emptying = watched.emptying[line] ?? 0;
        row.marks.forEach((mark, rung) =>
          fillMark(mark, markShare(rung, filled, emptying)),
        );
      }
    },
  };
};

export { createLadderHud };
export type { LadderHud };
