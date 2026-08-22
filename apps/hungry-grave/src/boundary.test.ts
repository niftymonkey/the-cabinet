/**
 * The rendering-import boundary (tracer plan verification step 3), written as
 * an allowlist rather than a denylist. A denylist only catches a direct import
 * of pixi; the leak that actually happens is transitive, through a shared util
 * that looks sim-shaped today and pulls rendering in behind the boundary after
 * a later edit. An allowlist closes that case by induction.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = resolve(import.meta.dirname);

interface Boundary {
  // The folder under src whose files are governed.
  root: string;
  /**
   * Specific files under the root this rule governs, instead of the whole
   * folder. A folder rule over src/app would be the wrong instrument, because
   * src/app legitimately imports pixi and reaches both src/game and src/input;
   * what needs holding is narrower.
   */
  only?: string[];
  // The only paths under src its relative imports may resolve into.
  mayReach: string[];
  // Extra paths under src its test files alone may resolve into.
  mayReachInTests: string[];
  // The only bare packages it may import, outside its test files.
  mayImport: string[];
}

const BOUNDARIES: Boundary[] = [
  // ADR 0013 requires the sim invariants checked on every step in every sim
  // test, and the harness that does it lives in src/dev because it is the rig
  // and not the game. Test files under src/game may therefore reach it, for
  // the same reason TEST_PACKAGES exists below: a test file is not shipped,
  // and the rule is there to keep the rig out of the build rather than out of
  // the tests. Shipped code under src/game still reaches only src/game.
  { root: "game", mayReach: ["game"], mayReachInTests: ["dev"], mayImport: [] },
  {
    root: "input",
    mayReach: ["input", "game"],
    mayReachInTests: [],
    mayImport: [],
  },
  // The headless bot is the full-run test's player and the dev-only autopilot
  // both (ADR 0013), so src/app consumes it while it stays headless itself.
  {
    root: "dev",
    mayReach: ["dev", "game"],
    mayReachInTests: [],
    mayImport: [],
  },
  /**
   * Sound subscribes to the event list and must never reach back into the sim's
   * internals. One file, one rule, one mechanism, rather than a comment asking
   * nicely: src/app/sound.ts was governed by nothing at all, which dispatch 4
   * named as a tripwire.
   *
   * The engine entry is not optional. The SFX class this builds on lives at
   * src/engine/audio/audio.ts, outside src/app entirely, so a rule listing only
   * game would red-light on its own first commit.
   */
  {
    root: "app",
    only: ["sound.ts"],
    mayReach: ["app/getEngine", "game/events", "engine/audio/audio"],
    mayReachInTests: [],
    mayImport: ["@pixi/sound"],
  },
];

// Packages any test file may import, whatever side of a boundary it is on.
const TEST_PACKAGES = ["vitest"];

function typescriptFilesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return typescriptFilesUnder(path);
    return name.endsWith(".ts") ? [path] : [];
  });
}

function importsOf(source: string): string[] {
  const matches = source.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g);
  return [...matches].map((match) => match[1]);
}

/**
 * The whole path under src a relative import resolves to, slash-normalized and
 * without its extension.
 *
 * It used to keep only the top-level folder, which meant a rule naming "game"
 * permitted every module in the sim: the sound rule as a folder-level entry
 * would have passed sound.ts importing mobs.ts, which is the exact thing it
 * exists to forbid. So the narrowing is on the target as well as on the source.
 */
function pathReachedBy(file: string, specifier: string): string {
  const target = resolve(dirname(file), specifier);
  return relative(SRC, target).split(/[/\\]/).join("/").replace(/\.ts$/, "");
}

/**
 * Whether an allowed entry covers a resolved path. An entry matches the path
 * exactly or is a prefix of it at a segment boundary, so "game" still matches
 * "game/mobs" and every existing folder-level entry keeps working unchanged.
 */
function covers(allowed: string, path: string): boolean {
  return path === allowed || path.startsWith(`${allowed}/`);
}

function isTest(file: string): boolean {
  return file.endsWith(".test.ts");
}

function packagesAllowedIn(file: string, boundary: Boundary): string[] {
  return isTest(file)
    ? [...boundary.mayImport, ...TEST_PACKAGES]
    : boundary.mayImport;
}

function foldersAllowedIn(file: string, boundary: Boundary): string[] {
  return isTest(file)
    ? [...boundary.mayReach, ...boundary.mayReachInTests]
    : boundary.mayReach;
}

