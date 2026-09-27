/**
 * The four mob types, how they move and how they die (ADR 0016). Every sim
 * test here steps through the one execution authority (ADR 0017), and
 * stepping() fails the test on any fault the run records.
 *
 * Magnitudes are the tuning dispatch's, so what is pinned here is the
 * derivations: a descent stated as a multiple of the scroll, a beat counted in
 * ARRIVE_TICKS, and the ghoul's threat stated as a pair of relations rather
 * than as a speed.
 */

import { describe, expect, it } from 'vitest';

import type { Stepper } from '../../dev/stepping';
import { stepping } from '../../dev/stepping';
import { TICK_HZ } from '../clock';
import { fireBelch } from '../belch';
import type { TickCommand } from '../command';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { graveHitbox } from '../grave';
import { advanceBell } from '../lines/bell';
import { BIRTHRIGHT_LEVEL, MAX_LEVEL, WEAPON_LINES } from '../lines/roster';
import {
  advanceStream,
  skullDamage,
  STREAM_INTERVAL,
  SURGE_INTERVAL,
  SURGE_VOLLEYS,
  surgeStream,
} from '../lines/skullStream';
import { advanceWisps, launchWisps } from '../lines/wisps';
import { NEVER_FIRES } from '../mobFire';
import type { Corpse } from '../corpses';
import { CORPSE_HALF_EXTENT } from '../corpses';
import type { Mob, MobType } from '../mobs';
import {
  advanceMobs,
  ARRIVE_TICKS,
  cullMobs,
  damageMob,
  hasEntered,
  MOB_TYPE_NAMES,
  MOB_TYPES,
  SPAWN_MARGIN,
  spawnMob,
} from '../mobs';
import { blankImpulse, SHOVE_TICKS, startShove } from '../shove';
import type { RunState } from '../run';
import { createRun } from '../run';
import { SECTIONS } from '../stage/stage';
import type { SpawnOrder } from '../stage/formations';
import { place } from '../stage/formations';
import { resolveStorm } from '../storm';
import {
  RESERVOIR_CAPACITY,
  SCROLL_SPEED,
  SIZE_CEILING,
  SIZE_FLOOR,
  TRASH_CORPSE_PAYOUT,
} from '../tuning';
import type { TuningRecord } from '../tuningRecord';
import { DEFAULT_TUNING, resolveTuning } from '../tuningRecord';
import { hitGrave } from '../grave';
import { swallow } from '../swallow';

/** A tick that only steers, which is every tick these tests are about. */
function drift(x: number, y: number): TickCommand {
  return { move: { x, y }, belch: false };
}

const STILL: TickCommand = drift(0, 0);
const RIGHT: TickCommand = drift(1, 0);

/**
 * A run whose stage will not spawn anything on top of the mob under test.
 *
 * It stands in the last section of the table, which is the one section the machine
 * never leaves. Marking a section's waves fired silences that section alone: a section
 * ends now on its waves being spent and its field clearing (ADR 0051), so the
 * tick a test's field empties would roll the run into the next section and its
 * waves.
 */
function quietRun(seed = 4, tuning?: TuningRecord): RunState {
  const run = createRun(seed, tuning === undefined ? {} : { tuning });
  run.stage.sectionIndex = SECTIONS.length - 1;
  // The stream and Territory's clock are held as well as the waves. These tests
  // are about how a mob moves, fires and dies, and both birthright lines act
  // unprompted: the stream pours up the middle of the field, and Territory
  // claims ground on the mob under test and grinds it down before it reaches
  // the behaviour being measured.
  run.lines.streamIn = Number.MAX_SAFE_INTEGER;
  run.lines.layIn = Number.MAX_SAFE_INTEGER;
  return run;
}

/** A run with a quiet stage and Territory owned, so a patch can be laid into it. */
function stormRun(seed = 4): RunState {
  const state = quietRun(seed);
  state.levels.territory = 1;
  return state;
}

/** A live mob of a stated type, past its arriving beat. */
function putMob(state: RunState, type: Mob['type'], x: number, y: number): Mob {
  const mob = spawnMob(
    state,
    type,
    { x, y, vx: 0, vy: 1, index: 0 },
    false,
    'wave',
  )!;
  mob.beat = 0;
  return mob;
}

/** A mob standing in an open patch of claimed ground. */
function patchVictim(state: RunState, x = 200, y = 400): Mob {
  const patch = state.patches.find((each) => !each.alive)!;
  patch.alive = true;
  patch.id = state.nextEntityId;
  state.nextEntityId += 1;
  patch.x = x;
  patch.y = y;
  patch.radius = 30;
  patch.opening = 0;
  patch.pulses = 0;
  patch.struck.clear();
  return putMob(state, 'shambler', x, y);
}

function putSkull(state: RunState, x: number, y: number) {
  const skull = state.skulls.find((each) => !each.alive)!;
  skull.alive = true;
  skull.id = state.nextEntityId;
  state.nextEntityId += 1;
  skull.x = x;
  skull.y = y;
  skull.vx = 0;
  skull.vy = 0;
  return skull;
}

function putWisp(state: RunState, x: number, y: number) {
  const wisp = state.wisps.find((each) => !each.alive)!;
  wisp.alive = true;
  wisp.id = state.nextEntityId;
  state.nextEntityId += 1;
  wisp.x = x;
  wisp.y = y;
  wisp.vx = 0;
  wisp.vy = 0;
  wisp.life = 60;
  wisp.targetId = null;
  return wisp;
}

function order(x: number, y: number, vx = 0, vy = 1, index = 0): SpawnOrder {
  return { x, y, vx, vy, index };
}

/** The order at this position in a formation's own placement, which every caller here asks for at an index the formation's count covers. */
function orderAt(orders: readonly SpawnOrder[], index: number): SpawnOrder {
  const found = orders[index];
  if (found === undefined) throw new Error(`no order at ${index}`);
  return found;
}

/** The one mob a test put on the field. */
function only(run: RunState): Mob {
  const live = run.mobs.filter((mob) => mob.alive);
  expect(live).toHaveLength(1);
  const mob = live[0];
  if (mob === undefined) throw new Error('no live mob');
  return mob;
}

function run(
  step: Stepper,
  ticks: number,
  command: TickCommand = STILL,
): SimEvent[] {
  const events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    events.push(...step(command));
  }
  return events;
}

function types(events: SimEvent[], type: SimEvent['type']): SimEvent[] {
  return events.filter((event) => event.type === type);
}

/** Every shove one list reports, as the pair a travel assertion needs. */
function shoves(
  events: readonly SimEvent[],
): { id: number; displacement: number }[] {
  return events.flatMap((event) =>
    event.type === 'mobShoved'
      ? [{ id: event.id, displacement: event.displacement }]
      : [],
  );
}

/** The one corpse a kill left on the field. */
function liveCorpse(state: RunState): Corpse {
  const corpses = state.corpses.filter((corpse) => corpse.alive);
  if (corpses.length !== 1) {
    throw new Error(`expected one live corpse, found ${corpses.length}`);
  }
  return corpses[0]!;
}

