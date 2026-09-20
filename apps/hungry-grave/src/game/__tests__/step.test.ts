/**
 * The sim seam (tracer plan section 3). Every test here steps through the one
 * execution authority (ADR 0017), and stepping() fails the test on any fault
 * the run records, which is ADR 0013's invariants checked on every step.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { stepping } from '../../dev/stepping';
import { spawnBoss } from '../bosses/phases';
import type { Corpse } from '../corpses';
import {
  CORPSE_HALF_EXTENT,
  FRESHNESS_PER_TICK,
  POWER_UP_HALF_EXTENT,
  spawnCorpse,
  spawnFallenRung,
  spawnFeast,
  spawnPowerUp,
} from '../corpses';
import type { SimEvent } from '../events';
import { graveHitbox, graveWidth } from '../grave';
import { fireDirectedShot } from '../mobFire';
import type { Mob } from '../mobs';
import { ARRIVE_TICKS, MOB_TYPES, spawnMob } from '../mobs';
import type { TickCommand } from '../command';
import type { RunState } from '../run';
import { createRun } from '../run';
import { BELCH_BURST_RADIUS, BELCH_SHOVE_SPACING } from '../belch';
import { blankImpulse, startShove } from '../shove';
import { PROCESSION_WAVES } from '../stage/waves';
import { BELL_EXPAND_TICKS } from '../lines/bell';
import { MAX_LEVEL } from '../lines/roster';
import {
  BASE_SPEED,
  HIT_SHRINK,
  INVULNERABLE_TICKS,
  RESERVOIR_CAPACITY,
  SCROLL_SPEED,
  SIZE_CEILING,
  SIZE_FLOOR,
} from '../tuning';
import type { TuningOverlay } from '../tuningRecord';
import { resolveTuning } from '../tuningRecord';

/** A tick that only steers, which is every tick these tests are about. */
function drift(x: number, y: number): TickCommand {
  return { move: { x, y }, belch: false };
}

const STILL: TickCommand = drift(0, 0);

/** Narrows a possibly-absent value, or fails loudly when the absence is a bug. */
function requireDefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

/**
 * Everything that defines a run, by value. The streams are closures, so two
 * runs never compare deeply equal however identical their state is.
 */
/**
 * Everything on the run that a divergence could move, by value. The streams
 * hold live closures, so only their draw counts go in; everything else is
 * spread, including the entity pools, because a pooled entity can diverge in
 * position or health across 1,500 ticks without moving any emitted event.
 */
function snapshot(run: RunState) {
  return {
    seed: run.seed,
    tick: run.tick,
    grave: { ...run.grave },
    score: run.score,
    reservoir: run.reservoir,
    levels: { ...run.levels },
    ending: run.ending,
    stage: { ...run.stage },
    nextEntityId: run.nextEntityId,
    mobs: run.mobs.map((mob) => ({ ...mob })),
    mobFire: run.mobFire.map((shot) => ({ ...shot })),
    corpses: run.corpses.map((corpse) => ({ ...corpse })),
    skulls: run.skulls.map((skull) => ({ ...skull })),
    wisps: run.wisps.map((wisp) => ({ ...wisp })),
    patches: run.patches.map((patch) => ({
      ...patch,
      struck: [...patch.struck],
    })),
    lines: {
      ...run.lines,
      ring:
        run.lines.ring === null
          ? null
          : { ...run.lines.ring, struck: [...run.lines.ring.struck] },
    },
    drawn: {
      spawns: run.streams.spawns.drawn,
      powerUps: run.streams.powerUps.drawn,
      mobFire: run.streams.mobFire.drawn,
      shed: run.streams.shed.drawn,
    },
  };
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

describe('the sim seam', () => {
  // a failed assertion must not leave a spy installed for the rest of the file
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('a run starts at tick zero and keeps the seed it was given (ADR 0012)', () => {
    const run = createRun(7);
    expect(run.seed).toBe(7);
    expect(run.tick).toBe(0);
  });

  it('a pinned seed is kept whatever its value, zero included (ADR 0012)', () => {
    expect(createRun(0).seed).toBe(0);
    expect(createRun(2147483646).seed).toBe(2147483646);
  });

  it('no seed derives one from the random source (ADR 0012)', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(createRun().seed).toBe(1073741823);
    random.mockReturnValue(0);
    expect(createRun().seed).toBe(0);
  });

  it('no seed rolls a fresh one, in range (ADR 0012)', () => {
    for (let i = 0; i < 200; i++) {
      const { seed } = createRun();
      expect(Number.isInteger(seed)).toBe(true);
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThan(2147483647);
    }
  });

  it('a step advances exactly one tick', () => {
    const run = createRun(7);
    const step = stepping(run);
    step(STILL);
    step(STILL);
    expect(run.tick).toBe(2);
  });

  it('a tick with nothing in it reports no events', () => {
    const run = createRun(7);
    expect(stepping(run)(STILL)).toEqual([]);
  });

  it('scroll distance derives from the tick, so there is no stored field to drift', () => {
    const run = createRun(7);
    const step = stepping(run);
    for (let i = 0; i < 40; i++) step(STILL);
    expect(run.tick).toBe(40);
    expect(run.tick * SCROLL_SPEED).toBe(40 * SCROLL_SPEED);
    const scrollish = Object.keys(run).filter((key) =>
      key.toLowerCase().includes('scroll'),
    );
    expect(scrollish).toEqual([]);
  });

  it('step applies the move command to the grave, so steering reaches the sim through the seam', () => {
    const run = createRun(7);
    const from = { x: run.grave.x, y: run.grave.y };
    stepping(run)(drift(1, -1));
    expect(run.grave.x).toBe(from.x + BASE_SPEED);
    expect(run.grave.y).toBe(from.y - BASE_SPEED);
  });

  it('step ages invulnerability by one tick', () => {
    const run = createRun(7);
    run.grave.invulnerable = 5;
    stepping(run)(STILL);
    expect(run.grave.invulnerable).toBe(4);
  });

  it('a run advanced N ticks with a fixed command sequence lands in exactly the same state as another run on the same seed (ADR 0012)', () => {
    const script = [
      drift(1, 0),
      drift(0, -1),
      drift(-0.5, 0.5),
      STILL,
      drift(0.25, 1),
    ];
    const a = createRun(11);
    const b = createRun(11);
    const stepA = stepping(a);
    const stepB = stepping(b);
    for (let i = 0; i < 200; i++) {
      const command = requireDefined(
        script[i % script.length],
        `no scripted command at tick ${i}`,
      );
      stepA(command);
      stepB(command);
    }
    expect(snapshot(a)).toEqual(snapshot(b));
  });

  // The ?seed= half of ADR 0012 is paid: src/app/seedFromUrl.test.ts holds it,
  // because the parsing is the app's and this file is the sim's.
});

