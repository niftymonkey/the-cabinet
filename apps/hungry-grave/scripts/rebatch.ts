/**
 * The refold entry: one batch folder in, its report folded again from the tapes
 * it already holds, written beside them, and that file's path as the whole of
 * stdout. Run as
 * `pnpm vite-node --config vite.headless.config.ts scripts/rebatch.ts <batch-folder>`.
 *
 * It exists because a reading added after a batch was played can otherwise
 * never be read off it: scripts/batch.ts always plays a fresh run, and a tape
 * recorded under one rule does not replay under another (ADR 0019), so the only
 * way to read a new figure off an old batch is to fold its own bytes again.
 *
 * The folding lives in src/dev/rebatch.ts, which carries mayImport: [] and may
 * not touch node:fs. So this shell lists the folder, reads the bytes, writes
 * the report, and says why when a path or a tape will not do.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { rebatchOf } from '../src/dev/rebatch';
import type { StoredTape } from '../src/dev/rebatch';

const USAGE = `usage: pnpm vite-node --config vite.headless.config.ts scripts/rebatch.ts <batch-folder>
  a batch folder is one scripts/batch.ts wrote: <seed>.tape files beside a report.json`;

/**
 * The refolded report's own name. It is never `report.json`: the batch that
 * played the runs wrote that one, and a folder whose report was overwritten by
 * a later build's reading could no longer answer what the batch said when it
 * was played.
 */
const REFOLDED_REPORT = 'report.rebatch.json';

/**
 * A flawed argument or an unreadable path is an external failure and the person
 * holding the command line is the nearest owner who can act, so they get the
 * reason and the cost rather than a stack.
 */
const refuse = (reason: string): null => {
  console.error(`${reason}; no report was written`);
  return null;
};

/**
 * Every tape in the folder, or null once the folder has been refused out loud.
 * Anything either call throws without a syscall behind it is a bug in this
 * shell's own call and flies.
 */
const tapesIn = (folder: string): StoredTape[] | null => {
  try {
    return readdirSync(folder)
      .filter((name) => name.endsWith('.tape'))
      .map((name) => ({
        name,
        bytes: new Uint8Array(readFileSync(join(folder, name))),
      }));
  } catch (error) {
    if (!(error instanceof Error) || !('errno' in error)) throw error;
    return refuse(`${folder} could not be read (${error.message})`);
  }
};

const writeOrRefuse = (path: string, contents: string): boolean => {
  try {
    writeFileSync(path, contents);
    return true;
  } catch (error) {
    if (!(error instanceof Error) || !('errno' in error)) throw error;
    return refuse(`${path} could not be written (${error.message})`) !== null;
  }
};

const main = (): void => {
  const folder = process.argv[2];
  if (folder === undefined) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const tapes = tapesIn(folder);
  if (tapes === null) {
    process.exitCode = 1;
    return;
  }
  const folded = rebatchOf(tapes);
  if (folded.outcome === 'refused') {
    refuse(folded.why);
    process.exitCode = 1;
    return;
  }
  const path = join(folder, REFOLDED_REPORT);
  console.error(
    `${folded.report.verified} of ${tapes.length} verified, folded again from the bytes`,
  );
  if (!writeOrRefuse(path, JSON.stringify(folded.report, null, 2))) {
    process.exitCode = 1;
    return;
  }
  console.log(path);
};

main();
