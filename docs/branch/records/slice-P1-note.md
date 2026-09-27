# Slice P1 coder note

## 1. What changed

- **The field and the run:** `field.ts` (`Field`, `fieldOfHeight`, the two bounds, `SHORTEST_FIELD`, `FIELD_HEIGHT` kept for src/app only), `run.ts` (`fieldHeight`, `run.field`).
- **Reads the run's field:** `grave.ts` (`startingPlace`, and `createGrave`, `moveGrave` and `ageGrave` take the field), `tuning.ts` (`freshnessSecondsFor`), `corpses.ts` (`freshnessPerTick`), `caps.ts` (`transitSeconds`, `worstBossPattern`, the caps), `tip.ts`, `invariants.ts`, `mobs.ts`, `mobFire.ts`, `setPiece.ts`, the three lines, `step.ts`.
- **Comment only:** `witness.ts`, `math.ts`.
- **The tape:** `startingCondition.ts` has the new `fieldHeight` row.
- **Dev tools:** `rigs`, `measure`, `batchReport`, `bot` (`homeOf`), `harnessRun`, `syntheticField`, `digest` (`GOLDEN_1168`), and four readings.
- **Scripts:** `batch.ts` and `record-conditioned.ts` take `field=`. `compare-batches.ts` refuses two different heights.
- **Tests:** 32 new, all 26 planned (test 10 is seven). About 45 test files changed form only.

## 2. Verification results

- **Floor 1:** every new test was red first on its own assertion except tests 1, 5, 12 (the depth half), 18, 25 and 26. Mutations in a scratch copy turned 5, 12, 18 and 25 red. Test 26 checks its own detector. Test 1 pins constants, so no stub could be wrong.
- **Floor 2:** 2696 test names before, 2728 after. Three were renamed: two titles now read in plain words, and "five facts" is now "six".
- **Floor 3:** typecheck exits 0. Tests: `2717 passed | 11 expected fail | 2 todo`. Build: `✓ built in 7.81s` with slice 1's two `(!)`. `pnpm verify` exits 0.
- **Pins:** the probe output is byte-identical to slice A's. `GOLDEN` and every version hold. `GOLDEN_1168` is new: checksum `-1088571029`, graveY 726.875, score 300, corpses 2, skulls 6.
- **Step 3:** 96 files. Under src/app and src/input only slice A's files and the five ruled test edits appear.
- **Step 4:** it printed `conditionNotImplemented`, the roster, and "fieldHeight is a starting condition this build requires and this tape does not name".
- **Step 5:** both 760 tapes match the README tick for tick (23548 and 19991). The h1168 tapes: victory at 23038 and sealed at 16176. All four are in the README.
- **Step 6:** at 1168 and at 1260, 8 of 8 runs verified, all victories, 0 faults, and each header names its height. The comparison refused, naming 1168 and 1260.
- **Test 25:** maxed won at tick 23261, birthright sealed at 26561.

## 3. Where the entry was wrong about the code

- The five src/app and src/input test edits and `runScenario`'s optional height were needed. The main session ruled both (option a). That optional height is the only default beyond the two the entry names.
- Six files outside the entry changed call sites only: `pull.ts`, `stormTargets.ts`, `harnessPolicy.ts`, `readings.ts`, `rebatch.ts` (its refusal now carries the reason), and `frameBudgetCaps.ts` (mirrors caps).
- `scripts/measure.ts` does not print the header, only the roster.

## 4. Decisions made

- **Two heights throw:** `batchReportOf` throws when its runs played two heights, naming both. Both callers guarantee one height, so reaching it is a bug. To reverse, return a refusal arm instead.

## 5. Open items

- **Fence finding:** `harnessStatesNoTarget` flagged a count of distinct heights (`size <= 1`) as a target, so I rewrote the check as "is there a second height".
- **Untested:** `record-conditioned.ts`'s `field=` has no test.

## 6. Stuck

None. Nothing left running.
