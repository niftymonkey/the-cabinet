// Decision-log entry 13: a seed pinned in the URL replays the identical run,
// and both URL forms pin it; anything else means fresh dice per run.

import { describe, expect, it } from "vitest";

import { parseSeedParam } from "./runState";

describe("parseSeedParam (entry 13: both URL forms pin the run)", () => {
  it("reads the seed from the hash query, the natural form", () => {
    expect(parseSeedParam("#/prototypes/ugly-slice?seed=7", "")).toBe(7);
  });

  it("reads the seed from the search before the hash", () => {
    expect(parseSeedParam("#/prototypes/ugly-slice", "?seed=99")).toBe(99);
  });

  it("prefers the hash query when both carry a seed", () => {
    expect(parseSeedParam("#/prototypes/ugly-slice?seed=7", "?seed=99")).toBe(7);
  });

  it("returns null when no seed is pinned, so the run rolls fresh dice", () => {
    expect(parseSeedParam("#/prototypes/ugly-slice", "")).toBeNull();
  });

  it("returns null for a seed that is not a number", () => {
    expect(parseSeedParam("#/prototypes/ugly-slice?seed=abc", "")).toBeNull();
  });
});
