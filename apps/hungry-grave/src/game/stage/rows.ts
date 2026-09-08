// The stage's authored rows as data (ADR 0006), and the query over what they can put on the field.

import type { MobType } from '../mobs';
import type { TemplateName } from './templates';

interface StageRow {
  // Phase-local seconds. Rows fire when the phase-local tick passes this time.
  readonly t: number;
  readonly template: TemplateName;
  /**
   * Count lives on the row and never on the template, so density tuning never
   * edits a playtest-proven shape.
   */
  readonly count: number;
  readonly type: MobType;
  /**
   * Whether one of this row's mobs carries the offer (ADR 0002). Which one is
   * carriers.ts's rule and never the row's, so a row says only that it pays.
   */
  readonly carries: boolean;
  /**
   * Whether the director may spend in the span this row opens (ADR 0047,
   * ADR 0056). A row already owns a span, from its own fire until the next row
   * fires, and a director briefed to fill gaps cannot tell an authored thin row
   * from any other gap unless the row itself says so. Its reader is the
   * director at step 4 (#85).
   */
  readonly directed: boolean;
}

/**
 * Which boss a phase carries. It lives here rather than in the boss modules
 * because which boss arrives where is authored stage data, and the phase column
 * that names one is written several slices before any boss module exists.
 */
type BossKind = 'banshee' | 'undertaker';

/**
 * The two kinds as a list, so a reader that has to name a row per boss walks
 * them rather than spelling them out. The type is declared above rather than
 * derived from this, so a phase column reads as a union and never as an index
 * into a table.
 */
const BOSS_KINDS: readonly BossKind[] = ['banshee', 'undertaker'];

/**
 * The three sections, as the tables' own key (ADR 0049, ADR 0050). It is the
 * key the pour's shares are read by, so a section and the rate it keeps firing
 * at under the pour cannot come apart.
 */
type SectionName = 'procession' | 'crowd' | 'vigil';

/**
 * The sparse last row's own shape (ADR 0051): how many bodies it lands, which
 * type they are, and how far apart they fall. It is a record rather than three
 * loose numbers because the three only mean anything together, and a tuning
 * pass moves the held breath by editing one row.
 */
interface SparseShape {
  readonly bodies: number;
  // In the row's own unit, seconds, so a table reads in one clock.
  readonly spacingSeconds: number;
  readonly type: MobType;
}

/**
 * The initial shape, from the design record: four bodies, shamblers, one every
 * ninety ticks, which is a second and a half in the row's own unit.
 *
 * The type is the part worth reading rather than tuning. The ghoul closes,
 * which would turn a held breath into a chase, and every revenant is armed, so
 * a thin row of revenants is less traffic and more fire, which is the opposite
 * of the beat this row is.
 */
const SPARSE_LAST_ROW: SparseShape = {
  bodies: 4,
  spacingSeconds: 1.5,
  type: 'shambler',
};

/**
 * The sparse last row as rows (ADR 0051): one body at a time from `from`, the
 * shape's spacing apart, replacing the spawn silence a boss used to arrive
 * after. Each body is its own Drip, because a row lands its whole count at once
 * and what this row is for is bodies arriving one after another.
 *
 * It carries no offer, because a carrier here would pay a player for the beat
 * before a fight rather than for the section, and the director may not spend in
 * it: it is the held breath, and a director briefed to fill gaps would fill
 * this one (ADR 0047).
 */
const sparseLastRow = (from: number, shape: SparseShape): readonly StageRow[] =>
  Array.from({ length: shape.bodies }, (_body, index): StageRow => ({
    t: from + index * shape.spacingSeconds,
    template: 'drip',
    count: 1,
    type: shape.type,
    carries: false,
    directed: false,
  }));

