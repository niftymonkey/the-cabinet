# Step 5 progress note: show what you have (tickets #72 and #99)

The record is `apps/hungry-grave/docs/design/show-what-you-have.md` and the prompts are `step-5-slice-prompts.md`. The coder contract is still `step-4-coder-contract.md`, with the three overrides at the top of the prompts file. One section per slice at the end, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

**Round two's note is `round-two-progress.md` and step 4's is `step-4-progress.md`, and both are read and never appended to.** This step's slices carry `#72` or `#99` rather than `#39` or round two's tickets.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| 5.0, the docs commit | the commit this note rides in, section 6 says why | `docs(hungry-grave): ADR 0054 reads a line's rung off its own expression, the HUD entry moves to the field's top edge and the glossary gains the dive, the score and the fallen rung (#99)` |
| M1, the fold | `2c7a281657` | `feat(hungry-grave): the ladder remembers the rung it bled and the witness folds it (#99)` |
| M1, a kill pays score | `11483ecf31` | `feat(hungry-grave): a kill pays score and a bled rung stays bled until the grave grows (#99)` |
| M2, the frame composed and the band reserved | | |
| M3, the HUD carries the ladder and the score | | |
| M4, the loss is watched | | |
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

## 9. Slice M3: the HUD carries the ladder and the score (#99)

## 10. Slice M4: the loss is watched (#99)

## 11. Slice M5: the stripped rung falls and the dive catches it (#99)

## 12. Slice M6: the ladder's cost is measurable (#99)
