/**
 * The sim invariant harness (ADR 0013): in bounds, size within floor and
 * ceiling, no NaN, entity caps, checked on every executed tick.
 *
 * It lives in src/game so executeTick() can run it inside the one authority
 * every tick crosses. That is the only place the check can see the case that
 * matters: the catch-up clamp runs up to fifteen ticks in one frame, and a
 * check fired once per frame reads the last of those ticks and misses the other
 * fourteen. src/boundary.test.ts lets shipped code under src/game reach only
 * src/game, so a harness reachable from the authority has to be here.
 *
 * A CHECK RECORDS A FAULT AND RETURNS; IT DOES NOT THROW (ADR 0017).
 *
 * Every check for the tick runs, so the authority sees the complete fault set
 * before it decides anything, and check ordering cannot decide which faults are
 * observed. Under the throwing harness this replaced, the first fault aborted
 * every later check in the same tick: `entities in bounds` is recoverable and
 * ran fourth, ahead of the fatal `entity caps`, `entity ids` and `levels in
 * range`, so one recoverable fault switched three fatal ones off. A persistent
 * recoverable fault is the normal case here rather than an edge.
 *
 * An unexpected failure inside the checking machinery itself is a different
 * thing and still throws. Detecting a violated invariant is the checker
 * working; a checker that cannot run is a bug in the checker, and it must not
 * be swallowed into the list it exists to produce. So nothing here catches.
 *
 * Checking a cap is not enforcing one. caps.ts enforces; this only notices.
 */

import type { PoolSlot } from './caps';
import { CORPSE_CAP, MOB_CAP, MOB_FIRE_CAP, SKULL_CAP, WISP_CAP } from './caps';
import { FIELD_HEIGHT, FIELD_WIDTH } from './field';
import { graveHitbox } from './grave';
import { BIRTHRIGHT, MAX_LEVEL, WEAPON_LINES } from './lines/roster';
import { BELL_EXPAND_TICKS } from './lines/bell';
import { SKULL_HALF_EXTENT } from './lines/soulStream';
import { SPAWN_MARGIN } from './mobs';
import type { RunState } from './run';
import { RESERVOIR_CAPACITY, SIZE_CEILING, SIZE_FLOOR } from './tuning';

/**
 * Every fault this harness can record, as a closed append-only list (ADR 0017).
 *
 * The identity is written down here rather than taken from whatever string a
 * check happens to carry, because a fault record goes into a tape's third
 * section and hardens the moment the first tape exists. Twelve identities
 * against ten checks: checkPools carries two, the caps and the ids, and
 * checkStage carries two, one for each of the two things it watches. The
 * grave's own bounds check is "in bounds" and sits beside a
 * separate "entities in bounds", one fatal and one recoverable, which is the
 * pair a severity table most easily confuses.
 */
const FAULT_IDENTITIES = [
  'no NaN',
  'size within floor and ceiling',
  'in bounds',
  'entities in bounds',
  'entity caps',
  'entity ids',
  'freshness in range',
  'reservoir in range',
  'levels in range',
  'one live ring',
  'phase index only increases',
  'phase tick resets at a boundary',
] as const;

/** One member of the closed list above. */
type FaultIdentity = (typeof FAULT_IDENTITIES)[number];

/** Whether the run can safely carry on past a fault (ADR 0017). */
type FaultSeverity = 'fatal' | 'recoverable';

/**
 * How safe continued execution is after each fault, by semantic safety and
 * never by how cosmetic the symptom looks (ADR 0017).
 *
 * Fatal, six. NaN spreads and every comparison against it is false, so
 * containment, culling and collision quietly stop working. A level is an array
 * index rather than a meter, and every per-level table is sized to MAX_LEVEL.
 * Two live slots sharing an id send a wisp after a mob it never locked onto.
 * A grave outside the field puts the player off it, so collision and the Wall's
 * width arithmetic stop meaning anything. Size is health, so out of range means
 * the seal condition was missed and a run that should be over keeps playing.
 * And a pool whose shape changed means a structural assumption was violated
 * outside the pool API, after which no other check's answer is trustworthy.
 *
 * Recoverable, five checks and six identities. A stray entity is culled or
 * draws off-screen and nothing reads it wrong. A corpse pays the wrong amount
 * into a size the fatal check still guards. One line's charge is wrong and
 * payReservoir clamps it back. A bell ring over-expands within one line. And a
 * stage phase repeats or skips spawns while the simulation stays coherent.
 */
