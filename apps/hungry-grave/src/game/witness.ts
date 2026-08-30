// The witness (ADR 0019): the number a run folds its own state down to.

import type { Corpse } from './corpses';
import type { Grave } from './grave';
import type { BellRing } from './lines/bell';
import type { WeaponLine } from './lines/roster';
import { WEAPON_LINES } from './lines/roster';
import type { CorpseTier } from './mobs';
import type { StreamName } from './rng';
import type { LineState, RunEnding, RunState } from './run';
import type { StageState } from './stage/stage';
import type { FoodKind } from './swallow';

/**
 * The order the streams' cursors fold in. It is spelled out rather than read
 * off the record's keys, because a fold whose order depends on insertion order
 * is a fold nobody can reproduce from the type alone. It is append-only: a new
 * name goes last, so every cursor keeps the place it already folded in.
 */
const STREAM_ORDER: readonly StreamName[] = [
  'spawns',
  'drops',
  'mobFire',
  'shed',
  'territory',
];

/**
 * The fold's own version, separate from a tape's format version (ADR 0019).
 *
 * The fold demonstrably widens and a second widening is likely. Without a
 * version, every tape recorded before a widening would report a divergence
 * under the refusal rule, and nothing would distinguish a widened fold from a run
 * that did not happen. It is stamped into a tape's header
 * and read back there, so it moves only when the order or the field list below
 * moves.
 */
const WITNESS_VERSION = 4;

/**
 * Integer-only folding at a fixed nine decimal places, so the checksum cannot
 * itself diverge between engines.
 *
 * Nine and not six. One f32 ulp at the ghoul's turn cosine is about 1.19e-7,
 * which is below a six-place quantum: a single-tick divergence of exactly the
 * size ADR 0015 exists to catch was invisible, and only showed once it had
 * accumulated into position. Math.round(760 * 1e9) stays inside ToInt32's range
 * deterministically, so the finer fold costs nothing.
 */
const fold = (checksum: number, value: number): number => {
  return (Math.imul(checksum, 31) + Math.round(value * 1e9)) | 0;
};

/**
 * The code a field takes when it is absent: a null ring, a corpse with no line.
 * No member of any code map below may ever take it, or an absent field and a
 * present one become the same witness.
 */
const ABSENT_CODE = 0;

/**
 * What a wisp with no target folds through. nextEntityId starts at 1 and only
 * ever increases, so 0 is an id no entity can hold.
 */
const NO_TARGET_ID = 0;

/**
 * The string unions' codes, append-only and read by name. A code is never a
 * member's ordinal position in the union: reordering the union would then move
 * every tape's witness with no version bump and no diff anybody reads as
 * dangerous. Each map is typed as a total Record, so adding a member to a union
 * fails the typecheck until somebody gives it a code.
 */
const RUN_ENDING_CODES: Readonly<Record<RunEnding, number>> = {
  sealed: 1,
  victory: 2,
};

const CORPSE_TIER_CODES: Readonly<Record<CorpseTier, number>> = {
  trash: 1,
  rich: 2,
};

const FOOD_KIND_CODES: Readonly<Record<FoodKind, number>> = {
  corpse: 1,
  drop: 2,
  feast: 3,
};

/**
 * Code 2 was the headstones' and is retired rather than reused (#76). The map is
 * append-only: handing Territory the vacated code would silently change what
 * every tape recorded before the swap folded, which is precisely what reading
 * by name rather than by position exists to prevent.
 */
const WEAPON_LINE_CODES: Readonly<Record<WeaponLine, number>> = {
  soulStream: 1,
  wisps: 3,
  bell: 4,
  territory: 5,
};

// A boolean's encoding, spelled out so it is visible at the call site.
const boolCode = (value: boolean): number => {
  return value ? 1 : 0;
};

const foldGrave = (checksum: number, grave: Grave): number => {
  let next = fold(checksum, grave.x);
  next = fold(next, grave.y);
  next = fold(next, grave.size);
  return fold(next, grave.invulnerable);
};