describe('the mob type table (ADR 0016)', () => {
  it('gives each type the descent, health, corpse payout and size the table states', () => {
    expect(MOB_TYPES.shambler.speed).toBeCloseTo(0.5 * SCROLL_SPEED, 12);
    expect(MOB_TYPES.revenant.speed).toBeCloseTo(0.35 * SCROLL_SPEED, 12);

    expect(MOB_TYPES.shambler.hp).toBe(8);
    expect(MOB_TYPES.revenant.hp).toBe(64);
    expect(MOB_TYPES.ghoul.hp).toBe(20);

    expect(MOB_TYPES.shambler.corpsePayout).toBe(TRASH_CORPSE_PAYOUT);
    expect(MOB_TYPES.revenant.corpsePayout).toBe(2 * TRASH_CORPSE_PAYOUT);
    expect(MOB_TYPES.ghoul.corpsePayout).toBe(TRASH_CORPSE_PAYOUT);

    expect(MOB_TYPES.shambler.corpseTier).toBe('trash');
    expect(MOB_TYPES.revenant.corpseTier).toBe('rich');
    expect(MOB_TYPES.ghoul.corpseTier).toBe('trash');

    expect([
      MOB_TYPES.shambler.halfWidth,
      MOB_TYPES.shambler.halfHeight,
    ]).toEqual([11, 11]);
    expect([
      MOB_TYPES.revenant.halfWidth,
      MOB_TYPES.revenant.halfHeight,
    ]).toEqual([13, 13]);
    expect([MOB_TYPES.ghoul.halfWidth, MOB_TYPES.ghoul.halfHeight]).toEqual([
      9, 9,
    ]);
  });

  it('gives the cairn the curtain it has to build: wide, durable and silent', () => {
    // The three figures the Wall stands on (#123, design record R5). The width
    // is what the curtain's count is derived from and it is the only body
    // wider than it is tall; the health is what the ceiling build's storm
    // cannot take down over a whole descent, re-measured from 296 because the
    // first derivation read the rung-one storm alone and a maxed one opened the
    // curtain unpressed; and the silence is why the cost of crossing is the
    // bodies themselves.
    expect(MOB_TYPES.cairn.halfWidth).toBe(15);
    expect(MOB_TYPES.cairn.halfWidth).toBeGreaterThan(
      MOB_TYPES.cairn.halfHeight,
    );
    expect(MOB_TYPES.cairn.hp).toBe(2206);
    expect(MOB_TYPES.cairn.fire).toBe(NEVER_FIRES);
    expect(MOB_TYPES.cairn.motion).toBe('falls');
    // A payout a grind would be paid for is what would retire the belch as the
    // curtain's key, so the durable body pays exactly what the cheap one pays.
    expect(MOB_TYPES.cairn.corpsePayout).toBe(TRASH_CORPSE_PAYOUT);
    expect(MOB_TYPES.cairn.corpseTier).toBe('trash');
  });

  it('holds the cairn as a pool member, so any wave may name it', () => {
    // ADR 0016's pool rule and ADR 0042's cast rule together: a set piece names
    // a type the way every wave names one, and nothing about the type belongs
    // to the set piece. A Drip of one, which is the formation furthest from the
    // curtain, stands a cairn with exactly its own row.
    const state = createRun(1);
    const placed = place('drip', 1, state.streams.spawns);
    const order = placed[0];
    if (order === undefined) throw new Error('no placement');
    const mob = spawnMob(state, 'cairn', order, false, 'wave');
    if (mob === null) throw new Error('the pool refused a cairn');

    expect(mob.type).toBe('cairn');
    expect(mob.hp).toBe(MOB_TYPES.cairn.hp);
    expect(mob.armed).toBe(false);
    expect(MOB_TYPE_NAMES).toContain('cairn');
  });

  it("makes the ghoul's speed a real fraction of the grave's, because the type table bounds it by turn rate and not by a cap", () => {
    // The magnitude is the tuning dispatch's and is deliberately not pinned.
    // What is pinned is that it is fast enough to be a threat at all: a chaser
    // slower than the scroll it rides can never intercept anything.
    expect(MOB_TYPES.ghoul.speed).toBeGreaterThan(SCROLL_SPEED);
    expect(MOB_TYPES.ghoul.motion).toBe('chases');
  });
});

describe('the mow (ADR 0059)', () => {
  /**
   * How many skulls a body of this type takes at the rung a run is born on,
   * landed one at a time. The rung is named because damage climbs with it
   * (docs/research/weapon-growth-per-level-precedent.md section 4), so a count
   * is a reading of a curve rather than a constant.
   */
  const skullsToKill = (type: Mob['type']): number => {
    const state = quietRun();
    const mob = putMob(state, type, 200, 200);
    let skulls = 0;
    while (mob.alive && skulls < 20) {
      damageMob(state, mob, skullDamage(BIRTHRIGHT_LEVEL), 'skullStream');
      skulls += 1;
    }
    return skulls;
  };

  it('kills a shambler with one skull at the rung a run is born on', () => {
    // ADR 0059: density is bought with weak bodies, never tough ones, so the
    // mow body dies to the first thing the storm lands on it. Counted through
    // damageMob rather than divided, because what is promised is the kill.
    expect(skullsToKill('shambler')).toBe(1);
  });

  it('kills a ghoul with three skulls and a revenant with eight, at that same rung', () => {
    // The two rows the mow does not move. ADR 0059 is a change to trash and
    // never to the roster: the ghoul stays the body threat that dies fast but
    // not free, and the revenant stays few and tough at eight times the mow
    // body.
    expect(skullsToKill('ghoul')).toBe(3);
    expect(skullsToKill('revenant')).toBe(8);
  });

  it('never arms a shambler, wherever it stands in its group', () => {
    // ADR 0059's cost, taken eyes-open: the mow body carries no fire at all.
    // Walked across a whole group's worth of placements because the armed
    // share used to be a position rule, so index two is where a survivor of
    // the old rule would show.
    const state = quietRun();
    for (let index = 0; index < 9; index++) {
      const spawned = spawnMob(
        state,
        'shambler',
        order(40 + index * 30, 60, 0, 1, index),
        false,
        'wave',
      );
      if (spawned === null) throw new Error('the pool refused a shambler');
      expect(spawned.armed).toBe(false);
    }
    const step = stepping(state);
    expect(types(run(step, 600), 'mobFired')).toHaveLength(0);
  });

  it('arms the revenant, which is the one trash type that fires', () => {
    // The other half of ADR 0059, held as its own promise so the roster split
    // survives a later type being added: fire lives on the revenant, and the
    // player picks it out of the mow.
    const armed = MOB_TYPE_NAMES.filter(
      (type) => MOB_TYPES[type].fire.armedShare !== 'none',
    );
    expect(armed).toEqual(['revenant']);

    const state = quietRun();
    const mob = putMob(state, 'revenant', 200, 120);
    expect(mob.armed).toBe(true);
    const step = stepping(state);
    expect(
      types(run(step, MOB_TYPES.revenant.fire.interval + 1), 'mobFired').length,
    ).toBeGreaterThan(0);
  });
});

