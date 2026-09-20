# Slice 1: the swallow rule (design record R1 and R2)

Follow-along row 1: "A corpse goes in only when most of it is over the grave, not at first touch. The reward still lands at once. This is the new swallow rule."

Read `docs/agents/feature-flow.md` and follow it. Read `docs/branch/records/coder-contract.md` before anything else; it binds this slice. This entry is the planning half of the flow. Your scratch folder is `local/148-slice-1/` in the worktree. All paths below are relative to `apps/hungry-grave/` unless they start with `docs/` or `local/`. Line numbers were read on the tree at `c309fc812b`.

## What this slice builds, and why

Today the grave swallows food on the first touch of two hitboxes (`coveredFood`, `src/game/step.ts:118-123`, through `overlaps`, `src/game/overlap.ts:30-37`), so nothing ever lies across the rim and nothing can fall in. Mark ruled that food goes in when most of it is over the mouth, and that a sliver over the edge stays out (decision 3). The payout still lands on that tick, which the glossary now calls the tip (R2).

When it works, a player sees:

- A corpse with only a sliver over the edge stays on the ground, and can still rot away or ride off the bottom.
- A corpse with most of itself over the mouth is swallowed, and the growth, the score and the chime land on that same tick.
- Food larger than the mouth can still be swallowed: a power-up is 28 wide and a floor-size grave is 18 wide.
- A corpse, a power-up, a feast and a fallen rung all follow the one rule.
- Food lying on the field's side edge can still be swallowed.

The harness also learns to count food swallowed against food lost, for every kind of food, because the design record asks for that figure before and after this slice and the harness cannot read it today.

## The order of work. It matters.

The 192 "before" tapes replay only on the old rule. So the work runs in three parts, in this order.

**Part A, the instrument, while the old rule still stands.** Build the reading and the tool that reads stored tapes again (below), with their tests. Then run the tool over the four "before" folders and write the figures into a new section at the end of `docs/branch/records/before-batch.md`, named "Food swallowed against food lost". Do not start part B until those figures are written.

**Part B, the rule.** Build the swallow rule with its tests.

**Part C, the "after" batch.** With every test green, run the four commands of `docs/branch/records/before-batch.md` into `local/148-after-slice-1/batches`. It takes about 31 minutes of wall clock; run each command in the background and wait for it. Compare "before" and "after" with `scripts/compare-batches.ts`, which reads the `report.json` files (`scripts/compare-batches.ts:97-116`). Write `docs/branch/records/after-slice-1-batch.md` in the form of the "before" record: the same table, the new reading's figures, and the comparison. Figures only and no verdict, because the bot only dodges.

The "before" tapes are at the worktree's root, not under `apps/hungry-grave/`: `local/148-before-batch/batches/<hand>-<rig>-default-<stamp>/`, four folders, each with 48 files named `<seed>.tape` and one `report.json`. The record's commands show a relative output path and say they ran from `apps/hungry-grave/`. Those two facts do not agree. Find out how the path resolved, use a path for the "after" batch that lands beside the "before" one, and say what you found in your note.

## Part A: the reading, and reading stored tapes again

