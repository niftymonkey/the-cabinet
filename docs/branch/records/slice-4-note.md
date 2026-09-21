# Slice 4 coder note: the fall and the teeter (design record R5)

## What changed

New, in `apps/hungry-grave/`:

- `src/app/screens/game/fall.ts`. The Fall of the glossary as a pure function of a fall's age: the record `Fall` (the unit place, the unit way, the half extent in field units, the born tick), `fallAt(fall, age, graveSize)` answering a `FallDrawing` (an offset from the grave's centre in field units, the way the body lies, how far it is squeezed along that way and across it, how much moon still reaches it, whether the dark has it), and `FALL_TICKS`. It imports the projection, the drawing values, `TICK_HZ` and the sim's own `graveWidth`, and no Pixi at all. Private: `rimCrossedAt`, `pastTheRim`, `endTurnedBy`, `endsAround`, `tipEnds`, `dropEnds`, `drawnBetween`, `foldAt`. The export names slice 5's Undertaker as the second caller.
- `src/app/screens/game/FallRenderer.ts`. The pool that draws falling food: `attach(into, caps)`, `detach()`, `forgetPreviousRun()`, `sync(run)`, the birth seam `swallowed(run, event)`, and `FALL_RENDERER_TRANSIENT_TICKS`. It takes the container it draws into rather than a layer, the pool is grown to the corpse cap by the field renderer's own `fill` pattern, and `freeSlot` recycles the oldest fall and says so.
- `src/app/screens/game/__tests__/fall.test.ts`, ten tests. `src/app/screens/game/__tests__/FallRenderer.test.ts`, six.

Changed, in `apps/hungry-grave/`:

- `src/game/events.ts`. `Swallowed` gains `offsetX`, `offsetY`, `halfExtent`, `vx`, `vy`, `graveSize`, `tier`, `treasureBody` and `line?`, and the type is exported, because the two screens and the frame budget screen now name it.
- `src/game/swallow.ts`. `Swallowable` gains `x`, `y`, `halfExtent`, `vx`, `vy`. `swallow` is the one place the offset is subtracted, and it is taken before `payGrowth`, so `graveSize` on the event is the size at the tip and never the size the swallow just bought.
- `src/game/corpses.ts`. `asSwallowable` fills the five new fields from the corpse.
- `src/app/screens/game/graveDrawingValues.ts`. Ten new rows: `FALL_TIP_SECONDS` 0.30, `FALL_DROP_SECONDS` 0.75, `FALL_TILT` 1.36, `FALL_SLIP_SHARE` 0.6, `FALL_DRAG` 2.4, `FALL_FOLD_FLOOR` 0.3, `TEETER_START` 0.12, `TEETER_TILT` 0.35, `TEETER_SHAKE` (0.1 rad at 4.5 Hz), `TEETER_DARKEN` 0.8.
- `src/app/screens/game/foodSprite.ts`. `paintCorpseBody` and `paintTreasureBody` extracted out of `drawCorpse` and `drawTreasureBody`, which keep their signatures and what they draw; new `drawFoodBody(into, look)` and its `FoodLook`, so a fall draws the food that went in from values rather than from a body; `greyTint` exported.
- `src/app/screens/game/FieldRenderer.ts`. The teeter inside `syncCorpses`, through the new module functions `leanOf` and `teeterTurn`: every live piece of food has its lean written every frame, into the sprite's `rotation` and into the brightness the freshness tint is built from.
- `src/app/screens/game/transients.ts`. `FALL_RENDERER_TRANSIENT_TICKS` joins the registry as a fourth owner.
- `src/app/screens/game/GameScreen.ts` and `src/app/screens/ReplayScreen.ts`. The fall renderer constructed, attached to `this.grave.falls` in `dressField` and again in `beginDrawing`, synced in `syncScreen`, and born on the `swallowed` event. The replay's comment about the loss announcement is rewritten to say what the code does.
- `src/app/screens/FrameBudgetScreen.ts`. The falls attached to `layer('graveMouth')`, the new `standFalls` births the row's own corpse count of falls spread exactly over one fall's lifetime, and the renderer is forgotten between rows and detached in `reset()`.
- `src/__tests__/boundary.test.ts`. A new row governing `screens/game/fall.ts`.
- Tests that gained the widened event or the widened `Swallowable`: `src/app/screens/game/__tests__/FieldRenderer.test.ts` (six new teeter tests), `__tests__/transients.test.ts` (one new test, two existing gained the fourth owner), `src/game/__tests__/swallow.test.ts` (three new tests, the existing `Swallowed` literal widened, seven helpers gained a `LYING_STILL` spread), `src/app/__tests__/sound.test.ts`, `src/game/__tests__/scorePayments.test.ts`, `src/game/__tests__/mobs.test.ts`, `src/dev/readings/__tests__/scoreByInput.test.ts`, `freshness.test.ts`, `foodLedger.test.ts`, `belchCadence.test.ts`, and `src/game/__tests__/corpses.test.ts`, whose "converts to the value swallow.ts takes" asserts the whole record `asSwallowable` answers and now names the five new fields.

