# Step 3 progress note: the playing harness (ticket #98)

One section per slice at the end, and the cross-slice facts first. Written by each slice's coder, appended to and never rewritten.

## 1. Slices committed

| Slice | Commit | Message |
| --- | --- | --- |
| 0, the baselines | none | No commit by design. Section 6 says what it produced and where. |
| 1, the hand | `66dfcea268` | `feat(hungry-grave): the harness hand feeds, takes offers and belches (#98)` |
| 2, the two event fields and the readings | `c784a356e5` | `feat(hungry-grave): the offer's site and slot are events and the batch readings exist (#98)` |
| 3, the header field and the one bump | `4093d4be81` | `feat(hungry-grave): every tape names the policy that steered it, and the format moves to 3 (#98)` |
| 4a, the runner | `eb41654b11` | `feat(hungry-grave): one command plays a batch of seeds and writes a tape per seed (#98)` |
| 4b, the report, and the end of A | `876aa63f72` | `feat(hungry-grave): a batch reports every reading as a spread across its seeds, by weapon line (#98)` |
| 5, the two knobs | `6abdb4255c` | `feat(hungry-grave): the hand's attention lapses and it holds a stale command when it does (#98)` |
| 6, the comparison, and the done line | `60f6e652d1` | `feat(hungry-grave): two batches compare by direction, and the corners either agree or split (#98)` |
| 7, the fences and the full verification pass | `29a97f2c88` | `test(hungry-grave): the whole-stage dodge tests carry a stated budget (#98)` |
| Bug fix, the middle rung's reading crash | `032b72d794` | `fix(hungry-grave): a belch kill names its type off the kill event (#98)` |

## 2. GOLDEN moves

None, and none is allowed in this step.

Slice 1: `GOLDEN` (`digest.ts:314`) did not move, `WITNESS_VERSION` did not move from 6, and `READINGS_VERSION` did not move from 2. None of the three is touched by the diff, and `src/game/__tests__/digest.test.ts` is green, which is the mechanical form of the first. Nothing this slice changed is folded: the look-ahead is a parameter on a `src/dev` function, the two reserved policy names are declared and written nowhere, and the hand is a seventh policy no scenario runs.

Slice 2: `GOLDEN` did not move, and neither did `WITNESS_VERSION` (6) or `READINGS_VERSION` (2). `src/dev/digest.ts`, `src/game/witness.ts` and `src/dev/readingsVersion.ts` are all outside the diff, which `git diff --stat` over the three answers with nothing, and `src/game/__tests__/digest.test.ts` is green. Nothing this slice changed is folded: the two new event payload fields are not on the wire (`wireCodes.ts` carries no event codes) and not in the witness, and every reading it adds sits beside unchanged ones, which is `readingsVersion.ts:13-16`'s own rule for not bumping.

Slice 3: `GOLDEN` did not move, and neither did `WITNESS_VERSION` (6) or `READINGS_VERSION` (2). `src/dev/digest.ts`, `src/game/witness.ts` and `src/dev/readingsVersion.ts` are all outside the diff, which `git diff --stat` over the three answers with nothing, and `src/game/__tests__/digest.test.ts` is green. `FORMAT_VERSION` is the one version this step spends and it moved from 2 to 3 here, once, and never again in this step. Nothing this slice changed is folded: the header is not folded at all, the fold reads live run state (`witness.ts:363`), and the policy is a header field the simulation never sees.

Slice 4a: `GOLDEN` did not move, and neither did `WITNESS_VERSION` (6), `READINGS_VERSION` (2) or `FORMAT_VERSION` (3). The slice adds four files and edits none, so `git status --short` before the commit named exactly those four and `git diff --stat` over `src/dev/digest.ts`, `src/game/witness.ts`, `src/dev/readingsVersion.ts` and `src/tape/wireCodes.ts` answered with nothing. `src/game/__tests__/digest.test.ts` is green. Nothing this slice changed is folded, because nothing this slice changed existed before it: the runner plays through the one execution authority and the shell writes bytes, and neither touches the fold, the witness or the wire.

Slice 4b: `GOLDEN` did not move, and neither did `WITNESS_VERSION` (6), `READINGS_VERSION` (2) or `FORMAT_VERSION` (3). `git diff --stat` over `src/dev/digest.ts`, `src/game/witness.ts`, `src/dev/readingsVersion.ts` and `src/tape/wireCodes.ts` answered with nothing, and `src/game/__tests__/digest.test.ts` is green. Nothing this slice changed is folded: the report is a reduction of measurements taken off tapes that already existed, the shell writes one more file beside the tapes it already wrote, and `seriesSummary.ts` gains a figure no reading in the tree asked for before. `READINGS_VERSION` in particular is untouched on its own rule (`readingsVersion.ts:13-16`): the batch report is a reader of the readings and adds none.

Slice 5: `GOLDEN` did not move, and neither did `WITNESS_VERSION` (6), `READINGS_VERSION` (2) or `FORMAT_VERSION` (3). `git diff --stat` over `src/dev/digest.ts`, `src/game/witness.ts`, `src/dev/readingsVersion.ts` and `src/tape/wireCodes.ts` answered with nothing, and `src/game/__tests__/digest.test.ts` is green. Nothing this slice changed is folded: the hand's stream is made in `src/dev` off the run's seed and never inside `RunState`, so the run still holds exactly its own five streams and the fold still walks exactly those, which the new guard in `witness.test.ts` asserts rather than assumes. `stream`'s widened parameter changes who may ask for a stream and not what a stream is, so `StreamName` and `RunState.streams` are untouched.

Slice 6: `GOLDEN` did not move, and neither did `WITNESS_VERSION` (6), `READINGS_VERSION` (2) or `FORMAT_VERSION` (3). `git diff --stat` over `src/dev/digest.ts`, `src/game/witness.ts`, `src/dev/readingsVersion.ts` and `src/tape/wireCodes.ts` answered with nothing, and `src/game/__tests__/digest.test.ts` is green. Nothing this slice changed is folded, and nothing it changed is even read during a run: the comparison is a reduction of two reports that were themselves reduced from tapes, and the one existing file it edits is a guard's own module list. The strongest form of it is section 14's own reading: the sharp corner replayed at this slice's tip is flat against its own batch from four commits back on all 180 rows, so the code under the runs did not move either.

Slice 7: `GOLDEN` did not move, and neither did `WITNESS_VERSION` (6), `READINGS_VERSION` (2) or `FORMAT_VERSION` (3). The slice edits one test file and nothing else, so `git diff --stat` over `src/dev/digest.ts`, `src/game/witness.ts`, `src/dev/readingsVersion.ts` and `src/tape/wireCodes.ts` answered with nothing, and `src/game/__tests__/digest.test.ts` is green on its own and inside the suite. Nothing this slice changed is folded, because nothing this slice changed runs a simulation differently: a stated per-test budget changes how long vitest waits and not what the test plays.

## 3. CodeRabbit

Slice 1: `coderabbit review --agent --uncommitted` from the repo root over the staged work, twelve files reviewed, **one finding, minor, applied**.

- **Applied.** The glossary's new Configuration entry said "Nine of them exist", where one row ships until slice 5. It now reads "Nine are named", which is true today and stays true when the other eight land. CodeRabbit's own suggestion added the slice number to the entry; that half was declined, because a glossary entry carries the word and not the delivery state, and an entry naming a slice would need editing again the day that slice lands.

Slice 2: `coderabbit review --agent --uncommitted` from the repo root over the staged work, sixteen files reviewed, **no findings**. Nothing applied and nothing declined.

Slice 3: `coderabbit review --agent --uncommitted` from the repo root over the staged work, twenty-five files reviewed, **two findings on the first pass, one applied and one declined, then two more on the re-review, both declined**. Every finding landed on the ADR 0056 amendment and none on any code file.

- **Applied, major.** The amendment said a build that retuned the budget "has retuned the rows around it and the witness refuses the tape either way", which overstates what the witness can see. The fold reads live run state and an open set piece's budget is inside it (`witness.ts:347`), and it reads nothing about an authored row a run never reached, so a retune outside the run's path leaves the fold identical and the tape verifies. The sentence now splits the two cases and carries the argument on the half that survives: neither case is helped by the header naming one stage row while a hundred sibling rows stay compiled. **The record's own section 5 still carries the strong sentence** and is section 4's item 10 below.
- **Declined, minor, twice.** The amendment's opening clause was asked to say whether Mark approved or overruled. He has not read it yet, which is the whole point of the one-push rule, and the record must not claim a review that has not happened. The wording is ADR 0053's slice 1 amendment verbatim in form, so the two amendments Mark reviews together read the same.
- **Declined, minor.** Tests were asked for over `SET_PIECE_BUDGET`, asserting a reached set piece's budget diverges and an unreached one does not. `SET_PIECE_BUDGET` is the Waking's compiled pour budget (`setPiece.ts:112`) and not the director's per-phase budget ADR 0056 rules, which has no column on `Phase` and does not exist in the tree; the two were conflated. A test cannot cover a row nobody has authored, and the trigger is already named in the amendment: the day the budget becomes something a run resolves.

Slice 4a: `coderabbit review --agent --uncommitted` from the repo root over the staged work, four files reviewed, **no findings**. Nothing applied and nothing declined.

Slice 4b: `coderabbit review --agent --uncommitted` from the repo root over the staged work, nine files reviewed, **no findings**. Nothing applied and nothing declined.

Slice 5: `coderabbit review --agent --uncommitted` from the repo root over the staged work, nine files reviewed, **one finding, minor, applied**, then a clean re-review over the same nine files.

- **Applied, minor.** The hold-expiry test walked a 40-tick window and asserted only that a decision tick answered what its attentive twin answered, which a hand that never held anything would also pass: on a still enough field a held command and a freshly decided one are the same answer, so every held tick was invisible to it. The window is 400 ticks and the test now also asserts that at least one held tick said something the attentive twin did not, which is the half that makes the hold observable at all. It is the same toothlessness slice 1 found by mutation in module test 75, arriving from a reviewer instead.

Slice 6: `coderabbit review --agent --uncommitted` from the repo root over the staged work, three files reviewed, **no findings**. Nothing applied and nothing declined.

Slice 7: `coderabbit review --agent --uncommitted` from the repo root over the staged work, one file reviewed, **no findings**. Nothing applied and nothing declined.

Bug fix, the middle rung's reading crash: `coderabbit review --agent --uncommitted` from the repo root over the staged work, two files reviewed, **no findings**. Nothing applied and nothing declined.

## 4. Plan claims found false against the tree

**1. Spec test 7's claim that a harness-rig run over the pinned seeds "ends above the birthright and produces `weaponLeveled` events" is false on three of the five seeds.** Plan section 6, test 7, and the record's section 7. Measured at `66dfcea268` under `steady-far` over the whole stage: seeds 101 and 404 open no offer at all, so nothing is ever taken and nothing levels; seed 202 takes one offer, levels one line and a hit strips it back (ADR 0003's ladder), so it ends where it started; seeds 303 and 505 end above the birthright. The cause is the stage and not the hand, and it is measured rather than argued: at the birthright the skull stream is the whole storm, so which mobs a run kills follows the lane it steers, and whether a carrier is among them is a fact about the seed. `dodgePolicy` is paid on four of these five and never on 505 (`NEVER_PAID` in `bot.test.ts`); this hand is paid on the other three. **The plan's intent was followed and its letter was not**: the test now pins what the policy owns, that an offer which stands is taken and pays a rung, plus the two measured seed sets as equalities in `bot.test.ts`'s own idiom, each with its cause written on it, so either set moving fires the test and names the seed. Nothing was sharpened and no row moved, per the plan's own instruction and the record's section 7 as amended. **It is #39's first tuning input** and it is the reading hand-forward (g) asks for.

**2. Plan section 4's `harnessPolicy.ts` seam names `HOME` as the hand's third clause while its `bot.ts` export list omits `HOME`.** Section 4's bot.ts block exports `runPolicy`, the six policies, `bestMoveToward`, `nearestFood` and `LOOKAHEAD_SAMPLES`, and `HOME` (`bot.ts:88`) is none of them. The hand cannot reach the starting mark without it, and declaring a second starting mark in `harnessPolicy.ts` would give one row two owners. **`HOME` is exported from `bot.ts` as well**, which is section 5 below.

**3. Plan section 4 declares `SLOPPY_HAND` and `CONFIGURATION_NAMES` on `configurations.ts` while section 10 ships one row.** `SLOPPY_HAND` would name `shaky-short`, a row that does not exist until slice 5, so it is not in this slice and test 18 is already assigned to slice 5 for that reason. `CONFIGURATION_NAMES` did land, because tests 54 and 77 both walk it.

**4. Plan section 4 declares `type OfferSite` inside `src/dev/readings/offerChoices.ts` while its `events.ts` block gives `OfferOpened` a `site: OfferSite`.** The two cannot both hold: `src/game` may reach `game` and nothing else (`boundary.test.ts:55`), so an event payload type cannot live under `src/dev`. **The plan's intent was followed and its letter was not**: `OfferSite` is declared in `src/game/events.ts` beside `OfferOpened`, which is where the site is known and written, and `offerChoices.ts` imports it and does not re-export it, because one concept has one home. Section 5 below carries it as the seam.

**5. Plan section 4 says `standOffer` "takes the site as a third argument".** It already takes three (`state`, `x`, `y`), so the site is its fourth. Nothing else in that sentence is wrong: the two callers pass `death` and `bank`, and `resolveOffer` puts the index it already computes on the take.

**6. Plan section 5 says `readings.ts` registers the two readings "in the four places the graph is declared" and then cites five line ranges.** There are five: `TuningReadings`, `ReadingsAcc`, `createReadings`, `observeReadings` and `readingsOf`. Both readings landed in all five.

**7. Plan section 4's `replayTallies.ts and measure.ts` block also gives `AggregateExclusion` a `policy`, `exclusionsOf` a push for it and `Provenance` the policy, none of which are in this slice.** Section 10 assigns all three to slice 3, with the header field they read, and section 10 is what the slice list is. They are untouched here.

**8. Plan section 7 says "fourteen files build a `TapeHeader`" and its own list in the same paragraph names seventeen sites.** Two production files (`scripts/record-conditioned.ts`, `src/app/tapeHeader.ts`) and fifteen test files. The count is the stale half and the list is right: seventeen is what the tree holds and seventeen gained the field, the typecheck naming all of them. Nothing was skipped and nothing extra was found.

**9. Plan section 7 says `src/app/__tests__/RunsScreen.test.ts` holds "three literals, `:105`, `:131`, `:198`".** It holds one `TapeHeader` literal, the `headerFor` helper at `:94-107`. The other two lines are `StoredRunSummary` rows built by `summaryRow`, which carry an `inputDevice` of their own and no header at all; the paragraph read a grep for `inputDevice:` as a grep for header literals. **The store's summary row is deliberately untouched**, which is plan section 5's own unowned row: `RunSummaryValues` gains no policy column here, and #100 owns it.

**10. The record's section 5 claims the witness refuses a tape "either way" when a build retunes the director's budget.** The witness folds live run state, an open set piece's budget included (`witness.ts:347`, `:363`), and nothing about an authored row a run never reached, so a retune outside the run's path leaves the fold byte-identical and the tape verifies. The ruling is unharmed and the argument that survives is the other half, that a header naming one stage row while a hundred stay compiled promises a rebuild it cannot deliver. **ADR 0056's amendment carries the narrowed form; `playing-harness.md`'s section 5 still carries the strong one** and is the dispatching session's to fix, since a coder does not edit the record it was dispatched against.

**11. Plan section 4 gives `scripts/batch.ts` an optional `[count]` while the row its default reads lands one slice later.** Section 7 says `BATCH_SEEDS` is 48 and that "its only reader is `scripts/batch.ts`'s default"; section 4 homes `BATCH_SEEDS` on `batchReport.ts`, section 5's "where the rows live" repeats that the batch size lives there, and section 10 gives `batchReport.ts` to slice 4b. So in this slice the default has no row to read. **The plan's intent was followed and its letter was not: `<count>` is required here**, refused out loud with the usage when it is absent, and **slice 4b makes it optional with `BATCH_SEEDS` as the default** in the commit that creates the row. The two rejected alternatives are named rather than left implicit: a bare 48 in the shell is the arithmetic-as-rules the standing rule forbids, and a `BATCH_SEEDS` living in `scripts/batch.ts` for one slice would give one magnitude two homes inside one branch. An argument that gains a default when its default exists is the honest form, and it also means this slice's command never plays 48 runs because somebody left a word off.

**12. Plan section 4's five reduction kinds do not cover the shapes a verified report actually carries.** `spread`, `perLine`, `count`, `peak` and `notReduced` were checked against a real report rather than against the plan's prose: a verified measurement was taken off one of slice 4a's format 3 tapes and every one of the eighty-eight paths `READING_COMPARISONS` declares was printed with its shape. Three shapes have no kind. Numbers under names that are not weapon lines are most of the table (mob types on `tuning.engagements.*`, food kinds on `tuning.freshnessPaid.*`, hit sources on `tuning.damageTaken.hits`, the belch's own arm beside the four lines on `damage`), and `perLine` is "a number per run per weapon line". The section timeline is read twice, as each phase's span and as the reach, and neither is a spread of one number. And `performance` is structurally empty on a headless tape, which is a deliberate not-reduced rather than a hole. **The plan's intent was followed and its letter was not**: the union has seven members, `byName` and `phaseSpans` beside the plan's five, each with the shape it reads and the reason on it. `perLine` stayed beside `byName` rather than being folded into it, because a reading declared per line fails loudly when a name that is not a line's turns up, which is the guard #98's acceptance line actually needs.

