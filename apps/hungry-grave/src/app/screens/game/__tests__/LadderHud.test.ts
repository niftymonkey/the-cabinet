/**
 * The ladder HUD: a roster and a readout in, a row of marks out, and nothing of
 * its own between renders (design record R1, R2, R3, R11).
 */

import { Container, Graphics } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';

import { resize } from '../../../../engine/resize/resize';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../../../game/field';
import type { WeaponLine } from '../../../../game/lines/roster';
import { MAX_LEVEL, WEAPON_LINES } from '../../../../game/lines/roster';
import { openOffer, resolveOffer } from '../../../../game/offer';
import type { RunState } from '../../../../game/run';
import { createRun } from '../../../../game/run';
import { INVULNERABLE_TICKS } from '../../../../game/tuning';
import { BOUNDARY_STROKE, fitField, HUD_BAND } from '../../../layout';
import { PALETTE } from '../../../palette';
import type { RunIdentity, RunReadout } from '../runSession';

/**
 * The real widget needs a renderer: text metrics and a loaded texture. The mock
 * keeps the style it was built with, because the drawn font size is what the
 * width bound below is taken against.
 */
vi.mock('../../../ui/Label', () => ({
  Label: class extends Container {
    public text = '';
    public anchor = { set: () => {} };
    public style: { fontSize?: number };
    constructor(opts?: { style?: { fontSize?: number } }) {
      super();
      this.style = opts?.style ?? {};
    }
  },
}));

import { createLadderHud } from '../LadderHud';
import {
  NO_LOSS_WATCHED,
  RUNG_STRIP_TICKS,
  SCORE_BLEED_TICKS,
  watchLoss,
} from '../watchedLoss';

/**
 * An upper bound on a monospace advance, as a share of the font size. Common
 * monospace faces sit between 0.5 and 0.6 em, and DejaVu Sans Mono, Menlo and
 * Consolas are all at or under 0.602, so 0.62 is a bound rather than a
 * measurement.
 *
 * It is arithmetic and not a measurement because pixi cannot measure text
 * without a document, and this environment has none. The dispatch's rendered
 * check is where the real read happens; this is the instrument that survives a
 * wider readout being added. `layering.test.ts` holds the corner stack to the
 * same bound for the same reason.
 */
const MONOSPACE_ADVANCE_MAX = 0.62;

