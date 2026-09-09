/**
 * The four fences a policy module's own prose rests on, all of them read off
 * the source text of the tree.
 *
 * Two keep a weapon line's rules inside the line's own module: a policy never
 * names a line, and a constant carrying a line's name is declared where that
 * line is. Together they are what makes the standing extensibility constraint
 * mechanical, so a fifth line stays one module plus its rows rather than an
 * edit spread across the sim.
 *
 * The third holds the offer's own claim. `isFirstOffer` reads the run's first
 * offer off the drops stream's cursor (offer.ts:84-97), which is sound only
 * while the offer is the one thing that moves that cursor. That sentence was a
 * comment and nothing else, so it is a walk now.
 *
 * The fourth is the same extensibility constraint read from the other side: no
 * weapon line walks the mob pool. A boss and a set piece stand on the field and
 * are not in that pool, so a line that walked it would go past them, and five
 * lines each carrying their own branch is exactly how a line learns that a boss
 * exists. They reach what they can hit through stormTargets.ts instead.
 *
 * They span src/game and src/dev, so they sit at the src root rather than
 * inside either of them.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { CONFIGURATION_NAMES } from '../dev/configurations';
import type { WeaponLine } from '../game/lines/roster';
import { WEAPON_LINES } from '../game/lines/roster';

const SRC = resolve(import.meta.dirname, '..');

/** A file's path under src, slash-normalized and carrying its extension. */
const modulePathOf = (file: string): string =>
  relative(SRC, file).split(/[/\\]/).join('/');

/**
 * Every fence here reads the source text rather than importing the module, and
 * that is the ruling this file rests on.
 *
 * Importing cannot see any of the three properties. A string literal inside a
 * function body, the name a constant is declared under, and which module holds
 * a line that draws are all gone by the time a module is a value: an import
 * shows what a module exports, and what these fences guard is what a module is
 * written to contain. A module could name every line in a private branch and
 * export nothing that says so.
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
 * The five modules that decide what a run may be offered and what a hand
 * reaches for. Each is a policy over the lines rather than a line, so naming
 * one is the failure this fence exists for.
 *
 * The harness's two join it because the hand walks to a body by distance and
 * entity id and a configuration is a hand rather than a weapon, so a fifth
 * line needs no edit in either.
 */
const POLICY_MODULES: readonly string[] = [
  'game/offer.ts',
  'game/carriers.ts',
  'dev/bot.ts',
  'dev/harnessPolicy.ts',
  'dev/configurations.ts',
];

/**
 * Every module that stands a fight or a set piece on the field. None of them
 * may name a weapon line: a boss takes damage from a DamageSource and never
 * asks which line landed it, and a set piece names the property it keeps and
 * never the build that meets it, so a fifth line needs no edit in either
 * (the standing extensibility constraint, path-draft.md:21).
 *
 * It is the fence read from the authored moment's side; the one above it reads
 * the same constraint from the line's side.
 */
const AUTHORED_MOMENT_MODULES: readonly string[] = [
  ...productionModulesUnder(join(SRC, 'game', 'bosses')),
  'game/stage/setPiece.ts',
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
  ].map((match) => {
    const name = match[1];
    if (name === undefined) {
      throw new Error('constant-declaration regex matched with no captured name');
    }
    return name;
  });

const carriesPrefixOf = (name: string, line: WeaponLine): boolean =>
  prefixesOf(line).some(
    (prefix) => name === prefix || name.startsWith(`${prefix}_`),
  );

/**
 * The one exception, and it is two names rather than a shape a name can wear.
 *
 * src/game/caps.ts owns the entity cap policy (caps.ts:1-15): a safety net is a
 * number far enough above the densest thing its pool can hold that reaching it
 * means something has gone wrong, read beside MOB_CAP and derived the same way,
 * rather than a rung of a line's ladder. The skulls' and the wisps' pools are
 * sized exactly that way (caps.ts:82-102), so a fifth line's safety net joins
 * them there and the recipe stays four registrations.
 *
 * The `_CAP` suffix is deliberately not what excuses a name, because a suffix
 * excuses any row a line dresses in it. TERRITORY_CAP wore one while deciding
 * how long a trail of claimed ground is, which caps.ts itself called a gameplay
 * rule and not a safety net; it is a Territory tuning row and it is declared in
 * lines/territory.ts now. A BELL_REACH_CAP written into caps.ts fails here.
 */
const CAP_POLICY = 'game/caps.ts';
const SAFETY_NET_CAPS: readonly string[] = ['SKULL_CAP', 'WISP_CAP'];

