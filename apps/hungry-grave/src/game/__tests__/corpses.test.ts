/**
 * Corpses and freshness (ADR 0004). The coupling to the scroll is the invariant
 * here, and it is the reason FRESHNESS_SECONDS is derived rather than declared.
 */

import { describe, expect, it } from 'vitest';

import corpsesSource from '../corpses.ts?raw';

import { stepping } from '../../dev/stepping';
import { createExecution, executeTick } from '../execution';
import { TICK_HZ } from '../clock';
import {
  advanceCorpses,
  asSwallowable,
  CORPSE_HALF_EXTENT,
  corpseHitbox,
  cullCorpses,
  DROP_HALF_EXTENT,
  spawnCorpse,
  spawnDrop,
  spawnFeast,
} from '../corpses';
import type { TickCommand } from '../command';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT } from '../field';
import type { Mob, MobType } from '../mobs';
import { damageMob, MOB_TYPES, spawnMob } from '../mobs';
import { openOffer } from '../offer';
import type { RunState } from '../run';
import { createRun } from '../run';
import { PROCESSION_ROWS } from '../stage/rows';
import { PHASES } from '../stage/stage';
import { swallow } from '../swallow';
import {
  FRESHNESS_PAYOUT_FLOOR,
  FRESHNESS_SECONDS,
  SCROLL_SPEED,
} from '../tuning';

/** A tick that only steers, which is every tick these tests are about. */
function drift(x: number, y: number): TickCommand {
  return { move: { x, y }, belch: false };
}

const STILL: TickCommand = drift(0, 0);

function quietRun(seed = 9): RunState {
  const run = createRun(seed);
  run.stage.firedRows = PROCESSION_ROWS.length;
  return run;
}

/** A dead mob of the given type at a place the grave is nowhere near. */
function killAt(state: RunState, type: MobType, x: number, y: number): Mob {
  const mob = spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 }, false)!;
  mob.alive = false;
  return mob;
}

