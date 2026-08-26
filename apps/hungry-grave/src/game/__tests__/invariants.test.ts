/**
 * The sim invariant harness (ADR 0013, ADR 0017): in bounds, size within floor
 * and ceiling, no NaN, entity caps, checked on every executed tick.
 *
 * Every assertion here used to be a toThrow. A check records a fault and
 * returns now, so what is asserted is the fault set the tick produced. That
 * supersedes this ticket's promise that this file survives the harness move
 * untouched, which Mark accepted in making the ruling: a file asserting throws
 * on checks now classified recoverable could not survive the mechanism.
 */

import { describe, expect, it } from 'vitest';
import { spawnCorpse } from '../corpses';
import { stepping } from '../../dev/stepping';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../field';
import type { Mob } from '../mobs';
import { SPAWN_MARGIN, spawnMob } from '../mobs';
import type { RunState, TickCommand } from '../run';
import { createRun } from '../run';
import type { BellRing } from '../lines/bell';
import { BELL_EXPAND_TICKS } from '../lines/bell';
import type { Stream } from '../rng';
import { MAX_LEVEL } from '../lines/roster';
import { SKULL_HALF_EXTENT } from '../lines/soulStream';
import { RESERVOIR_CAPACITY, SIZE_CEILING, SIZE_FLOOR } from '../tuning';
import type { Fault, FaultIdentity } from '../invariants';
import {
  checkInvariants,
  createStageWatch,
  FAULT_IDENTITIES,
  FAULT_SEVERITY,
} from '../invariants';

const STILL: TickCommand = { move: { x: 0, y: 0 }, belch: false };

/** The faults one look at a state records, through a watch that has seen nothing. */
function faultsOn(state: RunState): readonly Fault[] {
  return checkInvariants(state, createStageWatch());
}

/** The identities of those faults, which is what most of this file asserts. */
function brokenOn(state: RunState): FaultIdentity[] {
  return faultsOn(state).map((fault) => fault.identity);
}

describe('the fault list itself (ADR 0017)', () => {
  it('is closed, and every identity in it carries a severity', () => {
    // The identity is written down rather than taken from whatever string a
    // check happens to carry, because a fault record goes into a tape's third
    // section and hardens the moment the first tape exists.
    expect(new Set(FAULT_IDENTITIES).size).toBe(FAULT_IDENTITIES.length);
    expect(Object.keys(FAULT_SEVERITY).sort()).toEqual(
      [...FAULT_IDENTITIES].sort(),
    );
  });

  it('holds twelve identities against ten checks, six of them fatal', () => {
    // Two checks carry two identities each: checkPools records the caps and
    // the ids, and checkStage records the two phase invariants, which is where
    // the extra pair comes from.
    expect(FAULT_IDENTITIES).toHaveLength(12);
    const fatal = FAULT_IDENTITIES.filter(
      (identity) => FAULT_SEVERITY[identity] === 'fatal',
    );
    expect(fatal).toEqual([
      'no NaN',
      'size within floor and ceiling',
      'in bounds',
      'entity caps',
      'entity ids',
      'levels in range',
    ]);
  });

  it("tells the grave's own bounds check apart from the entities' one", () => {
    // The pair a severity table most easily confuses: one fatal, one
    // recoverable, sitting beside each other under near-identical names.
    expect(FAULT_SEVERITY['in bounds']).toBe('fatal');
    expect(FAULT_SEVERITY['entities in bounds']).toBe('recoverable');
  });

  it('carries its identity and its severity on every fault it records', () => {
    const nan = createRun(1);
    nan.grave.x = NaN;
    expect(faultsOn(nan)[0]).toMatchObject({
      identity: 'no NaN',
      severity: 'fatal',
    });
  });
});