/** A run whose stage will not spawn on top of the one entity a test placed. */
function quietRun(seed = 21): RunState {
  const run = createRun(seed);
  run.stage.firedWaves = PROCESSION_WAVES.length;
  return run;
}

/** A mob standing exactly on the grave, so this tick's overlap pass finds it. */
function mobOnGrave(state: RunState, offsetY = 0): Mob {
  const mob = spawnMob(
    state,
    'shambler',
    {
      x: state.grave.x,
      y: state.grave.y + offsetY,
      vx: 0,
      vy: 1,
      index: 0,
    },
    false,
    'wave',
  )!;
  // Past its beat, so it is not still flying an entry when the pass runs.
  mob.beat = 0;
  return mob;
}

/**
 * A body that appeared inside the field, standing on the grave, with its own
 * arriving beat untouched. It is the placement the pour makes: below the top
 * edge, so nothing crossed an edge for the player to read.
 */
function insideTheField(state: RunState): Mob {
  return spawnMob(
    state,
    'shambler',
    { x: state.grave.x, y: state.grave.y, vx: 0, vy: 1, index: 0 },
    false,
    'wave',
  )!;
}

/**
 * A body straddling the top edge, which is where every formation places one. Its
 * top edge is outside the field, so it has not entered and its beat has not
 * started.
 */
function acrossTheTopEdge(state: RunState): Mob {
  return spawnMob(
    state,
    'shambler',
    { x: state.grave.x, y: 0, vx: 0, vy: 1, index: 0 },
    false,
    'wave',
  )!;
}

/** Holds a body on the grave, so a fall cannot carry it out of the box mid-beat. */
function holdOnGrave(state: RunState, mob: Mob): void {
  mob.x = state.grave.x;
  mob.y = state.grave.y;
}

/** A shot sitting on the grave, put there by hand rather than fired from off screen. */
function shotOnGrave(state: RunState) {
  const shot = requireDefined(state.mobFire[0], 'no mobFire pool slot 0');
  shot.alive = true;
  shot.id = state.nextEntityId;
  state.nextEntityId += 1;
  shot.emitter = 'revenant';
  shot.x = state.grave.x;
  shot.y = state.grave.y;
  shot.vx = 0;
  shot.vy = 0;
  shot.halfExtent = MOB_TYPES.revenant.fire.shotHalfExtent;
  return shot;
}

function typesOf(events: readonly SimEvent[]): string[] {
  return events.map((event) => event.type);
}

describe('the tick order (dispatch 4 section 4.9)', () => {
  it('swallows a corpse at zero freshness the grave is under this tick, rather than taking it under', () => {
    // Overlap before decay, asserted by consequence rather than by spying.
    // Greed that arrives on the last tick is rewarded, which is the direction
    // ADR 0004 already leans by giving freshness a payout floor.
    const state = quietRun();
    const step = stepping(state);
    const dead = spawnMob(
      state,
      'shambler',
      {
        x: state.grave.x,
        y: state.grave.y,
        vx: 0,
        vy: 1,
        index: 0,
      },
      false,
      'wave',
    )!;
    dead.alive = false;
    leaveCorpse(state, dead);
    const corpse = state.corpses.find((each) => each.alive)!;
    corpse.freshness = 0;

    const events = step(STILL);
    expect(typesOf(events)).toContain('swallowed');
    expect(typesOf(events)).not.toContain('corpseExpired');
    expect(corpse.alive).toBe(false);
  });

  it("ages the grave last, so a hit's window lasts exactly INVULNERABLE_TICKS", () => {
    const state = quietRun();
    const step = stepping(state);
    mobOnGrave(state);
    step(STILL);
    expect(state.grave.invulnerable).toBe(INVULNERABLE_TICKS - 1);
  });
});

