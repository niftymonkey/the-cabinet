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

Slice 0 records the baseline tapes and makes no commit.

## 2. GOLDEN moves

Nothing yet.

## 3. CodeRabbit

Nothing yet.

## 4. Plan claims found false against the tree

Nothing yet.

## 5. Gate corrections

Nothing yet.

## 6. The baseline tapes

Nothing yet.

## 7. Verification steps run

Nothing yet.
