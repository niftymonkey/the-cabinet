# Coder contract: the tilted view (#159), step 1

These rules hold for every coder on this step. Your slice entry says what you build. This file says how every slice is built. Where the two disagree, stop and report.

## Read first, in this order

1. `docs/agents/feature-flow.md`. You follow it. Your slice entry is its planning half, already done: the definition, the verification steps, the seams, the module boundaries and the test list. If the entry is missing one of those, stop and report. Never fill the gap yourself.
2. `docs/agents/lessons.md`, and `apps/hungry-grave/docs/lessons.md` for this codebase's own traps.
3. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`. Where a rule leaves the path unclear, read its entry in `docs/agents/code-examples.md`.
4. The rulings your slice builds, in `apps/hungry-grave/docs/design/tilted-view.md`. The entry names them (T for Mark's, A for the agent's calls). The glossary is `apps/hungry-grave/CONTEXT.md`, and a public seam carries its word. The grave swallows and passes under; it never drives. Field is the glossary's word for the sim's 540 by 760 field. Camera and Play layer are the design record's proposed entries ("What this replaces, and what stood"); use those words in seams, and do not edit the glossary.
5. For any slice that touches Pixi code, load the `pixijs-skills:pixijs` skill first, and check a claim about Pixi in `node_modules/pixi.js`, never from memory.

## Where you work

- Only in the worktree `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/tilted-view-build`, on the branch `tilted-view-build`. The main repo folder is never touched, and that includes its `local/` folder, which you may read and never write.
- Scratch files go under `local/<the folder your entry names>/` in the worktree, as full paths. No other agent uses that name. A generic file name gets clobbered by another agent, and an empty diff then looks like proof, so every file you write there carries your slice in its name.
- You do not commit, push, stash, reset, or switch branches. The main session reviews and lands your work. Leave your changes in the working tree.
- You do not edit `docs/branch/charter.md`, `docs/branch/handoff.md`, `docs/branch/follow-along.md`, `docs/branch/decision-log.md`, this contract, any slice entry, or the design record. You do not touch a ticket, a memory file, an ADR, or anything outside the repo. You upload nothing, deploy nothing and spend nothing.
- Stop every server, browser and background process you start, and say in your note that you did. A `vite preview` on port 4173 may belong to another worktree; use another port.
- `pnpm vite-node` keeps the directory it is called in, so give a batch's output folder as a full path.

## The prototype

The tilted prototype lives in the worktree `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/156-tilted-view`, file `apps/hungry-grave/src/prototypes/tilted-view/index.html`. The file in that worktree is tilt 9, uncommitted, the reference Mark approved (design record T10); tilt 7 is beside it as `local/tilt9/index-tilt7.html`, and the branch `prototype/156-tilted-view` holds tilt 6. Read it to learn what the result looks like and which numbers Mark chose. Never lift a module out of it, never wire it to production code, and never change it. Where your entry names a piece of its drawing code as ported line for line, port exactly that piece and nothing more, and list it in your note. Everything else is built fresh through the feature flow.

Build 7, the flat reference, is on `prototype/148-grave-fall` (worktree `.claude/worktrees/148-grave-fall`). Never change it either.

## Rules that bind every slice

- **The sim is untouched by the tilt (T10).** No production file under `src/game` or `src/tape` changes on this branch, with one exception: slices P1 and P2 (split from P), which carry Mark's ruling of 2026-09-27 that the field fills any portrait phone, sized per run and recorded in the tape header (design record A30 to A33). P1 changes exactly what its entry names under `src/game` and `src/tape`, and P2 only removes the temporary defaults and `FIELD_HEIGHT` its entry names in `field.ts`, `caps.ts` and `tip.ts`; every later slice treats their result as the sim and changes nothing under those folders. Any other slice that finds it must change one is a stop and report. The tapes in `local/tilt-shots/tapes/`, recorded at `517ee0753e`, verify on every slice.
- **Scenery on the camera, play on the play layer.** The ground, its dressing and the grave's hole (its mesh corners and its stance) are drawn through `SCENE_CAMERA` (slice 1). Everything the sim moves (bodies, the grave's place, anything fired, every area of effect) is placed through `SCENE_PLAY_LAYER` and `playPlacement.ts` (slice 10). Nothing builds a second camera, and nothing reads the live grave's size to place the camera (T3).
- **Values are data.** A number the design record names lives in the table the record says: the camera's two values in the camera module's table, a drawing value in a data table beside the renderer that reads it, and the field's six numbers and the grave's reach share in `src/game`. No value is compiled into a draw call or a rule as a bare constant.
- **Exact arithmetic in the rules.** Code under `src/game` uses add, subtract, multiply, divide, min, max, square root, and the `normalize` and `exp` of `src/game/math.ts`. Never `Math.cos`, `Math.sin`, `Math.atan2`, `Math.pow` or any other function that differs between engines (ADR 0019). The camera's trigonometry is drawing code and lives in `src/app`.
- **The rules never learn the drawing's words.** `src/game` imports nothing from `src/app`, `src/dev` or Pixi (`src/__tests__/boundary.test.ts`). The sim knows the field's shape and the grave's reach; it does not know the camera.
- **ADR 0014's layer order does not move.** `LAYER_ORDER` (`src/app/screens/game/layering.ts:16-31`) stays exactly as it is. Sorting inside a layer is allowed where your entry says so.
- **A pin is never moved in silence.** `GOLDEN` in `src/dev/digest.ts`, `WITNESS_VERSION` (`src/game/witness.ts:235`), `FORMAT_VERSION` (`src/tape/wireCodes.ts:68`) and `READINGS_VERSION` (`src/dev/readingsVersion.ts`) never move on this branch. The bot's and the harness's seed lists (`src/dev/__tests__/bot.test.ts`, `src/dev/__tests__/harnessPolicy.test.ts`) moved back to their values at `544f0028d4` in slice A (measured, byte-identical), and P1 re-measures them at the 760 field, where they must hold, and adds `GOLDEN_1168` beside `GOLDEN` at the 1168 field. When one moves, your note says which values moved, from what to what, and why that follows from the ruling, with the evidence. A pin is re-measured, never loosened to pass. If a pin moves that your entry says should hold, stop and report.
- **A test is never weakened, skipped or rewritten to reach green.** A failing spec test indicts the code. Where your entry names a test whose premise a ruling changed, replace exactly that test with the tests the entry lists and say so in your note.
- **The stop rule for an existing test that goes red.** When its promise stays the same and only its form must follow the code (a reworded assertion, a changed helper, a new argument, a position now read through the play layer), update it and list it in your note with what changed and why its promise holds. Stop and report only when a test's promise itself would change, or when the entry is wrong about the code. This rule overrides any line in an entry that says every other red test is a stop.
- **The invariants run on every step of every sim test**, as the existing sim tests do (`src/dev/stepping.ts`).
- **Builds stay free of warnings.** Lint, typecheck and the production build end with no warning and no error. A warning you meet is fixed or reported, never left.
- **An anomaly is a finding.** An error, a warning, or an odd output you did not expect goes in your note with what you saw, even when it is not yours. Do not widen your slice to fix it.
- **Comments** state a constraint the code cannot show. A multi-line comment is JSDoc on the declaration. A single-line comment is a `//` line. Never write a comment about removed code or about how the code used to be.
- **Writing.** Never use an em dash or an en dash. Never hard-wrap prose in a markdown file: one paragraph is one line.

