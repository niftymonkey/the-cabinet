# Slice 3: the hole cut by the same camera (design record T4, A6, A10, "What this replaces")

Follow-along row 3: "The grave's hole is cut by the same tilted camera as everything else, so it reads as a flat dark opening in the ground, the way Mark chose. Its thin walls shift a little as the grave moves about the screen."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Load the `pixijs-skills:pixijs` skill before you touch Pixi code. Your scratch folder is `local/tilt-slice-3/` in the worktree; reuse the capture tool in `local/tilt-shots/` (slice 1). All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read on the tree at `517ee0753e` and slice 2 may have moved some; follow the name beside a number that has moved.

## What this slice builds, and why

Mark chose the shared hole camera: the hole is cut by the one scene camera, so it is a flat dark opening (T4). Today the hole is cut by its own camera, 4.95 half-lengths up and 1.07 behind the grave (`GRAVE_VIEW`, `src/app/screens/game/graveDrawingValues.ts:25-30`), about 12.2 degrees off straight down, and slice 2 left it that way. This slice cuts it with the scene camera: 1147.5 field units up at 32.5 degrees, standing wherever that camera stands over the grave (A6). The camera is off the starting size, so over a grave of size s it stands 1147.5 / s half-lengths up, and its foot on the ground is (270, 1111.04), below the column, so it stands behind every grave and to the side of any grave off the middle column.

When it works, a player sees:

- The grave's opening as a dark hole whose walls are thin: at the starting size a wall's deepest drawn point sits at 0.947 of the rim's distance from the point the walls converge on, against 0.673 in build 7, so a wall closes in by about a twentieth of that distance rather than about a third.
- The far wall showing, and with the grave off the middle column, the wall on the side away from the middle showing more than the one on the side toward it, changing smoothly as the grave moves.
- A swallowed body tipping and falling into that same hole, its fall converging where the walls converge.
- The Undertaker going into the same hole at the end.
- No near wall and no floor, exactly as today (R4).

## What this replaces, and what stands

Read "What this replaces, and what stood" in the design record. What changes: where the hole's camera stands and how high. What stands, untouched: the one projection (`belowGround`, `src/app/screens/game/graveProjection.ts:34-45`), `darkDepth` 2.4 and `darkFalloff` 2.6, `lightAtDepth` (`:55-58`), the three faces far, right and left and their order, every painter's colours, counts, seeds and inline numbers (`graveWalls.ts`, `graveLip.ts`, `graveMouth.ts` are line-for-line ports, R7), the mouth's clip (`graveWalls.ts:433`), and the bake's padding.

## Parts of the code this slice touches

**`src/app/screens/game/graveProjection.ts`.** `GraveView` (`:11-16`) loses `cameraBehind` and gains `nadirX` and `nadirY`, the ground point straight under the camera from the grave's centre, in half-lengths. `belowGround` (`:34-45`) converges on that point: `x = nadirX + (x - nadirX) * shrink`, `y = nadirY + (y - nadirY) * shrink`, the tilted prototype's `belowGround` (`index.html:776-784`) in the half-length units this module already works in. With `nadirX` 0 and `nadirY` 1.07 it must return exactly what it returns today; test 1 holds that. Its boundary rule (`src/__tests__/boundary.test.ts`, the rule for `screens/game/graveProjection.ts`) does not change: it still reaches nothing.

**`src/app/screens/game/graveDrawingValues.ts`.** `GRAVE_VIEW` (`:25-30`) stops carrying a camera: it becomes the dark alone, `{ darkDepth: 2.4, darkFalloff: 2.6 }`, under a name that says so (`GRAVE_DARK`), with its JSDoc saying the camera is the scene's (T4) and the dark is still R4's. A new data row, `STANCE_REBAKE_STEP`, 0.5 half-lengths, the prototype's own threshold (`keepHoleCurrent`, `index.html:2999-3004`), with its JSDoc (A10). Readers of `GRAVE_VIEW` today, every one of which changes to take the view it is handed:

- `graveWalls.ts:42` (`belowGroundAt`), `:48` (`lightAt`), `:93`, `:224-225`, `:334`, `:338`, `:401-407`.
- `fall.ts:96-97` (`FALL_GRAVITY` reads only `darkDepth`, which stays in `GRAVE_DARK`), `:252-265` (`drawnBetween`).

**How the view reaches the painters.** A grave's view is `{ ...stanceOverGrave(SCENE_CAMERA, grave), darkDepth, darkFalloff }` (slice 1's `stanceOverGrave`). `paintPit` (`graveWalls.ts:424` onward) takes it as an argument and threads it to `belowGroundAt` and `lightAt`, in place of the module-level `GRAVE_VIEW`; `paintLip` does not read the camera (`graveLip.ts` never imports it) and does not change. `fallAt` (`fall.ts:296-307`) and `drawnBetween` (`:245-266`) take the view as an argument. `fall.ts`'s boundary rule (`boundary.test.ts`, the rule for `screens/game/fall.ts`) keeps its reach list: the view arrives as an argument, so `fall.ts` never imports the camera.

