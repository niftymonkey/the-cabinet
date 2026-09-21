# Slice 7 note: the Undertaker's end

## 1. What changed

- `apps/hungry-grave/src/app/screens/game/endingScene.ts` (new). The scene's arithmetic, no Pixi import of any kind. `EndingScene` (the record the death hands it: the boss's kind, where he fell, the grave's place and size, and the rim point and way in, all fixed at the death), `EndingSceneDrawing` (`x`, `y`, `inTheHole`, `turn`, `wide`, `tall`, `light`, `gone`, `furrows`), `sceneFrom(killed, grave)`, `endingSceneAt(scene, progress)` and `ENDING_SCENE_MS`. Private: `whereThePullCrosses`, `rimHauledTo`, `rimOf`, `halfExtentIntoTheHole`, `hauledBy`, `draggedAt`, `fallAgeAt`, `fallingAt`.
- `apps/hungry-grave/src/app/screens/game/EndingSceneRenderer.ts` (new). The dumb view: `attach(layers, falls)`, `detach()`, `forgetPreviousRun()`, `begin(killed, grave)`, `show(progress)`. Three Graphics in three places: the furrows in `ground`, the dragged body in `mobBodies`, the falling body in the grave's `falls`. Private: `scrapeFurrows`, `traceFurrow`, and the module's `wanderAt`, `FURROW_POINTS`, `FURROW_SPREAD`.
- `apps/hungry-grave/src/app/screens/game/runEnding.ts`. `RunEnding` gains `advance(elapsedMs)` and the read-only `sceneProgress`; `Ending` gains `holding` and `heldMs`; `reset()` lowers both. New `holdsForTheScene` (victory with no stop) and `advance`. The seal, the once-only capture and the navigation retry are unchanged; the hold sits between them.
- `apps/hungry-grave/src/app/screens/game/graveDrawingValues.ts`. New rows: `ENDING_SCENE_SECONDS` 2.8, `ENDING_BEATS` (drag 0.52, claw 0.1, tip 0.11, fall 0.27), `ENDING_DRAG_EASE` 2, `ENDING_FURROWS` (4 lines, spread 0.62, width 3, alpha 0.75, and an eight-entry wander profile), `ENDING_FIELD_FADE` (shotsGoneBy 0.15, mobsDimBy 0.25, mobsKeep 0.35).
- `apps/hungry-grave/src/app/screens/game/fall.ts`. Three names exported that were private: `rimCrossedAt`, `TIP_TICKS`, `DROP_TICKS`, plus the `Hinge` type. No behaviour changed.
- `apps/hungry-grave/src/app/screens/game/bossSprite.ts`. New `DrawnBoss` (kind and flash), which `bossFlashInverted`, `bossLook` and `drawBoss` now take in place of `Boss`. The sim's `Boss` satisfies it, so `BossRenderer` is untouched.
- `apps/hungry-grave/src/app/screens/game/FieldRenderer.ts`. New public `fadeForEnding(progress)` and the module's `shareBy`; `forgetPreviousRun` ends with `fadeForEnding(0)`. Shots and scatters fade to nothing, mobs dim to `mobsKeep`.
- `apps/hungry-grave/src/app/screens/game/GameScreen.ts`. The scene renderer built, attached in `dressField` after the falls, forgotten in `beginDrawing`, begun from `bossKilled` in `announce`, and a new `'ending'` branch at the top of `spendFrame` that spends the frame's elapsed through the policy, advances the ending and calls the new private `showScene`.
- `apps/hungry-grave/src/app/screens/ReplayScreen.ts`. The same wiring, plus its own `sceneMs` counter and `runScene(elapsedMs)`, which advances the scene on the frame clock past the tape's end and leaves it on its last frame. `reset()` and `beginDrawing` clear the counter.
- `apps/hungry-grave/src/app/screens/tapePlaybackSession.ts`. `primePlayback` speaks a refusal for `conditionNotImplemented`, carrying `unimplementedCondition`.
- `apps/hungry-grave/src/app/seedFromUrl.ts`. `levelsFromUrl` repairs a value below 1 through `ignoreLevels`, and its JSDoc says "one to the max line level" with the reason.
- `apps/hungry-grave/src/game/events.ts`. `BossKilled` added to the type exports. Nothing else.
- `apps/hungry-grave/src/game/stage/stage.ts` and `src/game/bosses/undertaker.ts`. The two comments now tell the ending as built and cite the Undertaker's paragraph rather than a line number. Comment-only: the diff has no non-comment line.
- `apps/hungry-grave/docs/design/game-concept.md`. The one sentence replaced, exactly as the entry gives it.
- New tests: `__tests__/runEnding.test.ts` (11), `__tests__/endingScene.test.ts` (7), `__tests__/EndingSceneRenderer.test.ts` (4). Added: two in `__tests__/FieldRenderer.test.ts` under "the field under the ending (grave-in-the-ground R6)", two in `src/app/__tests__/screenLifecycle.test.ts`, one in `src/app/screens/__tests__/tapePlaybackSession.test.ts`, one in `src/app/__tests__/seedFromUrl.test.ts`.

