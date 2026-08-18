// The base app's own test. It lives beside the registry, not inside any
// prototype, so the blank scaffold still has a passing test run after every
// prototype folder is deleted.

import { describe, expect, it } from "vitest";
import { PROTOTYPES, prototypeFromHash, prototypeHash } from "./index";

describe("the prototype registry", () => {
  it("ids are unique, kebab-case, and round-trip through the hash route", () => {
    const ids = PROTOTYPES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PROTOTYPES) {
      expect(p.id).toMatch(/^[a-z0-9-]+$/);
      expect(prototypeFromHash(prototypeHash(p.id))).toBe(p);
    }
  });

  it("unknown and empty hashes route to no prototype", () => {
    expect(prototypeFromHash("#/prototypes/not-a-prototype")).toBeUndefined();
    expect(prototypeFromHash("")).toBeUndefined();
    expect(prototypeFromHash("#")).toBeUndefined();
  });
});