Nothing in `src/game/step.ts`, `src/game/pull.ts`, `src/game/tip.ts`, `src/game/tuningRecord.ts`, `src/tape`, `src/dev` or `GraveRenderer.ts` changed.

## Verification results

**Every planned test is written, was red on its own assertion, and is green.** The two new modules were stubbed first (a `fallAt` answering a wrong value of the right type, a `FallRenderer` whose methods do nothing) and every name was pinned as a `test.todo` before it was written.

- `fall.test.ts`, ten red: `expected 27.5 to be close to 13.5`, `expected 27.5 to be close to 13.5`, `expected +0 to be close to 1`, `expected NaN to be close to 1`, `expected 0 to be less than 0`, `expected 46.5 to be less than 45.5`, `expected +0 to be close to 0.79`, `expected 49.5 to be greater than 49.5`, `expected +0 to be close to 0.97`, `expected false to be true`. The first pass of the stub carried `FALL_TICKS = 0`, which made the two tests that walk the drop's own ticks pass over an empty loop; the stub was corrected to the real 63 and both went red on their assertions before the implementation was written.
- `FallRenderer.test.ts`, six red: four `expected [] to have a length of 1`, `expected "warn" to be called 1 times, but got 0 times`, `expected [] to have a length of 704`.
- The six teeter tests were written against the un-teetered renderer and went red there, and were run red a second time with the lean forced to zero once a fixture bug in my own helper was fixed, so all five that assert a lean are red for the right reason: `expected 0 to be greater than 0`, `expected 0 to be greater than or equal to 0.24999999999999997`, `expected +0 not to be +0`, `expected 0 to be greater than 0`, `expected 10461087 to be less than 10461087`.
- The three new `swallow.test.ts` tests and the widened `Swallowed` literal were written after the event was widened, so they were proved by a mutation in the working copy instead: with the offsets left as raw field positions and the look and the size zeroed, all four go red (`expected 214 to be 14`, `expected +0 to be 20`, `expected false to be true`, and the literal's deep equality). The mutation was reverted immediately.
- The new boundary row was proved the same way: a `import type { PointData } from 'pixi.js'` and a palette import in `fall.ts` turn it red with both named.

Every expected value in `fall.test.ts` is worked by hand from the record's own figures, and the four that are magnitudes came out right against the implementation on the first run: 13.5 field units at the rim of a 27-size grave, 27 at twice that size, 0.363 for the foreshortening at the full tilt of 1.36 rad, 0.790 for the light 22 ticks into the drop, 0.97 for the projection's shrink at the end of the tip, and 63 ticks for the whole fall.

One real failure hid inside a whole-suite run for a while and is worth recording: the first run reported two failures, I read the tail, saw the `stage.test.ts` timeout, and took both for contention. The other was `corpses.test.ts` above, a genuine red from the widened record, and it stayed unfixed until the second whole-suite run put it at the top of the tail. The lesson is the obvious one: count the failures and read every one of them, never the last.

**Test names compared before and after** with `scripts/test-names.ts` over two `vitest list --json` captures, the baseline taken before the first edit: 2500 names in the baseline, 2527 now, 27 added and 0 removed.

**The standing checks.**

- `pnpm --filter hungry-grave typecheck`: clean, no diagnostic.
- `pnpm --filter hungry-grave test`: `Test Files 170 passed (170)`, `Tests 2516 passed | 11 expected fail | 2 todo (2529)`.
- `pnpm --filter hungry-grave build`, re-run on the final tree: `✓ built in 5.79s`, with the one pre-existing chunk-size warning below and no other warning.
- `pnpm verify` from the repo root, run whole on a quiet machine (load average 0.5) after the last edit with nothing else of mine running: it passes end to end. `All matched files use Prettier code style!`, `eslint` clean, both apps `typecheck: Done`, `apps/housewarming test: Test Files 7 passed (7)`, `Tests 83 passed (83)`, and `apps/hungry-grave test: Test Files 170 passed (170)`, `Tests 2516 passed | 11 expected fail | 2 todo (2529)` in 148.29 s.

**The proof tape verifies on this tip.** `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts ../../local/148-proof-tape/2000.tape` reads `"outcome": "verified"` over its 22,821 ticks, with `"recordedFaults": []` and `"readbackFaults": []`. No rule moved.

**No pin moved.** `GOLDEN`, `WITNESS_VERSION` and the bot's seed lists are untouched and their tests pass, which is what the entry says this slice must leave alone.

**The rendered check of the fall**, on the built app through `vite preview` on port 4187, driven with `playwright-cli` at a 390 by 844 viewport with device scale 3 (the page reports `devicePixelRatio 3`, `innerWidth 390`), replaying the proof tape from `#/replay?tape=/2000.tape`. The tick was held the way slices 1 and 2 held theirs, by replacing the page's `requestAnimationFrame` with a manual pump and freezing `performance.now`, advancing it one tick's worth per pumped frame; nothing in the repository was changed for it. `playwright-cli screenshot` writes at CSS resolution, so every shot below was taken through `page.screenshot({ scale: 'device' })` and then cropped and blown up nearest-neighbour by a throwaway instrument in the scratch folder. Every screenshot was opened and read.

At the start size, where the grave is 27 field units wide and the field is quiet:

- Tick 1116, a corpse at 0.50 of the threshold's 0.55, lying across the left rim: a cream hexagon whose left half is out on the ground and whose right half is over the mouth, visibly turned out of square against the same corpse at tick 1112 (share 0.21), which stands with its flat top level. That is the teeter, and it is the tell the entry asks for.
- Tick 1117, the tick it goes in: the body is gone from the ground and a pale sliver is inside the mouth at the left rim, a little above centre, which is exactly the offset the event carried (-12.7, -9.1 against a size of 27.7). It went over the edge it crossed and not from the middle.
- Tick 1044, a fall two ticks old at the top-right rim: a cream wedge tucked into the corner of the hole, half of it hidden behind the rim. Tick 1050, eight ticks old: the same wedge, slightly narrower. Tick 1060, the last tick of the tip: a sliver, foreshortened to about a fifth of its length, still in the same corner. The turn is eased in, so the first half of the tip moves the body very little and the last third does nearly all of it.
- Tick 1075 and tick 1090, the same fall at ages 33 and 48: not visible. It is deep enough by then that the light curve has taken it below what the black of the hole can show, which is what R5 asks for and which means the drop's second half reads as the dark taking the body rather than as a body descending.
- Tick 987, three falls at once, ages 22, 17 and 11: three separate pale shapes in the upper left of the mouth, each at its own place and its own stage, one of them clearly smaller and dimmer than the others.

At a grave near the size ceiling (64.9 to 65.4), where the mouth is 137 device pixels across:

- Tick 11853: two falls inside the hole at different depths, the upper one a bright lozenge near the far wall and the lower one distinctly smaller and darker, plus the teetering corpse half behind the right rim. This is the frame where the shrink and the darkening read plainly as depth.
- Tick 11866: two falls against the right rim at a third and a half way down, both foreshortened across the way into the hole, plus one at the near lip. Tick 11935, two falls at age 27: both are dim slivers well inside the black. Tick 11965, at age 57: one is a brownish smudge, nearly gone.

What I could not get from these frames: the fall against Territory's hands. The hands and the food layer both draw above `graveMouth`, so a patch laid over the grave covers the top of the hole and the falls under it. That is the existing layer stack rather than anything this slice added, and it is in the open items.

**The rendered check of the teeter** is the tick 1112 and tick 1116 pair above. How far the body leans: at the threshold it sits at 0.35 rad with a 0.1 rad tremble at 4.5 Hz and keeps 80% of its brightness. Whether a player reads that as "nearly in" rather than as a glitch is Mark's, and at 25 pixels of phone the lean is a small tell: it is legible frame against frame and I cannot say from a still whether it reads in motion.

**The frame cost.** Three captures of each side on the built app, the "before" taken on the untouched tree before the first edit, both at the same 1280 by 720 window, the machine at a load average of 0.2 to 0.8 at the start of each set. Render CPU mean, in milliseconds, with the spread across the three captures beside it:

| field | before, mean (spread) | after, mean (spread) | the falls add |
| --- | --- | --- | --- |
| 4 / 10 | 0.36 (0.06) | 0.53 (0.14) | +0.17 |
| 30 / 60 | 0.75 (0.03) | 1.26 (0.34) | +0.51 |
| 80 / 200 | 1.25 (0.06) | 2.04 (0.05) | +0.78 |
| 100 / 250 | 1.53 (0.15) | 2.56 (0.07) | +1.03 |
| 200 / 500 | 3.14 (0.20) | 4.42 (0.27) | +1.28 |

Every one of those additions is larger than the spread on either side, so unlike slice 3 the instrument can see this change. It is a headroom figure and not a field a player can reach: the row holds its whole corpse count of falls in the air continuously, which is every body on the field going in inside one second, and the record already says the same of its two largest rows. The sim column did not move.

**Open for the human**, as the entry says: whether the fall reads as a body going over the edge rather than a body being deleted, whether the teeter reads as "nearly in" rather than as a glitch, and the tip and drop times on his phone.

Every server, browser and background process started for this slice was stopped and checked by name at the end: the `vite preview` on port 4187 is down and the port answers nothing, `playwright-cli list` reports no browsers, and no vitest or vite-node process of this worktree is alive. The long-lived `vite preview` on port 4173 belongs to another worktree and was left alone, which is why 4187 was used. `apps/hungry-grave/dist/2000.tape`, copied there to serve the replay, is deleted, and the working tree holds no probe file.

## Where the entry was wrong about the code

Two things, both small, and neither changes what the entry concludes.

1. **`swallowed` has a fourth reader in shipped code.** The entry says "Its readers in shipped code are three readings and nothing else: `src/dev/readings/freshness.ts:34`, `src/dev/readings/wakingSwallows.ts:75`, `src/dev/readings/powerUpLedger.ts:135`". `src/dev/readings/foodLedger.ts:57` reads it too, `if (event.type === 'swallowed') acc[event.kind].swallowed += 1;`. It reads only the kind, so the entry's conclusion holds for it exactly as for the other three, and nothing changed there.
2. **The entry names the two `Swallowed` literals and none of the fourteen `Swallowable` ones.** Widening `Swallowable` is a typecheck failure at every hand-built food in the tests: seven in `swallow.test.ts`, three in `freshness.test.ts`, and one each in `scorePayments.test.ts`, `scoreByInput.test.ts`, `foodLedger.test.ts`, `belchCadence.test.ts` and `mobs.test.ts`. There is one more that typecheck cannot see: `corpses.test.ts`'s "converts to the value swallow.ts takes, and never hands out the entity" asserts `toEqual` on the whole record `asSwallowable` answers, so it goes red the moment that record widens. All of them gained the five fields mechanically, none of their promises moved, and no name moved.

Everything else the entry cites is there and does what it says. The line numbers had shifted where slices 1 to 3 landed and every name sat where the entry put it.

## Decisions made

- **A falling body's brightness is the depth curve alone, and not the freshness tint multiplied into it.** The prototype's own pit copy takes `lightAtDepth` and nothing else, and Mark played that. The cost is a one-frame brightening when a nearly rotten corpse goes in. To reverse: multiply the freshness fade into the tint in `FallRenderer.sync`, which needs a values-taking brightness out of `foodSprite.ts`.
- **The fold relaxes when the grave grows.** A body's unit half extent is its field half extent over the grave's current size, so a feast that had to fold into a small mouth folds less once the mouth doubles under it. It is the same rule as the place being held in proportions, and the alternative is a fold frozen at the tip, which would keep a body folded into an opening it now fits. To reverse: carry the fold on the `Fall` record at birth.
- **The teeter spends two channels and not four.** The prototype nudged the body toward the hole, squashed it, shook it and darkened it. The entry's rows name a start, a tilt, a shake and a darkening, so the lean rides the sprite's rotation and its tint and the body is never moved off the place the rules put it. The two figures were opened up from the prototype's (a tilt where it had none, 0.1 rad of shake against its 0.02) because a corpse here is 14 field units against its 20 to 44, and its tremble would move a corner of this body by a fifth of a pixel. To reverse: the four rows are data, and a squash would be a fifth.
- **The body leans by the side it lies on.** A body left of the grave's centre turns one way and a body right of it the other, so the lean reads as toward the mouth. To reverse: one line in `teeterTurn`.
- **The hinge is the inward normal of the nearest edge, not the direction to the mouth's centre.** The prototype's mouth was a polygon and it took the direction to the centre; ours is a true rectangle, so an edge has an honest normal and a body goes over that edge square. The nearest edge is chosen from the nearest point inside the mouth, which is what keeps a body lying outside the far lip hinging on the far edge instead of tying with the two sides. To reverse: `rimCrossedAt`.
- **`foodSprite.ts` gained a values-taking drawer rather than the fall composing the food's body itself.** The fall renderer has the look as three values and no `Corpse`, and the alternative was a second copy of the hexagon and the icon in the new renderer. `drawCorpse` and `drawTreasureBody` keep their signatures and their output. To reverse: inline the two painters into the fall renderer and take the export back out.
- **A fall that reaches the dark hides before its 63 ticks are up.** `fallAt` answers `gone` at the dark depth as well as at the end of the fall, and a body that the tip carried part of the way down reaches the dark around tick 52. The light is exactly zero there, so nothing pops: the sprite stops being drawn once it is black on black. To reverse: hide on the age alone.
- **The frame budget screen births its falls on a Bresenham spread** rather than `ceil(wanted / FALL_TICKS)` a frame. The entry's figure overshoots the pool on the large rows (12 a frame for 63 frames is 756 against a pool of 704) and would log a recycle, which the entry also says must never happen; the exact spread holds precisely the row's own count in the air and never wraps. To reverse: the two `Math.floor` lines in `standFalls`.
- **The tip's monotonic claim is made over the back half of the tip.** The first two ticks draw the body a hair longer (four parts in ten thousand) because the end still outside the rim rises above the ground and the camera magnifies it, which is the projection working as the prototype's own comment describes. The test asserts the squeeze falls on every tick from the halfway mark, where the tilt is already 5% into the foreshortening, and pins the full tilt's own value at the end. To reverse: nothing to reverse in the code.

## Open items

- **Territory's hands cover the falls.** The patch draws in the `storm` layer, above `graveMouth`, so a lay over the grave hides the top of the hole and anything falling into it. Food on the field has the same relationship with the hole already. Nothing here changed the stack (ADR 0014), and whether a fall should draw over the hands is a design question.
- **The drop's second half is not visible at the start size.** By half way down, the light curve has taken the body below what the black of the hole can show, so what a player sees at 27 units is a body squeezing over the rim and then being taken. At the ceiling size the descent reads, because the hole is five times the area. Both are R5 working as written; whether the drop should stay brighter for longer is Mark's.
- The production build still ends with the chunk-size warning, `pixi-eS3LEK9H.js 589.65 kB`. Ticket #51, open before this branch, and nothing in this slice is in that chunk.
- The replay screen still cannot be held at the tick `?at=` names, as slices 1, 2 and 3 recorded. This slice worked around it from outside the app for the fourth time, and the workaround is now the only way to photograph a short state in the rendered app at a chosen tick.
- **`stage.test.ts`'s determinism test times out under contention.** It timed out at 5000 ms in both whole-suite runs taken while the machine was carrying other work, and passes in the quiet `pnpm verify` above and on its own (43 tests and one expected fail in 25 s). It is a timeout and never an assertion, which is the contention reading `lessons.md` already names, and it is worth knowing that this one test is the first to fall over when the box is busy.
- **A stray watcher process from an earlier session is alive**, a `zsh` loop started at 18:16 polling `local/148-slice-3/verify.log` for slice 3's run to finish. It is not mine and it was left alone; it sleeps and costs nothing.

## Stuck

None.

## Screenshots

All under `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/148-grave-in-the-ground/local/148-slice-4/screenshots/`. Each `zoom-` file is the crop of the frame beside it, blown up nearest-neighbour.

- The teeter and the tip it becomes, at the start size: `small-tick1112-share21.png`, `small-tick1116-share50.png`, `small-tick1117-swallowed.png` and their three crops.
- One fall through its whole life at the start size: `small-tick1044-age2.png`, `small-tick1050-age8.png`, `small-tick1060-age18.png`, `small-tick1075-age33.png`, `small-tick1090-age48.png`, `small-tick1100-age58.png` and their six crops.
- Many falls at once: `small-tick987-three-falls.png`, `big-tick11866-four-falls.png`, `big-tick11878-falls.png` and the two crops.
- The shrink and the darkening at the ceiling size: `big-tick11853-teeter.png`, `big-tick11843-fall-age6.png`, `big-tick11855-fall-age18.png`, `big-tick11905-falls-deep.png`, `age02.png`, `age12.png`, `age27.png`, `age42.png`, `age57.png` and their crops.

## Landing (the main session)

- CodeRabbit, two findings. Fixed: `leanOf` in `FieldRenderer.ts` divided by `threshold - TEETER_START`, and a tuning record may put the threshold at or below the teeter's start (R1 allows anything above zero), so a sliver leaned the full tilt under a threshold of 0.1 and the division was by zero at 0.12. With no span to lean through, food under the threshold now stands straight. New test, red first on its own assertion (`expected 0.4409297426825681 to be +0`): `stands every corpse straight under a threshold at or below where the teeter starts`. Declined: the claim that the `swallow` tuning group is missing. Slice 1 added it, and the review saw only this slice's diff.
- The main session's first whole `pnpm verify` failed on one test, the timeout the coder had named: `stage.test.ts`, "gives an identical spawn sequence for an identical seed, over a whole section", 5.29 s against vitest's 5. Measured alone it takes 1.88 s here and 1.77 s on `main`, so this branch did not slow it; it stretches when 170 files run beside it on a busy machine. The same file already states a budget with its reason for two other long tests, and this test now has one too (`TWO_WHOLE_SECTIONS_MS`). The second whole `pnpm verify` passes: 170 test files and 2517 tests green.
- The main session looked at `zoom-11853-teeter.png` and `zoom-age57.png`. At the ceiling size the fall reads: bodies squeeze over the rim they crossed, shrink and dim against the wall, and the corpse at the right rim leans in. Falling bodies darken through a warm grey, by the same grey tint a rotting corpse on the ground already wears; it is on the list for Mark's play.
- 153 comments under `src` and `scripts` cite ADR numbers that the 64-to-16 condensation retired (0053, 0057, 0064 among them). The ADR README maps each to its new home, so they resolve. It belongs to the foundations doc sweep (#86), not to this branch.
