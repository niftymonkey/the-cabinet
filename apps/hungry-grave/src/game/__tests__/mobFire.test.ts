/**
 * The fire mobs emit: which share of a wave carries it, when the tell lights,
 * and where the shot goes (ADR 0016 and ADR 0014). Every sim test here steps
 * through the one execution authority (ADR 0017), and stepping() fails the test
 * on any fault the run records.
 *
 * Magnitudes are the tuning dispatch's, so what is pinned here is the
 * derivations: an arming rule stated as an index, and a tell lead stated
 * against the arriving beat.
 */

import { describe, expect, it } from 'vitest';

// Both modules' own text, as Vite raw imports rather than through node:fs, so
// the source scan below stays inside the boundary src/boundary.test.ts holds.
// The table that carries the firing numbers lives in mobs.ts and the code that
// reads them lives here, so a shared constant could be declared in either.
import mobFireSource from '../mobFire.ts?raw';
import mobsSource from '../mobs.ts?raw';

import type { Stepper } from '../../dev/stepping';
import { stepping } from '../../dev/stepping';
import { TICK_HZ } from '../clock';
import type { TickCommand } from '../command';
import type { SimEvent } from '../events';
import { FIELD_HEIGHT } from '../field';
import type { FireRow, Shot } from '../mobFire';
import {
  fireDirectedShot,
  fireShot,
  firstShotOffset,
  isArmed,
} from '../mobFire';
import type { Mob } from '../mobs';
import {
  advanceMobs,
  ARRIVE_TICKS,
  hasEntered,
  MOB_TYPE_NAMES,
  MOB_TYPES,
  mobTellLit,
  spawnMob,
} from '../mobs';
import type { RunState } from '../run';
import { createRun } from '../run';
import { PROCESSION_ROWS } from '../stage/rows';
import type { SpawnOrder } from '../stage/templates';
import { place } from '../stage/templates';

/** A tick that only steers, which is every tick these tests are about. */
function drift(x: number, y: number): TickCommand {
  return { move: { x, y }, belch: false };
}

const STILL: TickCommand = drift(0, 0);
const RIGHT: TickCommand = drift(1, 0);

/**
 * A run whose stage will not spawn anything on top of the mob under test. The
 * rows are marked fired rather than emptied, because the row tables are exported
 * data and a test that mutated them would poison every later file.
 */
function quietRun(seed = 4): RunState {
  const run = createRun(seed);
  run.stage.firedRows = PROCESSION_ROWS.length;
  // The stream is held as well as the rows. These tests are about how a mob
  // moves, fires and dies, and a birthright stream pouring up the middle of the
  // field kills the mob under test before it reaches the behaviour being
  // measured. Territory is birthright as well and is deliberately not held:
  // its first lay is a whole period out at tick 500, and the one test here that
  // runs past that is measuring a revenant's firing cadence, which claimed
  // ground does not touch.
  run.lines.streamIn = Number.MAX_SAFE_INTEGER;
  return run;
}

/** A run with a quiet stage and Territory pinned to level 1, so a test that aims at claimed ground does not move if the birthright roster does. */
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

function order(x: number, y: number, vx = 0, vy = 1, index = 0): SpawnOrder {
  return { x, y, vx, vy, index };
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

describe('the armed share (ADR 0016)', () => {
  it('arms a mob when its group index modulo three is two, so no Drip of one or two is ever armed', () => {
    // Read off the rule and the template's own indices rather than off a mob
    // type: under the mow no type carries the every-third share, because the
    // mow body is silent and the revenant is all-armed (ADR 0059). The rule is
    // still what a row naming that share would arm by.
    for (const count of [1, 2, 3, 6]) {
      const state = quietRun();
      const armed = place('drip', count, state.streams.spawns).filter((at) =>
        isArmed('everyThird', at.index),
      );
      expect(`drip of ${count}: ${armed.length}`).toBe(
        `drip of ${count}: ${Math.floor(count / 3)}`,
      );
    }
  });

  it('arms every revenant and no ghoul', () => {
    const state = quietRun();
    for (const at of place('drip', 4, state.streams.spawns)) {
      spawnMob(state, 'revenant', at, false);
    }
    expect(state.mobs.filter((mob) => mob.alive && mob.armed)).toHaveLength(4);

    const ghouls = quietRun();
    for (const at of place('drip', 9, ghouls.streams.spawns)) {
      spawnMob(ghouls, 'ghoul', at, false);
    }
    expect(ghouls.mobs.filter((mob) => mob.alive && mob.armed)).toHaveLength(0);
  });

  it('indexes the share per arm on the V and the Pincer, so a mirrored template arms symmetrically', () => {
    // The same reading as above: the placement's own per-arm indices against
    // the share rule, because no type carries the every-third share under the
    // mow (ADR 0059). What is pinned is that the template counts each arm from
    // zero, so the two sides arm alike.
    for (const template of ['v', 'pincer'] as const) {
      const state = quietRun();
      const orders = place(template, 6, state.streams.spawns);
      const armedLeft = orders.filter(
        (at, index) => isArmed('everyThird', at.index) && index % 2 === 0,
      );
      const armedRight = orders.filter(
        (at, index) => isArmed('everyThird', at.index) && index % 2 === 1,
      );
      expect(`${template} ${armedLeft.length} ${armedRight.length}`).toBe(
        `${template} 1 1`,
      );
    }
  });

  it('never lets an unarmed shambler fire', () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(state, 'shambler', order(200, 11, 0, 1, 0), false);
    expect(only(state).armed).toBe(false);
    expect(types(run(step, 600), 'mobFired')).toHaveLength(0);
  });
});