describe('the sim invariants', () => {
  it('records a fault, naming the invariant, on a NaN coordinate, a size off either end, and a grave outside the field (ADR 0013)', () => {
    const nan = createRun(1);
    nan.grave.x = NaN;
    expect(brokenOn(nan)).toContain('no NaN');

    const small = createRun(1);
    small.grave.size = SIZE_FLOOR - 0.5;
    expect(brokenOn(small)).toContain('size within floor and ceiling');

    const big = createRun(1);
    big.grave.size = SIZE_CEILING + 0.5;
    expect(brokenOn(big)).toContain('size within floor and ceiling');

    const outside = createRun(1);
    outside.grave.x = FIELD_WIDTH + 10;
    expect(brokenOn(outside)).toContain('in bounds');

    const below = createRun(1);
    below.grave.y = FIELD_HEIGHT + 10;
    expect(brokenOn(below)).toContain('in bounds');
  });

  it('records nothing on a fresh run or on a run stepped a few hundred ticks (ADR 0013)', () => {
    const run = createRun(3);
    expect(faultsOn(run)).toEqual([]);
    const step = stepping(run);
    for (let i = 0; i < 300; i++) {
      step(i % 2 === 0 ? { move: { x: 1, y: -1 }, belch: false } : STILL);
    }
    expect(run.tick).toBe(300);
  });

  it('a checker that cannot run still throws rather than being recorded as a fault', () => {
    // Detecting a violated invariant is the checker working. A checker that
    // cannot run is a bug in the checker, and swallowing it into the list it
    // exists to produce would hide it behind the very mechanism meant to
    // surface it.
    const broken = createRun(1);
    Object.defineProperty(broken, 'mobs', {
      get(): never {
        throw new TypeError('the mob pool cannot be read');
      },
    });
    expect(() => checkInvariants(broken, createStageWatch())).toThrow(
      TypeError,
    );
  });
});

/** A live mob a test can then break, at a place the grave is nowhere near. */
function liveMob(state: RunState, x = 60, y = 100): Mob {
  return spawnMob(state, 'shambler', { x, y, vx: 0, vy: 1, index: 0 })!;
}

describe('every check for the tick runs (ADR 0017)', () => {
  /**
   * A run broken in one recoverable way and three fatal ones, with the
   * recoverable break sitting fourth in the check order and every fatal one
   * after it.
   */
  function brokenFourWays(): RunState {
    const state = createRun(1);
    // Recoverable, and checked fourth: a mob well past the spawn margin.
    liveMob(state, 60, -SPAWN_MARGIN - 1);
    // Fatal, and checked fifth: a pool longer than its cap.
    state.skulls.push({ ...state.skulls[0] });
    // Fatal, and checked fifth as well: two live slots sharing an id.
    const first = liveMob(state, 120);
    liveMob(state, 180).id = first.id;
    // Fatal, and checked eighth: a level outside the table it indexes.
    state.levels.bell = MAX_LEVEL + 1;
    return state;
  }

  it('a recoverable fault never prevents a later fatal check from running', () => {
    // The whole reason for the shape. Under a throwing harness the first fault
    // aborted every later check in the tick, and `entities in bounds` is
    // recoverable and runs fourth, ahead of three fatal checks.
    expect(brokenOn(brokenFourWays())).toEqual([
      'entities in bounds',
      'entity ids',
      'entity caps',
      'levels in range',
    ]);
  });

  it('check ordering does not change which faults are observed', () => {
    // Each break alone, then all of them together: the whole set is the union
    // of the parts, so no check switched another off.
    const strayOnly = createRun(1);
    liveMob(strayOnly, 60, -SPAWN_MARGIN - 1);
    const levelOnly = createRun(1);
    levelOnly.levels.bell = MAX_LEVEL + 1;

    expect(brokenOn(strayOnly)).toEqual(['entities in bounds']);
    expect(brokenOn(levelOnly)).toEqual(['levels in range']);
    expect(brokenOn(brokenFourWays())).toEqual(
      expect.arrayContaining([...brokenOn(strayOnly), ...brokenOn(levelOnly)]),
    );
  });

  it('records one fault per identity per tick, however many places break it', () => {
    // A hundred NaNs are one fact, and the first detail is the one kept, so the
    // pool walk order still decides which number a reader is pointed at.
    const state = createRun(1);
    const first = liveMob(state, 60);
    first.vx = NaN;
    liveMob(state, 120).vy = NaN;

    const nan = faultsOn(state).filter((fault) => fault.identity === 'no NaN');
    expect(nan).toHaveLength(1);
    expect(nan[0].detail).toBe(`mob ${first.id}.vx is NaN`);
  });
});