describe('the arriving beat (ADR 0041)', () => {
  it("holds the formation's arriving velocity for ARRIVE_TICKS and then moves under the type's own rule", () => {
    const state = quietRun();
    const step = stepping(state);
    // A V's arm arrives on a diagonal, which is the case where the beat bites.
    const arm = orderAt(place('v', 2, state.streams.spawns), 0);
    spawnMob(state, 'shambler', order(200, 11, arm.vx, arm.vy), false, 'wave');
    const mob = only(state);
    const arriving = { vx: mob.vx, vy: mob.vy };
    expect(arriving.vx).not.toBe(0);

    run(step, ARRIVE_TICKS);
    expect(mob.vx).toBeCloseTo(arriving.vx, 12);
    expect(mob.vy).toBeCloseTo(arriving.vy, 12);

    run(step, 1);
    expect(mob.vx).toBe(0);
    expect(mob.vy).toBeCloseTo(MOB_TYPES.shambler.speed, 12);
  });

  it("gives a mob the formation's direction times its own type speed, so a straight-down entry changes speed by nothing when the beat ends", () => {
    for (const type of ['shambler', 'revenant'] as const) {
      const state = quietRun();
      const step = stepping(state);
      spawnMob(
        state,
        type,
        order(200, MOB_TYPES[type].halfHeight),
        false,
        'wave',
      );
      const mob = only(state);
      expect(mob.vx).toBe(0);
      expect(mob.vy).toBeCloseTo(MOB_TYPES[type].speed, 12);

      run(step, ARRIVE_TICKS + 1);
      expect(mob.vx).toBe(0);
      expect(mob.vy).toBeCloseTo(MOB_TYPES[type].speed, 12);
    }
  });

  it('counts the beat from the top-edge crossing and never from the spawn', () => {
    const state = quietRun();
    const step = stepping(state);
    const deep = -120;
    const arm = orderAt(place('v', 2, state.streams.spawns), 0);
    spawnMob(
      state,
      'shambler',
      order(200, deep, arm.vx, arm.vy),
      false,
      'wave',
    );
    const mob = only(state);
    const arriving = { vx: mob.vx, vy: mob.vy };

    // Counted from spawn the beat would have expired long before this.
    while (!hasEntered(mob)) run(step, 1);
    expect(state.tick).toBeGreaterThan(ARRIVE_TICKS);

    run(step, ARRIVE_TICKS - 1);
    expect(mob.vx).toBeCloseTo(arriving.vx, 12);
    run(step, 2);
    expect(mob.vx).toBe(0);
  });

  it("leaves a ghoul flying the formation's arriving direction at the tick its beat ends, not straight down", () => {
    const state = quietRun();
    const step = stepping(state);
    const arm = orderAt(place('pincer', 2, state.streams.spawns), 0);
    spawnMob(state, 'ghoul', order(200, 9, arm.vx, arm.vy), false, 'wave');
    const mob = only(state);
    expect(mob.vx).not.toBe(0);
    // Straight below, so the turn has nothing to correct and only the stored
    // direction can explain where the ghoul is pointing.
    state.grave.x = 200;

    run(step, ARRIVE_TICKS);
    expect(Math.sign(mob.vx)).toBe(Math.sign(arm.vx));
    expect(Math.abs(mob.vx)).toBeGreaterThan(0);
  });
});

describe('the ghoul (ADR 0016)', () => {
  it('always descends at least 1.35 times the scroll, so it can never climb or hold station', () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, 'ghoul', order(120, 60), false, 'wave');
    const mob = only(state);
    // Level with the ghoul and far to the side, which is the heading that would
    // let it hold station if the floor were not there.
    state.grave.x = 480;
    state.grave.y = 60;

    for (let tick = 0; tick < 1000 && mob.alive; tick++) {
      const before = mob.y;
      step(STILL);
      state.grave.y = Math.min(mob.y, FIELD_HEIGHT - state.grave.size);
      if (!mob.alive) break;
      expect(mob.y - before).toBeGreaterThanOrEqual(1.35 * SCROLL_SPEED - 1e-9);
    }
    expect(mob.alive).toBe(false);
  });

  it('is beaten by a grave that commits early, and beats one that commits inside the last few ticks', () => {
    // The pair, and neither half asserts a magnitude. One alone only proves the
    // ghoul is not cheap; the pair is the only thing that would catch the
    // tuning dispatch turning it into scenery.
    const startY = 400;
    const descent = MOB_TYPES.ghoul.speed + SCROLL_SPEED;
    const graveTop = graveHitbox(quietRun().grave).y;
    const contact = Math.ceil(
      (graveTop - MOB_TYPES.ghoul.halfHeight - startY) / descent,
    );

    const early = ghoulRun(0, contact);
    expect(types(early, 'graveHit')).toHaveLength(0);

    const late = ghoulRun(contact - 3, contact);
    expect(types(late, 'graveHit').length).toBeGreaterThan(0);
  });
});

/**
 * A ghoul dropped straight at a grave that holds still until `commitAt` and
 * then cuts hard to one side, run until the ghoul is gone. The commit tick is
 * the input; whether the grave is hit is the assertion.
 */
function ghoulRun(commitAt: number, contact: number): SimEvent[] {
  const state = quietRun();
  const step = stepping(state);
  spawnMob(state, 'ghoul', order(state.grave.x, 400), false, 'wave');
  const events: SimEvent[] = [];
  for (let tick = 0; tick < contact + 400; tick++) {
    events.push(...step(tick < commitAt ? STILL : RIGHT));
  }
  return events;
}

