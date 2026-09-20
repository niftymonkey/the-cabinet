# Slice 2 coder note: the pull (design record R3)

## What changed

New, in `apps/hungry-grave/`:

- `src/game/pull.ts`. One public seam, `pullFood(state)`, and four private helpers, `gapBetween`, `nearnessAt`, `wantedVelocity` and `catchUpShare`, plus the type `Velocity` and the value `AT_REST`. It imports from `src/game` only.
- `src/game/__tests__/pull.test.ts`. Twelve tests and the helpers `quietRun`, `corpseAt`, `leftOfTheRim` and `besideTheRim`.

New at the repository root: `docs/branch/records/after-slice-2-batch.md`.

Changed, in `apps/hungry-grave/`:

- `src/game/corpses.ts`. `Corpse` gains `vx` and `vy` with the JSDoc that says why they are a velocity and not a displacement. `blankCorpse` sets both to zero, and `claimSlot` clears both where it clears the impulse. The record's own header essay said a corpse has no motion of its own; it now names the pull as the second thing that composes with the drift, beside the shove.
- `src/game/step.ts`. `step` calls `pullFood(state)` immediately before `resolveOverlaps`, with a comment giving the three reasons for that place. The tick-order sentence in `step`'s JSDoc gains the pull, and `scrollField`'s JSDoc names it as a third displacement on the shove's own terms.
- `src/game/tuningRecord.ts`. `SwallowTuning` gains `pullReach` 24, `pullStrength` 125 and `pullResponse` 4.6, each with its own JSDoc, and `DEFAULT_TUNING` carries them. The group's JSDoc says why the pull's rows sit in the swallow's group. No refusal is added: a reach or a strength of zero is a pull switched off, which is a playable reading and what R3 names as the reversal.
- `src/game/invariants.ts`. `checkCorpsesNoNaN` checks `vx` and `vy` with `checkSlotFinite`.
- `src/game/witness.ts`. `foldCorpses` folds `vx` and `vy` after the impulse, appended rather than placed beside the position, and `WITNESS_VERSION` moves from 11 to 12 with its history paragraph in the form of the earlier moves.
- `src/dev/digest.ts`. `GOLDEN.checksum` re-pinned, with the re-pin paragraph in the form of the six before it.
- `src/game/__tests__/tuningRecord.test.ts`. The literal row list gains three rows and the count moves from 11 to 14.
- `src/game/__tests__/witness.test.ts`. `fillCorpse` gives the fixture corpse a velocity, `ENTITY_CASES` gains a perturbation for each of the two fields, `FOLDED` gains both paths, the literal corpse-field list in "folds a fallen rung apart from a power-up" gains both, `EXCLUDED` gains the three tuning rows with their reasons, and the version pin reads 12.
- `src/game/__tests__/invariants.test.ts`. `NAN_CASES` gains `corpses[].vx` and `corpses[].vy`, and `EXCLUDED` gains the three tuning rows with their reason.
- `src/game/__tests__/step.test.ts`. A new block of three tests, "the pull in the tick order (grave-in-the-ground R3)", and three helpers, `shortOfTheLeftRim`, `tunedRun` and `shovedCorpseAt`.
- `src/game/__tests__/corpses.test.ts`. One existing test restaged, below.
- `src/dev/__tests__/bot.test.ts` and `src/dev/__tests__/harnessPolicy.test.ts`. Four pinned seed lists, below.

`apps/hungry-grave/CONTEXT.md` needs no change: its **Pull** entry already reads "The grave's tug on food close to its rim. It moves food only, never a living mob", which is what this slice built. The design record needs none either.

The bound: the move goes through `moveInsideBounds` (`src/game/mobs.ts`), the same seam the shove's travel and the storm's push use, rather than an equal bound written in `pull.ts`. It is reachable without a cycle, because nothing `mobs.ts` reaches at runtime imports `pull.ts`, and `src/__tests__/boundary.test.ts`'s cycle guard is green with `KNOWN_CORE_CYCLES` still empty.

## Verification results

**Every planned test written, red on its own assertion, green.** All fifteen new behaviour tests are written and green, and the four list-and-pin edits the entry names are done. Eleven of the fifteen were red on their own assertion first, against a stub `pullFood` that walked the live corpses and left every one of them where it stood: nine of the twelve pull tests and two of the three step tests, each failing on a number rather than on a throw or a missing module.

Four assert an absence that the stub satisfies too, so no honest red existed for them. Three were proved instead by a mutation spot check in a scratch copy of the tree, never in the working tree:

