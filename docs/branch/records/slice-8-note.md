# Slice 8 note: the prototype's ground on the whole field

## 1. What changed

- `apps/hungry-grave/src/app/screens/game/groundPainting.ts` (new). The ported painters and their data. Public: `GroundCanvas` (a narrow chainable interface naming exactly the eight Pixi drawing calls `paintGround` makes, which `Graphics` satisfies structurally), `Field`, `paintGround(canvas, field)`, `groundResolution(viewScale, devicePixelRatio, field)`, and `GROUND_PAINTING` (the one data table: 54 wide patches, 520 mottles, 70 cracks of 3 segments, 2600 grain flecks, 230 tufts of 5 blades, 180 gravel specks, seed 132781491, `baseOverflow` 4, texture cap 4096, resolution clamp 1 to 3). Private: `wrapsAt`, `paintWidePatches`, `paintMottles`, `paintCracks`, `paintGrain`, `paintBlade`, `paintTufts`, `paintGravel`. `clamp`, `lerp` and `makeRandom` are reused from `graveCanvas.ts` rather than written again.
- `apps/hungry-grave/src/app/screens/game/BackgroundRenderer.ts`. Public interface unchanged (`BackgroundProps { standInArt }`, `attach`, `sync`, and the four exports), so `GameScreen.ts` and `ReplayScreen.ts` are untouched. The ground `TilingSprite` keeps `Texture.EMPTY` at construction and loses `tint = GROUND_TINT.hex` and `tileScale.set(DRESSING_SCALE)`. New `FIELD`, `GroundView` (the three readings the bake takes off the renderer), `askForABake`, `bakeIfAsked`, `bakeGround` and `viewScaleFor`; `sync` now calls `bakeIfAsked` first; `syncGround` keeps `tilePosition.y = tick * GROUND_SPEED` and nothing else. The dressing pool, `syncDressing`, `placeDressing`, `dressingFor`, `syncSource` and `textureFor` are untouched.
- `apps/hungry-grave/src/app/screens/game/groundDressing.ts`. `GROUND_FLOOR` and `GROUND_TINT` are gone with their JSDoc, and the file header no longer names the tile. Everything else is untouched.
- `apps/hungry-grave/src/app/palette.ts`. Seven new rows in a block of their own: `groundNight` 0x454f5d luma 30.54, `groundSpeckle` 0x66748a 44.95, `groundCold` 0x56657a 38.95, `groundWet` 0x466050 35.03, `groundDamp` 0x2c3644 20.74, `groundCrack` 0x28313d 18.81, `groundGravel` 0x8d9cae 60.44. `standInGroundDressCold` re-valued from 0x303947 luma 22.00 to 0x54647c luma 38.56 (section 4). Four comments that this slice made false are corrected: the grave block's "the prototype's ground was brighter than this field's", the stand-in block's "the ground tile wears `nightSpeckle`" and its two measured figures, the Vigil tint's "the four ground colours", and the Waking source's "Lc 23.45 over the ground tile". No `grave*` hex moved.
- `apps/hungry-grave/src/app/screens/game/fieldFrame.ts`. `boundaryReadout`'s JSDoc sentence corrected; the colour, the width and the alignment are untouched.
- `apps/hungry-grave/src/app/__tests__/palette.test.ts`. Section 4 lists every change.
- New tests: `src/app/screens/game/__tests__/groundPainting.test.ts` (8). Added to `src/app/screens/game/__tests__/BackgroundRenderer.test.ts`: a new describe with 5, and one existing test deleted (section 2).

### The port list

Ported, each in the prototype's own order with its own count, colours and alphas:

- `paintGround` `:1369` the base fill, `:1373-1383` the 54 wide patches, `:1389-1398` the 520 mottles, `:1400-1410` the 70 cracks of three segments, `:1413-1421` the 2600 grain flecks, `:1424-1435` the 230 tufts of five blades, `:1436-1439` the 180 gravel specks, `:1463-1473` the bake as one texture over the whole field shown at the field's size.
- The seed `makeRandom(0x7ea15b3)` (`:1368`), written in decimal as 132781491, one stream drawn in the prototype's own order.
- `COLOR` (`:308-326`), the nine rows `paintGround` reads. `moss` and `mossDark` reuse `graveTurf` and `graveTurfDark`; the other seven are new rows.
- `makeRandom` (`:393`) and `lerp` (`:378`), reused from `graveCanvas.ts`.
- `groundResolution` (`:1357-1361`) and `MAX_GROUND_TEXTURE_PX` (`:1355`), whole: `clamp(min(scale * devicePixelRatio, 4096 / width, 4096 / height), 1, 3)`.

Not ported: the nine far markers (`:1442-1456`) and `COLOR.marker`, for the three reasons the entry gives, and I agree with all three. `grey`, `ease`, `pointInPoly`, `polygonArea`: none is called from `paintGround`. The headstone, the bodies, the sound, the sliders, the grave and the fall: slices 4 and 6 own them.

Two additions to the painters' bodies, neither a change to a colour, a count or a placement, and neither drawing off the stream:

- The wrap the entry authorises: every shape whose extent crosses y = 0 or y = the field's height is painted a second time a field height away.
- The base earth is painted `baseOverflow` = 4 units past every edge. This one is mine and it is a seam fix; section 4 carries it.

Inline numbers kept inline, each the prototype's own: every `lerp` range (22 to 96, 0.3 to 0.7, 4 to 22, 0.4 to 0.85, -13 to 13, -9 to 9, 0.3 to 0.8, 0.35 to 1.2, 0.25 to 0.8, -4 to 4, -3 to 3, 2.4 to 6, -1.4 to 1.4, -2.4 to 2.4, 0.3 to 0.75, 0.7 to 2.2, 0.14 to 0.34, 0.09 to 0.22, 0.07 to 0.2), every pick threshold (0.32, 0.62, 0.3, 0.42, 0.5), the fixed alphas 0.45 and 0.7, the mottle's `Math.pow(..., 1.4)`, the blade's 0.5 control height.

## 2. Verification results

**Every planned test written, red on its own assertion first, then green.** Ten planned, plus two the rendered check forced.

- `groundPainting.test.ts` tests 1 and 3 to 7, red against a stub whose `paintGround` filled the field in `night` and whose `groundResolution` returned 0: `expected [ 921881 ] to deeply equal []`, `expected [ [ 'rect', 1 ] ] to deeply equal [ [ 'rect', 1 ], …(5) ]`, `expected 921881 to be 4542301`, `expected 0 to be greater than 0`, `expected +0 not to be +0`, `expected +0 to be close to 1`.
- Test 2, "the ground is painted the same way every time", was green against the stub: the stub drew one deterministic rect, so it could not be red. Proved by mutation A below instead.
- `BackgroundRenderer.test.ts` tests 8 to 10, red against the tinted tile still in place: `expected [] to have a length of 1`, `expected 120 to be close to 760`, `expected [] to deeply equal [ 1 ]`. Test 11 needed the bake to have happened to be a check of the new ground at all, so it carries `expect(groundOf(layers).texture).not.toBe(Texture.EMPTY)` and was red on that.
- Palette tests 12, 13 and 14 are pins over rows that were already in the tree when they were written, so none could be red on delivery. Proved by mutations D and E below.
- Tests 15, 16 and 17 are the existing checks re-bound. Test 15 went red the moment the new rows landed (`expected 'graveWall false' to be 'graveWall true'`), because it still measured the cut earth against the old tile; it now measures against `groundNight` and binds on both ends with the exception table empty.
- Two more tests came out of the rendered check, each red first: "the field is baked outside the pass it is drawn in, never inside it" (`expected [ 1 ] to deeply equal []`) and "the base earth reaches past every edge, so the join carries no seam" (`expected [ +0, +0, 540, 760 ] to deeply equal [ -4, -4, 544, 764 ]`).

**Mutation spot checks**, in a scratch copy under `local/148-slice-8/mutantroot`, removed afterwards. The working tree was never mutated.