describe("a mob's death (ADR 0037)", () => {
  it('kills at or below zero health, frees the slot, leaves a corpse and reports the kill', () => {
    const state = quietRun();
    spawnMob(state, 'shambler', order(200, 100), false, 'wave');
    const mob = only(state);

    expect(damageMob(state, mob, MOB_TYPES.shambler.hp - 1, 'bell')).toEqual([
      {
        type: 'mobDamaged',
        id: mob.id,
        amount: MOB_TYPES.shambler.hp - 1,
        source: 'bell',
      },
    ]);
    expect(mob.alive).toBe(true);

    const events = damageMob(state, mob, 1, 'bell');
    expect(mob.alive).toBe(false);
    expect(events).toEqual([
      { type: 'mobDamaged', id: mob.id, amount: 1, source: 'bell' },
      {
        type: 'mobKilled',
        id: mob.id,
        mob: 'shambler',
        x: 200,
        y: 100,
        carried: false,
      },
      // The kill's own payment, announced with the input's name on it so a
      // reading can decompose the score into its parts (design record R4).
      {
        type: 'scorePaid',
        input: 'kill',
        amount: paidFor('shambler'),
        score: paidFor('shambler'),
      },
    ]);
    const corpses = state.corpses.filter((corpse) => corpse.alive);
    expect(corpses).toHaveLength(1);
    const corpse = corpses[0];
    if (corpse === undefined) throw new Error('no corpse');
    expect(corpse.payout).toBe(MOB_TYPES.shambler.corpsePayout);
  });

  it('spells each storm source as its line: skullStream, then territory, then wisps', () => {
    // The source vocabulary is the roster's own spelling (#48): an instrument
    // grouping damage by weapon line must never meet a fifth spelling.
    const state = stormRun();
    const skulled = putMob(state, 'shambler', 100, 100);
    patchVictim(state);
    const wisped = putMob(state, 'shambler', 300, 100);
    putSkull(state, skulled.x, skulled.y);
    putWisp(state, wisped.x, wisped.y);

    const sources = resolveStorm(state)
      .filter((event) => event.type === 'mobDamaged')
      .map((event) => (event.type === 'mobDamaged' ? event.source : ''));
    expect(sources).toEqual(['skullStream', 'territory', 'wisps']);
  });

  it("names the bell's own damage bell", () => {
    const state = quietRun();
    putMob(state, 'shambler', state.grave.x, state.grave.y);
    state.levels.bell = 1;
    state.lines.tollIn = 1;
    expect(types(advanceBell(state), 'tolled')).toHaveLength(1);

    const struck = types(advanceBell(state), 'mobDamaged');
    expect(struck).toEqual([
      expect.objectContaining({ type: 'mobDamaged', source: 'bell' }),
    ]);
  });

  it('is never named by a belch, because a belch damages nothing', () => {
    // ADR 0008 as amended and Mark's ruling 3 of 2026-09-15: the belch stopped
    // killing and became a push. The belch is still a DamageSource the type
    // declares, so this is the guard on a deliberate absence: it fails the day
    // a press starts taking health off a body again.
    const state = quietRun();
    putMob(state, 'shambler', state.grave.x, state.grave.y - 40);
    state.reservoir = RESERVOIR_CAPACITY;

    const events = fireBelch(state);
    expect(types(events, 'mobDamaged')).toEqual([]);
    expect(types(events, 'mobKilled')).toEqual([]);
  });

  it('never kills a mob on contact and never leaves a corpse for one, however long the grave sits under it', () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, 'shambler', order(state.grave.x, 300), false, 'wave');
    const mob = only(state);
    const events = run(step, 600);
    expect(types(events, 'graveHit').length).toBeGreaterThan(0);
    expect(types(events, 'mobKilled')).toHaveLength(0);
    expect(state.corpses.some((corpse) => corpse.alive)).toBe(false);
    // Gone off the bottom edge rather than killed.
    expect(mob.alive).toBe(false);
  });

  it('culls a mob past the bottom edge, and it costs the player nothing', () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, 'shambler', order(60, 700), false, 'wave');
    const mob = only(state);
    const events = run(step, 200);
    expect(mob.alive).toBe(false);
    expect(events).toEqual([]);
    expect(state.corpses.some((corpse) => corpse.alive)).toBe(false);
  });
});

/** One body of a type, put on the field and killed outright. */
function kill(
  state: RunState,
  type: 'shambler' | 'revenant' | 'ghoul',
  x: number,
): void {
  spawnMob(state, type, order(x, 100), false, 'wave');
  const body = only(state);
  damageMob(state, body, body.hp, 'skullStream');
}

/**
 * What killing this body pays under the record the build compiles, in points.
 *
 * The row is a bare multiple of the kill unit and the unit is a row of the
 * tuning record (ADR 0064), so the product is the thing a payment is asserted
 * against and it is spelled here once rather than at every site.
 */
const paidFor = (type: MobType): number =>
  MOB_TYPES[type].scorePayoutInKills * DEFAULT_TUNING.score.trashKillScore;

describe('what a kill pays into the score (design record R4, #99)', () => {
  it('every mob row carries a score payout, so a body without one is not a state the type permits', () => {
    // The same property corpsePayout has: it is a field on the row rather than
    // a table beside it, so a body with no score payout is a state the type
    // refuses. Stated as a whole multiple of the mow body's own unit, because
    // that relation is what the table is written to show.
    for (const type of MOB_TYPE_NAMES) {
      const multiple = MOB_TYPES[type].scorePayoutInKills;
      expect(`${type} pays ${multiple}`).toBe(
        `${type} pays ${Math.round(multiple)}`,
      );
      expect(multiple).toBeGreaterThanOrEqual(1);
    }
  });

  it('a kill pays the unit the run started under, times the row it killed (ADR 0064)', () => {
    // The direction the row predicts: the table says how many mow bodies this
    // one is worth and the record says what a mow body pays, so a run under a
    // record with a larger unit pays more per body and every multiple moves
    // with it. Two types, so a single figure used twice could not produce it.
    const doubled = resolveTuning({
      score: { trashKillScore: DEFAULT_TUNING.score.trashKillScore * 2 },
    });
    const underDefault = quietRun();
    const underDoubled = quietRun(4, doubled);

    kill(underDefault, 'shambler', 100);
    kill(underDefault, 'revenant', 300);
    kill(underDoubled, 'shambler', 100);
    kill(underDoubled, 'revenant', 300);

    expect(underDefault.score).toBe(paidFor('shambler') + paidFor('revenant'));
    expect(underDoubled.score).toBe(2 * underDefault.score);
    expect(MOB_TYPES.revenant.scorePayoutInKills).not.toBe(
      MOB_TYPES.shambler.scorePayoutInKills,
    );
  });

  it('pays the row of the body that died, so two types pay two different amounts', () => {
    const state = quietRun();
    spawnMob(state, 'shambler', order(100, 100), false, 'wave');
    const shambler = only(state);
    damageMob(state, shambler, shambler.hp, 'skullStream');
    expect(state.score).toBe(paidFor('shambler'));

    spawnMob(state, 'revenant', order(300, 100), false, 'wave');
    const revenant = only(state);
    damageMob(state, revenant, revenant.hp, 'skullStream');
    expect(state.score).toBe(paidFor('shambler') + paidFor('revenant'));
    // The rows differ, so the sum above could not have come from one figure
    // used twice.
    expect(paidFor('revenant')).not.toBe(paidFor('shambler'));
  });

  it("a run's score is what it killed plus what it overflowed, which at this tip are the only two inputs built (ADR 0002 as amended, ADR 0003)", () => {
    // Mark's ruling of 2026-09-16: score is one number fed by several inputs and
    // a kill is the first of them to be built. The overflow keeps its own place
    // beside it rather than being traded for it, which is the half this asserts
    // cannot drift out.
    const state = quietRun();
    spawnMob(state, 'ghoul', order(100, 100), false, 'wave');
    const ghoul = only(state);
    damageMob(state, ghoul, ghoul.hp, 'skullStream');
    const killed = paidFor('ghoul');
    expect(state.score).toBe(killed);

    state.grave.size = SIZE_CEILING;
    swallow(state, {
      id: 9001,
      x: 0,
      y: 0,
      halfExtent: CORPSE_HALF_EXTENT,
      vx: 0,
      vy: 0,
      kind: 'corpse',
      freshness: 1,
      payout: TRASH_CORPSE_PAYOUT,
      tier: 'trash',
      treasureBody: false,
    });

    expect(state.score).toBeCloseTo(killed + TRASH_CORPSE_PAYOUT, 10);
  });

  it('keeps paying score while the rung is bled, and the floor hit after them strips a level rather than bleeding again (design record R4)', () => {
    // The half of R4 that keeps the player from being punished twice: what the
    // bled rung withholds is the cushion, never the number.
    const state = quietRun();
    for (const line of WEAPON_LINES) state.levels[line] = MAX_LEVEL;
    state.grave.size = SIZE_FLOOR;

    // A kill first, so the first floor hit has something to bleed. This is the
    // whole of what R4 is about: under overflow alone this run's score was zero.
    kill(state, 'shambler', 100);
    expect(state.score).toBe(paidFor('shambler'));

    const bled = hitGrave(state, 'contact');
    expect(bled.map((event) => event.type)).toContain('scoreBled');
    expect(state.score).toBe(0);

    // The storm keeps killing while the rung is bled, and the score keeps
    // rising, which is the half that keeps the player from being punished twice.
    kill(state, 'shambler', 300);
    expect(state.score).toBe(paidFor('shambler'));

    state.grave.invulnerable = 0;
    const second = hitGrave(state, 'contact');

    expect(second.map((event) => event.type)).toContain('weaponStripped');
    expect(second.map((event) => event.type)).not.toContain('scoreBled');
    expect(state.score).toBe(paidFor('shambler'));
  });
});