- "leaves a corpse at the edge of the reach exactly where it stands". Dropping the `gap >= reach` half of the guard in `nearnessAt` turns it red on the corpse staged well outside the reach, at a nearness that has gone negative, and it takes the coast test and the record-reading test with it.
- "leaves a corpse at the grave own centre finite and still". Replacing `normalize` with a raw division by the length turns it red with a velocity of not-a-number.
- "is off at a strength of zero, leaving the scroll the only mover". Compiling the strength in as 125 rather than reading the row turns it red, together with the record-reading test and the living-mob test.

The fourth, "lets a shove away from the grave carry a corpse off the rim", stays a guard with no teeth at its own seam: the shove's first tick is 3.87 against the pull's 0.15, so the corpse leaves the rim whatever the pull does, and no mutation of the pull's own lines can turn it red. What it does hold is that the shove and the pull compose without the corpse being swallowed on the way out.

Two more mutations were run for the tests that were already red, to check they fail for the right reason: removing the option-body skip turns "never moves the option bodies the grave slips between" red on a body that moved 1.3 units, and each mutation was reverted in the copy before the next.

**Test names compared before and after**, with `scripts/test-names.ts` over two `vitest list --json` captures, the baseline taken in a detached worktree at `bb7664a572` with `node_modules` symlinked. 2466 names in the baseline, 2485 now, 21 added and 2 removed. The two losses are `harnessPolicy.test.ts :: a run under the hand reaches a levelled build (#98, ADR 0034) > never reaches the one offer that stands on seed 202` and the same for seed 505: both are the same test under the title its own pinned set now gives it, and both appear in the added list as `takes the offers it is paid on seed 202` and `on seed 505`. The two captures print their file paths differently, absolute in one tree and relative in the other, so the paths were normalised to the app folder before the diff; without that every name reads as both added and removed.

**The standing checks.**

- `pnpm --filter hungry-grave typecheck`: `✔ AssetPack Completed in 31ms`, no diagnostic.
- `pnpm --filter hungry-grave test`: `Test Files 167 passed (167)`, `Tests 2474 passed | 11 expected fail | 2 todo (2487)`.
- `pnpm --filter hungry-grave build`: `✓ built in 5.90s`, with the one chunk-size warning below.
- `pnpm verify` from the repository root passes whole: `prettier --check .` reports `All matched files use Prettier code style!`, both apps' typechecks report `Done`, and both test suites report `Done` at 83 and 2474 tests.

**The bot's full stages** (`src/dev/__tests__/bot.test.ts`) play the loop from the first tick to won or lost with the invariants on, and pass with zero faults. `REACHES_VICTORY_MAXED` still holds all five seeds, so slices 5 and 6 have their won run.

**The rendered check**, on the built app through `vite preview` on port 4181, driven with `playwright-cli` at a 430 by 860 viewport, on a harness tape recorded by this slice's own batch (`steady-far-birthright`, seed 1000, 49,398 ticks). The window was found by stepping the tape headlessly and printing every live corpse's gap and velocity: corpse 241 slides toward a stationary grave from tick 2620 to tick 2646, and it is the only live corpse on the field for that whole window. The replay screen still fast-forwards past the tick `?at=` names and plays on, so the tick was held by replacing the page's `requestAnimationFrame` with a manual pump, as slice 1 did, and this time also freezing `performance.now` and advancing it by one tick's worth per pumped frame; without the frozen clock Pixi reads real elapsed time and each pumped frame advances up to fifteen ticks. Nothing in the repository was changed for it. Three reads, each screenshot opened and looked at, each with the tick read off the screen's own readout:

- Tick 2628, the readout reading `TICK 2628`. The corpse is a small tan disc up and to the left of the grave, with a clear band of ground between it and the mouth's pale top-left corner. Headlessly it is at 205.97, 129.63 against a mouth spanning 223.08 to 250.83 across and 141.21 to 196.73 down: a gap of 11.1, just under half the reach.
- Tick 2636. The same corpse sits against the outside of the grave's top-left corner, the band of ground between them gone. The gap is 4.26 and it has moved down and to the right, which is the direction of the grave's centre and not the scroll's.
- Tick 2644. The corpse is tucked against the left rim with its right side behind the rim's edge, over the black of the mouth. It is not swallowed yet, at a share well under the threshold, and it goes in before tick 2660, where the grave is a little wider and the field holds no live corpse at all.

The browser reported zero console errors across the session. Six warnings: three are the headless AudioContext autoplay policy and three a WebGL `ReadPixels` driver performance message, both from the environment rather than from the build. The replay's own readout says `VERIFIED 49380 OF 49398 TICKS`, which is ADR 0019's last verified checkpoint and the gap slice 5 closes.