const FAULT_SEVERITY: Readonly<Record<FaultIdentity, FaultSeverity>> = {
  'no NaN': 'fatal',
  'size within floor and ceiling': 'fatal',
  'in bounds': 'fatal',
  'entities in bounds': 'recoverable',
  'entity caps': 'fatal',
  'entity ids': 'fatal',
  'freshness in range': 'recoverable',
  'reservoir in range': 'recoverable',
  'levels in range': 'fatal',
  'one live ring': 'recoverable',
  'phase index only increases': 'recoverable',
  'phase tick resets at a boundary': 'recoverable',
};

/** One invariant found broken on one tick. */
interface Fault {
  readonly identity: FaultIdentity;
  readonly severity: FaultSeverity;
  /** Where to find the offending number again, as "mob 12.vx is NaN". */
  readonly detail: string;
}

/**
 * Records a fault, at most once per identity per tick.
 *
 * One tick can break the same invariant in a hundred places, and a hundred rows
 * saying "no NaN" are one fact. The first detail is the one kept, so the pool
 * walk order still decides which number a reader is pointed at, exactly as it
 * did when the first failure threw.
 */
const record = (
  faults: Fault[],
  identity: FaultIdentity,
  detail: string,
): void => {
  if (faults.some((fault) => fault.identity === identity)) return;
  faults.push({ identity, severity: FAULT_SEVERITY[identity], detail });
};

/**
 * The three no-NaN predicates take the number and the words that name it as
 * separate arguments, and join them only on the branch that fails. checkNoNaN
 * runs over every live entity on every tick, so a message built up front is a
 * string allocated per field per entity per tick and thrown away unread. The
 * shapes they spell are the ones a reader needs to find the number again: the
 * pool, the slot and the field.
 */
const checkFinite = (faults: Fault[], where: string, value: number): void => {
  if (!Number.isFinite(value)) record(faults, 'no NaN', `${where} is ${value}`);
};

/** One field of one slot in a pool, as "mob 12.vx is NaN". */
const checkSlotFinite = (
  faults: Fault[],
  pool: string,
  id: number,
  field: string,
  value: number,
): void => {
  if (!Number.isFinite(value)) {
    record(faults, 'no NaN', `${pool} ${id}.${field} is ${value}`);
  }
};

/** One cell of a fixed-length array, as "lines.stoneRecharge[2] is NaN". */
const checkCellFinite = (
  faults: Fault[],
  where: string,
  index: number,
  value: number,
): void => {
  if (!Number.isFinite(value)) {
    record(faults, 'no NaN', `${where}[${index}] is ${value}`);
  }
};

/** The run's own numbers, and the grave's. */
const checkRunNoNaN = (state: RunState, faults: Fault[]): void => {
  checkFinite(faults, 'tick', state.tick);
  checkFinite(faults, 'score', state.score);
  checkFinite(faults, 'reservoir', state.reservoir);
  checkFinite(faults, 'grave.x', state.grave.x);
  checkFinite(faults, 'grave.y', state.grave.y);
  checkFinite(faults, 'grave.size', state.grave.size);
  checkFinite(faults, 'grave.invulnerable', state.grave.invulnerable);
  checkFinite(faults, 'killsSinceDrop', state.killsSinceDrop);
  checkFinite(faults, 'dropsPaid', state.dropsPaid);
  checkFinite(faults, 'nextEntityId', state.nextEntityId);
};

