# Branch charter: the tilted view (#159)

How this branch runs is the `branch-runbook` skill at `.claude/skills/branch-runbook/`. Load it before acting. How one slice of code is written is `docs/agents/feature-flow.md`. Where either says more review, more gate rounds or more reruns than "How a slice runs" below, this charter wins for the rest of this branch (Mark's yes, 2026-09-27).

## Goal

The game is seen from one still, tilted viewpoint: the ground and the grave's hole through Mark's pinhole camera (tilt 32.5 degrees, camera 42.50 starting grave half-lengths up, the shared hole camera), and everything that moves on a play layer that is straight across the screen, on the camera's rows down it and at the camera's size for its row, as tilt 9 of the prototype draws it. The tilt is drawing only: nothing about how the game plays changes (Mark, 2026-09-27, design record T10), and the weapons behave right, which is his condition. The branch covers #159. It is one step: six slices landed before the correction, two dropped, the rename undone as slice 9, and four slices A to D after it (the follow-along list).

## The branch

- Branch `tilted-view-build`, checked out in the worktree `.claude/worktrees/tilted-view-build`, cut from `main` at `517ee0753e`. All work happens in the worktree, and the main repo folder stays untouched.
- Every slice commit names its slice number, its words on the follow-along list, and #159. Slices are not tickets.

## The reference

Tilt 9 of the tilted prototype, uncommitted in the worktree `.claude/worktrees/156-tilted-view`, file `apps/hungry-grave/src/prototypes/tilted-view/index.html`, with tilt 7 beside it as `local/tilt9/index-tilt7.html` and tilt 9's checks in `local/tilt9/`. Tilt 6 is on the throwaway branch `prototype/156-tilted-view` at `63f34824f3`. Coders learn from it and never lift a module out of it. It never goes to `main`. Build 7, the flat reference, is on `prototype/148-grave-fall`.

## How a slice runs

- **Screenshots stay few.** Mark, 2026-09-28: "I want to avoid running this large gigantic ridiculous amount of screenshots unless we're doing final regression testing before a release." A slice takes only the handful of shots that prove its own change; a whole run is checked by its replay verifying headless, never by a sweep of frames. A large sweep runs only as final regression before a release. Checks use his two real screens only: his iPhone in portrait, 428 by 926 CSS px (iPhone 12 Pro Max), and his desktop browser.

Mark approved this lighter process on 2026-09-27 for the rest of the branch. The remaining work is four slices, A to D (the follow-along list); each is one coder's whole job.

1. **The coder** builds test first by the feature flow and the coder contract, and runs each check once (test, typecheck, build, `pnpm verify`, the entry's rendered checks) before returning its note. It updates an existing test whose promise is unchanged and lists it; it stops only when a test's promise itself would change or the plan is wrong about the code (the contract's stop rule).
2. **The main session** runs one test run, one typecheck and one build on the returned work, then exactly one CodeRabbit CLI review of the uncommitted work (`git add -N` the new files first), then commits exactly what was reviewed, with no edits after the review, and pushes.
3. **A real bug the review finds** is fixed in the next slice's commit, by that slice's coder or a small agent, where it gets that commit's own review. It is not fixed in place and the review is not rerun.
4. **Style, wording and nice-to-have findings** go to "For the close" in `docs/branch/handoff.md`. Never a rerun.
5. **The last commit** gets its own tip review before the merge: `coderabbit review --agent --base-commit HEAD~1 -t committed`. A real bug it finds is fixed in one more commit, which gets the same tip review.
6. **No gate rounds until the close.** At the close the three gates run once on the built result.
7. **The design record takes only real decisions**, the kind that would be costly to reverse or that Mark rules. A small call a coder or the main session makes goes in the slice's note, not the record.

## Pre-authorizations (Mark's standing yes for the life of this branch)

- Commit and push after each slice.
- Exactly one CodeRabbit CLI review per slice, of the uncommitted work, then its commit ("How a slice runs").
- Deploys to https://hungry-grave.vercel.app, which is Mark's own phone-play address and not production (recipe: `apps/hungry-grave/docs/deploy.md`, built from a clean detached checkout as the handoff says).
- Edits to the glossary (`apps/hungry-grave/CONTEXT.md`) and to this step's design record on this branch. This one is carried from #148's charter and waits on Mark's yes; no slice edits the glossary, and the two proposed entries (Camera, Play layer) go in at the branch close if he says yes.

## The never-list (needs Mark's yes every time)

- The merge.
- Any ADR: writing, editing or deleting one. ADR 0003 is not edited on this branch; after the correction it is not stale.
- Any change to a ticket or a memory file, beyond the ticket pass at the branch close.
- Anything outward-facing not listed above, anything that costs money, and any upload of a run.

## Where the branch's files live

- Handoff: `docs/branch/handoff.md`
- Decision log: `docs/branch/decision-log.md`
- Follow-along list: `docs/branch/follow-along.md`
- Working records of the current step: `docs/branch/records/` (the coder contract, one entry per slice, and the coder notes and batch records as they land)
- Design record: `apps/hungry-grave/docs/design/tilted-view.md`