describe('what meets the grave (ADR 0003 and ADR 0014)', () => {
  it('shrinks the grave through hitGrave when mob fire lands, and consumes the shot', () => {
    const state = quietRun();
    const step = stepping(state);
    const shot = shotOnGrave(state);
    const before = state.grave.size;

    const events = step(STILL);
    expect(typesOf(events)).toContain('graveHit');
    expect(state.grave.size).toBe(before - HIT_SHRINK);
    expect(shot.alive).toBe(false);
  });

  it('consumes a shot that overlaps an invulnerable grave, so one shot can never become two hits', () => {
    const state = quietRun();
    const step = stepping(state);
    state.grave.invulnerable = INVULNERABLE_TICKS;
    const shot = shotOnGrave(state);
    const before = state.grave.size;

    const first = step(STILL);
    expect(typesOf(first)).not.toContain('graveHit');
    expect(shot.alive).toBe(false);

    const later: SimEvent[] = [];
    for (let tick = 0; tick < INVULNERABLE_TICKS + 5; tick++) {
      later.push(...step(STILL));
    }
    expect(typesOf(later)).not.toContain('graveHit');
    expect(state.grave.size).toBe(before);
  });

  it('shrinks the grave on mob contact and leaves the mob on the field', () => {
    const state = quietRun();
    const step = stepping(state);
    const mob = mobOnGrave(state);
    const before = state.grave.size;

    const events = step(STILL);
    expect(typesOf(events)).toContain('graveHit');
    expect(state.grave.size).toBe(before - HIT_SHRINK);
    expect(mob.alive).toBe(true);
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp);
  });

  it('names the mob type that fired the shot on the hit it lands', () => {
    // Who hurt the player (#48): a shot's graveHit carries its emitter, which
    // the shot record has held since it was fired.
    const state = quietRun();
    const step = stepping(state);
    shotOnGrave(state);

    const hits = step(STILL).filter((event) => event.type === 'graveHit');
    expect(hits).toEqual([
      expect.objectContaining({ type: 'graveHit', source: 'revenant' }),
    ]);
  });

  it('names a body hit contact', () => {
    // Who hurt the player (#48): the other way a mob hurts the grave.
    const state = quietRun();
    const step = stepping(state);
    mobOnGrave(state);

    const hits = step(STILL).filter((event) => event.type === 'graveHit');
    expect(hits).toEqual([
      expect.objectContaining({ type: 'graveHit', source: 'contact' }),
    ]);
  });

  it('holds a body that appeared inside the field off the grave until its arriving beat has run', () => {
    // A body placed below the top edge has no crossing to show the player, so
    // it can materialise inside the grave's own box. The arriving beat is the
    // telegraph a body that comes over the edge gets for free, and contact
    // waits for it.
    const state = quietRun();
    const step = stepping(state);
    const mob = insideTheField(state);
    expect(mob.beat).toBe(ARRIVE_TICKS);

    const during: SimEvent[] = [];
    for (let tick = 0; tick < ARRIVE_TICKS - 1; tick++) {
      holdOnGrave(state, mob);
      during.push(...step(STILL));
    }
    expect(typesOf(during)).not.toContain('graveHit');
    expect(mob.beat).toBe(1);

    holdOnGrave(state, mob);
    expect(typesOf(step(STILL))).toContain('graveHit');
  });

  it('lets a body that crossed the top edge touch the grave during its arriving beat, as it always has', () => {
    // The fence under the glossary's "movement only": a body that arrives over
    // the edge is unchanged and touches from the tick it overlaps, beat or no
    // beat. What the beat now governs at contact is the body that appears
    // inside the field, and nothing else.
    const state = quietRun();
    const step = stepping(state);
    state.grave.y = state.grave.size;
    const mob = acrossTheTopEdge(state);
    expect(mob.beat).toBe(ARRIVE_TICKS);

    const hits = step(STILL).filter((event) => event.type === 'graveHit');
    expect(mob.beat).toBe(ARRIVE_TICKS);
    expect(hits).toEqual([
      expect.objectContaining({ type: 'graveHit', source: 'contact' }),
    ]);
  });

  it('lands nothing on a second contact inside the invulnerability window', () => {
    const state = quietRun();
    const step = stepping(state);
    mobOnGrave(state, -6);
    mobOnGrave(state, 6);
    const box = graveHitbox(state.grave);
    expect(box.height).toBeGreaterThan(12);

    const events = step(STILL);
    expect(events.filter((event) => event.type === 'graveHit')).toHaveLength(1);
  });
});

describe('determinism across the whole field (ADR 0012)', () => {
  it('produces the same events in the same order for one seed, because pools are walked in slot order', () => {
    const script = [drift(1, 0), drift(0, -1), drift(-1, 0.5), STILL];
    const a = createRun(5150);
    const b = createRun(5150);
    const stepA = stepping(a);
    const stepB = stepping(b);
    const eventsA: SimEvent[] = [];
    const eventsB: SimEvent[] = [];
    for (let tick = 0; tick < 1500; tick++) {
      const command = requireDefined(
        script[tick % script.length],
        `no scripted command at tick ${tick}`,
      );
      eventsA.push(...stepA(command));
      eventsB.push(...stepB(command));
    }
    expect(eventsA.length).toBeGreaterThan(0);
    expect(JSON.stringify(eventsA)).toBe(JSON.stringify(eventsB));
    expect(snapshot(a)).toEqual(snapshot(b));
  });
});

