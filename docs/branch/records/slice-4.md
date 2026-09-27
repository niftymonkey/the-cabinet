# Slice 4: steering on the glass, for the player and the harness's hand (design record T9, A4, A11)

Follow-along row 4: "Steering works on the screen: a drag keeps the grave exactly under the finger and a held key moves it straight along the screen, wherever the grave is. The test player steers the same way, and it learns to count enemy shots and how long each mob is on screen."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Your scratch folder is `local/tilt-slice-4/` in the worktree; reuse the capture tool in `local/tilt-shots/` (slice 1). All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read on the tree at `517ee0753e`; slices 1 to 3 did not touch these files, but follow the name beside a number that has moved.

## What this slice builds, and why

Since slice 2 the field is drawn through the camera, but steering still works on the ground. A finger's point is turned into a field point by undoing only `fitField`'s flat placement (`toField`, `src/app/screens/game/steering.ts:104-109`, through `screenToField`, `src/app/layout.ts:292-302`), and a held key is a velocity in field units (`KeySteer.command`, `src/input/keys.ts:126-133`). Under the camera both are wrong away from the middle row: a drag near the top moves the grave further than the finger went, and W off the middle column drifts sideways toward the vanishing point, which is the defect Mark met on tilt 5 (T9).

The fix is the prototype's tilt 6, built the way this code is shaped: the two input models keep their logic and work in column units, and the app turns what they return into a ground move through the camera at the grave's drawn point (A11). Slice 1 built the conversion, `stepOnColumn(SCENE_CAMERA, grave, step)`.

When it works, a player on a phone or a keyboard finds:

- A drag moves the grave exactly as far and in exactly the direction the finger moved on the glass, at the top of the screen, in the middle and at the bottom, and a drag that starts in the letterbox band still steers (`GameScreen.ts:584-585`).
- A held W moves the grave straight up the screen with no sideways drift, anywhere on the screen, and every key moves it at one speed on the screen; the speed setting and focus still scale that speed.
- When the grave meets the edge of where it may go, the drag still re-anchors rather than banking travel the grave could not take (`TouchSteer.reanchorIfClamped`, `src/input/touch.ts:197-202`), exactly as today.
- In ground units a key is faster near the top of the screen and slower near the bottom: one column unit across is 1.216 field units at the top row, 1.000 on the middle row, 0.910 at the grave's starting row and 0.849 at the bottom row, and along it is 1.754, 1.186, 0.982 and 0.855 (A11). That is the price of one speed on the glass, and it is what T9 asks for.
- The harness's hand steers on the glass the same way, so the batches that follow measure the game a player steers (the game design gate's finding: a hand at full ground speed would be about 9% faster than a player at the starting row and 15% faster at the bottom).
- The harness can read two figures the field change will move (A4): how many shots mobs fire, and how long each mob is on the screen.
- A replay of a run is unchanged in kind: the tape records the move the sim consumed (`src/tape/tape.ts:266-277`), so a replay never recomputes the camera.

## Parts of the code this slice touches

**`src/app/layout.ts`.** `screenToField` (`:292-302`) is renamed `screenToColumn`, because what it returns is a point in the column the camera draws into and no longer a field point. Its arithmetic does not change. Its readers: `src/app/screens/game/steering.ts:11`, `:108`; the comments at `src/app/screens/game/GameScreen.ts:142`, `:207`, `src/input/touch.ts:75` and `src/app/__tests__/layering.test.ts:229`; and `src/app/__tests__/layout.test.ts:18`, `:187` onward. The layout test's describe block takes the new name; list the moved test names in your note.

**`src/input/touch.ts` and `src/input/steering.ts`.** No logic changes. `TouchSteer` (`touch.ts:82-243`) and `combineSteer` (`steering.ts:15-26`) are handed points in column units, and the grave's point they are handed is where it draws on the column. The type they take is renamed for what it is: a `ColumnPoint`, declared in `src/input/touch.ts` with the same two fields as `FieldPoint` (`src/game/field.ts:19-22`), because a column point typed as a field point is exactly the confusion this slice removes. Their JSDoc (`touch.ts:73-81`, `:14-25` on the slop, `:27-38` on the tolerance) says column units. `KeySteer` (`keys.ts:88-134`) does not change at all: its command was always a direction times a speed, and it now means a speed on the column.

`TARGET_TOLERANCE` (`touch.ts:38`, 1e-6) is kept. Its reader is `apart` (`:66-71`), through `reanchorIfClamped`. The round trip it now absorbs is ground to column to ground, which slice 1's test 8 pins to 1e-9, still far under the tolerance; test 6 below proves a clamped drag still re-anchors and an unclamped one never does.

