# Slice 1: the camera and where things draw under it (design record T2, T3, T6, A1, A6, A7, A9, A11, A13)

Follow-along row 1: "The one still camera the whole game will be seen through, and the math for where every kind of thing draws under it, worked out and tested on their own, with the screenshot tool the later steps use. Nothing on screen changes yet."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. This entry is the planning half of the flow. Your scratch folder is `local/tilt-slice-1/` in the worktree, and the capture tool this slice builds lives in `local/tilt-shots/`, which later slices reuse. The worktree has no `node_modules` yet: run `pnpm install --frozen-lockfile --prefer-offline` from the repo root first. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read on the tree at `517ee0753e`.

## What this slice builds, and why

Mark ruled that the game is seen through one still camera, tilted 32.5 degrees off straight down (T2), standing 42.5 half-lengths of the starting grave above the ground (T3), looking at the ground under the middle of the screen and never following the grave (T6). Every later slice draws, steers and measures the field through this one camera, so it is built first, alone, as pure math with no Pixi and no game change, and its numbers are pinned against values worked out independently in the design record ("Values are data").

When it works, a caller can:

- Ask where a point of ground draws in the screen column and at what size.
- Ask which point of ground a point of the column shows, and get nothing back above the horizon.
- Ask for the patch of ground a column of a given size shows: a trapezoid, six numbers.
- Ask where the camera stands over a grave, in that grave's own half-lengths, which is what slice 3 cuts the hole with.
- Ask which point of ground the grave reaches when it is moved a given step across the column from where it draws, which is what slice 4 steers with.
- Ask how long a grass blade draws at this camera against build 7's.

Beside the camera, two pure modules that say where things draw under it: where a lying, standing, airborne or hostile thing draws and at what size (A7), and the ground's screen-laid grid (A9). Slice 2's renderers place everything through them.

Nothing in the game reads these modules yet. Their result is seen in their tests, in the table your note prints, and in the capture tool, proven on today's game, that every later slice photographs with.

## The source it is learned from

The prototype's camera, in `apps/hungry-grave/src/prototypes/tilted-view/index.html` in the prototype worktree: `makeCamera` (`:625-635`), `placeCamera` (`:682-688`), `NEAREST_SHARE` (`:696`), `groundScale` (`:704-707`), `groundToScreen` (`:710-717`), `horizonOffset` (`:724-725`), `screenToGround` (`:732-739`), `BLADE_LEAN` and `bladeReach` (`:752-761`), `aimHoleCamera` (`:1733-1744`), and the keyboard's step on the glass inside `attachKeys` (`:3518` onward, the block that calls `graveOnScreen` then `screenToGround`). Learn the math from it. Build the module fresh; this is not a line-for-line port.

Two places where the build departs from it, both already decided:

- The prototype places the camera per frame through `placeCamera(camera, FIELD_W / 2, world.fieldH / 2, SIZE_START)` (`:1725`), where `fieldH` is the phone's own height. The real column is one fixed 540 by 760 box (A1), so the camera is one constant.
- The prototype's hole camera uses the live grave's size for its height (`belowGround`, `:776-784`). The build's stance over a grave uses the scene camera's own height in field units, divided by the grave's size (A6).

## Parts of the code this slice touches

**`src/app/screens/game/camera.ts` (new).** Pure: no Pixi import, not even a type. It may import `FieldPoint` and the width and height from `src/game/field.ts` (`:10-11`, `:19-22`) and `SIZE_START` from `src/game/tuning.ts:58`. `Math.cos`, `Math.sin`, `Math.tan` and `Math.atan` are allowed here: it is drawing code, and the exact-arithmetic rule binds `src/game` alone. Its public interface, in one export block at the end:

