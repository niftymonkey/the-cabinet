/**
 * The sim seam (tracer plan section 3). Every test here steps through the one
 * execution authority (ADR 0017), and stepping() fails the test on any fault
 * the run records, which is ADR 0013's invariants checked on every step.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { stepping } from '../../dev/stepping';
import { spawnCorpse } from '../corpses';
import { priceOfNextDrop } from '../drops';
import type { SimEvent } from '../events';
import { graveHitbox } from '../grave';
import type { Mob } from '../mobs';
import { MOB_TYPES, spawnMob } from '../mobs';
import type { TickCommand } from '../command';
import type { RunState } from '../run';
import { createRun } from '../run';
import { RAMP_ROWS } from '../stage/stage';
import { BELL_EXPAND_TICKS } from '../lines/bell';
import { MAX_LEVEL } from '../lines/roster';
import {
  BASE_SPEED,
  HIT_SHRINK,
  INVULNERABLE_TICKS,
  RESERVOIR_CAPACITY,
  SCROLL_SPEED,
} from '../tuning';

/** A tick that only steers, which is every tick these tests are about. */
function drift(x: number, y: number): TickCommand {
  return { move: { x, y }, belch: false };
}

const STILL: TickCommand = drift(0, 0);

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
    lines: {
      ...run.lines,
      stoneRecharge: [...run.lines.stoneRecharge],
      ring:
        run.lines.ring === null
          ? null
          : { ...run.lines.ring, struck: [...run.lines.ring.struck] },
    },
    killsSinceDrop: run.killsSinceDrop,
    dropsPaid: run.dropsPaid,
    drawn: {
      spawns: run.streams.spawns.drawn,
      drops: run.streams.drops.drawn,
      mobFire: run.streams.mobFire.drawn,
      shed: run.streams.shed.drawn,
    },
  };
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
      const command = script[i % script.length];
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
  run.stage.firedRows = RAMP_ROWS.length;
  return run;
}

/** A mob standing exactly on the grave, so this tick's overlap pass finds it. */
function mobOnGrave(state: RunState, offsetY = 0): Mob {
  const mob = spawnMob(state, 'shambler', {
    x: state.grave.x,
    y: state.grave.y + offsetY,
    vx: 0,
    vy: 1,
    index: 0,
  })!;
  // Past its beat, so it is not still flying an entry when the pass runs.
  mob.beat = 0;
  return mob;
}

/** A shot sitting on the grave, put there by hand rather than fired from off screen. */
function shotOnGrave(state: RunState) {
  const shot = state.mobFire[0];
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
    const dead = spawnMob(state, 'shambler', {
      x: state.grave.x,
      y: state.grave.y,
      vx: 0,
      vy: 1,
      index: 0,
    })!;
    dead.alive = false;
    spawnCorpse(state, dead);
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
      const command = script[tick % script.length];
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

  it('does nothing at all when the command does not ask for one', () => {
    const state = quietRun();
    const step = stepping(state);
    state.reservoir = RESERVOIR_CAPACITY;
    shotOnGrave(state);
    const events = step(STILL);
    expect(typesOf(events)).not.toContain('belched');
    expect(state.reservoir).toBe(RESERVOIR_CAPACITY);
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
    expect({ x: live[0].x, y: live[0].y }).toEqual(mouth);
  });

  it("runs the lines after mob motion, so this tick's storm meets this tick's mobs", () => {
    const state = quietRun();
    const step = stepping(state);
    state.lines.streamIn = 1;
    const above = spawnMob(state, 'shambler', {
      x: state.grave.x,
      y: state.grave.y - state.grave.size - 4,
      vx: 0,
      vy: 1,
      index: 0,
    })!;
    above.beat = 0;
    above.hp = 1;

    // The skull launches at the mouth this tick and the deaths phase runs after
    // it, so a mob standing on the mouth dies on the launch tick.
    const events = step(STILL);
    expect(typesOf(events)).toContain('mobKilled');
  });

  it("credits every kill the tick made, the bell's included", () => {
    const state = quietRun();
    const step = stepping(state);
    state.levels.bell = MAX_LEVEL;
    state.lines.tollIn = 1;
    const victim = spawnMob(state, 'shambler', {
      x: state.grave.x,
      y: state.grave.y,
      vx: 0,
      vy: 1,
      index: 0,
    })!;
    victim.beat = 0;
    // One point of health, because BELL_DAMAGE_NEAR is one shambler exactly and
    // a mob has already drifted a little by the time the ring's first expansion
    // reaches it, so a full-health shambler survives a centred toll by a sliver.
    victim.hp = 1;

    let killed = 0;
    for (let tick = 0; tick < BELL_EXPAND_TICKS + 2; tick++) {
      killed += typesOf(step(STILL)).filter(
        (type) => type === 'mobKilled',
      ).length;
    }
    expect(killed).toBeGreaterThan(0);
    expect(state.killsSinceDrop).toBe(killed);
  });
});

describe('a belch kill is a kill (Mark, 2026-08-22)', () => {
  it('credits its wipe toward the next drop, so a belch into a dense wave spawns a drop on the same tick', () => {
    // The reason the wipe routes through damageMob rather than clearing the
    // pool: resolveDeaths walks the tick's own accumulated kills, the belch's
    // included, so the eruption pays the drop economy instead of emptying the
    // field of it.
    const state = quietRun();
    const step = stepping(state);
    state.reservoir = RESERVOIR_CAPACITY;
    const wave = priceOfNextDrop(0);
    for (let index = 0; index < wave; index++) {
      spawnMob(state, 'shambler', {
        x: 40 + index * 24,
        y: 100,
        vx: 0,
        vy: 1,
        index,
      })!.beat = 0;
    }

    const events = step({ move: { x: 0, y: 0 }, belch: true });

    expect(typesOf(events).filter((type) => type === 'mobKilled')).toHaveLength(
      wave,
    );
    expect(typesOf(events)).toContain('dropSpawned');
    expect(state.dropsPaid).toBe(1);
    expect(state.killsSinceDrop).toBe(0);
  });
});
