/**
 * The stage's waves as data (ADR 0006), the peak-arrivals query the corpse cap
 * is derived from (ADR 0056), and the carrier schedule the sections author
 * (ADR 0002, ADR 0048). Every assertion reads the tables themselves, because
 * the point of the query is that it moves with the waves.
 *
 * The permission cells live here too. ADR 0056 asks for ADR 0047's off-limits
 * moments as cells in the section's and the wave's own data rather than as
 * conditions in code, so what proves it is a test that reads the tables and
 * calls nothing.
 *
 * One test in the file plays a run instead of reading a table, and the tables
 * are still its subject. What the schedule promises is about a run: that a
 * player who kills every carrier before the set piece holds a full build. That
 * cannot be read off the waves, because how much a carrier pays is the offer's
 * business, so the run is the fixture and the number of carriers each section
 * authors is what is under test.
 */

import { describe, expect, it } from 'vitest';

import wavesSource from '../waves.ts?raw';

import {
  waveCarriers,
  carriersForFullBuild,
  carriersScheduled,
} from '../../carriers';
import { stepping } from '../../../dev/stepping';
import { PHASE_FLASH_TICKS, damageBoss } from '../../bosses/phases';
import { SPIRAL_ROWS } from '../../bosses/undertaker';
import { TICK_HZ } from '../../clock';
import type { TickCommand } from '../../command';
import type { Corpse } from '../../corpses';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from '../../lines/roster';
import type { Mob } from '../../mobs';
import { damageMob, hasEntered, MOB_TYPES } from '../../mobs';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { FRESHNESS_SECONDS, SIZE_START } from '../../tuning';
import type { StageWave } from '../waves';
import {
  BOSS_ADD_ALLOWANCE,
  CROWD_WAVES,
  peakArrivals,
  POUR_SHARES,
  PROCESSION_WAVES,
  RUNG_ALLOWANCE,
  SET_PIECE_BUDGET,
  SET_PIECE_HP,
  SET_PIECE_POUR_SECONDS,
  SET_PIECE_SWEEP_MAX_X,
  SET_PIECE_SWEEP_MIN_X,
  SPARSE_LAST_WAVE,
  VIGIL_WAVES,
  WAKING_WAVES,
} from '../waves';
import type { Section } from '../stage';
import { SECTIONS } from '../stage';

/** Narrows a possibly-absent value, or fails loudly when the absence is a bug. */
function requireDefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

const TRASH_SECTION_TABLES: readonly (readonly StageWave[])[] = [
  PROCESSION_WAVES,
  CROWD_WAVES,
  VIGIL_WAVES,
];

/**
 * Every wave the stage authors, the Waking's own beside the three sections'.
 * The rules a wave obeys, its carrier, its order and its permission cell, are
 * the same rules whichever table it stands in.
 */
const EVERY_WAVE: readonly StageWave[] = [
  ...TRASH_SECTION_TABLES.flat(),
  ...WAKING_WAVES,
];

const totalOf = (waves: readonly StageWave[]): number =>
  waves.reduce((total, wave) => total + wave.count, 0);

const between = (
  waves: readonly StageWave[],
  from: number,
  to: number,
): readonly StageWave[] =>
  waves.filter((wave) => wave.t >= from && wave.t < to);

/** Every place a wave promises a carrier its own count cannot hold. */
const carrierFaultsIn = (waves: readonly StageWave[]): string[] =>
  waves.flatMap((wave) => {
    const where = `${wave.formation} at t=${wave.t}`;
    if (wave.carries && wave.count < 1)
      return [`${where} carries with no body`];
    return waveCarriers(wave.carries, wave.count)
      .carrying.filter((index) => index < 0 || index >= wave.count)
      .map((index) => `${where} carries at ${index} of ${wave.count}`);
  });

/** Every wave that fires before the wave in front of it. */
const outOfOrderIn = (waves: readonly StageWave[]): string[] =>
  waves
    .filter(
      (wave, index) =>
        index > 0 &&
        wave.t < requireDefined(waves[index - 1], 'wave out of range').t,
    )
    .map((wave) => `${wave.formation} at t=${wave.t}`);

