# Slice B: the play layer's math and everything that moves placed on it (design record T8, T10, T11, T12, A7, A18, A19, A20, A21, A24, A29, A34)

Follow-along row B: "Mobs, the boss, enemy shots, food and the grave's shots move in straight lines on the screen again, at the edges as well as in the middle, while the ground still leans away. Things still look smaller near the top and bigger near the bottom."

One slice for one coder, carrying the old slice 10 and 11 entries whole, in order: the pure math first, then every placement on it. It runs after slices P1 and P2. Mark ruled A28 on 2026-09-27: tilt 9's rows (T11), which is what this entry builds.

**What slices P1 and P2 changed under this entry (T12).** The field's height is the run's own, 760 to 1260, and there is no `FIELD_HEIGHT`, `COLUMN` or `SCENE_CAMERA` any more: each run has a `Scene` (`src/app/screens/game/scene.ts`: its field, its column and its camera), built by `sceneFor(field)` and handed to every renderer and to steering by `useScene(scene)` when the run begins. So wherever the parts below say `SCENE_PLAY_LAYER`, read the scene's play layer: this slice adds `playLayer: PlayLayer` to `Scene`, built in `sceneFor` as `makePlayLayer(camera, column)`, and every renderer places through the play layer of the scene it was handed. Wherever they say `FIELD_HEIGHT`, read the column's height. The play layer's math is the same function on every shape; the tests pin it on the 760 field (the design record's first table) and on a 1168 field (its second table), and every relational test runs on both. The two boundary rules below also let `scene.ts` reach `app/screens/game/playLayer`.

Inside the parts, the old slice numbers still appear and map as: slice 10 and 11 are this branch's slice B, slice 12 and 13 are slice C, slice 14 is slice A, slice 15 and 16 are slice D. The parts' scratch folders stay as named. The parts share one note, one uncommitted working tree and one return.

## Part 1: Slice 10: the play layer's math (design record T10, A18, A19, A20, A21, A24, A29)

Follow-along row 10: "The groundwork for drawing everything that moves so it moves straight on the screen, worked out and tested on its own. Nothing on screen changes yet."

Mark ruled A28: tilt 9's rows (T11). `playToColumn`'s rows are the camera's own.

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. This entry is the planning half of the flow. Your scratch folder is `local/tilt-slice-10/` in the worktree. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read at `9b125bbc03`; slice 9 restored `FIELD_WIDTH` and `FIELD_HEIGHT` and moved lines only in `camera.ts`'s import block, so follow the name beside a number that has moved.

### What this slice builds, and why

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

### The source it is learned from

Tilt 9's `playToScreen` and `screenToPlay` (prototype worktree, `apps/hungry-grave/src/prototypes/tilted-view/index.html:758-778`), `aimHoleCamera` (`:1773-1788`) and `aroundGrave` (`:3099-3110`). Learn the idea; build fresh. The one departure, already decided (A18): in the prototype the field was the ground itself; here the fixed 540 by 760 field is spread over the ground the column's centre shows, so field y reads as the ground y `top + stretch * y`, with `top` the ground under the top row and `stretch` that ground's length over the column's height (the run's field's height, T12).

### Parts of the code this slice touches

**`src/app/screens/game/playLayer.ts` (new, pure: no Pixi import, not even a type).** It may import `Camera`, `Column`, `OnColumn`, `groundToColumn`, `columnToGround` and `visibleGround` from `./camera` (`camera.ts:139`, `:152`, `:178`, and its export block), and `FieldPoint` from `src/game/field.ts`. Its public interface, in one export block at the end:

- `interface PlayLayer { readonly camera: Camera; readonly top: number; readonly stretch: number }`. `top`: the ground y under the column's top row (-168.081604 on the 760 field, -369.054371 on the 1168 one). `stretch`: ground units along per field unit (1.224454 and 1.281514).
- `makePlayLayer(camera: Camera, column: Column): PlayLayer`. `top` is `visibleGround(camera, column).top`; `stretch` is that ground's length (`bottom - top`) over `column.height`. A pinhole row shows one ground y whatever its column x (`columnToGround`'s y reads the row alone, `camera.ts:152` onward), which is what lets one number stand for a row.
- No module-level play layer: the run's is `scene.playLayer`, built in `sceneFor` (`scene.ts`, slice P2), which gains that one field in this slice.
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

**`src/__tests__/boundary.test.ts`.** Two rules in the shape of the rules for `camera.ts` and `groundPlacement.ts` (`:180-204`): `screens/game/playLayer.ts` may reach `app/screens/game/camera`, `game/field` and `game/tuning` and imports no package; slice P2's rule for `screens/game/scene.ts` gains `app/screens/game/playLayer`; `screens/game/playPlacement.ts` may reach `app/screens/game/playLayer`, `app/screens/game/groundPlacement`, `app/screens/game/camera`, `game/field` and `game/tuning` and imports no package. The reason in their JSDoc: their tests and slice 14's steering run without a renderer.

