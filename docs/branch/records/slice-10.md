# Slice 10: the play layer's math (design record T10, A18, A19, A20, A21, A24, A29)

Follow-along row 10: "The groundwork for drawing everything that moves so it moves straight on the screen, worked out and tested on its own. Nothing on screen changes yet."

**Dispatch only after Mark rules A28 on his play of tilt 10 of the prototype** (design record A28): his answer decides `playToColumn`'s rows. If he picks evenly spaced rows, this entry is re-planned before it is dispatched.

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. This entry is the planning half of the flow. Your scratch folder is `local/tilt-slice-10/` in the worktree. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read at `9b125bbc03`; slice 9 restored `FIELD_WIDTH` and `FIELD_HEIGHT` and moved lines only in `camera.ts`'s import block, so follow the name beside a number that has moved.

## What this slice builds, and why

Mark ruled that the tilt is drawing only (T10) and approved tilt 9 of the prototype, which splits the picture in two: scenery through the pinhole camera (slice 1's `camera.ts`, unchanged), and the play layer, where everything the sim moves is drawn straight across the screen and on the camera's own rows down it (A18), at tilt 7's size for its row (A19). This slice builds the play layer's math as pure modules, alone, pinned against numbers worked out independently in the design record ("Values are data", the play layer's table). Slices 11 to 13 draw with it and slice 14 steers with it.

When it works, a caller can:

- Ask where a field point draws on the column, and at what size, on the play layer.
- Ask which field point a column point shows on the play layer (the exact inverse), for a drag.
- Ask which point of ground the camera shows where a field point is drawn, which is where the grave's hole is cut from (A23).
- Ask how many column rows a field unit along draws as at a field y.
- Ask for the column outline of a shape built in field units, traced exactly, for an area of effect (A20).
- Ask where a lying, standing, airborne or hostile play thing draws, which way a moving one heads on the column, and how an art offset lifts.
- Ask where, in a grave's own frame, a point or a velocity the play layer drew lands, and the reverse (A24).

Nothing in the game reads these modules yet.

## The source it is learned from

Tilt 9's `playToScreen` and `screenToPlay` (prototype worktree, `apps/hungry-grave/src/prototypes/tilted-view/index.html:758-778`), `aimHoleCamera` (`:1773-1788`) and `aroundGrave` (`:3099-3110`). Learn the idea; build fresh. The one departure, already decided (A18): in the prototype the field was the ground itself; here the fixed 540 by 760 field is spread over the ground the column's centre shows, so field y reads as the ground y `top + stretch * y`, with `top` the ground under the top row and `stretch` that ground's length over `FIELD_HEIGHT`.

## Parts of the code this slice touches

**`src/app/screens/game/playLayer.ts` (new, pure: no Pixi import, not even a type).** It may import `Camera`, `Column`, `OnColumn`, `groundToColumn`, `columnToGround`, `visibleGround`, `SCENE_CAMERA` and `COLUMN` from `./camera` (`camera.ts:139`, `:152`, `:178`, and the export block at `:251-264`), and `FieldPoint` and `FIELD_HEIGHT` from `src/game/field.ts`. Its public interface, in one export block at the end:

- `interface PlayLayer { readonly camera: Camera; readonly top: number; readonly stretch: number }`. `top`: the ground y under the column's top row (-168.081604). `stretch`: ground units along per field unit (1.224454).
- `makePlayLayer(camera: Camera, column: Column): PlayLayer`. `top` is `visibleGround(camera, column).top`; `stretch` is that ground's length (`bottom - top`) over `FIELD_HEIGHT`. A pinhole row shows one ground y whatever its column x (`columnToGround`'s y reads the row alone, `camera.ts:152` onward), which is what lets one number stand for a row.
- `SCENE_PLAY_LAYER: PlayLayer`, `makePlayLayer(SCENE_CAMERA, COLUMN)`.
- `playToColumn(layer: PlayLayer, x: number, y: number): OnColumn`: `x` unchanged; `y` the row `groundToColumn` gives the ground y `top + stretch * y` on the column's centre (the camera's target x); `scale` that call's scale.
- `columnToPlay(layer: PlayLayer, x: number, y: number): FieldPoint | null`: the exact inverse; null where `columnToGround` finds no ground (at or above the horizon).
- `groundUnderPlay(layer: PlayLayer, x: number, y: number): FieldPoint`: the ground point the camera shows at `playToColumn(layer, x, y)`. A null there is a bug (every row of the field is below the horizon) and throws.
- `stretchAlong(layer: PlayLayer, y: number): number`: column rows per field unit along at field y, the exact derivative of `playToColumn`'s row (the scale squared times the lean times the stretch). It leaves out the nearest-share hold, which binds only behind the camera's feet, off the column (slice 1's note, "Decisions made").
- `OUTLINE_STEP`: 4 field units, in a data table with its JSDoc: a traced circle's gap between chord and arc is 0.0625 field units at radius 32 and less for larger ones.
- `traceOnColumn(layer: PlayLayer, outline: readonly FieldPoint[], closed: boolean): number[]`: every segment of the outline subdivided into steps of at most `OUTLINE_STEP` field units, every point through `playToColumn`, flat `[x0, y0, x1, y1, ...]` as Pixi's `Graphics.poly` takes it. Caller: slice 11 (A20).
- `circleOutline(x: number, y: number, radius: number): FieldPoint[]`: a circle in field units with no chord longer than `OUTLINE_STEP`. Caller: slice 11.

**`src/app/screens/game/playPlacement.ts` (new, pure).** Where each kind of play thing draws (A7 evaluated at the play point, A19). It imports `Placement` from `./groundPlacement` (`groundPlacement.ts:8`, type only) and reaches `./playLayer` and `./camera`. Its public interface:

- `lyingOnPlay(layer, x, y): Placement`: at `playToColumn`, `scaleX` the scale, `scaleY` the scale squared times the camera's lean (tilt 7's look for the ground under it; the same factor `groundPlacement.ts`'s `lyingAt` uses, `:45` onward).
- `standingOnPlay(layer, x, y, halfDepth): Placement`: feet at `playToColumn(layer, x, y + halfDepth)`, the drawing's centre `halfDepth` times the scale there straight up the column; one scale on both axes.
- `airborneOnPlay(layer, x, y): Placement`: at `playToColumn`, the scale on both axes.
- `hostileFireOnPlay(layer, x, y): Placement`: at `playToColumn`, one scale on both axes, the largest of the scale, one, and `stretchAlong(layer, y)` (A21).
- `headingOnPlay(layer, x, y, vx, vy): number`: `atan2(vy * stretchAlong(layer, y), vx)`, the convention of `headingOnColumn` (`groundPlacement.ts:99-110`, `atan2(down, across)`).
- `liftOnPlay(layer, x, y, dx, dy): { x: number; y: number }`: the art offset times the scale at the play point.
- `interface GraveFrame { readonly x: number; readonly y: number; readonly size: number }` (a grave's field point and size).
- `graveFrameOnPlay(layer, x, y): Placement`: where the grave's own frame (its falls) is placed: at `playToColumn`, `scaleX` the larger of the scale and one, `scaleY` `stretchAlong(layer, y)`, so an offset in the frame draws no smaller than the hitbox's image (A29). Caller: slice 13.
- `graveOnGround(layer, grave: GraveFrame, halfAcross: number, halfAlong: number): { centre: FieldPoint; halfAcross: number; halfAlong: number }`: the ground rectangle the grave's mesh is drawn through (A29): centred on `groundUnderPlay` of the grave, its half extent across times the larger of one and one over the camera's scale at its far edge (the ground y `centre.y - halfAlong * stretch`), along times the stretch. Caller: slice 13.
- `graveFrameOffset(layer, grave: GraveFrame, dx: number, dy: number): { x: number; y: number }`: the offset, in the grave's own half-lengths, at which the grave's frame (`graveFrameOnPlay` at the grave) draws the point the play layer draws `grave + (dx, dy)`. Caller: slice 13 (A24, a swallowed body's fall).
- `graveFrameVelocity(layer, grave: GraveFrame, vx: number, vy: number): { x: number; y: number }`: a velocity in field units per tick carried into the frame by the play layer's local mapping at the grave: across `vx` over the frame's across scale, along `vy` times `stretchAlong` at the grave over the frame's along scale (which is that stretch), both over the size. Caller: slice 13.
- `fromGraveFrame(layer, grave: GraveFrame, ux: number, uy: number): FieldPoint`: the field point the play layer draws where the grave's frame draws the offset `(ux, uy)` half-lengths: the exact inverse of `graveFrameOffset`. Caller: slice 13 (the Undertaker's haul end, A24).

Every export names its caller slice in its JSDoc, as the cited-future rule asks.

**`src/__tests__/boundary.test.ts`.** Two rules in the shape of the rules for `camera.ts` and `groundPlacement.ts` (`:180-204`): `screens/game/playLayer.ts` may reach `app/screens/game/camera`, `game/field` and `game/tuning` and imports no package; `screens/game/playPlacement.ts` may reach `app/screens/game/playLayer`, `app/screens/game/groundPlacement`, `app/screens/game/camera`, `game/field` and `game/tuning` and imports no package. The reason in their JSDoc: their tests and slice 14's steering run without a renderer.

Nothing else changes.

## What must stay unchanged

- Every existing test, green and with the same name. `GOLDEN`, the bot's seed lists and every version hold.
- Every renderer, `camera.ts`, `groundPlacement.ts`, `groundMesh.ts`, and every file under `src/game`, `src/input`, `src/tape` and `src/dev`.

## Planned tests

Pin every name as a `test.todo` first against stubs that return a wrong value of the right type. Take the expected values from the design record's play layer table and the bullets under it, never from running your module. Each test carries a comment citing the ruling it enforces. Compare to 1e-6 unless the test says otherwise.

`src/app/screens/game/__tests__/playLayer.test.ts`:

1. the scene's play layer reads the field's top as the ground under the top row and stretches it 1.224454 along: `top` -168.081604 (A18)
2. the field's top row and bottom row are the column's: field (0, 0) draws at (0, 0) at scale 0.822071, and field (540, 760) at (540, 760) at scale 1.177929 (A18, T10: the 540 by 760 is the viewport)
3. across, a field unit is a column unit at every row: field x 0, 135, 270, 405 and 540 draw at those column x at field y 0, 190, 380, 608 and 760 (T10)
4. the grave's start, field (270, 608), draws at (270, 559.555815) at scale 1.084074
5. field (100, 100) draws at (100, 72.678500) at scale 0.856101, and field (400, 700) at (400, 676.868170) at scale 1.139004
6. a play thing sits on the camera's own row: for field y 0, 100, 380, 608 and 760, the row is the row `groundToColumn` gives the ground y under it on the column's centre, within 1e-9
7. column to play is the exact inverse of play to column: for every column point on a 9 by 9 grid over the column, play to column of column to play returns the point within 1e-9; column (123, 456) is field (123, 518.678147)
8. a column point above the horizon has no field point: column (270, -1756) is null and (270, -1755) is not
9. the ground under a play thing is the ground the camera shows where it draws: field (0, 608) is over ground (20.939582, 576.386319), (540, 608) over (519.060418, 576.386319), (270, 380) over (270, 297.210848)
10. rows per field unit along: 0.697895 at field y 0, 0.968341 at 380, 1.213640 at 608, 1.432881 at 760 (A18)
11. a traced outline has no step longer than `OUTLINE_STEP`, begins where the outline begins, and closes when asked to
12. a field point one unit inside a traced circle of radius 32, 104 and 270 draws inside the traced polygon, and one unit outside draws outside, all around the circle, for circles centred at field (20, 608), (270, 608), (520, 608), (270, 100) and (270, 740) (A20)
13. the field's width is the column's: `FIELD_WIDTH` equals `COLUMN.width`, which is what lets field x be column x (A18)

`src/app/screens/game/__tests__/playPlacement.test.ts`:

14. a lying thing at the grave's start draws at (270, 559.555815), 1.084074 across and 0.991168 down (A19)
15. a standing thing of half-height 11 at field (270, 380) has its feet on column row 323.093772 and its centre on row 312.386873, at scale 0.973355 on both axes (A7, A19)
16. an airborne thing draws at its play point at the scale for its row, on both axes
17. mob fire draws at scale one at field y 0, 190 and 380, at 1.213640 at 608 and 1.432881 at 760, one scale on both axes (A21)
18. a body moving straight down heads straight down the column at any x, 1.570796 radians, at field x 0, 270 and 540 (T10: mobs move straight)
19. a body moving (3, 4) at field y 608 heads 1.017264 radians on the column
20. a lift of 10 field units straight up at field (270, 100) is 10 times 0.856101 straight up the column
21. a body at offset (13.5, -27) from a grave at (270, 608) of size 27 lands at (0.461223, -0.986044) in the grave's frame; at (0, 27), (0, 1.014357); from a grave at (40, 700) of size 27, offset (13.5, -27) lands at (0.438980, -0.985347); from a grave at (270, 100) of size 48, offset (-24, -48) at (-0.5, -0.980517) (A24)
22. what the grave's frame draws at the frame offset of a point is where the play layer draws that point: for the four cases above, the frame's column point (the grave's play point plus the offset times `graveFrameOnPlay`'s two scales times the size) equals `playToColumn` of the point within 1e-9 (A24, the promise behind test 21)
23. `fromGraveFrame` undoes `graveFrameOffset`: for the four cases above, within 1e-9
24. a velocity of (1, 2) field units per tick at a grave at field y 608 of size 27 is (0.034165, 0.074074) grave units per tick in the frame
25. the grave's frame is 1.084074 across and 1.213640 along at field y 608, and 1 across and 0.756871 along at field y 100 (A29)
26. the grave's ground rectangle covers its hitbox along exactly: for a grave of size 27 at (270, 608), half extents 13.5 and 27 come back as 13.5 and 33.060253, and its far and near ends draw on rows 527.244788 and 592.794441, the hitbox's rows; for size 48 at (270, 100) the across half extent is 24 times 1.191296 (A29)
27. the four corners of a grave's hitbox, drawn by the play layer, lie inside the pinhole's image of its ground rectangle (within 1e-9, on the edge counts), for graves of size 27, 48 and 67.5 at each side edge and the middle, at field y 100, 380, 608 and the lowest row each can stand on (A29)

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. Print, in your note, the design record's play layer table computed by your modules (every row and every bullet under it), each beside the record's value.
2. The two boundary rules are shown to bite: in a scratch copy under `local/tilt-slice-10/`, add a `pixi.js` type import to the copy of `playLayer.ts`, then of `playPlacement.ts`, and run the boundary test against each copy. Each must go red. The working tree is never mutated for this.
3. No rendered check: nothing a player can see changes.

## Done when

Every planned test is green, every verification step has a result in your note, no pin moved, and the working tree holds `playLayer.ts`, `playPlacement.ts`, their tests, the boundary rules and `docs/branch/records/slice-10-note.md`, uncommitted.