/** A section's sparse last wave, which is the tail its own shape declares. */
const sparseIn = (waves: readonly StageWave[]): readonly StageWave[] =>
  waves.slice(waves.length - SPARSE_LAST_WAVE.bodies);

/** The section whose boundary event ends this one, which is the section after it. */
const boundaryAfter = (name: string): Section =>
  requireDefined(
    SECTIONS[SECTIONS.findIndex((each) => each.name === name) + 1],
    `no section after ${name}`,
  );

/**
 * How many carriers a table's waves put on the field, counted through
 * carriers.ts's own placement rule rather than off the flags, so the count is
 * the one the stage actually spawns.
 */
const carriersIn = (waves: readonly StageWave[]): number =>
  waves.reduce(
    (total, wave) =>
      total + waveCarriers(wave.carries, wave.count).carrying.length,
    0,
  );

/** Every Drip in a table that carries the offer, which is none of them. */
const dripsCarryingIn = (waves: readonly StageWave[]): string[] =>
  waves
    .filter((wave) => wave.formation === 'drip' && wave.carries)
    .map((wave) => `drip at t=${wave.t}`);

/**
 * Anything in a source that would name which placement of a wave carries. A wave
 * says that it pays and never who pays it (ADR 0002), so an index in the tables
 * or a reach into the module that holds the rule is the failure this catches.
 */
const placementNamesIn = (source: string): string[] =>
  ['carrying', "from '../carriers'"].filter((named) => source.includes(named));

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

/** The section the Procession's and the Crowd's carriers all stand before. */
const WAKING = SECTIONS.findIndex((section) => section.name === 'waking');

/**
 * A ceiling on the ticks the two sections before the set piece can take, at
 * twice their own authored length. It is a budget that stops a broken run
 * looping forever and never a prediction of where the boundary falls, which is
 * the stage's own to decide.
 */
const TO_THE_WAKING_TICKS =
  2 * TICK_HZ * (PROCESSION_WAVES.at(-1)!.t + CROWD_WAVES.at(-1)!.t);

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
 * deaths section kills it and the offer opens where it died. A kill the test made
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
 * Crowd's last wave fires on the tick that section's waves run out: its bodies
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
 * is what keeps this a run to the Waking: the Banshee's section ends when she
 * dies (ADR 0007), and a hand that killed everything but her would be measuring
 * the Procession's carriers alone. How long her fight takes is her own module's
 * tests' subject and not this table's.
 */
// Any birthright line kills, and the birthright is never empty.
const A_BIRTHRIGHT_LINE = requireDefined(BIRTHRIGHT[0], 'BIRTHRIGHT is empty');

const playToTheWaking = (seed: number): Reached => {
  const state = createRun(seed);
  const step = stepping(state);
  let carriersKilled = 0;
  let taken = 0;

  for (
    let tick = 0;
    tick < TO_THE_WAKING_TICKS &&
    (state.stage.sectionIndex < WAKING || stillOwed(state));
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
      damageMob(state, mob, mob.hp, A_BIRTHRIGHT_LINE);
    }
    if (state.boss !== null) {
      damageBoss(state, state.boss.hp, A_BIRTHRIGHT_LINE);
    }
  }
  return { carriersKilled, taken, state };
};