**13. Plan section 4's `peak` is "a number per run reduced to the batch's peak", and every peak-shaped reading on a report is a series.** `mobsAlivePerTick`, `mobFireAlivePerTick`, `tuning.gravePath.sizePerTick`, `tuning.fieldPerLine.total` and `tuning.groundHeld.fraction` are all `readonly number[]`. Two halves of the plan disagree and the record carries the derivation: its section 4 as amended says the batch reduces the airborne figure's two halves "to spreads". So `peak` is a series per run, reduced to that run's own peak and then spread, which loses nothing: the batch's own peak is the spread's `max` and the seed that produced it is named beside it, where a single batch-wide number would have been a reading with no tail (ADR 0053).

**14. Plan section 4 has `batchReportOf` take a whole `BatchIdentity`, which makes module test 63 toothless.** Test 63 is "a batch whose tapes name two commits names both in its identity", and a report that copies the hashes out of an argument passes it whichever hashes the caller happened to pass. The hashes are on the runs (`Metrics.identity.commitHash`), so they are read there. **The plan's intent was followed and its letter was not**: `BatchOrigin` is what the command knows before a tape is read, the four things a batch is named by, and `BatchIdentity` is that plus the commit hashes and the mob widths the report derives. Section 5 below carries it.

**15. Plan section 4's `DeclaredBatchReading` is `{ reading, reduction }`, which cannot answer a reading it declares.** The same paragraph says the table is "the same shape as `READING_COMPARISONS` (`compareRuns.ts:290`)", and every entry there carries the accessor that reads its own value off a report; the alternative it names as rejected is "reflecting over the report's shape and inferring". A table of paths and kinds alone would have to infer, which is the thing `comparisonDeclared.test.ts:107-110` was written against. **The plan's intent was followed and its letter was not**: each kind's declaration carries its own reader, so `tuning.dropLedger.byLine` flattens through the reading's own `ledgerByLineNumbers` and the belch's spans are crossed by a named function rather than by the report builder guessing.

**16. Plan section 4 prints `byLine` and `phaseSpans` as full records over every line and every phase.** A line the run never offered has no entry rather than an entry of zeroes, which is `dropLedger.ts`'s own stated rule, and a phase no run in the batch reached has no span to summarise. Both are `Partial` records, and module test 60's second half is what holds it: a reading no run could support is left out rather than folded in as a zero.

**17. Plan section 6 homes guard 81 in `src/dev/__tests__/`, where the fence forbids what the guard has to do.** The guard's own words are "no reading is compared against a literal anywhere in `batchReport.ts`", which is a read of the module's source, and a test file under `src/dev` may import no package but vitest (`boundary.test.ts`'s dev row at `:69-74`, `TEST_PACKAGES` at `:134`), `node:fs` included. It lives at `src/__tests__/harnessStatesNoTarget.test.ts` beside the other cross-cutting guards that read source, which is where `boundary.test.ts` and `lineAgnosticPolicies.test.ts` already are, and it names `compareBatches.ts` as the module that joins its list at slice 6.

**18. The record's section 4 asks the belch reading for how much charge was carried into a boss's span, and nothing on a report carries it.** `belchCadence` carries every fire with its tick, `ticksAtFull` and `wasted` (`belchCadence.ts:27-31`), and no reading records the reservoir per tick, so the charge standing at a span's first tick is not readable off a tape today. The plan's own sentence asks only for "a count of fires per span", which is what the report carries: `tuning.belchCadence.fires` reduces to the run's whole count and each boss span's own. **Nothing was built for the missing half and no row moved**; it is a finding for #39, and the trigger is the day a reading records the reservoir.

**19. Plan section 6's module tests 50 and 52 are written against the mechanism the record's 2026-09-09 amendment replaced.** Test 50 reads "A hold bound of zero re-decides every tick and touches the stream not at all", where under the amendment a rate of zero and not a bound of zero is what draws nothing: a row with a positive rate and a bound of zero still rolls for attention and still draws. Test 52 names "a hold bound, a sample list, a belch threshold and a clearance", where the dexterity error is two numbers and a row has five fields beside its name. **The plan's intent was followed and its letter was not**: test 50 landed as `draws nothing at all at the sharp corner`, the row that carries both zeroes, and test 52 is slice 1's own test renamed to `gives every configuration every knob and no optional field` with the six keys asserted. Both are section 13 below.

**20. Plan section 3's verification step 11 asks this step's two batches for the agreed and split rows, and the seam plan section 4 prints cannot make them from one build.** `readAcrossCorners` takes two `BatchComparison`s, and ADR 0053's grammar is that each of them is one build against another under one corner: agreement is between the sharp corner's ordering and the sloppy corner's ordering of the same pair of builds. This step has one build, so there is no pair for either corner to order and no agreed or split row can exist yet. **The intent was followed and the letter was not**: what ran is `compareBatches` between the two corners themselves, which is section 14's direction table, and the corner reading is held by spec test 44 alone until #39 plays a second build. The one real build-to-build comparison this step can make is the sharp corner against its own earlier batch, and section 14 reports it.

**21. Plan section 3's verification step 13 calls for four fence files and the branch now carries five.** Step 13 names `src/__tests__/lineAgnosticPolicies.test.ts`, `src/__tests__/boundary.test.ts`, `src/dev/__tests__/comparisonDeclared.test.ts` and "the new declaration guard", which is `src/dev/__tests__/batchReadingDeclared.test.ts`. Guard 81 became a fifth file of its own, `src/__tests__/harnessStatesNoTarget.test.ts`, because plan section 6 homed it where the span fence forbids what it has to do (section 4's item 17), and step 13 was never restated to count it. **The plan's intent was followed and its letter was not: all five were run and all five are named by test title in section 7 below**, because a fence the step created and did not list is exactly the fence a full pass would otherwise miss.

## 5. Seams that moved

Slice 1:

- **`bot.ts` exports `HOME`**, beyond the plan's export list, for the reason in section 4 item 2. Its declaration and its comment are untouched.
- **`ConfigurationName` is the single-member union `'steady-far'` in this slice**, not the nine-name union plan section 4 prints. `CONFIGURATIONS` is `Readonly<Record<ConfigurationName, Configuration>>`, so a nine-name union over one row does not compile, and section 10's "A ships one configuration and not nine" is what the type says. **Slice 5 widens the union with the other eight rows**, in the same commit, and the type is the only thing that changes.
- **`harnessPolicy(configuration)` takes no seed**, which is plan section 4's own amendment of 2026-09-09 rather than a move. Slice 5 widens it.
- **`HAND_STREAM` is not in this slice.** Plan section 4's `harnessPolicy.ts` block declares it beside `harnessPolicy`; the stream lands at slice 5 and a name with no stream behind it and no reader is a constant nothing can go red about. **Slice 5 lands it**, and `rng.test.ts`'s derived `NAMES` (test 33, closing #113) is already assigned there.

Slice 2:

- **`OfferSite` is homed in `src/game/events.ts`**, not in `offerChoices.ts` as plan section 4 prints it, for the reason in section 4 item 4. `offerChoices.ts` exports `createOfferChoices`, `observeOfferChoices`, `offerChoicesOf` and the types `OfferChoice`, `OfferChoices` and `OfferChoicesAcc`.
- **`dropLedger.ts` exports `ledgerByLineNumbers` beside its three graph functions**, and `DropLedgerByLine` as a type. The flattener turns the per-line block into names keyed by line so `namedNumbersReading` can compare it, and it is declared beside the counts it flattens on `perLineSummary`'s own precedent (`fieldPerLine.ts:102-113`): comparing the ledger by line is one decision in one place rather than a shape the comparer recognised.
- **`wakingSwallows.ts` and `gravePath`'s widening had no seam block in plan section 4**, only the record's section 4 as amended and the test list. What landed: `wakingSwallows.ts` exports `createWakingSwallows`, `observeWakingSwallows`, `wakingSwallowsOf` and the types `WakingSpan`, `WakingSwallows`, `WakingSwallowsAcc`, with the reading as `{ span: WakingSpan | null }`; `GravePath` gains `floorVisits` and `floorRecoveries`. **Slice 4b's `BATCH_READINGS` needs those paths**, which are `tuning.wakingSwallows.span`, `tuning.gravePath.floorVisits` and `tuning.gravePath.floorRecoveries`.
- **`Metrics` gains `mobFireAlivePerTick`** beside `mobsAlivePerTick`, and `ReplayTallies` with it, exactly as the plan says.

Slice 3:

- **`TapeHeader` gains `readonly policy: string`**, declared between `inputDevice` and `keyboardSpeed`, which is where `writeHeaderRecord` writes it and `readHeader` reads it. The plan's seam exactly.
- **`AggregateExclusion` gains `'policy'`**, pushed by `exclusionsOf` immediately after the device's own exclusion, and `Provenance` gains `readonly policy: string`. No new declaration was needed in `READING_COMPARISONS`: `provenance` is one `descriptiveReading` claiming its whole subtree (`compareRuns.ts:598`), so guard 79 stayed green without an edit.
- **No seam moved beyond the plan's letter**, and nothing new is exported. `PERSON_POLICY` and `SCRIPT_POLICY` were already exported by slice 1 and this slice only imports them.

Slice 4a:

- **`scripts/batch.ts` takes `<count>` as a required third argument**, not the plan's optional one, for the reason in section 4 item 11. The order and the fourth argument are the plan's: `<configuration> <first-seed> <count> [out-root]`, with `out-root` defaulting to `local/batches`.
- **`harnessRun.ts` is the plan's seam exactly**: `playHarnessRun`, `runTickBudget` and `RUN_TICK_SLACK` exported, `HarnessRun` as a type, nothing else. The header literal it builds is the plan's, with `inputDevice: 'bot'` and `policy: configuration.name`.
- **Nothing else moved.** No existing file was edited by this slice at all: it is four new files.

Slice 4b:

- **`seriesSummary.ts` is the plan's seam exactly**: `fiveNumbersOf` and `FiveNumbers` added to the export block, `meanOf` untouched beside them, and a private `nearestRank` carrying the method (`framePerformance.ts:15`'s own convention).
- **`batchReport.ts` exports `MOB_WIDTHS` beyond the plan's list**, because the widths are a fact about the build rather than a reading and the report puts them on the identity for a reader to take a ratio from.
- **`BatchOrigin` is new beside `BatchIdentity`**, for the reason in section 4 item 14. `batchReportOf(origin, runs)` is the signature.
- **`BatchReduction` has seven members and `DeclaredBatchReading` is a discriminated union** carrying one reader per kind, for the reasons in section 4 items 12 and 15. The public names the plan prints, `batchReportOf`, `BATCH_READINGS`, `BATCH_SEEDS`, `BatchIdentity`, `BatchReduction`, `BatchReport`, `DeclaredBatchReading`, `Spread` and `UnverifiedRun`, are all there.
- **`BatchReport.byLine` and `.phaseSpans` are `Partial` records**, for the reason in section 4 item 16.
- **Guard 81 is at `src/__tests__/harnessStatesNoTarget.test.ts`**, not under `src/dev/__tests__/`, for the reason in section 4 item 17.
- **`scripts/batch.ts` takes `<count>` as an optional third argument** defaulting to `BATCH_SEEDS`, which is slice 4a's own hand-forward landing in the commit that creates the row. The order is unchanged: `<configuration> <first-seed> [count] [out-root]`.
- **Test 71 was renamed to the plan's own wording**, `writes one tape per seed and one report beside them, and prints the folder as the whole of what it says`, because the report is what this slice added to it. Section 7 carries it in the test-name diff.

Slice 5:

- **`harnessPolicy(configuration, seed)`**, widened from `harnessPolicy(configuration)`, which is plan section 4's own amendment landing rather than a departure from it. `HAND_STREAM` is exported beside it and the hand's stream is made from the seed handed in, never from `RunState`.
- **`Configuration` retires `holdBound` and carries `lapsePerMille` and `lapseBound`.** Slice 1 landed `holdBound` with nothing reading it, and the record's amendment of 2026-09-09 replaced the single bound with a rate and a depth. Nothing outside `configurations.ts` and `harnessPolicy.ts` ever read the retired field.
- **`ConfigurationName` is the nine-name union** and `CONFIGURATIONS` holds nine rows, which is slice 1's own hand-forward landing. `SLOPPY_HAND` is exported at `shaky-short`, which slice 1 left out because the row did not exist.
- **`stream`'s name parameter is a string**, not `StreamName`. `StreamName` stays the closed union naming the streams a run holds, `RunState.streams` keeps its exact record type, and `STREAM_ORDER` keeps its five names, all three held by the new guard in `witness.test.ts`.
- **`rng.test.ts`'s `NAMES` is derived**, `Object.keys(createRun(0).streams)` plus `HAND_STREAM`, and `draws` takes a name string. That closes #113 and it also widened the overlap search from four names to six, so it now covers thirty ordered pairs rather than twelve.

Slice 6:

- **`compareBatches.ts` is the plan's seam exactly**: `compareBatches`, `readAcrossCorners` and `BAND_SEPARATION` exported, with `Agreement`, `BatchComparison`, `ComparedSpread`, `CornerFinding` and `Direction` as types, and nothing else. `BAND_SEPARATION` is the row at zero the plan ships.
- **A compared row's name carries the family it came from**, which the plan prints no names for. A report keys its spreads three ways and only one of them is the reading's own name, so a flat spread keeps that name, a per-line spread reads `byLine.<line>.<figure>` and a phase's span reads `phaseSpans.<phase>`. One row names one reading and one thing it was split by, and no two families can collide on one name.
- **A comparison covers the spreads and not the counts.** `ComparedSpread` carries a `Spread` on each side, and a count is a name against a tally with no quartile to clear, so endings, stops and the reach are read off the two reports side by side and never ordered. That is plan section 4's own row type followed rather than a decision this slice took, and section 14's tables are where the counts are read.
- **Guard 81's `MODULES` gains `dev/compareBatches.ts`**, which is slice 4b's hand-forward and slice 5's, both owed and now paid. The guard's header loses the line saying the module did not exist yet.

Slice 7:

- **Nothing moved.** The slice adds no export, changes no signature and lands no production file. `ONE_WHOLE_STAGE_MS` is a module-private constant in `bot.test.ts`, on the same footing as the file's own `FIVE_MAXED_RUNS_MS` and `SIX_POLICY_WALKS_MS`.

## 6. The baseline tapes

Recorded at the branch tip `db428611d1` before any step 3 edit, saved under `apps/hungry-grave/local/step3/`, which is outside version control (`.gitignore:16`), outside eslint (`eslint.config.mjs:59`), outside prettier and outside `tsconfig.json`'s include. The slice prompt says "outside the repo"; step 2 put its own under `local/step2/` for the reason that matters here, which is that a session scratchpad does not survive to the slice that needs the file. **They are the input to verification step 7, the old-tape refusal, which slice 3 runs after the format bump.**

- `apps/hungry-grave/local/step3/baseline-a.tape`: seed 2093383922, 12000 ticks, the birthright only (`skullStream=1 territory=0 wisps=0 bell=0`). Format version 2. Measures `verified`, 1397 ticks, ending `sealed`, 24 checkpoints verified, integrity clean.
- `apps/hungry-grave/local/step3/baseline-b.tape`: the same seed and ticks, every line at level 5. Format version 2. Measures `verified`, 3447 ticks, ending `sealed`, 58 checkpoints verified, integrity clean.
- `apps/hungry-grave/local/step3/baseline-a.measure.txt` and `baseline-b.measure.txt`: `scripts/measure.ts` against each, recorded at the tip so slice 3 can compare the refusal against a reading that worked.

**The test-name baseline for verification step 5** is `apps/hungry-grave/local/step3/tests-baseline.txt`, a sorted `file :: name` list, one per line, beside `tests-baseline.json` (the raw `vitest list --json` array with the AssetPack log lines before it stripped so the file parses). **1670 tests, all unique, over 120 files.** `vitest list` does not report a `test.todo`, so the suite's own count runs ahead of this file by the number of todos standing.

## 7. Verification steps run

Slice 0: the step 5 and step 7 baselines recorded, see section 6. No commit.

Slice 1, from the plan's section 3:

- **Step 1, unit tests.** Green. 122 files, 1691 passed, 10 expected fail, 2 todo.
- **Step 2, `pnpm typecheck`.** Green.
- **Step 3, `pnpm build`.** Green, lint and typecheck included. Its warnings are the two standing ones, `@pixi/sound` statically imported alongside its dynamic import (#50) and the pixi chunk over 500 kB.
- **Step 4, `pnpm verify` at the repo root.** Green, exit 0, run from inside the worktree.
- **Step 5, the test-name diff.** `vitest list --json` against `local/step3/tests-baseline.txt`: **31 names added, none removed, none renamed.** Nine in `harnessPolicy.test.ts` plus five per-seed rows, four in `configurations.test.ts`, six in `bot.test.ts` under `the six policies steer on this module's own look-ahead`, and three in `lineAgnosticPolicies.test.ts` (the two new policy modules plus the configuration-name fence). 1670 to 1701.
- **Step 6, the golden digest.** Did not move. See section 2.
- **Step 13, the fences**, in the part this slice owns: `src/__tests__/lineAgnosticPolicies.test.ts` and `src/__tests__/boundary.test.ts` both green. `boundary.test.ts` needed no edit, which is the point of fence 78: `harnessPolicy.ts` and `configurations.ts` reach only `dev`, `game` and `tape` and import no package, so the row that already exists covers them.
- **Steps 7 to 12 and 14** belong to later slices and were not run. **Steps 15 to 18 are Mark's and stay open.**

Slice 2, from the plan's section 3:

- **Step 1, unit tests.** Green. 124 files, 1705 passed, 10 expected fail, 2 todo. See the flakiness finding in section 9.
- **Step 2, `pnpm typecheck`.** Green.
- **Step 3, `pnpm build`.** Green, lint and typecheck included, with the two standing warnings (`@pixi/sound` and the pixi chunk over 500 kB).
- **Step 4, `pnpm verify` at the repo root.** Green, exit 0, on the third attempt; the two before it timed out on pre-existing `bot.test.ts` tests under contention, which section 9 records with the proof that they predate this slice.
- **Step 5, the test-name diff.** `vitest list --json` against `local/step3/tests-baseline.txt`: **45 names added, none removed, none renamed**, of which 31 are slice 1's and **14 are this slice's**. Three in `offer.test.ts`, five in `offerChoices.test.ts`, two in `wakingSwallows.test.ts`, two in `dropLedger.test.ts`, one in `gravePath.test.ts` and one in `measure.test.ts`. 1670 to 1715.
- **Step 6, the golden digest.** Did not move. See section 2.
- **Step 13, the fences**, in the part this slice owns: `src/dev/__tests__/comparisonDeclared.test.ts` green ("every reading on a verified report carries a declared comparison meaning", which is guard 79), and `src/__tests__/boundary.test.ts` green, both rows of it. The span fence went red first and section 9 says why.
- **Steps 7 to 12 and 14** belong to later slices and were not run. **Steps 15 to 18 are Mark's and stay open.**

Slice 3, from the plan's section 3:

- **Step 1, unit tests.** Green. 125 files, 1712 passed, 10 expected fail, 2 todo. No timeout on any run of the suite this slice made.
- **Step 2, `pnpm typecheck`.** Green. It is what found every remaining header literal: thirteen files after `codec.test.ts` and `measure.test.ts` were edited by hand, each named by TS2741 with the missing property.
- **Step 3, `pnpm build`.** Green, lint and typecheck included, with the two standing warnings (`@pixi/sound` and the pixi chunk over 500 kB). It went red once on prettier alone, in `measure.ts` and `measure.test.ts`, and prettier fixed both.
- **Step 4, `pnpm verify` at the repo root.** Green, exit 0, twice: once before the CodeRabbit round and once at the amended tip.
- **Step 5, the test-name diff.** `vitest list --json` against `local/step3/tests-baseline.txt`: **53 names added and one removed**, of which 45 are slices 1 and 2's, so **eight are this slice's: seven added and one renamed**. Added: four in `codec.test.ts` under `the policy the header names`, one in `tapeHeader.test.ts`, two in `measure.test.ts`. Renamed: `codec.test.ts`'s `a format version 1 tape is refused with a format-version error, not decoded` became `a format version 2 tape is refused with a format-version error, not decoded`, which is plan section 7's own instruction that the test "becomes the version 2 refusal at version 3, and the literal moves with it". It keeps the version 1 assertion beside the new one, so nothing it proved was dropped. 1670 to 1722.
- **Step 6, the golden digest.** Did not move. See section 2.
- **Step 7, the old-tape decode check.** **Passed.** Both of slice 0's format version 2 tapes are refused by `scripts/measure.ts`, each with the precise reason and neither with a stack or a coerced reading: `local/step3/baseline-a.tape is not a tape (this tape is format version 2 and this reader is version 3); no measurement was taken`, and the same line for `baseline-b.tape`. Exit code 1. That is `decode.ts:189-192`'s message reaching the person at the command line through `measure.ts`'s own refusal wrapper, which is what ADR 0043's accepted cost looks like when it is paid properly rather than swallowed.
- **Step 13, the fences**, in the part this slice owns: `src/dev/__tests__/comparisonDeclared.test.ts` green with no edit, and `src/__tests__/boundary.test.ts` green. Nothing crossed a boundary: `src/dev/measure.ts` reads the two reserved names from `src/tape/tape.ts`, which is why slice 1 homed them there.
- **Steps 8 to 12 and 14** belong to later slices and were not run. **Steps 15 to 18 are Mark's and stay open**, and step 15 is now half answerable: both ADR amendments it names exist on the branch, ADR 0053's from slice 1 and ADR 0056's from this slice.

Slice 4a, from the plan's section 3:

- **Step 1, unit tests.** Green. 127 files, 1723 passed, 10 expected fail, 2 todo. No timeout on any run of the suite this slice made.
- **Step 2, `pnpm typecheck`.** Green.
- **Step 3, `pnpm build`.** Green, lint and typecheck included, with the two standing warnings (`@pixi/sound` statically imported alongside its dynamic import, and the pixi chunk over 500 kB).
- **Step 4, `pnpm verify` at the repo root.** Green, exit 0, run from inside the worktree.
- **Step 5, the test-name diff.** `vitest list --json` against `local/step3/tests-baseline.txt`: **64 names added and one removed**, of which 53 added and the one rename are slices 1 to 3's, so **eleven are this slice's: eleven added, none removed, none renamed**. Six in `harnessRun.test.ts` and five in `batch.test.ts`. 1670 to 1733.
- **Step 6, the golden digest.** Did not move. See section 2.
- **Step 8, the verification readback on a harness tape.** **Passed**, twice over. Spec test 45 decodes the bytes `playHarnessRun` returns and `measure` answers `verified`, and the two hand measurements below do the same thing from the command line against tapes on disk. A harness tape replays and attests exactly as a person's does, which is #98's acceptance line.
- **Step 13, the fences**, in the part this slice owns: `src/__tests__/boundary.test.ts` green with no edit, both rows of it, and `src/__tests__/lineAgnosticPolicies.test.ts` green. `harnessRun.ts` reaches only `dev`, `game` and `tape` and imports no package, so the filesystem stayed in the shell by construction rather than by care; `scripts/` is outside the fence, which is why `node:fs` lives there.
- **Steps 7, 9 to 12 and 14** belong to other slices and were not run, though the batch below is the first real figure for step 14 and section 11 carries it. **Steps 15 to 18 are Mark's and stay open.**

Slice 4b, from the plan's section 3:

- **Step 1, unit tests.** Green. 131 files, 1745 passed, 10 expected fail, 2 todo. One run of the whole suite failed three `bot.test.ts` whole-stage `dodgePolicy` tests, every one a timeout at vitest's five seconds and not one an assertion; the file alone is green (65 passed, 10 expected fail, 45 s). That is the pre-existing contention slice 2's section 9 proved against `c10b1c5e06`, and slice 7 owns the fix.
- **Step 2, `pnpm typecheck`.** Green.
- **Step 3, `pnpm build`.** Green, lint and typecheck included, with the two standing warnings (`@pixi/sound` statically imported alongside its dynamic import, and the pixi chunk over 500 kB). It went red once on prettier alone across five files, and prettier fixed them.
- **Step 4, `pnpm verify` at the repo root.** Green, exit 0, run from inside the worktree.
- **Step 5, the test-name diff.** `vitest list --json` against `local/step3/tests-baseline.txt`: **86 names added and one removed**, of which 64 added and the one removal are slices 1 to 4a's, so **23 are this slice's: 22 added and one of slice 4a's renamed**. Fourteen in `batchReport.test.ts`, three in `harnessStatesNoTarget.test.ts`, two in `batchReadingDeclared.test.ts`, two in `seriesSummary.test.ts`, one in `batch.test.ts`, plus test 71's rename. 1670 to 1755.
- **Step 6, the golden digest.** Did not move. See section 2.
- **Step 8, the verification readback on a harness tape.** **Passed on all forty-eight.** The batch's measuring pass decodes each tape's own bytes and `measure` answered `verified` for every seed, which the report records as `48 of 48 verified, 0 not`. Slice 4a proved it on one tape by hand; this is the whole batch.
- **Step 10, the first 48-seed batch under the sharp corner.** **Ran.** Section 12 carries the table and the readings.
- **Step 13, the fences**, in the part this slice owns: `src/dev/__tests__/comparisonDeclared.test.ts` green with no edit, `src/__tests__/boundary.test.ts` green with no edit (both rows), `src/__tests__/lineAgnosticPolicies.test.ts` green, and the two guards this slice adds green by their own titles, `every reading on a verified report carries a declared batch reduction` and `the harness reports and never judges`.
- **Step 14, the batch cost.** A partial figure, because the split between playing and measuring is slice 7's: **2 minutes 24.8 seconds of wall clock** for 48 seeds played and measured, from `time` over the one command, vite's cold boot included. Slice 4a measured a played run at about 1.6 seconds, so the measuring pass is roughly the same again as the playing.
- **Steps 7, 9, 11 and 12** belong to other slices and were not run. **Steps 15 to 18 are Mark's and stay open**, and step 18, whether the report reads, is now answerable: section 12's table is the printed thing it asks about.

Slice 5, from the plan's section 3:

- **Step 1, unit tests.** Green. 131 files, 1761 passed, 10 expected fail, 2 todo. No timeout on any run of the suite this slice made, over three whole-suite runs.
- **Step 2, `pnpm typecheck`.** Green.
- **Step 3, `pnpm build`.** Green, lint and typecheck included, with the two standing warnings (`@pixi/sound` statically imported alongside its dynamic import, and the pixi chunk over 500 kB). It went red once on prettier alone across three test files, and prettier fixed them.
- **Step 4, `pnpm verify` at the repo root.** Green, exit 0, run from inside the worktree.
- **Step 5, the test-name diff.** `vitest list --json` against `local/step3/tests-baseline.txt`: **102 names added and one removed**, of which 86 added and the one removal are slices 1 to 4b's, so **sixteen are this slice's: sixteen added, none removed, and one of slice 1's renamed**. Ten in `harnessPolicy.test.ts` (five under the dexterity error, three under the hand's own stream, one strategy error, one determinism), two in `configurations.test.ts`, two in `rng.test.ts` and two in `witness.test.ts`. The rename is slice 1's `gives every configuration all four knobs and no optional field` becoming `gives every configuration every knob and no optional field`, for the reason in section 4 item 19; it is invisible against the slice 0 baseline, because the file it lives in did not exist then. 1670 to 1771.
- **Step 6, the golden digest.** Did not move. See section 2.
- **Step 9, the determinism run under `shaky-short`.** **Passed.** `scripts/batch.ts shaky-short 20260909 6` run twice into two scratch folders: the same six tick counts (3716, 5474, 3457, 3649, 4394, 4759), the same six byte counts, 6 of 6 verified both times, and the two `report.json` files equal field for field once the identity block, which carries the wall clock, is set aside. The in-process half is spec test 13, which plays one seed twice under the sloppy corner and compares the tick count, the witness fold, the run's five stream cursors and the ending. It runs under the sloppy corner on purpose: the sharp corner draws nothing, so the same test under the sharp hand would pass on a harness whose stream was wired wrong, which is spec test 14's own promise held separately.
- **Step 13, the fences**, in the part this slice owns: `src/__tests__/boundary.test.ts` green with no edit, both rows of it, and `src/__tests__/lineAgnosticPolicies.test.ts` green. `harnessPolicy.ts` still reaches only `dev`, `game` and `tape`; `rng.test.ts` and `witness.test.ts` reach `src/dev` for `HAND_STREAM`, which the `game` row already allows in tests (`boundary.test.ts:55`) and which the span fence allows because the reached root differs from the subject's.
- **Steps 7, 8, 10, 11, 12 and 14** belong to other slices and were not run. **Steps 15 to 18 are Mark's and stay open**, and step 17, whether the two ends of the ladder are far enough apart, now has a first six-seed reading in section 13 that says the risk may be the opposite of the one the record expected.

