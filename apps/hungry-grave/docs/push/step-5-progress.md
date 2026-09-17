# Step 5 progress note: show what you have (tickets #72 and #99)

The record is `apps/hungry-grave/docs/design/show-what-you-have.md` and the prompts are `step-5-slice-prompts.md`. The coder contract is still `step-4-coder-contract.md`, with the three overrides at the top of the prompts file. One section per slice at the end, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

**Round two's note is `round-two-progress.md` and step 4's is `step-4-progress.md`, and both are read and never appended to.** This step's slices carry `#72` or `#99` rather than `#39` or round two's tickets.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| 1 (5.0), the docs commit | the commit this note rides in, section 6 says why | `docs(hungry-grave): ADR 0054 reads a line's rung off its own expression, the HUD entry moves to the field's top edge and the glossary gains the dive, the score and the fallen rung (#99)` |
| 2 (M1), the fold | `2c7a281657` | `feat(hungry-grave): the ladder remembers the rung it bled and the witness folds it (#99)` |
| 2 (M1), a kill pays score | `11483ecf31` | `feat(hungry-grave): a kill pays score and a bled rung stays bled until the grave grows (#99)` |
| 3 (M2), the frame composed and the band reserved | `0c7f877ad1` | `feat(hungry-grave): the frame is composed across three regimes and the HUD's band is reserved (#72)` |
| 4 (M3), the HUD carries the ladder and the score | `48383d4d68` | `feat(hungry-grave): the row carries the score and every rostered line's rungs as marks (#99)` |
| 5 (M4), the loss is watched | `d463dc8252` | `feat(hungry-grave): the score is watched leaving and every line that paid says so (#99)` |
| 6 (M5), the stripped rung falls | `9aa6f83a6a` | `feat(hungry-grave): a stripped rung falls onto the field as a body the dive can catch (#99)` |
| 6b (M5-fix), the rungs fall above a clamped grave | `52a62e16d1` | `fix(hungry-grave): a strip with no room below the grave drops its rungs above it (#99)` |
| 7 (M1-fix), the bleed is capped | `f98c01767d` | `fix(hungry-grave): a floor hit bleeds a capped slice of the score and the remainder stays (#99)` |
| 8 (M1-stage), the ladder is staged in the harness | `78b2d85fe8` | `feat(hungry-grave): the harness stages a run at the floor holding a score and walks the ladder hit by hit (#99)` |
| 9 (M6), the ladder's cost is measurable | `e173dbad0f` | `feat(hungry-grave): the batch reads what the ladder cost and what the dive took back (#99)` |
| 10 (M7), the score's other inputs | `6665fad6d4` | `feat(hungry-grave): the score is fed by boss damage, the source killed and a meal taken at a maxed ladder (#99)` |
| the close fold, the final score is presented at the seal | `7ffcea5db5`, and the docs commit this row rides in | `feat(hungry-grave): the end screen presents the final score, and hudRow drops its unused band parameter (#99)` |

Slice 2 (M1) carries two code commits, the fold and the rule, which is this step's one authorized departure from the contract's one-code-commit rule.

## 2. The version ledger

Where each constant stood when step 5 opened, where it is permitted to go, and where it actually went. **A move anywhere the plan does not name is a stop and report, never a re-pin and never a bump taken on the spot.**

| Constant | At slice J2's tip | Permitted move | Owner | Landed |
| --- | --- | --- | --- | --- |
| `WITNESS_VERSION` (`src/game/witness.ts`) | 9 | 9 to 10, exactly once | Slice M1, in its own commit | **10 to 11**, in `2c7a281657` |
| `READINGS_VERSION` (`src/dev/readingsVersion.ts`) | 6 after slice J2's second code commit | 6 to 7, exactly once | Slice M1, in the same commit as the score change | **7 to 8**, in `11483ecf31` |
| `FORMAT_VERSION` (`src/tape/wireCodes.ts`) | 4 | none | nobody | **4**, held and read off the tree at both commits |
| `GOLDEN` (`src/dev/digest.ts`), checksum `1275540894` | pinned by slice J2 | one re-pin, plus one at-most permit | Slice M1 takes the one; slice M5 holds the permit and is expected not to use it | **two re-pins**, `1307518644` to `-1110848414` to `-2049717150` |

**The step's whole budget is one `GOLDEN` re-pin, one at-most permit, one witness move and one readings move, each named by its slice** (record section 5, orchestrator 2026-09-16 under one-push mode). **Slices M2, M3, M4 and M6 are permitted none**, and a move in any of them is a stop and report, because none of them opens `src/game`.

**The readings move was not in the record when it was filed.** Section 5 said `READINGS_VERSION` does not move in this step at all, on the reasoning that M6's two readings are new beside unchanged ones. `run.score` is itself a declared reading and slice M1 changes what it means, which is `readingsVersion.ts`'s own rule for a bump, so **the orchestrator corrected the sentence on 2026-09-16 rather than obeying it** and section 5 now names the one move.

**What the moves cost, stated rather than discovered.** Each slice that moves a constant writes its own sentence here.

**M1's witness move costs every tape recorded before `2c7a281657`.** Not one of them replays at this tip: they are refused at the decode by their own version rather than diverging at a checkpoint, which is ADR 0019's refusal rule working. Proved rather than asserted: `local/round2/j3-hand-404-prebuild.tape`, Mark's own round two tape, measures to `outcome: 'witnessVersionMismatch'`, tape version 10 against reader version 11, with no checkpoint reached and no divergence reported.

**M1's readings move costs the comparability of `run.score` and `tuning.damageTaken.scoreBled` across `11483ecf31`.** Every batch recorded before that commit is incomparable with every batch after it on those two keys, and version 8's own paragraph in `readingsVersion.ts` names them and names what holds beside them.

**`FORMAT_VERSION` did not move and the fault identity M1 appended is why it did not have to.** `score rung re-armed by growth` takes code 23 in `FAULT_IDENTITY_CODES`, appended at the end (ADR 0024, closed and append-only), so no byte's meaning moved and no existing identity changed code.

**M6 moved none of the four and was permitted none.** `WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN`'s checksum `-2049717150`, each read off its own tip before the first edit and again after the last, and none of the four files is in either of its commits. Section 12 carries `readingsVersion.ts`'s own rule quoted beside the reason the version is held.

**M7's readings move costs the comparability of `run.score` and `tuning.damageTaken.scoreBled` across `6665fad6d4`, for the second time in this step.** Every batch recorded before that commit is incomparable with every batch after it on those two keys, and version 9's own paragraph in `readingsVersion.ts` names them and names what holds beside them. **The other three constants held and none of their files is in the commit**, `witness.ts`, `wireCodes.ts` and `digest.ts` alike; `wireCodes.ts` is in it for the appended fault identity's code alone, which is append-only under ADR 0024 and moves no byte's meaning, exactly as M1's identity 23 did.

**The table's baseline column is slice J2's tip and step 5 opens at slice J3's, which is two commits further on** (step 5.0, read off `d648c97bf7`). The tree reads `WITNESS_VERSION` **10** (`witness.ts:177`), `READINGS_VERSION` **7** (`readingsVersion.ts:159`), `FORMAT_VERSION` **4** (`wireCodes.ts:50`) and `GOLDEN`'s checksum **`1307518644`** (`digest.ts`), with `score: 0`, `mobs: 5`, `corpses: 1` and `kills: 2` inside it. Round two's slice J3 spent the same two numbers the table reserves for slice M1, so **the permitted moves are one move each and the figures now read 10 to 11 and 7 to 8**; the budget is the intent and the arithmetic is what moved. The table's cells are left as they were filed rather than rewritten, and **slice M1 confirms both figures against its own tip before it moves either.**

## 3. GOLDEN moves

One entry per slice that was permitted one, whether or not it moved, with the dated paragraph's location and every field that moved beside every field that held.

**M1's first re-pin, in the fold commit `2c7a281657`: the checksum alone, `1307518644` to `-1110848414`.** The dated paragraph is in `digest.ts`'s JSDoc above `GOLDEN`. **The isolation run proved the single cause before anything was pinned**, J3's way: a probe inside `foldGrave` asserted `grave.scoreRungBled` false on every fold of all 600 ticks and folded the old way, and the scenario returned `1307518644` whole, every field and the checksum, with `digest.test.ts` green against the unmoved pin. The probe was removed before the commit. The ladder never runs inside this window at all: the grave stands at 24.10125 against a floor of 18 for the whole scenario, so `runFloorLadder` is never called and the memory never leaves its resting false.

| | isolation run, old fold | fold commit's pin |
| --- | --- | --- |
| checksum | **1307518644** | **-1110848414** |
| everything else | tick 600, seed 20260820, graveX 365.625, graveY 318.875, size 24.10125, score 0, reservoir 0.10125, mobs 5, shots 0, corpses 1, skulls 2, wisps 0, kills 2, the `drawn` record, the levels record, all eight cursors | identical |

