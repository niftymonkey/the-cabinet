/**
 * The one verb (ADR 0002). Five ADRs meet at this moment, and it takes values
 * rather than an entity reference, because entities are pooled and mutated in
 * place, so a held reference is a recycled slot by the time anything reads it.
 */

import { describe, expect, it } from 'vitest';
import { stepping } from '../../dev/stepping';
import { asSwallowable, CORPSE_HALF_EXTENT } from '../corpses';
import type { SimEvent } from '../events';
import type { WeaponLine } from '../lines/roster';
import { MAX_LEVEL, WEAPON_LINES } from '../lines/roster';
import { openOffer } from '../offer';
import type { RunState } from '../run';
import { createRun, uniformLevels } from '../run';
import type { Swallowable } from '../swallow';
import { swallow } from '../swallow';
import {
  freshnessScale,
  FRESHNESS_PAYOUT_FLOOR,
  RESERVOIR_CAPACITY,
  SIZE_CEILING,
  SIZE_FLOOR,
  SIZE_START,
  TRASH_CORPSE_PAYOUT,
} from '../tuning';
import type { TuningRecord } from '../tuningRecord';
import { DEFAULT_TUNING, resolveTuning } from '../tuningRecord';

/** An id no body of any offer holds, so a hand-built food takes no option. */
const NO_BODY = 0;

/**
 * Where a hand-built piece of food is lying and how fast, which the fall's own
 * drawing reads off the swallowed event (design record R5). None of it changes
 * a payout, so every food below shares one still body at the origin.
 */
const LYING_STILL = {
  x: 0,
  y: 0,
  halfExtent: CORPSE_HALF_EXTENT,
  vx: 0,
  vy: 0,
};

function corpse(freshness: number): Swallowable {
  return {
    id: NO_BODY,
    ...LYING_STILL,
    kind: 'corpse',
    freshness,
    payout: TRASH_CORPSE_PAYOUT,
    tier: 'trash',
    treasureBody: false,
  };
}

function powerUp(line: 'wisps' | 'skullStream'): Swallowable {
  // Treasure never decays, so a power-up always arrives fully fresh (ADR 0004).
  return {
    id: NO_BODY,
    ...LYING_STILL,
    kind: 'powerUp',
    freshness: 1,
    payout: TRASH_CORPSE_PAYOUT,
    tier: 'trash',
    treasureBody: true,
    line,
  };
}

/** The body a maxed run's carrier opens: treasure carrying no option at all. */
function bodyWithNoOption(): Swallowable {
  return {
    id: NO_BODY,
    ...LYING_STILL,
    kind: 'powerUp',
    freshness: 1,
    payout: TRASH_CORPSE_PAYOUT,
    tier: 'trash',
    treasureBody: true,
  };
}

/** A rung the floor ladder took, as the value the swallow takes. */
function fallenRung(line: WeaponLine): Swallowable {
  return {
    id: NO_BODY,
    ...LYING_STILL,
    kind: 'fallenRung',
    freshness: 1,
    payout: TRASH_CORPSE_PAYOUT,
    tier: 'trash',
    treasureBody: true,
    line,
  };
}

function feast(): Swallowable {
  return {
    id: NO_BODY,
    ...LYING_STILL,
    kind: 'feast',
    freshness: 1,
    payout: FEAST_GROWTH,
    tier: 'rich',
    treasureBody: false,
  };
}

/** A rich corpse, which is the large food a revenant leaves (mobs.ts). */
function richCorpse(): Swallowable {
  return {
    id: NO_BODY,
    ...LYING_STILL,
    kind: 'corpse',
    freshness: 1,
    payout: TRASH_CORPSE_PAYOUT,
    tier: 'rich',
    treasureBody: false,
  };
}

/** What one meal at a maxed ladder pays under a record, in points (ADR 0064). */
const mealUnder = (tuning: TuningRecord): number =>
  tuning.score.mealAtMaxedInKills * tuning.score.trashKillScore;

