/**
 * The two fences that keep a weapon line's rules inside the line's own module:
 * a policy never names a line, and a constant carrying a line's name is
 * declared where that line is. Together they are what makes the standing
 * extensibility constraint mechanical, so a fifth line stays one module plus
 * its rows rather than an edit spread across the sim.
 *
 * They span src/game and src/dev, so they sit at the src root rather than
 * inside either of them.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { WeaponLine } from '../game/lines/roster';
import { WEAPON_LINES } from '../game/lines/roster';

const SRC = resolve(import.meta.dirname, '..');

/** A file's path under src, slash-normalized and carrying its extension. */
const modulePathOf = (file: string): string =>
  relative(SRC, file).split(/[/\\]/).join('/');

/**
 * Both fences read the source text rather than importing the module, and that
 * is the ruling this file rests on.
 *
 * Importing cannot see either property. A string literal inside a function
 * body and the name a constant is declared under are both gone by the time a
 * module is a value: an import shows what a module exports, and what these
 * fences guard is what a module is written to contain. A module could name
 * every line in a private branch and export nothing that says so.
 *
 * Reading the text is also what stays honest when a fifth line arrives. The
 * line list comes from the roster, the module list comes from the disk, and a
 * new line's module is a new file the walk finds without being told about it.
 */
const sourceOf = (module: string): string =>
  readFileSync(join(SRC, module), 'utf8');

/**
 * Every production module under src, by path.
 *
 * Prototypes are outside every fence in this repo, and test files are outside
 * this one: a line's own test pins that line's ladder by name, which is the
 * test doing its job rather than a policy naming a line.
 */
const productionModulesUnder = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === 'prototypes' || name === '__tests__') return [];
      return productionModulesUnder(path);
    }
    return name.endsWith('.ts') ? [modulePathOf(path)] : [];
  });

/**
 * The three modules that decide what a run may be offered and what the bot
 * reaches for. Each is a policy over the lines rather than a line, so naming
 * one is the failure this fence exists for.
 */
const POLICY_MODULES: readonly string[] = [
  'game/offer.ts',
  'game/carriers.ts',
  'dev/bot.ts',
];

/**
 * Whether a source quotes a name, in any of the three quote characters a
 * string literal can carry.
 *
 * Quoting is what makes a name a literal, so `state.levels.bell` is a field
 * read and passes. A comment that quotes a line trips it too, and that is the
 * strict direction on purpose: a fence that had to lex the file to tell a
 * comment from a literal would be a parser wearing a fence's name.
 */
const quotesName = (source: string, name: string): boolean =>
  [`'${name}'`, `"${name}"`, `\`${name}\``].some((literal) =>
    source.includes(literal),
  );

/**
 * The prefixes a line's own constants carry: the leading lowercase run of the
 * line's name, uppercased, plus the singular when it ends in an s.
 *
 * The leading run alone and not every camel word, because the second word
 * collides. `skullStream` would otherwise claim STREAM_ORDER in witness.ts,
 * which names the RNG streams and has nothing to do with a weapon line.
 */
const prefixesOf = (line: WeaponLine): string[] => {
  const word = (/^[a-z]+/.exec(line)?.[0] ?? line).toUpperCase();
  return word.endsWith('S') ? [word, word.slice(0, -1)] : [word];
};

/**
 * The screaming-case constants a module declares, by name.
 *
 * The export modifier is optional in the match. No production module in this
 * tree exports at the declaration, because the module form puts one export
 * block at the end, but a fence whose regex depended on that would hold only
 * as long as the convention does.
 */
const constantsDeclaredIn = (source: string): string[] =>
  [
    ...source.matchAll(
      /(?:^|\n)[ \t]*(?:export[ \t]+)?(?:const|let|var)[ \t]+([A-Z][A-Z0-9_]*)\b/g,
    ),
  ].map((match) => match[1]);

const carriesPrefixOf = (name: string, line: WeaponLine): boolean =>
  prefixesOf(line).some(
    (prefix) => name === prefix || name.startsWith(`${prefix}_`),
  );

/**
 * The one exception, and both halves of it carry the reason.
 *
 * src/game/caps.ts owns the entity cap policy (caps.ts:1-8): a pool's capacity
 * is a safety net over a shared pool, read beside MOB_CAP and derived the same
 * way, rather than a rung of a line's ladder. A fifth line's pool needs its
 * capacity there beside the others, so the recipe stays four registrations.
 *
 * The suffix is what keeps this from being a hole. A tuning row named for a
 * line still fails inside caps.ts, and a constant named `_CAP` still fails
 * everywhere else.
 */
const CAP_POLICY = 'game/caps.ts';

