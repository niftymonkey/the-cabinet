/**
 * The sweep entry: a list of tuning candidates, each played as an ordinary
 * batch over one seed range, with one comparison of each later candidate
 * against the first as the whole of stdout. Run as
 * `pnpm vite-node --config vite.headless.config.ts scripts/sweep.ts <configuration> <first-seed> [count] [out-root] [rig=<rig>] tuning=<a>,<b>,...`.
 *
 * It is a second shell beside batch.ts and compare-batches.ts rather than a
 * mode of either (ADR 0064, draft ruling 9): batch.ts's concept is one batch,
 * and a loop written fresh for every tuning round is a loop written wrong once.
 * The playing lives in src/dev/harnessRun.ts, the reducing in
 * src/dev/batchReport.ts and the comparing in src/dev/compareBatches.ts, all
 * three of which carry mayImport: [] and may not touch node:fs. So this shell
 * parses the arguments, asks git and the clock, writes the bytes, prints the
 * rows the seam answered, and says why when an argument or a path will not do.
 *
 * Nothing it writes says a sweep wrote it. Each candidate's folder is the
 * folder a hand-run batch of that candidate writes, in the same default root,
 * so a sweep's evidence and a hand-played batch's are the same kind of thing
 * and either can be read by compare-batches.ts afterwards.
 */

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { batchReportOf, BATCH_SEEDS } from '../src/dev/batchReport';
import type { BatchIdentity, BatchReport } from '../src/dev/batchReport';
import { compareBatches } from '../src/dev/compareBatches';
import type { BatchComparison } from '../src/dev/compareBatches';
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
import {
  CANDIDATES,
  CANDIDATE_NAMES,
  isCandidateName,
} from '../src/dev/tuningCandidates';
import type { CandidateName } from '../src/dev/tuningCandidates';
import { SEED_LIMIT } from '../src/game/run';
import { decodeTape } from '../src/tape/decode';

/**
 * Where a sweep's batches land when the command line names nowhere: batch.ts's
 * own root, because each of them is an ordinary batch and a root named after
 * the sweep would be the one thing on disk saying which command played them.
 */
const DEFAULT_OUT_ROOT = 'local/batches';

/** The rig every candidate is played from when the command line names none. */
const DEFAULT_RIG: RigName = 'birthright';

/**
 * How many candidates a sweep names at the least. One candidate is a batch and
 * batch.ts already plays it; what a sweep adds is the comparison, and there is
 * nothing to compare a single record against.
 */
const SWEEP_MINIMUM = 2;

const USAGE = `usage: pnpm vite-node --config vite.headless.config.ts scripts/sweep.ts <configuration> <first-seed> [count] [out-root] [rig=<rig>] tuning=<a>,<b>,...
  configurations: ${CONFIGURATION_NAMES.join(', ')}
  rigs: ${RIG_NAMES.join(', ')}
  candidates: ${CANDIDATE_NAMES.join(', ')}
  tuning names ${SWEEP_MINIMUM} candidates or more, played in the order written
  count defaults to ${BATCH_SEEDS}
  out-root defaults to ${DEFAULT_OUT_ROOT}
  rig defaults to ${DEFAULT_RIG}`;

/**
 * A flawed argument is an external failure and the person holding the command
 * line is the nearest owner who can act, so they get the reason and the cost
 * rather than a stack, plus the usage the flaw sat in.
 */
