/**
 * The entity cap policy. At the cap the spawn is refused and nothing already on
 * the field is removed, which is one rule across all three pools (ADR 0056).
 * The corpse pool used to be the exception, taking the oldest corpse under; the
 * cap is sized from the stage now, so binding at all is a fault rather than a
 * policy.
 */

import { describe, expect, it } from 'vitest';

import {
  CORPSE_CAP,
  MOB_CAP,
  MOB_FIRE_CAP,
  peakLive,
  REVENANT_FIRE_PEAK,
  TRANSIT_SECONDS,
  TREASURE_ALLOWANCE,
  WORST_BOSS_PATTERN,
} from '../caps';
import { PHASE_FLASH_TICKS } from '../bosses/phases';
import { TICK_HZ } from '../clock';
import { spawnCorpse, spawnPowerUp, spawnFeast } from '../corpses';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT } from '../field';
import { createStageWatch, checkInvariants } from '../invariants';
import { fireDirectedShot } from '../mobFire';
import type { Mob, MobType } from '../mobs';
import { advanceMobs, ARRIVE_TICKS, MOB_TYPES, spawnMob } from '../mobs';
import type { RunState } from '../run';
import { createRun } from '../run';
import type { StageWave } from '../stage/waves';
import {
  BOSS_FIRE,
  CROWD_PURSE,
  CROWD_WAVES,
  largestCard,
  peakArrivals,
  peakArrivalsOf,
  PROCESSION_PURSE,
  PROCESSION_WAVES,
  QUIET_INTERVAL_MINIMUM_SECONDS,
  VIGIL_WAVES,
} from '../stage/waves';
import { FRESHNESS_SECONDS } from '../tuning';

function quietRun(seed = 12): RunState {
  const run = createRun(seed);
  run.stage.firedWaves = PROCESSION_WAVES.length;
  return run;
}

function at(x: number, y: number) {
  return { x, y, vx: 0, vy: 1, index: 0 };
}

function deadMob(state: RunState, type: MobType, x: number, y: number): Mob {
  const mob = spawnMob(state, type, at(x, y), false)!;
  mob.alive = false;
  return mob;
}

/** Fills the mob pool to the cap, so the next spawn has nowhere to go. */
function fillMobs(state: RunState): void {
  while (spawnMob(state, 'shambler', at(60, 40), false) !== null) {
    // The loop condition is the fill.
  }
}

/**
 * The corpse a dead mob leaves, spawned the way mobs.ts spawns it: the mob
 * table is mobs.ts's, so a kill's payout and tier reach corpses.ts as values
 * read off the dead mob's own row.
 */
function leaveCorpse(state: RunState, mob: Mob) {
  const row = MOB_TYPES[mob.type];
  return spawnCorpse(state, mob, row.corpsePayout, row.corpseTier);
}

describe('the mob cap', () => {
  it('refuses a further spawn and removes nothing already live', () => {
    const state = quietRun();
    fillMobs(state);
    const live = state.mobs.filter((mob) => mob.alive);
    expect(live).toHaveLength(MOB_CAP);
    const ids = live.map((mob) => mob.id);

    expect(spawnMob(state, 'revenant', at(120, 40), false)).toBeNull();
    expect(state.mobs.filter((mob) => mob.alive)).toHaveLength(MOB_CAP);
    expect(state.mobs.filter((mob) => mob.alive).map((mob) => mob.id)).toEqual(
      ids,
    );
  });
});

describe('the mob fire cap', () => {
  it('refuses a further shot, so nothing the player has read and started dodging ever vanishes', () => {
    const state = quietRun();
    // Every slot claimed by hand, because reaching a full pool of shots through
    // firing mobs would take a whole section.
    for (const shot of state.mobFire) {
      shot.alive = true;
      shot.id = state.nextEntityId;
      state.nextEntityId += 1;
      shot.x = 10;
      shot.y = 10;
      shot.halfExtent = 5;
    }
    const ids = state.mobFire.map((shot) => shot.id);

    spawnMob(state, 'revenant', at(200, MOB_TYPES.revenant.halfHeight), false);
    const events: SimEvent[] = [];
    for (let tick = 0; tick < ARRIVE_TICKS + 1; tick++) {
      events.push(...advanceMobs(state));
    }
    expect(events.filter((event) => event.type === 'mobFired')).toHaveLength(0);
    expect(state.mobFire).toHaveLength(MOB_FIRE_CAP);
    expect(state.mobFire.map((shot) => shot.id)).toEqual(ids);
  });
});

