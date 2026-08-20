/**
 * The one verb (ADR 0002). Five ADRs meet at this moment, and it takes values
 * rather than an entity reference, because entities are pooled and mutated in
 * place, so a held reference is a recycled slot by the time anything reads it.
 */

import { describe, expect, it } from "vitest";
import { stepChecked } from "../dev/invariants";
import type { SimEvent } from "./events";
import { MAX_LEVEL } from "./lines/roster";
import { createRun } from "./run";
import type { Swallowable } from "./swallow";
import { swallow } from "./swallow";
import {
  FEAST_PAYOUT,
  FRESHNESS_PAYOUT_FLOOR,
  RESERVOIR_CAPACITY,
  SIZE_CEILING,
  SIZE_FLOOR,
  TRASH_CORPSE_PAYOUT,
} from "./tuning";

function corpse(freshness: number): Swallowable {
  return { kind: "corpse", freshness, payout: TRASH_CORPSE_PAYOUT };
}

function drop(line: "wisps" | "soulStream"): Swallowable {
  // Treasure never decays, so a drop always arrives fully fresh (ADR 0004).
  return { kind: "drop", freshness: 1, payout: TRASH_CORPSE_PAYOUT, line };
}

function feast(): Swallowable {
  return { kind: "feast", freshness: 1, payout: FEAST_PAYOUT };
}

function kinds(events: SimEvent[]): string[] {
  return events.map((event) => event.type);
}

function find<T extends SimEvent["type"]>(
  events: SimEvent[],
  type: T,
): Extract<SimEvent, { type: T }> {
  const found = events.find((event) => event.type === type);
  expect(
    found,
    `no ${type} event in ${kinds(events).join(", ")}`,
  ).toBeDefined();
  return found as Extract<SimEvent, { type: T }>;
}

