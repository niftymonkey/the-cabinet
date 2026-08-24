import type { Corpse } from "./corpses";
import { createCorpsePool } from "./corpses";
import type { Grave } from "./grave";
import { createGrave } from "./grave";
import type { BellRing } from "./lines/bell";
import { BELL_PERIOD } from "./lines/bell";
import { MAX_STONES } from "./lines/headstones";
import type { WeaponLine } from "./lines/roster";
import { BIRTHRIGHT } from "./lines/roster";
import type { Skull } from "./lines/soulStream";
import { createSkullPool, STREAM_INTERVAL } from "./lines/soulStream";
import type { Wisp } from "./lines/wisps";
import { createWispPool } from "./lines/wisps";
import type { Mob, Shot } from "./mobs";
import { createMobPool, createShotPool } from "./mobs";
import type { Stream, StreamName } from "./rng";
import { stream } from "./rng";
import type { StageState } from "./stage/stage";
import { createStage } from "./stage/stage";
import { SIZE_START } from "./tuning";

// A move command in base-speed units, produced by an input model (ADR 0011).
export interface MoveCommand {
  readonly x: number;
  readonly y: number;
}

/**
 * Everything one tick is asked to do. The belch arrives through the same door
 * the move does, because it is a rule of the sim and has to have a place in the
 * tick order: the alternative is a screen calling fireBelch beside advance,
 * which puts a game rule in a screen and puts the belch outside the order the
 * tick documents.
 */
export interface TickCommand {
  readonly move: MoveCommand;
  readonly belch: boolean;
}

/** How a run finishes. Null while it is live. */
export type RunEnding = "sealed" | "victory";

/**
 * The weapon lines' own clocks and phases, as one record rather than six fields
 * scattered across the run.
 *
 * The grouping buys readability and not leak safety: RunState is built fresh by
 * createRun on every run, so nothing in here can survive a pooled screen. What
 * it does buy is that the stream's clock, the orbit's phase and the bell's ring
 * read as one subsystem's state, and that createRun initializes them in one
 * place a reader can check at a glance.
 */
export interface LineState {
  /** Ticks to the next stream volley. */
  streamIn: number;
  /** Surged volleys still owed, set by a swallow and never added to. */
  surgeVolleys: number;
  /** The headstones' orbit, in radians, wrapped into zero to two pi every tick. */
  orbitPhase: number;
  /**
   * Ticks of inert left, per stone slot. Pre-allocated at the maximum stone
   * count and never resized, so a level change cannot reallocate mid-run.
   */
  readonly stoneRecharge: number[];
  /** Ticks to the next toll. */
  tollIn: number;
  /** The one live ring, or null between tolls. */
  ring: BellRing | null;
}

/**
 * The run's identity and everything the rules mutate as it plays (tracer plan
 * section 3).
 *
 * Scroll distance is deliberately absent: it is tick * SCROLL_SPEED exactly, so
 * it is derived where it is read. That is one less field in the digest and one
 * less thing that can drift out of step with the tick.
 */
export interface RunState {
  // The seed this run was rolled or pinned with (ADR 0012).
  readonly seed: number;
  // A run's length is counted in ticks, never wall clock.
  tick: number;
  readonly grave: Grave;
  score: number;
  // Belch charge, filled by swallows and capped (ADR 0008).
  reservoir: number;
  readonly levels: Record<WeaponLine, number>;
  ending: RunEnding | null;
  /**
   * The live streams, held here rather than made on demand, each exposing its
   * own draw cursor. Without the cursor in the digest, a divergence in how many
   * draws a tick made is invisible to the one test built to catch divergence,
   * and 3b's ?seed= replay cannot resume mid-run without it.
   */
  readonly streams: Readonly<Record<StreamName, Stream>>;
  /**
   * The field's entities, every one of them a fixed-capacity pool
   * pre-allocated here and mutated in place. This is the reason step mutates
   * rather than returning new state: at storm density, pooled entities mutated
   * in place are the right answer.
   */
  readonly mobs: Mob[];
  readonly mobFire: Shot[];
  readonly corpses: Corpse[];
  readonly skulls: Skull[];
  readonly wisps: Wisp[];
  readonly stage: StageState;
  readonly lines: LineState;
  /** Kills since the last drop was paid for, against the price of the next one (ADR 0002). */
  killsSinceDrop: number;
  /** How many drops this run has bought, which is the index into the price table. */
  dropsPaid: number;
  /**
   * The next entity id, only ever increasing. It is not cosmetic: the cap
   * policy has to be totally ordered to be deterministic, and a test that says
   * "this corpse, not that one" needs a handle a recycled slot index cannot
   * give it.
   */
  nextEntityId: number;
}

