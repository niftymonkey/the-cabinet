# Slice 6: the field's width and height renamed for what they are (design record A3)

Follow-along row 6: "A tidy-up the player never sees: the numbers that set speeds and sizes get a name that says so, so the next step can move the field's edges without touching them."

Read `docs/agents/feature-flow.md`: a rename has no behaviour, so it skips the flow's steps and runs the standing checks alone, and this entry is its plan. Read `docs/branch/records/coder-contract.md`; it binds this slice. Your scratch folder is `local/tilt-slice-6/` in the worktree. Paths are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`.

## What this slice does, and why

`FIELD_WIDTH` and `FIELD_HEIGHT` (`src/game/field.ts:10-11`) do two jobs today: they are the field's edges, and they are the scale every speed and size in the rules is measured against (the base speed, the freshness, the size ceiling, the belch's radius; `src/game/tuning.ts:18`, `:37`, `:53`, `src/game/belch.ts:38`). Slice 7 moves the edges to the trapezoid and keeps the scale (A3). Doing the rename first, alone, makes slice 7's diff only the behaviour, and lets this slice prove it changed nothing.

The tech gate asked for this split. It is split on whole files where it can be: this slice renames and changes nothing else.

## The change

- `FIELD_WIDTH` becomes `VIEW_WIDTH` and `FIELD_HEIGHT` becomes `VIEW_HEIGHT`, same values, everywhere in `src` and `scripts`: 120 lines across 30 production files and 239 lines in tests at `517ee0753e` (slices 1 to 4 may have added some; grep again).
- `field.ts`'s JSDoc on them (`:4-9`) says what they are after slice 7: the column the camera draws into, in field units where one field unit draws as one column unit, which is the field's middle row; the scale every speed and size in the rules is measured against (ADR 0003's numbers). Until slice 7 they are also still the edges, and the JSDoc says so in one line, which slice 7 removes.
- `src/game/field.ts`'s file header (`:1-2`) is left for slice 7, which changes what the field is.
- Nothing else: no value, no comment beyond the two above, no test name.

## Verification steps (you are the actor for every one)

1. The coder contract's floor, less the planned tests (there are none).
2. Test names before and after are identical: no name lost, moved or added.
3. A projection proves nothing but the identifier changed: the TypeScript scanner's token stream of every changed file, comments stripped, with `VIEW_WIDTH` and `VIEW_HEIGHT` mapped back to the old names, is identical before and after (`docs/agents/lessons.md`, "Proving a refactor changed nothing"). Report the file count and the result.
4. `GOLDEN`, the bot's seed lists and every version hold, which the suite asserts.

## Done when

Every standing check passes, the three proofs above are in your note, and the working tree holds the rename and `docs/branch/records/slice-6-note.md`, uncommitted.
