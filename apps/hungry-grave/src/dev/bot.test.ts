/**
 * The deterministic headless player and the full-run test (ADR 0013).
 *
 * What this file can and cannot prove is worth stating where it is read.
 * Nothing kills a mob in this dispatch except clearingPolicy, which is a
 * stand-in for the storm, so every claim here about corpses, swallows and
 * victory rests on a bot doing what the weapon lines will do. dodgePolicy is
 * the only read that sits between that and a person.
 */

import { describe, expect, it } from "vitest";

import type { SimEvent } from "../game/events";
import type { RunState } from "../game/run";
import { createRun } from "../game/run";
import {
  BACK_HALF_ROWS,
  PHASES,
  phaseLengthTicks,
  RAMP_ROWS,
} from "../game/stage/stage";
import { SIZE_CEILING } from "../game/tuning";
import { clearingPolicy, dodgePolicy, hitTakingPolicy, runPolicy } from "./bot";

/** Five seeds, fixed so a failure is reproducible and never a flake. */
const SEEDS = [101, 202, 303, 404, 505];

const RAMP_TICKS = phaseLengthTicks(PHASES[0]);
const STAGE_TICKS = RAMP_TICKS + phaseLengthTicks(PHASES[2]);

/** Every mob the timeline authors, which is the ceiling on what any policy can meet. */
const AUTHORED_MOBS = [...RAMP_ROWS, ...BACK_HALF_ROWS].reduce(
  (total, row) => total + row.count,
  0,
);

function count(events: SimEvent[], type: SimEvent["type"]): number {
  return events.filter((event) => event.type === type).length;
}

function phaseOrder(events: SimEvent[]): string[] {
  return events
    .filter((event) => event.type === "phaseChanged")
    .map((event) => (event.type === "phaseChanged" ? event.phase : ""));
}

describe("clearingPolicy, the stand-in for the storm", () => {
  for (const seed of SEEDS) {
    it(`runs the whole stage on seed ${seed} and reaches victory`, () => {
      const state: RunState = createRun(seed);
      const { events, ticks } = runPolicy(
        state,
        clearingPolicy,
        STAGE_TICKS + 60,
      );

      expect(state.ending).toBe("victory");
      expect(ticks).toBeLessThanOrEqual(STAGE_TICKS + 60);
      expect(phaseOrder(events)).toEqual([
        "banshee",
        "backHalf",
        "undertaker",
        "over",
      ]);
      expect(count(events, "victory")).toBe(1);
    });
  }

  it("produces a run whose shape is in band: rows spawned, kills made, corpses left, and a swallow paid", () => {
    const state = createRun(SEEDS[0]);
    const { events } = runPolicy(state, clearingPolicy, STAGE_TICKS + 60);

    const kills = count(events, "mobKilled");
    // A policy that deletes everything within a hundred and fifty units of the
    // grave should meet most of the timeline, and can never meet more than all
    // of it.
    expect(kills).toBeLessThanOrEqual(AUTHORED_MOBS);
    expect(kills).toBeGreaterThan(AUTHORED_MOBS / 2);
    // Only kills leave corpses (ADR 0005), so every kill is one corpse spawned.
    expect(
      count(events, "corpseExpired") + count(events, "swallowed"),
    ).toBeGreaterThan(0);
    expect(count(events, "swallowed")).toBeGreaterThan(0);
    expect(count(events, "grew")).toBeGreaterThan(0);
  });
});

describe("hitTakingPolicy, the walk to sealed shut (ADR 0003)", () => {
  for (const seed of SEEDS) {
    it(`reaches sealed shut from a grown grave on seed ${seed}`, () => {
      // From the ceiling rather than from a fresh grave: size stops reading as
      // health above roughly forty, so a bot that started fresh would measure a
      // three-hit opening and report on a regime the player spends twenty
      // seconds in.
      const state = createRun(seed, SIZE_CEILING);
      const { events } = runPolicy(state, hitTakingPolicy, RAMP_TICKS);

      expect(state.ending).toBe("sealed");
      expect(count(events, "sealed")).toBe(1);
      // Not through the full ladder: with no drops and no ceiling overflow
      // there is no score to bleed and no level to strip, so the floor's next
      // hit seals. grave.test.ts holds the ladder's order against seeded state.
      expect(count(events, "scoreBled")).toBe(0);
      expect(count(events, "weaponStripped")).toBe(0);
      expect(count(events, "graveHit")).toBeGreaterThan(10);
    });
  }
});

describe("dodgePolicy, the plausible human", () => {
  for (const seed of SEEDS) {
    it(`survives the ramp on seed ${seed}`, () => {
      // The only fairness read available before weapons exist. A failure here
      // is a finding about the content and never a reason to make the bot
      // better.
      const state = createRun(seed);
      runPolicy(state, dodgePolicy, RAMP_TICKS);
      expect(state.ending).toBeNull();
    });
  }

  for (const seed of SEEDS) {
    it(`reaches the over phase from the size ceiling on seed ${seed}`, () => {
      // The only evidence in this dispatch that the back half is survivable by
      // something that does not delete it.
      const state = createRun(seed, SIZE_CEILING);
      const { events } = runPolicy(state, dodgePolicy, STAGE_TICKS + 60);
      expect(phaseOrder(events)).toContain("over");
      expect(state.ending).toBe("victory");
    });
  }
});