describe('the belch in the tick order (plan 6.13)', () => {
  it('cancels a shot that would have hit this tick', () => {
    // The whole argument for running the belch before overlap resolution. A
    // bomb pressed on the frame a shot would land has to save the player, or
    // the button is a lie at the only moment it matters. Ordering the belch
    // after resolveOverlaps makes this fail, which is the point of the test.
    const state = quietRun();
    const step = stepping(state);
    state.reservoir = RESERVOIR_CAPACITY;
    const shot = shotOnGrave(state);
    const before = state.grave.size;

    const events = step({ move: { x: 0, y: 0 }, belch: true });
    expect(typesOf(events)).toContain('belched');
    expect(typesOf(events)).not.toContain('graveHit');
    expect(state.grave.size).toBe(before);
    expect(shot.alive).toBe(false);
  });

  it("brings a press's later shoves out on the press's own beat, over what stands inside the reach then", () => {
    // The press's own clock is a phase of the tick, immediately before the
    // belch itself (#124). Run through the whole tick rather than through the
    // belch alone, because that placement is the thing under test: a shove
    // firing later in the tick than the press did would read the field after
    // the spawns and the motion the press itself ran before, and a clock
    // counting on the press's own tick would bring every later shove in a tick
    // early.
    const state = quietRun();
    const step = stepping(state);
    state.reservoir = RESERVOIR_CAPACITY;
    const latecomer = mobOnGrave(state, -BELCH_BURST_RADIUS * 2);
    // It stands exactly where it is put while the tick runs, so what moves it
    // is the press and nothing else, and it outlives a window the whole tick
    // runs through.
    latecomer.beat = Number.MAX_SAFE_INTEGER;
    latecomer.vy = 0;
    latecomer.hp = Number.MAX_SAFE_INTEGER;

    step({ move: { x: 0, y: 0 }, belch: true });
    for (let tick = 1; tick < BELCH_SHOVE_SPACING; tick++) step(STILL);
    latecomer.x = state.grave.x;
    latecomer.y = state.grave.y - BELCH_BURST_RADIUS / 2;
    const stoodAt = { x: latecomer.x, y: latecomer.y };
    const events = step(STILL);

    const shove = events.find((event) => event.type === 'burstShoved');
    expect(shove?.shove).toBe(2);
    expect(latecomer.impulse.source).toBe('belch');
    // It travelled up the field on the very tick the shove went out, against
    // the scroll that carries everything down, which is what puts the clock
    // before the bodies rather than after them.
    expect(latecomer.y).toBeLessThan(stoodAt.y);
  });

  it('does nothing at all when the command does not ask for one', () => {
    const state = quietRun();
    const step = stepping(state);
    state.reservoir = RESERVOIR_CAPACITY;
    shotOnGrave(state);
    const events = step(STILL);
    expect(typesOf(events)).not.toContain('belched');
    expect(state.reservoir).toBe(RESERVOIR_CAPACITY);
  });

  it("still runs before every overlap pass with a boss's pattern on the field", () => {
    // The same argument, guarded through the boss's arrival in the tick order.
    // A boss's shots are on the same pool as a mob's, so the gas has to take
    // them on the frame they would land or the button becomes a lie at the one
    // moment a boss fight makes it matter most.
    const state = quietRun();
    const step = stepping(state);
    state.reservoir = RESERVOIR_CAPACITY;
    spawnBoss(state, 'undertaker');
    const clod = shotOnGrave(state);
    clod.emitter = 'undertaker';
    clod.kind = 'clod';
    const before = state.grave.size;

    const events = step({ move: { x: 0, y: 0 }, belch: true });

    expect(typesOf(events)).toContain('belched');
    expect(typesOf(events)).not.toContain('graveHit');
    expect(state.grave.size).toBe(before);
    expect(clod.alive).toBe(false);
  });
});

describe("a boss's fire in the tick order (ADR 0007)", () => {
  it('shares the one shot pool and the one cull with a mob', () => {
    // A boss's pattern is mob fire by the glossary's own definition, so it
    // takes slots from the same pool, flies under the same advance and leaves
    // by the same cull. A second pool would need a second cap, a second cull
    // and a second renderer, and the cap the mob fire pool already carries is
    // what bounds what a fight can put on the field.
    const state = quietRun();
    const step = stepping(state);
    const trash = shotOnGrave(state);
    trash.x = 40;
    trash.y = 20;
    trash.vy = 0;
    trash.vx = -MOB_TYPES.revenant.fire.shotSpeed;

    fireDirectedShot(
      state,
      { x: 60, y: 20 },
      { x: -1, y: 0 },
      MOB_TYPES.revenant.fire,
      'undertaker',
      'clod',
    );
    const live = state.mobFire.filter((shot) => shot.alive);
    expect(live).toHaveLength(2);
    expect(live.map((shot) => shot.kind)).toEqual(['trash', 'clod']);

    // Both fly off the same left edge, and the same cull takes them on the
    // same tick.
    for (let tick = 0; tick < 40; tick++) step(STILL);
    expect(state.mobFire.filter((shot) => shot.alive)).toEqual([]);
  });
});

