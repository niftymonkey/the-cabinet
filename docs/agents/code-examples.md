# Coding rule examples

The pinned evidence for the rules in `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`. Each entry carries one rule's specimen, its chosen form as real code, and its rejected forms. Read a rule's entry when the rule alone leaves the path forward unclear.

## Rule 1: entry-point shape (verified by Mark 2026-08-19, specimen `apps/hungry-grave/src/main.ts`)

The verified specimen, in full:

```ts
import { setEngine } from "./app/getEngine";
import { resolveRoute } from "./app/routes";
import { createFpsMeter } from "./app/FpsMeter";
import { FpsSampler } from "./app/FpsSampler";
import { LoadScreen } from "./app/screens/LoadScreen";
import { PrototypesScreen } from "./app/screens/PrototypesScreen";
import { TitleScreen } from "./app/screens/TitleScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";

/**
 * Importing these modules will automatically register their plugins with the engine.
 */
import "@pixi/sound";

const initEngine = async (): Promise<CreationEngine> => {
  const engine = new CreationEngine();
  setEngine(engine);
  await engine.init({
    background: "#0e1119",
    // 540x760 is the sim's field in units, never device pixels (ADR 0003).
    resizeOptions: { minWidth: 540, minHeight: 760, letterbox: false },
  });
  return engine;
};

/**
 * Puts the frame-rate readout on the stage, above every screen. Navigation
 * adds its own container to the stage lazily, when the first screen is shown
 * (src/engine/navigation/navigation.ts), so a meter added earlier would end up
 * underneath it. zIndex settles the order by rule instead of by who was added
 * first, and holds however the screens are later reshuffled.
 */
const attachFpsMeter = (engine: CreationEngine): void => {
  const meter = createFpsMeter();
  meter.view.zIndex = 1;
  engine.stage.sortableChildren = true;
  engine.stage.addChild(meter.view);

  const sampler = new FpsSampler();
  let shown: number | null = null;
  engine.ticker.add((ticker) => {
    const reading = sampler.sample(ticker.elapsedMS);
    if (reading === null || reading === shown) return;
    shown = reading;
    meter.render(reading);
  });
};

const resolveScreen = async (hash: string) => {
  const route = resolveRoute(hash);
  if (route.kind === "prototype") return await route.entry.load();
  if (route.kind === "prototype-list") return PrototypesScreen;
  return TitleScreen;
};

/**
 * Answers every navigation the URL fragment can produce: boot, in-app hash
 * writes, and the browser's back and forward buttons alike. The fragment is
 * the single navigation authority between the game and the prototypes, and
 * buttons only assign location.hash; screens inside the game navigate directly
 * and never touch it. Routes are chained so two showScreen calls can never
 * interleave, and a route whose hash went stale while its module loaded steps
 * aside.
 */
const startRouter = (engine: CreationEngine): Promise<void> => {
  let pending: Promise<void> = Promise.resolve();
  const route = async () => {
    const hash = window.location.hash;
    const screen = await resolveScreen(hash);
    if (window.location.hash !== hash) return;
    await engine.navigation.showScreen(screen);
  };
  const queueRoute = () => {
    pending = pending.then(route).catch((error) => console.error(error));
  };
  window.addEventListener("hashchange", queueRoute);
  queueRoute();
  return pending;
};

const main = async (): Promise<void> => {
  const engine = await initEngine();
  userSettings.init();
  attachFpsMeter(engine);
  // The load screen holds the stage while the router resolves the first route.
  await engine.navigation.showScreen(LoadScreen);
  await startRouter(engine);
};

main().catch((error) => console.error(error));
```

## Rule 2: dumb display components (verified by Mark 2026-08-24, specimen `apps/hungry-grave/src/app/FpsMeter.ts` rewritten side by side)

Rejected side by side: the class extending a framework container that owns its own ticker subscription and sampling. The production `FpsMeter.ts` predates this rule and does not yet follow it.

The verified example, both halves:

```ts
// FpsMeter.ts: dumb view. No sampler, no ticker, no decisions.
interface FpsMeter {
  readonly view: Container;
  render(fps: number): void;
}

const createFpsMeter = (): FpsMeter => {
  const view = new Container();
  const readout = new Label({
    // Monospace so the number holds its width as the digits change.
    style: {
      fontFamily: "monospace",
      fill: PALETTE.hudDim.hex,
      fontSize: METER_FONT_SIZE,
    },
  });
  readout.anchor.set(0, 0);
  const line = meterLinePosition(0);
  readout.position.set(line.x, line.y);
  view.addChild(readout);
  return {
    view,
    render(fps) {
      readout.text = `${fps} FPS`;
    },
  };
};

export { createFpsMeter };
export type { FpsMeter };
```