/**
 * The rule itself, over source text rather than over the disk, so a case with
 * no file behind it can be handed straight to it.
 */
function violationsInSource(
  file: string,
  source: string,
  boundary: Boundary,
): string[] {
  const where = relative(SRC, file);
  return importsOf(source).flatMap((specifier) => {
    const allowed = specifier.startsWith(".")
      ? foldersAllowedIn(file, boundary).some((entry) =>
          covers(entry, pathReachedBy(file, specifier)),
        )
      : packagesAllowedIn(file, boundary).includes(specifier);
    return allowed ? [] : [`${where} imports ${specifier}`];
  });
}

function violationsIn(file: string, boundary: Boundary): string[] {
  return violationsInSource(file, readFileSync(file, "utf8"), boundary);
}

/** The files a boundary governs: its whole folder, or only the ones it names. */
function filesGovernedBy(root: string, boundary: Boundary): string[] {
  if (boundary.only === undefined) return typescriptFilesUnder(root);
  return boundary.only.map((name) => join(root, name));
}

describe("the rendering-import boundary", () => {
  for (const boundary of BOUNDARIES) {
    const root = join(SRC, boundary.root);
    const reach = boundary.mayReach
      .map((folder) => `src/${folder}`)
      .join(" and ");
    const governed = boundary.only
      ? boundary.only
          .map((name) => `src/${boundary.root}/${name}`)
          .join(" and ")
      : `src/${boundary.root}`;
    const title = `${governed} imports only from ${reach}`;

    if (!existsSync(root)) {
      // The rule lands with the folder, in the dispatch that creates it.
      it.todo(title);
      continue;
    }

    it(title, () => {
      const files = filesGovernedBy(root, boundary);
      expect(files.length).toBeGreaterThan(0);
      expect(files.flatMap((file) => violationsIn(file, boundary))).toEqual([]);
    });
  }

  it("the only field governs one file rather than a whole folder", () => {
    // Asserted the way the mayReachInTests case is: a hand-written source
    // string for both the allowed and the forbidden import, with no file
    // behind either.
    const sound = BOUNDARIES.find((boundary) => boundary.only !== undefined)!;
    expect(sound.only).toEqual(["sound.ts"]);

    const allowed = violationsInSource(
      join(SRC, "app", "sound.ts"),
      'import type { SimEvent } from "../game/events";',
      sound,
    );
    expect(allowed).toEqual([]);

    const forbidden = violationsInSource(
      join(SRC, "app", "sound.ts"),
      'import { damageMob } from "../game/mobs";',
      sound,
    );
    expect(forbidden).toHaveLength(1);
    expect(forbidden[0]).toContain("../game/mobs");
  });

  it("narrows the target too, so reaching game/events does not open the whole sim", () => {
    // Without the path-level match, mayReach: ["game/events"] would resolve to
    // the top-level folder "game" and permit every module in it, which is the
    // exact thing the sound rule exists to forbid. This is the assertion that
    // makes the rule a rule.
    const sound = BOUNDARIES.find((boundary) => boundary.only !== undefined)!;
    const file = join(SRC, "app", "sound.ts");
    expect(pathReachedBy(file, "../game/events")).toBe("game/events");
    expect(pathReachedBy(file, "../game/mobs")).toBe("game/mobs");
    expect(covers("game/events", "game/mobs")).toBe(false);
    expect(sound.mayReach.some((entry) => covers(entry, "game/mobs"))).toBe(
      false,
    );
  });

  it("keeps the existing folder-level entries matching, so game still reaches game/mobs", () => {
    const game = BOUNDARIES.find((boundary) => boundary.root === "game")!;
    expect(game.mayReach).toEqual(["game"]);
    expect(covers("game", "game/mobs")).toBe(true);
    expect(covers("game", "game/lines/soulStream")).toBe(true);
    expect(covers("game", "gamepad/thing")).toBe(false);
  });

  it("the src/dev allowance under src/game is for test files alone (ADR 0013)", () => {
    const game = BOUNDARIES.find((boundary) => boundary.root === "game")!;
    const source = 'import { stepChecked } from "../dev/invariants";';

    const shipped = violationsInSource(
      join(SRC, "game", "sim.ts"),
      source,
      game,
    );
    expect(shipped).toHaveLength(1);
    expect(shipped[0]).toContain("../dev/invariants");

    const test = violationsInSource(
      join(SRC, "game", "sim.test.ts"),
      source,
      game,
    );
    expect(test).toEqual([]);
  });
});