describe('a carrier is told apart from the mob it rides in (ADR 0002)', () => {
  it("reports carried on a killed carrier's death and never on an ordinary mob's", () => {
    // The kill event is what the offer opens from, so the flag travels as a
    // value on the event rather than as a look-up back at the mob: the slot
    // the carrier stood in is free the moment it dies.
    const state = quietRun();
    const carrier = spawnMob(state, 'shambler', order(200, 100), true, 'wave')!;
    const trash = spawnMob(state, 'shambler', order(260, 100), false, 'wave')!;

    const carrierDeath = damageMob(state, carrier, carrier.hp, 'bell');
    const trashDeath = damageMob(state, trash, trash.hp, 'bell');

    expect(carrierDeath).toContainEqual({
      type: 'mobKilled',
      id: carrier.id,
      mob: 'shambler',
      x: 200,
      y: 100,
      carried: true,
    });
    expect(trashDeath).toContainEqual({
      type: 'mobKilled',
      id: trash.id,
      mob: 'shambler',
      x: 260,
      y: 100,
      carried: false,
    });
  });
});

describe('damage attribution (#48)', () => {
  it("reports every hit as mobDamaged carrying the mob's id, the amount and the source", () => {
    // The instrument joins damage to its dealer by these three fields; a hit
    // that leaves no mobDamaged is damage nobody dealt.
    const state = quietRun();
    spawnMob(state, 'shambler', order(200, 100), false, 'wave');
    const mob = only(state);

    const events = damageMob(state, mob, 1, 'bell');
    expect(events).toEqual([
      { type: 'mobDamaged', id: mob.id, amount: 1, source: 'bell' },
    ]);
    expect(mob.alive).toBe(true);
  });

  it('reports a fatal blow as mobDamaged then mobKilled, joined by the same id', () => {
    // The kill's dealer is not on mobKilled; the join to the fatal mobDamaged
    // by id is what names it, so the pair must share the id and the order.
    const state = quietRun();
    spawnMob(state, 'ghoul', order(200, 100), false, 'wave');
    const mob = only(state);
    const id = mob.id;

    const events = damageMob(state, mob, MOB_TYPES.ghoul.hp, 'bell');
    expect(events[0]).toEqual({
      type: 'mobDamaged',
      id,
      amount: MOB_TYPES.ghoul.hp,
      source: 'bell',
    });
    expect(events[1]).toEqual({
      type: 'mobKilled',
      id,
      mob: 'ghoul',
      x: 200,
      y: 100,
      carried: false,
    });
  });
});

describe("one swallow's whole burst payload never clears a wave (plan section 3)", () => {
  /**
   * The worst case at the ceiling, over the two waves the authored stage really
   * contains. The payload is the wisp volley and the surged volley together,
   * which is what the bound is derived against: asserting the wisps alone would
   * pass the defect all three gates found.
   */
  for (const wave of [
    { type: 'ghoul' as const, count: 7 },
    { type: 'shambler' as const, count: 22 },
  ]) {
    it(`leaves survivors from ${wave.count} ${wave.type}s at every line's ceiling`, () => {
      const state = stormRun();
      for (const line of WEAPON_LINES) state.levels[line] = MAX_LEVEL;
      // Every other test in this file holds the stream off, and this one is
      // measuring it, so its clock is armed to fire on the window's first tick.
      // The surged volleys follow at SURGE_INTERVAL apart, and the window is
      // sized to hold all of them plus one fixed interval of settle after.
      state.lines.streamIn = 1;
      const row = MOB_TYPES[wave.type];
      const mobs: Mob[] = [];
      for (let index = 0; index < wave.count; index++) {
        mobs.push(
          putMob(
            state,
            wave.type,
            row.halfWidth + index * row.halfWidth * 2,
            state.grave.y - 60,
          ),
        );
      }

      // One swallow's whole payload: the wisp volley it launches and the extra
      // stream volley its surge buys, resolved against the wave.
      launchWisps(state, [], 1);
      surgeStream(state, 1);
      for (
        let tick = 0;
        tick < SURGE_VOLLEYS * SURGE_INTERVAL + STREAM_INTERVAL;
        tick++
      ) {
        advanceStream(state);
        advanceWisps(state);
        resolveStorm(state);
      }
      // The stream is half of what the bound is derived against, so a window
      // it never fired in would measure the wisps alone.
      expect(state.skulls.filter((skull) => skull.alive)).not.toHaveLength(0);
      // The stream is a narrow fan straight up out of the mouth, so at this
      // wave's standoff its columns cross the wave's line within about seven
      // units of the grave's centre. A wave laid across the field's whole
      // width is mostly outside the stream's reach whatever its level, and the
      // coverage is far narrower than "every line at its ceiling" suggests.
      expect(mobs.filter((mob) => mob.alive).length).toBeGreaterThan(0);
    });
  }
});

describe("one swallow's surge clears ten trash bodies (ADR 0059)", () => {
  /**
   * How many bodies the burst window clears, with and without the swallow that
   * surges it. The magnitude only shows as a difference: what a surge buys is
   * volleys the window would not otherwise have held, and one run alone cannot
   * show the volleys that did not fire.
   */
  const bodiesClearedInBurst = (swallowed: boolean): number => {
    const state = quietRun();
    state.levels.skullStream = MAX_LEVEL;
    // Stacked on the mouth, where every column of the fan launches. Under the
    // mow a skull is a whole trash body (ADR 0059), so a volley's five skulls
    // are five bodies rather than one, and twenty is more than the burst can
    // reach.
    const mouth = { x: state.grave.x, y: state.grave.y - state.grave.size };
    for (let index = 0; index < 20; index++) {
      putMob(state, 'shambler', mouth.x, mouth.y);
    }
    // Armed to fire on the window's first tick, so the window holds the whole
    // burst and the two runs start from the same volley.
    state.lines.streamIn = 1;
    if (swallowed) surgeStream(state, 1);

    let killed = 0;
    for (let tick = 0; tick < SURGE_VOLLEYS * SURGE_INTERVAL + 1; tick++) {
      advanceStream(state);
      killed += resolveStorm(state).filter(
        (event) => event.type === 'mobKilled',
      ).length;
    }
    return killed;
  };

  it('kills ten bodies the same window without a swallow never reaches', () => {
    // What the surge buys has never been a body count: it is the volleys the
    // window would not otherwise have held, which is Mark's 2026-08-27 ruling
    // and is unmoved. Two extra volleys used to be two bodies against the pass
    // A touch counts; under the mow a volley is five bodies (ADR 0059), so the
    // same two volleys are ten. The count is pinned rather than the relation,
    // because moving it should be a deliberate act and this is one.
    expect(bodiesClearedInBurst(true) - bodiesClearedInBurst(false)).toBe(10);
  });
});