const checkMobsNoNaN = (state: RunState, faults: Fault[]): void => {
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    checkSlotFinite(faults, 'mob', mob.id, 'x', mob.x);
    checkSlotFinite(faults, 'mob', mob.id, 'y', mob.y);
    checkSlotFinite(faults, 'mob', mob.id, 'vx', mob.vx);
    checkSlotFinite(faults, 'mob', mob.id, 'vy', mob.vy);
    checkSlotFinite(faults, 'mob', mob.id, 'hp', mob.hp);
    checkSlotFinite(faults, 'mob', mob.id, 'beat', mob.beat);
    checkSlotFinite(faults, 'mob', mob.id, 'fireIn', mob.fireIn);
  }
};

const checkMobFireNoNaN = (state: RunState, faults: Fault[]): void => {
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    checkSlotFinite(faults, 'shot', shot.id, 'x', shot.x);
    checkSlotFinite(faults, 'shot', shot.id, 'y', shot.y);
    checkSlotFinite(faults, 'shot', shot.id, 'vx', shot.vx);
    checkSlotFinite(faults, 'shot', shot.id, 'vy', shot.vy);
  }
};

const checkCorpsesNoNaN = (state: RunState, faults: Fault[]): void => {
  for (const corpse of state.corpses) {
    if (!corpse.alive) continue;
    checkSlotFinite(faults, 'corpse', corpse.id, 'x', corpse.x);
    checkSlotFinite(faults, 'corpse', corpse.id, 'y', corpse.y);
    checkSlotFinite(faults, 'corpse', corpse.id, 'freshness', corpse.freshness);
    checkSlotFinite(faults, 'corpse', corpse.id, 'payout', corpse.payout);
  }
};

const checkSkullsNoNaN = (state: RunState, faults: Fault[]): void => {
  for (const skull of state.skulls) {
    if (!skull.alive) continue;
    checkSlotFinite(faults, 'skull', skull.id, 'x', skull.x);
    checkSlotFinite(faults, 'skull', skull.id, 'y', skull.y);
    checkSlotFinite(faults, 'skull', skull.id, 'vx', skull.vx);
    checkSlotFinite(faults, 'skull', skull.id, 'vy', skull.vy);
  }
};

const checkWispsNoNaN = (state: RunState, faults: Fault[]): void => {
  for (const wisp of state.wisps) {
    if (!wisp.alive) continue;
    checkSlotFinite(faults, 'wisp', wisp.id, 'x', wisp.x);
    checkSlotFinite(faults, 'wisp', wisp.id, 'y', wisp.y);
    checkSlotFinite(faults, 'wisp', wisp.id, 'vx', wisp.vx);
    checkSlotFinite(faults, 'wisp', wisp.id, 'vy', wisp.vy);
    checkSlotFinite(faults, 'wisp', wisp.id, 'life', wisp.life);
    // A null target is a legitimately untargeted wisp and never faults; only a
    // non-finite number does. The witness folds the absence through a sentinel.
    if (wisp.targetId !== null) {
      checkSlotFinite(faults, 'wisp', wisp.id, 'targetId', wisp.targetId);
    }
  }
};

const checkLinesNoNaN = (state: RunState, faults: Fault[]): void => {
  const { lines } = state;
  checkFinite(faults, 'lines.streamIn', lines.streamIn);
  checkFinite(faults, 'lines.surgeVolleys', lines.surgeVolleys);
  checkFinite(faults, 'lines.orbitPhase', lines.orbitPhase);
  checkFinite(faults, 'lines.tollIn', lines.tollIn);
  checkFinite(faults, 'lines.ring.ticks', lines.ring?.ticks ?? 0);
  checkFinite(faults, 'lines.ring.level', lines.ring?.level ?? 0);
  for (let slot = 0; slot < lines.stoneRecharge.length; slot++) {
    checkCellFinite(
      faults,
      'lines.stoneRecharge',
      slot,
      lines.stoneRecharge[slot],
    );
  }
};

/** The stage cursor's three counters. */
const checkStageNoNaN = (state: RunState, faults: Fault[]): void => {
  checkFinite(faults, 'stage.phaseIndex', state.stage.phaseIndex);
  checkFinite(faults, 'stage.phaseTick', state.stage.phaseTick);
  checkFinite(faults, 'stage.firedRows', state.stage.firedRows);
};

/**
 * The four weapon levels. The name is joined only on the failing branch, per
 * the discipline above; routing through checkFinite would build the template
 * string on every pass.
 */
