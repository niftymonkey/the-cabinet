# Step 6 slice prompts: the tuning record

One block per slice, in run order. The launch preamble is the same for every slice: name the playbook, name the record sections carrying the dispatch contract items, then give the slice.

**The order the blocks run in is slice 1 (the vocabulary), 2 (A1, the starting conditions), 3 (A, the record exists), 4 (B1, the record reaches the run and the caps follow it), 5 (B2, the score group's readers), 6 (C, the header), 7 (D, the candidates and the two command surfaces), 8 (E, the sweep runner), then the step's close.** Every heading carries the ordinal it runs in and the draft's own letter beside it (Mark, 2026-09-17: slices are numbered in run order and the old letter stays in parentheses), so a list a person reads is in execution order while every cross-reference to the draft's section 4 stays valid.

**The split is not the draft's five, and the reason is in the rulings rather than in taste.** The draft's section 4 has A (the record exists), B (the core reads it), C (the header), D (the command line and the URL) and E (the sweep runner). Section 2a's ruling 3 then added two things the draft's slice B did not carry: `createRun` moves to a seed plus one narrow starting-condition record, and the three caps become per-run derivations carried on `RunState`. Each of those is a whole-tree move on its own, and neither one needs the tuning record to exist. **So they come out of B and run first, as slices 2 and 4**, which is the one shape that lets each commit be checkable on its own: slice 2 changes one signature and no value, slice 4 changes where a cap is computed and no value, and the record's own arrival is then a field added to a record that already exists. The draft's slice B is what is left, split by owner group across slices 4 and 5 because ruling 2 groups the record by owning module and the groups have disjoint readers. **The draft's A, C, D and E are slices 3, 6, 7 and 8, unchanged in content.** The vocabulary is slice 1 rather than riding inside a code slice, because every block below uses the words *tuning record* and *candidate* in its own seam names and a seam carries the glossary's word.

**Step 6's coder contract is `docs/push/step-4-coder-contract.md`, unchanged and still binding.** It carries how to work in the worktree, the commit and review rules, the progress note, the verification commands, what must not move in any slice, what is never a slice's job, and the stuck rule. Every block below names it and holds only what is its own.

**Three standing overrides of that contract, and they apply to every block below.**

1. **The ticket in the commit message is `(#142)`, this step's own ticket**, not `#39` and not step 5's `#99` or `#72`. The orchestrator creates the ticket before the first dispatch and substitutes its number into every block. The contract's "(#39), which is the ticket every step 4 docs and code commit cites" is step 4's.
2. **The progress note is `apps/hungry-grave/docs/push/step-6-progress.md`, a new file, not step 5's and not round two's.** Slice 1 creates it with sections 1 to 5 in the same shape as `step-5-progress.md`'s sections 1 to 5, read for the shape and never copied for the content: 1 slices committed, 2 the version ledger, 3 `GOLDEN` moves, 4 CodeRabbit, 5 record and prompt claims found false against the tree. **Sections 6 onward are one per slice in run order: slice 1 is 6, slice 2 is 7, slice 3 is 8, slice 4 is 9, slice 5 is 10, slice 6 is 11, slice 7 is 12, slice 8 is 13.** Step 5's note and step 4's are read and never appended to.
3. **Scratch under `local/` goes in `local/step6/`, and every file in it carries your slice's name**, because the scratchpad and `local/` are shared between agents and a generic baseline filename gets clobbered by another agent's. Nothing under `local/` ever enters a commit, batch output included.

**The design record is `apps/hungry-grave/docs/push/drafts/step-5-tuning-record-draft.md`.** Its section 1 is the goal and the done line. Its section 2 is eleven decisions and **its section 2a is the orchestrator's ruling on each, dated 2026-09-17; every ruling is final and no slice reopens one.** Its section 3 is the proposed shape. Its section 4 is the slices, which this file renumbers and re-splits as above. Its section 5 is what must not move. Its section 6 is the verification list and the test sentences. Its section 7 says no decision in it needs Mark. **Its section 5's version numbers and every line number in it are stale and none is obeyed: the constants below are read off the tree at HEAD and every slice re-reads them off its own tip.**

**Five further rulings the draft does not carry, all from the orchestrator and all binding on every block.**

1. **The starting-condition record is one record, spoken by three shapes that are three today.** The step 5 close's tech gate found `Rig` (`src/dev/rigs.ts`), `TapeHeader` (`src/tape/tape.ts`) and `createRun`'s six positional parameters each spelling the same fact, with three call sites padding the middle of that list with `undefined` (`src/dev/harnessRun.ts`, `src/dev/floorLadderWalk.ts`, `scripts/record-conditioned.ts`, the last of which has a fourth spelling of its own called `Conditions`). **One record replaces all of them.** The tape header's new block carries that record whole, **including the starting score slice 8 of step 5 added**, so a staged run replays and bands as itself and `rigOf` can band by it. That closes the gap filed in the handoff's open item 5: a `rig=ladder` batch verifies nothing today, because the header carries no score and every ladder tape diverges at its first checkpoint.
2. **Every ADR this step needs is filed by the orchestrator, not by a coder.** A block says which ADR its slice depends on and names the decision; the orchestrator files or amends it before that slice dispatches. **You file no ADR and amend none**, which is the contract's own rule and is repeated here because this step's shape leans on three. Expected: **two new ADRs**, **ADR 0063** (a run's starting condition is one record) for the starting-condition record and **ADR 0064** (a tuning magnitude is a row of one record, resolved at the shell and carried on the run) for the tuning record, both of ruling 3's shape, and **edit-in-place amendments to ADR 0056** (the caps are derived per run from the record) **and ADR 0043** (the header's self-describing block, with `FORMAT_VERSION` 4 to 5 recorded there).
3. **No magnitude moves in this step.** Every value in the default record equals today's compiled constant, `GOLDEN` holds by arithmetic in every slice, and **a moved value is a stop and report**, whatever it fixes. The one place a figure differs from today's is inside a named candidate row in slice 7, which is data a batch names and never the default.
4. **The version ledger, and it is short.** `WITNESS_VERSION` does not move: the record is a starting condition and every consequence of it is already in the fold through live state (ruling 6). `READINGS_VERSION` does not move: no existing reading changes meaning, and slice 8's tuning identity is identity and not a reading. **`FORMAT_VERSION` moves 4 to 5 in exactly one slice, slice 6, and in no other.** `GOLDEN` is re-pinned in no slice at all (ruling 7).
5. **The sweep's first sweep is not run in this step.** The step ends with the record, the candidates, the header, the report's identity, and `scripts/sweep.ts` proven on two candidates that differ in one row with the comparison printing the differing row first. **Moving numbers is after this branch or a later step**, and slice 8's "what is not your job" says so.

**The membership question, resolved rather than left to a coder.** Ruling 1 states the rule: a magnitude is in the record when a batch reading can move it and it is neither a derivation nor a safety net. **The rule decides eligibility. What this step carries is the rows the first sweep actually names**, because threading every eligible magnitude through every reader is a different size of job entirely: `grave.ts` alone reads twelve tuning constants across twenty-four sites, `mobs.ts` eighteen, `corpses.ts` nine, and `src/game/__tests__/grave.test.ts` seventy-nine. A record row nothing reads is worse than no row, because a candidate could move it and nothing would change, so **slice 3 declares exactly the rows slices 4 and 5 wire, a fence test fails if a row has no reader, and the eligible-but-not-yet-carried magnitudes are listed in the progress note for the next round to add one commit at a time.** The rows this step carries, from the handoff's own first sweep list:

- **The stage group** (slices 3 and 4): `PROCESSION_PURSE`, `CROWD_PURSE`, `VIGIL_PURSE` and `QUIET_INTERVAL_MINIMUM_SECONDS` in `src/game/stage/waves.ts`, **and the director's own maximum beside that minimum**, `stage.quietIntervalMaximumSeconds`, authored at 8, which is today's `QUIET_MAX_TICKS` in `src/game/director.ts` read in seconds. **The record holds both ends of the interval so that its own resolver can assert the minimum sits at or below the maximum without importing anything**, which is where that bound lives (slice 3) rather than in the candidate table: a table bound catches committed rows only, while a tape header replaying under its own values would otherwise reach `stream.nextInt` with a negative span. The sweep list's own finding is that the purses are priced above what the quiet interval lets a section spend and the director takes three quarters of the Procession's empty ticks.
- **The score group** (slices 3 and 5): `TRASH_KILL_SCORE`, `SCORE_BLEED_CAP`, `SCORE_PER_BOSS_HEALTH`, `SOURCE_KILL_SCORE` and `MEAL_AT_MAXED_SCORE` in `src/game/tuning.ts`. **All five are annotated in their own JSDoc as first figures waiting on a batch**, and the last three landed on 2026-09-17 in step 5's slice 10, after ruling 1 was written, which is why the ruling names only the first two.

**What is eligible and not carried**, named here so nobody discovers it as a gap: the rest of `tuning.ts`'s declared numbers, `MOB_TYPES` in `src/game/mobs.ts`, `BODY_COST` and `CARDS` in `waves.ts`, the section wave tables, and each line's level curve. The exclusions the rule makes are unchanged: `MOB_CAP`, `MOB_FIRE_CAP` and `CORPSE_CAP` are derivations, `SKULL_CAP` and `WISP_CAP` are safety nets by their own JSDoc, `TRASH_CORPSE_PAYOUT` and `RESERVOIR_CAPACITY` are derivations whose whole point is that the feast identity is true by construction, and the harness's hand rows are excluded because a moved hand row is a new configuration with a new name (`src/dev/configurations.ts`).

**Every craft value in these prompts is the draft's and is cited to its ruling.** A number that is not in the draft and cannot be measured before the code exists is a data row the coder picks, annotates as a first figure with what it is set against and what would move it, and names in the progress note as open. **It is never a compiled constant with no annotation and never a number invented inside a test.**

**The version constants and `GOLDEN` at HEAD, which is the tip these prompts read against.** `WITNESS_VERSION` **11** (`src/game/witness.ts`), `READINGS_VERSION` **9** (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` **4** (`src/tape/wireCodes.ts`), `GOLDEN`'s checksum **`-2049717150`** (`src/dev/digest.ts`) with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` inside it. **A slice may land between this line and you**, so **every slice re-reads all four off its own tip before it leans on any of them and reports what it read.**

**The step's whole version ledger, by slice.**

| Slice | `WITNESS_VERSION` | `READINGS_VERSION` | `FORMAT_VERSION` | `GOLDEN` |
| --- | --- | --- | --- | --- |
| 1, the vocabulary | none | none | none | none, and no `src/` file is in the commit |
| 2 (A1), the starting conditions | none | none | none | none, held by arithmetic |
| 3 (A), the record exists | none | none | none | none, held by arithmetic |
| 4 (B1), the record reaches the run | none | none | none | none, held by arithmetic |
| 5 (B2), the score group's readers | none | none | none | none, held by arithmetic |
| 6 (C), the header | none | none | **4 to 5, the step's one move** | none, held by arithmetic |
| 7 (D), the candidates | none | none | none | none |
| 8 (E), the sweep runner | none | none | none | none |

**`GOLDEN` holds in every slice and `digest.ts` is in no commit in this step**, which is a property of slice 2's own shape rather than a hope: the seed stays `createRun`'s first positional parameter and the new record is one optional second argument, so `createRun(SEED)` in `src/dev/digest.ts`, `scripts/frame-budget.ts` and `src/app/screens/FrameBudgetScreen.ts` does not move at all.

**Line numbers are never cited in these prompts and never relied on. Find the name, never the line.** The draft's own section 0 wording says the same and says why: every slice moves some of them.

---

## Slice 1: the vocabulary, and the step's progress note exists (#142)

Model: Opus, subagent type general-purpose. One coder, one docs commit and no code commit. The message ends in `(#142)`.

Slice 1 of the tuning-record step. Every slice after you writes a seam whose name is a glossary word, and three of those words do not exist yet. **The code rules say a public seam carries the domain glossary's word and a defined term is fully descriptive on its own**, so the words land before the seams do rather than being back-filled once seven commits already spell them. `Rig` and `Configuration` both entered the glossary the same way when the harness gained them (`CONTEXT.md`, ADR 0053), which is the precedent this slice follows.

**The standing rules are in `docs/push/step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice 1.

**Its progress-note entry is section 6**, and **this slice creates the note**. Sections 1 to 5 are the cross-slice facts every later slice writes its own rows into; you write their headings and their tables with your own row only.

**Three rulings shape this slice and none of them is yours to revisit.**

**First: exactly three entries, Tuning record, Candidate and Starting condition (ruling 11, and the orchestrator's ruling on the step 5 tech gate's finding 9).** *Tuning record* is the shape: the numbers a batch reading can move, grouped by the module that owns them. *Candidate* is a named tuning record a batch or a play runs under. *Starting condition* is the word slice 2's own seam is named with, defined as ADR 0063 defines it: one record of how a run starts, the size, the levels, the roster, the signal lock and the starting score, where a rig is that record under a name, the tape header carries it and `createRun` takes it. **The entry cites ADR 0063 by number and the `Rig` entry is amended to cite the term.** **`Rig` is amended in the same pass for a second reason**: it says six rigs exist and names the ceiling, start-size, ladder, conditioned, birthright and maxed rigs, while `RIG_NAMES` holds three (`birthright`, `maxed`, `ladder`), so the entry is corrected to the three rows the tree has, with the ceiling rig named as still unrowed and waiting, which is what `rigs.ts`'s own comment says. **"Dial" is out** because it implies a knob and Mark ruled no comparison knobs before V1. **"Override" is out** by the glossary's own avoid-list: the `Signal lock` entry already lists it. **Neither word appears anywhere in this step**, in a glossary entry, a seam name, a comment, a commit message or the note.

**Second: the `Batch` entry's avoid-list names `sweep`, and slice 8 builds `scripts/sweep.ts` (ruling 9).** That is a real collision and it is yours to resolve, in the one direction the rulings leave open: the script's name is ruled, so **the avoid-list entry is amended in place** with the dated what-stood / what-changed / what-it-could-not-have-known triple the repo uses for a glossary and ADR amendment (the `Rig` entry carries a worked example of the form, dated 2026-09-17). What stood is everything `Batch` says a batch is. What changed is that a sweep is now a distinct thing rather than a loose word for a batch: a list of candidates, each played as an ordinary batch, compared across them. What it could not have known is that nothing could name a tuning at run start when it was written, so there was nothing a sweep could sweep over. **`sample`, `suite`, `trial` and `experiment` stay on the avoid-list untouched.**

**Third: you write no ADR and amend none.** The two new ADRs, **ADR 0063** for the starting-condition record and **ADR 0064** for the tuning record, are the orchestrator's and are filed before slice 2 dispatches. **Your entries cite each by number if it exists at your tip and by nothing if it does not**; an entry that cites a record you cannot open is a stop and report.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. **The six dispatch contract items are the sections below**, and for a docs-only slice the definition and the verification steps are the whole of the flow it runs.
2. `apps/hungry-grave/CONTEXT.md`, **the whole of the "The build" section**, which is where both entries go and which holds `Rig`, `Configuration`, `Signal lock`, `Reading`, `Batch`, `Playing harness` and `Store`. **Read `Rig`'s amendment paragraph for the exact form an amendment takes.**
3. `apps/hungry-grave/docs/push/drafts/step-5-tuning-record-draft.md`, **sections 1, 2a and 3**: the goal, the eleven rulings and the proposed shape. Your two entries describe what sections 3 and 4 build and must not promise more than the rulings rule.
4. `apps/hungry-grave/docs/push/step-5-progress.md`, **its first sixty lines only**, for the shape sections 1 to 5 take. You copy the shape and none of the content.
5. `apps/hungry-grave/docs/adr/0053-*` and `docs/adr/0061-*`, for what a harness word is and for the vocabulary ruling that governs whether a word is the genre's or the player's.
6. `.claude/rules/code-core.md`, the Naming section, which is why the words land before the seams.

**Check the worktree is clean before your first edit and report what you find.** Anything uncommitted under `src/` is a stop and report. A docs file dirty in the shared worktree is another agent's and never enters your commit.

### The definition, in observable terms

After this slice the glossary holds three entries it did not: a reader who has never seen this step can read `CONTEXT.md` and say what a tuning record is, what a candidate is, what a starting condition is, and how the three differ from a rig, a configuration and a batch. **The `Rig` entry names the three rows the tree has rather than six**, and cites the starting-condition term. **The `Batch` entry no longer forbids the word the step's own command is named with**, and says what a sweep is instead. **A new progress note exists** with five empty cross-slice sections and one filled section of its own, so slice 2 appends rather than inventing a file.

**Nothing under `src/` changes and no command behaves differently.** `WITNESS_VERSION` reads 11, `READINGS_VERSION` reads 9, `FORMAT_VERSION` reads 4, `GOLDEN` holds, and `pnpm verify` is green, which for a docs-only commit is not a formality: step 5's slice 8 left a doubled blank line in `CONTEXT.md` that turned `pnpm verify` red, because the coder verified the code commit's tree only.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported. Anything dirty under `src/` is a stop.

**(b) The three entries**, in `CONTEXT.md`'s "The build" section, each in the section's own voice: a bold term, a definition that is fully descriptive on its own, what it is not, and an `_Avoid_` list. **Place them beside `Rig`, `Configuration` and `Batch` rather than at the section's end**, because a reader meets the harness words together. *Tuning record* says it is the numbers a batch reading can move, grouped by the module that owns them, resolved once at the start of a run and carried on it, and that it is not the caps and not the safety nets, which are a derivation and a bug detector. *Candidate* says it is a named tuning record a batch or a play runs under, that the name is what a batch folder and a report carry, and that a candidate is a starting condition on exactly the terms a rig is and never a description of the hand that steered. *Starting condition* says what ADR 0063 rules it is, cited by number: one record of how a run starts, the size, the levels, the roster, the signal lock and the starting score together, a rig being that record under a name, the tape header carrying it and `createRun` taking it.

**(c) The two amendments**, both in place and both in the dated triple form. The `Batch` avoid-list, as the second ruling above says. And the `Rig` entry, corrected to the three rows `RIG_NAMES` holds, naming the ceiling rig as still unrowed and waiting, and citing the starting-condition term.

**(d) The progress note**, `apps/hungry-grave/docs/push/step-6-progress.md`, created with the five cross-slice sections and section 6. The five are 1 slices committed, 2 the version ledger, 3 `GOLDEN` moves, 4 CodeRabbit, 5 record and prompt claims found false against the tree, which is `step-5-progress.md`'s own shape.

**(e) CodeRabbit CLI, one iteration**, `git add` every changed and new file by path first, then the docs commit. Something in the shape of `docs(hungry-grave): the glossary gains the tuning record, the candidate and the starting condition, and a sweep is not a batch (#142)`.

**(f) Stop and report.** Under 250 words. **Do not start slice 2.**

### What must not move, and a move is a stop

- **Everything under `src/` and `scripts/`.** This slice's diff is `CONTEXT.md` and one new file under `docs/push/`, and nothing else.
- **The four constants**, read and reported, none of their files in the commit.
- **Every glossary entry but `Batch` and `Rig`**, its definition and its avoid-list. `Rig`'s existing 2026-09-17 amendment paragraph stands and your correction is a second one beside it. **`Signal lock`'s avoid-list keeps "override"**, which is why this step does not use the word.
- **The words "dial" and "override"**, which appear nowhere in what you write.
- **ADR 0061's ruling** on what vocabulary is the genre's and what is the player's. Both new words are harness words and neither reaches a player's surface.

### Seams under test

None: this slice writes no code and declares no seam. **The glossary is the seam every later slice's names are checked against**, which is the reason it runs first.

### Module boundaries

**No module changes.** One file is created, `apps/hungry-grave/docs/push/step-6-progress.md`, and one is edited, `apps/hungry-grave/CONTEXT.md`. **Nothing under `docs/` is ever handed to prettier by name** (the contract).

### The planned test list

**None, and that is the claim to check rather than a gap.** A docs-only change with no behaviour runs the standing checks alone, which is the playbook's own carve-out. **`pnpm verify` green on the committed tree twice** is therefore the whole of the test surface, and it is not a formality here for the reason named in the definition.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green at the repo root, **twice on the committed tree**.
2. **Agent.** The four version constants and `GOLDEN`, each read off the tree and named as held, none of their files in the commit.
3. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit into `local/step6/`. **It should be zero and zero**, and anything else is a stop.
4. **Agent.** CodeRabbit CLI, one iteration, before the commit.
5. **There is no Mark actor in this slice.** A glossary word is a craft call the orchestrator owns (draft section 7), and it reaches him in the session recap rather than as a stall.

### State of the branch

- The tip should be step 5's close. **At HEAD the four read `WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 4 and `GOLDEN`'s checksum `-2049717150` with `score: 200`.** Read all four off the tree yourself and say what you read.
- **You are permitted no version move of any kind and no `GOLDEN` re-pin.** No slice in this step is permitted either except slice 6's single `FORMAT_VERSION` move.
- **Slice 2 follows you** and makes the starting conditions one record. It is the first slice that spells either of your words in a seam name.

### The stuck rule

**Three things are already known to be a stop:** any file under `src/` or `scripts/` in your diff; an entry citing an ADR that does not exist at your tip; and `pnpm verify` red on the committed tree. **And three things are ruled rather than open:** three entries and no more, the words "dial" and "override" banned, and the `Batch` avoid-list amended rather than the script renamed. **A gate finding or a measurement arguing against any of the three is filed in the note, never applied.**

### What is not your job

- **Filing or amending any ADR.** The orchestrator's, all three of them.
- **Promoting the draft at `docs/push/drafts/` into `docs/design/`.** The orchestrator's call and not a slice's.
- **The docs debts filed in the handoff's open item 7**, which belong to the branch's own close pass.
- **Any entry other than the three named and the two amendments.**
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**

---

## Slice 2 (A1): a run's starting conditions are one record (#142)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#142)`.

Slice 2 of the tuning-record step. **One fact about a run is spelled four ways in the tree today.** `createRun` takes six positional parameters, `Rig` in `src/dev/rigs.ts` is three fields of the same thing, `TapeHeader` in `src/tape/tape.ts` carries four more of them, and `scripts/record-conditioned.ts` has a local type called `Conditions` that is the fourth spelling of part of it. Three call sites already pad the middle of `createRun`'s list with `undefined` to reach the last argument, which is the smell that says a positional list has run out (`src/dev/harnessRun.ts`, `src/dev/floorLadderWalk.ts`, `scripts/record-conditioned.ts`). **Ruling 3 rules this: `createRun` moves to a seed plus one narrow record of starting conditions, all call sites move in the same commit, none changes a value, and the golden holds.** This slice is that move and nothing else: **the tuning record does not exist yet and no field for it is added here.**

**The standing rules are in `docs/push/step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice 2.

**Its progress-note entry is section 7**, appended to `step-6-progress.md`, which slice 1 created.

**Six rulings shape this slice and none of them is yours to revisit.**

**First: nothing a player can meet changes, and no value moves.** Every default is the default it is today, every call site passes what it passes today, and `GOLDEN` holds by arithmetic rather than by re-pinning. **A diff that changes what a played run does is a stop and report.**

**Second: the seed stays first and stays positional.** `createRun(seed, conditions?: Partial<StartingConditions>)`. The seed is the run's identity in a way none of the rest is, `rollSeed()` is its default, and `createRun(SEED)` is the whole call at four call sites in three files (`src/dev/digest.ts`, `scripts/frame-budget.ts` twice, `src/app/screens/FrameBudgetScreen.ts`). **Keeping it first is what keeps `digest.ts` out of this commit**, which is the surest proof the golden's own run did not move.

**Third: the record is the starting conditions and its name is the domain's.** Five fields, exactly the five the signature carries today: the starting size, the starting levels, the roster, the signal lock and the starting score. **`StartingConditions` is the recommendation and the concept is the ruling**; if a truer name reads better with all the callers in front of you, take it and say why in the note. **`StartingConditions` is the resolved record, all five fields required, because it is what a rig states and what a header records (ADR 0027); `createRun(seed, conditions?: Partial<StartingConditions>)` takes the partial and resolves every absence exactly as it does today, so `createRun(seed)` is today's run and a `Rig` row cannot leave a field implicit.** The record's own module is `src/game/` beside `run.ts`, or inside `run.ts` if it has no second export; **a file is a concept module and the concept here is a starting condition**, so if it earns a file, it gets one. **`RunState` carries the resolved record whole as one readonly field, `conditions`**, which is what lets `harnessHeader` and `headerFor` read the condition off the run rather than reassembling it from live state.

**Fourth: `Rig` speaks the record rather than restating it.** A rig becomes a name plus one `StartingConditions`, and `playHarnessRun` passes that record whole into `createRun` the way it passes every field today. **This is what #107 asked for in the first place**: a rig applied without one of its fields is a rig half applied, and a record passed whole cannot be half applied. **`rigOf` keeps its two arguments and its behaviour exactly**, banding on the size and the levels alone, because the tape header still carries no score at your tip and a banding rule reading a fact the header cannot hold would answer null forever. **Slice 6 is where that changes and it is not yours.** For the same reason **`rigs.test.ts`'s uniqueness key stays size plus levels**.

**Fifth: `record-conditioned.ts`'s local `Conditions` type goes.** One concept has one spelling. Its command-line parsing, its refusals, its warning and its usage line all keep their exact behaviour; what changes is the type the parse produces.

**Sixth: `TapeHeader` is not touched at all.** The header's own move is slice 6, it costs a `FORMAT_VERSION` bump, and the bump is taken once in the slice that last changes the layout. **Nothing in `src/tape/` production code changes except `runFromHeader`'s body**, which builds a `StartingConditions` from the header's existing fields and passes it; **`src/tape/__tests__/verificationReadback.test.ts` follows the signature and keeps its promise.**

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. **The six dispatch contract items are the sections below.**
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`. **"Powers arrive as props at construction: a narrow record of callbacks and values, only what the component needs" is this slice's whole rule**, and the seam-type naming rule decides the record's name.
3. `apps/hungry-grave/docs/push/drafts/step-5-tuning-record-draft.md`, **section 2 decision 3 and section 2a ruling 3 in full**, then section 3 and section 5.
4. `apps/hungry-grave/CONTEXT.md`, the entries **Rig**, **Configuration** and the three slice 1 added. You amend none of them unless one has gone false, and you say in the note what you decided and why.
5. `apps/hungry-grave/docs/adr/0027-*`, **for why a header records a resolved value and never an absence**, and `docs/adr/0053-*` for what a rig is and is not. **ADR 0063**, a run's starting condition is one record, which is this slice's own decision, if it is at your tip: read it and say in the note that you did.
6. The tree, by name and never by line: `src/game/run.ts` **whole**, and `createRun`, its JSDoc and `RunState` above all, **because that JSDoc already explains why each of the five is in the signature and it is the material your record's own JSDoc is built from**; every call site, which is `src/dev/harnessRun.ts`'s `playHarnessRun`, `src/dev/floorLadderWalk.ts`'s `stagedRun`, `src/dev/digest.ts`'s `runScenario`, `src/app/screens/game/runSession.ts`'s `begin`, `src/app/screens/FrameBudgetScreen.ts`, `src/tape/playback.ts`'s `runFromHeader`, `scripts/record-conditioned.ts`'s `recordTape` and `scripts/frame-budget.ts`; `src/dev/rigs.ts` **whole**, 123 lines; `src/app/seedFromUrl.ts` **whole**, for the four parsers whose values `begin` assembles (seed, size, levels, signal lock).
7. The tests: `src/game/__tests__/run.test.ts`, `src/dev/__tests__/rigs.test.ts` **whole**, `src/__tests__/boundary.test.ts`'s `BOUNDARIES` table and its core cycle guard, and `src/game/__tests__/digest.test.ts`, which must be green with `digest.ts` untouched.

**Check the worktree is clean before your first edit and report what you find.** Anything uncommitted under `src/` is a stop and report.

### The definition, in observable terms

After this slice a run's starting conditions are one value. A caller names a seed and, if it wants anything but a fresh run, one record; it never counts arguments and never pads with `undefined`. **A rig is a name and that record**, so applying a rig is passing one value and a half-applied rig is not expressible. **A conditioned tape's command line produces that same record**, and `runFromHeader` builds one from the header it already reads.

**Nothing a player meets changes and no number moves.** The same seed plays the same run: `GOLDEN` holds at `-2049717150` with `score: 200`, `digest.ts` is in neither commit, every existing test keeps its promise, and a conditioned tape recorded on the same seed at the same commit is byte-identical apart from its header's `recordedAt`.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step6/` under a name carrying `a1conditions`. **Slice 1's commit must be in the tree.** Anything dirty under `src/` is a stop.

**(b) The tests first, red.** Write the signature's own tests before the signature, from the test list below. **A record shaped before the test it has to satisfy is a record shaped by what was easy to type.**

**(c) The record and the signature.** `StartingConditions` with its five required fields, each carrying the JSDoc paragraph `createRun`'s own JSDoc already gives that parameter, moved rather than rewritten. `createRun(seed, conditions?: Partial<StartingConditions>)`, its body resolving every absence exactly as it resolves one today.

**(d) Every call site, in one commit.** Nine call expressions in eight files outside the tests (`scripts/frame-budget.ts` has two), all in the read list; the four `createRun(SEED)` calls do not move. **Say in the note that you checked all nine and name any you found that the list does not.**

**(e) `Rig` and the harness.** The row becomes a name plus one record; `playHarnessRun` passes it whole; `rigOf` and `rigs.test.ts`'s uniqueness key are untouched in behaviour, and their JSDoc is rewritten wherever this slice makes a sentence false. **A comment that goes false in your commit is rewritten in your commit**, which is what step 5's slice 8 did to `rigs.ts`'s own waiting-row comment.

**(f) `record-conditioned.ts`.** The local `Conditions` type goes and the parse produces a `StartingConditions`. **Its refusals, its warning about a non-zero score and its usage line keep their exact wording**, because a warning's wording is a promise the note quotes.

**(g) The measurements this slice owes.**

- **A conditioned tape re-recorded on a seed and a rig you also recorded before your first edit**, byte-identical apart from the header's `recordedAt`, which is the three bytes step 5's slice 7 already isolated. Say the seed, the rig and the comparison's result.
- **A batch on twelve seeds under one configuration and the birthright rig**, its event counts identical to a batch played at your starting tip on the same twelve. **This slice changes no rule, so a count that moved is a stop and report** rather than a finding: nothing here has a branch that could explain one.
- **Replay determinism at your tip.** One seed played twice under `shaky-short`, same tick count, same witness at every checkpoint, identical stream cursors.
- **The four constants and `GOLDEN`**, each read off the tree and named as held, with none of their four files in either commit.

**(h) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `refactor(hungry-grave): a run's starting conditions are one record and createRun takes a seed beside it (#142)`. Then the docs commit, carrying the progress note.

**(i) The progress note**, section **7**, in step 5's section form: bold-led paragraphs, each naming one thing, no numbered list. Beyond the contract's list, say: the record's final name and why; the nine call sites checked and the three that were padding with `undefined`; what `Rig` looks like now and that `rigOf` and the uniqueness key were deliberately left; the `Conditions` type removed and the warning's wording preserved; the tape and batch comparisons; and the four constants and `GOLDEN` all named as read off your own tip.

**(j) Stop and report.** Under 250 words. **Do not start slice 3.** **This slice's tip is not a deploy**: nothing a player can meet changed.

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 4 and `GOLDEN` at `-2049717150` with `score: 200`.** None moves, `witness.ts`, `readingsVersion.ts`, `wireCodes.ts` and `digest.ts` are in neither commit, and you read all four off the tree rather than off this line.
- **Every magnitude in the tree.** This slice moves where a value travels and never what it is.
- **`TapeHeader` and everything in `src/tape/` production code except `runFromHeader`'s body**, with `src/tape/__tests__/verificationReadback.test.ts` following the signature and keeping its promise. The header's move is slice 6's and it costs the step's one `FORMAT_VERSION` bump.
- **`rigOf`'s two arguments and its answer**, and **`rigs.test.ts`'s uniqueness assertion**, both of which slice 6 revisits and you do not.
- **The two existing rig rows and the ladder row.** `birthright`, `maxed` and `ladder` keep their size, their levels and their score exactly.
- **Every existing invariant's meaning and severity, the fault identity list, every cap, `STREAM_SALTS` and `STREAM_ORDER`.**
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty. **`src/game` still reaches nothing outward.**
- **No test is deleted, skipped, weakened or rewritten to reach green.** A test that named arguments positionally names a record instead; its promise and its name do not move.

### Seams under test

`src/game/run.ts`: `createRun` taking a seed alone and rolling a fresh run; taking a seed and a whole record and starting from it; taking a partial naming some fields and resolving the rest to the same defaults it resolves today. `src/dev/rigs.ts`: a rig as a name plus one record, applied whole, and `rigOf` still banding a tape by the two facts a header carries. `src/tape/playback.ts`: `runFromHeader` building the record from a header's own fields. `scripts/record-conditioned.ts`: the command line producing the record, with every refusal and the warning unchanged.

### Module boundaries

**At most one file is created and none is deleted, merged or split.** If `StartingConditions` earns its own file it goes in `src/game/` beside `run.ts`, named for the one concept it owns, with the type and nothing else; if it does not, it lives in `run.ts`, whose concept it plainly serves. **No import direction changes**: `src/game` stays dependency-free and reaches only itself, `src/dev` reaches `dev`, `game` and `tape`, `src/tape` reaches `tape` and `game`. **No new library enters.** The record is a data type, so it is named for the domain noun and carries nothing about what kind of type it is; **`Rig` holds a whole `StartingConditions` rather than extending one**, because the rules forbid an intersection where an interface belongs, and the `Partial` lives at `createRun`'s parameter alone.

### The planned test list

1. *A run started with a seed alone rolls the same run it rolls today*, every resolved default read off the run.
2. *A run started with a partial holding one field resolves every other field to its own default*, one test per field, which is five.
3. *A run started with a whole record starts from every one of its five facts*, read off the run rather than off the record.
4. *A rig applied to a run applies all five of its facts*, with the ladder row as the case, since it is the only row that states a non-default score.
5. *Every rig row's starting condition is still unique*, the assertion `rigs.test.ts` already makes, unchanged.
6. *A tape still bands to the rig it was recorded under*, `rigOf` answering off a header that carries no score.
7. *A run rebuilt from a header is the run the header describes*, at `runFromHeader`'s seam.
8. **The fences**, green, each by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
9. **The golden digest**, green and unmoved, with `digest.ts` in neither commit.

**What this slice is expected to turn red.** Every test that calls `createRun` with more than a seed, which compiles against the new signature and keeps its promise. **A realistic count is 15 to 25 files.** A suite that reddens in a way a signature change cannot explain is a reason to stop and read what you reached into.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit.
3. **Agent.** The four version constants and `GOLDEN`, each read off the tree and named as held, with none of their four files in either commit.
4. **Agent.** A conditioned tape re-recorded and compared byte for byte against one recorded at your starting tip.
5. **Agent.** A batch on twelve seeds, event counts identical to a batch at your starting tip, per seed.
6. **Agent.** Replay determinism on one seed under `shaky-short`.
7. **Agent.** The fences green, each named by test title.
8. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
9. **There is no Mark actor in this slice.** Nothing here is a feel question and nothing on this tip is for him to play.

### State of the branch

- The tip should be slice 1's docs commit. **Read the four constants off the tree yourself and say what you read**, because a slice may land between this line and you.
- **You are permitted no version move of any kind and no `GOLDEN` re-pin.** The step's whole ledger holds one move and it is slice 6's.
- **Slice 3 follows you** and declares the tuning record itself. It adds no field to your record; slice 4 does that.
- The headless browser draws at 3 to 21 FPS under SwiftShader, so nothing in this slice is checked by screenshot and none of it needs to be.

### The stuck rule

**Four things are already known to be a stop:** any version constant or `GOLDEN` moving; `digest.ts` appearing in either commit; a magnitude changing anywhere; and an event count that moved on your own twelve seeds. **And four things are ruled rather than open:** the seed stays first, the record's five fields are required and the parameter is a `Partial` of it, `rigOf` and the uniqueness key do not move, and `TapeHeader` is not touched. **A measurement arguing any of the four should move is a finding for the note, never a row you move here.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **The tuning record.** It does not exist at your tip and you add no field for it. Slice 3 declares it and slice 4 puts it on the record you build.
- **The caps.** They stay module constants derived at import, exactly as they are. Slice 4 moves them.
- **The tape header**, slice 6's, and the `FORMAT_VERSION` bump with it.
- **Widening `rigOf`**, slice 6's, once the header can carry the whole record.
- **Any ADR.** The orchestrator files and amends all of them.
- **The docs debts in the handoff's open item 7**, the branch close pass's.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**

---

## Slice 3 (A): the tuning record exists and nothing reads it (#142)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#142)`.

Slice 3 of the tuning-record step, and it is the draft's slice A unchanged. **Today every authored magnitude is a compiled constant, so moving one costs a coder, a review and a deploy** (draft section 1). This slice declares the record that stops being true, and it declares nothing else: **no reader takes it, `createRun` does not see it, and the caps still derive at import exactly as they do now.** Its whole promise is that the default record is value-identical to the compiled constants, **and that is a test rather than a claim.**

**The standing rules are in `docs/push/step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice 3.

**Its progress-note entry is section 8**, appended to `step-6-progress.md`.

**Six rulings shape this slice and none of them is yours to revisit.**

**First: the rows are exactly the ten named in this file's header, and you add none.** Ruling 1's rule decides eligibility; what this step carries is the rows the first sweep names. **The stage group: `PROCESSION_PURSE`, `CROWD_PURSE`, `VIGIL_PURSE`, `QUIET_INTERVAL_MINIMUM_SECONDS`, all in `src/game/stage/waves.ts`, and `stage.quietIntervalMaximumSeconds`, whose value is `QUIET_MAX_TICKS` in `src/game/director.ts` read in seconds, 8. The score group: `TRASH_KILL_SCORE`, `SCORE_BLEED_CAP`, `SCORE_PER_BOSS_HEALTH`, `SOURCE_KILL_SCORE`, `MEAL_AT_MAXED_SCORE`, all in `src/game/tuning.ts`.** An eleventh row is a stop and report, however obviously eligible it looks: a row nothing reads is worse than no row, because a candidate could move it and nothing would change.

**Second: grouped in the type, dotted on every text surface (ruling 2).** The record is one typed object nested by group, so each group's numbers sit beside their own JSDoc and the caps derivation reads one group. **The dotted path is the one addressable name a command line, a tape header, a report and a comparison all use, and it is derived from the nesting and never hand-maintained**: a function walks the record and answers its rows as name and value pairs. **The group names are `stage` and `score`**, which is ruling 2's own example form (`grave.sizeFloor`): the group is the concept that owns the number, which is the module where the module is the concept.

**Third: the rows keep the form their constants have, which is what makes the default identical by arithmetic.** Four of the five score constants are stated as multiples of `TRASH_KILL_SCORE` on purpose, and their JSDoc says why: "the sentence a flat cap exists to make sayable is 'a hit at the floor costs you twenty kills' and a bare two thousand says nothing about the income it comes out of". **So the record holds the multiplier, not the product**: the kill's own unit, the cap in kills, the boss health one kill is worth, the source kill in kills, the meal in kills. **Each reader does the same arithmetic it does today, off the record's row instead of off the constant**, and the resolved default therefore equals today's value by arithmetic rather than by a second copy of a number. **At this tip every row is a second spelling of its constant, held equal by the identity test and nothing else; the arithmetic claim covers only the four derived score constants, and the duplicate lives until the slice that retires the constants retires this test beside them.** **A row that restates a product is a stop**, because two spellings of one figure is the defect the whole record exists to remove.

**Fourth: the record's module imports nothing and nobody imports it from inside the core.** `src/game/tuningRecord.ts` is the recommendation and the concept is the ruling. It is the `signalLock.ts` shape: a type and a resolver the sim, the header and playback can each own without any of them importing a consumer. **Readers take the record as an argument and never import it** because ruling 7's fence says the core reads tuning only off the run, and because the module importing nothing is what lets `tuning.ts` and `waves.ts` later read their defaults from it without a cycle. **`KNOWN_CORE_CYCLES` stays empty and you prove it by running the guard.**

**Fifth: the resolver takes a partial, answers a complete record, and asserts exactly one bound.** `resolveTuning(partial)` fills every absent row from the default, group by group, **then asserts that `stage.quietIntervalMinimumSeconds` sits at or below `stage.quietIntervalMaximumSeconds` and rejects a record failing it with both rows named.** Both ends are rows, so the assertion imports nothing, and **every record in the tree enters through here**, which is why the bound lives in the resolver rather than in slice 7's table: a table catches the rows somebody committed, while a tape header replaying under its own values would reach `stream.nextInt` with a negative span. **That is the whole of what the resolver refuses**, and a record our own code produced cannot fail it. **Parsing a raw name a person typed is the edge's job and not this module's** (slice 7), so this function's input is already typed: it is `Partial` over the record's own shape, and there is no such thing as an unknown row reaching it. **A `Partial` over a nested record needs a written overlay interface per group (for example `stage?: Partial<StageTuning>`), which you shape**, and never a `Type & { extra }` intersection. **Repair by origin is why**: values our own code produced are never repaired, because a bad one is a bug.

**Sixth: no magnitude moves and `GOLDEN` is not re-pinned.** Nothing in this slice runs at all: no production code path reads the record. `digest.ts` is in neither commit.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. **The six dispatch contract items are the sections below.**
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`. **The cited-future rule binds this slice directly**: every row you declare has a caller in slice 4 or slice 5 and the design record is its citation, and a row with neither is a row you do not write.
3. `apps/hungry-grave/docs/push/drafts/step-5-tuning-record-draft.md`, **sections 2a rulings 1, 2 and 7, then section 3 and section 6's test sentences.**
4. `apps/hungry-grave/CONTEXT.md`, the **Tuning record**, **Candidate** and **Starting condition** entries slice 1 wrote, and **Rig**, **Configuration**, **Reading** and **Batch** beside them. Your type's name and your rows' names are checked against those entries.
5. **ADR 0064**, a tuning magnitude is a row of one record resolved at the shell, which is this slice's own decision. **Read it and name it in the note.** If it is not at your tip, that is a stop and report.
6. The tree, by name and never by line: **`src/game/tuning.ts` whole**, 293 lines, and the five score constants' JSDoc above all, **because that JSDoc is where each row's annotation comes from and it is not rewritten from scratch**; `src/game/stage/waves.ts`'s `PROCESSION_PURSE`, `CROWD_PURSE`, `VIGIL_PURSE` and `QUIET_INTERVAL_MINIMUM_SECONDS` with their JSDoc, found by name; `src/game/director.ts`'s `QUIET_MIN_TICKS`, `QUIET_MAX_TICKS` and the draw between them, **read and not edited**; `src/game/signalLock.ts` **whole**, which is the module shape you copy; `src/game/caps.ts`'s imports and `peakLive`, **read and not edited**.
7. The tests: `src/__tests__/boundary.test.ts`'s `BOUNDARIES` table and its core cycle guard, `src/game/__tests__/tuning.test.ts` **whole**, which is what a test over declared magnitudes looks like here, and `src/game/__tests__/digest.test.ts`, green and untouched.

**Check the worktree is clean before your first edit and report what you find.** Anything uncommitted under `src/` is a stop and report.

### The definition, in observable terms

After this slice the tree holds one typed record naming ten magnitudes in two groups, a resolved default, a resolver that completes a partial and asserts the quiet interval's own bound, and a function that answers the record's rows as dotted names and values. **A test asserts, row by row, that the default record equals the compiled constant it names**, so the claim that nothing moved is checkable rather than asserted. **Every row is a second spelling of its constant at this tip**, held equal by that test and nothing else, and the duplicate lives until the slice that retires the constants retires the test beside them. **Nothing reads the record**: the game plays exactly as it played, every constant is still exported and still read by everything that read it, and the record is a value the build compiles and nothing calls.

**Nothing a player meets changes.** `WITNESS_VERSION` reads 11, `READINGS_VERSION` reads 9, `FORMAT_VERSION` reads 4, `GOLDEN` holds at `-2049717150` with `score: 200`, and `pnpm verify` is green.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step6/` under a name carrying `arecord`. **Slice 2's two commits must both be in the tree.** Anything dirty under `src/` is a stop.

**(b) The tests first, red.** The value-identity tests before the default, the resolver's tests before the resolver, the dotted-name test before the walk. **A default written before the test that pins it to the constants is a default nobody checked.**

**(c) The type**, two groups, ten rows, each row carrying a one-line JSDoc that says what the number is and, where its constant's own JSDoc says so, that it is a first figure and what it is read against. **The annotations are moved from the constants' JSDoc rather than invented**, and the constants keep theirs: slice 4 and slice 5 decide what happens to each one, and this slice moves no comment out of a file it is not otherwise editing.

**(d) The default and the resolver.** The default is the ten values as their constants state them, in the same multiplier form, the quiet interval's maximum read off `QUIET_MAX_TICKS` in seconds. The resolver completes a partial group by group and asserts the interval's bound.

**(e) The dotted rows.** One function, walking the record's own nesting, answering `stage.processionPurse` and the rest with their values. **Hand-maintained name lists are a stop.**

**(f) The value-identity test, which is the slice's whole promise.** One assertion per row against the constant it names, importing both; the tenth reads `QUIET_MAX_TICKS` off `director.ts` in seconds, which is the one row whose constant lives in neither `tuning.ts` nor `waves.ts`. **Ten assertions and no loop over a hand-written pairing**, because a loop over a list somebody typed proves the list and not the values.

**(g) The fences.** Run every one by title and name them in the note, plus the core cycle guard with `KNOWN_CORE_CYCLES` still empty. **The new module imports nothing, guarded by a sibling of `boundary.test.ts`'s `the lock's module imports nothing`, named for the tuning record**; the `game` row's `mayImport: []` forbids package imports only and does not cover a sibling import.

**(h) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the tuning record declares ten magnitudes and resolves to the values the build compiles (#142)`. Then the docs commit, carrying the progress note.

**(i) The progress note**, section **8**. Beyond the contract's list, say: the module's final name and the type's; the ten rows with their dotted names and their default values; the resolver's bound and the words it rejects with; **the eligible magnitudes you did not carry, listed by name**, which is the next round's own work and is recorded here so nobody rediscovers it as a gap; anything in the draft or in this file you found false against the tree; and the four constants and `GOLDEN` all named as read off your own tip.

**(j) Stop and report.** Under 250 words. **Do not start slice 4.** **This slice's tip is not a deploy.**

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 4 and `GOLDEN` at `-2049717150`.** None moves and none of their four files is in either commit.
- **Every constant this slice names.** `tuning.ts`, `waves.ts` and `director.ts` keep every export, every value and every reader they have. **The only edit permitted in any of the three is none**, and if you believe one is needed, that is a stop and report.
- **`createRun`, `RunState` and `StartingConditions`.** Slice 4 puts the record on them and you do not touch them at all.
- **The caps.** Still module constants, still derived at import, still exported from `caps.ts` unchanged.
- **Every existing invariant's meaning and severity, the fault identity list, `STREAM_SALTS` and `STREAM_ORDER`.**
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty.
- **No test is deleted, skipped, weakened or rewritten to reach green.**

### Seams under test

`src/game/tuningRecord.ts`: the default record, asserted row by row against the constants the build compiles; the resolver completing a partial, one row named and every other at its default; the dotted-name walk answering the record's own nesting. **Nothing else has a seam in this slice, because nothing else changes.**

### Module boundaries

**One file is created and the only file edited is `src/__tests__/boundary.test.ts`, which gains the sibling fence; none is deleted, merged or split.** `src/game/tuningRecord.ts` owns one concept, the numbers a batch reading can move, and every export serves it: the type, the default, the resolver and the row walk. **It imports nothing**, which is what keeps it usable by the sim, the tape edge and playback alike without any of them importing a consumer, and it is the reason readers take it as an argument in slices 4 and 5 rather than importing it. **Its public interface reads in one `export` block at the module's end.** Its tests live in `src/game/__tests__/tuningRecord.test.ts`, which is the test-span fence's own rule. **No new library enters.**

### The planned test list

1. *The default tuning record holds exactly the values the build was compiled with*, one assertion per row, nine of them, each against the constant it names.
2. *A partial naming one row leaves every other row at its default*, one case per group.
3. *A partial naming no row at all answers the default record*, which is what an unnamed candidate resolves to.
4. *A partial naming one group leaves the other group whole.*
5. *The record's rows read as dotted names*, all nine, derived from the nesting.
6. *The resolved record is complete*, so nothing downstream ever handles an absent row.
7. *A record whose quiet-interval minimum sits above its maximum is rejected by the resolver*, both rows named in the rejection, and the default record passes the bound.
8. **The fences**, green, each by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty and the new sibling fence naming the record's own module.
9. **The golden digest**, green and unmoved, with `digest.ts` in neither commit.

**What this slice is expected to turn red.** Nothing at all, which is itself the claim to check. **A realistic count is 2 to 3 files.** Anything red anywhere is a reason to stop and read what you reached into, because a module nothing imports cannot change a behaviour.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit. **Added only, removed zero.**
3. **Agent.** The four version constants and `GOLDEN`, each read off the tree and named as held, none of their files in either commit.
4. **Agent.** Replay determinism at your tip, one seed under `shaky-short`.
5. **Agent.** The fences green, each named by test title, and the core cycle guard.
6. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
7. **There is no Mark actor in this slice.**

### State of the branch

- The tip should be slice 2's docs commit. **Read the four constants off the tree yourself and say what you read.**
- **You are permitted no version move of any kind and no `GOLDEN` re-pin.**
- **Slice 4 follows you** and is the first consumer: it puts your record on the starting conditions and derives the three caps from your stage group.

### The stuck rule

**Four things are already known to be a stop:** an eleventh row; a row restating a product instead of its multiplier; any edit to `tuning.ts`, `waves.ts` or `director.ts`; and the cycle guard gaining an entry. **And three things are ruled rather than open:** the ten rows, the two group names, and the record importing nothing. **A gate finding or a measurement arguing against any of them is filed in the note, never applied.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **Any reader.** Nothing reads the record at your tip and nothing may, which is the slice's whole definition.
- **The caps**, slice 4's, and **the remaining readers**, slice 5's.
- **The candidates and the parsers**, slice 7's. The resolver refuses nothing because nothing raw reaches it yet.
- **The header**, slice 6's, and the `FORMAT_VERSION` bump with it.
- **Adding the rest of the eligible magnitudes.** You name them in the note and you carry none of them.
- **Any ADR.** The orchestrator files and amends all of them.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**

---

## Slice 4 (B1): the record reaches the run, and the three caps are derived per run from it (#142)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#142)`.

Slice 4 of the tuning-record step, and it is the harder half of the draft's slice B. **Ruling 3 rules it in one sentence: the caps become per-run derivations computed inside `createRun` from the run's own record, carried on `RunState`, and every reader that read the module constant reads the run's field.** The reason is arithmetic rather than taste: `createRun` builds every pool at its cap in the same call, from module constants evaluated at import, so if a magnitude the caps derive from is resolvable at run start then `MOB_CAP` cannot be a `const`. **The one alternative, sizing pools at a worst case over any legal record, cannot be bounded, because a legal record is open.** Per run is what the pools already are: built in `createRun`, at a cap, once.

**This is the slice with the blast radius, and step 4's slice A is the warning: a slice touching a table every other module reads landed 19 files where its own table said five.** Read the file list below before you believe any number in it.

**The standing rules are in `docs/push/step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice 4.

**Its progress-note entry is section 9**, appended to `step-6-progress.md`.

**Eight rulings shape this slice and none of them is yours to revisit.**

**First: no value moves and `GOLDEN` is not re-pinned (ruling 3 and ruling 7).** The default record is value-identical to the constants, so every cap derives to exactly the number it is today and the golden's run is the same run. **`digest.ts` is in neither commit and a re-pin is a stop and report**, because a re-pin would mean a value moved.

**Second: the record rides on the starting conditions.** `StartingConditions` gains one `tuning` field, **optional in the `Partial` a caller passes and required on the resolved record**, resolving to the default inside `createRun` the way every other field resolves (ADR 0027's own rule about a resolved value, applied to a starting condition). **`RunState` carries the resolved record as a readonly field and nothing writes it after the first tick.** **`src/game/__tests__/witness.test.ts`'s `fieldPaths` walks a live fixture, so every new `RunState` field, the `tuning` record's ten paths and the three caps, is listed in `EXCLUDED` with its reason on `signalLock`'s precedent; `WITNESS_VERSION` does not move because nothing folded changed.**

**Third: the caps become functions of the record and the run carries their answers.** `caps.ts`'s `MOB_CAP`, `MOB_FIRE_CAP` and `CORPSE_CAP` stop being constants and become named derivations taking the record: **all three read `stage.quietIntervalMinimumSeconds` through `directedInside`, the mob-fire cap through its revenant director term (`REVENANT_FIRE_PEAK` in `caps.ts`), so all three take the record.** `RunState` carries the three answers in one readonly group beside the pools, and **every reader that read a module constant reads the run's field.**

**Fourth: `stormTargets`' scratch does not move onto `RunState`, and this ruling reverses the drafter.** `SLOTS` is a module-level array sized `MOB_CAP + 2`, allocated at import, and `scripts/frameBudgetCaps.ts`'s own JSDoc names it as the reason the bench raises its ceiling before the game is imported at all. **It stays a module-level grow-only scratch, declared empty at import and sized to `state.mobs.length + 2` on first use**, which satisfies no-import-time-side-effects and per-run sizing without dragging sixteen handle paths into the witness partition. **`frameBudgetCaps.ts`'s sentence goes false the moment you do it and is rewritten in the same commit**, which is what step 5's slice 8 did to `rigs.ts`'s own comment.

**Fifth: the frame-budget bench aliases the derivations, not the constants.** `scripts/frameBudgetCaps.ts` exists so a synthetic field can stand at a size the shipped caps refuse, and it does it today with two `let` bindings and a named `sizePoolsFor`. **It keeps its concept and its named setup function exactly**; what changes is that it aliases the cap derivations rather than two numbers, so a bench run's caps are the bench's and a game run's are the record's. **The shim exports every name `caps.ts` exports**, because the vite alias resolves at runtime and a missing export is `undefined` rather than a type error. **`FrameBudgetScreen.ts`'s two comparisons and its message read the run's caps** rather than the module's.

**Sixth: the invariant harness reads the run's caps.** `invariants.ts`'s three `checkPool` calls take the run's own numbers. **Every check keeps its meaning and its severity and every fault identity keeps its wire number**, which is the contract's rule and ADR 0024's.

**Seventh: the renderer grows its pools to the run's caps.** The renderer has no run in hand when it builds: `FieldRenderer.attach(layers)` calls `build()` with no run, and all three screens reuse one renderer across runs, so after slice 6 a replayed tape can derive caps the first run did not. **`attach` takes the run's caps and grows the four sprite pools to them on every attach; `fill` is already grow-only, and the `built` guard covers the dim and the scatters, never the pool sizes.** **This is a screen and it is the one place in this slice where a player could meet a difference**, so the check is that it cannot: the default record gives the same numbers, and the built app draws the same field. **Anything else is a stop and report.**

**Eighth: the fence ruling 7 names is added here.** A new fence, in `boundary.test.ts` beside the cap derivation's own fence from step 4's slice D, asserting that **the caps derivation and the core read the record only off the run and never through a shell import**. The neighbouring fence, *the cap derivation reads tables and never the stage*, is the shape and the home.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. **The six dispatch contract items are the sections below.**
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`.
3. `apps/hungry-grave/docs/push/drafts/step-5-tuning-record-draft.md`, **section 2 decision 3's second half and section 2a rulings 3 and 7 in full**, then section 5.
4. **ADR 0056 as the orchestrator amended it for this step**, which is the record that makes the caps derivations of the content, **ADR 0064** for the tuning record carried on the run and **ADR 0063** for the starting condition it rides on. Read all three and name them in the note. **If any is missing at your tip, that is a stop and report.**
5. `apps/hungry-grave/docs/push/step-6-progress.md`, **section 8**, which lists the ten rows slice 3 declared and their dotted names.
6. The tree, by name and never by line: `src/game/caps.ts` **whole**, 323 lines, **and its two opening JSDoc paragraphs above all, which say what a cap is and is not and which are the voice your derivations' own JSDoc keeps**; `src/game/run.ts`'s `createRun`, `RunState` and `StartingConditions`; `src/game/stormTargets.ts`'s `SLOTS`, `LIVE`, `slotAt` and their JSDoc; `src/game/mobs.ts`'s `createMobPool`, `src/game/corpses.ts`'s pool builder and `src/game/mobFire.ts`'s; `src/game/invariants.ts`'s three `checkPool` calls; `src/app/screens/game/FieldRenderer.ts`'s pool fill and its per-frame comment; `src/app/screens/FrameBudgetScreen.ts`; `scripts/frameBudgetCaps.ts` **whole**, 60 lines, **including its JSDoc, which is the sentence that goes false**; `src/game/tuningRecord.ts`, slice 3's.
7. The tests: `src/game/__tests__/caps.test.ts` **whole**, `src/game/__tests__/invariants.test.ts`, `src/game/__tests__/run.test.ts`, `src/__tests__/boundary.test.ts`'s `BOUNDARIES` table, its core cycle guard and **the cap derivation's own fence, which is where yours goes**, and `src/game/__tests__/digest.test.ts`, green and untouched.

**Check the worktree is clean before your first edit and report what you find.** Anything uncommitted under `src/` is a stop and report.

### The definition, in observable terms

After this slice a run carries the tuning record it started under and the three caps it derived from it. A caller that names no record gets the default and therefore the same three numbers the build has today. **A run started under a record with a different quiet interval derives different caps and builds differently sized pools**, which is a thing a test can state and which nothing in the tree can state today. **No module-level cap constant is read by any pool, any check, any renderer or any screen**, and the scratch array the storm targets refill allocates nothing at import and grows to the live mob count plus two on first use.

**Nothing a player meets changes.** The same seed plays the same run, the built app draws the same field, `GOLDEN` holds at `-2049717150` with `score: 200`, `WITNESS_VERSION` reads 11, `READINGS_VERSION` reads 9, `FORMAT_VERSION` reads 4, and a batch on twelve seeds runs the identical event sequence.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step6/` under a name carrying `b1caps`. **A batch on twelve seeds under one configuration at the birthright rig, played at your starting tip before your first edit**, whose event counts you compare against at the end. **Slice 3's two commits must both be in the tree.** Anything dirty under `src/` is a stop.

**(b) The tests first, red.** The cap derivations' own tests before the derivations, the run's caps before `createRun` computes them, and the fence before the import it forbids exists to be forbidden.

**(c) The record on the starting conditions and on the run.** One optional field in, one readonly field out, resolved in `createRun`.

**(d) The three derivations.** Named functions in `caps.ts` taking what they need and nothing more. **Each keeps its existing JSDoc**, which is a proof rather than an estimate in the corpse cap's case and which stays true word for word because the arithmetic does not change.

**(e) The caps onto the run, and every reader.** The pools, the three `checkPool` calls, the renderer's four sprite pools, the frame-budget screen's two comparisons and its message. **Name every file you touched in the note and say whether the list below was right.**

**(f) The scratch array, staying where it is.** `SLOTS` declared empty at import and grown to `state.mobs.length + 2` on first use, with `slotAt`'s own JSDoc rewritten to say where the size comes from now. **`frameBudgetCaps.ts`'s JSDoc sentence about raising the ceiling before the game is imported is rewritten in the same commit.**

**(g) The bench.** `frameBudgetCaps.ts` aliases the derivations; `sizePoolsFor` keeps its name and its "world-changing setup is named" shape. **Run the frame-budget instrument once and say it still stands a field it could stand before**, or, if it cannot be run cheaply at your tip, say so plainly and name what you checked instead.

**(h) The new fence**, in `boundary.test.ts` beside the cap derivation's own, named for the behaviour it guards.

**(i) The measurements this slice owes.**

- **The three caps, before and after, as numbers.** Read off a default run and printed from a scratch script into the note. **They must be identical**, and a moved one is a stop and report.
- **A batch on the same twelve seeds you played in (a)**, event counts identical per seed. **This slice changes no rule, so a count that moved is a stop** rather than a finding.
- **A rendered check of the built app** through `vite preview`, with the screenshot actually read: the field draws and the pools fill. The playbook makes this mandatory for a player-visible surface and `FieldRenderer` is one.
- **Replay determinism at your tip**, one seed under `shaky-short`.
- **The four constants and `GOLDEN`**, each read off the tree and named as held, with none of their four files in either commit.

**(j) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): a run derives its own caps from the tuning record it started under (#142)`. Then the docs commit, carrying the progress note.

**(k) The progress note**, section **9**. Beyond the contract's list, say: the field count and what the list below got wrong; the three caps before and after; the scratch array's grow-on-first-use shape and the two comments that went false; what the bench looks like now and what you ran; the new fence by title; and the four constants and `GOLDEN` all named as read off your own tip.

**(l) Stop and report.** Under 250 words. **Do not start slice 5.** **This slice's tip is not a deploy**: nothing a player can meet changed, and that is the claim the rendered check tests.

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 4 and `GOLDEN` at `-2049717150` with `score: 200`.** None moves, none of their four files is in either commit, and you read all four off the tree.
- **The three caps' own numbers**, which derive to exactly what they are today.
- **`SKULL_CAP` and `WISP_CAP`**, which are safety nets with no record row and are not touched at all.
- **Every cap's JSDoc argument.** The corpse cap's proof, the mob cap's derivation and the mob-fire cap's tightness all still hold word for word, because the arithmetic does not change; a JSDoc that needs rewriting to stay true means an arithmetic change you did not intend.
- **Every existing invariant's meaning and severity, and every fault identity's wire number.**
- **Every magnitude in the tree**, `tuning.ts` and `waves.ts` untouched in this slice.
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty. **`src/game` still reaches nothing outward**, and the record is a value passed inward with no import behind it.
- **`STREAM_SALTS` and `STREAM_ORDER`.**
- **No test is deleted, skipped, weakened or rewritten to reach green.** A test that read a module cap reads the run's; its promise and its name do not move.

### Seams under test

`src/game/caps.ts`: each cap as a named derivation over the record, answering the same number for the default and a different one for a record that moves the row it reads. `src/game/run.ts`: `createRun` resolving the record, carrying it, deriving the three caps once, and building every pool at them. `src/game/stormTargets.ts`: a scratch that allocates nothing at import and grows to the live mob count plus two. `src/game/invariants.ts`: a pool check against the run's own cap. `src/app/screens/game/FieldRenderer.ts`: sprite pools filled at the run's caps. `scripts/frameBudgetCaps.ts`: the bench's own caps standing where the shipped ones would refuse.

### Module boundaries

**No file is created, deleted, merged or split.** `caps.ts` keeps its concept exactly, the entity cap policy, and what changes is that a policy is now a function of a record rather than of the module's own import-time world. `run.ts` keeps its concept, the run's identity and everything the rules mutate, and gains two readonly fields. `stormTargets.ts` keeps its concept and keeps its module-level scratch, which stops allocating at import and grows on first use, which is the direction the no-import-time-side-effects rule points. **No import direction changes**: `src/game` reaches only `src/game` and imports nothing, `src/app` and `scripts` reach inward as they already do. **No new library enters.** **The derivations are named for the whole outcome in plain words**, which the private-helper naming rule asks, and the run's cap group is a data type named for the domain noun.

### The planned test list

1. *A run started with no record derives the caps the build has today*, all three, asserted against the same derivations run over the default record.
2. *A run started under a record that moves the quiet interval derives different caps*, which nothing in the tree can say today and which is the whole point of the slice.
3. *A run's pools are built at the run's own caps*, all three, counted off the run.
4. *The storm scratch allocates nothing at import and grows to the live mob count plus two on first use*, counted off the module.
5. *The invariant harness checks a pool against the run's own cap*, not the module's.
6. *A pool that binds still raises the fault it raises today*, with its identity and severity unchanged.
7. *The three caps are still the numbers the derivations state*, which is `caps.test.ts`'s existing promise kept under the new shape.
8. **The new fence**: *the caps derivation and the core read the record off the run and never through a shell import*, by that title.
9. **The fences**, every existing one green by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
10. **The golden digest**, green and unmoved, with `digest.ts` in neither commit.

**What this slice is expected to turn red.** Every test that imports a cap constant, which is `caps.test.ts` and whatever else the grep finds. **A realistic count is 12 to 20 files**, and the honest expectation is the high end: the readers outside `caps.ts` are `corpses.ts`, `mobs.ts`, `mobFire.ts`, `stormTargets.ts`, `invariants.ts`, `run.ts`, `FieldRenderer.ts`, `FrameBudgetScreen.ts` and `frameBudgetCaps.ts`, plus their tests, and **`src/game/__tests__/witness.test.ts`**, whose `fieldPaths` walk lists every `RunState` field and reddens on the new ones. **Say in the note whether that list was right**, because step 4's slice A is the warning that it may not be.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit.
3. **Agent.** The four version constants and `GOLDEN`, each read off the tree and named as held, with none of their four files in either commit.
4. **Agent.** The three caps before and after, printed and identical.
5. **Agent.** A batch on twelve seeds, event counts identical per seed against the batch you played in step (a).
6. **Agent.** A rendered check of the built app through `vite preview`, the screenshot read.
7. **Agent.** Replay determinism on one seed under `shaky-short`.
8. **Agent.** The fences green, each named by test title, the new one included, and the core cycle guard.
9. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
10. **There is no Mark actor in this slice.** Nothing here is a feel question.

### State of the branch

- The tip should be slice 3's docs commit. **Read the four constants off the tree yourself and say what you read.**
- **You are permitted no version move of any kind and no `GOLDEN` re-pin.** The step's whole ledger holds one move and it is slice 6's.
- **Slice 5 follows you** and wires the remaining readers: the purses, the quiet interval's other reader and the five score rows.
- The headless browser draws at 3 to 21 FPS under SwiftShader, so the rendered check is a field that draws and not a timing.

### The stuck rule

**Five things are already known to be a stop:** any version constant or `GOLDEN` moving; a cap deriving to a different number; an event count that moved on your twelve seeds; a JSDoc argument in `caps.ts` that stops being true; and a fence refusing something this slice needs. **And four things are ruled rather than open:** the caps go on the run, the scratch array stays module-level and grows on first use, the bench aliases the derivations, and no magnitude moves. **A measurement arguing any of the four should move is a finding for the note, never a row you move here.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **The purses, the quiet interval's director reader and the five score rows**, all slice 5's. Your only row is the quiet interval where the caps derivation reads it.
- **The header**, slice 6's, and the `FORMAT_VERSION` bump with it. **A record on the run that no tape records is exactly the state this slice leaves**, and widening the header here is a stop.
- **The candidates and the parsers**, slice 7's. Nothing names a non-default record at your tip.
- **`SKULL_CAP` and `WISP_CAP`**, safety nets with no row.
- **The wisp-cap silence** (handoff open item 6), which is a real finding with its own trigger and is not this slice's.
- **Any ADR.** The orchestrator files and amends all of them.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**

---

## Slice 5 (B2): every admitted reader takes the record off the run (#142)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#142)`.

Slice 5 of the tuning-record step, and it is the rest of the draft's slice B. Slice 4 put the record on the run and made the caps read it; **nine of the ten rows still have a compiled constant as their only reader.** This slice finishes the wiring: the three purses, the quiet interval's minimum and maximum in the director and the five score rows each come off the run's own record, and **a fence then fails if any row ever has no reader at all.**

**The standing rules are in `docs/push/step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice 5.

**Its progress-note entry is section 10**, appended to `step-6-progress.md`.

**Seven rulings shape this slice and none of them is yours to revisit.**

**First: no value moves, no rule of the game moves, and `GOLDEN` is not re-pinned.** The default record equals every constant, so every payment, every purse grant and every quiet interval is the number it is today. **`director.purseLeft` is folded into the witness**, so a purse that moved would move the golden's checksum; it does not, and a re-pin is a stop and report.

**Second: the readers are these and no others.** `src/game/grave.ts`'s bleed (`score.bleedCapInKills`), `src/game/mobs.ts`'s kill payment and the four `scorePayout` rows in `MOB_TYPES` (`score.trashKill`), `src/game/bosses/phases.ts`'s per-hit boss payment (`score.bossHealthPerKill`), `src/game/stage/setPiece.ts`'s source kill (`score.sourceKillInKills`), `src/game/swallow.ts`'s meal at a maxed ladder (`score.mealAtMaxedInKills`), `src/game/stage/stage.ts`'s purse grant (`stage.processionPurse`, `stage.crowdPurse`, `stage.vigilPurse`) and `src/game/director.ts`'s quiet interval, both ends of it (`stage.quietIntervalMinimumSeconds` and `stage.quietIntervalMaximumSeconds`). **A reader this list does not name is a stop and report**, not a quiet extra edit.

**Third: `MOB_TYPES` is the delicate one and its rows stay in its own file.** The four `scorePayout` figures are stated as multiples of `TRASH_KILL_SCORE` and the table is a mob type's own stats, which `tuning.ts`'s own opening comment says is deliberately not this file's business. **`MOB_TYPES` is eligible for the record and is not carried in this step** (this file's header says so), so the table keeps its four rows and their multipliers where they are; what changes is how a row spells its multiplier and that the multiplier is applied against the run's kill unit rather than the module's. **The seam is where a kill pays**, not where the table is declared: `payKill` reads the run's record and the row's multiplier. **The four rows restate as bare multiples of the kill unit, `scorePayoutInKills` 1, 8, 2, 1, and the kill pays `row.scorePayoutInKills * tuning.score.trashKill`; the products do not move, so this is a spelling change and not a table change.**

**Fourth: the purse comes off the record at the grant and `Section.purse` becomes the row it names.** `directorGranted` is the one place a purse is read (`stage.ts`), the section table is authored content rather than a magnitude, and a purse figure in both places is two spellings of one fact. **`Section.purse` becomes the record row it names, `'processionPurse' | 'crowdPurse' | 'vigilPurse' | null`; `directorSpend`'s null check keeps its meaning, and the grant reads `tuning.stage[section.purse]`, granting nothing on null**, which is ADR 0056's own rule and is the behaviour that must not move: a section with no purse grants nothing rather than carrying the last section's over. **`SECTIONS` has five importers outside `stage.ts`** (`harnessRun.ts`, `batchReport.ts`, `BackgroundRenderer.ts`, `sectionTimeline.ts`, `arrivals.ts`) and none of them reads `purse`; **check that yourself rather than trusting this sentence**, and if one does, that is a stop and report. **`director.test.ts` reads `.purse` at two sites and goes red**, and it asserts the row the section names rather than the figure.

**Fifth: every admitted constant retires and no second spelling survives.** `src/dev/rigs.ts` reads `SCORE_BLEED_CAP` for the ladder row's starting score, which is a harness starting condition resolved off the default and not off a run. **It reads the ladder's score off the default tuning record instead (`src/dev` may reach `src/game`), so `SCORE_BLEED_CAP` retires with the others and no second spelling survives.** **A constant no longer read by anything is deleted in the same commit**, because a constant nothing reads is the second spelling this step exists to remove; say in the note which ones went and where each last reader moved to.

**Sixth: the no-dead-row fence is added here.** A cross-cutting guard in its own file, named for the behaviour it guards, failing if a row of the default record has no reader in production code under `src/game` outside the record's own module. **`boundary.test.ts`'s own source-walking technique is the shape**; it is what makes "a row nothing reads is worse than no row" a rule the tree holds rather than a sentence in a prompt. **Readers spell the row's leaf name at the site, as a property or as a string literal, never destructured, because the fence reads source for that name.** **If your reading finds a truer mechanism, take it and say why in the note.**

**Seventh: nothing abnormal is ever silent, and there is nothing abnormal here.** No repair, no recovery, no containment: the record is complete by the time it reaches any reader, because the resolver completed it in `createRun`. **A reader defending against a missing row is a reader that does not trust the type, and the type is the proof** (parse at the edge).

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. **The six dispatch contract items are the sections below.**
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`. **"Parse at the edge" and "the interface is the test surface" both bind this slice directly.**
3. `apps/hungry-grave/docs/push/drafts/step-5-tuning-record-draft.md`, **sections 2a rulings 1, 2 and 3, then section 5 and section 6's test sentences.**
4. **ADR 0064**, a tuning magnitude is a row of one record resolved at the shell, and **ADR 0056 as amended**, for the purse and the quiet interval. Read both and name both in the note.
5. `apps/hungry-grave/docs/push/step-6-progress.md`, **sections 8 and 9**: the ten rows and their dotted names, and what slice 4 left you.
6. The tree, by name and never by line: `src/game/tuning.ts`'s five score constants **and their JSDoc whole**, which is where each row's annotation already lives; `src/game/grave.ts`'s bleed; `src/game/mobs.ts`'s `MOB_TYPES` and the kill payment; `src/game/bosses/phases.ts`'s per-hit payment; `src/game/stage/setPiece.ts`'s source kill; `src/game/swallow.ts`'s meal payment; `src/game/stage/stage.ts`'s `SECTIONS`, `Section`, `directorGranted` and `grantPurse`; `src/game/director.ts`'s quiet interval; `src/game/stage/waves.ts`'s three purses and the quiet interval with their JSDoc; `src/game/witness.ts` where `director.purseLeft` folds, **read and not edited**; `src/dev/rigs.ts`, whose ladder row moves to the default record.
7. The tests: `src/game/__tests__/grave.test.ts`'s ladder and bleed blocks, `src/game/__tests__/scorePayments.test.ts` **whole**, `src/game/__tests__/mobs.test.ts`, `src/game/__tests__/director.test.ts`, `src/game/__tests__/swallow.test.ts`, `src/__tests__/boundary.test.ts`'s `BOUNDARIES`, the cap fences and the core cycle guard, and `src/game/__tests__/digest.test.ts`, green and untouched.

**Check the worktree is clean before your first edit and report what you find.** Anything uncommitted under `src/` is a stop and report.

### The definition, in observable terms

After this slice every one of the ten rows has a reader, and a run started under a record that moves a row plays differently in the way that row predicts: **a smaller Procession purse leaves the director less to spend and the section runs at its authored floor sooner; a larger bleed cap takes more of the score on a floor hit; a larger kill unit pays more per body and moves every multiple with it.** A run started under no record plays exactly the run it plays today, which is the same claim slices 2, 3 and 4 made and is checked the same way. **No constant this step admits is read by two spellings**, and a row with no reader fails a fence.

**Nothing a player meets changes.** The same seed plays the same run, `GOLDEN` holds at `-2049717150` with `score: 200`, `WITNESS_VERSION` reads 11, `READINGS_VERSION` reads 9, `FORMAT_VERSION` reads 4, and a batch on twelve seeds runs the identical event sequence.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, a batch on twelve seeds at your starting tip, and your own test-name baseline into `local/step6/` under a name carrying `b2readers`. **Slice 4's two commits must both be in the tree.** Anything dirty under `src/` is a stop.

**(b) The tests first, red.** One per row, each stating the direction that row predicts, before the reader it tests. **A test written after the wiring is a test shaped by the wiring.**

**(c) The score group's five readers**, each taking the run's record and doing the arithmetic its constant does today.

**(d) The purse.** The record's stage group at the grant, `Section.purse` restated as the row it names, `SECTIONS`' five outside importers checked and reported.

**(e) The quiet interval's two director readers**, both off the run's record: `QUIET_MIN_TICKS` and `QUIET_MAX_TICKS` each become a function of the record, the maximum off `stage.quietIntervalMaximumSeconds` rather than the 8 s authored in `director.ts`, so the draw's span is the run's own and the resolver's bound is what keeps it positive.

**(f) The constants.** Delete the ones nothing reads any more, keep the ones something outside the core still does, and say which is which and why.

**(g) The no-dead-row fence**, in its own file, named for the behaviour it guards.

**(h) The measurements this slice owes.**

- **A batch on the same twelve seeds you played in (a)**, event counts identical per seed. **A count that moved is a stop and report.**
- **One candidate-shaped probe per group, off a scratch script and never committed**: a run built by hand with a record that halves the Procession purse, and one that doubles the bleed cap, each played far enough to show the direction its row predicts, with the numbers pasted into the note. **This is the first evidence in the whole step that the record does anything at all**, and it is the thing the next slices are built on.
- **Replay determinism at your tip**, one seed under `shaky-short`.
- **The four constants and `GOLDEN`**, each read off the tree and named as held, with none of their four files in either commit.

**(i) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): the purses, the quiet interval and the score's five rows are read off the run's tuning record (#142)`. Then the docs commit, carrying the progress note.

**(j) The progress note**, section **10**. Beyond the contract's list, say: every reader wired, by file and by row; the constants deleted and where each last reader moved to; `Section.purse`'s new type and the five `SECTIONS` importers checked; the fence by title and the mechanism you gave it; the two probes whole; and the four constants and `GOLDEN` all named as read off your own tip.

**(k) Stop and report.** Under 250 words. **Do not start slice 6.** **This slice's tip is not a deploy.**

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 4 and `GOLDEN` at `-2049717150` with `score: 200`.** None moves, none of their four files is in either commit. **`witness.ts` is the one you will be tempted by, because the purse it folds now comes from the record**; the fold's shape does not move and the version does not either.
- **Every rule of the game.** The ladder's order, the bleed's lesser-of, the kill's payment, the boss's per-hit rate, the source's one bonus, the meal's per-item count, the purse's grant-not-carry rule and the quiet interval's meaning all keep their bodies. **What moves is where the number comes from.**
- **`MOB_TYPES`' four payouts as played, and the table's shape.** The rows restate as bare multiples of the kill unit and every product is the number it is today. The table is eligible for the record and is not carried in this step.
- **Every existing invariant's meaning and severity, and every fault identity's wire number.**
- **`rigs.ts`'s ladder row's own value**, which reads the same number off the default record that it reads off the constant today; the row's starting score does not move and `rigs.test.ts` keeps its promise.
- **The three caps and their derivations**, slice 4's, unchanged here.
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty. **`src/game` still reaches nothing outward**, and no reader imports the record module.
- **No test is deleted, skipped, weakened or rewritten to reach green.**

### Seams under test

`src/game/grave.ts`: a floor hit bleeding the run's own cap. `src/game/mobs.ts`: a kill paying the run's own unit times the row's multiple. `src/game/bosses/phases.ts`: a hit on a boss paying the run's own rate. `src/game/stage/setPiece.ts`: the source's kill paying the run's own bonus. `src/game/swallow.ts`: a rich meal at a maxed ladder paying the run's own row. `src/game/stage/stage.ts`: a section's grant taking the run's own purse, and a section with none granting nothing. `src/game/director.ts`: the quiet interval drawn between the run's own floor and its own ceiling. **The new guard**: every row of the record has a reader.

### Module boundaries

**One file is created, the fence, and none is deleted, merged or split.** The guard is a cross-cutting rule and therefore its own file named for the behaviour it guards, which is the rules' own pyramid-layer instruction. **No import direction changes** and **no module gains an import of the record**: every reader takes it as an argument off the run, which is what keeps the cycle guard empty, since `caps.ts` already imports `waves.ts` and a record import in `waves.ts` would close the group. **`Section.purse` stops being a figure and becomes the name of the row that holds it**, which moves a magnitude out of authored content and into the record while the table keeps saying which section spends. **No new library enters.**

### The planned test list

1. *A floor hit bleeds the cap the run started under*, at two records, the default and one that moves the row.
2. *A kill pays the unit the run started under*, times the row's own multiple, for two mob types.
3. *A hit on a boss pays the rate the run started under.*
4. *Killing the Waking's source pays the bonus the run started under.*
5. *A rich meal taken at a maxed ladder pays the row the run started under.*
6. *A section grants the purse the run started under*, per section, all three.
7. *A section with no purse still grants nothing*, which is ADR 0056's rule and is the case a record keyed by section name could most easily break.
8. *The director's quiet interval is drawn between the floor and the ceiling the run started under*, both off its record.
9. *A run started under no record plays the run it plays today*, asserted where it is cheapest to assert: the same seed, the same witness at every checkpoint.
10. **The new guard**: *every row of the tuning record has a reader*, by that title.
11. **The fences**, every existing one green by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
12. **The golden digest**, green and unmoved, with `digest.ts` in neither commit.

**What this slice is expected to turn red.** Every test that asserts a payment or a purse against an imported constant, which is `scorePayments.test.ts`, `grave.test.ts`'s bleed block, `mobs.test.ts`, `director.test.ts` and `swallow.test.ts`. **A realistic count is 15 to 22 files.** A suite that reddens somewhere the wiring cannot explain is a reason to stop and read what you reached into.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit.
3. **Agent.** The four version constants and `GOLDEN`, each read off the tree and named as held, none of their four files in either commit.
4. **Agent.** A batch on twelve seeds, event counts identical per seed against the batch you played in step (a).
5. **Agent.** The two candidate-shaped probes, their numbers in the note.
6. **Agent.** Replay determinism on one seed under `shaky-short`.
7. **Agent.** The fences green, each named by test title, the new guard included, and the core cycle guard.
8. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
9. **There is no Mark actor in this slice.** The probes are mechanical and a mechanical check is never his.

### State of the branch

- The tip should be slice 4's docs commit. **Read the four constants off the tree yourself and say what you read.**
- **You are permitted no version move of any kind and no `GOLDEN` re-pin.**
- **Slice 6 follows you** and puts the whole starting-condition record into the tape header, which is the step's one `FORMAT_VERSION` move. **Your probes are the reason it has to**: a run under a moved record cannot be replayed from a header that does not carry it.

### The stuck rule

**Five things are already known to be a stop:** any version constant or `GOLDEN` moving; an event count that moved on your twelve seeds; a reader this prompt does not name; a `SECTIONS` importer that reads `purse`; and a `MOB_TYPES` payout whose product moves once the rows are bare multiples. **And four things are ruled rather than open:** the reader list, `Section.purse` becoming the row it names, every admitted constant retiring once nothing reads it, and no magnitude moving. **A measurement arguing any of the four should move is a finding for the note, never a row you move here.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **The header**, slice 6's, and the `FORMAT_VERSION` bump with it.
- **The candidates, the command line and the URL**, slice 7's. Your probes are scratch scripts and enter no commit.
- **The sweep runner and the report's identity**, slice 8's.
- **The eligible magnitudes this step does not carry**, listed in slice 3's note: `MOB_TYPES`, `BODY_COST`, `CARDS`, the section wave tables, the level curves and the rest of `tuning.ts`. **Naming one is slice 3's note's job and carrying one is a later round's.**
- **Moving any number**, which is after this branch or a later step entirely.
- **Any ADR.** The orchestrator files and amends all of them.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**

---

## Slice 6 (C): the tape header carries the whole starting condition, and the format moves 4 to 5 (#142)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#142)`.

Slice 6 of the tuning-record step, and it is the draft's slice C. **ADR 0056 named this exact trigger in its own words: the day the budget becomes something a run resolves, it is a starting value, ADR 0027 pulls it into the header, and a second bump is taken.** Slice 5 made that day arrive. **This slice is the bump, and it is the only slice in the step permitted one.**

**It closes a second gap at the same time, and that is why the block carries the whole record rather than the tuning rows alone.** The handoff's open item 5 filed it: *a `rig=ladder` batch verifies nothing*, because the header carries no starting score, so every tape from a rig that starts holding one diverges at its first checkpoint, and step 5's slice 9 had to measure conditioned ladder tapes at score zero instead. **One bump closes both**, which is what ADR 0043 means by taking a bump at the point where it is smallest.

**The standing rules are in `docs/push/step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice 6.

**Its progress-note entry is section 11**, appended to `step-6-progress.md`, **and section 2's version ledger gains this step's one filled row.**

**Eight rulings shape this slice and none of them is yours to revisit.**

**First: one block, self-describing, carrying the whole starting-condition record (ruling 5 and the orchestrator's first further ruling).** A length-prefixed block of names and values, replacing the header's four positional starting-condition fields: the starting size, the recorded roster, the starting levels and the signal lock. **The starting score joins them and so does every row of the tuning record, by its dotted name.** **The roster rides as the block's `levels.<line>` entries in the order the run fielded them, one per fielded line, so the roster is the set and order of level names and needs no entry of its own; the resolve rebuilds `recordedRoster` from them, keeping `resolveStartingLevels`' subset rule.** One block, one spelling, one reader.

**Second: the block is the recorded form of the record and never the record's own type.** `TapeHeader`'s roster is `readonly string[]` and its levels are `Record<string, number>` **precisely because the whole point is to hold what the tape said even when this build does not implement it** (ADR 0043). **The block keeps that**: names are strings and values are numbers, the set is open, and **the resolve step is the one place that asks whether this build implements what is written**, which is exactly what `resolveStartingLevels` already is and is the model your own resolve copies. **A block decoded straight into the typed record is the mistake ADR 0043 was written against.**

**Third: the refusal is precise and it is built, in these words.** A tape whose block names a row this build's record does not have, or **lacks one this build requires**, is **readable and reportable in the tape's own vocabulary and is not replayable here**. **A block whose quiet-interval minimum sits above its own maximum is refused the same way**, because the resolver slice 3 wrote rejects that record and a tape is a document: it is read, reported in the tape's words, and not replayed. A tape whose names all match **replays under the tape's own values, whatever this build's defaults are**, which is the point of carrying values at all. **The refusal is a named outcome beside the roster's own**, not a divergence discovered at a checkpoint, which is ADR 0019's rule: a replay that cannot prove it is the original run reports nothing rather than reporting wrongly. **`readHeader`'s `holdableSignal` rejection (`src/tape/records.ts`) moves into the resolve rather than being lost**: a lock this build cannot hold is refused in the same shape and never dropped quietly.

**Fourth: `FORMAT_VERSION` moves 4 to 5 in this commit and in no other, and every new field is declared in the same commit.** That is the witness-version lesson in its own shape: **stamp the version in the slice that changes the layout, because a version stamped before the layout stops moving names several layouts.** `wireCodes.ts`'s own JSDoc above the constant carries a dated paragraph per bump, and yours says what the block is, why the bump is one rather than two, and that **every format 4 tape is refused outright at the decode from here**.

**Fifth: the witness does not move and `GOLDEN` is not re-pinned.** The record is a starting condition and every consequence of it is already in the fold through live state (ruling 6). `witness.ts` and `digest.ts` are in neither commit.

**Sixth: `rigOf` widens and slice 2's deliberate narrowness ends here.** Step 5's slice 8 kept `rigOf` at two arguments and kept `rigs.test.ts`'s uniqueness key at size plus levels, **for one stated reason: a banding rule reading a fact the header cannot hold would answer null forever.** The header can hold it now. **So `rigOf` bands by the rig's own fields, size, levels and score, and never by the roster, the lock or the tuning record; the candidate is its own identity (ruling 8) and rides beside the rig, not inside it**, the uniqueness key widens to those same three, and `rigs.ts`'s own JSDoc paragraph explaining the narrowness goes false and is rewritten in the same commit. **Say in the note that you did it and why**, because it reverses a decision another slice recorded and an unexplained reversal reads as a mistake.

**Seventh: the cost is stated rather than discovered.** Every tape recorded before this commit stops decoding, tapes recorded under step 5 included. **Prove it rather than asserting it**: measure one existing tape and report the outcome it gives, the way step 5's slice 2 proved its witness move's cost. ADR 0043 says the price is paid once, deliberately, and that the cheapest moment is before the store starts filling; **the store is still dormant, which is why this is that moment** (draft ruling 10).

**Eighth: you file no ADR and amend none.** **ADR 0043's amendment, recording the header's self-describing block and `FORMAT_VERSION` 4 to 5, is the orchestrator's and is filed before you dispatch.** Read it; if it is not at your tip, that is a stop and report.

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. **The six dispatch contract items are the sections below.**
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`. **"Parse at the edge" and "repair by origin" both bind this slice directly: a tape is a document, and a document is rejected, never guessed at.**
3. **ADR 0043 as amended for this step, ADR 0019, ADR 0027 and ADR 0056 as amended.** Four records and each one answers a different half: what a self-describing block is, what the fidelity gate is, why a resolved value and never an absence, and why this bump is the trigger firing.
4. `apps/hungry-grave/docs/push/drafts/step-5-tuning-record-draft.md`, **section 2 decision 5 and section 2a ruling 5 in full**, then section 5 and section 6.
5. `apps/hungry-grave/docs/push/step-6-progress.md`, **sections 7, 8, 9 and 10**, which are the record, the conditions and the readers as the four slices before you left them.
6. `apps/hungry-grave/docs/push/handoff.md`, **open item 5**, which is the filed gap this slice closes, and **step 5's progress note section 14**, which is where slice 8 filed the header widening as a candidate rather than taking it.
7. The tree, by name and never by line: `src/tape/tape.ts`'s `TapeHeader` **whole with every field's JSDoc**, which says why each field is there and is the material your block's own JSDoc is built from; `src/tape/wireCodes.ts` **whole**, 201 lines, **and `FORMAT_VERSION`'s JSDoc above all, which is four dated paragraphs and the form yours takes**; `src/tape/encode.ts` and the decode beside it, **found by name**; `src/tape/playback.ts`'s `refusalFor`, `runFromHeader`, `resolveStartingLevels` and `PlaybackOutcome`; `src/dev/harnessRun.ts`'s `harnessHeader`; `scripts/record-conditioned.ts`'s `headerFor`; `src/dev/rigs.ts` **whole**; `src/dev/measure.ts`, for what a measured tape reports.
8. The tests: the tape codec's own tests **whole**, `src/dev/__tests__/rigs.test.ts` **whole**, `src/__tests__/boundary.test.ts`'s `BOUNDARIES` and **its own test that the tape codec parses a header without the director**, and `src/game/__tests__/digest.test.ts`, green and untouched.

**Check the worktree is clean before your first edit and report what you find.** Anything uncommitted under `src/` is a stop and report. **The build identity's dirty check counts any uncommitted file in the worktree, documentation included**, so commit or set aside every open file before you record a tape.

### The definition, in observable terms

After this slice a tape says on its own header what it was played under: its seed, its size, its roster, its levels, its signal lock, **the score it started holding**, and **every row of the tuning record it resolved**, each by name. A replay rebuilds the run from that block and from nothing this build compiled. **A tape recorded under the ladder rig replays and verifies**, which no tape from that rig can do today, and it bands as the ladder rig because `rigOf` can now see every fact the row states. **A tape naming a row this build does not have is read, reported in its own words and refused for replay with the reason named**, and a tape naming every row this build has replays under the tape's own values even where they differ from this build's defaults.

**`FORMAT_VERSION` reads 5** and every format-4 tape is refused at the decode. **`WITNESS_VERSION` reads 11, `READINGS_VERSION` reads 9, `GOLDEN` holds at `-2049717150` with `score: 200`**, and `pnpm verify` is green.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step6/` under a name carrying `cheader`. **A tape recorded at your starting tip, kept in `local/step6/`**, which is the one you measure afterwards to prove the cost. **Slice 5's two commits must both be in the tree.** Anything dirty under `src/` is a stop.

**(b) The tests first, red.** The block's round trip before the block, the refusal before the refusal path, the ladder tape's replay before the header field that makes it possible.

**(c) The block.** Encode and decode, length-prefixed, names and values, the four positional fields it replaces removed in the same commit. **Two spellings of one fact is the defect this whole step exists to remove**, so the old fields go rather than staying beside it.

**(d) `FORMAT_VERSION` 4 to 5**, with its dated JSDoc paragraph, **in this commit and nowhere else in the step.**

**(e) The resolve and the refusal.** One function asking whether this build implements what the block names, its refusal carrying the tape's own vocabulary, beside the roster's rather than folded into it. **A new `PlaybackOutcome` member if that is what the shape asks for**, which is never on the wire and therefore costs no code.

**(f) `runFromHeader`, `harnessHeader` and `headerFor`**, each building or reading the block rather than the four fields. **`harnessHeader` and `headerFor` read the run's own `conditions` field**, slice 2's resolved `StartingConditions` carried whole, rather than reassembling the condition from live state.

**(g) `rigOf` and the uniqueness key**, widened, with the JSDoc paragraph that explained the narrowness rewritten in the same commit.

**(h) The measurements this slice owes.**

- **The cost, proved.** The tape you recorded in step (a), measured at your tip, with the outcome it gives quoted in the note. **A refusal naming the format is the right answer**; a divergence at a checkpoint is a stop and report, because it means the refusal is not precise.
- **A conditioned ladder tape, recorded on the `ladder` rig at its own starting score and driven to the seal**, measured to `outcome: 'verified'`. **This is the gap closing and it is the slice's headline measurement**: step 5's slice 9 could not do it and said so in its note.
- **A hand-recorded tape at the new format**, recorded against the built app through `vite preview` and driven with `playwright-cli`, never the Playwright MCP, measured to `outcome: 'verified'`.
- **A batch on twelve seeds**, event counts identical per seed against a batch at your starting tip, **and its tapes banding to the rig they were played under.**
- **Replay determinism at your tip**, one seed under `shaky-short`.
- **The other three constants and `GOLDEN`**, each read off the tree and named as held, with `witness.ts`, `readingsVersion.ts` and `digest.ts` in neither commit.

**(i) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): a tape header carries the whole starting condition as a self-describing block (#142)`. Then the docs commit, carrying the progress note.

**(j) The progress note**, section **11**, **and section 2's ledger row**. Beyond the contract's list, say: the block's shape and the four fields it replaced; the bump's dated paragraph; the refusal's exact wording and the outcome name it answers with; the cost proved, with the measured tape's outcome quoted; the ladder tape verified and the gap named as closed, citing the handoff's open item 5 and step 5's note section 14; `rigOf` banding by the rig's own three fields and slice 8's narrowness reversed with the reason; and the other three constants and `GOLDEN` named as read off your own tip.

**(k) Stop and report.** Under 250 words. **Do not start slice 7.** **This slice's tip is not a deploy**, but **say plainly in your report that every tape recorded before it is now unreadable**, because that is the one thing on this tip somebody downstream needs to know.

### What must not move, and a move is a stop

- **`WITNESS_VERSION` 11, `READINGS_VERSION` 9 and `GOLDEN` at `-2049717150` with `score: 200`.** None moves, and `witness.ts`, `readingsVersion.ts` and `digest.ts` are in neither commit. **`FORMAT_VERSION` moves once, 4 to 5, and that is the whole of the step's ledger.**
- **The fold.** The record is a starting condition and every consequence of it is already folded through live state; **widening the fold is a stop and report before it is written**, not a move you take.
- **Every rule of the game and every magnitude.** This slice records what a run started under; it changes nothing a run does.
- **Every existing header field that is not one of the four replaced.** The tick rate, the checkpoint spacing, the witness version, the commit hash, the build identity, the author, the input device, the policy, the keyboard speed, the three renderer fields and `recordedAt` all keep their meaning, and the policy stays a name string and never a code byte (ADR 0043).
- **Every existing fault identity's wire number and every existing code map's entries.** The maps are append-only and read by name.
- **The three caps, their derivations and the record's ten rows.** Slices 4 and 5 own them.
- **The fences**, every one by title, including the one that says the tape codec parses a header without the director, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty. **`src/tape` still reaches only `tape` and `game`**, and never `src/dev`.
- **No test is deleted, skipped, weakened or rewritten to reach green.** A test asserting a header field asserts the block's row instead; its promise does not move.

### Seams under test

`src/tape/wireCodes.ts` and the codec: the block encoded and decoded, round trip, at every row. `src/tape/tape.ts`: `TapeHeader` carrying one starting condition rather than four fields of one. `src/tape/playback.ts`: the resolve asking whether this build implements what the block names; the refusal when it does not; `runFromHeader` rebuilding the run from the block; a replay running under the tape's own values rather than the build's defaults. `src/dev/rigs.ts`: `rigOf` banding by the rig's own fields, size, levels and score. `src/dev/harnessRun.ts` and `scripts/record-conditioned.ts`: a header written with the block.

### Module boundaries

**No file is created, deleted, merged or split**, unless the resolve earns one, in which case it goes in `src/tape/` beside `playback.ts` and owns the one concept of asking whether this build implements what a tape names. **No import direction changes**: `src/tape` reaches `tape` and `game` and nothing else, which is what lets a headless test run a tape, and it is why the resolve lives at the tape edge rather than in `src/dev`. **The block's type is the tape's vocabulary and the record's type is the game's**, and the one function between them is the only place either becomes the other. **No new library enters.**

### The planned test list

1. *A header round-trips its whole starting condition*, every field and every row, encode to decode.
2. *A run rebuilt from a header starts from the block's own values*, size, levels, roster, signal lock, score and every tuning row.
3. *A replay runs under the tape's values and not this build's defaults*, which is the case that proves the block carries values rather than a name.
4. *A tape naming a tuning row this build does not have is readable and reportable in its own vocabulary*, its header returned as recorded.
5. *The same tape is refused for replay with the reason named*, and never diverges at a checkpoint instead.
6. *A tape missing a row this build requires is refused the same way.*
7. *A tape whose quiet-interval minimum sits above its maximum is refused the same way*, the resolver's bound reported in the tape's own words.
8. *A format 4 tape is refused outright at the decode.*
9. *A tape recorded on the ladder rig replays and verifies*, which is the filed gap closing.
10. *A tape recorded on a rig bands to that rig*, `rigOf` answering off the rig's own size, levels and score.
11. *Every rig row's starting condition is still unique* under the widened key of those three.
12. **The fences**, every one green by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
13. **The golden digest**, green and unmoved, with `digest.ts` in neither commit.

**What this slice is expected to turn red.** Every test with a hand-built header and every fixture tape in the tree. **A realistic count is 10 to 16 files.** **A fixture tape that cannot be re-recorded is a stop and report, not a test you weaken**: it is evidence of the cost, and the cost is stated rather than paid quietly.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit.
3. **Agent.** `FORMAT_VERSION` read off the tree as 5, and the other three constants and `GOLDEN` read and named as held.
4. **Agent.** The pre-bump tape measured, its refusal quoted.
5. **Agent.** The conditioned ladder tape recorded on the `ladder` rig at its own score, driven to the seal, measured to `outcome: 'verified'`.
6. **Agent.** A hand-recorded tape at the new format through `vite preview`, driven with `playwright-cli`, measured to `outcome: 'verified'`.
7. **Agent.** A batch on twelve seeds, event counts identical per seed, its tapes banding to their rig.
8. **Agent.** Replay determinism on one seed under `shaky-short`.
9. **Agent.** The fences green, each named by test title.
10. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
11. **There is no Mark actor in this slice.**

### State of the branch

- The tip should be slice 5's docs commit. **Read the four constants off the tree yourself and say what you read.**
- **You are permitted exactly one version move, `FORMAT_VERSION` 4 to 5, and no `GOLDEN` re-pin and no witness move.** A fold here is a stop and report before it is written.
- **Slice 7 follows you** and names candidates on the command line and the URL. **It runs after you and not before, for a reason: a run under a named candidate that no header could carry would be a run nothing could replay**, which is the gap this slice exists to close rather than reopen.

### The stuck rule

**Five things are already known to be a stop:** the witness or `GOLDEN` moving; a fold widening; a divergence at a checkpoint where a refusal was expected; a fixture tape that cannot be re-recorded; and a second `FORMAT_VERSION` move anywhere in the commit. **And four things are ruled rather than open:** one block carrying the whole condition, the block in the tape's vocabulary rather than the record's type, the four positional fields removed rather than kept beside it, and `rigOf` banding by the rig's own three fields. **A measurement arguing any of the four should move is a finding for the note, never a row you move here.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **The candidates, the command line and the URL**, slice 7's. Nothing names a non-default record at your tip and the block carries the default just the same.
- **The sweep runner and the report's tuning identity**, slice 8's.
- **The store.** Not wired in this step (draft ruling 10), and **this bump landing before it starts filling is the whole reason the order is what it is.** Its reopening trigger is the first tuning round whose comparison needs runs from more than one machine.
- **Widening `batch.ts`'s own divergence warning**, which the handoff's open item 7 files: `batch.ts` accepts `rig=ladder` with no warning where `record-conditioned.ts` warns. **Your slice makes the warning unnecessary rather than fixing it; say so in the note.**
- **Any ADR.** The orchestrator files and amends all of them, ADR 0043's amendment included.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**

---

## Slice 7 (D): a candidate is named on the command line and on the URL (#142)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#142)`.

Slice 7 of the tuning-record step, and it is the draft's slice D. The record is on the run, every row has a reader and a tape carries the whole starting condition. **Nothing can name one yet.** This slice is the two surfaces that can: a batch plays under a named candidate, and a build Mark opens with `?tuning=` plays under the same one. **Ruling 4 rules the shape: named candidates in a table under `src/dev` on the `RIGS` model for the command line, and `?tuning=<candidate>` on the URL.** A JSON candidate file is not built: the sweep's candidates are rows, added the way a rig row is added.

**The standing rules are in `docs/push/step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice 7.

**Its progress-note entry is section 12**, appended to `step-6-progress.md`.

**Seven rulings shape this slice and none of them is yours to revisit.**

**First: a candidate is committed data with a name (ruling 4).** The name is what a batch folder and a report carry, so **the build Mark plays and the batch a finding came from name the same thing.** A candidate with no name cannot be compared by name, and the batch folder is already `<configuration>-<rig>-<recordedAt>`.

**Second: the table is `src/dev/tuningCandidates.ts` on the `rigs.ts` model, and it carries at least two rows that differ in exactly one row of the record.** `rigs.ts` is the shape whole: a `const` tuple of names, a name type over it, a row interface, the rows keyed by name, a raw-name guard at the edge, and a function answering which row a record is. **One row is `default`**, whose record is the resolved default, so a batch always names a candidate and a folder always says which, **which is the one way the bare command's folder is not today's**: it differs from today's only by the `default` segment, on the terms `birthright` is written when no `rig=` is named. **The other moves one row and it is the one number you pick in this slice**; see ruling five. **A candidate that moves `stage.quietIntervalMinimumSeconds` keeps it at or below `stage.quietIntervalMaximumSeconds`, which is a row of the record itself and authored at 8 s**, and **the resolver slice 3 wrote is what asserts that bound**, because every record enters through it; the table asserts nothing of its own.

**Third: the number you pick is a data row, annotated, and named as open.** The sweep's own first finding is that **the purses are priced above what the quiet interval lets a section spend, and the director takes three quarters of the Procession's empty ticks** (handoff, tuning-step inputs). **So the second candidate moves `stage.processionPurse` and nothing else.** Its figure is **stated against the quiet interval rather than picked**, which is what makes the candidate readable: the interval bounds how many adds a section's length allows, and a purse above what those adds can cost is a purse the section cannot spend. **Annotate it as a first figure, say what you set it against, name what would move it, and name it in the note as open.** A bare number with no annotation is a stop, and a number typed into a test rather than read from the row is a stop.

**Fourth: nothing changes when no candidate is named.** `batch.ts` without the argument plays exactly the batch it plays today, **and its folder differs from today's only by the `default` segment, on the terms `birthright` is written when no `rig=` is named**; a build opened without `?tuning=` plays exactly the run it plays today. **That is the test that proves the surface right**, and a diff that changes either is a stop and report.

**Fifth: the URL parser repairs and warns, and it builds no gate.** Every parser in `seedFromUrl.ts` repairs an unusable value to a safe one and warns once, and `?tuning=` does the same: **an unknown name warns and the run plays under the default.** ADR 0022 says instrumentation controls are gated at build time, and **`?levels=` and `?signal=` carry that as a JSDoc sentence and no gate exists in the tree**: `import.meta.env.DEV` gates only the broken-invariant handler. **So you build no gate and you claim none.** Your parser carries the same ADR 0022 sentence the other two carry, and **if you believe a real gate is needed, that is a finding for the note, never a gate you build here.**

**Sixth: `batch.ts`'s `main` is at the line rule's edge and the argument does not go in on top.** It already carries eight exit paths over five `refuse(` calls and reads as a list. **The argument parsing comes out into a named function answering one record of what the command line asked for**, which is the forty-line rule applied where it bites, and the keyed-argument shape is `parseRig`'s, which `record-conditioned.ts` copied already.

**Seventh: the folder says which candidate.** `folderFor` gains it, on the same terms the rig is in there: **a figure names its starting condition, and a candidate is a starting condition on exactly the terms a rig is** (#107, ADR 0053, and the `Candidate` glossary entry slice 1 wrote).

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. **The six dispatch contract items are the sections below.**
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`. **"Parse at the edge" is this slice's whole rule**: a raw name is checked exactly once, where it enters, and becomes a trusted value.
3. `apps/hungry-grave/docs/push/drafts/step-5-tuning-record-draft.md`, **section 2 decision 4 and section 2a ruling 4 in full**, then section 3's satellites paragraph.
4. `apps/hungry-grave/docs/push/handoff.md`, **the "Tuning-step inputs, its first sweep list" bullets**, which are what the candidates exist to answer and where your one number's reasoning starts, and **`docs/adr/0022-*`** for what a build-time gate is and is not.
5. `apps/hungry-grave/CONTEXT.md`, the **Candidate**, **Tuning record**, **Rig** and **Batch** entries. Your names are checked against them.
6. `apps/hungry-grave/docs/push/step-6-progress.md`, **sections 8, 10 and 11**: the rows and their dotted names, the readers and the directions they predict, and the header.
7. The tree, by name and never by line: `src/dev/rigs.ts` **whole**, 123 lines, **which is the file your table copies in structure, in JSDoc voice and in edge guard**; `src/dev/configurations.ts`'s opening JSDoc, for why a row is written out rather than computed; `src/app/seedFromUrl.ts` **whole**, 190 lines, for the six parsers and the repair-and-warn shape; `src/app/screens/game/runSession.ts`'s `begin`, which assembles them; `scripts/batch.ts` **whole**, 367 lines, and `parseRig`, `folderFor` and `main` above all; `scripts/record-conditioned.ts`'s keyed arguments and its usage line; `src/game/tuningRecord.ts`, slice 3's, and its resolver.
8. The tests: `src/dev/__tests__/rigs.test.ts` **whole**, `src/app/__tests__/seedFromUrl.test.ts` **whole**, and `src/__tests__/boundary.test.ts`'s `BOUNDARIES` table, **because the app reaching `src/dev` for the table is a thing to confirm by running the fence rather than by trusting this sentence.**

**Check the worktree is clean before your first edit and report what you find.** Anything uncommitted under `src/` is a stop and report.

### The definition, in observable terms

After this slice **one command plays a batch under a named tuning candidate: the same `scripts/batch.ts` invocation with one extra argument**, writing a folder whose name says which candidate produced it, and every tape in it carrying that candidate's resolved record in its own header. **A build opened with `?tuning=<name>` plays under the same row**, and an unknown name warns once and plays the default. **Without either, nothing changes at all.**

**That is the draft's own done line, minus the sweep**, which is slice 8's.

**Nothing a player meets changes without being asked for.** `WITNESS_VERSION` reads 11, `READINGS_VERSION` reads 9, `FORMAT_VERSION` reads 5, `GOLDEN` holds at `-2049717150` with `score: 200`, and `pnpm verify` is green.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step6/` under a name carrying `dcandidates`. **Slice 6's two commits must both be in the tree and `FORMAT_VERSION` must read 5.** Anything dirty under `src/` is a stop.

**(b) The tests first, red.** The table's guard and its rows, the two surfaces' parsing, and the unchanged-without-an-argument tests, all before the code.

**(c) The table.** `src/dev/tuningCandidates.ts` on the `rigs.ts` model: names, type, row, rows, edge guard, and the function answering which candidate a record is. **The `default` row and one moved row.**

**(d) The one number**, annotated as ruling three says, in the row and never in a test.

**(e) `batch.ts`.** The keyed argument, the parsing extracted into its own named function, `folderFor` carrying the candidate, and the usage line. **Every existing refusal keeps its wording.**

**(f) The URL.** `tuningFromUrl` in `seedFromUrl.ts` beside its five siblings, repairing to the default and warning once with the ADR 0022 sentence in its JSDoc; `runSession.ts`'s `begin` passing the resolved record into the starting conditions.

**(g) The measurements this slice owes.**

- **Two batches on the same twelve seeds, one under `default` and one under the moved candidate**, with the folder names quoted and the readings the moved row predicts named. **The default batch's event counts must be identical to a batch played with no argument at all**, which is the "nothing changes when nothing is named" claim measured rather than asserted.
- **A tape from the moved batch, measured to `outcome: 'verified'`**, which proves the header carries the candidate's own values and the replay runs under them.
- **The built app opened at `?tuning=<name>` and at `?tuning=nonsense`**, through `vite preview` with the screenshot read and the console warning quoted, which is the playbook's mandatory rendered check for a player-reachable surface.
- **Replay determinism at your tip**, one seed under `shaky-short`.
- **The four constants and `GOLDEN`**, each read off the tree and named as held, with none of their four files in either commit.

**(h) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): a batch and a build play under a named tuning candidate (#142)`. Then the docs commit, carrying the progress note.

**(i) The progress note**, section **12**. Beyond the contract's list, say: the table's rows and the one number with its annotation and what would move it; the two surfaces and their exact warning wording; **that a deployed `?tuning=<name>` and a batch share a row only at one commit**, because the folder carries the hash and the URL does not, and the tape header carrying values is what keeps the tape honest; the argument parsing extracted and why; the folder's new name shape; **that no build-time gate exists for `?levels=`, `?signal=` or `?tuning=` and that you built none**, which corrects the draft's own sentence about ADR 0022 covering a new parser for free; the two batches and the tape; and the four constants and `GOLDEN` named as read off your own tip.

**(j) Stop and report.** Under 250 words. **Do not start slice 8.**

### What must not move, and a move is a stop

- **All four constants.** `WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 5 and `GOLDEN` at `-2049717150`. **`FORMAT_VERSION`'s move was slice 6's and the step has no second one.**
- **What a run does when no candidate is named**, on both surfaces, byte for byte on the same seed and commit. **The folder's new `default` segment is the one difference and it is in the name and never in the run.**
- **Every existing refusal and warning in `batch.ts`, `compare-batches.ts` and `record-conditioned.ts`**, wording included.
- **The six existing URL parsers**, `seed`, `size`, `levels`, `signal`, `tape` and `at`, their repairs and their warnings.
- **The record's ten rows and their readers.** You name a record; you do not add a row or move a reader.
- **`RIGS`, `RIG_NAMES` and `rigOf`.** A candidate is a second starting condition beside a rig and never a replacement for one.
- **Every existing invariant's meaning and severity, the fault identity list, `STREAM_SALTS` and `STREAM_ORDER`.**
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty.
- **No test is deleted, skipped, weakened or rewritten to reach green.**

### Seams under test

`src/dev/tuningCandidates.ts`: the rows as data; a raw name checked at the edge; the function answering which candidate a record is. `scripts/batch.ts`: the keyed argument parsed, refused when unknown, absent meaning today's behaviour, and the folder naming the candidate. `src/app/seedFromUrl.ts`: `?tuning=` read from the hash before the search, repaired to the default with one warning when the name is not a row. `src/app/screens/game/runSession.ts`: the resolved record reaching `createRun` through the starting conditions.

### Module boundaries

**One file is created and none is deleted, merged or split.** `src/dev/tuningCandidates.ts` owns one concept, the named tuning records a batch or a play runs under, and every export serves it; it does not join `rigs.ts`, whose concept is a starting size, levels and score, and it does not join `tuningRecord.ts`, which is core and must stay reachable by the tape edge without dragging the harness's rows behind it. **The arrows stay inward**: shell reaches `src/dev` reaches `src/game`, and `src/app` reaching `src/dev` for the table is governed by no boundary row today, **which you confirm by running the fence.** **No new library enters and `src/dev` still imports no bare package.** **The parser answers null for an absence and never resolves it**, because resolving an absence to a value is `createRun`'s job and never a parser's (ADR 0027), which is the split `levelsFromUrl` and `signalLockFromUrl` already keep.

### The planned test list

1. *Every candidate row's record is complete*, resolved through the resolver, so no row can be half a record and every committed row is proved against the resolver's quiet-interval bound.
2. *The `default` row is the resolved default*, asserted against it rather than restated.
3. *The moved row differs from the default in exactly one row*, which is what slice 8's comparison needs and is the assertion that keeps it true.
4. *A raw name that is not a row is refused at the edge*, and never reaches the core.
5. *A batch with no candidate argument plays what it plays today*, and its folder differs from today's only by the `default` segment, on the terms `birthright` is written when no `rig=` is named.
6. *A batch under a named candidate writes a folder naming it*, and its runs start under that record.
7. *`?tuning=` names a candidate and the run starts under it*, read off the run.
8. *`?tuning=` with an unknown name warns once and the run plays the default*, the warning's text asserted.
9. *`?tuning=` in the hash wins over one in the search*, which is every parser's rule in that file.
10. *No `?tuning=` means the run plays exactly as it plays today.*
11. **The fences**, every one green by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
12. **The golden digest**, green and unmoved, with `digest.ts` in neither commit.

**What this slice is expected to turn red.** Nothing that exists, which is the claim to check: every surface is new and every old path keeps its default. **A realistic count is 8 to 12 files.** A suite that reddens where nothing was named is a reason to stop and read what you reached into.

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit.
3. **Agent.** The four version constants and `GOLDEN`, read off the tree and named as held, none of their files in either commit.
4. **Agent.** Two batches on twelve seeds, `default` and the moved candidate, folders quoted and the predicted direction named.
5. **Agent.** A batch with no argument, event counts identical to the `default` batch per seed.
6. **Agent.** A tape from the moved batch measured to `outcome: 'verified'`.
7. **Agent.** The built app at `?tuning=<name>` and `?tuning=nonsense` through `vite preview`, screenshots read, the warning quoted.
8. **Agent.** Replay determinism on one seed under `shaky-short`.
9. **Agent.** The fences green, each named by test title.
10. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
11. **There is no Mark actor in this slice.** **A candidate he could play is not a candidate anybody has measured yet**, and the step's own rule is that tuning comes after it.

### State of the branch

- The tip should be slice 6's docs commit, **and `FORMAT_VERSION` reads 5 there.** Read all four off the tree yourself and say what you read.
- **You are permitted no version move of any kind and no `GOLDEN` re-pin.** The step's one move is behind you.
- **Slice 8 follows you** and is the first consumer of your table: the sweep plays a list of your rows and the comparison reads the difference between two of them. **Its whole proof is two candidates differing in one row**, which is your third test.

### The stuck rule

**Four things are already known to be a stop:** any version constant or `GOLDEN` moving; a run changing when nothing is named; a number typed into a test rather than read from a row; and a fence refusing the app's reach to the table. **And four things are ruled rather than open:** candidates are committed rows and not a JSON file, the `default` row exists, the second row moves the Procession purse, and no build-time gate is built. **A gate finding or a measurement arguing against any of the four is filed for the note, never applied.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **The sweep runner, the report's tuning identity and the comparison**, all slice 8's.
- **Running the first sweep or moving any number.** Your second candidate exists to prove the machinery and not to answer the finding behind it; **the answer is a later round's, after this branch.**
- **A candidate on `record-conditioned.ts`**, which is not ruled and is not yours. **File it in the note as a candidate for a later slice**, the way step 5's slice 8 filed the header widening.
- **A real build-time gate for the instrumentation URL controls.** Filed in the note, not built.
- **The store.** Not wired in this step.
- **Any ADR.** The orchestrator files and amends all of them.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**

---

## Slice 8 (E): the sweep runner, and a report says which tuning it read (#142)

Model: Opus, subagent type general-purpose. One coder, one code commit and one docs commit. Messages end in `(#142)`.

Slice 8 of the tuning-record step, and it is the draft's slice E. Everything the step exists for is in place except the one command that uses it. **The done line is this: one command sweeps a list of candidates and prints the comparison across them, and a report says which tuning produced it.** After this slice a tuning iteration costs one batch command and one read, which is what the whole step was for: **Mark is not the feel check on every tuning iteration.**

**The standing rules are in `docs/push/step-4-coder-contract.md`; read it first, and read the three overrides at the top of this file.** Everything below is what is specific to slice 8.

**Its progress-note entry is section 13**, appended to `step-6-progress.md`, **and it also writes the step's own closing rows into sections 1 to 5**, because it is the last slice.

**Six rulings shape this slice and none of them is yours to revisit.**

**First: `scripts/sweep.ts`, a new shell beside `batch.ts` and `compare-batches.ts` (ruling 9).** `compare-batches.ts` is already a second shell over the same `src/dev` modules, which is the precedent. **A mode of `batch.ts` is refused** and **a loop the agent writes each time is refused**: the done line says one command, and a loop written fresh each time is a loop written wrong once.

**Second: the identity is carried and reported and never refuses (ruling 8).** `compareBatches` refuses on exactly three mismatches today, `readingsVersion`, `configuration` and `rig`, while `BatchIdentity`'s commit hashes are **carried and not refused by `compareBatches`, though `readAcrossCorners` reads them as `leftBuild` and `rightBuild`**. **A fourth refusing mismatch on the tuning would refuse what the step exists to do**, because comparing two tunings is the step's central command. **So `BatchIdentity` gains the candidate's name and the record's values on that precedent**, and **on the same precedent the corner read gains a `tuning` mismatch when the two corners compared different candidate pairs, while `compareBatches` itself refuses nothing.** **When two reports differ, the comparison prints the differing rows first, then the readings.**

**Third: `READINGS_VERSION` does not move.** No existing reading changes meaning and no reading is added: an identity is not a reading, which is ADR 0062's own distinction, and the guard `comparisonDeclared.test.ts` is the fence that holds it. **A readings move here is a stop and report before it is written.**

**Fourth: a sweep's folders are indistinguishable from hand-played ones.** The sweep plays each candidate as an ordinary batch, through the same seams, writing the same folder shape. **Nothing in a folder says a sweep made it**, which is what keeps a sweep's evidence and a hand-run batch's the same kind of thing.

**Fifth: the proof is two candidates differing in one row, and the comparison printing that row first.** Slice 7's table holds exactly that pair. **That is the slice's done state and the step's**, and it is not the first sweep: **running a real sweep and moving numbers is after this branch or a later step.**

**Sixth: the store is not wired (ruling 10).** The done line needs a folder on disk read by one command, not a query. **Its reopening trigger is the first tuning round whose comparison needs runs from more than one machine or session.**

### Read first, in this order, before any edit

1. `docs/agents/feature-playbook.md` at the repo root. Read it and follow it. **The six dispatch contract items are the sections below.**
2. `.claude/rules/code-core.md` and `.claude/rules/code-typescript.md`, plus `docs/agents/code-examples.md`, `docs/agents/lessons.md` and `apps/hungry-grave/docs/lessons.md`. **"An entry point is small named functions plus an orchestrator that sequences them in the order a reader would tell the story, with exactly one call at module end" is this slice's whole rule**, and `main().catch(...)` and never an IIFE is its TypeScript form.
3. `apps/hungry-grave/docs/push/drafts/step-5-tuning-record-draft.md`, **sections 1, 2 decisions 8 and 9, section 2a rulings 8, 9 and 10, and section 6 whole.** Section 1's done line is what you are finishing.
4. **ADR 0053** for what a batch and a configuration are and for why a report that cannot say which tuning it read cannot support a finding, and **ADR 0062** for a reading's meaning being declared.
5. `apps/hungry-grave/docs/push/step-6-progress.md`, **sections 8 and 12**: the rows and the candidate table.
6. `apps/hungry-grave/CONTEXT.md`, **Batch**, **Candidate**, **Tuning record**, **Reading** and **Rig**, and **the `Batch` amendment slice 1 wrote saying what a sweep is**, which is the sentence your command has to be true to.
7. The tree, by name and never by line: `scripts/batch.ts` **whole**, 367 lines, **and `main`, `folderFor` and `playInto` above all, which is the shell shape your own copies**; `scripts/compare-batches.ts` **whole**, 204 lines, **which is the precedent for a second shell over the same seams**, its usage line and its refusals included; `src/dev/batchReport.ts`'s `BatchIdentity`, `BatchOrigin`, `BatchReport` and `batchReportOf`, found by name; `src/dev/compareBatches.ts`'s `mismatchesBetween`, `Mismatch` and the corner comparison beside it; `src/dev/compareRuns.ts`'s `READING_COMPARISONS`, **read and not extended**; `src/dev/tuningCandidates.ts`, slice 7's.
8. The tests: `src/dev/__tests__/compareBatches.test.ts` and `batchReport.test.ts` **whole**, `comparisonDeclared.test.ts` **whole**, which is the guard that every comparison is declared, and `src/__tests__/boundary.test.ts`'s `BOUNDARIES`.

**Check the worktree is clean before your first edit and report what you find.** Anything uncommitted under `src/` is a stop and report.

### The definition, in observable terms

After this slice **one command plays a list of candidates, each as an ordinary batch, and prints the comparison across them.** Each batch's report says which candidate it was played under and carries that candidate's resolved record, so **a finding can say "this tuning against that tuning" in the words ADR 0053 asks for.** When two reports carry different records, **the comparison prints the differing rows first and then the readings**, and it refuses nothing: comparing two tunings is what the command is for. **A sweep's folders are indistinguishable from hand-played ones.**

**Nothing a player meets changes.** `WITNESS_VERSION` reads 11, `READINGS_VERSION` reads 9, `FORMAT_VERSION` reads 5, `GOLDEN` holds at `-2049717150` with `score: 200`, and `pnpm verify` is green.

### The work, in this order

**(a) Verify the inputs.** `git log --oneline -25`, `git status --short`, the four constants read off the tree and reported, and your own test-name baseline into `local/step6/` under a name carrying `esweep`. **Slice 7's two commits must both be in the tree.** Anything dirty under `src/` is a stop.

**(b) The tests first, red.** The identity's round trip and the comparison's ordering before either, and the sweep's own seam before the shell.

**(c) `BatchIdentity`'s two new facts**, the candidate's name and the record's rows, written by `batchReportOf` off the runs the way the rigs and the commit hashes already are. **A report that cannot say which tuning it read cannot support ADR 0053's sentence**, which is the reason and belongs in the JSDoc. **`candidates` is a set of names on the `rigs` precedent; `tuning` is the one record the folder's runs share, and a folder whose runs carry differing records reports `tuning: null` and the comparison prints no rows for it.**

**(d) The comparison.** No fourth refusing mismatch in `compareBatches`. When the two records differ, **the differing rows print first, by dotted name, with both values**, then the readings as they print today. **`readAcrossCorners` gains its `tuning` mismatch** on the build-hash precedent ruling two names. **`isBatchReport` requires the two new identity fields and its one refusal sentence names them; every other refusal in `compare-batches.ts` keeps its wording.** Its own JSDoc already says a report from an earlier build is a document rejected rather than read until it dies inside the comparison, so **the stale parenthesis naming the rigs and the per-run samples goes** and the sentence names what this build requires instead.

**(e) `scripts/sweep.ts`.** Small named functions and one orchestrator sequencing them in the order a reader would tell the story, ending in exactly one call. It plays each named candidate as an ordinary batch through the same `src/dev` seams `batch.ts` uses, then prints the comparison across them. **The sweep takes `batch.ts`'s own arguments, one configuration, a first seed, an optional count, out-root and `rig=`, plus `tuning=<a>,<b>,...`; it plays one batch per name in that order and prints one `compareBatches` of each later candidate against the first; the two-corner read across hands is the first real sweep's and not this slice's.** **Its usage line is in the shape `batch.ts`'s and `compare-batches.ts`'s are**, and **every refusal path says its reason out loud** the way theirs do.

**(f) The measurements this slice owes.**

- **A sweep over the two candidates slice 7 committed**, on a real seed range, with **the comparison's output pasted into the note whole**. The differing row prints first; say which readings moved with it and which did not.
- **The same two candidates played as two hand-run batches and compared with `compare-batches.ts`**, giving the same answer as the sweep, which is what "indistinguishable from hand-played" means measured rather than asserted.
- **A report read back and quoted**, showing the candidate's name and the record's rows in its identity.
- **Replay determinism at your tip**, one seed under `shaky-short`.
- **The four constants and `GOLDEN`**, each read off the tree and named as held, with none of their four files in either commit.

**(g) CodeRabbit CLI, one iteration, then the code commit.** Something in the shape of `feat(hungry-grave): one command sweeps a list of candidates and the comparison names the rows they differ in (#142)`. Then the docs commit, carrying the progress note.

**(h) The progress note**, section **13**, **and the step's closing rows in sections 1 to 5.** Beyond the contract's list, say: the identity's two new facts; the comparison's ordering and the decision not to refuse, with ruling 8's reason in one sentence; the sweep's usage line and its refusals; the sweep's output whole; the hand-run cross-check; **what the step did not do, in plain words**, which is move a number; and the four constants and `GOLDEN` named as read off your own tip.

**(i) Stop and report.** Under 250 words. **This is the step's last slice; the close is the orchestrator's.** Say plainly whether the done line is met: one command plays a batch under a named candidate, one command sweeps a list of them, and a tape says on its own header what it was played under.

### What must not move, and a move is a stop

- **All four constants.** `WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 5 and `GOLDEN` at `-2049717150`. **`READINGS_VERSION` is the one you will be tempted by, because the report gains fields**; an identity is not a reading and the version does not move.
- **`READING_COMPARISONS`.** No reading is added, removed or redefined, and **`comparisonDeclared.test.ts` stays green as written**, which is ADR 0062's guard.
- **`compareBatches`' three existing refusing mismatches**, `readingsVersion`, `configuration` and `rig`, and the corner comparison's four beside them, each keeping its meaning while the corner read gains a fifth for the tuning.
- **Every refusal in `compare-batches.ts` but `isBatchReport`'s**, wording included. **`isBatchReport` requires the two new identity fields and its one refusal sentence names them**, which is the only refusal wording that moves in this slice.
- **`batch.ts`'s behaviour**, which gains nothing in this slice: slice 7 gave it its argument.
- **The record's ten rows, their readers, the caps and the header.** You read them and you move none.
- **Every existing invariant's meaning and severity, the fault identity list, `STREAM_SALTS` and `STREAM_ORDER`.**
- **The fences**, every one by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` empty. **`src/dev` still imports no bare package**, which is why the sweep prints from the shell and the seam returns rows.
- **No test is deleted, skipped, weakened or rewritten to reach green.**

### Seams under test

`src/dev/batchReport.ts`: a report carrying the candidate's name and the resolved record it was played under, read off the runs. `src/dev/compareBatches.ts`: two reports under different tunings compared rather than refused, with the differing rows answered first. `scripts/sweep.ts`: a list of candidates named by `tuning=<a>,<b>,...` beside `batch.ts`'s own arguments, each played as an ordinary batch, and one comparison of each later candidate against the first, with each refusal path saying its reason.

### Module boundaries

**One file is created, `scripts/sweep.ts`, and none is deleted, merged or split.** It is a shell: it owns the filesystem, the argument list and the printing, and it borrows every judgement from `src/dev`, which is exactly what `compare-batches.ts` is and why a second shell is right rather than a mode. **It does not join `batch.ts`**, whose concept is one batch, and **`batch.ts` gains nothing at all in this slice.** **No import direction changes**: shell reaches `src/dev` reaches `src/game`, and `src/dev` imports no bare package, **which is why the comparison returns its rows and the shell prints them.** **No new library enters.** The identity's new fields are data on an existing type and not an intersection over it.

### The planned test list

1. *A report names the candidate its runs were played under*, read off the runs rather than off the command line.
2. *A report carries the resolved record its runs were played under*, every row.
3. *Two reports under different tunings are compared rather than refused*, which is the ruling that keeps the step's central command working.
4. *The comparison names the rows the two records differ in*, first, by dotted name, with both values.
5. *Two reports under the same tuning compare exactly as they do today*, so nothing about an ordinary comparison moved.
6. *The three existing refusing mismatches still refuse*, all three, and *the corner read answers its new `tuning` mismatch* when two corners compared different candidate pairs.
7. *The sweep plays each candidate as an ordinary batch*, in the order its argument names them, its folders indistinguishable from a hand-played batch's, and it prints one comparison of each later candidate against the first.
8. *The sweep refuses a name that is not a candidate*, at the edge, with the reason said.
9. *The sweep refuses its own argument errors* the way `batch.ts` does across its eight exit paths over five `refuse(` calls.
10. **`comparisonDeclared.test.ts`**, green and unchanged.
11. **The fences**, every one green by title, plus the core's cycle guard with `KNOWN_CORE_CYCLES` still empty.
12. **The golden digest**, green and unmoved, with `digest.ts` in neither commit.

**What this slice is expected to turn red.** The report and comparison tests that assert an identity's shape. **A realistic count is 6 to 10 files.**

### Verification steps, with actors

1. **Agent.** `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green in `apps/hungry-grave/`, then `pnpm verify` green twice on the committed tree.
2. **Agent.** The test-name diff, both figures, against a baseline captured before your first edit.
3. **Agent.** The four version constants and `GOLDEN`, read off the tree and named as held, none of their files in either commit.
4. **Agent.** The sweep run over the two candidates, its output in the note whole.
5. **Agent.** The same two candidates as hand-run batches compared with `compare-batches.ts`, same answer.
6. **Agent.** A report quoted, showing the candidate and the record in its identity.
7. **Agent.** Replay determinism on one seed under `shaky-short`.
8. **Agent.** The fences green, each named by test title, `comparisonDeclared.test.ts` included.
9. **Agent.** CodeRabbit CLI, one iteration, before the code commit.
10. **There is no Mark actor in this slice.** **The draft's one Mark step, a play of a candidate the batch says is ready, needs a sweep somebody has read**, and no sweep has been read yet.

### State of the branch

- The tip should be slice 7's docs commit. **Read the four constants off the tree yourself and say what you read.**
- **You are permitted no version move of any kind and no `GOLDEN` re-pin.** The step's one move is behind you, in slice 6.
- **Nothing follows you but the step's close**, which is the orchestrator's: the gates, the rundown and the merge call.

### The stuck rule

**Four things are already known to be a stop:** any version constant or `GOLDEN` moving; `READINGS_VERSION` moving for the report's new fields; a fourth refusing mismatch; and a reading added, removed or redefined. **And four things are ruled rather than open:** the sweep is its own shell, the identity is carried and never refuses, the differing rows print first, and the store is not wired. **A measurement arguing any of the four should move is a finding for the note, never a row you move here.** **Green tests plus wrong observed behaviour means the test plan has a hole: pin the wrongness as a new red test first, never patch first.**

### What is not your job

- **Tuning.** **Moving a number is after this branch, or a later step.** The step ends with the machinery and two candidates that prove it, and **the first real sweep, the one that answers the findings in the handoff's own list, is not run here.** Your second candidate exists to make the comparison say something, not to recommend anything.
- **Reading the sweep and picking a move**, which is Fable's job on the balance itself and not a coder's.
- **The store**, not wired in this step, with its reopening trigger named.
- **The eligible magnitudes this step does not carry**, listed in slice 3's note.
- **A candidate on `record-conditioned.ts`**, filed by slice 7 and not taken.
- **The step's close**: the three gates over the step's whole diff, the deploy, Mark's rundown and the merge call are all the orchestrator's.
- **Any ADR.** The orchestrator files and amends all of them.
- **Deploying, pushing, merging, opening a PR, opening or closing a ticket.**

---