/** The viewports the row is measured at, narrowest first. */
const VIEWPORTS = [
  { name: 'narrow phone', width: 320, height: 460 },
  { name: 'iPhone 15', width: 390, height: 844 },
  { name: 'phone at svh 660', width: 393, height: 660 },
  { name: 'tablet portrait', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

/** How many CSS pixels one field unit is worth at a viewport. */
const cssPerFieldUnit = (width: number, height: number): number => {
  const stage = resize(width, height, FIELD_WIDTH, FIELD_HEIGHT, false);
  return fitField(stage.width, stage.height).scale * (width / stage.width);
};

/** An identity as the session writes one, carrying the roster under test. */
const identityWith = (roster: readonly WeaponLine[]): RunIdentity => ({
  seed: 424242,
  roster,
  seedPinned: false,
  pinnedSize: null,
  pinnedLevels: null,
});

/** A readout as the session writes one, with everything not under test at rest. */
const readoutWith = (over: Partial<RunReadout> = {}): RunReadout => ({
  debtTicks: 0,
  tick: 0,
  score: 0,
  levels: { skullStream: 0, territory: 0, wisps: 0, bell: 0 },
  scoreRungBled: false,
  bankedOffers: 0,
  faults: [],
  ...over,
});

/** A readout off a real run, exactly the fields the session reads off one. */
const readoutOf = (run: RunState): RunReadout =>
  readoutWith({
    tick: run.tick,
    score: run.score,
    levels: { ...run.levels },
    scoreRungBled: run.grave.scoreRungBled,
    bankedOffers: run.bankedOffers,
  });

const named = (parent: Container, label: string): Container => {
  const found = parent.children.find((child) => child.label === label);
  if (found === undefined) throw new Error(`the row drew no ${label}`);
  return found as Container;
};

/** The line rows the view is drawing, in the order it draws them. */
const rowsOf = (view: Container): Container[] =>
  named(view, 'rows').children as Container[];

/** One row's marks, in the order it draws them. */
const marksOf = (row: Container): Container[] =>
  row.children.filter((child) => child.label === 'mark') as Container[];

/** Whether a mark is drawing its filled body rather than its outline alone. */
const isFilled = (mark: Container): boolean => named(mark, 'fill').visible;

/** One row read as the player reads it: the line, then a mark per rung. */
const readRow = (row: Container): string =>
  `${row.label} ${marksOf(row)
    .map((mark) => (isFilled(mark) ? 'x' : '.'))
    .join('')}`;

/** Every line row the view drew, each read the same way. */
const readRows = (view: Container): string[] => rowsOf(view).map(readRow);

/** A hud showing a roster, with nothing rendered into it yet. */
const hudShowing = (roster: readonly WeaponLine[]) => {
  const hud = createLadderHud();
  hud.showIdentity(identityWith(roster));
  return hud;
};

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

const merged = (boxes: readonly Box[]): Box => ({
  left: Math.min(...boxes.map((box) => box.left)),
  top: Math.min(...boxes.map((box) => box.top)),
  right: Math.max(...boxes.map((box) => box.right)),
  bottom: Math.max(...boxes.map((box) => box.bottom)),
});

/**
 * Every box the view draws, in the row's own field units: a Graphics measured
 * off its geometry, and a label measured off its drawn text and drawn font size
 * through the advance bound above.
 */
const boxesIn = (node: Container, atX: number, atY: number): Box[] => {
  // What is drawn, so a body the row is hiding measures as nothing: a mark's
  // empty body is parked at the bottom of its own square and would otherwise
  // report ink the row never puts on the screen.
  if (!node.visible) return [];
  const x = atX + node.x;
  const y = atY + node.y;
  const text = (node as { text?: string }).text;
  if (typeof text === 'string') {
    if (text === '') return [];
    const size =
      (node as unknown as { style: { fontSize?: number } }).style.fontSize ?? 0;
    const width = text.length * size * MONOSPACE_ADVANCE_MAX;
    // Every label in the row is anchored to its own left edge and centred on
    // the content's middle, which is what the row positions them by.
    return [
      { left: x, top: y - size / 2, right: x + width, bottom: y + size / 2 },
    ];
  }
  if (node instanceof Graphics) {
    // Scaled by its own transform, because a body part way through emptying is
    // drawn at a share of its geometry and the box has to say so. Every
    // container between here and the row is unscaled; the placement's own scale
    // is applied outside this view.
    const bounds = node.getLocalBounds();
    return [
      {
        left: x + bounds.minX * node.scale.x,
        top: y + bounds.minY * node.scale.y,
        right: x + bounds.maxX * node.scale.x,
        bottom: y + bounds.maxY * node.scale.y,
      },
    ];
  }
  return node.children.flatMap((child) => boxesIn(child as Container, x, y));
};

/** The whole row's content, measured as one box in field units. */
const contentOf = (view: Container): Box => merged(boxesIn(view, 0, 0));

/** Every colour the view's own drawing records, as the palette hexes it named. */
const colorsIn = (node: Container): number[] => {
  if (node instanceof Graphics) {
    return node.context.instructions.flatMap((instruction) => {
      const style = (instruction.data as { style?: { color?: number } }).style;
      return style?.color === undefined ? [] : [style.color];
    });
  }
  return node.children.flatMap((child) => colorsIn(child as Container));
};

/** The stroke width a Graphics drew with, or null where it only filled. */
const strokeWidthOf = (drawn: Graphics): number | null => {
  for (const instruction of drawn.context.instructions) {
    if (instruction.action !== 'stroke') continue;
    const style = (instruction.data as { style?: { width?: number } }).style;
    if (style?.width !== undefined) return style.width;
  }
  return null;
};

/**
 * How much ink a mark's body puts on the field, in square field units, off the
 * body's own drawn geometry: a fill covers its whole square, and a stroke
 * covers the band between its outer edge and the hole it leaves.
 */
const inkOf = (body: Graphics): number => {
  const bounds = body.getLocalBounds();
  const side = bounds.maxX - bounds.minX;
  const stroke = strokeWidthOf(body);
  if (stroke === null) return side * side;
  const hole = side - 2 * stroke;
  return side * side - hole * hole;
};

const markBody = (mark: Container, label: string): Graphics =>
  named(mark, label) as unknown as Graphics;

/** The gap between two marks of a row, in field units. */
const markGapOf = (row: Container): number => {
  const marks = marksOf(row);
  const first = marks[0];
  const second = marks[1];
  if (first === undefined || second === undefined) {
    throw new Error('a row drew fewer than two marks');
  }
  const width = markBody(first, 'fill').getLocalBounds().maxX;
  return second.x - first.x - width;
};

/** Every line at one level, which is the shape run.levels always has. */
const uniform = (level: number): Record<WeaponLine, number> => ({
  skullStream: level,
  territory: level,
  wisps: level,
  bell: level,
});

/** What the score's digits read. */
const scoreOf = (view: Container): string =>
  (named(view, 'score') as unknown as { text: string }).text;

/** What the bank reads, which is nothing at all at zero. */
const bankOf = (view: Container): string =>
  (named(view, 'bank') as unknown as { text: string }).text;

/** Everything the view is drawing, as one comparable reading. */
const drawing = (view: Container): string[] => [
  scoreOf(view),
  bankOf(view),
  `cushion ${isFilled(named(view, 'cushion'))}`,
  ...readRows(view),
];

/** Which of two readings of the rows changed, named line by line. */
/**
 * How much of a mark's own square its body currently covers, as a share of that
 * square, off the body's drawn geometry and its transform. Area is the channel
 * R2 leaves open, so area is what this reads.
 */
const areaShareOf = (mark: Container): number => {
  const fill = markBody(mark, 'fill');
  if (!fill.visible) return 0;
  const bounds = fill.getLocalBounds();
  const drawn =
    (bounds.maxX - bounds.minX) *
    fill.scale.x *
    ((bounds.maxY - bounds.minY) * fill.scale.y);
  return drawn / (HUD_BAND.mark * HUD_BAND.mark);
};

/** The mark a line is currently emptying, which is the one at its own level. */
const markAtLevel = (view: Container, level: number): Container => {
  const mark = marksOf(rowsOf(view)[0]!)[level];
  if (mark === undefined) throw new Error(`the row drew no mark at ${level}`);
  return mark;
};

const differences = (before: string[], after: string[]): string[] =>
  after.flatMap((row, index) =>
    row === before[index] ? [] : [`${before[index]} to ${row}`],
  );

describe('the ladder HUD', () => {
  it("draws one row per line in the run's roster, in roster order, and none for a line it does not name", () => {
    // Record R3: the roster is resolved once at createRun and recorded in the
    // tape header (ADR 0046), and a HUD driven by the build's WEAPON_LINES
    // would draw a row for a line the run never had.
    const hud = hudShowing(['wisps', 'skullStream']);
    hud.render(readoutWith({ levels: uniform(1) }), NO_LOSS_WATCHED);

    expect(rowsOf(hud.view).map((row) => row.label)).toEqual([
      'wisps',
      'skullStream',
    ]);
  });

  it('draws a rostered line at level zero with its marks and none of them filled', () => {
    // A line at zero can still be offered, so it keeps its place in the row:
    // what says it is unowned is five empty marks rather than an absence.
    const hud = hudShowing(['territory']);
    hud.render(readoutWith({ levels: uniform(0) }), NO_LOSS_WATCHED);

    expect(marksOf(rowsOf(hud.view)[0]!).length).toBe(MAX_LEVEL);
    expect(readRows(hud.view)).toEqual(['territory .....']);
  });

  it('differs a filled mark from an empty one by area and by no step in value', () => {
    // Record R2 and ADR 0054's reading of ADR 0014: the HUD announces by count,
    // by shape or by subtraction and never by getting brighter, so a lit mark
    // and an unlit one cannot differ in value and hue vanishes in grayscale,
    // which leaves area. The pair is hudInk against itself.
    const hud = hudShowing(['skullStream']);
    hud.render(readoutWith({ levels: uniform(1) }), NO_LOSS_WATCHED);
    const mark = marksOf(rowsOf(hud.view)[0]!)[0]!;

    const fill = markBody(mark, 'fill');
    const outline = markBody(mark, 'outline');
    expect(new Set(colorsIn(hud.view))).toEqual(new Set([PALETTE.hudInk.hex]));
    expect(fill.getLocalBounds().maxX).toBeCloseTo(
      outline.getLocalBounds().maxX,
      6,
    );
    expect(inkOf(fill) / inkOf(outline)).toBeGreaterThanOrEqual(1.8);
  });

  it('fits its measured content inside the band layout.ts declares, at the narrowest shipped phone', () => {
    // layout.ts declares the band and asserts nothing about what fills it; this
    // is the other half, and it is the split READOUT_RESERVE already uses. The
    // widest case is a full roster with the widest score and the widest bank
    // the stage can ever stand behind a live offer.
    const hud = hudShowing(WEAPON_LINES);
    hud.render(
      readoutWith({ score: 999999, bankedOffers: 25 }),
      NO_LOSS_WATCHED,
    );

    const content = contentOf(hud.view);
    expect(`top ${content.top >= 0}`).toBe('top true');
    expect(`bottom ${content.bottom <= HUD_BAND.height}`).toBe('bottom true');
    expect(`left ${content.left >= 0}`).toBe('left true');
    expect(`right ${content.right <= FIELD_WIDTH}`).toBe('right true');
  });

  it('draws a mark, an outline and a gap that clear their own floors at every viewport in the sweep', () => {
    // Slice K proved a filled band legible in grayscale at 6.25 CSS pixels
    // (round two note section 13). Five marks is past the subitizing limit of
    // four (Kaufman 1949), so the reading is fill length against the outline's
    // full length rather than a count, and an outline too thin to see takes the
    // reading with it: the outline's floor is foodSprite's own SPRITE_STROKE at
    // the narrowest phone and the gap's is three field units at the same scale.
    const hud = hudShowing(['bell']);
    hud.render(readoutWith({ levels: uniform(5) }), NO_LOSS_WATCHED);
    const row = rowsOf(hud.view)[0]!;
    const mark = marksOf(row)[0]!;
    const side = markBody(mark, 'fill').getLocalBounds().maxX;
    const stroke = strokeWidthOf(markBody(mark, 'outline'));
    const gap = markGapOf(row);

    for (const viewport of VIEWPORTS) {
      const css = cssPerFieldUnit(viewport.width, viewport.height);
      expect(`${viewport.name} mark ${side * css >= 6.25}`).toBe(
        `${viewport.name} mark true`,
      );
      expect(`${viewport.name} outline ${(stroke ?? 0) * css >= 0.89}`).toBe(
        `${viewport.name} outline true`,
      );
      expect(`${viewport.name} gap ${gap * css >= 1.8}`).toBe(
        `${viewport.name} gap true`,
      );
    }
  });

  it("is never mistaken for the field's boundary at the narrowest phone", () => {
    // ADR 0039 makes the boundary a readout in its own right, so a second
    // readout on the same frame has to be told from it. The predicate is two
    // numbers: the unpainted field between the row's content and the boundary's
    // stroke, and the luma between the mark's ink and the stroke's. The row
    // draws over the field's top edge at this viewport, where its own two units
    // of padding are exactly the boundary's own stroke, so the gap leg does not
    // carry the reading and the luma leg does.
    const hud = hudShowing(WEAPON_LINES);
    hud.render(readoutWith({ levels: uniform(3) }), NO_LOSS_WATCHED);
    const narrow = VIEWPORTS[0];
    const css = cssPerFieldUnit(narrow.width, narrow.height);
    const gap = (contentOf(hud.view).top - BOUNDARY_STROKE) * css;
    const luma = PALETTE.hudInk.luma - PALETTE.fieldFrame.luma;

    expect(
      `gap ${gap >= 0.5} luma ${luma >= 2.0} separable ${gap >= 0.5 || luma >= 2.0}`,
    ).toBe('gap false luma true separable true');
  });

  it('fills exactly one more mark when a power-up is swallowed, on the line it levelled', () => {
    // Asserted on the marks the view drew and never on the readout it was
    // handed: run.levels is mutated in place, so a test reading the readout
    // would pass over a view that never drew anything.
    const run = createRun(20260916);
    const hud = hudShowing(run.roster);
    hud.render(readoutOf(run), NO_LOSS_WATCHED);
    const before = readRows(hud.view);

    openOffer(run, run.grave.x, run.grave.y);
    const offer = run.offer!;
    const taken = offer.options.indexOf('wisps');
    resolveOffer(run, offer.bodyIds[taken]!);
    hud.render(readoutOf(run), NO_LOSS_WATCHED);

    expect(differences(before, readRows(hud.view))).toEqual([
      'wisps ..... to wisps x....',
    ]);
  });

  it("reads the run's own score at six digits, in a form the cushion never changes", () => {
    // Trash pays 100 and an elite eight times it, so at the storm's measured
    // 2.47 kills a second a run passes five digits in about forty seconds and a
    // long one reaches six. The digits stay solid whatever the cushion says,
    // because an outline reads as not-real and the score is real at every
    // moment, spent rung or not (record R2, orchestrator 2026-09-16).
    const hud = hudShowing(['skullStream']);

    hud.render(readoutWith({ score: 0 }), NO_LOSS_WATCHED);
    expect(scoreOf(hud.view)).toBe('000000');

    hud.render(readoutWith({ score: 12400 }), NO_LOSS_WATCHED);
    expect(scoreOf(hud.view)).toBe('012400');

    hud.render(
      readoutWith({ score: 12400, scoreRungBled: true }),
      NO_LOSS_WATCHED,
    );
    expect(scoreOf(hud.view)).toBe('012400');
  });

  it('fills the cushion beside the score while the score rung is armed and empties it while it is spent', () => {
    // Record R4's memory, read as the one thing the player needs off the score:
    // whether the rung is still there to absorb a floor hit. It says it by area
    // and not by brightness, the same rule a line's mark is under, which is what
    // lets one vocabulary animate both.
    const hud = hudShowing(['skullStream']);

    hud.render(readoutWith({ scoreRungBled: false }), NO_LOSS_WATCHED);
    expect(isFilled(named(hud.view, 'cushion'))).toBe(true);

    hud.render(readoutWith({ scoreRungBled: true }), NO_LOSS_WATCHED);
    expect(isFilled(named(hud.view, 'cushion'))).toBe(false);

    hud.render(readoutWith({ scoreRungBled: false }), NO_LOSS_WATCHED);
    expect(isFilled(named(hud.view, 'cushion'))).toBe(true);
  });

  it('reads the bank when carriers are waiting and draws nothing at all at zero', () => {
    // Empty at zero rather than showing a nought, because the bank exists so a
    // burst of paying kills still reads as paid and a standing nought would be
    // one more number the player learns to stop reading (ADR 0034, record R11).
    const hud = hudShowing(['skullStream']);

    hud.render(readoutWith({ bankedOffers: 0 }), NO_LOSS_WATCHED);
    expect(bankOf(hud.view)).toBe('');

    hud.render(readoutWith({ bankedOffers: 3 }), NO_LOSS_WATCHED);
    expect(bankOf(hud.view)).toBe('+3');
  });

  it('draws the same pixels for the same readout, whatever the tick', () => {
    // A dumb view: no data source, no loop subscription, no change detection,
    // and nothing of its own carried between renders.
    const hud = hudShowing(WEAPON_LINES);
    hud.render(
      readoutWith({ tick: 1, score: 4200, levels: uniform(2) }),
      NO_LOSS_WATCHED,
    );
    const first = drawing(hud.view);

    hud.render(
      readoutWith({ tick: 9999, score: 4200, levels: uniform(2) }),
      NO_LOSS_WATCHED,
    );

    expect(drawing(hud.view)).toEqual(first);
  });

  it("empties a stripped line's top mark over the strip's own lifetime, by area and by no step in value", () => {
    // Record R2 and R5: the end state is the empty mark the row already draws,
    // reached by losing area rather than by a step in value, so the moment of
    // the loss speaks the same vocabulary as every moment before it. The line
    // is at 2 because the sim has already taken the rung: the mark the player
    // watches leave is the top one the line no longer has.
    const hud = hudShowing(['wisps']);
    const stripped = watchLoss(
      NO_LOSS_WATCHED,
      { type: 'weaponStripped', lines: ['wisps'] },
      0,
    );
    const at = (tick: number): number => {
      hud.render(readoutWith({ tick, levels: uniform(2) }), stripped);
      return areaShareOf(markAtLevel(hud.view, 2));
    };

    expect(at(0)).toBeCloseTo(1, 6);
    expect(at(RUNG_STRIP_TICKS / 2)).toBeCloseTo(0.5, 6);
    expect(new Set(colorsIn(hud.view))).toEqual(new Set([PALETTE.hudInk.hex]));

    hud.render(
      readoutWith({ tick: RUNG_STRIP_TICKS, levels: uniform(2) }),
      stripped,
    );
    expect(readRows(hud.view)).toEqual(['wisps xx...']);
  });

  it('empties a mark on every line that paid and on none that did not', () => {
    // Record R7: stripLevels takes one off every line that has one to give, so
    // four marks emptying at once is the bigger event it is rather than a defect.
    const hud = hudShowing(WEAPON_LINES);
    const stripped = watchLoss(
      NO_LOSS_WATCHED,
      { type: 'weaponStripped', lines: ['skullStream', 'bell'] },
      0,
    );
    hud.render(
      readoutWith({ tick: RUNG_STRIP_TICKS / 2, levels: uniform(3) }),
      stripped,
    );

    const paid = rowsOf(hud.view).map(
      (row) => `${row.label} ${areaShareOf(marksOf(row)[3]!).toFixed(2)}`,
    );
    expect(paid).toEqual([
      'skullStream 0.50',
      'territory 0.00',
      'wisps 0.00',
      'bell 0.50',
    ]);
  });

  it('counts the digits down while the cushion beside them empties, both of the one loss', () => {
    // Record R5: the digits and the mark are one vocabulary, so a hit that
    // bleeds shows the number leaving and the cushion going at the same pace.
    const hud = hudShowing(['skullStream']);
    const watching = watchLoss(
      NO_LOSS_WATCHED,
      { type: 'scoreBled', amount: 41300 },
      0,
    );
    const midpoint = readoutWith({
      tick: SCORE_BLEED_TICKS / 2,
      score: 0,
      scoreRungBled: true,
    });

    hud.render(midpoint, watching);

    expect(scoreOf(hud.view)).toBe('020650');
    expect(areaShareOf(named(hud.view, 'cushion'))).toBeCloseTo(0.5, 6);
  });

  it('is told a bleed happened and never infers one from a score that fell', () => {
    // A view that diffed the score would be a second implementation of the
    // rule, and a diff cannot tell a bleed from an overflow that was negative.
    const hud = hudShowing(['skullStream']);

    hud.render(readoutWith({ tick: 0, score: 41300 }), NO_LOSS_WATCHED);
    hud.render(readoutWith({ tick: 1, score: 0 }), NO_LOSS_WATCHED);

    expect(scoreOf(hud.view)).toBe('000000');
    expect(isFilled(named(hud.view, 'cushion'))).toBe(true);
  });

  it('draws a strip landing while the cushion is still emptying with both live', () => {
    // INVULNERABLE_TICKS is 24 and the countdown is 40, so the second hit is
    // legal before the first has finished being watched (record R5).
    const hud = hudShowing(['bell']);
    const bleeding = watchLoss(
      NO_LOSS_WATCHED,
      { type: 'scoreBled', amount: 41300 },
      0,
    );
    const andStripped = watchLoss(
      bleeding,
      { type: 'weaponStripped', lines: ['bell'] },
      INVULNERABLE_TICKS,
    );
    hud.render(
      readoutWith({
        tick: INVULNERABLE_TICKS + 4,
        score: 0,
        scoreRungBled: true,
        levels: uniform(1),
      }),
      andStripped,
    );

    const cushion = areaShareOf(named(hud.view, 'cushion'));
    const rung = areaShareOf(markAtLevel(hud.view, 1));
    expect(cushion).toBeGreaterThan(0);
    expect(cushion).toBeLessThan(1);
    expect(rung).toBeGreaterThan(0);
    expect(rung).toBeLessThan(1);
  });

  it("makes its rows a function of the roster's length and each line's index in it", () => {
    // WeaponLine is a closed union, so a test naming a fifth line needs an `as`
    // past the type system; this is the same extensibility promise without one.
    // The second showing is what says the rows are pooled and reused across runs
    // rather than appended to.
    const rosters: WeaponLine[][] = [
      ['bell'],
      ['wisps', 'bell'],
      ['territory', 'skullStream', 'bell'],
      ['bell', 'wisps', 'skullStream', 'territory'],
    ];
    const seen = rosters.map((roster) => {
      const hud = hudShowing(roster);
      hud.render(readoutWith({ levels: uniform(1) }), NO_LOSS_WATCHED);
      return rowsOf(hud.view).map((row) => row.label);
    });
    expect(seen).toEqual(rosters);

    const reused = hudShowing(['bell', 'wisps', 'skullStream']);
    reused.render(readoutWith({ levels: uniform(1) }), NO_LOSS_WATCHED);
    reused.showIdentity(identityWith(['territory']));
    reused.render(readoutWith({ levels: uniform(1) }), NO_LOSS_WATCHED);
    expect(rowsOf(reused.view).map((row) => row.label)).toEqual(['territory']);
  });
});