**`src/app/screens/game/steering.ts`.** The one place that converts:

- `toField` (`:104-109`) becomes the column point of the event, through `screenToColumn`.
- `pointerDown` (`:173-182`) hands `TouchSteer.down` the grave's column point, `groundToColumn(SCENE_CAMERA, grave.x, grave.y)`, rather than its ground point.
- `commandSource` (`:160-170`): the closure is handed the grave's ground point (`CommandSource`, `src/game/command.ts:36`). It asks `combineSteer` with the grave's column point, which returns a move in base-speed units on the column; multiplied by `BASE_SPEED` (`src/game/tuning.ts:18`) that is a step on the column, for a drag (a position error) and a key (a velocity) alike. `stepOnColumn(SCENE_CAMERA, grave, step)` turns it into the ground point it reaches, and the move handed to the sim is that point less the grave's, over `BASE_SPEED`. Where `stepOnColumn` returns null (a step past the horizon, 2135 column units above the middle row), the move is still: that cannot happen from inside the column in one tick, and it is logged once as an anomaly if it ever does, never thrown, because a pointer is a live input.
- `setSlop` (`:228-230`) is unchanged: the slop was always in the column's units.

The conversion is one public function in slice 1's `camera.ts`, added here: `groundMoveOnColumn(camera: Camera, grave: FieldPoint, move: MoveCommand, baseSpeed: number): MoveCommand`, the ground move, in base-speed units, that a move of `move` base-speed units on the column makes from where the grave draws, or a still move where `stepOnColumn` returns null. Both callers below use it, so the player and the harness's hand cannot convert two ways. `camera.ts`'s boundary rule gains `game/command` for the type.

**`src/app/screens/game/GameScreen.ts`.** `onPointerDown` (`:614-622`) keeps handing the run's grave; the conversion is inside `steering.ts`. Nothing else changes.

**`src/dev/bot.ts`, the harness's hand on the glass.** Every policy in `bot.ts` and `src/dev/harnessPolicy.ts` chooses its move by predicting where the grave lands (`graveAfter`, `bot.ts:140-157`, used by `bestMoveToward`, `:277` onward). Two changes, so the hand moves at the player's speed on the glass:

- `graveAfter` predicts through `groundMoveOnColumn` from the grave's drawn point, then the sim's own clamp.
- Every loop that hands a policy's command to `executeTick` converts the move through `groundMoveOnColumn` first: `runPolicy` (`bot.ts:45-56`), and any other you find (the harness's batch loop is one to check, `src/dev/harnessRun.ts`); list each in your note. A policy that asks for a still move or a belch is unchanged.

