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
}

/**
 * The first 45 seconds are Drips and one File; Files, Vs and Pincers then
 * overlap two at a time with Rain joining thin. A new mob type always arrives
 * first as a lone Drip, so ADR 0016's readable-before-it-acts rule has
 * somewhere to be read.
 *
 * Every count in this table and in CROWD_ROWS is first-pass tuning owned by
 * the tuning dispatch. What is not tuning, and must not be quietly changed, is
 * the shape: teaching Drips before a type appears in numbers, the 45-second
 * ramp, a drain-out long enough that the field is empty at the boundary, and
 * the Wall's count matching the shambler's width.
 *
 * The Drip of three at t=14 is the game's first mob fire. Three shamblers
 * spread across the width arrive together and exactly one of them is armed, so
 * it is the only place in the game where a player sees armed and unarmed side
 * by side in one glance and can calibrate the marker.
 *
 * The carrier column is a first schedule and step 2 authors the real one. It
 * holds the 25 carriers carriersScheduled asks for, laid roughly one every
 * seven seconds of authored time across both spawning phases, and the run's
 * first row carries so a player is not asked to fight for long before the
 * first offer. Four rows are held clear on purpose: the three teaching Drips
 * at t=14, t=42 and t=62, where the glance is spent learning a marker or a new
 * type (ADR 0016), and the back half's Wall, whose whole shape is the curtain.
 */
const PROCESSION_ROWS: readonly StageRow[] = [
  { t: 2, template: 'drip', count: 1, type: 'shambler', carries: true },
  { t: 8, template: 'drip', count: 1, type: 'shambler', carries: true },
  { t: 14, template: 'drip', count: 3, type: 'shambler', carries: false },
  { t: 20, template: 'file', count: 5, type: 'shambler', carries: true },
  { t: 30, template: 'drip', count: 2, type: 'shambler', carries: true },
  { t: 36, template: 'drip', count: 3, type: 'shambler', carries: true },
  { t: 42, template: 'drip', count: 1, type: 'revenant', carries: false },
  { t: 46, template: 'v', count: 5, type: 'shambler', carries: true },
  { t: 52, template: 'file', count: 6, type: 'shambler', carries: true },
  { t: 56, template: 'pincer', count: 6, type: 'shambler', carries: false },
  { t: 62, template: 'drip', count: 1, type: 'ghoul', carries: false },
  { t: 66, template: 'v', count: 7, type: 'shambler', carries: true },
  { t: 70, template: 'rain', count: 6, type: 'shambler', carries: true },
  { t: 74, template: 'file', count: 4, type: 'revenant', carries: true },
  { t: 78, template: 'pincer', count: 8, type: 'shambler', carries: false },
  { t: 83, template: 'v', count: 7, type: 'ghoul', carries: true },
  { t: 88, template: 'rain', count: 6, type: 'shambler', carries: true },
  { t: 92, template: 'file', count: 6, type: 'shambler', carries: true },
  { t: 96, template: 'pincer', count: 8, type: 'shambler', carries: false },
  { t: 101, template: 'rain', count: 8, type: 'shambler', carries: true },
  { t: 105, template: 'v', count: 7, type: 'shambler', carries: true },
];

/**
 * The Wall first, then a climb through Rain, Pincers and Vs overlapping two and
 * three at a time to a sustained peak just under Wall density.
 *
 * The Wall's clock anchors on the Banshee's death, and with the boss phase
 * stubbed to end on the tick it begins, its row at phase-local t=2 lands two
 * seconds into the back half, which is where the concept doc puts it.
 */
const CROWD_ROWS: readonly StageRow[] = [
  { t: 2, template: 'wall', count: 22, type: 'shambler', carries: false },
  { t: 10, template: 'rain', count: 6, type: 'shambler', carries: true },
  { t: 14, template: 'pincer', count: 8, type: 'shambler', carries: false },
  { t: 19, template: 'v', count: 7, type: 'ghoul', carries: true },
  { t: 23, template: 'rain', count: 8, type: 'shambler', carries: false },
  { t: 26, template: 'file', count: 5, type: 'revenant', carries: true },
  { t: 30, template: 'pincer', count: 8, type: 'shambler', carries: false },
  { t: 32, template: 'rain', count: 8, type: 'shambler', carries: true },
  { t: 37, template: 'v', count: 7, type: 'shambler', carries: false },
  { t: 40, template: 'rain', count: 10, type: 'shambler', carries: true },
  { t: 43, template: 'pincer', count: 8, type: 'ghoul', carries: false },
  { t: 46, template: 'v', count: 7, type: 'shambler', carries: true },
  { t: 50, template: 'rain', count: 10, type: 'shambler', carries: false },
  { t: 53, template: 'file', count: 6, type: 'revenant', carries: true },
  { t: 56, template: 'pincer', count: 8, type: 'shambler', carries: false },
  { t: 58, template: 'rain', count: 12, type: 'shambler', carries: true },
  { t: 62, template: 'v', count: 7, type: 'ghoul', carries: true },
  { t: 65, template: 'pincer', count: 8, type: 'shambler', carries: false },
  { t: 68, template: 'rain', count: 12, type: 'shambler', carries: true },
];

/**
 * The Vigil holds no rows. The stage runs two spawning phases today and the
 * third section's rows arrive with the seven-phase authoring, so the table is
 * empty and the query below counts it as the empty section it is.
 */
const VIGIL_ROWS: readonly StageRow[] = [];

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

// The three sections, in the order the stage crosses them.
const SECTION_TABLES: readonly (readonly StageRow[])[] = [
  PROCESSION_ROWS,
  CROWD_ROWS,
  VIGIL_ROWS,
];

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
 * The most bodies the stage can put on the field inside any window of this
 * length, anywhere in the stage (ADR 0056). Every term is a row in this module,
 * so the query reads data and calls nothing that spawns.
 *
 * It is a maximum over windows and never a sum of them. A boss phase authors no
 * rows, so its window is what a boss sheds plus what a hit strips, while a
 * section's window is what its own table authors. Taking the larger is the
 * worst case; adding them would price a window the stage cannot produce.
 */
const peakArrivals = (seconds: number): number => {
  if (seconds <= 0) return 0;
  const sections = SECTION_TABLES.map((rows) => peakInTable(rows, seconds));
  return Math.max(...sections, BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE);
};

export {
  PROCESSION_ROWS,
  CROWD_ROWS,
  VIGIL_ROWS,
  BOSS_ADD_ALLOWANCE,
  RUNG_ALLOWANCE,
  peakArrivals,
};
export type { StageRow };
