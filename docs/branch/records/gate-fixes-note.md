# Gate fixes note: the close-of-step review gates on #148

## What changed

**`apps/hungry-grave/src/tape/startingCondition.ts`.** `tuningIn` now states all four groups of the record row by row and binds the literal to a `TuningRecord` before `resolveTuning` takes it, so the six `swallow.*` and `growth.*` rows a tape's header carries reach the run instead of being replaced by the build's defaults. Its JSDoc now says why the annotation is load-bearing: the resolver's parameter is `TuningOverlay`, where every group is optional.

**`apps/hungry-grave/src/tape/__tests__/startingCondition.test.ts`.** New `movedValue` helper and a new test, `resolves every tuning row to the value the block states, one by one`, which walks `tuningRows(DEFAULT_TUNING)`, moves each row to a legal non-default value, resolves the block and expects the moved value back.

**`apps/hungry-grave/src/app/screens/game/EndingSceneRenderer.ts`.** The furrows stroke in `PALETTE.graveSeam` rather than `PALETTE.graveSoilShadow`, with a comment beside the stroke stating why a lighter row cannot be used here.

**`apps/hungry-grave/src/app/screens/game/__tests__/EndingSceneRenderer.test.ts`.** New `furrowColour` helper and a new test, `scrapes the furrows in an earth darker than the ground they are cut into`, which reads the stroke off the drawing and also asserts the row sits below `groundNight` on luma.

**`apps/hungry-grave/src/app/screens/game/graveDrawingValues.ts`.** `ENDING_FURROWS`'s JSDoc no longer claims the furrows draw lighter than the ground; it now states that the alpha and the colour row were chosen together. `HOLE_REBUILD_STEP`'s JSDoc no longer describes a per-swallow cadence; it names the swell as what sets the cadence and `growth.swellPerSecond` as the row that moves it.

**`apps/hungry-grave/src/app/__tests__/palette.test.ts`.** New `FADE_POINTS`, `staleCorpse`, `brightestAt`, `CHANNEL_TOP`, `tinted` and the pinned table `CORPSE_DOWN_THE_FADE`, read by a new test, `records what a corpse reads over the ground all the way down its fade`. It sits beside `records what every sprite reads over the ground it is drawn on`, in the same idiom, and pins the best-of-pair APCA figure over `groundNight` at freshness 1, 0.75, 0.5, 0.25 and the floor. No colour moved and no exception was added.

**`apps/hungry-grave/src/app/screens/game/layering.ts`.** The `graveRim` entry of `LAYER_ORDER` carries its citation: #155, Territory's countdown.

**`apps/hungry-grave/src/app/palette.ts`.** The `graveRim` row carries the same citation and says what it is priced for.

**`apps/hungry-grave/src/game/invariants.ts`.** `OWED_TOLERANCE`'s JSDoc names both sites that move growth between the size and the debt rather than only `growGrave`, and drops the claim about `checkSize` that I could not support.

## Verification results

**Job 1, red first.** The gate's probe reproduced exactly: a block written with `tipThreshold` 0.8, `pullStrength` 0, `feastInCorpses` 90 and `swellPerSecond` 9 resolved to `implemented` with 0.55, 125, 45 and 4.5. The new walk test was red on its own assertion before the fix: `expected { name: 'swallow.tipThreshold', value: 0.275 } to deeply equal { ... value: 0.55 }`. A separate probe (`local/148-gate-fixes/which-rows-fail.ts`) collected every row rather than stopping at the first, and confirmed the gate's prediction exactly: six failing (`swallow.tipThreshold` 0.275 read 0.55, `swallow.pullReach` 12 read 24, `swallow.pullStrength` 62.5 read 125, `swallow.pullResponse` 2.3 read 4.6, `growth.feastInCorpses` 22.5 read 45, `growth.swellPerSecond` 2.25 read 4.5), ten passing. Green after the fix.

**Job 1, the compile-time claim proved.** `local/148-gate-fixes/totalityCheck.ts` holds both shapes side by side. The old one, the literal handed straight to `resolveTuning` with two groups missing, compiles with no error. The new one, the same literal bound to `TuningRecord` with `growth` missing, fails: `error TS2741: Property 'growth' is missing in type ... but required in type 'TuningRecord'`. The JSDoc's sentence is now true and was false before.

**Job 1, pins.** None moved. `WITNESS_VERSION`, `FORMAT_VERSION` and `GOLDEN` in `src/dev/digest.ts`, the bot's seed lists and the hand's pin lists are untouched (`git status` lists no file under `src/dev`). The fresh won tape still verifies with the command in its README: `outcome: verified`, `readingsVersion 9`, `recordedFaults []`, `readbackFaults []`.