- A, the stream unseeded (`Math.random`): test 2 red, plus tests 4 and 6.
- B, `wrapsAt` always returns `[0]`: "the ground's picture meets itself at the top and bottom edges" red.
- C, `baseOverflow` forced to 0: "the base earth reaches past every edge" red.
- D, `groundGravel` moved by three in the blue channel: "the ground's colours are the prototype's", "records what every sprite reads over the ground it is drawn on" and assertion 1 all red.
- E, `GROUND_COLLISIONS` emptied: "keeps every sprite apart from every colour the ground draws" red with `expected [ 'graveWall over groundNight' ] to deeply equal []`.
- F, the ground added after the dressing rather than under it: six tests red, "the dressing and the Waking's source still draw over the new ground" among them.

**Test names before and after** (`vitest list --json`, file-qualified, in `local/148-slice-8/`): 2574 before, 2589 after, 17 new and **two lost**.

- `palette.test.ts :: gives the departure the highest saturation of the four ground colours, so the addition is the event`. `STAND_IN_GROUND` grew from four rows to seven, so the count in the name became false. Renamed to "the highest saturation of the ground's own colours". Nothing else in it changed and it still passes: the Vigil tint's 0.500 is the highest of the seven.
- `BackgroundRenderer.test.ts :: lays the floor from the one baked at import and never from the pack tile sheet`. The floor is no longer laid from an imported texture at all, so the promise cannot be kept. Replaced by "the ground is the painted field and no longer a tinted tile".

**Standing checks.**

- `pnpm --filter hungry-grave typecheck`: exit 0, closing `✔ AssetPack Completed in 27ms`, no tsc output.
- `pnpm --filter hungry-grave test`: `Test Files 177 passed (177)`, `Tests 2578 passed | 11 expected fail | 2 todo (2591)`.
- `pnpm --filter hungry-grave build`: exit 0, `✓ built in 5.98s`, with the pre-existing pixi chunk warning (open items).
- `pnpm verify` from the root: exit 0, `apps/hungry-grave test: Tests 2578 passed | 11 expected fail | 2 todo (2591)`, `Done`.

**Pins.** `git diff --stat` over `src/game`, `src/dev` and `src/tape` is empty, so `GOLDEN`, `WITNESS_VERSION`, `FORMAT_VERSION`, the bot's seed lists and the tuning record are untouched. Six files changed and two are new, all under `src/app`.

**The tapes.** Both verify on the final tree. `local/148-proof-tape/2000.tape`: `outcome verified`, 22,821 ticks, ending `victory`, stop `finished`, both fault lists empty. `local/148-won-tape/3000.tape`: `outcome verified`, 23,470 ticks, ending `victory`, stop `finished`, both fault lists empty.

**The side-by-sides** (`local/148-slice-8/screenshots/`, prototype left, game right, both through Playwright at 390 by 844 and device scale 3, the game from the built app through `vite preview` on port 4196, the prototype served from its own worktree on port 8936). `side-full-size27.png`, `side-full-size48.png`, `side-crop-size27.png`, `side-crop-size48.png`. Read at size 48, which is the clearest pair:

- The base tone is the same mid-dark blue-grey on both sides, and the two read as one material rather than as two greys.
- The wide patches are there on both: broad soft ellipses of damp and dry at the same scale and the same faintness, a few to a screen.
- The grain is the same fine dust of light and dark flecks at the same density; nothing on the game side is coarser or sparser.
- The cracks read as the same hairline dark squiggles, a handful per screen on both.
- The gravel reads as the same scatter of small pale specks.
- The tufts are the same small yellow-green sprouts, the same size and the same count per screen, over the whole field on both sides and not only round the grave.
- The grave: the lip bites now read against the earth rather than vanishing, the trodden margin is a visible band of turned earth round the opening, and the crumbs on it are legible. That is the thing slice 6 could not show. The lit right wall, the shaded left wall, the far wall band and the black depth are identical to the prototype's.
- Differences, all of them named by the entry: the prototype carries one far marker in the crop and the game carries none (not ported); the game carries the Procession's dressing statue and a Territory patch, which the prototype has no equivalent of.

