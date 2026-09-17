# Step 6 progress note: the tuning record (ticket #142)

The design record is `apps/hungry-grave/docs/push/drafts/step-5-tuning-record-draft.md` and the prompts are `step-6-slice-prompts.md`. The coder contract is still `step-4-coder-contract.md`, with the three standing exceptions to it at the top of the prompts file. One section per slice at the end, in run order, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

**Step 5's note is `step-5-progress.md`, round two's is `round-two-progress.md` and step 4's is `step-4-progress.md`, and all three are read and never appended to.** This step's slices carry `#142` rather than `#99`, `#72` or `#39`.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| 1, the vocabulary | the commit this note rides in, section 6 says why | `docs(hungry-grave): the glossary gains the tuning record, the candidate and the starting condition, and a sweep is not a batch (#142)` |
| 2 (A1), the starting conditions | `5fa3a9744c` | `refactor(hungry-grave): a run's starting conditions are one record and createRun takes a seed beside it (#142)` |
| 3 (A), the record exists | `a9d2ecad8e` | `feat(hungry-grave): the tuning record declares ten magnitudes and resolves to the values the build compiles (#142)` |
| 4 (B1), the record reaches the run | `f5569b2330` | `feat(hungry-grave): a run derives its own caps from the tuning record it started under (#142)` |
| 5 (B2), the score group's readers | `82e9ab71f6` | `feat(hungry-grave): the purses, the quiet interval and the score's five rows are read off the run's tuning record (#142)` |
| 6 (C), the header | `47c4543d25` | `feat(hungry-grave): a tape header carries the whole starting condition as a self-describing block (#142)` |
| 7 (D), the candidates | `6f5f98adda` | `feat(hungry-grave): a batch and a build play under a named tuning candidate (#142)` |
| 8 (E), the sweep runner | `ace50d5c29` | `feat(hungry-grave): one command sweeps a list of candidates and the comparison names the rows they differ in (#142)` |
| the close fold, the four fixes the close gates found | `88a3808617` | `fix(hungry-grave): the resolver refuses a zero quiet minimum, the live screen attaches at the run's caps, the report identity spells the record as rows (#142)` |

**The table is closed: all eight slices and the close fold are in the tree, and nothing follows them but the rest of the step's close**, which is the orchestrator's: the deploy, Mark's rundown and the merge call.

## 2. The version ledger

Where each constant stood when step 6 opened, where it is permitted to go, and where it actually went. **A move anywhere the prompts do not name is a stop and report, never a re-pin and never a bump taken on the spot.**

| Constant | At step 6's opening tip `fd9fadf562` | Permitted move | Owner | Landed |
| --- | --- | --- | --- | --- |
| `WITNESS_VERSION` (`src/game/witness.ts`) | 11 | none, in any slice | nobody | |
| `READINGS_VERSION` (`src/dev/readingsVersion.ts`) | 9 | none, in any slice | nobody | |
| `FORMAT_VERSION` (`src/tape/wireCodes.ts`) | 4 | 4 to 5, exactly once | Slice 6, the header, and no other slice | **4 to 5 at `47c4543d25`**, the step's one move, spent |
| `GOLDEN` (`src/dev/digest.ts`), checksum `-2049717150` | pinned by step 5's slice M1 | no re-pin, in any slice | nobody | |

**The whole budget is slice 6's single `FORMAT_VERSION` move and nothing else** (prompts ruling 4, draft section 2a rulings 6 and 7). The witness does not move because the record is a starting condition and every consequence of it is already in the fold through live state; the readings do not move because no existing reading changes meaning; `GOLDEN` holds by arithmetic in every slice, because a re-pin would mean a magnitude moved and a moved magnitude is a stop.

**Slice 2 moved none of the four and was permitted none.** `WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 4 and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2`, each read off the tree before the first edit and read again after the last, and none of `witness.ts`, `readingsVersion.ts`, `wireCodes.ts` or `digest.ts` is in either commit. `GOLDEN` held by arithmetic exactly as the prompts predicted: the seed stayed `createRun`'s first positional parameter, so the four `createRun(SEED)` calls did not move at all and the scenario's own run is untouched.

