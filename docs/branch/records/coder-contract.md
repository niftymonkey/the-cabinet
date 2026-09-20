# Coder contract: the grave in the ground (#148), step 1

These rules hold for every coder on this step. Your slice entry says what you build. This file says how every slice is built. Where the two disagree, stop and report.

## Read first, in this order

1. `docs/agents/feature-flow.md`. You follow it. Your slice entry is its planning half, already done: the definition, the verification steps, the seams, the module boundaries and the test list. If the entry is missing one of those, stop and report. Never fill the gap yourself.
2. `docs/agents/lessons.md`.
3. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`. Where a rule leaves the path unclear, read its entry in `docs/agents/code-examples.md`.
4. The ruling your slice builds, in `apps/hungry-grave/docs/design/grave-in-the-ground.md`. The entry names the section. The glossary is `apps/hungry-grave/CONTEXT.md`: Swallow, Pull, Tip and Fall are defined terms, and a public seam carries the glossary's word. The grave swallows and passes under; it never drives.

## Where you work

- Only in the worktree `.claude/worktrees/148-grave-in-the-ground`, on the branch `148-grave-in-the-ground`. The main repo folder is never touched, and that includes its `local/` folder, which you may read and never write.
- Scratch files go under `local/<the folder your entry names>/` in the worktree. No other agent uses that name.
- You do not commit, push, stash, reset, or switch branches. The main session reviews and lands your work. Leave your changes in the working tree.
- You do not edit `docs/branch/charter.md`, `docs/branch/handoff.md`, `docs/branch/follow-along.md`, `docs/branch/decision-log.md`, this contract, or any slice entry. You do not touch a ticket, a memory file, or anything outside the repo. You upload nothing and spend nothing.
- Stop every server, browser and background process you start, and say in your note that you did.

## The prototype

Prototype build 7 is on the branch `prototype/148-grave-fall` (worktree `.claude/worktrees/148-grave-fall`, file `apps/hungry-grave/src/prototypes/grave-fall/index.html`). Read it to learn what the result looks like and which numbers Mark chose. Never copy code out of it, and never change it.

## Rules that bind every slice

- **Values are data.** Every number in the design record is a starting value. A rules value (the threshold, the pull's reach, strength and response) is a row in `src/game/tuningRecord.ts`. A drawing value (times, the projection's constants, the scene's length) is a row in one data table in `src/app` beside the renderer. No value is compiled into a rule or a draw call as a bare constant.
- **Exact arithmetic in the rules.** Code under `src/game` uses add, subtract, multiply, divide, min, max, square root, and the `normalize` and `exp` of `src/game/math.ts`. Never `Math.exp`, `Math.pow`, `atan2`, or any other function that differs between engines, because a tape must replay the same on a phone and a computer.
- **The rules never learn the drawing's words.** `src/game` imports nothing from `src/app` and nothing from Pixi. The rules know the swallow, the pull and the tip. The turn, the hinge and the fall are drawing code.
- **A pin is never moved in silence.** `GOLDEN` in `src/dev/digest.ts`, the bot's seed lists in `src/dev/__tests__/bot.test.ts`, and the witness version move only where your entry says they move. When one moves, your note says which values moved, from what to what, and why that is the expected result of the ruling. If a pin moves that your entry says should hold, stop and report.
- **A test is never weakened, skipped or rewritten to reach green.** A failing spec test indicts the code. If you believe a test is wrong, stop and report.
- **The invariants run on every step of every sim test**, as the existing sim tests do.
- **Builds stay free of warnings.** Lint, typecheck and the production build end with no warning and no error. A warning you meet is fixed or reported, never left.
- **An anomaly is a finding.** An error, a warning, or an odd output that you did not expect goes in your note with what you saw, even when it is not yours. Do not widen your slice to fix it.
- **Comments** state a constraint the code cannot show. A multi-line comment is JSDoc on the declaration. A single-line comment is a `//` line. Never write a comment about removed code or about how the code used to be.
- **Writing.** Never use an em dash. Never hard-wrap prose in a markdown file: one paragraph is one line.

## Verification floor, every slice

Your entry adds to this list and never removes from it. You are the actor for all of it.

1. Every planned test is written, was red on its own assertion first, and is green.
2. Test names compared before and after, by the method in `docs/agents/lessons.md` ("Compare test names before and after"). Your note explains every lost name.
3. `pnpm --filter hungry-grave typecheck`, `pnpm --filter hungry-grave test`, and `pnpm --filter hungry-grave build`, then `pnpm verify` from the repo root. Paste the closing lines of each into your note.
4. For a change a player can see: a rendered check of the built app through `vite preview`, never only the dev server, with each screenshot read and described in your note. A state that is over in a few frames is held in a staged scenario or stepped tick by tick and photographed there. Where no tool can hold the state, building that ability is part of your slice, and your entry names it.

Mark's play never stands in for a check. A property only a person can judge (feel, whether it looks good) is named in your note as open for the human.

## When the entry is wrong about the code

Your entry cites files and lines. When a cited fact is false, or a seam the entry names cannot work, stop and report what you found with the file and the line. Do not repair the plan yourself.

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