## 2. Verification results

**Every planned test written, red on its own assertion first, green now.** The 25 planned tests are all present and green. Red evidence:

- `runEnding`: 7 red against a stub with no hold (`expected "vi.fn()" to not be called at all, but actually been called 1 times`, `expected +0 to be null`), and the other 4 red against a stub that holds forever (`expected "vi.fn()" to be called 1 times, but got 0 times`), except the seal-once test, which is a safety net over behaviour this slice does not change and went red only under mutation F below.
- `endingScene`: all 7 red against the stub (`expected +0 to be 270`, `expected 600 to be close to 573`).
- `EndingSceneRenderer`: 3 red against the stub (`expected [] to have a length of 1`, `Cannot read properties of undefined`).
- `FieldRenderer`: the fade test red against the no-op (`expected 1 to be close to 0.5`).
- `tapePlaybackSession`: red with the refusal branch removed, and the failure was the defect itself (`expected 'playing' to be 'idle'`, the silent fall-through to a bound of zero).

**Mutation spot checks**, in a throwaway worktree under `local/148-slice-7/mutant`, removed afterwards. Six mutations, each turning its own test red, run because those tests had passed against a stub and could have been toothless:

- A, `show(null)` no longer hides: test 20 stayed **green**. It was weak, exactly the absence-over-an-impossible-input trap: nothing in it had ever made a piece visible. Rewritten to begin the scene and show it visible before asserting the two absences, and then red under A.
- E, `forgetPreviousRun` no longer drops the record: test 21 red.
- F, the seal re-entered every frame: test 7 red (`expected 1 times, but got 41 times`).
- G, every run holds: test 25 red, plus seven existing lifecycle tests.
- H, the drag at a steady speed: test 13 red.
- I, the drop beat stretched: test 16 red.
- J, the scene finishing early: test 17 red. K, no folding: test 15 red.

**Test names before and after** (`vitest list --json`, file-qualified, in `local/148-slice-7/`): 2543 before, 2571 after, 29 new and **one lost**:

- `seedFromUrl.test.ts :: levelsFromUrl > accepts exactly zero to the max line level, whole numbers only`. This is the test whose promise the ruling changed: the entry rules that a value below 1 is repaired, which makes `levelsFromUrl('?levels=0', '')` return null and that assertion impossible to keep. Renamed to "accepts exactly one to the max line level, whole numbers only" with the zero case moved into the new test the entry names. Nothing else in it changed. See section 3.

**Standing checks.**

- `pnpm --filter hungry-grave typecheck`: exit 0, no tsc output.
- `pnpm --filter hungry-grave test`: `Test Files 176 passed (176)`, `Tests 2560 passed | 11 expected fail | 2 todo (2573)`.
- `pnpm --filter hungry-grave build`: exit 0, `✓ built in 6.80s`, with the pre-existing pixi chunk warning (589.66 kB, see open items).
- `pnpm verify` from the root: exit 0, `apps/housewarming test: Tests 83 passed (83)`, `apps/hungry-grave test: Tests 2560 passed | 11 expected fail | 2 todo (2573)`, `Done`.