**`src/app/screens/game/GraveRenderer.ts`.** The bake records the stance it was cut from (`Baked`, `:30-34`), and `stillFits` (`:191-196`) also asks whether the live stance has moved more than `STANCE_REBAKE_STEP` from it, in either half-length coordinate or the height. `rebuildHole` (`:210-230`) paints the pit with the grave's live view. The renderer's `sync` (`:145-150`) records the grave's position as well as its size, since the stance needs both. The grave's view used for the last bake is readable by the fall's renderer through a narrow power: the fall is drawn with the same view the walls were cut with, so a body goes down between the walls it is drawn against. Name that power in the renderer's public interface and have `GameScreen.ts` and `ReplayScreen.ts` hand it to the fall's renderer at construction, the one hop declared where both are built.

**`src/app/screens/game/FallRenderer.ts`.** `sync` (`:127-141`) calls `fallAt` with the view it was handed.

**`src/app/screens/game/endingScene.ts` and `EndingSceneRenderer.ts`.** `endingScene.ts:217` calls `fallAt`; it takes the view the same way, from the scene's grave.

## What must stay unchanged

- Everything under `src/game`, `src/input`, `src/tape` and `src/dev`. No pin moves.
- Every painter's body except the lines that read the camera; every colour, count, seed and inline number; the three faces and no near wall; the lip.
- Slice 2's placement of the grave, the falls and everything else on the field.

## Planned tests

Pin every name as a `test.todo` first. Expected values are worked by hand from the design record's table and slice 1's pinned numbers. Each test cites the ruling it enforces.

`src/app/screens/game/__tests__/graveProjection.test.ts`:

1. with the camera straight behind at 1.07 half-lengths, a point below the ground draws exactly where build 7's projection draws it (the old view as a nadir, so the move to a nadir changes nothing on its own)
2. a point below the ground converges on the camera's nadir, sideways as well as along
3. a point at depth zero draws where it lies, whatever the nadir

`src/app/screens/game/__tests__/graveWalls.test.ts`:

4. over the starting grave at (270, 608), the far wall's deepest drawn point sits at 0.946548 of the rim's own distance from the nadir (T4, A6)
5. a grave to the left of the middle shows more of its left wall than its right, and a grave to the right the reverse
6. a grave on the middle column shows its two side walls mirror images, as R4 promises
7. no near wall is drawn, and the mouth still clips every face

`src/app/screens/game/__tests__/fall.test.ts`:

8. a falling body converges on the nadir of the view it is handed
9. with the old view handed in, a fall draws exactly where it drew before (every existing fall test's promise, now with the view as an argument)

`src/app/screens/game/__tests__/GraveRenderer.test.ts`:

10. the hole is cut by the scene camera: over a grave of size 48 the view's camera height is 23.90625 half-lengths, never the scene's 42.5 (A6)
11. moving the grave less than half a half-length of stance does not bake the hole again, and moving it more does (A10)
12. the fall is handed the view the walls were last cut with

**Existing tests whose premise this changes.** Tests in `graveWalls.test.ts` and `fall.test.ts` that call the painters or `fallAt` without a view, or that assert the build 7 walls' shares, assert the old camera, which T4 replaces. Each is kept with its promise and handed the old view explicitly (build 7's `{ cameraHeight: 4.95, nadirX: 0, nadirY: 1.07 }`) where its promise is the painter's own behaviour; where its promise is build 7's shares on screen, it is replaced by tests 4 to 6. List every such test in your note, with which of the two it got. Any other test that goes red is a stop and report.

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. **Rendered check.** With `local/tilt-shots/`, shoot the grave at the starting size on the middle column, near each side, near the top and near the bottom, and at a large size (a maxed tape late in a run). Read every shot and say: the hole reads as a flat dark opening; the far wall shows; the side walls change with the grave's place as test 5 says; nothing shows through the near lip. Shoot a swallow's fall mid-drop (hold the frame) and say where the body is against the walls.
2. **Against the prototype.** Shoot the tilted prototype at tilt 32.5, camera 42.5, hole camera `shared`, at the starting size, on the same viewport, and put it beside the game's shot of the same size. Say where they differ. At sizes other than 27 the build's walls are deliberately deeper than the prototype's (A6); shoot one large size in both and give the difference.
3. **Frame budget.** A fast drag across the field re-bakes the hole as the stance moves. Run the frame budget tool and a scripted fast sweep of the grave across the column (stepped in a replay or driven by keys in a live run), and report the bake count per second and the frame time against slice 2's figure.
4. **Console.** No error and no warning in a live run.

Open for the human after this slice: whether the flat dark hole reads as the hole he chose, at the start size and at a big grave.

## Done when

Every planned test is green, every changed test is listed, every verification step has a result in your note, no pin moved, and the working tree holds the code, the tests and `docs/branch/records/slice-3-note.md`, uncommitted.
