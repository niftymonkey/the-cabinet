# Coder contract for step 3 slices (The Hungry Grave, ticket #98)

You are one coding agent taking ONE slice of step 3. You finish the slice, commit it, append to the progress note, commit the note alone, and stop. You never start the next slice.

## Where and how to work

- Work only inside the worktree `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/hungry-grave-v1`, on branch `hungry-grave-v1`. Never touch the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`.
- An isolation guard refuses compound Bash that mentions version control, even inside quoted text. Run one plain command per Bash call. Never chain with `&&`, `;` or `|` when the command names git. Scripts go in the scratchpad directory and are run by path.
- Never use the stash. Never `git add -A` or `git add .`: add each file by path. CodeRabbit does not see untracked files, so add before you review.
- Never write an em dash (U+2014) anywhere: not in code, comments, commit messages, or notes. Use a comma, a colon, or two sentences.
- `pnpm`, never `npm`. Run app commands from `apps/hungry-grave/`. `pnpm typecheck` is the only judge of diagnostics; editor diagnostics are not.
- Scratch work goes in the scratchpad directory named in your system prompt, never under the repo. `local/` reaches none of the standing checks: it is outside version control (`.gitignore:16`), outside eslint (`eslint.config.mjs:59`), outside prettier, and outside `tsconfig.json`'s `include`, which is `src`, `scripts` and `vite.config.ts`. The one thing that does reach into it is vitest, which has no config of its own and so takes its default include: a `*.test.ts` left under `local/` runs in the suite. Batch tapes and batch reports go under `local/batches/` as the design record says, and nothing under `local/` ever enters a commit.

## Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` (repo root). Follow it. Its dispatch contract is satisfied by the plan file below, which carries the definition, verification steps with actors, seams, module boundaries, and the test list.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`; `docs/agents/code-examples.md` for any rule that leaves the path unclear. `docs/agents/lessons.md`.
3. The plan: `apps/hungry-grave/docs/design/step-3-playing-harness-dispatch.md` (95 KB, read it in ranges with the Read tool). Section 0 says what it may claim; sections 1 to 8 are the contract; section 9 lists the new commitments it runs under; section 10 is the slice list. Your slice is named below.
4. The design record `apps/hungry-grave/docs/design/playing-harness.md` for the sections your slice touches. Its amendments dated 2026-09-09 are the three gates' findings applied: read the amendment, not only the paragraph above it.
5. The progress note `apps/hungry-grave/docs/push/step-3-progress.md` in full if it exists: what earlier slices landed, GOLDEN moves, seams that moved, false plan claims. Then `apps/hungry-grave/docs/push/step-2-progress.md` sections 4, 5 and 7 (plan claims found false, gate corrections, verification steps run) and `apps/hungry-grave/docs/push/step-1-progress.md` sections 4, 7 and 8 (plan claims found false, seams that moved, lessons).
6. The ADRs the plan cites for your slice, in `apps/hungry-grave/docs/adr/`. The glossary `apps/hungry-grave/CONTEXT.md`.

## The flow for the slice

1. Tests first, from the plan's numbered test list for your slice: write each as a red test at the seam the plan names. A test name is the promise in plain words. Tests live in a `__tests__` folder beside the code.
2. The minimal implementation that turns them green. Guards at the top, happy path flat, functions on one screen, one concept per file, a public interface at the module's end.
3. If the slice changes behaviour, regenerate `GOLDEN` as the plan says and record which fields moved and why in the progress note. The plan says `GOLDEN` must not move in any slice of this step: if it moves, stop, the slice is wrong.
4. `pnpm typecheck` and `pnpm vitest run` green in `apps/hungry-grave/`. Then `pnpm verify` at the repo root.
5. The test-name diff (verification step 5): `pnpm vitest list --json` compared with the slice 0 baseline the progress note names; any test removed or renamed is reported. It matters most on the header slice, which touches fourteen files that build a `TapeHeader` literal.
6. Add every changed and new file by path. Then run CodeRabbit from the repo root on the staged work: `coderabbit review --agent --uncommitted`. Address each finding: fix it, or decline it with a reason you record in the progress note. A finding that changes the plan's shape is recorded as such.
7. Commit the slice with one conventional single-line message ending in `(#98)`, passed with `-m`, no heredoc, no trailers. Example: `feat(hungry-grave): the harness hand takes offers and belches (#98)`. Never commit unverified code.
8. Append to `apps/hungry-grave/docs/push/step-3-progress.md`: your slice's row in section 1 with its hash and message; GOLDEN moves in 2; CodeRabbit declined and applied in 3; plan claims found false in 4; any seam that moved in 5; verification steps you ran with results in 7; then your own slice section at the end. The first slice creates the note with that layout: 1 slices committed, 2 GOLDEN moves, 3 CodeRabbit, 4 plan claims found false against the tree, 5 seams that moved, 6 the baseline tapes, 7 verification steps run, then one section per slice. Commit the note alone as `docs(hungry-grave): step 3 progress note after slice N (#98)`.
9. Stop. Report in under 300 words: the two hashes, the tests added (count), GOLDEN moves, CodeRabbit outcome, any plan claim found false, and the verification steps run with results, naming any step whose actor is the human as still open.

## The stuck rule

Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first. Three failed attempts at the same behaviour, then stop and report what you tried, what you observed, and your best hypothesis. A test is never weakened, skipped, or rewritten to reach green; if you believe a test is wrong, that is a stop-and-report, because replanning is not your call. A cited site you cannot find by content is a finding, not something to skip. A plan claim that is false against the tree is recorded in the progress note and the plan's intent is followed, not its stale letter; if the intent is unclear, stop and report.

## The rows rule

Every magnitude in this step is an initial data row and step 4's tuning pass (#39) is what moves it. A slice that finds a number wrong records the finding and leaves the number. The hand's own rows are never tuned at all: a changed hand row is a new configuration with a new name, never a retune of an existing one.

## Commands

- Tests: `pnpm vitest run` (in `apps/hungry-grave/`). Typecheck: `pnpm typecheck`. Repo gate: `pnpm verify` (repo root).
- Conditioned tape: `pnpm vite-node --config vite.headless.config.ts scripts/record-conditioned.ts <out> <seed> <ticks> skullStream=N territory=N wisps=N bell=N`
- Measure a tape: `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts <tape>`
- A batch, once slice 4a lands it: `pnpm vite-node --config vite.headless.config.ts scripts/batch.ts <configuration> <first-seed> [count] [out-root]`
- Reading a file over roughly 30 KB: use the Read tool in ranges, never `cat`.
