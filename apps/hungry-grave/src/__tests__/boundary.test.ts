/**
 * The import fences over the whole tree: the rendering-import boundary, the
 * test-span fence that holds a test file inside the folder it covers, and the
 * cycle guard over the core's own value imports.
 *
 * The rendering boundary (tracer plan verification step 3) is written as an
 * allowlist rather than a denylist. A denylist only catches a direct import of
 * pixi; the leak that actually happens is transitive, through a shared util
 * that looks sim-shaped today and pulls rendering in behind the boundary after
 * a later edit. An allowlist closes that case by induction.
 *
 * The span fence holds the placement rule: a test sits in the test folder of
 * the lowest folder that contains everything it spans. Which roots may reach
 * which is the rendering boundary's ruling and not the span fence's, so a reach
 * into another top-level root is left to the rows above.
 *
 * The cycle guard is the third: no module in the core may sit in a group of
 * modules that all reach each other through their value imports.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = resolve(import.meta.dirname, '..');

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
  // The golden digest's scenario lives in src/dev because the #/digest screen
  // runs it too, and the test that pins its constant is src/game/digest.test.ts.
  // Test files under src/game may therefore reach src/dev, for the same reason
  // TEST_PACKAGES exists below: a test file is not shipped, and the rule is
  // there to keep the rig out of the build rather than out of the tests.
  //
  // Shipped code under src/game still reaches only src/game, and that is why
  // the ADR 0013 invariant harness moved into src/game: advance() calls it
  // inside its own tick loop, and advance() is shipped.
  { root: 'game', mayReach: ['game'], mayReachInTests: ['dev'], mayImport: [] },
  {
    root: 'input',
    mayReach: ['input', 'game'],
    mayReachInTests: [],
    mayImport: [],
  },
  // The headless bot is the full-run test's player and the dev-only autopilot
  // both (ADR 0013), so src/app consumes it while it stays headless itself.
  //
  // It reaches src/tape because measure consumes the playback primitive and
  // the decoded artifact (#58 slice 4). The widening is one-way: src/tape's own
  // row below still reaches only tape and game, so the rig cannot become
  // load-bearing in a shipped recording.
  {
    root: 'dev',
    mayReach: ['dev', 'game', 'tape'],
    mayReachInTests: [],
    mayImport: [],
  },
  /**
   * The tape: what a run is recorded onto, and the verification readback that
   * proves a tape decodes and reproduces (ADR 0018, ADR 0033).
   *
   * The root is deliberately not named replay. A module called src/replay
   * holding only readback invites exactly the inference ADR 0033 exists to
   * prevent, that replay already exists because primitives for reading a tape
   * back do. Readback discharges no part of the player-facing replay obligation.
   *
   * It reaches src/game because it reproduces a run through the one execution
   * authority, and it reaches nothing else. Not src/dev, because the rig must
   * not be load-bearing in a shipped recording; not src/app, because a recorder
   * that could reach a screen would put rendering behind this boundary; and no
   * package at all, because the sim's dependency-free rule is what lets a
   * headless test run a tape.
   */
  {
    root: 'tape',
    mayReach: ['tape', 'game'],
    mayReachInTests: [],
    mayImport: [],
  },
  /**
   * Sound subscribes to the event list and must never reach back into the sim's
   * internals. One file, one rule, one mechanism, rather than a comment asking
   * nicely: src/app/sound.ts was governed by nothing at all, which dispatch 4
   * named as a tripwire.
   *
   * The event list is the whole of its reach. Where a clip comes out arrives as
   * an argument, so the module names no engine and no audio class at all; the
   * package entry stays because priming the audio context is a dynamic import
   * of @pixi/sound and nothing else can do it.
   */
  {
    root: 'app',
    only: ['sound.ts'],
    mayReach: ['game/events'],
    mayReachInTests: [],
    mayImport: ['@pixi/sound'],
  },
  /**
   * The widget set: buttons, labels, sliders, boxes. A widget that reaches into
   * the app is a widget that cannot be reused or tested on its own, and Button
   * reaching src/app/getEngine for a hover chime is the instance that proved
   * it: two lines of sound made the whole folder need a booted engine.
   *
   * Its reach is the folder itself, because widgets are built out of each other
   * (a button holds a label, a slider holds a label). Everything else a widget
   * needs arrives as a prop from whoever builds it.
   */
  {
    root: 'app/ui',
    mayReach: ['app/ui'],
    mayReachInTests: [],
    mayImport: ['pixi.js', '@pixi/ui'],
  },
];