/** The whole pool full of corpses a kill left, which is the cap binding. */
function fillCorpses(state: RunState): void {
  while (state.corpses.some((corpse) => !corpse.alive)) {
    leaveCorpse(state, deadMob(state, 'shambler', 60, 40));
  }
}

/** What a corpse is, as values, so a slot taken under is visible as a change. */
function foodOn(state: RunState) {
  return state.corpses
    .filter((corpse) => corpse.alive)
    .map((corpse) => ({
      id: corpse.id,
      kind: corpse.kind,
      x: corpse.x,
      y: corpse.y,
      freshness: corpse.freshness,
    }));
}

describe('the corpse cap (ADR 0056)', () => {
  it('never evicts food: at the cap the spawn is refused and every body already down stays', () => {
    // ADR 0056: the cap is sized from scroll physics so that it cannot bind in
    // normal play, never evicts food, and raises a fault if it ever binds. The
    // eviction it replaces took the oldest corpse under to make room, which is
    // food removed from the field by housekeeping.
    const state = quietRun();
    fillCorpses(state);
    const before = foodOn(state);
    expect(before).toHaveLength(CORPSE_CAP);

    const events = leaveCorpse(state, deadMob(state, 'revenant', 300, 500));
    expect(events).toEqual([]);
    expect(foodOn(state)).toEqual(before);
  });

  it('raises a recoverable fault when it binds, because a cap that binds is a bug rather than a policy', () => {
    const state = quietRun();
    fillCorpses(state);
    expect(checkInvariants(state, createStageWatch())).toEqual([]);

    leaveCorpse(state, deadMob(state, 'revenant', 300, 500));
    const faults = checkInvariants(state, createStageWatch());
    expect(faults.map((fault) => fault.identity)).toEqual([
      'corpse cap never binds',
    ]);
    const fault = faults[0];
    if (fault === undefined) throw new Error('no fault recorded');
    expect(fault.severity).toBe('recoverable');
  });

  it("is the mob cap plus the stage's peak arrivals in a freshness window plus the treasure allowance plus what the director can add inside it", () => {
    // A proof rather than an estimate: every decaying corpse alive came from a
    // body alive when the freshness window opened or from one that arrived
    // inside it, and treasure never decays and is bounded by design. The
    // arrivals term counts four things, the section tables, the pour, a boss's
    // own adds and the rungs a hit can strip, so the window it maximises over
    // includes the inside of a boss fight.
    //
    // The fourth term is the director's, and it is the one the derivation used
    // to be missing. It is the cards the quiet interval leaves room for inside
    // the window, one card at the window's opening and one more at every
    // minimum interval after it, and never a section's whole purse.
    const directed =
      largestCard(null) *
      (Math.floor(FRESHNESS_SECONDS / QUIET_INTERVAL_MINIMUM_SECONDS) + 1);
    expect(directed).toBeGreaterThan(0);
    expect(CORPSE_CAP).toBe(
      MOB_CAP + peakArrivals(FRESHNESS_SECONDS) + TREASURE_ALLOWANCE + directed,
    );
    // Computed rather than written down, which is what makes it move with the
    // waves: the query is a real query and not a constant wearing one.
    expect(peakArrivals(FRESHNESS_SECONDS)).toBeGreaterThan(0);
  });

  it('stands above the mob cap plus the arrivals plus the allowance, so a later term can only raise it', () => {
    // The identity above is the whole sum and this is the floor under it: a cap
    // held at least this high cannot bind for a reason the derivation already
    // priced, whatever a later term adds on top.
    expect(CORPSE_CAP).toBeGreaterThanOrEqual(
      MOB_CAP + peakArrivals(FRESHNESS_SECONDS) + TREASURE_ALLOWANCE,
    );
    expect(TREASURE_ALLOWANCE).toBeGreaterThan(0);
  });

  it('returns no corpse and leaves the pool exactly as it was', () => {
    const state = quietRun();
    fillCorpses(state);
    const before = foodOn(state);
    const mob = deadMob(state, 'shambler', 10, 10);
    const nextId = state.nextEntityId;

    expect(leaveCorpse(state, mob)).toEqual([]);
    expect(foodOn(state)).toEqual(before);
    // The refused spawn stamps no id, so the run's own id counter does not
    // move for a body that never reached the field.
    expect(state.nextEntityId).toBe(nextId);
  });

  it('removes nothing already on the field whichever kind of food asks for the slot', () => {
    // caps.ts's own rule, guarded through the change: a shot the player has
    // read and started dodging cannot vanish, and neither can a body they have
    // started diving for. Treasure asking a pool full of corpses is the case
    // the eviction policy used to answer by taking a corpse under, and a corpse
    // asking a pool full of treasure is the case it already refused.
    const state = quietRun();
    fillCorpses(state);
    const corpses = foodOn(state);
    expect(spawnPowerUp(state, 100, 100, 'bell')).toEqual([]);
    expect(spawnFeast(state, 100, 100, 4)).toEqual([]);
    expect(foodOn(state)).toEqual(corpses);

    const treasureRun = quietRun(13);
    while (treasureRun.corpses.some((corpse) => !corpse.alive)) {
      spawnPowerUp(treasureRun, 100, 100, 'bell');
    }
    const treasure = foodOn(treasureRun);
    expect(treasure).toHaveLength(CORPSE_CAP);
    expect(
      leaveCorpse(treasureRun, deadMob(treasureRun, 'shambler', 50, 50)),
    ).toEqual([]);
    expect(foodOn(treasureRun)).toEqual(treasure);
  });
});

