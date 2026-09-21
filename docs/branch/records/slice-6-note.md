# Slice 6 note: the grave looks exactly like the prototype's

## 1. What changed

- `apps/hungry-grave/src/app/screens/game/graveCanvas.ts` (new). The canvas the grave is painted on (`GraveCanvas`, a `Pick` of the 2D context calls the prototype makes, `setTransform` included), `Polygon`, and the prototype's shared helpers: `clamp`, `lerp`, `TAU`, `onePx(screenPixels, viewScale)`, `makeRandom` (seeded, verbatim), `tracePolys`, plus `coordinate` (a polygon index that throws past the end, needed under `noUncheckedIndexedAccess`) and `hex` and `rgba`, which turn a palette row into the canvas's colour strings.
- `apps/hungry-grave/src/app/screens/game/graveMouth.ts` (new). `ROUGH`, `roughAt`, `walkRectangle` (split into `rectangleLegs` and `pointOnLeg` to fit one screen), `notchAt`, `mouthPolygon`, `outwardAt`, `polyBounds`.
- `apps/hungry-grave/src/app/screens/game/graveWalls.ts` (new). `wallFaces`, `facePoint`, `layerWander`, `traceLayerBoundary`, `traceFaceBand`, `traceFaceExtent`, `paintFaceLayers`, `paintSpadeCuts`, `paintFaceStones` (split into `paintStones` and `paintRoots`, which share one random stream in the prototype's order), `paintFaceWash`, `paintDepthFade`, `paintNearLipShade`, `paintFace`, `paintCornerEdges`, `paintPit`. The projection is the game's own `belowGround` and `lightAtDepth`, wrapped once (`belowGroundAt`, `lightAt`) to take the prototype's field units.
- `apps/hungry-grave/src/app/screens/game/graveLip.ts` (new). `treadAt`, `paintTrampledMargin`, `paintLooseCrumbs`, `paintTurfShadow` (its far-lip trace pulled out as `traceFarLip`), `paintOverhangingGrass` (its blade loop pulled out as `paintBlades`), `paintLip`.
- `apps/hungry-grave/src/app/screens/game/GraveRenderer.ts`. Public interface unchanged (`attach`, `detach`, `sync`, `falls`, and the exports `glowAlpha` and `GRAVE_RIM_STROKE`). Deleted: the rim Graphics and its `redraw`, `GRAVE_RIM_SHADOW`, `aroundTheRectangle`'s normals, `MOUTH_*`, `WALL_FACES`, `insideTheMouth`, `onTheFace`, `paintFaceBand`, `paintCornerEdges`, `paintTheHole`, `paintLipBites`, `paintTroddenMargin`, `paintBlade`, `paintTufts`, `paintTurfShadow`, `paintOverhangingGrass`. Added the prototype's `bakeLayer` and `rebuildHole`, `replaceArt`, and a bake that runs in the pit container's `onRender(renderer)`. The mouth layer is now `[pitArt, falls, lipArt]`; the rim layer is `[glow, arc]`, both unchanged in colour, geometry and behaviour.
- `apps/hungry-grave/src/app/screens/game/graveDrawingValues.ts`. Removed slice 3's art rows (`FACE_BANDS`, `FACE_MOON`, `CORNER_EDGE_INK`, `CORNER_EDGE_WIDTH`, `ART_REACH_OUTSIDE`, `LIP_BITES`, `BITE_REACH`, `MARGIN_SWELL`, `MARGIN_REACH`, `MARGIN_PATCH`, `MARGIN_PALE_ALPHA`, `MARGIN_DARK_ALPHA`, `TURF_SHADOW`, `TURF_SHADOW_FAR`, `TURF_SHADOW_ALPHA`, `OVERHANGING_GRASS`, `BLADE_WIDTH`, `TUFTS`, `TUFT_BLADES`, `TUFT_FAN`, `TUFT_ALPHA`, `NEAR_LIP_FROM`). Added, with the prototype's names and values: `SOIL`, `FACE_WASH`, `FACE_STEPS`, `NOTCHES`, `TREAD`, `BAKE_PADDING` (pit 0.12, lip 0.3), `BAKE_PIXELS_PER_UNIT` (1 to 6), `HOLE_REBUILD_STEP` (0.4). `GRAVE_VIEW` unchanged; its comment now carries the prototype's "a seventh" and "three tenths".
- `apps/hungry-grave/src/app/palette.ts`. The grave's rows are the prototype's colours: `graveHole` 0x04060b to 0x000000, `graveWall` 0x1b2430 to 0x414b5c (SOIL at 0.18), `graveTurf` 0x263121 to 0x6e8a58 (`COLOR.moss`), and 20 new rows: `graveTurfDark` 0x4a6040, `graveSoilShadow` 0x232a38, `graveSubsoil` 0x333c4b, `graveSubsoilDark` 0x212834, `graveSubsoilDeep` 0x080b10, `graveSeam` 0x05080c, `graveSpadePale` 0x889ab4, `graveSpadeDark` 0x06090f, `graveStone` 0x68768a, `graveStoneShadow` 0x04070b, `graveRoot` 0x7a8272, `graveMoonWash` 0x8498b6, `graveShadeWash` 0x030509, `graveNearLipShade` 0x020408, `graveCornerEdge` 0x020306, `graveMarginDark` 0x202731, `graveMarginPale` 0x37404e, `graveCrumbShadow` 0x1a2029, `graveCrumbTop` 0x5e6a7c, `graveTurfShadow` 0x020407. `graveRim` and `graveGlow` untouched.
- `apps/hungry-grave/src/app/__tests__/palette.test.ts`, the changes this entry authorizes:
  - New test "the grave's colours are the prototype's", with `PROTOTYPE_GRAVE_COLOURS`.
  - `NOT_SPRITES` gains the 20 new rows (the grave's own art, drawn under every sprite, mostly translucent).
  - `SEPARATION_EXCEPTIONS` gains 21 entries, each with its figure and "the ground is decided after slice 6 (Mark, 2026-09-21)": graveRim over graveWall 40.13 and over graveTurf 38.03 (also named as not drawn), graveGlow/graveTurf 38.03, corpse 36.53/36.25, corpseRevenant 37.42/36.25, feast 43.98/36.25, powerUp -/36.25, mob -/36.25, banshee 44.10/36.25, territory 40.36/36.25, wisp 42.86/36.25, bellRing 44.11/36.25, belchEruption 44.07/36.25 (over graveWall / over graveTurf).
  - Existing grave exceptions re-measured on the new colours. undertaker/graveHole 24.72 to 24.77. skull/graveHole 44.42 to 44.47. splash/graveHole 40.81 to 40.85. undertaker/graveWall 22.10 to 12.07. undertaker/graveTurf 20.10 to 36.25. skull/graveWall 41.81 to 31.17. skull/graveTurf 39.81 to 36.25. splash/graveWall 38.19 to 27.55. splash/graveTurf 36.19 to 36.25. territoryGround/graveWall 43.30 to 32.66. territoryGround/graveTurf 41.30 to 36.25. The pairs whose figure moved on the prototype's colours also carry the slice-6 reason. The prose in `OVER_THE_CUT`, `OVER_THE_TURF` and the claimed-ground comment now states the prototype's values.
  - "keeps the cut earth under the ground it is cut into": the top end (graveWall 29.06 against nightSpeckle 13.99) now fails unless named in the new `CUT_EARTH_ABOVE_THE_GROUND` table, which holds graveWall with the slice-6 reason. The check stays, and it binds again once the entry goes. The bottom end is unchanged.
  - Assertion 10 (fire hue): the new `NO_HUE_AT_ALL` table names graveHole. `hsv(0x000000)` reports hue 0, which sits inside fire's red.
  - "holds the rim's geometry at both ends of its bracket": the thick end was `GRAVE_RIM_STROKE + GRAVE_RIM_SHADOW <= 4` and is now `GRAVE_RIM_STROKE <= 4`, because the one-unit shadow band went with the rim. The thin end is unchanged.
- `apps/hungry-grave/src/app/screens/game/__tests__/GraveRenderer.test.ts`, rewritten around the baked art. The rim tests are gone, the glow, arc, falls and glowAlpha tests are kept, and the planned tests are added. Stubs Pixi's `DOMAdapter` with a counting canvas, as `Button.test.ts` does.
- New tests: `__tests__/graveWalls.test.ts`, `__tests__/graveLip.test.ts`, `__tests__/graveMouth.test.ts`.

### The port list

Ported:
- `COLOR.moss` and `COLOR.mossDark` (as `graveTurf` and `graveTurfDark`), and every colour the grave painters write inline (the SOIL stops, `#000000` and each `rgba()`) as palette rows. Each alpha stays inline exactly as the prototype writes it, including its `toFixed`.
- `clamp`, `lerp`, `TAU`, `onePx`, `makeRandom`, `graveWidth` is the game's own (identical formula), `ROUGH`, `roughAt`, `walkRectangle`, `NOTCHES`, `notchAt`, `mouthPolygon`.
- `DARK_DEPTH`, `CAMERA_HEIGHT`, `CAMERA_BEHIND`, `DARK_FALLOFF` (already in `GRAVE_VIEW` at the same values), and `belowGround` and `lightAtDepth` (the game's own, wrapped to field units).
- `outwardAt`, `polyBounds`, `tracePolys`, `hex`.
- `SOIL`, `FACE_WASH`, `wallFaces`, `facePoint`, `FACE_STEPS`, `layerWander`, `traceLayerBoundary`, `traceFaceBand`, `traceFaceExtent`, `paintFaceLayers`, `paintSpadeCuts`, `paintFaceStones`, `paintFaceWash`, `paintDepthFade`, `paintNearLipShade`, `paintFace`, `paintCornerEdges`, `paintPit`.
- `paintLip`, `paintTrampledMargin`, `TREAD`, `treadAt`, `paintLooseCrumbs`, `paintTurfShadow`, `paintOverhangingGrass`.
- `bakeLayer`: the canvas size, the transform, anchor 0.5 and sprite size are the prototype's. The canvas comes from Pixi's `DOMAdapter` (the browser's `document` in the game), and the texture is built as an explicit `CanvasSource` rather than through `Texture.from`, which skips the texture cache.
- `rebuildHole`: the layer order (pit, then lip), the padding (0.12 and 0.3 of the width), pixels per unit `clamp(viewScale * devicePixelRatio, 1, 6)`, and the rebuild step (`> 0.4`, from `stepWorld`).
- `viewScale` is measured each frame as the stage units per field unit (read off the art's global transform) times the canvas's CSS width over the stage width. On a 390 by 844 phone it is 0.7222 in both the game and the prototype.

Not ported:
- `COLOR`'s night, speckle, groundCold, groundWet, groundDamp, gravel and crack belong to `paintGround`. lipEarth belongs to the swallow crumbs (index.html:1717). outline belongs to the bodies. bone, pumpkin and the rest belong to the body and the UI. No grave painter reads any of them.
- `grey`, `ease`, `pointInPoly`, `polygonArea`, `OLD_SINK_SHARE` and `oldSinkY`: none is called from `rebuildHole` down.
- `pitMask`, from `rebuildHole`, which masks the prototype's falling bodies with the mouth polygon. It shapes the fall and not the grave, and slice 4 owns the fall. See open items.
- The headstone, `paintGround`, the bodies, the sound, the sliders and the fall, as the entry says.

Inline numbers kept inline, each the prototype's own:
- The count multipliers and clamps: 0.4, 5 to 24; 0.12, 3 to 11; 0.08, 2 to 8; 0.05, 2 to 4; 0.06, 8 to 26; 0.055, 6 to 20.
- Every `lerp` range and every alpha.
- `layerWander`'s 1.7, 0.27 and 0.035.
- The seam's 0.011 and 0.7 pixels, the corner edge's 16 steps, 0.018 and 0.8, and the turf shadow's 0.016, 0.05 and 0.55.
- The mouth's bite of 0.1, corner radius of 0.06 and 88 steps; `ROUGH`'s 96 and its smoothing weights; the depth fade's 14 stops; the near-lip stops; `fillRect`'s 4-unit pad; the grass base of 0.035, the 1.6 spread and the 0.18 moss share; the margin's 1.25 swell.
- The eight random seeds, written in decimal. The palette scan forbids any `0x` literal under `screens/game`, comments included.

## 2. Verification results

**Planned tests, red first on their own assertion, then green.**
- "the grave's colours are the prototype's": red with 23 placeholder rows (`expected { graveHole: 263691, ... } to deeply equal { graveHole: +0, ... }`).
- Against stub painters: "the left and right walls are equally wide at every size" (`expected '18 0' to be '18 2'`), the pit-order test and the lip-order test (`expected false to be true`), "the grave is painted the same way every time" (the stub painted with `Math.random`) and the mouth-size test (`expected 0 to be greater than 0`).
- Against a stub renderer with no bake and no glow or arc drawing: "the reservoir's glow and Territory's arc still show" (`expected '18 false' to be '18 true'`), "the grave is repainted when its size changes..." (`expected +0 to be 2`), the padding test (`expected +0 to be close to 258.84`), the device-pixel test (`expected undefined to be 73`) and four kept glow and arc tests.
- "nothing pale is drawn round the opening at rest" is an absence guard and was green on the stub. The old renderer could not load once slice 3's values were deleted. It was proved by mutation in a scratch copy instead: a rim Graphics added to the rim layer turned it red (`expected '18 1' to be '18 0'`), and one added to the mouth layer turned it red the same way. My first form of the mouth half (`'strokeStyle' in piece`) stayed green under that mutation, so it was rewritten to find any `Graphics` under the mouth layer, and then it went red.
- Test 7's order was read from `rebuildHole` and `paintPit`/`paintLip`, and it matches the entry's list.

**Test names, before and after** (`vitest list --json`, file-qualified): 2538 before, 2545 after. Seven names were lost, all in `GraveRenderer.test.ts`:
- "the mouth lands in the graveMouth layer and the rim in the graveRim layer (ADR 0014)": the rim is gone. Replaced by "the baked hole lands in the graveMouth layer and the glow and the arc in the graveRim layer (ADR 0014)".
- "the hole grows with the grave: the black mouth is graveHitbox at the floor, the start size and the ceiling": the drawn hole is now a baked sprite with the prototype's padding, and its bites and corner rounding are the prototype's. Replaced by "the baked hole is centred on the grave, sized to it with the prototype padding round it".
- "the rim strokes inward on a true rectangle, so its outer edge equals graveHitbox at every size (ADR 0003)": the rim is gone. The glow's hitbox bound is kept in "draws the glow at the rim's own geometry..." (now measured against `graveHitbox`), and the arc's in the graveRim-children test.
- "the hole's art is built once and never cleared again, at any size": contradicted by the ruling. Replaced by "the grave is repainted when its size changes, and a size that has not changed does not repaint".
- "the mouth layer holds the ground art, the walls, the place for falls and the overhang, in that order": replaced by "the mouth layer holds the pit, the place for falls and the lip, in that order".
- "the bites, the grass and the tufts reach no farther outside the hitbox than the values table states": `ART_REACH_OUTSIDE` was slice 3's bound, and the prototype's lip canvas reaches 0.3 of the width. Replaced by the padding test.
- "the rim, the glow and the arc are still the three children of graveRim, and the arc never leaves the hitbox": replaced by "the glow and the arc are the two children of graveRim, and the arc never leaves the hitbox".

14 new names, the planned ones and the replacements above.

**Standing checks.**
- `pnpm --filter hungry-grave typecheck`: exit 0, closing `✔ AssetPack Completed in 34ms`, no tsc output.
- `pnpm --filter hungry-grave test`: `Test Files 173 passed (173)`, `Tests 2534 passed | 11 expected fail | 2 todo (2547)`.
- `pnpm --filter hungry-grave build`: exit 0, `✓ built in 6.97s`, with the pre-existing chunk warning (see open items).
- `pnpm verify`: exit 0, `apps/hungry-grave test: Tests 2534 passed | 11 expected fail | 2 todo (2547)`, `Done`.

**Pins.** `GOLDEN`, `WITNESS_VERSION`, the bot's seed lists and `FORMAT_VERSION` are untouched, and their tests pass. Nothing under `src/game` changed. No fall test moved: the game's projection values and formula were already the prototype's (4.95, 1.07, 2.4, 2.6, and the same ray in half-lengths rather than field units), so nothing moved for the fall.

**The side-by-sides** (`local/148-slice-6/screenshots/`). The game is the built app through `vite preview` on port 4186 and the prototype is served from its worktree, both through Playwright at 390 by 844, device scale 3, cropped on the grave with the earlier comparison's box. The files are `side-size18.png`, `side-size27.png` and `side-size48.png` (prototype left, game right), `zoom-size48.png` and `zoom-size18.png` (enlarged), `game-size67_5-crop.png` and every full frame. Both views measure 0.722 CSS pixels per unit, so the two are the same scale. The game crop is centred a few pixels high because its centre was computed from the start position.
- Size 48, enlarged: the opening is 210 by 418 pixels in both. The far wall shows the same layer seams in the same places, with the dark turf-shadow band under the far lip. The side walls are the same narrow width on both sides, the right one lit and the left one in shade, in both. The black and the depth fade into it are identical. The grass tufts sit at the same places: two on the far edge, one at the top-right corner, and two on each side.
- Sizes 27 and 18: the same shapes, the same wall widths, and the same tufts at the top-left corner and on the left edge.
- Size 67.5 (game only; the prototype stops at 48): the pale subsoil band, the seams, the lit right wall, the grass along the far edge and the trodden margin with its crumbs round the lip.
- Differences other than the ground: none that I can see. The bites out of the lip and the trodden margin read clearly against the prototype's pale ground and nearly vanish into the game's dark tile. That is the ground difference, not the port.
- No pale ring round the opening at any size.

**The proof tape** verifies: `"outcome": "verified"`, 22,821 ticks, `"ending": "victory"`, 381 checkpoints verified, `"recordedFaults": []`, `"readbackFaults": []`.

**A fall at the start size**, held by replaying the proof tape on a hand-pumped frame clock as slice 4 did (`local/148-slice-6/fall.mjs`, `screenshots/fall-strip-1030-1072.png`, full frames `fall-0.png` to `fall-14.png`):
- Tick 1036: a corpse lies just above the grave.
- Tick 1042: it is at the far-right rim.
- Ticks 1048 and 1054: it is inside the top-right corner of the mouth, over the far wall and under the lip's grass.

It falls inside the hole. Territory's arc shows on the band in every frame.

**Bake cost.** Timed on the real `GraveRenderer` in headless Chromium, importing the source through a vite dev server on port 4187, at device scale 3 (`local/148-slice-6/bench.mjs`). A bake is both canvases:
- Start size: median 1.50 ms, p90 1.90 ms, max 2.40 ms.
- Near the ceiling: median 2.10 ms, p90 7.80 ms, max 8.00 ms.
- A burst of 40 swallows at the game's 0.10125 a swallow near the ceiling baked 10 times at the 0.4 step, worst 6.60 ms.

All of that is inside a 16.7 ms frame on this desktop. It is a desktop figure: a phone is not measured, and the texture upload happens later in the render pass, which the timer does not see.

**Resolution.** The test "bakes at the pixels the phone shows" pins the prototype's choice at device scale 3 on a 390-wide phone: 0.7222 times 3 is 2.17 texture pixels a unit, a 73-pixel-wide pit canvas at size 27. The side-by-sides at device scale 3 show no softening against the prototype.

**Open for the human:** whether the grave looks right in play on a phone, and the colours once the ground is decided.

## 3. Where the entry was wrong about the code

- The `COLOR` list. The entry names night, speckle, groundCold, groundWet, groundDamp, moss, mossDark, gravel, crack, lipEarth and outline as "the values the grave's painters read". The grave's painters read only `COLOR.moss` and `COLOR.mossDark` (index.html:1041). The rest are `paintGround`'s (1364 to 1440), the swallow crumbs' (1717) and the bodies' (1097, 1177). Most of the grave's colours are inline `rgba()` strings and the SOIL hex strings. Those are what I ported, as palette rows.
- "The prototype rebuilds on each size change." It rebuilds only once the size has moved more than 0.4 from the size last drawn (`stepWorld`, index.html:2238), and on a renderer resize (2887). I ported that as `HOLE_REBUILD_STEP` = 0.4.
- "Measure on the frame budget screen." `FrameBudgetScreen.ts` builds no grave renderer on purpose (its `falls` field comment, around line 104: "This screen builds no grave renderer"). I timed the bake directly instead, as above.
- The projection: no difference, nothing moved.

## 4. Decisions made

- **The bake runs in the pit container's `onRender(renderer)`, not in `sync`.** The prototype's pixels per unit need the view's CSS pixels per unit, which only the renderer knows, and the entry fixes `sync`'s signature and the callers. `onRender` runs before Pixi validates renderables and updates transforms (`RenderGroupSystem.mjs:94-101`), so a bake there lands in the same frame. If the canvas cannot be measured, the bake waits and warns once. To reverse: hand the renderer a view-density power at construction and bake in `sync`.
- **The rebuild step is the prototype's 0.4.** It is the prototype's own rule, and the timing above shows a bake per swallow would also fit on desktop. To reverse: set `HOLE_REBUILD_STEP` to 0.
- **The pixels-per-unit choice reads `globalThis.devicePixelRatio`**, as the prototype does, and not the renderer's resolution, which the engine snaps to at least 2.
- **Palette structure.** graveHole, graveWall and graveTurf stay the three sprite rows that food is measured over, now the black, the brightest earth and the lighter blade. The other 20 are `NOT_SPRITES` background art, like the ground. To reverse: move a row into `SPRITE_LAYER` and give it a companion.
- **`GRAVE_RIM_STROKE` keeps its name** as the width of the band the glow and the arc ride, so their geometry does not move. `GRAVE_RIM_SHADOW` is deleted.
- **The `graveRim` palette row stays although nothing draws it.** Deleting it means deleting separation exceptions and assertion 1's `SPRITE_OUTLINE.graveRim` expectation, which this entry does not authorize.
- **The module split**: canvas helpers, mouth, walls, lip. The recording canvas is written out in each of the two painter test files, which the rule of three allows.
- **The canvas comes from `DOMAdapter`** and the texture is an explicit `CanvasSource({ resolution: 1 })`, so the renderer runs under the node test adapter and skips `Texture.from`'s cache.

## 5. Open items

- Mark's decision 7 tufts (translucent tufts growing on the ground round the grave) are gone. The prototype's grave has none (its tufts are `paintGround`'s), and the entry lists `paintTufts` for deletion. Whether they come back is his.
- `pitMask` is not ported. The prototype clips falling bodies to the mouth polygon, and the game's falls container is unmasked. That is slice 4's fall, not the grave's look.
- The `graveRim` row has no drawer.
- A phone's bake cost is unmeasured. The frame budget screen cannot see the grave, so this needs either a grave on that screen or a play on the deployed build.
- The bites and trodden margin are nearly invisible on the dark ground tile. This is expected until the ground is decided.
- Anomaly, pre-existing. The build warns "Some chunks are larger than 500 kB" for the pixi chunk (589.66 kB). Building the branch head in a detached scratch worktree gives the same warning at 589.65 kB. It is not in any ADR.
- Anomalies, environment. Headless Chromium logged ANGLE driver messages ("GPU stall due to ReadPixels" on screenshots, and "Running out of reserved outsideRenderPass queueSerial" under a burst of pumped frames), and "AudioContext was not allowed to start" before a user gesture. The live game's FPS readout read 3 in the headless software renderer. None came from the grave, which logged nothing, including its cannot-measure warning.
- `docs/branch/handoff.md` shows as modified in the working tree. I did not touch it.
- Every server and process I started is stopped: `vite preview` on 4186, the prototype's `http.server` on 8934 and `vite` dev on 4187 were killed by process id, the headless browsers closed with their scripts, the throwaway scratch worktree and mutant copy were removed, and `dist/2000.tape` was deleted. Port 4173 was never used. The instruments stay in `local/148-slice-6/`.

## 6. Stuck

None.

## Landing (the main session)

- The main session read the side-by-sides (`zoom-size48.png`, `side-size27.png`, `zoom-size18.png`) and saw the same grave on both sides at every size, with the ground the only difference.
- `pnpm verify` passes whole: 173 test files, 2534 tests passed, 11 expected fails, 2 todo.
- CodeRabbit, five minor findings, all on the records. Fixed: the follow-along row no longer claims the ground is brighter than the walls, and the entry's `COLOR` list now names only `moss` and `mossDark` as the grave's. Declined with this note as the answer: the entry asked for a frame budget measurement and a prototype picture at 67.5 that could not exist (section 3 above says why), and the test-name totals differ from the test totals by the two `todo` tests, which the name list does not count.
- Open after this slice: the ground and the colours (Mark's talk, next), decision 7's tufts (they were the ground's in the prototype, so they return or not with the ground), `pitMask` (the fall is not clipped to the mouth), and a phone's bake cost.