describe('the peak-arrivals query (ADR 0056)', () => {
  it('reports the most bodies the stage can put on the field inside a window', () => {
    // The densest ten seconds the tables author is the Crowd's four waves from
    // t=130, the climb into the Waking, and the densest ten seconds in the
    // stage is the pour on top of what that section keeps firing under it.
    // Every expected value is summed from the waves rather than written down,
    // so re-authoring them moves both sides together.
    const densest = between(CROWD_WAVES, 130, 140);
    expect(densest).toHaveLength(4);
    const poured = 10 / SET_PIECE_POUR_SECONDS;
    expect(poured).toBeLessThanOrEqual(SET_PIECE_BUDGET);
    expect(peakArrivals(10)).toBe(
      poured + Math.ceil(POUR_SHARES.crowd * totalOf(densest)),
    );

    // It is the maximum over the whole stage, so it stands above each section's
    // own densest ten seconds and above the boss section's window.
    expect(totalOf(densest)).toBeLessThan(peakArrivals(10));
    expect(totalOf(between(PROCESSION_WAVES, 95, 105))).toBeLessThan(
      peakArrivals(10),
    );
    expect(totalOf(between(VIGIL_WAVES, 49, 59))).toBeLessThan(
      peakArrivals(10),
    );
    expect(BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE).toBeLessThan(peakArrivals(10));
  });

  it('counts what a boss sheds and what a hit strips, where no table is denser', () => {
    // No two authored waves fall inside one second, so a one-second window holds
    // one wave at most, and one second of pour is five bodies, so the largest
    // window in the stage at that length is the boss section's: a boss's own adds
    // plus the rungs a hit can strip onto the field. Without those two terms
    // the query would never look inside a boss fight at all.
    const busiestWave = Math.max(...EVERY_WAVE.map((wave) => wave.count));
    expect(busiestWave).toBeLessThan(BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE);
    const pourInOneSecond =
      1 / SET_PIECE_POUR_SECONDS + Math.ceil(POUR_SHARES.crowd * busiestWave);
    expect(pourInOneSecond).toBeLessThan(BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE);
    expect(peakArrivals(1)).toBe(BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE);
  });

  it('is computed from the waves, and is zero for a window of no length', () => {
    expect(peakArrivals(0)).toBe(0);

    // A window wider than the whole stage holds every body the densest section
    // authors, so a wave added to that table moves the answer. It is the pour
    // that falls behind at that length rather than the table: a pour is bounded
    // by its own budget and a section's waves are not.
    expect(peakArrivals(600)).toBe(totalOf(CROWD_WAVES));
    expect(peakArrivals(600)).toBeGreaterThan(
      SET_PIECE_BUDGET + Math.ceil(POUR_SHARES.crowd * totalOf(CROWD_WAVES)),
    );
    expect(totalOf(CROWD_WAVES)).toBeGreaterThan(totalOf(PROCESSION_WAVES));
    expect(totalOf(CROWD_WAVES)).toBeGreaterThan(totalOf(VIGIL_WAVES));

    // And a wider window never reports fewer arrivals than a narrower one.
    const answers = Array.from({ length: 121 }, (_, seconds) =>
      peakArrivals(seconds),
    );
    expect(answers).toEqual([...answers].sort((first, next) => first - next));
  });
});

