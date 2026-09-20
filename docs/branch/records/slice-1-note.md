# Slice 1 coder note: the swallow rule (design record R1 and R2)

## What changed

New, in `apps/hungry-grave/`:

- `src/game/tip.ts`. One public seam, `shareOverMouth(food, mouth)`, and two private helpers, `sharedArea` and `insideTheField`. The export carries the citation for its second caller, slice 4's teeter (R5).
- `src/game/__tests__/tip.test.ts`. Ten tests.
- `src/dev/readings/foodLedger.ts`. `createFoodLedger`, `observeFoodLedger`, `foodLedgerOf`, `foodLedgerNumbers`, and the types `FoodEnds`, `FoodLedger`, `FoodLedgerAcc`.
- `src/dev/readings/__tests__/foodLedger.test.ts`. Four tests.
- `src/dev/rebatch.ts`. `rebatchOf(stored)`, with `readStoredTape`, `originOf` and `seedInName` private, and the types `StoredTape`, `ReadTape`, `Rebatch`.
- `src/dev/__tests__/rebatch.test.ts`. Two tests.
- `scripts/rebatch.ts`. The shell: lists the folder, reads the bytes, writes `report.rebatch.json` beside `report.json` and never over it, prints the path.
- `docs/branch/records/after-slice-1-batch.md`.

Changed, in `apps/hungry-grave/`:

- `src/game/step.ts`. `coveredFood` keeps its name, its type and its read-once promise, and its filter is now `shareOverMouth(corpseHitbox(corpse), mouth) >= state.conditions.tuning.swallow.tipThreshold`. `resolveSwallows` and `swallowFood` are untouched. `overlaps` is still imported, for mob fire and mob contact.
- `src/game/tuningRecord.ts`. New group `SwallowTuning` with one row, `tipThreshold`, at 0.55, on `TuningRecord`, `TuningOverlay`, `DEFAULT_TUNING` and `resolveTuning`, plus the refusal `refuseUnplayableTipThreshold`. `resolveTuning`'s JSDoc now says four bounds.
- `src/game/events.ts`. `CorpseExpired` gains `kind`, with the reason beside it.
- `src/game/corpses.ts`. `advanceCorpses` puts the corpse's kind on the event.
- `src/game/offer.ts`. The comment on `OFFER_SPACING` is rewritten from the threshold's own arithmetic, and the JSDoc on `chooseOfferBody` now says what that function is for. The value 90 does not change.
- `src/dev/readings/readings.ts`. The food ledger wired in the five places a reading is wired.
- `src/dev/batchReport.ts`. `BATCH_READINGS` gains `tuning.foodLedger`.
- `src/dev/compareRuns.ts`. `READING_COMPARISONS` gains `tuning.foodLedger`.
- `src/app/__tests__/sound.test.ts`. The one-of-every-event fixture carries the new field.
- `src/game/__tests__/step.test.ts`. A new block of ten tests and three helpers, `corpseAt`, `acrossTheLeftRim` and `stagedFood`.
- `src/game/__tests__/offer.test.ts`. One test replaced by three, as the entry instructs.
- `src/game/__tests__/tuningRecord.test.ts`. The literal row list and its count, and two refusal tests.
- `src/game/__tests__/witness.test.ts` and `src/game/__tests__/invariants.test.ts`. Each closed list gains an entry for the new row, with its reason.
- `src/dev/__tests__/bot.test.ts` and `src/dev/__tests__/harnessPolicy.test.ts`. Five pinned seed lists, below.

Changed at the repository root: `docs/branch/records/before-batch.md` gains the section "Food swallowed against food lost" and a closing note on the commands' output path.

Every reader of `corpseExpired`, as the entry asks: no shipped module reads it at all. `src/app/sound.ts` is handed it and ignores it, which `src/app/__tests__/sound.test.ts:82` pins as a set. The readers are all tests: `src/game/__tests__/step.test.ts:310`, `src/game/__tests__/corpses.test.ts` at 121, 160, 174, 452, 455 and 696, and the fixture in `sound.test.ts:82`. The only writer is `corpses.ts`.

## Verification results

