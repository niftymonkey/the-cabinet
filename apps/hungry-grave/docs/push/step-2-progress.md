# Step 2 progress: the stage floor

Written for the agents taking slices 0 to 16. The plan is `docs/design/step-2-stage-floor-dispatch.md`; everything below is what it does not say or what has moved since it was written.

## 0. Planning read

The plan was written while step 1 was mid-build and its own opening section asked for this read once step 1 landed. Every `file:line` in the plan was located by content against the tree at step 1's tip and corrected in place. About 320 citations were checked, 131 occurrences across 104 distinct citations were wrong and are now right, and nothing was left pointing at a site that could not be found.

**Citations corrected.** Grouped by file, because within a file every citation moved for one cause.

- `stage.ts`, 39 occurrences. Step 1 put `carries` on `StageRow` with its doc comment and added the carrier paragraph to `RAMP_ROWS`'s header, which pushes the whole file down: 1 line before `StageRow`, 6 more after it, 14 by the time the tables end. `PhaseName` 11 to 12; `StageRow` 13-23 to 14-29; the drain-out sentence 24-27 to 31-34; the measured drain-out 48-50 to 54-56 (two sites); `DRAIN_OUT_SECONDS` 62 to 68 (three sites) with its readers 176, 239 to 190, 255; the `BACK_HALF_ROWS` comment reader 70 to 76; `RAMP_ROWS` 81-105 to 95-117 and its heading 81 to 95, readers 152, 240 to 166, 256; the Wall's comment 107-112 to 119-126 and its row 114 to 128; `BACK_HALF_ROWS` 113-133 to 127-147 and its heading 113 to 127, readers 154, 241 to 168, 257; `Phase` 135-138 to 149-152 with its `PhaseName` readers 136, 244 to 150, 260; the boss stub's comment 145-150 to 160-163; `PHASES` 151-157 to 165-171, heading 151 to 165, readers 213,225,226,229,242 to 228,242,243,258; the banshee entry 153 to 167 and the undertaker entry 155 to 169; `phaseLengthTicks` 173-177 to 187-191 and 173 to 187 (two sites) with readers 229, 237 to 245, 253; the victory stub's comment 201-206 to 218-222 (two sites), the stub itself 214-216 to 230-232 (two sites) and `state.ending` 215 to 231; `enterNextPhase` 206-217 and 207-217 to 223-233; `advanceStage` 224-233 to 240-249 and its loop 225 to 242; the value import of `mobs.ts` 6 to 7, which was pointing at the type-only import beside it.
- `mobs.ts`, 3. `spawnMob` gained its `carries` argument and `Mob` gained the field, so everything below moved by 7. `spawnMob` 237-241 to 244-249, `cullMobs` 408 to 422, `fall` 288-298 to 297-307.
- `corpses.ts`, 10. `asSwallowable` gained the body id in slice 8, which moved everything after it by 1. `oldestEvictable` 144 to 145 (two sites) and 144-151 to 145-152; `claimSlot`'s rationale 153-159 to 154-160 and the function 160-177 to 161-178; its `oldestEvictable` reader 166 to 167 and its `corpseEvicted` emit 168-173 to 169-174 with the reader 169 to 170; `spawnFeast`'s comment 211-215 to 212-216, the function 216-237 to 217-238, and `decays: false` 233 to 234.
- `events.ts`, 6. Slices 7 and 8 added `CarrierLost` and the four offer payloads. `MobFired` 125-130 to 144-149 and its `emitter` 127 to 146; `CorpseEvicted` 146 to 165 and 146-151 to 165-170 with readers 147,278 to 166,347; the `PatchClosed` precedent 180-196 to 199-215; the phase-change comment 241 to 309 and the `PhaseName` reader 244 to 312.
- `caps.ts`, 7. Step 1's gate fix moved `TERRITORY_CAP` out to `lines/territory.ts`, which shortened the header and lengthened the file's own comment. `MOB_CAP` 22 to 29 (two sites) with its derivation comment 10-20 to 17-28; `CORPSE_CAP` 24 to 31 (two sites) and its export 123 to 110; the no-removal rule 64-67 to 62-65.
- `step.ts`, 7. Slice 8 added `chooseOfferBody` and `loseOffer` to the tick and lengthened the order comment. `hitGrave`'s caller 53 to 54 (four sites), the belch-before-every-overlap rule 150-153 to 195-198 (two sites, and the old range was the storm's advance rather than the rule), and `cullMobs`'s caller 175 to 220.
- `run.ts`, 6. `RunState` gained `roster`, `offer` and `bankedOffers`, and `createRun` gained the roster parameter. `RunState` 59-102 to 60-114; `uniformLevels` 154 and 170 to 177 (three sites, and the plan cited two different stale numbers for the same seam); `createRun`'s third parameter 190 to 218 and its signature 211-215 to 215-219.
- `witness.ts`, 2. Slice 8 added `foldOffer`. `foldStage` 267-270 to 266-269, the `WITNESS_VERSION` export 318 to 337.
- `faults.ts`, 3. Step 1 appended three identities. `FAULT_IDENTITIES` 18-31 to 18-34 (two sites), the `FaultIdentity` reader 34 to 37.
- `invariants.ts`, 1. The `CORPSE_CAP` readers 8,401 to 7,394.
- `bell.ts`, 3. Slice 6 replaced the ring with cones and renamed the function. 154 to 256, with the name (see the sentence list below).
- `territory.ts`, 3. `TERRITORY_CAP` arrived from `caps.ts` above `eligiblePoints`. 334 to 351.
- `belch.ts`, 1. Slice 5 split the gas from the burst. The full-reservoir gate 57 to 82; the old line was inside `burstNearbyMobs`.
- `layering.ts` and `layering.test.ts`, 6. Slice 9 added the bank line's width assertion. `LAYER_ORDER` 16-29 to 16-30; `ADR_0014_STACK` 73-86 to 75-88 (four sites); the container-count assertion 141 to 143 (two sites).
- `digest.ts`, 1. Slices 2 to 8 re-pinned `GOLDEN` four times and the comment above it grew each time. 276 to 297.
- `playback.ts` 265 to 266, `tapeHeader.ts` 7,82 to 6,81, `sound.test.ts` 37 to 38: each one line, from the offer's own fields and events.
- Test files under the `RAMP_ROWS` and `CORPSE_CAP` reader lists, 11. `bot.test.ts` moved furthest, because slice 8 added `REACHES_VICTORY_MAXED`, `maxedRun` and `AUTHORED_CARRIERS`: `phaseLengthTicks` 27,124,125 to 29,202,203; `RAMP_ROWS` 28,128,420 to 30,206,212,562; `BACK_HALF_ROWS` 25,128,134 to 27,206,212,218; `PHASES` 124,125,140-143 to 28,202,203; `PhaseName` 140-143 to 224-227 plus the literals at 301,303,466,470,471; the both-endings assertion 358-366 to 488-509. Then `corpses.test.ts` 29,46 to 30,47 and 9,341,352,359 to 9,363,374,381; `belch.test.ts` 13,18 to 15,25; `bell.test.ts` 15,30 to 18,37; `step.test.ts` 18,194 to 17,191; `skullStream.test.ts` 18,34 to 18,36; `wisps.test.ts` 14,29 to 14,31; `StormRenderer.test.ts` 13,26 to 17,30; `FieldRenderer.test.ts` 333 to 348.
- Records, 3. `pre-authorizations.md` 22 to 20 (item 14, the image tool); `handoff.md` 33 to 37 (the mp3 loop gaps and the LAME headers), which the note itself warns has been rewritten several times; `WebAudioInstance.mjs` 168-174 to 172-175 in `@pixi/sound` 6.0.1's installed source, where the `loopStart` and `loopEnd` assignment actually sits.
- `readings.ts`, 2, and these were wrong before step 1 rather than because of it. `readings.ts:50-66` was cited for "declares twelve readings" and is the import block; `TuningReadings` is 72-85. The file has moved by one line since the plan was written, so both citations were wrong when they were written.

