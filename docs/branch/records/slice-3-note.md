# Slice 3 coder note

## 1. What changed

- `graveProjection.ts`: `GraveDark`, `GraveView` (`nadirX`, `nadirY` replace `cameraBehind`), and `belowGround` converges on the nadir.
- `graveDrawingValues.ts`: `GRAVE_DARK` replaces `GRAVE_VIEW`, and `STANCE_REBAKE_STEP` is 0.5.
- `graveWalls.ts`: a `WallFace` carries its view, and `wallFaces`, `lightAt`, `paintCornerEdges` and `paintPit` take it.
- `fall.ts`: `fallAt` and `drawnBetween` take the view.
- `GraveRenderer.ts`: `holeViewOver`, the `holeView()` power, the stance re-bake, and `sync` records the place.
- `FallRenderer.ts`: `FallRendererPowers`. `endingScene.ts`: `endingSceneAt` takes the view. `EndingSceneRenderer.ts` takes it at `begin`.
- GameScreen, ReplayScreen and FrameBudgetScreen hand in the power.

Rulings applied: 1 (both GraveRenderer tests), 2 (FrameBudgetScreen), 3 (build 7's view handed to all of `graveProjection.test`, `graveWalls.test`, `fall.test`, `graveLip.test:82`, `endingScene.test`, `FallRenderer.test:40`; `EndingSceneRenderer.test:44` needed no change). Open items applied: the live view before the first bake, and `begin` builds the view.

## 2. Verification results

- The 12 planned tests plus the ruled replacement: red on their own assertion (stub, or a scratch mutant for 2 to 6), then green.
- Names: 2666 to 2678. One lost, replaced as ruled.
- Typecheck, lint, test (2667 passed), build and verify: exit 0, with slice 1's two Rollup warnings only.
- 16 shots read. Middle column: flat and dark, a far band with black below, matching the prototype at 27. Sides: measured, the side away from the middle shows and the other does not. Fall and ending read correctly.
- Frame budget: 0.97 / 4.80 ms against 0.91 / 4.52 ms, which is noise.
- Sweep: 2.1 bakes/s at a headless 3 fps, frame mean +2.4%, pit paint 0.9 ms per bake. Projected at 60 fps: about 20 bakes/s at size 27.
- Console: only the AudioContext and ReadPixels warnings.

## 3. Where the entry was wrong about the code

Items 1 to 3 of the first stop, as ruled.

## 4. Decisions made

A face carries its view instead of every painter taking a parameter. To reverse, thread `view` through each painter.

## 5. Open items

- Finding: `STANCE_REBAKE_STEP` (0.5) equals the opening's half-width (aspect 2). A stale bake can show one side wall on a centred grave: at 19143, left 15 px, right under 5.
- Near the top the far wall fills the opening.
- For Mark: the look at start and big sizes, and the fall.
- Stray slice-2 watcher shell (pid 2103742), left alone.
- Servers stopped.

## 6. Stuck

None.

## Fixes after landing review

**CodeRabbit, the ending's view: fixed.** The finding was live: `begin` recomputed `holeViewOver(grave)`. `EndingSceneRenderer` now takes `EndingSceneRendererPowers { holeView }` at construction, as `FallRenderer` does, and reads it on every `show`. GameScreen and ReplayScreen hand it `this.grave.holeView()`. New test "the falling Undertaker is drawn with the view the walls on screen were cut with, read from the screen each frame", red first (expected x 0.6826, received 0), then green. The change turned `replayLifecycle.test` "the Undertaker's death dims the field on a replay" red: a replay can open on the death before the grave was ever synced. ReplayScreen now syncs the grave before it hands out the frame's events.

**The stance step: measured, not changed, stuck.** On a centred grave, a stale nadirX of e draws the side walls `2 e D/(H+D)` half-lengths apart. At the ceiling (H 17, D 2.4) on the nearest row it can stand on (y 692.5), in CSS pixels of the 390-wide column: 7.04 px at 0.5, 0.986 px at 0.07, so the largest step is 0.071. Cost at 0.07: about 12 bakes per second over the seed 1000 run (2.1 at 0.5), 60 in its busiest second. A whole bake takes 1.5 to 2.3 ms (headless desktop), and pit paint alone takes 0.34 to 0.54 ms. That averages about 0.4 ms per frame, and 1.5 to 2.3 ms per frame during a sustained drag. The step did not land because it turned "a size that has not changed does not repaint" red. The stance is in half-lengths, so growth moves it (0.3 of growth at size 27 moves the height 0.467), and at 0.07 growth re-bakes past `HOLE_REBUILD_STEP`. Alternative: compare the grave's move in field units, with a 4.75 unit step (the same 1 px bound at every size), which costs 7.2 bakes per second of play (31 in the busiest second) and leaves growth to the size step. The ready asymmetry test is `local/tilt-slice-3-fix/slice3fix-GraveRenderer.test.prepared.ts`. Design record A10 still says half a half-length.

**Verification.** Names 2678 to 2679, none lost. Typecheck, test (2668 passed) and verify: exit 0. Shots: `local/tilt-slice-3-fix/shots/slice3fix-crop-fall-2250ms.png` (the Undertaker inside the opening, under the lip, against the walls), `local/tilt-slice-3-fix/shots/slice3fix-crop-centred-19143.png` (left wall only, the finding still standing). Console: AudioContext only. Servers stopped.

**The stance step, after the ruling: landed.** The hole now re-bakes when the grave moves more than `STANCE_REBAKE_STEP`, 4.75 field units across or along, from where it was baked (`GraveRenderer`'s `Baked` records the spot). Growth is left to `HOLE_REBUILD_STEP`. The constant carries its derivation in its JSDoc; working it out in code would pull the camera and the sim's tuning into the data table. New test "a centred grave's two side walls, cut from the stalest bake the renderer keeps, differ by under one drawn pixel at the ceiling on a phone" asks the renderer for its stalest kept bake, so it does not depend on the step's units. It was red at the old step (7.04 px), then green. As ruled, test 11 is restated for the new step and renamed ("moving the grave less than a stance step does not bake the hole again, and moving it more does"), and test 12's sub-step moves became half a step. Design record A10 and the values line are updated, and a fast-drag stutter question is added to "For Mark's next play". Names 2678 to 2680, one lost (test 11's rename). Typecheck and verify: exit 0, 2669 passed. Shot `local/tilt-slice-3-fix/shots2/slice3fix-crop-centred-19143-fixed.png`: the two side walls are thin and match. Console: AudioContext only. Nothing running.
