/**
 * The stage's rows as data (ADR 0006), the peak-arrivals query the corpse cap
 * is derived from (ADR 0056), and the carrier schedule the sections author
 * (ADR 0002, ADR 0048). Every assertion reads the tables themselves, because
 * the point of the query is that it moves with the rows.
 *
 * The permission cells live here too. ADR 0056 asks for ADR 0047's off-limits
 * moments as cells in the phase's and the row's own data rather than as
 * conditions in code, so what proves it is a test that reads the tables and
 * calls nothing.
 *
 * One test in the file plays a run instead of reading a table, and the tables
 * are still its subject. What the schedule promises is about a run: that a
 * player who kills every carrier before the set piece holds a full build. That
 * cannot be read off the rows, because how much a carrier pays is the offer's
 * business, so the run is the fixture and the number of carriers each section
 * authors is what is under test.
 */

import { describe, expect, it } from 'vitest';

import rowsSource from '../rows.ts?raw';

import {
  carrierRow,
  carriersForFullBuild,
  carriersScheduled,
} from '../../carriers';
import { stepping } from '../../../dev/stepping';
import { CHUNK_FLASH_TICKS, damageBoss } from '../../bosses/chunks';
import { SPIRAL_ROWS } from '../../bosses/undertaker';
import { TICK_HZ } from '../../clock';
import type { TickCommand } from '../../command';
import type { Corpse } from '../../corpses';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from '../../lines/roster';
import type { Mob } from '../../mobs';
import { damageMob, hasEntered } from '../../mobs';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { FRESHNESS_SECONDS, SIZE_START } from '../../tuning';
import type { StageRow } from '../rows';
import {
  BOSS_ADD_ALLOWANCE,
  CROWD_ROWS,
  peakArrivals,
  POUR_SHARES,
  PROCESSION_ROWS,
  RUNG_ALLOWANCE,
  SET_PIECE_BUDGET,
  SET_PIECE_HP,
  SET_PIECE_POUR_SECONDS,
  SET_PIECE_SWEEP_MAX_X,
  SET_PIECE_SWEEP_MIN_X,
  SPARSE_LAST_ROW,
  VIGIL_ROWS,
  WAKING_ROWS,
} from '../rows';
import type { Phase } from '../stage';
import { PHASES } from '../stage';

const SECTIONS: readonly (readonly StageRow[])[] = [
  PROCESSION_ROWS,
  CROWD_ROWS,
  VIGIL_ROWS,
];

/**
 * Every row the stage authors, the Waking's own beside the three sections'.
 * The rules a row obeys, its carrier, its order and its permission cell, are
 * the same rules whichever table it stands in.
 */
const EVERY_ROW: readonly StageRow[] = [...SECTIONS.flat(), ...WAKING_ROWS];

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

/**
 * How many carriers a table's rows put on the field, counted through
 * carriers.ts's own placement rule rather than off the flags, so the count is
 * the one the stage actually spawns.
 */
const carriersIn = (rows: readonly StageRow[]): number =>
  rows.reduce(
    (total, row) => total + carrierRow(row.carries, row.count).carrying.length,
    0,
  );

/** Every Drip in a table that carries the offer, which is none of them. */
const dripsCarryingIn = (rows: readonly StageRow[]): string[] =>
  rows
    .filter((row) => row.template === 'drip' && row.carries)
    .map((row) => `drip at t=${row.t}`);

/**
 * Anything in a source that would name which placement of a row carries. A row
 * says that it pays and never who pays it (ADR 0002), so an index in the tables
 * or a reach into the module that holds the rule is the failure this catches.
 */
const placementNamesIn = (source: string): string[] =>
  ['carrying', "from '../carriers'"].filter((named) => source.includes(named));

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

/** The phase the Procession's and the Crowd's carriers all stand before. */
const WAKING = PHASES.findIndex((phase) => phase.name === 'waking');

/**
 * A ceiling on the ticks the two sections before the set piece can take, at
 * twice their own authored length. It is a budget that stops a broken run
 * looping forever and never a prediction of where the boundary falls, which is
 * the stage's own to decide.
 */
