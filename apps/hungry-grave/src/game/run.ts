import type { Grave } from "./grave";
import { createGrave } from "./grave";
import type { WeaponLine } from "./lines/roster";
import { BIRTHRIGHT } from "./lines/roster";
import type { Stream, StreamName } from "./rng";
import { stream } from "./rng";

// A move command in base-speed units, produced by an input model (ADR 0011).
export interface MoveCommand {
  readonly x: number;
  readonly y: number;
}

/** How a run finishes. Null while it is live. */
export type RunEnding = "sealed" | "victory";

/**
 * The run's identity and everything the rules mutate as it plays (tracer plan
 * section 3). The field's entities arrive with the field dispatch.
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
}

// One past the largest seed a roll can produce, the top of a 31-bit range.
const SEED_LIMIT = 0x7fffffff;

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

/** The levels a run starts with: the birthright lines at one, the rest unowned. */
function startingLevels(): Record<WeaponLine, number> {
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
 * Starts a run: with no seed it rolls one, and with a seed it pins the run to
 * that seed and replays it (ADR 0012). The roll lives here rather than in a
 * screen so a run's identity is the sim's, and so ?seed= has one place to
 * plug into.
 */
export function createRun(seed: number = rollSeed()): RunState {
  return {
    seed,
    tick: 0,
    grave: createGrave(),
    score: 0,
    reservoir: 0,
    levels: startingLevels(),
    ending: null,
    streams: {
      spawns: stream(seed, "spawns"),
      drops: stream(seed, "drops"),
      mobFire: stream(seed, "mobFire"),
      shed: stream(seed, "shed"),
    },
  };
}