// Packages any test file may import, whatever side of a boundary it is on.
const TEST_PACKAGES = ['vitest'];

function typescriptFilesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return typescriptFilesUnder(path);
    return name.endsWith('.ts') ? [path] : [];
  });
}

/**
 * The specifiers a file imports, static and dynamic alike.
 *
 * The keyword has to stand on its own: `Texture.from('rounded-rectangle.png')`
 * is a method call and an asset name, not an import, and every fence in this
 * file reads through here. src/app/ui is where that first mattered, because a
 * widget names its own artwork that way.
 */
function importsOf(source: string): string[] {
  const matches = source.matchAll(
    /(?<![.\w$])(?:from|import)\s*\(?\s*["']([^"']+)["']/g,
  );
  return [...matches].map((match) => match[1]);
}

/** A module's own path under src, slash-normalized and without its extension. */
function modulePathOf(file: string): string {
  return relative(SRC, file).split(/[/\\]/).join('/').replace(/\.ts$/, '');
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
  return modulePathOf(resolve(dirname(file), specifier));
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
  return file.endsWith('.test.ts');
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
    const allowed = specifier.startsWith('.')
      ? foldersAllowedIn(file, boundary).some((entry) =>
          covers(entry, pathReachedBy(file, specifier)),
        )
      : packagesAllowedIn(file, boundary).includes(specifier);
    return allowed ? [] : [`${where} imports ${specifier}`];
  });
}

function violationsIn(file: string, boundary: Boundary): string[] {
  return violationsInSource(file, readFileSync(file, 'utf8'), boundary);
}

/** The files a boundary governs: its whole folder, or only the ones it names. */
function filesGovernedBy(root: string, boundary: Boundary): string[] {
  if (boundary.only === undefined) return typescriptFilesUnder(root);
  return boundary.only.map((name) => join(root, name));
}