describe('the entity invariants (ADR 0013)', () => {
  it("records a NaN in any live entity's position, velocity, health or freshness", () => {
    const mob = createRun(1);
    liveMob(mob).vx = NaN;
    expect(brokenOn(mob)).toContain('no NaN');

    const health = createRun(1);
    liveMob(health).hp = NaN;
    expect(brokenOn(health)).toContain('no NaN');

    const shot = createRun(1);
    shot.mobFire[0].alive = true;
    shot.mobFire[0].y = NaN;
    expect(brokenOn(shot)).toContain('no NaN');

    const corpse = createRun(1);
    const dead = liveMob(corpse);
    dead.alive = false;
    spawnCorpse(corpse, dead);
    corpse.corpses.find((each) => each.alive)!.freshness = NaN;
    expect(brokenOn(corpse)).toContain('no NaN');
  });

  it('records a pool that exceeds its cap or holds two live slots with the same id', () => {
    const oversized = createRun(1);
    oversized.mobs.push({ ...oversized.mobs[0] });
    expect(brokenOn(oversized)).toContain('entity caps');

    const twinned = createRun(1);
    const first = liveMob(twinned, 60);
    const second = liveMob(twinned, 120);
    second.id = first.id;
    expect(brokenOn(twinned)).toContain('entity ids');
  });

  it('records a freshness outside zero to one', () => {
    for (const value of [-0.01, 1.01]) {
      const state = createRun(1);
      const dead = liveMob(state);
      dead.alive = false;
      spawnCorpse(state, dead);
      state.corpses.find((each) => each.alive)!.freshness = value;
      expect(brokenOn(state)).toContain('freshness in range');
    }
  });

  it('lets a mob sit a spawn margin above the edge and records past it, and holds a shot to its own extent', () => {
    // Mobs and corpses legitimately exist above the top edge before they
    // arrive, which is why their box is the field widened by a spawn margin.
    const arriving = createRun(1);
    liveMob(arriving, 60, -SPAWN_MARGIN);
    expect(faultsOn(arriving)).toEqual([]);

    const gone = createRun(1);
    liveMob(gone, 60, -SPAWN_MARGIN - 1);
    expect(brokenOn(gone)).toContain('entities in bounds');

    const wide = createRun(1);
    liveMob(wide, FIELD_WIDTH + SPAWN_MARGIN + 1, 100);
    expect(brokenOn(wide)).toContain('entities in bounds');

    const shot = createRun(1);
    shot.mobFire[0].alive = true;
    shot.mobFire[0].halfExtent = 5;
    shot.mobFire[0].x = 100;
    shot.mobFire[0].y = -20;
    expect(brokenOn(shot)).toContain('entities in bounds');
  });

  it('records the phase index going backwards or the phase tick not resetting at a boundary', () => {
    const watch = createStageWatch();
    const backwards = createRun(1);
    backwards.stage.phaseIndex = 2;
    expect(checkInvariants(backwards, watch)).toEqual([]);
    backwards.stage.phaseIndex = 1;
    expect(
      checkInvariants(backwards, watch).map((fault) => fault.identity),
    ).toContain('phase index only increases');

    const unresetWatch = createStageWatch();
    const unreset = createRun(1);
    unreset.stage.phaseTick = 900;
    expect(checkInvariants(unreset, unresetWatch)).toEqual([]);
    unreset.stage.phaseIndex = 1;
    unreset.stage.phaseTick = 901;
    expect(
      checkInvariants(unreset, unresetWatch).map((fault) => fault.identity),
    ).toContain('phase tick resets at a boundary');
  });

  it('keeps reporting a broken phase, because a rejected value never enters the watch', () => {
    // The watch is passed in on every call, which is what makes this file able
    // to exercise it at all: made optional, these two calls would go green
    // while checking nothing.
    const watch = createStageWatch();
    const run = createRun(1);
    run.stage.phaseIndex = 2;
    checkInvariants(run, watch);
    run.stage.phaseIndex = 1;
    expect(
      checkInvariants(run, watch).map((fault) => fault.identity),
    ).toContain('phase index only increases');
    // The watch still holds phase 2. Recording before the check would leave it
    // holding the rejected phase 1, and this second look would pass.
    expect(
      checkInvariants(run, watch).map((fault) => fault.identity),
    ).toContain('phase index only increases');
  });
});

