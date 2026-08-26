/**
 * The headless measurement entry: a tape file in, the structured report out as
 * JSON. Run as `pnpm vite-node scripts/measure.ts <tape-file>`.
 *
 * All logic lives in src/dev/measure.ts, which carries mayImport: [] and may
 * not touch node:fs, so this shell only reads the bytes and prints. It sits
 * outside tsconfig.json's include of "src", so tsc never judges it; its judge
 * is the verification run on a real sealed tape.
 */

import { readFileSync } from 'node:fs';

import { measure } from '../src/dev/measure';
import { decodeTape } from '../src/tape/decode';

const main = (): void => {
  const path = process.argv[2];
  if (path === undefined) {
    console.error('usage: pnpm vite-node scripts/measure.ts <tape-file>');
    process.exitCode = 1;
    return;
  }
  const decoded = decodeTape(new Uint8Array(readFileSync(path)));
  console.log(JSON.stringify(measure(decoded), null, 2));
};

main();