function corpseOf(state: RunState) {
  const live = state.corpses.filter((corpse) => corpse.alive);
  expect(live).toHaveLength(1);
  const corpse = live[0];
  if (corpse === undefined) throw new Error('no live corpse');
  return corpse;
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

describe("a corpse's drift (ADR 0004)", () => {
  it('has no velocity of its own, so the scroll is the only thing that moves it', () => {
    const state = quietRun();
    const step = stepping(state);
    leaveCorpse(state, killAt(state, 'shambler', 60, 200));
    const corpse = corpseOf(state);
    const from = corpse.y;
    const x = corpse.x;

    for (let tick = 0; tick < 30; tick++) step(STILL);
    expect(corpse.x).toBe(x);
    expect(corpse.y - from).toBeCloseTo(30 * SCROLL_SPEED, 9);
  });

  it('the coupling: a mid-field kill reaches the bottom edge as a nearly empty scrap', () => {
    // The reason FRESHNESS_SECONDS is derived from the scroll rather than
    // declared beside it. Nobody can give corpses a drift of their own without
    // this going red.
    const state = quietRun();
    const step = stepping(state);
    leaveCorpse(state, killAt(state, 'shambler', 60, FIELD_HEIGHT / 2));
    const corpse = corpseOf(state);

    const events: SimEvent[] = [];
    let atEnd = corpse.y;
    while (corpse.alive && state.tick < 2 * FRESHNESS_SECONDS * TICK_HZ) {
      atEnd = corpse.y;
      events.push(...step(STILL));
    }
    expect(corpse.alive).toBe(false);
    expect(
      events.filter((event) => event.type === 'corpseExpired'),
    ).toHaveLength(1);
    expect(atEnd).toBeGreaterThan(FIELD_HEIGHT - 5 * SCROLL_SPEED);
  });
});

describe('freshness (ADR 0004)', () => {
  it('drains from 1 to 0 over FRESHNESS_SECONDS and never below', () => {
    const state = quietRun();
    leaveCorpse(state, killAt(state, 'shambler', 60, 40));
    const corpse = corpseOf(state);
    expect(corpse.freshness).toBe(1);

    const half = Math.round((FRESHNESS_SECONDS * TICK_HZ) / 2);
    for (let tick = 0; tick < half; tick++) advanceCorpses(state);
    expect(corpse.freshness).toBeCloseTo(0.5, 6);

    for (let tick = 0; tick < half + 60; tick++) advanceCorpses(state);
    expect(corpse.freshness).toBe(0);
    expect(corpse.alive).toBe(false);
  });

  it('scales a payout down to the floor and never to zero', () => {
    const state = quietRun();
    leaveCorpse(state, killAt(state, 'shambler', 60, 40));
    const corpse = corpseOf(state);
    corpse.freshness = 0;

    const events = swallow(state, asSwallowable(corpse));
    const grew = events.find((event) => event.type === 'grew');
    expect(grew?.amount).toBeCloseTo(corpse.payout * FRESHNESS_PAYOUT_FLOOR, 9);
  });

  it('an empty corpse is taken under, and one leaving the bottom edge with value left is lost instead', () => {
    const empty = quietRun();
    leaveCorpse(empty, killAt(empty, 'shambler', 60, 40));
    const dying = corpseOf(empty);
    dying.freshness = 0.001;
    const expiring = stepping(empty)(STILL);
    expect(expiring.map((event) => event.type)).toContain('corpseExpired');

    const lost = quietRun();
    leaveCorpse(lost, killAt(lost, 'shambler', 60, FIELD_HEIGHT - 2));
    const leaving = corpseOf(lost);
    const stepLost = stepping(lost);
    const events: SimEvent[] = [];
    while (leaving.alive && lost.tick < 200) {
      events.push(...stepLost(STILL));
    }
    const off = events.find((event) => event.type === 'corpseLost');
    expect(off).toBeDefined();
    expect(off?.type === 'corpseLost' && off.freshness).toBeGreaterThan(0.9);
    expect(
      events.filter((event) => event.type === 'corpseExpired'),
    ).toHaveLength(0);
  });

  it('a feast never decays', () => {
    // Nothing in this dispatch spawns one. The mechanism lands here so the boss
    // dispatch authors a shed rather than inventing a never-decaying flag.
    const state = quietRun();
    spawnFeast(state, 60, 40, 5);
    const feast = corpseOf(state);
    expect(feast.decays).toBe(false);

    for (let tick = 0; tick < 2 * FRESHNESS_SECONDS * TICK_HZ; tick++) {
      advanceCorpses(state);
    }
    expect(feast.freshness).toBe(1);
    expect(feast.alive).toBe(true);
  });
});

describe('what a kill hands the corpse pool (#59)', () => {
  it('takes the payout and the tier from the caller rather than reading the mob table', () => {
    // The mob table belongs to mobs.ts, so a kill's two payout facts travel as
    // values. Numbers no row carries are what say the lookup is gone from here
    // rather than hidden behind a default.
    const state = quietRun();
    const mob = killAt(state, 'shambler', 60, 40);

    spawnCorpse(state, mob, 999, 'rich');

    const corpse = corpseOf(state);
    expect(corpse.payout).toBe(999);
    expect(corpse.tier).toBe('rich');
    expect(corpse.x).toBe(60);
    expect(corpse.y).toBe(40);
  });

  it('leaves the same corpse a kill through damageMob has always left', () => {
    // The seam moved and the corpse a player dives for did not, field by field.
    const state = quietRun();
    const mob = spawnMob(
      state,
      'revenant',
      {
        x: 120,
        y: 40,
        vx: 0,
        vy: 1,
        index: 0,
      },
      false,
    )!;

    damageMob(state, mob, MOB_TYPES.revenant.hp, 'bell');

    const corpse = corpseOf(state);
    expect(corpse.payout).toBe(MOB_TYPES.revenant.corpsePayout);
    expect(corpse.tier).toBe(MOB_TYPES.revenant.corpseTier);
    expect(corpse.x).toBe(120);
    expect(corpse.y).toBe(40);
    expect(corpse.freshness).toBe(1);
    expect(corpse.kind).toBe('corpse');
    expect(corpse.decays).toBe(true);
    expect(corpse.line).toBeUndefined();
    expect(corpse.halfExtent).toBe(CORPSE_HALF_EXTENT);
  });
});

describe('what a corpse shows and what it hides (tracer plan section 4)', () => {
  it('holds one size across mob types while the payout does not', () => {
    const state = quietRun();
    leaveCorpse(state, killAt(state, 'shambler', 60, 40));
    leaveCorpse(state, killAt(state, 'revenant', 120, 40));
    leaveCorpse(state, killAt(state, 'ghoul', 180, 40));
    const live = state.corpses.filter((corpse) => corpse.alive);
    expect(live).toHaveLength(3);

    const sizes = live.map((corpse) => {
      const box = corpseHitbox(corpse);
      return `${box.width}x${box.height}`;
    });
    expect(new Set(sizes).size).toBe(1);

    expect(live.map((corpse) => corpse.payout)).toEqual([
      MOB_TYPES.shambler.corpsePayout,
      MOB_TYPES.revenant.corpsePayout,
      MOB_TYPES.ghoul.corpsePayout,
    ]);
    expect(live.map((corpse) => corpse.tier)).toEqual([
      'trash',
      'rich',
      'trash',
    ]);
  });

  it('converts to the value swallow.ts takes, and never hands out the entity', () => {
    const state = quietRun();
    leaveCorpse(state, killAt(state, 'revenant', 60, 40));
    const corpse = corpseOf(state);
    corpse.freshness = 0.5;
    const food = asSwallowable(corpse);
    expect(food).toEqual({
      id: corpse.id,
      kind: 'corpse',
      freshness: 0.5,
      payout: MOB_TYPES.revenant.corpsePayout,
    });
    // The id travels because the offer names the body that went in by id, and
    // an id is a value like every other field here. What must not travel is the
    // entity: the record is a copy, so the pool can recycle the slot under it
    // without anything the swallow reads changing.
    expect('alive' in food).toBe(false);
    corpse.freshness = 0.1;
    corpse.id = corpse.id + 100;
    expect(food.freshness).toBe(0.5);
    expect(food.id).not.toBe(corpse.id);
  });
});

describe('a drop on the food pool (plan 6.9)', () => {
  it('is fully fresh, never decays, carries its line, and uses its own extent', () => {
    const state = quietRun();
    spawnDrop(state, 200, 300, 'bell');
    const drop = state.corpses.find((corpse) => corpse.alive)!;
    expect(drop.kind).toBe('drop');
    expect(drop.freshness).toBe(1);
    expect(drop.decays).toBe(false);
    expect(drop.line).toBe('bell');
    expect(drop.halfExtent).toBe(DROP_HALF_EXTENT);
  });

  it("never decays, and the bottom edge measures it by its own extent rather than a corpse's", () => {
    const state = quietRun();
    spawnDrop(state, 200, 300, 'wisps');
    const drop = state.corpses.find((corpse) => corpse.alive)!;

    for (let tick = 0; tick < 2 * FRESHNESS_SECONDS * TICK_HZ; tick++) {
      advanceCorpses(state);
    }
    expect(drop.freshness).toBe(1);
    expect(drop.alive).toBe(true);

    // A drop is one unit larger than a corpse, so at the depth a corpse has
    // already gone the drop's own top edge is still on the field. The two
    // standing at the same y is the whole test: no single extent can send them
    // different ways, so the cull is reading each record's own.
    leaveCorpse(state, killAt(state, 'shambler', 240, 300));
    const corpse = state.corpses.find((each) => each.kind === 'corpse')!;
    drop.y = FIELD_HEIGHT + DROP_HALF_EXTENT;
    corpse.y = FIELD_HEIGHT + DROP_HALF_EXTENT;

    const first = cullCorpses(state);
    expect(drop.alive).toBe(true);
    expect(corpse.alive).toBe(false);
    expect(first).toHaveLength(1);
    expect(first[0]).toEqual({
      type: 'corpseLost',
      kind: 'corpse',
      x: 240,
      y: FIELD_HEIGHT + DROP_HALF_EXTENT,
      freshness: 1,
    });

    drop.y = FIELD_HEIGHT + DROP_HALF_EXTENT + 0.5;
    const second = cullCorpses(state);
    expect(drop.alive).toBe(false);
    expect(second).toEqual([
      {
        type: 'corpseLost',
        kind: 'drop',
        x: 200,
        y: FIELD_HEIGHT + DROP_HALF_EXTENT + 0.5,
        freshness: 1,
      },
    ]);
  });

  it("emits dropSpawned with the line and the place, which is the drops instrument's denominator", () => {
    const state = quietRun();
    const events = spawnDrop(state, 210, 320, 'skullStream');
    const body = state.corpses.find((corpse) => corpse.alive)!;
    expect(events).toContainEqual({
      type: 'dropSpawned',
      id: body.id,
      line: 'skullStream',
      x: 210,
      y: 320,
    });
    // The body a maxed run's carrier opens carries no option at all, and the
    // spawn reports it that way rather than naming a line nobody chose.
    const optionless = spawnDrop(state, 240, 320);
    expect(
      optionless.find((event) => event.type === 'dropSpawned')!.line,
    ).toBeUndefined();
  });
});

describe('what takes food off the field (ADR 0056)', () => {
  it('leaves the eviction path nowhere in the module, so no spawn can take a body under', () => {
    // The cap is sized from the stage now (ADR 0056), so the oldest-first
    // eviction it replaces is gone rather than unreachable: an unreachable
    // branch is worse than an absent one, and reaching it would have hidden
    // exactly the fault the refusal exists to raise.
    expect(corpsesSource).not.toMatch(/oldestEvictable/);
    expect(corpsesSource).not.toMatch(/corpseEvicted/);
  });

  it('takes a live body off the field only through a swallow, an expiry or a cull', () => {
    // The three are the whole list, and this reads it off the run rather than
    // off the source: on every tick, every body that stopped being alive is
    // counted against what that tick said about it. A body gone with nothing
    // said is housekeeping taking food from the player, which is the thing
    // ADR 0056 forbids and the eviction path used to do.
    //
    // The pool starts full, so the cap binds for the first stretch of the run
    // and an eviction would have somewhere to bite. That makes the corpse cap's
    // own fault expected here rather than a surprise, so the run is driven
    // through its own authority instead of the throwing rig.
    //
    // It is stood in the Crowd rather than at the Procession's own end, and the
    // traffic is the point: the cap can only bind while something is still
    // trying to put a corpse down. A run standing at the Procession's end used
    // to roll straight into the Crowd's rows and get its traffic by accident;
    // the Banshee's phase stands between the two now and holds a run that
    // cannot kill her (ADR 0007), so the section this test has always been
    // played on is named outright.
    const state = quietRun(4);
    state.stage.phaseIndex = PHASES.findIndex((each) => each.name === 'crowd');
    state.stage.firedRows = 0;
    const execution = createExecution(state);
    // Half up the grave's own column, so the scroll walks them into the mouth,
    // and half low and off to the side, where they reach the bottom edge with
    // value left. Between them and the ones that run out of freshness on the
    // way, the run takes all three ways out and the assertion below has
    // something to be about.
    for (let made = 0; state.corpses.some((corpse) => !corpse.alive); made++) {
      const inColumn = made % 2 === 0;
      const x = inColumn ? state.grave.x : 60;
      const y = inColumn ? 10 + (made % 200) : 400 + (made % 200);
      leaveCorpse(state, killAt(state, 'shambler', x, y));
    }

    const liveIds = (): Set<number> =>
      new Set(
        state.corpses
          .filter((corpse) => corpse.alive)
          .map((corpse) => corpse.id),
      );
    const unexplained: string[] = [];
    const explained = { swallowed: 0, expired: 0, lost: 0 };
    for (let tick = 0; tick < 900; tick++) {
      const before = liveIds();
      const events = executeTick(execution, STILL);
      let said = 0;
      for (const event of events) {
        if (event.type === 'chimed') said += 1;
        if (event.type === 'offerTaken') said += event.passed.length;
        if (event.type === 'corpseExpired') said += 1;
        if (event.type === 'corpseLost') said += 1;
        if (event.type === 'chimed') explained.swallowed += 1;
        if (event.type === 'corpseExpired') explained.expired += 1;
        if (event.type === 'corpseLost') explained.lost += 1;
      }
      const after = liveIds();
      const gone = [...before].filter((id) => !after.has(id)).length;
      if (gone !== said) {
        unexplained.push(`tick ${tick}: ${gone} gone against ${said} said`);
      }
    }

    expect(unexplained).toEqual([]);
    // The run really did move food off the field all three ways, so the
    // assertion above passed over a set with something in it.
    expect(explained.swallowed).toBeGreaterThan(0);
    expect(explained.expired).toBeGreaterThan(0);
    expect(explained.lost).toBeGreaterThan(0);
    // And the cap really did bind, which is what an eviction would have had to
    // answer. Nothing else broke while it did.
    expect(execution.faults.map((fault) => fault.identity)).toEqual([
      'corpse cap never binds',
    ]);
  });
});

describe('what a lost corpse reports (plan 6.9)', () => {
  it("carries the food's kind, so a scrolled-away drop is not counted as a missed corpse", () => {
    const state = quietRun();
    const step = stepping(state);
    // Opened as a real offer rather than as a bare body, because an option
    // body standing for no live offer is a fault the harness records.
    openOffer(state, 200, FIELD_HEIGHT - 2);
    const events: SimEvent[] = [];
    const drop = state.corpses.find((corpse) => corpse.alive)!;
    while (drop.alive && state.tick < 200) {
      events.push(...step(STILL));
    }
    const lost = events.find((event) => event.type === 'corpseLost');
    expect(lost).toBeDefined();
    expect(lost?.type === 'corpseLost' && lost.kind).toBe('drop');
  });
});
