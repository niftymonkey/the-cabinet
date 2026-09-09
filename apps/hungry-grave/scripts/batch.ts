/**
 * The batch entry: a seed range played headlessly under one configuration, one
 * tape per seed on disk with the batch's own report beside them, and the folder
 * path as the whole of stdout. Run as
 * `pnpm vite-node --config vite.headless.config.ts scripts/batch.ts <configuration> <first-seed> [count] [out-root]`.
 *
 * The playing lives in src/dev/harnessRun.ts and the reducing in
 * src/dev/batchReport.ts, both of which carry mayImport: [] and may not touch
 * node:fs. So this shell parses the arguments, asks git and the clock, writes
 * the bytes, and says why when an argument or a path will not do.
 *
 * It measures the bytes it wrote rather than the run it just held, which costs
 * a second replay per run and buys a report that is a function of the tapes:
 * nothing in the store is authoritative except the bytes (ADR 0057), so a
 * report built from live state would report something no tape can reproduce.
 */

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { batchReportOf, BATCH_SEEDS } from '../src/dev/batchReport';
import {
  CONFIGURATION_NAMES,
  CONFIGURATIONS,
  isConfigurationName,
} from '../src/dev/configurations';
import type { ConfigurationName } from '../src/dev/configurations';
import { playHarnessRun } from '../src/dev/harnessRun';
import { measure } from '../src/dev/measure';
import type { Measurement } from '../src/dev/measure';
import { isRigName, RIGS, RIG_NAMES } from '../src/dev/rigs';
import type { RigName } from '../src/dev/rigs';
import { SEED_LIMIT } from '../src/game/run';
import { UNSTAMPED_BUILD } from '../src/tape/buildIdentity';
import { decodeTape } from '../src/tape/decode';

/**
 * Where a batch's tapes land when the command line names nowhere. `local/` is
 * outside version control, so nothing a batch writes can reach a commit; the
 * argument exists so a test can point the command at a scratch folder instead
 * of the worktree's own.
 */
const DEFAULT_OUT_ROOT = 'local/batches';

/**
 * The rig a batch is played from when the command line names none: the
 * birthright, which is what every batch this step played was played from, so
 * an unchanged command still means what it meant (#107).
 */
const DEFAULT_RIG: RigName = 'birthright';

const USAGE = `usage: pnpm vite-node --config vite.headless.config.ts scripts/batch.ts <configuration> <first-seed> [count] [out-root] [rig=<rig>]
  configurations: ${CONFIGURATION_NAMES.join(', ')}
  rigs: ${RIG_NAMES.join(', ')}
  count defaults to ${BATCH_SEEDS}
  out-root defaults to ${DEFAULT_OUT_ROOT}
  rig defaults to ${DEFAULT_RIG}`;

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

/**
 * The rig the arguments name, or null once the name has been refused out loud.
 *
 * It is a keyed argument rather than a fifth position, in the shape
 * record-conditioned.ts already uses for its own optional conditions: a rig
 * behind three optional positions would be reached by naming two arguments
 * nobody wanted to name.
 */
const parseRig = (raw: string | undefined): RigName | null => {
  if (raw === undefined) return DEFAULT_RIG;
  if (!isRigName(raw)) {
    return refuse(`${raw} names no rig (the rigs are ${RIG_NAMES.join(', ')})`);
  }
  return raw;
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
  rig: RigName,
  recordedAt: number,
): string => join(outRoot, `${configuration}-${rig}-${recordedAt}`);

/**
 * True once the bytes are on disk, or false once the path has been refused
 * out loud. A path the filesystem will not write is an external failure and
 * the person holding it is the nearest owner who can act; anything the write
 * throws without a syscall behind it is a bug in this shell's own call and
 * flies.
 */
