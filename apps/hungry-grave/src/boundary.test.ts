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
  // The only bare packages it may import, outside its test files.
  mayImport: string[];
}

const BOUNDARIES: Boundary[] = [
  { root: "game", mayReach: ["game"], mayImport: [] },
  { root: "input", mayReach: ["input", "game"], mayImport: [] },
  // The headless bot is the full-run test's player and the dev-only autopilot
  // both (ADR 0013), so src/app consumes it while it stays headless itself.
  { root: "dev", mayReach: ["dev", "game"], mayImport: [] },
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

function packagesAllowedIn(file: string, boundary: Boundary): string[] {
  const inTest = file.endsWith(".test.ts");
  return inTest
    ? [...boundary.mayImport, ...TEST_PACKAGES]
    : boundary.mayImport;
}

function violationsIn(file: string, boundary: Boundary): string[] {
  const where = relative(SRC, file);
  return importsOf(readFileSync(file, "utf8")).flatMap((specifier) => {
    const allowed = specifier.startsWith(".")
      ? boundary.mayReach.includes(folderReachedBy(file, specifier))
      : packagesAllowedIn(file, boundary).includes(specifier);
    return allowed ? [] : [`${where} imports ${specifier}`];
  });
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
});