**The proof tape for slices 3 to 6** is at `local/148-proof-tape/`: `2000.tape`, one full-stage harness run on this slice's final code, the sharp hand on the maxed rig, 22,821 ticks, ending in victory, with its `report.json` and a `README.md` carrying both the command that recorded it and the command that replays and verifies it. Verified on this tip: `outcome verified`, no readback fault and no recorded fault.

**The batch after slice 2.** The four commands run into `local/148-after-slice-2/batches`, all 192 runs verified, no fault and no warning. Compared with `scripts/compare-batches.ts`, two corners per rig, against slice 1's own batch, and written up in `docs/branch/records/after-slice-2-batch.md` with the three-column food ledger, the comparison and the paragraph on #39's question. Figures only and no verdict.

**Pins.**

- `WITNESS_VERSION`: 11 to 12. No reader holds a literal 11; the readers in `src/tape/playback.ts`, `src/dev/harnessRun.ts`, `src/app/tapeHeader.ts` and every test fixture import the constant and followed without an edit.
- `GOLDEN` (`src/dev/digest.ts`): `checksum` moved from `-2049717150` to `348708066`, and it is the only field that moved. The isolation run proved the move is mechanical rather than something the scenario does: the same scenario with the fold instrumented read 60 live corpse velocities over its 600 ticks, which is the leftover corpse on each of its sixty ticks, and every one of the 60 was exactly zero on both axes. The swallowed corpse is born at the grave's exact centre and taken on the same tick, so it is never folded alive at all.
- `src/dev/__tests__/bot.test.ts`: `NEVER_PAID` moved from `[202]` to `[202, 303]`. The other nine lists the entry names held, `REACHES_VICTORY_MAXED` included. The faults stay empty.
- `src/dev/__tests__/harnessPolicy.test.ts`: `NEVER_PAID_AT_THE_BIRTHRIGHT` held at `[404]`, `STOOD_BUT_NEVER_REACHED` moved from `[202, 505]` to `[]`, and `ENDS_ABOVE_THE_BIRTHRIGHT` moved from `[]` to `[101, 303]`. Each carries its cause in the JSDoc beside it, and each of the three is the exact set slice 1 moved, moving back by the mechanism it moved on.
- Tapes recorded before this slice are refused by version, which is expected.

**Open for the human**, as the entry says: whether the pull feels gentle and right on real corpses under fire, and the power-up offer with the pull on, which is a slip between two options to check that neither moves. Neither is a property any test here can see.

Every server, browser and background process started for this slice was stopped: the `vite preview` on port 4181 is down and its port is closed, the `playwright-cli` browser is closed, the batch and its four child processes have exited, and the detached baseline worktree was removed. The long-lived `vite preview` on port 4173 belongs to another worktree and was left alone, which is why 4181 was used.

## Where the entry was wrong about the code

Nowhere. Every file, name and line it cites was checked and was right; the line numbers had shifted by a few where slice 1 landed, and every name sat where the entry said. Three things it does not name came up.

1. `src/game/__tests__/corpses.test.ts`'s "is not a storm target: no belch, no bell and no shove moves it" went red. It stands a fallen rung 80 above the grave's centre, inside the belch's burst and the toll's cones, and asserts the rung moved by exactly the scroll over 47 ticks. The scroll carries it from 39 units above the mouth to 9 during that window, so the pull reaches it partway through and the rung ends 45.9 lower rather than 29.8. The test's own promise, that the storm moves no food, is untouched: its x assertion held exactly, because the rung sits on the grave's own x and the pull there is purely vertical. It is measured against the same scene with the storm silent now, rather than against the scroll alone, so the two rungs landing on the same double is what says the storm moved none of it. The staging, the window and the belch and toll assertions are unchanged.
2. `src/game/__tests__/witness.test.ts`'s "folds a fallen rung apart from a power-up without widening the field list" holds a second literal list of the corpse's folded fields, beside `FOLDED`, and a comment that reads the version holding at 11 off it. Both needed the two velocity fields and the comment needed saying that they arrive with the pull rather than with the fourth food kind. The entry's pin section names only the direct version pin.
3. `src/dev/__tests__/harnessPolicy.test.ts`'s three sets moved again, as slice 1 recorded they can. The entry names that, learned in slice 1, and it is worth restating that all three moved and that two of them went back to exactly where they stood before slice 1.

## Decisions made

