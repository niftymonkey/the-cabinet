# Step 5 progress note: show what you have (tickets #72 and #99)

The record is `apps/hungry-grave/docs/design/show-what-you-have.md` and the prompts are `step-5-slice-prompts.md`. The coder contract is still `step-4-coder-contract.md`, with the three overrides at the top of the prompts file. One section per slice at the end, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

**Round two's note is `round-two-progress.md` and step 4's is `step-4-progress.md`, and both are read and never appended to.** This step's slices carry `#72` or `#99` rather than `#39` or round two's tickets.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| 5.0, the docs commit | the commit this note rides in, section 6 says why | `docs(hungry-grave): ADR 0054 reads a line's rung off its own expression, the HUD entry moves to the field's top edge and the glossary gains the dive, the score and the fallen rung (#99)` |
| M1, the fold | | |
| M1, a kill pays score | | |
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
| `WITNESS_VERSION` (`src/game/witness.ts`) | 9 | 9 to 10, exactly once | Slice M1, in its own commit | |
| `READINGS_VERSION` (`src/dev/readingsVersion.ts`) | 6 after slice J2's second code commit | 6 to 7, exactly once | Slice M1, in the same commit as the score change | |
| `FORMAT_VERSION` (`src/tape/wireCodes.ts`) | 4 | none | nobody | |
| `GOLDEN` (`src/dev/digest.ts`), checksum `1275540894` | pinned by slice J2 | one re-pin, plus one at-most permit | Slice M1 takes the one; slice M5 holds the permit and is expected not to use it | |

**The step's whole budget is one `GOLDEN` re-pin, one at-most permit, one witness move and one readings move, each named by its slice** (record section 5, orchestrator 2026-09-16 under one-push mode). **Slices M2, M3, M4 and M6 are permitted none**, and a move in any of them is a stop and report, because none of them opens `src/game`.

**The readings move was not in the record when it was filed.** Section 5 said `READINGS_VERSION` does not move in this step at all, on the reasoning that M6's two readings are new beside unchanged ones. `run.score` is itself a declared reading and slice M1 changes what it means, which is `readingsVersion.ts`'s own rule for a bump, so **the orchestrator corrected the sentence on 2026-09-16 rather than obeying it** and section 5 now names the one move.

**What the moves cost, stated rather than discovered.** Each slice that moves a constant writes its own sentence here.

**The table's baseline column is slice J2's tip and step 5 opens at slice J3's, which is two commits further on** (step 5.0, read off `d648c97bf7`). The tree reads `WITNESS_VERSION` **10** (`witness.ts:177`), `READINGS_VERSION` **7** (`readingsVersion.ts:159`), `FORMAT_VERSION` **4** (`wireCodes.ts:50`) and `GOLDEN`'s checksum **`1307518644`** (`digest.ts`), with `score: 0`, `mobs: 5`, `corpses: 1` and `kills: 2` inside it. Round two's slice J3 spent the same two numbers the table reserves for slice M1, so **the permitted moves are one move each and the figures now read 10 to 11 and 7 to 8**; the budget is the intent and the arithmetic is what moved. The table's cells are left as they were filed rather than rewritten, and **slice M1 confirms both figures against its own tip before it moves either.**

## 3. GOLDEN moves

One entry per slice that was permitted one, whether or not it moved, with the dated paragraph's location and every field that moved beside every field that held.

## 4. CodeRabbit

One entry per code commit: files reviewed, findings by severity, applied and declined, each decline with its reason.

## 5. Record and prompt claims found false against the tree

Every claim in the design record or in a slice prompt that did not survive contact, with the file and what is actually there. **The source's intent is followed rather than its stale letter, and an unclear intent is a stop.**

**Step 5.0. Territory shipped as ground before ADR 0054 was ruled, not after it.** R8 and the prompt's item (b) both word the amendment's third leg as "Territory shipped as ground rather than as a shot, which happened after the ADR was written". Territory landed as claimed ground on 2026-08-27 and 2026-08-28 (`4d380f9e66`, `c35d79de72`, `426576d489`, `c77622c7ce`), and ADR 0044 gave its level the radius channel in its 2026-08-28 amendment; ADR 0054 was ruled on 2026-09-07, ten days later. **The intent was followed and the leg is true as written in the file**: what the ADR could not have known is that nobody had read the field channel line by line, which is the reading section 3.3 made on 2026-09-16 and which is what says Territory can never carry a countable rung.

**Step 5.0. Both records were already in version control when the slice opened.** The prompt's item (g) and its state-of-the-branch both say the design record and the research record are untracked files to add by path. They were committed at `45a25ee6eb` with the prompts themselves, before slice L. Nothing was added and neither file was edited.

**Step 5.0. The prompt's four constants are slice J2's and the tree is two commits past them.** Recorded in section 2 above with the figures read off `d648c97bf7`. Nothing here moved any of them.

**Step 5.0. R4's Sonic precedent is not what Sonic ships.** R4 says "Rings are both the score and the death buffer, and they refill only by the player's own act of collecting them", citing `floor-ladder-precedent.md`, whose own line said the same. The rings are their own counter beside the score, flashed by the HUD when they read zero. **The intent was followed**: the half R4 leans on, a buffer refilled only by the player's own act and never as a side effect of the weapon firing, is exactly what Sonic ships and the bled-rung memory stands on it unchanged. The research line is corrected in this slice's second commit; **the design record is not edited by the slice that files it**, so R4 still carries the old reading and this entry is where that is written down.

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

## 8. Slice M2: the frame is composed, and the band is reserved (#72)

## 9. Slice M3: the HUD carries the ladder and the score (#99)

## 10. Slice M4: the loss is watched (#99)

## 11. Slice M5: the stripped rung falls and the dive catches it (#99)

## 12. Slice M6: the ladder's cost is measurable (#99)