describe("the storm's invariants (plan 6.26)", () => {
  it('records a NaN in any live skull or wisp, or anywhere in the lines record', () => {
    const skull = createRun(1);
    skull.skulls[0].alive = true;
    skull.skulls[0].vy = NaN;
    expect(brokenOn(skull)).toContain('no NaN');

    const wisp = createRun(1);
    wisp.wisps[0].alive = true;
    wisp.wisps[0].life = NaN;
    expect(brokenOn(wisp)).toContain('no NaN');

    const phase = createRun(1);
    phase.lines.orbitPhase = NaN;
    expect(brokenOn(phase)).toContain('no NaN');

    const recharge = createRun(1);
    recharge.lines.stoneRecharge[0] = NaN;
    expect(brokenOn(recharge)).toContain('no NaN');
  });

  it('holds a skull to its own extent and a wisp to the spawn margin', () => {
    // A skull is launched from the mouth and travels straight up, so its own
    // extent is the right box. A wisp homes on the mob it was given, and
    // cullMobs legitimately allows that mob out to SPAWN_MARGIN, so a wisp
    // checked against its own extent would fire on the game playing correctly.
    const skull = createRun(1);
    skull.skulls[0].alive = true;
    skull.skulls[0].x = 100;
    skull.skulls[0].y = -SKULL_HALF_EXTENT - 1;
    expect(brokenOn(skull)).toContain('entities in bounds');

    const legal = createRun(1);
    legal.wisps[0].alive = true;
    legal.wisps[0].x = 100;
    legal.wisps[0].y = -SPAWN_MARGIN;
    expect(faultsOn(legal)).toEqual([]);

    const gone = createRun(1);
    gone.wisps[0].alive = true;
    gone.wisps[0].x = 100;
    gone.wisps[0].y = -SPAWN_MARGIN - 1;
    expect(brokenOn(gone)).toContain('entities in bounds');
  });

  it('records a skull or wisp pool that exceeds its cap or twins an id', () => {
    const skulls = createRun(1);
    skulls.skulls.push({ ...skulls.skulls[0] });
    expect(brokenOn(skulls)).toContain('entity caps');

    const wisps = createRun(1);
    wisps.wisps.push({ ...wisps.wisps[0] });
    expect(brokenOn(wisps)).toContain('entity caps');

    const twinned = createRun(1);
    twinned.skulls[0].alive = true;
    twinned.skulls[0].id = 7;
    twinned.skulls[1].alive = true;
    twinned.skulls[1].id = 7;
    expect(brokenOn(twinned)).toContain('entity ids');
  });

  it('holds the reservoir between zero and capacity, within a stated tolerance', () => {
    // It has never been checked and the belch now empties it. The tolerance is
    // not slack: payReservoir's own arithmetic can exceed the cap by an ulp.
    const over = createRun(1);
    over.reservoir = RESERVOIR_CAPACITY + 0.001;
    expect(brokenOn(over)).toContain('reservoir in range');

    const under = createRun(1);
    under.reservoir = -0.001;
    expect(brokenOn(under)).toContain('reservoir in range');

    const rounded = createRun(1);
    rounded.reservoir = RESERVOIR_CAPACITY + 1e-12;
    expect(faultsOn(rounded)).toEqual([]);
  });

  it('holds every level between zero and MAX_LEVEL, and a birthright line above its floor', () => {
    // The floor ladder strips levels and payLevel raises them, and both write
    // to the same record.
    const stripped = createRun(1);
    stripped.levels.soulStream = 0;
    expect(brokenOn(stripped)).toContain('levels in range');

    const overLevelled = createRun(1);
    overLevelled.levels.bell = MAX_LEVEL + 1;
    expect(brokenOn(overLevelled)).toContain('levels in range');

    const unowned = createRun(1);
    unowned.levels.bell = 0;
    expect(faultsOn(unowned)).toEqual([]);
  });

  it('records a bell ring that outlives its own expansion', () => {
    const state = createRun(1);
    state.lines.ring = {
      level: 3,
      ticks: BELL_EXPAND_TICKS + 1,
      struck: new Set(),
    };
    expect(brokenOn(state)).toContain('one live ring');
  });
});