**Job 2, measured before and after.** Measured with the repo's own `apcaLc` and `luma` on the stroke's colour composited at `ENDING_FURROWS.alpha` 0.75 over `groundNight` (`local/148-gate-fixes/furrowProbe.ts`). Ground: rgb 69,79,93, luma 30.54. Before, `graveSoilShadow`: drawn rgb 44,51,65, luma 19.81, APCA Lc 7.99, which matches the gate's figures. After, `graveSeam`: drawn rgb 21,26,32, luma 9.95, Lc 13.61. The two rejected ground rows both measure Lc 0.00 at this alpha, below APCA's own LO_CLIP: `groundCrack` drawn rgb 47,57,69 luma 21.86, `groundDamp` drawn rgb 50,60,74 luma 23.09. `graveSubsoilDeep` measures Lc 13.29, drawn rgb 23,28,35, luma 10.76.

**Job 2, red first.** Nothing pinned the furrow's colour row, so the new test is the pin. It was red on its own assertion: `expected 2304568 to be 329740`, which is `0x232a38` against `0x05080c`.

**Job 2, photographed.** Built app, `vite preview` on port 4199, the fresh won tape at `dist/3000.tape`, replayed at 390 by 844 and device scale 3 with slice 9's frame-pump instrument copied into `local/148-gate-fixes/shots.mjs`. Four frames under `local/148-gate-fixes/screenshots/`, each opened and read:

- `beat-0270.png`, the drag. He is about half way from where he fell to the rim. Four dark wavy lines trail from behind him back up the field, plainly separate from the earth and from each other, with the wander giving each one its own path. They read at a glance.
- `beat-0312.png`, the end of the drag. He is at the rim with the grave's mouth under him. The four furrows now run the whole distance, about a third of the field's height, and stay legible over the mottle, the Territory wedges and the grass tufts they cross.
- `beat-0338.png`, the tip. He is folding over the edge and is half gone. The four furrows are at full reach and unchanged, which is what R6 asks for: they stay where they were scraped.
- `beat-0430.png`, after the fall. He is gone and the furrows are the only thing the scene left. Four separate dark gouges stand alone on the earth, the clearest of the four frames.

The ten earlier survey frames (`scene-*.png`) are kept in the same folder; they are how the scene's frame window was found and are not comparisons.

**Job 3, the gate's numbers verified.** With the repo's own `apcaLc`, `freshnessBrightness` and `greyTint` (`local/148-gate-fixes/corpseFadeProbe.ts`), the corpse body's signed Lc over `groundNight`: fresh -35.21 (the pinned figure exactly, and -47.04 over the old tile, also exact), 0.75 -20.27, 0.65 -14.62, 0.55 -9.66, 0.50 0.00, 0.25 0.00, floor +10.87. So all three of the game design gate's claims hold: the body drops under Lc 15 just below freshness 0.65, at the batch's mean swallowed freshness it reads about 9.7, and at the floor it reads louder as a dark shape (10.87) than a half-fresh corpse does (0.00). The rich tier runs one point higher down to 0.5 and joins the trash tier below it.

**Job 3, proved by mutation.** The table pins data already true, so it is green on delivery. In a scratch copy of the app (`local/148-gate-fixes/repo/apps/mutant`, since deleted) I moved `PALETTE.corpse` from `0xa29e92` to `0xa29e95`, three steps in one channel, and ran that one test against the copy: it failed, `trash` reading `fresh 35.32, 0.75 20.33, ...` against the pinned `fresh 35.21, 0.75 20.27, ...`. The working tree was never mutated.

**Job 4.** Four of the five items done, all comments or citations. The fifth is listed under open items.

**Test names compared.** 2611 before, 2614 after. Three added, none lost or renamed: the three new tests above. Before and after lists are `local/148-gate-fixes/names-before.txt` and `names-after.txt`.

**Checks.** `pnpm --filter hungry-grave typecheck` clean. `pnpm --filter hungry-grave build` built with no error and only the standing "Some chunks are larger than 500 kB" advisory for the pixi chunk at 589.66 kB, the same figure slices 6, 7 and 8 recorded against ticket #51. `pnpm verify` from the worktree root exits 0, its four phases all clean, closing on:

```text
apps/housewarming test:  Test Files  7 passed (7)
apps/housewarming test:       Tests  83 passed (83)
apps/hungry-grave test:  Test Files  177 passed (177)
apps/hungry-grave test:       Tests  2603 passed | 11 expected fail | 2 todo (2616)
```

The note itself was written after that run, so `prettier --check` was asked of it on its own: "All matched files use Prettier code style".

**Servers and browsers.** The `vite preview` on 4199 and every Chrome it drove are stopped, checked with `ps` (`vite preview` 0, `chrome` 0) and by the port refusing a connection. `dist/3000.tape`, which the replay was served from, is removed.

