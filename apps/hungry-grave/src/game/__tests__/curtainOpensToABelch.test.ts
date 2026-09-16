/**
 * The Wall's property, asserted against the sim rather than against a hand
 * (ADR 0042 as amended 2026-09-15, design record R4 and R5, #123).
 *
 * It is a cross-cutting guard and lives in its own file for that reason: the
 * promise spans the mob table, the Crowd's own wave, the placement library, the
 * belch and the grave's width, and no one of those modules owns it.
 *
 * Two halves. A belch landing on the curtain opens a gap the grave fits
 * through, and it opens because bodies moved: no rule anywhere reads which set
 * piece is on the field, which the last test asserts structurally because no
 * behaviour can. And a curtain crossed without one costs the grave health.
 */

import { describe, expect, it } from 'vitest';

import { fireBelch } from '../belch';
import { createExecution, executeTick } from '../execution';
import { graveWidth } from '../grave';
import { BIRTHRIGHT, BIRTHRIGHT_LEVEL, WEAPON_LINES } from '../lines/roster';
import type { Mob } from '../mobs';
import { MOB_TYPES, spawnMob } from '../mobs';
import type { RunState } from '../run';
import { createRun } from '../run';
import { place } from '../stage/formations';
import { SECTIONS } from '../stage/stage';
import { CROWD_WAVES } from '../stage/waves';
import { RESERVOIR_CAPACITY, SIZE_FLOOR, SIZE_START } from '../tuning';

/** Narrows a possibly-absent value, or fails loudly when the absence is a bug. */
function requireDefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

/** The Wall's own wave, so every test here is about the curtain the stage really contains. */
const WALL_WAVE = requireDefined(
  CROWD_WAVES.find((wave) => wave.formation === 'wall'),
  'the Crowd has no Wall',
);

const STILL = { move: { x: 0, y: 0 }, belch: false };

/**
 * The curtain standing on a quiet stage at a chosen size, with the storm at the
 * rung a run is born on.
 *
 * The stage is stood in the last section of the table, the one section the
 * machine never leaves, so nothing else arrives on top of what is being
 * measured. It is the same fixture bot.test.ts builds the Wall from.
 */
const curtainRun = (seed: number, size: number): RunState => {
  const state = createRun(seed, size);
  state.stage.sectionIndex = SECTIONS.length - 1;
  for (const line of WEAPON_LINES) {
    state.levels[line] = BIRTHRIGHT.includes(line) ? BIRTHRIGHT_LEVEL : 0;
  }
  for (const order of place(
    WALL_WAVE.formation,
    WALL_WAVE.count,
    state.streams.spawns,
  )) {
    spawnMob(state, WALL_WAVE.type, order, false, 'wave');
  }
  return state;
};

/** The curtain's own bodies, whichever of them are still standing. */
const curtainBodies = (state: RunState): Mob[] =>
  state.mobs.filter((mob) => mob.alive && mob.type === WALL_WAVE.type);

/**
 * Steps until the curtain's lowest body stands this far above the grave, which
 * is the moment a player meets it and the moment a press is spent.
 */
const fallToward = (state: RunState, above: number): number => {
  const execution = createExecution(state);
  for (let tick = 0; tick < 2000; tick++) {
    const bodies = curtainBodies(state);
    if (bodies.length === 0) throw new Error('the curtain left the field');
    const lowest = Math.max(...bodies.map((mob) => mob.y));
    if (lowest >= state.grave.y - above) return tick;
    executeTick(execution, STILL);
  }
  throw new Error('the curtain never reached the grave');
};

/**
 * The widest lateral hole in the curtain at the grave's own column, in field
 * units, measured between the facing edges of the two bodies either side of it.
 *
 * It is read at the grave's column and not across the whole width because that
 * is where a press is spent: the reach is half the field's width from the
 * grave, so a press can only ever open the curtain near the grave, and the far
 * thirds are not asked to open at all.
 */
const gapAtTheGravesColumn = (state: RunState): number => {
  const half = MOB_TYPES[WALL_WAVE.type].halfWidth;
  const at = state.grave.x;
  const left = curtainBodies(state)
    .filter((mob) => mob.x + half <= at)
    .map((mob) => mob.x + half);
  const right = curtainBodies(state)
    .filter((mob) => mob.x - half >= at)
    .map((mob) => mob.x - half);
  const nearestLeft = left.length === 0 ? 0 : Math.max(...left);
  const nearestRight =
    right.length === 0 ? state.grave.x * 2 : Math.min(...right);
  return nearestRight - nearestLeft;
};

/** Long enough for all three of the press's shoves to land and settle. */
const FLIGHT_TICKS = 120;

/**
 * Where a press is spent, in field units above the grave.
 *
 * One body's height above the grave's own top edge: the curtain is on top of
 * the player, which is the moment they cannot get through it and the only
 * moment spending the key answers anything.
 */
const SPENT_AT = 60;