/**
 * What a fully fresh feast pays in growth under the record the build compiles,
 * in size units: its own row, in fresh trash corpses, at the corpse's own unit.
 */
const FEAST_GROWTH = DEFAULT_TUNING.growth.feastInCorpses * TRASH_CORPSE_PAYOUT;

/** The meal the build compiles, which is what every run below starts under. */
const DEFAULT_MEAL_AT_MAXED = mealUnder(DEFAULT_TUNING);

/** A run whose every rostered line stands at the top of its ladder. */
function maxedRun(
  roster?: readonly WeaponLine[],
  tuning?: TuningRecord,
): RunState {
  return createRun(1, {
    startingSize: SIZE_FLOOR,
    startingLevels: uniformLevels(MAX_LEVEL),
    roster,
    tuning,
  });
}

function kinds(events: SimEvent[]): string[] {
  return events.map((event) => event.type);
}

function find<T extends SimEvent['type']>(
  events: SimEvent[],
  type: T,
): Extract<SimEvent, { type: T }> {
  const found = events.find((event) => event.type === type);
  expect(
    found,
    `no ${type} event in ${kinds(events).join(', ')}`,
  ).toBeDefined();
  return found as Extract<SimEvent, { type: T }>;
}

describe('the swallow', () => {
  it('every payout arrives through a swallow: a tick with no swallow in it changes no score, no size and no charge (ADR 0002)', () => {
    const run = createRun(5);
    const step = stepping(run);
    const before = {
      score: run.score,
      size: run.grave.size,
      reservoir: run.reservoir,
    };
    for (let i = 0; i < 120; i++) {
      step({ move: { x: 1, y: -1 }, belch: false });
    }
    expect({
      score: run.score,
      size: run.grave.size,
      reservoir: run.reservoir,
    }).toEqual(before);
  });

  it('growth scales by freshness, and a fully fresh corpse pays its full payout (ADR 0004)', () => {
    // The growth is what the grave is owed on the tip tick and swells into
    // over the ticks after it (Mark's ruling of 2026-09-21), so it is read off
    // the debt and not off the size.
    const fresh = createRun(1);
    swallow(fresh, corpse(1));
    expect(fresh.grave.owed).toBeCloseTo(TRASH_CORPSE_PAYOUT, 10);

    const half = createRun(1);
    swallow(half, corpse(0.5));
    expect(half.grave.owed).toBeCloseTo(TRASH_CORPSE_PAYOUT * 0.5, 10);
  });

  it('freshness scales down to the quarter floor and never below, so a nearly gone corpse still pays (ADR 0004)', () => {
    for (const freshness of [0, 0.05, FRESHNESS_PAYOUT_FLOOR]) {
      const run = createRun(1);
      swallow(run, corpse(freshness));
      expect(run.grave.owed).toBeCloseTo(
        TRASH_CORPSE_PAYOUT * FRESHNESS_PAYOUT_FLOOR,
        10,
      );
    }
  });

  it('a swallow at the size ceiling converts its whole growth to score as overflow (ADR 0003)', () => {
    const run = createRun(1);
    run.grave.size = SIZE_CEILING;
    const events = swallow(run, corpse(1));
    expect(run.grave.size).toBe(SIZE_CEILING);
    expect(run.score).toBeCloseTo(TRASH_CORPSE_PAYOUT, 10);
    expect(find(events, 'overflowed').amount).toBeCloseTo(
      TRASH_CORPSE_PAYOUT,
      10,
    );
  });

  it('a swallow is never gated by size: only where the payout goes differs (ADR 0003)', () => {
    const small = createRun(1);
    small.grave.size = SIZE_FLOOR;
    const big = createRun(1);
    big.grave.size = SIZE_CEILING;

    const atFloor = swallow(small, feast());
    const atCeiling = swallow(big, feast());

    // Both ate it, both chimed, both charged the reservoir.
    for (const events of [atFloor, atCeiling]) {
      expect(kinds(events)).toContain('swallowed');
      expect(kinds(events)).toContain('chimed');
      expect(kinds(events)).toContain('reservoirCharged');
    }
    expect(small.grave.owed).toBeGreaterThan(0);
    expect(small.score).toBe(0);
    expect(big.grave.size).toBe(SIZE_CEILING);
    expect(big.score).toBeCloseTo(FEAST_GROWTH, 10);
  });

  it('the reservoir charges on a swallow (ADR 0008)', () => {
    const run = createRun(1);
    const events = swallow(run, corpse(1));
    expect(run.reservoir).toBeCloseTo(TRASH_CORPSE_PAYOUT, 10);
    expect(find(events, 'reservoirCharged').amount).toBeCloseTo(
      TRASH_CORPSE_PAYOUT,
      10,
    );
  });

  it("charge past the reservoir's capacity clamps and emits the splash, so hoarding visibly wastes (ADR 0008)", () => {
    const run = createRun(1);
    run.reservoir = RESERVOIR_CAPACITY - TRASH_CORPSE_PAYOUT / 2;
    const events = swallow(run, corpse(1));
    expect(run.reservoir).toBe(RESERVOIR_CAPACITY);
    expect(find(events, 'splashed').wasted).toBeCloseTo(
      TRASH_CORPSE_PAYOUT / 2,
      10,
    );
  });

  it('a power-up levels the option the offer laid on that body, and never a line rolled here (ADR 0034)', () => {
    // The line the swallow pays is the offer's, read off the body that went
    // in. A power-up carrying a line that belongs to no live offer levels nothing,
    // which is what makes the offer the only place a level is decided.
    const run = createRun(1);
    openOffer(run, 260, 180);
    const offer = run.offer!;
    const line = offer.options[0];
    if (line === undefined) throw new Error('offer opened with no options');
    const before = run.levels[line];
    const body = run.corpses.find((each) => each.id === offer.bodyIds[0])!;

    const events = swallow(run, asSwallowable(body));

    expect(run.levels[line]).toBe(before + 1);
    expect(find(events, 'weaponLeveled')).toEqual({
      type: 'weaponLeveled',
      line,
      level: before + 1,
    });
    expect(kinds(swallow(run, powerUp('wisps')))).not.toContain(
      'weaponLeveled',
    );
  });

  it('a body carrying no option pays growth, charge and overflow and levels nothing (ADR 0034)', () => {
    // ADR 0034: "when nothing is offerable a paid power-up converts to overflow,
    // keeping ADR 0002's nothing-swallowed-is-worthless promise." The maxed
    // line's own overflow branch went dormant with the same ruling, because a
    // maxed line is never offered in the first place.
    const run = createRun(1);
    run.grave.size = SIZE_CEILING;
    const levels = { ...run.levels };

    const events = swallow(run, bodyWithNoOption());

    expect(run.levels).toEqual(levels);
    expect(kinds(events)).not.toContain('weaponLeveled');
    expect(run.score).toBeGreaterThan(0);
    expect(kinds(events)).toContain('overflowed');
  });

  it("a power-up's freshness is 1 and it is never scaled: treasure never decays (ADR 0004)", () => {
    const run = createRun(1);
    const treasure = powerUp('wisps');
    expect(treasure.freshness).toBe(1);
    swallow(run, treasure);
    expect(run.grave.owed).toBeCloseTo(treasure.payout, 10);
  });

  it('the chime fires on every swallow including the very first, whatever the loadout (glossary: swallow chime)', () => {
    const run = createRun(1);
    for (const line of ['skullStream', 'territory', 'wisps', 'bell'] as const) {
      run.levels[line] = 0;
    }
    expect(kinds(swallow(run, corpse(1)))).toContain('chimed');
    expect(kinds(swallow(run, corpse(0.2)))).toContain('chimed');
    expect(kinds(swallow(run, feast()))).toContain('chimed');
  });

  it('a swallowed event carries the freshness, the kind and the payout, because none of its readers can hold the entity', () => {
    const run = createRun(1);
    const food = corpse(0.4);
    expect(find(swallow(run, food), 'swallowed')).toEqual({
      type: 'swallowed',
      kind: 'corpse',
      freshness: 0.4,
      payout: food.payout,
      offsetX: -run.grave.x,
      offsetY: -run.grave.y,
      halfExtent: CORPSE_HALF_EXTENT,
      vx: 0,
      vy: 0,
      graveSize: SIZE_START,
      tier: 'trash',
      treasureBody: false,
      line: undefined,
    });
  });

  it("a swallowed event carries the food's place as an offset from the grave's centre", () => {
    // Design record R5: the fall is anchored in the grave's proportions, so
    // the event says where the food was against the grave rather than where it
    // was on the field. The subtraction lives in swallow.ts alone.
    const run = createRun(1);
    run.grave.x = 200;
    run.grave.y = 500;
    const food = { ...corpse(1), x: 214, y: 486 };
    const event = find(swallow(run, food), 'swallowed');
    expect(event.offsetX).toBe(14);
    expect(event.offsetY).toBe(-14);
  });

  it("a swallowed event carries the food's half extent, its way and the grave's size at the tip", () => {
    // The size is the one the grave had when the food went over, never the one
    // the swallow just bought: a feast is paid its whole growth on this tick,
    // and a fall anchored against the grown size would start in mid-hole.
    const run = createRun(1);
    const before = run.grave.size;
    const food = { ...feast(), halfExtent: 20, vx: 30, vy: -12 };
    const event = find(swallow(run, food), 'swallowed');
    expect(event.halfExtent).toBe(20);
    expect(event.vx).toBe(30);
    expect(event.vy).toBe(-12);
    expect(event.graveSize).toBe(before);
    expect(run.grave.owed).toBeGreaterThan(0);
  });

  it("a swallowed event carries the food's look, so the drawing code never has to hold the corpse", () => {
    // Slots are reused inside a fall's lifetime, so a fall that held the body
    // would draw whatever killed next. The look travels as values, exactly as
    // the freshness and the payout already do.
    const run = createRun(1);
    const taken = find(swallow(run, fallenRung('bell')), 'swallowed');
    expect(taken.treasureBody).toBe(true);
    expect(taken.line).toBe('bell');
    expect(find(swallow(run, richCorpse()), 'swallowed').tier).toBe('rich');
    expect(find(swallow(run, corpse(1)), 'swallowed').tier).toBe('trash');
  });

  it('a fully fresh feast at an empty reservoir fills it exactly and splashes nothing (entry 5.11)', () => {
    const run = createRun(1);
    expect(run.reservoir).toBe(0);
    const events = swallow(run, feast());
    expect(run.reservoir).toBe(RESERVOIR_CAPACITY);
    expect(kinds(events)).toContain('reservoirFull');
    expect(kinds(events)).not.toContain('splashed');
  });

  it('a feast at a partly charged reservoir emits reservoirFull then splashed, in a stated order (entry 5.11)', () => {
    const run = createRun(1);
    run.reservoir = RESERVOIR_CAPACITY / 2;
    const order = kinds(swallow(run, feast()));
    expect(order).toContain('reservoirFull');
    expect(order).toContain('splashed');
    expect(order.indexOf('reservoirFull')).toBeLessThan(
      order.indexOf('splashed'),
    );
    expect(run.reservoir).toBe(RESERVOIR_CAPACITY);
  });

  it('a feast at the size ceiling with a partly charged reservoir overflows growth to score and splashes charge, and neither cancels the other', () => {
    const run = createRun(1);
    run.grave.size = SIZE_CEILING;
    run.reservoir = RESERVOIR_CAPACITY / 2;
    const events = swallow(run, feast());
    expect(run.score).toBeCloseTo(FEAST_GROWTH, 10);
    expect(run.grave.size).toBe(SIZE_CEILING);
    expect(run.reservoir).toBe(RESERVOIR_CAPACITY);
    expect(find(events, 'splashed').wasted).toBeCloseTo(
      RESERVOIR_CAPACITY / 2,
      10,
    );
  });

  it.todo(
    "dispatch 4: the spawner's side of the treasure guarantee, that a power-up is spawned with freshness 1 (ADR 0004)",
  );
});

