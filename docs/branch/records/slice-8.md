# Slice 8: the prototype's ground on the whole field (design record R4, decision 7)

Follow-along row 8: "The prototype's ground on the whole field, so the grave's rough edge and worn earth show."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice, except for the one rule this entry overrules below. This entry is the planning half of the flow: the definition, the verification steps, the seams, the module boundaries and the test list are all here, and if one of them is missing you stop and report rather than fill it yourself. Your scratch folder is `local/148-slice-8/` in the worktree. Load the `pixijs-skills:pixijs` skill before you touch Pixi code.

Paths in this entry are relative to `apps/hungry-grave/` unless they start with `docs/`, `local/` or `.claude/`, which are the worktree's own. Every line number cited here was read out of the file on 2026-09-21, and the name beside the number is what binds: if the number has moved but the name is there, follow the name. If the name is not there, the entry is wrong about the code and you stop and report, as the contract says.

Slice 7 was in flight while this entry was written, so every file it was touching is cited here by name only and never by line: `FieldRenderer.ts`, `GameScreen.ts`, `ReplayScreen.ts`, `runEnding.ts`, `graveDrawingValues.ts`, `fall.ts`, `src/game/events.ts`, and the new `endingScene.ts` and `EndingSceneRenderer.ts` with their tests. This slice changes none of them.

## What this slice builds, and why

Mark's ruling, 2026-09-21: the prototype's ground goes on the whole field. This slice ports the prototype's `paintGround` line for line, with its colours, trodden patches, speckle and tufts, the same way slice 6 ported the prototype's grave line for line. Decision 7's tufts return with the ground, because they were the prototype ground's.

**This overrules the coder contract's "Never copy code out of it" for this slice only, by Mark's direct instruction**, exactly as slice 6's entry did. Every number, colour, count, seed and step order of the prototype's ground is carried over unchanged. Where you find yourself choosing a value or a shape, stop: the prototype already chose it.

This is a ruling. Do not argue it, do not offer options, and do not cite an ADR or an earlier rim or palette decision against it. Where the ruling and a mechanical check disagree, the ruling wins, the check is named with its figure, and the disagreement goes in your note under open items for Mark's read.

Why the slice exists: slice 6 put the prototype's grave into the game and left the game's near-black ground tile under it. Its side-by-sides (`local/148-slice-6/screenshots/`) show the port is exact and that the lip bites and the trodden margin nearly vanish, because the prototype chose its earth and grass against a ground brighter than this field's. The prototype's `COLOR` comment (index.html:299-307) says what the relationship has to be: the moonlit ground is the brightest, then the lit side wall, then the far wall and the shaded side, and the depth is the only true black. Today the ground tile is luma 13.99 and the grave's brightest earth is 29.06, so the relationship is upside down. The prototype's ground is luma 30.54 at its base, which puts it right way up again.

**The definition, in observable terms.** When it works, a player looking at the field sees the prototype's ground: a mid-dark blue-grey earth with wide soft patches of damp and dry, a fine grain of light and dark flecks, hairline cracks, scattered gravel, and small tufts of grass all over the field, not only round the grave. The ground runs down the screen at the same rate it does today, so a Territory patch stays on the earth it was lobbed onto. The grave sits in that ground as a hole cut into it: its lip bites, its trodden margin and its crumbs read against the earth rather than disappearing, and the cut earth inside the hole is darker than the ground outside it. The picture at the start size is the prototype's picture at the same size, the ground included. Nothing about how the game plays changes.

## The source to port

The prototype is `.claude/worktrees/148-grave-fall/apps/hungry-grave/src/prototypes/grave-fall/index.html` (build 7, on `prototype/148-grave-fall`). Never change it. Port every piece the ground's look depends on, and list each one in your note as ported, or as not ported with the reason:

