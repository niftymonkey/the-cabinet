/**
 * The sim invariant harness (ADR 0013): in bounds, size within floor and
 * ceiling, no NaN, entity caps, checked on every step in every sim test.
 */

import { describe, expect, it } from "vitest";
import { spawnCorpse } from "../game/corpses";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../game/field";
import type { Mob } from "../game/mobs";
import { SPAWN_MARGIN, spawnMob } from "../game/mobs";
import type { RunState } from "../game/run";
import { createRun } from "../game/run";
import { SIZE_CEILING, SIZE_FLOOR } from "../game/tuning";
import { checkInvariants, stepChecked } from "./invariants";

const STILL = { x: 0, y: 0 } as const;

describe("the sim invariants", () => {
  it("checkInvariants throws, naming the invariant, on a NaN coordinate, a size off either end, and a grave outside the field (ADR 0013)", () => {
    const nan = createRun(1);
    nan.grave.x = NaN;
    expect(() => checkInvariants(nan)).toThrow(/NaN/);

    const small = createRun(1);
    small.grave.size = SIZE_FLOOR - 0.5;
    expect(() => checkInvariants(small)).toThrow(/size/);

    const big = createRun(1);
    big.grave.size = SIZE_CEILING + 0.5;
    expect(() => checkInvariants(big)).toThrow(/size/);

    const outside = createRun(1);
    outside.grave.x = FIELD_WIDTH + 10;
    expect(() => checkInvariants(outside)).toThrow(/field/);

    const below = createRun(1);
    below.grave.y = FIELD_HEIGHT + 10;
    expect(() => checkInvariants(below)).toThrow(/field/);
  });
  it("checkInvariants passes on a fresh run and on a run stepped a few hundred ticks (ADR 0013)", () => {
    const run = createRun(3);
    expect(() => checkInvariants(run)).not.toThrow();
    for (let i = 0; i < 300; i++) {
      stepChecked(run, i % 2 === 0 ? { x: 1, y: -1 } : STILL);
    }
    expect(run.tick).toBe(300);
  });
});

/** A live mob a test can then break, at a place the grave is nowhere near. */
function liveMob(state: RunState, x = 60, y = 100): Mob {
  return spawnMob(state, "shambler", { x, y, vx: 0, vy: 1, index: 0 })!;
}

describe("the entity invariants (ADR 0013)", () => {
  it("throws on a NaN in any live entity's position, velocity, health or freshness", () => {
    const mob = createRun(1);
    liveMob(mob).vx = NaN;
    expect(() => checkInvariants(mob)).toThrow(/NaN/);

    const health = createRun(1);
    liveMob(health).hp = NaN;
    expect(() => checkInvariants(health)).toThrow(/NaN/);

    const shot = createRun(1);
    shot.mobFire[0].alive = true;
    shot.mobFire[0].y = NaN;
    expect(() => checkInvariants(shot)).toThrow(/NaN/);

    const corpse = createRun(1);
    const dead = liveMob(corpse);
    dead.alive = false;
    spawnCorpse(corpse, dead);
    corpse.corpses.find((each) => each.alive)!.freshness = NaN;
    expect(() => checkInvariants(corpse)).toThrow(/NaN/);
  });

  it("throws when a pool exceeds its cap or holds two live slots with the same id", () => {
    const oversized = createRun(1);
    oversized.mobs.push({ ...oversized.mobs[0] });
    expect(() => checkInvariants(oversized)).toThrow(/entity caps/);

    const twinned = createRun(1);
    const first = liveMob(twinned, 60);
    const second = liveMob(twinned, 120);
    second.id = first.id;
    expect(() => checkInvariants(twinned)).toThrow(/entity ids/);
  });

  it("throws on a freshness outside zero to one", () => {
    for (const value of [-0.01, 1.01]) {
      const state = createRun(1);
      const dead = liveMob(state);
      dead.alive = false;
      spawnCorpse(state, dead);
      state.corpses.find((each) => each.alive)!.freshness = value;
      expect(() => checkInvariants(state)).toThrow(/freshness/);
    }
  });

  it("lets a mob sit a spawn margin above the edge and throws past it, and holds a shot to its own extent", () => {
    // Mobs and corpses legitimately exist above the top edge before they
    // arrive, which is why their box is the field widened by a spawn margin.
    const arriving = createRun(1);
    liveMob(arriving, 60, -SPAWN_MARGIN);
    expect(() => checkInvariants(arriving)).not.toThrow();

    const gone = createRun(1);
    liveMob(gone, 60, -SPAWN_MARGIN - 1);
    expect(() => checkInvariants(gone)).toThrow(/entities in bounds/);

    const wide = createRun(1);
    liveMob(wide, FIELD_WIDTH + SPAWN_MARGIN + 1, 100);
    expect(() => checkInvariants(wide)).toThrow(/entities in bounds/);

    const shot = createRun(1);
    shot.mobFire[0].alive = true;
    shot.mobFire[0].halfExtent = 5;
    shot.mobFire[0].x = 100;
    shot.mobFire[0].y = -20;
    expect(() => checkInvariants(shot)).toThrow(/entities in bounds/);
  });

  it("throws when the phase index goes backwards or the phase tick does not reset at a boundary", () => {
    const backwards = createRun(1);
    backwards.stage.phaseIndex = 2;
    checkInvariants(backwards);
    backwards.stage.phaseIndex = 1;
    expect(() => checkInvariants(backwards)).toThrow(/phase index/);

    const unreset = createRun(1);
    unreset.stage.phaseTick = 900;
    checkInvariants(unreset);
    unreset.stage.phaseIndex = 1;
    unreset.stage.phaseTick = 901;
    expect(() => checkInvariants(unreset)).toThrow(/phase tick/);
  });

  it("keeps reporting a broken phase, because a rejected value never enters the watch", () => {
    const run = createRun(1);
    run.stage.phaseIndex = 2;
    checkInvariants(run);
    run.stage.phaseIndex = 1;
    expect(() => checkInvariants(run)).toThrow(/phase index/);
    // The watch still holds phase 2. Recording before the check would leave it
    // holding the rejected phase 1, and this second look would pass.
    expect(() => checkInvariants(run)).toThrow(/phase index/);
  });
});
