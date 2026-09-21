# Slice 6: the grave looks exactly like the prototype's (design record R4)

Follow-along row 6: "The grave looks exactly like the prototype Mark approved: the prototype's own drawing code, with no pale ring round the hole, its walls, moss and grass. The ground stays as it is until Mark decides the colours."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice, except for the one rule this entry overrules below. This entry is the planning half of the flow. Your scratch folder is `local/148-slice-6/` in the worktree. Load the `pixijs-skills:pixijs` skill before you touch Pixi code.

## What this slice builds, and why

Mark looked at the deployed build (slices 1 to 4) and ruled, in his words: "this image does not look like the prototype. I feel like for the prototype we did a number of iterations to land on the right look and feel for the grave. That's what I want implemented here, exactly as it is in the prototype." After seeing side-by-side pictures (`local/148-look-compare/`, prototype left, game right), he added: "It doesn't even look like your left and right walls are equal size. It feels like you're trying to recreate that when you have the ability to get the exact same look by basically copy-pasting how the prototype did it. Can you do that first and then we can talk about whether or not we need to change colors?"

So this slice ports the prototype's grave drawing code into the game, as close to line for line as TypeScript and the code rules allow. **This overrules the coder contract's "Never copy code out of it" for this slice only, by Mark's direct instruction.** Every number, colour, painter and step order of the prototype's grave is carried over unchanged. Where you find yourself choosing a value or a shape, stop: the prototype already chose it.

Slice 3 missed for three reasons, and this slice must not repeat any of them:

- It drew the grave with Pixi `Graphics` shapes. The prototype paints with the browser's 2D canvas (`CanvasRenderingContext2D`) and bakes the result into a texture (`bakeLayer`, `:1057`). The canvas's anti-aliasing, blur, gradients and composite modes are part of the look. Port the canvas painters as canvas painters, and show the baked result as a Pixi `Sprite` from a canvas texture, exactly as the prototype does.
- It built the art once in unit space and scaled it by size. The prototype rebuilds the hole at each size (`rebuildHole`, `:1477`), and several painters use screen-pixel widths (`onePx`, `:390`) that do not scale with the grave. Rebuild per size as the prototype does.
- It kept the game's pale two-colour rim. The prototype has no rim, and its `COLOR` comment (`:299-307`) says why.

The ground is not changed in this slice. The field keeps the game's dark ground tile. Mark will decide on colours after he sees this result. So the grave may look darker or lighter against the game's ground than it does in the prototype; that is expected and is not yours to fix.

When it works, the grave at the same size in the game and in the prototype is the same picture: same walls, same wall widths left and right, same far wall, same black, same lip bites, trodden margin, crumbs, turf shadow and overhanging grass, same colours. Only the ground around it differs.

## The source to port

The prototype is `.claude/worktrees/148-grave-fall/apps/hungry-grave/src/prototypes/grave-fall/index.html` (build 7, on `prototype/148-grave-fall`). Never change it. Port every piece the grave's look depends on, and list each one in your note as ported, or as not ported with the reason:

