/**
 * The authored timeline (ADR 0006). The row tables are data, so most of this
 * file reads them directly; the handful of tests that need the clock run the
 * whole stage through stepChecked.
 */

import { describe, expect, it } from "vitest";

import { stepChecked } from "../../dev/invariants";
import { TICK_HZ } from "../clock";
import type { SimEvent } from "../events";
import { FIELD_WIDTH } from "../field";
import { graveWidth } from "../grave";
import type { MobType } from "../mobs";
import { MOB_TYPES, SPAWN_MARGIN } from "../mobs";
import type { RunState, TickCommand } from "../run";
import { createRun } from "../run";
import { SIZE_FLOOR, SIZE_START } from "../tuning";
import type { Phase, StageRow } from "./stage";
import {
  BACK_HALF_ROWS,
  DRAIN_OUT_SECONDS,
  PHASES,
  phaseLengthTicks,
  RAMP_ROWS,
} from "./stage";
import { place } from "./templates";

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

function phase(name: string): Phase {
  return PHASES.find((each) => each.name === name)!;
}

interface Recording {
  /** Every phaseChanged, in order, as name and absolute tick. */
  readonly boundaries: { phase: string; tick: number }[];
  /** The absolute tick each group of mobs arrived on, with how many arrived. */
  readonly arrivals: { tick: number; count: number }[];
  readonly events: SimEvent[];
  readonly state: RunState;
}

/**
 * The whole stage, with the grave held immortal. These tests are about the
 * timeline, and a grave left to be ground down would seal shut inside the ramp
 * and stop the stage's clock long before the back half.
 *
 * The grave holds still, so its birthright storm fires straight up the middle
 * and kills a little of what falls into it. That is why the field emptying at a
 * boundary is asserted in src/dev/bot.test.ts across five real runs instead of
 * here: the property is about the storm, and it needs a run with a player in it.
 */
function recordStage(seed: number, ticks: number): Recording {
  const state = createRun(seed);
  const boundaries: { phase: string; tick: number }[] = [];
  const arrivals: { tick: number; count: number }[] = [];
  const events: SimEvent[] = [];
  let seen = 0;

  for (let tick = 0; tick < ticks && state.ending !== "victory"; tick++) {
    const before = state.mobs.filter((mob) => mob.alive).length;
    // The tick the step is spending, so arrivals and phaseChanged are recorded
    // on the same clock: the event carries state.tick before step advances it.
    const at = state.tick;
    const stepped = stepChecked(state, STILL);
    events.push(...stepped);
    if (state.ending === "sealed") state.ending = null;
    state.grave.size = SIZE_START;

    const alive = state.mobs.filter((mob) => mob.alive).length;
    if (alive > before) arrivals.push({ tick: at, count: alive - before });
    for (const event of stepped) {
      if (event.type !== "phaseChanged") continue;
      boundaries.push({ phase: event.phase, tick: event.tick });
    }
    seen = alive;
  }
  expect(seen).toBeGreaterThanOrEqual(0);
  return { boundaries, arrivals, events, state };
}