```ts
// main.ts: the driver owns the data, the diffing, and the loop.
const attachFpsMeter = (engine: CreationEngine): void => {
  const meter = createFpsMeter();
  meter.view.zIndex = 1;
  engine.stage.sortableChildren = true;
  engine.stage.addChild(meter.view);

  const sampler = new FpsSampler();
  let shown: number | null = null;
  engine.ticker.add((ticker) => {
    const reading = sampler.sample(ticker.elapsedMS);
    if (reading === null || reading === shown) return;
    shown = reading;
    meter.render(reading);
  });
};
```

## Rule 3: powers arrive as props, intents go out (verified by Mark 2026-08-24, specimen `apps/hungry-grave/src/app/screens/TitleScreen.ts` `rise()` rewritten side by side)

Rejected side by side: the module-level singleton accessor, pinned against the `engine()` accessor in `src/app/getEngine.ts` with its 23 call sites.

Recorded consequence: navigation must accept screen factories instead of zero-argument constructors, and the screen pool contract changes to match.

The verified example:

```ts
// TitleScreen.ts: knows nothing about navigation or GameScreen at all.
constructor(private readonly props: { onRise(): void }) {
  ...
}

private rise(): void {
  primeSound();
  this.props.onRise();
}
```

```ts
// main.ts: the router owns the screen graph.
const titleScreen = () =>
  new TitleScreen({
    onRise: () => show(gameScreen),
  });
```

## Rule 4: no import-time side effects (verified by Mark 2026-08-24, specimen `apps/hungry-grave/src/engine/engine.ts` top-level plugin registration rewritten side by side)

Rejected side by side: `src/engine/engine.ts` runs `extensions.remove/add` at module top, so importing it mutates global Pixi state in any test or tool that touches the module.

Confirmed library-boundary instance: `@pixi/sound` runs `extensions.add(soundAsset)` in its own top-level code (`node_modules/@pixi/sound/lib/soundAsset.js:58`) and publishes no register function.

The verified example:

```ts
// engine.ts: a named function owns the mutation.
const registerEnginePlugins = (): void => {
  extensions.remove(ResizePlugin);
  extensions.add(CreationResizePlugin);
  extensions.add(CreationAudioPlugin);
  extensions.add(CreationNavigationPlugin);
};

export { registerEnginePlugins };

// main.ts: the story shows the step.
const initEngine = async (): Promise<CreationEngine> => {
  registerEnginePlugins();
  const engine = new CreationEngine();
  ...
};

// Library-boundary exception, entry point only,
// when the library gives no explicit API:
import "@pixi/sound";
```

## Rule 5: test files live in a `__tests__` folder beside the code (verified by Mark 2026-08-24, layouts compared side by side on the real `src/game` files)

