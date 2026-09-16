# Step 5 slice prompts: show what you have

One block per slice, in the design record's section 4 order. The launch preamble is the same for every slice: name the playbook, name the record sections carrying the dispatch contract items, then give the slice.

**Step 5's coder contract is `step-4-coder-contract.md`, unchanged and still binding.** It carries how to work in the worktree, the commit and review rules, the progress note, the verification commands, what must not move in any slice, what is never a slice's job, and the stuck rule. Every block below names it and holds only what is its own.

**Three standing overrides of that contract, and they apply to every block below.**

1. **The ticket in the commit message is this slice's own, not `#39`.** The contract's "(#39), which is the ticket every step 4 docs and code commit cites" is step 4's. Step 5 runs on two tickets and a slice cites the one whose acceptance criteria its own done line closes: **#72** for the frame and the composed play space (slice M2), **#99** for the ladder being legible and a loss being watchable (step 5.0 and slices M1, M3, M4, M5 and M6). Where a slice closes criteria on both, the commit cites the one above and the progress note names the other by criterion.
2. **The progress note is `apps/hungry-grave/docs/push/step-5-progress.md`, not round two's and not step 4's.** The section numbers are fixed: **step 5.0 is 6, M1 is 7, M2 is 8, M3 is 9, M4 is 10, M5 is 11, M6 is 12.** Sections 1 to 5 are the cross-slice facts and every slice writes its own rows into them. Round two's note and step 4's note are read and never appended to.
3. **Scratch under `local/` goes in `local/step5/`, and every file in it carries your slice's name**, because the scratchpad and `local/` are shared between agents and a generic baseline filename gets clobbered by another agent's. Nothing under `local/` ever enters a commit.

**The design record is `apps/hungry-grave/docs/design/show-what-you-have.md`.** Its section 2 is twelve rulings, each final, and **no slice reopens one**. Its section 3 is what the tree held when it was written. Its section 4 is the slices. Its section 5 is what must not move, including the step's whole version budget by slice. Its section 6 is the verification list and the test sentences. Its section 7 is seven findings already filed for Mark, which **no slice acts on**. Its section 9 is the orchestrator's seven rulings on the record.

**The research record is `apps/hungry-grave/docs/research/portrait-hud-and-catchable-loss.md`**, cited by section throughout the design record. It carries its own DOCUMENTED, SECONDARY and WEAK labels and a slice leaning on a WEAK item says so.

**Every craft value in these prompts is the record's and is cited to its ruling. Where the record says measure first and declare after, the prompt names the measurement and the slice takes it.** A number that is not in the record and not measurable before the code exists is a data row the coder picks, annotates as a first figure, and names in the note as open; it is never a compiled constant and never a number invented in a test.

**The version constants and `GOLDEN` as of slice J2's fold commit `3351044752`, which is the tip these prompts were written against.** `WITNESS_VERSION` **9** (`src/game/witness.ts`), `READINGS_VERSION` **5** (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` **4** (`src/tape/wireCodes.ts`), `GOLDEN`'s checksum **`1275540894`** (`src/dev/digest.ts`), with `score: 0`, `mobs: 5`, `corpses: 1` and `kills: 2` inside it. **Slice J2 may still be landing while step 5.0 starts**: its second code commit moves `READINGS_VERSION` 5 to 6 and its docs commit follows, so **every slice re-reads all four off its own tip before it leans on any of them** and reports what it read. The design record's section 5 was written when the witness read 8; it says the witness moves exactly once in this step, and from J2's tip that move is **9 to 10**.

**Section 5's "`READINGS_VERSION` does not move in this step at all" is corrected rather than obeyed, by the orchestrator on 2026-09-16 under one-push mode.** `run.score` is a declared reading in `batchReport.ts` and `compareRuns.ts`, and slice M1 changes what it means, which is `readingsVersion.ts`'s own stated case for a bump; the record's sentence was written before that was seen and its stated reason covers only M6's two new readings. **So the step carries one `READINGS_VERSION` move, 6 to 7, in slice M1 and nowhere else**, and M6's two new readings still move nothing because new readings beside unchanged ones never do.

**Line numbers are never cited in these prompts and never relied on. Find the name, never the line.** The record's section 0 says the same and says why: every slice moves some of them.

---

## Step 5.0: the docs commit, ADR 0054 amended and the glossary gains three terms (#99)

Model: Opus, subagent type general-purpose. **One docs commit and no code commit at all.** The message ends in `(#99)`.

Step 5.0 of The Hungry Grave: the records that step 5 builds against are put right before any coder reads them, because two of them say "projectiles" about a line that has none and one of them puts the HUD somewhere the measurements say it cannot go.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to step 5.0.

**No coding slice may start until this commit is in the tree**, which is the same rule round two's ADR commit carried: a HUD test written against `CONTEXT.md`'s current HUD entry would be written against a placement the measurements refuse.

**Four rulings shape this commit and none of them is yours to revisit.**

**First: ADR 0054 is amended in place, same question and new answer, and its number and title do not move** (record R8 and section 9 ruling 3). The decision did not change; the word "projectiles" did, because Territory has no projectiles at all. Its level curve is `RADIUS_BY_LEVEL`, an area rather than a count, so one line of the four cannot satisfy the field channel as worded and no amount of building will make it. **The amendment is one word's worth: a line's rung is carried by that line's own expression on the field.**

**Second: the amendment carries ADR 0058's own overrule line, because ADR 0054 is one Mark ruled.** A step's docs slice editing a Mark-ruled ADR is not the same as one editing ours, so the amendment ends with the sentence ADR 0058 already uses for this case, that it is taken under one-push mode and is Mark's to overrule on the branch before merge. **It is also the record's section 7 second finding, so it reaches his read and not only the tree.**

**Third: `CONTEXT.md`'s HUD entry is amended and the amended text is written out for you** (record R9, section 4 and section 9 ruling 2). Do not compose it. The entry today says the readout sits "inside the field frame", and section 3.1 measures a phone's side gutter at exactly zero and a desktop's top band at exactly zero, so the frame's inside is not a home both shapes have. **Precedent outranks our own record where they disagree, which is Mark's rule of 2026-09-09.**

**Fourth: the 540 by 760 doc fix is struck rather than carried** (record R9 and section 9 ruling 5). The check says the disagreement no longer exists: `CONTEXT.md` contains no "540" anywhere, and the two legs that do exist agree. **You edit nothing for it and you close the handoff's open item 4 as already fixed.**

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `apps/hungry-grave/docs/design/show-what-you-have.md`: **section 2's rulings R8 and R9 in full, and section 4's step 5.0 paragraph in full, which carries the amended HUD entry's text and its dated amendment paragraph verbatim for you to copy.** Then section 7's second and last findings, and section 9's rulings 2, 3, 5 and 6.
3. `apps/hungry-grave/docs/adr/0054-the-ladder-reads-twice-in-the-storm-and-on-the-hud.md` **whole**, which is what you are amending, and `0055-a-stripped-rung-falls-onto-the-field-as-a-body.md` whole, which you are not.
4. `apps/hungry-grave/docs/adr/0058-each-on-swallow-line-pays-in-its-own-currency-at-its-own-cadence.md`, **its opening amendment sentence only**, which is the wording your overrule line copies.
5. `apps/hungry-grave/CONTEXT.md`, the entries **HUD, Rung, Treasure, Corpse, Wisps** and the file's own header. **Read three of its existing dated amendment paragraphs before you write one**, because the voice is the file's and not yours.
6. `apps/hungry-grave/docs/research/visible-ladder-precedent.md`, the item recommending Cave Story's MAX buffer, which is the line you are superseding, and `apps/hungry-grave/docs/research/portrait-hud-and-catchable-loss.md` sections 1, 3, 4, 5, 7 and 12, which are what the HUD entry's placement now rests on.
7. `apps/hungry-grave/docs/push/round-two-slice-prompts.md`'s ADR commit block and `round-two-progress.md` section 5's last entry, for how an amendment commit is written and for the one that landed without writing its own note.

### The definition, in observable terms

After this commit: no record in the tree says a rung is carried by a line's projectiles, no record says the HUD sits inside the field frame, and the three terms the game speaks daily, the dive, the score and the fallen rung, each have an entry of their own. The research record and the design record are both in version control. `visible-ladder-precedent.md` says on its own page that its MAX buffer recommendation is superseded and where the ruling lives.

**Nothing under `src/` is in this commit**, no test moves, and `WITNESS_VERSION`, `READINGS_VERSION`, `FORMAT_VERSION` and `GOLDEN` are all untouched.

### The work, in this order

**(a) `git log --oneline -25` and `git status --short` first.** Slice J2 may still be landing, so **check the tip and the working tree before your first edit**; if anything under `src/` is uncommitted, that is another agent mid-slice and you stop and report rather than commit around it. **The design record and the research record are untracked files in the worktree**, so they show in `git status` and they are yours to add by path.

**(b) ADR 0054, amended in place.** The filename does not move, because the title does not. **Find both sentences in the opening paragraph that name projectiles by content, not by line**: the one that says every line's level is carried by that line's own projectiles, and the one that says a rung lost shows on the field as that line's projectiles blowing up. Both carry the amended word. Then a new dated paragraph with the what-stood, what-changed, what-it-could-not-have-known triple, worded in record R8: what stood is both channels existing and neither being the only reading of a loss; what changed is the word projectiles; what it could not have known is that Territory shipped as ground rather than as a shot, after the ADR was written. **The paragraph ends with ADR 0058's own overrule sentence.**

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

- The tip should be slice J2's docs commit, or its second code commit if the docs commit has not landed. **`WITNESS_VERSION` 9, `READINGS_VERSION` 6 after J2's second code commit and 5 before it, `FORMAT_VERSION` 4, `GOLDEN`'s checksum `1275540894` as J2 pinned it.** Read all four yourself and report them.
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

## Slice M1: a kill pays score, and a bled rung stays bled until the grave grows (#99)

Model: Opus, subagent type general-purpose. **Two code commits and one docs commit.** Messages end in `(#99)`.

Slice M1 of The Hungry Grave: `state.score` is written in exactly one place in the whole simulation and only from growth past the size ceiling, so a run that never reaches the ceiling carries a score of zero for its whole length and the floor ladder's first rung is dead in precisely the runs it exists for. This slice makes a kill pay score, and makes the rung a floor hit bled stay bled until the grave grows off the floor.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M1.

**Two code commits, and it is this step's only departure from the contract's one-code-commit rule.** The witness fold lands in its own commit declaring every new folded field, for the reason slice H's and slice J2's did: a version stamped before the fold stops moving names several folds (`apps/hungry-grave/docs/lessons.md`, The sim). **Build the fold commit whole and green rather than splitting a finished body of work afterwards**: write the rule tests that need the second commit's behaviour as `test.todo` inside the fold commit and fill them in the second. That is the tech gate's own finding on slice J2 and it would have cost that slice a rebuild.

**Six rulings shape this slice and none of them is yours to revisit.**

**First: score is paid by kills and by overflow, and neither ADR is superseded** (record R4). ADR 0002 says score is kills; ADR 0003 and decision-log entry 4 say growth past the size ceiling converts to score. The tree implements only the second, in `src/game/swallow.ts`, and `git log -S` says that is the only site it has ever had. **Neither ADR says its source is the only one, so both are built and nothing is superseded.**

**Second: what a kill pays is a field on the mob row, exactly like `corpsePayout` beside it, and never a compiled constant** (record R4, and the standing rule that a number which must exist before it is measured is data). **Every mob row carries one because every mob row carries `corpsePayout`**, so a body without one is not a state the type permits. **The score is paid on the kill and not on the swallow**, which is what ADR 0002's sentence says and what keeps the two currencies clean: kills pay score, swallows pay size and reservoir.

**Third: the rung the ladder bled stays bled until the grave grows off the floor** (record R4, ruled by the orchestrator on 2026-09-16 after the vision gate and the design gate raised the same thing independently). **The storm kills about 2.47 bodies a second** (`step-4-progress.md`), so without this rule a floor hit bleeds the score, the next kill re-arms it within half a second, the next floor hit bleeds it again, and the level strip and the fallen rung could only ever fire where nothing is dying. **In the mow the floor would be immortality, which is the one thing ADR 0003 says the floor is never**, and autofire would be paying the ladder's toll for the player. The mechanism: once a floor hit bleeds the score rung, kills do not re-arm it while the grave is still at the floor, so the second floor hit while small strips a level and the third strips again. **Growing off the floor resets it, and growing is the player's own act.** Score itself keeps accruing from kills the whole time; what is withheld is the rung's ability to absorb a second hit for free. The precedent is Sonic's rings, which refill only by the player's own act and never as a side effect of the player's weapon firing (`docs/research/floor-ladder-precedent.md`).

