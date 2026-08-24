/**
 * What the URL asks of a run: ?seed= pins the run and ?size= pins the grave's
 * starting size (ADR 0012), and ?invariants= turns the sim's own checks on in a
 * build that ships with them off. Pure functions over two strings, so they are
 * testable without a browser.
 *
 * The switch lives beside the two identity parameters rather than in a module
 * of its own because the reader below is the thing worth having once: hash
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

/** The same, for a switch, where falling back means the default rather than rolling fresh. */
function ignoreSwitch(name: string, raw: string): true {
  console.warn(`Ignoring ?${name}=${raw}: the checks stay on instead.`);
  return true;
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

/**
 * The spellings a switch accepts, on either side. Four of each, because this
 * one is typed by hand into a phone and an unreadable value stays on: a fat
 * finger that silently disables the checks makes the two reads look identical
 * and the wrong conclusion look proved.
 */
const SWITCHED_ON = ["on", "1", "true", "yes"];
const SWITCHED_OFF = ["off", "0", "false", "no"];

/**
 * Whether this run checks the sim invariants on every tick (ADR 0017).
 *
 * On unless the URL asks for them off, because the checks are always on in
 * every build a player is handed and only an explicit ?invariants=off turns
 * them off. It is a switch and not a number because the point of it is to be
 * typed into a phone twice off one build, once each way, and read against
 * itself: ?invariants=off, or #/?invariants=off, which wins the same way the
 * seed's hash form does.
 *
 * It is a temporary experimental control and never a feature. It exists so the
 * confirming play's checks-off and checks-on readings come off one instrument,
 * and it is removed once that play succeeds. A player build must not honour it
 * even when somebody types it by hand, which is a build-time gate rather than a
 * naming convention.
 */
export function invariantsFromUrl(search: string, hash: string): boolean {
  const raw = rawParameter("invariants", search, hash);
  if (raw === null) return true;
  const value = raw.trim().toLowerCase();
  if (SWITCHED_ON.includes(value)) return true;
  if (SWITCHED_OFF.includes(value)) return false;
  return ignoreSwitch("invariants", raw);
}