## Verification floor, every slice

Your entry adds to this list and never removes from it. You are the actor for all of it unless a step names Mark.

1. Every planned test is pinned first as a `test.todo` against a stub that returns a wrong value of the right type, is written, was red on its own assertion first (you read the failure message and saw the expected value beside the stub's), and is green.
2. Test names compared before and after, by the method in `docs/agents/lessons.md` ("Compare test names before and after"). Your note explains every lost or moved name.
3. `pnpm --filter hungry-grave typecheck`, `pnpm --filter hungry-grave test`, and `pnpm --filter hungry-grave build`, then `pnpm verify` from the repo root, each run once, when the work is done, before you return. Paste the closing lines of each into your note. The main session runs its own test, typecheck and build once more, then one CodeRabbit review (the charter's "How a slice runs").
4. For a change a player can see: a rendered check of the built app through `vite preview`, never only the dev server, with each screenshot read and described in your note. A state that is over in a few frames is held or stepped and photographed there. The ways to hold a frame are in `docs/branch/handoff.md`, "Facts later work needs". Where no tool can hold the state, building that ability is part of your slice, and your entry names it. Say which reads you could not obtain rather than implying the check was complete.

Mark's play never stands in for a check. A property only a person can judge (feel, whether it looks right) is named in your note as open for the human.

## When the entry is wrong about the code

Your entry cites files and lines, read on the tree at `9b125bbc03` or at the slice before yours. A line number that has moved is followed by the name beside it. When the name is not there, or a cited fact is false, or a seam the entry names cannot work, stop and report what you found with the file and the line. Do not repair the plan yourself.

## When you are stuck

When an attempt fails, look up how the industry already solves the problem and try that. You are stuck when two honest attempts failed and the prior art failed too, or when the decision is Mark's alone and hard to reverse, or when the next step is hard to reverse and nobody authorized it. Then stop the slice and return a stuck report: what you tried, the prior art you found, why that failed, the decision needed, and your recommendation. No further guess.

Green tests with wrong observed behaviour is the dangerous state. Pin the wrongness as a new red test at whatever layer can see it, then fix it. Never patch first.

## The coder note

Write your note to `docs/branch/records/slice-<n>-note.md` and return the same text as your final message. It has this form and nothing else:

1. **What changed**, by file and by name.
2. **Verification results**: each step of the floor and of your entry, with its result. Each step whose actor is the human is named as still open.
3. **Where the entry was wrong about the code**, or "nowhere".
4. **Decisions made**, each with its evidence and how to reverse it.
5. **Open items**.
6. **Stuck:** "none", or the stuck report.

The story of the work stays out.