describe('the weapon lines in the tick order (plan 6.13)', () => {
  it('launches a skull at the mouth and does not move it on the tick it launches', () => {
    // The same rule mob fire already has, which is what makes the stream read
    // as pouring out of the grave rather than appearing above it.
    const state = quietRun();
    const step = stepping(state);
    state.lines.streamIn = 1;
    const mouth = { x: state.grave.x, y: state.grave.y - state.grave.size };
    step(STILL);
    const live = state.skulls.filter((skull) => skull.alive);
    expect(live).toHaveLength(1);
    const skull = requireDefined(live[0], 'no live skull');
    expect({ x: skull.x, y: skull.y }).toEqual(mouth);
  });

  it("runs the lines after mob motion, so this tick's storm meets this tick's mobs", () => {
    const state = quietRun();
    const step = stepping(state);
    state.lines.streamIn = 1;
    const above = spawnMob(
      state,
      'shambler',
      {
        x: state.grave.x,
        y: state.grave.y - state.grave.size - 4,
        vx: 0,
        vy: 1,
        index: 0,
      },
      false,
      'wave',
    )!;
    above.beat = 0;
    above.hp = 1;

    // The skull launches at the mouth this tick and the deaths section runs after
    // it, so a mob standing on the mouth dies on the launch tick.
    const events = step(STILL);
    expect(typesOf(events)).toContain('mobKilled');
  });

  it("opens one offer for every carrier the tick killed, the bell's included", () => {
    const state = quietRun();
    const step = stepping(state);
    state.levels.bell = MAX_LEVEL;
    state.lines.tollIn = 1;
    const victim = spawnMob(
      state,
      'shambler',
      { x: state.grave.x, y: state.grave.y - 20, vx: 0, vy: 1, index: 0 },
      true,
      'wave',
    )!;
    victim.beat = 0;
    // Standing a little ahead of the grave rather than on it, because a toll
    // throws cones (ADR 0036) and a mob that drifts below the grave sits in
    // the one slit a level-5 toll leaves open, dead astern.
    //
    // One point of health, because BELL_DAMAGE_NEAR is one shambler exactly
    // and a mob has already drifted a little by the time the toll's first
    // expansion reaches it, so a full-health shambler survives by a sliver.
    victim.hp = 1;

    // The deaths pass walks the tick's whole accumulated list of kills, and
    // the bell resolves two sections before it, so a carrier the toll killed
    // pays exactly as one the overlap pass killed does.
    let killed = 0;
    let paid = 0;
    for (let tick = 0; tick < BELL_EXPAND_TICKS + 2; tick++) {
      const types = typesOf(step(STILL));
      killed += types.filter((type) => type === 'mobKilled').length;
      paid += types.filter((type) => type === 'offerOpened').length;
    }
    expect(killed).toBe(1);
    expect(paid).toBe(1);
  });
});

describe('a belch pays nothing, because it kills nothing (Mark, 2026-09-15)', () => {
  it('opens no offer and leaves the whole wave standing', () => {
    // Mark's ruling 3 of 2026-09-15 and ADR 0008 as amended replaced the burst
    // with a push, so the press that used to pay a carrier's offer by killing
    // it now throws it instead. This is the guard on that absence: it fails the
    // day a press kills anything again, whether or not the offer follows.
    //
    // The wave stands inside the reach rather than up the field, because ADR
    // 0008's split scoped the press to a radius of the grave and a wave laid
    // anywhere else is one the belch does not touch at all.
    const state = quietRun();
    const step = stepping(state);
    state.reservoir = RESERVOIR_CAPACITY;
    const wave = 5;
    // The carrier stands in the middle of the wave, where the old burst would
    // have killed it along with the four beside it.
    const carrier = 2;
    for (let index = 0; index < wave; index++) {
      spawnMob(
        state,
        'shambler',
        {
          x: state.grave.x - 48 + index * 24,
          y: state.grave.y - 40,
          vx: 0,
          vy: 1,
          index,
        },
        index === carrier,
        'wave',
      )!.beat = 0;
    }

    const events = step({ move: { x: 0, y: 0 }, belch: true });

    expect(typesOf(events)).toContain('belched');
    expect(typesOf(events).filter((type) => type === 'mobKilled')).toEqual([]);
    expect(typesOf(events).filter((type) => type === 'offerOpened')).toEqual(
      [],
    );
    expect(state.mobs.filter((mob) => mob.alive)).toHaveLength(wave);
  });
});

describe('a corpse swallowed while a shove is carrying it (design record R10)', () => {
  it('reports what it was carried and stops carrying it', () => {
    // The third exit. A swallow kills a corpse where it stands, so without a
    // report here a live impulse would leave the world unreported and uncleared
    // and the slot would hand the leftovers to the next food that claimed it.
    const state = quietRun();
    const step = stepping(state);
    const dead = spawnMob(
      state,
      'shambler',
      { x: state.grave.x, y: state.grave.y, vx: 0, vy: 1, index: 0 },
      false,
      'wave',
    )!;
    dead.alive = false;
    leaveCorpse(state, dead);
    const corpse = requireDefined(
      state.corpses.find((each) => each.alive),
      'no corpse to swallow',
    );
    // Sideways, so the throw does not carry it out from under the grave before
    // the swallow pass reaches it.
    startShove(corpse.impulse, 'belch', dead.id, 1, 0, 60, 1, 0);

    const events = step(STILL);

    expect(typesOf(events)).toContain('swallowed');
    expect(corpse.alive).toBe(false);
    expect(corpse.impulse).toEqual(blankImpulse());
    const shoved = events.filter((event) => event.type === 'mobShoved');
    expect(shoved).toHaveLength(1);
    expect(shoved[0]?.type === 'mobShoved' && shoved[0].id).toBe(dead.id);
  });
});