const isSafetyNetCapacity = (module: string, name: string): boolean =>
  module === CAP_POLICY && SAFETY_NET_CAPS.includes(name);

/** Where a constant carrying a line's name is declared outside that line's module. */
const strayLineConstantsIn = (module: string, source: string): string[] =>
  constantsDeclaredIn(source).flatMap((name) => {
    if (isSafetyNetCapacity(module, name)) return [];
    const claimed = WEAPON_LINES.filter(
      (line) =>
        module !== `game/lines/${line}.ts` && carriesPrefixOf(name, line),
    );
    return claimed.map((line) => `${module} declares ${name} (${line})`);
  });

/**
 * The sim: the modules isFirstOffer's "nothing else in the sim" is about, which
 * is src/game and not src/dev. A reading or the bot reading a cursor is outside
 * the shipped game, and neither may draw either, but the sentence the offer
 * rests on is about the sim's own modules.
 */
const simModulesUnder = (dir: string): string[] =>
  productionModulesUnder(dir).filter((module) => module.startsWith('game/'));

/**
 * The one module that may move the drops cursor. game/offer.ts draws the
 * options an offer holds, and isFirstOffer reads a cursor still at zero as a
 * run that has never opened one (offer.ts:84-97).
 */
const DROPS_DRAWER = 'game/offer.ts';

/**
 * Every reach into the drops stream a source makes, as written: the member
 * taken, in the dot spelling or the bracket one, a bare `streams.drops` where
 * the stream itself is taken, and a destructure that binds `drops` off a run's
 * streams.
 *
 * The destructure is in here because it is the one alias this walk could
 * otherwise not see at all. `const { drops } = state.streams` hands a module
 * the stream under a name no text match can follow, so the binding itself is
 * the failure rather than whatever it goes on to do.
 *
 * Two forms stay outside, and neither is claimed closed. A computed index is
 * one: witness.ts folds every stream's cursor through `run.streams[name].drawn`
 * (witness.ts:262), which no text match can tell from a draw, so the witness
 * guard covers that fold on its own. Aliasing the whole streams record is the
 * other.
 */
