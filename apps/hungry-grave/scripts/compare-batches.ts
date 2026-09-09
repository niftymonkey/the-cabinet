/**
 * The comparison entry: two batch reports read side by side, or four read as
 * two corners, with the comparison as the whole of stdout. Run as
 * `pnpm vite-node --config vite.headless.config.ts scripts/compare-batches.ts <left> <right> [<sloppy-left> <sloppy-right>]`.
 *
 * The comparing lives in src/dev/compareBatches.ts, which carries mayImport: []
 * and may not touch node:fs. So this shell parses the arguments, reads the
 * files, checks that what came back is a report at all, and says why when one
 * is not.
 *
 * A pair of arguments is one corner: the same hand and the same rig against
 * two builds. Two pairs are the two corners ADR 0053 asks a finding to be
 * believed on, and the command takes both so that reading is one command
 * rather than a thing only a test could do.
 */

import { readFileSync } from 'node:fs';

import type { BatchReport } from '../src/dev/batchReport';
import { compareBatches, readAcrossCorners } from '../src/dev/compareBatches';
import type { BatchComparison, CornersRead } from '../src/dev/compareBatches';

const USAGE = `usage: pnpm vite-node --config vite.headless.config.ts scripts/compare-batches.ts <left-report> <right-report> [<sloppy-left-report> <sloppy-right-report>]
  a report is a batch folder's own report.json
  two reports are one corner: one hand and one rig against two builds
  four are the two corners, read together as agreed or split`;

/**
 * A flawed argument is an external failure and the person holding the command
 * line is the nearest owner who can act, so they get the reason and the cost
 * rather than a stack, plus the usage the flaw sat in.
 */
const refuse = (reason: string): null => {
  console.error(`${reason}; nothing was compared`);
  console.error(USAGE);
  return null;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * A spread the comparison can read: the five numbers a direction is taken from
 * and the samples a rank test reads.
 *
 * The figures under those two are not walked. What this catches is a document
 * from another build, whose absent field would otherwise fail deep inside the
 * comparison; re-proving every quartile of a file this build's own batch
 * command wrote is checking the writer's types from the reader's side.
 */
const isSpread = (value: unknown): value is Record<string, unknown> =>
  isPlainObject(value) &&
  isPlainObject(value.summary) &&
  Array.isArray(value.samples);

const holdsSpreads = (value: unknown): boolean =>
  isPlainObject(value) && Object.values(value).every(isSpread);

/**
 * Whether this is a report the comparison can read: the identity it names two
 * instruments by, the rigs on it, the version it was computed under, and the
 * three families of spreads, each spread carrying the samples a rank test
 * reads.
 *
 * A report written before those fields existed is a document from another
 * build, and a document is rejected rather than guessed at: read as though it
 * were this shape it would die inside the comparison instead, on a field
 * nothing said was missing. What this is otherwise here to catch is a path
 * that names some other JSON.
 */
const isBatchReport = (value: unknown): value is BatchReport =>
  isPlainObject(value) &&
  isPlainObject(value.identity) &&
  Array.isArray(value.identity.rigs) &&
  Array.isArray(value.identity.commitHashes) &&
  typeof value.readingsVersion === 'number' &&
  holdsSpreads(value.spreads) &&
  isPlainObject(value.byLine) &&
  Object.values(value.byLine).every(holdsSpreads) &&
  holdsSpreads(value.phaseSpans);

/**
 * The report at this path, or null once the path has been refused out loud. A
 * file that will not read and a file that is not a report are both external
 * failures, and the person holding the command line is the nearest owner who
 * can act on either.
 */
const reportAt = (path: string): BatchReport | null => {
  let raw = '';
  try {
    raw = readFileSync(path, 'utf8');
  } catch (error) {
    if (!(error instanceof Error) || !('errno' in error)) throw error;
    return refuse(`${path} could not be read (${error.message})`);
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isBatchReport(parsed)) {
      return refuse(
        `${path} is not a batch report this build can compare (one written before the rigs and the per-run samples reads as one)`,
      );
    }
    return parsed;
  } catch {
    return refuse(`${path} is not JSON`);
  }
};

// Every report the command line named, or null once one has been refused out loud.
const reportsAt = (paths: readonly string[]): BatchReport[] | null => {
  const reports: BatchReport[] = [];
  for (const path of paths) {
    const report = reportAt(path);
    if (report === null) return null;
    reports.push(report);
  }
  return reports;
};

// What the command says: one comparison per corner, and the two read together.
interface ComparedBatches {
  readonly corners: readonly BatchComparison[];
  // Null when only one corner was named, because one corner agrees with nobody.
  readonly read: CornersRead | null;
}

/**
 * Each pair as its own comparison, and both together when there are two.
 *
 * The corner reading is left null for one pair rather than invented: ADR 0053
 * believes a finding where two corners agree, and a single corner has nothing
 * to agree with.
 */
const comparedFrom = (reports: readonly BatchReport[]): ComparedBatches => {
  const corners: BatchComparison[] = [];
  for (let pair = 0; pair < reports.length; pair += 2) {
    corners.push(compareBatches(reports[pair], reports[pair + 1]));
  }
  const [sharp, sloppy] = corners;
  return {
    corners,
    read: sloppy === undefined ? null : readAcrossCorners(sharp, sloppy),
  };
};

/**
 * What a person watching sees, on stderr because stdout is the comparison and
 * nothing else: which orderings stand, and what stops any of them standing.
 */
const sayWhatHappened = (compared: ComparedBatches): void => {
  for (const corner of compared.corners) {
    const where = `${corner.left.configuration} against ${corner.right.configuration}`;
    if (corner.mismatches.length === 0) {
      console.error(`${where}: ${corner.readings.length} readings ordered`);
      continue;
    }
    console.error(
      `${where}: every ordering withheld, because the two batches differ in ${corner.mismatches.join(', ')}`,
    );
  }
  if (compared.read === null) return;
  if (compared.read.mismatches.length === 0) {
    console.error(
      `${compared.read.findings.length} readings across the two corners`,
    );
    return;
  }
  console.error(
    `the two corners were not read together, because they differ in ${compared.read.mismatches.join(', ')}`,
  );
};

// The argument counts this command takes: one corner, or the two corners.
const ONE_CORNER = 2;
const TWO_CORNERS = 4;

const main = (): void => {
  const paths = process.argv.slice(2);
  if (paths.length !== ONE_CORNER && paths.length !== TWO_CORNERS) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const reports = reportsAt(paths);
  if (reports === null) {
    process.exitCode = 1;
    return;
  }
  const compared = comparedFrom(reports);
  sayWhatHappened(compared);
  console.log(JSON.stringify(compared, null, 2));
};

main();
