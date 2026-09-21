# Slice 3 coder note: the grave is a hole cut in the ground (design record R4)

## What changed

New, in `apps/hungry-grave/`:

- `src/app/screens/game/graveProjection.ts`. `belowGround(x, y, depth, view)` and `lightAtDepth(depth, view)`, both pure, plus the types `GraveView` (the camera and the dark) and `Spot` (where something draws). It imports nothing at all, Pixi included.
- `src/app/screens/game/graveDrawingValues.ts`. The step's one table of drawing values: `GRAVE_VIEW` (camera height 4.95, camera behind 1.07, dark depth 2.4, dark falloff 2.6), `FACE_BANDS`, `FACE_MOON`, `CORNER_EDGE_INK`, `CORNER_EDGE_WIDTH`, `ART_REACH_OUTSIDE`, `LIP_BITES`, `BITE_REACH`, `MARGIN_SWELL`, `MARGIN_REACH`, `MARGIN_PATCH`, `MARGIN_PALE_ALPHA`, `MARGIN_DARK_ALPHA`, `TURF_SHADOW`, `TURF_SHADOW_FAR`, `TURF_SHADOW_ALPHA`, `OVERHANGING_GRASS`, `BLADE_WIDTH`, `TUFTS`, `TUFT_BLADES`, `TUFT_FAN`, `TUFT_ALPHA`, `NEAR_LIP_FROM`. Every proportion is a share of the opening. Slices 4 and 5 add their own rows.
- `src/app/screens/game/__tests__/graveProjection.test.ts`. Five tests, every expected value worked by hand from R4's formulas.

Changed, in `apps/hungry-grave/`:

