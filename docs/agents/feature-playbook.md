# Feature playbook

Every agent writing production code in this repo reads this file first and follows it.

`docs/agents/lessons.md` is its companion: the judgment this repo bought the expensive way, in the places rules cannot reach.

It exists because an agent needs two things to do real work: a distinct bounded task, and a built-in way to verify the task is done. Generated code that looks finished is not evidence of finished. The verification is part of the task, defined before the code.

## The prototype boundary

A prototype exists to teach: what is possible, what feels right, what is missing. It is never reused.

- Never lift a module out of a prototype into production code.
- Never modify a prototype to consume production modules.
- The tests inside a prototype exist so the building agent could verify its own bounded task. They are not a mark of keeper code.

Production code is built fresh by the flow below.

## The per-feature flow

The flow splits by actor. The planning half belongs to the dispatching session and happens before any coding agent exists: the definition (step 1), the verification steps (step 2), and step 3's decisions, the seams, the module boundaries, and the test list. The coding agent executes: it creates the planned stubs, writes the planned placeholders, runs the TDD loop, runs the verification steps.

The steps never drop; only their size scales. Any change that adds or alters behavior runs all steps, and for a two-line fix that can mean a one-sentence definition, one verification step, one planned test, one slice. A bug fix's test plan is the red test that reproduces the bug. Only changes with no behavior at all (a rename, a comment, prose) skip the flow and run the standing checks alone.

1. **Define the thing.** State what is being built, from the ticket and the design record, in observable terms: what a player or caller can see or do when it works.
2. **Define the verification steps.** Before any code: how will the agent know it truly did the task, not just produced code that resembles it? Name the tests, the checks (typecheck, build, a headless run), and the observed behavior that counts as proof.
3. **Plan the tests.** The full test list is decided and categorized from the requirements and the design, then detailed further by what a proper module for this kind of thing needs. The list is pinned in the test files as named `test.todo` placeholders before implementation starts. Every planned test points at a module that exists as a stub, so a written test fails as "not implemented", never "cannot find module". The seams under test are named here by the dispatching session and carried in the coding agent's prompt; a coding agent never invents its own seams. A seam reaches the human only when it is a genuine design decision: a new public interface something else will depend on.
4. **Run the TDD loop per the `tdd` skill.** Tests live at pre-agreed seams, red before green, one vertical slice at a time (one test, then its minimal implementation, then the next), expected values from an independent source of truth, no implementation-coupled or tautological tests. The feature is done when every planned test is written and green and every verification step from step 2 passes.

## What a plan may claim about existing code

A plan is read as fact by the agent that executes it, so a false sentence in a plan becomes a wrong edit with no red test in front of it. Three rules, all mechanical, all cheap, and all of them added because a plan shipped three false claims about the tree in one document.

1. **Every claim a plan makes about what existing code does cites a file and a line.** Not the module, the line. The point is not the citation, it is that you have to open the file to write the sentence, and every one of those three false claims was false only against a file the plan never opened.
2. **A plan that changes a constant lists every reader of that constant.** It is a grep and it goes in the plan. One of those three claims raised a number described as a sprite size, and the same number was the collision box; the list of readers is what says so.
3. **A multi-dispatch plan's module list is swept for unowned modules before the next dispatch is planned.** Every module the plan names has a dispatch that owns it, or it is recorded as unowned with a trigger. A module nobody owns is discovered late, by the dispatch that needed it.

These bind the planning half. A coding agent that finds a plan's claim about the tree to be false stops and reports it, exactly as it would for a missing seam.

## The verification menu

Step 2 picks from this menu per feature. The escalations are mandatory when they apply, never optional. Every step names its actor: the human or the agent.

- Unit tests at the agreed seams. The floor, always present. Actor: the agent.
- `pnpm typecheck` and the production build. Editor diagnostics are not a judge; these are. Actor: the agent.
- Player-visible change: a rendered check of the built app (`vite preview`, never only the dev server), with the screenshot actually read. Actor: the agent.
- Input-feel change: an on-device check from the deployed URL, named as a step in the plan. The agent delivers the build ready and reports it ready; the human runs the check, because only the human can feel it. The agent never claims the feel is right.

## The stuck rule

The dangerous state is not a red test. It is green tests plus wrong observed behavior: a rendered check or the human says "still wrong" while the suite passes. That means the test plan has a hole, and patching without naming the hole is flailing.