describe('no burst is ever paid without freshness applied (ADR 0058, #68)', () => {
  it('pays both on-swallow lines less from a rotten corpse than from a fresh one', () => {
    // ADR 0058: "A test that fails if a burst is ever paid without freshness
    // applied is the point of naming the axis." It spans both lines because
    // the axis is per line and a burst paid flat would pass either one alone.
    const owned = (freshness: number) => {
      const run = createRun(1);
      run.levels.wisps = MAX_LEVEL;
      run.levels.skullStream = MAX_LEVEL;
      swallow(run, corpse(freshness));
      return {
        souls: run.wisps.filter((wisp) => wisp.alive).length,
        volleys: run.lines.surgeVolleys,
      };
    };

    const fresh = owned(1);
    const rotten = owned(FRESHNESS_PAYOUT_FLOOR);

    expect(rotten.souls).toBeLessThan(fresh.souls);
    expect(rotten.volleys).toBeLessThan(fresh.volleys);
  });

  it('pays both lines something from the emptiest corpse the field can hold', () => {
    // The floors, read through the one verb: a swallow that fires nothing
    // reads as a bug, so the rotten end of the curve still pays.
    const run = createRun(1);
    run.levels.wisps = 1;
    run.levels.skullStream = 1;
    swallow(run, corpse(0));

    expect(run.wisps.filter((wisp) => wisp.alive).length).toBeGreaterThan(0);
    expect(run.lines.surgeVolleys).toBeGreaterThan(0);
  });
});