**Every planned test written, red on its own assertion, green.** All 31 are written and green. Twenty-five were red on their own assertion before the code that makes them pass, with the stub or the old rule in front of them: the ten tip tests against a stub returning -1, the four food ledger tests against a stub returning -1, the two rebatch tests against a stub, the two threshold refusals against a record with no refusal, and seven of the ten step tests against the first-touch rule.

Four assert a property that holds under the old rule as well as the new one, so no honest red existed for them. Each was proved instead by a mutation spot check in a scratch copy of the tree, never in the working tree:

- Step test 17, the corpse on the field's side edge. Dropping the field clip in `tip.ts` turns it red, together with tip tests 7, 8 and 9, at shares of 0.5, 0.5185 and 0.5, which are the figures `local/148-slice-facts/sim.md` section D predicts.
- Step test 19, the corpse that tips on its last tick of freshness. Moving the swallow check after decay in `step.ts` turns it red, together with the tick-order test that was already there.
- Step test 18, food wholly outside the field. It has no teeth at this seam and stays as a guard only: dropping the zero-area guard in `tip.ts` leaves it green, because a share of not-a-number fails the threshold comparison and nothing is swallowed either way. Its partner tip test 10 is what catches that, and it goes red on exactly that mutation.
- Offer test 21, the option that reaches the threshold. First touch takes the same body, because the arithmetic in offer test 23 makes a scene with one body tipping and another merely touched impossible at every grave size. Offer tests 22 and 23 are red under the first-touch rule.

**Test names compared before and after**, with `scripts/test-names.ts` over two `vitest list --json` captures: 2435 names in the baseline, 2465 now, 33 added and 3 removed. The three losses: `offer.test.ts :: the take (ADR 0034) > takes exactly one when the grave covers two, and the other vanishes on the same tick`, which the entry instructs be replaced by tests 21 to 23; and two in `harnessPolicy.test.ts`, `is never paid a carrier on seed 202` and `takes the offers it is paid on seed 505`, which are the same two tests under the titles their own pinned sets now give them, both present in the added list as `never reaches the one offer that stands on seed 202` and `on seed 505`.

**The standing checks.**

- `pnpm --filter hungry-grave typecheck`: `✔ AssetPack Completed in 33ms`, no diagnostic.
- `pnpm --filter hungry-grave test`: `Test Files 166 passed (166)`, `Tests 2454 passed | 11 expected fail | 2 todo (2467)`.
- `pnpm --filter hungry-grave build`: `✓ built in 5.82s`, and one warning, below.
- `pnpm verify` fails, and not on this work: `prettier --check .` reports `.claude/hooks/dispatch-contract.mjs`, a committed file this slice never touches and which fails at HEAD with a clean working tree. Its three other stages were run on their own and all pass: `pnpm lint` clean, `pnpm typecheck` Done for both apps, `pnpm test` 166 files and 2454 passed.

**The bot's full stages** (`src/dev/__tests__/bot.test.ts`) play the loop from the first tick to won or lost with the invariants on, and pass with zero faults. `REACHES_VICTORY_MAXED` still holds all five seeds, so slice 5 has its won run.

**Part A, the instrument.** Built and run over the four "before" folders while the old rule still stood. Every figure in each `report.rebatch.json` that also exists in that folder's own `report.json` is equal to it: 32,371 leaf figures for steady-far / birthright, 26,952 for shaky-short / birthright, 41,780 for steady-far / maxed and 38,993 for shaky-short / maxed, nothing differing and nothing missing, with 1,248 new leaves each, all of them the food ledger's. `tuning.foodLedger.corpse.swallowed` also agrees with `tuning.freshnessPaid.swallows.corpse` folder by folder. The figures are in `docs/branch/records/before-batch.md`.

**Part C, the "after" batch.** The four commands run into `local/148-after-slice-1/batches`, all 192 runs verified, no fault and no warning. Compared with `scripts/compare-batches.ts`, two corners per rig, and written up in `docs/branch/records/after-slice-1-batch.md`. Figures only and no verdict.