/** A corpse standing exactly here, left by a body killed on the spot. */
function corpseAt(state: RunState, x: number, y: number): Corpse {
  const dead = spawnMob(
    state,
    'shambler',
    { x, y, vx: 0, vy: 1, index: 0 },
    false,
    'wave',
  )!;
  dead.alive = false;
  leaveCorpse(state, dead);
  return requireDefined(
    state.corpses.filter((each) => each.alive).at(-1),
    `no corpse at ${x}, ${y}`,
  );
}

/**
 * The x a body of this half extent stands at to lie across the grave's left
 * rim with exactly `over` of its width on the mouth, worked from the mouth's
 * own box rather than from the grave's numbers.
 */
function acrossTheLeftRim(
  state: RunState,
  over: number,
  halfExtent: number,
): number {
  return graveHitbox(state.grave).x + over - halfExtent;
}

/** The one live body on the field, which is how these tests name what they staged. */
function stagedFood(state: RunState): Corpse {
  const live = state.corpses.filter((corpse) => corpse.alive);
  return requireDefined(
    live[0],
    `expected one piece of food, found ${live.length}`,
  );
}

describe('food goes in when most of it is over the mouth (grave-in-the-ground R1 and R2)', () => {
  it('leaves a corpse with only a sliver over the rim on the ground', () => {
    // R1: a sliver over the edge never reaches the threshold. Two of the
    // corpse's fourteen is a share of 0.143 against the record's 0.55, and the
    // rule this replaces took it on the first touch.
    const state = quietRun();
    const step = stepping(state);
    const corpse = corpseAt(
      state,
      acrossTheLeftRim(state, 2, CORPSE_HALF_EXTENT),
      state.grave.y,
    );

    const events = step(STILL);

    expect(typesOf(events)).not.toContain('swallowed');
    expect(corpse.alive).toBe(true);
  });

  it('lets a corpse with only a sliver over the rim rot away, and reports the loss', () => {
    // Agent's call A2 in R1: food that runs out of freshness before it reaches
    // the threshold is lost exactly as it is today. The rim is not a block and
    // it is not a holding pen either.
    const state = quietRun();
    const step = stepping(state);
    const corpse = corpseAt(
      state,
      acrossTheLeftRim(state, 2, CORPSE_HALF_EXTENT),
      state.grave.y,
    );
    corpse.freshness = FRESHNESS_PER_TICK / 2;

    const events = step(STILL);

    expect(typesOf(events)).not.toContain('swallowed');
    const rotted = events.find((event) => event.type === 'corpseExpired');
    expect(rotted?.type === 'corpseExpired' && rotted.kind).toBe('corpse');
    expect(corpse.alive).toBe(false);
  });

  it('swallows a corpse eight of its fourteen across the rim, and not one seven across', () => {
    // The threshold itself, from either side: 8 over 14 is 0.571 and goes in,
    // 7 over 14 is a flat half and stays out. Both touch the mouth, so the old
    // first-touch rule took both.
    const taken = quietRun();
    const corpseTaken = corpseAt(
      taken,
      acrossTheLeftRim(taken, 8, CORPSE_HALF_EXTENT),
      taken.grave.y,
    );
    const left = quietRun();
    const corpseLeft = corpseAt(
      left,
      acrossTheLeftRim(left, 7, CORPSE_HALF_EXTENT),
      left.grave.y,
    );

    expect(typesOf(stepping(taken)(STILL))).toContain('swallowed');
    expect(corpseTaken.alive).toBe(false);
    expect(typesOf(stepping(left)(STILL))).not.toContain('swallowed');
    expect(corpseLeft.alive).toBe(true);
  });

  it('pays the growth and the score on the tick of the tip and on no tick before it', () => {
    // R2: the tip is where every payout lands, and the tip is later than the
    // first touch now. The grave stands a hair under the ceiling so one swallow
    // pays growth and overflows the rest into score, and the corpse walks down
    // into the mouth on the scroll alone.
    const state = quietRun();
    state.grave.size = SIZE_CEILING - 0.001;
    const step = stepping(state);
    const mouth = graveHitbox(state.grave);
    const corpse = corpseAt(state, state.grave.x, mouth.y - CORPSE_HALF_EXTENT);

    let firstTouch: number | null = null;
    let tipped: number | null = null;
    const paidBeforeTheTip: string[] = [];
    for (let tick = 0; tick < 60 && tipped === null; tick++) {
      const events = step(STILL);
      const touching =
        corpse.alive &&
        corpse.y + CORPSE_HALF_EXTENT > graveHitbox(state.grave).y;
      if (touching && firstTouch === null) firstTouch = tick;
      if (typesOf(events).includes('swallowed')) {
        tipped = tick;
        expect(typesOf(events)).toContain('grew');
        expect(typesOf(events)).toContain('overflowed');
        continue;
      }
      for (const event of events) {
        if (event.type === 'grew' || event.type === 'overflowed') {
          paidBeforeTheTip.push(`${event.type} on tick ${tick}`);
        }
      }
    }

    expect(paidBeforeTheTip).toEqual([]);
    expect(firstTouch).not.toBeNull();
    expect(tipped).not.toBeNull();
    expect(tipped ?? 0).toBeGreaterThan(firstTouch ?? 0);
  });

  it('swallows a power-up wider than a floor-size grave once the mouth is under it, and not before', () => {
    // ADR 0003: size never gates a swallow. A power-up is 28 wide against a
    // mouth 18 wide at the floor, and the division is what keeps that true: the
    // whole mouth under it is a share of one, and eight of the mouth's eighteen
    // is 0.444 and stays out.
    const taken = quietRun();
    taken.grave.size = SIZE_FLOOR;
    spawnPowerUp(taken, taken.grave.x, taken.grave.y);
    const left = quietRun();
    left.grave.size = SIZE_FLOOR;
    spawnPowerUp(
      left,
      acrossTheLeftRim(left, 8, POWER_UP_HALF_EXTENT),
      left.grave.y,
    );

    expect(typesOf(stepping(taken)(STILL))).toContain('swallowed');
    expect(typesOf(stepping(left)(STILL))).not.toContain('swallowed');
    expect(stagedFood(left).alive).toBe(true);
  });

  it('holds a feast and a fallen rung to the same rule as a corpse', () => {
    // R1: every kind of food follows the one rule (agent's call A4). A feast
    // carries the corpse's own box and a fallen rung carries the power-up's, so
    // the two are staged at their own widths and not at one number.
    const feastOut = quietRun();
    spawnFeast(
      feastOut,
      acrossTheLeftRim(feastOut, 2, CORPSE_HALF_EXTENT),
      feastOut.grave.y,
      1,
    );
    const feastIn = quietRun();
    spawnFeast(
      feastIn,
      acrossTheLeftRim(feastIn, 8, CORPSE_HALF_EXTENT),
      feastIn.grave.y,
      1,
    );
    const rungOut = quietRun();
    spawnFallenRung(
      rungOut,
      acrossTheLeftRim(rungOut, 4, POWER_UP_HALF_EXTENT),
      rungOut.grave.y,
      'bell',
    );
    const rungIn = quietRun();
    spawnFallenRung(
      rungIn,
      acrossTheLeftRim(rungIn, 20, POWER_UP_HALF_EXTENT),
      rungIn.grave.y,
      'bell',
    );

    expect(typesOf(stepping(feastOut)(STILL))).not.toContain('swallowed');
    expect(typesOf(stepping(feastIn)(STILL))).toContain('swallowed');
    expect(typesOf(stepping(rungOut)(STILL))).not.toContain('swallowed');
    expect(typesOf(stepping(rungIn)(STILL))).toContain('swallowed');
  });

  it('swallows a corpse on the field side edge under a grave flush to that edge', () => {
    // R1's edge ruling: both halves of the division count only what is inside
    // the field. Half the corpse is off the field and can never be over any
    // mouth, so what is left is wholly over it. Without the clip this corpse
    // reads a flat half at every grave size and could never go in.
    const state = quietRun();
    state.grave.x = graveWidth(state.grave.size) / 2;
    const step = stepping(state);
    const corpse = corpseAt(state, 0, state.grave.y);

    expect(typesOf(step(STILL))).toContain('swallowed');
    expect(corpse.alive).toBe(false);
  });

  it('never swallows food lying wholly outside the field', () => {
    // The other end of the same ruling: nothing of it could be over any mouth,
    // so the share is zero rather than a division by nothing.
    const state = quietRun();
    state.grave.x = graveWidth(state.grave.size) / 2;
    const step = stepping(state);
    const corpse = corpseAt(state, -CORPSE_HALF_EXTENT * 3, state.grave.y);

    expect(typesOf(step(STILL))).not.toContain('swallowed');
    expect(corpse.alive).toBe(true);
  });

  it('swallows a corpse that reaches the threshold on its last tick of freshness', () => {
    // R1 keeps freshness's place in the tick: the swallow check still runs
    // before decay, so greed that arrives on the last tick is rewarded rather
    // than taken under.
    const state = quietRun();
    const step = stepping(state);
    const corpse = corpseAt(
      state,
      acrossTheLeftRim(state, 8, CORPSE_HALF_EXTENT),
      state.grave.y,
    );
    corpse.freshness = FRESHNESS_PER_TICK / 2;

    const events = step(STILL);

    expect(typesOf(events)).toContain('swallowed');
    expect(typesOf(events)).not.toContain('corpseExpired');
    expect(corpse.alive).toBe(false);
  });

  it('reads the threshold off the run own tuning record', () => {
    // The threshold is a data row and never a constant in the rule, so a run
    // started under a record that asks for nine tenths leaves out the very
    // corpse the default record takes.
    const state = createRun(21, {
      tuning: resolveTuning({ swallow: { tipThreshold: 0.9 } }),
    });
    state.stage.firedWaves = PROCESSION_WAVES.length;
    const step = stepping(state);
    const corpse = corpseAt(
      state,
      acrossTheLeftRim(state, 8, CORPSE_HALF_EXTENT),
      state.grave.y,
    );

    expect(typesOf(step(STILL))).not.toContain('swallowed');
    expect(corpse.alive).toBe(true);
  });
});