const writeOrRefuse = (path: string, bytes: Uint8Array | string): boolean => {
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

// One seed's tape, played and written, read back through the measuring pass.
interface MeasuredRun {
  readonly seed: number;
  readonly measurement: Measurement;
}

/**
 * What an outcome is attributed to when the tape and this build are not the
 * same build, and nothing when they are (#82).
 *
 * A batch plays and reads on one build, so this is silent in the ordinary case
 * and loud in the one where a bare divergence would otherwise read as a defect
 * in the recording.
 */
const attribution = (measurement: Measurement): string => {
  if (measurement.outcome !== 'diverged') return '';
  const mismatch = measurement.buildMismatch;
  if (mismatch === null) return '';
  const recorded =
    mismatch.recorded === UNSTAMPED_BUILD
      ? 'no build identity'
      : mismatch.recorded;
  return ` (recorded on ${recorded}, read on ${mismatch.running})`;
};

/**
 * Plays every seed in turn, leaves a tape for each and measures the bytes it
 * wrote, answering null the moment one cannot be written.
 *
 * The decode is over the same bytes the file holds, so anything it throws is a
 * bug in this build's own encoder and flies rather than being reported as a
 * batch that could not be read.
 *
 * Progress goes to stderr because stdout is the folder path and nothing else:
 * a batch is minutes of play and a person watching it should see where it has
 * got to.
 */
const playInto = (
  folder: string,
  configuration: ConfigurationName,
  rig: RigName,
  seeds: readonly number[],
  commitHash: string,
  recordedAt: number,
): MeasuredRun[] | null => {
  const runs: MeasuredRun[] = [];
  for (const seed of seeds) {
    const run = playHarnessRun(
      CONFIGURATIONS[configuration],
      RIGS[rig],
      seed,
      commitHash,
      recordedAt,
    );
    if (!writeOrRefuse(join(folder, `${seed}.tape`), run.bytes)) return null;
    const measurement = measure(decodeTape(run.bytes));
    runs.push({ seed, measurement });
    console.error(
      `${seed}: ${run.ticks} ticks, ${run.ending ?? 'no ending'}, ${run.bytes.length} bytes, ${measurement.outcome}${attribution(measurement)}`,
    );
  }
  return runs;
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

/**
 * The batch's own report, beside the tapes it reduces (ADR 0053, ADR 0057).
 *
 * It is written from the measurements of the bytes on disk, so the folder holds
 * the runs and the reading of them together and a later ingest needs neither
 * the command that made it nor the folder's name.
 */
const reportInto = (
  folder: string,
  configuration: ConfigurationName,
  seeds: readonly number[],
  recordedAt: number,
  runs: readonly MeasuredRun[],
): boolean => {
  const firstSeed = seeds[0];
  if (firstSeed === undefined) throw new Error('a batch has no seeds');
  const report = batchReportOf(
    { configuration, firstSeed, seeds: seeds.length, recordedAt },
    runs,
  );
  // The count of runs that reached no ending rides on the line that already
  // says how wide the batch is, because that is the line a person reads before
  // taking any rate off the folder (#118).
  console.error(
    `${report.verified} of ${seeds.length} verified, ${report.unverified.length} not, ${report.unfinished.length} with no ending`,
  );
  if (report.unfinished.length > 0) {
    console.error(
      `no ending: ${report.unfinished.join(', ')}; every rate below is over ${report.verified - report.unfinished.length} finished runs of ${seeds.length}`,
    );
  }
  return writeOrRefuse(
    join(folder, 'report.json'),
    JSON.stringify(report, null, 2),
  );
};

// The arguments split into the keyed rig and everything positional behind it.
const RIG_ARGUMENT = /^rig=(.*)$/;

const main = (): void => {
  const given = process.argv.slice(2);
  const keyed = given.find((argument) => RIG_ARGUMENT.test(argument));
  const [configurationRaw, seedRaw, countRaw, outRoot = DEFAULT_OUT_ROOT] =
    given.filter((argument) => argument !== keyed);
  if (configurationRaw === undefined || seedRaw === undefined) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const configuration = parseConfiguration(configurationRaw);
  if (configuration === null) {
    process.exitCode = 1;
    return;
  }
  const rig = parseRig(keyed?.replace(RIG_ARGUMENT, '$1'));
  if (rig === null) {
    process.exitCode = 1;
    return;
  }
  // The batch's own size when nobody names one, which is the row a person
  // running a batch never has to remember (ADR 0053).
  const count = countRaw === undefined ? BATCH_SEEDS : parseCount(countRaw);
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
  const folder = folderFor(outRoot, configuration, rig, recordedAt);
  if (!makeFolderOrRefuse(folder)) {
    process.exitCode = 1;
    return;
  }
  const runs = playInto(
    folder,
    configuration,
    rig,
    seeds,
    commitHashHere(),
    recordedAt,
  );
  if (runs === null) {
    process.exitCode = 1;
    return;
  }
  if (!reportInto(folder, configuration, seeds, recordedAt, runs)) {
    process.exitCode = 1;
    return;
  }
  console.log(folder);
};

main();