**Fourth: the bled-rung memory is folded, and it is this step's only witness move** (record section 5). It is state a replay must rebuild, which is folded state (ADR 0019), and folded state that gains a field moves the version, which is `witness.ts`'s own rule. **From J2's tip that move is 9 to 10, in its own commit, and a second move anywhere in this step is a stop.** Its cost is stated rather than discovered: every tape recorded before your fold commit is refused at the decode.

**Fifth: `GOLDEN` re-pins exactly once, here, and this re-pin has a behavioural cause on purpose** (record section 5 and section 4's M1 paragraph). **This is not J2's fold-only re-pin and do not reason from it.** The canonical scenario carries two scripted kills, at ticks 240 and 540 (`src/dev/digest.ts`), and those now pay score, so **`score` itself moves inside the digest as well as the checksum**, and `score` is exactly the two scripted kills' own rows summed. **Every other field holds**: tick 600, the seed, `graveX`, `graveY`, `size`, `reservoir`, `mobs`, `shots`, `corpses`, `skulls`, `wisps`, `kills`, the `drawn` record, the levels record and every one of the eight stream cursors. **A move in any of those is a stop and report and never a re-pin.**

**Sixth: `READINGS_VERSION` moves 6 to 7, in the same commit as the score change, and it is not optional** (orchestrator, 2026-09-16, under one-push mode, correcting the record's section 5). **`run.score` is a declared reading** in `batchReport.ts` and `compareRuns.ts`, and after this slice it means kills plus overflow where it meant overflow alone: same name, different definition, which is `readingsVersion.ts`'s own rule for when the version moves and is exactly the case its bottom-edge worked example exists to make loud. **Every batch recorded before you is incomparable with every batch after you on that key**, and version 7's own note says so, naming `run.score` as the reading whose meaning changed and naming the ladder's own keys beside it if they moved with it. That is J2's pattern and slice I's before it: the note carries what moved, what did not, and what the change made possible.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **ruling R4 in full, which is the whole of this slice**, then section 3.4 for what the sim already carries, section 4's M1 paragraph, section 5 for the budget, section 6's test sentences, and **section 7's first finding, which is this slice's behaviour written out for Mark and is not yours to soften**.
4. `apps/hungry-grave/docs/research/floor-ladder-precedent.md`, the Sonic ring entries, and `portrait-hud-and-catchable-loss.md` section 8's Sonic paragraphs, where the ring numbers are now sourced and where the refill-by-the-player's-own-act rule is stated.
5. `apps/hungry-grave/docs/adr/0002-corpses-are-fuel-and-carriers-meter-power.md` and `0003-size-is-health.md` in full, which are the two this slice makes true at once, plus `0019-the-witness-and-the-refusal-rule.md` for the fold and the refusal rule, `0015` for the golden digest, and `0024` for the closed append-only fault identity list.
6. `apps/hungry-grave/docs/push/round-two-progress.md` **section 15 in full** for how J2 wrote a fold commit, an isolation run and a re-pin, section 8 for slice H's fold commit, section 2 for the version ledger and section 3 for how a `GOLDEN` entry is written.
7. `apps/hungry-grave/CONTEXT.md`, the entries **Score** and **Fallen rung** as step 5.0 just wrote them, plus **Rung**, **Corpse** and **Dive**. **Read the Avoid lists before naming anything.**
8. The tree, whole where it is short and by function otherwise: `src/game/grave.ts`'s `bleedScore`, `stripLevels`, `strippableLines` and `runFloorLadder`, and whatever grows the grave; `src/game/swallow.ts`'s one write of `state.score`; `src/game/mobs.ts`'s `MOB_TYPES` rows, `TRASH_CORPSE_PAYOUT`, `damageMob` and `cullMobs`; `src/game/run.ts`'s `RunState`; `src/game/witness.ts`'s `WITNESS_VERSION` JSDoc and its folds; `src/game/events.ts`'s `scoreBled`, `weaponStripped` and `sealed`; `src/game/invariants.ts` and `src/game/faults.ts`'s `FAULT_IDENTITIES` and its severity table; `src/dev/digest.ts`'s `runScenario`, `scriptedKills` and `GOLDEN`; `src/dev/batchReport.ts` and `src/dev/compareRuns.ts` where `run.score` is declared as a reading; `src/dev/readingsVersion.ts` whole.

### The definition, in observable terms

After this slice: a run that never reaches the size ceiling still carries a score, and it is the sum of what it killed and what it overflowed. A hit at the size floor with score standing bleeds the score and takes no level. Kills keep paying score afterwards, and **the next floor hit while the grave is still at the floor strips a level rather than bleeding again**. Growth that lifts the grave off the floor re-arms the rung, so the floor hit after it bleeds rather than strips.

Nothing renders. The HUD does not exist yet and no renderer is opened.

`FORMAT_VERSION` still reads 4. **`WITNESS_VERSION` reads 10, `READINGS_VERSION` reads 7, `GOLDEN` is re-pinned with `score` and the checksum moved and nothing else**, and `pnpm verify` is green.

What a player meets, once the HUD lands behind it: the floor is a ladder with teeth rather than a floor the storm pays for.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m1`. **Step 5.0's docs commit must be in the tree; if it is not, that is a stop.**

**(b) The tests first, red.** **Write the kill-pays-score test and the bled-rung test first**, both expressed against the row and against the rule rather than against a number typed in the test.

**(c) The score row, and this is the one number you pick.** A field on every mob row beside `corpsePayout`. **The record gives no figure and that is deliberate**: nothing can measure what a kill should pay before kills pay anything, so it is data and the first figure is yours. **Set it against `corpsePayout`'s own shape**, which is a base constant with the rows expressed as multiples of it, so a reader sees the relation rather than three unrelated numbers, and say in the note what you chose, what you set it against, and that it is a first figure M6's readings are what it gets tuned against. **A number in a test is a stop; a row the test reads is the rule.**

**(d) The payment site.** Where the kill is resolved, not where the corpse is swallowed. **A body that dies with no mob row is a case the record does not rule**: the boss and the set piece's source are not `MOB_TYPES` rows, so decide once, build it, and **annotate it in the note as a gap with the reason**, on the cited-future rule. Do not build a payout for a caller nobody has written down.

**(e) The bled-rung memory.** Set where the floor hit bleeds the score, cleared where the grave grows off the floor, and read by the ladder so the second floor hit strips. **Find the growth site by content.** Score keeps accruing from kills while the memory is set, which is the half of R4 that keeps the player from being punished twice, and a test says so.

**(f) The invariant, and it is the rule's own.** R4's mechanism has one state that must never exist: **the memory set while the grave is off the floor**. Express that check in `invariants.ts` with every existing check keeping its meaning and its severity. **You are permitted to append at most one fault identity if the check needs one of its own**, appended at the end of `FAULT_IDENTITIES` with its severity-table entry, which moves nothing else (ADR 0024, closed and append-only), and the note names the identity and says whether you needed it. If an existing identity honestly carries it, use that instead and say so.

**(g) The witness fold, in its own commit.** The memory is folded, declared in `WITNESS_VERSION`'s JSDoc as a dated paragraph naming the field and why it is not excluded, and stamped in the same commit. **`witness.test.ts`'s `EXCLUDED` list is the precedent for anything that is pure provenance.** The cost paragraph says plainly that every tape recorded before this commit is refused at the decode.

**(h) `GOLDEN`, re-pinned once, proved rather than promised.** Run `digest.test.ts`. **If it is green, stop and report**, because the scenario's two scripted kills should have moved `score` and a green digest means your payment site is not on the path a scripted kill takes. **If it is red, prove the diff's causes before you pin**: show `score` equal to the two scripted kills' own rows summed, computed from the rows rather than typed, and show every other field holding, field by field. **Both readings go in the note.** The new pin carries its own dated paragraph in `digest.ts`'s JSDoc naming every field that moved beside every field that held, the way slice H's and J2's do, and its own entry in the note's section 3.

**(i) The readings, and the version moves with them.** **`READINGS_VERSION` 6 to 7, in the same commit as the score change**, because `run.score` changes meaning on the tick that commit lands and a version stamped a commit later names a build whose reports already meant something else. **Version 7's own note is a dated paragraph in `readingsVersion.ts` in the voice versions 5 and 6 already use**: `run.score` named as the reading whose meaning changed, from growth past the size ceiling alone to kills plus that growth; **every batch before this commit named as incomparable with every batch after it on that key**; every other reading named as still meaning what it meant, **including `tuning.damageTaken.scoreBled` if its definition holds and named as moved if it does not**, which you decide by reading it rather than by assuming either way. **Check the rest of the readings for the same exposure before you write the note** and list what you checked. **What does not move it: M6's two new readings, which are not yours, and any key that merely reads a different number.**

**(j) The measurements this slice owes.**

- **The score a full run ends on, from a batch**, so the number exists before anything is tuned against it. `pnpm vite-node --config vite.headless.config.ts scripts/batch.ts <configuration> <first-seed> [count]`, on the configurations and seeds round two's note section 15 used, with `run.score` printed. **Say plainly that it is incomparable with every earlier batch's `run.score`**, which is item (i)'s whole subject.
- **Floor hits per run and what each one cost**, split into bleeds and strips, off the same batch, because R4's whole claim is that the strip is now reachable in ordinary play. **This is the reading M6 turns into a declared one; here it is a measurement in the note.**
- **Replay determinism at your tip.** One seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
- **A pre-fold tape refused by its witness version rather than diverging**, once, off your own fold commit.
- **A conditioned tape at the ladder rig with levels pinned**, measured to `outcome: 'verified'`, because the ladder is loudest with a full build.

**(k) CodeRabbit CLI, one iteration, then the code commits.** The fold commit first, something in the shape of `feat(hungry-grave): the ladder remembers the rung it bled and the witness folds it (#99)`, then the rest, something in the shape of `feat(hungry-grave): a kill pays score and a bled rung stays bled until the grave grows (#99)`.

**(l) The progress note**, section **7**. Beyond the contract's list, say: the score row you chose with what you set it against and that it is a first figure; the payment site and the bodies with no row, named as a gap; the memory's set and clear sites; the invariant and whether a fault identity was appended; `WITNESS_VERSION` 10 with what the move costs; `GOLDEN` re-pinned with `score`'s two causes shown and every held field named; `READINGS_VERSION` 7 with version 7's note quoted, the readings you checked for the same exposure and what you decided about `tuning.damageTaken.scoreBled`; the batch figures with the incomparability stated; and `FORMAT_VERSION` 4 named as held.

**(m) Stop and report.** Under 300 words. **Do not start slice M2.**

### What must not move, and a move is a stop

- **`FORMAT_VERSION` 4.** Nothing here changes the wire. A new fault identity is append-only and moves no byte's meaning (ADR 0024).
- **`WITNESS_VERSION` moves exactly once, 9 to 10, in its own commit.** A second move is a stop.
- **`GOLDEN` re-pins exactly once, and only with `score` and the checksum moved.** Any other field moving is a stop and report.
- **`READINGS_VERSION` moves exactly once, 6 to 7, in the same commit as the score change.** A second move anywhere in the step is a stop, and **no other slice is permitted one**.
- **ADR 0002 and ADR 0003 both stand whole and neither is superseded.** You file no ADR and amend none.
- **The overflow source in `swallow.ts` keeps its exact meaning.** Score becomes kills plus overflow, never kills instead of overflow.
- **The three ladder events, `scoreBled`, `weaponStripped` and `sealed`, stay three.** They are deliberately separate because at the size floor there is no shrink and ADR 0040's rim channel is silent.
- **`stripLevels`' own rule**, one level off every line that has one to give, in the same tick. M5 changes the order it walks and nothing here does.
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty.
- **Every existing invariant's meaning and severity, every cap, `STREAM_SALTS` and `STREAM_ORDER`.**
- **No test is deleted, skipped, weakened or rewritten to reach green.** A measured baseline that moves is re-measured with its comment saying what moved and why.
- **Nothing under `src/app` is in this slice at all.** No renderer, no HUD, no layout.

### Seams under test

`src/game/mobs.ts`: the score field on every row, and a kill paying it where the kill is resolved. `src/game/grave.ts`: the floor ladder bleeding, the memory set at the bleed, the second floor hit stripping, and growth clearing it. `src/game/run.ts`: the memory as run state. `src/game/witness.ts`: the fold over it and the version that moves with it. `src/game/invariants.ts`: the state that must never exist. `src/dev/digest.ts`: the canonical scenario's score.

### Module boundaries

**Nothing is created, deleted, merged or split, and no import direction changes.** `src/game` stays dependency-free and pure, the core's cycle guard keeps `KNOWN_CORE_CYCLES` empty, and `src/dev` reads the run and never writes it. The score row lives in the module that owns the mob table, beside `corpsePayout`, because a helper joins the file whose concept it serves. No new library enters.

### The planned test list

1. *A kill pays score from its own row, and the score a run ends on is the sum of what it killed and what it overflowed.*
2. *Every mob row carries a score payout*, so a body without one is not a state the type permits.
3. *A hit at the size floor with score standing bleeds the score and takes no level.*
4. *A floor hit that bleeds the score leaves the rung bled: kills keep paying score, and the next floor hit while the grave is still at the floor strips a level rather than bleeding again.*
5. *Growth that lifts the grave off the floor re-arms the score rung, so the next floor hit after it bleeds rather than strips.*
6. *A third floor hit while still at the floor strips again*, because the memory is not a one-shot.
7. *Growth past the size ceiling still converts to score*, the half that did not change, asserted so it cannot drift out.
8. *The memory is never set while the grave is off the floor.* The invariant, through the harness rather than by reaching into the check.
9. *A replay rebuilds the bled rung at every checkpoint.*
10. *A tape recorded before the witness moved is refused by its version rather than diverging at a checkpoint.*
11. **The fences**, green, each by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
12. **The golden digest**, re-pinned, with `score` proved equal to the two scripted kills' rows summed.

**What this slice is expected to turn red.** `mobs.test.ts` and `grave.test.ts` throughout, `run.test.ts`, `witness.test.ts`, `digest.test.ts`, `invariants.test.ts`, `swallow.test.ts` wherever score is asserted, `measure.test.ts`'s rich fixture, `replayTallies`' own tests, and `harnessPolicy.test.ts`'s measured per-seed baselines, which are **re-measured with the reason beside each and never re-pinned blind**. **A realistic count is 14 to 22 files**, against slice H's 18 and J2's own, both of which were version moves like yours. A diff much smaller than that is a reason to check what you have not reached.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit.
3. **Agent.** `WITNESS_VERSION` 10 and `READINGS_VERSION` 7 each stated with what the move costs, and `FORMAT_VERSION` 4 held, each read off the tree.
4. **Agent.** The `GOLDEN` re-pin with `score`'s arithmetic shown and every held field named.
5. **Agent.** A pre-fold tape refused by its version rather than diverging.
6. **Agent.** Replay determinism on one seed under `shaky-short`, and a conditioned tape at the ladder rig measured to `outcome: 'verified'`.
7. **Agent.** A batch with `run.score` and the floor-hit split printed, and the incomparability stated.
8. **Agent.** The fences green, each named by test title.
9. **Human (Mark), and none of these blocks you.** The record's section 7 first finding is his read: take a hit at the floor and lose the score, take a second before growing and lose a level off every line, dive under food to grow, and the next hit costs score again. **He reads it on the deploy after the HUD lands, not after this slice.**

### State of the branch

- The tip should be step 5.0's docs commit. **`WITNESS_VERSION` 9, `READINGS_VERSION` 6, `FORMAT_VERSION` 4, `GOLDEN`'s checksum `1275540894` as slice J2 pinned it.** **Slice J2 may have landed its last commit only moments before you**, so read all four off the tree rather than off this line, and say what you read.
- **You hold the whole step's witness move, its whole readings move and its whole `GOLDEN` budget.** M2, M3, M4 and M6 are permitted none, and M5 is permitted at most one `GOLDEN` re-pin that is expected to go unused.
- The headless browser runs at 3 to 21 FPS under SwiftShader and puts consecutive screenshots 74 to 120 ticks apart. That is the harness and not the build.

### The stuck rule

**Four things are already known to be a stop:** step 5.0 not in the tree; a `FORMAT_VERSION` move or a second witness move; a `GOLDEN` diff with any cause other than `score` and the checksum, or a green digest where the scripted kills should have moved it; and a fence, a cap or an existing invariant's severity moving. **And four things are ruled rather than open:** score is kills and overflow both, the bled rung stays bled until the grave grows, neither ADR is superseded, and **`READINGS_VERSION` moves once here for `run.score`'s meaning**, which the orchestrator ruled against the record's own section 5. **A second readings move, in this slice or any other, is a stop.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

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

## Slice M2: the frame is composed, and the band is reserved (#72)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#72)`.

Slice M2 of The Hungry Grave: the frame around the field is fitted to each screen rather than composed for either, the canvas is sized to a unit that changes under the player mid-run, and there is nowhere declared for the HUD to live. This slice composes the frame across the three regimes the measurements actually found, reserves the HUD's band, and stops the field re-fitting itself when the browser's chrome retracts.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M2.

**This slice changes no simulation rule at all**, which is why it owes no `GOLDEN`, no witness move and no version move of any kind. **No number in the layout is a sim number and the field stays 540 by 760**, which is #72's own criterion.

**Five rulings shape this slice and none of them is yours to revisit.**

**First: the HUD is one row at the field's top edge, outside the field where the stage offers room and over it where it does not** (record R1). **One form, one row, one placement rule, no viewport breakpoint.** The measurement decides it: a phone gives the field the full stage width and **no side gutter at all, exactly zero**, and a desktop gives the field the full stage height and **no band at all, exactly zero** (record section 3.1). **There is no home both shapes share except the field's own rectangle.** This is the same trade `fitField` already takes and documents, and it keeps Mark's ruling that the field never pays width untouched.

**Second: the band is 28 field units and the mark inside it is 11** (record R1). The mark is measured first and the band is declared from it, in that order, because a reading proved at one size is not proved at a quarter of it. The band is what the content needs: an icon of 24 units with a row of five 11-unit marks beside it and two units of padding above and below. **`layout.ts` declares the band and the HUD's own test asserts the measured content fits inside it**, which is exactly the split `READOUT_RESERVE` already uses and states. **You declare the band; M3 measures its content against it.**

**Third: the three regimes are named and the squeeze is the one nobody had designed for** (record R10 and section 3.1). A tall shape gives bands and no gutter, a wide shape gives gutters and no band, and between them, at a viewport aspect near the field's own 0.711, both collapse and every control ends up over the field. **Under `svh` that third regime is the phone's standing layout rather than a corner case.** The portrait tablet is in the sweep **as a test viewport only**, because it is the cheapest shape that exercises the squeeze deterministically.

**Fourth: the even slack split is the mitigation and it does not reach zero** (record R10). `fitField`'s lowering branch centres the field inside the box *below* the reserve, so the reserve's 120 units land entirely on top: 133 above and 13 below at an iPhone at `svh` 660. Centring the field in the whole box and pushing it down only far enough to clear the reserve gives 120 and 26 at the same viewport. **It changes nothing at all at the shortest viewports, where the field simply fills the stage**, and the belch's overlap is the record's section 7 third finding, filed and not solved, because Mark ruled the corner.

**Fifth: `svh`, on `#app`, with `resizeTo` pointed at `#app`, and the inset taken out of the measured box rather than read by the layout** (record R10 and section 9 ruling 7). **The `svh` change alone does nothing**: `engine.ts` does `opts.resizeTo ??= window` and the resize plugin reads `globalThis.innerWidth` and `innerHeight` whenever `resizeTo` is the window, so the canvas is sized from the window whatever `#app`'s height is, and on iOS `innerHeight` tracks the dynamic viewport, which is the clipping `svh` was supposed to prevent. **The two changes land in the same commit or the stylesheet edit is one the canvas never sees.** The mechanism for the inset is `#app { height: calc(100svh - env(safe-area-inset-bottom)); }`, so the box the engine measures is already clear of the home indicator and every stage unit inside it is safe by construction. **`layout.ts` keeps knowing nothing about devices, insets or browsers**, which is the property its own header claims.

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

**(d) The placement rule.** One function that answers where the row sits at a placement: outside the field where the stage's band above the field is at least the band's own height, and over the field's own top edge where it is not. **It is drawn in field units and scaled by the field's placement**, which is what makes one mark subtend the same fraction of the field on a 320-wide phone and a 1440-wide desktop. **The row is a sibling of the field container rather than a child**, because a child would be clipped by the field's own clip and hidden on a phone where the row sits outside the field; you declare the rectangle, M3 places the view in it.

**(e) The even slack split.** `fitField`'s lowering branch centres the field in the whole box and pushes it down only far enough to clear the reserve. **Mark's 2026-08-22 ruling still binds: the field may be moved and may never be shrunk**, so the existing test of that name stays green unchanged and is the thing you check first after the change.

**(f) `svh` and `resizeTo`, in the same commit.** `public/style.css` moves `#app` to `height: calc(100svh - env(safe-area-inset-bottom))`, and the engine points `resizeTo` at the `#app` element. **The default is `opts.resizeTo ??= window` inside the engine's own `init`, so decide where the element is named**: the engine is the shared wrapper and `main.ts` is this app's entry story, and the one that keeps the engine general is the entry naming its own element. Whatever you choose, **the element is named once**, a missing element is handled rather than assumed, and nothing abnormal is silent. **Keep the `100vh` fallback declaration's job**: the existing block declares `height: 100%` then `100vh` then `100dvh` as a progressive fallback, and the replacement keeps that shape with `svh` in the winning position.

**(g) The safe area, taken out of the measured box and never read by the layout.** `viewport-fit=cover` is already set in `index.html`, which is what makes `env()` return real insets. **The inset shrinks the box the engine measures and nothing else reads it**, so `BelchButton`, which is placed in stage units by `GameScreen.resize` and has no way to read a CSS environment variable, is lifted clear of the home indicator by construction.

**(h) The measurements this slice owes.**

- **The three regimes asserted**, at a tall viewport, a wide one and one at the field's own aspect, with every control and readout placed deliberately at each.
- **The record's section 3.1 table re-derived at your own tip and printed in the note**, row by row: the stage, the field scale, the side gutter, the band above and below with the even split, and the belch's vertical overlap. **Say which rows agree with the record and which do not**, because the table was computed from `fitField` as it stood and you are changing `fitField`.
- **A rendered check at a phone viewport and a desktop one**, the built app through `vite preview` driven with `playwright-cli`, **with the browser chrome's retraction exercised if the driver can and said plainly if it cannot**. **Play a run, end it, and play another**, because a check that only ever plays run one is structurally blind.
- **The target floor asserted at every viewport in the sweep**, at least 44 CSS pixels, with the measured figures printed. **A fill or an inset that shrinks the touchable area is a stop.**
- **No tape, no batch and no determinism run is owed**, and that claim is checked rather than assumed: nothing under `src/game`, `src/tape` or `src/dev` is in this commit. **If any of the four version constants or `GOLDEN` moves, that is a stop and report**, because it would mean something here reached the sim.

**(i) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the frame is composed across three regimes and the HUD's band is reserved (#72)`.

**(j) The progress note**, section **8**. Beyond the contract's list, say: the band and the mark as declared with their derivation; the placement rule in one sentence; the slack split's before and after at three viewports; the `svh` and `resizeTo` pair with where the element is named and why; the inset's mechanism and the belch's measured lift; the re-derived section 3.1 table with the rows that disagree named; the rendered check and what it could and could not see; the target floor's figures; and the four constants and `GOLDEN` all named as untouched.

**(k) Stop and report.** Under 250 words. **Do not start slice M3.**

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 10, `READINGS_VERSION` as M1 left it, `FORMAT_VERSION` 4 and `GOLDEN`.** None moves, none of the four files is in the commit, and a move in any is a stop and report rather than a re-pin.
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

`src/app/layout.ts`: the band as a declared reserve, the placement rule at every regime, and `fitField`'s even slack split with the never-pays-width rule intact. `src/engine/engine.ts` or `src/main.ts`: the element the renderer measures. `public/style.css`: the box the engine measures, already clear of the reported inset. `src/app/screens/game/GameScreen.ts`: every control still placed deliberately at all three regimes.

### Module boundaries

**Nothing is created, deleted, merged or split, and no import direction changes.** `layout.ts` stays the only module in the app that knows about the viewport, and it stays blind to devices, insets and browsers: the inset is a stylesheet fact and the element is an entry-point fact. **Nothing in `src/game` may import `layout.ts`** and nothing under `src/game`, `src/dev` or `src/tape` is in this commit at all. No new library enters.

### The planned test list

1. *The HUD's row sits at the field's top edge at every viewport, outside the field where the band allows it and over the field's own top edge where it does not, and it is never clipped.*
2. *One mark subtends the same fraction of the field's width at a phone viewport and at a desktop one, and measures at least 6.25 CSS pixels at the narrowest viewport in the sweep.* **The floor is slice K's own measured band and the record's R1 derivation rests on it.**
3. *A shortened window splits its slack evenly above and below the field rather than piling the reserve's whole height on top.*
4. *The frame's three regimes each place every control and readout deliberately*, asserted at a tall viewport, a wide one and one at the field's own aspect.
5. *The page's canvas is sized to the small viewport and the renderer measures the element rather than the window, so the field's placement does not move when the browser's chrome retracts mid-run.*
6. *The bottom control's target clears the safe-area inset the page reports, and still measures at least 44 CSS pixels at every viewport in the sweep.*
7. *The field never pays width for a readout, at any viewport.* The existing test, held green and unchanged.
8. *The field is 540 by 760 at every viewport and no layout number reaches the sim.* Held.
9. **The layering test**, green.

**What this slice is expected to turn red.** `layout.test.ts` throughout, `BelchButton.test.ts`'s two rects if the stage box changes under them, `layering.test.ts`'s placement assertions, `GameScreen`'s own resize tests, and any engine or resize test that names the window. **A realistic count is 6 to 12 files.** A diff larger than that is a reason to check what you reached into.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures.
3. **Agent.** The section 3.1 table re-derived at your tip, printed, with disagreements named.
4. **Agent.** A rendered check at a phone viewport and a desktop one, across two runs, screenshots read.
5. **Agent.** The target floor at every viewport in the sweep, with figures.
6. **Agent.** The four version constants and `GOLDEN` all untouched, stated, with none of the four files in the commit.
7. **Human (Mark), and none of these blocks you.** **His phone read after the deploy is the whole verdict on `svh`**, because no test can tell a field that is correctly smaller from one that is wrongly smaller. That is the record's section 7 fourth finding and section 9 ruling 7, and it is annotated as his.

### State of the branch

- The tip should be slice M1's docs commit. **`WITNESS_VERSION` 10, `READINGS_VERSION` as M1 left it, `FORMAT_VERSION` 4, `GOLDEN` as M1 re-pinned it.** Read all four off the tree and say what you read.
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

## Slice M3: the HUD carries the ladder and the score (#99)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#99)`.

Slice M3 of The Hungry Grave: no score is drawn anywhere in `src/app`, nothing says which lines are owned or at what level, and the bank is still a line in the dev corner stack. This slice builds the row: the score, and each rostered line's rungs as marks against that line's own icon, in the band slice M2 reserved.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M3.

**This slice changes no simulation rule at all** and owes no `GOLDEN`, no witness move and no version move of any kind. **Nothing under `src/game` is in this commit.**

**Five rulings shape this slice and none of them is yours to revisit.**

**First: a rung is a mark that fills, never a mark that brightens, and the filled and empty states differ by area alone** (record R2). ADR 0014 binds every colour drawn while the field is live, and its own sentence includes the readouts on top of it; ADR 0054 reads that as the HUD announcing by count, by shape or by subtraction and never by getting brighter. **So a lit mark and an unlit one cannot differ in value, and hue vanishes in grayscale, which leaves area.** **This is slice K's own construction reused rather than a new one**: the reservoir's charge is a wide arc over a narrow track, `hudInk` at luma 67.23 against `reservoirCharge` at 67.25, 0.02 luma apart, and K measured the filled band at 6.25 to 7.50 CSS pixels against the bare track's 3.00 to 4.00 at the phone viewport (round two note section 13). **The pair is `hudInk` against itself and no new colour is needed.**

**Second: the count is the reading, five marks per line at `MAX_LEVEL` 5** (record R2). A rung is best expressed as a small count of objects: Gradius Options top out at four and Cave Story has three levels, and Sky Force Reloaded shows a tier as ten blocks that progressively light up, which is the closest shipped portrait-mobile analogue in the record. **The construction is Halls of Torment's shipped fix**, the rungs as marks against the line's own icon rather than a number beside it, which is what let them fit a per-ability level into an icon's space four months after launch.

**Third: one row per line in the run's roster, in roster order, and never the build's four** (record R3). `RunState.roster` is resolved once at `createRun` and recorded in the tape header (ADR 0046). The push's standing constraint is that adding a fifth weapon line is one weapon module plus its data rows, and **a HUD that iterated `WEAPON_LINES` would be the one place a fifth line needed a retune of the others**, and would draw a row for a line the run never had. **A rostered line at level 0 draws its icon with every mark empty, because it can still be offered; a line outside the roster draws nothing at all.**

**Fourth: the mark is 11 field units and the band is 28, and the band was declared from the mark rather than the other way round** (record R1, and slice M2 declared it). At the field's placement an 11-unit mark measures **6.5 CSS pixels at a 320-wide phone, 8.0 at an iPhone 15, 8.4 at a Pixel 8, 13.0 at a desktop and 16.7 at a portrait tablet**, against slice K's own measured floor of 6.25. Widthwise the content is a group of 95 units per line, four groups plus their gaps at 410, and a score of about 110, inside the field's 540 with 10 units of margin each side. **`layout.ts` declares the band and this slice's test asserts the measured content fits inside it.** **6.5 against a 6.25 floor is a margin worth seeing rather than asserting**, which is why this slice takes a grayscale screenshot at the narrowest phone.

**Fifth: the bank moves out of the dev stack and into the row, and draws nothing at all at a bank of zero** (record R11). `RunHud`'s own comment says the bank line is the stand-in form and that the field-side readout belongs to the ladder HUD. #99's second comment records #96's criterion landing there as a craft call deferred to this step. **The draws-nothing-at-zero rule is the existing one and its reason is unchanged.** **The dev corner stack itself stays** (record R12): gating it is #66's whole job.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`. **The dumb-view rule and the powers-arrive-as-props rule are this slice's whole shape.**
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **rulings R1, R2, R3, R11 and R12 in full**, then section 3.1's mark sizes, section 3.2 for what draws today, **section 4's M3 paragraph in full, which names the data seam**, section 5, section 6's test sentences, and section 7's first and sixth findings.
4. `apps/hungry-grave/docs/research/portrait-hud-and-catchable-loss.md` **sections 1 to 7 and 12 in full**, which is every shipped placement and form this ruling rests on, **and read the labels**: Sky Force's ten blocks are a hangar screen and not a live HUD, and the record says plainly that anything leaning on it for placement is leaning on the wrong half.
5. `apps/hungry-grave/docs/research/visible-ladder-precedent.md` items 4, 6, 9, 10 and 11, the Gradius, Cave Story, Halls of Torment and Brotato items, **with item 11's WEAK label read**.
6. `apps/hungry-grave/docs/adr/0054-the-ladder-reads-twice-in-the-storm-and-on-the-hud.md` **as step 5.0 amended it**, plus `0014-readability-layering.md` and `0039-the-field-boundary-is-a-readout.md` in full, because a second readout on the same frame has to be told apart from the first, and `0046-a-runs-roster-is-drawn-from-a-growing-pool.md` for the roster.
7. `apps/hungry-grave/docs/push/round-two-progress.md` **section 13 in full**, which is slice K's own account of a filled readout under the same ceiling: the one-luma trick, the grayscale read measured off the pixels, the arc's two pixi facts and the footprint they cost.
8. `apps/hungry-grave/CONTEXT.md`, the entries **HUD, Rung, Score, Dive, Fallen rung, Treasure and Bank** as step 5.0 left them. **Read the Avoid lists before naming anything.**
9. The tree: `src/app/screens/game/RunHud.ts` whole and `src/app/screens/game/runSession.ts`'s `RunIdentity`, `RunReadout` and `RunSession`; `src/app/screens/game/GameScreen.ts`'s construction, `resize` and frame loop; `src/app/layout.ts`'s `fitField`, `READOUT_RESERVE` and **the band slice M2 declared**; `src/app/screens/game/layering.ts` whole; `src/app/palette.ts`'s `hudInk`, `hudDim`, `reservoirCharge`, the band constants and the live-field list; `src/app/__tests__/palette.test.ts`, the source scan that will hold you to the ceiling; `src/app/cornerReadout.ts`; `src/game/lines/roster.ts`'s `MAX_LEVEL` and `WEAPON_LINES`; `src/game/run.ts`'s `RunState`.
10. **`src/app/screens/game/foodSprite.ts`'s `drawPowerUpIcon` whole, and its JSDoc above all.** It already draws one silhouette per weapon line, a circle for the skull stream, a hand for Territory, a kite for the wisps and a fourth for the bell, **with the four aspects deliberately held apart and each filling its box**, and #38 is named as the ticket that may replace the imagery. **This is the icon vocabulary the offer's body already teaches the player**, and the record's R6 says the fallen rung wears the icon its HUD row taught.

### The definition, in observable terms

After this slice: a slim row sits at the field's top edge carrying the score and, for each line in the run's roster and in roster order, that line's rungs as five marks against that line's own icon. A power-up swallowed fills exactly one mark, on the line it levelled, on the tick it was swallowed. A rostered line at level zero draws its marks and none of them filled. A line the roster does not name draws nothing. The bank reads on the row when carriers are waiting and draws nothing at all at zero, and `RunHud`'s bank line is gone.

A filled mark and an empty one differ in grayscale by area and by no step in value, every colour the row draws sits at or below the field's ceiling while the field is live, and **the row is never mistaken for the field's boundary**: the boundary's stroke and the row's marks are separable in grayscale at the narrowest phone.

`WITNESS_VERSION`, `READINGS_VERSION`, `FORMAT_VERSION` and `GOLDEN` are all untouched and none of the four files is in the commit.

What a player meets: without being told, they can say what the row at the top is telling them. **That is #99's own criterion and the done line is Mark's read.**

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m3`. **Slices M1 and M2 must both be in the tree**, and **the band M2 declared is what you measure against**; if it is not there, that is a stop.

**(b) The tests first, red.** **Write the ceiling test and the content-fits-the-band test first**, because they are the two this slice is most likely to break and least likely to notice breaking, which is slice K's own ordering for the same reason.

**(c) The view, and it is dumb.** Data in, pixels out. It builds its own visual body and contains no data source, no loop subscription and no change detection. **Powers arrive as props at construction**, a narrow record of only what it needs. **The driver outside owns the data, the diffing and the loop**, and the HUD's rectangle is read from `fitField`'s output rather than recomputed, for the reason `GameScreen` already holds the placement rather than recomputing it at pointer time: two computations in parallel agree only until one of them changes.

**(d) The data seam, named in the record because the tech gate found it missing.** **The roster arrives once, at the run's start, through `showIdentity`**, which is already the seam for what a run was born with. **The score, the levels and the bank arrive every frame through `render`**, which means `RunReadout` gains three fields. Read the record's M3 paragraph before you shape either.

**(e) The marks.** Five per line at `MAX_LEVEL`, a filled mark against an outline of the same mark at the same luma, differing by area alone. **11 field units, in the 28-unit band, both M2's declared figures and neither yours to move.** The pair is `hudInk` against itself and **no new colour is declared**; if you believe one is needed, that is a stop and report, never a ceiling you raise or an exemption you claim.

**(f) The icon per line, and this is the one craft choice you research rather than pick.** The offer's body already teaches one silhouette per line through `drawPowerUpIcon`, whose own JSDoc holds two properties: the four aspects stay apart and each one fills its box. **Reuse that vocabulary rather than invent a second one**, because the record's R6 has the fallen rung wearing the icon its HUD row taught, and a second vocabulary would mean the body and the row disagree. **Decide once whether the row calls that function or shares its shapes another way**, keep `foodSprite`'s own two properties true at the icon's 24-unit box, and **say in the note what you chose and what you set it against**. If the shapes do not survive the size, that is a finding for the note and a measurement, not a redesign you take on your own.

**(g) The score, and the bank.** The score is the row's largest number and it reads in the band. **The bank draws nothing at all at zero** and its line comes out of `RunHud` in this same commit, with `RunHud`'s own comment about the stand-in form corrected rather than left standing false. **Everything else in the dev stack stays** (R12).

**(h) The measurements this slice owes.**

- **The mark measured in CSS pixels at every viewport in the sweep**, read off the rendered pixels rather than computed, **including the narrowest phone**, against slice K's proved floor of **6.25**. **The record's derivation says 11 units is the smallest whole number that clears it; if your measurement says otherwise, the record's intent is the floor and not the figure**, so raise the mark to the smallest whole number that clears it, let the band follow from the content, say both in the note, and name the record's claim as false against the tree.
- **A grayscale read of a partway ladder, measured off the pixels the way slice K's was**, at the phone viewport where the stage is smallest: the filled mark's band and the empty mark's, in CSS pixels, and the two lumas. **Say whether the reading survives the hue being removed, which is the honest limit of a value-flat design.**
- **The row against the field's boundary in grayscale**, because the record's own test sentence promises they are separable and ADR 0039 makes the boundary a readout in its own right.
- **A rendered check at a phone viewport and a desktop one, with the screenshots read**, at a roster of one line and at a fuller build, and at level zero. **Play a run, end it, and play another**, because a check that only ever plays run one is structurally blind, which is what slice K's own empty-ring read caught.
- **The content measured against the declared band**, which is the assertion `READOUT_RESERVE` already models: the code declares, the test measures.
- **No tape, no batch and no determinism run is owed**, and that claim is checked rather than assumed. **If any of the four version constants or `GOLDEN` moves, that is a stop and report.**

**(i) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the row carries the score and every rostered line's rungs as marks (#99)`.

**(j) The progress note**, section **9**. Beyond the contract's list, say: the view's seam and what arrives once against what arrives per frame; the mark's measured size at every viewport with the floor named; the grayscale read and what it showed; the boundary separability read; the icon decision with what you set it against; the bank moved with `RunHud`'s comment corrected; the palette scan green with every luma printed; the rendered check across two runs and what it could and could not see; and the four constants and `GOLDEN` all named as untouched.

**(k) Stop and report.** Under 250 words. **Do not start slice M4.**

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 10, `READINGS_VERSION` as M1 left it, `FORMAT_VERSION` 4 and `GOLDEN`.** None moves, none of the four files is in the commit, and a move in any is a stop and report.
- **The band ceiling and the palette's live-field list.** A colour that will not fit under the ceiling is a stop, never a ceiling you raise. **The exemption list is for colours that only ever draw when the field is not live**, and this row draws over a live field on nearly every shape.
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

The HUD view itself: the marks as a pure function of a line's level, the roster driving the rows, the bank's draw-nothing-at-zero rule, and the content's measured extent against the declared band. `src/app/screens/game/runSession.ts`: `RunReadout`'s three new fields and the roster arriving through `showIdentity`. `src/app/screens/game/GameScreen.ts`: the driver owning the data and the diffing, and the row placed from `fitField`'s output. `src/app/screens/game/RunHud.ts`: the bank line gone and everything else held. `src/app/palette.ts`: every colour the row draws, under the ceiling and inside the live-field list.

### Module boundaries

**One file is created, the HUD's own concept module, named for the concept `CONTEXT.md` calls the HUD**, with its public interface reading in one place at the module's end. Nothing is deleted, merged or split. **It is a sibling of the field container rather than a child** (R1), so it is wired in `GameScreen` where the corner stack and the two controls already are. `src/app` still reaches `src/game` for types and nothing reaches back, and **`layout.ts` stays the only module that knows about the viewport**. No new library enters.

### The planned test list

1. *The HUD draws one row per line in the run's roster, in roster order, and none for a line the roster does not name.*
2. *A rostered line at level zero draws its marks and none of them filled.*
3. *A filled mark and an empty one differ in grayscale by area and by no step in value.*
4. *Every colour the HUD draws sits at or below the field's ceiling while the field is live.* Through `palette.test.ts`'s existing scan; **confirm it green over anything you add rather than writing a second one.**
5. *The HUD's measured content fits inside the band `layout.ts` declares, at the narrowest shipped phone.*
6. *One mark measures at least 6.25 CSS pixels at the narrowest viewport in the sweep.*
7. *The HUD's row is never mistaken for the field's boundary: the boundary's stroke and the HUD's marks are separable in grayscale at the narrowest phone.*
8. *A power-up swallowed fills exactly one mark, on the line it levelled, on the tick it was swallowed.*
9. *The score reads on the HUD and moves with the run's own score.*
10. *The bank reads on the HUD when carriers are waiting and draws nothing at all at zero.*
11. *The HUD is a dumb view: given the same readout it draws the same pixels, whatever the tick.*
12. *A fifth line in the roster draws its own row and retunes none of the others.* **The extensibility constraint, asserted rather than asserted about.**
13. **The layering test**, green, with the row outside the field's stack.

**What this slice is expected to turn red.** `RunHud.test.ts` over the bank line, `runSession`'s own tests over `RunReadout`, `GameScreen`'s tests over the new wiring, `layering.test.ts`, and `palette.test.ts` if you add an entry. **A realistic count is 8 to 14 files.** A diff larger than that is a reason to check what you reached into.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures.
3. **Agent.** The mark measured in CSS pixels at every viewport, against the 6.25 floor.
4. **Agent.** The grayscale read of a partway ladder, measured off the pixels, with the two lumas and the two band widths.
5. **Agent.** The row against the boundary in grayscale, separable, stated.
6. **Agent.** A rendered check across two runs at two viewports, screenshots read.
7. **Agent.** The palette scan green with the lumas printed, and the four version constants and `GOLDEN` untouched.
8. **Human (Mark), and none of these blocks you.** Whether he can say what the row is telling him at a glance, on his phone and on his desktop, and whether it reads the same in the same glance on both. **That is the step's own done line and no test replaces it.**

### State of the branch

- The tip should be slice M2's docs commit. **`WITNESS_VERSION` 10, `READINGS_VERSION` as M1 left it, `FORMAT_VERSION` 4, `GOLDEN` as M1 re-pinned it.** Read all four off the tree and say what you read.
- **You are permitted no `GOLDEN` re-pin and no version move of any kind.**
- The headless browser runs at 3 to 21 FPS under SwiftShader and puts consecutive screenshots 74 to 120 ticks apart, and **a driver cannot reliably reach a full build**, which is what slice K measured and wrote down. Read note section 13 before you spend runs chasing a state.

### The stuck rule

**Three things are already known to be a stop:** any version constant or `GOLDEN` moving; no honest mark existing under the band ceiling that separates from its empty state by area; and the row's content not fitting the declared band at the narrowest phone after the mark's measurement. **And three things are ruled rather than open:** the row's placement is R1's, the mark fills rather than brightens, and the row iterates the roster. **A measurement or a gate finding arguing against any of the three goes in the note and is built past.**

### What is not your job

- **The score's countdown and the mark going dark**, both M4's. **The row draws the current state; the loss's animation is the next slice.**
- **The fallen rung**, M5's, though its body wears the icon your row teaches, which is why item (f) is decided here.
- **The field channel per line.** The record's section 7 sixth finding: step 5 builds the HUD channel whole and does not finish the field one, and making each line's rung countable in its own expression is a design job per line.
- **The dev corner stack's removal or gating**, #66's.
- **The shared widgets in `src/app/ui`** and the pause button's pink, #38's.
- **The belch's corner**, Mark's and ruled.
- **Anything under `src/game`, `src/dev` or `src/tape`.**
- **The record's section 7 findings.**

---

## Slice M4: the loss is watched (#99)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#99)`.

Slice M4 of The Hungry Grave: the sim sets the score to zero in one tick and takes a level off every line in the same one, so a player sees a number that has left rather than a number leaving, and a rung inside a dense storm goes without being seen at all. This slice makes the loss watchable on all three channels it already has.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M4.

**This slice is renderer only.** The three events already exist, no simulation rule changes, and it owes no `GOLDEN`, no witness move and no version move of any kind. **Nothing under `src/game` is in this commit.**

**Four rulings shape this slice and none of them is yours to revisit.**

**First: the score's bleed is watched, and it is a countdown rather than a snap** (record R5). The sim sets `state.score` to zero in one tick in `bleedScore` and **that does not move**. The renderer animates the readout down, which is renderer state born of a past tick and therefore a held transient, and `transients.ts` already has the registry for exactly that. **Nothing shipped subtracts from a running score on a hit and that is recorded as ours rather than pushed against** (ADR 0054); what does ship everywhere is a chain or a multiplier visibly collapsing, DoDonPachi's hit counter, Battle Garegga's medal chain, Ikaruga's chain, Resogun's multiplier, Devil May Cry's style rank, **and every one of them is watched leaving**.

**Second: the bleed's lifetime is declared in the registry and stays under `REPLAY_LEAD_IN_TICKS`** (record R5). The lead-in is honest exactly when it is at least as long as the longest lifetime in the registry, and a bleed longer than it moves that constant and the whole fast-forward with it. **The lead-in reads 90 at the tree and the record's declared starting figure is 40 ticks, two thirds of a second**, which sits well inside it and is long enough to be watched. **40 is a declared starting figure on the same terms the registry's other lifetimes are, not a measurement.**

**Third: the countdown starts from the `scoreBled` event and targets the live score, never a remembered zero** (record R5). Slice M1's rule keeps kills paying score while the grave is at the floor, so the sim's score is climbing again before the animation finishes: a countdown driving toward zero would land on a number the sim left behind and then jump, and one that eases from the bled amount toward whatever the run's score currently reads lands on the truth. **The view never diffs the score to find out a bleed happened**, because a diff cannot tell a bleed from an overflow that happened to be negative. **The driver hands it the event.**

**Fourth: the loss announces on three channels and one of them is already built** (record R7). The mark goes dark, the line's field expression blows up, and the body departs. ADR 0054 rules two and ADR 0055 adds the departure, and the three events are deliberately separate because at the size floor there is no shrink, so ADR 0040's rim channel is silent and these are the only second channel left. **Every line that paid announces, because `stripLevels` takes one off every line that has one to give: four marks going dark at once reads as the bigger event it is, and that is a consequence rather than a defect.**

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **rulings R5 and R7 in full**, then R8 for why a line's rung is carried by its own expression and not by its projectiles, **section 3.3's per-line table in full, which is the measured state of the field channel and is why this slice does not finish it**, section 4's M4 paragraph, section 5, section 6's test sentences and its paragraph on what a headless browser cannot photograph, and **section 7's sixth finding**.
4. `apps/hungry-grave/docs/research/portrait-hud-and-catchable-loss.md` section 8, the catchable-loss ground and the Sonic no-recollect beat, **and note that it is a beat rather than a timer**.
5. `apps/hungry-grave/docs/adr/0054-the-ladder-reads-twice-in-the-storm-and-on-the-hud.md` **as amended**, `0055-a-stripped-rung-falls-onto-the-field-as-a-body.md`, `0040-a-hit-announces-by-subtraction.md` and `0014-readability-layering.md`, plus `0044-territory-is-autonomous-controlling-ground.md` for why Territory's expression is ground rather than a shot.
6. `apps/hungry-grave/docs/push/round-two-progress.md` section 13's rendered check and its limits, and **the handoff's standing rule that a headless browser cannot photograph a short-lived state**.
7. `apps/hungry-grave/CONTEXT.md`, the entries **HUD, Rung, Score, Dive** and each weapon line's own entry. **Read the Avoid lists before naming anything.**
8. The tree: `src/app/screens/game/transients.ts` **whole**, including `HELD_TRANSIENT_TICKS`, `REPLAY_LEAD_IN_TICKS` and the covering test that holds them together; `src/app/screens/game/FieldRenderer.ts`'s and `StormRenderer.ts`'s own `TRANSIENT_TICKS` declarations, which are the precedent for declaring a lifetime; the HUD view slice M3 built, whole; `src/app/screens/game/GameScreen.ts`'s event handling; `src/game/events.ts`'s `scoreBled`, `weaponStripped` and `sealed` and the paragraph saying why they are three; `src/game/grave.ts`'s `bleedScore` and `stripLevels`, **to read and not to touch**; `src/game/lines/skullStream.ts`, `bell.ts`, `wisps.ts` and `territory.ts`'s level curves, to read; `src/app/palette.ts` and `src/app/__tests__/palette.test.ts`.

### The definition, in observable terms

After this slice: a hit at the size floor with score standing shows the score **falling** rather than gone, over a held transient shorter than the replay lead-in, easing toward whatever the run's score currently reads. A hit that takes levels darkens a mark on every line that paid, and the lines whose expression can carry it blow that expression up on the field.

The bleed's lifetime is declared in the transient registry beside the others, and the covering test holds the lead-in at or above every lifetime in it.

`WITNESS_VERSION`, `READINGS_VERSION`, `FORMAT_VERSION` and `GOLDEN` are all untouched and none of the four files is in the commit. **No sim rule moves**, `bleedScore` still zeroes the score in one tick, and `stripLevels` still strips in one.

What a player meets: after a hit at the floor they can name what it cost. **That is #99's whole problem and this is the slice that answers it.**

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m4`. **Slices M1, M2 and M3 must all be in the tree.**

**(b) The tests first, red.** **Write the registry test first**, that the bleed's declared lifetime is in `HELD_TRANSIENT_TICKS` and under `REPLAY_LEAD_IN_TICKS`, because it is the one that fails silently if the lifetime is declared anywhere else.

**(c) The countdown.** A held transient declared the way `FieldRenderer`'s and `StormRenderer`'s own lifetimes are declared, **40 ticks as a declared starting figure per R5**, driven from the `scoreBled` event handed in by the driver, easing from the bled amount toward the live score. **A pure function of the event, the tick and the current score, testable with no renderer**, which is what slice K's tests stand on and what lets this be pinned by test rather than by a screenshot.

**(d) The mark going dark.** On every line that paid, off the `weaponStripped` event. **Darkening is subtraction of area and never a step in value**, which is R2's rule holding at the moment of the loss too: an emptied mark is the empty mark M3 already draws.

**(e) The field expression, for the lines that can carry it today.** ADR 0054 as amended says a line's rung is carried by that line's own expression on the field, **and section 3.3 measures which of the four can be read off the field at all**: the stream's columns exactly and continuously, the bell's cones only during a toll, the wisps' count nominally but not countably, Territory's radius never, because it is an area. **Build the loss announcement for the lines whose expression is on screen, say per line what you built and what you did not, and build nothing for a line whose expression cannot carry it.** The record's section 7 sixth finding already says step 5 does not finish this channel, so **an unbuilt line is an expected outcome and a finding for the note, not a miss.**

**(f) The driver owns the events and the view owns the pixels.** The HUD stays a dumb view: it takes what it is handed and contains no change detection. **A view that inferred a bleed from a diff would be a second implementation of the rule** and would read an overflow as a bleed.

**(g) The measurements this slice owes.**

- **A rendered check, and it is the point of this slice.** The built app through `vite preview`, driven with `playwright-cli`, at a phone viewport and a desktop one, **with a hit taken at the size floor on screen**. **Read the screenshots and say what you actually saw.** **Play a run, end it, and play another.** **A headless browser cannot photograph a short-lived state**, which is the handoff's standing rule, so say plainly what the driver could and could not catch and **do not spend runs chasing a frame**: the countdown and the darkening are pinned by test and their feel is Mark's own read at sixty frames a second.
- **The registry printed**, every lifetime in `HELD_TRANSIENT_TICKS` with the bleed's beside them and `REPLAY_LEAD_IN_TICKS` above them all.
- **The per-line field channel stated**, which of the four you built and which you did not, each with the reason from section 3.3.
- **No tape, no batch and no determinism run is owed**, and that claim is checked rather than assumed. **If any of the four version constants or `GOLDEN` moves, that is a stop and report.**

**(h) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the score is watched leaving and every line that paid says so (#99)`.

**(i) The progress note**, section **10**. Beyond the contract's list, say: the countdown's shape, its declared lifetime and the registry's figures; the event-driven seam and why no diff is read; the darkening as subtraction of area; the per-line field channel built and unbuilt with reasons; the rendered check and what it could and could not see; and the four constants and `GOLDEN` all named as untouched.

**(j) Stop and report.** Under 250 words. **Do not start slice M5.** **This slice's tip is a deploy the orchestrator takes**, because the whole step's done line is Mark's read and this is where the loss first reaches a screen.

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 10, `READINGS_VERSION` as M1 left it, `FORMAT_VERSION` 4 and `GOLDEN`.** None moves, none of the four files is in the commit, and a move in any is a stop and report.
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

`src/app/screens/game/transients.ts`: the bleed's declared lifetime inside the registry, under the lead-in. The HUD view: the countdown as a pure function of the event, the tick and the live score, and the mark's darkening as an emptied mark. `src/app/screens/game/GameScreen.ts`: the three events reaching the view from the driver, and nothing inferred from a diff. The storm renderers: the loss announcement for each line whose expression can carry it.

### Module boundaries

**Nothing is created, deleted, merged or split unless the loss's announcement is its own concept**, and if it is, it is one file named for that concept with its interface at the module's end. No import direction changes. The HUD stays a dumb view and `GameScreen` stays the driver. `src/app` still reaches `src/game` for types and nothing reaches back. No new library enters.

### The planned test list

1. *A hit at the size floor with score standing bleeds the score and takes no level, and the readout is seen at a value between the old one and zero on at least one frame.*
2. *The bleed's held lifetime is declared in the transient registry and is shorter than the replay lead-in.*
3. *The countdown eases toward the live score rather than toward zero*, so a score climbing from kills while the grave is at the floor is landed on rather than jumped to.
4. *The view is told a bleed happened and never infers it*, asserted by handing the view a falling score with no event and getting no countdown.
5. *A hit at the floor with no score takes one level off every line that has one to give and darkens exactly those marks.*
6. *A darkened mark is the empty mark, differing by area and by no step in value.*
7. *A line whose expression is on screen announces its loss on the field*, one test per line built, each named for its line.
8. *Every colour the loss draws sits at or below the field's ceiling while the field is live.* Through the existing scan.
9. **The transient registry's covering test**, green, with the lead-in at or above every lifetime.
10. **The layering test**, green.

**What this slice is expected to turn red.** The HUD view's own tests, `transients`' covering test over the new entry, `GameScreen`'s event tests, the storm renderers' tests for any line you built, and `palette.test.ts` if you add an entry. **A realistic count is 6 to 12 files.** A diff larger than that is a reason to check what you reached into.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures.
3. **Agent.** The registry printed with the bleed's lifetime and the lead-in.
4. **Agent.** A rendered check across two runs at two viewports with a floor hit on screen, screenshots read, and the driver's limits stated plainly.
5. **Agent.** The per-line field channel, built and unbuilt, each with its reason.
6. **Agent.** The four version constants and `GOLDEN` untouched, with none of the four files in the commit.
7. **Human (Mark), and none of these blocks you.** Whether the score is seen to leave rather than to have left, and whether four marks going dark at once reads as the bigger event it is. **The deploy that puts it in front of him is the orchestrator's, straight after your report.**

### State of the branch

- The tip should be slice M3's docs commit. **`WITNESS_VERSION` 10, `READINGS_VERSION` as M1 left it, `FORMAT_VERSION` 4, `GOLDEN` as M1 re-pinned it.** Read all four off the tree and say what you read.
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

## Slice M5: the stripped rung falls and the dive catches it (#99)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#99)`.

Slice M5 of The Hungry Grave: a hit at the floor takes a level off every line that has one to give and the rungs simply cease to exist, so the loss has nothing the player can answer. This slice drops them onto the field as bodies that drift down with the world, so the player at the floor, under the fire that just took them, decides whether to dive after one and which one.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M5.

**Six rulings shape this slice and none of them is yours to revisit.**

**First: the bodies spawn at the grave, spread in roster order at `OFFER_SPACING`, drift at the scroll, and belong to the treasure class** (record R6). ADR 0055 rules the body and leaves where it lands, how fast it drifts and whether it decays as stage and tuning data; decision 24 rules one body per rung stripped and that a swallowed rung restores its own line. **What neither reckoned with is that `stripLevels` takes one level off every line that has one to give, all in the same tick**, so a single hit at the floor can strip four rungs and drop four bodies at once.

**Second: they spread rather than stack, and the spacing is the offer's own.** `OFFER_SPACING` is **90 field units** and was derived from the grave's own reach so that two adjacent bodies are both reachable only from inside 45 units of their midpoint, which puts a two-body catch outside a start-size grave entirely. **Reusing it makes the loss the mirror of the gain**: a gain is three bodies side by side and the grave gets the one it passes under, a loss is up to four and the grave gets back the one it dives for. **The choice of which line to save is a real move rather than a free sweep**, which is what keeps the floor ladder's teeth in. **#81 is open on bodies stacking on one spot and already names the rung body as a new caller**; it is not yours to close.

**Third: they drift at the scroll and nothing else, and they do not decay** (record R6). The scroll is already the corpse deadline and the power-up deadline both, and a second speed would be a second rule for a reader to hold. **`CONTEXT.md`'s Treasure entry makes never-decaying treasure's defining property**, and the `Corpse` record already carries a `decays` flag per body, so the fallen rung's row sets it false. **The test asserts the default and not an impossibility**, because ADR 0055 and decision 20 both leave decay as data and a later tuning pass may turn it on without a record to re-rule. **An untaken fallen rung stays on the field until the scroll takes it**, which is Battle Garegga's own answer: a dropped power item is an ordinary field item on the ordinary clock.

**Fourth: they spawn offset from the grave rather than on it** (record R6). The design gate found a lone body spawning at the grave's own position and landing inside the swallow box, **which would hand the rung straight back on the tick it was lost and make the whole loss a flicker**. The offset clears the grave's half-extent plus the body's own at the size floor, **and it is a data row rather than a constant**, so the spread and the offset are the same rule read on two axes. The transferable part of Sonic's 64-frame no-recollect window is that the loss registers before the chase is possible, **and here that is geometry rather than a clock**.

**Fifth: a fallen rung is a fourth kind on an existing pool rather than a new pool** (record section 3.4). `Corpse` already carries `kind`, `line`, `decays` and `halfExtent`, and `FoodKind` is `'corpse' | 'powerUp' | 'feast'`. **The fourth kind gets the swallow path, the scroll, the containment and the renderer for free**, which is the cheapest shape available.

**Sixth: each body wears the icon its HUD row taught** (record R6). A rung body has to be told from an offer's body and from another line's rung, and **the design gate found no test pinning the second**. ADR 0014 makes the classes tellable by silhouette first and brightness second, so **the icon parts one rung from another and the treasure class's own shape parts a rung from an offer**. **#122's complaint that the offer is not separable at a glance is a reason to give the rung its own shape rather than to share one**, and it is #122's ticket and not yours.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **ruling R6 in full, which is the whole of this slice**, then R3 for roster order, section 3.4 for the pool, **section 4's M5 paragraph and its four notes a coder would otherwise find the hard way**, section 5 for the budget and the at-most permit, section 6's test sentences, and section 7's last finding.
4. `apps/hungry-grave/docs/research/portrait-hud-and-catchable-loss.md` **section 8 in full**: the negative result that no shmup drops power to be chased, Battle Garegga's lingering item, **Defender naming the risk variable**, Sonic's sourced numbers and the no-recollect beat, and Vampire Survivors' magnetised gems as the contrast case with no dive-back tension at all.
5. `apps/hungry-grave/docs/adr/0055-a-stripped-rung-falls-onto-the-field-as-a-body.md` in full, plus `0004` for freshness and the decay curve, `0034-a-power-up-is-an-offer-of-three-and-the-grave-swallows-one.md` for the offer's own spread, `0014-readability-layering.md` for silhouette first, and `0019` for the fold and the refusal rule.
6. `apps/hungry-grave/docs/design/decision-log.md` entries **20 and 24**, the scroll deadline and one body per rung, **read as frozen** (the decision log is not reopened).
7. `apps/hungry-grave/docs/push/round-two-progress.md` **section 15 in full**, which is J2's account of a corpse that gained folded state and what it cost, and **why a fold that does not widen the field list moves no version**.
8. `apps/hungry-grave/CONTEXT.md`, the entries **Fallen rung, Rung, Dive, Corpse, Treasure, Freshness** and **Offer**. **Read the Avoid lists before naming anything.**
9. The tree, whole where it is short and by function otherwise: `src/game/corpses.ts` whole, especially the `Corpse` interface's own JSDoc and every spawn path; `src/game/swallow.ts`'s `FoodKind`, `Swallowable` and the swallow path; `src/game/grave.ts`'s `stripLevels`, `strippableLines` and `runFloorLadder`; `src/game/offer.ts`'s `OFFER_SPACING` and its derivation comment and the spread it computes; `src/game/lines/roster.ts`'s `WEAPON_LINES`, `MAX_LEVEL` and `implementsLines`; `src/game/run.ts`'s `roster`; `src/game/witness.ts`'s `foldCorpses` and the `WITNESS_VERSION` JSDoc's own rule; `src/game/field.ts` and `tuning.ts`'s `SCROLL_SPEED`; `src/app/screens/game/FieldRenderer.ts`'s treasure predicate; `src/app/screens/game/foodSprite.ts`'s `drawPowerUpIcon`, `drawPowerUp` and `drawOptionlessBody`; `src/dev/digest.ts`'s `runScenario` and `GOLDEN`.

**Three notes the record read out of the tree for you, each of which would otherwise cost you a rebuild.**

1. **`FieldRenderer` picks the treasure layer with `corpse.kind === 'powerUp'`**, so a fourth kind draws as a plain corpse until that predicate is widened. **Widen it by kind and never by a new flag.**
2. **`stripLevels` walks `WEAPON_LINES` and not `state.roster`**, so the order the bodies spawn in would be the build's rather than the run's. **R3 and R6 both speak in roster order, so make the walk read the roster.** It changes no behaviour today, because `implementsLines` already keeps a roster inside the pool, **and it is the line a fifth weapon would break**.
3. **A corpse thrown or dropped past the bottom edge is lost the way any corpse is.** That is the existing rule doing its job and it is not a thing to repair.

### The definition, in observable terms

After this slice: a hit at the floor with no score takes one level off every line that has one to give and **drops exactly that many bodies**, standing apart at the offer's own spacing, in roster order, every one of them inside the field and every one of them clear of the grave's own swallow box at the size floor. They drift at the scroll alone, never decay, and are lost off the bottom edge the way any body is. Swallowing one restores the line it came from and no other, and a line at its cap is never restored past it. A fallen rung is told from an offer's body by silhouette with colour removed, and one line's fallen rung is told from another's by the icon its HUD row taught.

**`WITNESS_VERSION` does not move**, because the fallen rung rides the corpse pool on fields the fold already carries and `witness.ts`'s own rule is that the version moves when the field list moves. **`GOLDEN` is permitted at most one re-pin and the expected outcome is that it goes unused**, because the golden scenario never grinds the grave to the size floor and so can never strip a rung. `READINGS_VERSION` and `FORMAT_VERSION` do not move.

What a player meets: they try for a falling rung at least once, and they sometimes decide not to.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m5`. **Slices M1 through M4 must all be in the tree.**

**(b) The tests first, red.** **Write the spread test first**: a floor hit that strips four lines drops four bodies, standing apart at `OFFER_SPACING` in roster order, every one inside the field. It is the test that fails if any of the four rulings above is missed.

**(c) The fourth kind.** A fourth `FoodKind` on the existing corpse pool, carrying the line it came from in the field `Corpse` already has, with `decays` false **as its row's default and not as an impossibility**. **A new pool is a stop**: the record rules the fourth kind and the reason is that the swallow path, the scroll, the containment and the renderer come free with it.

**(d) The drop.** One body per rung stripped, spawned where the loss happened, **spread at `OFFER_SPACING` in roster order and contained inside the field**, offset from the grave by a data row that clears the grave's half-extent plus the body's own at the size floor. **Both the spacing's reuse and the offset's row are named in the note with what you set each against**; the offset's figure is yours to derive from the extents and to annotate as a first figure.

**(e) The restore.** A swallowed fallen rung restores the line it came from and no other, and **a line at its cap is never restored past it**. `MAX_LEVEL` is the cap and the levels record is what it binds.

**(f) The renderer.** The treasure predicate widened by kind, and the body wearing **the icon slice M3's row taught**, which is the vocabulary `drawPowerUpIcon` already holds. **Keep `foodSprite`'s own two properties: the aspects stay apart and each icon fills its box.** The treasure class's own shape is what parts a rung from an offer, and the icon is what parts one line's rung from another's.

**(g) The witness, and it does not move.** The tech gate ruled this and the record carries it: **this slice declares no new folded field**, because the fallen rung rides the corpse pool with a fourth kind and the `line` and `decays` fields the fold already carries. **If your shape needs a new folded field, stop and report before you write it**, because the step's whole witness budget was spent in M1 and a second move is a stop.

**(h) `GOLDEN`, and the permit that is expected to go unused.** Run `digest.test.ts`. **The expected outcome is green**, because `digest.ts`'s scripted run never grinds the grave to the size floor, so nothing in it can strip a rung. **A move there is a finding to explain before it is a re-pin**: show the cause, show every other field holding, and only then pin. **A re-pin you cannot explain is a stop and report.**

**(i) The measurements this slice owes.**

- **A rendered check, and it is the point of this slice.** The built app through `vite preview` driven with `playwright-cli`, at a phone viewport and a desktop one, **with a floor hit that strips more than one line on screen**, and the bodies visibly standing apart rather than stacked. **Read the screenshots.** **Play a run, end it, and play another.**
- **One question answered in words: can you tell a fallen rung from an offer's body, and one line's rung from another's, with the colour removed?** ADR 0014 makes silhouette the first discriminator, so the answer should be yes; **if it is not, that is a readability finding for the note** and a measurement, not a redesign you take here.
- **Replay determinism at your tip with a fallen rung on the field at a checkpoint.** Two plays of one seed under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
- **A conditioned tape at the ladder rig with levels pinned**, measured to `outcome: 'verified'`, because a strip needs levels to take.
- **A batch at your tip** on the configurations and seeds M1 used, with the floor-hit split printed. **The bot walks to a body at the bottom of the field by its base policy (ADR 0053), so its take rate on fallen rungs is a reading rather than a bug**; print what you see and leave M6 to declare it.
- **The freshness question answered rather than assumed**: a fallen rung never decays, so **say what that means for the payout path and for any reading keyed by food kind**, because `tuning.freshness` is keyed by `FoodKind` and a fourth key arrives beside the existing three. **A new key beside unchanged ones does not move `READINGS_VERSION`** (`readingsVersion.ts`'s own rule), and if you find an existing reading whose meaning moves, **stop and report rather than moving the version**.

**(j) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): a stripped rung falls onto the field as a body the dive can catch (#99)`.

**(k) The progress note**, section **11**. Beyond the contract's list, say: the fourth kind and why it is not a new pool; the spread and the offset with what each is set against and which figures are first figures; the roster walk changed in `stripLevels` and that it changes no behaviour today; the restore and the cap; the renderer's widened predicate and the icon reused; the silhouette answer in words; the witness named as unmoved with the rule quoted; `GOLDEN` green or explained; the batch and the bot's take rate; and `FORMAT_VERSION` 4 and `READINGS_VERSION` named as held.

**(l) Stop and report.** Under 300 words. **Do not start slice M6.**

### What must not move, and a move is a stop

- **`FORMAT_VERSION` 4 and `READINGS_VERSION`.** Nothing here changes the wire, and a new key beside unchanged readings does not move the readings version.
- **`WITNESS_VERSION` does not move.** The step's one move was M1's. **A shape that needs a new folded field is a stop and report before it is written.**
- **`GOLDEN` is permitted at most one re-pin, and the expected outcome is that it goes unused.** A move is explained before it is pinned, and an unexplained one is a stop.
- **`OFFER_SPACING` 90 and the offer's own spread.** You reuse it; you do not retune it, and a measurement arguing it should move is a finding for the note.
- **The scroll is the one deadline.** No second speed, no early expiry, no decay on by default, and **nothing else removes a fallen rung**.
- **`FRESHNESS_SECONDS`, the decay curve, the payout floor and `CORPSE_CAP`.** A fourth kind rides the pool at the pool's own rules.
- **`stripLevels`' rule**, one level off every line that has one to give, in the same tick. **The walk's order changes to the roster and the rule does not.**
- **`MAX_LEVEL` 5 and the cap**, which a restore never crosses.
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty. **`src/game` stays dependency-free and pure.**
- **Every cap, every fault identity, `STREAM_SALTS` and `STREAM_ORDER`.** The fault list is closed and append-only (ADR 0024).
- **The layering** and the band ceiling, with nothing drawing above `mobFire` and no colour above the ceiling while the field is live.
- **You file no ADR and amend none.** ADR 0055 already rules the body; **applying a rule is not amending it.**
- **#81 stays open.** Nothing here closes it and the rung body is a new caller it already names.

### Seams under test

`src/game/corpses.ts`: the fourth kind on the existing pool, its row's `decays` default, and a body that drifts at the scroll alone. `src/game/grave.ts`: one body per rung stripped, spread at the offer's spacing in roster order, inside the field, clear of the swallow box. `src/game/swallow.ts`: a fallen rung restoring its own line and never past the cap. `src/game/witness.ts`: the fold unchanged, asserted rather than assumed. `src/app/screens/game/FieldRenderer.ts` and `foodSprite.ts`: the treasure layer picked by kind and the body wearing its line's icon.

### Module boundaries

**Nothing is created, deleted, merged or split, and no import direction changes.** The fourth kind joins the module that owns the food kinds and the body joins the module that owns corpses, because a helper joins the file whose concept it serves. **`src/game` reaches nothing outward**, the cycle guard stays empty, and `src/dev` reads events and never writes the run. **Run the cycle guard and confirm it for yourself rather than taking this paragraph's word**, on round two's own history with exactly that claim. No new library enters.

### The planned test list

1. *A hit at the floor with no score takes one level off every line that has one to give, darkens exactly those marks, and drops exactly that many bodies.*
2. *A stripped rung's bodies stand apart at the offer's own spacing, in roster order, every one of them inside the field.*
3. *A fallen rung spawns clear of the grave's own swallow box at the size floor, so the body that was just lost is not handed back on the tick it fell.*
4. *A fallen rung drifts at the scroll alone, never decays, and is lost off the bottom edge the way any body is.*
5. *A fallen rung's row sets decay off by default, and a row that turns it on decays, so non-decay is the default rather than an impossibility.*
6. *A fallen rung nobody takes stays on the field until the scroll carries it off, and nothing else removes it.*
7. *Swallowing a fallen rung restores the line it came from and no other, and a line at its cap is never restored past it.*
8. *A fallen rung is told from an offer's body by silhouette with colour removed, and one line's fallen rung is told from another's by the icon its HUD row taught.*
9. *The bodies spawn in the run's roster order and not the build's*, which is the line a fifth weapon would break.
10. *A replay with a fallen rung on the field at a checkpoint rebuilds identically.*
11. *The witness's field list does not move*, asserted, because this slice is permitted no version move.
12. **The fences**, green, each by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
13. **The golden digest**, green and unmoved, or moved with its one cause proved.

**What this slice is expected to turn red.** `corpses.test.ts`, `swallow.test.ts` and `grave.test.ts` throughout, `offer.test.ts` wherever the spacing is asserted, `witness.test.ts`, `FieldRenderer`'s and `foodSprite`'s tests, `caps.test.ts` and `invariants.test.ts` over a fourth kind in the pool, `measure.test.ts`'s rich fixture, and `harnessPolicy.test.ts`'s measured per-seed baselines, **re-measured with the reason beside each and never re-pinned blind**. **A realistic count is 14 to 22 files.** A diff much smaller than that is a reason to check what you have not reached.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures.
3. **Agent.** Replay determinism with a fallen rung on the field at a checkpoint.
4. **Agent.** A conditioned tape at the ladder rig measured to `outcome: 'verified'`.
5. **Agent.** A batch with the floor-hit split and the bot's take rate on fallen rungs printed.
6. **Agent.** A rendered check across two runs at two viewports with a multi-line strip on screen, screenshots read, and the silhouette question answered in words.
7. **Agent.** The witness named as unmoved with the rule quoted, `GOLDEN` green or explained, and `FORMAT_VERSION` and `READINGS_VERSION` held.
8. **Human (Mark), and none of these blocks you.** Whether he chases one, whether he ever decides not to, and whether the choice of which line to save is a real move. **This and M4 are what the whole step's done line rests on.**

### State of the branch

- The tip should be slice M4's docs commit, and **the branch may have been deployed between M4 and you**, which is the orchestrator's and not a change to your tip.
- **`WITNESS_VERSION` 10, `READINGS_VERSION` as M1 left it, `FORMAT_VERSION` 4, `GOLDEN` as M1 re-pinned it.** Read all four off the tree and say what you read.
- **You are permitted at most one `GOLDEN` re-pin and the expected outcome is that it goes unused.** M6 is permitted none.
- The headless browser runs at 3 to 21 FPS under SwiftShader and puts consecutive screenshots 74 to 120 ticks apart. That is the harness and not the build.

### The stuck rule

**Four things are already known to be a stop:** a shape that needs a new folded field; a `GOLDEN` move you cannot explain; a fence, a cap or a fault identity moving; and a new corpse pool. **And four things are ruled rather than open:** the spacing is the offer's own, the drift is the scroll alone, non-decay is the row's default rather than an impossibility, and the body wears its line's icon. **A measurement arguing any of the four should move is a finding for the note and a tuning-step input, never a row you move here.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **#81**, bodies stacking on one spot, which already names the rung body as a new caller and is not closed here.
- **#122**, the offer reading as a bubble, which is Mark's round-two ticket.
- **Cave Story's MAX buffer**, ruled out of V1 and filed in the record's section 7.
- **Declaring a reading**, M6's. You measure and print; you declare nothing.
- **Retuning freshness, the corpse cap or the decay curve** because a fourth kind arrived. That is a measurement and a finding.
- **The field channel per line**, the record's section 7 sixth finding.
- **The dev corner stack**, #66's, and **the shared widgets**, #38's.
- **The record's section 7 findings**, none of which any slice acts on.

---

## Slice M6: the ladder's cost is measurable (#99)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#99)`.

Slice M6 of The Hungry Grave: the batch cannot print the two numbers this step's own argument turns on, because nobody has declared them. This slice declares them.

**The standing rules are in `step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice M6.

**Three rulings shape this slice and none of them is yours to revisit.**

**First: the two readings are the bot's take rate on fallen rungs and strips per run** (record section 4's M6 paragraph). **A body at the bottom of the field is something the base policy will always walk to** (ADR 0055 and ADR 0053), so the take rate is a reading rather than a bug. **Strips per run is what says whether R4's bled-rung memory left the level strip reachable in ordinary play or whether the storm's kill rate still buries it**; the vision gate and the design gate both asked for it, **and it is the evidence beside the record's section 7 first finding when Mark answers it.**

**Second: `READINGS_VERSION` does not move in this slice, and the tech gate is right to stop it** (record section 4 and section 5). `readingsVersion.ts`'s own rule is that the version moves when a reading's **meaning** changes, a split or a redefinition, and not when new readings arrive beside unchanged ones. **Both of these are new.** **Slice M1 already moved it 6 to 7, for `run.score`'s meaning changing under R4, and that is the step's one move and it is spent**; your two readings arrive beside unchanged ones and move nothing. **If you find an existing reading whose meaning moved under this step, that is a stop and report and never a version bump you take**, because a move beyond the record's budget is the orchestrator's call under one-push mode.

**Third: it is its own commit rather than part of M5**, for round two's stated reason that a reading landing in the same commit as the mechanic hides which of the two moved a number.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/show-what-you-have.md`: **section 4's M6 paragraph and its `READINGS_VERSION` paragraph in full**, R4 in full for what the strips reading is evidence about, section 5, and **section 7's first finding, which is the question these numbers answer**.
4. `apps/hungry-grave/docs/adr/0053-the-playing-harness-is-one-policy-over-many-seeds.md` in full, **especially the harness reports and never judges**, plus `0055`.
5. `apps/hungry-grave/docs/push/round-two-progress.md` **section 9 in full**, which is slice I declaring a reading, splitting an existing one and writing a version note, and **section 15's readings item**, which is J2 doing the same for two arms at once.
6. `apps/hungry-grave/docs/push/step-4-progress.md`'s own storm kill rate, **2.47 bodies a second**, which is the number R4's whole mechanism was ruled against.
7. `apps/hungry-grave/CONTEXT.md`, the entries **Fallen rung, Rung, Dive, Score** and **Tape**. **Read the Avoid lists before naming anything.**
8. The tree: `src/dev/readings/readings.ts` and two or three of its siblings read whole as the shape to follow, **including `powerUpLedger.ts` and `refusals.ts`**; `src/dev/readingsVersion.ts` whole; `src/dev/batchReport.ts` and `src/dev/compareRuns.ts` where readings are declared and where comparing one is declared to mean something; `src/dev/bot.ts` for the base policy that walks to a body; `src/dev/harnessPolicy.ts` and its measured baselines; `src/game/events.ts` for the events a reading is built from, **because a reading reads events and never the run**.

### The definition, in observable terms

After this slice: a batch prints **what share of fallen rungs the bot took and what share the scroll carried off**, and **how many times a run's floor ladder bled and how many times it stripped**, per run and across a batch. Both are new keys beside unchanged ones, **so every reading that existed before still means exactly what it meant** and `READINGS_VERSION` does not move.

`WITNESS_VERSION`, `READINGS_VERSION`, `FORMAT_VERSION` and `GOLDEN` are all untouched. **No simulation rule changes and nothing under `src/game` or `src/app` is in this commit.**

What this buys: the record's section 7 first finding stops being an argument and becomes a number beside Mark's own play.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step5/` under a name carrying `m6`. **Slices M1 through M5 must all be in the tree**, because a reading declared over a mechanic that is not there measures nothing.

**(b) The tests first, red.** **Write the declaration test first**: every reading declares what comparing it means, which is an existing fence and the one your two readings have to satisfy.

**(c) The take rate.** What share of fallen rungs were swallowed and what share the scroll carried off, built from the events and never from the run's state. **Name what it is a share of and say so in the reading's own declaration**, because a rate whose denominator is not written down is the reading `readingsVersion.ts`'s worked example exists to warn about.

**(d) Strips per run.** How many floor hits bled and how many stripped, and **what the bled-rung memory did between them**, because the whole question is whether the strip is reachable in ordinary play. **The harness reports and never judges** (ADR 0053): the reading prints what happened and says nothing about whether it is enough.

**(e) The version, held, with the reason written down.** Both readings are new beside unchanged ones, so nothing moves. **Say so in the note with `readingsVersion.ts`'s own rule quoted**, the way round two's slice I said the opposite with the same rule quoted.

**(f) The measurements this slice owes.**

- **A batch at your tip** on the configurations and seeds M1 and M5 used, with both new readings printed beside the existing ones. **Print the strips per run against the storm's measured 2.47 kills a second**, which is the figure R4's mechanism was ruled against.
- **The bot's take rate stated plainly, with what it measures and what it does not.** **The bot is not a player**: it only dodges, so its number measures the policy rather than the game, and it is never a reason to skip Mark's own play.
- **A reading that comes out at zero is a finding to explain before it is a result.** A take rate over no fallen rungs means the batch's runs never reached the floor with levels to lose, which is a fact about the configuration and is worth saying out loud.
- **No witness move, no `GOLDEN` re-pin and no determinism run is owed**, and that claim is checked rather than assumed: nothing under `src/game` is in this commit. **If any of the four version constants or `GOLDEN` moves, that is a stop and report.**

**(g) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the batch reads what the ladder cost and what the dive took back (#99)`.

**(h) The progress note**, section **12**. Beyond the contract's list, say: both readings with their denominators named; the batch's figures for each; the strips per run against the storm's kill rate; `READINGS_VERSION` named as held with the rule quoted; the bot's take rate with what it measures and what it does not; and the four constants and `GOLDEN` all named as untouched.

**(i) Stop and report.** Under 250 words. **This is the step's last building slice**; step 5.7 is the gates, then CodeRabbit on the exact tip, then a batch, then the deploy, and all four are the orchestrator's.

### What must not move, and a move is a stop

- **`WITNESS_VERSION`, `READINGS_VERSION`, `FORMAT_VERSION` 4 and `GOLDEN`.** None moves, none of the four files is in the commit, and a move in any is a stop and report.
- **Every existing reading's meaning.** A new key goes beside them; none of them is widened, split or renamed.
- **The harness reports and never judges** (ADR 0053), which is a fence by that name.
- **The harness's own rows and its measured per-seed baselines**, which are re-measured with a reason and never re-pinned blind.
- **The fences**, every one by title, plus the core's cycle guard.
- **Nothing under `src/game` or `src/app` is in this commit**, and `src/dev` reads events and never writes the run.
- **No ADR is filed or amended.**

### Seams under test

`src/dev/readings/`: the two new readings, each built from events, each with its denominator named. `src/dev/batchReport.ts` and `src/dev/compareRuns.ts`: each reading declaring what comparing it means. `src/dev/readingsVersion.ts`: the version held, with the reason in its own prose.

### Module boundaries

**Two readings join the readings folder as their own concept modules, or one if they are one concept**, named for what they measure, with their public interface at the module's end. **Nothing is deleted, merged or split.** `src/dev` imports only from `src/dev`, `src/game` and `src/tape`, which is a fence by name. No new library enters.

### The planned test list

1. *A swallowed fallen rung is counted as taken and one the scroll carried off is counted as lost.*
2. *The take rate's denominator is every fallen rung the run dropped*, asserted rather than described.
3. *A run with no fallen rungs reports a take rate of nothing rather than a rate of zero*, so an absent measurement is not read as a measured zero.
4. *A floor hit that bleeds and a floor hit that strips are counted apart.*
5. *A run reports the strips it took, the bleeds it took, and them in the order they happened.*
6. *Every reading declares what comparing it means.* The existing fence, green over your two.
7. *The harness reports and never judges.* The existing fence, green.
8. *Both readings are new beside unchanged ones, so no existing reading's meaning moved.* Asserted by the version staying put with its reason.

**What this slice is expected to turn red.** The readings' own tests, `batchReport`'s and `compareRuns`' declaration tests, and the fence tests over the new declarations. **A realistic count is 5 to 10 files.** A diff larger than that is a reason to check what you reached into.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures.
3. **Agent.** A batch with both readings printed, and the strips per run set beside the storm's 2.47 kills a second.
4. **Agent.** The fences green, each named by test title, including *every reading declares what comparing it means* and *the harness reports and never judges*.
5. **Agent.** The four version constants and `GOLDEN` untouched, with none of the four files in the commit.
6. **Human (Mark), and none of these blocks you.** The record's section 7 first finding is his to answer, **and these two numbers are the evidence beside the question rather than the answer to it**. His own play is the answer.

### State of the branch

- The tip should be slice M5's docs commit. **`WITNESS_VERSION` 10, `READINGS_VERSION` as M1 left it, `FORMAT_VERSION` 4, `GOLDEN` as M1 re-pinned it or as M5 explained it.** Read all four off the tree and say what you read.
- **You are permitted no `GOLDEN` re-pin and no version move of any kind.**
- **You are the last building slice.** Step 5.7 is the orchestrator's: the gates, then CodeRabbit on the exact tip, then a batch, then the deploy. **Gates before the reviewer, because a finding that changes code invalidates a review.**

### The stuck rule

**Three things are already known to be a stop:** any version constant or `GOLDEN` moving; an existing reading whose meaning moved under this step, which is reported and never fixed with a bump; and a reading that cannot be built from events without reading the run's own state. **And two things are ruled rather than open:** the version does not move, and the harness reports rather than judges. **A number that argues against something Mark ruled goes in the note for his read and is never applied.**

### What is not your job

- **Tuning anything.** The readings exist so the tuning step has numbers; **the tuning step is step 6** and the record's own note says so.
- **Judging the numbers.** ADR 0053.
- **The gates, the review, the batch and the deploy**, all step 5.7's and all the orchestrator's.
- **Anything under `src/game` or `src/app`.**
- **The record's section 7 findings**, none of which any slice acts on.