- `interface Camera { readonly tilt: number; readonly lean: number; readonly rise: number; readonly height: number; readonly distance: number; readonly target: FieldPoint }`. `tilt` in radians off straight down, `lean` its cosine, `rise` its sine, `height` above the ground in field units, `distance` from the camera to its target along its own axis (`height / lean`), `target` the ground point under the column's centre.
- `interface Column { readonly width: number; readonly height: number }`.
- `interface OnColumn { readonly x: number; readonly y: number; readonly scale: number }`: where a ground point draws in column units, and how many column units one field unit draws as there.
- `interface VisibleGround { readonly top: number; readonly bottom: number; readonly farLeft: number; readonly farRight: number; readonly nearLeft: number; readonly nearRight: number }`: the ground a column shows, in field units.
- `interface Stance { readonly cameraHeight: number; readonly nadirX: number; readonly nadirY: number }`: where the camera stands over a grave, in that grave's half-lengths, the nadir being the ground point straight under the camera, from the grave's centre.
- `CAMERA_VALUES`: the data table, `{ tiltDegrees: 32.5, heightInStartingHalfLengths: 42.5 }`, with a JSDoc naming Mark's ruling (T2, T3) and that the height is off the starting size and never the live grave.
- `COLUMN: Column`, the 540 by 760 column, from the field's width and height.
- `makeCamera(tiltDegrees: number, heightInStartingHalfLengths: number, startingSize: number, column: Column): Camera`. The target is the column's centre, which is also the ground point under it, because the column is laid out so one field unit draws as one column unit at the target.
- `SCENE_CAMERA: Camera`, `makeCamera(CAMERA_VALUES.tiltDegrees, CAMERA_VALUES.heightInStartingHalfLengths, SIZE_START, COLUMN)`.
- `groundToColumn(camera: Camera, x: number, y: number): OnColumn`. The prototype's `groundScale` and `groundToScreen`, with its `NEAREST_SHARE` guard kept (0.12, a named value with its prototype line), so ground at or behind the camera's feet is held at that share and never returns an infinity.
- `columnToGround(camera: Camera, x: number, y: number): FieldPoint | null`. The exact inverse; null where the column point is at or above the horizon.
- `visibleGround(camera: Camera, column: Column): VisibleGround`. The ground under the column's top row, bottom row and four corners.
- `stanceOverGrave(camera: Camera, grave: { readonly x: number; readonly y: number; readonly size: number }): Stance`. `cameraHeight` is `camera.height / grave.size`. The nadir is the camera's foot on the ground, `(target.x, target.y + distance * rise)`, less the grave's centre, divided by the grave's size.
- `stepOnColumn(camera: Camera, from: FieldPoint, step: { readonly x: number; readonly y: number }): FieldPoint | null`. Where `from` draws on the column, moved by `step` column units, taken back to the ground. Null when that lands at or above the horizon.
- `bladeReach(camera: Camera): number`. The prototype's: `cos(tilt - BLADE_LEAN) / cos(build 7's tilt - BLADE_LEAN)`, with `BLADE_LEAN` 62 degrees and build 7's tilt `atan(1.07 / 4.95)`, both named values with their prototype lines. Its caller is slice 2's ground painting (A9).

Every export has a caller in a later slice of this step, named in the design record: `groundToColumn`, `columnToGround` and `visibleGround` in slice 2, `stanceOverGrave` in slice 3, `stepOnColumn` in slice 4, `bladeReach` in slice 2. Name the slice at each export's JSDoc, as the cited-future rule asks.

**`src/__tests__/boundary.test.ts`.** A new rule for `screens/game/camera.ts`, in the shape of the two rules for `graveProjection.ts` and `fall.ts` (`:137-175`): it may reach `game/field` and `game/tuning` and import no package at all. The reason goes in its JSDoc: its tests and slice 3's fall run without a renderer.

Beside it, the two pure modules slice 2's renderers place with, moved here from slice 2 on the tech gate's advice so the renderer slice is only renderers:

**`src/app/screens/game/groundPlacement.ts` (new, pure, no Pixi).** Where a thing on the ground draws, for each kind of thing. Its public interface:

- `interface Placement { readonly x: number; readonly y: number; readonly scaleX: number; readonly scaleY: number }`, in column units.
- `lyingAt(camera: Camera, x: number, y: number): Placement`: the column point of the ground point, `scaleX` the camera's scale there, and `scaleY` the scale squared times the lean, which is how fast the ground's image changes down the column at that point (A7); `scaleY` is not the scale times the lean, which the tech gate showed leaves a large lying thing 1.5 units off at the top edge.
- `standingAt(camera: Camera, x: number, y: number, halfDepth: number): Placement`: the thing's feet at the near edge of its footprint, ground `(x, y + halfDepth)`, and the placement of the drawing's own centre above them, which is `halfDepth` times the camera's scale at the feet straight up the column; `scaleX` and `scaleY` are both the camera's scale at the feet.
- `airborneAt(camera: Camera, x: number, y: number): Placement`: the column point of the ground point at the camera's scale, both axes.
- `hostileFireAt(camera: Camera, x: number, y: number): Placement`: as `airborneAt`, at the larger of the camera's scale and one, so a shot is never drawn smaller than today's size and its hitbox (A7).
- `headingOnColumn(camera: Camera, x: number, y: number, vx: number, vy: number): number`: the angle, in radians, of the way a body at `(x, y)` moving by `(vx, vy)` goes on the column.
- `liftOnColumn(camera: Camera, x: number, y: number, dx: number, dy: number): { x: number; y: number }`: an art offset a renderer draws in field units today (a lob's lift, a burst's drift), as a column offset at the camera's scale at that thing's ground point (A7, last bullet).

It reaches `camera.ts` only. Add a boundary rule for it in `src/__tests__/boundary.test.ts` in the shape of the rule for `camera.ts` above: reaches `app/screens/game/camera`, `game/field`, `game/tuning`, imports nothing.

**`src/app/screens/game/groundMesh.ts` (new, pure, no Pixi).** The prototype's `groundGridIndices` and `updateGroundMesh` (`index.html:1987-2005`, `:2079-2106`) as geometry: given the camera, the column, the tile's size and the scroll's offset in field units, the grid's column positions, their texture coordinates and its triangle indices. The grid is laid on the column (18 columns by 40 rows, 0.08 of the column past every edge, the prototype's `GROUND_COLUMNS`, `GROUND_ROWS`, `GROUND_OVERSHOOT`, `index.html:1962-1966`, in one data table with those lines named). Each vertex asks `columnToGround` which ground it stands on; its texture coordinate is that ground point less the scroll, over the tile's size. Every column row of the grid is below the horizon at these values (the horizon is 2135.7 column units above the middle row), so the prototype's horizon hold (`HORIZON_KEEP`) is not needed; if `columnToGround` ever returns null for a grid vertex, that is a bug and throws, because the camera is a constant. No haze (A9). Its interface: `groundGrid(camera: Camera, column: Column, tile: { width: number; height: number }, scrolled: number): { positions: Float32Array; uvs: Float32Array }` and `groundGridIndices(): Uint32Array`.

Nothing else changes. No renderer reads these modules yet, and nothing under `src/game` changes.


## What must stay unchanged

- Every existing test, green and with the same name. `GOLDEN`, the bot's seed lists and every version number hold, because nothing on the sim's path changes.
- `src/app/layout.ts`, every renderer, and every file under `src/game`, `src/input`, `src/tape` and `src/dev`.

## Planned tests

Pin every name as a `test.todo` first against stubs that return a wrong value of the right type. The expected values below were worked out independently of the code, in double precision, from the formulas in the design record; take them from here and never from running your module. Each test carries a comment citing the ruling it enforces. Compare to 1e-6 unless the test says otherwise.

`src/app/screens/game/__tests__/camera.test.ts`:

1. the scene camera stands 1147.5 field units up, at 32.5 degrees, looking at the column's centre (T2, T3): height 1147.5, distance 1360.5781819307, lean 0.8433914458, rise 0.5372996083, target (270, 380)
2. the ground under the column's centre draws at the centre at scale one
3. the middle row keeps its x: ground (0, 380) draws at (0, 380) at scale one
4. the grave's starting point, ground (270, 608), draws at (270, 591.320185) at scale 1.098947
5. a far point, ground (100, 100), draws at (116.925935, 167.362471) at scale 0.900436
6. a near point, ground (400, 700), draws at (418.804365, 688.923885) at scale 1.144649
7. farther up the field draws smaller: over ground y from -168 to 762 in steps of 10, the scale strictly rises
8. column to ground is the exact inverse of ground to column: for every column point on a 9 by 9 grid over the 540 by 760 column, ground to column of column to ground returns the point within 1e-9
9. the column's four corners show ground (-58.438897, -168.081604), (598.438897, -168.081604), (40.784202, 762.503300), (499.215798, 762.503300)
10. a column point above the horizon shows no ground: column (270, -1756) is null, column (270, -1755) is not
11. the ground the 540 by 760 column shows is the trapezoid top -168.081604, bottom 762.503300, far row -58.438897 to 598.438897, near row 40.784202 to 499.215798
12. the trapezoid's sides are straight: the ground under column x 0 at rows 0, 190, 380, 570 and 760 lies on the line through the first and last, within 1e-9
13. the camera over the starting grave, (270, 608) at size 27, stands 42.5 half-lengths up and 18.631042 half-lengths toward the bottom, straight behind (A6)
14. the camera over a grave at (100, 200) at size 27 stands 6.296296 half-lengths to its right and 33.742153 toward the bottom
15. the camera's height never follows the live grave: over a grave of size 48 it is 23.90625 half-lengths up, and over a ceiling grave of 67.5 it is 17 (T3, A6)
16. a step on the column moves the grave's drawn point by exactly that step: from ground (270, 380), (40, 700) and (500, -100), a step of (12, -7) lands where ground to column says the start plus (12, -7), within 1e-9
17. a straight-up step never moves the drawn point sideways: from ground (40, 700), a step of (0, -10) lands at ground (39.055288, 690.913296), which draws at x 6.730739, the start's own x (T9, A11)
18. a step past the horizon has no ground: from ground (270, 380), a step of (0, -2200) is null
19. ground beyond the camera's nearest share is held there and never draws at an infinite size: ground y 2700 and ground y 1e9 both draw at scale 1 / 0.12
20. at a tilt of zero the camera looks straight down: lean one, rise zero, and ground (100, 100) draws at (100, 100) at scale one
21. a grass blade at 32.5 degrees draws 1.348502 times as long as build 7's, and at build 7's own angle, 12.197480 degrees, exactly as long (A9)

`src/app/screens/game/__tests__/groundPlacement.test.ts` and `groundMesh.test.ts` (moved from slice 2's list, numbered on from above):

22. a lying thing on the middle row draws at its own point at scale one across and the lean, 0.843391, down (the scale squared times the lean, with the scale one)
23. a lying thing at the grave's start, ground (270, 608), draws at (270, 591.320185), 1.098947 across and 1.018552 down (the scale squared times the lean)
24. a standing thing's feet sit on the near edge of its footprint: a mob of half-height 11 at ground (270, 380) has its feet at the column point of ground (270, 391) and its drawing's centre 11 times the scale there above them
25. a standing thing is never squashed: its scale is the same on both axes
26. a standing thing farther up the field draws smaller than the same thing nearer
27. an airborne thing draws at its own ground point at the camera's scale on both axes
28. a hostile shot near the top draws at scale one, never smaller, and near the bottom at the camera's scale (A7)
29. a body moving straight down the field heads straight down the column on the middle column, and a body moving across heads across
30. a lift of 10 field units straight up the field at ground (270, 100) is 10 times the scale there straight up the column

31. the grid covers the whole column and 0.08 of it past every edge
32. each vertex samples the ground the camera shows at that point of the column, over the tile's size
33. the scroll moves every texture coordinate by the scrolled distance over the tile's height and moves no vertex
34. the grid's triangles cover every cell exactly once

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. **The capture tool, built and proven.** Build `local/tilt-shots/`: a script, with a README of how to run it, that builds the app, serves it with `vite preview` on a free port, opens a replay of a given tape at a given tick in a phone-sized viewport (390 by 844, device scale factor 3), holds that frame, and saves a screenshot. How to hold a frame is in `docs/branch/handoff.md`, "Facts later work needs". Record the tapes it opens with `scripts/batch.ts` (the commands in `docs/branch/handoff.md`, one seed each), one won maxed run and one sealed birthright run, into `local/tilt-shots/tapes/`, and say which seeds. Prove it on today's tree: shoot tick zero, a busy tick in each section and the Undertaker's end, read each shot, and keep them as the "before" set that slice 2 compares against.

2. Print, in your note, a table of `visibleGround(SCENE_CAMERA, COLUMN)`, `groundToColumn` at the column's top, middle and bottom rows (the three scales), `stanceOverGrave` over the starting grave, and `bladeReach(SCENE_CAMERA)`, each beside the design record's table value, so the main session reads them against the record without running anything.
3. The boundary tests' new rules are shown to bite: in a scratch copy under `local/tilt-slice-1/`, add a `pixi.js` type import to the copy of `camera.ts`, then of `groundPlacement.ts`, and run the boundary test against each copy. Each must go red. The working tree is never mutated for this.
4. No rendered check of a change: nothing a player can see changes. Step 1's shots are of today's game.

## Done when

Every planned test is green, every verification step has a result in your note, no pin moved, and the working tree holds `camera.ts`, `groundPlacement.ts`, `groundMesh.ts`, their test files, the boundary rules and `docs/branch/records/slice-1-note.md`, uncommitted, and `local/tilt-shots/` holds the proven capture tool, its tapes and the "before" shots.