**Sites not found.** None. Two citations needed more than a line move to resolve and both are recorded above and below:

- `src/game/__tests__/drops.test.ts:21,25`, in the `RAMP_ROWS` reader list. The file is gone, which the plan's own caveat 8 predicted. Searched for `drops.test.ts` and for the `run.stage.firedRows = RAMP_ROWS.length` idiom across `src`; the file that inherited it is `src/game/__tests__/offer.test.ts:28,40`, and the entry now names that.
- `bell.ts:154` (`sweepRing`). Searched for `sweepRing` across `src` (no hits) and then for every walk over `state.mobs` in `bell.ts`; slice 6 renamed the function `sweepToll` and it is at `bell.ts:256`.

**Plan sentences changed because the cited thing changed.**

- Old: "`bell.ts:154` (`sweepRing`)". New: "`bell.ts:256` (`sweepToll`)". Three sites, in section 4, section 5's module table and section 7. Slice 6 renamed the function, and a coder grepping for `sweepRing` finds nothing.
- Old: "its one row is `{ t: 2, template: 'wall', count: 22, type: 'shambler' }` at `stage.ts:114`". New: the same row with `carries: false` at `stage.ts:128`. Step 1 put the column on every row, so the quoted literal no longer compiles as written.
- Old: "**`WITNESS_VERSION` (`witness.ts:38`, 4 today, 5 after step 1): moves once**". New: "5 today, where step 1 left it: moves once to 6". The tree reads 5, so "4 today" is now false and "one past whatever step 1 left" is now a number.
- The opening section, "What this plan may claim, and what it cannot", in full. It said the numbers were read mid-build and would need re-checking; they have been re-checked, so the paragraph now says so and points here, and each of caveats 1 to 8 is restated as the tree reads rather than as a prediction. Caveat 9 was already true and is untouched.
- Old: "Everything else cited below was read directly and is in files step 1 does not touch (`stage/templates.ts`, `caps.ts`, `tuning.ts`, ...)". New: a list of what moved outside the nine named files. `caps.ts` was on the untouched list and step 1's gate fix moved it; `bell.ts`, `territory.ts`, `belch.ts` and `bot.test.ts` moved too. `templates.ts`, `tuning.ts`, `field.ts`, `clock.ts`, `grave.ts`, `mobFire.ts`, `palette.ts`, `layering.ts`, `sound.ts`, `audio.ts`, `engine.ts` and `stage.test.ts` did not.
- Old: "Registers the new reading in the three places the graph is declared (`readings.ts:50-66`, `:76-95`, `:97-110`)". New: five places, `TuningReadings` (72-85), `ReadingsAcc` (87-100), `createReadings` (109-125), `observeReadings` (135-154) and `readingsOf` (156-169). A new reading needs an entry in all five and the plan named three, none of which were the right ranges.
- Old: "**fifteen test files that import it only to silence spawns**" followed by a list of twelve. New: twelve, listed, with the sentence saying that fifteen test files import `RAMP_ROWS` in all, which is the count verification step 5 names. `carriers.test.ts` is a reader too and reads the rows as well as silencing them, so it is named on the main readers line rather than inside the twelve.
- Old: `PHASES` readers include `bot.test.ts:140-143`. New: they do not. That helper is `phaseOrder` and it reads `phaseChanged.phase`, never `PHASES`, so it is listed under `PhaseName` instead.
- Old: "`soulStream` survives only at `src/game/__tests__/witness.test.ts`". New: it survives in three test files that pin the old name on purpose (`witness.test.ts:852`, `startingLevels.test.ts:98,102,109`, `roster.test.ts:70`).

