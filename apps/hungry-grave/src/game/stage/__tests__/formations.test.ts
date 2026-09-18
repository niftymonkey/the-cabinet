/**
 * The placement library (ADR 0016). A formation says where a group arrives and
 * how it is arranged, and never which kind of mob is in it.
 */

import { describe, expect, it } from 'vitest';

// The module's own text, as a Vite raw import rather than through node:fs, so
// the source scan below stays inside the boundary src/boundary.test.ts holds.
import formationsSource from '../formations.ts?raw';

import { FIELD_WIDTH } from '../../field';
import { MOB_TYPE_NAMES, MOB_TYPES, SPAWN_MARGIN } from '../../mobs';
import { stream } from '../../rng';
import type { SpawnOrder, FormationName } from '../formations';
import { place } from '../formations';

const FORMATIONS: FormationName[] = [
  'drip',
  'file',
  'v',
  'pincer',
  'rain',
  'wall',
];

function orders(
  formation: FormationName,
  count: number,
  seed = 5,
): SpawnOrder[] {
  return place(formation, count, stream(seed, 'spawns'));
}

/** Narrows a possibly-absent value, or fails loudly when the absence is a bug. */
function requireDefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

/** An element this file only ever asks about at an index already known in range. */
function at<T>(items: readonly T[], index: number): T {
  return requireDefined(items[index], `no element at ${index}`);
}

/** The two arms of a mirrored formation, as they come off the placement. */
function arms(placed: SpawnOrder[]): [SpawnOrder[], SpawnOrder[]] {
  return [
    placed.filter((_at, index) => index % 2 === 0),
    placed.filter((_at, index) => index % 2 === 1),
  ];
}

describe('every formation', () => {
  it('spawns wholly above the top edge, so nothing pops into existence on screen', () => {
    const biggest = Math.max(
      ...MOB_TYPE_NAMES.map((name) => MOB_TYPES[name].halfHeight),
    );
    for (const formation of FORMATIONS) {
      for (const count of [1, 4, 8, 22]) {
        for (const at of orders(formation, count)) {
          expect(`${formation} ${count} y ${at.y + biggest <= 0}`).toBe(
            `${formation} ${count} y true`,
          );
        }
      }
    }
  });

  it('stays inside SPAWN_MARGIN of the edge, because the beat is counted from the crossing', () => {
    for (const formation of FORMATIONS) {
      for (const count of [1, 4, 8, 22]) {
        for (const at of orders(formation, count)) {
          expect(`${formation} ${count} depth ${-at.y <= SPAWN_MARGIN}`).toBe(
            `${formation} ${count} depth true`,
          );
        }
      }
    }
  });

  it('supplies a unit direction, so the mob type alone decides the entry speed', () => {
    for (const formation of FORMATIONS) {
      for (const at of orders(formation, 8)) {
        const length = Math.sqrt(at.vx * at.vx + at.vy * at.vy);
        expect(`${formation} ${length.toFixed(9)}`).toBe(
          `${formation} 1.000000000`,
        );
      }
    }
  });

  it('takes its count from the caller and never from the formation (ADR 0006)', () => {
    for (const formation of FORMATIONS) {
      for (const count of [1, 3, 7, 12, 22]) {
        expect(`${formation} ${orders(formation, count).length}`).toBe(
          `${formation} ${count}`,
        );
      }
    }
    expect(orders('wall', 0)).toEqual([]);
  });

  it('gives the same placement twice from the same stream state', () => {
    for (const formation of FORMATIONS) {
      expect(orders(formation, 9, 31)).toEqual(orders(formation, 9, 31));
    }
  });

  it('names no mob type anywhere in the file (ADR 0016)', () => {
    // A comment saying so is not a test. The failure this guards against is a
    // formation branching on who is in it, and only the source can see it.
    for (const name of MOB_TYPE_NAMES) {
      expect(`${name} ${formationsSource.includes(name)}`).toBe(
        `${name} false`,
      );
    }
    const specifiers = [
      ...formationsSource.matchAll(/^import[^;]*?["']([^"']+)["']/gm),
    ].map((match) =>
      requireDefined(
        match[1],
        'import regex matched with no captured specifier',
      ),
    );
    expect(specifiers.length).toBeGreaterThan(0);
    expect(specifiers.filter((each) => each.endsWith('/mobs'))).toEqual([]);
  });
});