describe('mob fire (ADR 0016 and ADR 0014)', () => {
  it("lights a revenant's tell as it enters and lands its first shot at the end of the beat", () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(
      state,
      'revenant',
      order(200, MOB_TYPES.revenant.halfHeight),
      false,
    );
    const mob = only(state);
    expect(hasEntered(mob)).toBe(true);
    expect(mobTellLit(mob)).toBe(true);

    const before = run(step, ARRIVE_TICKS - 1);
    expect(types(before, 'mobFired')).toHaveLength(0);
    expect(mobTellLit(mob)).toBe(true);

    expect(types(run(step, 1), 'mobFired')).toHaveLength(1);
  });

  it("puts the same tell lead in front of every shot over a revenant's whole pass", () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(
      state,
      'revenant',
      order(200, MOB_TYPES.revenant.halfHeight),
      false,
    );
    const mob = only(state);
    const lead = MOB_TYPES.revenant.fire.tellTicks;

    const lit: number[] = [];
    const fired: number[] = [];
    for (let tick = 0; tick < 800 && mob.alive; tick++) {
      const wasLit = mobTellLit(mob);
      const events = step(STILL);
      if (!wasLit && mobTellLit(mob)) lit.push(state.tick);
      for (const event of events) {
        if (event.type === 'mobFired') fired.push(state.tick);
      }
    }
    expect(fired.length).toBeGreaterThan(3);
    // The first tell lights before the first step, so the leads line up from
    // the second shot on.
    for (let shot = 1; shot < fired.length; shot++) {
      const firedAt = fired[shot];
      const litBefore = lit[shot - 1];
      if (firedAt === undefined || litBefore === undefined) {
        throw new Error(`shot ${shot} has no paired fired/lit tick`);
      }
      expect(`lead before shot ${shot}: ${firedAt - litBefore}`).toBe(
        `lead before shot ${shot}: ${lead}`,
      );
    }
  });

  it('spreads a group of armed mobs with a per-mob offset, so it does not fire as one volley', () => {
    // Read off the offset rule against a row that names a jitter, because no
    // row names one today: the mow body was the only type that did and it is
    // silent now (ADR 0059), while the revenant has always fired on its own
    // clock at a jitter of zero. The rule still binds any row that names one.
    const state = quietRun();
    const jittered: FireRow = {
      ...MOB_TYPES.revenant.fire,
      firstShotJitter: 45,
    };
    const offsets = new Set(
      Array.from({ length: 9 }, () => firstShotOffset(state, jittered)),
    );
    expect(offsets.size).toBeGreaterThan(1);
  });

  it('names no jitter on any mob type, so nothing but a boss draws the mobFire stream', () => {
    // The deliberate absence the promise above leaves behind, pinned so it is
    // a stated cost of the mow rather than a silent one: the every-third
    // share and the first-shot jitter both went quiet with the mow body, and a
    // type that starts naming a jitter again is a change somebody made.
    for (const type of MOB_TYPE_NAMES) {
      expect(`${type}: ${MOB_TYPES[type].fire.firstShotJitter}`).toBe(
        `${type}: 0`,
      );
    }
  });

  it("aims at the grave's centre at the moment of firing and never changes direction after", () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(
      state,
      'revenant',
      order(120, MOB_TYPES.revenant.halfHeight),
      false,
    );
    const mob = only(state);
    run(step, ARRIVE_TICKS);

    const shot = state.mobFire.find((each) => each.alive)!;
    const dx = state.grave.x - mob.x;
    const dy = state.grave.y - mob.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const speed = MOB_TYPES.revenant.fire.shotSpeed;
    expect(shot.vx).toBeCloseTo((dx / length) * speed, 9);
    expect(shot.vy).toBeCloseTo((dy / length) * speed, 9);

    const aimed = { vx: shot.vx, vy: shot.vy };
    run(step, 20, RIGHT);
    expect(shot.vx).toBe(aimed.vx);
    expect(shot.vy).toBe(aimed.vy);
  });

  it('does not carry the scroll', () => {
    const state = quietRun();
    const step = stepping(state);
    spawnMob(
      state,
      'revenant',
      order(200, MOB_TYPES.revenant.halfHeight),
      false,
    );
    run(step, ARRIVE_TICKS);
    const shot = state.mobFire.find((each) => each.alive)!;
    const from = shot.y;
    run(step, 10);
    expect(shot.y - from).toBeCloseTo(10 * shot.vy, 9);
  });

  it("keeps every firing number on the type's row, the tell lead included", () => {
    // A source scan, because the failure this guards against is a shared module
    // constant, and no assertion over the table's values can see one.
    for (const type of MOB_TYPE_NAMES) {
      const fire = MOB_TYPES[type].fire;
      for (const [field, value] of Object.entries(fire)) {
        if (field === 'armedShare') continue;
        expect(`${type}.${field} ${typeof value}`).toBe(
          `${type}.${field} number`,
        );
      }
      if (fire.armedShare === 'none') continue;
      expect(fire.tellTicks).toBeGreaterThan(0);
      expect(fire.interval).toBeGreaterThan(0);
      expect(fire.shotSpeed).toBeGreaterThan(0);
      expect(fire.shotHalfExtent).toBeGreaterThan(0);
    }
    // The two silent types share the one declared silent row rather than each
    // spelling out its own zeros, which is what keeps silence a single fact
    // about the table (ADR 0059).
    expect(MOB_TYPES.shambler.fire).toBe(MOB_TYPES.ghoul.fire);

    const declared = [
      ...`${mobsSource}\n${mobFireSource}`.matchAll(
        /^(?:export )?const ([A-Z][A-Z0-9_]*)\s*(?::[^=]*)?=\s*[^{[\n]/gm,
      ),
    ];
    const firing = declared
      .map((match) => {
        const name = match[1];
        if (name === undefined) {
          throw new Error(
            'constant-declaration regex matched with no captured name',
          );
        }
        return name;
      })
      .filter((name) => /TELL|SHOT|INTERVAL|EXTENT|JITTER|ARMED/.test(name));
    expect(firing).toEqual([]);
  });

  it('states the shot speed as a reaction budget: a shot from mid-field reaches the starting mark in about two seconds', () => {
    const state = quietRun();
    const distance = state.grave.y - FIELD_HEIGHT / 2;
    const seconds = distance / (MOB_TYPES.revenant.fire.shotSpeed * TICK_HZ);
    expect(seconds).toBeGreaterThan(1.5);
    expect(seconds).toBeLessThan(2.5);
  });
});

