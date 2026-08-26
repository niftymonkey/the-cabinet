/**
 * What the URL asks of a run: ?seed= pins the run and ?size= pins the grave's
 * starting size (ADR 0012), and ?levels= pins the weapon loadout (ADR 0020).
 * Pure functions over two strings, so they are testable without a browser.
 *
 * The controls live beside the two identity parameters rather than in modules
 * of their own because the reader below is the thing worth having once: hash
 * query first, search second, one warning on anything unusable.
 *
 * Both parameters are read from the hash's own query before the search, and
 * the hash wins when both are present. The hash is this app's single
 * navigation authority (see routes.ts) and the only part that changes without
 * a reload, so a stale ?seed= left in the search must not silently override a
 * fresh seed an in-app link has just written.
 *
 * A value this module cannot use is warned about once and ignored, and the run
 * rolls fresh: a playtester who fat-fingers a seed should still get a game
 * rather than a blank screen.
 */

import { MAX_LEVEL } from '../game/lines/roster';
import { SEED_LIMIT } from '../game/run';

// The query the hash carries, which is everything after its first question mark.
const hashQuery = (hash: string): string => {
  const start = hash.indexOf('?');
  return start < 0 ? '' : hash.slice(start + 1);
};

// The parameter as the URL states it, hash first, or null when neither form names it.
const rawParameter = (
  name: string,
  search: string,
  hash: string,
): string | null => {
  const fromHash = new URLSearchParams(hashQuery(hash)).get(name);
  if (fromHash !== null) return fromHash;
  return new URLSearchParams(search).get(name);
};

const ignore = (name: string, raw: string): null => {
  console.warn(`Ignoring ?${name}=${raw}: the run rolls fresh instead.`);
  return null;
};

// A number the string actually spells. Number("") is 0, which would pin seed zero on an empty parameter.
const parsed = (raw: string): number | null => {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

/**
 * The pinned seed, or null when there is none to pin. Accepts exactly a seed
 * the roll itself could have produced: a whole number, zero or greater, below
 * SEED_LIMIT.
 */
const seedFromUrl = (search: string, hash: string): number | null => {
  const raw = rawParameter('seed', search, hash);
  if (raw === null) return null;
  const value = parsed(raw);
  if (value === null || !Number.isInteger(value)) return ignore('seed', raw);
  if (value < 0 || value >= SEED_LIMIT) return ignore('seed', raw);
  return value;
};

/**
 * The pinned starting size, or null when there is none. Fractional values are
 * allowed, because the sim's sizes are fractional.
 *
 * It parses and does not clamp. ADR 0003's floor and ceiling are the rules
 * layer's to defend and createRun holds them, so a URL parser in the app layer
 * is no longer standing in for grave.ts. What is refused here is a string that
 * names no number at all.
 */
const sizeFromUrl = (search: string, hash: string): number | null => {
  const raw = rawParameter('size', search, hash);
  if (raw === null) return null;
  const value = parsed(raw);
  if (value === null) return ignore('size', raw);
  return value;
};

// The same, for the loadout pin, where falling back means the birthright levels.
const ignoreLevels = (raw: string): null => {
  console.warn(
    `Ignoring ?levels=${raw}: the run keeps its birthright instead.`,
  );
  return null;
};

/**
 * The pinned starting level for all four weapon lines, or null when there is
 * none to pin. One whole number, zero to the max line level: per-line syntax
 * buys nothing the measurement needs.
 *
 * It is a development and testing control and never a player-facing feature
 * (ADR 0020). It exists because the confirming measurement's stated condition
 * is a dense moment with the lines levelled, and no reachable run produces
 * one. Its behaviour belongs behind the instrumentation build's gate: a
 * player build must not honour it even typed by hand, which is a build-time
 * gate rather than a naming convention.
 */
const levelsFromUrl = (search: string, hash: string): number | null => {
  const raw = rawParameter('levels', search, hash);
  if (raw === null) return null;
  const value = parsed(raw);
  if (value === null || !Number.isInteger(value)) return ignoreLevels(raw);
  if (value < 0 || value > MAX_LEVEL) return ignoreLevels(raw);
  return value;
};

/**
 * The tape URL a replay fetches, or null when the URL names none (#58).
 *
 * The string is not judged here: whether it is fetchable is the fetch's own
 * question, and the replay screen states that failure plainly. What is refused
 * is a parameter with nothing in it, because there is nothing to fetch and
 * warning is kinder than a silent blank replay.
 */
const tapeFromUrl = (search: string, hash: string): string | null => {
  const raw = rawParameter('tape', search, hash);
  if (raw === null) return null;
  if (raw.trim() === '') {
    console.warn('Ignoring an empty ?tape=: there is no tape to fetch.');
    return null;
  }
  return raw;
};

// The same, for the replay's opening tick, where falling back means the start.
const ignoreAt = (raw: string): null => {
  console.warn(`Ignoring ?at=${raw}: the replay opens at its start instead.`);
  return null;
};

/**
 * The tick a replay opens at, or null when there is none to open at. Accepts
 * exactly what a tick count can be: a whole number, zero or greater. The bound
 * against the tape's own verified length is the replay screen's to hold, the
 * same split sizeFromUrl records for ADR 0003's floor and ceiling.
 */
const atFromUrl = (search: string, hash: string): number | null => {
  const raw = rawParameter('at', search, hash);
  if (raw === null) return null;
  const value = parsed(raw);
  if (value === null || !Number.isInteger(value)) return ignoreAt(raw);
  if (value < 0) return ignoreAt(raw);
  return value;
};

export { seedFromUrl, sizeFromUrl, levelsFromUrl, tapeFromUrl, atFromUrl };