**The grayscale squint** (`side-crop-size48-gray.png`, `side-full-size27-gray.png`). The prototype's `COLOR` order holds on both sides: the moonlit ground is the brightest thing in the picture, then the lit right side wall, then the far wall and the shaded left side together beneath it, and the depth is the only true black. Nothing at the rim is brighter than the ground. Where the game departs is not the grave: the Procession's dressing statue reads darker than the ground rather than lighter, and a corpse cloud reads brighter than it. Both are the dressing and the sprites, not the hole.

**The seam.** At tick 624 the join sits at field y 395, mid-field. Measured across a sprite-free column band, the join was a one-pixel row at blue 61.3 against a ground of 70.3 before the fix and 94.7 in line with its neighbours after it (`local/148-slice-8/readpng.py`). `replay-tick600.png` and `replay-tick1800.png` are the two shots a field height apart in the picture's own cycle, and neither carries a line.

**The dressing and the source on the new ground** (`section-tick12180`-style shots, from the won tape at ticks reported by `local/148-slice-8/sections.ts`):

- `replay-tick600.png` and `replay-tick1800.png`, the Procession (ticks 1 to 7535). The statues read as pale grey-blue shapes against the earth and are the one set that stands out, which is the moved tint.
- `section-tick12000.png`, tick 12180, the Crowd. The urns and vein columns read as dark teal-green silhouettes against the mid blue-grey earth. Visible, but as shadow shapes rather than as lit rock: they are 6.55 luma under the ground rather than 10 over it.
- `section-tick16200.png`, tick 16560, the Waking. The source stands left of the grave and is plainly the brightest thing on the ground layer, as it is meant to be. The Crowd's dressing around it reads the same way as above.
- `section-vigil-tick17270.png`, tick 17270, the Vigil. The floating rocks, the tentacle and the arcs read clearly: the teal parts from the blue-grey earth on hue where it cannot on value, since the tint sits 0.54 luma under the base.

**The bake cost and the texture** (`local/148-slice-8/bench.mjs`, the real `paintGround` through a real Pixi WebGL renderer in headless Chromium at device scale 3, ten timed bakes after two warm ones). Resolution 2.167, texture 1170 by 1647 pixels, 7.35 MB at four bytes a pixel. Painting the four thousand shapes: median 9.10 ms, p90 14.30 ms, max 14.30 ms. The whole bake including `generateTexture`: median 28.50 ms, p90 42.20 ms, max 42.20 ms. One bake per run is the shape, so this is a hitch of about one dropped frame at the start of a run and not a frame budget. It is a desktop figure on a software renderer (SwiftShader), where the `generateTexture` half is the part a real GPU would cut; a phone is unmeasured.

**A fall at the start size** (`fall-strip-a.png`, `fall-strip-b.png`, full frames `fall-0.png` to `fall-14.png`, the proof tape on a hand-pumped frame clock as slice 6 did). Four consecutive frames show a corpse tipping over the near lip, crossing the lit wall, shrinking and darkening on the walls' own curve, and going into the black. It falls inside the hole, and the hole reads as a hole cut into the brighter earth.

**Servers and browsers.** The `vite preview` on 4196, the `vite` dev server on 4197 and the prototype's `http.server` on 8936 are all stopped, every Playwright browser closed with its script, and `ps` shows none of mine alive. Port 4173 was never used. `dist/2000.tape` and `dist/3000.tape` are deleted. The scratch copy under `local/148-slice-8/mutantroot` is removed; the instruments stay in `local/148-slice-8/`.

**Open for the human**, as the entry says: whether the ground looks right in play on a phone, whether the grave reads as a hole cut into it, whether each section's dressing still reads as that section, and what the brighter ground costs each sprite's contrast.

## 3. Where the entry was wrong about the code

