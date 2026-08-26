/**
 * The headless measurement entry: a tape file in, the structured report out as
 * JSON. Run as `pnpm vite-node scripts/measure.ts <tape-file>`.
 *
 * The logic lives in src/dev, across measure.ts, framePerformance.ts and
 * replayTallies.ts, all of which carry mayImport: [] and may not touch node:fs.
 * So this shell reads the bytes, prints the report, and says why when the bytes
 * are not a tape.
 */

import { readFileSync } from 'node:fs';

import { measure } from '../src/dev/measure';
import type { DecodedTape } from '../src/tape/decode';
import { decodeTape } from '../src/tape/decode';
import { TapeFormatError } from '../src/tape/tapeFormatError';

/**
 * The decoded tape, or null once the file has been refused out loud.
 *
 * Bytes that are not a tape are an external failure and the person holding the
 * file is the nearest owner who can act, so they get the reason and the cost
 * rather than a stack. Anything else out of the decoder is a bug in it and
 * flies, because a checker that cannot run must not be swallowed.
 */
const decodeOrRefuse = (
  path: string,
  bytes: Uint8Array,
): DecodedTape | null => {
  try {
    return decodeTape(bytes);
  } catch (error) {
    if (!(error instanceof TapeFormatError)) throw error;
    console.error(
      `${path} is not a tape (${error.message}); no measurement was taken`,
    );
    return null;
  }
};

const main = (): void => {
  const path = process.argv[2];
  if (path === undefined) {
    console.error('usage: pnpm vite-node scripts/measure.ts <tape-file>');
    process.exitCode = 1;
    return;
  }
  const decoded = decodeOrRefuse(path, new Uint8Array(readFileSync(path)));
  if (decoded === null) {
    process.exitCode = 1;
    return;
  }
  console.log(JSON.stringify(measure(decoded), null, 2));
};

main();