/** The fixture's live ring, rebuilt whole where a case must move its read-only level. */
function liveRing(): BellRing {
  return { level: 2, ticks: 5, struck: new Set([11, 12]) };
}

/**
 * A run with every pool slot the no-NaN walk covers alive and every nullable
 * field present, so a case can poison any one number. Modeled on the witness
 * fixture (witness.test.ts); a second copy of that shape, and rule of three
 * says extraction waits for a third instrument.
 */
function filledRun(): RunState {
  const run = createRun(20260823);
  fillGrave(run);
  fillMob(run);
  fillShot(run);
  fillCorpse(run);
  fillSkull(run);
  fillWisp(run);
  fillRun(run);
  return run;
}

function fillRun(run: RunState): void {
  run.score = 250;
  run.reservoir = 0.375;
  run.killsSinceDrop = 3;
  run.dropsPaid = 2;
  run.nextEntityId = 16;
  run.levels.soulStream = 2;
  run.levels.headstones = 1;
  run.levels.wisps = 3;
  run.levels.bell = 4;
  run.stage.phaseIndex = 1;
  run.stage.phaseTick = 40;
  run.stage.firedRows = 2;
  run.lines.streamIn = 17;
  run.lines.surgeVolleys = 2;
  run.lines.orbitPhase = 1.25;
  run.lines.stoneRecharge[1] = 8;
  run.lines.tollIn = 90;
  run.lines.ring = liveRing();
}

function fillGrave(run: RunState): void {
  run.grave.x = 137.5;
  run.grave.y = 421.25;
  run.grave.size = 23.5;
  run.grave.invulnerable = 7;
}

function fillMob(run: RunState): void {
  const mob = run.mobs[0];
  mob.alive = true;
  mob.id = 11;
  mob.type = 'ghoul';
  mob.x = 60.25;
  mob.y = 90.5;
  mob.vx = 0.75;
  mob.vy = 1.25;
  mob.hp = 4;
  mob.beat = 12;
  mob.fireIn = 33;
  mob.armed = true;
}

function fillShot(run: RunState): void {
  const shot = run.mobFire[0];
  shot.alive = true;
  shot.id = 12;
  shot.emitter = 'revenant';
  shot.x = 200.5;
  shot.y = 310.75;
  shot.vx = -0.5;
  shot.vy = 2;
  shot.halfExtent = 3;
}

function fillCorpse(run: RunState): void {
  const corpse = run.corpses[0];
  corpse.alive = true;
  corpse.id = 13;
  corpse.x = 310.5;
  corpse.y = 120.25;
  corpse.freshness = 0.625;
  corpse.payout = 1.5;
  corpse.tier = 'rich';
  corpse.kind = 'drop';
  corpse.decays = false;
  corpse.line = 'wisps';
  corpse.halfExtent = 9;
}

function fillSkull(run: RunState): void {
  const skull = run.skulls[0];
  skull.alive = true;
  skull.id = 14;
  skull.x = 400.25;
  skull.y = 500.5;
  skull.vx = 0;
  skull.vy = -4;
}