describe("the rows as data (ADR 0006)", () => {
  it("gives a phase a length of its last row's time plus the drain-out", () => {
    // The relation is what is pinned. The drain-out's own magnitude is stated
    // once, here, because dispatch 5 re-derived it against the storm and a
    // later move should be a deliberate edit with a failing test attached.
    expect(DRAIN_OUT_SECONDS).toBe(16);
    expect(phaseLengthTicks(phase("ramp"))).toBe(
      (RAMP_ROWS[RAMP_ROWS.length - 1].t + DRAIN_OUT_SECONDS) * TICK_HZ,
    );
    expect(phaseLengthTicks(phase("ramp"))).toBe(121 * TICK_HZ);
    expect(phaseLengthTicks(phase("backHalf"))).toBe(
      (BACK_HALF_ROWS[BACK_HALF_ROWS.length - 1].t + DRAIN_OUT_SECONDS) *
        TICK_HZ,
    );
    expect(phaseLengthTicks(phase("backHalf"))).toBe(84 * TICK_HZ);
  });

  it("leaves the drain-out silent: no row falls inside it", () => {
    for (const each of [phase("ramp"), phase("backHalf")]) {
      const end = phaseLengthTicks(each) / TICK_HZ;
      const inside = each.rows.filter((row) => row.t > end - DRAIN_OUT_SECONDS);
      expect(inside).toEqual([]);
    }
  });

  it("holds only Drips and one File in the ramp's first 45 seconds", () => {
    const opening = RAMP_ROWS.filter((row) => row.t < 45);
    expect(opening.length).toBeGreaterThan(3);
    expect(opening.filter((row) => row.template === "file")).toHaveLength(1);
    expect(
      opening.filter(
        (row) => row.template !== "file" && row.template !== "drip",
      ),
    ).toEqual([]);
  });

  it("introduces every mob type as a lone Drip before it appears in numbers (ADR 0016)", () => {
    const seen = new Set<MobType>();
    for (const row of [...RAMP_ROWS, ...BACK_HALF_ROWS]) {
      if (seen.has(row.type)) continue;
      seen.add(row.type);
      expect(`${row.type} ${row.template} ${row.count}`).toBe(
        `${row.type} drip 1`,
      );
    }
    expect(seen.size).toBe(3);
  });

  it("fills the Wall's width at the shambler's size, so no gap in the curtain is wider than a floor-size grave", () => {
    const wall = BACK_HALF_ROWS.find((row) => row.template === "wall")!;
    const placed = place("wall", wall.count, createRun(1).streams.spawns);
    const half = MOB_TYPES[wall.type].halfWidth;
    const edges = placed.map((at) => ({
      left: at.x - half,
      right: at.x + half,
    }));

    const gaps = [edges[0].left, FIELD_WIDTH - edges[edges.length - 1].right];
    for (let index = 1; index < edges.length; index++) {
      gaps.push(edges[index].left - edges[index - 1].right);
    }
    for (const gap of gaps) {
      expect(`gap ${gap < graveWidth(SIZE_FLOOR)}`).toBe("gap true");
    }
  });

  it("keeps SPAWN_MARGIN at least as deep as the deepest authored row", () => {
    const rows: readonly StageRow[] = [...RAMP_ROWS, ...BACK_HALF_ROWS];
    const state = createRun(2);
    let deepest = 0;
    for (const row of rows) {
      for (const at of place(row.template, row.count, state.streams.spawns)) {
        deepest = Math.max(deepest, -at.y);
      }
    }
    expect(deepest).toBeGreaterThan(150);
    expect(SPAWN_MARGIN).toBeGreaterThanOrEqual(deepest);
  });
});

describe("the phase machine (ADR 0006)", () => {
  const recorded = recordStage(
    77,
    phaseLengthTicks(phase("ramp")) + phaseLengthTicks(phase("backHalf")) + 10,
  );

  it("chains the phases in order and reports each boundary", () => {
    expect(recorded.boundaries.map((each) => each.phase)).toEqual([
      "banshee",
      "backHalf",
      "undertaker",
      "over",
    ]);
  });

  it("begins and ends a stubbed boss phase on the same tick", () => {
    const [banshee, backHalf, undertaker, over] = recorded.boundaries;
    expect(banshee.tick).toBe(backHalf.tick);
    expect(undertaker.tick).toBe(over.tick);
    expect(banshee.tick).toBe(phaseLengthTicks(phase("ramp")));
  });

  it("lands the Wall two seconds into the back half, which is what the stub buys", () => {
    const backHalf = recorded.boundaries[1].tick;
    const wall = recorded.arrivals.find((each) => each.count === 22)!;
    expect(wall).toBeDefined();
    expect(wall.tick - backHalf).toBe(2 * TICK_HZ);
  });

  it("fires the same phase-local time at two different absolute ticks", () => {
    // Both tables carry a row at t=2. Phase-local means the second one waits
    // for the boundary rather than for the run's own clock.
    const first = recorded.arrivals[0].tick;
    const wall = recorded.arrivals.find((each) => each.count === 22)!.tick;
    expect(first).toBe(2 * TICK_HZ);
    expect(wall).toBe(recorded.boundaries[1].tick + 2 * TICK_HZ);
    expect(wall).not.toBe(first);
  });

  it("ends the run in victory when the over phase is reached", () => {
    expect(recorded.state.ending).toBe("victory");
    const victory = recorded.events.filter((event) => event.type === "victory");
    expect(victory).toHaveLength(1);
    expect(victory[0].type === "victory" && victory[0].tick).toBe(
      recorded.boundaries[3].tick,
    );
  });
});

describe("determinism (ADRs 0006 and 0012)", () => {
  it("gives an identical spawn sequence for an identical seed, over a whole phase", () => {
    const ticks = phaseLengthTicks(phase("ramp"));
    const first = recordStage(4242, ticks);
    const second = recordStage(4242, ticks);
    expect(first.arrivals).toEqual(second.arrivals);
    expect(
      first.state.mobs.map((mob) => `${mob.alive} ${mob.id} ${mob.x} ${mob.y}`),
    ).toEqual(
      second.state.mobs.map(
        (mob) => `${mob.alive} ${mob.id} ${mob.x} ${mob.y}`,
      ),
    );
    expect(first.state.streams.spawns.drawn).toBe(
      second.state.streams.spawns.drawn,
    );
    expect(first.state.streams.spawns.drawn).toBeGreaterThan(0);
  });
});