- **"The bake runs in the container's `onRender(renderer)` ... Take that shape."** This is the one place the entry's instruction does not survive contact. Slice 6's `onRender` bake paints a 2D canvas through `DOMAdapter` and never calls back into the renderer; `renderer.generateTexture` *is* `renderer.render` under another name (`GenerateTextureSystem.js:90`, `this._renderer.render({ container, transform, target, clearColor })`), so a bake there re-enters the pass that is drawing the screen. The rendered check showed what that costs: the ground came back carrying a photograph of the frame it was baked during, HUD, pause button, score row and field frame, baked into the texture and scrolling down the field with the rest of the picture. `onRender` now only records what the view asked for and `sync` does the bake, which runs in the frame's update, before Pixi renders. Section 4 carries it.
- **Test 4's wording, "every other shape's centre is inside the field."** A crack walks three segments of up to 13 by 9 from its own point and a blade scatters 4 by 3 from its tuft, so a segment's centre can land outside the field and the assertion as written cannot pass. What is true, and what the test asserts, is that every patch, mottle, fleck and speck is centred inside the field, and every crack segment and blade lies within the reach of the prototype's own brush of it.
- **`STAND_IN_GROUND`'s three consumers.** The entry names the list's contents and not what reads it. One of the three, "keeps the Waking's source apart from every ground colour it drifts over", is what makes two of the three dressing tints immovable; section 4 carries it. Another, the saturation test, names a count in its own title, which is the lost name above.
- Line numbers: every name the entry cites exists and does what it says. `graveCanvas.ts:10-31`, `palette.test.ts:78-118`, `:121-126`, `:190-191`, `:228-229`, `:235-236`, `:299-330`, `:332-415`, `:423-428`, `:452`, `:488-492`, `:518-527`, `:657`, `:871-877`, `:1211`, `:1262`, `:1274`, `:1293`, `field.ts:10-11`, `tuning.ts:27`, `fieldFrame.ts:10-11` and every prototype line all check out. Slice 7 moved the numbers under `screens/game` but not the names.

## 4. Decisions made

- **The bake moved out of the render pass.** `onRender` records the view and the wanted resolution; `sync` performs the bake at its top. Evidence: the ghosted frame in the first rendered check, and `GenerateTextureSystem`'s own `renderer.render` call. The cost is that the field is empty for the one frame between the first ask and the bake, which is the shape the dressing already takes while its bundle is coming. To reverse: bake in `askForABake` again and take the ghost back.
- **The base earth is painted 4 units past every edge (`GROUND_PAINTING.baseOverflow`).** The bake crops to the field's rectangle, so an edge inside the crop is antialiased against nothing and leaves a row of half-covered pixels; tiled, two of those rows meet and draw a line. Measured before and after in section 2. 4 units is the prototype's own pad on the grave's bake. To reverse: set the row to 0.
- **The mechanical tint rule was applied to one of the three tints and stopped on the other two**, which is what the entry's amendment says to do when the rule cannot be met. `standInGroundDressCold` kept its 8.01 luma over the old tile (13.99) and now sits 8.02 over the new base (30.54), at 0x54647c luma 38.56, hue 216.00 against 216.52 and saturation 0.323 against 0.324. The other two cannot move: the existing test "keeps the Waking's source apart from every ground colour it drifts over" requires every `STAND_IN_GROUND` row to sit at least 2.0 luma under the source at 42.02, which caps a ground row at 40.02, and the rule wanted 40.54 for the Crowd and 46.55 for the Vigil. Re-valuing the source is what the entry says this slice does not do, and weakening the test is what the contract forbids. Their hexes are untouched. No tint composites with an alpha or a blend: a Pixi tint multiplies the art's own grey and the import stretches every file's body to the top of the range, so the declared value is what the body draws and the distance kept is the declared one. To reverse: restore `standInGroundDressCold` to 0x303947 luma 22.00. This is on the open items for Mark's read, with what it costs.
- **`BACKGROUNDS` took `graveTurf` and `graveTurfDark` along with the seven new rows.** They are the ground's own tufts now, drawn over the whole field, and the entry names `graveTurf`'s figure among the ones to measure for that check. Measured: every mob-fire core clears Lc 45 over all nine, worst `groundGravel` at 49.21 and `graveTurf` at 61.59, exactly as the entry predicts.
- **`groundPainting.ts` joined `GROUND_MODULES` in `palette.test.ts`.** That list's own doc says it holds the modules that draw the ground, and the module that paints it belongs in it; it can only strengthen the two checks that read it. The folder scan already reached the file, so nothing about the literal ban changed. To reverse: take it out of the list.
- **The seam mechanism is the existing `TilingSprite`**, with the baked texture at the field's own size and `tileScale` set from the texture's dimensions so one repeat is exactly one field height. `tilePosition.y = tick * GROUND_SPEED` is unchanged. To reverse: two sprites leapfrogging.
- **`viewScaleFor` is a second copy of `GraveRenderer`'s**, read off the ground's own transform rather than the grave's. Rule of three allows the second copy; a third reader is where the helper gets extracted.
- **Four comments in `palette.ts` that this slice made false were corrected**, with their figures re-measured rather than adjusted: a corpse over the Procession's statues now reads Lc 27.19 against 35.21 over bare ground, and a mob-fire core clears Lc 75.29 over the brightest tint. The entry authorises correcting `nightSpeckle`'s and `fieldFrame`'s; the other three are comments my own edits falsified, which the craft rules do not allow to stand.