`src/dev` may reach `dev`, `game` and `tape` (`src/__tests__/boundary.test.ts:76-80`). The rule gains one file of `src/app`, `app/screens/game/camera`, and nothing else of `src/app`: the camera is pure and imports no package (slice 1's rule holds that), and the harness's hand must steer through the same function the player does. Add a test beside the rule that fails if `src/dev` reaches any other file of `src/app`.

**Two new readings, ahead of the batches that need them (A4).** In the form of `src/dev/readings/arrivals.ts` (a state type, an accumulator, `create…`, `observe…`, `…Of`), each wired in `src/dev/readings/readings.ts`, declared in `BATCH_READINGS` (`src/dev/batchReport.ts:510`) and in `READING_COMPARISONS` (`src/dev/compareRuns.ts:325`), or `batchReadingDeclared.test.ts` and `comparisonDeclared.test.ts` go red:

- `mobFireShots`: the shots fired over a run, by mob type and by boss, from the `mobFired` event (`src/game/events.ts:288`). Hits the grave took from fire are already `damageTaken.hits` by source (`src/dev/readings/damageTaken.ts:21`), so this reading does not repeat them.
- `timeOnScreen`: for each mob, the seconds from the tick its top crosses into the field (`hasEntered`, `src/game/mobs.ts:390-392`) to the tick it dies or leaves, reported as the median and the largest per mob type, and a mob still alive at the run's end reported apart rather than counted short.

`READINGS_VERSION` (`src/dev/readingsVersion.ts:249`) does not move: two new readings beside unchanged ones do not bump it, by that file's own comment. Read the comment and confirm.

**Nothing under `src/game` or `src/tape` changes**, and neither does `KeySteer`'s speed setting, the focus factor or the keyboard speed slider.

## What must stay unchanged

- `GOLDEN` and every version: the sim and the digest's scripted moves speak ground moves directly and never go through the conversion.

## Pins

The bot's seed lists (`src/dev/__tests__/bot.test.ts`, `REACHES_VICTORY_FRESH` `:285`, `REACHES_VICTORY_FROM_THE_CEILING` `:345`, `REACHES_VICTORY_MAXED` `:430`, and every other pinned list) are expected to move, because the hand now moves at the player's speed on the glass. Re-measure each, never loosen it, and say from what to what with the seeds' runs read. `REACHES_VICTORY_MAXED` must keep at least one seed; if it would empty, stop and report. The faults stay empty.
- Every rule `TouchSteer` carries: relative drag, the slop and its crossing point, the one steering pointer, no handoff on lift, uncapped (ADR 0011), the re-anchor on clamp.
- Touch wins over keys while steering and they are never summed (`combineSteer`).

## Planned tests

Pin every name as a `test.todo` first. Expected values come from slice 1's pinned numbers, worked by hand. Each test cites the ruling it enforces.

`src/app/screens/game/__tests__/steering.test.ts` (new; it drives `createRunSteering` with fake pointer events of type `touch`, a fake keyboard, and a real run advanced through `executeTick`, so the whole chain from a finger to the grave is under test):

1. a drag near the top of the column moves the grave's drawn point by exactly the finger's travel on the glass, within 1e-6 (T9)
2. a drag on the middle row moves it by exactly the finger's travel, which on the middle row is also the travel in field units
3. a drag near the bottom of the column moves it by exactly the finger's travel
4. a held W moves the grave's drawn point straight up the column, with its drawn x unchanged to 1e-9, from a grave near the left edge low on the field (T9)
5. every held direction moves the grave's drawn point at one speed on the column, `BASE_SPEED` times the speed setting per tick, at the top, the middle and the bottom
6. a drag that pushes the grave into the field's edge re-anchors, so dragging back moves it at once, and a drag that never meets an edge never re-anchors
7. a drag that starts in the letterbox band above the column still steers
8. the move the sim is handed is a ground move: the grave's field point after a tick is where `stepOnColumn` says the step reaches

`src/app/__tests__/layout.test.ts`: the existing `screenToField` tests under the name `screenToColumn`, unchanged in what they assert.

`src/input/__tests__/touch.test.ts`, `steering.test.ts`, `keys.test.ts`: unchanged in what they assert; a test that goes red is a stop and report, because this slice changes no logic there.

`src/app/screens/game/__tests__/camera.test.ts`:

9. a move on the column becomes the ground move that lands where the step on the column says, and a still move stays still

`src/dev/__tests__/bot.test.ts`:

10. the harness's hand moves the grave's drawn point at `BASE_SPEED` per tick on the column, at the top, the middle and the bottom, as a player's held key does (A11)
11. the hand's prediction of where the grave lands is where it lands

`src/__tests__/boundary.test.ts`:

12. `src/dev` reaches the camera and no other file of `src/app`

`src/dev/readings/__tests__/mobFireShots.test.ts` and `timeOnScreen.test.ts`:

13. every shot a mob fires is counted under its type, and a boss's under its boss
14. a run with no fire reports zero for every type and never a missing row
15. a mob's time on screen runs from its top crossing into the field to its death
16. a mob that leaves the field alive is timed to the tick it left
17. a mob alive at the run's end is reported apart

## Verification steps

1. The coder contract's floor. Actor: the agent.
2. **Rendered drag check on the glass.** Actor: the agent. In the built app through `vite preview`, on a 390 by 844 touch viewport (Playwright's touch emulation, so the events arrive as pointer type `touch`), start a pinned run, hold its clock still between moves if you can and otherwise measure between frames, and drag 100 CSS pixels right, then 100 up, starting with the grave near the top, the middle and the bottom of the column. From screenshots before and after each drag, find the grave's drawn centre (the centroid of the hole's darkest pixels) and report how far it moved against how far the finger moved. Within 2 CSS pixels passes. Then hold W for one second from a grave near the left edge low on the field and report the drawn centre's x before and after: within 2 CSS pixels passes. If the clock cannot be held, say which reads you could not obtain.
3. **Console.** Actor: the agent. No error and no warning in the console across the check.
4. **The bot's full stages.** Actor: the agent. `pnpm --filter hungry-grave test` runs `bot.test.ts` from the first tick to won or lost with the invariants on; zero faults, and the moved lists explained.
5. **On-device glass check.** Actor: Mark, after the deploy that closes slice 8. Named here so the main session carries it: a drag at the top and at the bottom of the screen keeps the grave under his finger, and W goes straight up the screen.

Open for the human after this slice: whether a drag and a key feel like they go exactly where he means.

## Done when

Every planned test is green, every renamed test is listed, the agent's verification steps have results in your note, only the bot's lists moved and each move is explained, and the working tree holds the code, the tests and `docs/branch/records/slice-4-note.md`, uncommitted.