const DROPS_MEMBER =
  /streams\s*(?:\.\s*drops|\[\s*['"`]drops['"`]\s*\])(?:\s*\.\s*([A-Za-z_$][\w$]*))?/g;
const DROPS_BINDING = /\{[^{}]*\bdrops\b[^{}]*\}\s*=[^;\n]*\bstreams\b/g;

const dropsReachesIn = (source: string): string[] => [
  ...[...source.matchAll(DROPS_MEMBER)].map((match) =>
    match[1] === undefined ? 'streams.drops' : `streams.drops.${match[1]}`,
  ),
  ...[...source.matchAll(DROPS_BINDING)].map(
    () => 'streams.drops through a destructured binding',
  ),
];

/**
 * Where a module other than the offer could move the drops cursor.
 *
 * `.drawn` is excused everywhere, and it is the only member that is. It is a
 * getter over a counter, so a module reading it cannot advance the cursor
 * isFirstOffer reads: invariants.ts checks it is finite (invariants.ts:188) and
 * src/dev's digest folds it into a reading, and neither is a draw. Everything
 * else fails, the bare `streams.drops` of an alias included, because a stream
 * held in a local is a draw this walk can no longer see.
 */
const strayDropsReachesIn = (module: string, source: string): string[] => {
  if (module === DROPS_DRAWER) return [];
  return dropsReachesIn(source)
    .filter((reach) => reach !== 'streams.drops.drawn')
    .map((reach) => `${module} reaches ${reach}`);
};

/**
 * The five modules that carry a weapon line's own pass over what it can hit:
 * the four lines plus the belch, whose burst is a kill rule over the same
 * field. Each used to walk state.mobs for itself, and each reaches the seam
 * now.
 *
 * They are named here rather than swept off disk because the property is about
 * these five passes and not about every module in the tree: step.ts, mobs.ts,
 * invariants.ts and witness.ts all walk the pool and all should.
 */
const STORM_MODULES: readonly string[] = [
  'game/storm.ts',
  'game/belch.ts',
  'game/lines/bell.ts',
  'game/lines/territory.ts',
  'game/lines/wisps.ts',
];

// The one seam a storm module reaches its targets through.
const TARGET_SEAM = 'stormTargets';

/**
 * Every read of the run's mob pool a source makes, as written: the dot
 * spelling, the bracket one, and a destructure that binds `mobs` off a run.
 *
 * A boss and a set piece are not in that pool, so any one of these is a line
 * deciding for itself what the storm may hit, which is the decision this fence
 * moves to one place.
 */
const MOB_POOL_READ = /\.\s*mobs\b|\[\s*['"`]mobs['"`]\s*\]/g;
const MOB_POOL_BINDING = /\{[^{}]*\bmobs\b[^{}]*\}\s*=/g;

const mobPoolReachesIn = (source: string): string[] => [
  ...[...source.matchAll(MOB_POOL_READ)].map(() => 'the mob pool'),
  ...[...source.matchAll(MOB_POOL_BINDING)].map(
    () => 'the mob pool through a destructured binding',
  ),
];

const strayMobPoolReachesIn = (module: string, source: string): string[] =>
  mobPoolReachesIn(source).map((reach) => `${module} walks ${reach}`);

describe('no weapon line walks the mob pool', () => {
  for (const module of STORM_MODULES) {
    it(`src/${module} reaches what it can hit through the seam`, () => {
      const source = sourceOf(module);
      expect(strayMobPoolReachesIn(module, source)).toEqual([]);
      // And the other half: a module that reached nothing at all would pass
      // the walk above while having stopped hitting anything.
      expect(source).toContain(TARGET_SEAM);
    });
  }

  it('catches a walk planted in a line, and an alias that would hide one', () => {
    expect(
      strayMobPoolReachesIn(
        'game/storm.ts',
        'for (const mob of state.mobs) {}\n',
      ),
    ).toEqual(['game/storm.ts walks the mob pool']);
    expect(
      strayMobPoolReachesIn('game/storm.ts', "const pool = run['mobs'];\n"),
    ).toEqual(['game/storm.ts walks the mob pool']);
    expect(
      strayMobPoolReachesIn('game/belch.ts', 'const { mobs } = state;\n'),
    ).toEqual([
      'game/belch.ts walks the mob pool through a destructured binding',
    ]);
  });

  it('leaves the modules that own the pool alone, because they should walk it', () => {
    // The fence is about a weapon line deciding what it may hit, not about the
    // pool being private. The tick, the mob table and the harness all walk it,
    // and a fence that swept the whole tree would forbid the sim from running.
    const owners = ['game/step.ts', 'game/mobs.ts', 'game/invariants.ts'];
    for (const module of owners) {
      expect(mobPoolReachesIn(sourceOf(module)).length, module).toBeGreaterThan(
        0,
      );
      expect(STORM_MODULES).not.toContain(module);
    }
  });

  it('holds every line in the pool, so a fifth cannot arrive outside the fence', () => {
    // The line list comes from the roster rather than from the five modules
    // named above, so a fifth line is inside this fence from its first commit
    // whether or not anybody remembered to add it to STORM_MODULES.
    //
    // The skull stream is why the two lists are not one: its targeting lives in
    // storm.ts, which is named above, so its own module walks nothing and has
    // nothing to reach the seam for. What binds every line is this, that no
    // line's module walks the pool at all.
    for (const line of WEAPON_LINES) {
      expect(mobPoolReachesIn(sourceOf(`game/lines/${line}.ts`)), line).toEqual(
        [],
      );
    }
  });
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

  it('names no configuration after a weapon line', () => {
    // A configuration name is written into a tape header, so a name that was
    // also a line's could be read back as a line by anything reading the
    // bytes. The two sets are kept disjoint here rather than by anyone
    // remembering it when the other eight rows land.
    // Both sets are read as plain names rather than as their unions, because a
    // union comparison is a typecheck the day the two sets happen not to
    // overlap and no check at all the day one of them grows.
    const lines: readonly string[] = WEAPON_LINES;
    const named = CONFIGURATION_NAMES.filter((name) => lines.includes(name));
    expect(named).toEqual([]);
  });

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

describe('no boss and no set piece names a weapon line', () => {
  for (const module of AUTHORED_MOMENT_MODULES) {
    it(`src/${module} names no weapon line`, () => {
      // The list comes from the roster and the folder rather than from names
      // written here, so a fifth line and a second set piece both join this
      // fence the moment they arrive.
      const source = sourceOf(module);
      expect(WEAPON_LINES.filter((line) => quotesName(source, line))).toEqual(
        [],
      );
    });
  }

  it('holds every boss module in the sweep, so one cannot arrive outside it', () => {
    // The boss half is read off the folder and the set piece is named, which is
    // the pair the constraint covers: a boss added as a file is fenced without
    // an edit here, and the one set piece module is spelled out because it is
    // the only file of its kind.
    expect(AUTHORED_MOMENT_MODULES.length).toBeGreaterThan(3);
    expect(AUTHORED_MOMENT_MODULES).toContain('game/stage/setPiece.ts');
    for (const module of AUTHORED_MOMENT_MODULES) {
      expect(`${module} ${sourceOf(module).length > 0}`).toBe(`${module} true`);
    }
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

  it('excuses a safety net in the cap policy and nowhere else', () => {
    const cap = 'const SKULL_CAP = 120;\n';
    expect(strayLineConstantsIn(CAP_POLICY, cap)).toEqual([]);
    expect(strayLineConstantsIn('game/tuning.ts', cap)).toEqual([
      'game/tuning.ts declares SKULL_CAP (skullStream)',
    ]);
    expect(
      strayLineConstantsIn(CAP_POLICY, 'const BELL_CONE_ROWS = [];\n'),
    ).toEqual([`${CAP_POLICY} declares BELL_CONE_ROWS (bell)`]);
  });

  it('fails a row that only wears the cap suffix, inside the cap policy too', () => {
    // The half the suffix form could not hold. A line's tuning row named _CAP
    // is still a line's tuning row, and caps.ts is not where it lives.
    expect(
      strayLineConstantsIn(CAP_POLICY, 'const BELL_REACH_CAP = 90;\n'),
    ).toEqual([`${CAP_POLICY} declares BELL_REACH_CAP (bell)`]);
  });

  it('excuses only names the cap policy really declares', () => {
    // The exception is a list of names, so a safety net renamed or moved out
    // would leave the list excusing nothing and the fence reading green while
    // holding a name that is no longer there.
    const declared = constantsDeclaredIn(sourceOf(CAP_POLICY));
    for (const name of SAFETY_NET_CAPS) expect(declared, name).toContain(name);
  });
});

describe('only the offer draws from the drops stream', () => {
  it('no module in the sim outside the offer reaches that stream to draw', () => {
    const modules = simModulesUnder(SRC);
    expect(modules).toContain(DROPS_DRAWER);
    expect(
      modules.flatMap((module) =>
        strayDropsReachesIn(module, sourceOf(module)),
      ),
    ).toEqual([]);
  });

  it('the offer still draws, so the fence guards a claim and not an empty set', () => {
    // isFirstOffer's whole reading is that a cursor at zero means no offer has
    // opened yet. A drawer that stopped drawing would leave the cursor at zero
    // for a whole run, and the walk above would stay green straight through it.
    expect(dropsReachesIn(sourceOf(DROPS_DRAWER))).toContain(
      'streams.drops.nextInt',
    );
  });

  it('catches a draw planted outside the offer, and an alias that would hide one', () => {
    expect(
      strayDropsReachesIn('game/storm.ts', 'state.streams.drops.next();\n'),
    ).toEqual(['game/storm.ts reaches streams.drops.next']);
    expect(
      strayDropsReachesIn(
        'game/storm.ts',
        'const roll = state.streams.drops;\n',
      ),
    ).toEqual(['game/storm.ts reaches streams.drops']);
    expect(
      strayDropsReachesIn(DROPS_DRAWER, 'state.streams.drops.next();\n'),
    ).toEqual([]);
  });

  it('catches the bracket spelling and a destructured binding, not the dot form alone', () => {
    // Both are the same draw written another way, and a fence that only knew
    // `streams.drops.next` would read green through either.
    expect(
      strayDropsReachesIn('game/storm.ts', "state.streams['drops'].next();\n"),
    ).toEqual(['game/storm.ts reaches streams.drops.next']);
    expect(
      strayDropsReachesIn(
        'game/storm.ts',
        'const { drops } = state.streams;\n',
      ),
    ).toEqual([
      'game/storm.ts reaches streams.drops through a destructured binding',
    ]);
  });

  it('reads the run state builder as a literal and not as a binding', () => {
    // run.ts writes the streams record as `{ ..., drops: stream(seed, 'drops'),
    // ... }`, which names drops inside braces without binding it off anything.
    // A binding matcher that could not tell those apart would fail the module
    // that creates the stream in the first place.
    expect(
      strayDropsReachesIn(
        'game/run.ts',
        "streams: {\n  spawns: stream(seed, 'spawns'),\n  drops: stream(seed, 'drops'),\n},\n",
      ),
    ).toEqual([]);
  });

  it('leaves a cursor read alone, because reading a counter cannot move it', () => {
    expect(
      strayDropsReachesIn(
        'game/invariants.ts',
        "checkFinite(faults, 'streams.drops.drawn', state.streams.drops.drawn);\n",
      ),
    ).toEqual([]);
  });
});