describe('the rendering-import boundary', () => {
  for (const boundary of BOUNDARIES) {
    const root = join(SRC, boundary.root);
    const reach = boundary.mayReach
      .map((folder) => `src/${folder}`)
      .join(' and ');
    const governed = boundary.only
      ? boundary.only
          .map((name) => `src/${boundary.root}/${name}`)
          .join(' and ')
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

  it('the only field governs one file rather than a whole folder', () => {
    // Asserted the way the mayReachInTests case is: a hand-written source
    // string for both the allowed and the forbidden import, with no file
    // behind either.
    const sound = BOUNDARIES.find((boundary) => boundary.only !== undefined)!;
    expect(sound.only).toEqual(['sound.ts']);

    const allowed = violationsInSource(
      join(SRC, 'app', 'sound.ts'),
      'import type { SimEvent } from "../game/events";',
      sound,
    );
    expect(allowed).toEqual([]);

    const forbidden = violationsInSource(
      join(SRC, 'app', 'sound.ts'),
      'import { damageMob } from "../game/mobs";',
      sound,
    );
    expect(forbidden).toHaveLength(1);
    expect(forbidden[0]).toContain('../game/mobs');
  });

  it('narrows the target too, so reaching game/events does not open the whole sim', () => {
    // Without the path-level match, mayReach: ["game/events"] would resolve to
    // the top-level folder "game" and permit every module in it, which is the
    // exact thing the sound rule exists to forbid. This is the assertion that
    // makes the rule a rule.
    const sound = BOUNDARIES.find((boundary) => boundary.only !== undefined)!;
    const file = join(SRC, 'app', 'sound.ts');
    expect(pathReachedBy(file, '../game/events')).toBe('game/events');
    expect(pathReachedBy(file, '../game/mobs')).toBe('game/mobs');
    expect(covers('game/events', 'game/mobs')).toBe(false);
    expect(sound.mayReach.some((entry) => covers(entry, 'game/mobs'))).toBe(
      false,
    );
  });

  it('counts an import and not a method that happens to be called from', () => {
    // src/app/ui names its own artwork with Texture.from('...'), and a fence
    // that read those as imports could only go green by calling a png an
    // allowed package, which would be a lie about what the folder depends on.
    expect(importsOf("import { Container } from 'pixi.js';")).toEqual([
      'pixi.js',
    ]);
    expect(importsOf("const mod = await import('./thing');")).toEqual([
      './thing',
    ]);
    expect(
      importsOf("texture: Texture.from('rounded-rectangle.png'),"),
    ).toEqual([]);
  });

  it('keeps the existing folder-level entries matching, so game still reaches game/mobs', () => {
    const game = BOUNDARIES.find((boundary) => boundary.root === 'game')!;
    expect(game.mayReach).toEqual(['game']);
    expect(covers('game', 'game/mobs')).toBe(true);
    expect(covers('game', 'game/lines/soulStream')).toBe(true);
    expect(covers('game', 'gamepad/thing')).toBe(false);
  });

  it('the src/dev allowance under src/game is for test files alone', () => {
    const game = BOUNDARIES.find((boundary) => boundary.root === 'game')!;
    const source = 'import { GOLDEN } from "../dev/digest";';

    const shipped = violationsInSource(
      join(SRC, 'game', 'sim.ts'),
      source,
      game,
    );
    expect(shipped).toHaveLength(1);
    expect(shipped[0]).toContain('../dev/digest');

    const test = violationsInSource(
      join(SRC, 'game', 'sim.test.ts'),
      source,
      game,
    );
    expect(test).toEqual([]);
  });
});

/**
 * The same-root allowances: where a test may reach a sibling under its own top
 * level without the fence calling it a subject. Each one carries its reason,
 * because a blanket is the thing that makes this fence stop meaning anything.
 */
const SAME_ROOT_ALLOWANCES: Record<string, string[]> = {
  // The core is one module. A line's test or a stage's test builds a run, a
  // field and a stage to test against, and those are fixtures rather than
  // subjects. Forcing game/lines/__tests__/bell.test.ts up to src/game/__tests__
  // because it needs a run would put every sim test in one folder and say
  // nothing about what each one covers.
  game: ['game'],
  // The same reason, for the framework adapter:
  // engine/navigation/__tests__/navigation.test.ts names the engine type it is
  // handed.
  engine: ['engine'],
  // app deliberately gets no blanket, and the asymmetry with game is the point.
  // src/app is a shell of independent screens, so a screen test reaching
  // another screen is exactly the smell this fence exists for. Only the
  // measured design values are shared: a renderer test that reads a palette
  // colour is spanned by the renderer, not by the palette.
  app: ['app/palette', 'app/layout'],
};

/**
 * Prototype tests are outside this fence. A prototype is never reused and its
 * tests exist only so the building agent could verify its own bounded task
 * (docs/agents/feature-playbook.md), so ticket #59 leaves them where they sit
 * and the walk below must not reach them.
 */
const OUTSIDE_THE_SPAN_FENCE = join(SRC, 'prototypes');

/**
 * The folder a test file is the test folder of, relative to src: the folder its
 * __tests__ sits in. A test file directly under src/__tests__ answers with the
 * empty string, which is src itself, and that is what lets a cross-cutting
 * guard reach the whole tree.
 */
const subjectFolderOf = (file: string): string => {
  const segments = relative(SRC, dirname(file))
    .split(/[/\\]/)
    .filter((segment) => segment !== '');
  if (segments.at(-1) === '__tests__') segments.pop();
  return segments.join('/');
};

/** The top-level folder under src a path sits in. */
const rootOf = (path: string): string => path.split('/')[0];

/**
 * Whether a reached path sits inside the subject's own subtree. Every path
 * under src sits inside the src-root subject, which has no folder name.
 */
const insideSubtreeOf = (subject: string, path: string): boolean =>
  subject === '' || covers(subject, path);

const allowedWithinRootOf = (subject: string, path: string): boolean =>
  (SAME_ROOT_ALLOWANCES[rootOf(subject)] ?? []).some((entry) =>
    covers(entry, path),
  );

/**
 * The span rule, over source text rather than over the disk, so a case with no
 * file behind it can be handed straight to it, the same way the rendering rule
 * above is written.
 */
const spanViolationsInSource = (file: string, source: string): string[] => {
  const subject = subjectFolderOf(file);
  const where = relative(SRC, file).split(/[/\\]/).join('/');
  return importsOf(source)
    .filter((specifier) => specifier.startsWith('.'))
    .flatMap((specifier) => {
      const reached = pathReachedBy(file, specifier);
      const allowed =
        insideSubtreeOf(subject, reached) ||
        rootOf(reached) !== rootOf(subject) ||
        allowedWithinRootOf(subject, reached);
      return allowed ? [] : [`${where} imports ${specifier}`];
    });
};

const spanViolationsIn = (file: string): string[] =>
  spanViolationsInSource(file, readFileSync(file, 'utf8'));

const testFilesUnder = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (path === OUTSIDE_THE_SPAN_FENCE) return [];
    if (statSync(path).isDirectory()) return testFilesUnder(path);
    return isTest(path) ? [path] : [];
  });

