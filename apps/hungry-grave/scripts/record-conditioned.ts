/**
 * The conditioned-recording entry: a run recorded headlessly from a chosen
 * starting condition, sealed onto a tape file, with the written path as the
 * whole of stdout.
 *
 * It exists because some evidence only plays at levels no reachable run
 * starts from (bell push exists only at levels 4 and 5), and the browser's
 * ?levels= pin is one uniform number across the lines. The recording goes
 * through the one execution authority (ADR 0017), so the tape is exactly what
 * a played run would have written.
 *
 * A rig names a whole starting condition instead, the one record a rig, a run
 * and a header all speak (ADR 0063), so the floor ladder is recorded from the
 * row that stages it rather than by playing down to the floor from the start
 * line (#99). What the arguments produce is that record, partly stated: every
 * absence in it resolves inside createRun and never here.
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

import { TICK_HZ } from '../src/game/clock';
import type { TickCommand } from '../src/game/command';
import { createExecution, executeTick } from '../src/game/execution';
import type { WeaponLine } from '../src/game/lines/roster';
import { MAX_LEVEL, WEAPON_LINES } from '../src/game/lines/roster';
import type { RunState, StartingConditions } from '../src/game/run';
import { createRun, SEED_LIMIT, uniformLevels } from '../src/game/run';
import { WITNESS_VERSION } from '../src/game/witness';
import { isRigName, RIGS, RIG_NAMES } from '../src/dev/rigs';
import type { RigName } from '../src/dev/rigs';
import { RUNNING_BUILD } from '../src/tape/buildIdentity';
import { encodeTape } from '../src/tape/encode';
import { startingConditionBlock } from '../src/tape/startingCondition';
import {
  RECORDER_CHECKPOINT_SPACING,
  recordInto,
  sealTrailer,
  tapeOf,
} from '../src/tape/recorder';
import type { TapeHeader } from '../src/tape/tape';
import { SCRIPT_POLICY } from '../src/tape/tape';

const USAGE = `usage: pnpm vite-node --config vite.headless.config.ts scripts/record-conditioned.ts <out-file> <seed> <ticks> [${WEAPON_LINES.map(
  (line) => `${line}=N`,
).join(' ')}] [rig=${RIG_NAMES.join('|')}] [score=N]`;

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

/** The starting score, or null once the argument has been refused out loud. */
const parseScore = (raw: string): number | null => {
  const value = wholeNumber(raw);
  if (value === null || value < 0) {
    return refuse(`${raw} is not a score (a whole number of at least 0)`);
  }
  return value;
};

/** The rig row named, or null once the name has been refused out loud. */
const parseRigName = (raw: string): RigName | null => {
  if (!isRigName(raw)) {
    return refuse(`${raw} names no rig (the rigs are ${RIG_NAMES.join(', ')})`);
  }
  return raw;
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
 * The conditions a rig row names, whole: a rig applied without its size or its
 * score is a rig half applied, and the tape would then name a starting
 * condition it did not play (#107).
 *
 * A command that names a row and names the levels beside it is refused rather
 * than resolved, because the row already states every line's level and a
 * command that states them twice can state them differently.
 *
 * A score named beside a row is an override and not a contradiction: it is the
 * one figure of a row a recording may want to move without naming a second row,
 * and the size, the levels and the record still come from the row. The tape
 * verifies either way now, because the header carries the score the run began
 * holding (FORMAT_VERSION 5).
 */
const conditionsFromRig = (
  raw: string,
  levelArgs: readonly string[],
  scoreRaw: string | undefined,
): Partial<StartingConditions> | null => {
  const name = parseRigName(raw);
  if (name === null) return null;
  if (levelArgs.length > 0) {
    return refuse(
      `rig=${raw} already states every line's level, so ${levelArgs.join(' ')} states them a second time`,
    );
  }
  const { conditions } = RIGS[name];
  const score =
    scoreRaw === undefined ? conditions.startingScore : parseScore(scoreRaw);
  if (score === null) return null;
  return { ...conditions, startingScore: score };
};

/**
 * The conditions the older arguments name: every line's level stated, the
 * starting size left to the sim's own default, and a score only if one is
 * asked for. With neither new flag named this is exactly what the command
 * meant before they existed.
 */
const conditionsFromArguments = (
  levelArgs: readonly string[],
  scoreRaw: string | undefined,
): Partial<StartingConditions> | null => {
  const levels = parseLevels(levelArgs);
  if (levels === null) return null;
  const score = scoreRaw === undefined ? 0 : parseScore(scoreRaw);
  if (score === null) return null;
  return { startingLevels: levels, startingScore: score };
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
    // The run's own resolved record, whole (ADR 0063).
    startingCondition: startingConditionBlock(run.conditions),
    tickRate: TICK_HZ,
    checkpointSpacing: RECORDER_CHECKPOINT_SPACING,
    witnessVersion: WITNESS_VERSION,
    commitHash: commitHashHere(),
    buildIdentity: RUNNING_BUILD,
    author: 'unknown',
    inputDevice: 'script',
    policy: SCRIPT_POLICY,
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
  conditions: Partial<StartingConditions>,
): Uint8Array => {
  const run = createRun(seed, conditions);
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

// The two keyed arguments, in the shape batch.ts already reads its own rig in.
const RIG_ARGUMENT = /^rig=(.*)$/;
const SCORE_ARGUMENT = /^score=(.*)$/;

/** The one value a keyed argument names, or undefined when it names none. */
const valueOf = (
  named: readonly string[],
  keyed: RegExp,
): string | undefined => {
  const one = named[0];
  return one === undefined ? undefined : one.replace(keyed, '$1');
};

/** Which starting condition the arguments name, keyed ones read out of the rest. */
const conditionsIn = (
  args: readonly string[],
): Partial<StartingConditions> | null => {
  const rigArgs = args.filter((argument) => RIG_ARGUMENT.test(argument));
  const scoreArgs = args.filter((argument) => SCORE_ARGUMENT.test(argument));
  // A key named twice is refused rather than resolved to the first, which is
  // the rule parseLevels already holds for a line named twice: a command that
  // states one thing two ways can state it two different ways.
  if (rigArgs.length > 1) {
    return refuse(`${rigArgs.join(' ')} names a rig more than once`);
  }
  if (scoreArgs.length > 1) {
    return refuse(`${scoreArgs.join(' ')} names a score more than once`);
  }
  const levelArgs = args.filter(
    (argument) =>
      !RIG_ARGUMENT.test(argument) && !SCORE_ARGUMENT.test(argument),
  );
  const rigRaw = valueOf(rigArgs, RIG_ARGUMENT);
  const scoreRaw = valueOf(scoreArgs, SCORE_ARGUMENT);
  return rigRaw === undefined
    ? conditionsFromArguments(levelArgs, scoreRaw)
    : conditionsFromRig(rigRaw, levelArgs, scoreRaw);
};

const main = (): void => {
  const [path, seedRaw, ticksRaw, ...rest] = process.argv.slice(2);
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
  const conditions = conditionsIn(rest);
  if (conditions === null) {
    process.exitCode = 1;
    return;
  }
  if (!writeOrRefuse(path, recordTape(seed, ticks, conditions))) {
    process.exitCode = 1;
    return;
  }
  console.log(path);
};

main();