const TO_THE_WAKING_TICKS =
  2 * TICK_HZ * (PROCESSION_ROWS.at(-1)!.t + CROWD_ROWS.at(-1)!.t);

/**
 * The seeds the full-build run is read on. More than one because the offer's
 * options are drawn from a seeded stream, and a schedule that paid a full build
 * on one draw and not on another would be paying by luck; three rather than a
 * larger set because each seed is a whole run of two sections. Eight were run
 * when the test was written and every one of them paid the same build.
 */
const REACHES_A_FULL_BUILD: readonly number[] = [101, 202, 303];

/**
 * A carrier put one point from death under a skull of its own, so the sim's own
 * deaths phase kills it and the offer opens where it died. A kill the test made
 * outside the tick would pay nothing, because a carrier's offer is opened by
 * step.ts over the tick's own kills.
 */
const armForTheStorm = (state: RunState, mob: Mob): void => {
  const skull = state.skulls.find((each) => !each.alive);
  if (skull === undefined) return;
  mob.hp = 1;
  skull.alive = true;
  skull.id = state.nextEntityId;
  state.nextEntityId += 1;
  skull.x = mob.x;
  skull.y = mob.y;
  skull.vx = 0;
  skull.vy = 0;
};

/**
 * The grave held immortal at its starting size. This test is about what the
 * schedule pays, and a grave left to be ground down would seal shut long before
 * the set piece and stop the stage's clock with it.
 */
const holdTheGrave = (state: RunState): void => {
  if (state.ending === 'sealed') state.ending = null;
  state.grave.size = SIZE_START;
};

/**
 * Whether the sections still owe the hand something they authored: a carrier
 * alive on the field, an offer standing, or an offer banked behind it.
 */
const stillOwed = (state: RunState): boolean =>
  state.mobs.some((mob) => mob.alive && mob.carries) ||
  state.offer !== null ||
  state.bankedOffers > 0;

/**
 * The body of the live offer the grave is going for, or null when nothing is
 * offered. The first standing body rather than a chosen one, because which
 * option a hand takes is ADR 0034's question and not the schedule's.
 */
const bodyOffered = (state: RunState): Corpse | null => {
  const offer = state.offer;
  if (offer === null) return null;
  return (
    state.corpses.find(
      (body) => body.alive && offer.bodyIds.includes(body.id),
    ) ?? null
  );
};

interface Reached {
  /** Every carrier the run killed, counted off the sim's own kills. */
  readonly carriersKilled: number;
  /** Every offer the hand took, counted off the sim's own takes. */
  readonly taken: number;
  readonly state: RunState;
}

/**
 * The run up to the set piece under a hand that kills every carrier and takes
 * every offer their deaths pay.
 *
 * It runs on past the boundary while a carrier is still standing, because the
 * Crowd's last row fires on the tick that section's rows run out: its bodies
 * are met a moment inside the Waking, which is still long before anything of
 * the set piece is on the field.
 *
 * Carriers die inside the tick, under a skull each; everything else is killed
 * the way the sharp hand kills, so the field clears and the sections reach their
 * own boundaries. The take is the game's own: the grave is put over a body of
 * the live offer and the swallow does the rest, because a take that skipped the
 * swallow would leave the body it took standing on the field.
 *
 * Whatever boss stands between the sections is emptied by the same hand, which
 * is what keeps this a run to the Waking: the Banshee's phase ends when she
 * dies (ADR 0007), and a hand that killed everything but her would be measuring
 * the Procession's carriers alone. How long her fight takes is her own module's
 * tests' subject and not this table's.
 */