describe('a belch opens the curtain (ADR 0042 as amended)', () => {
  for (const size of [SIZE_START, SIZE_FLOOR]) {
    it(`opens a gap wider than a grave of ${size} at its own column`, () => {
      // The promise itself, at both ends of the size the grave can be: the
      // start size and the floor. The gap is measured after every shove has
      // landed, because a press takes ticks and has no displacement on the tick
      // it fires.
      const state = curtainRun(101, size);
      fallToward(state, SPENT_AT);
      const before = gapAtTheGravesColumn(state);
      state.reservoir = RESERVOIR_CAPACITY;
      fireBelch(state);
      const execution = createExecution(state);
      for (let tick = 0; tick < FLIGHT_TICKS; tick++) {
        executeTick(execution, STILL);
      }

      expect(before).toBeLessThan(graveWidth(size));
      expect(gapAtTheGravesColumn(state)).toBeGreaterThan(graveWidth(size));
    });
  }

  it('opens it because bodies moved and never because bodies died', () => {
    // The mechanism, which is ruling R4: the press takes health off nothing, so
    // every body that was standing in the curtain is still standing after it,
    // somewhere else.
    const state = curtainRun(101, SIZE_START);
    fallToward(state, SPENT_AT);
    const standing = curtainBodies(state).length;
    const placedAt = curtainBodies(state).map((mob) => mob.x);
    state.reservoir = RESERVOIR_CAPACITY;
    const events = fireBelch(state);
    const execution = createExecution(state);
    for (let tick = 0; tick < FLIGHT_TICKS; tick++) {
      executeTick(execution, STILL);
    }
    const moved = curtainBodies(state).map((mob) => mob.x);

    expect(events.filter((event) => event.type === 'mobKilled')).toEqual([]);
    expect(curtainBodies(state)).toHaveLength(standing);
    expect(moved).not.toEqual(placedAt);
  });
});

describe('the curtain is a curtain when the grave reaches it (design record R5)', () => {
  it('stands whole through a rung-one storm all the way down', () => {
    // The shambler's measured failure turned into the cairn's promise: at 8
    // health the storm opened a lane on the way down and the crossing cost
    // nothing (step-4-progress.md section 4 item 7). The grave is held still
    // under the curtain, which is the worst case the storm can make, because a
    // still grave lands its whole column on one body.
    const state = curtainRun(101, SIZE_START);
    state.grave.invulnerable = Number.MAX_SAFE_INTEGER;
    fallToward(state, 0);

    expect(curtainBodies(state)).toHaveLength(WALL_WAVE.count);
    expect(gapAtTheGravesColumn(state)).toBeLessThan(graveWidth(SIZE_FLOOR));
  });

  it('costs the grave health when it is crossed without a belch', () => {
    // The cost, measured rather than read off the table: a grave that stands
    // where the curtain is falling and spends no key is smaller afterwards.
    const state = curtainRun(101, SIZE_START);
    const before = state.grave.size;
    const execution = createExecution(state);
    let hits = 0;
    for (let tick = 0; tick < 1400; tick++) {
      for (const event of executeTick(execution, STILL)) {
        if (event.type === 'graveHit') hits += 1;
      }
    }

    expect(hits).toBeGreaterThan(0);
    expect(state.grave.size).toBeLessThan(before);
  });
});

/**
 * Every production file under src/game with its own text, which is where a rule
 * keyed on the set piece would have to be written.
 *
 * Read through vite's own raw glob and never through node:fs, because the
 * import fence holds a src/game test to what src/game itself may import
 * (boundary.test.ts), and stage.test.ts already reads a module's source this
 * way.
 */
const GAME_SOURCES: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob('../**/*.ts', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>,
  )
    // A key vite resolved back into this folder is a test file beside this one,
    // and it arrives spelled './name.test.ts' rather than with the folder in it.
    .filter(([path]) => path.startsWith('../') && !path.endsWith('.test.ts'))
    .map(([path, source]) => [path.slice('../'.length), source]),
);

const sourceOf = (module: string): string =>
  requireDefined(GAME_SOURCES[module], `no source for ${module}`);

describe('no rule is keyed on which set piece is on the field (ADR 0042)', () => {
  it("names the curtain's body in the mob table and in the wave, and nowhere else", () => {
    // The half no behaviour can assert, so it is asserted structurally. ADRs
    // 0016 and 0042 exist to dismantle the fixed-membership club: the type is a
    // row in the pool and the Wall's wave names it the way every wave names
    // one, so a rule module mentioning it at all would be the defect, whether
    // it branched on it or only counted it.
    const names = Object.entries(GAME_SOURCES)
      .filter(([, source]) => source.includes(WALL_WAVE.type))
      .map(([path]) => path);

    expect(names.sort()).toEqual(['mobs.ts', 'stage/waves.ts']);
  });

  it('names no set piece in the belch or in the shove', () => {
    // The press is the key and knows nothing about the lock. A curtain parted
    // on any belch regardless of reach, and a press that killed only the wall's
    // bodies, are both refused by ruling R4, and each would have to be written
    // in one of these two files.
    for (const module of ['belch.ts', 'shove.ts']) {
      const source = sourceOf(module);
      expect(
        `${module} names the formation: ${source.includes("'wall'")}`,
      ).toBe(`${module} names the formation: false`);
      expect(
        `${module} names the curtain's body: ${source.includes(WALL_WAVE.type)}`,
      ).toBe(`${module} names the curtain's body: false`);
    }
  });
});