**Slice 3 moved none of the four and was permitted none.** `WITNESS_VERSION` 11 (`src/game/witness.ts`), `READINGS_VERSION` 9 (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` 4 (`src/tape/wireCodes.ts`) and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` (`src/dev/digest.ts`), each read off slice 2's docs tip `b996bdc359` before the first edit, and none of the four files is in either commit. The hold needed no argument this time: no production code path reads the record, so nothing this slice added runs at all.

**Slice 4 moved none of the four and was permitted none.** `WITNESS_VERSION` 11 (`src/game/witness.ts`), `READINGS_VERSION` 9 (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` 4 (`src/tape/wireCodes.ts`) and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` (`src/dev/digest.ts`), each read off slice 3's docs tip `4001925e44` before the first edit and read again off the code commit's own tree, and none of the four files is in either commit. The witness held because nothing folded changed: the thirteen new `RunState` paths are the record's ten rows and the three caps, every one of them a starting condition or a derivation of one, and each is in `witness.test.ts`'s `EXCLUDED` with its reason. `GOLDEN` held by arithmetic: the default record's rows are the constants, so all three caps derive to exactly the numbers they were, and `digest.ts`'s `createRun(SEED)` is untouched.

**Slice 5 moved none of the four and was permitted none.** `WITNESS_VERSION` 11 (`src/game/witness.ts`), `READINGS_VERSION` 9 (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` 4 (`src/tape/wireCodes.ts`) and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` (`src/dev/digest.ts`), each read off slice 4's docs tip `4c108a18ce` before the first edit and read again off the code commit's own tree, and none of the four files is in either commit. `GOLDEN` held by arithmetic, which is the claim this slice had the most ways to break: nine constants were deleted and every one of their readers moved, and every product is the number it was, so the scenario's two scripted kills still pay 200. The witness held because nothing folded changed meaning: `director.purseLeft` still carries what a section granted, and what a section grants is the same figure read from a different place.

**Slice 6 spent the step's whole budget and moved nothing else.** `FORMAT_VERSION` 4 to 5 in `src/tape/wireCodes.ts`, in the code commit and nowhere else, with its own dated paragraph above the constant. `WITNESS_VERSION` 11 (`src/game/witness.ts`), `READINGS_VERSION` 9 (`src/dev/readingsVersion.ts`) and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` (`src/dev/digest.ts`) all held, each read off slice 5's docs tip `000dbf95bf` before the first edit and read again off the code commit's own tree, and none of those three files is in either commit. The witness held for the reason ruling 5 gives: the header records what a run started under and changes nothing a run does, so no folded field moved and `digest.test.ts`'s nine tests were green at every run. **The ledger is now closed: every row of it is filled and no slice after this one is permitted a move.**

**Slice 7 moved none of the four and was permitted none, and it is the first slice after the ledger closed.** `WITNESS_VERSION` 11 (`src/game/witness.ts`), `READINGS_VERSION` 9 (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` 5 (`src/tape/wireCodes.ts`) and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` (`src/dev/digest.ts`), each read off slice 6's docs tip `27a177c797` before the first edit and read again off the code commit's own tree, and none of the four files is in either commit. `GOLDEN` held for the plainest reason in the step: no magnitude moved anywhere, and the one figure this slice states lives inside a named candidate row that nothing plays unless a command line or a URL names it.

**Slice 8 moved none of the four and was permitted none, and it is the last slice, so the ledger closes exactly where slice 6 left it.** `WITNESS_VERSION` 11 (`src/game/witness.ts`), `READINGS_VERSION` 9 (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` 5 (`src/tape/wireCodes.ts`) and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` (`src/dev/digest.ts`), each read off the tip before the first edit and read again off the code commit's own tree, and none of the four files is in either commit. **`READINGS_VERSION` is the one this slice was warned it would be tempted by and the temptation was real**: the batch report gained two identity fields and `Provenance` gained two of its own. It holds because no existing reading changed meaning and none was added, which is that constant's own written rule; an identity is what a run started from and a reading is a figure the instrument computed off it (ADR 0062). **The step's whole ledger is therefore one `FORMAT_VERSION` move, in slice 6, and nothing else.**

**Slice 1 moved none of the four and was permitted none.** `WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 4 and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2`, each read off the tree before the first edit, and none of the four files is in the commit. Every figure matched the prompts' own header line, so nothing in this step starts from a stale constant.

## 3. GOLDEN moves

One entry per slice that was permitted one, whether or not it moved, with the dated paragraph's location and every field that moved beside every field that held.

**No slice in this step is permitted a re-pin**, so an entry here would itself be the report of a stop. Slice 1 has none: no file under `src/` is in its commit. **Slice 2 has none either, and it is the slice where the claim had to be checked rather than asserted**: 36 files under `src/` and `scripts/` moved, `digest.ts` is in neither commit, and `digest.test.ts` was green at every run. **Slice 3 has none**: `digest.ts` is in neither commit and all nine of `digest.test.ts`'s tests were green, including the golden itself. **Slice 4 has none, and it is the slice where the three numbers had to be printed rather than argued**: the mob, mob-fire and corpse caps read 481, 434 and 704 off a default run before the first edit and 481, 434 and 704 off the code commit's tree, `digest.ts` is in neither commit, and `digest.test.ts` was green at every run. **Slice 5 has none, and it is the slice with the most ways to have needed one**: nine constants were deleted, every reader moved, and the hold is arithmetic, `20 * 100` and `24 * 100` and `1 * 100` and a rate of `100 / 100`, so every payment is the number it was; `digest.ts` is in neither commit and all nine of `digest.test.ts`'s tests were green at every run. **Slice 7 has none**: `digest.ts` is in neither commit, `digest.test.ts` was green at every run, and no value the golden's scenario reads is reachable from a candidate nobody names. **Slice 8 has none**: `digest.ts` is in neither commit, all eight of `digest.test.ts`'s golden cases were green at every run, and the slice touches no core module at all, only the instrument that reads a tape and the two shells over it. **No slice in this step re-pinned it, which is the section's own closing line.**

## 4. CodeRabbit

One entry per commit: files reviewed, findings by severity, applied and declined, each decline with its reason.

**Slice 1's docs commit, `coderabbit review --agent --uncommitted`, one iteration: two files reviewed, one finding, minor, applied.** The two files are this slice's own, `CONTEXT.md` and this note; the worktree held no other agent's edits, so the review saw nothing else. The finding is on this section: it stood as an unfilled marker when the review ran, because the review is the step before the commit and the note rides inside the commit it describes, so the only way to record the review was to write the entry after it. **Applied by writing this paragraph**, which is the finding's own first option, files reviewed and findings by severity with what was applied. Zero findings on `CONTEXT.md`, so none of the three entries or two amendments was touched by the review.

**Slice 2's code commit, `coderabbit review --agent --uncommitted`, one iteration: 36 files reviewed, two findings, both major, both declined.** Both are about `src/tape/playback.ts` and both are false against the tree, which `pnpm typecheck` green is the proof of. **The first asks for `readonly signalLock: SignalLock` to be added to `TapeHeader`** so that `runFromHeader`'s `header.signalLock` is valid: the field is already there as `readonly signalLock: number` in `src/tape/tape.ts`, `SignalLock` is `number` by its own declaration, and the read predates this slice, which moved it from a positional argument into a record field without changing it. **The second asks `runFromHeader` to pass `header.recordedRoster` instead of `levels.roster`, on the claim that `RosterImplemented` has no `roster`**: it has one, `readonly roster: readonly WeaponLine[]` in `src/tape/startingLevels.ts`, and taking the suggestion would be wrong twice over, because `recordedRoster` is `readonly string[]` and the resolution from recorded names to this build's lines is exactly what `resolveStartingLevels` does. Both readings look like the review seeing the changed hunk without the types behind it. Nothing was applied, and no third finding was raised on the other 35 files.

**Slice 4's code commit, `coderabbit review --agent --uncommitted`, one iteration: 22 files reviewed, one finding, major, applied.** The finding is on `FieldRenderer.attach`: the sprite pools are grow-only now, `sync` walks the run's own pool and writes nothing above it, so a run smaller than one this process already drew would leave the larger run's bodies visible in the slots it never reaches. **It is real and it is a defect this slice created**, because before it every run's pools were the same length; it cannot be met at this tip, where every run derives the same caps, and it can be met the moment a tape carries a record of its own. **Applied as a bug fix rather than as a patch**: the wrongness was pinned first as a red test, *shows nothing above the pool of the run it is now drawing, after a larger one*, and `forgetPreviousRun` now hides all four sprite pools, which is what that method already means. Nothing was declined, and no finding was raised on the other 21 files.

**Slice 3's code commit, `coderabbit review --agent --uncommitted`, one iteration: three files reviewed, one finding, major, declined.** The three are this slice's own, `src/game/tuningRecord.ts`, `src/game/__tests__/tuningRecord.test.ts` and `src/__tests__/boundary.test.ts`. The finding is on `resolveTuning` and asks that `createRun` and `RunState` take the overlay, resolve it once per run and carry the result, with every non-test call site passing it through. **Declined because it is slice 4's whole definition and this slice's whole definition forbids it**: nothing reads the record at this tip and nothing may, which the prompt states as the slice's promise, and the file the finding asks to edit is one slice 3 may not touch. The review is right about where the record is going and wrong about when, which is what a slice boundary looks like from inside one commit. Nothing was applied.

**Slice 8's code commit, `coderabbit review --agent --uncommitted`, one iteration: 10 files reviewed, one finding, minor, applied.** The finding is on `scripts/sweep.ts`'s `sayTuningRows`: with no differing rows it printed "no row differs, so the two batches played one tuning", and an empty row list has a second cause, a batch whose own runs did not share one record, which the sweep reports as `tuning: null`. **It is real and it is reachable**, because a batch in which no run verified collects no record at all and answers null the same way, so the line would have said the opposite of what happened. **Applied by taking the sentence off the two records rather than off the emptiness**: either side null now says that one batch shares no one record across its runs and that no row was compared. **It is the one finding in this step applied by reading rather than pinned by a test first, and the reason is that the command cannot stage it**: a batch with no verified run needs a broken encoder, and the state is unreachable through the shell's own seam. `compare-batches.ts` never had the defect, because its own printer says nothing at all when there are no rows. No finding was raised on the other nine files.

**This section holds five of the eight entries and slices 5, 6 and 7 wrote theirs inside their own sections instead**, 10, 11 and 12, which is worth saying once here rather than leaving a reader to count. **The step's whole review tally, over both places: 13 findings on 8 commits, 5 applied whole, 1 applied in part, and 7 declined**, every decline with its reason beside it. **Four of the seven declines are one claim wearing four coats**, that the resolver should reject a row before a run starts, raised against slice 5 and answered rather than refused: slice 7 took it at the one edge a person's typed value arrives from, and slice 6 took it at the tape's. **Two more are false claims about the types in a changed hunk** (slice 2), and **the last is a slice boundary read correctly and answered one commit later** (slice 3, the record reaching `createRun`, which is slice 4's whole definition).

## 5. Record and prompt claims found false against the tree

Every claim in the design record or in a slice prompt that did not survive contact, with the file and what is actually there. **The source's intent is followed rather than its stale letter, and an unclear intent is a stop.**

**Slice 1. The prompts' header expects one new ADR and two exist at the tip it was written against.** `step-6-slice-prompts.md`'s second further ruling says "Expected: **one new ADR** for the tuning record and the starting-condition record on the run". The orchestrator filed two at `8924d5b397`, ADR 0063 for the starting-condition record and ADR 0064 for the tuning record, which is what the draft's own third prompt-time ruling calls for: "the step's new decisions are two ADRs under the one-decision rule, not one; the second stands on its own without the first, which is the test". **The intent was followed and both were cited**: Starting condition cites ADR 0063, Tuning record and Candidate cite ADR 0064, and neither entry cites a record that does not exist. The header sentence is stale rather than wrong about anything a slice has to do.

**Slice 2. ADR 0063 describes the banding rule of a later tip, and the prompt rules the tip this slice leaves.** ADR 0063's third paragraph says `rigOf` "bands a tape by the rig's own fields of it, size, levels and starting score". At this tip a tape header carries no score at all, so banding on one would answer null forever, and the slice prompt rules it outright: `rigOf` keeps its two arguments and its behaviour exactly, and slice 6 is where that changes once the header carries the record whole. **The ADR sentence is the destination and not a claim about this tree**, and `rigs.ts`'s own JSDoc beside `rigOf` still says why, so nothing here was changed to chase it. Slice 6 owns closing the gap.

**Slice 2. The prompt's reddening estimate ran under, which cost nothing but is worth the next slice knowing.** The prompt expects "15 to 25 files" to redden against the new signature; the tree holds 54 multi-argument `createRun` calls across 29 files, 5 of them production and 24 test files. Every one of them is a signature change and nothing else, and the count is the honest size of a seam this deep in the sim.

**Slice 4. The prompt's file list named twelve of the twenty-two and missed five whole files.** It expects "12 to 20 files" and names `corpses.ts`, `mobs.ts`, `mobFire.ts`, `stormTargets.ts`, `invariants.ts`, `run.ts`, `FieldRenderer.ts`, `FrameBudgetScreen.ts`, `frameBudgetCaps.ts`, "plus their tests", and `witness.test.ts`. **What it got right**: every one of those nine, `witness.test.ts` reddening on the new fields, and `caps.ts` and `boundary.test.ts`, which steps (d) and (h) name. **What it got wrong in the other direction**: the three pool modules' own tests did not redden at all, because `createMobPool`, `createShotPool` and `createCorpsePool` have exactly one caller each and it is `run.ts`. **What it missed**: `src/dev/rigs.ts`, where a rig row states the resolved condition whole (ADR 0063) and therefore has to name the record it plays under; `GameScreen.ts` and `ReplayScreen.ts`, which are two of the three `attach` sites and which the prompt's seventh ruling describes without naming; `scripts/frame-budget.ts`, whose own sentence about the dynamic import went false beside the shim's; and `lineAgnosticPolicies.test.ts`, whose comment named `MOB_CAP` as a thing to read a safety net beside. **Step 4's slice A's warning held**: the true figure is 22, over the top of the range.

**Slice 4. `FieldRenderer.build`'s JSDoc claimed something that was not true and this slice made it true.** It said "their sizes come from the run rather than from the caps directly, so the sprite pool and the entity pool cannot drift", while the three `fill` calls under it read `MOB_CAP`, `MOB_FIRE_CAP` and `CORPSE_CAP` off the module. The two agreed only because every run's pools were built at those same constants. The pools are grown from the caps the attach was handed now, so the sentence describes the code, and it moved into `growPools` beside the loop it binds.

**Slice 4. `boundary.test.ts`'s `importsOf` reads the word "import" in prose as an import, which cost one test title.** A test named *grows its own scratch to the run it is handed, so nothing is sized at import* made `src/game imports only from src/game` fail, naming the whole test body as an imported specifier: the regex takes `import` followed by a quote, and the closing quote of the title is that quote. **The title was reworded to end "when the module loads" and the fence was left alone**, because the fence is not this slice's to change and the reader's own teeth test pins its current behaviour. It is filed here rather than fixed: any prose ending in the word "import" inside a file the fence walks fails the same way, and the fix is one lookahead in a regex nobody should edit in a slice that is moving caps.

**Slice 3. The prompt's own planned test list counts nine rows where every ruling in it counts ten.** `step-6-slice-prompts.md`'s slice 3 block, planned test list items 1 and 5, say "nine of them" and "all nine". The same block's first ruling names ten rows and its step (f) says "Ten assertions and no loop", and the prompts' header adds `stage.quietIntervalMaximumSeconds` to the stage group with its reason; the draft's own third prompt-time ruling still says "the nine rows the first sweep list names", which is the count before that tenth row was ruled in. **Ten was followed**, because the ruling that added the tenth row is the later one and it carries the argument the resolver's bound rests on: both ends have to be rows or the assertion cannot import nothing. The two test-list sentences are stale arithmetic rather than a different plan.

**Slice 7. The draft says ADR 0022's build-time gate covers a new URL parser for free, and no such gate exists in the tree.** The sentence is in the draft's decision 4 ("ADR 0022's build-time gate covers a new one for free") and its section 4's slice D lists "the build-time gate over it" as work. Against the tree, `?levels=` and `?signal=` carry ADR 0022 as a JSDoc sentence saying where the behaviour belongs and nothing gates either of them; the only `import.meta.env.DEV` in a run's path is `runSession.ts`'s broken-invariant handler. **The prompts' fifth ruling for slice 7 already rules this** and was followed: `tuningFromUrl` carries the same sentence, no gate was built and none is claimed. A real gate for all three belongs to whoever owns the two build flavours, and it is filed in section 12 rather than invented inside a slice.

**Slice 7. The prompt's file estimate ran under by one, and the extra is work the prompt itself carried in a ruling.** It expects 8 to 12 files and the true figure is 13. The overshoot is `score.bossHealthPerKill`'s zero refusal, which is the module, its test and the tape edge's test: the orchestrator's own ruling told this slice to add that check if the resolver did not have it, and it did not. The estimate was right about the shape, one module created and none deleted.

**Slice 8. The tip was not slice 7's docs commit, because the branch moved under the slice while it ran.** The prompt says "the tip should be slice 7's docs commit" and names `5842308fd5`; by the first edit the orchestrator had committed three more, and the tip at the code commit was `106eff82e2`. **The whole difference between those two tips is six lines of `docs/push/handoff.md`**, checked with a diff rather than assumed, so nothing this slice read, ran, measured or leaned on had moved: both of slice 7's commits are in the tree and no file under `src/` or `scripts/` differs. It is recorded because a coder reading its own prompt's state-of-the-branch section should not have to wonder.

**Slice 8. `CONTEXT.md` has no `Reading` entry, and the prompt's read list names one.** Its step (4) asks for "`apps/hungry-grave/CONTEXT.md`, **Batch**, **Candidate**, **Tuning record**, **Reading** and **Rig**"; the word "reading" appears nowhere in that file. **The concept is declared in code and in an ADR instead**, `READING_COMPARISONS` and `BATCH_READINGS` with `comparisonDeclared.test.ts` over them, and ADR 0062, which the same block names and which was read. The intent was followed and nothing was invented; whether the glossary wants the entry is a docs question and not a slice's.

**Slice 8. The prompt's line counts for the two shells are one commit stale, and only one of them matters.** It says to read `scripts/batch.ts` "whole, 367 lines" and `scripts/compare-batches.ts` "whole, 204 lines". At slice 6's docs tip both figures were exact; slice 7 then rewrote `batch.ts`'s argument parsing and it is **469 lines**, which is where `requestedBatch`, `KEYS` and `unknownKeyIn` live, all three of which this slice's own shell is shaped on. `compare-batches.ts` was still 204. The prompts' own rule held: the name was found, never the line.

## 6. Slice 1: the vocabulary, and the step's progress note exists (#142)

Two files: `apps/hungry-grave/CONTEXT.md` and this note, new. **Written inside the commit it describes**, because slice 1 is one docs commit by its own prompt and there is no second commit to record a hash from; section 1's row points here and the hash is in the dispatch report. **No file under `src/` or `scripts/` is in it, no test moved, and the test-name diff is zero and zero.**

**The worktree was clean before the first edit.** The short status returned nothing at all, so no other agent's file was open and nothing had to be kept out of the commit.

**The four constants, each read off the tree and untouched.** `WITNESS_VERSION` 11 (`src/game/witness.ts`), `READINGS_VERSION` 9 (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` 4 (`src/tape/wireCodes.ts`), `GOLDEN`'s checksum `-2049717150` (`src/dev/digest.ts`) with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2`. Section 2 carries what that means for the rest of the step.

**The three entries added, each in the file's own voice with its own Avoid list, and all three placed beside the harness words rather than at the section's end** so a reader meets them together. **Starting condition**, placed immediately before `Rig` so the rig entry's first sentence reads off it: one record of how a run starts, the size, the levels, the roster, the signal lock and the starting score together, each absent field resolving to what the run would have resolved it to anyway, a rig being that record under a name, a tape's header carrying it whole and `createRun` taking it (ADR 0063), _Avoid_: initial state, preset, options, start state. **Tuning record**, placed after `Rig`'s two amendments and before `Candidate`: the magnitudes a batch reading can move, grouped by the module that owns them, resolved once at a run's start and carried on the run, its one name on every text surface the dotted path its grouping gives it, a row existing only where something reads it, and neither the caps nor the safety nets, which are a derivation and a bug detector (ADR 0064), _Avoid_: settings, parameters, config, balance table. **Candidate**, placed immediately after it and immediately before `Batch`, so the word `Batch`'s own amendment uses is defined above it: a named tuning record a batch or a play is run under, the name being what a batch folder and a report carry, a starting condition on exactly the terms a rig is and never a description of the hand that steered (ADR 0064), _Avoid_: variant, arm, treatment, recipe.

**The `Rig` amendment, in one sentence.** What stood is everything the entry says a rig is, the starting condition alone and never the hand, figures from two rigs never banded, and the 2026-09-17 step 5 amendment above it including what it says a rig's condition holds; what changed is the count and the list, six named rigs becoming the three rows `RIG_NAMES` actually holds (`birthright`, `maxed`, `ladder`), with the ceiling rig named as unrowed and waiting because `src/dev/rigs.ts` says exactly that in its own comment, and the entry now citing Starting condition rather than restating it; what the entry could not have known is that it was written when a rig was the only name any starting condition had, so counting rigs was the only way to count starting conditions.

**Why the correction says three and not seven.** `docs/design/playing-harness.md` section 6 holds a table of seven starting conditions and the glossary said six, while `RIG_NAMES` holds three. The prompt rules the entry to the rows the tree has, so the entry now names the three rows and says in one clause that the conditions the harness record names and nothing plays through the harness, the ceiling rig among them, have no row. **The harness record's table is not edited by this slice** and still reads seven: correcting a design record's own table is not a glossary slice's job, and the entry no longer depends on that count being right.

**The `Batch` amendment, in one sentence.** What stood is everything the entry says a batch is, one run per seed over a consecutive range under one configuration, its size counted in seeds and never in repeats, its tape per seed, and its report as a distribution and never a mean; what changed is the ban on "sweep", which now names a thing of its own, a list of candidates each played as an ordinary batch with one comparison printed across them, so a sweep is made of batches rather than being a loose word for one; what it could not have known is that nothing could name a tuning at a run's start when it was written, so there was nothing a sweep could sweep over. **`sample`, `suite`, `trial` and `experiment` stay on the avoid list untouched**, and the entry's body is otherwise unmoved.

**The two words the prompt's first ruling bans, checked rather than assumed, and not written out here either.** `CONTEXT.md` holds zero occurrences of the first of them. It holds exactly one of the second, which is `Signal lock`'s own avoid-list entry, predates this step and is the reason the step never uses the word. Neither appears in any new entry, either amendment, the commit message or any line of this note, which is why this paragraph names them by reference rather than spelling them.

**Every other glossary entry is untouched.** The diff on `CONTEXT.md` is one inserted entry before `Rig`, one rewritten opening to `Rig`, one appended amendment paragraph under it, two inserted entries before `Batch`, one word dropped from `Batch`'s avoid list and one appended amendment paragraph under it. No other line of the file moved.

**The ADRs this step still owes are not filed, and that is the orchestrator's and not a slice's.** ADR 0063 and ADR 0064 both exist at this tip and both were cited. **Neither `docs/adr/0043-recorded-content-is-self-describing.md` nor `docs/adr/0056-the-director-spends-a-finite-budget-per-section.md` carries a 2026-09-17 amendment yet**, which is expected: the prompts say each is filed before the slice that depends on it, ADR 0056 before slice 4 and ADR 0043 before slice 6. It is written down here so neither slice discovers it as a gap.

**A standing build warning, pre-existing and already ticketed.** `pnpm build` prints "Some chunks are larger than 500 kB after minification" on this tree. It is the roughly 589 kB pixi chunk that `docs/push/open-tickets.md` already carries as a ticket asking for the size to become understood and intentional. Nothing under `src/` is in this commit, so the warning is unchanged by it, and it is named here only so it is not read as new.

**Verification, with results.**

1. `pnpm typecheck`, `pnpm lint`, `pnpm vitest run` and `pnpm build` green in `apps/hungry-grave/`: 157 test files, 2323 passed, 11 expected fail and 2 todo of 2336.
2. `pnpm verify` green at the repo root, twice on the committed tree: format, lint, typecheck and both apps' suites.
3. The test-name diff, **0 added and 0 removed**, 2334 names on both sides, against a baseline captured off the clean tip into `local/step6/slice1-vocabulary-baseline.json` before the first edit. The 2334 against the run's 2336 is `vitest list` not printing a static `test.todo`, and both sides were captured the same way, so the assertion is unaffected.
4. The four constants above, each read off the tree with its file, none of them in the commit.
5. CodeRabbit CLI, one iteration, before the commit. Section 4 carries it.
6. **There is no Mark actor in this slice.** A glossary word is a craft call the orchestrator owns (draft section 7), and the three new entries and two amendments reach him in the session recap rather than as a stall.

**Left for later slices, each named.** The list of magnitudes that are eligible under ADR 0064's rule and carry no row, which the prompts' membership paragraph names (the rest of `tuning.ts`'s declared numbers, `MOB_TYPES` in `src/game/mobs.ts`, `BODY_COST` and `CARDS` in `waves.ts`, the section wave tables, and each line's level curve), belongs in **slice 3**'s section, because slice 3 is what declares the rows that do exist. `docs/design/playing-harness.md` section 6's table of seven is the branch's own **close pass**, with the docs debts of the handoff's open item 7.

## 7. Slice 2 (A1): a run's starting conditions are one record (#142)

**The code commit is `5fa3a9744c`, 36 files, 518 lines added and 250 removed.** Seven are production or shell (`src/game/run.ts`, `src/dev/rigs.ts`, `src/dev/harnessRun.ts`, `src/dev/floorLadderWalk.ts`, `src/tape/playback.ts`, `src/app/screens/game/runSession.ts`, `scripts/record-conditioned.ts`) and 29 are test files following the signature. **No file under `src/game` gained an import and none lost one**, so the fences and the core's cycle guard are untouched by construction rather than by luck.

**The worktree was clean before the first edit.** `git status --short` returned nothing at all, and slice 1's commit `c820109ec0` was the tip.

**The record's name is `StartingConditions` and it lives in `src/game/run.ts`, not in a file of its own.** The name is the prompt's own recommendation and nothing read better with the callers in view: a rig states it, a header records it, a command line assembles it, and every one of those sentences reads. **It has no second export, which is the prompt's own test for staying in `run.ts`, and the reason it has none is the core's cycle guard.** A resolver in its own module would have to reach `birthrightLevels` in `run.ts` while `run.ts` reached back for the resolver, which is a value cycle with `KNOWN_CORE_CYCLES` empty, and moving `birthrightLevels` out would be a split this slice is not permitted. So the type is exported from `run.ts` and the resolution is a private `resolveConditions` beside `createRun`, which is also where every one of the five JSDoc paragraphs went, moved off the old signature onto the field it explains.

**One decision this slice took that the prompt did not name: the record says the size the grave took, never the size that was asked for.** `createRun` builds the grave first and the record reads `grave.size` back, so a run asked for size zero records the floor it actually started at. It is ADR 0027's own rule applied to the record a header will carry in slice 6, and it duplicates nothing: ADR 0003's bounds stay `grave.ts`'s and `createGrave` is still the only thing that clamps. The field's JSDoc says so and a test named _records the size the grave took, so a record never states a size the run did not start at_ pins it.

**`RunState` carries the resolved record whole as `readonly conditions`, and the run and the record share one copy of the roster.** Nothing writes either, `run.levels` is still its own mutable copy because the rules level it up, and a test plays the run forward and reads the record back unchanged.

**The nine call expressions in eight files were all checked and the list was right.** `src/tape/playback.ts`'s `runFromHeader`, `src/dev/harnessRun.ts`'s `playHarnessRun`, `src/dev/floorLadderWalk.ts`'s `stagedRun`, `src/app/screens/game/runSession.ts`'s `begin` and `scripts/record-conditioned.ts`'s `recordTape` moved; `src/dev/digest.ts`'s `runScenario`, `src/app/screens/FrameBudgetScreen.ts` and `scripts/frame-budget.ts`'s two are `createRun(SEED)` and did not move at all. **The three that padded the middle of the list with `undefined` to reach the last argument are `harnessRun.ts`, `floorLadderWalk.ts` and `record-conditioned.ts`**, and all three now pass one record. No call site outside the list was found.

**`Rig` is now a name and one whole `StartingConditions`, and `playHarnessRun` passes `rig.conditions` in one argument.** Every row states all five fields, including the whole pool and a live signal, which are the resolved defaults the sim would have reached anyway: writing them down is what stops a later tune of a default from quietly moving what a rig means, and the table's JSDoc says that. **`rigOf` and `rigs.test.ts`'s uniqueness key were deliberately left**, both still reading the size and the levels alone, because a header carries no score at this tip; the comments around them were rewritten only where the field paths inside them changed. A new test, _applies every fact a row states when a row is applied, and never part of one_, reads the whole record back off a run for every row, which is what makes a half-applied rig inexpressible rather than merely discouraged.

**`record-conditioned.ts`'s local `Conditions` type is gone and the parse produces `Partial<StartingConditions>`.** The partial rather than the resolved record, because a command line states some of the condition and ADR 0063 is explicit that resolving an absence is `createRun`'s job and never a caller's; the shell now names no default of its own at all, where the old type carried `startingSize: number | undefined` to say the same thing in its own spelling. **Every refusal, the usage line and the warning keep their exact wording**, the warning still reading "this run starts holding N and a tape header carries no score, so a readback rebuilds it from zero and diverges at the first checkpoint; the tape records what the run played and can never be verified against it". A rig named on the command line now applies whole rather than in three of its fields, which is the same value and a narrower way to say it.

**Two guards forced a decision about the new field and both got one written down.** `witness.test.ts`'s closed field list and `invariants.test.ts`'s no-NaN coverage each fail on any nested field nobody has decided about, so the eight paths under `conditions` were excluded with a reason apiece: every one of them is a starting condition whose consequence is already folded and already NaN-checked through the live field it seeded, `grave.size`, `levels`, `director.signal.value` and `score`. **That is the mechanical reason `WITNESS_VERSION` did not have to move**, and it is now written in the fold's own table rather than only in the prompts.

**The order of work departed from the prompt's, and the proof was taken a harder way to make up for it.** The prompt asks for the tests first and red; what happened is that the 54 mechanical call-site rewrites and the signature landed first, because the migration is one codemod over a seam 29 files wide and a red run in the middle of it is a compile error rather than a promise. **So every new test was proved to have teeth by breaking the code under it instead**: dropping `signalLock` from `runFromHeader`'s record turned the new playback test red on its own, and dropping the score from the resolver turned five tests red across `run.test.ts` and `rigs.test.ts`. Both breaks were reverted and the suite re-run green. The record's shape was not shaped by what was easy to type: the five fields are the prompt's own ruling, read off `createRun`'s existing signature.

**Eight tests were added, none was deleted, skipped or weakened, and every migrated test kept its name and its promise.** The one whose body needed more than a signature change is _starts holding the score it was asked for, and nothing else about the run differs_, whose whole-run comparison now takes the score out of the record as well as off the run, because the one asked-for number reads in both places and neither is "something else". The new tests are six on the record in `run.test.ts`, one on a rig applied whole in `rigs.test.ts`, and one at the playback seam, _rebuilds the run its header describes, every pinned fact of it at once_, which pins all four header facts away from their defaults in a single tape.

**The conditioned tape re-recorded at this tip is the same run.** Seed 424242, 900 ticks, `rig=birthright`, recorded before the first edit at `c820109ec0` and again on the committed tree at `5fa3a9744c`: both 8,667 bytes, with 82 differing bytes between offsets 75 and 201. **Decoding both says those 82 are the three fields that describe the build and not the run**, `commitHash`, `buildIdentity` and `recordedAt`, and the two commit hashes are exactly the two commits. Every other header field, all 900 commands, all 16 checkpoints, the trailer and the observations are identical, and both tapes read back `verified`. **The prompt's "byte-identical apart from `recordedAt`" cannot hold across a commit**, because the header records the commit and the build: a later slice comparing a tape across its own code commit should compare decoded tapes on those three fields rather than raw bytes.

**The batch on twelve seeds moved nothing.** `shaky-short`, seeds 900100 to 900111, `rig=birthright`, played at the starting tip and again on the committed tree: 12 of 12 verified both times, with `counts`, `spreads`, `byLine`, `sectionSpans`, `directedAdds`, `ceilingStops`, `verified`, `unverified`, `unfinished` and `readingsVersion` all identical between the two reports. Only `identity.recordedAt` and `identity.commitHashes` differ. **No event count moved**, which is the stop this slice was most exposed to.

**Replay determinism at this tip.** Seed 909 under `shaky-short` played twice on the committed tree: 5,997 ticks and 56,402 bytes both times, three differing bytes at offsets 203 to 205, which decoding both headers says is `recordedAt` alone. All 5,997 commands, all 100 checkpoints, the trailer and the observations are identical and both verify.

**The four constants and `GOLDEN`, each read off this slice's own tip.** `WITNESS_VERSION` **11** (`src/game/witness.ts`), `READINGS_VERSION` **9** (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` **4** (`src/tape/wireCodes.ts`), `GOLDEN`'s checksum **`-2049717150`** (`src/dev/digest.ts`) with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2`. **None of the four files is in either commit** and `digest.test.ts` was green at every run.

**The fences, each green and named.** _src/game imports only from src/game_, _src/input imports only from src/input and src/game_, _src/dev imports only from src/dev and src/game and src/tape_, _src/tape imports only from src/tape and src/game_, _every test file imports only from inside its parent folder's subtree_, _carries no value-import cycle beyond the ones written down_ with `KNOWN_CORE_CYCLES` still empty, _reaches nothing in game/stage/stage from game/caps_, plus `lineAgnosticPolicies.test.ts`, `executionFence.test.ts`, `harnessStatesNoTarget.test.ts` and `comparisonDeclared.test.ts` whole.

**Verification, with results.** `pnpm typecheck`, `pnpm lint`, `pnpm vitest run` and `pnpm build` all green in `apps/hungry-grave/`: 157 test files, 2,331 passed, 11 expected fail and 2 todo of 2,344. `pnpm verify` green at the repo root **twice on the code commit's tree**. **The test-name diff is 8 added and 0 removed**, 2,334 names against 2,342, taken against a baseline captured off the clean tip into `local/step6/slice2-a1conditions-baseline.json` before the first edit. The tape, the batch and the determinism run are above. **The build's "Some chunks are larger than 500 kB" warning is the pre-existing pixi chunk `open-tickets.md` already carries**, unchanged by this commit. **There is no Mark actor in this slice**: nothing a player can meet changed, and this tip is not a deploy.

**Left for later slices, each named.** **Slice 6** owns the header carrying the record whole, the `FORMAT_VERSION` 4 to 5 move with it, widening `rigOf` once a header can hold a score, and with it the `rig=ladder` batch gap this slice deliberately did not close. **Slice 3** declares the tuning record and **slice 4** adds it to `StartingConditions`; no field for it exists here and the caps are still module constants derived at import. Nothing this slice was asked for was left undone.

## 8. Slice 3 (A): the tuning record exists and nothing reads it (#142)

**The code commit is `a9d2ecad8e`, 3 files, 355 lines added and none removed**, which sits inside the prompt's own estimate of 2 to 3. One file is created, `src/game/tuningRecord.ts`; one is its test, `src/game/__tests__/tuningRecord.test.ts`; and the only file edited is `src/__tests__/boundary.test.ts`, which gains the sibling fence. **No file under `src/game` outside the new one changed at all**, so `tuning.ts`, `waves.ts` and `director.ts` keep every export, every value and every reader they had, which is what the prompt permits: the only edit in any of the three is none.

**The worktree was clean before the first edit.** `git status --short` returned nothing and slice 2's docs commit `b996bdc359` was the tip, with both of slice 2's commits in the tree.

**The four constants and `GOLDEN`, read off that tip.** `WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 4, and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2`. Every one matches the prompts' header line, so nothing in this slice started from a stale figure, and none of the four files is in either commit.

**The module is `src/game/tuningRecord.ts` and the type is `TuningRecord`**, both the prompt's own recommendation and both what the glossary's Tuning record entry says. Its public interface reads in one block at the module's end: `DEFAULT_TUNING`, `resolveTuning`, `tuningRows`, and the types `TuningRecord`, `StageTuning`, `ScoreTuning`, `TuningOverlay` and `TuningRow`. **It imports nothing**, which `boundary.test.ts`'s new fence asserts rather than a comment claiming it.

**The ten rows, their dotted names and their default values.**

| Dotted name | Default | The constant it equals |
| --- | --- | --- |
| `stage.processionPurse` | 116 | `PROCESSION_PURSE` (`src/game/stage/waves.ts`) |
| `stage.crowdPurse` | 388 | `CROWD_PURSE` (same file) |
| `stage.vigilPurse` | 0 | `VIGIL_PURSE` (same file) |
| `stage.quietIntervalMinimumSeconds` | 4 | `QUIET_INTERVAL_MINIMUM_SECONDS` (same file) |
| `stage.quietIntervalMaximumSeconds` | 8 | `QUIET_MAX_TICKS / TICK_HZ` (`src/game/director.ts`) |
| `score.trashKillScore` | 100 | `TRASH_KILL_SCORE` (`src/game/tuning.ts`) |
| `score.bleedCapInKills` | 20 | `SCORE_BLEED_CAP / TRASH_KILL_SCORE` |
| `score.bossHealthPerKill` | 100 | `TRASH_KILL_SCORE / SCORE_PER_BOSS_HEALTH` |
| `score.sourceKillInKills` | 24 | `SOURCE_KILL_SCORE / TRASH_KILL_SCORE` |
| `score.mealAtMaxedInKills` | 1 | `MEAL_AT_MAXED_SCORE / TRASH_KILL_SCORE` |

**Four of the five score rows hold their constant's multiplier and never its product**, which is the form each constant is already written in and the reason the default is identical by arithmetic rather than by a second copy of a number. `score.bossHealthPerKill` is the one that reads as a ratio the other way round, the points of boss health one trash kill is worth, because `SCORE_PER_BOSS_HEALTH` is `TRASH_KILL_SCORE / 100` and 100 is the figure its own JSDoc argues for. **The tenth row's constant lives in neither `tuning.ts` nor `waves.ts`**, and `director.ts` already exports `QUIET_MAX_TICKS`, so reading it in seconds cost that file no edit.

**Every row is still a second spelling of its constant at this tip**, held equal by the identity test and by nothing else. The module's own JSDoc says so and says the duplicate retires with the constants, so the slice that finally deletes them deletes that test in the same commit.

**The resolver's bound and the words it rejects with.** `resolveTuning(overlay)` fills every absent row from the default a group at a time, then asserts `stage.quietIntervalMinimumSeconds` sits at or below `stage.quietIntervalMaximumSeconds`. A record failing it throws with both dotted rows and both values named: `stage.quietIntervalMinimumSeconds 9 sits above stage.quietIntervalMaximumSeconds 8, so the director would draw over a negative span`. **That is the whole of what it refuses**, and a record our own code produced cannot fail it; parsing a raw name a person typed is slice 7's edge, so nothing unknown can reach here. The overlay is a written interface per group, `stage?: Partial<StageTuning>` and `score?: Partial<ScoreTuning>`, and never an intersection, so naming one row of one group leaves the group's other rows absent rather than required.

**The dotted names are walked off the nesting and no list of them exists in production code.** `tuningRows` walks the record's own groups and each group's own rows, so a row added to the type appears on every text surface without anything else being edited. The only hand-written list of the ten is the expected value inside the test that pins the walk, which is where one belongs.

**The eligible magnitudes this step does not carry, by name, which is the next round's own work.** Under ADR 0064's rule each is a magnitude a batch reading can move that is neither a derivation nor a safety net, and each is unrowed only because no named sweep reads it yet: the rest of `src/game/tuning.ts`'s declared numbers (`BASE_SPEED`, `SCROLL_SPEED`, `FRESHNESS_PAYOUT_FLOOR`, `GRAVE_ASPECT`, `SIZE_CEILING`, `SIZE_START`, `SIZE_FLOOR`, `HIT_SHRINK`, `INVULNERABLE_TICKS`, `CORPSES_TO_CEILING` and `FEAST_PAYOUT`); `MOB_TYPES` in `src/game/mobs.ts`; `BODY_COST` and `CARDS` in `src/game/stage/waves.ts`; the section wave tables; and each weapon line's level curve. **They are added one commit at a time, each with its reader**, because a row nothing reads is worse than no row. The exclusions are unchanged and are not on this list: `MOB_CAP`, `MOB_FIRE_CAP` and `CORPSE_CAP` are derivations, `SKULL_CAP` and `WISP_CAP` are safety nets by their own JSDoc, `TRASH_CORPSE_PAYOUT` and `RESERVOIR_CAPACITY` are derivations whose whole point is that the feast identity is true by construction, and the harness's hand rows in `src/dev/configurations.ts` are a new configuration rather than a moved row.

**ADR 0064 is at this tip and is this slice's own decision**, `docs/adr/0064-a-tuning-magnitude-is-a-row-of-one-record-resolved-at-the-shell.md`, filed by the orchestrator at `8924d5b397`. Every sentence of it that this slice can honour, the grouping, the dotted name, the default equalling the constants, the eligibility half and the core never importing the record, is honoured; the rest of it, the shell resolving and the caps deriving per run, is slices 4 and 5.

**Ten tests were added, none deleted, skipped or weakened.** Nine are `tuningRecord.test.ts`'s and one is the fence. Every one of the nine was written first and watched fail against a stub whose default was zeros and whose resolver and walk threw, so each failed as an unmet promise and never as a missing module. **The first test is ten assertions against ten constants with no loop over a pairing**, because a loop proves the list somebody typed and not the values.

**Nothing turned red anywhere, which was the claim to check rather than the hope.** 158 test files and 2,354 tests green before the commit and twice after it, with the same 11 expected failures and 2 todos throughout.

**The test-name diff: 2,342 names in the baseline, 2,352 now, 10 added and 0 removed.** The baseline is this branch's own tip, captured before the first edit into `apps/hungry-grave/local/step6/tests-baseline-arecord.json`, which is outside version control and in no commit.

**The fences, each by title, all green.** `src/game imports only from src/game`, `every test file imports only from inside its parent folder's subtree`, `no screen imports another screen`, `no module under src/app reaches for engine()`, `carries no value-import cycle beyond the ones written down` with `KNOWN_CORE_CYCLES` still empty, `reaches nothing in game/stage/stage from game/caps`, `the lock's module imports nothing`, `the tape codec imports nothing from the director`, `src/game/storm.ts reaches what it can hit through the seam` and its four siblings, `blocks './step' from src/game/sim.ts` and its six siblings, `orders no reading against a number of its own`, and `every reading on a verified report carries a declared comparison meaning`. **The new sibling is `the tuning record's module imports nothing`**, under `the tuning record is owned by a module with nothing behind it`, shaped on the lock's own fence; it needs no teeth test of its own because the lock's `counts a package as readily as a path, because either one is a dependency` already proves `importsOf` catches a path and a package alike, type-only imports included.

**Replay determinism at this tip.** Seed 20260820 under `shaky-short`, played headlessly and its tape measured off the bytes: 6,350 ticks, sealed, 59,728 bytes, `verified`, 1 of 1. The batch output went to `local/step6/arecord-determinism` and is in no commit.

**`pnpm verify` green twice on the code commit's tree**, plus `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green from `apps/hungry-grave/` before it.

**Nothing was left for a later slice that this slice could have done.** Slice 4 is the first consumer and puts the record on the starting conditions; slice 5 takes the score group's readers; slice 6 owns the header and the one `FORMAT_VERSION` move; slice 7 owns the candidates and the parsers, which is where a raw name is refused.

## 9. Slice 4 (B1): the record reaches the run, and the three caps are derived per run from it (#142)

**The code commit is `f5569b2330`, 22 files, 688 lines added and 125 removed.** No file is created, deleted, merged or split. The worktree was clean before the first edit, `git status --short` returned nothing, the tip was slice 3's docs commit `4001925e44`, and both of slice 3's commits were in the tree.

**The four constants and `GOLDEN`, read off that tip and off the code commit's own tree.** `WITNESS_VERSION` 11, `READINGS_VERSION` 9, `FORMAT_VERSION` 4, and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2`. Every one matches the prompts' header line, none moved, and none of the four files is in either commit.

**The three caps, before and after, as numbers read off a default run**: the mob cap 481, the mob-fire cap 434, the corpse cap 704, and the same three after. They are printed by a scratch script under `local/step6/` that builds `createRun(20260820)` and reads the pool lengths, which is the honest reading: the pool is the thing a field has to fit in, and it is built at the cap.

**The shape, in one paragraph.** `StartingConditions` gains `tuning: TuningRecord`, required on the resolved record and optional in the `Partial` a caller passes, resolved inside `createRun` through `resolveTuning(asked.tuning ?? {})` so that every record in the tree enters by the one door and the quiet interval's bound is asserted behind it. `RunState` gains `conditions.tuning` and `caps`, a readonly `Caps` of `mobs`, `mobFire` and `corpses`, derived once in `createRun` and never written again. `caps.ts` exports `mobCap`, `mobFireCap`, `corpseCap` and `capsFor`, each taking the record, with `directedInside` taking the quiet interval's minimum as a number because that is the one row all three read. `MOB_CAP`, `MOB_FIRE_CAP`, `CORPSE_CAP` and `REVENANT_FIRE_PEAK` are gone as constants; `TRANSIT_SECONDS`, `WORST_BOSS_PATTERN`, `TREASURE_ALLOWANCE`, `SKULL_CAP` and `WISP_CAP` are untouched. The three pool builders take a cap, `createMobPool(cap)` and its two siblings, and `run.ts` is their one caller.

**Every cap's JSDoc argument still holds word for word**, which was the check that the arithmetic did not move: the corpse cap's proof, the mob cap's derivation and the mob-fire cap's tightness each read the same terms in the same order, and the only sentence added to the file says that all three take a record because a legal record is open.

**The readers, by file.** The pools in `run.ts`; the three `checkPool` calls in `invariants.ts`, now `state.caps.mobs`, `state.caps.mobFire` and `state.caps.corpses`, every check keeping its meaning, its severity and its fault identity; the four sprite pools in `FieldRenderer`; the two comparisons and the message in `FrameBudgetScreen`; and the bench shim. `SKULL_CAP` and `WISP_CAP` are still read off the module by `invariants.ts`, which is right: they are safety nets with no row.

**The scratch array stayed where it is and grows on first use.** `stormTargets.ts`'s `SLOTS` is declared empty, `growSlotsTo(state.mobs.length + 2)` runs at the top of `stormTargets`, and the module no longer imports `caps.ts` at all. `slotAt`'s JSDoc says where the size comes from now. **Two comments went false and both were rewritten in the same commit**: `frameBudgetCaps.ts`'s sentence naming the scratch as the reason the bench raises its ceiling before the game is loaded, and `scripts/frame-budget.ts`'s sentence saying its dynamic import exists because raising the ceiling is work done when a module loads. Nothing in the tree reads a cap when a module loads any more, and what decides a pool's size is the `sizePoolsFor` call before each `createRun`.

**The bench keeps its concept and its named setup.** `sizePoolsFor` keeps its name and its "world-changing setup is named" shape and now sets two nullable bench figures; `mobCap` and `corpseCap` answer the bench's when one is set and the shipped derivation's before, and `capsFor` is built out of the three so the shim cannot disagree with itself. It exports every name `caps.ts` exports, plus `sizePoolsFor`, and both types. **It was run once**: `pnpm vite-node --config vite.frame-budget.config.ts scripts/frame-budget.ts` printed all six of round 0's rows, including 400 / 1000, which is a field the shipped corpse cap of 704 refuses, so the bench still stands what it could stand before.

**The new fence is `the caps derivation and the core read the record off the run`**, in `boundary.test.ts` beside the cap derivation's own. It asserts that no shipped module under `src/game` but `tuningRecord.ts` takes `DEFAULT_TUNING`, which is the half of the rule a fence inside one root can say: the rendering boundary already forbids `src/game` reaching `src/app`, so what was left to guard is a core reader answering the build's own numbers whatever record its run started under. Its teeth test hands the predicate two sources, one taking the value and one taking the type alone, because taking the type is not taking the record.

**The batch: twelve seeds, identical.** `steady-middling` at the birthright rig, seeds 20260820 to 20260831, played before the first edit and again on the finished tree. **Every reading in `report.json` is identical per seed** with `identity.recordedAt` and `identity.commitHashes` stripped, which is 12 verified runs, the same tick counts, the same scores, the same kills, the same directed adds and the same spreads. The tapes' byte counts differ by a few bytes because the header carries the build identity and the second batch ran against an uncommitted tree, which is why the comparison is the report and not a checksum of the bytes.

**Replay determinism at this tip.** Seed 20260820 under `shaky-short`, played headlessly and measured off its own bytes: 6,350 ticks, sealed, 59,728 bytes, `verified`, 1 of 1, every figure identical to slice 3's.

**The rendered check.** `pnpm build` then `pnpm exec vite preview`, driven with `playwright-cli` against the built app at 393 by 660, RISE pressed and the field read off the screenshot: bodies across the whole field, corpses down, a power-up standing, the grave and the belch meter drawn, the HUD counting ticks. **Zero console errors and seven warnings**, the same two families every slice of step 5 saw, the audio autoplay policy and headless Chromium's software renderer. It was run twice, the second time after the CodeRabbit fix touched the renderer's visibility path, because a screenshot taken before an edit to the renderer proves nothing about it.

**The tests: 14 added, none deleted, skipped or weakened.** Four on the derivations in `caps.test.ts`, three in `run.test.ts`, one in `invariants.test.ts`, two in `stormTargets.test.ts`, two in `FieldRenderer.test.ts` and two for the fence. Each was written before the thing it tests and watched fail. **Two existing tests changed shape and neither changed its promise**: `run.test.ts`'s two starting-condition walks now read the record's sixth field, because the live state a condition can be read back against does not include a record whose whole consequence at this tip is the caps beside it, so the caps are asserted instead. **The test-name diff: 2,352 names in the baseline, 2,366 now, 14 added and 0 removed.** The baseline is this branch's own tip captured before the first edit, into `local/step6/tests-baseline-b1caps.json`, which is outside version control and in no commit.

**The fences, each by title, all green.** `src/game imports only from src/game`, `every test file imports only from inside its parent folder's subtree`, `no screen imports another screen`, `no module under src/app reaches for engine()`, `carries no value-import cycle beyond the ones written down` with `KNOWN_CORE_CYCLES` still empty, `reaches nothing in game/stage/stage from game/caps`, `the lock's module imports nothing`, `the tuning record's module imports nothing`, `the tape codec imports nothing from the director`, `src/game/storm.ts reaches what it can hit through the seam` and its four siblings, `blocks './step' from src/game/sim.ts` and its six siblings, `orders no reading against a number of its own`, and `every reading on a verified report carries a declared comparison meaning`. **The new one is `the caps derivation and the core read the record off the run`**, with its two tests.

**`pnpm verify` green twice on the code commit's tree**, plus `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green from `apps/hungry-grave/` before it. 158 test files, 2,355 passing, the same 11 expected failures and 2 todos throughout.

**Three things this slice decided that a later one may want to reopen, all named rather than buried.**

1. **The three screens pass the default record's caps to `attach`, because no run is in hand where they dress their field.** `dressField` runs from a constructor and from `reset()` in both `GameScreen` and `ReplayScreen`, and `FrameBudgetScreen.prepare` attaches before it makes its first run. Every run at this tip derives exactly those caps, so nothing differs; the seam takes the caps and the pools grow on every attach, which is what the ruling asks, and **slice 6 is where a replayed tape first carries a record of its own and that attach site has to take the run's**.
2. **`src/dev/rigs.ts`'s three rows name `DEFAULT_TUNING`.** A rig is the resolved starting condition (ADR 0063) and a required field cannot be left implicit in one, so each row says the record it plays under. A run under a record of its own is a candidate and carries its own name, which is slice 7's.
3. **`mobCap` is `peakLive` under a second name**, exactly as `MOB_CAP` was: the derivation is the stage's peak and the cap is the policy, and both are exported because `caps.test.ts` reads each in its own right.

**Nothing was left for a later slice that this slice could have done.** Slice 5 wires the purses, the quiet interval's director reader and the five score rows; the quiet interval where the caps derivation reads it is the only row this slice touched. Slice 6 owns the header and the one `FORMAT_VERSION` move, and a record on the run that no tape records is exactly the state this slice leaves.

## 10. Slice 5 (B2): every admitted reader takes the record off the run (#142)

**The code commit is `82e9ab71f6`, 31 files, 965 lines added and 465 removed.** One file is created, the fence, and none is deleted, merged or split. The worktree was clean before the first edit, `git status --short` returned nothing, the tip was slice 4's docs commit `4c108a18ce`, and both of slice 4's commits were in the tree.

**The four constants and `GOLDEN`, read off that tip and off the code commit's own tree.** `WITNESS_VERSION` 11 (`src/game/witness.ts`), `READINGS_VERSION` 9 (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` 4 (`src/tape/wireCodes.ts`), and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` (`src/dev/digest.ts`). Every one matches the prompts' header line, none moved, and none of the four files is in either commit. `GOLDEN` held by arithmetic exactly as the ruling predicted: every product is the number it was, so the scenario's two scripted kills still pay 200 between them and `digest.test.ts`'s nine tests were green at every run, the golden itself included.

**Every reader wired, by file and by row.**

| Reader | Row it now takes off the run |
| --- | --- |
| `src/game/grave.ts`, `bleedCapOf` under `bleedScore` | `score.bleedCapInKills` times `score.trashKillScore` |
| `src/game/mobs.ts`, the kill payment in `damageMob` | `score.trashKillScore` times the row's own `scorePayoutInKills` |
| `src/game/bosses/phases.ts`, `bossHealthRateOf` under `damageBoss` | `score.trashKillScore` over `score.bossHealthPerKill` |
| `src/game/stage/setPiece.ts`, `sourceKillBonusOf` under `damageSetPiece` | `score.sourceKillInKills` times `score.trashKillScore` |
| `src/game/swallow.ts`, `mealAtMaxedOf` under `swallow` | `score.mealAtMaxedInKills` times `score.trashKillScore` |
| `src/game/stage/stage.ts`, `directorGranted` under `grantPurse` and `openingDirector` | `stage[section.purse]`, which is one of the three purse rows |
| `src/game/director.ts`, `quietMinTicks` and `quietMaxTicks` under `directorSpend` | `stage.quietIntervalMinimumSeconds` and `stage.quietIntervalMaximumSeconds` |
| `src/game/caps.ts`, unchanged from slice 4 | `stage.quietIntervalMinimumSeconds` |

**Every payment is a named private helper taking `RunState` rather than an expression inline**, because the arithmetic each one does is a sentence the site cannot show: the rows are stated in trash kills and the payment is in points, so the conversion is the thing that wants a name. Each helper's JSDoc carries why its row is stated the way it is, which is the half of the argument the row's own annotation does not hold.

**The nine constants deleted, and where each last reader moved to.**

| Constant | Its file | Where its last reader went |
| --- | --- | --- |
| `TRASH_KILL_SCORE` | `src/game/tuning.ts` | `mobs.ts`'s kill payment, plus the four other score readers that state their row against it |
| `SCORE_BLEED_CAP` | same | `grave.ts`'s `bleedCapOf`, and `src/dev/rigs.ts`'s ladder row through `DEFAULT_TUNING` |
| `SCORE_PER_BOSS_HEALTH` | same | `phases.ts`'s `bossHealthRateOf` |
| `SOURCE_KILL_SCORE` | same | `setPiece.ts`'s `sourceKillBonusOf` |
| `MEAL_AT_MAXED_SCORE` | same | `swallow.ts`'s `mealAtMaxedOf` |
| `PROCESSION_PURSE` | `src/game/stage/waves.ts` | `stage.ts`'s `SECTIONS`, as the row name `'processionPurse'` |
| `CROWD_PURSE` | same | the same table, as `'crowdPurse'` |
| `VIGIL_PURSE` | same | the same table, as `'vigilPurse'` |
| `QUIET_INTERVAL_MINIMUM_SECONDS` | same | `director.ts`'s `quietMinTicks`, and `caps.ts` since slice 4 |

**Two more names went and neither was a magnitude.** `QUIET_MIN_TICKS` and `QUIET_MAX_TICKS` in `director.ts` are now `quietMinTicks(tuning)` and `quietMaxTicks(tuning)`, which is step (e)'s own instruction: the maximum's 8 seconds came off `director.ts` and onto `stage.quietIntervalMaximumSeconds`, so the draw's span is the run's own on both ends. **Nothing else in `tuning.ts` or `waves.ts` was touched**: `BASE_SPEED` through `RESERVOIR_CAPACITY` and every wave table keep every value and every reader they had.

**Each deleted constant's JSDoc moved onto its row rather than dying with it**, which is the part of this slice that is not a rename. The five score constants carried the whole argument for their figures, the researched bands, the two named failure modes, the swamping refusal and what each is re-read against; the three purses carried their own derivations off the wave tables. All of it is now on `ScoreTuning` and `StageTuning` in `src/game/tuningRecord.ts`, beside the row it argues for. **That is where the prompts' own rule puts it**: a first figure is annotated with what it is set against and what would move it, and a sweep reads the row rather than the constant now.

**`Section.purse` is `PurseRow | null`**, where `PurseRow` is the record's own stage rows ending in `Purse`, derived from `StageTuning` so a row renamed there is a compile error in the table rather than a string nobody reads. `directorSpend`'s null check keeps its meaning exactly: `section.purse === null` is still a section the director may not touch, and the grant reads `tuning.stage[section.purse]` on the other branch, so the Vigil's zero is still the third reading. **The five `SECTIONS` importers outside `stage.ts` were checked one at a time and none reads `purse`**: `src/dev/harnessRun.ts` reads `waves` and `boss`, `src/dev/batchReport.ts` reads `name` (its two `purse` hits are `tuning.pressure.purseLeftBySection`, a reading and not the column), `src/app/screens/game/BackgroundRenderer.ts` indexes the table for a section's name, `src/dev/readings/sectionTimeline.ts` reads `name`, and `src/dev/readings/arrivals.ts` reads `directed`. **Only two sites in the whole tree read `.purse`**, `director.ts`'s null check and `stage.ts`'s grant, plus `director.test.ts`'s two reads which now assert the row name.

**The fence is `every row of the tuning record has a reader`**, in its own file `src/__tests__/everyTuningRowHasAReader.test.ts`, named for the behaviour it guards. It walks every shipped module under `src/game` but `tuningRecord.ts` and fails if a row's leaf name appears in none of them. **The mechanism is `boundary.test.ts`'s source walk with one addition: comments are stripped first**, block comments before line comments. That is the truer mechanism the prompt invited, and the reason is filed two sections above this one: `boundary.test.ts`'s `importsOf` reads the word "import" in prose as an import, and a row named in a JSDoc argument and read nowhere would pass a raw text search while a candidate moving it changed nothing at all. Three teeth tests stand beside it: a string literal counts as readily as a property, because `'processionPurse'` is how a section names its row; a row named only in a comment does not count; and a name nothing in the core spells answers with no readers. **It was also proved against the real tree**: `swallow.ts`'s one reference to `mealAtMaxedInKills` was temporarily replaced with a positional read and the fence went red naming that row, then restored.

**The batch: twelve seeds, identical.** `steady-middling` at the birthright rig, seeds 20260820 to 20260831, played before the first edit and again on the finished tree. **The two `report.json` files are identical in every field but `identity.recordedAt`**, which is the wall clock; `commitHashes`, `configuration`, `firstSeed`, `mobWidths`, `rigs` and `seeds` all match, and so does every reading and every event count per seed. 12 of 12 verified on both sides.

**The two probes, whole**, off `local/step6/b2readers-probe.ts`, which is in no commit. This is the first evidence in the step that the record does anything at all.

**Probe 2, the bleed cap doubled**, and it is clean. The row moves from 20 to 40 trash kills at a unit of 100, and one floor hit on a run holding 100,000 points takes 2,000 under the default and 4,000 under the candidate, leaving 98,000 against 96,000. The direction the row predicts, exactly.

**Probe 1, the Procession's purse, and it took four candidates rather than two to say anything**, which is a finding rather than a failure. The Procession alone, played to its own boundary on four seeds, at purses of 116 (the default), 58, 12 and 0:

| Seed | granted 116 | granted 58 | granted 12 | granted 0 |
| --- | --- | --- | --- | --- |
| 20260820 | 3 adds, spent 11, left 105 | 3 adds, spent 11, left 47 | 3 adds, spent 11, left 1 | 0 adds |
| 20260821 | 2 adds, spent 9, left 107 | 2 adds, spent 9, left 49 | 2 adds, spent 8, left 4 | 0 adds |
| 20260822 | 2 adds, spent 11, left 105 | 2 adds, spent 11, left 47 | 2 adds, spent 11, left 1 | 0 adds |
| 20260823 | 2 adds, spent 11, left 105 | 2 adds, spent 11, left 47 | 2 adds, spent 11, left 1 | 0 adds |

**The record reaches the director and the row is what it grants**: `granted` tracks the row exactly on every line, and at zero the director buys nothing at all on any seed. **What halving it does not do is change the run**, because the Procession never spends more than 11 of its 116 under this hand, so neither 116 nor 58 ever binds. **That is the sweep list's own finding, measured**: the prompts' header says the purses are priced above what the quiet interval lets a section spend, and this is about nine per cent of the Procession's purse reaching the field. At 12 the gate finally bites, and seed 20260821 shows it doing so on the card rather than on the add, spending 8 where it spent 9. **It is filed here and no row moved**, which is the stuck rule: a measurement arguing a ruled row should move is a finding for the note.

**Replay determinism at this tip.** Seed 20260820 under `shaky-short`, played headlessly and measured off its own bytes: 6,350 ticks, sealed, 59,728 bytes, `verified`, 1 of 1. **Every figure is identical to slices 3 and 4's**, which is the cheapest statement that a run started under no record plays the run it played before this step.

**The tests: 13 added, 1 removed, none skipped or weakened.** Six are the direction tests, one per group's rows: the bleed at two records, a kill at two units for two mob types, a boss hit at two rates, the source's bonus at two rows, a meal at two rows, and the quiet interval drawn inside a band disjoint from the build's own. Three are the purse's, in `stage.test.ts`: each directed section granted the row it names for all three, a section with no purse granting nothing, and the opening grant halving with the row. Four are the fence's. **Each was written before the reader it tests and watched fail as an unmet promise**, never as a missing module.

**The one removal was planned and is recorded in section 8**: `tuningRecord.test.ts`'s *holds exactly the values the build was compiled with* held each row equal to the constant it was lifted from, and the module's own JSDoc said "the slice that finally deletes them deletes that test in the same commit". **Nothing it pinned was lost.** The rows are now the only spelling, so an identity against a constant that no longer exists has no content; the relations those constants stood in are still pinned, moved onto the record in `tuning.test.ts`, which reads the five score rows off `DEFAULT_TUNING` and keeps every assertion it had.

**The test-name diff: 2,366 names in the baseline, 2,378 now, 13 added and 1 removed.** The baseline is this branch's own tip captured before the first edit, into `local/step6/tests-baseline-b2readers.json`, which is outside version control and in no commit.

**The fences, each by title, all green.** `src/game imports only from src/game`, `every test file imports only from inside its parent folder's subtree`, `no screen imports another screen`, `no module under src/app reaches for engine()`, `carries no value-import cycle beyond the ones written down` with `KNOWN_CORE_CYCLES` still empty, `reaches nothing in game/stage/stage from game/caps`, `the caps derivation and the core read the record off the run`, `the lock's module imports nothing`, `the tuning record's module imports nothing`, `the tape codec imports nothing from the director`, `src/game/storm.ts reaches what it can hit through the seam` and its four siblings, `blocks './step' from src/game/sim.ts` and its six siblings, `orders no reading against a number of its own`, and `every reading on a verified report carries a declared comparison meaning`. **The new one is `every row of the tuning record has a reader`**, with its four tests.

**No import direction changed and no module gained a value import of the record.** `director.ts` and `stage.ts` each gained a type-only import of `TuningRecord`, which is what `caps.ts` already had and what the cycle guard is written to ignore; every reader takes its record as an argument off the run, and `KNOWN_CORE_CYCLES` is still empty.

**`pnpm verify` green twice on the code commit's tree**, plus `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green from `apps/hungry-grave/` before it. 159 test files, 2,367 passing, the same 11 expected failures and 2 todos throughout.

**Two things found false against the tree, both small.**

1. **The prompt names the kill unit's row `score.trashKill` and the tree spells it `score.trashKillScore`.** Slice 5's second ruling writes it that way; section 8's own table and `tuningRecord.ts` both say `trashKillScore`, which is what was followed. The other nine dotted names in the ruling match the tree exactly.
2. **`scorePayments.test.ts` was expected to redden and did not.** The prompt's reddening list names it first, and it imports no score constant at all: it drives each of the five payers and asserts that exactly one payment is announced under each input's own name, which is a property no magnitude touches. **The realistic count of 15 to 22 files ran under**, and the true figure is 31, of which 22 are test files.

**One thing filed rather than fixed, because the file is barred from both commits.** `src/dev/digest.ts`'s re-pin paragraph says "the shambler's row pays one `TRASH_KILL_SCORE`". The sentence is still true in substance, the shambler's row pays one trash kill, but it names a constant that no longer exists. `digest.ts` is in neither commit by this slice's own rule, so it is left for a later docs pass. `src/app/screens/scoreReading.ts` carried the same stale name and was reworded, because nothing bars that file.

**CodeRabbit, one iteration: 31 files reviewed, four findings, all major, all four declined.** All four are one claim wearing four coats: that `resolveTuning` should reject a row that is non-finite, zero, negative or non-integral before a run starts, raised against `phases.ts`'s division by `bossHealthPerKill`, `mobs.ts`'s multiply by `trashKillScore` and twice against `director.ts`'s `stream.nextInt` span. **It is right about where that validation goes and wrong about when**, which is the same slice boundary section 4 already records against slice 3. Nothing at this tip can put such a value into the resolver: every record in the tree is one our own code produced, which is repair by origin, and **parsing a raw name a person typed is slice 7's edge**, which this slice's own "what is not your job" assigns to the candidates, the command line and the URL. The worst case the review names is also already defended: `rng.ts`'s `nextInt` refuses a bound outside 1 to 4294967296 with a `RangeError` naming the bound, by its own JSDoc, because "a hang with no diagnostic is the worst failure a computed bound can have". **The substance is filed here for slice 7**, which is the commit that first lets a person's typed value reach the resolver and therefore owns the check.

**Nothing was left for a later slice that this slice could have done.** Slice 6 owns the header and the one `FORMAT_VERSION` move, and the probes above are the reason it has to: a run under a moved record cannot be replayed from a header that does not carry it. Slice 7 owns the candidates, the two command surfaces and the edge that parses a person's typed row. Slice 8 owns the sweep runner and the report's identity.

## 11. Slice 6 (C): the tape header carries the whole starting condition, and the format moves 4 to 5 (#142)

**The code commit is `47c4543d25`, 39 files, 1,579 lines added and 625 removed.** One file is created, `src/tape/startingCondition.ts`, and one test file beside it; none is deleted, merged or split. The worktree was clean before the first edit, `git status --short` returned nothing, the tip was slice 5's docs commit `000dbf95bf`, and both of slice 5's commits were in the tree.

**The four constants, read off that tip and off the code commit's own tree.** `WITNESS_VERSION` 11, `READINGS_VERSION` 9, `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2`, and `FORMAT_VERSION` 4 before and **5 after**. That last one is the step's whole ledger and it is spent here; `witness.ts`, `readingsVersion.ts` and `digest.ts` are in neither commit.

### The block, and the four fields it replaced

`TapeHeader` loses `startingSize`, `recordedRoster`, `startingLevels` and `signalLock`, and gains one `startingCondition`: a `readonly StartingConditionEntry[]` of a name string and a plain number, written length-prefixed as a u16 count and then one length-prefixed name and one f64 apiece, straight after the seed where the four positional fields used to begin. **Seventeen rows today**: `startingSize`, one `levels.<line>` per fielded line in the order the run fielded them, `signalLock`, `startingScore`, and the tuning record's ten rows under their dotted names.

**The roster is the level rows and their order, and has no entry of its own.** The set and the order are one fact, so a second spelling could disagree with the first; that is the defect the block removes rather than guards, and `segments.test.ts` now pins the absence instead of the guard.

**One f64 for every value, deliberately.** A per-row width would be a positional assumption over an open set wearing a different coat, and the rows the block already carries are a size, a lock and a pile of tuning magnitudes.

### The bump's dated paragraph

`wireCodes.ts`'s `FORMAT_VERSION` JSDoc gains a fifth dated paragraph, in the shape of the four above it. It says what the block is, what the four replaced fields were, why a version-5 reader walking a version-4 header would read the starting size's eight bytes as the block's count and a string length, **why the bump is one rather than two** (two starting facts arrived together and a header carrying the record but not the score would have left a rig that starts holding one still unreplayable, so the second bump would have followed inside the same step), and that **every format 4 tape is refused outright at the decode from here**, this branch's own earlier tapes included. It names this as ADR 0056's own trigger firing: the purse became a row a run resolves, so ADR 0027 pulls it into the header.

### The resolve, the refusal and the outcome it answers with

**`src/tape/startingCondition.ts` is the one place a block becomes a condition and a condition becomes a block.** It sits beside `playback.ts` at the tape edge, imports `run`, `signalLock` and `tuningRecord` from the core and `startingLevels` beside it, and `src/tape` still reaches only `tape` and `game`.

`resolveStartingCondition` answers `implemented` with a whole `StartingConditions`, or `notImplemented` with a `refusal` of `'roster'` or `'condition'`, the recorded roster, and **a reason in the tape's own vocabulary naming the row**. `PlaybackOutcome` gains `conditionNotImplemented` beside `rosterNotImplemented`, and `PlaybackResult` gains `unimplementedCondition: string | null` beside `unimplementedRoster`. The two stay apart on the way out as well as on the way in: a block naming a row this build does not have still names a roster this build implements.

**The refusals, each in its own words.**

| What the tape says | The reason, verbatim in shape |
| --- | --- |
| a row this build does not have | `weather.fogDensity is a starting condition this build does not have` |
| a row this build requires and the tape lacks | `score.trashKillScore is a starting condition this build requires and this tape does not name` |
| a value that is not finite | `startingSize is written as NaN, which is not a number this build can start a run from` |
| a negative where the row has no below | `startingScore is written as -1, and nothing this build starts from is negative` |
| a fraction where the row counts whole things | `levels.bell is written as 1.5, and it counts whole things` |
| a lock outside the signal's scale | `signalLock is written as 4, which the signal's own scale cannot stand at` |
| the quiet interval inverted | `resolveTuning`'s own sentence, naming both ends |
| a name stated twice | `startingScore is named twice, so one of its two values is unreachable by name` |

**Which rows count whole things is read off the names rather than listed beside them**: a level is a rung, a score is points a run holds, and a purse is bodies a section gives the director, which is the same `Purse` suffix `stage.ts` already derives its own `PurseRow` from. A seconds row and every row stated as a multiple of a trash kill are quantities and a fraction is an ordinary value for them.

**The quiet interval's bound is the resolver's own and is not copied here.** `resolveTuning` throws on it by slice 3's design, and a record our own code produced cannot fail it; a tape is the one place an illegal record arrives from outside, so this is the one call site that catches that throw and reports it as the document defect it is.

**`readHeader`'s `holdableSignal` rejection moved rather than being lost.** It is in `lockRefusal` now, in the same shape, because which name is the lock is a question about this build's vocabulary and the decoder holds what the tape said. `records.ts` no longer imports `signalLock` at all, and the codec's own test now pins that an unholdable lock survives the wire while `startingCondition.test.ts` pins the refusal.

**`resolveStartingLevels` keeps its subset rule and its whole promise**, and takes the recorded roster and the recorded levels rather than a header, because which of the block's entries are lines is the resolve's reading.

### The cost, proved rather than asserted

A birthright tape was recorded at the starting tip `000dbf95bf`, `local/step6/cheader-prebump.tape`, and measured there to `outcome: 'verified'`, 1,800 ticks, 31 of 31 checkpoints. **Measured again at this tip it answers:**

> `local/step6/cheader-prebump.tape is not a tape (this tape is format version 4 and this reader is version 5); no measurement was taken`

A refusal naming the format, before a chunk is walked, and not a divergence at a checkpoint. **Every tape recorded before this commit is now unreadable**, and ADR 0057's store is still dormant, which is what makes this the cheapest moment.

### The gap closing, which is the slice's headline

**A `rig=ladder` tape now verifies.** `local/step6/cheader-ladder.tape`, recorded on the committed tree at the ladder row's own starting score of 6,000 and driven to the seal: 3,350 ticks, `ending: sealed`, `outcome: 'verified'`, 56 of 56 checkpoints, 0 unreachable, ending score 10,600, clean build identity with no mismatch. Its provenance bands `rig: ladder`.

**And the batch form of it, which is what the handoff's open item 5 said verifies nothing.** `steady-middling` on the ladder rig, three seeds: **3 of 3 verified, 0 not**, `identity.rigs` reading `["ladder"]`. Step 5's slice 9 (note section 12) had to measure conditioned ladder tapes at score zero instead, and its note said so; that workaround is retired. **Open item 5 is closed and so is open item 7's other half**: `batch.ts`'s missing divergence warning for `rig=ladder` is now unnecessary rather than fixed, because there is no divergence to warn about. `record-conditioned.ts`'s own warning, `reportUnreplayableScore`, went false in this commit and was deleted rather than left standing.

### `rigOf` widened, and slice 8's narrowness reversed with the reason

**`rigOf` takes the size, the levels and the starting score**, and the uniqueness key in `rigs.test.ts` widens to the same three. Step 5's slice 8 kept it at two for one stated reason, recorded in its own note section 14: a tape header carried no score, so a banding rule reading a fact the header cannot hold would answer null forever. **The header holds it now, so the reason is spent.** The JSDoc paragraph in `rigs.ts` that explained the narrowness went false and was rewritten in the same commit; it now says that the banding is by the rig's own three fields and **never by the roster, the lock or the tuning record**, because every row states the whole pool, a live signal and the build's own record, so reading those would answer the same thing for every row while making a run under a record of its own unbandable. A candidate is its own identity and rides beside the rig (ADR 0064). A new test pins the half that matters: a run at the ladder row's size and levels holding nothing bands to no rig at all.

### The renderer's attach, which slice 4 filed for this slice

Slice 4's note section 9 item 1 filed it: the three screens pass the default record's caps to `attach` because no run exists where they dress their field, **and slice 6 is where a replayed tape first carries a record of its own**. `ReplayScreen.update` now calls `beginDrawing(frame.run)` on the frame the lead-in begins, which hands the replayed run's own `caps` to `fieldRenderer.attach`; the pools are grow-only and attach is the one place they grow. **The test has teeth and was watched fail**: without it, a tape recorded under a one-second quiet interval throws `no corpse sprite at slot 704` in the renderer's slot walk on its first drawn frame. `GameScreen` and `FrameBudgetScreen` are untouched, because nothing at this tip gives either of them a run under a record of its own; that is slice 7's.

### The measurements

- **The batch: twelve seeds, identical.** `steady-middling` at the birthright rig, seeds 20260820 to 20260831, played at the starting tip and again on the committed tree. **The two `report.json` files are identical field for field** with `identity.recordedAt` and `identity.commitHashes` stripped: 12 of 12 verified on both sides, the same tick counts, endings, scores, kills, directed adds, spreads and section spans. The tapes differ by a few hundred bytes because the block is wider than the four fields it replaced, which is why the comparison is the report and not a checksum of the bytes.
- **Its tapes band to the rig they were played under**: `identity.rigs` reads `["birthright"]` on the twelve and `["ladder"]` on the three.
- **Replay determinism at this tip.** Seed 20260820 under `shaky-short`, played twice: 6,350 ticks both times, 60,147 bytes both times, `verified` 1 of 1 both times, and the two tapes compared record by record are identical in header (bar `recordedAt`, which is wall clock), in all 6,350 commands, in all 106 checkpoints with the same witness at each, and in the trailer. The block reads 17 rows.
- **A hand-recorded tape at the new format.** `pnpm build` on the committed tree, `pnpm exec vite preview`, driven with `playwright-cli` at 393 by 660: a run at `?seed=20260821&size=18`, played, ended from the pause menu and saved with SAVE TAPE. Measured to `outcome: 'verified'`, 390 ticks, 7 of 7 checkpoints, `stop: quit`, **build identity `47c4543d25` matching and no mismatch**. Zero console errors, three warnings, the usual audio-autoplay and software-renderer families.

### The tests

**36 added, 10 removed, none skipped or weakened. The test-name diff: 2,378 names in the baseline, 2,404 now.** The baseline is this branch's own tip captured before the first edit, into `local/step6/tests-baseline-cheader.json`, outside version control and in no commit.

**Eight of the ten removals are renames and the promise did not move**: the codec's self-describing-header suite carries the ticket number now and its assertions read the block's rows where they read a header field. **Two are real removals and both are the same fact.** `segments.test.ts`'s *refuses to write a level for a recorded line the header carries none for* and *refuses a recorded line named `__proto__` rather than writing an inherited value* guarded `recordedLevel`, the writer's own check that a roster name had a level beside it. **The block makes that defect inexpressible**: one entry carries the name and the value together, so neither half can exist without the other, and `recordedLevel` is gone. In their place is *carries no roster beside the levels, so the two can never disagree*, which asserts the absence, and the `__proto__` round trip survives as a level row because `levelsIn` is still prototype-free.

**The planned list, all thirteen items, each landed.** 1 and 2 and 3 in `codec.test.ts` and `playback.test.ts`; 4 to 7 in `startingCondition.test.ts` with their playback twins; 8 as *a format 4 tape is refused outright at the decode, by its version*; 9 in `harnessRun.test.ts` and in the ladder batch above; 10 and 11 in `rigs.test.ts`; 12 the fences; 13 the golden.

**One fence was added inside `startingCondition.test.ts` rather than as its own file**, *requires every row of the tuning record, one by one*: it holds the resolve's own written-out row list against `tuningRows(DEFAULT_TUNING)`'s walk over the record's nesting and fails if either gains a row the other has not heard of. The list is written out rather than walked so the compiler holds it total, and this is the half a compiler cannot.

**The fences, each by title, all green.** `src/game imports only from src/game`, `src/tape imports only from src/tape and src/game`, `every test file imports only from inside its parent folder's subtree`, `no screen imports another screen`, `no module under src/app reaches for engine()`, `carries no value-import cycle beyond the ones written down` with `KNOWN_CORE_CYCLES` still empty, `reaches nothing in game/stage/stage from game/caps`, `the caps derivation and the core read the record off the run`, `every row of the tuning record has a reader`, `the lock's module imports nothing`, `the tuning record's module imports nothing`, `the tape codec imports nothing from the director`, `src/game/storm.ts reaches what it can hit through the seam` and its four siblings, `blocks './step' from src/game/sim.ts` and its six siblings, `orders no reading against a number of its own`, and `every reading on a verified report carries a declared comparison meaning`.

**`pnpm verify` green twice on the code commit's tree**, plus `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green from `apps/hungry-grave/` before it. 160 test files, 2,393 passing, the same 11 expected failures and 2 todos throughout.

### CodeRabbit

**One iteration, `coderabbit review --agent --uncommitted`: 39 files reviewed, two findings, both minor, both the same claim, applied.** Both say `unimplementedRoster` should be populated only when the refusal is the roster's, and they are right: on a condition refusal the field named a roster this build does implement, which the field's own JSDoc says it never does. **Applied as a bug fix rather than a patch**: the wrongness was pinned first as a test, *names no unimplemented roster, because the lines are ones this build has*, then the guard narrowed. Nothing was declined.

### Found false against the tree, and things filed rather than taken

1. **The prompt's step (f) names three header builders and the tree has four.** It says "`runFromHeader`, `harnessHeader` and `headerFor`"; `src/app/tapeHeader.ts`'s `tapeHeaderFor` is the fourth and is the one a person's own run goes through. It moved with the other three, off `run.conditions`, because a header builder the block did not reach would not have compiled.
2. **Two test fixtures staged their condition by writing live state after `createRun`.** `playback.test.ts`'s `recordALadderRun` and the two reference runs beside it set `run.grave.size` and `run.levels` directly, which the header used to capture because it read `run.grave.size` and `run.levels`. **Reading `run.conditions` is the ruling, and it is the thing that caught them**: a size written over the grave afterwards is a run the tape never describes. All three now go through `createRun`'s own record, which is what a real run does.
3. **`boundary.test.ts`'s `importsOf` reads the word "from" in prose as an import, which cost three test titles.** Slice 4's note section 5 filed the same trap for the word "import"; the regex is `(?:from|import)\s*\(?\s*["']`, so any title ending in either word takes the closing quote as the specifier's. **Three titles were reworded and the fence was left alone**, because the fence is not this slice's to change. It is filed here a second time: the fix is one lookahead in a regex nobody should edit inside a slice that is moving a wire format.
4. **The level's old 0-to-255 ceiling was a byte width and is gone with the byte.** A level row is checked as integral and non-negative and not against `MAX_LEVEL`, because the ceiling was never a document rule: `levels in range` is the invariant that owns it and it fires loudly. Named here rather than discovered.
5. **`score.bossHealthPerKill` is a divisor and a zero in it is still not refused.** A tape writing zero there replays to an infinite score and the `no NaN` invariant fires, which is loud rather than silent. **This is the substance slice 5's note already filed for slice 7** off CodeRabbit's four declines, and it is extended here to the header's own edge rather than filed a second time: whoever builds the typed-value edge should decide the positive-only rows for both surfaces at once.

**Nothing was left for a later slice that this slice could have done.** Slice 7 owns the candidates, the command line and the URL, and nothing at this tip names a non-default record; the block carries the default just the same, and a run under a named candidate now has a header that can replay it. Slice 8 owns the sweep runner and the report's tuning identity.

## 12. Slice 7 (D): a candidate is named on the command line and on the URL (#142)

**The code commit is `6f5f98adda`, 13 files, 678 lines added and 69 removed**, which sits just above the prompt's estimate of 8 to 12. Two files are created, `src/dev/tuningCandidates.ts` and its test; none is deleted, merged or split. The worktree was clean before the first edit, `git status --short` returned nothing, the tip was slice 6's docs commit `27a177c797`, and both of slice 6's commits were in the tree.

**The four constants and `GOLDEN`, read off that tip and off the code commit's own tree.** `WITNESS_VERSION` 11 (`src/game/witness.ts`), `READINGS_VERSION` 9 (`src/dev/readingsVersion.ts`), `FORMAT_VERSION` 5 (`src/tape/wireCodes.ts`), and `GOLDEN`'s checksum `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2` (`src/dev/digest.ts`). Every one matches the prompt's own line, none moved, and none of the four files is in either commit. The step's one `FORMAT_VERSION` move was slice 6's and is spent; the ledger is closed.

### The table, and the one number in it

**`src/dev/tuningCandidates.ts` is `rigs.ts` whole in structure**: a `const` tuple `CANDIDATE_NAMES`, the `CandidateName` type over it, the `TuningCandidate` row interface, the rows keyed by name, `isCandidateName` as the edge guard, and `candidateOf` answering which candidate a record is. It imports `resolveTuning` and `tuningRows` from the core and nothing else.

| Row | `stage.processionPurse` | Every other row |
| --- | --- | --- |
| `default` | 116 | the resolved default |
| `spendable` | **42** | the resolved default |

**The `default` row is `resolveTuning({})` and never a second copy of the build's values**, so nothing in it can go stale, and its test asserts it against the resolver rather than restating it. **The moved row is proved to differ in exactly one dotted name**, off `tuningRows` rather than by hand, which is the assertion slice 8's comparison rests on.

**The one number is 42 and it is stated against the quiet interval rather than picked.** The Procession's directed span runs from its first wave at `t=2` to the standing wave at zero at `t=111.5`, which is the first cell the director may not spend in, so the span is 109.5 seconds. Inside a window the director adds once at its opening and once at every quiet interval, which is `caps.ts`'s own `directedInside` rule, so at the record's own longest interval of 8 seconds that span allows 14 adds; the cheapest card is a Drip of one ghoul at 3 bodies (`waves.ts`'s `CARDS` and `BODY_COST`). Fourteen adds at three is 42: **the most the section can be certain to spend**, against a default of 116 priced as a third of what the section's own standing waves land. **What would move it**: the Procession's wave table at either end of that span, `stage.quietIntervalMaximumSeconds`, and the cheapest card in the table. **It is open and it is named open here**: what it is read against is a sweep of the two rows, which is slice 8's.

### The two surfaces, and their exact words

**The command line refuses and the URL repairs, and that split is deliberate.** A command line is a person asking for one batch, and a batch under a tuning nobody asked for is a folder of runs whose name lies about them; a URL is a person typing into an address bar, and `seedFromUrl.ts`'s standing rule is that a fat-fingered value still yields a game.

| Surface | What it does with a name no row holds | The words |
| --- | --- | --- |
| `scripts/batch.ts`, `tuning=<candidate>` | refuses, plays nothing, exits 1 | `lean names no tuning candidate (the candidates are default, spendable); no batch was played`, then the usage |
| `?tuning=<candidate>` | warns once and plays the default | `Ignoring ?tuning=nonsense: the run plays the build's own tuning instead.` |

**`tuningFromUrl` answers null for an absence and never resolves it**, which is `levelsFromUrl`'s and `signalLockFromUrl`'s own split (ADR 0027): `createRun` resolves the absence, so the header records the record the run started from rather than the absence. It is read from the hash before the search like its five siblings, and the hash wins when both are present.

**A deployed `?tuning=<name>` and a batch share a row only at one commit.** The batch folder carries the commit hash in every tape it writes and the URL carries nothing at all, so the name is a promise about the tree the build was made from and not about the values. **What keeps a tape honest is the header**, which carries the resolved record whole (`FORMAT_VERSION` 5), so a tape played under a candidate replays under the candidate's own values whatever the build's defaults later become. The name is how a person says which tuning; the header is how a tape proves it.

### The shell, and what moved in it

**`batch.ts`'s argument parsing came out into `requestedBatch`, answering one `BatchRequest` record.** `main` carried eight exits over five `refuse` calls and read as a list; it now reads as the batch's own story, four exits over the folder, the runs and the report. The keyed arguments are a `KEYS` tuple with `isKeyed` and `valueUnder` over it, which generalises the single `RIG_ARGUMENT` regex to two keys without either one knowing about the other. **Every existing refusal keeps its wording**, and the only text that moved is `USAGE`, which step (e) asks for: it gains `[tuning=<candidate>]`, a `candidates:` line and a `tuning defaults to default` line.

**The folder is `<configuration>-<rig>-<candidate>-<recordedAt>`.** The candidate sits beside the rig on exactly the terms the rig is there: a figure names its starting condition, and a candidate is one (#107, ADR 0053, ADR 0064). A bare command's folder therefore differs from the one it wrote before this commit by the `default` segment alone.

**`playHarnessRun` takes the tuning record as its third argument, beside the rig.** The rig row states the build's own record (ADR 0063), and a run under a candidate is that row played under the candidate's, so the two compose in the harness rather than at each caller: `scripts/sweep.ts` in slice 8 gets the composition for free and `rigOf` still bands such a run by its rig, because it reads size, levels and score and never the record.

### The gate that does not exist, which corrects the draft

**No build-time gate exists for `?levels=`, `?signal=` or `?tuning=`, and this slice built none.** The draft's decision 4 says "ADR 0022's build-time gate covers a new one for free" and its section 4 slice D lists "the build-time gate over it" as work; both are false against the tree. `?levels=` and `?signal=` carry ADR 0022 as a JSDoc sentence saying where the behaviour belongs, and the only `import.meta.env.DEV` in the run's path gates the broken-invariant handler in `runSession.ts`. `tuningFromUrl` carries the same sentence and claims no more than its siblings do. **The prompt's fifth ruling rules this and it was followed to the letter**; the finding is filed here and nothing was built. A real gate for all three is one piece of work for somebody who owns the two build flavours, and it is not a coder's to invent inside a slice.

### The zero divisor, which slice 5 and slice 6 both filed

**`resolveTuning` now refuses `score.bossHealthPerKill` at zero, naming the row**: `score.bossHealthPerKill is written as 0, and a fight's worth is the boss's own health over it`. It is the second bound the resolver holds and the last one it holds. Slice 5's note filed it off four CodeRabbit declines and slice 6's filed it again at the header's edge; this is the slice that first lets a person's typed name reach the resolver, so it is the slice that owns it. **Only that row**, because it is the group's one divisor and every other score row is a multiplier where zero is an ordinary value: a candidate that pays nothing for a source kill is a candidate and not a defect, and the test asserts both halves. **The tape edge inherits it for free**, because `startingCondition.ts`'s `tuningOrRefusal` already catches the resolver's throw and reports it in the tape's own vocabulary, and a test there pins that it does. **Both tests were watched fail with the check removed and pass with it back.**

### The measurements

- **Two batches on the same twelve seeds, and a third with no argument at all.** `steady-middling` at the birthright rig, seeds 20260820 to 20260831, 12 of 12 verified in each: `steady-middling-birthright-default-1789661971211`, `steady-middling-birthright-spendable-1789662116986` and `steady-middling-birthright-default-1789662239088`, the last one from the bare command. **The bare batch's report and the `tuning=default` batch's are identical in every field** with `identity.recordedAt` and `identity.commitHashes` stripped, which is the "nothing changes when nothing is named" claim measured rather than asserted.
- **The default batch and the moved one differ in 46 fields and every one of them is a purse reading**: 29 `directedAdds[...].add.purseLeft`, the 12 samples of `tuning.pressure.purseLeftBySection.procession` and its five summary figures. Every one is exactly 74 lower, which is 116 minus 42. The Procession's own spread moves from a median of 103 left (min 90, max 107) to 29 left (min 16, max 33). **Nothing else in either report moves**: the same ticks, endings, scores, kills, directed adds, spreads and section spans, seed for seed.
- **That is the direction the row predicts, and the prediction includes what it does not do.** The section spends the same 9 to 26 bodies under both records, so the purse never binds and no run changes: the Procession's ceiling of one live formation stops the director long before any purse does, which is what slice 5's probe measured from the other side. **The sweep list's finding is now measured on both ends**: the purse is priced well above what the section can spend, and even a purse cut to what the quiet interval allows is still above what the ceiling lets it reach. **No row moved and none is proposed here**; the answer is a later round's.
- **A tape from the moved batch, measured to `outcome: 'verified'`.** Seed 20260820 of the `spendable` folder: 26,659 ticks, `victory`, 445 of 445 checkpoints, 0 unreachable, score 134,354.6, 957 kills. Its `purseLeft` readings open at 39, which is 42 less the first card, so the header carried the candidate's own values and the replay ran under them.
- **The built app at `?tuning=spendable` and at `?tuning=nonsense`**, through `pnpm build` and `pnpm exec vite preview`, driven with `playwright-cli` at 393 by 660. The named run plays: seed 20260821 pinned, the field dressed, the HUD and the ladder drawn, **zero console errors and three warnings, all the audio-autoplay family, and no tuning warning at all**. The nonsense run plays too, on the default, with **one extra warning and it is the parser's, quoted above**, fired exactly once.
- **Replay determinism at this tip.** Seed 20260820 under `shaky-short`, played twice: 6,350 ticks both times, 60,164 bytes both times, `verified` 1 of 1 both times, 106 of 106 checkpoints and 0 unreachable in both measurements. **The byte count is 17 higher than slice 6's 60,147 and the cause is named rather than waved at**: these tapes were recorded on an uncommitted tree, so the build identity carries the `-dirty-<hash>` suffix, which is exactly 17 characters. The contract warns of it and this is it.

### The tests

**Sixteen tests were added, none deleted, skipped or weakened.** Six are the table's, four the URL parser's, four the batch command's, and two the zero divisor's, one at the resolver and one at the tape edge. **The table's and the parser's were written first and watched fail against a stub** whose rows were empty records and whose guard and banding answered false and null, so each failed as an unmet promise and never as a missing module. **The batch's four were written after the shell changed, so their teeth were proved by mutation instead**: with `playHarnessRun` ignoring its record and `folderFor` dropping its segment, both played cases go red and the nine that were already there stay green, and with the unknown-key check removed the fourth goes red on its own.

**The test-name diff: 2,404 names in the baseline, 2,420 now, 16 added and 0 removed.** The baseline is this branch's own tip captured before the first edit, into `local/step6/tests-baseline-dcandidates.json`, which is outside version control and in no commit.

**Nothing turned red anywhere, which the prompt names as the claim to check rather than the hope.** 161 test files and 2,409 passing before the commit and after it, with the same 11 expected failures and 2 todos throughout.

**The fences, each by title, all green.** `src/game imports only from src/game`, `src/input imports only from src/input and src/game`, `src/dev imports only from src/dev and src/game and src/tape`, `src/tape imports only from src/tape and src/game`, `src/app/sound.ts imports only from src/game/events`, `src/app/ui imports only from src/app/ui`, `every test file imports only from inside its parent folder's subtree`, `carries no value-import cycle beyond the ones written down` with `KNOWN_CORE_CYCLES` still empty, `reaches nothing in game/stage/stage from game/caps`, `the caps derivation and the core read the record off the run`, `the lock's module imports nothing`, `the tuning record's module imports nothing`, `the tape codec imports nothing from the director`, `every row of the tuning record has a reader`, `src/game/storm.ts reaches what it can hit through the seam` and its four siblings, `blocks './step' from src/game/sim.ts` and its six siblings, `orders no reading against a number of its own`, and `every reading on a verified report carries a declared comparison meaning`. **`src/app` reaching `src/dev` for the table is governed by no boundary row**, which was confirmed by running the fence rather than by trusting the prompt: only `src/app/sound.ts` and `src/app/ui` are governed under `src/app`, and `DigestScreen` and `FrameBudgetScreen` already reach `src/dev` the same way.

**`pnpm verify` green twice on the code commit's tree**, plus `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green from `apps/hungry-grave/` before it.

### CodeRabbit

**Slice 7's code commit, `coderabbit review --agent --uncommitted`, one iteration: 13 files reviewed, one finding, major, applied in part and the rest declined.** The finding is on `requestedBatch` and asks it to validate the whole argument list before running: reject unknown keys, reject a duplicated `rig=` or `tuning=`, and reject surplus positionals.

**The unknown-key half is real and this slice is what made it dangerous, so it was applied.** `isKeyed` only recognises the two keys the command has, so anything else written in a key's shape falls through into the positional list, and with four positions the fourth is the output root: `tunning=spendable` would have written a batch nobody asked for into a folder named after the typo, under the default candidate, and said nothing. With one key that trap was narrow; with two it is a typo a person will actually make. `unknownKeyIn` refuses the first argument matching `^[A-Za-z]+=` under a key the command does not have, naming it and the keys, and a path never matches because the word runs to the first non-letter. Its test was proved by mutation.

**The other two halves were declined, both as pre-existing behaviour outside this slice's definition.** A surplus positional has been silently dropped since the command was written and nothing in this commit touches that; a duplicated key now has a determinate meaning, the first wins, which is exactly what the single `rig=` argument already did, and the filter takes every copy out of the positional list rather than only the first, which is a small improvement on the shape this commit replaced. **Both are worth a later pass over the whole argument list, and neither is a slice's to take on its way past.** No finding was raised on the other 12 files.

**What was found false against the tree is in section 5**, where this note keeps it: the draft's ADR 0022 sentence in two places, and the file estimate. Nothing else moved: the prompt's seven rulings, its planned test list and its state-of-the-branch section all held exactly as written, `FORMAT_VERSION` at 5 included.

### Filed rather than taken

1. **`GameScreen` still dresses its field at the default record's caps, and the day a candidate moves the quiet interval it must stop.** Slice 4 filed the pool question, slice 6 closed the replay half through `ReplayScreen.beginDrawing` and named the live half as this slice's. **It is not taken and the reason is that it cannot be tested at this tip**: all three caps derive from `stage.quietIntervalMinimumSeconds` alone, no committed candidate moves that row, and the ruling here is that the second candidate moves the Procession purse and nothing else, so a red test would need a third row this slice may not add. **What was done instead is the sentence**: `fieldCaps`'s JSDoc claimed the default record is the only record anything names, which this commit makes false, and it now says which row the caps read, that no candidate moves it, and that the row which first does has to grow the pools at the started run's caps the way `ReplayScreen` does. **The trigger is a candidate row moving `stage.quietIntervalMinimumSeconds`**, and the symptom without the fix is `no corpse sprite at slot N` in the renderer's slot walk on the first drawn frame, which slice 6 watched happen on the replay side.
2. **`record-conditioned.ts` takes no candidate**, so a conditioned tape cannot be recorded under one. It is not ruled and it is not this slice's, the way step 5's slice 8 filed the header widening. It is one keyed argument in the shape this slice just wrote twice.
3. **A real build-time gate for the instrumentation URL controls**, above.
4. **The purse is not the Procession's binding constraint under any hand measured so far**, above. It is tuning work and it is a later round's.

**Nothing was left for a later slice that this slice could have done.** Slice 8 owns the sweep runner, the report's tuning identity and the comparison, and its first consumer is this table: two rows differing in one name, with `candidateOf` to band a record read back off a tape.

## 13. Slice 8 (E): the sweep runner, and a report says which tuning it read (#142)

**The code commit is `ace50d5c29`, 10 files, 1,223 lines added and 11 removed.** One file is created, `scripts/sweep.ts`, with one test file beside it; none is deleted, merged or split, which is what the prompt's module boundaries ask for. **`scripts/batch.ts` is not in the commit at all**: slice 7 gave it its argument and this slice gives it nothing.

**The worktree was clean before the first edit**, the short status returned nothing, and both of slice 7's commits are in the tree. The tip was `106eff82e2` rather than the `5842308fd5` the prompt names, and section 5 says why that cost nothing.

**The four constants and `GOLDEN`, read off that tip and off the code commit's own tree**, are in section 2 with the argument for why the readings version holds.

### The identity's two new facts

`BatchIdentity` gains `candidates`, a set of names on the `rigs` precedent, and `tuning`, the one record the folder's runs shared. **Both are written by `batchReportOf` off the runs and never off the command line**, which is the whole of the point: a folder's name is a convenience and the bytes are authoritative (ADR 0057), so a report that says `spendable` says it because its tapes do. The JSDoc carries the reason, that **a report which cannot say which tuning it read cannot support ADR 0053's one sentence**, this tuning against that tuning.

**The run's own half is `Provenance`, which is where `rigOf` already bands.** `measure.ts` fills `candidate: candidateOf(conditions.tuning)` and `tuning: conditions.tuning` off the condition the header carries whole, so a tape read back bands exactly as a run taken from the table does. **A record no row holds answers null**, which is `rigOf`'s own answer for a condition no rig holds, and **a batch spanning two records reports `tuning: null`** rather than letting one of them stand for both.

**`provenance.tuning` and `tuning` on the same report are two different things, and the JSDoc says so beside both**: the first is the record a run started under, the second the readings family this instrument computed. That collision is the one cost of putting the fact where the rig already lives, and it was paid deliberately: a new top-level path on `Metrics` would have needed a `READING_COMPARISONS` entry before `comparisonDeclared.test.ts` would go green again, and no reading is added in this slice.

### The comparison, and the decision not to refuse

**`compareBatches` gains no fourth mismatch.** Comparing two tunings is the step's central command, so a refusal there would refuse exactly what the step exists to do (draft ruling 8). The difference is answered instead: `BatchComparison` gains `tuningDifferences`, **sitting ahead of `readings` in the record itself**, so the shell that prints it needs no rule of its own about which to say first. Each row is the dotted name and both values, and the rows stand even where every ordering is withheld, because they are what the two batches were rather than arithmetic between them.

**Two cases print no rows at all**: two batches under one record, and a batch whose own runs did not share one, because rows taken against the other side's record would name values half a batch never played.

**`readAcrossCorners` gains its `tuning` mismatch, one name over the pair.** Two corners that compared different candidate pairs answered different questions, so their agreement is about nothing. One name rather than two because what a corner reads is the pair, and the build hashes are the precedent that makes it a corner mismatch rather than a refusal.

**`isBatchReport` requires both new fields and its one refusal sentence names them**: `is not a batch report this build can compare (this build requires the candidates and the tuning record on its identity, so one written before them reads as one)`. The stale parenthesis naming the rigs and the per-run samples is gone, which step (d) asks for. **Every other refusal in `compare-batches.ts` keeps its wording.** The absence and the null are two different answers and the guard treats them so: null is a batch whose runs did not share one record, and a missing field is a report from a build that could not have said.

### The sweep, its usage line and its refusals

**`scripts/sweep.ts` is a second shell over the same `src/dev` seams**, on `compare-batches.ts`'s own precedent, and it does not join `batch.ts`, whose concept is one batch. It owns the filesystem, the argument list and the printing and borrows every judgement: `playHarnessRun` plays, `batchReportOf` reduces, `compareBatches` compares. **`src/dev` still imports no bare package**, which is why the seam returns rows and the shell prints them.

```
usage: pnpm vite-node --config vite.headless.config.ts scripts/sweep.ts <configuration> <first-seed> [count] [out-root] [rig=<rig>] tuning=<a>,<b>,...
  configurations: steady-far, ... shaky-short
  rigs: birthright, maxed, ladder
  candidates: default, spendable
  tuning names 2 candidates or more, played in the order written
  count defaults to 48
  out-root defaults to local/batches
  rig defaults to birthright
```

**It takes `batch.ts`'s own arguments and one more**: the same four positions, the same two keys, and `tuning=` taking a list rather than a name. **The out-root default is `local/batches`, which is `batch.ts`'s own root on purpose**: each folder is an ordinary batch, and a root named after the sweep would be the one thing on disk saying which command played them.

| What it refuses | The words |
| --- | --- |
| nothing on the command line | the usage alone, because a command with nothing on it is somebody asking what the command is |
| a configuration no row holds | `steady-ish names no configuration (the configurations are ...)` |
| a rig no row holds | `ceiling names no rig (the rigs are birthright, maxed, ladder)` |
| a seed or a count outside the range | `... is not a seed (a whole number from 0 to ...)`, with the walk's far end named as well as its first |
| no `tuning=` at all | `no tuning was named (a sweep names its candidates as tuning=<a>,<b>,...)` |
| a name no candidate row holds | `lean names no tuning candidate (the candidates are default, spendable)` |
| one candidate | `default is one candidate, which is a batch; a sweep compares 2 or more` |
| a name written twice | `default is named twice, and one candidate is one batch` |
| a key it does not have | `tunning=spendable names no argument this command has (the keys are rig, tuning)` |
| a folder or a tape it cannot write | the path, the syscall's own message, and where the sweep stopped |

Every one says its reason and then the usage, and every one ends in `no sweep was played`, which is `batch.ts`'s `no batch was played` in this command's own words. **The two-corner read across two hands is not this command's**: what it answers is one hand's ordering, and the corner pair belongs to the first real sweep.

### The measurements

**The sweep, on eight seeds, and its output whole.** `steady-middling` at the birthright rig, seeds 20260820 to 20260827, `tuning=default,spendable`:

```
default 20260820: 26659 ticks, victory, 250407 bytes, verified
default 20260821: 15410 ticks, sealed, 145030 bytes, verified
default 20260822: 16005 ticks, sealed, 150605 bytes, verified
default 20260823: 27591 ticks, victory, 259125 bytes, verified
default 20260824: 20095 ticks, sealed, 188911 bytes, verified
default 20260825: 19745 ticks, sealed, 185651 bytes, verified
default 20260826: 27915 ticks, sealed, 262173 bytes, verified
default 20260827: 17402 ticks, sealed, 163706 bytes, verified
8 of 8 verified, 0 not, 0 with no ending
spendable 20260820: 26659 ticks, victory, 250407 bytes, verified
spendable 20260821: 15410 ticks, sealed, 145030 bytes, verified
spendable 20260822: 16005 ticks, sealed, 150605 bytes, verified
spendable 20260823: 27591 ticks, victory, 259125 bytes, verified
spendable 20260824: 20095 ticks, sealed, 188911 bytes, verified
spendable 20260825: 19745 ticks, sealed, 185651 bytes, verified
spendable 20260826: 27915 ticks, sealed, 262173 bytes, verified
spendable 20260827: 17402 ticks, sealed, 163706 bytes, verified
8 of 8 verified, 0 not, 0 with no ending
default against spendable, differing rows first:
  stage.processionPurse: 116 against 42
337 readings ordered
```

**The differing row prints first and it is the only row there is.** Of the 337 readings, 336 are flat and one moved: `tuning.pressure.purseLeftBySection.procession`, down from 98/105/107 to 24/31/33, which is the minimum, median and maximum of what the Procession had left. **Each of those three figures is exactly 74 lower, which is 116 minus 42.** Nothing else moved at all, and the tape byte counts are identical seed for seed between the two candidates, which says the two runs are the same run rather than two runs that happened to agree.

**That is the direction the row predicts, and the prediction includes what it does not do.** The purse is not what stops the Procession, so cutting it to what the quiet interval allows changes no run: the section's ceiling of one live formation binds first. Slice 5 measured that from one side and slice 7 from another; **this is the third measurement of it and the first taken from a sweep**, and no row moved here because moving one is a later round's.

**The same two candidates as two hand-run batches, compared with `compare-batches.ts`, giving the same answer.** Two `batch.ts` commands over the same eight seeds under `tuning=default` and `tuning=spendable`, then `compare-batches.ts` over the two `report.json` files:

```
default against spendable, differing rows first:
  stage.processionPurse: 116 against 42
steady-middling against steady-middling: 337 readings ordered
```

**The sweep's comparison and the hand-run pair's are identical field for field** with `identity.recordedAt` and `identity.commitHashes` taken out, which are the two facts a second command cannot share with the first. That is what "a sweep's folders are indistinguishable from hand-played ones" means measured rather than asserted.

**The bare command against `tuning=default`, on the same eight seeds: identical field for field** with `identity.recordedAt` out, both reading `candidates: ["default"]` and both carrying `stage.processionPurse` at 116. **This re-proves slice 7's claim at a tip where the report's shape moved**, which is the half worth re-running: the two new identity fields are exactly where a bare command could have started meaning something else.

**A report read back, quoted.** The sweep's own `spendable` folder, `identity` whole:

```json
{
  "configuration": "steady-middling",
  "firstSeed": 20260820,
  "seeds": 8,
  "recordedAt": 1789669110648,
  "commitHashes": ["106eff82e2769e8a3241ba3d94aaf73c82ab0d7d"],
  "rigs": ["birthright"],
  "candidates": ["spendable"],
  "tuning": {
    "stage": {
      "processionPurse": 42,
      "crowdPurse": 388,
      "vigilPurse": 0,
      "quietIntervalMinimumSeconds": 4,
      "quietIntervalMaximumSeconds": 8
    },
    "score": {
      "trashKillScore": 100,
      "bleedCapInKills": 20,
      "bossHealthPerKill": 100,
      "sourceKillInKills": 24,
      "mealAtMaxedInKills": 1
    }
  },
  "mobWidths": { "shambler": 22, "revenant": 26, "ghoul": 18, "cairn": 30 }
}
```

The candidate's name and all ten rows, beside `readingsVersion: 9` and 8 of 8 verified.

**Replay determinism at this tip.** Seed 20260820 under `shaky-short`, played twice: 6,350 ticks both times, 60,164 bytes both times, `verified` 1 of 1 both times, 106 of 106 checkpoints and 0 unreachable in both, and **the two reports are identical field for field** bar `identity.recordedAt`. The byte count matches slice 7's 60,164 rather than slice 6's 60,147, and for the same named reason: these tapes were recorded on an uncommitted tree, so the build identity carries the `-dirty-<hash>` suffix, which is exactly 17 characters.

### The tests

**11 added, none deleted, skipped or weakened. The test-name diff: 2,420 names in the baseline, 2,431 now, 11 added and 0 removed.** The baseline is this branch's own tip captured before the first edit, into `local/step6/tests-baseline-esweep.json`, which is outside version control and in no commit.

**The six seam tests were written first and watched fail**, each as an unmet promise against a field the report did not carry rather than as a missing module: two in `batchReport.test.ts` for the identity's round trip, three in `compareBatches.test.ts` for the rows and their ordering, and one for the corner read's new mismatch. **The sweep's four could not fail that way**, because its seam is a command and a command that does not exist fails as a missing module, so their teeth were proved by mutation instead: with the candidate dropped from `folderFor` the played case goes red on the folder's name, with `sayTuningRows` called after the readings line it goes red on the ordering, and with the list checks removed the refusal case goes red on the exit code. Each mutation was reverted and the file restored from a copy taken before it.

**The planned list, all twelve items, each landed.** 1 and 2 are `batchReport.test.ts`'s two; 3, 4 and 5 are `compareBatches.test.ts`'s three; 6 is the corner read's new case, beside the three existing refusing-mismatch cases, which were already written and are green unchanged; 7, 8 and 9 are `sweep.test.ts`'s four, which split item 9's argument errors into the ones a reader cannot read and the list that is not a sweep; 10 is `comparisonDeclared.test.ts`, green and unchanged; 11 the fences; 12 the golden, green with `digest.ts` in neither commit. **One test beyond the list**, in `scripts/__tests__/compare-batches.test.ts`: the shell's own printing order, because the ruling that the rows print first would otherwise be proved only by a paste in this note.

**Three existing `toEqual` assertions gained the two new provenance fields**, all three in `measure.test.ts`, which is the reddening the prompt expects. None was weakened: each still asserts the whole record, two fields wider.

**The fences, each by title, all green.** `src/game imports only from src/game`, `src/input imports only from src/input and src/game`, `src/dev imports only from src/dev and src/game and src/tape`, `src/tape imports only from src/tape and src/game`, `src/app/sound.ts imports only from src/game/events`, `src/app/ui imports only from src/app/ui`, `every test file imports only from inside its parent folder's subtree`, `no screen imports another screen`, `no module under src/app reaches for engine()`, `carries no value-import cycle beyond the ones written down` with `KNOWN_CORE_CYCLES` still empty, `reaches nothing in game/stage/stage from game/caps`, `the caps derivation and the core read the record off the run`, `the lock's module imports nothing`, `the tuning record's module imports nothing`, `the tape codec imports nothing from the director`, `every row of the tuning record has a reader`, `src/game/storm.ts reaches what it can hit through the seam` and its four siblings, `blocks './step' from src/game/sim.ts` and its six siblings, `orders no reading against a number of its own`, `every reading on a verified report carries a declared batch reduction`, and `every reading on a verified report carries a declared comparison meaning`. **`scripts/` is governed by no boundary row**, which is why a new shell there adds no fence: the table walks `src/` and the shells sit outside it by construction.

**`pnpm verify` green twice on the code commit's tree**, plus `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green from `apps/hungry-grave/` before it. 162 test files and 2,420 passing, with the same 11 expected failures and 2 todos throughout.

### What the step did not do

**It moved no number.** Every value in the default record is the value the build compiled before step 6 opened, `GOLDEN` held by arithmetic in all seven code slices, and the one figure anywhere in the step that differs from today's is the 42 inside a candidate row nothing plays unless a command line or a URL names it. **The first real sweep is not run**: the eight seeds above exist to prove the machinery, and reading a sweep and picking a move is Fable's job on the balance itself. **The store is not wired** (draft ruling 10), and its reopening trigger is the first tuning round whose comparison needs runs from more than one machine or session.

### Filed rather than taken

1. **A run under a non-default candidate is not marked `conditioned` and stays inside the default aggregates.** `isConditioned` reads the size, the levels and the score, so a tape played under `spendable` counts as unconditioned by that rule while being a run this build's own defaults cannot reproduce. **It is not this slice's to change**: `conditioned` is a reading, and widening what it means is exactly the move `READINGS_VERSION` exists to make loud. **The trigger is the first person's tape recorded under a candidate**, which is the day a default aggregate would hold a run nobody can reproduce.
2. **The corner pair across two hands is unbuilt, and it belongs to the first real sweep.** `readAcrossCorners` answers its new mismatch and nothing on a command line hands it two corners of one candidate pair; `compare-batches.ts` takes four reports and can, which is why the sweep prints one hand and stops there.
3. **`record-conditioned.ts` still takes no candidate**, filed by slice 7 and untouched here.
4. **`boundary.test.ts`'s `importsOf` reads the words "from" and "import" in prose as imports**, filed twice already, in sections 5 and 11. No test title written in this slice ends in either word, so it cost nothing this time.

**Nothing follows this slice but the step's close**, which is the orchestrator's: the three gates over the step's whole diff, the deploy, Mark's rundown and the merge call.

### The close fold

**The code commit is `88a3808617`, 12 files, 242 lines added and 49 removed.** One file is created, `src/app/__tests__/GameScreen.test.ts`; none is deleted, merged or split. **It is the four fixes the close gates found, folded into one commit**, and it moves no magnitude: `GOLDEN` is in no commit, `WITNESS_VERSION` reads 11, `READINGS_VERSION` 9 and `FORMAT_VERSION` 5 off both trees, and `GOLDEN`'s checksum stands at `-2049717150` with `score: 200`, `mobs: 5`, `corpses: 1` and `kills: 2`.

**The worktree was clean before the first edit** and the tip was `429640ecc0`, exactly the one the prompt names.

**Fix 1, a zero quiet-interval minimum no longer hangs `createRun`.** `resolveTuning` gains `refuseZeroQuietIntervalMinimum`, in `refuseZeroBossHealthRate`'s own shape and beside it, so the stage group's one divisor is refused where the score group's already was. **Zero only**: every cap prices the cards a window's shortest quiet interval leaves room for, so zero floors to Infinity and `createPool` never finishes, while whether a lower positive bound belongs there is a data row a later round measures. **The tape edge inherits it through `tuningOrRefusal`** and nothing was written twice. Two tests, one at the resolver and one at the tape edge, both watched fail first with the row unnamed in the reason; the tape test also asserts the recorded roster still comes back, because reading and replaying are two obligations.

**Fix 2, the live screen attaches at the started run's caps.** `GameScreen.prepare` gains one call to a new `beginDrawing(run)`, which is `ReplayScreen.beginDrawing`'s own shape for the same reason: neither screen has a run in hand when it dresses, and attach is the one place a grow-only pool grows. `fieldCaps`'s JSDoc kept its claim that no candidate can move the caps, which was true when slice 4 wrote it and is now the wrong thing to lean on, so it says what the pools open at and points at `beginDrawing` instead. **`FrameBudgetScreen` does not dress the same way and is untouched**: every run it makes is `createRun(SEED)` with no record, its `capsFor(DEFAULT_TUNING)` is exactly what those runs derive, and its own comment already says so.

**The pin went red on the real defect and blocks its removal.** The new test fakes `tuningFromUrl` and nothing else, because no candidate in the table moves the quiet interval's minimum yet, so the record cannot reach the screen through a real `?tuning=` name; the run, its caps and every renderer are the real ones. Without the call it fails inside `prepare()` with `Error: no corpse sprite at slot 704`, which is `requireSlot` calling the slot walk a bug rather than a case to handle. **It sits in `src/app/__tests__/` rather than beside the screen**, and the test-span fence is what said so: it spans `app/seedFromUrl` as well as `app/screens/game`, `src/app` has no blanket allowance by design, and `RunsScreen.test.ts` is the standing precedent for a screen test placed at the lowest folder containing its span. The fence caught it on the first whole-suite run and the test moved; the fence did not.

**Fix 3, the two stale comments.** `StartingConditions.startingScore` said no tape header carries a score, false since slice 6, and now says the header carries the whole starting condition with this row in it, so a staged ladder run replays holding its score. `GOLDEN`'s re-pin paragraph named the deleted `TRASH_KILL_SCORE` and now names the record row `score.trashKillScore`. **Comment-only, and `digest.ts` carries nothing else**: the value and the checksum did not move and `digest.test.ts` is green.

**Fix 4, the report's identity spells the record as dotted rows.** `BatchIdentity.tuning` is `readonly TuningRow[] | null`, the shape `tuningRows` already produces, so `report.json` now spells `stage.processionPurse` in the same words the header, the comparison and the command line use (the draft's ruling 2). `rowsKey` and `sharedTuning` take rows, `collectRun` converts once, `compareBatches`'s `rowsByName` reads rows and no longer imports `tuningRows` at all, and `isBatchReport` asks for an array. **`READINGS_VERSION` stays 9**: this is the report's shape and not a reading, and the store is dormant so no written report needs migrating. The batchReport test that carried the record was rewritten to assert the rows and to name `stage.processionPurse` outright, which is the one test-name removal in the diff.

**The sweep re-run, on the slice 8 command and the same eight seeds.** `pnpm vite-node --config vite.headless.config.ts scripts/sweep.ts steady-middling 20260820 8 local/step6/closefold tuning=default,spendable` exits 0, 8 of 8 verified on both sides, and the narration's first line under the pair is still `stage.processionPurse: 116 against 42` ahead of `337 readings ordered`. **Every tick count and byte count matches slice 8's table seed for seed**, which is the half worth re-running: the report's shape moved and the numbers did not.

**The tests: 5 added, 1 removed, none deleted, skipped or weakened.** The test-name diff reads 2,431 names in the baseline and 2,435 now, and the one removal is the batchReport test's rename, whose replacement is among the five. The baseline is this branch's own tip captured before the first edit, into the scratchpad and in no commit.

**The fences, each by title, all green**, over the same 86 cases: `src/game imports only from src/game`, `src/input imports only from src/input and src/game`, `src/dev imports only from src/dev and src/game and src/tape`, `src/tape imports only from src/tape and src/game`, `src/app/sound.ts imports only from src/game/events`, `src/app/ui imports only from src/app/ui`, `every test file imports only from inside its parent folder's subtree`, `no screen imports another screen`, `no module under src/app reaches for engine()`, `carries no value-import cycle beyond the ones written down` with `KNOWN_CORE_CYCLES` still empty, `reaches nothing in game/stage/stage from game/caps`, `the caps derivation and the core read the record off the run`, `the lock's module imports nothing`, `the tuning record's module imports nothing`, `the tape codec imports nothing from the director`, `blocks './step' from src/game/sim.ts` and its six siblings, `only src/game/bosses/banshee.ts draws from the bossFire stream` and its siblings, `orders no reading against a number of its own`, and the two declared-reading guards.

**`pnpm verify` green twice on the code commit's tree** and twice on the working tree before it, plus `pnpm typecheck`, `pnpm vitest run`, `pnpm lint` and `pnpm build` green from `apps/hungry-grave/`. 163 test files and 2,424 passing, with the same 11 expected failures and 2 todos.

**CodeRabbit, one iteration: zero findings across all twelve files.** Nothing applied and nothing declined.

**Two prompt claims found soft against the tree.** The prompt asks for `FrameBudgetScreen` "if it dresses the same way", and it does not, for the reason above. The prompt reads `FORMAT_VERSION` 5 as a constant that does not move, which is right, and the prompts file's own header still reads 4 at HEAD, which slice 6 spent; section 2 is the ledger either way.
