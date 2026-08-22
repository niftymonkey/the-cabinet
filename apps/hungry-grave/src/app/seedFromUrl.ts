/**
 * The run's identity as the URL states it (ADR 0012): ?seed= pins the run and
 * ?size= pins the grave's starting size. Pure functions over two strings, so
 * they are testable without a browser.
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

import { SEED_LIMIT } from "../game/run";

/** The query the hash carries, which is everything after its first question mark. */
function hashQuery(hash: string): string {
  const start = hash.indexOf("?");
  return start < 0 ? "" : hash.slice(start + 1);
}

/** The parameter as the URL states it, hash first, or null when neither form names it. */
function rawParameter(
  name: string,
  search: string,
  hash: string,
): string | null {
  const fromHash = new URLSearchParams(hashQuery(hash)).get(name);
  if (fromHash !== null) return fromHash;
  return new URLSearchParams(search).get(name);
}

function ignore(name: string, raw: string): null {
  console.warn(`Ignoring ?${name}=${raw}: the run rolls fresh instead.`);
  return null;
}

/** A number the string actually spells. Number("") is 0, which would pin seed zero on an empty parameter. */
function parsed(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * The pinned seed, or null when there is none to pin. Accepts exactly a seed
 * the roll itself could have produced: a whole number, zero or greater, below
 * SEED_LIMIT.
 */
export function seedFromUrl(search: string, hash: string): number | null {
  const raw = rawParameter("seed", search, hash);
  if (raw === null) return null;
  const value = parsed(raw);
  if (value === null || !Number.isInteger(value)) return ignore("seed", raw);
  if (value < 0 || value >= SEED_LIMIT) return ignore("seed", raw);
  return value;
}

/**
 * The pinned starting size, or null when there is none. Fractional values are
 * allowed, because the sim's sizes are fractional.
 *
 * It parses and does not clamp. ADR 0003's floor and ceiling are the rules
 * layer's to defend and createRun holds them, so a URL parser in the app layer
 * is no longer standing in for grave.ts. What is refused here is a string that
 * names no number at all.
 */
export function sizeFromUrl(search: string, hash: string): number | null {
  const raw = rawParameter("size", search, hash);
  if (raw === null) return null;
  const value = parsed(raw);
  if (value === null) return ignore("size", raw);
  return value;
}
