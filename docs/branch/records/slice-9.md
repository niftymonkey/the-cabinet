# Slice 9: the rename undone (design record A26)

Follow-along row 9: "A tidy-up the player never sees: slice 6's new names for the field's size go back to the old ones, because the field keeps its shape."

Read `docs/agents/feature-flow.md`: a rename has no behaviour, so it skips the flow's steps and runs the standing checks alone, and this entry is its plan. Read `docs/branch/records/coder-contract.md`; it binds this slice. Your scratch folder is `local/tilt-slice-9/` in the worktree. Paths are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. The tree you start from is `9b125bbc03`.

## What this slice does, and why

Slice 6 (`7fac05ff88`) renamed `FIELD_WIDTH` and `FIELD_HEIGHT` to `VIEW_WIDTH` and `VIEW_HEIGHT` in 75 files under `src` (its note, `docs/branch/records/slice-6-note.md`), so that once the field became the trapezoid no reader of them would mean an edge. Mark's correction (T10) keeps the field the 540 by 760 rectangle, so the two are its edges and its scale again, and the glossary's word is Field and says to avoid "viewport" (`CONTEXT.md:123`). The rename is undone.

`7fac05ff88` touched 75 files under `apps/hungry-grave` and three under `docs/branch` (`follow-along.md`, `handoff.md`, `records/slice-6-note.md`). The branch's docs have moved on since, so the inverse of the whole commit refuses; scoped to `apps/hungry-grave` it applies cleanly (`git diff 7fac05ff88 7fac05ff88^ -- apps/hungry-grave | git apply --check` passes at `9b125bbc03`), because no commit after it touches that folder. The docs are not reverted: they record what happened.

## The change

- Apply the inverse of `7fac05ff88`, scoped to the app, to the working tree without committing: `git diff 7fac05ff88 7fac05ff88^ -- apps/hungry-grave | git apply` from the worktree root. It restores `FIELD_WIDTH` and `FIELD_HEIGHT` in every file slice 6 touched, the JSDoc on the two constants in `src/game/field.ts` to its text at `7fac05ff88^` (the text before slice 6), the two lines Prettier collapsed (an import in `src/app/screens/game/camera.ts` and a line in `powerUpLedger.test.ts`), and the comment lines that named the constants.
- Nothing else. No value, no other comment, no test name.
- If `git apply` refuses any hunk, that is a stop and report: it means a file changed after `7fac05ff88` that this entry says did not.

## Verification steps (you are the actor for every one)

1. The coder contract's floor, less the planned tests (there are none).
2. Test names before and after are identical: no name lost, moved or added.
3. The working tree's diff against `7fac05ff88^` for every file `7fac05ff88` touched is empty (`git diff 7fac05ff88^ -- <each file>`, the list from `git diff --name-only 7fac05ff88^ 7fac05ff88 -- apps/hungry-grave`, 75 files). Report the file count and the result. This is the whole proof: those files are byte for byte what they were before slice 6.
4. `grep -rn "VIEW_WIDTH\|VIEW_HEIGHT" apps/hungry-grave` finds nothing.
5. `GOLDEN`, the bot's seed lists and every version hold, which the suite asserts.

## Done when

Every standing check passes, the proofs above are in your note, and the working tree holds the revert and `docs/branch/records/slice-9-note.md`, uncommitted.