/** The x a body of this half extent stands at to leave `gap` between its box and the mouth. */
function shortOfTheLeftRim(
  state: RunState,
  gap: number,
  halfExtent: number,
): number {
  return acrossTheLeftRim(state, -gap, halfExtent);
}

/** A quiet run playing under a record that moves one row of the pull's three. */
function tunedRun(overlay: TuningOverlay): RunState {
  const run = createRun(21, { tuning: resolveTuning(overlay) });
  run.stage.firedWaves = PROCESSION_WAVES.length;
  return run;
}

/**
 * A corpse standing exactly here and carrying a shove, staged the one way the
 * rules allow: a body killed in mid-shove hands its impulse over to the corpse
 * it leaves (corpses.ts, handOverImpulse). A shove never lands on food.
 */
function shovedCorpseAt(
  state: RunState,
  x: number,
  y: number,
  awayX: number,
  awayY: number,
): Corpse {
  const dead = spawnMob(
    state,
    'shambler',
    { x, y, vx: 0, vy: 1, index: 0 },
    false,
    'wave',
  )!;
  startShove(dead.impulse, 'belch', dead.id, awayX, awayY, 60, 1, 0);
  dead.alive = false;
  leaveCorpse(state, dead);
  return requireDefined(
    state.corpses.filter((each) => each.alive).at(-1),
    `no corpse at ${x}, ${y}`,
  );
}