**The rendered check**, on the built app through `vite preview` on port 4180, driven with `playwright-cli`, on a tape from the "after" batch (`steady-far-birthright`, seed 1000). The replay screen opens a tape from `?tape=` at the tick `?at=` names but then plays on from it, so the tick was held by replacing the page's `requestAnimationFrame` with a manual pump and stepping the frames one at a time. Nothing in the repository was changed for it. Three reads, each screenshot opened and looked at:

- Tick 262, the readout reading `TICK 262`. A corpse lies across the grave's top rim: its upper half sits on the ground above the rim and the rest is over the black of the mouth, drawn between the cut and the ground so both halves are visible. It is not swallowed. Its share is 0.5488, just under the 0.55 threshold, which is the sliver rule seen at its own edge.
- Tick 263, one tick later and the readout reading `TICK 263`. The corpse is gone and the grave is visibly a little wider: that is the tip, and the swallow landed on the tick the share crossed the threshold.
- Tick 15577, deep in the run with fifteen corpses on the field and the grave at size 43.9 with Territory's charge arc over it. A corpse lies across the top right of the rim at a share of 0.542 and is not swallowed, while a second corpse sits clear of the rim to the left.

The browser reported zero console errors across the whole session. Nine warnings are the headless AudioContext autoplay policy and eight are a WebGL `ReadPixels` driver performance message, both from the environment rather than from the build.

**Pins.**

- `GOLDEN` held. `src/game/__tests__/digest.test.ts` passes all eight tests and `src/dev/digest.ts` is unchanged, which is what the entry says should happen: its one swallow is a corpse at the grave's exact centre, a share of 1 under the new rule too.
- `WITNESS_VERSION` stays 11 and `READINGS_VERSION` stays 9. Neither file changed.
- `src/dev/__tests__/bot.test.ts`: `NEVER_PAID` moved from `[202, 303]` to `[202]`, and `PASSES_THE_BANSHEE_FROM_THE_CEILING` from `[]` to `[101, 404]`. The other eight lists the entry names held.
- `src/dev/__tests__/harnessPolicy.test.ts`, which the entry does not name: `NEVER_PAID_AT_THE_BIRTHRIGHT` moved from `[202, 404]` to `[404]`, `STOOD_BUT_NEVER_REACHED` from `[]` to `[202, 505]`, and `ENDS_ABOVE_THE_BIRTHRIGHT` from `[101, 303]` to `[]`. Each carries its cause in the JSDoc beside it.
- The two existing tests the entry flags, `corpses.test.ts:385-476` and `:731-757`, stayed green as written.

**Open for the human**, as the entry says: how the 55% feels on real corpses under fire, and whether a very fast swipe under a corpse ever misses. Neither is a property any test here can see.

Every server, browser and background process started for this slice was stopped: the `vite preview` on port 4180 is down and its port is closed, the `playwright-cli` browser is closed, and no batch or test process of mine is left running. The long-lived `vite preview` on port 4173 belongs to the `hungry-grave-v1` worktree and was left alone, which is why 4180 was used.

## Where the entry was wrong about the code

Nowhere. Every file and line it cites was checked and was right. Three things it does not name came up:

1. Two closed-list guards force a new tuning row to answer for itself, and the entry's pin list does not mention them: `src/game/__tests__/witness.test.ts`'s `EXCLUDED` and `src/game/__tests__/invariants.test.ts`'s own exclusion table. Both went red on `conditions.tuning.swallow.tipThreshold` until it was written into each with a reason. That is the check working, not a defect.
2. `src/dev/__tests__/harnessPolicy.test.ts` holds three pinned seed lists of the same kind as the bot's, and the entry's pin section names only `src/dev/__tests__/bot.test.ts`. All three moved.
3. The path question the entry asks about is answered. `pnpm vite-node` keeps the working directory it is called in, checked by running a one-line script through it from `apps/hungry-grave/`, so the relative `local/148-before-batch/batches` in the "before" record's commands would have written under `apps/hungry-grave/local/`, where nothing is. The `run.log` records each batch's own stdout, which is the folder it wrote, and all four are absolute paths under the worktree root. So the out-root was written out in full, and the "after" batch used the absolute path of `local/148-after-slice-1/batches`, beside the "before" one.