const playToTheWaking = (seed: number): Reached => {
  const state = createRun(seed);
  const step = stepping(state);
  let carriersKilled = 0;
  let taken = 0;

  for (
    let tick = 0;
    tick < TO_THE_WAKING_TICKS &&
    (state.stage.phaseIndex < WAKING || stillOwed(state));
    tick++
  ) {
    for (const mob of state.mobs) {
      if (mob.alive && mob.carries && hasEntered(mob)) {
        armForTheStorm(state, mob);
      }
    }
    const body = bodyOffered(state);
    if (body !== null) {
      state.grave.x = body.x;
      state.grave.y = body.y;
    }

    for (const event of step(STILL)) {
      if (event.type === 'mobKilled' && event.carried) carriersKilled += 1;
      if (event.type === 'offerTaken') taken += 1;
    }
    holdTheGrave(state);
    for (const mob of state.mobs) {
      if (!mob.alive || mob.carries || !hasEntered(mob)) continue;
      damageMob(state, mob, mob.hp, BIRTHRIGHT[0]);
    }
    if (state.boss !== null) damageBoss(state, state.boss.hp, BIRTHRIGHT[0]);
  }
  return { carriersKilled, taken, state };
};

describe('the peak-arrivals query (ADR 0056)', () => {
  it('reports the most bodies the stage can put on the field inside a window', () => {
    // The densest ten seconds the tables author is the Crowd's four rows from
    // t=130, the climb into the Waking, and the densest ten seconds in the
    // stage is the pour on top of what that section keeps firing under it.
    // Every expected value is summed from the rows rather than written down,
    // so re-authoring them moves both sides together.
    const densest = between(CROWD_ROWS, 130, 140);
    expect(densest).toHaveLength(4);
    const poured = 10 / SET_PIECE_POUR_SECONDS;
    expect(poured).toBeLessThanOrEqual(SET_PIECE_BUDGET);
    expect(peakArrivals(10)).toBe(
      poured + Math.ceil(POUR_SHARES.crowd * totalOf(densest)),
    );

    // It is the maximum over the whole stage, so it stands above each section's
    // own densest ten seconds and above the boss phase's window.
    expect(totalOf(densest)).toBeLessThan(peakArrivals(10));
    expect(totalOf(between(PROCESSION_ROWS, 95, 105))).toBeLessThan(
      peakArrivals(10),
    );
    expect(totalOf(between(VIGIL_ROWS, 49, 59))).toBeLessThan(peakArrivals(10));
    expect(BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE).toBeLessThan(peakArrivals(10));
  });

  it('counts what a boss sheds and what a hit strips, where no table is denser', () => {
    // No two authored rows fall inside one second, so a one-second window holds
    // one row at most, and one second of pour is five bodies, so the largest
    // window in the stage at that length is the boss phase's: a boss's own adds
    // plus the rungs a hit can strip onto the field. Without those two terms
    // the query would never look inside a boss fight at all.
    const busiestRow = Math.max(...EVERY_ROW.map((row) => row.count));
    expect(busiestRow).toBeLessThan(BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE);
    const pourInOneSecond =
      1 / SET_PIECE_POUR_SECONDS + Math.ceil(POUR_SHARES.crowd * busiestRow);
    expect(pourInOneSecond).toBeLessThan(BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE);
    expect(peakArrivals(1)).toBe(BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE);
  });

  it('is computed from the rows, and is zero for a window of no length', () => {
    expect(peakArrivals(0)).toBe(0);

    // A window wider than the whole stage holds every body the densest section
    // authors, so a row added to that table moves the answer. It is the pour
    // that falls behind at that length rather than the table: a pour is bounded
    // by its own budget and a section's rows are not.
    expect(peakArrivals(600)).toBe(totalOf(CROWD_ROWS));
    expect(peakArrivals(600)).toBeGreaterThan(
      SET_PIECE_BUDGET + Math.ceil(POUR_SHARES.crowd * totalOf(CROWD_ROWS)),
    );
    expect(totalOf(CROWD_ROWS)).toBeGreaterThan(totalOf(PROCESSION_ROWS));
    expect(totalOf(CROWD_ROWS)).toBeGreaterThan(totalOf(VIGIL_ROWS));

    // And a wider window never reports fewer arrivals than a narrower one.
    const answers = Array.from({ length: 121 }, (_, seconds) =>
      peakArrivals(seconds),
    );
    expect(answers).toEqual([...answers].sort((first, next) => first - next));
  });
});

