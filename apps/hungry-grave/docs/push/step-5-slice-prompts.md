# Step 5 slice prompts: show what you have

One block per slice, in the design record's section 4 order. The launch preamble is the same for every slice: name the playbook, name the record sections carrying the dispatch contract items, then give the slice.

**The order the blocks run in is slice 1 (5.0), 2 (M1), 3 (M2), 4 (M3), 5 (M4), 6 (M5), 6b (M5-fix), 7 (M1-fix), 8 (M1-stage), 9 (M6), 10 (M7), then the step's close.** **Every heading carries the ordinal it runs in and the internal code beside it** (Mark, 2026-09-17), so a list a person reads is in execution order while every cross-reference to a code stays valid; **slice 6b has no block of its own here**, because M5-fix was dispatched without one and its record is the progress note's section 11. **Slice 7 runs between 6b and 9 and it is slice 2's repair rather than a slice of its own**, so its progress-note entry rides inside section 7 as a subsection the way M5-fix's rides inside section 11. Mark ruled on 2026-09-16 that the floor ladder's score bleed is capped (record R4's closing amendment), and it lands before M6 because M6 declares what the ladder cost and a reading declared over an amount that is about to change would measure the wrong rule on its first batch.

**Step 5's coder contract is `step-4-coder-contract.md`, unchanged and still binding.** It carries how to work in the worktree, the commit and review rules, the progress note, the verification commands, what must not move in any slice, what is never a slice's job, and the stuck rule. Every block below names it and holds only what is its own.

**Three standing overrides of that contract, and they apply to every block below.**

1. **The ticket in the commit message is this slice's own, not `#39`.** The contract's "(#39), which is the ticket every step 4 docs and code commit cites" is step 4's. Step 5 runs on two tickets and a slice cites the one whose acceptance criteria its own done line closes: **#72** for the frame and the composed play space (slice M2), **#99** for the ladder being legible and a loss being watchable (step 5.0 and slices M1, M1-fix, M3, M4, M5, M6 and M7). **#135 is the friends' high score list and waits on the step 6 store**, so a slice that widens what the score is still cites #99 and never #135. Where a slice closes criteria on both, the commit cites the one above and the progress note names the other by criterion.
2. **The progress note is `apps/hungry-grave/docs/push/step-5-progress.md`, not round two's and not step 4's.** The section numbers are fixed: **step 5.0 is 6, M1 is 7, M2 is 8, M3 is 9, M4 is 10, M5 is 11, M6 is 12, M7 is 13.** Sections 1 to 5 are the cross-slice facts and every slice writes its own rows into them. Round two's note and step 4's note are read and never appended to.
3. **Scratch under `local/` goes in `local/step5/`, and every file in it carries your slice's name**, because the scratchpad and `local/` are shared between agents and a generic baseline filename gets clobbered by another agent's. Nothing under `local/` ever enters a commit.

**The design record is `apps/hungry-grave/docs/design/show-what-you-have.md`.** Its section 2 is twelve rulings, each final, and **no slice reopens one**. Its section 3 is what the tree held when it was written. Its section 4 is the slices. Its section 5 is what must not move, including the step's whole version budget by slice. Its section 6 is the verification list and the test sentences. Its section 7 is seven findings already filed for Mark, which **no slice acts on**. Its section 9 is the orchestrator's seven rulings on the record.

**The research record is `apps/hungry-grave/docs/research/portrait-hud-and-catchable-loss.md`**, cited by section throughout the design record. It carries its own DOCUMENTED, SECONDARY and WEAK labels and a slice leaning on a WEAK item says so.

**Every craft value in these prompts is the record's and is cited to its ruling. Where the record says measure first and declare after, the prompt names the measurement and the slice takes it.** A number that is not in the record and not measurable before the code exists is a data row the coder picks, annotates as a first figure, and names in the note as open; it is never a compiled constant and never a number invented in a test.

