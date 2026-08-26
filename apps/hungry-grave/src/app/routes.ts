/**
 * The route table. The URL fragment is the single navigation authority between
 * the game and the prototype list: buttons only assign location.hash, and the
 * router in main.ts answers boot, in-app hash writes, and the browser's back
 * and forward buttons alike. Screens inside the game navigate directly and
 * never touch the hash.
 *
 * This module stays free of pixi so the routing rules are unit-testable.
 */

import type { PrototypeEntry } from '../prototypes';
import { prototypeFromHash } from '../prototypes';

const PROTOTYPES_HASH = '#/prototypes';

/**
 * The golden digest, run in whatever browser opened this URL. ADR 0015's claim
 * is cross-engine and CI and the developer's machine are the same Node, so
 * without a browser that runs the digest the claim goes unchecked until the
 * final dispatch.
 */
const DIGEST_HASH = '#/digest';

/**
 * The instrument route: a tape rendered at a chosen tick (ADR 0020). It is for
 * the agent and for development, and it stays that; the shipped player route
 * is reserved as #/watch and deliberately not built, so a player-facing
 * feature is never built on a debug URL.
 */
const REPLAY_HASH = '#/replay';

// The kept runs in this browser's tape store, listed with a way into replay.
const RUNS_HASH = '#/runs';

type Route =
  | { kind: 'game' }
  | { kind: 'prototype-list' }
  | { kind: 'digest' }
  | { kind: 'replay' }
  | { kind: 'runs' }
  | { kind: 'prototype'; entry: PrototypeEntry };

/**
 * True for a route's own hash and for anything below it, and false for a
 * lookalike such as #/prototypes-old. A prefix test alone hands every lookalike
 * to the route, so the match ends on a route boundary: the hash itself, or the
 * hash followed by a path or a query.
 */
const isRouteHash = (hash: string, route: string): boolean => {
  if (!hash.startsWith(route)) return false;
  const rest = hash.slice(route.length);
  return rest === '' || rest.startsWith('/') || rest.startsWith('?');
};

/**
 * The default route is the game app rather than the prototype sandbox: the
 * prototypes live behind their own hash, and every other hash is the game's.
 */
const resolveRoute = (hash: string): Route => {
  const entry = prototypeFromHash(hash);
  if (entry) return { kind: 'prototype', entry };
  if (isRouteHash(hash, PROTOTYPES_HASH)) return { kind: 'prototype-list' };
  if (isRouteHash(hash, DIGEST_HASH)) return { kind: 'digest' };
  if (isRouteHash(hash, REPLAY_HASH)) return { kind: 'replay' };
  if (isRouteHash(hash, RUNS_HASH)) return { kind: 'runs' };
  return { kind: 'game' };
};

export { resolveRoute, PROTOTYPES_HASH, DIGEST_HASH, REPLAY_HASH, RUNS_HASH };
export type { Route };