Slice 6, from the plan's section 3:

- **Step 1, unit tests.** Green. 132 files, 1767 passed, 10 expected fail, 2 todo. No timeout on any run of the suite this slice made, over two whole-suite runs.
- **Step 2, `pnpm typecheck`.** Green.
- **Step 3, `pnpm build`.** Green, lint and typecheck included, with the two standing warnings (`@pixi/sound` statically imported alongside its dynamic import, and the pixi chunk over 500 kB). It went red once on prettier alone across the two new files, and prettier fixed them.
- **Step 4, `pnpm verify` at the repo root.** Green, exit 0, run from inside the worktree, twice.
- **Step 5, the test-name diff.** `vitest list --json` against `local/step3/tests-baseline.txt`: **108 names added and one removed**, of which 102 added and the one removal are slices 1 to 5's, so **six are this slice's: six added, none removed, none renamed**. All six are in `compareBatches.test.ts`. 1670 to 1777.
- **Step 6, the golden digest.** Did not move. See section 2.
- **Step 11, both corners and the done line.** **Ran.** 48 seeds under each corner from 20260909, both at this slice's own commit. Section 14 carries the two reach rates, the two tables and the direction rows. The agreed and split rows do not exist yet and section 4's item 20 says why.
- **Step 12, the band separation, measured.** **Ran.** The row was not changed; section 14 reports what the two corners' bands looked like and proposes a figure.
- **Step 13, the fences**, in the part this slice owns: `src/__tests__/harnessStatesNoTarget.test.ts` green over both modules by its own three titles (`orders no reading against a number of its own`, `carries no verdict, because nothing it declares is a yes or a no`, `prints no mean, so every figure it prints keeps its own tail`), `src/__tests__/boundary.test.ts` green with no edit (`compareBatches.ts` reaches only `dev` and imports no package), `src/dev/__tests__/comparisonDeclared.test.ts` green with no edit, and `src/dev/__tests__/batchReadingDeclared.test.ts` green with no edit, because this slice adds no reading.
- **Steps 7 to 10 and 14** belong to other slices and were not run. **Steps 15 to 18 are Mark's and stay open**, and **step 17 is now answerable**: the two reach rates are in section 14 and in a comment on #98.

Slice 7, from the plan's section 3. **This is the full pass: every agent-actor step run at the branch tip, including the ones earlier slices ran when they built the thing.**

- **Step 1, unit tests.** Green. 132 files, 1767 passed, 10 expected fail, 2 todo, 46.5 s. No timeout on any whole-suite run this slice made, over three of them.
- **Step 2, `pnpm typecheck`.** Green.
- **Step 3, `pnpm build`.** Green, lint and typecheck included. Its warnings are the two standing ones, `@pixi/sound` statically imported alongside its dynamic import (#50) and the pixi chunk at 589.65 kB over the 500 kB limit. No prettier failure: nothing this slice edits needed reformatting.
- **Step 4, `pnpm verify` at the repo root.** Green, exit 0, twice, run from inside the worktree.
- **Step 5, the test-name diff.** `vitest list --json` against `local/step3/tests-baseline.txt`: **108 names added and one removed, 1670 to 1777**, which is exactly what slice 6 reported and exactly what slices 1 to 6 account for. **Net of them this slice adds none, removes none and renames none**, which is what a slice with no production feature should read as. The one removal is still slice 3's rename of `codec.test.ts`'s version 1 refusal. The added names by file: 28 `harnessPolicy.test.ts`, 14 `batchReport.test.ts`, 6 each in `harnessRun.test.ts`, `configurations.test.ts`, `compareBatches.test.ts`, `bot.test.ts` and `batch.test.ts`, 5 each in `codec.test.ts` and `offerChoices.test.ts`, 3 each in `offer.test.ts`, `measure.test.ts`, `lineAgnosticPolicies.test.ts` and `harnessStatesNoTarget.test.ts`, 2 each in `witness.test.ts`, `rng.test.ts`, `wakingSwallows.test.ts`, `dropLedger.test.ts`, `seriesSummary.test.ts` and `batchReadingDeclared.test.ts`, and 1 each in `gravePath.test.ts` and `tapeHeader.test.ts`.
- **Step 6, the golden digest.** Did not move. See section 2.
- **Step 7, the old-tape refusal.** **Passed at the tip.** Both format version 2 tapes at `local/step3/` are refused by `scripts/measure.ts`, each with the precise reason and neither with a stack or a coerced reading: `local/step3/baseline-a.tape is not a tape (this tape is format version 2 and this reader is version 3); no measurement was taken`, and the same line for `baseline-b.tape`. Exit code 1 on both. Slice 3 ran this the day it spent the bump; this is the same refusal five commits later.
- **Step 8, the verification readback on a batch tape.** **Passed.** `scripts/measure.ts` against `local/batches/steady-far-1788942858647/20260909.tape`, a tape slice 6 played under the sharp corner, answers `outcome: verified`, 24697 ticks, ending `sealed`, stop `finished`, integrity `clean`, **412 checkpoints verified and 0 unreachable**, against `commitHash 60f6e652d1`. The 96 fresh runs this slice played for step 14 answered `verified` on all 96 as well.
- **Step 9, the determinism re-run.** **Passed, and harder than slice 5 put it.** `scripts/batch.ts shaky-short 20260909 6` twice into two scratch folders: the same six tick counts (3716, 5474, 3457, 3649, 4394, 4759), 6 of 6 verified both times, and the two `report.json` files equal field for field once the identity block is set aside. The stronger form is the bytes: **every one of the six tapes differs between the two runs in exactly three bytes, at offsets 162 to 164, which are the recorded-at stamp in the header.** Everything a run did is byte-identical across the pair, so the hand's stream, the sim and the witness all replay to the same tape and only the clock moves.
- **Step 13, the fences. All five green, none loosened, none edited.** By test title: `src/__tests__/lineAgnosticPolicies.test.ts` (31 titles across five suites, including `src/dev/harnessPolicy.ts names no weapon line`, `src/dev/configurations.ts names no weapon line` and `names no configuration after a weapon line`, which are fences 76 and 77); `src/__tests__/boundary.test.ts` (24 titles, including `src/dev imports only from src/dev and src/game and src/tape`, which is fence 78, and `every test file imports only from inside its parent folder's subtree`); `src/dev/__tests__/comparisonDeclared.test.ts` (`every reading on a verified report carries a declared comparison meaning`, guard 79); `src/dev/__tests__/batchReadingDeclared.test.ts` (`every reading on a verified report carries a declared batch reduction` and `declares each reading once, so its reduction is one decision`, guard 80); and `src/__tests__/harnessStatesNoTarget.test.ts` (`orders no reading against a number of its own`, `carries no verdict, because nothing it declares is a yes or a no`, `prints no mean, so every figure it prints keeps its own tail`, guard 81). 66 tests over the five files, 658 ms. Section 4's item 21 says why there are five rather than the plan's four.
- **Step 14, the batch cost, split.** **Measured.** Section 15 carries the two corners' splits and what they say about nine configurations.
- **Steps 10, 11 and 12** were run by slices 4b and 6 against the tapes on disk and were not replayed here; section 12 and section 14 carry their tables, and step 8 above is the readback of one of slice 6's own tapes at this tip. **Steps 15 to 18 are Mark's and stay open**, and section 15 says which of them the tables now let him answer.

Bug fix, the middle rung's reading crash. Not a slice, so the plan's numbered steps do not all apply; these are the ones that do.

- **Step 1, unit tests.** Green. 132 files, 1769 passed, 10 expected fail, 2 todo, 44.5 s.
- **Step 2, `pnpm typecheck`.** Green.
- **Step 4, `pnpm verify` at the repo root.** Green, exit 0, run from inside the worktree.
- **Step 5, the test-name diff.** `vitest list --json` against `local/step3/tests-baseline.txt`: **1670 to 1779, 110 added and one removed.** Net of slice 7's 108 added and the same one removal, **this fix adds two names, removes none and renames none**, both in `src/dev/readings/__tests__/timeToKill.test.ts`.
- **Step 6, the golden digest.** Did not move, and could not: no file under `src/game` was touched.
- **The failing command, run to completion.** `scripts/batch.ts loose-far 20260909 48` finished at `48 of 48 verified, 0 not`, into `local/batches/loose-far-1788962791962`.

## 8. Slice 1, the hand

The commit is `66dfcea268`. Thirty-one test names added across four files, none removed and none renamed: eighteen in `harnessPolicy.test.ts`, six in `bot.test.ts`, four in `configurations.test.ts` and three in `lineAgnosticPolicies.test.ts`.

**What landed.** `scoreMove` and `bestMoveToward` take the look-ahead samples as a parameter with no default; `LOOKAHEAD_TICKS` is gone and the settled point reads the last element of the list it was passed; the three existing call sites pass `LOOKAHEAD_SAMPLES` by name; `bot.ts` exports `bestMoveToward`, `nearestFood`, `HOME` and `LOOKAHEAD_SAMPLES`. `configurations.ts` lands with one row, `steady-far`, plus `CONFIGURATION_NAMES`, `SHARP_HAND`, `RESERVED_POLICIES` and `isConfigurationName`. `PERSON_POLICY` and `SCRIPT_POLICY` are declared in `src/tape/tape.ts` beside `TAPE_INPUT_DEVICES` and nothing writes either into a header yet. `harnessPolicy.ts` lands with the three-clause wanting rule, the belch on the row's own threshold, and no hold and no stream. ADR 0053 is amended in place with the fifth verb; the glossary's Playing harness entry and the concept box's V1 line are restated with a citation to that amendment, the second carrying a dated note that the widening is the session's commitment under Mark's review; `CONTEXT.md` gains Configuration, Sharp hand and sloppy hand, and Rig.

**Spec test 7's reading, which the slice prompt asks for beside the pass.** The sharp hand over the five pinned seeds, whole stage, budget 27859 ticks:

| Seed | Ticks | Ending | Phases crossed | Offers opened / taken / lost | Levels bought | Belches | Hits | Ends above birthright |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 101 | 27327 | sealed | banshee, crowd, waking, vigil, undertaker | 0 / 0 / 0 | 0 | 3 | 12 | no |
| 202 | 19111 | sealed | banshee, crowd | 1 / 1 / 0 | 1, stripped | 2 | 11 | no |
| 303 | 27859 | budget spent | banshee, crowd, waking, vigil, undertaker | 7 / 6 / 1 | 6 | 5 | 13 | yes, three lines |
| 404 | 20999 | sealed | banshee, crowd, waking | 0 / 0 / 0 | 0 | 3 | 11 | no |
| 505 | 27859 | budget spent | banshee, crowd, waking, vigil, undertaker | 2 / 2 / 0 | 2 | 3 | 12 | yes, two lines |

**The reach: the hand enters the Undertaker's phase on three of the five seeds, and no dodging run reaches it on any.** Measured beside it on the same budget, `dodgePolicy` from the birthright crosses into the Crowd at best (101, 303, 404) and stops at the Banshee on 202 and 505, never sealing and never finishing, because it cannot empty a boss and the phase does not end. That is hand-forward (g)'s reading moved: the hand belches and levels, so it gets through boss fights the dodger stands in front of forever. It is a reading and not a bar, and step 4's tuning pass is what moves it.

**What the same table says against the hand.** It seals on three of five where the dodger seals on none, taking 11 to 13 hits a run against the dodger's 0 to 7. That is the clearance row doing exactly what the record says it does: at 12 rather than 60 the hand commits into a swarm to reach a body, which is what makes it a player rather than a dodger, and the price is hits. **No row was moved and nothing was sharpened.**

**The six policies did not move, proved outside the suite.** A throwaway instrument played all six over the five pinned seeds for the Procession's budget of 8082 ticks, at the tip before any edit, and recorded each run's tick count, ending, grave size to six decimals and swallow count. The grave's size after 8082 ticks is a fine-grained signature of a whole run, because every swallow and every hit moves it. Thirty runs, every figure identical either side of the change. The instrument is deleted, per `docs/agents/lessons.md`: a gameplay fingerprint is not promoted into a committed test, and this repo already has a committed golden digest at that seam.

**Module test 75 is the committed half of that promise**, and it is a walk rather than a sampled state. Each of the six is re-derived from `bestMoveToward` under `LOOKAHEAD_SAMPLES` at every tick of a 500-tick walk on each pinned seed, and the walk counts the ticks where a threat and where food were actually present so a pass over an empty field cannot pass for a pass. **The first version of it read one state at tick 900 and was toothless**: the Procession owns emptiness, nothing comes inside the look-ahead's reach until a shade before tick 1000, and every assertion held on a policy handed a horizon it never read. It was found by mutation, not by reading: shortening `divingPolicy`'s list left the suite green. The walk now goes red on all five seeds for that same mutation. **Four other assertions were found toothless the same way and tightened**: three offer-steering tests passed whichever body the hand chose, because the offer stands its three bodies in a row at one height and a hand below answers the same move for any of them, and because an offer body is itself a corpse, so a hand with no offer clause reached the same body as the nearest food. They spread the bodies to three bearings and lay an ordinary corpse nearer than any of them.

**Two tests carry a stated budget**, `ONE_WHOLE_STAGE_MS` and `SIX_POLICY_WALKS_MS`, both 30000, in the shape `bot.test.ts`'s `FIVE_MAXED_RUNS_MS` already uses and each with its reason on it. Both were added after a run of the whole suite timed them out at vitest's five seconds with no assertion, which is contention plus a genuinely long test rather than a failure; each passes alone. `bot.test.ts`'s new walk helper caches its played states per seed for the same reason.

**Hand-forwards for slice 2 and later.**

- The two reserved policy names are declared and unread. **Slice 3 writes them**: `tapeHeaderFor` writes `PERSON_POLICY`, `record-conditioned.ts`'s `headerFor` writes `SCRIPT_POLICY`, and both import from `src/tape/tape.ts`.
- **Slice 5 owns four things this slice deliberately left**: `HAND_STREAM`, the seed on `harnessPolicy`, the eight other rows, and the widened `ConfigurationName`. Section 5 says why each.
- **The hand walks at a banked offer's body while it is still above the top edge**, because `openBanked` opens at `-OFFER_ENTRY_DEPTH` and the wanting rule reads the body's position with no clause about the field's bounds. It is correct under the rule as ruled and it is worth a reading rather than an edit: slice 4b's report is where a hand pressed against the top edge would show up.
- `apps/hungry-grave/docs/push/handoff.md` was modified by the dispatching session while this slice was in flight. It is not this slice's and it was left unstaged.

## 9. Slice 2, the two event fields and the readings

The commit is `c784a356e5`. Fourteen test names added across six files, none removed and none renamed.

**What landed.** `OfferOpened` gains `site` and `OfferTaken` gains `slot`, both written by `offer.ts` at the three places the sim already knows them: `openOffer` passes `death`, `openBanked` passes `bank`, and `resolveOffer` puts on the take the index it was already computing. `offerChoices.ts` and `wakingSwallows.ts` are new readings registered in all five places the graph is declared. `dropLedger` gains `byLine`, the same five counts under the line each body carried. `gravePath` gains `floorVisits` and `floorRecoveries`. `replayTallies` and `Metrics` gain `mobFireAlivePerTick`. `compareRuns` declares a comparison for every one of them, which is what keeps guard 79 green.

**The per-line ledger is read off the field and not off `corpseLost`, and that is the reviewable part.** `corpseLost` names no line, so a body that scrolled off while its siblings still stood cannot be attributed from the event. The ledger holds each option body's line by the id its spawn reported and, each tick, accounts the bodies that left: the ones a take names by line are the take's, and the rest went over the bottom edge. Without it a half-gone offer breaks the per-line sum, which is exactly the case the file's existing test already builds and which module test 74 now checks line by line.

**A take's line is enough and its id is not needed**, because a draw never repeats a line inside one offer (`offer.ts`'s `drawFrom`) and exactly one offer is live at a time (ADR 0034). That is written as a comment on the helper rather than left as a coincidence.