const checkLevelsNoNaN = (state: RunState, faults: Fault[]): void => {
  for (const line of WEAPON_LINES) {
    const level = state.levels[line];
    if (!Number.isFinite(level)) {
      record(faults, 'no NaN', `levels.${line} is ${level}`);
    }
  }
};

/** The four stream cursors, each a getter over a closure counter (rng.ts). */
const checkStreamsNoNaN = (state: RunState, faults: Fault[]): void => {
  checkFinite(faults, 'streams.spawns.drawn', state.streams.spawns.drawn);
  checkFinite(faults, 'streams.drops.drawn', state.streams.drops.drawn);
  checkFinite(faults, 'streams.mobFire.drawn', state.streams.mobFire.drawn);
  checkFinite(faults, 'streams.shed.drawn', state.streams.shed.drawn);
};

/**
 * Every number the rules mutate. A NaN anywhere in here poisons the run
 * silently. The pools are walked in the order they are listed, so the field
 * that fails is the first one in that order, never whichever pool happens to
 * hold it.
 */
const checkNoNaN = (state: RunState, faults: Fault[]): void => {
  checkRunNoNaN(state, faults);
  checkMobsNoNaN(state, faults);
  checkMobFireNoNaN(state, faults);
  checkCorpsesNoNaN(state, faults);
  checkSkullsNoNaN(state, faults);
  checkWispsNoNaN(state, faults);
  checkLinesNoNaN(state, faults);
  checkStageNoNaN(state, faults);
  checkLevelsNoNaN(state, faults);
  checkStreamsNoNaN(state, faults);
};

/** Size is health, and ADR 0003 makes both ends of it hard. */
const checkSize = (state: RunState, faults: Fault[]): void => {
  const { size } = state.grave;
  if (size < SIZE_FLOOR || size > SIZE_CEILING) {
    record(faults, 'size within floor and ceiling', `size is ${size}`);
  }
};

/**
 * Rounding room, in field units. containGrave holds the grave's centre at
 * FIELD_HEIGHT minus its size, and the hitbox then computes (y - size) + 2 *
 * size, which is not the same binary64 expression: re-associating it overshoots
 * by up to 1.1e-13 at sizes the grave actually reaches. The tolerance is eleven
 * thousand times larger than that worst case and four thousand times smaller
 * than one CSS pixel on a phone, so a grave that has really left the field can
 * never hide under it.
 */
const BOUNDS_TOLERANCE = 1e-9;

/** The whole grave, not just its centre, stays on the field. */
const checkInBounds = (state: RunState, faults: Fault[]): void => {
  const box = graveHitbox(state.grave);
  const inside =
    box.x >= -BOUNDS_TOLERANCE &&
    box.y >= -BOUNDS_TOLERANCE &&
    box.x + box.width <= FIELD_WIDTH + BOUNDS_TOLERANCE &&
    box.y + box.height <= FIELD_HEIGHT + BOUNDS_TOLERANCE;
  if (!inside) {
    record(
      faults,
      'in bounds',
      `the grave is outside the field at ${box.x}, ${box.y}`,
    );
  }
};

/** A point inside the field widened by a margin on every side. */
const within = (x: number, y: number, margin: number): boolean => {
  return (
    x >= -margin &&
    y >= -margin &&
    x <= FIELD_WIDTH + margin &&
    y <= FIELD_HEIGHT + margin
  );
};

/**
 * Mobs and corpses legitimately exist above the top edge before they arrive, so
 * the box they are checked against is the field widened by a spawn margin.
 * Shots never spawn off the field, so they are only allowed their own extent.
 */