- `paintGround` (`:1364-1474`), in its own order, each block with its own count, its own colours and its own alphas:
  - `:1369` the base fill, the whole field in `COLOR.night`.
  - `:1373-1383` 54 wide soft patches, `COLOR.groundCold` / `groundWet` / `groundDamp` picked at 0.32 and 0.62, alpha 0.09 to 0.22. These are the trodden patches the ruling names.
  - `:1389-1398` 520 small mottles, the same three colours picked at 0.3 and 0.62, alpha 0.07 to 0.2.
  - `:1400-1410` 70 cracks of three segments each, `COLOR.crack`, alpha 0.45.
  - `:1413-1421` 2600 grain flecks, `COLOR.crack` under 0.42 and `COLOR.speckle` over it, alpha 0.25 to 0.8. This is the speckle the ruling names.
  - `:1424-1435` 230 tufts of five blades each, `COLOR.moss` or `COLOR.mossDark` at even odds, alpha 0.7. These are decision 7's tufts.
  - `:1436-1439` 180 gravel specks, `COLOR.gravel`, alpha 0.14 to 0.34.
  - `:1463-1473` the bake: one texture over the whole field, shown as one sprite at the field's size.
- The seed: `makeRandom(0x7ea15b3)` (`:1368`), one stream, drawn in the prototype's own order, so the field is the same picture every time. Write the seed in decimal, 132781491, because the palette scan forbids a `0x` literal under `screens/game`, comments included (slice 6's note, "the eight random seeds, written in decimal").
- `COLOR` (`:308-326`), the rows `paintGround` reads: `night`, `speckle`, `groundCold`, `groundWet`, `groundDamp`, `crack`, `gravel`, `moss`, `mossDark`. `moss` and `mossDark` are already in the palette as `graveTurf` and `graveTurfDark` (slice 6), so the tufts reuse those two rows and no new grass row is declared.
- `makeRandom` (`:393`) and `lerp` (`:378`): already ported in `screens/game/graveCanvas.ts` (slice 6), with the same arithmetic. Reuse them rather than writing them again.
- `groundResolution` (`:1357-1361`) and `MAX_GROUND_TEXTURE_PX` (`:1355`): how many texture pixels the baked field gets per field unit, `clamp(min(scale * devicePixelRatio, 4096 / width, 4096 / height), 1, 3)`.

Not ported, and this is the one deliberate departure from line for line:

- The nine far markers (`:1442-1456`) and `COLOR.marker`. Three reasons, all of them stated here so you do not have to decide: the game already places field furniture through the per-section dressing stream (ADR 0049, `screens/game/groundDressing.ts`, `DRESSING_SETS`), and two systems placing stones on one field is two answers to one question; Mark's decision 5 turns the headstone off; and a marker painted into a ground texture that repeats every field height would march the same nine stones past the player for the whole run, which is the thing the dressing stream exists to avoid. If you think this is wrong, say so in your note. Do not port them.
- `grey`, `ease`, `pointInPoly`, `polygonArea`: none is called from `paintGround`.
- The headstone, the bodies, the sound, the sliders, the grave and the fall: slice 6 and slice 4 own those and they are already built.

## What the prototype cannot give you, and what to do instead

Three places where a straight copy does not fit the game. Each one has a decision already made here, so none of them is yours to invent.

**The ground scrolls and the prototype's does not.** The prototype paints the field once and never moves it (`resizeWorld`, `:1339-1349`, calls `paintGround` on a resize and on nothing else). The game's ground runs down the screen at `GROUND_SPEED` in `screens/game/BackgroundRenderer.ts`, which is the sim's own `SCROLL_SPEED` (`src/game/tuning.ts:27`), and the comment on `GROUND_SPEED` records why: Territory is lobbed onto the ground and a ground running at any other rate slides out from under every patch, which is what the slice 13b deploy showed (Mark, 2026-09-08). So the ground keeps scrolling at exactly `GROUND_SPEED`, and the baked picture has to repeat down the screen without a visible seam. Paint at the field's own height, `FIELD_HEIGHT` = 760 (`src/game/field.ts:11`), and paint every shape whose extent crosses the top or the bottom edge a second time a field height away, so the picture meets itself. That is the only change to the painters' bodies this entry authorises, and it is an addition, never a change to a colour, a count or a placement. The mechanism that shows it (the existing `TilingSprite`, or two sprites leapfrogging) is yours; the test below is the judge.

**The field's height is fixed and the prototype's was the viewport's.** `world.fieldH` (`:1344`) is the viewport's height in field units, so the prototype repaints on every resize. `FIELD_WIDTH` 540 and `FIELD_HEIGHT` 760 (`src/game/field.ts:10-11`) are fixed, and 540 is the prototype's own `FIELD_W` (`:272`), so the picture is painted once at exactly the prototype's width. What still changes with the viewport is `groundResolution`, which reads the view's scale and the device pixel ratio, so repaint when the resolution it returns changes and not otherwise, the way `GraveRenderer.ts` guards its own bake with `stillFits`.