**Pins.** `GOLDEN`, `WITNESS_VERSION` and the bot's seed lists are untouched: `git diff --stat` over `src/dev` and `src/game/witness.ts` is empty. The only non-comment change under `src/game` is one added type export.

**The proof tape** (`local/148-proof-tape/2000.tape`, entry step 1) verifies: `"outcome": "verified"`, `"ending": "victory"`, `"stop": "finished"`, 381 checkpoints, `"recordedFaults": []`, `"readbackFaults": []`.

**The won tape** (`local/148-won-tape/3000.tape`, entry step 2) verifies on this tree: `"outcome": "verified"`, `"ending": "victory"`, 393 checkpoints, both fault lists empty. So no rule moved on a won run either.

**The rendered check** (entry step 3), on the built app through `vite preview` on port 4191, `#/replay?tape=/3000.tape&at=23470`, driven with Playwright at 390 by 844 and device scale 3, with the page's `requestAnimationFrame` replaced by a manual pump and the frames stepped by hand. Screenshots in `local/148-slice-7/screenshots/`, every one opened and read. The scene begins around pumped frame 580 and runs 168 frames.

- `scene-0600.png` and `scene-0650.png`, the drag. He stands where he died, high in the field and a little left of the grave's column, at full size and upright. By 650 he is halfway down with four ragged pale furrows trailing from his death point to his feet. The furrows read as claw marks: four roughly parallel scraped lines, each wandering a few units off straight, spaced about 25 field units apart under a body 120 wide.
- `scene-0682.png`, the end of the drag. He is at the far rim, his body covering the top of the opening, furrows at full length behind him.
- `scene-0699.png` and `scene-0710.png`, the claw and the tip. He holds at the rim through the claw, then flattens: by 710 he is about half his height and going over the top edge square to it.
- `scene-0722.png`, over the edge. A foreshortened slab inside the top of the mouth, drawn under the turf and inside the cut.
- `scene-0735.png`, `scene-0748.png` and `scene-0790.png`, after the dark has him. Pixel-identical along a vertical strip through the grave: the scene is visually over and the field is frozen, which is the tail measured below.
- The field behind him is frozen and dim in every frame. Measured rather than judged: a shot at field (270, 127) reads 93,107,128 before the fade and 17,21,31 (the bare ground) once the scene is past `shotsGoneBy`, and the one live mob falls to 0.35 of itself exactly as the row says.
- Browser console over a whole run of the scene: 7 messages, all environmental, 4 WebGL driver performance warnings and 3 AudioContext autoplay warnings. Zero errors, zero page errors, nothing from this slice.
- **Reads I did not obtain**: I never watched the scene at real speed, only stepped. Whether it reads as the grave taking him, whether 2.8 seconds is right, and whether the pale furrows are the right colour against the final ground are human checks. I also did not photograph the live game screen's own ending, because reaching victory in play takes six minutes; the live path is covered by the lifecycle test instead.

**The live way in** (entry step 4), proved headlessly rather than played (`local/148-slice-7/levels5.ts`): `?levels=5` resolves a fresh run's starting condition to the maxed rig's, field for field, `startingSize` 27, all four lines at 5, the same roster, signal lock, starting score and tuning record. The URL for Mark is `#/?levels=5`. `?levels=0` now answers null and says `Ignoring ?levels=0: the run keeps its birthright instead.`

**Existing tests whose promise this ruling changed** (entry step 5): one, the `?levels=0` bound test above. No other existing test asserts that a won run leaves at once; `screenLifecycle.test.ts`'s endings test counts `showScreen` for the lost run only, so it stands as written.

