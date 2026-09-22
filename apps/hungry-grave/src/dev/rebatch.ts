// A batch's report folded again from the tapes already on disk (#148 slice 1).

import { decodeTape } from '../tape/decode';
import { TapeFormatError } from '../tape/tapeFormatError';
import { batchReportOf } from './batchReport';
import type { BatchOrigin, BatchReport } from './batchReport';
import { isConfigurationName } from './configurations';
import { measure } from './measure';
import type { Measurement } from './measure';

/** One tape file as the shell hands it over: the name a refusal says, and the bytes. */
interface StoredTape {
  readonly name: string;
  readonly bytes: Uint8Array;
}

/**
 * One tape read back: the seed it was played under, the two header fields the
 * batch's own identity is rebuilt from, and what the measuring pass made of it.
 *
 * The seed, the hand and the stamp all come off the header rather than off the
 * folder's name, because the bytes are authoritative and the name is a
 * convenience (ADR 0057). The name still has to agree with the seed inside it,
 * or the file was renamed and the fold refuses it.
 */
interface ReadTape {
  readonly seed: number;
  readonly policy: string;
  readonly recordedAt: number;
  readonly measurement: Measurement;
}

/**
 * A folder folded into its report, or refused by the name of the file that
 * stopped it.
 *
 * A folder of tapes is a document and a document is rejected rather than
 * guessed at: a tape this build cannot reproduce, a file that is not a tape, a
 * tape whose name disagrees with the seed inside it and a folder holding two
 * batches all end the fold rather than producing a report over whatever was
 * left.
 */
type Rebatch =
  | { readonly outcome: 'report'; readonly report: BatchReport }
  | { readonly outcome: 'refused'; readonly why: string };

type TapeRead =
  | { readonly outcome: 'read'; readonly tape: ReadTape }
  | { readonly outcome: 'refused'; readonly why: string };

type OriginRead =
  | { readonly outcome: 'origin'; readonly origin: BatchOrigin }
  | { readonly outcome: 'refused'; readonly why: string };

const refused = (why: string): { outcome: 'refused'; why: string } => ({
  outcome: 'refused',
  why,
});

/** The name the batch command writes, which is the seed and nothing else. */
const SEED_IN_NAME = /^(\d+)\.tape$/;

const seedInName = (name: string): number | null => {
  const found = SEED_IN_NAME.exec(name);
  if (found === null) return null;
  const seed = Number(found[1]);
  return Number.isSafeInteger(seed) ? seed : null;
};

/**
 * One stored tape measured, or the reason this folder is not one this tool can
 * fold.
 *
 * Anything the decoder throws that is not a tape-format error is a bug in this
 * build's own codec and flies, on the same terms measure.ts's own shell states.
 */
const readStoredTape = (stored: StoredTape): TapeRead => {
  const named = seedInName(stored.name);
  if (named === null) {
    return refused(
      `${stored.name} is not named <seed>.tape, so this folder is not a batch's own tapes`,
    );
  }
  let decoded;
  try {
    decoded = decodeTape(stored.bytes);
  } catch (error) {
    if (!(error instanceof TapeFormatError)) throw error;
    return refused(`${stored.name} is not a tape (${error.message})`);
  }
  const { seed, policy, recordedAt } = decoded.tape.header;
  // A renamed file is refused before the replay is spent on it: the report
  // names its seeds as a first seed and a count (ADR 0053), so a tape folded
  // under the name's seed would report a verified run under a seed nobody
  // played, and a folder renamed consistently would step by one and never show
  // as a gap.
  if (seed !== named) {
    return refused(
      `${stored.name} holds seed ${seed} in its header, not ${named}, so the file was renamed and the bytes are what a seed means (ADR 0057)`,
    );
  }
  const measurement = measure(decoded);
  if (measurement.outcome !== 'verified') {
    return refused(
      `${stored.name} did not verify (${measurement.outcome}), and metrics come only from a verified replay (ADR 0019)`,
    );
  }
  return { outcome: 'read', tape: { seed, policy, recordedAt, measurement } };
};

/**
 * The first seed a run of tapes should hold and does not, or null when the
 * seeds step by one from the first to the last.
 *
 * Reads tapes already in seed order. A seed held twice ('7.tape' beside
 * '007.tape') shows as the same break, because the seed after it is not the
 * one the run expects.
 */
const firstSeedMissingFromTheRun = (
  tapes: readonly ReadTape[],
): number | null => {
  const first = tapes[0];
  if (first === undefined) return null;
  for (const [at, tape] of tapes.entries()) {
    if (tape.seed !== first.seed + at) return first.seed + at;
  }
  return null;
};

/**
 * The batch these tapes were, read off their own headers.
 *
 * One hand and one stamp is what a batch is: the command plays one
 * configuration and writes one clock reading into every header it makes, so a
 * folder carrying two of either is two batches sharing a folder and its report
 * would name one of them for both.
 */
const originOf = (tapes: readonly ReadTape[]): OriginRead => {
  const first = tapes[0];
  if (first === undefined)
    throw new Error('a rebatch was folded over no tapes');
  const policies = [...new Set(tapes.map((tape) => tape.policy))].sort();
  if (policies.length > 1) {
    return refused(
      `the folder holds tapes from ${policies.length} hands (${policies.join(', ')}), so it is not one batch`,
    );
  }
  if (!isConfigurationName(first.policy)) {
    return refused(
      `${first.policy} names no configuration, so these tapes were not played by the batch command`,
    );
  }
  const stamps = new Set(tapes.map((tape) => tape.recordedAt));
  if (stamps.size > 1) {
    return refused(
      `the folder holds ${stamps.size} recording stamps, so it is not one batch`,
    );
  }
  // The report names its seeds as a first seed and a count (ADR 0053), so a
  // folder with a gap would fold to a report naming a seed nobody read.
  const missing = firstSeedMissingFromTheRun(tapes);
  if (missing !== null) {
    return refused(
      `the folder's seeds do not step by one from ${first.seed}: seed ${missing} is not where the run expects it, so the folder is not a whole batch`,
    );
  }
  return {
    outcome: 'origin',
    origin: {
      configuration: first.policy,
      firstSeed: first.seed,
      seeds: tapes.length,
      recordedAt: first.recordedAt,
    },
  };
};

/**
 * The report a folder of stored tapes folds to, measured through the same pass
 * the batch command measures its own bytes through.
 *
 * The tapes are folded in seed order because that is the order the batch played
 * them in, and every spread keeps the samples a rank test reads: a fold in the
 * order the filesystem happened to list would print the same summary over a
 * differently ordered sample list.
 */
const rebatchOf = (stored: readonly StoredTape[]): Rebatch => {
  if (stored.length === 0) return refused('the folder holds no .tape file');
  const tapes: ReadTape[] = [];
  for (const one of stored) {
    const read = readStoredTape(one);
    if (read.outcome === 'refused') return refused(read.why);
    tapes.push(read.tape);
  }
  tapes.sort((left, right) => left.seed - right.seed);
  const origin = originOf(tapes);
  if (origin.outcome === 'refused') return refused(origin.why);
  return {
    outcome: 'report',
    report: batchReportOf(
      origin.origin,
      tapes.map((tape) => ({ seed: tape.seed, measurement: tape.measurement })),
    ),
  };
};

export { rebatchOf };
export type { ReadTape, Rebatch, StoredTape };