describe('the pull in the tick order (grave-in-the-ground R3)', () => {
  it('swallows a corpse the pull carries to the threshold this tick', () => {
    // R3: the pull runs immediately before the overlaps resolve, so the share
    // the swallow reads is the one the pull left. The corpse lies 7.6 of its 14
    // across the rim, a share of 0.543 against the record's 0.55, and the first
    // tick of the pull at the rim is 0.154, which carries it to 0.554.
    const pulled = quietRun();
    const pulledCorpse = corpseAt(
      pulled,
      acrossTheLeftRim(pulled, 7.6, CORPSE_HALF_EXTENT),
      pulled.grave.y,
    );
    const still = tunedRun({ swallow: { pullStrength: 0 } });
    const stillCorpse = corpseAt(
      still,
      acrossTheLeftRim(still, 7.6, CORPSE_HALF_EXTENT),
      still.grave.y,
    );

    expect(typesOf(stepping(pulled)(STILL))).toContain('swallowed');
    expect(pulledCorpse.alive).toBe(false);
    expect(typesOf(stepping(still)(STILL))).not.toContain('swallowed');
    expect(stillCorpse.alive).toBe(true);
  });

  it('adds a shove and the pull in one tick, neither counted twice', () => {
    // R3: the shove writes no velocity and the pull writes no impulse, so the
    // two displacements add. The shove is thrown down the field and the pull
    // reaches sideways, so each axis carries one of them: x moves by exactly
    // the velocity the pull left, and y moves by the scroll and the shove the
    // same corpse travels with the pull turned off, plus that velocity.
    const both = quietRun();
    const carried = shovedCorpseAt(
      both,
      shortOfTheLeftRim(both, 12, CORPSE_HALF_EXTENT),
      both.grave.y,
      0,
      1,
    );
    const from = { x: carried.x, y: carried.y };
    const shoveOnly = tunedRun({ swallow: { pullStrength: 0 } });
    const thrown = shovedCorpseAt(
      shoveOnly,
      shortOfTheLeftRim(shoveOnly, 12, CORPSE_HALF_EXTENT),
      shoveOnly.grave.y,
      0,
      1,
    );
    const thrownFrom = thrown.y;

    stepping(both)(STILL);
    stepping(shoveOnly)(STILL);

    const travelled = thrown.y - thrownFrom;
    expect(travelled).toBeGreaterThan(SCROLL_SPEED);
    expect(thrown.vy).toBe(0);
    expect(carried.vx).toBeGreaterThan(0);
    expect(carried.x - from.x).toBeCloseTo(carried.vx, 9);
    expect(carried.y - from.y).toBeCloseTo(travelled + carried.vy, 9);
  });

  it('lets a shove away from the grave carry a corpse off the rim', () => {
    // R3: a bell or belch shove can carry food off the rim before the tip, and
    // after the tip nothing moves it because it is no longer in the rules. The
    // throw's first tick is 3.87 against the pull's 0.15 at the rim, so the
    // corpse leaves and the pull only slows its going.
    const state = quietRun();
    const step = stepping(state);
    const corpse = shovedCorpseAt(
      state,
      acrossTheLeftRim(state, 5, CORPSE_HALF_EXTENT),
      state.grave.y,
      -1,
      0,
    );
    const from = corpse.x;

    const seen: string[] = [];
    for (let tick = 0; tick < 3; tick++) seen.push(...typesOf(step(STILL)));

    expect(seen).not.toContain('swallowed');
    expect(corpse.alive).toBe(true);
    expect(corpse.x).toBeLessThan(from);
    expect(corpse.x + CORPSE_HALF_EXTENT).toBeLessThan(
      graveHitbox(state.grave).x,
    );
  });
});
