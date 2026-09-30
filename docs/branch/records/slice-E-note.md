# Slice E note: Mark's tilt 13 settings (T13)

## 1. What changed

- `src/app/screens/game/camera.ts`: `CAMERA_VALUES` is 25 degrees and 13 starting half-lengths (T13). `stanceOverGrave`, `Stance`, `Grave`, `bladeReach`, `BLADE_LEAN_DEGREES` and `BUILD_7_TILT` removed: the stance went with the shared hole, and the blade reach's only reader was the painted ground.
- `src/app/screens/game/graveDrawingValues.ts`: `HOLE_CAMERA_HEIGHT` (4.95, build 7's) added; `FALL_CAMERA` reads its height from it and keeps its setback 1.07. `STANCE_REBAKE_STEP` removed.
- `src/app/screens/game/GraveRenderer.ts`: `holeViewOver(camera)` is the hole's own camera: height 4.95, nadir `(0, 4.95 tan(tilt))`, R4's dark. The bake is keyed on the size alone; `GraveSpot`, `stanceMoved` and the `groundUnderPlay` read are gone.
- `src/app/screens/FrameBudgetScreen.ts`: the falls take `holeViewOver(measuredScene.camera)`; `measuredGrave` and two imports removed as unused.
- `src/app/screens/game/BackgroundRenderer.ts`: the ground mesh wears the photo, asked for through the existing `standInArt` power under `standIn/ground/forest-ground.jpg` (`GROUND_PHOTO`: alias, a 512 by 512 tile, the night tint). `readiedGroundPhoto` sets repeat, linear, `autoGenerateMipmaps` and pushes the style; `dressGround` lays it once it arrives. The bake machinery (`GroundView`, `askForABake`, `bakeIfAsked`, `bakeGround`, `viewScaleFor`, the retired texture) is gone. The scroll wraps on the tile and keeps A22's stretch.
- `src/app/palette.ts`: `PHOTO_TINT.groundNight` (0xb8c4d8), a separate export because a multiply tint is not a drawn colour and PALETTE's band caps every row at luma 68 (it is 76.2).
- `raw-assets/standIn{m}/ground{fix}/forest-ground.jpg`: the prototype's embedded copy, `local/tilt11/ground/forrest_ground_01_1024_q80.jpg` in the prototype worktree (Poly Haven Forest Ground 01, diffuse, 1024 square). AssetPack packs a jpg and a webp into the `standIn` bundle.
- Deleted: `src/app/screens/game/groundPainting.ts` and its test. Its only other reader was `palette.test.ts`, which listed it in `GROUND_MODULES` and named it in a comment; both updated.
- `docs/design/tilted-view.md`: T13 appended after T12; T2, T3, T4 and A6 marked superseded, A9, A10 and A23 marked amended, in the record's status-line form. The contract bars coders from the record; the dispatch asked for this entry.

## 2. Verification results

Checks ran in a detached checkout of `eafb8c0e9a` carrying only this slice's diff and the photo. Another agent edited this worktree during the slice (below, "Open items"), and its uncommitted sim work turns 20 tests red in the shared tree.

- Spec first: the T13 camera test was written first and ran red on its own assertion (`1147.5 against 351`). The hole and photo code were written before their tests, so their red is shown by mutation instead, in a scratch copy: hole height at the scene's 13 turns three tests red (the 0.673469 far-wall share, the build 7 fall, the 4.95 / 2.308223 stance); the nadir moved sideways turns three red (mirror walls, stance, equal edge walls); a rebake every frame turns two red; the photo without its tint, mipmaps and 512 tile turns five red. The "sampled linearly" assertion is weak on its own: Pixi's default scale mode is already linear.
- Expected values: from an independent double-precision oracle of the record's formulas (`local/slice-E/slice_E_oracle.py`), checked first by reproducing every old 32.5 / 42.5 pin exactly.
- `pnpm --filter hungry-grave typecheck`: clean.
- `pnpm --filter hungry-grave build`: exit 0; prints the two pre-existing Rollup warnings slice 1 recorded (chunk size, @pixi/sound import).
- `pnpm verify`, exit 0: "All matched files use Prettier code style!"; housewarming "Test Files 7 passed (7)", "Tests 83 passed (83)"; hungry-grave "Test Files 188 passed (188)", "Tests 2771 passed | 11 expected fail | 2 todo (2784)".
- A first full run under load timed out three tests (`replayLifecycle` 5 s, `measure` 60 s hook, `harnessPolicy` seed 303 30 s) while other vitest processes ran; the three files alone pass 69 of 69, and `pnpm verify` above is green.
- Test names, before (2804) against after (2782): every lost name is one of these. Renamed because the pinned number moved: the play layer, placement, camera and ground-placement tests, and the ground's scroll rate. Renamed because the ruling moved: the camera describe (T2, T3 to T13), the fall describe, "the dressing and the Waking's source still draw over the photo", "the ground is a mesh laid on the column over the photo". Replaced because T13 changes the promise: the shared-stance tests (scene camera at 23.90625, the stance step, the stalest bake, the stance figures, left wall versus right, the scene-camera walls) by the own-camera tests (4.95 and 2.308223 everywhere, never rebaked by a move, mirror walls, equal walls at both edges, far-wall share 0.673469). Retired with the painting: the four bake tests, the sampler test (now inside the photo test), the blade reach, and `groundPainting.test.ts`'s 12.
- Rendered check, `vite preview` of the clean checkout through `local/tilt-shots/shoot.mjs` with an env-set viewport (the copy, not the worktree's tool), edge tapes at tick 1500, in `local/slice-E/`: `phone/` at 428 by 926 scale 3 on the 1168 tapes, `desktop/` at 1440 by 900 on the 760 tapes, each with `-view` and `-grave` crops. Grass, twigs and bare earth read plainly under the night tint, and the grain packs finer toward the top on both screens, so the ground leans away. The hole at the left and right edges shows a lit far wall and one inner side wall over the dark, and the two are mirror images, not different. Console: only the headless AudioContext autoplay warning. The preview server stopped with the tool; none is left running.
- Open for Mark: how the view, the hole and the photo look and feel on his phone.

## 3. Where the entry was wrong about the code

- The prototype's `ownHole` does not use build 7's setback 1.07. `aimHoleCamera` sets `holeNadir = { x: 0, y: holeCamera.setback }` (`index.html:1838-1840`), and `makeCamera` gives `setback: height * tan(tilt)` (`:670-679`), so at 25 degrees the nadir is 2.308 back. The walls and the falls both go through `belowGround` with that nadir (`:878-887`, `:2912-2914`). Built as the prototype does it; see decision 1.
- "Side walls that differ when the grave is at the left edge against the right" cannot hold with the hole on its own camera: its nadir is straight behind the grave everywhere. They are mirror images, which the shots and tests show.

## 4. Decisions made

1. The walls take the prototype's nadir (2.308), what Mark played; the fall keeps build 7's setback 1.07 on the same 4.95 height, so decision 7's three fall promises hold unchanged. On the prototype's nadir a body falling from the near rim would pass the near lip before the dark takes it. One value is shared (`HOLE_CAMERA_HEIGHT`); the nadirs are not, so the "one nadir" test became "the fall stands at the hole's height, straight behind the grave, and draws build 7's fall on both fields". To reverse: `fallViewFrom` takes the hole's nadir whole, and the first fall test goes red by the near lip.
2. The tint is `PHOTO_TINT` outside PALETTE, not a PALETTE row. Measured against ADR 0014's band over the photo's 1,048,576 texels, tinted luma runs 13.20 to 75.78, 62.28 at the 99.9th percentile, 0.016% above the ceiling of 68 and none at the fire floor of 88, before mipmapping (`local/slice-E/slice-E-photo-luma.cjs`). To reverse: a PALETTE row with an exemption in the band test.
3. The photo rides the `standIn` bundle and the `standInArt` power, as the dressing does; the ground is empty for the frames before it lands. To reverse: its own bundle loaded before the game screen.
4. The painted ground's palette rows stay: the readability tests measure sprites against them. See open items.
5. Two tests read to the float32 grid rather than a fixed tolerance, their promises unchanged. The ground-scroll test's top vertex now samples ground about 3,470 units away, and the drag test's move is five base speeds.

## 5. Open items

- Another session edited this worktree during the slice, uncommitted: `src/game/step.ts`, `src/game/tuningRecord.ts`, four `src/game/__tests__` files and `docs/design/grave-in-the-ground.md`. In the shared tree they turn 20 tests red, including FieldRenderer's teeter tests. None is this slice's and none was touched.
- Readability is unmeasured against the photo: the palette tests still check sprites against the painted ground's colours, which no longer draw. The photo is a placeholder, so this waits for Mark's art. For the close.
- For Mark's read with the art: tilt 8 was rejected partly for losing the side walls' change from left to right, and the own hole camera shows them equal everywhere (T13 names it).
- On the 1168 field the grave starts on column row 628 of 1168, about the middle of the screen (925 before). This is the tilt 13 camera, as Mark played it.
- The record's "Values are data" and play-layer tables are still at 32.5 / 42.5. T13 says so and names the new figures; the full tables are for the close. So are the charter's Goal line (32.5 / 42.5 / shared) and the record's intro "T1 to T12".
- A palette comment still describes the prototype's ground as painted over the field (`NOT_SPRITES`); for the close.
- The capture tool's viewport is fixed at 390 by 844; this slice used a patched copy. Making it take a viewport is for the close.

## 6. Stuck

None.