- When tests are green and the behavior is wrong, the agent's first move is to pin the wrongness as a new red test at whatever layer can see it, then fix under normal red-green. Never another patch first.
- If no test the agent can run can see the wrongness (feel, visual judgment), the agent states that explicitly in its report: this property is only human-checkable.
- Three strikes at the behavior layer, then stop. After three failed attempts at making the same observed behavior right, the agent stops and reports what it tried, what it observed, and its best hypothesis. No fourth guess. The report is where the human or the dispatching session can point at prior art.
- A test is never weakened, skipped, or rewritten to reach green. If the agent believes a test itself is wrong, that is also a stop-and-report: a wrong test means the plan was wrong, and replanning is not the coding agent's call.

## Coding standards

Standing preference: small composable functions, each with one purpose, each easily testable. No IIFEs. A function is readable top to bottom on one screen, everything it does visible at once. Around forty lines, splitting becomes the default and staying longer needs a stated reason. A long function is usually several purposes wearing one name; split it by naming them.

Concrete rules enter this section only through a verified round: the same real code from this repo written multiple ways side by side, with Mark verifying which way is the standard. An off-the-cuff sketch, including Mark's own, is never canonized into a rule.

### Verified rules

#### Rule 1: entry-point shape (verified by Mark 2026-08-19, specimen `apps/hungry-grave/src/main.ts`)

- Small named functions, each doing the one thing its name says.
- An orchestrator `main()` that only sequences them, in the order a reader would tell the story.
- Exactly one call at module end: `main().catch(...)`. Never an IIFE.
- Comments survive only where they state a constraint the code cannot show.

The verified example, in full:

```ts
import { FpsMeter } from "./app/FpsMeter";
import { setEngine } from "./app/getEngine";
import { resolveRoute } from "./app/routes";
import { LoadScreen } from "./app/screens/LoadScreen";
import { PrototypesScreen } from "./app/screens/PrototypesScreen";
import { TitleScreen } from "./app/screens/TitleScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";

/**
 * Importing these modules will automatically register their plugins with the engine.
 */
import "@pixi/sound";

async function initEngine(): Promise<CreationEngine> {
  const engine = new CreationEngine();
  setEngine(engine);
  await engine.init({
    background: "#0e1119",
    // 540x760 is the sim's field in units, never device pixels (ADR 0003).
    resizeOptions: { minWidth: 540, minHeight: 760, letterbox: false },
  });
  return engine;
}

/**
 * Puts the frame-rate readout on the stage, above every screen. Navigation
 * adds its own container to the stage lazily, when the first screen is shown
 * (src/engine/navigation/navigation.ts), so a meter added earlier would end up
 * underneath it. zIndex settles the order by rule instead of by who was added
 * first, and holds however the screens are later reshuffled.
 */
function attachFpsMeter(engine: CreationEngine): void {
  const meter = new FpsMeter();
  meter.zIndex = 1;
  engine.stage.sortableChildren = true;
  engine.stage.addChild(meter);
  engine.ticker.add(meter.update, meter);
}

async function resolveScreen(hash: string) {
  const route = resolveRoute(hash);
  if (route.kind === "prototype") return await route.entry.load();
  if (route.kind === "prototype-list") return PrototypesScreen;
  return TitleScreen;
}

/**
 * Answers every navigation the URL fragment can produce: boot, in-app hash
 * writes, and the browser's back and forward buttons alike. The fragment is
 * the single navigation authority between the game and the prototypes, and
 * buttons only assign location.hash; screens inside the game navigate directly
 * and never touch it. Routes are chained so two showScreen calls can never
 * interleave, and a route whose hash went stale while its module loaded steps
 * aside.
 */
function startRouter(engine: CreationEngine): Promise<void> {
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
}

async function main(): Promise<void> {
  const engine = await initEngine();
  userSettings.init();
  attachFpsMeter(engine);
  // The load screen holds the stage while the router resolves the first route.
  await engine.navigation.showScreen(LoadScreen);
  await startRouter(engine);
}

main().catch((error) => console.error(error));
```

## The dispatch contract

A code-writing dispatch prompt carries all of these, from the dispatching session:

- An instruction to read `docs/agents/feature-playbook.md` and follow it.
- The definition of the thing, in observable terms.
- The verification steps, each with its actor (the human or the agent).
- The seams under test.
- The module boundaries: which modules, what each is for, their public interfaces.
- The planned test list.

A coding agent handed a dispatch missing any of these stops and reports instead of filling the gap itself. A missing plan produces a visible stall, never silent improvisation.

For ticket-sized work the same plan also lands on the ticket. For small inline work the prompt is the plan's only home.

The same flow binds a session writing code directly, with no subagent: the session plays both roles, and the plan appears as a visible message in the conversation before the first edit, sized to the work. The plan exists somewhere readable before implementation starts, always.

The coding agent's report ends with the verification steps it ran and their results, and names any step whose actor is the human as still open. A report without verification results is not a completed task.