describe("the swallow", () => {
  it("every payout arrives through a swallow: a tick with no swallow in it changes no score, no size and no charge (ADR 0002)", () => {
    const run = createRun(5);
    const before = {
      score: run.score,
      size: run.grave.size,
      reservoir: run.reservoir,
    };
    for (let i = 0; i < 120; i++) stepChecked(run, { x: 1, y: -1 });
    expect({
      score: run.score,
      size: run.grave.size,
      reservoir: run.reservoir,
    }).toEqual(before);
  });

  it("growth scales by freshness, and a fully fresh corpse pays its full payout (ADR 0004)", () => {
    const fresh = createRun(1);
    swallow(fresh, corpse(1));
    expect(fresh.grave.size - SIZE_FLOOR).toBeCloseTo(
      createRun(1).grave.size - SIZE_FLOOR + TRASH_CORPSE_PAYOUT,
      10,
    );

    const half = createRun(1);
    const start = half.grave.size;
    swallow(half, corpse(0.5));
    expect(half.grave.size - start).toBeCloseTo(TRASH_CORPSE_PAYOUT * 0.5, 10);
  });

  it("freshness scales down to the quarter floor and never below, so a nearly gone corpse still pays (ADR 0004)", () => {
    for (const freshness of [0, 0.05, FRESHNESS_PAYOUT_FLOOR]) {
      const run = createRun(1);
      const start = run.grave.size;
      swallow(run, corpse(freshness));
      expect(run.grave.size - start).toBeCloseTo(
        TRASH_CORPSE_PAYOUT * FRESHNESS_PAYOUT_FLOOR,
        10,
      );
    }
  });

  it("a swallow at the size ceiling converts its whole growth to score as overflow (ADR 0003)", () => {
    const run = createRun(1);
    run.grave.size = SIZE_CEILING;
    const events = swallow(run, corpse(1));
    expect(run.grave.size).toBe(SIZE_CEILING);
    expect(run.score).toBeCloseTo(TRASH_CORPSE_PAYOUT, 10);
    expect(find(events, "overflowed").amount).toBeCloseTo(
      TRASH_CORPSE_PAYOUT,
      10,
    );
  });

  it("a swallow is never gated by size: only where the payout goes differs (ADR 0003)", () => {
    const small = createRun(1);
    small.grave.size = SIZE_FLOOR;
    const big = createRun(1);
    big.grave.size = SIZE_CEILING;

    const atFloor = swallow(small, feast());
    const atCeiling = swallow(big, feast());

    // Both ate it, both chimed, both charged the reservoir.
    for (const events of [atFloor, atCeiling]) {
      expect(kinds(events)).toContain("swallowed");
      expect(kinds(events)).toContain("chimed");
      expect(kinds(events)).toContain("reservoirCharged");
    }
    expect(small.grave.size).toBeGreaterThan(SIZE_FLOOR);
    expect(small.score).toBe(0);
    expect(big.grave.size).toBe(SIZE_CEILING);
    expect(big.score).toBeCloseTo(FEAST_PAYOUT, 10);
  });

  it("the reservoir charges on a swallow (ADR 0008)", () => {
    const run = createRun(1);
    const events = swallow(run, corpse(1));
    expect(run.reservoir).toBeCloseTo(TRASH_CORPSE_PAYOUT, 10);
    expect(find(events, "reservoirCharged").amount).toBeCloseTo(
      TRASH_CORPSE_PAYOUT,
      10,
    );
  });

  it("charge past the reservoir's capacity clamps and emits the splash, so hoarding visibly wastes (ADR 0008)", () => {
    const run = createRun(1);
    run.reservoir = RESERVOIR_CAPACITY - TRASH_CORPSE_PAYOUT / 2;
    const events = swallow(run, corpse(1));
    expect(run.reservoir).toBe(RESERVOIR_CAPACITY);
    expect(find(events, "splashed").wasted).toBeCloseTo(
      TRASH_CORPSE_PAYOUT / 2,
      10,
    );
  });

  it("a drop levels the line it carries, from the value it was given rather than rolling one here (ADR 0002)", () => {
    const run = createRun(1);
    expect(run.levels.wisps).toBe(0);
    const events = swallow(run, drop("wisps"));
    expect(run.levels.wisps).toBe(1);
    expect(run.levels.soulStream).toBe(1);
    expect(find(events, "weaponLeveled")).toEqual({
      type: "weaponLeveled",
      line: "wisps",
      level: 1,
    });
  });

  it("a drop for a line already at MAX_LEVEL converts to overflow instead (ADR 0002)", () => {
    const run = createRun(1);
    run.levels.wisps = MAX_LEVEL;
    const events = swallow(run, drop("wisps"));
    expect(run.levels.wisps).toBe(MAX_LEVEL);
    expect(kinds(events)).not.toContain("weaponLeveled");
    expect(run.score).toBeGreaterThan(0);
    expect(kinds(events)).toContain("overflowed");
  });

  it("a drop's freshness is 1 and it is never scaled: treasure never decays (ADR 0004)", () => {
    const run = createRun(1);
    const start = run.grave.size;
    const treasure = drop("wisps");
    expect(treasure.freshness).toBe(1);
    swallow(run, treasure);
    expect(run.grave.size - start).toBeCloseTo(treasure.payout, 10);
  });

  it("the chime fires on every swallow including the very first, whatever the loadout (glossary: swallow chime)", () => {
    const run = createRun(1);
    for (const line of ["soulStream", "headstones", "wisps", "bell"] as const) {
      run.levels[line] = 0;
    }
    expect(kinds(swallow(run, corpse(1)))).toContain("chimed");
    expect(kinds(swallow(run, corpse(0.2)))).toContain("chimed");
    expect(kinds(swallow(run, feast()))).toContain("chimed");
  });

  it("a swallowed event carries the freshness, the kind and the payout, because none of its readers can hold the entity", () => {
    const run = createRun(1);
    const food = corpse(0.4);
    expect(find(swallow(run, food), "swallowed")).toEqual({
      type: "swallowed",
      kind: "corpse",
      freshness: 0.4,
      payout: food.payout,
    });
  });

  it("a fully fresh feast at an empty reservoir fills it exactly and splashes nothing (entry 5.11)", () => {
    const run = createRun(1);
    expect(run.reservoir).toBe(0);
    const events = swallow(run, feast());
    expect(run.reservoir).toBe(RESERVOIR_CAPACITY);
    expect(kinds(events)).toContain("reservoirFull");
    expect(kinds(events)).not.toContain("splashed");
  });

  it("a feast at a partly charged reservoir emits reservoirFull then splashed, in a stated order (entry 5.11)", () => {
    const run = createRun(1);
    run.reservoir = RESERVOIR_CAPACITY / 2;
    const order = kinds(swallow(run, feast()));
    expect(order).toContain("reservoirFull");
    expect(order).toContain("splashed");
    expect(order.indexOf("reservoirFull")).toBeLessThan(
      order.indexOf("splashed"),
    );
    expect(run.reservoir).toBe(RESERVOIR_CAPACITY);
  });

  it("a feast at the size ceiling with a partly charged reservoir overflows growth to score and splashes charge, and neither cancels the other", () => {
    const run = createRun(1);
    run.grave.size = SIZE_CEILING;
    run.reservoir = RESERVOIR_CAPACITY / 2;
    const events = swallow(run, feast());
    expect(run.score).toBeCloseTo(FEAST_PAYOUT, 10);
    expect(run.grave.size).toBe(SIZE_CEILING);
    expect(run.reservoir).toBe(RESERVOIR_CAPACITY);
    expect(find(events, "splashed").wasted).toBeCloseTo(
      RESERVOIR_CAPACITY / 2,
      10,
    );
  });

  it.todo(
    "dispatch 4: the spawner's side of the treasure guarantee, that a drop is spawned with freshness 1 (ADR 0004)",
  );
});
