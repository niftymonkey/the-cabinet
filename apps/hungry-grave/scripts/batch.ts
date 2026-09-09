/**
 * The batch entry: a seed range played headlessly under one configuration,
 * one tape per seed on disk, with the folder path as the whole of stdout. Run
 * as
 * `pnpm vite-node --config vite.headless.config.ts scripts/batch.ts <configuration> <first-seed> <count> [out-root]`.
 *
 * The playing lives in src/dev/harnessRun.ts, which carries mayImport: [] and
 * may not touch node:fs. So this shell parses the arguments, asks git and the
 * clock, writes the bytes, and says why when an argument or a path will not do.
 *
 * The report over the batch is slice 4b's and there is none here yet.
 */

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  CONFIGURATION_NAMES,
  CONFIGURATIONS,
  isConfigurationName,
} from '../src/dev/configurations';
import type { ConfigurationName } from '../src/dev/configurations';
import { playHarnessRun } from '../src/dev/harnessRun';
import { SEED_LIMIT } from '../src/game/run';

/**
 * Where a batch's tapes land when the command line names nowhere. `local/` is
 * outside version control, so nothing a batch writes can reach a commit; the
 * argument exists so a test can point the command at a scratch folder instead
 * of the worktree's own.
 */
const DEFAULT_OUT_ROOT = 'local/batches';

const USAGE = `usage: pnpm vite-node --config vite.headless.config.ts scripts/batch.ts <configuration> <first-seed> <count> [out-root]
  configurations: ${CONFIGURATION_NAMES.join(', ')}
  out-root defaults to ${DEFAULT_OUT_ROOT}`;

/**
 * A flawed argument is an external failure and the person holding the command
 * line is the nearest owner who can act, so they get the reason and the cost
 * rather than a stack, plus the usage the flaw sat in.
 */
const refuse = (reason: string): null => {
  console.error(`${reason}; no batch was played`);
  console.error(USAGE);
  return null;
};

/** The whole number a raw argument names, or null when it names none. */
const wholeNumber = (raw: string): number | null => {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isInteger(value) ? value : null;
};

/** The named configuration, or null once the argument has been refused out loud. */
const parseConfiguration = (raw: string): ConfigurationName | null => {
  if (!isConfigurationName(raw)) {
    return refuse(
      `${raw} names no configuration (the configurations are ${CONFIGURATION_NAMES.join(', ')})`,
    );
  }
  return raw;
};

/** How many runs the batch walks, or null once the argument has been refused out loud. */
const parseCount = (raw: string): number | null => {
  const value = wholeNumber(raw);
  if (value === null || value < 1) {
    return refuse(`${raw} is not a run count (a whole number of at least 1)`);
  }
  return value;
};

/**
 * The seeds the batch walks, consecutively from the first, or null once the
 * range has been refused out loud.
 *
 * Consecutive seeds are safe because a stream's name offset is added and then
 * avalanched, so seed n and seed n + 1 hash to unrelated states (ADR 0012).
 * Both ends are checked: a count that walked off the top would pin runs to
 * seeds no run can be started from.
 */
const parseSeeds = (raw: string, count: number): number[] | null => {
  const first = wholeNumber(raw);
  if (first === null || first < 0 || first >= SEED_LIMIT) {
    return refuse(
      `${raw} is not a seed (a whole number from 0 to ${SEED_LIMIT - 1})`,
    );
  }
  const last = first + count - 1;
  if (last >= SEED_LIMIT) {
    return refuse(
      `${count} runs from ${first} would reach seed ${last}, past the last seed ${SEED_LIMIT - 1}`,
    );
  }
  return Array.from({ length: count }, (_, offset) => first + offset);
};

/**
 * The commit this batch records against, asked of git the way
 * record-conditioned.ts asks, because the headless config compiles no
 * COMMIT_HASH define. Metadata and never a fidelity gate (ADR 0018): a tree
 * without git says so rather than inventing one.
 */
const commitHashHere = (): string => {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

/**
 * The folder this batch's tapes land in: the configuration and the stamp the
 * clock was asked for once, so two batches of one hand against two builds do
 * not collide.
 *
 * The name is a convenience and the bytes are authoritative (ADR 0057). The
 * stamp is the same number every header in the folder records, so the folder
 * and the bytes never disagree about when the batch was played.
 */
const folderFor = (
  outRoot: string,
  configuration: ConfigurationName,
  recordedAt: number,
): string => join(outRoot, `${configuration}-${recordedAt}`);

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
      `${path} could not be written (${error.message}); the batch stopped here`,
    );
    return false;
  }
};

/**
 * Plays every seed in turn and leaves a tape for each, answering false the
 * moment one cannot be written.
 *
 * Progress goes to stderr because stdout is the folder path and nothing else:
 * a batch is minutes of play and a person watching it should see where it has
 * got to.
 */
const playInto = (
  folder: string,
  configuration: ConfigurationName,
  seeds: readonly number[],
  commitHash: string,
  recordedAt: number,
): boolean => {
  for (const seed of seeds) {
    const run = playHarnessRun(
      CONFIGURATIONS[configuration],
      seed,
      commitHash,
      recordedAt,
    );
    if (!writeOrRefuse(join(folder, `${seed}.tape`), run.bytes)) return false;
    console.error(
      `${seed}: ${run.ticks} ticks, ${run.ending ?? 'no ending'}, ${run.bytes.length} bytes`,
    );
  }
  return true;
};

/**
 * True once the folder exists. A root the filesystem will not create is the
 * same external failure a tape's own path is, and the person holding the
 * command line is the nearest owner who can act.
 */
const makeFolderOrRefuse = (folder: string): boolean => {
  try {
    mkdirSync(folder, { recursive: true });
    return true;
  } catch (error) {
    if (!(error instanceof Error) || !('errno' in error)) throw error;
    console.error(
      `${folder} could not be made (${error.message}); no batch was played`,
    );
    return false;
  }
};

const main = (): void => {
  const [configurationRaw, seedRaw, countRaw, outRoot = DEFAULT_OUT_ROOT] =
    process.argv.slice(2);
  if (
    configurationRaw === undefined ||
    seedRaw === undefined ||
    countRaw === undefined
  ) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const configuration = parseConfiguration(configurationRaw);
  if (configuration === null) {
    process.exitCode = 1;
    return;
  }
  const count = parseCount(countRaw);
  if (count === null) {
    process.exitCode = 1;
    return;
  }
  const seeds = parseSeeds(seedRaw, count);
  if (seeds === null) {
    process.exitCode = 1;
    return;
  }
  const recordedAt = Date.now();
  const folder = folderFor(outRoot, configuration, recordedAt);
  if (!makeFolderOrRefuse(folder)) {
    process.exitCode = 1;
    return;
  }
  if (!playInto(folder, configuration, seeds, commitHashHere(), recordedAt)) {
    process.exitCode = 1;
    return;
  }
  console.log(folder);
};

main();
