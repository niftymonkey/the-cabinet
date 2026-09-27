# Slice A: steering and the test player back in the field (design record T9, T10, A11, A27)

Follow-along row A: "Steering plays exactly as it did before the tilt: a held key moves the grave at its old speed, and the test player plays as it did, so its results are back to what they were. A drag still keeps the grave under the finger."

Carries the old slice 14 entry, less what depends on the play layer, which moves to slice C (named below). It does not wait on Mark.

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Your scratch folder is `local/tilt-slice-A/` in the worktree; slice 4's instruments are in `local/tilt-slice-4/` (read them, never write there). All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read at `9b125bbc03`; slice 9 changed identifiers only, so follow the name beside a number that has moved.

## What this slice builds, and why

Slice 4 (`328570e623`) made a key and the harness's hand step on the glass through the pinhole camera, so the physics learned the tilt: the grave's speed in the field changed with its row, and every bot and harness list moved. Mark: "nothing should have changed about the physics of the game" (T10). A key is a plain field move again and the harness's hand plays in field units, exactly as before slice 4.

A drag stays on the glass, because a finger is on the glass. In this slice the grave is still drawn by the pinhole camera (slices 2 and 3), so the drag keeps slice 4's camera conversion (`groundMoveOnColumn`), which is exactly right for a grave drawn there. Slice C, which moves the grave onto the play layer, switches the drag to the play layer's inverse in the same commit, so the drag is never out of step with where the grave draws.

Between this slice and slice C, a held W is a plain field move while the grave is still drawn by the pinhole, so off the middle column its drawn point drifts toward the middle as it climbs (the tilt 5 look). Nothing is deployed in between; slice C's rendered check is where W is checked straight on the screen.

When it works:

- A held key hands the sim exactly the key's field move, as before slice 4.
- A drag moves the grave's drawn point by exactly the finger's travel at the top, the middle and the bottom of the screen, and re-anchors at the field's edge as today.
- The harness's hand, the bot's policies and every harness loop hand the sim their command unchanged.
- Every pinned bot and harness list is back to its value before slice 4, and every seed's run is the same run it was then.

## Parts of the code this slice touches

**`src/input/steering.ts`.** `combineSteer` (`:14-26`) keeps its rule (touch wins while it steers, keys otherwise, never summed) and gains a fourth argument, the conversion the app hands it for the drag: `combineSteer(keys: MoveCommand, touch: TouchSteer, grave: ColumnPoint, dragOnField: (onColumn: MoveCommand) => MoveCommand): MoveCommand`, returning `touch.isSteering() ? dragOnField(drag) : keys`. The keys are never converted. `src/input` stays pure: the conversion arrives as a function.

**`src/app/screens/game/steering.ts`.**

- `groundMoveFor` (`:134-152`) is renamed `dragOnField` and keeps its body: the camera conversion `groundMoveOnColumn` and the once-logged horizon anomaly (`pastHorizonLogged`, `:105`). Slice C changes its body.
- `commandSource` (`:196` onward): `combineSteer(keyCommand, steering.touch, graveOnColumn(grave), (onColumn) => dragOnField(steering, grave, onColumn))`. The keys are no longer converted.
- `graveOnColumn` (`:122-125`), `toColumn` (`:114-119`), `pointerDown`, `pointerMove`, `ColumnPoint` (`src/input/touch.ts`) and `screenToColumn` (`src/app/layout.ts`) stay.

**`src/dev/bot.ts`, `src/dev/__tests__/bot.test.ts`, `src/dev/__tests__/harnessPolicy.test.ts`, `src/__tests__/endings.test.ts`, `src/game/stage/__tests__/setPiece.test.ts`.** Each returns to its content at `544f0028d4`, the commit before slice 4, which after slice 9 differs from the working tree only by slice 4's change (`git diff 544f0028d4 -- <file>` shows exactly slice 4's hunks for each; check that before restoring). Specifically:

- `bot.ts`: `onTheGlass` (`:39-42`) and its use in `runPolicy` (`:66`) and the other loops go; `graveAfter` (`:159-183`) predicts in field units as before and is no longer exported (`:544-545`); the camera import (`:3`) goes.
- `bot.test.ts`: the uses at `:1162`, `:1551`, `:1599`, the imports at `:57`, `:61`, and the three tests slice 4 added (`:1616`, `:1649`, `:1676`) go; the pins return: `NEVER_PAID` (`:230`) from `[202, 505]` to `[202]`, `PASSES_THE_BANSHEE_FROM_THE_CEILING` (`:421`) from `[]` to `[101, 404]`, with slice 4's comments on them removed.
- `harnessPolicy.test.ts`: `NEVER_PAID_AT_THE_BIRTHRIGHT` (`:559`) from `[]` to `[202, 404]`, `STOOD_BUT_NEVER_REACHED` (`:611`) from `[202, 303]` to `[]`, `ENDS_ABOVE_THE_BIRTHRIGHT` (`:705`) from `[101, 404, 505]` to `[303]`, with slice 4's added comments and its three renamed harness test names back to their names at `544f0028d4`.
- `endings.test.ts` (`:19`, `:337`) and `setPiece.test.ts` (`:20`, `:227`): `onTheGlass` goes.

