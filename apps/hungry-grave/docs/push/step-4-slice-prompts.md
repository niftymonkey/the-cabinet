# Step 4 slice prompts

One block per slice, in the order the plan's section 10 dispatches them, with slice B0 ahead of the plan because the handoff put it there. The launch preamble is the same for every slice: name the playbook, name the plan sections carrying the dispatch contract items, then give the slice.

**Step 4 has no coder contract file of its own.** `step-2-coder-contract.md` and `step-3-coder-contract.md` exist; there is no `step-4-coder-contract.md`. Each block below therefore carries the contract inline, in the shape of `step-3-coder-contract.md`: where and how to work, the reading order, the flow, the stuck rule, the commands. A later slice that wants a file rather than a repeated block is free to lift these sections into one.

---

## Slice B0: the glossary realignment

Model: Opus, subagent type general-purpose. One coder, one code commit, one docs commit. Commit messages end in `(#39)`, which is the ticket every step 4 docs and code commit cites.

Step 4 slice B0 of The Hungry Grave (ticket #39): the glossary realignment, six words moved to the genre's vocabulary.

This slice is a vocabulary change and a mechanical rename. It changes no rule of the simulation, no magnitude, and no player-visible behaviour. If anything you do changes behaviour, the slice is wrong: stop and report.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. Its dispatch contract items are carried in the six sections below rather than in a plan file, because the step 4 plan predates this slice.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md` at the repo root, plus `docs/agents/code-examples.md` for any rule that leaves the path unclear, and `docs/agents/lessons.md`.
3. `apps/hungry-grave/docs/research/six-words-realigned-to-the-genre.md`, 90 KB, read it with the Read tool in ranges and never with `cat`. **This record is your specification.** Section 7 is the rename map and the rename order, section 8 is the version constants, section 9 is the ADR filenames, section 10 is the draft ADR text, section 11 is the new `CONTEXT.md` entries and the other entries the rename touches, and its Open items list the hazards. Where this prompt and that record disagree, this prompt wins and you record the disagreement in the progress note.
4. `apps/hungry-grave/docs/push/handoff.md`, the STEP 4 BRIEF and the Standing rules. Mark's ruling of 2026-09-09 is item 4 of the brief and it is what this slice executes.
5. `apps/hungry-grave/docs/push/step-4-progress.md`, sections 1 to 7 for the state of the step, section 6 for the test baseline's real path, and sections 11 and 12 for what slice A landed and what the second gate round wrote in the old vocabulary.
6. `apps/hungry-grave/CONTEXT.md` in full. It is 233 lines and 107 terms and you are editing it.
7. `apps/hungry-grave/docs/adr/`, the eight ADRs section 9 of the record renames, for their titles.

### The definition, in observable terms

After this slice: a reader opening `src/game/stage/` finds `waves.ts` and `formations.ts` and no `rows.ts` or `templates.ts`; a reader opening `src/game/bosses/` finds `phases.ts` and no `chunks.ts`. `StageState` carries `sectionIndex`, `sectionTick` and `firedWaves`, and `Boss` carries `phaseIndex` and `phaseHp`, and no two things in the domain are called a phase. `CONTEXT.md` holds Phase, Section, Wave, Standing wave, Formation, Power-up and HUD, and holds no Chunk, Row, Standing row, Template, Drop or Strip. A batch report prints `sectionSpans` and `tuning.powerUpLedger.*` and `tuning.arrivals.bySection`, and `READINGS_VERSION` reads 4 so no version 4 report is silently compared to a version 3 one. The tape format, the witness fold and the golden digest are untouched: a tape recorded before this slice still decodes, still replays, and still verifies. `pnpm verify` is green and the test count is the baseline plus nothing, with every difference in the test-name diff a rename and never a removal.

### The work, in this order

Do these in order. The rename order inside item (d) is the part that bites, and it is spelled out there.

**(a) The ADR on the vocabulary ruling, filed first.** The next free number is **0061**; 0001 to 0060 are taken and the highest on disk is `0060-growth-over-the-run-is-authored-per-section-and-the-director-never-owns-it.md`. One decision, and the title names it: the system layer uses the genre's words and the flavor stays at the player's surface. The six words are the consequence of that one decision and belong in the same ADR, because they were decided as one trade-off. The draft text is the record's section 10 and it is good; you may tighten it, and you must not add a second decision to it.

The ADR conventions, from the handoff's Standing rules: **no YAML frontmatter anywhere**, prose paragraphs in the shape the existing ADRs use, no headings inside the body, no bullets, the ruled-by line last. Supersession, where an ADR is edited in place, is dated inline bold prose carrying the what-stood, what-it-replaced, what-it-could-not-have-known triple; **0061 is a new question and supersedes nothing**, so it carries no supersession note of its own.

One thing in the draft is flagged by the record's own Open items and is yours to decide rather than to smuggle: the fifth paragraph turns Mark's ruling into a two-part admission test and adds a half he did not say out loud, that a term with no settled genre word stays as it is. Keep it, because it is what holds the standing wave's qualifier in place, and **write it as the record's own reading rather than as Mark's words**, so his review sees the addition rather than reading it as his.

**(b) `CONTEXT.md` updated.** The seven replacement entries are the record's section 11, and they are written to be pasted: Phase (in the Bosses section, replacing Chunk), Section (in The field and the stage, absorbing the old Phase entry and replacing the old three-trash-section Section entry at line 129), Wave (replacing Row), Standing wave (replacing Standing row), Formation (replacing Template), Power-up (replacing Drop), HUD (replacing Strip). Each keeps its place in its existing section of the file so the file's order does not churn.

Then the entries whose bodies name an old word, which the record's section 11 lists under "The other entries the rename touches" and which you must finish rather than take as complete: work the file top to bottom and fix every body and every Avoid list that names one of the six. Carrier, Card, Cone, Checkpoint, Ladder, Purse, Treasure, Overflow, Offer, Swallow, Corpse, Rung, Freshness, Boss, Feast, Burst, Sparse last row, The Crowd, The Procession, The Vigil, Directed density, Set piece, Armed, Stage, Arriving beat and Mob are the ones already found; a grep at the end is what proves none is left.

**The second gate round's own entries are in the old vocabulary and are yours.** The progress note's section 12 says so in its own words: "A rename pass follows separately and none of these words were written in its vocabulary." That covers The mow, Signal lock, Ladder, the Add clause, the Row entry's standing clause and the rewritten Standing row entry, all landed at `cb230c765c`. They realign here like everything else.

**(c) The eight ADR filename changes.** The record's section 9 gives the table: 0006, 0016, 0034, 0041, 0051, 0052, 0054, 0056. **The number never changes and the file is moved rather than copied**, so `git log --follow` still reads. Each file's `# Title` line takes the same edit, and each body's prose takes the rename where it names one of the six.

ADR bodies cite each other by number and every code citation is of the form `(ADR 0016)`, so those do not break. **Four files do name an ADR by filename and their links break if you do not fix them**, so fix the path and nothing else in those files:

- `docs/research/stage-length-with-a-director.md:352` (0034)
- `docs/research/six-words-realigned-to-the-genre.md:37` and `:608` (0034, 0054)
- `docs/design/dispatch-4-field.md:13` (0016, 0006)
- `docs/design/dispatch-5-weapons.md:13` (0016)

`dispatch-5-weapons.md:13` also carries a link to `0008-the-belch-full-only-the-bomb-everywhere.md`, which does not exist and has not for some time; the real file is `0008-the-belch-full-only-gas-everywhere-burst-nearby.md`. That is a pre-existing broken link and none of the six words. **Do not fix it and do not chase it**: record it in the progress note as a finding and leave it.

The nine ADRs checked and deliberately not renamed are in the record's section 9: 0009, 0032, 0046, 0055, 0049, 0050, 0060, and Section stands so its titles stand. Take that list as given.

**Prose inside `docs/design` and `docs/adr` bodies beyond the eight titles is not this slice.** Twenty three files under `docs/design` and thirty five under `docs/adr` carry at least one of the six somewhere in their prose. The eight renamed ADRs take the edit because their titles moved; everything else stays, and a follow-up docs pass owns it. Say so in the progress note so nobody reads the leftovers as a miss.

**(d) The mechanical code rename, with the compiler as the net, in this order.** Scope is `apps/hungry-grave/src` and `apps/hungry-grave/scripts`. `src/prototypes/ugly-slice/**` is excluded under ADR 0010 and does not move, whatever it contains.

The map is the record's section 7 and it is 127 distinct renames across five tables: 20 chunk to phase, 27 phase to section, 19 row to wave, 7 template to formation, 28 drop to power-up, 0 for strip to HUD. Each table also lists what does **not** move, and those lists are as load-bearing as the renames.

**The order, and why it is not negotiable.** There is a real collision and a blind sequential edit walks into it:

1. **Phase to section first.** `StageState.phaseIndex` becomes `sectionIndex` before anything else. Only then chunk to phase, which turns `Boss.chunkIndex` into `Boss.phaseIndex`. Reversed, two different things are called `phaseIndex` at the same time, the compiler is happy with both, and a witness fold or a test reads the wrong one silently. The record's solid-claims item 12 is this hazard stated in full.
2. **A second collision sits inside step 1 and is confirmed in the tree.** `bossPhases` already exists, at `src/game/bosses/__tests__/chunks.test.ts:137`, where it means the stage phases that carry a boss. Step 1 renames it to `bossSections`, which frees the name for step 2's `bossChunks` to become `bossPhases`.
3. **Then row to wave, template to formation, and drop to power-up, in any order.**
4. **Strip to HUD is glossary-only**: zero identifiers, and the verb stays (`weaponStripped`, `WeaponStripped`, `weaponStrips`, `linesStripped`, `stripLevels`, `strippable`, `strippableLines`, `stripping`).

Run `pnpm typecheck` between each of the five, not only at the end. The compiler is the net and it only catches you if you let it fire.

**The traps, each verified in the tree, each of which a careless grep-and-replace breaks:**

- **`src/tape/chunks.ts` is a different sense of chunk and none of it moves**: `writeChunk`, `CHUNK_HEADER`, `CHUNK_BODY`, `CHUNK_WITNESS`, `CHUNK_OBSERVATIONS`, `CHUNK_TRAILER`, `CHUNK_FRAME_BYTES`, plus `chunkBytes` in `segments.ts`, `readChunk` and `reportUnknownChunk` and `reportedUnknownChunk` in `decode.ts`, `withUnknownChunk` in `codec.test.ts`, and `fastForwardChunk` and `verifyChunk` in `tapePlaybackSession.ts`.
- **`ReplayPhase` and `Session.phase` in `tapePlaybackSession.ts` stay.** That is the playback session's own lifecycle and a third sense of the word that belongs to the app.
- **`sectionTimeline.ts` and its exports keep their names.** The rename makes them correct rather than moving them.
- **Every ordinary table row keeps its name**: `FireRow`, `ConeRow`, `rowFor`, `rowAt`, `RingRow`, `RING_ROWS`, `CurtainRow`, `SpiralRow`, `MobRow`, `FrameBudgetRow`, `rowLine`, `SegmentRow`, `recordRow`, `faultRows`, `summaryRow`, `rowsOf`, `lastRowOf`, `liveRow`, and every "tuning row" and "initial row" in a comment. The frame row keeps its name and ADR 0032 keeps its title.
- **The non-drop drops stay**: `backdropPowers`, `clearBackdrop`, `blurBackdrop`, `teardrop`, `droplets`, and every "dropped frame" or "dropped time" in `clock.ts`, `step.ts` and `BelchButton.ts`.
- **`place`, `SpawnOrder` and `MAX_ENTRY_DEPTH` keep their names**, and the six formation shape names (`'drip'`, `'file'`, `'v'`, `'pincer'`, `'rain'`, `'wall'`) do not move. Nor do the seven section-name strings (`'procession'`, `'banshee'`, `'crowd'`, `'waking'`, `'vigil'`, `'undertaker'`, `'over'`). They are flavor at the player's surface, which is the whole point of the ruling.
- **`wavering` is a configuration hand name and contains the letters of wave.** After the rename a grep for wave hits it. It is a hand and not a spawn entry and it does not move.
- **`CarrierRow` becomes `WaveCarriers` and never `CarrierWave`**, because a carrier wave is a radio term.
- **Numbers are held where a string renames.** `FOOD_KIND_CODES.drop` becomes `.powerUp` holding code 2; `STREAM_ORDER`'s `'drops'` becomes `'powerUps'` holding position 2; the three fault identities keep their numbers, 11, 12 and 19, in `FAULT_IDENTITY_CODES`, and `src/tape/__tests__/wireCodes.test.ts` holds the two lists against each other and takes the same edit. If any number moves, stop.
- **`RETIRED_RUN_FIELDS` in `src/game/__tests__/witness.test.ts` is the one place you add rather than rename.** It is `['killsSinceDrop', 'dropsPaid']`, a guard that two retired fields never come back. **Do not rename those two strings**: renaming the ban would let `dropsPaid` return. Add `'killsSincePowerUp'` and `'powerUpsPaid'` beside them so the guard covers both spellings.

**Rough size, so you can pace it.** Case-insensitive across `src` and `scripts` with the prototype excluded: chunk 622 hits in 47 files, phase 1093 in 73, row 2835 in 217 (heavily inflated by `throw`, `crowd`, `browser` and `growth`, and the stage-row family proper is 28 files), template 244 in 19, drop 628 in 104, strip 86 in 21. Roughly 138 test titles carry an old word inside their sentence and rename with the code they describe, so the test-name diff will report about 138 removed and 138 added. **That is the rename and not a regression**, and the note has to say so with the two numbers matching.

**(e) `READINGS_VERSION` 3 to 4.** It lives at `src/dev/readingsVersion.ts:38`. Move it to 4, and write the reason into the file's own version note in the shape version 3's note already uses.

The sentence the note wants, in your own words: **`READINGS_VERSION` moves because eight reading and report keys change name, so a version 4 report cannot be matched to a version 3 one by name**, which is exactly the case version 3 exists to make loud. The eight are the six under `tuning.dropLedger`, plus `tuning.arrivals.byPhase`, plus the `phaseSpans` reduction, and the `phase` field inside every `SectionSpan` rides with them.

**And why the other three do not move, which the note must also say.** `FORMAT_VERSION` stays 3 (`src/tape/wireCodes.ts:36`): the header is read positionally field by field, the only strings on the wire are the roster's weapon-line names, the commit hash, the build identity, the author, the policy and the renderer backend, and none of the six appears in any of them, so no byte moves and no reader's walk changes. `WITNESS_VERSION` stays 6 (`src/game/witness.ts:41`): the fold takes numbers and every union crosses it through a code map read by name, so renaming a key while holding its number changes nothing the fold sees, and the version's own comment says it moves only when the order or the field list moves. `GOLDEN` does not re-pin (`src/dev/digest.ts:330`): one key inside it renames with its type, `drawn.drops` to `drawn.powerUps`, holding the value, which is a field rename on the `Digest` interface and not a re-pin, so ADR 0019's regeneration ritual does not apply. **If the checksum moves when you run it, the rename changed behaviour and the rename is wrong: stop and report.**

**(f) `pnpm verify` green** at the repo root, after `pnpm typecheck` and `pnpm vitest run` green in `apps/hungry-grave/`. A timeout with no assertion is contention and not a failure: run the suite alone once more before calling anything red (`docs/agents/lessons.md`).

**(g) CodeRabbit CLI, one iteration.** `git add` every changed, new and renamed file **by path**, never `git add -A` and never `git add .`, because the review does not see untracked files. Then, from the worktree root, `coderabbit review --agent --uncommitted`. Apply the real findings. Decline the rest with a reason recorded in the progress note. **One iteration**, then move on: this is a rename and a re-run for bookkeeping buys nothing.

**(h) One commit, conventional, single line, ending in `(#39)`.** Something in the shape of `refactor(hungry-grave): the system vocabulary takes the genre's words and flavor stays at the surface (#39)`. Pass the message with `-m`. **Never a heredoc.** No body and no trailer of any kind: every commit on this branch is one line, and a `Co-Authored-By` line is a trailer. Never commit unverified code.

**(i) The progress note.** Append a new section to `apps/hungry-grave/docs/push/step-4-progress.md`, numbered 13 and titled "Slice B0: the glossary realignment (#39)", and add your row to section 1's table. Say what moved, the rename order you actually used and any collision you hit, the `READINGS_VERSION` move and the three constants that held, the test-name diff's two numbers, the CodeRabbit findings applied and declined, the `dispatch-5-weapons.md` broken ADR 0008 link as a finding, the fact that `docs/design` and `docs/adr` prose beyond the eight titles is deliberately left, and anything in the research record you found false against the tree. Either fold it into the same commit or commit it straight after as `docs(hungry-grave): step 4 progress note records slice B0 (#39)`.

**(j) Stop and report.** Under 300 words: the commit hash or hashes, the test counts before and after, the test-name diff's removed and added figures, `READINGS_VERSION` at 4 with the other three named as held, the CodeRabbit outcome, and anything you could not do. Do not start the next slice.

### What must not move, and a move is a stop

- **The fences.** `boundary.test.ts`, `lineAgnosticPolicies.test.ts`, `executionFence.test.ts`, `harnessStatesNoTarget.test.ts` and `comparisonDeclared.test.ts`, five files, all green. Their rules do not change; a name inside one may rename with the module it names, and nothing else.
- **The invariants.** Every check in `invariants.ts` keeps its meaning and its severity. The three fault identity strings relabel and their wire numbers 11, 12 and 19 are held.
- **Replay determinism.** A tape recorded before this slice still decodes, still replays and still verifies.
- **`GOLDEN`**, every value, including `checksum: -279620599`. Only the `drawn.drops` key renames, holding its value.
- **`FORMAT_VERSION` 3** and **`WITNESS_VERSION` 6**.
- **The test count, net of renames. No test is deleted, skipped, weakened or rewritten to reach green.** A test you believe is wrong is a stop-and-report, because replanning is not your call.
- **No magnitude anywhere.** Not a health figure, not a rate, not a count, not an interval. This slice moves words.

### Seams under test

The stage's authored timeline (`rows.ts` becoming `waves.ts`) and its formation library (`templates.ts` becoming `formations.ts`); the stage cursor's own state on `StageState`; the boss health segment on `Boss` and in `src/game/bosses/`; the event union in `events.ts` and its three renamed members; the readings graph's key strings and the batch report's reduction keys; the wire code maps, where a key renames and a number is held; and the glossary itself, which is the seam every one of those names reads from.

### Module boundaries

No module is created, deleted, merged or split, and no import direction changes. Four files are renamed in place and keep their concept, their exports and their public interface block at the module's end: `bosses/chunks.ts` to `bosses/phases.ts`, `stage/rows.ts` to `stage/waves.ts`, `stage/templates.ts` to `stage/formations.ts`, `dev/readings/dropLedger.ts` to `dev/readings/powerUpLedger.ts`, each with its test file beside it in `__tests__`. `src/dev` still may not reach `src/app`, `src/game` still imports nothing from `src/dev`, and `boundary.test.ts` is what proves both still hold.

### The planned test list

This slice adds one test and moves many. That is the honest shape of a rename and it is not a gap in the plan.

1. **The retired-field guard covers both spellings.** `RETIRED_RUN_FIELDS` in `src/game/__tests__/witness.test.ts` gains `'killsSincePowerUp'` and `'powerUpsPaid'` beside the two existing strings, and the existing two are not renamed. Write this one first, red, before the drop to power-up rename: it is the one place the rename could let a retired field back in.
2. **The wire code lists still agree.** `src/tape/__tests__/wireCodes.test.ts` holds `FAULT_IDENTITIES` against `FAULT_IDENTITY_CODES`; it takes the three relabelled strings and stays green with 11, 12 and 19 unmoved.
3. **The golden digest holds.** `src/game/__tests__/digest.test.ts` passes with the checksum unmoved and only the `drawn.powerUps` key renamed.
4. **The five fences stay green**, each named by test title in the note.
5. **Every renamed test file's own suite stays green**, with each moved title carrying the same promise in the new word. A promise that changes while a word changes is a behaviour change hiding inside a rename.
6. **The test-name diff.** `pnpm vitest list --json > <current>` then `pnpm vite-node --config vite.headless.config.ts scripts/test-names.ts apps/hungry-grave/local/step4/tests-baseline.txt <current>`. Every difference is a rename: removed and added must match, and any name removed without a matching addition is a stop.

### Verification steps, with actors

All four are yours; none waits on a person.

1. **Agent.** `pnpm typecheck` green after each of the five rename passes, not only at the end.
2. **Agent.** `pnpm vitest run` green in `apps/hungry-grave/`, then `pnpm verify` green at the repo root.
3. **Agent.** The test-name diff above, with the two figures in the note.
4. **Agent.** A closing grep over `src`, `scripts` and `CONTEXT.md` for each of the six old words, with every surviving hit accounted for against the record's "unchanged" lists. Hits you expect: the tape's chunk family, `ReplayPhase`, the ordinary table rows, the backdrop and teardrop family, `wavering`, the strip verb, and the two retired-field strings. Anything else is unfinished work.

### The test baseline is where the progress note says, not where the handoff says

The handoff names `local/step4/tests-baseline.txt`, which reads as the worktree root and does not exist there. **The real path is `apps/hungry-grave/local/step4/tests-baseline.txt`, beside its `.json` sibling**, both present, 1834 names, exactly as the progress note's section 6 says. Use that path. Do not recreate either file.

### State of the branch

- Branch `hungry-grave-v1`, worktree `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/hungry-grave-v1`. Tip `5f51f5d150`, which is docs. **Last code commit `d4dedf6d9a`, slice A, the mob table and fire**; everything above it is documentation. Run `git log --oneline -25` and `git status --short` first anyway, and check the tree is clean before your first edit.
- `pnpm verify` green at `d4dedf6d9a`, exit 0: 141 test files, 1860 passed, 19 expected fail, 2 todo, five fences green at 71 tests. `WITNESS_VERSION` 6, `FORMAT_VERSION` 3, `READINGS_VERSION` 3, `GOLDEN` re-pinned once for slice A.
- Slice A is deployed at https://hungry-grave.vercel.app. You do not deploy.
- `local/` reaches none of the standing checks: outside version control, outside eslint, outside prettier, outside `tsconfig.json`'s `include`. The one thing that does reach it is vitest, which has no config of its own, so a `*.test.ts` left under `local/` runs in the suite. **Nothing under `local/` ever enters a commit.** Scratch work goes in the scratchpad directory your system prompt names, never under the repo.
- Editor diagnostics name scratch files and stale states. `pnpm typecheck` is the only judge. Nothing under `docs/` is ever handed to prettier by name. `pnpm`, never `npm`, and app commands run from `apps/hungry-grave/`.
- Reading a file over roughly 30 KB: the Read tool in ranges, never `cat`. In zsh a bare `echo ====` fails and `--include=*.ts` needs quoting.

### The worktree guard, and git

**The isolation guard refuses compound Bash that mentions git, even inside quoted text, and even inside a loop or a variable it cannot evaluate.** So: **one plain git command per Bash call.** Never chain with `&&`, `;` or `|` when the command names git. A script that needs a loop goes in the scratchpad directory and is run by path.

**Never touch the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`**, not to read, not to run a command in, not to write. Everything happens inside the worktree.

**Never use the stash.** The stack is shared with the main checkout and other sessions. Set work aside with a temporary commit if you must set it aside at all.

**Never `git add -A` or `git add .`.** Add each path.

**Never write an em dash (U+2014) anywhere**: not in code, not in a comment, not in the ADR, not in a commit message, not in the progress note. Comma, colon, parentheses, or two sentences.

### The stuck rule

**Two failed honest attempts at the same thing, or a decision only Mark can make, or an unauthorized irreversible step: stop and report.** Write what you were doing, the two attempts and why each failed, and one sentence naming the question. **Do not send anything to Discord yourself; the orchestrator does that.** Hand your report back and stop.

Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first. A claim in the research record that is false against the tree is recorded in the progress note and the record's intent is followed rather than its stale letter; if the intent is unclear, that is a stop.

### What is not your job

- **Mark's follow-along doc.** The vocabulary update to https://md.niftymonkey.dev/api/raw/CTtB5BJJ is the orchestrator's, after this slice lands. Do not touch it and do not draft it.
- **Slice B's work.** The wave tables, the standing waves, the re-authored counts, the carriers, `peakArrivals`, the Wall's wave, the guard test that a body carries exactly its `MOB_TYPES` row, and the stale "ramp" comments in `digest.ts` and `screenLifecycle.test.ts:918`. All of it is slice B's, all of it lands in the new words, and none of it is yours.
- **Slice C's work**, including the stale damage comments in `skullStream.ts`, `territory.ts` and `bell.ts`.
- **Prose in `docs/design` and `docs/adr` beyond the eight renamed ADR titles.**
- **Deploying, pushing, merging, opening a PR, or closing a ticket.** Each needs its own explicit yes and none of them is yours.

---

## Slice B: the standing waves and the re-authored waves

Model: Opus, subagent type general-purpose. One coder, one code commit, one docs commit. Commit messages end in `(#39)`, which is the ticket every step 4 docs and code commit cites.

Step 4 slice B of The Hungry Grave (ticket #39): the stage's authored floor grows over the run, as standing waves written into the section tables beside the shaped waves.

**This prompt is written in the new vocabulary, which slice B0 landed.** A wave is what used to be a row, a formation what used to be a template, a section what used to be a phase, a phase what used to be a boss chunk, a power-up what used to be a drop. The files are `src/game/stage/waves.ts`, `src/game/stage/formations.ts` and `src/game/bosses/phases.ts`. Where the step 4 plan and the design record still say row, template or phase, they are speaking the old words about the same things: translate, and never take a word difference for a different thing. If the tree does not match the names above, slice B0 did not land as planned and that is a stop.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. The six dispatch contract items are the sections below.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md` at the repo root, plus `docs/agents/code-examples.md` for any rule that leaves the path unclear, and `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/step-4-mow-ladder-director-dispatch.md`, 130 KB, with the Read tool in ranges and never with `cat`. **Its step 8 in section 10 is this slice and it is the contract.** Section 4's `rows.ts` block is the seam text, section 5 is the module table, section 6 is the planned test list, section 7 is the constants and their readers, section 3 is the verification steps.
4. `apps/hungry-grave/docs/design/mow-ladder-director.md`, the design record. Section 5 item 3 is what this slice builds, section 9 is the magnitude table, section 3 is the dead baseline the slice is measured against.
5. `apps/hungry-grave/docs/push/handoff.md`, the STEP 4 BRIEF and the Standing rules. Mark's four rulings are there, and so are the findings filed for his read.
6. `apps/hungry-grave/docs/push/step-4-progress.md`: section 1 for the state of the step, section 2 for the `GOLDEN` moves, section 4 items 7 and 8 for the two findings slice A filed, section 6 for the test baseline's real path, section 11 for what slice A landed, section 12 for the second gate round, section 13 for slice B0's rename.
7. `apps/hungry-grave/CONTEXT.md`, the entries Wave, Standing wave, Formation, Section, Phase, The mow, Ladder, Carrier, Sparse last wave, The Procession, The Crowd, The Vigil, Directed density and Add. **You add nothing to it**, and the entries are what your names have to agree with.

### The definition, in observable terms

After this slice: a `StageWave` may carry a `repeat`, and a wave that carries one puts bodies on the field at its own rate from its own section-local time until the next wave of any kind fires. The Procession authors nothing under its teaching waves, then 2, then 3.5, then 5 bodies a second, then 0 at its sparse last wave; the Crowd authors 8, then 3 mid-section, then 12; the Vigil authors none, and a test fails if one appears there. The shaped waves' counts are roughly doubled and the 25 carriers are re-placed across them, so the ladder's supply is unchanged in number. A reader opening a section's table sees one list in time order with the standing waves in their places, and finds no `StandingWave` type, no `Section.standing`, no standing-wave constants, no span helper and no new field on `StageState`. `peakArrivals` prices a table carrying a standing wave above the same table without it. The Waking's pour carries the active standing wave in at `t: 0` with its interval widened by `1 / share`. `pnpm verify` is green, the test-name diff is read against the baseline, and `state.refusals` off this slice's own hand tape is printed in the report.

What a player meets: the Procession still teaches with a lone swallow and a lone revenant before anything else arrives, and the ground then thickens twice; the Crowd is a mow with an authored trough in the middle of it; the field still reads clear before the Banshee, so she still arrives.

### The work, in this order

**(a) The tests first, red, from the plan's section 6.** Spec tests 7, 8, 8a, 9, 9a, 10, 11, 12, 13, 14 and 15, each written as a `test.todo` placeholder first and then turned red against a stub, in `src/game/stage/__tests__/waves.test.ts` and `stage.test.ts`. The module tests are the plan's group 58 to 72 for `repeatingArrivals`: a wave with no repeat, an interval of one tick, an interval already at its minimum, a time before the wave's own, a time inside the teaching waves, and a section's last standing wave running out at its sparse last wave. Spec test 14 (the Procession's first mob fire is a lone revenant Drip) and spec test 15 (the Wall is the one authored wave the director may not add over) already exist from slice A and are re-read rather than rewritten.

**(b) `Repeat` and `StageWave.repeat`, authored in seconds.** The seam text is the plan's section 4. Three fields: `intervalSeconds`, `reduceSeconds` (what each firing takes off the interval, zero on a wave that holds one rate) and `minimumSeconds` (the floor). It is Brotato's `repeating_interval`, `reduce_repeating_interval` and `min_repeating_interval` on the resource that already carries the one-shot groups, and the reason it is fields on the wave rather than a second kind of wave is ADR 0060 as re-ruled. `repeat` is `Repeat | null` and it is null on every wave that exists today.

**(c) `repeatingArrivals(wave, sectionSeconds): number`.** How many times a wave fires on this section-local tick: once at its own time, again on its repeat, zero everywhere else. One function over any wave, so a wave with `repeat` null answers for itself and the caller never asks which kind it holds. **Stateless, and that is a requirement rather than a detail**: a pure function of the time inside the section, so the stage keeps no cursor for a repeating wave and the witness folds no field for it. **It takes section-local seconds and never ticks**, because `t` and every field on `Repeat` are authored in seconds and `waves.ts` value-imports nothing: reaching `TICK_HZ` would cost it the property the caps derivation depends on. `stage.ts` converts through the `waveTicks` it already has.

**(d) The section tables, re-authored.** The standing waves go into `PROCESSION_WAVES`, `CROWD_WAVES` and nowhere else, **in time order beside the shaped waves**, which is what one construct and one list buys. The magnitudes, from the record's section 9 and the plan's step 8, are initial data rows and you author exactly these:

- **The Procession: 0 through the teaching waves, then 2, then 3.5, then 5 bodies a second, then 0 at the sparse last wave.** The teaching waves are the Drip of one at `t: 2` and the lone revenant Drip at `t: 11`, and **the first standing wave starts behind them**, because the first swallow and the game's first mob fire each have to arrive alone (ADR 0016) and because ADR 0015's golden scenario runs 600 ticks and must keep roughly the field it has.
- **The Crowd: 8, then 3 mid-section, then 12 bodies a second.** The 3 is the authored trough, a wave somebody wrote and never a dip in a curve, so a reader sees three consecutive waves rather than one rate with an exception carved into it.
- **The Vigil: none.** It owns scarcity, and a standing wave there would pass a corpses-per-second reading while feeding better.
- **The closing zero.** A section whose phase ends on `wavesSpentAndFieldClear` closes its list with a standing wave authored at a rate of zero, at its sparse last wave's time, or the field never reads clear and its boss never arrives (ADR 0051). Today that binds the Procession alone: its sparse last wave runs from 112 and its last authored time is 116.5, the Crowd ends on `setPieceOpened`, the Vigil authors no standing wave at all.
- **The shaped waves' counts roughly doubled**, never tenfolded: a formation places bodies at a `BODY` spacing of 26 units across a field 540 wide, so a File of 60 is two and a half field widths or a stack.
- **The carriers re-placed across them.** 25 `carries: true` waves today and 25 after, `CARRIER_SLACK` 1.3 unchanged. **`carries` is false on every standing wave**, because the 25 are authored placements and the ladder's whole supply (ADR 0048), and a rate that carried would hand out rungs at a figure nobody wrote down.
- **Every standing wave sets `directed` deliberately, and it is not a default.** `StageWave.directed` says whether the director may spend in the span the wave opens, and a standing wave is the span opener the director sees for most of a section. A flag copied from a neighbour is a permission nobody decided.
- **No stat step on the clock**, which the second gate round struck on evidence. Not health, not fall speed, not anything. Growth here is arrivals and nothing else.

**(e) The stage stands the rate, and keeps no state to do it.** `spawnDueWaves` already walks the section's waves in time order and consumes them through `firedWaves`, and that cursor is the whole answer. **The active standing wave is the last wave carrying a `repeat` among `waves[0..firedWaves)`**, which is by definition the most recent standing wave the tick has passed, and a later wave of any kind that is also standing replaces it. That is what "a standing wave ends at the next wave of any kind" means mechanically. On each tick the stage asks `repeatingArrivals` of that one wave alone, for the ticks after its own `t`, and fires that many of its groups through the `spawnWave` that already exists. **The wave's first group is fired by the cursor**, on the tick `spawnDueWaves` consumes it, exactly as a one-shot wave is, so `repeatingArrivals` answers zero at the wave's own time and nothing double-fires.

**No `Section.standing` and no new stage state.** The standing waves reach the section through the `waves` column it already has, and the pick is a function of `firedWaves` and the table, both of which the witness already holds, so a standing wave costs the tape nothing and a replay rebuilds the rate by rebuilding the cursor. **`spawnMob` is not touched and gains no argument**: it has three callers (`stage.ts`, `setPiece.ts`, `undertaker.ts`) plus the digest's scripted mobs, and the provenance mark spec test 43 will want is slice E's, in the fold commit. If you find yourself wanting it here, that is a stop.

**(f) `peakArrivals` gains the rate term, and it is this slice's rather than slice D's.** It is the corpse cap's first clock and it already walks `SECTION_TABLES`, so the moment a standing wave enters a section table its window is wrong: a table that authors a rate prices identically to one that does not, and `CORPSE_CAP` is a proof rather than an estimate. The term is the rate times the window, read off the same waves the section walk already reads, and the test is that a table carrying one standing wave prices above the same table without it. **`MOB_CAP` and `MOB_FIRE_CAP` stay constants in this slice**; slice D makes them derivations.

**(g) `wavesUnderThePour` carries the standing wave in.** It re-times the Crowd's last groups into the Waking and multiplies each count by the share, and a standing wave cannot be thinned that way: its count is one group's bodies and its rate is the interval. So the function also carries in the standing wave active at the pour's own opening time, at `t: 0`, with its `intervalSeconds` widened by `1 / share` and its `reduceSeconds` and `minimumSeconds` widened with it. **A rate thins by interval, never by count.** The pour test at `waves.test.ts:380` extends to it: the carried standing wave's rate is below the Crowd's own and above zero, on the same terms the existing test holds the counts to.

**(h) The guard test the handoff owes this slice: a body carries exactly its `MOB_TYPES` row.** It is the deliberate absence of any stat step made mechanical, and a deliberate absence in production code is guarded by a test that fails if the absent thing appears. A spawned mob's health, speed and half-widths equal the table's row for its type, read at a late tick as well as an early one, so a per-minute step on any of them fails here. It lives in `src/game/__tests__/mobs.test.ts` beside the mow's own tests, and its comment carries the ruling: ADR 0059 rules growth as more enemies and harder ones, the second gate round struck the per-minute step on the evidence that its figures were Mad Forest's Inverse mode, and `timeToKill.ts` in slice G is the reading that would reopen it.

**(i) The two stale ramp comments, also owed to this slice.** `digest.ts`'s JSDoc at `:33-45` says scripting keeps the golden off "the ramp's own tuning", and there is no ramp: rewrite the sentence to name the stage's authored growth, in the commit that makes it stale. `screenLifecycle.test.ts` near `:918` says "less of what the ramp sends ever reaches the grave" and its parked-run bound is three times a measured seal tick, which this slice moves: rewrite the comment and re-measure the bound. **The dated re-pin paragraphs further down `digest.ts` are history and are not rewritten**, including the one at `:290` that names two ramp waves; history says what it said at the time.

**(j) `game-concept.md`'s stage paragraph.** It gains the standing waves and its economy paragraph's density sentence is restated. **That page is Mark's own wording**: cite the ADRs, date the addition, and never silently rewrite a sentence of his. Write your additions in the new vocabulary; the rest of the page's old words are the follow-up docs pass's, not yours. **`CONTEXT.md` gains nothing**: the second gate round's docs pass landed Standing wave, the widened Wave clause, The mow, Signal lock, Ladder and the Add clause, and slice B0 realigned them. Check the Procession's entry reads true against the table you author and stop if it does not.

**(k) The Wall's wave, which you own and must not re-author past Mark's answer.** Slice A measured that the mow takes both of ADR 0042's halves off the Wall: at 8 health the storm thins the curtain enough for a lane to open and the grave crosses untouched, and a curtain of silent bodies puts no shots in the air for a belch to be worth spending on. Two halves of that ADR now stand as `it.fails` tripwires carrying the measurement. **This slice owns the Crowd's table, which holds the Wall's wave, and it must not re-author that wave past this finding without his answer** (plan verification step 22, progress note section 4 item 7). Double its count as a shaped wave like the others if the doubling rule reaches it, and change nothing else about it: no new health, no restored fire, no protective rule. If you believe the Wall needs re-authoring to make the slice's own tests pass, that is a stop-and-report and not a call you make.

**(l) `GOLDEN` re-pins here if anything inside the scenario's first 600 ticks moves.** The plan permits five re-pins in all, in slices A, B, C, E and F. **One is used, slice A's; this is the second permitted, and three remain after you.** A re-pin lands with a dated paragraph in `digest.ts`'s JSDoc naming what moved, what held and why, in the shape the eight paragraphs already there use. **A re-pin here is planned and expected and never a stop-and-report**, and so is not moving it: whether a change reaches inside the scenario's window is a fact about the window and not about the slice. The teaching-wave rule is what keeps any move to the smallest possible one, by keeping standing arrivals out of that window. A move with no paragraph is a stop even when the number is right.

**(m) `pnpm verify` green** at the repo root, after `pnpm typecheck` and `pnpm vitest run` green in `apps/hungry-grave/`. A timeout with no assertion is contention and not a failure: run the suite alone once more before calling anything red (`docs/agents/lessons.md`).

**(n) The measurements this slice owes.** A hand-recorded tape at your own tip, recorded against the built app through `vite preview` and driven with `playwright-cli` and never the Playwright MCP, then `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts <tape>` asserting `outcome: 'verified'`. **Print `state.refusals` off that tape in your report, all three counters** (`food`, `carriers`, `offers`), because a slice that multiplies arrivals under caps derived for a thinner field is the one most likely to bind a cap, and a bound cap is a fault rather than a number to raise. Note that the plan's verification step 10 says "the corpse, mob and mob-fire refusal counters", and the tree carries three counters under those names instead, with `refusals.carriers` being what the mob pool turned away; report against what the tree has. Where reaching Crowd density by hand is impractical, a conditioned tape gets you there: `pnpm vite-node --config vite.headless.config.ts scripts/record-conditioned.ts <out> <seed> <ticks> skullStream=N territory=N wisps=N bell=N`, measured the same way. The rendered check carries **one named shot: an offer standing open in a Crowd-density field** (plan verification step 20). Take it, read it yourself, say in the report what you see, and hand it to Mark; whether three bodies still read as a choice inside a mow is his. Play a run, end it, and play again, because a rendered check that only ever plays run one is structurally blind.

**(o) CodeRabbit CLI, one iteration.** `git add` every changed, new and renamed file **by path**, never `git add -A` and never `git add .`, because the review does not see untracked files. Then, from the worktree root, `coderabbit review --agent --uncommitted`. Apply the real findings. Decline the rest with a reason recorded in the progress note. **One iteration**, then move on.

**(p) One code commit, conventional, single line, ending in `(#39)`.** Something in the shape of `feat(hungry-grave): the stage's authored floor grows as standing waves (#39)`. Pass the message with `-m`. **Never a heredoc.** No body and no trailer of any kind: every commit on this branch is one line, and a `Co-Authored-By` line is a trailer. Never commit unverified code.

**(q) The progress note.** Append a new section to `apps/hungry-grave/docs/push/step-4-progress.md`, numbered **14** and titled "Slice B: the standing waves and the re-authored waves (#39)", and add your row to section 1's table and your entry to section 2's `GOLDEN` list. Say what the game does now, the magnitudes you authored, the file count and the test-name diff's two numbers against the plan's expected 15 to 20 files, the `GOLDEN` outcome with its paragraph, `state.refusals` off your hand tape, what the offer shot showed, the CodeRabbit findings applied and declined, anything in the plan or the record you found false against the tree, and anything you left for a later slice with the slice named. Commit it as `docs(hungry-grave): step 4 progress note records slice B (#39)`.

**(r) Stop and report.** Under 300 words: the commit hashes, the test counts before and after, the test-name diff's removed and added figures, the `GOLDEN` outcome, the three refusal counters, the offer shot in one sentence, the CodeRabbit outcome, and anything you could not do. Do not start the next slice.

### What must not move, and a move is a stop

- **The fences.** `boundary.test.ts`, `lineAgnosticPolicies.test.ts`, `executionFence.test.ts`, `harnessStatesNoTarget.test.ts` and `comparisonDeclared.test.ts`, five files, all green, each named by test title in the note.
- **The invariants.** Every check in `invariants.ts` keeps its meaning and its severity, and the three fault identity wire numbers 11, 12 and 19 are held. `entity caps`, `corpse cap never binds` and `carrier spawn never refused` are the three this slice is most likely to trip, and tripping one is a finding rather than a cap to raise.
- **Replay determinism.** One seed played twice under `shaky-short` gives the same tick count, the same witness at every checkpoint and identical stream cursors. A tape recorded at your tip decodes, replays and verifies.
- **`FORMAT_VERSION` 3** (`wireCodes.ts`), **`WITNESS_VERSION` 6** (`witness.ts`) and **`READINGS_VERSION` 4** (`readingsVersion.ts`, moved to 4 by slice B0). None of the three moves in this slice, and a move in any of them is a stop-and-report. `FORMAT_VERSION` is slice G's single move and `WITNESS_VERSION` is slice E's.
- **`spawnMob`'s signature**, and the `Mob` provenance mark that is not in it. Slice E's.
- **`MOB_CAP`, `MOB_FIRE_CAP` and `CORPSE_CAP` as they stand.** Slice D turns them into derivations; this slice only makes `peakArrivals` price the new tables honestly.
- **The harness's own rows.** `enoughClearance`, `belchWorthIt`, every lapse rate and every look-ahead list belong to the hand, and the hand's rows are never tuned with the game's. A hand row moved between two batches would compare two builds through two instruments.
- **No test is deleted, skipped, weakened or rewritten to reach green.** A measured baseline that moves because the field moved is re-measured with its comment saying what moved and why; a test you believe is wrong is a stop-and-report, because replanning is not your call.
- **What `GOLDEN` is permitted to do, and only that.** It may re-pin once here, with its dated paragraph. Nothing else about the digest scenario moves.

### Seams under test

`src/game/stage/waves.ts`: `StageWave` gaining `repeat`, the `Repeat` type, `repeatingArrivals` over section-local seconds, the three section tables, `sparseLastWave`'s callers, `wavesUnderThePour` and `peakArrivals`. `src/game/stage/stage.ts`: the active standing wave picked off `firedWaves`, `repeatingArrivals` called on it alone, `waveTicks` doing the conversion, and `spawnWave` firing its groups. `src/game/mobs.ts` through its table, read by the new guard test and written by nobody here. `src/dev/digest.ts`: the golden pin and the rewritten JSDoc sentence.

### Module boundaries

No module is created, deleted, merged or split. **`waves.ts` value-imports nothing and that must still be true at the end**: its imports stay `import type`, which is what lets `caps.ts` derive from it while importing only it. **`caps.ts` never imports `stage.ts`**, by neither a value nor a type import, because `stage.ts` imports `mobs.ts` and `mobs.ts` imports `caps.ts` and that edge closes a cycle. If you find yourself wanting `import { SECTIONS } from './stage'` inside `caps.ts`, you have found the cycle: stop rather than reaching for a type-only import to dodge it. `src/game` still imports nothing from `src/dev`, and `boundary.test.ts` proves it. The seconds-to-ticks conversion lives in `stage.ts` and never in `waves.ts`.

### The planned test list

From the plan's section 6, item by item, each written red first.

7. *A standing wave puts bodies on the field at its own rate and the one-shot waves keep their times.* ADR 0047's "the waves stay the floor": a standing wave is a second floor and never a replacement.
8. *Consecutive standing waves step the rate at their own times, and a standing wave ends at the next wave of any kind.* ADR 0060 as re-ruled. **The second half is the tech architecture gate's:** no section that ends on `wavesSpentAndFieldClear` has a standing wave live at its last wave's time, and a section's last standing wave ends before its sparse last wave begins, or the field never clears and the boss never arrives (ADR 0051).
8a. *A wave with no repeat fires exactly once, on its own tick.* One construct and one list: every wave in the tree today is the same shape with `repeat` unset.
9. *A wave's repeat interval shrinks by its own step and never below its minimum.*
9a. *The Crowd's trough is a standing wave somebody authored and not a dip in a curve.* Its middle standing wave carries a lower figure than the waves either side, and there is no expression anywhere that produces a dip.
10. *The Procession's first standing wave puts nothing on the field until its teaching waves have fired.* The game design gate's finding.
11. *`repeatingArrivals` is a pure function of its arguments, and a standing wave fires once on its own tick.* Called twice for the same time it answers the same count, the stage carries no cursor, and the wave's own tick is the cursor's so nothing double-fires.
12. *No wave in the Vigil's table carries a repeat, and no standing wave anywhere carries.* Two deliberate-absence guards.
13. *The Vigil pays less food per second than the Crowd.* The property item 12's absence exists for, measured in food swallowed per second and never corpses per second, because a revenant corpse pays double.
14. *The Procession's first mob fire is a lone revenant Drip.* Landed in slice A; it must still pass against your table. **Slice A left two lone revenant Drips in the section, at `t: 11` and `t: 31`, and folding that pair is yours** (progress note section 11).
15. *The Wall is still the one authored wave the director may not add over.* Landed in slice A, read through the data, and it must still pass.
- **Module tests** for `repeatingArrivals` at its bounds, the six the plan names.
- **The new guard:** *a body carries exactly its `MOB_TYPES` row*, item (h).
- **The extended pour test** at `waves.test.ts:380`, item (g).
- **The key-shape pin at `waves.test.ts:737`** asserts every wave declares exactly six fields; it now has to allow a seventh, and the assertion is widened rather than deleted.
- **The corpse-cap identity tests** at `waves.test.ts:303-305` and `caps.test.ts:155-156`, which keep `peakArrivals` honest through the new term.
- **The golden digest** at `digest.test.ts`, per item (l).
- **The five fences**, green, each named by title.

**What this slice is expected to turn red, so the diff is read against something.** The key-shape pin; the four wave literals across the section tables; the `sparseLastWave` and `wavesUnderThePour` literals and the pour test that walks them; the per-seed baseline tables in `bot.test.ts` and `harnessPolicy.test.ts`, which are measured figures against a field that is about to change; `screenLifecycle.test.ts:918`'s parked-run bound; `verificationReadback.test.ts`'s run-length bound; `digest.test.ts` with the re-pin; and `caps.test.ts` if a cap binds, which is a finding rather than a fix. **A realistic count is 15 to 20 files.** A diff much smaller than that is a reason to look for the tests that should have moved and did not. Slice A's table said five files and the diff said 19, with 42 tests red across 13.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck` green from `apps/hungry-grave/`. It is the only judge of diagnostics; editor diagnostics name scratch files and stale states.
2. **Agent.** `pnpm vitest run` green from `apps/hungry-grave/`, then `pnpm build`, then `pnpm verify` green at the repo root.
3. **Agent.** The test-name diff. `pnpm vitest list --json > <current>` into the scratchpad, then `pnpm vite-node --config vite.headless.config.ts scripts/test-names.ts apps/hungry-grave/local/step4/tests-baseline.txt <current>`. **The baseline is at `apps/hungry-grave/local/step4/tests-baseline.txt`, beside its `.json` sibling, 1834 names**, and not at the worktree root where the handoff's wording reads. Do not recreate either file. Both figures go in the note, read against the 15 to 20 files above.
4. **Agent.** Replay determinism: one seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
5. **Agent.** A hand-recorded tape at this tip through `vite preview`, driven with `playwright-cli`, run through `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts <tape>` asserting `outcome: 'verified'`, with `state.refusals` printed into the note. Item (n).
6. **Agent.** The rendered check with the named shot, an offer standing open in a Crowd-density field, read and reported. Item (n).
7. **Agent.** The five fences green, each named by test title in the note.
8. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
9. **Human (Mark), and none of these blocks you.** Whether the mow feels like a mow; whether an offer is readable at mow density (verification step 20, your shot is the input); whether the Wall is still meant to cost something (verification step 22, and item (k) is what it binds); whether Territory's bottom rung still reads as his #79 ruling meant it (verification step 23, and no slice owns Territory's rungs). The push runs in one-push mode: you continue past every one of them and he reads them on the branch.

### State of the branch

- Branch `hungry-grave-v1`, worktree `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/hungry-grave-v1`. Run `git log --oneline -25` and `git status --short` first and check the tree is clean before your first edit. **The tip should be slice B0's docs commit; the last code commit should be slice B0's rename, and the one before it `d4dedf6d9a`, slice A.**
- At `d4dedf6d9a`, `pnpm verify` was green, exit 0: 141 test files, 1860 passed, 19 expected fail, 2 todo, five fences green at 71 tests. Slice B0 moves the names and not the count. `GOLDEN` has re-pinned once; `WITNESS_VERSION` 6, `FORMAT_VERSION` 3, `READINGS_VERSION` 4.
- Slice A is deployed at https://hungry-grave.vercel.app. **You do not deploy.**
- `local/` reaches none of the standing checks: outside version control, outside eslint, outside prettier, outside `tsconfig.json`'s `include`. The one thing that does reach it is vitest, which has no config of its own, so a `*.test.ts` left under `local/` runs in the suite. **Nothing under `local/` ever enters a commit.** Scratch work goes in the scratchpad directory your system prompt names, never under the repo.
- Nothing under `docs/` is ever handed to prettier by name. `pnpm`, never `npm`, and app commands run from `apps/hungry-grave/`.
- Reading a file over roughly 30 KB: the Read tool in ranges, never `cat`. In zsh a bare `echo ====` fails and `--include=*.ts` needs quoting.

### The worktree guard, and git

**The isolation guard refuses compound Bash that mentions git, even inside quoted text, and even inside a loop or a variable it cannot evaluate.** So: **one plain git command per Bash call.** Never chain with `&&`, `;` or `|` when the command names git. A script that needs a loop goes in the scratchpad directory and is run by path.

**Never touch the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`**, not to read, not to run a command in, not to write. Everything happens inside the worktree.

**Never use the stash.** The stack is shared with the main checkout and other sessions. Set work aside with a temporary commit if you must set it aside at all.

**Never `git add -A` or `git add .`.** Add each path.

**Never write an em dash (U+2014) anywhere**: not in code, not in a comment, not in a commit message, not in the progress note. Comma, colon, parentheses, or two sentences.

### The stuck rule

**Two failed honest attempts at the same thing, or a decision only Mark can make, or an unauthorized irreversible step: stop and report.** Write what you were doing, the two attempts and why each failed, and one sentence naming the question. **Do not send anything to Discord yourself; the orchestrator does that.** Hand your report back and stop.

Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first. A claim in the plan or the record that is false against the tree is recorded in the progress note and the source's intent is followed rather than its stale letter; if the intent is unclear, that is a stop. **A gate finding or a measurement that argues against something Mark ruled is filed for his read and built past, never applied.**

### What is not your job

- **Slice C's work.** `CORPSES_TO_CEILING` and the reservoir with its feast identity, the two cadence waves and the intervals they pay on, the per-rung weapon climb read from `docs/research/weapon-growth-per-level-precedent.md`, and the stale damage comments in `skullStream.ts`, `territory.ts` and `bell.ts` that still describe a 40-health shambler.
- **Slice D's work.** `MOB_CAP`, `MOB_FIRE_CAP` and `peakLive` as derivations, the card table, `BODY_COST`, `cardCost`, the three section purses and the new import fence. `peakArrivals`'s rate term is yours and none of the rest is.
- **Slice E's work.** The widened fold, `WITNESS_VERSION` 6 to 7, `StreamName`, `director.ts`'s first appearance, and the `Mob` provenance mark.
- **Slice F's work.** The director's signal, `Section.purse`, the spend, the quiet interval, the `directedAdd` event and the purse invariant.
- **Slice G's work.** The readings, the signal lock, `FORMAT_VERSION` 3 to 4 and the `bot.ts` comment.
- **Territory's rungs**, which no slice in the plan owns and which are Mark's.
- **Prose in `docs/design` and `docs/adr` still carrying the old six words**, beyond the sentences you add to `game-concept.md`. A follow-up docs pass owns it.
- **Mark's follow-along doc**, https://md.niftymonkey.dev/api/raw/CTtB5BJJ. The orchestrator's.
- **Deploying, pushing, merging, opening a PR, or closing a ticket.** Each needs its own explicit yes and none of them is yours.