describe("the pour's own rows, and the share under it (ADR 0042, ADR 0050)", () => {
  it("declares the pour's budget, interval, health and sweep bounds here, and reaches no module that spawns", () => {
    // The pour is data here and behaviour in setPiece.ts, one direction only:
    // peakArrivals needs the pour's rate, setPiece.ts spawns through mobs.ts,
    // and mobs.ts reads caps.ts, so a rows.ts that reached setPiece.ts for the
    // rate would close the cycle the corpse cap's derivation exists inside.
    expect(SET_PIECE_BUDGET).toBeGreaterThan(0);
    expect(SET_PIECE_POUR_SECONDS).toBeGreaterThan(0);
    expect(SET_PIECE_HP).toBeGreaterThan(0);
    expect(SET_PIECE_SWEEP_MIN_X).toBeLessThan(SET_PIECE_SWEEP_MAX_X);
    const imports = rowsSource.match(/^import [^;]*;/gm) ?? [];
    expect(imports.length).toBeGreaterThan(0);
    expect(imports.filter((line) => !line.startsWith('import type'))).toEqual(
      [],
    );
  });

  it('keeps the section under the pour firing at a share of its own rate, and every other section whole', () => {
    // The share is a data row and what is held is the relation: non-zero, so
    // the set piece never arrives into silence, and below the section's own
    // authored rate, so it thins under the pour (ADR 0051).
    expect(POUR_SHARES.crowd).toBeGreaterThan(0);
    expect(POUR_SHARES.crowd).toBeLessThan(1);
    expect(POUR_SHARES.procession).toBe(1);
    expect(POUR_SHARES.vigil).toBe(1);
  });

  it('carries the section under the pour on at the share it keeps firing at', () => {
    // ADR 0051's other half made data: the Crowd's own last groups, re-timed to
    // the phase the pour runs in and thinned, so the set piece arrives into
    // trash and stays in it. What is held is the relation to the section's own
    // rate and never either magnitude.
    const pourSeconds = SET_PIECE_BUDGET * SET_PIECE_POUR_SECONDS;
    const from = CROWD_ROWS[CROWD_ROWS.length - 1].t - pourSeconds;
    const carried = CROWD_ROWS.filter((row) => row.t > from);

    expect(WAKING_ROWS).toHaveLength(carried.length);
    expect(WAKING_ROWS.map((row) => row.template)).toEqual(
      carried.map((row) => row.template),
    );
    expect(WAKING_ROWS.map((row) => row.t)).toEqual(
      carried.map((row) => row.t - from),
    );
    expect(totalOf(WAKING_ROWS)).toBeGreaterThan(0);
    expect(totalOf(WAKING_ROWS)).toBeLessThan(
      totalOf(carried) * POUR_SHARES.crowd + carried.length,
    );

    // And the corpse cap's own derivation still covers it: the query prices the
    // Waking's window as the pour plus the Crowd's densest window at its share,
    // so the rows that actually fire there have to sit inside that.
    for (let seconds = 1; seconds <= 20; seconds++) {
      const densest = Math.max(
        ...WAKING_ROWS.map((row) =>
          totalOf(between(WAKING_ROWS, row.t, row.t + seconds)),
        ),
      );
      const priced = Math.ceil(
        POUR_SHARES.crowd *
          Math.max(
            ...CROWD_ROWS.map((row) =>
              totalOf(between(CROWD_ROWS, row.t, row.t + seconds)),
            ),
          ),
      );
      expect(`${seconds}s ${densest <= priced}`).toBe(`${seconds}s true`);
    }
  });

  it('pours faster than the densest ten seconds the sections author', () => {
    // The loudest beat in the run cannot arrive thinner than the section it
    // interrupts. The relation is what is held, never either magnitude.
    const densestTable = Math.max(
      ...SECTIONS.map((rows) =>
        Math.max(
          ...rows.map((row) => totalOf(between(rows, row.t, row.t + 10))),
        ),
      ),
    );
    expect(10 / SET_PIECE_POUR_SECONDS).toBeGreaterThan(densestTable);
  });
});