/**
 * The dive catching a rung the floor ladder took (ADR 0055, decision 24). The
 * rung goes back on the line it came off and nowhere else, which is the ruling
 * Salamander is the one shipped precedent for.
 */
describe('a fallen rung swallowed (ADR 0055)', () => {
  it('restores the line it came from and no other', () => {
    const run = createRun(1);
    for (const line of WEAPON_LINES) run.levels[line] = 2;

    const events = swallow(run, fallenRung('wisps'));

    expect(run.levels.wisps).toBe(3);
    for (const line of WEAPON_LINES) {
      if (line === 'wisps') continue;
      expect(run.levels[line]).toBe(2);
    }
    expect(find(events, 'rungCaught')).toEqual({
      type: 'rungCaught',
      line: 'wisps',
      level: 3,
    });
  });

  it('never takes a line past its cap', () => {
    // A line stripped to four can climb back to five off an offer before the
    // body it dropped is reached, so the cap is a live case and not a
    // hypothetical.
    const run = createRun(1);
    run.levels.bell = MAX_LEVEL;

    const events = swallow(run, fallenRung('bell'));

    expect(run.levels.bell).toBe(MAX_LEVEL);
    expect(find(events, 'rungCaught').level).toBe(MAX_LEVEL);
  });

  it('announces on its own event and never as a rung bought', () => {
    // src/dev/replayTallies.ts counts weaponLeveled as a level-up, so a restore
    // counted there would quietly change what that reading has always meant.
    // rungCaught is M6's only source for the catch count.
    const run = createRun(1);
    run.levels.wisps = 1;

    const events = swallow(run, fallenRung('wisps'));

    expect(kinds(events)).toContain('rungCaught');
    expect(kinds(events)).not.toContain('weaponLeveled');
    expect(kinds(events)).not.toContain('powerUpSpawned');
    expect(kinds(events)).not.toContain('offerTaken');
  });

  it('pays growth, charge and overflow the way any other food does', () => {
    // Nothing swallowed is ever worthless (ADR 0002): the rung is food on the
    // way back in as well as a level.
    const run = createRun(1);

    const events = swallow(run, fallenRung('wisps'));

    expect(run.grave.owed).toBeGreaterThan(0);
    expect(kinds(events)).toContain('reservoirCharged');
    expect(find(events, 'chimed').treasureBody).toBe(true);
  });

  it('a body carrying no line at all is a bug and fails loudly', () => {
    // A fallen rung's line is a value this sim wrote at the spawn, so a missing
    // one is never repaired into some other line's rung.
    const run = createRun(1);
    const noLine: Swallowable = {
      id: NO_BODY,
      ...LYING_STILL,
      kind: 'fallenRung',
      freshness: 1,
      payout: TRASH_CORPSE_PAYOUT,
      tier: 'trash',
      treasureBody: true,
    };

    expect(() => swallow(run, noLine)).toThrow(/fallen rung/);
  });

  it('the overflow still pays exactly as it did, and still says so on its own event', () => {
    // The half that did not change. This slice adds beside the overflow and
    // trades nothing, and `overflowed` is not widened and not narrowed.
    const run = createRun(1);
    run.grave.size = SIZE_CEILING;

    const events = swallow(run, corpse(1));
    const overflowed = find(events, 'overflowed');

    expect(overflowed.amount).toBeCloseTo(TRASH_CORPSE_PAYOUT, 10);
    expect(overflowed.score).toBe(run.score);
    expect(Object.keys(overflowed).sort()).toEqual(['amount', 'score', 'type']);
  });

  it("an offer's body never gives a rung back, though it wears the same treasure body", () => {
    // The treasure row says how a body draws and chimes; which body it is stays
    // the kind's, and #122 owns telling the two apart on screen.
    const run = createRun(1);
    run.levels.wisps = 2;

    const events = swallow(run, powerUp('wisps'));

    expect(kinds(events)).not.toContain('rungCaught');
    expect(run.levels.wisps).toBe(2);
  });
});