**The bake needs the renderer.** The prototype calls `world.app.renderer.generateTexture` (`:1463`). Slice 6 met the same problem and solved it: the bake runs in the container's `onRender(renderer)`, which Pixi calls before it validates renderables, so a bake there lands in the same frame (`GraveRenderer.ts`, the constructor's `this.pitArt.onRender` and `viewScaleFor`). Take that shape. The prototype's ground is painted with Pixi `Graphics` calls and not with a 2D canvas, so this is a `Graphics` port and not a canvas one: `rect`, `ellipse`, `circle`, `moveTo`, `lineTo`, `quadraticCurveTo`, `fill`, `stroke`, in the prototype's own order.

## Parts of the code this slice touches

**`src/app/screens/game/groundPainting.ts` (new).** The ported painters and their data. Its public interface:

- `GroundCanvas`, a narrow chainable interface naming exactly the drawing calls `paintGround` makes and nothing else, so a test hands it a recorder. `Graphics` satisfies it structurally, the way `GraveCanvas` in `graveCanvas.ts:10-31` names exactly the 2D calls the grave's painters make.
- `paintGround(canvas: GroundCanvas, field: { readonly width: number; readonly height: number }): void`. Pure: no Pixi import, no renderer, no texture, no state between calls. Same field, same picture, every time.
- `groundResolution(viewScale: number, devicePixelRatio: number, field): number`, the prototype's own choice with its cap and its clamp.
- One data table holding the counts, the seed and the resolution cap, with the prototype's names and values: 54 wide patches, 520 mottles, 70 cracks of 3 segments, 2600 grain flecks, 230 tufts of 5 blades, 180 gravel specks, seed 132781491, texture cap 4096, resolution clamp 1 to 3. Every other number (each `lerp` range, each alpha, each pick threshold) stays inline exactly as the prototype writes it, which is the line slice 6 drew and its note records under "Inline numbers kept inline".

Splitting the file by concept if it grows past one screen per function is your call under the code rules. Do not split it by line count.

**`src/app/screens/game/BackgroundRenderer.ts`.** Its public interface stays exactly as it is: the constructor's `BackgroundProps { standInArt }`, `attach(layers)` and `sync(run)`, so `GameScreen.ts` and `ReplayScreen.ts` do not change. Inside, the ground stops being a tinted pixel-art tile and becomes the baked picture: the `TilingSprite` built with `Texture.EMPTY` and `GROUND_FLOOR`, the `tint = GROUND_TINT.hex` and the `tileScale.set(DRESSING_SCALE)` on it, and `syncGround`'s `textureFor(GROUND_FLOOR)`, are replaced. `tilePosition.y = tick * GROUND_SPEED` and the rate it runs at are kept exactly. The dressing pool, `syncDressing`, `placeDressing`, `dressingFor`, `syncSource` and `textureFor` are untouched.

**`src/app/screens/game/groundDressing.ts`.** `GROUND_FLOOR` and `GROUND_TINT` lose their consumer and go, with their JSDoc. `DRESSING_SETS`, `DRESSING_BY_SECTION`, `SOURCE_DORMANT`, `SOURCE_AWAKE`, `EYE_CELL_PIXELS`, `STAND_IN_BUNDLE`, `streamDraw`, `artAt` and `acrossAt` are untouched. `standIn/ground/floor.png` stays in `raw-assets`; deleting art is not this slice's.

**`src/app/palette.ts`.** New rows, the prototype's values, in a block of their own with a comment naming the prototype and the ruling, the way slice 6's grave block does: `groundNight` 0x454f5d, `groundSpeckle` 0x66748a, `groundCold` 0x56657a, `groundWet` 0x466050, `groundDamp` 0x2c3644, `groundCrack` 0x28313d, `groundGravel` 0x8d9cae. Their declared lumas, which assertion 1 checks against the hex: 30.54, 44.95, 38.95, 35.03, 20.74, 18.81, 60.44. Most of them draw at an alpha the painter sets, so the declared value is the most a row can ever put on screen, which is the convention slice 6 set for the grave's translucent rows. `nightSpeckle` keeps its row and loses its consumer; its JSDoc, and `groundDressing.ts`'s, both say it is the ground tile's colour, and both become false and are corrected.

