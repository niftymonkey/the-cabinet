# Slice C: the areas of effect, the ground's scroll, the grave, and the drag on the play layer (design record T4, T9, T10, T11, T12, A6, A10, A20, A22, A23, A24, A25, A29, A34)

Follow-along row C: "The belch's rings, the bell's cones and Territory's patches are drawn exactly over what they hit, food stays on the ground it landed on, and the grave is drawn among the food and mobs, never smaller than the box it is hit in, with its hole's walls still changing as it moves. Food and the Undertaker go into the hole with no jump, and a drag keeps the grave under the finger."

One slice for one coder, carrying the old slice 12 and 13 entries whole, in order, and a third part moved here from the old slice 14 because it needs the grave on the play layer. It runs after slices A, P1, P2 and B.

**What slices P1 and P2 changed under this entry (T12).** Each run has its own field (760 to 1260 tall) and its own `Scene` (field, column, camera, and from slice B the play layer), handed to every renderer and to steering by `useScene` (slice P2). Wherever the parts below say `SCENE_PLAY_LAYER` or `SCENE_CAMERA`, read the play layer or the camera of the scene the renderer was handed; there is no module-level one. Every figure the parts give is for the 760 field; where a figure depends on the field, the entry gives the 1168 field's beside it (the design record's second play layer table), and every relational test runs on both fields. Rendered checks run on slice P1's two 760 tapes and their `-h1168` twins.

Inside the parts, the old slice numbers still appear and map as: slice 10 and 11 are this branch's slice B, slice 12 and 13 are slice C, slice 14 is slice A, slice 15 and 16 are slice D. The parts' scratch folders stay as named. The parts share one note, one uncommitted working tree and one return.

## Part 1: Slice 12: the areas of effect drawn over what they reach, and the ground kept under what lies on it (design record T10, A20, A22)

Follow-along row 12: "The belch's rings, the bell's cones and Territory's patches are drawn exactly over what they hit, and food and patches in the middle of the screen stay on the patch of ground they landed on as it scrolls."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Load the `pixijs-skills:pixijs` skill before you touch Pixi code, and check every Pixi claim in `node_modules/pixi.js`. Your scratch folder is `local/tilt-slice-12/` in the worktree; the capture tool is `local/tilt-shots/`. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read at `9b125bbc03`; slice 11 changed the placement lines in `StormRenderer.ts` named below, so follow the name beside a number that has moved.

### What this slice builds, and why

After slice 11 the belch's eruption, the bell's cones and Territory's patches are placed on the play layer but still drawn as lying art at one scale. Their edges are sim reaches: whatever lies inside is pushed, damaged or held. On the play layer a field unit along draws as a different number of rows at each row (0.70 at the top to 1.43 at the bottom), so a circle's true image is egg-shaped, and art at one scale misstates the reach. The belch's 270-unit reach around a grave at its start runs from row 272.5 to past the bottom. Each area is drawn as the exact image of its sim shape (A20).

The ground's scroll is the sim's scroll in ground units (`GROUND_SPEED`, `BackgroundRenderer.ts:71`), so a patch stays on the ground it landed on (Mark's slice 13b ruling, quoted in that constant's JSDoc). On the play layer a field unit along is 1.224454 ground units, so the ground must scroll that much faster for a patch on the middle column to stay on its ground (A22). Off the middle column a lying thing keeps its x while the ground spreads outward under it, tilt 9's own behaviour; slice 15 measures how far.

### Parts of the code this slice touches

