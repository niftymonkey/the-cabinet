# Slice 1 coder note

## 1. What changed

- `apps/hungry-grave/src/app/screens/game/camera.ts` (new, pure): `Camera`, `Column`, `OnColumn`, `VisibleGround`, `Stance`, `CAMERA_VALUES` (32.5, 42.5), `COLUMN`, `makeCamera`, `SCENE_CAMERA`, `groundToColumn` (with `NEAREST_SHARE` 0.12), `columnToGround`, `visibleGround`, `stanceOverGrave`, `stepOnColumn`, `bladeReach` (`BLADE_LEAN_DEGREES` 62, `BUILD_7_TILT` atan(1.07 / 4.95)).
- `apps/hungry-grave/src/app/screens/game/groundPlacement.ts` (new, pure): `Placement`, `lyingAt`, `standingAt`, `airborneAt`, `hostileFireAt`, `headingOnColumn`, `liftOnColumn`.
- `apps/hungry-grave/src/app/screens/game/groundMesh.ts` (new, pure): `groundGrid`, `groundGridIndices`, the private `GROUND_GRID_VALUES` table (18, 40, 0.08).
- Their tests: `__tests__/camera.test.ts` (21), `__tests__/groundPlacement.test.ts` (9), `__tests__/groundMesh.test.ts` (4).
- `apps/hungry-grave/src/__tests__/boundary.test.ts`: two rules, for `camera.ts` and `groundPlacement.ts`.
- `local/tilt-shots/`: `shoot.mjs`, `README.md`, `tape-ticks.ts`, `tapes/`, `before/`.

No line of prototype code was ported line for line.

## 2. Verification results

- Floor 1: all 34 planned tests pinned as `test.todo` against stubs, then written; each was red on its own assertion (stub value beside the expected one, for example "0 against 591.320185"), then green. Red was taken per module rather than one test at a time.
- Floor 2, test names: 2615 before, 2651 after, 36 added (34 planned plus 2 boundary rules), 0 removed.
- Floor 3: typecheck exit 0; test `Test Files 180 passed (180)`, `Tests 2640 passed | 11 expected fail | 2 todo (2653)`; build exit 0, `✓ built in 7.16s`; `pnpm verify` exit 0, "All matched files use Prettier code style!", same test lines.
- Step 1, the capture tool: built and proven. Tapes are seed 1000, `steady-far`: `won-maxed-1000.tape` (victory at 23548) and `sealed-birthright-1000.tape` (sealed at 19991). 14 "before" shots, each held at exactly the tick asked for and each read: start fields of blue-grey walkers, stumps and statues with the grave low centre; procession with a column of green treasure; the Banshee over a bell ring; crowd and waking fields dense with green food; vigil with tentacles; the Undertaker firing a row of stars; his kill at 23548; the ending scene 1.5 s in, with the Undertaker dragged down lines into the grave; the sealed run's last tick with a stream of stars into a small grave.
- Step 2, the table (computed against the record): field top -168.081604 (-168.0816), bottom 762.503300 (762.5033), far row -58.438897 to 598.438897 (-58.4389 to 598.4389), near row 40.784202 to 499.215798 (40.7842 to 499.2158); scales at the top, middle and bottom rows 0.822071, 1, 1.177929 (0.822, 1.000, 1.178); stance over the starting grave 42.5 up, nadir (0, 18.631042); `bladeReach` 1.348502 (1.3485); height 1147.5, distance 1360.578182, lean 0.843391, rise 0.537300, `FAR_SHARE` 1.216440. All agree.
- Step 3: a copy with a `pixi.js` type import in `camera.ts`, then in `groundPlacement.ts`, turned each rule red ("imports pixi.js"). An unmutated control copy stayed green.
- Step 4: nothing a player sees changes.

## 3. Where the entry was wrong about the code

Nowhere.

## 4. Decisions made

- Tolerances: I used an explicit bound, `|actual - expected| <= 1e-6` (1e-9 where the entry says so), not `toBeCloseTo(x, 6)`. That call means within 5e-7, which is tighter than values rounded to six places can meet. To reverse, swap in `toBeCloseTo`.
- `headingOnColumn` uses the projection's exact derivative, not a projected finite step. The derivative leaves out the nearest-share hold, which only applies behind the camera's feet, off the column. `lyingAt`'s `scaleY` does the same, as the entry's formula does.
- The grid's v coordinate is `(ground y - scrolled) / tile height`, so scrolling lowers v by scrolled / height. That follows the entry's "less the scroll".
- Capture tool: it reads the tick off `fillText` and captures `canvas.toDataURL` inside the same frame, because `page.screenshot` hangs once frames are pumped. It runs the Chromium headless shell already on disk, because playwright-core pins a revision that is not installed.

## 5. Open items

- Finding: `pnpm build` prints two Rollup `(!)` warnings, "@pixi/sound ... dynamically imported ... but also statically imported" and "Some chunks are larger than 500 kB". An archive of HEAD built in scratch prints both too, so they predate this slice. No ADR explains them.
- In the capture, the console shows only the AudioContext autoplay warning, because headless has no user gesture. The FPS corner read 64 on one shot, so these shots are looks, not byte comparisons.
- The heading test uses the middle column only, so the off-centre spread term in `headingOnColumn` has no test.
- A capture takes about 40 seconds. My own 590-second `timeout` killed one run and left a `vite preview` running. I stopped it and the tool now stops its server on SIGINT and SIGTERM. No server or browser I started is still running.

## 6. Stuck

None.