**M1's second re-pin, in the score commit `11483ecf31`: `score` and the checksum, and nothing else.** The dated paragraph sits below the first in the same JSDoc. **The digest was red rather than green**, which is what says the payment site is on the path a scripted kill takes. `score` moved from 0 to **200**, and the arithmetic is the rows rather than a typed figure: the scenario's two scripted kills at ticks 240 and 540 are both shamblers (`digest.ts`'s `put`), the shambler's row pays one `TRASH_KILL_SCORE`, and two of them is 200. The checksum moved from `-1110848414` to `-2049717150` with it, because `run.score` has been folded since long before this.

| | fold commit's pin | score commit's pin |
| --- | --- | --- |
| score | 0 | **200** |
| checksum | -1110848414 | **-2049717150** |
| everything else | tick 600, seed 20260820, graveX 365.625, graveY 318.875, size 24.10125, reservoir 0.10125, mobs 5, shots 0, corpses 1, skulls 2, wisps 0, **kills 2**, the `drawn` record, the levels record, all eight cursors | identical |

**`kills` holding at 2 is the thing to watch beside the score.** Nothing new dies in the scenario; the same two deaths now pay. The overflow input is untouched and pays nothing in this window, because the grave ends at 24.10125 against a ceiling of 67.5 and never reaches it, so the 200 is the kill input alone.

## 4. CodeRabbit

One entry per code commit: files reviewed, findings by severity, applied and declined, each decline with its reason.

**M1's fold commit, `coderabbit review --agent --uncommitted`, one iteration: 16 files reviewed, 0 findings.** Nothing applied and nothing declined.

**M1's score commit, one iteration: 8 files reviewed, 3 findings, none of them on this slice's code and all three declined.** All three are on `docs/push/step-5-slice-prompts.md`, on an uncommitted edit to slice M2's block that another agent was making in the shared worktree while M1 ran (see section 5). Two majors and one minor, all about reading `env(safe-area-inset-bottom)` once at boot and whether `safe-area-max-inset-bottom` should be preferred. **Declined because the file is not this slice's and the subject is M2's**, and because the edit under review was not committed by anything M1 did. The review saw those two docs files in both runs because they were dirty in the worktree the whole time.

**M3's code commit, one iteration: 8 files reviewed, 0 findings.** Nothing applied and nothing declined. The worktree was clean of other agents' edits this time, so the review saw this slice's eight files and nothing else.

**M5-fix's code commit, one iteration: five files reviewed, one finding, nothing applied and the one finding declined.** The finding is a minor on `docs/research/score-inputs-precedent.md`, about a rich-drop window's carrier arithmetic in a paragraph about the four-line roster. **Declined because the file is not this slice's**: it is one of two docs files another agent had uncommitted in the shared worktree while the review ran, both of them slice M7's, and the review saw them for that reason alone. Zero findings on the three files this slice changed.

**M4's code commit, one iteration: 14 files reviewed, 7 findings, none applied and all seven declined.** Section 10 carries each decline with its reason. Four of the seven are on `docs/design/show-what-you-have.md` and `docs/push/step-5-slice-prompts.md`, which were dirty in the shared worktree while the review ran and are not this slice's files; **all four are one argument, that M7's `run.score` change needs a `READINGS_VERSION` 8 to 9 move the section 5 ledger forbids**, and it is left here for the orchestrator rather than acted on.

**M1-stage's code commit, one iteration: 14 files reviewed, one finding, applied, and nothing declined.** A minor on `scripts/record-conditioned.ts`: the keyed-argument reader took the first match, so `score=1 score=2` silently resolved to the first. Real, and the same rule `parseLevels` already held for a line named twice, so a repeated `rig=` or `score=` is now refused by name. The worktree held no other agent's edits, so the review saw this slice's fourteen files and nothing else.

**M6's code commit, one iteration: nine files reviewed, one finding, minor, its fix declined and the honest half taken.** The finding asks `tuning.bledRungMemory.growthShortOfClearing` to sum growth off ordered events rather than off the size edge, so a shrink on the same tick cannot mask it. **The under-count is real and the fix it names is not available**: no event carries the size a swallow paid, so the growth would have to be recomputed from `swallowed`'s payout and freshness against `growGrave`'s ceiling clamp, which is a second copy of two sim rules inside `src/dev` and is forbidden by the slice's second ruling; adding an event is `src/game` and is out of the commit by the same ruling. **The reading's JSDoc now names the residual instead**, so the figure cannot be read for more than it is. Section 12 carries it whole. The worktree held no other agent's edits, so the review saw this slice's nine files and nothing else.

**M7's code commit, one iteration: 30 files reviewed, 0 findings.** Nothing applied and nothing declined. The worktree held no other agent's edits, so the review saw this slice's thirty files and nothing else.

**The close fold's code commit, one iteration: nine files reviewed, 0 findings.** Nothing applied and nothing declined. The worktree held no other agent's edits, so the review saw this slice's nine files and nothing else.

## 5. Record and prompt claims found false against the tree

Every claim in the design record or in a slice prompt that did not survive contact, with the file and what is actually there. **The source's intent is followed rather than its stale letter, and an unclear intent is a stop.**

**Step 5.0. Territory shipped as ground before ADR 0054 was ruled, not after it.** R8 and the prompt's item (b) both word the amendment's third leg as "Territory shipped as ground rather than as a shot, which happened after the ADR was written". Territory landed as claimed ground on 2026-08-27 and 2026-08-28 (`4d380f9e66`, `c35d79de72`, `426576d489`, `c77622c7ce`), and ADR 0044 gave its level the radius channel in its 2026-08-28 amendment; ADR 0054 was ruled on 2026-09-07, ten days later. **The intent was followed and the leg is true as written in the file**: what the ADR could not have known is that nobody had read the field channel line by line, which is the reading section 3.3 made on 2026-09-16 and which is what says Territory can never carry a countable rung.

**Step 5.0. Both records were already in version control when the slice opened.** The prompt's item (g) and its state-of-the-branch both say the design record and the research record are untracked files to add by path. They were committed at `45a25ee6eb` with the prompts themselves, before slice L. Nothing was added and neither file was edited.

**Step 5.0. The prompt's four constants are slice J2's and the tree is two commits past them.** Recorded in section 2 above with the figures read off `d648c97bf7`. Nothing here moved any of them.

**Step 5.0. R4's Sonic precedent is not what Sonic ships.** R4 says "Rings are both the score and the death buffer, and they refill only by the player's own act of collecting them", citing `floor-ladder-precedent.md`, whose own line said the same. The rings are their own counter beside the score, flashed by the HUD when they read zero. **The intent was followed**: the half R4 leans on, a buffer refilled only by the player's own act and never as a side effect of the weapon firing, is exactly what Sonic ships and the bled-rung memory stands on it unchanged. The research line is corrected in this slice's second commit; **the design record is not edited by the slice that files it**, so R4 still carries the old reading and this entry is where that is written down.

**M1. "The memory set while the grave is off the floor" is not a state that can never exist, and the invariant is built at the threshold instead.** The prompt's item (f) and its test 11 both word R4's impossible state that way, and read literally it is false against R4's own rule two paragraphs above it: a crumb of growth leaves the grave above the floor with the memory still set, and that is the case the threshold exists to produce. **The intent was followed**: the check refuses the memory at or above `SIZE_FLOOR + HIT_SHRINK`, which is "off the floor" in R4's own sense of having grown a full hit's worth off it, and it is the only reading under which both halves of the rule are the two writers of the field. The test asserts the crumb is not a fault so the check cannot quietly become a floor comparison.

**M1. Five of the files the prompt expected to turn red did not.** Its expected-red list names `run.test.ts`, `witness.test.ts` throughout, `swallow.test.ts` wherever score is asserted, `measure.test.ts`'s rich fixture, `replayTallies`' own tests and `harnessPolicy.test.ts`'s measured per-seed baselines. **`witness.test.ts` turned red on one assertion only**, the version pin, and its `ENTITY_CASES` and `FOLDED` entries were additions rather than repairs. **The other five stayed green and were checked by running them, not assumed**: nothing in them asserts a score figure a kill could move. What did turn red and is not on the list is `endings.test.ts`'s ladder-in-a-fight test and `bot.test.ts`'s `BLEEDS_SCORE`, both recorded in section 7 as re-measured baselines. The diff is 21 files, inside the prompt's own realistic 14 to 22.

**M1. `comparisonDeclared.test.ts` lives at `src/dev/__tests__/`, not beside the other four fences.** The contract's what-must-not-move list names the five fences without paths and the other four are at `src/__tests__/`. Nothing moved; it is written down so the next slice does not hunt for it.

**Step 5.0. The definition covers every record and the work list named two.** Items (b) and (d) name ADR 0054 and `CONTEXT.md`'s Rung entry, and the definition says no record in the tree says a rung is carried by a line's projectiles. `docs/design/game-concept.md` carried the same two sentences, restating ADR 0054 by citation. **The intent was followed**: the same word changed in the same way, in the same commit, which is round two's own precedent for the concept document's sentences riding in the amendment's commit (round two note section 6).

**M2. The prompt's test 4 asks the HUD row's ends to clear both reserved top corners at every viewport, and the geometry cannot.** The reserve claims 260 stage units at each end of a 540-unit phone stage, which leaves a 20-unit row, and R1's own content is 520 field units. **The record's intent was followed rather than the prompt's letter**: R12 already rules the crossing a dev-build-only collision and names it so nobody reports it as a bug. Section 8 carries the arithmetic, the alternative that was rejected and why, and the tests that pin the outcome instead.

**M2. The record's narrow-phone belch overlap is 112 stage units and measures 108.** `BELCH_SIZE` is 108, so 108 is the whole button and 112 is not a figure that row can produce. Every other cell in section 3.1 survived re-derivation at this tip, including the three rows the even split moves.

**M2. None of the exact-offset assertions the prompt expected to turn red did.** Every existing viewport in `layout.test.ts` either does not refit or refits to the same offset under both rules, `layering.test.ts` turned red only on the new tests, and `BelchButton.test.ts`'s two rects did not move. All twelve red tests were M2's own, and the four green files were checked by running them rather than assumed.

**M3. Both of R2's own legibility floors are a rounding above the widths they were derived from, so neither 1.5 nor 3 field units reaches its own floor.** The stroke floor is stated as 0.89 CSS pixels and derived as `SPRITE_STROKE` 1.5 at "the narrow phone's 0.59 CSS pixels per field unit"; the true figure is 320/540, which is 0.5926, so 1.5 units measures **0.8889** and misses the stated floor by a thousandth. The gap floor is stated as 1.8 and derived as 3 units at the same scale; 3 units measures **1.7778** and misses by two hundredths. **The record's intent is the floor rather than the figure**, which item (h) says in as many words, so the mark's outline is **1.6 units** and the gap between two marks is **3.2**, measuring 0.948 and 1.896 at that viewport. Both are written into `LadderHud.ts` with this derivation beside them. The mark itself is untouched at 11 and clears 6.25 at 6.519.

**M3. The row's content clears the field's boundary at a mark and not at an icon, so the gap leg of the separability predicate does not carry the reading and the luma leg does.** The prompt reads the gap as "the band's 2 units of padding, about 1.2 CSS pixels there", which is what it is where the row sits above the field. Where the row draws over the field's top edge, which is the narrow phone the predicate is measured at, those same 2 units are exactly `BOUNDARY_STROKE`'s own 2, so the icon's box begins where the boundary's stroke ends and the measurement is **0 CSS pixels at an icon and 4 at a mark**. Section 9 carries the measured pixels and the leg that carries it.

**M4. There is no `ReplayScreen.test.ts` and the replay's own tests live in `src/app/__tests__/replayLifecycle.test.ts`.** The prompt's expected-red list and its seams both name `ReplayScreen.test.ts`. **The intent was followed**: the mirrored blow-up's test is in `replayLifecycle.test.ts`, which is the file that owns the replay screen's wiring and pooled lifecycle, and it is where `REPLAY_LEAD_IN_TICKS` is already asserted.

**M4. The prompt's "the three events reaching the view from the driver" is two events and one that never reaches it.** `sealed` ends the run and reaches `runEnding`, never the row: there is nothing for a row to draw of a run that is over. The two the row is handed are `scoreBled` and `weaponStripped`, which is what the definition's own sentence names and what R7's first two channels need.

**M4. Section 3.3's "on screen between events" is a stronger claim for the wisps than the line's own code supports.** The table reads "while any are alive", which a reader can take as most of the time. `wisps.ts` fires a flight on each swallow with a 90-tick life and is never always-on, by ADR 0005 and its own file header, so a wisp is on screen only in the window after a swallow. **That is why the wisps got no field blow-up**, and it is the reading section 10 states per line.

**M1-stage. The record's ladder rig is a different starting condition from the row now named after it, and the row's name is ruled rather than open.** The prompt's third ruling says calling the row `floor` would put a second name on a starting condition the record already names. `playing-harness.md` section 6's table names the ladder rig as `SIZE_CEILING`, birthright levels and `hitTakingPolicy` (`bot.test.ts:452-463`), which is not this row: this row is `SIZE_FLOOR`, every line at the cap, and a score. **The ruling was taken as ruled and the row is `ladder`**, because step 5's own prose has been using "the ladder rig" for a levels-pinned conditioned run all along, which is far closer to this row than the table's entry is, and because the two rows exist for one purpose, walking ADR 0003's floor ladder. **What is filed rather than fixed**: the label now covers two starting conditions, which is #107's own shape, and `playing-harness.md` section 6 and `step-3-playing-harness-dispatch.md` both need the table amended. A docs pass owns it; no slice edits a record it was dispatched against.

**M1-stage. The prompt's rig-and-levels refusal does not extend to the score, and ruling four is what says so.** Refusing `rig=` beside `score=` on the levels argument, which the first cut did, blocks the exact command ruling four requires: the conditioned ladder tape recorded on the ladder rig at a starting score of zero. It was backed out for an override, the row's size and levels with the named score in place of the row's, and the reason is in the function's own JSDoc.

**M1-stage. The realistic file count is 7 to 10 and the slice is 14.** The four the estimate is short by are the two new test files, which the prompt's own test list requires, and `harnessRun.ts` with its test, which ruling four's "`playHarnessRun` passes it through" requires. Nothing was cut to reach the number.

**M6. The three new tests sit at `src/dev/__tests__/` rather than beside their readings, and the span fence decided it.** The prompt tells the slice to stage its floor runs with `RIGS.ladder` rather than with hand-built state, and a test under `src/dev/readings/__tests__/` reaching `src/dev/rigs.ts` is a span violation: `boundary.test.ts`'s `SAME_ROOT_ALLOWANCES` gives `game` and `engine` a blanket and gives `dev` none. **The intent was followed and the placement follows the fence's own rule**, a test in the test folder of the lowest folder holding everything it spans, which is `src/dev`. Each file says so in its header.

**M6. The prompt's ladder-rig batch cannot be run, and the reason was filed by slice 8.** Item (i) asks for a batch on `rig=ladder` where a zero would be the finding. `batch.ts` accepts the row and every seed diverges at readback, so the report carries no readings at all, which is the tape-header gap section 14 files by name. Section 12 records it and what was measured instead.

**M6. `batchReport.test.ts` and `compareRuns.test.ts` did not turn red.** Both are on the prompt's expected-red list. Neither asserts an exhaustive reading list of its own, so a new reading is turned red by the two declaration fences, and it was. Checked by running them.

**M6. `pnpm verify` was already red on the branch, on a doubled blank line in `CONTEXT.md` that arrived with slice 8's docs commit `5421919529`.** Slice 8's own verify runs were made before that commit existed. It is removed in M6's docs commit, whitespace only, and section 12 carries it.

**M7. One ledger function for all five payment sites closes a value-import cycle, and the core's own guard refused it.** The first cut put `payScore(state, input, amount)` in `run.ts`, beside `clearRefusals`, so that every payment went through one writer and a payment with no name could not be written at all. `boundary.test.ts`'s *the core has no import cycle* went red with `KNOWN_CORE_CYCLES` still empty: `mobs.ts` would have to import `run.ts` and `run.ts` already imports `mobs.ts` for the mob pool. **The prompt's own module-boundary rule says the same thing in advance**, that no import direction changes in this slice, so the helper was backed out and each of the five sites writes the two lines itself. **What carries the property instead is the closed union and a cross-cutting test**: `ScoreInput` has five members, every site names one, and `scorePayments.test.ts` drives all five through a record that is total over the union, so a sixth input with no payer is a compile error there.

**M7. The Waking's source out-pays the Banshee's whole fight, and both figures are the research's own.** The source's 24 trash kills and the boss rate's hundred health per trash kill are derived from the same rate in `score-inputs-precedent.md` section 4, and the Banshee's 2,200 health pays 22 at that rate against the source's 24. So the tuning test bounds the source below the stage's **last** fight rather than below any fight, and says why in its own comment. Nothing was moved to hide it: both sit inside the researched band of 20 to 70 trash kills for a single input, and the Banshee is the shortest fight in the game.

**M7. `record-conditioned.ts` cannot record a tape that reaches a boss, whatever the rig.** Item (i) asks for a conditioned tape at a rig that reaches one. Its wandering script takes revenant fire and seals: at `rig=maxed` seed 404 the run ends sealed at tick 6,229 with 11 hits taken, and the Procession runs to about 7,500 ticks on the same rig, so no boss is ever on the field. **What was measured instead** is a harness-played tape from the maxed-rig batch, which is the same instrument and a steering hand that survives: `local/step5/m7-maxed-committed/loose-far-maxed-1789638094880/902.tape` measures to `outcome: 'verified'` at `readingsVersion` 9 with every one of the five inputs paying. Section 13 carries both.

**M7. The realistic file count is 16 to 26 and the slice is 30.** The four the estimate is short by are the two new test files the prompt's own test list requires, `wireCodes.ts` for the appended identity's code, and `corpses.ts` for the tier the swallow now reads. Nothing was cut to reach the number.

## 6. Step 5.0: the docs commit, ADR 0054 amended and the glossary gains three terms (#99)

Five files: four records at 16 insertions and 4 deletions, and this note. **Written inside the commit it describes**, because step 5.0 is one docs commit by its own prompt and there is no second commit to record a hash from; section 1's row points here and the hash is in the dispatch report. **No file under `src/` is in it, no test moved, and the test-name diff is zero and zero.**

**ADR 0054's triple, in one sentence.** What stood is both channels existing and neither being the only reading of a loss; what changed is the word projectiles, which the stream's columns, the bell's cones and the wisps' count all satisfy and Territory cannot, because it fires nothing and its level buys an area rather than a count; what the record could not have known is that nobody had read the field channel line by line, and read that way it says one line of the four carries a rung a player could count (section 3.3, measured 2026-09-16). The two sentences in the opening paragraph carry the amended word and nothing else in the body moved, so the decision, the number, the title and the filename all stand.

**The overrule line, quoted.** "This amendment is taken by the dispatching session under the one-push rule, and it is Mark's to overrule on the branch before merge." It is ADR 0058's own sentence for this case, and the amendment is also the record's section 7 second finding, so it reaches his read rather than only the tree.

**The HUD entry, before and after.** Before: "The slim readout inside the field frame carrying the score and each line's rungs as pips". After: "The slim readout at the field's top edge carrying the score and each line's rungs as marks", with the placement sentence saying it sits in the band above the field where the screen leaves one and over the field's own top edge where it does not. Both the entry and its dated amendment paragraph are the record's section 4 text copied rather than composed.

**The three entries added, each in the file's own voice with its own Avoid list.** **Dive**, placed after Swallow in the grave's section, the move that swallows and ordinary steering rather than a move of its own, _Avoid_: dash, lunge, plunge, dip, special move. **Score**, placed after Sealed shut, paid by a kill and by growth past the size ceiling and spent first by the floor ladder (R4, ADR 0002, ADR 0003), _Avoid_: points, XP, experience, currency. **Fallen rung**, placed immediately after Rung so the two read as one thing at two moments (section 9 ruling 6), one body per rung the floor ladder takes, spread in roster order at the offer's own spacing, offset from the grave, riding the scroll and not decaying, and a swallow giving the rung back to the line it came off, _Avoid_: dropped level, gem, refund, loot.

**The Fallen rung entry does not claim the treasure class, and that is left for slice M5.** R6 rules the bodies into the treasure class, and `CONTEXT.md`'s Treasure entry defines that class by never decaying while R6 keeps this body's decay as a data row set false rather than an invariant. **Naming the class here would make the Treasure entry's own list of two stale on the same page**, so the class line waits for the slice that creates the fourth kind.

**The Rung entry's decision on "pip".** Its Avoid parenthetical, "pip (which is the mark, not the step)", was checked against the amended wording and left alone: it says pip names the glyph rather than the step, which is still exactly true now that the glyph is called a mark. **One object carries two words in the tree**: the record's amended HUD text says marks and ADR 0054 still says pips, in a sentence this commit did not touch. That is worth Mark's eye and it is not a vocabulary change taken here.

**The research line.** One line into `visible-ladder-precedent.md`, in its own recommendation section beside the paragraph that recommends the buffer, saying the MAX-buffer recommendation is ruled out of V1 by path step 5 because the floor ladder's first rung is already the cushion, pointing at the design record's section 7, and saying nothing else in the document is superseded. Its two other advocacy lines, item 7 under What is solid and the line under What this implies, were left standing: the instruction is one line and the recommendation section is where the recommendation lives.

**The 540 check.** `grep '540' apps/hungry-grave/CONTEXT.md` returns nothing at all, zero occurrences, so the disagreement the handoff's open item 4 carries no longer exists. **Nothing was edited for it and the item is closed as already fixed rather than carried forward.**

**The two records were already committed.** `45a25ee6eb` put `docs/design/show-what-you-have.md` and `docs/research/portrait-hud-and-catchable-loss.md` in version control with the prompts. Neither was added and neither was edited.

**The four constants, each read off the tree and untouched.** `WITNESS_VERSION` 10 (`src/game/witness.ts:177`), `READINGS_VERSION` 7 (`src/dev/readingsVersion.ts:159`), `FORMAT_VERSION` 4 (`src/tape/wireCodes.ts:50`), `GOLDEN`'s checksum `1307518644` (`src/dev/digest.ts`). Section 2 carries what that means for slice M1's permitted moves.

**The word after the amendment, and which occurrences are deliberate.** Across `docs/` and `apps/hungry-grave/docs/`, the sentences that say a rung is carried by a line's projectiles are gone from ADR 0054, `CONTEXT.md` and `game-concept.md`. What remains and is deliberate: ADR 0054's own amendment paragraph and the design record's R8, both of which name the changed word to change it; `visible-ladder-precedent.md`'s survey prose and its dated recommendation, now carrying the superseding line; `decisions.md` entry 18, which records what Mark chose on 2026-09-07 and is frozen; and every "storm of your own projectiles" in `VISION.md`, `game-concept.md` and `first-dig-2026-08-17.md`, which is the storm and not the rung.

**One more record put the HUD inside the field frame, and a third docs commit amends it.** ADR 0061, Mark's ruling of 2026-09-09 that six words move to the genre's vocabulary, described its sixth term as "the readout inside the field frame". The slice first left it, on the reasoning that amending a second Mark-ruled ADR was not its own ruling to take and that R9 names `CONTEXT.md`'s entry alone; **the orchestrator ruled on 2026-09-16 that it is the same question and takes the same answer**, so the clause now reads "the readout at the field's top edge" and the record carries a dated triple ending in ADR 0058's overrule line, exactly as ADR 0054 does. **It is the sixth term and not the fifth**, which this note said in its first draft and which the instruction repeated back; the fifth is the drop becoming the power-up. `six-words-realigned-to-the-genre.md` quotes both that ADR and the old HUD entry, and a research record quoting the state at its own date is left as it stands.

**CodeRabbit was not run.** The contract's one iteration is the step before a code commit and this slice has none.

**Verification, with results.**

1. `pnpm verify` green at the repo root, twice on the committed tree: format, lint, typecheck and both apps' suites. `apps/hungry-grave` 147 test files, 2166 passed, 11 expected fail and 2 todo of 2179; `apps/housewarming` 7 files and 83 tests.
2. The test-name diff, **0 added and 0 removed**, 2177 names on both sides, against a baseline captured off the clean tip into `local/step5/step5-0-baseline.json` before the first edit. **The 2177 against the run's 2179 is `vitest list` not printing a `test.todo`**, and there are exactly two static ones (`swallow.test.ts`, `palette.test.ts`); both sides were captured the same way, so the assertion is unaffected.
3. The greps: the amended word above, and "540" in `CONTEXT.md` at zero occurrences.
4. The four constants above, each read off the tree with its file.
5. **Human (Mark), open and blocking nothing.** Three of his ADRs are amended by this slice and all three carry the overrule line inside them: **ADR 0054** on the field channel's word, **ADR 0002** on the score's inputs, which is his own ruling of the same day written down, and **ADR 0061** on where the renamed readout sits. He reads them on the branch and each is his to overrule before merge.

**The design record's section 7 list does not name ADR 0061 or ADR 0002, and this slice could not add them.** `show-what-you-have.md` was open and uncommitted in the worktree through the whole slice, carrying another session's in-flight rewrite of R4, so staging it would have swept that work into a docs commit about an ADR. **The line the list wants is that ADR 0002 and ADR 0061 are amended by step 5.0 beside ADR 0054, all three under one-push and all three his to overrule before merge**, and it belongs to whoever commits that file next.

**A second docs commit, from a ruling Mark made while the slice ran** (2026-09-16, the prompt's fifth ruling and its item (b2), added to the block after the slice opened). **ADR 0002's score clause is superseded in place**, number, title and filename unmoved: the score is one number fed by several inputs and a kill is the first of them rather than the whole of it, his words quoted inside the paragraph, with what stood the score as a run's worth in one number and a kill paying it and overflow still converting, what it replaced "score is kills" as the definition here and in decision log entry 10, and what it could not have known that nothing had ever scored a boss's damage, the Waking's source or a meal taken at full size, and that no run had been set beside another player's (#135). **The decision log itself is frozen and was not edited**; the entry is named inside the ADR, which is the canonical record. **The Score entry written earlier in this section was closing the list at two** and now reads as several inputs with the two built first and the rest open. **`floor-ladder-precedent.md`'s Sonic sentence is corrected**: the rings are not the score, they sit beside it as their own counter that the HUD flashes at zero, so what matches is the mechanism rather than the double duty, and the double duty is ours. Same five verification steps, same figures, and the four constants are untouched again.

**Left for later slices, each named.** The Treasure entry's list of two kinds, for **slice M5**, which creates the fourth. The shove and the impulse glossary entries, **round two's** (handoff open item 9), untouched here. `game-concept.md`'s "a slim strip carries the score" still uses a word the HUD entry's Avoid list bans, which is the follow-up docs pass's and not this commit's.

## 7. Slice M1: a kill pays score, and a bled rung stays bled until the grave grows (#99)

Two code commits, `2c7a281657` the fold and `11483ecf31` the score and the ladder, plus this note. **21 files across the two**, against the prompt's realistic 14 to 22. The test-name diff against a baseline captured at `3b1025813d` before the first edit reads **2177 names in the baseline, 2193 now: 17 added, 1 removed**, and the one removed is `holds twenty-two identities against twenty-three checks` renamed to twenty-three against twenty-four.

### The score row, and the one number this slice picked

**`TRASH_KILL_SCORE` is 100 and it lives in `tuning.ts` beside `TRASH_CORPSE_PAYOUT`**, whose own comment is "The unit of food. Every mob's payout is stated as a multiple of this". The score row is `scorePayout` on `MobRow`, beside `corpsePayout`, one per type, so a body with no score payout is a state the type refuses.

**What the rows are set against is health, and what the unit is set against is the genre.** The multiple is the whole number of mow bodies the body's health is worth, floored so no row pays more than it cost to take down: shambler 1 at 8 health, ghoul 2 at 20 with the half discarded, revenant 8 at 64. **The cairn is the one row that does not follow it**, at 1 rather than the 275 its 2206 health would buy, for the same reason its corpse payout is trash: the rule would make grinding the curtain down the best-paying play in the game and retire the belch as its key, which is what ADR 0042 puts at the centre of that set piece. The unit itself is the only figure with nothing to measure against, because nothing can measure what a kill should pay before kills pay anything; a round hundred for the commonest body is the genre's own convention and it keeps the number legible beside the overflow's fractions.

**It is a first figure and it is open.** What it gets tuned against is the score a whole run ends on and the ladder's own cost, which is M6's reading. The batch figures below are the first measurement of either.

### The payment site, and the bodies with no row

**A kill pays in `damageMob` (`mobs.ts`), where the kill is resolved, and never at the swallow.** One line, `state.score += row.scorePayout`, beside the corpse the kill leaves.

**The gap, annotated rather than filled: the boss and the set piece's source pay nothing.** `damageStormTarget` (`stormTargets.ts`) routes to three places, `damageMob` for a `MOB_TYPES` row, `damageBoss` (`bosses/phases.ts`) and `damageSetPiece`, and the last two have no mob row at all. **Neither was given a payout**, on the cited-future rule: boss damage and the Waking's source killed are two of the further inputs Mark named on 2026-09-16 and they are slice M7's, so a payout built here would be built ahead of the slice that rules what they pay.

**Every other site that clears `alive` was checked and only one of them is a body the player was looking at.** `cullMobs` takes a mob off the bottom edge and costs the player nothing, and `offer.ts`'s `vanishSiblings` takes the two offer bodies the grave did not pass under. **Neither pays score, nothing died at either, and `offer.test.ts` has a test that says so.** The rest are shots, skulls, wisps, patches and corpses, none of which is a kill.

### The memory, its two sites, and the growth measured at every clear

**`grave.scoreRungBled`, a boolean on `Grave` beside `invulnerable`.** Set in `runFloorLadder` on **any** ladder run, the one that bleeds and the one that strips alike, so a floor hit that finds no score cannot leave the rung re-armable by the next kill. Cleared inside `growGrave`, which is where growth lands, so `swallow.ts` was not opened for the ladder's rule at all.

**The clear's predicate, quoted as it reads in the code**: `if (grave.size >= SCORE_RUNG_REARM_SIZE) grave.scoreRungBled = false;`, where `SCORE_RUNG_REARM_SIZE = SIZE_FLOOR + HIT_SHRINK`, 21 against a floor of 18.

**The growth measured at every clear, over one run rather than argued.** Loose-far seed 905, read tick by tick off its own tape: the rung was bled at **tick 6618** by a bleed of 7700 and **cleared at tick 11272 at size 49.41**, 4654 ticks and 78 seconds later, on a boss feast of 30.375 at freshness 1. It was bled again at **tick 21956** by a bleed of 19903.29, stripped 3 lines at **tick 30195**, and **cleared at tick 31987 at size 48.375**, again on a feast. **Both clears came off a feast and neither came off the mow**, which is the threshold doing exactly what R4 says it is for: the grave had crept to 19.03 on crumbs without crossing 21, and one real meal took it across. Steady-far seed 903 is the other half of the picture: bled at tick 21601, stripped at 21625 twenty-four ticks later, and **sealed at 21938 with the rung never cleared at all**.

### The invariant, and the fault identity

**`checkScoreRung` sits beside `checkSize` in `invariants.ts`**, which is where a reader looks for the floor, and runs second in `checkInvariants` right after it. The state it refuses is the memory still set at a size that has already bought it back, `scoreRungBled && size >= SCORE_RUNG_REARM_SIZE`. **A crumb above the floor is deliberately not a fault**, because the mark is meant to survive every growth short of a full hit's worth, and the test asserts both halves so the check cannot degrade into a bare floor comparison.

**One fault identity was appended and it was needed.** `score rung re-armed by growth`, at the end of `FAULT_IDENTITIES`, severity **recoverable** on the bank's own reading: the size, the score and the levels are each still exactly what the rules wrote and nothing downstream reads a poisoned value, so what the fault costs is a cushion the player cannot see and ending the run over it would be the worse answer. **The counts `faults.ts`'s own prose carries moved with it**: the header's "Twenty-two identities against twenty-three checks" reads twenty-three against twenty-four, and the severity table's "Recoverable, sixteen checks and sixteen identities" reads seventeen and seventeen. The fatal count did not move and neither did any existing identity's severity or wire code.

### The witness, and where the field sits in the fold

**`WITNESS_VERSION` 10 to 11, in `2c7a281657`, declaring one field.** `grave.scoreRungBled` folds through `boolCode` **appended after `invulnerable`** in `foldGrave`, because a widening appends and never reshuffles what is already in place. Its entry sits in `witness.test.ts`'s `ENTITY_CASES` beside `grave.invulnerable` with its own move and restore, and its path in `FOLDED` in the same position, and `fillGrave` sets it to a value the blank grave does not carry so a fold that never reached the field could not pass the perturbation by accident.

**What the move costs is in the version's own dated paragraph and in section 2 above.**

### The readings

**`READINGS_VERSION` 7 to 8, in `11483ecf31`, the same commit as the score change.** Version 8's note, quoted from `readingsVersion.ts`: "`run.score` used to mean growth past the size ceiling alone, because overflow was the only thing in the whole simulation that wrote it. It now means the kills a run made plus that same overflow, from their own rows on the mob table." And: "**So every batch recorded before this commit is incomparable with every batch recorded after it on that key**."

**`tuning.damageTaken.scoreBled` moves with it, decided by reading it rather than by assuming either way.** Its own comment is "how often it bled the score, and the score it took", so it is denominated in the quantity that changed: a version-7 figure and a version-8 one are sums of two different compositions. **`scoreBleeds` beside it does not move**, because it counts bleeds and a bleed is still a bleed.

**What was checked for the same exposure.** Every declared reading in `batchReport.ts` and `compareRuns.ts` was read, and `run.score` and `tuning.damageTaken.scoreBled` are the only two denominated in score at all. `scoreBleeds`, `weaponStrips`, `linesStripped`, `seals`, `totalHits` and `hits` keep their exact meanings and read larger numbers, which never moves this version. `MeasureReport.score` (`measure.ts`) and `ReplayTallies.score` (`replayTallies.ts`) ride on `run.score` and are the same change under another name rather than a second one.

### The batch, and the floor-hit split

**Seeds 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig, 12 of 12 verified, none unverified, none unfinished, `readingsVersion` 8 on both**, recorded at `11483ecf31`.

**`run.score`, the number a run ends on**, which is the score that survived the ladder rather than the score a run made. Steady-far: 0, 100, 100, 1700, 3911.32, 700. Loose-far: 4500, 0, 1300, 4200, 500, 22611.67. **The fractions are the overflow input still paying**, beside the kills' round hundreds.

**`tuning.damageTaken.scoreBled`, the score the ladder took, which is the larger number by two orders of magnitude.** Steady-far: 13600, 14800.94, 20500.76, 33002.40, 54201.08, 15100. Loose-far: 14806.89, 26804.29, 18403.14, 32301.47, 11900.35, 27603.29.

**Say it plainly: both of those are incomparable with every earlier batch's own `run.score` and `scoreBled`**, and subtracting one build's from the other's would be arithmetic across a definition that changed underneath it. That is what `READINGS_VERSION` 8 exists to make loud.

**The floor hits per run and what each one cost**, as bleeds, strips and seals. Every one of the twelve runs bled the score rung, which under overflow alone was reachable only in a run that had reached the size ceiling.

| Configuration | Seed | Bleeds | Strips | Line-levels taken | Seals | Floor hits |
| --- | --- | --- | --- | --- | --- | --- |
| steady-far | 900 | 1 | 0 | 0 | 1 | 2 |
| steady-far | 901 | 1 | 0 | 0 | 1 | 2 |
| steady-far | 902 | 1 | 0 | 0 | 1 | 2 |
| steady-far | 903 | 1 | 1 | 2 | 1 | 3 |
| steady-far | 904 | 1 | 0 | 0 | 0 | 1 |
| steady-far | 905 | 1 | 0 | 0 | 1 | 2 |
| loose-far | 900 | 1 | 0 | 0 | 1 | 2 |
| loose-far | 901 | 1 | 1 | 2 | 1 | 3 |
| loose-far | 902 | 1 | 1 | 1 | 1 | 3 |
| loose-far | 903 | 1 | 1 | 2 | 1 | 3 |
| loose-far | 904 | 1 | 0 | 0 | 1 | 2 |
| loose-far | 905 | 2 | 1 | 3 | 0 | 3 |

**R4's claim is that the strip is now reachable in ordinary play, and the measurement is that it is reachable and still uncommon**: 5 of 12 runs stripped a rung, 1 of 6 under `steady-far` and 4 of 6 under `loose-far`. **One run re-armed and bled twice**, loose-far 905, which is the clear measured above. **The bot is not a player and these are its numbers, not a hand's**: it only dodges and never dives, so the clear is rarer here than it would be for somebody playing for it.

### Verification, step by step

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/` at both commits, and **`pnpm verify` green twice at the repo root on the committed tree**, 147 test files, 2182 passed, 11 expected fail, 2 todo, both times.
2. **Agent.** The test-name diff, both figures, above.
3. **Agent.** `WITNESS_VERSION` **11**, `READINGS_VERSION` **8**, `FORMAT_VERSION` **4** held, each read off the tree at the committed tip, with what each move costs in section 2.
4. **Agent.** Both `GOLDEN` re-pins, with the isolation run and the arithmetic, in section 3.
5. **Agent.** A pre-fold tape refused by its version rather than diverging: `local/round2/j3-hand-404-prebuild.tape`, `outcome: 'witnessVersionMismatch'`, tape 10 against reader 11.
6. **Agent.** Replay determinism, seed 909 under `shaky-short` played twice: **identical tick counts at 5997, identical byte lengths at 56419, and three differing bytes at offsets 219 to 221**, which decoding both headers confirms is `recordedAt` alone. All **100 checkpoints, every command, the trailer and the observations are byte-identical**, and both tapes verify. **A conditioned tape at the ladder rig**, seed 404 at 6000 ticks with every line pinned to 5, measures to **`outcome: 'verified'`** at `readingsVersion` 8, and carries the rule whole: 5 hits, one bleed of 5200, one strip of 4 line-levels, no seal.
7. **Agent.** The batch and the floor-hit split, above, with the incomparability stated.
8. **Agent.** The fences green, all five files and 84 tests, each named by title. `boundary.test.ts`: *the rendering-import boundary*, *the test-span fence*, *the screen graph is declared in one place*, *the engine accessor is out of the app*, *the core has no import cycle*, slice D's sixth *the cap derivation reads tables and never the stage*, *the lock is owned by a module with nothing behind it* and *the tape codec parses a header without the director*. `lineAgnosticPolicies.test.ts`: *no weapon line walks the mob pool*, *a policy names no weapon line*, *no boss and no set piece names a weapon line*, *only the offer draws from the power-ups stream* and *one module draws each stream*. `executionFence.test.ts`: *the step fence (ADR 0017)*. `harnessStatesNoTarget.test.ts`: *the harness reports and never judges*. `comparisonDeclared.test.ts`, which lives at `src/dev/__tests__/` and not at `src/__tests__/` where the contract's list reads: *every reading declares what comparing it means*. **The core's cycle guard is green with `KNOWN_CORE_CYCLES` still empty** (`boundary.test.ts`, the list is `[]` and the assertion compares against it).
9. **Human (Mark), and it blocked nothing.** The record's section 7 first finding is his read on the deploy after the HUD lands, not after this slice, and nothing here draws.

### What is left for a later slice, and what was not touched

**Nothing under `src/app` was opened except one test fixture**, `GraveRenderer.test.ts`'s grave literal, which gained the new field because the type requires it. No renderer, no HUD, no layout.

**The memory is exposed on `Grave` for slice M3**, which draws the score as spent while it is set. Between this slice and M3 nothing draws the score at all.

**M7 owns the further score inputs**, boss damage, the Waking's source killed and large food after full power, and the two kill paths with no mob row named above are its gap to close.

**M6 owns the reading.** The floor-hit split above is a measurement in this note and nothing declares it.

### Measured baselines that moved, each re-measured with its reason

**`bot.test.ts`'s `BLEEDS_SCORE` went from `[101, 202, 404]` to all five seeds.** What moved is where the score comes from and not the ladder: a ceiling grave only overflows while it is full, and 303 and 505 were taken off the ceiling before they had overflowed once, so they used to arrive at the floor with nothing to bleed. A kill pays now and no run reaches the floor empty. The reason is written beside the constant.

**`endings.test.ts`'s ladder-in-a-fight test moved twice, and neither is a weakening.** The bleed's own amount is now `SCORE_BROUGHT_TO_THE_FIGHT + SCORE_EARNED_INSIDE_THE_FIGHT`, the second re-measured at **300**, three mow bodies falling to this build between the phase starting and the grave reaching the floor, pinned with its reason beside it. And `expect(fight.state.score).toBe(0)` after the run became `expect(leftByTheBleed).toBe(0)`, captured on the tick the bleed fired: **the rung still bleeds whole, and the end of the run can no longer say so** because the score goes on rising from kills afterwards. The promise is asserted at the moment it is about rather than at a moment that can no longer carry it.

**`harnessPolicy.test.ts`'s per-seed baselines did not move**, and neither did `measure.test.ts`, `replayTallies`' tests or `swallow.test.ts`. The prompt expected all four to be candidates; they were checked by running them and they are green unchanged.

### An anomaly, and it is not this slice's

**Two documentation files were uncommitted and modified in the shared worktree for the whole of this slice, by something other than M1**: `docs/design/show-what-you-have.md` and `docs/push/step-5-slice-prompts.md`. The edits are substantive and are about R1's cost arithmetic, the `svh` inset handling and slice M2's own block. **Nothing here touched either file and neither entered either commit**, every path was staged by name. They are the reason both CodeRabbit runs list two files M1 never opened, and the reason every tape and batch this slice recorded carries a dirty build identity. **Recorded rather than acted on**: an in-flight edit by another agent is not M1's to commit, revert or review.

### M1-fix: the bleed is capped (#99), `f98c01767d`

**Mark ruled it in two words on 2026-09-16, "Cap the bleed", and this is the whole of the slice.** A hit at the size floor now takes the lesser of the standing score and a flat cap, and the remainder stays. ADR 0003's order is untouched: the score rung is still spent before any level, `scoreBled` still fires once per armed rung, M1's bled-rung memory still sets on any ladder run, and the second floor hit while small still strips. **12 files in the one code commit**, inside the prompt's realistic 8 to 12. **The test-name diff against a baseline captured at `25e229866a` before the first edit reads 2275 names in the baseline and 2277 now, 5 added and 3 removed**, and all three removed are renames of the same promise under the new rule: two in `watchedLoss.test.ts` and `a hit at the size floor with score standing bleeds the score and takes no level` in `grave.test.ts`, which split into the above-cap and below-cap pair.

#### The cap, where in the band it sits, and what it was set against

**`SCORE_BLEED_CAP` is `20 * TRASH_KILL_SCORE`, 2,000 points, in `tuning.ts` beside `TRASH_KILL_SCORE`** and stated as a multiple of it exactly as every mob row's `scorePayout` is. Twenty trash kills, about eight seconds of mowing at the storm's measured 2.47 kills a second.

**It sits below the band's midpoint on purpose, and the early window is what put it there.** The research's band is 10 to 40 trash kills and its midpoint is 25. Until a run's score first crosses the cap the cap does not exist for the player at all and the first floor hit still takes everything, so the lower the figure the sooner the rule is real. **Measured rather than argued: every one of the twelve batch runs crossed 2,000 between tick 2,244 and tick 4,103, 5.4 to 20.4 percent of its own length, and the earliest first floor hit in the twelve landed at tick 6,618.** So at this value no measured run ever met the floor before the cap was real, and the early window never bit. At 40 trash kills the crossing would sit two to three times later and that stops being true.

**What keeps it off the bottom of the band is the same evidence the band was drawn from**: below 10 trash kills the rung reads as free, which is Great Mahou Daisakusen's own named failure. **What it gets tuned against is M6's bleeds and strips per run, and it is re-read after M7 rather than against M6 alone**, because the band's upper end is argued against a run's gross and M7's boss damage, source kill and rich swallow all pay into that gross. The JSDoc carries all of this beside the row, annotated as a first figure.

#### The lesser-of, and the invariant deliberately not added

**`bleedScore` reads `Math.min(state.score, SCORE_BLEED_CAP)`, subtracts it, and fires `scoreBled` carrying what it took and what is left standing.** **No invariant was added and the absence is the decision**: the remainder cannot go negative because the lesser-of makes that state unreachable rather than merely unlikely, and a check for a state the arithmetic cannot produce would be noise under the deletion test. The two ladder tests that pin the lesser-of, above the cap and below it, are what guard it, and `bleedScore`'s own JSDoc carries the one sentence saying so.

#### Every comment that went false, found by content

**Four the prompt named, each rewritten.** `bleedScore`'s "The whole score, gone. The score tier is exactly one rung, so it never partly bleeds" is now a JSDoc naming the lesser-of and the remainder. `runFloorLadder`'s "it bleeds all of the score" reads "it bleeds a capped slice of the score". `ScoreBled`'s "the whole score, gone" reads "a capped slice of the score, gone", with the widened field's reason beside it. `endings.test.ts`'s ruling comment "Score first, and the whole of it: the score tier is one rung and never partly bleeds" reads "Score first, and the lesser of what stood and the cap: the score tier is one rung whatever it paid, and the remainder stays".

**Five more found by grepping the claim rather than trusting the list.** `watchedLoss.ts`'s own lifetime JSDoc said "The sim sets the score to zero in one tick", now "takes the bleed in one tick". `grave.test.ts` carried the claim twice, in the ladder-order test's rung-one comment and in the first-rung test's own. `endings.test.ts` carried it twice more, in `SCORE_BROUGHT_TO_THE_FIGHT`'s JSDoc and in `SCORE_EARNED_INSIDE_THE_FIGHT`'s, both of which argued that the figure did not matter because the rung bleeds whole. `screenLifecycle.test.ts`'s ladder test said "the sim zeroes the score in one tick". All five now read the new rule.

**Three stale sentences in `docs/` were found and left alone, because prose outside this slice's own records is a later docs pass's** (the contract's what-is-never-your-job list). `docs/design/stage-floor.md` says a floor hit "bleeds the whole score"; `docs/design/dispatch-3a-sim-core.md` says it twice, once as a rejected alternative arguing that "a fixed amount makes the ladder's length depend on a magnitude the tests are forbidden to know". **That old objection is answered rather than ignored**: R4's bled-rung memory spends the rung once per arming whatever it paid, so the ladder's length is seven hits at any cap, which `grave.test.ts`'s finiteness test now asserts with a score a hundred times the cap. `docs/design/show-what-you-have.md` section 3.2 also still says `runFloorLadder` "bleeds the whole score", and **the design record is not edited by the slice dispatched against it**, so it is recorded here.

#### The countdown's start, the seam, and M4's superseded sentence

**`ScoreBled` gained one field, `score`, the remainder left standing, which is exactly `Overflowed`'s own `{ amount, score }` shape.** `watchLoss` reads `event.amount + event.score` as the score that stood before the hit, so the view is handed the event's own arithmetic and still diffs nothing. The transient's field is renamed from `amount` to `from` for the same reason: what the digits fall from is no longer what was taken.

**R5's shape does not move.** 40 ticks, linear, the midpoint reading about halfway, targeting the live score, told by the event. Only the start moved, from the slice taken to the score that stood, because the old expression would have jumped the digits down to the slice and then climbed them back to the remainder.

**M4's prompt says the three ladder events stay three and none changes shape, and this slice supersedes the second half of that sentence for this one case.** What stood: three events rather than one ladder event, `weaponStripped` and `sealed` untouched, and nothing added, removed or merged. What changed: `scoreBled` carries what it left beside what it took. What M4 could not have known: it was written while a bleed took the whole score, so the amount and the pre-hit score were the same number and a view could not tell them apart.

**Widening the event costs no version**, and `readingsVersion.ts`'s own version-8 paragraph is why: "no sim event is ever encoded into a tape at all". The event is in no wire code map and `damageTaken` reads only `.amount`.

#### ADR 0003 and `CONTEXT.md`

**ADR 0003 is amended in place, number, title and filename unmoved.** The triple in one sentence: what stood is the ladder's order and the floor never being immortality, what changed is the amount alone, and what it could not have known is that nothing paid score for a kill when it was written, so a whole bleed had nothing to take. It quotes "Cap the bleed" and ends with the overrule line: *"This amendment is taken by the dispatching session under the one-push rule, and it is Mark's to overrule on the branch before merge."*

**`CONTEXT.md`'s Score entry, before**: "a hit at the size floor bleeding the whole of it before any weapon level goes". **After**: "a hit at the size floor bleeding a capped slice of it before any weapon level goes", with the file's own dated amendment paragraph under it.

**The Size floor entry was checked and left alone, and here is the decision.** It names the order and not the amount, and its one clause worth weighing is "only when nothing is left to bleed does the next hit seal the grave shut". **That clause is about the rung being spent rather than the score reading zero, and it was already loose before this slice**: M1's bled-rung memory means kills keep paying while the grave is at the floor, and M1's own batch has `steady-far` 903 sealing while holding 1,700. So the cap does not make it false. **Filed rather than fixed**: the same clause sits in ADR 0003's own sentence and rewording it would be a ruling rather than an amount, which this slice is not permitted.

#### The batch: what the ladder takes, before and after

**Seeds 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig, 12 of 12 verified, `readingsVersion` 8 on both, recorded on the committed tree at `f98c01767d` with a clean build identity.** The before column is slice M1's own batch at `11483ecf31`.

| | `scoreBled`, before | `scoreBled`, after | `run.score`, before | `run.score`, after |
| --- | --- | --- | --- | --- |
| steady-far 900 | 13600 | **2000** | 0 | **11600** |
| steady-far 901 | 14800.94 | **2000** | 100 | **12900.94** |
| steady-far 902 | 20500.76 | **2000** | 100 | **18600.76** |
| steady-far 903 | 33002.40 | **2000** | 1700 | **36002.40** |
| steady-far 904 | 54201.08 | **2000** | 3911.32 | **56112.39** |
| steady-far 905 | 15100 | **2000** | 700 | **13800** |
| loose-far 900 | 14806.89 | **2000** | 4500 | **17306.89** |
| loose-far 901 | 26804.29 | **2000** | 0 | **24804.29** |
| loose-far 902 | 18403.14 | **2000** | 1300 | **35403.14** |
| loose-far 903 | 32301.47 | **2000** | 4200 | **34501.47** |
| loose-far 904 | 11900.35 | **2000** | 500 | **10400.35** |
| loose-far 905 | 27603.29 | **4000** | 22611.67 | **48415.54** |

**Said plainly: the ladder took 87.7 percent of everything the twelve runs made and it now takes 7.5 percent**, 26,000 points of 345,848 gross against 283,025 of 322,648 before. **Runs ending holding nothing went from 2 of 12 to 0 of 12.** Eleven runs bled once and paid exactly the cap; `loose-far` 905 bled twice and paid 4,000, which is the one run that re-armed the rung by growing.

**The gross a run makes is untouched by the cap, and nine of the twelve say so exactly.** Adding each run's ending score to what its ladder took gives a figure identical to M1's own in nine of the twelve seeds, to within a hundredth of a point. **The three that differ are slice M5's and M5-fix's, not this slice's**: `steady-far` 903, `loose-far` 902 and `loose-far` 905 are runs where a fallen rung now stands on the field and changes what the harness's nearest-food rule steers at, which M5-fix's own note records (`loose-far` 902 going from 21,326 ticks to 29,853, and this batch reads 29,853).

**Every run crossed the cap long before it met the floor.** Crossing ticks: `steady-far` 2244, 2996, 4103, 2411, 3445, 3864; `loose-far` 2388, 3227, 3054, 2410, 3031, 2356. The earliest first floor hit across the twelve is `loose-far` 905 at tick 6,618.

#### The event sequence, measured rather than assumed

**It is identical, and the measurement is against the tip the cap landed on rather than against M1's table.** M5 and M5-fix changed these runs after M1 measured them, so M1's floor-hit split is not a like-for-like before.

- **The strips and the rungs match M5-fix's own batch exactly on the same twelve seeds: 11 strips and 17 rungs fallen**, and `loose-far` 902 ends at 29,853 ticks, which is M5-fix's own recorded figure to the tick.
- **The bleed and strip ticks match M1's recorded ticks where M1 wrote them out.** `loose-far` 905 bled at 6,618 and again at 21,956, `steady-far` 903 bled at 21,601 and stripped at 21,625: the same four ticks M1's note carries.
- **The conditioned ladder tape carries the rule whole and unchanged**: seed 404 at 6,000 ticks with every line pinned to 5 measures to `outcome: 'verified'` at `readingsVersion` 8, with 5 hits, one bleed, one strip of four line-levels and no seal, which is M5's own tape's ladder to the event. **Only the amount moved, 5,200 to 2,000.**

**The branch the prompt's first ruling names did not fire, and it was checked rather than assumed.** `runFloorLadder` arms the bleed on `state.score > 0`, so a run could in principle strip before and bleed now. It never happens in the twelve: every bleed found thousands standing on both builds, and the pre-cap run that could have hit it, `loose-far` 905's second bleed, took 19,903 points at the same tick under M1.

#### The pre-cap tape, which diverges rather than being refused

**`local/step5/m5-ladder-a.tape`, recorded at M5's tip before the cap, replays at this tip to `outcome: 'diverged'`, first divergent checkpoint 2520, 42 checkpoints verified, 2520 ticks reproduced.** **That is the expected outcome and not a fault**: `run.score` has been folded into the witness since long before this, the cap changes what it holds after a bleed, and no folded field was added, so `witness.ts`'s own rule keeps the version still. A refusal would have meant a version move and there is none to make.

**The divergence is the cap's and the arithmetic says so.** M5's note records that tape's only strip dropping its four rungs at tick 2,628, so nothing M5-fix changed can have acted by checkpoint 2520; the bleed is the one event before it that this slice touches.

#### Replay determinism at this tip

**Seed 909 under `shaky-short`, played twice on the committed tree: 5,997 ticks both times, 56,402 bytes both times, and three differing bytes at offsets 202 to 204.** Decoding both headers says those three are `recordedAt` alone: all 5,997 commands, all 100 checkpoints, the trailer and the observations are byte-identical, and both tapes verify. **The byte length moved from the 56,419 M1 and M5 both recorded for this seed**, which is the varint encoding of the folded score reading a different number after the bleed, not a change in what is recorded.

#### The bot's bias, and the direction the figures are off in

**The bot is not a player: it only dodges and never dives**, so it re-arms the score rung rarely, and one run in twelve did so here. **A diving hand re-arms more often, so it bleeds more times and strips fewer.** So the 7.5 percent share above is **a floor for what bleeds cost a player and a ceiling for what strips cost them**, and the twelve runs' single bleed apiece is the low end of what a hand would pay. **None of this is a reason to skip Mark's own play**, which is what settles the value.

#### `READINGS_VERSION` held at 8, with the rule quoted

**It does not move and `readingsVersion.ts` is not in either commit.** `scoreBled`'s `amount` still means what was taken and `tuning.damageTaken.scoreBled` still sums exactly that, so the key reads a smaller number without meaning anything new, which is the case version 8's own paragraph already writes out: *"a key that merely reads a different number never moves this"*. `run.score` keeps version 8's meaning, the kills a run made plus the overflow, because the cap changes what the ladder takes and never what the score is made of. **No reading was found whose meaning genuinely moved.**

#### The four constants and `GOLDEN`, read off this slice's own tip

**`WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4, and `GOLDEN`'s checksum `-2049717150`**, each read off the tree before the first edit and unchanged after the last. **None of `witness.ts`, `readingsVersion.ts`, `wireCodes.ts` or `digest.ts` is in either commit.** `digest.test.ts` was green at every run, which the scenario's own numbers explain: it ends at size 24.10125 against a floor of 18, so `runFloorLadder` is never called in it and the cap can never fire.

#### CodeRabbit, one iteration

**`coderabbit review --agent --uncommitted` from the worktree root with all twelve files staged by path: 12 files reviewed, zero findings.** Nothing applied and nothing declined. The worktree held no other agent's edits this time.

#### Verification

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, and **`pnpm verify` green twice at the repo root on the committed tree**, 149 test files, 2266 passed, 11 expected fail, 2 todo, both times. The build's two warnings are the pre-existing #50 and #51.
2. **Agent.** The test-name diff, both figures, above.
3. **Agent.** The four constants and `GOLDEN`, above, none of their files in either commit.
4. **Agent.** The batch, before and after, above, with the crossing ticks.
5. **Agent.** The event sequence, above, measured against M5-fix's tip and M1's recorded ticks.
6. **Agent.** Replay determinism, the conditioned tape at `outcome: 'verified'`, and the pre-cap tape diverging at checkpoint 2520, all above.
7. **Agent.** The fences green, each by title. `boundary.test.ts`: *the rendering-import boundary*, *the test-span fence*, *the screen graph is declared in one place*, *the engine accessor is out of the app*, *the core has no import cycle*, slice D's sixth *the cap derivation reads tables and never the stage*, *the lock is owned by a module with nothing behind it* and *the tape codec parses a header without the director*. `lineAgnosticPolicies.test.ts`: *no weapon line walks the mob pool*, *a policy names no weapon line*, *no boss and no set piece names a weapon line*, *a line's constants are declared in that line's own module*, *only the offer draws from the power-ups stream* and *one module draws each stream*. `executionFence.test.ts`: *the step fence (ADR 0017)*. `harnessStatesNoTarget.test.ts`: *the harness reports and never judges*. `comparisonDeclared.test.ts` at `src/dev/__tests__/`: *every reading declares what comparing it means*. **The core's cycle guard is green with `KNOWN_CORE_CYCLES` still `[]`.**
8. **Human (Mark), open and blocking nothing.** Whether 2,000 is the right cost for a floor hit, and whether a slice taken off a large score is seen to leave at all. **The deploy that puts it in front of him is the orchestrator's.**

#### The announcement's own lever, left unbuilt and named

**On a late score the falling digits carry much less than they did.** A 2,000 cap off a standing 22,000 moves about fifty points a tick over the countdown's 40, so the leading digits barely move and only the trailing three churn. That is the ruling's own consequence rather than a defect, and this slice does not design around it.

**The lever, if his play says the loss is not seen**: a delta readout beside the digits, or the skull stream's blow-up firing on a bleed the way it already fires on a strip. **Sonic Mania is the precedent and it is exactly this problem**: its `Ring_LoseRings` builds a third group of purely decorative rings with no collision at all, so a sixty-ring hit looks worse than a thirty-five-ring hit and is worth the same to recover. The announcement is sized independently of what was lost. **Neither is built here and both are one small piece of view work.**

#### What was expected to turn red and did not, each checked by running it

**`bot.test.ts`'s `BLEEDS_SCORE` did not move**, and neither did `harnessPolicy.test.ts`'s measured baselines: the runs did not diverge, which the batch above says in full. **`mobs.test.ts`'s R4 pair and `damageTaken.test.ts`'s ladder fixture stayed green unchanged** because both hold a score under the cap, 100 and 10, so they exercise the one case that does not change. **`digest.test.ts` stayed green.** Nothing was re-pinned anywhere in this slice.

#### What is left for a later slice, each named

**M6 declares the readings.** This note prints the bleeds, the strips, the gross and the crossing tick off a scratch script and declares nothing. **M7 owns the score's other inputs** and is the slice after which the cap row is re-read. **A docs pass owns the three stale prose sentences** named above. **Nothing in the dispatch or in either record was found false against the tree beyond the design record's own section 3.2 sentence**, which is recorded above and was not edited.

**One claim in the dispatch did not survive contact, and it cost nothing.** The prompt says four files are uncommitted in the shared worktree when this slice starts, the design record, the prompts file and an untracked research file among them, and tells the coder to add two of them to the docs commit by path. **The worktree was clean at `25e229866a` and all four were already committed**, the research file included, so this docs commit carries ADR 0003, `CONTEXT.md` and this note alone. Nothing under `src/` was ever dirty. It is the same thing step 5.0 recorded in section 5 about its own two records.


## 8. Slice M2: the frame is composed, and the band is reserved (#72)

One code commit, `0c7f877ad1`, plus this note. **Eight files**, against the prompt's realistic five to seven: four production files (`src/app/layout.ts`, `src/engine/engine.ts`, `src/main.ts`, `public/style.css`) and their four test files. The prompt's own expected-red list names four test files, so the eighth is the count rather than a reach: nothing outside the seams it named was opened. The test-name diff against a baseline captured at `a0ded3962d` before the first edit reads **2193 names in the baseline, 2205 now: 12 added, 0 removed**.

**The band and the mark, as declared.** `HUD_BAND` sits beside `READOUT_RESERVE` in `layout.ts` with two figures in field units, **height 28 and mark 11**, both R1's, and its JSDoc carries the derivation the way `READOUT_RESERVE`'s own comment carries its: the mark is measured first and the band declared from it, 11 being the smallest whole number of field units that clears slice K's 6.25 CSS pixel floor on the narrowest phone the sweep covers, and 28 being what the content needs, an icon of 24 with five marks beside it and two units of padding above and below. **This slice declares the band and asserts nothing at all about its content**, which is M3's half.

**The placement rule, in one sentence.** `hudRow` puts the row in the stage's band above the field where that band is at least the row's own height and over the field's own top edge where it is not, in field units scaled by the placement, with the field's own left edge and the field's own width.

**The slack split, before and after, at three viewports.** iPhone at `svh` 660, stage 540 by 906: **133 above and 13 below becomes 120 and 26**. iPhone at `svh` 700, stage 540 by 961: **161 and 41 becomes 120 and 81**. Pixel 8 at `svh` 750, stage 540 by 983: **172 and 52 becomes 120 and 103**. At `svh` 600 and on the narrow phone it changes nothing at all, 32 / 32 and 8 / 8 before and after, because there the field has no slack to move into and the never-pays-width guard returns the natural fit untouched. The change is one line: where the branch used to return the field centred inside the box below the reserve, it now returns the natural centring pushed down only far enough to clear the reserve.

**`svh` and `resizeTo`, in the one commit, and where the element is named.** `public/style.css` keeps its two-declaration shape, `height: 100vh` then `height: calc(100svh - var(--inset-bottom, 0px))`, and `resizeTo` points at the element through `measuredBox()` in `src/engine/engine.ts`, which is the engine's own `opts.resizeTo ??=` default. **The element is named there rather than in `main.ts`, and that is a choice with a reason**: `#app` and `#pixi-container` are both the page contract the template's own engine already has, `engine.ts` already hardcodes the second of them, and naming the first beside it is the one placement that leaves the seam unit-testable. Naming it in `main.ts` would have put it in a module nothing can import, because an entry point ends in its one call, and the test for "the renderer measures the element rather than the window" would have had to become a source scan. **The engine gained no knowledge of this app**: it learned one more id from the same page it already reads, and a page without that element is measured from the window with a warning that says what it costs.

**The inset's mechanism, written once.** `src/main.ts`'s `reserveBottomSafeArea` is called first inside `main()`, before the engine measures anything. It appends a fixed, zero-width probe whose height is `env(safe-area-inset-bottom, 0px)`, reads the laid-out height, removes the probe, and writes the figure to `--inset-bottom` on the document element. That is the only write of the property and there is no listener, so it cannot be read live: the inset moves with the toolbar on iOS Safari and Chrome Android, and a bare `env()` inside the height would re-fit the field mid-run, which is the movement `svh` is there to stop. `env(safe-area-max-inset-bottom)` is the static value this wants and Safari does not carry it, which is named in the comment as the replacement to take. **A probe rather than a custom property read back through `getComputedStyle`**, because a laid-out element resolves `env()` to a used length in every browser and the substitution rules for `env()` inside a custom property are not worth betting the boot on. A non-finite or negative reading is repaired to zero and says so, which is the repair-by-origin rule for a live environment input.

**The belch's lift is zero in every measurement this slice could take, and that is the whole of what it can say.** Headless Chromium reports no inset, so `--inset-bottom` was read as `0px` in the rendered check and the box lost nothing. What the code does is take the inset out of the box the renderer measures, so every stage unit inside it, the belch's control included, moves up by exactly the reported inset; on an iPhone that is the roughly 34-point home-indicator region the record's section 7 measures the button's bottom edge at 9 CSS pixels inside. **The figure itself is Mark's phone read.**

**The section 3.1 table, re-derived at this tip, and the one row that disagrees.**

| viewport | stage | field scale | side gutter | band top / bottom | belch over field | the row |
| --- | --- | --- | --- | --- | --- | --- |
| iPhone 15, svh 600 | 540x824 | 1.0000 | 0 | 32 / 32 | yes, 88 | outside |
| iPhone 15, svh 660 | 540x906 | 1.0000 | 0 | 120 / 26 | yes, 94 | outside |
| iPhone 15, svh 700 | 540x961 | 1.0000 | 0 | 120 / 81 | yes, 39 | outside |
| iPhone 15, lvh 852 | 540x1170 | 1.0000 | 0 | 205 / 205 | no | outside |
| Pixel 8, svh 750 | 540x983 | 1.0000 | 0 | 120 / 103 | yes, 17 | outside |
| narrow phone, svh 460 | 540x776 | 1.0000 | 0 | 8 / 8 | **yes, 108** | over the field |
| tablet portrait | 820x1180 | 1.5185 | 0 | 12.96 / 12.96 | yes, 107 | over the field |
| narrow desktop | 1024x900 | 1.1842 | 192.26 | 0 / 0 | no | over the field |
| desktop | 1440x900 | 1.1842 | 400.26 | 0 / 0 | no | over the field |

**Every row agrees with the record except the narrow phone's belch overlap, which the record gives as 112 and which measures 108.** 108 is the whole of `BELCH_SIZE`, so 112 is not a number that row can produce: the button is 108 stage units tall and the most of it that can be over the field is all of it. The record's own arithmetic is right everywhere else, the even split's three moved rows land on 94, 39 and 17 exactly as it predicts, and **where the row lands is exactly what R1 says**: outside the field on four of the five `svh` phone rows and over the field on the narrow phone, the portrait tablet and both desktops. The mark's sizes agree to two decimals as well: 6.52 at the narrow phone against the record's 6.5, 8.01 against 8.0, 8.39 against 8.4, 13.03 against 13.0 and 16.70 against 16.7.

**The target floor, at every viewport in the sweep, with the new row.** `BELCH_SIZE` 108 measures **78.00 CSS pixels at 390 by 844, 78.60 at the new 393 by 660, 108.00 at the tablet and 108.00 at the desktop**, against WCAG 2.5.5's 44 at AAA. The mark measures 7.94, 8.01, 16.70 and 13.03 CSS pixels across the same four, against the 6.25 floor. Nothing about the fill reaches the hit area and that test is unchanged and green.

**The rendered check, and what it could not see.** `pnpm build` then `pnpm exec vite preview`, driven with `playwright-cli` against the built app, at 393 by 660 and at 1440 by 900. **`#app` measured 393 by 660 with a canvas buffer of 1080 by 1812 at resolution 2, which is a stage of 540 by 906**, the record's own figure for that viewport, so the element and not the window is what the renderer sized itself from. At the phone a run was played from RISE, ended through the pause menu at 908 ticks, and a second run played on a fresh seed; both sit with the field's top edge 87 CSS pixels down, which is the even split's 120 stage units, and the bottom band at 19, which is its 26. At the desktop the field fills the height with a wide gutter each side and the dev stack, the pause button and the belch all sit outside the field. Zero console errors and seven warnings, all of them the audio autoplay policy and headless Chromium's software renderer, both pre-existing; **no warning came from either of this slice's own fallbacks**, so `#app` was found and the inset read cleanly. **The chrome's retraction cannot be staged here and the check did not try**: headless Chromium has one viewport, `svh` equals `dvh` equals `lvh`, and the inset is zero, so there is nothing to retract and nothing to lift clear of.

**The four constants and `GOLDEN`, all untouched, all read off this tip.** `WITNESS_VERSION` **11** (`src/game/witness.ts`), `READINGS_VERSION` **8** (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` **4** (`src/tape/wireCodes.ts`), `GOLDEN`'s checksum **`-2049717150`** with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` inside it (`src/dev/digest.ts`). **None of the four files is in the commit**, and neither is anything else under `src/game`, `src/dev` or `src/tape`: the commit is `layout.ts`, `engine.ts`, `main.ts`, `style.css` and four test files, every path staged by name. No tape, batch or determinism run is owed and none was taken.

### CodeRabbit, one iteration: 8 files reviewed, 4 findings, none applied and all four declined

**Two of them are one finding at two severities: re-read the safe-area inset on an orientation change.** It is a real gap. A portrait inset is the wrong figure in landscape, and the box would carry the stale one until the page reloads. **Declined because R10 and section 9 ruling 7 rule the read to happen once at boot, and a standing rule says a finding against a ruling is filed rather than applied.** It is also not a defect that hides: an orientation change already re-fits the whole stage through the resize path, so what is stale is the inset alone and never the placement. **Left for a later slice or a ticket**, named here so it is not rediscovered: the fix is one listener on `orientationchange` calling the same function, and it belongs with whoever next opens the entry point's boot story.

**The other two are one finding at two severities as well, and they independently found what this slice had already measured and filed: the HUD's row crosses the pause button at the 820 by 1180 viewport.** The major asks for the row to be resized or moved; the minor asks for the pause button to be moved. **Both declined.** Narrowing the row is what the row cannot do, for the reason below; moving the pause button is Mark's and #38's. **That CodeRabbit found it without being told is worth saying out loud**, because it is the finding this slice most wants his eye on.

### Claims in the prompt or the record found false against the tree

**The prompt's test 4 asks the HUD row's two ends to clear both reserved top corners at every viewport, and no row can.** The rule and its outcome are geometry, not preference. The reserve claims **260 stage units at each end and 120 units deep**; a phone's stage is **540 units wide**, so clearing both corners leaves a row of **20 units**. R1's own content is an icon and five marks per line, four lines and a score, **520 field units inside the field's 540**, so a 20-unit row fails M3's own planned test that the measured content fits inside the band. And the row cannot climb clear of the corners either: placing it above the field only where the whole 28 units sits below the reserve's 120 would move the row over the field on **four of the five `svh` phone rows**, which contradicts R1's measured sentence and re-prices section 7's finding about the revenant's tell from mostly a desktop cost into a cost paid on every shape. **The record's own intent was followed rather than the prompt's letter**, and the record already answers the case: R12 rules the HUD's band and the dev corner stack overlapping on a shortened window a dev-build-only collision, named so nobody reports it as a bug, and its own figures (the stack at stage y 12 to 172, the band at 178 to 204) are the `lvh` row of exactly this geometry. **So the row keeps the field's own width at every viewport**, and the crossings are pinned by test rather than asserted away: `layering.test.ts` records which reserved corner the row runs into at each of the three regimes, so the placement rule cannot change without a test failing.

**A reserved corner is deeper than the widget standing in it, and that distinction is what the tests turn on.** The reserve is 120 units deep; the pause button's own rectangle is 68 units tall inset by 12, so it ends at 80. At the tall regime the row sits at stage y 92 to 120 and **clears the button by 12 units** while crossing the corner the button's reserve claims. The second test asserts against the button's own rectangle for that reason, and it is the one that carries a player-facing promise.

**The prompt expected `layout.test.ts`'s exact-offset assertions to turn red and not one of them did.** Every existing viewport in that file either does not refit at all or refits to the same offset under both rules: the `700` case it tests lands on 120 either way, and `620`, the desktops and the tablet all return the natural fit untouched. **`layering.test.ts` turned red only on the new tests**, never on its existing placement assertions, because both sides of those compute `fitField` and move together. **`BelchButton.test.ts`'s two rects did not move**, as the prompt said they would not, and the 393 by 660 row is an addition to its sweep. **The only existing file that needed a change was none of them**: all twelve red tests were this slice's own.

**`GameScreen.ts` was not touched at all and did not need to be.** The prompt names it as a seam and it is one, but the row is M3's to place and this slice declares only the rectangle, so the screen's three regimes were asserted against the code already there and are green unchanged.

### Filed for Mark, built past

**At a viewport near the field's own aspect the HUD's row crosses the pause button, and CodeRabbit found it independently.** At the portrait tablet the row sits at stage y 12.96 to 55.5 across the full 820-unit width and the button occupies 676 to 808 by 12 to 80, so they overlap; the narrow phone at `svh` 460 is the same shape, row at 8 to 36 against the button at 12 to 80. **It is the squeeze regime R10 names, where both the band and the gutter collapse and every control ends up over the field**, and the two ways out are both ruled elsewhere: narrowing the row starves the band R1 derived, and moving the pause button is Mark's and #38's. **The tablet is a test viewport only and nobody plays on one; the narrow phone is not.** The outcome is pinned by test at all three regimes so it cannot drift silently, and the lever is his.

**The record's narrow-phone belch overlap is 112 and measures 108.** Named above with the arithmetic. It changes nothing this slice does and it is the one number in section 3.1 that did not survive re-derivation.


## 9. Slice M3: the HUD carries the ladder and the score (#99)

One code commit, `48383d4d68`, plus this note. **Eight files**, inside the prompt's realistic 8 to 14: three production files changed (`GameScreen.ts`, `RunHud.ts`, `runSession.ts`), one production file gaining an export and a sentence of JSDoc (`foodSprite.ts`), one production file created (`LadderHud.ts`), and three test files (`layering.test.ts`, `RunHud.test.ts`, and the new `LadderHud.test.ts`). **Nothing under `src/game`, `src/dev` or `src/tape` was opened.** The test-name diff against a baseline captured at `3a22fdc798` before the first edit reads **2205 names in the baseline, 2219 now: 17 added, 3 removed**, and every removal has its replacement among the additions (below).

**What a player meets now.** A slim row sits at the field's top edge. At its left is the score at six digits with one mark beside it, then, for each line the run was born with and in that order, that line's own silhouette with five marks against it, filled up to the level it holds. Swallowing a power-up fills one more mark on the line it levelled, on the tick it was swallowed. Nothing on the row gets brighter, ever: a rung that is held is a solid square and a rung that is not is the outline of the same square at the same grey. The row draws no plate, so the field shows through between the marks.

### The view's seam, and what arrives once against what arrives per frame

**The module is `src/app/screens/game/LadderHud.ts`**, named for the concept `CONTEXT.md` calls the HUD and for the ladder it carries, which is `RunHud.ts`'s own word for it in the comment this slice corrects. It lives beside the field's other renderers so `palette.test.ts`'s source scan reads it as text, it is a sibling of the field container rather than a child, and its public interface is one export block at the end: `createLadderHud` and the `LadderHud` type.

**The roster arrives once, through `showIdentity`**, which is already the seam for what a run was born with, and `RunIdentity` gains `roster` there. **The score, every line's level, the ladder's bled-rung memory and the bank arrive every frame through `render`**, which is three new fields on `RunReadout` plus the `bankedOffers` already on it. **The levels are a per-frame copy and never `run.levels` itself**: the offer's take mutates that record in place, so an alias would hand a dumb view live simulation state and would make any diff the driver takes compare an object with itself. The field carries that reason in its own JSDoc.

**The view is dumb and holds no change detection.** Every mark is two bodies, an outline and a fill, both drawn once at construction; `render` shows or hides the fill. No frame rebuilds any geometry, which is what makes twenty-one marks per frame free, and the "draws the same pixels for the same readout, whatever the tick" test is what says the view carries nothing of its own between renders.

**`GameScreen` owns the data, the diffing and the loop**, and it reads the session's readout once per frame and hands the same reading to both views through one small `readOut()`, so the corner stack and the row can never be a frame apart. **The row's rectangle is `hudRow`'s output applied exactly as `fitField`'s is applied to the field**, position and scale, never a second computation.

### The mark, the outline and the gap, measured at every viewport

Measured off the drawn geometry rather than computed from the constants, then converted at each viewport's own CSS pixels per field unit.

| viewport | CSS px per field unit | mark, floor 6.25 | outline, floor 0.89 | gap, floor 1.8 |
| --- | --- | --- | --- | --- |
| narrow phone, 320x460 | 0.5926 | **6.519** | **0.948** | **1.896** |
| iPhone 15, 390x844 | 0.7222 | 7.944 | 1.156 | 2.311 |
| phone at svh 660, 393x660 | 0.7278 | 8.006 | 1.164 | 2.329 |
| tablet portrait, 820x1180 | 1.5185 | 16.704 | 2.430 | 4.859 |
| desktop, 1440x900 | 1.1842 | 13.026 | 1.895 | 3.789 |

**The mark is 11 field units, exactly as `layout.ts` declares it, and nothing moved it.** What did move are the two figures the record derived the other two floors from, because both were rounded up past what they describe: section 5 above carries that entry with the arithmetic. The outline is **1.6** units and the gap between two marks is **3.2**.

**The filled mark carries 2.011 times the ink of the empty one**, 121 square field units against 60.16, and the test holds that ratio at 1.8 or better so the two constants cannot drift into each other.

**The score's digits measured 63.4 field units for six at the phone viewport**, against a declared budget of 66.96, so the real monospace advance is about 0.587 em and the 0.62 bound the corner stack is held to holds here too. **The whole row's content measures 10 to 527.08 across and 2 to 26 down**, inside the field's 540 and inside the band's 28, with 12.92 units of margin at the right end.

### The grayscale read, measured off the pixels

`filter: grayscale(1)` on the page, the built app through `vite preview`, the phone viewport, run two rather than run one.

**In colour the two bodies render at exactly one declared value.** Every painted pixel of the row measures `rgb(168,172,176)`, which is `hudInk`'s own `0xa8acb0`, on the filled marks, the empty marks' outlines, the icons and the digits alike. **There is no second colour on the row at all**, so the value step between a held rung and a lost one is zero by construction rather than by measurement.

**In grayscale both read `rgb(171,171,171)` and the reading survives on area alone.** On a scan line through the marks at 390 wide, a filled mark is **8 CSS pixels of solid ink** and an empty one is **two 1-pixel strokes with a 6-pixel hole between them**, the same 8 pixels wide. That is the record's own promise with the hue removed: about four times the ink on a scan line, about twice by area, and not one step of value between them.

### The row against the field's boundary

At the narrowest phone in the sweep the row draws **over** the field's top edge, because that stage leaves 8 stage units of band against the row's 28. Measured there, in colour so the two readouts can be told apart by hex:

- The boundary's stroke reads `rgb(143,160,199)`, which is `fieldFrame`'s `0x8fa0c7`, as a **1 CSS pixel** line.
- At a mark's column the nearest painted pixel of the row is **4 CSS pixels** below it.
- At an icon's column the row paints **over** the boundary: the icon's 24-unit box starts 2 units below the row's top and `BOUNDARY_STROKE` is exactly those 2 units, so the gap is **0**.

**The luma leg carries the reading and the gap leg does not**, which is what the record predicted: `hudInk` at 67.23 against `fieldFrame` at 62.43 is **4.80 points** against the palette's own 2.0-point separation, 2.4 times the floor. The test asserts both numbers in one reading, `gap false luma true separable true`, so the day the luma leg is lost the test fails rather than the disjunction quietly carrying on.

### The icon, and what it was set against

**`drawPowerUpIcon` gained an export from `foodSprite.ts` and the row imports it**, which is the reuse path the prompt ruled: the offer's body already teaches one silhouette per line, and R6 has the fallen rung wearing the icon its row taught, so a second vocabulary would put the body and the row in disagreement. Its JSDoc now says that the row draws the same silhouettes and that both of its properties bind at the row's size too, so #38's replacement is held to them there.

**Both properties survive the size, measured at the row's 24-unit box.** The skull stream's circle is 24.00 by 24.00, Territory's hand is 8.16 by 24.00, the wisps' kite is 11.52 by 24.00 and the bell is 24.00 by 12.48. **Each still fills its box on its long axis at exactly 24 units**, and the four aspects stay apart at 1.00, 0.34, 0.48 and 1.92, which is the coarse tall-round-pointed-wide split the sprite's own comment names. Read off the rendered screenshots at both viewports, the four are tellable at a glance: the circle, the three-fingered hand, the teardrop and the wide dome.

The icon draws in `hudInk` filled solid, the row's one ink, rather than in the power-up's own treasure colour. That is a craft call and its reason is that the row has exactly one ink by design: a second colour on it would be a second thing for the eye to rank, and the silhouette is what carries the line's identity.

### The pause button's drop, and M2's crossing pin replaced

**The button drops below the row at the squeeze regime and moves nowhere else.** The rule is measured rather than named by viewport, for the reason `fitField` gives for having no breakpoint: `pauseButtonTop` in `GameScreen.ts` takes the row's own rectangle and the reserve's own corner and moves the button only where the two actually cross. At the tall regime the band holds the row below the button and it does not cross; at the wide regime the side gutter holds the button clear of the field's width; at a viewport near the field's own aspect both collapse and the button goes to `row.top + row.height + margin`.

**M2's crossing pin is replaced by the clearance, not deleted.** `clears the pause button's own rectangle at every regime but the squeeze` becomes `clears the pause button's own rectangle at every regime, the squeeze included`, and a second test beside it pins the positions rather than the absence of an overlap, because a button that had vanished would clear the row too: **top 12 at the tall and wide regimes and 67.48 at the squeeze, below the row's own bottom edge only there**. The first regime test also gained the conditional, so the three regimes are still asserted in one place. **The reserved-corner pin is untouched**: the row still runs into both reserved corners at the tall and squeeze regimes, which is R12's dev-build-only collision and #66's.

Seen in the rendered check at 320 by 460: the button sits at CSS y 34 to 52, clear below the row, with the row running the full width above it.

### The bank moved, and `RunHud`'s comment corrected

**`BANK n` is gone from the dev corner stack** and the levels and fault lines moved up to stack lines 5 and 6. `bankReadout` went with it, and `RunHud`'s comment about the stand-in form is replaced by a short constraint beside the lines it binds, naming the ladder HUD as the reading's one home. **The absence is guarded by a test** rather than left to the comment, per the standing rule: `carries no bank line, because the ladder HUD carries the bank now` fails if a bank line reappears in the stack.

**On the row the bank reads as `+n` and draws nothing at all at zero**, the existing rule with its reason unchanged. **Two craft values here are first figures and both are open for Mark's read.** The marker is `+` rather than a word, because the row's budget for it is 23 field units and `BANK` alone is wider than that. Its font is 12 field units, the smallest reading on the row, which is 7.1 CSS pixels at the narrowest phone and 8.7 at an iPhone: the budget is sized for the widest bank the stage can produce, which is `carriersScheduled()` at 25, so `+25` is three characters and the size falls out of the width. **If the bank should read larger, the width has to come off the score's own budget**, because R1's arithmetic leaves the row 2.2 units of slack in total.

### The palette scan, and every luma printed

**`palette.test.ts`'s source scan is green over the new module and no entry was added.** `LadderHud.ts` names exactly one palette entry, `hudInk`, writes no colour literal, reaches no `MENU` colour and sets no `blendMode`. The scan walks `src/app/screens/game` as text, so the file joined it by existing.

The lumas the row is judged on, all read off the declarations and all confirmed against the rendered pixels: **`hudInk` 67.23** (the row's one ink), **`fieldFrame` 62.43** (the boundary it must be told from), **`hudDim` 50.94** (the dev stack beside it), **`reservoirCharge` 67.25** (slice K's own filled readout), against **`FIELD_LUMA_CEILING` 68**. Every one of them is at or under the ceiling and inside the live-field list, which is what the scan's own parts assert.

### The rendered check, across two runs and two viewports

`pnpm build` then `pnpm exec vite preview`, driven with `playwright-cli` against the built app, at 390 by 844, 320 by 460 and 1440 by 900, with `?levels=3` pinned so the marks start partway. **Zero console errors and seven warnings over the whole session**, all of them the audio autoplay policy and headless Chromium's software renderer, both pre-existing and both the same seven M2 saw.

**Run one, phone.** The row reads `000100` with a filled cushion beside it, then the circle at three of five, the hand at three, the kite at three and the bell at three, which is the pin. The row sits in the band above the field, clear of everything.

**Run one ended by play, sealed shut at 3383 ticks, and run two was played from RISE AGAIN.** The row drew the second run's own rows from the second run's own roster, which is the pooled reuse the unit test asserts and the check that slice K's empty-ring read proved is worth taking.

**Desktop, 1440 by 900, mid-run.** The row draws over the field's top edge inside the field's own width, with the corner stack and the pause button both out in the side gutter. It read `002000` with **the cushion mark empty**, which is M1's rule caught live rather than staged: the run had taken a floor hit, the ladder spent the score rung, kills kept paying score afterwards, and the marks read 2, 1, 2 and 3 across the four lines because later floor hits had stripped levels. That is the one state a headless driver was never going to be able to stage on purpose.

**What the check could not see.** A roster of fewer than four lines, because nothing in the build pins a roster and `createRun` defaults to the whole pool; the unit tests drive rosters of one to four. A non-zero bank, because it needs a carrier killed while an offer stands and the driver cannot steer well enough to arrange one. And the cushion re-arming, because that needs a dive that grows the grave a full hit's worth off the floor. All three are pinned by test.

### The four constants and `GOLDEN`, all untouched

`WITNESS_VERSION` **11** (`src/game/witness.ts`), `READINGS_VERSION` **8** (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` **4** (`src/tape/wireCodes.ts`) and `GOLDEN`'s checksum **`-2049717150`** (`src/dev/digest.ts`), each read off this slice's own committed tip. **None of the four files is in the commit** and neither is anything else under `src/game`, `src/dev` or `src/tape`. **No tape, batch or determinism run is owed and the claim was checked rather than assumed**: no simulation rule was touched, and the one thing the row reads that the sim owns, `run.levels`, it reads as a copy.

### Verification

`pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/` before the commit. **`pnpm verify` green twice on the committed tree at exit 0**: 148 test files, 2208 passed, 11 expected fail and 2 todo, against the 2205 test names M2's own note left and the 2219 this slice's diff reports.

**The fences green, each by title**: *src/game imports only from src/game*, *src/dev imports only from src/dev and src/game and src/tape*, *a policy names no weapon line*, *the step fence (ADR 0017) passes from the execution module alone*, *the harness reports and never judges*, *the cap derivation reads tables and never the stage* and *every reading declares what comparing it means*. Beside them, *every test file imports only from inside its parent folder's subtree* green over the new test file, *a golden digest over a short scripted scenario matches the committed constant (ADR 0015)* green at `-2049717150`, and the palette scan green in all of its parts.

**The twelve red tests were this slice's own and the expected-red list was right about every file.** `RunHud.test.ts` over the bank line, `layering.test.ts` over the crossing pins, and `LadderHud.test.ts` red twelve times against a stub that threw before a line of the view existed. **`GameScreen` has no test file of its own**; its wiring is asserted through `layering.test.ts`, which builds a real screen and resizes it, and that is where the row's placement and the button's drop are held. **There is no `runSession.test.ts`** and none was looked for.

### Craft values decided rather than asked, each with what it was set against

- **The mark's outline at 1.6 field units and the gap at 3.2**, raised off the record's 1.5 and 3 so both clear the floors those figures were derived from. Section 5 has the arithmetic.
- **The band's 28 units spend 2 above the content and 2 below**, exactly as `layout.ts`'s own derivation states, which is what puts the icon's top edge on the boundary's stroke where the row draws over the field. A 3-and-1 split would have bought the gap leg 1 CSS pixel at both placements and was not taken, because the band's derivation is M2's and the luma leg carries the reading without it.
- **The score at 18 field units, six digits, zero-padded**, which is 10.7 CSS pixels at the narrowest phone and 21.3 on a desktop. Padded because a fixed width is what keeps the row from shifting under a growing number, and because it is the arcade convention the genre already reads.
- **The score group sits at the row's left and the line groups to its right**, in reading order, with the cushion's mark between the digits and the bank.
- **The gap between two line groups is twice the gap inside one**, 6.4 against 3.2, so the groups separate before the marks do and the figure is derived rather than chosen.
- **The bank's marker and size**, named above as first figures.

### What is left for a later slice, each with the slice named

- **The countdown on the score and a mark going dark are M4's**, the cushion's mark included. This slice draws the current state and nothing animates.
- **The fallen rung's body is M5's**, and it wears the icon this row now teaches, which is why the export landed here.
- **A roster shorter than the build's four is unreachable from the URL**, so the rendered check could not show one. If a later slice wants one on screen, a roster pin is the smallest thing that would do it; no ticket is filed, because nothing needs it yet.

### Filed for Mark, built past

**At the narrowest phone the dev corner stack's FPS line sits on top of the row's score.** The stack starts at stage y 12 and the row's content sits at stage y 10 to 26 there, so `0 FPS` and `000100` overprint. **R12 already rules this collision a dev-build-only one and #66 owns the build flavour that removes it**, so nothing here acts on it; what is new is that the thing it lands on is now the player's own score rather than empty band. It is visible in the 320 by 460 screenshot and it is invisible on every other viewport in the sweep.

**Where the row draws over the field, a mob passes behind the marks.** Seen at 320 by 460, a live mob sat behind one of the wisps' empty marks and both stayed readable. This is the no-plate arrangement working as R1 intends and it is named because it is the first time anything in this game draws over live play.


## 10. Slice M4: the loss is watched (#99)

Twelve files, all under `src/app`: one new module and its tests, the registry and its covering test, the row and its tests, the storm renderer and its tests, the two screens, and the two lifecycle harnesses. **Renderer only. Nothing under `src/game`, `src/dev` or `src/tape` is in the commit, no sim rule moved, and `bleedScore` still zeroes the score in one tick while `stripLevels` still takes one level off every line that has one to give.**

### The loss is its own concept, and it is one file

`src/app/screens/game/watchedLoss.ts`. The module boundary permitted a new file only if the loss's announcement is its own concept, and it is: the two lifetimes, the state a run accumulates, the fold that takes an event into it, and the one reading the row draws from it are all the same subject, and none of them is the row's pixels. **`LadderHud` stays a dumb view and `GameScreen` stays the driver**: the driver holds the state, folds each event into it, and clears it, and the row is handed the state and the frame's readout and draws what the reading says. Its interface reads in one place at the module's end and no import direction changed.

### The countdown, linear, and the registry's figures

**`SCORE_BLEED_TICKS` 40, the record's own declared starting figure, and the curve is linear over the whole lifetime.** The reading runs from the bled amount toward whatever the run's score currently reads, so a score climbing from kills while the grave is at the floor is landed on rather than jumped to. **The midpoint is what pins it**, because a test asking only for a value between the old one and zero passes on ease-out too, and ease-out is the snap R5 rejected, stretched.

**The registry, printed off this tip, with the lead-in above it.** `REPLAY_LEAD_IN_TICKS` **90**; `scatter` 12, `eruption` 90, `splash` 18, `territoryArrival` 68, `lossBlowUp` 24, `scoreBleed` 40, `rungStrip` 40. **Every lifetime is at or under the lead-in** and the covering test takes its bound over the registry rather than over a hand list. Two new lines in it and not one, per R5: the bleed's and the strip's.

### The strip's mark empties over the bleed's own lifetime

**`RUNG_STRIP_TICKS` is `SCORE_BLEED_TICKS`, written as that constant and not as a second 40**, so the one vocabulary is a fact in the code rather than a coincidence two figures happen to have. It is a second held transient born of `weaponStripped` and owned by the driver exactly as the bleed is, and it is not drawn from `levels`, which would snap. **`INVULNERABLE_TICKS` is 24, under the 40**, so a strip can land while the cushion's own mark is still emptying; the reading takes both together and a test at both layers pins the overlap.

### The event-driven seam, and why no diff is read

`GameScreen.announce` folds each event into the loss with `watchLoss`, beside the storm renderer's own `belched` and `splashed` calls. **The row never diffs the score**, because a diff cannot tell a bleed from an overflow that happened to be negative, and a view that inferred one would be a second implementation of the rule. The test that holds it hands the row a falling score with no event and gets the score itself, with the cushion untouched.

### Emptying is subtraction of area

The mark's body drains from the top down: `fill.scale.y` is the share left and its position follows, so the body loses area and takes **no step in value and no step in brightness** (ADR 0014, R2). At nothing left the body is hidden, so **an emptied mark is exactly the empty mark the row already draws** rather than a second state that resembles it, and the palette scan stays green with no new colour anywhere in the slice.

### What `prepare()` now clears, and how the second run proves it

`GameScreen.prepare()` sets the watched loss back to nothing, beside the ending, the frame policy, the steering and the countdown it already cleared; `StormRenderer.forgetPreviousRun` drops the blow-up's born tick and its pops, in the one place per-run renderer memory dies. **The test is not "the second run opens clean at tick zero", because at tick zero a stale born tick reads as not live anyway and the leak would hide.** It plays run one until a loss lands at a tick, ends it, opens run two on the same pooled screen, and plays run two to that same tick: that is the frame a leaked countdown would run on. The storm renderer has its own copy of the same test.

### The replay's mirrored line, and the HUD it does not have

`ReplayScreen.syncScreen` hand-mirrors `GameScreen.announce`, so the blow-up is wired there in the same commit: wired into the live screen alone it would simply not play on a replay, and the lead-in's whole promise is that a replay shows what the live run showed. **The replay carries no HUD at all**, so the countdown and the emptying mark are moot there and nothing is owed for them; that is an absence by construction rather than an omission. The test proves the wiring bites, checked by removing the line and watching it go red.

### The field channel, per line, built and unbuilt

| line | built | why |
| --- | --- | --- |
| skull stream | **yes** | Its columns are the one expression of the four that is on screen continuously (section 3.3), and it is the birthright every run has, so the announcement always has something to blow up. One expanding ring where each live skull stood on the tick the rung went, drawn in `skull`'s own colour. |
| bell | no | Its cones are on screen **only during a toll** (section 3.3), so an announcement on it would play on the fraction of strips that happen to land inside a toll's window and be silent otherwise. An announcement that is usually absent is worse than none. |
| wisps | no | Its flight is fired by a swallow and expires in 90 ticks (`wisps.ts`, ADR 0005), so it is on screen only in the window after a swallow, which is not the window a player takes a floor hit in. It is the nearest candidate of the three and it is written down here as such. |
| Territory | no | Its level buys radius: **an area and never a count**, which is the whole reason R8 amends ADR 0054, and a patch may not exist at the moment of the strip at all. |

**This is section 7's sixth finding holding, not a miss**: step 5 builds the HUD channel whole and does not finish the field one, because making each line's rung readable in its own expression is a design job per line.

**`LOSS_BLOW_UP_TICKS` 24, a first figure and open.** It sits at the splash's order of magnitude, 18, rather than the eruption's field-wide 90, because a pop is a hit-sized event; 24 is also the invulnerable window's own length, so the announcement finishes about when the player can be hit again. It is written as its own constant rather than derived from `INVULNERABLE_TICKS`, because a picture may not quietly follow a rule's retune.

### The rendered check, and what it could and could not see

`pnpm build` then `pnpm exec vite preview`, driven with `playwright-cli` against the built app at 393 by 660 and at 1440 by 900, opened at `?levels=3&size=18&seed=4242` so the grave starts at the size floor and every contact runs the ladder. **Zero console errors and seven warnings**, the same seven families M2 and M3 saw: the audio autoplay policy and headless Chromium's software renderer, both pre-existing, and none from this slice.

**Three runs were played, two of them on the same pooled screen.** Run one bled and stripped until it sealed at 2621 ticks. **Run two opened on the pooled screen at tick 70 reading `000000` with a filled cushion and every line at three of five, with no countdown and no emptying mark anywhere**, which is the pooled-run check taken on the built app rather than only in a test.

**The loss was caught on screen, which is more than the driver's own limits promised.** At 5 FPS under SwiftShader consecutive screenshots land 1.6 seconds apart, about 96 ticks, so a 40-tick transient falls between two frames more often than not, and **run one's whole four-rung ladder ran between two consecutive frames with nothing of it photographed**. Run two's did not: one frame at tick 2358 carries **the cushion drawn as an outline, four marks each part way through emptying at once on all four lines, and three expanding rings standing in a vertical column above the grave where the stream's skulls were when the rung went.** Both channels of R7 in one photograph.

**What it could not see.** The digits mid-countdown: every frame that caught a loss caught it after the 40 ticks had run, and the digit churn is what the driver's frame gap is worst at. The desktop half caught the row drawing correctly over the field's top edge with the score climbing and the cushion filled, but no hit landed inside its burst. **Neither is chased further**: both are pinned by test at the pure function and at the row, and how the fall reads at sixty frames a second is Mark's own.

### The seam test's placement, and why

**The pure function got a new file**, `__tests__/watchedLoss.test.ts`, beside the module it tests. **The driver's own per-run memory went into `src/app/__tests__/screenLifecycle.test.ts`** rather than a new file, because that file's concept is exactly the lifecycle rule under test, it already drives a real floor hit off `SIZE_FLOOR` with a mob standing in the grave, and a second harness mocking the same two widgets would be a second copy of this one.

**Every new assertion was proved to bite rather than assumed.** Swapping the linear curve for an ease-out and the emptying mark for a snapping one reddens exactly the eight tests that pin those two properties and nothing else; removing the replay's mirrored line reddens exactly the replay test.

### An existing test helper was measuring ink the row never draws

`LadderHud.test.ts`'s `boxesIn` counted a hidden body and ignored a body's own scale, and the band-fit test went red the moment an empty mark's body moved to the bottom of its square. **The helper was corrected rather than the assertion relaxed**: it now skips an invisible node and scales a body's bounds by its own transform, which is what "its measured content" meant all along. The band-fit assertion itself is untouched.

### Craft values decided rather than asked, each with what it was set against

- **`LOSS_BLOW_UP_TICKS` 24.** Above. Open, and the lever if it reads wrong is one number.
- **`LOSS_BLOW_UP_REACH` 16 field units and `LOSS_BLOW_UP_STROKE` 6.** The reach is about two skulls' width, large enough to read against the column it left and small enough that a full stream's worth does not paint the field; the stroke thins to the storm's own `SPRITE_STROKE` as the ring reaches, which is `drawEruption`'s own construction rather than a new one. Read on screen at the phone and they read as pops.
- **The pop draws in `PALETTE.skull`**, the line's own colour at luma 57.78, under the field's ceiling of 68. **No palette entry was added**, so the existing scan covers it.
- **The mark drains from the top down.** A vessel emptying rather than a bar shortening sideways, because the mark is a square and a sideways drain at 6.5 CSS pixels would read as a thinner mark rather than a mark going.
- **The blow-up sits last in the `storm` layer**, so it draws over the storm it announces and still under `mobFire`, which nothing may occlude.

### CodeRabbit, one iteration: 14 files reviewed, 7 findings, none applied and all seven declined

**Two minors, both the same point: `spentOf` reaches `(life - 1) / life` on its last live tick rather than 1.** Declined. Every held transient already in this renderer reads its age the same way, `drawEruption`, `drawSplash` and `syncRing` alike, so the suggestion would make this one the odd one out. It would also break the ruling: at a lifetime of 40 the midpoint tick reads 20/39 rather than a half, and **the midpoint reading half is exactly what R5 pins**. And the residual is not a discontinuity at all: the final step to the live score is one tick's worth of the same constant slope, and the mark's last drawn share is 1/40 of its square, about 0.09 CSS pixels at the phone.

**One major on `ReplayScreen.ts`: a buffered event should be announced against the run state of its own tick rather than the frame's final one.** Declined. It is the frame-level announcement both screens already use for `belched` and `splashed`, and the replay's own comment says so in as many words; the slice's requirement was to mirror that wiring, and changing it is a per-tick event delivery change across both screens and both transients that exist today. The skew is bounded by one frame's ticks against a 24-tick lifetime, the same bound the eruption's 90 already carries. **Left for whoever next opens event delivery**, named here so it is not rediscovered.

**Four majors on the two docs files, none of them this slice's.** `show-what-you-have.md` and `step-5-slice-prompts.md` were dirty in the shared worktree while the review ran. All four are one argument: that **M7's `run.score` change needs a `READINGS_VERSION` 8 to 9 move which section 5's ledger and the prompts' own overrides forbid**, and that M6 is described as the last building slice. Declined because neither file is this slice's and the subject is the step's ledger, which is the orchestrator's. **It is worth the orchestrator's eye**, because the same reasoning is what already corrected the ledger once for M1.

### Verification

1. `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then **`pnpm verify` green twice on the committed tree**, 149 files and 2230 tests both times.
2. **The test-name diff: 2219 names in the baseline at this slice's own tip, 2241 now, 24 added and 2 removed.** The two removals are the registry covering test's first two names, reworded from "each renderer declares" to "each owner declares" because the registry now aggregates a view's declaration beside two renderers'. **Same two tests, renamed, and both are in the 24 added.**
3. The registry printed above, with the two new lifetimes and the lead-in.
4. The rendered check above, across three runs and two viewports, screenshots read, the driver's limits stated.
5. The per-line field channel above, built and unbuilt, each with its reason.
6. The four constants and `GOLDEN`, below.
7. **Mark's own, blocking nothing**: whether the score is seen to leave rather than to have left, and whether four marks emptying at once reads as the bigger event it is.

### The four constants and `GOLDEN`, all untouched, all read off this tip

`WITNESS_VERSION` **11** (`src/game/witness.ts`), `READINGS_VERSION` **8** (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` **4** (`src/tape/wireCodes.ts`), `GOLDEN`'s checksum **`-2049717150`** with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` inside it (`src/dev/digest.ts`). **None of the four files is in the commit**, and no tape, batch or determinism run is owed: the claim was checked against the diff rather than assumed.

### What is left for a later slice, each with the slice named

- **The body departing**, which is R7's third channel and **slice M5's**. This slice announced on the two that exist.
- **The field channel for the bell, the wisps and Territory**, which is the record's section 7 sixth finding and a design job per line, beside each line.
- **Per-tick event delivery on both screens**, from CodeRabbit's declined major above. Nobody owns it and nothing needs it today.

### Anomalies, neither of them this slice's

**The branch tip moved under the slice while it ran.** It opened on `ded89c5242` and the orchestrator committed `c4b8121fdc` and `43ed76c9df` on top, both docs. Nothing in either touches `src/`, and the slice's work sat on the newer tip with no conflict.

**Two records and one research file were dirty in the shared worktree throughout.** `show-what-you-have.md`, `step-5-slice-prompts.md` and an untracked `docs/research/score-inputs-precedent.md`, all the orchestrator's in-flight work. **Nothing of them is in this slice's commit**, every path was staged by name, and the only cost was the four CodeRabbit findings above that the review took against them.

## 11. Slice M5: the stripped rung falls and the dive catches it (#99)

Twenty-one files: six under `src/game`, three under `src/app`, and twelve test files. **`src/game/corpses.ts`, `grave.ts`, `swallow.ts`, `events.ts`, `offer.ts` and `witness.ts` are the whole of the sim's side**, and no module was created, deleted, merged or split.

### The fourth kind, and why it is not a new pool

`FoodKind` is `'corpse' | 'powerUp' | 'feast' | 'fallenRung'` and the body is a row on the existing corpse pool (record section 3.4, ADR 0055). **What that bought, checked rather than assumed**: the scroll (`step.ts` moves every live corpse by `SCROLL_SPEED`), the cull at the bottom edge by the body's own extent, the corpse cap and its refusal, the swallow path through `coveredFood` and `resolveSwallows`, and the renderer's own pooled slot. **Not one of those six sites was edited.** A new pool would have been six new implementations of rules that already exist.

### The spread and the offset, both set against something, both first figures

**The spacing is the offer's own, `OFFER_SPACING` 90, reused rather than restated.** `offer.ts` gains one exported seam, `spreadX(x, count, index)`, which is `groupCentre` plus the per-index offset the offer already computed inline; `standOffer` now calls it too, so there is one implementation of "side by side at the spacing, group shifted whole to stay on the field" rather than two. **What it is set against**: at 90 apart a grave at the size floor sits over one body's midpoint at a time, so a four-rung strip is a choice of which line to save rather than a sweep that returns the lot. Not retuned, and no measurement here argues it should move.

**`FALLEN_RUNG_DROP` is `SIZE_FLOOR + POWER_UP_HALF_EXTENT + BASE_SPEED`, 36.5 field units, and it is a first figure.** Derived, not typed: a strip runs only at the size floor, so the grave's half-height there is exactly `SIZE_FLOOR` and the body's own is the treasure extent, which puts the bare touch at 32; the extra `BASE_SPEED` is one tick of the grave's own travel, so a grave already diving at full speed cannot reach a body on the tick after the fall either. **That is the transferable half of Sonic's no-recollect window as geometry rather than as a clock.** The tick-after case lands on an exact touch, and `overlap.ts`'s half-open convention is what makes a touch not a swallow; on any real tick the scroll has carried the body further away as well.

**The group is centred on the grave's x and contained on x by shifting whole. There is no containment on y**, which is the record's own ruling and is the edge rule the batch below measures.

### The roster walk, which changes no order today

`strippableLines` walked `WEAPON_LINES` and now walks `state.roster` (R3, R6). **It changes no behaviour at this tip**, because `implementsLines` keeps a roster inside the pool and every run today is born with the whole pool in the pool's own order. It is the line a fifth weapon would break, and the test that holds it drives a roster of `['bell', 'skullStream', 'wisps']` and asserts the bodies stand in that order and not in the build's.

### The restore, the cap, and the one call that was mine

A swallowed fallen rung calls `catchRung` in `grave.ts`, which owns the ladder that took it. It gives the rung back to the line it came off and to no other, and `MAX_LEVEL` is never crossed. **The call that was mine rather than the record's: `rungCaught` fires on the catch and not on the restore**, so a rung caught onto a line that climbed back to its cap in the meantime still announces, with the unchanged level in the payload. The reason is that M6's catch count reads this event and nothing else, and a count that dropped the ones that paid nothing would measure the ladder rather than the dive. It is annotated in `grave.ts` and is one line to reverse.

**A fallen rung swallowed with no line throws.** It is a value this sim wrote at the spawn, so a missing one is a bug rather than something to repair into another line's rung, which is `resolveOffer`'s own precedent for the same shape.

### The two new events, and the two counters they stay out of

`rungFell` carries the line and the point; `rungCaught` carries the line and the level after. **Neither reuses an existing type.** `powerUpSpawned` is the offer's and carries the body id the offer joins on; `weaponLeveled` is a rung bought, which `src/dev/replayTallies.ts`'s `levelUps` counts, and a restore counted there would have moved that reading's meaning with no version to say so.

**`bodyIdIn` and `powerUpLedger` were checked and are unreached, and there is now a test that says so.** `bodyIdIn` scans for `powerUpSpawned` and its only caller is `standOffer`, which only ever sees `spawnPowerUp`'s events. `powerUpLedger` keys on `kind === 'powerUp'`, `powerUpSpawned`, `swallowed` with kind `powerUp`, and `corpseLost` with kind `powerUp`; a fallen rung is `fallenRung` at every one. The new test in `powerUpLedger.test.ts` walks a rung through spawn, swallow and loss and asserts every one of the ledger's five figures still reads zero.

### Treasure moved onto the row, and one claim in the record that is false against the tree

**The record's section 4 note says M5 widens `FieldRenderer`'s predicate "by kind rather than by a new flag". The slice prompt rules the opposite and is the later word**, so treasure is a property on the row: `Corpse.treasureBody`, carried through `Swallowable` and the `chimed` event. `FieldRenderer` reads `corpse.treasureBody` and `sound.ts` reads `event.treasureBody`, and **neither file now names a food kind at all**; a test asserts `sound.ts`'s source matches neither `powerUp` nor `fallenRung`, so a fifth kind costs that site no edit.

**And the row is named `treasureBody` rather than `treasure`, because the glossary's Treasure and the two sites' predicate are not the same set in this tree.** `CONTEXT.md` makes a feast treasure, and a feast draws through `drawCorpse` in the corpses layer and chimes as a plain swallow, both pinned by tests that predate this slice. A flag called `treasure` reading false on a feast would be a name that lies, and setting it true would move a feast's drawing and its sound, which is not this slice's to widen. **The row is what wears the treasure body: the breath, the treasure layer, the treasure chime.** The gap is recorded here rather than closed.

**`drawPowerUp` is renamed `drawTreasureBody`** for the same reason: it now draws a fallen rung too, and a function named for one of the two bodies it draws is the same lying name one level down. Nothing else in `foodSprite.ts` moved: the aspects stay apart, each icon still fills its box, and `drawPowerUpIcon` is untouched.

### The icon, and the silhouette question answered in words

The body wears its own line's icon at the power-up's extent, through `drawTreasureBody`, which is the vocabulary slice M3's HUD row already taught. **The rung and an offer's body share the treasure shape on purpose**, and a test pins the sharing rather than a separation, because telling those two apart is #122's.

**Can you tell a fallen rung from a corpse, and one line's rung from another's, with the colour removed? Yes, on both counts, read off grayscale crops of the built app.** A four-rung strip photographed at the desktop viewport shows, left to right, a filled circle, a tall narrow hand, a pointed kite and a wide trapezoid, all at one brightness and all clearly one vocabulary; a corpse in the same crop is a small dim hexagon at roughly half the width and well below their value. **The rung against the corpse is a size and a brightness read before it is a shape read**, which is ADR 0014's own ordering working. Rung against offer is not claimed.

### The witness: a new food code, and the field list does not move

`FOOD_KIND_CODES` gains `fallenRung: 4`, appended rather than reusing any of the three, which is the map's own append-only rule. **`WITNESS_VERSION` stays at 11**, and `witness.ts`'s own rule is quoted: the version moves when the field list moves. **This slice declares no new folded field.** `foldCorpses` already folds `kind` and `line` and folds neither `decays` nor the new `treasureBody`, both of which are written once at the spawn from the kind the fold already carries, and the exclusion list in `witness.test.ts` now carries `corpses[].treasureBody` with that reason beside it. A new test folds one fixture as a power-up and the same fixture as a fallen rung, gets two different checksums, and asserts the corpse half of `FOLDED` is unchanged.

### The freshness question, answered rather than assumed

A fallen rung is spawned at freshness 1 and never decays, so `freshnessScale` never scales its payout and it always pays a whole `TRASH_CORPSE_PAYOUT`: **the catch is the same growth as the treasure beside it rather than a cheap dive.** For `tuning.freshness`, which is keyed by `FoodKind`, a fourth key arrives beside three unchanged ones and every one of its four maps is a `Partial<Record<FoodKind, number>>`, so nothing had to be filled in and no existing reading changed meaning. **`READINGS_VERSION` does not move**, which is `readingsVersion.ts`'s own rule: "Adding a brand-new reading beside unchanged ones does not bump it: every old reading still means what it meant." No existing reading was found whose meaning moves.

### The batch, the floor-hit split, and the bot's take rate

**Seeds 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig, which is the set slice M1 measured.** Played through the harness's own path, `runPolicy` over `harnessPolicy` at `runTickBudget()`, with the two new events counted off the run.

| Configuration | Seed | Ticks | Ending | Bleeds | Strips | Line-levels | Seals | Rungs fell | Rungs caught |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| steady-far | 900 | 19925 | sealed | 1 | 0 | 0 | 1 | 0 | 0 |
| steady-far | 901 | 16721 | sealed | 1 | 0 | 0 | 1 | 0 | 0 |
| steady-far | 902 | 20123 | sealed | 1 | 0 | 0 | 1 | 0 | 0 |
| steady-far | 903 | 21938 | sealed | 1 | 1 | 2 | 1 | 2 | 0 |
| steady-far | 904 | 38445 | victory | 1 | 0 | 0 | 0 | 0 | 0 |
| steady-far | 905 | 19583 | sealed | 1 | 0 | 0 | 1 | 0 | 0 |
| loose-far | 900 | 22208 | sealed | 1 | 0 | 0 | 1 | 0 | 0 |
| loose-far | 901 | 22448 | sealed | 1 | 1 | 2 | 1 | 2 | 0 |
| loose-far | 902 | 21326 | sealed | 1 | 1 | 1 | 1 | 1 | 0 |
| loose-far | 903 | 22482 | sealed | 1 | 1 | 2 | 1 | 2 | 0 |
| loose-far | 904 | 17172 | sealed | 1 | 0 | 0 | 1 | 0 | 0 |
| loose-far | 905 | 42666 | victory | 2 | 1 | 3 | 0 | 3 | 0 |

**Ten rungs fell across the twelve runs and the bot caught none of them. The take rate is zero of ten.** **The bot only dodges, so that number measures the policy and never a player**: the hand's wanted point is the live offer's nearest body, else the nearest food, else the starting mark (`harnessPolicy.ts`), and with 5 to 129 corpses lost per run the nearest food at the moment of a strip is very often something else entirely. **It is printed rather than declared, which is M6's.**

**Half of the ten never reached the field at all, and that is the record's section 7 edge rule firing rather than anything new.** The grave's y at each of the five strips, with how many of that strip's bodies landed below the field's bottom edge:

| Configuration | Seed | Tick | Grave y | Rungs | Below the field | Ticks left in the run |
| --- | --- | --- | --- | --- | --- | --- |
| steady-far | 903 | 21625 | 742.0 | 2 | 2 | 313 |
| loose-far | 901 | 22420 | 741.8 | 2 | 2 | 28 |
| loose-far | 902 | 21254 | 742.0 | 1 | 1 | 72 |
| loose-far | 903 | 21523 | 666.1 | 2 | 0 | 959 |
| loose-far | 905 | 30195 | 715.8 | 3 | 0 | 12471 |

**Three of the five strips landed with the grave at its bottom clamp, 742.0 of 760 at the size floor, and every rung of those three was gone on the tick it fell.** That is Mark's edge rule and it is not repaired here. **What it says that the hypothetical did not**: a hand under fire at the floor retreats downfield, so the clamp is not a corner case for it, it is where the ladder usually finds it. **A human is the other half of the question and this number is not it.**

**A zero take rate could have hidden a rung the pool can never hand back, so the recovery path is now pinned end to end rather than through `swallow()` alone.** `corpses.test.ts` stands a rung one extent below the grave, steers down through the real tick loop, and asserts the body goes, the line's level comes back and exactly one `rungCaught` fires. It passes, so the zero is the hand and not the path.

### The conditioned tape, and the determinism a fallen rung has to survive

**One tape, the ladder rig: seed 404 at 6000 ticks with every line pinned to 5**, recorded twice on the committed tree at `9aa6f83a6a` with a clean build identity. It measures to **`outcome: 'verified'`** at `readingsVersion` 8, **101 of 101 checkpoints verified and none unreachable**, and it carries the rule whole: 5 hits, one bleed of 5200, one strip of four line-levels, no seal, and every line ending at 4 rather than 5.

**Four rungs fell at tick 2628 and every one of them landed on the field.** Their points are the derivation read back rather than restated: x at 132.8, 222.8, 312.8 and 402.8, exactly 90 apart and centred on the grave's own 267.8, in roster order; y at 642.2 against a grave at 605.7, which is the drop's 36.5 exactly. **They stand at four consecutive checkpoints, 2640, 2700, 2760 and 2820**, so this tape is a replay with fallen rungs on the field at a checkpoint and its verdict is the determinism claim.

**The two recordings differ in two bytes and both of them are `recordedAt`.** 56437 bytes each, and decoding both says the same thing field by field: all 6000 commands identical, all 101 checkpoints identical, the trailer identical, the observations identical, and `recordedAt` the only header field that moved.

**Seed 909 under `shaky-short` also holds at 5997 ticks, sealed, 56419 bytes, verified**, which is the tick count and the byte length slice M1 recorded for it. That seed never reaches a strip, which is why the ladder rig is the tape this slice leans on.

### The rendered check, across three runs and two viewports

`pnpm build` then `pnpm exec vite preview`, driven with `playwright-cli` against the built app at 393 by 660 and at 1440 by 900, opened at `?levels=3&size=18&seed=4242` so the grave starts at the size floor and every contact runs the ladder. **Zero console errors and seven warnings**, the same two families M2, M3 and M4 saw: the audio autoplay policy and headless Chromium's software renderer, neither from this slice.

**Three runs, two of them on the same pooled screen.** Run one at the phone sealed at 2621 ticks; run two opened on the pooled screen and was played out; run three was played at the desktop after a resize.

**A four-rung strip was photographed at both viewports.** At the phone, tick 2384: four amber bodies standing in one row below the grave, evenly spaced, in roster order, circle then hand then kite then trapezoid. At the desktop, tick 2460, the better frame: **two strips' worth on screen at once**, four bodies in a row just below the grave and the earlier strip's four further down the field, the scroll having carried them, with the HUD's four rows reading nearly empty above. **The bodies stand apart rather than stacked, which is the picture the spacing was reused for.**

**What it could not see.** No catch was photographed: the driver runs at 4 to 6 FPS under SwiftShader and the window between a rung falling and the scroll taking it is about 180 ticks, and the bot is not driving. The catch is pinned at the seam and through the tick loop instead, and how the chase feels at sixty frames a second is Mark's own.

### Craft values decided rather than asked, each with what it was set against

- **`FALLEN_RUNG_DROP` 36.5**, above. A first figure, derived from the two extents plus one tick of the grave's travel, and open.
- **The fallen rung's payout is `TRASH_CORPSE_PAYOUT` and its extent is `POWER_UP_HALF_EXTENT`**, both the offer body's own rows. Nothing swallowed is ever worthless (ADR 0002), and the catch box stays the treasure box because collecting treasure is never a precision test.
- **`rungCaught` fires on the catch and not on the restore**, above.
- **The strip is announced before the bodies**, so `weaponStripped` still reaches M4's transient first and a reader meets the loss before what is left of it.
- **No palette entry was added**: the rung draws in `PALETTE.powerUp`, which the existing scan already covers.

### Verification

1. `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then **`pnpm verify` green twice on the committed tree**.
2. **The test-name diff: 2241 names in the baseline at this slice's own tip, 2272 now, 32 added and 1 removed.** The one removal is the sound test reworded from "chosen from the kind the event already carries" to "chosen from the row the event already carries", and it is in the 32 added.
3. **Replay determinism with four fallen rungs standing at a checkpoint**, below.
4. **A conditioned tape at the ladder rig, measured to `outcome: 'verified'`**, below.
5. The batch, the floor-hit split and the take rate, above.
6. The rendered check, above, with the silhouette question answered.
7. The four constants, below.
8. **Mark's own, blocking nothing**: whether he chases one, whether he ever decides not to, and whether picking one rung out of four lands as a choice.

### What was expected to turn red and did not, each checked by running it

`caps.test.ts`, `invariants.test.ts`, `measure.test.ts` and `harnessPolicy.test.ts`'s per-seed baselines are all green unchanged. **The reason is one fact**: a fallen rung only exists after a floor hit that strips, and not one of those four fixtures reaches one. `checkOneLiveOffer` filters on `kind !== 'powerUp'`, so a rung carrying a line trips nothing there. **`replayTallies.test.ts` does not exist in this tree**; the property the prompt asks it for, that `levelUps` does not count a restore, is pinned in `swallow.test.ts` as the absence of `weaponLeveled` on a catch, which is the whole of what `levelUps` reads.

### What is left for a later slice, each with the slice named

- **The catch count and the rungs recovered per strip as declared readings**, which is M6's. This slice printed both off a scratch script and declared nothing.
- **The grave's y at each strip as a printed reading**, also M6's, and the table above is the first measurement of it.
- **#81, bodies stacking on one spot**, which already names the rung body as a new caller and is not closed here.
- **#122, telling a fallen rung from an offer's body**, which the shared treasure shape is deliberate about.

### CodeRabbit, one iteration: 21 files reviewed, zero findings, nothing applied and nothing declined

`coderabbit review --agent --uncommitted` over every path this slice touched, staged by name. It returned `review_completed` with `findings: 0` and listed all 21 files, so there was nothing to apply and nothing to decline. **Two changes landed after the review and both are named rather than hidden**: the end-to-end catch test in `corpses.test.ts` below, and dropping `FALLEN_RUNG_DROP` from `grave.ts`'s export block because nothing outside the module cites it, which is the cited-future rule.

### The four constants and `GOLDEN`, all read off this slice's own tip

`WITNESS_VERSION` **11** (`src/game/witness.ts`), `READINGS_VERSION` **8** (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` **4** (`src/tape/wireCodes.ts`), and `GOLDEN`'s checksum **`-2049717150`** with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` inside it (`src/dev/digest.ts`), every one of them read before the first edit and unchanged after the last.

**`GOLDEN`'s at-most permit went unused, which is the expected outcome and not a miss.** `digest.test.ts` was green at every run of the suite. The cause is the one the record names: the scripted scenario ends with the grave at 24.10125 against a floor of 18, so `runFloorLadder` is never called in it and nothing in it can strip a rung. **`src/dev/digest.ts` is not in the commit.**

**`WITNESS_VERSION` does not move and the rule that says so is `witness.ts`'s own**: the version moves when the fold's field list moves, and a new code inside a field the fold already carries is not a new folded field. `FOOD_KIND_CODES` gained `fallenRung: 4` and `FOLDED`'s corpse half is unchanged, both asserted.

**`FORMAT_VERSION` 4 and `READINGS_VERSION` 8 are held.** Nothing here reaches the wire: no sim event is ever encoded into a tape and no header field moved. No existing reading changed meaning, and the one new key, `tuning.freshness`'s fourth, arrives beside three unchanged ones.

### Claims found false against the tree, and what was followed instead

**One, and it is the record's rather than the prompt's.** Section 4's notes say M5 widens `FieldRenderer`'s treasure predicate "by kind rather than by a new flag". The slice prompt, written later and folding both gates, rules that treasure becomes a property on the row. **The prompt's intent was followed** and the note above says what the row is called and why.

**The prompt's expected-red list names `replayTallies.test.ts`, which does not exist in this tree.** `src/dev/replayTallies.ts` has no test file of its own; the property it is named for is pinned in `swallow.test.ts`.

### Anomalies

**The branch tip moved under the slice while it ran.** It opened on `437ded35ba`, slice M4's docs commit, and the orchestrator committed `d06dd74930`, slice M6's prompt, on top. Nothing in it touches `src/`, and this slice's work sat on the newer tip with no conflict.

**None of the rest are this slice's.** The one worth writing down is not an anomaly but a measurement that argues against an eyes-open cost ADR 0055 records: the ADR says a body at the bottom of the field is something the base harness policy will always walk to, and the measured take rate across twelve runs is zero of ten. **The hand's rule is right, the outcome is not what the ADR expected**, and the reason is in the table above: three of the five strips dropped their rungs off the field entirely, and the other two left rungs the hand never reached while it was dodging. **It is filed for Mark's read and for M6's declaration, and nothing here acts on it.**

### M5-fix: a strip with no room below the grave drops its rungs above it instead (#99), `52a62e16d1`

**M5's own measurement is what asked for this.** Three of the five strips in M5's batch landed with the grave at the bottom clamp, y 742 of 760, so five of the ten rungs that fell spawned below the field and were lost on the tick they fell. **Mark's ask is a lost level you can see fall and dive to catch, and a rung that never appears cannot be dived for**, so the orchestrator ruled the edge on 2026-09-16 under R6 and that ask: where the grave has no room below it for the drop, the rungs fall above it at the same offset mirrored upfield, spread and centred exactly as before. **The section numbers are fixed by the prompts file's second override, so this rides inside section 11 as M5's own repair rather than taking a number of its own.**

**"No room below" is the body's own extent reaching the field's bottom edge, not the grave's position.** `fallenRungY` in `grave.ts` is the whole rule and it sits beside `FALLEN_RUNG_DROP`: the downfield y plus `POWER_UP_HALF_EXTENT` must land at or inside `FIELD_HEIGHT`, and otherwise the same 36.5 units are subtracted instead of added. **The switch is at a grave y of 709.5 of 760** at the size floor, which is the field's height less the drop less the body's own extent. A body dropped half off the field is a rung the player cannot read as catchable either, which is why the test is the extent and not the centre.

**Mirroring the offset rather than shrinking it is what keeps the swallow box clear on both sides.** An upfield body's bottom edge stands 4.5 units, one tick of the grave's own travel, above the grave's top edge, which is the same margin the downfield drop clears by. So the rung is not handed back on the tick it fell, which is the design gate's finding that `FALLEN_RUNG_DROP` was derived to answer in the first place.

**M5's prompt calls an upfield offset a stop and this ruling supersedes that for this case only.** What stood: a body spawned upfield of a grave with room below it is scrolled back into the swallow box within a tick or two and hands the rung to a player who only has to hold the lane, which is Salamander's shape and the one Mark rejected. What changed: with no room below, the alternative is not a downfield body, it is no body at all. What it could not have known is the frequency, which M5 measured after the rule was written: the hand under fire at the floor sits at the clamp most of the time it is stripped.

**The re-catch window, measured rather than derived.** With the grave standing still at the bottom clamp, a lone rung drifts at the scroll into its swallow box **8 ticks after it falls, about 0.13 seconds**. That is the 4.5-unit gap against the scroll's 0.633 units a tick. **A multi-rung strip is a different number and the spacing is why**: the grave's box is 18 units wide at the size floor and the bodies stand 45 and 135 units off its centre, so none of a two, three or four-rung spread ever enters the lane of a grave that does not move, and every one of them is carried past and off the bottom edge like any other body. **So the window is 8 ticks for the body in the grave's own lane and the length of the field for the rest of them.**

**The batch, on seeds 900 to 905 under `steady-far` and `loose-far`, the set M1 and M5 both measured.** Before: 5 strips, 10 rungs fell, 5 of them lost on the tick they fell, 5 on the field for at least a tick, **0 caught**. After: 11 strips, 17 rungs fell, **0 lost on the tick they fell, all 17 on the field**, and **7 caught by the hand**. Seven of the eleven strips had no room below the grave. **The runs are not the same runs**: a body that now exists changes what the hand's nearest-food rule steers at, so the counts diverge from the first strip onward, and three of the twelve runs last longer than they did, `loose-far` 902 going from 21326 ticks to 29853. **The bot only dodges, so a take rate of 7 in 17 measures the policy and not a player**, and what it says plainly is that a rung falling into the lane of a grave that stays where it is comes back quickly. That is the shape of this ruling and it is filed for Mark below rather than softened here.

**One measured baseline moved, and its cause is proved rather than assumed.** `harnessPolicy.test.ts`'s `ENDS_ABOVE_THE_BIRTHRIGHT` went from the empty set to `[101, 303]`. The probe that proves it walks all five seeds under the sharp hand and prints every fall and every catch: nine of the twelve rungs those seeds now drop fall with no room below, 101 catches a bell rung twice and 303 catches a skull rung five times, and those two are the seeds that outlast the stage's tick budget, so they end holding what they caught rather than being ground back before sealing. The re-pin carries that paragraph dated beside the four re-measurements already in that comment. **Nothing else in the suite moved**, checked by running it: `caps.test.ts`, `invariants.test.ts`, `measure.test.ts`, `digest.test.ts`, `corpses.test.ts` and `swallow.test.ts` are all green unchanged.

**Test 13 of M5's list is replaced by test 1 of this one.** *A strip with the grave at the bottom clamp drops bodies below the field and they are lost on the tick they fell* is gone, and *drops the bodies above the grave at the bottom clamp, where every one stands inside the field* stands in its place, with `cullCorpses` returning nothing as the assertion that the loss is no longer instant. **Three tests joined it**: the switch at the body's own extent, an upfield rung clear of the swallow box on the tick it falls, and an upfield drop spread and centred exactly as a downfield one in roster order. **The test-name diff is 2272 names in the baseline at this slice's own tip and 2275 now, 4 added and 1 removed**, and the one removed is exactly M5's test 13.

**Three files: `src/game/grave.ts`, `src/game/__tests__/grave.test.ts` and `src/dev/__tests__/harnessPolicy.test.ts`.** Nothing was created, deleted, merged or split, no import direction changed, and `src/game` still reaches nothing outward. `dropFallenRungs` reads one function where it read one expression, and nothing else in the module moved.

**Replay determinism with a rung above the grave at a checkpoint.** `loose-far` 902 played twice from the same seed: 29853 ticks both times, 497 checkpoints, every folded checksum identical, and a fallen rung standing above the grave at checkpoint 29400 in both plays.

**The four constants and `GOLDEN`, read off this slice's own tip before the first edit and unchanged after the last.** `WITNESS_VERSION` **11**, `READINGS_VERSION` **8**, `FORMAT_VERSION` **4**, and `GOLDEN`'s checksum **`-2049717150`**. **M5's at-most `GOLDEN` permit is still unused and this slice did not need it either**: the scripted scenario ends at size 24.10125 against a floor of 18, so `runFloorLadder` is never called in it and no rung can fall, let alone fall on either side of the grave. `digest.test.ts` was green at every run.

**Nothing in the dispatch or in either record was found false against the tree.**

**Filed for Mark, built past.** A rung dropped above a grave that stays where it is drifts back into it in 8 ticks, so at the bottom clamp the loss reads as a rung that leaves and returns rather than as a chase, unless the player moves off its lane. That is the price of the ruling and the alternative was the rung not existing at all. **The levers if he wants one, each a data row**: a longer upfield offset, so the drift takes longer, or the group offset on x as well as y at the clamp, so no body falls into the lane the grave is already in. **His own play is the other half of it**, and M6's grave y per strip is what says how often the case arises.

**Left for a later slice, each named.** M6 still declares the catch count, the rungs recovered per strip and the grave's y at each strip as readings; this slice printed all three off scratch scripts and declared nothing. **#81 and #122 are untouched** and neither is closed here.

**An anomaly, and it is not this slice's.** Two docs files were uncommitted in the shared worktree for the whole of this slice, `docs/push/step-5-slice-prompts.md` and `docs/research/score-inputs-precedent.md`, both of them another agent's edits to slice M7's material. Nothing under `src/` was dirty, nothing of theirs entered either commit, and the only trace they left is the CodeRabbit finding recorded in section 4.

## 12. Slice M6: the ladder's cost is measurable (#99)

**A batch now says what happened to the rungs the ladder took, where the player was standing when it took them, and what the bled-rung memory did.** Three new readings joined the graph beside `tuning.damageTaken`, none of them a second key for a count that already exists: the fallen-rung ledger, the strips' own circumstances, and the memory's transitions. **Nothing a player can meet changed.** Nothing under `src/game` or `src/app` is in the commit, no rule of the sim moved, and all four version constants and `GOLDEN` are untouched.

**One code commit, `e173dbad0f`, nine files, 1,022 insertions and 0 deletions**, against the prompt's realistic 5 to 10 and its honest expectation of the top of that range. Six are new: three reading modules and their three test files. Three are edits: `readings/readings.ts`, `batchReport.ts` and `compareRuns.ts`. **The test-name diff against a baseline captured at `3b1516e92f` before the first edit reads 2,292 names in the baseline and 2,302 now, 10 added and 0 removed.** The 2,292 is exactly where slice 8 left it. No test was deleted, skipped, weakened or renamed.

### The three readings, each with its denominator named

**`tuning.fallenRungLedger`, denominator the rungs that reached the field.** `fell`, `caught`, `lost` and `onFieldAtStop`, plus `ticksOnField`, one entry per rung in the order they fell. `fell` is counted off `rungFell`; `caught` off `rungCaught`; `lost` off a body leaving the field with no catch of its line unspent; `onFieldAtStop` off the pool at the last tick. **Fell equals caught plus lost plus on field at the stop, asserted in the reading's own test** rather than described, which is `powerUpLedger`'s own check on itself.

**`tuning.stripsLanded`, denominator the strips the ladder ran.** `graveY` and `gapUnderGrave`, one entry per strip in the order they landed, plus `atClamp` and `inBoss` as counts. The grave is read off the run's state at the end of the tick `weaponStripped` fired on, which is `tuning.gravePath`'s own read point and the second ruling's permitted one. The gap is measured under the rim and never under the centre, exactly as `gapUnderGrave` computes it and for that reading's stated reason.

**`tuning.bledRungMemory`, denominator the run's own ticks.** `ticksSet`, `timesSet`, `timesCleared` and `growthShortOfClearing`, read off the edge between one end-of-tick sample and the next. **The clear predicate is never re-run here**: what the reading reads is `grave.scoreRungBled` moving, and `growGrave` is the only thing that moves it back.

### `rungFell` does not fire for a cap-refused body, so the ledger is three arms

**Read off the landed code rather than assumed.** `spawnFallenRung` (`src/game/corpses.ts`) claims its slot first and returns an empty event list when `claimSlot` refuses, so the event never fires for a rung that never reached the field; `RungFell`'s own JSDoc in `events.ts` says the same in as many words. **So there is no refused arm and the denominator is bodies that reached the field**, which is also what keeps `state.refusals.food` out of this reading: that counter is every food refusal and not rungs alone, and reading it here would have put a number in a denominator that does not belong to it.

**The refusal case is still pinned by a test rather than left to the argument.** *lands a caught rung, one the scroll carried off and one still standing in their own arms, and counts a rung the cap refused in none of them* fills the corpse pool but for three slots, takes the four-line strip, and asserts `run.refusals.food` is 1 and `fell` is 3. **The input is proved able to produce presence**, which is the lesson a test asserting absence has to answer.

**And on the twelve birthright runs no rung was refused at all**: `fell` totals 17 across them and `tuning.damageTaken.linesStripped` totals 17 too, so every rung the ladder took reached the field.

### The batch, and section 14's table reproduced to the seed

**Seeds 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig, recorded on the committed tree at `e173dbad0f` with a clean identity: 12 of 12 verified, none unfinished, no ceiling stop, `readingsVersion` 8 on both.**

**The five `damageTaken` readings and `run.score` reproduce section 14's per-seed table exactly, every cell, both configurations.** This slice changes no rule, so a count that moved would have been a stop. **None moved.** The totals that ride on it are section 14's own too: **11 strips and 17 rungs fallen across the twelve.**

| reading | `steady-far` 900 to 905 | `loose-far` 900 to 905 |
| --- | --- | --- |
| `fallenRungLedger.fell` | 0, 0, 0, 3, 0, 0 | 0, 2, 6, 2, 0, 4 |
| `fallenRungLedger.caught` | 0, 0, 0, 1, 0, 0 | 0, 0, 4, 0, 0, 2 |
| `fallenRungLedger.lost` | 0, 0, 0, 2, 0, 0 | 0, 0, 2, 2, 0, 2 |
| `fallenRungLedger.onFieldAtStop` | 0, 0, 0, 0, 0, 0 | 0, 2, 0, 0, 0, 0 |
| `stripsLanded.atClamp` | 0, 0, 0, 1, 0, 0 | 0, 0, 2, 0, 0, 0 |
| `stripsLanded.inBoss` | 0, 0, 0, 0, 0, 0 | 0, 0, 1, 0, 0, 2 |
| `bledRungMemory.timesSet` | 1, 1, 1, 1, 1, 1 | 1, 1, 1, 1, 1, 2 |
| `bledRungMemory.timesCleared` | 0, 0, 0, 0, 1, 0 | 0, 0, 0, 0, 0, 2 |
| `bledRungMemory.growthShortOfClearing` | 0, 0, 0, 0.72, 0.70, 0 | 0.28, 0, 2.59, 0.42, 0, 3.37 |
| `bledRungMemory.ticksSet` | 48, 33, 27, 1785, 3140, 130 | 2139, 58, 8656, 1076, 117, 14769 |

**What the twelve say, as readings and never as verdicts.** 17 rungs fell, **7 were caught, 8 were lost off the bottom edge and 2 were still standing when the run stopped**, and the three add to the 17. **3 of the 11 strips landed against the bottom clamp** and 3 landed with a boss on the field. The memory was set 13 times and **cleared 3 times**, so in 10 of 13 arms the grave never grew a full hit's worth off the floor again before the run ended. **The growth that arrived while it stood set and left it set totals 8.08 size units across the twelve**, against a threshold of `HIT_SHRINK` 3: only `loose-far` 905, the run that cleared twice, carries a figure above 3.

**The spans, which are the ticks a rung stood on the field.** `steady-far` 903's three read 25, 83 and 109 ticks. `loose-far` 902's six run 7 to 131 with a median of 8, 903's two are 106 each, and 905's four run 2 to 157 with a median of 3. **A span of 2 or 3 ticks is the hand-back M5-fix filed**: a rung dropped above a grave that has not moved is back inside the swallow box almost at once, and `loose-far` 902 and 905 are where that shows.

### `weaponStrips` set beside the storm's 2.47 kills a second

**The figure R4's mechanism was ruled against is a rung-5 build's, and these twelve runs are not that build.** `steady-far` kills **0.61 bodies a second** across 138,182 ticks and `loose-far` **0.60** across 157,839, which is about a quarter of the 2.47 (`step-4-progress.md` section 18). **So the twelve say nothing about whether autofire re-arms the rung at the rate R4 was written against**, because the birthright rig never reaches the build that produces it.

**Against that, strips are rare: 2 in `steady-far` and 9 in `loose-far`, which is 0.05 and 0.21 strips a minute.** Stated as a reading and nothing more; whether that is the right frequency is the tuning step's question and Mark's play.

### The ladder rig could not be batched at all, and the cause is already filed

**`scripts/batch.ts ... rig=ladder` runs and verifies nothing: 0 of 12 verified, all twelve `diverged`, and the report carries no readings at all** (`spreads` is empty and `identity.rigs` is `[]`, because only a verified run is collected). **This is exactly the gap slice 8 filed by name**: a tape header carries no score, `runFromHeader` rebuilds the run from the header alone, and `witness.ts` folds `run.score`, so a run staged holding a score replays from zero and diverges at the first checkpoint (section 14, "The tape-header gap, plainly, and filed rather than taken", which names `batch.ts` and `rig=ladder` as the one shell still carrying it). **Nothing here closes it**: the fix is a header field and a `FORMAT_VERSION` move, and M6 is permitted none.

**The route slice 8 proved verifiable was taken instead**, three conditioned ladder tapes at `rig=ladder score=0`, seeds 404, 900 and 902 at 6,000 ticks, each `outcome: 'verified'` and banded as the `ladder` rig off its own header. The run earns its score by play off a maxed build and reaches the floor by play, which is what makes it verifiable.

| | 404 | 900 | 902 |
| --- | --- | --- | --- |
| ticks, ending | 3277, sealed | 2416, sealed | 1686, sealed |
| `damageTaken` strips / lines | 5 / 19 | 5 / 20 | 5 / 19 |
| `fallenRungLedger` fell / caught / lost / on field | 19 / 0 / 19 / 0 | 20 / 0 / 16 / 4 | 19 / 0 / 12 / 7 |
| `stripsLanded` graveY | 606.1 to 606.9 | 606.1 to 608 | 605.7 to 608 |
| `stripsLanded` atClamp / inBoss | 0 / 0 | 0 / 0 | 0 / 0 |
| `bledRungMemory` set / cleared / growth | 1 / 0 / 0 | 1 / 0 / 0.101 | 1 / 0 / 0 |

**58 rungs fell across the three and not one was caught, and that is the hand rather than the mechanic.** `record-conditioned.ts` steers with the wandering script and not `harnessPolicy`, which the tapes say themselves: `provenance.policy` reads `script` and `exclusions` carries `script`, `policy` and `conditioned`. **A hand that never dives at a body cannot catch one**, so the zero here measures the script and the 7 of 17 above measures the policy. **The spans are the useful half**: 205 to 208 ticks, about 3.45 seconds, which is a rung falling at the start mark and riding the scroll to the bottom edge untouched, and it is R6's own "roughly three seconds of field left" measured rather than derived.

### The bot's number, what it measures and which way it is off

**7 of 17 fallen rungs caught across the twelve birthright runs, 41 percent.** **It measures the policy and never a player** (ADR 0053), and `harnessPolicy`'s `pointWanted` was read at this tip rather than taken from any record: the hand wants the live offer's nearest body, else `nearestFood`, else `HOME`, and `nearestFood` (`src/dev/bot.ts`) walks every alive corpse without looking at its kind. **So a fallen rung is one candidate among every body on the field and a live offer outranks it outright.**

**Which way it is off, and it is off in both directions at once.** It is **short** of a player who decides to dive for a particular rung, because the hand never decides to; and it is **long** of a player who never noticed one, because the hand can swallow a rung by accident while walking at something nearer. **So it is neither a ceiling nor a clean floor**, and ADR 0055's sentence that the base policy will always walk to a body at the bottom of the field is not what the tree does. **Nothing here amends the ADR**, which is Mark's and which record section 7 already carries the correction for. **It is never a reason to skip his own play.**

### `READINGS_VERSION` held at 8, with the rule quoted and the file absent from the commit

**`readingsVersion.ts`'s own rule, quoted: "Bump it when an existing reading changes meaning, or when comparison semantics change, in a way that leaves old and new reports not directly equivalent. Adding a brand-new reading beside unchanged ones does not bump it: every old reading still means what it meant."**

**Every one of M6's thirteen declared paths is new and not one existing reading changed meaning**, which was checked and not assumed: the five `damageTaken` readings and `run.score` reproduce section 14's table cell for cell, which is the same claim stated as a measurement. **So the version is held and `readingsVersion.ts` is not in the commit**, because it is on the step's must-not-move list and a prose edit inside it would still be a file in the diff. That is round two's slice I quoting the same rule to say the opposite.

**The step's two moves are both `run.score`'s and neither is mine**: M1's 7 to 8, landed, and M7's 8 to 9, which follows.

### The four constants and `GOLDEN`, read off this slice's own tip

**`WITNESS_VERSION` 11 (`witness.ts:196`), `READINGS_VERSION` 8 (`readingsVersion.ts:203`), `FORMAT_VERSION` 4 (`wireCodes.ts:50`) and `GOLDEN`'s checksum `-2049717150` (`digest.ts:518`), with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` inside it.** Each was read off the tree before the first edit and read again after the last, and each held. **None of `witness.ts`, `readingsVersion.ts`, `wireCodes.ts` or `digest.ts` is in either commit.**

**No determinism run and no `GOLDEN` re-pin is owed, and the claim was checked rather than assumed.** Nothing under `src/game` is in the commit, every new module is under `src/dev`, and `digest.test.ts` was green at every run.

### CodeRabbit, one iteration: nine files, one finding, the fix declined and the honest half taken

**`coderabbit review --agent --uncommitted` from the worktree root with all nine files staged by path: 9 files reviewed, one finding, minor.** The worktree held no other agent's edits, so the review saw this slice's nine files and nothing else.

- **Declined, minor**, on `bledRungMemory.ts`. It asks `growthShortOfClearing` to sum growth off ordered events during a tick rather than off the size edge, so that growth is counted even when a hit's shrink on the same tick offsets it. **The under-count is real and the fix it names is not available**: no event carries the size a swallow paid, `swallowed` carrying the payout and the freshness, so the growth would have to be recomputed as `payout * freshnessScale(freshness)` against `growGrave`'s own ceiling clamp, which is a second copy of two sim rules inside `src/dev` and is what this slice's second ruling forbids by name. Adding an event is `src/game` and is out of this commit by the same ruling. **What was taken instead is the honest half**: the reading's JSDoc now names the residual, that growth landing on the same tick as a shrink is netted away and is bounded by that tick's own swallows, so the figure cannot be read for more than it is. **The residual is small in what the batch measured**: the memory is set only at or near the floor, where a hit does not shrink at all, so the masking needs a swallow and a shrinking hit on one tick.

### Verification

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, and **`pnpm verify` green twice at the repo root**, 154 test files, 2,291 passed, 11 expected fail, 2 todo, both times. The build's chunk-size warning is the pre-existing one.
2. **Agent.** The test-name diff, 2,292 to 2,302, 10 added and 0 removed, above.
3. **Agent.** The batch with every new reading printed, and `weaponStrips` set beside the storm's 2.47 kills a second, above.
4. **Agent.** The fences green, each by title. `batchReadingDeclared.test.ts`: *every reading declares how a batch reduces it* in both its parts. `comparisonDeclared.test.ts`: *every reading declares what comparing it means*. `harnessStatesNoTarget.test.ts`: *the harness reports and never judges* in all three parts, *orders no reading against a number of its own*, *carries no verdict, because nothing it declares is a yes or a no* and *prints no mean, so every figure it prints keeps its own tail*. `boundary.test.ts`: *the test-span fence*, *src/dev imports only from src/dev and src/game and src/tape*, *the rendering-import boundary*, *the core has no import cycle* and slice D's sixth *the cap derivation reads tables and never the stage*. `lineAgnosticPolicies.test.ts` and `executionFence.test.ts` green. **The core's cycle guard is green with `KNOWN_CORE_CYCLES` still `[]`.**
5. **Agent.** The four constants and `GOLDEN` untouched, none of their four files in either commit, above.
6. **Human (Mark), and none of it blocks anything.** Section 7's findings are his, and these numbers are the evidence beside the questions rather than the answers to them.

### An anomaly chased rather than waved off: `pnpm verify` was already red on the branch

**`prettier --check` failed on `apps/hungry-grave/CONTEXT.md` before this slice touched anything**, on a doubled blank line between the Rig entry's amendment paragraph and the Batch entry. **It arrived in slice 8's docs commit `5421919529`**, which is the commit that added the Rig row, and slice 8's own `pnpm verify` runs were made on its code commit's tree before that docs commit existed, so nothing had run the standing check since. **Reproduced rather than assumed**: the file is clean in git and `prettier --write` removes exactly that one line.

**The blank line is removed in this slice's docs commit**, because `pnpm verify` is a standing check every slice after this one owes and a red one teaches a reader to stop reading it. **It is whitespace and nothing else**: no word of `CONTEXT.md` changed, and the file is not in the code commit.

### Record and prompt claims found false against the tree

**The three new tests sit at `src/dev/__tests__/` rather than beside their readings, and the span fence is what decided it.** The prompt tells the slice to stage its floor runs with `RIGS.ladder` (slice 8, #107) rather than with hand-built state, and a test under `src/dev/readings/__tests__/` reaching `src/dev/rigs.ts` is a span violation: `SAME_ROOT_ALLOWANCES` gives `game` and `engine` a blanket and gives `dev` none, so `boundary.test.ts`'s *the test-span fence* refuses it. **The intent was followed and the placement follows the rule the fence states**: a test sits in the test folder of the lowest folder holding everything it spans, and that is `src/dev`. Each file says so in its own header.

**The prompt's ladder-rig batch cannot be run, and the reason was already filed.** Item (i) asks for a batch on `rig=ladder` where a zero would be the finding. `batch.ts` accepts the row and the readback diverges on every seed, which is slice 8's own filed gap, recorded above with what was measured instead.

**`batchReport.test.ts` and `compareRuns.test.ts` did not turn red.** The prompt's expected-red list names both. Neither asserts an exhaustive reading list of its own, so the two declaration fences are what a new reading turns red, and they did. **Checked by running them rather than assumed.**

### Left for a later slice, each named

**Slice M7 owns the score's other inputs and the step's second `READINGS_VERSION` move, 8 to 9.** Nothing here touches `run.score`'s meaning, and the three new readings arrive beside unchanged keys.

**Widening the tape header so a staged score replays is still slice 8's filed item and is still not taken**, and it is what a `rig=ladder` batch needs before it can report anything at all. `batch.ts` still says nothing about the readback when it is handed that row.

**Nothing in `CONTEXT.md` gained or lost a word, no ADR was filed or amended, no record was edited, and neither ticket was opened or closed.** No cap moved, no measured baseline moved and nothing was re-pinned anywhere.

## 14. Slice M1-stage: the ladder is staged in the harness (#99)

**The harness can now play the one scenario it was built for and could not reach.** A run starts at the size floor, at chosen levels, holding a chosen score, by naming one row; a scenario walks that run hit by hit and reports what each hit cost; and the command line records the same start as a tape. **Nothing a player can meet changed.** No event, no magnitude, no screen, no rule of the sim: `bleedScore`, `runFloorLadder`, `stripLevels`, `strippableLines`, `sealShut`, `hitGrave` and `growGrave` keep their bodies exactly, `SCORE_BLEED_CAP` keeps its value, and the only line under `src/game` that is not a test or a comment is `createRun`'s new parameter and the `score` it now reads.

**14 files in the one code commit**, four of them new. The prompt's realistic count is 7 to 10 and section 5 records why it was short. **The test-name diff against a baseline captured at `1f11b66a7d` before the first edit reads 2277 names in the baseline and 2292 now, 15 added and 0 removed.** No test was deleted, skipped, weakened or renamed.

### The parameter, last in the list, and the eight call sites checked

**`createRun` gains `startingScore: number = 0`, appended after `signalLock`.** The signature is positional, so a parameter inserted after `startingSize` would have silently re-read every existing call's third, fourth and fifth argument. Its JSDoc paragraph says it is the score the run begins holding, names the rigs' ladder row and the walk that plays it as its callers, says no player-facing caller names it, and says that no tape header carries a score so a run staged with one replays from zero.

**All eight call sites outside the tests were read and none changed**, in seven files: `src/tape/playback.ts`'s `runFromHeader`, `src/dev/digest.ts`'s `runScenario`, `src/dev/harnessRun.ts`'s `playHarnessRun`, `src/app/screens/FrameBudgetScreen.ts`, `src/app/screens/game/runSession.ts`, `scripts/record-conditioned.ts`, and `scripts/frame-budget.ts` twice. Only `playHarnessRun` and `record-conditioned.ts` were touched at all, and both were touched to pass a rig's own score rather than because the parameter moved anything under them.

### The rig row, its score, and `rigOf` left at two arguments

**`RIG_NAMES` gains `ladder` and `RIGS.ladder` starts at `SIZE_FLOOR`, at `uniformLevels(MAX_LEVEL)`, holding `LADDER_RIG_BLEEDS * SCORE_BLEED_CAP`.** `Rig` gains `startingScore` and both existing rows state it as zero, because both halves of a rig are stated together and a row that left it implicit would rebuild #107's own defect. `playHarnessRun` passes all three through, so a rig is never half applied, and `harnessRun.test.ts` plays a whole run on the row and reads its header back to say so.

**`LADDER_RIG_BLEEDS` is 3, stated as a multiple of the cap and never as a bare figure, which makes the row's score 6,000 points.** **What it was set against**: the least multiple that leaves a remainder legible. At twice the cap the score standing after the first bleed is exactly the cap again, and a walk's table then cannot be read apart from one where the cap itself stayed; at three the remainder is plainly neither the cap nor zero. **What would move it**: `SCORE_BLEED_CAP`'s own value, which is re-read after slice M7, and a walk that wanted more than one bleed in it, which needs the grave to grow off the floor rather than a larger score. Annotated as a first figure in the row's own JSDoc.

**`rigOf` keeps its two arguments and gains no third, and `rigs.test.ts`'s uniqueness key stays size plus levels.** A tape header carries a seed, a size, a roster, levels and a signal lock, and no score at all, so a banding rule that read the score would answer null forever and two rows differing only by score would be unbandable. The narrow key is what keeps that defect impossible, and the reason now sits in `rigOf`'s own JSDoc rather than only here. The three rows stay unique on the size and the levels alone: birthright and maxed start at `SIZE_START` and differ by levels, and the ladder row differs from maxed by size.

### The comment that went false, and what it says now

**Before**: "The ceiling rig and the ladder rig the record names have no row here because nothing plays them through the harness; a row for either is a row the day something does." **After**: the first two rows keep their power-curve paragraph, the ladder row gets one of its own naming the floor ladder as the scenario nothing here could play, and the last sentence reads "The ceiling rig the record names still has no row, because nothing plays it through the harness; a row for it is a row the day something does." The ceiling rig is still unrowed and still waiting.

### The scenario, its returned shape, and the per-hit table whole

**`src/dev/floorLadderWalk.ts`, one concept and one export: `walkFloorLadder`, a staged walk of the floor ladder.** It is its own file rather than a second scenario inside `digest.ts`, whose concept is the golden scenario and its constant; the surest way `GOLDEN`'s own run could not move is that its file is in neither commit. The walk builds the run from the ladder row, drives it through `executeTick`, the one execution authority, and returns rows and the run it left behind. **It prints nothing and asserts nothing**, because `src/dev` may import no bare package, vitest included, so its guard cannot travel with it.

**One row per forced hit**: the tick, the grave's size going in, which rung of the ladder fired, the score before and after, the lines that paid, the levels after, and the ending. The size is there because a hit above the floor shrinks instead of laddering, so a walk that grew off the floor reads as a grave that left rather than as a ladder that stopped firing. **Before every forced hit the walk clears `grave.invulnerable` directly and re-stages the mob** rather than waiting the window out, because a kill or a crumb swallowed inside a live window grows the grave above `SIZE_FLOOR`.

**The table, printed off a scratch script in `local/step5/` and pasted whole.** Ladder rig: size 18 against a floor of 18, score 6,000 against a cap of 2,000, budget 8 hits. Levels read as the line's initial and its level, in roster order.

| hit | tick | size before | event | score before | score after | lines that paid | levels after | ending |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 18 | scoreBled | 6000 | 4000 | none | s5 t5 w5 b5 | live |
| 2 | 1 | 18 | weaponStripped | 4000 | 4000 | skullStream, territory, wisps, bell | s4 t4 w4 b4 | live |
| 3 | 2 | 18 | weaponStripped | 4000 | 4000 | skullStream, territory, wisps, bell | s3 t3 w3 b3 | live |
| 4 | 3 | 18 | weaponStripped | 4000 | 4000 | skullStream, territory, wisps, bell | s2 t2 w2 b2 | live |
| 5 | 4 | 18 | weaponStripped | 4000 | 4000 | skullStream, territory, wisps, bell | s1 t1 w1 b1 | live |
| 6 | 5 | 18 | weaponStripped | 4000 | 4000 | territory, wisps, bell | s1 t0 w0 b0 | live |
| 7 | 6 | 18 | sealed | 4000 | 4000 | none | s1 t0 w0 b0 | sealed |
| 8 | 7 | 18 | sealed | 4000 | 4000 | none | s1 t0 w0 b0 | sealed |

**Read plainly: the bleed takes the cap and leaves 4,000 standing, then one strip per hit takes a rung off every line still above its floor, then the seal, then nothing more.** The sixth hit is the one that shows `stripLevels`' own rule rather than a uniform sweep: skullStream reached its birthright floor of 1 on the fifth, so only the other three paid. `LADDER_HIT_BUDGET` is `MAX_LEVEL + 3` and is derived rather than typed, the bleed plus one strip per rung above the floor plus the seal plus the hit past it, and the walk stops there so a rule change that made the ladder infinite fails a test instead of hanging.

**What the hit past the seal does, which is the case the audit found nothing in the tree asserts: it runs the ladder again and re-seals, and it costs nothing.** `graveHit` fires, `runFloorLadder` finds the rung already bled and no line above its floor, `sealShut` sets the same ending and fires `sealed` a second time. The score does not move and neither do the levels.

### The staging helper, moved, and the fence that permits its import

**`standOnGrave` left `src/app/__tests__/screenLifecycle.test.ts` and is `standMobOnGrave` in `src/dev/staging.ts`**, whose concept is staging a run into a state a play would take minutes to reach. The recommended name and file are what landed: with both callers in front of it, nothing read truer. The app test imports it and keeps no copy, and its three call sites and two test promises are otherwise untouched. Its 100x health multiplier is now a named `UNKILLABLE` with the reason beside it, and the slot-zero choice has a sentence saying why it is not a spawn: a spawn is refused once the pool is full, and a staged hit that silently did not happen is the one reading a scenario cannot afford.

**The fence was run rather than trusted.** `boundary.test.ts`'s *the rendering-import boundary* is green: the `app` row is scoped `only: ['sound.ts']`, so no row governs `src/app/__tests__`, and *src/dev imports only from src/dev and src/game and src/tape* still holds. **The span fence is the one that could have refused it and does not**: `spanViolationsInSource` allows a reach whose root differs from the subject's, so an `app` test reaching `dev` is allowed by the same clause that lets a `tape` test build a run. *the test-span fence* and its four cases are green.

### The two flags, the refusals, and the warning's exact wording

**`record-conditioned.ts` gains `rig=<name>` and `score=N`, keyed arguments in the shape `batch.ts`'s `parseRig` already uses, both optional, and the usage line carries both.** Without either, the command means exactly what it meant before: every line's level required, the size left to the sim's default, and a score of zero. A named rig passes through whole, its size, its levels and its score, because `recordTape` used to pass `undefined` for the size and a rig applied without its size is a rig half applied.

**A command naming a rig and naming the line levels too is refused with the reason**, because the row already states them and a command that states them twice can state them differently: `rig=ladder already states every line's level, so skullStream=5 territory=5 wisps=5 bell=5 states them a second time; no tape was recorded`. **A key named twice is refused as well**, which is CodeRabbit's finding and the rule `parseLevels` already held for a line named twice: `score=1 score=2 names a score more than once; no tape was recorded`. An unknown row is refused by name: `floor names no rig (the rigs are birthright, maxed, ladder)`.

**A score named beside a rig is an override and not a refusal, and the slice's own verified tape is why.** The first cut refused it on the same argument as the levels, and that refusal blocked the exact command ruling four asks for, the ladder rig at a starting score of zero. It was backed out: the size and the levels still come from the row, `score=N` replaces the row's score, and the JSDoc says that this is the one way to record a verifiable tape from a row whose score is not zero.

**A non-zero score warns before the write, never after, in these words**: `this run starts holding 6000 and a tape header carries no score, so a readback rebuilds it from zero and diverges at the first checkpoint; the tape records what the run played and can never be verified against it`.

### The tape-header gap, plainly, and filed rather than taken

**A staged score does not survive a replay, and that is arithmetic rather than a defect.** `TapeHeader` carries the seed, the starting size, the roster, the starting levels and the signal lock, and `playback.ts`'s `runFromHeader` rebuilds a run from those alone, while `witness.ts` folds `run.score` beside `run.reservoir`. So a tape recorded from a run that started holding a score replays from zero and diverges at the first checkpoint. **The header was not widened and `FORMAT_VERSION` stays 4.** **Widening it so a staged score replays is filed for a later slice and not taken here**, and the warning above is what keeps the gap from being silent in the meantime.

**One shell still has the gap and this slice did not close it.** `batch.ts` takes `rig=<name>` and would now accept `rig=ladder`, whose row holds a score, and it says nothing about the readback. **Filed rather than taken**, because the prompt names `record-conditioned.ts` as the one shell that gains the warning, and because the honest fix may be one report at the place a header is built from a run rather than two copies in two shells.

### The already-ended question: the guard belongs to the loops, so the test is an absence

**Read rather than assumed, in all three places.** `advance.ts` breaks on `execution.run.ending !== null` before it executes a tick. `executeTick`'s own JSDoc says it does not read its own stop reason or the run's ending and names the loops above it as the owners (#52), and says why: verification readback deliberately guards on the stop alone, because a sealed `FORMAT_VERSION` 1 tape can carry ticks after its ending and a readback must feed every command a tape holds. `hitGrave` has no such check. **So the guard belongs to the loops above and a guard inside `hitGrave` would change what such a tape recomputes at its checkpoints.**

**The test written is therefore the absence**, in `grave.test.ts`: *a hit on a run already sealed runs the ladder again: the ending guard belongs to the loops above (#52)*. It fails the day a guard appears, and `hitGrave`'s JSDoc carries the short why-comment beside the code. **Both were proved rather than claimed**: adding `if (state.ending !== null) return [];` to `hitGrave` turns that test and the walk's past-the-seal test red, and removing it turns them green again.

### The other missing test, and the red that was watched rather than assumed

**A floor hit at zero score with the rung still armed drops bodies**, pinned at the `grave.ts` seam in the rungs-drop block. Every other body test there sets `scoreRungBled` true by hand first, so the strip that runs on the very first hit of a scoreless run shared its bodies with a path nothing asserted directly, and it is exactly the hit the harness's own staged walk starts on when the row's score is zero.

**Both new `createRun` tests were proved to have teeth the same way**: reverting `score: startingScore` to `score: 0` turns five tests red across `run.test.ts`, `rigs.test.ts` and `floorLadderWalk.test.ts`, and restoring it turns them green. The tests were written against throwing stubs before the scenario existed, but **the first run of them came after the fill rather than before it**, so the red was reconstructed by breaking each behaviour rather than watched on the way in. That is recorded rather than dressed up.

### The conditioned ladder tape, recorded on the row and driven to the seal

**`pnpm vite-node --config vite.headless.config.ts scripts/record-conditioned.ts local/step5/m1stage-ladder.tape 404 6000 rig=ladder score=0`**, recorded on the committed tree at `78b2d85fe8` with a clean build identity. It measures to **`outcome: 'verified'`** at `readingsVersion` 8, banded as the `ladder` rig off its own header.

**3,277 ticks, ending sealed, integrity clean, 55 of 55 checkpoints verified and none unreachable, score 3,700, kills 49.** Its ladder: **7 hits, one bleed of 2,000, five strips taking 19 line-levels, and one seal.** **It reaches the seal, which slice M1-fix's own conditioned tape did not**: that one started at `SIZE_START` and verified with one bleed, one strip and no seal. The difference is the row, not the steer: the wandering script is unchanged, and starting at the floor is what puts the ladder in front of it. The run earns its own score by play off a maxed build and the bleed is reached by play, which is what makes the tape verifiable at all.

**The superseded tapes are untouched.** `local/step5/` enters no commit and nothing in it was deleted.

### The shell's old behaviour, byte for byte

**Two recordings of the same old-style command on this tip, `404 6000 skullStream=5 territory=5 wisps=5 bell=5`, are 56,437 bytes each and differ at two byte offsets, 197 and 198**, which is `recordedAt`'s varint and nothing else. **And it plays the same run it played before the flags existed**: it measures to `outcome: 'verified'` at `readingsVersion` 8 with 6,000 ticks, 101 checkpoints, 5 hits, one bleed of 2,000, one strip of four line-levels and no seal, which is slice M1-fix's own recorded reading for this tape to the event.

### The batch: event counts identical to slice 7's, per seed

**Seeds 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig, 12 of 12 verified, `readingsVersion` 8, recorded on the committed tree at `78b2d85fe8` with a clean identity.** This slice changes no rule, so a count that moved would have been a stop rather than a finding. **None moved.**

| | `scoreBled` | `scoreBleeds` | `weaponStrips` | `linesStripped` | `seals` | `run.score` |
| --- | --- | --- | --- | --- | --- | --- |
| steady-far 900 | 2000 | 1 | 0 | 0 | 1 | 11600 |
| steady-far 901 | 2000 | 1 | 0 | 0 | 1 | 12900.94 |
| steady-far 902 | 2000 | 1 | 0 | 0 | 1 | 18600.76 |
| steady-far 903 | 2000 | 1 | 2 | 3 | 1 | 36002.40 |
| steady-far 904 | 2000 | 1 | 0 | 0 | 0 | 56112.39 |
| steady-far 905 | 2000 | 1 | 0 | 0 | 1 | 13800 |
| loose-far 900 | 2000 | 1 | 0 | 0 | 1 | 17306.89 |
| loose-far 901 | 2000 | 1 | 1 | 2 | 1 | 24804.29 |
| loose-far 902 | 2000 | 1 | 5 | 6 | 1 | 35403.14 |
| loose-far 903 | 2000 | 1 | 1 | 2 | 1 | 34501.47 |
| loose-far 904 | 2000 | 1 | 0 | 0 | 1 | 10400.35 |
| loose-far 905 | 4000 | 2 | 2 | 4 | 0 | 48415.54 |

**Every `run.score` is slice M1-fix's own after-column figure exactly**, and every `scoreBled` is too, `loose-far` 905's double bleed of 4,000 included. **11 strips and 17 rungs fallen across the twelve**, which is M5-fix's and M1-fix's own pair. **`loose-far` 902 ends at 29,853 ticks**, the figure both earlier notes carry to the tick. Endings are 5 sealed and 1 victory in each configuration.

### Replay determinism at this tip

**Seed 909 under `shaky-short`, birthright rig, played twice on the committed tree: 5,997 ticks both times, 56,402 bytes both times, three differing bytes at offsets 202 to 204, and both tapes verify at 100 of 100 checkpoints.** Those three bytes are `recordedAt`, and every figure here is slice M1-fix's own for this seed to the byte.

### The four constants and `GOLDEN`, read off this slice's own tip

**`WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4, and `GOLDEN`'s checksum `-2049717150`**, each read off the tree before the first edit and read again after the last, and each held. **None of `witness.ts`, `readingsVersion.ts`, `wireCodes.ts` or `digest.ts` is in either commit.** `digest.test.ts` was green at every run, which the scenario's own numbers explain unchanged: it ends at size 24.10125 against a floor of 18, so `runFloorLadder` is never called in it.

### `CONTEXT.md`: one entry amended, three checked and left alone

**The Rig entry had gone false and is amended in place.** It said six rigs exist with "the two the harness plays out of", and the harness now plays out of three rows; a rig's starting condition is now the size, the levels and the score together. The amendment keeps the file's own triple: what stood is everything the entry says a rig is, what changed is the third row and the third fact, and what it could not have known is that nothing could start a run holding a score when it was written.

**Score, Size floor and Rung were read and left alone, and here is the decision.** None of them says anything about where a run starts or what a harness can stage: Score names what feeds the number and what the ladder spends, Size floor names the ladder's order, and Rung names what a rung is and what a stripped one becomes. This slice changes none of that. The Score entry's 2026-09-16 amendment about the cap is untouched and still true.

### CodeRabbit, one iteration

**`coderabbit review --agent --uncommitted` from the worktree root with all fourteen files staged by path: 14 files reviewed, one finding, applied, nothing declined.** The finding is a minor on `record-conditioned.ts`: `valueOf` took the first match for a keyed argument, so `score=1 score=2` silently resolved to the first. It is real and it is the rule `parseLevels` already held for a line named twice, so a repeated `rig=` or `score=` is now refused by name. The worktree held no other agent's edits this time.

### Verification

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, and **`pnpm verify` green twice at the repo root on the committed tree**, 151 test files, 2281 passed, 11 expected fail, 2 todo, both times. The build's two warnings are the pre-existing #50 and #51.
2. **Agent.** The test-name diff, 2277 to 2292, 15 added and 0 removed, above.
3. **Agent.** The four constants and `GOLDEN`, above, none of their four files in either commit.
4. **Agent.** The staged walk end to end, its per-hit table above whole.
5. **Agent.** The conditioned ladder tape on the ladder rig at a score of zero, driven to the seal, `outcome: 'verified'`, its readings above.
6. **Agent.** The batch on slice M1-fix's own twelve seeds, event counts identical per seed, above.
7. **Agent.** Replay determinism on seed 909 under `shaky-short`, above.
8. **Agent.** The fences green, each by title. `boundary.test.ts`: *the rendering-import boundary*, *the test-span fence*, *the screen graph is declared in one place*, *the engine accessor is out of the app*, *the core has no import cycle*, slice D's sixth *the cap derivation reads tables and never the stage*, *the lock is owned by a module with nothing behind it* and *the tape codec parses a header without the director*. `lineAgnosticPolicies.test.ts`: *no weapon line walks the mob pool*, *a policy names no weapon line*, *no boss and no set piece names a weapon line*, *a line's constants are declared in that line's own module*, *only the offer draws from the power-ups stream* and *one module draws each stream*. `executionFence.test.ts`: *the step fence (ADR 0017)*. `harnessStatesNoTarget.test.ts`: *the harness reports and never judges*. `comparisonDeclared.test.ts` at `src/dev/__tests__/`: *every reading declares what comparing it means*. **The core's cycle guard is green with `KNOWN_CORE_CYCLES` still `[]`.**
9. **Agent.** CodeRabbit CLI, one iteration, before the code commit, above.
10. **There is no Mark actor in this slice, and this tip is not a deploy.** Nothing a player can meet changed, so there is nothing on it for him to see.

### What was expected to turn red and did not

**Nothing turned red at all, which the prompt names as the claim to check and which was checked by running it.** `rigs.test.ts` compiles against a widened `Rig` and its uniqueness assertion is green as written with the third row in it. `screenLifecycle.test.ts` compiles against the moved helper and both its ladder promises keep their names. `digest.test.ts`, `harnessPolicy.test.ts`'s measured baselines, `bot.test.ts`'s `BLEEDS_SCORE`, `endings.test.ts` and `witness.test.ts` are all green unchanged. No measured baseline moved and nothing was re-pinned anywhere.

### What is left for a later slice, each named

**Slice 9 (M6) declares the readings.** This note prints the walk's rows, the tape's ladder and the batch's counts off scratch scripts and declares nothing, which is the first consumer of what this slice built. **Widening the tape header so a staged score replays** is filed above and not taken. **The batch shell's own divergence warning** is filed above. **A docs pass owns the label collision** in the next entry. Nothing in `CONTEXT.md` beyond the Rig entry was touched, no ADR was filed or amended, and neither ticket was opened or closed.

## 13. Slice M7: the score's other inputs (#99)

**The score had two inputs and R4 rules five. This slice pays the other three**: boss damage per hit landed, the Waking's source killed as one bonus on the kill, and large food taken while every rostered line stands at its top rung. **The kill's row and the overflow trade nothing**, which the batch says exactly rather than approximately: every one of the twelve birthright runs ends on its slice-9 figure plus its own boss damage and nothing else.

**One code commit, `6665fad6d4`, 30 files**, against the prompt's realistic 16 to 26 (section 5 records what the estimate was short by). **The test-name diff against a baseline captured at `5c02f1e870` before the first edit reads 2,302 names in the baseline and 2,329 now, 28 added and 1 removed.** The 2,302 is exactly where slice 9 left it. The one removed is `holds twenty-three identities against twenty-four checks, six of them fatal`, renamed to twenty-four against twenty-five. No test was deleted, skipped or weakened.

### The three weights, what each was set against, and its ratio to a trash kill

**Boss damage: `SCORE_PER_BOSS_HEALTH`, one trash kill per 100 points of boss health taken**, which is `TRASH_KILL_SCORE / 100` and one point of score per point of health. **The row carries the rate and never the fight**: what a fight pays is the rate times that boss's own `PHASE_HP`, so a step 6 retune of either moves it and no figure goes stale. **The ratios are derived in prose**: the Banshee's 2,200 health is 22 trash kills and the Undertaker's 5,100 is 51, both inside the research's band of 20 to 70 trash kills for a single input (`score-inputs-precedent.md` section 4). **What it was set against is the swamping refusal**: the mob table pays one trash kill per 8 points of health, floored, and that rate on a boss would pay 637 trash kills for the Undertaker, more than the whole rest of a run makes. The refusal is pinned by a test that reads the row, the mob row and `PHASE_HP` and types no number of its own.

**The source killed: `SOURCE_KILL_SCORE`, 24 trash kills, stated as `24 * TRASH_KILL_SCORE`** exactly as `SCORE_BLEED_CAP` states itself. **Derived rather than picked**: at the same hundred-health rate its 2,400 health is 24. **What settles the tier is what it is to the player and never its health.** The genre puts a spawner at 6x to 10x across Robotron, Gradius and Defender, and a structural core or a stage objective at 30x to 130x across Bosconian, Gradius and Xevious. The source sits between them: above the spawner tier because it is the section's objective rather than roadside furniture, and below the core tier because a core kill in all three of those games ends or denies something and **#104 keeps the pour running whatever the storm did**, so there is no denial premium here at all. The row's own comment says so, so a later reader does not reach for Xevious's milk-then-deny or Robotron's safety premium.

**Large food at a maxed ladder: `MEAL_AT_MAXED_SCORE`, one trash kill per meal**, and it is the smallest of the three because the count is what binds it. **No game in the research pass scores food at all, so there is no direct anchor and the row says so**; what transfers is the band and the two named failure modes, too small to bother with (Great Mahou Daisakusen's "extremely minuscule", Battle Garegga's "not recommended") and large enough to farm (Gunbird's suiciding scorers, DoDonPachi's MAXIMUM bomb bonus). **What it was set against is measured**: twelve maxed-rig runs played to the stage's end took **24 to 47 large meals at full power each**, so at one trash kill apiece the whole input is **2,400 to 4,700 points across a run**, between the Banshee's whole fight at 2,200 and the Undertaker's at 5,100, which is the same band as one boss fight rather than above it. At twice the figure the top of that range reaches 9,400 and the input outgrows both fights, which is why the first cut at `2 * TRASH_KILL_SCORE` was dropped once the count was in.

**All three are first figures and each says so in its own JSDoc**, with what it was set against and what it gets tuned against beside it.

### The four payment sites, each where the thing is resolved

**Boss damage in `damageBoss` (`bosses/phases.ts`)**, where the health comes off, and never in `damageStormTarget`, which routes and owns nothing. **What a hit pays for is the health the phase actually lost**: the health taken is read as `Math.min(amount, boss.hp)` *before* the subtraction, which is left unclamped exactly as it was, so a bell hit for 104 onto a phase holding 3 still reports 104 and now pays for 3. **A hit the flash absorbed pays nothing**, because it took no health and the flash branch returns before the payment.

**The source's bonus in `damageSetPiece` (`stage/setPiece.ts`)**, on the tick its health empties, beside the `setPieceKilled` it already fires. A second hit onto a body already taken pays nothing, because the module's own `bodyGone` guard returns first.

**The meal in `swallow.ts`**, where the swallow is resolved and where the overflow already pays. **The maxed question is asked of `offer.ts` and never answered twice**: `everyLineMaxed(state)` is a named helper beside `offerableLines`, `offerableLines(state).length === 0`, so the roster-at-cap rule has exactly one copy and it is the offer's own. **The tier arrives as a value on the swallow**: `Swallowable` gains `tier`, carried from the corpse row by `asSwallowable`, because a rich corpse and a feast are both large food and only one of them is a feast, so the kind cannot stand in for the tier.

**The kill's site did not move.** `mobs.ts` opens so that site can raise the score's event and for nothing else; the row's value and the payment's amount both hold, and a kill pays after this slice exactly the points it paid before it.

### The score's own event, and the double announcement it costs

**`scorePaid` carries which input paid, how much, and the running total**, and it fires at every payment including the kill's and the overflow's. **`ScoreInput` is a closed union of five**, `kill`, `overflow`, `bossDamage`, `sourceKilled` and `mealAtMaxed`, so a payment carries a name off that list or does not compile. `scorePayments.test.ts` drives all five through a `Record<ScoreInput, …>` that is total over the union, so an input added to the vocabulary with no payer is a compile error there rather than a reading with a residual it cannot explain.

**`overflowed` is not widened, not narrowed and not retired**, and a test pins its exact field set. **Two events on the overflow's tick is the named cost and it is accepted eyes open**, because the alternative puts the payment rule's arithmetic in a second module inside `src/dev`.

**Nothing in the tape changed.** No sim event is ever encoded into a tape, so the new event costs no bytes and `FORMAT_VERSION` holds at 4.

### `READINGS_VERSION` 8 to 9, in the same commit as the payments

**Version 9's note, quoted from `readingsVersion.ts`:** "At version 8 `run.score` meant the kills a run made plus the overflow. It now means those two plus boss damage paid per hit landed, the Waking's source killed, and the large food taken while every rostered line stood at its top rung. The name, the shape and the reduction are all unchanged and the number is a different quantity again: a run that fought a boss and never killed one read nothing for that fight before this and reads every point of health it took after it." And: "**So every batch recorded before this commit is incomparable with every batch recorded after it on that key.**"

**`tuning.damageTaken.scoreBled` rides with it and it is the only other key that does**, for the reason version 8 decided it does: it sums what the ladder's first rung took, so it is denominated in the quantity that changed and a version-8 figure and a version-9 one are slices of two different compositions.

**What was checked for the same exposure, and it was read rather than assumed.** Every declared reading in `batchReport.ts` and `compareRuns.ts`: `run.score` and `tuning.damageTaken.scoreBled` are still the only two denominated in score. `scoreBleeds` counts bleeds and a bleed is still a bleed; `weaponStrips`, `linesStripped`, `seals`, `totalHits` and `hits` are counts of events. M6's three, `tuning.fallenRungLedger`, `tuning.stripsLanded` and `tuning.bledRungMemory`, count rungs, places and transitions, and the batch below reproduces every one of their cells. `MeasureReport.score` and `ReplayTallies.score` ride on `run.score` and are the same change under another name. **My own new readings are not what moved it**, because new readings beside unchanged ones never do, and version 9's paragraph says that plainly because it is the half a reader will expect to be the cause.

### The reading, with each arm's denominator

**`tuning.scoreByInput`, one new concept module under `src/dev/readings/`, built from the score's own event and never from the run's state.** Eleven declared keys, each a spread in `batchReport.ts` and a scalar or descriptive comparison in `compareRuns.ts`.

- `paid`, the gross: every point the run was paid.
- `killPaid` and `killPayments`, denominator the mobs the run killed.
- `overflowPaid` and `overflowPayments`, denominator the swallows whose growth the ceiling could not take.
- `bossDamagePaid` and `bossDamagePayments`, denominator the hits that took health off a boss. **A flash-absorbed hit is in neither figure**, because it took none.
- `sourceKilledPaid` and `sourceKilledPayments`, denominator the sources killed, which a run can do at most once.
- `mealAtMaxedPaid` and `mealAtMaxedPayments`, denominator the rich swallows taken while every rostered line stood at its top rung.

**The decomposition is gross and `run.score` is net, and the reading's own declaration says so.** In a run that hit the floor the arms sum to more than the run ends holding and the difference is `tuning.damageTaken.scoreBled`; a test drives a kill and a floor hit and asserts exactly that, so the residual a reader would otherwise call a bug is pinned rather than described.

**The boss arm and the source arm report nothing rather than zero on a run that never met the thing they measure**, on `wakingSwallows.ts`'s own terms, and both halves are tested: a run that never met a boss reads null, and a run that met one and never hurt it reads a real zero. **The meal arm is a plain number and its zero carries two stories at once**, a run that never reached full power and a run that reached it and took no large food; nothing in the events parts them and the reading's JSDoc says the batch's `endLevels` is what answers which.

**The pairs are flat rather than nested, and the declaration fence is what decided it.** A nested arm that is null on a run puts its leaves out of reach of `batchReadingDeclared.test.ts`'s walk, which then names the parent as undeclared. `wakingSwallows.span` answers that by declaring the parent and claiming the subtree; here both figures are wanted in a batch, so each is its own declared leaf.

### The invariant, the identity appended, and the counts that moved with it

**`checkScoreNotNegative` sits beside `checkScoreRung` in `invariants.ts`** and runs straight after it, both being the score's own floor read from one end or the other. The state it refuses is `state.score < 0`. **Five payment sites and three data rows is what warrants it**: every input only adds and the bleed takes the lesser of what stood and the cap, so the rules cannot reach it, and what the check is for is a reversed sign at one of the five sites, which is the one arithmetic mistake nothing else here would see. **M1-fix decided the other way for the bleed alone and that reading still stands**: one site with a `Math.min` in front of it is a state the arithmetic cannot produce, and five writers is a different question.

**One fault identity was appended**, `score not negative`, at the end of `FAULT_IDENTITIES` with code 24 in `FAULT_IDENTITY_CODES`, severity **recoverable** on the bank's own reading: the size, the levels and the field are all exactly what the rules wrote and nothing downstream reads a poisoned value, so what it costs is the score and ending the run over a wrong number on the readout would be the worse answer. **The counts `faults.ts`'s own prose carries moved with it**: "Twenty-three identities against twenty-four checks" reads twenty-four against twenty-five, and "Recoverable, seventeen checks and seventeen identities" reads eighteen and eighteen. The fatal count did not move, no existing identity changed severity, and no existing wire code moved (ADR 0024, closed and append-only).

### The batch, and sections 12 and 14 reproduced cell for cell

**Seeds 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig, recorded on the committed tree at `6665fad6d4` with a clean identity: 12 of 12 verified, none unfinished, `readingsVersion` 9 on both.**

**Every cell of M6's three readings reproduces section 12's table, and `scoreBleeds`, `weaponStrips`, `linesStripped` and `seals` reproduce section 14's**, both configurations, all six seeds each. `tuning.fallenRungLedger` fell/caught/lost/onFieldAtStop, `tuning.stripsLanded` atClamp/inBoss, `tuning.bledRungMemory` ticksSet/timesSet/timesCleared/growthShortOfClearing: not one moved. **This slice changes no rule any of them reads, so a cell that moved would have been a stop.**

**`run.score` and `tuning.damageTaken.scoreBled` are incomparable with every earlier batch's**, which is what `READINGS_VERSION` 9 exists to make loud. **And the shape of the difference is exactly the new inputs**: every run's ending score is its slice-9 figure plus its own boss damage, to the point, in all twelve seeds.

| | gross | kill share | boss paid | boss share | boss hits | overflow | source | meal | bled | `run.score` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| steady-far 900 | 15800.00 | 86.1% | 2200 | 13.9% | 276 | 0 | absent | 0 | 2000 | 13800.00 |
| steady-far 901 | 17100.94 | 87.1% | 2200 | 12.9% | 276 | 0.94 | absent | 0 | 2000 | 15100.94 |
| steady-far 902 | 22800.76 | 90.3% | 2200 | 9.6% | 276 | 0.76 | absent | 0 | 2000 | 20800.76 |
| steady-far 903 | 40202.40 | 94.5% | 2200 | 5.5% | 279 | 2.40 | absent | 0 | 2000 | 38202.40 |
| steady-far 904 | 65412.39 | 88.8% | 7300 | 11.2% | 786 | 12.39 | 0 | 0 | 2000 | 63412.39 |
| steady-far 905 | 18000.00 | 87.8% | 2200 | 12.2% | 276 | 0 | absent | 0 | 2000 | 16000.00 |
| loose-far 900 | 21506.89 | 89.7% | 2200 | 10.2% | 276 | 6.89 | absent | 0 | 2000 | 19506.89 |
| loose-far 901 | 29004.29 | 92.4% | 2200 | 7.6% | 276 | 4.29 | absent | 0 | 2000 | 27004.29 |
| loose-far 902 | 40891.14 | 91.5% | 3488 | 8.5% | 411 | 3.14 | 0 | 0 | 2000 | 38891.14 |
| loose-far 903 | 38701.47 | 94.3% | 2200 | 5.7% | 279 | 1.47 | absent | 0 | 2000 | 36701.47 |
| loose-far 904 | 14600.35 | 84.9% | 2200 | 15.1% | 276 | 0.35 | absent | 0 | 2000 | 12600.35 |
| loose-far 905 | 59715.54 | 87.7% | 7300 | 12.2% | 889 | 15.54 | 0 | 4000 | 55715.54 |

**Each input's share, against the honest denominator.** Every one of the twelve reached a boss, so the denominator here is already a run that met one. **Boss damage is 5.5 to 15.1 percent of a run's gross**, against the research's band converted to 3 to 56 percent: it lands inside, at the low end. **The source paid nothing in any of the twelve and the meal paid nothing in any of the twelve**, and both zeroes are the rig rather than the rule: the birthright hand never reaches a maxed roster (section 12 says so) and never commits up the trail far enough to take the source down. Nine of the twelve never opened the Waking at all, which the reading says by reporting the arm absent rather than zero; the three that opened it left it alive, and read 0.

**Boss hits landed and boss health taken per run**: 276 to 889 paying hits, taking 2,200 to 7,300 points of health. Ten of the twelve took the Banshee's whole 2,200 and sealed before the Undertaker; two killed both.

**Boss score paid beside boss score that survived to the end of the run.** A floor hit bleeds a capped slice of the pooled bank rather than of any one input, so the exact split cannot be attributed and both bounds are printed: the boss paid 2,200 to 7,300, and **at least 200 to 5,300 of it survived the ladder**, being what is left after the whole of that run's bleed is charged against the boss arm alone. **That pair is the evidence under the ruling's own reason**: under a lump at the kill, the ten runs that sealed before the Undertaker would have carried 2,200 fewer points each, and four of the twelve would have been paid nothing at all for a fight they fought.

**The maxed rig, twelve more runs on the committed tree, where all five inputs fire.** 12 of 12 verified, `readingsVersion` 9, no bleeds at all so gross is net. Meals 24 to 47 per run paying 2,400 to 4,700; boss damage a flat 7,300 on every run, both bosses killed, 445 to 459 paying hits; the source killed in 1 of 12 (`loose-far` 902). **The shares there are the other end of the picture and are a finding rather than a result**: the kill's own row is 94.7 to 96.0 percent of a maxed run's gross, boss damage 2.7 to 3.1 percent and the meal 1.03 to 1.89. **A maxed hand mows 1,700 bodies in 23,000 ticks, so the kill swamps every other input at full power**, which is not the swamping the band guards against and is not this slice's to fix: `TRASH_KILL_SCORE` and every mob row are on the must-not-move list. It is filed here for the tuning step.

**M1-fix's cap row re-read against this batch, as a finding and never as a row moved.** `SCORE_BLEED_CAP` is 2,000, twenty trash kills, and its band was argued against a run's gross. **The gross rose by about an eighth**, from 12,400 to 58,112 at M1's tip to 14,600 to 65,412 here, so the cap's share of a run fell from 16.1 to 3.4 percent down to **13.7 to 3.1 percent**. **What stands**: the value is still 20 trash kills inside the researched band of 10 to 40, and the early-window argument that put it below the band's midpoint is untouched, because every one of the twelve still bled the full cap, which is only possible with at least the cap standing when the floor hit landed. **What is worth the tuning step's eye** is that the same row now buys a smaller fraction of the run, and that it will fall further as the other inputs are tuned up.

### Replay determinism, and the tapes

**Seed 909 under `shaky-short`, played twice on the committed tree: 5,997 ticks both times, 56,402 bytes both times, and three differing bytes at offsets 202 to 204**, which is `recordedAt` alone, exactly as slices M1-fix and M1-stage recorded for this seed. Both verify. **A witness move here would have been a stop, and this run is the proof there was not one**: nothing this slice added is folded state, and `witness.test.ts`'s own completeness assertion over the nested field list is green unchanged.

**A tape at a rig that reaches a boss, measured to `outcome: 'verified'`**: `local/step5/m7-maxed-committed/loose-far-maxed-1789638094880/902.tape`, 22,537 ticks, victory, integrity clean, 376 of 376 checkpoints verified, `readingsVersion` 9. **All five inputs pay in it**: kill 246,100 over 1,804 kills, overflow 76.15 over 374 swallows, boss damage 7,300 over 449 paying hits, the source killed once for 2,400, and 39 meals at a maxed ladder for 3,900.

**`record-conditioned.ts` could not produce that tape and section 5 records why**: its wandering script seals at tick 6,229 on the maxed rig and the Procession runs to about 7,500, so no conditioned tape reaches a boss at all. The conditioned tape it does produce verifies at `readingsVersion` 9 with the ladder whole, one bleed of 2,000, five strips taking 19 line-levels and a seal.

### The four constants and `GOLDEN`, read off this slice's own tip

**`WITNESS_VERSION` 11 (`witness.ts`), `READINGS_VERSION` 9 (`readingsVersion.ts`, moved here from 8), `FORMAT_VERSION` 4 (`wireCodes.ts`) and `GOLDEN`'s checksum `-2049717150` (`digest.ts`), with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` inside it.** Each was read off the tree before the first edit and again after the last.

**`GOLDEN` held and the check was taken rather than assumed**: `digest.test.ts` was green at every run of the suite, and **this slice holds no re-pin permit at all**. The scenario's own numbers say why none of the three inputs can fire in it: all six hundred ticks fall inside the Procession and it runs on past them, so no boss is ever on the field and `drawn.bossFire` reads 0; `drawn.pour` is 0, so no set piece ever opened; and the `levels` record reads `skullStream: 1` with the other three at 0, four rungs short of `MAX_LEVEL` on the one line that has any. The two scripted shambler kills pay exactly what they paid and `score` holds at 200.

### Measured baselines that moved, each re-measured with its reason

**`endings.test.ts`'s `SCORE_EARNED_INSIDE_THE_FIGHT` is gone and what stood at the bleed is now summed off the ledger.** The constant was 300, three mow bodies measured on 2026-09-16, and the hand also damages the boss inside that window, so a kill-only figure went false the moment boss damage paid. **It is not re-pinned at a new magnitude**, because that figure would go stale again on every weight retune: the test now adds up the `scorePaid` amounts the run reported before the rung bled and asserts the bleed took the lesser of that and the cap. That is an independent source of truth rather than a tautology, and it asserts one thing more than it did: the payments' own ledger and the ladder's arithmetic agree.

**`endings.test.ts`'s victory test asserts what moved rather than that nothing moved.** "Pays nothing for a victory" is still the promise; the falling tick now moves the score by the last of the boss's health the storm took. The test asserts the move equals the sum of that tick's `scorePaid` amounts and that every one of them names `bossDamage`, so the ending still pays nothing and the payment that does is named.

**`faults.test.ts`'s count test is renamed** to twenty-four identities against twenty-five checks, which is the one removed name in the diff.

**`mobs.test.ts`'s exact event-array pin gains the kill's own payment**, asserted off the row rather than as a figure.

**No other measured baseline moved.** `bot.test.ts`'s `BLEEDS_SCORE`, `harnessPolicy.test.ts`'s per-seed baselines, `measure.test.ts` and `replayTallies`' tests were all checked by running them and are green unchanged.

### Verification

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, and **`pnpm verify` green twice at the repo root on the committed tree**, 156 test files, 2,318 passed, 11 expected fail, 2 todo. The build's chunk-size warning is the pre-existing one.
2. **Agent.** The test-name diff, 2,302 to 2,329, 28 added and 1 removed, above.
3. **Agent.** `READINGS_VERSION` 9 with what the move costs, and `WITNESS_VERSION` 11, `FORMAT_VERSION` 4 and `GOLDEN` each read off the tree and named as held, above.
4. **Agent.** The golden digest green and unmoved, stated as a check taken.
5. **Agent.** Replay determinism on seed 909 under `shaky-short`, and a verified tape at a rig that reaches a boss, above.
6. **Agent.** The batch with the score decomposed, each input's share printed, and the incomparability stated, above.
7. **Agent.** The three weights, each with its ratio to a trash kill, what it was set against, and its first-figure annotation, above.
8. **Agent.** The fences green, each by title. `boundary.test.ts`: *the rendering-import boundary*, *the test-span fence*, *the screen graph is declared in one place*, *the engine accessor is out of the app*, *the core has no import cycle*, slice D's sixth *the cap derivation reads tables and never the stage*, *the lock is owned by a module with nothing behind it*, *the tape codec parses a header without the director* and *src/dev imports only from src/dev and src/game and src/tape*. `lineAgnosticPolicies.test.ts`: *no weapon line walks the mob pool*, *a policy names no weapon line*, *no boss and no set piece names a weapon line*, *a line's constants are declared in that line's own module*, *only the offer draws from the power-ups stream* and *one module draws each stream*. `executionFence.test.ts`: *the step fence (ADR 0017)*. `harnessStatesNoTarget.test.ts`: *the harness reports and never judges*. `batchReadingDeclared.test.ts`: *every reading declares how a batch reduces it*. `comparisonDeclared.test.ts` at `src/dev/__tests__/`: *every reading declares what comparing it means*. **The core's cycle guard is green with `KNOWN_CORE_CYCLES` still `[]`**, which this slice made it earn (section 5).
9. **Human (Mark), and none of it blocks anything.** The record's section 7 carries the finding that a hit costs points so clean play scores higher, and it is his to overrule now that the other inputs are in. The per-input shares above are the evidence beside it, and he reads it on the deploy at step 5.7.

### Left for a later slice or for the tuning step, each named

**The cap row's re-read is a finding for the tuning step and no row moved.** **The kill's share of a maxed run, 95 percent, is the same kind of finding** and is the tuning step's to answer, not a slice's.

**The boss farm is still #136 and this slice neither widened nor closed it.** Nothing here changes how long a fight can be held open; the Undertaker's dug-up bodies pay what they always paid and boss damage now pays per hit inside the same unbounded window.

**A fourth score input is Mark's** and the research's three filed candidates (a flawless boss phase, a boss clock, stage objectives) sit in `score-inputs-precedent.md` section 6 pointed at #135's thread.

**Nothing under `src/app` was opened**, no ADR was filed or amended, no cap moved and nothing was re-pinned anywhere.

### The close fold: the final score is presented at the seal (#99), `7ffcea5db5`

**The step 5 close's game design gate found the score had nowhere to land at the end of a run, and this is the whole of the slice.** `summarizeRun` carried seed, ticks, ending and fault, and `EndScreen` drew SEALED SHUT, SEED and TICKS, so the ladder row was the only place the number ever existed and it goes with the field at the seal: a player who had just watched a capped bleed spare their score ended the run unable to say what they had. `RunSummary` now carries `score`, read straight off `run.score`, and the end screen draws one `SCORE` line at the top of its stack. Every arcade results screen presents the final score, and Vampire Survivors' own results screen lists time, gold, level and kills. **Nine files in the one code commit, all of them under `src/app`**: nothing under `src/game`, `src/dev` or `src/tape` was opened, no event was added, and no ADR was filed or amended.

#### The reading is the row's own, moved to a file both screens can see

**`scoreReading` and `SCORE_DIGITS` left `LadderHud.ts` for `src/app/screens/scoreReading.ts`, unchanged in behaviour**: whole points, zero-padded to six digits, which is what the row has drawn since M3. **Copying the expression into the end screen was refused.** The two numbers have to agree by construction, because the whole point of the line is that the number a player watched is the number they are handed, and two copies are two things that can drift apart. The ladder row imports both back, so its width budget is still derived from the same digit count. The new file is not a screen, so `boundary.test.ts`'s *the screen graph is declared in one place* has nothing to say about the end screen reaching it, and it sits in `src/app/screens/` because that is the lowest folder holding both callers.

**The zero padding travelled with the reading rather than being re-decided at the seal.** `SCORE 001600` is what a sealed run reads, not `SCORE 1600`. That is the prompt's own instruction, to format it the same way the row does, and it is named here because it is the one thing about this line a person could want different on sight.

#### `hudRow`'s `band` parameter, and the seven call sites that never passed one

**`hudRow(placement, band = HUD_BAND)` is now `hudRow(placement)`, reading `HUD_BAND` directly.** The cited-future rule wants every parameter to have a caller today or a citation written down, and this one had neither. **Seven call sites, grepped before and after and identical in both lists: `GameScreen.ts` once, `layering.test.ts` five times, `layout.test.ts` once**, and not one of them passed a second argument. `HUD_BAND` and the `HudBand` type are untouched and both still exported, because `HUD_BAND`'s own annotation is still a reader of the type.

#### The tests, all five watched red before any production line moved

**Five added across three files.** `runSummary.test.ts` gains *carries what the run scored, so the end screen can present it* and *carries a score of zero as a number and never as an absence*, which are the scored run and the scoreless one the slice asked for. `screenLifecycle.test.ts` gains *presents the run's final score, in the reading the ladder row showed*, asserting `SCORE 012400` and `SCORE 000000` against literal strings rather than against the production formatter. The new `src/app/screens/__tests__/scoreReading.test.ts` pins the reading itself, at six digits and at a fraction rather than at a round number. **Four of the five went red on the missing field and the fifth on the missing module**, which is the whole reason the module stub and the field were written after them and not before.

**Fourteen existing summary literals gained `score: 0`**, nine in `screenLifecycle.test.ts` and five in `runHandoff.test.ts`, because `RunSummary` is exact and typecheck refuses a literal short of a field. **No test was deleted, skipped, weakened or renamed to reach green**, and the two `toEqual` shapes in `runSummary.test.ts` gained a field rather than losing an assertion. `layout.test.ts`'s and `layering.test.ts`'s `hudRow` tests pass unedited with the parameter gone, which is what says no caller ever wanted it.

#### The rendered check, at two viewports

**`pnpm build` then `pnpm exec vite preview`, driven with `playwright-cli` against the built app at 393 by 660 and at 1440 by 900, opened at `?levels=3&size=18&seed=4242`.** A run was played from RISE and sealed itself at tick 2621. The end screen reads SEALED SHUT, then **SCORE 001600**, then SEED 4242, then 2621 TICKS, with RISE AGAIN and SAVE TAPE clear below the stack at both viewports and nothing crowded. **Zero console errors and three warnings**, all three the audio autoplay policy, pre-existing and none of them this slice's.

#### Left for a later slice, named rather than acted on

**The fault line's offset grew from `0.42 + 80` to `0.42 + 120` to make room for the score, and on a short landscape stage that stack would reach further into RISE AGAIN than it did before.** It is empty on every run the instrument did not stop, so nothing a player normally sees moved, and the collision it would make is one the stack already had at `+80` rather than one this slice invented. **The branch cleanup pass is where it belongs if anyone wants the stack measured against the buttons at every viewport**; no ticket is filed, because nothing needs one yet.

#### The four constants and `GOLDEN`, read off this slice's own tip

**`WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 4 and `GOLDEN` with `score: 200` inside it, each read off the tree before the first edit and again after the last, and none of their four files is in either commit.** This slice was permitted no move and took none: it adds a field to an app-side fold that no witness, no declared reading and no wire byte can see.

#### Verification

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, and **`pnpm verify` green at the repo root on the code commit's tree and again on the docs commit's**. 157 test files, 2,323 passed, 11 expected fail, 2 todo, against M7's 156 and 2,318. The build's chunk-size warning is the pre-existing one.
2. **Agent.** The five new tests watched red before the code, above.
3. **Agent.** The seven `hudRow` call sites grepped before and after, above.
4. **Agent.** The rendered check at two viewports, screenshots read, above.
5. **Agent.** The four constants and `GOLDEN` held, above.
6. **Agent.** The fences green inside the whole-suite run. `boundary.test.ts`'s *the screen graph is declared in one place* and *the test-span fence* are the two the new file and its new test could have moved, and neither did.
7. **Agent.** CodeRabbit, one iteration, nine files, zero findings, above.
