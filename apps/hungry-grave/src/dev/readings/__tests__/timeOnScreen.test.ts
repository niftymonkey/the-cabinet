/**
 * Time on screen: how long each mob stands on the field (tilted view A4), so
 * the longer field's effect on how long a mob is armed is a figure.
 */

import { describe, expect, it } from 'vitest';

import type { SimEvent } from '../../../game/events';
import { MOB_TYPES, spawnMob } from '../../../game/mobs';
import type { Mob, MobType } from '../../../game/mobs';
import type { RunState } from '../../../game/run';
import { createRun } from '../../../game/run';
import {
  createTimeOnScreen,
  observeTimeOnScreen,
  timeOnScreenOf,
} from '../timeOnScreen';

const SEED = 20260927;

/** One body put on the field through the sim's own spawn, wholly above the top edge. */
const above = (run: RunState, type: MobType): Mob => {
  const mob = spawnMob(
    run,
    type,
    { x: 100, y: -MOB_TYPES[type].halfHeight - 5, vx: 0, vy: 1, index: 0 },
    false,
    'wave',
  );
  if (mob === null) throw new Error(`the mob pool refused a ${type}`);
  return mob;
};

// Moves a body so its top has just crossed into the field.
const crossIn = (mob: Mob): void => {
  mob.y = MOB_TYPES[mob.type].halfHeight;
};

/** The death event the sim fires when a body dies, and the death itself. */
const kill = (mob: Mob): SimEvent => {
  mob.alive = false;
  return {
    type: 'mobKilled',
    id: mob.id,
    mob: mob.type,
    x: mob.x,
    y: mob.y,
    carried: false,
  };
};

/** One tick observed at a run tick. */
const observeAt = (
  acc: ReturnType<typeof createTimeOnScreen>,
  run: RunState,
  tick: number,
  events: SimEvent[] = [],
): void => {
  run.tick = tick;
  observeTimeOnScreen(acc, events, run);
};

describe('timeOnScreen', () => {
  it("a mob's time on screen runs from its top crossing into the field to its death", () => {
    // A4: a revenant is armed from hasEntered on, so the clock starts where its
    // top crosses in, never where it spawned above the edge. Three shamblers on
    // for 60, 120 and 240 ticks are 1, 2 and 4 seconds: a median of 2, a
    // largest of 4.
    const run = createRun(SEED);
    const acc = createTimeOnScreen();
    const bodies = [
      above(run, 'shambler'),
      above(run, 'shambler'),
      above(run, 'shambler'),
    ];
    observeAt(acc, run, 10);
    for (const body of bodies) crossIn(body);
    observeAt(acc, run, 40);
    const [first, second, third] = bodies;
    observeAt(acc, run, 100, [kill(first!)]);
    observeAt(acc, run, 160, [kill(second!)]);
    observeAt(acc, run, 280, [kill(third!)]);

    const shamblers = timeOnScreenOf(acc).byType.shambler;
    expect(shamblers).toEqual({
      timed: 3,
      medianSeconds: 2,
      largestSeconds: 4,
    });
  });

  it('a mob that leaves the field alive is timed to the tick it left', () => {
    // The cull takes a body past an edge with no event, so leaving is read as
    // a body gone from the pool that no death took.
    const run = createRun(SEED);
    const acc = createTimeOnScreen();
    const ghoul = above(run, 'ghoul');
    crossIn(ghoul);
    observeAt(acc, run, 30);
    observeAt(acc, run, 120);
    ghoul.alive = false;
    observeAt(acc, run, 150);

    expect(timeOnScreenOf(acc).byType.ghoul).toEqual({
      timed: 1,
      medianSeconds: 2,
      largestSeconds: 2,
    });
  });

  it("a mob alive at the run's end is reported apart", () => {
    // Its time is cut short by the run rather than by the mob, so counting it
    // among the finished would pull every median down.
    const run = createRun(SEED);
    const acc = createTimeOnScreen();
    const cairn = above(run, 'cairn');
    const unseen = above(run, 'cairn');
    crossIn(cairn);
    observeAt(acc, run, 30);
    observeAt(acc, run, 900);

    const reading = timeOnScreenOf(acc);
    expect(reading.byType.cairn).toEqual({
      timed: 0,
      medianSeconds: null,
      largestSeconds: null,
    });
    expect(reading.onScreenAtEnd.cairn).toBe(1);
    expect(unseen.alive).toBe(true);
    expect(reading.byType.revenant).toEqual({
      timed: 0,
      medianSeconds: null,
      largestSeconds: null,
    });
    expect(reading.onScreenAtEnd.revenant).toBe(0);
  });
});
