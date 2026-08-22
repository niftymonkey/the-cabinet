/**
 * The sim seam (tracer plan section 3). Every test here steps through
 * stepChecked, so ADR 0013's invariants are checked on every step.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { stepChecked } from "../dev/invariants";
import { spawnCorpse } from "./corpses";
import type { SimEvent } from "./events";
import { graveHitbox } from "./grave";
import type { Mob } from "./mobs";
import { MOB_TYPES, spawnMob } from "./mobs";
import type { RunState } from "./run";
import { createRun } from "./run";
import { RAMP_ROWS } from "./stage/stage";
import {
  BASE_SPEED,
  HIT_SHRINK,
  INVULNERABLE_TICKS,
  SCROLL_SPEED,
} from "./tuning";

const STILL = { x: 0, y: 0 } as const;

/**
 * Everything that defines a run, by value. The streams are closures, so two
 * runs never compare deeply equal however identical their state is.
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
    drawn: {
      spawns: run.streams.spawns.drawn,
      drops: run.streams.drops.drawn,
      mobFire: run.streams.mobFire.drawn,
      shed: run.streams.shed.drawn,
    },
  };
}

describe("the sim seam", () => {
  // a failed assertion must not leave a spy installed for the rest of the file
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("a run starts at tick zero and keeps the seed it was given (ADR 0012)", () => {
    const run = createRun(7);
    expect(run.seed).toBe(7);
    expect(run.tick).toBe(0);
  });

  it("a pinned seed is kept whatever its value, zero included (ADR 0012)", () => {
    expect(createRun(0).seed).toBe(0);
    expect(createRun(2147483646).seed).toBe(2147483646);
  });

  it("no seed derives one from the random source (ADR 0012)", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(createRun().seed).toBe(1073741823);
    random.mockReturnValue(0);
    expect(createRun().seed).toBe(0);
  });

  it("no seed rolls a fresh one, in range (ADR 0012)", () => {
    for (let i = 0; i < 200; i++) {
      const { seed } = createRun();
      expect(Number.isInteger(seed)).toBe(true);
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThan(2147483647);
    }
  });

  it("a step advances exactly one tick", () => {
    const run = createRun(7);
    stepChecked(run, STILL);
    stepChecked(run, STILL);
    expect(run.tick).toBe(2);
  });

  it("a tick with nothing in it reports no events", () => {
    const run = createRun(7);
    expect(stepChecked(run, STILL)).toEqual([]);
  });

  it("scroll distance derives from the tick, so there is no stored field to drift", () => {
    const run = createRun(7);
    for (let i = 0; i < 40; i++) stepChecked(run, STILL);
    expect(run.tick).toBe(40);
    expect(run.tick * SCROLL_SPEED).toBe(40 * SCROLL_SPEED);
    const scrollish = Object.keys(run).filter((key) =>
      key.toLowerCase().includes("scroll"),
    );
    expect(scrollish).toEqual([]);
  });

  it("step applies the move command to the grave, so steering reaches the sim through the seam", () => {
    const run = createRun(7);
    const from = { x: run.grave.x, y: run.grave.y };
    stepChecked(run, { x: 1, y: -1 });
    expect(run.grave.x).toBe(from.x + BASE_SPEED);
    expect(run.grave.y).toBe(from.y - BASE_SPEED);
  });

  it("step ages invulnerability by one tick", () => {
    const run = createRun(7);
    run.grave.invulnerable = 5;
    stepChecked(run, STILL);
    expect(run.grave.invulnerable).toBe(4);
  });

  it("a run advanced N ticks with a fixed command sequence lands in exactly the same state as another run on the same seed (ADR 0012)", () => {
    const script = [
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: -0.5, y: 0.5 },
      STILL,
      { x: 0.25, y: 1 },
    ];
    const a = createRun(11);
    const b = createRun(11);
    for (let i = 0; i < 200; i++) {
      const command = script[i % script.length];
      stepChecked(a, command);
      stepChecked(b, command);
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
  const mob = spawnMob(state, "shambler", {
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
  shot.emitter = "revenant";
  shot.x = state.grave.x;
  shot.y = state.grave.y;
  shot.vx = 0;
  shot.vy = 0;
  shot.halfExtent = MOB_TYPES.revenant.fire.shotHalfExtent;
  return shot;
}

function typesOf(events: SimEvent[]): string[] {
  return events.map((event) => event.type);
}

describe("the tick order (dispatch 4 section 4.9)", () => {
  it("swallows a corpse at zero freshness the grave is under this tick, rather than taking it under", () => {
    // Overlap before decay, asserted by consequence rather than by spying.
    // Greed that arrives on the last tick is rewarded, which is the direction
    // ADR 0004 already leans by giving freshness a payout floor.
    const state = quietRun();
    const dead = spawnMob(state, "shambler", {
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

    const events = stepChecked(state, STILL);
    expect(typesOf(events)).toContain("swallowed");
    expect(typesOf(events)).not.toContain("corpseExpired");
    expect(corpse.alive).toBe(false);
  });

  it("ages the grave last, so a hit's window lasts exactly INVULNERABLE_TICKS", () => {
    const state = quietRun();
    mobOnGrave(state);
    stepChecked(state, STILL);
    expect(state.grave.invulnerable).toBe(INVULNERABLE_TICKS - 1);
  });
});

describe("what meets the grave (ADR 0003 and ADR 0014)", () => {
  it("shrinks the grave through hitGrave when mob fire lands, and consumes the shot", () => {
    const state = quietRun();
    const shot = shotOnGrave(state);
    const before = state.grave.size;

    const events = stepChecked(state, STILL);
    expect(typesOf(events)).toContain("graveHit");
    expect(state.grave.size).toBe(before - HIT_SHRINK);
    expect(shot.alive).toBe(false);
  });

  it("consumes a shot that overlaps an invulnerable grave, so one shot can never become two hits", () => {
    const state = quietRun();
    state.grave.invulnerable = INVULNERABLE_TICKS;
    const shot = shotOnGrave(state);
    const before = state.grave.size;

    const first = stepChecked(state, STILL);
    expect(typesOf(first)).not.toContain("graveHit");
    expect(shot.alive).toBe(false);

    const later: SimEvent[] = [];
    for (let tick = 0; tick < INVULNERABLE_TICKS + 5; tick++) {
      later.push(...stepChecked(state, STILL));
    }
    expect(typesOf(later)).not.toContain("graveHit");
    expect(state.grave.size).toBe(before);
  });

  it("shrinks the grave on mob contact and leaves the mob on the field", () => {
    const state = quietRun();
    const mob = mobOnGrave(state);
    const before = state.grave.size;

    const events = stepChecked(state, STILL);
    expect(typesOf(events)).toContain("graveHit");
    expect(state.grave.size).toBe(before - HIT_SHRINK);
    expect(mob.alive).toBe(true);
    expect(mob.hp).toBe(MOB_TYPES.shambler.hp);
  });

  it("lands nothing on a second contact inside the invulnerability window", () => {
    const state = quietRun();
    mobOnGrave(state, -6);
    mobOnGrave(state, 6);
    const box = graveHitbox(state.grave);
    expect(box.height).toBeGreaterThan(12);

    const events = stepChecked(state, STILL);
    expect(events.filter((event) => event.type === "graveHit")).toHaveLength(1);
  });
});

describe("determinism across the whole field (ADR 0012)", () => {
  it("produces the same events in the same order for one seed, because pools are walked in slot order", () => {
    const script = [{ x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0.5 }, STILL];
    const a = createRun(5150);
    const b = createRun(5150);
    const eventsA: SimEvent[] = [];
    const eventsB: SimEvent[] = [];
    for (let tick = 0; tick < 1500; tick++) {
      const command = script[tick % script.length];
      eventsA.push(...stepChecked(a, command));
      eventsB.push(...stepChecked(b, command));
    }
    expect(eventsA.length).toBeGreaterThan(0);
    expect(JSON.stringify(eventsA)).toBe(JSON.stringify(eventsB));
    expect(snapshot(a)).toEqual(snapshot(b));
  });
});