**The Waking's span reads the observer's tick and not the sim's.** `setPieceOpened` and `setPieceClosed` carry no tick of their own, where `phaseChanged` does, so the span's bounds sit one tick from the section timeline's. It is stated on the type so nobody subtracts one from the other.

**Every new test was proved red by mutation rather than by being written first.** The implementation went in ahead of the tests, which is not the playbook's order, so the red half was paid back mechanically: nine mutations, one per new behaviour, each run against the file that guards it, all nine red, none toothless. The mutations were the site always `death`, the slot always zero, every bank counted, a lost offer passing nothing, the departures walk removed, a lineless body filed under a line, the floor counted as a state rather than a crossing, mob fire counted as the mob population, and every swallow in the run counted as the Waking. The script lived in the session scratchpad and is gone.

**The test-span fence went red and the test was moved, not the fence.** `offerChoices.test.ts` first drove its run through `dev/stepping`, and a test in `dev/readings/__tests__` may reach only `dev/readings` (`boundary.test.ts:345-362`: `dev` has no same-root allowance, and only `game` and `engine` do). It now drives `createExecution` and `executeTick` directly, with the fault check `stepping` carries and its reason written on it. This is the fence doing its job on the first slice to put a test under `dev/readings` that wanted a whole run.

**Finding, pre-existing and not this slice's: `bot.test.ts`'s five whole-stage `dodgePolicy` tests time out under the suite's own parallelism.** They carry no stated budget and run 5.2 to 5.8 seconds against vitest's five-second default, so which of the five falls over changes run to run: seeds 101 and 404 on one run, 303 and 404 on the next, 202 on a third, and none on a fourth. Every failure is a timeout and not one is an assertion. **Proved pre-existing** rather than called it: a detached worktree at `c10b1c5e06` with `node_modules` symlinked, the same suite run there, three timeouts including `crosses every phase in order on seed 101` and no assertion failure. The fix the repo has already ruled for this exact symptom is a stated budget in `bot.test.ts`'s own idiom, which is what slice 1 did for its two long tests; it is not this slice's to make and it is filed here rather than done.

**Hand-forwards for slice 3 and later.**

- **Slice 3 owns the three things plan section 4 lists in the `measure.ts` block that are not here**: `AggregateExclusion` gaining `policy`, `exclusionsOf` pushing it, and `Provenance` carrying it. They read the header field, so they land with it.
- **`OfferSite` is exported from `src/game/events.ts`.** Anything that needs the type imports it from there.
- **Slice 4b's `BATCH_READINGS` covers seven new report paths**: `tuning.offerChoices.choices`, `tuning.offerChoices.bankedWhileStanding`, `tuning.dropLedger.byLine`, `tuning.wakingSwallows.span`, `tuning.gravePath.floorVisits`, `tuning.gravePath.floorRecoveries` and `mobFireAlivePerTick`. Guard 80 will name any it misses.
- **An offer standing when the tape stops looks like a lost one in `offerChoices`**: both carry a null slot, and only the `passed` list separates them, which is the offer's own options on a loss and empty on one still standing. It is the plan's seam as written and it has no extra field for the difference; if the report needs to tell them apart, that is a field with a caller and slice 4b is where the caller appears.
- **The hand walks at a banked offer's body while it is still above the top edge**, carried forward from slice 1. `offerChoices` can now show it: a take on a `bank` row is a take on an offer that entered from above, and the slot on it says where the grave was standing.

## 10. Slice 3, the header field and the one bump

The commit is `4093d4be81`. Seven test names added across three files and one renamed, none removed.

**What landed.** `TapeHeader` gains `policy`, a name string beside `inputDevice`; `writeHeaderRecord` writes it with `writeString` after the input device byte and `readHeader` reads it in the same place, so the positional grammar is unchanged everywhere else. `FORMAT_VERSION` moves from 2 to 3, and its own comment gains the reason in the shape the version 2 note already uses, the one bump and the budget's absence from it included. `tapeHeaderFor` writes `PERSON_POLICY` and `record-conditioned.ts`'s `headerFor` writes `SCRIPT_POLICY`, both imported from `src/tape/tape.ts` where slice 1 declared them, so neither name is spelled twice. `AggregateExclusion` gains `policy`, `exclusionsOf` pushes it for any policy but the person's, and `Provenance` carries the policy. Seventeen sites build a `TapeHeader` and all seventeen gained the field. ADR 0056 is amended in place with the budget pinned to the build, dated, in the what-stood, what-changed, what-it-could-not-have-known form, with the trigger that reopens it and the note that it is the session's commitment under Mark's review; its "left open as design work" line loses that item and says where the answer went.