## Where the gates were wrong about the code

**The tech gate's finding 7 item on `OWED_TOLERANCE` is half wrong, and the half that is wrong is the dangerous half.** The gate calls the JSDoc stale because 35 million probed operations never produced the ulp overshoot it describes. I could not refute that inside the reachable state space: 30 million random trials with the size held at or above `SIZE_FLOOR` (18) produced no overshoot either, from `growGrave` or from `takeInOwedGrowth`. But my first sweep, which let the size run down to 1.5, produced the overshoot in seconds and at exactly one ulp at the ceiling (1.42e-14), from both writers. So the mechanism is real arithmetic and what keeps it away is the floor, not the shape of the code. A future cleanup reading "35 million probes never produced it" as "it cannot happen" and deleting the tolerance would be removing a guard whose only protection is a bound someone could move. I rewrote the JSDoc to describe the arithmetic rather than to claim or deny a demonstrated overshoot, and I did not touch the tolerance.

**The same item's explanation of why `checkSize` has no tolerance does not survive reading the code.** `takeInOwedGrowth` writes `grave.size` as `trueSize - grave.owed`, a subtraction and not a clamp, so "the size alone is written whole" is false. I wrote that sentence into the JSDoc first, checked it, and took it out. The honest position is that `checkSize` is untoleranced and `checkOwedGrowth` is toleranced, and nothing in the code explains the asymmetry.

**The tech gate's finding 1 is right in every particular**, including the count of failing rows, which rows they are, and that no pin moves.

**The two other gates' figures on the furrows and on the corpse fade are right**, and reproduce to within 0.05 Lc under the repo's own arithmetic.

## Decisions made

**`graveSeam` for the furrows, at the alpha they already had.** Evidence: of the four rows the dispatch named, it measures the best at Lc 13.61, and both ground-family rows measure Lc 0.00 at this alpha, so they are not candidates at all, and `graveSubsoilDeep` is 0.32 Lc behind. The prototype's precedent for a dark line in this earth is `groundCrack`, but it paints with it at alpha 0.45 on a hairline 0.3 to 0.8 units wide, where the mark is texture rather than something to notice; a 3-unit stroke in that row at this alpha is invisible against the base earth by the repo's own measure. `graveSeam` is an earth row by its own declaration, "the seam of darker earth along each layer boundary". To reverse: one line in `scrapeFurrows`. There is headroom left if the marks still read thin in play: at alpha 1.0 `graveSeam` reaches Lc 15.21 and a luma separation of 27.5, against 20.6 now, and `ENDING_FURROWS.alpha` is already a data row.

**The corpse table records the best of the pair, not the body alone.** That is the idiom of the table beside it and what the dispatch asked for. It has a cost worth knowing: below the crossing the outline carries the figure, so the last three numbers barely move and a corpse body colour moving there would not move them. The first two do move, so the record's stated promise holds. The body's own signed figures are in this note's Job 3 paragraph, which is where the gate's finding lives. To reverse: the table is one constant.

**The `PALETTE.graveRim` row was cited rather than deleted.** The gate says it "returns with #155 or goes". It is not a dead row with no reader: `SPRITE_OUTLINE.graveRim` names it and `palette.test.ts` prices six separation exceptions against it. Deleting it would take Territory's rim colour out and change the instrument, which is a design call and not a comment. To reverse: delete the row, its `SPRITE_OUTLINE` entry, its six exceptions and its `SPRITE_OVER_THE_GROUND` line together.

## Open items

- **The fifth small item, `RESERVOIR_IN_CORPSES`, is left as it is.** It is a test-only export, not a comment, a citation or a dead row, and the tech gate itself calls it acceptable and says it is listed only so it is not rediscovered. Changing it would mean rewriting `tuning.test.ts`'s assertion, which changes what the test can see.
- **Whether the furrows read at real speed is still only Mark's to judge.** They have been photographed frame by frame and measured, never watched at 2.8 seconds. This is the same open item R6 already carries.
- **The design record's R6 needs one sentence**, which I did not write into the document. Suggested, for the slice 7 paragraph at line 122, replacing the clause about drawing lighter: "Checked after slice 8 put the prototype's earth under them: a lighter furrow measured APCA Lc 7.99 over `groundNight` and read as nothing, so the four furrows now draw in `graveSeam`, the grave's own seam earth, at Lc 13.61, which is the gouge read rather than the moonlit one." The open question at line 209, "are pale furrows right now that the ground is brighter", is answered by that and can go.
- **The scratch folder `local/148-gate-fixes/` holds the probes, the two name lists, the frame-pump script, the survey frames and the four read frames.** It is gitignored and is the evidence behind every figure above.

## Stuck

none
