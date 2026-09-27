# Slice 13: the grave on the play layer (design record T4, T10, A6, A10, A23, A24, A25, A29)

Follow-along row 13: "The grave is drawn where the food and mobs around it are drawn, still with the tilted look Mark chose: its hole's side walls still change as it moves left and right. A swallowed body and the Undertaker go over the rim from exactly where they were drawn, with no jump."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Load the `pixijs-skills:pixijs` skill before you touch Pixi code. Your scratch folder is `local/tilt-slice-12/` in the worktree; reuse the capture tool in `local/tilt-shots/`. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read at `9b125bbc03`; slices 9 to 11 did not touch these files except for identifiers, so follow the name beside a number that has moved.

## What this slice builds, and why

After slice 11 every body is on the play layer, but the grave is still placed by the pinhole at its field point, so it draws somewhere the bodies near it do not. Tilt 9 places the grave on the play layer and keeps tilt 7's look for it: the grave is drawn exactly as tilt 7 drew a grave standing on the ground point under its placed point, and the hole's camera stands over that same ground point, so the side walls change as the grave moves left and right exactly as tilt 7 showed them for a grave at that spot on the glass (A23, tilt 9's `aimHoleCamera`, prototype `index.html:1773-1788`).

Because a field unit along draws 1.224 times the rows a ground unit does (A18), a grave at tilt 7's size would be 0.817 of its hitbox along, and mob fire would hit 4 to 11 CSS pixels short of the drawn rim. So the grave's ground rectangle is widened until its image covers the hitbox's image (A29): along, the drawn rim sits exactly on the hitbox's rows. Today's fall still starts a body from its sim offset in the grave's frame, which would make it jump (1.22 column units for a body at the far corner of a starting grave). The fall starts where the body was drawn (A24). The Undertaker is hauled to a rim hinge and falls about it; his haul ends where the grave's frame draws that hinge.

When it works, a player sees:

- The grave at its place among the bodies, never smaller than the box it swallows with and is hit in: its drawn rim is where fire lands. It reads about 22% longer along than tilt 7 drew it (A29).
- Its hole a flat dark opening whose side walls show more on the side away from the middle, as before, now changing with the grave's place on the glass.
- A swallowed body tipping into the hole from exactly where it was drawn the frame before.
- The Undertaker dragged to the rim and going over it with no jump, and the furrows behind him lying on the play layer.

## Rulings this slice builds

T4, T10, A6, A10 as amended, A23, A24, A25, A29. Read each.

## Parts of the code this slice touches

**`src/app/screens/game/GraveRenderer.ts`.**

- `cornersOver` (`:80-96`): the ground rectangle becomes `graveOnGround(SCENE_PLAY_LAYER, grave, across, along)` (slice 10) of today's half extents (the grave's width over two plus the padding across, its size plus the padding along, `:81-83`), centred on the ground under the grave's play point rather than on its field point (`:85`, `:91-94`); the corners still go through `groundToColumn(SCENE_CAMERA, ...)`. So the mesh's centre draws at the grave's play point, its opening covers its hitbox's image (A29), and the hole keeps tilt 7's walls there (A23).
- `holeViewOver` (`:133-136`): `stanceOverGrave(SCENE_CAMERA, ...)` is taken over the ground point under the grave's play point, with the grave's size (A23; the design record's stance figures for field (40, 608), (270, 608) and (500, 608)).
- `GraveSpot` (`:122-126`) and `Baked.spot` (`:114-120`): the spot a bake records is that ground point and the size. `stanceMoved` (`:139-141`) compares ground points, so `STANCE_REBAKE_STEP` (`graveDrawingValues.ts:40`) is measured in ground units. Its value stays 4.75. Its readers: `stanceMoved` (`GraveRenderer.ts:140-141`) and `GraveRenderer.test.ts` (`:29`, `:445`, `:449`, `:452`, `:470`, `:487`). Its JSDoc (`graveDrawingValues.ts:28-39`) says "in field units" twice; it becomes "in ground units, between the ground points under the grave's placed point", with the reason: a field unit is up to 1.216 ground units across and 1.224 along at the top of the column, so a step counted in field units would pass the one-pixel bound the JSDoc derives (A23).
- `sync` (`:275-286`): the falls container, `lyingAt(SCENE_CAMERA, grave.x, grave.y)` at `:283`, becomes `graveFrameOnPlay(SCENE_PLAY_LAYER, grave.x, grave.y)` (A29). `NEAREST_ROW_SCALE` (`:69-73`) stays: the play layer's largest scale is still the bottom row's, 1.177929.
- `wanted` in `sync` records what `stanceMoved` and `holeViewOver` now read; the bake still paints the pit with the live view (`rebuildHole`, `:344` onward).

**`src/app/screens/game/FallRenderer.ts`.** `swallowed` (`:127-138`) sets the fall's unit place from `event.offsetX / event.graveSize` and its way from `event.vx / event.graveSize`. It becomes `graveFrameOffset(SCENE_PLAY_LAYER, grave, event.offsetX, event.offsetY)` and `graveFrameVelocity(...)` with `grave` the run's grave's field point and `event.graveSize`, so age zero draws the body exactly where the play layer drew it. `fall.ts` does not change: its rim rule already hinges a body lying outside the far lip on the far edge (`fall.ts:112-115`).

**`src/app/screens/game/endingScene.ts` and `EndingSceneRenderer.ts`.**

- `EndingScene` gains `hinge: Hinge`, set in `sceneFrom` (`:120-133`) from `rimHauledTo` (`:115-118`). `rimOf` (`:136-141`) returns `scene.hinge` rather than recomputing it from `rimX` and `rimY`. `sceneFrom`'s `rimX` and `rimY` are unchanged, so `endingScene.test.ts`'s tests (`:64` to `:213`) keep their premises.
- `EndingSceneRenderer.begin` (`:113-120`) stores the scene with its `rimX` and `rimY` replaced by `fromGraveFrame(SCENE_PLAY_LAYER, grave, hinge.x, hinge.y)`: the haul ends at the field point the play layer draws exactly where the grave's frame draws the hinge, so the dragged body and the falling body meet at one point (A24). The furrows reach the same point.
- `placeDragged` (`:144-151`): `standingAt(SCENE_CAMERA, ...)` at `:145` becomes `standingOnPlay`. `traceFurrow` (`:190` onward): `groundToColumn(SCENE_CAMERA, ...)` at `:205-209` becomes `playToColumn(SCENE_PLAY_LAYER, ...)`, because the furrows mark the field he crossed.

**`src/app/screens/game/groundPlacement.ts`.** After this slice `lyingAt` and `standingAt` are read only by the dressing (`BackgroundRenderer.ts:136-139`). Nothing is deleted.

**`src/__tests__/boundary.test.ts`.** Slice 11's fence gains `GraveRenderer.ts`, `FallRenderer.ts` and `EndingSceneRenderer.ts` for `./groundPlacement`; `GraveRenderer.ts` still reads `./camera` for the corners and the stance, which the fence allows for it alone.

## What must stay unchanged

- Everything under `src/game`, `src/input`, `src/tape` and `src/dev`. No pin moves.
- Every painter of the hole and the lip, `graveProjection.ts`, `fall.ts`, the dark's values, the padding, `HOLE_REBUILD_STEP` and the bake's resolution.
- Slice 11's placements.

## Planned tests

Pin every name as a `test.todo` first. Expected values come from the design record's play layer table, worked independently. Each test cites the ruling it enforces.

`src/app/screens/game/__tests__/GraveRenderer.test.ts`:

1. the grave's pit and lip are drawn through the projected corners of a ground rectangle of the grave's size centred on the ground under its play point, and the mesh's centre draws at the grave's play point (A23)
2. the grave at the left edge and at the right edge of its starting row draws at column x equal to its field x, one scale on both sides (T10)
3. the hole is cut over the ground under the grave's play point: over graves of size 27 at field (40, 608), (270, 608) and (500, 608) the view's nadir is (7.857873, 19.801919), (0, 19.801919) and (-7.857873, 19.801919) half-lengths at height 42.5 (A23)
4. a grave at the left edge shows more of its left wall than its right, and at the right edge the reverse (T4, tilt 9's check "the side walls differ between the left and the right edge")
5. moving the grave so the ground under it moves less than a stance step does not bake the hole again, and more does, measured in ground units (A10, A23)
6. the place for falls is the grave's frame on the play layer (the larger of the scale and one across, the rows per field unit along), and never takes the grave's size (A29)
7. the grave's drawn opening covers its hitbox: the play layer's image of each hitbox corner lies inside the drawn opening's four corners, and along, the opening's far and near ends are the hitbox's rows within 1e-6, at the left edge, the middle and the right edge, near the top and on the lowest row (A29)

`src/app/screens/game/__tests__/FallRenderer.test.ts`:

8. a swallowed body's fall begins where the play layer drew it: at age zero the sprite's column point, through the grave's placement, is `playToColumn` of the body's field point within 1e-6, for a grave at (270, 608), (40, 700) and (270, 100) (A24)
9. a fall that starts past the drawn far rim still hinges on the far edge and goes into the hole

`src/app/screens/game/__tests__/endingScene.test.ts` and `EndingSceneRenderer.test.ts`:

10. the scene keeps the rim hinge the pull crosses, whatever its haul end (A24)
11. the Undertaker's haul ends where his fall begins: the play layer's point for the haul's end and the grave's frame's point for the hinge are one column point, within 1e-6
12. the dragged Undertaker stands on the play layer, and the furrows lie on it

**Existing tests whose premise this changes.** Replace each with the new test named beside it, keep its promise, and list every replacement in your note:

- `GraveRenderer.test.ts` `"the grave's pit and lip are drawn through the four projected corners of their ground rectangle, at the size the sim says, and a grave near the top draws its far end narrower than its near end"` (`:358`): test 1, keeping the far-end promise. `"the place for falls follows the grave's point on the column and takes the camera's scale, never the grave's size"` (`:318`): test 6. `'moving the grave less than a stance step does not bake the hole again, and moving it more does'` (`:438`): test 5. `"the hole is cut by the scene camera: over a grave of size 48 the view's camera height is 23.90625 half-lengths, never the scene's 42.5"` (`:427`) keeps its promise and should pass unchanged. `'the drawn grave grows with every swallow, not only when it is repainted'` (`:238`) and `'the baked hole is centred on the grave, sized to it with the prototype padding round it'` (`:262`) keep their promises, read off the new corners.
- `FallRenderer.test.ts` `'puts one fall in the air at the place the swallowed event names'` (`:79`): test 8. `"follows the grave, because a fall is drawn in the grave's own frame"` (`:94`) keeps its promise.
- `EndingSceneRenderer.test.ts` `'the furrows draw in the ground, the dragged body over the field, and the falling body inside the hole'` (`:101`) keeps its promise; its positions become the play layer's.

Any other test that goes red is a stop and report.

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. **Rendered check.** With the capture tool, shoot the grave at its starting size at the left edge, the middle and the right edge of its starting row, near the top and near the bottom, and a large grave late in a maxed tape. Read every shot and say: the grave sits among the bodies around it; the hole reads as a flat dark opening; the side walls change with the grave's place as test 4 says; nothing shows through the near lip. Put the left-edge and right-edge shots beside tilt 9's `local/tilt9/tilt9-left.png` in the prototype worktree and say where they differ, other than the column's height and the art.
2. **The handover, stepped.** Hold a swallow tick by tick through its tip in a replay (the capture tool's `+<frames>`) and measure the body's drawn centre on the frame before the swallow and on the swallow's first frame: the jump must be under one CSS pixel. Do the same for the Undertaker going over the rim at the end of the won tape (`won-maxed-1000.tape@23548+<frames>`).
3. **Fire lands on the drawn rim (A29), measured.** Step a tape to a mob shot hitting the grave at its far end and at a side, at the starting size and a large size, and give the distance between the shot's drawn point on its hit tick and the drawn opening's edge: it must not be outside the edge by more than one CSS pixel. Also report the pit's drawn length against tilt 7's for the same size and row (the cost, about 22%).
4. **The overhang (A25), measured at the mesh's near corners.** Step a tape or a staged run to a frame with the grave at a side edge on its lowest row and give how far the drawn opening's near corners pass the column's edge, against the design record's figures (4.6, 7.9 and 10.9 CSS pixels at sizes 27, 48 and 67.5).
5. **Frame budget.** A fast sweep of the grave across the column, as slice 3 ran it; bakes per second and the frame time against slice 3's figures.
6. **Console.** No error and no warning in a live run.

Open for the human after this slice: whether the longer grave (A29) and its hole still read as the one he chose.

## Done when

Every planned test is green, every replaced test is listed, every verification step has a result in your note, no pin moved, and the working tree holds the code, the tests and `docs/branch/records/slice-13-note.md`, uncommitted.