describe("each formation's own shape", () => {
  it("the Drip spreads across the field's width at even spacing", () => {
    const placed = orders('drip', 3);
    expect(placed.map((at) => at.x)).toEqual([90, 270, 450]);
    expect(at(orders('drip', 1), 0).x).toBe(FIELD_WIDTH / 2);
    for (const at of placed) expect([at.vx, at.vy]).toEqual([0, 1]);
  });

  it('the File is one lane, each mob one body length behind the last', () => {
    const placed = orders('file', 5);
    expect(new Set(placed.map((order) => order.x)).size).toBe(1);
    const gaps = placed
      .slice(1)
      .map((order, index) => order.y - at(placed, index).y);
    expect(new Set(gaps.map((gap) => gap.toFixed(9))).size).toBe(1);
    expect(at(gaps, 0)).toBeLessThan(0);
  });

  it('the V is a chevron: arms opening outward, each rank further behind the apex', () => {
    const placed = orders('v', 7);
    const [left, right] = arms(placed);
    expect(left.every((order) => order.vx < 0)).toBe(true);
    expect(right.every((order) => order.vx > 0)).toBe(true);
    for (const arm of [left, right]) {
      for (let rank = 1; rank < arm.length; rank++) {
        expect(Math.abs(at(arm, rank).x - FIELD_WIDTH / 2)).toBeGreaterThan(
          Math.abs(at(arm, rank - 1).x - FIELD_WIDTH / 2),
        );
        expect(at(arm, rank).y).toBeLessThan(at(arm, rank - 1).y);
      }
    }
    // The apex pair straddles the centre, so neither side leads.
    expect(at(left, 0).x + at(right, 0).x).toBeCloseTo(FIELD_WIDTH, 9);
  });

  it('the Pincer comes in from two opposite top corners', () => {
    const placed = orders('pincer', 8);
    const [left, right] = arms(placed);
    expect(at(left, 0).x).toBeLessThan(FIELD_WIDTH / 4);
    expect(at(right, 0).x).toBeGreaterThan((FIELD_WIDTH * 3) / 4);
    expect(left.every((order) => order.vx > 0 && order.vy > 0)).toBe(true);
    expect(right.every((order) => order.vx < 0 && order.vy > 0)).toBe(true);
    // Mirrored, so the pair forces the player across the middle.
    expect(at(left, 0).vx).toBeCloseTo(-at(right, 0).vx, 12);
  });

  it('the Rain scatters across the full width and arrives loose rather than as a line', () => {
    // A scatter is not a spread, so one draw is never asserted to land
    // anywhere. What is asserted is that the whole width is reachable and that
    // the depth varies, which is where the looseness lives: the entry speed
    // cannot carry it, because the formation supplies a direction only.
    const pooled = [7, 8, 9, 10, 11].flatMap((seed) =>
      orders('rain', 12, seed),
    );
    expect(new Set(pooled.map((at) => at.x)).size).toBe(pooled.length);
    for (const at of pooled) {
      expect(at.x).toBeGreaterThanOrEqual(0);
      expect(at.x).toBeLessThanOrEqual(FIELD_WIDTH);
      expect([at.vx, at.vy]).toEqual([0, 1]);
    }
    expect(Math.min(...pooled.map((at) => at.x))).toBeLessThan(FIELD_WIDTH / 3);
    expect(Math.max(...pooled.map((at) => at.x))).toBeGreaterThan(
      (FIELD_WIDTH * 2) / 3,
    );
    expect(new Set(orders('rain', 12).map((at) => at.y)).size).toBeGreaterThan(
      1,
    );
  });

  it('the Wall is an even curtain across the full width, entering together', () => {
    const placed = orders('wall', 22);
    expect(new Set(placed.map((order) => order.y)).size).toBe(1);
    const gaps = placed
      .slice(1)
      .map((order, index) => order.x - at(placed, index).x);
    expect(new Set(gaps.map((gap) => gap.toFixed(9))).size).toBe(1);
    expect(at(placed, 0).x).toBeCloseTo(at(gaps, 0) / 2, 9);
    expect(at(placed, 21).x).toBeCloseTo(FIELD_WIDTH - at(gaps, 0) / 2, 9);
  });

  it('indexes the mirrored formations per arm, so the armed share falls in the same place on both sides', () => {
    for (const formation of ['v', 'pincer'] as const) {
      const [left, right] = arms(orders(formation, 8));
      expect(left.map((at) => at.index)).toEqual([0, 1, 2, 3]);
      expect(right.map((at) => at.index)).toEqual([0, 1, 2, 3]);
    }
    expect(orders('file', 4).map((at) => at.index)).toEqual([0, 1, 2, 3]);
  });
});