describe('large food taken at a maxed ladder pays score (design record R4)', () => {
  it('pays its own row on top of the growth, the charge and the overflow it already pays', () => {
    // R4 reads "full power" as every rostered line at MAX_LEVEL and never as
    // the grave at its size ceiling: ADR 0003 says size is health, and growth
    // past the ceiling already pays as the overflow, so reading it the other
    // way would pay twice for one moment.
    const run = maxedRun();

    const events = swallow(run, richCorpse());
    const paid = events.filter((event) => event.type === 'scorePaid');

    expect(paid).toHaveLength(1);
    expect(find(events, 'scorePaid').input).toBe('mealAtMaxed');
    expect(find(events, 'scorePaid').amount).toBe(DEFAULT_MEAL_AT_MAXED);
    expect(run.score).toBe(DEFAULT_MEAL_AT_MAXED);
    expect(run.grave.owed).toBeGreaterThan(0);
    expect(kinds(events)).toContain('reservoirCharged');
  });

  it('pays the row the run started under, so a record that triples it pays three times (ADR 0064)', () => {
    // The direction the row predicts: the meal is stated in trash kills and
    // paid at the run's own kill unit, so the same rich swallow at the same
    // maxed ladder pays what the record says rather than what this build
    // compiles. The count is what binds this input, so the row is the whole of
    // what moves.
    const richer = resolveTuning({
      score: {
        mealAtMaxedInKills: DEFAULT_TUNING.score.mealAtMaxedInKills * 3,
      },
    });
    const underDefault = maxedRun();
    const underRicher = maxedRun(undefined, richer);

    swallow(underDefault, richCorpse());
    swallow(underRicher, richCorpse());

    expect(underDefault.score).toBe(DEFAULT_MEAL_AT_MAXED);
    expect(underRicher.score).toBe(mealUnder(richer));
    expect(underRicher.score).toBe(3 * underDefault.score);
  });

  it('pays a feast the same bonus, because the feast is large food too', () => {
    const run = maxedRun();

    swallow(run, feast());

    expect(run.score).toBeGreaterThanOrEqual(DEFAULT_MEAL_AT_MAXED);
  });

  it('pays no bonus while one rostered line still stands below its top rung', () => {
    // The condition is every line and not any line: one rung short of full
    // power is not full power.
    const run = maxedRun();
    run.levels.wisps = MAX_LEVEL - 1;

    const events = swallow(run, richCorpse());

    expect(kinds(events)).not.toContain('scorePaid');
    expect(run.score).toBe(0);
  });

  it('pays no bonus for a trash swallow at a maxed ladder', () => {
    // The tier is the rule and not the timing alone: large food is the rich
    // tier, and the mow's own body is not it.
    const run = maxedRun();

    const events = swallow(run, corpse(1));

    expect(kinds(events)).not.toContain('scorePaid');
    expect(run.score).toBe(0);
  });

  it("never holds the bonus back for a line outside the run's roster", () => {
    // The roster decides what a run has (ADR 0046), so a line this run was
    // never fielding cannot keep it from being at full power.
    const roster: readonly WeaponLine[] = ['skullStream'];
    const run = createRun(1, {
      startingSize: SIZE_FLOOR,
      startingLevels: { ...uniformLevels(0), skullStream: MAX_LEVEL },
      roster,
    });

    swallow(run, richCorpse());

    expect(run.score).toBe(DEFAULT_MEAL_AT_MAXED);
    expect(WEAPON_LINES.length).toBeGreaterThan(roster.length);
  });
});