describe("the corpse cap's two boss-fight allowances (ADR 0007, ADR 0055)", () => {
  it('holds every rung a full build can strip onto the field', () => {
    // A hit at the floor strips a rung and puts a body on the field (ADR 0055),
    // and the corpse pool is what holds it. The allowance is bounded twice
    // over, by the hit clock and by the build, and the build is the tighter of
    // the two: a run cannot strip a rung it never bought, and what it can buy
    // is exactly a full build's worth of carriers.
    expect(RUNG_ALLOWANCE).toBeGreaterThanOrEqual(carriersForFullBuild());
  });

  it("holds every add a boss's authored cadence sheds inside a freshness window", () => {
    // The allowance was derived from his cadence, so the two are held against
    // each other rather than written down twice. The Undertaker is the only
    // boss that summons at all: the Banshee's grammar is rings and a feast, so
    // her chunks shed no body the corpse pool has to hold.
    //
    // A window that opens on a digger holds one more than the cadence divides
    // into it, which is the worst case the cap has to cover.
    const window = FRESHNESS_SECONDS * TICK_HZ;
    const shedIn = (every: number): number =>
      Math.floor((window - 1) / every) + 1;
    const cadences = SPIRAL_ROWS.filter((row) => row !== null).map(
      (row) => row.diggerEvery,
    );

    expect(cadences.length).toBeGreaterThan(0);
    for (const every of cadences) {
      expect(`one every ${every}: ${shedIn(every) <= BOSS_ADD_ALLOWANCE}`).toBe(
        `one every ${every}: true`,
      );
    }

    // A chunk break only ever spaces two of them further apart, because the
    // pattern's clock goes back to zero behind an invincible flash, so the
    // tightest window in a fight is one chunk's own cadence.
    expect(CHUNK_FLASH_TICKS).toBeGreaterThan(0);
  });
});

describe('the section tables as data (ADR 0006)', () => {
  it("puts every row's carrier inside that row's own count", () => {
    // Every section pays, so the rule is read against all three tables rather
    // than against whichever one happens to carry.
    for (const rows of SECTIONS) {
      expect(rows.filter((row) => row.carries).length).toBeGreaterThan(0);
    }
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
    for (const rows of [...SECTIONS, WAKING_ROWS]) {
      expect(outOfOrderIn(rows)).toEqual([]);
    }

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
      // And every row the pour runs under, because the set piece is the third
      // of ADR 0047's four moments and a director filling gaps in it would be
      // spending inside the one it protects.
      ...WAKING_ROWS,
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
    // the sparse last row of each of the two sections a boss ends, and every
    // row that fires under the pour.
    const offLimits = 4 + 1 + 2 * SPARSE_LAST_ROW.bodies + WAKING_ROWS.length;
    expect(cells.filter((cell) => cell.endsWith('false')).length).toBe(
      offLimits,
    );
    expect(cells.every((cell) => /(true|false)$/.test(cell))).toBe(true);
  });
});