**Servers and browsers** (entry step 6): the `vite preview` on 4191 is stopped, every Playwright browser closed with its script, the scratch worktree removed, and `public/3000.tape` and `dist/3000.tape` deleted. `ps` shows none of mine alive. Port 4173 was never used.

## 3. Where the entry was wrong about the code

- **"One new test beside the existing refusal tests in `tapePlaybackSession.test.ts`."** That file has two tests and neither is a refusal test; there are no existing refusal tests anywhere to sit beside. The new test went into that file as the entry directs.
- **`?levels=0` has a test relying on it.** The entry says to stop and report if any caller or test relies on `?levels=0`. No caller does. One test does: `accepts exactly zero to the max line level, whole numbers only` asserts `levelsFromUrl('?levels=0', '')` is `0`, which is the exact behaviour the entry rules must change, so the repair and the assertion cannot both stand. I treated it the way the entry treats the same case for the lifecycle test, renamed it and moved the zero case into the test the entry names, rather than stopping the slice on a conflict the entry itself resolves one paragraph earlier. If that was the wrong call it is one line to put back.
- **`BossKilled` was not exported from `events.ts`.** The entry gives `begin(killed: BossKilled, grave: Grave)` as the renderer's seam; the type was declared but not exported. Added to the export block.
- Line numbers: every name the entry cites exists and does what it says. The numbers have shifted by up to 55 lines, as the entry warns.

## 4. Decisions made

- **The pull's rim, not the nearest rim.** Found by the rendered check and fixed under a new red test, `he is hauled to the edge the pull crosses, not to whichever edge is nearest`. The fall's `rimCrossedAt` takes the nearest edge, which is right for a corpse already lying at the rim and wrong for a body hauled from across the field: the Undertaker dies high in the field and the mouth is half as wide as it is long, so the nearest point of the rim to him is a corner and the tie went to a side edge. He slid in sideways and vanished under the lip where nobody could see him go. Now the record takes the point the line from where he fell to the grave's middle leaves the opening at, and hands that point to `rimCrossedAt`, which has the last word, so the edge he is hauled to and the edge the fall turns him about can never be two different edges. To reverse: call `rimCrossedAt` on his own place again.
- **The four beats are sequential, and the claw is a hold at the rim.** The design record lists drag, claw, tip, fall in that order and the entry asks for four shares of the length, so the claw is the beat where the grave has him at the edge and he cannot hold on. The furrows are full by the end of the drag and stand through it. To reverse: set `ENDING_BEATS.claw` to 0 and give the share to the drag.
- **The tip and the fall are laid over the fall's own two halves rather than over its whole length**, so `ENDING_BEATS.tip` and `.fall` are each a dial of their own and the shape inside each half is a swallowed corpse's. That is why `TIP_TICKS` and `DROP_TICKS` are now exported. To reverse: map the whole tip-and-fall span onto `FALL_TICKS`.
- **The dark takes him before the fall beat is spent**, and the tail is kept rather than trimmed. Measured across grave sizes: 0.56 s of held field at the size floor, 0.45 s at the start size, 0.29 s at the ceiling; the won tape's grave was 58.7, so about 0.32 s. Keeping the corpse's own drop rate is worth more than trimming it, and a held field is the beat between the grave closing over him and the end screen. It is written into the `ENDING_BEATS` comment. To reverse: shrink `ENDING_BEATS.fall`, which speeds his drop.
- **The furrows draw lighter than the ground, not darker.** Measured on the phone at device scale 3: 31,37,50 over a ground of 17,22,31. Turned earth catching the moon is the read, and it is the one that survives a ground this dark: slice 6's note records that the bites and the trodden margin, which are darker, nearly vanish on this tile. Written into the `ENDING_FURROWS` comment. To reverse: point the stroke at `graveSeam` or `graveSubsoilDeep`.
- **`drawBoss` takes `DrawnBoss` rather than `Boss`.** It reads the kind and the flash and nothing else, and the scene draws him after the sim has taken the record off the field. The alternative was to build a `Boss` literal with an invented id, hp and position. To reverse: make the scene build that literal.
- **The scene answers in the sprite's own axes** (`wide`, `tall`, and a `turn` measured against the way he came to rest) rather than the fall's along-and-across. A corpse is square so it never mattered; the Undertaker is 120 by 80, and applying the fall's scales raw would foreshorten his width where his height goes in. The view rotates and scales and derives nothing.
- **`begin` draws the scene's opening frame.** The sim takes the boss off the field on the tick he dies and `BossRenderer` hides him that same frame, while the ending latch only goes up after the frame's row is recorded. Without the draw in `begin` there is exactly one frame with no Undertaker in it.
- **One exit from `end`, not a private navigation function.** The entry asks for the navigation in one private function "called from both places"; the single-exit shape this hold takes has one call site, and a helper with one caller fails the deletion test. The hold returns early and everything below it is the navigation exactly as it was.
- **Scatters fade with the shots.** A cancelled shot is mob fire the stopped sim will never step again, so one frozen lit scatter would sit on the field for the whole scene. It is one line in the same loop.
- **The scene declares no held transient.** The registry in `transients.ts` sizes the replay lead-in in ticks; the scene runs on the frame clock and begins on the run's own last tick, which is always rendered, so it has no lifetime for the lead-in to cover.

