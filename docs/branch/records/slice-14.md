# Slice 14: steering back on the field (design record T9, T10, A11, A27)

**Merged into slices A and C (2026-09-27, Mark's lighter process).** Never dispatch this entry on its own. `docs/branch/records/slice-A.md` carries the keys, the test player and the pins; part 3 of `docs/branch/records/slice-C.md` carries the drag on the play layer, the camera functions' deletion and the `touch.ts` comments, because they need the grave on the play layer.

Follow-along row 14: "Steering plays exactly as it did before the tilt: a held key moves the grave at its old speed in the field, which draws as straight up the screen, and the test player plays in the field again, so its results are back to what they were. A drag still keeps the grave exactly under the finger."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Your scratch folder is `local/tilt-slice-13/` in the worktree; slice 4's instruments are in `local/tilt-slice-4/` (read them, never write there). All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read at `9b125bbc03`; slice 9 changed identifiers only, so follow the name beside a number that has moved.

## What this slice builds, and why

Slice 4 (`328570e623`) made a key and the harness's hand step on the glass through the pinhole camera, so the physics learned the tilt: the grave's speed in the field changed with its row, and every bot and harness list moved. Mark: "nothing should have changed about the physics of the game" (T10). A key is a plain field move again and the harness's hand plays in field units, exactly as before slice 4. A drag stays on the glass, because a finger is on the glass, but it now goes back to the field through the play layer's exact inverse (`columnToPlay`, slice 10), which is tilt 9's drag (prototype `index.html:3515`, `:3570`).

Under the play layer a key still does what T9 asks: field x is column x, so a held W moves the grave straight up the screen at every x.

When it works:

- A held key hands the sim exactly the key's field move, as before slice 4: straight up the screen for W, at the flat game's speed in the field, drawn faster near the bottom as the rows spread.
- A drag moves the grave's drawn point by exactly the finger's travel at the top, the middle and the bottom of the screen, and re-anchors at the field's edge as today.
- The harness's hand, the bot's policies and every harness loop hand the sim their command unchanged.
- Every pinned bot and harness list is back to its value before slice 4, and every seed's run is the same run it was then.

## Parts of the code this slice touches

**`src/input/steering.ts`.** `combineSteer` (`:14-26`) keeps its rule (touch wins while it steers, keys otherwise, never summed) and gains a fourth argument, the conversion the app hands it for the drag: `combineSteer(keys: MoveCommand, touch: TouchSteer, grave: ColumnPoint, dragOnField: (onColumn: MoveCommand) => MoveCommand): MoveCommand`, returning `touch.isSteering() ? dragOnField(drag) : keys`. The keys are never converted. `src/input` stays pure: the conversion arrives as a function.

**`src/app/screens/game/steering.ts`.**

- `graveOnColumn` (`:122-125`): `groundToColumn(SCENE_CAMERA, ...)` becomes `playToColumn(SCENE_PLAY_LAYER, grave.x, grave.y)`.
- `groundMoveFor` (`:134-152`) becomes `dragOnField(steering, grave, onColumn)`: the grave's column point plus `onColumn` times `BASE_SPEED`, taken back through `columnToPlay`, less the grave's field point, over `BASE_SPEED`. Where `columnToPlay` returns null (above the horizon, 1756 column rows above the top) the move is still and is logged once through `pastHorizonLogged` (`:105`), as today.
- `commandSource` (`:196` onward): `combineSteer(keyCommand, steering.touch, graveOnColumn(grave), (onColumn) => dragOnField(steering, grave, onColumn))`. The imports of `groundMoveOnColumn`, `groundToColumn`, `SCENE_CAMERA` and `stepOnColumn` (`:15-20`) go.
- `toColumn` (`:114-119`), `pointerDown`, `pointerMove`, `ColumnPoint` (`src/input/touch.ts`) and `screenToColumn` (`src/app/layout.ts`) stay: a finger is on the glass.

**`src/app/screens/game/camera.ts`.** `stepOnColumn` (`:209-222`) and `groundMoveOnColumn` (`:224-249`) lose their last callers (`steering.ts:140`, `:145`, `bot.ts:40`, `:167`): delete both, their exports (`:257`, `:261`), and their tests (`camera.test.ts:187`, `:204`, `:222`, `:256`). The camera's boundary row regains its form before slice 4: `game/command` was added for `groundMoveOnColumn`'s type (slice 4's note) and goes.

**`src/input/touch.ts`, the JSDoc slice 4 wrote.** Three comments become false and are restated for the play layer: `TARGET_TOLERANCE`'s round trip (`:27-37`, "through the camera, onto the sim's float32 grid ... and back to the column") becomes the round trip through the play layer's inverse, which is exact across and within 1e-9 down (slice 10's test 7), still far under the tolerance; `ColumnPoint`'s "A point on the column the camera draws the field into (tilted view A11)" (`:43`) becomes a point on the column the play layer draws the field into (T10); and `TouchSteer`'s "into a ground move through the camera (tilted view A11)" (`:88`) becomes a field move through the play layer's inverse. Only the comments change.

**`src/dev/bot.ts`, `src/dev/__tests__/bot.test.ts`, `src/dev/__tests__/harnessPolicy.test.ts`, `src/__tests__/endings.test.ts`, `src/game/stage/__tests__/setPiece.test.ts`.** Each returns to its content at `544f0028d4`, the commit before slice 4, which after slice 9 differs from the working tree only by slice 4's change (`git diff 544f0028d4 -- <file>` shows exactly slice 4's hunks for each; check that before restoring). `src/__tests__/boundary.test.ts` is not restored whole: slices 10 to 13 added rules and fences to it, so only slice 4's hunks there are reverted (`git show 328570e623 -- apps/hungry-grave/src/__tests__/boundary.test.ts` shows them). Specifically:

- `bot.ts`: `onTheGlass` (`:39-42`) and its use in `runPolicy` (`:66`) and the other loops go; `graveAfter` (`:159-183`) predicts in field units as before and is no longer exported (`:544-545`); the camera import (`:3`) goes.
- `bot.test.ts`: the uses at `:1162`, `:1551`, `:1599`, the imports at `:57`, `:61`, and the three tests slice 4 added (`:1616`, `:1649`, `:1676`) go; the pins return: `NEVER_PAID` (`:230`) from `[202, 505]` to `[202]`, `PASSES_THE_BANSHEE_FROM_THE_CEILING` (`:421`) from `[]` to `[101, 404]`, with slice 4's comments on them removed.
- `harnessPolicy.test.ts`: `NEVER_PAID_AT_THE_BIRTHRIGHT` (`:559`) from `[]` to `[202, 404]`, `STOOD_BUT_NEVER_REACHED` (`:611`) from `[202, 303]` to `[]`, `ENDS_ABOVE_THE_BIRTHRIGHT` (`:705`) from `[101, 404, 505]` to `[303]`, with slice 4's added comments and its three renamed harness test names back to their names at `544f0028d4`.
- `endings.test.ts` (`:19`, `:337`) and `setPiece.test.ts` (`:20`, `:227`): `onTheGlass` goes.
- `boundary.test.ts`, slice 4's hunks only: the `dev` row (`:76-82`) reaches `dev`, `game` and `tape` again, the camera row loses `game/command`, and the test `'src/dev reaches the camera and no other file of src/app'` (`:396`) returns to its form at `544f0028d4`. Every rule and fence slices 10 to 13 added stays.

**Kept (A27):** `src/dev/readings/mobFireShots.ts`, `timeOnScreen.ts`, their tests, and their wiring in `readings.ts`, `batchReport.ts` and `compareRuns.ts`. Do not restore those files.

## What must stay unchanged

- Everything under `src/game` (tests aside, as named above) and `src/tape`. `GOLDEN` and every version hold.
- Every rule `TouchSteer` carries: relative drag, the slop, the one steering pointer, no handoff on lift, uncapped (ADR 0011), the re-anchor on clamp. `KeySteer` does not change at all.

## Pins

The bot's and the harness's lists return to their values at `544f0028d4`, given above. That is a prediction, never an assumption: measure it. Every list is re-measured by running the suite and by running slice 4's probe (`local/tilt-slice-4/slice4-lists.probe.ts`, copied into `local/tilt-slice-13/` under a name carrying the slice) on the working tree, and the per-seed results are compared field by field with `local/tilt-slice-4/slice4-lists-before.json`, which slice 4 measured on the tree before it. Every seed's ticks, ending, kills, offers, swallows, sections and faults must be identical. A difference is a stop and report, with the seed and the field.

## Planned tests

Pin every name as a `test.todo` first. Each test cites the ruling it enforces.

`src/app/screens/game/__tests__/steering.test.ts` (slice 4's file; it drives `createRunSteering` with fake pointer events of type `touch`, a fake keyboard and a real run):

1. a drag near the top of the column moves the grave's drawn point by exactly the finger's travel on the glass, within 1e-6 (T9)
2. a drag on the middle row moves it by exactly the finger's travel
3. a drag near the bottom of the column moves it by exactly the finger's travel
4. a held W hands the sim exactly the key's field move, and the grave's drawn x does not change, from a grave near the left edge low on the field (T9, T10)
5. every held direction moves the grave `BASE_SPEED` times the speed setting per tick in field units, at the top, the middle and the bottom (T10)
6. a drag that pushes the grave into the field's edge re-anchors, and one that never meets an edge never does
7. a drag that starts in the letterbox band above the column still steers
8. a drag that has settled on its target warns about nothing
9. a drag's move lands the grave's field point where the play layer's inverse of the finger's target says

`src/input/__tests__/steering.test.ts`:

10. a drag's move goes through the conversion it is handed, and a key's move never does

**Existing tests whose premise this changes.** In `steering.test.ts` (app): `"a held W moves the grave's drawn point straight up the column, its drawn x unchanged, from near the left edge low on the field"` (`:183`) becomes test 4; `"every held direction moves the grave's drawn point at one speed on the column, BASE_SPEED times the speed setting per tick, at the top, the middle and the bottom"` (`:201`) becomes test 5; `"the move the sim is handed is a ground move: the grave's field point after a tick is where stepOnColumn says the step reaches"` (`:292`) becomes test 9. The tests at `:136`, `:150`, `:170`, `:237`, `:263` and `:274` keep their promises (tests 1 to 3 and 6 to 8). In `src/input/__tests__/steering.test.ts` every existing call to `combineSteer` gains an identity conversion as its fourth argument and keeps its assertion; list each. The tests deleted and restored with the files above are listed in your note by name.

Any other test that goes red is a stop and report.

## Verification steps

1. The coder contract's floor. Actor: the agent.
2. **The pins, measured**, as "Pins" says. Actor: the agent.
3. **Nothing on the sim's path differs from before slice 4.** `git diff 544f0028d4 -- apps/hungry-grave/src/dev apps/hungry-grave/src/game apps/hungry-grave/src/tape apps/hungry-grave/src/__tests__/endings.test.ts` shows only the two readings, their tests and their wiring. Actor: the agent.
4. **Rendered drag and key check.** Slice 4's instruments (`local/tilt-slice-4/slice4-drag*.mjs`), copied into `local/tilt-slice-13/`: on a 390 by 844 touch viewport, drag 100 CSS pixels right and then up with the grave near the top, the middle and the bottom; the drawn centre moves within 2 CSS pixels of the finger. Hold W for one second from a grave near the left edge low on the field: the drawn x moves under 1 CSS pixel. Actor: the agent.
5. **Console.** No error and no warning. Actor: the agent.
6. **On-device check.** Actor: Mark, after slice 16's deploy: a drag at the top and at the bottom of the screen keeps the grave under his finger, and W goes straight up.

## Done when

Every planned test is green, the pins are measured identical to before slice 4, every verification step the agent owns has a result in your note, and the working tree holds the code, the tests and `docs/branch/records/slice-14-note.md`, uncommitted.