const refuse = (reason: string): null => {
  console.error(`${reason}; no sweep was played`);
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

/** The rig every candidate starts from, or null once the name has been refused. */
const parseRig = (raw: string | undefined): RigName | null => {
  if (raw === undefined) return DEFAULT_RIG;
  if (!isRigName(raw)) {
    return refuse(`${raw} names no rig (the rigs are ${RIG_NAMES.join(', ')})`);
  }
  return raw;
};

/**
 * The candidates the sweep plays, in the order the command line wrote them, or
 * null once the list has been refused out loud.
 *
 * A name no row holds is refused rather than repaired, which is the split
 * between this surface and the URL's (ADR 0064): a batch under a tuning nobody
 * asked for is a folder of runs whose name lies about them. A name written
 * twice is refused for the neighbouring reason, that a candidate compared with
 * itself orders nothing and writes two folders saying two things.
 */
const parseCandidates = (raw: string | undefined): CandidateName[] | null => {
  if (raw === undefined) {
    return refuse(
      `no tuning was named (a sweep names its candidates as tuning=<a>,<b>,...)`,
    );
  }
  const written = raw.split(',');
  const unknown = written.find((name) => !isCandidateName(name));
  if (unknown !== undefined) {
    return refuse(
      `${unknown} names no tuning candidate (the candidates are ${CANDIDATE_NAMES.join(', ')})`,
    );
  }
  const candidates = written.filter(isCandidateName);
  const twice = candidates.find((name, at) => candidates.indexOf(name) !== at);
  if (twice !== undefined) {
    return refuse(`${twice} is named twice, and one candidate is one batch`);
  }
  if (candidates.length < SWEEP_MINIMUM) {
    return refuse(
      `${raw} is one candidate, which is a batch; a sweep compares ${SWEEP_MINIMUM} or more`,
    );
  }
  return candidates;
};

/** How many runs each candidate walks, or null once the argument has been refused. */
const parseCount = (raw: string): number | null => {
  const value = wholeNumber(raw);
  if (value === null || value < 1) {
    return refuse(`${raw} is not a run count (a whole number of at least 1)`);
  }
  return value;
};

/**
 * The seeds every candidate walks, consecutively from the first, or null once
 * the range has been refused out loud.
 *
 * Every candidate walks the same seeds, because a comparison across two
 * tunings on two seed ranges would order the ranges as much as the records.
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
 * The commit this sweep records against, asked of git the way batch.ts asks,
 * because the headless config compiles no COMMIT_HASH define. Metadata and
 * never a fidelity gate (ADR 0018).
 */
const commitHashHere = (): string => {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

/** The keys that stand outside the positional list, batch.ts's own two. */
const KEYS = ['rig', 'tuning'] as const;

/** Whether an argument names a key rather than filling a position. */
const isKeyed = (argument: string): boolean =>
  KEYS.some((key) => argument.startsWith(`${key}=`));

/**
 * A word and an equals sign, which is what every keyed argument opens with. A
 * path never matches it, because the word runs to the first non-letter.
 */
const KEY_SHAPED = /^[A-Za-z]+=/;

/**
 * The first argument written in a key's shape under a key this command does not
 * have, or null when none is. A misspelled key is otherwise a silent positional
 * and the fourth position is the output root, so a typo becomes a folder nobody
 * asked for (slice 7's own finding on batch.ts).
 */
const unknownKeyIn = (given: readonly string[]): string | null =>
  given.find((argument) => KEY_SHAPED.test(argument) && !isKeyed(argument)) ??
  null;

/** What a key was given, or undefined when the command line names it nowhere. */
const valueUnder = (
  given: readonly string[],
  key: (typeof KEYS)[number],
): string | undefined =>
  given
    .find((argument) => argument.startsWith(`${key}=`))
    ?.slice(key.length + 1);

/**
 * One sweep, as the command line asked for it: the hand, the rig every
 * candidate starts from, the candidates in order, the seeds each one walks and
 * where they write.
 */
interface SweepRequest {
  readonly configuration: ConfigurationName;
  readonly rig: RigName;
  readonly candidates: readonly CandidateName[];
  readonly seeds: readonly number[];
  readonly outRoot: string;
}

/**
 * The sweep the command line asked for, or null once the flaw has been refused
 * out loud.
 *
 * Every argument becomes what it names here or is refused here, so nothing past
 * this line holds a raw string at all (parse at the edge).
 */
const requestedSweep = (given: readonly string[]): SweepRequest | null => {
  const [configurationRaw, seedRaw, countRaw, outRoot = DEFAULT_OUT_ROOT] =
    given.filter((argument) => !isKeyed(argument));
  if (configurationRaw === undefined || seedRaw === undefined) {
    console.error(USAGE);
    return null;
  }
  const unknownKey = unknownKeyIn(given);
  if (unknownKey !== null) {
    return refuse(
      `${unknownKey} names no argument this command has (the keys are ${KEYS.join(', ')})`,
    );
  }
  const configuration = parseConfiguration(configurationRaw);
  if (configuration === null) return null;
  const rig = parseRig(valueUnder(given, 'rig'));
  if (rig === null) return null;
  const candidates = parseCandidates(valueUnder(given, 'tuning'));
  if (candidates === null) return null;
  const count = countRaw === undefined ? BATCH_SEEDS : parseCount(countRaw);
  if (count === null) return null;
  const seeds = parseSeeds(seedRaw, count);
  if (seeds === null) return null;
  return { configuration, rig, candidates, seeds, outRoot };
};

/**
 * The folder one candidate's batch lands in, which is exactly the folder
 * batch.ts writes for the same three names and stamp (ADR 0057).
 */
const folderFor = (
  request: SweepRequest,
  candidate: CandidateName,
  recordedAt: number,
): string =>
  join(
    request.outRoot,
    `${request.configuration}-${request.rig}-${candidate}-${recordedAt}`,
  );

/**
 * True once the folder exists. A root the filesystem will not create is an
 * external failure and the person holding the command line is the nearest owner
 * who can act.
 */
const makeFolderOrRefuse = (folder: string): boolean => {
  try {
    mkdirSync(folder, { recursive: true });
    return true;
  } catch (error) {
    if (!(error instanceof Error) || !('errno' in error)) throw error;
    console.error(
      `${folder} could not be made (${error.message}); no sweep was played`,
    );
    return false;
  }
};

/**
 * True once the bytes are on disk, or false once the path has been refused out
 * loud. Anything the write throws without a syscall behind it is a bug in this
 * shell's own call and flies.
 */
const writeOrRefuse = (path: string, bytes: Uint8Array | string): boolean => {
  try {
    writeFileSync(path, bytes);
    return true;
  } catch (error) {
    if (!(error instanceof Error) || !('errno' in error)) throw error;
    console.error(
      `${path} could not be written (${error.message}); the sweep stopped here`,
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
 * Plays every seed under one candidate, leaves a tape for each and measures the
 * bytes it wrote, answering null the moment one cannot be written.
 *
 * The decode is over the same bytes the file holds, so anything it throws is a
 * bug in this build's own encoder and flies. Progress goes to stderr because
 * stdout is the comparison and nothing else.
 */
const playInto = (
  folder: string,
  request: SweepRequest,
  candidate: CandidateName,
  commitHash: string,
  recordedAt: number,
): MeasuredRun[] | null => {
  const runs: MeasuredRun[] = [];
  for (const seed of request.seeds) {
    const run = playHarnessRun(
      CONFIGURATIONS[request.configuration],
      RIGS[request.rig],
      CANDIDATES[candidate].record,
      seed,
      commitHash,
      recordedAt,
    );
    if (!writeOrRefuse(join(folder, `${seed}.tape`), run.bytes)) return null;
    const measurement = measure(decodeTape(run.bytes));
    runs.push({ seed, measurement });
    console.error(
      `${candidate} ${seed}: ${run.ticks} ticks, ${run.ending ?? 'no ending'}, ${run.bytes.length} bytes, ${measurement.outcome}`,
    );
  }
  return runs;
};

/**
 * One candidate's own report, beside its tapes, written from the measurements
 * of the bytes on disk the way batch.ts writes it (ADR 0053, ADR 0057).
 */
const reportInto = (
  folder: string,
  request: SweepRequest,
  recordedAt: number,
  runs: readonly MeasuredRun[],
): BatchReport | null => {
  const firstSeed = request.seeds[0];
  if (firstSeed === undefined) throw new Error('a sweep has no seeds');
  const report = batchReportOf(
    {
      configuration: request.configuration,
      firstSeed,
      seeds: request.seeds.length,
      recordedAt,
    },
    runs,
  );
  console.error(
    `${report.verified} of ${request.seeds.length} verified, ${report.unverified.length} not, ${report.unfinished.length} with no ending`,
  );
  const written = writeOrRefuse(
    join(folder, 'report.json'),
    JSON.stringify(report, null, 2),
  );
  return written ? report : null;
};

// One candidate played: where its batch landed and what its report says.
interface PlayedBatch {
  readonly candidate: CandidateName;
  readonly folder: string;
  readonly report: BatchReport;
}

/**
 * One candidate as an ordinary batch: its own folder, its own clock stamp and
 * its own report, exactly as one command per candidate would have written them.
 */
const playCandidate = (
  request: SweepRequest,
  candidate: CandidateName,
  commitHash: string,
): PlayedBatch | null => {
  const recordedAt = Date.now();
  const folder = folderFor(request, candidate, recordedAt);
  if (!makeFolderOrRefuse(folder)) return null;
  const runs = playInto(folder, request, candidate, commitHash, recordedAt);
  if (runs === null) return null;
  const report = reportInto(folder, request, recordedAt, runs);
  if (report === null) return null;
  return { candidate, folder, report };
};

/** Every candidate in the order the command line named them, or null on the first that could not be played. */
const playEveryCandidate = (
  request: SweepRequest,
  commitHash: string,
): PlayedBatch[] | null => {
  const played: PlayedBatch[] = [];
  for (const candidate of request.candidates) {
    const batch = playCandidate(request, candidate, commitHash);
    if (batch === null) return null;
    played.push(batch);
  }
  return played;
};

/**
 * One comparison of each later candidate against the first, which is what a
 * list of candidates is read as: the first is the record the sweep is asking
 * about, and every other is what moving a row did to it.
 *
 * The two-corner read across two hands is a sweep of its own and not this
 * command's (ADR 0053): what this answers is one hand's ordering.
 */
const comparisonsAcross = (
  played: readonly PlayedBatch[],
): BatchComparison[] => {
  const [first, ...rest] = played;
  // The command line refuses a list under two names, so a sweep always played
  // a first candidate and anything else is a bug in this shell.
  if (first === undefined) throw new Error('a sweep played no candidate');
  return rest.map((later) => compareBatches(first.report, later.report));
};

// What the sweep says: where each candidate's batch landed, and the comparisons.
interface Sweep {
  readonly played: readonly { candidate: CandidateName; folder: string }[];
  readonly comparisons: readonly BatchComparison[];
}

const sweepOf = (played: readonly PlayedBatch[]): Sweep => ({
  played: played.map((batch) => ({
    candidate: batch.candidate,
    folder: batch.folder,
  })),
  comparisons: comparisonsAcross(played),
});

// The candidates one side was played under, as a person reads them.
const candidatesIn = (identity: BatchIdentity): string =>
  identity.candidates.map((name) => name ?? 'a tuning no row holds').join(', ');

/**
 * The rows the two tunings differ in, said before anything about a reading,
 * because every ordering under them is an answer to that difference.
 *
 * No rows has two causes and they are not the same news, so the sentence is
 * taken from the two records rather than from the emptiness: a batch with no
 * record of its own was never compared row by row at all, and saying the two
 * played one tuning would be saying the opposite of what happened.
 */
const sayTuningRows = (comparison: BatchComparison): void => {
  console.error(
    `${candidatesIn(comparison.left)} against ${candidatesIn(comparison.right)}, differing rows first:`,
  );
  if (comparison.left.tuning === null || comparison.right.tuning === null) {
    console.error(
      '  one of the two batches shares no one record across its runs, so no row was compared',
    );
    return;
  }
  if (comparison.tuningDifferences.length === 0) {
    console.error('  no row differs, so the two batches played one tuning');
  }
  for (const row of comparison.tuningDifferences) {
    console.error(`  ${row.name}: ${row.left} against ${row.right}`);
  }
};

/**
 * What a person watching sees, on stderr because stdout is the comparison and
 * nothing else: per comparison, the rows the two tunings differ in and then
 * whether the orderings under them stand.
 */
const sayWhatHappened = (sweep: Sweep): void => {
  for (const comparison of sweep.comparisons) {
    sayTuningRows(comparison);
    if (comparison.mismatches.length === 0) {
      console.error(`${comparison.readings.length} readings ordered`);
      continue;
    }
    console.error(
      `every ordering withheld, because the two batches differ in ${comparison.mismatches.join(', ')}`,
    );
  }
};

const main = (): void => {
  const request = requestedSweep(process.argv.slice(2));
  if (request === null) {
    process.exitCode = 1;
    return;
  }
  const played = playEveryCandidate(request, commitHashHere());
  if (played === null) {
    process.exitCode = 1;
    return;
  }
  const sweep = sweepOf(played);
  sayWhatHappened(sweep);
  console.log(JSON.stringify(sweep, null, 2));
};

main();
