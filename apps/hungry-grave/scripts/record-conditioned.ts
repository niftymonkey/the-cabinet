/**
 * The conditioned-recording entry: a run recorded headlessly from a chosen
 * seed and chosen starting levels, sealed onto a tape file, with the written
 * path as the whole of stdout. Run as
 * `pnpm vite-node --config vite.headless.config.ts scripts/record-conditioned.ts <out-file> <seed> <ticks> soulStream=N territory=N wisps=N bell=N`.
 *
 * It exists because some evidence only plays at levels no reachable run
 * starts from (bell push exists only at levels 4 and 5), and the browser's
 * ?levels= pin is one uniform number across the lines. The recording goes
 * through the one execution authority (ADR 0017), so the tape is exactly what
 * a played run would have written.
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

import { TICK_HZ } from '../src/game/clock';
import type { TickCommand } from '../src/game/command';
import { createExecution, executeTick } from '../src/game/execution';
import type { WeaponLine } from '../src/game/lines/roster';
import { MAX_LEVEL, WEAPON_LINES } from '../src/game/lines/roster';
import type { RunState } from '../src/game/run';
import { createRun, SEED_LIMIT, uniformLevels } from '../src/game/run';
import { WITNESS_VERSION } from '../src/game/witness';
import { encodeTape } from '../src/tape/encode';
import {
  RECORDER_CHECKPOINT_SPACING,
  recordInto,
  sealTrailer,
  tapeOf,
} from '../src/tape/recorder';
import type { TapeHeader } from '../src/tape/tape';

const USAGE = `usage: pnpm vite-node --config vite.headless.config.ts scripts/record-conditioned.ts <out-file> <seed> <ticks> ${WEAPON_LINES.map(
  (line) => `${line}=N`,
).join(' ')}`;

/**
 * A flawed argument is an external failure and the person holding the command
 * line is the nearest owner who can act, so they get the reason and the cost
 * rather than a stack, plus the usage the flaw sat in.
 */
const refuse = (reason: string): null => {
  console.error(`${reason}; no tape was recorded`);
  console.error(USAGE);
  return null;
};

/** The whole number a raw argument names, or null when it names none. */
const wholeNumber = (raw: string): number | null => {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isInteger(value) ? value : null;
};

/** The pinned seed, or null once the argument has been refused out loud. */
const parseSeed = (raw: string): number | null => {
  const value = wholeNumber(raw);
  if (value === null || value < 0 || value >= SEED_LIMIT) {
    return refuse(
      `${raw} is not a seed (a whole number from 0 to ${SEED_LIMIT - 1})`,
    );
  }
  return value;
};

/** The tick budget, or null once the argument has been refused out loud. */
const parseTicks = (raw: string): number | null => {
  const value = wholeNumber(raw);
  if (value === null || value < 1) {
    return refuse(`${raw} is not a tick count (a whole number of at least 1)`);
  }
  return value;
};

const isWeaponLine = (name: string): name is WeaponLine => {
  return WEAPON_LINES.some((line) => line === name);
};

/**
 * The starting levels, every line named exactly once as line=level, or null
 * once the flaw has been refused out loud.
 *
 * All four lines are required rather than defaulted: the tool exists to
 * record a chosen loadout, so the whole choice is stated, and a defaulted
 * line would be a level this command never said.
 */
const parseLevels = (
  args: readonly string[],
): Record<WeaponLine, number> | null => {
  const named = new Map<WeaponLine, number>();
  for (const arg of args) {
    const split = arg.indexOf('=');
    const name = split === -1 ? arg : arg.slice(0, split);
    if (!isWeaponLine(name)) {
      return refuse(
        `${arg} names no weapon line (the lines are ${WEAPON_LINES.join(', ')})`,
      );
    }
    if (named.has(name)) return refuse(`${arg} names ${name} a second time`);
    const level = split === -1 ? null : wholeNumber(arg.slice(split + 1));
    if (level === null || level < 0 || level > MAX_LEVEL) {
      return refuse(
        `${arg} is not a level for ${name} (a whole number from 0 to ${MAX_LEVEL})`,
      );
    }
    named.set(name, level);
  }
  const missing = WEAPON_LINES.filter((line) => !named.has(line));
  if (missing.length > 0) {
    return refuse(
      `every line needs a starting level; missing ${missing.join(', ')}`,
    );
  }
  const levels = uniformLevels(0);
  for (const [line, level] of named) levels[line] = level;
  return levels;
};