const checkEntitiesInBounds = (state: RunState, faults: Fault[]): void => {
  for (const mob of state.mobs) {
    if (!mob.alive) continue;
    if (!within(mob.x, mob.y, SPAWN_MARGIN)) {
      record(
        faults,
        'entities in bounds',
        `mob ${mob.id} is at ${mob.x}, ${mob.y}`,
      );
    }
  }
  for (const corpse of state.corpses) {
    if (!corpse.alive) continue;
    if (!within(corpse.x, corpse.y, SPAWN_MARGIN)) {
      record(
        faults,
        'entities in bounds',
        `corpse ${corpse.id} is at ${corpse.x}, ${corpse.y}`,
      );
    }
  }
  for (const shot of state.mobFire) {
    if (!shot.alive) continue;
    if (!within(shot.x, shot.y, shot.halfExtent)) {
      record(
        faults,
        'entities in bounds',
        `shot ${shot.id} is at ${shot.x}, ${shot.y}`,
      );
    }
  }
  // A skull is launched from the mouth and travels straight up, so its own
  // extent is the right box, exactly as a shot's is.
  for (const skull of state.skulls) {
    if (!skull.alive) continue;
    if (!within(skull.x, skull.y, SKULL_HALF_EXTENT)) {
      record(
        faults,
        'entities in bounds',
        `skull ${skull.id} is at ${skull.x}, ${skull.y}`,
      );
    }
  }
  // A wisp is checked against the spawn margin and never against its own
  // extent: cullMobs legitimately allows a mob out to SPAWN_MARGIN, a wisp
  // homes on the mob it was given, and whichever box a wisp is checked against
  // has to be the box its target is allowed to be in.
  for (const wisp of state.wisps) {
    if (!wisp.alive) continue;
    if (!within(wisp.x, wisp.y, SPAWN_MARGIN)) {
      record(
        faults,
        'entities in bounds',
        `wisp ${wisp.id} is at ${wisp.x}, ${wisp.y}`,
      );
    }
  }
};

const checkPool = (
  faults: Fault[],
  name: string,
  pool: readonly PoolSlot[],
  cap: number,
): void => {
  if (pool.length > cap) {
    record(
      faults,
      'entity caps',
      `the ${name} pool holds ${pool.length} slots`,
    );
  }
  const seen = new Set<number>();
  for (const slot of pool) {
    if (!slot.alive) continue;
    if (seen.has(slot.id)) {
      record(
        faults,
        'entity ids',
        `two live ${name} slots share id ${slot.id}`,
      );
    }
    seen.add(slot.id);
  }
};

const checkPools = (state: RunState, faults: Fault[]): void => {
  checkPool(faults, 'mob', state.mobs, MOB_CAP);
  checkPool(faults, 'mob fire', state.mobFire, MOB_FIRE_CAP);
  checkPool(faults, 'corpse', state.corpses, CORPSE_CAP);
  checkPool(faults, 'skull', state.skulls, SKULL_CAP);
  checkPool(faults, 'wisp', state.wisps, WISP_CAP);
};

/**
 * Rounding room on the reservoir, in size units.
 *
 * payReservoir computes taken as CAP minus the reservoir and then adds it back,
 * and r + (CAP - r) can exceed CAP by an ulp in binary64. The tolerance is far
 * smaller than the smallest charge any food can pay, so a reservoir that has
 * really overfilled can never hide under it. Clamping in payReservoir instead
 * would move arithmetic the golden digest pins and buy nothing this does not.
 */
const RESERVOIR_TOLERANCE = 1e-9;

/** The belch's charge is a meter with two hard ends, and the belch now empties it (ADR 0008). */
const checkReservoir = (state: RunState, faults: Fault[]): void => {
  const { reservoir } = state;
  if (
    reservoir < -RESERVOIR_TOLERANCE ||
    reservoir > RESERVOIR_CAPACITY + RESERVOIR_TOLERANCE
  ) {
    record(faults, 'reservoir in range', `the reservoir holds ${reservoir}`);
  }
};

/**
 * Every level sits between zero and MAX_LEVEL, and a birthright line never falls
 * below one. The floor ladder strips levels and payLevel raises them, and both
 * write to the same record.
 */
const checkLevels = (state: RunState, faults: Fault[]): void => {
  for (const line of WEAPON_LINES) {
    const level = state.levels[line];
    const floor = BIRTHRIGHT.includes(line) ? 1 : 0;
    if (level < floor || level > MAX_LEVEL) {
      record(faults, 'levels in range', `${line} is at level ${level}`);
    }
  }
};