- New reading `src/dev/readings/foodLedger.ts`, in the form of `src/dev/readings/arrivals.ts` (a state type, an accumulator, `createFoodLedger`, `observeFoodLedger`, `foodLedgerOf`). For each of the four food kinds (`FoodKind`, `src/game/swallow.ts:19`) it counts: swallowed (the `swallowed` event, which carries the kind, `src/game/events.ts:13-19`, pushed at `src/game/swallow.ts:114-119`), lost off the bottom (the `corpseLost` event, which carries the kind, `src/game/events.ts:356-368`, pushed at `src/game/corpses.ts:382-388`), and rotted away (the `corpseExpired` event, pushed at `src/game/corpses.ts:358-369`).
- `corpseExpired` carries only a place today (`src/game/events.ts:349-354`), so it gains the food's kind. Events are not recorded on a tape and the witness folds state, not events, so no pin and no version moves. List every reader of `corpseExpired` in your note.
- A reading is wired in one place, `src/dev/readings/readings.ts`: the import, `TuningReadings` (`:121-146`), `ReadingsAcc` (`:148-171`), `createReadings` (`:184-211`), `observeReadings` (`:221-250`) and `readingsOf` (`:252-275`). It must also be declared in `BATCH_READINGS` (`src/dev/batchReport.ts:509`; the `powerUpLedger` arm at `:862-883` is the pattern) and in `READING_COMPARISONS` (`src/dev/compareRuns.ts:324`; the pattern at `:688-708`), or `src/dev/__tests__/batchReadingDeclared.test.ts` and `src/dev/__tests__/comparisonDeclared.test.ts` go red.
- `READINGS_VERSION` (`src/dev/readingsVersion.ts:249`) does not move. Its own comment (`:12-16`) says a brand-new reading beside unchanged ones does not bump it. The reading of power-ups in `src/dev/readings/powerUpLedger.ts:146` stays as it is.
- No tool makes a batch report from stored tapes. `scripts/batch.ts` always plays a fresh run (`:290-297`) and then measures the bytes it just wrote (`:299`, folded by `batchReportOf` in `reportInto`, `:333-350`). `scripts/measure.ts` reads one stored tape (`:27-37`, `:47-60`, `:81`). So this slice adds `scripts/rebatch.ts <folder>`: it reads every `.tape` file in one batch folder, measures each through the same `measure(decodeTape(bytes))` call, folds them through the same `batchReportOf`, and writes `report.rebatch.json` beside the old report. It never overwrites `report.json`. The logic that is more than argument parsing lives in `src/dev` with a test, as the other scripts' logic does. A tape that does not verify is refused by name and the run ends with an error.
- The proof the tool is honest: over one "before" folder, every figure in `report.rebatch.json` that also exists in the old `report.json` is equal to it. Show that comparison in your note.

## Part B: the rule, exactly

Food is swallowed on the tick its share reaches the threshold: `share >= threshold`.

- The mouth is `graveHitbox(grave)` (`src/game/grave.ts:99-107`). The food's box is `corpseHitbox(corpse)` (`src/game/corpses.ts:145-152`). Both are `Rect` (`src/game/overlap.ts:4-10`).
- First clip the food's box to the field, which is 0 to `FIELD_WIDTH` (540) and 0 to `FIELD_HEIGHT` (760) (`src/game/field.ts:10-11`). If nothing of the food is inside the field, the share is 0.
- `over` is the area where the clipped food and the mouth overlap, which is zero when they do not overlap.
- `most` is `min(clipped food width, mouth width) * min(clipped food height, mouth height)`.
- The share is `over / most`. It is always from 0 to 1, and never not-a-number: `most` is above zero whenever any of the food is inside the field.
- Plain arithmetic only: subtract, multiply, divide, `Math.min`, `Math.max`.

Why the clip: the grave's box is held inside the field (`containGrave`, `src/game/grave.ts:113-118`) and food is not (`cullCorpses`, `src/game/corpses.ts:376-391`, checks the bottom only). Without the clip a corpse centred on the side edge tops out at 50% at every grave size and could never be swallowed. The arithmetic is in `local/148-slice-facts/sim.md`, section D.

## Parts of the code this slice touches

