/**
 * The route table. The URL fragment is the single navigation authority between
 * the game and the prototype list: buttons only assign location.hash, and the
 * router in main.ts answers boot, in-app hash writes, and the browser's back
 * and forward buttons alike. Screens inside the game navigate directly and
 * never touch the hash.
 *
 * This module stays free of pixi so the routing rules are unit-testable.
 */

import type { PrototypeEntry } from "../prototypes";
import { prototypeFromHash } from "../prototypes";

export const PROTOTYPES_HASH = "#/prototypes";

export type Route =
  | { kind: "game" }
  | { kind: "prototype-list" }
  | { kind: "prototype"; entry: PrototypeEntry };

/**
 * True for the prototype list's own hash and for anything below it, and false
 * for a lookalike such as #/prototypes-old. A prefix test alone hands every
 * lookalike to the sandbox, so the match ends on a route boundary: the hash
 * itself, or the hash followed by a path or a query.
 */
function isPrototypeListHash(hash: string): boolean {
  if (!hash.startsWith(PROTOTYPES_HASH)) return false;
  const rest = hash.slice(PROTOTYPES_HASH.length);
  return rest === "" || rest.startsWith("/") || rest.startsWith("?");
}

/**
 * The default route is the game app rather than the prototype sandbox: the
 * prototypes live behind their own hash, and every other hash is the game's.
 */
export function resolveRoute(hash: string): Route {
  const entry = prototypeFromHash(hash);
  if (entry) return { kind: "prototype", entry };
  if (isPrototypeListHash(hash)) return { kind: "prototype-list" };
  return { kind: "game" };
}