/**
 * The Procession, to the Banshee. It owns emptiness: a group arrives, the field
 * clears, and there is a beat of empty ground before the next falls. That gap is
 * where a corpse sits alone long enough for the player to decide to go and get
 * it, and where a revenant's tell is legible because nothing else is on screen.
 *
 * The property is one live template, held as Phase.liveTemplateCeiling and read
 * by the director rather than by an invariant: these rows stand about nine
 * seconds apart against a body that takes roughly fifteen seconds to fall
 * unkilled, so a player who kills slowly holds two templates with nothing wrong.
 *
 * Only Files and Vs stand beside the Drips. The Rain is the density filler a
 * section turns up when its property asks for it and the Pincer is two files at
 * once, and neither belongs in a section that holds one template live. No ghoul:
 * the closer arrives in the next section, and a type arriving first as a lone
 * Drip is the standing rule (ADR 0016's readable-before-it-acts).
 *
 * Which rows may carry is a property of the table rather than of the schedule,
 * so it is authored here and the placement is carriers.ts's. The four Drips are
 * held clear on purpose. The lone revenant Drip teaches the tell, so the run's
 * first tell and its first offer are two different moments rather than one body
 * doing both jobs; the opening shambler Drip is held clear because the first
 * kill of the run teaches the swallow; and the Drip of three is the game's first
 * mob fire, where exactly one of three arrives armed and the glance is spent
 * calibrating the marker.
 *
 * Every count and every time here is an initial row owned by the tuning pass.
 * What is not tuning is the shape: one template live, Drips before a type
 * appears in numbers, no ghoul, and a carrier on no Drip.
 */
