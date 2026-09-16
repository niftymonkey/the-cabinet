// The witness (ADR 0019): the number a run folds its own state down to.

import type { Boss } from './bosses/phases';
import type { Corpse } from './corpses';
import type { DirectorState } from './director';
import type { Grave } from './grave';
import type { BellToll } from './lines/bell';
import type { WeaponLine } from './lines/roster';
import { WEAPON_LINES } from './lines/roster';
import type { CorpseTier, MobOrigin } from './mobs';
import type { StreamName } from './rng';
import type { LineState, RunEnding, RunState } from './run';
import type { Impulse } from './shove';
import type { BossKind } from './stage/waves';
import type { SetPiece } from './stage/setPiece';
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
  'powerUps',
  'mobFire',
  'shed',
  'territory',
  'director',
  'bossFire',
  'pour',
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
 *
 * **6 to 7, and these are the nine fields the move declares.** Every one is
 * added by the same commit that stamps the version, because a version stamped
 * before the fold stops moving names several folds
 * (apps/hungry-grave/docs/lessons.md, The sim).
 *
 * - `streams.director.drawn`, `streams.bossFire.drawn` and `streams.pour.drawn`.
 *   The director's dice come from its own named stream (ADR 0047), and #108's
 *   two draw sites take their own names, so retuning the Banshee's ring jitter
 *   or the Waking's pour moves no other system's draws on a fixed seed. Every
 *   cursor a run holds is folded, so three new streams are three new fields.
 * - `director.signal.value`, `director.signal.heldUntilTick`,
 *   `director.purseLeft` and `director.quietUntilTick`. A replay that could not
 *   rebuild the director would be a replay of a different run (ADR 0019).
 * - `mobs[].from`, where a live body came from. It folds rather than being
 *   excluded on `carries`'s precedent and not `type`'s: a divergence in type
 *   shows through the health and motion the walk already folds, and provenance
 *   shows through nothing at all, because an authored body and a directed one
 *   are identical in every other folded field.
 * - `lines.volleyIn`, the wisps' volley clock. Every field of LineState is
 *   folded, and the clock decides whether a swallow fires at all.
 *
 * **What the move costs, stated rather than discovered.** Every tape recorded
 * before this commit is refused by its version, which is ADR 0019's refusal
 * rule doing its job. That is also what makes two draw sites legitimate to move
 * here and nowhere else: taking the Banshee's nudge off the mobFire stream and
 * the pour's jitter off the spawns stream changes both of those cursors for
 * every run that reaches either moment, and the version move in this same
 * commit refuses every tape that could have noticed before a checkpoint is ever
 * compared.
 *
 * **7 to 8, and these are the seven fields the move declares.** They are the
 * one impulse a body carries (shove.ts), and every one of them is added by the
 * same commit that stamps the version, for the reason above. A shove is written
 * by the rules and rebuilt by a replay, so none of them is excluded: a body
 * three ticks into a forty-unit shove is in a state nothing else on the run
 * shows, and a replay that folded only its position would call two different
 * runs the same one on the tick the shove ends.
 *
 * - `mobs[].impulse.stepX` and `mobs[].impulse.stepY`, the travel the first
 *   tick of the current shove owes. They are what the remaining ticks are
 *   computed from, so a divergence in either is a divergence in every tick
 *   still to come.
 * - `mobs[].impulse.ticksLeft`, how much of the shove is left. It decides
 *   whether the body walks at all this tick, which is the third ruling of the
 *   design record, so it is a rule and not only a clock.
 * - `mobs[].impulse.travelled`, what the body has really been carried. It is
 *   what the one mobShoved event reports when the impulse is spent, and the
 *   bounds can refuse part of a step, so it cannot be derived from the impulse
 *   alone.
 * - `mobs[].impulse.shovesLeft`, `mobs[].impulse.nextIn` and
 *   `mobs[].impulse.spacing`, the wave structure. The bell passes one shove and
 *   no spacing; the belch passes three, spaced by its own row (design record R3
 *   as superseded), and
 *   they are declared here rather than the day that caller is written, because
 *   a field arriving later would change what every tape recorded in between
 *   folded, which is exactly what `mobs[].from` was declared early to avoid.
 *
 * **What this move costs, again stated rather than discovered.** Every tape
 * recorded before this commit is refused by its version and not one of them
 * replays at this tip, which is the fourth time step 4 has made saved tapes a
 * dead baseline. It is taken eyes open on the design record's ruling R1.
 *
 * **8 to 9, 2026-09-16, and these are the seven fields the move declares.**
 * They are the one impulse a corpse carries (corpses.ts), and every one of them
 * is added by the same commit that stamps the version, for the reason above.
 *
 * - `corpses[].impulse.stepX`, `corpses[].impulse.stepY`,
 *   `corpses[].impulse.ticksLeft`, `corpses[].impulse.travelled`,
 *   `corpses[].impulse.shovesLeft`, `corpses[].impulse.nextIn` and
 *   `corpses[].impulse.spacing`. Each folds for exactly the reason its mob
 *   twin above does, because it is the same record on a second pool: a shove
 *   now outlives the body carrying it and is handed to the corpse the kill
 *   leaves, so a corpse three ticks into a sixty-unit flight is in a state
 *   nothing else on the run shows, and a replay that folded only its position
 *   would call two different runs the same one on the tick the flight ends
 *   (design record R10's separate-clocks lever, taken 2026-09-16).
 *
 * `impulse.bodyId` is not among them and is excluded on `impulse.source`'s own
 * terms, on both pools: it is written once when the shove starts and never
 * mutated, no rule reads it, and its one consumer is the mobShoved event a
 * reading counts off a tape (witness.test.ts's EXCLUDED).
 *
 * **What this move costs, again stated rather than discovered.** Every tape
 * recorded before this commit is refused by its version and not one of them
 * replays at this tip, which is the fifth time this step has made saved tapes a
 * dead baseline. It is taken eyes open, and it exceeds the design record's
 * section 5, which permits the witness exactly one move in round two: it is the
 * orchestrator's call under one-push mode, taken as the arithmetic of R10's own
 * deferral rather than as a new decision.
 */
const WITNESS_VERSION = 9;

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
  powerUp: 2,
  feast: 3,
};

/**
 * Code 2 was the headstones' and is retired rather than reused (#76). The map is
 * append-only: handing Territory the vacated code would silently change what
 * every tape recorded before the swap folded, which is precisely what reading
 * by name rather than by position exists to prevent.
 */
const WEAPON_LINE_CODES: Readonly<Record<WeaponLine, number>> = {
  skullStream: 1,
  wisps: 3,
  bell: 4,
  territory: 5,
};

// Which boss stands on the field, on the same append-only terms as every other
// union here: read by name, never by a member's position.
const BOSS_KIND_CODES: Readonly<Record<BossKind, number>> = {
  banshee: 1,
  undertaker: 2,
};

/**
 * What put a live body on the field, on the same append-only terms. `directed`
 * has no producer until the director spends, and it takes its code here rather
 * than the day it does, because a code arriving later would change what every
 * tape recorded in between folded.
 */
const MOB_ORIGIN_CODES: Readonly<Record<MobOrigin, number>> = {
  wave: 1,
  standingWave: 2,
  setPiece: 3,
  boss: 4,
  directed: 5,
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

/**
 * The shove one carrier is carrying (shove.ts). It appends after the carrier's
 * own fields rather than sitting beside the velocity it is not, because a
 * widening appends and never reshuffles what is already in place, and because
 * the shove is a second motion rather than a change to the first.
 *
 * One function over both pools rather than two, because it is one record: a
 * shove handed from a body to the corpse it left is the same seven numbers, and
 * two copies is where the two folds drift apart.
 */
const foldImpulse = (checksum: number, impulse: Impulse): number => {
  let next = fold(fold(checksum, impulse.stepX), impulse.stepY);
  next = fold(fold(next, impulse.ticksLeft), impulse.travelled);
  next = fold(fold(next, impulse.shovesLeft), impulse.nextIn);
  return fold(next, impulse.spacing);
};

const foldMobs = (checksum: number, run: RunState): number => {
  let next = checksum;
  for (const mob of run.mobs) {
    if (!mob.alive) continue;
    next = fold(fold(fold(fold(next, mob.x), mob.y), mob.vx), mob.vy);
    next = fold(fold(fold(next, mob.hp), mob.beat), mob.fireIn);
    next = fold(fold(next, boolCode(mob.armed)), boolCode(mob.carries));
    next = fold(next, MOB_ORIGIN_CODES[mob.from]);
    next = foldImpulse(next, mob.impulse);
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
    next = foldImpulse(next, corpse.impulse);
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

// The economy and the run's own totals.
const foldTotals = (checksum: number, run: RunState): number => {
  let next = fold(fold(checksum, run.score), run.reservoir);
  next = fold(next, endingCode(run.ending));
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
  const next = fold(fold(checksum, stage.sectionIndex), stage.sectionTick);
  return fold(next, stage.firedWaves);
};

/**
 * An absent ring folds its own sentinel rather than being skipped. Skipping it
 * would make a run with no ring and a run whose ring folds to zero one witness.
 */
const foldRing = (checksum: number, ring: BellToll | null): number => {
  if (ring === null) return fold(checksum, ABSENT_CODE);
  const next = fold(fold(checksum, 1), ring.level);
  return foldStruck(fold(next, ring.ticks), ring.struck);
};

const foldLines = (checksum: number, lines: LineState): number => {
  const next = fold(fold(checksum, lines.streamIn), lines.surgeVolleys);
  // layIn appends after the ring rather than sitting beside the other clocks,
  // because a widening appends and never reshuffles what is already in place.
  // volleyIn appends after layIn on the same rule.
  const withLay = fold(
    foldRing(fold(next, lines.tollIn), lines.ring),
    lines.layIn,
  );
  return fold(withLay, lines.volleyIn);
};

/**
 * The director's own state (ADR 0047). Its three fields fold in the order they
 * are declared in, the signal's two numbers first, because the order is part of
 * the value exactly as it is everywhere else in here.
 */
const foldDirector = (checksum: number, director: DirectorState): number => {
  const signal = director.signal;
  const next = fold(fold(checksum, signal.value), signal.heldUntilTick);
  return fold(fold(next, director.purseLeft), director.quietUntilTick);
};

/**
 * The offer standing on the field and the bank behind it (ADR 0034).
 *
 * An absent offer folds its own sentinel rather than being skipped, exactly as
 * an absent ring does. The option count folds before the options, so an offer
 * that shrank as lines maxed cannot fold the same as a longer one whose extra
 * option happens to fold to the same word, and the body ids fold beside them
 * because which body carries which option is the whole of the choice.
 */
const foldOffer = (checksum: number, run: RunState): number => {
  const offer = run.offer;
  if (offer === null) {
    return fold(fold(checksum, ABSENT_CODE), run.bankedOffers);
  }
  let next = fold(fold(checksum, 1), offer.options.length);
  for (const line of offer.options) next = fold(next, WEAPON_LINE_CODES[line]);
  for (const id of offer.bodyIds) next = fold(next, id);
  return fold(next, run.bankedOffers);
};

/**
 * The one boss on the field (ADR 0007).
 *
 * An absent boss folds its own sentinel rather than being skipped, exactly as
 * an absent ring does. Which boss stands folds beside its state rather than
 * being left to the state to imply, because the two bosses are one record's
 * worth of numbers apart and which one the fight is against is the whole of it.
 *
 * The phase and the flash fold beside the health because they are what the
 * health means: the same hp under a different phase is a different fight, and a
 * live flash is a tick on which the storm does nothing.
 */
const foldBoss = (checksum: number, boss: Boss | null): number => {
  if (boss === null) return fold(checksum, ABSENT_CODE);
  let next = fold(fold(checksum, 1), BOSS_KIND_CODES[boss.kind]);
  next = fold(fold(fold(next, boss.phaseIndex), boss.hp), boss.flash);
  return fold(fold(fold(next, boss.x), boss.y), boss.patternTick);
};

/**
 * The one set piece on the field (ADR 0042), on the same terms as the boss: an
 * absent one folds its own sentinel, and what is folded is what the rules
 * mutate, the source's place, whether it has opened, what it has left to pour,
 * its own clock and its health.
 */
const foldSetPiece = (checksum: number, piece: SetPiece | null): number => {
  if (piece === null) return fold(checksum, ABSENT_CODE);
  let next = fold(fold(fold(checksum, 1), piece.x), piece.y);
  next = fold(next, boolCode(piece.open));
  return fold(fold(fold(next, piece.budget), piece.pourIn), piece.hp);
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
  checksum = foldOffer(foldLines(checksum, run.lines), run);
  checksum = foldSetPiece(foldBoss(checksum, run.boss), run.setPiece);
  return foldDirector(checksum, run.director);
};

export {
  boolCode,
  foldWitness,
  WITNESS_VERSION,
  ABSENT_CODE,
  NO_TARGET_ID,
  RUN_ENDING_CODES,
  BOSS_KIND_CODES,
  CORPSE_TIER_CODES,
  FOOD_KIND_CODES,
  MOB_ORIGIN_CODES,
  WEAPON_LINE_CODES,
};