function fillWisp(run: RunState): void {
  const wisp = run.wisps[0];
  wisp.alive = true;
  wisp.id = 15;
  wisp.x = 55.75;
  wisp.y = 66.5;
  wisp.vx = 1.5;
  wisp.vy = -2.5;
  wisp.life = 45;
  wisp.targetId = 11;
}

/**
 * A Stream whose cursor is poisoned. An object literal satisfies the interface
 * with no cast, which is what lets a case reach a cursor that is otherwise a
 * getter over a closure counter (rng.ts).
 */
function poisonedStream(): Stream {
  return { next: () => 0, nextInt: () => 0, drawn: NaN };
}

interface NanCase {
  /** The number's path into RunState, the same spelling the witness partition uses. */
  readonly path: string;
  /** Poisons exactly that number on a fresh fixture and hands back the state to check. */
  readonly poison: (run: RunState) => RunState;
}

/**
 * One case per number the no-NaN check covers, the check's whole numeric
 * surface. Ring fields poison by replacing the ring record, because the level
 * is read-only on it; the stream cursors poison by rebuilding the state around
 * a hand-built Stream; the rest write NaN in place.
 */
const NAN_CASES: readonly NanCase[] = [
  {
    path: 'tick',
    poison: (run) => {
      run.tick = NaN;
      return run;
    },
  },
  {
    path: 'score',
    poison: (run) => {
      run.score = NaN;
      return run;
    },
  },
  {
    path: 'reservoir',
    poison: (run) => {
      run.reservoir = NaN;
      return run;
    },
  },
  {
    path: 'killsSinceDrop',
    poison: (run) => {
      run.killsSinceDrop = NaN;
      return run;
    },
  },
  {
    path: 'dropsPaid',
    poison: (run) => {
      run.dropsPaid = NaN;
      return run;
    },
  },
  {
    path: 'nextEntityId',
    poison: (run) => {
      run.nextEntityId = NaN;
      return run;
    },
  },
  {
    path: 'grave.x',
    poison: (run) => {
      run.grave.x = NaN;
      return run;
    },
  },
  {
    path: 'grave.y',
    poison: (run) => {
      run.grave.y = NaN;
      return run;
    },
  },
  {
    path: 'grave.size',
    poison: (run) => {
      run.grave.size = NaN;
      return run;
    },
  },
  {
    path: 'grave.invulnerable',
    poison: (run) => {
      run.grave.invulnerable = NaN;
      return run;
    },
  },
  {
    path: 'mobs[].x',
    poison: (run) => {
      run.mobs[0].x = NaN;
      return run;
    },
  },
  {
    path: 'mobs[].y',
    poison: (run) => {
      run.mobs[0].y = NaN;
      return run;
    },
  },
  {
    path: 'mobs[].vx',
    poison: (run) => {
      run.mobs[0].vx = NaN;
      return run;
    },
  },
  {
    path: 'mobs[].vy',
    poison: (run) => {
      run.mobs[0].vy = NaN;
      return run;
    },
  },
  {
    path: 'mobs[].hp',
    poison: (run) => {
      run.mobs[0].hp = NaN;
      return run;
    },
  },
  {
    path: 'mobs[].beat',
    poison: (run) => {
      run.mobs[0].beat = NaN;
      return run;
    },
  },
  {
    path: 'mobs[].fireIn',
    poison: (run) => {
      run.mobs[0].fireIn = NaN;
      return run;
    },
  },
  {
    path: 'mobFire[].x',
    poison: (run) => {
      run.mobFire[0].x = NaN;
      return run;
    },
  },
  {
    path: 'mobFire[].y',
    poison: (run) => {
      run.mobFire[0].y = NaN;
      return run;
    },
  },
  {
    path: 'mobFire[].vx',
    poison: (run) => {
      run.mobFire[0].vx = NaN;
      return run;
    },
  },
  {
    path: 'mobFire[].vy',
    poison: (run) => {
      run.mobFire[0].vy = NaN;
      return run;
    },
  },
  {
    path: 'corpses[].x',
    poison: (run) => {
      run.corpses[0].x = NaN;
      return run;
    },
  },
  {
    path: 'corpses[].y',
    poison: (run) => {
      run.corpses[0].y = NaN;
      return run;
    },
  },
  {
    path: 'corpses[].freshness',
    poison: (run) => {
      run.corpses[0].freshness = NaN;
      return run;
    },
  },
  {
    path: 'corpses[].payout',
    poison: (run) => {
      run.corpses[0].payout = NaN;
      return run;
    },
  },
  {
    path: 'skulls[].x',
    poison: (run) => {
      run.skulls[0].x = NaN;
      return run;
    },
  },
  {
    path: 'skulls[].y',
    poison: (run) => {
      run.skulls[0].y = NaN;
      return run;
    },
  },
  {
    path: 'skulls[].vx',
    poison: (run) => {
      run.skulls[0].vx = NaN;
      return run;
    },
  },
  {
    path: 'skulls[].vy',
    poison: (run) => {
      run.skulls[0].vy = NaN;
      return run;
    },
  },
  {
    path: 'wisps[].x',
    poison: (run) => {
      run.wisps[0].x = NaN;
      return run;
    },
  },
  {
    path: 'wisps[].y',
    poison: (run) => {
      run.wisps[0].y = NaN;
      return run;
    },
  },
  {
    path: 'wisps[].vx',
    poison: (run) => {
      run.wisps[0].vx = NaN;
      return run;
    },
  },
  {
    path: 'wisps[].vy',
    poison: (run) => {
      run.wisps[0].vy = NaN;
      return run;
    },
  },
  {
    path: 'wisps[].life',
    poison: (run) => {
      run.wisps[0].life = NaN;
      return run;
    },
  },
  {
    path: 'wisps[].targetId',
    poison: (run) => {
      run.wisps[0].targetId = NaN;
      return run;
    },
  },
  {
    path: 'levels.soulStream',
    poison: (run) => {
      run.levels.soulStream = NaN;
      return run;
    },
  },
  {
    path: 'levels.headstones',
    poison: (run) => {
      run.levels.headstones = NaN;
      return run;
    },
  },
  {
    path: 'levels.wisps',
    poison: (run) => {
      run.levels.wisps = NaN;
      return run;
    },
  },
  {
    path: 'levels.bell',
    poison: (run) => {
      run.levels.bell = NaN;
      return run;
    },
  },
  {
    path: 'stage.phaseIndex',
    poison: (run) => {
      run.stage.phaseIndex = NaN;
      return run;
    },
  },
  {
    path: 'stage.phaseTick',
    poison: (run) => {
      run.stage.phaseTick = NaN;
      return run;
    },
  },
  {
    path: 'stage.firedRows',
    poison: (run) => {
      run.stage.firedRows = NaN;
      return run;
    },
  },
  {
    path: 'streams.spawns.drawn',
    poison: (run) => ({
      ...run,
      streams: { ...run.streams, spawns: poisonedStream() },
    }),
  },
  {
    path: 'streams.drops.drawn',
    poison: (run) => ({
      ...run,
      streams: { ...run.streams, drops: poisonedStream() },
    }),
  },
  {
    path: 'streams.mobFire.drawn',
    poison: (run) => ({
      ...run,
      streams: { ...run.streams, mobFire: poisonedStream() },
    }),
  },
  {
    path: 'streams.shed.drawn',
    poison: (run) => ({
      ...run,
      streams: { ...run.streams, shed: poisonedStream() },
    }),
  },
  {
    path: 'lines.streamIn',
    poison: (run) => {
      run.lines.streamIn = NaN;
      return run;
    },
  },
  {
    path: 'lines.surgeVolleys',
    poison: (run) => {
      run.lines.surgeVolleys = NaN;
      return run;
    },
  },
  {
    path: 'lines.orbitPhase',
    poison: (run) => {
      run.lines.orbitPhase = NaN;
      return run;
    },
  },
  {
    path: 'lines.stoneRecharge[]',
    poison: (run) => {
      run.lines.stoneRecharge[1] = NaN;
      return run;
    },
  },
  {
    path: 'lines.tollIn',
    poison: (run) => {
      run.lines.tollIn = NaN;
      return run;
    },
  },
  {
    path: 'lines.ring.level',
    poison: (run) => {
      run.lines.ring = { ...liveRing(), level: NaN };
      return run;
    },
  },
  {
    path: 'lines.ring.ticks',
    poison: (run) => {
      run.lines.ring = { ...liveRing(), ticks: NaN };
      return run;
    },
  },
];