const isPoolCapacity = (module: string, name: string): boolean =>
  module === CAP_POLICY && name.endsWith('_CAP');

/** Where a constant carrying a line's name is declared outside that line's module. */
const strayLineConstantsIn = (module: string, source: string): string[] =>
  constantsDeclaredIn(source).flatMap((name) => {
    if (isPoolCapacity(module, name)) return [];
    const claimed = WEAPON_LINES.filter(
      (line) =>
        module !== `game/lines/${line}.ts` && carriesPrefixOf(name, line),
    );
    return claimed.map((line) => `${module} declares ${name} (${line})`);
  });

describe('a policy names no weapon line', () => {
  for (const module of POLICY_MODULES) {
    it(`src/${module} names no weapon line`, () => {
      // The list comes from the roster rather than from four spellings written
      // here, so a fifth line joins this fence the moment it joins the pool.
      const source = sourceOf(module);
      expect(WEAPON_LINES.filter((line) => quotesName(source, line))).toEqual(
        [],
      );
    });
  }

  it('catches a named line, so the scan is a fence and not a decoration', () => {
    expect(quotesName("const offered = 'bell';", 'bell')).toBe(true);
    expect(quotesName('const offered = "bell";', 'bell')).toBe(true);
    expect(quotesName('const offered = `bell`;', 'bell')).toBe(true);
  });

  it('reads a quoted name and not a field that happens to be one', () => {
    // A policy reads state.levels.bell and state.roster all day. Those are the
    // line-agnostic form working, so a fence that flagged them could only go
    // green by forbidding a policy from reading the run at all.
    expect(quotesName('if (state.levels.bell > 0) return;', 'bell')).toBe(
      false,
    );
    expect(quotesName('const owned = levels[line];', 'skullStream')).toBe(
      false,
    );
  });
});

describe("a line's constants are declared in that line's own module", () => {
  it('no module outside a line declares a constant carrying that line name', () => {
    const modules = productionModulesUnder(SRC);
    expect(modules.length).toBeGreaterThan(0);
    expect(
      modules.flatMap((module) =>
        strayLineConstantsIn(module, sourceOf(module)),
      ),
    ).toEqual([]);
  });

  it('every line in the pool has a module of its own to hold them', () => {
    // The fence excuses `game/lines/<line>.ts` by name, so a line whose module
    // is spelled anything else would excuse nothing and the rule would read as
    // green while holding nobody.
    const modules = productionModulesUnder(SRC);
    for (const line of WEAPON_LINES) {
      expect(modules, line).toContain(`game/lines/${line}.ts`);
    }
  });

  it('catches a row moved out of its line, and leaves the line itself alone', () => {
    const row = 'const BELL_CONE_ROWS = [];\n';
    expect(strayLineConstantsIn('game/tuning.ts', row)).toEqual([
      'game/tuning.ts declares BELL_CONE_ROWS (bell)',
    ]);
    expect(strayLineConstantsIn('game/lines/bell.ts', row)).toEqual([]);
  });

  it('catches a row exported where it is declared, not only the block form', () => {
    // The module form puts one export block at the end, so nothing in the tree
    // is written this way today. A row that arrived in the other form would
    // still be a row in the wrong module.
    expect(
      strayLineConstantsIn('game/tuning.ts', 'export const BELL_REACH = 90;\n'),
    ).toEqual(['game/tuning.ts declares BELL_REACH (bell)']);
  });

  it('holds the singular of a plural line name, which is how wisps spell theirs', () => {
    // WISP_FLOOR_SOULS and WISPS_BY_LEVEL are the same line's rows, so a fence
    // matching only the roster's spelling would guard half of them.
    const rows = 'const WISP_FLOOR_SOULS = 1;\nconst WISPS_BY_LEVEL = [];\n';
    expect(strayLineConstantsIn('game/tuning.ts', rows)).toEqual([
      'game/tuning.ts declares WISP_FLOOR_SOULS (wisps)',
      'game/tuning.ts declares WISPS_BY_LEVEL (wisps)',
    ]);
  });

  it('excuses a pool capacity in the cap policy and nowhere else', () => {
    const cap = 'const SKULL_CAP = 120;\n';
    expect(strayLineConstantsIn(CAP_POLICY, cap)).toEqual([]);
    expect(strayLineConstantsIn('game/tuning.ts', cap)).toEqual([
      'game/tuning.ts declares SKULL_CAP (skullStream)',
    ]);
    expect(
      strayLineConstantsIn(CAP_POLICY, 'const BELL_CONE_ROWS = [];\n'),
    ).toEqual([`${CAP_POLICY} declares BELL_CONE_ROWS (bell)`]);
  });
});
