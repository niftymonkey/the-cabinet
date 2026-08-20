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
  // The only folders under src its relative imports may resolve into.
  mayReach: string[];
  // Extra folders its test files alone may resolve into.
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

function folderReachedBy(file: string, specifier: string): string {
  const target = resolve(dirname(file), specifier);
  return relative(SRC, target).split(/[/\\]/)[0];
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
      ? foldersAllowedIn(file, boundary).includes(
          folderReachedBy(file, specifier),
        )
      : packagesAllowedIn(file, boundary).includes(specifier);
    return allowed ? [] : [`${where} imports ${specifier}`];
  });
}

function violationsIn(file: string, boundary: Boundary): string[] {
  return violationsInSource(file, readFileSync(file, "utf8"), boundary);
}

describe("the rendering-import boundary", () => {
  for (const boundary of BOUNDARIES) {
    const root = join(SRC, boundary.root);
    const reach = boundary.mayReach
      .map((folder) => `src/${folder}`)
      .join(" and ");
    const title = `src/${boundary.root} imports only from ${reach}`;

    if (!existsSync(root)) {
      // The rule lands with the folder, in the dispatch that creates it.
      it.todo(title);
      continue;
    }

    it(title, () => {
      const files = typescriptFilesUnder(root);
      expect(files.length).toBeGreaterThan(0);
      expect(files.flatMap((file) => violationsIn(file, boundary))).toEqual([]);
    });
  }

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