describe('the test-span fence', () => {
  it("every test file imports only from inside its parent folder's subtree", () => {
    const files = testFilesUnder(SRC);
    expect(files.length).toBeGreaterThan(0);
    expect(files.flatMap(spanViolationsIn)).toEqual([]);
  });

  it('a test placed below what it spans is caught', () => {
    // The case that makes the fence a rule rather than a decoration: a test
    // under app/screens/game reaching app/tapeExport spans app, so app is where
    // it belongs. Handed a source string with no file behind it, the way the
    // only-field case above is.
    const violations = spanViolationsInSource(
      join(SRC, 'app', 'screens', 'game', '__tests__', 'x.test.ts'),
      "import { exportTape } from '../../../tapeExport';",
    );
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('../../../tapeExport');
  });

  it('a test reaching a lower layer is a fixture reach and passes', () => {
    // Subject decides span, not fixture. A tape test builds a run to record; the
    // run is what it records against, never what it covers, so reaching down a
    // layer for something to test with does not move where the test belongs.
    expect(
      spanViolationsInSource(
        join(SRC, 'tape', '__tests__', 'x.test.ts'),
        "import { createRun } from '../../game/run';",
      ),
    ).toEqual([]);
  });

  it("the sim is one module, so a line's test may build a run", () => {
    // The core is one module, so game is allowed as a whole root. A line's test
    // builds a run, a field and a stage to test against; forcing every sim test
    // that needs one up into src/game/__tests__ would put them all in one folder
    // and say nothing about what each one covers.
    expect(
      spanViolationsInSource(
        join(SRC, 'game', 'lines', '__tests__', 'x.test.ts'),
        "import { createRun } from '../../run';",
      ),
    ).toEqual([]);
  });

  it('the app allowance is palette and layout, not every screen', () => {
    // The asymmetry with game is the point. src/app is a shell of independent
    // screens, so it gets no blanket: a screen test reaching another screen is
    // exactly the smell this fence exists for. The measured design values are
    // the written exception, because a renderer test that reads a palette colour
    // is spanned by the renderer rather than by the palette.
    const file = join(SRC, 'app', 'screens', 'game', '__tests__', 'x.test.ts');
    expect(
      spanViolationsInSource(file, "import { FIELD } from '../../../palette';"),
    ).toEqual([]);
    const forbidden = spanViolationsInSource(
      file,
      "import { DigestScreen } from '../../DigestScreen';",
    );
    expect(forbidden).toHaveLength(1);
    expect(forbidden[0]).toContain('../../DigestScreen');
  });
});

/**
 * A screen module: one screen or popup class, and a place the app can navigate
 * to. Recognised by the file's own name rather than listed, so a new screen
 * joins the fence by existing.
 */
const isScreenModule = (path: string): boolean =>
  /(Screen|Popup)$/.test(path.split('/').at(-1) ?? '');

/**
 * Every screen a file under src/app names. src/main.ts is outside src/app and
 * is therefore the one module left that may name one, which is what makes it
 * the single declaration of the screen graph.
 */
