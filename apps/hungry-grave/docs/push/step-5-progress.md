# Step 5 progress note: show what you have (tickets #72 and #99)

The record is `apps/hungry-grave/docs/design/show-what-you-have.md` and the prompts are `step-5-slice-prompts.md`. The coder contract is still `step-4-coder-contract.md`, with the three overrides at the top of the prompts file. One section per slice at the end, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

**Round two's note is `round-two-progress.md` and step 4's is `step-4-progress.md`, and both are read and never appended to.** This step's slices carry `#72` or `#99` rather than `#39` or round two's tickets.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| 5.0, the docs commit | the commit this note rides in, section 6 says why | `docs(hungry-grave): ADR 0054 reads a line's rung off its own expression, the HUD entry moves to the field's top edge and the glossary gains the dive, the score and the fallen rung (#99)` |
| M1, the fold | `2c7a281657` | `feat(hungry-grave): the ladder remembers the rung it bled and the witness folds it (#99)` |
| M1, a kill pays score | `11483ecf31` | `feat(hungry-grave): a kill pays score and a bled rung stays bled until the grave grows (#99)` |
| M2, the frame composed and the band reserved | `0c7f877ad1` | `feat(hungry-grave): the frame is composed across three regimes and the HUD's band is reserved (#72)` |
| M3, the HUD carries the ladder and the score | `48383d4d68` | `feat(hungry-grave): the row carries the score and every rostered line's rungs as marks (#99)` |
| M4, the loss is watched | `d463dc8252` | `feat(hungry-grave): the score is watched leaving and every line that paid says so (#99)` |
| M5, the stripped rung falls | | |
| M6, the ladder's cost is measurable | | |

Slice M1 carries two code commits, the fold and the rule, which is this step's one authorized departure from the contract's one-code-commit rule.

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

**M4's code commit, one iteration: 14 files reviewed, 7 findings, none applied and all seven declined.** Section 10 carries each decline with its reason. Four of the seven are on `docs/design/show-what-you-have.md` and `docs/push/step-5-slice-prompts.md`, which were dirty in the shared worktree while the review ran and are not this slice's files; **all four are one argument, that M7's `run.score` change needs a `READINGS_VERSION` 8 to 9 move the section 5 ledger forbids**, and it is left here for the orchestrator rather than acted on.

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

## 12. Slice M6: the ladder's cost is measurable (#99)
