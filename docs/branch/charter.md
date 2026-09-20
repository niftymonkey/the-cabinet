# Branch charter: the grave in the ground (#148)

How this branch runs is the `branch-runbook` skill at `.claude/skills/branch-runbook/`. Load it before acting. How one slice of code is written is `docs/agents/feature-flow.md`.

## Goal

The grave reads as a grave in the ground, and everything it swallows falls in where the player can see it, the Undertaker included. The branch covers #148 and its sub-issue #106. It is one step with five slices.

## The branch

- Branch `148-grave-in-the-ground`, checked out in the worktree `.claude/worktrees/148-grave-in-the-ground`. All work happens in the worktree, and the main repo folder stays untouched.
- Every slice commit names its slice number, its words on the follow-along list, and #148. Slices are not tickets.

## The reference

Prototype build 7, on the throwaway branch `prototype/148-grave-fall` at `apps/hungry-grave/src/prototypes/grave-fall/index.html`, played at https://claude.ai/artifact/1aenaz7XAYiHhg9DTGLmH7. Coders learn from it and never copy code out of it. It never goes to `main`.

## Pre-authorizations (Mark's standing yes for the life of this branch, 2026-09-20)

- Commit and push after each slice.
- One CodeRabbit CLI review per code commit.
- Deploys to `hungry-grave.vercel.app` (recipe: `apps/hungry-grave/docs/deploy.md`).
- Edits to the glossary (`apps/hungry-grave/CONTEXT.md`) and the design record on this branch.

## The never-list (needs Mark's yes every time)

- The merge.
- Any change to a ticket or a memory file.
- Anything that costs money.
- Any upload of a run.

## Where the branch's files live

- Handoff: `docs/branch/handoff.md`
- Decision log: `docs/branch/decision-log.md`
- Follow-along list: `docs/branch/follow-along.md`
- Working records of the current step: `docs/branch/records/`
- Design record: `apps/hungry-grave/docs/design/grave-in-the-ground.md`
