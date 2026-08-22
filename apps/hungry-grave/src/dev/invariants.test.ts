/**
 * The sim invariant harness (ADR 0013): in bounds, size within floor and
 * ceiling, no NaN, entity caps, checked on every step in every sim test.
 */

import { describe, expect, it } from "vitest";
import { spawnCorpse } from "../game/corpses";
import { FIELD_HEIGHT, FIELD_WIDTH } from "../game/field";
import type { Mob } from "../game/mobs";
import { SPAWN_MARGIN, spawnMob } from "../game/mobs";
import type { RunState, TickCommand } from "../game/run";
import { createRun } from "../game/run";
import { BELL_EXPAND_TICKS } from "../game/lines/bell";
import { MAX_LEVEL } from "../game/lines/roster";
import { SKULL_HALF_EXTENT } from "../game/lines/soulStream";
import { RESERVOIR_CAPACITY, SIZE_CEILING, SIZE_FLOOR } from "../game/tuning";
import { checkInvariants, stepChecked } from "./invariants";

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

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
      stepChecked(
        run,
        i % 2 === 0 ? { move: { x: 1, y: -1 }, belch: false } : STILL,
      );
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

describe("the storm's invariants (plan 6.26)", () => {
  it("throws on a NaN in any live skull or wisp, or anywhere in the lines record", () => {
    const skull = createRun(1);
    skull.skulls[0].alive = true;
    skull.skulls[0].vy = NaN;
    expect(() => checkInvariants(skull)).toThrow(/NaN/);

    const wisp = createRun(1);
    wisp.wisps[0].alive = true;
    wisp.wisps[0].life = NaN;
    expect(() => checkInvariants(wisp)).toThrow(/NaN/);

    const phase = createRun(1);
    phase.lines.orbitPhase = NaN;
    expect(() => checkInvariants(phase)).toThrow(/NaN/);

    const recharge = createRun(1);
    recharge.lines.stoneRecharge[0] = NaN;
    expect(() => checkInvariants(recharge)).toThrow(/NaN/);
  });

  it("holds a skull to its own extent and a wisp to the spawn margin", () => {
    // A skull is launched from the mouth and travels straight up, so its own
    // extent is the right box. A wisp homes on the mob it was given, and
    // cullMobs legitimately allows that mob out to SPAWN_MARGIN, so a wisp
    // checked against its own extent would fire on the game playing correctly.
    const skull = createRun(1);
    skull.skulls[0].alive = true;
    skull.skulls[0].x = 100;
    skull.skulls[0].y = -SKULL_HALF_EXTENT - 1;
    expect(() => checkInvariants(skull)).toThrow(/entities in bounds/);

    const legal = createRun(1);
    legal.wisps[0].alive = true;
    legal.wisps[0].x = 100;
    legal.wisps[0].y = -SPAWN_MARGIN;
    expect(() => checkInvariants(legal)).not.toThrow();

    const gone = createRun(1);
    gone.wisps[0].alive = true;
    gone.wisps[0].x = 100;
    gone.wisps[0].y = -SPAWN_MARGIN - 1;
    expect(() => checkInvariants(gone)).toThrow(/entities in bounds/);
  });

  it("throws when the skull or wisp pool exceeds its cap or twins an id", () => {
    const skulls = createRun(1);
    skulls.skulls.push({ ...skulls.skulls[0] });
    expect(() => checkInvariants(skulls)).toThrow(/entity caps/);

    const wisps = createRun(1);
    wisps.wisps.push({ ...wisps.wisps[0] });
    expect(() => checkInvariants(wisps)).toThrow(/entity caps/);

    const twinned = createRun(1);
    twinned.skulls[0].alive = true;
    twinned.skulls[0].id = 7;
    twinned.skulls[1].alive = true;
    twinned.skulls[1].id = 7;
    expect(() => checkInvariants(twinned)).toThrow(/entity ids/);
  });

  it("holds the reservoir between zero and capacity, within a stated tolerance", () => {
    // It has never been checked and the belch now empties it. The tolerance is
    // not slack: payReservoir's own arithmetic can exceed the cap by an ulp.
    const over = createRun(1);
    over.reservoir = RESERVOIR_CAPACITY + 0.001;
    expect(() => checkInvariants(over)).toThrow(/reservoir/);

    const under = createRun(1);
    under.reservoir = -0.001;
    expect(() => checkInvariants(under)).toThrow(/reservoir/);

    const rounded = createRun(1);
    rounded.reservoir = RESERVOIR_CAPACITY + 1e-12;
    expect(() => checkInvariants(rounded)).not.toThrow();
  });

  it("holds every level between zero and MAX_LEVEL, and a birthright line above its floor", () => {
    // The floor ladder strips levels and payLevel raises them, and both write
    // to the same record.
    const stripped = createRun(1);
    stripped.levels.soulStream = 0;
    expect(() => checkInvariants(stripped)).toThrow(/levels/);

    const overLevelled = createRun(1);
    overLevelled.levels.bell = MAX_LEVEL + 1;
    expect(() => checkInvariants(overLevelled)).toThrow(/levels/);

    const unowned = createRun(1);
    unowned.levels.bell = 0;
    expect(() => checkInvariants(unowned)).not.toThrow();
  });

  it("throws when a bell ring outlives its own expansion", () => {
    const state = createRun(1);
    state.lines.ring = {
      level: 3,
      ticks: BELL_EXPAND_TICKS + 1,
      struck: new Set(),
    };
    expect(() => checkInvariants(state)).toThrow(/one live ring/);
  });
});