## Decisions made

- **The refold reads the batch's identity off the tape headers, not off the old report.** One hand and one clock stamp is what a batch is, and a folder carrying two of either is refused. Evidence: `scripts/batch.ts` asks the clock once and writes that stamp and one configuration name into every header it makes. To reverse: read `report.json` for the identity instead, at the cost of a report that is no longer a function of the bytes alone.
- **A tape that does not verify refuses the whole folder**, which is the entry's own instruction. `batchReportOf` would otherwise list it under `unverified` and fold the rest. To reverse: pass the measurement through and let the report name it.
- **The comparison's "before" side is `report.rebatch.json` and not `report.json`**, because only the refold carries the food ledger. Evidence: every other leaf figure in the two is equal. To reverse: compare the two `report.json` files and lose the ledger rows from the comparison.
- **The food ledger names all four kinds with zeros** rather than leaving a kind a run never saw out, as `freshnessPaid` does. Evidence: the design record asks for swallowed against lost for every kind, and an absent row reads as a reading one side happened not to carry. To reverse: make the record partial. The cost of the choice is visible in the records: these medians sit below the "before" record's own table where that one counted only the runs that swallowed one.
- **`shareOverMouth` guards the empty clip and nothing else.** A mouth with no area would divide by zero, and the grave's width is held at or above the size floor, so that state is a bug in a caller rather than an input to repair. To reverse: add a second guard and decide what it should answer.
- **The new tuning row is excluded from the witness fold and from the no-NaN harness, with a reason in each**, on the same grounds as the other ten rows: it is a starting condition the rules never write, and everything it decides shows through state that is already folded. To reverse: fold it, and move `WITNESS_VERSION` in the same commit.
- **Step test 14 stages the grave a thousandth under the size ceiling** so one swallow pays growth and overflows the rest into score, which is what lets the test assert both on the tip tick. To reverse: assert growth alone and drop the score half.

## Open items

- `pnpm verify` cannot pass on this branch: `prettier --check` fails on `.claude/hooks/dispatch-contract.mjs`, committed and untouched by this slice, and reproducing at HEAD with a clean tree. Fixing it means editing a hook file outside this slice, which was not done.
- The production build ends with a chunk-size warning, `pixi-eS3LEK9H.js 589.65 kB`. It is the vendored Pixi chunk that `vite.config.ts` splits out by name, and nothing in this slice is in it. It was not reproduced against an unchanged tree, because that needs a checkout this slice may not make.
- Step test 18 is a guard with no teeth at its own seam, as above. The tip test beside it carries the property.
- The replay screen cannot be held at the tick `?at=` names: it fast-forwards to ninety ticks short of the target and then plays on to the last verified checkpoint. This slice worked around it from outside the app by pumping animation frames by hand, and built nothing. Slice 4 photographs a fall and a teeter at chosen ticks, so a real hold is worth a ticket before then.
- The food ledger's three ends do not add up to what spawned, and the module says so: food still on the field at the stop reached no end, and a corpse the cap evicted reports its own event. Nothing was built to close that, because the design record asks for swallowed against lost and nothing more.

## Stuck

None.

## Landing (the main session)

- CodeRabbit, one finding, fixed: `originOf` in `src/dev/rebatch.ts` named a batch's seeds as a first seed and a count without checking that the folder's seeds step by one, so a folder that lost a tape would fold to a report naming a seed nobody read. `firstSeedMissingFromTheRun` now refuses the gap by the seed that is missing, and `seedInName` refuses a seed that is not a safe integer. New test, red first on its own assertion: `refuses a folder with a seed missing from its run, by the seed that is missing`.
- `pnpm verify` failed on `prettier --check` for `.claude/hooks/dispatch-contract.mjs`: one line that a rename on `main` (`01b66cd47a`) pushed past the width. Wrapped by prettier in its own commit, with no change in behaviour.
- The chunk-size warning in the build is ticket #51, open before this branch.
- Checked again by the main session after the fix: typecheck, lint and `prettier --check` clean, and 166 test files green.