/**
 * Entry 5.11's identity, once the feast's growth and the reservoir's capacity
 * stopped being one number (Mark's ruling of 2026-09-21).
 */
describe('what a feast pays the reservoir and what it pays in growth (entry 5.11)', () => {
  it('a feast swallowed at a part-full reservoir fills it and splashes exactly what was in it, as it does today', () => {
    // The swallow of a feast slams the reservoir full, so what goes over the
    // side is whatever was standing in it. Not one event about the reservoir
    // moves in timing or in amount.
    const run = createRun(1);
    run.reservoir = RESERVOIR_CAPACITY / 3;

    const events = swallow(run, feast());

    expect(run.reservoir).toBeCloseTo(RESERVOIR_CAPACITY, 10);
    expect(find(events, 'reservoirCharged').amount).toBeCloseTo(
      (RESERVOIR_CAPACITY * 2) / 3,
      10,
    );
    expect(find(events, 'splashed').wasted).toBeCloseTo(
      RESERVOIR_CAPACITY / 3,
      10,
    );
  });

  it('a feast pays the reservoir its whole capacity and pays growth the far smaller figure its own row names', () => {
    // The two stopped being one number: the charge is the capacity by entry
    // 5.11's ruling, and the growth is its own row, 45 corpses against the
    // reservoir's 300.
    const run = createRun(1);

    swallow(run, feast());

    expect(run.reservoir).toBe(RESERVOIR_CAPACITY);
    expect(run.grave.owed).toBeCloseTo(FEAST_GROWTH, 10);
    expect(FEAST_GROWTH * 6).toBeLessThan(RESERVOIR_CAPACITY);
  });

  it('a corpse charges the reservoir what it pays in growth, unchanged', () => {
    // Everything that is not a feast still charges what it paid, scaled by its
    // own freshness, which is the line entry 5.11 does not touch.
    const run = createRun(1);

    swallow(run, corpse(0.5));

    const paid = TRASH_CORPSE_PAYOUT * freshnessScale(0.5);
    expect(run.reservoir).toBeCloseTo(paid, 10);
    expect(run.grave.owed).toBeCloseTo(paid, 10);
  });
});
