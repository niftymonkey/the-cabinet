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
 * The default route is the game (Hungry Grave ADR 0010): the deployed URL
 * boots straight into it, and the prototypes live behind #/prototypes.
 */
export function resolveRoute(hash: string): Route {
  const entry = prototypeFromHash(hash);
  if (entry) return { kind: "prototype", entry };
  if (hash.startsWith(PROTOTYPES_HASH)) return { kind: "prototype-list" };
  return { kind: "game" };
}
