/**
 * The three mob types, how they move and how they die (ADR 0016). Every sim
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
import { fireBelch } from '../belch';
import type { TickCommand } from '../command';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import { graveHitbox } from '../grave';
import { advanceBell } from '../lines/bell';
import { MAX_LEVEL, WEAPON_LINES } from '../lines/roster';
import {
  advanceStream,
  SKULL_DAMAGE,
  STREAM_INTERVAL,
  SURGE_INTERVAL,
  SURGE_VOLLEYS,
  surgeStream,
} from '../lines/skullStream';
import { advanceWisps, launchWisps } from '../lines/wisps';
import type { Mob } from '../mobs';
import {
  ARRIVE_TICKS,
  damageMob,
  hasEntered,
  MOB_TYPE_NAMES,
  MOB_TYPES,
  spawnMob,
} from '../mobs';
import type { RunState } from '../run';
import { createRun } from '../run';
import { PHASES } from '../stage/stage';
import type { SpawnOrder } from '../stage/templates';
import { place } from '../stage/templates';
import { resolveStorm } from '../storm';
import {
  RESERVOIR_CAPACITY,
  SCROLL_SPEED,
  TRASH_CORPSE_PAYOUT,
} from '../tuning';

/** A tick that only steers, which is every tick these tests are about. */
function drift(x: number, y: number): TickCommand {
  return { move: { x, y }, belch: false };
}

const STILL: TickCommand = drift(0, 0);
const RIGHT: TickCommand = drift(1, 0);

/**
 * A run whose stage will not spawn anything on top of the mob under test.
 *
 * It stands in the last phase of the table, which is the one phase the machine
 * never leaves. Marking a phase's rows fired silences that phase alone: a phase
 * ends now on its rows being spent and its field clearing (ADR 0051), so the
 * tick a test's field empties would roll the run into the next section and its
 * rows.
 */
function quietRun(seed = 4): RunState {
  const run = createRun(seed);
  run.stage.phaseIndex = PHASES.length - 1;
  // The stream and Territory's clock are held as well as the rows. These tests
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
  const mob = spawnMob(state, type, { x, y, vx: 0, vy: 1, index: 0 }, false)!;
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

/** The order at this position in a template's own placement, which every caller here asks for at an index the template's count covers. */
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

  it("makes the ghoul's speed a real fraction of the grave's, because the type table bounds it by turn rate and not by a cap", () => {
    // The magnitude is the tuning dispatch's and is deliberately not pinned.
    // What is pinned is that it is fast enough to be a threat at all: a chaser
    // slower than the scroll it rides can never intercept anything.
    expect(MOB_TYPES.ghoul.speed).toBeGreaterThan(SCROLL_SPEED);
    expect(MOB_TYPES.ghoul.motion).toBe('chases');
  });
});

describe('the mow (ADR 0059)', () => {
  /** How many skulls a body of this type takes, landed one at a time. */
  const skullsToKill = (type: Mob['type']): number => {
    const state = quietRun();
    const mob = putMob(state, type, 200, 200);
    let skulls = 0;
    while (mob.alive && skulls < 20) {
      damageMob(state, mob, SKULL_DAMAGE, 'skullStream');
      skulls += 1;
    }
    return skulls;
  };

  it('kills a shambler with one skull', () => {
    // ADR 0059: density is bought with weak bodies, never tough ones, so the
    // mow body dies to the first thing the storm lands on it. Counted through
    // damageMob rather than divided, because what is promised is the kill.
    expect(skullsToKill('shambler')).toBe(1);
  });

  it('kills a ghoul with three skulls and a revenant with eight', () => {
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
  it("holds the template's arriving velocity for ARRIVE_TICKS and then moves under the type's own rule", () => {
    const state = quietRun();
    const step = stepping(state);
    // A V's arm arrives on a diagonal, which is the case where the beat bites.
    const arm = orderAt(place('v', 2, state.streams.spawns), 0);
    spawnMob(state, 'shambler', order(200, 11, arm.vx, arm.vy), false);
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

  it("gives a mob the template's direction times its own type speed, so a straight-down entry changes speed by nothing when the beat ends", () => {
    for (const type of ['shambler', 'revenant'] as const) {
      const state = quietRun();
      const step = stepping(state);
      spawnMob(state, type, order(200, MOB_TYPES[type].halfHeight), false);
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
    spawnMob(state, 'shambler', order(200, deep, arm.vx, arm.vy), false);
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

  it("leaves a ghoul flying the template's arriving direction at the tick its beat ends, not straight down", () => {
    const state = quietRun();
    const step = stepping(state);
    const arm = orderAt(place('pincer', 2, state.streams.spawns), 0);
    spawnMob(state, 'ghoul', order(200, 9, arm.vx, arm.vy), false);
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
    spawnMob(state, 'ghoul', order(120, 60), false);
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
  spawnMob(state, 'ghoul', order(state.grave.x, 400), false);
  const events: SimEvent[] = [];
  for (let tick = 0; tick < contact + 400; tick++) {
    events.push(...step(tick < commitAt ? STILL : RIGHT));
  }
  return events;
}

describe("a mob's death (ADR 0037)", () => {
  it('kills at or below zero health, frees the slot, leaves a corpse and reports the kill', () => {
    const state = quietRun();
    spawnMob(state, 'shambler', order(200, 100), false);
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

  it("names the belch's burst belch", () => {
    const state = quietRun();
    // Standing inside the burst, which is the only thing the belch kills since
    // ADR 0008's split.
    putMob(state, 'shambler', state.grave.x, state.grave.y - 40);
    state.reservoir = RESERVOIR_CAPACITY;

    const struck = types(fireBelch(state), 'mobDamaged');
    expect(struck).toEqual([
      expect.objectContaining({ type: 'mobDamaged', source: 'belch' }),
    ]);
  });

  it('never kills a mob on contact and never leaves a corpse for one, however long the grave sits under it', () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, 'shambler', order(state.grave.x, 300), false);
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
    spawnMob(state, 'shambler', order(60, 700), false);
    const mob = only(state);
    const events = run(step, 200);
    expect(mob.alive).toBe(false);
    expect(events).toEqual([]);
    expect(state.corpses.some((corpse) => corpse.alive)).toBe(false);
  });
});

describe('a carrier is told apart from the mob it rides in (ADR 0002)', () => {
  it("reports carried on a killed carrier's death and never on an ordinary mob's", () => {
    // The kill event is what the offer opens from, so the flag travels as a
    // value on the event rather than as a look-up back at the mob: the slot
    // the carrier stood in is free the moment it dies.
    const state = quietRun();
    const carrier = spawnMob(state, 'shambler', order(200, 100), true)!;
    const trash = spawnMob(state, 'shambler', order(260, 100), false)!;

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
    spawnMob(state, 'shambler', order(200, 100), false);
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
    spawnMob(state, 'ghoul', order(200, 100), false);
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
    spawnMob(state, 'shambler', trailing, false);
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
  it("holds the template's arriving motion over an edge-split body until the beat ends", () => {
    // Templates enter from outside on purpose, so the walk-in must not touch
    // the arriving beat. The hard case is arriving motion pointing outward at
    // an already split body: a walk-in that fired early would flip it.
    const state = quietRun();
    const step = stepping(state);
    // The right arm's arriving direction heads left, outward at the left edge.
    const arm = orderAt(place('pincer', 2, state.streams.spawns), 1);
    expect(arm.vx).toBeLessThan(0);
    spawnMob(state, 'shambler', order(2, 11, arm.vx, arm.vy), false);
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