describe('the carrier schedule across the sections (ADR 0002, ADR 0048)', () => {
  it('stands more carriers on the stage than a full build costs, and keeps the surplus last', () => {
    // ADR 0048: "it holds more carriers than a full build needs, so missing one
    // costs a step rather than the run." The schedule the stage authors is what
    // has to hold that, because slack that lives only in the derivation absorbs
    // nothing.
    expect(carriersIn(EVERY_ROW)).toBeGreaterThanOrEqual(carriersScheduled());

    // Front-loaded: everything a full build costs stands before the set piece,
    // and what the Vigil holds is the slack that makes a miss cost a step
    // rather than the run.
    const beforeTheWaking =
      carriersIn(PROCESSION_ROWS) + carriersIn(CROWD_ROWS);
    expect(beforeTheWaking).toBeGreaterThanOrEqual(carriersForFullBuild());
    expect(carriersIn(VIGIL_ROWS)).toBeGreaterThanOrEqual(
      carriersScheduled() - carriersForFullBuild(),
    );

    // The count is the tables' own and not a constant's: a stage whose rows all
    // say they pay nothing falls short, so the assertions above are a pass
    // rather than an empty set.
    const paying = EVERY_ROW.map((row) => ({ ...row, carries: false }));
    expect(carriersIn(paying)).toBeLessThan(carriersScheduled());
  });

  it("stands the Procession's carriers on File and V rows and never on a Drip", () => {
    // The run's first tell and its first offer are two different bodies rather
    // than one body doing both jobs, and the first kill of the run teaches the
    // swallow. Both of those are Drips, so no Drip in the section pays.
    expect(dripsCarryingIn(PROCESSION_ROWS)).toEqual([]);
    const carrying = PROCESSION_ROWS.filter((row) => row.carries);
    expect([...new Set(carrying.map((row) => row.template))].sort()).toEqual([
      'file',
      'v',
    ]);

    const opening = PROCESSION_ROWS[0];
    expect(
      `${opening.template} at t=${opening.t} carries ${opening.carries}`,
    ).toBe(`drip at t=${opening.t} carries false`);
    const tell = PROCESSION_ROWS.find((row) => row.type === 'revenant')!;
    expect(`${tell.template} at t=${tell.t} carries ${tell.carries}`).toBe(
      `drip at t=${tell.t} carries false`,
    );

    // The rule can see a Drip that pays, so the empty list above is a pass.
    expect(
      dripsCarryingIn([
        {
          t: 0,
          template: 'drip',
          count: 1,
          type: 'revenant',
          carries: true,
          directed: true,
        },
      ]),
    ).toHaveLength(1);
  });

  it('says only that a row carries, and leaves which placement holds the offer to carriers.ts', () => {
    // A row naming its own carrying index would be a second answer to a
    // question carriers.ts already answers, and the two would drift. Every row
    // of every table declares the same six fields and no more.
    const shapes = [
      ...new Set(EVERY_ROW.map((row) => Object.keys(row).sort().join(' '))),
    ];
    expect(shapes).toEqual(['carries count directed t template type']);
    for (const row of EVERY_ROW) {
      expect(`${row.template} at t=${row.t}: ${typeof row.carries}`).toBe(
        `${row.template} at t=${row.t}: boolean`,
      );
    }

    // And the module says the same in its own source: it names no placement and
    // never reaches for the module that holds the rule.
    expect(placementNamesIn(rowsSource)).toEqual([]);
    expect(placementNamesIn('{ carries: true, carrying: [2] }')).not.toEqual(
      [],
    );

    // The one answer, from the one module that gives it.
    expect(carrierRow(true, 6).carrying).toEqual([3]);
    expect(carrierRow(false, 6).carrying).toEqual([]);
  });

  // One test per seed, which is the shape every other whole-run claim in this
  // repo already takes (bot.test.ts's `on seed N` block). Each seed is a run of
  // two whole sections, so the three together take about a second and a half
  // alone and crossed vitest's 5000 ms default under the load of a full
  // `pnpm verify`, where the two workspaces' suites run at once. Split, each
  // seed carries its own budget and the promise is unchanged: all three still
  // run and all three still assert the same three things.
  for (const seed of REACHES_A_FULL_BUILD) {
    it(`pays a full build to a run that kills every carrier before the set piece on seed ${seed}`, () => {
      // Decision 10's condition, in Mark's words: a player who kills every
      // carrier reaches the storm well before the boss. Read on a run rather
      // than off the tables, because how much a carrier pays is the offer's
      // business and a maxed line is never offered.
      const run = playToTheWaking(seed);

      expect(`seed ${seed} killed ${run.carriersKilled}`).toBe(
        `seed ${seed} killed ${
          carriersIn(PROCESSION_ROWS) + carriersIn(CROWD_ROWS)
        }`,
      );
      expect(`seed ${seed} took ${run.taken}`).toBe(
        `seed ${seed} took ${carriersForFullBuild()}`,
      );
      expect(
        WEAPON_LINES.map((line) => `${line} ${run.state.levels[line]}`),
      ).toEqual(WEAPON_LINES.map((line) => `${line} ${MAX_LEVEL}`));
    });
  }
});