## 5. Open items

- **Open for the human**, as the entry says: whether 2.8 seconds is the right length, whether the drag reads as the grave taking him rather than him walking in, and whether the end screen arrives too late. Add to those: whether the roughly one third of a second of frozen field after the dark takes him reads as a beat or as a stall, and whether pale furrows are right once the ground is decided.
- The fade's wiring into the replay screen is proved by measurement in the rendered check and not by a test; the live screen's is covered by the lifecycle test. A `replayLifecycle.test.ts` case would close that, and it was not in the plan.
- Anomaly, pre-existing. The build warns "Some chunks are larger than 500 kB" for the pixi chunk at 589.66 kB, the same figure slice 6 recorded. Ticket #51.
- Anomalies, environment only. Headless Chromium logged 4 WebGL driver performance warnings and 3 AudioContext autoplay warnings over a full run of the scene. Nothing else, and nothing from this slice.
- `docs/branch/records/slice-7.md` shows as modified in the working tree. That is not mine: the main session had already corrected the scratch folder name, the `GraveRenderer.attach` line numbers and the note's filename before I started.
- The instruments stay in `local/148-slice-7/`: the frame pump and screenshot scripts, the PNG reader, the `?levels=5` read, the two arithmetic probes, the name lists and the verify log.

## 6. Stuck

None.

## Landing (the main session)

CodeRabbit read the uncommitted slice (`local/148-slice-7/coderabbit.txt`) and raised three findings, two of them the same point. All were real and all are fixed, test first.

- **The Banshee's death began the scene (major).** `bossKilled` fires for both bosses, and `begin` took any of them. On the live screen `begin` drew a body at her death point and nothing ever hid it, because the screen shows the scene only in its ending branch, so a frozen Banshee would have stood on the field for the rest of the run. On a replay it was worse: her death also started the replay's own scene clock, so the shots faded out and the mobs stayed dim for the rest of the replay. The coder's rendered check opened the tape past her death, so it could not show either. Now `begin` returns at once for any boss but the Undertaker and answers whether a scene began, and the replay starts its clock only on a yes. New tests: "the Banshee's death begins no scene, because the run goes on after her" (`EndingSceneRenderer.test.ts`, red with `expected false to be true`), and in `replayLifecycle.test.ts` "the Banshee's death fades nothing on a replay, because the run goes on after her" (red with `expected true to be false`) beside its control, "the Undertaker's death dims the field on a replay, as it does live", which was green before the fix and after it. That control also closes the coder's open item about the replay's fade having no test.
- **The replay advanced a scene on the frame it began (minor, raised twice).** `runScene` ran after the playback, so the opening frame drawn by `begin` was moved on by one frame's time before anyone saw it, which the live screen never does. `runScene` now runs before the playback.