Nothing else changes.

### What must stay unchanged

- Every existing test, green and with the same name. `GOLDEN`, the bot's seed lists and every version hold.
- Every renderer, `camera.ts`, `groundPlacement.ts`, `groundMesh.ts`, and every file under `src/game`, `src/input`, `src/tape` and `src/dev`. `scene.ts` changes only by its new `playLayer` field.

### Planned tests

Pin every name as a `test.todo` first against stubs that return a wrong value of the right type. Take the expected values from the design record's play layer table and the bullets under it, never from running your module. Each test carries a comment citing the ruling it enforces. Compare to 1e-6 unless the test says otherwise.

`src/app/screens/game/__tests__/playLayer.test.ts`:

Tests 1 to 10 and 14 to 27 below build their layer from `sceneFor(fieldOfHeight(760))`; the tall-field tests 28 to 32 from `sceneFor(fieldOfHeight(1168))`.

1. the 760 field's play layer reads the field's top as the ground under the top row and stretches it 1.224454 along: `top` -168.081604 (A18)
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
13. the field's width is the column's on every field: `FIELD_WIDTH` equals the scene's column width at 760, 1168 and 1260, which is what lets field x be column x (A18)

On the 1168 field (T12, the design record's second play layer table); tests 28 to 31 live in `playLayer.test.ts` and test 32 in `playPlacement.test.ts`:

28. the 1168 field's play layer reads its top as the ground under the top row, -369.054371, and stretches it 1.281514 along; field (0, 0) draws at (0, 0) at scale 0.726551 and field (540, 1168) at (540, 1168) at scale 1.273449 (A18, T12)
29. the grave's start on the 1168 field, (270, 1016), draws at (270, 925.353867) at scale 1.159834; field (100, 100) at (100, 59.231661) at 0.754285; field (400, 1108) at (400, 1066.751116) at 1.226041
30. rows per field unit along on the 1168 field: 0.570538 at field y 0, 0.925226 at 584, 1.453931 at 1016, 1.752733 at 1168
31. on the 1168 field column (123, 700) is field (123, 845.491370), and tests 6, 7, 11 and 12's relations hold there as on the 760 field
32. placements on the 1168 field: mob fire at field y 1016 draws at scale 1.453931 (A21); the grave's frame at field y 1016 is 1.159834 across and 1.453931 along (A29); tests 22, 23 and 27's relations hold for graves of size 27 at (40, 1016), (270, 1016) and (500, 1016)

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

### Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. Print, in your note, both of the design record's play layer tables computed by your modules (every row and every bullet under each), each beside the record's value.
2. The two boundary rules are shown to bite: in a scratch copy under `local/tilt-slice-10/`, add a `pixi.js` type import to the copy of `playLayer.ts`, then of `playPlacement.ts`, and run the boundary test against each copy. Each must go red. The working tree is never mutated for this.
3. No rendered check: nothing a player can see changes.


## Part 2: Slice 11: everything that moves, except the grave, placed on the play layer (design record T8, T10, A7, A18, A19, A21)

Follow-along row 11: "Mobs, the boss, enemy shots, food and the grave's shots move in straight lines on the screen again: a mob walking down the field walks straight down the screen and a skull flies straight up it, at the edges as well as in the middle, while the ground still leans away. Things still look smaller near the top and bigger near the bottom."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Load the `pixijs-skills:pixijs` skill before you touch Pixi code, and check every Pixi claim in `node_modules/pixi.js`. Your scratch folder is `local/tilt-slice-11/` in the worktree; the capture tool is `local/tilt-shots/` (its README says how to run it). All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read at `9b125bbc03`; slice 9 changed identifiers only and slice 10 added files, so follow the name beside a number that has moved.

### What this slice builds, and why

Slice 2 drew every piece of the field through the pinhole camera. A pinhole converges lines of constant ground x, so a body moving straight down the field drifts toward the middle of the screen as it comes near, and so does a skull going straight up. Mark: "When I shoot my main weapon, that goes straight forward. It now no longer goes straight forward... The mobs and the weapons should also not be dealing with that tilt" (T10). This slice moves every play thing except the grave onto slice 10's play layer: field x is column x, rows are the camera's own, sizes are the camera's for the row (A18, A19). The ground and its dressing stay on the pinhole. The areas of effect drawn as exact images and the ground's scroll are slice 12; the grave is slice 13.

When it works, a player looking at a run sees:

- Mobs walking straight down the screen and skulls flying straight up it, at the left edge, the middle and the right edge.
- Things still smaller near the top and larger near the bottom, at the sizes they draw today.
- Mobs arriving across the whole top of the screen, corner to corner, because the field's width is the column's at every row (T8).
- Mob fire never drawn smaller than its hitbox (A21).
- The frame, clip, HUD and buttons exactly where they are.

### Rulings this slice builds

T8, T10, A7 as amended, A18, A19, A21. Read each in `apps/hungry-grave/docs/design/tilted-view.md`.

### Parts of the code this slice touches

Every renderer below places through the play layer of the scene it was handed (`useScene`, slice P2) and slice 10's `playPlacement.ts`, and none of them reads the scene's camera or `groundPlacement.ts` after this slice. The line numbers below were read before slice P2, which changed `SCENE_CAMERA` at each of them to the renderer's scene; follow the call beside the number.

**`src/app/screens/game/FieldRenderer.ts`.**

- Mobs (`syncMobs`, `:358` onward): `standingAt(SCENE_CAMERA, mob.x, mob.y, halfHeight)` at `:370` becomes `standingOnPlay(SCENE_PLAY_LAYER, ...)`; the chaser's wedge, `headingOnColumn(...)` at `:378`, becomes `headingOnPlay`. The depth sort (`bodies.sortableChildren`, `:226`; `sprite.zIndex = mob.y + halfHeight`, `:373`) does not change: rows rise with field y (A8).
- Shots (`syncShots`, `:384` onward): `hostileFireAt` at `:415` becomes `hostileFireOnPlay` (A21).
- Corpses and treasure (`syncCorpses`, `:421` onward): `lyingAt` at `:457` becomes `lyingOnPlay`; the placement parents and the teeter inside them stay.
- Scatters: `airborneAt` at `:491` becomes `airborneOnPlay`. `cancelAt`'s inside-the-field test (`:480-486`) stays in field units.

**`src/app/screens/game/StormRenderer.ts`.**

- Loss pops (`weaponStripped`, `:710-720`): `airborneAt` at `:715` becomes `airborneOnPlay`.
- Skulls (`syncSkulls`, `:728-742`): `airborneAt` at `:738` becomes `airborneOnPlay`.
- The lob mark (`syncArrivals`, `:796-842`): `airborneAt` at `:831` and `liftOnColumn` at `:832-838` become `airborneOnPlay` and `liftOnPlay`.
- Wisps (`syncWisps`, `:844-867`): `airborneAt` at `:854` and `headingOnColumn` at `:859-865` become `airborneOnPlay` and `headingOnPlay`.
- Bursts (`syncBurst`, `:900-919`): the eruption's and the splash's placement, `lyingAt` at `:916`, becomes `lyingOnPlay`. Territory's patches (`:755-757`) and the bell's cones (`:874-876`) are placed with `lyingOnPlay` too. All three areas keep their drawers until slice 12 traces them (A20).
- The ring's fade (`:877-878`) and the patch's tint and alpha (`:758-765`) stay.

**`src/app/screens/game/BossRenderer.ts`.** `standingAt(SCENE_CAMERA, boss.x, boss.y, BOSS_HALF_HEIGHT)` at `:56` becomes `standingOnPlay`.

**`src/app/screens/game/BackgroundRenderer.ts`.**

- The Waking's source (`syncSource`, `:427` onward): `lyingAt` at `:441` becomes `lyingOnPlay`. It is a sim thing.
- The dressing (`placementOf`, `:136-139`, `placeDressing`, `:381` onward) is scenery and stays on the pinhole. `GROUND_SPEED` is slice 12's.

**`src/app/screens/game/groundPlacement.ts`.** After this slice `airborneAt` (`:79`), `hostileFireAt` (`:88`), `headingOnColumn` (`:99-110`) and `liftOnColumn` (`:117` onward) have no caller: delete them and their tests (`groundPlacement.test.ts:80`, `:90`, `:104`, `:115`, `:125`). Their promises are slice 10's tests 16 to 20 on the play layer. `lyingAt` and `standingAt` stay for the dressing (and `lyingAt` for the grave until slice 13).

**`src/__tests__/boundary.test.ts`.** A fence that fails if `FieldRenderer.ts`, `StormRenderer.ts` or `BossRenderer.ts` imports `./camera` or `./groundPlacement` (a deliberate absence, guarded by a test, `.claude/rules/code-core.md`, Tests).

### What must stay unchanged

- Everything under `src/game`, `src/input`, `src/tape` and `src/dev`. `GOLDEN`, the bot's seed lists and every version hold.
- `LAYER_ORDER`, the palette, every colour and every drawing's look at a point: only where things draw and at what size moves.
- The three areas' drawers and the ground's scroll (slice 12), the grave, its hole, the falls and the ending scene (slice 13), steering (slice 14), the ground's mesh and its dressing's placement.

### Planned tests

Pin every name as a `test.todo` first. Expected values come from the design record's play layer table, worked independently, never from running the code. Each test cites the ruling it enforces.

`src/app/screens/game/__tests__/FieldRenderer.test.ts`:

1. a mob stands on its footprint where the play layer puts its feet
2. a mob walking straight down the field draws at one column x all the way down, at field x 20, 270 and 520 (T10)
3. a corpse lies at its play point at the camera's size for its row, foreshortened down the column, and its teeter turns it inside that foreshortening
4. a shot draws at its play point, at scale one near the top and at the play layer's stretch along near the bottom, never smaller than its hitbox's image (A21)
5. the ghoul's wedge points the way it moves on the play layer, and a ghoul moving straight down points straight down at every x

`src/app/screens/game/__tests__/StormRenderer.test.ts`:

6. a skull and a wisp draw at their play points at the camera's size for their row, and a skull's drawn x is its field x at every row (T10)
7. the lob mark lifts straight up the column off its path, by the lift times the camera's scale there
8. a patch, the bell's cones and the belch's eruption are placed at their play points

`src/app/screens/game/__tests__/BossRenderer.test.ts`:

9. the boss stands on its footprint where the play layer puts its feet

`src/app/screens/game/__tests__/BackgroundRenderer.test.ts`:

10. the Waking's source lies at its play point

`src/__tests__/boundary.test.ts`:

11. the renderers of the play layer's things place through the play layer and never through the camera's placements

**Existing tests whose premise this changes.** Each asserts a thing drawn at the pinhole's point for its field point, which T10 changes. Replace each with the new test named beside it, keep its promise where it has one beyond the position, and list every replacement in your note:

- `FieldRenderer.test.ts` `'a mob stands on its footprint where the camera puts its feet'` (`:1476`): test 1. `'a corpse lies on the ground, foreshortened down the column, and its teeter turns it inside that foreshortening'` (`:1509`): test 3. `"a shot draws at its ground point at the camera's size near the bottom and never smaller than today's size near the top"` (`:1549`): test 4. `"the ghoul's wedge points the way it moves on the column"` (`:1570`): test 5. `'a nearer mob draws over a farther one'` (`:1492`) keeps its promise and should pass unchanged; if it goes red, stop and report.
- `StormRenderer.test.ts` `"a skull and a wisp draw at their ground points at the camera's size"` (`:814`): test 6. `'a patch lies on the ground, and the lob mark lifts off its path straight up the column'` (`:834`): tests 7 and 8. `'drifts the eruption down the field, so it still covers the bodies it caught when it ends'` (`:350`): its promise stays at the play layer's points. The lob mark's other tests assert relations between points; each is asserted at the play layer's points for the same field points.
- `BossRenderer.test.ts` `'the boss stands on its footprint where the camera puts its feet'` (`:307`): test 9.
- `groundPlacement.test.ts` `:80`, `:90`, `:104`, `:115`, `:125`: deleted with their functions; slice 10's tests 16 to 20 carry their promises.

Any other test that goes red follows the coder contract's stop rule.

### Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. **The tapes still play.** The four tapes slice P1 recorded in `local/tilt-shots/tapes/` (the two 760 tapes and their `-h1168` twins) each verify to their end in the replay screen. A tape that stops verifying is a stop and report.
2. **Rendered check.** With the capture tool, shoot the "before" set's ticks (`local/tilt-shots/before/`, today's flat game) and slice 2's ticks after the change on the 760 tapes, and the same checks on the `-h1168` tapes at ticks `tape-ticks.ts` gives for the same sections, so each check is read on a tall phone's field too. Read every shot and say: mobs and skulls at the left and right edges stand and fly on straight vertical lines (compare two ticks a second apart and give the drawn x of three named mobs and three skulls at each); the top corners have mobs in them in a busy section; far things are smaller; corpses and patches lie; the frame, the HUD and the buttons have not moved. Put one "before" and one "after" of the same tick side by side in `local/tilt-slice-11/` and describe the difference.
3. **Measured straightness.** On each of the two field heights, for one busy tick at each of three positions across the column (a mob near the left edge, the middle, the right edge), read the renderer's placed x for that mob over 60 consecutive ticks in a test or a scratch script under `local/tilt-slice-11/` and report the largest change in drawn x that its field x did not make (it must be 0 to 1e-9).
4. **Console.** A live run in the built app, played with a few key presses, shows no error and no warning.

Open for the human after this slice: nothing on its own; the grave still draws on the pinhole until slice 13, so a swallow's handover is not judged here.



## Done when (the whole slice)

Every planned test of both parts is green, on both field heights where the test names them, every replaced test is listed, every verification step of both parts has a result in one note, `docs/branch/records/slice-B-note.md`, no pin moved, and the working tree holds the code and the tests, uncommitted.