- New module `src/game/tip.ts`. Its concept is the Tip of the glossary: when food goes over the rim. One public seam: `shareOverMouth(food: Rect, mouth: Rect): number`, the rule above. It takes two boxes and no run state, so the drawing code can ask the same question: the second caller is slice 4's teeter (design record R5, "The teeter is the tell for the new rule"). Name that citation at the export. No helper in `src/game` returns an overlap area today (`src/game/overlap.ts:62-63` exports `overlaps` and `circleOverlapsBox` only), so the area lives in `tip.ts` as a private helper.
- `src/game/step.ts`: `coveredFood` (`:118-123`) keeps its name, its type and its "read once as the pass begins" promise, and its filter becomes the share against the threshold read off the run, `state.conditions.tuning.swallow.tipThreshold`. `src/game/grave.ts:179-181` shows how a rule reads a row off the run. `resolveSwallows` (`:152-163`) and `swallowFood` (`:134-142`) do not change: the offer's own body still goes first (ADR 0034), and every payout still lands through `swallow` on this tick (R2). `coveredFood` is the only place in `src` that asks whether food is over the grave, so nothing else follows.
- `src/game/tuningRecord.ts`: a new group `swallow` with one row, `tipThreshold`, starting at 0.55, with a JSDoc like its neighbours (`ScoreTuning`, `:79-203`, is the pattern). A new group needs: its type, its member on `TuningRecord` (`:215-218`) and on `TuningOverlay` (`:227-230`), its values in `DEFAULT_TUNING` (`:247-262`), and its spread in `resolveTuning` (`:328-337`). A new refusal beside the three that exist (`refuseInvertedQuietInterval`, `:274-281`; `refuseZeroQuietIntervalMinimum`, `:296-301`; `refuseZeroBossHealthRate`, `:312-317`): a threshold at or below 0, or above 1, is refused. At 0 every piece of food on the field would tip at once, and above 1 nothing could ever be swallowed. A tuning record comes from a document, so a bad one is rejected and never repaired. `tuningRecord.ts` imports nothing (`src/__tests__/boundary.test.ts:899-904`), and that holds.
- `src/game/offer.ts`: the comment on `OFFER_SPACING` (`:29-41`) was derived from first-touch reach and is now false. Rewrite it from this arithmetic: options are 28 wide and 90 apart, so the gap between two is 62; each needs 0.55 of 28, which is 15.4, of its width over the mouth; two at once need a mouth of 15.4 + 62 + 15.4 = 92.8, and the widest mouth is 67.5; so two options can never both tip on one tick. The JSDoc on `chooseOfferBody` (`:259-266`) says the two-touch case is possible near the size ceiling; make it true: the function stays as the guard for a tuning record with a much lower threshold. The value 90 does not change.
- The pull's three rows do not land in this slice. `src/__tests__/everyTuningRowHasAReader.test.ts:82-88` fails a row that no shipped `src/game` file reads, and the pull's reader is slice 2.

## What must stay unchanged

- Every payout, and the tick it lands on. `src/game/swallow.ts` does not change.
- The tick order. The swallow check still runs before decay (`src/game/step.ts:292-295`), so food that reaches the threshold on its last tick of freshness is swallowed.
- The `swallowed` event. Slice 4 widens it, where its reader arrives.
- No folded field is added, so `WITNESS_VERSION` stays 11.
- No drawing code changes. `src/game` imports nothing from `src/app`, `src/dev` or Pixi.

## Pins

- `GOLDEN` (`src/dev/digest.ts:488-519`) should hold: its one swallow is a corpse at the grave's exact centre (`digest.ts:225-227`), which is a share of 1 under the new rule too. The existing test asserts it. If it moves, stop and report.
- The bot's seed lists (`src/dev/__tests__/bot.test.ts:130`, `:152`, `:193`, `:260`, `:320`, `:366`, `:397`, `:768`, `:1012`, `:1033`) are expected to move, because a bot that only dodges now swallows less. For each list that moves, your note says from what to what. The faults stay empty. `REACHES_VICTORY_MAXED` must keep at least one seed, because slice 5 needs a won run; if it would empty, stop and report.
- Tapes recorded before this slice stop replaying at their first diverging checkpoint. That is what ADR 0019 intends, and no run is stored yet.

## Planned tests

Pin every name as a `test.todo` first, against a stub `shareOverMouth` that returns a wrong value of the right type, so each test is red on its own assertion. Every sim test steps through `stepping` (`src/dev/stepping.ts:26-51`), so the invariants run on every tick. Each test carries a comment that cites R1, R2 or the decision it enforces. Expected values are worked by hand from the rule above, never from running the code.

`src/game/__tests__/tip.test.ts`:

1. food wholly over the mouth has a share of 1
2. food that does not touch the mouth has a share of 0
3. food that shares only an edge with the mouth has a share of 0
4. a corpse half across the side of the mouth has a share of one half
5. food wider than the mouth has a share of 1 when the whole width of the mouth is under it (28 wide over a mouth 18 wide)
6. food wider than the mouth on one axis only is measured against the least of each axis (a power-up over the start-size grave, 27 by 54)
7. a corpse centred on the field's side edge, with the grave flush to that edge, has a share of 1
8. a power-up centred on the side edge over a grave of size 27 has a share of 1
9. a corpse centred on the field's top edge, with the grave flush to the top, has a share of 1
10. food wholly outside the field has a share of 0, and the answer is finite