describe('a settled faller split by a side edge walks back on-field (#76)', () => {
  it('walks a settled faller split by the left edge inward until its body is fully on-field, then descends straight', () => {
    // At half-width 11, a shambler centred at x 2 spans -9 to 13: its body is
    // split by the left edge, the confirmed near-invisible stack (#76).
    const state = quietRun();
    const step = stepping(state);
    const mob = putMob(state, 'shambler', 2, 60);
    const { halfWidth, speed } = MOB_TYPES.shambler;

    // The walk-in is at the type's own speed, and the descent never pauses.
    run(step, 1);
    expect(mob.vx).toBeCloseTo(speed, 12);
    expect(mob.y).toBeGreaterThan(60);

    // Walking the centre from 2 to halfWidth takes (halfWidth - 2) / speed ticks.
    run(step, Math.ceil((halfWidth - 2) / speed));
    expect(mob.x).toBeGreaterThanOrEqual(halfWidth);

    // Fully on-field, the slide ends and the descent is straight again.
    const settledX = mob.x;
    const settledY = mob.y;
    run(step, 30);
    expect(mob.vx).toBe(0);
    expect(mob.x).toBe(settledX);
    expect(mob.y).toBeGreaterThan(settledY);
  });
  it('walks a settled faller split by the right edge inward until its body is fully on-field, then descends straight', () => {
    // The mirror: centred 2 units short of the right edge, the body reaches 9
    // units past it, and fully on-field means the centre at FIELD_WIDTH - 11.
    const state = quietRun();
    const step = stepping(state);
    const mob = putMob(state, 'shambler', FIELD_WIDTH - 2, 60);
    const { halfWidth, speed } = MOB_TYPES.shambler;

    run(step, 1);
    expect(mob.vx).toBeCloseTo(-speed, 12);
    expect(mob.y).toBeGreaterThan(60);

    run(step, Math.ceil((halfWidth - 2) / speed));
    expect(mob.x).toBeLessThanOrEqual(FIELD_WIDTH - halfWidth);

    const settledX = mob.x;
    run(step, 30);
    expect(mob.vx).toBe(0);
    expect(mob.x).toBe(settledX);
  });
  it('brings a pincer trailing mob fully on-field once its arriving beat has passed', () => {
    // The confirmed producer: a pincer's trailing ranks sit back along the
    // entry diagonal, laterally outside the field, and the arriving beat's 45
    // ticks are not enough to carry the deepest rank all the way in.
    const state = quietRun();
    const step = stepping(state);
    // Order 4 of a six-mob pincer is the left arm's deepest rank.
    const trailing = orderAt(place('pincer', 6, state.streams.spawns), 4);
    expect(trailing.x).toBeLessThan(MOB_TYPES.shambler.halfWidth);
    spawnMob(state, 'shambler', trailing, false, 'wave');
    const mob = only(state);

    // Entry from 63 above the field plus the beat plus the walk-in all fit
    // well inside 250 ticks at the shambler's descent, and the field's 760
    // height means it is still far from the bottom edge when they are done.
    run(step, 250);
    expect(mob.alive).toBe(true);
    expect(mob.vx).toBe(0);
    expect(mob.x).toBeGreaterThanOrEqual(MOB_TYPES.shambler.halfWidth);
    expect(mob.x).toBeLessThanOrEqual(
      FIELD_WIDTH - MOB_TYPES.shambler.halfWidth,
    );
  });
  it('returns a mob pushed past a side edge to the field', () => {
    // The other confirmed producer: a bell toll clamps a pushed mob to the
    // spawn margin rather than to the field, so a settled faller can be parked
    // with its whole body past the edge. 60 units out is well inside the
    // margin, so the cull never takes it and only the walk-in can explain a
    // return.
    const state = quietRun();
    const step = stepping(state);
    const mob = putMob(state, 'shambler', FIELD_WIDTH + 60, 30);

    // The walk from 60 past the edge to fully on-field is 71 units at the
    // shambler's speed, near 225 ticks, and the descent over 300 ticks stays
    // above the bottom edge.
    run(step, 300);
    expect(mob.alive).toBe(true);
    expect(mob.vx).toBe(0);
    expect(mob.x).toBeLessThanOrEqual(
      FIELD_WIDTH - MOB_TYPES.shambler.halfWidth,
    );
    expect(mob.x).toBeGreaterThanOrEqual(MOB_TYPES.shambler.halfWidth);
  });
  it("holds the formation's arriving motion over an edge-split body until the beat ends", () => {
    // Formations enter from outside on purpose, so the walk-in must not touch
    // the arriving beat. The hard case is arriving motion pointing outward at
    // an already split body: a walk-in that fired early would flip it.
    const state = quietRun();
    const step = stepping(state);
    // The right arm's arriving direction heads left, outward at the left edge.
    const arm = orderAt(place('pincer', 2, state.streams.spawns), 1);
    expect(arm.vx).toBeLessThan(0);
    spawnMob(state, 'shambler', order(2, 11, arm.vx, arm.vy), false, 'wave');
    const mob = only(state);
    const arriving = mob.vx;

    run(step, ARRIVE_TICKS);
    expect(mob.vx).toBeCloseTo(arriving, 12);
    expect(mob.x).toBeLessThan(2);

    // The tick after the beat, the walk-in takes over at the type's own speed.
    run(step, 1);
    expect(mob.vx).toBeCloseTo(MOB_TYPES.shambler.speed, 12);
  });
  it("steers a ghoul at the grave the same whether or not its body crosses the field's edge", () => {
    // The walk-in is the falling types' rule only: a ghoul steers at the grave
    // and never settles, so its path must depend on where the grave is
    // relative to it and never on where the field's edge is. Two runs with the
    // same relative geometry, one with the body split by the left edge, must
    // trace the same path.
    const trace = (mobX: number): number[] => {
      const state = quietRun();
      const step = stepping(state);
      const mob = putMob(state, 'ghoul', mobX, 60);
      state.grave.x = mobX + 28;
      const offsets: number[] = [];
      for (let tick = 0; tick < 90; tick++) {
        step(STILL);
        offsets.push(mob.x - mobX);
      }
      return offsets;
    };

    const atEdge = trace(2);
    const midField = trace(202);
    for (let tick = 0; tick < atEdge.length; tick++) {
      const edgeOffset = atEdge[tick];
      const midOffset = midField[tick];
      if (edgeOffset === undefined || midOffset === undefined) {
        throw new Error(`no traced offset at tick ${tick}`);
      }
      expect(edgeOffset).toBeCloseTo(midOffset, 9);
    }
  });
});

