/**
 * The Banshee's own grammar (ADR 0007, game-concept.md:68): two chunks of
 * expanding tear-rings each with one clean gap, the feast her death sheds, and
 * the Wall her death launches.
 *
 * The machine she stands on is chunks.ts's and is tested there. What is here is
 * hers: the emitter, the feast, and what her death starts.
 */

import { describe, expect, it } from 'vitest';

import bansheeSource from '../banshee.ts?raw';

import { fireBelch } from '../../belch';
import { TICK_HZ } from '../../clock';
import type { TickCommand } from '../../command';
import type { Corpse } from '../../corpses';
import { asSwallowable } from '../../corpses';
import type { SimEvent } from '../../events';
import type { Shot } from '../../mobFire';
import { atan2, normalize } from '../../math';
import { MOB_TYPES } from '../../mobs';
import type { RunState } from '../../run';
import { createRun } from '../../run';
import { CROWD_ROWS, PROCESSION_ROWS } from '../../stage/rows';
import { PHASES } from '../../stage/stage';
import { swallow } from '../../swallow';
import { RESERVOIR_CAPACITY, SCROLL_SPEED, SIZE_START } from '../../tuning';
import { stepping } from '../../../dev/stepping';
import { RING_ROWS, TEAR_FIRE } from '../banshee';
import type { Boss } from '../chunks';
import { advanceBoss, CHUNK_FLASH_TICKS, damageBoss } from '../chunks';

const SEED = 20260908;

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

/** The Wall's own row, so what its arrival looks like is read from the table. */
const WALL_ROW = CROWD_ROWS.find((row) => row.template === 'wall')!;

/** A fight in progress: the run, the boss, and one tick of it at a time. */
interface Fight {
  readonly state: RunState;
  readonly boss: Boss;
  /** One tick, with the grave restored after it. */
  readonly tick: () => readonly SimEvent[];
}

/**
 * A run played from the Banshee's arrival, with the grave held still and
 * immortal.
 *
 * She is reached through the stage's own boundary rather than put on the field
 * by hand: the Procession's rows are marked spent on a field with nothing alive
 * on it, which is exactly the condition its end names, so the first step is her
 * arrival as a run produces it.
 *
 * The grave is held because these are tests about her pattern and her death,
 * and a still grave under her rings would seal shut long before her second
 * chunk and stop the fight being measured.
 */
function atTheBanshee(seed = SEED): Fight {
  const state = createRun(seed);
  const step = stepping(state);
  state.stage.firedRows = PROCESSION_ROWS.length;
  const tick = (): readonly SimEvent[] => {
    const events = step(STILL);
    state.grave.size = SIZE_START;
    state.ending = null;
    return events;
  };
  tick();
  if (state.boss === null) throw new Error('the Banshee did not arrive');
  return { state, boss: state.boss, tick };
}

/** Every event of a kind a tick reported, in order. */
function only<T extends SimEvent['type']>(
  events: readonly SimEvent[],
  type: T,
): Extract<SimEvent, { type: T }>[] {
  return events.filter(
    (event): event is Extract<SimEvent, { type: T }> => event.type === type,
  );
}

/** The next tick of this fight that throws a ring, and what it threw. */
function nextRing(fight: Fight): Extract<SimEvent, { type: 'mobFired' }>[] {
  for (let tick = 1; tick <= RING_ROWS[0].period * 4; tick++) {
    const fired = only(fight.tick(), 'mobFired');
    if (fired.length > 0) return fired;
  }
  throw new Error('the Banshee threw no ring');
}

/** Where a shot is heading, in turns clockwise from straight down. */
function bearingOf(shot: { vx: number; vy: number }): number {
  const turns = atan2(shot.vx, shot.vy) / (2 * Math.PI);
  return turns < 0 ? turns + 1 : turns;
}

/**
 * The steps between one ring's bearings, in turns, walked around the circle, so
 * the ring's own even spacing and its one opening are both readable.
 */
function gapsAround(bearings: readonly number[]): number[] {
  const sorted = [...bearings].sort((a, b) => a - b);
  return sorted.map((bearing, index) =>
    index === 0
      ? bearing + 1 - sorted[sorted.length - 1]
      : bearing - sorted[index - 1],
  );
}