- `COLOR` (`:308-332`): the values the grave's painters read, which are `moss` and `mossDark`; the rest of the grave's colours are inline `rgba()` strings and the `SOIL` stops. `night`, `speckle`, `groundCold`, `groundWet`, `groundDamp`, `gravel` and `crack` are the ground's, `lipEarth` is the swallow crumbs', and `outline`, `bone`, `pumpkin` and the rest are the bodies' and the UI's, so they stay out.
- Utilities the painters use: `clamp`, `lerp`, `onePx`, `makeRandom` (`:393`, seeded, so the grave's look is the same every run), `grey`, `graveWidth`.
- The mouth: `ROUGH`, `roughAt`, `walkRectangle`, `NOTCHES`, `notchAt`, `mouthPolygon` (`:438-558`).
- The projection: `DARK_DEPTH`, `CAMERA_HEIGHT`, `CAMERA_BEHIND`, `belowGround`, `DARK_FALLOFF`, `lightAtDepth`, `OLD_SINK_SHARE`, `oldSinkY` if a painter reads it (`:560-597`).
- Geometry helpers: `outwardAt`, `polyBounds`, `tracePolys`, `hex` (`:600-634`).
- The walls: `SOIL`, `FACE_WASH`, `wallFaces`, `facePoint`, `FACE_STEPS`, `layerWander`, `traceLayerBoundary`, `traceFaceBand`, `traceFaceExtent`, `paintFaceLayers`, `paintSpadeCuts`, `paintFaceStones`, `paintFaceWash`, `paintDepthFade`, `paintNearLipShade`, `paintFace`, `paintCornerEdges` (`:643-883`).
- The opening and round it: `paintPit`, `paintLip`, `paintTrampledMargin`, `TREAD`, `treadAt`, `paintLooseCrumbs`, `paintTurfShadow`, `paintOverhangingGrass` (`:884-1056`).
- `bakeLayer` (`:1057-1074`) and `rebuildHole` (`:1477-1500`), including the layer order, the padding, the pixels per unit and how the baked sprites are placed and anchored on the grave.
- Whatever else those call. Read the call graph from `rebuildHole` down and port all of it.

Not ported: `paintGround` (`:1364`, the ground, see above), the headstone, the bodies, the sound, the sliders, the fall code (slice 4 already built the fall in the game).

## Parts of the code this slice touches

- `src/app/screens/game/GraveRenderer.ts`. Its public interface stays as it is: `attach(layers)`, `detach()` and `sync(grave, reservoirFullness, tick, territoryCharge)`, so its callers in `GameScreen.ts` and the replay screen do not change. Inside, the `Graphics` painters of slice 3 (`paintFaceBand`, `paintCornerEdges`, `paintTheHole`, `paintLipBites`, `paintTroddenMargin`, `paintBlade`, `paintTufts`, `paintTurfShadow`, `paintOverhangingGrass`, and the rim constants `GRAVE_RIM_STROKE`, `GRAVE_RIM_SHADOW`) are replaced by the ported canvas painters and baked sprites. Delete what the port replaces; leave no dead painter behind.
- The ported painters go in a new module named for their concept, for example `src/app/screens/game/gravePainting.ts`: pure functions that take a canvas 2D context and a size and paint. It imports nothing from Pixi, so it can be tested with a canvas stub. Splitting it by concept (the mouth, the walls, the margin) is your call under the code rules.
- `src/app/screens/game/graveProjection.ts` and `src/app/screens/game/graveDrawingValues.ts` (slice 3). `fall.ts` and `FallRenderer.ts` (slice 4) read the projection, so a fall stays inside the hole it falls into. If the game's projection values or formulas differ from the prototype's in any way, the prototype's win: change the table to the prototype's values, and let the fall read the same. Say in your note what moved. If a fall test moves as a result, that is expected; name it, and show it still passes against the new values.
- Values are data (contract rule). The prototype's constants go into `graveDrawingValues.ts` or a data table beside the painters, with the prototype's names and values. A constant in the painter body that the prototype also has inline may stay inline if it is exactly the prototype's, but say in your note which ones you left inline.
- The pale rim goes. The reservoir's glow and Territory's charge arc keep drawing on the band where they draw today, with their colours and behaviour unchanged, so a player still sees both. At rest (reservoir empty, no charge) nothing pale is drawn round the opening. If the glow or the arc draws a track even at rest, stop and report, with a picture.
- The hitbox and every rule stay untouched. Nothing under `src/game` changes. The tape, `WITNESS_VERSION`, `GOLDEN`, the bot's seed lists and `FORMAT_VERSION` hold.
- `src/app/palette.ts` and `src/app/__tests__/palette.test.ts`: the grave's colour rows become the prototype's values. The palette tests that pin slice 3's grave colours, and the separation checks against the ground (`SEPARATION_EXCEPTIONS`), will change. **This entry authorizes you to update those expectations to the prototype's values**, which is otherwise forbidden by the contract, and only those. For each: name the test, the old value, the new value. A separation check the grave now fails against the game's dark ground becomes an exception entry whose reason reads "the ground is decided after slice 6 (Mark, 2026-09-21)". Never delete a separation check.
- Baking cost. The prototype rebuilds on each size change, and the game's grave grows on every swallow. Build it the prototype's way first and measure on the frame budget screen (`src/app/screens/FrameBudgetScreen.ts`) at the ceiling size during a burst of swallows. If a rebuild per swallow costs more than the frame budget allows, rebuild only when the size has moved by a set step, and make that step a row in the data table, starting at the smallest step that keeps within budget. Report the numbers either way.
- Resolution. The prototype chooses pixels per unit from the view and the device pixel ratio. Port that choice. At device scale 3 on a 390 by 844 phone the baked grave must be as sharp as the prototype's.

## Tests to write first

Each is red first on its own assertion. Names are the promise.

1. "the grave's colours are the prototype's": each ported colour row equals the prototype's value, listed in the test.
2. "the left and right walls are equally wide at every size": at sizes 18, 27, 48 and 67.5, the drawn width of the left wall face and the right wall face (from `wallFaces`) are equal within a hair. Mark saw them unequal.
3. "nothing pale is drawn round the opening at rest": with reservoir 0 and charge 0, no rim stroke is drawn. This is an absence guard: it fails if a rim is added back.
4. "the reservoir's glow and Territory's arc still show": with reservoir full and charge half, both draw.
5. "the grave is painted the same way every time": two paints at the same size give the same pixels (the seeded random).
6. "the grave is repainted when its size changes": painting at 27 and at 33 gives different geometry, and a size that has not changed does not repaint.
7. Painter tests over a canvas stub that records calls, one per painter group, checking the prototype's order: pit, then far, right, left faces, then corner edges, then lip, margin, crumbs, turf shadow, overhanging grass (read the true order from `rebuildHole` and `bakeLayer` and follow it; if it differs from this list, the prototype wins and your note says so).

## Verification beyond the contract's floor

- **The side-by-side.** Photograph the built game through `vite preview` (not port 4173) with `playwright-cli` at 390 by 844, device scale factor 3, at sizes 18, 27, 48 and 67.5 (`?size=`; read `src/app/seedFromUrl.ts`). Photograph the prototype at 18, 27 and 48 the same way (its size slider tops out at 48). Make a side-by-side per size, prototype left, game right, with `ffmpeg` (ImageMagick and PIL are not installed; `local/148-look-compare/README.md` shows the command that worked). Save them under `local/148-slice-6/screenshots/`. The main session reads these before landing. In your note, describe each pair: the walls, their widths, the far wall, the lip, the margin, the grass, and every difference you can see other than the ground. A difference other than the ground is a failure of the port, and you fix it before you return.
- The proof tape `local/148-proof-tape/2000.tape` still verifies.
- A fall at the start size still falls inside the hole: hold one as slice 4's entry does and photograph it.
- The frame budget numbers from above.

## Done when

Every planned test is green, every verification step has a result in your note, the side-by-sides are saved and described, no pin moved except the palette expectations this entry authorizes, and the port list in your note marks every item.
