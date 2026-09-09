# Step 3 slice prompts, drafted by session 17

One block per slice, in the order plan section 10 dispatches them. The launch preamble is the same for every slice: name the playbook and the plan sections carrying the contract items, then point at the coder contract. Slice 0 has no block of its own because it makes no commit: it is the first act of slice 1, below. Slices 2 onward have no draft yet; write them from plan section 10 in the same shape.

## Slice 1, as dispatched in session 17 (after the three gates and the fixer)

Model: Opus, subagent type general-purpose. Commit messages end in `(#98)`.

Step 3 slice 1 of The Hungry Grave (ticket #98): the hand.

Read `apps/hungry-grave/docs/push/step-3-coder-contract.md` (inside the worktree) first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it. The dispatch contract items the playbook asks for (definition, verification steps with actors, seams, module boundaries, the test list) are sections 1 to 8 of `apps/hungry-grave/docs/design/step-3-playing-harness-dispatch.md`; your slice is section 10's slice 1. The design record behind it is `apps/hungry-grave/docs/design/playing-harness.md`, whose amendments dated 2026-09-09 are the three gates' findings applied: read the amendment and not only the paragraph above it.

## Your slice

**First, slice 0, which makes no commit.** Before any edit: capture `pnpm vitest list --json` to `local/step3/tests-baseline.txt` (worktree root, outside version control), and record two tapes at the tip with `scripts/record-conditioned.ts`, saved outside the repo. They are format version 2 and they are slice 3's input for verification step 7, the old-tape refusal, so say in the note exactly where you put them.

**Then slice 1, per plan section 10.** `bot.ts`'s look-ahead becomes a parameter on `scoreMove` and `bestMoveToward`, `LOOKAHEAD_TICKS` retires (the settled point reads the last element of the list it was passed), and `bestMoveToward`, `nearestFood` and `LOOKAHEAD_SAMPLES` are exported. The three existing call sites pass `LOOKAHEAD_SAMPLES` by name and there is no default, because a default would hide which horizon a policy reads at the moment the file gains one that reads a different horizon. **The six existing policies do not move in behaviour**: module test 75 is the mechanical form of that promise and every figure they have produced has to keep meaning what it meant.

`configurations.ts` lands with **one row, `steady-far`**, plus `SHARP_HAND`, `RESERVED_POLICIES` and the parse. `PERSON_POLICY = 'person'` and `SCRIPT_POLICY = 'script'` are declared in `src/tape/tape.ts` beside `TAPE_INPUT_DEVICES` in this slice, because `RESERVED_POLICIES` is built from them and `src/dev` may not reach `src/app` (`boundary.test.ts:69-74`); nothing writes either into a header until slice 3.

`harnessPolicy.ts` lands with the three-clause wanting rule (the live offer's nearest body, else the nearest food, else `HOME`), the belch on the configuration's own threshold, and **no hold and no stream**, so its signature here is `harnessPolicy(configuration)`. Slice 5 widens it to take the seed; a `seed` parameter nothing reads fails `noUnusedParameters`. The body rule is nearest by centre distance with ties to the lower entity id, which is `chooseOfferBody`'s own rule written again rather than called, and spec test 1 is what holds the two together.

Spec tests 1 to 9 and 17, module tests 46 to 48, 52, 54 and 75, and fences 76 to 78 land here, by the numbers in plan section 6.

**Spec test 7 reports as well as passes.** It plays the pinned seeds, so put the reach it saw on them in the note beside the pass: a birthright hand crossing a stage no birthright run has crossed is this step's riskiest assumption (hand-forward (g)). A low reach is a finding for #39's tuning pass and never a reason to sharpen the hand or move a row in this slice.

**Three records say the harness has four verbs and this slice restates all three.** ADR 0053 is amended in place, dated, in the what-stood, what-it-replaced, what-it-could-not-have-known form: what stood is the whole ruling, what changed is the verb list, what it could not have known is that #37's story 12 would still have no hand two steps later (#98's third comment). The glossary's Playing harness entry (`CONTEXT.md:201`) and the V1 line in the concept box (`game-concept.md:11`) are restated the same way with a citation to that amendment, the second carrying a dated note that the widening is the session's commitment under Mark's review, because that line is his own restated wording and is not silently rewritten. `CONTEXT.md` also gains Configuration, Rig, and Sharp hand and sloppy hand, from the record's section 9.

**`GOLDEN` must not move**, and neither may `WITNESS_VERSION` or `READINGS_VERSION`. If any of them moves, stop: the slice is wrong.

`.claude/rules/code-core.md` rules the shape: guards at the top, one concept per file, the public interface at the module's end, nothing abnormal silent.

## State of the branch

- The tip is `d3db6f4b31`: the two records after the three gates at `c8ee3cb42e`, the coder contract at `d3db6f4b31`. Nothing of step 3's code exists yet; yours is the first slice.
- There is no test baseline yet. Slice 0 above is where you make it, at `local/step3/tests-baseline.txt`; every later slice diffs against it.
- `pnpm verify` was green at the last code commit, adjustment iteration 4 at `311cc7b8a8`; every commit since is documentation. A timeout with no assertion is contention, not a failure: run the suite alone once more before calling it red (`docs/agents/lessons.md`).
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`. Any scratch file goes in the session scratchpad directory named in your system prompt. `local/` is reached by none of the standing checks: it is outside version control, outside eslint, outside prettier and outside `tsconfig.json`'s `include`. The one thing that does reach it is vitest, which has no config of its own, so a `*.test.ts` left under `local/` runs in the suite. Batch tapes go under `local/batches/` and nothing under `local/` ever enters a commit. Editor diagnostics name scratch files and stale states; `pnpm typecheck` is the judge. Nothing under `docs/` is ever handed to prettier by name.
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): the harness hand feeds, takes offers and belches (#98)` or better in the same form. Note: `docs(hungry-grave): step 3 progress note after slice 1 (#98)`. Your note commit creates `apps/hungry-grave/docs/push/step-3-progress.md` with the layout the coder contract names: 1 slices committed, 2 GOLDEN moves, 3 CodeRabbit, 4 plan claims found false against the tree, 5 seams that moved, 6 the baseline tapes, 7 verification steps run, then one section per slice.

## Slice 2, as dispatched in session 17 (after slice 1 landed)

The launch preamble is the slice 1 one above. Model: Opus, subagent type general-purpose.

Step 3 slice 2 of The Hungry Grave (ticket #98): the two event fields and the readings.

Read `apps/hungry-grave/docs/push/step-3-coder-contract.md` (inside the worktree) first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it. The dispatch contract items the playbook asks for (definition, verification steps with actors, seams, module boundaries, the test list) are plan sections 1 to 8 of `apps/hungry-grave/docs/design/step-3-playing-harness-dispatch.md`; section 10 is the slice list and yours is slice 2.

## Your slice

Plan section 10, slice 2, in full: `OfferOpened.site` and `OfferTaken.slot` in `events.ts`, written at `standOffer`'s two callers and at `resolveOffer`; `offerChoices.ts` and `wakingSwallows.ts` registered in the readings graph; `dropLedger` widened by line; `gravePath` gains floor visits and recoveries; `mobFireAlivePerTick` in `replayTallies.ts` and on `Metrics`; the `READING_COMPARISONS` entries that keep `comparisonDeclared.test.ts` green. Spec tests 19 to 26 and 83, module tests 65, 72 to 74, 84 and 85, and guard 79 land here. **`GOLDEN` must not move and `READINGS_VERSION` must not move**; if either does, stop, the slice is wrong. Read the plan's sections 4 (the seams these readings cut at), 5 (each module's boundary and `mayImport` fence), 6 (the tests by number) and 7 (every reader of anything you change) before the first edit, and the design record's section 4 for what each reading is for.

Hand-forwards from slice 1's note (`docs/push/step-3-progress.md` section 8) that bind you: the hand walks at a banked offer's body while it is still above the top edge, because `openBanked` opens at `-OFFER_ENTRY_DEPTH` and the wanting rule reads the body's position with no bounds clause; that is correct under the rule as ruled and is a reading, not an edit, so `offerChoices` must be able to show a take-by-slot on a banked offer against a death-point offer (the reading #98's second comment asked for). The reserved policy names are declared and unread until slice 3; touch nothing in the header. `HAND_STREAM`, the seed on `harnessPolicy`, the other eight rows and the widened `ConfigurationName` are slice 5's; touch none of them.

Every reading you add is a number a batch will reduce and a person will compare; none is a verdict. A reading's name is the plain thing it counts.

## State of the branch

- The tip is `d7a0ba9eb5`: slice 1's code at `66dfcea268` (the hand, `steady-far`, ADR 0053 amended, the glossary entries), its note at `d7a0ba9eb5`. Read the progress note's sections 1 to 7 and section 8 in full before any edit.
- The test-name baseline is at `local/step3/tests-baseline.txt` (worktree root's `apps/hungry-grave/local/`, outside version control); diff your test names against it before you commit and report removed or renamed names net of slice 1's 31 additions.
- `pnpm verify` was green at `66dfcea268` (1691 passed, typecheck and build green with the two standing warnings). Two tests in `bot.test.ts` carry a 30 s budget in that file's existing idiom. A timeout with no assertion is contention, not a failure: run the suite alone once more before calling it red (`docs/agents/lessons.md`).
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`. Any scratch file goes in the session scratchpad directory named in your system prompt. `local/` is reached by none of the standing checks except vitest, so no `*.test.ts` ever goes there; nothing under `local/` ever enters a commit. Editor diagnostics name scratch files and stale states; `pnpm typecheck` is the judge. Nothing under `docs/` is ever handed to prettier by name.
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): the offer's site and slot are events and the batch readings exist (#98)` or better in the same form. Note: `docs(hungry-grave): step 3 progress note after slice 2 (#98)`, appended as section 9 titled "Slice 2, the two event fields and the readings", with its row added to section 1's table.

## Slice 3, as dispatched in session 17 (after slice 2 landed)

The launch preamble is the slice 1 one above. Model: Opus, subagent type general-purpose.

Step 3 slice 3 of The Hungry Grave (ticket #98): the header field, and the one bump.

Read `apps/hungry-grave/docs/push/step-3-coder-contract.md` (inside the worktree) first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it. The dispatch contract items the playbook asks for (definition, verification steps with actors, seams, module boundaries, the test list) are plan sections 1 to 8 of `apps/hungry-grave/docs/design/step-3-playing-harness-dispatch.md`; section 10 is the slice list and yours is slice 3.

## Your slice

Plan section 10, slice 3, in full: `TapeHeader.policy`, the write and the read in the positional header, `FORMAT_VERSION` 3, `PERSON_POLICY` and `SCRIPT_POLICY` (declared in `src/tape/tape.ts` by slice 1) imported and written here by `tapeHeader.ts` and `record-conditioned.ts`, the policy on `Provenance` and in `exclusionsOf`, and every one of the fourteen header literals in section 7. Spec tests 27 to 32, module tests 66 and 69, land here. **Verification step 7, the old-tape decode check, runs here on slice 0's two tapes and its result goes in the note.** **ADR 0056 is amended in place here**, because this is the slice that spends the version and the amendment is what says why it spends it once; the amendment is dated 2026-09-09 in the what-stood, what-changed, what-it-could-not-have-known form, and it records that the director's budget is build-pinned as the session's commitment under Mark's review (the design record's section 12). Read the plan's sections 4, 5, 6 and 7 for this slice before the first edit, and ADR 0043 and ADR 0053 for the rules the bump obeys: one field, a name string, never a code byte, old tapes refused with the reason stated.

Hand-forwards from slice 2's note (`docs/push/step-3-progress.md` section 9) that bind you: `AggregateExclusion` gaining `policy`, `exclusionsOf` pushing it and `Provenance` carrying it are yours, because they read the header field; `OfferSite` is exported from `src/game/events.ts` and is imported from there. Slice 1's note (section 8): the reserved names are declared and unread until you write them; `tapeHeaderFor` writes `PERSON_POLICY`, `record-conditioned.ts`'s `headerFor` writes `SCRIPT_POLICY`, both importing from `src/tape/tape.ts`, and nothing in `src/dev` reaches `src/app`.

Tests first, red, then the code: slice 2's coder wrote the implementation before its tests and paid it back with mutations; do not repeat that, the playbook's order is the order. `GOLDEN`, `WITNESS_VERSION` and `READINGS_VERSION` must not move; if any does, stop, the slice is wrong. `FORMAT_VERSION` moves exactly once, to 3, here and never again in this step.

## State of the branch

- The tip is `18bd764c33`: slice 1's code at `66dfcea268` (note `d7a0ba9eb5`), slice 2's code at `c784a356e5` (note `18bd764c33`). Read the progress note's sections 1 to 7 and sections 8 and 9 in full before any edit.
- The test-name baseline is at `local/step3/tests-baseline.txt` (under `apps/hungry-grave/local/`, outside version control); diff your test names against it before you commit and report removed or renamed names net of slices 1 and 2 (45 additions so far). Slice 0's two format-2 tapes are where slice 1's note section 6 says; they are the input to verification step 7.
- `pnpm verify` was green at `c784a356e5` (1705 passed, typecheck and build green). Five whole-stage `dodgePolicy` tests in `bot.test.ts` time out intermittently under the suite's parallel load, never on an assertion, pre-existing since before step 3 (slice 2's note); a timeout with no assertion is contention, not a failure, and the fix is slice 7's, not yours; run the suite alone once more before calling anything red (`docs/agents/lessons.md`).
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`. Any scratch file goes in the session scratchpad directory named in your system prompt. `local/` is reached by none of the standing checks except vitest, so no `*.test.ts` ever goes there; nothing under `local/` ever enters a commit. Editor diagnostics name scratch files and stale states; `pnpm typecheck` is the judge. Nothing under `docs/` is ever handed to prettier by name. Do not touch `docs/push/handoff.md`.
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): every tape names the policy that steered it, and the format moves to 3 (#98)` or better in the same form. Note: `docs(hungry-grave): step 3 progress note after slice 3 (#98)`, appended as section 10 titled "Slice 3, the header field and the one bump", with its row added to section 1's table and verification step 7's result in section 7.

## Slice 4a, as dispatched in session 17 (after slice 3 landed)

The launch preamble is the slice 1 one above. Model: Opus, subagent type general-purpose.

Step 3 slice 4a of The Hungry Grave (ticket #98): the runner.

Read `apps/hungry-grave/docs/push/step-3-coder-contract.md` (inside the worktree) first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it. The dispatch contract items the playbook asks for (definition, verification steps with actors, seams, module boundaries, the test list) are plan sections 1 to 8 of `apps/hungry-grave/docs/design/step-3-playing-harness-dispatch.md`; section 10 is the slice list and yours is slice 4a.

## Your slice

Plan section 10, slice 4a, in full: `harnessRun.ts` with the derived tick budget and the harness rig's header, taking the commit hash and the recorded-at stamp as arguments; `scripts/batch.ts` taking the output root as its fourth argument and writing one tape per seed under `steady-far`, with no report at all. Spec test 45, module tests 55 to 58, 70 and 71 land here. **You record a small batch, measure two of its tapes with `scripts/measure.ts` by hand, and put both readings in the note**: this is the first proof that a harness tape replays and attests as a person's does. Read the plan's sections 4, 5, 6 and 7 for this slice before the first edit, and the design record's section 4 (the batch) and section 6 (the rigs, so the harness rig's header names its rig) for what the runner is for. Batch tapes go under `apps/hungry-grave/local/batches/` and never enter a commit; the runner's shell in `scripts/` owns the filesystem and `src/dev` never touches `node:fs`.

Hand-forwards from slice 3's note (`docs/push/step-3-progress.md` section 10) that bind you: `harnessRun.ts` writes the configuration's name into the header's `policy`, and `inputDevice` on a harness header is `'bot'`, so a harness run carries two exclusions, `bot` and `policy`, which is correct rather than double counting; `RESERVED_POLICIES` is load-bearing, a configuration named `person` or `script` would write a real header a report reads as a person's; the readback runs against a format 3 tape, so nothing recorded before `4093d4be81` can be its input; the store's summary row carries no policy (unowned, trigger #100), and you add no column. From slice 1's note: slice 5 owns `HAND_STREAM`, the seed on `harnessPolicy`, the eight other rows and the widened `ConfigurationName`; the runner takes a configuration name and today there is one.

Tests first, red, then the code. `GOLDEN`, `WITNESS_VERSION`, `READINGS_VERSION` and `FORMAT_VERSION` (3) must not move; if any does, stop, the slice is wrong.

## State of the branch

- The tip is `f254c2551b`: slice 1 `66dfcea268` (note `d7a0ba9eb5`), slice 2 `c784a356e5` (note `18bd764c33`), slice 3 `4093d4be81` (note `f254c2551b`), then this prompt's docs commit. Read the progress note's sections 1 to 7 and sections 8 to 10 in full before any edit.
- The test-name baseline is at `local/step3/tests-baseline.txt` (under `apps/hungry-grave/local/`, outside version control); diff your test names against it before you commit and report removed or renamed names net of slices 1 to 3 (53 added, one renamed, all accounted for in their notes).
- `pnpm verify` was green at `4093d4be81` (1712 passed, typecheck and build green with the two standing warnings). Five whole-stage `dodgePolicy` tests in `bot.test.ts` time out intermittently under parallel load, never on an assertion, pre-existing; the fix is slice 7's, not yours; run the suite alone once more before calling anything red (`docs/agents/lessons.md`).
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`. Any scratch file goes in the session scratchpad directory named in your system prompt. `local/` is reached by none of the standing checks except vitest, so no `*.test.ts` ever goes there; nothing under `local/` ever enters a commit. Editor diagnostics name scratch files and stale states; `pnpm typecheck` is the judge. Nothing under `docs/` is ever handed to prettier by name. Do not touch `docs/push/handoff.md`.
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): one command plays a batch of seeds and writes a tape per seed (#98)` or better in the same form. Note: `docs(hungry-grave): step 3 progress note after slice 4a (#98)`, appended as section 11 titled "Slice 4a, the runner", with its row added to section 1's table and the two hand measurements in it.

## Slice 4b, as dispatched in session 17 (after slice 4a landed)

The launch preamble is the slice 1 one above. Model: Opus, subagent type general-purpose.

Step 3 slice 4b of The Hungry Grave (ticket #98): the report, and the end of A.

Read `apps/hungry-grave/docs/push/step-3-coder-contract.md` (inside the worktree) first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it. The dispatch contract items the playbook asks for (definition, verification steps with actors, seams, module boundaries, the test list) are plan sections 1 to 8 of `apps/hungry-grave/docs/design/step-3-playing-harness-dispatch.md`; section 10 is the slice list and yours is slice 4b.

## Your slice

Plan section 10, slice 4b, in full: `fiveNumbersOf` in `seriesSummary.ts`; `batchReport.ts` with `BatchReduction`, `BATCH_READINGS` and `batchReportOf`, and the build's mob widths on the batch's identity; `scripts/batch.ts` gains `report.json`; guards 80 and 81. Spec tests 36 to 41, module tests 59 to 64 and 86, land here. `CONTEXT.md` gains Batch. **Verification step 10, the first 48-seed batch under the sharp corner, runs here and its table goes in the note.** **A ends here**: after this slice the harness plays, records and reports under one hand. Read the plan's sections 4, 5, 6 and 7 for this slice before the first edit, and the design record's section 4 in full for what the report is (distributions and never means, five-number summaries with the extreme seeds named, every reading by weapon line, no number a verdict; guard 81 is the mechanical form of that last rule).

Hand-forwards from slice 4a's note (`docs/push/step-3-progress.md` section 11) that bind you: `<count>` becomes optional here, defaulting to `BATCH_SEEDS` from `batchReport.ts`, in the commit that creates that row; the measuring pass is yours and the runner does none, so you add the decode and `report.json` beside the tapes; the folder's stamp is the number every header records; `playHarnessRun` is byte-deterministic in its four arguments, which is what lets the report be a function of the tapes; six format-3 tapes from `dbb61bf506` sit at `apps/hungry-grave/local/batches/steady-far-1788934491101/` and measure clean, usable as a fixture for a test that reads a batch rather than plays one. From slice 2's note (section 9): `BATCH_READINGS` must cover the seven new report paths it lists (`tuning.offerChoices.choices`, `tuning.offerChoices.bankedWhileStanding`, `tuning.dropLedger.byLine`, `tuning.wakingSwallows.span`, `tuning.gravePath.floorVisits`, `tuning.gravePath.floorRecoveries`, `mobFireAlivePerTick`) and guard 80 names any it misses; an offer still standing when the tape stops looks like a lost one in `offerChoices` unless a field with a caller separates them, and if the report needs the difference this is where the caller appears. Slice 5 still owns `HAND_STREAM`, the seed on `harnessPolicy`, the other eight rows and the widened `ConfigurationName`.

The 48-seed batch and its report are readings, never bars: the note carries the table and the report's own agreement grammar, and no row moves because of what it says. Tests first, red, then the code. `GOLDEN`, `WITNESS_VERSION`, `READINGS_VERSION` and `FORMAT_VERSION` must not move; if any does, stop, the slice is wrong.

## State of the branch

- The tip is `ffa8560e87` plus this prompt's docs commit: slice 1 `66dfcea268` (note `d7a0ba9eb5`), slice 2 `c784a356e5` (note `18bd764c33`), slice 3 `4093d4be81` (note `f254c2551b`), slice 4a `eb41654b11` (note `ffa8560e87`). Read the progress note's sections 1 to 7 and sections 8 to 11 in full before any edit.
- The test-name baseline is at `local/step3/tests-baseline.txt` (under `apps/hungry-grave/local/`, outside version control); diff your test names against it before you commit and report removed or renamed names net of slices 1 to 4a (64 added, one renamed, all accounted for).
- `pnpm verify` was green at `eb41654b11` (1723 passed, typecheck and build green with the two standing warnings). Five whole-stage `dodgePolicy` tests in `bot.test.ts` time out intermittently under parallel load, never on an assertion, pre-existing; the fix is slice 7's; run the suite alone once more before calling anything red (`docs/agents/lessons.md`). The 48-seed batch takes about a minute and a half at 1.6 s a run plus the measuring pass; run it alone, not beside the suite.
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`. Any scratch file goes in the session scratchpad directory named in your system prompt. `local/` is reached by none of the standing checks except vitest, so no `*.test.ts` ever goes there; nothing under `local/` ever enters a commit. Editor diagnostics name scratch files and stale states; `pnpm typecheck` is the judge. Nothing under `docs/` is ever handed to prettier by name. Do not touch `docs/push/handoff.md`.
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): a batch reports every reading as a spread across its seeds, by weapon line (#98)` or better in the same form. Note: `docs(hungry-grave): step 3 progress note after slice 4b (#98)`, appended as section 12 titled "Slice 4b, the report, and the end of A", with its row added to section 1's table and the 48-seed table in it.

## Slice 5, as dispatched in session 18 (after slice 4b landed, and B begins)

The launch preamble is the slice 1 one above. Model: Opus, subagent type general-purpose.

Step 3 slice 5 of The Hungry Grave (ticket #98): the two knobs.

Read `apps/hungry-grave/docs/push/step-3-coder-contract.md` (inside the worktree) first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it. The dispatch contract items the playbook asks for (definition, verification steps with actors, seams, module boundaries, the test list) are plan sections 1 to 8 of `apps/hungry-grave/docs/design/step-3-playing-harness-dispatch.md`; section 10 is the slice list and yours is slice 5.

## Your slice

Plan section 10, slice 5, in full: the other eight configuration rows; the hold and the `hand` stream in `harnessPolicy.ts`, whose signature widens here to `harnessPolicy(configuration, seed)` and which the note records as a seam that moved; `stream`'s name parameter widened; `rng.test.ts`'s `NAMES` derived from `Object.keys(createRun(0).streams)` plus `HAND_STREAM`, which closes #113 with a list nobody keeps by hand. Spec tests 10 to 16, 18 and 33 to 35, module tests 49 to 51 and 53, and guard 82 land here. `CONTEXT.md` gains Dexterity error and Strategy error, from the record's section 9. **Verification step 9, the determinism run under `shaky-short`, runs here and its result goes in the note.** **B begins here.** Read plan sections 4 (`configurations.ts` and `harnessPolicy.ts` in full, including every paragraph dated 2026-09-09), 6 and 7 for this slice before the first edit, and the design record's section 3 in full.

**Read the record's section 3 amendment dated 2026-09-09 that begins "after Mark asked whether the knobs were too siloed" before you write a line.** It changed the shape of this slice's central mechanism after the block above it was first drafted, and the paragraph above it is the superseded version. The short form:

**The hold is a lapse of attention and not a standing slowness.** Every decision rolls attention first. On most decisions attention holds and the hand acts on the tick, exactly as the sharp corner does. Only when the roll fails does the hand keep its previous command, for a depth drawn uniformly from 0 to the row's bound. So each row carries two numbers and not one:

| Name | `lapsePerMille` | `lapseBound` |
| --- | --- | --- |
| steady | 0 | 0 |
| loose | 100 | 15 |
| shaky | 250 | 36 |

**This replaces `holdBound` on the `Configuration` interface, which slice 1 landed and nothing reads yet.** Retire that field and land the two above in its place, with the JSDoc the plan's section 4 now carries. `steady-far`'s row becomes `lapsePerMille: 0, lapseBound: 0`.

**The order of the draws is load-bearing: the rate first, then the depth, and a rate of zero rolls nothing at all.** A hand that never lapses must make no draw of either kind, so `steady-far` never touches the stream. Two things rest on it. The determinism run is under the sloppy corner precisely because the sharp corner's stream is untouched. And **`steady-far`'s behaviour must not change**: it is the sharp half slice 6 compares against, and the 48-seed batch at `apps/hungry-grave/local/batches/steady-far-1788937370786/` was played under it against `5f7f365e99`. If any `steady-far` figure moves, stop, the slice is wrong.

**The rungs nest, and a test should say so.** A loose hand is a steady hand on nine decisions in ten; a shaky hand is a steady hand on three in four, and its lapse depth runs the whole way from nothing to the full 36, so one shaky hand produces steady decisions, loose-sized lapses and shaky-sized lapses inside a single run. That is the property, not an accident of the numbers.

**The two rates are undefended starting rows and step 4 moves them (#39).** Do not tune them, do not derive them, and do not move one because a reading looks wrong. A moved rate is a new configuration name.

**`CONTEXT.md`'s Dexterity error entry describes the lapse**, not a constant slowness: how often attention fails, and how deep the lapse runs when it does. Strategy error is unchanged from the record's section 9.

**Filed and not yours: #116**, the lapse depth's missing tail. The record's section 3 says why it is deliberately out of this slice. Do not build it, and do not add the three rows it names.

Hand-forwards from slice 4b's note (`docs/push/step-3-progress.md` section 12) that bind you: `ConfigurationName` is read by `BatchOrigin` and `BatchIdentity`, so widening the union widens them with no edit in `batchReport.ts`; `BATCH_READINGS` covers every reading a verified report carries today and this slice adds no reading, so nothing is owed there; `compareBatches.ts` joins guard 81's `MODULES` list at slice 6 and not here. From slice 1's note (section 8): the hand walks at a banked offer's body above the top edge, which is a reading for later and not an edit here.

Tests first, red, then the code. Slice 2's coder wrote the implementation before its tests and paid it back with nine mutations; do not repeat it. `GOLDEN`, `WITNESS_VERSION` (6), `READINGS_VERSION` (2) and `FORMAT_VERSION` (3) must not move; if any does, stop, the slice is wrong. The hand's stream is made in `src/dev` off the run's seed and never inside `RunState`, which is what keeps `WITNESS_VERSION` still.

`.claude/rules/code-core.md` rules the shape: guards at the top, one concept per file, the public interface at the module's end, nothing abnormal silent.

## State of the branch

- The tip is `bb882862af` plus this prompt's docs commit. `bb882862af` is the record amendment described above and it is the reason this block was rewritten; an earlier draft of this same block, carrying a single `holdBound` drawn on every decision, is superseded by it and is not in the file. Code so far: slice 1 `66dfcea268` (note `d7a0ba9eb5`), slice 2 `c784a356e5` (note `18bd764c33`), slice 3 `4093d4be81` (note `f254c2551b`), slice 4a `eb41654b11` (note `ffa8560e87`), slice 4b `876aa63f72` (note `6f8807b21d`). Read the progress note's sections 1 to 7 and sections 8 to 12 in full before any edit.
- The test-name baseline is at `local/step3/tests-baseline.txt` (under `apps/hungry-grave/local/`, outside version control); diff your test names against it before you commit and report removed or renamed names net of slices 1 to 4b (86 added, one removed, all accounted for in section 7).
- `pnpm verify` was green at `876aa63f72` (1745 passed, typecheck and build green with the two standing warnings). Five whole-stage `dodgePolicy` tests in `bot.test.ts` time out intermittently under parallel load, never on an assertion, pre-existing since before step 3; the fix is slice 7's, not yours. Run the suite alone once more before calling anything red (`docs/agents/lessons.md`).
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`. Any scratch file goes in the session scratchpad directory named in your system prompt. `local/` is reached by none of the standing checks except vitest, so no `*.test.ts` ever goes there; nothing under `local/` ever enters a commit. Editor diagnostics name scratch files and stale states; `pnpm typecheck` is the judge. Nothing under `docs/` is ever handed to prettier by name. Do not touch `docs/push/handoff.md`.
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): the hand's attention lapses and it holds a stale command when it does (#98)` or better in the same form. Note: `docs(hungry-grave): step 3 progress note after slice 5 (#98)`, appended as section 13 titled "Slice 5, the two knobs", with its row added to section 1's table, the widened `harnessPolicy` signature and the retired `holdBound` recorded in section 5 as seams that moved, and verification step 9's result in section 7.

## Slice 6, as dispatched in session 18 (after slice 5 landed)

The launch preamble is the slice 1 one above. Model: Opus, subagent type general-purpose.

Step 3 slice 6 of The Hungry Grave (ticket #98): the comparison, and the done line.

Read `apps/hungry-grave/docs/push/step-3-coder-contract.md` (inside the worktree) first and follow it in full, including its reading order. Read `docs/agents/feature-playbook.md` and follow it. The dispatch contract items the playbook asks for (definition, verification steps with actors, seams, module boundaries, the test list) are plan sections 1 to 8 of `apps/hungry-grave/docs/design/step-3-playing-harness-dispatch.md`; section 10 is the slice list and yours is slice 6.

## Your slice

Plan section 10, slice 6, in full: `compareBatches.ts` with the directions, the band separation row and the corner agreement. Spec tests 42 to 44 and module tests 67 and 68 land here. **Verification steps 11 and 12 run here.** Read the plan's section 4 entry for `compareBatches.ts` in full before the first edit, and the design record's section 4 subsection "How a comparison is stated".

**Play both corners fresh at your own tip, 48 seeds each.** The sharp batch that exists on disk was recorded against `5f7f365e99`, which is four commits back and before the hand's knobs existed. Slice 5 proved `steady-far`'s behaviour is unchanged by replaying six seeds to identical figures, so the old batch is not wrong, but a comparison whose two halves carry two commit hashes is a comparison through two instruments and that is the exact thing the batch identity exists to catch. Play `steady-far` and `shaky-short` both, from the same seed base as the sharp half used (20260909), at the tip your code commit will have. The sharp half costs about two and a half minutes; slice 5's note says the sloppy half is much cheaper because its runs are short. Run them alone, not beside the suite.

**Report the two reach rates and do not judge them.** How many of 48 entered the Undertaker's phase under each corner, side by side, in the note and in a comment on #98. **Whether they are far enough apart is Mark's step 17 and it is not yours**, and neither is any conclusion about whether a row should move. If the numbers look wrong to you, that is a finding for the note and for #39, never an edit.

**The separation row is a number that must exist before it can be measured.** The plan's verification step 12 says it ships as data at zero, meaning bands that merely fail to overlap, and the first two batches are what say what it should be. Report what the two corners' bands actually looked like and **propose** a figure; do not change the row without saying plainly in the note that you did and why.

**A finding you are handed, and what to do with it.** Slice 5 looked at six seeds and saw the sloppy corner running three to five thousand ticks against the sharp corner's twenty-plus thousand, a seventh of the run. The record was written fearing the two corners would sit on top of each other; the first look says the opposite may be true, and that a middling rung may carry the interesting part of the ladder. Your 48-seed pair is the real measurement of that. Put it in the note and on #98 as a reading. **Do not retune, do not move a rate, and do not add a rung.** If the corners are far apart, that is Mark's step 17 answering itself and it is his to read.

Hand-forwards that bind you: **`compareBatches.ts` joins guard 81's `MODULES` list here**, which slice 4b and slice 5 both left owed. Nothing this slice adds is a reading, so `BATCH_READINGS` and `batchReadingDeclared.test.ts` are untouched unless you add one, in which case it needs its row. **#116, the lapse depth's missing tail, is filed and unbuilt**: the record's section 3 names its trigger, and your comparison is the evidence that either fires it or does not. Say which in the note, and never build it.

Tests first, red, then the code. `GOLDEN`, `WITNESS_VERSION` (6), `READINGS_VERSION` (2) and `FORMAT_VERSION` (3) must not move; if any does, stop, the slice is wrong.

`.claude/rules/code-core.md` rules the shape: guards at the top, one concept per file, the public interface at the module's end, nothing abnormal silent.

## State of the branch

- Code so far: slice 1 `66dfcea268`, slice 2 `c784a356e5`, slice 3 `4093d4be81`, slice 4a `eb41654b11`, slice 4b `876aa63f72`, slice 5 `6abdb4255c` (note `8db7b7fee0`). Read the progress note's sections 1 to 7 and sections 8 to 13 in full before any edit, and section 13's hand-forwards in particular.
- The design record's section 3 was amended on 2026-09-09 after Mark asked whether the knobs were too siloed: the hold is a lapse of attention rolled per decision, not a number drawn every decision. Read that amendment, because the comparison you are writing is a comparison between hands built that way.
- The test-name baseline is at `local/step3/tests-baseline.txt` (under `apps/hungry-grave/local/`, outside version control); diff your test names against it and report yours net of what slices 1 to 5 account for (the counts are in the note's section 7).
- `pnpm verify` was green at `6abdb4255c` (1761 passed, typecheck and build green with the two standing warnings). Five whole-stage `dodgePolicy` tests in `bot.test.ts` time out intermittently under parallel load, never on an assertion, pre-existing; the fix is slice 7's, not yours. Run the suite alone once more before calling anything red (`docs/agents/lessons.md`).
- A process slip from slice 5, recorded so you do not repeat it: its mutation script restored files with `git checkout` and reverted three of them mid-slice. Mutate against copies, never against the working tree.
- Never run any command from the main checkout at `/home/mlo/dev/niftymonkey/the-cabinet`. Any scratch file goes in the session scratchpad directory named in your system prompt. `local/` is reached by none of the standing checks except vitest, so no `*.test.ts` ever goes there; nothing under `local/` ever enters a commit. Editor diagnostics name scratch files and stale states; `pnpm typecheck` is the judge. Nothing under `docs/` is ever handed to prettier by name. Do not touch `docs/push/handoff.md`.
- Check `git status --short` is clean before your first edit.

## Commit messages

Code: `feat(hungry-grave): two batches compare by direction, and the corners either agree or split (#98)` or better in the same form. Note: `docs(hungry-grave): step 3 progress note after slice 6 (#98)`, appended as section 14 titled "Slice 6, the comparison, and the done line", with its row added to section 1's table, verification steps 11 and 12 in section 7, and the two corners' tables in the section itself.
