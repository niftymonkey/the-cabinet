# Coder contract for step 2 slices (The Hungry Grave, ticket #97)

You are one coding agent taking ONE slice of step 2. You finish the slice, commit it, append to the progress note, commit the note alone, and stop. You never start the next slice.

## Where and how to work

- Work only inside the worktree `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/hungry-grave-v1`, on branch `hungry-grave-v1`. Never touch the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`.
- An isolation guard refuses compound Bash that mentions version control, even inside quoted text. Run one plain command per Bash call. Never chain with `&&`, `;` or `|` when the command names git. Scripts go in the scratchpad directory and are run by path.
- Never use the stash. Never `git add -A` or `git add .`: add each file by path. CodeRabbit does not see untracked files, so add before you review.
- Never write an em dash (U+2014) anywhere: not in code, comments, commit messages, or notes. Use a comma, a colon, or two sentences.
- `pnpm`, never `npm`. Run app commands from `apps/hungry-grave/`. `pnpm typecheck` is the only judge of diagnostics; editor diagnostics are not.

## Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` (repo root). Follow it. Its dispatch contract is satisfied by the plan file below, which carries the definition, verification steps with actors, seams, module boundaries, and the test list.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`; `docs/agents/code-examples.md` for any rule that leaves the path unclear. `docs/agents/lessons.md`.
3. The plan: `apps/hungry-grave/docs/design/step-2-stage-floor-dispatch.md` (142 KB, read it in ranges with the Read tool). Sections 1 to 8 are the contract; section 9 lists the assumptions the plan runs under; section 10 is the slice list. Your slice is named below.
4. The design record `apps/hungry-grave/docs/design/stage-floor.md` for the sections your slice touches.
5. The progress note `apps/hungry-grave/docs/push/step-2-progress.md` in full: what earlier slices landed, GOLDEN moves, seams that moved, false plan claims. Then `apps/hungry-grave/docs/push/step-1-progress.md` sections 4, 7 and 8 (plan claims found false, seams that moved, lessons).
6. The ADRs the plan cites for your slice, in `apps/hungry-grave/docs/adr/`. The glossary `apps/hungry-grave/CONTEXT.md`.

## The flow for the slice

1. Tests first, from the plan's numbered test list for your slice: write each as a red test at the seam the plan names. A test name is the promise in plain words. Tests live in a `__tests__` folder beside the code.
2. The minimal implementation that turns them green. Guards at the top, happy path flat, functions on one screen, one concept per file, a public interface at the module's end.
3. If the slice changes behaviour, regenerate `GOLDEN` as the plan says and record which fields moved and why in the progress note. If the plan says GOLDEN must not move and it moves, stop: the slice is wrong.
4. `pnpm typecheck` and `pnpm vitest run` green in `apps/hungry-grave/`. Then `pnpm verify` at the repo root.
5. The test-name diff (verification step 5): `pnpm vitest list --json` compared with the slice 0 baseline the progress note names; any test removed or renamed is reported.
6. Add every changed and new file by path. Then run CodeRabbit from the repo root on the staged work: `coderabbit review --agent --uncommitted`. Address each finding: fix it, or decline it with a reason you record in the progress note. A finding that changes the plan's shape is recorded as such.
7. Commit the slice with one conventional single-line message ending in `(#97)`, passed with `-m`, no heredoc, no trailers. Example: `feat(hungry-grave): the three sections are authored as rows (#97)`. Never commit unverified code.
8. Append to `apps/hungry-grave/docs/push/step-2-progress.md`: your slice's row in section 1 with its hash and message; GOLDEN moves in 2; CodeRabbit declined and applied in 3; plan claims found false in 4; any seam that moved in 7; verification steps you ran with results. Commit the note alone as `docs(hungry-grave): step 2 progress note after slice N (#97)`.
9. Stop. Report in under 300 words: the two hashes, the tests added (count), GOLDEN moves, CodeRabbit outcome, any plan claim found false, and the verification steps run with results, naming any step whose actor is the human as still open.

## The stuck rule

Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first. Three failed attempts at the same behaviour, then stop and report what you tried, what you observed, and your best hypothesis. A test is never weakened, skipped, or rewritten to reach green; if you believe a test is wrong, that is a stop-and-report, because replanning is not your call. A cited site you cannot find by content is a finding, not something to skip. A plan claim that is false against the tree is recorded in the progress note and the plan's intent is followed, not its stale letter; if the intent is unclear, stop and report.

## Commands

- Tests: `pnpm vitest run` (in `apps/hungry-grave/`). Typecheck: `pnpm typecheck`. Repo gate: `pnpm verify` (repo root).
- Conditioned tape: `pnpm vite-node --config vite.headless.config.ts scripts/record-conditioned.ts <out> <seed> <ticks> soulStream=N territory=N wisps=N bell=N`
- Measure a tape: `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts <tape>`
- Reading a file over roughly 30 KB: use the Read tool in ranges, never `cat`.