**Tests and assumptions that had no slice, and where they were placed.** Section 10 assigned every test from 1 to 131. The four the step 1 implementation gate added, 132 to 135, had none.

- **132** (a row carries or does not, and `carriers.ts` alone says which placement holds the offer) goes to **slice 4**, the carrier schedule on the new rows, beside module test 120 which is the same table's other carrier rule.
- **133** (a banked offer opens on the first permitting tick and stays banked through a phase that does not) goes to **slice 2**, because the plan's own gate block says the site and the column land "in the slice that lands the phase columns" and that is slice 2. Slice 2's text now says so.
- **134** (an offer whose three bodies are all refused at the corpse cap is banked, not lost) and **135** (a carrier the mob cap refuses is announced as `carrierLost` with the cap as its reason) go to **slice 5**, because the same gate block says both become reachable the moment slice 5's corpse cap refuses and that "slice 5 therefore lands" them.
- One seam was missing under those tests and is added: **section 4's `Phase` block did not carry `bankOpens`**, which the gate block rules and which test 133 is written against. `readonly bankOpens: boolean` is now on the interface with the reason beside it. A coder implementing section 4 as written would have had no column for the test to read.
- Slice 5's sentence also now names the `corpseEvicted` and `oldestEvictable` retirement and the two supply refusals outright. Section 9 item 6 is the assumption that retiring the event is safe, and the slice carried it only as "never evicting", which does not name `events.ts` at all.

