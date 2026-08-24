/**
 * ?seed= and ?size= in both URL forms (ADR 0012). Pure functions over two
 * strings, so they are testable without a browser.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_LEVEL } from "../game/lines/roster";
import { createRun, SEED_LIMIT } from "../game/run";
import { SIZE_CEILING, SIZE_FLOOR } from "../game/tuning";
import {
  invariantsFromUrl,
  levelsFromUrl,
  seedFromUrl,
  sizeFromUrl,
} from "./seedFromUrl";

describe("seedFromUrl", () => {
  beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("?seed=1234 in the search pins that seed (ADR 0012)", () => {
    expect(seedFromUrl("?seed=1234", "")).toBe(1234);
    expect(seedFromUrl("?seed=1234", "#/")).toBe(1234);
  });

  it("#/?seed=1234 after the route pins that seed (ADR 0012)", () => {
    expect(seedFromUrl("", "#/?seed=1234")).toBe(1234);
    expect(seedFromUrl("", "#?seed=1234")).toBe(1234);
  });

  it("with both present the hash's query wins, because the hash is this app's navigation authority", () => {
    // A stale ?seed= left in the search would otherwise silently override a
    // fresh seed an in-app link had just written, and the hash is the part
    // that changes without a reload.
    expect(seedFromUrl("?seed=1", "#/?seed=2")).toBe(2);
  });

  it("no seed anywhere gives null, and the run rolls fresh", () => {
    expect(seedFromUrl("", "")).toBeNull();
    expect(seedFromUrl("?size=20", "#/prototypes")).toBeNull();
  });

  it("a non-numeric, negative, fractional or out-of-range seed gives null and warns, so a typo still yields a game", () => {
    for (const raw of ["abc", "-1", "1.5", "", "1e999"]) {
      expect(seedFromUrl(`?seed=${raw}`, "")).toBeNull();
    }
    expect(console.warn).toHaveBeenCalledTimes(5);
    expect(vi.mocked(console.warn).mock.calls[0].join(" ")).toContain("abc");
  });

  it("SEED_LIMIT - 1 is accepted and SEED_LIMIT is not, so every pinned seed is one the roll could have produced", () => {
    expect(seedFromUrl(`?seed=${SEED_LIMIT - 1}`, "")).toBe(SEED_LIMIT - 1);
    expect(seedFromUrl(`?seed=${SEED_LIMIT}`, "")).toBeNull();
    expect(seedFromUrl("?seed=0", "")).toBe(0);
  });
});

describe("sizeFromUrl", () => {
  beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("?size= pins a starting size in either form", () => {
    // It exists because the on-device check is otherwise blind to two thirds of
    // the game: the grave is unfeedable in 3b, so without it Mark steers at
    // SIZE_START only, and a floor grave covers 15 of its own body-widths a
    // second where a ceiling grave covers 4.
    expect(sizeFromUrl(`?size=${SIZE_FLOOR}`, "")).toBe(SIZE_FLOOR);
    expect(sizeFromUrl("", `#/?size=${SIZE_CEILING}`)).toBe(SIZE_CEILING);
    expect(sizeFromUrl("?size=27.5", "")).toBe(27.5);
    expect(sizeFromUrl("?size=1", "#/?size=40")).toBe(40);

    expect(sizeFromUrl("", "")).toBeNull();
    expect(sizeFromUrl("?size=huge", "")).toBeNull();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it("parses and does not clamp, because ADR 0003's bounds belong to the rules layer", () => {
    // The hole this closes: ?size= used to write run.grave.size from src/app,
    // so the sim's own hard bounds were defended by a URL parser. createRun
    // takes the value now and grave.ts holds the floor and the ceiling.
    expect(sizeFromUrl(`?size=${SIZE_FLOOR - 10}`, "")).toBe(SIZE_FLOOR - 10);
    expect(sizeFromUrl(`?size=${SIZE_CEILING + 10}`, "")).toBe(
      SIZE_CEILING + 10,
    );
    expect(createRun(1, sizeFromUrl("?size=0", "")!).grave.size).toBe(
      SIZE_FLOOR,
    );
    expect(createRun(1, sizeFromUrl("?size=999", "")!).grave.size).toBe(
      SIZE_CEILING,
    );
  });
});

describe("levelsFromUrl", () => {
  beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("?levels= pins a starting level for all four lines, in either URL form", () => {
    // The measurement's stated condition is a dense moment with the lines
    // levelled, and no reachable run produces one: the ladder to level five on
    // all four costs eighteen drops and the stage pays for at most twelve.
    expect(levelsFromUrl("?levels=5", "")).toBe(5);
    expect(levelsFromUrl("", "#/?levels=3")).toBe(3);
    expect(levelsFromUrl("", "")).toBeNull();
  });

  it("with both present the hash's query wins, the same way the seed's does", () => {
    expect(levelsFromUrl("?levels=1", "#/?levels=4")).toBe(4);
  });

  it("accepts exactly zero to the max line level, whole numbers only", () => {
    expect(levelsFromUrl("?levels=0", "")).toBe(0);
    expect(levelsFromUrl(`?levels=${MAX_LEVEL}`, "")).toBe(MAX_LEVEL);
    expect(levelsFromUrl(`?levels=${MAX_LEVEL + 1}`, "")).toBeNull();
    expect(levelsFromUrl("?levels=-1", "")).toBeNull();
    expect(levelsFromUrl("?levels=2.5", "")).toBeNull();
  });

  it("warns about garbage and ignores it, so a typo still yields a game", () => {
    for (const raw of ["max", "", "1e999", "NaN"]) {
      expect(levelsFromUrl(`?levels=${raw}`, "")).toBeNull();
    }
    expect(console.warn).toHaveBeenCalledTimes(4);
    expect(vi.mocked(console.warn).mock.calls[0].join(" ")).toContain("max");
  });
});

describe("invariantsFromUrl", () => {
  beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("is on unless the URL asks them off, because the checks are always on in a player's build (ADR 0017)", () => {
    expect(invariantsFromUrl("", "")).toBe(true);
    expect(invariantsFromUrl("?seed=1234", "#/?size=20")).toBe(true);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("accepts on, 1, true and yes either way round, in either URL form", () => {
    for (const raw of ["on", "1", "true", "yes", "ON", " True "]) {
      expect(invariantsFromUrl(`?invariants=${raw}`, "")).toBe(true);
      expect(invariantsFromUrl("", `#/?invariants=${raw}`)).toBe(true);
    }
    for (const raw of ["off", "0", "false", "no"]) {
      expect(invariantsFromUrl(`?invariants=${raw}`, "")).toBe(false);
    }
  });

  it("with both present the hash's query wins, the same way the seed's does", () => {
    expect(invariantsFromUrl("?invariants=off", "#/?invariants=on")).toBe(true);
    expect(invariantsFromUrl("?invariants=on", "#/?invariants=off")).toBe(
      false,
    );
  });

  it("a value it cannot read warns and stays on, so a typo cannot silently take the checks off a reading", () => {
    expect(invariantsFromUrl("?invariants=maybe", "")).toBe(true);
    expect(invariantsFromUrl("?invariants=", "")).toBe(true);
    expect(console.warn).toHaveBeenCalledTimes(2);
  });
});