describe('the absence of any stat step on the clock (ADR 0059)', () => {
  it('gives a body exactly its MOB_TYPES row, at a late tick as well as an early one', () => {
    /**
     * The deliberate absence of any per-minute step on a body's stats, made
     * mechanical: growth is arrivals and the roster, never the same enemies
     * wearing more health.
     *
     * ADR 0059 is Mark's ruling and it rules the direction. The second gate
     * round struck the step that was proposed on the evidence that its figures
     * (0.05 of base health and 0.005 of fall speed per minute) are Mad Forest's
     * Inverse mode, which is that stage's hard mode, where normal Mad Forest
     * carries no time modifiers at all. What would reopen it is a reading and
     * never an argument: timeToKill.ts in slice G reports hits to kill per
     * trash type per minute, and with no step authored a body costs fewer hits
     * every minute the ladder climbs.
     *
     * Read at two ticks two stage minutes apart, because a step on the clock is
     * exactly what a single reading cannot see.
     */
    const state = createRun(7);
    const order: SpawnOrder = { x: 100, y: 100, vx: 0, vy: 1, index: 0 };

    const stamped = (type: Mob['type']): string => {
      const mob = spawnMob(state, type, order, false, 'wave');
      if (mob === null) throw new Error(`the pool refused a ${type}`);
      const row = MOB_TYPES[type];
      mob.alive = false;
      return `${type} ${mob.hp} ${row.halfWidth} ${row.halfHeight}`;
    };

    const early = MOB_TYPE_NAMES.map((type) => stamped(type));
    state.tick = 120 * TICK_HZ;
    state.stage.sectionTick = 120 * TICK_HZ;
    const late = MOB_TYPE_NAMES.map((type) => stamped(type));

    expect(late).toEqual(early);
    expect(early).toEqual(
      MOB_TYPE_NAMES.map((type) => {
        const row = MOB_TYPES[type];
        return `${type} ${row.hp} ${row.halfWidth} ${row.halfHeight}`;
      }),
    );
  });
});

describe('a body travelling under a shove (design record R1, R2)', () => {
  it('stands a shoved body down from its own walk, and walks it again on the tick after', () => {
    // Every source that specifies a mechanism suspends the body's own motion
    // rather than adding the shove on top, and adding on top has no source
    // behind it (docs/research/push-feel-precedent.md section 1). So a body
    // being carried away from the grave does not also fall while it flies.
    const state = quietRun();
    const mob = putMob(state, 'shambler', 200, 300);
    startShove(mob.impulse, 'bell', mob.id, 0, -1, 40, 1, 0);

    for (let tick = 0; tick < SHOVE_TICKS; tick++) {
      const stood = mob.y;
      advanceMobs(state);
      expect(mob.y, `tick ${tick}`).toBeLessThan(stood);
    }

    const settled = mob.y;
    advanceMobs(state);
    expect(mob.y - settled).toBeCloseTo(MOB_TYPES.shambler.speed, 9);
  });

  it("leaves a shoved body's arriving beat exactly where it stood, so no shove borrows it", () => {
    // ADR 0041 gives the beat one meaning, the formation's arriving motion held
    // for a beat, and canTouchGrave reads it to decide whether a body may hurt
    // the grave. A shove riding the beat would make a flying body harmless,
    // which is a design change nobody ruled (design record R1).
    const state = quietRun();
    const mob = putMob(state, 'shambler', 200, 300);
    mob.beat = ARRIVE_TICKS;
    startShove(mob.impulse, 'bell', mob.id, 0, -1, 40, 1, 0);

    for (let tick = 0; tick < SHOVE_TICKS; tick++) advanceMobs(state);
    expect(mob.beat).toBe(ARRIVE_TICKS);

    advanceMobs(state);
    expect(mob.beat).toBe(ARRIVE_TICKS - 1);
  });

  it('stands a shoved body somewhere different on every tick, none of them a body-width from the last', () => {
    // The whole of what this slice buys a player: a toll that used to jump a
    // body 40 units in one frame, leaving an 18-unit hole between two drawn
    // positions, now draws it at every place between. That is Mark's ruling 4
    // of 2026-09-15 and it is arithmetic rather than a feeling.
    const state = quietRun();
    const mob = putMob(state, 'shambler', 200, 400);
    startShove(mob.impulse, 'bell', mob.id, 0, -1, 40, 1, 0);
    const width = MOB_TYPES.shambler.halfWidth * 2;

    const seen: number[] = [mob.y];
    for (let tick = 0; tick < SHOVE_TICKS; tick++) {
      advanceMobs(state);
      const last = seen.at(-1)!;
      expect(mob.y, `tick ${tick}`).not.toBe(last);
      expect(last - mob.y, `tick ${tick}`).toBeLessThan(width);
      seen.push(mob.y);
    }
    expect(new Set(seen).size).toBe(SHOVE_TICKS + 1);
  });

  it('never carries a body outside the field widened by the spawn margin, however large the impulse', () => {
    // The bound is where a body may stand, and the player's own weapon must
    // never push one out of the box the invariant harness checks. A hundred
    // thousand units of impulse is the honest form of "however large".
    const state = quietRun();
    const mob = putMob(state, 'shambler', FIELD_WIDTH - 10, 300);
    startShove(mob.impulse, 'bell', mob.id, 1, 0, 100000, 1, 0);

    for (let tick = 0; tick < SHOVE_TICKS; tick++) {
      advanceMobs(state);
      expect(mob.x, `tick ${tick}`).toBeLessThanOrEqual(
        FIELD_WIDTH + SPAWN_MARGIN,
      );
    }
    expect(mob.x).toBe(FIELD_WIDTH + SPAWN_MARGIN);
  });

  it('reports one mobShoved for the whole impulse, carrying what the body really travelled', () => {
    // One event per impulse and never one per tick: a per-tick event would
    // multiply the repel reading's count by SHOVE_TICKS and change what the
    // channel means without a READINGS_VERSION move.
    const state = quietRun();
    const mob = putMob(state, 'shambler', 200, 400);
    const stood = mob.y;
    startShove(mob.impulse, 'bell', mob.id, 0, -1, 40, 1, 0);

    const events: SimEvent[] = [];
    for (let tick = 0; tick < SHOVE_TICKS; tick++) {
      events.push(...advanceMobs(state));
    }

    expect(types(events, 'mobShoved')).toEqual([
      {
        type: 'mobShoved',
        id: mob.id,
        displacement: expect.closeTo(40, 9),
        source: 'bell',
      },
    ]);
    expect(stood - mob.y).toBeCloseTo(40, 9);
  });

  it('hands what a body was already carried to the corpse its kill leaves, rather than reporting it there', () => {
    // Its old title said it reported what a body was already carried when it
    // was killed in flight (slice H's own CodeRabbit finding). The distance
    // still reaches the reading and nothing is lost, which is what that test
    // was for; what changed is when, because the flight now finishes on the
    // corpse and one impulse still makes exactly one report (design record
    // R10).
    const state = quietRun();
    const mob = putMob(state, 'shambler', 200, 400);
    startShove(mob.impulse, 'bell', mob.id, 0, -1, 40, 1, 0);
    advanceMobs(state);
    advanceMobs(state);
    // The two ticks it flew, off the fall's own shape rather than off a figure:
    // the first step of a forty-unit shove and then that step less one
    // SHOVE_TICKS-th of itself.
    const first = (40 * 2) / (SHOVE_TICKS + 1);
    const flown = first + (first * (SHOVE_TICKS - 1)) / SHOVE_TICKS;

    const events = damageMob(state, mob, MOB_TYPES.shambler.hp, 'bell');

    expect(types(events, 'mobShoved')).toEqual([]);
    const corpse = liveCorpse(state);
    expect(corpse.impulse.travelled).toBeCloseTo(flown, 9);
    expect(corpse.impulse.ticksLeft).toBe(SHOVE_TICKS - 2);
    expect(mob.impulse).toEqual(blankImpulse());
  });

  it('reports nothing at the kill for a body killed on the tick the shove landed on it, because the corpse takes the whole of it', () => {
    // Its old title said it reported nothing for a body killed on the tick the
    // shove landed on it. The promise that nothing is reported at the kill
    // stands and its reason has changed: it used to be that the body never
    // travelled, and now it is that the corpse has the whole shove still to
    // run.
    const state = quietRun();
    const mob = putMob(state, 'shambler', 200, 400);
    startShove(mob.impulse, 'bell', mob.id, 0, -1, 40, 1, 0);

    const events = damageMob(state, mob, MOB_TYPES.shambler.hp, 'bell');

    expect(types(events, 'mobShoved')).toEqual([]);
    expect(liveCorpse(state).impulse.ticksLeft).toBe(SHOVE_TICKS);
  });

  it('reports nothing for a shove the bounds refused entirely', () => {
    // A zero-distance shove would report a push that never happened, which is
    // the rule the one-tick push already kept.
    const state = quietRun();
    const mob = putMob(state, 'shambler', FIELD_WIDTH + SPAWN_MARGIN, 300);
    startShove(mob.impulse, 'bell', mob.id, 1, 0, 40, 1, 0);

    const events: SimEvent[] = [];
    for (let tick = 0; tick < SHOVE_TICKS; tick++) {
      events.push(...advanceMobs(state));
    }

    expect(types(events, 'mobShoved')).toEqual([]);
    expect(mob.x).toBe(FIELD_WIDTH + SPAWN_MARGIN);
  });
});

