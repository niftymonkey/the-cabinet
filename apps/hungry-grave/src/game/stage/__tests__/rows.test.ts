/**
 * The stage's rows as data (ADR 0006), and the peak-arrivals query the corpse
 * cap is derived from (ADR 0056). Every assertion reads the tables themselves,
 * because the point of the query is that it moves with the rows.
 */

import { describe, expect, it } from 'vitest';

import { carrierRow } from '../../carriers';
import type { StageRow } from '../rows';
import {
  BOSS_ADD_ALLOWANCE,
  CROWD_ROWS,
  peakArrivals,
  PROCESSION_ROWS,
  RUNG_ALLOWANCE,
  VIGIL_ROWS,
} from '../rows';

const SECTIONS: readonly (readonly StageRow[])[] = [
  PROCESSION_ROWS,
  CROWD_ROWS,
  VIGIL_ROWS,
];

const EVERY_ROW: readonly StageRow[] = SECTIONS.flat();

const totalOf = (rows: readonly StageRow[]): number =>
  rows.reduce((total, row) => total + row.count, 0);

const between = (
  rows: readonly StageRow[],
  from: number,
  to: number,
): readonly StageRow[] => rows.filter((row) => row.t >= from && row.t < to);

/** Every place a row promises a carrier its own count cannot hold. */
const carrierFaultsIn = (rows: readonly StageRow[]): string[] =>
  rows.flatMap((row) => {
    const where = `${row.template} at t=${row.t}`;
    if (row.carries && row.count < 1) return [`${where} carries with no body`];
    return carrierRow(row.carries, row.count)
      .carrying.filter((index) => index < 0 || index >= row.count)
      .map((index) => `${where} carries at ${index} of ${row.count}`);
  });

/** Every row that fires before the row in front of it. */
const outOfOrderIn = (rows: readonly StageRow[]): string[] =>
  rows
    .filter((row, index) => index > 0 && row.t < rows[index - 1].t)
    .map((row) => `${row.template} at t=${row.t}`);

describe('the peak-arrivals query (ADR 0056)', () => {
  it('reports the most bodies the stage can put on the field inside a window', () => {
    // The densest ten seconds in today's tables is the Crowd's four rows from
    // t=50, and that is the 36 the corpse cap's derivation reads off the same
    // rows (docs/design/stage-floor.md, "The derivation"). The expected value
    // is summed from the table rather than written down, so re-authoring the
    // rows moves both sides together.
    const densest = between(CROWD_ROWS, 50, 60);
    expect(densest).toHaveLength(4);
    expect(peakArrivals(10)).toBe(totalOf(densest));

    // It is the maximum over the whole stage, so it stands above the
    // Procession's own densest ten seconds and above the boss phase's window.
    expect(totalOf(between(PROCESSION_ROWS, 96, 106))).toBeLessThan(
      peakArrivals(10),
    );
    expect(BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE).toBeLessThan(peakArrivals(10));
  });

  it('counts what a boss sheds and what a hit strips, where no table is denser', () => {
    // No two authored rows fall inside one second, so a one-second window holds
    // one row at most and the largest window in the stage is the boss phase's:
    // a boss's own adds plus the rungs a hit can strip onto the field. Without
    // those two terms the query would never look inside a boss fight at all.
    const busiestRow = Math.max(...EVERY_ROW.map((row) => row.count));
    expect(busiestRow).toBeLessThan(BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE);
    expect(peakArrivals(1)).toBe(BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE);
  });

  it('is computed from the rows, and is zero for a window of no length', () => {
    expect(peakArrivals(0)).toBe(0);

    // A window wider than a section holds every body that section authors, so
    // a row added to the densest table moves the answer.
    expect(peakArrivals(600)).toBe(totalOf(CROWD_ROWS));
    expect(totalOf(CROWD_ROWS)).toBeGreaterThan(totalOf(PROCESSION_ROWS));

    // And a wider window never reports fewer arrivals than a narrower one.
    const answers = Array.from({ length: 121 }, (_, seconds) =>
      peakArrivals(seconds),
    );
    expect(answers).toEqual([...answers].sort((first, next) => first - next));
  });
});

describe('the section tables as data (ADR 0006)', () => {
  it("puts every row's carrier inside that row's own count", () => {
    expect(EVERY_ROW.filter((row) => row.carries).length).toBeGreaterThan(0);
    expect(carrierFaultsIn(EVERY_ROW)).toEqual([]);

    // The rule can see a bad row, so the empty list above is a pass rather than
    // an empty set: a row that says it pays with no body to pay from.
    expect(
      carrierFaultsIn([
        { t: 0, template: 'drip', count: 0, type: 'shambler', carries: true },
      ]),
    ).toHaveLength(1);
  });

  it('orders every section table by its phase-local time', () => {
    for (const rows of SECTIONS) expect(outOfOrderIn(rows)).toEqual([]);

    // The same proof of teeth: reversed, the Crowd's own table is caught.
    expect(outOfOrderIn([...CROWD_ROWS].reverse())).not.toEqual([]);
  });

  it.todo(
    'declares directed on every row and every phase, with no optional field anywhere',
  );
});