/**
 * Every leaf the check deliberately leaves unchecked, with the reason beside
 * it. The other half of the decision, and not optional: naming only the
 * covered half would let a new number join the fold with nobody deciding.
 */
const EXCLUDED: Readonly<Record<string, string>> = {
  seed: "the run's identity, fixed by createRun and never mutated by the rules",
  'mobs[].id': 'spawn identity, never mutated after spawn',
  'mobFire[].id': 'spawn identity, never mutated after spawn',
  'mobFire[].halfExtent': 'written once at spawn and never mutated',
  'corpses[].id': 'spawn identity, never mutated after spawn',
  'corpses[].halfExtent': 'written once at spawn and never mutated',
  'skulls[].id': 'spawn identity, never mutated after spawn',
  'wisps[].id': 'spawn identity, never mutated after spawn',
  ending: 'a run ending name or null, never a number',
};

/**
 * Every leaf whose value is a number, and every leaf whose value is null or
 * undefined, so a future nullable number left null in the fixture cannot slip
 * past. Arrays walk their first element under a `[]` segment because a pool's
 * slots all carry the same fields; strings, booleans, functions and Sets are
 * not numbers and drop out.
 */
function numericLeafPaths(value: unknown, path: string): string[] {
  if (value === null || value === undefined) return [path];
  if (typeof value === 'number') return [path];
  if (value instanceof Set) return [];
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    return numericLeafPaths(value[0], `${path}[]`);
  }
  if (typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, nested]) =>
    numericLeafPaths(nested, path === '' ? key : `${path}.${key}`),
  );
}