const screensReachedInSource = (file: string, source: string): string[] => {
  const where = relative(SRC, file).split(/[/\\]/).join('/');
  return importsOf(source)
    .filter((specifier) => specifier.startsWith('.'))
    .filter((specifier) => isScreenModule(pathReachedBy(file, specifier)))
    .map((specifier) => `${where} imports ${specifier}`);
};

const screensReachedIn = (file: string): string[] =>
  screensReachedInSource(file, readFileSync(file, 'utf8'));

describe('the screen graph is declared in one place', () => {
  it('no screen imports another screen', () => {
    // The durable form of the rule that powers arrive as props: a screen that
    // names another screen is a hop declared inside a component instead of by
    // the driver, and it comes back the moment somebody finds it convenient.
    // Test files are outside the rule; they construct screens to test them.
    const files = typescriptFilesUnder(join(SRC, 'app')).filter(
      (file) => !isTest(file),
    );
    expect(files.length).toBeGreaterThan(0);
    expect(files.flatMap(screensReachedIn)).toEqual([]);
  });

  it('catches one screen reaching for another', () => {
    // Handed a source string with no file behind it, the way the fences above
    // are, and it is the exact import the title screen used to carry.
    const violations = screensReachedInSource(
      join(SRC, 'app', 'screens', 'TitleScreen.ts'),
      "import { GameScreen } from './game/GameScreen';",
    );
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('./game/GameScreen');
  });

  it('leaves a screen free to reach anything that is not a screen', () => {
    expect(
      screensReachedInSource(
        join(SRC, 'app', 'screens', 'TitleScreen.ts'),
        "import { primeSound } from '../sound';",
      ),
    ).toEqual([]);
  });
});

/** The module the engine instance is set on and read back from. */
const ENGINE_ACCESSOR = 'app/getEngine';

/**
 * The names one import statement binds, read off the braces that name them.
 * The module alone cannot settle this rule: setEngine and engine live in the
 * same file and only one of them is forbidden here.
 */
const namesBoundFrom = (source: string, specifier: string): string[] => {
  const quoted = specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const statement = new RegExp(
    `import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${quoted}['"]`,
    'g',
  );
  return [...source.matchAll(statement)].flatMap((match) =>
    match[1].split(',').map((name) =>
      name
        .trim()
        .split(/\s+as\s+/)[0]
        .trim(),
    ),
  );
};

/** Every reach for the engine accessor a file makes, by the name it took. */
const accessorReachedInSource = (file: string, source: string): string[] => {
  const where = relative(SRC, file).split(/[/\\]/).join('/');
  return importsOf(source)
    .filter((specifier) => specifier.startsWith('.'))
    .filter((specifier) => pathReachedBy(file, specifier) === ENGINE_ACCESSOR)
    .flatMap((specifier) => namesBoundFrom(source, specifier))
    .filter((name) => name === 'engine')
    .map((name) => `${where} imports ${name}`);
};

const accessorReachedIn = (file: string): string[] =>
  accessorReachedInSource(file, readFileSync(file, 'utf8'));

describe('the engine accessor is out of the app', () => {
  it('no module under src/app reaches for engine()', () => {
    // Every power a screen, a popup or a widget needs arrives as a prop from
    // src/main.ts, which is the only place that knows the engine. The accessor
    // itself survives for src/prototypes alone, and this is what keeps it from
    // coming back through the shell.
    const files = typescriptFilesUnder(join(SRC, 'app'));
    expect(files.length).toBeGreaterThan(0);
    expect(files.flatMap(accessorReachedIn)).toEqual([]);
  });

  it('catches a widget reaching for the accessor again', () => {
    // The exact import src/app/ui/Button.ts carried, for the two lines of
    // hover and press sound that made a widget need a booted engine.
    const violations = accessorReachedInSource(
      join(SRC, 'app', 'ui', 'Button.ts'),
      "import { engine } from '../getEngine';",
    );
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('engine');
  });

  it('says nothing about setEngine, which the boot has to call', () => {
    // The rule is about the name and not about the module: src/main.ts sets the
    // instance at boot, and that is the one call that should exist.
    expect(
      accessorReachedInSource(
        join(SRC, 'app', 'ui', 'Button.ts'),
        "import { setEngine } from '../getEngine';",
      ),
    ).toEqual([]);
  });
});