/** Where a ring's one opening points, in turns: the middle of its widest step. */
function gapBearing(bearings: readonly number[]): number {
  const sorted = [...bearings].sort((a, b) => a - b);
  const gaps = gapsAround(sorted);
  const widest = gaps.indexOf(Math.max(...gaps));
  const opens = widest === 0 ? sorted[sorted.length - 1] : sorted[widest - 1];
  return (opens + gaps[widest] / 2) % 1;
}

/** Every live tear on the field. */
function tears(state: RunState): Shot[] {
  return state.mobFire.filter((shot) => shot.alive && shot.kind === 'tear');
}

/** Every piece of food on the field. */
function food(state: RunState): Corpse[] {
  return state.corpses.filter((corpse) => corpse.alive);
}

/** One chunk emptied, and the flash after it run down the way a tick does it. */
function breakChunk(fight: Fight): void {
  const boss = fight.state.boss;
  if (boss === null) throw new Error('no boss is standing');
  damageBoss(fight.state, boss.hp, 'skullStream');
  for (let tick = 0; tick < CHUNK_FLASH_TICKS; tick++) advanceBoss(fight.state);
}

/** Her whole fight, a chunk at a time, ending in her death. */
function killHer(fight: Fight): void {
  while (fight.state.boss !== null) breakChunk(fight);
}

/**
 * The feast her death shed, told apart from the one her chunk break shed by the
 * id it was born with. Both stand at the same point, because she does not move,
 * so nothing about a position could separate them.
 */
function feastFromHerDeath(fight: Fight): Corpse {
  breakChunk(fight);
  const alreadyShed = new Set(food(fight.state).map((corpse) => corpse.id));
  killHer(fight);
  const shed = food(fight.state).filter(
    (corpse) => !alreadyShed.has(corpse.id),
  );
  expect(shed).toHaveLength(1);
  return shed[0];
}

