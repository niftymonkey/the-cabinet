# Coder contract for step 4 slices (The Hungry Grave, ticket #39)

This file holds the rules every step 4 coding slice carries, so a slice prompt holds only what is its own: how to work in the worktree, the commit and review rules, the progress note, the verification commands, what must not move in any slice, what is never a slice's job, and the stuck rule.
Every step 4 coding prompt from slice F on names this file and is read alongside it; slices B0, B, C, D and E carry these rules inline because they were dispatched before it existed.

You are one coding agent taking ONE slice of step 4. You finish the slice, commit it, append to the progress note, commit the note, and stop. You never start the next slice.

## Where and how to work

- Work only inside the worktree `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/hungry-grave-v1`, on branch `hungry-grave-v1`. Run `git log --oneline -25` and `git status --short` first and check the tree is clean before your first edit.
- **Never touch the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`**, not to read, not to run a command in, not to write. Everything happens inside the worktree.
- **The isolation guard refuses compound Bash that mentions git, even inside quoted text, and even inside a loop or a variable it cannot evaluate.** So: **one plain git command per Bash call.** Never chain with `&&`, `;` or `|` when the command names git. A script that needs a loop goes in the scratchpad directory and is run by path.
- **Never use the stash.** The stack is shared with the main checkout and other sessions. Set work aside with a temporary commit if you must set it aside at all.
- **Never `git add -A` or `git add .`.** Add each path.
- **Never write an em dash (U+2014) anywhere**: not in code, not in a comment, not in a commit message, not in the progress note. Comma, colon, parentheses, or two sentences.
- `local/` reaches none of the standing checks: outside version control, outside eslint, outside prettier, outside `tsconfig.json`'s `include`. The one thing that does reach it is vitest, which has no config of its own, so a `*.test.ts` left under `local/` runs in the suite. **Nothing under `local/` ever enters a commit**, batch output included.
- Scratch work goes in the scratchpad directory your system prompt names, never under the repo, and the scratchpad is shared between agents, so give your files distinctive names.
- Nothing under `docs/` is ever handed to prettier by name. `pnpm`, never `npm`, and app commands run from `apps/hungry-grave/`. `pnpm typecheck` is the only judge of diagnostics; editor diagnostics name scratch files and stale states.
- Reading a file over roughly 30 KB: the Read tool in ranges, never `cat`. In zsh a bare `echo ====` fails and `--include=*.ts` needs quoting.
- **A recurring anomaly:** a sibling worktree's `pnpm install` can repoint this worktree's `node_modules` links and leave them dangling, so a missing-module error is a reason to check the link targets before believing anything about your own tree. `pnpm install --frozen-lockfile` relinks it and the lockfile does not move. It has recurred under slices C, D and E (progress note sections 15 and 16).
- **You never deploy.** The orchestrator deploys the branch worktree between coders, so the build live at https://hungry-grave.vercel.app is whatever the last deploy took and may be newer than the tip your slice starts from.
- **The build identity's dirty check counts any uncommitted file in the worktree, documentation included.** A tape recorded or a build made while anything is uncommitted stamps a dirty identity, so commit or set aside every open file before you record a tape.

## The commit rules

- One code commit and one docs commit per slice, each conventional, **single line**, ending in `(#39)`, which is the ticket every step 4 docs and code commit cites.
- Pass the message with `-m`. **Never a heredoc.**
- **No body and no trailer of any kind**: every commit on this branch is one line, and a `Co-Authored-By` line is a trailer.
- Never commit unverified code.

## CodeRabbit, one iteration

`git add` every changed, new and renamed file **by path**, never `git add -A` and never `git add .`, because the review does not see untracked files.
Then, from the worktree root, `coderabbit review --agent --uncommitted`. Apply the real findings. Decline the rest with a reason recorded in the progress note. **One iteration**, then move on.

## The progress note

Append your slice's own section to `apps/hungry-grave/docs/push/step-4-progress.md`, add your row to section 1's table, and add your entry to section 2's `GOLDEN` list if the pin moved.
The section numbers are fixed: **B0 is 13, B is 14, C is 15, D is 16, E is 17, F is 18, G is 19.**
Commit the note as `docs(hungry-grave): step 4 progress note records slice N (#39)`.
Whatever else your slice's own prompt asks for, every note says: the CodeRabbit findings applied and declined, the file count and the test-name diff's two numbers, anything in the plan or either design record you found false against the tree, and anything you left for a later slice with the slice named.

## The verification commands

1. **Agent.** `pnpm typecheck` green from `apps/hungry-grave/`.
2. **Agent.** `pnpm vitest run` green from `apps/hungry-grave/`, then `pnpm build`, then `pnpm verify` green at the repo root, **twice on the committed tree**. A timeout with no assertion is contention and not a failure: run the suite alone once more before calling anything red (`docs/agents/lessons.md`). Slices B, C, D and E each filed a follow-up commit for a whole-run test budget that reddened only under load, each recorded in its own progress note section under "the anomaly that earned it".
3. **Agent.** The test-name diff. `pnpm vitest list --json > <current>` into the scratchpad, then `pnpm vite-node --config vite.headless.config.ts scripts/test-names.ts apps/hungry-grave/local/step4/tests-baseline.txt <current>`. **The baseline is at `apps/hungry-grave/local/step4/tests-baseline.txt`, beside its `.json` sibling, 1834 names**, and not at the worktree root where the handoff's wording reads. Do not recreate either file. It predates every slice, so it cannot isolate yours: capture this branch's own tip before your first edit through a scratch worktree the way slices B0, C, D and E did, and report both figures.
4. **Agent.** Replay determinism at your own tip: one seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
5. **Agent.** Measure a tape: `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts <tape>`, asserting `outcome: 'verified'`. A hand-recorded tape is recorded against the built app through `vite preview` and driven with `playwright-cli`, never the Playwright MCP.
6. **Agent.** A conditioned tape: `pnpm vite-node --config vite.headless.config.ts scripts/record-conditioned.ts <out> <seed> <ticks> skullStream=N territory=N wisps=N bell=N`, measured the same way.
7. **Agent.** A batch: `pnpm vite-node --config vite.headless.config.ts scripts/batch.ts <configuration> <first-seed> [count] [out-root]`.
8. **Agent.** The fences green, each named by test title in the note.
9. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
10. **Human (Mark), and none of these blocks you.** The push runs in one-push mode: you continue past every human step and he reads them on the branch.

## What must not move in any slice, and a move is a stop

- **The fences.** `boundary.test.ts`, `lineAgnosticPolicies.test.ts`, `executionFence.test.ts`, `harnessStatesNoTarget.test.ts` and `comparisonDeclared.test.ts`, plus slice D's sixth, *the cap derivation reads tables and never the stage*, which lives inside `boundary.test.ts`. All green, each named by test title in the note.
- **The invariants.** Every existing check in `invariants.ts` keeps its meaning and its severity, and every fault identity keeps its wire number. The list in `FAULT_IDENTITY_CODES` is closed and append-only by its own JSDoc (ADR 0024), so a slice that is permitted a new identity appends it and moves nothing.
- **Replay determinism.** Two runs on one seed with the same inputs rebuild identically, and a tape replays and verifies off its own header.
- **`STREAM_SALTS` in `rng.ts`**, every entry, and **`STREAM_ORDER`'s order**. Slice B0 found that a stream's salt seeds its sequence, so moving one silently re-seeds a run and breaks every tape recorded before it. The power-up stream's salt is still the string `drops` and a test pins it. Append-only, and only where a slice is told to append.
- **No test is deleted, skipped, weakened or rewritten to reach green.** A measured baseline that moves is re-measured with its comment saying what moved and why. A test you believe is wrong is a stop and report, because replanning is not your call.
- **No ADR gains a combat magnitude, and you file no ADR and amend none.** Magnitudes are data rows in the module that owns them, each cited to the design record's own table.
- **Mark's rulings.** ADR 0044's flat Territory touch counts, ADR 0042's Wall, and Territory's rungs, which no slice owns.

## What is never your job

- **Territory's rungs**, which no slice in the plan owns and which are Mark's.
- **The four tickets Mark filed in round two, #122 the offer bubble, #123 the Wall, #124 the belch and #125 Territory.** All four are round two's and none of them is any slice's.
- **Prose in `docs/design` and `docs/adr` still carrying the old six words**, ADR 0047's and ADR 0056's own bodies included. A follow-up docs pass owns it.
- **Mark's follow-along doc**, https://md.niftymonkey.dev/api/raw/CTtB5BJJ. The orchestrator's.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.** Each needs its own explicit yes and none of them is yours.

## The stuck rule

**Two failed honest attempts at the same thing, or a decision only Mark can make, or an unauthorized irreversible step: stop and report.** Write what you were doing, the two attempts and why each failed, and one sentence naming the question. **Do not send anything to Discord yourself; the orchestrator does that.** Hand your report back and stop.

Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first. A claim in the plan or in either record that is false against the tree is recorded in the progress note and the source's intent is followed rather than its stale letter; if the intent is unclear, that is a stop. **A gate finding or a measurement that argues against something Mark ruled is filed for his read and built past, never applied.**