**`src/app/screens/game/StormRenderer.ts`, the three areas (A20).** Three drawers draw in field units about their own origin and are placed by slice 11's `lyingOnPlay`: `drawPatch` (`:275-293`, placed in `syncPatches` at `:755-757`), `drawCones` with `coneWedges` (`:351-386`, placed in `syncRing` at `:874-876`), and `drawEruption` with `eruptionFrontsAt` (`:407-435`, placed through `syncBurst` at `:916-918`). Each is changed to build its shape in field units about the thing's field point (the patch's centre; the grave's point for the cones, which point where `coneHeading` says, `:355`; the eruption's drifted point for the fronts), trace every outline with `traceOnColumn(SCENE_PLAY_LAYER, ...)` and `circleOutline` (slice 10), and draw in column units into a node left at the column's origin at scale one. That covers the patch's rim and each of its hands (`:282-292`), each cone's wedge, arc and both straight sides (`:356-359`), and each front's circle (`:428-433`).

- Stroke widths (`PATCH_STROKE`, `CONE_STROKE`, `SPRITE_STROKE`, each front's `width`) keep their look: each is multiplied by the camera's scale at the shape's field point, because the node no longer carries it. Their readers are these drawers alone.
- `eruptionFrontsAt` stays a value (exported and tested).
- The patch's cached look (`patchDrawn`, `:588`, `:751-752`) no longer suffices, because the traced shape moves with the patch: a patch is drawn every frame it shows.
- The ring's fade (`:877-878`) and the patch's tint and alpha (`:758-765`) stay.

**`src/app/screens/game/BackgroundRenderer.ts`, the scroll (A22).** `GROUND_SPEED` (`:71`) stops being a module constant: the ground's speed is `SCROLL_SPEED` times the scene's `playLayer.stretch` (1.224454 on the 760 field, 1.281514 on the 1168 one), set in `useScene`, and its JSDoc (`:60-70`) says why and that it is the run's. Its readers, every one of which takes the new rate with no other change: `DRIFT_WINDOW_TICKS` (`:104-106`), the ground's scroll (`:269`), the dressing's fall (`:382`), and the export (`:491`), read by `BackgroundRenderer.test.ts` only through `DRIFT_WINDOW_TICKS` (`:25`, `:243`, `:246`, `:424`, `:429`, `:439`, `:633-636`). `groundPainting.test.ts:432` names it in a comment and does not change.

### What must stay unchanged

- Everything under `src/game`, `src/input`, `src/tape` and `src/dev`. No pin moves.
- Every colour, alpha and count in the three drawers; slice 11's placements; the ground's mesh and bake.

### Planned tests

Pin every name as a `test.todo` first. Expected values come from the design record, worked independently. Each test cites the ruling it enforces.

`src/app/screens/game/__tests__/StormRenderer.test.ts`:

1. a Territory patch is drawn as the exact image of its sim circle: a field point one unit inside its radius draws inside the drawn rim and one unit outside draws outside, all around, for a patch at the left edge, the middle and the right edge (A20)
2. the bell's cones are drawn as the exact image of the sim's cones: the same test at the cone's reach and along both straight sides, at the left edge, the middle and the right edge (A20)
3. each of the belch's fronts is drawn as the exact image of its sim circle at the front's radius, about the eruption's drifted point (A20)
4. a patch's stroke keeps its drawn width: the traced rim's stroke is `PATCH_STROKE` times the camera's scale at the patch's point

`src/app/screens/game/__tests__/BackgroundRenderer.test.ts`:

5. the ground runs at the rate a lying thing on the middle column drifts: over a number of ticks its texture moves by that many ticks of the sim's scroll times the scene's stretch, 1.224454 on the 760 field and 1.281514 on the 1168 one, in ground units (A22, T12)
6. a patch on the middle column stays on its ground: a field point on column x 270 and the ground point under it at the start stay on one column row, within 1e-6, over the whole trip down the column, on the 760 and the 1168 field (A22)
7. the dressing falls from the top row of the ground the camera sees to past its bottom row at the ground's speed

**Existing tests whose premise this changes.** Replace each with the new test named beside it, keep its promise, and list every replacement in your note:

- `StormRenderer.test.ts` `'draws at the radius the sim collides against, so a stale patch is visibly smaller'` (`:421`): its promise stays, asserted on the traced rim's extent in field terms (test 1 covers the rim). `'drifts the eruption down the field, so it still covers the bodies it caught when it ends'` (`:350`): its promise stays, asserted on the traced fronts. Slice 11's test "a patch, the bell's cones and the belch's eruption are placed at their play points" becomes tests 1 to 3.
- `BackgroundRenderer.test.ts` `"the ground runs at the rate a landed patch drifts: over a number of ticks its texture moves by that many ticks of the sim's scroll, in ground units"` (`:576`): test 5. `'the dressing is laid across the far row of the ground the camera sees and falls from its top row to past its bottom row'` (`:604`): its across half stays; its window lines (`:633-636`, against `SCROLL_SPEED`) become test 7.

Any other test that goes red follows the coder contract's stop rule.

### Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. **Rendered check.** From a maxed tape, shoot a belch mid-sweep, a bell toll at level 4 or 5, and a Territory patch with its hands, each with the grave near the left edge, the middle and the right edge where the tape offers it. Read every shot and say whether each shape reads as sitting over the bodies it catches, and describe its egg shape.
2. **The ground under a patch, stepped.** On a 760 tape and a `-h1168` tape, step through a patch's life on the middle column and near an edge: report, on the first and last frame, the column distance between the patch's centre and one ground feature it landed on. On the middle column it must be under 1 CSS pixel; near the edge give the figure (A22).
3. **Frame budget.** Run `scripts/frame-budget.ts` and its screen before and after, and give both figures; the traced patches are drawn every frame now.
4. **Console.** No error and no warning in a live run.


## Part 2: Slice 13: the grave on the play layer (design record T4, T10, A6, A10, A23, A24, A25, A29)

Follow-along row 13: "The grave is drawn where the food and mobs around it are drawn, still with the tilted look Mark chose: its hole's side walls still change as it moves left and right. A swallowed body and the Undertaker go over the rim from exactly where they were drawn, with no jump."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Load the `pixijs-skills:pixijs` skill before you touch Pixi code. Your scratch folder is `local/tilt-slice-12/` in the worktree; reuse the capture tool in `local/tilt-shots/`. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read at `9b125bbc03`; slices 9 to 11 did not touch these files except for identifiers, so follow the name beside a number that has moved.

### What this slice builds, and why

After slice 11 every body is on the play layer, but the grave is still placed by the pinhole at its field point, so it draws somewhere the bodies near it do not. Tilt 9 places the grave on the play layer and keeps tilt 7's look for it: the grave is drawn exactly as tilt 7 drew a grave standing on the ground point under its placed point, and the hole's camera stands over that same ground point, so the side walls change as the grave moves left and right exactly as tilt 7 showed them for a grave at that spot on the glass (A23, tilt 9's `aimHoleCamera`, prototype `index.html:1773-1788`).

Because a field unit along draws 1.224 times the rows a ground unit does (A18), a grave at tilt 7's size would be 0.817 of its hitbox along, and mob fire would hit 4 to 11 CSS pixels short of the drawn rim. So the grave's ground rectangle is widened until its image covers the hitbox's image (A29): along, the drawn rim sits exactly on the hitbox's rows. Today's fall still starts a body from its sim offset in the grave's frame, which would make it jump (1.22 column units for a body at the far corner of a starting grave). The fall starts where the body was drawn (A24). The Undertaker is hauled to a rim hinge and falls about it; his haul ends where the grave's frame draws that hinge.

When it works, a player sees:

- The grave at its place among the bodies, never smaller than the box it swallows with and is hit in: its drawn rim is where fire lands. It reads about 22% longer along than tilt 7 drew it (A29).
- Its hole a flat dark opening whose side walls show more on the side away from the middle, as before, now changing with the grave's place on the glass.
- A swallowed body tipping into the hole from exactly where it was drawn the frame before.
- The Undertaker dragged to the rim and going over it with no jump, and the furrows behind him lying on the play layer.

### Rulings this slice builds

T4, T10, A6, A10 as amended, A23, A24, A25, A29. Read each.

### Parts of the code this slice touches

**`src/app/screens/game/GraveRenderer.ts`.**

- `cornersOver` (`:80-96`): the ground rectangle becomes `graveOnGround(SCENE_PLAY_LAYER, grave, across, along)` (slice 10) of today's half extents (the grave's width over two plus the padding across, its size plus the padding along, `:81-83`), centred on the ground under the grave's play point rather than on its field point (`:85`, `:91-94`); the corners still go through `groundToColumn(SCENE_CAMERA, ...)`. So the mesh's centre draws at the grave's play point, its opening covers its hitbox's image (A29), and the hole keeps tilt 7's walls there (A23).
- `holeViewOver` (`:133-136`): `stanceOverGrave(SCENE_CAMERA, ...)` is taken over the ground point under the grave's play point, with the grave's size (A23; the design record's stance figures for field (40, 608), (270, 608) and (500, 608)).
- `GraveSpot` (`:122-126`) and `Baked.spot` (`:114-120`): the spot a bake records is that ground point and the size. `stanceMoved` (`:139-141`) compares ground points, so `STANCE_REBAKE_STEP` (`graveDrawingValues.ts:40`) is measured in ground units. Its value stays 4.75. Its readers: `stanceMoved` (`GraveRenderer.ts:140-141`) and `GraveRenderer.test.ts` (`:29`, `:445`, `:449`, `:452`, `:470`, `:487`). Its JSDoc (`graveDrawingValues.ts:28-39`) says "in field units" twice; it becomes "in ground units, between the ground points under the grave's placed point", with the reason: a field unit is up to 1.216 ground units across and 1.224 along at the top of the column, so a step counted in field units would pass the one-pixel bound the JSDoc derives (A23).
- `sync` (`:275-286`): the falls container, `lyingAt(SCENE_CAMERA, grave.x, grave.y)` at `:283`, becomes `graveFrameOnPlay(SCENE_PLAY_LAYER, grave.x, grave.y)` (A29). The nearest row's scale, which slice P2 made the scene's (1.177929 on the 760 field, 1.273449 on the 1168 one), stays the bake's: the play layer's largest scale is still the bottom row's.
- `wanted` in `sync` records what `stanceMoved` and `holeViewOver` now read; the bake still paints the pit with the live view (`rebuildHole`, `:344` onward).

**`src/app/screens/game/FallRenderer.ts`.** `swallowed` (`:127-138`) sets the fall's unit place from `event.offsetX / event.graveSize` and its way from `event.vx / event.graveSize`. It becomes `graveFrameOffset(SCENE_PLAY_LAYER, grave, event.offsetX, event.offsetY)` and `graveFrameVelocity(...)` with `grave` the run's grave's field point and `event.graveSize`, so age zero draws the body exactly where the play layer drew it. `fall.ts` does not change: its rim rule already hinges a body lying outside the far lip on the far edge (`fall.ts:112-115`).

**`src/app/screens/game/endingScene.ts` and `EndingSceneRenderer.ts`.**

- `EndingScene` gains `hinge: Hinge`, set in `sceneFrom` (`:120-133`) from `rimHauledTo` (`:115-118`). `rimOf` (`:136-141`) returns `scene.hinge` rather than recomputing it from `rimX` and `rimY`. `sceneFrom`'s `rimX` and `rimY` are unchanged, so `endingScene.test.ts`'s tests (`:64` to `:213`) keep their premises.
- `EndingSceneRenderer.begin` (`:113-120`) stores the scene with its `rimX` and `rimY` replaced by `fromGraveFrame(SCENE_PLAY_LAYER, grave, hinge.x, hinge.y)`: the haul ends at the field point the play layer draws exactly where the grave's frame draws the hinge, so the dragged body and the falling body meet at one point (A24). The furrows reach the same point.
- `placeDragged` (`:144-151`): `standingAt(SCENE_CAMERA, ...)` at `:145` becomes `standingOnPlay`. `traceFurrow` (`:190` onward): `groundToColumn(SCENE_CAMERA, ...)` at `:205-209` becomes `playToColumn(SCENE_PLAY_LAYER, ...)`, because the furrows mark the field he crossed.

**`src/app/screens/game/groundPlacement.ts`.** After this slice `lyingAt` and `standingAt` are read only by the dressing (`BackgroundRenderer.ts:136-139`). Nothing is deleted.

**`src/__tests__/boundary.test.ts`.** Slice 11's fence gains `GraveRenderer.ts`, `FallRenderer.ts` and `EndingSceneRenderer.ts` for `./groundPlacement`; `GraveRenderer.ts` still reads `./camera` for the corners and the stance, which the fence allows for it alone.

### What must stay unchanged

- Everything under `src/game`, `src/input`, `src/tape` and `src/dev`. No pin moves.
- Every painter of the hole and the lip, `graveProjection.ts`, `fall.ts`, the dark's values, the padding, `HOLE_REBUILD_STEP` and the bake's resolution.
- Slice 11's placements.

### Planned tests

Pin every name as a `test.todo` first. Expected values come from the design record's play layer table, worked independently. Each test cites the ruling it enforces.

`src/app/screens/game/__tests__/GraveRenderer.test.ts`:

1. the grave's pit and lip are drawn through the projected corners of a ground rectangle of the grave's size centred on the ground under its play point, and the mesh's centre draws at the grave's play point (A23)
2. the grave at the left edge and at the right edge of its starting row draws at column x equal to its field x, one scale on both sides (T10)
3. the hole is cut over the ground under the grave's play point: on the 760 field, over graves of size 27 at field (40, 608), (270, 608) and (500, 608) the view's nadir is (7.857873, 19.801919), (0, 19.801919) and (-7.857873, 19.801919) half-lengths at height 42.5; on the 1168 field, over graves of size 27 at (40, 1016), (270, 1016) and (500, 1016), it is (7.344603, 14.150916), (0, 14.150916) and (-7.344603, 14.150916) at height 42.5 (A23, A34)
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

Any other test that goes red follows the coder contract's stop rule.

### Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. **Rendered check.** With the capture tool, on a 760 tape and a `-h1168` tape, shoot the grave at its starting size at the left edge, the middle and the right edge of its starting row, near the top and near the bottom, and a large grave late in a maxed tape. Read every shot and say: the grave sits among the bodies around it; the hole reads as a flat dark opening; the side walls change with the grave's place as test 4 says; nothing shows through the near lip. Put the left-edge and right-edge shots beside tilt 9's `local/tilt9/tilt9-left.png` in the prototype worktree and say where they differ, other than the column's height and the art.
2. **The handover, stepped.** Hold a swallow tick by tick through its tip in a replay (the capture tool's `+<frames>`) and measure the body's drawn centre on the frame before the swallow and on the swallow's first frame: the jump must be under one CSS pixel. Do the same for the Undertaker going over the rim at the end of the won tapes (`won-maxed-1000.tape@23548+<frames>`, and its `-h1168` twin at its own last tick, which `tape-ticks.ts` gives).
3. **Fire lands on the drawn rim (A29), measured.** Step a tape to a mob shot hitting the grave at its far end and at a side, at the starting size and a large size, and give the distance between the shot's drawn point on its hit tick and the drawn opening's edge: it must not be outside the edge by more than one CSS pixel. Also report the pit's drawn length against tilt 7's for the same size and row (the cost, about 22%).
4. **The overhang (A25), measured at the mesh's near corners.** Step a tape or a staged run to a frame with the grave at a side edge on its lowest row and give how far the drawn opening's near corners pass the column's edge, against the design record's figures on the 760 field (4.6, 7.9 and 10.9 CSS pixels at sizes 27, 48 and 67.5), and the same three figures measured on the 1168 field, reported with no pass mark (the grave's mesh splays more at the taller field's larger bottom scale).
5. **Frame budget.** A fast sweep of the grave across the column, as slice 3 ran it; bakes per second and the frame time against slice 3's figures.
6. **Console.** No error and no warning in a live run.

Open for the human after this slice: whether the longer grave (A29) and its hole still read as the one he chose.



## Part 3: the drag on the play layer (moved from the old slice 14; design record T9, T10)

Slice A left the drag on slice 4's camera conversion, which is right for a grave drawn by the pinhole. Part 2 moves the grave onto the play layer, so the drag moves with it in this same slice, never a commit apart. Line numbers are at `9b125bbc03`; slice A renamed `groundMoveFor` to `dragOnField`, so follow the name.

### Parts of the code this part touches

**`src/app/screens/game/steering.ts`.**

- `graveOnColumn` (`:122-125`): the camera placement slice P2 left there becomes `playToColumn(scene.playLayer, grave.x, grave.y)`, on the scene steering was handed.
- `dragOnField` (slice A's name for `groundMoveFor`, `:134-152`): the grave's column point plus `onColumn` times `BASE_SPEED`, taken back through `columnToPlay`, less the grave's field point, over `BASE_SPEED`. Where `columnToPlay` returns null (above the horizon: 1756 column rows above the top on the 760 field, 1552 on the 1168 one) the move is still and is logged once through `pastHorizonLogged` (`:105`), as today. This is tilt 9's drag (prototype `index.html:3515`, `:3570`).
- The imports of `groundMoveOnColumn`, `groundToColumn`, `SCENE_CAMERA` and `stepOnColumn` (`:15-20`) go.

**`src/app/screens/game/camera.ts`.** `stepOnColumn` (`:209-222`) and `groundMoveOnColumn` (`:224-249`) lose their last callers (`steering.ts:140`, `:145`; `bot.ts`'s went in slice A): delete both, their exports (`:257`, `:261`), and their tests (`camera.test.ts:187`, `:204`, `:222`, `:256`). The camera's boundary row in `src/__tests__/boundary.test.ts` loses `game/command`, which slice 4 added for `groundMoveOnColumn`'s type; only that hunk of slice 4 (`git show 328570e623 -- apps/hungry-grave/src/__tests__/boundary.test.ts`), never the whole file.

**`src/input/touch.ts`, the JSDoc slice 4 wrote.** Three comments become false and are restated for the play layer: `TARGET_TOLERANCE`'s round trip (`:27-37`, "through the camera, onto the sim's float32 grid ... and back to the column") becomes the round trip through the play layer's inverse, which is exact across and within 1e-9 down (slice B's test 7), still far under the tolerance; `ColumnPoint`'s "A point on the column the camera draws the field into (tilted view A11)" (`:43`) becomes a point on the column the play layer draws the field into (T10); and `TouchSteer`'s "into a ground move through the camera (tilted view A11)" (`:88`) becomes a field move through the play layer's inverse. Only the comments change.

### Planned tests

`src/app/screens/game/__tests__/steering.test.ts`:

P3-1. a drag's move lands the grave's field point where the play layer's inverse of the finger's target says (replaces `"the move the sim is handed is a ground move: the grave's field point after a tick is where stepOnColumn says the step reaches"`, `:292`)
P3-2. a held W leaves the grave's drawn x unchanged, from a grave near the left edge low on the field (T9; the drawn-x half of the old `:183`, which slice A kept as a field-move test)

Slice A's drag tests (its tests 1 to 3 and 6 to 8) keep their promises on the play layer and must stay green unchanged.

### Verification steps

1. **Rendered drag and key check.** Slice 4's instruments (`local/tilt-slice-4/slice4-drag*.mjs`), copied into `local/tilt-slice-C/`: on a 390 by 844 touch viewport (a live run there plays a 1168 field, T12), and again on a 1440 by 900 touch viewport (a 760 field), drag 100 CSS pixels right and then up with the grave near the top, the middle and the bottom; the drawn centre moves within 2 CSS pixels of the finger. Hold W for one second from a grave near the left edge low on the field: the drawn x moves under 1 CSS pixel. Actor: the agent.
2. **On-device check.** Actor: Mark, after slice D's deploy: a drag at the top and at the bottom of the screen keeps the grave under his finger, and W goes straight up.

## Done when (the whole slice)

Every planned test of all three parts is green, every replaced test is listed, every verification step of all three parts has a result in one note, `docs/branch/records/slice-C-note.md`, no pin moved, and the working tree holds the code and the tests, uncommitted.