describe("the Banshee's tear-rings (game-concept.md:68, ADR 0007)", () => {
  it('throws slow expanding tear-rings in chunk one, each with one clean gap', () => {
    // game-concept.md:68, under ADR 0007's one authored pattern per chunk:
    // "chunk one is slow expanding tear-rings each with one clean gap". The
    // gap is the whole of the pattern's answer: a ring with no way through is
    // a wall, and one with two ways through is not read as a shape at all.
    const fight = atTheBanshee();
    const row = RING_ROWS[0];
    const fired = nextRing(fight);

    expect(fired).toHaveLength(row.spokes - row.gapSpokes);
    expect(fired.every((event) => event.emitter === 'banshee')).toBe(true);
    expect(fired.every((event) => event.kind === 'tear')).toBe(true);

    // One opening and one only: every other step around the ring is the ring's
    // own even spacing, and the opening is as wide as the spokes it replaces.
    const spacing = 1 / row.spokes;
    const gaps = gapsAround(tears(fight.state).map(bearingOf));
    const wide = gaps.filter((gap) => gap > spacing * 1.5);
    expect(wide).toHaveLength(1);
    expect(wide[0]).toBeCloseTo(spacing * (row.gapSpokes + 1), 6);

    // Slow is a relation and never a magnitude: a tear travels slower than the
    // trash shot the player has been reading since the first minute.
    expect(TEAR_FIRE.shotSpeed).toBeLessThan(MOB_TYPES.revenant.fire.shotSpeed);

    // Expanding, which is what makes it a ring rather than a volley: every tear
    // leaves one point at one speed, so they stand on a circle that grows.
    const source = { x: fight.boss.x, y: fight.boss.y };
    const radii = (): number[] =>
      tears(fight.state).map(
        (shot) => normalize(shot.x - source.x, shot.y - source.y).length,
      );
    const spread = (of: readonly number[]): number =>
      Math.max(...of) - Math.min(...of);
    expect(spread(radii())).toBeLessThan(1e-9);

    const held = radii()[0];
    for (let tick = 0; tick < 20; tick++) fight.tick();
    expect(spread(radii())).toBeLessThan(1e-9);
    expect(radii()[0]).toBeGreaterThan(held);
  });

  it('adds a second offset ring source in chunk two, so the gaps stop lining up', () => {
    // The same sentence's second half: "chunk two is a second offset ring
    // source so the gaps stop lining up". One source leaves one way through;
    // two sources whose openings pointed the same way would still leave one,
    // so the offset is the whole of the escalation.
    const fight = atTheBanshee();
    expect(RING_ROWS[0].sources).toHaveLength(1);

    breakChunk(fight);
    expect(fight.state.boss?.chunk).toBe(1);

    const row = RING_ROWS[1];
    expect(row.sources.length).toBeGreaterThan(1);
    const fired = nextRing(fight);

    // A tear has not moved on the tick it was fired, so the ring's own shots
    // are the ones still standing on a source's point.
    const origins = [...new Set(fired.map((event) => `${event.x},${event.y}`))];
    expect(origins).toHaveLength(row.sources.length);
    expect(fired).toHaveLength(
      row.sources.length * (row.spokes - row.gapSpokes),
    );

    const openings = origins.map((origin) =>
      gapBearing(
        tears(fight.state)
          .filter((shot) => `${shot.x},${shot.y}` === origin)
          .map(bearingOf),
      ),
    );
    const apart = Math.abs(openings[0] - openings[1]);
    expect(Math.min(apart, 1 - apart)).toBeGreaterThan(0.25);
  });

  it('throws mob fire and never a cone', () => {
    // CONTEXT.md:79: "The Banshee's tear-rings are mob fire and are never a
    // cone." The bell owns the cone, and the grammar separation is what keeps
    // the ring hers (game-concept.md:72), so what her pattern puts on the field
    // is the mob-fire pool and the mob-fire event and nothing else.
    const fight = atTheBanshee();
    const before = tears(fight.state).length;
    const fired = nextRing(fight);

    expect(fired.length).toBeGreaterThan(0);
    expect(tears(fight.state).length - before).toBe(fired.length);
    expect(fired.every((event) => event.kind === 'tear')).toBe(true);

    // The deliberate absence beside it, read off her own source: her module
    // does not reach for the cone's vocabulary at all.
    expect(bansheeSource.toLowerCase()).not.toContain('cone');
    expect(bansheeSource.toLowerCase()).not.toContain('toll');
  });

  it('draws its ring from the fire stream and from no other', () => {
    // ADR 0006's stream rule: what chance the sim spends is drawn from a named
    // seeded stream, so one seed throws one sequence. The bearing a ring opens
    // at carries a small drawn jitter, so a ring is not the same bearing at the
    // same tick in every run ever played, and the draw is the fire stream's
    // because a ring is fire.
    const fight = atTheBanshee();
    const drawnBefore = fight.state.streams.mobFire.drawn;
    const others = (): Record<string, number> => ({
      spawns: fight.state.streams.spawns.drawn,
      drops: fight.state.streams.drops.drawn,
      shed: fight.state.streams.shed.drawn,
      territory: fight.state.streams.territory.drawn,
    });
    const otherBefore = others();
    nextRing(fight);

    expect(fight.state.streams.mobFire.drawn).toBeGreaterThan(drawnBefore);
    expect(others()).toEqual(otherBefore);

    // One seed, one sequence: the same run played again throws the same ring.
    const again = atTheBanshee();
    nextRing(again);
    expect(tears(again.state).map(bearingOf)).toEqual(
      tears(fight.state).map(bearingOf),
    );
  });
});

describe('the belch against her rings (ADR 0008)', () => {
  it('smothers a whole ring and leaves her standing', () => {
    // ADR 0008: "The gas smothers every mob-fire shot on the whole field, boss
    // patterns included, and kills nothing." Her ring is the first authored
    // pattern in the game, so this is the first time that clause has had one to
    // be about: the shots go and the boss does not, which is what makes the
    // belch a breath rather than an answer.
    const fight = atTheBanshee();
    const fired = nextRing(fight);
    expect(tears(fight.state)).toHaveLength(fired.length);

    const hp = fight.boss.hp;
    const stoodAt = { x: fight.boss.x, y: fight.boss.y };
    fight.state.reservoir = RESERVOIR_CAPACITY;
    const belched = only(fireBelch(fight.state), 'belched');

    expect(belched[0].cancelled).toBe(fired.length);
    expect(tears(fight.state)).toEqual([]);
    // She stands at her arrival point, the whole field from the grave, so the
    // burst never reached her and the gas took nothing off her but her fire.
    expect(fight.state.boss).not.toBeNull();
    expect(fight.boss.hp).toBe(hp);
    expect(fight.boss.x).toBe(stoodAt.x);
    expect(fight.boss.y).toBe(stoodAt.y);
  });
});

