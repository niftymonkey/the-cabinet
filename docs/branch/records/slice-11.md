# Slice 11: everything that moves, except the grave, placed on the play layer (design record T8, T10, A7, A18, A19, A21)

Follow-along row 11: "Mobs, the boss, enemy shots, food and the grave's shots move in straight lines on the screen again: a mob walking down the field walks straight down the screen and a skull flies straight up it, at the edges as well as in the middle, while the ground still leans away. Things still look smaller near the top and bigger near the bottom."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. Load the `pixijs-skills:pixijs` skill before you touch Pixi code, and check every Pixi claim in `node_modules/pixi.js`. Your scratch folder is `local/tilt-slice-11/` in the worktree; the capture tool is `local/tilt-shots/` (its README says how to run it). All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read at `9b125bbc03`; slice 9 changed identifiers only and slice 10 added files, so follow the name beside a number that has moved.

## What this slice builds, and why

Slice 2 drew every piece of the field through the pinhole camera. A pinhole converges lines of constant ground x, so a body moving straight down the field drifts toward the middle of the screen as it comes near, and so does a skull going straight up. Mark: "When I shoot my main weapon, that goes straight forward. It now no longer goes straight forward... The mobs and the weapons should also not be dealing with that tilt" (T10). This slice moves every play thing except the grave onto slice 10's play layer: field x is column x, rows are the camera's own, sizes are the camera's for the row (A18, A19). The ground and its dressing stay on the pinhole. The areas of effect drawn as exact images and the ground's scroll are slice 12; the grave is slice 13.

When it works, a player looking at a run sees:

- Mobs walking straight down the screen and skulls flying straight up it, at the left edge, the middle and the right edge.
- Things still smaller near the top and larger near the bottom, at the sizes they draw today.
- Mobs arriving across the whole top of the screen, corner to corner, because the field's width is the column's at every row (T8).
- Mob fire never drawn smaller than its hitbox (A21).
- The frame, clip, HUD and buttons exactly where they are.

## Rulings this slice builds

T8, T10, A7 as amended, A18, A19, A21. Read each in `apps/hungry-grave/docs/design/tilted-view.md`.

## Parts of the code this slice touches

Every renderer below places through `SCENE_PLAY_LAYER` and slice 10's `playPlacement.ts`, and none of them reads `SCENE_CAMERA` or `groundPlacement.ts` after this slice.

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

## What must stay unchanged

- Everything under `src/game`, `src/input`, `src/tape` and `src/dev`. `GOLDEN`, the bot's seed lists and every version hold.
- `LAYER_ORDER`, the palette, every colour and every drawing's look at a point: only where things draw and at what size moves.
- The three areas' drawers and the ground's scroll (slice 12), the grave, its hole, the falls and the ending scene (slice 13), steering (slice 14), the ground's mesh and its dressing's placement.

## Planned tests

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

Any other test that goes red is a stop and report.

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. **The tapes still play.** The tapes in `local/tilt-shots/tapes/` were recorded at `517ee0753e`; the sim is untouched, so each still verifies to its end in the replay screen. A tape that stops verifying is a stop and report.
2. **Rendered check.** With the capture tool, shoot the "before" set's ticks (`local/tilt-shots/before/`, today's flat game) and slice 2's ticks after the change. Read every shot and say: mobs and skulls at the left and right edges stand and fly on straight vertical lines (compare two ticks a second apart and give the drawn x of three named mobs and three skulls at each); the top corners have mobs in them in a busy section; far things are smaller; corpses and patches lie; the frame, the HUD and the buttons have not moved. Put one "before" and one "after" of the same tick side by side in `local/tilt-slice-11/` and describe the difference.
3. **Measured straightness.** For one busy tick at each of three positions across the column (a mob near the left edge, the middle, the right edge), read the renderer's placed x for that mob over 60 consecutive ticks in a test or a scratch script under `local/tilt-slice-11/` and report the largest change in drawn x that its field x did not make (it must be 0 to 1e-9).
4. **Console.** A live run in the built app, played with a few key presses, shows no error and no warning.

Open for the human after this slice: nothing on its own; the grave still draws on the pinhole until slice 13, so a swallow's handover is not judged here.

## Done when

Every planned test is green, every replaced test is listed, every verification step has a result in your note, no pin moved, and the working tree holds the code, the tests and `docs/branch/records/slice-11-note.md`, uncommitted.