const PROCESSION_ROWS: readonly StageRow[] = [
  {
    t: 2,
    template: 'drip',
    count: 1,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 11,
    template: 'drip',
    count: 3,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 21,
    template: 'file',
    count: 5,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 31,
    template: 'drip',
    count: 1,
    type: 'revenant',
    carries: false,
    directed: true,
  },
  {
    t: 40,
    template: 'drip',
    count: 2,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 50,
    template: 'v',
    count: 5,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 59,
    template: 'file',
    count: 6,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 68,
    template: 'v',
    count: 6,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 77,
    template: 'file',
    count: 6,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 86,
    template: 'v',
    count: 7,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 95,
    template: 'file',
    count: 6,
    type: 'revenant',
    carries: true,
    directed: true,
  },
  {
    t: 103,
    template: 'v',
    count: 7,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  // The section's own nine-second cadence carries into the last row, so the
  // held breath is slower rather than empty.
  ...sparseLastRow(112, SPARSE_LAST_ROW),
];

/**
 * The Crowd, to the Waking. It owns overlap: Rain under a Pincer, a V through
 * Rain. Corpses stop being objects the player chooses between and become a floor
 * the grave swims through, and the question stops being whether one corpse is
 * reachable and becomes which of these still is.
 *
 * It opens on the Wall two seconds after the Banshee dies, which is the anchor
 * the concept doc names, and the Wall's own row is the one cell in this table
 * the director may not spend in: its crossable-unloaded property is two-sided
 * and fails silently with every test still green (ADR 0047).
 *
 * The ghoul arrives here, first as a lone Drip.
 *
 * One deliberate trough sits mid-section, thin Drips and nothing else, so the
 * Waking at the end lands against something rather than against a sustained
 * peak. It is a run of rows and nothing more: the music does not change inside a
 * section, so a held bar under the trough would be an audio state built for one
 * row.
 *
 * The property is a floor of two live templates and it carries no ceiling row,
 * because a director that adds and never removes cannot break a floor.
 *
 * Every count and every time is an initial row. What is not tuning is the shape:
 * two templates always overlapping, the Wall first and undirected, the ghoul's
 * lone Drip before any ghoul in numbers, and one trough before the end.
 */
const CROWD_ROWS: readonly StageRow[] = [
  {
    t: 2,
    template: 'wall',
    count: 22,
    type: 'shambler',
    carries: false,
    directed: false,
  },
  {
    t: 8,
    template: 'rain',
    count: 6,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 12,
    template: 'drip',
    count: 1,
    type: 'ghoul',
    carries: false,
    directed: true,
  },
  {
    t: 15,
    template: 'pincer',
    count: 8,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 21,
    template: 'v',
    count: 7,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 25,
    template: 'rain',
    count: 8,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 29,
    template: 'file',
    count: 5,
    type: 'revenant',
    carries: true,
    directed: true,
  },
  {
    t: 33,
    template: 'pincer',
    count: 8,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 36,
    template: 'rain',
    count: 8,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 40,
    template: 'v',
    count: 7,
    type: 'ghoul',
    carries: false,
    directed: true,
  },
  {
    t: 44,
    template: 'rain',
    count: 10,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 48,
    template: 'pincer',
    count: 8,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 52,
    template: 'v',
    count: 7,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 58,
    template: 'drip',
    count: 2,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 64,
    template: 'drip',
    count: 2,
    type: 'revenant',
    carries: false,
    directed: true,
  },
  {
    t: 70,
    template: 'drip',
    count: 3,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 76,
    template: 'drip',
    count: 2,
    type: 'ghoul',
    carries: false,
    directed: true,
  },
  {
    t: 79,
    template: 'drip',
    count: 3,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 82,
    template: 'rain',
    count: 8,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 85,
    template: 'pincer',
    count: 8,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 90,
    template: 'v',
    count: 7,
    type: 'ghoul',
    carries: true,
    directed: true,
  },
  {
    t: 94,
    template: 'rain',
    count: 10,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 98,
    template: 'file',
    count: 6,
    type: 'revenant',
    carries: true,
    directed: true,
  },
  {
    t: 102,
    template: 'pincer',
    count: 8,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 106,
    template: 'rain',
    count: 10,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 110,
    template: 'v',
    count: 7,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 114,
    template: 'pincer',
    count: 8,
    type: 'ghoul',
    carries: false,
    directed: true,
  },
  {
    t: 118,
    template: 'rain',
    count: 12,
    type: 'shambler',
    carries: true,
    directed: true,
  },
  {
    t: 122,
    template: 'v',
    count: 7,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 126,
    template: 'pincer',
    count: 8,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 130,
    template: 'rain',
    count: 12,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 133,
    template: 'v',
    count: 7,
    type: 'ghoul',
    carries: false,
    directed: true,
  },
  {
    t: 136,
    template: 'pincer',
    count: 8,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 138,
    template: 'rain',
    count: 12,
    type: 'shambler',
    carries: true,
    directed: true,
  },
];

/**
 * The Vigil, to the Undertaker. It owns scarcity: less growth paid per second
 * than the Crowd, and tougher bodies. The roster inverts to revenants and ghouls
 * with the shambler thinned, so the field is more fire and less food and the
 * swallow cadence drops without a single new system being added.
 *
 * The quantity is growth paid per second and never corpses per second. A
 * revenant corpse pays double a shambler's, so a roster that halves the bodies
 * and doubles their payout is flat rather than scarce, and a corpses-per-second
 * rule would pass while the section fed better than the one before it. What
 * keeps the rate down is time to kill as much as arrivals: a revenant costs 64
 * points of storm against a shambler's 40, so the same storm clears fewer bodies
 * a second.
 *
 * The property is a ceiling of four live bodies against an authored steady state
 * of about two, which is the headroom the director may spend into and no more.
 * Like the Procession's it binds the director and never the authored rows.
 *
 * Shortest of the three on purpose, because the Undertaker has to carry the end.
 *
 * Every count and every time is an initial row. What is not tuning is the shape:
 * a fall in growth paid per second against the Crowd, and a roster of revenants
 * and ghouls with the shambler thinned.
 */
const VIGIL_ROWS: readonly StageRow[] = [
  {
    t: 2,
    template: 'file',
    count: 4,
    type: 'revenant',
    carries: true,
    directed: true,
  },
  {
    t: 8,
    template: 'drip',
    count: 2,
    type: 'ghoul',
    carries: false,
    directed: true,
  },
  {
    t: 14,
    template: 'v',
    count: 5,
    type: 'revenant',
    carries: true,
    directed: true,
  },
  {
    t: 19,
    template: 'drip',
    count: 2,
    type: 'shambler',
    carries: false,
    directed: true,
  },
  {
    t: 24,
    template: 'file',
    count: 4,
    type: 'ghoul',
    carries: true,
    directed: true,
  },
  {
    t: 29,
    template: 'pincer',
    count: 6,
    type: 'revenant',
    carries: false,
    directed: true,
  },
  {
    t: 34,
    template: 'v',
    count: 5,
    type: 'ghoul',
    carries: true,
    directed: true,
  },
  {
    t: 39,
    template: 'drip',
    count: 2,
    type: 'revenant',
    carries: false,
    directed: true,
  },
  {
    t: 44,
    template: 'file',
    count: 4,
    type: 'revenant',
    carries: true,
    directed: true,
  },
  {
    t: 49,
    template: 'v',
    count: 5,
    type: 'ghoul',
    carries: false,
    directed: true,
  },
  {
    t: 53,
    template: 'pincer',
    count: 6,
    type: 'revenant',
    carries: true,
    directed: true,
  },
  {
    t: 58,
    template: 'v',
    count: 5,
    type: 'ghoul',
    carries: false,
    directed: true,
  },
  // The same beat on this section's own five-second cadence.
  ...sparseLastRow(63, SPARSE_LAST_ROW),
];

/**
 * The Waking's pour, as data (ADR 0042, ADR 0050). The source's behaviour is
 * setPiece.ts's and every magnitude it runs on is here, one direction only:
 * peakArrivals below needs the pour's rate, and setPiece.ts spawns through
 * mobs.ts, which reads caps.ts, which reads this query. A rows.ts that asked
 * setPiece.ts for the rate would close that circle.
 *
 * All initial rows, tuned by the harness at step 4, with the arithmetic in the
 * design record's section 2.
 */

/**
 * Bodies the source pours before it is spent. Seventy-five at the interval
 * below is fifteen seconds of pour, which is shorter than the source's own
 * descent, so the ordinary end is the budget rather than the bottom edge.
 */
const SET_PIECE_BUDGET = 75;

/**
 * How long the source waits between bodies, in the table's own clock. A fifth
 * of a second is one body every twelve ticks, five a second, which is a little
 * under half again the densest ten seconds the sections author: the loudest
 * beat in the run must not arrive thinner than the section it interrupts.
 *
 * Seconds and not ticks because this module value-imports nothing, so it cannot
 * know how long a tick is. setPiece.ts holds the clock and converts.
 */
const SET_PIECE_POUR_SECONDS = 0.2;

/**
 * The source's own health, which only the open source can lose (ADR 0050).
 *
 * Above a full build's storm across the whole pour, so a grave that commits to
 * the trail never deletes the moment it is committing to: a fast kill ends the
 * source's stay rather than its pour, which is Ikaruga's bunretsu read the same
 * way round.
 */
const SET_PIECE_HP = 2400;

/**
 * The bounds the source sweeps between, in field units. The trail stays inside
 * the field's middle three fifths, so it is a curve the dive can follow rather
 * than a wall of corpses in the gutter a body walking in at an edge leaves.
 */
const SET_PIECE_SWEEP_MIN_X = 108;
const SET_PIECE_SWEEP_MAX_X = 432;

/**
 * The phase-local second the Crowd places the dormant source (ADR 0050).
 *
 * Five seconds before the eye opens, so it opens a beat after the section's own
 * last group falls at second 138 and the Crowd's climax fires before the eye
 * ends the section. Placed any earlier the eye rides down through rows it is
 * about to cut off; any later and the Crowd holds a stretch with nothing due,
 * which is the spawn silence ADR 0051 retired.
 *
 * The five seconds are the fall to the opening depth below at the field's own
 * scroll, authored rather than computed: this module value-imports nothing, so
 * it cannot read the field's height or the scroll to derive it.
 */
const SET_PIECE_PLACED_AT = 135;

/**
 * How deep the source opens, as a share of the field's height. A share rather
 * than a depth in field units, because this module cannot read the field and
 * the fact being authored is where in the player's view it happens rather than
 * how many units down that is.
 *
 * A quarter down, so the pour's own fifteen seconds at the field's scroll fit
 * between the opening and the bottom edge with a body's fall to spare: the
 * source's ordinary end is its budget running out and never the edge arriving.
 * Mark's ruling of 2026-09-08 supersedes decision 25's "opens around mid-field",
 * which was written while the source drifted at half the scroll.
 */
const SET_PIECE_OPEN_DEPTH = 0.25;

/**
 * The body the storm meets once the source has opened, in field units. Initial
 * rows: wide enough that a dive lands on it without aiming and smaller than a
 * boss, because it is a mouth on the ground rather than a fight standing up.
 */
const SET_PIECE_HALF_WIDTH = 45;
const SET_PIECE_HALF_HEIGHT = 30;

/**
 * What the pour puts on the field. It is a row and not a name in setPiece.ts,
 * because ADR 0042 rules that a set piece names the property it must keep and
 * never the cast, so re-casting the pour is a data edit.
 *
 * The shambler and not the other two, and each for its own reason. The ghoul
 * closes, which would turn a trail the grave swims up into a chase that comes
 * to it, and the trail is the whole property. Every revenant is armed, so a
 * pour of them is a wall of fire, and ADR 0050 forbids the set piece being a
 * second dose of hell.
 */
const POUR_TYPE: MobType = 'shambler';

/**
 * How far off the source's centre a poured body lands, and how far a draw moves
 * it (ADR 0042's narrow answer to #81, for this one caller).
 *
 * The mouth pours from alternating lips rather than from one point, so two
 * bodies in a row are never stacked on each other: the lips stand far enough
 * apart that the widest trash body fits between them, and the jitter is bounded
 * under that gap so a draw can never close it. The jitter is what keeps the
 * pour a spray rather than a metronome, and it is the one place chance enters
 * the moment.
 */
const POUR_LIP_X = 22;
const POUR_JITTER_X = 6;

/**
 * The share of its own authored rate a section keeps while the set piece pours,
 * so it thins under the pour rather than going silent (ADR 0051). One row per
 * section and no optional key: only the Crowd is ever under a pour, because the
 * source is placed by one of its own rows, and the other two say 1 rather than
 * saying nothing.
 */
const POUR_SHARES: Readonly<Record<SectionName, number>> = {
  procession: 1,
  crowd: 1 / 3,
  vigil: 1,
};

/**
 * How long a full pour lasts, in the table's own clock. It is the budget at the
 * interval and never a length written down, so a retune of either moves the
 * moment and everything sized against it together.
 */
const POUR_SECONDS = SET_PIECE_BUDGET * SET_PIECE_POUR_SECONDS;

/**
 * The rows a section keeps firing under a pour (ADR 0051: "there is no
 * drain-out before the set piece ... only the two boss boundaries need the
 * field empty").
 *
 * Its own last rows, carried on into the phase the pour runs in and thinned to
 * the share it keeps: the same templates, the same types, in the same cadence,
 * with fewer bodies in each. A section that stopped would hand the loudest beat
 * in the run a silent field, which is the one thing ADR 0051 rules out here.
 *
 * A row never thins to nothing, because a row that lands no body is the silence
 * the share exists to avoid; and none of them carries, because the twenty-five
 * carriers are authored across the three sections and a pour pays in corpses
 * rather than in power (ADR 0048). The director may not spend in any of them:
 * the set piece is one of ADR 0047's four off-limits moments.
 */
const rowsUnderThePour = (
  rows: readonly StageRow[],
  share: number,
  seconds: number,
): readonly StageRow[] => {
  const opensAt = rows[rows.length - 1].t - seconds;
  return rows
    .filter((row) => row.t > opensAt)
    .map((row) => ({
      t: row.t - opensAt,
      template: row.template,
      count: Math.max(1, Math.round(row.count * share)),
      type: row.type,
      carries: false,
      directed: false,
    }));
};

/**
 * The Waking's own rows: the Crowd's last groups, still falling under the pour
 * at the share that section keeps (ADR 0050, ADR 0051).
 *
 * The phase itself is the source's moment and ends when the source is gone, so
 * these rows are what the pour lands into rather than what the phase runs on.
 */
const WAKING_ROWS: readonly StageRow[] = rowsUnderThePour(
  CROWD_ROWS,
  POUR_SHARES.crowd,
  POUR_SECONDS,
);

/**
 * Bodies a boss's own adds may put on the field inside a freshness window
 * (ADR 0007). An initial row: diggers at one every ninety ticks through the
 * Undertaker's second and third chunks are about seven in ten seconds.
 */
const BOSS_ADD_ALLOWANCE = 7;

/**
 * Rungs a hit can strip onto the field inside one (ADR 0055). An initial row,
 * bounded twice over: by the hit clock, since INVULNERABLE_TICKS is 24 and no
 * more than 25 hits fit in ten seconds, and by the build, since a full build
 * from the birthright is nineteen rungs. The build is the tighter bound.
 */
const RUNG_ALLOWANCE = 19;

// The three sections, under the key the pour's shares are read by.
const SECTION_TABLES: Readonly<Record<SectionName, readonly StageRow[]>> = {
  procession: PROCESSION_ROWS,
  crowd: CROWD_ROWS,
  vigil: VIGIL_ROWS,
};

/**
 * The section the pour ever falls on: the source is placed by one of the
 * Crowd's own rows and opens as the Crowd's boundary event, so the Crowd is the
 * one table that ever fires under a pour.
 */
const POURED_SECTION: SectionName = 'crowd';

// The bodies a table's rows put on the field in the window that opens at this second.
const arrivalsFrom = (
  rows: readonly StageRow[],
  from: number,
  seconds: number,
): number =>
  rows
    .filter((row) => row.t >= from && row.t < from + seconds)
    .reduce((total, row) => total + row.count, 0);

/**
 * A table's densest window. Only a window that opens on a row can be the
 * densest: sliding one earlier admits nothing and can only drop the row it
 * opened on.
 */
const peakInTable = (rows: readonly StageRow[], seconds: number): number =>
  rows.reduce(
    (most, row) => Math.max(most, arrivalsFrom(rows, row.t, seconds)),
    0,
  );

/**
 * The pour's own window: what the source lands in a window of this length,
 * bounded by its budget, plus what the section under it keeps firing at its
 * reduced share.
 *
 * The share is rounded up, because a fraction of a body is a whole body
 * arriving and a cap that rounds its own worst case down can bind on the beat
 * the worst case named.
 */
const pourWindow = (seconds: number): number => {
  const poured = Math.min(
    SET_PIECE_BUDGET,
    Math.floor(seconds / SET_PIECE_POUR_SECONDS),
  );
  const under = peakInTable(SECTION_TABLES[POURED_SECTION], seconds);
  return poured + Math.ceil(POUR_SHARES[POURED_SECTION] * under);
};

/**
 * The most bodies the stage can put on the field inside any window of this
 * length, anywhere in the stage (ADR 0056). Every term is a row in this module,
 * so the query reads data and calls nothing that spawns.
 *
 * It is a maximum over windows and never a sum of them. A boss phase authors no
 * rows, so its window is what a boss sheds plus what a hit strips; the Waking's
 * is the pour plus the Crowd's reduced share; a section's is what its own table
 * authors. Taking the largest is the worst case, and adding them would price a
 * window the stage cannot produce.
 */
const peakArrivals = (seconds: number): number => {
  if (seconds <= 0) return 0;
  const sections = Object.values(SECTION_TABLES).map((rows) =>
    peakInTable(rows, seconds),
  );
  return Math.max(
    ...sections,
    pourWindow(seconds),
    BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE,
  );
};

export {
  PROCESSION_ROWS,
  CROWD_ROWS,
  VIGIL_ROWS,
  WAKING_ROWS,
  SPARSE_LAST_ROW,
  sparseLastRow,
  SET_PIECE_BUDGET,
  SET_PIECE_POUR_SECONDS,
  SET_PIECE_HP,
  SET_PIECE_SWEEP_MIN_X,
  SET_PIECE_SWEEP_MAX_X,
  SET_PIECE_PLACED_AT,
  SET_PIECE_OPEN_DEPTH,
  SET_PIECE_HALF_WIDTH,
  SET_PIECE_HALF_HEIGHT,
  POUR_TYPE,
  POUR_LIP_X,
  POUR_JITTER_X,
  POUR_SECONDS,
  POUR_SHARES,
  BOSS_ADD_ALLOWANCE,
  RUNG_ALLOWANCE,
  BOSS_KINDS,
  peakArrivals,
};
export type { StageRow, BossKind, SectionName, SparseShape };