/**
 * One past the largest seed a roll can produce, the top of a 31-bit range.
 * Exported so ?seed= can accept exactly the seeds the roll itself could have
 * produced (ADR 0012).
 */
export const SEED_LIMIT = 0x7fffffff;

/**
 * The one place chance enters a run. Everything after this reads the seeded
 * streams, so a run's identity is decided once and then replays (ADR 0012).
 *
 * The roll itself is not deterministic and does not need to be. What is
 * deterministic is the run, which only ever sees the seed the roll produced.
 * The roll lives in the sim rather than in a screen because a run's identity is
 * the sim's (ADR 0012), so this is the sim's one documented way past the rule
 * that otherwise keeps Math.random out of src/game.
 */
function rollSeed(): number {
  // eslint-disable-next-line no-restricted-properties -- the carve-out above
  return Math.floor(Math.random() * SEED_LIMIT);
}

/** Every line's clock at the top of a run, in one place. */
function startingLines(): LineState {
  return {
    streamIn: STREAM_INTERVAL,
    surgeVolleys: 0,
    orbitPhase: 0,
    stoneRecharge: new Array<number>(MAX_STONES).fill(0),
    tollIn: BELL_PERIOD,
    ring: null,
  };
}

/** The levels a run starts with: the birthright lines at one, the rest unowned. */
function birthrightLevels(): Record<WeaponLine, number> {
  const levels: Record<WeaponLine, number> = {
    soulStream: 0,
    headstones: 0,
    wisps: 0,
    bell: 0,
  };
  for (const line of BIRTHRIGHT) levels[line] = 1;
  return levels;
}

/**
 * Every line at one level, which is the loadout pin's shape (ADR 0020): the
 * pin exists so a measurement's dense, levelled moment is reproducible, and
 * per-line syntax buys nothing that needs.
 */
export function uniformLevels(level: number): Record<WeaponLine, number> {
  return { soulStream: level, headstones: level, wisps: level, bell: level };
}

/**
 * Starts a run: with no seed it rolls one, and with a seed it pins the run to
 * that seed and replays it (ADR 0012). The roll lives here rather than in a
 * screen so a run's identity is the sim's, and so ?seed= has one place to
 * plug into.
 *
 * The starting size is clamped by grave.ts and not by the caller. ?size= used
 * to write run.grave.size from src/app, which left the sim's own hard bounds
 * defended by a URL parser; with the size in this signature, hitGrave is the
 * only thing outside grave.ts that changes size at all.
 *
 * The starting levels default to the birthright and are copied rather than
 * aliased, because the rules mutate them in place as the run levels up. They
 * are in this signature for the same reason the size is: ?levels= pins them,
 * and a tape's header rebuilds a pinned run from the resolved record it
 * carries (ADR 0018).
 */
export function createRun(
  seed: number = rollSeed(),
  startingSize: number = SIZE_START,
  startingLevels: Readonly<Record<WeaponLine, number>> = birthrightLevels(),
): RunState {
  return {
    seed,
    tick: 0,
    grave: createGrave(startingSize),
    score: 0,
    reservoir: 0,
    levels: { ...startingLevels },
    ending: null,
    streams: {
      spawns: stream(seed, "spawns"),
      drops: stream(seed, "drops"),
      mobFire: stream(seed, "mobFire"),
      shed: stream(seed, "shed"),
    },
    mobs: createMobPool(),
    mobFire: createShotPool(),
    corpses: createCorpsePool(),
    skulls: createSkullPool(),
    wisps: createWispPool(),
    stage: createStage(),
    lines: startingLines(),
    killsSinceDrop: 0,
    dropsPaid: 0,
    nextEntityId: 1,
  };
}