### The twenty-nine exceptions, one by one

**Sixteen dissolved** when `graveTurf` left `SPRITE_LAYER` for `NOT_SPRITES` (its `DARK_HALVES` entry went with it, restated as the ground's). Twelve of slice 6's: `graveRim`, `graveGlow`, `corpse`, `corpseRevenant`, `feast`, `powerUp`, `mob`, `banshee`, `territory`, `wisp`, `bellRing` and `belchEruption`, each over `graveTurf`. Four older ones: `undertaker`, `skull`, `splash` and `territoryGround` over `graveTurf`. `OVER_THE_TURF` lost every consumer and is deleted. No hex moved and no figure moved; the pairs stopped existing, which I checked by re-measuring all thirteen survivors and finding every one unchanged to the hundredth.

**Thirteen kept their figure and took a permanent reason.** Nine of slice 6's over `graveWall`: `graveRim` 40.13 (still also `RIM_NOT_DRAWN`), `corpse` 36.53, `corpseRevenant` 37.42, `feast` 43.98, `banshee` 44.10, `territory` 40.36, `wisp` 42.86, `bellRing` 44.11, `belchEruption` 44.07. Four older ones over `graveWall`: `undertaker` 12.07, `skull` 31.17, `splash` 27.55, `territoryGround` 32.66. Every one re-measured with the game's own `apcaLc` rather than copied out of the file, and every one reproduced exactly. `OVER_THE_CUT` now carries the argument in full: the figure is a function of two sprite colours and the ground is not a term in it, and what the ground settles is that the cut earth at 29.06 is under the earth it is cut into at 30.54, so a sprite over it is crossing a sloped face inside a hole.

**One threshold came back.** `CUT_EARTH_ABOVE_THE_GROUND` is empty, `GROUND_DECIDED_AFTER_SLICE_6` is deleted, and "keeps the cut earth under the ground it is cut into, and clear of the black behind it" now measures against `groundNight` and binds on both ends.

No entry anywhere in `palette.test.ts` carries the words "the ground is decided after slice 6".

## 5. Open items

- **The one three-channel collision, for Mark's read.** `graveWall` 0x414b5c against `groundNight` 0x454f5d fires on all three channels at once: luma 1.48 against a 2.0 floor, hue 2.8 against 15, saturation 0.035 against 0.25. Both halves are frozen by a Mark ruling, the grave's by slice 6 and the ground's by this one, so neither colour can move without contradicting one of them. It is named in `GROUND_COLLISIONS` with that figure and this reason: the cut earth's brightest band is the ground's own earth seen in section, which is what it is meant to be, and what tells the wall from the ground is the black beside it and the lip above it rather than its own value. This is the one place in this slice where the ruling's "fixed, never excepted" cannot be honoured.
- **What the brighter ground costs each sprite, for Mark's read.** Every sprite's best-of-pair APCA figure over the earth drops by about twelve points, because the ground moved from luma 13.99 to 30.54, the middle of the range where neither a bright sprite nor a near-black companion reads. A corpse and its dark companion read 47.04 over the old tile and 35.21 over the new base, which is the number the entry asked me to measure and compare. Of the sixteen pairs, only `mob` still clears Lc 45 over the base, at 46.69. Mob fire is unaffected and clears everywhere, which is the guarantee ADR 0014 was written for, so nothing becomes unplayable; what drops is how easily a corpse or a claimed patch is told from the earth. The whole table of 144 figures is pinned in `palette.test.ts` as "records what every sprite reads over the ground it is drawn on", so no sprite colour and no ground colour can move now without a number moving with it.
- **Two of the three dressing tints could not be moved, for Mark's read.** The Crowd's stays at luma 23.99, which is 6.55 under the new base, and the Vigil's at 30.00, which is 0.54 under it; both measure APCA Lc 0.00 against the base, and the Vigil's dropped from Lc 10.92 over the old tile. In the photographs they read as dark silhouettes rather than as lit rock, so the sections still turn over and the Vigil's teal still parts on hue, but the contrast that used to carry them is gone. The Procession's moved tint reads plainly. It also inverts the order: the Procession is now the brightest of the three and the Vigil the dimmest, where before it was the other way about. Nothing in the tree pins that order, but it was not what the amendment was reaching for. A ground row cannot pass luma 40.02 while the Waking's source sits at 42.02, so raising the other two needs either the source re-valued or that separation re-argued, and both are colour decisions.
- **The Procession's moved tint buys luma distance and not APCA.** At 38.56 over a base of 30.54 it still measures Lc 0.00, exactly as it did at 22.00 over a tile of 13.99. The rule preserved what the tint actually had, which was the luma distance and the art's own silhouette, and it never had an APCA figure to preserve. Worth knowing before anyone reads the move as restoring contrast.
- **The design records are now partly false and a coder does not edit them.** `apps/hungry-grave/docs/design/grave-in-the-ground.md` R4 describes decision 7's tufts as growing round the grave and taking on the ground under them as the grave moves; painted into the ground texture they are the ground, everywhere and scrolling with it, and the grave passes over them. `docs/design/stage-floor.md` section 7 and its table row for `groundTile` describe the ground as the `nightSpeckle` family at luma near 14. Both need the main session.
- **A phone's bake cost is unmeasured**, and the desktop figure is on a software renderer, so the 28.5 ms median is the pessimistic half of the answer rather than the honest one.
- Anomaly, pre-existing. The build warns "Some chunks are larger than 500 kB" for the pixi chunk at 589.66 kB, the same figure slices 6 and 7 recorded. Ticket #51.
- Anomalies, environment only. Headless Chromium logged WebGL driver performance warnings ("GPU stall due to ReadPixels", "Running out of reserved outsideRenderPass queueSerial") and AudioContext autoplay warnings. Nothing else in the console over any capture, and nothing from this slice. The live game's FPS readout reads 3 under the software renderer.
- The instruments stay in `local/148-slice-8/`: the colour measuring scripts, the tint solver, the figure-table generator, the section-boundary reader, the three screenshot drivers, the frame pump, the PNG reader, the bake bench, and the name lists.

## 6. Stuck

None.

## Landing (the main session)

CodeRabbit read the uncommitted slice (`local/148-slice-8/coderabbit.txt`), all nine files with the two new ones among them, and raised no finding. `pnpm verify` from the root passed again at landing: 2,578 passed, 11 expected fail, 2 todo. The main session read `side-crop-size48.png` itself: the earth, the flecks, the cracks and the tufts match the prototype's, the grave is the same grave, and the lip and the trodden margin now show against the ground. The coder's call to stop the tint rule on the Crowd's and the Vigil's tints is accepted, because the amendment said to stop on a tint the rule cannot be met for; both go to Mark's read with the inverted order of the three.