describe('a shove outliving the body that carried it (design record R10)', () => {
  /** How far one whole shove of this row carries whatever is carrying it. */
  const THROW = 40;

  /**
   * The travel a shove really bought, off the report rather than off a
   * position, because a position also carries the field's own scroll.
   */
  function travelOf(events: readonly SimEvent[], id: number): number {
    return shoves(events)
      .filter((shove) => shove.id === id)
      .reduce((sum, shove) => sum + shove.displacement, 0);
  }

  it('finishes the shove a body was given even when the storm kills it partway through', () => {
    // The whole of what this slice buys: a press hands every body at one
    // distance an identical impulse, and half of them used to stop dead where
    // they died at no distance the player could see (design record R10, Mark's
    // sighting of 2026-09-16). Expressed against the row rather than a number.
    const state = quietRun();
    const lived = putMob(state, 'shambler', 150, 300);
    const died = putMob(state, 'shambler', 350, 300);
    startShove(lived.impulse, 'bell', lived.id, 0, -1, THROW, 1, 0);
    startShove(died.impulse, 'bell', died.id, 0, -1, THROW, 1, 0);

    const events: SimEvent[] = [];
    for (let tick = 0; tick < SHOVE_TICKS; tick++) {
      if (tick === 5) {
        events.push(...damageMob(state, died, MOB_TYPES.shambler.hp, 'bell'));
      }
      events.push(...advanceMobs(state));
    }

    expect(travelOf(events, died.id)).toBeCloseTo(THROW, 9);
    expect(travelOf(events, died.id)).toBeCloseTo(
      travelOf(events, lived.id),
      9,
    );
  });

  it('carries twelve bodies caught at one distance the same distance, whether they live or die', () => {
    // Mark's own sighting turned into a test: twelve bodies on one ring at one
    // distance, handed twelve identical impulses, with every other one killed
    // partway through the flight. Session 27 measured six of twelve stopping
    // dead at a fraction of the travel.
    const state = quietRun();
    const ring: Mob[] = [];
    for (let at = 0; at < 12; at++) {
      const body = putMob(state, 'shambler', 40 + at * 40, 300);
      startShove(body.impulse, 'bell', body.id, 0, -1, THROW, 1, 0);
      ring.push(body);
    }

    const events: SimEvent[] = [];
    for (let tick = 0; tick < SHOVE_TICKS; tick++) {
      if (tick === 7) {
        for (const [at, body] of ring.entries()) {
          if (at % 2 === 1) continue;
          events.push(...damageMob(state, body, MOB_TYPES.shambler.hp, 'bell'));
        }
      }
      events.push(...advanceMobs(state));
    }

    const travels = ring.map((body) => travelOf(events, body.id));
    expect(travels).toHaveLength(12);
    for (const travel of travels) expect(travel).toBeCloseTo(THROW, 9);
  });

  it('carries a body killed on the tick a shove landed on it the whole of that shove', () => {
    // The boundary case. A body the storm takes before it has moved at all has
    // travelled nothing to report, and the corpse it leaves owes the whole of
    // the flight rather than none of it.
    const state = quietRun();
    const mob = putMob(state, 'shambler', 200, 300);
    startShove(mob.impulse, 'bell', mob.id, 0, -1, THROW, 1, 0);

    const events = [...damageMob(state, mob, MOB_TYPES.shambler.hp, 'bell')];
    for (let tick = 0; tick < SHOVE_TICKS; tick++) {
      events.push(...advanceMobs(state));
    }

    expect(travelOf(events, mob.id)).toBeCloseTo(THROW, 9);
  });

  it('reports a shove once, when the impulse is spent, whoever was carrying it at the end', () => {
    // One event per impulse and never one per carrier: a report at the kill and
    // a second at the end of the flight would count one push twice in the repel
    // reading and change what the channel means.
    const state = quietRun();
    const mob = putMob(state, 'shambler', 200, 300);
    startShove(mob.impulse, 'bell', mob.id, 0, -1, THROW, 1, 0);

    const events: SimEvent[] = [];
    for (let tick = 0; tick < SHOVE_TICKS * 2; tick++) {
      if (tick === 5) {
        events.push(...damageMob(state, mob, MOB_TYPES.shambler.hp, 'bell'));
      }
      events.push(...advanceMobs(state));
    }

    // The id is the body the push reached and never the corpse that finished
    // carrying it, which is what the repel reading has always meant by it.
    expect(types(events, 'mobShoved')).toEqual([
      {
        type: 'mobShoved',
        id: mob.id,
        displacement: expect.closeTo(THROW, 9),
        source: 'bell',
      },
    ]);
  });

  it('reports what a culled body was carried and hands nothing on, because a culled body leaves no corpse', () => {
    // The cull exit, held exactly as it was. A body that leaves the field is
    // gone from the world with nothing left behind to carry the shove, so the
    // honest answer is the partial report rather than a distance the reading
    // never sees.
    const state = quietRun();
    const mob = putMob(state, 'shambler', 200, FIELD_HEIGHT + 8);
    startShove(mob.impulse, 'bell', mob.id, 0, 1, THROW, 1, 0);
    advanceMobs(state);
    advanceMobs(state);
    const flown = mob.impulse.travelled;

    const events = cullMobs(state);

    expect(mob.alive).toBe(false);
    expect(state.corpses.filter((corpse) => corpse.alive)).toEqual([]);
    expect(types(events, 'mobShoved')).toEqual([
      {
        type: 'mobShoved',
        id: mob.id,
        displacement: expect.closeTo(flown, 9),
        source: 'bell',
      },
    ]);
    expect(flown).toBeLessThan(THROW);
  });
});