/**
 * At most one bell ring is live. The record holds one or none, so this checks
 * the other half: a ring never outlives its own expansion.
 */
const checkRing = (state: RunState, faults: Fault[]): void => {
  const ring = state.lines.ring;
  if (ring === null) return;
  if (ring.ticks < 0 || ring.ticks > BELL_EXPAND_TICKS) {
    record(faults, 'one live ring', `a ring has run for ${ring.ticks} ticks`);
  }
};

/** Freshness is a meter from 1 to 0 and never leaves that range (ADR 0004). */
const checkFreshness = (state: RunState, faults: Fault[]): void => {
  for (const corpse of state.corpses) {
    if (!corpse.alive) continue;
    if (corpse.freshness < 0 || corpse.freshness > 1) {
      record(
        faults,
        'freshness in range',
        `corpse ${corpse.id} has freshness ${corpse.freshness}`,
      );
    }
  }
};

/** One reading of the stage cursor, as the last passing check saw it. */
interface StagePhase {
  readonly phaseIndex: number;
  readonly phaseTick: number;
}

/**
 * What the last check saw of the stage, so the two invariants that are about
 * change rather than about a single state have something to compare with.
 *
 * It is a field on Execution and never on RunState (ADR 0017). The WeakMap this
 * replaced was giving lifetime away for free: the watch died with the run, and
 * every caller got correct stage history without knowing the mechanism existed.
 * Execution is held by a pooled screen, so the lifetime is now somebody's job.
 * RunState is the wrong home for the other reason: ADR 0019 widens the witness
 * fold, so what lives there is what a replay is checked against, and a phase
 * watch is neither the run's identity nor something the rules mutate.
 */
interface StageWatch {
  /** Null before the first check, which has nothing to compare against. */
  seen: StagePhase | null;
}

const createStageWatch = (): StageWatch => {
  return { seen: null };
};

/**
 * The phase index only ever increases, and the phase-local tick resets at a
 * boundary. The tick is read after the step has already advanced it, so a reset
 * shows as a tick of one rather than of zero.
 */
const checkStage = (
  state: RunState,
  watch: StageWatch,
  faults: Fault[],
): void => {
  const { seen } = watch;
  const now: StagePhase = {
    phaseIndex: state.stage.phaseIndex,
    phaseTick: state.stage.phaseTick,
  };
  let passed = true;
  if (seen !== null) {
    if (now.phaseIndex < seen.phaseIndex) {
      record(
        faults,
        'phase index only increases',
        `phase went from ${seen.phaseIndex} to ${now.phaseIndex}`,
      );
      passed = false;
    }
    if (now.phaseIndex > seen.phaseIndex && now.phaseTick > 1) {
      record(
        faults,
        'phase tick resets at a boundary',
        `phase tick is ${now.phaseTick} on the tick the phase changed`,
      );
      passed = false;
    }
  }
  // Recorded only once both checks pass. Recording first means a recorded
  // failure leaves the rejected phase in the watch, so the next check on the
  // same run compares against it and reports the broken state as healthy.
  if (passed) watch.seen = now;
};

/**
 * Every invariant the rules must never break, checked once, with the faults
 * found returned rather than thrown (ADR 0013, ADR 0017).
 *
 * The watch is a required parameter and never an optional one. Made optional,
 * the direct call sites would silently stop checking phase monotonicity and
 * phase-tick reset, and the tests that exist precisely to exercise the watch
 * would go green while checking nothing.
 */
const checkInvariants = (
  state: RunState,
  watch: StageWatch,
): readonly Fault[] => {
  const faults: Fault[] = [];
  checkNoNaN(state, faults);
  checkSize(state, faults);
  checkInBounds(state, faults);
  checkEntitiesInBounds(state, faults);
  checkPools(state, faults);
  checkFreshness(state, faults);
  checkReservoir(state, faults);
  checkLevels(state, faults);
  checkRing(state, faults);
  checkStage(state, watch, faults);
  return faults;
};

export { createStageWatch, checkInvariants, FAULT_IDENTITIES, FAULT_SEVERITY };
export type { FaultIdentity, FaultSeverity, Fault, StageWatch };