Rejected side by side: colocated siblings (the repo's current layout) and a separate mirror tree under `tests/`.

The verified layout:

```
src/game/
  swallow.ts
  grave.ts
  step.ts
  __tests__/
    swallow.test.ts
    grave.test.ts
    step.test.ts
```

## Rule 6: a test lives in the `__tests__` of the folder that contains everything it spans (verified by Mark 2026-08-24, the repo's real test files sorted side by side)

Rejected side by side: a separate `tests/` integration tree away from `src`.

The span fence is one more case in `boundary.test.ts`: a test that grows wider goes red with "move me up" instead of silently lying about its span, and a red here is design feedback, not churn.

The verified layout:

```
src/
  __tests__/
    boundary.test.ts      (spans all of src)
  game/
    swallow.ts
    __tests__/
      swallow.test.ts     (spans one module)
      invariants.test.ts  (spans the whole sim)
```

## Rule 7: the standard module layout is core, satellites, shell, adapter (verified by Mark 2026-08-24, specimen the real `apps/hungry-grave/src` tree and its dependency picture, confirmed "exactly what I imagined")

In this repo: the core is `src/game`, the satellites are `input`, `tape`, and `dev`, the shell is `src/app`, and the Pixi adapter is `src/engine`. That the engine could conceptually be swapped is a property the shape gives for free; it is recorded as a property, not a requirement.

The shape is mechanical where it matters: `src/boundary.test.ts` fences core and satellites as an import allowlist. Known gap, recorded not decided: `app` (beyond `sound.ts`) and `engine` are unfenced today.

The verified picture:

```
             main.ts (entry)
                |
               app   (shell; pixi allowed)
              / | \
         input  |  engine  (pixi adapter)
             \  |
              v v
   tape --> game <-- dev
        (core: no reach out, no packages)
```

## Rule 8: error handling (verified by Mark 2026-08-24, derived language-general first through side-by-side schools of code, then audited against this repo)

Rejected side by side: per-module re-checking and defensive checking everywhere.

How this repo measures up today:

- Follows the three buckets: absence returns `null` (`src/game/lines/headstones.ts:81`); bugs throw uncaught (`src/game/rng.ts:98`).
- Follows repair-by-origin in half: documents are rejected with a named error (`TapeFormatError`, `src/tape/decode.ts`); live inputs are repaired (`src/input/keys.ts:53`, `src/game/clock.ts:71`).
- Follows containment: the sim never throws mid-tick; invariant faults end the run as `"faulted"` (`src/game/invariants.ts`, `src/app/runHandoff.ts:43`) with the faults carried in the ending.
- **Violates nothing-abnormal-is-silent: repairs are silent.** `clampMultiplier` returns `1` and `clock` returns `0` with no trace anywhere.

## Rule 9: abstraction appetite (verified by Mark 2026-08-24, schools compared side by side; guarded build-ahead form chosen over unguarded after the collision with the deletion test was shown)

The verified example:

```ts
// Cited future, allowed: bosses are ticket #61.
interface Actor {
  behaviors: Behavior[];      // #61 boss phases
}

// Uncited future, not built: no ticket names loot.
// (loot?: LootTable fails the bar and stays out)
```

## Rule 10: naming (verified by Mark 2026-08-24, specimens `src/game/swallow.ts`, `src/engine/utils/maths.ts` against `src/game/math.ts`, and `src/game/swallow.test.ts`, each written multiple ways side by side)

Rejected side by side: invented shorthand (`payLevel`) and minimal-context names (`levels.pay`); kind grouping (`engine/utils/maths.ts`, the counter-example grab-bag) and one file per export; entity naming at seams (`Food`) and kind decoration (`ISwallowable`, `RunStateData`); the ADR citation inside the test name (the repo's current shape) and function-anchored index names (`describe("swallow()")`).

Confirmed concept module: `game/math.ts` is the sim's approximated-op gate (ADR 0015), a real concept with a reason to exist.

The verified example, the seam and one helper:

```ts
// Descriptive-complete, private, each one a testable unit:
const scalePayoutByFreshness = (freshness: number): number => ...

const applyPayoutAsWeaponLevel = (
  state: RunState, line: WeaponLine, amount: number, events: SimEvent[],
): number => ...

/** The seam: the ADR's word. It sequences the story. */
const swallow = (state: RunState, food: Swallowable): SimEvent[] => {
  const paid = food.payout * scalePayoutByFreshness(food.freshness);
  ...
};

export { swallow };
```

The verified test names:

```ts
describe("the swallow", () => {
  it("converts growth past the size ceiling to score", () => {
    // ADR 0003: size never gates a swallow; the ceiling converts.
    ...
  });
  it("chimes on every swallow, from the very first", ...);
});
```

## Rule 11: comments (verified by Mark 2026-08-24, specimen the `src/game/swallow.ts` header essay rewritten side by side)

Rejected side by side: the header essay that narrates every constraint and absence for the whole file (`swallow.ts`'s current header).

Confirmed instance of a kept why-comment: `math.ts`'s hypot paragraph, where the reason is a constraint the code cannot show.

The verified example:

```ts
/** The one verb: every payout in the game
    arrives through a swallow. */
import ...

/** Takes values, never an entity reference:
    entities are pooled and mutated in place. */
const swallow = (...) => { ... }

// swallow.test.ts owns the absence:
it("is never gated by size", ...)
```

## Rule 12: dependency posture (verified by Mark 2026-08-24, specimen `src/game/rng.ts` against a `seedrandom` dependency, side by side; wrapping decided on the repo's real dependency set)

Rejected side by side: buying `seedrandom` for the core rng; an adapter for every dependency; and fences with no wrappers at all.

The verified example:

```ts
// rng.ts: hand-written, because cross-engine
// determinism is OUR promise (ADR 0015). A dep
// can't be held to it.
const sfc32 = (a, b, c, d) => { ... }

// Rendering is deep and not our promise: buy Pixi,
// wrap it once where it spreads (src/engine).

// vitest appears only in test files: used direct.
import { describe, expect, it } from "vitest";
```

## Rule 13: function, file, and module shape (verified by Mark 2026-08-24, specimens `src/game/swallow.ts` rewritten side by side and the standing one-screen standard)

Confirmed split by concept: the charge lives in `swallow.ts` because the swallow charges it; the firing lives in `belch.ts`.

The verified example:

```ts
const scalePayoutByFreshness = (freshness: number): number =>
  Math.max(freshness, FRESHNESS_PAYOUT_FLOOR);

const applyPayoutAsWeaponLevel = (
  state: RunState, line: WeaponLine, amount: number, events: SimEvent[],
): number => {
  if (state.levels[line] >= MAX_LEVEL) return amount;

  state.levels[line] += 1;
  events.push({ type: "weaponLeveled", line, level: state.levels[line] });
  return 0;
};

const swallow = (state: RunState, food: Swallowable): SimEvent[] => {
  const paid = food.payout * scalePayoutByFreshness(food.freshness);
  ...
};

// The module's public interface, in one place:
export { swallow };
```
