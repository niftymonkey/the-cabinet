/**
 * The stage's rows as data (ADR 0006), and the peak-arrivals query the corpse
 * cap is derived from (ADR 0056). Every assertion reads the tables themselves,
 * because the point of the query is that it moves with the rows.
 *
 * The permission cells live here too. ADR 0056 asks for ADR 0047's off-limits
 * moments as cells in the phase's and the row's own data rather than as
 * conditions in code, so what proves it is a test that reads the tables and
 * calls nothing.
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
  SPARSE_LAST_ROW,
  VIGIL_ROWS,
} from '../rows';
import type { Phase } from '../stage';
import { PHASES } from '../stage';

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

/** A section's sparse last row, which is the tail its own shape declares. */
const sparseIn = (rows: readonly StageRow[]): readonly StageRow[] =>
  rows.slice(rows.length - SPARSE_LAST_ROW.bodies);

/** The phase whose boundary event ends this one, which is the phase after it. */
const boundaryAfter = (name: string): Phase =>
  PHASES[PHASES.findIndex((each) => each.name === name) + 1];

describe('the peak-arrivals query (ADR 0056)', () => {
  it('reports the most bodies the stage can put on the field inside a window', () => {
    // The densest ten seconds in the authored tables is the Crowd's four rows
    // from t=130, the climb into the Waking. The expected value is summed from
    // the table rather than written down, so re-authoring the rows moves both
    // sides together.
    const densest = between(CROWD_ROWS, 130, 140);
    expect(densest).toHaveLength(4);
    expect(peakArrivals(10)).toBe(totalOf(densest));

    // It is the maximum over the whole stage, so it stands above each other
    // section's own densest ten seconds and above the boss phase's window.
    expect(totalOf(between(PROCESSION_ROWS, 95, 105))).toBeLessThan(
      peakArrivals(10),
    );
    expect(totalOf(between(VIGIL_ROWS, 49, 59))).toBeLessThan(peakArrivals(10));
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
    expect(totalOf(CROWD_ROWS)).toBeGreaterThan(totalOf(VIGIL_ROWS));

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
        {
          t: 0,
          template: 'drip',
          count: 0,
          type: 'shambler',
          carries: true,
          directed: true,
        },
      ]),
    ).toHaveLength(1);
  });

  it('orders every section table by its phase-local time', () => {
    for (const rows of SECTIONS) expect(outOfOrderIn(rows)).toEqual([]);

    // The same proof of teeth: reversed, the Crowd's own table is caught.
    expect(outOfOrderIn([...CROWD_ROWS].reverse())).not.toEqual([]);
  });

  it('declares directed on every row and every phase, with no optional field anywhere', () => {
    // A boolean and never an absent key, because a director reading an absent
    // cell as permission is exactly the failure ADR 0056's permission matrix
    // exists to stop.
    for (const row of EVERY_ROW) {
      expect(`${row.template} at t=${row.t}: ${typeof row.directed}`).toBe(
        `${row.template} at t=${row.t}: boolean`,
      );
    }
    for (const phase of PHASES) {
      expect(`${phase.name}: ${typeof phase.directed}`).toBe(
        `${phase.name}: boolean`,
      );
    }
  });

  it('declares both ceiling rows on every phase, set only where a section owns a ceiling', () => {
    // The Procession's property is a ceiling on live templates and the Vigil's
    // is a ceiling on live bodies. The Crowd carries neither, because its
    // property is a floor and a director that adds and never removes cannot
    // break a floor. Every other phase is off limits to the director outright,
    // so it has no ceiling to declare either.
    const ceilings = PHASES.map(
      (phase) =>
        `${phase.name} ${phase.liveTemplateCeiling} ${phase.liveBodyCeiling}`,
    );
    expect(ceilings).toEqual([
      'procession 1 null',
      'banshee null null',
      'crowd null null',
      'waking null null',
      'vigil null 4',
      'undertaker null null',
      'over null null',
    ]);

    // Declared rather than optional, in both directions: a null is a phase
    // saying it owns no ceiling, and an absent key would be a phase saying
    // nothing at all.
    for (const phase of PHASES) {
      expect(`${phase.name} ${'liveTemplateCeiling' in phase}`).toBe(
        `${phase.name} true`,
      );
      expect(`${phase.name} ${'liveBodyCeiling' in phase}`).toBe(
        `${phase.name} true`,
      );
    }
  });
});

describe("the director's off-limits cells, as data (ADR 0047, ADR 0056)", () => {
  it('marks every boss phase and the set piece phase as cells the director may not spend in', () => {
    // Read structurally rather than by name: a section's boundary event is the
    // phase after it, so the Banshee, the Waking and the Undertaker are found
    // through the three sections rather than restated here.
    const boundaries = ['procession', 'crowd', 'vigil'].map(boundaryAfter);
    expect(boundaries.map((phase) => phase.name)).toEqual([
      'banshee',
      'waking',
      'undertaker',
    ]);
    for (const phase of boundaries) {
      expect(`${phase.name} directed ${phase.directed}`).toBe(
        `${phase.name} directed false`,
      );
    }

    // And the sections themselves are where the director is meant to work, so
    // the marking separates them rather than covering everything.
    for (const name of ['procession', 'crowd', 'vigil']) {
      const phase = PHASES.find((each) => each.name === name)!;
      expect(`${name} directed ${phase.directed}`).toBe(
        `${name} directed true`,
      );
    }
  });

  it("marks the Wall's own row and every sparse last row, and every other row of the stage is open", () => {
    // ADR 0047 names both outright. The Wall's crossable-unloaded property is
    // two-sided and fails silently with every test still green, so a director
    // filling the gaps around the curtain would break it invisibly; the sparse
    // last row before each boss is the held breath, authored as a thin row so
    // that a director briefed to fill gaps cannot tell it from any other gap,
    // which is exactly why it says so itself.
    const closed = EVERY_ROW.filter((row) => !row.directed);
    expect(closed).toEqual([
      ...sparseIn(PROCESSION_ROWS),
      CROWD_ROWS.find((row) => row.template === 'wall')!,
      ...sparseIn(VIGIL_ROWS),
    ]);
  });

  it('reads every off-limits cell out of the row and phase tables alone', () => {
    // The whole of ADR 0056's ask: the four off-limits moments are cells in
    // data rather than conditions in code. Nothing here calls into the stage
    // machine, so a director at step 4 can answer the question the same way.
    const cells = [
      ...PHASES.map((phase) => `phase ${phase.name} ${phase.directed}`),
      ...EVERY_ROW.map((row) => `row ${row.template} ${row.directed}`),
    ];

    // The four phases the director may not spend in at all, the Wall's own row,
    // and the sparse last row of each of the two sections a boss ends.
    const offLimits = 4 + 1 + 2 * SPARSE_LAST_ROW.bodies;
    expect(cells.filter((cell) => cell.endsWith('false')).length).toBe(
      offLimits,
    );
    expect(cells.every((cell) => /(true|false)$/.test(cell))).toBe(true);
  });
});