/** The core: the dependency-free module every other root is allowed to reach. */
const CORE = join(SRC, 'game');

/**
 * The value cycles the core still carries, each with the reason it is open. The
 * guard is a ratchet, so a cycle not written here is a failure, and the core
 * carries none: this list is empty and adding to it is the thing to argue
 * about rather than the thing to reach for.
 */
const KNOWN_CORE_CYCLES: string[] = [];

/**
 * A module's value imports: everything left after the type-only statements are
 * struck out.
 *
 * Type-only imports are left out deliberately, and the exclusion is what makes
 * this guard mean something. They are erased before anything runs, and the core
 * carries them in both directions by design: RunState aggregates every pool and
 * every pool names RunState back, so a graph counting them says every module in
 * the sim is one cycle. The cycle that can bite is the one that survives
 * erasure, because every module exports const arrow functions and a value cycle
 * can hand a caller a binding still inside its temporal dead zone.
 */
const valueImportsOf = (source: string): string[] =>
  importsOf(
    source.replace(/(?:^|\n)\s*(?:import|export)\s+type\s[^;]*;/g, '\n'),
  );

/** Every module a core file reaches at runtime, by path under src. */
const coreImportsIn = (file: string): string[] =>
  valueImportsOf(readFileSync(file, 'utf8'))
    .filter((specifier) => specifier.startsWith('.'))
    .map((specifier) => pathReachedBy(file, specifier));

/** The core's value-import graph. Test files are left out: nothing imports one. */
const coreValueGraph = (): Map<string, string[]> =>
  new Map(
    typescriptFilesUnder(CORE)
      .filter((file) => !isTest(file))
      .map((file) => [modulePathOf(file), coreImportsIn(file)]),
  );

/** Every module reachable from one module by following value imports. */
const reachedFrom = (
  graph: Map<string, string[]>,
  start: string,
): Set<string> => {
  const seen = new Set<string>();
  const frontier = [...(graph.get(start) ?? [])];
  while (frontier.length > 0) {
    const next = frontier.pop()!;
    if (seen.has(next)) continue;
    seen.add(next);
    frontier.push(...(graph.get(next) ?? []));
  }
  return seen;
};

/**
 * Every group of modules that can all reach each other, named by its members
 * rather than by one path through it. A cycle then reads the same way whichever
 * module the walk happened to enter it from, which is what lets the known list
 * above be written once and stay written.
 */
const cyclesIn = (graph: Map<string, string[]>): string[] => {
  const cycles = new Set<string>();
  for (const module of graph.keys()) {
    if (!reachedFrom(graph, module).has(module)) continue;
    const together = [...reachedFrom(graph, module)].filter((other) =>
      reachedFrom(graph, other).has(module),
    );
    cycles.add([...new Set([module, ...together])].sort().join(' and '));
  }
  return [...cycles].sort();
};

describe('the core has no import cycle', () => {
  it('carries no value-import cycle beyond the ones written down', () => {
    expect(cyclesIn(coreValueGraph())).toEqual(KNOWN_CORE_CYCLES);
  });

  it('catches a cycle, so the walk is a rule rather than a decoration', () => {
    // Handed a graph with no files behind it, the way the two fences above are
    // handed source strings with no files behind them.
    const cyclic = new Map([
      ['game/a', ['game/b']],
      ['game/b', ['game/a']],
    ]);
    expect(cyclesIn(cyclic)).toEqual(['game/a and game/b']);

    const acyclic = new Map([
      ['game/a', ['game/b']],
      ['game/b', []],
    ]);
    expect(cyclesIn(acyclic)).toEqual([]);
  });

  it('does not count a type-only import, because it is erased before anything runs', () => {
    const source = [
      "import type { RunState } from './run';",
      "import { spawnCorpse } from './corpses';",
      "import type {\n  Mob,\n} from './mobs';",
    ].join('\n');
    expect(valueImportsOf(source)).toEqual(['./corpses']);
  });
});