describe("what the Banshee's death sheds (ADR 0004, ADR 0007)", () => {
  it('drops a feast that never decays', () => {
    // game-concept.md:68: "her death drops a feast corpse that never decays".
    // It is the death's own feast and not the break's, which chunks.ts sheds,
    // so it is told apart from it by id rather than counted.
    const fight = atTheBanshee();
    const where = { x: fight.boss.x, y: fight.boss.y };
    const feast = feastFromHerDeath(fight);

    expect(fight.state.boss).toBeNull();
    expect(feast.kind).toBe('feast');
    expect(feast.decays).toBe(false);
    expect(feast.freshness).toBe(1);
    expect(feast.x).toBe(where.x);
    expect(feast.y).toBe(where.y);
  });

  it('leaves the feast where she fell, and it rides the scroll like any other food', () => {
    // It is food on the field rather than a reward handed over, so it is under
    // the same deadline everything else is and the dive still has to be made.
    const fight = atTheBanshee();
    const where = { x: fight.boss.x, y: fight.boss.y };
    const feast = feastFromHerDeath(fight);

    const ticks = 30;
    for (let tick = 0; tick < ticks; tick++) fight.tick();

    expect(feast.x).toBe(where.x);
    expect(feast.y).toBeCloseTo(where.y + ticks * SCROLL_SPEED, 6);
    expect(feast.freshness).toBe(1);
  });

  it('fills the reservoir exactly and wastes nothing when it is swallowed', () => {
    // tuning.ts's own construction: capacity is the feast's payout exactly, so
    // a fully fresh feast fills the reservoir and wastes nothing
    // (game-concept.md:56). The splash is what a wasted charge reports, so its
    // absence is the assertion rather than an arithmetic comparison.
    const fight = atTheBanshee();
    const feast = feastFromHerDeath(fight);
    expect(fight.state.reservoir).toBe(0);

    const events = swallow(fight.state, asSwallowable(feast));

    expect(fight.state.reservoir).toBe(RESERVOIR_CAPACITY);
    expect(only(events, 'reservoirFull')).toHaveLength(1);
    expect(only(events, 'splashed')).toEqual([]);
  });
});

describe('the Wall her death launches (game-concept.md:56, ADR 0042)', () => {
  it('starts the Wall clock on her death, and never on her swallow', () => {
    // game-concept.md:56 splits the anchor and it matters: her death starts the
    // Wall clock, and only the swallow of her corpse slams the reservoir. So
    // the stage never waits on a pickup, and a player who never dives meets the
    // Wall unloaded, which is what makes the Wall's two-sided property live
    // rather than decorative (ADR 0042).
    const fight = atTheBanshee();
    killHer(fight);

    const events: SimEvent[] = [];
    for (let tick = 0; tick <= 1 + WALL_ROW.t * TICK_HZ; tick++) {
      events.push(...fight.tick());
    }

    expect(only(events, 'phaseChanged').map((event) => event.phase)).toEqual([
      'crowd',
    ]);
    expect(PHASES[fight.state.stage.phaseIndex].name).toBe('crowd');
    expect(fight.state.mobs.filter((mob) => mob.alive)).toHaveLength(
      WALL_ROW.count,
    );

    // Never dived on: both feasts she shed are still standing on the field, so
    // the Wall arrived on a run whose reservoir she paid nothing into.
    expect(only(events, 'swallowed')).toEqual([]);
    expect(fight.state.reservoir).toBe(0);
    expect(
      food(fight.state).filter((corpse) => corpse.kind === 'feast'),
    ).toHaveLength(2);
  });
});
