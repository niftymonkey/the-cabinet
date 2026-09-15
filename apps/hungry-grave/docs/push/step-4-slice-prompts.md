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

---

## Slice C: the economy waves, the burst cadence and the weapon climb

Model: Opus, subagent type general-purpose. One coder, one code commit, one docs commit. Commit messages end in `(#39)`, which is the ticket every step 4 docs and code commit cites.

Step 4 slice C of The Hungry Grave (ticket #39): the food economy is restated in corpses of expected mowing, the two on-swallow lines get a cadence floor, and each weapon line's damage climbs with its rungs.

**This prompt is written in the new vocabulary, which slice B0 landed.** A wave is what used to be a row, a formation what used to be a template, a section what used to be a phase, a phase what used to be a boss chunk, a power-up what used to be a drop, the HUD what used to be the strip. The files are `src/game/stage/waves.ts`, `src/game/stage/formations.ts` and `src/game/bosses/phases.ts`. Where the step 4 plan, the design record and the weapon growth record still say row, template or phase, they are speaking the old words about the same things: translate, and never take a word difference for a different thing.

**Slice B lands immediately before you and it owns `src/game/stage/`.** Expect it to have landed standing waves as `Repeat` fields on `StageWave`, a stateless `repeatingArrivals`, re-authored section tables with roughly doubled shaped counts and the 25 carriers re-placed, and a rate term inside `peakArrivals`. **Read progress note section 14 for what it actually did** rather than trusting that list, and read section 2 for whether it moved `GOLDEN`. You do not touch `src/game/stage/` in this slice.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. The six dispatch contract items are the sections below.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md` at the repo root, plus `docs/agents/code-examples.md` for any rule that leaves the path unclear, and `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/step-4-mow-ladder-director-dispatch.md`, 130 KB, with the Read tool in ranges and never with `cat`. **Its step 9 in section 10 is this slice and it is the contract.** Section 4's `wisps.ts` and `skullStream.ts` block is the cadence seam text, section 5's module table gives you `tuning.ts` and the two line modules, section 6 is the planned test list (spec tests 18, 19, 19a, 19b, 19c, and 20 to 23), section 7 is the constants and every reader of each, section 3 is the verification steps, section 1's food economy and weapon damage paragraphs are the definition this slice is measured against.
4. `apps/hungry-grave/docs/research/weapon-growth-per-level-precedent.md`, 410 lines. **Section 4's "The damage lane per rung" is your table and its four notes are the reasoning you cite.** Section 1's Recommendation and the "What this settles" section carry the band the table sits inside. **Section 4's "The health step" and the hits-to-kill table built on it are superseded and you do not build them**, per the paragraph below.
5. `apps/hungry-grave/docs/design/mow-ladder-director.md`, the design record. Section 5 item 4 is what this slice builds, section 9 is the magnitude table, section 3 is the dead baseline the slice is measured against.
6. `apps/hungry-grave/docs/push/handoff.md`, the STEP 4 BRIEF and the Standing rules. Mark's four rulings are there, the paragraph "Decisions the session made under the pre-authorizations" carries the weapon growth numbers you author, and the findings filed for his read are there too.
7. `apps/hungry-grave/docs/push/step-4-progress.md`: section 1 for the state of the step, section 2 for the `GOLDEN` moves, section 6 for the test baseline's real path, section 11 for slice A, section 12 for the second gate round that struck the health step, section 13 for slice B0's rename and its `STREAM_SALTS` finding, **section 14 for slice B**.
8. `apps/hungry-grave/docs/adr/0058-each-on-swallow-line-pays-in-its-own-currency-at-its-own-cadence.md` as amended, which rules the two cadence floors and their opposite shapes; `0005-weapon-lines-are-a-pool.md`, which gives each line its own five levels; `0044-territory-is-autonomous-controlling-ground.md`, which holds Territory's touch counts flat; `0036-the-bell-is-a-timed-pulse-of-cones.md`, which leaves the bell's damage per level an open tuning row; `0059`, `0060`, `0015` and `0019`.
9. `apps/hungry-grave/CONTEXT.md`, the entries Surge, Freshness, Feast, Reservoir, Rung and Swallow. Your names have to agree with them, and one of them takes an edit (item (h)).

### The definition, in observable terms

After this slice: the ceiling takes 400 fresh trash corpses to reach rather than 80, so the grave grows through a Procession of mowing rather than in its first ten seconds. The reservoir holds 300 corpses rather than 9, so a belch is a cadence at Crowd density rather than a reflex, and `RESERVOIR_CAPACITY` is still written as `FEAST_PAYOUT`, so a fully fresh feast still fills the reservoir exactly and wastes nothing. A reader opening `tuning.ts` finds one changed magnitude and one changed multiplier and no new constant.

Each weapon line's damage is a table indexed by rung rather than one flat number: a skull at rung 5 takes 16 off a body where a skull at rung 1 takes 8, a wisp 20 against 10, a toll at the grave 104 against 40 and a toll at the far edge 13 against 5, and a Territory pulse takes 5 at every rung because ADR 0044 holds it flat. The far edge is still exactly an eighth of the near edge at every rung. A reader opening any line's module finds the climb stated as that line's own row, sitting beside the row that already states its columns, souls, cones or radius, and finds no shared band anywhere and no line whose whole climb is a damage number.

Two swallows inside the wisps' volley interval fire one volley and the second is not banked for later. A swallow during a running skull surge lengthens it toward a cap rather than starting a second beside it. `WISP_CAP` 64 and `SKULL_CAP` 120 are unchanged and neither binds at Crowd density, which is what the floors exist for.

`pnpm verify` is green, the test-name diff is read against the baseline, `GOLDEN` carries a dated paragraph naming the grave's size and the reservoir at tick 600, and `state.refusals` off this slice's own hand tape is printed in the report.

What a player meets: the grave grows over a run rather than filling up early, the belch is a thing you wait for and spend, and a line that gains a rung hits harder as well as wider.

### The work, in this order

**(a) The tests first, red, from the plan's section 6.** Spec tests 18, 19, 19a, 19b, 19c, 20, 21, 22 and 23, each written as a `test.todo` placeholder first and then turned red against a stub. 18 and 19 extend `src/game/__tests__/tuning.test.ts`; 19a, 19b and 19c live in each line's own `src/game/lines/__tests__/` file and in `roster.test.ts`; 20 to 23 extend `src/game/lines/__tests__/wisps.test.ts` and `skullStream.test.ts`. **The plan's module test list, 58 to 72, names none for this slice, which is a gap in the plan rather than a licence**: write the module tests the seams below name and say in the progress note that you added them.

**(b) The food economy, two magnitudes and the identity that holds them together.** In `src/game/tuning.ts`:

- **`CORPSES_TO_CEILING` 80 becomes 400** (`tuning.ts:96`). The record's section 4 table and its section 9 both say "about 400" and you author exactly 400. What it is against, in the record's own words: the ceiling lands late in the Procession rather than ten seconds in.
- **`FEAST_PAYOUT`'s multiplier 9 becomes 300** (`tuning.ts:102`), which is the reservoir stated in corpses. The record's section 4 table and section 9 say "about 300" and you author exactly 300. What it is against: a belch roughly every 40 seconds at Crowd rates rather than every 2 seconds.
- **`RESERVOIR_CAPACITY` is not touched** (`tuning.ts:109`). It is written as `FEAST_PAYOUT` and that identity is load-bearing: moving the reservoir moves the feast with it by construction, and a feast that no longer filled the reservoir would break the Wall's choreography. **If you find yourself writing a number here, stop.**

Rewrite each constant's own comment to say what the new figure is against, in the shape the existing comments use. `TRASH_CORPSE_PAYOUT` is a derivation and its expression does not change.

**The blast radius is the widest quiet one in the step and the plan's section 7 lists it for you**: `TRASH_CORPSE_PAYOUT`, and through it `FEAST_PAYOUT`, `RESERVOIR_CAPACITY`, the revenant's `2 * TRASH_CORPSE_PAYOUT` (`mobs.ts:92`), the power-up's payout (`corpses.ts:246`), `swallow.ts:83`'s `paid`, and every reading that prints a size. Walk that list and check each one still means what it meant.

**One relation worth checking rather than assuming, and it is yours to report.** `HIT_SHRINK` is 3 size units a hit (`tuning.ts:69`). At 80 corpses to the ceiling a hit cost 5.93 fresh trash corpses; at 400 it costs 29.6. Against a Crowd that now authors bodies by the second rather than one every second, that is roughly the same seconds of mowing. Work it out against slice B's landed rates and say in the note whether a hit still costs about the time it used to. **If it does not, that is a finding you write down and build past**, never a magnitude you adjust on your own.

**(c) The per-rung damage lane, per line and never as one band.** ADR 0005 gives each line its own five levels, so each line states its own climb in its own module, beside the row that already states what else its rungs buy. **The figures are the handoff's decision of 2026-09-09, which is the research record's section 4 table taken whole:**

| Rung | Skull | Wisp | Territory pulse | Toll at the grave | Toll at the far edge |
|---|---|---|---|---|---|
| 1 | 8 | 10 | 5 | 40 | 5 |
| 2 | 10 | 12 | 5 | 56 | 7 |
| 3 | 12 | 15 | 5 | 72 | 9 |
| 4 | 14 | 17 | 5 | 88 | 11 |
| 5 | 16 | 20 | 5 | 104 | 13 |

**Author exactly those and cite the record's section 4 in each row's own comment.** Four things about the table are decisions rather than arithmetic, and each of them is a thing a careful coder would otherwise "fix":

- **The rule is plus 25% of the rung-1 value per rung to a ceiling of x2**, taken over the alternative of plus 50% to x3 because the skull stream's own ladder is already the genre's shortest at x5.0 throughput and a x2 damage lane lands the line at x10, inside the genre's x8 to x16 band.
- **The bell is the named exception and it lands at x2.6, not x2.** `touchCounts.test.ts` pins the far edge at exactly an eighth of the near edge (ADR 0036), and plus 25% of 40 is 10, which would put the far edge at 6.25 and break the whole-number eighth. Plus 40% per rung is the smallest step that keeps both whole. **Do not "correct" the bell to a x2 ceiling**: the handoff's sentence says x2 and names the bell's figures in the same breath, and the record's bell note is why the two sit together.
- **The wisp column is rounded down and not recomputed.** Plus 25% of 10 is 12.5, 17.5; the record authors 12 and 17. Author the record's integers.
- **Territory carries no damage row at all.** ADR 0044 as amended on 2026-08-28 holds its ruled touch counts flat and moves only the time the ground takes to deliver them. `TERRITORY_DAMAGE` stays one flat 5. A damage lane there would need that ruling reopened and this slice does not reopen it.

**The shape, and it matters more than the numbers.** Follow the convention the line modules already use for a per-rung row: `COLUMNS_BY_LEVEL`, `WISPS_BY_LEVEL`, `RADIUS_BY_LEVEL`, `REHIT_BY_LEVEL` and `BELL_CONE_ROWS` are all six-entry tables indexed by level with level 0 present, because level 0 is a line a run does not hold. Name yours the same way and give level 0 the same treatment its neighbours give it. `MAX_LEVEL` is 5 and the tree already clamps at it in places (`territory.ts:434`, `:489`), so a lookup refuses or clamps rather than reading past the authored rows, exactly as `rowFor` does in `bell.ts`.

**The damage is read at the moment it lands and never carried on the projectile.** The four call sites are `storm.ts:67` and `:85` (skulls and wisps, with `state` in scope), `territory.ts:611` and `bell.ts:271`. **A skull or a wisp gains no field**: `skullStream.test.ts` pins the skull entity's exact six keys, the witness folds a skull's `x`, `y`, `vx`, `vy` and a wisp's those plus `life` and `targetId` (`witness.ts:166-179`), and `witness.test.ts`'s closed field list would make any new entity field either a folded field or an excluded one with a reason. **A new folded field moves `WITNESS_VERSION`, which is slice E's single move and forbidden here.** Read the rung off `state.levels` at the damage site and the entity does not change.

**(d) The cadence floor, two lines and two opposite shapes (ADR 0058 as amended).** The seam text is the plan's section 4.

- **The skull stream extends.** One running surge runs longer toward a cap rather than a second starting beside it. `state.lines.surgeVolleys` already exists and is already folded (`run.ts:45`, `witness.ts:292`), and its comment today says it is "set by a swallow and never added to". The amendment is that it now adds toward a cap rather than overwriting. **This needs no new field and moves no version.** The cap's own magnitude is the one figure the records do not give: the design record's section 9 says "to be set with the interval". Derive it and write the derivation into its JSDoc in the shape `STREAM_INTERVAL`'s own paragraph uses, stated against `SURGE_VOLLEYS` 2 at `SURGE_INTERVAL` 6, which is one surge's own length, and against `SKULL_CAP` 120, which must not bind. A derived figure with its derivation written down is the standard; a picked one is not.
- **The wisps floor an interval.** The fewest ticks between two volleys, whatever the swallow rate, and **a swallow inside the interval pays nothing later rather than banking a volley**, because a banked volley would pay a stale corpse's freshness on a fresh corpse's tick. The magnitude is the record's section 4 table and its section 9: **about 30 ticks, so author 30**, against `WISP_CAP` 64, which must not bind.

**The wisp interval's clock is ruled, and the ruling is the orchestrator's (2026-09-14): it lands in slice E, not here.** A minimum interval between volleys needs a clock, and the wisps have none: they fire per swallow. Every field of `LineState` is folded (`witness.ts:290-294`) and `witness.test.ts`'s closed field list requires every nested run field to be either folded or excluded with a reason beside it, and its exclusions are identity, gating and written-once fields rather than live rules state. So a wisp volley clock is a folded field, and a folded field moves `WITNESS_VERSION` from 6 to 7, which the plan's verification step 7 says happens exactly once, in slice E, in the same commit that declares every new folded field. **The ruling: the wisp volley clock and the interval it floors move into slice E's fold commit and land with the declaration.** Three resolutions were weighed. Moving the version twice in one step buys nothing, because a tape recorded between C and E is refused after E either way. Deriving the clock off the wisps' own folded `life` fails the moment a whole volley hits early and no wisp survives to carry the time. Landing it in E keeps the version's single move and its one declaration, which is what the plan's rule protects. **What you do here:** author the interval's magnitude (30 ticks) as data beside `WISP_CAP`'s reader in `wisps.ts`, with its JSDoc citing the record and naming slice E as the commit that reads it; write the spec test for the floor (the fewest ticks between two volleys, and a swallow inside the interval pays nothing later) as an `it.fails` tripwire in the shape the tree already uses, with a comment naming slice E as the trigger that flips it; and say in the progress note, in one paragraph, that the wisp half of the cadence floor is owed to slice E by this ruling. **Do not build the clock here, and do not exclude a live rules field from the fold to avoid the version move.** That is a silently weaker witness and it is the exact class of defect `apps/hungry-grave/docs/lessons.md` records under The sim. Confirm the fold facts above against the tree yourself; if the tree shows a clock the fold already carries that floors the interval robustly, that is a finding for the note and still not a change to this ruling.

**(e) ADR 0058's freshness axis is untouched.** Freshness still scales the wisp count with a floor of one soul, and the surge's volleys and never its columns, so a rotten corpse never makes a rung-five stream look like a rung-two one. Spec test 23 is that promise and it must stay green through both floors.

**(f) The stale damage comments, which the handoff owes this slice.** Three files still describe a 40-health shambler and the tests already disagree with them:

- `skullStream.ts`, `STREAM_INTERVAL`'s JSDoc ("A shambler takes five skulls") and `SKULL_DAMAGE`'s line ("Five of these is a shambler exactly").
- `territory.ts:120-124` ("a shambler's 40 is 8 pulses exactly") and `REHIT_BY_LEVEL`'s JSDoc at `:132` ("TERRITORY_DAMAGE stays 5, so a shambler is still 8 pulses").
- `bell.ts:110` ("One shambler exactly") and `:114` ("eight tolls out here to take one trash body").

**And a fourth the handoff did not name and I found in the tree: `wisps.ts` carries the same staleness**, at `WISPS_BY_LEVEL`'s JSDoc ("#76 pass A costs a trash body four wisps") and at `WISP_DAMAGE`'s line ("Four of these is a shambler exactly"). It is one wisp now. Fix it with the other three and say in the note that the handoff's list was three and the tree holds four. Rewrite each comment to state the current counts at the rung it is talking about, in the shape the old one used, and say which rung, because a touch count is now a curve and not a single number.

**(g) `touchCounts.test.ts` re-expressed at rung 1, and not weakened.** It imports the four flat damage constants today, so every import moves when they become tables. The ruled counts are rung-1 counts and that is what the file now pins, which is what the plan's spec test 5 already says: what it pins is where the curve starts and never an invariant. Its header paragraph takes the same edit. **The far edge being exactly an eighth of the near edge holds at every rung** and is worth asserting across the whole table rather than at rung 1 alone, because that is the ruling ADR 0036 actually carries.

**(h) `CONTEXT.md`'s Surge entry, which is the one glossary edit this slice owes.** The plan's module table says nothing is owed to a code slice and that row is about the standing waves, the purse and the card. The Surge entry's own last clause is "One swallow buys one surge, and a swallow chain overwrites an unspent one rather than banking a queue", and this slice makes that untrue: a chain now lengthens the running surge toward a cap. Restate that clause and nothing else in the entry, cited to ADR 0058 as amended. **"Never a damage bonus" stays true and stays**: the damage lane is bought with a rung and never with a swallow. Add nothing else to the file.

**(i) `GOLDEN` re-pins here, and it is the third of the five the plan permits.** `GOLDEN` carries `size: 24.50625` and `reservoir: 0.50625` at tick 600, both of which are exactly one fresh trash corpse's payout at 80 corpses to the ceiling, so both move when `CORPSES_TO_CEILING` does. **A re-pin here is planned and expected and never a stop-and-report**, and it lands with a dated paragraph in `digest.ts`'s JSDoc naming what moved, what held and why, in the shape the nine paragraphs already there use. A move with no paragraph is a stop even when the number is right. Check progress note section 2 for whether slice B used its own permitted re-pin; yours is the third permitted either way.

**(j) `pnpm verify` green** at the repo root, after `pnpm typecheck` and `pnpm vitest run` green in `apps/hungry-grave/`, and `pnpm build`. A timeout with no assertion is contention and not a failure: run the suite alone once more before calling anything red (`docs/agents/lessons.md`).

**(k) The measurements this slice owes.** A hand-recorded tape at your own tip, recorded against the built app through `vite preview` and driven with `playwright-cli` and never the Playwright MCP, then `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts <tape>` asserting `outcome: 'verified'`. **Print `state.refusals` off that tape in your report, all three counters** (`food`, `carriers`, `offers`). The plan's verification step 10 asks for the corpse, mob and mob-fire refusal counters and the tree carries three counters under those names instead, with `refusals.carriers` being what the mob pool turned away; report against what the tree has.

**A hand tape cannot reach a high rung, so the damage lane needs a conditioned tape to be measured at all.** `pnpm vite-node --config vite.headless.config.ts scripts/record-conditioned.ts <out> <seed> <ticks> skullStream=N territory=N wisps=N bell=N`, measured the same way. Take at least one at rung 1 and one at rung 5 on the same seed, and report what the climb did to the kill rate and to the two line caps. **`WISP_CAP` 64 and `SKULL_CAP` 120 are the reason the cadence floor exists and a bound cap is a fault rather than a number to raise**, so a conditioned run at rung 5 in Crowd density is the run most likely to bind one.

**The rendered check.** The plan names no shot for this slice, unlike slice B's. Take one anyway, because everything here changes what a player sees: the belch meter's fill rate and the grave's growth over a Procession are the two things the economy move is about. Read the screenshot yourself, say in the report what you see, and hand it to Mark. Play a run, end it, and play again, because a rendered check that only ever plays run one is structurally blind.

**(l) CodeRabbit CLI, one iteration.** `git add` every changed and new file **by path**, never `git add -A` and never `git add .`, because the review does not see untracked files. Then, from the worktree root, `coderabbit review --agent --uncommitted`. Apply the real findings. Decline the rest with a reason recorded in the progress note. **One iteration**, then move on.

**(m) One code commit, conventional, single line, ending in `(#39)`.** Something in the shape of `feat(hungry-grave): the economy is stated in corpses of mowing and every rung buys damage (#39)`. Pass the message with `-m`. **Never a heredoc.** No body and no trailer of any kind: every commit on this branch is one line, and a `Co-Authored-By` line is a trailer. Never commit unverified code.

**(n) The progress note.** Append a new section to `apps/hungry-grave/docs/push/step-4-progress.md`, numbered **15** and titled "Slice C: the economy waves, the burst cadence and the weapon climb (#39)", and add your row to section 1's table and your entry to section 2's `GOLDEN` list. Say what the game does now, the magnitudes you authored and where each came from, the surge cap's derivation, the file count and the test-name diff's two numbers, the `GOLDEN` outcome with its paragraph, `state.refusals` off your hand tape, what the conditioned tapes said about the two line caps, the hit-cost relation from item (b), what the rendered check showed, the CodeRabbit findings applied and declined, anything in the plan or either record you found false against the tree, and anything you left for a later slice with the slice named. Commit it as `docs(hungry-grave): step 4 progress note records slice C (#39)`.

**(o) Stop and report.** Under 300 words: the commit hashes, the test counts before and after, the test-name diff's removed and added figures, the `GOLDEN` outcome, the three refusal counters, the wisp-interval question from item (d) and where you left it, the rendered check in one sentence, the CodeRabbit outcome, and anything you could not do. Do not start the next slice.

### What must not move, and a move is a stop

- **The fences.** `boundary.test.ts`, `lineAgnosticPolicies.test.ts`, `executionFence.test.ts`, `harnessStatesNoTarget.test.ts` and `comparisonDeclared.test.ts`, five files, all green, each named by test title in the note. `lineAgnosticPolicies.test.ts` is the one a per-line damage table is most likely to trip: a policy module that learns a line's name to price its damage is exactly what that fence forbids.
- **The invariants.** Every check in `invariants.ts` keeps its meaning and its severity, and the three fault identity wire numbers 11, 12 and 19 are held. The reservoir invariant at `invariants.ts:443` reads `RESERVOIR_CAPACITY` and follows it; check it still fires on the same condition.
- **Replay determinism.** One seed played twice under `shaky-short` gives the same tick count, the same witness at every checkpoint and identical stream cursors. A tape recorded at your tip decodes, replays and verifies.
- **`FORMAT_VERSION` 3** (`wireCodes.ts`), **`WITNESS_VERSION` 6** (`witness.ts`) and **`READINGS_VERSION` 4** (`readingsVersion.ts`). None of the three moves in this slice and a move in any of them is a stop-and-report. `FORMAT_VERSION` is slice G's single move and `WITNESS_VERSION` is slice E's.
- **`STREAM_SALTS` in `rng.ts`**, every entry. Slice B0 found that a stream's salt seeds its sequence, so moving one silently re-seeds a run and breaks every tape recorded before it. The power-up stream's salt is still the string `drops` for exactly that reason, and a test pins it.
- **`WISP_CAP` 64 and `SKULL_CAP` 120** (`caps.ts:131-132`). They are stated rather than changed, because raising a cap to fit an unfloored volley rate is the tuning-knob use of a cap that ADR 0056 forbids. `MOB_CAP`, `MOB_FIRE_CAP` and `CORPSE_CAP` are slice D's.
- **`RESERVOIR_CAPACITY`'s identity with `FEAST_PAYOUT`.** It is an expression and never a number.
- **`src/game/stage/` and `src/game/offer.ts`.** The stage is slice B's and the bank expiry is withdrawn from round one, so no slice opens `offer.ts`.
- **The harness's own rows.** `enoughClearance`, `belchWorthIt`, every lapse rate and every look-ahead list belong to the hand, and the hand's rows are never tuned with the game's. `belchWorthIt` prices a full reservoir and the reservoir moves 33-fold under you, so it is the one most likely to look wrong. **It does not move**, and a hand row moved between two batches would compare two builds through two instruments.
- **ADR 0044's flat Territory touch counts**, and **ADR 0042's Wall**, and **Territory's rungs**, which no slice owns and which are Mark's.
- **No test is deleted, skipped, weakened or rewritten to reach green.** A measured baseline that moves because the economy moved is re-measured with its comment saying what moved and why; a ruled pin that moves does so in the same motion as the ruling with the ruling cited in the test's own comment; a test you believe is wrong is a stop-and-report, because replanning is not your call.
- **No ADR gains a combat magnitude.** The numbers are data rows in the line modules and in `tuning.ts`, each cited to `docs/research/weapon-growth-per-level-precedent.md`. **You file no ADR in this slice and you amend none**, ADR 0058 included.

### Seams under test

`src/game/tuning.ts`: `CORPSES_TO_CEILING`, `FEAST_PAYOUT`'s multiplier, and the `RESERVOIR_CAPACITY` identity read through both. `src/game/lines/skullStream.ts`: the per-rung damage row, `surgeStream` extending a running surge toward a cap, and the surge cap itself. `src/game/lines/wisps.ts`: the per-rung damage row and the volley interval, subject to item (d). `src/game/lines/bell.ts`: the per-rung near and far rows and the interpolation at `:271` that reads both. `src/game/lines/territory.ts`: `TERRITORY_DAMAGE` held flat and its two stale comments. `src/game/storm.ts`: the two damage sites reading the rung off `state.levels` at the moment a skull or a wisp lands. `src/game/lines/roster.ts` through its tests, read by spec tests 19a to 19c and written by nobody here. `src/dev/digest.ts`: the golden pin and its dated paragraph. `apps/hungry-grave/CONTEXT.md`: the Surge entry.

### Module boundaries

No module is created, deleted, merged or split and no import direction changes. **Each line's climb lives in that line's own module** and never in a shared table, because ADR 0005 gives each line its own five levels and a band held over the roster would be a rule the roster does not have. **The cadence floors live in each line's own module** beside the row they floor. **No policy module learns a line's name**, which `lineAgnosticPolicies.test.ts` proves. `src/game` still imports nothing from `src/dev`, and `boundary.test.ts` proves it. `src/game/stage/waves.ts` still value-imports nothing and you do not open it. **No entity gains a field and no `LineState` field is added without the stop in item (d).**

### The planned test list

From the plan's section 6, item by item, each written red first.

18. *A fully fresh feast fills the reservoir exactly and wastes nothing.* Pins decision 5.11 and the identity `RESERVOIR_CAPACITY` is written as. **The existing test at `tuning.test.ts:68` asserts both the identity and that the feast is worth 8 to 10 corpses. The identity half is the ruling and it holds; the 8-to-10 half is the magnitude and it moves to 300 in the same motion as the economy ruling, with the record's section 4 cited in the test's own comment.** Say so plainly in the note rather than letting a moved bound read as a weakened test.
19. *The ceiling is reached in the corpses the economy row names and not in a tenth of them.* Pins the record's section 5 item 4 as a relation rather than as a figure.
19a. *Each line's climb over its five rungs is the one that line's own row states, and it is read per line.* ADR 0005. There is no band shared across lines, and a test that read one would be asserting a rule the roster does not have.
19b. *The first rung buys more than an even share of a line's climb.* The record's finding that the first upgrade is the one the player must feel. **Read it against what a rung buys altogether and not against the damage lane alone**, because the damage lane is deliberately even at plus 25% a rung and the front-loading lives in the columns, souls and cones the rung already bought.
19c. *No line buys its climb with a bare damage number.* The axis finding, and a promise the tree already keeps: the skull stream buys columns, the wisps souls, the bell cones, Territory radius and pace. Held as a test so a later line cannot quietly become a damage curve.
20. *Two swallows inside the volley interval fire one volley.* Pins the cadence floor.
21. *A volley skipped by the interval is not banked for later.* The deliberate-absence half.
22. *A swallow during a running surge extends it toward the cap rather than starting a second.* Pins ADR 0058 as amended.
23. *Freshness still scales the wisp count with a floor of one soul, and the surge's volleys and never its columns.* Pins ADR 0058's freshness axis surviving the amendment untouched.
- **Module tests, which the plan's own list omits for this slice.** The per-rung damage lookup at level 0, at `MAX_LEVEL` and past it, for each line that has one. The surge extension at one swallow, at the cap and past it. The wisp interval at a swallow on the boundary tick and one tick either side, subject to item (d). The bell's far-to-near eighth at every rung.
- **`touchCounts.test.ts` re-expressed at rung 1**, item (g), with the eighth asserted across the table.
- **The golden digest** at `digest.test.ts`, per item (i).
- **The five fences**, green, each named by title.

**What this slice is expected to turn red, so the diff is read against something.** Every test that imports one of the four flat damage constants: `touchCounts.test.ts`, `storm.test.ts`, `mobs.test.ts`, `wisps.test.ts`, `bell.test.ts`, `territory.test.ts`, `skullStream.test.ts`, `bosses/__tests__/phases.test.ts`, `bosses/__tests__/undertaker.test.ts`, `stage/__tests__/stage.test.ts` and `stage/__tests__/setPiece.test.ts`, the last three of which compute a damage-per-second estimate off `SKULL_DAMAGE` and `BELL_DAMAGE_NEAR` and now have to say at which rung. Every test that reads the economy: `tuning.test.ts`, `swallow.test.ts`, `belch.test.ts`, `invariants.test.ts`, `execution.test.ts`, `advance.test.ts`, `step.test.ts` (whose comment at `:605` says a point of health "because `BELL_DAMAGE_NEAR` is one shambler exactly"), `banshee.test.ts` and `readings/__tests__/belchCadence.test.ts`. Plus the measured per-seed baseline tables in `bot.test.ts` and `harnessPolicy.test.ts`, `digest.test.ts` with the re-pin, and `caps.test.ts` if a line cap binds, which is a finding rather than a fix. **A realistic count is 18 to 25 files.** A diff much smaller than that is a reason to look for the tests that should have moved and did not. Slice A's table said five files and the diff said 19; slice B0 touched 143.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck` green from `apps/hungry-grave/`. It is the only judge of diagnostics; editor diagnostics name scratch files and stale states.
2. **Agent.** `pnpm vitest run` green from `apps/hungry-grave/`, then `pnpm build`, then `pnpm verify` green at the repo root.
3. **Agent.** The test-name diff. `pnpm vitest list --json > <current>` into the scratchpad, then `pnpm vite-node --config vite.headless.config.ts scripts/test-names.ts apps/hungry-grave/local/step4/tests-baseline.txt <current>`. **The baseline is at `apps/hungry-grave/local/step4/tests-baseline.txt`, beside its `.json` sibling, 1834 names**, and not at the worktree root where the handoff's wording reads. Do not recreate either file. The step 0 baseline predates slices A0, A, B0 and B, so it cannot isolate your slice; if you want a diff that can, capture the tip before your commit the way slice B0 did (progress note section 13) and report both.
4. **Agent.** Replay determinism: one seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
5. **Agent.** A hand-recorded tape at this tip through `vite preview`, driven with `playwright-cli`, run through `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts <tape>` asserting `outcome: 'verified'`, with `state.refusals` printed into the note. Item (k).
6. **Agent.** At least two conditioned tapes through `scripts/record-conditioned.ts`, one at rung 1 and one at rung 5 on the same seed, each measured to `outcome: 'verified'`, with what they say about `WISP_CAP` and `SKULL_CAP` in the note. Item (k).
7. **Agent.** The rendered check: the belch meter's fill rate and the grave's growth over a Procession, read and reported, with a run played, ended and played again. Item (k).
8. **Agent.** The five fences green, each named by test title in the note.
9. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
10. **Human (Mark), and none of these blocks you.** Whether the belch now reads as a cadence rather than a reflex; whether a rung feels like a real step; whether Territory's bottom rung still reads as his #79 ruling meant it (plan verification step 23, and no slice owns Territory's rungs); whether the Wall is still meant to cost something (plan verification step 22). The push runs in one-push mode: you continue past every one of them and he reads them on the branch.

### State of the branch

- Branch `hungry-grave-v1`, worktree `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/hungry-grave-v1`. Run `git log --oneline -25` and `git status --short` first and check the tree is clean before your first edit. **The tip should be slice B's docs commit and the last code commit should be slice B's.** Below it, `2ec6ee5efc` is slice B0's rename and `d4dedf6d9a` is slice A.
- At `d4dedf6d9a`, `pnpm verify` was green, exit 0: 141 test files, 1860 passed, 19 expected fail, 2 todo, five fences green at 71 tests. Slice B0 took the suite to 1861 passing on the same shape. Read progress note section 14 for where slice B left it.
- `GOLDEN` has re-pinned at least once, slice A's, and possibly twice with slice B's; **yours is the third of the five the plan permits** either way. `WITNESS_VERSION` 6, `FORMAT_VERSION` 3, `READINGS_VERSION` 4.
- Slice A is deployed at https://hungry-grave.vercel.app. **You do not deploy.**
- `local/` reaches none of the standing checks: outside version control, outside eslint, outside prettier, outside `tsconfig.json`'s `include`. The one thing that does reach it is vitest, which has no config of its own, so a `*.test.ts` left under `local/` runs in the suite. **Nothing under `local/` ever enters a commit.** Scratch work goes in the scratchpad directory your system prompt names, never under the repo, and the scratchpad is shared between agents, so give your files distinctive names.
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

Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first. A claim in the plan or in either record that is false against the tree is recorded in the progress note and the source's intent is followed rather than its stale letter; if the intent is unclear, that is a stop. **A gate finding or a measurement that argues against something Mark ruled is filed for his read and built past, never applied.**

**Three things in this slice are already known to be a stop or a finding, so you do not have to discover them:** the wisp volley clock and the fold, item (d), which is the slice's one planned stop; the hit-cost relation in item (b), which is a finding you write down; and the paragraph below on the two records' own collisions.

**The two collisions the records themselves flag, both filed and neither yours to resolve.** The weapon growth record's Open items name them. First, **ADR 0058's second paragraph says the skull stream's column count is "exactly what draws the line's five levels"**, and a damage lane makes that no longer exactly true; the record's own reading is that this is a collision of wording rather than of rulings, because ADR 0058's subject is which axis freshness scales and freshness is untouched here. **Record it in the progress note as a finding for the orchestrator and do not edit the ADR.** Second, **ADR 0044 holds Territory's touch counts flat while the damage lane grows, so a revenant's Territory cost climbs over a run while its skull cost falls.** That is already in the handoff as a finding filed for Mark's read. Build the flat Territory row as ruled, and say in the note that you did and why.

**And one thing that is struck rather than owed, so you do not build it.** The weapon growth record's section 4 carries a health step of x1.00, x1.15, x1.30 per section with the mow body exempt, and a hits-to-kill table computed against it. **The second gate round struck the per-minute enemy health step on evidence** (progress note section 12): the figures it rested on are Mad Forest's Inverse mode, which is that stage's hard mode, and ADR 0059 rules the direction anyway, that growth is more enemies and harder ones rather than the same enemies wearing more health. Slice B's guard test that a body carries exactly its `MOB_TYPES` row is that absence made mechanical and it must stay green under you. The question is kept as a batch question with `timeToKill.ts` in slice G as its trigger. **Author no health multiplier, no per-section step and no per-minute rate, and touch no `MOB_TYPES` row.**

### What is not your job

- **Slice B's work.** The standing waves, the re-authored section tables, the carriers, `repeatingArrivals`, `peakArrivals`'s rate term, `wavesUnderThePour`, the Wall's wave and the guard test that a body carries exactly its `MOB_TYPES` row. If slice B left any of it undone, that is a finding for the note and not work you pick up.
- **Slice D's work.** `MOB_CAP`, `MOB_FIRE_CAP` and `peakLive` as derivations, the card table, `BODY_COST`, `cardCost`, the three section purses and the new import fence.
- **Slice E's work.** The widened fold, `WITNESS_VERSION` 6 to 7, `StreamName`, `director.ts`'s first appearance, and the `Mob` provenance mark.
- **Slice F's work.** The director's signal, `Section.purse`, the spend, the quiet interval, the `directedAdd` event and the purse invariant.
- **Slice G's work.** The readings, `timeToKill.ts`'s per-minute split, the signal lock, `FORMAT_VERSION` 3 to 4 and the `bot.ts` comment.
- **Territory's rungs**, which no slice in the plan owns and which are Mark's.
- **`src/game/offer.ts` and the bank expiry**, withdrawn from round one, so no slice opens that file.
- **Prose in `docs/design` and `docs/adr` still carrying the old six words.** A follow-up docs pass owns it.
- **Mark's follow-along doc**, https://md.niftymonkey.dev/api/raw/CTtB5BJJ. The orchestrator's.
- **Deploying, pushing, merging, opening a PR, or closing a ticket.** Each needs its own explicit yes and none of them is yours.

---

## Slice D: the caps become derivations

Model: Opus, subagent type general-purpose. One coder, one code commit, one docs commit. Commit messages end in `(#39)`, which is the ticket every step 4 docs and code commit cites.

Step 4 slice D of The Hungry Grave (ticket #39): the engine's caps stop being numbers somebody wrote down and become derivations of the stage's own data, and the director's table of cards, body costs and section purses lands where the derivation can read it.

**This prompt is written in the new vocabulary, which slice B0 landed.** A wave is what used to be a row, a formation what used to be a template, a section what used to be a phase, a phase what used to be a boss chunk, a power-up what used to be a drop, the HUD what used to be the strip. The files are `src/game/stage/waves.ts`, `src/game/stage/formations.ts` and `src/game/bosses/phases.ts`. **The step 4 plan, both design records and ADRs 0047 and 0056 still speak the old words**, because prose beyond the eight renamed ADR titles was deliberately left (progress note section 13): translate, and never take a word difference for a different thing. Where the plan's seam block says `rows.ts`, `StageRow`, `Phase.purse`, `PROCESSION_ROWS` or `TemplateName`, it means `waves.ts`, `StageWave`, `Section.purse`, `PROCESSION_WAVES` and `FormationName`.

**Line numbers in this prompt were read at slice B0's tip and slices B and C move many of them.** Find the name, never the line.

**Slices B and C land before you and both touch files you read.** Slice B owned `src/game/stage/` and `caps.ts`; slice C owned `tuning.ts` and the four line modules. **Read progress note sections 14 and 15 for what each actually did** rather than trusting any list, and section 2 for the `GOLDEN` moves. You touch neither `src/game/lines/` nor `src/game/offer.ts`.

**Two rulings the orchestrator made while slice B ran, and both change this slice's contract.**

**First: slice B pulled `MOB_CAP`'s derivation forward and this slice does not do it.** Slice B's authored crowd rate could not fit the old constant 160, and ADR 0056 rules that the content prices the cap and never the cap the content, so `MOB_CAP` became a derivation from `peakLive()` inside slice B's own commit, with `peakLive` and a transit-seconds bound beside it. **Your first act after reading is to verify that against the tree**: `MOB_CAP` in `src/game/caps.ts` is a derivation and not a literal, `peakLive` exists, and progress note section 14 says what B landed and what figure it produced. **If `MOB_CAP` is still a literal, that is a stop and report**, because a derivation the plan assigned to two slices and neither landed is a gap you cannot close by guessing which half was meant. What is still yours is everything else: `MOB_FIRE_CAP`, the terms `peakLive` and `CORPSE_CAP` are still missing, the card table, `BODY_COST`, `cardCost`, the three section purses, the import fence, and spec tests 16, 17 and 24 to 29.

**Second: `WITNESS_VERSION` 6 holds through this slice and you add no folded field.** The wisp volley clock and its interval floor were ruled into slice E's fold commit while slice C was drafted, on the rule that the version moves exactly once and in the commit that declares every new folded field. That ruling is not yours to apply or revisit, and it binds you only here: **nothing this slice adds may be a folded field**. The caps are module constants, the card table and the purses are authored data, and none of them is run state. If you find yourself wanting a field on `RunState`, `LineState` or `Mob`, you have left this slice.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. The six dispatch contract items are the sections below.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md` at the repo root, plus `docs/agents/code-examples.md` for any rule that leaves the path unclear, and `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/design/step-4-mow-ladder-director-dispatch.md`, 130 KB, with the Read tool in ranges and never with `cat`. **Its step 10 in section 10 is this slice and it is the contract.** Section 4's `caps.ts` block is the seam text and its three rules; section 4's `rows.ts` block carries the `DirectorCard`, `BODY_COST`, `cardCost` and purse declarations and the module-boundary paragraph that explains why they live there; section 5's module table gives you `caps.ts`, `waves.ts` and `invariants.ts`; section 6 is the planned test list (spec tests 16, 17 and 24 to 29, the module tests in the 58 to 72 group, and fence 76); section 7's `MOB_CAP` and `MOB_FIRE_CAP` entry lists every reader; section 3 is the verification steps.
4. `apps/hungry-grave/docs/design/mow-ladder-director.md`, the design record. **Section 5 item 7 is this slice** and it carries the three rules the derivation has to satisfy and the cap table. Section 5 item 6 is the director's own table, which is where the body costs, the card examples, the purse rule and the quiet interval live. Section 9 is the magnitude table.
5. `apps/hungry-grave/docs/adr/0056-the-director-spends-a-finite-budget-per-section.md`, which is the ruling this slice implements: a finite purse per section, the caps re-derived above the section's floor plus its budget, and a cap that binds raising a fault and never evicting. And `apps/hungry-grave/docs/adr/0047-directed-density-inside-authored-beats.md`, which rules that the waves stay the floor and names the four off-limits moments. Both still carry the old words.
6. `apps/hungry-grave/docs/push/handoff.md`, the STEP 4 BRIEF and the Standing rules. **The finding "The shipped caps cannot stand three of the six frame-budget fields" is this slice's input rather than a note beside it**, and it is spelled out in progress note section 4 item 3.
7. `apps/hungry-grave/docs/push/step-4-progress.md`: section 1 for the state of the step, section 2 for the `GOLDEN` moves, **section 4 item 3 for round 0's refusal**, section 6 for the test baseline's real path, section 9 for round 0's own tables and the two commands, section 11 for slice A, section 12 for the second gate round, section 13 for slice B0, **section 14 for slice B and section 15 for slice C**.
8. `apps/hungry-grave/CONTEXT.md`, the entries Card, Purse, Pressure, Add, Directed density, Standing wave, Section and The mow. **You add nothing to it and you change nothing in it**: Card and Purse landed at `9cba278131` and your names have to agree with them.

### The definition, in observable terms

After this slice: a reader opening `src/game/caps.ts` finds no cap written as a number except the two line caps, and finds `MOB_CAP` and `MOB_FIRE_CAP` each computed from the stage's own data with the proof written above it in the shape `CORPSE_CAP`'s own paragraph already uses. `MOB_FIRE_CAP` stands above the revenant peak plus the worst boss pattern in the air at once, because boss fire and trash fire share one pool. `CORPSE_CAP` keeps its shape and its identity test, and the addend its own JSDoc says is deliberately missing is missing no longer: it is the most the director can add inside the freshness window, and that paragraph is rewritten in the commit that fills it.

A reader opening `src/game/stage/waves.ts` finds a card table, a per-body cost row and three named section purses sitting beside the section tables, and finds `VIGIL_PURSE` written as zero rather than as null. A card costs the sum of its bodies at shambler 1, ghoul 3 and revenant 4, so a card of four shamblers in a File costs 4 and a card of two revenants in a Drip costs 8. No director exists yet and nothing reads a purse except the caps derivation, which is the point: the figures land where the derivation can read them without closing a cycle.

A new fence test fails if `src/game/caps.ts` ever imports `src/game/stage/stage.ts`, by a value import or a type-only one, and it fails for a type-only import on purpose.

The frame-budget instrument runs and prints what the derived caps can stand. **Whatever it prints is the reading**: the caps are whatever the content prices, and a field the derivation still refuses is a fact you report rather than a cap you raise.

`pnpm verify` is green, the test-name diff is read against the baseline, `GOLDEN` does not move, and `state.refusals` off this slice's own hand tape is printed in the report.

What a player meets: nothing. This slice moves no rule of play. If anything you do changes what happens on the field, the slice is wrong: stop and report.

### The work, in this order

**(a) Verify slice B's half of the derivation before you write a line.** `MOB_CAP` is a derivation, `peakLive` exists, and progress note section 14 says so. **A literal `MOB_CAP` is a stop.** Then read `caps.test.ts` and `waves.test.ts` for the corpse-cap identity tests that already stand (`caps.test.ts` around `:148` and `:163`, `waves.test.ts` around `:303-305`), because they are what keeps the derivation honest when a term moves under them, and they must still pass at the end.

**(b) The tests first, red, from the plan's section 6.** Spec tests 16, 17, 24, 25, 26, 27, 28 and 29, each written as a `test.todo` placeholder first and then turned red against a stub. 16 and 17 extend `src/game/stage/__tests__/waves.test.ts`; 24 to 29 extend `src/game/__tests__/caps.test.ts`. The fence, item 77 of this prompt's test list and item 76 of the plan's, is its own file or joins the existing boundary fence, item (i) below. The module tests are the plan's 58 to 72 group: `cardCost` over a card of one body and over the largest card in the table, and `peakLive` over a stage with no standing waves.

**(c) The card table, the body costs and `cardCost`, authored in `waves.ts`.** The seam text is the plan's section 4, in its `rows.ts` block. Three exports and one type:

- **`BODY_COST`, a `Readonly<Record<MobType, number>>`: shambler 1, ghoul 3, revenant 4.** From the record's section 5 item 6 table, cited in the row's own comment, and it is what it is against the roster's own health and threat at 8, 20 and 64.
- **`DirectorCard`: a formation, a mob type and a count**, which is the same triple a `StageWave` carries, because an add is a card and never a loose body (the game design gate, `CONTEXT.md`'s Card entry).
- **`cardCost(card)`: the sum over its bodies.** The purse spends on cards and never on single bodies.
- **`CARDS`, the table itself.**

**The card table's own rows are the one thing no source states, and that is a gap in the plan rather than a licence.** The plan and both records give you the cost rule, the shape and exactly two worked examples, a card of four shamblers in a File costing 4 and a card of two revenants in a Drip costing 8 (the record's section 5 item 6). Author a small table from the formations and mob types the section tables already use, keep those two examples in it as the cited rows, and **keep the largest card small**, because the largest single card is an addend on `MOB_CAP` and the record's section 5 item 7 says what a padded cap costs on every tick of every run. Say in the progress note that you authored the rows and what you set them against, so the next reader sees an authored table rather than a quoted one.

**(d) The three section purses, named constants beside the section tables.** `PROCESSION_PURSE`, `CROWD_PURSE` and `VIGIL_PURSE`, each a number.

- **The rule: about a third of that section's standing-wave total in bodies** (the record's section 5 item 6 and its section 9), which is what ADR 0056's "when the purse is empty the section runs at its authored floor for whatever is left of it" is measured against. **So the figures depend on what slice B actually authored**: work each one out against B's landed rates, write the arithmetic into the constant's own JSDoc, and author a whole number.
- **`VIGIL_PURSE` is 0, and it is 0 rather than null.** The Vigil owns scarcity, and the director may look at it and find nothing, which a reading can see from the first tick. A null would be an absence rather than a figure, and the difference is guarded by spec test 17.
- **Named constants and never a record keyed by section name.** A section name is `stage.ts`'s type and `waves.ts` must not know it, not even as a type import, because the rule below is a rule about direction and a type-only import is how it gets dodged.
- **`Section.purse` is not yours.** The column on `Section` and the reference wiring it to these constants are slice F's, per the plan's module table. You author the figures and nothing reads them but the caps derivation.

**(e) `MOB_FIRE_CAP`, derived, and this is the hard part of the slice.** The contract, from the plan's section 4 and the record's section 5 item 7: **the revenant peak plus the worst boss pattern in the air at once**, because the Banshee's tears and the Undertaker's shots go through `fireDirectedShot` into the same pool the revenants use (`bosses/banshee.ts:125`, `bosses/undertaker.ts:233`, `:280`, and the pool at `mobFire.ts:107`). A derivation that read the revenant peak alone would size a pool for a field that never happens.

**The obstacle is real, it is in the tree, and slice B hit its sibling.** `caps.ts` cannot read the mob table: `mobs.ts:4` value-imports `caps.ts`, so reaching back for `MOB_TYPES` closes a cycle, which is why slice B's transit bound is written off the scroll speed alone with that reason stated in its own JSDoc. The revenant's fire interval and shot speed are `MOB_TYPES` rows and the boss patterns are constants inside `bosses/`, and `bosses/undertaker.ts` value-imports `mobs.ts`, so that path closes the same cycle.

**How to resolve it, in this order, and a cycle is never the answer.** Take the smallest honest shape that keeps every arrow pointing inward. Read what the derivation genuinely needs first, because a loose upper bound is the direction a safety net rounds and the shot count may fall out of figures `caps.ts` can already reach: the live armed bodies are bounded by `MOB_CAP`, which you already have, and a shot's own stay on the field is a field height over a shot speed. If the honest derivation needs a magnitude that lives in `mobs.ts` or in a boss module, **author that magnitude as data in `waves.ts` beside the card table** with its JSDoc citing where the row it mirrors lives and why it is duplicated, which is the same move the plan makes for every other figure the derivation needs and the reason the card table and the purses live there at all. **A duplicated magnitude that can drift silently is guarded by a test that fails when the two disagree**, and that test is yours to write. **Two failed honest attempts, or a shape that needs a module moved, split or created, is a stop and report**: name what you tried and why each failed, because moving a module is a decision above this slice. **Leaving `MOB_FIRE_CAP` a literal is not a silent option**: if you stop, you stop, and if you build it you build it, and either way the note says which.

**(f) The two terms the derivation is still missing, and both are the director's.**

- **`peakLive` gains the largest single card, and never a purse** (the plan's section 4, first of its three rules, and spec test 26). A purse is spent over a section with a quiet interval between every add, so a purse-sized addend sizes the pool for a moment the quiet interval forbids. The largest card is the most the director can put down at once, which is what a pool has to hold.
- **`CORPSE_CAP` gains the addend its own JSDoc calls deliberately missing**: the most the director can add inside the freshness window, which the quiet interval bounds (the record's section 5 item 7, the plan's section 4). `FRESHNESS_SECONDS` is `FIELD_HEIGHT / 2 / (SCROLL_SPEED * TICK_HZ)` at `tuning.ts:37`. **The quiet interval's own bounds are the director's rows and slice F authors them, 4 to 8 seconds, and ADR 0056 leaves them open as design work** (the record's section 9). So the figure you need does not exist in the tree: **author the minimum as data in `waves.ts` beside the card table**, with its JSDoc citing the record's section 9 and naming slice F as the commit that reads it for the director's own draw, exactly as slice C was told to author the wisp volley interval ahead of slice E. Then price the addend as the cards that minimum leaves room for inside the freshness window. **Rewrite the "deliberately missing" paragraph in the same commit that fills it**, because a comment that explains an absent thing is a comment about code that no longer exists.
- **`CORPSE_CAP` keeps its shape and its identity test.** It is `MOB_CAP + peakArrivals(FRESHNESS_SECONDS) + TREASURE_ALLOWANCE` plus this addend and it stays a sum of named terms. The identity test at `caps.test.ts` around `:148` moves with it in the same motion, with the addend named in the test's own comment, and the "a later term can only raise it" test around `:163` stands. **Neither is weakened**, and a moved identity is stated plainly in the note rather than left to read as a loosened assertion.

**(g) Tight, not padded, and the fault is what protects it.** The record's section 5 item 7 and the plan's third rule: `stormTargets.ts:113` sizes a scratch array from `MOB_CAP` at module load, `FieldRenderer.ts:175-178` allocates a sprite per slot for the mob, shot and corpse caps, and every pool is walked whole whether or not a slot is alive, which was round 0's second finding. Padding is paid on every tick of every run. **What protects a tight cap is the fault: a bound cap raises one and nothing is ever evicted**, which is `caps.ts`'s own rule already and which ADR 0056 says is that rule applied rather than a new one. **So no headroom multiplier and no safety margin bolted onto a derivation.** Headroom belongs inside the derivation, in the worst case each term prices, which is how slice B wrote the transit bound.

**(h) No cap is lowered for a phone.** `caps.ts`'s own paragraph rules that the caps are identical on every device, so round 0's phone figure is a reading and never a reason to move a cap. What to do if the phone cannot draw the field is open and it is Mark's (the record's section 12 item 4).

**(i) The new import fence: `game/caps.ts` imports nothing from `game/stage/stage.ts`.** The plan's test 76, and it is the tech architecture gate's finding made mechanical: `stage.ts` value-imports `mobs.ts` and `mobs.ts` value-imports `caps.ts`, so that edge closes a cycle. **A type-only import satisfies a bundler and fails this test on purpose**, and the test's own comment carries that ruling. Put it where the tree already keeps its fences, beside `boundary.test.ts`'s rules or in it, and name it for the behaviour it guards rather than for the module it names. Whichever file it lands in, that file is one of the fences named by test title in your note.

**(j) `invariants.ts`, which the module table gives you a half of.** The table names `invariants.ts` under slices D and F for "the purse never going negative; no cap binding". **The purse invariant is slice F's** and it needs a director to go negative. Your half is that `entity caps`, `corpse cap never binds` and `carrier spawn never refused` keep their meaning and their severity against derived caps rather than constant ones, which is spec tests 28 and 29. **If those checks already say what they need to say, you add nothing and you say so in the note**, because a check added to satisfy a table row is a check nobody needed.

**(k) `pnpm verify` green** at the repo root, after `pnpm typecheck` and `pnpm vitest run` green in `apps/hungry-grave/`, and `pnpm build`. A timeout with no assertion is contention and not a failure: run the suite alone once more before calling anything red (`docs/agents/lessons.md`).

**(l) The measurements this slice owes, and the frame budget is the one that makes this slice worth doing.**

- **The frame-budget instrument, which is this slice's own reading.** `pnpm vite-node --config vite.frame-budget.config.ts scripts/frame-budget.ts` from `apps/hungry-grave/`, and the plainer `--config vite.headless.config.ts` spelling too, which runs the same script under the shipped caps and refuses the fields the pools cannot stand (progress note section 9, the refusal at `3594fe154a`). **Round 0's finding is this slice's input**: `MOB_CAP` 160 and `CORPSE_CAP` 233 could not stand 100/250, 200/500 or 400/1000 at all, and the step 4 peak of 80/200 did fit (progress note section 4 item 3). Report the derived figures, and which of the six fields the build now stands and which it still refuses, against those numbers. **Do not raise a cap to make a field pass.** The instrument's refusal is evidence about what the content prices, and a derivation that refuses a headroom probe is a derivation doing its job. `FrameBudgetScreen.ts:60` and `:218` print the caps in the refusal message and take whatever the derivation gives them; check that message still reads true.
- **A hand-recorded tape at your own tip**, recorded against the built app through `vite preview` and driven with `playwright-cli` and never the Playwright MCP, then `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts <tape>` asserting `outcome: 'verified'`. **A derived cap changes what a refusal path does, which is why the plan owes this slice a hand tape.** **Print `state.refusals` off that tape in your report, all three counters** (`food`, `carriers`, `offers`). The plan's verification step 10 asks for the corpse, mob and mob-fire refusal counters and the tree carries three counters under those names instead, with `refusals.carriers` being what the mob pool turned away; report against what the tree has. **A non-zero counter is a fault and a finding, never a cap to raise.**
- **No rendered check is owed and you take one anyway is not the rule here.** Nothing a player sees changes in this slice. The plan owes a rendered check to every slice that changes what a player sees and this is not one of them, so a screenshot is optional and a played run is not: play one run to the end and start another, because a build whose pools are sized by a new derivation is a build where a boot-time failure would be invisible to the suite.

**(m) CodeRabbit CLI, one iteration.** `git add` every changed and new file **by path**, never `git add -A` and never `git add .`, because the review does not see untracked files. Then, from the worktree root, `coderabbit review --agent --uncommitted`. Apply the real findings. Decline the rest with a reason recorded in the progress note. **One iteration**, then move on.

**(n) One code commit, conventional, single line, ending in `(#39)`.** Something in the shape of `refactor(hungry-grave): the caps are derived from the stage's own data and the director's table lands beside it (#39)`. Pass the message with `-m`. **Never a heredoc.** No body and no trailer of any kind: every commit on this branch is one line, and a `Co-Authored-By` line is a trailer. Never commit unverified code.

**(o) The progress note.** Append a new section to `apps/hungry-grave/docs/push/step-4-progress.md`, numbered **16** and titled "Slice D: the caps become derivations (#39)", and add your row to section 1's table. Say what each cap derives to and from what, what slice B had already landed and what you found when you checked it, the card table's rows and what you set them against, the three purse figures with their arithmetic against slice B's rates, how you resolved the `MOB_FIRE_CAP` import problem and what you tried, any magnitude you duplicated into `waves.ts` and the test that guards it, the quiet-interval minimum you authored ahead of slice F, the frame-budget reading with the fields the build now stands, the file count and the test-name diff's two numbers, `state.refusals` off your hand tape, the CodeRabbit findings applied and declined, anything in the plan or either record you found false against the tree, and anything you left for a later slice with the slice named. Commit it as `docs(hungry-grave): step 4 progress note records slice D (#39)`.

**(p) Stop and report.** Under 300 words: the commit hashes, the derived figures for `MOB_CAP`, `MOB_FIRE_CAP` and `CORPSE_CAP`, the test counts before and after, the test-name diff's removed and added figures, the frame-budget fields now stood and still refused, the three refusal counters, the `MOB_FIRE_CAP` resolution in one sentence, the CodeRabbit outcome, and anything you could not do. Do not start the next slice.

### What must not move, and a move is a stop

- **The fences.** `boundary.test.ts`, `lineAgnosticPolicies.test.ts`, `executionFence.test.ts`, `harnessStatesNoTarget.test.ts` and `comparisonDeclared.test.ts`, five files, all green, each named by test title in the note, plus the sixth you add.
- **The invariants.** Every check in `invariants.ts` keeps its meaning and its severity, and the three fault identity wire numbers 11, 12 and 19 are held. `entity caps`, `corpse cap never binds` and `carrier spawn never refused` are the three this slice is closest to, and tripping one is a finding rather than a cap to raise.
- **Replay determinism.** One seed played twice under `shaky-short` gives the same tick count, the same witness at every checkpoint and identical stream cursors. A tape recorded at your tip decodes, replays and verifies.
- **`FORMAT_VERSION` 3** (`wireCodes.ts`), **`WITNESS_VERSION` 6** (`witness.ts`) and **`READINGS_VERSION` 4** (`readingsVersion.ts`). None of the three moves in this slice and a move in any of them is a stop and report. `FORMAT_VERSION` is slice G's single move and `WITNESS_VERSION` is slice E's, and **you add no folded field**, which is the orchestrator's ruling above.
- **`GOLDEN`, every value.** The plan permits five re-pins and names the five slices that may take them, A, B, C, E and F. **D is not one of them.** No cap is folded, so nothing this slice does should reach inside the scenario's 600 ticks. **A `GOLDEN` move in this slice is a stop and report**, not a re-pin with a paragraph, because a cap derivation that changes the digest means something changed what happens on the field.
- **`STREAM_SALTS` in `rng.ts`**, every entry. Slice B0 found that a stream's salt seeds its sequence, so moving one silently re-seeds a run and breaks every tape recorded before it.
- **`SKULL_CAP` 120 and `WISP_CAP` 64.** They are the two line caps and they are not derivations: they set how a line plays, which is a gameplay rule and lives with the rows it is measured against. Slice C stated them rather than changing them and so do you.
- **`TREASURE_ALLOWANCE`**, and the shape of `CORPSE_CAP` as a sum of named terms.
- **The mob table.** No `MOB_TYPES` row moves, no health, no speed, no fire row, and slice B's guard test that a body carries exactly its `MOB_TYPES` row stays green under you.
- **`src/game/stage/stage.ts`**, `src/game/lines/`, `src/game/offer.ts` and `src/game/tuning.ts`. The stage was slice B's, the lines and the economy were slice C's, and the bank expiry is withdrawn from round one so no slice opens `offer.ts`. **`waves.ts` still value-imports nothing and that must still be true at the end**: its imports stay `import type`, which is what lets `caps.ts` derive from it while importing only it.
- **The harness's own rows.** `enoughClearance`, `belchWorthIt`, every lapse rate and every look-ahead list belong to the hand, and the hand's rows are never tuned with the game's. A hand row moved between two batches would compare two builds through two instruments.
- **No test is deleted, skipped, weakened or rewritten to reach green.** A measured baseline that moves because a cap moved is re-measured with its comment saying what moved and why; a test you believe is wrong is a stop and report, because replanning is not your call.
- **No ADR gains a combat magnitude, and you file no ADR and amend none.** The body costs, the card rows, the purses and the quiet-interval minimum are data rows in `waves.ts`, each cited to the design record's section 5 item 6 and section 9.
- **`CONTEXT.md` gains nothing and loses nothing.** Card and Purse landed at `9cba278131`.

### Seams under test

`src/game/caps.ts`: `peakLive` gaining the largest-card term, `MOB_CAP` read through it, `MOB_FIRE_CAP` as a derivation over the revenant peak and the boss patterns, `CORPSE_CAP` gaining the director's addend and keeping its identity, and the module's import list, which is now itself a fence. `src/game/stage/waves.ts`: `DirectorCard`, `CARDS`, `BODY_COST`, `cardCost`, `PROCESSION_PURSE`, `CROWD_PURSE`, `VIGIL_PURSE`, and any magnitude you duplicate there for the fire derivation, all sitting beside the section tables in one public interface block at the module's end. `src/game/invariants.ts` through its three cap checks, read by spec tests 28 and 29 and written by nobody here unless item (j) says otherwise. `src/app/screens/FrameBudgetScreen.ts` through the refusal message it prints from the caps.

### Module boundaries

No module is created, deleted, merged or split, and no import direction changes. **`caps.ts` imports `waves.ts` and never `stage.ts`**, by neither a value nor a type import, and item (i) is that rule made mechanical. **`waves.ts` value-imports nothing**, which is what makes it the home for every table a derivation reads, and it is why the card table and the purses live there rather than in a director module that does not exist yet. **`caps.ts` cannot read `mobs.ts`**, because `mobs.ts` imports `caps.ts`; slice B's transit bound is written that way for exactly this reason and item (e) is where it bites you. `src/game` still imports nothing from `src/dev`, and `boundary.test.ts` proves it. **No module this step adds names a weapon line**, and `lineAgnosticPolicies.test.ts` proves it. Nothing outside a module indexes another's waves.

### The planned test list

From the plan's section 6, item by item, each written red first.

16. *A card costs the sum of its bodies at the table's per-body cost.* Pins the game design gate's ruling that an add is a card and never a body.
17. *The Vigil's purse is zero and the Procession's and the Crowd's are not.* Pins the Vigil's scarcity as a purse rather than as a rule inside the director, and pins zero as a real figure rather than the absence a null would be.
24. *Every cap is above the worst case the stage's own data describes.* Pins ADR 0056's "a section's worst case is its floor plus its budget, which is a number in data".
25. *The mob cap's standing-wave term is the rate times an unkilled body's time on the field, and not the rate.* Pins the tech architecture gate's finding that a peak taken from arrivals alone binds the first time nobody kills anything. **Slice B landed the transit bound this test reads**, so check what it actually wrote before you write the assertion, and hold the property rather than B's spelling of it.
26. *The mob cap's director term is the largest single card and never a section's purse.* Pins the same gate's finding that a purse-sized addend sizes the pool for a moment the quiet interval forbids.
27. *The mob-fire cap is above the revenant peak plus the worst boss pattern in the air at once.* Pins that boss fire and trash fire share one pool (`mobFire.ts:107`).
28. *A bound cap raises a fault and removes nothing from the field.* Pins ADR 0056 and the code's own rule, and it is the guard that makes the mow's density safe rather than lucky.
29. *No corpse is ever taken off the field to make room for another.* Pins #85's acceptance line and ADR 0056, held as its own promise.
- **Module tests**, from the plan's 58 to 72 group: `cardCost` over a card of one body and over the largest card in the table, and `peakLive` over a stage with no standing waves.
- **The drift guard** on any magnitude item (e) duplicates into `waves.ts`, which fails when the duplicate and its source disagree.
- **The corpse-cap identity tests** at `caps.test.ts` around `:148` and `:163` and `waves.test.ts` around `:303-305`, which keep the derivation honest through the new addend.
- **The new fence**, item (i): *`game/caps.ts` imports nothing from `game/stage/stage.ts`*, failing a type-only import on purpose.
- **The five existing fences**, green, each named by title.

**What this slice is expected to turn red, so the diff is read against something.** Every test that reads a cap as a figure: `caps.test.ts`, `mobs.test.ts` and `mobFire.test.ts` where a pool is filled to its cap, `invariants.test.ts`, and `bot.test.ts`'s density figures if a derived cap moves what the field holds. The corpse-cap identity tests. `FieldRenderer.test.ts` if it counts sprites. `frameBudget` and `syntheticField` tests if either asserts against a shipped cap, and `scripts/frameBudgetCaps.ts`'s own test, which reads `MOB_CAP` as a starting value. **A realistic count is 8 to 15 files**, and this is the plan's least well bounded slice because its own table names three files. A diff much smaller than that is a reason to look for the tests that should have moved and did not. Slice A's table said five files and the diff said 19; slice B0 touched 143.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck` green from `apps/hungry-grave/`. It is the only judge of diagnostics; editor diagnostics name scratch files and stale states.
2. **Agent.** `pnpm vitest run` green from `apps/hungry-grave/`, then `pnpm build`, then `pnpm verify` green at the repo root.
3. **Agent.** The test-name diff. `pnpm vitest list --json > <current>` into the scratchpad, then `pnpm vite-node --config vite.headless.config.ts scripts/test-names.ts apps/hungry-grave/local/step4/tests-baseline.txt <current>`. **The baseline is at `apps/hungry-grave/local/step4/tests-baseline.txt`, beside its `.json` sibling, 1834 names**, and not at the worktree root where the handoff's wording reads. Do not recreate either file. The step 0 baseline predates slices A0, A, B0, B and C, so it cannot isolate your slice; if you want a diff that can, capture the tip before your commit the way slice B0 did (progress note section 13) and report both.
4. **Agent.** Replay determinism: one seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
5. **Agent.** The frame-budget instrument, both spellings, with the fields now stood and still refused reported against round 0's table. Item (l).
6. **Agent.** A hand-recorded tape at this tip through `vite preview`, driven with `playwright-cli`, run through `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts <tape>` asserting `outcome: 'verified'`, with `state.refusals` printed into the note. Item (l).
7. **Agent.** `GOLDEN` unmoved, stated in the note. Item: a move is a stop.
8. **Agent.** The five fences green plus the new one, each named by test title in the note.
9. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
10. **Human (Mark), and none of these blocks you.** The phone half of round 0, which is the instrument at `#/frame-budget` on a deployed build and which prints more of its six fields once this slice lands; whether the Wall is still meant to cost something (plan verification step 22); whether Territory's bottom rung still reads as his #79 ruling meant it (plan verification step 23, and no slice owns Territory's rungs). The push runs in one-push mode: you continue past every one of them and he reads them on the branch.

### State of the branch

- Branch `hungry-grave-v1`, worktree `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/hungry-grave-v1`. Run `git log --oneline -25` and `git status --short` first and check the tree is clean before your first edit. **The tip should be slice C's docs commit and the last code commit should be slice C's.** Below it are slice B's, then `2ec6ee5efc` slice B0's rename, then `d4dedf6d9a` slice A.
- At `d4dedf6d9a`, `pnpm verify` was green, exit 0: 141 test files, 1860 passed, 19 expected fail, 2 todo, five fences green at 71 tests. Slice B0 took it to 1861 on the same shape. Read progress note sections 14 and 15 for where slices B and C left it.
- **`GOLDEN` has re-pinned up to three times by now, slice A's and possibly slice B's and slice C's, and it does not re-pin in yours.** `WITNESS_VERSION` 6, `FORMAT_VERSION` 3, `READINGS_VERSION` 4.
- Slice A is deployed at https://hungry-grave.vercel.app. **You do not deploy.**
- `local/` reaches none of the standing checks: outside version control, outside eslint, outside prettier, outside `tsconfig.json`'s `include`. The one thing that does reach it is vitest, which has no config of its own, so a `*.test.ts` left under `local/` runs in the suite. **Nothing under `local/` ever enters a commit.** Scratch work goes in the scratchpad directory your system prompt names, never under the repo, and the scratchpad is shared between agents, so give your files distinctive names.
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

Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first. A claim in the plan or in either record that is false against the tree is recorded in the progress note and the source's intent is followed rather than its stale letter; if the intent is unclear, that is a stop. **A gate finding or a measurement that argues against something Mark ruled is filed for his read and built past, never applied.**

**Three things in this slice are already known to be a stop, a gap or a finding, so you do not have to discover them:** a literal `MOB_CAP`, item (a), which is the slice's one planned stop; the card table's own rows, item (c), which no source states and which you author and declare; and the `MOB_FIRE_CAP` import problem, item (e), which is real, is in the tree, and has a stop rule written for it.

### What is not your job

- **Slice B's work.** The standing waves, the re-authored section tables, the carriers, `repeatingArrivals`, `peakArrivals`'s rate term, `wavesUnderThePour`, the Wall's wave, the guard test that a body carries exactly its `MOB_TYPES` row, and **`peakLive` and `MOB_CAP` as derivations**, which it pulled forward. If any of it is undone, that is a finding for the note and, for `MOB_CAP`, a stop.
- **Slice C's work.** `CORPSES_TO_CEILING`, the reservoir, the cadence floors and the per-rung damage lane. If slice C left the wisp interval's clock to slice E as ruled, that is expected and not a gap.
- **Slice E's work.** The widened fold, `WITNESS_VERSION` 6 to 7, `StreamName` and #108's two names, `director.ts`'s first appearance carrying `DirectorState` alone, the `Mob` provenance mark, and the wisp volley clock folded in with them. **You declare no folded field and you create no `director.ts`.**
- **Slice F's work.** The director's signal, the spend, the quiet interval's draw, `Section.purse` as a column on `Section`, the `directedAdd` event, the purse invariant, and the cards actually being bought. **You author the table and the figures; nothing spends them.**
- **Slice G's work.** The readings, `readings/pressure.ts`, `timeToKill.ts`'s per-minute split, the signal lock, `FORMAT_VERSION` 3 to 4 and the `bot.ts` comment.
- **Territory's rungs**, which no slice in the plan owns and which are Mark's.
- **The phone half of round 0**, which is Mark's with the deployed instrument.
- **Prose in `docs/design` and `docs/adr` still carrying the old six words**, including ADR 0047's and ADR 0056's own bodies. A follow-up docs pass owns it.
- **Mark's follow-along doc**, https://md.niftymonkey.dev/api/raw/CTtB5BJJ. The orchestrator's.
- **Deploying, pushing, merging, opening a PR, or closing a ticket.** Each needs its own explicit yes and none of them is yours.

---

## Slice E: the witness fold, widened once

Model: Opus, subagent type general-purpose. One coder, one code commit, one docs commit. Commit messages end in `(#39)`, which is the ticket every step 4 docs and code commit cites.

Step 4 slice E of The Hungry Grave (ticket #39): the fold widens exactly once, `WITNESS_VERSION` moves 6 to 7 in the commit that declares every new folded field, and the three things that need a folded home land with it: the director's own state, the three new named streams, and the wisp volley clock the cadence floor has been waiting for.

**This prompt is written in the new vocabulary, which slice B0 landed.** A wave is what used to be a row, a formation what used to be a template, a section what used to be a phase, a phase what used to be a boss chunk, a power-up what used to be a drop, the HUD what used to be the strip. The files are `src/game/stage/waves.ts`, `src/game/stage/formations.ts` and `src/game/bosses/phases.ts`. **The step 4 plan, both design records and ADRs 0047 and 0056 still speak the old words**, because prose beyond the eight renamed ADR titles was deliberately left (progress note section 13): translate, and never take a word difference for a different thing. Where the plan's section 4 says `rows.ts`, `StageRow`, `Phase.purse` or `rowTicks`, it means `waves.ts`, `StageWave`, `Section.purse` and `waveTicks`.

**Line numbers in this prompt were read at slice C's tip and slice D moves some of them.** Find the name, never the line.

**Slices B, C and D land before you and all three touch files you read.** Slice B owned `src/game/stage/` and derived `MOB_CAP`; slice C owned `tuning.ts` and the four line modules and authored the wisp volley interval as data; slice D owns `caps.ts`, `waves.ts` and `invariants.ts` and is **still in flight as this prompt is written**. **Read progress note sections 14, 15 and 16 for what each actually did** rather than trusting any list, and section 2 for the `GOLDEN` moves. **Treat `caps.ts`, `waves.ts` and `invariants.ts` as files another agent has just rewritten**: run `git log --oneline -25` first, read them fresh, and find every name by grep rather than by the line numbers below.

**Three rulings shape this slice and none of them is yours to revisit.**

**First: the wisp volley clock and its 30-tick interval floor land here, in this fold commit** (the handoff's session 22 decision 3, and the slice C prompt's item (d)). A minimum interval between volleys needs a clock, the wisps have none, and every field of `LineState` is folded (`witness.ts`'s `foldLines`), so a volley clock is a folded field and a folded field moves `WITNESS_VERSION`, which this step moves exactly once. Slice C authored the magnitude as data and left two `it.fails` tripwires naming you as the trigger that flips them. Three resolutions were weighed and this is the one that landed: moving the version twice buys nothing, because a tape recorded between C and E is refused after E either way, and deriving the clock off the wisps' own folded `life` fails the moment a whole volley hits early and no wisp survives to carry the time.

**Second: `WITNESS_VERSION` moves once, 6 to 7, in this commit, and every new folded field is declared in the same commit** (the plan's verification step 7, and `apps/hungry-grave/docs/lessons.md` under The sim, which records the real defect a version stamped before the fold stopped moving cost this project). That is the whole reason slice E exists as its own commit. **So no folded field may be added in any other commit and none may be left for slice F**: if you find yourself wanting one more, it lands here or it does not land at all.

**Third: the plan says this commit contains nothing but the fold, and two rulings have already widened it.** The wisp clock is a rule change to how the wisps fire, and #108's two stream names change which stream two existing draw sites read. Both are ruled in. **Nothing else joins them.** The signal, the spend, the quiet interval and `Section.purse` are slice F's, and a `director.ts` that does anything is a stop.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. The six dispatch contract items are the sections below.
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md` at the repo root, plus `docs/agents/code-examples.md` for any rule that leaves the path unclear, and `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`. **The sim section of the app's own lessons file is this slice's subject matter**, not background.
3. `apps/hungry-grave/docs/design/step-4-mow-ladder-director-dispatch.md`, 130 KB, with the Read tool in ranges and never with `cat`. **Its step 11 in section 10 is this slice and it is the contract.** Section 4's `director.ts` block carries `PressureSignal` and `DirectorState` and the paragraph naming the director's stream as the sixth on `StreamName`; section 4's `wisps.ts` and `skullStream.ts` block is the cadence floor's seam text and the reason the floor is an interval and never a queue; section 5's module table gives you `rng.ts`, `witness.ts`, `run.ts`, `director.ts` and the `mobs.ts` provenance row, and its `#108` row; section 6 is the planned test list (spec tests 30 to 32, the module tests, and fence 74); section 7's `StreamName` and `WITNESS_VERSION` entries list every reader; section 3's verification steps 7, 8, 9a and 14 are yours.
4. `apps/hungry-grave/docs/design/mow-ladder-director.md`, the design record. Section 5 item 6's last four paragraphs are what this slice implements of the director: its dice come from its own named stream and the witness version moves once. Section 9's magnitude table carries the wisp interval and the director's own rows. Section 11 item 4 is the surfaced commitment this slice takes, `WITNESS_VERSION` 6 to 7, filed as Mark's to overrule on the branch.
5. `apps/hungry-grave/docs/adr/0019-the-witness-and-the-refusal-rule.md`, which rules the closed field list and the refusal, and `0012-fresh-seed-per-run.md`, `0015-determinism-across-devices.md` and `0020-replay-ships-and-is-not-a-challenge.md` beside it. **`0047-directed-density-inside-authored-beats.md`** is the ruling behind the director's own stream: "its own dice come from its own named seeded streams and never from the spawns stream, so authored placements downstream of a directed fill stay put and a tape alone still rebuilds the run exactly." **`0056-the-director-spends-a-finite-budget-per-section.md`** is what `DirectorState`'s three fields are shaped by, and its amendment is why the purse is pinned to the build and never in the header. **`0058-each-on-swallow-line-pays-in-its-own-currency-at-its-own-cadence.md` as amended** rules the wisp cadence floor you build. Both still carry the old words.
6. `apps/hungry-grave/docs/push/handoff.md`, the STEP 4 BRIEF, the Standing rules, and **"Decisions the session made under the pre-authorizations, session 22", whose item 3 is the wisp clock ruling above and whose item 4 is that no commit on this branch carries a trailer.**
7. `apps/hungry-grave/docs/push/step-4-progress.md`: section 1 for the state of the step, section 2 for the `GOLDEN` moves, section 6 for the test baseline's real path, section 13 for slice B0 and its `STREAM_SALTS` finding, section 14 for slice B, **section 15 for slice C and in particular its bound-`WISP_CAP` finding, which is the evidence your clock exists to answer**, and section 16 for slice D if it exists by the time you read.
8. `apps/hungry-grave/CONTEXT.md`, the entries Pressure, Card, Purse, Directed density, Standing wave, Wisps, Surge, Fault identity, Cone and Bell. **You add nothing to it and you change nothing in it**: the plan's module table says "nothing is owed to a code slice", and your names have to agree with the entries that are already there. **Read the Avoid lists before naming a stream.**
9. The tree itself, before you write anything: `src/game/rng.ts` whole (147 lines), `src/game/witness.ts` whole (388 lines), `src/game/__tests__/witness.test.ts`'s `FOLDED` and `EXCLUDED` blocks (around `:684` and `:774`), `src/game/run.ts`'s `LineState` and `RunState` (around `:41` and `:77`) and `createRun`'s streams block (around `:268`), `src/game/mobs.ts`'s `Mob` and `spawnMob` (around `:171` and `:268`), and `src/game/lines/wisps.ts`'s `launchWisps` and `WISP_VOLLEY_INTERVAL_TICKS` (around `:239` and `:116`).

### The definition, in observable terms

After this slice: `WITNESS_VERSION` is 7, it moved in exactly one commit, and every field that commit added to the fold is named in that same commit's version note with the reason it is folded. A tape recorded before this commit is refused by its version rather than diverging at a checkpoint, which is ADR 0019's refusal rule doing its job and is expected rather than a defect.

`StreamName` carries eight names where it carried five. `STREAM_SALTS` carries eight salts, the five that were there untouched and the power-up stream's still the string `drops`, and `STREAM_ORDER` folds the three new cursors after the five that were already there, because a widening appends and never reshuffles. The Banshee's ring jitter no longer draws from the same stream as a trash mob's first shot, and the Waking's pour no longer draws from the same stream as a spawn, which is #108's whole acceptance: retuning either one moves no other system's draws on a fixed seed.

`src/game/director.ts` exists and holds `DirectorState`, its initial value and nothing else. `RunState.director` is a real typed field and the witness folds it. Nothing calls into the module, nothing spends anything, and there is no signal, no purse, no quiet interval and no spend.

A `Mob` says where it came from, written once at the spawn, and `spawnMob`'s three callers pass it. `witness.test.ts`'s partition decides about the new field explicitly rather than by silence.

**Two swallows inside thirty ticks fire one volley, and the second is not banked for later.** The two `it.fails` tripwires slice C left in `wisps.test.ts` are ordinary green assertions, flipped in the same commit as the clock they were waiting for. **And the finding progress note section 15 owes this slice is answered on its own instrument**: with the grave held at the ceiling on seed 77 through 20000 ticks, the wisp pool no longer stands at 64 of 64 at either rung.

`pnpm verify` is green, the test-name diff is read against the baseline, `GOLDEN` carries a dated paragraph naming the new stream cursors, the folded director state, the mob's new field and the wisp clock, and `state.refusals` off this slice's own hand tape is printed in the report.

What a player meets: a swallow burst no longer launches a wall of homing souls it could not pay for, so the auto-targeting line stops doing the mowing the player is supposed to do. Everything else in this slice is invisible.

### The work, in this order

**(a) Read the tree before you trust the plan, and three things in it have moved under the plan's feet.** `caps.ts`, `waves.ts` and `invariants.ts` were slice D's and may have landed minutes before you; `WISP_CAP` and `SKULL_CAP` are at `caps.ts:179-180` at slice C's tip and slice D moves that file. `WISP_VOLLEY_INTERVAL_TICKS` is already 30 in `wisps.ts` and exported, authored by slice C with a JSDoc naming you. Confirm all of it by name.

**(b) The tests first, red, from the plan's section 6.** Spec tests 30, 31 and 32 extend `src/game/__tests__/witness.test.ts` and `rng.test.ts`, each written as a `test.todo` placeholder first and then turned red against a stub. The module tests are in the planned test list below. **The two `it.fails` tripwires in `wisps.test.ts` (around `:386` and `:398`) are your red-first for the clock**: they are already written and already failing by design, so the honest order is to confirm they fail, build the clock, and flip them to `it` in the same commit. Say in the note that the red half of those two was slice C's work rather than claiming it as your own.

**(c) `StreamName` gains three names, and a salt is not a name.** The plan's section 7 says five members become six, or eight with #108 riding, and #108 rides (the plan's module table, the `#108` row).

- **`director`**, ruled by ADR 0047 and named by the plan's section 4 in as many words.
- **Two for #108's draw sites**, which are `bosses/banshee.ts:143`'s ring nudge, drawing from `mobFire` today, and `stage/setPiece.ts:177`'s pour jitter, drawing from `spawns` today. **Author `bossFire` and `pour` unless `CONTEXT.md`'s own Avoid lists forbid them**, and check before you write: the Bell entry bans "ring" and the Cone entry bans "ring" and "wave", which is why the boss's stream is not called `ring` even though the code calls the attack one. If an Avoid list forbids one of the two, pick the glossary's own word for the thing and say in the note which entry sent you there.
- **`STREAM_SALTS` gains one entry per new name and no existing entry moves.** Slice B0's finding is that `stream(seed, name)` folds the string into the run seed (`rng.ts`'s `const offset = xmur3(name)()`), so a salt is a durable identity in the sense a wire code is: move one and the same seed draws a different sequence and every tape recorded before the move stops reproducing its own run. The three new streams have no tapes behind them, so each new salt is its own name at birth, and `rng.test.ts`'s overlap search derives its list from `Object.values(STREAM_SALTS)` and picks them up for free. **The power-up stream's salt stays the string `drops` and the test that pins it stays green.**
- **`STREAM_ORDER` appends**, three names after the five, in the order `STREAM_SALTS` declares them, and the list's own JSDoc already rules it: a new name goes last so every cursor keeps the place it already folded in.
- **`createRun`'s streams block gains three lines** through `STREAM_SALTS`, exactly as the five already read.
- **`invariants.ts` has a `checkFinite` line per stream cursor** (around `:206-210` at slice C's tip). Three more go beside them, or the invariant's coverage silently shrinks the day the streams land. Find them by name, because slice D has that file.

**(d) Moving two draw sites is a behaviour change and it is not silent.** Taking the Banshee's nudge off `mobFire` and the pour's jitter off `spawns` changes both of those cursors for every run that reaches either moment, so a pre-E tape replays differently. **That is legitimate here and nowhere else, because the version move in this same commit refuses every one of those tapes before a checkpoint is ever compared.** Say so plainly in the version note and in the progress note. Both sites keep their own comments: `setPiece.ts`'s paragraph says the pour's draw "comes from the spawns stream, because a pour is a spawn (ADR 0006)", and that sentence is false the moment you move it, so rewrite it to say the pour has its own stream and why (#108), in the same commit that makes it stale. `banshee.ts`'s "All of a tick's sources share one drawn nudge" paragraph is still true and stays.

**(e) `director.ts`, its first appearance, carrying `DirectorState` and its initial value and nothing else.** The seam text is the plan's section 4.

- **`DirectorState` is `signal`, `purseLeft` and `quietUntilTick`**, the three fields the plan's section 4 declares. `purseLeft` and `quietUntilTick` have no caller today and their citation is the plan's step 12, slice F, which is what the cited-future rule requires: name it in each field's own JSDoc.
- **`PressureSignal` is `value` and `heldUntilTick` in this slice, and not `lock`.** The plan's section 4 writes a third field, `lock: SignalLock`, and **`signalLock.ts` is slice G's module** (the plan's module table), so a `lock` typed here would either import a module that does not exist or be a placeholder type, and the plan's own words for this slice are that the fold reads "a real type rather than a placeholder". **The resolution, and it is the orchestrator's:** E declares the two fields it can declare honestly, and slice G adds `lock` when `signalLock.ts` lands. **It does not owe a second version move**, because a lock is a figure the run resolves before its first tick and never moves, which is the run's identity in exactly the sense `seed` and `roster[]` are, and both of those are excluded from the fold with that reason beside them (`witness.test.ts`'s `EXCLUDED`). **Write that reasoning into `PressureSignal`'s own JSDoc naming slice G**, and record it in the progress note as a plan claim resolved rather than followed to the letter.
- **The initial value.** `signal.value` 0, `signal.heldUntilTick` 0, `quietUntilTick` 0 and `purseLeft` 0, each with its JSDoc saying what fills it and when: the purse is granted per section and `Section.purse` is slice F's, so zero here is "nothing granted yet" and never "a section with no purse". The Vigil's purse of zero is a different zero and it is slice D's data row; do not conflate them.
- **The module exports its type and its initial value and nothing else**, in one export block at the module's end.
- **No function, no constant of the director's own, no call site.** `advancePressure`, `directorSpend`, `DIRECTOR_STREAM`, `SIGNAL_HOLD_TICKS`, `SIGNAL_DECAY_TICKS`, `QUIET_MIN_TICKS` and `QUIET_MAX_TICKS` are all in the plan's section 4 block and all of them are slice F's. **Writing any of them is leaving this slice.**
- **`RunState.director` is a field on `RunState`, initialized in `createRun`**, and the witness folds its three numbers in a `foldDirector` in the same shape `foldLines` uses, appended at the end of the fold's order, because the order is part of the value.

**(f) The `Mob` provenance mark, and it is folded rather than excluded.** The plan's section 4 and its module table: a `Mob` gains a mark saying which wave put it on the field, so spec test 43 (slice F's) can tell a standing body from a shaped one, and it lands here because `spawnMob`'s signature leaves no slot for it and adding it here moves the three callers once rather than twice (`stage/stage.ts:292`, `stage/setPiece.ts:184`, `bosses/undertaker.ts:255`).

- **The shape: a small union naming where the body came from, not a wave index.** A wave index is section-local and goes stale the moment a body outlives its section, and two of the three callers are not waves at all. The union has to distinguish a standing wave's body from a shaped wave's body, because that is what spec test 43 asks of it, and it needs an honest value for the set piece's pour and the Undertaker's dug-up bodies. **Author the smallest union that answers all four callers**, name the members in the glossary's words (a standing wave, a wave, a set piece, a boss, and the director as the cited-future member slice F writes), and say in the note what you authored and what you set it against. **If the tree shows a cheaper honest shape, take it and say why.**
- **It folds, and `carries` is its precedent rather than `type`.** `mobs[].type` and `mobs[].appearedInside` are excluded because a divergence in either shows through the health, motion and beat the walk already folds. Provenance shows through nothing: two bodies, one authored and one directed, are identical in every other folded field, which is exactly why `carries` is folded. So the mark joins `FOLDED`, and it folds through a code map in the shape `FOOD_KIND_CODES` and `BOSS_KIND_CODES` use. **No member of that map may take `ABSENT_CODE`**, which `witness.ts`'s own paragraph rules.
- **`blankMob()` takes a default and `spawnMob` takes the parameter**, written once at the spawn and never mutated afterwards, exactly as `carries` is.

**(g) The wisp volley clock, the fix the cadence floor has been owed since slice C.** The seam text is the plan's section 4's `wisps.ts` block and ADR 0058 as amended.

- **A clock field on `LineState`, in the tree's own idiom: ticks until the wisps may fire again.** `streamIn`, `tollIn` and `layIn` are all "ticks to the next X" and each line decrements its own inside its own `advanceX`, which `advanceLines` calls every tick unconditionally (`step.ts`'s `advanceLines`, `bell.ts:340-342`, `territory.ts:492-493`). Yours decrements in `advanceWisps` and never anywhere else, so it keeps ticking when the pool is empty.
- **It starts at 0 in `startingLines()` and not at the interval.** The other three clocks start at their own period because they are always-on timers; the wisps fire on a swallow, so a run's first swallow must fire immediately. The two tripwires are the test of exactly that: the first `launchWisps` fires and the second does not.
- **`launchWisps` returns without launching while the clock is above zero, and sets it to `WISP_VOLLEY_INTERVAL_TICKS` when it fires.** **Nothing is banked**: a swallow inside the interval pays nothing later rather than owing a volley, because a banked volley would pay a stale corpse's freshness on a fresh corpse's tick (ADR 0058 as amended, and the second tripwire is that promise).
- **It folds, appended at the end of `foldLines`**, which is what that function's own comment already rules: "layIn appends after the ring rather than sitting beside the other clocks, because a widening appends and never reshuffles what is already in place." And it gains a `checkFinite` line in `invariants.ts` beside the four `lines.*` ones already there (around `:136-141` at slice C's tip; find it by name, slice D has that file).
- **`WISP_VOLLEY_INTERVAL_TICKS` is 30 and you do not move it.** The design record's section 4 table and its section 9 say about thirty ticks, slice C authored exactly 30, and its JSDoc names you as the commit that reads it. **Rewrite that JSDoc's last paragraph in the same commit that makes it stale**, because a comment explaining that nothing reads a row is a comment about code that no longer exists.
- **`ADR 0058`'s freshness axis is untouched.** Freshness still scales the wisp count with a floor of one soul, and `WISPS_BY_LEVEL` is `[0, 1, 3, 5, 8, 11]` and does not move.

**(h) The measurement the clock owes, and it is this slice's own reading.** Progress note section 15 records the finding: with the grave held at the ceiling on seed 77 through 20000 ticks, the wisp pool peaks at exactly 64 against a cap of 64 at rung 1 and at rung 5, because a swallow burst fires a volley per corpse with no interval between them, and nothing raises a fault when it binds. **Re-run that same instrument at your own tip and report what it says.** Slice C built it as a scratchpad script that steps the sim with the grave held at the ceiling rather than as a committed tool, so rebuild it from that description in the scratchpad rather than hunting for it; nothing under `local/` or the scratchpad enters a commit.

**The arithmetic that says what to expect, and it is a prediction rather than a target.** A rung-5 volley is 11 souls (`WISPS_BY_LEVEL`) at a 90-tick life (`WISP_LIFETIME`), so a 30-tick floor puts at most three volleys in flight at once, 33 souls against a cap of 64, before any of them hits anything. `caps.ts`'s own `WISP_CAP` paragraph derives 64 against "eleven wisps per swallow at a 90-tick life, with a swallow as often as every 20 ticks", which holds 50, so the floor is stricter than the cap's own assumption and the cap should come back to roughly half its headroom. **If the cap still binds after the clock lands, that is a stop and report**, not a number to raise and not a finding to build past: the clock was ruled as the fix and its failure is a decision above this slice.

**(i) The silent cap is real, and the ruling is that it does not become visible in this slice.** `launchWisps` takes a null slot from `takeSlot` and returns, so a truncated volley raises nothing and moves no counter, and the code rules say nothing abnormal is ever silent. **Three facts settle where the fix belongs and none of them is what the plan assumed.** First, `state.refusals` is **not** folded: all three counters sit in `witness.test.ts`'s `EXCLUDED` with the reason that they are the harness's input rather than the run's state, so a fourth counter there is not a folded field and does not belong to this commit's single declaration by the rule that put every other item here. Second, slice G's readings cannot see it either: a truncated volley leaves no trace on the tape at all, so a reading computed off one would have to re-derive the wisps' own rules to notice an absence, which is the exact construction the plan's own spec test 54 forbids for the pressure reading. Third, the honest instrument is a per-tick counter, because `checkRefusals`'s own JSDoc rules that "a refusal is a fact about a tick and not about the state it leaves behind", and a per-tick counter costs a `Refusals` field, a `clearRefusals` line, an `EXCLUDED` entry with a reason, a new fault identity with a wire number and a severity row, and a new invariant check, in a file slice D is holding and in the one commit the plan requires a reviewer to be able to check in full. **So: do not add it.** Fix the cause, measure that the cap stops binding, and **record the visibility gap in the progress note as a named finding for the orchestrator**, with its trigger stated: the next time either line cap is measured binding. You file no ticket; the orchestrator decides whether it becomes one.

**(j) `GOLDEN` re-pins here, and it is the third of the five the plan permits.** Progress note section 2 says two have been used, slice A's and slice C's, and slice B used none, so three remain for E, F and one spare. **A re-pin here is planned and expected and never a stop and report**, and it lands with a dated paragraph in `digest.ts`'s JSDoc naming what moved, what held and why, in the shape the paragraphs already there use. What is expected to move: the `checksum`, because the fold gains three stream cursors, the director's three numbers, the mob mark and the wisp clock; and `drawn`, which is keyed by `StreamName` and so gains three keys that typecheck will demand. What is expected to hold: `tick` 600, `seed`, the grave's position and size, `score`, `reservoir`, `mobs` 5, `shots` 0, `corpses` 1, `skulls` 2, `wisps` 0, `kills` 2, the levels record, and `drawn.spawns` 1 with the other four unchanged, because the scenario reaches neither the Banshee nor the Waking inside 600 ticks and nothing in it swallows. **If `drawn.spawns` moves, stop**: that means the pour's stream move reached a window it cannot reach, and the reason matters more than the number. A move with no paragraph is a stop even when the number is right.

**(k) `pnpm verify` green** at the repo root, after `pnpm typecheck` and `pnpm vitest run` green in `apps/hungry-grave/`, and `pnpm build`. A timeout with no assertion is contention and not a failure: run the suite alone once more before calling anything red (`docs/agents/lessons.md`). **Two slices in a row have now filed a follow-up commit for whole-run test budgets that reddened only under load**, each recorded in its own progress note section under "the anomaly that earned it" (sections 14 and 15), so run `pnpm verify` twice on the committed tree before you call it done.

**(l) The rest of the measurements this slice owes.**

- **A hand-recorded tape at your own tip**, recorded against the built app through `vite preview` and driven with `playwright-cli` and never the Playwright MCP, then `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts <tape>` asserting `outcome: 'verified'`. The plan's verification step 9a names this slice explicitly: a tape is owed **because** the witness version moves under it. **Print `state.refusals` off that tape in your report, all three counters** (`food`, `carriers`, `offers`). A non-zero counter is a fault and a finding, never a cap to raise.
- **A pre-E tape refused by its version.** Take a tape recorded before your commit, replay it at your tip, and show it refused by the version rather than diverging at a checkpoint. That is ADR 0019's refusal rule and it is the cost of the version move stated as an observation rather than as a claim. Say in the note that every tape recorded before this commit is now refused, which is expected.
- **Replay determinism at your own tip**: one seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
- **Two conditioned tapes for the wisp clock**, one at rung 1 and one at rung 5 on the same seed, `pnpm vite-node --config vite.headless.config.ts scripts/record-conditioned.ts <out> <seed> <ticks> skullStream=N territory=N wisps=N bell=N`, each measured to `outcome: 'verified'`, with what they say about the wisp pool's peak and the kill rate beside slice C's own figures (progress note section 15: seed 77, rung 1 seals at 2619 ticks with 28 kills, rung 5 at 6194 with 255).
- **The rendered check, which the plan does not owe this slice and the clock does.** The plan's step 11 says no rendered check is owed "because nothing a player sees changes", and that was written before the wisp clock was ruled into this commit: a swallow burst now launches fewer souls and that is a thing a player sees. **Take one.** Play a run, end it, and play again, because a rendered check that only ever plays run one is structurally blind, and read the screenshot yourself and say what you see. **Say in the note that the plan's claim is stale and why.**

**(m) CodeRabbit CLI, one iteration.** `git add` every changed and new file **by path**, never `git add -A` and never `git add .`, because the review does not see untracked files. Then, from the worktree root, `coderabbit review --agent --uncommitted`. Apply the real findings. Decline the rest with a reason recorded in the progress note. **One iteration**, then move on.

**(n) One code commit, conventional, single line, ending in `(#39)`.** Something in the shape of `feat(hungry-grave): the fold widens once and the wisps fire on a floored cadence (#39)`. Pass the message with `-m`. **Never a heredoc.** No body and no trailer of any kind: every commit on this branch is one line, and a `Co-Authored-By` line is a trailer. Never commit unverified code.

**(o) The progress note.** Append a new section to `apps/hungry-grave/docs/push/step-4-progress.md`, numbered **17** and titled "Slice E: the witness fold, widened once (#39)", and add your row to section 1's table and your entry to section 2's `GOLDEN` list. Say what the fold now carries and the reason each new field is folded, the three stream names and the two draw sites they moved, what `director.ts` holds and what it deliberately does not, the provenance mark's shape and what you set it against, the wisp clock's shape and where it decrements, **the wisp cap measured on progress note 15's own instrument before and after**, the two conditioned tapes, the `GOLDEN` outcome with its paragraph, the pre-E tape's refusal, `state.refusals` off your hand tape, what the rendered check showed, the file count and the test-name diff's two numbers, the CodeRabbit findings applied and declined, **the silent-cap finding from item (i) with its trigger**, the `PressureSignal.lock` resolution from item (e), anything in the plan or either record you found false against the tree, and anything you left for a later slice with the slice named. Commit it as `docs(hungry-grave): step 4 progress note records slice E (#39)`.

**(p) Stop and report.** Under 300 words: the commit hashes, `WITNESS_VERSION` at 7 and the count of new folded fields, the three stream names, the wisp pool's peak before and after against `WISP_CAP` 64, the test counts before and after, the test-name diff's removed and added figures, the `GOLDEN` outcome, the three refusal counters, the rendered check in one sentence, the CodeRabbit outcome, and anything you could not do. Do not start the next slice.

### What must not move, and a move is a stop

- **The fences.** `boundary.test.ts`, `lineAgnosticPolicies.test.ts`, `executionFence.test.ts`, `harnessStatesNoTarget.test.ts` and `comparisonDeclared.test.ts`, five files plus whatever sixth slice D added, all green, each named by test title in the note. **`lineAgnosticPolicies.test.ts` sweeps every production module under `game/` automatically** (its `productionModulesUnder(dir).filter(...)`), so `director.ts` joins it the day it exists and the plan's test 74 is already mechanical; confirm that rather than adding a list entry. **Its `POWER_UPS_DRAWER` rule, that exactly one module may move the power-ups cursor, is the shape #108's acceptance wants for your three new streams**: if it extends cheaply, take it and say so; if it does not, say so in the note and leave it to slice F's spec test 48.
- **The invariants.** Every check in `invariants.ts` keeps its meaning and its severity, and the three fault identity wire numbers 11, 12 and 19 are held. **You add no fault identity**, which is item (i)'s ruling. What you add is `checkFinite` coverage for the fields this slice creates, which is the existing checks reaching the new state rather than a new check.
- **`FORMAT_VERSION` 3** (`wireCodes.ts`) and **`READINGS_VERSION` 4** (`readingsVersion.ts`). Neither moves in this slice and a move in either is a stop and report. `FORMAT_VERSION` is slice G's single move. **`WITNESS_VERSION` 6 to 7 is this slice's single permitted move**, it happens exactly once, and every new folded field is declared in that same commit with the reason in the version note.
- **`STREAM_SALTS`'s existing five entries**, every one. Slice B0 found that a stream's salt seeds its sequence, so moving one silently re-seeds a run and breaks every tape recorded before it. The power-up stream's salt is still the string `drops` and a test pins it. **You append and never edit.**
- **`STREAM_ORDER`'s existing five entries and their order.** Append-only is that list's own rule and the fold's order is part of the value.
- **The fold's existing order.** A widening appends and never reshuffles what is already in place, which `foldWitness`'s own comment states in capitals. Every new fold goes last, inside its own sub-fold and in the whole.
- **`WISP_CAP` 64 and `SKULL_CAP` 120.** They are stated rather than changed. Raising a cap to fit an unfloored volley rate is the tuning-knob use of a cap that ADR 0056 forbids, and this slice exists to make the floor rather than to move the cap. `MOB_CAP`, `MOB_FIRE_CAP` and `CORPSE_CAP` were slice D's and you do not open `caps.ts` except to read.
- **`WISPS_BY_LEVEL`, `WISP_DAMAGE_BY_LEVEL`, `WISP_LIFETIME`, `WISP_FLOOR_SOULS` and `WISP_VOLLEY_INTERVAL_TICKS`.** Slice C authored the damage lane and the interval and none of them moves.
- **ADR 0058's freshness axis.** Freshness still scales the wisp count with a floor of one soul, and the surge's volleys and never its columns. `wisps.test.ts`'s freshness tests must stay green through the floor.
- **`src/game/stage/`, `src/game/caps.ts`, `src/game/tuning.ts`, `src/game/lines/` beyond `wisps.ts`, and `src/game/offer.ts`.** The stage was slice B's, the caps and the tables slice D's, the economy and the other three lines slice C's, and the bank expiry is withdrawn from round one so no slice opens `offer.ts`. **`waves.ts` still value-imports nothing and that must still be true at the end.**
- **`step.ts`'s tick order and its JSDoc.** The director's call site and the sentence naming where it runs are slice F's, and this slice adds no tick part. `advanceWisps` already runs inside `advanceLines` and your clock rides in it.
- **The harness's own rows.** `enoughClearance`, `belchWorthIt`, every lapse rate and every look-ahead list belong to the hand, and the hand's rows are never tuned with the game's. A hand row moved between two batches would compare two builds through two instruments.
- **No test is deleted, skipped, weakened or rewritten to reach green.** A measured baseline that moves because the wisps now fire on a floor is re-measured with its comment saying what moved and why; **flipping the two `it.fails` tripwires to `it` is the one exception and it is the planned one**, because that is what a tripwire is for and the trigger named in their own comments has fired. A test you believe is wrong is a stop and report, because replanning is not your call.
- **No ADR gains a combat magnitude, and you file no ADR and amend none**, ADR 0058 included. The interval is a data row in `wisps.ts` and it is already there.
- **`CONTEXT.md` gains nothing and loses nothing.** The plan's module table says nothing is owed to a code slice, and Pressure, Card, Purse and Directed density all landed at `9cba278131`.
- **Mark's rulings.** ADR 0044's flat Territory touch counts, ADR 0042's Wall, and Territory's rungs, which no slice owns.

### Seams under test

`src/game/rng.ts`: `StreamName` at eight members, `STREAM_SALTS` at eight entries with the five untouched, and `stream`'s own salt-folding behaviour unchanged. `src/game/witness.ts`: `STREAM_ORDER` appended, `WITNESS_VERSION` at 7 with its version note, `foldLines` gaining the wisp clock at its end, `foldMobs` gaining the provenance code, a `foldDirector` appended to `foldWitness`'s order, and the code map the mark folds through. `src/game/run.ts`: `LineState`'s new clock, `RunState.director`, `createRun`'s three new streams and the director's initial value, and `startingLines()`'s clock at zero. `src/game/director.ts`: `DirectorState`, `PressureSignal` and the initial value, and the module's public interface at its end. `src/game/mobs.ts`: `Mob`'s provenance field, `blankMob`'s default and `spawnMob`'s signature, read by its three callers at `stage/stage.ts`, `stage/setPiece.ts` and `bosses/undertaker.ts`. `src/game/lines/wisps.ts`: `launchWisps` refusing inside the interval and banking nothing, and `advanceWisps` decrementing the clock. `src/game/bosses/banshee.ts` and `src/game/stage/setPiece.ts`: each drawing from its own stream. `src/game/invariants.ts`: `checkFinite` reaching the new cursors and the new clock. `src/dev/digest.ts`: the golden pin and its dated paragraph.

### Module boundaries

**One module is created, `src/game/director.ts`, and nothing else is created, deleted, merged or split, and no import direction changes.** `director.ts` is imported by `run.ts` for its type and its initial value and by `witness.ts` for its type, and it imports nothing of the director's own that does not exist yet. **It names no weapon line and reads no `state.levels`**, which is ADR 0047's "reads pressure, never power" made mechanical and which `lineAgnosticPolicies.test.ts` sweeps automatically. `src/game` still imports nothing from `src/dev`, and `boundary.test.ts` proves it. **The wisp clock lives in `wisps.ts` beside the interval it floors**, never in a shared cadence module, because each line owns its own cadence (ADR 0005, ADR 0058). **The provenance mark lives on `Mob` and its code map lives in `witness.ts`** beside the other code maps, because the fold is what needs a number for it. **`caps.ts` still imports `waves.ts` and never `stage.ts`**, which is slice D's fence and which you must not trip by reaching for a cap from a new place. Nothing outside a module indexes another's waves.

### The planned test list

From the plan's section 6, item by item, each written red first.

30. *The overlap search covers every stream a run holds, the new names included.* Pins ADR 0012, over a list derived from `STREAM_SALTS` rather than hand-kept, which is how #113 was closed and which `rng.test.ts` already does. What is yours is that the eight are really there and really disjoint, and that the derived list did not quietly stop covering something.
31. *The run holds exactly its own streams and the witness folds exactly those.* Pins ADR 0019's closed field list at the version this step moves it to. `witness.test.ts`'s streams assertion already holds the five by name; it holds eight after you.
32. *The witness folds the director's state.* Pins ADR 0019: a replay that could not rebuild the director would be a replay of a different run.
- **The two tripwires, flipped.** *Two swallows inside the volley interval fire one volley* and *a volley skipped by the interval is not banked for later*, both in `wisps.test.ts`, both `it.fails` today and both ordinary assertions after you. **Rewrite each test's own comment to say the clock landed and drop the sentence naming slice E as the trigger**, because a comment explaining an absent thing is a comment about code that no longer exists.
- **The closed field list itself.** `witness.test.ts`'s partition already fails on any field at any depth that neither half decides about, so every field this slice adds forces an entry. **Every new `FOLDED` entry is proved by the perturbation test that already exists** (`FOLDED` and the perturbed list must be equal), and every new `EXCLUDED` entry carries its reason in prose beside it. Read that pair of tests before you write either list.
- **Module tests.** The wisp clock at a swallow on the boundary tick and one tick either side, at a run's first swallow (it fires), and over a burst of swallows on one tick (one volley). The clock decrementing while the pool is empty. `DirectorState`'s initial value, asserted field by field so a later field cannot arrive undeclared. The provenance mark written by each of `spawnMob`'s three callers, one test per caller. The mark's code map having no member equal to `ABSENT_CODE`, in the shape the other code maps are already guarded.
- **The version's own cost, stated as a test.** A tape carrying `witnessVersion` 6 is refused by its version rather than diverging at a checkpoint. The tree already holds tapes pinned at 1 and 2 for exactly this (`segments.test.ts:31`, `startingLevels.test.ts:17`, `codec.test.ts:32`, `storeRecording.test.ts:35`, `tapeStore.test.ts:38`); follow their shape and do not move them.
- **The golden digest** at `digest.test.ts`, per item (j).
- **The five fences**, green, each named by title, plus whatever sixth slice D added.

**What this slice is expected to turn red, so the diff is read against something.** Everything that reads the fold or the header: `witness.test.ts`, `rng.test.ts`, `run.test.ts`, `digest.test.ts` with the re-pin, `playback.test.ts` and `verificationReadback.test.ts`, `measure.test.ts` and `scripts/__tests__/measure.test.ts`, `tapeHeader.test.ts`, `recorder.test.ts`, `harnessRun.test.ts`, `tapePlaybackSession.test.ts` and `RunsScreen.test.ts` wherever a header literal or a fixture carries a version. Everything that reads a `Mob`'s key shape: `mobs.test.ts`, `stage.test.ts`, `setPiece.test.ts`, `undertaker.test.ts`. Everything the wisp clock changes: `wisps.test.ts`, `swallow.test.ts`, `storm.test.ts`, `invariants.test.ts`, and **the measured per-seed baseline tables in `bot.test.ts` and `harnessPolicy.test.ts`, which are the ones to watch**, because a floored homing line kills less and a run that kills less runs longer, which is the same shape that cost slices B and C a follow-up commit each. **A realistic count is 15 to 25 files.** A diff much smaller than that is a reason to look for the tests that should have moved and did not. Slice A's table said five files and the diff said 19; slice B0 touched 143, slice B twelve, slice C twenty-five.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck` green from `apps/hungry-grave/`. It is the only judge of diagnostics; editor diagnostics name scratch files and stale states.
2. **Agent.** `pnpm vitest run` green from `apps/hungry-grave/`, then `pnpm build`, then `pnpm verify` green at the repo root, twice on the committed tree.
3. **Agent.** The test-name diff. `pnpm vitest list --json > <current>` into the scratchpad, then `pnpm vite-node --config vite.headless.config.ts scripts/test-names.ts apps/hungry-grave/local/step4/tests-baseline.txt <current>`. **The baseline is at `apps/hungry-grave/local/step4/tests-baseline.txt`, beside its `.json` sibling, 1834 names**, and not at the worktree root where the handoff's wording reads. Do not recreate either file. The step 0 baseline predates slices A0, A, B0, B, C and D, so it cannot isolate your slice; capture the tip before your commit the way slices B0 and C did (progress note sections 13 and 15) and report both.
4. **Agent.** `WITNESS_VERSION` at 7, moved in exactly one commit, with every new folded field named in that commit's version note. The plan's verification step 7.
5. **Agent.** Replay determinism at this tip: one seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
6. **Agent.** A hand-recorded tape at this tip through `vite preview`, driven with `playwright-cli`, measured to `outcome: 'verified'`, with `state.refusals` printed into the note. Item (l).
7. **Agent.** A pre-E tape refused by its version rather than diverging. Item (l).
8. **Agent.** The wisp cap on progress note 15's own instrument, before and after the clock, at rung 1 and rung 5. Item (h). **A cap that still binds is a stop.**
9. **Agent.** Two conditioned tapes, rung 1 and rung 5 on one seed, each `outcome: 'verified'`. Item (l).
10. **Agent.** The rendered check: a run played, ended and played again, with the screenshot read and reported. Item (l), and the plan does not owe it.
11. **Agent.** The five fences green plus slice D's sixth, each named by test title in the note.
12. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
13. **Human (Mark), and none of these blocks you.** Whether the wisps now read as a line the player fires rather than one that mows for them; the surfaced commitment that `WITNESS_VERSION` moves to 7, which is the record's section 11 item 4 and which he reviews on the branch; whether the Wall is still meant to cost something (plan verification step 22); whether Territory's bottom rung still reads as his #79 ruling meant it (plan verification step 23, and no slice owns Territory's rungs). The push runs in one-push mode: you continue past every one of them and he reads them on the branch.

### State of the branch

- Branch `hungry-grave-v1`, worktree `/home/mlo/dev/niftymonkey/the-cabinet/.claude/worktrees/hungry-grave-v1`. Run `git log --oneline -25` and `git status --short` first and check the tree is clean before your first edit. **The tip should be slice D's docs commit and the last code commit should be slice D's.** Below it: `01c9a6f32d` slice C's follow-up, `7bc43700a5` slice C, `4607280db1` slice B's follow-up, `480b207fdf` slice B, `2ec6ee5efc` slice B0, `d4dedf6d9a` slice A.
- At `01c9a6f32d`, slice C's tip, `pnpm verify` was green twice at exit 0: 141 test files, 1888 passed, 25 expected fail, 2 todo, five fences green. **Your two flipped tripwires take the expected-fail count from 25 to 23**, which is a number to state in the note rather than to discover. Read progress note section 16 for where slice D left it.
- **`GOLDEN` has re-pinned twice, slice A's and slice C's; slice B used none and slice D was forbidden one. Yours is the third of the five.** `WITNESS_VERSION` 6, `FORMAT_VERSION` 3, `READINGS_VERSION` 4.
- Slice A is deployed at https://hungry-grave.vercel.app. **You do not deploy.**
- `local/` reaches none of the standing checks: outside version control, outside eslint, outside prettier, outside `tsconfig.json`'s `include`. The one thing that does reach it is vitest, which has no config of its own, so a `*.test.ts` left under `local/` runs in the suite. **Nothing under `local/` ever enters a commit.** Scratch work goes in the scratchpad directory your system prompt names, never under the repo, and the scratchpad is shared between agents, so give your files distinctive names.
- Nothing under `docs/` is ever handed to prettier by name. `pnpm`, never `npm`, and app commands run from `apps/hungry-grave/`.
- Reading a file over roughly 30 KB: the Read tool in ranges, never `cat`. In zsh a bare `echo ====` fails and `--include=*.ts` needs quoting.
- **One anomaly from slice C that will recur:** a sibling worktree's `pnpm install` can repoint this worktree's `node_modules` links and leave them dangling, so a missing-module error is a reason to check the link targets before believing anything about your own tree. `pnpm install --frozen-lockfile` relinks it and the lockfile does not move.

### The worktree guard, and git

**The isolation guard refuses compound Bash that mentions git, even inside quoted text, and even inside a loop or a variable it cannot evaluate.** So: **one plain git command per Bash call.** Never chain with `&&`, `;` or `|` when the command names git. A script that needs a loop goes in the scratchpad directory and is run by path.

**Never touch the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`**, not to read, not to run a command in, not to write. Everything happens inside the worktree.

**Never use the stash.** The stack is shared with the main checkout and other sessions. Set work aside with a temporary commit if you must set it aside at all.

**Never `git add -A` or `git add .`.** Add each path.

**Never write an em dash (U+2014) anywhere**: not in code, not in a comment, not in a commit message, not in the progress note. Comma, colon, parentheses, or two sentences.

### The stuck rule

**Two failed honest attempts at the same thing, or a decision only Mark can make, or an unauthorized irreversible step: stop and report.** Write what you were doing, the two attempts and why each failed, and one sentence naming the question. **Do not send anything to Discord yourself; the orchestrator does that.** Hand your report back and stop.

Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first. A claim in the plan or in either record that is false against the tree is recorded in the progress note and the source's intent is followed rather than its stale letter; if the intent is unclear, that is a stop. **A gate finding or a measurement that argues against something Mark ruled is filed for his read and built past, never applied.**

**Five things in this slice are already known to be a stop, a ruling or a finding, so you do not have to discover them:** the wisp cap still binding after the clock lands, item (h), which is the slice's one planned stop; `GOLDEN`'s `drawn.spawns` moving, item (j), which is the second; `PressureSignal.lock` belonging to slice G, item (e), which is ruled rather than open; the silent line cap, item (i), which is ruled out of this slice and written down as a finding; and the plan's claim that no rendered check is owed, item (l), which is stale and which you note rather than obey.

**And two collisions between the plan and the tree, both already known.** First, **the plan says the provenance mark "is folded like every other field on a live mob", and the tree does not fold every field on a live mob**: `mobs[].type` and `mobs[].appearedInside` are both excluded with reasons. Item (f) rules it folded anyway and gives the reason, `carries` rather than `type`, and that ruling stands. Second, **the plan writes this commit as containing nothing but the fold, and two rulings have widened it** with the wisp clock and #108's two names. Both are recorded above; neither is a licence to widen it further.

### What is not your job

- **Slice B's work.** The standing waves, the re-authored section tables, the carriers, `repeatingArrivals`, `peakArrivals`'s rate term, `wavesUnderThePour`, the Wall's wave, and `peakLive` and `MOB_CAP` as derivations, which it pulled forward.
- **Slice C's work.** `CORPSES_TO_CEILING`, the reservoir, the per-rung damage lane, the surge extension and its cap, and the wisp volley interval's own magnitude. **The interval is authored and you read it; you do not re-derive it.**
- **Slice D's work.** `MOB_FIRE_CAP`, `CORPSE_CAP`'s director addend, the card table, `BODY_COST`, `cardCost`, the three section purses, the quiet-interval minimum authored ahead of slice F, and the `caps.ts` import fence. If any of it is undone, that is a finding for the note and not work you pick up.
- **Slice F's work.** The director's signal and its decay, `advancePressure`, `directorSpend`, `DirectedAdd`, the spend, the quiet interval's draw, `Section.purse` as a column on `Section`, the `directedAdd` event, the one call site in `step.ts` and that file's tick-order JSDoc, the purse invariant, the Vigil's stale `liveBodyCeiling`, and spec tests 33 to 48. **You create `director.ts` and it does nothing.**
- **Slice G's work.** The readings, `readings/pressure.ts`, `timeToKill.ts`'s per-minute split, `signalLock.ts` and `PressureSignal.lock`, `signalLockFromUrl`, the header field, `FORMAT_VERSION` 3 to 4 and the `bot.ts` comment.
- **Territory's rungs**, which no slice in the plan owns and which are Mark's.
- **The phone half of round 0**, which is Mark's with the deployed instrument.
- **`src/game/offer.ts` and the bank expiry**, withdrawn from round one, so no slice opens that file.
- **Prose in `docs/design` and `docs/adr` still carrying the old six words**, ADR 0047's and ADR 0056's own bodies included. A follow-up docs pass owns it.
- **Mark's follow-along doc**, https://md.niftymonkey.dev/api/raw/CTtB5BJJ. The orchestrator's.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.** Each needs its own explicit yes and none of them is yours.