const foldMobs = (checksum: number, run: RunState): number => {
  let next = checksum;
  for (const mob of run.mobs) {
    if (!mob.alive) continue;
    next = fold(fold(fold(fold(next, mob.x), mob.y), mob.vx), mob.vy);
    next = fold(fold(fold(next, mob.hp), mob.beat), mob.fireIn);
    next = fold(next, boolCode(mob.armed));
  }
  return next;
};

const foldMobFire = (checksum: number, run: RunState): number => {
  let next = checksum;
  for (const shot of run.mobFire) {
    if (!shot.alive) continue;
    next = fold(fold(fold(fold(next, shot.x), shot.y), shot.vx), shot.vy);
  }
  return next;
};

// A corpse's line is optional, so it folds through the reserved absent code.
const corpseLineCode = (corpse: Corpse): number => {
  if (corpse.line === undefined) return ABSENT_CODE;
  return WEAPON_LINE_CODES[corpse.line];
};

const foldCorpses = (checksum: number, run: RunState): number => {
  let next = checksum;
  for (const corpse of run.corpses) {
    if (!corpse.alive) continue;
    next = fold(fold(fold(next, corpse.x), corpse.y), corpse.freshness);
    next = fold(next, corpse.payout);
    next = fold(next, CORPSE_TIER_CODES[corpse.tier]);
    next = fold(next, FOOD_KIND_CODES[corpse.kind]);
    next = fold(next, corpseLineCode(corpse));
  }
  return next;
};

const foldSkulls = (checksum: number, run: RunState): number => {
  let next = checksum;
  for (const skull of run.skulls) {
    if (!skull.alive) continue;
    next = fold(fold(fold(fold(next, skull.x), skull.y), skull.vx), skull.vy);
  }
  return next;
};

const foldWisps = (checksum: number, run: RunState): number => {
  let next = checksum;
  for (const wisp of run.wisps) {
    if (!wisp.alive) continue;
    next = fold(fold(fold(fold(next, wisp.x), wisp.y), wisp.vx), wisp.vy);
    next = fold(next, wisp.life);
    next = fold(next, wisp.targetId ?? NO_TARGET_ID);
  }
  return next;
};

/**
 * A set of struck mob ids: its size folds before its members, and the members
 * fold in iteration order. That order is deterministic because insertion
 * follows the mob pool's slot order.
 */
const foldStruck = (checksum: number, struck: ReadonlySet<number>): number => {
  let next = fold(checksum, struck.size);
  for (const id of struck) next = fold(next, id);
  return next;
};

/**
 * A patch's re-hit map: its size folds before its entries, and each entry
 * folds id then deadline, in insertion order. With pruning, a re-added id
 * moves to the end, so the order is chronological across resolve passes
 * rather than slot order, and it is still fully deterministic because the hit
 * history is deterministic. IT IS NEVER SORTED: sorting would fold a
 * different order than the map actually holds.
 */
const foldRehits = (
  checksum: number,
  struck: ReadonlyMap<number, number>,
): number => {
  let next = fold(checksum, struck.size);
  for (const [id, eligibleAt] of struck) {
    next = fold(fold(next, id), eligibleAt);
  }
  return next;
};

/**
 * A patch's own state, its re-hit map included: the map is what makes one
 * pulse per window per mob a fact a replay can check, and the pulse count is
 * what says how much traffic the ground has punished.
 *
 * The captured pull, slow and re-hit window fold beside the captured radius.
 * All four are written once from the level's ladder and never move again, so
 * they carry the same evidence: a patch controlling at a strength its birth
 * level never bought is a divergence the levels alone cannot show.
 */
const foldPatches = (checksum: number, run: RunState): number => {
  let next = checksum;
  for (const patch of run.patches) {
    if (!patch.alive) continue;
    next = fold(fold(next, patch.x), patch.y);
    next = fold(fold(next, patch.radius), patch.pull);
    next = fold(fold(next, patch.slow), patch.rehit);
    next = fold(next, patch.opening);
    next = foldRehits(fold(next, patch.pulses), patch.struck);
  }
  return next;
};