**`src/app/screens/game/fieldFrame.ts:10-11`.** `boundaryReadout`'s JSDoc says "The engine's background and the field's ground are both night, so this outline is the only visible edge of the field." The second half stays true and the first half stops being true. Correct the sentence. The colour, the width and the alignment do not move.

**`src/app/__tests__/palette.test.ts`.** Its own section below.

**Nothing under `src/game` changes**, and nothing in the grave's drawing from slice 6 changes: `graveCanvas.ts`, `graveMouth.ts`, `graveWalls.ts`, `graveLip.ts`, `GraveRenderer.ts`, `graveProjection.ts` and every `grave*` hex in `palette.ts` hold exactly as they are. The one grave-related edit this entry authorises is a move between two tables in the palette test, described below, which changes no hex.

## The palette work

This is the half of the slice that is not drawing, and it has three parts. **This entry authorises you to change the expectations named here, and only these**, which the contract otherwise forbids. For each change your note names the test, the old value and the new value.

**1. The new ground rows join the checks the ground is already in.** The seven rows go into `NOT_SPRITES` (palette.test.ts:78-118), where `nightSpeckle` and the three dressing tints already sit, because the ground is what a sprite is read on and never a thing told apart from a sprite mid-dodge. `STAND_IN_GROUND` (`:121-126`) holds the ground colours "in the order the run meets them" and today opens with `nightSpeckle`; it takes the new base and patch rows in its place. `BACKGROUNDS` (`:518-527`), the list a mob-fire core must clear Lc 45 against, takes the new rows: fire crosses the ground every run and that is the check the band is actually about. Predicted figures, which you measure rather than trust: the worst is `graveTurf` used as a tuft at 61.59 and `groundGravel` at 49.21, both over 45. If one comes out under 45, that is a real failure of the band and you stop and report, because a bullet that cannot be seen is not a colour question.

**2. The one three-channel collision.** Write a new test, in the shape of the two ground checks already in the file ("keeps the turf apart from the ground it lies on by hue", `:1293`, and "keeps the Waking's source apart from every ground colour it drifts over", `:1211`): **"keeps every sprite apart from every colour the ground draws"**, over the same three channels and the same floors `spriteCollisions` uses (`SPRITE_SEPARATION`, luma 2.0, hue 15, saturation 0.25), for every sprite in `spriteEntries()` against every ground row. Exactly one pair fires: `graveWall` 0x414b5c against `groundNight` 0x454f5d, at luma 1.48, hue 2.8 and saturation 0.035. Both halves of that pair are frozen by a Mark ruling, the grave's by slice 6 and the ground's by this one, so neither colour moves. Name it in a table of its own with the figure and this reason: the cut earth's brightest band is the ground's own earth seen in section, which is what it is meant to be, and what tells the wall from the ground is the black beside it and the lip above it rather than its own value. Put it on your note's open items for Mark's read. This is the one place in this slice where the ruling's "fixed, never excepted" cannot be honoured, and saying so plainly is the job.

**3. The twenty-one exceptions marked "the ground is decided after slice 6".** Twenty-nine entries in `SEPARATION_EXCEPTIONS` carry that string (`GROUND_DECIDED_AFTER_SLICE_6`, `:228-229`); twenty-one of them are the ones slice 6 added (`:332-415`, `graveRim`/`graveWall` down to `belchEruption`/`graveTurf`) and eight are older pairs slice 6 re-measured (`:299-330`). Resolve all twenty-nine. The resolution falls into three kinds, and every one of them is a real change and not a rewording:

- **Sixteen dissolve.** `graveTurf` is the prototype ground's own grass: `paintGround` (`:1424-1435`) draws it in tufts over the whole field, and its declared row is `COLOR.moss` itself. So it is ground cover and not a sprite the player tells apart mid-dodge, which is `NOT_SPRITES`' own criterion. Move `graveTurf` out of `SPRITE_LAYER` (`:452`) and into `NOT_SPRITES`, and move its `DARK_HALVES` entry (`:488-492`) with it, restating the reason as the ground's. Every `*/graveTurf` pair then leaves assertion 3 with it, because `backgroundsUnder` (`:871-877`) only counts colours in `SPRITE_LAYER`. Delete those sixteen exception entries: twelve of the twenty-one (`graveRim`, `graveGlow`, `corpse`, `corpseRevenant`, `feast`, `powerUp`, `mob`, `banshee`, `territory`, `wisp`, `bellRing`, `belchEruption` over `graveTurf`) and four of the eight older ones (`undertaker`, `skull`, `splash`, `territoryGround` over `graveTurf`). No hex moves and no figure moves; the pair stops existing. Check by measurement that no other figure moved when you did it, and say so.
- **Thirteen keep their figure and get a permanent reason.** The nine remaining slice-6 pairs over `graveWall` (`graveRim` 40.13, `corpse` 36.53, `corpseRevenant` 37.42, `feast` 43.98, `banshee` 44.10, `territory` 40.36, `wisp` 42.86, `bellRing` 44.11, `belchEruption` 44.07) and the four older ones over `graveWall` (`undertaker` 12.07, `skull` 31.17, `splash` 27.55, `territoryGround` 32.66). The figure is a function of two sprite colours and the ground is not a term in it, so none of these numbers can move on a new ground. What the new ground supplies is the argument: `graveWall` at luma 29.06 is now under the ground it is cut into at 30.54, so the cut earth is where the bracket always said it belonged, and what a sprite crosses over it is a sloped face inside a hole, read against the field it is crossing. `OVER_THE_CUT` (`:190-191`) already says that in the right words. Replace the slice-6 placeholder in each of the thirteen with its permanent reason, keep every figure, and re-measure each one rather than copying the number out of the file. `RIM_NOT_DRAWN` (`:235-236`) stays on the two `graveRim` entries: the rim is still not drawn and its row still waits on the colour decision, which is not this slice's.
- **One threshold comes back.** `CUT_EARTH_ABOVE_THE_GROUND` (`:423-428`) excepts `graveWall` at 29.06 from being under the ground tile at 13.99. On the prototype's ground the base is 30.54, so `graveWall` is under it and the exception is not needed. Empty the table, and the test "keeps the cut earth under the ground it is cut into, and clear of the black behind it" (`:1274`) binds on both ends again for the first time.

When you are done, no entry in `SEPARATION_EXCEPTIONS` and no entry in `CUT_EARTH_ABOVE_THE_GROUND` carries the words "the ground is decided after slice 6", the constant `GROUND_DECIDED_AFTER_SLICE_6` is gone, and your note lists all twenty-nine by name with what happened to each.