**The bump was spent once and the amendment is what says why.** ADR 0053 asks for one bump taken together with ADR 0056's open question and before ADR 0057's store fills. Both halves are on the branch now: the policy field is the one field, and the budget takes none because ADR 0027 governs values a run resolves and the budget is authored stage content. **The cost outside the tree is the one the record already named**: any format version 2 tape Mark is holding in `Downloads` stops decoding on this branch, with the message verification step 7 quotes. Inside the tree it costs nothing, because `local/` and `dist/` are regenerated and there is no committed fixture tape (#109).

**The renamed test is plan section 7's instruction and not a judgement call.** `codec.test.ts` pinned the literal 2 inside the version 1 refusal test, and section 7 says that test becomes the version 2 refusal at version 3 with the literal moving with it. It now asserts `FORMAT_VERSION` is 3, that a version 2 tape throws with `format version 2`, and, still, that a version 1 tape throws with `format version 1`, so the older guard was widened rather than replaced. The three comments section 7 names as prose about a version two steps back each gained one clause and none was deleted: `segments.test.ts`'s two-encoders equality, `codec.test.ts`'s frozen unchecked byte, and `verificationReadback.test.ts`'s ticks after the ending. **They were missed on the first pass of this slice and added before the commit**, which is why the commit was amended after a second clean CodeRabbit run over the three files.

**Where the two reserved names are proved rather than asserted.** Spec test 31 is the first test `src/app/tapeHeader.ts` has ever had and it holds `tapeHeaderFor` to `PERSON_POLICY` from the game's side. `SCRIPT_POLICY` is held from outside the process, as an added assertion inside `record-conditioned.test.ts`'s existing end-to-end case, which spawns the real command line and reads the policy back out of the bytes it wrote; that is a stronger seam than a unit test could reach, because `headerFor` is unexported inside a script. The codec's own test 29 is the constants guard the two hang off: neither reserved name is empty, they differ, and each round-trips.

**Spec test 32's presence check.** The exclusion test asserts a keyboard run under `steady-far` is excluded with exactly `['policy']`, and the pre-existing test beside it asserts a keyboard run under `person` is excluded by nothing at all. The pair is what stops the assertion passing over an input that could never have produced the other answer.

**Hand-forwards for slice 4a and later.**

- **A harness header must write the configuration's name into `policy`**, and `harnessRun.ts` is the writer. Anything but `PERSON_POLICY` puts the run outside default aggregates by `exclusionsOf`, which is the point: a batch tape is never counted as a person's. `inputDevice` on a harness header is `'bot'`, so a harness run carries two exclusions, `bot` and `policy`, and that is correct rather than double counting.
- **`RESERVED_POLICIES` is now load-bearing rather than declarative.** Slice 1's test 17 asserts no configuration is named `person` or `script`; from this slice on, a configuration that broke it would write a name into a real header and a real report would read that run as a person's.
- **The store's summary row still carries no policy**, which is plan section 5's unowned row with #100 as its trigger. Every batch tape's bytes carry the policy in the header, so step 6's ingest reads it there and needs no column added here.
- **Slice 4a's verification readback runs against a format 3 tape**, so nothing recorded before this commit can be its input. Any tape a later slice wants as a fixture is recorded at or after `4093d4be81`.

## 11. Slice 4a, the runner

The commit is `eb41654b11`. Eleven test names added across two new files, none removed and none renamed. No existing file was edited: the slice is four new files.

**What landed.** `src/dev/harnessRun.ts` plays one seed under one configuration through the one execution authority and seals it to bytes, with `runTickBudget` derived from `PHASES` rather than written down and `RUN_TICK_SLACK` at 3 as an initial data row. It writes the harness rig's header: the run's own seed, the birthright start `createRun` resolves, `TICK_HZ`, `RECORDER_CHECKPOINT_SPACING`, `WITNESS_VERSION`, the commit hash and the recorded-at stamp it was handed, an empty build identity, `unknown` as the author, `inputDevice: 'bot'` and the configuration's name as the policy. `scripts/batch.ts` is the shell: it parses the configuration, the first seed and the count, asks git for the hash and the clock for the stamp once each, makes `<out-root>/<configuration>-<stamp>/`, plays each seed in turn and writes `<seed>.tape`, and prints the folder path as the whole of stdout. There is no report; that is slice 4b's.

**The batch, recorded by hand.** Six seeds from 20260909 under `steady-far`, at the tip before this slice's own commit, into `apps/hungry-grave/local/batches/steady-far-1788934491101/`, which is outside version control. **Ten and a half seconds of wall clock for all six**, vite's cold boot included, from `time pnpm vite-node --config vite.headless.config.ts scripts/batch.ts steady-far 20260909 6`.

| Seed | Ticks | Ending | Bytes |
| --- | --- | --- | --- |
| 20260909 | 24697 | sealed | 231517 |
| 20260910 | 32652 | victory | 306038 |
| 20260911 | 28710 | sealed | 269108 |
| 20260912 | 28530 | sealed | 267422 |
| 20260913 | 21979 | sealed | 206065 |
| 20260914 | 27198 | sealed | 254950 |

**The two hand measurements, which are the proof the tape replays and attests.** `pnpm vite-node --config vite.headless.config.ts scripts/measure.ts` against two of those six, read off the bytes on disk and not off any run held in memory.

- **20260909**: `outcome: verified`, 24697 ticks, ending `sealed`, stop `finished`, integrity `clean`, **412 checkpoints verified and none unreachable**, 52 kills, no recorded or readback faults. Provenance `{ inputDevice: 'bot', policy: 'steady-far', conditioned: false, exclusions: ['bot', 'policy'] }`, which is slice 3's hand-forward holding: two exclusions on a harness run is correct rather than double counting, and `conditioned` is false because the harness rig starts at the birthright. It crossed the Procession, the Banshee, the Crowd, the Waking and into the Vigil, opened no offer at all and ended at the birthright, belched three times, swallowed four inside the Waking's span, and visited the size floor once without climbing back off it.
- **20260910**: `outcome: verified`, 32652 ticks, ending **`victory`**, stop `finished`, integrity `clean`, **545 checkpoints verified and none unreachable**, 105 kills, no faults. Same provenance shape with the same two exclusions. It crossed all seven phases, spent 23283 to 32651 inside the Undertaker's, took four offers (all at a death point, none out of the bank), bought four rungs and ended with wisps at 2, belched seven times, swallowed eight inside the Waking's span, and visited the floor once and climbed back off it.

**The first harness run to kill the Undertaker, and it is a reading rather than a bar.** Slice 1 measured the hand entering the Undertaker's phase on three of five pinned seeds and finishing none of them inside the one-stage budget it had. Under this slice's budget, three stage lengths, seed 20260910 fights him for 9368 ticks and wins. That is the plan's own reason for the slack row doing exactly what it says: the rows bound a crossing and a fight is neither. **No row was moved and nothing was sharpened.** One victory in six seeds is a figure for #39 and for Mark's step 17, not a verdict from here, and six seeds is not a batch.

**The batch cost, measured.** Six runs of 22000 to 33000 ticks each in 10.45 seconds of wall clock including the boot, so a played run is on the order of 1.6 seconds and a 48-seed batch is a little over a minute of play. The plan's section 8 puts nine configurations at 48 seeds "nearer three quarters of an hour than a quarter" from `bot.test.ts`'s own budget; measured here, 432 runs is nearer twelve minutes of playing, before the measuring pass slice 4b adds. **It is a first figure and not verification step 14**, which is slice 7's and wants a whole 48-seed batch split between playing and measuring. The direction is worth having early: the plan's estimate is pessimistic by roughly three, which is the same factor its own correction of the record moved in the other direction.

**Test 55 was split in two because its first half is toothless on its own.** "The tick budget is derived from the stage's own rows rather than written down" as an equality against a derivation the test file repeats passes just as well over a written-down 83577, because both sides are today's rows. Proved rather than argued: mutating `runTickBudget` to that literal left all six green. The second test re-authors the first phase, adding ten seconds to its last row through `vi.doMock` over `src/game/stage/stage` and re-importing the module, and asserts the budget grows by exactly ten seconds times `TICK_HZ` times the slack. That mutation now goes red, and it is the half that carries the promise.

**Eleven mutations, ten of them red before the split and all eleven after.** One per behaviour, each run against the file that guards it: the written-down budget, the slack row at one, the falling bodies dropped out of a phase's budget, the device written as `script`, the policy written as `person`, the clock asked inside the runner instead of handed to it, the trailer never sealed, the rig started above the birthright, every tape written under one name, a second line on stdout, and the walk's far end unchecked. The script lived in the session scratchpad and is gone.

**The last seed of the walk is checked as well as the first**, which the plan's test 70 does not name and which the tree needs: a count that walked off the top of `SEED_LIMIT` would pin runs to seeds no run can be started from, and the first-seed guard cannot see it. It refuses out loud with both ends named, and the seed test exercises both.

**Progress goes to stderr and stdout carries only the folder.** A batch is minutes of play and a person watching one should see where it has got to, so each seed's ticks, ending and byte count print to stderr as it lands. Test 71 is what holds stdout to the folder path and nothing else.

**The header literal is now the second copy in the tree and the third is the trigger to extract one**, beside `scripts/record-conditioned.ts`'s. The rule of three allows the second; the comment on `harnessHeader` says so where the next writer will read it. **The stage-budget derivation is at three copies already** and they are not the same three: `bot.test.ts` and `harnessPolicy.test.ts` each carry `SLOWEST_DESCENT_TICKS` and `budgetOf` for their own budgets, and `harnessRun.ts` now carries the production one. Extracting it would make test 55's expectation the module's own answer restated, which is the toothlessness the split above exists to kill, so the three stand. **It is a finding for #59 and not this slice's**, and the trigger is a fourth copy or a change to how a phase's length is authored.

**Hand-forwards for slice 4b and later.**

- **`<count>` becomes optional in slice 4b**, defaulting to `BATCH_SEEDS` from `batchReport.ts`, in the commit that creates the row. Until then it is required and refused by name when absent. Section 4 item 11 carries the whole reason.
- **The measuring pass is slice 4b's and this shell does none.** The plan's section 4 has the runner measure the bytes it wrote rather than the run it held, which costs a second replay per run; nothing here decodes anything, so 4b adds both the decode and the `report.json` beside the tapes.
- **The folder's stamp is the same number every header in it records.** `Date.now()` is asked once in `main` and passed both to `folderFor` and to every `playHarnessRun`, so the folder name and the bytes can never disagree about when the batch was played. A report keyed by folder and a report keyed by header are the same report.
- **`playHarnessRun` is deterministic in its four arguments**, which test 58 pins by playing the same seed twice and comparing bytes. That is what lets 4b's report be a function of the tapes.
- **Slice 5 still owns `HAND_STREAM`, the seed on `harnessPolicy`, the eight other rows and the widened `ConfigurationName`.** The runner takes a configuration and today there is one; nothing here reads a knob.
- **The batch tapes from this slice are on disk** at `apps/hungry-grave/local/batches/steady-far-1788934491101/`, six of them, recorded against `dbb61bf506`. They are format 3 and they measure clean, so anything that wants a harness tape to read can use them rather than playing its own.

## 12. Slice 4b, the report, and the end of A

The commit is `876aa63f72`. Twenty-two test names added across four files and one of slice 4a's renamed, none removed. **A ends here: the harness plays, records and reports under one hand.**

**What landed.** `seriesSummary.ts` gains `fiveNumbersOf` and `FiveNumbers`, nearest-rank on the sorted series and absent for an empty one, beside the figures it already had. `batchReport.ts` is new: `BATCH_SEEDS` at 48, `MOB_WIDTHS` off `MOB_TYPES`, the batch's identity and origin, `Spread`, `UnverifiedRun`, `BatchReport`, the seven-kind `BatchReduction`, the `BATCH_READINGS` table over every reading a verified report carries, and `batchReportOf`. `scripts/batch.ts` decodes and measures the bytes it wrote, writes `report.json` beside the tapes, and takes `<count>` as an optional argument defaulting to `BATCH_SEEDS`. Two cross-cutting guards land, one over the declaration table and one over the thing this step exists not to do. `CONTEXT.md` gains Batch.

**Verification step 10, the first 48-seed batch under the sharp corner.** `pnpm vite-node --config vite.headless.config.ts scripts/batch.ts steady-far 20260909 48`, run alone, against `5f7f365e99`. Seeds 20260909 to 20260956, into `apps/hungry-grave/local/batches/steady-far-1788937370786/`, which is outside version control. **2 minutes 24.8 seconds of wall clock, 48 of 48 verified, none unverified, every tape clean and none truncated.**

| Reading | runs | min | lower | median | upper | max | min seed / max seed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| run.ticks | 48 | 14103 | 21223 | 27221 | 28849 | 39632 | 20260930 / 20260925 |
| run.kills | 48 | 19 | 40 | 52 | 75 | 135 | 20260935 / 20260928 |
| levelUps (rungs bought) | 48 | 0 | 0 | 1 | 3 | 7 | 20260909 / 20260917 |
| damageTaken.totalHits | 48 | 9 | 11 | 13 | 15 | 20 | 20260924 / 20260921 |
| gravePath.sizePerTick (peak) | 48 | 34.98 | 38.21 | 39.56 | 40.62 | 43.25 | 20260944 / 20260919 |
| gravePath.floorVisits | 48 | 0 | 1 | 2 | 3 | 6 | 20260917 / 20260923 |
| gravePath.floorRecoveries | 48 | 0 | 0 | 1 | 2 | 5 | 20260909 / 20260923 |
| wakingSwallows.span | 40 | 0 | 1 | 3 | 4 | 8 | 20260923 / 20260910 |
| belchCadence.fires.run | 48 | 2 | 2 | 3 | 4 | 8 | 20260924 / 20260919 |
| belchCadence.fires.banshee | 48 | 1 | 1 | 1 | 1 | 2 | 20260909 / 20260928 |
| belchCadence.fires.undertaker | 29 | 0 | 0 | 0 | 1 | 3 | 20260911 / 20260910 |
| mobsAlivePerTick (peak) | 48 | 34 | 71 | 74 | 76 | 79 | 20260933 / 20260916 |
| mobFireAlivePerTick (peak) | 48 | 66 | 70 | 70 | 71 | 71 | 20260910 / 20260911 |
| dropLedger.spawned | 48 | 0 | 0 | 3 | 12 | 24 | 20260909 / 20260928 |
| dropLedger.swallowed | 48 | 0 | 0 | 1 | 3 | 7 | 20260909 / 20260917 |

**The endings, the stops and the reach, counted.** Endings: 41 sealed, 7 victory. Stops: 48 finished. Integrity: 48 clean. **The reach: 29 of 48 entered the Undertaker's phase and 19 stopped short.** Seven of those 29 killed him. **This is a reading and never a bar**, and whether the two ends of the ladder are far enough apart is Mark's step 17, which needs the sloppy corner slice 5 builds.

**Each phase's span, which is ADR 0049's clock as a distribution.**

| Phase | runs | min | lower | median | upper | max | min seed / max seed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| procession | 48 | 7107 | 7118 | 7207 | 7830 | 7852 | 20260910 / 20260942 |
| banshee | 48 | 1576 | 4084 | 4224 | 5033 | 5569 | 20260937 / 20260954 |
| crowd | 40 | 8401 | 8401 | 8401 | 8401 | 8401 | 20260909 / 20260909 |
| waking | 31 | 900 | 900 | 900 | 900 | 900 | 20260909 / 20260909 |
| vigil | 29 | 4302 | 4547 | 4890 | 4890 | 4906 | 20260941 / 20260942 |
| undertaker | 7 | 3312 | 3697 | 7378 | 9368 | 12744 | 20260917 / 20260925 |

**The Crowd and the Waking hold the same number of ticks on every run that crossed them, and the fight phases do not.** 8401 and 900, flat across 40 and 31 runs. That is what ADR 0051's split predicts, and it is worth having as a measurement rather than as an argument: a phase that ends when its rows run out is as long as its rows, and a phase that ends when a boss dies is as long as the hand made it. The Undertaker's span runs from 3312 to 12744 ticks over the seven runs that finished him. **It is a reading for #39 and nothing was retuned.**

**Take-by-slot, split by site (#98's second comment).** Over the 48 runs: 24 takes at slot 0, 30 at slot 1, 32 at slot 2, every one at a death point; 8 death-point offers and 1 banked offer went untaken. **The bank barely appears**: one banked offer in 48 runs, and `offerChoices.bankedWhileStanding` is 0 on 47 of the 48 with a single 1 at seed 20260936. Decision 9's corner is real and almost never reached under this hand. A finding for #39 and for the sloppy corner to read against.

**The drop ledger by weapon line**, the reading this step widened, over the runs that stood a body of that line: skullStream 34 runs, territory 30, wisps 28, bell 26. Spawned runs 1 to 7 per line and swallowed 0 to 4, with the per-line medians at 1 to 2 spawned and 0 to 1 swallowed. Every line's four terminal counts add up to that line's spawned, which module test 74 holds run by run.

**Two things the table says that nobody asked for, both findings and neither acted on.** `damageTaken.hits.banshee` is 0 on all 48 runs where `hits.undertaker` reaches 11, so the Banshee never lands a hit on this hand and the Undertaker does; that is a boss whose pattern the hand walks through. And `run.score`, `scoreBleeds` and `scoreBled` are 0 on every run, so the ladder's first rung never fires under a hand that has no score to bleed. Both are #39's.

**Three readings in the report are build constants rather than readings**: `gravePath.bottomEdgeMargin` (76), `upfieldTraffic.bandUnits` (38) and `upfieldTraffic.lateralReach` (54), each flat across all 48 because each is a compiled row the reading prints so it says what it measured with. They cost a spread row apiece and they are honest where they are; if #39 wants them off the readings and onto the identity beside the mob widths, that is a decision about the per-run report and not about the batch.

**Grave-to-mob scale, printed and never stated.** The grave's peak size spreads 34.98 to 43.25 with a median of 39.56, beside the widths this build fields: shambler 22, revenant 26, ghoul 18. The ratio is the reader's to take, which is what the record asks for.

**The whole report is 134 spreads, 40 per-line spreads over four lines, six phase spans and seven counts**, in `report.json` beside the tapes. The table above is the part a person reads; the file is what step 4 reads.

**Test 41 and guard 81 are two halves of one promise and both are here.** Test 41 walks a real report and finds only numbers and strings in it, with the walk proved by a planted boolean. Guard 81 reads the module's own source and finds no ordering against a number, no `meanOf` and no boolean at all, each with a planted example proving the scan fires. Between them the report cannot carry a verdict either as a value or as a line of code.

**Sixteen mutations, fourteen red on the first pass and all sixteen after.** One per behaviour, each run against the file that guards it: the wrong nearest rank, a five-number summary that sorts its caller's series in place, the extreme seeds swapped, every figure filed flat instead of under its line, an unverified run dropped, a live phase measured to zero, every run counted as having reached, one commit named instead of two, half widths instead of widths, a reading removed from the table, an ordering against a literal, a `meanOf` import, no report written, a default count of 2 instead of the row, the offer's slot dropped from the take, and the offer's site dropped from it. **Two survived and both were real holes.** Module test 60 as first written only proved that a batch with nothing in it collects nothing, which is true by construction, so it gained the case a batch with runs in it can reach: a reading no run could support is left out rather than folded in as a zero, which the Waking's span on a batch that never opened the Waking is. And take-by-slot had no test at all, because the plan's numbered list folds it into the readings that landed at slice 2 where the counting of them is this slice's; it now has its own. The script lived in the session scratchpad and is gone.

**The untaken offer row is one row for two facts, deliberately.** Slice 2's hand-forward says an offer standing when the tape stops looks like a lost one in `offerChoices`, and the report does not tell them apart: both count under `<site>.untaken`. The report needs the takes, so no field was added for a difference nothing reads, which is the cited-future rule. If #39 wants the split, the field and its caller appear together.

**Hand-forwards for slice 5 and later.**

- **`compareBatches.ts` joins guard 81's `MODULES` list when it lands.** The guard is written for two modules and holds one today, and the line saying so is in its own header.
- **The nine configurations cost about twenty-two minutes, measured rather than estimated.** 48 seeds played and measured is 2 minutes 25 seconds, so 432 runs is a little over twenty. The plan's section 8 put it "nearer three quarters of an hour than a quarter" from `bot.test.ts`'s budget; the measured figure sits between the two, because the plan's estimate was for playing alone and the measuring pass roughly doubles it. **Verification step 14 is still slice 7's** and wants the split stated separately.
- **The batch tapes and the report are on disk** at `apps/hungry-grave/local/batches/steady-far-1788937370786/`, forty-eight of them plus `report.json`, recorded against `5f7f365e99`. Slice 6's comparison needs a second batch under `shaky-short` to put beside it, and this one is the sharp half already played.
- **`BATCH_READINGS` covers every reading a verified report carries today**, and a reading slice 5 or later adds needs a row here or `batchReadingDeclared.test.ts` goes red. Slice 5 adds no reading, so nothing is owed.
- **Slice 5 still owns `HAND_STREAM`, the seed on `harnessPolicy`, the eight other rows and the widened `ConfigurationName`.** `ConfigurationName` is read by `BatchOrigin` and `BatchIdentity`, so widening the union widens them with no edit here.

## 13. Slice 5, the two knobs

The commit is `6abdb4255c`. Sixteen test names added across four files, none removed, and one of slice 1's renamed. **B begins here: the harness has nine hands rather than one.**

**What landed.** `Configuration` retires `holdBound` and carries `lapsePerMille` and `lapseBound` in its place; `ConfigurationName` widens to the nine names and the other eight rows land beside `steady-far`; `SLOPPY_HAND` is exported at `shaky-short`. `harnessPolicy` widens to `harnessPolicy(configuration, seed)`, makes its own stream under `HAND_STREAM` off the seed it was handed, and holds a stale command for a drawn number of ticks whenever the attention roll fails. `stream`'s name parameter widens from `StreamName` to a string, which is the one sim-side change and is what lets `src/dev` make a stream without putting the bot's dice in `RunState`. `rng.test.ts`'s `NAMES` is derived from `Object.keys(createRun(0).streams)` plus `HAND_STREAM`, which closes #113 with a list nobody keeps by hand. `CONTEXT.md` gains Dexterity error and Strategy error.

**The hold is a lapse and not a standing slowness**, which is the record's section 3 as amended on 2026-09-09. Every decision rolls the rate first; only a failed roll draws a depth; a rate of zero rolls nothing at all. The order is in `lapseDepth` and it is what makes `steady-far` touch the stream not once in a whole run.

**`steady-far` did not move, proved against the branch's own recorded batch.** The six seeds from 20260909 were replayed under this slice's code and every figure is identical to slice 4a's table: 24697 sealed, 32652 victory, 28710, 28530, 21979, 27198 ticks, and the same byte count for each. Beyond that, the whole `report.json` of the two batches is equal field for field once the identity block (which carries the wall clock) is set aside. The 48-seed sharp batch at `apps/hungry-grave/local/batches/steady-far-1788937370786/` therefore stays comparable with everything measured after this slice.

**The sloppy corner bites, and hard.** The same six seeds under `shaky-short` run 3457 to 5474 ticks against the sharp corner's 21979 to 32652, with every run sealing where the sharp hand sealed on five and won on one. Median 3716 ticks against 27198, which is roughly a seventh of the run. **It is a reading and nothing was moved because of it**, and the two corners' real comparison is slice 6's with 48 seeds each. Recorded here because a gap this wide is the opposite of the risk the record worried about: the concern was two corners too close to separate, and the first six-seed look says the sloppy hand may be so far below the sharp one that a middling rung carries the interesting part of the ladder. That is #39's and Mark's step 17, not this slice's.

**Sixteen mutations, one per behaviour, fifteen red on the first pass and all sixteen after.** The rate of zero still rolling the stream, a hold one tick too long, a hold that never expires, the depth's top value unreachable, the rate compared off by one, the hand drawing under a run stream's name, the seed ignored, the head knob unread, the lapse never taken at all, the sloppy corner's depth cut to loose's, shaky lapsing at loose's rate, a head thinned rather than shortened, the sloppy corner named wrong, a name that is not a hand word and a head word, and every stream name folded to one. **The one that survived was the rate off by one**, `>=` against `>`, which changes 250 in 1000 into 251 and shows up in no command the hand gives: the draws that separate them are the handful landing on the row's own number. It is now pinned by a test that counts the hand's draws over 30000 ticks against the same schedule, one draw for the attention roll and a second only where the roll failed, which goes red on that mutation.

**The counted-stream tests re-import the module over a passthrough `rng`**, because a draw taken and thrown away changes no command: "the sharp corner draws nothing" is a promise about the stream and not about behaviour, and every behavioural test in the file would stay green with the sentence false. It is `harnessRun.test.ts`'s own `vi.doMock` idiom.

**An instrument of this slice's destroyed part of it, and the fix is worth writing down.** The mutation script restored each file with `git checkout -- <paths>` between mutations, which restores from the branch tip and not from the mutation: it reverted `configurations.ts`, `harnessPolicy.ts` and `rng.ts` to their slice 1 state, and the mutation results after the first were readings of code that was not there. It also ran version control from inside a script, which the coder contract forbids. The implementation was rewritten and the pass re-run against pristine copies taken into the scratchpad. **A mutation harness restores from a copy it took itself, never from version control**, because the thing it is mutating is by definition not committed yet.

**Findings recorded and not acted on.**

- **Plan section 6's module test 50 is written against the superseded mechanism.** It reads "A hold bound of zero re-decides every tick and touches the stream not at all", where the record's amendment makes a rate of zero and not a bound of zero the thing that draws nothing: a row with a positive rate and a bound of zero would still roll for attention. The plan's intent was followed and its letter was not, and what landed is "draws nothing at all at the sharp corner", where the sharp corner is the row that carries both zeroes.
- **Plan section 6's module test 52 names four knobs and a row has five fields.** The dexterity error is two numbers under the amendment, so slice 1's test `gives every configuration all four knobs and no optional field` is renamed to `gives every configuration every knob and no optional field` and asserts the six keys. It is the only test name this slice renames and it is slice 1's own.
- **`rng.test.ts`'s `NAMES` had been four names for as long as the run held five.** The territory stream landed and the overlap search was never told, which is #113 and is why the list is derived here. The search now covers all thirty ordered pairs of six names at 100008 draws each and finds no overlap inside a run's whole draw budget, exactly as the record measured.

**Hand-forwards for slice 6 and later.**

- **`compareBatches.ts` joins guard 81's `MODULES` list when it lands**, which is slice 4b's hand-forward and still owed.
- **The sloppy corner's runs are short**, three to five thousand ticks against the sharp corner's twenty-plus thousand, so a 48-seed `shaky-short` batch costs a fraction of the sharp one's two and a half minutes. Slice 6's step 11 is cheaper than the sharp half was.
- **Nothing this slice adds is a reading**, so `BATCH_READINGS` is untouched and `batchReadingDeclared.test.ts` needs no entry. `ConfigurationName` widening reached `BatchOrigin` and `BatchIdentity` with no edit in `batchReport.ts`, exactly as slice 4b said it would.
- **#116, the lapse depth's missing tail, is filed and unbuilt.** The record's section 3 says why it is out of this slice and names its trigger: the day the two corners' bands will not separate, or the day a shaky hand's failures still read as uniform mediocrity in a tape. The six-seed look above says the first half of that trigger is not close.

## 14. Slice 6, the comparison, and the done line

The commit is `60f6e652d1`. Six test names added in one file, none removed and none renamed. **The code half of this step ends here: the harness plays nine hands, reports a batch under any of them, and orders two reports against each other.**

**What landed.** `compareBatches.ts` is new and nothing else was written: `BAND_SEPARATION` at zero, `Direction` with its fourth member `incomparable`, `ComparedSpread`, `BatchComparison`, `Agreement`, `CornerFinding`, `compareBatches` and `readAcrossCorners`. The one existing file it edits is `src/__tests__/harnessStatesNoTarget.test.ts`, whose `MODULES` list gains the new module, which is the hand-forward slice 4b and slice 5 both left owed.

### Verification step 11: the two corners, played fresh at this tip

Both batches are 48 seeds from 20260909 under `scripts/batch.ts`, run alone, both recorded against `60f6e652d1`, which is this slice's own code commit. The sharp half already on disk was recorded against `5f7f365e99`, four commits back, and the point of playing it again is that a comparison whose two halves name two commits is a comparison through two instruments. **Sharp: 2 minutes 3 seconds, 48 of 48 verified. Sloppy: 15 seconds, 48 of 48 verified.** Tapes and reports at `apps/hungry-grave/local/batches/steady-far-1788942858647/` and `apps/hungry-grave/local/batches/shaky-short-1788942984283/`.

**The two reach rates, side by side. They are reported here and they are not judged: whether the two ends of the ladder are far enough apart is Mark's step 17, and no row was moved because of them.**

| Corner | Reached the Undertaker's phase | Stopped short | Endings | Stops |
| --- | --- | --- | --- | --- |
| `steady-far`, the sharp hand | **29 of 48** | 19 | 41 sealed, 7 victory | 48 finished, 48 clean |
| `shaky-short`, the sloppy hand | **0 of 48** | 48 | 48 sealed | 48 finished, 48 clean |

**Where the sloppy runs ended.** One run of the 48 left the Procession at all, and that same run was the only one to leave the Banshee's span; it ended inside the Crowd. **The other 47 ended inside the Procession**, the stage's first phase. The sharp hand closed the Procession on all 48 and reached the Undertaker on 29.

| Reading | sharp: min, lower, median, upper, max | sloppy: min, lower, median, upper, max | direction |
| --- | --- | --- | --- |
| run.ticks | 14103, 21223, 27221, 28849, 39632 | 1784, 3674, 4143, 4627, 12153 | down |
| run.kills | 19, 40, 52, 75, 135 | 2, 3, 3, 4, 14 | down |
| levelUps (rungs bought) | 0, 0, 1, 3, 7 | 0, 0, 0, 0, 2 | flat |
| damageTaken.totalHits | 9, 11, 13, 15, 20 | 5, 5, 5, 5, 13 | down |
| gravePath.sizePerTick (peak) | 34.98, 38.21, 39.56, 40.62, 43.25 | 27.80, 27.82, 27.83, 27.83, 28.73 | down |
| gravePath.floorVisits | 0, 1, 2, 3, 6 | 1, 1, 1, 1, 5 | flat |
| gravePath.floorRecoveries | 0, 0, 1, 2, 5 | 0, 0, 0, 0, 4 | flat |
| wakingSwallows.span | 0, 1, 3, 4, 8 (40 runs) | absent | incomparable |
| belchCadence.fires.run | 2, 2, 3, 4, 8 | 0, 0, 0, 0, 2 | down |
| belchCadence.fires.banshee | 1, 1, 1, 1, 2 (48 runs) | 1, 1, 1, 1, 1 (1 run) | flat |
| belchCadence.fires.undertaker | 0, 0, 0, 1, 3 (29 runs) | absent | incomparable |
| mobsAlivePerTick (peak) | 34, 71, 74, 76, 79 | 7, 11, 12, 12, 22 | down |
| mobFireAlivePerTick (peak) | 66, 70, 70, 71, 71 | 2, 3, 5, 6, 70 | down |
| dropLedger.spawned | 0, 0, 3, 12, 24 | 0, 0, 0, 0, 6 | flat |
| dropLedger.swallowed | 0, 0, 1, 3, 7 | 0, 0, 0, 0, 2 | flat |

**Take-by-slot, the two corners.** The sharp hand took 86 offers over 48 runs (24 at slot 0, 30 at slot 1, 32 at slot 2) with 8 death-point offers and 1 banked offer untaken. **The sloppy hand took four in 48 runs**, two at slot 0, one at slot 1, one at slot 2, all at death points, and never banked one while another stood.

**The whole comparison is 180 rows: 36 down, 7 up, 127 flat, 10 incomparable.** The ten incomparable rows are all readings the sharp corner has and the sloppy one does not, and nine of them say the same thing in different words: the Crowd, the Waking, the Vigil and the Undertaker have no span under a hand that never crossed the Procession, the Waking's swallows and the Undertaker's belches have no run to come from, and the ghoul's four kill-timing figures have no ghoul kill. **The seven up rows are the sloppy hand's numbers standing higher**: the shambler and the revenant take longer to kill (`ticksToKillMin` bands 20 to 37 against 63, and 80 to 111 against 116 to 316), the corpses it eats are fresher (`freshnessPaid.minPaid.corpse` 0.25 against 0.77), and territory dwell runs longer at both ends. They are readings for #39 and nothing was changed for them.

### Verification step 12: what the bands looked like, and a proposal

**The row was not changed.** `BAND_SEPARATION` ships at zero, which means bands that merely fail to overlap, and what follows is the measurement the plan says the first two batches are for.

Of the 180 rows, 170 have a band on both sides. **43 of those ordered and 127 read flat.** Among the flat rows, **57 have bands that touch exactly** (a gap of zero, which the strict comparison reads as flat) and **51 are one point against one point**, two constants that happen to be equal. Among the ordered rows, the separation as a fraction of the wider band runs from **0.003 to 21.3**, and one row ordered on two zero-width bands, where a fraction of the wider band is zero and no separation row can ever moderate it.

The ordered rows, smallest separation first: 0.003 `belchCadence.ticksAtFull`, 0.025 `engagements.ticksToKillMin.revenant`, 0.073 `territoryControl.dwellByEnd.escape.dwellMax`, 0.156 `freshnessPaid.maxPaid.corpse`, 0.167 `engagements.engaged.revenant`, 0.167 `fieldPerLine.total`, 0.222 `engagements.escaped.revenant`, then 0.269 and up.

**The proposal: 0.25, a quarter of the wider band.** It is where the measured gap sits: seven rows order today on a separation under a quarter of a band, and the eighth is at 0.269, so a quarter is the largest figure that costs nothing but those seven and the smallest that catches all of them. The 36 rows that carry the difference between the two corners are untouched by it, because they clear by half a band and more, and the readings a person would call the ladder clear by whole multiples of a band. Two things a reader of that figure should have. **A fraction of the band cannot moderate a row whose two bands are single points**, so a reading whose 48 runs all answered the same number orders at any row value; moderating those needs a floor in the reading's own units, which is a different decision and not this one. And **the 57 touching rows stay flat at any positive figure**, so the proposal costs nothing on the side it was written for.

### The instruments agree, which is what makes the pair one measurement

The one build-to-build comparison this step can make is the sharp corner against its own earlier batch: `steady-far` at `5f7f365e99` (slice 4b's, 48 seeds from 20260909) against `steady-far` at `60f6e652d1` (this slice's, the same seeds). **All 180 rows read flat, none up, none down, none incomparable, and the reach is 29 of 48 on both.** Slice 5 proved `steady-far` unmoved on six seeds by replaying them; this is the same claim over the whole batch and every reading in it, and it is what says the two halves of the corner comparison above were read through one instrument.

### Findings, recorded and not acted on

- **#116, the lapse depth's missing tail, does not fire on its first half.** The record's section 3 names two triggers: the two corners' bands too tight to separate, or a shaky hand whose failures still read as uniform mediocrity in a tape. **The first is not close**: 43 of 170 comparable rows ordered, the largest separation is 21 times the wider band, and the two reach rates are 29 and 0. **The second is unread by this slice**, because it needs somebody watching a tape rather than a report, and nothing here was built for it.
- **The sloppy corner may be too sloppy to read against, and that is Mark's to judge and #39's to act on.** A corner that ends 47 of 48 runs inside the first phase produces ten incomparable rows out of 180, and every reading that lives past the Procession is a reading the pair cannot order. Slice 5's six-seed look said the risk might be the opposite of the record's worry, and 48 seeds each say the same thing louder. **No rate was moved, no rung was added and no row was retuned.**
- **The corner agreement has no data to eat until a second build exists.** Section 4's item 20 is the whole of it: `readAcrossCorners` orders one comparison against another, and one build makes no comparison for either corner to have an opinion about. Spec test 44 is what holds the grammar until #39 plays a second build.

**Thirteen mutations, ten caught.** One per behaviour, each run against a pristine copy this slice's own script took, never against version control (slice 5's lesson): touching bands read as moved, up and down swapped, the separation row unread, the wider band taken as the narrower, the band read as the whole range, the ordering taken off the whole range, the ordering taken off the medians, a reading only one side carries read as flat, the per-line spreads left out, the phase spans left out, only the left side's readings compared, agreement inverted, and a corner that never ordered a reading read as flat. **The three survivors are one fact stated three ways**: every one of them is inside the clearance term, and at `BAND_SEPARATION` zero that term multiplies out to zero whatever the band widths are. Nothing behind the row is observable while the row is zero, which is exactly what verification step 12 exists to answer, and the test that reads the row places both its cases off the row itself so it keeps meaning when #39 moves it. Two of the caught mutations were caught only after the fixture gained a closed phase span and the test gained a case where the whole ranges overlap while the quartile bands clear; both were survivors on the first pass.

**The comparison instrument was a throwaway and is gone.** It read the two `report.json` files, ran `compareBatches` over them and printed the tables above. It lived at `local/step3/compare-corners.ts`, not in the session scratchpad as the contract asks, for a reason worth writing down: `vite-node` under `vite.headless.config.ts` refuses a file outside the app's own root, so a scratchpad script cannot import from `src/`. `local/` is outside version control, eslint, prettier and `tsconfig.json`'s include, and the file was not a `*.test.ts`, so it reached no standing check; it was deleted after the numbers above were taken.

**Hand-forwards for slice 7 and the step's end.**

- **Every hand-forward this slice was handed is paid.** `compareBatches.ts` is in guard 81's `MODULES`, `BATCH_READINGS` needed no row because this slice adds no reading, and `batchReadingDeclared.test.ts` is untouched and green.
- **Verification step 14 is still slice 7's**, and this slice adds a figure to it: **the sloppy corner costs 15 seconds for 48 seeds against the sharp corner's 2 minutes 3 seconds**, so a nine-configuration sweep is nowhere near nine times the sharp batch. The split between playing and measuring is still unstated and still owed.
- **The two batches are on disk** at `local/batches/steady-far-1788942858647/` and `local/batches/shaky-short-1788942984283/`, 48 tapes and a `report.json` apiece, both against `60f6e652d1`. Slice 4b's older sharp batch at `local/batches/steady-far-1788937370786/` is still there and is what the flat 180 rows above were read against.
- **The separation row is unmoved at zero and the proposal above is #39's to take or leave.** Nothing in the tree depends on the figure changing.

## 15. Slice 7, the fences and the full verification pass

The commit is `29a97f2c88`. **No production feature landed and no test name moved**: one test file gained a stated budget and the whole of the step's agent-actor verification was run at the tip. Section 7 carries every step and its result; what follows is the two things the pass owed something new, and the step's closing read.

**What landed in code.** `bot.test.ts` gains `ONE_WHOLE_STAGE_MS` at 30000 and the five `crosses every phase in order on seed N` tests take it as their third argument. They are the five whole-stage `dodgePolicy` tests slice 2 filed as pre-existing flaky against `c10b1c5e06` and slice 4b hit again: measured on this machine with the file alone, each one plays about 1.1 seconds where its four per-seed siblings read the cached run in under a millisecond, and beside the rest of the suite the same play takes 5.2 to 5.8 seconds against vitest's five-second default. **A budget, not a retry and not a skip**, and in the file's own idiom rather than a new one: `FIVE_MAXED_RUNS_MS` and `SIX_POLICY_WALKS_MS` are already 30000 in this file and `ONE_WHOLE_STAGE_MS` is already the name in `harnessPolicy.test.ts`. The one existing comment that had to move is `FIVE_MAXED_RUNS_MS`'s claim that "every other run in this file is either cached or a fraction of a stage", which a second budget makes false; it now says a budget belongs on the test that pays the cost.

### Verification step 14: the batch cost, split between playing and measuring

The shipped command interleaves the two per seed and prints neither, so the split was taken by a throwaway that plays the same 48 seeds through `playHarnessRun`, writes the same bytes and reads them back through `measure(decodeTape(...))`, timing the three apart. It lived at `local/step3/split-cost.ts` for the reason slice 6 recorded, that `vite-node` under `vite.headless.config.ts` refuses a file outside the app's own root, and it is gone.

| Corner | Playing | Measuring | Writing | Loop | Whole command | Verified |
| --- | --- | --- | --- | --- | --- | --- |
| `steady-far`, 48 seeds | 62.5 s | 54.3 s | 0.016 s | 116.7 s | 2 min 8.7 s | 48 of 48 |
| `shaky-short`, 48 seeds | 5.7 s | 6.5 s | 0.009 s | 12.2 s | 13.1 s | 48 of 48 |

**Measuring is the same order as playing and never a rounding error on it**: 87 percent of the playing time at the sharp corner and 115 percent at the sloppy one. Slice 4b guessed "roughly the same again" from a single hand-played run and the guess holds at both ends of the ladder. **The replay is the whole of it**, because a report is a function of the bytes (ADR 0057) and the tapes are read back rather than the live state reported, which is `scripts/batch.ts`'s own stated cost. The one figure that is not the loop is vite's boot and import, about 12 seconds at the sharp corner and 1 second at the sloppy one, paid once per command whatever the batch's size. **Writing is free** at three hundredths of a second across 96 tapes, so nothing in the sweep's cost is filesystem.

**What that means for step 4 sizing nine configurations.** The cost tracks how far a hand gets and not the row it was played with: the sharp corner is ten times the sloppy corner's cost for the same 48 seeds because it plays ten times the ticks. The nine rows are `steady`, `loose` and `shaky` crossed with `far`, `middling` and `short`, so a nine-configuration sweep at 48 seeds each sits between 9 x 13 s and 9 x 129 s, **2 to 19 minutes**, and lands near the bottom of that band as long as the six sloppier rows keep dying inside the Procession. **That is a cost of a build's readings and not of a build**, and it is small enough that batch size is not what #39 should be economising.

### Findings, recorded and not acted on

- **Two more per-seed loops in `bot.test.ts` cost what the five that were fixed cost, and neither has a budget.** `dodgePolicy from the size ceiling`'s `is held in the Banshee's fight on seed N` runs 1019 to 1183 ms and `the sparse last row and its two boundaries (ADR 0051)`'s `meets each boss on an empty field and the set piece in traffic on seed N` runs 1166 to 1208 ms, both measured with the file alone, against the five budgeted tests' 1005 to 1160 ms. **They have never been observed to time out**, which is why they were left alone: the finding named in slice 2 and dispatched here is five tests, and widening it would be treating a measurement as a report. The trigger is the first timeout in either loop, and the fix is the same three-argument form the five now carry.
- **`local/step3/det-a` and `det-b` hold step 9's two runs** and are outside version control, so the byte comparison above can be repeated without replaying anything.

### What the hand is, for anyone reading this step's numbers

The record's section 3 was amended twice on 2026-09-09 after the game design gate, and both amendments change how the tables above should be read.

**The knobs are a lapse of attention, not a hold on every decision.** A row carries a rate and a depth: attention holds, and when it fails the last command is repeated for a drawn number of ticks. An earlier shape drew on every decision uniformly, which made a shaky hand evenly mediocre forever rather than a hand that occasionally stops looking. Counted per tick rather than per decision, the loose hand acts on a stale command about 43 percent of ticks and the shaky hand about 82 percent.

**The ladder does not model a human's reaction and this record no longer claims it does.** Every rung re-decides about every 92 milliseconds, three to five times faster than a human's open-loop correction interval in continuous tracking, so **the ladder is superhuman in update rate at every rung** and its sloppy rungs fail by the depth of a blind drift instead. A 36-tick lapse drives the grave about 162 units across a 540-unit field blind, past the body it was walking to. **The sloppy corner dies of overshoot**, which is what 47 of 48 runs ending inside the Procession looks like from the inside.

### The step's closing read

**Mark's steps 15 to 18 are all still open, and three of the four are now answerable from what is on the branch.**

- **Step 15, the two ADR-level calls.** Answerable. Both amendments exist to read: ADR 0053's fifth verb from slice 1, and ADR 0056's budget pinned to the build from slice 3. Each is dated and written in the what-stood, what-changed, what-it-could-not-have-known form, and each says in its own opening that it is the session's commitment under his review.
- **Step 16, the craft calls.** Answerable in part. The nine configuration names and the batch size of 48 are both readable against real batches now. **The nearest-body rule has one reading and it is indirect**: section 14's take-by-slot, 24 at slot 0, 30 at slot 1 and 32 at slot 2 over the sharp corner's 86 takes, says the rule spreads its takes across the three bodies rather than favouring one, which is a fact about where the grave was standing and not a judgement about the rule.
- **Step 17, whether the two ends of the ladder are far enough apart.** Answerable, and section 14 is the whole of the evidence: **29 of 48 against 0 of 48**, 43 of 170 comparable rows ordered, and the largest separation 21 times the wider band. **This is filed as #117 because it touches the done line**: the question a reader will actually ask is not whether the two ends separate but whether a corner that ends 47 of 48 runs in the stage's first phase is a corner worth reading against, and that is his to rule and #39's to act on.
- **Step 18, whether the report reads.** Answerable. Section 12's table is the printed thing it asks about and section 14 is the same table twice with a direction column between them.

**Two tickets stand open behind these numbers and neither is this step's to close.** **#117** is the sloppy corner's reach, above. **#116** is the lapse depth's missing tail, filed and unbuilt; slice 6 checked its first trigger and found it nowhere near firing, and its second trigger needs somebody watching a tape rather than a report, which nothing in this step was built for. **#113 closed at slice 5**, when `rng.test.ts`'s stream names became a derived list.

**No fence failed, so no finding of that kind exists.** All five are green at `29a97f2c88` with no edit to any of them, which is what section 7's step 13 records by title. **Nothing was retuned, no row moved, and the separation row is still zero.**

## 16. The middle rung's reading crash

**The symptom.** `scripts/batch.ts loose-far 20260909 48` played and verified seeds 20260909, 20260910 and 20260911, then died inside `measure` on seed 20260912 with `mob 2801 died with no damage behind it`, thrown by `closeEngagement` (`timeToKill.ts:189` at `ad4657276e`). It is the first batch that has ever played a middle rung of the ladder; the two corners played so far never met it.

**The defect is in the reading, not in the game.** The reading assumed the mob pool could still name every id the tick damaged, by the time the observer reads the pool at the end of that tick. The pool cannot, and the game is right to make it so.

**The evidence, from a replay of `20260912.tape` instrumented at the crashing tick.** At tick 21213 the hand belched: one `belched` event with 30 kills, and 30 `mobDamaged` and `mobKilled` pairs behind it, the first pair being mob 2801. Slot 2 of the mob pool held mob 2801, a live shambler, at the end of tick 21212. At the end of tick 21213 slot 2 holds mob 3065, a shambler with `beat` 45 and `appearedInside` true, which is a set piece's pour. Mobs 2805 and 2807 died in the same belch and are both still in the pool as dead slots, because `takeSlot` (`caps.ts:97`) claims the first dead slot and only one spawn ran: exactly one id per belch tick can go missing this way, and 2801's was it.

**The false comment.** The doc above `mobTypeOf` in `timeToKill.ts` claimed the pool slot "still carries its own id and type when the observer reads it, whether the mob is alive or was culled this tick, because a tick runs its spawns before any damage". The last clause is false. `step.ts` fires the belch at line 237, before `advanceStage` at 238, `advanceBoss` at 240 and `advanceSetPiece` at 241, and `step.ts`'s own tick-order comment says so in as many words: "The belch runs before spawns and before every overlap." Every other damage source resolves in `advanceLines` (242) or `resolveDeaths` (245), after all three spawn sites, so the belch is the only source this can reach. No plan claim was found false; this was a code comment.

**The fix.** `typesThisTick` builds one id-to-type map per tick from the pool plus this tick's own `mobKilled` events, which carry the type the kill took (`events.ts`, `mobs.ts:423`), and `openEngagement` reads that map instead of scanning the pool. Kills are laid over the pool rather than under it, and the two can never disagree: an id only ever increases, so a reclaimed slot can never answer to the id it used to hold.

**The guard stays a guard, and now has its own test.** `closeEngagement` still throws for a `mobKilled` with no fight open, which is the case that is still a real bug: `damageMob` (`mobs.ts:409`) is the only emitter of `mobKilled` in the tree and it pushes `mobDamaged` immediately before it, so a kill with nothing behind it means the game produced one without the other. Two tests landed, both red-first at the seam: one plays the real sequence through `damageMob` and `spawnMob` and asserts the belch kill is read, the other asserts the guard still refuses a death with no damage behind it.

**Nothing is repaired or degraded, so nothing is logged.** The reading names the type from a value the sim published for exactly this purpose rather than guessing at one. There is no abnormal case being swallowed: the only silent answer left is the boss's, which was always silent and is read from `bossArrived`, `chunkBroke` and `bossKilled` instead.

**The earlier corners' 48-seed numbers are unaffected, proved two ways.**

- By argument. `damageMob` is the only path that frees a mob slot, and it reports `mobDamaged` immediately before `mobKilled` in the same array. So every damage event the old code dropped was followed one event later by a kill that threw. A batch that ran to completion therefore had no drops at all. The only other id the pool cannot name is a boss's, and a boss never appears in a `mobKilled`, so the fix answers nothing there exactly as before.
- By measurement. Both 48-seed corner batches were rebuilt from the tapes on disk under the fix, through `measure` and `batchReportOf`, and each rebuilt report is equal to the `report.json` beside the tapes, key for key: `local/batches/steady-far-1788942858647` and `local/batches/shaky-short-1788942984283`. Both were recorded at `60f6e652d1`, and the guard was already in the tree there, having landed at `5eaa6d2759`.

**No version moved and none needed to.** `GOLDEN`, `WITNESS_VERSION` 6 and `FORMAT_VERSION` 3 could not move, because no file under `src/game` or `src/tape` was touched. `READINGS_VERSION` stays 2 on its own rule: a case that used to crash now produces a number, and every number it does not touch is identical, so an old report and a new one are still directly comparable.

### Findings, recorded and not acted on

- **Seed 20260913 under `loose-far` played 83577 ticks and reached no ending**, against a batch where every other seed sealed or won and the middle of the pack is near 27000. That is `harnessRun.ts`'s own `runTickBudget()` ceiling stopping a run the hand never finished, so the harness behaved correctly and the hand did not clear the stage. It is a fact about the middle rung rather than about this fix, and it belongs with #117 and #39.
- **`territoryControl.ts`'s `standsInThePool` (`:130`) requires `mob.alive`**, so the last territory pulse of a mob's life is never an interval endpoint. It cannot crash and it cannot meet the slot recycling above, because territory resolves in `advanceLines` after every spawn site. Recorded, untouched, and out of this fix's scope.