/**
 * Every live entity's own state, in slot order. Slot order is the point as much
 * as the values are: a pool walked in a different order gives a different
 * checksum, so iteration order is verified rather than assumed.
 */
const foldEntities = (checksum: number, run: RunState): number => {
  let next = foldMobs(checksum, run);
  next = foldMobFire(next, run);
  next = foldCorpses(next, run);
  next = foldSkulls(next, run);
  next = foldWisps(next, run);
  return foldPatches(next, run);
};

// The economy and the run's own totals, ADR 0002's drop pricing included.
const foldTotals = (checksum: number, run: RunState): number => {
  let next = fold(fold(checksum, run.score), run.reservoir);
  next = fold(next, endingCode(run.ending));
  next = fold(fold(next, run.killsSinceDrop), run.dropsPaid);
  return fold(next, run.nextEntityId);
};

// An absent ending is live rather than finished, so it takes the absent code.
const endingCode = (ending: RunEnding | null): number => {
  if (ending === null) return ABSENT_CODE;
  return RUN_ENDING_CODES[ending];
};

const foldLevels = (checksum: number, run: RunState): number => {
  let next = checksum;
  for (const line of WEAPON_LINES) next = fold(next, run.levels[line]);
  return next;
};

const foldStreams = (checksum: number, run: RunState): number => {
  let next = checksum;
  for (const name of STREAM_ORDER) next = fold(next, run.streams[name].drawn);
  return next;
};

const foldStage = (checksum: number, stage: StageState): number => {
  const next = fold(fold(checksum, stage.phaseIndex), stage.phaseTick);
  return fold(next, stage.firedRows);
};

/**
 * An absent ring folds its own sentinel rather than being skipped. Skipping it
 * would make a run with no ring and a run whose ring folds to zero one witness.
 */
const foldRing = (checksum: number, ring: BellRing | null): number => {
  if (ring === null) return fold(checksum, ABSENT_CODE);
  const next = fold(fold(checksum, 1), ring.level);
  return foldStruck(fold(next, ring.ticks), ring.struck);
};

const foldLines = (checksum: number, lines: LineState): number => {
  const next = fold(fold(checksum, lines.streamIn), lines.surgeVolleys);
  // layIn appends after the ring rather than sitting beside the other clocks,
  // because a widening appends and never reshuffles what is already in place.
  return fold(foldRing(fold(next, lines.tollIn), lines.ring), lines.layIn);
};

/**
 * The whole run, folded into one integer from a starting value (ADR 0019). One
 * function with a starting-value parameter, used two ways rather than being two
 * behaviours: chained across ticks for the golden digest's accumulator, and as
 * an independent snapshot at a tape's checkpoints.
 *
 * It lives in src/game rather than in src/dev because a replay ships and ADR
 * 0013 keeps the verification rig out of the shipped game.
 *
 * The field list is closed by ADR 0019 and held closed by the partition in
 * witness.test.ts, which walks the nested value types and fails on a field at
 * any depth that neither half of it has decided about.
 */
const foldWitness = (run: RunState, from: number): number => {
  // THE ORDER IS PART OF THE VALUE. Every tape ever recorded is folded in the
  // order written here, so a widening appends and never reshuffles what is
  // already in place. Readability loses to a stable baseline.
  let checksum = foldGrave(from, run.grave);
  checksum = foldEntities(checksum, run);
  checksum = foldTotals(checksum, run);
  checksum = foldLevels(checksum, run);
  checksum = foldStreams(checksum, run);
  checksum = foldStage(checksum, run.stage);
  return foldLines(checksum, run.lines);
};

export {
  boolCode,
  foldWitness,
  WITNESS_VERSION,
  ABSENT_CODE,
  NO_TARGET_ID,
  RUN_ENDING_CODES,
  CORPSE_TIER_CODES,
  FOOD_KIND_CODES,
  WEAPON_LINE_CODES,
};
