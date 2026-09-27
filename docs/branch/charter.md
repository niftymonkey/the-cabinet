# Branch charter: the tilted view (#159)

How this branch runs is the `branch-runbook` skill at `.claude/skills/branch-runbook/`. Load it before acting. How one slice of code is written is `docs/agents/feature-flow.md`.

## Goal

The game is seen from one still, tilted viewpoint that the grave, the ground, every body and every shot agree on, with steering that still goes where the finger and the keys say, and the field filled with play right up to the edges of the screen. It builds Mark's ruling from #156 (tilt 32.5 degrees, camera 42.50 starting grave half-lengths up, the shared hole camera) into the real game. The branch covers #159. It is one step with eight slices: six that write code, one harness batch, and one rename.

## The branch

- Branch `tilted-view-build`, checked out in the worktree `.claude/worktrees/tilted-view-build`, cut from `main` at `517ee0753e`. All work happens in the worktree, and the main repo folder stays untouched.
- Every slice commit names its slice number, its words on the follow-along list, and #159. Slices are not tickets.

## The reference

The tilted prototype, on the throwaway branch `prototype/156-tilted-view` at `63f34824f3`, file `apps/hungry-grave/src/prototypes/tilted-view/index.html`, played at https://claude.ai/artifact/P7dbHNrp61T3d8wqQCSHAH (version 6, readout `TILT 6`). Coders learn from it and never lift a module out of it; a drawing piece is ported line for line only where its slice entry names it. It never goes to `main`. Build 7, the flat reference, is on `prototype/148-grave-fall`.

## Pre-authorizations (Mark's standing yes for the life of this branch)

- Commit and push after each slice.
- One CodeRabbit CLI review per code commit.
- Deploys to https://hungry-grave.vercel.app, which is Mark's own phone-play address and not production (recipe: `apps/hungry-grave/docs/deploy.md`, built from a clean detached checkout as the handoff says).
- Edits to the glossary (`apps/hungry-grave/CONTEXT.md`) and to this step's design record on this branch. This one is carried from #148's charter and waits on the main session's confirmation with Mark before slice 7, the first slice that edits the glossary.

## The never-list (needs Mark's yes every time)

- The merge.
- Any ADR: writing, editing or deleting one. ADR 0003 is not edited on this branch; its stale sentences are on the handoff's "For Mark's read".
- Any change to a ticket or a memory file, beyond the ticket pass at the branch close.
- Anything outward-facing not listed above, anything that costs money, and any upload of a run.

## Where the branch's files live

- Handoff: `docs/branch/handoff.md`
- Decision log: `docs/branch/decision-log.md`
- Follow-along list: `docs/branch/follow-along.md`
- Working records of the current step: `docs/branch/records/` (the coder contract, one entry per slice, and the coder notes and batch records as they land)
- Design record: `apps/hungry-grave/docs/design/tilted-view.md`