describe('an armed mob that has passed the grave (plan 6.10)', () => {
  it('does not fire, because a mob shooting upward at the player from behind reads as unfair', () => {
    // Watched go red with the guard removed. Mobs are culled only past the
    // bottom edge, so without it a mob at y=734 aims back up at a grave at 711.
    const state = stormRun();
    const behind = putMob(
      state,
      'revenant',
      state.grave.x,
      state.grave.y + state.grave.size + MOB_TYPES.revenant.halfHeight + 5,
    );
    behind.armed = true;
    behind.fireIn = 1;

    const events = advanceMobs(state);
    expect(events.map((event) => event.type)).not.toContain('mobFired');
    expect(state.mobFire.filter((shot) => shot.alive)).toHaveLength(0);
  });

  it('still fires while it is level with or above the grave', () => {
    const state = stormRun();
    const ahead = putMob(state, 'revenant', state.grave.x, state.grave.y - 100);
    ahead.armed = true;
    ahead.fireIn = 1;

    const events = advanceMobs(state);
    expect(events.map((event) => event.type)).toContain('mobFired');
  });
});

describe('a shot with an authored direction (ADR 0007)', () => {
  /** The one shot a test put on the field. */
  function onlyShot(state: RunState): Shot {
    const live = state.mobFire.filter((shot) => shot.alive);
    expect(live).toHaveLength(1);
    const shot = live[0];
    if (shot === undefined) throw new Error('no live shot');
    return shot;
  }

  it('travels the direction it was given, and is never re-aimed at the grave', () => {
    // Every boss pattern needs this and no mob does: an authored pattern is a
    // shape the player reads and moves through, so a spoke that turned toward
    // the grave after leaving would make the shape a lie. The grave stands
    // where the aimed rule would plainly pull the shot toward, so the two
    // rules cannot pass for each other.
    const state = quietRun();
    const step = stepping(state);
    state.grave.x = 20;
    state.grave.y = FIELD_HEIGHT - 40;

    fireDirectedShot(
      state,
      { x: 270, y: 100 },
      { x: 1, y: 0 },
      MOB_TYPES.revenant.fire,
      'undertaker',
      'clod',
    );
    const shot = onlyShot(state);
    const speed = MOB_TYPES.revenant.fire.shotSpeed;

    expect(shot.vx).toBeCloseTo(speed, 10);
    expect(shot.vy).toBeCloseTo(0, 10);

    run(step, 10);
    expect(shot.vx).toBeCloseTo(speed, 10);
    expect(shot.vy).toBeCloseTo(0, 10);
    expect(shot.y).toBeCloseTo(100, 10);
  });

  it('normalizes the direction, so a pattern writes a bearing and never a speed', () => {
    // A pattern that had to hand over a unit vector would carry the fire row's
    // speed in every one of its own rows, and a bearing written slightly long
    // would be a faster shot nobody meant.
    const state = quietRun();
    fireDirectedShot(
      state,
      { x: 270, y: 100 },
      { x: 30, y: 40 },
      MOB_TYPES.revenant.fire,
      'banshee',
      'tear',
    );
    const shot = onlyShot(state);
    const speed = MOB_TYPES.revenant.fire.shotSpeed;

    // Math.sqrt rather than Math.hypot: hypot is implementation-approximated
    // and the sim is held to exactly-specified operations (ADR 0015).
    const travelled = Math.sqrt(shot.vx * shot.vx + shot.vy * shot.vy);
    expect(travelled).toBeCloseTo(speed, 10);
    expect(shot.vx).toBeCloseTo(speed * 0.6, 10);
    expect(shot.vy).toBeCloseTo(speed * 0.8, 10);
  });

  it('still aims a mob shot at the grave, so the existing rule is unchanged', () => {
    // The aimed shot is what a mob fires and it is untouched by the directed
    // one: mob fire is a line from a mob to where the player was, and that
    // grammar is ADR 0014's.
    const state = quietRun();
    state.grave.x = 20;
    state.grave.y = FIELD_HEIGHT - 40;
    const mob = putMob(state, 'revenant', 400, 120);

    fireShot(state, mob, MOB_TYPES.revenant.fire);
    const shot = onlyShot(state);

    expect(shot.vx).toBeLessThan(0);
    expect(shot.vy).toBeGreaterThan(0);
    expect(shot.kind).toBe('trash');
    expect(shot.emitter).toBe('revenant');
  });

  it('carries the fire kind its emitter authored, beside who fired it', () => {
    // Who fired and what it looks like are two questions and neither answers
    // the other: a boss's rings and its adds' shots share an emitter and not a
    // read, and a clod and a tear share a boss and not a read. So the kind
    // travels on the shot and on the event, and the renderer keys on it.
    const state = quietRun();
    const fired = fireDirectedShot(
      state,
      { x: 270, y: 100 },
      { x: 0, y: 1 },
      MOB_TYPES.revenant.fire,
      'undertaker',
      'spiral',
    );

    expect(fired).toEqual([
      {
        type: 'mobFired',
        emitter: 'undertaker',
        kind: 'spiral',
        x: 270,
        y: 100,
      },
    ]);
    expect(onlyShot(state).kind).toBe('spiral');
    expect(onlyShot(state).emitter).toBe('undertaker');
  });

  it("counts a boss's landed shot under that boss, and never under a mob", () => {
    // The widened emitter reaches the grave through step.ts, which hands
    // hitGrave whatever the shot carried, so DamageTaken.hits separates a
    // boss's pattern from a trash shot without a second event and without a
    // second field (#48).
    const state = quietRun();
    const step = stepping(state);
    state.grave.invulnerable = 0;

    fireDirectedShot(
      state,
      { x: state.grave.x, y: state.grave.y - 8 },
      { x: 0, y: 1 },
      MOB_TYPES.revenant.fire,
      'banshee',
      'tear',
    );
    const hits = types(run(step, 3), 'graveHit');

    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ source: 'banshee' });
  });
});