**`src/__tests__/boundary.test.ts`, the `dev` hunks of slice 4 only** (`git show 328570e623 -- apps/hungry-grave/src/__tests__/boundary.test.ts` shows them): the `dev` row (`:76-82`) reaches `dev`, `game` and `tape` again, and the test `'src/dev reaches the camera and no other file of src/app'` (`:396`) returns to its form at `544f0028d4`. The camera row's `game/command` stays until slice C, because `groundMoveOnColumn` still reads it. Every other rule stays.

**Kept (A27):** `src/dev/readings/mobFireShots.ts`, `timeOnScreen.ts`, their tests, and their wiring in `readings.ts`, `batchReport.ts` and `compareRuns.ts`. Do not restore those files.

**Moved to slice C** (they need the play layer): the drag through `columnToPlay`, deleting `stepOnColumn` and `groundMoveOnColumn` from `camera.ts` with their tests, the camera row's `game/command`, and the `src/input/touch.ts` JSDoc slice 4 wrote.

## What must stay unchanged

- Everything under `src/game` (tests aside, as named above) and `src/tape`. `GOLDEN` and every version hold.
- Every rule `TouchSteer` carries: relative drag, the slop, the one steering pointer, no handoff on lift, uncapped (ADR 0011), the re-anchor on clamp. `KeySteer` does not change at all.

## Pins

The bot's and the harness's lists return to their values at `544f0028d4`, given above. That is a prediction, never an assumption: measure it. Every list is re-measured by running the suite and by running slice 4's probe (`local/tilt-slice-4/slice4-lists.probe.ts`, copied into `local/tilt-slice-A/` under a name carrying the slice) on the working tree, and the per-seed results are compared field by field with `local/tilt-slice-4/slice4-lists-before.json`, which slice 4 measured on the tree before it. Every seed's ticks, ending, kills, offers, swallows, sections and faults must be identical. A difference is a stop and report, with the seed and the field.

## Planned tests

Pin every name as a `test.todo` first. Each test cites the ruling it enforces.

`src/app/screens/game/__tests__/steering.test.ts` (slice 4's file; it drives `createRunSteering` with fake pointer events of type `touch`, a fake keyboard and a real run):

1. a drag near the top of the column moves the grave's drawn point by exactly the finger's travel on the glass, within 1e-6 (T9)
2. a drag on the middle row moves it by exactly the finger's travel
3. a drag near the bottom of the column moves it by exactly the finger's travel
4. a held W hands the sim exactly the key's field move, from a grave near the left edge low on the field (T10)
5. every held direction moves the grave `BASE_SPEED` times the speed setting per tick in field units, at the top, the middle and the bottom (T10)
6. a drag that pushes the grave into the field's edge re-anchors, and one that never meets an edge never does
7. a drag that starts in the letterbox band above the column still steers
8. a drag that has settled on its target warns about nothing

`src/input/__tests__/steering.test.ts`:

9. a drag's move goes through the conversion it is handed, and a key's move never does

**Existing tests whose premise this changes.** In `steering.test.ts` (app): `"a held W moves the grave's drawn point straight up the column, its drawn x unchanged, from near the left edge low on the field"` (`:183`) becomes test 4 (its drawn-x promise returns in slice C, on the play layer); `"every held direction moves the grave's drawn point at one speed on the column, BASE_SPEED times the speed setting per tick, at the top, the middle and the bottom"` (`:201`) becomes test 5. The tests at `:136`, `:150`, `:170`, `:237`, `:263`, `:274` and `:292` keep their promises (tests 1 to 3 and 6 to 8; `:292` stays until slice C replaces it). In `src/input/__tests__/steering.test.ts` every existing call to `combineSteer` gains an identity conversion as its fourth argument and keeps its assertion. The tests deleted and restored with the files above are listed in your note by name.

## Verification steps

1. The coder contract's floor. Actor: the agent.
2. **The pins, measured**, as "Pins" says. Actor: the agent.
3. **Nothing on the sim's path differs from before slice 4.** `git diff 544f0028d4 -- apps/hungry-grave/src/dev apps/hungry-grave/src/game apps/hungry-grave/src/tape apps/hungry-grave/src/__tests__/endings.test.ts` shows only the two readings, their tests and their wiring. Actor: the agent.
4. **Rendered drag check.** Slice 4's instruments (`local/tilt-slice-4/slice4-drag*.mjs`), copied into `local/tilt-slice-A/`: on a 390 by 844 touch viewport, drag 100 CSS pixels right and then up with the grave near the top, the middle and the bottom; the drawn centre moves within 2 CSS pixels of the finger. Actor: the agent.
5. **Console.** No error and no warning. Actor: the agent.

## Done when

Every planned test is green, the pins are measured identical to before slice 4, every verification step has a result in your note, and the working tree holds the code, the tests and `docs/branch/records/slice-A-note.md`, uncommitted.