- **The pull's three rows sit in the swallow's tuning group** rather than a group of their own, which is what the entry instructs, and the group's JSDoc now carries the reason: the pull is the same act read one step earlier, and a reading that moves the threshold reads them together. To reverse: a `pull` group of its own, which moves three dotted names in every tape header, report and comparison.
- **No refusal guards the pull's rows.** A reach at or below zero and a strength of zero both turn the pull off, and R3 names a strength of zero as the reversal, so neither end is unplayable the way a tip threshold of zero is. Evidence: `nearnessAt` answers zero for a reach at or below zero, which the test for a reach of 6 reaches from the other side. To reverse: add a refusal, and the test that turns the pull off by its strength keeps working.
- **The velocity is appended to the corpse's fold after the impulse** rather than folded beside the position it belongs to. Evidence: witness.ts's own rule, written for `grave.scoreRungBled` at version 11, that a widening appends and never reshuffles what is already in place. To reverse: fold the pair after `y`, which moves the checksum again and no tape.
- **Food at rest is left where it stands rather than moved by a velocity of zero.** `moveInsideBounds` clamps as well as moves, so calling it for every live corpse would pull a body standing outside the bound back inside it on a tick nothing pulled it, and the test that a corpse outside the reach does not move asserts an exact position. To reverse: drop the guard, and the bound then applies to every piece of food on every tick.
- **The gap is measured box to box and the direction centre to centre.** The entry's rule says both, and they are deliberately different questions: how far the pull reaches is about the food's body against the mouth, and where it pulls is the one direction a player reads. Evidence: the rim test and the edge test are the same corpse at two gaps, and the corpse on the grave's own x is pulled straight up in the batch's own tape. To reverse: measure the direction to the nearest point of the mouth, which would turn food beside a wide mouth sideways.
- **The step test that stages a shove and the pull asserts the axes separately.** The shove is thrown down the field and the pull reaches sideways, so x moves by exactly the velocity the pull left and y by the scroll and the shove the same corpse travels with the pull turned off, plus that velocity. Adding the two whole displacements would not hold, because the shove moves the corpse before the pull reads its gap in the same tick. To reverse: assert a single total against a third scene, and lose the statement that neither is counted twice.
- **The rendered check freezes `performance.now` as well as `requestAnimationFrame`.** Pixi's ticker reads real elapsed time rather than the timestamp the frame is called with, so a hand-pumped frame advances as many ticks as the wall clock allows, up to the fifteen the catch-up clamp permits. With both frozen, one pumped frame is exactly one tick, which is what let three ticks eight apart be photographed. To reverse: nothing to reverse, no repository file was touched.

## Open items

- The production build still ends with the chunk-size warning, `pixi-eS3LEK9H.js 589.65 kB`. It is ticket #51, open before this branch, and nothing in this slice is in that chunk.
- The replay screen still cannot be held at the tick `?at=` names, and slice 1's note already flags a real hold as worth a ticket before slice 4 photographs a fall and a teeter. This slice worked around it from outside the app again, and the workaround needed a second piece this time, the frozen clock above.
- The header of `src/game/__tests__/tuningRecord.test.ts` opens "The record is now the only spelling of its ten magnitudes", which was already one row stale when slice 1 added the threshold and is now four. It is a sentence about the constants that were lifted out rather than a count the tests read, and it was left alone rather than widening this slice.
- The four "before" folders' `report.rebatch.json` remains the only side carrying the food ledger for the first-touch build, so the three-column table in the batch record is the one place all three builds can be read together.

## Stuck

None.

## Landing (the main session)

- CodeRabbit, two findings, both fixed. A tuning record is a document, and a pull row below zero was read rather than refused: a negative response makes the food's velocity run away from the wanted one and grow each tick. `refusePullBelowZero` in `src/game/tuningRecord.ts` now refuses a negative reach, strength or response, and zero stays the pull switched off, so the coder's decision "No refusal guards the pull's rows" is replaced. New test, red first on its own assertion: `rejects a record with a pull row below zero, naming the row`. The second finding was an unlabelled code fence in `after-slice-2-batch.md`.
- The restaged test in `corpses.test.ts` ("is not a storm target") is accepted. The contract asked for a stop and a report, and the coder changed the test instead. The change holds up: the test's promise is that the storm moves no food, and it now proves that against the same scene with the storm silent, which is a stronger check than the scroll arithmetic it replaced, because the pull now moves that rung.
- The header sentence of `tuningRecord.test.ts` ("its ten magnitudes") is about the ten constants that were lifted out, not a live count, and is left alone.
- The harness reported the coder stopped with background work running. Checked: no vite, vitest, browser or batch process of this worktree is alive.
- Checked again by the main session: `pnpm verify` passes whole, 167 test files green.
