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

The rule statements live in `.claude/rules/code-core.md` (language-general, loaded into every session) and `.claude/rules/code-typescript.md` (the TypeScript forms, loaded when TypeScript files are in play). Their pinned evidence (per rule: the specimen, the chosen form, the rejected forms) lives in `docs/agents/code-examples.md`; read a rule's entry there when the rule alone leaves the path forward unclear.

A concrete rule enters the record only through a verified round: the same real code from this repo written multiple ways side by side, with Mark verifying which way is the standard. An off-the-cuff sketch, including Mark's own, is never canonized into a rule.

Every rule binds new code only. Bringing the existing tree up to the rules is ticket #59.

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
