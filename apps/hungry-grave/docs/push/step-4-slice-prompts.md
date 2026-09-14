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