describe("the pour's own waves, and the share under it (ADR 0042, ADR 0050)", () => {
  it("declares the pour's budget, interval, health and sweep bounds here, and reaches no module that spawns", () => {
    // The pour is data here and behaviour in setPiece.ts, one direction only:
    // peakArrivals needs the pour's rate, setPiece.ts spawns through mobs.ts,
    // and mobs.ts reads caps.ts, so a waves.ts that reached setPiece.ts for the
    // rate would close the cycle the corpse cap's derivation exists inside.
    expect(SET_PIECE_BUDGET).toBeGreaterThan(0);
    expect(SET_PIECE_POUR_SECONDS).toBeGreaterThan(0);
    expect(SET_PIECE_HP).toBeGreaterThan(0);
    expect(SET_PIECE_SWEEP_MIN_X).toBeLessThan(SET_PIECE_SWEEP_MAX_X);
    const imports = wavesSource.match(/^import [^;]*;/gm) ?? [];
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
    // the section the pour runs in and thinned, so the set piece arrives into
    // trash and stays in it. What is held is the relation to the section's own
    // rate and never either magnitude.
    const pourSeconds = SET_PIECE_BUDGET * SET_PIECE_POUR_SECONDS;
    const lastCrowdWave = requireDefined(
      CROWD_WAVES[CROWD_WAVES.length - 1],
      'CROWD_WAVES is empty',
    );
    const from = lastCrowdWave.t - pourSeconds;
    const carried = CROWD_WAVES.filter((wave) => wave.t > from);

    expect(WAKING_WAVES).toHaveLength(carried.length);
    expect(WAKING_WAVES.map((wave) => wave.formation)).toEqual(
      carried.map((wave) => wave.formation),
    );
    expect(WAKING_WAVES.map((wave) => wave.t)).toEqual(
      carried.map((wave) => wave.t - from),
    );
    expect(totalOf(WAKING_WAVES)).toBeGreaterThan(0);
    expect(totalOf(WAKING_WAVES)).toBeLessThan(
      totalOf(carried) * POUR_SHARES.crowd + carried.length,
    );

    // And the corpse cap's own derivation still covers it: the query prices the
    // Waking's window as the pour plus the Crowd's densest window at its share,
    // so the waves that actually fire there have to sit inside that.
    for (let seconds = 1; seconds <= 20; seconds++) {
      const densest = Math.max(
        ...WAKING_WAVES.map((wave) =>
          totalOf(between(WAKING_WAVES, wave.t, wave.t + seconds)),
        ),
      );
      const priced = Math.ceil(
        POUR_SHARES.crowd *
          Math.max(
            ...CROWD_WAVES.map((wave) =>
              totalOf(between(CROWD_WAVES, wave.t, wave.t + seconds)),
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
      ...TRASH_SECTION_TABLES.map((waves) =>
        Math.max(
          ...waves.map((wave) => totalOf(between(waves, wave.t, wave.t + 10))),
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
    // her phases shed no body the corpse pool has to hold.
    //
    // A window that opens on a digger holds one more than the cadence divides
    // into it, which is the worst case the cap has to cover.
    const window = FRESHNESS_SECONDS * TICK_HZ;
    const shedIn = (every: number): number =>
      Math.floor((window - 1) / every) + 1;
    const cadences = SPIRAL_ROWS.filter((row) => row !== null).map(
      (wave) => wave.diggerEvery,
    );

    expect(cadences.length).toBeGreaterThan(0);
    for (const every of cadences) {
      expect(`one every ${every}: ${shedIn(every) <= BOSS_ADD_ALLOWANCE}`).toBe(
        `one every ${every}: true`,
      );
    }

    // A phase break only ever spaces two of them further apart, because the
    // pattern's clock goes back to zero behind an invincible flash, so the
    // tightest window in a fight is one phase's own cadence.
    expect(PHASE_FLASH_TICKS).toBeGreaterThan(0);
  });
});

describe("the Procession's first mob fire (ADR 0016, ADR 0059)", () => {
  it('teaches the tell with a lone revenant Drip and never with the mow body', () => {
    // ADR 0059 silences the mow body, so the Drip of three with one armed can
    // no longer be the game's first mob fire. ADR 0016's readable-before-it-
    // acts asks that a type arrive first as a lone Drip, so the lesson moves
    // onto a revenant standing by itself. Read off the table rather than off
    // the run, because it is the authoring that is ruled.
    const firing = PROCESSION_WAVES.filter(
      (wave) => MOB_TYPES[wave.type].fire.armedShare !== 'none',
    );
    const first = firing[0];
    if (first === undefined) throw new Error('the Procession authors no fire');

    expect({
      type: first.type,
      formation: first.formation,
      count: first.count,
      carries: first.carries,
    }).toEqual({
      type: 'revenant',
      formation: 'drip',
      count: 1,
      carries: false,
    });
  });

  it('puts that Drip ahead of every other body that can fire', () => {
    // The half the first promise cannot state on its own: a lone Drip that
    // arrives after a File of the same type teaches nothing. The tables are
    // time-ordered, so the first firing wave is the earliest one.
    const firing = PROCESSION_WAVES.filter(
      (wave) => MOB_TYPES[wave.type].fire.armedShare !== 'none',
    );
    const [first, ...rest] = firing;
    if (first === undefined) throw new Error('the Procession authors no fire');
    for (const wave of rest) expect(wave.t).toBeGreaterThan(first.t);
  });
});

describe('the section tables as data (ADR 0006)', () => {
  it("puts every wave's carrier inside that wave's own count", () => {
    // Every section pays, so the rule is read against all three tables rather
    // than against whichever one happens to carry.
    for (const waves of TRASH_SECTION_TABLES) {
      expect(waves.filter((wave) => wave.carries).length).toBeGreaterThan(0);
    }
    expect(carrierFaultsIn(EVERY_WAVE)).toEqual([]);

    // The rule can see a bad wave, so the empty list above is a pass rather than
    // an empty set: a wave that says it pays with no body to pay from.
    expect(
      carrierFaultsIn([
        {
          t: 0,
          formation: 'drip',
          count: 0,
          type: 'shambler',
          carries: true,
          directed: true,
        },
      ]),
    ).toHaveLength(1);
  });

  it('orders every section table by its section-local time', () => {
    for (const waves of [...TRASH_SECTION_TABLES, WAKING_WAVES]) {
      expect(outOfOrderIn(waves)).toEqual([]);
    }

    // The same proof of teeth: reversed, the Crowd's own table is caught.
    expect(outOfOrderIn([...CROWD_WAVES].reverse())).not.toEqual([]);
  });

  it('declares directed on every wave and every section, with no optional field anywhere', () => {
    // A boolean and never an absent key, because a director reading an absent
    // cell as permission is exactly the failure ADR 0056's permission matrix
    // exists to stop.
    for (const wave of EVERY_WAVE) {
      expect(`${wave.formation} at t=${wave.t}: ${typeof wave.directed}`).toBe(
        `${wave.formation} at t=${wave.t}: boolean`,
      );
    }
    for (const section of SECTIONS) {
      expect(`${section.name}: ${typeof section.directed}`).toBe(
        `${section.name}: boolean`,
      );
    }
  });

  it('declares both ceiling rows on every section, set only where a section owns a ceiling', () => {
    // The Procession's property is a ceiling on live formations and the Vigil's
    // is a ceiling on live bodies. The Crowd carries neither, because its
    // property is a floor and a director that adds and never removes cannot
    // break a floor. Every other section is off limits to the director outright,
    // so it has no ceiling to declare either.
    const ceilings = SECTIONS.map(
      (section) =>
        `${section.name} ${section.liveFormationCeiling} ${section.liveBodyCeiling}`,
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

    // Declared rather than optional, in both directions: a null is a section
    // saying it owns no ceiling, and an absent key would be a section saying
    // nothing at all.
    for (const section of SECTIONS) {
      expect(`${section.name} ${'liveFormationCeiling' in section}`).toBe(
        `${section.name} true`,
      );
      expect(`${section.name} ${'liveBodyCeiling' in section}`).toBe(
        `${section.name} true`,
      );
    }
  });
});

describe("the director's off-limits cells, as data (ADR 0047, ADR 0056)", () => {
  it('marks every boss section and the set piece section as cells the director may not spend in', () => {
    // Read structurally rather than by name: a section's boundary event is the
    // section after it, so the Banshee, the Waking and the Undertaker are found
    // through the three sections rather than restated here.
    const boundaries = ['procession', 'crowd', 'vigil'].map(boundaryAfter);
    expect(boundaries.map((section) => section.name)).toEqual([
      'banshee',
      'waking',
      'undertaker',
    ]);
    for (const section of boundaries) {
      expect(`${section.name} directed ${section.directed}`).toBe(
        `${section.name} directed false`,
      );
    }

    // And the sections themselves are where the director is meant to work, so
    // the marking separates them rather than covering everything.
    for (const name of ['procession', 'crowd', 'vigil']) {
      const section = SECTIONS.find((each) => each.name === name)!;
      expect(`${name} directed ${section.directed}`).toBe(
        `${name} directed true`,
      );
    }
  });

  it("marks the Wall's own wave and every sparse last wave, and every other wave of the stage is open", () => {
    // ADR 0047 names both outright. The Wall's crossable-unloaded property is
    // two-sided and fails silently with every test still green, so a director
    // filling the gaps around the curtain would break it invisibly; the sparse
    // last wave before each boss is the held breath, authored as a thin wave so
    // that a director briefed to fill gaps cannot tell it from any other gap,
    // which is exactly why it says so itself.
    const closed = EVERY_WAVE.filter((wave) => !wave.directed);
    expect(closed).toEqual([
      ...sparseIn(PROCESSION_WAVES),
      CROWD_WAVES.find((wave) => wave.formation === 'wall')!,
      ...sparseIn(VIGIL_WAVES),
      // And every wave the pour runs under, because the set piece is the third
      // of ADR 0047's four moments and a director filling gaps in it would be
      // spending inside the one it protects.
      ...WAKING_WAVES,
    ]);
  });

  it('reads every off-limits cell out of the wave and section tables alone', () => {
    // The whole of ADR 0056's ask: the four off-limits moments are cells in
    // data rather than conditions in code. Nothing here calls into the stage
    // machine, so a director at step 4 can answer the question the same way.
    const cells = [
      ...SECTIONS.map(
        (section) => `section ${section.name} ${section.directed}`,
      ),
      ...EVERY_WAVE.map((wave) => `wave ${wave.formation} ${wave.directed}`),
    ];

    // The four sections the director may not spend in at all, the Wall's own wave,
    // the sparse last wave of each of the two sections a boss ends, and every
    // wave that fires under the pour.
    const offLimits = 4 + 1 + 2 * SPARSE_LAST_WAVE.bodies + WAKING_WAVES.length;
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
    expect(carriersIn(EVERY_WAVE)).toBeGreaterThanOrEqual(carriersScheduled());

    // Front-loaded: everything a full build costs stands before the set piece,
    // and what the Vigil holds is the slack that makes a miss cost a step
    // rather than the run.
    const beforeTheWaking =
      carriersIn(PROCESSION_WAVES) + carriersIn(CROWD_WAVES);
    expect(beforeTheWaking).toBeGreaterThanOrEqual(carriersForFullBuild());
    expect(carriersIn(VIGIL_WAVES)).toBeGreaterThanOrEqual(
      carriersScheduled() - carriersForFullBuild(),
    );

    // The count is the tables' own and not a constant's: a stage whose waves all
    // say they pay nothing falls short, so the assertions above are a pass
    // rather than an empty set.
    const paying = EVERY_WAVE.map((wave) => ({ ...wave, carries: false }));
    expect(carriersIn(paying)).toBeLessThan(carriersScheduled());
  });

  it("stands the Procession's carriers on File and V waves and never on a Drip", () => {
    // The run's first tell and its first offer are two different bodies rather
    // than one body doing both jobs, and the first kill of the run teaches the
    // swallow. Both of those are Drips, so no Drip in the section pays.
    expect(dripsCarryingIn(PROCESSION_WAVES)).toEqual([]);
    const carrying = PROCESSION_WAVES.filter((wave) => wave.carries);
    expect([...new Set(carrying.map((wave) => wave.formation))].sort()).toEqual(
      ['file', 'v'],
    );

    const opening = requireDefined(
      PROCESSION_WAVES[0],
      'PROCESSION_WAVES is empty',
    );
    expect(
      `${opening.formation} at t=${opening.t} carries ${opening.carries}`,
    ).toBe(`drip at t=${opening.t} carries false`);
    const tell = PROCESSION_WAVES.find((wave) => wave.type === 'revenant')!;
    expect(`${tell.formation} at t=${tell.t} carries ${tell.carries}`).toBe(
      `drip at t=${tell.t} carries false`,
    );

    // The rule can see a Drip that pays, so the empty list above is a pass.
    expect(
      dripsCarryingIn([
        {
          t: 0,
          formation: 'drip',
          count: 1,
          type: 'revenant',
          carries: true,
          directed: true,
        },
      ]),
    ).toHaveLength(1);
  });

  it('says only that a wave carries, and leaves which placement holds the offer to carriers.ts', () => {
    // A wave naming its own carrying index would be a second answer to a
    // question carriers.ts already answers, and the two would drift. Every wave
    // of every table declares the same six fields and no more.
    const shapes = [
      ...new Set(EVERY_WAVE.map((wave) => Object.keys(wave).sort().join(' '))),
    ];
    expect(shapes).toEqual(['carries count directed formation t type']);
    for (const wave of EVERY_WAVE) {
      expect(`${wave.formation} at t=${wave.t}: ${typeof wave.carries}`).toBe(
        `${wave.formation} at t=${wave.t}: boolean`,
      );
    }

    // And the module says the same in its own source: it names no placement and
    // never reaches for the module that holds the rule.
    expect(placementNamesIn(wavesSource)).toEqual([]);
    expect(placementNamesIn('{ carries: true, carrying: [2] }')).not.toEqual(
      [],
    );

    // The one answer, from the one module that gives it.
    expect(waveCarriers(true, 6).carrying).toEqual([3]);
    expect(waveCarriers(false, 6).carrying).toEqual([]);
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
          carriersIn(PROCESSION_WAVES) + carriersIn(CROWD_WAVES)
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