Every other section 9 item is carried by a slice: 1 by slice 2's glossary commit, 2 by slice 3, 3 by slice 10, 4 by slice 2's ceiling rows, 5 by slice 2 declaring `PhaseMusic` and 12a filling it, 7 by slice 6, 8 by slice 12a, 9 by slice 2's test 6, 11 by slices 6 and 14, 12 by slice 6. Item 10 is a decline with a trigger and needs no slice.

**Consistency after the gate fixes.** The plan was checked against the eight tech-gate findings the handoff lists and no earlier passage contradicts them: no passage calls a ceiling an invariant, no seam parses an encoder header, `setPiece.ts` declares no magnitude anywhere it is described, `WITNESS_VERSION` moves once, slices 12 and 13 are split, `pngjs` is in the module table and in slice 13a. The slice count holds (nineteen slices, eighteen commits) and so does the test count (67 spec, 61 module, 7 fence, 135 in all), re-derived from the numbered lists rather than trusted. The pour-rows-in-`rows.ts` contradiction at the old line 591 was already fixed by step 1's tip review and no other passage carries it.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| 1 | `6958cfdd28` | refactor(hungry-grave): the stage tables move into rows.ts unchanged (#97) |
| 2 | `1e420aeb53` | feat(hungry-grave): the stage is three named sections with one property each (#97) |

Slice 0 records the baseline tapes and makes no commit.

## 2. GOLDEN moves

Slice 1: none, which the slice required. `src/dev/digest.ts` is not in the commit and the digest test is green.

Slice 2: two fields, `mobs` 6 to 5 and `checksum` -1111652845 to -141809765, and nothing else. The scenario's 600 ticks fall inside the Procession, which owns emptiness, so its second row moved from t=8 to t=11 and one authored body that used to be on the field at tick 600 has not arrived yet. Every other field held: the grave's position and size, the reservoir, the score, the two scripted kills, and all five stream cursors. The re-pin's reason is written above `GOLDEN` in `src/dev/digest.ts`.

## 3. CodeRabbit

Slice 1: `coderabbit review --agent --uncommitted` on the staged work, all eighteen files reviewed, **zero findings**. Nothing applied and nothing declined.

Slice 2: two runs over the thirteen staged files. The first found one Minor and it was real: `expect(STILL_PLAY.state.ending).not.toBe('sealed')` in `stage.test.ts` could never fail, because the rig clears a sealed ending every tick to keep the stage's clock running. **Applied**: the assertion is now that the still hand held more than the ceiling for over a second of ticks and that the run crossed to the `over` phase, which is what the rig's throw-on-fault actually proves. The second run, on the fixed tree, reported zero findings. Nothing declined.

## 4. Plan claims found false against the tree

Four, all from slice 1, and each one is a slice assignment rather than a citation. The plan's intent was followed and its letter was not.

1. **Slice 1 says "the three tables move out of `stage.ts` under their old content and new names", and the tree carries two tables.** `RAMP_ROWS` and `BACK_HALF_ROWS` are all there is, and section 7 says `BACK_HALF_ROWS` is "replaced by `CROWD_ROWS` and `VIGIL_ROWS`", which is a split and therefore authoring. Slice 2 owns the authoring, so the Procession took the ramp's rows and the Crowd took the back half's, both byte-identical, and `VIGIL_ROWS` landed as an empty table with its reason on it. `PHASES` still names two spawning phases, so behaviour is unchanged.
2. **Slice 1 says module test 71 lands here, and `directed` does not exist until slice 2.** Slice 2's own sentence names `StageRow.directed` and `Phase.directed` among the columns it lands. A test cannot be green against a column that is not there, so 71 is pinned in `rows.test.ts` as a named `test.todo`, which is the playbook's own mechanism for a planned test whose seam arrives later. **Slice 2 fills it**, beside module test 119, which is its sibling over the ceiling columns.
3. **Test 67 names the pour among `peakArrivals`'s terms, and the pour's rows land at slice 5.** Slice 5 says so outright: the set piece's own rows and `POUR_SHARES` go into `rows.ts` there, "because this is the slice where `peakArrivals` first needs them". The query therefore landed with three of its four terms, and test 67 holds those three. **Slice 5 adds the pour term and widens the test with it.**
4. **Fence 111 is an existing test, not new code.** Section 6 lists `src/__tests__/boundary.test.ts` under "existing, must stay green", so slice 1 confirmed it rather than writing it. `rows.ts` value-imports nothing from `src/game` (`MobType` and `TemplateName` are both `import type`), so the cycle guard's known-cycle list is still empty.

Three more from slice 2, and each one is a seam the plan left short rather than a citation that moved.

5. **Module test 66 cannot be green in this slice, and it is pinned as a `test.todo`.** It reads "two boundaries can no longer fall on one tick, because no phase is empty," and the three boundary phases are still empty: `phaseLengthTicks` gives a rowless phase a length of zero, so the Banshee begins and ends on the tick the Procession ends, and the same holds for the Waking and the Undertaker. Slice 3 does not close it either, because `phaseEnded` reading `Phase.ends` gives a boss phase `bossKilled` and there is no boss to kill until slice 7. **The todo is named `crosses no two boundaries on one tick, because no phase is empty` in `stage.test.ts`, and the slice that makes the last boundary phase real is the one that fills it.** Everything else the plan assigns to slice 2 landed.
6. **Section 4's `PhaseEnd` union has no member for the set piece phase.** It is `'rowsSpentAndFieldClear' | 'setPieceOpened' | 'bossKilled'`, and section 4 names the end condition for three phases: the two boss boundaries, the Crowd, and the boss phases. The Waking is not among them. It authors no rows and sheds no boss, so what clears its field is the pour running out, and the union says nothing about that. The column is filled with `rowsSpentAndFieldClear` and the reason is written beside the row: nothing reads `ends` until slice 3 and nothing fills the Waking until slice 10, so **slice 10 rules whether the set piece's end wants a member of its own.** The `over` phase carries the same value for the same reason, that nothing reads it.
7. **`Phase.bankOpens` had no reader, and reading it from `step.ts` would have broken section 5's own rule.** The step 1 gate block asks for "a per-tick check in `offer.ts` ... called from `step.ts`", and the check needs the current phase's column. Section 5 says nothing outside a module indexes another's rows, so `step.ts` cannot index `PHASES`, and `offer.ts` importing `stage.ts` would put a new edge in the core's import graph for one boolean. **A seam was added: `bankOpensNow(state)` in `stage.ts`**, which is the phase table's own reader, and `step.ts` hands its answer to `openBankedOffer(state, permitted)`. The bank never learns which phase the run is in. It is named in section 9 below.

## 5. Gate corrections

Nothing yet.

## 6. The baseline tapes

Recorded at the branch tip `ed2ad14108` before any step 2 edit, saved outside the repo under `local/step2/` (gitignored). They are the input to verification steps 5 and 10.

- `local/step2/baseline-a.tape`: seed 2093383922, 12000 ticks, the birthright only (`skullStream=1 territory=0 wisps=0 bell=0`).
- `local/step2/baseline-b.tape`: the same seed and ticks, every line at level 5 (`skullStream=5 territory=5 wisps=5 bell=5`).
- `local/step2/baseline-a.measure.txt`: `measure.ts` against baseline-a. The run ends `sealed` at tick 1746.
- `local/step2/baseline-b.measure.txt`: `measure.ts` against baseline-b. The run ends `sealed` at tick 3393.

The recorder is `scripts/record-conditioned.ts`; its argument names are the current weapon lines (`skullStream`, `territory`, `wisps`, `bell`), read from `WEAPON_LINES` in `src/game/lines/roster.ts` rather than trusted from the handoff, whose own example still says `soulStream`. Neither recording raised a fault.

The test-name baseline for verification step 5: `local/step2/tests-baseline.json` (`vitest list --json`, with the AssetPack log lines the command prints before the array stripped so the file parses as JSON) and `local/step2/tests-baseline.txt` (a sorted plain list, one `file :: name` per line, for a later agent's diff). 1423 tests, all unique.

## 7. Verification steps run

Slice 0: the step 5 and step 10 baselines recorded, see section 6.

Slice 1, from the plan's section 3:

- **Step 1, unit tests.** Green. 110 files, 1418 passed, 10 expected fail, 4 todo.
- **Step 2, `pnpm typecheck`.** Green.
- **Step 4, `pnpm verify` at the repo root.** Green, run from inside the worktree.
- **Step 5, the test-name diff.** `vitest list --json` against `local/step2/tests-baseline.txt`: **five names added, none removed, none renamed.** The five are `rows.test.ts`'s. Renaming a constant moves no test name, which is why the fifteen edited files show nothing here, and that is the point of the step: a suite that failed to load would have shown as removals. **`vitest list` does not report a `test.todo`**, so the sixth test in `rows.test.ts` is invisible to this instrument and the counts read 1428 against the baseline's 1423.
- **Step 6, GOLDEN.** Did not move, which the slice required. See section 2.
- **Steps 3, 7 to 13 and the rendered checks** belong to later slices and were not run. **Steps 16 to 22 are Mark's and stay open.**

Slice 2, from the plan's section 3:

- **Step 1, unit tests.** Green. 110 files, 1437 passed, 10 expected fail, 4 todo.
- **Step 2, `pnpm typecheck`.** Green.
- **Step 3, `pnpm build`.** Green, lint and typecheck included. Its two warnings are both standing: `@pixi/sound` statically imported alongside its dynamic import (#50) and the pixi chunk over 500 kB.
- **Step 4, `pnpm verify` at the repo root.** Green, run from inside the worktree.
- **Step 5, the test-name diff.** `vitest list --json` against `local/step2/tests-baseline.txt`: **32 names added, 8 removed, and every one of the 8 is a rename whose new name is among the added.** The renames are the five `survives the ramp on seed N` in `bot.test.ts`, which become `survives the Procession on seed N`, and three in `stage.test.ts`: `chains the phases in order` becomes `chains the seven phases in order`, `lands the Wall two seconds into the back half` becomes `into the Crowd`, and `holds only Drips and one File in the ramp's first 45 seconds` becomes `in the Procession's first 45 seconds`. Five of the 32 additions are slice 1's `rows.test.ts` names, because the baseline predates slice 1. **Nothing was removed without a replacement.** `vitest list` still does not report a `test.todo`, so the two in `rows.test.ts` and `stage.test.ts` are invisible to it.
- **Step 6, GOLDEN.** Moved, in the same commit as the behaviour. See section 2.
- **Steps 7 to 13 and the rendered checks** belong to later slices and were not run. **Steps 16 to 22 are Mark's and stay open.**

## 8. Slice 1, the rows module

`peakArrivals` is the one thing in the commit that is not a move, so what it does is written down here rather than left to be re-derived.

**It is a maximum over windows and never a sum of them.** For each window length it takes the densest window in each section table, and the largest of those against `BOSS_ADD_ALLOWANCE + RUNG_ALLOWANCE`, which is what a boss phase's own window holds. That is the shape the design record's derivation already uses: it prices the Waking window at 62 (the pour plus the Crowd's reduced share) and the Undertaker's at 26 (7 diggers plus 19 rungs) and takes the larger, and it does not add a rung term to the Waking. Adding the allowances to every window instead would put the initial cap at 251 rather than the 232 the record derives, so the record settles it.

A window is half-open, `[t, t + seconds)`, and only a window that opens on a row can be the densest. Against slice 1's tables that reproduced the record's own figure: `peakArrivals(10)` was 36, the Crowd's four rows from t=50, which is the "densest 36" the derivation reads off the same table. **Slice 2 re-authored all three tables and the figure moved with them**: it is 39 now, the Crowd's four rows from t=130, the climb into the Waking. The Procession's densest ten seconds is 13 and the Vigil's 16, both under the allowance floor of 26, so the Crowd's table is still what the maximum falls on.

**The allowances are flat rows sized for the freshness window**, not scaled by the argument, which is what section 4's seam comment says ("inside a freshness window"). `BOSS_ADD_ALLOWANCE` is 7 and `RUNG_ALLOWANCE` is 19, both from the design record's derivation.

**The tests were proved to bite rather than assumed to.** Three mutations were run against `rows.ts` and reverted: dropping the zero-window guard, dropping the allowance term from the maximum, and widening the window's upper bound to inclusive. Each turned exactly one of the three query tests red and nothing else. The two table tests carry their own proof inline, each asserting that its rule catches a hand-made bad row, because both otherwise assert an absence.

**`StageRow` now lives in `rows.ts` and `stage.ts` does not re-export it.** A consumer imports the type from `rows.ts`; `stage.ts` imports it for `Phase` and its own export block does not name it. `stage.ts` keeps `PhaseName`, `Phase`, `StageState`, `PHASES`, `DRAIN_OUT_SECONDS`, `phaseLengthTicks`, `createStage` and `advanceStage`.

**One warning for anyone running the standing checks.** `pnpm format` run from the shared checkout at `/home/mlo/dev/niftymonkey/the-cabinet` reformats this worktree's `scripts/roadmap/` files, because that root's `.prettierignore` names `scripts/roadmap/` relative to itself and cannot see the same entry in the nested worktree's own ignore file. It churned five ignored files here and they were reverted before the commit; nothing outside the worktree was touched, checked by mtime. Step 1's note already said to run the gate from inside the worktree, and this is the mechanism behind that instruction.

## 9. Slice 2, the three sections

**The seam that was added: `bankOpensNow(state)` in `stage.ts`.** Section 4's `Phase` gained `bankOpens` and the step 1 gate block asks for the per-tick opening site in `offer.ts`, called from `step.ts`. Neither document says who reads the column. `step.ts` indexing `PHASES` breaks section 5's rule that nothing outside a module indexes another's rows, and `offer.ts` importing `stage.ts` adds an import edge to the core for one boolean, so the phase table reads its own column and hands the answer over: `openBankedOffer(state, bankOpensNow(state))`, called beside `advanceLines` where the gate block puts it.

**`bankOpens` is true on every phase but `over`.** The gate block says the default is true and a phase is set false only where the record names a reason. The record names none for a boss phase or the sparse row, so none is set false there. The `over` phase is the one exception and its reason is written beside the row: the run has ended, so there is no run left to spend an offer in.

**The per-tick site finds nothing to do today, and that is stated in its own comment.** Every offer clears through a take or a loss, and each of those opens the bank itself. It becomes live at slice 5, where an offer whose three bodies are all refused at the corpse cap banks rather than disappearing.

**The three properties are measured under two named hands, and each test states its own.** The plan leaves the killing policy to the test and both hands live in `stage.test.ts`.

- The **sharp hand** kills every mob on the first tick the game lets it be read, its arriving beat spent and its body fully on the field (ADR 0016). It is what the Procession's ceiling and the Vigil-against-Crowd food rate are read under. Under it the maximum live templates is 1 in all three sections and growth paid per second is exactly the section's own authored rate, 0.26 for the Procession, 0.87 for the Crowd and 0.52 for the Vigil, in size units.
- The **still hand** is the rig this file already used: a grave held immortal that never moves and fires only its birthright. It is what the Crowd's floor is read under, and what the Procession's deliberate absence is read under. Under it the Procession reaches two live templates and stays there for 2625 of its 7200 ticks with no fault raised anywhere, which is the deliberate absence spec test 4 asks for.

**Why the ceiling needs the sharp hand and the floor needs the still one, measured rather than assumed.** Four seeds were run under each hand at three build levels. Under any still-grave hand, birthright or maxed, the Procession reaches two live templates: a parked grave never engages the edges, so a body it never touches lives its full roughly fifteen seconds against rows nine seconds apart. Under the sharp hand every section holds one, because a hand that deletes a group as it arrives makes the ceiling true by construction and tells the three sections apart not at all. So the ceiling is asserted under the sharp hand and given its teeth by a second assertion under the still one: the Procession's field is empty more than four times the share of ticks the Crowd's is. Those two are the pair the plan describes, the property under a hand that plays it and the absence under one that does not.

**The Crowd's floor drove two authoring changes.** Measured across four seeds at build levels 1, 3 and 5, the floor broke in two places: at 16.0 to 17.7 seconds, where only the lone ghoul Drip stood between the Wall and the first Pincer, and at 84.0 to 86.7 seconds, climbing out of the trough. The Pincer moved from t=17 to t=15 and a Drip of three was added at t=79, and with those two the Crowd holds two or more live templates from the tick it first has them through to its last row firing, on every seed and at every build level. The holes before the first two rows have fired and after the last one are outside the window and are what the sparse row and the eye opening answer at slices 3 and 10.

**The clock is 120, 155 and 75 seconds, which is 2:00, 2:35 and 1:15.** The design record's nominal clock exactly, and the boss phases still end on the tick they begin, so a run of authored rows is 350 seconds. `phaseLengthTicks` is still last row plus the drain-out, so the last rows are t=103, t=138 and t=58.

**The carrier count is held at 25 and its distribution is the record's eight, eleven and six.** Slice 4 owns the placement and this slice owns which rows may carry, so `carriersScheduled()` is met without `carriers.test.ts:228`'s literal pin having to move. `authoredCarriers()` in that file gained `VIGIL_ROWS`, which it needed either way.

**The Procession's first carrier now stands at t=21 rather than t=2, and that has a measured cost.** The design record holds the first two Drips clear on purpose, the first because the first kill of the run teaches the swallow and the second because the lone revenant teaches the tell. `hitTakingPolicy` seals shut at tick 1132 on every seed, before that first carrier, so it never swallows a rung and never loses one: `weaponStripped` fell from every seed to none. **The assertion was re-pinned rather than weakened**, as `STRIPS_A_RUNG` in `bot.test.ts` with the cause written on it and asserted as an equality, so the day a seed reaches the rung again the file goes red and says which. **ADR 0003's whole ladder in order is spec test 47's, at slice 9, on a run that reaches a boss fight, and that is where it has to be re-established.** If it cannot be reached there either, the honest answer is a pinned build on the hit-taking policy rather than a thinner opening.

**The other bot pins that moved, all re-measured and all with their cause written in the file.** `REACHES_VICTORY_FRESH` went from four seeds to two (404 and 505); `REACHES_VICTORY_FROM_THE_CEILING` from 101, 303 and 404 to 101 and 202; the storm's measured floors from 66 kills and 7 offers to 20 and 1. One cause runs through all of them: the stage is 21000 ticks of authored rows where it was 12421, and a dodger is paid only by the carriers its own lane happens to cross, so a longer, emptier opening pays it less and gives it longer to be ground down. `REACHES_VICTORY_MAXED` did not move, all five seeds, and `SEALS_IN_THE_PROCESSION`, `NEVER_FEEDS` and `MEETS_THE_TIMELINE` are all still empty.

**One test gained a stated timeout, and it is a budget rather than a flake fix.** `reaches victory from a maxed build on the seeds the set names` is the one test in `bot.test.ts` that pays for five whole-stage runs nothing else has warmed, and five runs of 21000 ticks at a maxed build no longer fit inside vitest's default five seconds. It is `FIVE_MAXED_RUNS_MS` on that one test, with the reason on the constant, rather than a suite-wide setting. It was also moved above the both-endings test in its own describe, which restores that block's own stated claim that every run it reads has already been paid for.

**The row tables are now 8 lines per row and `rows.ts` is 658 lines.** Prettier breaks a `StageRow` literal at 80 characters and `directed` is the field that pushes it over. The cost is real: 57 rows spread over 456 lines is a timeline whose shape can no longer be read at a glance, which is the thing the tuning pass at step 4 will want most. It was taken rather than worked around, because `// prettier-ignore` has no precedent anywhere in this tree and a formatting escape hatch is not a coding agent's call. **If a later slice wants the tables scannable again, that directive is the answer and it costs three lines.**

**Test 130 reads `stage.ts` through a Vite `?raw` import rather than `node:fs`.** A source-text fence needs the file's text, and `boundary.test.ts` allows a test under `src/game` to import exactly one bare package, vitest. `import stageSource from '../stage.ts?raw'` is a relative import the fence resolves inside `game`, so the guard stays green and the test stays in the file the plan puts it in.

**One stale sentence was found and corrected in `bot.test.ts`.** `SEALS_IN_THE_PROCESSION`'s opening line read "and there is one: 505, at 5466 ticks" while the constant has been an empty array since the offer of three landed; its own later paragraph says 505 left the set. The opening line now says the set is empty. Its historical paragraphs still say "the ramp", because they record measurements taken on the stage that was the ramp, and a note at the top says the ramp is the phase now called the Procession.
