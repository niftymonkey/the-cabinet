/**
 * Where the roadmap source lives, and the stamp that says which version of it
 * was last built.
 *
 * Both builders write the stamp: the Stop hook and a hand-run
 * `node scripts/roadmap/build-v1.mjs`. A build that did not stamp left the hook seeing a
 * change that was already handled, so it rebuilt and demanded a publish that
 * had already happened.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const SOURCE = 'scripts/roadmap/v1.yaml';
const STAMP = 'scripts/roadmap/build/.v1-hash';

/** Returns the source's hash, or null when the source cannot be read. */
export function sourceHash(root) {
  try {
    return createHash('sha256').update(readFileSync(`${root}/${SOURCE}`)).digest('hex');
  } catch {
    return null;
  }
}

export function readStamp(root) {
  try {
    return readFileSync(`${root}/${STAMP}`, 'utf8').trim();
  } catch {
    // first run
    return '';
  }
}

export function recordHash(root, hash) {
  try {
    mkdirSync(`${root}/scripts/roadmap/build`, { recursive: true });
    writeFileSync(`${root}/${STAMP}`, hash + '\n');
  } catch { /* a stamp we cannot write only costs a repeat rebuild */ }
}