- `src/app/screens/game/GraveRenderer.ts`. The hole's art is built once in the grave's own half-lengths in the constructor and scaled by `grave.size` on every `sync`, never cleared. Its public interface is unchanged (`attach`, `detach`, `sync`) except for the new read-only member `falls`. New private helpers: `aroundTheRectangle` (which replaces `perimeterPoint` and also answers the outward normal), `insideTheMouth`, `onTheFace`, `paintFaceBand`, `paintCornerEdges`, `paintTheHole`, `paintLipBites`, `paintTroddenMargin`, `paintBlade`, `paintTufts`, `paintTurfShadow`, `paintOverhangingGrass`, and the module constants `MOUTH_HALF_WIDTH`, `MOUTH_WIDTH`, `MOUTH_HEIGHT` and `WALL_FACES`. `GRAVE_CORNER_RATIO` is gone and every `roundRect` is now a `rect`. `drawnSize` is renamed `rimSize`, because it now names the rim's own redraw and no longer the art's.
- `src/app/palette.ts`. Two entries with their luma and their derivation: `graveWall` `#1b2430` luma 13.71 and `graveTurf` `#263121` luma 17.85.
- `src/app/screens/game/layering.ts`. `layer(name)` no longer carries the non-null assertion (#121): a missing layer throws by name.
- `src/__tests__/boundary.test.ts`. A new row governing `screens/game/graveProjection.ts` with `mayReach: []` and `mayImport: []`, in the shape of the `sound.ts` row, and the title builder now says "nothing at all" for an empty reach rather than trailing off.
- `src/app/__tests__/palette.test.ts`. `SPRITE_LAYER` and `DARK_HALVES` gain the two colours, `SEPARATION_EXCEPTIONS` gains eight rows with their measured figures, and a new describe, "the grave in the ground (design record R4)", holds the two caps the colours were chosen against.
- `src/app/__tests__/layering.test.ts`. One new test for the assertion that was paid.
- `src/app/screens/game/__tests__/GraveRenderer.test.ts`. Seven new tests, three replaced, and two existing child counts moved from 1 to 4. All of them are named below.

`GameScreen.ts`, `ReplayScreen.ts`, everything under `src/game`, `src/tape`, `src/input` and `src/dev`, `graveHitbox`, the sizes, the growth, `glowAlpha` and `ARC_SEGMENTS` are untouched.

The draw order inside `graveMouth` is the four children R4 names: the ground art (the bites, the trodden margin, the tufts), the cut and its three walls, the empty `falls` container, and the overhang (the turf shadow and the grass). `falls` is positioned at the grave on every `sync` and never scaled, and the member carries its citation to R5.

## Verification results

**Every planned test is written and green.** The five projection tests were red first on their own assertion, against a `belowGround` that answered the origin and a `lightAtDepth` that answered zero: `expected { x: +0, y: +0 } to deeply equal { x: 0.5, y: -1 }`, `expected 0 to be less than 0`, `expected +0 to be close to -0.3240816326530611`, `expected +0 to be 1`, `expected +0 to be close to 0.8350615111533882`. The layering test was red first on `expected [Function] to throw an error`, against the non-null assertion still in place. The boundary row and the eight palette exceptions were red first as well: adding the two colours to `SPRITE_LAYER` turned assertion 3 red with exactly the eight pairs the exceptions now name.

The renderer's own tests were written against finished code rather than against a stub, which is the one place this slice did not run the loop the way the flow asks. Each was proved instead by a mutation spot check in a scratch copy of the app at `local/148-slice-3/copy`, never in the working tree. Ten mutations, each reverted before the next:

- dropping the scale on the hole's art turns "the hole grows with the grave" red;
- dropping `insideTheMouth` turns the same test red, on the side walls projecting past the near lip;
- clearing and repainting the hole on a size change turns "the hole's art is built once" red;
- scaling the `falls` container turns "the place for falls follows the grave and is never scaled" red;
- reaching one tuft past the bound turns "the bites, the grass and the tufts reach no farther" red;
- leaving `falls` out of `attach` turns five tests red;
- tripling the arc's stroke turns "the arc never leaves the hitbox" red, with the two older arc tests;
- redrawing the rim on every sync turns "a same-size sync redraws no rim stroke" red;
- brightening `graveWall` to luma 23.18 turns both the exception table and the new cap test red;
- a `import type { PointData } from 'pixi.js'` in `graveProjection.ts` turns the new boundary row red.

**One planned test was toothless and was rewritten before it was kept.** Test 8 asks that the rim's outer bounds equal `graveHitbox` "on a true rectangle". Putting the old rounded corner back passed every assertion in the file, because a rounded rectangle reports exactly the box it was rounded from, and bounds are all that file measured. The rim's own band is now asked at the corner with `containsPoint`, a field unit in from both edges, and that is what the mutation fails. A first attempt asked the same question of the mouth and passed under the mutation for the wrong reason, because a far-wall band covers that corner whatever shape the black is; that assertion was deleted rather than kept as a test that cannot fail.

**Test names compared before and after** with `scripts/test-names.ts` over two `vitest list --json` captures of this tree, the baseline taken before the first edit. 2486 names in the baseline, 2500 now, 17 added and 3 removed. The three losses are the three the entry names as replaced, each one renamed rather than dropped:

- "a sync at an unchanged size does not rebuild the geometry, and a sync at a changed size does" is the entry's test 6, now split in two: "the hole's art is built once and never cleared again, at any size" and "a same-size sync redraws no rim stroke" (test 13). The old test spied on the mouth's `clear`, which the ruling makes a thing that must never happen.
- "the drawn width is graveWidth(size) and the height twice the size, at the floor, the start size and the ceiling" is the entry's test 7, now "the hole grows with the grave: the black mouth is graveHitbox at the floor, the start size and the ceiling". It had to move: the art is held in unit space now, so `getLocalBounds` answers the unit rectangle and the claim is about the drawn bounds against the hitbox.
- "the rim strokes inward, so the drawn outer edge equals graveHitbox exactly (ADR 0003)" is the entry's test 8, now "the rim strokes inward on a true rectangle, so its outer edge equals graveHitbox at every size (ADR 0003)", at three sizes with the corner assertion above.

**The standing checks.**

- `pnpm --filter hungry-grave typecheck`: `✔ AssetPack Completed in 26ms`, no diagnostic. `pnpm verify` ran it again at the end and both apps report `typecheck: Done`.
- `pnpm --filter hungry-grave test`: `Test Files 168 passed (168)`, `Tests 2489 passed | 11 expected fail | 2 todo (2502)`, run after every edit this slice makes to production code.
- `pnpm --filter hungry-grave build`: `✓ built in 5.98s`, with the one pre-existing chunk-size warning below.
- `pnpm format:check`: `All matched files use Prettier code style!`. `pnpm lint`: clean, exit 0. Both again inside `pnpm verify` at the end, with `apps/housewarming test` reporting `Test Files 7 passed (7)`, `Tests 83 passed (83)`.

Three edits landed after that whole-suite run, all of them in test files: the rim's corner assertion, the deletion of the assertion that could not fail, and prettier's reformat of two files. The four test files this slice touches were re-run together after them, `Test Files 4 passed (4)`, `Tests 118 passed | 1 todo (119)`, and nothing else in the suite imports one of them.

**A whole-suite run after those three edits is the one check I did not land, and it is the machine and not the tree.** `pnpm verify` and three runs of `pnpm --filter hungry-grave test` were each started and each stopped by me rather than left behind, after forty to sixty minutes of wall clock apiece, on a box carrying a load average of seven to ten from work that is not this slice's. Vitest's own clock says otherwise every time, 107s, 122s and 154s, with 88 to 92 of those seconds in `import` alone, so what is stretching is the machine and not the suite. Two of those runs were far enough in to print `Test Files 167 passed (168)` with 2450 and 2480 tests passed: that missing file is the kill landing on the last one, never a failure. So the figures to read are the whole-suite run above, the four-file run after the last edits, and the green prettier, eslint and typecheck from the `pnpm verify` that ran last. Re-running the suite on a quiet machine is a two-minute job for whoever lands this, and it is worth doing before the commit rather than taking my word for it.

**The proof tape verifies on this tip.** `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts ../../local/148-proof-tape/2000.tape` reads `outcome: verified`, `readbackFaults: []`, `recordedFaults: []`, over its 22,821 ticks. No rule moved.

**The rendered check**, on the built app through `vite preview` on port 4182, driven with `playwright-cli` at a 390 by 844 viewport with device scale 3 (a `cli.config.json` in the scratch folder; the page reports `devicePixelRatio 3`). Every screenshot was opened and read. The grave is about twenty-five pixels wide at the start size, so each one was also cropped and blown up nearest-neighbour by a throwaway instrument in `local/148-slice-3/`, and the walls were measured off the pixel rows rather than by eye. Full paths are listed at the end.

At the size ceiling (67.5), low in the field and high in it, the hole reads as a box cut into the ground. The far wall is a clear trapezoid band across the top, fading down; both side walls run the whole length as strips converging inward; the right one is twice the value of the left; below them is black to the bottom rim with no floor and no near wall. Measured on the row at half depth: the shaded left wall is 5 px of the 48-px opening (10.4%), brightest `0c1018`; the lit right wall is 5 px (10.4%), brightest `19212d`. Down the middle the far wall runs 30 px of 98 (30.6%) and everything below it is `04060b` to the rim.

At the start size (27) the far wall still reads as a gradient down from the top edge, and the side walls are about one pixel each: the lit one is visible, the shaded one is a shade off black. At the size floor (18) the side walls are gone entirely and the hole is the far wall's fade over black inside a rim that takes most of the width. The cause is geometric and is the finding below.

The tufts read at all three sizes as small dark grey-green marks standing off the rim, and the ground under them shows through and differs between the two field positions, which is what decision 7 asks for. The trodden margin and the bites are inside the noise of the ground at this scale; they are visible in the blown-up crops and not at real scale.

The rim, the glow and the arc all still read, together, on one frame: a replay of the proof tape at `#/replay?tape=/2000.tape&at=12000` shows a ceiling-size grave whose rim wears the reservoir's amber glow all the way round with Territory's green arc traced over it from top-centre down the right side, the far wall and both side walls inside, black below. A live run at `?levels=5` shows the arc alone, at part charge and at full, its outer edge on the hitbox.

The readings I did not get: the reservoir's glow in a live run rather than in a replay, because the unsteered headless grave took hits rather than swallows and its reservoir never filled; and the glow and the arc apart from each other at the same moment, because the arc draws over the glow by design and the proof tape's grave carries both.

At size 33, the size Mark tuned the prototype at, beside the design record's figures from the prototype:

| | record (prototype) | measured (built app) |
| --- | --- | --- |
| far wall, share of the length | 29.1% | 27.1% |
| lit side, share of the width | 18.3% | 4.2% |
| shaded side, share of the width | 12.3% | 4.2% |

**The frame cost.** The frame budget screen builds a `FieldRenderer` and a `FieldLayers` and no grave renderer at all (`FrameBudgetScreen.ts`, `private readonly fieldRenderer = new FieldRenderer();` beside `private readonly layers = new FieldLayers();`, and its timed pass calls `this.fieldRenderer.sync` alone), so the grave's art is never inside the timed pass and this slice cannot appear in these numbers. Measured anyway, before the change and after it, render CPU mean and p95:

| field | before | after |
| --- | --- | --- |
| 4 / 10 | 0.38 / 0.70 ms | 0.31 / 0.50 ms |
| 30 / 60 | 0.71 / 1.40 ms | 0.71 / 1.30 ms |
| 80 / 200 | 1.21 / 1.90 ms | 1.52 / 2.60 ms |
| 100 / 250 | 1.41 / 2.10 ms | 1.85 / 3.10 ms |

The two large rows read 0.3 to 1.0 ms heavier after the change and the two small ones read lighter, on a machine that had been driving a browser for the better part of an hour by the time the second set was taken; an earlier capture of the same build read 1.45 / 2.20 for the 80 / 200 row, which is 0.4 ms off its own successor. The spread between two runs of the same build is larger than the difference between the builds, and the screen draws no grave, so what these say is that the instrument is noisy on this machine rather than anything about the slice.

**Open for the human**, as the entry says: whether the grave reads as a grave in the ground on his phone, and the colour of the tufts. Both are named in the record as his, and the side walls at the floor and start sizes below are the thing to look at first.

## Where the entry was wrong about the code

Every file, name and line the entry cites exists and does what it says. Four things it does not cover came up, and the first two are edits to existing tests that I made rather than stopping for, because the entry's own test 10 requires them and stopping the slice over a child count would have left nothing to review. They are here for the main session to reverse if that call was wrong.

1. **Two existing assertions count the mouth layer's children as one.** `GraveRenderer.test.ts`'s "the mouth lands in the graveMouth layer and the rim in the graveRim layer (ADR 0014)" and "detach then attach puts both pieces back" both assert `toHaveLength(1)` on `graveMouth`. Test 10 puts four children there, so both now read `MOUTH_CHILDREN`, which is 4. Neither test's promise or name moved.
2. **The file's `mouthOf` helper reaches `children[0]`.** With four children that is the ground art, so the helper now answers `children[1]`, the cut and its walls, which is what every test in the file meant by the mouth. The helper is not a test and no test name moved with it.
3. **Test 8 could not fail**, and is dealt with above under the mutation checks. The entry's wording ("on a true rectangle") describes a property that bounds cannot see.
4. **`?levels=0` is a fatal fault at tick 1, and it is not this slice's.** `levelsFromUrl` accepts "zero to the max line level" (`src/app/seedFromUrl.ts`), and `checkLevels` gives every birthright line a floor of 1 (`src/game/invariants.ts`), so `?levels=0` opens on THE GAME BROKE with `FAULT levels in range AT TICK 1`. I met it while staging a quiet field for the rendered check and used the default loadout instead. Nothing in this slice touches either file.

## Decisions made

- **The wall's own colour is capped by the ground tile it is cut into.** `graveWall` sits at luma 13.71 against `nightSpeckle`'s 13.99, because earth cut to face sideways keeps less moon than earth lying face up, and the three faces take a share of it from `FACE_MOON` rather than each having a colour. Evidence: the brightest band the hole draws is then one value under the ground beside it, and the whole cost to ADR 0014 is four pairs rather than the corpse and the feast as well. To reverse: raise the entry, and the exception table grows by whatever the new value costs.
- **Claimed ground loses 2.6 APCA points over the grave's new interior, and this is the one hard-won value this slice spends.** `territoryGround` was solved to the tenth of a luma point to clear Lc 45.92 over the mouth's black; over the lit wall it measures 43.30 and over a tuft 41.30. It cannot be bought back from either side: a mob body sits 1.4 under the band ceiling so the ground cannot rise, and the wall cannot fall without being the black again. The pair is named in `SEPARATION_EXCEPTIONS` with the figures and the argument, that a patch is read by the field it covers rather than by the sliver of it lying across a hole. To reverse: a hole the player cannot see into.
- **The two new colours join `SPRITE_LAYER` and `DARK_HALVES` rather than `NOT_SPRITES`.** They are background art, so the stand-in ground's bucket was available and would have left assertion 3 blind to the brightest thing the grave now draws. Declaring them is what put the four pairs on the record. To reverse: move both names to `NOT_SPRITES` and delete the eight exception rows, and the cost above stops being written down anywhere.
- **The turf's value is forced from above by the food layer.** At luma 17.85 a corpse over a tuft measures Lc 45.16 against the bracket's 45; a point brighter and the food layer stops clearing its own ground cover. That leaves nothing for the value channel against the ground itself (Lc 0.00 over `nightSpeckle`), so the tufts part from the ground on hue alone, which the new cap test holds. To reverse: Mark's own colour call, which the record already reserves for him.
- **A projected point is clipped to the mouth's rectangle.** The side faces' near ends project past the near lip, by 2.3% of the half-length at the dark depth, and the near lip is between the camera and that sliver. Clipping it is what keeps the drawn mouth exactly `graveHitbox` (ADR 0003) with no mask. Evidence: without it the hole's bounds exceed the hitbox and test 7 is red. To reverse: a mask on the hole's Graphics, which the bounds tests would then have to be rewritten around.
- **The corner edges start at the second band.** A stroke whose centreline is the opening's own corner puts half its width outside the mouth, 0.315 field units at the size floor. The edge now starts one band down, where the projection has already carried it inside. To reverse: draw the edge as a polygon instead of a stroke and take it to the lip.
- **The bites are drawn outward in the ground art and not in the cut.** R4 asks for a true rectangle with outward bites and the entry's test 7 asks the black to be the hitbox exactly, which cannot both be one shape. The bites are ground that fell away, so they belong with the trodden margin, outside the rim and under everything. To reverse: cut them into the black and test 7 loses its equality.
- **The irregular shapes are written down rather than generated.** `LIP_BITES`, `MARGIN_SWELL`, `OVERHANGING_GRASS` and `TUFTS` are literal tables, following `StormRenderer`'s own rule that a renderer takes no randomness. To reverse: a seeded stream like `groundDressing.ts`'s, which would also have to be free of hex literals.
- **The boundary row's title says "nothing at all" for an empty reach.** The row is the first with `mayReach: []` and the title builder would otherwise have ended mid-sentence. To reverse: give the projection something to reach.

## Open items

- **The rim covers most of the side walls at the smaller sizes**, and it is the thing to look at before anything else. The rim strokes 3 field units inward from the hitbox with its 1-unit companion inside that, which is 4 units of the opening's own width on each side whatever the size, while the side wall the projection gives is 16.3% of the width. At the ceiling that is 7.9 units against 4 and both walls read; at the start size it is 4.4 against 4 and about a pixel survives; at the floor it is 2.1 against 4 and nothing does. The design record's prototype figures were measured on a grave with no rim at all, which is why the measured shares at size 33 are a quarter of the record's. Nothing here is a bug: R4 rules the rim keeps its fixed stroke and ADR 0003 puts its outer edge on the hitbox, and the two together spend the side walls at small sizes. It is a design question and it is Mark's.
- The production build still ends with the chunk-size warning, `pixi-eS3LEK9H.js 589.65 kB`. Ticket #51, open before this branch, and nothing in this slice is in that chunk.
- The frame budget's own figures move more between two runs of one build than between the two builds, which makes the screen a poor instrument on a loaded machine. It is worth knowing before slice 4 leans on it, because slice 4's entry asks it for the falls' own cost.
- The trodden margin and the bites do not survive the phone's pixel grid at the floor or the start size. They cost nothing and they read in the crops; whether they earn their draw calls is worth asking once Mark has seen the grave.
- The replay screen still fast-forwards past the tick `?at=` names, as slices 1 and 2 recorded. This slice needed no held tick, because nothing it draws is a short state.

Every server, browser and background process started for this slice was stopped, checked by name at the end: the `vite preview` on port 4182 is down and its port answers nothing, the `playwright-cli` browser is closed and `playwright-cli list` reports no browsers, and no vitest, vite-node, turbo or eslint process of this worktree is alive. The long-lived `vite preview` on port 4173 belongs to another worktree, still answers, and was left alone, which is why 4182 was used. The scratch copy of the app the mutations ran in is deleted, the throwaway instruments beside it sit in `local/148-slice-3/` outside git, the working tree holds no probe file, and `apps/hungry-grave/dist/2000.tape`, copied there to serve the replay, is deleted.

## Screenshots

All under `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/148-grave-in-the-ground/local/148-slice-3/screenshots/`:

- `size18-bottom.png`, `size18-top.png`, `zoom-18-low.png`, `zoom-18-high.png`
- `size27-bottom.png`, `size27-top.png`, `zoom-27-low.png`, `zoom-27-high.png`
- `size67.5-bottom.png`, `size67.5-top.png`, `zoom-675-low.png`, `zoom-675-high.png`
- `size33-a.png`, `size33-zoom.png`, the size the prototype was tuned at
- `replay-12000.png`, `zoom-glow.png`, the rim, the glow and the arc together on the proof tape
- `charged-b.png`, `zoom-charged.png`, `charged-e.png`, `zoom-charged-e.png`, the arc at part charge and at full in a live run
- `before-frame-budget-wide.png`, `after-frame-budget.png`
- `title.png`, `play-27.png`, the boot and the first live frame

## Stuck

None.

## Landing (the main session)

- The whole-suite run the coder could not finish was run by the main session on a quiet machine (load 0.5): `pnpm verify` passes whole, 168 test files and 2489 tests green, prettier, eslint and both typechecks clean.
- The harness reported the coder stopped with background work running, three times. Checked each time: no process of the coder's was alive.
- CodeRabbit, one minor finding, declined: it asks the turf's hue-gap test to require 20 degrees in place of `SPRITE_SEPARATION.hue`. That constant (15) is the file's one separation rule, and a private 20 would be a second rule with no source.
- The two child counts and the `mouthOf` helper the coder changed in `GraveRenderer.test.ts` are accepted: the entry's own test 10 puts four children in the mouth layer, so the old count of one could not stand, and no test's promise or name moved.
- The main session looked at `zoom-27-low.png`, `zoom-675-low.png` and `size27-bottom.png`. At the ceiling size the hole reads: the far wall fades down, both side walls show, the right one lit. At the start size on a phone the grave is a small pale outlined box and the hole's art barely shows, because the rim's 4 field units a side take most of a 13.5 unit opening. The slice is built as R4 rules (each rim job keeps its place), so nothing was changed; it is first on the handoff's list for Mark's read.
- `?levels=0` faulting at tick 1 is written into slice 6's entry, which already works in `levelsFromUrl`. The frame budget screen's noise is written into slice 4's entry.