**The version constants and `GOLDEN` at HEAD, which is the tip these prompts read against.** `WITNESS_VERSION` **10** (`src/game/witness.ts`), `READINGS_VERSION` **7** (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` **4** (`src/tape/wireCodes.ts`), `GOLDEN`'s checksum **`1307518644`** (`src/dev/digest.ts`) as slice J3 pinned it, with `score: 0`, `mobs: 5`, `corpses: 1` and `kills: 2` inside it. **A slice may land between this line and you**, so **every slice re-reads all four off its own tip before it leans on any of them** and reports what it read.

**The step's whole ledger, and every move in it is slice M1's except one.** `WITNESS_VERSION` **10 to 11**, in M1's fold commit, for R4's bled-rung memory. `READINGS_VERSION` **7 to 8**, in M1's score commit, for `run.score`'s meaning changing. `GOLDEN` **re-pinned twice, once per M1 code commit**: the checksum alone at the fold, `score` beside it at the score commit. **`FORMAT_VERSION` 4 does not move at all.** **M5 is permitted at most one `GOLDEN` re-pin** and is expected not to use it; **M2, M3, M4, M6 and M1-fix are permitted none**. **The one move that is not M1's is `READINGS_VERSION` 8 to 9 in M7**, for `run.score`'s meaning changing a second time under R4's further inputs, and **M7 is permitted no `GOLDEN` re-pin and no witness move**: a fold there is a stop and report before it is written rather than a move it takes. **After M1 the four read 11, 8, 4 and `GOLDEN` as M1 pinned it**, and every slice after M1 reads them off the tree.

**Section 5's "`READINGS_VERSION` does not move in this step at all" is corrected rather than obeyed, by the orchestrator on 2026-09-16 under one-push mode.** `run.score` is a declared reading in `batchReport.ts` and `compareRuns.ts`, and slice M1 changes what it means, which is `readingsVersion.ts`'s own stated case for a bump; the record's sentence was written before that was seen and its stated reason covers only M6's two new readings. **So the step carries two `READINGS_VERSION` moves and both are the same reading**, 7 to 8 in slice M1 for the kill, and **8 to 9 in slice M7** for the three further inputs R4 rules, which redefine `run.score` a second time on the same terms. M6's two new readings still move nothing, and neither do M7's per-input tallies, because new readings beside unchanged ones never do; what moves it both times is the reading that was already there.

**Line numbers are never cited in these prompts and never relied on. Find the name, never the line.** The record's section 0 says the same and says why: every slice moves some of them.

---

## Slice 1 (5.0): the docs commit, ADR 0054 amended and the glossary gains three terms (#99)

Model: Opus, subagent type general-purpose. **One docs commit and no code commit at all.** The message ends in `(#99)`.

Step 5.0 of The Hungry Grave: the records that step 5 builds against are put right before any coder reads them, because two of them say "projectiles" about a line that has none and one of them puts the HUD somewhere the measurements say it cannot go.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to step 5.0.

**No coding slice may start until this commit is in the tree**, which is the same rule round two's ADR commit carried: a HUD test written against `CONTEXT.md`'s current HUD entry would be written against a placement the measurements refuse.

**Five rulings shape this commit and none of them is yours to revisit.**

**First: ADR 0054 is amended in place, same question and new answer, and its number and title do not move** (record R8 and section 9 ruling 3). The decision did not change; the word "projectiles" did, because Territory has no projectiles at all. Its level curve is `RADIUS_BY_LEVEL`, an area rather than a count, so one line of the four cannot satisfy the field channel as worded and no amount of building will make it. **The amendment is one word's worth: a line's rung is carried by that line's own expression on the field.**

**Second: the amendment carries ADR 0058's own overrule line, because ADR 0054 is one Mark ruled.** A step's docs slice editing a Mark-ruled ADR is not the same as one editing ours, so the amendment ends with the sentence ADR 0058 already uses for this case, that it is taken under one-push mode and is Mark's to overrule on the branch before merge. **It is also the record's section 7 second finding, so it reaches his read and not only the tree.**

**Third: `CONTEXT.md`'s HUD entry is amended and the amended text is written out for you** (record R9, section 4 and section 9 ruling 2). Do not compose it. The entry today says the readout sits "inside the field frame", and section 3.1 measures a phone's side gutter at exactly zero and a desktop's top band at exactly zero, so the frame's inside is not a home both shapes have. **Precedent outranks our own record where they disagree, which is Mark's rule of 2026-09-09.**

**Fourth: the 540 by 760 doc fix is struck rather than carried** (record R9 and section 9 ruling 5). The check says the disagreement no longer exists: `CONTEXT.md` contains no "540" anywhere, and the two legs that do exist agree. **You edit nothing for it and you close the handoff's open item 4 as already fixed.**

**Fifth: ADR 0002 gains a dated supersession paragraph in place, quoting Mark's own words** (record R4, ruled by Mark on 2026-09-16). He ruled that the score is one number fed by several inputs and that a kill is an input rather than the definition: "Kills doesn't fully represent how well you've done. Kills, boss damage, whether you killed the Waking source, how many large food items you got after full power, (more?) ... there's plenty that can feed a number score. And having friends eventually be able to have a 'High Score' they can aim for amongst us all would be really fun." **What stands in ADR 0002 is that a kill pays; what falls is that a kill is all that pays.** The number and the title do not move, the paragraph quotes him rather than paraphrasing him, and it carries the same what-stood, what-changed, what-it-could-not-have-known triple the other amendments use. **ADR edits are this slice's and no code slice's**, which is why it is here.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `apps/hungry-grave/docs/design/show-what-you-have.md`: **section 2's rulings R4, R8 and R9 in full, and section 4's step 5.0 paragraph in full, which carries the amended HUD entry's text and its dated amendment paragraph verbatim for you to copy.** Then section 7's second and last findings, and section 9's rulings 2, 3, 5 and 6.
3. `apps/hungry-grave/docs/adr/0054-the-ladder-reads-twice-in-the-storm-and-on-the-hud.md` **whole**, which is what you are amending, and `0002-corpses-are-fuel-and-carriers-meter-power.md` **whole**, which you are amending too, and `0055-a-stripped-rung-falls-onto-the-field-as-a-body.md` whole, which you are not.
4. `apps/hungry-grave/docs/adr/0058-each-on-swallow-line-pays-in-its-own-currency-at-its-own-cadence.md`, **its opening amendment sentence only**, which is the wording your overrule line copies.
5. `apps/hungry-grave/CONTEXT.md`, the entries **HUD, Rung, Treasure, Corpse, Wisps** and the file's own header. **Read three of its existing dated amendment paragraphs before you write one**, because the voice is the file's and not yours.
6. `apps/hungry-grave/docs/research/visible-ladder-precedent.md`, the item recommending Cave Story's MAX buffer, which is the line you are superseding, and `apps/hungry-grave/docs/research/portrait-hud-and-catchable-loss.md` sections 1, 3, 4, 5, 7 and 12, which are what the HUD entry's placement now rests on.
7. `apps/hungry-grave/docs/push/round-two-slice-prompts.md`'s ADR commit block and `round-two-progress.md` section 5's last entry, for how an amendment commit is written and for the one that landed without writing its own note.

### The definition, in observable terms

After this commit: no record in the tree says a rung is carried by a line's projectiles, no record says a kill is the whole of the score, no record says the HUD sits inside the field frame, and the three terms the game speaks daily, the dive, the score and the fallen rung, each have an entry of their own. The research record and the design record are both in version control. `visible-ladder-precedent.md` says on its own page that its MAX buffer recommendation is superseded and where the ruling lives.

**Nothing under `src/` is in this commit**, no test moves, and `WITNESS_VERSION`, `READINGS_VERSION`, `FORMAT_VERSION` and `GOLDEN` are all untouched.

### The work, in this order

**(a) `git log --oneline -25` and `git status --short` first.** Slice J2 may still be landing, so **check the tip and the working tree before your first edit**; if anything under `src/` is uncommitted, that is another agent mid-slice and you stop and report rather than commit around it. **The design record and the research record are untracked files in the worktree**, so they show in `git status` and they are yours to add by path.

**(b) ADR 0054, amended in place.** The filename does not move, because the title does not. **Find both sentences in the opening paragraph that name projectiles by content, not by line**: the one that says every line's level is carried by that line's own projectiles, and the one that says a rung lost shows on the field as that line's projectiles blowing up. Both carry the amended word. Then a new dated paragraph with the what-stood, what-changed, what-it-could-not-have-known triple, worded in record R8: what stood is both channels existing and neither being the only reading of a loss; what changed is the word projectiles; what it could not have known is that Territory shipped as ground rather than as a shot, after the ADR was written. **The paragraph ends with ADR 0058's own overrule sentence.**

**(b2) ADR 0002, a dated supersession paragraph appended in place.** The decision's number, title and filename do not move. What stood: a kill pays score, and killing buys room to live. What changed: a kill is one input to the score rather than the whole of it. What it could not have known: nothing had ever scored a boss, a Waking source or a meal taken at full size, so kills was the only input there was to name. **Quote Mark's words inside it** rather than paraphrasing them, and say that the further inputs are recorded in the design record's R4.

**(c) `CONTEXT.md`'s HUD entry, replaced with the record's text and not with yours**, followed by the record's own dated amendment paragraph, also copied. Both are written out in the record's section 4.

**(d) The Rung entry loses "projectiles"**, for the same reason and in the same commit. The entry reads that a rung is carried by that line's own projectiles; it carries the amended word instead. **Its Avoid list's parenthetical about a pip being the mark is checked against your amended wording and left alone unless it has gone false**, and either way you say in the note what you decided and why. **The record's amended HUD text calls the glyph a mark while ADR 0054 still calls it a pip; that is one object with two words and it is worth one sentence in the note**, not a vocabulary change you make on your own.

**(e) Three entries added, in the file's own voice with their own Avoid lists, placed where the file's own ordering puts them.** **Dive**, the verb the grave recovers with, used in the Wisps entry and the Rung entry today and defined nowhere, and the verb step 5 makes the recovery for a lost rung. **Score**, which has no entry at all and is about to be the largest number on the screen, with the two sources record R4 gives it, kills and growth past the size ceiling. **Fallen rung**, the body ADR 0055 rules, named so it is plainly the same thing as a Rung at a second moment (section 9 ruling 6 rules the term itself).

**(f) One line into `visible-ladder-precedent.md`** saying its MAX-buffer recommendation is superseded by the design record's section 7 ruling, with the pointer, so the two records do not point in opposite directions.

**(g) The design record and the research record are committed as they stand.** Add both by path. **Do not edit either**, not for a typo and not for a stale line: a record edited by the slice that files it stops being the thing the other slices were dispatched against. Anything you believe is wrong in either goes in the note.

**(h) The 540 by 760 fix is struck and you prove it rather than assume it.** Grep `CONTEXT.md` for "540" and say in the note what you found, then say the handoff's open item 4 is closed as already fixed rather than carried forward. **Nothing is edited for it.**

**(i) The shove and the impulse still have no glossary entry and that is round two's, not yours** (record R9, last paragraph). Adding them here would hide them in an unrelated commit.

**(j) The note**, section **6**, titled "Step 5.0: the docs commit, ADR 0054 amended and the glossary gains three terms (#99)". Say: the triple in one sentence, the overrule line quoted, the HUD entry's before and after in one line each, the three new entries with their Avoid lists, the Rung entry's decision on "pip", the research line added, the 540 check and its result, the two records committed, and the four constants named as untouched.

**(k) Stop and report.** Under 150 words: the commit hash, what moved in ADR 0054, the entries added and amended, the struck fix, and anything you left.

### What must not move, and a move is a stop

- **`step-4-coder-contract.md`'s list, whole.** Plus: no file under `src/` is in this commit, no test moves, and no version constant moves.
- **ADR 0054's number, its title and its filename.** Same question, new answer, so the file does not move. Compare round two's ADR 0008, whose title changed and whose filename moved with it.
- **ADR 0054's decision.** Both channels exist and neither is the only reading of a loss. **You are changing a word, not a ruling**, and an amendment that changes what the ADR decides is a stop and report.
- **ADR 0002, ADR 0003 and ADR 0055.** Record R4 rules that both score sources are built and that **neither ADR is superseded**, so neither is edited here and no supersession note is written into either.
- **No ADR gains a combat magnitude**, and you file no ADR.
- **`pnpm verify` green before you commit.** A docs-only commit that reddens the suite means you touched something you were not asked to.

### Seams under test

**None. This commit has no code in it.** The tree's own check is the suite green before and after, and the records' check is that every claim you wrote is one the record already made.

### Module boundaries

Nothing is created, deleted, merged or split under `src/`, and no import direction changes, because no module is opened.

### The planned test list

**No test is added, moved, retitled or deleted.** The test-name diff for this commit is zero added and zero removed, and that figure is the assertion: a docs commit that moved a test name moved code.

### Verification steps, with actors

1. **Agent.** `pnpm verify` green at the repo root, twice on the committed tree, at the test-file and test counts the tip carries.
2. **Agent.** The test-name diff, zero and zero, against a baseline captured before your first edit into `local/step5/`.
3. **Agent.** A grep across `docs/` and `apps/hungry-grave/docs/` for the amended word, saying which remaining occurrences are deliberate, and a grep of `CONTEXT.md` for "540".
4. **Agent.** The four version constants named as untouched, each read off the tree with its file.
5. **Human (Mark), and none of these blocks you.** ADR 0054 is his and the amendment is ours: he reads it on the branch and it is his to overrule before merge.

### State of the branch

- The tip should be slice J3's docs commit. **At HEAD the four read `WITNESS_VERSION` 10, `READINGS_VERSION` 7, `FORMAT_VERSION` 4 and `GOLDEN`'s checksum `1307518644`, as slice J3 pinned it.** Read all four yourself and report them. **Nothing in this commit moves any of them.**
- **You are permitted no version move and no `GOLDEN` re-pin.** The whole step's budget is one witness move and one re-pin, both slice M1's.
- The design record and the research record are untracked in the worktree and this commit is where they enter version control.

### The stuck rule

**Three things are already known to be a stop:** anything under `src/` uncommitted when you start, which means another agent is mid-slice; any version constant moving; and `pnpm verify` red before your commit. **And two things are ruled rather than open:** the HUD's placement is R1's and the amended entry's text is the record's to write and yours to copy, and the 540 fix is struck. **A claim in the record that is false against the tree goes in the note and the record's intent is followed rather than its stale letter; an unclear intent is a stop.**

### What is not your job

- **The field channel per line.** The record's section 7 says step 5 builds the HUD channel whole and does not finish the field one, and making each line's rung countable in its own expression belongs beside each line.
- **Cave Story's MAX buffer.** Ruled out of V1 and filed in section 7. You write the superseding line and build nothing.
- **The shove and the impulse glossary entries**, which are round two's (handoff open item 9).
- **#102**, the browser's back gesture, which is Mark's to schedule at the end of the push.
- **Any code at all**, and **the two prompt files themselves**, which are the orchestrator's.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**

---

## Slice 2 (M1): a kill pays score, and a bled rung stays bled until the grave grows (#99)

Model: Opus, subagent type general-purpose. **Two code commits and one docs commit.** Messages end in `(#99)`.

Slice M1 of The Hungry Grave: `state.score` is written in exactly one place in the whole simulation and only from growth past the size ceiling, so a run that never reaches the ceiling carries a score of zero for its whole length and the floor ladder's first rung is dead in precisely the runs it exists for. This slice makes a kill pay score, and makes the rung a floor hit bled stay bled until the grave grows off the floor.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M1.

**Two code commits, and it is this step's only departure from the contract's one-code-commit rule.** The witness fold lands in its own commit declaring every new folded field, for the reason slice H's and slice J2's did: a version stamped before the fold stops moving names several folds (`apps/hungry-grave/docs/lessons.md`, The sim). **Build the fold commit whole and green rather than splitting a finished body of work afterwards**: write the rule tests that need the second commit's behaviour as `test.todo` inside the fold commit and fill them in the second. That is the tech gate's own finding on slice J2 and it would have cost that slice a rebuild. **The split is also what isolates the two `GOLDEN` causes**: the fold commit moves the checksum alone and the score commit moves `score` beside it, so neither re-pin has to argue two causes at once. Round two's note section 18 is slice J3 doing exactly this across two code commits, and it is the nearer precedent to yours than J2's section 15.

**Six rulings shape this slice and none of them is yours to revisit.**

**First: score is one number fed by several inputs, and a kill is the first of them to be built** (record R4, ruled by Mark on 2026-09-16). His words: "Kills doesn't fully represent how well you've done. Kills, boss damage, whether you killed the Waking source, how many large food items you got after full power, (more?) ... there's plenty that can feed a number score." **So a kill pays score, and a kill is never the whole of the score.** ADR 0003 and decision-log entry 4 already make growth past the size ceiling an input, and the tree implements that one alone, in `src/game/swallow.ts`, where `git log -S` says it is the only site it has ever had. **You add the kill and touch nothing else about the number.** The other inputs he named, boss damage, the Waking's source killed and large food taken after full power, are slice M7's, **and ADR 0002's dated supersession paragraph is step 5.0's**: you file no ADR and amend none.

**Second: what a kill pays is a field on the mob row, exactly like `corpsePayout` beside it, and never a compiled constant** (record R4, and the standing rule that a number which must exist before it is measured is data). **Every mob row carries one because every mob row carries `corpsePayout`**, so a body without one is not a state the type permits. **The score is paid on the kill and not on the swallow**, which is what ADR 0002's surviving clause says and what keeps the two currencies clean: a kill pays score, a swallow pays size and reservoir.

**Third: the rung the ladder bled stays bled until the grave grows off the floor** (record R4, ruled by the orchestrator on 2026-09-16 after the vision gate and the design gate raised the same thing independently). **The storm kills about 2.47 bodies a second** (`step-4-progress.md`), so without this rule a floor hit bleeds the score, the next kill re-arms it within half a second, the next floor hit bleeds it again, and the level strip and the fallen rung could only ever fire where nothing is dying. **In the mow the floor would be immortality, which is the one thing ADR 0003 says the floor is never**, and autofire would be paying the ladder's toll for the player. The mechanism: **any floor hit that runs the ladder sets the memory**, the bleeding one and the stripping one alike, so a floor hit that finds no score cannot leave the rung re-armable by the next kill; while it is set, kills do not re-arm the rung, so the second floor hit while small strips a level and the third strips again. **Clearing it takes a full hit's worth of growth off the floor, `SIZE_FLOOR + HIT_SHRINK`, and growing is the player's own act.** Score itself keeps accruing from kills the whole time; what is withheld is the rung's ability to absorb a second hit for free. The precedent is Sonic's rings, a counter that sits beside the score rather than being it, which refill only by the player's own act and never as a side effect of the player's weapon firing (`docs/research/floor-ladder-precedent.md`).

**Fourth: the bled-rung memory is folded, it lives on `Grave`, and it is this step's only witness move** (record R4 and section 5, the placement ruled by the orchestrator on 2026-09-16 on the tech gate's finding). It is state a replay must rebuild, which is folded state (ADR 0019), and folded state that gains a field moves the version, which is `witness.ts`'s own rule. **It is a field on `Grave` beside `invulnerable` and never on `RunState`**, because `growGrave` takes a `Grave` and a memory kept on the run would have to be cleared from `swallow.ts`, which would put `grave.ts`'s own rule in a second module. **From the branch tip that move is 10 to 11, in its own commit, and a second move anywhere in this step is a stop.** Its cost is stated rather than discovered: every tape recorded before your fold commit is refused at the decode.

**Fifth: `GOLDEN` re-pins twice, once per code commit, and each re-pin proves one cause** (record section 5, the orchestrator on 2026-09-16 correcting that section's own "exactly once" after the tech gate). A fold commit that lands green with the version moved is a re-pin in its own right, because a new folded field folds its resting value on every tick. **The fold commit's re-pin moves the checksum and nothing else**, and its proof is J3's own shape at round two note section 18: the canonical scenario with the memory asserted false on all six hundred ticks and folded the old way returns `1307518644` whole, every field and the checksum. **The score commit's re-pin moves `score` and the checksum**, because the canonical scenario's two scripted kills at ticks 240 and 540 (`src/dev/digest.ts`) now pay score, and `score` is exactly those two kills' own rows summed, proved against the fold commit's own pin rather than against J3's. **Every other field holds at both pins**: tick 600, the seed, `graveX`, `graveY`, `size`, `reservoir`, `mobs`, `shots`, `corpses`, `skulls`, `wisps`, `kills`, the `drawn` record, the levels record and every one of the eight stream cursors. **A move in any of those is a stop and report and never a re-pin.**

**Sixth: `READINGS_VERSION` moves 7 to 8, in the same commit as the score change, and it is not optional** (orchestrator, 2026-09-16, under one-push mode, correcting the record's section 5). **`run.score` is a declared reading** in `batchReport.ts` and `compareRuns.ts`, and after this slice it means kills plus overflow where it meant overflow alone: same name, different definition, which is `readingsVersion.ts`'s own rule for when the version moves and is exactly the case its bottom-edge worked example exists to make loud. **Every batch recorded before you is incomparable with every batch after you on that key**, and version 8's own note says so, naming `run.score` as the reading whose meaning changed and naming the ladder's own keys beside it if they moved with it. That is J2's pattern and slice I's before it: the note carries what moved, what did not, and what the change made possible.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **ruling R4 in full, which is the whole of this slice**, then section 3.4 for what the sim already carries, section 4's M1 paragraph, section 5 for the budget, section 6's test sentences, and **section 7's first finding, which is this slice's behaviour written out for Mark and is not yours to soften**.
4. `apps/hungry-grave/docs/research/floor-ladder-precedent.md`, the Sonic ring entries, and `portrait-hud-and-catchable-loss.md` section 8's Sonic paragraphs, where the ring numbers are now sourced and where the refill-by-the-player's-own-act rule is stated.
5. `apps/hungry-grave/docs/adr/0002-corpses-are-fuel-and-carriers-meter-power.md` **as step 5.0 amended it, its dated supersession paragraph quoting Mark's ruling above all**, and `0003-size-is-health.md` in full, which are the two this slice makes true at once, plus `0019-the-witness-and-the-refusal-rule.md` for the fold and the refusal rule, `0015` for the golden digest, and `0024` for the closed append-only fault identity list.
6. `apps/hungry-grave/docs/push/round-two-progress.md` **section 18 in full**, which is slice J3 writing a fold commit, an isolation run and a re-pin across two code commits and is **the nearer precedent to yours**; **section 15** beside it for J2's own fold commit, section 8 for slice H's, section 2 for the version ledger and section 3 for how a `GOLDEN` entry is written.
7. `apps/hungry-grave/CONTEXT.md`, the entries **Score** and **Fallen rung** as step 5.0 just wrote them, plus **Rung**, **Corpse** and **Dive**. **Read the Avoid lists before naming anything.**
8. The tree, whole where it is short and by function otherwise: `src/game/grave.ts` whole, and `bleedScore`, `stripLevels`, `strippableLines`, `runFloorLadder`, `growGrave` and the `Grave` record above all; `src/game/swallow.ts`'s one write of `state.score` and its call into `growGrave`; `src/game/offer.ts`'s `vanishSiblings`; `src/game/mobs.ts`'s `MOB_TYPES` rows, `TRASH_CORPSE_PAYOUT`, `damageMob` and `cullMobs`; `src/game/run.ts`'s `RunState`; `src/game/witness.ts`'s `WITNESS_VERSION` JSDoc and its folds, `foldGrave` above all, plus `src/game/__tests__/witness.test.ts`'s `ENTITY_CASES`, `FOLDED` and `EXCLUDED`; `src/game/events.ts`'s `scoreBled`, `weaponStripped` and `sealed`; `src/game/invariants.ts` and `src/game/faults.ts`'s `FAULT_IDENTITIES` and its severity table; `src/dev/digest.ts`'s `runScenario`, `scriptedKills` and `GOLDEN`; `src/dev/batchReport.ts` and `src/dev/compareRuns.ts` where `run.score` is declared as a reading; `src/dev/readingsVersion.ts` whole.
9. `src/dev/__tests__/harnessPolicy.test.ts`'s **measured per-seed baselines**, which are expected to move here for the seeds whose baseline run reaches the ladder at all. **They are re-measured, each with the reason beside it saying what moved and why, and never re-pinned blind**, which is the contract's own rule for a measured baseline.

### The definition, in observable terms

After this slice: a run that never reaches the size ceiling still carries a score, because a kill pays score now, beside the overflow that was already paying it. A hit at the size floor with score standing bleeds the score and takes no level. Kills keep paying score afterwards, and **the next floor hit while the grave is still at the floor strips a level rather than bleeding again**, and a floor hit that found no score leaves the rung just as bled as one that bled. Growth of a full hit's worth off the floor re-arms the rung, so the floor hit after it bleeds rather than strips; a crumb of growth does not.

**Nothing draws.** The HUD does not exist yet, no renderer is opened and nothing under `src/app` is touched. **What this slice does leave for the screen is the memory itself, exposed on `Grave`**, because slice M3 draws the score as spent while it is set; between this slice and M3 nothing draws the score at all.

`FORMAT_VERSION` still reads 4. **`WITNESS_VERSION` reads 11, `READINGS_VERSION` reads 8, `GOLDEN` is re-pinned twice, the fold commit's with the checksum alone and the score commit's with `score` beside it and nothing else**, and `pnpm verify` is green.

What a player meets, once the HUD lands behind it: the floor is a ladder with teeth rather than a floor the storm pays for.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m1`. **Step 5.0's docs commit must be in the tree; if it is not, that is a stop.**

**(b) The tests first, red.** **Write the kill-pays-score test and the bled-rung test first**, both expressed against the row and against the rule rather than against a number typed in the test.

**(c) The score row, and this is the one number you pick.** A field on every mob row beside `corpsePayout`. **The record gives no figure and that is deliberate**: nothing can measure what a kill should pay before kills pay anything, so it is data and the first figure is yours. **Set it against `corpsePayout`'s own shape**, which is a base constant with the rows expressed as multiples of it, so a reader sees the relation rather than three unrelated numbers, and say in the note what you chose, what you set it against, and that it is a first figure M6's readings are what it gets tuned against. **A number in a test is a stop; a row the test reads is the rule.**

**(d) The payment site.** Where the kill is resolved, not where the corpse is swallowed. **A body that dies with no mob row is a case the record does not rule**: the boss and the set piece's source are not `MOB_TYPES` rows, so decide once, build it, and **annotate it in the note as a gap with the reason**, on the cited-future rule. Do not build a payout for a caller nobody has written down. **And a body that stops being alive is not always a kill**: `offer.ts`'s `vanishSiblings` sets `alive = false` on the offer bodies the player did not take, and nothing died there, so **it must pay no score and a test says so**. Check every other site that clears `alive` the same way before you settle where the payment goes.

**(e) The bled-rung memory, and it lives on `Grave`.** A field beside `invulnerable`, **set in `runFloorLadder` on any ladder run**, the bleeding one and the stripping one alike, so a floor hit that finds no score does not leave the rung re-armable by the next kill. **Cleared inside `growGrave`, and only once the grave has grown a full hit's worth off the floor**: size at or above `SIZE_FLOOR + HIT_SHRINK`, 21 against a floor of 18, a rim about 17 percent taller and visible. **A crumb never clears it**, and that is the whole point of the threshold: a fully stale trash corpse pays 0.025 units against a fresh one's 0.10125, so a clear at any growth at all would be bought back invisibly in the mow, which is the same hole the rule exists to close one step up. **The threshold is the orchestrator's craft call under R4 and not yours to move**; the record's section 7 carries the crumb against the hit's worth as Mark's own lever. **`swallow.ts` is not opened for this at all**, because `growGrave` is where growth lands and `grave.ts` owns the rule end to end. Score keeps accruing from kills while the memory is set, which is the half of R4 that keeps the player from being punished twice, and a test says so.

**(f) The invariant, and it is the rule's own.** R4's mechanism has one state that must never exist: **the memory set while the grave is off the floor**. Express that check in `invariants.ts` **beside `checkSize`**, which is the check that already owns ADR 0003's two ends and is where a reader looks for the floor, with every existing check keeping its meaning and its severity. **You are permitted to append at most one fault identity if the check needs one of its own**, appended at the end of `FAULT_IDENTITIES` with its severity-table entry, which moves nothing else (ADR 0024, closed and append-only), and the note names the identity and says whether you needed it. **An appended identity moves `faults.ts`'s own JSDoc counts with it**: the header's twenty-two identities and the severity sections' own counts are prose that goes stale in silence, so move every count the append changes and say which you touched. If an existing identity honestly carries it, use that instead and say so.

**(g) The witness fold, in its own commit.** The memory folds in `foldGrave`, **appended after `invulnerable`**, because a widening appends and never reshuffles what is already in place, which is the reason `foldImpulse`'s own JSDoc already gives. **`witness.test.ts` gains its entry in `ENTITY_CASES` beside `grave.invulnerable`**, with its `move` and its `restore`, and its path in `FOLDED`, because the partition test fails on a field in neither list. The field is declared in `WITNESS_VERSION`'s JSDoc as a dated paragraph naming it and why it is not excluded, and the version is stamped in the same commit. **`witness.test.ts`'s `EXCLUDED` list is the precedent for anything that is pure provenance.** The cost paragraph says plainly that every tape recorded before this commit is refused at the decode.

**(h) `GOLDEN`, re-pinned twice, once per code commit, each proved rather than promised.**

- **In the fold commit.** Run `digest.test.ts` after the fold. The checksum should move and no other field should. **Prove the single cause before you pin**, J3's way: the canonical scenario with the memory asserted false on all six hundred ticks and folded the old way returns `1307518644` whole, every field and the checksum, both digests printed side by side. A field other than the checksum moving here is a stop and report.
- **In the score commit.** Run `digest.test.ts` again. **If it is green, stop and report**, because the scenario's two scripted kills should have moved `score` and a green digest means your payment site is not on the path a scripted kill takes. **If it is red, prove the diff's causes before you pin**: show `score` equal to the two scripted kills' own rows summed, computed from the rows rather than typed, and show every other field holding **against the fold commit's own pin** rather than against J3's, field by field.

**Both readings go in the note.** Each pin carries its own dated paragraph in `digest.ts`'s JSDoc naming every field that moved beside every field that held, the way slice H's, J2's and J3's do, and its own entry in the note's section 3.

**(i) The readings, and the version moves with them.** **`READINGS_VERSION` 7 to 8, in the same commit as the score change**, because `run.score` changes meaning on the tick that commit lands and a version stamped a commit later names a build whose reports already meant something else. **Version 8's own note is a dated paragraph in `readingsVersion.ts` in the voice versions 6 and 7 already use**: `run.score` named as the reading whose meaning changed, from growth past the size ceiling alone to kills plus that growth; **every batch before this commit named as incomparable with every batch after it on that key**; every other reading named as still meaning what it meant, **including `tuning.damageTaken.scoreBled` if its definition holds and named as moved if it does not**, which you decide by reading it rather than by assuming either way. **Check the rest of the readings for the same exposure before you write the note** and list what you checked. **What does not move it: M6's two new readings, which are not yours, and any key that merely reads a different number.**

**(j) The measurements this slice owes.**

- **The score a full run ends on, from a batch**, so the number exists before anything is tuned against it. `pnpm vite-node --config vite.headless.config.ts scripts/batch.ts <configuration> <first-seed> [count]`, on the configurations and seeds round two's note section 15 used, with `run.score` printed. **Say plainly that it is incomparable with every earlier batch's `run.score`**, which is item (i)'s whole subject.
- **Floor hits per run and what each one cost**, split into bleeds and strips, off the same batch, because R4's whole claim is that the strip is now reachable in ordinary play. **This is the reading M6 turns into a declared one; here it is a measurement in the note.**
- **The growth measured at every clear**, so the threshold is a reading rather than a belief: over one run, each tick the memory cleared, the size it cleared at, and what fed the grave to get there. **Name the predicate in the note exactly as it reads in the code.**
- **Replay determinism at your tip.** One seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
- **A pre-fold tape refused by its witness version rather than diverging**, once, off your own fold commit.
- **A conditioned tape at the ladder rig with levels pinned**, measured to `outcome: 'verified'`, because the ladder is loudest with a full build.

**(k) CodeRabbit CLI, one iteration, then the code commits.** The fold commit first, something in the shape of `feat(hungry-grave): the ladder remembers the rung it bled and the witness folds it (#99)`, then the rest, something in the shape of `feat(hungry-grave): a kill pays score and a bled rung stays bled until the grave grows (#99)`.

**(l) The progress note**, section **7**. Beyond the contract's list, say: the score row you chose with what you set it against and that it is a first figure; the payment site, the bodies with no row named as a gap and `vanishSiblings` named as paying nothing; the memory's set and clear sites with the clear's predicate quoted and the growth measured at each clear; the invariant beside `checkSize`, whether a fault identity was appended and which `faults.ts` counts moved with it; `WITNESS_VERSION` 11 with what the move costs and the field's place in `foldGrave`; **both `GOLDEN` re-pins**, the fold commit's with its isolation run printed and the score commit's with `score`'s arithmetic shown and every held field named; `READINGS_VERSION` 8 with version 8's note quoted, the readings you checked for the same exposure and what you decided about `tuning.damageTaken.scoreBled`; the batch figures with the incomparability stated; and `FORMAT_VERSION` 4 named as held.

**(m) Stop and report.** Under 300 words. **Do not start slice M2.**

### What must not move, and a move is a stop

- **`FORMAT_VERSION` 4.** Nothing here changes the wire. A new fault identity is append-only and moves no byte's meaning (ADR 0024).
- **`WITNESS_VERSION` moves exactly once, 10 to 11, in its own commit.** A second move is a stop.
- **`GOLDEN` re-pins twice, once per code commit**: the checksum alone in the fold commit, `score` and the checksum in the score commit. **Any other field moving, at either pin, is a stop and report.** A third re-pin is a stop.
- **`READINGS_VERSION` moves exactly once, 7 to 8, in the same commit as the score change.** A second move anywhere in the step is a stop, and **no other slice is permitted one**.
- **ADR 0003 stands whole, and ADR 0002's surviving clause, that a kill pays, is what you build.** Its superseded clause, that a kill is all that pays, is recorded by step 5.0's own supersession paragraph and not by you. **You file no ADR and amend none.**
- **The overflow source in `swallow.ts` keeps its exact meaning.** The score gains the kill as an input and never trades the overflow for it. **And the memory's clear lives in `growGrave`**, so `swallow.ts` is not opened for the ladder's rule at all.
- **The three ladder events, `scoreBled`, `weaponStripped` and `sealed`, stay three.** They are deliberately separate because at the size floor there is no shrink and ADR 0040's rim channel is silent.
- **`stripLevels`' own rule**, one level off every line that has one to give, in the same tick. M5 changes the order it walks and nothing here does.
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty.
- **Every existing invariant's meaning and severity, every cap, `STREAM_SALTS` and `STREAM_ORDER`.**
- **No test is deleted, skipped, weakened or rewritten to reach green.** A measured baseline that moves is re-measured with its comment saying what moved and why.
- **Nothing under `src/app` is in this slice at all.** No renderer, no HUD, no layout.

### Seams under test

`src/game/mobs.ts`: the score field on every row, and a kill paying it where the kill is resolved. `src/game/grave.ts`: the floor ladder bleeding, the memory on `Grave` set at any ladder run, the second floor hit stripping, and a full hit's worth of growth clearing it inside `growGrave`. `src/game/offer.ts`: a vanished sibling paying no score. `src/game/witness.ts`: the fold over the memory and the version that moves with it. `src/game/invariants.ts`: the state that must never exist. `src/dev/digest.ts`: the canonical scenario's score.

### Module boundaries

**Nothing is created, deleted, merged or split, and no import direction changes.** `src/game` stays dependency-free and pure, the core's cycle guard keeps `KNOWN_CORE_CYCLES` empty, and `src/dev` reads the run and never writes it. The score row lives in the module that owns the mob table, beside `corpsePayout`, because a helper joins the file whose concept it serves, and **the bled-rung memory lives on `Grave` in `grave.ts`**, which owns both the ladder that sets it and the growth that clears it, for the same reason. No new library enters.

### The planned test list

1. *A kill pays score from its own row, and the score a run ends on is the sum of what it killed and what it overflowed*, which at this slice's tip are the only two inputs built.
2. *Every mob row carries a score payout*, so a body without one is not a state the type permits.
3. *A hit at the size floor with score standing bleeds the score and takes no level.*
4. *A floor hit that bleeds the score leaves the rung bled: kills keep paying score, and the next floor hit while the grave is still at the floor strips a level rather than bleeding again.*
5. *Growth of a full hit's worth off the floor re-arms the score rung, so the next floor hit after it bleeds rather than strips.*
6. *A crumb of growth does not re-arm the rung*: a fully stale trash corpse's payout leaves the memory set.
7. *A floor hit that finds no score leaves the rung bled too*, so a kill after it does not re-arm the cushion.
8. *An offer's vanished siblings pay no score*, because nothing died there.
9. *A third floor hit while still at the floor strips again*, because the memory is not a one-shot.
10. *Growth past the size ceiling still converts to score*, the half that did not change, asserted so it cannot drift out.
11. *The memory is never set while the grave is off the floor.* The invariant, through the harness rather than by reaching into the check.
12. *A replay rebuilds the bled rung at every checkpoint.*
13. *A tape recorded before the witness moved is refused by its version rather than diverging at a checkpoint.*
14. **The fences**, green, each by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
15. **The golden digest**, re-pinned at both commits: the fold commit's checksum proved single-caused by the isolation run, and `score` proved equal to the two scripted kills' rows summed at the second.

**What this slice is expected to turn red.** `mobs.test.ts` and `grave.test.ts` throughout, `run.test.ts`, `witness.test.ts`, `digest.test.ts`, `invariants.test.ts`, `swallow.test.ts` wherever score is asserted, `measure.test.ts`'s rich fixture, `replayTallies`' own tests, and `harnessPolicy.test.ts`'s measured per-seed baselines, which are **re-measured with the reason beside each and never re-pinned blind**. **A realistic count is 14 to 22 files**, against slice H's 18 and J2's own, both of which were version moves like yours. A diff much smaller than that is a reason to check what you have not reached.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit.
3. **Agent.** `WITNESS_VERSION` 11 and `READINGS_VERSION` 8 each stated with what the move costs, and `FORMAT_VERSION` 4 held, each read off the tree.
4. **Agent.** **Both `GOLDEN` re-pins**: the fold commit's isolation run returning `1307518644` whole, and the score commit's `score` arithmetic shown with every held field named against the fold commit's pin.
5. **Agent.** A pre-fold tape refused by its version rather than diverging.
6. **Agent.** Replay determinism on one seed under `shaky-short`, and a conditioned tape at the ladder rig measured to `outcome: 'verified'`.
7. **Agent.** A batch with `run.score` and the floor-hit split printed, and the incomparability stated.
8. **Agent.** The fences green, each named by test title.
9. **Human (Mark), and none of these blocks you.** The record's section 7 first finding is his read: take a hit at the floor and lose the score, take a second before growing and lose a level off every line, dive under food to grow, and the next hit costs score again. **He reads it on the deploy after the HUD lands, not after this slice.**

### State of the branch

- The tip should be step 5.0's docs commit. **At HEAD the four read `WITNESS_VERSION` 10, `READINGS_VERSION` 7, `FORMAT_VERSION` 4 and `GOLDEN`'s checksum `1307518644`, as slice J3 pinned it.** **Read all four off the tree yourself before you lean on any of them**, because a slice may land between this line and you, and say what you read.
- **You hold the whole step's witness move, its whole readings move and its whole `GOLDEN` budget, which is two re-pins, one per code commit.** M2, M3, M4 and M6 are permitted none, and M5 is permitted at most one `GOLDEN` re-pin that is expected to go unused.
- The headless browser runs at 3 to 21 FPS under SwiftShader and puts consecutive screenshots 74 to 120 ticks apart. That is the harness and not the build.

### The stuck rule

**Four things are already known to be a stop:** step 5.0 not in the tree; a `FORMAT_VERSION` move or a second witness move; a `GOLDEN` diff at the fold commit with any cause other than the checksum, a diff at the score commit with any cause other than `score` and the checksum, or a green digest at the score commit where the scripted kills should have moved it; and a fence, a cap or an existing invariant's severity moving. **And four things are ruled rather than open:** a kill is an input to the score and never the whole of it, the bled rung stays bled until the grave grows a full hit's worth, ADR 0002's superseded clause is step 5.0's to record and not yours, and **`READINGS_VERSION` moves once here, 7 to 8, for `run.score`'s meaning**, which the orchestrator ruled against the record's own section 5. **A second readings move, in this slice or any other, is a stop.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **The HUD**, in every part, and **nothing under `src/app` is in this commit.** M3's.
- **The score's countdown**, which is renderer state and M4's.
- **The fallen rung and the fourth food kind**, M5's, including `stripLevels`' roster walk.
- **The layout, the viewport units and the safe area**, M2's.
- **Declaring a reading**, M6's. You measure and print; you declare nothing.
- **Cave Story's MAX buffer**, ruled out of V1 and filed in the record's section 7 because R4's first rung is already the cushion.
- **The record's section 7 findings**, none of which any slice acts on.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**

---

## Slice 3 (M2): the frame is composed, and the band is reserved (#72)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#72)`.

Slice M2 of The Hungry Grave: the frame around the field is fitted to each screen rather than composed for either, the canvas is sized to a unit that changes under the player mid-run, and there is nowhere declared for the HUD to live. This slice composes the frame across the three regimes the measurements actually found, reserves the HUD's band, and stops the field re-fitting itself when the browser's chrome retracts.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M2.

**This slice changes no simulation rule at all**, which is why it owes no `GOLDEN`, no witness move and no version move of any kind. **No number in the layout is a sim number and the field stays 540 by 760**, which is #72's own criterion.

**Five rulings shape this slice and none of them is yours to revisit.**

**First: the HUD is one row at the field's top edge, outside the field where the stage offers room and over it where it does not** (record R1). **One form, one row, one placement rule, no viewport breakpoint.** The measurement decides it: a phone gives the field the full stage width and **no side gutter at all, exactly zero**, and a desktop gives the field the full stage height and **no band at all, exactly zero** (record section 3.1). **There is no home both shapes share except the field's own rectangle.** This is the same trade `fitField` already takes and documents, and it keeps Mark's ruling that the field never pays width untouched.

**Second: the band is 28 field units and the mark inside it is 11** (record R1). The mark is measured first and the band is declared from it, in that order, because a reading proved at one size is not proved at a quarter of it. The band is what the content needs: an icon of 24 units with a row of five 11-unit marks beside it and two units of padding above and below. **`layout.ts` declares the band and the HUD's own test asserts the measured content fits inside it**, which is exactly the split `READOUT_RESERVE` already uses and states. **You declare the band; M3 measures its content against it.**

**Third: the three regimes are named and the squeeze is the one nobody had designed for** (record R10 and section 3.1). A tall shape gives bands and no gutter, a wide shape gives gutters and no band, and between them, at a viewport aspect near the field's own 0.711, both collapse and every control ends up over the field. **Under `svh` that third regime is the phone's standing layout rather than a corner case.** The portrait tablet is in the sweep **as a test viewport only**, because it is the cheapest shape that exercises the squeeze deterministically.

**Fourth: the even slack split is the mitigation and it does not reach zero** (record R10). `fitField`'s lowering branch centres the field inside the box *below* the reserve, so the reserve's 120 units land entirely on top: 133 above and 13 below at an iPhone at `svh` 660. Centring the field in the whole box and pushing it down only far enough to clear the reserve gives 120 and 26 at the same viewport. **It changes nothing at all at the shortest viewports, where the field simply fills the stage**, and the belch's overlap is the record's section 7 third finding, filed and not solved, because Mark ruled the corner.

**Fifth: `svh`, on `#app`, with `resizeTo` pointed at `#app`, and the inset taken out of the measured box rather than read by the layout** (record R10 and section 9 ruling 7). **The `svh` change alone does nothing**: `engine.ts` does `opts.resizeTo ??= window` and the resize plugin reads `globalThis.innerWidth` and `innerHeight` whenever `resizeTo` is the window, so the canvas is sized from the window whatever `#app`'s height is, and on iOS `innerHeight` tracks the dynamic viewport, which is the clipping `svh` was supposed to prevent. **The two changes land in the same commit or the stylesheet edit is one the canvas never sees.** The mechanism for the inset is a custom property written once at boot: the entry point reads `env(safe-area-inset-bottom)` a single time, writes it to `--inset-bottom`, and `#app` is `height: calc(100svh - var(--inset-bottom))`. **Read once, never live.** A bare `env()` inside the `calc()` would re-fit the field mid-run, because the bottom inset changes as the browser's toolbar moves on iOS Safari and Chrome Android (Chrome's edge-to-edge guide, csswg-drafts #11019), and that movement is the exact thing `svh` is here to stop. `env(safe-area-max-inset-bottom)` is the static value this wants, Safari does not carry it yet, so it is named as the future replacement and not used. The box the engine measures is then clear of the home indicator, never changes mid-run, and every stage unit inside it is safe by construction. **`layout.ts` keeps knowing nothing about devices, insets or browsers**, which is the property its own header claims.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **rulings R1 and R10 in full and section 3.1's table in full, which together are this slice's contract**, then section 4's M2 paragraph, section 5, section 6's last five test sentences, and **section 7's third, fourth and fifth findings, which are the belch's overlap, the smaller phone field and the home indicator, all filed and none of them yours to act on beyond what R10 builds**.
4. `apps/hungry-grave/docs/research/portrait-hud-and-catchable-loss.md` **sections 9, 10, 11 and 12 in full**: the touch-target floors and the correction to the 44 number this project repeats, the viewport units, the gesture mechanics and `env()`'s dependence on `viewport-fit=cover`, and the portrait shmup that shipped a HUD-position patch because a phone's hardware ate its score. **Section 9 says plainly that the safe area's numbers are empirical and are not published**, which is the reason to read them from `env()` rather than declare them.
5. `apps/hungry-grave/docs/research/viewport.md`, the findings on viewport policy and its touch-minimum item, which carries the loose version of the 44 number that section 9 corrects.
6. `apps/hungry-grave/docs/adr/0003-size-is-health.md` and `0009`, which the fit preserves, plus `0014-readability-layering.md` and `0039-the-field-boundary-is-a-readout.md`, because the band sits next to a readout that already exists.
7. `apps/hungry-grave/CONTEXT.md`, the entry **HUD** as step 5.0 just amended it. **Read the Avoid lists before naming anything.**
8. The tree: `src/app/layout.ts` **whole**, especially `READOUT_RESERVE`, `fitField`'s own comment carrying Mark's 2026-08-22 ruling, `centred`, `coversAReadout` and `intersects`; `src/app/__tests__/layout.test.ts` whole, especially *never pays field width for a readout, at any viewport* and the phone-height sweep beside it; `src/engine/engine.ts`'s `init` and its `resizeTo` default; `src/engine/resize/resize.ts` and `ResizePlugin.ts` whole; `src/main.ts`'s `initEngine` and its `resizeOptions`; `public/style.css` whole; `index.html`'s viewport meta, which already sets `viewport-fit=cover`; `src/app/screens/game/GameScreen.ts`'s `resize`, the pause button and the belch button; `src/app/screens/game/__tests__/BelchButton.test.ts`'s `VIEWPORTS` and its two rects.

### The definition, in observable terms

After this slice: `layout.ts` declares the HUD's band beside `READOUT_RESERVE` and answers where the row goes at any viewport, outside the field where the stage's band allows it and over the field's own top edge where it does not, with one rule and no breakpoint. A shortened window splits its slack evenly above and below the field rather than piling the whole reserve on top. The page's canvas is sized to the small viewport and the renderer measures `#app` rather than the window, so **the field's placement does not move when the browser's chrome retracts mid-run**. The bottom control's target clears the safe-area inset the page reports and still measures at least 44 CSS pixels at every viewport in the sweep.

**No HUD content yet and no sim change**, and `layout.ts` still knows nothing about devices, insets or browsers. `WITNESS_VERSION`, `READINGS_VERSION`, `FORMAT_VERSION` and `GOLDEN` are all untouched and none of the four files is in the commit.

What a player meets: on Mark's phone the play area is slightly smaller and **stops moving**, which is the record's section 7 fourth finding and is his own read after the deploy.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m2`. **Slice M1 must be in the tree.**

**(b) The tests first, red.** **Write the never-pays-width test's neighbour first**: the three-regime placement test, at a tall viewport, a wide one and one at the field's own aspect. It is the one this slice is most likely to break and least likely to notice breaking, because the existing sweep is a phone-height sweep and the squeeze is not a phone-height case.

**(c) The band, declared.** A reserve beside `READOUT_RESERVE` in `layout.ts`, in field units, **28 with the 11-unit mark inside it, both R1's**, with the derivation in its JSDoc the way `READOUT_RESERVE`'s own comment carries its. **You declare it and assert nothing about its content**, which is M3's half and is the split `READOUT_RESERVE` already uses.

**(d) The placement rule.** One function that answers where the row sits at a placement: outside the field where the stage's band above the field is at least the band's own height, and over the field's own top edge where it is not. **It is drawn in field units and scaled by the field's placement**, which is what makes one mark subtend the same fraction of the field on a 320-wide phone and a 1440-wide desktop. **The row's two ends stop short of the two reserved top corners**, `READOUT_RESERVE`'s own: the readout stack on the left and the pause button on the right. That holds at every viewport, whether the row sits in the band or over the field's top edge, and it is **asserted in the test list rather than done deliberately by hand**. **The row is a sibling of the field container rather than a child**, because a child would be clipped by the field's own clip and hidden on a phone where the row sits outside the field; you declare the rectangle, M3 places the view in it.

**(e) The even slack split.** `fitField`'s lowering branch centres the field in the whole box and pushes it down only far enough to clear the reserve. **Mark's 2026-08-22 ruling still binds: the field may be moved and may never be shrunk**, so the existing test of that name stays green unchanged and is the thing you check first after the change.

**(f) `svh` and `resizeTo`, in the same commit.** `public/style.css` moves `#app` to `height: calc(100svh - var(--inset-bottom))`, and `resizeTo` points at the `#app` element. **The default is `opts.resizeTo ??= window` inside the engine's own `init`, so decide where the element is named**: `engine.ts` already hardcodes `document.getElementById('pixi-container')` for the canvas's parent, so a name is in the engine today, and the choice is between naming the element there beside it or in `main.ts`, this app's entry story. **Whichever you find right, the app ends with one element name in one place**, a missing element is handled rather than assumed, nothing abnormal is silent, and the note says which you chose and why. **Keep the fallback declaration's job**: the existing block declares `height: 100vh` then `height: 100dvh`, two declarations and no `height: 100%`, and the replacement keeps that two-step shape with the `svh` calc in the winning position.

**(g) The safe area, taken out of the measured box and never read by the layout.** `viewport-fit=cover` is already set in `index.html`, which is what makes `env()` return real insets. **The entry point reads the bottom inset once at boot and writes it to `--inset-bottom`**, defaulting to zero where the browser reports nothing, and `#app`'s `calc()` reads only that property. **The inset shrinks the box the engine measures, nothing else reads it, and the box never changes again mid-run**, so `BelchButton`, which is placed in stage units by `GameScreen.resize` and has no way to read a CSS environment variable, is lifted clear of the home indicator by construction and stays where it was put.

**(h) The measurements this slice owes.**

- **The three regimes asserted**, at a tall viewport, a wide one and one at the field's own aspect, with every control and readout placed deliberately at each, **and the HUD row's two ends clearing the two reserved top corners at each**, in the band and over the field alike.
- **The record's section 3.1 table re-derived at your own tip and printed in the note**, row by row: the stage, the field scale, the side gutter, the band above and below with the even split, and the belch's vertical overlap. **Say which rows agree with the record and which do not**, because the table was computed from `fitField` as it stood and you are changing `fitField`.
- **The sweep gains the iPhone's `svh` case.** `BelchButton.test.ts`'s `VIEWPORTS` holds one phone, 390 by 844, which is the record's `lvh` contrast row, so nothing in the sweep sees the standing `svh` case at all. **Add a 393 by 660 row** so the target floor and the rendered check both meet the belch's overlap as the record measures it.
- **A rendered check at 393 by 660 and at a desktop viewport**, the built app through `vite preview` driven with `playwright-cli`. **The browser chrome's retraction cannot be exercised here and the check does not try**: headless Chromium has one viewport, `svh` equals `dvh` equals `lvh` and the inset is zero, so there is nothing to retract. **Play a run, end it, and play another**, because a check that only ever plays run one is structurally blind.
- **The target floor asserted at every viewport in the sweep**, the new row included, at least 44 CSS pixels, with the measured figures printed. **A fill that shrinks the touchable area is a stop.**
- **No tape, no batch and no determinism run is owed**, and that claim is checked rather than assumed: nothing under `src/game`, `src/tape` or `src/dev` is in this commit. **If any of the four version constants or `GOLDEN` moves, that is a stop and report**, because it would mean something here reached the sim.

**(i) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the frame is composed across three regimes and the HUD's band is reserved (#72)`.

**(j) The progress note**, section **8**. Beyond the contract's list, say: the band and the mark as declared with their derivation; the placement rule in one sentence; the slack split's before and after at three viewports; the `svh` and `resizeTo` pair with where the element is named and why; the inset's mechanism, where the custom property is written and that it is written once, and the belch's measured lift; the re-derived section 3.1 table with the rows that disagree named; the rendered check and what it could and could not see; the target floor's figures; and the four constants and `GOLDEN` all named as untouched.

**(k) Stop and report.** Under 250 words. **Do not start slice M3.**

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN` as M1 pinned it.** None moves, none of the four files is in the commit, and **you read all four off the tree rather than off this line**, and a move in any is a stop and report rather than a re-pin.
- **The field stays 540 by 760 and no number in the layout is a sim number.** #72's own criterion, and the sim never learns the viewport, so nothing about the frame changes what a seed plays.
- **The field never pays width for a readout, at any viewport.** Mark's 2026-08-22 ruling and the test of that name, which stays green unchanged. **The record's section 7 third finding prices what releasing it would buy and nothing here acts on it.**
- **The belch's control keeps the bottom-left corner.** Mark's 2026-09-15 ruling. The overlap is measured, filed and built past, and **handedness is future work**.
- **`READOUT_RESERVE`'s three figures and the two top corners it claims.** The HUD's band is a new reserve beside it, not a widening of it.
- **`BELCH_SIZE` 108 and the 44 by 44 CSS pixel floor**, which is WCAG 2.5.5 at AAA and **not Apple's minimum**, which research section 9 corrects to 28 by 28 with 44 as the default.
- **The layering.** Nothing draws above `mobFire` inside the field stack, and the HUD's band is outside that stack rather than an exception to it.
- **`touch-action: none` and `overscroll-behavior: none`** in `public/style.css`, which are #33's and are the whole documented mitigation for the gesture problem. **#102 is not solved by anything here and this slice does not claim it is.**
- **The engine's generality.** The shared wrapper is the template's; a change that makes it know about this app's element names is a design choice you state in the note rather than one you slip in.
- **No ADR is filed or amended, and no ADR gains a combat magnitude.**

### Seams under test

`src/app/layout.ts`: the band as a declared reserve, the placement rule at every regime, and `fitField`'s even slack split with the never-pays-width rule intact. `src/engine/engine.ts` or `src/main.ts`: the element the renderer measures. `public/style.css`: the box the engine measures, already clear of the inset read once at boot. `src/app/screens/game/GameScreen.ts`: every control still placed deliberately at all three regimes.

### Module boundaries

**Nothing is created, deleted, merged or split, and no import direction changes.** `layout.ts` stays the only module in the app that knows about the viewport, and it stays blind to devices, insets and browsers: the inset is read once at boot into a CSS custom property and the element is named in one place, both of them entry-point facts. **Nothing in `src/game` may import `layout.ts`** and nothing under `src/game`, `src/dev` or `src/tape` is in this commit at all. No new library enters.

### The planned test list

1. *The HUD's row sits at the field's top edge at every viewport, outside the field where the band allows it and over the field's own top edge where it does not, and it is never clipped.*
2. *One mark subtends the same fraction of the field's width at a phone viewport and at a desktop one, and measures at least 6.25 CSS pixels at the narrowest viewport in the sweep.* **The floor is slice K's own measured band and the record's R1 derivation rests on it.**
3. *A shortened window splits its slack evenly above and below the field rather than piling the reserve's whole height on top.*
4. *The frame's three regimes each place every control and readout deliberately, and the HUD row's ends clear the reserved top corners at every one*, asserted at a tall viewport, a wide one and one at the field's own aspect. **The corner clearance is this test's second half**, the readout stack's corner on the left and the pause button's on the right, in the band and over the field alike.
5. *The renderer measures the `#app` element rather than the window.* **That is the whole of what this test can say.** Headless Chromium has one viewport, so `svh`, `dvh` and `lvh` are the same number there and a retraction cannot be staged; the test asserts the engine's `resizeTo` is the element, and **the field not moving when the chrome retracts is Mark's phone read** rather than anything the agent can show.
6. *The bottom control measures at least 44 CSS pixels at every viewport in the sweep, the new 393 by 660 row included.* **The inset is zero headless**, so the clearance itself rides on the same phone read as test 5; what this test holds is the floor across the sweep.
7. *The field never pays width for a readout, at any viewport.* The existing test, held green and unchanged.
8. *The field is 540 by 760 at every viewport and no layout number reaches the sim.* Held.
9. **The layering test**, green.

**What this slice is expected to turn red.** `layout.test.ts`'s exact-offset assertions and only those, because the even split moves the field's y where it has slack to move into; `layering.test.ts`'s placement assertions, which is where `GameScreen`'s transforms are tested, there being no `GameScreen` resize test file at all; and any engine or resize test that names the window. **`BelchButton.test.ts`'s two rects do not move**, and the 393 by 660 row is an addition to its sweep rather than a change to them. **A realistic count is 5 to 7 files.** A diff larger than that is a reason to check what you reached into.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures.
3. **Agent.** The section 3.1 table re-derived at your tip, printed, with disagreements named.
4. **Agent.** A rendered check at 393 by 660 and at a desktop viewport, across two runs, screenshots read. **The chrome's retraction is not in it and cannot be**, which is step 7's half.
5. **Agent.** The target floor at every viewport in the sweep, with figures.
6. **Agent.** The four version constants and `GOLDEN` all untouched, stated, with none of the four files in the commit.
7. **Human (Mark), and none of these blocks you.** **His phone read after the deploy is the whole verdict on `svh`**, because no test can tell a field that is correctly smaller from one that is wrongly smaller. That is the record's section 7 fourth finding and section 9 ruling 7, and it is annotated as his.

### State of the branch

- The tip should be slice M1's docs commit.
- **`WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4, and `GOLDEN` as M1 pinned it at its second code commit.** **Read all four off the tree yourself and say what you read**, because M1 is where all three moves happen and a line here is not the tree.
- **You are permitted no `GOLDEN` re-pin and no version move of any kind.** The step's whole budget is M1's, spent.
- The headless browser runs at 3 to 21 FPS under SwiftShader and puts consecutive screenshots 74 to 120 ticks apart. That is the harness and not the build.

### The stuck rule

**Three things are already known to be a stop:** any version constant or `GOLDEN` moving; the never-pays-width test going red; and the target floor failing at any viewport. **And three things are ruled rather than open:** the corner is bottom-left and the overlap is filed for Mark, `svh` is the unit and his phone read is the check, and the band is 28 units with an 11-unit mark. **A measurement arguing for a different corner, for `dvh`, or for reserving width goes in the note and is built past.**

### What is not your job

- **The HUD's content**, in every part. M3's. You declare the rectangle and draw nothing in it.
- **The belch's corner and handedness**, both Mark's and both ruled.
- **#102**, the browser's back gesture, which is his to schedule at the end of the push.
- **The dev corner stack**, which stays and is not gated here: gating it is #66's whole job and doing half of it here would leave two mechanisms. **The dev stack and the HUD's band will overlap on a shortened window in a dev build, which the record names so nobody reports it as a bug.**
- **The shared widgets in `src/app/ui`**, which are #38's, and the pause button's pink with them.
- **Anything under `src/game`, `src/dev` or `src/tape`.**
- **The record's section 7 findings.**

---

## Slice 4 (M3): the HUD carries the ladder and the score (#99)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#99)`.

Slice M3 of The Hungry Grave: no score is drawn anywhere in `src/app`, nothing says which lines are owned or at what level, and the bank is still a line in the dev corner stack. This slice builds the row: the score, and each rostered line's rungs as marks against that line's own icon, in the band slice M2 reserved.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M3.

**This slice changes no simulation rule at all** and owes no `GOLDEN`, no witness move and no version move of any kind. **Nothing under `src/game` is in this commit.**

**Seven rulings shape this slice and none of them is yours to revisit.**

**First: a rung is a mark that fills, never a mark that brightens, and the filled and empty states differ by area alone** (record R2). ADR 0014 binds every colour drawn while the field is live, and its own sentence includes the readouts on top of it; ADR 0054 reads that as the HUD announcing by count, by shape or by subtraction and never by getting brighter. **So a lit mark and an unlit one cannot differ in value, and hue vanishes in grayscale, which leaves area.** **This is slice K's own construction reused rather than a new one**: the reservoir's charge is a wide arc over a narrow track, `hudInk` at luma 67.23 against `reservoirCharge` at 67.25, 0.02 luma apart, and K measured the filled band at 6.25 to 7.50 CSS pixels against the bare track's 3.00 to 4.00 at the phone viewport (round two note section 13). **The pair is `hudInk` against itself and no new colour is needed.** **And the row draws no plate**: the field shows through between the marks, which is Ikaruga's own arrangement, its HUD overlapping the playfield with nothing behind it (research section 7). A plate would be a second live-field colour spanning the field's whole width, and the band's price in the record's section 7 is priced for the marks rather than for a solid band.

**Second: the count is the reading, five marks per line at `MAX_LEVEL` 5** (record R2). A rung is best expressed as a small count of objects: Gradius Options top out at four and Cave Story has three levels, and Sky Force Reloaded shows a tier as ten blocks that progressively light up, which is the closest shipped portrait-mobile analogue in the record. **The construction is Halls of Torment's shipped fix**, the rungs as marks against the line's own icon rather than a number beside it, which is what let them fit a per-ability level into an icon's space four months after launch.

**Third: one row per line in the run's roster, in roster order, and never the build's four** (record R3). `RunState.roster` is resolved once at `createRun` and recorded in the tape header (ADR 0046). The push's standing constraint is that adding a fifth weapon line is one weapon module plus its data rows, and **a HUD that iterated `WEAPON_LINES` would be the one place a fifth line needed a retune of the others**, and would draw a row for a line the run never had. **A rostered line at level 0 draws its icon with every mark empty, because it can still be offered; a line outside the roster draws nothing at all.**

**Fourth: the mark is 11 field units and the band is 28, and the band was declared from the mark rather than the other way round** (record R1, and slice M2 declared it). **The band is `HUD_BAND` in `src/app/layout.ts`, `height` 28 and `mark` 11 in field units, and the placement function beside it is `hudRow`**, which returns the row's rectangle in stage units from the field's placement. Both are M2's and neither is yours. At the field's placement an 11-unit mark measures **6.5 CSS pixels at a 320-wide phone, 8.0 at an iPhone 15, 8.4 at a Pixel 8, 13.0 at a desktop and 16.7 at a portrait tablet**, against slice K's own measured floor of 6.25. Widthwise the content is a group of 95 units per line, four groups plus their gaps at 410, and a score of about 110, inside the field's 540 with 10 units of margin each side. **`layout.ts` declares the band and this slice's test asserts the measured content fits inside it.** **6.5 against a 6.25 floor is a margin worth seeing rather than asserting**, which is why this slice takes a grayscale screenshot at the narrowest phone.

**Fifth: the bank moves out of the dev stack and into the row, and draws nothing at all at a bank of zero** (record R11). `RunHud`'s own comment says the bank line is the stand-in form and that the field-side readout belongs to the ladder HUD. #99's second comment records #96's criterion landing there as a craft call deferred to this step. **The draws-nothing-at-zero rule is the existing one and its reason is unchanged.** **The dev corner stack itself stays** (record R12): gating it is #66's whole job.

**Sixth: the score's digits stay solid at every state, and the cushion is one mark beside them** (record R2 and R4, orchestrator 2026-09-16 on the design gate's finding). Hollow digits read as a number that is not real, which is Tetris's own ghost-piece convention, and the score is real at every moment, spent rung or not. **So the digits never change form, and what the player needs to know, whether the score rung is still there to absorb a floor hit, is one mark beside them**: filled while the rung is armed, empty while M1's bled-rung memory is set, and filled again on the growth that clears it. It is the same mark and the same fill-not-brighten rule as a line's rung, which is what lets M4 animate the bleed and the strip in one vocabulary.

**Seventh: where the row draws over the field's top edge and the stage leaves no band, the pause button drops below the row** (a craft call under R1 and R12, orchestrator 2026-09-16 on slice M2's filed finding). At the squeeze regime, the narrow phone and the portrait tablet, the row runs the field's full width across the corner the pause button stands in, and **R1's content cannot narrow to clear it**: 520 field units inside the field's 540 leaves 20 between the two reserved corners. **So the button moves and the row does not.** At that regime alone it sits just below the row at the field's right edge; where a band exists it stays exactly where it is. **M2 pinned the crossing by test and this slice replaces that pin with the clearance**, and says so in the note. **The dev readout stack's crossing on the left is not yours**: it stays R12's named dev-build-only collision and comes out with #66.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`. **The dumb-view rule and the powers-arrive-as-props rule are this slice's whole shape.**
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **rulings R1, R2, R3, R11 and R12 in full**, then section 3.1's mark sizes, section 3.2 for what draws today, **section 4's M3 paragraph in full, which names the data seam**, section 5, section 6's test sentences, and section 7's first and sixth findings.
4. `apps/hungry-grave/docs/research/portrait-hud-and-catchable-loss.md` **sections 1 to 7 and 12 in full**, which is every shipped placement and form this ruling rests on, **and read the labels**: Sky Force's ten blocks are a hangar screen and not a live HUD, and the record says plainly that anything leaning on it for placement is leaning on the wrong half.
5. `apps/hungry-grave/docs/research/visible-ladder-precedent.md` items 4, 6, 9, 10 and 11, the Gradius, Cave Story, Halls of Torment and Brotato items, **with item 11's WEAK label read**.
6. `apps/hungry-grave/docs/adr/0054-the-ladder-reads-twice-in-the-storm-and-on-the-hud.md` **as step 5.0 amended it**, plus `0014-readability-layering.md` and `0039-the-field-boundary-is-a-readout.md` in full, because a second readout on the same frame has to be told apart from the first, and `0046-a-runs-roster-is-drawn-from-a-growing-pool.md` for the roster.
7. `apps/hungry-grave/docs/push/round-two-progress.md` **section 13 in full**, which is slice K's own account of a filled readout under the same ceiling: the one-luma trick, the grayscale read measured off the pixels, the arc's two pixi facts and the footprint they cost.
8. `apps/hungry-grave/CONTEXT.md`, the entries **HUD, Rung, Score, Dive, Fallen rung, Treasure and Bank** as step 5.0 left them. **Read the Avoid lists before naming anything.**
9. The tree: `src/app/screens/game/RunHud.ts` whole and `src/app/screens/game/runSession.ts`'s `RunIdentity`, `RunReadout` and `RunSession`; `src/app/screens/game/GameScreen.ts`'s construction, `resize` and frame loop; `src/app/layout.ts`'s `fitField`, `READOUT_RESERVE` and **`HUD_BAND` and `hudRow`, the band and the placement function slice M2 declared, JSDoc included**; `src/app/screens/game/layering.ts` whole; `src/app/palette.ts`'s `hudInk`, `hudDim`, `reservoirCharge`, the band constants and the live-field list; `src/app/__tests__/palette.test.ts`, the source scan that will hold you to the ceiling; `src/app/cornerReadout.ts`; `src/game/lines/roster.ts`'s `MAX_LEVEL` and `WEAPON_LINES`; `src/game/run.ts`'s `RunState`.
10. **`src/app/screens/game/foodSprite.ts`'s `drawPowerUpIcon` whole, and its JSDoc above all. It is not exported today**, which item (f) rules on. It already draws one silhouette per weapon line, a circle for the skull stream, a hand for Territory, a kite for the wisps and a fourth for the bell, **with the four aspects deliberately held apart and each filling its box**, and #38 is named as the ticket that may replace the imagery. **This is the icon vocabulary the offer's body already teaches the player**, and the record's R6 says the fallen rung wears the icon its HUD row taught.

### The definition, in observable terms

After this slice: a slim row sits at the field's top edge carrying the score and, for each line in the run's roster and in roster order, that line's rungs as five marks against that line's own icon. A power-up swallowed fills exactly one mark, on the line it levelled, on the tick it was swallowed. A rostered line at level zero draws its marks and none of them filled. A line the roster does not name draws nothing. The bank reads on the row when carriers are waiting and draws nothing at all at zero, and `RunHud`'s bank line is gone. **The score's digits stay solid at every state and one mark beside them carries the cushion**: filled while the score rung is armed, empty while the ladder's bled-rung memory is set, and filled again on the growth that clears it, so the row says the cushion is gone until the grave grows rather than leaving the player to guess it from a standing number. **It says it by area and not by brightness** (record R2, ADR 0014), the same rule the line marks are under, and **the memory arrives through `RunReadout`** beside the score itself. **The row draws no plate**, so the field shows through between the marks.

A filled mark and an empty one differ in grayscale by area and by no step in value, every colour the row draws sits at or below the field's ceiling while the field is live, and **the row is never mistaken for the field's boundary**: the boundary's stroke and the row's marks are separable in grayscale at the narrowest phone.

`WITNESS_VERSION`, `READINGS_VERSION`, `FORMAT_VERSION` and `GOLDEN` are all untouched and none of the four files is in the commit.

What a player meets: without being told, they can say what the row at the top is telling them. **That is #99's own criterion and the done line is Mark's read.**

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m3`. **Slices M1 and M2 must both be in the tree**, and **the band M2 declared is what you measure against**; if it is not there, that is a stop.

**(b) The tests first, red.** **Write the ceiling test and the content-fits-the-band test first**, because they are the two this slice is most likely to break and least likely to notice breaking, which is slice K's own ordering for the same reason.

**(c) The view, and it is dumb.** Data in, pixels out. It builds its own visual body and contains no data source, no loop subscription and no change detection. **Powers arrive as props at construction**, a narrow record of only what it needs. **The driver outside owns the data, the diffing and the loop**, and the HUD's rectangle is read from `fitField`'s output rather than recomputed, for the reason `GameScreen` already holds the placement rather than recomputing it at pointer time: two computations in parallel agree only until one of them changes. **The rectangle is `hudRow`'s output, and `GameScreen.resize` applies it to the HUD's container exactly as it applies `fitField`'s output to the field.** **And the pause button drops below the row at the squeeze regime**, ruling seven: where `hudRow` has put the row over the field's top edge because the stage leaves no band, the button sits just below the row at the field's right edge, and where a band exists it does not move. `layering.test.ts`'s crossing pins become the clearance.

**(d) The data seam, named in the record because the tech gate found it missing.** **The roster arrives once, at the run's start, through `showIdentity`**, which is already the seam for what a run was born with. **The score, the levels, the bank and the ladder's bled-rung memory arrive every frame through `render`**, and **that is three new fields on `RunReadout` rather than four**, because `bankedOffers` is already there and is the bank. **`run.levels` is mutated in place**, so `render` hands the view a per-frame copy or reads each line's level per line and never passes the record itself: an alias defeats the driver's diff and hands a dumb view live sim state. Read the record's M3 paragraph, which already says three, before you shape either.

**(e) The marks.** Five per line at `MAX_LEVEL`, a filled mark against an outline of the same mark at the same luma, differing by area alone. **11 field units, in the 28-unit band, both M2's declared figures and neither yours to move.** The pair is `hudInk` against itself and **no new colour is declared**; if you believe one is needed, that is a stop and report, never a ceiling you raise or an exemption you claim.

**(f) The icon per line, and this is the one craft choice you research rather than pick.** The offer's body already teaches one silhouette per line through `drawPowerUpIcon`, whose own JSDoc holds two properties: the four aspects stay apart and each one fills its box. **Reuse that vocabulary rather than invent a second one**, because the record's R6 has the fallen rung wearing the icon its HUD row taught, and a second vocabulary would mean the body and the row disagree. **The reuse path is ruled and not yours to reopen: `drawPowerUpIcon` gains an export from `foodSprite.ts` and the HUD imports it**, the two being siblings in the same directory with nothing pointing back, and **extraction into a third module waits for a third consumer**. Keep `foodSprite`'s own two properties true at the icon's 24-unit box, and **say in the note what the shapes measured at that size and what you set them against**. If the shapes do not survive the size, that is a finding for the note and a measurement, not a redesign you take on your own.

**(g) The score, and the bank.** The score is the row's largest number and it reads in the band. **Budget six digits**: trash pays `TRASH_KILL_SCORE` 100 and an elite eight times it, and at the storm's measured 2.47 kills a second a run passes five digits in about forty seconds, so six is the honest width and **the row has no slack for a seventh**, R1's 410 for the four groups plus about 110 for the score plus 20 of margin being the field's 540 exactly. **The digits stay solid whatever the cushion's state** and the cushion is the mark beside them, ruling six. **The bank draws nothing at all at zero** and its line comes out of `RunHud` in this same commit, with `RunHud`'s own comment about the stand-in form corrected rather than left standing false. **Everything else in the dev stack stays** (R12).

**(h) The measurements this slice owes.**

- **The mark measured in CSS pixels at every viewport in the sweep**, read off the rendered pixels rather than computed, **including the narrowest phone**, against slice K's proved floor of **6.25**. **The record's derivation says 11 units is the smallest whole number that clears it; if your measurement says otherwise, the record's intent is the floor and not the figure**, so raise the mark to the smallest whole number that clears it, let the band follow from the content, say both in the note, and name the record's claim as false against the tree.
- **Two more floors at the narrowest viewport, measured off the pixels beside the mark's own.** **K's 6.25 was measured on a long arc's stroke and not on an isolated square**, so it travels less far than it looks and **the grayscale screenshot is the real gate rather than the arithmetic**. The two: **the empty mark's outline stroke at or above 0.89 CSS pixels**, which is `foodSprite`'s own `SPRITE_STROKE` of 1.5 units at the narrow phone's 0.59 CSS pixels per field unit, and **the gap between two marks at or above 1.8 CSS pixels**, which is 3 units at the same scale. **The outline is the ruler**: five marks is past the subitizing limit of four (Kaufman 1949), so the reading is fill length against the outline's full length rather than a count, and an outline too thin to see takes the reading with it. **A floor that fails is a finding for the note and a measurement, never a redesign you take on your own**, which is the stuck rule.
- **A grayscale read of a partway ladder, measured off the pixels the way slice K's was**, at the phone viewport where the stage is smallest: the filled mark's band and the empty mark's, in CSS pixels, and the two lumas. **Say whether the reading survives the hue being removed, which is the honest limit of a value-flat design.**
- **The row against the field's boundary in grayscale**, because the record's own test sentence promises they are separable and ADR 0039 makes the boundary a readout in its own right.
- **A rendered check at a phone viewport and a desktop one, with the screenshots read**, at a roster of one line and at a fuller build, and at level zero. **Play a run, end it, and play another**, because a check that only ever plays run one is structurally blind, which is what slice K's own empty-ring read caught.
- **The content measured against the declared band**, which is the assertion `READOUT_RESERVE` already models: the code declares, the test measures.
- **No tape, no batch and no determinism run is owed**, and that claim is checked rather than assumed. **If any of the four version constants or `GOLDEN` moves, that is a stop and report.**

**(i) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the row carries the score and every rostered line's rungs as marks (#99)`.

**(j) The progress note**, section **9**. Beyond the contract's list, say: the view's seam and what arrives once against what arrives per frame; the mark's measured size at every viewport with the floor named; the grayscale read and what it showed; the boundary separability read; the icon decision with what you set it against, the export included; the pause button's drop at the squeeze regime with M2's crossing pin replaced by the clearance; the bank moved with `RunHud`'s comment corrected; the palette scan green with every luma printed; the rendered check across two runs and what it could and could not see; and the four constants and `GOLDEN` all named as untouched.

**(k) Stop and report.** Under 250 words. **Do not start slice M4.**

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN`'s checksum `-2049717150`, as M1 pinned it.** None moves, none of the four files is in the commit, and **you read all four off the tree rather than off this line**, and a move in any is a stop and report.
- **The band ceiling and the palette's live-field list.** A colour that will not fit under the ceiling is a stop, never a ceiling you raise. **The exemption list is for colours that only ever draw when the field is not live**, and this row draws while the field is live at every viewport, and over the field itself on the two desktops, the portrait tablet and the narrow phone.
- **The announcing rule.** Count, shape or subtraction, never brightness (ADR 0054's reading of ADR 0014). **A filled mark and an empty one differ by area and by no step in value**, which is the rule slice K's own `QUIET_ALPHA` removal was made under.
- **The rim carries no ladder marks.** ADR 0054's own sentence: the rim is the health bar and the hit's second channel (ADR 0003, ADR 0040), and loading it with the ladder would occlude it at the one tick it changes.
- **The band and the mark M2 declared**, except by the measurement item (h) names, and then with the record's claim recorded as false rather than quietly corrected.
- **`RunState.roster` is what the row iterates and `WEAPON_LINES` is not.** A row driven by the build's four is a stop.
- **The dev corner stack stays** and is neither deleted nor gated. #66's.
- **The layering.** Nothing draws above `mobFire` inside the field stack, and the row is outside that stack rather than an exception to it.
- **The template's shared `Button` in `src/app/ui`**, which carries hardcoded pinks the palette scan does not reach and which is #38's.
- **No ADR is filed or amended, and no ADR gains a combat magnitude.**
- **Nothing under `src/game`, `src/dev` or `src/tape` is in this commit.**

### Seams under test

The HUD view itself: the marks as a pure function of a line's level, the roster driving the rows, the bank's draw-nothing-at-zero rule, and the content's measured extent against the declared band. `src/app/screens/game/runSession.ts`: `RunReadout`'s **three** new fields, the score, the levels and **the ladder's bled-rung memory**, the bank being the `bankedOffers` already there, and the roster arriving through `showIdentity`. **The levels reaching the view as a per-frame copy rather than as `run.levels` itself.** The cushion's mark beside the score, filled while the score rung is armed and empty while that memory is set, by area rather than by value, with the digits solid throughout. `src/app/screens/game/GameScreen.ts`: the driver owning the data and the diffing, and the row placed from `fitField`'s output. `src/app/screens/game/RunHud.ts`: the bank line gone and everything else held. `src/app/palette.ts`: every colour the row draws, under the ceiling and inside the live-field list.

### Module boundaries

**One file is created, the HUD's own concept module, named for the concept `CONTEXT.md` calls the HUD**, with its public interface reading in one place at the module's end. **It lives in `src/app/screens/game/`**, because `palette.test.ts`'s scan reads that directory as text and does not follow imports, so a module anywhere else draws outside the ceiling's only enforcement. Nothing is deleted, merged or split. **It is a sibling of the field container rather than a child** (R1), so it is wired in `GameScreen` where the corner stack and the two controls already are. `src/app` still reaches `src/game` for types and nothing reaches back, and **`layout.ts` stays the only module that knows about the viewport**. No new library enters.

### The planned test list

1. *The HUD draws one row per line in the run's roster, in roster order, and none for a line the roster does not name.*
2. *A rostered line at level zero draws its marks and none of them filled.*
3. *A filled mark and an empty one differ in grayscale by area and by no step in value.*
4. *Every colour the HUD draws sits at or below the field's ceiling while the field is live.* Through `palette.test.ts`'s existing scan; **confirm it green over anything you add rather than writing a second one.**
5. *The HUD's measured content fits inside the band `layout.ts` declares, at the narrowest shipped phone.*
6. *One mark measures at least 6.25 CSS pixels at the narrowest viewport in the sweep, and the empty mark's outline stroke and the gap between two marks clear their own floors there, 0.89 and 1.8 CSS pixels.* **All three are measured off the rendered pixels**, and the outline is what lets five marks read as fill length at all.
7. *The HUD's row is never mistaken for the field's boundary: the boundary's stroke and the HUD's marks are separable in grayscale at the narrowest phone.* **The predicate is two numbers, both measured at that viewport: the unpainted field between the row's lowest painted pixel and the boundary's stroke, at or above 0.5 CSS pixels, and the luma between the mark's fill and the stroke, at or above the palette's own 2.0-point separation.** `hudInk` at 67.23 against `fieldFrame` at 62.43 is 4.80 points, so the luma is the leg that carries this and the gap is thin by construction, the band's 2 units of padding being about 1.2 CSS pixels there. **Say which of the two is carrying the reading; if neither does, that is a finding for the note** rather than a band you widen.
8. *A power-up swallowed fills exactly one mark, on the line it levelled, on the tick it was swallowed.* **Asserted on the marks the view drew, never on the readout it was handed**, because `run.levels` is mutated in place and a test reading the readout would pass over a view that never drew anything.
9. *The score reads on the HUD and moves with the run's own score*, at six digits, with the digits' form unchanged whatever the cushion's state.
10. *The cushion's mark beside the score is filled while the score rung is armed, empty while the bled-rung memory is set, and filled again once the growth that clears it lands.*
11. *The bank reads on the HUD when carriers are waiting and draws nothing at all at zero.*
12. *The HUD is a dumb view: given the same readout it draws the same pixels, whatever the tick.*
13. *The rows are a function of the roster's length and each line's index in it, over rosters of one, two, three and four lines in any order.* **`WeaponLine` is a closed union, so a test naming a fifth line needs an `as` past the type system**; this is the extensibility constraint asserted without one, and it is the same promise. **Plus a pooled-reuse test**: a second `showIdentity` leaves exactly the second roster's rows and nothing of the first.
14. **The layering test**, green, with the row outside the field's stack. **M2's crossing pins become the clearance**: at the squeeze regime the pause button sits clear below the row, and at the other two regimes it has not moved.

**What this slice is expected to turn red.** `RunHud.test.ts` over the bank line, `GameScreen`'s tests over the new wiring, `layering.test.ts` over the crossing pins, and `palette.test.ts` if you add an entry. **There is no `runSession.test.ts`**, so nothing there turns red and a hunt for it is wasted time. **A realistic count is 8 to 14 files.** A diff larger than that is a reason to check what you reached into.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures.
3. **Agent.** The mark measured in CSS pixels at every viewport, against the 6.25 floor, **with the outline's stroke and the gap between marks measured at the narrowest one against their own floors of 0.89 and 1.8**.
4. **Agent.** The grayscale read of a partway ladder, measured off the pixels, with the two lumas and the two band widths.
5. **Agent.** The row against the boundary in grayscale, separable, stated.
6. **Agent.** A rendered check across two runs at two viewports, screenshots read.
7. **Agent.** The palette scan green with the lumas printed, and the four version constants and `GOLDEN` untouched.
8. **Human (Mark), and none of these blocks you.** Whether he can say what the row is telling him at a glance, on his phone and on his desktop, and whether it reads the same in the same glance on both. **That is the step's own done line and no test replaces it.**

### State of the branch

- The tip should be slice M2's docs commit.
- **At the tip they read `WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN`'s checksum `-2049717150`, and this slice moves none of them.** **Read all four off the tree yourself and say what you read**, because M1 is where every move in this step happens and a line here is not the tree.
- **You are permitted no `GOLDEN` re-pin and no version move of any kind.**
- The headless browser runs at 3 to 21 FPS under SwiftShader and puts consecutive screenshots 74 to 120 ticks apart, and **a driver cannot reliably reach a full build**, which is what slice K measured and wrote down. Read note section 13 before you spend runs chasing a state.

### The stuck rule

**Three things are already known to be a stop:** any version constant or `GOLDEN` moving; no honest mark existing under the band ceiling that separates from its empty state by area; and the row's content not fitting the declared band at the narrowest phone after the mark's measurement. **And three things are ruled rather than open:** the row's placement is R1's, the mark fills rather than brightens, and the row iterates the roster. **A measurement or a gate finding arguing against any of the three goes in the note and is built past.**

### What is not your job

- **The score's countdown and the mark going dark**, both M4's, the cushion's mark included. **The row draws the current state; the loss's animation is the next slice, and it animates the cushion's mark and a line's mark in the one vocabulary this slice gives both.**
- **The fallen rung**, M5's, though its body wears the icon your row teaches, which is why item (f) is decided here.
- **The field channel per line.** The record's section 7 sixth finding: step 5 builds the HUD channel whole and does not finish the field one, and making each line's rung countable in its own expression is a design job per line.
- **The dev corner stack's removal or gating**, #66's.
- **The shared widgets in `src/app/ui`** and the pause button's pink, #38's.
- **The belch's corner**, Mark's and ruled.
- **Anything under `src/game`, `src/dev` or `src/tape`.**
- **The record's section 7 findings.**

---

## Slice 5 (M4): the loss is watched (#99)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#99)`.

Slice M4 of The Hungry Grave: the sim sets the score to zero in one tick and takes a level off every line in the same one, so a player sees a number that has left rather than a number leaving, and a rung inside a dense storm goes without being seen at all. This slice makes the loss watchable on all three channels it already has.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M4.

**This slice is renderer only.** The three events already exist, no simulation rule changes, and it owes no `GOLDEN`, no witness move and no version move of any kind. **Nothing under `src/game` is in this commit.**

**Five rulings shape this slice and none of them is yours to revisit.**

**First: the score's bleed is watched, and it is a countdown rather than a snap** (record R5). The sim sets `state.score` to zero in one tick in `bleedScore` and **that does not move**. The renderer animates the readout down, which is renderer state born of a past tick and therefore a held transient, and `transients.ts` already has the registry for exactly that. **Nothing shipped subtracts from a running score on a hit and that is recorded as ours rather than pushed against** (ADR 0054); what does ship everywhere is a chain or a multiplier collapsing, and **all five of the cited games snap the number and drain a gauge**: DoDonPachi's counter snaps while its hit gauge drains, Resogun's multiplier snaps while its meter drains, Devil May Cry's style letter snaps while the style gauge drains, and Battle Garegga's and Ikaruga's chains reset instantly with nothing draining at all. **So the precedent backs the cushion's mark emptying, and the digit countdown is ours**, chosen for the same reason the bleed itself is: a number that is 41,300 on one frame and 0 on the next has been seen to have left rather than to leave.

**Second: the bleed's lifetime is declared in the registry and stays under `REPLAY_LEAD_IN_TICKS`** (record R5). The lead-in is honest exactly when it is at least as long as the longest lifetime in the registry, and a bleed longer than it moves that constant and the whole fast-forward with it. **The lead-in reads 90 at the tree and the record's declared starting figure is 40 ticks, two thirds of a second**, which sits well inside it and is long enough to be watched. **40 is a declared starting figure on the same terms the registry's other lifetimes are, not a measurement.**

**Third: the countdown starts from the `scoreBled` event and targets the live score, never a remembered zero** (record R5). Slice M1's rule keeps kills paying score while the grave is at the floor, so the sim's score is climbing again before the animation finishes: a countdown driving toward zero would land on a number the sim left behind and then jump, and one that runs from the bled amount toward whatever the run's score currently reads lands on the truth. **The curve is linear over the whole lifetime and that is ruled, not open**: counter guidance defaults to ease-out, which spends most of the value in the first few frames and leaves a tail, and that is the snap R5 rejected, stretched. **The midpoint tick reads about half the bled amount**, which is the assertion ease-out fails, and every gauge the games above drain, drains linearly. **The view never diffs the score to find out a bleed happened**, because a diff cannot tell a bleed from an overflow that happened to be negative. **The driver hands it the event.**

**Fourth: the loss announces on three channels and one of them is already built** (record R7). The mark empties, the line's field expression blows up, and the body departs. **The change is area and never brightness** (ADR 0014, record R2). ADR 0054 rules two and ADR 0055 adds the departure, and the three events are deliberately separate because at the size floor there is no shrink, so ADR 0040's rim channel is silent and these are the only second channel left. **Every line that paid announces, because `stripLevels` takes one off every line that has one to give: four marks emptying at once reads as the bigger event it is, and that is a consequence rather than a defect.**

**Fifth: a stripped line's top filled mark empties over the bleed's own lifetime, and the registry gains two lines rather than one** (record R5). A mark that snapped beside a readout that counts would be two vocabularies rather than one, so **the strip's emptying is a second held transient, born of `weaponStripped`, with the same 40-tick lifetime as the bleed's, declared beside the bleed's in the registry and owned by the driver exactly as the bleed's is.** **`INVULNERABLE_TICKS` is 24** (`src/game/tuning.ts`), under the 40, **so a second hit can strip while the cushion's own mark is still emptying**: both states can be live at once, the pure function takes both together, and the test list pins that overlap.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **rulings R5 and R7 in full**, then R8 for why a line's rung is carried by its own expression and not by its projectiles, **section 3.3's per-line table in full, which is the measured state of the field channel and is why this slice does not finish it**, section 4's M4 paragraph, section 5, section 6's test sentences and its paragraph on what a headless browser cannot photograph, and **section 7's sixth finding**.
4. `apps/hungry-grave/docs/research/portrait-hud-and-catchable-loss.md` section 8, the catchable-loss ground and the Sonic no-recollect beat, **and note that it is a beat rather than a timer**.
5. `apps/hungry-grave/docs/adr/0054-the-ladder-reads-twice-in-the-storm-and-on-the-hud.md` **as amended**, `0055-a-stripped-rung-falls-onto-the-field-as-a-body.md`, `0040-a-hit-announces-by-subtraction.md` and `0014-readability-layering.md`, plus `0044-territory-is-autonomous-controlling-ground.md` for why Territory's expression is ground rather than a shot.
6. `apps/hungry-grave/docs/push/round-two-progress.md` section 13's rendered check and its limits, and **the handoff's standing rule that a headless browser cannot photograph a short-lived state**.
7. `apps/hungry-grave/CONTEXT.md`, the entries **HUD, Rung, Score, Dive** and each weapon line's own entry. **Read the Avoid lists before naming anything.**
8. The tree: `src/app/screens/game/transients.ts` **whole**, including `HELD_TRANSIENT_TICKS`, `REPLAY_LEAD_IN_TICKS` and the covering test that holds them together; `src/app/screens/game/FieldRenderer.ts`'s and `StormRenderer.ts`'s own `TRANSIENT_TICKS` declarations, which are the precedent for declaring a lifetime; the HUD view slice M3 built, whole; `src/app/screens/game/GameScreen.ts`'s event handling; `src/game/events.ts`'s `scoreBled`, `weaponStripped` and `sealed` and the paragraph saying why they are three; `src/game/grave.ts`'s `bleedScore` and `stripLevels`, **to read and not to touch**; `src/game/lines/skullStream.ts`, `bell.ts`, `wisps.ts` and `territory.ts`'s level curves, to read; `src/app/palette.ts` and `src/app/__tests__/palette.test.ts`; `src/app/screens/ReplayScreen.ts`'s `syncScreen`, which hand-mirrors `GameScreen.announce`'s `belched` and `splashed` wiring; `src/app/__tests__/screenLifecycle.test.ts`, **which is the only harness that drives a screen's lifecycle and mocks Label and Button**; and `src/game/tuning.ts`'s `INVULNERABLE_TICKS`.

### The definition, in observable terms

After this slice: a hit at the size floor with score standing shows the score **falling** rather than gone, over a held transient shorter than the replay lead-in, easing toward whatever the run's score currently reads. A hit that takes levels empties a mark on every line that paid, and the lines whose expression can carry it blow that expression up on the field. **The bleed and the strip are watched in one vocabulary**: the cushion's mark beside the score empties as the digits count down, and a stripped line's mark empties over the same lifetime, because slice M3 gave both the same mark (record R2).

The bleed's lifetime and the strip's are both declared in the transient registry beside the others, the storm's blow-up lifetime is declared in `STORM_RENDERER_TRANSIENT_TICKS` where the covering test can see it, and that test holds the lead-in at or above every lifetime in it. A second run played on the same pooled screen opens with no memory of the first run's bleed or strip.

`WITNESS_VERSION`, `READINGS_VERSION`, `FORMAT_VERSION` and `GOLDEN` are all untouched and none of the four files is in the commit. **No sim rule moves**, `bleedScore` still zeroes the score in one tick, and `stripLevels` still strips in one.

What a player meets: after a hit at the floor they can name what it cost. **That is #99's whole problem and this is the slice that answers it.**

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m4`. **Slices M1, M2 and M3 must all be in the tree.**

**(b) The tests first, red.** **Write the registry test first**, that the bleed's declared lifetime is in `HELD_TRANSIENT_TICKS` and under `REPLAY_LEAD_IN_TICKS`, because it is the one that fails silently if the lifetime is declared anywhere else.

**(c) The countdown.** A held transient declared the way `FieldRenderer`'s and `StormRenderer`'s own lifetimes are declared, **40 ticks as a declared starting figure per R5**, driven from the `scoreBled` event handed in by the driver, **falling linearly** from the bled amount toward the live score. **A pure function of the event, the tick and the current score, testable with no renderer**, which is what slice K's tests stand on and what lets this be pinned by test rather than by a screenshot.

**(d) The mark emptying.** On every line that paid, off the `weaponStripped` event, **as a second held transient with the bleed's own 40-tick lifetime, declared beside it in the registry and owned by the driver** (the fifth ruling). It is not drawn from `levels`, because a mark read straight off `levels` would snap and the vocabulary would break. **Emptying is subtraction of area and never a step in value or in brightness** (ADR 0014), which is R2's rule holding at the moment of the loss too: the end state is the empty mark M3 already draws.

**(e) The field expression, for the lines that can carry it today.** ADR 0054 as amended says a line's rung is carried by that line's own expression on the field, **and section 3.3 measures which of the four can be read off the field at all**: the stream's columns exactly and continuously, the bell's cones only during a toll, the wisps' count nominally but not countably, Territory's radius never, because it is an area. **Build the loss announcement for the lines whose expression is on screen, say per line what you built and what you did not, and build nothing for a line whose expression cannot carry it.** **The blow-up's own lifetime is declared in `STORM_RENDERER_TRANSIENT_TICKS` beside `eruption`, `splash` and `territoryArrival`**, so the registry's covering test sees it and the lead-in rule holds over it. The record's section 7 sixth finding already says step 5 does not finish this channel, so **an unbuilt line is an expected outcome and a finding for the note, not a miss.**

**(f) The driver owns the events and the per-run memory, and the view owns the pixels.** The HUD stays a dumb view: it takes what it is handed and contains no change detection. **A view that inferred a bleed from a diff would be a second implementation of the rule** and would read an overflow as a bleed.

**The bleed's and the strip's state is per-run memory on a pooled screen, so `GameScreen.prepare()` clears it** beside the ending, the frame policy, the steering and the countdown it already clears: the born tick, the bled amount and the lines stripped. **Left uncleared, a second run opens mid-countdown**, and a test that only ever plays run one cannot see it, so this one is pinned by a second-run test rather than by the rendered check alone.

**`ReplayScreen.syncScreen` hand-mirrors `GameScreen.announce`'s `belched` and `splashed` wiring, so it gets the storm blow-up line in this same commit.** A blow-up wired only into `GameScreen` would simply not play on a replay, and the lead-in's whole promise is that a replay shows what the live run showed. **The replay has no HUD**, so the countdown and the mark are moot there and nothing is owed for them; say that in the note rather than leaving it read as an omission.

**(g) The measurements this slice owes.**

- **A rendered check, and it is the point of this slice.** The built app through `vite preview`, driven with `playwright-cli`, at a phone viewport and a desktop one, **with a hit taken at the size floor on screen**. **Read the screenshots and say what you actually saw.** **Play a run, end it, and play another.** **A headless browser cannot photograph a short-lived state**, which is the handoff's standing rule, so say plainly what the driver could and could not catch and **do not spend runs chasing a frame**: the countdown and the emptying are pinned by test and their feel is Mark's own read at sixty frames a second.
- **The registry printed**, every lifetime in `HELD_TRANSIENT_TICKS` with the bleed's, the strip's and any blow-up's beside them and `REPLAY_LEAD_IN_TICKS` above them all.
- **The per-line field channel stated**, which of the four you built and which you did not, each with the reason from section 3.3.
- **No tape, no batch and no determinism run is owed**, and that claim is checked rather than assumed. **If any of the four version constants or `GOLDEN` moves, that is a stop and report.**

**(h) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the score is watched leaving and every line that paid says so (#99)`.

**(i) The progress note**, section **10**. Beyond the contract's list, say: the countdown's linear shape, its declared lifetime and the registry's figures; the strip's mark emptying over that same lifetime as a second transient; the event-driven seam and why no diff is read; the emptying as subtraction of area; what `prepare()` now clears and how the second run proves it; the replay's mirrored blow-up line and that the replay has no HUD; the per-line field channel built and unbuilt with reasons; the rendered check and what it could and could not see; and the four constants and `GOLDEN` all named as untouched.

**(j) Stop and report.** Under 250 words. **Do not start slice M5.** **This slice's tip is a deploy the orchestrator takes**, because the whole step's done line is Mark's read and this is where the loss first reaches a screen.

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN` as M1 pinned it.** None moves, none of the four files is in the commit, and **you read all four off the tree rather than off this line**, and a move in any is a stop and report.
- **`REPLAY_LEAD_IN_TICKS` 90.** The bleed's lifetime stays under it. **A lifetime that wants to exceed it is a stop**, because moving the lead-in moves the whole fast-forward with it (#58).
- **`bleedScore` and `stripLevels`.** The sim still zeroes the score in one tick and still takes one level off every line that has one to give. **This slice animates a readout and changes no rule.**
- **The three events stay three** and none of them changes shape.
- **The announcing rule.** Count, shape or subtraction, never brightness, at the moment of the loss as much as before it.
- **The rim carries no ladder marks** and ADR 0040's rim channel stays the hit's own.
- **The band ceiling and the palette's live-field list.** A colour that will not fit is a stop, never a ceiling you raise.
- **The layering.** Nothing draws above `mobFire` inside the field stack.
- **Each line's own arithmetic**, its level curves, its reaches and its cadences. **A blown-up expression is a picture and never a rule.**
- **No ADR is filed or amended, and no ADR gains a combat magnitude.**
- **Nothing under `src/game`, `src/dev` or `src/tape` is in this commit.**

### Seams under test

`src/app/screens/game/transients.ts`: the bleed's and the strip's declared lifetimes inside the registry, under the lead-in. The HUD view: the countdown and the mark's emptying as one pure function of the events, the tick and the live score, taking a bleed and a strip live at once. `src/app/screens/game/GameScreen.ts`: the three events reaching the view from the driver, nothing inferred from a diff, and `prepare()` leaving a pooled screen with no memory of the previous run. `src/app/screens/ReplayScreen.ts`: the mirrored blow-up reaching the storm renderer on a replay. The storm renderers: the loss announcement for each line whose expression can carry it, its lifetime declared in `STORM_RENDERER_TRANSIENT_TICKS`.

**There is no `GameScreen` event-test file at HEAD.** The only harness that drives a screen's lifecycle is `src/app/__tests__/screenLifecycle.test.ts`, with Label and Button mocked. **So a seam test either names a new file for the driver's transient or moves to the view's pure function**, and the note says which you chose and why.

### Module boundaries

**Nothing is created, deleted, merged or split unless the loss's announcement is its own concept**, and if it is, it is one file named for that concept with its interface at the module's end. No import direction changes. The HUD stays a dumb view and `GameScreen` stays the driver. `src/app` still reaches `src/game` for types and nothing reaches back. No new library enters.

### The planned test list

1. *A hit at the size floor with score standing bleeds the score and takes no level, and the readout falls linearly: at the countdown's midpoint tick it reads about half the bled amount.* **The midpoint assertion is the point of this test**, because a test that only asks for a value between the old one and zero passes on ease-out too.
2. *The bleed's held lifetime and the strip's are both declared in the transient registry and both are shorter than the replay lead-in.*
3. *The countdown eases toward the live score rather than toward zero*, so a score climbing from kills while the grave is at the floor is landed on rather than jumped to.
4. *The view is told a bleed happened and never infers it*, asserted by handing the view a falling score with no event and getting no countdown.
5. *A hit at the floor with no score takes one level off every line that has one to give and empties exactly those marks.*
6. *An emptied mark is the empty mark, differing by area and by no step in value.* This is the test that guards the pixels and it stays.
7. *A line whose expression is on screen announces its loss on the field*, one test per line built, each named for its line, **and its blow-up's lifetime is in `STORM_RENDERER_TRANSIENT_TICKS`**.
8. *A strip that lands while the cushion's mark is still emptying is drawn with both live*, because `INVULNERABLE_TICKS` is 24 and the countdown is 40, so the second hit is legal before the first has finished being watched.
9. *A second run on the same pooled screen opens with no countdown and no emptying mark*, because `prepare()` clears the bleed's and the strip's state the way it clears the rest of the previous run.
10. *A replay plays the blow-up the live run played*, through `ReplayScreen.syncScreen`'s mirrored wiring.
11. *Every colour the loss draws sits at or below the field's ceiling while the field is live.* Through the existing scan.
12. **The transient registry's covering test**, green, with the lead-in at or above every lifetime.
13. **The layering test**, green.

**What this slice is expected to turn red.** The HUD view's own tests, `transients`' covering test over the two new entries, `screenLifecycle.test.ts` and whatever new file you name for the driver's transient, the storm renderers' tests for any line you built, `ReplayScreen.test.ts` over the mirrored line, and `palette.test.ts` if you add an entry. **A realistic count is 6 to 12 files.** A diff larger than that is a reason to check what you reached into.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures.
3. **Agent.** The registry printed with the bleed's lifetime and the lead-in.
4. **Agent.** A rendered check across two runs at two viewports with a floor hit on screen, screenshots read, and the driver's limits stated plainly.
5. **Agent.** The per-line field channel, built and unbuilt, each with its reason.
6. **Agent.** The four version constants and `GOLDEN` untouched, with none of the four files in the commit.
7. **Human (Mark), and none of these blocks you.** Whether the score is seen to leave rather than to have left, and whether four marks emptying at once reads as the bigger event it is. **The deploy that puts it in front of him is the orchestrator's, straight after your report.**

### State of the branch

- The tip should be slice M3's docs commit. **M3 lands before you start**, and it is editing `src/app/screens/game/`, `palette.ts` and its own progress note, so **re-read the HUD view and the palette off the tree rather than off M3's prompt.**
- **`WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN` -2049717150**, which is what they read at the branch tip this prompt was written against. **Read all four off the tree yourself and say what you read**, because M1 is where all three moves happen and a line here is not the tree. **M4 moves none of them.**
- **You are permitted no `GOLDEN` re-pin and no version move of any kind.**
- The headless browser runs at 3 to 21 FPS under SwiftShader and puts consecutive screenshots 74 to 120 ticks apart, so **a 40-tick transient is shorter than the gap between two of its frames**. Plan the check around that rather than against it.

### The stuck rule

**Three things are already known to be a stop:** any version constant or `GOLDEN` moving; a lifetime that wants to exceed `REPLAY_LEAD_IN_TICKS`; and a loss announcement that needs a sim rule to change. **And three things are ruled rather than open:** the countdown targets the live score, the bleed stays a renderer transient and the sim still zeroes in one tick, and the field channel is finished per line rather than here. **A measurement arguing the countdown reads too slow or too fast is a data row you annotate and a finding for the note, and Mark's own read is what settles it.**

### What is not your job

- **Making each line's rung countable in its own expression.** The record's section 7 sixth finding: a design job per line, beside each line.
- **The fallen rung and the fourth food kind**, M5's. **The body's departure is the third channel and it lands next slice; this one announces on the two that exist.**
- **The sim's ladder**, in every part.
- **The dev corner stack**, #66's, and **the shared widgets**, #38's.
- **Deploying.** The orchestrator deploys, straight after your report.
- **The record's section 7 findings.**

---

## Slice 6 (M5): the stripped rung falls and the dive catches it (#99)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#99)`.

Slice M5 of The Hungry Grave: a hit at the floor takes a level off every line that has one to give and the rungs simply cease to exist, so the loss has nothing the player can answer. This slice drops them onto the field as bodies that drift down with the world, so the player at the floor, under the fire that just took them, decides whether to dive after one and which one.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M5.

**Six rulings shape this slice and none of them is yours to revisit.**

**First: the bodies spawn at the grave, spread in roster order at `OFFER_SPACING`, drift at the scroll, and belong to the treasure class** (record R6). ADR 0055 rules the body and leaves where it lands, how fast it drifts and whether it decays as stage and tuning data; decision 24 rules one body per rung stripped and that a swallowed rung restores its own line. **What neither reckoned with is that `stripLevels` takes one level off every line that has one to give, all in the same tick**, so a single hit at the floor can strip four rungs and drop four bodies at once.

**Second: they spread rather than stack, and the spacing is the offer's own.** `OFFER_SPACING` is **90 field units** and was derived from the grave's own reach so that two adjacent bodies are both reachable only from inside 45 units of their midpoint, which puts a two-body catch outside a start-size grave entirely. **Reusing it makes the loss the mirror of the gain**: a gain is three bodies side by side and the grave gets the one it passes under, a loss is up to four and the grave gets back the one it dives for. **What the spacing buys is that one dive cannot catch all four.** At 90 units apart, a grave at the size floor sits over one body's midpoint at a time, so a four-rung strip is a choice of which line to save rather than a sweep that returns the lot. **The spacing is not the teeth**: the grave at the floor moves 270 units a second against a 38-unit scroll and a fallen rung never vanishes on its own, so **the teeth are the storm's fire the player is standing in and the scroll's deadline**, which is decision 20 verbatim. **M6's rungs recovered per strip is the reading that says what the spacing cost in play.** **#81 is open on bodies stacking on one spot and already names the rung body as a new caller**; it is not yours to close.

**Third: they drift at the scroll and nothing else, and they do not decay** (record R6). The scroll is already the corpse deadline and the power-up deadline both, and a second speed would be a second rule for a reader to hold. **`CONTEXT.md`'s Treasure entry makes never-decaying treasure's defining property**, and the `Corpse` record already carries a `decays` flag per body, so the fallen rung's row sets it false. **The test asserts the default and not an impossibility**, because ADR 0055 and decision 20 both leave decay as data and a later tuning pass may turn it on without a record to re-rule. **An untaken fallen rung stays on the field until the scroll takes it**, which is Battle Garegga's own answer: a dropped power item is an ordinary field item on the ordinary clock. **A decay clock would be a second deadline on top of a short one.** The grave starts at `FIELD_HEIGHT * 0.8`, 608 of 760, so a body dropped downfield of it has roughly three seconds of field left at 38 units a second, and less the lower the player was standing when the hit landed. **Sonic's 64-frame no-recollect window exists because its level imposes no deadline of its own**; here the scroll already is one.

**Fourth: they spawn offset from the grave rather than on it** (record R6). The design gate found a lone body spawning at the grave's own position and landing inside the swallow box, **which would hand the rung straight back on the tick it was lost and make the whole loss a flicker**. **The offset is downfield: on y, below the grave**, which is decision 20's own words, "how far down the rung body spawns". **An upfield offset is a stop**, because the scroll carries the body back into the swallow box within a tick or two and hands a lone rung to a player who only has to hold the lane, which is Salamander's shape and the one Mark rejected. The row clears the grave's half-extent plus the body's own at the size floor, **and it is a data row rather than a constant**, so the spread and the offset are the same rule read on two axes. **The group is centred on the grave's x and contained on x by shifting the whole group, so the gap between bodies never changes. There is no containment on y.** A strip taken with the grave at the bottom clamp therefore drops the bodies below the field and they are lost on the tick they fell. **That is not repaired here**: it is Defender's fall-too-far, the lever is the distance the player left themselves, and it is filed in the record's section 7 as Mark's edge rule, with M6 printing the grave's y at each strip so the batch says how often it happens. The transferable part of Sonic's 64-frame no-recollect window is that the loss registers before the chase is possible, **and here that is geometry rather than a clock**.

**Fifth: a fallen rung is a fourth kind on an existing pool rather than a new pool** (record section 3.4). `Corpse` already carries `kind`, `line`, `decays` and `halfExtent`, and `FoodKind` is `'corpse' | 'powerUp' | 'feast'`. **The fourth kind gets the swallow path, the scroll, the containment and the renderer for free**, which is the cheapest shape available.

**Sixth: each body wears the icon its HUD row taught** (record R6). A rung body has to be told from a corpse and from another line's rung. ADR 0014 makes the classes tellable by silhouette first and brightness second, so **the icon parts one rung from another and the treasure class's own shape parts a rung from a corpse**. **The rung wears its line's icon in the treasure shape, which is the same drawing the offer's body uses, and that is deliberate**: both are treasure, and teaching the player two treasure shapes to say the same thing is the cost we are not paying. **So the claim is corpse against rung and rung against rung, and nothing else. Telling a rung from an offer's body is #122's**, whose whole complaint is that the offer is not separable at a glance, **and it is named out of scope here.**

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **ruling R6 in full, which is the whole of this slice**, then R3 for roster order, section 3.4 for the pool, **section 4's M5 paragraph and its four notes a coder would otherwise find the hard way**, section 5 for the budget and the at-most permit, section 6's test sentences, and section 7's last finding.
4. `apps/hungry-grave/docs/research/portrait-hud-and-catchable-loss.md` **section 8 in full**: the negative result that no shmup drops power to be chased, Battle Garegga's lingering item, **Defender naming the risk variable**, Sonic's sourced numbers and the no-recollect beat, and Vampire Survivors' magnetised gems as the contrast case with no dive-back tension at all.
5. `apps/hungry-grave/docs/adr/0055-a-stripped-rung-falls-onto-the-field-as-a-body.md` in full, plus `0004` for freshness and the decay curve, `0034-a-power-up-is-an-offer-of-three-and-the-grave-swallows-one.md` for the offer's own spread, `0014-readability-layering.md` for silhouette first, and `0019` for the fold and the refusal rule.
6. `apps/hungry-grave/docs/push/decisions.md` entries **20 and 24**, the scroll deadline and one body per rung, **read as frozen**. **They are in `docs/push/decisions.md` and not in `docs/design/decision-log.md`**, which ends at entry 13.
7. `apps/hungry-grave/docs/push/round-two-progress.md` **section 15 in full**, which is J2's account of a corpse that gained folded state and what it cost, and **why a fold that does not widen the field list moves no version**.
8. `apps/hungry-grave/CONTEXT.md`, the entries **Fallen rung, Rung, Dive, Corpse, Treasure, Freshness** and **Offer**. **Read the Avoid lists before naming anything.**
9. The tree, whole where it is short and by function otherwise: `src/game/corpses.ts` whole, especially the `Corpse` interface's own JSDoc and every spawn path; `src/game/swallow.ts`'s `FoodKind`, `Swallowable` and the swallow path; `src/game/grave.ts`'s `stripLevels`, `strippableLines` and `runFloorLadder`; `src/game/offer.ts`'s `OFFER_SPACING` and its derivation comment and the spread it computes; `src/game/lines/roster.ts`'s `WEAPON_LINES`, `MAX_LEVEL` and `implementsLines`; `src/game/run.ts`'s `roster`; `src/game/witness.ts`'s `foldCorpses` and the `WITNESS_VERSION` JSDoc's own rule; `src/game/field.ts` and `tuning.ts`'s `SCROLL_SPEED`; `src/app/screens/game/FieldRenderer.ts`'s treasure predicate; `src/app/screens/game/foodSprite.ts`'s `drawPowerUpIcon`, `drawPowerUp` and `drawOptionlessBody`; `src/app/sound.ts`'s treasure chime and its `kind === 'powerUp'` test; `src/game/witness.ts`'s `FOOD_KIND_CODES` and its append-only JSDoc; `src/game/events.ts`'s `powerUpSpawned`, `weaponLeveled` and `weaponStripped`; `src/dev/replayTallies.ts`'s `levelUps`; `src/game/offer.ts`'s `bodyIdIn` and `src/dev/readings/powerUpLedger.ts`, both of which count offers and must go on counting only offers; `src/dev/digest.ts`'s `runScenario` and `GOLDEN`.

**Three notes the record read out of the tree for you, each of which would otherwise cost you a rebuild.**

1. **Two sites decide treasure by `kind === 'powerUp'`**: `FieldRenderer`'s treasure layer and `src/app/sound.ts`'s treasure chime. A fourth kind draws and sounds as a plain corpse at both until they change. **The ruling is that treasure becomes a property on the row rather than a kind test at each site**, so the fallen rung's row says treasure, neither site learns a new kind, and a fifth kind costs neither an edit.
2. **`stripLevels` walks `WEAPON_LINES` and not `state.roster`**, so the order the bodies spawn in would be the build's rather than the run's. **R3 and R6 both speak in roster order, so make the walk read the roster.** It changes no behaviour today, because `implementsLines` already keeps a roster inside the pool, **and it is the line a fifth weapon would break**.
3. **A corpse thrown or dropped past the bottom edge is lost the way any corpse is.** That is the existing rule doing its job and it is not a thing to repair.

### The definition, in observable terms

After this slice: a hit at the floor with no score takes one level off every line that has one to give and **drops exactly that many bodies**, standing apart at the offer's own spacing, in roster order, below the grave and clear of its own swallow box at the size floor, every one of them inside the field wherever the grave has room below it. They drift at the scroll alone, never decay, and are lost off the bottom edge the way any body is. Swallowing one restores the line it came from and no other, and a line at its cap is never restored past it. **A rung falling and a rung caught each announce on their own event.** **Nothing but the scroll moves a fallen rung**: it is not a storm target and no belch and no bell touches it. **A rung refused at `CORPSE_CAP` is lost and nothing banks it.** A fallen rung is told from a corpse by silhouette with colour removed, and one line's fallen rung is told from another's by the icon its HUD row taught; **it is not told from an offer's body, because it wears the same treasure shape on purpose**.

**`WITNESS_VERSION` does not move**, because the fallen rung rides the corpse pool on fields the fold already carries and `witness.ts`'s own rule is that the version moves when the field list moves. **`GOLDEN` is permitted at most one re-pin and the expected outcome is that it goes unused**, because the golden scenario never grinds the grave to the size floor and so can never strip a rung. `READINGS_VERSION` and `FORMAT_VERSION` do not move.

What a player meets: they try for a falling rung at least once, and they sometimes decide not to.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m5`. **Slices M1 through M4 must all be in the tree.**

**(b) The tests first, red.** **Write the spread test first**: a floor hit that strips four lines drops four bodies, standing apart at `OFFER_SPACING` in roster order, downfield of the grave, every one inside the field from an ordinary grave position. It is the test that fails if any of the four rulings above is missed.

**(c) The fourth kind.** A fourth `FoodKind` on the existing corpse pool, carrying the line it came from in the field `Corpse` already has, with `decays` false **as its row's default and not as an impossibility**. **A new pool is a stop**: the record rules the fourth kind and the reason is that the swallow path, the scroll, the containment and the renderer come free with it.

**(d) The drop.** One body per rung stripped, spawned where the loss happened, **spread at `OFFER_SPACING` in roster order**, **offset downfield of the grave on y by a data row that clears the grave's half-extent plus the body's own at the size floor**. **The group is centred on the grave's x and contained on x by shifting the whole group**, so the gap between bodies is always the spacing; **there is no containment on y**, and a strip at the bottom clamp drops bodies outside the field where they are lost on the tick they fell. **That last is the behaviour, not a bug to fix here**: it is filed in the record's section 7 as Mark's edge rule and M6 counts it. **Both the spacing's reuse and the offset's row are named in the note with what you set each against**; the offset's figure is yours to derive from the extents and to annotate as a first figure.

**(e) The restore, and the two events it needs.** A swallowed fallen rung restores the line it came from and no other, and **a line at its cap is never restored past it**. `MAX_LEVEL` is the cap and the levels record is what it binds. **Two new sim events, in `events.ts`'s own past-tense style and each carrying the line: `rungFell` when a strip drops a body, and `rungCaught` when the dive swallows one.** **Neither reuses an existing type.** `powerUpSpawned` is the offer's, and `weaponLeveled` is a rung bought, which `src/dev/replayTallies.ts`'s `levelUps` reads; a restore counted there would quietly change what that reading means. **M6's catch count reads `rungCaught` and has no other source.** **Check that the new spawn reaches neither `src/game/offer.ts`'s `bodyIdIn` nor `src/dev/readings/powerUpLedger.ts`**, both of which count offers and must go on counting only offers, and say what you found in the note.

**(f) The renderer and the chime.** **Treasure becomes a property on the row, carried per body, rather than a `kind === 'powerUp'` test at each site**, so `FieldRenderer`'s treasure layer and `src/app/sound.ts`'s treasure chime both read the row and a fallen rung draws and chimes as treasure with no special case at either. The body wears **the icon slice M3's row taught**, which is the vocabulary `drawPowerUpIcon` already holds. **Keep `foodSprite`'s own two properties: the aspects stay apart and each icon fills its box.** **The rung and the offer's body share the treasure shape on purpose**; the icon is what parts one line's rung from another's, and the shape is what parts a rung from a corpse.

**(g) The witness, which does change and does not move.** **`FOOD_KIND_CODES` is a total `Record<FoodKind, number>`, so a fourth kind does not typecheck until it has one: append 4.** Never reuse a retired code, which is the map's own append-only rule in its JSDoc. **A new code inside a field the fold already carries is not a new folded field**, so the field list holds and `WITNESS_VERSION` stays at 11; **say exactly that in the note with the rule quoted.** **This slice declares no new folded field**, because the fallen rung rides the corpse pool with a fourth kind and the `line` and `decays` fields the fold already carries. **If your shape needs a new folded field, stop and report before you write it**, because the step's whole witness budget was spent in M1 and a second move is a stop.

**(h) `GOLDEN`, and the permit that is expected to go unused.** Run `digest.test.ts`. **The expected outcome is green**, because `digest.ts`'s scripted run never grinds the grave to the size floor, so nothing in it can strip a rung. **A move there is a finding to explain before it is a re-pin**: show the cause, show every other field holding, and only then pin. **A re-pin you cannot explain is a stop and report.**

**(i) The measurements this slice owes.**

- **A rendered check, and it is the point of this slice.** The built app through `vite preview` driven with `playwright-cli`, at a phone viewport and a desktop one, **with a floor hit that strips more than one line on screen**, and the bodies visibly standing apart rather than stacked. **Read the screenshots.** **Play a run, end it, and play another.**
- **One question answered in words: can you tell a fallen rung from a corpse, and one line's rung from another's, with the colour removed?** ADR 0014 makes silhouette the first discriminator, so the answer should be yes; **if it is not, that is a readability finding for the note** and a measurement, not a redesign you take here. **Do not answer it for rung against offer**: they share the treasure shape on purpose and #122 owns that question.
- **Replay determinism at your tip with a fallen rung on the field at a checkpoint.** Two plays of one seed under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
- **A conditioned tape at the ladder rig with levels pinned**, measured to `outcome: 'verified'`, because a strip needs levels to take.
- **A batch at your tip** on the configurations and seeds M1 used, with the floor-hit split printed. **The bot walks to a body at the bottom of the field by its base policy (ADR 0053), so its take rate on fallen rungs is a reading rather than a bug**; print what you see and leave M6 to declare it.
- **The freshness question answered rather than assumed**: a fallen rung never decays, so **say what that means for the payout path and for any reading keyed by food kind**, because `tuning.freshness` is keyed by `FoodKind` and a fourth key arrives beside the existing three. **A new key beside unchanged ones does not move `READINGS_VERSION`** (`readingsVersion.ts`'s own rule), and if you find an existing reading whose meaning moves, **stop and report rather than moving the version**.

**(j) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): a stripped rung falls onto the field as a body the dive can catch (#99)`.

**(k) The progress note**, section **11**. Beyond the contract's list, say: the fourth kind and why it is not a new pool; the spread and the offset with what each is set against and which figures are first figures; the roster walk changed in `stripLevels` and that it changes no behaviour today; the restore and the cap; the two new events named, and `bodyIdIn` and `powerUpLedger` confirmed unreached; treasure moved onto the row and both sites reading it; the icon reused and the treasure shape shared with the offer on purpose; the silhouette answer in words, for corpse against rung only; the witness's new food code with the field list named as unmoved and the rule quoted; `GOLDEN` green or explained; the batch and the bot's take rate; and `FORMAT_VERSION` 4 and `READINGS_VERSION` named as held.

**(l) Stop and report.** Under 300 words. **Do not start slice M6.**

### What must not move, and a move is a stop

- **`FORMAT_VERSION` 4 and `READINGS_VERSION`.** Nothing here changes the wire, and a new key beside unchanged readings does not move the readings version.
- **`WITNESS_VERSION` stays at 11 and does not move.** The step's one move was M1's, 10 to 11. **A shape that needs a new folded field is a stop and report before it is written.**
- **`GOLDEN` is permitted at most one re-pin, and the expected outcome is that it goes unused.** A move is explained before it is pinned, and an unexplained one is a stop.
- **`OFFER_SPACING` 90 and the offer's own spread.** You reuse it; you do not retune it, and a measurement arguing it should move is a finding for the note.
- **The scroll is the one deadline.** No second speed, no early expiry, no decay on by default, and **nothing else removes a fallen rung**.
- **A fallen rung is not a storm target.** No belch, no bell and no shove moves it, and nothing in the storm reaches it.
- **A rung refused at `CORPSE_CAP` is lost.** There is no bank analogue and none is built; the cap refuses the way it refuses any body.
- **`FRESHNESS_SECONDS`, the decay curve, the payout floor and `CORPSE_CAP`.** A fourth kind rides the pool at the pool's own rules.
- **`stripLevels`' rule**, one level off every line that has one to give, in the same tick. **The walk's order changes to the roster and the rule does not.**
- **`MAX_LEVEL` 5 and the cap**, which a restore never crosses.
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty. **`src/game` stays dependency-free and pure.**
- **Every cap, every fault identity, `STREAM_SALTS` and `STREAM_ORDER`.** The fault list is closed and append-only (ADR 0024).
- **The layering** and the band ceiling, with nothing drawing above `mobFire` and no colour above the ceiling while the field is live.
- **You file no ADR and amend none.** ADR 0055 already rules the body; **applying a rule is not amending it.**
- **#81 stays open.** Nothing here closes it and the rung body is a new caller it already names.

### Seams under test

`src/game/corpses.ts`: the fourth kind on the existing pool, its row's `decays` default, and a body that drifts at the scroll alone. `src/game/grave.ts`: one body per rung stripped, spread at the offer's spacing in roster order, centred on the grave's x and shifted whole to stay inside it, offset downfield clear of the swallow box. `src/game/swallow.ts`: a fallen rung restoring its own line and never past the cap. `src/game/witness.ts`: the fold unchanged, asserted rather than assumed. `src/game/events.ts`: `rungFell` and `rungCaught`, each carrying its line, and neither one an existing type reused. `src/app/screens/game/FieldRenderer.ts`, `foodSprite.ts` and `src/app/sound.ts`: the treasure layer and the treasure chime both read off the row, and the body wearing its line's icon.

### Module boundaries

**Nothing is created, deleted, merged or split, and no import direction changes.** The fourth kind joins the module that owns the food kinds and the body joins the module that owns corpses, because a helper joins the file whose concept it serves. **`src/game` reaches nothing outward**, the cycle guard stays empty, and `src/dev` reads events and never writes the run. **Run the cycle guard and confirm it for yourself rather than taking this paragraph's word**, on round two's own history with exactly that claim. No new library enters.

### The planned test list

1. *A hit at the floor with no score takes one level off every line that has one to give, empties exactly those marks, and drops exactly that many bodies.*
2. *A stripped rung's bodies stand apart at the offer's own spacing, in roster order, centred on the grave's x, and the group shifts whole to stay inside the field so the gap between them never changes.*
3. *A fallen rung spawns below the grave and clear of its own swallow box at the size floor, so the body that was just lost is not handed back on the tick it fell.*
4. *A fallen rung drifts at the scroll alone, never decays, and is lost off the bottom edge the way any body is.*
5. *A fallen rung's row sets decay off by default, and flipping `decays` on the spawned slot makes it decay*, so non-decay is the default rather than an impossibility. **Flip the flag on the slot the way `corpses.test.ts` already does with freshness; do not add a parameter no caller uses.**
6. *A fallen rung nobody takes stays on the field until the scroll carries it off, and nothing else removes it.*
7. *A fallen rung is not a storm target: no belch, no bell and no shove moves it.*
8. *A fallen rung refused at `CORPSE_CAP` is lost, and nothing banks it for later.*
9. *Swallowing a fallen rung restores the line it came from and no other, and a line at its cap is never restored past it.*
10. *A rung falling and a rung caught each announce on their own event*, neither of them `powerUpSpawned` nor `weaponLeveled`, **and `replayTallies`' `levelUps` does not count a restore.**
11. *A fallen rung is told from a corpse by silhouette with colour removed, and one line's fallen rung is told from another's by the icon its HUD row taught.* **Rung against offer is not claimed: they share the treasure shape on purpose and #122 owns it.**
12. *The bodies spawn in the run's roster order and not the build's*, which is the line a fifth weapon would break.
13. *A strip with the grave at the bottom clamp drops bodies below the field and they are lost on the tick they fell*, which is the edge rule filed for Mark rather than repaired here.
14. *A replay with a fallen rung on the field at a checkpoint rebuilds identically.*
15. *The witness's field list does not move* even though `FOOD_KIND_CODES` gains a code, asserted, because this slice is permitted no version move.
16. **The fences**, green, each by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
17. **The golden digest**, green and unmoved, or moved with its one cause proved.

**What this slice is expected to turn red.** `corpses.test.ts`, `swallow.test.ts` and `grave.test.ts` throughout, `offer.test.ts` wherever the spacing is asserted, `witness.test.ts`, `FieldRenderer`'s and `foodSprite`'s tests, `caps.test.ts` and `invariants.test.ts` over a fourth kind in the pool, `sound.test.ts` and `replayTallies`' own tests over the two new events, `measure.test.ts`'s rich fixture, and `harnessPolicy.test.ts`'s measured per-seed baselines, **re-measured with the reason beside each and never re-pinned blind**. **A realistic count is 16 to 24 files.** A diff much smaller than that is a reason to check what you have not reached.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures.
3. **Agent.** Replay determinism with a fallen rung on the field at a checkpoint.
4. **Agent.** A conditioned tape at the ladder rig measured to `outcome: 'verified'`.
5. **Agent.** A batch with the floor-hit split and the bot's take rate on fallen rungs printed.
6. **Agent.** A rendered check across two runs at two viewports with a multi-line strip on screen, screenshots read, and the silhouette question answered in words.
7. **Agent.** The witness named as unmoved with the rule quoted, `GOLDEN` green or explained, and `FORMAT_VERSION` and `READINGS_VERSION` held.
8. **Human (Mark), and none of these blocks you.** Whether he chases one, whether he ever decides not to, and whether having to pick one rung out of four lands as a choice rather than as a rung he happened to be near. **This and M4 are what the whole step's done line rests on.**

### State of the branch

- The tip should be slice M4's docs commit. **M4 lands before you**, and the branch may have been deployed between M4 and you, which is the orchestrator's and not a change to your tip.
- **Read at HEAD as this prompt was written: `WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4, and `GOLDEN`'s checksum -2049717150.** **M4 lands ahead of you and none of its work moves any of them, but read all four off the tree yourself and say what you read**, because a line here is not the tree.
- **You are permitted at most one `GOLDEN` re-pin and the expected outcome is that it goes unused**: the golden scenario ends at size 24.10125 against a floor of 18, so it never reaches the floor and nothing in it can strip a rung. M6 is permitted none.
- The headless browser runs at 3 to 21 FPS under SwiftShader and puts consecutive screenshots 74 to 120 ticks apart. That is the harness and not the build.

### The stuck rule

**Four things are already known to be a stop:** a shape that needs a new folded field; a `GOLDEN` move you cannot explain; a fence, a cap or a fault identity moving; and a new corpse pool. **And four things are ruled rather than open:** the spacing is the offer's own, the drift is the scroll alone, non-decay is the row's default rather than an impossibility, and the body wears its line's icon. **A measurement arguing any of the four should move is a finding for the note and a tuning-step input, never a row you move here.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **#81**, bodies stacking on one spot, which already names the rung body as a new caller and is not closed here.
- **#122**, the offer reading as a bubble, which is Mark's round-two ticket. **Telling a fallen rung from an offer's body belongs to it**, and the sixth ruling names that out of scope here.
- **The bottom-clamp edge rule**, a strip low enough to drop its bodies off the field. It is filed in the record's section 7 for Mark and M6 counts it; you neither repair it nor argue it.
- **Cave Story's MAX buffer**, ruled out of V1 and filed in the record's section 7.
- **Declaring a reading**, M6's. You measure and print; you declare nothing.
- **Retuning freshness, the corpse cap or the decay curve** because a fourth kind arrived. That is a measurement and a finding.
- **The field channel per line**, the record's section 7 sixth finding.
- **The dev corner stack**, #66's, and **the shared widgets**, #38's.
- **The record's section 7 findings**, none of which any slice acts on.

---

## Slice 7 (M1-fix): the bleed is capped (#99)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#99)`.

Slice M1-fix of The Hungry Grave: slice M1 made a kill pay score, and ADR 0003's floor ladder spends the whole of the score before it spends a level, so one hit at the size floor takes every point a run has made. M1's own batch measures it: the ladder took **11,900 to 54,201** from twelve runs that ended holding **0 to 22,611**, so the bleed is not a tax on a run, it is the run. Mark ruled the repair on 2026-09-16 and this slice builds it.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M1-fix.

**It is M1's repair rather than a slice of its own, so its progress-note entry rides inside section 7** as a `### M1-fix: the bleed is capped (#99)` subsection with your commit hash, which is exactly what M5-fix did inside section 11 and is why the prompts file's second override fixes the section numbers at all. **You open no new section.**

**Mark's ruling, in his own words, and it is the whole of this slice.** He was told that under ADR 0003 the score bleeds before the level, that with kills now paying score one late floor hit takes every point in the run, boss damage included, and that a friends' high score (#135) would therefore be decided first by whether a late hit landed rather than by how the run was played. He chose to cap the bleed over parking it and over leaving it. **His words: "Cap the bleed."**

**Seven rulings shape this slice and none of them is yours to revisit.**

**First: ADR 0003's order stands whole and only the amount changes** (record R4's closing amendment, Mark 2026-09-16). The ladder still spends the score rung first, then one level off every line that has one to give, then seals. **A floor hit bleeds a capped slice of the standing score and the remainder stays.** Every event the ladder fires stays the same event on the same tick for every run: `scoreBled` fires once per armed rung, `weaponStripped` and `sealed` are untouched, and the ladder is still finite because the rung is spent once per arming whatever it paid. **A run's event sequence is expected identical before and after your change on M1's seeds**, and a batch is how you prove it. **Expected rather than identical by construction**: `runFloorLadder` arms the bleed on `state.score > 0`, and the cap leaves a remainder standing where a whole bleed left zero, so a run that bleeds, re-arms the rung on a full hit's worth of growth off boss feasts alone, which pay no score until M7, and then falls again, stripped before and bleeds now. **A moved count is traced to that branch first, and if that is the cause it is a finding for the note rather than a stop.**

**Second: M1's bled-rung memory still sets on the hit exactly as it does now** (record R4). `runFloorLadder` sets `grave.scoreRungBled` on any ladder run, the bleeding one and the stripping one alike, and `growGrave` clears it at `SCORE_RUNG_REARM_SIZE`. **The cap changes what a bleed costs and never what a bleed is**, so the second floor hit while small still strips and the third still strips.

**Third: the cap is the lesser of the standing score and a flat amount, and the flat amount is a data row beside `TRASH_KILL_SCORE`'s own home in `tuning.ts`.** **The shape is ruled from the research and is not yours to reopen** ([`../research/score-loss-on-a-hit-precedent.md`](../research/score-loss-on-a-hit-precedent.md), written for this slice). Nothing shipped takes a fraction of a banked score at all; every genuine arcade score subtraction is a flat amount and two of the three floor at zero; the lesser-of-a-flat-and-what-you-hold rule ships in Mario Kart's three coins and Shadow the Hedgehog's ten rings; and where a bound rides on a fraction it is always the lesser of the two and never the larger. **The game's own reason is the stronger one**: the score rung is spent once per arming whatever it paid, including on a hit that finds no score, so a rung whose cost in rungs is constant and whose cost in points is not would be two rules wearing one name.

**Fourth: the value inside the band is yours, and the band is 10 to 40 trash kills.** That is **1,000 to 4,000 points** at today's `TRASH_KILL_SCORE` of 100 and **4 to 16 seconds of mowing** at the storm's measured 2.47 kills a second. **Both ends are argued in the research's section 5 and neither is yours to cross**: below 10 the rung reads as free, which is Great Mahou Daisakusen's own named failure, and above 40 a run that bleeds twice loses two thirds of the leanest measured run's whole gross and the ladder is again the first thing that decides a list. **State it as a multiple of `TRASH_KILL_SCORE`**, exactly as every mob row's `scorePayout` is stated and as `TRASH_CORPSE_PAYOUT`'s own comment demands of food, **annotate it as a first figure**, and say in the note what you set it against. **A number typed into a test is a stop; a row the test reads is the rule.**

**Fifth: `scoreBled` carries the amount actually bled, and `tuning.damageTaken.scoreBled` does not change meaning.** The event's `amount` is what was taken, which is what it means today and what the reading sums. **So `READINGS_VERSION` holds at 8** and `readingsVersion.ts` is not in your commit: its own version-8 paragraph already writes the rule out, that "a key that merely reads a different number never moves this", and this is that case exactly. `run.score` keeps the meaning version 8 gave it, kills plus overflow, because the cap changes what the ladder takes and never what the score is made of. **Say that in the note with the rule quoted**, the way M6's prompt requires of its own held version, and **if you find a reading whose meaning genuinely moved, that is a stop and report and never a bump you take.**

**Sixth: the M4 countdown's start is this slice's to fix, and its shape does not move.** `scoreCountingDown` (`src/app/screens/game/watchedLoss.ts`) runs linearly from `bleed.amount` toward the live score. Today `bleed.amount` is the whole pre-hit score, so the digits fall; **under a cap it is a slice, and the same expression would make the digits jump down to the slice and then climb back to the remainder**, which is the opposite of R5's promise that the score is seen to leave. **The countdown starts from the score as it stood before the hit and falls to the remainder.** The lifetime stays 40 ticks, the curve stays linear, the midpoint still reads about halfway, and the view is still told rather than inferring. **This claim is written out because the dispatch that ordered this slice said the countdown was unchanged**, which is true of its shape and false of its start; the tree was read and the start is what moved.

**Seventh: ADR 0003 is amended in place, in the docs commit, and it carries ADR 0058's overrule line because it is one Mark ruled.** The number, the title and the filename do not move. The decision did not change; the amount did.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **R4 in full and its closing amendment above all, which is the whole of this slice**, then R5 in full for the countdown, section 4's M1-fix paragraph, section 5's budget, section 6's test sentences, and **section 7's "a hit costs points" finding as it now reads, which is Mark's own ruling written out and is not yours to soften.**
4. `apps/hungry-grave/docs/research/score-loss-on-a-hit-precedent.md` **whole**, which is this slice's own research: section 3 for why the shape is a lesser-of, section 5 for the band and what each end is argued from, and section 6 for what was searched and not found.
5. `apps/hungry-grave/docs/adr/0003-size-is-health.md` **whole**, which you are amending, and `0058-each-on-swallow-line-pays-in-its-own-currency-at-its-own-cadence.md`, **its opening amendment sentence only**, which is the wording your overrule line copies. Then `0002-corpses-are-fuel-and-carriers-meter-power.md` **as step 5.0 amended it**, which is the nearest model for how a Mark-ruled ADR gains a supersession paragraph in this project's voice, and `0054-the-ladder-reads-twice-in-the-storm-and-on-the-hud.md`'s paragraph beginning "One thing is recorded as new ground", **which stays true and is not edited.**
6. `apps/hungry-grave/docs/push/step-5-progress.md` **section 7 whole**, which is M1's own note and is where yours goes, and **section 11's M5-fix subsection**, which is the form a repair's entry takes and is the nearer precedent to yours than any full slice's.
7. `apps/hungry-grave/CONTEXT.md`, the entries **Score**, **Size floor**, **Rung** and **Dive**. **Read three of its existing dated amendment paragraphs before you write one**, because the voice is the file's and not yours.
8. The tree, whole where it is short and by function otherwise: `src/game/grave.ts` **whole**, and `bleedScore`, `runFloorLadder` and `hitGrave` above all; `src/game/tuning.ts`'s `TRASH_KILL_SCORE` and `TRASH_CORPSE_PAYOUT` with their comments; `src/game/events.ts`'s `ScoreBled` and `Overflowed`, **which already carries `{ amount, score }` and is the in-repo precedent for a payment event naming the total it left behind**; `src/game/invariants.ts`'s `checkScoreRung` and `checkRunNoNaN`; `src/game/director.ts`'s `SIGNAL_WEIGHTS`, **to confirm the pressure signal weights the event and never its amount**; `src/dev/readings/damageTaken.ts` whole; `src/dev/readingsVersion.ts` **whole, read and not edited**; `src/dev/digest.ts`'s `GOLDEN` and `runScenario`; `src/app/screens/game/watchedLoss.ts` **whole**, and `scoreCountingDown` and `watchLoss` above all; `src/app/screens/game/GameScreen.ts` where `watchLoss` is called.
9. The tests that assert the whole bleed: `src/game/__tests__/grave.test.ts`, `src/__tests__/endings.test.ts`'s ladder-in-a-fight test with its `leftByTheBleed` capture, `src/app/screens/game/__tests__/watchedLoss.test.ts` and `LadderHud.test.ts`, and `src/dev/__tests__/bot.test.ts`'s `BLEEDS_SCORE`.

**Four files are uncommitted in the shared worktree when you start and they are not another agent's in-flight edits.** `docs/design/show-what-you-have.md`, `docs/push/step-5-slice-prompts.md` and the new `docs/research/score-loss-on-a-hit-precedent.md` are the orchestrator's, made for this slice, and the research file is untracked. **Add the record and the research file to your docs commit by path; the prompts file is the orchestrator's and never yours.** **Do not edit the design record or the research file**, not for a typo and not for a stale line: a record edited by the slice dispatched against it stops being the thing the dispatch was written from. Anything you believe is wrong in either goes in the note. **Anything uncommitted under `src/` is a different matter and is a stop and report.**

### The definition, in observable terms

After this slice: a hit at the size floor with a large score standing takes a bounded slice of it and the rest stays, so the run keeps most of what it earned and goes on earning. A hit with a score smaller than the cap takes all of it, which is what happens today and is the only case that does not change. The rung is still spent either way, so the next floor hit while the grave is still at the floor still strips a level off every line, and growth of a full hit's worth off the floor still gives the rung back.

**On the screen, the digits still fall and never climb.** The readout starts at the score as it stood before the hit, falls linearly over 40 ticks to what the bleed left, and eases toward the live score as kills go on paying, which is R5's promise holding under the new amount rather than a new behaviour. **The fall is smaller than it was, and on a late score much smaller**: a 2,000 cap off a standing 22,000 moves about fifty points a tick over the 40, so the leading digits barely move and only the trailing three churn. That is the ruling's own consequence and not a defect to design around inside this slice; **verification step 8 is where it is seen and item (k) is where the lever left unbuilt is recorded.**

**Nothing else in the simulation moves.** The event sequence a seed produces is identical, the director's pressure signal is identical because `SIGNAL_WEIGHTS` weights `scoreBled` by event and never by amount, `stripLevels` is untouched, and the ladder is still finite.

`WITNESS_VERSION` reads **11**, `READINGS_VERSION` reads **8**, `FORMAT_VERSION` reads **4**, `GOLDEN` holds at the checksum M1 pinned, and `pnpm verify` is green.

What a player meets: the floor still has teeth, and a run is no longer decided by one hit near the end of it.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m1fix`. **Slices M1 through M5 and M5-fix must all be in the tree.** **Three docs files and one untracked research file will be dirty and that is expected**, per the paragraph above; anything dirty under `src/` is a stop.

**(b) The tests first, red.** **Write the two ladder tests first**, the hit above the cap and the hit below it, both expressed against the row rather than against a number typed in the test.

**(c) The cap row, and this is the one number you pick.** In `tuning.ts` beside `TRASH_KILL_SCORE`, stated as a multiple of it, inside the band 10 to 40 trash kills. **Its JSDoc says what it is, that it is a first figure, what it was set against, and that M6's readings are what it gets tuned against**, in the voice `TRASH_KILL_SCORE`'s own comment already uses. **The JSDoc also names M7 as the slice that moves what the row was set against**: the band's upper end is argued against a run's gross, and M7's boss damage, source bonus and rich swallow all pay into that gross, **so the row is re-read after M7's batch and not against M6's alone.** **Set the value against the early window as well as against the re-earn time the band is stated in**: until a run's score first crosses the cap the cap does not exist for the player at all and the first floor hit still takes everything, so the pick is anchored to what a player meets early rather than to the band's midpoint, and item (i)'s batch prints the tick each run crossed it. Say in the note what you chose and why that point in the band rather than either end.

**(d) `bleedScore` keeps the remainder.** It takes the lesser of the standing score and the cap, subtracts it, and fires `scoreBled` carrying what it actually took. **The remainder can never be negative by construction rather than by a check**, because the lesser-of makes it impossible, and that is why **no new invariant is added**: a check for a state the arithmetic cannot produce would be noise under the deletion test, and the test that pins the lesser-of is what guards it. Say that decision in the note rather than leaving the absence unexplained.

**(e) The comments that go false, each found by content and each rewritten.** `bleedScore`'s own "The whole score, gone. The score tier is exactly one rung, so it never partly bleeds" is now exactly wrong in its second half. `runFloorLadder`'s JSDoc says "it bleeds all of the score". `ScoreBled`'s comment in `events.ts` says "the whole score, gone". `endings.test.ts` carries "Score first, and the whole of it: the score tier is one rung and never partly bleeds" as a ruling inside a test, which is where a ruling belongs and is why it has to move with the ruling. **Grep for the claim rather than trusting this list, and say in the note what you found beyond it.**

**(f) The countdown's start, in `watchedLoss.ts`.** It runs from the score as it stood before the hit. **The recommended seam is to widen `ScoreBled` with what is left standing, exactly as `Overflowed` already carries `{ amount, score }`**, so the view's start is the event's own arithmetic and the driver still hands it the event rather than diffing anything. **Widening the event costs no version and the reason is in `readingsVersion.ts`'s own version-8 paragraph**: "no sim event is ever encoded into a tape at all", the event is in no wire code map, and `damageTaken` reads only `.amount`. **M4's prompt says the three events stay three and none changes shape; that sentence is M4's and this slice supersedes its second half for this one case**, the way M5-fix superseded M5's upfield stop, and the note says so with what stood and what changed. **A required field widens every literal of the event**, so `scoreBled` fixtures well outside the countdown fail typecheck: `src/app/__tests__/sound.test.ts:78`, `src/game/__tests__/director.test.ts:67` and `src/game/__tests__/signalLock.test.ts:24` beside `watchedLoss.test.ts` and `LadderHud.test.ts`. **Repairing those fixtures is part of this slice rather than a reach**, and the must-not-move list below says so. **If you find a seam that is cleaner and keeps the event's shape, take it and say why**, but a view that infers the start from a score diff is a stop: a diff cannot tell a bleed from an overflow that happened to be negative.

**(g) ADR 0003, amended in place.** The filename does not move, because the title does not. **Find the floor-ladder sentence by content, not by line**, the one reading "hits bleed score first, then weapon levels down to the birthright loadout", and carry the cap in it. Then a new dated paragraph with the what-stood, what-changed, what-it-could-not-have-known triple: what stood is the ladder's order, the floor never being immortality and death never being abrupt; what changed is the amount, a capped slice rather than the whole; what it could not have known is that nothing paid score for a kill when it was written, so a run that never reached the size ceiling carried a score of zero and a whole bleed had nothing to take. **Quote Mark's own words, "Cap the bleed", inside it** rather than paraphrasing them, and **end the paragraph with ADR 0058's own overrule sentence**, because this is a Mark-ruled ADR amended by a slice of ours under one-push mode.

**(h) `CONTEXT.md`'s Score entry.** It reads "a hit at the size floor bleeding the whole of it before any weapon level goes", which is the clause that goes false. Amend the entry and follow it with the file's own dated amendment paragraph in the file's voice. **The Size floor entry is checked and left alone unless it has gone false**, because it names the order and not the amount, and either way you say in the note what you decided and why.

**(i) The measurements this slice owes.**

- **A batch on the same seeds and configurations M1 measured**, 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig, **printed as score bled against score earned, before and after**. M1's own figures are the before and they are in its note: `scoreBled` 11,900 to 54,201 against `run.score` 0 to 22,611. **Say plainly what share of a run the ladder now takes** and how many runs still end holding nothing. **Print per run the tick at which its score first crossed the cap**, because until it does the cap does not exist for the player and the first floor hit still takes everything; that early window is what item (c)'s value is set against.
- **The bot's bias named with its direction**, the way M6's prompt already names it for the take rate. **The bot is not a player**: it only dodges and never dives, so it re-arms the rung rarely. A diving hand re-arms more often, so it bleeds more times and strips fewer, **and the batch's share of a run the ladder takes is therefore a floor for bleeds and a ceiling for strips**. Say which way the figures are off rather than letting them stand as a player's. **It is never a reason to skip Mark's own play.**
- **The event sequence measured and not assumed, and expected identical on M1's seeds.** Same seeds, same counts of `scoreBled`, `weaponStripped` and `sealed` per run, and the same floor-hit split M1's own table carries. **Expected rather than identical by construction**, per the first ruling: `runFloorLadder` arms the bleed on `state.score > 0` and now reads a remainder where it used to read zero. **A count that moved is traced to that branch first**, and if that is the cause it is a finding for the note rather than a stop.
- **Replay determinism at your tip.** One seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
- **A tape recorded before your commit, replayed after it.** **It diverges at a checkpoint rather than being refused, and that is the expected outcome and not a fault**: `run.score` is folded into the witness, the cap changes what it holds after a bleed, and no folded field was added, so `witness.ts`'s own rule keeps the version still. **Say it in the note plainly rather than reaching for a version bump**, which is the shape M5 already had for a sim rule change.
- **A conditioned tape at the ladder rig with levels pinned**, measured to `outcome: 'verified'`, because the ladder is loudest with a full build.

**(j) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `fix(hungry-grave): a floor hit bleeds a capped slice of the score and the remainder stays (#99)`. Then the docs commit, carrying ADR 0003, `CONTEXT.md`, the design record, the research file and the progress note.

**(k) The progress note**, section **7**, as a new `### M1-fix` subsection at its end. Beyond the contract's list, say: the cap you chose, where in the band it sits and what you set it against; the lesser-of written out and the invariant deliberately not added with the reason; every comment that went false and what it says now; the countdown's start, the seam you took for it and M4's superseded sentence with its triple; ADR 0003's triple in one sentence with the overrule line quoted; `CONTEXT.md`'s before and after in one line each and the Size floor decision; the batch's before-and-after table and the share of a run the ladder now takes; the event sequence as measured, with anything that moved traced to the branch it moved in; the pre-cap tape diverging rather than being refused and why that is right; `READINGS_VERSION` held at 8 with the rule quoted; the bot's bias with the direction it is off in; **the announcement's own lever, left unbuilt and named**, which is a delta readout beside the digits or the skull stream's blow-up firing on a bleed as it already does on a strip, because Sonic Mania sizes the ring-loss announcement independently of what was lost and under the cap the falling digits carry less than they did; and the four constants and `GOLDEN` all named as read off your own tip.

**(l) Stop and report.** Under 250 words. **Do not start slice M6.** **This slice's tip is a deploy the orchestrator takes**, because the cap is a feel Mark has never had and his own play is what settles the value.

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN` as M1 pinned it.** None moves, **`readingsVersion.ts`, `witness.ts`'s version, `wireCodes.ts` and `digest.ts`'s pin are not in either commit**, and you read all four off the tree rather than off this line.
- **ADR 0003's ladder order.** Score before levels, levels before the seal, the floor never immortality. **You are changing an amount, not a ruling**, and an amendment that changes what the ADR decides is a stop and report.
- **The bled-rung memory, both its sites and its threshold.** `runFloorLadder` sets it on any ladder run, `growGrave` clears it at `SIZE_FLOOR + HIT_SHRINK`, and `swallow.ts` is not opened. **The threshold is Mark's own lever and section 7 carries it**; it is not yours to move while you are next to it.
- **`stripLevels`' own rule** and the roster walk M5 gave it, **`hitGrave`'s invulnerability window**, and `strippableLines`.
- **`state.score`'s other writer.** `swallow.ts`'s overflow keeps its exact meaning and `mobs.ts`'s `damageMob` keeps paying `row.scorePayout` on the kill.
- **The three ladder events stay three.** `ScoreBled` may gain a field for the countdown's sake, per item (f); **`weaponStripped` and `sealed` do not change at all**, and no event is added, removed or merged.
- **Every existing invariant's meaning and severity, the fault identity list, every cap, `STREAM_SALTS` and `STREAM_ORDER`.**
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty.
- **R5's countdown shape.** 40 ticks, linear, midpoint at about half, targeting the live score, told by the event and never inferred from a diff. **Only its start moves.**
- **No test is deleted, skipped, weakened or rewritten to reach green.** A test asserting the whole bleed is re-expressed against the new rule with its ruling comment rewritten, which is not the same thing as deleting it. A measured baseline that moves is re-measured with its comment saying what moved and why.
- **Nothing under `src/dev` or `src/tape` is in this commit**, which widening `ScoreBled` does not disturb because nothing under either constructs a `scoreBled` literal, **and nothing under `src/app` beyond the countdown's start, whatever its own tests need, and any test fixture that constructs a `scoreBled` literal**, which `src/app/__tests__/sound.test.ts` does.

### Seams under test

`src/game/grave.ts`: the floor ladder taking the lesser of the standing score and the cap, the remainder staying, the rung still spent on any ladder run, and the second hit still stripping. `src/game/tuning.ts`: the cap as a row stated in trash kills. `src/game/events.ts`: `scoreBled` carrying the amount actually bled, and whatever the countdown's start needs beside it. `src/app/screens/game/watchedLoss.ts`: the digits falling from the pre-hit score to the remainder, linearly, over the declared lifetime, with the view told rather than inferring.

### Module boundaries

**Nothing is created, deleted, merged or split, and no import direction changes.** `src/game` stays dependency-free and pure, the core's cycle guard keeps `KNOWN_CORE_CYCLES` empty, and `src/dev` is not opened at all. **The cap lives in `tuning.ts` because that is where the score's unit already lives** and a helper joins the file whose concept it serves; it is not a constant inside `grave.ts`, for the same reason `TRASH_KILL_SCORE` is not one inside `mobs.ts`. The HUD stays a dumb view and `GameScreen` stays the driver. No new library enters.

### The planned test list

1. *A floor hit with more score standing than the cap bleeds the cap and the rest stays.*
2. *A floor hit with less score standing than the cap bleeds all of it*, which is the only case that does not change.
3. *A floor hit that bleeds a capped slice still spends the rung*: the next floor hit while the grave is still at the floor strips a level rather than bleeding again, whatever score is standing.
4. *A third floor hit while still at the floor strips again*, unchanged, because the memory is not a one-shot.
5. *Growth of a full hit's worth off the floor still re-arms the rung*, and the hit after it bleeds a capped slice rather than stripping.
6. *`scoreBled` carries the amount actually bled*, so the reading that sums it still sums what was taken.
7. *The ladder is still finite*: from a maxed run at the floor holding score, at most seven hits end in sealed shut, whatever the score, because the rung is spent once per arming.
8. *A run can end sealed while still holding the remainder the bleed left*, which is the whole point of the ruling. **It is not a state that could not exist before**: M1's own table has `steady-far` 903 ending sealed at 1,700, earned by kills after the bleed took everything. What is new is the remainder standing from the bleed itself.
9. *The readout falls from the score as it stood before the hit to what the bleed left, and never climbs*, **with the live score held at the remainder in the fixture**, and with the midpoint tick reading about halfway between the two. **The never-climbs assertion is the point of this test**, because the old expression passes a midpoint test while running the wrong way. **It is a claim about the fixture and not about play**: in play R5's easing toward a live score that gains more than the cap inside 40 ticks climbs, and that is by design.
10. *The countdown still eases toward the live score*, so kills paying while the grave is at the floor are landed on rather than jumped to.
11. *The view is still told a bleed happened and never infers it*, unchanged.
12. **The fences**, green, each by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
13. **The golden digest**, green and unmoved. `GOLDEN` reads `size: 24.10125` against a floor of 18 and `score: 200`, which is exactly the two scripted shambler kills' own rows, **so the scenario never reaches the floor and the ladder never runs in it**. A digest that moves here is a stop and report and never a re-pin.

**What this slice is expected to turn red.** `grave.test.ts` throughout the ladder block, `endings.test.ts`'s ladder-in-a-fight test on both its amount assertion and its `leftByTheBleed` capture, `watchedLoss.test.ts` and `LadderHud.test.ts` over the countdown's start, `events`' own tests if you widen `ScoreBled`, and `bot.test.ts`'s `BLEEDS_SCORE` and `harnessPolicy.test.ts`'s measured baselines **if the batch says the runs diverged, which they should not**. **A required field on `ScoreBled` adds every file that constructs one**, which typecheck finds for you: `src/app/__tests__/sound.test.ts:78`, `src/game/__tests__/director.test.ts:67` and `src/game/__tests__/signalLock.test.ts:24`. **A realistic count is 8 to 12 files.** A diff much larger than that is a reason to check what you reached into, and a set of measured baselines that moved is a reason to check the first ruling above before re-pinning anything.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit.
3. **Agent.** The four version constants and `GOLDEN`, each read off the tree and each named as held, with none of their four files in either commit.
4. **Agent.** The batch, printed as score bled against score earned, before and after, on M1's own seeds and configurations.
5. **Agent.** The event sequence proved identical per seed, counts and floor-hit split beside M1's table.
6. **Agent.** Replay determinism on one seed under `shaky-short`, a conditioned tape at the ladder rig measured to `outcome: 'verified'`, and a pre-cap tape diverging at a checkpoint rather than being refused, with the reason stated.
7. **Agent.** The fences green, each named by test title.
8. **Human (Mark), and none of these blocks you.** Two things, and the second is one question. Whether the cap's value feels right: take a hit at the floor late in a run and see what it costs, then take a second before growing and lose a level off every line. **And whether a slice taken off a large score is seen to leave at all**, because the falling digits are the whole channel the bleed has and on a late score the cap moves only the trailing three of them. **The lever is one data row and it is his**, and M6's bleeds and strips per run are the evidence beside it. **The deploy that puts it in front of him is the orchestrator's, straight after your report.**

### State of the branch

- The tip should be slice M5-fix's docs commit, `d68114a1a8`. **At HEAD the four read `WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN`'s checksum `-2049717150`.** **Read all four off the tree yourself before you lean on any of them and say what you read**, because a slice may land between this line and you.
- **You are permitted no version move of any kind and no `GOLDEN` re-pin.** The step's whole ledger was spent in M1 and M7 holds the one move still outstanding.
- **Slice M6 follows you** and declares what the ladder cost, which is why you land first: a reading declared over the uncapped amount would measure a rule that was about to change.
- The headless browser runs at 3 to 21 FPS under SwiftShader and puts consecutive screenshots 74 to 120 ticks apart, so a 40-tick countdown is shorter than the gap between two of its frames. **The countdown is pinned by test and its feel is Mark's own read**; do not spend runs chasing a frame.

### The stuck rule

**Three things are already known to be a stop:** anything under `src/` uncommitted when you start; any version constant or `GOLDEN` moving; and a reading whose meaning genuinely moved, which is reported and never fixed with a bump. **And four things are ruled rather than open:** the cap's shape is the lesser of the standing score and a flat amount, the band is 10 to 40 trash kills, ADR 0003's order stands and only the amount changes, and the bled-rung memory and its threshold are untouched. **A measurement arguing the cap is too harsh or too soft is a data row you annotate and a finding for the note, and Mark's own play is what settles it.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **The bled-rung memory's threshold**, which is Mark's lever and section 7's, even though you are in the file it lives in.
- **The score's other inputs**, M7's, and **the score's own event**, which M7 declares.
- **Declaring a reading**, M6's. You measure and print; you declare nothing.
- **The fallen rung, the dive and the field channel**, all landed or filed, none of them touched here.
- **#135's high score list**, which needs the step 6 store and is filed in the record's section 7 as a ticket after V1.
- **The record's section 7 findings**, none of which any slice acts on, and **the two prompt files**, which are the orchestrator's.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**

---

## Slice 8 (M1-stage): the ladder is staged in the harness (#99)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#99)`.

Slice 8 of The Hungry Grave: slice 7 capped the bleed, and its own verification step 8 handed Mark two questions a machine could have answered. **Mark ruled on 2026-09-17 that a mechanical question is never his**, and an audit of the harness the same day found why one keeps reaching him: the harness cannot stage the floor ladder at all. `createRun` cannot start a run holding a score, `rigs.ts` has no row at the size floor, and the one technique in the tree that puts a mob on the grave lives inside a single app test where nothing else can reach it. "Go to the lowest level, then the level below" is the scenario the harness exists for and is exactly the one it cannot play. **This slice builds the ability, and it is the whole of the slice.**

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice 8.

**Its progress-note entry is a section of its own, number 14**, appended at the end of `step-5-progress.md`. Slices 9 and 10 fill sections 12 and 13 above it afterwards, so section 14 sits below a section 12 heading that is still empty when you write. **You neither create their headings nor renumber anything.**

**Mark's rule, in his own words, and it is why this slice exists.** On 2026-09-17: every mechanical question is proven by a unit test, by an integration test where one genuinely fits, or by a staged scenario in the computer player's harness, and never by him playing it. **A slice's Mark actor carries feel and nothing else, and a missing harness ability is the work rather than a reason to ask him.** This slice has no Mark actor at all.

**Eight rulings shape this slice and none of them is yours to revisit.**

**First: nothing a player can meet changes.** No rule of the sim moves, no screen moves, no data row that decides play moves. `bleedScore`, `runFloorLadder`, `stripLevels`, `hitGrave` and `growGrave` keep their bodies exactly, `SCORE_BLEED_CAP` keeps its value, and the only production file under `src/game` this slice opens at all is `run.ts`, for one defaulted parameter. **A diff that changes what a played run does is a stop and report**, whatever it fixes.

**Second: `createRun`'s new parameter goes last in the list and never literally beside the size.** The signature is positional, so a parameter inserted after `startingSize` would silently re-read every existing call's third, fourth and fifth argument, and there are eight call sites in seven files outside the tests. **`startingScore: number = 0` is appended after `signalLock`**, its JSDoc says it is the score the run begins holding and that it exists for the harness's staged ladder, and it names the rig row and the scenario below as its cited caller, which is what the cited-future rule asks of a parameter with no player-facing reader. **Nothing that calls `createRun` today changes at all**, which is the test that proves the placement right.

**Third: the row is the ladder rig, named `ladder`, and `rigs.ts` already says it is waiting for it.** The file's own comment reads "The ceiling rig and the ladder rig the record names have no row here because nothing plays them through the harness; a row for either is a row the day something does." **This is that day.** Calling the new row `floor` would put a second name on a starting condition the record already names, which is the exact defect #107 was raised for. **The comment goes false the moment you add the row and is rewritten in the same commit**: the ceiling rig is still unrowed and still waiting, and the ladder rig now has a row because this slice plays it.

**Fourth: a starting score is not a tape-header fact, and `FORMAT_VERSION` does not move.** `TapeHeader` carries the seed, the starting size, the roster, the starting levels and the signal lock, and `playback.ts`'s `runFromHeader` rebuilds a run from those alone. `run.score` is folded into the witness (`witness.ts`, the fold beside `run.reservoir`), so **a tape recorded from a run that started holding a score replays from zero and diverges at the first checkpoint.** That is arithmetic and not a defect to design around inside this slice. **So three things follow and all three are ruled.** The header is not widened and `FORMAT_VERSION` stays 4. `record-conditioned.ts` says the divergence out loud when a non-zero score is named, because nothing abnormal is ever silent, and it says it before it writes rather than after. **And the conditioned ladder tape this slice records and verifies is recorded at a starting score of zero**, on the ladder rig, where the run earns its own score off a maxed build at the floor and the bleed is reached by play; that tape measures to `outcome: 'verified'` like any other. **Widening the header so a staged score replays is a later slice's candidate and you file it in the note, never take it.**

**Fifth: the scenario is its own file and `digest.ts` is not opened at all.** `runScenario` is the precedent for the shape and not the home: a second scenario inside `digest.ts` puts a new file's edits in the same module as `GOLDEN`, and the surest way the golden's own run cannot move is that its file is in neither commit. **`GOLDEN` holds at the checksum slice 2 pinned and `digest.test.ts` is green unchanged**, which you report as read off your own tip.

**Sixth: the scenario returns its rows and prints nothing.** `src/dev` may import no bare package, vitest included, which is why `runScenario` returns its digest, its boundary extremes and its faults rather than asserting any of them; the same reasoning binds yours. **The per-hit table is printed by a scratch script in the scratchpad, never by a committed shell**, which is how slice 6b printed its own three probes, and the returned rows are what the unit tests assert. **No `console.log` enters `src/dev`.**

**Seventh: the staging technique moves rather than being copied.** `standOnGrave` in `src/app/__tests__/screenLifecycle.test.ts` is nine lines that park an unkillable shambler on the grave's own coordinates, and it is the only way in the tree to make a hit land on demand. **It becomes a named helper in `src/dev` and `screenLifecycle.test.ts` imports it**, so one technique has one home. The fences permit it: the boundary table's `app` row is scoped `only: ['sound.ts']`, so no row governs `src/app/__tests__`, and `src/dev` may reach `dev`, `game` and `tape`. **Confirm that by running the fence rather than by trusting this sentence**, and if a fence refuses it, that is a stop and report.

**Eighth: the two missing tests are at seams that already exist, and one of them may be an absence.** Neither is a new rule. The first is a case the ladder's tests infer from a shared path rather than pin. The second asks where the already-ended guard lives, and **reading the code is how you answer it, not this prompt**: `advance.ts`'s loop breaks on `execution.run.ending !== null` before it executes a tick, `hitGrave` itself has no such check, and `executeTick` is the one execution authority both `advance` and playback go through. **Rule it by reading all three, write whichever test the answer asks for, and say which you wrote and why in the note.** The tech gate read the three on 2026-09-17 and found the guard belongs to the loops above: `executeTick`'s JSDoc names the loops as the owners (#52), and a guard inside `hitGrave` would change what a sealed tape with post-ending ticks recomputes at its checkpoints, breaking readback of every such tape. **So the expected answer is the absence test at `hitGrave`, a hit on a sealed run runs the ladder and re-seals with the ending unchanged, plus the why-comment. Confirm it by your own reading; if your reading disagrees, that is a stop and report, not a different test.**

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. **The six dispatch contract items are the sections below.**
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`. **The cited-future rule and the deletion test both bind this slice directly**, because every seam it widens is widened for a caller that does not ship.
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **R4 in full and its closing amendment**, which is the ladder this slice stages, then section 6's test sentences and **section 7's findings, none of which you act on.**
4. `apps/hungry-grave/docs/push/step-5-progress.md`: **section 7's `M1-fix` subsection whole**, which is the measurement this slice's scenario has to agree with, and **section 11's `M5-fix` subsection**, which is the form your own section 14 takes.
5. `apps/hungry-grave/docs/design/playing-harness.md` and `apps/hungry-grave/docs/adr/0053-*`, **for what a rig is and what it is not**: a rig is a starting condition and never a description of the hand that steers it, and #107 is why both halves of a row are stated together.
6. `apps/hungry-grave/CONTEXT.md`, the entries **Rig**, **Score**, **Size floor** and **Rung**. You amend none of them unless one has gone false, and you say in the note what you decided and why.
7. The tree, whole where it is short and by function otherwise: `src/game/run.ts`'s `createRun` and its JSDoc, **which already explains why the size, the levels, the roster and the signal lock are each in that signature and is the voice your own sentence copies**; `src/dev/rigs.ts` **whole**, which is 88 lines; `src/dev/harnessRun.ts` **whole**, and `playHarnessRun` and `harnessHeader` above all; `src/dev/digest.ts`'s `runScenario`, `scriptedKills`, `ScenarioResult` and `reportUnplaceableVictim`, **read and not edited**; `src/game/grave.ts` **whole**, and `runFloorLadder`, `bleedScore`, `stripLevels`, `strippableLines`, `sealShut` and `hitGrave` above all; `src/game/advance.ts` **whole**, 55 lines, and its ending guard with the paragraph above it; `src/game/execution.ts`'s `executeTick`; `src/game/witness.ts` where `run.score` is folded; `src/tape/tape.ts`'s `TapeHeader` and `src/tape/playback.ts`'s `runFromHeader`; `scripts/record-conditioned.ts` **whole** and `scripts/batch.ts`'s `parseRig`, **which is the keyed-argument shape your new flags copy**.
8. The tests: `src/app/__tests__/screenLifecycle.test.ts`'s `standOnGrave` and the two ladder tests around it; `src/dev/__tests__/rigs.test.ts` **whole**, which asserts every row's condition is unique and which your new row has to keep true; `src/game/__tests__/grave.test.ts`'s whole ladder block; `src/__tests__/boundary.test.ts`'s `BOUNDARIES` table.

**Check the worktree is clean before your first edit and report what you find.** Anything uncommitted under `src/` is a stop and report. A docs file dirty in the shared worktree is another agent's and never enters your commits.

### The definition, in observable terms

After this slice the harness can stage the floor ladder and walk it hit by hit. A run can be started at the size floor, at chosen levels, holding a chosen score, by naming one row. A scenario plays that run and forces floor hits in sequence, and for each hit it reports the event the ladder fired, the score before and the score after, the levels after, and the ending if the hit produced one. **Walked from a score above the cap, the sequence it prints is the ladder's own: a bleed that takes the cap and leaves the remainder, then one strip per hit, each taking one rung off every line still above its floor, until no line has one, then the seal, then nothing more.** That is `stripLevels`'s own rule, one level off every strippable line per hit, and it is the rule the walk's row count follows from: from maxed, a bleed, one strip per rung above the floor, the seal, and the one hit past it. One more hit past the seal is played and what it does is observed rather than assumed.

**The command line can record that run as a tape.** `record-conditioned.ts` takes the rig row by name and a starting score, so the conditioned ladder tape is recorded on the ladder rig rather than by playing down to the floor from the start line. **A tape recorded with a non-zero starting score is named as unverifiable before it is written**, because the header carries no score, and the tape this slice verifies is the ladder rig at a score of zero driven all the way to the seal.

**Two seams that already existed gain the test they were missing**: a floor hit at zero score with the rung still armed drops bodies, which the suite infers today from a path it shares with another case, and the question of what a hit on an already-ended run does, answered at whichever seam owns the guard.

**Nothing a player meets changes.** No event, no magnitude, no screen, no rule. `WITNESS_VERSION` reads **11**, `READINGS_VERSION` reads **8**, `FORMAT_VERSION` reads **4**, `GOLDEN` holds at the checksum slice 2 pinned, and `pnpm verify` is green.

What a player meets: nothing, and that is the definition. What Mark meets is one fewer question.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m1stage`. **Slice 7's two commits must both be in the tree.** Anything dirty under `src/` is a stop.

**(b) The tests first, red.** Write the scenario's own tests before the scenario, from the test list below, and the two missing seam tests before whichever code they need. **A scenario written before the test it has to satisfy is a scenario shaped by what was easy to build.**

**(c) `createRun`'s starting score.** Last in the list, defaulted to zero, with the JSDoc paragraph the other four parameters each already have and with the rig row and the scenario named as its caller. **Every existing call site is left untouched and you say in the note that you checked all eight, in seven files.**

**(d) The ladder rig row.** `RIG_NAMES` gains `ladder`, and `RIGS.ladder` carries the size at `SIZE_FLOOR`, uniform levels at `MAX_LEVEL`, and a starting score. **`Rig` gains `startingScore` and every existing row states it as zero**, because both halves of a rig are stated together and a row that left it implicit would rebuild #107's own defect. **`playHarnessRun` passes it through**, so a rig is never half applied. **`rigOf` keeps its two arguments and gains no third**: it answers which row a tape was recorded under, the header carries a size and levels and no score, and a banding rule that read a fact the header cannot hold would answer null forever. Say that decision in the note rather than leaving it to be rediscovered. **For the same reason `rigs.test.ts`'s uniqueness key stays size plus levels and does not widen to the score**: `rigOf` cannot see a score, so two rows differing only by score would be unbandable, and the key that stays narrow is what keeps that defect impossible.

**(e) The rig's score, and this is the one number you pick.** Stated as a multiple of `SCORE_BLEED_CAP` and never as a bare figure, **at least twice it**, so the bleed leaves a remainder standing and the scenario's table shows the cap's own rule rather than a score that happened to vanish. Annotate it as a first figure, say what you set it against, and name what would move it. **A number typed into a test is a stop; a row the test reads is the rule.**

**(f) The staging helper, moved.** `standOnGrave` leaves `screenLifecycle.test.ts` and becomes a named helper in `src/dev` in a file whose concept is staging a run into a state a play would take minutes to reach. **`src/dev/staging.ts` with `standMobOnGrave` is the recommendation and the concept is the ruling**: if a better name reads truer once you have both callers in front of you, take it and say why in the note. `screenLifecycle.test.ts` imports it and keeps no copy. **Run the fence before you lean on the import being allowed.**

**(g) The scenario.** Its own file in `src/dev`, following `runScenario`'s shape: it builds the run, drives it through the one execution authority, and returns a record. **It returns one row per forced hit**, carrying the event the ladder fired, the score before and after, the levels after, and the ending, plus the run it left behind. It forces hits in sequence rather than waiting for the storm to land them: **before every forced hit the scenario clears `grave.invulnerable` directly and re-stages the mob, the way `screenLifecycle.test.ts` holds the window open, rather than waiting the window out**, because a kill or a crumb swallow inside a live window grows the grave above `SIZE_FLOOR` and the next hit then shrinks instead of laddering. **Each row also carries the grave's size before the hit**, so a hit that shrank instead of laddering is visible in the table rather than read as a missing event. **And it plays one hit past the seal.** It prints nothing and it asserts nothing.

**(h) The shell's two flags.** `record-conditioned.ts` gains `rig=<name>` and `score=N`, keyed arguments in the shape `batch.ts`'s `parseRig` already uses, both optional. **A named rig passes through whole, its size, its levels and its score, the way `playHarnessRun` applies one**; `recordTape` passes `undefined` for the size today and a rig applied without its size is a rig half applied. **A command naming a rig and naming the four line levels too is refused with the reason**, because the row already states the levels and a command that states them twice can state them differently. **Without either flag the command means exactly what it means today.** A non-zero score warns, before the write, that the header carries no score and the tape's readback will diverge at the first checkpoint. The usage line carries both.

**(i) The two missing tests.** In `src/game/__tests__/grave.test.ts`: a floor hit at zero score with the rung still armed drops bodies, pinned directly rather than inferred from the case it shares a path with. Then the already-ended question, ruled by reading `advance.ts`, `executeTick` and `hitGrave`, and written as whichever the answer asks for: a no-op test at `hitGrave` if the guard belongs there, or **a test that fails if the guard ever appears in `hitGrave`**, with the constraint named in a short why-comment beside the code, if the answer is that it belongs to the loop above. **Say which you wrote and why in the note.**

**(j) The measurements this slice owes.**

- **The staged scenario's own per-hit table**, printed off a scratch script and pasted into the note whole. From a score above the cap: the bleed and what it took, every strip and which lines paid, the seal, and the hit after the seal.
- **The conditioned ladder tape, re-recorded on the ladder rig at a score of zero and driven to the seal**, measured to `outcome: 'verified'`, with its readings in the note. **The pre-cap tape stays where the repo keeps them, `local/step5/`, which enters no commit**, so the superseded one is untouched rather than deleted. **If the tape ends on its budget before the seal, report the ladder events it reached and change neither the steer nor the budget to force one**; slice 7's own conditioned tape verified with one bleed, one strip and no seal, the wandering steer swallows and grows, and the seal is the staged scenario's job, not the tape's.
- **A batch on the same twelve seeds slice 7 measured**, 900 to 905 under `steady-far` and the same six under `loose-far`, birthright rig. **Event counts identical to slice 7's batch, per seed.** This slice changes no rule, so a count that moved is a stop and report rather than a finding: nothing here has a branch that could explain one.
- **Replay determinism at your tip.** One seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
- **The four constants and `GOLDEN`**, each read off the tree and each named as held, with none of their four files in either commit.

**(k) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the harness stages a run at the floor holding a score and walks the ladder hit by hit (#99)`, or `test(hungry-grave): ...` if what you wrote is genuinely all test surface. Then the docs commit, carrying the progress note.

**(l) The progress note**, section **14**, in slice 6b's subsection form: bold-led paragraphs, each naming one thing, no numbered list. Beyond the contract's list, say: the parameter's placement and the eight call sites in seven files checked; the rig row, its score, what you set it against, and `rigOf` left at two arguments with the reason; `rigs.ts`'s comment that went false and what it says now; the scenario's file, its returned shape and the per-hit table whole; the staging helper's home and the fence run that permitted the import; the two flags, the refusal when both are named, and the warning's exact wording; **the tape-header gap written out plainly**, that a staged score does not survive a replay and that widening the header is filed rather than taken; the already-ended question, which seam owns the guard, and which test you wrote; the batch proving the event counts identical; and the four constants and `GOLDEN` all named as read off your own tip.

**(m) Stop and report.** Under 250 words. **Do not start slice 9.** **This slice's tip is not a deploy**: nothing a player can meet changed, so there is nothing on it for Mark to see.

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN` as slice 2 pinned it.** None moves, **`readingsVersion.ts`, `witness.ts`, `wireCodes.ts` and `digest.ts` are in neither commit**, and you read all four off the tree rather than off this line. **The tape header is the one you will be tempted by**; it is a stop.
- **Every rule of the sim.** `bleedScore`, `runFloorLadder`, `stripLevels`, `strippableLines`, `sealShut`, `hitGrave`, `growGrave` and the bled-rung memory keep their bodies exactly. **The only edit permitted under `src/game` is `createRun`'s new parameter and whatever the two missing tests need**, and a why-comment if the second one is an absence.
- **`SCORE_BLEED_CAP`, `SIZE_FLOOR`, `HIT_SHRINK`, `INVULNERABLE_TICKS`, `SCORE_RUNG_REARM_SIZE` and `TRASH_KILL_SCORE`.** You read them; you move none.
- **The two existing rig rows.** `birthright` and `maxed` keep their size and their levels exactly, and gaining an explicit zero score changes neither. **`rigs.test.ts`'s uniqueness assertion stays green as written.**
- **`playHarnessRun`'s header, its policy and its budget**, and `harnessHeader`'s fields. The rig it is handed changes; what it records about one does not.
- **The three ladder events and every other event.** None is added, removed, widened or renamed.
- **Every existing invariant's meaning and severity, the fault identity list, every cap, `STREAM_SALTS` and `STREAM_ORDER`.**
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty. **`src/game` still reaches nothing outward**, and the new parameter is a number with no import behind it.
- **`record-conditioned.ts`'s existing behaviour with no new flag named.** Same arguments, same tape, byte for byte on the same seed and commit apart from the header's `recordedAt`, the three bytes slice 7's determinism check already isolated, which is a thing you can check rather than claim.
- **No test is deleted, skipped, weakened or rewritten to reach green.** The two app tests that use `standOnGrave` keep their promises and their names; only where the helper comes from moves.
- **Nothing under `src/app` beyond swapping the helper's nine-line body for that import**, nothing under `src/tape` at all, and nothing under `src/game` beyond the parameter and the tests.

### Seams under test

`src/game/run.ts`: `createRun` starting a run at a chosen score, and defaulting to zero for every caller that names none. `src/dev/rigs.ts`: the ladder row as a starting condition, and `rigOf` still banding a tape by the two facts a header carries. `src/dev`'s new scenario: a staged run walked hit by hit, reporting per hit what the ladder fired, what the score was before and after, the levels, and the ending. `src/dev`'s staging helper: a hit made to land on demand. `src/game/grave.ts`: the floor hit at zero score with the rung armed, and whatever the already-ended question rules. `scripts/record-conditioned.ts`: a rig named by row, a starting score named beside it, both refused when they contradict the levels, and the divergence said out loud.

### Module boundaries

**Two files are created and none is deleted, merged or split.** The scenario is its own file in `src/dev` because it is one concept, a staged walk of the floor ladder, and every export serves it; it does not join `digest.ts`, whose concept is the golden scenario and its constant. The staging helper is its own file in `src/dev` for the same reason and because it has two callers in different trees. **No import direction changes**: `src/game` stays dependency-free and reaches only itself, `src/dev` reaches `dev`, `game` and `tape` as it already may, the app test reaching `src/dev` is governed by no boundary row, and `src/tape` is not opened. The starting score lives in `createRun`'s signature and not in a rig-aware branch inside the sim, for the same reason the starting size does: the sim takes a number and the harness decides what number. **No new library enters, and `src/dev` still imports no bare package.**

### The planned test list

1. *A run started with no score starts at zero*, which is every caller in the tree today.
2. *A run started at a chosen score starts holding it*, and nothing else about the run differs from the same seed started at zero.
3. *The ladder rig starts a run at the size floor, at its levels, holding its score*, all three read off the run rather than off the row.
4. *Every rig row's starting condition is still unique*, the assertion `rigs.test.ts` already makes, with the new row in it.
5. *A tape recorded from the ladder rig still bands as the ladder rig*, so `rigOf` answers the row's name off a header that carries no score.
6. *The staged scenario's first hit on a score above the cap bleeds the cap and leaves the remainder*, read off the row it reports rather than off the run.
7. *Its next hits each strip one rung off every line still above its floor, until every line is at its floor*, each strip reported with the lines that paid.
8. *Its last hit seals*, and the row says so.
9. *The hit after the seal is played and the scenario reports what it did*, which is the case the audit found nothing in the tree asserts.
10. *The scenario walks the whole ladder in a bounded number of hits*, so a rule change that made the ladder infinite fails here rather than hanging.
11. *A floor hit at zero score with the rung still armed drops bodies*, pinned at the `grave.ts` seam rather than inferred.
12. *The already-ended case*, at whichever seam owns it, as a behaviour test or as an absence test with its why-comment.
13. *The staging helper puts a hit on the grave on the next tick*, from the scenario's side, so the technique is pinned once where it lives.
14. **The fences**, green, each by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
15. **The golden digest**, green and unmoved, with `digest.ts` in neither commit.

**What this slice is expected to turn red.** Nothing, which is itself the claim to check. `rigs.test.ts` compiles against a widened `Rig`, `screenLifecycle.test.ts` compiles against a moved helper, and every other suite should be untouched. **A realistic count is 7 to 10 files.** A suite that reddens anywhere under `src/game` beyond the two new tests is a reason to stop and read what you reached into, because nothing here is supposed to change a rule.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit.
3. **Agent.** The four version constants and `GOLDEN`, each read off the tree and each named as held, with none of their four files in either commit.
4. **Agent.** The staged scenario run end to end, its per-hit table printed and pasted into the note whole.
5. **Agent.** The conditioned ladder tape re-recorded on the ladder rig at a score of zero, driven to the seal, measured to `outcome: 'verified'`, its readings in the note.
6. **Agent.** A batch on slice 7's own twelve seeds and configurations, with event counts identical to slice 7's batch per seed.
7. **Agent.** Replay determinism on one seed under `shaky-short`.
8. **Agent.** The fences green, each named by test title.
9. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
10. **There is no Mark actor in this slice.** Nothing here is a feel question and nothing on this tip is for him to play.

### State of the branch

- The tip should be slice 7's docs commit, `5a904b86ca`, or the handoff commit above it. **At HEAD the four read `WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN`'s checksum `-2049717150`.** **Read all four off the tree yourself before you lean on any of them and say what you read**, because a slice may land between this line and you.
- **You are permitted no version move of any kind and no `GOLDEN` re-pin.** The step's ledger holds one move still outstanding and it is slice 10's.
- **Slice 9 follows you** and declares the ladder's cost as readings. It is the first consumer of what you build: a reading declared over a ladder nobody could stage was measured on the bot's own luck.
- The headless browser draws at 3 to 21 FPS under SwiftShader, so nothing in this slice is checked by screenshot and none of it needs to be.

### The stuck rule

**Four things are already known to be a stop:** any version constant, `GOLDEN` or the tape header moving; a rule of the sim changing; an event count that moved on slice 7's seeds; and a fence that refuses the app test's import of the helper. **And four things are ruled rather than open:** the new parameter goes last, the row is named `ladder`, the scenario is its own file and `digest.ts` is not opened, and a staged score is not a header fact. **A measurement arguing any of the four should move is a finding for the note, never a row you move here.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **Declaring a reading**, slice 9's. You stage and you print; you declare nothing.
- **Widening the tape header so a staged score replays.** Named in the note, filed, and not taken.
- **The cap's value**, which is the tuning record's row and is read against slice 9's batch, even though you are staging the rule it governs.
- **The announcement's lever**, the delta readout or the blow-up firing on a bleed, filed for the tuning record and unbuilt.
- **The bled-rung memory's threshold**, which is Mark's lever, and **the score's other inputs**, slice 10's.
- **The ceiling rig**, still unrowed and still waiting for something that plays it.
- **A second scenario for anything else.** One staged walk, one file; the next scenario is the day something needs it.
- **The record's section 7 findings**, none of which any slice acts on, and **the two prompt files**, which are the orchestrator's.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**

---

## Slice 9 (M6): the ladder's cost is measurable (#99)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#99)`.

Slice M6 of The Hungry Grave: the batch already prints how often the ladder bled and how often it stripped, and it says nothing at all about what happened to the rungs that fell, where the player was standing when they went, whether the memory that keeps the strip reachable ever cleared, or whether the loss landed in a boss. This slice declares those.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M6.

**Five rulings shape this slice and none of them is yours to revisit.**

**First: strips per run already exists and you do not re-declare it.** `tuning.damageTaken.weaponStrips`, `linesStripped`, `scoreBleeds`, `scoreBled` and `seals` are declared readings today, spread per batch in `batchReport.ts` and compared in `compareRuns.ts`, and the bleed-versus-strip split is already the split between `scoreBleeds` and `weaponStrips`. **A second key for a count that exists is exactly what `readingsVersion.ts`'s worked example is written to warn about**, and an earlier draft of this prompt asked for one. Your readings go beside `damageTaken`, never over it.

**Second: a reading reads events first and the run's state where no event carries the fact.** `observeReadings` hands `state: RunState` to every reading in the graph, and `gravePath`, `groundHeld` and `refusals` all read it; `refusals.ts`'s own JSDoc writes out why, that the run clears its ledger at the top of every tick and no event carries a refusal, so the only way to read one is to look at the end of the tick where the invariant harness looks. **Two of your readings are in exactly that position**, the grave's y at a strip and the bled-rung memory's edge, and taking the state at the end of the tick an event fired on is `gravePath`'s precedent and is permitted. **What is still forbidden is `src/dev` writing the run**, and re-implementing a sim rule inside a reading: read the edge, never recompute the predicate that moves it.

**Third: every one of these is a declared reading, list or scalar. There is no print beside the batch.** Both declaration fences walk every path on a report, so a number that exists only in your report text cannot be read by step 6 and cannot be compared across two batches. **The tape rule is the reason**: step 6 iterates from numbers a batch carries, and it cannot re-read a print.

**Fourth: `READINGS_VERSION` does not move in this slice, and `readingsVersion.ts` is not in your commit.** Its rule is that the version moves when a reading's *meaning* changes, a split or a redefinition, and not when new readings arrive beside unchanged ones; every reading here is new. **Slice M1 already moved it 7 to 8 for `run.score`'s meaning changing under R4, and slice M7 after you moves it 8 to 9 for the same reading changing again**; neither is yours. **The reason the version is held goes in the progress note and nowhere else**, because the file is on the must-not-move list and a prose edit inside it is still a file in the commit. **If you find an existing reading whose meaning moved under this step, that is a stop and report and never a version bump you take.**

**Fifth: it is its own commit rather than part of M5**, for round two's stated reason that a reading landing in the same commit as the mechanic hides which of the two moved a number.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **section 4's M6 paragraph and its `READINGS_VERSION` paragraph in full**, R4 and R6 in full for what these readings are evidence about, section 5, and **section 7's first three findings and its bottom-clamp finding, which are the questions these numbers answer**.
4. `apps/hungry-grave/docs/adr/0053-the-playing-harness-is-one-policy-over-many-seeds.md` in full, **especially the harness reports and never judges**, plus `0055`.
5. `apps/hungry-grave/docs/push/round-two-progress.md` **section 9 in full**, which is slice I declaring a reading, splitting an existing one and writing a version note, and **section 15's readings item**, which is J2 doing the same for two arms at once.
6. `apps/hungry-grave/docs/push/step-4-progress.md`'s own storm kill rate, **2.47 bodies a second**, which is the number R4's whole mechanism was ruled against.
7. `apps/hungry-grave/CONTEXT.md`, the entries **Fallen rung, Rung, Dive, Score** and **Tape**. **Read the Avoid lists before naming anything.**
8. The tree, and **read `src/dev/readings/powerUpLedger.ts` whole before you write a line**: it is the four-fate ledger your first reading copies. Then `readings.ts` for the graph and for the fact that every reading is handed the state; `gravePath.ts` and `refusals.ts` for the two readings that take the state at the end of the tick and for the JSDoc that says why; `damageTaken.ts`, which already holds the strips and the bleeds; `readingsVersion.ts` whole, read and not edited; `batchReport.ts` and `compareRuns.ts`, where a reading declares how a batch reduces it and what comparing it means, and `arrivals.perSecond`'s `number | null` on the reading with `?? undefined` at the declaration, **which is the precedent for an absent rate**; `src/dev/__tests__/comparisonDeclared.test.ts` and `src/dev/__tests__/batchReadingDeclared.test.ts`, **which are two fences and not one**; `src/dev/bot.ts` and `src/dev/harnessPolicy.ts` for what the hand actually wants each tick; `src/game/events.ts` for the events you build from, **including M5's landed `rungFell` and `rungCaught`**; and `src/game/grave.ts` for `scoreRungBled` and `SCORE_RUNG_REARM_SIZE`.

### The definition, in observable terms

After this slice a batch prints, per run and reduced across the batch:

- **Where every fallen rung ended up**, in `powerUpLedger`'s own four-fate shape, with the sum asserted against the count that fell.
- **Where the player was standing when each strip landed**, as the grave's y at the strip's own tick, and how close to the bottom clamp that was.
- **How long each fallen rung was on the field** before it was caught or lost.
- **What the bled-rung memory did**: how often it was set, how often it cleared, and how much growth arrived while it was set without clearing it.
- **Whether each strip landed with a boss on the field**, which is the worst moment for one because there is nothing on the field to rebuild from.

Every one is a declared reading. Both new keys and existing keys still mean exactly what they meant, **so `READINGS_VERSION` does not move** and `readingsVersion.ts` is not in the commit.

`WITNESS_VERSION`, `READINGS_VERSION`, `FORMAT_VERSION` and `GOLDEN` are all untouched. **No simulation rule changes and nothing under `src/game` or `src/app` is in this commit.**

What this buys: section 7's findings stop being arguments and become numbers beside Mark's own play.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m6`. **Slices M1 through M5, M1-fix and M1-stage must all be in the tree**, because a reading declared over a mechanic that is not there measures nothing, **and `src/dev/floorLadderWalk.ts`, `RIGS.ladder` in `src/dev/rigs.ts` and the staging helper in `src/dev/staging.ts` are what your tests stage a floor run with rather than hand-built state** (slice 8, progress note section 14). **Read M5's landed `rungFell`, `rungCaught` and its fourth `FoodKind` before you design anything**, because what those events carry decides how three of your readings are built.

**(b) The tests first, red.** **Write the two declaration tests first**, one per fence: every reading declares how a batch reduces it, and every reading declares what comparing it means.

**(c) The fallen-rung ledger, in `powerUpLedger`'s shape.** **Fell equals caught plus lost plus refused plus on field at the stop, and the sum is asserted in the reading's own test**, which is the check `powerUpLedger` already runs on itself and the reason its JSDoc can claim no body leaves unobserved. The arms: `rungFell` for the denominator, `rungCaught` for the catch, `corpseLost` under M5's fourth kind for the scroll, and the field at the last tick for what was still standing. **The denominator counts a rung only if `rungFell` fires for it**, which is the whole question the refusal arm turns on: M5's own test list has a rung refused at `CORPSE_CAP` lost with nothing banking it, and M5's prompt does not say whether the event fires for a body that never reached the field. **Read M5's landed code and say in the note which it is.** If it does fire, the refusal arm's only source is `state.refusals.food`, and **that counter is every food refusal and not rungs alone**, so say exactly that in the reading's JSDoc rather than letting a reader take it for rungs; if it does not fire, the ledger is three arms and the note says the denominator is bodies that reached the field.

**(d) The grave's y at each strip, and the clamp.** `rungFell` carries the line and not a position, **so take the state at the tick `weaponStripped` fires**, which is `gravePath`'s own precedent and permitted by the second ruling. **The clamp is `FIELD_HEIGHT - state.grave.size`**, computed the way `gapUnderGrave` computes the gap under the rim rather than under the centre, and for `gapUnderGrave`'s own stated reason: a centre test measures a band that shrinks as the grave grows and would invert the reading. **Declare the y per strip as a list and the gap beside it**, so a batch can say both how often a strip landed against the clamp and how far off it the rest were. This is the number section 7's bottom-clamp finding is answered with.

**(e) Ticks from fall to catch or loss, per fallen rung.** If M5's events carry an id, match on it. **If they carry only the line, match oldest-first within the line and say so in the JSDoc**, on `powerUpLedger`'s own precedent: `linesTakenIn` splices one entry per line for exactly this reason and writes down why the splice is unambiguous. A rung still standing at the stop has no span and carries absence rather than a zero, **on `arrivals.perSecond`'s precedent**, a `number | null` on the reading with `?? undefined` at the declaration.

**(f) The bled-rung memory's transitions, read off the state's edge.** `state.grave.scoreRungBled` has no event and its clear predicate lives in `grave.ts`; **reading the edge per tick is the reading, and re-implementing the predicate in `src/dev` is not**. Count the ticks it was set, the times it went set, the times it cleared, and **the growth that arrived while it was set and did not clear it**, which is Mark's crumb-threshold question made measurable: section 7 says the lever is whether a crumb or a hit's worth of growth re-arms the cushion, and this is what that lever is read against. Take the state at the end of the tick, which is where `refusals.ts` looks and why.

**(g) Each strip tagged with whether a boss was on the field.** A boss is live from `bossArrived` until `bossKilled` or `sectionChanged`, both of which exist today. **A strip inside a boss is the worst moment for one**: nothing is dying, so there is nothing on the field to rebuild from, and a strip there and a strip in the mow are different events wearing one count. Tag the strip and let the batch split on it.

**(h) The version, held, with the reason in the note and not in the file.** `readingsVersion.ts` is on the must-not-move list and is not in your commit. **Quote its own rule in the progress note**, the way round two's slice I quoted the same rule to say the opposite.

**(i) The measurements this slice owes.**

- **A batch at your tip** on the configurations and seeds M1 and M5 used, which are seeds 900 to 905 under `steady-far` and `loose-far`, birthright rig, with every new reading printed beside the existing ones. **The five `damageTaken` readings and `run.score` must reproduce progress note section 14's per-seed table exactly**, since M6 changes no rule and slice 8 already reproduced slice 7's counts to the seed; a count that moved is a stop. **Set `tuning.damageTaken.weaponStrips` against the storm's measured 2.47 kills a second**, which is the figure R4's mechanism was ruled against; it is an existing reading you read rather than one you declare.
- **The bot's number stated plainly, with what it measures and what it does not, and the direction it is off in.** **The bot is not a player**: its rate measures the policy. **Read `harnessPolicy`'s `pointWanted` yourself and report what it does rather than what any record says it does.** What is in the tree: the hand wants the live offer's nearest body, else the nearest food of any kind, else `HOME`, and `nearestFood` walks every alive corpse without looking at its kind, so **a fallen rung is one candidate among every body on the field and a live offer outranks it outright**. So the number is neither a ceiling nor a clean floor: it is short of a player who decides to dive for a particular rung, and long of a player who never noticed one, because the hand can swallow a rung by accident while walking at something else. **Say which way your batch's figures point and why.** **It is never a reason to skip Mark's own play.**
- **A reading that comes out at zero is a finding to explain before it is a result.** A ledger over no fallen rungs on the twelve birthright seeds is followed by a batch on `rig=ladder`, which starts at the floor holding three caps and reaches the seal by play; a zero there is the finding.
- **No witness move, no `GOLDEN` re-pin and no determinism run is owed**, and that claim is checked rather than assumed: nothing under `src/game` is in this commit. **If any of the four version constants or `GOLDEN` moves, that is a stop and report.**

**(j) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the batch reads what the ladder cost and what the dive took back (#99)`.

**(k) The progress note**, section **12**. Beyond the contract's list, say: every reading with its denominator named; whether `rungFell` fires for a cap-refused body and what that did to the ledger's arms; the batch's figures for each; `weaponStrips` against the storm's kill rate; `READINGS_VERSION` named as held with the rule quoted and the file named as absent from the commit; the bot's number with what it measures, what it does not and which way it is off; and the four constants and `GOLDEN` all named as untouched.

**(l) Stop and report.** Under 250 words. **Do not start slice M7**, which follows you and pays the score's other inputs.

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN` at `-2049717150`.** None moves, none of the four files is in the commit, and **you read all four off the tree rather than off this line**, and a move in any is a stop and report.
- **Every existing reading's meaning**, `tuning.damageTaken`'s five above all. A new key goes beside them; none of them is widened, split or renamed.
- **The harness reports and never judges** (ADR 0053), which is a fence by that name.
- **The harness's own rows and its measured per-seed baselines**, which are re-measured with a reason and never re-pinned blind.
- **The fences**, every one by title, plus the core's cycle guard.
- **Nothing under `src/game` or `src/app` is in this commit**, and `src/dev` reads the run and never writes it.
- **No ADR is filed or amended.**

### Seams under test

`src/dev/readings/`: the new readings, each with its denominator named and each saying in its own JSDoc where it read its facts, events or the state's end-of-tick value. `src/dev/batchReport.ts`: each reading declaring how a batch reduces it. `src/dev/compareRuns.ts`: each reading declaring what comparing it means. **`src/dev/readingsVersion.ts` is read and not edited.**

### Module boundaries

**The new readings join the readings folder as concept modules**, named for what they measure, with their public interface at the module's end. **The fallen-rung ledger is one concept and is one module**; the strip's own circumstances, the y, the clamp gap and the boss tag, are one concept and may be a second; the memory's transitions are a third. **Nothing is deleted, merged or split**, and `damageTaken.ts` is not touched. `src/dev` imports only from `src/dev`, `src/game` and `src/tape`, which is a fence by name. No new library enters.

### The planned test list

1. *A caught fallen rung, one the scroll carried off, one refused and one still standing at the stop each land in their own arm.*
2. *The four arms add up to the rungs that fell*, asserted rather than described, which is the ledger's own check on itself.
3. *A run that dropped no fallen rung reports the ledger's arms as zero and its shares as absent*, so an absent measurement is not read as a measured zero.
4. *A strip reports the grave's y at the tick it landed, and the gap left under the grave's rim at that y.*
5. *A strip taken at the bottom clamp reports a gap of nothing left*, which is the case section 7's finding is about.
6. *A fallen rung reports the ticks from its fall to its catch or its loss, and one still standing at the stop reports no span at all.*
7. *The bled-rung memory reports the ticks it was set, the times it was set, the times it cleared, and the growth that arrived while it was set without clearing it.*
8. *A strip with a boss on the field is told apart from a strip in the mow.*
9. *Every reading declares how a batch reduces it.* The existing fence, green over the new readings.
10. *Every reading declares what comparing it means.* The existing fence, green over the new readings.
11. *The harness reports and never judges.* The existing fence, green.

**What this slice is expected to turn red.** The new readings' own tests, `batchReport`'s and `compareRuns`' declaration tests, and both fence tests over the new declarations. **A realistic count is 5 to 10 files and the honest expectation is the top of that range**: the new reading modules and their tests, `readings/readings.ts`, `batchReport.ts`, `compareRuns.ts`, `__tests__/batchReport.test.ts` and `__tests__/compareRuns.test.ts`. A diff larger than that is a reason to check what you reached into.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures.
3. **Agent.** A batch with every new reading printed, and `tuning.damageTaken.weaponStrips` set beside the storm's 2.47 kills a second.
4. **Agent.** The fences green, each named by test title, including *every reading declares how a batch reduces it*, *every reading declares what comparing it means* and *the harness reports and never judges*.
5. **Agent.** The four version constants and `GOLDEN` untouched, with none of the four files in the commit.
6. **Human (Mark), and none of these blocks you.** Section 7's findings are his to answer, **and these numbers are the evidence beside the questions rather than the answers to them**. His own play is the answer.

### State of the branch

- The tip should be slice M1-stage's docs commit, `5421919529`, or a docs commit above it. **M5, M5-fix, M1-fix and M1-stage all land before you.** M5's events and its fourth food kind are what three of your readings are built from, and **M1-fix caps the floor ladder's score bleed** (Mark, 2026-09-16, record R4's closing amendment), which is why it lands first: a reading declared over the uncapped amount would measure a rule that was about to change. **Read `bleedScore` and the cap's own row in `tuning.ts` off the tree before you design the memory's transitions**, because the amount a bleed takes is now bounded and your own batch prints it.
- **At HEAD the four read `WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4 and `GOLDEN`'s checksum `-2049717150`.** **Read all four off the tree yourself and say what you read**, because M5, M5-fix, M1-fix and M1-stage all land between this line and you and a line here is not the tree. **Neither M1-fix nor M1-stage moves any of them**, so the four should read the same when you arrive.
- **You are permitted no `GOLDEN` re-pin and no version move of any kind.** **M6 moves none of the four.**
- **Slice M7 follows you** and pays the score's other inputs, and **it holds the step's second `READINGS_VERSION` move, 8 to 9**. It is not yours to start and its move is not yours to take. **Step 5.7 is the orchestrator's** and comes after it: the gates, then CodeRabbit on the exact tip, then a batch, then the deploy. **Gates before the reviewer, because a finding that changes code invalidates a review.**

### The stuck rule

**Two things are already known to be a stop:** any version constant or `GOLDEN` moving; and an existing reading whose meaning moved under this step, which is reported and never fixed with a bump. **And three things are ruled rather than open:** the version does not move and its file is not in the commit, the harness reports rather than judges, and a reading may take the run's state at the end of the tick where no event carries the fact. **A number that argues against something Mark ruled goes in the note for his read and is never applied.**

### What is not your job

- **Tuning anything.** The readings exist so the tuning step has numbers; **the tuning step is step 6** and the record's own note says so.
- **Judging the numbers.** ADR 0053.
- **Re-declaring strips, bleeds, lines stripped or seals**, all five of which `damageTaken` already carries as declared readings.
- **Changing the bot**, whose policy is ADR 0053's and whose bias is reported rather than corrected.
- **The gates, the review, the batch and the deploy**, all step 5.7's and all the orchestrator's.
- **Anything under `src/game` or `src/app`.**
- **The record's section 7 findings**, none of which any slice acts on.

---

## Slice 10 (M7): the score's other inputs (#99)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#99)`.

Slice M7 of The Hungry Grave: the score has two inputs and R4 rules five. A kill pays and growth past the size ceiling pays, and the three Mark named beside them, boss damage, the Waking's source killed, and large food taken after full power, pay nothing, so the number the HUD now draws and a high score would one day rank is still mostly a kill count. This slice pays the other three.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M7.

**Seven rulings shape this slice and none of them is yours to revisit.**

**First: score is one number fed by several inputs** (record R4, ruled by Mark on 2026-09-16, and ADR 0002 as superseded in place by step 5.0). His words: "Kills doesn't fully represent how well you've done. Kills, boss damage, whether you killed the Waking source, how many large food items you got after full power, (more?) ... there's plenty that can feed a number score." **The three further inputs are exactly those three and you add no fourth**, and **he left the list open**, so a fifth is his and not yours. **The kill's row and the overflow both keep their exact meanings**: this slice adds beside them and trades nothing.

**Second: boss damage is paid per hit landed, never as a lump on the kill** (record R4's own paragraph). `damageBoss` (`src/game/bosses/phases.ts`) is the one site where the storm reaches a boss and it is where the payment goes. **A hit absorbed by the phase flash pays nothing**, because it took no health, and `damageBoss` already reports that case as an amount of zero. **What a hit pays for is the health the phase actually lost, clamped to what the phase had left, and never overkill.** `damageBoss` subtracts unclamped today, `boss.hp -= amount`, so a bell hit for 104 onto a phase holding 3 reports 104 as its amount while taking 3 of health; the payment reads the health taken and not the amount reported. **Two tests hold it: a phase-emptying hit pays the remainder, and a whole fight sums to `PHASE_HP` at your rate.**

**"Damage" is Mark's word and "per hit" is R4's reading of it**, and you are told which half is his because you are told none of this is revisable: the input he named is boss damage, and the per-hit shape is the record's. **The shape is ours rather than the genre's, and the note says so**: the research found that almost nothing ships boss damage as a per-hit trickle, DoDonPachi and DaiOuJou counting hits and paying one lump afterwards and Ikaruga and Sky Force paying a clock, with Ikaruga the one genuine per-damage-tick payer and its own community calling that the least important scoring element in the game. **The reason the lump is refused is ours and it is in R4**: a lump at the kill pays nothing to a run that fought the Undertaker for ninety seconds and sealed before the last phase emptied, and ADR 0007 says the player's storm must always matter. **The case is narrower than it reads and your note says so**: the first floor hit bleeds the whole of the banked score, boss damage included (`grave.ts`, `bleedScore`), so per hit beats a lump only for the hits landed after the last bleed. Item (i) is where that difference is measured rather than argued.

**Third: the Waking's source killed is one bonus on the kill and never a rate** (record R4). `damageSetPiece` (`src/game/stage/setPiece.ts`) already fires `setPieceKilled` on the tick the source's health empties, and that is the payment site. **It is binary because what Mark named is binary**, whether you killed it, so a hand that chipped 2,000 of its 2,400 health on the way past is paid nothing and that is the rule rather than a harshness to soften. **The pour is untouched** (#104, Mark's own ruling): the remaining budget keeps pouring from the pour point, so the bonus never ends the player's own food early, and **the row's comment says that killing it denies nothing**, because a later reader will otherwise reach for Robotron's denial premium or Xevious's milk-then-deny greed decision and neither applies here.

**Fourth: "full power" is every rostered line standing at `MAX_LEVEL`, and "large food" is the rich tier** (record R4, both paragraphs, and neither is open). Not the grave at its size ceiling: ADR 0003 says size is health in those words, and growth past the ceiling **already pays as the overflow**, so reading full power as the ceiling would pay twice for one moment. **The predicate already exists and you call it rather than writing a second one.** `offerableLines` (`src/game/offer.ts`) filters `state.roster` against `MAX_LEVEL`, which is 5 (`src/game/lines/roster.ts`), so the state you want is a roster with no offerable line left in it, `offerableLines(state).length === 0`. **`swallow.ts` asks `offer.ts` that question**, by that call or by a named helper beside it in that file, and **the roster-at-cap rule never gets a second copy**. **`CONTEXT.md`'s word for the state is maxed**, so maxed is the word in the name and in the comment whatever R4's prose calls it. The genre reads the phrase the same way: Touhou EoSD's "full power" is max shot power, and the items taken after it pay score, escalating to 51,200 (`reward-delivery-models.md` finding 5, cited by the research's section 3, and the design gate's own sources, touhouwiki and Giant Bomb). **Large food is the feast and the rich corpse**, which is `corpseTier` on the mob table and `spawnFeast`'s own `tier: 'rich'`; the revenant is the one mob row that leaves one. **The power-up is out**, because at a maxed ladder it is already the option-less body `CONTEXT.md`'s Overflow entry rules. **So the input is: a swallow whose tier is rich, taken while every rostered line stands at `MAX_LEVEL`, counted as items and never as a fraction of a unit**, which is what "how many large food items" says.

**Fifth: the weights are yours, from the research, and each one is annotated with what it was set against and its ratio to a trash kill** (record R4 and section 4's M7 paragraph, and the standing rule that a number which must exist before it is measured is data). **They are data rows beside `TRASH_KILL_SCORE` in `tuning.ts`**, stated as multiples of it exactly as `TRASH_KILL_SCORE`'s own JSDoc says every mob row states its payout, **and never a number typed inside a function and never a number typed in a test**. The research is `apps/hungry-grave/docs/research/score-inputs-precedent.md` and **its section 4 carries the band and the derivation**; you may land anywhere inside that band with your reason written down, and landing outside it is a finding you state rather than a choice you take quietly.

**Sixth: this slice declares one new event, the score's own** (record R4's last paragraph). Nothing in the tree carries the score a payment paid except `overflowed`, and a reading that decomposes `run.score` into its inputs cannot be built from what exists: `mobKilled` names the type and not the score, and `mobDamaged` wears the same shape for a mob, a boss and the source alike. **The new event carries which input paid, how much, and the running total, and it fires at every payment including the kill's and the overflow's.** `overflowed` keeps its own fields untouched, because it answers a different question, a swallow that could not pay its normal way (ADR 0003), rather than the score's ledger moving. **Two events on the overflow's tick is the named cost and it is accepted eyes open**, because the alternative puts the payment rule's arithmetic in a second module inside `src/dev`.

**Seventh: `READINGS_VERSION` moves 8 to 9 and it is not optional** (orchestrator, 2026-09-16, under one-push mode, correcting the record's section 5 exactly as it was corrected for M1; the correction is written into the record's section 4 M7 paragraph). **`run.score` changes meaning for the second time in this step**: at version 8 it means the kills a run made plus the overflow, and after you it means those plus boss damage, the source kill and the rich food taken at full power. Same name, same shape, same reduction, a different quantity, which is `readingsVersion.ts`'s own stated rule and is the case version 8 was itself written for. **`tuning.damageTaken.scoreBled` rides with it**, for the reason M1 decided it does: it is denominated in the quantity that changed. **Your own new per-input readings move nothing**, because new readings beside unchanged ones never do, and the note says that plainly because it is the half a reader will expect to be the cause.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **ruling R4 in full, and above all its five paragraphs on the further inputs, which are the whole of this slice**, then section 3.4, **section 4's M7 paragraph in full including its `READINGS_VERSION` and `GOLDEN` paragraphs**, section 5 for the budget and for the paragraph M7's entry corrects, section 6's test sentences, and **section 7's findings, none of which you act on and one of which, that a hit costs points so clean play scores higher, is explicitly Mark's to overrule once your inputs are in**.
4. `apps/hungry-grave/docs/research/score-inputs-precedent.md` **whole**, which is this slice's own research: section 0 for what the tree already pays, sections 1 to 3 for the precedent per input, and **section 4 for the band every weight is set inside and the derivation behind it**. **A weight leaning on a WEAK item says so**, and section 5 says what could not be found.
5. `apps/hungry-grave/docs/research/reward-delivery-models.md` **finding 5 and its Touhou, Truxton, Twin Cobra and Raiden entries**, which hold the max-power conversion figures and are cited rather than repeated by the file above.
6. `apps/hungry-grave/docs/adr/0002-corpses-are-fuel-and-carriers-meter-power.md` **as step 5.0 superseded it, its 2026-09-16 paragraph above all**, plus `0003-size-is-health.md` for the overflow and the size ceiling, `0007-bosses-always-shootable.md` in full for why a boss must always be worth hitting, `0042-a-set-piece-names-the-property-it-must-keep.md` for the Waking's property, `0050` for the source that is dormant until it opens, `0019` for the fold and the refusal rule, and `0024` for the closed append-only fault identity list.
7. `apps/hungry-grave/CONTEXT.md`, the entries **Score**, **Overflow**, **Feast**, **Treasure**, **The Waking**, **Set piece**, **Boss**, **Phase**, **Rung** and **Dive**. **Read the Avoid lists before naming anything**, and note that the Score entry already says what else feeds the number is open.
8. `apps/hungry-grave/docs/push/step-5-progress.md` **section 7 in full**, which is M1 building the kill input and is the nearest precedent to yours: the row shape, the payment site, the two kill paths it deliberately left unpaid as your gap to close, and the readings move it took. **Section 12 beside it** for M6's two readings and its held version.
9. `apps/hungry-grave/docs/push/round-two-progress.md` **section 9**, slice I declaring a reading and writing a version note, and **section 15's readings item**.
10. The tree, by function and never by line: `src/game/mobs.ts`'s `MOB_TYPES`, `scorePayout`, `TRASH_KILL_SCORE` and `damageMob`; `src/game/tuning.ts`'s `TRASH_KILL_SCORE` JSDoc, `FEAST_PAYOUT` and `RESERVOIR_CAPACITY`; `src/game/bosses/phases.ts` whole, `PHASE_HP`, `damageBoss`, `breakPhase` and `killBoss` above all; `src/game/stage/setPiece.ts`'s `damageSetPiece` and `SET_PIECE_HP` in `src/game/stage/waves.ts`; `src/game/stormTargets.ts`'s `damageStormTarget`, which is the one seam routing to all three; `src/game/swallow.ts` whole; `src/game/corpses.ts`'s `Corpse`, `spawnCorpse` and `spawnFeast`; `src/game/offer.ts`'s `offerableLines` and `standOffer`; `src/game/lines/roster.ts`'s `MAX_LEVEL`; `src/game/run.ts`'s `RunState`; `src/game/events.ts` whole; `src/game/grave.ts`'s `bleedScore` and `runFloorLadder`; `src/game/invariants.ts` and `src/game/faults.ts`; `src/dev/digest.ts`'s `runScenario` and `GOLDEN`; `src/dev/readings/readings.ts` and two siblings read whole as the shape to follow, **`wakingSwallows.ts` above all**, which already reports null rather than zero for a run that never opened the Waking; `src/dev/readings/damageTaken.ts`; `src/dev/batchReport.ts` and `src/dev/compareRuns.ts`; `src/dev/readingsVersion.ts` **whole, version 8's paragraph above all**, because yours is written in its voice.

### The definition, in observable terms

After this slice: a hit that takes health off a boss pays score on the tick it lands, for the health the phase actually lost and never for the overkill, and a hit absorbed by a phase flash pays none. Killing the Waking's source pays one bonus on the tick its health empties, and leaving it alive pays nothing however far it was chipped; the pour is unchanged either way. A swallow whose tier is rich, taken while every line in the run's roster stands at `MAX_LEVEL`, pays a bonus per item on top of the growth, the reservoir charge and the overflow it already pays. **A kill still pays exactly what it paid, and growth past the size ceiling still converts exactly as it did.**

A batch prints the score decomposed: what each input paid, per run, beside `run.score` itself, so the number can be read as its parts rather than as one total.

**Nothing draws.** The HUD already carries the score and it carries a bigger number now; no renderer is opened and nothing under `src/app` is touched.

`WITNESS_VERSION` still reads 11 and `FORMAT_VERSION` still reads 4. **`READINGS_VERSION` reads 9**, `GOLDEN` is untouched, and `pnpm verify` is green.

What a player meets: the number is no longer a kill count wearing another name, and what it ranks is the run rather than the mow.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m7`. **Slices M1 through M6 must all be in the tree**; if any is missing, that is a stop. **Read all four constants yourself rather than off any line in this file**, because M4, M5 and M6 land between this block being written and you.

**(b) The tests first, red.** Write the three payment tests and the score-event test first, each expressed against the row and against the rule rather than against a number typed in the test. **A number in a test is a stop; a row the test reads is the rule.**

**(c) The three weights, and this is where the research is spent.** Three data rows in `tuning.ts` beside `TRASH_KILL_SCORE`, each stated as a multiple of it or as a rate against it, each with a JSDoc saying what it was set against, its ratio to a trash kill, and that it is a first figure. **The research's section 4 gives the band: a single input worth 20 to 70 trash kills, which is 2,000 to 7,000 points against a measured run's 12,400 to 58,112.** Its derivations, which you check rather than copy:

- **Boss damage.** The mob table pays one trash kill per 8 points of health, floored, and that rate applied to a boss pays 637 trash kills for the Undertaker's 5,100 health, more than a whole run makes. **Roughly 100 points of boss health to one trash kill** puts the Banshee's 2,200 at 22 and the Undertaker's 5,100 at 51, both inside the band, and the figure is read off `PHASE_HP` rather than typed. **State the ratio to a trash kill per point of health taken, and state what a whole fight pays at your figure**, because the second is the number that says whether it swamps. **The row carries the rate and names `PHASE_HP` as the other factor; the 22x and the 51x are derived in prose**, in the row's JSDoc and in your note, and never typed into the row, because a step 6 retune of `PHASE_HP` moves both of them and a typed figure would quietly go stale. **Pin the swamping refusal with a test that reads the row and `PHASE_HP` and types no number of its own.**
- **The source killed.** The genre puts a spawner at 6x to 10x a trash kill and a structural core or objective at 30x to 130x, tightly and across three games from two studios on the first tier and four games on the second. **The Waking's source sits between them and the research says why**: it is the section's objective rather than roadside furniture, and killing it denies nothing because #104 keeps the pour running, so none of the denial premium the spawner tier pays for applies. At the same 100-health rate its 2,400 health is 24 trash kills, which lands in that gap and is derived rather than picked.
- **Large food at a maxed ladder.** **No game in the pass scores food, so there is no direct anchor and the note says so**, but the conversion itself is the genre's own convention from Toaplan in 1988 through the modern bullet heavens, and the research's section 3 has twenty sourced games. **What transfers is the band and the two named failure modes.** The band: a surplus pickup pays a few thousand against an arcade clear bonus of a million, and 25 gold against a whole run in Vampire Survivors. The failures, both with a community's verdict attached: **too small to bother with**, which is Great Mahou Daisakusen's "extremely minuscule ... safely ignore" and Battle Garegga's own "not recommended", and **large enough to farm**, which is Gunbird's scorers suiciding to stay at max and DoDonPachi's MAXIMUM bomb bonus becoming the entire high-level game at about 260 million a run. **Bayonetta's shape is the nearest structural match and is worth a look before you pick**: the payout scales with the pickup's tier, 50 halos for the half-bar item and 100 for the full one. **What binds hardest is the count, and you measure it**: item (i) prints full-power rich swallows per run, and the weight is set so the whole input across a run lands in the same band as one boss fight rather than above it. **A measured count of zero is a finding to explain before it is a result**, because the bot only dodges and may never max the ladder; say so, and set the figure against the count a hand would plausibly reach with the reason beside it.

**(d) The payment sites, all four, each where the thing is resolved.** Boss damage in `damageBoss`, where the health comes off, and not in `damageStormTarget`, which routes and owns nothing. The source's bonus where `setPieceKilled` is raised, in `damageSetPiece`. The rich swallow taken at a maxed ladder in `swallow.ts`, where the swallow is resolved and where the overflow already pays. **The kill's site does not move**: M1 put it in `damageMob` and it stays there, and **`mobs.ts` opens only so that site can raise the score's event**, with everything else it pays left exactly as it is. **M1 deliberately left the boss and the source unpaid on the cited-future rule and named them as your gap** (`step-5-progress.md` section 7); that gap is what you close, and you close no other.

**(e) The score's own event.** One new event carrying the input, the amount and the running total, fired at every payment including the kill's and the overflow's. **The input names are a closed union and every payment site uses one**, so a payment with no name is a compile error rather than a reading with a residual it cannot explain. **`overflowed` is not widened and not narrowed.** **Nothing in the tape changes**, because no sim event is ever encoded into a tape at all and a replay rebuilds every event from the seed and the commands, which is the reason every readings version note since version 5 has been able to say `FORMAT_VERSION` holds.

**(f) The readings, and the version moves with them.** **`READINGS_VERSION` 8 to 9, in the same commit as the payment changes**, because `run.score` changes meaning on the tick that commit lands. **Version 9's own note is a dated paragraph in `readingsVersion.ts` in the voice versions 7 and 8 already use**: `run.score` named as the reading whose meaning changed and how, **every batch before this commit named as incomparable with every batch after it on that key**, `tuning.damageTaken.scoreBled` named as moving with it and why, every other reading named as still meaning what it meant, and **your own new readings named as not being what moved it**. **Check the rest of the readings for the same exposure before you write it and list what you checked**, M1's way.

**One new reading module or one arm on an existing one, your call with the reason in the note**: the score decomposed by input, per run, **built from the new event and never from the run's own state**, which is the rule `src/dev` runs on. **Name what each arm's denominator is**, because a reading whose denominator is not written down is the reading `readingsVersion.ts`'s worked example exists to warn about. **A run that never met a boss reports nothing on that arm rather than zero**, on `wakingSwallows.ts`'s own terms: a zero would say the player fought one and scored nothing off it.

**The decomposition is gross and `run.score` is net, and the reading says so in its own declaration.** The floor ladder bleeds the whole of the score (`grave.ts`, `bleedScore`), so in any run that hit the floor the parts will not sum to `run.score` and the difference is `tuning.damageTaken.scoreBled`. **That is the residual a reader would otherwise call a bug**, and naming it is what keeps the reading honest.

**(g) The invariant, and decide whether it needs one.** Four payment sites and three data rows is where a negative or a reversed sign stops being caught by anything: **the state that must never exist is a score below zero**, and it is stateless, which is what makes it an invariant rather than a test. Express it in `invariants.ts` **beside `checkScoreRung`**, with every existing check keeping its meaning and its severity. **You are permitted at most one appended fault identity**, at the end of `FAULT_IDENTITIES` with its severity-table entry, which moves nothing else (ADR 0024, closed and append-only); **an appended identity moves `faults.ts`'s own JSDoc counts with it**, currently twenty-three identities against twenty-four checks and seventeen recoverable against seventeen, so move every count the append changes and say which you touched. **If an existing identity honestly carries it, use that and say so**, and if you conclude no invariant is warranted, say that instead with the reason; what is not acceptable is silence.

**(h) `GOLDEN`, checked and expected to hold.** Run `digest.test.ts`. **It should be green and the checksum should stay at M1's pin.** None of your three inputs can fire inside the canonical scenario, and `GOLDEN`'s own fields say so rather than an argument saying it: **the boss arm's real proof is the section rather than the draw**, because all six hundred ticks fall inside the Procession and the Procession runs on past them, which is `digest.ts`'s own words, so no boss is ever on the field to hit; `drawn.bossFire` at 0 corroborates it, `drawn.pour` is 0 so no set piece ever opened in the window, and the `levels` record reads `skullStream: 1` with the other three at 0, which is four rungs short of `MAX_LEVEL` on the one line that has any. **So the two scripted shambler kills pay exactly what they pay today and `score` holds at 200.** **A red digest is a stop and report**, not a re-pin, because it says a payment is firing somewhere the ruling does not put one. **You hold no re-pin permit at all.**

**(i) The measurements this slice owes.**

- **A batch at your tip** on the configurations and seeds M1 and M6 used, with the score decomposed by input printed beside `run.score` and beside M6's own two readings. **Say plainly that `run.score` and `tuning.damageTaken.scoreBled` are incomparable with every earlier batch's**, which is item (f)'s whole subject.
- **Each input's share of a run's score, as a percentage**, so the swamping question is answered with a number rather than an argument. **The research's band converts to 3 to 56 percent of a measured run for a single boss fight**, at the band's two ends against that batch's, and it is that wide because the batch's denominator includes runs that never reached a boss at all. **The honest denominator is a run that did reach one, and that is the one you print**; say where yours lands and say so if it is outside.
- **Rich swallows taken at a maxed ladder, per run**, which is what the third weight is set against, with the count stated even when it is zero and **a zero explained rather than reported**.
- **Boss hits landed and boss health taken per run**, so the per-hit rate can be read against what a fight actually pays rather than against its full health bar, since most runs never empty one.
- **Boss score paid beside boss score that survived to the end of the run**, because a floor hit takes a capped slice of the bank under M1-fix and those are two different numbers. The pair is what says whether per hit bought anything over a lump, and it is the evidence under the ruling's own reason.
- **M1-fix's cap row re-read against this batch.** Its band was argued against a run's gross and your three inputs are what inflate that gross, **so the row is read against the new gross here and what you read goes in the note as a finding for the tuning step**, never as a row you move.
- **Replay determinism at your tip.** One seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors. **A witness move here would be a stop**, and this run is how you prove there was not one.
- **A conditioned tape measured to `outcome: 'verified'`**, at a rig that reaches a boss, because every one of your inputs is silent in a run that never leaves the Procession.

**(j) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the score is fed by boss damage, the source killed and a meal taken at a maxed ladder (#99)`.

**(k) The progress note**, section **13**. Beyond the contract's list, say: the three weights with what each was set against, its ratio to a trash kill and what a whole fight or a whole run pays at it; the four payment sites named; the new event with its closed union of input names and the double announcement on the overflow's tick named as the accepted cost; `READINGS_VERSION` 9 with version 9's note quoted, the readings you checked for the same exposure and what you decided about `tuning.damageTaken.scoreBled`; the reading you built with each arm's denominator; the invariant and whether an identity was appended and which `faults.ts` counts moved; the batch figures with each input's share and the incomparability stated; and `WITNESS_VERSION` 11, `FORMAT_VERSION` 4 and `GOLDEN` all named as held, each read off the tree.

**The same docs commit adds one line to the record's section 7, for Mark's read and for nothing else**: the three readings of his phrase he has not seen, **full power read as the ladder maxed**, **large food read as the rich tier with the power-up out**, and **the source paying only on the kill**. It records what was read into his words so that he can overrule any of the three; it is not a finding acted on, and you act on none of section 7's.

**(l) Stop and report.** Under 250 words. **You are the step's last building slice**; step 5.7 is the gates, then CodeRabbit on the exact tip, then a batch, then the deploy, and all four are the orchestrator's.

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 11.** Nothing here is folded state: every value the four payments read is already folded, `run.score`, `grave.size`, `state.levels`, `state.roster` and the corpse pool alike, and **no tally lives on `RunState`**. A field you find yourself wanting on the run is a reading you have put in the wrong module, and it is a stop before it is written.
- **`FORMAT_VERSION` 4.** No sim event is ever encoded into a tape, so a new event costs no bytes. A new fault identity is append-only and moves no byte's meaning (ADR 0024).
- **`GOLDEN` as M1 pinned it.** You hold no re-pin permit. A moved digest is a stop and report.
- **`READINGS_VERSION` moves exactly once, 8 to 9, in the same commit as the payment changes.** A second move is a stop.
- **The kill's row, its payment site and the overflow's, all exactly as they are.** `TRASH_KILL_SCORE` does not move, no `scorePayout` on any mob row moves, the cairn's deliberate exception stands, and `swallow.ts`'s overflow keeps its exact meaning. **The score gains three inputs and trades nothing.** **The row's value and the payment's amount both hold while the site gains the event**: `mobs.ts` opens for the announcement and for nothing else, and a kill pays after you exactly the points it paid before you.
- **The pour is untouched by the source's death** (#104, Mark's ruling). The bonus reads `setPieceKilled`; it changes no budget, no clock and no close reason.
- **ADR 0007's no-push rule and the phase flash.** A flash-absorbed hit still reports and still applies nothing, and now pays nothing; `PHASE_HP`, the flash length and the phase counts do not move.
- **The three ladder events, `scoreBled`, `weaponStripped` and `sealed`, stay three**, and `bleedScore` still takes the whole of the score however many inputs fed it.
- **`overflowed`'s fields.** Not widened, not narrowed, not retired.
- **Every existing reading's meaning except `run.score` and `tuning.damageTaken.scoreBled`**, and every existing invariant's meaning and severity, every cap, `STREAM_SALTS` and `STREAM_ORDER`.
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty. **`src/game` stays dependency-free**, and `src/dev` reads events and never writes the run.
- **No test is deleted, skipped, weakened or rewritten to reach green.** A measured baseline that moves is re-measured with its comment saying what moved and why.
- **Nothing under `src/app` is in this slice at all.** The HUD draws a bigger number and needs no change to do it.
- **No ADR is filed or amended.** ADR 0002's supersession is step 5.0's and it is done.

### Seams under test

`src/game/bosses/phases.ts`: a landed hit paying score from its own row, and a flash-absorbed hit paying none. `src/game/stage/setPiece.ts`: the source's death paying one bonus, a chipped-but-living source paying nothing, and the pour unchanged either way. `src/game/swallow.ts`: a rich swallow at a maxed ladder paying its bonus, the same swallow one rung short paying none, and a trash swallow at a maxed ladder paying none. `src/game/tuning.ts`: the three rows. `src/game/events.ts`: the score's event, its closed union of inputs, and every payment naming one. `src/game/invariants.ts`: the state that must never exist. `src/dev/readings/`: the score decomposed, with each arm's denominator. `src/dev/readingsVersion.ts`: the version moved, with the reason in its own prose.

### Module boundaries

**Nothing is created, deleted, merged or split in `src/game`, and no import direction changes.** Each weight lives in `tuning.ts` beside `TRASH_KILL_SCORE`, because that is the file the score's unit already lives in and a helper joins the file whose concept it serves; each payment lives in the module that owns the thing being paid for, which is why there are three sites and not one. **The score's event is declared in `events.ts` with the others**, and no module learns what any other module pays. **At most one reading joins the readings folder as its own concept module**, named for what it measures, with its public interface at the module's end; `src/dev` imports only from `src/dev`, `src/game` and `src/tape`, which is a fence by name. **No new library enters.**

### The planned test list

1. *A landed hit on a boss pays score from its own row, and what it pays for is the health the phase actually lost.*
2. *A hit that empties a phase pays for the health that was left and never for the overkill*, so a hit for 104 onto a phase holding 3 pays for 3.
3. *A hit absorbed by the phase flash pays no score*, because it took no health.
4. *A whole fight pays `PHASE_HP` at the row's rate*, summed over every hit that landed, read from the row and from `PHASE_HP` with no number typed in the test. That is the swamping refusal pinned.
5. *A boss fought to its last phase and never killed has still paid for every hit that landed*, which is the whole reason the payment is per hit.
6. *Killing the Waking's source pays one bonus once*, and a second hit onto a body already taken pays nothing.
7. *A source chipped and left alive pays nothing at all*, because what was named is whether it was killed.
8. *Killing the source does not change the pour*: the same budget, the same clock and the same close reason as a source nobody touched.
9. *A rich swallow taken at a maxed ladder, every rostered line at its top rung, pays its bonus, on top of the growth, the charge and the overflow it already pays.*
10. *The same swallow with one rostered line below its top rung pays no bonus*, so the condition is every line and not any line.
11. *A trash swallow at a maxed ladder pays no bonus*, so the tier is the rule and not the timing alone.
12. *A line outside the run's roster never holds the bonus back*, because the roster decides what a run has.
13. *Every score payment raises the score's event naming its own input*, asserted over all five inputs, so a payment with no name cannot exist.
14. *The overflow still pays exactly as it did, and still raises `overflowed` with its own fields.*
15. *A kill still pays exactly its row*, the half that did not change, asserted so it cannot drift out.
16. *The score is never negative.* The invariant, through the harness rather than by reaching into the check.
17. *A replay rebuilds the score at every checkpoint*, with no new folded field.
18. *A batch reports the score decomposed by input, and the parts sum to every point the run was paid.* **They do not sum to `run.score` in a run that hit the floor**, because the ladder bled the whole of the score and the decomposition is gross while `run.score` is what survived; say which of the two each arm is, in the reading's own declaration, because this is exactly the residual a reader would otherwise call a bug.
19. *A run that never met a boss reports nothing on that arm rather than zero.*
20. *Every reading declares what comparing it means.* The existing fence, green over yours.
21. **The fences**, green, each by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
22. **The golden digest**, green and unmoved, because no input of yours can fire inside the canonical scenario.

**What this slice is expected to turn red.** `phases.test.ts`, `setPiece.test.ts`, `swallow.test.ts`, `tuning.test.ts`, `run.test.ts` and `invariants.test.ts` wherever score is asserted, `events`' own consumers, `batchReport`'s and `compareRuns`' declaration tests, `measure.test.ts`'s rich fixture and `replayTallies`' tests, which ride on `run.score` and are the same change under another name, and **`mobs.test.ts`'s exact event-array pin on the kill**, the test named *kills at or below zero health, frees the slot, leaves a corpse and reports the kill*, which asserts the kill's events with `toEqual` and goes red the tick the score's event joins them. **`harnessPolicy.test.ts` is not on this list**, because its measured per-seed baselines carry no score at all. **Any measured baseline that does move is re-measured with the reason beside it and never re-pinned blind.** **A realistic count is 16 to 26 files.** A diff much smaller is a reason to check what you have not reached.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit.
3. **Agent.** `READINGS_VERSION` 9 stated with what the move costs, and `WITNESS_VERSION` 11, `FORMAT_VERSION` 4 and `GOLDEN` each read off the tree and named as held.
4. **Agent.** The golden digest green and unmoved, stated as a check taken rather than an assumption.
5. **Agent.** Replay determinism on one seed under `shaky-short`, which is also the proof that no fold moved, and a conditioned tape at a rig that reaches a boss measured to `outcome: 'verified'`.
6. **Agent.** A batch with the score decomposed, each input's share of a run printed, and the incomparability stated.
7. **Agent.** The three weights each stated with its ratio to a trash kill and what it was set against, and each named as a first figure.
8. **Agent.** The fences green, each named by test title, including *every reading declares what comparing it means*.
9. **Human (Mark), and none of these blocks you.** The record's section 7 carries the finding that a hit costs points so clean play scores higher, **and it says in its own words that it is his to overrule once M7's other inputs are in and the number means more than kills**. Your batch's per-input shares are the evidence beside that question. **He reads it on the deploy at step 5.7.**

### State of the branch

- The tip should be slice M6's docs commit.
- **`WITNESS_VERSION` 11, `READINGS_VERSION` 8, `FORMAT_VERSION` 4, and `GOLDEN` as M1 pinned it or as M5 explained it.** **Read all four off the tree yourself and say what you read**, because M4, M5 and M6 all land between this block being written and you, and a line here is not the tree.
- **You are permitted one version move, `READINGS_VERSION` 8 to 9, and nothing else.** No `GOLDEN` re-pin, no witness move, no format move.
- **You are the step's last building slice.** Step 5.7 is the orchestrator's: the gates, then CodeRabbit on the exact tip, then a batch, then the deploy. **Gates before the reviewer, because a finding that changes code invalidates a review.**

### The stuck rule

**Five things are already known to be a stop:** any of M1 through M6 missing from the tree; a `GOLDEN` move, a witness move or a `FORMAT_VERSION` move; a payment that wants a field on `RunState`, which is a reading in the wrong module and is reported before it is written; an existing reading other than `run.score` and `tuning.damageTaken.scoreBled` whose meaning moved, which is reported and never fixed with a further bump; and a weight you cannot set inside the research's band with a reason, which is stated rather than taken quietly. **And four things are ruled rather than open:** the three inputs are exactly the three Mark named and you add no fourth, boss damage pays per hit and the source pays on the kill, full power is every rostered line at `MAX_LEVEL` and large food is the rich tier, and `READINGS_VERSION` moves once here. **A number that argues against something Mark ruled goes in the note for his read and is never applied** (record section 7's own standing rule). **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **A fourth score input.** Mark left the list open and a fifth is his (#135 is the high score list his ruling also asked for, and it waits on the step 6 store).
- **The boss farm, which is #136.** No boss times out and the Undertaker digs a paying body up every ninety ticks for as long as the fight runs, so a player who holds the last phase alive can farm score at him without bound. **M1 opened it when a kill first paid and M7 neither widens it nor closes it**; your three inputs add nothing to it and the ticket is where it waits.
- **Tuning any of the three weights past a first figure.** The tuning step is step 6 and the record's own note says so; you set a figure, annotate it, and name what it gets tuned against.
- **Anything under `src/app`**, including the HUD, the score's countdown and the fallen rung.
- **Declaring M6's two readings**, which are M6's and are already in the tree.
- **Judging the numbers.** ADR 0053: the harness reports and never judges.
- **The record's section 7 findings**, none of which any slice acts on, and **the one about a hit costing points is Mark's to answer with your batch beside it**.
- **The gates, the review, the batch and the deploy**, all step 5.7's and all the orchestrator's.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**