**The three dressing tints move with the ground (the main session's call, 2026-09-21).** `standInGroundDressCold` (luma 22.00), `standInGroundDressWet` (23.99) and `standInVigilTint` (30.00) are all darker than the new ground base at 30.54, and all three measure APCA Lc 0.00 against it, so left alone the per-section dressing that ADR 0049 turns over would go nearly invisible, and a stage whose sections stop reading is a regression this slice caused. The rule is mechanical and you make no colour choice: each tint keeps the luma distance it had over the old tile (`nightSpeckle`, luma 13.99), now measured over the new base (30.54), so about 38.55, 40.54 and 46.55, with each tint's hue and saturation unchanged, and each stays under the band ceiling (68). Measure before you trust these figures: if a tint composites with an alpha or a blend, keep the distance of the composited result, and say in your note which you did. Pin the three new figures in `palette.test.ts` beside the ground's. Photograph each section's dressing on the new ground (below). To reverse: restore the three hexes. If the rule cannot be met for a tint, stop on that tint only, leave its hex alone, and report it.

**What this slice does not do.** It does not re-value a sprite colour or the Waking's source. The Waking's source at luma 42.02 still clears the base by 11.48 and reads. What the brighter ground costs each sprite is measured, pinned and photographed, and goes on your note's open items for Mark's read; he ruled the same order for the grave, the exact look first and the colours after he has seen it. You do not delete the dressing.

## Tests to write first

Every planned test is red first on its own assertion, against a stub that returns a wrong value of the right type, before any implementation. The name is the promise; the ruling goes in a comment inside the test.

In `src/app/screens/game/__tests__/groundPainting.test.ts`, over a `GroundCanvas` that records its calls:

1. "the ground's colours are the prototype's": every colour `paintGround` draws with is one of the seven new palette rows or the two grass rows, and each row's hex is the prototype's, listed in the test.
2. "the ground is painted the same way every time": two paints of the same field give the same recorded calls, which is the seeded stream.
3. "the ground carries the prototype's own counts": the recorded calls hold 54 wide patches, 520 mottles, 210 crack segments, 2600 grain flecks, 1150 blades, 180 gravel specks and one base fill, in the prototype's order.
4. "the base fill covers the whole field and nothing draws outside it": the fill is the field's rect, and every other shape's centre is inside the field.
5. "the ground's picture meets itself at the top and bottom edges": every shape whose extent crosses y = 0 or y = the field's height has a twin a field height away, so the picture repeats with no seam. This is the test that judges the wrap.
6. "the ground grows no denser and no sparser with the view": the same field at two resolutions gives the same shapes in the same places.
7. "the ground asks for more texture pixels on a sharper phone, up to the cap": `groundResolution` at device scale 1, 2 and 3, and at a field big enough to hit the 4096 cap, gives the prototype's own answers.

In `src/app/screens/game/__tests__/BackgroundRenderer.test.ts`, added to what is there:

8. "the ground is the painted field and no longer a tinted tile": the ground sprite's texture is the baked one and nothing sets a tint on it.
9. "the ground still runs at the rate a landed patch drifts": the existing promise, re-asserted on the new ground, so `GROUND_SPEED` cannot move under it.
10. "the ground repaints only when the view's resolution changes": two frames at one resolution bake once; a changed resolution bakes again.
11. "the dressing and the Waking's source still draw over the new ground": the existing dressing and source tests pass unchanged, and the ground is beneath them in the same layer.

In `src/app/__tests__/palette.test.ts`:

12. "the ground's colours are the prototype's": each of the seven rows equals the prototype's value, listed in the test, in the shape of "the grave's colours are the prototype's" (`:1262`).
13. "keeps every sprite apart from every colour the ground draws": part 2 above, with its one named pair.
14. "records what every sprite reads over the ground it is drawn on": for every pair in `SPRITE_OUTLINE`, the best of the light half and the dark half against every ground row, pinned as a table of figures. It is a measurement and not a threshold, and it is there so that no sprite colour and no ground colour can move without a number moving with it. Write the figures you measure, not the ones in this entry.
15. The existing "keeps the cut earth under the ground it is cut into, and clear of the black behind it" (`:1274`) with `CUT_EARTH_ABOVE_THE_GROUND` empty, so both ends bind.
16. The existing "keeps the turf apart from the ground it lies on by hue" (`:1293`) over the new ground rows.
17. The existing "clears APCA Lc 45 for every core against every background it draws on" (`:657`) with the new rows in `BACKGROUNDS`.

Test 14's figures are the ones that carry the cost of this ruling. For reference and for nothing else, a corpse and its dark companion read best-of Lc 47.04 over today's ground tile and a predicted 35.21 over the new ground's base. Measure it, write the measured number, and put the comparison in your note. It is a finding for Mark's read and it changes nothing about what you build.

## Verification beyond the contract's floor

You are the actor for every step here. The contract's floor (every planned test red first then green, test names compared before and after, typecheck, test, build, `pnpm verify`, and a rendered check of the built app through `vite preview`) applies whole, and this adds to it.

- **The side-by-side.** Photograph the built game through `vite preview` (never port 4173, which belongs to another worktree; pick your own port) with `playwright-cli` at 390 by 844, device scale factor 3, at the start size 27 and at a grown size 48 (`?size=`, read `src/app/seedFromUrl.ts`, `sizeFromUrl`). Photograph the prototype at the same two sizes the same way. Make a side-by-side per size, prototype left, game right, with `ffmpeg`; ImageMagick and PIL are not installed, and `local/148-look-compare/README.md` holds the command that worked. Save them under `local/148-slice-8/screenshots/`. In your note describe each pair: the ground's base tone, the wide patches, the grain, the cracks, the gravel, the tufts, and how the grave's lip bites, trodden margin and crumbs read against the earth. A difference other than the ones this entry names is a failure of the port and you fix it before you return.
- **The grayscale squint.** Convert one side-by-side to grayscale with `ffmpeg` and read it. The prototype's `COLOR` comment (`:299-307`) is a statement about a grayscale squint: brightest is the moonlit ground, then the lit side wall, then the far wall and the shaded side, and the depth is the only true black. Say in your note whether the built picture holds that order, and where it does not.
- **The seam.** Photograph the ground at two ticks a field height apart in the run, at the same place on screen, and show there is no line where the picture repeats. A visible seam is a failure of the wrap and you fix it.
- **The dressing and the source on the new ground.** Replay the won tape `local/148-won-tape/3000.tape` (`?tape=`, `?at=`) and photograph a frame inside each of the three dressing sets: the Procession's statues, the Crowd's veins and eyes, and the Vigil's floating rock, plus the Waking's source standing on the field. The replay cannot be held at the tick `?at=` names; hold a frame the way slices 1, 2 and 6 did, by replacing the page's `requestAnimationFrame` with a manual pump and freezing `performance.now`, advancing it one tick's worth per pumped frame. Describe what you can and cannot see. This is the measurement behind the dressing finding above, and it goes on your note's open items whatever it shows.
- **The bake cost and the texture.** Time one bake of the whole field on the real `BackgroundRenderer` at device scale 3, the way slice 6 timed its own (`local/148-slice-6/bench.mjs`), and report the median, the p90 and the max, plus the texture's pixel dimensions and its memory at that resolution. One bake per run is the shape, so a slow bake costs a hitch at the start of a run and not a frame budget; say which it is. It is a desktop figure and a phone is unmeasured, which your note says.
- **The proof tape.** `local/148-proof-tape/2000.tape` still verifies, with its outcome, its tick count, its ending and empty fault lists.
- **A fall at the start size** still falls inside the hole, held and photographed as slice 6 did, so the ground going under the grave moved nothing in the hole.

**Open for the human**, named in your note as such: whether the ground looks right in play on a phone, whether the grave reads as a hole cut into it, whether each section's moved dressing tint still reads as that section, and what the brighter ground costs each sprite's contrast. Mark's play never stands in for a check.

## What must stay unchanged

- Everything under `src/game`. The sim, the tape format and `FORMAT_VERSION`, `WITNESS_VERSION`, `GOLDEN` in `src/dev/digest.ts`, the bot's seed lists in `src/dev/__tests__/bot.test.ts`, and the tuning record. A pin that moves when this entry says it holds is a stop and a report.
- The grave's drawing from slice 6, whole: `graveCanvas.ts`, `graveMouth.ts`, `graveWalls.ts`, `graveLip.ts`, `GraveRenderer.ts`, `graveProjection.ts`, and every `grave*` hex in `palette.ts`. The one authorised grave-related edit is `graveTurf`'s move between `SPRITE_LAYER` and `NOT_SPRITES` in the palette test, which changes no hex and no drawing.
- `FieldRenderer.ts`, `GameScreen.ts`, `ReplayScreen.ts`, `runEnding.ts` and `graveDrawingValues.ts`. Slice 7 owns them. `FieldRenderer`'s hit dim keeps reading `PALETTE.night` and keeps its alpha behaviour.
- ADR 0014's layer stack in `layering.ts`, and the `ground` layer's place at the bottom of it.
- ADR 0049's dressing: `DRESSING_SETS`, `DRESSING_BY_SECTION`, the drift window, the stream's two salts, and the placement of every piece. The Waking's source, its size, its rim and its two colours.
- The reservoir's glow and Territory's charge arc, in colour, geometry and behaviour.
- `BOUNDARY_STROKE`, `fieldFrame`'s hex and the boundary's geometry. Only its JSDoc sentence changes.

## Done when

Every planned test is written, was red on its own assertion first, and is green. Every verification step above has a result in your note. The side-by-sides and the section photographs are saved under `local/148-slice-8/screenshots/` and described. No pin moved. No entry anywhere in `palette.test.ts` carries the words "the ground is decided after slice 6", and your note lists all twenty-nine with what happened to each. The port list in your note marks every item as ported or not ported with its reason. Your note is written to `docs/branch/records/slice-8-note.md` in the form the contract fixes, and the code, the tests and the note are left in the working tree, uncommitted, for the main session to review and land.