/** The bodies a table's one-shot waves alone land in the window from this time. */
function beatsFrom(
  waves: readonly StageWave[],
  from: number,
  seconds: number,
): number {
  return waves
    .filter(
      (wave) =>
        wave.repeat === null && wave.t >= from && wave.t < from + seconds,
    )
    .reduce((total, wave) => total + wave.count, 0);
}

describe('the caps as derivations of the stage (ADR 0056)', () => {
  it("stands every cap above the worst case the stage's own data names", () => {
    // ADR 0056: "a section's worst case is its floor plus its budget, which is
    // a number in data, so the mob cap is re-derived above that". Every cap
    // below is computed from the waves and read against them here, so a cap
    // that stopped describing the content it was taken from fails.
    expect(MOB_CAP).toBe(peakLive());
    expect(MOB_CAP).toBeGreaterThan(peakArrivals(FRESHNESS_SECONDS));
    expect(CORPSE_CAP).toBeGreaterThan(
      MOB_CAP + peakArrivals(FRESHNESS_SECONDS),
    );
    expect(MOB_FIRE_CAP).toBeGreaterThan(
      peakArrivalsOf('revenant', TRANSIT_SECONDS),
    );
    // None of the three is a literal: each moves when the waves move.
    expect(peakArrivals(TRANSIT_SECONDS)).toBeGreaterThan(0);
  });

  it("takes the mob cap's standing term as the rate times a body's time on the field", () => {
    // The tech architecture gate's finding: what is alive is what arrived and
    // has not yet died or left, so a peak taken from the rate alone is a cap
    // that binds the first time nobody kills anything. Slice B landed the
    // transit bound; what is held here is the property and not its spelling.
    const fastest = [PROCESSION_WAVES, CROWD_WAVES, VIGIL_WAVES]
      .flat()
      .reduce(
        (rate, wave) =>
          wave.repeat === null
            ? rate
            : Math.max(rate, wave.count / wave.repeat.intervalSeconds),
        0,
      );
    expect(fastest).toBeGreaterThan(0);
    expect(MOB_CAP).toBeGreaterThanOrEqual(fastest * TRANSIT_SECONDS);
    // The teeth: the rate alone is an order of magnitude short of it, so the
    // assertion is the transit window being counted rather than the window
    // being generous.
    expect(fastest * TRANSIT_SECONDS).toBeGreaterThan(10 * fastest);
    // And a body does stand for longer than a freshness window, which is what
    // makes the mob cap the corpse cap's first term rather than a second one.
    expect(TRANSIT_SECONDS).toBeGreaterThan(FRESHNESS_SECONDS);
  });

  it("takes the mob cap's director term as the largest card and never a purse", () => {
    // A purse is spent over a section with a quiet interval between every add,
    // so a purse-sized addend would size the pool for a moment the quiet
    // interval forbids. The largest card is the most the director can put down
    // at once, which is what a pool has to hold.
    expect(peakLive()).toBe(peakArrivals(TRANSIT_SECONDS) + largestCard(null));
    expect(largestCard(null)).toBeGreaterThan(0);
    expect(largestCard(null)).toBeLessThan(PROCESSION_PURSE);
    expect(largestCard(null)).toBeLessThan(CROWD_PURSE);
  });

  it('stands the mob-fire cap above the revenant peak plus the worst boss pattern', () => {
    // Boss fire and trash fire share one pool (mobFire.ts's createShotPool), so
    // a derivation over the revenants alone would size a pool for a field that
    // never happens.
    expect(MOB_FIRE_CAP).toBe(REVENANT_FIRE_PEAK + WORST_BOSS_PATTERN);

    // Each term stands above its own floor, read off the data rather than off
    // the derivation. A revenant holds more than one shot in the air because
    // its shot's flight outlasts its own interval, and a phase holds more than
    // one emit for the same reason.
    const revenants =
      peakArrivalsOf('revenant', TRANSIT_SECONDS) + largestCard('revenant');
    expect(REVENANT_FIRE_PEAK).toBeGreaterThan(revenants);
    const worstEmit = Math.max(
      ...Object.values(BOSS_FIRE)
        .flat()
        .map((phase) =>
          phase.reduce((shots, pattern) => shots + pattern.shots, 0),
        ),
    );
    expect(WORST_BOSS_PATTERN).toBeGreaterThan(worstEmit);
    // The teeth: without the boss term the cap would be the revenant half
    // alone, and the bosses put more in the air than the revenants ever do.
    expect(WORST_BOSS_PATTERN).toBeGreaterThan(0);
    expect(MOB_FIRE_CAP).toBeGreaterThan(REVENANT_FIRE_PEAK);

    // And two phases share the pool at a break, which is why the boss term is a
    // phase beside the one that follows it rather than a phase alone: the flash
    // between phases is far shorter than the flight of the slowest shot either
    // boss fires, so the phase that just ended is still in the air.
    const slowest = Math.min(
      ...Object.values(BOSS_FIRE)
        .flat(2)
        .map((pattern) => pattern.unitsASecond),
    );
    expect(PHASE_FLASH_TICKS / TICK_HZ).toBeLessThan(FIELD_HEIGHT / slowest);
  });

  it('raises a fault at a bound cap and removes nothing from the field', () => {
    // ADR 0056 and caps.ts's own rule, held across all three pools rather than
    // on the corpse pool alone: the spawn is refused, everything already on the
    // field stays, and the harness raises a recoverable fault.
    const state = quietRun();
    fillMobs(state);
    const mobs = state.mobs.filter((mob) => mob.alive).map((mob) => mob.id);
    expect(spawnMob(state, 'ghoul', at(80, 40), false)).toBeNull();
    expect(state.mobs.filter((mob) => mob.alive).map((mob) => mob.id)).toEqual(
      mobs,
    );

    const shots = state.mobFire.map((shot) => shot.id);
    for (const shot of state.mobFire) shot.alive = true;
    expect(
      fireDirectedShot(
        state,
        { x: 10, y: 10 },
        { x: 0, y: 1 },
        MOB_TYPES.revenant.fire,
        'revenant',
        'trash',
      ),
    ).toEqual([]);
    expect(state.mobFire.map((shot) => shot.id)).toEqual(shots);

    // The corpse pool needs a run with mob slots left, because what fills it is
    // the corpses dead bodies leave.
    const food = quietRun(31);
    fillCorpses(food);
    const down = foodOn(food);
    leaveCorpse(food, deadMob(food, 'shambler', 70, 70));
    expect(foodOn(food)).toEqual(down);
    expect(
      checkInvariants(food, createStageWatch()).map((fault) => ({
        identity: fault.identity,
        severity: fault.severity,
      })),
    ).toContainEqual({
      identity: 'corpse cap never binds',
      severity: 'recoverable',
    });
  });

  it('takes no corpse off the field to make room for another', () => {
    // #85's acceptance line and ADR 0056, as its own promise rather than as a
    // clause of the refusal test: the eviction this replaced took the oldest
    // corpse under, so what is held is that a full pool asked many times over
    // still holds exactly the bodies it held before the first ask.
    const state = quietRun(21);
    fillCorpses(state);
    const before = foodOn(state);
    for (let attempt = 0; attempt < 20; attempt++) {
      leaveCorpse(state, deadMob(state, 'revenant', 200 + attempt, 400));
      spawnPowerUp(state, 120, 120, 'bell');
    }
    expect(foodOn(state)).toEqual(before);
    expect(foodOn(state)).toHaveLength(CORPSE_CAP);
  });

  it('holds a stage with no standing wave to what its beats alone land', () => {
    // The module test the plan asks for, in the only shape a module holding its
    // tables as data can take it: the stage has no configuration without
    // standing waves, so what is read is the same table with its rates struck
    // out. A stage of beats alone lands far less in a transit window, which is
    // the whole reason peakLive is a transit window rather than an arrivals
    // count.
    const beats = Math.max(
      ...[PROCESSION_WAVES, CROWD_WAVES, VIGIL_WAVES].flatMap((waves) =>
        waves.map((wave) => beatsFrom(waves, wave.t, TRANSIT_SECONDS)),
      ),
    );
    expect(beats).toBeGreaterThan(0);
    expect(peakLive()).toBeGreaterThan(beats);
    // And it is not merely larger: the rates carry most of it.
    expect(peakLive()).toBeGreaterThan(2 * beats);
  });
});