`src/game/__tests__/step.test.ts`, in a new block "food goes in when most of it is over the mouth (grave-in-the-ground R1 and R2)":

11. a corpse with a sliver over the rim is not swallowed
12. a corpse with a sliver over the rim still rots away, and the loss is reported (A2)
13. a corpse 8 of its 14 across the rim is swallowed, and one 7 of 14 across is not
14. the growth and the score land on the tick of the tip (R2)
15. a power-up wider than a floor-size grave is swallowed when the mouth's whole width is under it
16. a feast and a fallen rung follow the same rule as a corpse
17. a corpse on the field's side edge is swallowed by a grave flush to that edge
18. food wholly outside the field is never swallowed
19. a corpse that reaches the threshold on its last tick of freshness is swallowed and not taken under
20. the threshold is read off the run's own tuning record: under a record with 0.9, the corpse of test 13 stays out

`src/game/__tests__/offer.test.ts`. One existing test encodes first touch and is replaced by this ruling, which the contract's rule against rewriting a test does not cover, because the ruling changed: `'takes exactly one when the grave covers two, and the other vanishes on the same tick'` (`:359-381`) stages two option bodies that the grave only touches. Replace it with tests 21 and 22, and say so in your note. `'breaks a dead heat on the lower entity id'` (`:383-399`) calls `chooseOfferBody` directly and stays as it is.

21. the grave takes the one option that reaches the threshold, and its siblings vanish on that tick
22. an option the grave only touches is not taken
23. at the size ceiling, a grave centred between two options tips neither, so two can never tip at once

`src/game/__tests__/tuningRecord.test.ts`: the literal row list and its count of 10 (`:126-167`) gain the one row; 24. a threshold of 0 is refused; 25. a threshold above 1 is refused.

`src/dev/readings/__tests__/foodLedger.test.ts` (or where the other readings' tests live; follow the folder's pattern): 26. counts a swallow under its kind; 27. counts food lost off the bottom under its kind; 28. counts food that rotted away under its kind; 29. a run with no food reports zero for every kind and never a missing row.

`src/dev/__tests__/rebatch.test.ts`: 30. a folder of tapes gives the same report the batch that wrote them gave; 31. a tape that does not verify is refused by name.

Two existing tests drive food into the grave through the tick loop without a fixed overlap: `src/game/__tests__/corpses.test.ts:385-476` and `:731-757` (a fallen rung driven in over up to 20 ticks). They should stay green as written. If one goes red, that is a finding about the rule, not a test to edit: stop and report.

## Verification steps (you are the actor for every one)

The coder contract's floor, plus:

1. Parts A and C above, with their two records written.
2. `pnpm --filter hungry-grave test` runs the bot's full stages (`src/dev/__tests__/bot.test.ts`), which play the loop from the first tick to won or lost with the invariants on. Zero faults.
3. A rendered check of the built app through `vite preview` with `playwright-cli`. The replay screen opens a tape from `?tape=`, a URL it fetches (`tapeFromUrl`, `src/app/seedFromUrl.ts:154-162`), at the tick `?at=` names (`atFromUrl`, `:176-183`). Take one tape from the "after" batch. Find by headless stepping one tick where a live corpse lies partly across the rim with a share above 0 and below the threshold, and one tick just before a swallow. Photograph the replay at both. Read each screenshot, and say in your note what lies where against the rim. No screenshot script exists in the repo. If the replay cannot be opened at a tick this way, that is a missing ability: say what is missing and stop, do not skip the check.

Open for the human after this slice (say so in your note): how the 55% feels on real corpses under fire, and whether a very fast swipe under a corpse ever misses.

## Done when

Every planned test is green, every verification step has a result in your note, the pins moved only as this entry says, and the working tree holds the code, the tests, `docs/branch/records/slice-1-note.md`, the new section in `docs/branch/records/before-batch.md` and `docs/branch/records/after-slice-1-batch.md`, uncommitted.