/**
 * The commit this tape records against, asked of git the way vite.config.ts
 * asks, because the headless config compiles no COMMIT_HASH define. Metadata
 * and never a fidelity gate (ADR 0018): a tree without git says so rather
 * than inventing one.
 */
const commitHashHere = (): string => {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

/**
 * The header for a headless script run. There is no renderer and no display,
 * so the backend says headless and the renderer numbers record zero, which is
 * the resolved truth of this run rather than a borrowed browser's.
 */
const headerFor = (run: RunState): TapeHeader => {
  return {
    seed: run.seed,
    startingSize: run.grave.size,
    recordedRoster: [...WEAPON_LINES],
    startingLevels: { ...run.levels },
    tickRate: TICK_HZ,
    checkpointSpacing: RECORDER_CHECKPOINT_SPACING,
    witnessVersion: WITNESS_VERSION,
    commitHash: commitHashHere(),
    buildIdentity: '',
    author: 'unknown',
    inputDevice: 'script',
    keyboardSpeed: 1,
    rendererBackend: 'headless',
    rendererResolution: 0,
    devicePixelRatio: 0,
    recordedAt: Date.now(),
  };
};

/**
 * A fixed wandering script with a shape, so the recorded run moves, swallows
 * and takes fire rather than idling at the start line: the readings a
 * conditioned tape exists for need a run that fights.
 */
const steer = (tick: number): TickCommand => {
  return {
    move: { x: (tick % 11) / 10 - 0.5, y: (tick % 7) / 12 - 0.25 },
    belch: false,
  };
};

/**
 * One run recorded through the one execution authority and sealed, as the
 * bytes a tape file holds. The loop stops early when the run ends or the
 * authority stops it, the same guard the bot's loop holds, and the seal
 * records that ending.
 */
const recordTape = (
  seed: number,
  ticks: number,
  levels: Readonly<Record<WeaponLine, number>>,
): Uint8Array => {
  const run = createRun(seed, undefined, levels);
  const execution = createExecution(run);
  const recorder = recordInto(execution, headerFor(run));
  for (
    let tick = 0;
    tick < ticks && run.ending === null && execution.stop === null;
    tick++
  ) {
    executeTick(execution, steer(tick));
  }
  sealTrailer(recorder, execution, 0);
  return encodeTape(tapeOf(recorder));
};

/**
 * True once the bytes are on disk, or false once the path has been refused
 * out loud. A path the filesystem will not write is an external failure and
 * the person holding it is the nearest owner who can act; anything the write
 * throws without a syscall behind it is a bug in this shell's own call and
 * flies.
 */
const writeOrRefuse = (path: string, bytes: Uint8Array): boolean => {
  try {
    writeFileSync(path, bytes);
    return true;
  } catch (error) {
    if (!(error instanceof Error) || !('errno' in error)) throw error;
    console.error(
      `${path} could not be written (${error.message}); the tape was not saved`,
    );
    return false;
  }
};

const main = (): void => {
  const [path, seedRaw, ticksRaw, ...levelArgs] = process.argv.slice(2);
  if (path === undefined || seedRaw === undefined || ticksRaw === undefined) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const seed = parseSeed(seedRaw);
  if (seed === null) {
    process.exitCode = 1;
    return;
  }
  const ticks = parseTicks(ticksRaw);
  if (ticks === null) {
    process.exitCode = 1;
    return;
  }
  const levels = parseLevels(levelArgs);
  if (levels === null) {
    process.exitCode = 1;
    return;
  }
  if (!writeOrRefuse(path, recordTape(seed, ticks, levels))) {
    process.exitCode = 1;
    return;
  }
  console.log(path);
};

main();
