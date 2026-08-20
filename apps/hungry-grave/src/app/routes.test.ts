// The router's rules, tested away from pixi.

import { describe, expect, it } from "vitest";
import { PROTOTYPES, prototypeHash } from "../prototypes";
import { PROTOTYPES_HASH, resolveRoute } from "./routes";

describe("resolveRoute", () => {
  it("the default hash routes to the game app, not to the prototypes", () => {
    for (const hash of ["", "#", "#/", "#?seed=7", "#/anything-else"]) {
      expect(resolveRoute(hash).kind).toBe("game");
    }
  });

  it("the prototype list keeps #/prototypes", () => {
    expect(resolveRoute(PROTOTYPES_HASH).kind).toBe("prototype-list");
    expect(resolveRoute(`${PROTOTYPES_HASH}/`).kind).toBe("prototype-list");
    expect(resolveRoute(`${PROTOTYPES_HASH}?seed=7`).kind).toBe(
      "prototype-list",
    );
  });

  it("a hash that only starts the same, #/prototypes-old, is the game", () => {
    for (const hash of [
      `${PROTOTYPES_HASH}-old`,
      `${PROTOTYPES_HASH}x`,
      `${PROTOTYPES_HASH}-old/ugly-slice`,
    ]) {
      expect(resolveRoute(hash).kind).toBe("game");
    }
  });

  it("an unknown prototype id falls back to the list, never the game", () => {
    expect(resolveRoute(`${PROTOTYPES_HASH}/not-a-prototype`).kind).toBe(
      "prototype-list",
    );
  });

  it("a registered prototype routes to its entry, query and all", () => {
    for (const entry of PROTOTYPES) {
      const route = resolveRoute(prototypeHash(entry.id));
      expect(route).toEqual({ kind: "prototype", entry });
      expect(resolveRoute(`${prototypeHash(entry.id)}?seed=7`)).toEqual({
        kind: "prototype",
        entry,
      });
    }
  });
});