describe('the no-NaN coverage is closed (ticket #54)', () => {
  it('the hand-built fixture itself records no faults', () => {
    // The poison cases each assert one fault, which only means anything if the
    // unpoisoned fixture is clean.
    expect(faultsOn(filledRun())).toEqual([]);
  });

  for (const nanCase of NAN_CASES) {
    it(`records a fatal no NaN fault when ${nanCase.path} is NaN`, () => {
      const state = nanCase.poison(filledRun());
      const nan = faultsOn(state).filter(
        (fault) => fault.identity === 'no NaN',
      );
      expect(nan).toHaveLength(1);
      expect(nan[0].severity).toBe('fatal');
    });
  }

  it('every numeric leaf of the fixture is either poisoned here or excluded with a reason beside it', () => {
    // The drift stop: a new number cannot join the fold without this test
    // forcing a decision about it, in either list.
    const walked = numericLeafPaths(filledRun(), '');
    const poisoned = new Set(NAN_CASES.map((nanCase) => nanCase.path));
    const undecided = walked
      .filter((path) => !poisoned.has(path) && !(path in EXCLUDED))
      .sort();
    expect(undecided).toEqual([]);
    // And the other direction, so a field that goes away takes its entry with
    // it rather than leaving a name nothing answers to.
    const listed = [...poisoned, ...Object.keys(EXCLUDED)];
    expect(listed.filter((path) => !walked.includes(path)).sort()).toEqual([]);
  });

  it('no path sits in both halves of the decision', () => {
    expect(
      NAN_CASES.map((nanCase) => nanCase.path).filter(
        (path) => path in EXCLUDED,
      ),
    ).toEqual([]);
  });

  it('a null wisp target is not a fault', () => {
    // A null is a legitimately untargeted wisp; the witness folds the absence
    // through the 0 sentinel, and only a non-finite number faults.
    const run = filledRun();
    run.wisps[0].targetId = null;
    expect(brokenOn(run)).not.toContain('no NaN');
  });
});
